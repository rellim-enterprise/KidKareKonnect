// ============================================================
// Brand-wide config. CHANGE THESE VALUES TO UPDATE EVERYWHERE.
// ============================================================
//
// The support phone number shown on Contact, Help, the live chat
// panel, and pushed to Crisp's session data. Update this string in
// the format you want users to SEE it (with dashes); the dial-able
// tel: link is derived automatically below.
//
// To change the support phone for the whole app:
//   1) Edit the line just below.
//   2) Save the file. That's it — every page updates on next deploy.
// ============================================================
export const SUPPORT_PHONE = '1-800-499-6349';

// Auto-derived: strip everything that isn't a digit or +, so
// `tel:` links work on iOS/Android dialers.
export const SUPPORT_PHONE_TEL = `tel:${SUPPORT_PHONE.replace(/[^0-9+]/g, '')}`;

// ============================================================
// Stripe price IDs — one per subscription tier.
// Set these in Vercel Project Settings → Environment Variables:
//   VITE_STRIPE_PRICE_BASIC=price_xxx
//   VITE_STRIPE_PRICE_PRO=price_xxx
//   VITE_STRIPE_PRICE_PREMIUM=price_xxx
//   VITE_STRIPE_PRICE_ELITE=price_xxx
// (Find these in Stripe dashboard → Products → click each one)
// ============================================================
export const STRIPE_PRICE_IDS = {
  'Konnect Basic':   (import.meta.env && import.meta.env.VITE_STRIPE_PRICE_BASIC)   || '',
  'Konnect Pro':     (import.meta.env && import.meta.env.VITE_STRIPE_PRICE_PRO)     || '',
  'Konnect Premium': (import.meta.env && import.meta.env.VITE_STRIPE_PRICE_PREMIUM) || '',
  'Konnect Elite':   (import.meta.env && import.meta.env.VITE_STRIPE_PRICE_ELITE)   || '',
};
