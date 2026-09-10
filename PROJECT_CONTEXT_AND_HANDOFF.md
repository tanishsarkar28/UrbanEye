# UrbanEye — Comprehensive Project State, Conversation History & AI Handoff Document

> **Last Updated:** 2026-09-10 (Local Time)  
> **Repository:** `https://github.com/tanishsarkar28/UrbanEye.git`  
> **Workspace Root:** `c:\Users\sarka\OneDrive\Documents\Codes\Projects\UrbanEye + App`  
> **Branch:** `main`

---

## 1. Quick Start & Handoff Summary for AI Assistants

If you are a newly initialized AI agent picking up this project, read this section first:

1. **CRITICAL USER RULE**:
   > **"from next time ask me before pushing to github"**  
   > **NEVER execute `git push` without explicit user confirmation.** You may commit locally or build, but DO NOT push to remote origin without being asked.
2. **Current Local Dev Server Status**:
   - **Backend Server**: Port `5000` (`urbaneye-command/backend`) — Express + Prisma + SQLite/Postgres + Socket.IO + JWT Auth.
   - **Web Frontend**: Port `3000` (`urbaneye-command/web`) — React 18 + Vite + Tailwind CSS + Leaflet + Framer Motion.
   - Run commands:
     ```powershell
     # Web Build Verification:
     cd "c:\Users\sarka\OneDrive\Documents\Codes\Projects\UrbanEye + App\urbaneye-command\web"
     npm run build
     ```
3. **Primary Tech Stack**:
   - **Web Dashboard & Command Portal**: React + Vite + Tailwind CSS + Leaflet + Lucide Icons.
   - **Backend**: Node.js, Express, Prisma ORM, Socket.IO realtime websocket mesh.
   - **Android Sensor App (`urbaneye-mobile`)**: Native Kotlin, CameraX, ONNX Runtime Edge-AI inference model (`yolov8n.pt` / `best_float32.onnx`).

---

## 2. Complete Chronological History of User Requests & Implemented Solutions

### Request 1: Deploy on Render
- **User Prompt**: `deploy on render`
- **Actions Taken**:
  - Configured `render.yaml` infrastructure-as-code descriptor in repository root.
  - Setup backend web service and static site building pipeline for `urbaneye-command`.

### Request 2: Push to GitHub
- **User Prompt**: `https://github.com/tanishsarkar28/UrbanEye.git push on this repo`
- **Actions Taken**:
  - Initialized git origin to `https://github.com/tanishsarkar28/UrbanEye.git`.
  - Pushed initial monorepo codebase.

### Request 3: Fix Render TypeScript Compilation Errors
- **User Prompt**: TypeScript errors during render build (`StateSelector.tsx(33,52): error TS7006: Parameter 'acc' implicitly has an 'any' type...`).
- **Actions Taken**:
  - Resolved implicit `any` parameter types and missing JSX intrinsic typing in `StateSelector.tsx` and related React components.
  - Verified `npm run build` exits with code 0.

### Request 4: Android Mobile App Not Connecting
- **User Prompt**: `not connecting to the app`
- **Actions Taken**:
  - Debugged backend URL binding and network security config in Android app (`network_security_config.xml`).
  - Allowed cleartext traffic for local dev IP testing (`10.0.2.2` / local LAN).
  - Ensured pairing endpoint `/api/pairing/verify` returns proper token and heartbeat configuration.

### Request 5: Pothole Detected as Surface Damage & Duplicate Active Bus Count
- **User Prompt**: `it's detecting pothole as Surface Damage and it's showing to Active Bus sensor while there only 1`
- **Actions Taken**:
  - **Pothole Classification**: In `urbaneye-mobile/app/src/main/java/com/urbaneye/mobile/detector/OnnxRoadDefectDetector.kt`, adjusted defect label index mapping so craters, holes, and depressions correctly map to `POTHOLE` rather than generic `SURFACE_DAMAGE`.
  - **Deduplicate Active Buses**: In `urbaneye-command/backend/src/events/events.router.ts` and `urbaneye-command/backend/src/geography/geography.router.ts`, grouped live bus sessions by unique `busLabel` instead of counting multiple stale session records.
  - **Session Unpairing**: Added `DELETE /api/pairing/sessions/:id` endpoint in backend and updated `PairingModal.tsx` to allow resetting/unpairing active sessions.

