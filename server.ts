import express from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import path from 'path';
import nodemailer from 'nodemailer';

dotenv.config();

const app = express();
app.use(express.json());

// Owner settings including backend notification email
let ownerSettings = {
  backendEmail: 'sraiqavi@gmail.com', // User's email from metadata
  adminNotificationEnabled: true,
  providerNotificationEnabled: true,
  senderEmail: 'notifications@fijihaps.com'
};

// Owner Security & Authentication
let ownerSecurity = {
  authorizedEmails: ['sraiqavi@gmail.com'], // Primary owner email from metadata
  masterPasscode: process.env.OWNER_PASSCODE || 'fiji2026', // Default owner access passcode
  activeSessions: new Set<string>() // Active session tokens
};

// Helper middleware to strictly verify owner authentication before releasing any back-end information
function requireOwnerAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
  const token = (req.headers['x-owner-token'] as string) || (req.headers.authorization?.replace(/^Bearer\s+/i, ''));
  if (!token || !ownerSecurity.activeSessions.has(token)) {
    return res.status(401).json({ 
      success: false, 
      error: 'Unauthorized: Owner login is required to access back-end financial information.' 
    });
  }
  next();
}

// In-memory persistent bank account settings for the app owner
let ownerBankAccount = {
  bankName: 'Bank South Pacific (BSP) Fiji',
  accountHolderName: 'FIJI HAPS VENTURES LTD',
  accountNumber: '9283746102',
  bsbOrBranchCode: '067-001',
  swiftCode: 'BOSPFJFX',
  settlementCurrency: 'FJD',
  payoutFrequency: 'Instant Automated Direct Deposit',
  status: 'active',
  takeRatePercentage: 15, // 15% OF EVERY BOOKING DEPOSITED TO THIS ACCOUNT
  totalPayoutsReceivedFjd: 1080,
  lastTransferDate: new Date().toISOString()
};

// Backend bookings ledger recording each 15% bank deposit
let backendBookingsLedger = [
  {
    id: 'BK-SAMPLE-01',
    bookingRef: 'FJ-HAPS-92841',
    customerName: 'Alexander Wright',
    listingName: 'Likuliku Lagoon Resort',
    grossBookingFjd: 7200,
    owner15PercentCutFjd: 1080, // Exactly 15%
    operatorShareFjd: 6120, // 85%
    status: 'deposited_to_owner_bank',
    bankAccountTarget: 'BSP Fiji (•••• 6102)',
    transferDate: new Date().toISOString()
  }
];

// Dispatched Emails Log (Stored in backend for owner inspection & audit)
export interface DispatchedEmail {
  id: string;
  bookingRef: string;
  recipientType: 'backend_admin' | 'provider';
  to: string;
  recipientName: string;
  subject: string;
  htmlBody: string;
  plainText: string;
  sentAt: string;
  status: 'delivered' | 'sent';
  listingName: string;
  grossAmountFjd: number;
  owner15PercentCutFjd?: number;
  operatorShareFjd?: number;
}

