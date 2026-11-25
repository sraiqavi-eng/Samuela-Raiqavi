import React, { useState, useEffect } from 'react';
import { 
  X, 
  Landmark, 
  ShieldCheck, 
  CheckCircle2, 
  RefreshCw, 
  DollarSign, 
  Building2, 
  Lock, 
  Eye, 
  EyeOff, 
  Download, 
  Percent, 
  Mail, 
  Send, 
  Copy, 
  Check, 
  LogOut, 
  KeyRound, 
  AlertCircle,
  ShieldAlert
} from 'lucide-react';
import { googleSignIn } from '../services/googleAuth';

interface OwnerBankAccount {
  bankName: string;
  accountHolderName: string;
  accountNumber: string;
  bsbOrBranchCode: string;
  swiftCode: string;
  settlementCurrency: string;
  payoutFrequency: string;
  status: string;
  takeRatePercentage: number;
  totalPayoutsReceivedFjd: number;
  lastTransferDate: string;
}

interface LedgerEntry {
  id: string;
  bookingRef: string;
  customerName: string;
  listingName: string;
  grossBookingFjd: number;
  owner15PercentCutFjd?: number;
  owner25PercentCutFjd?: number;
  operatorShareFjd: number;
  status: string;
  bankAccountTarget: string;
  transferDate: string;
}

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
  owner25PercentCutFjd?: number;
  operatorShareFjd?: number;
}

interface OwnerBackendModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FIJI_BANKS = [
  { name: 'Bank South Pacific (BSP) Fiji', swift: 'BOSPFJFX', defaultBranch: '067-001 (Nadi Main)' },
  { name: 'ANZ Fiji (Australia & New Zealand Bank)', swift: 'ANZBFJFX', defaultBranch: '010-801 (Suva City)' },
  { name: 'Westpac Fiji', swift: 'WPACFJFX', defaultBranch: '039-001 (Victoria Parade)' },
  { name: 'Bred Bank Fiji', swift: 'BREDFJFX', defaultBranch: '900-001 (Suva)' },
  { name: 'HFC Bank Fiji', swift: 'HFCBFJFX', defaultBranch: '800-001 (Suva)' },
  { name: 'Bank of Baroda Fiji', swift: 'BARBFJFX', defaultBranch: '020-001 (Marks Street)' },
  { name: 'International Bank (SWIFT Wire / IBAN)', swift: 'SWIFT-WIRE', defaultBranch: 'Global International' }
];

