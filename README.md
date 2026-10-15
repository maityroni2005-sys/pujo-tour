# UtsavHopper: Smart Puja Parikrama & Trip Planner (উৎসবহপার) 🏮✨

> A lightweight, zero-cost, production-ready Progressive Web App (PWA) built for Kolkata and Bengal's Sharodutsav. Engineered for high performance on mobile devices with zero local database load, WCAG AAA accessible high-contrast UI, offline caching, and global error resilience.

---

## 🚀 Key Highlights & Architectural Constraints

1. **Lightweight & High-Performance (Zero Local DB Load):**
   * Built with **React 19 (Vite)** + **Tailwind CSS** + **Lucide React** icons.
   * Zero heavy 3D frameworks or bloated libraries so CPU/RAM stays ultra-light.
   * Free-tier **Supabase PostgreSQL** cloud database with automatic fallback to **localStorage** when offline or unconfigured.

2. **High-Contrast UI/UX & Outdoor Visibility (WCAG AAA Compliant):**
   * **Dark Mode Background:** Deep Obsidian Slate (`#0F172A`)
   * **Light Mode Background:** Crisp Alabaster (`#F8FAFC`)
   * **Primary Action Buttons:** High-Contrast Vermilion (`#E11D48`) and Bright Marigold (`#F59E0B`) with pure white/black text for maximum readability under direct midday outdoor sunlight.
   * **Mobile-First Sticky Navigation:** Sticky bottom navigation bar with 4 large touch targets (**Explore**, **My Route**, **Live Crowd**, **Profile/Admin**) with a minimum **48px tap area**.
   * **Instant Skeleton Loaders:** Smooth pulsing shimmer cards (`PandalSkeletonCard`) to eliminate blank screens while data hydrates.

3. **Global Error Handling & Offline Resilience:**
   * **React Error Boundary:** Wrapped around the app root with a dedicated **"Retry / Reload Route"** and safe recovery mode.
   * **Offline Fallback:** If connection drops inside a crowded pandal or Supabase is unreachable, automatically falls back to cached data and displays a high-contrast yellow banner:
     `"Offline Mode: Showing your saved Puja itinerary."`
   * **Strict Form Validation:** Inline red error messages and toast alerts preventing empty inputs, duplicate pandals, or invalid map URLs.
   * **Database Keep-Alive:** GitHub Actions cron workflow (`.github/workflows/keep-alive.yml`) that pings the Supabase REST API every 5 days so the free database never pauses due to inactivity.

4. **Role-Based Access Control (RBAC):**
   * **User Panel:** One-click Google/Email login, multi-field station/zone filters, custom Day-wise Itinerary builder (Saptami to Dashami), one-tap direct Google Maps navigation buttons (zero API cost), and shareable trip URLs.
   * **Admin Panel (`role === 'admin'`):** Protected dashboard to Add/Edit/Delete Pandals, toggle live Crowd Status (**Low - Green**, **Moderate - Amber**, **Heavy - Red**), and manage featured Parikrama routes.

---

## 📂 Project Structure

