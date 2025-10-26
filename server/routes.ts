import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertCustomerSchema, insertOrderSchema, insertMeasurementSchema, oauthTokens } from "@shared/schema";
import { uploadImageToDrive, addMeasurementToSheet, getMeasurementsFromSheet } from "./google-services";
import multer from "multer";
import { z } from "zod";
import { google } from "googleapis";
import { db } from "./db.js";
import { eq } from "drizzle-orm";

const upload = multer({ storage: multer.memoryStorage() });

export async function registerRoutes(app: Express): Promise<Server> {
  
  // OAuth initiation endpoint
  app.get("/api/auth/google", (req, res) => {
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET || !process.env.CALLBACK_URL) {
      return res.status(500).json({ error: "OAuth credentials not configured" });
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.CALLBACK_URL
    );

    const scopes = [
      'https://www.googleapis.com/auth/drive',
      'https://www.googleapis.com/auth/spreadsheets',
    ];

    const url = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent', // Force consent to get refresh token
    });

    res.redirect(url);
  });

  // OAuth callback endpoint
  app.get("/oauth2callback", async (req, res) => {
    const code = req.query.code as string;

    if (!code) {
      return res.status(400).send("No authorization code provided");
    }

    try {
      console.log('OAuth callback - Starting token exchange...');
      
      const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.CALLBACK_URL
      );

      const { tokens } = await oauth2Client.getToken(code);
      console.log('OAuth callback - Received tokens from Google:', {
        hasAccessToken: !!tokens.access_token,
        hasRefreshToken: !!tokens.refresh_token,
        expiryDate: tokens.expiry_date,
      });

      // Store tokens in database
      const tokenData = {
        service: 'google-drive',
        accessToken: tokens.access_token!,
        refreshToken: tokens.refresh_token || null,
        expiryDate: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
        scope: tokens.scope || null,
        tokenType: tokens.token_type || 'Bearer',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Check if token exists, update or insert
      const [existingToken] = await db
        .select()
        .from(oauthTokens)
        .where(eq(oauthTokens.service, 'google-drive'))
        .limit(1);

      if (existingToken) {
        console.log('OAuth callback - Updating existing token...');
        await db
          .update(oauthTokens)
          .set({ ...tokenData, updatedAt: new Date() })
          .where(eq(oauthTokens.id, existingToken.id));
        console.log('OAuth callback - Token updated successfully');
      } else {
        console.log('OAuth callback - Inserting new token...');
        await db.insert(oauthTokens).values(tokenData);
        console.log('OAuth callback - Token inserted successfully');
      }

      res.send(`
        <html>
          <head><title>Authorization Success</title></head>
          <body>
            <h1>✅ Google Drive Authorization Successful!</h1>
            <p>You can close this window and return to your application.</p>
            <script>setTimeout(() => window.close(), 3000);</script>
          </body>
        </html>
      `);
    } catch (error: any) {
      console.error('Error during OAuth callback:', error);
      res.status(500).send(`Authorization failed: ${error.message}`);
    }
  });

  // Check OAuth status endpoint
  app.get("/api/auth/status", async (req, res) => {
    try {
      const [token] = await db
        .select()
        .from(oauthTokens)
        .where(eq(oauthTokens.service, 'google-drive'))
        .limit(1);

      if (!token) {
        return res.json({ connected: false });
      }

      const isExpired = token.expiryDate && new Date(token.expiryDate).getTime() < Date.now();
      res.json({
        connected: true,
        expiresAt: token.expiryDate,
        isExpired,
        hasRefreshToken: !!token.refreshToken,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  app.get("/api/customers", async (req, res) => {
    try {
      const tailorId = req.query.tailorId as string | undefined;
      const customers = await storage.getAllCustomers(tailorId);
      res.json(customers);
    } catch (error: any) {
      console.error('Error fetching customers:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/customers/:id", async (req, res) => {
    try {
      const customer = await storage.getCustomer(req.params.id);
      if (!customer) {
        return res.status(404).json({ error: "Customer not found" });
      }
      res.json(customer);
    } catch (error: any) {
      console.error('Error fetching customer:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/customers/phone/:phone", async (req, res) => {
    try {
      const customer = await storage.getCustomerByPhone(req.params.phone);
      if (!customer) {
        return res.status(404).json({ error: "Customer not found" });
      }
      res.json(customer);
    } catch (error: any) {
      console.error('Error fetching customer by phone:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/customers", upload.array('images', 10), async (req, res) => {
    try {
      const customerData = insertCustomerSchema.parse(req.body);
      
      const customer = await storage.createCustomer(customerData);
      
      try {
        const files = req.files as Express.Multer.File[];
        if (files && files.length > 0 && customer.driveFolderId) {
          for (const file of files) {
            await uploadImageToDrive(
              customer.driveFolderId,
              file.originalname,
              file.mimetype,
              file.buffer
            );
          }
        }
        
        res.status(201).json(customer);
      } catch (googleError: any) {
        console.error('Google services error:', googleError);
        res.status(201).json({
          ...customer,
          warning: 'Customer created but image upload failed: ' + googleError.message
        });
      }
    } catch (error: any) {
      console.error('Error creating customer:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/customers/:id/measurements", async (req, res) => {
    try {
      const customer = await storage.getCustomer(req.params.id);
      if (!customer) {
        return res.status(404).json({ error: "Customer not found" });
      }

      if (!customer.sheetId) {
        return res.status(400).json({ error: "Customer does not have a measurement sheet" });
      }

      await storage.addMeasurements(customer.id, req.body);
      
      const orderNumber = `ORD-${Date.now()}`;
      
      const orderData = insertOrderSchema.parse({
        orderNumber,
        customerId: customer.id,
        customerPhone: customer.phone,
        garmentType: req.body.garmentType,
        status: "measuring",
        notes: req.body.notes || null,
        deliveryDate: req.body.deliveryDate ? new Date(req.body.deliveryDate) : null
      });
      
      const order = await storage.createOrder(orderData);
      
      res.status(201).json({ message: "Measurements saved successfully", order });
    } catch (error: any) {
      console.error('Error saving measurements:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/orders", async (req, res) => {
    try {
      const customerId = req.query.customerId as string | undefined;
      const phone = req.query.phone as string | undefined;
      
      if (phone) {
        const orders = await storage.getOrdersByPhone(phone);
        res.json(orders);
      } else if (customerId) {
        const orders = await storage.getOrdersByCustomer(customerId);
        res.json(orders);
      } else {
        res.status(400).json({ error: "customerId or phone query parameter required" });
      }
    } catch (error: any) {
      console.error('Error fetching orders:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/orders", async (req, res) => {
    try {
      const { customerPhone, measurements, ...orderData } = req.body;
      
      if (!customerPhone) {
        return res.status(400).json({ error: "Customer phone number is required" });
      }

      // Get or create customer
      let customer = await storage.getCustomerByPhone(customerPhone);
      if (!customer) {
        return res.status(404).json({ error: "Customer not found. Please create customer first." });
      }

      // Generate order number
      const orderNumber = `ORD-${Date.now()}`;

      // Create order
      const order = await storage.createOrder({
        ...orderData,
        orderNumber,
        customerId: customer.id,
        customerPhone,
      });

      // If measurements provided, add them to sheet
      if (measurements && customer.sheetId) {
        await addMeasurementToSheet(customer.sheetId, orderNumber, {
          ...measurements,
          status: order.status,
        });

        // Create measurement record
        await storage.createMeasurement({
          orderId: order.id,
          ...measurements,
        });
      }

      res.status(201).json(order);
    } catch (error: any) {
      console.error('Error creating order:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/orders/:id", async (req, res) => {
    try {
      const order = await storage.updateOrder(req.params.id, req.body);
      res.json(order);
    } catch (error: any) {
      console.error('Error updating order:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/measurements", async (req, res) => {
    try {
      const phone = req.query.phone as string | undefined;
      const orderId = req.query.orderId as string | undefined;
      
      if (phone) {
        const measurements = await storage.getMeasurementsByPhone(phone);
        res.json(measurements);
      } else if (orderId) {
        const measurements = await storage.getMeasurementsByOrder(orderId);
        res.json(measurements);
      } else {
        res.status(400).json({ error: "phone or orderId query parameter required" });
      }
    } catch (error: any) {
      console.error('Error fetching measurements:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/measurements/history/:phone", async (req, res) => {
    try {
      const phone = req.params.phone;
      const customer = await storage.getCustomerByPhone(phone);
      
      if (!customer || !customer.sheetId) {
        return res.status(404).json({ error: "Customer not found or no measurements available" });
      }

      const measurements = await getMeasurementsFromSheet(customer.sheetId);
      res.json(measurements);
    } catch (error: any) {
      console.error('Error fetching measurement history:', error);
      res.status(500).json({ error: error.message });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