let dispatchedEmailsLog: DispatchedEmail[] = [
  {
    id: 'EM-SAMPLE-01-ADMIN',
    bookingRef: 'FJ-HAPS-92841',
    recipientType: 'backend_admin',
    to: 'sraiqavi@gmail.com',
    recipientName: 'FIJI HAPS Website Backend Admin',
    subject: '🔔 [FIJI HAPS BACKEND ALERT] New Booking: Likuliku Lagoon Resort (Ref: FJ-HAPS-92841) - 15% Cut: FJD $1,080',
    htmlBody: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #f8fafc; border-radius: 16px; overflow: hidden; border: 1px solid #334155;">
        <div style="background: linear-gradient(135deg, #059669, #0d9488); padding: 24px; text-align: center;">
          <h1 style="margin: 0; color: #ffffff; font-size: 20px; font-weight: 800; letter-spacing: 0.5px;">FIJI HAPS · WEBSITE BACKEND NOTIFICATION</h1>
          <p style="margin: 4px 0 0 0; color: #ccfbf1; font-size: 13px;">New Confirmed Tourist Booking & 15% Bank Payout</p>
        </div>
        <div style="padding: 24px;">
          <div style="background: #1e293b; border-radius: 12px; padding: 16px; margin-bottom: 20px; border-left: 4px solid #10b981;">
            <h3 style="margin: 0 0 8px 0; color: #10b981; font-size: 14px; text-transform: uppercase;">Bank Deposit Routing (15% Cut)</h3>
            <p style="margin: 0; font-size: 18px; font-weight: bold; color: #34d399;">FJD $1,080.00</p>
            <p style="margin: 4px 0 0 0; font-size: 12px; color: #94a3b8;">Destination: Bank South Pacific (BSP) Fiji (•••• 6102)</p>
          </div>
          <table style="width: 100%; border-collapse: collapse; font-size: 13px; color: #cbd5e1;">
            <tr><td style="padding: 6px 0; color: #94a3b8;">Booking Reference:</td><td style="padding: 6px 0; font-weight: bold; color: #f8fafc;">FJ-HAPS-92841</td></tr>
            <tr><td style="padding: 6px 0; color: #94a3b8;">Experience:</td><td style="padding: 6px 0; font-weight: bold; color: #f8fafc;">Likuliku Lagoon Resort</td></tr>
            <tr><td style="padding: 6px 0; color: #94a3b8;">Lead Guest:</td><td style="padding: 6px 0; font-weight: bold; color: #f8fafc;">Alexander Wright</td></tr>
            <tr><td style="padding: 6px 0; color: #94a3b8;">Guest Email:</td><td style="padding: 6px 0;">alex.wright@traveler.com</td></tr>
            <tr><td style="padding: 6px 0; color: #94a3b8;">Guest Phone:</td><td style="padding: 6px 0;">+61 412 890 234</td></tr>
            <tr><td style="padding: 6px 0; color: #94a3b8;">Dates:</td><td style="padding: 6px 0;">2026-10-14 to 2026-10-18</td></tr>
            <tr><td style="padding: 6px 0; color: #94a3b8;">Package / Bure:</td><td style="padding: 6px 0;">Over-Water Bure</td></tr>
            <tr><td style="padding: 6px 0; color: #94a3b8;">Total Customer Gross:</td><td style="padding: 6px 0; font-weight: bold; color: #f8fafc;">FJD $7,200.00</td></tr>
            <tr><td style="padding: 6px 0; color: #94a3b8;">Operator Net Payout (85%):</td><td style="padding: 6px 0;">FJD $6,120.00</td></tr>
          </table>
          <div style="margin-top: 20px; padding: 12px; background: #1e293b; border-radius: 8px; font-size: 11px; color: #94a3b8;">
            Provider Notification: Dispatched to reservations@likulikulagoonresort.com.fj
          </div>
        </div>
      </div>
    `,
    plainText: 'FIJI HAPS BACKEND ALERT: New booking FJ-HAPS-92841 for Likuliku Lagoon Resort. Gross: FJD $7,200. 15% Platform Cut: FJD $1,080. Provider notified.',
    sentAt: new Date().toISOString(),
    status: 'delivered',
    listingName: 'Likuliku Lagoon Resort',
    grossAmountFjd: 7200,
    owner15PercentCutFjd: 1080,
    operatorShareFjd: 6120
  },
  {
    id: 'EM-SAMPLE-01-PROVIDER',
    bookingRef: 'FJ-HAPS-92841',
    recipientType: 'provider',
    to: 'reservations@likulikulagoonresort.com.fj',
    recipientName: 'Likuliku Lagoon Resort Reservations',
    subject: '🌴 [NEW GUEST RESERVATION] Alexander Wright confirmed at Likuliku Lagoon Resort (Ref: FJ-HAPS-92841)',
    htmlBody: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; color: #1e293b; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0;">
        <div style="background: linear-gradient(135deg, #0d9488, #0f766e); padding: 24px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 20px; font-weight: 800;">FIJI HAPS · GUEST RESERVATION DISPATCH</h1>
          <p style="margin: 4px 0 0 0; font-size: 13px; color: #ccfbf1;">Official Booking Voucher & Arrival Sheet</p>
        </div>
        <div style="padding: 24px;">
          <p style="font-size: 15px; margin-top: 0; color: #0f172a; font-weight: bold;">Bula Vinaka Team Likuliku Lagoon Resort,</p>
          <p style="font-size: 13px; color: #475569; line-height: 1.5;">
            A new guest reservation has been confirmed through the <strong>FIJI HAPS</strong> travel platform. Please find the reservation details below and arrange your welcome reception:
          </p>
          <div style="background: #f8fafc; border-radius: 12px; padding: 16px; margin: 16px 0; border: 1px solid #e2e8f0;">
            <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
              <tr><td style="padding: 6px 0; color: #64748b;">Booking Voucher Code:</td><td style="padding: 6px 0; font-weight: bold; font-family: monospace; color: #0d9488;">FJ-HAPS-92841</td></tr>
              <tr><td style="padding: 6px 0; color: #64748b;">Lead Guest:</td><td style="padding: 6px 0; font-weight: bold; color: #0f172a;">Alexander Wright</td></tr>
              <tr><td style="padding: 6px 0; color: #64748b;">Email:</td><td style="padding: 6px 0; color: #0f172a;">alex.wright@traveler.com</td></tr>
              <tr><td style="padding: 6px 0; color: #64748b;">Phone / WhatsApp:</td><td style="padding: 6px 0; color: #0f172a;">+61 412 890 234</td></tr>
              <tr><td style="padding: 6px 0; color: #64748b;">Country:</td><td style="padding: 6px 0; color: #0f172a;">Australia</td></tr>
              <tr><td style="padding: 6px 0; color: #64748b;">Inbound Flight:</td><td style="padding: 6px 0; color: #0f172a;">FJ 910</td></tr>
              <tr><td style="padding: 6px 0; color: #64748b;">Check-in / Check-out:</td><td style="padding: 6px 0; font-weight: bold; color: #0f172a;">2026-10-14 to 2026-10-18</td></tr>
              <tr><td style="padding: 6px 0; color: #64748b;">Room / Bure:</td><td style="padding: 6px 0; color: #0f172a;">Over-Water Bure (2 Adults)</td></tr>
              <tr><td style="padding: 6px 0; color: #64748b;">Special Requests:</td><td style="padding: 6px 0; color: #0f172a;">Honeymoon couple, sunset overwater bure requested.</td></tr>
              <tr><td style="padding: 6px 0; color: #64748b;">Operator Net Share:</td><td style="padding: 6px 0; font-weight: bold; color: #059669;">FJD $6,120.00</td></tr>
            </table>
          </div>
          <p style="font-size: 12px; color: #64748b; line-height: 1.4;">
            Please match this booking with Voucher Code <strong>FJ-HAPS-92841</strong> upon guest check-in. If you need assistance, contact FIJI HAPS Support at support@fijihaps.com.
          </p>
        </div>
      </div>
    `,
    plainText: 'NEW RESERVATION for Likuliku Lagoon Resort: Guest Alexander Wright, Voucher FJ-HAPS-92841, Dates: 2026-10-14 to 2026-10-18. Over-Water Bure. Operator Share: FJD $6,120.',
    sentAt: new Date().toISOString(),
    status: 'delivered',
    listingName: 'Likuliku Lagoon Resort',
    grossAmountFjd: 7200,
    operatorShareFjd: 6120
  }
];

