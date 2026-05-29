import { useState, useEffect, useRef, useMemo } from 'react';
import { supabase } from './supabase';
import { SUPPORT_PHONE, SUPPORT_PHONE_TEL, STRIPE_PRICE_IDS } from './config';
import {
  Briefcase, GraduationCap, MapPin, Users, Search, Heart, Send,
  Check, Award, Shield, BookOpen, Building2, User, ArrowRight,
  Clock, DollarSign, X, Plus, FileText, ExternalLink,
  LogOut, Bookmark, LayoutGrid, CheckCircle2, Lock, Verified,
  AlertCircle, Edit3, Upload, Paperclip, Handshake, Megaphone,
  Phone, Mail, Trash2, Camera, ChevronLeft, Calendar, KeyRound, MessageCircle, Eye, EyeOff, Circle, Star, Globe
} from 'lucide-react';

const c = {
  cream: '#FAF6EE', paleBlue: '#EEF5FA', lightBlue: '#DCE9F2',
  blue: '#3D7BA0', primary: '#2B5F7E', primaryDark: '#1A4257',
  navy: '#0F2A3D', coral: '#E8A78F', coralDark: '#D88E72',
  gold: '#D4A547', text: '#1A2B3C', textMuted: '#5C7280',
  white: '#FFFFFF', border: '#E8DEC9', borderSoft: '#F0E8D8',
  success: '#5B8C6E'
};

// While we focus on Georgia (Atlanta metro and surrounding areas) we lock
// the state dropdowns to Georgia only. To expand to additional states later,
// uncomment the others below — the rest of the app (state licensing pages,
// filtering, etc.) already knows how to handle multiple states.
const STATES = [
  'Georgia',
  // 'Alabama','Alaska','Arizona','Arkansas','California','Colorado',
  // 'Connecticut','Delaware','Florida','Hawaii','Idaho','Illinois','Indiana',
  // 'Iowa','Kansas','Kentucky','Louisiana','Maine','Maryland','Massachusetts',
  // 'Michigan','Minnesota','Mississippi','Missouri','Montana','Nebraska',
  // 'Nevada','New Hampshire','New Jersey','New Mexico','New York','North Carolina',
  // 'North Dakota','Ohio','Oklahoma','Oregon','Pennsylvania','Rhode Island',
  // 'South Carolina','South Dakota','Tennessee','Texas','Utah','Vermont',
  // 'Virginia','Washington','West Virginia','Wisconsin','Wyoming',
];

// Approximate coordinates for common Georgia cities (metro Atlanta +
// majors). Used to match applicants to jobs within a travel radius.
// Keys are lowercased city names. Unknown cities fall back to "show it".
const GA_CITY_COORDS = {
  'atlanta': [33.749, -84.388], 'decatur': [33.775, -84.296], 'lithonia': [33.712, -84.105],
  'stonecrest': [33.69, -84.12], 'conyers': [33.668, -83.998], 'covington': [33.597, -83.860],
  'stone mountain': [33.808, -84.170], 'snellville': [33.857, -84.020], 'lawrenceville': [33.956, -83.988],
  'lilburn': [33.890, -84.143], 'duluth': [34.003, -84.145], 'norcross': [33.941, -84.213],
  'tucker': [33.854, -84.217], 'clarkston': [33.810, -84.239], 'ellenwood': [33.637, -84.264],
  'mcdonough': [33.447, -84.143], 'stockbridge': [33.544, -84.234], 'jonesboro': [33.522, -84.354],
  'riverdale': [33.572, -84.413], 'morrow': [33.583, -84.339], 'forest park': [33.622, -84.369],
  'college park': [33.653, -84.449], 'east point': [33.679, -84.439], 'union city': [33.587, -84.542],
  'marietta': [33.953, -84.549], 'smyrna': [33.884, -84.514], 'kennesaw': [34.023, -84.615],
  'acworth': [34.066, -84.677], 'woodstock': [34.101, -84.519], 'alpharetta': [34.075, -84.294],
  'roswell': [34.023, -84.362], 'sandy springs': [33.924, -84.379], 'dunwoody': [33.946, -84.335],
  'chamblee': [33.892, -84.300], 'doraville': [33.898, -84.281], 'brookhaven': [33.866, -84.337],
  'douglasville': [33.752, -84.748], 'powder springs': [33.859, -84.684], 'austell': [33.813, -84.634],
  'fayetteville': [33.448, -84.455], 'peachtree city': [33.397, -84.596], 'newnan': [33.381, -84.799],
  'loganville': [33.838, -83.901], 'grayson': [33.892, -83.957], 'suwanee': [34.052, -84.071],
  'buford': [34.121, -84.000], 'gainesville': [34.298, -83.824], 'athens': [33.961, -83.378],
  'macon': [32.841, -83.633], 'savannah': [32.084, -81.099], 'augusta': [33.471, -82.010],
  'columbus': [32.461, -84.988], 'albany': [31.578, -84.156], 'valdosta': [30.833, -83.278],
  'warner robins': [32.617, -83.600],
};
function cityFromLocation(loc) {
  // "Lithonia, GA" -> "lithonia"; "Atlanta" -> "atlanta"
  return (loc || '').split(',')[0].trim().toLowerCase();
}
function milesBetween(a, b) {
  if (!a || !b) return null;
  const toRad = d => d * Math.PI / 180;
  const R = 3958.8; // miles
  const dLat = toRad(b[0] - a[0]); const dLon = toRad(b[1] - a[1]);
  const lat1 = toRad(a[0]); const lat2 = toRad(b[0]);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

// Demo jobs shown alongside real centers' postings. All Georgia for now;
// expand the list when we open additional states.
const SAMPLE_JOBS = [
  { id: 1, title: 'Lead Toddler Teacher', center: 'Ahead of the Class Early Learning', verified: true, location: 'Lithonia, GA', state: 'Georgia', type: 'Full Time', pay: '$16 to $19 / hr', posted: '2 days ago', tags: ['CDA Preferred', 'Health Insurance'], description: 'Loving, experienced teacher needed for our toddler classroom.' },
  { id: 2, title: 'Infant Caregiver', center: 'Little Leaders Academy of Arts', verified: true, location: 'Conyers, GA', state: 'Georgia', type: 'Full Time', pay: '$14 to $16 / hr', posted: '3 days ago', tags: ['Entry Level Welcome', 'Training'], description: 'Warm hearted caregiver to join our infant room.' },
  { id: 3, title: 'Preschool Assistant', center: 'Milestones Achievers Academy', verified: true, location: 'Lithonia, GA', state: 'Georgia', type: 'Part Time', pay: '$13 to $15 / hr', posted: '5 days ago', tags: ['Flexible Hours'], description: 'Afternoon shift assistant for our preschool team.' },
  { id: 4, title: 'Center Director', center: 'Sunshine Kids Learning Center', verified: true, location: 'Atlanta, GA', state: 'Georgia', type: 'Full Time', pay: '$48,000 to $58,000 / yr', posted: '1 week ago', tags: ['Director Credential'], description: 'Seeking experienced director with GA Director Credential.' },
  { id: 6, title: 'Lead Infant Teacher', center: 'Tender Hearts Academy', verified: true, location: 'Decatur, GA', state: 'Georgia', type: 'Full Time', pay: '$15 to $18 / hr', posted: '1 day ago', tags: ['CDA Preferred'], description: 'Lead infant teacher needed. CDA or willingness to obtain within 1 year.' },
  { id: 8, title: 'Assistant Teacher (Preschool)', center: 'Bright Futures Childcare', verified: true, location: 'Stone Mountain, GA', state: 'Georgia', type: 'Full Time', pay: '$14 to $17 / hr', posted: '1 day ago', tags: ['CDA Preferred', 'GELDS Trained'], description: 'Support our preschool lead with circle time, art, and family communication.' },
  { id: 9, title: 'After School Care Specialist', center: 'Kidz Klub Atlanta', verified: true, location: 'Atlanta, GA', state: 'Georgia', type: 'Part Time', pay: '$13 to $15 / hr', posted: '4 days ago', tags: ['After School', 'Flexible Schedule'], description: 'Plan engaging activities for K to 5th graders 2pm to 6pm weekdays.' },
];

const STATE_LICENSING = {
  Georgia: { agency: 'Bright from the Start: Georgia DECAL', website: 'decal.ga.gov', requirements: ['Be at least 18 years of age','HS diploma or GED for lead teachers','10 hours preservice training through DECAL','CPR and First Aid within 90 days','Pass Criminal Records Check (CRC)','TB risk assessment','10 hours annual continuing education'], backgroundCheck: { name: 'Georgia Criminal Records Check (CRC)', steps: ['Create an account at the GA CRC portal through DECAL','Submit fingerprints at Cogent or IdentoGO','Receive your CRC determination letter'], link: 'decal.ga.gov' }, contacts: { website: 'www.decal.ga.gov', phone: '1-855-884-7444', email: 'crc@decal.ga.gov', outOfStateEmail: 'outofstate@decal.ga.gov', fax: '404-232-1999' } },
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
  {
    name: 'Konnect Basic',
    tier: 'basic',
    price: 99,
    tagline: 'Start hiring with the essentials',
    monthlyJobLimit: 3,
    features: [
      'Up to 3 job postings per month',
      'Basic applicant management',
      'Email support',
      '7 day free trial',
    ],
    highlight: false,
  },
  {
    name: 'Konnect Pro',
    tier: 'pro',
    price: 149,
    tagline: 'Smarter hiring with verification',
    monthlyJobLimit: 6,
    features: [
      'Up to 6 job postings per month',
      'Background checks included',
      'Professional Readiness Score access',
      'Reliability indicators',
      'Verification badges',
      'Priority email support',
      '7 day free trial',
    ],
    highlight: false,
  },
  {
    name: 'Konnect Premium',
    tier: 'premium',
    price: 200,
    tagline: 'Premium hiring for serious centers',
    monthlyJobLimit: null,
    features: [
      'Unlimited job postings',
      'Unlimited applicants',
      'Premium screening tools',
      'Professional Readiness Scores',
      'Reliability indicators',
      'Verification badges',
      'Trusted Teacher Network access',
      'Priority phone & email support',
      '7 day free trial',
    ],
    highlight: true,
    badge: 'Most Popular',
  },
  {
    name: 'Konnect Elite',
    tier: 'elite',
    price: 400,
    tagline: 'Multi-center owners & franchises',
    monthlyJobLimit: null,
    features: [
      'Everything in Premium',
      'Multi-center management (up to 5 centers)',
      'Trusted Teacher Network access',
      'Advanced filtering & search',
      'Premium visibility tools',
      'Priority support',
      'Unlimited applicants',
      '7 day free trial',
    ],
    highlight: false,
  },
];

// Feature gating by plan tier. Higher tier = more access.
const PLAN_TIER_RANK = { basic: 1, pro: 2, premium: 3, elite: 4 };

function planTierRank(planName) {
  if (!planName) return 0;
  const found = PRICING.find(p => p.name === planName);
  return found ? (PLAN_TIER_RANK[found.tier] || 0) : 0;
}

function hasFeature(planName, feature) {
  const rank = planTierRank(planName);
  switch (feature) {
    case 'readiness_score':
    case 'verification_badges':
    case 'reliability_indicators':
    case 'background_checks':
      return rank >= 2; // Pro and up
    case 'trusted_network':
    case 'unlimited_jobs':
      return rank >= 3; // Premium and up
    case 'multi_center':
    case 'advanced_filtering':
      return rank >= 4; // Elite
    default:
      return rank >= 1;
  }
}

// Hiring stages — DB statuses + display labels. Other DB-valid statuses
// ('reviewed','withdrawn') are accepted but not shown in the picker UI.
const HIRING_STAGES = [
  { value: 'applied', label: 'Applied' },
  { value: 'interviewing', label: 'Interview Scheduled' },
  { value: 'hired', label: 'Hired' },
  { value: 'declined', label: 'Declined' },
];

function hiringStageLabel(value) {
  const found = HIRING_STAGES.find(s => s.value === value);
  return found ? found.label : 'Applied';
}

async function kkUpdateApplicationStatus(appId, newStatus) {
  return supabase.from('applications').update({ status: newStatus }).eq('id', appId);
}

// Fetches aggregate-only stats for a worker (completed shifts, no-shows,
// response rate). Backed by the get_worker_history RPC which is a
// SECURITY DEFINER function that returns ONLY counts — never message
// content or individual application records — so it's safe to expose.
async function kkLoadWorkerHistory(workerId) {
  if (!workerId) return { data: null, error: null };
  const { data, error } = await supabase.rpc('get_worker_history', {
    worker_id_param: workerId,
  });
  if (error || !data || data.length === 0) return { data: null, error };
  const row = data[0];
  const totalReplies = row.total_replies || 0;
  const fastReplies = row.fast_replies || 0;
  const totalReviews = row.total_reviews || 0;
  const positiveReviews = row.positive_reviews || 0;
  return {
    data: {
      completedShifts: row.completed_shifts || 0,
      noShows: row.no_shows || 0,
      totalReplies,
      fastReplies,
      fastResponseRate: totalReplies > 0 ? fastReplies / totalReplies : 0,
      totalReviews,
      positiveReviews,
      avgRating: parseFloat(row.avg_rating) || 0,
      positiveReviewRate: totalReviews > 0 ? positiveReviews / totalReviews : 0,
    },
    error: null,
  };
}

// ===================== ADMIN / SUPER ADMIN =====================
async function kkAdminLoadOverview() {
  const [profiles, jobs, subs, apps, offers] = await Promise.all([
    supabase.from('profiles').select('id, name, email, role, phone, center, business_name, city, state, zip, trusted_network, admin_level, profile_complete, years_experience, bg_check, subscription_plan, category, created_at').order('created_at', { ascending: false }),
    supabase.from('jobs').select('id, title, center, owner_id, location, pay, type, active, posted_at').order('posted_at', { ascending: false }),
    supabase.from('sub_requests').select('id, center_name, shift_date, shift_dates, age_group, pay_rate, status, created_at').order('created_at', { ascending: false }),
    supabase.from('applications').select('id, job_id, worker_id, status, applied_at').order('applied_at', { ascending: false }),
    supabase.from('sub_offers').select('id, sub_request_id, teacher_id, status'),
  ]);
  return {
    profiles: profiles.data || [],
    jobs: jobs.data || [],
    subs: subs.data || [],
    applications: apps.data || [],
    offers: offers.data || [],
  };
}
async function kkAdminSetTrusted(userId, value) {
  return supabase.from('profiles').update({ trusted_network: value }).eq('id', userId);
}
async function kkAdminSetJobActive(jobId, value) {
  return supabase.from('jobs').update({ active: value }).eq('id', jobId);
}
async function kkAdminSetAdminLevel(userId, level) {
  return supabase.from('profiles').update({ admin_level: level, is_super_admin: level === 'super_admin' }).eq('id', userId);
}
async function kkAdminUpdateProfile(userId, fields) {
  return supabase.from('profiles').update(fields).eq('id', userId);
}
async function kkAdminDeleteJob(jobId) {
  return supabase.from('jobs').delete().eq('id', jobId);
}
async function kkAdminUpdateJob(jobId, fields) {
  return supabase.from('jobs').update(fields).eq('id', jobId);
}
async function kkAdminLoadUserThread(userId) {
  const { data } = await supabase.from('admin_messages').select('*').eq('user_id', userId).order('created_at', { ascending: true });
  return data || [];
}
async function kkAdminSendUserMessage(userId, body) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: new Error('Not signed in') };
  return supabase.from('admin_messages').insert({ user_id: userId, sender_id: user.id, is_from_admin: true, body });
}
async function kkAdminCallEdge(fn, payload) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return { error: 'Not signed in' };
  const base = (import.meta.env && import.meta.env.VITE_SUPABASE_URL) || 'https://vennbviwdmcyhcmwdncd.supabase.co';
  const res = await fetch(`${base}/functions/v1/${fn}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, data, error: res.ok ? null : (data.error || 'Request failed') };
}

// User-side support thread (their own messages with admins)
async function kkLoadMySupportThread() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data } = await supabase.from('admin_messages').select('*').eq('user_id', user.id).order('created_at', { ascending: true });
  return data || [];
}
async function kkSendSupportReply(body) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: new Error('Not signed in') };
  return supabase.from('admin_messages').insert({ user_id: user.id, sender_id: user.id, is_from_admin: false, body });
}

async function kkLoadAdminConfig() {
  const { data } = await supabase.from('admin_config').select('admin_allowed_sections').eq('id', 1).maybeSingle();
  return data?.admin_allowed_sections || ['centers','jobs','applications','partners','sub_requests','trusted_teachers','sub_shifts','teachers'];
}
async function kkSaveAdminConfig(sections) {
  return supabase.from('admin_config').update({ admin_allowed_sections: sections, updated_at: new Date().toISOString() }).eq('id', 1);
}

// ===================== SUBSTITUTE STAFFING =====================
function formatShiftDate(s) {
  if (!s) return '';
  try { return new Date(s + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }); }
  catch { return s; }
}
function shiftDatesLabel(req) {
  const list = (req.shift_dates && req.shift_dates.length) ? req.shift_dates : (req.shift_date ? [req.shift_date] : []);
  return list.map(formatShiftDate).join(', ');
}

async function kkCreateSubRequest(payload) {
  return supabase.from('sub_requests').insert(payload).select().single();
}
async function kkLoadOwnerSubRequests(ownerId) {
  const { data } = await supabase
    .from('sub_requests').select('*').eq('owner_id', ownerId)
    .order('created_at', { ascending: false });
  return data || [];
}
async function kkLoadOpenSubRequests() {
  const { data } = await supabase
    .from('sub_requests').select('*').eq('status', 'open')
    .order('shift_date', { ascending: true });
  return data || [];
}
async function kkCreateSubOffer(subRequestId, teacherId) {
  return supabase.from('sub_offers')
    .insert({ sub_request_id: subRequestId, teacher_id: teacherId })
    .select().single();
}
async function kkLoadMyOfferRequestIds(teacherId) {
  const { data } = await supabase.from('sub_offers').select('sub_request_id').eq('teacher_id', teacherId);
  return (data || []).map(o => o.sub_request_id);
}
async function kkLoadOffersForOwnerRequests(requestIds) {
  if (!requestIds || requestIds.length === 0) return {};
  const { data: offers } = await supabase.from('sub_offers').select('*').in('sub_request_id', requestIds);
  const teacherIds = Array.from(new Set((offers || []).map(o => o.teacher_id)));
  let profMap = {};
  if (teacherIds.length) {
    const { data: profs } = await supabase
      .from('profiles')
      .select('id, name, email, phone, photo_url, years_experience, credentials, bg_check, city, sub_availability')
      .in('id', teacherIds);
    profMap = Object.fromEntries((profs || []).map(p => [p.id, p]));
  }
  const grouped = {};
  for (const o of offers || []) {
    if (!grouped[o.sub_request_id]) grouped[o.sub_request_id] = [];
    grouped[o.sub_request_id].push({ ...o, teacher: profMap[o.teacher_id] || null });
  }
  return grouped;
}
async function kkConfirmSubOffer(offerId, subRequestId, teacherId) {
  // Confirm this offer, mark the request filled, decline the rest.
  const { error: e1 } = await supabase.from('sub_offers').update({ status: 'confirmed' }).eq('id', offerId);
  if (e1) return { error: e1 };
  await supabase.from('sub_offers').update({ status: 'declined' }).eq('sub_request_id', subRequestId).neq('id', offerId);
  const { error: e2 } = await supabase.from('sub_requests').update({ status: 'filled', filled_teacher_id: teacherId }).eq('id', subRequestId);
  return { error: e2 };
}

// Fire-and-forget email notification via the send-notification Edge
// Function. Never blocks or throws into the UI — if it fails, the action
// the user took still succeeds; they just don't get the email.
async function kkNotify(payload) {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const base = (import.meta.env && import.meta.env.VITE_SUPABASE_URL) || 'https://vennbviwdmcyhcmwdncd.supabase.co';
    await fetch(`${base}/functions/v1/send-notification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify(payload),
    });
  } catch (_) { /* non-fatal — notifications are best-effort */ }
}

async function kkInsertReview({ applicationId, workerId, ownerId, rating, comment }) {
  return supabase.from('reviews').insert({
    application_id: applicationId,
    worker_id: workerId,
    owner_id: ownerId,
    rating,
    comment: comment || null,
  });
}

async function kkLoadReviewsForWorker(workerId) {
  if (!workerId) return { data: [], error: null };
  const { data, error } = await supabase
    .from('reviews')
    .select('id, application_id, owner_id, rating, comment, created_at')
    .eq('worker_id', workerId)
    .order('created_at', { ascending: false });
  if (error || !data) return { data: [], error };
  const ownerIds = Array.from(new Set(data.map(r => r.owner_id)));
  if (ownerIds.length === 0) return { data, error: null };
  const { data: owners } = await supabase
    .from('profiles')
    .select('id, name, business_name, center')
    .in('id', ownerIds);
  const ownerMap = Object.fromEntries((owners || []).map(o => [o.id, o]));
  return {
    data: data.map(r => ({
      ...r,
      ownerName: (ownerMap[r.owner_id] && (ownerMap[r.owner_id].business_name || ownerMap[r.owner_id].center || ownerMap[r.owner_id].name)) || 'A center',
    })),
    error: null,
  };
}

async function kkUpdateApplicationOutcome(appId, outcome) {
  return supabase.from('applications').update({ worker_outcome: outcome }).eq('id', appId);
}

// Count of jobs this owner has posted since the start of the current month
// (UTC). Used to enforce the plan's monthlyJobLimit.
async function kkGetCurrentMonthJobCount(ownerId) {
  if (!ownerId) return 0;
  const now = new Date();
  const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString();
  const { count } = await supabase
    .from('jobs')
    .select('id', { count: 'exact', head: true })
    .eq('owner_id', ownerId)
    .gte('posted_at', monthStart);
  return count || 0;
}

async function kkLoadSavedCandidates(ownerId) {
  const { data, error } = await supabase
    .from('saved_candidates')
    .select('worker_id')
    .eq('owner_id', ownerId)
    .order('created_at', { ascending: false });
  return { data: (data || []).map(r => r.worker_id), error };
}

async function kkToggleSaveCandidate(ownerId, workerId, currentlySaved) {
  if (currentlySaved) {
    return supabase
      .from('saved_candidates')
      .delete()
      .eq('owner_id', ownerId)
      .eq('worker_id', workerId);
  }
  return supabase
    .from('saved_candidates')
    .insert({ owner_id: ownerId, worker_id: workerId });
}

// ============================================================
// Professional Readiness Score
// ============================================================
// Components that work today (computed from profile data):
//   - Complete Profile (+10)
//   - Portable Background Check (+20)
//   - CPR Certification (+15)
//   - CDA / Credentials (+15)
//   - No No-Shows (+5, default — presumed good for new users)
// Components that require future tracking systems (default to 0 for now):
//   - Fast Response Time (+10)  → needs message-response tracking
//   - Positive Employer Reviews (+15)  → needs review system
//   - Completed Shifts / Jobs (+10)  → needs shift-completion tracking
// As those systems come online they slot directly into this function.
function calculateReadinessScore(profile, history = {}) {
  if (!profile) return { total: 0, breakdown: [], badges: [] };
  const completeFields = ['city', 'state', 'bio', 'education', 'availability'];
  const filledCount = completeFields.filter(k => (profile[k] || '').toString().trim().length > 0).length;
  const hasPositions = (profile.positions || []).length > 0;
  const hasAgeGroups = (profile.ageGroups || []).length > 0;
  const profileComplete = filledCount === completeFields.length && hasPositions && hasAgeGroups;

  // Background Check — tiered: Portable (20) > Cleared/current (15) >
  // In progress (8) > None (0).
  const bg = (profile.bgCheck || '').toLowerCase();
  const portableBg = bg.includes('portable');
  const clearedBg = bg.includes('cleared') || bg.includes('current') || bg.includes('complete');
  const inProgressBg = bg.includes('progress') || bg.includes('pending');
  const bgScore = portableBg ? 20 : clearedBg ? 15 : inProgressBg ? 8 : 0;

  const creds = (profile.credentials || []).map(s => s.toLowerCase());
  const credFiles = (profile.credentialFiles || []).map(s => s.toLowerCase());
  const hasCpr = creds.some(s => s.includes('cpr')) || credFiles.some(s => s.includes('cpr'));
  const hasCda = creds.some(s => s.includes('cda')) || credFiles.some(s => s.includes('cda'));

  // Education level — broken into degree tiers.
  const edu = (profile.education || '').toLowerCase();
  const eduScore = (edu.includes('bachelor') || edu.includes('master') || edu.includes('doctora'))
    ? 18 : edu.includes('associate') ? 12 : edu.includes('some college') ? 6 : 0;

  // Professional references — partial credit for 1 or 2, full at 3.
  const refCount = (profile.references || []).length;
  const refsScore = refCount >= 3 ? 7 : refCount === 2 ? 5 : refCount === 1 ? 2 : 0;

  // Training certificates — partial credit, full at 3+.
  const certCount = (profile.trainingCertificates || []).length;
  const certsScore = certCount >= 3 ? 15 : certCount === 2 ? 10 : certCount === 1 ? 5 : 0;

  const breakdown = [
    { label: 'Complete Profile', earned: profileComplete ? 10 : 0, max: 10, achieved: profileComplete, tip: 'Fill in your city, state, bio, education, availability, positions, and age groups.' },
    { label: 'Background Check', earned: bgScore, max: 20, achieved: portableBg || clearedBg, tip: 'A portable background check earns full points and lets you start work right away. None = 0, In progress = 8, Cleared/current = 15, Portable = 20.' },
    { label: 'CPR & First Aid Certification', earned: hasCpr ? 15 : 0, max: 15, achieved: hasCpr, tip: 'Upload your current CPR & First Aid card.' },
    { label: 'CDA Credential', earned: hasCda ? 15 : 0, max: 15, achieved: hasCda, tip: 'Upload your Child Development Associate (CDA) credential.' },
    { label: 'Education Level', earned: eduScore, max: 18, achieved: eduScore >= 12, tip: 'Some College = 6, Associate degree = 12, Bachelor degree or higher = 18.' },
    { label: 'Professional References', earned: refsScore, max: 7, achieved: refsScore === 7, tip: 'Add references centers can contact. 1 = 2 pts, 2 = 5 pts, 3 = 7 pts.' },
    { label: 'Training Certificates', earned: certsScore, max: 15, achieved: certsScore === 15, tip: 'Upload training certificates (GELDS, preservice, CEUs). 1 = 5 pts, 2 = 10 pts, 3+ = 15 pts.' },
  ];
  const total = breakdown.reduce((s, b) => s + b.earned, 0);

  const badges = [];
  if (portableBg) badges.push({ key: 'portable_bg', label: 'Portable Background Check', icon: 'shield' });
  if (hasCpr) badges.push({ key: 'cpr', label: 'CPR Certified', icon: 'heart' });
  if (hasCda) badges.push({ key: 'cda', label: 'CDA Verified', icon: 'verified' });
  if (total >= 75) badges.push({ key: 'ready', label: 'Ready to Work', icon: 'check' });
  if (total >= 90) badges.push({ key: 'high_reliability', label: 'High Reliability', icon: 'star' });

  return { total, breakdown, badges, profileComplete };
}

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

// Account helpers — backed by Supabase Auth + a `profiles` table that mirrors
// auth.users with the app-specific fields (name, phone, role, state, center).
// A Postgres trigger on auth.users inserts the matching profiles row on signup,
// so we never have to write directly to the table from the client.
async function kkSupabaseSignUp({ email, password, role, name, phone, state, center, businessName, category }) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name: name || '',
        phone: phone || '',
        role,
        state: state || '',
        center: center || '',
        business_name: businessName || '',
        category: category || '',
      },
    },
  });
  return { data, error };
}

async function kkSupabaseVerifyEmail({ email, token }) {
  // After signUp, Supabase sends an email containing a 6-digit token (and
  // a magic link). Either confirms the user; we use the token for parity
  // with the existing UX.
  return supabase.auth.verifyOtp({ email, token, type: 'email' });
}

async function kkSupabaseLogin({ email, password }) {
  return supabase.auth.signInWithPassword({ email, password });
}

async function kkSupabaseRequestPasswordReset(email) {
  return supabase.auth.resetPasswordForEmail(email);
}

async function kkSupabaseVerifyRecovery({ email, token }) {
  return supabase.auth.verifyOtp({ email, token, type: 'recovery' });
}

async function kkSupabaseUpdatePassword(password) {
  return supabase.auth.updateUser({ password });
}

async function kkLoadProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();
  return { data, error };
}

// --- Jobs and applications -------------------------------------------------

async function kkLoadActiveJobs() {
  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('active', true)
    .order('posted_at', { ascending: false });
  return { data: data || [], error };
}

async function kkLoadOwnerJobs(ownerId) {
  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('owner_id', ownerId)
    .order('posted_at', { ascending: false });
  return { data: data || [], error };
}

async function kkLoadWorkerApplications(workerId) {
  const { data, error } = await supabase
    .from('applications')
    .select('job_id')
    .eq('worker_id', workerId);
  return { data: data || [], error };
}

