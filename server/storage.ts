import { type User, type InsertUser, type Customer, type InsertCustomer, type Order, type InsertOrder, type Measurement, type InsertMeasurement } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getCustomer(id: string): Promise<Customer | undefined>;
  getCustomerByPhone(phone: string): Promise<Customer | undefined>;
  getAllCustomers(tailorId?: string): Promise<Customer[]>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  updateCustomer(id: string, customer: Partial<Customer>): Promise<Customer>;
  
  getOrder(id: string): Promise<Order | undefined>;
  getOrdersByCustomer(customerId: string): Promise<Order[]>;
  getOrdersByPhone(phone: string): Promise<Order[]>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrder(id: string, order: Partial<Order>): Promise<Order>;
  
  getMeasurement(id: string): Promise<Measurement | undefined>;
  getMeasurementsByOrder(orderId: string): Promise<Measurement[]>;
  getMeasurementsByPhone(phone: string): Promise<Measurement[]>;
  createMeasurement(measurement: InsertMeasurement): Promise<Measurement>;
  addMeasurements(customerId: string, data: any): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private customers: Map<string, Customer>;
  private orders: Map<string, Order>;
  private measurements: Map<string, Measurement>;

  constructor() {
    this.users = new Map();
    this.customers = new Map();
    this.orders = new Map();
    this.measurements = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id,
      role: insertUser.role || "tailor"
    };
    this.users.set(id, user);
    return user;
  }

  async getCustomer(id: string): Promise<Customer | undefined> {
    return this.customers.get(id);
  }

  async getCustomerByPhone(phone: string): Promise<Customer | undefined> {
    return Array.from(this.customers.values()).find(c => c.phone === phone);
  }

  async getAllCustomers(tailorId?: string): Promise<Customer[]> {
    const customers = Array.from(this.customers.values());
    if (tailorId) {
      return customers.filter(c => c.tailorId === tailorId);
    }
    return customers;
  }

  async createCustomer(insertCustomer: InsertCustomer): Promise<Customer> {
    const id = randomUUID();
    const now = new Date();
    const customer: Customer = {
      ...insertCustomer,
      id,
      driveFolderId: null,
      sheetId: null,
      createdAt: now,
      updatedAt: now,
    };
    this.customers.set(id, customer);
    return customer;
  }

  async updateCustomer(id: string, updates: Partial<Customer>): Promise<Customer> {
    const customer = this.customers.get(id);
    if (!customer) {
      throw new Error('Customer not found');
    }
    const updated = {
      ...customer,
      ...updates,
      updatedAt: new Date(),
    };
    this.customers.set(id, updated);
    return updated;
  }

  async getOrder(id: string): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  async getOrdersByCustomer(customerId: string): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(
      (order) => order.customerId === customerId
    );
  }

  async getOrdersByPhone(phone: string): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(
      (order) => order.customerPhone === phone
    );
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const id = randomUUID();
    const now = new Date();
    const order: Order = {
      ...insertOrder,
      id,
      createdAt: now,
      updatedAt: now,
    };
    this.orders.set(id, order);
    return order;
  }

  async updateOrder(id: string, updates: Partial<Order>): Promise<Order> {
    const order = this.orders.get(id);
    if (!order) {
      throw new Error('Order not found');
    }
    const updated = {
      ...order,
      ...updates,
      updatedAt: new Date(),
    };
    this.orders.set(id, updated);
    return updated;
  }

  async getMeasurement(id: string): Promise<Measurement | undefined> {
    return this.measurements.get(id);
  }

  async getMeasurementsByOrder(orderId: string): Promise<Measurement[]> {
    return Array.from(this.measurements.values()).filter(
      (m) => m.orderId === orderId
    );
  }

  async getMeasurementsByPhone(phone: string): Promise<Measurement[]> {
    const orders = await this.getOrdersByPhone(phone);
    const orderIds = orders.map(o => o.id);
    return Array.from(this.measurements.values()).filter(
      (m) => orderIds.includes(m.orderId)
    );
  }

  async createMeasurement(insertMeasurement: InsertMeasurement): Promise<Measurement> {
    const id = randomUUID();
    const now = new Date();
    const measurement: Measurement = {
      ...insertMeasurement,
      id,
      createdAt: now,
    };
    this.measurements.set(id, measurement);
    return measurement;
  }

  async addMeasurements(_customerId: string, _data: any): Promise<void> {
    // Legacy method for compatibility
  }
}

import { DriveStorage } from "./drive-storage.js";

export const storage = new DriveStorage();