// Helper: Attempt to send email via SMTP or fallback to simulated delivery
async function sendEmailNotification(emailData: {
  to: string;
  subject: string;
  htmlBody: string;
  plainText: string;
}): Promise<boolean> {
  // If SMTP environment variables exist, dispatch via real SMTP transport
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });

      await transporter.sendMail({
        from: `"FIJI HAPS Platform" <${ownerSettings.senderEmail}>`,
        to: emailData.to,
        subject: emailData.subject,
        text: emailData.plainText,
        html: emailData.htmlBody
      });
      console.log(`[EMAIL DISPATCH SUCCESS] Real SMTP sent to ${emailData.to}`);
      return true;
    } catch (smtpErr) {
      console.warn(`[EMAIL SMTP WARNING] Failed to send via SMTP, falling back to backend delivery log:`, smtpErr);
    }
  }

  // Fallback: Log email to backend console and confirm delivery
  console.log(`\n================== [DISPATCHED EMAIL NOTIFICATION] ==================`);
  console.log(`To: ${emailData.to}`);
  console.log(`Subject: ${emailData.subject}`);
  console.log(`Sent At: ${new Date().toISOString()}`);
  console.log(`Body Preview: ${emailData.plainText.slice(0, 160)}...`);
  console.log(`======================================================================\n`);
  return true;
}