### Request 6 & 7: Integrate Landing Page Before Login
- **User Prompt**: `make C:\Users\sarka\OneDrive\Documents\Codes\Projects\UrbanEye + App\urbaneye-landing as the landing page inside there there will be a log in button after clicking there it will take us to log in page`
- **Actions Taken**:
  - Migrated landing page components from `urbaneye-landing` into `urbaneye-command/web/src/components/landing/` (`Hero.tsx`, `Problem.tsx`, `HowItWorks.tsx`, `Features.tsx`, `MapPreview.tsx`, `Impact.tsx`, `Footer.tsx`).
  - Created `urbaneye-command/web/src/pages/LandingPage.tsx`.
  - Connected `LandingPage` in `App.tsx` as the default unauthenticated view with an "Officer Login" CTA leading to `Login.tsx`.

### Request 8: Remove Duplicate CTA Button from Hero
- **User Prompt**: `remove "Enter Command Portal" button from landing page`
- **Actions Taken**:
  - In `Hero.tsx`, removed the redundant "Enter Command Portal" button, leaving the clean "See how it works" and "Officer Login" flow.
  - Committed as `b708c4a`.

### Request 9: User Rule Established
- **User Prompt**: `from next time ask me before pushing to github`
- **Actions Taken**:
  - Recorded as a strict constraint: Always request permission before performing any `git push`.

### Request 10: Redesign UrbanEye's Post-Login Experience (Parts 1 & 2)
- **User Prompt**:
  *Redesign UrbanEye's post-login experience in two parts. Stack: React + Vite + Tailwind + Leaflet, matching the existing portal. Keep all current data/API wiring — this is a UI/UX and information-architecture pass, not a rebuild of the backend.*
  - **Part 1 — New National Overview Page (First screen after login)**:
    - Dedicated screen between login and district command showing India at state level.
    - Leaflet India map where each onboarded state is shaded by aggregate **Road Health Index** ($\ge 80$ Signal Teal `#1E7F73`, $60-79$ Balanced Amber `#d97706`, $<60$ Alert Crimson `#dc2626`), focusing on pavement health over raw alert volume.
    - Ranked sortable table: State name, number of districts live, Road Health Index, new defects this week, resolution rate. Sortable on all columns with quick search.
    - Clicking a state expands/filters to its districts; clicking a district opens that district's Command page.
    - Top summary strip with real seed numbers (States Onboarded, Active Bus Sensors, Defects Resolved to Date, National Road Health Index).
    - Role-based routing: Ministry/National roles see this screen; District Heads bypass it directly to their assigned district.
  - **Part 2 — Redesign District Command Page**:
    - **Reduced Chrome**: Collapsed stacked navy bar + dark sub-bar + competing orange/green pills into ONE calm header (brand + live status dot + inline jurisdiction breadcrumb + sensors count + restrained role badge + single-accent `Pair Bus` button in signal teal).
    - **Restrained Palette**: Amber/red strictly reserved for genuine unreviewed alerts; administrative controls sit in ink (`#10233D`), signal teal (`#1E7F73`), and slate.
    - **Hero Road Health Index Card**: Road Health Index given visual priority as the hero KPI with large score, status label ("OPTIMAL HEALTH"), and progress gauge bar. The other 4 metrics sit denser and quieter beside it.
    - **Map Legend Overlay**: Replaced solid white legend box with a sleek, semi-transparent frosted glass overlay (`bg-slate-900/85 backdrop-blur-md text-white border border-white/10`).
    - **Live & Listening Ingestion Feed**: When awaiting edge telemetry, feed displays an active animated listening radar pulse (`Mesh Socket Active`) rather than an empty/error state.
    - **Defect Register Table**: Restrained badges and action buttons.

### Request 11: Landing Page Color Restoration & Light/Dark Theme Toggle
- **User Prompt**:
  *where did the color go on landing page?*
  *just add a toggle for light or dark theme and also change text or other button colors according to the theme*
