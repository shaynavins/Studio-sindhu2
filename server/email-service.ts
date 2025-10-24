import nodemailer from 'nodemailer';
import type { Customer } from '@shared/schema';

export async function sendNewCustomerNotification(customer: Customer, itemType: string = 'garment') {
  const adminEmail = process.env.ADMIN_EMAIL;
  const emailUser = process.env.EMAIL_USER;
  const emailPassword = process.env.EMAIL_PASSWORD;
  
  if (!adminEmail) {
    console.log('⚠️  ADMIN_EMAIL not configured, skipping email notification');
    return;
  }

  if (!emailUser || !emailPassword) {
    console.log('⚠️  Email credentials (EMAIL_USER/EMAIL_PASSWORD) not configured, skipping email notification');
    return;
  }

  // Create transporter only when credentials are available
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: emailUser,
      pass: emailPassword,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: adminEmail,
    subject: 'New Customer Record Created',
    text: `New customer record: ${itemType} for ${customer.name} (${customer.phone})`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>New Customer Record</h2>
        <p><strong>Item:</strong> ${itemType}</p>
        <p><strong>Customer:</strong> ${customer.name}</p>
        <p><strong>Phone:</strong> ${customer.phone}</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email notification sent to ${adminEmail} for customer ${customer.name}`);
  } catch (error) {
    console.error('Failed to send email notification:', error);
  }
}