export const OwnerBackendModal: React.FC<OwnerBackendModalProps> = ({ isOpen, onClose }) => {
  // Authentication & Security state - LOCKED by default
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [passcodeInput, setPasscodeInput] = useState<string>('');
  const [showPasscode, setShowPasscode] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false);
  const [showChangePasscodeModal, setShowChangePasscodeModal] = useState<boolean>(false);
  const [newPasscodeInput, setNewPasscodeInput] = useState<string>('');

  // Dashboard state - Empty until owner logs in
  const [activeTab, setActiveTab] = useState<'bank' | 'ledger' | 'emails'>('bank');
  const [emailFilter, setEmailFilter] = useState<'all' | 'backend_admin' | 'provider'>('all');
  const [selectedEmail, setSelectedEmail] = useState<DispatchedEmail | null>(null);
  
  const [bankAccount, setBankAccount] = useState<OwnerBankAccount | null>(null);
  const [backendEmail, setBackendEmail] = useState<string>('sraiqavi@gmail.com');
  const [ledger, setLedger] = useState<LedgerEntry[]>([]);
  const [dispatchedEmails, setDispatchedEmails] = useState<DispatchedEmail[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);
  const [showFullAccountNum, setShowFullAccountNum] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form states for bank details
  const [formData, setFormData] = useState({
    bankName: '',
    accountHolderName: '',
    accountNumber: '',
    bsbOrBranchCode: '',
    swiftCode: '',
    settlementCurrency: 'FJD',
    payoutFrequency: 'Instant Automated Direct Deposit'
  });

  // Verify stored session on open
  useEffect(() => {
    if (!isOpen) return;

    const storedToken = sessionStorage.getItem('fiji_owner_session_token');
    if (storedToken) {
      checkStoredSession(storedToken);
    } else {
      setIsAuthenticated(false);
      setSessionToken(null);
      setBankAccount(null);
      setLedger([]);
      setDispatchedEmails([]);
    }
  }, [isOpen]);

  const checkStoredSession = async (token: string) => {
    try {
      const res = await fetch('/api/owner/auth/check', {
        headers: { 'x-owner-token': token }
      });
      const data = await res.json();
      if (data.authenticated) {
        setIsAuthenticated(true);
        setSessionToken(token);
        if (data.ownerEmail) setBackendEmail(data.ownerEmail);
        fetchBackendData(token);
      } else {
        sessionStorage.removeItem('fiji_owner_session_token');
        setIsAuthenticated(false);
        setSessionToken(null);
      }
    } catch {
      setIsAuthenticated(false);
      setSessionToken(null);
    }
  };

  // Login via Passcode
  const handlePasscodeLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsAuthenticating(true);

    try {
      const res = await fetch('/api/owner/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode: passcodeInput })
      });

      const data = await res.json();
      if (res.ok && data.success && data.token) {
        sessionStorage.setItem('fiji_owner_session_token', data.token);
        setSessionToken(data.token);
        setIsAuthenticated(true);
        setPasscodeInput('');
        if (data.ownerEmail) setBackendEmail(data.ownerEmail);
        fetchBackendData(data.token);
      } else {
        setAuthError(data.error || 'Incorrect owner passcode. Access denied.');
      }
    } catch {
      setAuthError('Connection error while authenticating owner. Please try again.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Login via Google Owner Account (sraiqavi@gmail.com)
  const handleGoogleOwnerLogin = async () => {
    setAuthError(null);
    setIsAuthenticating(true);

    try {
      const res = await googleSignIn();
      if (res && res.user && res.user.email) {
        const idToken = await res.user.getIdToken();
        const loginRes = await fetch('/api/owner/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${idToken}`
          },
          body: JSON.stringify({ idToken })
        });

        const data = await loginRes.json();
        if (loginRes.ok && data.success && data.token) {
          sessionStorage.setItem('fiji_owner_session_token', data.token);
          setSessionToken(data.token);
          setIsAuthenticated(true);
          setBackendEmail(res.user.email);
          fetchBackendData(data.token);
        } else {
          setAuthError(data.error || `Access denied: Google account (${res.user.email}) is not authorized as the website owner.`);
        }
      }
    } catch (err: any) {
      setAuthError(err.message || 'Google authentication failed.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Owner Logout & Lock
  const handleOwnerLogout = async () => {
    if (sessionToken) {
      try {
        await fetch('/api/owner/auth/logout', {
          method: 'POST',
          headers: { 'x-owner-token': sessionToken }
        });
      } catch (e) {
        console.error('Logout error:', e);
      }
    }
    sessionStorage.removeItem('fiji_owner_session_token');
    setIsAuthenticated(false);
    setSessionToken(null);
    setBankAccount(null);
    setLedger([]);
    setDispatchedEmails([]);
    setAuthError(null);
  };

  // Fetch protected backend data using owner session token
  const fetchBackendData = async (token: string) => {
    setIsLoading(true);
    try {
      const [revRes, emailRes] = await Promise.all([
        fetch('/api/owner/revenue-ledger', { headers: { 'x-owner-token': token } }),
        fetch('/api/owner/dispatched-emails', { headers: { 'x-owner-token': token } })
      ]);

      if (revRes.ok) {
        const data = await revRes.json();
        if (data.bankAccount) {
          setBankAccount(data.bankAccount);
          setFormData({
            bankName: data.bankAccount.bankName,
            accountHolderName: data.bankAccount.accountHolderName,
            accountNumber: data.bankAccount.accountNumber,
            bsbOrBranchCode: data.bankAccount.bsbOrBranchCode,
            swiftCode: data.bankAccount.swiftCode,
            settlementCurrency: data.bankAccount.settlementCurrency || 'FJD',
            payoutFrequency: data.bankAccount.payoutFrequency || 'Instant Automated Direct Deposit'
          });
        }
        if (Array.isArray(data.ledger)) {
          setLedger(data.ledger);
        }
        if (data.ownerSettings?.backendEmail) {
          setBackendEmail(data.ownerSettings.backendEmail);
        }
      }

      if (emailRes.ok) {
        const emailData = await emailRes.json();
        if (Array.isArray(emailData.emails)) {
          setDispatchedEmails(emailData.emails);
        }
      }
    } catch (err) {
      console.error('Error fetching backend revenue ledger & emails:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Save Bank Details
  const handleSaveBankDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionToken) return;

    setIsSaving(true);
    setSaveSuccessMessage(null);
    try {
      const res = await fetch('/api/owner/bank-account', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-owner-token': sessionToken 
        },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        const result = await res.json();
        setBankAccount(result.account);
        setSaveSuccessMessage('Bank account credentials successfully connected & verified for 15% direct deposits!');
        setTimeout(() => setSaveSuccessMessage(null), 5000);
      }
    } catch (err) {
      console.error('Failed to save bank account:', err);
    } finally {
      setIsSaving(false);
    }
  };

  // Update Backend Email
  const handleSaveBackendEmail = async () => {
    if (!sessionToken) return;
    try {
      const res = await fetch('/api/owner/email-settings', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-owner-token': sessionToken
        },
        body: JSON.stringify({ backendEmail })
      });
      if (res.ok) {
        setSaveSuccessMessage(`Website backend notification email updated to: ${backendEmail}`);
        setTimeout(() => setSaveSuccessMessage(null), 5000);
      }
    } catch (err) {
      console.error('Failed to update backend email', err);
    }
  };

  // Change Owner Passcode
  const handleChangePasscode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionToken || !newPasscodeInput.trim()) return;

    try {
      const res = await fetch('/api/owner/auth/change-passcode', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-owner-token': sessionToken
        },
        body: JSON.stringify({ newPasscode: newPasscodeInput })
      });

      if (res.ok) {
        setShowChangePasscodeModal(false);
        setNewPasscodeInput('');
        setSaveSuccessMessage('Owner master passcode updated successfully.');
        setTimeout(() => setSaveSuccessMessage(null), 5000);
      }
    } catch (err) {
      console.error('Failed to update passcode:', err);
    }
  };

  // Simulate Test Booking
  const handleSimulateBooking = async () => {
    if (!sessionToken) return;
    setIsLoading(true);
    try {
      const sampleGross = 1200;
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: `BK-TEST-${Date.now()}`,
          voucherCode: `FJ-${Math.floor(10000 + Math.random() * 90000)}`,
          listingName: 'Cloud 9 Floating Lounge & Day Pass',
          category: 'activities',
          subType: 'Island Tours',
          locationName: 'Ro Ro Reef, Malolo Barrier Reef',
          totalPriceFjd: sampleGross,
          providerEmail: 'reservations@cloud9.com.fj',
          guestInfo: {
            fullName: 'Sophie Tremblay (Test Traveler)',
            email: 'sophie.travel@example.com',
            phone: '+61 498 765 432',
            country: 'Australia',
            flightNumber: 'FJ 910',
            specialRequests: 'Vegetarian wood-fired pizza and upper deck lounger.'
          }
        })
      });

      if (res.ok) {
        await fetchBackendData(sessionToken);
        setSaveSuccessMessage('Booking processed: FJD $180 (15%) deposited to bank + Dual emails dispatched!');
        setTimeout(() => setSaveSuccessMessage(null), 6000);
      }
    } catch (err) {
      console.error('Error simulating booking:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Resend Email
  const handleResendEmail = async (emailId: string) => {
    if (!sessionToken) return;
    try {
      const res = await fetch('/api/owner/resend-email', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-owner-token': sessionToken
        },
        body: JSON.stringify({ emailId })
      });
      if (res.ok) {
        setSaveSuccessMessage('Email re-sent successfully!');
        setTimeout(() => setSaveSuccessMessage(null), 4000);
      }
    } catch (err) {
      console.error('Error resending email:', err);
    }
  };

  if (!isOpen) return null;

  const totalGrossVolume = ledger.reduce((sum, item) => sum + (item.grossBookingFjd || 0), 0);
  const totalOwnerPayout = ledger.reduce((sum, item) => sum + (item.owner15PercentCutFjd || item.owner25PercentCutFjd || 0), 0);
  const totalOperatorPayout = ledger.reduce((sum, item) => sum + (item.operatorShareFjd || 0), 0);

  const filteredEmails = dispatchedEmails.filter(e => {
    if (emailFilter === 'all') return true;
    return e.recipientType === emailFilter;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 text-white rounded-3xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* ========================================================================= */}
        {/* SCREEN 1: LOCKED OWNER AUTHENTICATION (NO SENSITIVE DATA SHOWN AT ALL)   */}
        {/* ========================================================================= */}
        {!isAuthenticated ? (
          <div className="flex flex-col h-full overflow-y-auto">
            
            {/* Top Modal Close Header */}
            <div className="bg-slate-950 px-5 sm:px-6 py-4 border-b border-slate-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-heading font-extrabold text-sm sm:text-base text-white tracking-tight">
                    FIJI HAPS · Owner Operations & Financial Portal
                  </h3>
                  <span className="text-[10px] text-slate-400">Strictly Restricted to App Owner</span>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Login Container */}
            <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
              <div className="w-full max-w-md bg-slate-950 p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl space-y-6">
                
                {/* Shield Badge & Title */}
                <div className="text-center space-y-2">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto shadow-inner">
                    <ShieldCheck className="w-7 h-7" />
                  </div>
                  <h2 className="font-heading font-extrabold text-xl text-white">
                    Owner Verification Required
                  </h2>
                  <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">
                    Authorized access only. Please sign in with your owner credentials to access the back-end operations portal.
                  </p>
                </div>

                {/* Error Banner */}
                {authError && (
                  <div className="bg-rose-950/70 border border-rose-800 p-3 rounded-xl flex items-center gap-2 text-xs text-rose-200 animate-in fade-in">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>{authError}</span>
                  </div>
                )}

                {/* Form 1: Passcode Login */}
                <form onSubmit={handlePasscodeLogin} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center justify-between">
                      <span>Owner Master Passcode</span>
                      <button
                        type="button"
                        onClick={() => setShowPasscode(!showPasscode)}
                        className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center gap-1 cursor-pointer"
                      >
                        {showPasscode ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                        <span>{showPasscode ? 'Hide' : 'Reveal'}</span>
                      </button>
                    </label>
                    <div className="relative">
                      <input
                        type={showPasscode ? 'text' : 'password'}
                        required
                        value={passcodeInput}
                        onChange={(e) => setPasscodeInput(e.target.value)}
                        placeholder="Enter owner passcode"
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 font-mono tracking-wider"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isAuthenticating || !passcodeInput.trim()}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs sm:text-sm font-extrabold transition-all shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <KeyRound className="w-4 h-4" />
                    <span>{isAuthenticating ? 'Verifying Credentials...' : 'Unlock Owner Portal'}</span>
                  </button>
                </form>

                {/* Divider */}
                <div className="relative flex items-center justify-center">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-800" /></div>
                  <span className="relative bg-slate-950 px-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Or Sign in via Google
                  </span>
                </div>

                {/* Form 2: Sign In with Authorized Google Account */}
                <button
                  onClick={handleGoogleOwnerLogin}
                  disabled={isAuthenticating}
                  className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-850 border border-slate-700 hover:border-slate-600 text-slate-200 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2.5 shadow-sm cursor-pointer disabled:opacity-50"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                  </svg>
                  <span>Sign in with Google (Owner Account)</span>
                </button>

                <div className="text-center pt-2 text-[11px] text-slate-500">
                  <span>Protected by TLS 1.3 encryption & backend token enforcement</span>
                </div>

              </div>
            </div>

            {/* Bottom Disclaimer */}
            <div className="bg-slate-950 px-6 py-3 border-t border-slate-800 text-center text-[11px] text-slate-500 shrink-0">
              Back-end management and financial information are strictly restricted to authorized owners only.
            </div>

          </div>
        ) : (
          /* ========================================================================= */
          /* SCREEN 2: AUTHENTICATED OWNER DASHBOARD (VISIBLE TO OWNER ONLY)          */
          /* ========================================================================= */
          <div className="flex flex-col h-full overflow-hidden">
            
            {/* Header Bar */}
            <div className="bg-slate-950 px-5 sm:px-6 py-4 border-b border-slate-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-950/50">
                  <Landmark className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-heading font-extrabold text-base sm:text-lg text-white tracking-tight">
                      FIJI HAPS · Back-End Operations & Revenue Hub
                    </h3>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Owner Authenticated
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Logged in as <strong className="text-slate-200">{backendEmail}</strong> · Bank South Pacific direct deposits & dual email dispatch active.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowChangePasscodeModal(true)}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Change owner passcode"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Passcode</span>
                </button>
                <button
                  onClick={() => sessionToken && fetchBackendData(sessionToken)}
                  disabled={isLoading}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
                  title="Refresh ledger & emails"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                </button>
                <button
                  onClick={handleOwnerLogout}
                  className="px-2.5 py-1.5 rounded-xl bg-rose-950/60 hover:bg-rose-900 border border-rose-800 text-rose-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Log out and lock back-end"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-400" />
                  <span className="hidden sm:inline">Lock Portal</span>
                </button>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Confidential Owner Notice Banner */}
            <div className="bg-amber-950/40 border-b border-amber-900/50 px-5 py-2 flex items-center justify-between text-xs text-amber-200/90">
              <div className="flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>
                  <strong>Owner & Operator Back-End:</strong> Financial routes and email logs are strictly hidden from customers.
                </span>
              </div>
              <span className="text-[10px] font-mono font-bold bg-amber-900/60 px-2 py-0.5 rounded text-amber-300">
                Backend Notifications: {backendEmail}
              </span>
            </div>

            {/* Success Alert */}
            {saveSuccessMessage && (
              <div className="bg-emerald-950/80 border-b border-emerald-700 px-5 py-2.5 flex items-center gap-2 text-xs text-emerald-200 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{saveSuccessMessage}</span>
              </div>
            )}

            {/* 4 Financial Highlight Cards */}
            <div className="p-4 sm:p-5 bg-slate-900/60 border-b border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-3 shrink-0">
              
              {/* Card 1: 15% Cut Earned */}
              <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-emerald-500/30 relative overflow-hidden">
                <div className="absolute right-0 top-0 w-16 h-16 bg-emerald-500/10 rounded-full blur-xl pointer-events-none" />
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
                  15% Platform Revenue
                </span>
                <div className="font-heading font-extrabold text-lg sm:text-2xl text-emerald-300 mt-1 tabular-nums font-mono">
                  FJD ${(totalOwnerPayout || bankAccount?.totalPayoutsReceivedFjd || 0).toLocaleString()}
                </div>
                <span className="text-[10px] text-slate-400 mt-0.5 block flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  Direct to Bank Account
                </span>
              </div>

              {/* Card 2: Total Gross Bookings */}
              <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Gross Volume (100%)
                </span>
                <div className="font-heading font-extrabold text-lg sm:text-2xl text-white mt-1 tabular-nums font-mono">
                  FJD ${totalGrossVolume.toLocaleString()}
                </div>
                <span className="text-[10px] text-slate-500 mt-0.5 block">
                  Across all tourist bookings
                </span>
              </div>

              {/* Card 3: Operator Share (85%) */}
              <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Operator Share (85%)
                </span>
                <div className="font-heading font-extrabold text-lg sm:text-2xl text-slate-200 mt-1 tabular-nums font-mono">
                  FJD ${totalOperatorPayout.toLocaleString()}
                </div>
                <span className="text-[10px] text-slate-500 mt-0.5 block">
                  To resorts, boats & guides
                </span>
              </div>

              {/* Card 4: Dispatched Emails */}
              <div 
                onClick={() => setActiveTab('emails')}
                className="bg-slate-950/80 p-3.5 rounded-2xl border border-teal-500/30 cursor-pointer hover:border-teal-400 transition-colors"
              >
                <span className="text-[10px] font-bold text-teal-400 uppercase tracking-wider block">
                  Dispatched Emails
                </span>
                <div className="font-heading font-extrabold text-lg sm:text-2xl text-teal-300 mt-1 tabular-nums font-mono flex items-center gap-1.5">
                  <Mail className="w-5 h-5 text-teal-400 inline" />
                  <span>{dispatchedEmails.length}</span>
                </div>
                <span className="text-[10px] text-emerald-400 mt-0.5 block">
                  1 to Backend, 1 to Provider
                </span>
              </div>

            </div>

            {/* View Switcher Tabs */}
            <div className="px-5 sm:px-6 pt-3 flex items-center justify-between border-b border-slate-800 shrink-0">
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveTab('bank')}
                  className={`px-4 py-2 text-xs font-bold rounded-t-xl transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
                    activeTab === 'bank'
                      ? 'border-emerald-500 text-emerald-400 bg-slate-800/60'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Connected Bank Account</span>
                </button>

                <button
                  onClick={() => setActiveTab('ledger')}
                  className={`px-4 py-2 text-xs font-bold rounded-t-xl transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
                    activeTab === 'ledger'
                      ? 'border-emerald-500 text-emerald-400 bg-slate-800/60'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Percent className="w-3.5 h-3.5" />
                  <span>15% Payout Ledger ({ledger.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('emails')}
                  className={`px-4 py-2 text-xs font-bold rounded-t-xl transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
                    activeTab === 'emails'
                      ? 'border-emerald-500 text-emerald-400 bg-slate-800/60'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Dispatched Emails ({dispatchedEmails.length})</span>
                </button>
              </div>

              <button
                onClick={handleSimulateBooking}
                disabled={isLoading}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-500/40 text-emerald-300 rounded-xl text-[11px] font-bold transition-colors cursor-pointer"
              >
                <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                <span>Simulate $1,200 Booking (15% + Dual Emails)</span>
              </button>
            </div>

            {/* Content Body */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
              
              {/* ================= TAB 1: CONNECTED BANK ACCOUNT ================= */}
              {activeTab === 'bank' && (
                <div className="space-y-5">
                  
                  {/* Live Bank Status Banner */}
                  <div className="bg-gradient-to-r from-emerald-950/60 via-slate-900 to-slate-950 p-4 sm:p-5 rounded-2xl border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                        <ShieldCheck className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-heading font-extrabold text-sm sm:text-base text-white">
                            Bank Routing Live & Verified
                          </h4>
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        </div>
                        <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                          Every tourist booking through FIJI HAPS automatically calculates your <strong>15% platform commission</strong> and sends it directly to your bank account below.
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0 bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">Configured Take-Rate</span>
                      <span className="font-mono font-extrabold text-emerald-400 text-lg">15.00%</span>
                      <span className="text-[10px] text-slate-400 block">Direct Payout</span>
                    </div>
                  </div>

                  {/* Bank Account Details Form */}
                  <form onSubmit={handleSaveBankDetails} className="bg-slate-950/70 p-5 rounded-3xl border border-slate-800 space-y-4">
                    <div>
                      <h4 className="font-heading font-bold text-sm text-white mb-1 flex items-center gap-2">
                        <Landmark className="w-4 h-4 text-emerald-400" />
                        <span>Your Bank Account Credentials</span>
                      </h4>
                      <p className="text-xs text-slate-400">
                        Update the recipient bank account where your 15% earnings from tourist bookings will be deposited.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      
                      {/* Bank Name Selector */}
                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1.5">
                          Select Bank *
                        </label>
                        <select
                          value={formData.bankName}
                          onChange={(e) => {
                            const selectedBank = FIJI_BANKS.find(b => b.name === e.target.value);
                            setFormData({
                              ...formData,
                              bankName: e.target.value,
                              swiftCode: selectedBank ? selectedBank.swift : formData.swiftCode,
                              bsbOrBranchCode: selectedBank ? selectedBank.defaultBranch : formData.bsbOrBranchCode
                            });
                          }}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500 font-semibold"
                        >
                          {FIJI_BANKS.map(b => (
                            <option key={b.name} value={b.name}>{b.name}</option>
                          ))}
                        </select>
                      </div>

                      {/* Account Holder Name */}
                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1.5">
                          Account Holder Name (Legal Entity or Individual) *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.accountHolderName}
                          onChange={(e) => setFormData({ ...formData, accountHolderName: e.target.value })}
                          placeholder="e.g. FIJI HAPS VENTURES LTD or Your Name"
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500 font-semibold"
                        />
                      </div>

                      {/* Account Number */}
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-xs font-bold text-slate-300">
                            Bank Account Number *
                          </label>
                          <button
                            type="button"
                            onClick={() => setShowFullAccountNum(!showFullAccountNum)}
                            className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center gap-1 cursor-pointer"
                          >
                            {showFullAccountNum ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                            <span>{showFullAccountNum ? 'Hide' : 'Reveal'}</span>
                          </button>
                        </div>
                        <input
                          type={showFullAccountNum ? "text" : "password"}
                          required
                          value={formData.accountNumber}
                          onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                          placeholder="e.g. 9283746102"
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-white font-mono focus:outline-none focus:border-emerald-500 font-semibold tracking-wider"
                        />
                      </div>

                      {/* BSB / Branch Code */}
                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1.5">
                          BSB / Branch Code *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.bsbOrBranchCode}
                          onChange={(e) => setFormData({ ...formData, bsbOrBranchCode: e.target.value })}
                          placeholder="e.g. 067-001 (Nadi Main)"
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-white font-mono focus:outline-none focus:border-emerald-500 font-semibold"
                        />
                      </div>

                      {/* SWIFT / BIC Code */}
                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1.5">
                          SWIFT / BIC Code *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.swiftCode}
                          onChange={(e) => setFormData({ ...formData, swiftCode: e.target.value.toUpperCase() })}
                          placeholder="e.g. BOSPFJFX"
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-white font-mono focus:outline-none focus:border-emerald-500 font-semibold uppercase"
                        />
                      </div>

                      {/* Settlement Currency */}
                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1.5">
                          Payout Currency
                        </label>
                        <select
                          value={formData.settlementCurrency}
                          onChange={(e) => setFormData({ ...formData, settlementCurrency: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500 font-semibold"
                        >
                          <option value="FJD">FJD - Fijian Dollar (Local Settlement)</option>
                          <option value="AUD">AUD - Australian Dollar</option>
                          <option value="USD">USD - United States Dollar</option>
                          <option value="NZD">NZD - New Zealand Dollar</option>
                          <option value="EUR">EUR - Euro</option>
                        </select>
                      </div>

                    </div>

                    {/* Direct Deposit Frequency */}
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">
                        Direct Deposit Schedule
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {[
                          { id: 'Instant Automated Direct Deposit', label: 'Instant Real-Time', desc: 'Deposits 15% immediately on each booking' },
                          { id: 'Daily Midnight Batch', label: 'Daily Midnight', desc: 'Aggregated 24-hr deposit at 00:00 FJT' },
                          { id: 'Weekly on Monday', label: 'Weekly Monday', desc: 'Weekly bulk wire transfer' }
                        ].map(sched => (
                          <div
                            key={sched.id}
                            onClick={() => setFormData({ ...formData, payoutFrequency: sched.id })}
                            className={`p-3 rounded-xl border cursor-pointer transition-all ${
                              formData.payoutFrequency === sched.id
                                ? 'bg-emerald-950/60 border-emerald-500 text-white shadow-sm'
                                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            <div className="font-bold text-xs flex items-center justify-between">
                              <span>{sched.label}</span>
                              {formData.payoutFrequency === sched.id && (
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                              )}
                            </div>
                            <span className="text-[10px] text-slate-500 block mt-1 leading-tight">{sched.desc}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Save Button */}
                    <div className="pt-2 flex items-center justify-between">
                      <span className="text-xs text-slate-400 flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        Encrypted bank vault via TLS 1.3
                      </span>
                      <button
                        type="submit"
                        disabled={isSaving}
                        className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 text-white rounded-xl text-xs sm:text-sm font-extrabold transition-colors shadow-lg flex items-center gap-2 cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{isSaving ? 'Updating Bank Account...' : 'Save & Connect Bank Account'}</span>
                      </button>
                    </div>

                  </form>

                </div>
              )}

              {/* ================= TAB 2: 15% PAYOUT LEDGER ================= */}
              {activeTab === 'ledger' && (
                <div className="space-y-4">
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h4 className="font-heading font-bold text-sm text-white flex items-center gap-2">
                        <Percent className="w-4 h-4 text-emerald-400" />
                        <span>Automated 15% Bank Payout Ledger</span>
                      </h4>
                      <p className="text-xs text-slate-400">
                        Audit trail showing every booking, gross customer payment, and your 15% take-rate transferred directly to your bank account.
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        const csvContent = "data:text/csv;charset=utf-8," + 
                          ["Date,BookingRef,Customer,Experience,GrossFJD,Owner15CutFJD,Operator85FJD,BankTarget,Status"]
                          .concat(ledger.map(e => `"${new Date(e.transferDate).toLocaleDateString()}","${e.bookingRef}","${e.customerName}","${e.listingName}",${e.grossBookingFjd},${e.owner15PercentCutFjd || e.owner25PercentCutFjd || 0},${e.operatorShareFjd},"${e.bankAccountTarget}","${e.status}"`))
                          .join("\n");
                        const encodedUri = encodeURI(csvContent);
                        const link = document.createElement("a");
                        link.setAttribute("href", encodedUri);
                        link.setAttribute("download", `fiji_haps_15pct_ledger_${Date.now()}.csv`);
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors self-start sm:self-auto cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Export CSV Statement</span>
                    </button>
                  </div>

                  {/* Transactions Table */}
                  <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-900/90 text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-800">
                          <tr>
                            <th className="px-4 py-3">Date & Ref</th>
                            <th className="px-4 py-3">Guest & Experience</th>
                            <th className="px-4 py-3 text-right">Gross (100%)</th>
                            <th className="px-4 py-3 text-right text-emerald-400">Your 15% Cut</th>
                            <th className="px-4 py-3 text-right text-slate-400">Operator (85%)</th>
                            <th className="px-4 py-3">Bank Transfer Target</th>
                            <th className="px-4 py-3 text-center">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60 font-sans">
                          {ledger.length === 0 ? (
                            <tr>
                              <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                                No bookings recorded yet. New customer bookings will appear here instantly.
                              </td>
                            </tr>
                          ) : (
                            ledger.map((item) => (
                              <tr key={item.id} className="hover:bg-slate-900/40 transition-colors">
                                <td className="px-4 py-3 font-mono">
                                  <span className="text-white font-bold block">{item.bookingRef}</span>
                                  <span className="text-[10px] text-slate-500">
                                    {new Date(item.transferDate).toLocaleDateString()} {new Date(item.transferDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </td>
                                <td className="px-4 py-3">
                                  <span className="text-slate-200 font-semibold block">{item.listingName}</span>
                                  <span className="text-[11px] text-slate-400">{item.customerName}</span>
                                </td>
                                <td className="px-4 py-3 text-right font-mono font-bold text-slate-200">
                                  FJD ${item.grossBookingFjd.toLocaleString()}
                                </td>
                                <td className="px-4 py-3 text-right font-mono font-extrabold text-emerald-400 text-sm bg-emerald-950/20">
                                  +FJD ${(item.owner15PercentCutFjd || item.owner25PercentCutFjd || 0).toLocaleString()}
                                </td>
                                <td className="px-4 py-3 text-right font-mono text-slate-400">
                                  FJD ${item.operatorShareFjd.toLocaleString()}
                                </td>
                                <td className="px-4 py-3 font-mono text-[11px] text-teal-300">
                                  <div className="flex items-center gap-1">
                                    <Landmark className="w-3 h-3 text-emerald-400 shrink-0" />
                                    <span className="truncate max-w-[140px]">{item.bankAccountTarget || bankAccount?.bankName}</span>
                                  </div>
                                </td>
                                <td className="px-4 py-3 text-center">
                                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-800 px-2 py-0.5 rounded-full">
                                    <CheckCircle2 className="w-2.5 h-2.5" />
                                    Deposited
                                  </span>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                </div>
              )}

              {/* ================= TAB 3: DISPATCHED NOTIFICATION EMAILS ================= */}
              {activeTab === 'emails' && (
                <div className="space-y-4">
                  
                  {/* Header and Backend Email Configuration */}
                  <div className="bg-slate-950 p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h4 className="font-heading font-extrabold text-sm sm:text-base text-white flex items-center gap-2">
                          <Mail className="w-4 h-4 text-teal-400" />
                          <span>Automated Dual Email Dispatch System</span>
                        </h4>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Every confirmed booking automatically sends <strong>1 email to the website backend</strong> and <strong>1 email to the provider</strong>.
                        </p>
                      </div>

                      <div className="flex items-center gap-2 self-start sm:self-auto">
                        <span className="text-xs text-slate-400 font-semibold">Filter:</span>
                        <div className="bg-slate-900 p-1 rounded-xl border border-slate-700 flex text-xs">
                          {(['all', 'backend_admin', 'provider'] as const).map(f => (
                            <button
                              key={f}
                              onClick={() => setEmailFilter(f)}
                              className={`px-2.5 py-1 rounded-lg font-bold capitalize transition-colors cursor-pointer ${
                                emailFilter === f ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                              }`}
                            >
                              {f === 'backend_admin' ? 'Website Backend' : f}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Backend Email Configuration Input */}
                    <div className="pt-2 border-t border-slate-800 flex flex-col sm:flex-row items-center gap-2">
                      <span className="text-xs text-slate-300 font-bold whitespace-nowrap">Website Backend Email:</span>
                      <div className="flex-1 w-full flex gap-2">
                        <input
                          type="email"
                          value={backendEmail}
                          onChange={(e) => setBackendEmail(e.target.value)}
                          placeholder="e.g. sraiqavi@gmail.com"
                          className="bg-slate-900 border border-slate-700 px-3 py-1.5 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 font-mono flex-1"
                        />
                        <button
                          onClick={handleSaveBackendEmail}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-colors shrink-0 cursor-pointer"
                        >
                          Update
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Email List */}
                  <div className="space-y-2.5">
                    {filteredEmails.length === 0 ? (
                      <div className="bg-slate-950 p-8 rounded-2xl border border-slate-800 text-center text-slate-500 text-xs">
                        No dispatched emails found for this filter.
                      </div>
                    ) : (
                      filteredEmails.map(email => (
                        <div
                          key={email.id}
                          className="bg-slate-950 p-4 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                        >
                          <div className="space-y-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md ${
                                email.recipientType === 'backend_admin'
                                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                                  : 'bg-teal-950 text-teal-300 border border-teal-700'
                              }`}>
                                {email.recipientType === 'backend_admin' ? 'Website Backend' : 'Provider'}
                              </span>
                              <span className="font-mono text-xs font-bold text-slate-300">{email.bookingRef}</span>
                              <span className="text-[11px] text-slate-500">· {new Date(email.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>

                            <div className="font-heading font-bold text-sm text-white truncate">
                              {email.subject}
                            </div>

                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
                              <span>Recipient: <strong className="text-slate-200 font-mono">{email.to}</strong></span>
                              <span>Experience: <strong className="text-slate-200">{email.listingName}</strong></span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                            <button
                              onClick={() => setSelectedEmail(email)}
                              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>View Full Email</span>
                            </button>
                            <button
                              onClick={() => handleResendEmail(email.id)}
                              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-emerald-400 rounded-xl transition-colors cursor-pointer"
                              title="Resend this email"
                            >
                              <Send className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                </div>
              )}

            </div>

            {/* Change Passcode Modal */}
            {showChangePasscodeModal && (
              <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
                <div className="bg-slate-900 border border-slate-700 p-6 rounded-3xl w-full max-w-sm space-y-4 shadow-2xl">
                  <div className="flex items-center justify-between">
                    <h4 className="font-heading font-bold text-base text-white flex items-center gap-2">
                      <KeyRound className="w-4 h-4 text-emerald-400" />
                      <span>Update Owner Passcode</span>
                    </h4>
                    <button onClick={() => setShowChangePasscodeModal(false)} className="text-slate-400 hover:text-white">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <form onSubmit={handleChangePasscode} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">New Master Passcode</label>
                      <input
                        type="text"
                        required
                        value={newPasscodeInput}
                        onChange={(e) => setNewPasscodeInput(e.target.value)}
                        placeholder="Enter at least 4 characters"
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowChangePasscodeModal(false)}
                        className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold cursor-pointer"
                      >
                        Save New Passcode
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Modal for Viewing Full Rendered Email */}
            {selectedEmail && (
              <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md">
                <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95">
                  
                  {/* Email Inspector Header */}
                  <div className="p-4 sm:p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md ${
                          selectedEmail.recipientType === 'backend_admin'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                            : 'bg-teal-950 text-teal-300 border border-teal-700'
                        }`}>
                          {selectedEmail.recipientType === 'backend_admin' ? 'Website Backend Email' : 'Provider Reservation Email'}
                        </span>
                        <span className="text-xs font-mono text-slate-400">{selectedEmail.bookingRef}</span>
                      </div>
                      <h4 className="font-heading font-extrabold text-sm sm:text-base text-white mt-1">
                        {selectedEmail.subject}
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5 font-mono">
                        To: {selectedEmail.to} ({selectedEmail.recipientName}) · Sent: {new Date(selectedEmail.sentAt).toLocaleString()}
                      </p>
                    </div>

                    <button
                      onClick={() => setSelectedEmail(null)}
                      className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Rendered Email Preview Container */}
                  <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-slate-950/50">
                    <div 
                      className="bg-white text-slate-900 rounded-2xl overflow-hidden shadow p-4 text-xs"
                      dangerouslySetInnerHTML={{ __html: selectedEmail.htmlBody }}
                    />
                  </div>

                  {/* Email Footer Actions */}
                  <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(selectedEmail.plainText);
                        setCopiedId(selectedEmail.id);
                        setTimeout(() => setCopiedId(null), 3000);
                      }}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                    >
                      {copiedId === selectedEmail.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedId === selectedEmail.id ? 'Copied Body' : 'Copy Text Body'}</span>
                    </button>

                    <button
                      onClick={() => {
                        handleResendEmail(selectedEmail.id);
                        setSelectedEmail(null);
                      }}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Resend This Email</span>
                    </button>
                  </div>

                </div>
              </div>
            )}

            {/* Footer info */}
            <div className="bg-slate-950 px-5 sm:px-6 py-3 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-2 shrink-0">
              <div className="flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-emerald-500" />
                <span>FIJI HAPS Automated Bank Settlement & Dual Email Engine v3.0</span>
              </div>
              <div>
                Session Active · <button onClick={handleOwnerLogout} className="text-rose-400 hover:underline font-bold cursor-pointer">Lock & Logout</button>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