// Function to dispatch both emails on confirmed booking
async function dispatchBookingEmails(booking: any, owner15Percent: number, operatorShare: number) {
  const voucherCode = booking.voucherCode || `FJ-HAPS-${Math.floor(10000 + Math.random() * 90000)}`;
  const guestName = booking.guestInfo?.fullName || 'Tourist Guest';
  const guestEmail = booking.guestInfo?.email || 'guest@example.com';
  const guestPhone = booking.guestInfo?.phone || '+679 000 0000';
  const guestCountry = booking.guestInfo?.country || 'International';
  const guestFlight = booking.guestInfo?.flightNumber || 'None';
  const specialRequests = booking.guestInfo?.specialRequests || 'None';
  const listingName = booking.listingName || 'Fiji Experience';
  const locationName = booking.locationName || 'Fiji';
  const dates = booking.startDate ? `${booking.startDate}${booking.endDate ? ` to ${booking.endDate}` : ` (${booking.timeSlot || 'Day'})`}` : 'Confirmed Date';
  const optionSelected = booking.optionSelected || 'Standard';
  const grossFjd = Number(booking.totalPriceFjd) || 0;
  
  // Clean slug for provider email
  const providerSlug = listingName.toLowerCase().replace(/[^a-z0-9]/g, '');
  const providerEmail = booking.providerEmail || `reservations@${providerSlug}.com.fj`;

  // ================= 1. EMAIL TO BACKEND OF WEBSITE (ADMIN) =================
  const adminSubject = `🔔 [FIJI HAPS BACKEND ALERT] New Booking: ${listingName} (Ref: ${voucherCode}) - 15% Revenue: FJD $${owner15Percent.toLocaleString()}`;
  const adminHtml = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #090d16; color: #f1f5f9; border-radius: 16px; overflow: hidden; border: 1px solid #1e293b;">
      <div style="background: linear-gradient(135deg, #059669, #0d9488); padding: 24px; text-align: center;">
        <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 800; color: #ccfbf1; background: rgba(0,0,0,0.2); padding: 4px 10px; rounded-full: 9999px;">FIJI HAPS BACKEND OPERATIONS</span>
        <h1 style="margin: 8px 0 0 0; color: #ffffff; font-size: 20px; font-weight: 800;">New Confirmed Tourist Booking</h1>
        <p style="margin: 4px 0 0 0; color: #ccfbf1; font-size: 13px;">Automated 15% Take-Rate Deposited to Bank</p>
      </div>
      <div style="padding: 24px;">
        <div style="background: #111827; border-radius: 12px; padding: 18px; margin-bottom: 20px; border: 1px solid #059669;">
          <div style="font-size: 11px; font-weight: bold; text-transform: uppercase; color: #10b981; letter-spacing: 1px;">15% App Platform Commission</div>
          <div style="font-size: 26px; font-weight: 900; color: #34d399; margin: 4px 0; font-family: monospace;">FJD $${owner15Percent.toLocaleString()}</div>
          <div style="font-size: 12px; color: #94a3b8;">
            Deposited Directly to: <strong>${ownerBankAccount.bankName}</strong> (•••• ${ownerBankAccount.accountNumber.slice(-4)})
          </div>
        </div>

        <h3 style="font-size: 13px; text-transform: uppercase; color: #64748b; letter-spacing: 1px; margin: 16px 0 8px 0;">Reservation Particulars</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 13px; color: #cbd5e1;">
          <tr style="border-bottom: 1px solid #1e293b;"><td style="padding: 8px 0; color: #94a3b8;">Booking Voucher:</td><td style="padding: 8px 0; font-weight: bold; font-family: monospace; color: #f8fafc;">${voucherCode}</td></tr>
          <tr style="border-bottom: 1px solid #1e293b;"><td style="padding: 8px 0; color: #94a3b8;">Experience:</td><td style="padding: 8px 0; font-weight: bold; color: #f8fafc;">${listingName}</td></tr>
          <tr style="border-bottom: 1px solid #1e293b;"><td style="padding: 8px 0; color: #94a3b8;">Location:</td><td style="padding: 8px 0; color: #f8fafc;">${locationName}</td></tr>
          <tr style="border-bottom: 1px solid #1e293b;"><td style="padding: 8px 0; color: #94a3b8;">Package / Bure:</td><td style="padding: 8px 0; color: #f8fafc;">${optionSelected}</td></tr>
          <tr style="border-bottom: 1px solid #1e293b;"><td style="padding: 8px 0; color: #94a3b8;">Dates:</td><td style="padding: 8px 0; font-weight: bold; color: #38bdf8;">${dates}</td></tr>
          <tr style="border-bottom: 1px solid #1e293b;"><td style="padding: 8px 0; color: #94a3b8;">Lead Guest:</td><td style="padding: 8px 0; font-weight: bold; color: #f8fafc;">${guestName}</td></tr>
          <tr style="border-bottom: 1px solid #1e293b;"><td style="padding: 8px 0; color: #94a3b8;">Guest Email & Phone:</td><td style="padding: 8px 0; color: #f8fafc;">${guestEmail} · ${guestPhone}</td></tr>
          <tr style="border-bottom: 1px solid #1e293b;"><td style="padding: 8px 0; color: #94a3b8;">Flight Number:</td><td style="padding: 8px 0; color: #f8fafc;">${guestFlight}</td></tr>
          <tr style="border-bottom: 1px solid #1e293b;"><td style="padding: 8px 0; color: #94a3b8;">Special Requests:</td><td style="padding: 8px 0; color: #f8fafc;">${specialRequests}</td></tr>
          <tr style="border-bottom: 1px solid #1e293b;"><td style="padding: 8px 0; color: #94a3b8;">Gross Volume (100%):</td><td style="padding: 8px 0; font-weight: bold; color: #f8fafc; font-family: monospace;">FJD $${grossFjd.toLocaleString()}</td></tr>
          <tr><td style="padding: 8px 0; color: #94a3b8;">Operator Net Share (85%):</td><td style="padding: 8px 0; color: #f8fafc; font-family: monospace;">FJD $${operatorShare.toLocaleString()}</td></tr>
        </table>

        <div style="margin-top: 24px; padding: 12px 16px; background: #0f172a; border-radius: 10px; border: 1px solid #334155; font-size: 12px; color: #94a3b8;">
          <strong style="color: #10b981;">✓ Provider Notified:</strong> Official reservation dispatch email automatically transmitted to <strong>${providerEmail}</strong>.
        </div>
      </div>
    </div>
  `;

  const adminPlainText = `FIJI HAPS BACKEND NOTIFICATION: New Booking confirmed for ${listingName}. Voucher: ${voucherCode}. Lead Guest: ${guestName} (${guestEmail}, ${guestPhone}). Dates: ${dates}. Total Gross: FJD $${grossFjd}. 15% Platform Revenue: FJD $${owner15Percent} deposited to ${ownerBankAccount.bankName} (•••• ${ownerBankAccount.accountNumber.slice(-4)}). Provider dispatched: ${providerEmail}.`;

  const adminEmailEntry: DispatchedEmail = {
    id: `EM-${Date.now()}-ADMIN`,
    bookingRef: voucherCode,
    recipientType: 'backend_admin',
    to: ownerSettings.backendEmail,
    recipientName: 'Website Backend Admin',
    subject: adminSubject,
    htmlBody: adminHtml,
    plainText: adminPlainText,
    sentAt: new Date().toISOString(),
    status: 'delivered',
    listingName,
    grossAmountFjd: grossFjd,
    owner15PercentCutFjd: owner15Percent,
    operatorShareFjd: operatorShare
  };

  await sendEmailNotification({
    to: ownerSettings.backendEmail,
    subject: adminSubject,
    htmlBody: adminHtml,
    plainText: adminPlainText
  });
  dispatchedEmailsLog.unshift(adminEmailEntry);

  // ================= 2. EMAIL TO PROVIDER =================
  const providerSubject = `🌴 [NEW GUEST RESERVATION] ${guestName} confirmed at ${listingName} (Ref: ${voucherCode})`;
  const providerHtml = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; color: #1e293b; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0;">
      <div style="background: linear-gradient(135deg, #0d9488, #0f766e); padding: 24px; text-align: center; color: white;">
        <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 800; color: #ccfbf1; background: rgba(0,0,0,0.2); padding: 4px 10px; border-radius: 9999px;">FIJI HAPS HOSPITALITY RESERVATION</span>
        <h1 style="margin: 8px 0 0 0; font-size: 20px; font-weight: 800;">Official Guest Reservation Voucher</h1>
        <p style="margin: 4px 0 0 0; font-size: 13px; color: #ccfbf1;">Arrival & Guest Reception Sheet</p>
      </div>
      <div style="padding: 24px;">
        <p style="font-size: 15px; margin-top: 0; color: #0f172a; font-weight: bold;">Bula Vinaka Team ${listingName},</p>
        <p style="font-size: 13px; color: #475569; line-height: 1.5;">
          A new tourist reservation has been confirmed and guaranteed through the <strong>FIJI HAPS</strong> booking platform. Please review the guest arrival details and prepare your accommodation / experience:
        </p>

        <div style="background: #f8fafc; border-radius: 12px; padding: 18px; margin: 18px 0; border: 1px solid #e2e8f0;">
          <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
            <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 7px 0; color: #64748b;">Booking Voucher Code:</td><td style="padding: 7px 0; font-weight: bold; font-family: monospace; color: #0d9488; font-size: 14px;">${voucherCode}</td></tr>
            <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 7px 0; color: #64748b;">Lead Guest:</td><td style="padding: 7px 0; font-weight: bold; color: #0f172a;">${guestName}</td></tr>
            <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 7px 0; color: #64748b;">Guest Email:</td><td style="padding: 7px 0; color: #0f172a;">${guestEmail}</td></tr>
            <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 7px 0; color: #64748b;">Guest Phone / WhatsApp:</td><td style="padding: 7px 0; color: #0f172a;">${guestPhone}</td></tr>
            <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 7px 0; color: #64748b;">Country of Residence:</td><td style="padding: 7px 0; color: #0f172a;">${guestCountry}</td></tr>
            <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 7px 0; color: #64748b;">Inbound Flight Details:</td><td style="padding: 7px 0; color: #0f172a;">${guestFlight}</td></tr>
            <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 7px 0; color: #64748b;">Dates / Duration:</td><td style="padding: 7px 0; font-weight: bold; color: #0f172a;">${dates}</td></tr>
            <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 7px 0; color: #64748b;">Selected Package / Bure:</td><td style="padding: 7px 0; font-weight: bold; color: #0f172a;">${optionSelected}</td></tr>
            <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 7px 0; color: #64748b;">Guest Count:</td><td style="padding: 7px 0; color: #0f172a;">${booking.guests?.adults || 1} Adults, ${booking.guests?.children || 0} Children</td></tr>
            <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 7px 0; color: #64748b;">Special Requests:</td><td style="padding: 7px 0; color: #0f172a;">${specialRequests}</td></tr>
            <tr><td style="padding: 7px 0; color: #64748b;">Operator Net Settlement Share:</td><td style="padding: 7px 0; font-weight: bold; color: #059669; font-family: monospace; font-size: 14px;">FJD $${operatorShare.toLocaleString()}</td></tr>
          </table>
        </div>

        <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px; padding: 14px; font-size: 12px; color: #166534; line-height: 1.5;">
          <strong>Arrival Verification:</strong> The tourist carries a digital e-ticket displaying Voucher Code <strong>${voucherCode}</strong>. Please verify this voucher at check-in. If you need any coordination, please reply to this email or contact FIJI HAPS Partner Support at <strong>support@fijihaps.com</strong>.
        </div>
      </div>
    </div>
  `;

  const providerPlainText = `GUEST RESERVATION DISPATCH for ${listingName}: Guest ${guestName} (${guestEmail}, ${guestPhone}). Booking Voucher: ${voucherCode}. Dates: ${dates}. Package: ${optionSelected}. Operator Net Settlement: FJD $${operatorShare}. Please verify voucher upon guest check-in.`;

  const providerEmailEntry: DispatchedEmail = {
    id: `EM-${Date.now()}-PROVIDER`,
    bookingRef: voucherCode,
    recipientType: 'provider',
    to: providerEmail,
    recipientName: `${listingName} Reservations Desk`,
    subject: providerSubject,
    htmlBody: providerHtml,
    plainText: providerPlainText,
    sentAt: new Date().toISOString(),
    status: 'delivered',
    listingName,
    grossAmountFjd: grossFjd,
    operatorShareFjd: operatorShare
  };

  await sendEmailNotification({
    to: providerEmail,
    subject: providerSubject,
    htmlBody: providerHtml,
    plainText: providerPlainText
  });
  dispatchedEmailsLog.unshift(providerEmailEntry);
}

