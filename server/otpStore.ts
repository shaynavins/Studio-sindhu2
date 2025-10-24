interface OTPRecord {
  otp: string;
  expiresAt: number;
  createdAt: number;
}

class OTPStore {
  private store: Map<string, OTPRecord> = new Map();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Clean up expired OTPs every minute
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60 * 1000);
  }

  // Store OTP for a phone number
  set(phone: string, otp: string, expiresInMs: number = 10 * 60 * 1000): void {
    const now = Date.now();
    this.store.set(phone, {
      otp,
      expiresAt: now + expiresInMs,
      createdAt: now,
    });
  }

  // Verify and retrieve OTP
  verify(phone: string, otp: string): boolean {
    const record = this.store.get(phone);
    if (!record) {
      return false;
    }

    // Check if expired
    if (Date.now() > record.expiresAt) {
      this.store.delete(phone);
      return false;
    }

    // Check if OTP matches
    if (record.otp !== otp) {
      return false;
    }

    // Valid OTP - delete it after successful verification
    this.store.delete(phone);
    return true;
  }

  // Delete OTP for a phone number
  delete(phone: string): void {
    this.store.delete(phone);
  }

  // Clean up expired OTPs
  private cleanup(): void {
    const now = Date.now();
    for (const [phone, record] of Array.from(this.store.entries())) {
      if (now > record.expiresAt) {
        this.store.delete(phone);
      }
    }
  }

  // Get store size (for debugging)
  size(): number {
    return this.store.size;
  }

  // Stop cleanup interval (for graceful shutdown)
  stop(): void {
    clearInterval(this.cleanupInterval);
  }
}

export const otpStore = new OTPStore();
