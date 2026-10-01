import React, { useState, useEffect } from 'react';
import { 
  X, 
  Calendar, 
  Table2, 
  HardDrive, 
  Users, 
  CheckCircle2, 
  ExternalLink, 
  RefreshCw, 
  Plus, 
  Trash2, 
  FileText, 
  LogOut, 
  Check, 
  Download, 
  ShieldCheck, 
  AlertCircle,
  Clock,
  MapPin,
  Sparkles
} from 'lucide-react';
import { BookingRecord } from '../types';
import { 
  googleSignIn, 
  getAccessToken, 
  logout, 
  initAuth 
} from '../services/googleAuth';
import { 
  CalendarEvent, 
  GoogleDriveFile, 
  GooglePersonContact,
  listCalendarEvents, 
  addBookingToCalendar, 
  deleteCalendarEvent,
  createFijiTripSpreadsheet, 
  listFijiDriveFiles, 
  saveVoucherToDrive, 
  deleteDriveFile,
  listGoogleContacts, 
  syncFijiEmergencyContacts 
} from '../services/googleWorkspace';
import { User } from 'firebase/auth';

interface GoogleWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookings: BookingRecord[];
  onSelectContactForGuest?: (name: string, email: string, phone: string) => void;
}

export const GoogleWorkspaceModal: React.FC<GoogleWorkspaceModalProps> = ({
  isOpen,
  onClose,
  bookings,
  onSelectContactForGuest
}) => {
  const [activeTab, setActiveTab] = useState<'calendar' | 'sheets' | 'drive' | 'contacts'>('calendar');
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Workspace Data States
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [driveFiles, setDriveFiles] = useState<GoogleDriveFile[]>([]);
  const [contacts, setContacts] = useState<GooglePersonContact[]>([]);
  const [spreadsheetInfo, setSpreadsheetInfo] = useState<{ id: string; url: string } | null>(() => {
    try {
      const stored = localStorage.getItem('fiji_haps_google_sheet');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  // Action loading states
  const [isSyncingCalendar, setIsSyncingCalendar] = useState(false);
  const [isCreatingSheet, setIsCreatingSheet] = useState(false);
  const [isSavingVouchers, setIsSavingVouchers] = useState(false);
  const [isSyncingContacts, setIsSyncingContacts] = useState(false);

  // Initialize Auth state listener
  useEffect(() => {
    const unsubscribe = initAuth(
      (u, token) => {
        setUser(u);
        setAccessToken(token);
      },
      () => {
        setUser(null);
        setAccessToken(null);
      }
    );
    return () => unsubscribe();
  }, []);

  // Fetch data when token is available or tab changes
  const loadTabContent = async (token: string, tab: string) => {
    setIsLoadingData(true);
    setStatusMessage(null);
    try {
      if (tab === 'calendar') {
        const events = await listCalendarEvents(token);
        setCalendarEvents(events);
      } else if (tab === 'drive') {
        const files = await listFijiDriveFiles(token);
        setDriveFiles(files);
      } else if (tab === 'contacts') {
        const conns = await listGoogleContacts(token);
        setContacts(conns);
      }
    } catch (err: any) {
      console.error('Error fetching Workspace data:', err);
      setStatusMessage({ text: err.message || 'Error loading Google Workspace data', type: 'error' });
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    if (accessToken && isOpen) {
      loadTabContent(accessToken, activeTab);
    }
  }, [accessToken, activeTab, isOpen]);

  // Google Sign In handler
  const handleGoogleSignIn = async () => {
    setIsAuthenticating(true);
    setStatusMessage(null);
    try {
      const res = await googleSignIn();
      if (res) {
        setUser(res.user);
        setAccessToken(res.accessToken);
        setStatusMessage({ text: `Connected as ${res.user.displayName || res.user.email}!`, type: 'success' });
        loadTabContent(res.accessToken, activeTab);
      }
    } catch (err: any) {
      console.error('Sign-in error:', err);
      setStatusMessage({ text: err.message || 'Failed to sign in to Google Workspace', type: 'error' });
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Google Sign Out handler
  const handleLogout = async () => {
    await logout();
    setUser(null);
    setAccessToken(null);
    setCalendarEvents([]);
    setDriveFiles([]);
    setContacts([]);
    setStatusMessage({ text: 'Signed out of Google Workspace.', type: 'success' });
  };

  // 1. Sync Bookings to Google Calendar
  const handleSyncAllBookingsToCalendar = async () => {
    if (!accessToken) return;
    if (bookings.length === 0) {
      setStatusMessage({ text: 'No bookings in your itinerary to sync yet.', type: 'error' });
      return;
    }

    setIsSyncingCalendar(true);
    setStatusMessage(null);
    try {
      let count = 0;
      for (const booking of bookings) {
        await addBookingToCalendar(booking, accessToken);
        count++;
      }
      setStatusMessage({ text: `Successfully synced ${count} Fiji booking(s) to your Google Calendar!`, type: 'success' });
      await loadTabContent(accessToken, 'calendar');
    } catch (err: any) {
      setStatusMessage({ text: err.message || 'Failed to sync to Calendar', type: 'error' });
    } finally {
      setIsSyncingCalendar(false);
    }
  };

  // Delete Calendar Event
  const handleDeleteCalendarEvent = async (event: CalendarEvent) => {
    if (!accessToken) return;
    try {
      const deleted = await deleteCalendarEvent(event.id, event.summary, accessToken);
      if (deleted) {
        setCalendarEvents(prev => prev.filter(e => e.id !== event.id));
        setStatusMessage({ text: `Removed "${event.summary}" from Google Calendar.`, type: 'success' });
      }
    } catch (err: any) {
      setStatusMessage({ text: err.message || 'Failed to delete event', type: 'error' });
    }
  };

  // 2. Create Trip Spreadsheet in Google Sheets
  const handleCreateGoogleSheet = async () => {
    if (!accessToken) return;
    setIsCreatingSheet(true);
    setStatusMessage(null);
    try {
      const res = await createFijiTripSpreadsheet(
        `FIJI HAPS - Travel Itinerary & Expense Tracker (${new Date().getFullYear()})`,
        bookings,
        accessToken
      );
      setSpreadsheetInfo({ id: res.spreadsheetId, url: res.spreadsheetUrl });
      localStorage.setItem('fiji_haps_google_sheet', JSON.stringify({ id: res.spreadsheetId, url: res.spreadsheetUrl }));
      setStatusMessage({ text: 'Created "FIJI HAPS - Travel Itinerary & Expense Tracker" in your Google Drive!', type: 'success' });
    } catch (err: any) {
      setStatusMessage({ text: err.message || 'Failed to create Google Sheet', type: 'error' });
    } finally {
      setIsCreatingSheet(false);
    }
  };

  // 3. Save Vouchers to Google Drive
  const handleSaveAllVouchersToDrive = async () => {
    if (!accessToken) return;
    if (bookings.length === 0) {
      setStatusMessage({ text: 'No bookings to save to Google Drive yet.', type: 'error' });
      return;
    }

    setIsSavingVouchers(true);
    setStatusMessage(null);
    try {
      let count = 0;
      for (const booking of bookings) {
        await saveVoucherToDrive(booking, accessToken);
        count++;
      }
      setStatusMessage({ text: `Saved ${count} digital voucher document(s) directly to your Google Drive!`, type: 'success' });
      await loadTabContent(accessToken, 'drive');
    } catch (err: any) {
      setStatusMessage({ text: err.message || 'Failed to upload vouchers to Google Drive', type: 'error' });
    } finally {
      setIsSavingVouchers(false);
    }
  };

  // Delete Drive File
  const handleDeleteDriveFile = async (file: GoogleDriveFile) => {
    if (!accessToken) return;
    try {
      const deleted = await deleteDriveFile(file.id, file.name, accessToken);
      if (deleted) {
        setDriveFiles(prev => prev.filter(f => f.id !== file.id));
        setStatusMessage({ text: `Deleted "${file.name}" from Google Drive.`, type: 'success' });
      }
    } catch (err: any) {
      setStatusMessage({ text: err.message || 'Failed to delete Drive file', type: 'error' });
    }
  };

  // 4. Sync Emergency Contacts to Google Contacts
  const handleSyncEmergencyContacts = async () => {
    if (!accessToken) return;
    setIsSyncingContacts(true);
    setStatusMessage(null);
    try {
      const res = await syncFijiEmergencyContacts(accessToken);
      if (res.addedCount > 0) {
        setStatusMessage({ 
          text: `Added ${res.addedCount} emergency contacts (Tourist Police, CWM Hospital, Nadi Hospital, Concierge) to your Google Contacts!`, 
          type: 'success' 
        });
        await loadTabContent(accessToken, 'contacts');
      }
    } catch (err: any) {
      setStatusMessage({ text: err.message || 'Failed to sync Google Contacts', type: 'error' });
    } finally {
      setIsSyncingContacts(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white text-slate-900 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200">
        
        {/* Header Bar */}
        <div className="bg-slate-900 text-white px-5 sm:px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-emerald-500 to-amber-500 flex items-center justify-center shadow-md">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-heading font-extrabold text-base sm:text-lg text-white">
                  Google Workspace Travel Hub
                </h3>
                <span className="text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded-full">
                  Drive · Sheets · Calendar · Contacts
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Sync your Fiji bookings, spreadsheets, emergency contacts & travel vault to Google.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {user && (
              <button
                onClick={handleLogout}
                className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                title="Sign out of Google"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Auth Banner & Status */}
        {!user ? (
          <div className="bg-gradient-to-r from-blue-50 via-teal-50 to-slate-50 p-5 sm:p-6 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <h4 className="font-heading font-extrabold text-slate-900 text-base">
                Connect Your Google Account
              </h4>
              <p className="text-xs text-slate-600 max-w-lg leading-relaxed">
                Sign in with permission to sync your Fiji trip reservations to <strong>Google Calendar</strong>, create live budget spreadsheets in <strong>Google Sheets</strong>, backup vouchers to <strong>Google Drive</strong>, and sync local emergency contacts to <strong>Google Contacts</strong>.
              </p>
            </div>

            {/* Official Google Material Sign-In Button */}
            <button
              onClick={handleGoogleSignIn}
              disabled={isAuthenticating}
              className="px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs sm:text-sm rounded-xl border border-slate-300 shadow-sm hover:shadow transition-all flex items-center gap-2.5 cursor-pointer disabled:opacity-50 shrink-0"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
              </svg>
              <span>{isAuthenticating ? 'Authorizing...' : 'Sign in with Google'}</span>
            </button>
          </div>
        ) : (
          <div className="bg-slate-50 px-5 py-2.5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs overflow-hidden">
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName || 'Google'} className="w-full h-full object-cover" />
                ) : (
                  (user.displayName?.[0] || user.email?.[0] || 'G').toUpperCase()
                )}
              </div>
              <div>
                <span className="font-bold text-slate-900">{user.displayName || 'Google User'}</span>
                <span className="text-slate-500 font-mono text-[11px] ml-1.5">({user.email})</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-emerald-700 font-semibold text-[11px]">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Workspace APIs Connected (Drive, Sheets, Calendar, Contacts)</span>
            </div>
          </div>
        )}

        {/* Notification Alert */}
        {statusMessage && (
          <div className={`px-5 py-2 text-xs flex items-center gap-2 border-b animate-in fade-in ${
            statusMessage.type === 'success' 
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}>
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span className="flex-1">{statusMessage.text}</span>
            <button onClick={() => setStatusMessage(null)} className="text-slate-400 hover:text-slate-600">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Workspace Feature Navigation Tabs */}
        <div className="px-5 sm:px-6 pt-3 flex items-center justify-between border-b border-slate-200 shrink-0 bg-slate-50/50">
          <div className="flex gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar">
            
            {/* Calendar Tab */}
            <button
              onClick={() => setActiveTab('calendar')}
              className={`px-3 sm:px-4 py-2 text-xs font-bold rounded-t-xl transition-all border-b-2 flex items-center gap-2 shrink-0 ${
                activeTab === 'calendar'
                  ? 'border-blue-600 text-blue-600 bg-white shadow-sm'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <Calendar className="w-3.5 h-3.5 text-blue-600" />
              <span>Google Calendar</span>
            </button>

            {/* Sheets Tab */}
            <button
              onClick={() => setActiveTab('sheets')}
              className={`px-3 sm:px-4 py-2 text-xs font-bold rounded-t-xl transition-all border-b-2 flex items-center gap-2 shrink-0 ${
                activeTab === 'sheets'
                  ? 'border-emerald-600 text-emerald-600 bg-white shadow-sm'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <Table2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Google Sheets</span>
            </button>

            {/* Drive Tab */}
            <button
              onClick={() => setActiveTab('drive')}
              className={`px-3 sm:px-4 py-2 text-xs font-bold rounded-t-xl transition-all border-b-2 flex items-center gap-2 shrink-0 ${
                activeTab === 'drive'
                  ? 'border-amber-500 text-amber-600 bg-white shadow-sm'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <HardDrive className="w-3.5 h-3.5 text-amber-500" />
              <span>Google Drive Vault</span>
            </button>

            {/* Contacts Tab */}
            <button
              onClick={() => setActiveTab('contacts')}
              className={`px-3 sm:px-4 py-2 text-xs font-bold rounded-t-xl transition-all border-b-2 flex items-center gap-2 shrink-0 ${
                activeTab === 'contacts'
                  ? 'border-indigo-600 text-indigo-600 bg-white shadow-sm'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-indigo-600" />
              <span>Google Contacts</span>
            </button>

          </div>

          {accessToken && (
            <button
              onClick={() => loadTabContent(accessToken, activeTab)}
              disabled={isLoadingData}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
              title="Refresh Google Workspace data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingData ? 'animate-spin' : ''}`} />
            </button>
          )}
        </div>

        {/* Tab Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
          
          {/* ================= 1. GOOGLE CALENDAR ================= */}
          {activeTab === 'calendar' && (
            <div className="space-y-4">
              
              {/* Actions Card */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50/40 p-4 sm:p-5 rounded-2xl border border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="font-heading font-extrabold text-sm sm:text-base text-slate-900 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    <span>Sync Fiji Itinerary to Google Calendar</span>
                  </h4>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Automatically schedules your confirmed resort stays, dive charters, and tours into your personal Google Calendar with Fiji Time reminders.
                  </p>
                </div>

                <button
                  onClick={accessToken ? handleSyncAllBookingsToCalendar : handleGoogleSignIn}
                  disabled={isSyncingCalendar || bookings.length === 0}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-300 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 shrink-0 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>{isSyncingCalendar ? 'Syncing to Calendar...' : `Sync ${bookings.length} Booking(s) to Calendar`}</span>
                </button>
              </div>

              {/* Upcoming Calendar Events List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h5 className="font-heading font-bold text-xs text-slate-700 uppercase tracking-wider">
                    Upcoming Events on Your Google Calendar ({calendarEvents.length})
                  </h5>
                  <a
                    href="https://calendar.google.com"
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    <span>Open Google Calendar</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                {!accessToken ? (
                  <div className="bg-slate-50 p-8 rounded-2xl border border-dashed border-slate-300 text-center text-xs text-slate-500 space-y-2">
                    <Calendar className="w-8 h-8 text-slate-400 mx-auto" />
                    <p>Sign in with Google above to view and sync with your Google Calendar events.</p>
                  </div>
                ) : calendarEvents.length === 0 ? (
                  <div className="bg-slate-50 p-8 rounded-2xl border border-slate-200 text-center text-xs text-slate-500">
                    No upcoming events found on your Google Calendar. Tap "Sync Bookings" above to schedule your Fiji reservations!
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                    {calendarEvents.map(evt => (
                      <div key={evt.id} className="p-3.5 hover:bg-slate-50/80 transition-colors flex items-center justify-between gap-3 text-xs">
                        <div className="space-y-0.5 min-w-0">
                          <div className="font-bold text-slate-900 text-sm truncate flex items-center gap-1.5">
                            <span>{evt.summary}</span>
                          </div>
                          <div className="flex flex-wrap items-center gap-x-3 text-slate-500 text-[11px]">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-blue-600" />
                              {evt.start.dateTime 
                                ? new Date(evt.start.dateTime).toLocaleDateString() + ' ' + new Date(evt.start.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                : evt.start.date}
                            </span>
                            {evt.location && (
                              <span className="flex items-center gap-1 truncate max-w-xs">
                                <MapPin className="w-3 h-3 text-emerald-600" />
                                {evt.location}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {evt.htmlLink && (
                            <a
                              href={evt.htmlLink}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-100 transition-colors"
                              title="Open event in Google Calendar"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          )}
                          <button
                            onClick={() => handleDeleteCalendarEvent(evt)}
                            className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-slate-100 transition-colors"
                            title="Remove from Calendar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* ================= 2. GOOGLE SHEETS ================= */}
          {activeTab === 'sheets' && (
            <div className="space-y-4">
              
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50/50 p-4 sm:p-5 rounded-2xl border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h4 className="font-heading font-extrabold text-sm sm:text-base text-slate-900 flex items-center gap-2">
                    <Table2 className="w-4 h-4 text-emerald-600" />
                    <span>Travel Spreadsheet & Expense Tracker</span>
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Creates an interactive Google Spreadsheet in your Google Drive with tabs for <strong>Confirmed Reservations</strong> and <strong>Fiji Budget & Expenses</strong> (FJD).
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  {spreadsheetInfo && (
                    <a
                      href={spreadsheetInfo.url}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3.5 py-2.5 bg-white text-emerald-800 border border-emerald-300 font-bold text-xs rounded-xl shadow-sm hover:bg-emerald-50 transition-colors flex items-center gap-1.5"
                    >
                      <span>Open in Google Sheets</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}

                  <button
                    onClick={accessToken ? handleCreateGoogleSheet : handleGoogleSignIn}
                    disabled={isCreatingSheet}
                    className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-300 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{isCreatingSheet ? 'Creating Sheet...' : spreadsheetInfo ? 'Recreate Sheet' : 'Create Google Sheet'}</span>
                  </button>
                </div>
              </div>

              {/* Preview of Sheet Structure */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Spreadsheet Columns Preview:
                </span>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                    <thead className="bg-slate-100 text-slate-600 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                      <tr>
                        <th className="px-3 py-2.5">Voucher</th>
                        <th className="px-3 py-2.5">Experience / Hotel</th>
                        <th className="px-3 py-2.5">Category</th>
                        <th className="px-3 py-2.5">Dates</th>
                        <th className="px-3 py-2.5 text-right">Total (FJD)</th>
                        <th className="px-3 py-2.5">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {bookings.length > 0 ? (
                        bookings.map(b => (
                          <tr key={b.id} className="hover:bg-slate-50">
                            <td className="px-3 py-2 font-mono font-bold text-slate-900">{b.voucherCode}</td>
                            <td className="px-3 py-2 font-semibold text-slate-900">{b.listingName}</td>
                            <td className="px-3 py-2 text-slate-500">{b.subType}</td>
                            <td className="px-3 py-2 text-slate-600">{b.startDate}</td>
                            <td className="px-3 py-2 text-right font-mono font-bold text-emerald-700">FJD ${b.totalPriceFjd.toLocaleString()}</td>
                            <td className="px-3 py-2 text-emerald-600 font-bold">Confirmed</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="px-3 py-4 text-center text-slate-400">
                            Bookings in your itinerary will be exported into this Google Spreadsheet format.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* ================= 3. GOOGLE DRIVE ================= */}
          {activeTab === 'drive' && (
            <div className="space-y-4">
              
              <div className="bg-gradient-to-r from-amber-50 to-orange-50/40 p-4 sm:p-5 rounded-2xl border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h4 className="font-heading font-extrabold text-sm sm:text-base text-slate-900 flex items-center gap-2">
                    <HardDrive className="w-4 h-4 text-amber-600" />
                    <span>FIJI HAPS Google Drive Vault</span>
                  </h4>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Save official digital vouchers, boarding receipts, and trip itineraries directly to your personal Google Drive for offline access.
                  </p>
                </div>

                <button
                  onClick={accessToken ? handleSaveAllVouchersToDrive : handleGoogleSignIn}
                  disabled={isSavingVouchers || bookings.length === 0}
                  className="px-4 py-2.5 bg-amber-600 hover:bg-amber-500 disabled:bg-slate-300 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 shrink-0 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>{isSavingVouchers ? 'Saving to Drive...' : `Save ${bookings.length} Voucher(s) to Drive`}</span>
                </button>
              </div>

              {/* Files in Drive */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h5 className="font-heading font-bold text-xs text-slate-700 uppercase tracking-wider">
                    Fiji Documents in Your Google Drive ({driveFiles.length})
                  </h5>
                  <a
                    href="https://drive.google.com"
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-semibold text-amber-700 hover:text-amber-900 flex items-center gap-1"
                  >
                    <span>Open Google Drive</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                {!accessToken ? (
                  <div className="bg-slate-50 p-8 rounded-2xl border border-dashed border-slate-300 text-center text-xs text-slate-500 space-y-2">
                    <HardDrive className="w-8 h-8 text-slate-400 mx-auto" />
                    <p>Sign in with Google above to access and save vouchers to your Google Drive.</p>
                  </div>
                ) : driveFiles.length === 0 ? (
                  <div className="bg-slate-50 p-8 rounded-2xl border border-slate-200 text-center text-xs text-slate-500">
                    No Fiji files found in your Drive yet. Tap "Save Vouchers to Drive" above to create your digital copies!
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                    {driveFiles.map(file => (
                      <div key={file.id} className="p-3.5 hover:bg-slate-50 transition-colors flex items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <FileText className="w-4 h-4 text-amber-600 shrink-0" />
                          <div className="min-w-0">
                            <span className="font-bold text-slate-900 truncate block">{file.name}</span>
                            <span className="text-[11px] text-slate-400 block">
                              {file.createdTime ? new Date(file.createdTime).toLocaleDateString() : 'File'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {file.webViewLink && (
                            <a
                              href={file.webViewLink}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 text-slate-400 hover:text-amber-700 rounded-lg hover:bg-slate-100 transition-colors"
                              title="Open file in Google Drive"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          )}
                          <button
                            onClick={() => handleDeleteDriveFile(file)}
                            className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-slate-100 transition-colors"
                            title="Delete file from Google Drive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* ================= 4. GOOGLE CONTACTS ================= */}
          {activeTab === 'contacts' && (
            <div className="space-y-4">
              
              <div className="bg-gradient-to-r from-indigo-50 to-blue-50/50 p-4 sm:p-5 rounded-2xl border border-indigo-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h4 className="font-heading font-extrabold text-sm sm:text-base text-slate-900 flex items-center gap-2">
                    <Users className="w-4 h-4 text-indigo-600" />
                    <span>Sync Fiji Emergency Contacts to Google Contacts</span>
                  </h4>
                  <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                    Adds verified Fiji Tourist Police, CWM Hospital, Nadi Hospital, and Concierge phone numbers directly to your Google Contacts list for instant speed-dial in Fiji.
                  </p>
                </div>

                <button
                  onClick={accessToken ? handleSyncEmergencyContacts : handleGoogleSignIn}
                  disabled={isSyncingContacts}
                  className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-300 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 shrink-0 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>{isSyncingContacts ? 'Syncing Contacts...' : 'Sync Fiji Emergency Contacts'}</span>
                </button>
              </div>

              {/* Contacts Directory */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h5 className="font-heading font-bold text-xs text-slate-700 uppercase tracking-wider">
                    Your Google Contacts ({contacts.length})
                  </h5>
                  <a
                    href="https://contacts.google.com"
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                  >
                    <span>Open Google Contacts</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                {!accessToken ? (
                  <div className="bg-slate-50 p-8 rounded-2xl border border-dashed border-slate-300 text-center text-xs text-slate-500 space-y-2">
                    <Users className="w-8 h-8 text-slate-400 mx-auto" />
                    <p>Sign in with Google above to view and sync with your Google Contacts.</p>
                  </div>
                ) : contacts.length === 0 ? (
                  <div className="bg-slate-50 p-8 rounded-2xl border border-slate-200 text-center text-xs text-slate-500">
                    No contacts found. Tap "Sync Fiji Emergency Contacts" above to save local helplines to your phone!
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm max-h-72 overflow-y-auto">
                    {contacts.map((contact, idx) => {
                      const name = contact.names?.[0]?.displayName || 'Contact';
                      const email = contact.emailAddresses?.[0]?.value || '';
                      const phone = contact.phoneNumbers?.[0]?.value || '';

                      return (
                        <div key={contact.resourceName || idx} className="p-3 hover:bg-slate-50 transition-colors flex items-center justify-between gap-3 text-xs">
                          <div className="min-w-0">
                            <span className="font-bold text-slate-900 block truncate">{name}</span>
                            <div className="text-[11px] text-slate-500 flex flex-wrap gap-x-3">
                              {phone && <span>📞 {phone}</span>}
                              {email && <span>✉️ {email}</span>}
                            </div>
                          </div>

                          {onSelectContactForGuest && (
                            <button
                              onClick={() => {
                                onSelectContactForGuest(name, email, phone);
                                setStatusMessage({ text: `Selected ${name} for your booking guest details!`, type: 'success' });
                              }}
                              className="px-2.5 py-1 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg text-[11px] font-semibold text-slate-700 transition-colors shrink-0"
                            >
                              Use as Guest
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>
          )}

        </div>

        {/* Footer */}
        <div className="bg-slate-100 px-5 sm:px-6 py-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-600 gap-2 shrink-0">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Official Google Workspace Integration · Tokens stored securely in-memory only</span>
          </div>
          <div>
            FIJI HAPS Google Sync Engine v1.0
          </div>
        </div>

      </div>
    </div>
  );
};
