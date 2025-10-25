import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertCustomerSchema, insertOrderSchema, insertMeasurementSchema } from "@shared/schema";
import { uploadImageToDrive, addMeasurementToSheet, getMeasurementsFromSheet } from "./google-services";
import multer from "multer";
import { z } from "zod";

const upload = multer({ storage: multer.memoryStorage() });

export async function registerRoutes(app: Express): Promise<Server> {
  
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
