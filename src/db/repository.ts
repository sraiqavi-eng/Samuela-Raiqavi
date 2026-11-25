import { desc, eq, sql } from 'drizzle-orm';
import { db } from './index.ts';
import {
  bookings,
  dispatchedEmails,
  ownerBankAccounts,
  ownerSessions,
  ownerSettings,
} from './schema.ts';

let seedPromise: Promise<void> | null = null;

async function ensureSeededInternal() {
  const existingSettings = await db.select().from(ownerSettings).limit(1);
  if (existingSettings.length === 0) {
    await db.insert(ownerSettings).values({
      backendEmail: 'sraiqavi@gmail.com',
      senderEmail: 'notifications@fijihaps.com',
      adminNotificationEnabled: true,
      providerNotificationEnabled: true,
      masterPasscode: process.env.OWNER_PASSCODE || 'fiji2026',
      authorizedEmails: JSON.stringify(['sraiqavi@gmail.com']),
    });
  }

  const existingBank = await db.select().from(ownerBankAccounts).limit(1);
  if (existingBank.length === 0) {
    await db.insert(ownerBankAccounts).values({
      bankName: 'Bank South Pacific (BSP) Fiji',
      accountHolderName: 'FIJI HAPS VENTURES LTD',
      accountNumber: '9283746102',
      bsbOrBranchCode: '067-001',
      swiftCode: 'BOSPFJFX',
      settlementCurrency: 'FJD',
      payoutFrequency: 'Instant Automated Direct Deposit',
      status: 'active',
      takeRatePercentage: 15,
      totalPayoutsReceivedFjd: 1080,
      lastTransferDate: new Date(),
    });
  }

  const existingBookings = await db.select().from(bookings).limit(1);
  if (existingBookings.length === 0) {
    await db
      .insert(bookings)
      .values({
        externalId: 'BK-SAMPLE-01',
        bookingRef: 'FJ-HAPS-92841',
        customerName: 'Alexander Wright',
        customerEmail: 'alex.wright@traveler.com',
        listingName: 'Likuliku Lagoon Resort',
        locationName: 'Malolo Island, Mamanucas',
        optionSelected: 'Over-Water Bure',
        startDate: '2026-10-14',
        endDate: '2026-10-18',
        grossBookingFjd: 7200,
        owner15PercentCutFjd: 1080,
        operatorShareFjd: 6120,
        status: 'deposited_to_owner_bank',
        bankAccountTarget: 'BSP Fiji (•••• 6102)',
        transferDate: new Date(),
      })
      .onConflictDoNothing();
  }

  const existingEmails = await db.select().from(dispatchedEmails).limit(1);
  if (existingEmails.length === 0) {
    await db
      .insert(dispatchedEmails)
      .values([
        {
          externalId: 'EM-SAMPLE-01-ADMIN',
          bookingRef: 'FJ-HAPS-92841',
          recipientType: 'backend_admin',
          toEmail: 'sraiqavi@gmail.com',
          recipientName: 'FIJI HAPS Website Backend Admin',
          subject:
            '🔔 [FIJI HAPS BACKEND ALERT] New Booking: Likuliku Lagoon Resort (Ref: FJ-HAPS-92841) - 15% Cut: FJD $1,080',
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
            <tr><td style="padding: 6px 0; color: #94a3b8;">Total Customer Gross:</td><td style="padding: 6px 0; font-weight: bold; color: #f8fafc;">FJD $7,200.00</td></tr>
            <tr><td style="padding: 6px 0; color: #94a3b8;">Operator Net Payout (85%):</td><td style="padding: 6px 0;">FJD $6,120.00</td></tr>
          </table>
        </div>
      </div>
    `,
          plainText:
            'FIJI HAPS BACKEND ALERT: New booking FJ-HAPS-92841 for Likuliku Lagoon Resort. Gross: FJD $7,200. 15% Platform Cut: FJD $1,080. Provider notified.',
          sentAt: new Date(),
          status: 'delivered',
          listingName: 'Likuliku Lagoon Resort',
          grossAmountFjd: 7200,
          owner15PercentCutFjd: 1080,
          operatorShareFjd: 6120,
        },
        {
          externalId: 'EM-SAMPLE-01-PROVIDER',
          bookingRef: 'FJ-HAPS-92841',
          recipientType: 'provider',
          toEmail: 'reservations@likulikulagoonresort.com.fj',
          recipientName: 'Likuliku Lagoon Resort Reservations',
          subject:
            '🌴 [NEW GUEST RESERVATION] Alexander Wright confirmed at Likuliku Lagoon Resort (Ref: FJ-HAPS-92841)',
          htmlBody: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; color: #1e293b; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0;">
        <div style="background: linear-gradient(135deg, #0d9488, #0f766e); padding: 24px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 20px; font-weight: 800;">FIJI HAPS · GUEST RESERVATION DISPATCH</h1>
          <p style="margin: 4px 0 0 0; font-size: 13px; color: #ccfbf1;">Official Booking Voucher & Arrival Sheet</p>
        </div>
        <div style="padding: 24px;">
          <p style="font-size: 15px; margin-top: 0; color: #0f172a; font-weight: bold;">Bula Vinaka Team Likuliku Lagoon Resort,</p>
          <p style="font-size: 13px; color: #475569; line-height: 1.5;">
            A new guest reservation has been confirmed through the <strong>FIJI HAPS</strong> travel platform.
          </p>
        </div>
      </div>
    `,
          plainText:
            'NEW RESERVATION for Likuliku Lagoon Resort: Guest Alexander Wright, Voucher FJ-HAPS-92841, Dates: 2026-10-14 to 2026-10-18. Over-Water Bure. Operator Share: FJD $6,120.',
          sentAt: new Date(),
          status: 'delivered',
          listingName: 'Likuliku Lagoon Resort',
          grossAmountFjd: 7200,
          operatorShareFjd: 6120,
        },
      ])
      .onConflictDoNothing();
  }
}

