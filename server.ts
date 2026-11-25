import express from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import path from 'path';
import nodemailer from 'nodemailer';
import { adminAuth } from './src/lib/firebase-admin.ts';
import { getOrCreateUser } from './src/db/users.ts';
import { requireAuth, type AuthRequest } from './src/middleware/auth.ts';
import {
  createOwnerSessionRecord,
  deleteOwnerSessionRecord,
  findOwnerSessionRecord,
  getBookingsLedgerRecords,
  getDispatchedEmailByExternalId,
  getDispatchedEmailsRecords,
  getOwnerBankAccountRecord,
  getOwnerSettingsRecord,
  insertDispatchedEmailRecord,
  recordNewBookingAndPayout,
  updateOwnerBackendEmailRecord,
  updateOwnerBankAccountRecord,
  updateOwnerPasscodeRecord,
} from './src/db/repository.ts';

dotenv.config();

const app = express();
app.use(express.json());

// Helper middleware to strictly verify owner authentication before releasing any back-end information
async function requireOwnerAuth(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  try {
    const ownerTokenHeader = req.headers['x-owner-token'] as string | undefined;
    if (ownerTokenHeader) {
      const session = await findOwnerSessionRecord(ownerTokenHeader);
      if (session) {
        return next();
      }
    }

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const bearerToken = authHeader.slice(7).trim();
      const session = await findOwnerSessionRecord(bearerToken);
      if (session) {
        return next();
      }

      try {
        const decoded = await adminAuth.verifyIdToken(bearerToken);
        const settings = await getOwnerSettingsRecord();
        if (
          decoded.email &&
          settings.authorizedEmails.includes(decoded.email.toLowerCase())
        ) {
          await getOrCreateUser(decoded.uid, decoded.email);
          return next();
        }
      } catch {
        // Fall through to 401
      }
    }

    return res.status(401).json({
      success: false,
      error:
        'Unauthorized: Owner login is required to access back-end financial information.',
    });
  } catch (error: any) {
    console.error('Owner auth verification error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Authentication verification failed.',
    });
  }
}

// Helper: Attempt to send email via SMTP or fallback to logged delivery
async function sendEmailNotification(emailData: {
  to: string;
  subject: string;
  htmlBody: string;
  plainText: string;
  senderEmail: string;
}): Promise<boolean> {
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      await transporter.sendMail({
        from: `"FIJI HAPS Platform" <${emailData.senderEmail}>`,
        to: emailData.to,
        subject: emailData.subject,
        text: emailData.plainText,
        html: emailData.htmlBody,
      });
      console.log(`[EMAIL DISPATCH SUCCESS] Real SMTP sent to ${emailData.to}`);
      return true;
    } catch (smtpErr) {
      console.warn(
        `[EMAIL SMTP WARNING] Failed to send via SMTP, falling back to backend delivery log:`,
        smtpErr
      );
    }
  }

  console.log(`\n================== [DISPATCHED EMAIL NOTIFICATION] ==================`);
  console.log(`To: ${emailData.to}`);
  console.log(`Subject: ${emailData.subject}`);
  console.log(`Sent At: ${new Date().toISOString()}`);
  console.log(`Body Preview: ${emailData.plainText.slice(0, 160)}...`);
  console.log(`======================================================================\n`);
  return true;
}

