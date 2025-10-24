import type { Customer, InsertCustomer, InsertOrder, Order, User, InsertUser } from "@shared/schema";
import type { IStorage } from "./storage-types";
import { getGoogleDriveClient, getGoogleSheetsClient } from "./google-clients.js";

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

// Helper: get or create root folder
async function getOrCreateRootFolder(): Promise<string> {
  const drive = await getGoogleDriveClient();
  const folderName = "Customers";

  const res = await drive.files.list({
    q: `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and 'root' in parents`,
    fields: "files(id, name)",
  });

  if (res.data.files?.length) return res.data.files[0].id!;

  const folder = await drive.files.create({
    requestBody: { name: folderName, mimeType: "application/vnd.google-apps.folder" },
    fields: "id",
  });

  return folder.data.id!;
}

// Create customer folder + measurement sheet
async function createCustomerFolderAndSheet(customerName: string) {
  const drive = await getGoogleDriveClient();
  const sheets = await getGoogleSheetsClient();
  const rootFolderId = await getOrCreateRootFolder();

  // Customer folder
  const folder = await drive.files.create({
    requestBody: { name: customerName, parents: [rootFolderId], mimeType: "application/vnd.google-apps.folder" },
    fields: "id",
  });
  const folderId = folder.data.id!;

  // Google Sheet
  const spreadsheet = await sheets.spreadsheets.create({
    requestBody: { properties: { title: `${customerName} Measurements` } },
  });
  const sheetId = spreadsheet.data.spreadsheetId!;

  // Move sheet to folder
  await drive.files.update({ fileId: sheetId, addParents: folderId, removeParents: "root" });

  // Add header row
  await sheets.spreadsheets.values.update({
    spreadsheetId: sheetId,
    range: "Sheet1!A1",
    valueInputOption: "RAW",
    requestBody: {
      values: [
        ["Item", "Garment Type", "Chest", "Waist", "Hips", "Inseam", "Length", "Shoulder", "Sleeves", "Notes"],
      ],
    },
  });

  return { folderId, sheetId };
}

// DriveStorage implementation
export class DriveStorage implements IStorage {
  private rootFolderId: string | null = null;

  private async getRootFolderId() {
    if (!this.rootFolderId) this.rootFolderId = await getOrCreateRootFolder();
    return this.rootFolderId;
  }

  // Customers
  async getAllCustomers(): Promise<Customer[]> {
    const drive = await getGoogleDriveClient();
    const rootId = await this.getRootFolderId();

    const res = await drive.files.list({
      q: `'${rootId}' in parents and mimeType='application/vnd.google-apps.folder'`,
      fields: "files(id, name)",
    });

    // For each customer folder, find the measurement sheet
    const customers = await Promise.all((res.data.files || []).map(async f => {
      // Find the sheet in this folder
      const sheetRes = await drive.files.list({
        q: `'${f.id}' in parents and mimeType='application/vnd.google-apps.spreadsheet'`,
        fields: "files(id)",
      });
      
      const sheetId = sheetRes.data.files?.[0]?.id || null;

      return {
        id: f.id!,
        name: f.name!,
        driveFolderId: f.id!,
        sheetId,
        createdAt: new Date(),
        updatedAt: new Date(),
        tailorId: "",
        phone: "",
        email: null,
        address: null,
      };
    }));

    return customers;
  }

  async createCustomer(insertCustomer: InsertCustomer): Promise<Customer> {
    const { folderId, sheetId } = await createCustomerFolderAndSheet(insertCustomer.name);

    return {
      id: folderId,
      name: insertCustomer.name,
      driveFolderId: folderId,
      sheetId,
      createdAt: new Date(),
      updatedAt: new Date(),
      tailorId: insertCustomer.tailorId || "",
      phone: insertCustomer.phone || "",
      email: insertCustomer.email ?? null,
      address: insertCustomer.address ?? null,
    };
  }

  async getCustomer(id: string): Promise<Customer | undefined> {
    const customers = await this.getAllCustomers();
    return customers.find(c => c.id === id);
  }

  async updateCustomer(id: string, updates: Partial<Customer>): Promise<Customer> {
    const drive = await getGoogleDriveClient();
    const customer = await this.getCustomer(id);
    if (!customer) throw new Error("Customer not found");

    if (updates.name && updates.name !== customer.name) {
      await drive.files.update({ fileId: customer.driveFolderId!, requestBody: { name: updates.name } });
    }

    return { ...customer, ...updates, updatedAt: new Date() };
  }

  // Measurements
  async addMeasurements(customerId: string, data: MeasurementData) {
    const customer = await this.getCustomer(customerId);
    if (!customer || !customer.sheetId) throw new Error("Customer or sheet not found");

    const sheets = await getGoogleSheetsClient();
    await sheets.spreadsheets.values.append({
      spreadsheetId: customer.sheetId,
      range: "Sheet1!A2",
      valueInputOption: "RAW",
      requestBody: {
        values: [[
          data.item || "",
          data.garmentType || "",
          data.chest ?? "",
          data.waist ?? "",
          data.hips ?? "",
          data.inseam ?? "",
          data.length ?? "",
          data.shoulder ?? "",
          data.sleeves ?? "",
          data.notes ?? "",
        ]],
      },
    });
  }

  // Orders
  async getOrder(_id: string): Promise<Order | undefined> { return undefined; }
  async getOrdersByCustomer(_customerId: string): Promise<Order[]> { return []; }

  async createOrder(order: InsertOrder): Promise<Order> {
    return {
      ...order as Omit<Order, "id" | "createdAt" | "updatedAt">,
      id: "mock-" + Math.random().toString(36).substring(7),
      createdAt: new Date(),
      updatedAt: new Date(),
      status: order.status || "new",
      notes: order.notes ?? null,
      deliveryDate: order.deliveryDate ?? null,
    };
  }

  async updateOrder(_id: string, _order: Partial<Order>): Promise<Order> { throw new Error("Not implemented"); }

  // Users
  async getUser(_id: string): Promise<User | undefined> { return undefined; }
  async getUserByUsername(_username: string): Promise<User | undefined> { return undefined; }
  async createUser(user: InsertUser): Promise<User> { return user as User; }
}

// Singleton instance
export const storage = new DriveStorage();