export async function ensureSeeded(): Promise<void> {
  if (!seedPromise) {
    seedPromise = ensureSeededInternal().catch((err) => {
      seedPromise = null;
      throw err;
    });
  }
  await seedPromise;
}

export async function getOwnerSettingsRecord() {
  try {
    await ensureSeeded();
    const rows = await db.select().from(ownerSettings).limit(1);
    const row = rows[0];
    let authorizedEmails: string[] = ['sraiqavi@gmail.com'];
    try {
      authorizedEmails = JSON.parse(row.authorizedEmails);
    } catch {
      authorizedEmails = [row.backendEmail.toLowerCase()];
    }
    return {
      id: row.id,
      backendEmail: row.backendEmail,
      senderEmail: row.senderEmail,
      adminNotificationEnabled: row.adminNotificationEnabled,
      providerNotificationEnabled: row.providerNotificationEnabled,
      masterPasscode: row.masterPasscode,
      authorizedEmails,
    };
  } catch (error) {
    console.error('Database query failed (getOwnerSettingsRecord):', error);
    throw new Error('Failed to load owner configuration.', { cause: error });
  }
}

export async function updateOwnerBackendEmailRecord(newEmail: string) {
  try {
    const current = await getOwnerSettingsRecord();
    const trimmed = newEmail.trim();
    const emails = new Set(current.authorizedEmails.map((e) => e.toLowerCase()));
    emails.add(trimmed.toLowerCase());

    const updated = await db
      .update(ownerSettings)
      .set({
        backendEmail: trimmed,
        authorizedEmails: JSON.stringify(Array.from(emails)),
        updatedAt: new Date(),
      })
      .where(eq(ownerSettings.id, current.id))
      .returning();

    return updated[0];
  } catch (error) {
    console.error('Database update failed (updateOwnerBackendEmailRecord):', error);
    throw new Error('Failed to update backend email settings.', { cause: error });
  }
}

export async function updateOwnerPasscodeRecord(newPasscode: string) {
  try {
    const current = await getOwnerSettingsRecord();
    await db
      .update(ownerSettings)
      .set({
        masterPasscode: newPasscode.trim(),
        updatedAt: new Date(),
      })
      .where(eq(ownerSettings.id, current.id));
  } catch (error) {
    console.error('Database update failed (updateOwnerPasscodeRecord):', error);
    throw new Error('Failed to update owner passcode.', { cause: error });
  }
}

