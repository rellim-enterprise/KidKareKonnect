import { useState, useEffect, useRef, useMemo } from 'react';
import {
  Briefcase, GraduationCap, MapPin, Users, Search, Heart, Send,
  Check, Award, Shield, BookOpen, Building2, User, ArrowRight,
  Clock, DollarSign, X, Plus, FileText, ExternalLink,
  LogOut, Bookmark, LayoutGrid, CheckCircle2, Lock, Verified,
  AlertCircle, Edit3, Upload, Paperclip, Handshake, Megaphone,
  Phone, Mail, Trash2, Camera, ChevronLeft, Calendar, KeyRound
} from 'lucide-react';

const c = {
  cream: '#FAF6EE', paleBlue: '#EEF5FA', lightBlue: '#DCE9F2',
  blue: '#3D7BA0', primary: '#2B5F7E', primaryDark: '#1A4257',
  navy: '#0F2A3D', coral: '#E8A78F', coralDark: '#D88E72',
  gold: '#D4A547', text: '#1A2B3C', textMuted: '#5C7280',
  white: '#FFFFFF', border: '#E8DEC9', borderSoft: '#F0E8D8',
  success: '#5B8C6E'
};

const STATES = ['Alabama','Alaska','Arizona','Arkansas','California','Colorado','Connecticut','Delaware','Florida','Georgia','Hawaii','Idaho','Illinois','Indiana','Iowa','Kansas','Kentucky','Louisiana','Maine','Maryland','Massachusetts','Michigan','Minnesota','Mississippi','Missouri','Montana','Nebraska','Nevada','New Hampshire','New Jersey','New Mexico','New York','North Carolina','North Dakota','Ohio','Oklahoma','Oregon','Pennsylvania','Rhode Island','South Carolina','South Dakota','Tennessee','Texas','Utah','Vermont','Virginia','Washington','West Virginia','Wisconsin','Wyoming'];

const SAMPLE_JOBS = [
  { id: 1, title: 'Lead Toddler Teacher', center: 'Ahead of the Class Early Learning', verified: true, location: 'Lithonia, GA', state: 'Georgia', type: 'Full Time', pay: '$16 to $19 / hr', posted: '2 days ago', tags: ['CDA Preferred', 'Health Insurance'], description: 'Loving, experienced teacher needed for our toddler classroom.' },
  { id: 2, title: 'Infant Caregiver', center: 'Little Leaders Academy of Arts', verified: true, location: 'Conyers, GA', state: 'Georgia', type: 'Full Time', pay: '$14 to $16 / hr', posted: '3 days ago', tags: ['Entry Level Welcome', 'Training'], description: 'Warm hearted caregiver to join our infant room.' },
  { id: 3, title: 'Preschool Assistant', center: 'Milestones Achievers Academy', verified: true, location: 'Lithonia, GA', state: 'Georgia', type: 'Part Time', pay: '$13 to $15 / hr', posted: '5 days ago', tags: ['Flexible Hours'], description: 'Afternoon shift assistant for our preschool team.' },
  { id: 4, title: 'Center Director', center: 'Sunshine Kids Learning Center', verified: true, location: 'Atlanta, GA', state: 'Georgia', type: 'Full Time', pay: '$48,000 to $58,000 / yr', posted: '1 week ago', tags: ['Director Credential'], description: 'Seeking experienced director with GA Director Credential.' },
  { id: 5, title: 'Lead Pre K Teacher', center: 'Bright Beginnings Academy', verified: true, location: 'Charlotte, NC', state: 'North Carolina', type: 'Full Time', pay: '$17 to $20 / hr', posted: '4 days ago', tags: ['NC ECC Credential'], description: 'Pre K teacher with NC Early Childhood Credential or AAS in ECE.' },
  { id: 6, title: 'Lead Infant Teacher', center: 'Tender Hearts Academy', verified: true, location: 'Decatur, GA', state: 'Georgia', type: 'Full Time', pay: '$15 to $18 / hr', posted: '1 day ago', tags: ['CDA Preferred'], description: 'Lead infant teacher needed. CDA or willingness to obtain within 1 year.' },
  { id: 7, title: 'Floater Teacher', center: 'Tiny Treasures Daycare', verified: false, location: 'Tampa, FL', state: 'Florida', type: 'Part Time', pay: '$13 to $15 / hr', posted: '6 days ago', tags: ['Flexible'], description: 'On call floater needed across multiple classrooms.' }
];

const STATE_LICENSING = {
  Georgia: { agency: 'Bright from the Start: Georgia DECAL', website: 'decal.ga.gov', requirements: ['Be at least 18 years of age','HS diploma or GED for lead teachers','10 hours preservice training through DECAL','CPR and First Aid within 90 days','Pass Criminal Records Check (CRC)','TB risk assessment','10 hours annual continuing education'], backgroundCheck: { name: 'Georgia Criminal Records Check (CRC)', steps: ['Create an account at the GA CRC portal through DECAL','Submit fingerprints at Cogent or IdentoGO','Pay the fee (approximately $50)','Wait 7 to 14 business days','Receive your CRC determination letter'], link: 'decal.ga.gov' } },
  Florida: { agency: 'Florida Department of Children and Families', website: 'myflfamilies.com', requirements: ['Be at least 18 years of age','Complete the FL 45 hour Introductory Training','Pass Level 2 background screening','10 hours annual in service training','CPR and First Aid recommended'], backgroundCheck: { name: 'Florida Level 2 Background Screening', steps: ['Get a Livescan service code','Schedule fingerprinting','Pay the fee (approximately $76)','Results sent to DCF','Clearance typically within 5 business days'], link: 'myflfamilies.com' } },
  Texas: { agency: 'Texas Health and Human Services', website: 'hhs.texas.gov', requirements: ['Be at least 18 years of age','HS diploma or GED','8 hours of preservice training','24 hours of annual training','CPR and First Aid certification','Pass Texas DFPS background check'], backgroundCheck: { name: 'Texas DFPS Background Check', steps: ['Submit application through employer','Complete fingerprint based FBI check','Pay the fee (approximately $40)','Results in 2 to 3 weeks','Eligibility determination issued'], link: 'hhs.texas.gov' } }
};

const DEFAULT_INFO = { requirements: ['Be at least 18 years of age','HS diploma or GED for most positions','State required preservice training','Current CPR and First Aid','State criminal background check','Annual continuing education hours'], backgroundCheck: { name: 'State Required Background Check', steps: ['Contact your state child care licensing agency','Complete the application','Submit fingerprints','Pay required fees','Wait for clearance'] } };

const TRAINING = [
  { title: 'Child Development Associate (CDA)', provider: 'Council for Professional Recognition', duration: '120 hours plus portfolio', cost: '$425', icon: Award, description: 'The most widely recognized credential in early childhood.', badge: 'Most Popular' },
  { title: 'CPR and Pediatric First Aid', provider: 'American Red Cross / AHA', duration: '4 to 6 hours', cost: '$60 to $120', icon: Heart, description: 'Required in every state. Valid 2 years.', badge: 'Required' },
  { title: 'State Preservice Training', provider: 'Your state licensing agency', duration: '8 to 45 hours', cost: 'Often free', icon: BookOpen, description: 'Required before working in a licensed center.', badge: 'Required' },
  { title: 'Director Credential', provider: 'State agencies, colleges', duration: '40 to 120 hours', cost: '$200 to $1,500', icon: Building2, description: 'Required for center directors in most states.', badge: 'Leadership' }
];

const JOB_TEMPLATES = [
  { title: 'Lead Toddler Teacher', age: '12 to 24 months', pay: '$15 to $19 / hr', icon: '🧸', summary: 'Plan and lead daily learning activities for toddlers.', requirements: ['CDA preferred', '1+ years experience', 'CPR current'] },
  { title: 'Lead Preschool Teacher', age: '3 to 4 years', pay: '$16 to $20 / hr', icon: '🎨', summary: 'Design age appropriate curriculum and partner with families.', requirements: ['CDA, AAS, or BA in ECE', '2+ years experience'] },
  { title: 'Lead Pre K Teacher', age: '4 to 5 years', pay: '$17 to $22 / hr', icon: '✏️', summary: 'Prepare children for kindergarten.', requirements: ['CDA, AAS, or BA in ECE', 'Kindergarten readiness experience'] },
  { title: 'Infant Caregiver', age: '6 weeks to 12 months', pay: '$13 to $16 / hr', icon: '🍼', summary: 'Warm, responsive care to infants.', requirements: ['Entry level welcome', 'CPR within 90 days'] },
  { title: 'Assistant Teacher', age: 'All ages', pay: '$12 to $15 / hr', icon: '🤝', summary: 'Support lead teacher with activities and care routines.', requirements: ['HS diploma or GED', 'Reliable and team oriented'] },
  { title: 'Center Director', age: 'Leadership', pay: '$45,000 to $65,000 / yr', icon: '⭐', summary: 'Lead center operations, staffing, and compliance.', requirements: ['Director Credential', '3+ years leadership'] }
];

const PRICING = [
  { name: 'Starter', price: 79, tagline: 'For single centers just getting started', features: ['Up to 3 active job posts','Basic applicant profiles','Email support','1 admin user','State licensing guide access','7 day free trial'], highlight: false },
  { name: 'Professional', price: 129, tagline: 'For growing centers ready to hire faster', features: ['Up to 10 active job posts','Full applicant credentials and documents','Priority email and phone support','3 admin users','Featured listing badge','Background check verification status','Automated applicant messaging','7 day free trial'], highlight: true, badge: 'Most Popular' },
  { name: 'Enterprise', price: 159, tagline: 'For multi center owners and franchises', features: ['Unlimited job posts','White-glove onboarding','Dedicated account manager','Unlimited admin users','Premium placement on Browse Jobs','Custom branding on listings','Advanced analytics dashboard','API access for HR systems','7 day free trial'], highlight: false }
];

const AGE_GROUPS = ['Infant','Toddler','Preschool','Pre K','School Age'];
const CREDENTIALS_LIST = ['CDA','State Preservice','CPR and First Aid','Director Credential','Associate in ECE','Bachelor in ECE','None yet'];
const POSITIONS_LIST = ['Lead Teacher','Assistant Teacher','After School Teacher','Infant Caregiver','Director','Assistant Director','Floater','Cook'];

const PARTNERS = [
  { id: 1, name: 'Atlanta CPR & First Aid Training', category: 'Training', icon: '🚑', tagline: 'Pediatric CPR and First Aid certification.', description: 'Weekly Red Cross certified classes in metro Atlanta. Group discounts for daycare staff.', website: 'atlantacpr.example.com', phone: '(404) 555 0142', featured: true },
  { id: 2, name: 'CDA Prep Pro Online Academy', category: 'Training', icon: '🎓', tagline: 'Complete your CDA in 90 days, online.', description: 'Self paced CDA preparation with portfolio coaching and exam scheduling support.', website: 'cdaprep.example.com', phone: '(800) 555 0177' },
  { id: 3, name: 'Georgia Preservice Training Hub', category: 'Training', icon: '📚', tagline: 'DECAL approved 10 hour preservice training.', description: 'Complete your GA state preservice training requirement online in one weekend.', website: 'gapreservice.example.com', phone: '(770) 555 0188' },
  { id: 4, name: 'Compliance Coach Consulting', category: 'Consulting', icon: '📋', tagline: 'Stay licensing ready year round.', description: 'Mock inspections, compliance audits, and policy review for licensed centers.', website: 'compliancecoach.example.com', phone: '(770) 555 0192', featured: true },
  { id: 5, name: 'Daycare Marketing Studio', category: 'Consulting', icon: '📣', tagline: 'Fill your enrollment waitlist.', description: 'Local SEO, parent referral campaigns, and Google Business optimization for daycares.', website: 'daycaremarketing.example.com', phone: '(404) 555 0211' },
  { id: 6, name: 'Established Daycare for Sale · Atlanta', category: 'Advertising', icon: '🏢', tagline: '24 child licensed center · $185,000', description: 'Profitable 24 child licensed daycare in southeast Atlanta. Established 12 years, owner retiring. Equipment and curriculum included.', website: 'contact via platform', phone: 'Listing #1023' }
];

// Storage helpers - uses browser localStorage (persists across sessions)
const STORE = {
  async get(key) {
    try {
      const v = localStorage.getItem(key);
      return v ? JSON.parse(v) : null;
    } catch (e) { return null; }
  },
  async set(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); }
    catch (e) {
      // Quota exceeded - clear oldest non-account data
      console.warn('Storage full, clearing some cached data');
    }
  },
  async del(key) {
    try { localStorage.removeItem(key); }
    catch (e) {}
  }
};

// Account helpers - proper multi-account system keyed by email + role
const ACCOUNTS = {
  async getAll() {
    return (await STORE.get('kk_accounts')) || [];
  },
  async findByEmail(email) {
    const all = await this.getAll();
    return all.find(a => a.email.toLowerCase() === (email || '').toLowerCase());
  },
  async findByEmailAndRole(email, role) {
    const all = await this.getAll();
    return all.find(a => a.email.toLowerCase() === (email || '').toLowerCase() && a.role === role);
  },
  async save(account) {
    const all = await this.getAll();
    const idx = all.findIndex(a => a.email.toLowerCase() === account.email.toLowerCase() && a.role === account.role);
    if (idx >= 0) all[idx] = account;
    else all.push(account);
    await STORE.set('kk_accounts', all);
    return account;
  },
  async updatePassword(email, role, newPassword) {
    const all = await this.getAll();
    const idx = all.findIndex(a => a.email.toLowerCase() === email.toLowerCase() && a.role === role);
    if (idx >= 0) {
      all[idx].password = newPassword;
      await STORE.set('kk_accounts', all);
      return true;
    }
    return false;
  }
};