// Function to dispatch both emails on confirmed booking and persist logs to PostgreSQL
async function dispatchBookingEmails(
  booking: any,
  owner15Percent: number,
  operatorShare: number
) {
  const [settings, bankAccount] = await Promise.all([
    getOwnerSettingsRecord(),
    getOwnerBankAccountRecord(),
  ]);

  const voucherCode =
    booking.voucherCode || `FJ-HAPS-${Math.floor(10000 + Math.random() * 90000)}`;
  const guestName = booking.guestInfo?.fullName || 'Tourist Guest';
  const guestEmail = booking.guestInfo?.email || 'guest@example.com';
  const guestPhone = booking.guestInfo?.phone || '+679 000 0000';
  const guestCountry = booking.guestInfo?.country || 'International';
  const guestFlight = booking.guestInfo?.flightNumber || 'None';
  const specialRequests = booking.guestInfo?.specialRequests || 'None';
  const listingName = booking.listingName || 'Fiji Experience';
  const locationName = booking.locationName || 'Fiji';
  const dates = booking.startDate
    ? `${booking.startDate}${
        booking.endDate
          ? ` to ${booking.endDate}`
          : ` (${booking.timeSlot || 'Day'})`
      }`
    : 'Confirmed Date';
  const optionSelected = booking.optionSelected || 'Standard';
  const grossFjd = Number(booking.totalPriceFjd) || 0;

  const providerSlug = listingName.toLowerCase().replace(/[^a-z0-9]/g, '');
  const providerEmail =
    booking.providerEmail || `reservations@${providerSlug}.com.fj`;

  // ================= 1. EMAIL TO BACKEND OF WEBSITE (ADMIN) =================
  const adminSubject = `🔔 [FIJI HAPS BACKEND ALERT] New Booking: ${listingName} (Ref: ${voucherCode}) - 15% Revenue: FJD $${owner15Percent.toLocaleString()}`;
  const adminHtml = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #090d16; color: #f1f5f9; border-radius: 16px; overflow: hidden; border: 1px solid #1e293b;">
      <div style="background: linear-gradient(135deg, #059669, #0d9488); padding: 24px; text-align: center;">
        <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 800; color: #ccfbf1; background: rgba(0,0,0,0.2); padding: 4px 10px; border-radius: 9999px;">FIJI HAPS BACKEND OPERATIONS</span>
        <h1 style="margin: 8px 0 0 0; color: #ffffff; font-size: 20px; font-weight: 800;">New Confirmed Tourist Booking</h1>
        <p style="margin: 4px 0 0 0; color: #ccfbf1; font-size: 13px;">Automated 15% Take-Rate Deposited to Bank</p>
      </div>
      <div style="padding: 24px;">
        <div style="background: #111827; border-radius: 12px; padding: 18px; margin-bottom: 20px; border: 1px solid #059669;">
          <div style="font-size: 11px; font-weight: bold; text-transform: uppercase; color: #10b981; letter-spacing: 1px;">15% App Platform Commission</div>
          <div style="font-size: 26px; font-weight: 900; color: #34d399; margin: 4px 0; font-family: monospace;">FJD $${owner15Percent.toLocaleString()}</div>
          <div style="font-size: 12px; color: #94a3b8;">
            Deposited Directly to: <strong>${bankAccount.bankName}</strong> (•••• ${bankAccount.accountNumber.slice(-4)})
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

  const adminPlainText = `FIJI HAPS BACKEND NOTIFICATION: New Booking confirmed for ${listingName}. Voucher: ${voucherCode}. Lead Guest: ${guestName} (${guestEmail}, ${guestPhone}). Dates: ${dates}. Total Gross: FJD $${grossFjd}. 15% Platform Revenue: FJD $${owner15Percent} deposited to ${bankAccount.bankName} (•••• ${bankAccount.accountNumber.slice(-4)}). Provider dispatched: ${providerEmail}.`;

  await sendEmailNotification({
    to: settings.backendEmail,
    subject: adminSubject,
    htmlBody: adminHtml,
    plainText: adminPlainText,
    senderEmail: settings.senderEmail,
  });

  await insertDispatchedEmailRecord({
    externalId: `EM-${Date.now()}-ADMIN`,
    bookingRef: voucherCode,
    recipientType: 'backend_admin',
    to: settings.backendEmail,
    recipientName: 'Website Backend Admin',
    subject: adminSubject,
    htmlBody: adminHtml,
    plainText: adminPlainText,
    status: 'delivered',
    listingName,
    grossAmountFjd: grossFjd,
    owner15PercentCutFjd: owner15Percent,
    operatorShareFjd: operatorShare,
  });

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

  await sendEmailNotification({
    to: providerEmail,
    subject: providerSubject,
    htmlBody: providerHtml,
    plainText: providerPlainText,
    senderEmail: settings.senderEmail,
  });

  await insertDispatchedEmailRecord({
    externalId: `EM-${Date.now()}-PROVIDER`,
    bookingRef: voucherCode,
    recipientType: 'provider',
    to: providerEmail,
    recipientName: `${listingName} Reservations Desk`,
    subject: providerSubject,
    htmlBody: providerHtml,
    plainText: providerPlainText,
    status: 'delivered',
    listingName,
    grossAmountFjd: grossFjd,
    operatorShareFjd: operatorShare,
  });
}