async function kkLoadApplicantsForJobs(jobIds) {
  if (!jobIds || jobIds.length === 0) return { data: {}, error: null };
  const { data: apps, error: appsErr } = await supabase
    .from('applications')
    .select('id, job_id, worker_id, status, applied_at')
    .in('job_id', jobIds)
    .order('applied_at', { ascending: false });
  if (appsErr) return { data: {}, error: appsErr };
  const workerIds = Array.from(new Set((apps || []).map(a => a.worker_id)));
  let byWorker = {};
  if (workerIds.length > 0) {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('*')
      .in('id', workerIds);
    byWorker = Object.fromEntries((profiles || []).map(p => [p.id, p]));
  }
  const grouped = {};
  for (const a of (apps || [])) {
    if (!grouped[a.job_id]) grouped[a.job_id] = [];
    const p = byWorker[a.worker_id];
    if (!p) continue;
    grouped[a.job_id].push({
      appId: a.id,
      status: a.status || 'applied',
      userId: a.worker_id,
      name: p.name || 'Applicant',
      email: p.email || '',
      phone: p.phone || '',
      photo: p.photo_url || '',
      city: p.city || '',
      state: p.state || '',
      zip: p.zip || '',
      years: p.years_experience || '',
      ageGroups: p.age_groups || [],
      education: p.education || '',
      credentials: p.credentials || [],
      bgCheck: p.bg_check || '',
      availability: p.availability || '',
      positions: p.positions || [],
      bio: p.bio || '',
      resume: p.resume_filename || '',
      resumeUrl: p.resume_url || '',
      credentialFiles: p.credential_filenames || [],
      credentialUrls: p.credential_urls || [],
      references: p.professional_references || [],
      trainingCertificates: p.training_certificates || [],
      appliedDate: formatRelativeTime(a.applied_at),
    });
  }
  return { data: grouped, error: null };
}