export async function getOwnerBankAccountRecord() {
  try {
    await ensureSeeded();
    const rows = await db.select().from(ownerBankAccounts).limit(1);
    const row = rows[0];
    return {
      id: row.id,
      bankName: row.bankName,
      accountHolderName: row.accountHolderName,
      accountNumber: row.accountNumber,
      bsbOrBranchCode: row.bsbOrBranchCode,
      swiftCode: row.swiftCode,
      settlementCurrency: row.settlementCurrency,
      payoutFrequency: row.payoutFrequency,
      status: row.status,
      takeRatePercentage: row.takeRatePercentage,
      totalPayoutsReceivedFjd: row.totalPayoutsReceivedFjd,
      lastTransferDate: row.lastTransferDate.toISOString(),
    };
  } catch (error) {
    console.error('Database query failed (getOwnerBankAccountRecord):', error);
    throw new Error('Failed to load owner bank account details.', { cause: error });
  }
}

export async function updateOwnerBankAccountRecord(input: {
  bankName?: string;
  accountHolderName?: string;
  accountNumber?: string;
  bsbOrBranchCode?: string;
  swiftCode?: string;
  payoutFrequency?: string;
  settlementCurrency?: string;
}) {
  try {
    const current = await getOwnerBankAccountRecord();
    const updated = await db
      .update(ownerBankAccounts)
      .set({
        bankName: input.bankName || current.bankName,
        accountHolderName: input.accountHolderName || current.accountHolderName,
        accountNumber: input.accountNumber || current.accountNumber,
        bsbOrBranchCode: input.bsbOrBranchCode || current.bsbOrBranchCode,
        swiftCode: input.swiftCode || current.swiftCode,
        payoutFrequency: input.payoutFrequency || current.payoutFrequency,
        settlementCurrency: input.settlementCurrency || current.settlementCurrency,
        status: 'active',
      })
      .where(eq(ownerBankAccounts.id, current.id))
      .returning();

    const row = updated[0];
    return {
      bankName: row.bankName,
      accountHolderName: row.accountHolderName,
      accountNumber: row.accountNumber,
      bsbOrBranchCode: row.bsbOrBranchCode,
      swiftCode: row.swiftCode,
      settlementCurrency: row.settlementCurrency,
      payoutFrequency: row.payoutFrequency,
      status: row.status,
      takeRatePercentage: row.takeRatePercentage,
      totalPayoutsReceivedFjd: row.totalPayoutsReceivedFjd,
      lastTransferDate: row.lastTransferDate.toISOString(),
    };
  } catch (error) {
    console.error('Database update failed (updateOwnerBankAccountRecord):', error);
    throw new Error('Failed to update owner bank account.', { cause: error });
  }
}

export async function createOwnerSessionRecord(token: string, ownerEmail: string) {
  try {
    await db.insert(ownerSessions).values({ token, ownerEmail });
  } catch (error) {
    console.error('Database insert failed (createOwnerSessionRecord):', error);
    throw new Error('Failed to create owner session.', { cause: error });
  }
}

export async function findOwnerSessionRecord(token: string) {
  try {
    const rows = await db
      .select()
      .from(ownerSessions)
      .where(eq(ownerSessions.token, token))
      .limit(1);
    return rows[0] || null;
  } catch (error) {
    console.error('Database query failed (findOwnerSessionRecord):', error);
    throw new Error('Failed to verify owner session.', { cause: error });
  }
}

export async function deleteOwnerSessionRecord(token: string) {
  try {
    await db.delete(ownerSessions).where(eq(ownerSessions.token, token));
  } catch (error) {
    console.error('Database delete failed (deleteOwnerSessionRecord):', error);
    throw new Error('Failed to clear owner session.', { cause: error });
  }
}

export async function getBookingsLedgerRecords() {
  try {
    await ensureSeeded();
    const rows = await db
      .select()
      .from(bookings)
      .orderBy(desc(bookings.createdAt), desc(bookings.id));

    return rows.map((row) => ({
      id: row.externalId,
      bookingRef: row.bookingRef,
      customerName: row.customerName,
      listingName: row.listingName,
      grossBookingFjd: row.grossBookingFjd,
      owner15PercentCutFjd: row.owner15PercentCutFjd,
      operatorShareFjd: row.operatorShareFjd,
      status: row.status,
      bankAccountTarget: row.bankAccountTarget,
      transferDate: row.transferDate.toISOString(),
    }));
  } catch (error) {
    console.error('Database query failed (getBookingsLedgerRecords):', error);
    throw new Error('Failed to load bookings ledger.', { cause: error });
  }
}