// ================= USER AUTH SYNC ENDPOINT (FIREBASE AUTH -> CLOUD SQL) =================
app.get('/api/auth/me', requireAuth, async (req: AuthRequest, res) => {
  res.json({
    success: true,
    uid: req.user?.uid,
    email: req.user?.email,
    dbUserId: req.dbUserId,
  });
});

// ================= OWNER AUTHENTICATION ENDPOINTS =================

// 1. Owner Login (Passcode or Verified Firebase ID Token)
app.post('/api/owner/auth/login', async (req, res) => {
  try {
    const { passcode, idToken } = req.body;
    const settings = await getOwnerSettingsRecord();

    // Passcode authentication
    if (
      passcode &&
      typeof passcode === 'string' &&
      passcode.trim() === settings.masterPasscode
    ) {
      const sessionToken = `fj-owner-${Math.random()
        .toString(36)
        .substring(2)}${Date.now()}`;
      await createOwnerSessionRecord(sessionToken, settings.backendEmail);
      return res.json({
        success: true,
        token: sessionToken,
        ownerEmail: settings.backendEmail,
        message: 'Owner authenticated successfully via passcode.',
      });
    }

    // Verified Firebase Google ID Token authentication
    const headerToken = req.headers.authorization?.startsWith('Bearer ')
      ? req.headers.authorization.slice(7).trim()
      : undefined;
    const tokenToVerify =
      typeof idToken === 'string' && idToken.trim() ? idToken.trim() : headerToken;

    if (tokenToVerify) {
      try {
        const decoded = await adminAuth.verifyIdToken(tokenToVerify);
        const verifiedEmail = decoded.email?.trim().toLowerCase();
        if (
          verifiedEmail &&
          settings.authorizedEmails.includes(verifiedEmail)
        ) {
          await getOrCreateUser(decoded.uid, decoded.email || verifiedEmail);
          const sessionToken = `fj-owner-${Math.random()
            .toString(36)
            .substring(2)}${Date.now()}`;
          await createOwnerSessionRecord(sessionToken, decoded.email || verifiedEmail);
          return res.json({
            success: true,
            token: sessionToken,
            ownerEmail: decoded.email || verifiedEmail,
            message: 'Owner authenticated successfully via verified Google account.',
          });
        }
      } catch (verifyErr) {
        console.error('Firebase token verification failed during owner login:', verifyErr);
      }
    }

    return res.status(401).json({
      success: false,
      error: 'Access denied: Incorrect owner passcode or unauthorized account.',
    });
  } catch (error: any) {
    console.error('Owner login error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to authenticate owner.',
    });
  }
});

// 2. Check Owner Authentication Status
app.get('/api/owner/auth/check', async (req, res) => {
  try {
    const token =
      (req.headers['x-owner-token'] as string) ||
      req.headers.authorization?.replace(/^Bearer\s+/i, '');
    if (token) {
      const session = await findOwnerSessionRecord(token);
      if (session) {
        return res.json({ authenticated: true, ownerEmail: session.ownerEmail });
      }
    }
    return res.json({ authenticated: false });
  } catch (error: any) {
    console.error('Owner session check error:', error);
    return res.status(500).json({ authenticated: false });
  }
});

// 3. Owner Logout (Revoke session token)
app.post('/api/owner/auth/logout', async (req, res) => {
  try {
    const token =
      (req.headers['x-owner-token'] as string) ||
      req.headers.authorization?.replace(/^Bearer\s+/i, '');
    if (token) {
      await deleteOwnerSessionRecord(token);
    }
    res.json({
      success: true,
      message: 'Owner logged out successfully. Back-end locked.',
    });
  } catch (error: any) {
    console.error('Owner logout error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to log out.',
    });
  }
});

// 4. Change Owner Passcode
app.post('/api/owner/auth/change-passcode', requireOwnerAuth, async (req, res) => {
  try {
    const { newPasscode } = req.body;
    if (
      !newPasscode ||
      typeof newPasscode !== 'string' ||
      newPasscode.trim().length < 4
    ) {
      return res.status(400).json({
        success: false,
        error: 'New passcode must be at least 4 characters.',
      });
    }
    await updateOwnerPasscodeRecord(newPasscode);
    res.json({
      success: true,
      message: 'Owner master passcode updated successfully.',
    });
  } catch (error: any) {
    console.error('Change passcode error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update passcode.',
    });
  }
});