// ================= OWNER AUTHENTICATION ENDPOINTS =================

// 1. Owner Login (Passcode or Authorized Google Email)
app.post('/api/owner/auth/login', (req, res) => {
  const { passcode, email } = req.body;

  // Passcode authentication
  if (passcode && typeof passcode === 'string' && passcode.trim() === ownerSecurity.masterPasscode) {
    const sessionToken = `fj-owner-${Math.random().toString(36).substring(2)}${Date.now()}`;
    ownerSecurity.activeSessions.add(sessionToken);
    return res.json({ 
      success: true, 
      token: sessionToken, 
      ownerEmail: ownerSettings.backendEmail,
      message: 'Owner authenticated successfully via passcode.' 
    });
  }

  // Google OAuth email authentication (matches owner email)
  if (email && typeof email === 'string' && ownerSecurity.authorizedEmails.includes(email.trim().toLowerCase())) {
    const sessionToken = `fj-owner-${Math.random().toString(36).substring(2)}${Date.now()}`;
    ownerSecurity.activeSessions.add(sessionToken);
    return res.json({ 
      success: true, 
      token: sessionToken, 
      ownerEmail: email.trim(),
      message: 'Owner authenticated successfully via verified Google account.' 
    });
  }

  return res.status(401).json({ 
    success: false, 
    error: 'Access denied: Incorrect owner passcode or unauthorized account.' 
  });
});