- **Actions Taken**:
  - **Restored Dark Mode as Flagship Default**:
    - Deep midnight ink canvas (`#081325`), vivid glowing Signal Teal grid lines (`#1E7F73`), and pulsing warm amber radar markers (`#D98E04`).
    - High-contrast white Space Grotesk display typography and crisp silver body copy.
    - Bold, glowing Signal Teal buttons (`Officer Login` & `See how it works`) with hover glows and shadow accents.
  - **Light / Dark Theme Toggle**:
    - Added a theme toggle button with **Sun ☀️ / Moon 🌙** icons in both the **floating navigation header** and the **footer**.
    - Choice persists in `localStorage` (`urbaneye_theme`) across visits.
  - **Theme-Adaptive Styling Across All Sections**:
    - `Hero.tsx`: Dynamic canvas, text, and button styling.
    - `Problem.tsx`: Themed card backgrounds and colored KPI stat numbers (`#2dd4bf` in dark, `#0f766e` in light).
    - `HowItWorks.tsx`: Themed step numbers and borders.
    - `Features.tsx`: Themed card typography and borders.
    - `MapPreview.tsx`: Themed map grid background and route vectors.
    - `Impact.tsx`: Themed counter numbers and borders.
    - `Footer.tsx`: Themed footer with embedded theme switch and login CTA.
  - Added `darkMode: 'class'`, `slate: "#5B6B7A"`, and `amber: "#D98E04"` into `urbaneye-command/web/tailwind.config.js`.
  - Built cleanly with `npm run build` (0 errors).

### Request 12: Mobile-First Cross-Device Ergonomics & Responsive Overhaul
- **User Prompt**:
  *Make the entire web dashboard (landing page + login + National Overview + State Overview + District Command page) genuinely comfortable to use on phone, tablet, laptop, and large desktop — not just "doesn't overflow," but actually pleasant to operate one-handed on a phone.*
- **Actions Taken**:
  - **Core Viewport & Safe-Area Inset Support**:
    - Added `viewport-fit=cover` in `index.html`.
    - Added CSS variables `--sat`, `--sab`, `--sal`, `--sar` with utility classes `.pt-safe`, `.pb-safe` in `index.css`.
    - Disabled webkit tap highlight and enabled touch-action ergonomics.
  - **1. Header.tsx**:
    - Mobile collapsed app bar with truncated jurisdiction chip and tap-to-expand popover.
    - Kept "+ Pair Bus" primary action visible as a 44x44px icon button.
    - Hamburger button opens a smooth slide-down drawer with role status, live sensor pill, touch-friendly persona switcher, and full-width sign-out button.
  - **2. NationalOverviewView.tsx**:
    - Mobile Segmented View Switcher: `[ 🗺️ India Health Map | 📋 State Rankings (N) ]`.
    - Stacked state cards on mobile with health gauge bars and 2x2 key metrics grid.
    - Slide-up "Sort & Filter" bottom sheet modal with 44px tap targets.
    - `map.invalidateSize()` listeners for tab switches and orientation changes.
  - **3. StateOverviewView.tsx**:
    - Mobile Segmented View Switcher: `[ 🏛️ Districts (N) | 🗺️ Regional Map ]`.
    - Single-column district cards on mobile with 44px buttons, 2-col on tablet, 3-col on desktop.
  - **4. AnalyticsPanel.tsx**:
    - Hero Road Health Index card at full width.
    - Secondary KPI cards stack in a clean 1-column layout on mobile (< 768px), 2-col on tablet (`md:`), and 4-col on desktop (`lg:`+).
  - **5. LiveMap.tsx**:
    - Full-bleed map canvas.
    - Frosted glass legend collapses into a corner floating pill tab (`Legend ∧`), tap to expand.
    - Leaflet zoom controls repositioned to `bottomright` for one-handed thumb ergonomics.
    - Added window resize & `ResizeObserver` calling `map.invalidateSize()`.
  - **6. DefectTable.tsx**:
    - Dual layout: card-per-defect stack on mobile with thumbnail, type, status, telemetry, and 44px action buttons; full data table on `md:` and above.
  - **7. PairingModal.tsx & DefectDetailModal.tsx**:
    - Converted into mobile bottom sheets sliding up from the bottom with `max-h-[94dvh]`.
    - Input font sizes $\ge 16$px (`text-base`) to prevent iOS Safari auto-zoom.
    - Safe-area bottom padding for iOS home indicator and Android gesture pill.
  - **8. Landing Page Sections**:
    - Scaled hero typography `text-3xl sm:text-5xl md:text-6xl lg:text-7xl`.
    - Reduced excessive vertical padding from `py-28` to `py-14 sm:py-20 md:py-28`.
    - Lightweight SVG patterns for low-end mobile GPUs.
  - **9. Login.tsx**:
    - Form inputs $\ge 16$px font size, 44px minimum touch targets for all test persona buttons and actions.
  - Built cleanly with `npm run build` (0 errors).

---

## 3. Architecture & File Structure

