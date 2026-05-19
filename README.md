# Rellim KidKare Konnect

The Premier Daycare Hiring Platform. Connecting qualified daycare workers with licensed centers.

## How to Deploy to Vercel (Step by Step)

Total time: about 15 minutes. No coding needed.

### Step 1: Create a free Vercel account

1. Go to https://vercel.com/signup
2. Sign up with your email or GitHub account (GitHub is faster)
3. Confirm your email when prompted

### Step 2: Deploy this folder

You have two ways. Pick whichever is easier for you.

**Option A: Drag and drop (easiest, no GitHub needed)**

1. Make sure this entire `kidkare-connect` folder is unzipped on your computer
2. Log into Vercel
3. Click "Add New..." then "Project"
4. Look for "Import Third Party Git Repository" or scroll down for the deploy option
5. If you see a "Deploy" button without a repo, drag the `kidkare-connect` folder into it
6. If that option isn't visible, use Option B instead

**Option B: Upload via GitHub (most reliable, slightly more steps)**

1. Go to https://github.com/new and create a free account if needed
2. Create a new repository (name it something like "kidkare-connect"), keep it private if you want
3. After creating, GitHub shows you upload instructions. Click "uploading an existing file"
4. Drag every file from this `kidkare-connect` folder into the upload area (do NOT zip them, drag the actual files)
5. Click "Commit changes" at the bottom
6. Now back in Vercel, click "Add New..." then "Project"
7. Click "Import" next to your new GitHub repo
8. Vercel will auto-detect everything. Just click "Deploy"
9. Wait about 1-2 minutes. Done.

### Step 3: Get your live URL

After deployment, Vercel gives you a URL like `kidkare-connect-abc123.vercel.app`. Click it to see your live app.

You can also click "Settings" then "Domains" to add your own custom domain like `kidkareconnect.com` if you've bought one (about $12/year from Namecheap or Google Domains).

## What This Version Can Do

- All the screens you've been testing (jobs, profile builder, messaging, partner signups, state licensing, training hub)
- Stores data in each user's browser via localStorage
- Works on phones, tablets, and computers
- No login loops, no broken redirects

## What This Version CANNOT Do Yet

This is a preview/demo build. Tell your testers about these limits before they start clicking around:

- **Data is per-browser.** If Toni signs up on her phone, her profile only exists on her phone. Another person on another phone won't see Toni's profile or her job postings. Real applicants and real centers connecting requires a backend database (next step).
- **Emails are simulated.** Verification codes show on screen in a blue box. No real email is sent yet.
- **Payments are simulated.** The Stripe checkout for the $79/$129/$159 plans and $39.99 partner listings shows a confirmation but doesn't actually charge a card.
- **Files don't really upload.** Resume and certificate uploads show the filename but the file isn't stored anywhere. Owners can see filenames but can't open the files.

To go from preview to a real app, the next step is adding a backend (Supabase is the typical choice, takes 1 to 2 weeks of work). That gets you a real database, real email, real Stripe payments, and real file storage.

## How to Test Locally (Optional)

If you want to run it on your computer before deploying:

1. Install Node.js from https://nodejs.org (LTS version, free)
2. Open Terminal (Mac) or Command Prompt (Windows)
3. Navigate to this folder: `cd path/to/kidkare-connect`
4. Run `npm install` (takes 1-2 minutes the first time)
5. Run `npm run dev`
6. Open http://localhost:5173 in your browser

## What to Tell Your Testers

Send them the Vercel URL with a note like:

> Hi! I'm building a daycare hiring platform called Rellim KidKare Konnect. This is an early preview so I can see what people think. A few things to know:
>
> 1. Data only stays on your device for now, so my test centers won't see your test profile yet
> 2. Email codes show on screen instead of being emailed
> 3. Payments are simulated, no real charges
>
> Please poke around as either a teacher or a daycare center and let me know:
> - What's confusing?
> - What's missing?
> - Would you actually use this?

## Support

If something breaks during deployment, the error message usually tells you what's wrong. Most common issues:

- **"Build failed"**: usually means you missed a file. Make sure you uploaded everything including `package.json`, `vite.config.js`, the `src` folder, and `index.html`
- **"Module not found"**: same fix, missing file
- **Blank page after deploy**: hard refresh the browser (Cmd+Shift+R on Mac, Ctrl+F5 on Windows)

You can always come back to Claude and paste the error message for help.