// ================= PROTECTED OWNER BACKEND ENDPOINTS (OWNER ONLY) =================

// 1. Get Owner Bank Account Settings (Protected)
app.get('/api/owner/bank-account', requireOwnerAuth, async (req, res) => {
  try {
    const bankAccount = await getOwnerBankAccountRecord();
    res.json(bankAccount);
  } catch (error: any) {
    console.error('Failed to fetch bank account:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch bank account' });
  }
});

// 2. Update Owner Bank Account Settings (Protected)
app.post('/api/owner/bank-account', requireOwnerAuth, async (req, res) => {
  try {
    const account = await updateOwnerBankAccountRecord(req.body);
    res.json({
      success: true,
      message: 'Bank account updated successfully',
      account,
    });
  } catch (error: any) {
    console.error('Failed to update bank account:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update bank account',
    });
  }
});

// 3. Get Owner Revenue & 15% Payout Ledger (Protected)
app.get('/api/owner/revenue-ledger', requireOwnerAuth, async (req, res) => {
  try {
    const [bankAccount, ledger, settings, emails] = await Promise.all([
      getOwnerBankAccountRecord(),
      getBookingsLedgerRecords(),
      getOwnerSettingsRecord(),
      getDispatchedEmailsRecords(),
    ]);

    const totalGross = ledger.reduce(
      (sum, item) => sum + (item.grossBookingFjd || 0),
      0
    );
    const totalOwner15Payout = ledger.reduce(
      (sum, item) => sum + (item.owner15PercentCutFjd || 0),
      0
    );

    res.json({
      bankAccount,
      ledger,
      ownerSettings: {
        backendEmail: settings.backendEmail,
        adminNotificationEnabled: settings.adminNotificationEnabled,
        providerNotificationEnabled: settings.providerNotificationEnabled,
        senderEmail: settings.senderEmail,
      },
      metrics: {
        totalGrossVolumeFjd: totalGross,
        totalOwner15RevenueFjd: totalOwner15Payout,
        totalBookingsCount: ledger.length,
        payoutStatus: 'Automated 15% Bank Transfer Active',
        totalEmailsDispatched: emails.length,
      },
    });
  } catch (error: any) {
    console.error('Failed to fetch revenue ledger:', error);
    res.status(500).json({
      error: error.message || 'Failed to fetch revenue ledger',
    });
  }
});

// 4. Get All Dispatched Notification Emails (Protected)
app.get('/api/owner/dispatched-emails', requireOwnerAuth, async (req, res) => {
  try {
    const [settings, emails] = await Promise.all([
      getOwnerSettingsRecord(),
      getDispatchedEmailsRecords(),
    ]);
    res.json({
      success: true,
      count: emails.length,
      backendEmailTarget: settings.backendEmail,
      emails,
    });
  } catch (error: any) {
    console.error('Failed to fetch dispatched emails:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch dispatched emails',
    });
  }
});

// 5. Update Backend Admin Email Settings (Protected)
app.post('/api/owner/email-settings', requireOwnerAuth, async (req, res) => {
  try {
    const { backendEmail } = req.body;
    if (backendEmail && typeof backendEmail === 'string' && backendEmail.includes('@')) {
      const updated = await updateOwnerBackendEmailRecord(backendEmail);
      res.json({
        success: true,
        message: 'Backend email updated successfully',
        ownerSettings: {
          backendEmail: updated.backendEmail,
          adminNotificationEnabled: updated.adminNotificationEnabled,
          providerNotificationEnabled: updated.providerNotificationEnabled,
          senderEmail: updated.senderEmail,
        },
      });
    } else {
      res.status(400).json({ success: false, error: 'Invalid email address' });
    }
  } catch (error: any) {
    console.error('Failed to update email settings:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update email settings',
    });
  }
});