export async function recordNewBookingAndPayout(input: {
  externalId: string;
  bookingRef: string;
  userId?: number | null;
  customerName: string;
  customerEmail: string;
  listingName: string;
  locationName: string;
  optionSelected: string;
  startDate: string;
  endDate: string;
  grossBookingFjd: number;
  owner15PercentCutFjd: number;
  operatorShareFjd: number;
  bankAccountId: number;
  bankAccountTarget: string;
}) {
  try {
    const now = new Date();
    const inserted = await db
      .insert(bookings)
      .values({
        externalId: input.externalId,
        bookingRef: input.bookingRef,
        userId: input.userId ?? null,
        customerName: input.customerName,
        customerEmail: input.customerEmail,
        listingName: input.listingName,
        locationName: input.locationName,
        optionSelected: input.optionSelected,
        startDate: input.startDate,
        endDate: input.endDate,
        grossBookingFjd: input.grossBookingFjd,
        owner15PercentCutFjd: input.owner15PercentCutFjd,
        operatorShareFjd: input.operatorShareFjd,
        status: 'deposited_to_owner_bank',
        bankAccountTarget: input.bankAccountTarget,
        transferDate: now,
      })
      .returning();

    await db
      .update(ownerBankAccounts)
      .set({
        totalPayoutsReceivedFjd: sql`${ownerBankAccounts.totalPayoutsReceivedFjd} + ${input.owner15PercentCutFjd}`,
        lastTransferDate: now,
      })
      .where(eq(ownerBankAccounts.id, input.bankAccountId));

    return inserted[0];
  } catch (error) {
    console.error('Database insert failed (recordNewBookingAndPayout):', error);
    throw new Error('Failed to record booking.', { cause: error });
  }
}

export async function getDispatchedEmailsRecords() {
  try {
    await ensureSeeded();
    const rows = await db
      .select()
      .from(dispatchedEmails)
      .orderBy(desc(dispatchedEmails.sentAt), desc(dispatchedEmails.id));

    return rows.map((row) => ({
      id: row.externalId,
      bookingRef: row.bookingRef,
      recipientType: row.recipientType as 'backend_admin' | 'provider',
      to: row.toEmail,
      recipientName: row.recipientName,
      subject: row.subject,
      htmlBody: row.htmlBody,
      plainText: row.plainText,
      sentAt: row.sentAt.toISOString(),
      status: row.status as 'delivered' | 'sent',
      listingName: row.listingName,
      grossAmountFjd: row.grossAmountFjd,
      owner15PercentCutFjd: row.owner15PercentCutFjd ?? undefined,
      operatorShareFjd: row.operatorShareFjd ?? undefined,
    }));
  } catch (error) {
    console.error('Database query failed (getDispatchedEmailsRecords):', error);
    throw new Error('Failed to load dispatched emails.', { cause: error });
  }
}

export async function getDispatchedEmailByExternalId(externalId: string) {
  try {
    const rows = await db
      .select()
      .from(dispatchedEmails)
      .where(eq(dispatchedEmails.externalId, externalId))
      .limit(1);
    return rows[0] || null;
  } catch (error) {
    console.error('Database query failed (getDispatchedEmailByExternalId):', error);
    throw new Error('Failed to find email record.', { cause: error });
  }
}

export async function insertDispatchedEmailRecord(input: {
  externalId: string;
  bookingRef: string;
  recipientType: 'backend_admin' | 'provider';
  to: string;
  recipientName: string;
  subject: string;
  htmlBody: string;
  plainText: string;
  status: 'delivered' | 'sent';
  listingName: string;
  grossAmountFjd: number;
  owner15PercentCutFjd?: number;
  operatorShareFjd?: number;
}) {
  try {
    await db.insert(dispatchedEmails).values({
      externalId: input.externalId,
      bookingRef: input.bookingRef,
      recipientType: input.recipientType,
      toEmail: input.to,
      recipientName: input.recipientName,
      subject: input.subject,
      htmlBody: input.htmlBody,
      plainText: input.plainText,
      sentAt: new Date(),
      status: input.status,
      listingName: input.listingName,
      grossAmountFjd: input.grossAmountFjd,
      owner15PercentCutFjd: input.owner15PercentCutFjd ?? null,
      operatorShareFjd: input.operatorShareFjd ?? null,
    });
  } catch (error) {
    console.error('Database insert failed (insertDispatchedEmailRecord):', error);
    throw new Error('Failed to archive dispatched email.', { cause: error });
  }
}