export default function App() {
  const [appLoaded, setAppLoaded] = useState(false);
  const [userType, setUserType] = useState(null);
  const [view, setView] = useState('welcome');
  const [tab, setTab] = useState('jobs');
  const [signedIn, setSignedIn] = useState(false);
  const [profileComplete, setProfileComplete] = useState(false);
  const [stateSel, setStateSel] = useState('Georgia');
  const [saved, setSaved] = useState([]);
  const [applied, setApplied] = useState([]);
  const [jobSearch, setJobSearch] = useState('');
  const [jobFilter, setJobFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('myArea');
  const [plan, setPlan] = useState(null);
  const [posted, setPosted] = useState([]);
  const [showPost, setShowPost] = useState(false);
  const [authPromptJob, setAuthPromptJob] = useState(null);
  const [pendingApply, setPendingApply] = useState(null);
  const [partnerCat, setPartnerCat] = useState('All');
  const [showListBiz, setShowListBiz] = useState(false);
  const [userListings, setUserListings] = useState([]);
  const [viewingApplicantsFor, setViewingApplicantsFor] = useState(null);
  const [viewingApplicantDetail, setViewingApplicantDetail] = useState(null);
  const [jobApplicants, setJobApplicants] = useState({});
  const [showSaveToast, setShowSaveToast] = useState(false);
  const [newJob, setNewJob] = useState({ title: '', location: '', type: 'Full Time', pay: '', description: '' });
  const [signup, setSignup] = useState({ name: '', email: '', phone: '', state: 'Georgia', center: '', password: '' });
  const [loginForm, setLoginForm] = useState({ email: '', password: '', rememberMe: false });
  const [loginError, setLoginError] = useState('');
  const [signupError, setSignupError] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [enteredCode, setEnteredCode] = useState('');
  const [codeError, setCodeError] = useState('');
  const [resetStep, setResetStep] = useState('email');
  const [resetData, setResetData] = useState({ email: '', code: '', newPassword: '', confirmPassword: '', role: '' });
  const [resetError, setResetError] = useState('');
  const [resetSuccessToast, setResetSuccessToast] = useState(false);
  const [guestBannerDismissed, setGuestBannerDismissed] = useState(false);

  // Browser back/forward integration. Each setView pushes a history entry,
  // popstate restores the view, so the browser back button (and the in-app
  // back arrow via window.history.back()) returns to the previous view.
  const skipPushRef = useRef(false);
  const ourPushCountRef = useRef(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!window.history.state || !window.history.state.kkView) {
      window.history.replaceState({ kkView: view }, '');
    }
    const onPop = (e) => {
      const target = e.state && e.state.kkView;
      if (target) {
        skipPushRef.current = true;
        setView(target);
        if (ourPushCountRef.current > 0) ourPushCountRef.current -= 1;
      }
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!appLoaded) return;
    if (skipPushRef.current) { skipPushRef.current = false; return; }
    if (window.history.state && window.history.state.kkView === view) return;
    window.history.pushState({ kkView: view }, '');
    ourPushCountRef.current += 1;
  }, [view, appLoaded]);

  const goBack = () => {
    if (typeof window !== 'undefined' && ourPushCountRef.current > 0) {
      window.history.back();
    } else {
      setView(signedIn ? 'app' : 'welcome');
    }
  };
  // Messaging
  const [conversations, setConversations] = useState([]);
  const [activeConvId, setActiveConvId] = useState(null);
  const [messageDraft, setMessageDraft] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  // Partner accounts
  const [partnerLoginForm, setPartnerLoginForm] = useState({ email: '', password: '' });
  const [partnerSignup, setPartnerSignup] = useState({ name: '', email: '', phone: '', password: '', businessName: '', category: 'Training' });
  const [partnerError, setPartnerError] = useState('');
  const [isPartner, setIsPartner] = useState(false);
  const [newListing, setNewListing] = useState({ category: 'Training', name: '', tagline: '', description: '', website: '', phone: '' });
  const [profile, setProfile] = useState({
    photo: '', city: '', state: 'Georgia', zip: '',
    years: '', ageGroups: [], education: '',
    credentials: [], bgCheck: '', availability: '',
    positions: [], bio: '', resume: '', credentialFiles: []
  });

  // Load from storage on mount
  useEffect(() => {
    (async () => {
      const auth = await STORE.get('kk_auth');
      if (auth) {
        // Only auto sign in if rememberMe was checked
        if (auth.rememberMe !== false && auth.signedIn) {
          setSignedIn(true);
          setUserType(auth.userType || null);
          setProfileComplete(auth.profileComplete || false);
          setPlan(auth.plan || null);
          setView('app');
        } else {
          // Keep userType/plan loaded but require fresh login
          setUserType(auth.userType || null);
          setProfileComplete(auth.profileComplete || false);
          setPlan(auth.plan || null);
        }
      }
      const sign = await STORE.get('kk_signup');
      if (sign) setSignup(sign);
      const prof = await STORE.get('kk_profile');
      if (prof) setProfile(prof);
      const jobs = await STORE.get('kk_jobs');
      if (jobs) {
        setApplied(jobs.applied || []);
        setSaved(jobs.saved || []);
        setPosted(jobs.posted || []);
        setJobApplicants(jobs.jobApplicants || {});
      }
      const list = await STORE.get('kk_listings');
      if (list) setUserListings(list);
      const convs = await STORE.get('kk_conversations');
      if (convs) setConversations(convs);
      const banner = await STORE.get('kk_guestBannerDismissed');
      if (banner) setGuestBannerDismissed(true);
      setAppLoaded(true);
    })();
  }, []);

  // Auto-save profile as user fills it in - keyed by email so each account has its own
  useEffect(() => {
    if (appLoaded) {
      STORE.set('kk_profile', profile);
      if (signedIn && signup.email && userType === 'worker') {
        STORE.set(`kk_profile_${signup.email}`, profile);
      }
    }
  }, [profile, appLoaded, signedIn, signup.email, userType]);

  useEffect(() => {
    if (appLoaded) STORE.set('kk_signup', signup);
  }, [signup, appLoaded]);

  // Save owner's posted jobs and applicants per email
  useEffect(() => {
    if (appLoaded && signedIn && signup.email && userType === 'owner') {
      STORE.set(`kk_owner_${signup.email}`, { posted, jobApplicants, plan });
    }
  }, [posted, jobApplicants, plan, appLoaded, signedIn, signup.email, userType]);

  // Save conversations
  useEffect(() => {
    if (appLoaded) STORE.set('kk_conversations', conversations);
  }, [conversations, appLoaded]);

  const saveAuth = () => STORE.set('kk_auth', { signedIn, userType, profileComplete, plan });
  const saveJobs = (a, s, p, j) => STORE.set('kk_jobs', { applied: a, saved: s, posted: p, jobApplicants: j });

  const SAMPLE_APPLICANTS = [
    { name: 'Jasmine Carter', email: 'jasmine.c@example.com', phone: '(404) 555 0192', city: 'Lithonia', state: 'Georgia', years: '3 to 5 years', credentials: ['CDA', 'CPR and First Aid', 'State Preservice'], bgCheck: 'Cleared and current', availability: 'Full Time', positions: ['Lead Teacher', 'Assistant Teacher'], ageGroups: ['Toddler', 'Preschool'], education: 'Associate Degree', bio: 'Warm, experienced teacher who loves the toddler age group. Strong communicator with families and committed to early childhood education.', resume: 'jasmine_carter_resume.pdf', credentialFiles: ['CDA_certificate.pdf', 'CPR_card.jpg'], appliedDate: '2 days ago' },
    { name: 'Michelle Thompson', email: 'mthompson@example.com', phone: '(770) 555 0234', city: 'Conyers', state: 'Georgia', years: '6 to 10 years', credentials: ['CDA', 'CPR and First Aid', 'Associate in ECE', 'Director Credential'], bgCheck: 'Cleared and current', availability: 'Full Time', positions: ['Lead Teacher', 'Assistant Director'], ageGroups: ['Preschool', 'Pre K'], education: 'Bachelor Degree', bio: 'Eight years in licensed centers, ready for a leadership track role. Currently completing my Bachelor in ECE.', resume: 'michelle_thompson_resume.pdf', credentialFiles: ['CDA_renewal_2025.pdf', 'CPR_2026.jpg', 'AAS_transcript.pdf'], appliedDate: '3 days ago' },
    { name: 'Brittany Wilson', email: 'b.wilson@example.com', phone: '(678) 555 0381', city: 'Decatur', state: 'Georgia', years: '1 to 2 years', credentials: ['CPR and First Aid', 'State Preservice'], bgCheck: 'Cleared and current', availability: 'Both', positions: ['Assistant Teacher', 'Floater'], ageGroups: ['Infant', 'Toddler'], education: 'Some College', bio: 'New to formal childcare but raised 4 nieces and nephews. Working on my CDA this year.', resume: 'brittany_wilson_resume.pdf', credentialFiles: ['CPR_card.jpg'], appliedDate: '5 days ago' }
  ];

  const toggleSave = id => {
    const next = saved.includes(id) ? saved.filter(x => x !== id) : [...saved, id];
    setSaved(next);
    saveJobs(applied, next, posted, jobApplicants);
  };
  const toggleArr = (arr, item) => arr.includes(item) ? arr.filter(x => x !== item) : [...arr, item];

  const tryApply = (job) => {
    if (!signedIn || !profileComplete) { setAuthPromptJob(job); return; }
    if (!applied.includes(job.id)) {
      const nextApplied = [...applied, job.id];
      const snap = { name: signup.name || 'You', email: signup.email, phone: signup.phone, photo: profile.photo, ...profile, appliedDate: 'Just now' };
      const nextApps = { ...jobApplicants, [job.id]: [...(jobApplicants[job.id] || []), snap] };
      setApplied(nextApplied);
      setJobApplicants(nextApps);
      saveJobs(nextApplied, saved, posted, nextApps);
      // Auto-start a conversation so the applicant and owner can chat
      // Owner email comes from posted jobs (real owner) or we use a placeholder for sample jobs
      const ownerEmail = job.ownerEmail || `${(job.center || 'center').toLowerCase().replace(/[^a-z0-9]/g, '')}@example.com`;
      const convKey = [signup.email, ownerEmail].sort().join('|') + '#' + job.title;
      if (!conversations.find(co => co.key === convKey)) {
        const newConv = {
          id: Date.now(),
          key: convKey,
          participants: [
            { email: signup.email, name: signup.name, role: 'worker', photo: profile.photo, center: '' },
            { email: ownerEmail, name: job.center, role: 'owner', photo: '', center: job.center }
          ],
          jobTitle: job.title,
          messages: [
            { from: signup.email, text: `Hi! I just applied to your ${job.title} position. Looking forward to hearing from you.`, time: new Date().toISOString(), system: false }
          ],
          lastUpdated: new Date().toISOString(),
          unreadFor: [ownerEmail]
        };
        setConversations([...conversations, newConv]);
      }
    }
  };

  const beginSignup = (type) => { setUserType(type); setView('signup'); };

  const completeSignup = async () => {
    setSignupError('');
    const missing = [];
    if (!signup.name) missing.push('your name');
    if (!signup.email) missing.push('email');
    if (!signup.phone) missing.push('phone');
    if (!signup.password) missing.push('password');
    if (userType === 'owner' && !signup.center) missing.push('center name');
    if (missing.length > 0) {
      setSignupError(`Please fill in: ${missing.join(', ')}.`);
      return;
    }
    if (signup.password.length < 6) {
      setSignupError('Password must be at least 6 characters.');
      return;
    }
    // Check if email already in use FOR THIS ROLE
    const existing = await ACCOUNTS.findByEmailAndRole(signup.email, userType);
    if (existing) {
      setSignupError(`A ${userType === 'worker' ? 'teacher' : 'daycare center'} account already exists with this email. Try logging in instead.`);
      return;
    }
    // Generate 6-digit verification code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setVerificationCode(code);
    setEnteredCode('');
    setCodeError('');
    setView('verifyEmail');
  };

  const handleVerifyEmail = async () => {
    setCodeError('');
    if (enteredCode.length !== 6) {
      setCodeError('Enter the 6 digit code from your email.');
      return;
    }
    if (enteredCode !== verificationCode) {
      setCodeError("That code doesn't match. Check your email and try again.");
      return;
    }
    // SAVE THE ACCOUNT to accounts list
    await ACCOUNTS.save({
      email: signup.email,
      password: signup.password,
      role: userType,
      name: signup.name,
      phone: signup.phone,
      state: signup.state,
      center: signup.center || '',
      createdAt: new Date().toISOString(),
      emailVerified: true
    });
    setSignedIn(true);
    await STORE.set('kk_auth', { signedIn: true, userType, profileComplete: false, plan: null, emailVerified: true, currentEmail: signup.email });
    await STORE.set('kk_signup', signup); // keep current session sync
    if (userType === 'owner') {
      if (!plan) setView('pricing'); else setView('app');
    } else {
      setProfile({...profile, state: signup.state});
      setView('profile');
    }
  };

  const resendCode = () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setVerificationCode(code);
    setEnteredCode('');
    setCodeError('');
  };

  const completeProfile = async () => {
    setProfileComplete(true);
    setStateSel(profile.state);
    await STORE.set('kk_auth', { signedIn: true, userType, profileComplete: true, plan });
    if (pendingApply) {
      const nextApplied = [...applied, pendingApply];
      const snap = { name: signup.name || 'You', email: signup.email, phone: signup.phone, photo: profile.photo, ...profile, appliedDate: 'Just now' };
      const nextApps = { ...jobApplicants, [pendingApply]: [...(jobApplicants[pendingApply] || []), snap] };
      setApplied(nextApplied);
      setJobApplicants(nextApps);
      saveJobs(nextApplied, saved, posted, nextApps);
      setPendingApply(null);
    }
    setView('app');
    setTab('jobs');
    setShowSaveToast(true);
    setTimeout(() => setShowSaveToast(false), 3000);
  };

  const handlePost = () => {
    const newId = Date.now();
    const nextPosted = [{ id: newId, ...newJob, center: signup.center || 'Your Center', state: signup.state, posted: 'Just now', tags: ['New Posting'], verified: true, ownerEmail: signup.email }, ...posted];
    let nextApps = jobApplicants;
    if (posted.length === 0) nextApps = { ...jobApplicants, [newId]: SAMPLE_APPLICANTS };
    setPosted(nextPosted);
    setJobApplicants(nextApps);
    saveJobs(applied, saved, nextPosted, nextApps);
    setNewJob({ title: '', location: '', type: 'Full Time', pay: '', description: '' });
    setShowPost(false);
  };

  const useTemplate = t => {
    setNewJob({ title: t.title, location: '', type: 'Full Time', pay: t.pay, description: t.summary + '\n\nRequirements:\n' + t.requirements.map(r => '• ' + r).join('\n') });
    setShowPost(true);
    setTab('jobs');
  };

  const handleListBusiness = () => {
    const nextList = [...userListings, { id: Date.now(), ...newListing, featured: false, icon: newListing.category === 'Training' ? '🎓' : newListing.category === 'Consulting' ? '💼' : '📢' }];
    setUserListings(nextList);
    STORE.set('kk_listings', nextList);
    setNewListing({ category: 'Training', name: '', tagline: '', description: '', website: '', phone: '' });
    setShowListBiz(false);
  };

  // Photo upload with auto-resize so storage doesn't bloat
  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { alert('Photo must be under 5MB'); return; }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const max = 400;
        let { width, height } = img;
        if (width > height) { if (width > max) { height *= max / width; width = max; } }
        else { if (height > max) { width *= max / height; height = max; } }
        canvas.width = width; canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        setProfile(p => ({ ...p, photo: canvas.toDataURL('image/jpeg', 0.85) }));
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleResumeUpload = (e) => {
    const f = e.target.files?.[0];
    if (f) setProfile({...profile, resume: f.name});
  };

  const handleCredFiles = (e) => {
    const files = Array.from(e.target.files || []);
    const names = files.map(f => f.name);
    setProfile({...profile, credentialFiles: [...(profile.credentialFiles || []), ...names]});
  };

  const removeCredFile = (name) => setProfile({...profile, credentialFiles: profile.credentialFiles.filter(f => f !== name)});

  const signOut = async () => {
    // Only clear session, preserve accounts list and per-account data
    await STORE.del('kk_auth');
    await STORE.del('kk_signup');
    await STORE.del('kk_profile');
    await STORE.del('kk_jobs');
    await STORE.del('kk_guestBannerDismissed');
    setSignedIn(false); setProfileComplete(false); setUserType(null);
    setView('welcome'); setApplied([]); setSaved([]); setPosted([]); setPlan(null);
    setJobApplicants({});
    setIsPartner(false);
    setGuestBannerDismissed(false);
    setProfile({ photo: '', city: '', state: 'Georgia', zip: '', years: '', ageGroups: [], education: '', credentials: [], bgCheck: '', availability: '', positions: [], bio: '', resume: '', credentialFiles: [] });
    setSignup({ name: '', email: '', phone: '', state: 'Georgia', center: '', password: '' });
  };

  // MESSAGING HELPERS
  const startOrOpenConversation = (otherParty) => {
    // otherParty = { email, name, role, photo?, center?, jobTitle? }
    const myEmail = signup.email;
    const myRole = userType;
    const convKey = [myEmail, otherParty.email].sort().join('|') + (otherParty.jobTitle ? '#' + otherParty.jobTitle : '');
    const existing = conversations.find(c => c.key === convKey);
    if (existing) {
      setActiveConvId(existing.id);
      setTab('messages');
      return;
    }
    const newConv = {
      id: Date.now(),
      key: convKey,
      participants: [
        { email: myEmail, name: signup.name, role: myRole, photo: profile.photo, center: signup.center || '' },
        { email: otherParty.email, name: otherParty.name, role: otherParty.role, photo: otherParty.photo || '', center: otherParty.center || '' }
      ],
      jobTitle: otherParty.jobTitle || '',
      messages: [],
      lastUpdated: new Date().toISOString(),
      unreadFor: []
    };
    setConversations([...conversations, newConv]);
    setActiveConvId(newConv.id);
    setTab('messages');
  };

  const sendMessage = (convId, text) => {
    if (!text.trim()) return;
    const trimmed = text.trim();
    setConversations(prev => prev.map(c => {
      if (c.id !== convId) return c;
      const otherEmail = c.participants.find(p => p.email !== signup.email)?.email;
      return {
        ...c,
        messages: [...c.messages, { from: signup.email, text: trimmed, time: new Date().toISOString() }],
        lastUpdated: new Date().toISOString(),
        unreadFor: otherEmail ? Array.from(new Set([...(c.unreadFor || []), otherEmail])) : (c.unreadFor || [])
      };
    }));
    setMessageDraft('');
  };

  const markConversationRead = (convId) => {
    setConversations(prev => prev.map(c => c.id !== convId ? c : { ...c, unreadFor: (c.unreadFor || []).filter(e => e !== signup.email) }));
  };

  // Get conversations involving current user
  const myConversations = signedIn && signup.email
    ? conversations.filter(c => c.participants.some(p => p.email === signup.email)).sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated))
    : [];

  const myUnreadCount = myConversations.reduce((sum, c) => sum + ((c.unreadFor || []).includes(signup.email) ? 1 : 0), 0);

  const visibleJobs = useMemo(() => {
    let jobs = SAMPLE_JOBS;
    if (signedIn && userType === 'worker' && profileComplete && locationFilter === 'myArea' && profile.state) {
      jobs = SAMPLE_JOBS.filter(j => j.state === profile.state);
    }
    const q = (jobSearch || '').toLowerCase();
    return jobs.filter(j => {
      const s = !q || [j.title, j.location, j.center].some(v => (v || '').toLowerCase().includes(q));
      const f = jobFilter === 'all' || j.type === jobFilter;
      return s && f;
    });
  }, [signedIn, userType, profileComplete, locationFilter, profile.state, jobSearch, jobFilter]);

  const allPartners = useMemo(() => [...userListings, ...PARTNERS], [userListings]);
  const filteredPartners = useMemo(() => partnerCat === 'All' ? allPartners : allPartners.filter(p => p.category === partnerCat), [partnerCat, allPartners]);
  const info = STATE_LICENSING[stateSel] || { ...DEFAULT_INFO, agency: `${stateSel} Department of Child Care Licensing`, website: 'childcare.gov', backgroundCheck: { ...DEFAULT_INFO.backgroundCheck, link: 'childcare.gov' } };

  // AVATAR helper
  const Avatar = ({ name, photo, size = 38 }) => {
    if (photo) return <img src={photo} alt={name} style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />;
    const initials = (name || '?').split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
    const colors = [c.primary, c.coral, c.gold, c.success, c.blue];
    const idx = (name || '').length % colors.length;
    return (
      <div style={{ width: size, height: size, borderRadius: '50%', background: colors[idx], color: c.white, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: size * 0.38, flexShrink: 0 }}>{initials}</div>
    );
  };

  const Logo = ({ size = 'md', onDark = false }) => (
    <img
      src="/logo.png"
      alt="Rellim KidKare Konnect"
      style={{
        height: size === 'lg' ? 110 : 52,
        width: 'auto',
        display: 'block',
        maxWidth: '100%'
      }}
    />
  );

  const buildTabs = () => {
    // Partners get a streamlined view
    if (signedIn && userType === 'partner') {
      return [
        { id: 'partners', label: 'My Listings', icon: Handshake },
        { id: 'jobs', label: 'Browse Jobs', icon: Briefcase },
        { id: 'training', label: 'Training Hub', icon: GraduationCap }
      ];
    }
    const base = [
      { id: 'jobs', label: signedIn && userType === 'owner' ? 'My Job Posts' : 'Browse Jobs', icon: Briefcase },
      { id: 'training', label: 'Training Hub', icon: GraduationCap },
      { id: 'licensing', label: 'State Licensing', icon: MapPin },
      { id: 'partners', label: 'Partners', icon: Handshake }
    ];
    if (!signedIn || userType === 'owner') base.splice(1, 0, { id: 'templates', label: 'Job Templates', icon: LayoutGrid });
    if (signedIn && (userType === 'worker' || userType === 'owner')) base.splice(1, 0, { id: 'messages', label: 'Messages', icon: Mail, badge: myUnreadCount });
    if (signedIn && userType === 'worker' && profileComplete) base.push({ id: 'myProfile', label: 'My Profile', icon: User });
    return base;
  };

  const Header = () => {
    const tabs = buildTabs();
    return (
      <header style={{ background: c.white, borderBottom: `1px solid ${c.border}`, position: 'sticky', top: 0, zIndex: 50 }}>
        <div className="max-w-7xl mx-auto px-4 md:px-6 flex items-center justify-between gap-2" style={{ minHeight: 68 }}>
          <button onClick={() => setView(signedIn ? 'app' : 'welcome')} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><Logo /></button>
          <nav className="hidden md:flex items-center gap-1 flex-1 justify-center">
            {tabs.map(t => (
              <button key={t.id} onClick={() => { if (!signedIn) { setView('roleChoice'); return; } setView('app'); setTab(t.id); }} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 11px', borderRadius: 8, background: view === 'app' && tab === t.id ? c.paleBlue : 'transparent', color: view === 'app' && tab === t.id ? c.primary : c.text, fontSize: 13, fontWeight: view === 'app' && tab === t.id ? 700 : 500, border: 'none', cursor: 'pointer', position: 'relative' }}>
                <t.icon size={14} />{t.label}
                {t.badge > 0 && <span style={{ background: c.coral, color: c.white, fontSize: 9.5, fontWeight: 700, padding: '1px 6px', borderRadius: 999, marginLeft: 2 }}>{t.badge}</span>}
              </button>
            ))}
          </nav>
          <div className="flex items-center gap-1.5">
            {(!signedIn || userType === 'owner') && (
              <button onClick={() => setView('pricing')} style={{ padding: '7px 10px', background: 'none', border: 'none', color: c.primary, fontSize: 12.5, fontWeight: 700, cursor: 'pointer', borderRadius: 7 }}>Pricing</button>
            )}
            {signedIn ? (
              <>
                <Avatar name={signup.name || 'T B'} photo={profile.photo} size={34} />
                <button onClick={signOut} style={{ background: 'none', border: 'none', cursor: 'pointer', color: c.textMuted, padding: 4 }} title="Sign out"><LogOut size={17} /></button>
              </>
            ) : (
              <>
                <button onClick={() => setView('login')} style={{ padding: '7px 10px', background: 'none', border: `1px solid ${c.border}`, color: c.text, fontSize: 12.5, fontWeight: 600, cursor: 'pointer', borderRadius: 7 }}>Log In</button>
                <button onClick={() => setView('roleChoice')} style={{ padding: '8px 14px', background: c.primary, color: c.white, border: 'none', borderRadius: 7, fontSize: 12.5, fontWeight: 700, cursor: 'pointer' }}>Sign Up</button>
              </>
            )}
          </div>
        </div>
        <div className="md:hidden relative" style={{ borderTop: `1px solid ${c.border}` }}>
          <div className="flex overflow-x-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {tabs.map(t => (
              <button key={t.id} onClick={() => { if (!signedIn) { setView('roleChoice'); return; } setView('app'); setTab(t.id); }} style={{ flex: '0 0 auto', minWidth: 72, padding: '10px 10px', background: 'transparent', color: view === 'app' && tab === t.id ? c.primary : c.textMuted, fontSize: 10.5, fontWeight: 600, border: 'none', cursor: 'pointer', borderBottom: view === 'app' && tab === t.id ? `2px solid ${c.primary}` : '2px solid transparent', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, position: 'relative', whiteSpace: 'nowrap' }}>
                <div style={{ position: 'relative' }}>
                  <t.icon size={16} />
                  {t.badge > 0 && <span style={{ position: 'absolute', top: -4, right: -8, background: c.coral, color: c.white, fontSize: 9, fontWeight: 700, padding: '1px 5px', borderRadius: 999, minWidth: 14, textAlign: 'center' }}>{t.badge}</span>}
                </div>
                {t.label}
              </button>
            ))}
          </div>
          <div aria-hidden="true" style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 28, background: `linear-gradient(to left, ${c.white}, rgba(255,255,255,0))`, pointerEvents: 'none' }} />
        </div>
      </header>
    );
  };

  if (!appLoaded) {
    return (
      <div style={{ minHeight: '100vh', background: c.cream, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui, sans-serif' }}>
        <div style={{ textAlign: 'center', color: c.primary }}>
          <Logo size="lg" />
          <div style={{ marginTop: 14, fontSize: 13, color: c.textMuted }}>Loading...</div>
        </div>
      </div>
    );
  }

  // WELCOME
  if (view === 'welcome') {
    return (
      <div style={{ background: c.cream, fontFamily: 'system-ui, sans-serif', minHeight: '100vh' }}>
        <Header />
        <section style={{ background: 'linear-gradient(135deg, #FFF8EE 0%, #FAF6EE 55%, #FFE9D2 100%)', position: 'relative', overflow: 'hidden' }}>
          <div aria-hidden style={{ position: 'absolute', top: -140, right: -120, width: 460, height: 460, borderRadius: '50%', background: 'radial-gradient(circle, #FFD166 0%, transparent 70%)', opacity: 0.45, pointerEvents: 'none' }} />
          <div aria-hidden style={{ position: 'absolute', bottom: -160, left: -120, width: 380, height: 380, borderRadius: '50%', background: 'radial-gradient(circle, #FF8C42 0%, transparent 70%)', opacity: 0.22, pointerEvents: 'none' }} />
          <div className="max-w-6xl mx-auto px-6 pt-12 pb-14 relative">
            <div className="grid md:grid-cols-2 gap-10 items-center">
              <div className="text-center md:text-left">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-5" style={{ background: c.white, border: `1px solid ${c.border}`, color: c.primary, fontSize: 12.5, fontWeight: 600 }}>
                  <Verified size={13} fill={c.gold} stroke={c.white} strokeWidth={2.5} />
                  The Premier Daycare Hiring Platform
                </div>
                <h1 style={{ fontSize: 'clamp(32px, 5.5vw, 56px)', fontWeight: 800, color: c.navy, lineHeight: 1.05, letterSpacing: '-0.035em', marginBottom: 16 }}>
                  Where Great<br/>
                  <span style={{ background: 'linear-gradient(135deg, #2B5F7E 0%, #FF8C42 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Childcare Begins</span>
                </h1>
                <p style={{ fontSize: 16.5, color: c.textMuted, lineHeight: 1.6, marginBottom: 6, maxWidth: 520 }}>
                  Connecting qualified daycare workers with licensed centers through industry specific matching and trusted training partners.
                </p>
              </div>
              <div className="relative">
                <div aria-hidden style={{ position: 'absolute', top: -18, right: -18, width: 120, height: 120, borderRadius: '50%', background: '#FFD166', opacity: 0.7, zIndex: 0 }} />
                <div aria-hidden style={{ position: 'absolute', bottom: -22, left: -22, width: 95, height: 95, borderRadius: '50%', background: '#FF8C42', opacity: 0.48, zIndex: 0 }} />
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <HeroPhoto />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* TWO PATHS - PROMINENT ON HOME PAGE */}
        <section className="max-w-5xl mx-auto px-4 md:px-6 py-12">
          <div className="text-center mb-7">
            <div style={{ fontSize: 12, color: c.primary, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8 }}>Sign Up or Log In</div>
            <h2 style={{ fontSize: 'clamp(24px, 4vw, 32px)', fontWeight: 800, color: c.navy, letterSpacing: '-0.025em' }}>Which one are you?</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {/* TEACHER PATH */}
            <div style={{ background: c.white, border: `2px solid ${c.border}`, borderRadius: 18, padding: 26, position: 'relative', overflow: 'hidden' }} className="hover:border-blue-400 hover:shadow-lg transition-all">
              <div style={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: '50%', background: c.paleBlue, opacity: 0.7 }} />
              <div className="relative">
                <div className="flex items-center gap-3 mb-3">
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: c.lightBlue, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><User size={22} color={c.primary} /></div>
                  <div style={{ display: 'inline-block', fontSize: 10.5, padding: '3px 9px', background: c.success, color: c.white, borderRadius: 999, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Free Forever</div>
                </div>
                <h3 style={{ fontSize: 22, fontWeight: 800, color: c.navy, letterSpacing: '-0.02em', marginBottom: 6 }}>I'm a Teacher or Caregiver</h3>
                <p style={{ color: c.textMuted, fontSize: 14, lineHeight: 1.5, marginBottom: 14 }}>Looking for a daycare job. Want to build a profile, upload my resume, and apply.</p>
                <div className="space-y-1.5 mb-5">
                  {['Free profile with photo and credentials', 'Jobs in your city and state', 'State licensing roadmap'].map((f, i) => (
                    <div key={i} className="flex items-center gap-2" style={{ fontSize: 13, color: c.text }}>
                      <CheckCircle2 size={14} color={c.success} />{f}
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => beginSignup('worker')} style={{ flex: 1, padding: '11px', background: c.primary, color: c.white, border: 'none', borderRadius: 9, fontSize: 13.5, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>Sign Up Free <ArrowRight size={14} /></button>
                  <button onClick={() => setView('login')} style={{ padding: '11px 14px', background: c.white, color: c.primary, border: `1.5px solid ${c.primary}`, borderRadius: 9, fontSize: 13.5, fontWeight: 700, cursor: 'pointer' }}>Log In</button>
                </div>
              </div>
            </div>

            {/* OWNER PATH */}
            <div style={{ background: `linear-gradient(135deg, ${c.primaryDark} 0%, ${c.navy} 100%)`, borderRadius: 18, padding: 26, color: c.white, position: 'relative', overflow: 'hidden' }} className="hover:shadow-xl transition-all">
              <div style={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, borderRadius: '50%', background: `radial-gradient(circle, ${c.gold}33 0%, transparent 70%)` }} />
              <div className="relative">
                <div className="flex items-center gap-3 mb-3">
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Building2 size={22} color={c.gold} /></div>
                  <div style={{ display: 'inline-block', fontSize: 10.5, padding: '3px 9px', background: c.gold, color: c.navy, borderRadius: 999, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>From $79 / month</div>
                </div>
                <h3 style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 6 }}>I'm a Daycare Center</h3>
                <p style={{ color: 'rgba(255,255,255,0.78)', fontSize: 14, lineHeight: 1.5, marginBottom: 14 }}>I own or manage a daycare. I want to post jobs and review applicant profiles.</p>
                <div className="space-y-1.5 mb-5">
                  {['Post jobs in 2 minutes with templates', 'See applicant profiles and credentials', 'Verified background check status'].map((f, i) => (
                    <div key={i} className="flex items-center gap-2" style={{ fontSize: 13, color: 'rgba(255,255,255,0.92)' }}>
                      <CheckCircle2 size={14} color={c.gold} />{f}
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => beginSignup('owner')} style={{ flex: 1, padding: '11px', background: c.gold, color: c.navy, border: 'none', borderRadius: 9, fontSize: 13.5, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>Sign Up <ArrowRight size={14} /></button>
                  <button onClick={() => setView('login')} style={{ padding: '11px 14px', background: 'transparent', color: c.gold, border: `1.5px solid ${c.gold}`, borderRadius: 9, fontSize: 13.5, fontWeight: 700, cursor: 'pointer' }}>Log In</button>
                </div>
              </div>
            </div>
          </div>

          <p style={{ textAlign: 'center', marginTop: 18, fontSize: 13, color: c.textMuted }}>
            Looking to list your training, consulting, or daycare for sale? <button onClick={() => setView('partnerSignup')} style={{ color: c.primary, fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>Sign up as a partner</button> · <button onClick={() => setView('partnerLogin')} style={{ color: c.primary, fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>Partner login</button>
          </p>
        </section>

        <section style={{ background: c.white, borderTop: `1px solid ${c.border}` }}>
          <div className="max-w-6xl mx-auto px-6 py-7">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[{v:'2,400+',l:'Active Jobs'},{v:'850+',l:'Centers Hiring'},{v:'12,000+',l:'Verified Educators'},{v:'All 50',l:'States'}].map((s,i) => (
                <div key={i} className="text-center">
                  <div style={{ fontSize: 24, fontWeight: 800, color: c.primary, letterSpacing: '-0.025em', marginBottom: 3 }}>{s.v}</div>
                  <div style={{ fontSize: 10.5, color: c.textMuted, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section style={{ background: c.cream, borderTop: `1px solid ${c.border}` }}>
          <div className="max-w-6xl mx-auto px-6 py-8">
            <div className="text-center mb-5">
              <div style={{ fontSize: 11.5, color: c.primary, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 6 }}>Why KidKare</div>
              <h2 style={{ fontSize: 'clamp(20px, 3.5vw, 26px)', fontWeight: 800, color: c.navy, letterSpacing: '-0.02em' }}>Built for trusted hiring</h2>
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              <div style={{ background: c.white, border: `1px solid ${c.border}`, borderRadius: 12, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: c.lightBlue, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Shield size={18} color={c.primary} /></div>
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: c.navy, marginBottom: 2 }}>Background check verified profiles</div>
                  <div style={{ fontSize: 11.5, color: c.textMuted }}>Cleared status shown on every candidate.</div>
                </div>
              </div>
              <div style={{ background: c.white, border: `1px solid ${c.border}`, borderRadius: 12, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: '#FBF0D8', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Building2 size={18} color={c.goldDark || c.gold} /></div>
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: c.navy, marginBottom: 2 }}>Used by 12 centers across Georgia</div>
                  <div style={{ fontSize: 11.5, color: c.textMuted }}>Growing weekly in our beta launch.</div>
                </div>
              </div>
              <div style={{ background: c.white, border: `1px solid ${c.border}`, borderRadius: 12, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: c.paleBlue, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Verified size={18} color={c.primary} fill={c.gold} /></div>
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: c.navy, marginBottom: 2 }}>DECAL informed</div>
                  <div style={{ fontSize: 11.5, color: c.textMuted }}>Aligned with Georgia state licensing.</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    );
  }

  // ROLE CHOICE
  if (view === 'roleChoice') {
    return (
      <div style={{ minHeight: '100vh', background: c.cream, fontFamily: 'system-ui, sans-serif' }}>
        <Header />
        <div className="max-w-4xl mx-auto px-6 py-10">
          <button onClick={goBack} style={{ color: c.textMuted, fontSize: 13, background: 'none', border: 'none', cursor: 'pointer', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 4 }}><ChevronLeft size={14} /> Back</button>
          <div className="text-center mb-7">
            <h2 style={{ fontSize: 'clamp(24px, 4vw, 32px)', fontWeight: 800, color: c.navy, letterSpacing: '-0.025em', marginBottom: 6 }}>How are you joining us?</h2>
            <p style={{ fontSize: 15, color: c.textMuted }}>Pick the option that fits you.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <button onClick={() => beginSignup('worker')} style={{ background: c.white, border: `2px solid ${c.border}`, borderRadius: 16, padding: 22, textAlign: 'left', cursor: 'pointer' }} className="hover:shadow-lg transition-shadow">
              <div style={{ width: 44, height: 44, borderRadius: 11, background: c.lightBlue, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}><User size={19} color={c.primary} /></div>
              <div style={{ display: 'inline-block', fontSize: 10, padding: '3px 8px', background: c.success, color: c.white, borderRadius: 999, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>Free Forever</div>
              <h3 style={{ fontSize: 17, fontWeight: 800, color: c.navy, marginBottom: 4 }}>Teacher or Applicant</h3>
              <p style={{ fontSize: 12.5, color: c.textMuted, lineHeight: 1.5, marginBottom: 8 }}>Looking for a daycare job. Build a profile and apply.</p>
              <div style={{ color: c.primary, fontWeight: 700, fontSize: 12.5, display: 'flex', alignItems: 'center', gap: 6 }}>Continue <ArrowRight size={12} /></div>
            </button>
            <button onClick={() => beginSignup('owner')} style={{ background: `linear-gradient(135deg, ${c.primaryDark} 0%, ${c.navy} 100%)`, border: `2px solid ${c.primary}`, borderRadius: 16, padding: 22, textAlign: 'left', cursor: 'pointer', color: c.white }} className="hover:shadow-xl transition-shadow">
              <div style={{ width: 44, height: 44, borderRadius: 11, background: 'rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}><Building2 size={19} color={c.gold} /></div>
              <div style={{ display: 'inline-block', fontSize: 10, padding: '3px 8px', background: c.gold, color: c.navy, borderRadius: 999, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>From $79 / month</div>
              <h3 style={{ fontSize: 17, fontWeight: 800, marginBottom: 4 }}>Daycare Center</h3>
              <p style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.8)', lineHeight: 1.5, marginBottom: 8 }}>I own or manage a daycare. Post jobs and review applicants.</p>
              <div style={{ color: c.gold, fontWeight: 700, fontSize: 12.5, display: 'flex', alignItems: 'center', gap: 6 }}>Continue <ArrowRight size={12} /></div>
            </button>
            <button onClick={() => { setView('partnerSignup'); }} style={{ background: c.white, border: `2px solid ${c.gold}`, borderRadius: 16, padding: 22, textAlign: 'left', cursor: 'pointer' }} className="hover:shadow-lg transition-shadow">
              <div style={{ width: 44, height: 44, borderRadius: 11, background: '#FBF0D8', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}><Handshake size={19} color={c.goldDark} /></div>
              <div style={{ display: 'inline-block', fontSize: 10, padding: '3px 8px', background: c.gold, color: c.navy, borderRadius: 999, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>From $39.99 / month</div>
              <h3 style={{ fontSize: 17, fontWeight: 800, color: c.navy, marginBottom: 4 }}>Partner or Vendor</h3>
              <p style={{ fontSize: 12.5, color: c.textMuted, lineHeight: 1.5, marginBottom: 8 }}>Training provider, consultant, or selling a daycare. List your business.</p>
              <div style={{ color: c.goldDark, fontWeight: 700, fontSize: 12.5, display: 'flex', alignItems: 'center', gap: 6 }}>Continue <ArrowRight size={12} /></div>
            </button>
          </div>
          <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: c.textMuted }}>
            Already have an account?{' '}<button onClick={() => setView('login')} style={{ color: c.primary, fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>Log in here</button>
          </p>
        </div>
        <Footer />
      </div>
    );
  }

  // PARTNER SIGN UP
  if (view === 'partnerSignup') {
    const handlePartnerSignup = async () => {
      setPartnerError('');
      const missing = [];
      if (!partnerSignup.name) missing.push('your name');
      if (!partnerSignup.businessName) missing.push('business name');
      if (!partnerSignup.email) missing.push('email');
      if (!partnerSignup.phone) missing.push('phone');
      if (!partnerSignup.password) missing.push('password');
      if (missing.length > 0) {
        setPartnerError(`Please fill in: ${missing.join(', ')}.`);
        return;
      }
      if (partnerSignup.password.length < 6) {
        setPartnerError('Password must be at least 6 characters.');
        return;
      }
      const existing = await ACCOUNTS.findByEmailAndRole(partnerSignup.email, 'partner');
      if (existing) {
        setPartnerError('A partner account already exists with this email. Try logging in instead.');
        return;
      }
      await ACCOUNTS.save({
        email: partnerSignup.email,
        password: partnerSignup.password,
        role: 'partner',
        name: partnerSignup.name,
        phone: partnerSignup.phone,
        businessName: partnerSignup.businessName,
        category: partnerSignup.category,
        createdAt: new Date().toISOString()
      });
      setSignedIn(true);
      setIsPartner(true);
      setUserType('partner');
      setSignup({ name: partnerSignup.name, email: partnerSignup.email, phone: partnerSignup.phone, password: partnerSignup.password, state: 'Georgia', center: partnerSignup.businessName });
      await STORE.set('kk_auth', { signedIn: true, userType: 'partner', isPartner: true, currentEmail: partnerSignup.email, rememberMe: false });
      setView('app');
      setTab('partners');
      // Open list business modal right away
      setNewListing({ category: partnerSignup.category, name: partnerSignup.businessName, tagline: '', description: '', website: '', phone: partnerSignup.phone });
      setShowListBiz(true);
    };

    return (
      <div style={{ minHeight: '100vh', background: c.cream, fontFamily: 'system-ui, sans-serif' }}>
        <Header />
        <div className="max-w-md mx-auto px-6 py-8">
          <button onClick={() => setView('roleChoice')} style={{ color: c.textMuted, fontSize: 13, background: 'none', border: 'none', cursor: 'pointer', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 4 }}><ChevronLeft size={14} /> Change account type</button>
          <div style={{ background: c.white, borderRadius: 16, padding: 26, border: `1px solid ${c.border}` }}>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full mb-4" style={{ background: c.gold, color: c.navy, fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              <Handshake size={11} /> Partner Account
            </div>
            <h2 style={{ fontSize: 23, fontWeight: 800, color: c.navy, letterSpacing: '-0.02em', marginBottom: 5 }}>Create your partner account</h2>
            <p style={{ color: c.textMuted, fontSize: 13.5, marginBottom: 18 }}>Trainers, consultants, and daycare sellers. List your business and reach our community.</p>
            {partnerError && (
              <div style={{ background: '#FEF2F2', border: `1px solid ${c.coral}`, color: c.coralDark, padding: '10px 12px', borderRadius: 8, fontSize: 13, marginBottom: 14, display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                <AlertCircle size={15} style={{ flexShrink: 0, marginTop: 1 }} />{partnerError}
              </div>
            )}
            <div className="space-y-3">
              <Input label="Your Name" value={partnerSignup.name} onChange={v => setPartnerSignup({...partnerSignup, name: v})} placeholder="Toni Brewer" />
              <Input label="Business Name" value={partnerSignup.businessName} onChange={v => setPartnerSignup({...partnerSignup, businessName: v})} placeholder="Atlanta CPR Training" />
              <Select label="Business Category" value={partnerSignup.category} onChange={v => setPartnerSignup({...partnerSignup, category: v})} options={['Training', 'Consulting', 'Advertising']} />
              <Input label="Email" value={partnerSignup.email} onChange={v => setPartnerSignup({...partnerSignup, email: v})} placeholder="you@yourbusiness.com" type="email" />
              <Input label="Password" value={partnerSignup.password} onChange={v => setPartnerSignup({...partnerSignup, password: v})} placeholder="At least 6 characters" type="password" />
              <Input label="Phone" value={partnerSignup.phone} onChange={v => setPartnerSignup({...partnerSignup, phone: v})} placeholder="(555) 123 4567" />
            </div>
            <div style={{ background: c.paleBlue, padding: 11, borderRadius: 9, marginTop: 14, fontSize: 12.5, color: c.primaryDark }}>
              <strong>Pricing:</strong> {partnerSignup.category === 'Advertising' ? '$99 for 30 days' : '$39.99/month'} after signup. Cancel anytime.
            </div>
            <button onClick={handlePartnerSignup} style={{ width: '100%', marginTop: 16, padding: '12px', background: c.gold, color: c.navy, border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>Create Partner Account →</button>
            <p style={{ textAlign: 'center', fontSize: 12.5, color: c.textMuted, marginTop: 12 }}>
              Already have a partner account?{' '}<button onClick={() => setView('partnerLogin')} style={{ color: c.primary, fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer' }}>Log in here</button>
            </p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // PARTNER LOG IN
  if (view === 'partnerLogin') {
    const handlePartnerLogin = async () => {
      setPartnerError('');
      if (!partnerLoginForm.email || !partnerLoginForm.password) {
        setPartnerError('Please enter your email and password to log in.');
        return;
      }
      const account = await ACCOUNTS.findByEmailAndRole(partnerLoginForm.email, 'partner');
      if (!account) {
        setPartnerError("We couldn't find a partner account with that email. Sign up to create one.");
        return;
      }
      if (account.password !== partnerLoginForm.password) {
        setPartnerError("That password doesn't match. Try again.");
        return;
      }
      setSignedIn(true);
      setIsPartner(true);
      setUserType('partner');
      setSignup({ name: account.name, email: account.email, phone: account.phone, password: account.password, state: 'Georgia', center: account.businessName });
      await STORE.set('kk_auth', { signedIn: true, userType: 'partner', isPartner: true, currentEmail: account.email });
      setPartnerLoginForm({ email: '', password: '' });
      setView('app');
      setTab('partners');
    };

    return (
      <div style={{ minHeight: '100vh', background: c.cream, fontFamily: 'system-ui, sans-serif' }}>
        <Header />
        <div className="max-w-md mx-auto px-6 py-8">
          <button onClick={() => setView('welcome')} style={{ color: c.textMuted, fontSize: 13, background: 'none', border: 'none', cursor: 'pointer', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 4 }}><ChevronLeft size={14} /> Back to home</button>
          <div style={{ background: c.white, borderRadius: 16, padding: 28, border: `2px solid ${c.gold}` }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: '#FBF0D8', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
              <Handshake size={22} color={c.goldDark} />
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full mb-4" style={{ background: c.gold, color: c.navy, fontSize: 10.5, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Partner Login
            </div>
            <h2 style={{ fontSize: 23, fontWeight: 800, color: c.navy, letterSpacing: '-0.02em', marginBottom: 5 }}>Partner sign in</h2>
            <p style={{ color: c.textMuted, fontSize: 13.5, marginBottom: 18 }}>For trainers, consultants, and advertisers.</p>
            {partnerError && (
              <div style={{ background: '#FEF2F2', border: `1px solid ${c.coral}`, color: c.coralDark, padding: '10px 12px', borderRadius: 8, fontSize: 13, marginBottom: 14, display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                <AlertCircle size={15} style={{ flexShrink: 0, marginTop: 1 }} />{partnerError}
              </div>
            )}
            <div className="space-y-3">
              <Input label="Email" value={partnerLoginForm.email} onChange={v => setPartnerLoginForm({...partnerLoginForm, email: v})} placeholder="you@yourbusiness.com" type="email" />
              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: c.text, marginBottom: 5 }}>Password</label>
                <input type="password" value={partnerLoginForm.password} onChange={e => setPartnerLoginForm({...partnerLoginForm, password: e.target.value})} placeholder="Your password" onKeyDown={e => e.key === 'Enter' && handlePartnerLogin()} style={{ width: '100%', padding: '9px 12px', fontSize: 13.5, border: `1.5px solid ${c.border}`, borderRadius: 9, background: c.white, color: c.text, outline: 'none' }} />
              </div>
            </div>
            <button onClick={handlePartnerLogin} style={{ width: '100%', marginTop: 16, padding: '12px', background: c.gold, color: c.navy, border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>Log In as Partner</button>
            <div style={{ textAlign: 'center', margin: '14px 0 8px', position: 'relative' }}>
              <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 1, background: c.border }} />
              <span style={{ position: 'relative', background: c.white, padding: '0 12px', fontSize: 12, color: c.textMuted }}>or</span>
            </div>
            <p style={{ textAlign: 'center', fontSize: 13, color: c.textMuted }}>
              New partner?{' '}<button onClick={() => setView('partnerSignup')} style={{ color: c.primary, fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer' }}>Create a partner account</button>
            </p>
            <p style={{ textAlign: 'center', fontSize: 12, color: c.textMuted, marginTop: 8 }}>
              Looking for the regular login?{' '}<button onClick={() => setView('login')} style={{ color: c.primary, fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>Click here</button>
            </p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // LOG IN
  if (view === 'login') {
    const handleLogin = async () => {
      setLoginError('');
      if (!loginForm.email || !loginForm.password) {
        setLoginError('Please enter your email and password to log in.');
        return;
      }
      const accounts = await ACCOUNTS.getAll();
      const matches = accounts.filter(a => a.email.toLowerCase() === loginForm.email.toLowerCase());
      if (matches.length === 0) {
        setLoginError("We couldn't find an account with that email. Sign up to create one.");
        return;
      }
      const validAccount = matches.find(a => a.password === loginForm.password);
      if (!validAccount) {
        setLoginError("That password doesn't match. Try again.");
        return;
      }
      // Restore the session for whichever role's account was matched
      const sessionSignup = {
        name: validAccount.name,
        email: validAccount.email,
        phone: validAccount.phone,
        state: validAccount.state,
        center: validAccount.center || '',
        password: validAccount.password
      };
      setSignup(sessionSignup);
      await STORE.set('kk_signup', sessionSignup);

      setUserType(validAccount.role);
      // Load that user's profile if they're a worker
      if (validAccount.role === 'worker') {
        const savedProfile = await STORE.get(`kk_profile_${validAccount.email}`);
        if (savedProfile) {
          setProfile(savedProfile);
          setProfileComplete(true);
        } else {
          setProfileComplete(false);
        }
      }
      // Load posted jobs and applicants for owners
      if (validAccount.role === 'owner') {
        const ownerData = await STORE.get(`kk_owner_${validAccount.email}`);
        if (ownerData) {
          setPosted(ownerData.posted || []);
          setJobApplicants(ownerData.jobApplicants || {});
          setPlan(ownerData.plan || null);
        }
      }
      setSignedIn(true);
      setIsPartner(false);
      await STORE.set('kk_auth', { signedIn: true, userType: validAccount.role, profileComplete: validAccount.role === 'worker' ? !!(await STORE.get(`kk_profile_${validAccount.email}`)) : false, plan: null, rememberMe: loginForm.rememberMe, currentEmail: validAccount.email });
      setLoginForm({ email: '', password: '', rememberMe: false });
      setView('app');
      setTab('jobs');
    };

    return (
      <div style={{ minHeight: '100vh', background: c.cream, fontFamily: 'system-ui, sans-serif' }}>
        <Header />
        <div className="max-w-md mx-auto px-6 py-8">
          <button onClick={() => setView('welcome')} style={{ color: c.textMuted, fontSize: 13, background: 'none', border: 'none', cursor: 'pointer', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 4 }}><ChevronLeft size={14} /> Back to home</button>
          <div style={{ background: c.white, borderRadius: 16, padding: 28, border: `1px solid ${c.border}` }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: c.lightBlue, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
              <Lock size={22} color={c.primary} />
            </div>
            <h2 style={{ fontSize: 24, fontWeight: 800, color: c.navy, letterSpacing: '-0.02em', marginBottom: 5 }}>Welcome back to KidKare</h2>
            <p style={{ color: c.textMuted, fontSize: 13.5, marginBottom: 20 }}>Sign in to keep great childcare moving.</p>

            {loginError && (
              <div style={{ background: '#FEF2F2', border: `1px solid ${c.coral}`, color: c.coralDark, padding: '10px 12px', borderRadius: 8, fontSize: 13, marginBottom: 14, display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                <AlertCircle size={15} style={{ flexShrink: 0, marginTop: 1 }} />
                <span>{loginError}</span>
              </div>
            )}

            <div className="space-y-3">
              <Input label="Email" value={loginForm.email} onChange={v => setLoginForm({...loginForm, email: v})} placeholder="you@example.com" type="email" />
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label style={{ fontSize: 12.5, fontWeight: 600, color: c.text }}>Password</label>
                  <button onClick={() => { setResetStep('email'); setResetData({ email: loginForm.email, code: '', newPassword: '', confirmPassword: '' }); setResetError(''); setView('forgotPassword'); }} style={{ fontSize: 11.5, color: c.primary, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Forgot password?</button>
                </div>
                <input type="password" value={loginForm.password} onChange={e => setLoginForm({...loginForm, password: e.target.value})} placeholder="Your password" style={{ width: '100%', padding: '9px 12px', fontSize: 13.5, border: `1.5px solid ${c.border}`, borderRadius: 9, background: c.white, color: c.text, outline: 'none' }} onKeyDown={e => e.key === 'Enter' && handleLogin()} />
              </div>

              {/* Remember Me */}
              <label className="flex items-center gap-2 cursor-pointer" style={{ fontSize: 13, color: c.text, fontWeight: 500, paddingTop: 4 }}>
                <input type="checkbox" checked={loginForm.rememberMe} onChange={e => setLoginForm({...loginForm, rememberMe: e.target.checked})} style={{ width: 16, height: 16, accentColor: c.primary, cursor: 'pointer' }} />
                Remember me on this device
              </label>
            </div>

            <button onClick={handleLogin} style={{ width: '100%', marginTop: 18, padding: '12px', background: c.primary, color: c.white, border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>Log In</button>

            <div style={{ textAlign: 'center', margin: '16px 0', position: 'relative' }}>
              <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 1, background: c.border }} />
              <span style={{ position: 'relative', background: c.white, padding: '0 12px', fontSize: 12, color: c.textMuted }}>or</span>
            </div>

            <p style={{ textAlign: 'center', fontSize: 13, color: c.textMuted }}>
              Don't have an account?{' '}<button onClick={() => setView('roleChoice')} style={{ color: c.primary, fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer' }}>Sign up here</button>
            </p>
            <p style={{ textAlign: 'center', fontSize: 12, color: c.textMuted, marginTop: 8 }}>
              Are you a training partner or vendor?{' '}<button onClick={() => setView('partnerLogin')} style={{ color: c.goldDark, fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer' }}>Partner login</button>
            </p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // FORGOT PASSWORD
  if (view === 'forgotPassword') {
    const sendResetCode = async () => {
      setResetError('');
      if (!resetData.email) {
        setResetError('Enter the email address on your account.');
        return;
      }
      const matches = (await ACCOUNTS.getAll()).filter(a => a.email.toLowerCase() === resetData.email.toLowerCase());
      if (matches.length === 0) {
        setResetError("We couldn't find an account with that email.");
        return;
      }
      // If multiple roles share the email, default to first; in production they'd pick
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setResetData({...resetData, code: code, role: matches[0].role});
      setEnteredCode('');
      setResetStep('code');
    };

    const verifyResetCode = () => {
      setResetError('');
      if (enteredCode !== resetData.code) {
        setResetError("That code doesn't match. Check your email and try again.");
        return;
      }
      setResetStep('password');
    };

    const submitNewPassword = async () => {
      setResetError('');
      if (!resetData.newPassword || !resetData.confirmPassword) {
        setResetError('Please enter and confirm your new password.');
        return;
      }
      if (resetData.newPassword.length < 6) {
        setResetError('Password must be at least 6 characters.');
        return;
      }
      if (resetData.newPassword !== resetData.confirmPassword) {
        setResetError("Passwords don't match.");
        return;
      }
      // Update ALL accounts with this email (covers shared email across roles)
      const accounts = await ACCOUNTS.getAll();
      const updated = accounts.map(a => a.email.toLowerCase() === resetData.email.toLowerCase() ? { ...a, password: resetData.newPassword } : a);
      await STORE.set('kk_accounts', updated);
      setResetSuccessToast(true);
      setTimeout(() => setResetSuccessToast(false), 4000);
      setResetData({ email: '', code: '', newPassword: '', confirmPassword: '', role: '' });
      setResetStep('email');
      setView('login');
    };

    return (
      <div style={{ minHeight: '100vh', background: c.cream, fontFamily: 'system-ui, sans-serif' }}>
        <Header />
        <div className="max-w-md mx-auto px-6 py-8">
          <button onClick={() => setView('login')} style={{ color: c.textMuted, fontSize: 13, background: 'none', border: 'none', cursor: 'pointer', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 4 }}><ChevronLeft size={14} /> Back to login</button>
          <div style={{ background: c.white, borderRadius: 16, padding: 28, border: `1px solid ${c.border}` }}>
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: c.lightBlue, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <KeyRound size={32} color={c.primary} />
            </div>

            {resetStep === 'email' && (
              <>
                <h2 style={{ fontSize: 22, fontWeight: 800, color: c.navy, letterSpacing: '-0.02em', marginBottom: 5, textAlign: 'center' }}>Reset your password</h2>
                <p style={{ color: c.textMuted, fontSize: 13.5, marginBottom: 6, textAlign: 'center' }}>We'll send a 6-digit code that expires in 15 minutes.</p>
                <p style={{ color: c.textMuted, fontSize: 13, marginBottom: 18, textAlign: 'center' }}>Enter the email on your account.</p>
                {resetError && (
                  <div style={{ background: '#FEF2F2', border: `1px solid ${c.coral}`, color: c.coralDark, padding: '10px 12px', borderRadius: 8, fontSize: 13, marginBottom: 12, display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                    <AlertCircle size={15} style={{ flexShrink: 0, marginTop: 1 }} />{resetError}
                  </div>
                )}
                <Input label="Email" value={resetData.email} onChange={v => setResetData({...resetData, email: v})} placeholder="you@example.com" type="email" />
                <button onClick={sendResetCode} style={{ width: '100%', marginTop: 16, padding: '12px', background: c.primary, color: c.white, border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>Send Reset Code</button>
              </>
            )}

            {resetStep === 'code' && (
              <>
                <h2 style={{ fontSize: 22, fontWeight: 800, color: c.navy, letterSpacing: '-0.02em', marginBottom: 5 }}>Check your email</h2>
                <p style={{ color: c.textMuted, fontSize: 13.5, marginBottom: 12 }}>We sent a 6 digit code to <strong>{resetData.email}</strong>.</p>
                <div style={{ background: c.paleBlue, border: `1.5px dashed ${c.primary}`, borderRadius: 9, padding: 12, marginBottom: 16, fontSize: 12.5, color: c.primaryDark }}>
                  <strong>Demo mode:</strong> Your code is <strong style={{ fontSize: 16, color: c.primary, letterSpacing: '0.1em' }}>{resetData.code}</strong>
                  <div style={{ marginTop: 4, fontSize: 11.5 }}>(In production this would be emailed to you.)</div>
                </div>
                {resetError && (
                  <div style={{ background: '#FEF2F2', border: `1px solid ${c.coral}`, color: c.coralDark, padding: '10px 12px', borderRadius: 8, fontSize: 13, marginBottom: 12, display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                    <AlertCircle size={15} style={{ flexShrink: 0, marginTop: 1 }} />{resetError}
                  </div>
                )}
                <div>
                  <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: c.text, marginBottom: 5 }}>6 digit code</label>
                  <input value={enteredCode} onChange={e => setEnteredCode(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="000000" maxLength={6} style={{ width: '100%', padding: '14px', fontSize: 22, textAlign: 'center', letterSpacing: '0.3em', border: `1.5px solid ${c.border}`, borderRadius: 9, background: c.white, color: c.text, outline: 'none', fontFamily: 'monospace', fontWeight: 700 }} />
                </div>
                <button onClick={() => { if (enteredCode.length !== 6) { setResetError('Enter the 6 digit code from your email.'); return; } verifyResetCode(); }} style={{ width: '100%', marginTop: 16, padding: '12px', background: c.primary, color: c.white, border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>Verify Code</button>
              </>
            )}

            {resetStep === 'password' && (
              <>
                <h2 style={{ fontSize: 22, fontWeight: 800, color: c.navy, letterSpacing: '-0.02em', marginBottom: 5 }}>Choose a new password</h2>
                <p style={{ color: c.textMuted, fontSize: 13.5, marginBottom: 18 }}>At least 6 characters.</p>
                {resetError && (
                  <div style={{ background: '#FEF2F2', border: `1px solid ${c.coral}`, color: c.coralDark, padding: '10px 12px', borderRadius: 8, fontSize: 13, marginBottom: 12, display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                    <AlertCircle size={15} style={{ flexShrink: 0, marginTop: 1 }} />{resetError}
                  </div>
                )}
                <div className="space-y-3">
                  <Input label="New Password" value={resetData.newPassword} onChange={v => setResetData({...resetData, newPassword: v})} placeholder="At least 6 characters" type="password" />
                  <Input label="Confirm New Password" value={resetData.confirmPassword} onChange={v => setResetData({...resetData, confirmPassword: v})} placeholder="Re enter password" type="password" />
                </div>
                <button onClick={submitNewPassword} style={{ width: '100%', marginTop: 16, padding: '12px', background: c.primary, color: c.white, border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>Reset Password</button>
              </>
            )}
            <p style={{ textAlign: 'center', fontSize: 13, color: c.textMuted, marginTop: 18, paddingTop: 14, borderTop: `1px solid ${c.borderSoft}` }}>
              Remember your password?{' '}<button onClick={() => setView('login')} style={{ color: c.primary, fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer' }}>Back to login</button>
            </p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // VERIFY EMAIL (after signup)
  if (view === 'verifyEmail') {
    return (
      <div style={{ minHeight: '100vh', background: c.cream, fontFamily: 'system-ui, sans-serif' }}>
        <Header />
        <div className="max-w-md mx-auto px-6 py-8">
          <button onClick={() => setView('signup')} style={{ color: c.textMuted, fontSize: 13, background: 'none', border: 'none', cursor: 'pointer', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 4 }}><ChevronLeft size={14} /> Back to signup</button>
          <div style={{ background: c.white, borderRadius: 16, padding: 28, border: `1px solid ${c.border}` }}>
            <div style={{ width: 56, height: 56, borderRadius: 14, background: c.lightBlue, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
              <Mail size={26} color={c.primary} />
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: c.navy, letterSpacing: '-0.02em', marginBottom: 5 }}>Verify your email</h2>
            <p style={{ color: c.textMuted, fontSize: 13.5, marginBottom: 14 }}>We sent a 6 digit code to <strong>{signup.email}</strong>. Enter it below to confirm your email.</p>

            <div style={{ background: c.paleBlue, border: `1.5px dashed ${c.primary}`, borderRadius: 9, padding: 12, marginBottom: 16, fontSize: 12.5, color: c.primaryDark }}>
              <strong>Demo mode:</strong> Your code is <strong style={{ fontSize: 16, color: c.primary, letterSpacing: '0.1em' }}>{verificationCode}</strong>
              <div style={{ marginTop: 4, fontSize: 11.5 }}>(In production this would be emailed to you.)</div>
            </div>

            {codeError && (
              <div style={{ background: '#FEF2F2', border: `1px solid ${c.coral}`, color: c.coralDark, padding: '10px 12px', borderRadius: 8, fontSize: 13, marginBottom: 12, display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                <AlertCircle size={15} style={{ flexShrink: 0, marginTop: 1 }} />{codeError}
              </div>
            )}

            <div>
              <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: c.text, marginBottom: 5 }}>6 digit verification code</label>
              <input value={enteredCode} onChange={e => setEnteredCode(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="000000" maxLength={6} style={{ width: '100%', padding: '14px', fontSize: 22, textAlign: 'center', letterSpacing: '0.3em', border: `1.5px solid ${c.border}`, borderRadius: 9, background: c.white, color: c.text, outline: 'none', fontFamily: 'monospace', fontWeight: 700 }} onKeyDown={e => e.key === 'Enter' && enteredCode.length === 6 && handleVerifyEmail()} />
            </div>

            <button onClick={handleVerifyEmail} style={{ width: '100%', marginTop: 16, padding: '12px', background: c.primary, color: c.white, border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>Verify and Continue</button>

            <div className="flex justify-center items-center gap-2 mt-4" style={{ fontSize: 12.5, color: c.textMuted }}>
              Didn't receive it?
              <button onClick={resendCode} style={{ color: c.primary, fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer' }}>Resend code</button>
            </div>
            <p style={{ textAlign: 'center', fontSize: 12, color: c.textMuted, marginTop: 12 }}>
              Wrong email?{' '}<button onClick={() => setView('signup')} style={{ color: c.primary, fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>Go back</button>
            </p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // SIGN UP
  if (view === 'signup') {
    return (
      <div style={{ minHeight: '100vh', background: c.cream, fontFamily: 'system-ui, sans-serif' }}>
        <Header />
        <div className="max-w-md mx-auto px-6 py-8">
          <button onClick={() => setView('roleChoice')} style={{ color: c.textMuted, fontSize: 13, background: 'none', border: 'none', cursor: 'pointer', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 4 }}><ChevronLeft size={14} /> Change account type</button>
          <div style={{ background: c.white, borderRadius: 16, padding: 26, border: `1px solid ${c.border}` }}>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full mb-4" style={{ background: userType === 'worker' ? c.success : c.primary, color: c.white, fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              {userType === 'worker' ? <><User size={11} /> Teacher · Free</> : <><Building2 size={11} /> Center</>}
            </div>
            <h2 style={{ fontSize: 23, fontWeight: 800, color: c.navy, letterSpacing: '-0.02em', marginBottom: 5 }}>Create your account</h2>
            <p style={{ color: c.textMuted, fontSize: 13.5, marginBottom: 18 }}>{userType === 'worker' ? 'Next: build your profile so centers can find you.' : 'Next: choose your subscription plan.'}</p>
            {signupError && (
              <div style={{ background: '#FEF2F2', border: `1px solid ${c.coral}`, color: c.coralDark, padding: '10px 12px', borderRadius: 8, fontSize: 13, marginBottom: 14, display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                <AlertCircle size={15} style={{ flexShrink: 0, marginTop: 1 }} />{signupError}
              </div>
            )}
            <div className="space-y-3">
              <Input label="Your Name" value={signup.name} onChange={v => setSignup({...signup, name: v})} placeholder="Toni Brewer" />
              <Input label="Email" value={signup.email} onChange={v => setSignup({...signup, email: v})} placeholder="you@example.com" type="email" />
              <Input label="Password" value={signup.password} onChange={v => setSignup({...signup, password: v})} placeholder="At least 6 characters" type="password" />
              <Input label="Phone" value={signup.phone} onChange={v => setSignup({...signup, phone: v})} placeholder="(555) 123 4567" />
              <Select label="State" value={signup.state} onChange={v => setSignup({...signup, state: v})} options={STATES} />
              {userType === 'owner' && <Input label="Center Name" value={signup.center} onChange={v => setSignup({...signup, center: v})} placeholder="Little Leaders Academy" />}
            </div>
            <button onClick={completeSignup} style={{ width: '100%', marginTop: 18, padding: '12px', background: c.primary, color: c.white, border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>{userType === 'owner' ? 'Continue to Pricing →' : 'Continue to Profile →'}</button>
            <p style={{ textAlign: 'center', fontSize: 12.5, color: c.textMuted, marginTop: 12 }}>
              Already have an account?{' '}<button onClick={() => setView('login')} style={{ color: c.primary, fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer' }}>Log in here</button>
            </p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 8, fontSize: 12, color: c.textMuted }}>
              <Lock size={11} /> Saved automatically. Come back anytime.
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // PROFILE BUILDER
  if (view === 'profile') {
    const required = profile.city && profile.state && profile.zip && profile.years && profile.availability && profile.positions.length > 0;
    return (
      <div style={{ minHeight: '100vh', background: c.cream, fontFamily: 'system-ui, sans-serif' }}>
        <Header />
        <div className="max-w-2xl mx-auto px-4 md:px-6 py-6">
          {profileComplete && (
            <button onClick={() => setView('app')} style={{ color: c.textMuted, fontSize: 13, background: 'none', border: 'none', cursor: 'pointer', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 4 }}><ChevronLeft size={14} /> Back to jobs</button>
          )}
          <div className="mb-4 flex items-center justify-between flex-wrap gap-2">
            <div>
              <div className="flex items-center gap-2 mb-1" style={{ fontSize: 11, fontWeight: 700, color: c.success, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                <CheckCircle2 size={13} /> Step 2 of 2
              </div>
              <h2 style={{ fontSize: 'clamp(22px, 4vw, 28px)', fontWeight: 800, color: c.navy, letterSpacing: '-0.025em' }}>Build your profile</h2>
            </div>
            <div style={{ fontSize: 11, color: c.success, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}><Check size={12} /> Auto saving</div>
          </div>
          <p style={{ fontSize: 13.5, color: c.textMuted, lineHeight: 1.5, marginBottom: 16 }}>What centers see when you apply. Required marked <span style={{ color: c.coralDark, fontWeight: 700 }}>*</span></p>

          <div style={{ background: c.white, borderRadius: 14, padding: '20px 18px', border: `1px solid ${c.border}` }}>
            {/* PHOTO */}
            <Section icon={Camera} title="Profile Photo" sub="Optional but recommended. Builds trust with centers.">
              <div className="flex items-center gap-4">
                <Avatar name={signup.name || 'You'} photo={profile.photo} size={80} />
                <div className="flex-1">
                  {profile.photo ? (
                    <div className="flex gap-2">
                      <label style={{ padding: '8px 14px', background: c.paleBlue, color: c.primary, border: `1.5px solid ${c.primary}`, borderRadius: 8, fontSize: 12.5, fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                        <Camera size={13} /> Change
                        <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} />
                      </label>
                      <button onClick={() => setProfile({...profile, photo: ''})} style={{ padding: '8px 12px', background: c.white, color: c.textMuted, border: `1.5px solid ${c.border}`, borderRadius: 8, fontSize: 12.5, fontWeight: 600, cursor: 'pointer' }}><Trash2 size={13} /></button>
                    </div>
                  ) : (
                    <label style={{ padding: '10px 16px', background: c.cream, color: c.primary, border: `2px dashed ${c.border}`, borderRadius: 8, fontSize: 12.5, fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                      <Upload size={13} /> Upload photo
                      <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} />
                    </label>
                  )}
                  <p style={{ fontSize: 11.5, color: c.textMuted, marginTop: 6 }}>JPG or PNG, auto resized to fit.</p>
                </div>
              </div>
            </Section>

            <Section icon={MapPin} title="Location" sub="Drives which jobs you see.">
              <div className="grid grid-cols-2 gap-3">
                <Input label="City *" value={profile.city} onChange={v => setProfile({...profile, city: v})} placeholder="Lithonia" />
                <Select label="State *" value={profile.state} onChange={v => setProfile({...profile, state: v})} options={STATES} />
              </div>
              <Input label="Zip *" value={profile.zip} onChange={v => setProfile({...profile, zip: v})} placeholder="30038" />
            </Section>

            <Section icon={Briefcase} title="Your Background" sub="Tell us about your experience.">
              <Select label="Years of Experience *" value={profile.years} onChange={v => setProfile({...profile, years: v})} options={['Less than 1 year','1 to 2 years','3 to 5 years','6 to 10 years','10+ years']} placeholder="Select" />
              <ChipGroup label="Age Groups You've Worked With" items={AGE_GROUPS} selected={profile.ageGroups} onChange={item => setProfile({...profile, ageGroups: toggleArr(profile.ageGroups, item)})} />
              <Select label="Highest Education" value={profile.education} onChange={v => setProfile({...profile, education: v})} options={['High School / GED','Some College','Associate Degree','Bachelor Degree','Master Degree']} placeholder="Select" />
              <Select label="Availability *" value={profile.availability} onChange={v => setProfile({...profile, availability: v})} options={['Full Time','Part Time','Both','Substitute only']} placeholder="Select" />
              <ChipGroup label="Positions You're Interested In *" items={POSITIONS_LIST} selected={profile.positions} onChange={item => setProfile({...profile, positions: toggleArr(profile.positions, item)})} />
            </Section>

            <Section icon={Award} title="Credentials" sub="Mark what you currently hold.">
              <ChipGroup label="Current Credentials" items={CREDENTIALS_LIST} selected={profile.credentials} onChange={item => setProfile({...profile, credentials: toggleArr(profile.credentials, item)})} />
              <Select label="Background Check Status" value={profile.bgCheck} onChange={v => setProfile({...profile, bgCheck: v})} options={['Cleared and current','Portable background check','In progress','Not started yet']} placeholder="Select" />
            </Section>

            <Section icon={Paperclip} title="Documents" sub="Upload resume and certificates. Centers see these when you apply.">
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: c.text, marginBottom: 6 }}>Resume</label>
                {profile.resume ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 13px', background: c.paleBlue, border: `1.5px solid ${c.primary}`, borderRadius: 10 }}>
                    <div className="flex items-center gap-2" style={{ fontSize: 13, color: c.primaryDark, fontWeight: 600 }}>
                      <FileText size={15} color={c.primary} />{profile.resume}
                    </div>
                    <button onClick={() => setProfile({...profile, resume: ''})} style={{ background: 'none', border: 'none', cursor: 'pointer', color: c.textMuted, padding: 2 }}><Trash2 size={14} /></button>
                  </div>
                ) : (
                  <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '14px', background: c.cream, border: `2px dashed ${c.border}`, borderRadius: 10, cursor: 'pointer', color: c.textMuted, fontSize: 13, fontWeight: 600 }}>
                    <Upload size={14} /> Upload Resume (PDF, DOC, DOCX)
                    <input type="file" accept=".pdf,.doc,.docx" onChange={handleResumeUpload} style={{ display: 'none' }} />
                  </label>
                )}
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: c.text, marginBottom: 6 }}>Certificates and Credentials</label>
                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '12px', background: c.cream, border: `2px dashed ${c.border}`, borderRadius: 10, cursor: 'pointer', color: c.textMuted, fontSize: 12.5, fontWeight: 600, marginBottom: 7 }}>
                  <Plus size={14} /> Add Files (CDA, CPR, transcripts)
                  <input type="file" multiple accept=".pdf,.jpg,.jpeg,.png" onChange={handleCredFiles} style={{ display: 'none' }} />
                </label>
                {profile.credentialFiles?.length > 0 && (
                  <div className="space-y-1.5">
                    {profile.credentialFiles.map((f, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 11px', background: c.paleBlue, borderRadius: 7 }}>
                        <div className="flex items-center gap-2" style={{ fontSize: 12.5, color: c.primaryDark }}><FileText size={13} color={c.primary} />{f}</div>
                        <button onClick={() => removeCredFile(f)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: c.textMuted }}><Trash2 size={13} /></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Section>

            <Section icon={Edit3} title="About You" sub="A short intro centers read first.">
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: c.text, marginBottom: 6 }}>Brief Bio</label>
                <textarea value={profile.bio} onChange={e => setProfile({...profile, bio: e.target.value})} placeholder="I'm a warm, patient teacher who loves the toddler age group..." rows={3} style={{ width: '100%', padding: '10px 13px', fontSize: 13.5, border: `1.5px solid ${c.border}`, borderRadius: 10, background: c.white, color: c.text, outline: 'none', fontFamily: 'inherit', resize: 'vertical' }} />
              </div>
            </Section>

            <button onClick={completeProfile} disabled={!required} style={{ width: '100%', marginTop: 14, padding: '13px', background: required ? c.primary : c.textMuted, color: c.white, border: 'none', borderRadius: 10, fontSize: 14.5, fontWeight: 700, cursor: required ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
              {required ? <>Save Profile and See Jobs <ArrowRight size={15} /></> : 'Please fill required fields *'}
            </button>
            {pendingApply && <div style={{ marginTop: 10, padding: 11, background: c.paleBlue, borderRadius: 8, fontSize: 12.5, color: c.primaryDark, display: 'flex', alignItems: 'center', gap: 7 }}><AlertCircle size={14} /> We'll auto submit your application once saved.</div>}
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // PRICING
  if (view === 'pricing') {
    if (signedIn && userType === 'worker') {
      return (
        <div style={{ minHeight: '100vh', background: c.cream, fontFamily: 'system-ui, sans-serif' }}>
          <Header />
          <div className="max-w-md mx-auto px-6 py-12 text-center">
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: c.lightBlue, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Heart size={28} color={c.primary} fill={c.coral} />
            </div>
            <h2 style={{ fontSize: 24, fontWeight: 800, color: c.navy, letterSpacing: '-0.02em', marginBottom: 8 }}>You're set — for free</h2>
            <p style={{ color: c.textMuted, fontSize: 14, lineHeight: 1.55, marginBottom: 18 }}>Subscription plans are for daycare centers that post jobs. As a teacher or caregiver, you get full access to KidKare at no cost — forever.</p>
            <button onClick={() => setView('app')} style={{ padding: '11px 22px', background: c.primary, color: c.white, border: 'none', borderRadius: 10, fontSize: 13.5, fontWeight: 700, cursor: 'pointer' }}>Back to my jobs</button>
          </div>
          <Footer />
        </div>
      );
    }
    const choosePlan = async (planName) => {
      if (signedIn && userType === 'owner') {
        setPlan(planName);
        await STORE.set('kk_auth', { signedIn: true, userType, profileComplete, plan: planName });
        setView('app');
      } else {
        setPlan(planName);
        setUserType('owner');
        setView('signup');
      }
    };
    return (
      <div style={{ minHeight: '100vh', background: c.cream, fontFamily: 'system-ui, sans-serif' }}>
        <Header />
        <div className="max-w-6xl mx-auto px-6 py-9">
          <button onClick={goBack} style={{ color: c.textMuted, fontSize: 13, background: 'none', border: 'none', cursor: 'pointer', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 4 }}><ChevronLeft size={14} /> Back</button>
          <div className="text-center mb-9">
            <div style={{ fontSize: 12, color: c.primary, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 7 }}>For Daycare Centers</div>
            <h2 style={{ fontSize: 'clamp(26px, 5vw, 38px)', fontWeight: 800, color: c.navy, letterSpacing: '-0.025em', marginBottom: 8 }}>Pick the plan that fits your center</h2>
            <p style={{ fontSize: 14.5, color: c.textMuted, maxWidth: 560, margin: '0 auto' }}>Every plan starts with a 7 day free trial. Cancel anytime. Upgrade or downgrade as your hiring needs change.</p>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, marginTop: 14, padding: '6px 14px', background: c.success, color: c.white, borderRadius: 999, fontSize: 12, fontWeight: 700, letterSpacing: '0.05em' }}>
              <CheckCircle2 size={13} /> 7-DAY FREE TRIAL · NO CHARGE TODAY
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-5 max-w-5xl mx-auto" style={{ alignItems: 'stretch' }}>
            {PRICING.map((t, i) => (
              <div key={i} style={{ background: t.highlight ? `linear-gradient(180deg, ${c.primary} 0%, ${c.primaryDark} 100%)` : c.white, border: t.highlight ? `2px solid ${c.primary}` : `1.5px solid ${c.border}`, borderRadius: 16, padding: '28px 22px 22px', position: 'relative', transform: t.highlight ? 'translateY(-8px)' : 'none', boxShadow: t.highlight ? '0 14px 36px rgba(43, 95, 126, 0.25)' : '0 2px 6px rgba(15, 42, 61, 0.05)', display: 'flex', flexDirection: 'column' }}>
                {t.badge && <div style={{ position: 'absolute', top: -13, left: '50%', transform: 'translateX(-50%)', background: c.gold, color: c.navy, fontSize: 11, fontWeight: 800, padding: '5px 14px', borderRadius: 999, letterSpacing: '0.08em', textTransform: 'uppercase', boxShadow: '0 4px 10px rgba(212, 165, 71, 0.45)' }}>{t.badge}</div>}
                <div style={{ color: t.highlight ? c.gold : c.primary, fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>{t.name}</div>
                <div className="flex items-baseline gap-1" style={{ marginBottom: 2 }}>
                  <span style={{ fontSize: 44, fontWeight: 800, color: t.highlight ? c.white : c.navy, letterSpacing: '-0.035em' }}>${t.price}</span>
                </div>
                <div style={{ fontSize: 13, color: t.highlight ? 'rgba(255,255,255,0.78)' : c.textMuted, marginBottom: 10 }}>per month</div>
                <p style={{ color: t.highlight ? 'rgba(255,255,255,0.85)' : c.textMuted, fontSize: 13, marginBottom: 16, lineHeight: 1.5 }}>{t.tagline}</p>
                <div className="space-y-2" style={{ flex: 1, marginBottom: 18 }}>
                  {t.features.map((f, j) => (
                    <div key={j} className="flex items-start gap-2.5">
                      <div style={{ flexShrink: 0, width: 17, height: 17, borderRadius: '50%', background: t.highlight ? c.gold : c.lightBlue, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 1 }}><Check size={10} color={t.highlight ? c.navy : c.primary} strokeWidth={3} /></div>
                      <span style={{ fontSize: 13, color: t.highlight ? 'rgba(255,255,255,0.95)' : c.text, lineHeight: 1.45 }}>{f}</span>
                    </div>
                  ))}
                </div>
                <button onClick={() => choosePlan(t.name)} style={{ width: '100%', padding: '12px', background: t.highlight ? c.gold : c.primary, color: t.highlight ? c.navy : c.white, border: 'none', borderRadius: 11, fontSize: 14, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  Start 7-Day Free Trial <ArrowRight size={14} />
                </button>
                <div style={{ textAlign: 'center', marginTop: 8, fontSize: 11.5, color: t.highlight ? 'rgba(255,255,255,0.75)' : c.textMuted }}>Then ${t.price}/month · Cancel anytime</div>
              </div>
            ))}
          </div>
          <div className="text-center" style={{ marginTop: 28 }}>
            <p style={{ fontSize: 13, color: c.textMuted }}>
              Questions about plans?{' '}<button onClick={() => alert('Contact: Coming soon!')} style={{ color: c.primary, fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer' }}>Contact our team</button>
            </p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // APP VIEW
  return (
    <div style={{ minHeight: '100vh', background: c.cream, fontFamily: 'system-ui, sans-serif' }}>
      <Header />
      {!signedIn && !guestBannerDismissed && (
        <div style={{ background: c.gold, color: c.navy, padding: '9px 40px 9px 14px', textAlign: 'center', fontSize: 12.5, fontWeight: 600, position: 'relative' }}>
          Browsing as guest. <button onClick={() => setView('roleChoice')} style={{ color: c.navy, textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 12.5 }}>Sign up or log in</button> to apply.
          <button onClick={async () => { setGuestBannerDismissed(true); await STORE.set('kk_guestBannerDismissed', true); }} aria-label="Dismiss guest banner" style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'rgba(15,42,61,0.08)', border: 'none', cursor: 'pointer', color: c.navy, padding: 4, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={14} />
          </button>
        </div>
      )}
      {showSaveToast && (
        <div style={{ position: 'fixed', top: 80, right: 16, background: c.success, color: c.white, padding: '12px 18px', borderRadius: 10, fontSize: 13, fontWeight: 600, boxShadow: '0 10px 30px rgba(15, 42, 61, 0.2)', zIndex: 100, display: 'flex', alignItems: 'center', gap: 8 }}>
          <CheckCircle2 size={16} /> Profile saved
        </div>
      )}
      {resetSuccessToast && (
        <div style={{ position: 'fixed', top: 80, right: 16, background: c.success, color: c.white, padding: '12px 18px', borderRadius: 10, fontSize: 13, fontWeight: 600, boxShadow: '0 10px 30px rgba(15, 42, 61, 0.2)', zIndex: 100, display: 'flex', alignItems: 'center', gap: 8 }}>
          <CheckCircle2 size={16} /> Password updated! Log in with your new password.
        </div>
      )}
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-6">
        {/* JOBS TAB */}
        {tab === 'jobs' && (
          <div>
            <div className="flex items-start justify-between mb-4 flex-wrap gap-3">
              <div>
                <h2 style={{ fontSize: 22, fontWeight: 800, color: c.navy, letterSpacing: '-0.02em', marginBottom: 3 }}>
                  {signedIn && userType === 'owner' ? 'My Job Posts' : signedIn && profileComplete ? `Jobs in ${profile.state}` : 'Browse Jobs'}
                </h2>
                <p style={{ color: c.textMuted, fontSize: 13 }}>
                  {signedIn && userType === 'owner' ? `${posted.length} active${plan ? ` · ${plan} plan` : ''}` : `${visibleJobs.length} positions${signedIn && profileComplete && locationFilter === 'myArea' ? ` near ${profile.city || profile.state}` : ''}`}
                </p>
              </div>
              {signedIn && userType === 'owner' && (
                <div className="flex gap-2">
                  <button onClick={() => setTab('templates')} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '8px 12px', background: c.white, color: c.primary, border: `1.5px solid ${c.primary}`, borderRadius: 9, fontSize: 12.5, fontWeight: 700, cursor: 'pointer' }}><LayoutGrid size={13} /> Templates</button>
                  <button onClick={() => setShowPost(true)} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '8px 12px', background: c.primary, color: c.white, border: 'none', borderRadius: 9, fontSize: 12.5, fontWeight: 700, cursor: 'pointer' }}><Plus size={13} /> Post Job</button>
                </div>
              )}
            </div>

            {userType !== 'owner' && (
              <>
                {signedIn && profileComplete && (
                  <div className="flex gap-2 mb-3 flex-wrap">
                    <button onClick={() => setLocationFilter('myArea')} style={{ padding: '6px 12px', background: locationFilter === 'myArea' ? c.primary : c.white, color: locationFilter === 'myArea' ? c.white : c.text, border: `1.5px solid ${locationFilter === 'myArea' ? c.primary : c.border}`, borderRadius: 999, fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={11} /> My Area ({profile.state})</button>
                    <button onClick={() => setLocationFilter('all')} style={{ padding: '6px 12px', background: locationFilter === 'all' ? c.primary : c.white, color: locationFilter === 'all' ? c.white : c.text, border: `1.5px solid ${locationFilter === 'all' ? c.primary : c.border}`, borderRadius: 999, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>All States</button>
                  </div>
                )}
                <div className="flex gap-2 mb-4 flex-wrap">
                  <div style={{ flex: 1, minWidth: 220, position: 'relative' }}>
                    <Search size={15} color={c.textMuted} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                    <input value={jobSearch} onChange={e => setJobSearch(e.target.value)} placeholder="Search by title, center, or city" style={{ width: '100%', padding: '10px 11px 10px 36px', fontSize: 13.5, background: c.white, border: `1.5px solid ${c.border}`, borderRadius: 9, color: c.text, outline: 'none' }} />
                  </div>
                  <select value={jobFilter} onChange={e => setJobFilter(e.target.value)} style={{ padding: '10px 13px', fontSize: 13.5, background: c.white, border: `1.5px solid ${c.border}`, borderRadius: 9, color: c.text, outline: 'none', fontWeight: 500 }}>
                    <option value="all">All Types</option><option value="Full Time">Full Time</option><option value="Part Time">Part Time</option>
                  </select>
                </div>
              </>
            )}

            <div className="grid lg:grid-cols-2 gap-3">
              {(signedIn && userType === 'owner' ? posted : visibleJobs).map(j => {
                const isMatch = signedIn && profileComplete && userType === 'worker' && j.state === profile.state;
                const apps = jobApplicants[j.id] || [];
                return (
                  <div key={j.id} style={{ background: c.white, border: isMatch ? `1.5px solid ${c.primary}` : `1.5px solid ${c.border}`, borderRadius: 13, padding: 16, position: 'relative' }} className="hover:shadow-lg transition-shadow">
                    {isMatch && <div style={{ position: 'absolute', top: -10, left: 12, background: c.primary, color: c.white, fontSize: 9.5, fontWeight: 700, padding: '3px 8px', borderRadius: 999, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Near You</div>}
                    <div className="flex justify-between items-start gap-2 mb-2">
                      <div className="flex-1">
                        <h3 style={{ fontSize: 14.5, fontWeight: 700, color: c.navy, marginBottom: 2, lineHeight: 1.3 }}>{j.title}</h3>
                        <div className="flex items-center gap-1" style={{ fontSize: 12.5, color: c.primary, fontWeight: 600 }}>{j.center}{j.verified && <Verified size={11} fill={c.success} stroke={c.white} strokeWidth={2.5} />}</div>
                      </div>
                      {userType !== 'owner' && signedIn && (
                        <button onClick={() => toggleSave(j.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}><Bookmark size={17} color={saved.includes(j.id) ? c.coral : c.textMuted} fill={saved.includes(j.id) ? c.coral : 'none'} /></button>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-x-3 gap-y-1 mb-2" style={{ fontSize: 11.5, color: c.textMuted }}>
                      <span className="flex items-center gap-1"><MapPin size={11} /> {j.location}</span>
                      <span className="flex items-center gap-1"><Clock size={11} /> {j.type}</span>
                      <span className="flex items-center gap-1"><DollarSign size={11} /> {j.pay}</span>
                    </div>
                    <p style={{ fontSize: 12.5, color: c.text, lineHeight: 1.5, marginBottom: 9, whiteSpace: 'pre-line' }}>{j.description}</p>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {(j.tags || []).map((tag, i) => <span key={i} style={{ fontSize: 10, padding: '3px 7px', background: c.lightBlue, color: c.primaryDark, borderRadius: 999, fontWeight: 600 }}>{tag}</span>)}
                    </div>
                    <div className="flex justify-between items-center pt-2" style={{ borderTop: `1px solid ${c.border}` }}>
                      <span style={{ fontSize: 11, color: c.textMuted }}>{j.posted}</span>
                      {userType === 'owner' && signedIn ? (
                        <button onClick={() => setViewingApplicantsFor(j)} style={{ padding: '6px 11px', background: apps.length > 0 ? c.primary : c.cream, color: apps.length > 0 ? c.white : c.text, border: apps.length > 0 ? 'none' : `1px solid ${c.border}`, borderRadius: 7, fontSize: 11.5, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Users size={11} /> View Applicants ({apps.length})
                        </button>
                      ) : (
                        <button onClick={() => tryApply(j)} disabled={applied.includes(j.id)} style={{ padding: '6px 12px', background: applied.includes(j.id) ? c.success : c.primary, color: c.white, border: 'none', borderRadius: 7, fontSize: 11.5, fontWeight: 700, cursor: applied.includes(j.id) ? 'default' : 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                          {applied.includes(j.id) ? <><Check size={11} /> Applied</> : !signedIn ? <><Lock size={10} /> Sign in</> : !profileComplete ? <>Complete Profile</> : <><Send size={11} /> Apply</>}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {signedIn && userType === 'owner' && posted.length === 0 && (
              <div style={{ background: c.white, border: `2px dashed ${c.border}`, borderRadius: 13, padding: 30, textAlign: 'center' }}>
                <Briefcase size={26} color={c.textMuted} style={{ margin: '0 auto 8px' }} />
                <h3 style={{ fontSize: 15.5, fontWeight: 700, color: c.navy, marginBottom: 4 }}>No job posts yet</h3>
                <p style={{ color: c.textMuted, fontSize: 13, marginBottom: 12 }}>Post your first job to start receiving applications</p>
                <div className="flex gap-2 justify-center flex-wrap">
                  <button onClick={() => setTab('templates')} style={{ padding: '9px 15px', background: c.white, color: c.primary, border: `1.5px solid ${c.primary}`, borderRadius: 9, fontSize: 12.5, fontWeight: 700, cursor: 'pointer' }}>Browse Templates</button>
                  <button onClick={() => setShowPost(true)} style={{ padding: '9px 15px', background: c.primary, color: c.white, border: 'none', borderRadius: 9, fontSize: 12.5, fontWeight: 700, cursor: 'pointer' }}>Create from Scratch</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TEMPLATES */}
        {tab === 'templates' && (
          <div>
            <div className="mb-4">
              <h2 style={{ fontSize: 22, fontWeight: 800, color: c.navy, letterSpacing: '-0.02em', marginBottom: 3 }}>Job Templates</h2>
              <p style={{ color: c.textMuted, fontSize: 13 }}>Industry standard templates to post a job in two minutes.</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
              {JOB_TEMPLATES.map((t, i) => (
                <div key={i} style={{ background: c.white, border: `1.5px solid ${c.border}`, borderRadius: 12, padding: 16, display: 'flex', flexDirection: 'column' }}>
                  <div className="flex items-start justify-between mb-2">
                    <div style={{ fontSize: 24 }}>{t.icon}</div>
                    <span style={{ fontSize: 9.5, padding: '3px 7px', background: c.paleBlue, color: c.primary, borderRadius: 999, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>{t.age}</span>
                  </div>
                  <h3 style={{ fontSize: 14.5, fontWeight: 700, color: c.navy, marginBottom: 3 }}>{t.title}</h3>
                  <div style={{ fontSize: 12, color: c.primary, fontWeight: 700, marginBottom: 7 }}>{t.pay}</div>
                  <p style={{ fontSize: 12, color: c.text, lineHeight: 1.4, marginBottom: 9 }}>{t.summary}</p>
                  <ul className="space-y-1 mb-3">
                    {t.requirements.map((r, j) => (
                      <li key={j} className="flex items-start gap-1.5" style={{ fontSize: 11.5, color: c.text }}>
                        <Check size={10} color={c.success} style={{ flexShrink: 0, marginTop: 3 }} strokeWidth={3} />{r}
                      </li>
                    ))}
                  </ul>
                  {signedIn && userType === 'owner' ? (
                    <button onClick={() => useTemplate(t)} style={{ marginTop: 'auto', padding: '8px', background: c.primary, color: c.white, border: 'none', borderRadius: 7, fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>Use Template <ArrowRight size={11} /></button>
                  ) : (
                    <button onClick={() => setView('roleChoice')} style={{ marginTop: 'auto', padding: '8px', background: c.cream, color: c.textMuted, border: `1px solid ${c.border}`, borderRadius: 7, fontSize: 11.5, fontWeight: 600, cursor: 'pointer' }}>Center sign in required</button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TRAINING */}
        {tab === 'training' && (
          <div>
            <div className="mb-4">
              <h2 style={{ fontSize: 22, fontWeight: 800, color: c.navy, letterSpacing: '-0.02em', marginBottom: 3 }}>Training Hub</h2>
              <p style={{ color: c.textMuted, fontSize: 13 }}>Build your credentials. Grow your career.</p>
            </div>
            <div className="grid md:grid-cols-2 gap-3 mb-5">
              {TRAINING.map((r, i) => (
                <div key={i} style={{ background: c.white, border: `1.5px solid ${c.border}`, borderRadius: 12, padding: 16 }}>
                  <div className="flex items-start gap-3 mb-2">
                    <div style={{ width: 38, height: 38, borderRadius: 10, background: c.lightBlue, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><r.icon size={17} color={c.primary} /></div>
                    <div className="flex-1">
                      <h3 style={{ fontSize: 14.5, fontWeight: 700, color: c.navy, marginBottom: 3 }}>{r.title}</h3>
                      <span style={{ fontSize: 9.5, padding: '2px 7px', background: r.badge === 'Required' ? c.coral : r.badge === 'Most Popular' ? c.gold : c.lightBlue, color: r.badge === 'Required' || r.badge === 'Most Popular' ? c.navy : c.primaryDark, borderRadius: 999, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>{r.badge}</span>
                    </div>
                  </div>
                  <p style={{ fontSize: 12.5, color: c.text, lineHeight: 1.5, marginBottom: 9 }}>{r.description}</p>
                  <div className="space-y-1" style={{ fontSize: 11.5, color: c.textMuted }}>
                    <div><strong style={{ color: c.text }}>Provider:</strong> {r.provider}</div>
                    <div><strong style={{ color: c.text }}>Duration:</strong> {r.duration}</div>
                    <div><strong style={{ color: c.text }}>Cost:</strong> {r.cost}</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ background: `linear-gradient(135deg, ${c.primary} 0%, ${c.primaryDark} 100%)`, borderRadius: 12, padding: 20, color: c.white, display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
              <Handshake size={28} color={c.gold} />
              <div style={{ flex: 1, minWidth: 200 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 2 }}>Looking for trainers near you?</h3>
                <p style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.85)' }}>Check our Partners directory.</p>
              </div>
              <button onClick={() => setTab('partners')} style={{ padding: '9px 16px', background: c.gold, color: c.navy, border: 'none', borderRadius: 9, fontSize: 12.5, fontWeight: 700, cursor: 'pointer' }}>Browse Partners →</button>
            </div>
          </div>
        )}

        {/* LICENSING */}
        {tab === 'licensing' && (
          <div>
            <div className="mb-4">
              <h2 style={{ fontSize: 22, fontWeight: 800, color: c.navy, letterSpacing: '-0.02em', marginBottom: 3 }}>State Licensing</h2>
              <p style={{ color: c.textMuted, fontSize: 13 }}>Pick your state to see qualifications and background check steps.</p>
            </div>
            <div style={{ marginBottom: 16, maxWidth: 320 }}>
              <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: c.text, marginBottom: 5 }}>Select your state</label>
              <select value={stateSel} onChange={e => setStateSel(e.target.value)} style={{ width: '100%', padding: '9px 13px', fontSize: 13.5, background: c.white, border: `1.5px solid ${c.border}`, borderRadius: 9, color: c.text, outline: 'none', fontWeight: 500 }}>
                {STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="grid lg:grid-cols-3 gap-3">
              <div style={{ gridColumn: 'span 2', background: c.white, border: `1.5px solid ${c.border}`, borderRadius: 12, padding: 18 }}>
                <div className="flex items-center gap-3 mb-3">
                  <div style={{ width: 34, height: 34, borderRadius: 9, background: c.lightBlue, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FileText size={16} color={c.primary} /></div>
                  <div><h3 style={{ fontSize: 14.5, fontWeight: 700, color: c.navy }}>{stateSel} Requirements</h3><p style={{ fontSize: 11.5, color: c.textMuted }}>To work in a licensed center</p></div>
                </div>
                <div style={{ background: c.paleBlue, borderRadius: 9, padding: 10, marginBottom: 12, fontSize: 11.5, color: c.primaryDark }}>
                  <div style={{ fontWeight: 700, marginBottom: 2 }}>Regulating Agency</div>
                  <div>{info.agency}</div>
                </div>
                <ul className="space-y-2">
                  {info.requirements.map((r, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <div style={{ flexShrink: 0, width: 17, height: 17, borderRadius: '50%', background: c.lightBlue, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 1 }}><Check size={9} color={c.primary} strokeWidth={3} /></div>
                      <span style={{ fontSize: 12.5, color: c.text, lineHeight: 1.45 }}>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div style={{ background: `linear-gradient(180deg, ${c.navy} 0%, ${c.primaryDark} 100%)`, borderRadius: 12, padding: 18, color: c.white }}>
                <div className="flex items-center gap-3 mb-3">
                  <div style={{ width: 34, height: 34, borderRadius: 9, background: 'rgba(212, 165, 71, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Shield size={16} color={c.gold} /></div>
                  <div><h3 style={{ fontSize: 14, fontWeight: 700 }}>Background Check</h3></div>
                </div>
                <div style={{ fontSize: 12, fontWeight: 700, color: c.gold, marginBottom: 9 }}>{info.backgroundCheck.name}</div>
                <ol className="space-y-2">
                  {info.backgroundCheck.steps.map((step, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <div style={{ flexShrink: 0, width: 17, height: 17, borderRadius: '50%', background: c.gold, color: c.navy, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800 }}>{i + 1}</div>
                      <span style={{ fontSize: 11.5, lineHeight: 1.45, color: 'rgba(255,255,255,0.92)' }}>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        )}

        {/* PARTNERS */}
        {tab === 'partners' && (
          <div>
            <div className="flex items-start justify-between mb-4 flex-wrap gap-3">
              <div>
                <h2 style={{ fontSize: 22, fontWeight: 800, color: c.navy, letterSpacing: '-0.02em', marginBottom: 3 }}>Partners & Marketplace</h2>
                <p style={{ color: c.textMuted, fontSize: 13 }}>Training, consulting, and daycare listings.</p>
              </div>
              <button onClick={() => signedIn ? setShowListBiz(true) : setView('partnerSignup')} style={{ padding: '9px 16px', background: c.gold, color: c.navy, border: 'none', borderRadius: 9, fontSize: 12.5, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
                <Megaphone size={13} /> List Your Business
              </button>
            </div>
            <div className="flex gap-2 mb-4 flex-wrap">
              {['All','Training','Consulting','Advertising'].map(cat => (
                <button key={cat} onClick={() => setPartnerCat(cat)} style={{ padding: '6px 12px', background: partnerCat === cat ? c.primary : c.white, color: partnerCat === cat ? c.white : c.text, border: `1.5px solid ${partnerCat === cat ? c.primary : c.border}`, borderRadius: 999, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>{cat}</button>
              ))}
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredPartners.map(p => (
                <div key={p.id} style={{ background: c.white, border: p.featured ? `2px solid ${c.gold}` : `1.5px solid ${c.border}`, borderRadius: 12, padding: 16, display: 'flex', flexDirection: 'column', position: 'relative' }}>
                  {p.featured && <div style={{ position: 'absolute', top: -10, right: 10, background: c.gold, color: c.navy, fontSize: 9.5, fontWeight: 700, padding: '3px 8px', borderRadius: 999, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Featured</div>}
                  <div className="flex items-start justify-between mb-2">
                    <div style={{ fontSize: 28 }}>{p.icon}</div>
                    <span style={{ fontSize: 9.5, padding: '3px 7px', background: c.paleBlue, color: c.primaryDark, borderRadius: 999, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>{p.category}</span>
                  </div>
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: c.navy, marginBottom: 4, lineHeight: 1.3 }}>{p.name}</h3>
                  <p style={{ fontSize: 12, color: c.primary, fontWeight: 600, marginBottom: 7 }}>{p.tagline}</p>
                  <p style={{ fontSize: 12, color: c.text, lineHeight: 1.5, marginBottom: 10, flex: 1 }}>{p.description}</p>
                  <div className="space-y-1 mb-3" style={{ fontSize: 11.5, color: c.textMuted }}>
                    {p.website && <div className="flex items-center gap-1.5"><ExternalLink size={10} /> {p.website}</div>}
                    {p.phone && <div className="flex items-center gap-1.5"><Phone size={10} /> {p.phone}</div>}
                  </div>
                  <button style={{ marginTop: 'auto', padding: '8px', background: c.primary, color: c.white, border: 'none', borderRadius: 7, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Visit Partner →</button>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 22, background: `linear-gradient(135deg, ${c.primary} 0%, ${c.primaryDark} 100%)`, borderRadius: 12, padding: 20, color: c.white }}>
              <div className="flex items-start gap-3 flex-wrap">
                <div style={{ width: 44, height: 44, borderRadius: 11, background: 'rgba(212, 165, 71, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Megaphone size={20} color={c.gold} /></div>
                <div style={{ flex: 1, minWidth: 240 }}>
                  <h3 style={{ fontSize: 15.5, fontWeight: 700, marginBottom: 5 }}>Reach thousands of daycares and educators</h3>
                  <p style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.85)', lineHeight: 1.5, marginBottom: 10 }}>Service providers $39.99/month. Daycare for sale listings $99 for 30 days.</p>
                  <button onClick={() => signedIn ? setShowListBiz(true) : setView('partnerSignup')} style={{ padding: '9px 16px', background: c.gold, color: c.navy, border: 'none', borderRadius: 9, fontSize: 12.5, fontWeight: 700, cursor: 'pointer' }}>Get Listed Today</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MESSAGES TAB */}
        {tab === 'messages' && signedIn && (
          <div>
            <div className="mb-4">
              <h2 style={{ fontSize: 22, fontWeight: 800, color: c.navy, letterSpacing: '-0.02em', marginBottom: 3 }}>Messages</h2>
              <p style={{ color: c.textMuted, fontSize: 13 }}>{userType === 'owner' ? 'Chat directly with applicants.' : 'Chat directly with daycare centers.'}</p>
            </div>

            <div className="grid lg:grid-cols-3 gap-4" style={{ minHeight: 500 }}>
              {/* CONVERSATION LIST */}
              <div style={{ background: c.white, border: `1.5px solid ${c.border}`, borderRadius: 14, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '12px 14px', borderBottom: `1px solid ${c.border}`, fontSize: 13, fontWeight: 700, color: c.navy }}>
                  {myConversations.length} conversation{myConversations.length === 1 ? '' : 's'}
                </div>
                <div style={{ overflowY: 'auto', flex: 1 }}>
                  {myConversations.length === 0 ? (
                    <div style={{ padding: 30, textAlign: 'center' }}>
                      <Mail size={28} color={c.textMuted} style={{ margin: '0 auto 8px' }} />
                      <p style={{ fontSize: 13, color: c.textMuted, lineHeight: 1.5 }}>{userType === 'owner' ? 'No conversations yet. They\'ll appear here when applicants apply or message you.' : 'No conversations yet. Apply to a job or contact a center to start chatting.'}</p>
                    </div>
                  ) : (
                    myConversations.map(conv => {
                      const other = conv.participants.find(p => p.email !== signup.email);
                      const lastMsg = conv.messages[conv.messages.length - 1];
                      const isUnread = (conv.unreadFor || []).includes(signup.email);
                      return (
                        <button key={conv.id} onClick={() => { setActiveConvId(conv.id); markConversationRead(conv.id); }} style={{ width: '100%', textAlign: 'left', padding: '12px 14px', background: activeConvId === conv.id ? c.paleBlue : 'transparent', border: 'none', borderBottom: `1px solid ${c.borderSoft}`, cursor: 'pointer', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                          <Avatar name={other?.name || '?'} photo={other?.photo} size={38} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 justify-between mb-0.5">
                              <div style={{ fontSize: 13.5, fontWeight: isUnread ? 700 : 600, color: c.navy, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{other?.name}</div>
                              {isUnread && <div style={{ width: 8, height: 8, borderRadius: '50%', background: c.coral, flexShrink: 0 }} />}
                            </div>
                            {conv.jobTitle && <div style={{ fontSize: 11, color: c.primary, fontWeight: 600, marginBottom: 2 }}>Re: {conv.jobTitle}</div>}
                            <div style={{ fontSize: 12, color: c.textMuted, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: isUnread ? 600 : 400 }}>{lastMsg ? (lastMsg.from === signup.email ? 'You: ' : '') + lastMsg.text : 'No messages yet'}</div>
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              {/* CONVERSATION VIEW */}
              <div style={{ gridColumn: 'span 2', background: c.white, border: `1.5px solid ${c.border}`, borderRadius: 14, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                {!activeConvId ? (
                  <div style={{ padding: 40, textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                    <Mail size={36} color={c.textMuted} style={{ marginBottom: 12 }} />
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: c.navy, marginBottom: 4 }}>Select a conversation</h3>
                    <p style={{ fontSize: 13, color: c.textMuted, maxWidth: 280 }}>Pick a conversation from the list to view messages and reply.</p>
                  </div>
                ) : (() => {
                  const conv = myConversations.find(c => c.id === activeConvId);
                  if (!conv) return null;
                  const other = conv.participants.find(p => p.email !== signup.email);
                  return (
                    <>
                      <div style={{ padding: '12px 16px', borderBottom: `1px solid ${c.border}`, display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Avatar name={other?.name || '?'} photo={other?.photo} size={36} />
                        <div className="flex-1 min-w-0">
                          <div style={{ fontSize: 14, fontWeight: 700, color: c.navy }}>{other?.name}</div>
                          {conv.jobTitle ? <div style={{ fontSize: 11.5, color: c.primary, fontWeight: 600 }}>Re: {conv.jobTitle}</div> : <div style={{ fontSize: 11.5, color: c.textMuted }}>{other?.role === 'worker' ? 'Applicant' : 'Daycare Center'}</div>}
                        </div>
                      </div>
                      <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 10, background: c.cream }}>
                        {conv.messages.length === 0 ? (
                          <div style={{ textAlign: 'center', padding: 20, fontSize: 13, color: c.textMuted }}>No messages yet. Say hi to get started.</div>
                        ) : (
                          conv.messages.map((msg, i) => {
                            const mine = msg.from === signup.email;
                            return (
                              <div key={i} style={{ display: 'flex', justifyContent: mine ? 'flex-end' : 'flex-start' }}>
                                <div style={{ maxWidth: '78%', padding: '9px 13px', background: mine ? c.primary : c.white, color: mine ? c.white : c.text, borderRadius: 14, border: mine ? 'none' : `1px solid ${c.border}`, fontSize: 13.5, lineHeight: 1.45, wordBreak: 'break-word' }}>
                                  {msg.text}
                                  <div style={{ fontSize: 10, color: mine ? 'rgba(255,255,255,0.7)' : c.textMuted, marginTop: 4, textAlign: mine ? 'right' : 'left' }}>{new Date(msg.time).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</div>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                      <div style={{ padding: 12, borderTop: `1px solid ${c.border}`, display: 'flex', gap: 8 }}>
                        <input value={messageDraft} onChange={e => setMessageDraft(e.target.value)} onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMessage(activeConvId, messageDraft))} placeholder="Type a message..." style={{ flex: 1, padding: '10px 13px', fontSize: 13.5, border: `1.5px solid ${c.border}`, borderRadius: 10, background: c.white, color: c.text, outline: 'none' }} />
                        <button onClick={() => sendMessage(activeConvId, messageDraft)} disabled={!messageDraft.trim()} style={{ padding: '10px 16px', background: messageDraft.trim() ? c.primary : c.textMuted, color: c.white, border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: messageDraft.trim() ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', gap: 5 }}>
                          <Send size={13} /> Send
                        </button>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          </div>
        )}

        {/* MY PROFILE - workers can edit their saved profile */}
        {tab === 'myProfile' && signedIn && userType === 'worker' && (
          <div>
            <div className="flex items-start justify-between mb-4 flex-wrap gap-3">
              <div>
                <h2 style={{ fontSize: 22, fontWeight: 800, color: c.navy, letterSpacing: '-0.02em', marginBottom: 3 }}>My Profile</h2>
                <p style={{ color: c.textMuted, fontSize: 13 }}>Update your info anytime. Changes save automatically.</p>
              </div>
              <div style={{ fontSize: 11, color: c.success, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}><Check size={12} /> Auto saving</div>
            </div>

            <div className="grid lg:grid-cols-3 gap-4">
              {/* Profile preview card */}
              <div style={{ background: c.white, border: `1.5px solid ${c.border}`, borderRadius: 14, padding: 22, textAlign: 'center', height: 'fit-content', position: 'sticky', top: 90 }}>
                <Avatar name={signup.name} photo={profile.photo} size={96} />
                <div style={{ marginTop: 12 }}>
                  <h3 style={{ fontSize: 18, fontWeight: 800, color: c.navy, marginBottom: 4 }}>{signup.name || 'Your Name'}</h3>
                  <p style={{ fontSize: 13, color: c.textMuted, marginBottom: 10 }}>{profile.city}, {profile.state}</p>
                  {profile.bgCheck === 'Cleared and current' && (
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', background: c.success, color: c.white, borderRadius: 999, fontSize: 11, fontWeight: 700, marginBottom: 10 }}>
                      <Verified size={11} fill={c.white} stroke={c.success} /> Bg Check Cleared
                    </div>
                  )}
                  {profile.bgCheck === 'Portable background check' && (
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', background: c.coralDark, color: c.white, borderRadius: 999, fontSize: 11, fontWeight: 700, marginBottom: 10 }}>
                      <Shield size={11} /> Portable Check · Ready to Start
                    </div>
                  )}
                  <div style={{ paddingTop: 12, marginTop: 12, borderTop: `1px solid ${c.border}`, fontSize: 12.5, color: c.textMuted, textAlign: 'left' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}><span>Experience</span><strong style={{ color: c.text }}>{profile.years || 'Not set'}</strong></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}><span>Availability</span><strong style={{ color: c.text }}>{profile.availability || 'Not set'}</strong></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Applications</span><strong style={{ color: c.primary }}>{applied.length}</strong></div>
                  </div>
                </div>
                <div style={{ marginTop: 14, padding: 10, background: c.paleBlue, borderRadius: 8, fontSize: 11.5, color: c.primaryDark }}>
                  This is what daycare centers see when you apply.
                </div>
              </div>

              {/* Edit form */}
              <div style={{ gridColumn: 'span 2', background: c.white, borderRadius: 14, padding: '20px 18px', border: `1px solid ${c.border}` }}>
                <Section icon={Camera} title="Profile Photo" sub="Recommended. Builds trust with centers.">
                  <div className="flex items-center gap-4">
                    <Avatar name={signup.name || 'You'} photo={profile.photo} size={72} />
                    <div className="flex-1">
                      {profile.photo ? (
                        <div className="flex gap-2">
                          <label style={{ padding: '8px 14px', background: c.paleBlue, color: c.primary, border: `1.5px solid ${c.primary}`, borderRadius: 8, fontSize: 12.5, fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                            <Camera size={13} /> Change
                            <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} />
                          </label>
                          <button onClick={() => setProfile({...profile, photo: ''})} style={{ padding: '8px 12px', background: c.white, color: c.textMuted, border: `1.5px solid ${c.border}`, borderRadius: 8, fontSize: 12.5, fontWeight: 600, cursor: 'pointer' }}><Trash2 size={13} /></button>
                        </div>
                      ) : (
                        <label style={{ padding: '10px 16px', background: c.cream, color: c.primary, border: `2px dashed ${c.border}`, borderRadius: 8, fontSize: 12.5, fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                          <Upload size={13} /> Upload photo
                          <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} />
                        </label>
                      )}
                    </div>
                  </div>
                </Section>

                <Section icon={User} title="Account Info" sub="Your name, contact details, and password.">
                  <Input label="Full Name" value={signup.name} onChange={v => setSignup({...signup, name: v})} placeholder="Toni Brewer" />
                  <Input label="Email" value={signup.email} onChange={v => setSignup({...signup, email: v})} placeholder="you@example.com" type="email" />
                  <Input label="Phone" value={signup.phone} onChange={v => setSignup({...signup, phone: v})} placeholder="(555) 123 4567" />
                </Section>

                <Section icon={MapPin} title="Location" sub="Drives which jobs you see.">
                  <div className="grid grid-cols-2 gap-3">
                    <Input label="City" value={profile.city} onChange={v => setProfile({...profile, city: v})} placeholder="Lithonia" />
                    <Select label="State" value={profile.state} onChange={v => setProfile({...profile, state: v})} options={STATES} />
                  </div>
                  <Input label="Zip" value={profile.zip} onChange={v => setProfile({...profile, zip: v})} placeholder="30038" />
                </Section>

                <Section icon={Briefcase} title="Background" sub="Tell us about your experience.">
                  <Select label="Years of Experience" value={profile.years} onChange={v => setProfile({...profile, years: v})} options={['Less than 1 year','1 to 2 years','3 to 5 years','6 to 10 years','10+ years']} placeholder="Select" />
                  <ChipGroup label="Age Groups You've Worked With" items={AGE_GROUPS} selected={profile.ageGroups} onChange={item => setProfile({...profile, ageGroups: toggleArr(profile.ageGroups, item)})} />
                  <Select label="Highest Education" value={profile.education} onChange={v => setProfile({...profile, education: v})} options={['High School / GED','Some College','Associate Degree','Bachelor Degree','Master Degree']} placeholder="Select" />
                  <Select label="Availability" value={profile.availability} onChange={v => setProfile({...profile, availability: v})} options={['Full Time','Part Time','Both','Substitute only']} placeholder="Select" />
                  <ChipGroup label="Positions You're Interested In" items={POSITIONS_LIST} selected={profile.positions} onChange={item => setProfile({...profile, positions: toggleArr(profile.positions, item)})} />
                </Section>

                <Section icon={Award} title="Credentials" sub="Mark what you currently hold.">
                  <ChipGroup label="Current Credentials" items={CREDENTIALS_LIST} selected={profile.credentials} onChange={item => setProfile({...profile, credentials: toggleArr(profile.credentials, item)})} />
                  <Select label="Background Check Status" value={profile.bgCheck} onChange={v => setProfile({...profile, bgCheck: v})} options={['Cleared and current','Portable background check','In progress','Not started yet']} placeholder="Select" />
                </Section>

                <Section icon={Paperclip} title="Documents" sub="Resume and certificates.">
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: c.text, marginBottom: 6 }}>Resume</label>
                    {profile.resume ? (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 13px', background: c.paleBlue, border: `1.5px solid ${c.primary}`, borderRadius: 10 }}>
                        <div className="flex items-center gap-2" style={{ fontSize: 13, color: c.primaryDark, fontWeight: 600 }}>
                          <FileText size={15} color={c.primary} />{profile.resume}
                        </div>
                        <button onClick={() => setProfile({...profile, resume: ''})} style={{ background: 'none', border: 'none', cursor: 'pointer', color: c.textMuted, padding: 2 }}><Trash2 size={14} /></button>
                      </div>
                    ) : (
                      <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '14px', background: c.cream, border: `2px dashed ${c.border}`, borderRadius: 10, cursor: 'pointer', color: c.textMuted, fontSize: 13, fontWeight: 600 }}>
                        <Upload size={14} /> Upload Resume
                        <input type="file" accept=".pdf,.doc,.docx" onChange={handleResumeUpload} style={{ display: 'none' }} />
                      </label>
                    )}
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: c.text, marginBottom: 6 }}>Certificates and Credentials</label>
                    <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '12px', background: c.cream, border: `2px dashed ${c.border}`, borderRadius: 10, cursor: 'pointer', color: c.textMuted, fontSize: 12.5, fontWeight: 600, marginBottom: 7 }}>
                      <Plus size={14} /> Add Files
                      <input type="file" multiple accept=".pdf,.jpg,.jpeg,.png" onChange={handleCredFiles} style={{ display: 'none' }} />
                    </label>
                    {profile.credentialFiles?.length > 0 && (
                      <div className="space-y-1.5">
                        {profile.credentialFiles.map((f, i) => (
                          <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 11px', background: c.paleBlue, borderRadius: 7 }}>
                            <div className="flex items-center gap-2" style={{ fontSize: 12.5, color: c.primaryDark }}><FileText size={13} color={c.primary} />{f}</div>
                            <button onClick={() => removeCredFile(f)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: c.textMuted }}><Trash2 size={13} /></button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </Section>

                <Section icon={Edit3} title="About You" sub="A short intro centers read first.">
                  <textarea value={profile.bio} onChange={e => setProfile({...profile, bio: e.target.value})} placeholder="I'm a warm, patient teacher..." rows={4} style={{ width: '100%', padding: '10px 13px', fontSize: 13.5, border: `1.5px solid ${c.border}`, borderRadius: 10, background: c.white, color: c.text, outline: 'none', fontFamily: 'inherit', resize: 'vertical' }} />
                </Section>

                <Section icon={Lock} title="Change Password" sub="Want a new password? Reset it here.">
                  <button onClick={() => { setResetStep('email'); setResetData({ email: signup.email, code: '', newPassword: '', confirmPassword: '' }); setResetError(''); setView('forgotPassword'); }} style={{ padding: '10px 16px', background: c.white, color: c.primary, border: `1.5px solid ${c.primary}`, borderRadius: 9, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Reset Password</button>
                </Section>

                <div style={{ background: c.success, color: c.white, padding: '12px 14px', borderRadius: 10, fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <CheckCircle2 size={16} /> All changes are saved automatically</div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* POST JOB */}
      {showPost && (
        <Modal onClose={() => setShowPost(false)}>
          <h3 style={{ fontSize: 19, fontWeight: 800, color: c.navy, marginBottom: 14 }}>Post a New Job</h3>
          <div className="space-y-3">
            <Input label="Job Title" value={newJob.title} onChange={v => setNewJob({...newJob, title: v})} placeholder="Lead Toddler Teacher" />
            <Input label="Location" value={newJob.location} onChange={v => setNewJob({...newJob, location: v})} placeholder="Lithonia, GA" />
            <Select label="Job Type" value={newJob.type} onChange={v => setNewJob({...newJob, type: v})} options={['Full Time','Part Time']} />
            <Input label="Pay Range" value={newJob.pay} onChange={v => setNewJob({...newJob, pay: v})} placeholder="$15 to $18 / hr" />
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: c.text, marginBottom: 5 }}>Description</label>
              <textarea value={newJob.description} onChange={e => setNewJob({...newJob, description: e.target.value})} rows={5} style={{ width: '100%', padding: '10px 13px', fontSize: 13.5, border: `1.5px solid ${c.border}`, borderRadius: 10, background: c.white, color: c.text, outline: 'none', fontFamily: 'inherit' }} />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={() => setShowPost(false)} style={{ flex: 1, padding: '10px', background: c.cream, color: c.text, border: `1px solid ${c.border}`, borderRadius: 9, fontSize: 13.5, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
            <button onClick={handlePost} disabled={!newJob.title || !newJob.location} style={{ flex: 1, padding: '10px', background: (!newJob.title || !newJob.location) ? c.textMuted : c.primary, color: c.white, border: 'none', borderRadius: 9, fontSize: 13.5, fontWeight: 700, cursor: (!newJob.title || !newJob.location) ? 'not-allowed' : 'pointer' }}>Publish Job</button>
          </div>
        </Modal>
      )}

      {/* AUTH PROMPT */}
      {authPromptJob && (
        <Modal onClose={() => setAuthPromptJob(null)}>
          <div style={{ textAlign: 'center', padding: '6px 2px 2px' }}>
            <div style={{ width: 52, height: 52, borderRadius: '50%', background: c.lightBlue, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}><Lock size={22} color={c.primary} /></div>
            <h3 style={{ fontSize: 19, fontWeight: 800, color: c.navy, marginBottom: 5 }}>{!signedIn ? 'Create a profile to apply' : 'Complete your profile to apply'}</h3>
            <p style={{ color: c.textMuted, fontSize: 13, lineHeight: 1.5, marginBottom: 16 }}>{!signedIn ? 'Daycare centers want to know who they\'re hiring. Build a profile so they can connect with you.' : 'Your profile is what centers see. It only takes 2 minutes.'}</p>
            <div className="space-y-2">
              <button onClick={() => {
                if (authPromptJob.id > 0) setPendingApply(authPromptJob.id);
                setAuthPromptJob(null);
                if (!signedIn) setView('roleChoice'); else setView('profile');
              }} style={{ width: '100%', padding: '10px', background: c.primary, color: c.white, border: 'none', borderRadius: 9, fontSize: 13.5, fontWeight: 700, cursor: 'pointer' }}>{!signedIn ? 'Create Free Account' : 'Complete My Profile'}</button>
              {!signedIn && (
                <button onClick={() => { setAuthPromptJob(null); setView('login'); }} style={{ width: '100%', padding: '10px', background: c.white, color: c.primary, border: `1.5px solid ${c.primary}`, borderRadius: 9, fontSize: 13.5, fontWeight: 700, cursor: 'pointer' }}>I Already Have an Account · Log In</button>
              )}
              <button onClick={() => setAuthPromptJob(null)} style={{ width: '100%', padding: '8px', background: 'none', color: c.textMuted, border: 'none', fontSize: 12.5, fontWeight: 500, cursor: 'pointer' }}>Not Now</button>
            </div>
          </div>
        </Modal>
      )}

      {/* APPLICANTS LIST + DETAIL */}
      {viewingApplicantsFor && (
        <Modal onClose={() => { setViewingApplicantsFor(null); setViewingApplicantDetail(null); }} wide>
          {viewingApplicantDetail ? (
            // DETAIL VIEW
            <div>
              <button onClick={() => setViewingApplicantDetail(null)} style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: 'pointer', color: c.primary, fontSize: 13, fontWeight: 600, marginBottom: 16, padding: 0 }}><ChevronLeft size={14} /> Back to all applicants</button>
              <div className="flex items-start gap-4 mb-5 flex-wrap">
                <Avatar name={viewingApplicantDetail.name} photo={viewingApplicantDetail.photo} size={80} />
                <div className="flex-1 min-w-0">
                  <h3 style={{ fontSize: 22, fontWeight: 800, color: c.navy, letterSpacing: '-0.02em', marginBottom: 4 }}>{viewingApplicantDetail.name}</h3>
                  <div className="flex flex-wrap gap-x-3 gap-y-1" style={{ fontSize: 13, color: c.textMuted }}>
                    <span className="flex items-center gap-1.5"><MapPin size={12} /> {viewingApplicantDetail.city}, {viewingApplicantDetail.state}</span>
                    <span className="flex items-center gap-1.5"><Calendar size={12} /> Applied {viewingApplicantDetail.appliedDate}</span>
                  </div>
                  {viewingApplicantDetail.bgCheck === 'Cleared and current' && (
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: 7, padding: '4px 10px', background: c.success, color: c.white, borderRadius: 999, fontSize: 11.5, fontWeight: 700 }}>
                      <Verified size={11} fill={c.white} stroke={c.success} /> Background Check Cleared
                    </div>
                  )}
                  {viewingApplicantDetail.bgCheck === 'Portable background check' && (
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: 7, padding: '4px 10px', background: c.coralDark, color: c.white, borderRadius: 999, fontSize: 11.5, fontWeight: 700 }}>
                      <Shield size={11} /> Portable Background Check · Ready to Start
                    </div>
                  )}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <DetailBox label="Contact">
                  <div className="space-y-1.5">
                    <a href={`mailto:${viewingApplicantDetail.email}`} className="flex items-center gap-2" style={{ fontSize: 13, color: c.primary, fontWeight: 600, textDecoration: 'none' }}><Mail size={13} /> {viewingApplicantDetail.email}</a>
                    <a href={`tel:${viewingApplicantDetail.phone}`} className="flex items-center gap-2" style={{ fontSize: 13, color: c.primary, fontWeight: 600, textDecoration: 'none' }}><Phone size={13} /> {viewingApplicantDetail.phone}</a>
                  </div>
                </DetailBox>
                <DetailBox label="Background">
                  <div className="space-y-1" style={{ fontSize: 13, color: c.text }}>
                    <div><strong>Experience:</strong> {viewingApplicantDetail.years}</div>
                    <div><strong>Availability:</strong> {viewingApplicantDetail.availability}</div>
                    {viewingApplicantDetail.education && <div><strong>Education:</strong> {viewingApplicantDetail.education}</div>}
                  </div>
                </DetailBox>
              </div>

              {viewingApplicantDetail.bio && (
                <DetailBox label="About">
                  <p style={{ fontSize: 13.5, color: c.text, lineHeight: 1.55, fontStyle: 'italic' }}>"{viewingApplicantDetail.bio}"</p>
                </DetailBox>
              )}

              <DetailBox label="Positions Interested In">
                <div className="flex flex-wrap gap-1.5">
                  {(viewingApplicantDetail.positions || []).map((p, i) => <span key={i} style={{ fontSize: 12, padding: '4px 10px', background: c.lightBlue, color: c.primaryDark, borderRadius: 999, fontWeight: 600 }}>{p}</span>)}
                </div>
              </DetailBox>

              <DetailBox label="Age Groups Worked With">
                <div className="flex flex-wrap gap-1.5">
                  {(viewingApplicantDetail.ageGroups || []).map((a, i) => <span key={i} style={{ fontSize: 12, padding: '4px 10px', background: c.paleBlue, color: c.primaryDark, borderRadius: 999, fontWeight: 600 }}>{a}</span>)}
                </div>
              </DetailBox>

              <DetailBox label="Credentials">
                <div className="flex flex-wrap gap-1.5">
                  {(viewingApplicantDetail.credentials || []).map((cr, i) => (
                    <span key={i} style={{ fontSize: 12, padding: '4px 10px', background: c.cream, border: `1px solid ${c.border}`, color: c.text, borderRadius: 999, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Award size={11} color={c.primary} /> {cr}
                    </span>
                  ))}
                </div>
              </DetailBox>

              {(viewingApplicantDetail.resume || viewingApplicantDetail.credentialFiles?.length > 0) && (
                <DetailBox label="Documents">
                  <div className="space-y-1.5">
                    {viewingApplicantDetail.resume && (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: c.paleBlue, borderRadius: 7 }}>
                        <div className="flex items-center gap-2" style={{ fontSize: 12.5, color: c.primaryDark, fontWeight: 600 }}><FileText size={13} color={c.primary} /> {viewingApplicantDetail.resume}</div>
                        <span style={{ fontSize: 11, color: c.textMuted }}>Resume</span>
                      </div>
                    )}
                    {(viewingApplicantDetail.credentialFiles || []).map((f, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: c.paleBlue, borderRadius: 7 }}>
                        <div className="flex items-center gap-2" style={{ fontSize: 12.5, color: c.primaryDark, fontWeight: 600 }}><Paperclip size={13} color={c.primary} /> {f}</div>
                        <span style={{ fontSize: 11, color: c.textMuted }}>Certificate</span>
                      </div>
                    ))}
                  </div>
                </DetailBox>
              )}

              <div className="flex gap-2 pt-4 flex-wrap" style={{ borderTop: `1px solid ${c.border}` }}>
                <button onClick={() => {
                  startOrOpenConversation({
                    email: viewingApplicantDetail.email,
                    name: viewingApplicantDetail.name,
                    role: 'worker',
                    photo: viewingApplicantDetail.photo,
                    jobTitle: viewingApplicantsFor.title
                  });
                  setViewingApplicantsFor(null);
                  setViewingApplicantDetail(null);
                }} style={{ padding: '10px 18px', background: c.primary, color: c.white, border: 'none', borderRadius: 9, fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}><Mail size={13} /> Message</button>
                <a href={`mailto:${viewingApplicantDetail.email}`} style={{ padding: '10px 18px', background: c.white, color: c.primary, border: `1.5px solid ${c.primary}`, borderRadius: 9, fontSize: 13, fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}><Mail size={13} /> Email</a>
                <a href={`tel:${viewingApplicantDetail.phone}`} style={{ padding: '10px 18px', background: c.white, color: c.primary, border: `1.5px solid ${c.primary}`, borderRadius: 9, fontSize: 13, fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}><Phone size={13} /> Call</a>
                <button style={{ padding: '10px 18px', background: c.gold, color: c.navy, border: 'none', borderRadius: 9, fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}><Heart size={13} /> Mark Interested</button>
              </div>
            </div>
          ) : (
            // LIST VIEW
            <div>
              <h3 style={{ fontSize: 19, fontWeight: 800, color: c.navy, marginBottom: 3 }}>Applicants for {viewingApplicantsFor.title}</h3>
              <p style={{ fontSize: 12.5, color: c.textMuted, marginBottom: 14 }}>{(jobApplicants[viewingApplicantsFor.id] || []).length} applicant{(jobApplicants[viewingApplicantsFor.id] || []).length === 1 ? '' : 's'} · {viewingApplicantsFor.location}</p>
              {(jobApplicants[viewingApplicantsFor.id] || []).length === 0 ? (
                <div style={{ padding: 36, textAlign: 'center', background: c.cream, borderRadius: 10 }}>
                  <Users size={24} color={c.textMuted} style={{ margin: '0 auto 8px' }} />
                  <p style={{ fontSize: 13, color: c.textMuted }}>No applicants yet. We'll notify you when someone applies.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {(jobApplicants[viewingApplicantsFor.id] || []).map((a, i) => (
                    <button key={i} onClick={() => setViewingApplicantDetail(a)} style={{ width: '100%', textAlign: 'left', border: `1.5px solid ${c.border}`, borderRadius: 11, padding: 14, background: c.white, cursor: 'pointer', display: 'flex', gap: 12, alignItems: 'center' }} className="hover:border-blue-400 hover:shadow-md transition-all">
                      <Avatar name={a.name} photo={a.photo} size={48} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <div style={{ fontSize: 14.5, fontWeight: 700, color: c.navy }}>{a.name}</div>
                          {a.bgCheck === 'Cleared and current' && <Verified size={13} fill={c.success} stroke={c.white} strokeWidth={2.5} />}
                          {a.bgCheck === 'Portable background check' && <span title="Portable background check" style={{ display: 'inline-flex', alignItems: 'center', gap: 3, padding: '1px 6px', background: c.coralDark, color: c.white, borderRadius: 999, fontSize: 9.5, fontWeight: 700 }}><Shield size={9} /> Portable</span>}
                        </div>
                        <div className="flex flex-wrap gap-x-2.5 gap-y-0.5" style={{ fontSize: 11.5, color: c.textMuted }}>
                          <span className="flex items-center gap-1"><MapPin size={10} /> {a.city}, {a.state}</span>
                          <span className="flex items-center gap-1"><Clock size={10} /> {a.years}</span>
                          {a.availability && <span>· {a.availability}</span>}
                        </div>
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {(a.credentials || []).slice(0, 3).map((cr, j) => <span key={j} style={{ fontSize: 10, padding: '2px 7px', background: c.lightBlue, color: c.primaryDark, borderRadius: 999, fontWeight: 600 }}>{cr}</span>)}
                          {(a.credentials || []).length > 3 && <span style={{ fontSize: 10, color: c.textMuted, fontWeight: 600 }}>+{a.credentials.length - 3} more</span>}
                        </div>
                      </div>
                      <ArrowRight size={16} color={c.textMuted} />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </Modal>
      )}

      {/* LIST BUSINESS */}
      {showListBiz && (
        <Modal onClose={() => setShowListBiz(false)}>
          <h3 style={{ fontSize: 19, fontWeight: 800, color: c.navy, marginBottom: 4 }}>List Your Business</h3>
          <p style={{ fontSize: 12.5, color: c.textMuted, marginBottom: 16 }}>Reach thousands of daycares and educators.</p>
          <div className="space-y-3">
            <div>
              <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: c.text, marginBottom: 6 }}>Category</label>
              <div className="grid grid-cols-3 gap-2">
                {['Training','Consulting','Advertising'].map(cat => (
                  <button key={cat} type="button" onClick={() => setNewListing({...newListing, category: cat})} style={{ padding: '9px', background: newListing.category === cat ? c.primary : c.white, color: newListing.category === cat ? c.white : c.text, border: `1.5px solid ${newListing.category === cat ? c.primary : c.border}`, borderRadius: 9, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>{cat}</button>
                ))}
              </div>
              <p style={{ fontSize: 11, color: c.textMuted, marginTop: 5, fontStyle: 'italic' }}>{newListing.category === 'Advertising' ? 'Daycare for sale, equipment, services. $99 for 30 days.' : '$39.99/month recurring. Cancel anytime.'}</p>
            </div>
            <Input label="Business Name" value={newListing.name} onChange={v => setNewListing({...newListing, name: v})} placeholder="Atlanta CPR & First Aid" />
            <Input label="Tagline" value={newListing.tagline} onChange={v => setNewListing({...newListing, tagline: v})} placeholder="Pediatric CPR in one weekend" />
            <div>
              <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: c.text, marginBottom: 5 }}>Description</label>
              <textarea value={newListing.description} onChange={e => setNewListing({...newListing, description: e.target.value})} rows={3} style={{ width: '100%', padding: '9px 12px', fontSize: 13.5, border: `1.5px solid ${c.border}`, borderRadius: 9, background: c.white, color: c.text, outline: 'none', fontFamily: 'inherit' }} />
            </div>
            <Input label="Website" value={newListing.website} onChange={v => setNewListing({...newListing, website: v})} placeholder="yoursite.com" />
            <Input label="Phone" value={newListing.phone} onChange={v => setNewListing({...newListing, phone: v})} placeholder="(555) 123 4567" />
          </div>
          <div style={{ background: c.paleBlue, padding: 11, borderRadius: 9, marginTop: 14, fontSize: 12, color: c.primaryDark, display: 'flex', alignItems: 'center', gap: 7 }}>
            <Lock size={12} /><div><strong>Payment: ${newListing.category === 'Advertising' ? '99 for 30 days' : '39.99 / month'}</strong> (Stripe checkout in production)</div>
          </div>
          <div className="flex gap-3 mt-3">
            <button onClick={() => setShowListBiz(false)} style={{ flex: 1, padding: '10px', background: c.cream, color: c.text, border: `1px solid ${c.border}`, borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
            <button onClick={handleListBusiness} disabled={!newListing.name || !newListing.tagline} style={{ flex: 1, padding: '10px', background: (!newListing.name || !newListing.tagline) ? c.textMuted : c.gold, color: c.navy, border: 'none', borderRadius: 9, fontSize: 13, fontWeight: 700, cursor: (!newListing.name || !newListing.tagline) ? 'not-allowed' : 'pointer' }}>Continue to Payment</button>
          </div>
        </Modal>
      )}
      <Footer />
    </div>
  );
}

function Input({ label, value, onChange, placeholder, type = 'text' }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: c.text, marginBottom: 5 }}>{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={{ width: '100%', padding: '9px 12px', fontSize: 13.5, border: `1.5px solid ${c.border}`, borderRadius: 9, background: c.white, color: c.text, outline: 'none' }} />
    </div>
  );
}

function Select({ label, value, onChange, options, placeholder }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: c.text, marginBottom: 5 }}>{label}</label>
      <select value={value} onChange={e => onChange(e.target.value)} style={{ width: '100%', padding: '9px 12px', fontSize: 13.5, border: `1.5px solid ${c.border}`, borderRadius: 9, background: c.white, color: c.text, outline: 'none' }}>
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

function ChipGroup({ label, items, selected, onChange }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: c.text, marginBottom: 6 }}>{label}</label>
      <div className="flex flex-wrap gap-1.5">
        {items.map(item => {
          const isOn = selected.includes(item);
          return (
            <button key={item} type="button" onClick={() => onChange(item)} style={{ padding: '5px 11px', fontSize: 12, background: isOn ? c.primary : c.white, color: isOn ? c.white : c.text, border: `1.5px solid ${isOn ? c.primary : c.border}`, borderRadius: 999, cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 3 }}>
              {isOn && <Check size={10} strokeWidth={3} />}{item}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Section({ icon: Icon, title, sub, children }) {
  return (
    <div style={{ marginBottom: 18, paddingBottom: 16, borderBottom: `1px solid ${c.borderSoft}` }}>
      <div className="flex items-start gap-2.5 mb-2.5">
        <div style={{ width: 32, height: 32, borderRadius: 8, background: c.lightBlue, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon size={15} color={c.primary} /></div>
        <div>
          <h3 style={{ fontSize: 14.5, fontWeight: 700, color: c.navy, marginBottom: 1 }}>{title}</h3>
          <p style={{ fontSize: 11.5, color: c.textMuted, lineHeight: 1.4 }}>{sub}</p>
        </div>
      </div>
      <div className="space-y-2.5">{children}</div>
    </div>
  );
}

function DetailBox({ label, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 10.5, fontWeight: 700, color: c.textMuted, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>{label}</div>
      <div style={{ padding: 12, background: c.cream, borderRadius: 9 }}>{children}</div>
    </div>
  );
}

function Footer() {
  // TODO: Build real About, Contact, Privacy, Terms, Help pages
  const handleLink = (name) => alert(`${name}: Coming soon!`);
  const links = ['About', 'Contact', 'Privacy', 'Terms', 'Help'];
  return (
    <footer style={{ background: c.navy, color: 'rgba(255,255,255,0.7)', padding: '32px 0', marginTop: 40 }}>
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row md:items-center md:justify-between gap-5">
        <div className="flex flex-col gap-3">
          <div style={{ background: c.white, padding: '10px 16px', borderRadius: 12, display: 'inline-flex', alignSelf: 'flex-start', boxShadow: '0 4px 14px rgba(0,0,0,0.18)' }}>
            <img src="/logo.png" alt="Rellim KidKare Konnect" style={{ height: 56, width: 'auto', display: 'block' }} />
          </div>
          <div className="flex flex-wrap" style={{ gap: '4px 16px' }}>
            {links.map(l => (
              <button key={l} type="button" onClick={() => handleLink(l)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.78)', padding: 0, fontSize: 13, fontWeight: 500 }}>{l}</button>
            ))}
          </div>
          <div style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.55)' }}>© 2026 Rellim KidKare Konnect · A Rellim company</div>
        </div>
        <div style={{ fontSize: 14, color: c.gold, fontWeight: 600, fontStyle: 'italic' }}>Where Great Childcare Begins</div>
      </div>
    </footer>
  );
}

function HeroPhoto() {
  // Photo lives at public/hero.jpg and ships with the build.
  const [failed, setFailed] = useState(false);
  return (
    <div style={{ position: 'relative', borderRadius: 22, overflow: 'hidden', boxShadow: '0 24px 60px rgba(15,42,61,0.18)', aspectRatio: '3 / 2', background: 'linear-gradient(135deg, #FFE9C9 0%, #FFD0A3 100%)', width: '100%' }}>
      {!failed ? (
        <img
          src="/hero.jpg"
          alt="A teacher reading a book to five multicultural preschool children in a sunlit classroom"
          loading="eager"
          onError={() => setFailed(true)}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
      ) : (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 28, textAlign: 'center' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(255,255,255,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
            <Heart size={28} color="#FF6E2B" fill="#FF8C42" />
          </div>
          <div style={{ fontSize: 16, fontWeight: 700, color: c.navy, lineHeight: 1.3, maxWidth: 280 }}>Where every classroom is a place to grow</div>
        </div>
      )}
    </div>
  );
}

function Modal({ children, onClose, wide }) {
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(15, 42, 61, 0.55)', backdropFilter: 'blur(4px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: c.white, borderRadius: 16, padding: 22, maxWidth: wide ? 640 : 440, width: '100%', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 12, right: 12, background: 'none', border: 'none', cursor: 'pointer', color: c.textMuted, padding: 4 }}><X size={17} /></button>
        {children}
      </div>
    </div>
  );
}