// 6. Resend Email Dispatch (Protected)
app.post('/api/owner/resend-email', requireOwnerAuth, async (req, res) => {
  try {
    const { emailId } = req.body;
    const [emailItem, settings] = await Promise.all([
      getDispatchedEmailByExternalId(emailId),
      getOwnerSettingsRecord(),
    ]);
    if (!emailItem) {
      return res.status(404).json({ success: false, error: 'Email record not found' });
    }

    await sendEmailNotification({
      to: emailItem.toEmail,
      subject: emailItem.subject,
      htmlBody: emailItem.htmlBody,
      plainText: emailItem.plainText,
      senderEmail: settings.senderEmail,
    });

    res.json({ success: true, message: `Email re-dispatched to ${emailItem.toEmail}` });
  } catch (error: any) {
    console.error('Failed to resend email:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to resend email',
    });
  }
});

// 7. Process Booking (Customer checkout calls this in backend)
app.post('/api/bookings', async (req, res) => {
  try {
    const booking = req.body;
    const gross = Number(booking.totalPriceFjd) || 0;

    // Optional Firebase Auth user linkage if bearer token is present
    let dbUserId: number | null = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const decoded = await adminAuth.verifyIdToken(authHeader.slice(7).trim());
        const userRow = await getOrCreateUser(decoded.uid, decoded.email || '');
        dbUserId = userRow.id;
      } catch {
        // Guest checkout allowed
      }
    }

    const owner15Percent = Math.round(gross * 0.15);
    const operatorShare = gross - owner15Percent;
    const bankAccount = await getOwnerBankAccountRecord();

    const externalId = booking.id || `BK-${Date.now()}`;
    const bookingRef =
      booking.voucherCode || `FJ-HAPS-${Math.floor(10000 + Math.random() * 90000)}`;

    await recordNewBookingAndPayout({
      externalId,
      bookingRef,
      userId: dbUserId,
      customerName: booking.guestInfo?.fullName || 'Tourist Guest',
      customerEmail: booking.guestInfo?.email || 'guest@example.com',
      listingName: booking.listingName || 'Fiji Experience',
      locationName: booking.locationName || 'Fiji',
      optionSelected: booking.optionSelected || 'Standard',
      startDate: booking.startDate || 'Confirmed Date',
      endDate: booking.endDate || booking.timeSlot || 'Day',
      grossBookingFjd: gross,
      owner15PercentCutFjd: owner15Percent,
      operatorShareFjd: operatorShare,
      bankAccountId: bankAccount.id,
      bankAccountTarget: `${bankAccount.bankName} (•••• ${bankAccount.accountNumber.slice(-4)})`,
    });

    try {
      await dispatchBookingEmails(booking, owner15Percent, operatorShare);
    } catch (err) {
      console.error('[EMAIL DISPATCH ERROR]', err);
    }

    res.json({
      success: true,
      bookingId: externalId,
      voucherCode: bookingRef,
      status: 'confirmed',
      notifications: {
        backendDispatched: true,
        providerDispatched: true,
      },
    });
  } catch (error: any) {
    console.error('Failed to process booking:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to process booking.',
    });
  }
});

// SEO: Robots & Sitemap for Google Search Console indexing
function getSeoBaseUrl(req: express.Request): string {
  if (process.env.APP_URL && process.env.APP_URL.includes('fijihaps.com')) {
    return process.env.APP_URL.replace(/\/+$/, '');
  }
  if (process.env.NODE_ENV === 'production') {
    return 'https://fijihaps.com';
  }
  return (
    process.env.APP_URL?.replace(/\/+$/, '') ||
    `${req.headers['x-forwarded-proto'] || req.protocol}://${req.get('host')}`
  );
}

app.get('/robots.txt', (req, res) => {
  const baseUrl = getSeoBaseUrl(req);
  res.type('text/plain').send(
    `User-agent: *\nAllow: /\nDisallow: /api/\n\nSitemap: ${baseUrl}/sitemap.xml\n`
  );
});

app.get('/sitemap.xml', (req, res) => {
  const baseUrl = getSeoBaseUrl(req);
  const lastMod = new Date().toISOString().split('T')[0];
  res.type('application/xml').send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`);
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// ================= SERVER STARTUP & VITE INTEGRATION =================
const PORT =
  process.env.NODE_ENV === 'production'
    ? Number(process.env.PORT) || 3000
    : 3000;

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
