export interface Customer {
  id: string;
  name: string;
  driveFolderId: string | null;
  sheetId: string | null;
  createdAt: Date;
  updatedAt: Date;
  tailorId?: string;
}

export interface InsertCustomer {
  name: string;
  tailorId?: string;
}

export interface User {
  id: string;
  username: string;
  role: string;
}

export interface InsertUser {
  username: string;
  role?: string;
}

export interface Order {
  id: string;
  customerId: string;
  garmentType: string;
  status: string;
  notes?: string | null;
  deliveryDate?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface InsertOrder {
  customerId: string;
  garmentType: string;
  status?: "new" | "measuring" | "cutting" | "stitching" | "ready" | "delivered"; // <- strict union
  notes?: string | null;
  deliveryDate?: Date | null;
}

export interface IStorage {
  // Customers
  getAllCustomers(): Promise<Customer[]>;
  createCustomer(insertCustomer: InsertCustomer): Promise<Customer>;
  getCustomer(id: string): Promise<Customer | undefined>;
  updateCustomer(id: string, updates: Partial<Customer>): Promise<Customer>;

  // Measurements
  addMeasurements(customerId: string, data: Record<string, any>): Promise<void>;

  // Orders
  getOrder(id: string): Promise<Order | undefined>;
  getOrdersByCustomer(customerId: string): Promise<Order[]>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrder(id: string, order: Partial<Order>): Promise<Order>;

  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
}