```
UrbanEye + App/
├── PROJECT_CONTEXT_AND_HANDOFF.md    <-- THIS FILE (Source of truth)
├── render.yaml                       <-- Cloud deployment config
├── urbaneye-debug.apk                <-- Compiled Android test APK
├── urbaneye-mobile/                  <-- Android Studio Project (Kotlin)
│   └── app/src/main/java/com/urbaneye/mobile/
│       ├── detector/
│       │   └── OnnxRoadDefectDetector.kt (Edge-AI YOLOv8 inference & class mapping)
│       ├── ui/
│       └── network/
├── urbaneye-landing/                 <-- Original static landing prototype
└── urbaneye-command/                 <-- Main Production Monorepo
    ├── backend/                      <-- Express + Prisma + Socket.IO (Port 5000)
    │   ├── prisma/schema.prisma
    │   └── src/
    │       ├── auth/                 <-- JWT Login & Users
    │       ├── events/               <-- Defect Ingestion & Rollup Stats
    │       ├── geography/            <-- National, State & District Rollup APIs
    │       ├── pairing/              <-- 6-digit PIN Pairing & Device Sessions
    │       └── realtime/             <-- Socket.IO Broadcast Mesh
    └── web/                          <-- React + Vite + Tailwind (Port 3000)
        ├── tailwind.config.js        <-- Design tokens (ink, signal, paper, etc.)
        └── src/
            ├── App.tsx               <-- Root Controller, View Modes & Routing
            ├── types.ts              <-- Shared Data Interfaces
            ├── pages/
            │   ├── LandingPage.tsx   <-- Theme-aware Landing Page
            │   └── Login.tsx         <-- Test Personas & Credential Login
            └── components/
                ├── Header.tsx        <-- Mobile-first Collapsible Header & Drawer
                ├── NationalOverviewView.tsx <-- Part 1: India Health Map, Segmented Tabs & Cards  
                ├── StateOverviewView.tsx    <-- State District Rollup View & Segmented Switcher
                ├── AnalyticsPanel.tsx       <-- Part 2: Hero Road Health Index & 1-Col Mobile KPI Stack
                ├── LiveMap.tsx              <-- Leaflet Defect Map + Collapsible Frosted Legend Tab
                ├── DefectTable.tsx          <-- Dual-mode Defect Register (Cards on mobile, Table on desktop)
                ├── PairingModal.tsx         <-- 6-Digit Bus PIN Pairing Mobile Bottom Sheet
                ├── DefectDetailModal.tsx    <-- Telemetry & Officer Action Mobile Bottom Sheet
                └── landing/                 <-- Theme-Adaptive & Fluid Landing Sections
                    ├── Hero.tsx
                    ├── Problem.tsx
                    ├── HowItWorks.tsx
                    ├── Features.tsx
                    ├── MapPreview.tsx
                    ├── Impact.tsx
                    └── Footer.tsx
```

---

## 4. Current Git Status (Local Commits Pending User Signal for Push)

> **STANDING RULE**: Never execute `git push` without explicit user permission.

The working directory is clean. All changes have been built and tested with `npm run build` (0 errors) and committed locally across the following local commits on branch `main`:

- **Commit `1545750`**: `feat: complete mobile-first and cross-device responsive overhaul`
- **Commit `6f856ca`**: `docs: document Request 12 mobile overhaul in handoff`

Files included in the overhaul:
```
modified:   urbaneye-command/web/index.html
modified:   urbaneye-command/web/src/index.css
modified:   urbaneye-command/web/src/App.tsx
modified:   urbaneye-command/web/src/pages/Login.tsx
modified:   urbaneye-command/web/src/components/Header.tsx
modified:   urbaneye-command/web/src/components/NationalOverviewView.tsx
modified:   urbaneye-command/web/src/components/StateOverviewView.tsx
modified:   urbaneye-command/web/src/components/AnalyticsPanel.tsx
modified:   urbaneye-command/web/src/components/LiveMap.tsx
modified:   urbaneye-command/web/src/components/DefectTable.tsx
modified:   urbaneye-command/web/src/components/PairingModal.tsx
modified:   urbaneye-command/web/src/components/DefectDetailModal.tsx
modified:   urbaneye-command/web/src/components/landing/Hero.tsx
modified:   urbaneye-command/web/src/components/landing/Problem.tsx
modified:   urbaneye-command/web/src/components/landing/HowItWorks.tsx
modified:   urbaneye-command/web/src/components/landing/Features.tsx
modified:   urbaneye-command/web/src/components/landing/MapPreview.tsx
modified:   urbaneye-command/web/src/components/landing/Impact.tsx
modified:   urbaneye-command/web/src/components/landing/Footer.tsx
modified:   PROJECT_CONTEXT_AND_HANDOFF.md
```

