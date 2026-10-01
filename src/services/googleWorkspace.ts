import { BookingRecord } from '../types';

export interface CalendarEvent {
  id: string;
  summary: string;
  description?: string;
  location?: string;
  start: { dateTime?: string; date?: string };
  end: { dateTime?: string; date?: string };
  htmlLink?: string;
}

export interface GoogleDriveFile {
  id: string;
  name: string;
  mimeType: string;
  webViewLink?: string;
  createdTime?: string;
  size?: string;
}

export interface GooglePersonContact {
  resourceName?: string;
  etag?: string;
  names?: Array<{ displayName: string; givenName?: string; familyName?: string }>;
  emailAddresses?: Array<{ value: string; type?: string }>;
  phoneNumbers?: Array<{ value: string; type?: string }>;
}

// ================= 1. GOOGLE CALENDAR =================

/**
 * List upcoming events from primary Google Calendar
 */
export async function listCalendarEvents(accessToken: string): Promise<CalendarEvent[]> {
  const timeMin = new Date().toISOString();
  const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${encodeURIComponent(timeMin)}&maxResults=15&singleEvents=true&orderBy=startTime`;
  
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Google Calendar API error (${res.status}): ${errorText}`);
  }

  const data = await res.json();
  return data.items || [];
}

/**
 * Add a confirmed FIJI HAPS booking to Google Calendar
 */
export async function addBookingToCalendar(
  booking: BookingRecord, 
  accessToken: string
): Promise<CalendarEvent> {
  const startDateTime = booking.startDate.includes('T') 
    ? booking.startDate 
    : `${booking.startDate}T10:00:00+12:00`; // Fiji Timezone UTC+12

  const endDateTime = booking.endDate 
    ? (booking.endDate.includes('T') ? booking.endDate : `${booking.endDate}T14:00:00+12:00`)
    : `${booking.startDate}T13:00:00+12:00`;

  const eventPayload = {
    summary: `🌴 Fiji: ${booking.listingName} (${booking.subType})`,
    description: `Official FIJI HAPS Reservation\nVoucher Code: ${booking.voucherCode}\nPackage: ${booking.optionSelected}\nGuests: ${booking.guests.adults} Adults, ${booking.guests.children} Children\nTotal Price: FJD $${booking.totalPriceFjd.toLocaleString()}\nStatus: Confirmed & Guaranteed\nLocation: ${booking.locationName}\nGuest: ${booking.guestInfo.fullName} (${booking.guestInfo.phone})`,
    location: `${booking.listingName}, ${booking.locationName}, Fiji`,
    start: {
      dateTime: startDateTime,
      timeZone: 'Pacific/Fiji'
    },
    end: {
      dateTime: endDateTime,
      timeZone: 'Pacific/Fiji'
    },
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'popup', minutes: 24 * 60 }, // 1 day before
        { method: 'popup', minutes: 120 }       // 2 hours before
      ]
    }
  };

  const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(eventPayload)
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to create Calendar event: ${errorText}`);
  }

  return await res.json();
}

/**
 * Delete a Calendar event with user confirmation
 */
export async function deleteCalendarEvent(
  eventId: string, 
  eventSummary: string, 
  accessToken: string
): Promise<boolean> {
  const confirmed = window.confirm(
    `Are you sure you want to remove "${eventSummary}" from your Google Calendar? This action cannot be undone.`
  );
  if (!confirmed) return false;

  const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${accessToken}` }
  });

  if (!res.ok && res.status !== 204) {
    throw new Error(`Failed to delete event: ${await res.text()}`);
  }
  return true;
}

// ================= 2. GOOGLE SHEETS =================

/**
 * Create a new Google Spreadsheet for Fiji Trip Itinerary & Expenses
 */