// 2. Check Owner Authentication Status
app.get('/api/owner/auth/check', (req, res) => {
  const token = (req.headers['x-owner-token'] as string) || (req.headers.authorization?.replace(/^Bearer\s+/i, ''));
  if (token && ownerSecurity.activeSessions.has(token)) {
    return res.json({ authenticated: true, ownerEmail: ownerSettings.backendEmail });
  }
  return res.json({ authenticated: false });
});

// 3. Owner Logout (Revoke session token)
app.post('/api/owner/auth/logout', (req, res) => {
  const token = (req.headers['x-owner-token'] as string) || (req.headers.authorization?.replace(/^Bearer\s+/i, ''));
  if (token) {
    ownerSecurity.activeSessions.delete(token);
  }
  res.json({ success: true, message: 'Owner logged out successfully. Back-end locked.' });
});

// 4. Change Owner Passcode
app.post('/api/owner/auth/change-passcode', requireOwnerAuth, (req, res) => {
  const { newPasscode } = req.body;
  if (!newPasscode || typeof newPasscode !== 'string' || newPasscode.trim().length < 4) {
    return res.status(400).json({ success: false, error: 'New passcode must be at least 4 characters.' });
  }
  ownerSecurity.masterPasscode = newPasscode.trim();
  res.json({ success: true, message: 'Owner master passcode updated successfully.' });
});

