import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from current directory
dotenv.config({ path: path.join(__dirname, '.env') });

const testEmail = async () => {
  console.log('--- SMTP Local Test ---');
  console.log('User:', process.env.EMAIL_USER);
  console.log('Host:', process.env.EMAIL_HOST);
  console.log('Port:', process.env.EMAIL_PORT);

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    secure: Number(process.env.EMAIL_PORT) === 465,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('Sending test email...');
    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER, // Send to yourself
      subject: 'Local SMTP Test Success',
      text: 'If you are reading this, your SMTP settings are correct locally!',
      html: '<h1>Local SMTP Test Success</h1><p>Your configuration is working!</p>'
    });

    console.log('Message sent: %s', info.messageId);
    console.log('Test PASSED locally!');
  } catch (error) {
    console.error('Test FAILED locally!');
    console.error('Error:', error.message);
    if (error.code === 'EAUTH') {
      console.error('Hint: Check your App Password or EMAIL_USER.');
    } else if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
      console.error('Hint: Check your Host/Port or network/firewall.');
    }
  }
};

testEmail();