export async function createFijiTripSpreadsheet(
  title: string,
  bookings: BookingRecord[],
  accessToken: string
): Promise<{ spreadsheetId: string; spreadsheetUrl: string }> {
  // 1. Create spreadsheet structure
  const createPayload = {
    properties: {
      title: title || `FIJI HAPS - Travel Itinerary & Expense Tracker (${new Date().getFullYear()})`
    },
    sheets: [
      {
        properties: {
          title: 'Confirmed Reservations',
          gridProperties: { rowCount: 50, columnCount: 10 }
        }
      },
      {
        properties: {
          title: 'Fiji Budget & Expenses',
          gridProperties: { rowCount: 50, columnCount: 8 }
        }
      }
    ]
  };

  const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(createPayload)
  });

  if (!createRes.ok) {
    throw new Error(`Failed to create Google Sheet: ${await createRes.text()}`);
  }

  const sheetData = await createRes.json();
  const spreadsheetId = sheetData.spreadsheetId;
  const spreadsheetUrl = sheetData.spreadsheetUrl;

  // 2. Populate Header and Initial Bookings Data
  const rows = [
    ['Voucher Code', 'Experience / Hotel', 'Category', 'Location', 'Dates / Duration', 'Package Selected', 'Adults', 'Children', 'Total Price (FJD)', 'Lead Guest', 'Booking Status'],
    ...bookings.map(b => [
      b.voucherCode,
      b.listingName,
      b.subType,
      b.locationName,
      `${b.startDate} to ${b.endDate || b.timeSlot || 'Day'}`,
      b.optionSelected,
      b.guests.adults,
      b.guests.children,
      b.totalPriceFjd,
      b.guestInfo.fullName,
      'Confirmed'
    ])
  ];

  await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'Confirmed Reservations'!A1:append?valueInputOption=USER_ENTERED`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ values: rows })
  });

  // Populate Fiji Budget & Expenses template
  const budgetRows = [
    ['Expense Item', 'Category', 'Target Budget (FJD)', 'Actual Spent (FJD)', 'Payment Method', 'Notes'],
    ['Resort Accommodation (Total)', 'Accommodation', 7500, 7200, 'FIJI HAPS In-App', 'Likuliku Lagoon Overwater Bure'],
    ['Island Hopping & Diving Charters', 'Activities', 1500, 1200, 'FIJI HAPS In-App', 'Cloud 9 + Manta Ray Snorkel'],
    ['Fiji Village Sevusevu Gift (Kava Waka)', 'Cultural', 150, 100, 'Cash (FJD)', 'Half-kilo dried waka roots for Chief'],
    ['Local Dining & Fresh Seafood', 'Dining', 900, 650, 'Card / Cash', 'Kokoda, grilled mahi-mahi, lovo feast'],
    ['Taxis & Local Buses (eTicketing)', 'Transport', 250, 180, 'Cash / Vodafone card', 'Coral Coast shuttle & Nadi taxis']
  ];

  await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'Fiji Budget & Expenses'!A1:append?valueInputOption=USER_ENTERED`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ values: budgetRows })
  });

  return { spreadsheetId, spreadsheetUrl };
}

/**
 * Append a newly booked reservation to an existing Google Spreadsheet
 */
export async function appendBookingToSheet(
  spreadsheetId: string,
  booking: BookingRecord,
  accessToken: string
) {
  const row = [[
    booking.voucherCode,
    booking.listingName,
    booking.subType,
    booking.locationName,
    `${booking.startDate} to ${booking.endDate || booking.timeSlot || 'Day'}`,
    booking.optionSelected,
    booking.guests.adults,
    booking.guests.children,
    booking.totalPriceFjd,
    booking.guestInfo.fullName,
    'Confirmed'
  ]];

  const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'Confirmed Reservations'!A1:append?valueInputOption=USER_ENTERED`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ values: row })
  });

  if (!res.ok) {
    throw new Error(`Failed to append row to Google Sheet: ${await res.text()}`);
  }
  return await res.json();
}

// ================= 3. GOOGLE DRIVE =================

/**
 * List Fiji Travel files in user's Google Drive
 */
export async function listFijiDriveFiles(accessToken: string): Promise<GoogleDriveFile[]> {
  const query = encodeURIComponent("name contains 'FIJI HAPS' or name contains 'Fiji' and trashed = false");
  const url = `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,mimeType,webViewLink,createdTime,size)&pageSize=20&orderBy=createdTime desc`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });

  if (!res.ok) {
    throw new Error(`Failed to list Google Drive files: ${await res.text()}`);
  }

  const data = await res.json();
  return data.files || [];
}

/**
 * Save an official Digital Travel Voucher to Google Drive as Markdown/Text document
 */
export async function saveVoucherToDrive(
  booking: BookingRecord,
  accessToken: string
): Promise<GoogleDriveFile> {
  const fileContent = `=====================================================
FIJI HAPS OFFICIAL TRAVEL VOUCHER & BOARDING PASS
Everything Fiji · All in One Place
=====================================================

BOOKING VOUCHER CODE : ${booking.voucherCode}
STATUS               : CONFIRMED & GUARANTEED
DATE ISSUED          : ${new Date().toLocaleString()}

EXPERIENCE DETAILS:
- Place / Experience : ${booking.listingName}
- Category           : ${booking.subType} (${booking.category.toUpperCase()})
- Location           : ${booking.locationName}, Fiji Islands
- Selected Package   : ${booking.optionSelected}
- Travel Dates       : ${booking.startDate} ${booking.endDate ? `to ${booking.endDate}` : `(${booking.timeSlot || 'Day'})`}
- Guests             : ${booking.guests.adults} Adults, ${booking.guests.children} Children