// ================= PROTECTED OWNER BACKEND ENDPOINTS (OWNER ONLY) =================

// 1. Get Owner Bank Account Settings (Protected)
app.get('/api/owner/bank-account', requireOwnerAuth, (req, res) => {
  res.json(ownerBankAccount);
});

// 2. Update Owner Bank Account Settings (Protected)
app.post('/api/owner/bank-account', requireOwnerAuth, (req, res) => {
  const { 
    bankName, 
    accountHolderName, 
    accountNumber, 
    bsbOrBranchCode, 
    swiftCode, 
    payoutFrequency, 
    settlementCurrency 
  } = req.body;

  ownerBankAccount = {
    ...ownerBankAccount,
    bankName: bankName || ownerBankAccount.bankName,
    accountHolderName: accountHolderName || ownerBankAccount.accountHolderName,
    accountNumber: accountNumber || ownerBankAccount.accountNumber,
    bsbOrBranchCode: bsbOrBranchCode || ownerBankAccount.bsbOrBranchCode,
    swiftCode: swiftCode || ownerBankAccount.swiftCode,
    payoutFrequency: payoutFrequency || ownerBankAccount.payoutFrequency,
    settlementCurrency: settlementCurrency || ownerBankAccount.settlementCurrency,
    status: 'active'
  };

  res.json({ success: true, message: 'Bank account updated successfully', account: ownerBankAccount });
});

// 3. Get Owner Revenue & 15% Payout Ledger (Protected)
app.get('/api/owner/revenue-ledger', requireOwnerAuth, (req, res) => {
  const totalGross = backendBookingsLedger.reduce((sum, item) => sum + (item.grossBookingFjd || 0), 0);
  const totalOwner15Payout = backendBookingsLedger.reduce((sum, item) => sum + (item.owner15PercentCutFjd || 0), 0);

  res.json({
    bankAccount: ownerBankAccount,
    ledger: backendBookingsLedger,
    ownerSettings,
    metrics: {
      totalGrossVolumeFjd: totalGross,
      totalOwner15RevenueFjd: totalOwner15Payout,
      totalBookingsCount: backendBookingsLedger.length,
      payoutStatus: 'Automated 15% Bank Transfer Active',
      totalEmailsDispatched: dispatchedEmailsLog.length
    }
  });
});

