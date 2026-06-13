import nodemailer from "nodemailer";
import createLogger from "./logger.js";
import { recordEmailLog } from "./activityLoggers.js";

const emailLogger = createLogger("email");

const emailHost = process.env.EMAIL_HOST?.trim();
const emailPort = Number(process.env.EMAIL_PORT || 587);
const emailUser = process.env.EMAIL_USER?.trim();
const emailPass = process.env.EMAIL_PASS;
const emailSecure = process.env.EMAIL_SECURE
  ? process.env.EMAIL_SECURE === "true"
  : emailPort === 465;

const hasEmailConfig = Boolean(emailHost && emailPort && emailUser && emailPass);

const transporter = hasEmailConfig
  ? nodemailer.createTransport({
      host: emailHost,
      port: emailPort,
      secure: emailSecure,
      auth: {
        user: emailUser,
        pass: emailPass
      },
      tls: {
        rejectUnauthorized: false
      }
    })
  : null;

if (transporter) {
  transporter.verify((error) => {
    if (error) {
      emailLogger.error("[mailer] Shared email transporter verification failed", {
        error: error.message,
        stack: error.stack
      });
    } else {
      emailLogger.info("[mailer] Shared email transporter ready", {
        host: emailHost,
        port: emailPort
      });
    }
  });
} else {
  emailLogger.warn("[mailer] Shared email transporter not configured due to missing credentials.");
}

/**
 * Sends a stylized automated thank-you email to clients when they submit a contact message.
 * @param {string} clientName - Name of the client
 * @param {string} clientEmail - Email address of the client
 * @param {string} originalSubject - Subject of their inquiry
 * @param {string} originalMessage - Message they wrote
 * @param {string} requestId - Request log identifier for auditing
 */
export const sendThankYouEmail = async (clientName, clientEmail, originalSubject, originalMessage, requestId = null) => {
  if (!transporter) {
    emailLogger.warn("[sendThankYouEmail] Cannot send email; transporter is not configured.", { clientEmail });
    return false;
  }

  const subject = `Thank you for contacting Council of Valuers (COV)`;
  const fromAddress = process.env.EMAIL_FROM || emailUser;

  const htmlContent = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 0; background-color: #f8fafc; color: #1e293b;">
      <div style="background: linear-gradient(135deg, #002b5b, #004080); padding: 32px 24px; text-align: center; border-radius: 12px 12px 0 0;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: 0.5px;">Council of Valuers</h1>
        <p style="color: #7dd3fc; margin: 8px 0 0 0; font-size: 14px; font-weight: 600;">Message Received Confirmation</p>
      </div>
      
      <div style="background-color: #ffffff; padding: 32px 24px; border-radius: 0 0 12px 12px; border: 1px solid #e2e8f0; border-top: none; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
        <p style="font-size: 16px; line-height: 1.6; margin-top: 0;">Dear <strong>${clientName}</strong>,</p>
        
        <p style="font-size: 15px; line-height: 1.6; color: #475569;">
          Thank you for reaching out to the <strong>Council of Valuers (COV) India Forum</strong>. We have successfully received your inquiry and a ticket has been generated in our client relationship queue.
        </p>

        <p style="font-size: 15px; line-height: 1.6; color: #475569;">
          Our administration panel has logged this request, and a representative will review your message shortly to follow up with you.
        </p>
        
        <div style="background-color: #f1f5f9; border-left: 4px solid #00a6a6; padding: 16px; margin: 24px 0; border-radius: 0 8px 8px 0;">
          <h3 style="margin: 0 0 8px 0; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; color: #475569;">Your Inquiry Summary:</h3>
          <p style="margin: 0 0 6px 0; font-size: 14px; color: #1e293b;"><strong>Subject:</strong> ${originalSubject || "General Inquiry"}</p>
          <p style="margin: 0; font-size: 14px; color: #64748b; font-style: italic;">
            "${originalMessage.length > 150 ? originalMessage.slice(0, 150) + "..." : originalMessage}"
          </p>
        </div>

        <p style="font-size: 15px; line-height: 1.6; color: #475569; margin-bottom: 24px;">
          If you have additional details to share, please reply directly to this email, and it will be updated under your thread.
        </p>

        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />

        <table style="width: 100%; font-size: 13px; color: #64748b; line-height: 1.5;">
          <tr>
            <td>
              <strong>COV India Forum Secretariat</strong><br />
              House No. 3279, 2nd Floor, Street No. 14<br />
              New Ranjit Nagar, New Delhi - 110008<br />
              Phone: +91 9599099012<br />
              Email: covindiaforum@gmail.com
            </td>
          </tr>
        </table>
      </div>
      
      <div style="text-align: center; padding: 24px; font-size: 12px; color: #94a3b8;">
        &copy; 2026 Council of Valuers India Forum. All rights reserved.
      </div>
    </div>
  `;

  try {
    const info = await transporter.sendMail({
      from: fromAddress,
      to: clientEmail,
      subject: subject,
      html: htmlContent
    });

    emailLogger.info("[sendThankYouEmail] Thank you email sent successfully", {
      messageId: info.messageId,
      to: clientEmail
    });

    // Record activity log if helper exists
    if (recordEmailLog) {
      recordEmailLog({
        source: "email",
        action: "send-contact-thanks",
        to: clientEmail,
        subject: subject,
        status: "SENT",
        requestId: requestId
      });
    }

    return true;
  } catch (err) {
    emailLogger.error("[sendThankYouEmail] Failed to send thank you email", {
      error: err.message,
      to: clientEmail
    });

    if (recordEmailLog) {
      recordEmailLog({
        source: "email",
        action: "send-contact-thanks",
        to: clientEmail,
        subject: subject,
        status: "FAILED",
        requestId: requestId,
        error: err.message
      });
    }

    return false;
  }
};