---

## 5. Seed Test Personas & Accounts

For testing different roles and routing behaviors:

| Role | Email | Password | Scope / Landing View |
|---|---|---|---|
| **National Admin (Ministry)** | `admin@urbaneye.gov.in` | `UrbanEye@2026` | Lands on **National Overview Page** (All-India) |
| **State Admin (Punjab)** | `admin.pb@urbaneye.gov.in` | `UrbanEye@2026` | Lands on Punjab State Overview |
| **State Admin (Maharashtra)** | `admin.mh@urbaneye.gov.in` | `UrbanEye@2026` | Lands on Maharashtra State Overview |
| **District Head (Kapurthala)** | `head.kapurthala@urbaneye.gov.in` | `UrbanEye@2026` | **Bypasses national screen**, lands directly in Kapurthala Command page |
| **District Head (Jalandhar)** | `head.jalandhar@urbaneye.gov.in` | `UrbanEye@2026` | Bypasses national screen, lands directly in Jalandhar Command page |
| **District Head (Mumbai Suburban)** | `head.mumbai@urbaneye.gov.in` | `UrbanEye@2026` | Bypasses national screen, lands directly in Mumbai Command page |

---

## 6. How to Run & Verify

1. **Verify Web Build**:
   ```powershell
   cd "c:\Users\sarka\OneDrive\Documents\Codes\Projects\UrbanEye + App\urbaneye-command\web"
   npm run build
   ```
2. **Start Web Dev Server** (if not already running):
   ```powershell
   cd "c:\Users\sarka\OneDrive\Documents\Codes\Projects\UrbanEye + App\urbaneye-command\web"
   npm run dev
   # Accessible at http://localhost:3000
   ```
3. **Start Backend Dev Server** (if not already running):
   ```powershell
   cd "c:\Users\sarka\OneDrive\Documents\Codes\Projects\UrbanEye + App\urbaneye-command\backend"
   npm run dev
   # Accessible at http://localhost:5000
   ```
4. **Push to Remote Git (Only when User Approves)**:
   ```powershell
   git add .
   git commit -m "feat: redesign post-login experience and add landing page theme toggle"
   git push origin main
   ```

---

