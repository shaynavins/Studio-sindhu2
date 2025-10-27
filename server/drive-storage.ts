import type { Customer, InsertCustomer, InsertOrder, Order, User, InsertUser, Measurement, InsertMeasurement } from "@shared/schema";
import type { IStorage } from "./storage";
import { getGoogleDriveClient, getGoogleSheetsClient } from "./google-clients.js";
import { createCustomerFolder, findCustomerFolder, createMeasurementSheet, findMeasurementSheet, addMeasurementToSheet, getMeasurementsFromSheet, uploadImageToDrive } from "./google-services.js";
import { randomUUID } from "crypto";

export type MeasurementData = {
  item?: string;
  garmentType: string;
  chest?: string | null;
  waist?: string | null;
  hips?: string | null;
  shoulder?: string | null;
  sleeves?: string | null;
  length?: string | null;
  inseam?: string | null;
  notes?: string | null;
};


// DriveStorage implementation
export class DriveStorage implements IStorage {
  private orderCounter: number = 1;

  // Customers
  async getAllCustomers(): Promise<Customer[]> {
    const drive = await getGoogleDriveClient();

    const res = await drive.files.list({
      q: `mimeType='application/vnd.google-apps.folder' and name contains '-'`,
      fields: "files(id, name)",
    });

    const customers = await Promise.all((res.data.files || []).map(async f => {
      const sheetId = await findMeasurementSheet(f.id!);
      const nameParts = f.name!.split(' - ');
      const phone = nameParts[0];
      const name = nameParts.slice(1).join(' - ');

      return {
        id: f.id!,
        name: name || 'Unknown',
        phone: phone,
        driveFolderId: f.id!,
        sheetId,
        createdAt: new Date(),
        updatedAt: new Date(),
        tailorId: "",
        email: null,
        address: null,
      };
    }));

    return customers;
  }

  async createCustomer(insertCustomer: InsertCustomer): Promise<Customer> {
    if (!insertCustomer.phone) {
      throw new Error('Phone number is required');
    }

    // Check if customer already exists
    let folderId = await findCustomerFolder(insertCustomer.phone);
    let sheetId: string | null = null;

    if (folderId) {
      // Customer exists, find or create their sheet
      sheetId = await findMeasurementSheet(folderId);
      if (!sheetId) {
        sheetId = await createMeasurementSheet(insertCustomer.phone, insertCustomer.name, folderId);
      }
    } else {
      // Create new customer folder
      folderId = await createCustomerFolder(insertCustomer.phone, insertCustomer.name);
      sheetId = await createMeasurementSheet(insertCustomer.phone, insertCustomer.name, folderId);
    }

    return {
      id: folderId,
      name: insertCustomer.name,
      driveFolderId: folderId,
      sheetId,
      createdAt: new Date(),
      updatedAt: new Date(),
      tailorId: insertCustomer.tailorId || "",
      phone: insertCustomer.phone,
      email: insertCustomer.email ?? null,
      address: insertCustomer.address ?? null,
    };
  }

  async getCustomer(id: string): Promise<Customer | undefined> {
    const customers = await this.getAllCustomers();
    return customers.find(c => c.id === id);
  }

  async getCustomerByPhone(phone: string): Promise<Customer | undefined> {
    const customers = await this.getAllCustomers();
    return customers.find(c => c.phone === phone);
  }

  async updateCustomer(id: string, updates: Partial<Customer>): Promise<Customer> {
    const drive = await getGoogleDriveClient();
    const customer = await this.getCustomer(id);
    if (!customer) throw new Error("Customer not found");

    if (updates.name && updates.name !== customer.name) {
      const newName = `${customer.phone} - ${updates.name}`;
      await drive.files.update({ fileId: customer.driveFolderId!, requestBody: { name: newName } });
    }

    return { ...customer, ...updates, updatedAt: new Date() };
  }

  // Measurements
  async addMeasurements(customerId: string, data: MeasurementData) {
    const customer = await this.getCustomer(customerId);
    if (!customer || !customer.sheetId) throw new Error("Customer or sheet not found");

    const orderNumber = `ORD-${Date.now()}`;
    await addMeasurementToSheet(customer.sheetId, orderNumber, data);
  }

  // Orders
  async getOrder(_id: string): Promise<Order | undefined> { 
    return undefined; 
  }
  