function formatRelativeTime(ts) {
  const d = new Date(ts);
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} min${mins === 1 ? '' : 's'} ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs === 1 ? '' : 's'} ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days} day${days === 1 ? '' : 's'} ago`;
  return d.toLocaleDateString();
}

function jobRowToUiJob(row) {
  return {
    id: row.id,
    title: row.title,
    center: row.center,
    location: row.location || '',
    state: row.state || '',
    type: row.type || 'Full Time',
    pay: row.pay || '',
    posted: formatRelativeTime(row.posted_at),
    tags: row.tags || [],
    description: row.description || '',
    verified: !!row.verified,
    ownerId: row.owner_id,
    isReal: true,
  };
}

// Map app-state profile shape -> profiles table columns
function profileStateToRow(profile) {
  return {
    city: profile.city || null,
    state: profile.state || null,
    zip: profile.zip || null,
    years_experience: profile.years || null,
    age_groups: profile.ageGroups || [],
    education: profile.education || null,
    credentials: profile.credentials || [],
    bg_check: profile.bgCheck || null,
    availability: profile.availability || null,
    positions: profile.positions || [],
    bio: profile.bio || null,
    resume_filename: profile.resume || null,
    resume_url: profile.resumeUrl || null,
    credential_filenames: profile.credentialFiles || [],
    credential_urls: profile.credentialUrls || [],
    photo_url: profile.photo || null,
    professional_references: profile.references || [],
    training_certificates: profile.trainingCertificates || [],
    // (identity_status / identity_doc_url removed — feature deprecated.
    // See REMOVED-CODE comments in the React component for full removal.)
  };
}

// Map profiles table row -> app-state profile shape
function rowToProfileState(row, fallbackState) {
  if (!row) return null;
  return {
    photo: row.photo_url || '',
    city: row.city || '',
    state: row.state || fallbackState || 'Georgia',
    zip: row.zip || '',
    years: row.years_experience || '',
    ageGroups: row.age_groups || [],
    education: row.education || '',
    credentials: row.credentials || [],
    bgCheck: row.bg_check || '',
    availability: row.availability || '',
    positions: row.positions || [],
    bio: row.bio || '',
    resume: row.resume_filename || '',
    resumeUrl: row.resume_url || '',
    credentialFiles: row.credential_filenames || [],
    credentialUrls: row.credential_urls || [],
    references: row.professional_references || [],
    trainingCertificates: row.training_certificates || [],
  };
}

// =============================================================
// Messaging — conversations + messages live in Supabase. The UI
// state shape is preserved (participants array, messages array,
// unreadFor email list) so the existing message UI keeps working.
// =============================================================
async function kkLoadConversationsForUser(userId) {
  if (!userId) return { data: [], error: null };
  const { data: convs, error } = await supabase
    .from('conversations')
    .select('*')
    .or(`worker_id.eq.${userId},owner_id.eq.${userId}`)
    .order('last_message_at', { ascending: false });
  if (error) return { data: [], error };
  if (!convs || convs.length === 0) return { data: [], error: null };

  const convIds = convs.map(c => c.id);
  const [{ data: msgs }, { data: profiles }] = await Promise.all([
    supabase
      .from('messages')
      .select('*')
      .in('conversation_id', convIds)
      .order('created_at', { ascending: true }),
    supabase
      .from('profiles')
      .select('id, email, name, photo_url, center, business_name')
      .in('id', Array.from(new Set(convs.flatMap(c => [c.worker_id, c.owner_id])))),
  ]);

  const profMap = Object.fromEntries((profiles || []).map(p => [p.id, p]));
  const msgsByConv = {};
  for (const m of msgs || []) {
    if (!msgsByConv[m.conversation_id]) msgsByConv[m.conversation_id] = [];
    msgsByConv[m.conversation_id].push(m);
  }

  const uiConvs = convs.map(c => {
    const w = profMap[c.worker_id] || { email: '', name: 'Worker', photo_url: '' };
    const o = profMap[c.owner_id] || { email: '', name: 'Owner', photo_url: '' };
    return {
      id: c.id,
      key: c.id, // use the real DB id as the key
      jobTitle: c.job_title || '',
      jobId: c.job_id || null,
      workerId: c.worker_id,
      ownerId: c.owner_id,
      participants: [
        { email: w.email || '', name: w.name || 'Worker', role: 'worker', photo: w.photo_url || '', center: '' },
        { email: o.email || '', name: o.center || o.business_name || o.name || 'Center', role: 'owner', photo: o.photo_url || '', center: o.center || o.business_name || '' },
      ],
      messages: (msgsByConv[c.id] || []).map(m => ({
        from: m.sender_id === c.worker_id ? (w.email || 'worker') : (o.email || 'owner'),
        text: m.body,
        time: m.created_at,
        system: !!m.is_system,
      })),
      lastUpdated: c.last_message_at,
      unreadFor: [
        c.unread_for_worker && w.email ? w.email : null,
        c.unread_for_owner && o.email ? o.email : null,
      ].filter(Boolean),
    };
  });
  return { data: uiConvs, error: null };
}

async function kkGetOrCreateConversation({ workerId, ownerId, jobId, jobTitle }) {
  let query = supabase
    .from('conversations')
    .select('*')
    .eq('worker_id', workerId)
    .eq('owner_id', ownerId);
  if (jobTitle) query = query.eq('job_title', jobTitle);
  const { data: found } = await query.maybeSingle();
  if (found) return { data: found, error: null };
  return supabase
    .from('conversations')
    .insert({
      worker_id: workerId,
      owner_id: ownerId,
      job_id: jobId || null,
      job_title: jobTitle || null,
    })
    .select()
    .single();
}

async function kkSendMessage({ conversationId, body, isSystem = false }) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: new Error('You must be signed in.') };
  return supabase.from('messages').insert({
    conversation_id: conversationId,
    sender_id: user.id,
    body,
    is_system: isSystem,
  });
}

async function kkMarkConversationRead({ conversationId, userId }) {
  // Figure out which side I am, then clear my unread flag.
  const { data: conv } = await supabase
    .from('conversations')
    .select('worker_id, owner_id')
    .eq('id', conversationId)
    .maybeSingle();
  if (!conv) return { error: null };
  const update = {};
  if (conv.worker_id === userId) update.unread_for_worker = false;
  if (conv.owner_id === userId) update.unread_for_owner = false;
  if (Object.keys(update).length === 0) return { error: null };
  return supabase.from('conversations').update(update).eq('id', conversationId);
}

function mapSupabaseError(err, fallback) {
  if (!err) return fallback || 'Something went wrong. Please try again.';
  const msg = (err.message || '').toLowerCase();
  if (msg.includes('invalid login')) return "That email and password combination doesn't match an account.";
  if (msg.includes('email not confirmed')) return 'Please verify your email — check your inbox for the code we sent.';
  if (msg.includes('user already registered')) return 'An account already exists for this email. Try logging in instead.';
  if (msg.includes('rate limit')) return 'Too many attempts — please wait a moment and try again.';
  if (msg.includes('token has expired') || msg.includes('invalid token')) return "That code didn't match or has expired. Request a new one and try again.";
  if (msg.includes('password should be at least')) return 'Password must be at least 6 characters.';
  return err.message || fallback || 'Something went wrong. Please try again.';
}

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
  const [nearbyOnly, setNearbyOnly] = useState(false);
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
  const [savedCandidateIds, setSavedCandidateIds] = useState([]);
  const [applicantStageFilter, setApplicantStageFilter] = useState('all');
  const [showSavedCandidates, setShowSavedCandidates] = useState(false);
  const [savedCandidatesFull, setSavedCandidatesFull] = useState([]);
  const [showTrustedNetwork, setShowTrustedNetwork] = useState(false);
  const [trustedNetworkFull, setTrustedNetworkFull] = useState([]);
  // The tab a guest tapped before signing up — drives the friendly
  // sign-up explainer modal. Null when no gate is open.
  const [gatedTab, setGatedTab] = useState(null);
  const [viewingApplicantHistory, setViewingApplicantHistory] = useState(null);
  const [viewingApplicantReviews, setViewingApplicantReviews] = useState([]);
  const [myWorkerHistory, setMyWorkerHistory] = useState(null);
  const [myWorkerReviews, setMyWorkerReviews] = useState([]);
  const [monthlyJobCount, setMonthlyJobCount] = useState(0);
  // Center (owner) profile fields beyond the basics already in `signup`.
  const [centerProfile, setCenterProfile] = useState({ address: '', qualityRated: false, qualityRatedStars: 0, hours: '' });
  // Substitute staffing
  const [ownerSubRequests, setOwnerSubRequests] = useState([]);
  const [openSubRequests, setOpenSubRequests] = useState([]);
  const [subOffersByRequest, setSubOffersByRequest] = useState({});
  const [myOfferRequestIds, setMyOfferRequestIds] = useState([]);
  const [availableForSub, setAvailableForSub] = useState(false);
  const [subSchedule, setSubSchedule] = useState({ days: [], from: '', until: '', note: '' });
  // Admin / Super admin
  const [adminLevel, setAdminLevel] = useState('none'); // none | admin | super_admin
  const [adminData, setAdminData] = useState(null);
  const [adminUserSearch, setAdminUserSearch] = useState('');
  const [adminSection, setAdminSection] = useState(null); // null = dashboard; else a section key
  const [adminAllowedSections, setAdminAllowedSections] = useState(['centers','jobs','applications','partners','sub_requests','trusted_teachers','sub_shifts','teachers']);
  const [showRolePerms, setShowRolePerms] = useState(false);
  const [impersonatingRole, setImpersonatingRole] = useState(null);
  const realUserTypeRef = useRef(null);
  // Admin detail panels
  const [adminViewUser, setAdminViewUser] = useState(null);   // user row being managed
  const [adminUserEdit, setAdminUserEdit] = useState(null);   // editable copy of fields
  const [adminUserThread, setAdminUserThread] = useState([]); // support messages with this user
  const [adminMsgDraft, setAdminMsgDraft] = useState('');
  const [adminViewJob, setAdminViewJob] = useState(null);
  const [adminJobEdit, setAdminJobEdit] = useState(null);
  // Worker-side support thread
  const [supportThread, setSupportThread] = useState([]);
  const [supportDraft, setSupportDraft] = useState('');
  const isSuperAdmin = adminLevel === 'super_admin';
  const isAdmin = adminLevel === 'admin' || adminLevel === 'super_admin';
  const [showSubRequest, setShowSubRequest] = useState(false);
  const [editingSubId, setEditingSubId] = useState(null);
  const [subForm, setSubForm] = useState({ dates: [], dateInput: '', start_time: '', end_time: '', age_group: 'Toddler', pay_rate: '', location: '', notes: '' });
  const [showLeaveReview, setShowLeaveReview] = useState(false);
  const [reviewDraft, setReviewDraft] = useState({ rating: 5, comment: '' });
  const [reviewError, setReviewError] = useState('');
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
  const [policyAcceptance, setPolicyAcceptance] = useState({ privacy: null, terms: null });
  const [policyForm, setPolicyForm] = useState({ name: '', title: '', business: '' });
  const [policyError, setPolicyError] = useState('');
  const [realJobs, setRealJobs] = useState([]); // Active jobs posted to Supabase by real owners

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
      // 1) Resolve the real Supabase session first. If the user has a live
      // session, we hydrate from their profile row, not from localStorage.
      const { data: { session } } = await supabase.auth.getSession();
      if (session && session.user) {
        const { data: profileRow } = await kkLoadProfile(session.user.id);
        const role = profileRow?.role || session.user.user_metadata?.role || 'worker';
        const email = session.user.email || '';
        setSignedIn(true);
        setUserType(role);
        setIsPartner(role === 'partner');
        setSignup({
          name: profileRow?.name || session.user.user_metadata?.name || '',
          email,
          phone: profileRow?.phone || session.user.user_metadata?.phone || '',
          state: profileRow?.state || session.user.user_metadata?.state || 'Georgia',
          center: profileRow?.center || profileRow?.business_name || session.user.user_metadata?.center || '',
          password: '',
        });
        if (role === 'worker') {
          const remote = rowToProfileState(profileRow, profileRow?.state);
          if (remote) {
            setProfile(remote);
            setProfileComplete(!!profileRow?.profile_complete);
          } else {
            // Fall back to localStorage cache from earlier sessions
            const savedProfile = await STORE.get(`kk_profile_${email}`);
            if (savedProfile) {
              setProfile(savedProfile);
              setProfileComplete(true);
            }
          }
        }
        if (role === 'owner') {
          const { data: ownerJobs } = await kkLoadOwnerJobs(session.user.id);
          const uiJobs = (ownerJobs || []).map(jobRowToUiJob);
          if (uiJobs.length > 0) {
            setPosted(uiJobs);
            const { data: applicantsByJob } = await kkLoadApplicantsForJobs(uiJobs.map(j => j.id));
            setJobApplicants(applicantsByJob || {});
          } else {
            // Fall back to legacy localStorage data if any
            const ownerData = await STORE.get(`kk_owner_${email}`);
            if (ownerData) {
              setPosted(ownerData.posted || []);
              setJobApplicants(ownerData.jobApplicants || {});
            }
          }
          // Prefer the Stripe-backed subscription_plan column. Fall back to
          // the legacy localStorage cache for users from before Stripe wiring.
          if (profileRow?.subscription_plan && profileRow?.subscription_status &&
              ['trialing', 'active'].includes(profileRow.subscription_status)) {
            setPlan(profileRow.subscription_plan);
          } else {
            const legacyPlan = await STORE.get(`kk_owner_${email}`);
            if (legacyPlan && legacyPlan.plan) setPlan(legacyPlan.plan);
          }
        }
        if (role === 'worker') {
          const { data: apps } = await kkLoadWorkerApplications(session.user.id);
          if (apps && apps.length > 0) {
            setApplied(apps.map(a => a.job_id));
          }
        }
        // Load conversations for the signed-in user (works for any role).
        {
          const { data: convs } = await kkLoadConversationsForUser(session.user.id);
          if (convs) setConversations(convs);
        }
        if (role === 'owner') {
          const { data: saved } = await kkLoadSavedCandidates(session.user.id);
          if (saved) setSavedCandidateIds(saved);
        }
        setView('app');
      } else {
        // No live session — fall back to the legacy localStorage hints just
        // so existing remembered signups keep working until they re-log in.
        const auth = await STORE.get('kk_auth');
        if (auth) {
          setUserType(auth.userType || null);
          setProfileComplete(auth.profileComplete || false);
          setPlan(auth.plan || null);
        }
      }
      const sign = await STORE.get('kk_signup');
      if (sign) setSignup(prev => prev.email ? prev : sign);
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
      const banner = await STORE.get('kk_guestBannerDismissed');
      if (banner) setGuestBannerDismissed(true);
      const policy = await STORE.get('kk_policyAcceptance');
      if (policy) setPolicyAcceptance(policy);
      // Active jobs from Supabase are visible to everyone, including guests.
      const { data: activeJobs } = await kkLoadActiveJobs();
      setRealJobs((activeJobs || []).map(jobRowToUiJob));
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

  // Debounced sync of worker profile fields to Supabase so the data
  // follows the user across devices. Only fires for workers with a live
  // session — owners and partners don't have these fields populated.
  useEffect(() => {
    if (!appLoaded || !signedIn || userType !== 'worker' || impersonatingRole) return;
    const handle = setTimeout(async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const row = profileStateToRow(profile);
      await supabase.from('profiles').update(row).eq('id', user.id);
    }, 800);
    return () => clearTimeout(handle);
  }, [profile, appLoaded, signedIn, userType, impersonatingRole]);

  useEffect(() => {
    if (appLoaded) STORE.set('kk_signup', signup);
  }, [signup, appLoaded]);

  // Save owner's posted jobs and applicants per email
  useEffect(() => {
    if (appLoaded && signedIn && signup.email && userType === 'owner') {
      STORE.set(`kk_owner_${signup.email}`, { posted, jobApplicants, plan });
    }
  }, [posted, jobApplicants, plan, appLoaded, signedIn, signup.email, userType]);

  // After a guest picks a plan + signs up + verifies email, they land on
  // the pricing view. If kk_pending_plan is set, auto-launch Stripe
  // Checkout for that plan so the chosen-from-the-welcome-page flow feels
  // continuous. Lives at the top level so React's hook order stays
  // consistent across view changes.
  useEffect(() => {
    if (view !== 'pricing' || !signedIn || userType !== 'owner' || plan) return;
    let canceled = false;
    (async () => {
      const pending = await STORE.get('kk_pending_plan');
      if (canceled || !pending) return;
      const priceId = STRIPE_PRICE_IDS[pending];
      if (!priceId) {
        // Price IDs not configured yet — leave them on the pricing page
        // so they can click manually once env vars are in place.
        await STORE.set('kk_pending_plan', null);
        return;
      }
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;
        await STORE.set('kk_pending_plan', null);
        const baseUrl = window.location.origin;
        const res = await fetch(
          `${(import.meta.env && import.meta.env.VITE_SUPABASE_URL) || 'https://vennbviwdmcyhcmwdncd.supabase.co'}/functions/v1/create-checkout-session`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({
              planName: pending,
              priceId,
              successUrl: `${baseUrl}/?subscription=success`,
              cancelUrl: `${baseUrl}/?subscription=canceled`,
            }),
          }
        );
        const data = await res.json();
        if (res.ok && data.url) window.location.href = data.url;
      } catch (_) { /* swallow — they can click the button manually */ }
    })();
    return () => { canceled = true; };
  }, [view, signedIn, userType, plan]);

  // After returning from Stripe Checkout, refresh the profile so the
  // new subscription_plan / subscription_status shows up immediately
  // (rather than waiting for the next page load).
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const url = new URL(window.location.href);
    const subStatus = url.searchParams.get('subscription');
    if (!subStatus) return;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: row } = await kkLoadProfile(user.id);
        if (row && row.subscription_plan && ['trialing', 'active'].includes(row.subscription_status)) {
          setPlan(row.subscription_plan);
        }
      }
      if (subStatus === 'success') {
        alert("You're all set! Your 7-day free trial has started. You won't be charged until the trial ends — and you can cancel anytime.");
      } else if (subStatus === 'canceled') {
        alert("Checkout canceled. No charges were made. You can start your trial anytime from the Pricing page.");
      }
      // Clear the query param from the URL so the alert doesn't fire twice on refresh
      url.searchParams.delete('subscription');
      window.history.replaceState({}, '', url.toString());
    })();
  }, []);

  // Real-time updates: open a websocket so new messages and sub-shift
  // activity appear instantly without a page refresh. RLS still applies,
  // so each user only receives changes they're allowed to see.
  useEffect(() => {
    if (!signedIn) return;
    const channel = supabase
      .channel('kkk-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, () => {
        reloadConversations();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'conversations' }, () => {
        reloadConversations();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sub_requests' }, () => {
        if (userType === 'owner' || userType === 'worker') reloadSubData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sub_offers' }, () => {
        if (userType === 'owner') reloadSubData();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [signedIn, userType]);

  // Brand context for the Crisp chat widget (business name, support
  // email, support phone). Runs once on mount so every visitor — signed
  // in or not — sees consistent contact info. The values come from
  // src/config.js so changing the phone there updates everywhere.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const push = (args) => { (window.$crisp = window.$crisp || []).push(args); };
    push(['set', 'session:data', [[
      ['business_name', 'Rellim Kid Kare Konnect'],
      ['support_email', 'info@kidkarekonnect.com'],
      ['support_phone', SUPPORT_PHONE],
    ]]]);
  }, []);

  // Pass signed-in user info to the Crisp live chat widget so support
  // agents see who they're talking to. No-op until Crisp's script loads.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!signedIn || !signup.email) return;
    const push = (args) => { (window.$crisp = window.$crisp || []).push(args); };
    push(['set', 'user:email', [signup.email]]);
    if (signup.name) push(['set', 'user:nickname', [signup.name]]);
    if (signup.phone) push(['set', 'user:phone', [signup.phone]]);
    const segments = [];
    if (userType) segments.push(['role', userType]);
    if (plan) segments.push(['plan', plan]);
    if (signup.center) segments.push(['center', signup.center]);
    if (segments.length) push(['set', 'session:data', [segments]]);
  }, [signedIn, signup.email, signup.name, signup.phone, signup.center, userType, plan]);

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

  const tryApply = async (job) => {
    if (!signedIn || !profileComplete) { setAuthPromptJob(job); return; }
    if (applied.includes(job.id)) return;
    // Real jobs from Supabase have UUID ids; sample jobs have integers.
    const isReal = job.isReal === true || typeof job.id === 'string';
    if (isReal) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setAuthPromptJob(job); return; }
      const { data: inserted, error } = await supabase
        .from('applications')
        .insert({ job_id: job.id, worker_id: user.id })
        .select('id')
        .single();
      if (error) {
        alert(`Could not submit your application: ${error.message}`);
        return;
      }
      // Email the owner that they have a new applicant.
      if (inserted?.id) kkNotify({ type: 'new_application', applicationId: inserted.id });
    }
    const nextApplied = [...applied, job.id];
    const snap = { name: signup.name || 'You', email: signup.email, phone: signup.phone, photo: profile.photo, ...profile, appliedDate: 'Just now' };
    const nextApps = { ...jobApplicants, [job.id]: [...(jobApplicants[job.id] || []), snap] };
    setApplied(nextApplied);
    setJobApplicants(nextApps);
    saveJobs(nextApplied, saved, posted, nextApps);

    // Auto-create a Supabase conversation with the real owner (if this
    // is a real job). Sample jobs have no real owner so we skip that case.
    if (isReal && job.ownerId) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: conv } = await kkGetOrCreateConversation({
          workerId: user.id,
          ownerId: job.ownerId,
          jobId: typeof job.id === 'string' ? job.id : null,
          jobTitle: job.title,
        });
        if (conv) {
          await kkSendMessage({
            conversationId: conv.id,
            body: `Hi! I just applied to your ${job.title} position. Looking forward to hearing from you.`,
          });
          await reloadConversations();
        }
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
    const { data, error } = await kkSupabaseSignUp({
      email: signup.email,
      password: signup.password,
      role: userType,
      name: signup.name,
      phone: signup.phone,
      state: signup.state,
      center: signup.center || '',
    });
    if (error) {
      setSignupError(mapSupabaseError(error));
      return;
    }
    // If Supabase returned a session already (email confirmation is OFF in
    // the project settings), skip the verify-email screen and route straight.
    if (data && data.session) {
      setSignedIn(true);
      await STORE.set('kk_signup', signup);
      if (userType === 'owner') {
        if (!plan) setView('pricing'); else setView('app');
      } else {
        setProfile({ ...profile, state: signup.state });
        setView('profile');
      }
      return;
    }
    setEnteredCode('');
    setCodeError('');
    setView('verifyEmail');
  };

  const handleVerifyEmail = async () => {
    setCodeError('');
    if (enteredCode.length < 6) {
      setCodeError('Enter the verification code from your email.');
      return;
    }
    const { error } = await kkSupabaseVerifyEmail({ email: signup.email, token: enteredCode });
    if (error) {
      setCodeError(mapSupabaseError(error));
      return;
    }
    // verifyOtp on success establishes a session. onAuthStateChange will
    // mirror that into local state, but go ahead and route now for snappier UX.
    setSignedIn(true);
    await STORE.set('kk_signup', signup);
    if (userType === 'partner') {
      setView('app');
      setTab('partners');
      setShowListBiz(true);
    } else if (userType === 'owner') {
      if (!plan) setView('pricing'); else setView('app');
    } else {
      setProfile({ ...profile, state: signup.state });
      setView('profile');
    }
  };

  const resendCode = async () => {
    setCodeError('');
    const { error } = await supabase.auth.resend({ type: 'signup', email: signup.email });
    if (error) {
      setCodeError(mapSupabaseError(error));
      return;
    }
    setEnteredCode('');
  };

  const completeProfile = async () => {
    setProfileComplete(true);
    setStateSel(profile.state);
    await STORE.set('kk_auth', { signedIn: true, userType, profileComplete: true, plan });
    // Mark the profile as complete in Supabase so we can route directly to
    // the app next time this user signs in (from any device).
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('profiles')
          .update({ ...profileStateToRow(profile), profile_complete: true })
          .eq('id', user.id);
      }
    } catch (_) { /* non-fatal */ }
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

  const handlePost = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert('Please sign in again to post a job.');
      return;
    }
    // Enforce monthly posting limit per plan. Premium and Elite plans
    // have monthlyJobLimit=null which we treat as unlimited.
    const planDetails = PRICING.find(p => p.name === plan);
    const limit = planDetails ? planDetails.monthlyJobLimit : null;
    if (limit !== null && limit !== undefined) {
      const currentCount = await kkGetCurrentMonthJobCount(user.id);
      if (currentCount >= limit) {
        if (window.confirm(`You've used all ${limit} job posts on the ${plan} plan this month. Upgrade to Premium or Elite for unlimited posting?`)) {
          setShowPost(false);
          setView('pricing');
        }
        return;
      }
    }
    const payload = {
      owner_id: user.id,
      title: newJob.title,
      center: signup.center || 'Your Center',
      location: newJob.location,
      state: signup.state || 'Georgia',
      type: newJob.type,
      pay: newJob.pay,
      description: newJob.description,
      tags: ['New Posting'],
      verified: true,
      active: true,
    };
    const { data: row, error } = await supabase.from('jobs').insert(payload).select().single();
    if (error || !row) {
      alert(`Could not post the job: ${error?.message || 'unknown error'}`);
      return;
    }
    const uiJob = jobRowToUiJob(row);
    setPosted([uiJob, ...posted]);
    setJobApplicants({ ...jobApplicants });
    setMonthlyJobCount(c => c + 1);
    // Also surface this new job in the public browse list immediately
    setRealJobs([uiJob, ...realJobs]);
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

  // ============================================================
  // File uploads — real files go to Supabase Storage (bucket: user-files)
  // organized under {auth.uid()}/photo.jpg, /resume.pdf, /credentials/*.
  // The public URL is stored in profile state so it works across devices.
  // ============================================================
  const [uploading, setUploading] = useState({ photo: false, resume: false, cred: false });

  async function uploadToStorage(path, blob, contentType) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('You must be signed in to upload files.');
    const fullPath = `${user.id}/${path}`;
    const { error } = await supabase.storage
      .from('user-files')
      .upload(fullPath, blob, { contentType, upsert: true });
    if (error) throw error;
    const { data } = supabase.storage.from('user-files').getPublicUrl(fullPath);
    return data.publicUrl;
  }

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { alert('Photo must be under 5MB'); return; }
    setUploading(u => ({ ...u, photo: true }));
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = async () => {
        const canvas = document.createElement('canvas');
        // Only scale DOWN if the image is larger than the cap; smaller
        // images are kept at their real size (no upscaling/blurring).
        const max = 512;
        let { width, height } = img;
        const scale = Math.min(1, max / Math.max(width, height));
        width = Math.round(width * scale);
        height = Math.round(height * scale);
        canvas.width = width; canvas.height = height;
        const ctx = canvas.getContext('2d');
        // Import in the file's own format so it looks exactly like the
        // original (PNG/WebP keep transparency; JPEG stays JPEG). Only the
        // dimensions change. High quality so there's no visible loss.
        const t = (file.type || '').toLowerCase();
        let outType, outExt, dataUrl;
        ctx.clearRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
        if (t === 'image/png') {
          outType = 'image/png'; outExt = 'png'; dataUrl = canvas.toDataURL('image/png');
        } else if (t === 'image/webp') {
          outType = 'image/webp'; outExt = 'webp'; dataUrl = canvas.toDataURL('image/webp', 0.95);
        } else if (t === 'image/gif') {
          // Canvas can't keep GIF animation; export lossless PNG instead.
          outType = 'image/png'; outExt = 'png'; dataUrl = canvas.toDataURL('image/png');
        } else {
          outType = 'image/jpeg'; outExt = 'jpg'; dataUrl = canvas.toDataURL('image/jpeg', 0.95);
        }
        // Optimistic preview while the upload runs
        setProfile(p => ({ ...p, photo: dataUrl }));
        try {
          const blob = await (await fetch(dataUrl)).blob();
          const publicUrl = await uploadToStorage(`photo-${Date.now()}.${outExt}`, blob, outType);
          setProfile(p => ({ ...p, photo: publicUrl }));
        } catch (err) {
          alert(`Couldn't upload photo: ${err.message}`);
        } finally {
          setUploading(u => ({ ...u, photo: false }));
        }
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleResumeUpload = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 10 * 1024 * 1024) { alert('Resume must be under 10MB'); return; }
    setUploading(u => ({ ...u, resume: true }));
    try {
      const ext = (f.name.split('.').pop() || 'pdf').toLowerCase();
      const publicUrl = await uploadToStorage(`resume-${Date.now()}.${ext}`, f, f.type || 'application/pdf');
      setProfile(p => ({ ...p, resume: f.name, resumeUrl: publicUrl }));
    } catch (err) {
      alert(`Couldn't upload resume: ${err.message}`);
    } finally {
      setUploading(u => ({ ...u, resume: false }));
    }
  };

  const handleCredFiles = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setUploading(u => ({ ...u, cred: true }));
    try {
      const uploaded = [];
      for (const f of files) {
        if (f.size > 10 * 1024 * 1024) { alert(`${f.name} is too large (10MB limit)`); continue; }
        const ext = (f.name.split('.').pop() || 'bin').toLowerCase();
        const safeName = f.name.replace(/[^a-zA-Z0-9._-]+/g, '_');
        const publicUrl = await uploadToStorage(
          `credentials/${Date.now()}-${safeName}`,
          f,
          f.type || `application/${ext}`
        );
        uploaded.push({ name: f.name, url: publicUrl });
      }
      setProfile(p => ({
        ...p,
        credentialFiles: [...(p.credentialFiles || []), ...uploaded.map(u => u.name)],
        credentialUrls: [...(p.credentialUrls || []), ...uploaded.map(u => u.url)],
      }));
    } catch (err) {
      alert(`Couldn't upload credential file: ${err.message}`);
    } finally {
      setUploading(u => ({ ...u, cred: false }));
    }
  };

  // ----- Professional References -----
  const addReference = () => {
    const refs = profile.references || [];
    if (refs.length >= 5) { alert('You can list up to 5 references.'); return; }
    setProfile({ ...profile, references: [...refs, { name: '', relationship: '', phone: '', email: '' }] });
  };
  const updateReference = (idx, field, value) => {
    const refs = [...(profile.references || [])];
    refs[idx] = { ...refs[idx], [field]: value };
    setProfile({ ...profile, references: refs });
  };
  const removeReference = (idx) => {
    setProfile({ ...profile, references: (profile.references || []).filter((_, i) => i !== idx) });
  };

  // ----- Training Certificates -----
  const handleTrainingCertUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setUploading(u => ({ ...u, cred: true }));
    try {
      const additions = [];
      for (const f of files) {
        if (f.size > 10 * 1024 * 1024) { alert(`${f.name} is too large (10MB limit)`); continue; }
        const ext = (f.name.split('.').pop() || 'pdf').toLowerCase();
        const safeName = f.name.replace(/[^a-zA-Z0-9._-]+/g, '_');
        const publicUrl = await uploadToStorage(
          `training/${Date.now()}-${safeName}`,
          f,
          f.type || 'application/pdf'
        );
        additions.push({ name: f.name.replace(/\.[^.]+$/, ''), hours: '', issued_at: '', file_url: publicUrl, file_name: f.name });
      }
      setProfile(p => ({ ...p, trainingCertificates: [...(p.trainingCertificates || []), ...additions] }));
    } catch (err) {
      alert(`Couldn't upload certificate: ${err.message}`);
    } finally {
      setUploading(u => ({ ...u, cred: false }));
    }
  };
  const updateTrainingCert = (idx, field, value) => {
    const certs = [...(profile.trainingCertificates || [])];
    certs[idx] = { ...certs[idx], [field]: value };
    setProfile({ ...profile, trainingCertificates: certs });
  };
  const removeTrainingCert = (idx) => {
    setProfile({ ...profile, trainingCertificates: (profile.trainingCertificates || []).filter((_, i) => i !== idx) });
  };

  const removeCredFile = (name) => {
    const idx = (profile.credentialFiles || []).indexOf(name);
    if (idx === -1) return;
    setProfile({
      ...profile,
      credentialFiles: profile.credentialFiles.filter((_, i) => i !== idx),
      credentialUrls: (profile.credentialUrls || []).filter((_, i) => i !== idx),
    });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
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
    if (typeof window !== 'undefined' && window.$crisp) {
      window.$crisp.push(['do', 'session:reset']);
    }
    setProfile({ photo: '', city: '', state: 'Georgia', zip: '', years: '', ageGroups: [], education: '', credentials: [], bgCheck: '', availability: '', positions: [], bio: '', resume: '', credentialFiles: [] });
    setSignup({ name: '', email: '', phone: '', state: 'Georgia', center: '', password: '' });
  };

  // MESSAGING — backed by Supabase. The UI keeps the same shape; we
  // reload after every write so unread flags + last-message ordering
  // come straight from the DB triggers.
  // Fetch the viewed applicant's history (no-shows, completed shifts,
  // response rate, reviews) so the Readiness Score uses real numbers.
  useEffect(() => {
    if (!viewingApplicantDetail || !viewingApplicantDetail.userId) {
      setViewingApplicantHistory(null);
      setViewingApplicantReviews([]);
      return;
    }
    (async () => {
      const [{ data: hist }, { data: rev }] = await Promise.all([
        kkLoadWorkerHistory(viewingApplicantDetail.userId),
        kkLoadReviewsForWorker(viewingApplicantDetail.userId),
      ]);
      setViewingApplicantHistory(hist);
      setViewingApplicantReviews(rev || []);
    })();
  }, [viewingApplicantDetail?.userId]);

  // Fetch the signed-in worker's own history + reviews so their My
  // Profile score reflects their real reputation, not just static data.
  useEffect(() => {
    if (!signedIn || userType !== 'worker') {
      setMyWorkerHistory(null);
      setMyWorkerReviews([]);
      return;
    }
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const [{ data: hist }, { data: rev }] = await Promise.all([
        kkLoadWorkerHistory(user.id),
        kkLoadReviewsForWorker(user.id),
      ]);
      setMyWorkerHistory(hist);
      setMyWorkerReviews(rev || []);
    })();
  }, [signedIn, userType, applied.length]);

  // Refresh the owner's monthly job-post count any time their posted
  // list changes (after a successful post, deletion, or first load).
  useEffect(() => {
    if (!signedIn || userType !== 'owner') { setMonthlyJobCount(0); return; }
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const count = await kkGetCurrentMonthJobCount(user.id);
      setMonthlyJobCount(count);
    })();
  }, [signedIn, userType, posted.length]);

  // Detect admin level on sign-in so the Admin tab can appear.
  useEffect(() => {
    if (!signedIn) { setAdminLevel('none'); return; }
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from('profiles').select('admin_level').eq('id', user.id).maybeSingle();
      setAdminLevel(data?.admin_level || 'none');
      if (data?.admin_level && data.admin_level !== 'none') {
        setAdminAllowedSections(await kkLoadAdminConfig());
      }
    })();
  }, [signedIn]);

  // Load platform-wide data when an admin opens the Admin tab.
  useEffect(() => {
    if (signedIn && isAdmin && tab === 'admin') {
      kkAdminLoadOverview().then(setAdminData);
    }
  }, [signedIn, isAdmin, tab]);

  // Load the user's own support thread (admin↔user) when Messages opens.
  useEffect(() => {
    if (signedIn && tab === 'messages') {
      kkLoadMySupportThread().then(setSupportThread);
    }
  }, [signedIn, tab]);

  const sendSupportReplyMsg = async () => {
    if (!supportDraft.trim()) return;
    const body = supportDraft.trim();
    setSupportDraft('');
    const { error } = await kkSendSupportReply(body);
    if (error) { alert(`Couldn't send: ${error.message}`); return; }
    setSupportThread(await kkLoadMySupportThread());
  };

  const adminToggleTrusted = async (userId, value) => {
    await kkAdminSetTrusted(userId, value);
    setAdminData(d => d ? { ...d, profiles: d.profiles.map(p => p.id === userId ? { ...p, trusted_network: value } : p) } : d);
  };
  const adminToggleJob = async (jobId, value) => {
    await kkAdminSetJobActive(jobId, value);
    setAdminData(d => d ? { ...d, jobs: d.jobs.map(j => j.id === jobId ? { ...j, active: value } : j) } : d);
  };
  const adminSetLevel = async (userId, level) => {
    const labels = { none: 'remove all admin access from', admin: 'make an Admin', super_admin: 'make a Super Admin' };
    if (!window.confirm(`Are you sure you want to ${labels[level]} this user?`)) return;
    await kkAdminSetAdminLevel(userId, level);
    setAdminData(d => d ? { ...d, profiles: d.profiles.map(p => p.id === userId ? { ...p, admin_level: level } : p) } : d);
  };
  const saveRolePerms = async () => {
    await kkSaveAdminConfig(adminAllowedSections);
    setShowRolePerms(false);
    setShowSaveToast(true);
    setTimeout(() => setShowSaveToast(false), 2500);
  };
  const toggleAllowedSection = (key) => {
    setAdminAllowedSections(s => s.includes(key) ? s.filter(x => x !== key) : [...s, key]);
  };

  // ---- Admin: User Detail panel ----
  const openAdminUser = async (u) => {
    setAdminViewUser(u);
    setAdminUserEdit({
      name: u.name || '', phone: u.phone || '', city: u.city || '', state: u.state || 'Georgia', zip: u.zip || '',
      center: u.center || u.business_name || '', bg_check: u.bg_check || '', years_experience: u.years_experience || '',
    });
    setAdminMsgDraft('');
    setAdminUserThread(await kkAdminLoadUserThread(u.id));
  };
  const saveAdminUser = async () => {
    if (!adminViewUser) return;
    const fields = {
      name: adminUserEdit.name || null,
      phone: adminUserEdit.phone || null,
      city: adminUserEdit.city || null,
      state: adminUserEdit.state || null,
      zip: adminUserEdit.zip || null,
      years_experience: adminUserEdit.years_experience || null,
      bg_check: adminUserEdit.bg_check || null,
    };
    if (adminViewUser.role === 'owner') { fields.center = adminUserEdit.center || null; fields.business_name = adminUserEdit.center || null; }
    const { error } = await kkAdminUpdateProfile(adminViewUser.id, fields);
    if (error) { alert(`Couldn't save: ${error.message}`); return; }
    setAdminData(d => d ? { ...d, profiles: d.profiles.map(p => p.id === adminViewUser.id ? { ...p, ...fields } : p) } : d);
    setShowSaveToast(true); setTimeout(() => setShowSaveToast(false), 2000);
  };
  const adminSendMessage = async () => {
    if (!adminMsgDraft.trim() || !adminViewUser) return;
    const body = adminMsgDraft.trim();
    setAdminMsgDraft('');
    const { error } = await kkAdminSendUserMessage(adminViewUser.id, body);
    if (error) { alert(`Couldn't send: ${error.message}`); return; }
    setAdminUserThread(await kkAdminLoadUserThread(adminViewUser.id));
  };
  const adminSendResetLink = async () => {
    if (!adminViewUser?.email) return;
    if (!window.confirm(`Email a secure password-reset link to ${adminViewUser.email}?`)) return;
    const { ok, error } = await kkAdminCallEdge('admin-reset-password', { targetEmail: adminViewUser.email });
    alert(ok ? 'Reset link sent to their email.' : `Couldn't send reset link: ${error}`);
  };
  const adminDeleteUser = async () => {
    if (!adminViewUser) return;
    const typed = window.prompt(`This permanently deletes ${adminViewUser.name || adminViewUser.email} and all their data. Type DELETE to confirm.`);
    if (typed !== 'DELETE') return;
    const { ok, error } = await kkAdminCallEdge('admin-delete-user', { targetUserId: adminViewUser.id });
    if (!ok) { alert(`Couldn't delete: ${error}`); return; }
    setAdminData(d => d ? { ...d, profiles: d.profiles.filter(p => p.id !== adminViewUser.id) } : d);
    setAdminViewUser(null);
    alert('Account deleted.');
  };

  // ---- Admin: Job Detail panel ----
  const openAdminJob = (j) => {
    setAdminViewJob(j);
    setAdminJobEdit({ title: j.title || '', pay: j.pay || '', location: j.location || '', type: j.type || 'Full Time', description: j.description || '' });
  };
  const saveAdminJob = async () => {
    if (!adminViewJob) return;
    const fields = { title: adminJobEdit.title || null, pay: adminJobEdit.pay || null, location: adminJobEdit.location || null, type: adminJobEdit.type || null, description: adminJobEdit.description || null };
    const { error } = await kkAdminUpdateJob(adminViewJob.id, fields);
    if (error) { alert(`Couldn't save: ${error.message}`); return; }
    setAdminData(d => d ? { ...d, jobs: d.jobs.map(j => j.id === adminViewJob.id ? { ...j, ...fields } : j) } : d);
    setShowSaveToast(true); setTimeout(() => setShowSaveToast(false), 2000);
  };
  const adminMessageJobCreator = async () => {
    if (!adminViewJob?.owner_id) return;
    const body = window.prompt(`Message to the center that posted "${adminViewJob.title}":`);
    if (!body || !body.trim()) return;
    const { error } = await kkAdminSendUserMessage(adminViewJob.owner_id, body.trim());
    alert(error ? `Couldn't send: ${error.message}` : 'Message sent to the center.');
  };
  const adminDeleteJob = async () => {
    if (!adminViewJob) return;
    if (!window.confirm(`Delete the job "${adminViewJob.title}"? This can't be undone.`)) return;
    const { error } = await kkAdminDeleteJob(adminViewJob.id);
    if (error) { alert(`Couldn't delete: ${error.message}`); return; }
    setAdminData(d => d ? { ...d, jobs: d.jobs.filter(j => j.id !== adminViewJob.id) } : d);
    setAdminViewJob(null);
  };

  // Role impersonation — admins preview the app as another role.
  const startImpersonate = (role) => {
    if (!impersonatingRole) realUserTypeRef.current = userType;
    setImpersonatingRole(role);
    setUserType(role);
    setAdminSection(null);
    setTab('jobs');
    setView('app');
  };
  const exitImpersonate = () => {
    setUserType(realUserTypeRef.current);
    setImpersonatingRole(null);
    setTab('admin');
    setView('app');
  };

  // Load the owner's center profile (address, quality rated, hours) so
  // the My Center editor shows their saved data across devices.
  useEffect(() => {
    if (!signedIn || userType !== 'owner') return;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await kkLoadProfile(user.id);
      if (data) {
        setCenterProfile({
          address: data.center_address || '',
          qualityRated: !!data.quality_rated,
          qualityRatedStars: data.quality_rated_stars || 0,
          hours: data.hours_of_operation || '',
        });
        // Keep the business name + phone in signup state in sync too
        setSignup(s => ({
          ...s,
          center: data.center || data.business_name || s.center,
          phone: data.phone || s.phone,
        }));
      }
    })();
  }, [signedIn, userType]);

  // Load sub-staffing data: owners get their requests + offers; workers
  // get open requests + their availability flag + which they've offered on.
  const reloadSubData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    if (userType === 'owner') {
      const reqs = await kkLoadOwnerSubRequests(user.id);
      setOwnerSubRequests(reqs);
      const offers = await kkLoadOffersForOwnerRequests(reqs.map(r => r.id));
      setSubOffersByRequest(offers);
    } else if (userType === 'worker') {
      const [open, mine, { data: prof }] = await Promise.all([
        kkLoadOpenSubRequests(),
        kkLoadMyOfferRequestIds(user.id),
        supabase.from('profiles').select('available_for_sub, sub_availability').eq('id', user.id).maybeSingle(),
      ]);
      setOpenSubRequests(open);
      setMyOfferRequestIds(mine);
      setAvailableForSub(!!prof?.available_for_sub);
      const sched = prof?.sub_availability || {};
      setSubSchedule({ days: sched.days || [], from: sched.from || '', until: sched.until || '', note: sched.note || '' });
    }
  };

  useEffect(() => {
    if (signedIn && (userType === 'owner' || userType === 'worker') && tab === 'subs') {
      reloadSubData();
    }
  }, [signedIn, userType, tab]);

  const openNewSubRequest = () => {
    setEditingSubId(null);
    setSubForm({ dates: [], dateInput: '', start_time: '', end_time: '', age_group: 'Toddler', pay_rate: '', location: '', notes: '' });
    setShowSubRequest(true);
  };

  const openEditSubRequest = (r) => {
    setEditingSubId(r.id);
    setSubForm({
      dates: (r.shift_dates && r.shift_dates.length) ? [...r.shift_dates] : (r.shift_date ? [r.shift_date] : []),
      dateInput: '',
      start_time: r.start_time || '',
      end_time: r.end_time || '',
      age_group: r.age_group || 'Toddler',
      pay_rate: r.pay_rate || '',
      location: r.location || '',
      notes: r.notes || '',
    });
    setShowSubRequest(true);
  };

  const postSubRequest = async () => {
    // Include any date still typed in the picker but not yet "added".
    const allDates = Array.from(new Set([...subForm.dates, ...(subForm.dateInput ? [subForm.dateInput] : [])]));
    if (allDates.length === 0) { alert('Please add at least one date for the shift.'); return; }
    const sorted = [...allDates].sort();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { alert('Please sign in again.'); return; }
    const fields = {
      shift_date: sorted[0],          // earliest, for sorting + NOT NULL
      shift_dates: sorted,            // full list
      start_time: subForm.start_time || null,
      end_time: subForm.end_time || null,
      age_group: subForm.age_group || null,
      pay_rate: subForm.pay_rate || null,
      location: subForm.location || centerProfile.address || null,
      notes: subForm.notes || null,
    };
    if (editingSubId) {
      const { error } = await supabase.from('sub_requests').update(fields).eq('id', editingSubId);
      if (error) { alert(`Could not update the request: ${error.message}`); return; }
    } else {
      const { data: row, error } = await kkCreateSubRequest({
        owner_id: user.id,
        center_name: signup.center || 'Your Center',
        ...fields,
      });
      if (error || !row) { alert(`Could not post the request: ${error?.message || 'unknown error'}`); return; }
      kkNotify({ type: 'sub_request_posted', subRequestId: row.id });
    }
    setShowSubRequest(false);
    setEditingSubId(null);
    setSubForm({ dates: [], dateInput: '', start_time: '', end_time: '', age_group: 'Toddler', pay_rate: '', location: '', notes: '' });
    await reloadSubData();
  };

  const cancelSubRequest = async (id) => {
    if (!window.confirm('Cancel this sub request? Teachers will no longer see it.')) return;
    const { error } = await supabase.from('sub_requests').update({ status: 'canceled' }).eq('id', id);
    if (error) { alert(`Could not cancel: ${error.message}`); return; }
    await reloadSubData();
  };

  const offerToCover = async (subRequestId) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { alert('Please sign in again.'); return; }
    const { error } = await kkCreateSubOffer(subRequestId, user.id);
    if (error) { alert(`Could not send your offer: ${error.message}`); return; }
    kkNotify({ type: 'sub_offer', subRequestId });
    setMyOfferRequestIds(ids => [...ids, subRequestId]);
  };

  const confirmSub = async (offerId, subRequestId, teacherId) => {
    const { error } = await kkConfirmSubOffer(offerId, subRequestId, teacherId);
    if (error) { alert(`Could not confirm: ${error.message}`); return; }
    kkNotify({ type: 'sub_confirmed', subRequestId, teacherId });
    await reloadSubData();
  };

  const toggleSubAvailability = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const next = !availableForSub;
    setAvailableForSub(next);
    await supabase.from('profiles').update({ available_for_sub: next }).eq('id', user.id);
  };

  const toggleSubDay = (day) => {
    setSubSchedule(s => ({
      ...s,
      days: s.days.includes(day) ? s.days.filter(d => d !== day) : [...s.days, day],
    }));
  };

  const saveSubSchedule = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from('profiles').update({ sub_availability: subSchedule }).eq('id', user.id);
    setShowSaveToast(true);
    setTimeout(() => setShowSaveToast(false), 2500);
  };

  const saveCenterProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { alert('Please sign in again.'); return; }
    const { error } = await supabase
      .from('profiles')
      .update({
        center: signup.center || null,
        business_name: signup.center || null,
        phone: signup.phone || null,
        center_address: centerProfile.address || null,
        quality_rated: centerProfile.qualityRated,
        quality_rated_stars: centerProfile.qualityRated ? (centerProfile.qualityRatedStars || null) : null,
        hours_of_operation: centerProfile.hours || null,
      })
      .eq('id', user.id);
    if (error) {
      alert(`Couldn't save your center profile: ${error.message}`);
      return;
    }
    setShowSaveToast(true);
    setTimeout(() => setShowSaveToast(false), 2500);
  };

  const submitReview = async () => {
    setReviewError('');
    if (!viewingApplicantDetail) return;
    if (reviewDraft.rating < 1 || reviewDraft.rating > 5) {
      setReviewError('Please pick a rating from 1 to 5 stars.');
      return;
    }
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setReviewError('Please sign in again.'); return; }
    const { error } = await kkInsertReview({
      applicationId: viewingApplicantDetail.appId,
      workerId: viewingApplicantDetail.userId,
      ownerId: user.id,
      rating: reviewDraft.rating,
      comment: reviewDraft.comment.trim(),
    });
    if (error) {
      setReviewError(error.message);
      return;
    }
    setShowLeaveReview(false);
    setReviewDraft({ rating: 5, comment: '' });
    // Refresh the viewed applicant's history + reviews
    const [{ data: hist }, { data: rev }] = await Promise.all([
      kkLoadWorkerHistory(viewingApplicantDetail.userId),
      kkLoadReviewsForWorker(viewingApplicantDetail.userId),
    ]);
    setViewingApplicantHistory(hist);
    setViewingApplicantReviews(rev || []);
  };

  const updateApplicantOutcome = async (appId, workerId, outcome, jobId) => {
    const { error } = await kkUpdateApplicationOutcome(appId, outcome);
    if (error) {
      alert(`Couldn't update: ${error.message}`);
      return;
    }
    setJobApplicants(prev => {
      const updated = { ...prev };
      const arr = updated[jobId] ? [...updated[jobId]] : null;
      if (arr) {
        const idx = arr.findIndex(a => a.appId === appId);
        if (idx !== -1) arr[idx] = { ...arr[idx], worker_outcome: outcome };
        updated[jobId] = arr;
      }
      return updated;
    });
    if (viewingApplicantDetail && viewingApplicantDetail.appId === appId) {
      setViewingApplicantDetail({ ...viewingApplicantDetail, worker_outcome: outcome });
    }
    // Refresh history so the score updates without a page reload
    if (workerId) {
      const { data } = await kkLoadWorkerHistory(workerId);
      setViewingApplicantHistory(data);
    }
  };

  // Load full profile data for saved candidates when the modal opens.
  useEffect(() => {
    if (!showSavedCandidates) return;
    (async () => {
      if (savedCandidateIds.length === 0) { setSavedCandidatesFull([]); return; }
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .in('id', savedCandidateIds);
      setSavedCandidatesFull(data || []);
    })();
  }, [showSavedCandidates, savedCandidateIds]);

  // Load Trusted Teacher Network — driven by the trusted_network flag
  // on profiles. The flag is auto-curated by a DB trigger (criteria:
  // complete profile, verified bg check, CPR + another credential,
  // 2+ completed shifts, zero no-shows), and an admin can override
  // either way via the Supabase dashboard.
  useEffect(() => {
    if (!showTrustedNetwork) return;
    (async () => {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('trusted_network', true)
        .order('updated_at', { ascending: false })
        .limit(50);
      // Fetch each worker's history to compute the score for display
      const ranked = await Promise.all((data || []).map(async (p) => {
        const { data: hist } = await kkLoadWorkerHistory(p.id);
        const score = calculateReadinessScore(rowToProfileState(p), hist || {}).total;
        return { profile: p, score };
      }));
      ranked.sort((a, b) => b.score - a.score);
      setTrustedNetworkFull(ranked);
    })();
  }, [showTrustedNetwork]);

  const toggleSaveCandidate = async (workerId) => {
    if (!workerId) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const currentlySaved = savedCandidateIds.includes(workerId);
    // Optimistic update
    setSavedCandidateIds(prev => currentlySaved ? prev.filter(id => id !== workerId) : [...prev, workerId]);
    const { error } = await kkToggleSaveCandidate(user.id, workerId, currentlySaved);
    if (error) {
      // Revert on error
      setSavedCandidateIds(prev => currentlySaved ? [...prev, workerId] : prev.filter(id => id !== workerId));
      alert(`Couldn't ${currentlySaved ? 'remove' : 'save'} candidate: ${error.message}`);
    }
  };

  const updateApplicantStage = async (appId, newStatus, jobId) => {
    if (!appId) return;
    const { error } = await kkUpdateApplicationStatus(appId, newStatus);
    if (error) {
      alert(`Couldn't update stage: ${error.message}`);
      return;
    }
    // Email the applicant that their status changed (interview/hired/etc).
    kkNotify({ type: 'stage_change', applicationId: appId, newStage: newStatus });
    // Reflect locally without a full refetch
    setJobApplicants(prev => {
      const updated = { ...prev };
      if (jobId && updated[jobId]) {
        updated[jobId] = updated[jobId].map(a =>
          a.appId === appId ? { ...a, status: newStatus } : a
        );
      } else {
        for (const k of Object.keys(updated)) {
          updated[k] = updated[k].map(a =>
            a.appId === appId ? { ...a, status: newStatus } : a
          );
        }
      }
      return updated;
    });
    if (viewingApplicantDetail && viewingApplicantDetail.appId === appId) {
      setViewingApplicantDetail({ ...viewingApplicantDetail, status: newStatus });
    }
  };

  const reloadConversations = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await kkLoadConversationsForUser(user.id);
    setConversations(data || []);
  };

  const startOrOpenConversation = async (otherParty) => {
    // otherParty = { email, name, role, userId, jobTitle?, jobId?, photo?, center? }
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    // Need the other party's user ID. Pass it on otherParty.userId for new
    // applicant cases; fall back to a lookup by email if not provided.
    let otherUserId = otherParty.userId;
    if (!otherUserId && otherParty.email) {
      const { data: row } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', otherParty.email)
        .maybeSingle();
      otherUserId = row?.id;
    }
    if (!otherUserId) {
      alert('Could not find that user to start a conversation with.');
      return;
    }
    const isMeWorker = userType === 'worker';
    const workerId = isMeWorker ? user.id : otherUserId;
    const ownerId = isMeWorker ? otherUserId : user.id;
    const { data: conv, error } = await kkGetOrCreateConversation({
      workerId,
      ownerId,
      jobId: otherParty.jobId || null,
      jobTitle: otherParty.jobTitle || null,
    });
    if (error || !conv) {
      alert(`Could not start the conversation: ${error?.message || 'unknown error'}`);
      return;
    }
    await reloadConversations();
    setActiveConvId(conv.id);
    setTab('messages');
  };

  // One-click interview request: opens (or reuses) the conversation with
  // an applicant and sends a polished, professional interview invitation
  // offering phone / video / in-person and asking for their availability.
  const requestInterview = async (applicant, job) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { alert('Please sign in again.'); return; }
    let otherUserId = applicant.userId;
    if (!otherUserId && applicant.email) {
      const { data: row } = await supabase.from('profiles').select('id').eq('email', applicant.email).maybeSingle();
      otherUserId = row?.id;
    }
    if (!otherUserId) { alert('Could not find this applicant to message.'); return; }
    const centerName = signup.center || 'our center';
    const firstName = (applicant.name || '').split(' ')[0] || 'there';
    const { data: conv, error } = await kkGetOrCreateConversation({
      workerId: otherUserId,
      ownerId: user.id,
      jobId: job.id,
      jobTitle: job.title,
    });
    if (error || !conv) { alert(`Could not start the conversation: ${error?.message || 'unknown error'}`); return; }
    const msg = `Hi ${firstName}, thank you for applying to our ${job.title} position at ${centerName}. We'd love to set up an interview — would a phone call, a video call (Zoom), or an in-person visit work best for you? Please reply with a few days and times that fit your schedule and we'll confirm. We look forward to speaking with you!`;
    const { error: msgErr } = await kkSendMessage({ conversationId: conv.id, body: msg });
    if (msgErr) { alert(`Could not send the interview request: ${msgErr.message}`); return; }
    kkNotify({ type: 'new_message', conversationId: conv.id });
    await reloadConversations();
    setViewingApplicantsFor(null);
    setViewingApplicantDetail(null);
    setActiveConvId(conv.id);
    setTab('messages');
    setView('app');
  };

  const sendMessage = async (convId, text) => {
    if (!text || !text.trim()) return;
    const trimmed = text.trim();
    setMessageDraft('');
    const { error } = await kkSendMessage({ conversationId: convId, body: trimmed });
    if (error) {
      alert(`Couldn't send message: ${error.message}`);
      return;
    }
    // Email the other participant that they have a new message.
    kkNotify({ type: 'new_message', conversationId: convId });
    await reloadConversations();
  };

  const markConversationRead = async (convId) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await kkMarkConversationRead({ conversationId: convId, userId: user.id });
    // Optimistic clear so the badge updates instantly without waiting on reload
    setConversations(prev => prev.map(c => c.id !== convId ? c : { ...c, unreadFor: (c.unreadFor || []).filter(e => e !== signup.email) }));
  };

  // Get conversations involving current user
  const myConversations = signedIn && signup.email
    ? conversations.filter(c => c.participants.some(p => p.email === signup.email)).sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated))
    : [];

  const myUnreadCount = myConversations.reduce((sum, c) => sum + ((c.unreadFor || []).includes(signup.email) ? 1 : 0), 0);

  const RADIUS_MILES = 30;
  const visibleJobs = useMemo(() => {
    // Georgia-only for now: every applicant sees only Georgia jobs.
    let jobs = [...realJobs, ...SAMPLE_JOBS].filter(j => !j.state || j.state === 'Georgia');
    // Within-30-miles filter: only when the worker has a recognized city
    // and the toggle is on. Jobs whose city we can't place are kept.
    if (nearbyOnly && profile.city) {
      const home = GA_CITY_COORDS[(profile.city || '').trim().toLowerCase()];
      if (home) {
        jobs = jobs.filter(j => {
          const jc = GA_CITY_COORDS[cityFromLocation(j.location)];
          if (!jc) return true; // unknown job location → don't hide it
          const d = milesBetween(home, jc);
          return d == null || d <= RADIUS_MILES;
        });
      }
    }
    const q = (jobSearch || '').toLowerCase();
    return jobs.filter(j => {
      const s = !q || [j.title, j.location, j.center].some(v => (v || '').toLowerCase().includes(q));
      const f = jobFilter === 'all' || j.type === jobFilter;
      return s && f;
    });
  }, [realJobs, jobSearch, jobFilter, nearbyOnly, profile.city]);

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
      alt="Rellim Kid Kare Konnect"
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
    // Sub Shifts shows for logged-out visitors too (as a sign-up teaser),
    // so the nav stays consistent before and after login.
    if (!signedIn || userType === 'worker' || userType === 'owner') base.splice(1, 0, { id: 'subs', label: 'Sub Shifts', icon: Calendar });
    if (signedIn && (userType === 'worker' || userType === 'owner')) base.splice(1, 0, { id: 'messages', label: 'Messages', icon: Mail, badge: myUnreadCount });
    if (signedIn && userType === 'worker' && profileComplete) base.push({ id: 'myProfile', label: 'My Profile', icon: User });
    if (signedIn && userType === 'owner') base.push({ id: 'myCenter', label: 'My Center', icon: Building2 });
    if (signedIn && isAdmin && !impersonatingRole) base.push({ id: 'admin', label: 'Admin', icon: Shield });
    return base;
  };

  const Header = () => {
    const tabs = buildTabs();
    return (
      <>
      <header style={{ background: c.white, borderBottom: `1px solid ${c.border}`, position: 'sticky', top: 0, zIndex: 50 }}>
        <div className="max-w-7xl mx-auto px-4 md:px-6 flex items-center justify-between gap-2" style={{ minHeight: 68 }}>
          <button onClick={() => setView(signedIn ? 'app' : 'welcome')} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><Logo /></button>
          <nav className="hidden md:flex items-center gap-1 flex-1 justify-center">
            {tabs.map(t => (
              <button key={t.id} onClick={() => { if (!signedIn && t.id !== 'licensing') { setGatedTab(t); return; } setView('app'); setTab(t.id); }} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 11px', borderRadius: 8, background: view === 'app' && tab === t.id ? c.paleBlue : 'transparent', color: view === 'app' && tab === t.id ? c.primary : c.text, fontSize: 13, fontWeight: view === 'app' && tab === t.id ? 700 : 500, border: 'none', cursor: 'pointer', position: 'relative' }}>
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
                <button
                  onClick={() => {
                    if (userType === 'worker') { if (profileComplete) { setView('app'); setTab('myProfile'); } else { setView('profile'); } }
                    else if (userType === 'owner') { setView('app'); setTab('myCenter'); }
                    else if (userType === 'partner') { setView('app'); setTab('partners'); }
                    else { setView('app'); }
                  }}
                  title="View my profile"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, borderRadius: '50%', display: 'flex' }}
                >
                  <Avatar name={signup.name || 'T B'} photo={profile.photo} size={34} />
                </button>
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
              <button key={t.id} onClick={() => { if (!signedIn && t.id !== 'licensing') { setGatedTab(t); return; } setView('app'); setTab(t.id); }} style={{ flex: '0 0 auto', minWidth: 72, padding: '10px 10px', background: 'transparent', color: view === 'app' && tab === t.id ? c.primary : c.textMuted, fontSize: 10.5, fontWeight: 600, border: 'none', cursor: 'pointer', borderBottom: view === 'app' && tab === t.id ? `2px solid ${c.primary}` : '2px solid transparent', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, position: 'relative', whiteSpace: 'nowrap' }}>
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

      {/* IMPERSONATION BANNER — shown while an admin previews another role */}
      {impersonatingRole && (
        <div style={{ background: c.gold, color: c.navy, padding: '8px 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, fontSize: 13, fontWeight: 700, position: 'sticky', top: 68, zIndex: 49 }}>
          <Eye size={15} /> Previewing as {impersonatingRole === 'worker' ? 'Teacher' : impersonatingRole === 'owner' ? 'Director' : 'Partner'}
          <button onClick={exitImpersonate} style={{ background: c.navy, color: c.white, border: 'none', borderRadius: 8, padding: '5px 12px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Exit preview</button>
        </div>
      )}

      {/* SIGN-UP REQUIRED — friendly explainer when a guest taps a gated tab.
          Lives inside Header so it renders no matter which view (welcome,
          roleChoice, login, pricing, app) is currently showing. */}
      {gatedTab && (() => {
        const messages = {
          jobs:      { headline: 'Sign up to browse open positions', body: 'Create a free Teacher account to see every childcare job posted across Georgia, save the ones you like, and apply with one click.', recommend: 'worker' },
          templates: { headline: 'Sign up to post jobs with templates', body: 'Create a Daycare Center account to start hiring. We offer ready-made templates so you can post a position in under two minutes.', recommend: 'owner' },
          subs:      { headline: 'Sign up to view Sub Shifts', body: 'Create a free account to pick up open substitute shifts at Georgia centers — or, as a daycare center, post a shift when you need coverage fast.', recommend: 'worker' },
          training:  { headline: 'Sign up to access the Training Hub', body: 'Create a free account to explore credential paths, GELDS-aligned training, and Georgia DECAL renewal information.', recommend: 'worker' },
          licensing: { headline: 'Sign up to view State Licensing details', body: 'Create a free account to access Georgia DECAL licensing requirements, background-check steps, and credential renewal timelines.', recommend: 'worker' },
          partners:  { headline: 'Sign up to browse Partners', body: 'Create a free account to view trusted training providers, consultants, and centers across Georgia.', recommend: 'worker' },
          profile:   { headline: 'Sign up to build your profile', body: 'Create a free Teacher account to build your childcare professional profile and let Georgia centers find you.', recommend: 'worker' },
          messages:  { headline: 'Sign up to start messaging', body: 'Create a free account so you can message daycare centers about positions and respond to interview requests.', recommend: 'worker' },
        };
        const msg = messages[gatedTab.id] || { headline: `Sign up to access ${gatedTab.label || ''}`, body: 'Create a free account to use this feature.', recommend: 'worker' };
        const TabIcon = gatedTab.icon || Verified;
        return (
          <Modal onClose={() => setGatedTab(null)}>
            <div className="flex items-center justify-between" style={{ marginBottom: 16 }}>
              <div className="flex items-center gap-3">
                <div style={{ width: 42, height: 42, borderRadius: 11, background: c.paleBlue, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <TabIcon size={20} color={c.primary} />
                </div>
                <div>
                  <div style={{ fontSize: 11, color: c.primary, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{gatedTab.label}</div>
                  <h3 style={{ fontSize: 18, fontWeight: 800, color: c.navy, letterSpacing: '-0.015em' }}>{msg.headline}</h3>
                </div>
              </div>
            </div>
            <p style={{ fontSize: 13.5, color: c.textMuted, lineHeight: 1.6, marginBottom: 18 }}>{msg.body}</p>
            <div className="grid sm:grid-cols-2 gap-2" style={{ marginBottom: 14 }}>
              <button
                onClick={() => { setGatedTab(null); setUserType('worker'); setView('signup'); }}
                style={{ padding: '12px 14px', background: msg.recommend === 'worker' ? c.primary : c.white, color: msg.recommend === 'worker' ? c.white : c.primary, border: `1.5px solid ${c.primary}`, borderRadius: 10, fontSize: 13.5, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
              >
                I'm a Teacher
              </button>
              <button
                onClick={() => { setGatedTab(null); setUserType('owner'); setView('signup'); }}
                style={{ padding: '12px 14px', background: msg.recommend === 'owner' ? c.primary : c.white, color: msg.recommend === 'owner' ? c.white : c.primary, border: `1.5px solid ${c.primary}`, borderRadius: 10, fontSize: 13.5, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
              >
                I'm a Daycare Center
              </button>
            </div>
            <div style={{ textAlign: 'center', fontSize: 12.5, color: c.textMuted }}>
              Already have an account?{' '}
              <button
                onClick={() => { setGatedTab(null); setView('login'); }}
                style={{ background: 'none', border: 'none', color: c.primary, fontWeight: 700, cursor: 'pointer', textDecoration: 'underline', padding: 0 }}
              >
                Log in
              </button>
            </div>
          </Modal>
        );
      })()}
      </>
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

  // Shared static-page chrome
  const StaticPage = ({ kicker, title, lead, children }) => (
    <div style={{ minHeight: '100vh', background: c.cream, fontFamily: 'system-ui, sans-serif' }}>
      <Header />
      <div className="max-w-3xl mx-auto px-4 md:px-6 py-8">
        <button onClick={goBack} style={{ color: c.textMuted, fontSize: 13, background: 'none', border: 'none', cursor: 'pointer', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 4 }}><ChevronLeft size={14} /> Back</button>
        <div style={{ marginBottom: 22 }}>
          {kicker && <div style={{ fontSize: 11.5, color: c.primary, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 6 }}>{kicker}</div>}
          <h1 style={{ fontSize: 'clamp(26px, 4.5vw, 34px)', fontWeight: 800, color: c.navy, letterSpacing: '-0.025em', marginBottom: 6 }}>{title}</h1>
          {lead && <p style={{ fontSize: 15, color: c.textMuted, lineHeight: 1.6 }}>{lead}</p>}
        </div>
        <div style={{ background: c.white, borderRadius: 16, padding: '22px 22px 6px', border: `1px solid ${c.border}` }}>
          {children}
        </div>
      </div>
      <Footer onNavigate={setView} />
      <LiveChat />
    </div>
  );

  const PolicySection = ({ heading, children }) => (
    <section style={{ marginBottom: 22, paddingBottom: 18, borderBottom: `1px solid ${c.borderSoft}` }}>
      <h2 style={{ fontSize: 16, fontWeight: 800, color: c.navy, marginBottom: 8, letterSpacing: '-0.01em' }}>{heading}</h2>
      <div style={{ fontSize: 14, color: c.text, lineHeight: 1.65 }}>{children}</div>
    </section>
  );

  const acceptPolicy = async (kind) => {
    setPolicyError('');
    if (!policyForm.name || !policyForm.title || !policyForm.business) {
      setPolicyError('Please fill in your name, title, and center or business name before accepting.');
      return;
    }
    const next = { ...policyAcceptance, [kind]: { ...policyForm, date: new Date().toISOString() } };
    setPolicyAcceptance(next);
    await STORE.set('kk_policyAcceptance', next);
    setPolicyForm({ name: '', title: '', business: '' });
  };

  const SignOffBlock = ({ kind, label }) => {
    const existing = policyAcceptance[kind];
    if (existing) {
      const d = new Date(existing.date);
      return (
        <section style={{ marginTop: 6, marginBottom: 12, padding: '16px 18px', background: '#EAF6EE', borderLeft: `4px solid ${c.success}`, borderRadius: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <CheckCircle2 size={16} color={c.success} />
            <strong style={{ fontSize: 14, color: c.navy }}>{label} accepted</strong>
          </div>
          <div style={{ fontSize: 13, color: c.text, lineHeight: 1.55 }}>
            <div>{existing.name} · {existing.title}</div>
            <div>{existing.business}</div>
            <div style={{ color: c.textMuted, marginTop: 4 }}>Accepted {d.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</div>
          </div>
        </section>
      );
    }
    return (
      <section style={{ marginTop: 12, marginBottom: 12, padding: '18px 18px 16px', background: c.paleBlue, borderRadius: 12, border: `1px solid ${c.lightBlue}` }}>
        <div style={{ fontSize: 11.5, color: c.primary, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>Owner / Director Sign-Off</div>
        <h3 style={{ fontSize: 16, fontWeight: 800, color: c.navy, marginBottom: 6 }}>Accept the {label}</h3>
        <p style={{ fontSize: 13, color: c.textMuted, lineHeight: 1.55, marginBottom: 14 }}>By accepting, the owner or director confirms they have reviewed this document and approve its terms on behalf of their center or business.</p>
        {policyError && (
          <div style={{ background: '#FEF2F2', border: `1px solid ${c.coral}`, color: c.coralDark, padding: '9px 12px', borderRadius: 8, fontSize: 13, marginBottom: 12, display: 'flex', alignItems: 'flex-start', gap: 8 }}>
            <AlertCircle size={14} style={{ flexShrink: 0, marginTop: 2 }} />{policyError}
          </div>
        )}
        <div className="space-y-3">
          <Input label="Owner / Director Name" value={policyForm.name} onChange={v => setPolicyForm({ ...policyForm, name: v })} placeholder="Toni Brewer" />
          <Input label="Title" value={policyForm.title} onChange={v => setPolicyForm({ ...policyForm, title: v })} placeholder="Owner / Director" />
          <Input label="Center or Business Name" value={policyForm.business} onChange={v => setPolicyForm({ ...policyForm, business: v })} placeholder="Little Leaders Academy" />
        </div>
        <button onClick={() => acceptPolicy(kind)} style={{ width: '100%', marginTop: 14, padding: '11px', background: c.primary, color: c.white, border: 'none', borderRadius: 10, fontSize: 13.5, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          <CheckCircle2 size={14} /> I Accept the {label}
        </button>
      </section>
    );
  };

  // ABOUT
  if (view === 'about') {
    return (
      <StaticPage kicker="About" title="About Rellim Kid Kare Konnect" lead="A trusted childcare employment and networking platform connecting daycare owners, childcare centers, teachers, childcare professionals, and administrators.">
        <PolicySection heading="Who we are">
          Rellim Kid Kare Konnect is a childcare employment and networking platform that connects daycare owners and childcare centers with qualified teachers, childcare professionals, and administrators. The app lets applicants create professional profiles, upload credentials and employment information, and apply for childcare opportunities with ease.
        </PolicySection>
        <PolicySection heading="What we do">
          We support childcare businesses with reliable hiring tools, workforce connections, and strategic partnerships that strengthen and grow the early childhood education community. Centers gain access to a vetted applicant pool, and applicants gain visibility with the centers most likely to value their work.
        </PolicySection>
        <PolicySection heading="Our mission">
          Rellim Kid Kare Konnect empowers the childcare industry by connecting passionate educators and childcare professionals with quality daycare employment opportunities through a secure and trusted platform. Our mission is to support childcare businesses with reliable applicant resources, meaningful partnerships, and innovative tools that strengthen the early childhood education community.
        </PolicySection>
        <PolicySection heading="Who Rellim Kid Kare Konnect is for">
          <ul style={{ paddingLeft: 20, margin: 0 }}>
            <li>Daycare owners and operators</li>
            <li>Licensed childcare centers</li>
            <li>Teachers and lead caregivers</li>
            <li>Childcare professionals and assistants</li>
            <li>Center directors and administrators</li>
            <li>Training providers and trusted partners</li>
          </ul>
        </PolicySection>
      </StaticPage>
    );
  }

  // CONTACT
  if (view === 'contact') {
    return (
      <StaticPage kicker="Contact" title="Get in touch" lead="We're here to help with account questions, hiring support, billing, and anything else you need.">
        <PolicySection heading="Reach our team">
          <div style={{ display: 'grid', gap: 10 }}>
            <a href="mailto:info@kidkarekonnect.com" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', background: c.paleBlue, border: `1px solid ${c.lightBlue}`, borderRadius: 11, color: c.primaryDark, textDecoration: 'none', fontWeight: 600 }}>
              <Mail size={18} color={c.primary} />
              <div>
                <div style={{ fontSize: 11, color: c.textMuted, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Email</div>
                <div style={{ fontSize: 14 }}>info@kidkarekonnect.com</div>
              </div>
            </a>
            <a href={SUPPORT_PHONE_TEL} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', background: c.paleBlue, border: `1px solid ${c.lightBlue}`, borderRadius: 11, color: c.primaryDark, textDecoration: 'none', fontWeight: 600 }}>
              <Phone size={18} color={c.primary} />
              <div>
                <div style={{ fontSize: 11, color: c.textMuted, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Phone</div>
                <div style={{ fontSize: 14 }}>{SUPPORT_PHONE}</div>
              </div>
            </a>
          </div>
        </PolicySection>
        <PolicySection heading="How we support you">
          <ul style={{ paddingLeft: 20, margin: 0 }}>
            <li><strong>Email support</strong> — send us a message anytime at info@kidkarekonnect.com</li>
            <li><strong>Live chat</strong> — use in-app messaging during business hours for real-time help</li>
            <li><strong>Help desk ticket</strong> — open a ticket from the Help page for tracked issues</li>
          </ul>
        </PolicySection>
        <PolicySection heading="Response times">
          Our team strives to respond to all support requests in a timely and professional manner. Response times may vary depending on the nature and volume of requests. Urgent account or billing issues are prioritized.
        </PolicySection>
        <PolicySection heading="Reporting concerns">
          To report suspicious activity, false information, harassment, inappropriate conduct, or any policy violation, email us at info@kidkarekonnect.com or open a help desk ticket. We review every report and respond as soon as possible.
        </PolicySection>
      </StaticPage>
    );
  }

  // PRIVACY
  if (view === 'privacy') {
    return (
      <StaticPage kicker="Privacy" title="Privacy Policy" lead="How Rellim Kid Kare Konnect protects user data and respects your privacy.">
        <PolicySection heading="Data we collect">
          We collect only the information needed to operate the platform and support hiring: names, email addresses, phone numbers, employment history, certifications, credentials, profile photos, job postings, and account activity. We do not collect children's information through this platform.
        </PolicySection>
        <PolicySection heading="How we use information">
          Information is used to operate user accounts, match applicants with employers, display profiles to authorized parties, process subscriptions, and improve platform features. We do not sell user information.
        </PolicySection>
        <PolicySection heading="Third-party sharing">
          We do not share user information with third parties, except where required for employment or platform purposes — for example, presenting an applicant's profile to an employer they have applied to, or working with payment and infrastructure providers that help us run the service securely.
        </PolicySection>
        <PolicySection heading="How we protect your data">
          Rellim Kid Kare Konnect protects user data through secure authentication, encrypted data storage, and controlled access measures designed to keep personal and professional information safe. We are committed to maintaining privacy and using secure technology practices to safeguard all user data.
        </PolicySection>
        <PolicySection heading="Who can access your information">
          Access is limited to authorized users: the individual applicant, approved daycare employers they engage with, and authorized administrators responsible for managing the platform. Sensitive information is only shared for employment and hiring purposes and is protected through secure access controls.
        </PolicySection>
        <PolicySection heading="Account deletion and data removal">
          Users may request account deletion or data removal at any time by emailing <strong>info@kidkarekonnect.com</strong> or using the in-app support features. Once verified, accounts and associated personal information will be securely removed in accordance with our privacy and data retention policies.
          <div style={{ marginTop: 10, padding: '10px 12px', background: c.cream, borderRadius: 8, fontStyle: 'italic', fontSize: 13.5 }}>
            Los usuarios pueden solicitar la eliminación de su cuenta o la eliminación de datos en cualquier momento comunicándose con soporte a través de info@kidkarekonnect.com.
          </div>
        </PolicySection>
        <SignOffBlock kind="privacy" label="Privacy Policy" />
      </StaticPage>
    );
  }

  // TERMS
  if (view === 'terms') {
    return (
      <StaticPage kicker="Terms" title="Terms & Conditions" lead="By using Rellim Kid Kare Konnect, you agree to the following terms.">
        <PolicySection heading="User responsibilities">
          Users are responsible for providing accurate, truthful, and up-to-date information within the platform. Applicants and employers agree to use the app professionally and respectfully, and to maintain the confidentiality of any sensitive information accessed through the platform. Submitting false credentials, misleading information, or engaging in unauthorized use of the app is prohibited.
        </PolicySection>
        <PolicySection heading="Acceptable use">
          <ul style={{ paddingLeft: 20, margin: 0 }}>
            <li>Use the platform in a lawful, respectful, and professional manner</li>
            <li>Provide truthful and current employment history, certifications, and credentials</li>
            <li>Keep applicant and employer information confidential — do not share, sell, or distribute it without authorization</li>
            <li>Do not post false job listings or submit fake applications</li>
            <li>Do not harass, threaten, or discriminate against other users</li>
            <li>Do not upload harmful, offensive, or inappropriate content</li>
            <li>Do not attempt to gain unauthorized access to accounts or platform systems</li>
            <li>Do not use the platform for illegal or unauthorized activities</li>
          </ul>
        </PolicySection>
        <PolicySection heading="Account security">
          Users are responsible for maintaining the confidentiality of their login credentials and for all activity associated with their account.
        </PolicySection>
        <PolicySection heading="Subscriptions and payments">
          Centers may subscribe to a paid plan to access full platform features. All subscription fees, advertising fees, partnership fees, and other service-related payments are generally non-refundable unless otherwise stated below. Users may cancel a subscription at any time through account settings or by contacting <strong>info@kidkarekonnect.com</strong>. Cancellation stops future billing cycles; previously paid fees are non-refundable except as noted in the Refund Policy.
        </PolicySection>
        <PolicySection heading="Refund policy">
          Refund requests may be considered for duplicate charges, billing errors, platform-related technical issues that prevent access to paid services, or unauthorized transactions reported and verified by our support team. Refunds will not be issued for failure to secure employment or applicants, dissatisfaction unrelated to platform functionality, account suspension or termination due to policy violations, or unused subscription periods. Requests must be submitted within 7 business days of the transaction date by emailing <strong>info@kidkarekonnect.com</strong> with name, account information, transaction details, and reason. Each request is reviewed case by case.
        </PolicySection>
        <PolicySection heading="Account suspension and termination">
          Rellim Kid Kare Konnect reserves the right to suspend, restrict, or terminate accounts that violate platform policies, submit false information, misuse data, or engage in inappropriate conduct.
        </PolicySection>
        <PolicySection heading="Content ownership">
          Users retain ownership of the content they upload. By using the platform, users grant Rellim Kid Kare Konnect permission to display and process submitted content (resumes, certifications, profile photos, job postings, business advertisements, and messages) for employment, networking, advertising, and platform-related purposes. By uploading content, users confirm it is accurate, lawful, and that they have the right to share it.
        </PolicySection>
        <PolicySection heading="Prohibited content">
          Users may not upload false or misleading information, offensive or discriminatory content, fraudulent credentials, spam or malware, unauthorized advertisements, or any content that violates local, state, or federal laws. Rellim Kid Kare Konnect reserves the right to review, remove, or restrict any content that violates these standards.
        </PolicySection>
        <PolicySection heading="Liability disclaimer">
          Rellim Kid Kare Konnect serves solely as a networking and employment connection platform. We do not guarantee employment, hiring outcomes, applicant qualifications, background check results, or business partnerships. Users are solely responsible for verifying the accuracy, legality, qualifications, certifications, and background information of any party they engage with. We make reasonable efforts to maintain platform availability and security but do not guarantee uninterrupted service. To the fullest extent permitted by law, Rellim Kid Kare Konnect, its owners, affiliates, employees, and partners are not liable for any direct, indirect, incidental, consequential, or special damages resulting from use of or inability to use the platform.
        </PolicySection>
        <SignOffBlock kind="terms" label="Terms & Conditions" />
      </StaticPage>
    );
  }

  // HELP
  if (view === 'help') {
    return (
      <StaticPage kicker="Help" title="Help & Support" lead="Quick answers, troubleshooting, and how to reach us if you need a hand.">
        <PolicySection heading="Frequently asked questions">
          <div style={{ display: 'grid', gap: 12 }}>
            <div>
              <div style={{ fontWeight: 700, color: c.navy, marginBottom: 3 }}>How do I create an account?</div>
              <div>Tap Sign Up on the home page, choose Teacher or Daycare Center, and follow the prompts. Email verification takes about a minute.</div>
            </div>
            <div>
              <div style={{ fontWeight: 700, color: c.navy, marginBottom: 3 }}>I forgot my password — what do I do?</div>
              <div>From the Log In page, tap "Forgot password?" and we will email you a reset code that expires in 15 minutes.</div>
            </div>
            <div>
              <div style={{ fontWeight: 700, color: c.navy, marginBottom: 3 }}>How do I upload my resume and credentials?</div>
              <div>Go to My Profile, scroll to the Documents section, and tap Upload. PDF, JPG, and PNG are supported.</div>
            </div>
            <div>
              <div style={{ fontWeight: 700, color: c.navy, marginBottom: 3 }}>How do I cancel a subscription?</div>
              <div>Owners can cancel anytime from account settings, or by emailing info@kidkarekonnect.com. Cancellation stops future billing.</div>
            </div>
            <div>
              <div style={{ fontWeight: 700, color: c.navy, marginBottom: 3 }}>Can I delete my account?</div>
              <div>Yes. Email info@kidkarekonnect.com to request account deletion or data removal. Once verified, your account is securely removed.</div>
            </div>
          </div>
        </PolicySection>
        <PolicySection heading="Login help">
          <ul style={{ paddingLeft: 20, margin: 0 }}>
            <li>Double-check your email address and password for typos</li>
            <li>Use the "Forgot password?" link if you can't remember your password</li>
            <li>Make sure your internet connection is active</li>
            <li>Close and reopen the app, then try again</li>
          </ul>
        </PolicySection>
        <PolicySection heading="Profile and upload help">
          <ul style={{ paddingLeft: 20, margin: 0 }}>
            <li>Use supported file formats: PDF, DOC, DOCX for resumes; JPG, PNG, PDF for credentials</li>
            <li>Keep files under 5 MB for photos and 10 MB for documents</li>
            <li>If an upload fails, refresh the app and try again</li>
            <li>Fill in every required profile field marked with an asterisk</li>
          </ul>
        </PolicySection>
        <PolicySection heading="Billing and subscription help">
          <ul style={{ paddingLeft: 20, margin: 0 }}>
            <li>Confirm your payment method is active and not expired</li>
            <li>Review subscription status in your account settings</li>
            <li>Watch for duplicate charges or failed payment notifications</li>
            <li>Contact info@kidkarekonnect.com for any billing issue</li>
          </ul>
        </PolicySection>
        <PolicySection heading="Notification issues">
          <ul style={{ paddingLeft: 20, margin: 0 }}>
            <li>Verify app notifications are enabled in your device settings</li>
            <li>Make sure you have a stable internet connection</li>
            <li>Sign out and sign back in to refresh your session</li>
          </ul>
        </PolicySection>
        <PolicySection heading="App performance">
          <ul style={{ paddingLeft: 20, margin: 0 }}>
            <li>Close unused apps running in the background</li>
            <li>Clear the app cache if your device supports it</li>
            <li>Update to the latest version of the app</li>
            <li>Reinstall the app if the issue persists</li>
          </ul>
        </PolicySection>
        <PolicySection heading="Contact support">
          <p style={{ marginBottom: 10 }}>If your issue isn't resolved by the steps above, reach out and our team will help.</p>
          <div style={{ display: 'grid', gap: 8 }}>
            <a href="mailto:info@kidkarekonnect.com?subject=Rellim%20Kid%20Kare%20Konnect%20support%20request" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 13px', background: c.paleBlue, border: `1px solid ${c.lightBlue}`, borderRadius: 10, color: c.primaryDark, textDecoration: 'none', fontWeight: 600, fontSize: 14 }}>
              <Mail size={15} color={c.primary} /> info@kidkarekonnect.com
            </a>
            <a href={SUPPORT_PHONE_TEL} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 13px', background: c.paleBlue, border: `1px solid ${c.lightBlue}`, borderRadius: 10, color: c.primaryDark, textDecoration: 'none', fontWeight: 600, fontSize: 14 }}>
              <Phone size={15} color={c.primary} /> {SUPPORT_PHONE}
            </a>
          </div>
          <p style={{ marginTop: 10, fontSize: 13, color: c.textMuted }}>
            When you reach out, please include your name, the device you're using, a description of the issue, screenshots if you have them, and any troubleshooting you've already tried.
          </p>
        </PolicySection>
      </StaticPage>
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
                  Built for Georgia Childcare
                </div>
                <h1 style={{ fontSize: 'clamp(32px, 5.5vw, 56px)', fontWeight: 800, color: c.navy, lineHeight: 1.05, letterSpacing: '-0.035em', marginBottom: 16 }}>
                  Where Great<br/>
                  <span style={{ background: 'linear-gradient(135deg, #2B5F7E 0%, #FF8C42 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Childcare Begins</span>
                </h1>
                <p style={{ fontSize: 16.5, color: c.textMuted, lineHeight: 1.6, marginBottom: 6, maxWidth: 520 }}>
                  Connecting Georgia daycare centers with qualified, credentialed childcare professionals — built around DECAL licensing, GELDS training, and the real way childcare hiring works.
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
                  <div style={{ display: 'inline-block', fontSize: 10.5, padding: '3px 9px', background: c.gold, color: c.navy, borderRadius: 999, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>From ${Math.min(...PRICING.map(p => p.price))} / month</div>
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

        {/* PURPOSE-BUILT — Georgia childcare positioning, on its own merits */}
        <section style={{ background: c.white, borderTop: `1px solid ${c.border}` }}>
          <div className="max-w-6xl mx-auto px-6 py-14">
            <div className="text-center" style={{ marginBottom: 32 }}>
              <div style={{ fontSize: 12, color: c.primary, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8 }}>Why Rellim Kid Kare Konnect</div>
              <h2 style={{ fontSize: 'clamp(24px, 4vw, 32px)', fontWeight: 800, color: c.navy, letterSpacing: '-0.025em', marginBottom: 10 }}>Purpose-built for Georgia childcare.</h2>
              <p style={{ fontSize: 15, color: c.textMuted, maxWidth: 620, margin: '0 auto', lineHeight: 1.6 }}>
                A hiring and networking platform designed specifically for the people who care for Georgia's youngest learners. Every feature reflects how childcare centers actually hire and how qualified educators actually grow their careers.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div style={{ background: c.cream, border: `1px solid ${c.border}`, borderRadius: 14, padding: 20 }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: c.paleBlue, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                  <Heart size={18} fill={c.primary} color={c.primary} />
                </div>
                <h3 style={{ fontSize: 15, fontWeight: 800, color: c.navy, marginBottom: 6, letterSpacing: '-0.01em' }}>Focused on childcare</h3>
                <p style={{ fontSize: 12.5, color: c.textMuted, lineHeight: 1.55 }}>Every job, every applicant, every credential is built around early childhood education. Centers find serious applicants. Teachers find centers that value their craft.</p>
              </div>
              <div style={{ background: c.cream, border: `1px solid ${c.border}`, borderRadius: 14, padding: 20 }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: '#FFF1DD', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                  <Award size={18} color="#FF8C42" />
                </div>
                <h3 style={{ fontSize: 15, fontWeight: 800, color: c.navy, marginBottom: 6, letterSpacing: '-0.01em' }}>Aligned with DECAL</h3>
                <p style={{ fontSize: 12.5, color: c.textMuted, lineHeight: 1.55 }}>Profiles map directly to Georgia DECAL credentials — CDA, Director Credential, State Preservice, GELDS-informed training. Centers see what each candidate is licensed to do at a glance.</p>
              </div>
              <div style={{ background: c.cream, border: `1px solid ${c.border}`, borderRadius: 14, padding: 20 }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: '#EAF6EE', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                  <Verified size={18} color={c.success} fill={c.success} />
                </div>
                <h3 style={{ fontSize: 15, fontWeight: 800, color: c.navy, marginBottom: 6, letterSpacing: '-0.01em' }}>Verified, portable background checks</h3>
                <p style={{ fontSize: 12.5, color: c.textMuted, lineHeight: 1.55 }}>Background check status is displayed on every profile, including portable checks that let qualified teachers start work right away rather than waiting weeks for a duplicate screening.</p>
              </div>
              <div style={{ background: c.cream, border: `1px solid ${c.border}`, borderRadius: 14, padding: 20 }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                  <Star size={18} color={c.gold} fill={c.gold} />
                </div>
                <h3 style={{ fontSize: 15, fontWeight: 800, color: c.navy, marginBottom: 6, letterSpacing: '-0.01em' }}>Reliability you can see</h3>
                <p style={{ fontSize: 12.5, color: c.textMuted, lineHeight: 1.55 }}>Professional Readiness Score, completed shifts, attendance history, and employer references — all visible on every profile so centers can hire with confidence.</p>
              </div>
            </div>
            <div className="text-center" style={{ marginTop: 28 }}>
              <p style={{ fontSize: 13, color: c.textMuted, fontStyle: 'italic' }}>
                Currently serving Atlanta metro and across Georgia. <strong style={{ color: c.navy, fontStyle: 'normal' }}>Built carefully, one community at a time.</strong>
              </p>
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

        <Footer onNavigate={setView} />
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
              <div style={{ display: 'inline-block', fontSize: 10, padding: '3px 8px', background: c.gold, color: c.navy, borderRadius: 999, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>From ${Math.min(...PRICING.map(p => p.price))} / month</div>
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
        <Footer onNavigate={setView} />
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
      const { data, error } = await kkSupabaseSignUp({
        email: partnerSignup.email,
        password: partnerSignup.password,
        role: 'partner',
        name: partnerSignup.name,
        phone: partnerSignup.phone,
        businessName: partnerSignup.businessName,
        category: partnerSignup.category,
      });
      if (error) {
        setPartnerError(mapSupabaseError(error));
        return;
      }
      setUserType('partner');
      setIsPartner(true);
      setSignup({ name: partnerSignup.name, email: partnerSignup.email, phone: partnerSignup.phone, password: partnerSignup.password, state: 'Georgia', center: partnerSignup.businessName });
      setNewListing({ category: partnerSignup.category, name: partnerSignup.businessName, tagline: '', description: '', website: '', phone: partnerSignup.phone });
      if (data && data.session) {
        setSignedIn(true);
        setView('app');
        setTab('partners');
        setShowListBiz(true);
        return;
      }
      setEnteredCode('');
      setCodeError('');
      setView('verifyEmail');
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
        <Footer onNavigate={setView} />
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
      const { data, error } = await kkSupabaseLogin({
        email: partnerLoginForm.email,
        password: partnerLoginForm.password,
      });
      if (error) {
        setPartnerError(mapSupabaseError(error));
        return;
      }
      const user = data?.user;
      const { data: profileRow } = await kkLoadProfile(user.id);
      if (profileRow && profileRow.role !== 'partner') {
        setPartnerError("This email is registered to a different account type. Use the regular login.");
        await supabase.auth.signOut();
        return;
      }
      setSignedIn(true);
      setIsPartner(true);
      setUserType('partner');
      setSignup({
        name: profileRow?.name || '',
        email: user.email,
        phone: profileRow?.phone || '',
        password: '',
        state: profileRow?.state || 'Georgia',
        center: profileRow?.business_name || profileRow?.center || '',
      });
      await STORE.set('kk_auth', { signedIn: true, userType: 'partner', isPartner: true, currentEmail: user.email });
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
                <PasswordField value={partnerLoginForm.password} onChange={v => setPartnerLoginForm({ ...partnerLoginForm, password: v })} placeholder="Your password" onKeyDown={e => e.key === 'Enter' && handlePartnerLogin()} />
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
        <Footer onNavigate={setView} />
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
      const { data, error } = await kkSupabaseLogin({
        email: loginForm.email,
        password: loginForm.password,
      });
      if (error) {
        setLoginError(mapSupabaseError(error));
        return;
      }
      const user = data?.user;
      if (!user) {
        setLoginError("We couldn't sign you in. Try again or reset your password.");
        return;
      }
      const { data: profileRow } = await kkLoadProfile(user.id);
      const role = profileRow?.role || user.user_metadata?.role || 'worker';

      const sessionSignup = {
        name: profileRow?.name || user.user_metadata?.name || '',
        email: user.email || loginForm.email,
        phone: profileRow?.phone || user.user_metadata?.phone || '',
        state: profileRow?.state || user.user_metadata?.state || 'Georgia',
        center: profileRow?.center || profileRow?.business_name || user.user_metadata?.center || '',
        password: '',
      };
      setSignup(sessionSignup);
      await STORE.set('kk_signup', sessionSignup);

      setUserType(role);
      if (role === 'worker') {
        const remote = rowToProfileState(profileRow, profileRow?.state);
        if (remote && (profileRow?.profile_complete || profileRow?.city)) {
          setProfile(remote);
          setProfileComplete(!!profileRow?.profile_complete);
        } else {
          const savedProfile = await STORE.get(`kk_profile_${user.email}`);
          if (savedProfile) {
            setProfile(savedProfile);
            setProfileComplete(true);
          } else {
            setProfileComplete(false);
          }
        }
      }
      if (role === 'owner') {
        const { data: ownerJobs } = await kkLoadOwnerJobs(user.id);
        const uiJobs = (ownerJobs || []).map(jobRowToUiJob);
        if (uiJobs.length > 0) {
          setPosted(uiJobs);
          const { data: applicantsByJob } = await kkLoadApplicantsForJobs(uiJobs.map(j => j.id));
          setJobApplicants(applicantsByJob || {});
        } else {
          const ownerData = await STORE.get(`kk_owner_${user.email}`);
          if (ownerData) {
            setPosted(ownerData.posted || []);
            setJobApplicants(ownerData.jobApplicants || {});
          }
        }
        if (profileRow?.subscription_plan && profileRow?.subscription_status &&
            ['trialing', 'active'].includes(profileRow.subscription_status)) {
          setPlan(profileRow.subscription_plan);
        } else {
          const legacyPlan = await STORE.get(`kk_owner_${user.email}`);
          if (legacyPlan && legacyPlan.plan) setPlan(legacyPlan.plan);
        }
      }
      if (role === 'worker') {
        const { data: apps } = await kkLoadWorkerApplications(user.id);
        if (apps && apps.length > 0) {
          setApplied(apps.map(a => a.job_id));
        }
      }
      // Load conversations regardless of role (works for both workers and owners).
      {
        const { data: convs } = await kkLoadConversationsForUser(user.id);
        if (convs) setConversations(convs);
      }
      if (role === 'owner') {
        const { data: saved } = await kkLoadSavedCandidates(user.id);
        if (saved) setSavedCandidateIds(saved);
      }
      setSignedIn(true);
      setIsPartner(role === 'partner');
      await STORE.set('kk_auth', {
        signedIn: true,
        userType: role,
        profileComplete: role === 'worker' ? !!(await STORE.get(`kk_profile_${user.email}`)) : false,
        plan: null,
        rememberMe: loginForm.rememberMe,
        currentEmail: user.email,
      });
      setLoginForm({ email: '', password: '', rememberMe: false });
      setView('app');
      setTab(role === 'partner' ? 'partners' : 'jobs');
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
                <PasswordField value={loginForm.password} onChange={v => setLoginForm({ ...loginForm, password: v })} placeholder="Your password" onKeyDown={e => e.key === 'Enter' && handleLogin()} />
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
        <Footer onNavigate={setView} />
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
      const { error } = await kkSupabaseRequestPasswordReset(resetData.email);
      if (error) {
        setResetError(mapSupabaseError(error));
        return;
      }
      setEnteredCode('');
      setResetStep('code');
    };

    const verifyResetCode = async () => {
      setResetError('');
      if (enteredCode.length < 6) {
        setResetError('Enter the verification code from your email.');
        return;
      }
      const { error } = await kkSupabaseVerifyRecovery({ email: resetData.email, token: enteredCode });
      if (error) {
        setResetError(mapSupabaseError(error));
        return;
      }
      // verifyOtp returned a temporary session — we can now updateUser.
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
      const { error } = await kkSupabaseUpdatePassword(resetData.newPassword);
      if (error) {
        setResetError(mapSupabaseError(error));
        return;
      }
      // We deliberately sign out after a password reset so the user logs in fresh.
      await supabase.auth.signOut();
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
                <p style={{ color: c.textMuted, fontSize: 13.5, marginBottom: 6, textAlign: 'center' }}>We'll email you a verification code that expires in 15 minutes.</p>
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
                <p style={{ color: c.textMuted, fontSize: 13.5, marginBottom: 16 }}>We sent a verification code to <strong>{resetData.email}</strong>. It expires in 15 minutes.</p>
                {resetError && (
                  <div style={{ background: '#FEF2F2', border: `1px solid ${c.coral}`, color: c.coralDark, padding: '10px 12px', borderRadius: 8, fontSize: 13, marginBottom: 12, display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                    <AlertCircle size={15} style={{ flexShrink: 0, marginTop: 1 }} />{resetError}
                  </div>
                )}
                <div>
                  <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: c.text, marginBottom: 5 }}>Verification code</label>
                  <input value={enteredCode} onChange={e => setEnteredCode(e.target.value.replace(/\D/g, '').slice(0, 10))} placeholder="" maxLength={10} style={{ width: '100%', padding: '14px', fontSize: 22, textAlign: 'center', letterSpacing: '0.2em', border: `1.5px solid ${c.border}`, borderRadius: 9, background: c.white, color: c.text, outline: 'none', fontFamily: 'monospace', fontWeight: 700 }} />
                </div>
                <button onClick={() => { if (enteredCode.length < 6) { setResetError('Enter the verification code from your email.'); return; } verifyResetCode(); }} style={{ width: '100%', marginTop: 16, padding: '12px', background: c.primary, color: c.white, border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>Verify Code</button>
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
        <Footer onNavigate={setView} />
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
            <p style={{ color: c.textMuted, fontSize: 13.5, marginBottom: 16 }}>We sent a verification code to <strong>{signup.email}</strong>. Enter it below to confirm your email. The code expires in about 15 minutes.</p>

            {codeError && (
              <div style={{ background: '#FEF2F2', border: `1px solid ${c.coral}`, color: c.coralDark, padding: '10px 12px', borderRadius: 8, fontSize: 13, marginBottom: 12, display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                <AlertCircle size={15} style={{ flexShrink: 0, marginTop: 1 }} />{codeError}
              </div>
            )}

            <div>
              <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: c.text, marginBottom: 5 }}>Verification code</label>
              <input value={enteredCode} onChange={e => setEnteredCode(e.target.value.replace(/\D/g, '').slice(0, 10))} placeholder="" maxLength={10} style={{ width: '100%', padding: '14px', fontSize: 22, textAlign: 'center', letterSpacing: '0.2em', border: `1.5px solid ${c.border}`, borderRadius: 9, background: c.white, color: c.text, outline: 'none', fontFamily: 'monospace', fontWeight: 700 }} onKeyDown={e => e.key === 'Enter' && enteredCode.length >= 6 && handleVerifyEmail()} />
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
        <Footer onNavigate={setView} />
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
        <Footer onNavigate={setView} />
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
        <Footer onNavigate={setView} />
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
          <Footer onNavigate={setView} />
        </div>
      );
    }
    const choosePlan = async (planName) => {
      // If they aren't signed in yet, send them through signup first.
      // We stash the chosen plan in localStorage so the pricing page can
      // auto-launch Stripe Checkout once they're signed in as an owner.
      // We DO NOT set plan locally — plan is only "real" once Stripe's
      // webhook updates subscription_plan in Supabase.
      if (!signedIn || userType !== 'owner') {
        await STORE.set('kk_pending_plan', planName);
        setUserType('owner');
        setView('signup');
        return;
      }
      // Signed-in owner: kick off Stripe Checkout.
      const priceId = STRIPE_PRICE_IDS[planName];
      if (!priceId) {
        alert(`Billing isn't configured for ${planName} yet. Stripe price IDs are missing — see VITE_STRIPE_PRICE_* env vars in Vercel.`);
        return;
      }
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) { alert('Please sign in again.'); return; }
        const baseUrl = window.location.origin;
        const res = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL || 'https://vennbviwdmcyhcmwdncd.supabase.co'}/functions/v1/create-checkout-session`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({
              planName,
              priceId,
              successUrl: `${baseUrl}/?subscription=success`,
              cancelUrl: `${baseUrl}/?subscription=canceled`,
            }),
          }
        );
        const data = await res.json();
        if (!res.ok || !data.url) {
          alert(`Could not start checkout: ${data.error || 'unknown error'}`);
          return;
        }
        window.location.href = data.url;
      } catch (err) {
        alert(`Could not start checkout: ${err.message}`);
      }
    };

    // (Auto-launch Stripe Checkout from kk_pending_plan is handled by a
    // top-level useEffect at the App scope — see the effect above that
    // depends on [view, signedIn, userType, plan]. Hooks can't live
    // inside a conditional view block.)

    // Send an owner to the Stripe Customer Portal so they can manage
    // their subscription (cancel, change plan, update card).
    const openCustomerPortal = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) { alert('Please sign in again.'); return; }
        const res = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL || 'https://vennbviwdmcyhcmwdncd.supabase.co'}/functions/v1/create-portal-session`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({ returnUrl: window.location.origin }),
          }
        );
        const data = await res.json();
        if (!res.ok || !data.url) {
          alert(`Could not open billing portal: ${data.error || 'unknown error'}`);
          return;
        }
        window.location.href = data.url;
      } catch (err) {
        alert(`Could not open billing portal: ${err.message}`);
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
            {signedIn && userType === 'owner' && plan && (
              <div style={{ marginTop: 16 }}>
                <button
                  onClick={openCustomerPortal}
                  style={{ padding: '10px 18px', background: c.white, color: c.primary, border: `1.5px solid ${c.primary}`, borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}
                >
                  Manage Subscription <ArrowRight size={13} />
                </button>
                <div style={{ marginTop: 6, fontSize: 12, color: c.textMuted }}>You're on <strong>{plan}</strong> · update card, change plan, or cancel anytime</div>
              </div>
            )}
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto" style={{ alignItems: 'stretch' }}>
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
        <Footer onNavigate={setView} />
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
                  {signedIn && userType === 'owner' ? 'My Job Posts' : 'Jobs in Georgia'}
                </h2>
                <p style={{ color: c.textMuted, fontSize: 13 }}>
                  {(() => {
                    if (signedIn && userType === 'owner') {
                      const planDetails = PRICING.find(p => p.name === plan);
                      const limit = planDetails ? planDetails.monthlyJobLimit : null;
                      const limitText = limit === null || limit === undefined
                        ? `${monthlyJobCount} posted this month · Unlimited`
                        : `${monthlyJobCount} of ${limit} posts used this month`;
                      return `${posted.length} active${plan ? ` · ${plan} plan · ${limitText}` : ''}`;
                    }
                    return `${visibleJobs.length} positions across Georgia`;
                  })()}
                </p>
              </div>
              {signedIn && userType === 'owner' && (
                <div className="flex gap-2 flex-wrap">
                  <button onClick={() => setShowSavedCandidates(true)} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '8px 12px', background: c.white, color: c.coralDark, border: `1.5px solid ${c.coralDark}`, borderRadius: 9, fontSize: 12.5, fontWeight: 700, cursor: 'pointer' }}><Heart size={13} fill={c.coralDark} /> Saved ({savedCandidateIds.length})</button>
                  <button
                    onClick={() => { if (hasFeature(plan, 'trusted_network')) setShowTrustedNetwork(true); else setView('pricing'); }}
                    style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '8px 12px', background: hasFeature(plan, 'trusted_network') ? c.gold : c.white, color: hasFeature(plan, 'trusted_network') ? c.navy : c.textMuted, border: `1.5px solid ${hasFeature(plan, 'trusted_network') ? c.gold : c.border}`, borderRadius: 9, fontSize: 12.5, fontWeight: 700, cursor: 'pointer' }}
                    title={hasFeature(plan, 'trusted_network') ? 'Browse Trusted Teacher Network' : 'Premium feature — upgrade to access'}
                  >
                    {hasFeature(plan, 'trusted_network') ? <Verified size={13} fill={c.navy} stroke={c.gold} /> : <Lock size={13} />} Trusted Network
                  </button>
                  <button onClick={() => setTab('templates')} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '8px 12px', background: c.white, color: c.primary, border: `1.5px solid ${c.primary}`, borderRadius: 9, fontSize: 12.5, fontWeight: 700, cursor: 'pointer' }}><LayoutGrid size={13} /> Templates</button>
                  <button onClick={() => setShowPost(true)} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '8px 12px', background: c.primary, color: c.white, border: 'none', borderRadius: 9, fontSize: 12.5, fontWeight: 700, cursor: 'pointer' }}><Plus size={13} /> Post Job</button>
                </div>
              )}
            </div>

            {/* Owner CTA banner about readiness scores + verification */}
            {signedIn && userType === 'owner' && posted.length > 0 && (
              <div style={{ background: `linear-gradient(135deg, ${c.paleBlue} 0%, ${c.cream} 100%)`, border: `1px solid ${c.lightBlue}`, borderRadius: 12, padding: '12px 16px', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 12 }}>
                <Verified size={20} fill={c.gold} stroke={c.white} strokeWidth={2.5} />
                <div style={{ flex: 1, minWidth: 0, fontSize: 12.5, color: c.navy, lineHeight: 1.4 }}>
                  Use <strong>Professional Readiness Scores</strong> and <strong>Verification Badges</strong> to identify reliable, qualified childcare professionals faster.
                  {!hasFeature(plan, 'readiness_score') && <button onClick={() => setView('pricing')} style={{ marginLeft: 8, color: c.primary, background: 'none', border: 'none', textDecoration: 'underline', cursor: 'pointer', fontSize: 12.5, fontWeight: 700 }}>Upgrade to Pro</button>}
                </div>
              </div>
            )}

            {userType !== 'owner' && (
              <>
                <div className="flex gap-2 mb-4 flex-wrap">
                  <div style={{ flex: 1, minWidth: 220, position: 'relative' }}>
                    <Search size={15} color={c.textMuted} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                    <input value={jobSearch} onChange={e => setJobSearch(e.target.value)} placeholder="Search by title, center, or city" style={{ width: '100%', padding: '10px 11px 10px 36px', fontSize: 13.5, background: c.white, border: `1.5px solid ${c.border}`, borderRadius: 9, color: c.text, outline: 'none' }} />
                  </div>
                  <select value={jobFilter} onChange={e => setJobFilter(e.target.value)} style={{ padding: '10px 13px', fontSize: 13.5, background: c.white, border: `1.5px solid ${c.border}`, borderRadius: 9, color: c.text, outline: 'none', fontWeight: 500 }}>
                    <option value="all">All Types</option><option value="Full Time">Full Time</option><option value="Part Time">Part Time</option>
                  </select>
                  {signedIn && profile.city && (
                    <button
                      onClick={() => setNearbyOnly(v => !v)}
                      title={GA_CITY_COORDS[(profile.city || '').trim().toLowerCase()] ? `Within 30 miles of ${profile.city}` : `We don't recognize "${profile.city}" yet — showing all Georgia`}
                      style={{ padding: '10px 13px', fontSize: 13, fontWeight: 700, borderRadius: 9, cursor: 'pointer', border: `1.5px solid ${nearbyOnly ? c.primary : c.border}`, background: nearbyOnly ? c.primary : c.white, color: nearbyOnly ? c.white : c.text, display: 'flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap' }}
                    >
                      <MapPin size={13} /> Within 30 mi
                    </button>
                  )}
                </div>
                {nearbyOnly && profile.city && !GA_CITY_COORDS[(profile.city || '').trim().toLowerCase()] && (
                  <p style={{ fontSize: 11.5, color: c.coralDark, marginTop: -6, marginBottom: 8 }}>We don't recognize "{profile.city}" for distance yet, so all Georgia jobs are shown. Try a nearby metro-Atlanta city name.</p>
                )}
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
              <p style={{ color: c.textMuted, fontSize: 13 }}>Georgia childcare qualifications and background check steps.</p>
            </div>

            {/* More-states-coming teaser banner */}
            <div style={{ background: 'linear-gradient(135deg, #FFF1DD 0%, #FFE0BD 100%)', border: `1px solid ${c.gold}`, borderRadius: 12, padding: '14px 18px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 13 }}>
              <div style={{ width: 40, height: 40, borderRadius: 11, background: c.white, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 2px 6px rgba(15,42,61,0.08)' }}>
                <MapPin size={19} color="#FF8C42" />
              </div>
              <div>
                <div style={{ fontSize: 14.5, fontWeight: 800, color: c.navy, marginBottom: 2, letterSpacing: '-0.01em' }}>Starting in Georgia — more states are on the way.</div>
                <div style={{ fontSize: 12.5, color: c.textMuted, lineHeight: 1.45 }}>We're growing one community at a time, getting it right before we expand. Georgia today, your state soon.</div>
              </div>
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

                {/* Official state agency contacts (public info, neutral resource) */}
                {info.contacts && (
                  <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.15)' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: c.gold, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 9 }}>Contact the Licensing Agency</div>
                    <div className="space-y-2" style={{ fontSize: 11.5 }}>
                      {info.contacts.website && (
                        <a href={`https://${info.contacts.website.replace(/^www\./, 'www.')}`} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'rgba(255,255,255,0.92)', textDecoration: 'none' }}>
                          <Globe size={13} color={c.gold} /> {info.contacts.website}
                        </a>
                      )}
                      {info.contacts.phone && (
                        <a href={`tel:${info.contacts.phone.replace(/[^0-9+]/g, '')}`} style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'rgba(255,255,255,0.92)', textDecoration: 'none' }}>
                          <Phone size={13} color={c.gold} /> {info.contacts.phone}
                        </a>
                      )}
                      {info.contacts.email && (
                        <a href={`mailto:${info.contacts.email}`} style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'rgba(255,255,255,0.92)', textDecoration: 'none' }}>
                          <Mail size={13} color={c.gold} /> {info.contacts.email} <span style={{ color: 'rgba(255,255,255,0.6)' }}>· questions</span>
                        </a>
                      )}
                      {info.contacts.outOfStateEmail && (
                        <a href={`mailto:${info.contacts.outOfStateEmail}`} style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'rgba(255,255,255,0.92)', textDecoration: 'none' }}>
                          <Mail size={13} color={c.gold} /> {info.contacts.outOfStateEmail} <span style={{ color: 'rgba(255,255,255,0.6)' }}>· out of state</span>
                        </a>
                      )}
                      {info.contacts.fax && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'rgba(255,255,255,0.92)' }}>
                          <FileText size={13} color={c.gold} /> {info.contacts.fax} <span style={{ color: 'rgba(255,255,255,0.6)' }}>· fax</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
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

            {/* Support thread from Rellim Kid Kare Konnect (admin) */}
            {supportThread.length > 0 && (
              <div style={{ background: c.white, border: `1.5px solid ${c.gold}`, borderRadius: 14, padding: 16, marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <div style={{ width: 34, height: 34, borderRadius: 9, background: c.navy, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Shield size={16} color={c.gold} /></div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: c.navy }}>Rellim Kid Kare Konnect Support</div>
                </div>
                <div style={{ maxHeight: 220, overflowY: 'auto', background: c.cream, borderRadius: 9, padding: 10, marginBottom: 10 }}>
                  {supportThread.map(m => (
                    <div key={m.id} style={{ display: 'flex', justifyContent: m.is_from_admin ? 'flex-start' : 'flex-end', marginBottom: 6 }}>
                      <div style={{ maxWidth: '80%', padding: '8px 12px', borderRadius: 12, fontSize: 13, lineHeight: 1.45, background: m.is_from_admin ? c.white : c.primary, color: m.is_from_admin ? c.text : c.white, border: m.is_from_admin ? `1px solid ${c.border}` : 'none' }}>{m.body}</div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input value={supportDraft} onChange={e => setSupportDraft(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendSupportReplyMsg()} placeholder="Reply to support…" style={{ flex: 1, padding: '9px 12px', fontSize: 13, border: `1.5px solid ${c.border}`, borderRadius: 9, outline: 'none', background: c.white, color: c.text }} />
                  <button onClick={sendSupportReplyMsg} style={{ padding: '9px 14px', background: c.primary, color: c.white, border: 'none', borderRadius: 9, fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}><Send size={13} /> Send</button>
                </div>
              </div>
            )}

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
        {tab === 'admin' && signedIn && isAdmin && (() => {
          const allSections = [
            { key: 'teachers',         label: 'Teachers',         type: 'profiles', rows: (adminData?.profiles || []).filter(p => p.role === 'worker') },
            { key: 'centers',          label: 'Centers',          type: 'profiles', rows: (adminData?.profiles || []).filter(p => p.role === 'owner') },
            { key: 'jobs',             label: 'Jobs Posted',      type: 'jobs',     rows: (adminData?.jobs || []) },
            { key: 'applications',     label: 'Applications',     type: 'applications', rows: (adminData?.applications || []) },
            { key: 'partners',         label: 'Partners',         type: 'profiles', rows: (adminData?.profiles || []).filter(p => p.role === 'partner') },
            { key: 'sub_requests',     label: 'Sub Requests',     type: 'subs',     rows: (adminData?.subs || []) },
            { key: 'trusted_teachers', label: 'Trusted Teachers', type: 'profiles', rows: (adminData?.profiles || []).filter(p => p.role === 'worker' && p.trusted_network) },
            { key: 'sub_shifts',       label: 'Open Sub Shifts',  type: 'subs',     rows: (adminData?.subs || []).filter(s => s.status === 'open') },
          ];
          const visibleSections = isSuperAdmin ? allSections : allSections.filter(s => adminAllowedSections.includes(s.key));
          const profById = Object.fromEntries((adminData?.profiles || []).map(p => [p.id, p]));
          const jobById = Object.fromEntries((adminData?.jobs || []).map(j => [j.id, j]));
          const current = adminSection ? visibleSections.find(s => s.key === adminSection) : null;
          return (
          <div>
            <div className="flex items-start justify-between flex-wrap gap-3 mb-4">
              <div>
                <h2 style={{ fontSize: 22, fontWeight: 800, color: c.navy, letterSpacing: '-0.02em', marginBottom: 3, display: 'flex', alignItems: 'center', gap: 8 }}><Shield size={20} color={c.primary} /> Admin
                  <span style={{ fontSize: 10.5, fontWeight: 800, background: isSuperAdmin ? c.primary : c.gold, color: isSuperAdmin ? c.white : c.navy, padding: '3px 9px', borderRadius: 999, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{isSuperAdmin ? 'Super Admin' : 'Admin'}</span>
                </h2>
                <p style={{ color: c.textMuted, fontSize: 13 }}>Platform overview and management.</p>
              </div>
              {isSuperAdmin && (
                <button onClick={() => setShowRolePerms(true)} style={{ padding: '9px 14px', background: c.white, color: c.primary, border: `1.5px solid ${c.primary}`, borderRadius: 9, fontSize: 12.5, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}><KeyRound size={13} /> Role Permissions</button>
              )}
            </div>

            {/* Impersonation controls */}
            <div style={{ background: c.cream, border: `1px dashed ${c.border}`, borderRadius: 12, padding: 14, marginBottom: 18 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: c.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Preview the app as another role</div>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => startImpersonate('worker')} style={{ padding: '8px 14px', background: c.white, color: c.primary, border: `1.5px solid ${c.primary}`, borderRadius: 9, fontSize: 12.5, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}><User size={13} /> View as Teacher</button>
                <button onClick={() => startImpersonate('owner')} style={{ padding: '8px 14px', background: c.white, color: c.primary, border: `1.5px solid ${c.primary}`, borderRadius: 9, fontSize: 12.5, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}><Building2 size={13} /> View as Director</button>
                <button onClick={() => startImpersonate('partner')} style={{ padding: '8px 14px', background: c.white, color: c.primary, border: `1.5px solid ${c.primary}`, borderRadius: 9, fontSize: 12.5, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}><Handshake size={13} /> View as Partner</button>
              </div>
            </div>

            {!adminData ? (
              <div style={{ padding: 40, textAlign: 'center', color: c.textMuted }}>Loading platform data…</div>
            ) : current ? (
              /* ===== SECTION DETAIL VIEW ===== */
              <div>
                <button onClick={() => { setAdminSection(null); setAdminUserSearch(''); }} style={{ color: c.textMuted, fontSize: 13, background: 'none', border: 'none', cursor: 'pointer', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 4 }}><ChevronLeft size={14} /> Back to dashboard</button>
                <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
                  <h3 style={{ fontSize: 18, fontWeight: 800, color: c.navy }}>{current.label} ({current.rows.length})</h3>
                  <input value={adminUserSearch} onChange={e => setAdminUserSearch(e.target.value)} placeholder="Search…" style={{ padding: '8px 12px', fontSize: 13, border: `1.5px solid ${c.border}`, borderRadius: 9, background: c.white, color: c.text, outline: 'none', minWidth: 200 }} />
                </div>
                <div className="space-y-1.5">
                  {current.rows.length === 0 && <div style={{ padding: 24, textAlign: 'center', color: c.textMuted, fontSize: 13, background: c.white, border: `1px dashed ${c.border}`, borderRadius: 10 }}>No records yet.</div>}
                  {current.type === 'profiles' && current.rows.filter(p => {
                    const q = adminUserSearch.toLowerCase();
                    return !q || (p.name||'').toLowerCase().includes(q) || (p.email||'').toLowerCase().includes(q) || (p.center||'').toLowerCase().includes(q);
                  }).map(p => (
                    <div key={p.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, padding: '10px 12px', background: c.white, border: `1px solid ${c.border}`, borderRadius: 10, flexWrap: 'wrap' }}>
                      <button onClick={() => openAdminUser(p)} style={{ minWidth: 0, textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', flex: 1, padding: 0 }}>
                        <div style={{ fontSize: 13.5, fontWeight: 700, color: c.navy, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                          {p.role === 'owner' ? (p.center || p.business_name || p.name || 'Center') : (p.name || 'Unnamed')}
                          {p.admin_level && p.admin_level !== 'none' && <span style={{ fontSize: 9.5, fontWeight: 800, background: p.admin_level === 'super_admin' ? c.primary : c.gold, color: p.admin_level === 'super_admin' ? c.white : c.navy, padding: '2px 6px', borderRadius: 999, textTransform: 'uppercase' }}>{p.admin_level === 'super_admin' ? 'Super' : 'Admin'}</span>}
                          {p.trusted_network && <span style={{ fontSize: 9.5, fontWeight: 800, background: c.success, color: c.white, padding: '2px 6px', borderRadius: 999, textTransform: 'uppercase' }}>Trusted</span>}
                        </div>
                        <div style={{ fontSize: 11.5, color: c.textMuted }}>{p.email}{p.phone ? ` · ${p.phone}` : ''}{p.city ? ` · ${p.city}` : ''}{p.years_experience ? ` · ${p.years_experience}` : ''}{p.subscription_plan ? ` · ${p.subscription_plan}` : ''} · <span style={{ color: c.primary, fontWeight: 600 }}>Manage →</span></div>
                      </button>
                      <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
                        {p.role === 'worker' && (
                          <button onClick={() => adminToggleTrusted(p.id, !p.trusted_network)} style={{ padding: '5px 10px', fontSize: 11, fontWeight: 700, borderRadius: 8, cursor: 'pointer', border: `1.5px solid ${p.trusted_network ? c.success : c.border}`, background: p.trusted_network ? c.success : c.white, color: p.trusted_network ? c.white : c.text }}>{p.trusted_network ? 'Trusted ✓' : 'Add to Trusted'}</button>
                        )}
                        {isSuperAdmin && (
                          <select value={p.admin_level || 'none'} onChange={e => adminSetLevel(p.id, e.target.value)} style={{ padding: '5px 8px', fontSize: 11, fontWeight: 700, borderRadius: 8, border: `1.5px solid ${c.border}`, background: c.white, color: c.text, cursor: 'pointer' }}>
                            <option value="none">No admin</option>
                            <option value="admin">Admin</option>
                            <option value="super_admin">Super Admin</option>
                          </select>
                        )}
                      </div>
                    </div>
                  ))}
                  {current.type === 'jobs' && current.rows.filter(j => { const q = adminUserSearch.toLowerCase(); return !q || (j.title||'').toLowerCase().includes(q) || (j.center||'').toLowerCase().includes(q); }).map(j => (
                    <div key={j.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, padding: '10px 12px', background: c.white, border: `1px solid ${c.border}`, borderRadius: 10 }}>
                      <button onClick={() => openAdminJob(j)} style={{ minWidth: 0, textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', flex: 1, padding: 0 }}>
                        <div style={{ fontSize: 13.5, fontWeight: 700, color: c.navy }}>{j.title} {!j.active && <span style={{ fontSize: 10, color: c.coralDark, fontWeight: 700 }}>(inactive)</span>}</div>
                        <div style={{ fontSize: 11.5, color: c.textMuted }}>{j.center}{j.location ? ` · ${j.location}` : ''}{j.pay ? ` · ${j.pay}` : ''} · {formatRelativeTime(j.posted_at)} · <span style={{ color: c.primary, fontWeight: 600 }}>Manage →</span></div>
                      </button>
                      <button onClick={() => adminToggleJob(j.id, !j.active)} style={{ padding: '5px 10px', fontSize: 11, fontWeight: 700, borderRadius: 8, cursor: 'pointer', border: `1.5px solid ${j.active ? c.border : c.coral}`, background: j.active ? c.white : c.coralDark, color: j.active ? c.coralDark : c.white, flexShrink: 0 }}>{j.active ? 'Deactivate' : 'Reactivate'}</button>
                    </div>
                  ))}
                  {current.type === 'applications' && current.rows.map(a => {
                    const job = jobById[a.job_id]; const wk = profById[a.worker_id];
                    return (
                      <div key={a.id} style={{ padding: '10px 12px', background: c.white, border: `1px solid ${c.border}`, borderRadius: 10 }}>
                        <div style={{ fontSize: 13.5, fontWeight: 700, color: c.navy }}>{wk?.name || 'Teacher'} → {job?.title || 'a job'}</div>
                        <div style={{ fontSize: 11.5, color: c.textMuted }}>{job?.center || ''} · <span style={{ textTransform: 'capitalize' }}>{a.status}</span> · {formatRelativeTime(a.applied_at)}</div>
                      </div>
                    );
                  })}
                  {current.type === 'subs' && current.rows.map(s => (
                    <div key={s.id} style={{ padding: '10px 12px', background: c.white, border: `1px solid ${c.border}`, borderRadius: 10 }}>
                      <div style={{ fontSize: 13.5, fontWeight: 700, color: c.navy }}>{s.center_name || 'Center'} · {shiftDatesLabel(s)}</div>
                      <div style={{ fontSize: 11.5, color: c.textMuted }}>{[s.age_group, s.pay_rate].filter(Boolean).join(' · ')} · <span style={{ textTransform: 'capitalize' }}>{s.status}</span></div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* ===== DASHBOARD: clickable cards ===== */
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {visibleSections.map(s => (
                  <button key={s.key} onClick={() => { setAdminSection(s.key); setAdminUserSearch(''); }} style={{ textAlign: 'left', background: c.white, border: `1px solid ${c.border}`, borderRadius: 12, padding: 16, cursor: 'pointer' }} className="hover:border-blue-400 transition-all">
                    <div style={{ fontSize: 26, fontWeight: 800, color: c.primary, letterSpacing: '-0.02em' }}>{s.rows.length}</div>
                    <div style={{ fontSize: 11, color: c.textMuted, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginTop: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      {s.label} <ArrowRight size={12} />
                    </div>
                  </button>
                ))}
                {visibleSections.length === 0 && (
                  <div style={{ gridColumn: '1 / -1', padding: 30, textAlign: 'center', color: c.textMuted, fontSize: 13, background: c.white, border: `1px dashed ${c.border}`, borderRadius: 12 }}>No sections enabled for your role. Ask a Super Admin to grant access.</div>
                )}
              </div>
            )}
          </div>
          );
        })()}

        {tab === 'subs' && signedIn && userType === 'owner' && (
          <div>
            <div className="flex items-start justify-between mb-2 flex-wrap gap-3">
              <div>
                <h2 style={{ fontSize: 22, fontWeight: 800, color: c.navy, letterSpacing: '-0.02em', marginBottom: 3 }}>Sub Shifts</h2>
                <p style={{ color: c.textMuted, fontSize: 13 }}>Need a substitute fast? Post a shift and available teachers are notified instantly.</p>
              </div>
              <button onClick={openNewSubRequest} style={{ padding: '11px 18px', background: c.coralDark, color: c.white, border: 'none', borderRadius: 10, fontSize: 13.5, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Plus size={15} /> I Need a Sub Today
              </button>
            </div>
            <div className="space-y-3" style={{ marginTop: 16 }}>
              {ownerSubRequests.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 36, background: c.white, border: `1px dashed ${c.border}`, borderRadius: 12, color: c.textMuted, fontSize: 13.5 }}>
                  No sub requests yet. When a teacher calls out, tap <strong>“I Need a Sub Today”</strong> and we'll alert qualified, available teachers right away.
                </div>
              ) : ownerSubRequests.map(r => {
                const offers = subOffersByRequest[r.id] || [];
                return (
                  <div key={r.id} style={{ background: c.white, border: `1.5px solid ${r.status === 'filled' ? c.success : c.border}`, borderRadius: 12, padding: 16 }}>
                    <div className="flex items-start justify-between flex-wrap gap-2" style={{ marginBottom: 8 }}>
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 800, color: c.navy }}>{r.age_group || 'Classroom'} · {shiftDatesLabel(r)}</div>
                        <div style={{ fontSize: 12.5, color: c.textMuted, marginTop: 2 }}>
                          {[r.start_time && r.end_time ? `${r.start_time} – ${r.end_time}` : null, r.pay_rate, r.location].filter(Boolean).join(' · ')}
                        </div>
                        {r.notes && <div style={{ fontSize: 12.5, color: c.text, marginTop: 4, fontStyle: 'italic' }}>"{r.notes}"</div>}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span style={{ fontSize: 11, fontWeight: 800, padding: '4px 10px', borderRadius: 999, background: r.status === 'filled' ? c.success : (r.status === 'open' ? c.gold : c.border), color: r.status === 'filled' ? c.white : c.navy, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          {r.status === 'filled' ? 'Filled' : r.status}
                        </span>
                        {r.status === 'open' && (
                          <>
                            <button onClick={() => openEditSubRequest(r)} aria-label="Edit request" title="Edit" style={{ background: 'none', border: `1px solid ${c.border}`, borderRadius: 8, padding: '5px 9px', cursor: 'pointer', fontSize: 11.5, fontWeight: 700, color: c.primary, display: 'flex', alignItems: 'center', gap: 4 }}>Edit</button>
                            <button onClick={() => cancelSubRequest(r.id)} aria-label="Cancel request" title="Cancel" style={{ background: 'none', border: `1px solid ${c.border}`, borderRadius: 8, padding: '5px 9px', cursor: 'pointer', fontSize: 11.5, fontWeight: 700, color: c.coralDark }}>Cancel</button>
                          </>
                        )}
                      </div>
                    </div>
                    {r.status === 'open' && (
                      <div style={{ borderTop: `1px solid ${c.borderSoft}`, paddingTop: 10, marginTop: 6 }}>
                        <div style={{ fontSize: 11.5, fontWeight: 700, color: c.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
                          {offers.length === 0 ? 'Waiting for teachers to respond…' : `${offers.length} teacher${offers.length === 1 ? '' : 's'} available`}
                        </div>
                        {offers.map(o => (
                          <div key={o.id} className="flex items-center justify-between gap-2" style={{ padding: '8px 0' }}>
                            <div className="flex items-center gap-2.5">
                              <Avatar name={o.teacher?.name || '?'} photo={o.teacher?.photo_url} size={34} />
                              <div>
                                <div style={{ fontSize: 13, fontWeight: 700, color: c.navy }}>{o.teacher?.name || 'Teacher'}</div>
                                <div style={{ fontSize: 11.5, color: c.textMuted }}>{[o.teacher?.years_experience, o.teacher?.city, o.teacher?.bg_check].filter(Boolean).join(' · ')}</div>
                                {o.teacher?.sub_availability && (o.teacher.sub_availability.days?.length || o.teacher.sub_availability.from) && (
                                  <div style={{ fontSize: 11, color: c.primary, marginTop: 2 }}>
                                    Available: {[(o.teacher.sub_availability.days || []).join(', '), (o.teacher.sub_availability.from && o.teacher.sub_availability.until) ? `${o.teacher.sub_availability.from}–${o.teacher.sub_availability.until}` : ''].filter(Boolean).join(' · ')}
                                  </div>
                                )}
                              </div>
                            </div>
                            <button onClick={() => confirmSub(o.id, r.id, o.teacher_id)} style={{ padding: '8px 14px', background: c.primary, color: c.white, border: 'none', borderRadius: 8, fontSize: 12.5, fontWeight: 700, cursor: 'pointer', flexShrink: 0 }}>Confirm</button>
                          </div>
                        ))}
                      </div>
                    )}
                    {r.status === 'filled' && (
                      <div style={{ borderTop: `1px solid ${c.borderSoft}`, paddingTop: 10, marginTop: 6, fontSize: 12.5, color: c.success, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <CheckCircle2 size={14} /> Covered — the teacher has been notified.
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {tab === 'subs' && signedIn && userType === 'worker' && (
          <div>
            <div className="mb-3">
              <h2 style={{ fontSize: 22, fontWeight: 800, color: c.navy, letterSpacing: '-0.02em', marginBottom: 3 }}>Sub Shifts</h2>
              <p style={{ color: c.textMuted, fontSize: 13 }}>Pick up open substitute shifts at Georgia centers. Get paid, build your reputation, help a classroom stay open.</p>
            </div>
            <div style={{ background: availableForSub ? '#EAF6EE' : c.white, border: `1.5px solid ${availableForSub ? c.success : c.border}`, borderRadius: 12, padding: 16, marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 800, color: c.navy }}>Available for substitute shifts</div>
                <div style={{ fontSize: 12.5, color: c.textMuted, marginTop: 2 }}>{availableForSub ? "You're on the list — we'll email you when a shift opens up." : 'Turn this on to get notified when centers need a sub.'}</div>
              </div>
              <button onClick={toggleSubAvailability} style={{ flexShrink: 0, width: 52, height: 30, borderRadius: 999, background: availableForSub ? c.success : c.border, border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.2s' }}>
                <span style={{ position: 'absolute', top: 3, left: availableForSub ? 25 : 3, width: 24, height: 24, borderRadius: '50%', background: c.white, transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
              </button>
            </div>

            {/* Availability schedule — only relevant when toggled on */}
            {availableForSub && (
              <div style={{ background: c.white, border: `1.5px solid ${c.border}`, borderRadius: 12, padding: 16, marginBottom: 16 }}>
                <div style={{ fontSize: 13.5, fontWeight: 800, color: c.navy, marginBottom: 3 }}>My availability</div>
                <p style={{ fontSize: 12, color: c.textMuted, marginBottom: 12 }}>Let centers know which days and hours you can pick up shifts.</p>
                <div style={{ marginBottom: 12 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: c.text, marginBottom: 6 }}>Days available</label>
                  <div className="flex flex-wrap gap-1.5">
                    {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d => {
                      const on = subSchedule.days.includes(d);
                      return (
                        <button key={d} onClick={() => toggleSubDay(d)} style={{ padding: '7px 12px', background: on ? c.primary : c.white, color: on ? c.white : c.text, border: `1.5px solid ${on ? c.primary : c.border}`, borderRadius: 999, fontSize: 12.5, fontWeight: 700, cursor: 'pointer' }}>{d}</button>
                      );
                    })}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2" style={{ marginBottom: 12 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: c.text, marginBottom: 4 }}>Available from</label>
                    <input value={subSchedule.from} onChange={e => setSubSchedule({ ...subSchedule, from: e.target.value })} placeholder="7:00am" style={{ width: '100%', padding: '9px 11px', fontSize: 13, border: `1.5px solid ${c.border}`, borderRadius: 9, background: c.white, color: c.text, outline: 'none' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: c.text, marginBottom: 4 }}>Until</label>
                    <input value={subSchedule.until} onChange={e => setSubSchedule({ ...subSchedule, until: e.target.value })} placeholder="6:00pm" style={{ width: '100%', padding: '9px 11px', fontSize: 13, border: `1.5px solid ${c.border}`, borderRadius: 9, background: c.white, color: c.text, outline: 'none' }} />
                  </div>
                </div>
                <div style={{ marginBottom: 12 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: c.text, marginBottom: 4 }}>Notes (optional)</label>
                  <input value={subSchedule.note} onChange={e => setSubSchedule({ ...subSchedule, note: e.target.value })} placeholder="e.g. Prefer toddler rooms; can travel up to 20 min" style={{ width: '100%', padding: '9px 11px', fontSize: 13, border: `1.5px solid ${c.border}`, borderRadius: 9, background: c.white, color: c.text, outline: 'none' }} />
                </div>
                <button onClick={saveSubSchedule} style={{ padding: '10px 16px', background: c.primary, color: c.white, border: 'none', borderRadius: 9, fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Check size={14} /> Save Availability
                </button>
              </div>
            )}
            <div className="space-y-3">
              {openSubRequests.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 36, background: c.white, border: `1px dashed ${c.border}`, borderRadius: 12, color: c.textMuted, fontSize: 13.5 }}>
                  No open sub shifts right now. Keep your availability on and we'll email you the moment a center needs coverage.
                </div>
              ) : openSubRequests.map(r => {
                const offered = myOfferRequestIds.includes(r.id);
                return (
                  <div key={r.id} style={{ background: c.white, border: `1.5px solid ${c.border}`, borderRadius: 12, padding: 16 }}>
                    <div className="flex items-start justify-between flex-wrap gap-2">
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 800, color: c.navy }}>{r.center_name || 'A Georgia center'}</div>
                        <div style={{ fontSize: 12.5, color: c.textMuted, marginTop: 3 }} className="space-y-0.5">
                          <div className="flex items-center gap-1.5"><Calendar size={12} color={c.primary} /> {shiftDatesLabel(r)}{r.start_time && r.end_time ? ` · ${r.start_time} – ${r.end_time}` : ''}</div>
                          {r.age_group && <div className="flex items-center gap-1.5"><Users size={12} color={c.primary} /> {r.age_group}</div>}
                          {r.pay_rate && <div className="flex items-center gap-1.5"><DollarSign size={12} color={c.primary} /> {r.pay_rate}</div>}
                          {r.location && <div className="flex items-center gap-1.5"><MapPin size={12} color={c.primary} /> {r.location}</div>}
                        </div>
                        {r.notes && <div style={{ fontSize: 12.5, color: c.text, marginTop: 6, fontStyle: 'italic' }}>"{r.notes}"</div>}
                      </div>
                      {offered ? (
                        <span style={{ fontSize: 12, fontWeight: 700, color: c.success, display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}><CheckCircle2 size={14} /> Offer sent</span>
                      ) : (
                        <button onClick={() => offerToCover(r.id)} style={{ padding: '9px 15px', background: c.primary, color: c.white, border: 'none', borderRadius: 9, fontSize: 12.5, fontWeight: 700, cursor: 'pointer', flexShrink: 0 }}>I can cover this</button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {tab === 'myCenter' && signedIn && userType === 'owner' && (
          <div style={{ maxWidth: 640 }}>
            <div className="mb-4">
              <h2 style={{ fontSize: 22, fontWeight: 800, color: c.navy, letterSpacing: '-0.02em', marginBottom: 3 }}>My Center</h2>
              <p style={{ color: c.textMuted, fontSize: 13 }}>This information helps teachers learn about your center. It appears on your job posts and profile.</p>
            </div>
            <div style={{ background: c.white, border: `1px solid ${c.border}`, borderRadius: 14, padding: 20 }} className="space-y-4">
              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: c.text, marginBottom: 5 }}>Business name</label>
                <input value={signup.center} onChange={e => setSignup({ ...signup, center: e.target.value })} placeholder="Little Leaders Academy" style={{ width: '100%', padding: '10px 12px', fontSize: 13.5, border: `1.5px solid ${c.border}`, borderRadius: 9, background: c.white, color: c.text, outline: 'none' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: c.text, marginBottom: 5 }}>Address</label>
                <input value={centerProfile.address} onChange={e => setCenterProfile({ ...centerProfile, address: e.target.value })} placeholder="123 Main St, Atlanta, GA 30301" style={{ width: '100%', padding: '10px 12px', fontSize: 13.5, border: `1.5px solid ${c.border}`, borderRadius: 9, background: c.white, color: c.text, outline: 'none' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: c.text, marginBottom: 5 }}>Phone number</label>
                <input value={signup.phone} onChange={e => setSignup({ ...signup, phone: e.target.value })} placeholder="(404) 555-0100" style={{ width: '100%', padding: '10px 12px', fontSize: 13.5, border: `1.5px solid ${c.border}`, borderRadius: 9, background: c.white, color: c.text, outline: 'none' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: c.text, marginBottom: 5 }}>Hours of operation</label>
                <input value={centerProfile.hours} onChange={e => setCenterProfile({ ...centerProfile, hours: e.target.value })} placeholder="Mon–Fri, 6:30am – 6:30pm" style={{ width: '100%', padding: '10px 12px', fontSize: 13.5, border: `1.5px solid ${c.border}`, borderRadius: 9, background: c.white, color: c.text, outline: 'none' }} />
              </div>
              <div style={{ borderTop: `1px solid ${c.border}`, paddingTop: 16 }}>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: c.text, marginBottom: 8 }}>Are you Quality Rated?</label>
                <div className="flex gap-2" style={{ marginBottom: centerProfile.qualityRated ? 14 : 0 }}>
                  <button onClick={() => setCenterProfile({ ...centerProfile, qualityRated: true })} style={{ flex: 1, padding: '10px', background: centerProfile.qualityRated ? c.primary : c.white, color: centerProfile.qualityRated ? c.white : c.text, border: `1.5px solid ${centerProfile.qualityRated ? c.primary : c.border}`, borderRadius: 9, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Yes</button>
                  <button onClick={() => setCenterProfile({ ...centerProfile, qualityRated: false, qualityRatedStars: 0 })} style={{ flex: 1, padding: '10px', background: !centerProfile.qualityRated ? c.primary : c.white, color: !centerProfile.qualityRated ? c.white : c.text, border: `1.5px solid ${!centerProfile.qualityRated ? c.primary : c.border}`, borderRadius: 9, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>No / Not yet</button>
                </div>
                {centerProfile.qualityRated && (
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: c.textMuted, marginBottom: 6 }}>How many stars? (Georgia Quality Rated is 1–3 stars)</label>
                    <div className="flex gap-2">
                      {[1, 2, 3].map(n => (
                        <button key={n} onClick={() => setCenterProfile({ ...centerProfile, qualityRatedStars: n })} style={{ flex: 1, padding: '10px', background: centerProfile.qualityRatedStars === n ? c.gold : c.white, color: centerProfile.qualityRatedStars === n ? c.navy : c.text, border: `1.5px solid ${centerProfile.qualityRatedStars === n ? c.gold : c.border}`, borderRadius: 9, fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                          {n} <Star size={12} fill={centerProfile.qualityRatedStars === n ? c.navy : 'transparent'} color={centerProfile.qualityRatedStars === n ? c.navy : c.textMuted} />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <button onClick={saveCenterProfile} style={{ width: '100%', padding: '12px', background: c.primary, color: c.white, border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <Check size={15} /> Save Center Profile
              </button>
            </div>
          </div>
        )}

        {tab === 'myProfile' && signedIn && userType === 'worker' && (
          <div>
            <div className="flex items-start justify-between mb-4 flex-wrap gap-3">
              <div>
                <h2 style={{ fontSize: 22, fontWeight: 800, color: c.navy, letterSpacing: '-0.02em', marginBottom: 3 }}>My Profile</h2>
                <p style={{ color: c.textMuted, fontSize: 13 }}>Update your info anytime. Changes save automatically.</p>
              </div>
              <div style={{ fontSize: 11, color: c.success, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}><Check size={12} /> Auto saving</div>
            </div>

            {/* Professional Readiness Score */}
            <div style={{ marginBottom: 16 }}>
              <ReadinessScoreCard profile={profile} history={myWorkerHistory || {}} mode="worker" />
            </div>

            {/* References + Training Certificates — the two components that
                replace 'Positive Employer Reviews' in the score (15 pts
                total: 7 + 8). Verified Identity was removed for privacy. */}
            <div className="grid lg:grid-cols-2 gap-3" style={{ marginBottom: 16 }}>
              {/* Professional References */}
              <div style={{ background: c.white, border: `1px solid ${c.border}`, borderRadius: 14, padding: 16 }}>
                <div className="flex items-center justify-between" style={{ marginBottom: 4 }}>
                  <div style={{ fontSize: 11, color: c.textMuted, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Professional References</div>
                  <span style={{ fontSize: 11, color: c.primary, fontWeight: 700 }}>+7 score</span>
                </div>
                <p style={{ fontSize: 12, color: c.textMuted, marginBottom: 10, lineHeight: 1.4 }}>Add up to 3 past employers or colleagues. Centers contact them off-platform.</p>
                <div className="space-y-2">
                  {(profile.references || []).map((r, i) => (
                    <div key={i} style={{ background: c.cream, borderRadius: 8, padding: 9 }}>
                      <input value={r.name} onChange={e => updateReference(i, 'name', e.target.value)} placeholder="Name" style={{ width: '100%', padding: '6px 9px', fontSize: 12, border: `1px solid ${c.border}`, borderRadius: 6, background: c.white, marginBottom: 4 }} />
                      <input value={r.relationship} onChange={e => updateReference(i, 'relationship', e.target.value)} placeholder="Relationship (e.g., Center Director)" style={{ width: '100%', padding: '6px 9px', fontSize: 12, border: `1px solid ${c.border}`, borderRadius: 6, background: c.white, marginBottom: 4 }} />
                      <input value={r.phone} onChange={e => updateReference(i, 'phone', e.target.value)} placeholder="Phone" style={{ width: '100%', padding: '6px 9px', fontSize: 12, border: `1px solid ${c.border}`, borderRadius: 6, background: c.white, marginBottom: 4 }} />
                      <input value={r.email} onChange={e => updateReference(i, 'email', e.target.value)} placeholder="Email (optional)" style={{ width: '100%', padding: '6px 9px', fontSize: 12, border: `1px solid ${c.border}`, borderRadius: 6, background: c.white, marginBottom: 4 }} />
                      <button onClick={() => removeReference(i)} style={{ fontSize: 11, color: c.coralDark, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, padding: 0 }}>Remove</button>
                    </div>
                  ))}
                  <button onClick={addReference} style={{ width: '100%', padding: '8px', background: c.paleBlue, color: c.primary, border: `1px dashed ${c.primary}`, borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                    <Plus size={12} /> Add Reference
                  </button>
                </div>
              </div>

              {/* Training Certificates */}
              <div style={{ background: c.white, border: `1px solid ${c.border}`, borderRadius: 14, padding: 16 }}>
                <div className="flex items-center justify-between" style={{ marginBottom: 4 }}>
                  <div style={{ fontSize: 11, color: c.textMuted, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Training Certificates</div>
                  <span style={{ fontSize: 11, color: c.primary, fontWeight: 700 }}>+8 score</span>
                </div>
                <p style={{ fontSize: 12, color: c.textMuted, marginBottom: 10, lineHeight: 1.4 }}>Upload GELDS, preservice, CEU, or any childcare training certificates you've earned.</p>
                <div className="space-y-2">
                  {(profile.trainingCertificates || []).map((cert, i) => (
                    <div key={i} style={{ background: c.cream, borderRadius: 8, padding: 9 }}>
                      <input value={cert.name} onChange={e => updateTrainingCert(i, 'name', e.target.value)} placeholder="Training name" style={{ width: '100%', padding: '6px 9px', fontSize: 12, border: `1px solid ${c.border}`, borderRadius: 6, background: c.white, marginBottom: 4 }} />
                      <div className="flex gap-1.5" style={{ marginBottom: 4 }}>
                        <input value={cert.hours} onChange={e => updateTrainingCert(i, 'hours', e.target.value)} placeholder="Hours" style={{ flex: 1, padding: '6px 9px', fontSize: 12, border: `1px solid ${c.border}`, borderRadius: 6, background: c.white }} />
                        <input value={cert.issued_at} onChange={e => updateTrainingCert(i, 'issued_at', e.target.value)} placeholder="MM/YYYY" style={{ flex: 1, padding: '6px 9px', fontSize: 12, border: `1px solid ${c.border}`, borderRadius: 6, background: c.white }} />
                      </div>
                      <div className="flex items-center justify-between gap-2" style={{ fontSize: 11 }}>
                        {cert.file_url ? <a href={cert.file_url} target="_blank" rel="noopener noreferrer" style={{ color: c.primary, fontWeight: 600 }}>View certificate</a> : <span style={{ color: c.textMuted }}>{cert.file_name || 'No file'}</span>}
                        <button onClick={() => removeTrainingCert(i)} style={{ color: c.coralDark, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Remove</button>
                      </div>
                    </div>
                  ))}
                  <label style={{ display: 'block', cursor: 'pointer' }}>
                    <input type="file" accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx" multiple onChange={handleTrainingCertUpload} style={{ display: 'none' }} />
                    <div style={{ width: '100%', padding: '8px', background: c.paleBlue, color: c.primary, border: `1px dashed ${c.primary}`, borderRadius: 8, fontSize: 12, fontWeight: 700, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                      <Upload size={12} /> {uploading.cred ? 'Uploading...' : 'Upload Certificate'}
                    </div>
                  </label>
                </div>
              </div>

            </div>

            {/* Reviews from centers you've worked with — currently hidden
                from the UI but the code is retained so it can be flipped
                back on once cross-center reviewing becomes valuable. */}
            {false && myWorkerReviews.length > 0 && (
              <div style={{ background: c.white, border: `1px solid ${c.border}`, borderRadius: 14, padding: 18, marginBottom: 16 }}>
                <div className="flex items-center justify-between flex-wrap gap-2" style={{ marginBottom: 14 }}>
                  <div>
                    <div style={{ fontSize: 11, color: c.textMuted, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Reviews from centers</div>
                    <div className="flex items-center gap-2" style={{ marginTop: 4 }}>
                      {myWorkerHistory && myWorkerHistory.totalReviews > 0 && (
                        <>
                          <StarRating value={Math.round(myWorkerHistory.avgRating || 0)} size={18} interactive={false} />
                          <span style={{ fontSize: 18, fontWeight: 800, color: c.navy }}>{(myWorkerHistory.avgRating || 0).toFixed(1)}</span>
                          <span style={{ fontSize: 12, color: c.textMuted }}>· {myWorkerHistory.totalReviews} review{myWorkerHistory.totalReviews === 1 ? '' : 's'}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  {myWorkerReviews.slice(0, 5).map(r => (
                    <div key={r.id} style={{ padding: 12, background: c.cream, borderRadius: 9 }}>
                      <div className="flex items-center justify-between gap-2 flex-wrap" style={{ marginBottom: 5 }}>
                        <StarRating value={r.rating} size={14} interactive={false} />
                        <span style={{ fontSize: 11, color: c.textMuted, fontWeight: 600 }}>{r.ownerName} · {formatRelativeTime(r.created_at)}</span>
                      </div>
                      {r.comment && <p style={{ fontSize: 12.5, color: c.text, lineHeight: 1.5, fontStyle: 'italic' }}>"{r.comment}"</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

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

      {/* ADMIN USER DETAIL */}
      {adminViewUser && adminUserEdit && (
        <Modal onClose={() => setAdminViewUser(null)} wide>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: c.navy }}>Manage User</h3>
              <div style={{ fontSize: 12, color: c.textMuted }}>{adminViewUser.email} · <span style={{ textTransform: 'capitalize' }}>{adminViewUser.role}</span></div>
            </div>
          </div>

          {/* Editable profile */}
          <div style={{ fontSize: 11, fontWeight: 700, color: c.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Profile</div>
          <div className="grid sm:grid-cols-2 gap-2" style={{ marginBottom: 8 }}>
            <div><label style={{ fontSize: 11.5, fontWeight: 600, color: c.text }}>{adminViewUser.role === 'owner' ? 'Contact name' : 'Name'}</label><input value={adminUserEdit.name} onChange={e => setAdminUserEdit({ ...adminUserEdit, name: e.target.value })} style={{ width: '100%', padding: '8px 10px', fontSize: 13, border: `1.5px solid ${c.border}`, borderRadius: 8, outline: 'none', background: c.white, color: c.text }} /></div>
            <div><label style={{ fontSize: 11.5, fontWeight: 600, color: c.text }}>Phone</label><input value={adminUserEdit.phone} onChange={e => setAdminUserEdit({ ...adminUserEdit, phone: e.target.value })} style={{ width: '100%', padding: '8px 10px', fontSize: 13, border: `1.5px solid ${c.border}`, borderRadius: 8, outline: 'none', background: c.white, color: c.text }} /></div>
            {adminViewUser.role === 'owner' && <div className="sm:col-span-2"><label style={{ fontSize: 11.5, fontWeight: 600, color: c.text }}>Center name</label><input value={adminUserEdit.center} onChange={e => setAdminUserEdit({ ...adminUserEdit, center: e.target.value })} style={{ width: '100%', padding: '8px 10px', fontSize: 13, border: `1.5px solid ${c.border}`, borderRadius: 8, outline: 'none', background: c.white, color: c.text }} /></div>}
            <div><label style={{ fontSize: 11.5, fontWeight: 600, color: c.text }}>City</label><input value={adminUserEdit.city} onChange={e => setAdminUserEdit({ ...adminUserEdit, city: e.target.value })} style={{ width: '100%', padding: '8px 10px', fontSize: 13, border: `1.5px solid ${c.border}`, borderRadius: 8, outline: 'none', background: c.white, color: c.text }} /></div>
            <div><label style={{ fontSize: 11.5, fontWeight: 600, color: c.text }}>Zip</label><input value={adminUserEdit.zip} onChange={e => setAdminUserEdit({ ...adminUserEdit, zip: e.target.value })} style={{ width: '100%', padding: '8px 10px', fontSize: 13, border: `1.5px solid ${c.border}`, borderRadius: 8, outline: 'none', background: c.white, color: c.text }} /></div>
            {adminViewUser.role === 'worker' && <>
              <div><label style={{ fontSize: 11.5, fontWeight: 600, color: c.text }}>Years experience</label><input value={adminUserEdit.years_experience} onChange={e => setAdminUserEdit({ ...adminUserEdit, years_experience: e.target.value })} style={{ width: '100%', padding: '8px 10px', fontSize: 13, border: `1.5px solid ${c.border}`, borderRadius: 8, outline: 'none', background: c.white, color: c.text }} /></div>
              <div><label style={{ fontSize: 11.5, fontWeight: 600, color: c.text }}>Background check</label><input value={adminUserEdit.bg_check} onChange={e => setAdminUserEdit({ ...adminUserEdit, bg_check: e.target.value })} style={{ width: '100%', padding: '8px 10px', fontSize: 13, border: `1.5px solid ${c.border}`, borderRadius: 8, outline: 'none', background: c.white, color: c.text }} /></div>
            </>}
          </div>
          <button onClick={saveAdminUser} style={{ padding: '9px 16px', background: c.primary, color: c.white, border: 'none', borderRadius: 9, fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 16 }}><Check size={14} /> Save Profile</button>

          {/* Support conversation */}
          <div style={{ borderTop: `1px solid ${c.border}`, paddingTop: 14, marginBottom: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: c.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Support Conversation</div>
            <div style={{ maxHeight: 180, overflowY: 'auto', background: c.cream, borderRadius: 9, padding: 10, marginBottom: 8 }}>
              {adminUserThread.length === 0 ? <div style={{ fontSize: 12.5, color: c.textMuted, textAlign: 'center', padding: 8 }}>No messages yet.</div> :
                adminUserThread.map(m => (
                  <div key={m.id} style={{ display: 'flex', justifyContent: m.is_from_admin ? 'flex-end' : 'flex-start', marginBottom: 6 }}>
                    <div style={{ maxWidth: '80%', padding: '7px 11px', borderRadius: 12, fontSize: 12.5, background: m.is_from_admin ? c.primary : c.white, color: m.is_from_admin ? c.white : c.text, border: m.is_from_admin ? 'none' : `1px solid ${c.border}` }}>{m.body}</div>
                  </div>
                ))}
            </div>
            <div className="flex gap-2">
              <input value={adminMsgDraft} onChange={e => setAdminMsgDraft(e.target.value)} onKeyDown={e => e.key === 'Enter' && adminSendMessage()} placeholder="Message this user…" style={{ flex: 1, padding: '9px 11px', fontSize: 13, border: `1.5px solid ${c.border}`, borderRadius: 9, outline: 'none', background: c.white, color: c.text }} />
              <button onClick={adminSendMessage} style={{ padding: '9px 14px', background: c.primary, color: c.white, border: 'none', borderRadius: 9, fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}><Send size={13} /> Send</button>
            </div>
          </div>

          {/* Account actions */}
          <div style={{ borderTop: `1px solid ${c.border}`, paddingTop: 14, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button onClick={adminSendResetLink} style={{ padding: '9px 14px', background: c.white, color: c.primary, border: `1.5px solid ${c.primary}`, borderRadius: 9, fontSize: 12.5, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}><KeyRound size={13} /> Send Password Reset Link</button>
            {isSuperAdmin && (
              <button onClick={adminDeleteUser} style={{ padding: '9px 14px', background: c.coralDark, color: c.white, border: 'none', borderRadius: 9, fontSize: 12.5, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}><Trash2 size={13} /> Delete Account</button>
            )}
          </div>
        </Modal>
      )}

      {/* ADMIN JOB DETAIL */}
      {adminViewJob && adminJobEdit && (
        <Modal onClose={() => setAdminViewJob(null)}>
          <div className="flex items-center justify-between mb-3">
            <h3 style={{ fontSize: 18, fontWeight: 800, color: c.navy }}>Manage Job</h3>
          </div>
          <div className="space-y-2" style={{ marginBottom: 14 }}>
            <div><label style={{ fontSize: 11.5, fontWeight: 600, color: c.text }}>Title</label><input value={adminJobEdit.title} onChange={e => setAdminJobEdit({ ...adminJobEdit, title: e.target.value })} style={{ width: '100%', padding: '9px 11px', fontSize: 13, border: `1.5px solid ${c.border}`, borderRadius: 8, outline: 'none', background: c.white, color: c.text }} /></div>
            <div className="grid grid-cols-2 gap-2">
              <div><label style={{ fontSize: 11.5, fontWeight: 600, color: c.text }}>Pay</label><input value={adminJobEdit.pay} onChange={e => setAdminJobEdit({ ...adminJobEdit, pay: e.target.value })} style={{ width: '100%', padding: '9px 11px', fontSize: 13, border: `1.5px solid ${c.border}`, borderRadius: 8, outline: 'none', background: c.white, color: c.text }} /></div>
              <div><label style={{ fontSize: 11.5, fontWeight: 600, color: c.text }}>Type</label><input value={adminJobEdit.type} onChange={e => setAdminJobEdit({ ...adminJobEdit, type: e.target.value })} style={{ width: '100%', padding: '9px 11px', fontSize: 13, border: `1.5px solid ${c.border}`, borderRadius: 8, outline: 'none', background: c.white, color: c.text }} /></div>
            </div>
            <div><label style={{ fontSize: 11.5, fontWeight: 600, color: c.text }}>Location</label><input value={adminJobEdit.location} onChange={e => setAdminJobEdit({ ...adminJobEdit, location: e.target.value })} style={{ width: '100%', padding: '9px 11px', fontSize: 13, border: `1.5px solid ${c.border}`, borderRadius: 8, outline: 'none', background: c.white, color: c.text }} /></div>
            <div><label style={{ fontSize: 11.5, fontWeight: 600, color: c.text }}>Description</label><textarea value={adminJobEdit.description} onChange={e => setAdminJobEdit({ ...adminJobEdit, description: e.target.value })} rows={3} style={{ width: '100%', padding: '9px 11px', fontSize: 13, border: `1.5px solid ${c.border}`, borderRadius: 8, outline: 'none', background: c.white, color: c.text, resize: 'vertical', fontFamily: 'inherit' }} /></div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button onClick={saveAdminJob} style={{ padding: '9px 16px', background: c.primary, color: c.white, border: 'none', borderRadius: 9, fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}><Check size={14} /> Save</button>
            <button onClick={adminMessageJobCreator} style={{ padding: '9px 16px', background: c.white, color: c.primary, border: `1.5px solid ${c.primary}`, borderRadius: 9, fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}><Mail size={13} /> Message Creator</button>
            <button onClick={adminDeleteJob} style={{ padding: '9px 16px', background: c.coralDark, color: c.white, border: 'none', borderRadius: 9, fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}><Trash2 size={13} /> Delete Job</button>
          </div>
        </Modal>
      )}

      {/* ROLE PERMISSIONS — super admin controls which sections Admins see */}
      {showRolePerms && isSuperAdmin && (
        <Modal onClose={() => setShowRolePerms(false)}>
          <div className="flex items-center justify-between mb-2">
            <h3 style={{ fontSize: 18, fontWeight: 800, color: c.navy }}>Admin Role Permissions</h3>
          </div>
          <p style={{ fontSize: 13, color: c.textMuted, marginBottom: 16, lineHeight: 1.5 }}>Choose which sections the <strong>Admin</strong> role can see on their dashboard. Super Admins always see everything.</p>
          <div className="space-y-1.5" style={{ marginBottom: 16 }}>
            {[
              { key: 'teachers', label: 'Teachers' },
              { key: 'centers', label: 'Centers' },
              { key: 'jobs', label: 'Jobs Posted' },
              { key: 'applications', label: 'Applications' },
              { key: 'partners', label: 'Partners' },
              { key: 'sub_requests', label: 'Sub Requests' },
              { key: 'trusted_teachers', label: 'Trusted Teachers' },
              { key: 'sub_shifts', label: 'Open Sub Shifts' },
            ].map(s => {
              const on = adminAllowedSections.includes(s.key);
              return (
                <button key={s.key} onClick={() => toggleAllowedSection(s.key)} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 14px', background: on ? '#EAF6EE' : c.white, border: `1.5px solid ${on ? c.success : c.border}`, borderRadius: 10, cursor: 'pointer' }}>
                  <span style={{ fontSize: 13.5, fontWeight: 700, color: c.navy }}>{s.label}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: on ? c.success : c.textMuted }}>{on ? 'Allowed ✓' : 'Hidden'}</span>
                </button>
              );
            })}
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={() => setShowRolePerms(false)} style={{ padding: '10px 18px', background: c.white, color: c.text, border: `1.5px solid ${c.border}`, borderRadius: 9, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
            <button onClick={saveRolePerms} style={{ padding: '10px 18px', background: c.primary, color: c.white, border: 'none', borderRadius: 9, fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}><Check size={14} /> Save Permissions</button>
          </div>
        </Modal>
      )}

      {/* POST SUB REQUEST */}
      {showSubRequest && (
        <Modal onClose={() => setShowSubRequest(false)}>
          <div className="flex items-center justify-between mb-1">
            <h3 style={{ fontSize: 19, fontWeight: 800, color: c.navy }}>{editingSubId ? 'Edit Sub Request' : 'Request a Substitute'}</h3>
          </div>
          <p style={{ fontSize: 12.5, color: c.textMuted, marginBottom: 16, lineHeight: 1.5 }}>{editingSubId ? 'Update the details below and save your changes.' : 'Available teachers get notified instantly. The first you confirm gets the shift.'}</p>
          <div className="space-y-3">
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: c.text, marginBottom: 4 }}>Which day(s) do you need covered?</label>
              <div className="flex gap-2">
                <input type="date" value={subForm.dateInput} onChange={e => setSubForm({ ...subForm, dateInput: e.target.value })} style={{ flex: 1, padding: '9px 11px', fontSize: 13, border: `1.5px solid ${c.border}`, borderRadius: 9, background: c.white, color: c.text, outline: 'none' }} />
                <button
                  onClick={() => { if (subForm.dateInput && !subForm.dates.includes(subForm.dateInput)) setSubForm({ ...subForm, dates: [...subForm.dates, subForm.dateInput], dateInput: '' }); }}
                  style={{ padding: '9px 16px', background: c.primary, color: c.white, border: 'none', borderRadius: 9, fontSize: 13, fontWeight: 700, cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 4 }}
                >
                  <Plus size={14} /> Add day
                </button>
              </div>
              {subForm.dates.length > 0 && (
                <div className="flex flex-wrap gap-1.5" style={{ marginTop: 8 }}>
                  {[...subForm.dates].sort().map(d => (
                    <span key={d} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 10px', background: c.paleBlue, color: c.primaryDark, borderRadius: 999, fontSize: 12, fontWeight: 600 }}>
                      {formatShiftDate(d)}
                      <button onClick={() => setSubForm({ ...subForm, dates: subForm.dates.filter(x => x !== d) })} aria-label="Remove" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: c.primary, display: 'flex' }}><X size={12} /></button>
                    </span>
                  ))}
                </div>
              )}
              <p style={{ fontSize: 11, color: c.textMuted, marginTop: 6 }}>Add each day you need a sub. One teacher can cover the whole request — perfect for a multi-day absence.</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: c.text, marginBottom: 4 }}>Age group</label>
                <select value={subForm.age_group} onChange={e => setSubForm({ ...subForm, age_group: e.target.value })} style={{ width: '100%', padding: '9px 11px', fontSize: 13, border: `1.5px solid ${c.border}`, borderRadius: 9, background: c.white, color: c.text, outline: 'none' }}>
                  {['Infant','Toddler','Preschool','Pre-K','School Age','Any'].map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: c.text, marginBottom: 4 }}>Pay rate</label>
                <input value={subForm.pay_rate} onChange={e => setSubForm({ ...subForm, pay_rate: e.target.value })} placeholder="$16 / hr" style={{ width: '100%', padding: '9px 11px', fontSize: 13, border: `1.5px solid ${c.border}`, borderRadius: 9, background: c.white, color: c.text, outline: 'none' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: c.text, marginBottom: 4 }}>Start time</label>
                <input value={subForm.start_time} onChange={e => setSubForm({ ...subForm, start_time: e.target.value })} placeholder="7:00am" style={{ width: '100%', padding: '9px 11px', fontSize: 13, border: `1.5px solid ${c.border}`, borderRadius: 9, background: c.white, color: c.text, outline: 'none' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: c.text, marginBottom: 4 }}>End time</label>
                <input value={subForm.end_time} onChange={e => setSubForm({ ...subForm, end_time: e.target.value })} placeholder="3:00pm" style={{ width: '100%', padding: '9px 11px', fontSize: 13, border: `1.5px solid ${c.border}`, borderRadius: 9, background: c.white, color: c.text, outline: 'none' }} />
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: c.text, marginBottom: 4 }}>Location</label>
              <input value={subForm.location} onChange={e => setSubForm({ ...subForm, location: e.target.value })} placeholder={centerProfile.address || 'Center address'} style={{ width: '100%', padding: '9px 11px', fontSize: 13, border: `1.5px solid ${c.border}`, borderRadius: 9, background: c.white, color: c.text, outline: 'none' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: c.text, marginBottom: 4 }}>Notes (optional)</label>
              <textarea value={subForm.notes} onChange={e => setSubForm({ ...subForm, notes: e.target.value })} rows={2} placeholder="e.g. Lead teacher out sick, need coverage for the toddler room." style={{ width: '100%', padding: '9px 11px', fontSize: 13, border: `1.5px solid ${c.border}`, borderRadius: 9, background: c.white, color: c.text, outline: 'none', resize: 'vertical', fontFamily: 'inherit' }} />
            </div>
            <button onClick={postSubRequest} style={{ width: '100%', padding: '12px', background: c.coralDark, color: c.white, border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <Send size={14} /> {editingSubId ? 'Save Changes' : 'Send to Available Teachers'}
            </button>
          </div>
        </Modal>
      )}

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
      {/* Leave Review modal */}
      {showLeaveReview && viewingApplicantDetail && (
        <Modal onClose={() => setShowLeaveReview(false)}>
          <div className="flex items-center justify-between mb-3">
            <h3 style={{ fontSize: 18, fontWeight: 800, color: c.navy }}>Leave a Review</h3>
          </div>
          <p style={{ fontSize: 13, color: c.textMuted, marginBottom: 16, lineHeight: 1.5 }}>
            How was your experience working with <strong>{viewingApplicantDetail.name}</strong>? Your honest feedback helps other centers identify reliable teachers and helps great teachers stand out.
          </p>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: c.text, marginBottom: 7 }}>Rating</label>
            <StarRating
              value={reviewDraft.rating}
              size={28}
              onChange={(n) => setReviewDraft({ ...reviewDraft, rating: n })}
            />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: c.text, marginBottom: 7 }}>Comment (optional)</label>
            <textarea
              value={reviewDraft.comment}
              onChange={e => setReviewDraft({ ...reviewDraft, comment: e.target.value })}
              placeholder="What stood out? Reliability, attitude with children, communication..."
              rows={4}
              maxLength={500}
              style={{ width: '100%', padding: '10px 12px', fontSize: 13, border: `1.5px solid ${c.border}`, borderRadius: 9, background: c.white, color: c.text, outline: 'none', resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.5 }}
            />
            <div style={{ fontSize: 11, color: c.textMuted, textAlign: 'right', marginTop: 4 }}>{reviewDraft.comment.length} / 500</div>
          </div>
          {reviewError && (
            <div style={{ background: '#FEF2F2', border: `1px solid ${c.coral}`, color: c.coralDark, padding: '10px 13px', borderRadius: 8, fontSize: 13, marginBottom: 14, display: 'flex', alignItems: 'flex-start', gap: 8 }}>
              <AlertCircle size={14} style={{ flexShrink: 0, marginTop: 1 }} />{reviewError}
            </div>
          )}
          <div className="flex gap-2 justify-end">
            <button onClick={() => setShowLeaveReview(false)} style={{ padding: '10px 18px', background: c.white, color: c.text, border: `1.5px solid ${c.border}`, borderRadius: 9, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
            <button onClick={submitReview} style={{ padding: '10px 18px', background: c.primary, color: c.white, border: 'none', borderRadius: 9, fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}><Send size={13} /> Submit Review</button>
          </div>
        </Modal>
      )}

      {/* Saved Candidates modal */}
      {showSavedCandidates && (
        <Modal onClose={() => setShowSavedCandidates(false)} wide>
          <div className="flex items-center justify-between mb-3">
            <h3 style={{ fontSize: 19, fontWeight: 800, color: c.navy }}>Saved Candidates</h3>
          </div>
          <p style={{ fontSize: 12.5, color: c.textMuted, marginBottom: 14 }}>{savedCandidatesFull.length} saved across all your job posts. Tap the heart to remove.</p>
          {savedCandidatesFull.length === 0 ? (
            <div style={{ padding: 36, textAlign: 'center', background: c.cream, borderRadius: 10 }}>
              <Heart size={24} color={c.textMuted} style={{ margin: '0 auto 8px' }} />
              <p style={{ fontSize: 13, color: c.textMuted }}>No saved candidates yet. Tap the heart on any applicant card to save them here.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {savedCandidatesFull.map((p) => {
                const candidateUi = {
                  userId: p.id,
                  name: p.name || 'Candidate',
                  email: p.email,
                  phone: p.phone,
                  photo: p.photo_url,
                  city: p.city,
                  state: p.state,
                  years: p.years_experience,
                  ageGroups: p.age_groups || [],
                  education: p.education,
                  credentials: p.credentials || [],
                  bgCheck: p.bg_check,
                  availability: p.availability,
                  positions: p.positions || [],
                  bio: p.bio,
                  resume: p.resume_filename,
                  resumeUrl: p.resume_url,
                  credentialFiles: p.credential_filenames || [],
                  credentialUrls: p.credential_urls || [],
                  references: p.professional_references || [],
                  trainingCertificates: p.training_certificates || [],
                };
                const sc = calculateReadinessScore(candidateUi).total;
                return (
                  <div key={p.id} style={{ border: `1.5px solid ${c.border}`, borderRadius: 11, padding: 14, background: c.white, display: 'flex', gap: 12, alignItems: 'center' }}>
                    <Avatar name={candidateUi.name} photo={candidateUi.photo} size={48} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap" style={{ marginBottom: 3 }}>
                        <div style={{ fontSize: 14.5, fontWeight: 700, color: c.navy }}>{candidateUi.name}</div>
                        {hasFeature(plan, 'readiness_score') && <span style={{ fontSize: 11, fontWeight: 800, color: sc >= 70 ? c.success : c.gold }}>⭐ {sc}%</span>}
                      </div>
                      <div style={{ fontSize: 11.5, color: c.textMuted }}>{candidateUi.city}, {candidateUi.state} · {candidateUi.years || 'New'}</div>
                    </div>
                    <button onClick={() => { setShowSavedCandidates(false); setViewingApplicantDetail(candidateUi); }} style={{ padding: '7px 12px', background: c.primary, color: c.white, border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>View</button>
                    <button onClick={() => toggleSaveCandidate(p.id)} aria-label="Remove from saved" style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 4 }}><Heart size={20} color={c.coralDark} fill={c.coralDark} /></button>
                  </div>
                );
              })}
            </div>
          )}
        </Modal>
      )}

      {/* Trusted Teacher Network modal */}
      {showTrustedNetwork && (
        <Modal onClose={() => setShowTrustedNetwork(false)} wide>
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="flex items-center gap-2" style={{ marginBottom: 3 }}>
                <h3 style={{ fontSize: 19, fontWeight: 800, color: c.navy }}>Trusted Teacher Network</h3>
                <span style={{ background: c.gold, color: c.navy, fontSize: 10.5, fontWeight: 800, padding: '2px 8px', borderRadius: 999, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Premium</span>
              </div>
              <p style={{ fontSize: 12.5, color: c.textMuted }}>Verified teachers with high reliability scores, strong credentials, and proven track records.</p>
            </div>
          </div>
          {trustedNetworkFull.length === 0 ? (
            <div style={{ padding: 36, textAlign: 'center', background: c.cream, borderRadius: 10 }}>
              <Verified size={24} color={c.textMuted} style={{ margin: '0 auto 8px' }} />
              <p style={{ fontSize: 13, color: c.textMuted }}>The network is still growing. Teachers earn an invitation by reaching a Readiness Score of 70+ with verified background checks and credentials.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {trustedNetworkFull.map(({ profile: p, score }) => {
                const candidateUi = {
                  userId: p.id,
                  name: p.name || 'Teacher',
                  email: p.email,
                  phone: p.phone,
                  photo: p.photo_url,
                  city: p.city,
                  state: p.state,
                  years: p.years_experience,
                  ageGroups: p.age_groups || [],
                  education: p.education,
                  credentials: p.credentials || [],
                  bgCheck: p.bg_check,
                  availability: p.availability,
                  positions: p.positions || [],
                  bio: p.bio,
                  resume: p.resume_filename,
                  resumeUrl: p.resume_url,
                  credentialFiles: p.credential_filenames || [],
                  credentialUrls: p.credential_urls || [],
                  references: p.professional_references || [],
                  trainingCertificates: p.training_certificates || [],
                };
                const isSaved = savedCandidateIds.includes(p.id);
                return (
                  <div key={p.id} style={{ border: `1.5px solid ${c.gold}`, borderRadius: 11, padding: 14, background: `linear-gradient(135deg, ${c.white} 0%, ${c.paleBlue} 100%)`, display: 'flex', gap: 12, alignItems: 'center' }}>
                    <Avatar name={candidateUi.name} photo={candidateUi.photo} size={52} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap" style={{ marginBottom: 3 }}>
                        <div style={{ fontSize: 14.5, fontWeight: 700, color: c.navy }}>{candidateUi.name}</div>
                        <span style={{ fontSize: 11, fontWeight: 800, color: c.success }}>⭐ {score}%</span>
                        <span style={{ background: c.gold, color: c.navy, fontSize: 9.5, fontWeight: 800, padding: '1px 7px', borderRadius: 999 }}>TRUSTED</span>
                      </div>
                      <div style={{ fontSize: 11.5, color: c.textMuted, marginBottom: 4 }}>{candidateUi.city}, {candidateUi.state} · {candidateUi.years || 'Experienced'}</div>
                      <div className="flex flex-wrap gap-1">
                        {(candidateUi.credentials || []).slice(0, 3).map((cr, j) => <span key={j} style={{ fontSize: 10, padding: '2px 7px', background: c.lightBlue, color: c.primaryDark, borderRadius: 999, fontWeight: 600 }}>{cr}</span>)}
                      </div>
                    </div>
                    <button onClick={() => { setShowTrustedNetwork(false); setViewingApplicantDetail(candidateUi); }} style={{ padding: '7px 12px', background: c.primary, color: c.white, border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>View</button>
                    <button onClick={() => toggleSaveCandidate(p.id)} aria-label={isSaved ? 'Unsave' : 'Save'} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 4 }}>
                      <Heart size={20} color={isSaved ? c.coralDark : c.textMuted} fill={isSaved ? c.coralDark : 'transparent'} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </Modal>
      )}

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

              {/* Readiness Score & verification badges — Pro+ feature */}
              {hasFeature(plan, 'readiness_score') ? (
                <div style={{ marginBottom: 16 }}>
                  <ReadinessScoreCard
                    profile={viewingApplicantDetail}
                    history={viewingApplicantHistory || {}}
                    mode="owner"
                  />
                </div>
              ) : (
                <div style={{ background: c.cream, border: `1px dashed ${c.border}`, borderRadius: 12, padding: 14, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                  <Lock size={18} color={c.textMuted} />
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: c.navy }}>Professional Readiness Score & Verification Badges</div>
                    <div style={{ fontSize: 12, color: c.textMuted, marginTop: 2 }}>Available on Konnect Pro, Premium, and Elite plans. Spot reliable, qualified candidates faster.</div>
                  </div>
                  <button onClick={() => setView('pricing')} style={{ padding: '7px 12px', background: c.primary, color: c.white, border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Upgrade</button>
                </div>
              )}

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

              {/* Professional References */}
              {(viewingApplicantDetail.references || []).length > 0 && (
                <DetailBox label={`Professional References (${viewingApplicantDetail.references.length})`}>
                  <div className="space-y-1.5">
                    {viewingApplicantDetail.references.map((r, i) => (
                      <div key={i} style={{ padding: 10, background: c.cream, borderRadius: 8 }}>
                        <div style={{ fontSize: 13.5, fontWeight: 700, color: c.navy }}>{r.name || 'Reference'}</div>
                        {r.relationship && <div style={{ fontSize: 12, color: c.textMuted }}>{r.relationship}</div>}
                        <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1" style={{ fontSize: 12 }}>
                          {r.phone && <a href={`tel:${r.phone}`} style={{ color: c.primary, textDecoration: 'none', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}><Phone size={11} /> {r.phone}</a>}
                          {r.email && <a href={`mailto:${r.email}`} style={{ color: c.primary, textDecoration: 'none', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}><Mail size={11} /> {r.email}</a>}
                        </div>
                      </div>
                    ))}
                  </div>
                </DetailBox>
              )}

              {/* Training Certificates */}
              {(viewingApplicantDetail.trainingCertificates || []).length > 0 && (
                <DetailBox label={`Training Certificates (${viewingApplicantDetail.trainingCertificates.length})`}>
                  <div className="space-y-1.5">
                    {viewingApplicantDetail.trainingCertificates.map((cert, i) => (
                      <a
                        key={i}
                        href={cert.file_url || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => { if (!cert.file_url) e.preventDefault(); }}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 12px', background: c.paleBlue, borderRadius: 8, textDecoration: 'none', cursor: cert.file_url ? 'pointer' : 'default' }}
                      >
                        <div className="flex items-center gap-2" style={{ flex: 1, minWidth: 0 }}>
                          <GraduationCap size={14} color={c.primary} />
                          <div style={{ fontSize: 12.5, color: c.primaryDark, fontWeight: 600 }}>
                            {cert.name || 'Training certificate'}
                            {cert.hours && <span style={{ color: c.textMuted, fontWeight: 500 }}> · {cert.hours} hrs</span>}
                            {cert.issued_at && <span style={{ color: c.textMuted, fontWeight: 500 }}> · {cert.issued_at}</span>}
                          </div>
                        </div>
                        {cert.file_url && <span style={{ fontSize: 11, color: c.textMuted }}>Open</span>}
                      </a>
                    ))}
                  </div>
                </DetailBox>
              )}

              {(viewingApplicantDetail.resume || viewingApplicantDetail.credentialFiles?.length > 0) && (
                <DetailBox label="Documents">
                  <div className="space-y-1.5">
                    {viewingApplicantDetail.resume && (
                      <a
                        href={viewingApplicantDetail.resumeUrl || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => { if (!viewingApplicantDetail.resumeUrl) e.preventDefault(); }}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: c.paleBlue, borderRadius: 7, textDecoration: 'none', cursor: viewingApplicantDetail.resumeUrl ? 'pointer' : 'default' }}
                      >
                        <div className="flex items-center gap-2" style={{ fontSize: 12.5, color: c.primaryDark, fontWeight: 600 }}><FileText size={13} color={c.primary} /> {viewingApplicantDetail.resume}</div>
                        <span style={{ fontSize: 11, color: c.textMuted }}>{viewingApplicantDetail.resumeUrl ? 'Open' : 'Resume'}</span>
                      </a>
                    )}
                    {(viewingApplicantDetail.credentialFiles || []).map((f, i) => {
                      const url = (viewingApplicantDetail.credentialUrls || [])[i];
                      return (
                        <a
                          key={i}
                          href={url || '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => { if (!url) e.preventDefault(); }}
                          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: c.paleBlue, borderRadius: 7, textDecoration: 'none', cursor: url ? 'pointer' : 'default' }}
                        >
                          <div className="flex items-center gap-2" style={{ fontSize: 12.5, color: c.primaryDark, fontWeight: 600 }}><Paperclip size={13} color={c.primary} /> {f}</div>
                          <span style={{ fontSize: 11, color: c.textMuted }}>{url ? 'Open' : 'Certificate'}</span>
                        </a>
                      );
                    })}
                  </div>
                </DetailBox>
              )}

              <div className="flex gap-2 pt-4 flex-wrap" style={{ borderTop: `1px solid ${c.border}` }}>
                <button onClick={() => requestInterview(viewingApplicantDetail, viewingApplicantsFor)} style={{ padding: '10px 18px', background: c.gold, color: c.navy, border: 'none', borderRadius: 9, fontSize: 13, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}><Calendar size={13} /> Request Interview</button>
                <button onClick={() => {
                  startOrOpenConversation({
                    userId: viewingApplicantDetail.userId,
                    email: viewingApplicantDetail.email,
                    name: viewingApplicantDetail.name,
                    role: 'worker',
                    photo: viewingApplicantDetail.photo,
                    jobId: viewingApplicantsFor.id,
                    jobTitle: viewingApplicantsFor.title
                  });
                  setViewingApplicantsFor(null);
                  setViewingApplicantDetail(null);
                }} style={{ padding: '10px 18px', background: c.primary, color: c.white, border: 'none', borderRadius: 9, fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}><Mail size={13} /> Message</button>
                <a href={`mailto:${viewingApplicantDetail.email}`} style={{ padding: '10px 18px', background: c.white, color: c.primary, border: `1.5px solid ${c.primary}`, borderRadius: 9, fontSize: 13, fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}><Mail size={13} /> Email</a>
                <a href={`tel:${viewingApplicantDetail.phone}`} style={{ padding: '10px 18px', background: c.white, color: c.primary, border: `1.5px solid ${c.primary}`, borderRadius: 9, fontSize: 13, fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}><Phone size={13} /> Call</a>
                <button
                  onClick={() => toggleSaveCandidate(viewingApplicantDetail.userId)}
                  style={{ padding: '10px 18px', background: savedCandidateIds.includes(viewingApplicantDetail.userId) ? c.coralDark : c.gold, color: savedCandidateIds.includes(viewingApplicantDetail.userId) ? c.white : c.navy, border: 'none', borderRadius: 9, fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  <Heart size={13} fill={savedCandidateIds.includes(viewingApplicantDetail.userId) ? c.white : 'transparent'} />
                  {savedCandidateIds.includes(viewingApplicantDetail.userId) ? 'Saved' : 'Save Candidate'}
                </button>
              </div>

              {/* Hire-outcome actions appear once status is 'hired'. These
                  feed the worker's no-show / completed-shifts history. */}
              {viewingApplicantDetail.status === 'hired' && (
                <div style={{ marginTop: 14, padding: 14, background: c.cream, borderRadius: 11, border: `1px dashed ${c.border}` }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: c.textMuted, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 8 }}>After the shift</div>
                  <p style={{ fontSize: 12.5, color: c.text, marginBottom: 10, lineHeight: 1.5 }}>Tracking outcomes builds this teacher's reliability record across the network — boosting their score when they show up and protecting other centers when they don't.</p>
                  <div className="flex gap-2 flex-wrap">
                    <button
                      onClick={() => updateApplicantOutcome(viewingApplicantDetail.appId, viewingApplicantDetail.userId, 'completed', viewingApplicantsFor.id)}
                      disabled={viewingApplicantDetail.worker_outcome === 'completed'}
                      style={{
                        padding: '9px 14px',
                        background: viewingApplicantDetail.worker_outcome === 'completed' ? c.success : c.white,
                        color: viewingApplicantDetail.worker_outcome === 'completed' ? c.white : c.success,
                        border: `1.5px solid ${c.success}`,
                        borderRadius: 9,
                        fontSize: 12.5,
                        fontWeight: 700,
                        cursor: viewingApplicantDetail.worker_outcome === 'completed' ? 'default' : 'pointer',
                        display: 'flex', alignItems: 'center', gap: 6
                      }}
                    >
                      <CheckCircle2 size={13} />
                      {viewingApplicantDetail.worker_outcome === 'completed' ? 'Completed ✓' : 'Mark Shift Completed'}
                    </button>
                    <button
                      onClick={() => {
                        if (viewingApplicantDetail.worker_outcome === 'no_show') return;
                        if (window.confirm("Mark this teacher as a no-show? This affects their Readiness Score and reliability indicator.")) {
                          updateApplicantOutcome(viewingApplicantDetail.appId, viewingApplicantDetail.userId, 'no_show', viewingApplicantsFor.id);
                        }
                      }}
                      disabled={viewingApplicantDetail.worker_outcome === 'no_show'}
                      style={{
                        padding: '9px 14px',
                        background: viewingApplicantDetail.worker_outcome === 'no_show' ? c.coralDark : c.white,
                        color: viewingApplicantDetail.worker_outcome === 'no_show' ? c.white : c.coralDark,
                        border: `1.5px solid ${c.coralDark}`,
                        borderRadius: 9,
                        fontSize: 12.5,
                        fontWeight: 700,
                        cursor: viewingApplicantDetail.worker_outcome === 'no_show' ? 'default' : 'pointer',
                        display: 'flex', alignItems: 'center', gap: 6
                      }}
                    >
                      <AlertCircle size={13} />
                      {viewingApplicantDetail.worker_outcome === 'no_show' ? 'No-Show Recorded' : 'Mark No-Show'}
                    </button>
                    {false && viewingApplicantDetail.worker_outcome === 'completed' && (
                      <button
                        onClick={() => { setReviewDraft({ rating: 5, comment: '' }); setReviewError(''); setShowLeaveReview(true); }}
                        style={{ padding: '9px 14px', background: c.gold, color: c.navy, border: 'none', borderRadius: 9, fontSize: 12.5, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
                      >
                        <Star size={13} fill={c.navy} /> Leave Review
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Reviews from other centers — currently hidden in the UI
                  but kept in the code in case it gets turned back on. */}
              {false && viewingApplicantReviews.length > 0 && (
                <div style={{ marginTop: 14 }}>
                  <DetailBox label={`Reviews (${viewingApplicantReviews.length})`}>
                    <div className="space-y-2">
                      {viewingApplicantReviews.slice(0, 5).map(r => (
                        <div key={r.id} style={{ padding: 10, background: c.cream, borderRadius: 9 }}>
                          <div className="flex items-center justify-between gap-2 flex-wrap" style={{ marginBottom: 4 }}>
                            <StarRating value={r.rating} size={14} interactive={false} />
                            <span style={{ fontSize: 11, color: c.textMuted, fontWeight: 600 }}>{r.ownerName} · {formatRelativeTime(r.created_at)}</span>
                          </div>
                          {r.comment && <p style={{ fontSize: 12.5, color: c.text, lineHeight: 1.5, fontStyle: 'italic' }}>"{r.comment}"</p>}
                        </div>
                      ))}
                    </div>
                  </DetailBox>
                </div>
              )}
            </div>
          ) : (
            // LIST VIEW
            <div>
              <h3 style={{ fontSize: 19, fontWeight: 800, color: c.navy, marginBottom: 3 }}>Applicants for {viewingApplicantsFor.title}</h3>
              <p style={{ fontSize: 12.5, color: c.textMuted, marginBottom: 14 }}>{(jobApplicants[viewingApplicantsFor.id] || []).length} applicant{(jobApplicants[viewingApplicantsFor.id] || []).length === 1 ? '' : 's'} · {viewingApplicantsFor.location}</p>

              {/* Stage filter chips */}
              {(jobApplicants[viewingApplicantsFor.id] || []).length > 0 && (
                <div className="flex flex-wrap gap-1.5" style={{ marginBottom: 12 }}>
                  {[{value: 'all', label: 'All'}, ...HIRING_STAGES].map(s => {
                    const isActive = applicantStageFilter === s.value;
                    const count = s.value === 'all'
                      ? (jobApplicants[viewingApplicantsFor.id] || []).length
                      : (jobApplicants[viewingApplicantsFor.id] || []).filter(a => (a.status || 'applied') === s.value).length;
                    return (
                      <button
                        key={s.value}
                        onClick={() => setApplicantStageFilter(s.value)}
                        style={{
                          padding: '5px 11px',
                          background: isActive ? c.primary : c.white,
                          color: isActive ? c.white : c.text,
                          border: `1px solid ${isActive ? c.primary : c.border}`,
                          borderRadius: 999,
                          fontSize: 12,
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 5,
                        }}
                      >
                        {s.label} <span style={{ background: isActive ? 'rgba(255,255,255,0.25)' : c.cream, color: isActive ? c.white : c.textMuted, padding: '1px 6px', borderRadius: 999, fontSize: 10.5, fontWeight: 700 }}>{count}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {(jobApplicants[viewingApplicantsFor.id] || []).length === 0 ? (
                <div style={{ padding: 36, textAlign: 'center', background: c.cream, borderRadius: 10 }}>
                  <Users size={24} color={c.textMuted} style={{ margin: '0 auto 8px' }} />
                  <p style={{ fontSize: 13, color: c.textMuted }}>No applicants yet. We'll notify you when someone applies.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {(jobApplicants[viewingApplicantsFor.id] || [])
                    .filter(a => applicantStageFilter === 'all' || (a.status || 'applied') === applicantStageFilter)
                    .map((a, i) => {
                      const isSaved = savedCandidateIds.includes(a.userId);
                      const currentStage = a.status || 'applied';
                      return (
                        <div
                          key={i}
                          onClick={() => setViewingApplicantDetail(a)}
                          role="button"
                          tabIndex={0}
                          style={{ width: '100%', textAlign: 'left', border: `1.5px solid ${c.border}`, borderRadius: 11, padding: 14, background: c.white, cursor: 'pointer', display: 'flex', gap: 12, alignItems: 'center' }}
                          className="hover:border-blue-400 hover:shadow-md transition-all"
                        >
                          <Avatar name={a.name} photo={a.photo} size={48} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <div style={{ fontSize: 14.5, fontWeight: 700, color: c.navy }}>{a.name}</div>
                              {a.bgCheck === 'Cleared and current' && <Verified size={13} fill={c.success} stroke={c.white} strokeWidth={2.5} />}
                              {a.bgCheck === 'Portable background check' && <span title="Portable background check" style={{ display: 'inline-flex', alignItems: 'center', gap: 3, padding: '1px 6px', background: c.coralDark, color: c.white, borderRadius: 999, fontSize: 9.5, fontWeight: 700 }}><Shield size={9} /> Portable</span>}
                              {hasFeature(plan, 'readiness_score') && (() => {
                                const sc = calculateReadinessScore(a).total;
                                return <span style={{ fontSize: 11, fontWeight: 800, color: sc >= 70 ? c.success : sc >= 50 ? c.gold : c.textMuted }}>⭐ {sc}%</span>;
                              })()}
                            </div>
                            <div className="flex flex-wrap gap-x-2.5 gap-y-0.5" style={{ fontSize: 11.5, color: c.textMuted }}>
                              <span className="flex items-center gap-1"><MapPin size={10} /> {a.city}, {a.state}</span>
                              <span className="flex items-center gap-1"><Clock size={10} /> {a.years}</span>
                              {a.availability && <span>· {a.availability}</span>}
                            </div>
                            <div className="flex flex-wrap gap-1 mt-1.5 items-center">
                              {(a.credentials || []).slice(0, 3).map((cr, j) => <span key={j} style={{ fontSize: 10, padding: '2px 7px', background: c.lightBlue, color: c.primaryDark, borderRadius: 999, fontWeight: 600 }}>{cr}</span>)}
                              {(a.credentials || []).length > 3 && <span style={{ fontSize: 10, color: c.textMuted, fontWeight: 600 }}>+{a.credentials.length - 3} more</span>}
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2" onClick={e => e.stopPropagation()}>
                            <button
                              onClick={(e) => { e.stopPropagation(); toggleSaveCandidate(a.userId); }}
                              aria-label={isSaved ? 'Remove from saved' : 'Save candidate'}
                              style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 4, display: 'flex' }}
                            >
                              <Heart size={20} color={isSaved ? c.coralDark : c.textMuted} fill={isSaved ? c.coralDark : 'transparent'} />
                            </button>
                            <select
                              value={currentStage}
                              onClick={e => e.stopPropagation()}
                              onChange={e => { e.stopPropagation(); updateApplicantStage(a.appId, e.target.value, viewingApplicantsFor.id); }}
                              style={{ fontSize: 11.5, fontWeight: 700, padding: '4px 8px', border: `1px solid ${c.border}`, borderRadius: 7, background: c.white, color: c.navy, cursor: 'pointer' }}
                            >
                              {HIRING_STAGES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                            </select>
                          </div>
                        </div>
                      );
                    })}
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
      <Footer onNavigate={setView} />
    </div>
  );
}

function PasswordField({ value, onChange, placeholder, onKeyDown, autoComplete = 'current-password' }) {
  const [revealed, setRevealed] = useState(false);
  return (
    <div style={{ position: 'relative' }}>
      <input
        type={revealed ? 'text' : 'password'}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        onKeyDown={onKeyDown}
        autoComplete={autoComplete}
        style={{ width: '100%', padding: '9px 40px 9px 12px', fontSize: 13.5, border: `1.5px solid ${c.border}`, borderRadius: 9, background: c.white, color: c.text, outline: 'none' }}
      />
      <button
        type="button"
        onClick={() => setRevealed(v => !v)}
        aria-label={revealed ? 'Hide password' : 'Show password'}
        style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: c.textMuted, display: 'flex' }}
      >
        {revealed ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  );
}

function Input({ label, value, onChange, placeholder, type = 'text' }) {
  const isPassword = type === 'password';
  const [revealed, setRevealed] = useState(false);
  const effectiveType = isPassword && revealed ? 'text' : type;
  return (
    <div>
      <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: c.text, marginBottom: 5 }}>{label}</label>
      <div style={{ position: 'relative' }}>
        <input
          type={effectiveType}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={isPassword ? 'new-password' : undefined}
          style={{ width: '100%', padding: isPassword ? '9px 40px 9px 12px' : '9px 12px', fontSize: 13.5, border: `1.5px solid ${c.border}`, borderRadius: 9, background: c.white, color: c.text, outline: 'none' }}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setRevealed(v => !v)}
            aria-label={revealed ? 'Hide password' : 'Show password'}
            style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: c.textMuted, display: 'flex' }}
          >
            {revealed ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
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

// Reusable star row. Used both for picking a rating (interactive) and
// displaying one (read-only).
function StarRating({ value, onChange, size = 18, interactive = true }) {
  return (
    <div style={{ display: 'inline-flex', gap: 3 }}>
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          type="button"
          disabled={!interactive}
          onClick={() => interactive && onChange && onChange(n)}
          aria-label={`${n} star${n === 1 ? '' : 's'}`}
          style={{ background: 'transparent', border: 'none', cursor: interactive ? 'pointer' : 'default', padding: 0, lineHeight: 0 }}
        >
          <Star size={size} color={n <= value ? c.gold : c.border} fill={n <= value ? c.gold : 'transparent'} strokeWidth={2} />
        </button>
      ))}
    </div>
  );
}

// ============================================================
// Readiness Score Card — visible to workers (with full coaching
// tips) and to owners viewing an applicant (compact, score only).
// ============================================================
function ReadinessScoreCard({ profile, history = {}, mode = 'worker' }) {
  const score = calculateReadinessScore(profile, history);
  const ringColor =
    score.total >= 90 ? c.success :
    score.total >= 70 ? c.primary :
    score.total >= 50 ? c.gold :
    c.coral;
  const ringLabel =
    score.total >= 90 ? 'Outstanding' :
    score.total >= 70 ? 'Ready to Work' :
    score.total >= 50 ? 'Building Up' :
    'Getting Started';

  return (
    <div style={{ background: c.white, border: `1px solid ${c.border}`, borderRadius: 14, padding: 18 }}>
      <div className="flex items-center justify-between" style={{ marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 11, color: c.textMuted, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Professional Readiness Score</div>
          <div className="flex items-baseline gap-2" style={{ marginTop: 4 }}>
            <span style={{ fontSize: 38, fontWeight: 800, color: c.navy, letterSpacing: '-0.03em' }}>⭐ {score.total}%</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: ringColor }}>{ringLabel}</span>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ height: 10, background: c.borderSoft, borderRadius: 999, overflow: 'hidden', marginBottom: 14 }}>
        <div style={{ height: '100%', width: `${score.total}%`, background: `linear-gradient(90deg, ${ringColor}, ${c.primary})`, transition: 'width 400ms ease' }} />
      </div>

      {/* Explainer + background-check points — worker view only */}
      {mode === 'worker' && (
        <div style={{ background: c.cream, border: `1px solid ${c.border}`, borderRadius: 11, padding: '12px 14px', marginBottom: 14 }}>
          <p style={{ fontSize: 12.5, color: c.text, lineHeight: 1.55, marginBottom: 10 }}>
            <strong>This is your readiness guide, not a job application.</strong> Your Professional Readiness Score is a snapshot of how prepared and verifiable your profile looks to Georgia daycare centers. Complete each section below to raise your score — a higher score means more visibility and faster interview offers. Scroll down to update your profile, credentials, and background check.
          </p>
          <div style={{ borderTop: `1px dashed ${c.border}`, paddingTop: 9 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: c.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>How the Background Check scores (max 20)</div>
            <div className="space-y-1" style={{ fontSize: 12, color: c.text }}>
              <div className="flex items-center justify-between"><span>No background check</span><span style={{ fontWeight: 700, color: c.textMuted }}>0 pts</span></div>
              <div className="flex items-center justify-between"><span>Background check in progress</span><span style={{ fontWeight: 700, color: c.gold }}>8 pts</span></div>
              <div className="flex items-center justify-between"><span>Cleared &amp; current</span><span style={{ fontWeight: 700, color: c.primary }}>15 pts</span></div>
              <div className="flex items-center justify-between"><span>Portable background check</span><span style={{ fontWeight: 800, color: c.success }}>20 pts</span></div>
            </div>
          </div>
        </div>
      )}

      {/* Verification badges */}
      {score.badges.length > 0 && (
        <div className="flex flex-wrap gap-1.5" style={{ marginBottom: 14 }}>
          {score.badges.map(b => (
            <span key={b.key} style={{ background: c.paleBlue, color: c.primaryDark, fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 999, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
              <Verified size={11} fill={c.gold} stroke={c.white} strokeWidth={2.5} /> {b.label}
            </span>
          ))}
        </div>
      )}

      {/* Breakdown — full in worker mode, hidden in owner compact mode */}
      {mode === 'worker' && (
        <>
          <div style={{ fontSize: 12, fontWeight: 700, color: c.textMuted, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 8 }}>Score Breakdown</div>
          <div className="space-y-2">
            {score.breakdown.map((b, i) => (
              <div key={i} style={{ background: c.cream, borderRadius: 9, padding: '9px 12px' }}>
                <div className="flex items-center justify-between" style={{ marginBottom: b.achieved ? 0 : 4 }}>
                  <div className="flex items-center gap-2" style={{ flex: 1, minWidth: 0 }}>
                    {b.achieved ? <CheckCircle2 size={14} color={c.success} /> : <Circle size={14} color={c.textMuted} />}
                    <span style={{ fontSize: 13, fontWeight: 600, color: c.text }}>{b.label}</span>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: b.achieved ? c.success : c.textMuted }}>{b.earned} / {b.max}</span>
                </div>
                {!b.achieved && (
                  <div style={{ fontSize: 12, color: c.textMuted, marginLeft: 22, marginTop: 2, lineHeight: 1.4 }}>{b.tip}</div>
                )}
              </div>
            ))}
          </div>
          <p style={{ fontSize: 11.5, color: c.textMuted, marginTop: 12, lineHeight: 1.5, fontStyle: 'italic' }}>
            Daycare centers use your Professional Readiness Score and verification badges to identify reliable, qualified childcare professionals faster. Higher scores = more visibility and faster interview offers.
          </p>
        </>
      )}
    </div>
  );
}

function LiveChat() {
  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [err, setErr] = useState('');
  const [providerLoaded, setProviderLoaded] = useState(false);

  // If a third-party live chat provider script (Tawk.to, Tidio, Crisp,
  // HubSpot, etc.) is loaded via index.html, step aside and let it run
  // its own bubble so the user doesn't see two chat widgets.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const check = () => {
      const provider =
        window.Tawk_API ||
        window.tidioChatApi ||
        window.$crisp ||
        window.HubSpotConversations ||
        window.LC_API ||
        window.Intercom ||
        window.zE;
      if (provider) setProviderLoaded(true);
    };
    check();
    const id = window.setInterval(check, 1500);
    return () => window.clearInterval(id);
  }, []);

  if (providerLoaded) return null;

  const handleSend = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setErr('');
    if (!form.name || !form.email || !form.message) {
      setErr('Please enter your name, email, and a short message so we can help.');
      return;
    }
    const subject = encodeURIComponent('Rellim Kid Kare Konnect — Live Chat Message');
    const body = encodeURIComponent(
      `From: ${form.name} <${form.email}>\n\n${form.message}\n\n— Sent from in-app live chat`
    );
    if (typeof window !== 'undefined') {
      window.location.href = `mailto:info@kidkarekonnect.com?subject=${subject}&body=${body}`;
    }
    setSent(true);
  };

  const reset = () => {
    setForm({ name: '', email: '', message: '' });
    setSent(false);
    setErr('');
  };

  return (
    <>
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open live chat"
          style={{
            position: 'fixed', right: 18, bottom: 18, zIndex: 90,
            width: 56, height: 56, borderRadius: '50%',
            background: c.primary, color: c.white, border: 'none',
            cursor: 'pointer', boxShadow: '0 8px 22px rgba(15,42,61,0.28)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}
        >
          <MessageCircle size={24} />
          <span aria-hidden="true" style={{ position: 'absolute', top: 6, right: 6, width: 10, height: 10, borderRadius: '50%', background: '#FF8C42', border: `2px solid ${c.primary}` }} />
        </button>
      )}

      {open && (
        <div
          role="dialog"
          aria-label="Rellim Kid Kare Konnect support chat"
          style={{
            position: 'fixed', right: 18, bottom: 18, zIndex: 95,
            width: 'min(360px, calc(100vw - 24px))',
            maxHeight: 'min(560px, calc(100vh - 36px))',
            background: c.white, borderRadius: 16,
            boxShadow: '0 24px 60px rgba(15,42,61,0.25)',
            border: `1px solid ${c.border}`, overflow: 'hidden',
            display: 'flex', flexDirection: 'column'
          }}
        >
          <div style={{ background: `linear-gradient(135deg, ${c.primary} 0%, ${c.primaryDark} 100%)`, color: c.white, padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 14.5, fontWeight: 800, letterSpacing: '-0.01em' }}>Rellim Kid Kare Konnect</div>
              <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.85)', display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#FF8C42', display: 'inline-block' }} />
                Offline · Leave us a message
              </div>
            </div>
            <button onClick={() => setOpen(false)} aria-label="Close live chat" style={{ background: 'rgba(255,255,255,0.15)', border: 'none', cursor: 'pointer', color: c.white, padding: 6, borderRadius: 8, display: 'flex' }}>
              <X size={16} />
            </button>
          </div>

          <div style={{ padding: 14, overflowY: 'auto', flex: 1, background: c.cream }}>
            <div style={{ background: c.white, border: `1px solid ${c.border}`, borderRadius: 12, padding: '10px 12px', fontSize: 13.5, lineHeight: 1.55, color: c.text, marginBottom: 10, maxWidth: '92%' }}>
              <div style={{ fontSize: 11, color: c.primary, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 3 }}>Support</div>
              Welcome to Rellim Kid Kare Konnect Support. How may we help you today?
            </div>

            {sent ? (
              <div style={{ background: '#EAF6EE', border: `1px solid ${c.success}`, borderRadius: 12, padding: '12px 14px', fontSize: 13.5, color: c.navy, lineHeight: 1.55 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, marginBottom: 4 }}>
                  <CheckCircle2 size={15} color={c.success} /> Message ready to send
                </div>
                Your email client should have opened with your message pre-filled. Our team replies within one business day.
                <button onClick={reset} style={{ marginTop: 10, padding: '7px 12px', background: c.white, color: c.primary, border: `1.5px solid ${c.primary}`, borderRadius: 8, fontSize: 12.5, fontWeight: 700, cursor: 'pointer' }}>Send another message</button>
              </div>
            ) : (
              <form onSubmit={handleSend} style={{ display: 'grid', gap: 9 }}>
                {err && (
                  <div style={{ background: '#FEF2F2', border: `1px solid ${c.coral}`, color: c.coralDark, padding: '8px 11px', borderRadius: 8, fontSize: 12.5, display: 'flex', alignItems: 'flex-start', gap: 7 }}>
                    <AlertCircle size={13} style={{ flexShrink: 0, marginTop: 1 }} />{err}
                  </div>
                )}
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Your name" style={{ padding: '9px 11px', fontSize: 13, border: `1.5px solid ${c.border}`, borderRadius: 9, outline: 'none', background: c.white, color: c.text }} />
                <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="Email address" style={{ padding: '9px 11px', fontSize: 13, border: `1.5px solid ${c.border}`, borderRadius: 9, outline: 'none', background: c.white, color: c.text }} />
                <textarea value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} placeholder="How can we help?" rows={3} style={{ padding: '9px 11px', fontSize: 13, border: `1.5px solid ${c.border}`, borderRadius: 9, outline: 'none', background: c.white, color: c.text, resize: 'vertical', fontFamily: 'inherit' }} />
                <button type="submit" style={{ padding: '10px 12px', background: c.primary, color: c.white, border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  <Send size={13} /> Send message
                </button>
              </form>
            )}

            <div style={{ marginTop: 12, padding: '10px 12px', background: c.white, border: `1px solid ${c.borderSoft}`, borderRadius: 10, fontSize: 12.5, color: c.text, lineHeight: 1.5 }}>
              <div style={{ fontSize: 11, color: c.textMuted, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6 }}>Reach us directly</div>
              <a href="mailto:info@kidkarekonnect.com" style={{ display: 'flex', alignItems: 'center', gap: 7, color: c.primary, textDecoration: 'none', fontWeight: 600, marginBottom: 4 }}><Mail size={12} /> info@kidkarekonnect.com</a>
              <a href={SUPPORT_PHONE_TEL} style={{ display: 'flex', alignItems: 'center', gap: 7, color: c.primary, textDecoration: 'none', fontWeight: 600 }}><Phone size={12} /> {SUPPORT_PHONE}</a>
            </div>

            <p style={{ marginTop: 10, fontSize: 11, color: c.textMuted, lineHeight: 1.5, fontStyle: 'italic' }}>
              By using live chat, you agree that your message may be reviewed by Rellim Kid Kare Konnect support staff to assist with your request.
            </p>
          </div>
        </div>
      )}
    </>
  );
}

function Footer({ onNavigate }) {
  const links = [
    { label: 'About', view: 'about' },
    { label: 'Contact', view: 'contact' },
    { label: 'Privacy', view: 'privacy' },
    { label: 'Terms', view: 'terms' },
    { label: 'Help', view: 'help' }
  ];
  const handleLink = (item) => {
    if (typeof onNavigate === 'function') onNavigate(item.view);
  };
  return (
    <footer style={{ background: c.navy, color: 'rgba(255,255,255,0.7)', padding: '32px 0', marginTop: 40 }}>
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row md:items-center md:justify-between gap-5">
        <div className="flex flex-col gap-3">
          <div style={{ background: c.white, padding: '10px 16px', borderRadius: 12, display: 'inline-flex', alignSelf: 'flex-start', boxShadow: '0 4px 14px rgba(0,0,0,0.18)' }}>
            <img src="/logo.png" alt="Rellim Kid Kare Konnect" style={{ height: 56, width: 'auto', display: 'block' }} />
          </div>
          <div className="flex flex-wrap" style={{ gap: '4px 16px' }}>
            {links.map(l => (
              <button key={l.view} type="button" onClick={() => handleLink(l)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.78)', padding: 0, fontSize: 13, fontWeight: 500 }}>{l.label}</button>
            ))}
          </div>
          <div style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.55)' }}>© 2026 Rellim Kid Kare Konnect · A Rellim company</div>
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