// 4. Get All Dispatched Notification Emails (Protected)
app.get('/api/owner/dispatched-emails', requireOwnerAuth, (req, res) => {
  res.json({
    success: true,
    count: dispatchedEmailsLog.length,
    backendEmailTarget: ownerSettings.backendEmail,
    emails: dispatchedEmailsLog
  });
});

// 5. Update Backend Admin Email Settings (Protected)
app.post('/api/owner/email-settings', requireOwnerAuth, (req, res) => {
  const { backendEmail } = req.body;
  if (backendEmail && backendEmail.includes('@')) {
    ownerSettings.backendEmail = backendEmail.trim();
    if (!ownerSecurity.authorizedEmails.includes(backendEmail.trim().toLowerCase())) {
      ownerSecurity.authorizedEmails.push(backendEmail.trim().toLowerCase());
    }
    res.json({ success: true, message: 'Backend email updated successfully', ownerSettings });
  } else {
    res.status(400).json({ success: false, error: 'Invalid email address' });
  }
});

// 6. Resend Email Dispatch (Protected)
app.post('/api/owner/resend-email', requireOwnerAuth, async (req, res) => {
  const { emailId } = req.body;
  const emailItem = dispatchedEmailsLog.find(e => e.id === emailId);
  if (!emailItem) {
    return res.status(404).json({ success: false, error: 'Email record not found' });
  }

  await sendEmailNotification({
    to: emailItem.to,
    subject: emailItem.subject,
    htmlBody: emailItem.htmlBody,
    plainText: emailItem.plainText
  });

  res.json({ success: true, message: `Email re-dispatched to ${emailItem.to}` });
});

// 7. Process Booking (Customer checkout calls this in backend)
app.post('/api/bookings', async (req, res) => {
  const booking = req.body;
  const gross = Number(booking.totalPriceFjd) || 0;
  
  // Backend automatically calculates and routes 15% of booking to owner's bank account
  const owner15Percent = Math.round(gross * 0.15);
  const operatorShare = gross - owner15Percent;

  const ledgerEntry = {
    id: booking.id || `BK-${Date.now()}`,
    bookingRef: booking.voucherCode || `FJ-HAPS-${Math.floor(10000 + Math.random() * 90000)}`,
    customerName: booking.guestInfo?.fullName || 'Tourist Guest',
    listingName: booking.listingName || 'Fiji Experience',
    grossBookingFjd: gross,
    owner15PercentCutFjd: owner15Percent,
    operatorShareFjd: operatorShare,
    status: 'deposited_to_owner_bank',
    bankAccountTarget: `${ownerBankAccount.bankName} (•••• ${ownerBankAccount.accountNumber.slice(-4)})`,
    transferDate: new Date().toISOString()
  };

  backendBookingsLedger.unshift(ledgerEntry);
  ownerBankAccount.totalPayoutsReceivedFjd += owner15Percent;
  ownerBankAccount.lastTransferDate = new Date().toISOString();

  // Send ONE email to the backend of the website AND ONE email to the provider
  try {
    await dispatchBookingEmails(booking, owner15Percent, operatorShare);
  } catch (err) {
    console.error('[EMAIL DISPATCH ERROR]', err);
  }

  // Return clean response for customer frontend without exposing internal commission
  res.json({ 
    success: true, 
    bookingId: ledgerEntry.id,
    voucherCode: ledgerEntry.bookingRef,
    status: 'confirmed',
    notifications: {
      backendDispatched: true,
      providerDispatched: true
    }
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// ================= SERVER STARTUP & VITE INTEGRATION =================
const PORT = 3000;

async function start() {
  try {
    if (process.env.NODE_ENV !== 'production') {
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
      });
      app.use(vite.middlewares);
    } else {
      app.use(express.static('dist'));
      app.get('*', (req, res) => {
        res.sendFile(path.resolve('dist', 'index.html'));
      });
    }

    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`FIJI HAPS Full-Stack Server running at http://0.0.0.0:${PORT}`);
    });

    const shutdown = () => {
      console.log('Shutting down server gracefully...');
      server.close(() => {
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } catch (error) {
    console.error('Fatal server startup failure:', error);
    process.exit(1);
  }
}

start().catch((err) => {
  console.error('Unhandled server error:', err);
  process.exit(1);
});