FINANCIAL SUMMARY:
- Total Amount       : FJD $${booking.totalPriceFjd.toLocaleString()}
- Payment Method     : ${booking.paymentMethod === 'pay_on_arrival' ? 'Pay upon Check-in in Fiji' : 'Paid & Guaranteed in Full via FIJI HAPS'}

LEAD GUEST DETAILS:
- Full Name          : ${booking.guestInfo.fullName}
- Contact Email      : ${booking.guestInfo.email}
- Contact Phone      : ${booking.guestInfo.phone}
- Nationality        : ${booking.guestInfo.country}
- Inbound Flight     : ${booking.guestInfo.flightNumber || 'None provided'}
- Special Requests   : ${booking.guestInfo.specialRequests || 'None'}

EMERGENCY SUPPORT & CONTACTS:
- Fiji Emergency (Ambulance/Police) : 911 / 917
- Tourist Police Unit               : +679 672 2544
- FIJI HAPS Support                 : support@fijihaps.com

Vinaka Vakalevu and Enjoy Your Stay in Fiji!
=====================================================
`;

  const metadata = {
    name: `FIJI HAPS Voucher - ${booking.listingName} (${booking.voucherCode}).txt`,
    mimeType: 'text/plain'
  };

  const form = new FormData();
  form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
  form.append('file', new Blob([fileContent], { type: 'text/plain' }));

  const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,webViewLink,createdTime', {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}` },
    body: form
  });

  if (!res.ok) {
    throw new Error(`Failed to upload voucher to Google Drive: ${await res.text()}`);
  }

  return await res.json();
}

/**
 * Delete a file from Google Drive with mandatory user confirmation dialog
 */
export async function deleteDriveFile(
  fileId: string,
  fileName: string,
  accessToken: string
): Promise<boolean> {
  const confirmed = window.confirm(
    `Are you sure you want to permanently delete "${fileName}" from your Google Drive? This action cannot be undone.`
  );
  if (!confirmed) return false;

  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${accessToken}` }
  });

  if (!res.ok && res.status !== 204) {
    throw new Error(`Failed to delete Drive file: ${await res.text()}`);
  }
  return true;
}

// ================= 4. GOOGLE CONTACTS (PEOPLE API) =================

/**
 * List contacts from Google People API
 */
export async function listGoogleContacts(accessToken: string): Promise<GooglePersonContact[]> {
  const url = `https://people.googleapis.com/v1/people/me/connections?personFields=names,emailAddresses,phoneNumbers&pageSize=50`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch Google Contacts: ${await res.text()}`);
  }

  const data = await res.json();
  return data.connections || [];
}

/**
 * Sync official Fiji Emergency & Concierge contacts into user's Google Contacts
 */
export async function syncFijiEmergencyContacts(
  accessToken: string
): Promise<{ addedCount: number; contactNames: string[] }> {
  const FIJI_EMERGENCY_LIST = [
    {
      givenName: 'Fiji Tourist Police',
      familyName: 'Emergency Unit',
      phone: '+679 672 2544',
      email: 'touristpolice@police.gov.fj'
    },
    {
      givenName: 'Colonial War Memorial (CWM) Hospital',
      familyName: 'Suva',
      phone: '+679 331 3444',
      email: 'info@health.gov.fj'
    },
    {
      givenName: 'Nadi Hospital',
      familyName: 'Emergency Dept',
      phone: '+679 670 1128',
      email: 'nadihospital@health.gov.fj'
    },
    {
      givenName: 'FIJI HAPS Concierge',
      familyName: 'Visitor Support',
      phone: '+679 999 8888',
      email: 'support@fijihaps.com'
    }
  ];

  const confirmed = window.confirm(
    `Sync 4 essential Fiji Emergency & Concierge contacts (Tourist Police, CWM Hospital Suva, Nadi Hospital, FIJI HAPS Support) into your Google Contacts?`
  );
  if (!confirmed) return { addedCount: 0, contactNames: [] };

  const addedNames: string[] = [];

  for (const c of FIJI_EMERGENCY_LIST) {
    const contactPayload = {
      names: [{ givenName: c.givenName, familyName: c.familyName }],
      phoneNumbers: [{ value: c.phone, type: 'work' }],
      emailAddresses: [{ value: c.email, type: 'work' }]
    };

    try {
      const res = await fetch('https://people.googleapis.com/v1/people:createContact', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(contactPayload)
      });
      if (res.ok) {
        addedNames.push(`${c.givenName} ${c.familyName}`);
      }
    } catch (e) {
      console.error(`Failed to add contact ${c.givenName}:`, e);
    }
  }

  return { addedCount: addedNames.length, contactNames: addedNames };
}