### Request 13: Password Show/Hide Eye Toggle on Login
- **User Prompt**: `add a eye button to see the password typed is correct or not`
- **Actions Taken**:
  - Added `showPassword` state to `Login.tsx`.
  - Wrapped the password `<input>` in a `position: relative` container.
  - Added an absolutely-positioned toggle button (44px touch target) using Lucide `Eye`/`EyeOff` icons.
  - Input `type` toggles between `password` and `text`; `paddingRight: 44px` prevents text underlapping the button.
  - Button turns teal (#2dd4bf) on hover, matching design system.
- **Also fixed**: Backend was not running, causing "Login failed". Started backend (`npm run dev` in `urbaneye-command/backend`).
- **Commit**: `feat(login): add password show/hide eye toggle`
- **Pushed to GitHub**: Yes (user explicitly requested push).

### Request 14: Single Source-of-Truth Detection Category Color & Priority Config
- **User Prompt**: Create a unified color/priority system for all 11 detection categories (5 live Phase 1, 3 Phase 2, 3 Phase 3) and apply it everywhere.
- **Actions Taken**:
  1. **Created `urbaneye-command/web/src/constants/detectionCategories.ts`** — master config array of 11 categories with `code`, `displayName`, `phase`, `hex`, and `priority`. Phase 2/3 entries are reserved config slots only (no detection logic). Exports `getCategoryColor()`, `getCategoryDisplayName()`, `getCategoryPriority()`, and `MAX_CATEGORY_PRIORITY`.
  2. **Updated `DefectTable.tsx`** — replaced 10-case `getTypeBadge()` switch-case with a single config-driven inline-style badge. Any new category in the config automatically gets the right badge color without touching this file.
  3. **Updated `LiveMap.tsx`** — added `zIndexOffset = (MAX_PRIORITY - categoryPriority) * 100` to each Leaflet marker. Higher-priority categories (lower priority number) always render on top generically, future phases slot in automatically.
  4. **Updated `OverlayView.kt`** — corrected Android bounding-box colors: POTHOLE changed from red → orange (#f97316), ROAD_CRACK/WATERLOGGING corrected, SURFACE_DAMAGE changed from orange → ochre (#92400e), VEHICLE_FLOW explicit case added.
- **Color Audit Result**: Red (`#dc2626`) and Rose (`#e11d48`) are now 100% reserved for Phase 3 INCIDENT/ANPR. No live Phase 1 category uses red or rose.
- **Commit**: `feat: single-source-of-truth detection category color/priority config`
- **Git status**: Local commit only, not yet pushed.

---

### Request 15: Fix Pothole Detection & Show Diameter/Cost on Phone Screen + Dashboard
- **User Prompt**: `the app is not detecting the potholes and also not showing the diameter on the phone screen. also i want the diameter size to show on each pot hole on dashboard with the price to fix it`
- **Root Cause Found**:
  1. `TemporalDetectionTracker.kt` was silently **dropping** `estimatedDiameterCm` and `estimatedRepairCost` from `DetectionResult` when creating confirmed tracked detections (both in `processFrame()` and `getActivePersistentDetections()`). The diameter was computed in the ONNX detector but lost in the tracker.
  2. `OnnxRoadDefectDetector.kt` had `numAnchors = 2100` hardcoded — this was made **dynamic** from actual model output shape so it works with any YOLOv8 variant.
  3. Confidence threshold was lowered from `0.25f` to `0.15f` for better real-world road sensitivity.
- **Actions Taken**:
  - **`TemporalDetectionTracker.kt`**: Added `estimatedDiameterCm` and `estimatedRepairCost` to the `TrackedDefect` data class. Propagated from input candidates when initializing new tracks, updated during track matching, and included in all emitted `DetectionResult` objects.
  - **`OnnxRoadDefectDetector.kt`**: Made `numAnchors` dynamic (`totalElements / (4 + numClasses)`). Lowered `targetConfidenceThreshold` from 0.25 → 0.15.
  - **`activity_main.xml`**: Added:
    - `tvDetectionStatus` — Line 3 in HUD bar showing live detection type, confidence, diameter, cost
    - `detectionBanner` — Full-width orange alert banner at bottom of screen showing `🚧 POTHOLE XX%  Ø XX cm  Fix: ₹X,XXX` when a pothole is detected
  - **`MainActivity.kt`**: Wired up `tvDetectionStatus` and `detectionBanner` visibility logic in the real-time `runOnUiThread` block.
  - **Dashboard**: Already implemented in previous session via `DefectTable.tsx` and `getPotholeCostDetails()` utility — both mobile cards and desktop table rows show `Ø XX cm` and `Fix: ₹X,XXX`.
- **Build**: `assembleDebug` — BUILD SUCCESSFUL in 20s, APK copied to project root.
- **Commit**: `fix(mobile): fix pothole detection - preserve diameter/cost in tracker, add live detection banner, lower confidence threshold to 0.15`
- **Pushed**: Yes (to `https://github.com/tanishsarkar28/UrbanEye.git` main)

### Request 16: Push
- **Pushed to GitHub**: Yes — commit `25c7b63` pushed to `main`.
- **Note**: GitHub warned about APK file size (90.86 MB > 50 MB recommended). APK still pushed successfully.

---

## 7. Detection Category Registry (Reference)

All detection colors and priorities are defined in:
`urbaneye-command/web/src/constants/detectionCategories.ts`

| Priority | Code | Display Name | Phase | Hex |
|----------|------|-------------|-------|-----|
| 1 | `INCIDENT` | Incident / Emergency | 3 (future) | `#dc2626` Red |
| 2 | `ANPR_FLAG` | Flagged Vehicle (ANPR) | 3 (future) | `#e11d48` Rose |
| 3 | `POTHOLE` | Pothole | **1 (live)** | `#f97316` Orange |
| 4 | `ROAD_CRACK` | Road Crack | **1 (live)** | `#eab308` Amber |
| 5 | `SURFACE_DAMAGE` | Surface Wear | **1 (live)** | `#92400e` Ochre |
| 6 | `WATERLOGGING` | Waterlogging | **1 (live)** | `#2563eb` Blue |
| 7 | `TRAFFIC_SIGN` | Traffic Sign Issue | 2 (planned) | `#ca8a04` Gold |
| 8 | `DIVIDER` | Divider Issue | 2 (planned) | `#0891b2` Cyan |
| 9 | `ZEBRA_CROSSING` | Zebra Crossing Issue | 2 (planned) | `#059669` Emerald |
| 10 | `VEHICLE_DETECTION` | Vehicle Detection | 2 (planned) | `#4f46e5` Indigo |
| 11 | `VEHICLE_FLOW` | Traffic Stream (density) | **1 (live)** | `#7c3aed` Purple |