```
A+R/
├── .github/
│   └── workflows/
│       └── keep-alive.yml          # GitHub Actions 5-day cron ping to keep Supabase active
├── public/
│   ├── favicon.svg
│   ├── pandal-icon.svg             # Trinetra & Dhunuchi festive vector icon
│   └── manifest.webmanifest        # PWA configuration
├── src/
│   ├── components/
│   │   ├── ErrorBoundary.jsx       # Global React Error Boundary with Retry / Reload button
│   │   ├── PandalSkeletonCard.jsx  # Pulsing shimmer skeleton cards
│   │   ├── LiveCrowdTracker.jsx    # Real-time crowd heatmap & status filter tab
│   │   ├── Navbar.jsx              # Responsive header with 4 large touch targets & theme toggle
│   │   ├── HeroBanner.jsx          # Festive banner, weather widget & controlled search input
│   │   ├── ZoneRouteExplorer.jsx   # Multi-field search, transit filter & split map/card view
│   │   ├── PandalCard.jsx          # Pandal card with crowd badge, day planner & directions
│   │   ├── PandalMap.jsx           # react-leaflet map centered on WB with MapFlyToController
│   │   ├── ItineraryBuilder.jsx    # Saptami-Dashami day tabs, drag/reorder & notes
│   │   ├── CuratedTours.jsx        # Curated parikrama walking tour packages
│   │   ├── CheckInModal.jsx        # Check-in modal with ratings & community reviews
│   │   ├── ShareModal.jsx          # Shareable trip URLs & WhatsApp export
│   │   ├── AuthModal.jsx           # Supabase Auth modal & 1-click Demo accounts
│   │   └── admin/
│   │       ├── AdminDashboard.jsx  # Admin portal shell & role verification
│   │       ├── PandalManager.jsx   # Pandal CRUD with strict form validation & inline errors
│   │       ├── LiveCrowdControl.jsx# 1-tap crowd level toggles & route barricades
│   │       ├── CuratedTourManager.jsx # Manage recommended parikrama packages
│   │       └── ReviewModerator.jsx # Community review moderation
│   ├── context/
│   │   ├── ToastContext.jsx        # Auto-dismiss toast notifications (success/error/warning)
│   │   ├── AuthContext.jsx         # RBAC state ('user' vs 'admin') & Supabase Auth
│   │   └── AppDataContext.jsx      # Global state for pandals, itineraries, reviews, offline cache
│   ├── data/
│   │   ├── initialPandals.js       # 18+ famous Kolkata, Hooghly & District pandals
│   │   └── initialCuratedTours.js  # Curated heritage walking tour routes
│   ├── lib/
│   │   ├── dateHelpers.js          # Local IST date helpers (Asia/Kolkata) & map hubs
│   │   └── supabase.js             # Supabase client with graceful offline fallback
│   ├── App.jsx                     # Master application shell with sticky 48px bottom navigation
│   ├── index.css                   # Obsidian Slate, Alabaster, Vermilion & Marigold tokens
│   └── main.jsx                    # PWA service worker registration & ErrorBoundary root
├── supabase/
│   └── schema.sql                  # Complete SQL schema, RLS policies, trigger & indexes
├── .env.example                    # Template for Supabase environment variables
└── vite.config.js                  # Vite PWA & Tailwind configuration
```

---

## 🛠️ Step-by-Step Setup Guide

### 1. Run Locally
```bash
# Clone the repository and navigate to root
cd A+R

# Install dependencies (React 19, Leaflet, Lucide, Tailwind, Vite)
npm install

# Start Vite development server
npm run dev
```
Open **http://localhost:5173** in your mobile or desktop browser.

---

### 2. Connect Free Supabase Database
1. Go to [supabase.com](https://supabase.com) and create a free project.
2. Open the **SQL Editor** in your Supabase dashboard.
3. Open [`supabase/schema.sql`](file:///c:/Users/maity/OneDrive/Desktop/A+R/supabase/schema.sql), copy the entire file content, paste it into the SQL Editor, and click **Run**.
4. Go to **Project Settings -> API** and copy:
   * **Project URL**
   * **anon / public key**
5. Create a file named `.env.local` in the project root:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-public-key-here
   ```
6. Restart your dev server (`npm run dev`). Your app is now connected to live PostgreSQL with real-time replication!

---

### 3. Keep Free Supabase Database Active Forever
Supabase free tier projects pause after 7 days of inactivity. To prevent this:
1. In your GitHub repository, go to **Settings -> Secrets and variables -> Actions**.
2. Add two repository secrets:
   * `SUPABASE_URL`: Your Supabase Project URL.
   * `SUPABASE_ANON_KEY`: Your Supabase Anon Key.
3. The workflow file [`.github/workflows/keep-alive.yml`](file:///c:/Users/maity/OneDrive/Desktop/A+R/.github/workflows/keep-alive.yml) runs every 5 days automatically, pinging the REST API to keep the database active indefinitely.

---

## 🎨 Color Palette & WCAG AAA Contrast Specifications

| Name | Hex Code | Purpose | Text Contrast |
| :--- | :--- | :--- | :--- |
| **Deep Obsidian Slate** | `#0F172A` | Dark Mode Background | Paired with `#F8FAFC` (16.2:1 contrast ratio) |
| **Crisp Alabaster** | `#F8FAFC` | Light Mode Background | Paired with `#0F172A` (16.2:1 contrast ratio) |
| **High-Contrast Vermilion** | `#E11D48` | Primary Action Buttons | Pure White `#FFFFFF` (4.6:1 contrast ratio) |
| **Bright Marigold** | `#F59E0B` | Secondary & Accent Buttons | Deep Obsidian `#0F172A` (10.8:1 contrast ratio) |
| **Emerald Green** | `#10B981` | Low Crowd Badge | High visibility outdoor indicator |

---

## 📱 Mobile-First Navigation Targets (WCAG AAA)

The sticky bottom navigation bar adheres to mobile ergonomic guidelines:
* Large touch targets with **min 48px height and width** (`min-h-[48px] min-w-[48px]`).
* Thumb-friendly placement for one-handed operation while walking through crowded festive streets.
* High-contrast active indicators and badge counts for instant status at a glance.
