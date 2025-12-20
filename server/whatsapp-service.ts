/**
 * WhatsApp service using Twilio API
 * Uses Twilio's WhatsApp sandbox for free tier messaging
 */

import twilio from 'twilio';

export interface WhatsAppMessage {
  phone: string;
  message: string;
}

/**
 * Get Twilio client instance
 */
function getTwilioClient() {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  
  if (!accountSid || !authToken) {
    throw new Error('Twilio credentials not configured. Please set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN in .env');
  }
  
  return twilio(accountSid, authToken);
}

/**
 * Send a WhatsApp message via Twilio
 * @param toPhone - Recipient phone number in E.164 format (e.g., +918867636725)
 * @param message - The message text to send
 * @returns Promise with message SID
 */
export async function sendWhatsAppMessage(toPhone: string, message: string): Promise<string> {
  try {
    const client = getTwilioClient();
    const fromPhone = process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886'; // Default Twilio sandbox
    
    // Ensure phone number has whatsapp: prefix
    const toNumber = toPhone.startsWith('whatsapp:') ? toPhone : `whatsapp:${toPhone}`;
    
    const messageResponse = await client.messages.create({
      body: message,
      from: fromPhone,
      to: toNumber
    });
    
    console.log(`WhatsApp message sent successfully. SID: ${messageResponse.sid}`);
    return messageResponse.sid;
  } catch (error: any) {
    console.error('Error sending WhatsApp message:', error);
    throw new Error(`Failed to send WhatsApp message: ${error.message}`);
  }
}

/**
 * Send a WhatsApp message to the workshop
 * @param message - The message text to send
 * @returns Promise with message SID
 */
export async function sendWorkshopWhatsAppMessage(message: string): Promise<string> {
  const workshopPhone = '+918867636725'; // Indian format with country code
  return sendWhatsAppMessage(workshopPhone, message);
}

/**
 * Create a message for workshop order notification
 * @param customerName - Name of the customer
 * @param orderNumber - Order number
 * @param garmentType - Type of garment
 * @returns Formatted message
 */
export function createWorkshopOrderMessage(
  customerName: string,
  orderNumber: string,
  garmentType: string
): string {
  return `New order ready to send to workshop:

Customer: ${customerName}
Order #: ${orderNumber}
Garment: ${garmentType}

Please process this order.`;
}

/**
 * Generate a WhatsApp URL with a pre-filled message (fallback method)
 * @param phone - Phone number in international format (e.g., 918867636725)
 * @param message - The message text to pre-fill
 * @returns WhatsApp URL
 */
export function generateWhatsAppUrl(phone: string, message: string): string {
  // Remove any non-numeric characters except the plus sign
  const cleanPhone = phone.replace(/[^\d+]/g, '');
  
  // Encode the message for URL
  const encodedMessage = encodeURIComponent(message);
  
  // Generate wa.me URL
  return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
}

/**
 * Generate a WhatsApp URL for the workshop phone number (fallback method)
 * @param message - The message text to send
 * @returns WhatsApp URL
 */
export function generateWorkshopWhatsAppUrl(message: string): string {
  const workshopPhone = '918867636725';
  return generateWhatsAppUrl(workshopPhone, message);
}