  async getOrdersByCustomer(customerId: string): Promise<Order[]> {
    const customer = await this.getCustomer(customerId);
    if (!customer || !customer.sheetId) return [];

    const measurements = await getMeasurementsFromSheet(customer.sheetId);
    return measurements.map(m => ({
      id: randomUUID(),
      orderNumber: m.orderNumber,
      customerId: customer.id,
      customerPhone: customer.phone,
      garmentType: m.garmentType,
      status: (m.status || 'new') as 'new' | 'measuring' | 'cutting' | 'stitching' | 'ready' | 'delivered',
      notes: m.notes || null,
      deliveryDate: m.deliveryDate ? new Date(m.deliveryDate) : null,
      measurementSetId: null,
      createdAt: m.date ? new Date(m.date) : new Date(),
      updatedAt: new Date(),
    }));
  }

  async getOrdersByPhone(phone: string): Promise<Order[]> {
    const customer = await this.getCustomerByPhone(phone);
    if (!customer || !customer.sheetId) return [];

    const measurements = await getMeasurementsFromSheet(customer.sheetId);
    return measurements.map(m => ({
      id: randomUUID(),
      orderNumber: m.orderNumber,
      customerId: customer.id,
      customerPhone: phone,
      garmentType: m.garmentType,
      status: (m.status || 'new') as 'new' | 'measuring' | 'cutting' | 'stitching' | 'ready' | 'delivered',
      notes: m.notes || null,
      deliveryDate: m.deliveryDate ? new Date(m.deliveryDate) : null,
      measurementSetId: null,
      createdAt: m.date ? new Date(m.date) : new Date(),
      updatedAt: new Date(),
    }));
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const orderNumber = order.orderNumber || `ORD-${Date.now()}`;
    return {
      ...order,
      id: randomUUID(),
      orderNumber,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: order.status || "new",
      notes: order.notes ?? null,
      deliveryDate: order.deliveryDate ?? null,
      measurementSetId: order.measurementSetId ?? null,
    };
  }

  async updateOrder(_id: string, _order: Partial<Order>): Promise<Order> { 
    throw new Error("Not implemented"); 
  }

  // Measurement methods
  async getMeasurement(_id: string): Promise<Measurement | undefined> {
    return undefined;
  }

  async getMeasurementsByOrder(_orderId: string): Promise<Measurement[]> {
    return [];
  }

  async getMeasurementsByPhone(phone: string): Promise<Measurement[]> {
    const customer = await this.getCustomerByPhone(phone);
    if (!customer || !customer.sheetId) return [];

    const measurements = await getMeasurementsFromSheet(customer.sheetId);
    return measurements.map(m => ({
      id: randomUUID(),
      orderId: m.orderNumber,
      garmentType: m.garmentType,
      chest: m.chest || null,
      waist: m.waist || null,
      hips: m.hips || null,
      shoulder: m.shoulder || null,
      sleeves: m.sleeves || null,
      length: m.length || null,
      inseam: m.inseam || null,
      notes: m.notes || null,
      sheetRowId: null,
      createdAt: new Date(),
    }));
  }

  async getMeasurementsByCustomer(customerId: string): Promise<Measurement[]> {
    const customer = await this.getCustomer(customerId);
    if (!customer || !customer.sheetId) return [];

    const measurements = await getMeasurementsFromSheet(customer.sheetId);
    return measurements.map(m => ({
      id: randomUUID(),
      orderId: m.orderNumber,
      garmentType: m.garmentType,
      chest: m.chest || null,
      waist: m.waist || null,
      hips: m.hips || null,
      shoulder: m.shoulder || null,
      sleeves: m.sleeves || null,
      length: m.length || null,
      inseam: m.inseam || null,
      notes: m.notes || null,
      sheetRowId: null,
      createdAt: new Date(),
    }));
  }

  async createMeasurement(measurement: InsertMeasurement): Promise<Measurement> {
    return {
      ...measurement,
      id: randomUUID(),
      chest: measurement.chest ?? null,
      waist: measurement.waist ?? null,
      hips: measurement.hips ?? null,
      shoulder: measurement.shoulder ?? null,
      sleeves: measurement.sleeves ?? null,
      length: measurement.length ?? null,
      inseam: measurement.inseam ?? null,
      notes: measurement.notes ?? null,
      sheetRowId: measurement.sheetRowId ?? null,
      createdAt: new Date(),
    };
  }

  // Users
  async getUser(_id: string): Promise<User | undefined> { return undefined; }
  async getUserByUsername(_username: string): Promise<User | undefined> { return undefined; }
  async createUser(user: InsertUser): Promise<User> { return user as User; }
}

// Singleton instance
export const storage = new DriveStorage();
