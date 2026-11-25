import { relations } from 'drizzle-orm';
import {
  boolean,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';

// Authenticated users linked to Firebase Auth UID
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(),
  email: text('email').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Owner backend configuration and authentication settings
export const ownerSettings = pgTable('owner_settings', {
  id: serial('id').primaryKey(),
  backendEmail: text('backend_email').notNull(),
  senderEmail: text('sender_email').notNull(),
  adminNotificationEnabled: boolean('admin_notification_enabled').default(true).notNull(),
  providerNotificationEnabled: boolean('provider_notification_enabled').default(true).notNull(),
  masterPasscode: text('master_passcode').notNull(),
  authorizedEmails: text('authorized_emails').notNull(), // JSON array of authorized emails
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Owner payout bank account configuration
export const ownerBankAccounts = pgTable('owner_bank_accounts', {
  id: serial('id').primaryKey(),
  bankName: text('bank_name').notNull(),
  accountHolderName: text('account_holder_name').notNull(),
  accountNumber: text('account_number').notNull(),
  bsbOrBranchCode: text('bsb_or_branch_code').notNull(),
  swiftCode: text('swift_code').notNull(),
  settlementCurrency: text('settlement_currency').default('FJD').notNull(),
  payoutFrequency: text('payout_frequency').notNull(),
  status: text('status').default('active').notNull(),
  takeRatePercentage: integer('take_rate_percentage').default(15).notNull(),
  totalPayoutsReceivedFjd: integer('total_payouts_received_fjd').default(0).notNull(),
  lastTransferDate: timestamp('last_transfer_date').defaultNow().notNull(),
});

// Confirmed bookings and 15% owner payout ledger
export const bookings = pgTable('bookings', {
  id: serial('id').primaryKey(),
  externalId: text('external_id').notNull().unique(),
  bookingRef: text('booking_ref').notNull(),
  userId: integer('user_id').references(() => users.id),
  customerName: text('customer_name').notNull(),
  customerEmail: text('customer_email').notNull(),
  listingName: text('listing_name').notNull(),
  locationName: text('location_name').notNull(),
  optionSelected: text('option_selected').notNull(),
  startDate: text('start_date').notNull(),
  endDate: text('end_date').notNull(),
  grossBookingFjd: integer('gross_booking_fjd').notNull(),
  owner15PercentCutFjd: integer('owner_15_percent_cut_fjd').notNull(),
  operatorShareFjd: integer('operator_share_fjd').notNull(),
  status: text('status').default('deposited_to_owner_bank').notNull(),
  bankAccountTarget: text('bank_account_target').notNull(),
  transferDate: timestamp('transfer_date').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Dispatched backend and provider notification emails log
export const dispatchedEmails = pgTable('dispatched_emails', {
  id: serial('id').primaryKey(),
  externalId: text('external_id').notNull().unique(),
  bookingRef: text('booking_ref').notNull(),
  recipientType: text('recipient_type').notNull(), // 'backend_admin' | 'provider'
  toEmail: text('to_email').notNull(),
  recipientName: text('recipient_name').notNull(),
  subject: text('subject').notNull(),
  htmlBody: text('html_body').notNull(),
  plainText: text('plain_text').notNull(),
  sentAt: timestamp('sent_at').defaultNow().notNull(),
  status: text('status').default('delivered').notNull(),
  listingName: text('listing_name').notNull(),
  grossAmountFjd: integer('gross_amount_fjd').notNull(),
  owner15PercentCutFjd: integer('owner_15_percent_cut_fjd'),
  operatorShareFjd: integer('operator_share_fjd'),
});

// Active owner portal sessions
export const ownerSessions = pgTable('owner_sessions', {
  id: serial('id').primaryKey(),
  token: text('token').notNull().unique(),
  ownerEmail: text('owner_email').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Drizzle Relations
export const usersRelations = relations(users, ({ many }) => ({
  bookings: many(bookings),
}));

export const bookingsRelations = relations(bookings, ({ one }) => ({
  user: one(users, {
    fields: [bookings.userId],
    references: [users.id],
  }),
}));
