# Magkanotoll: A Mobile-Based Toll Fee Estimation Application

---

## Overview

**Magkanotoll** (from the Filipino word *"Magkano"* meaning *"How much?"* + *"Toll"*) is a mobile application built with React Native (Expo) that helps Filipino motorists estimate toll fees across major Philippine expressways. It provides trip planning tools, vehicle-based fuel estimation, RFID card management, saved routes, calculation history, and an AI-powered chatbot for expressway-related queries.

---

## App Navigation

The app has 4 tabs in the bottom navigation bar:

| Tab | Screen |
|---|---|
| Home | Toll Fee Calculator |
| RFID | RFID Card Manager |
| Explore | Expressway Info, Rates, Traffic |
| Profile | Account, History, Saved Routes, Vehicles |

---

## Features

---

### 1. Toll Fee Calculator

**What it does:**
The core feature of the app. Users select an entry (origin) toll plaza and an exit (destination) toll plaza, choose their vehicle class, and the app returns the estimated toll fee for that trip.

**How it works:**
- The user picks an origin and destination plaza from a list organized by expressway 
- The user selects their **vehicle class**:
  - **Class 1** — Cars, SUVs, vans, motorcycles
  - **Class 2** — Buses, jeepneys, light trucks
  - **Class 3** — Heavy trucks, trailers
- The app sends a request to the **expressway.ph Toll Calculator API** (`https://www.expressway.ph/api/toll-calculator`) with the origin plaza, destination plaza, and vehicle class.
- The API returns the total toll fee, a breakdown per expressway segment, and the RFID system required (EasyTrip or Autosweep).
- If the trip passes through multiple expressways (e.g., NLEX → Skyway Stage 3), the result shows each segment separately with its corresponding toll.
- Results appear in a **bottom sheet modal** that slides up from the bottom of the screen with a spring animation, keeping the calculator form visible behind it. Tapping the backdrop or "Start a new calculation" closes the sheet.

**Where the toll data comes from:**
Toll fees are sourced from the official **expressway.ph** API, which reflects the rates set by the Toll Regulatory Board (TRB) of the Philippines. The app does not hardcode toll amounts — it fetches them live from the API to ensure accuracy.

---

### 2. Alternative Routes

**What it does:**
After calculating a toll, the app shows **alternative routes** (if available) so users can compare different paths and choose the most cost-effective one.

**How it works:**
- The expressway.ph API returns alternative route options alongside the main route.
- Each alternative shows a label (e.g., "Via CAVITEX"), the total toll, and a per-segment breakdown.
- Users can tap an alternative to view its details and compare it with the primary route.

---

### 3. Route Map Visualization

**What it does:**
Displays an interactive map of the driving route between the selected origin and destination toll plazas.

**How it works:**
- Each toll plaza in the app has stored GPS coordinates (latitude and longitude).
- When a route is calculated, the app calls the **OSRM (Open Source Routing Machine)** API (`https://router.project-osrm.org`) using the coordinates of the entry and exit plazas.
- OSRM returns the actual road geometry (a series of GPS points) of the driving route.
- The app renders this as an **animated polyline** on a dark-themed map using **Leaflet** (rendered inside a WebView), showing the exact path the motorist would take on the expressway.
- Plaza markers are shown at entry and exit points with color-coded dots (green = start, red = end, yellow = intermediate).
- Users can pan and pinch-to-zoom the map.
- A **"Open in Google Maps"** button below the map launches Google Maps with the full route pre-loaded for turn-by-turn navigation.

---

### 4. Trip Statistics (Distance, ETA, Fuel Estimate)

**What it does:**
After calculating a toll, the app estimates the **total distance**, **estimated travel time (ETA)**, and **fuel consumption** for the trip — personalized to the user's saved vehicle if available.

**How it works:**
- The app calls the OSRM API for each segment of the trip to get the driving distance (in km) and duration (in minutes), then sums them across all segments.
- **Fuel consumption** is estimated using a piecewise efficiency curve based on engine displacement (cc):

| Engine Size | Estimated Highway Efficiency (Class 1) |
|---|---|
| ≤ 660cc (Kei car) | ~20 km/L |
| 660–1000cc | ~18.5 km/L |
| 1000–1300cc | ~17 km/L |
| 1300–1600cc | ~15.5 km/L |
| 1600–2000cc | ~13.5 km/L |
| 2000–2500cc | ~12 km/L |
| 2500–3000cc | ~10.5 km/L |
| 3000cc+ | ~9 km/L |

- **Diesel engines** receive a **+20% efficiency bonus** over gasoline at highway speeds.
- **Electric vehicles** return 0 liters — no fuel cost is calculated at all.
- **LPG and Hybrid** vehicles use the gasoline curve as a baseline.
- A **speed efficiency multiplier** is applied based on average route speed:
  - Below 40 kph → 75% (heavy traffic)
  - 40–60 kph → 90%
  - 60–80 kph → 100% (optimal highway speed)
  - 80–100 kph → 95%
  - Above 100 kph → 88% (higher burn at high speed)
- Formula: `Gas (L) = Distance (km) ÷ (Engine km/L × Speed Multiplier)`
- If the user has no saved vehicle, the app falls back to class-based defaults:
  - Class 1 = 15 km/L, Class 2 = 8 km/L, Class 3 = 6 km/L
- The stat tiles (ETA, Distance, Gas) show **skeleton shimmer** placeholders while the OSRM data is loading.

---

### 5. Trip Cost Sharing

**What it does:**
Helps users split the total trip cost (toll + fuel) among multiple passengers.

**How it works:**
- After a toll is calculated, the Trip Cost Sharing panel appears inside the result sheet.
- The user inputs the **current fuel price per liter** and the **number of passengers** (1–20).
- Default fuel price is automatically set based on the saved vehicle's fuel type:
  - Gasoline / LPG / Hybrid → ₱65/L default
  - Diesel → ₱60/L default
  - Electric → fuel section is hidden entirely, only toll is split
- The app computes:
  - **Fuel cost** = Fuel liters × Fuel price per liter
  - **Total trip cost** = Toll fee + Fuel cost
  - **Cost per person** = Total trip cost ÷ Number of passengers
- A vehicle badge shows which saved vehicle's specs are being used for the estimate, including the effective km/L rate.
- If no vehicle is saved, a grey badge says *"Using default estimate — save a vehicle for better accuracy"*.

---

### 6. Saved Vehicles

**What it does:**
Allows signed-in users to save their vehicle details so the app can calculate more accurate fuel estimates.

**How it works:**
- Users manually enter their vehicle details:
  - **Nickname** (e.g., "My Innova", "Work Truck") — max 40 characters
  - **Year** — 4-digit year
  - **Make** — e.g., Toyota, Honda
  - **Model** — e.g., Vios, Fortuner
  - **Engine Displacement** in cc — for ICE, LPG, and Hybrid vehicles
  - **Battery Capacity** in kWh — for Electric vehicles only
  - **Fuel Type** — Gasoline, Diesel, LPG, Electric, or Hybrid
  - **Toll Vehicle Class** — Class 1, 2, or 3
- Vehicle data is stored in the `saved_vehicles` table in **Supabase** under the user's account.
- The **first saved vehicle** is automatically used for fuel calculations in the toll result.
- Users can **edit** or **delete** saved vehicles from the Vehicles tab in the Profile page.
- Electric vehicles automatically disable all fuel-related calculations and display *"Electric — no fuel cost"* throughout the app.

---

### 7. Saved Routes

**What it does:**
Allows signed-in users to bookmark frequently used routes for quick access.

**How it works:**
- After calculating a toll, users can save the route with a custom label (e.g., "Daily Commute") directly from the result sheet using an inline text input — no separate modal required.
- A checkmark animation confirms the save.
- Saved routes are stored in the `saved_routes` table in **Supabase** linked to the user's account.
- On the home screen, up to 5 saved routes appear as **quick-access cards** — tapping one auto-fills the calculator with that route's origin, destination, and vehicle class.
- Users can **edit the label** or **delete** saved routes from the Saved tab in the Profile page.

---

### 8. Calculation History

**What it does:**
Keeps a log of all toll calculations the user has made, with monthly spending analytics.

**How it works:**
- Every time a toll is calculated, the result is automatically saved to the `toll_history` table in **Supabase**.
- The History section (inside the Profile tab) shows:
  - A **bar chart** of total toll spending for the last 6 months (grouped by month), with peso amounts shown above each bar.
  - A list of all past calculations showing origin, destination, vehicle class, toll amount, and date/time.
- Users can **export their history as a CSV file** (comma-separated values) for use in spreadsheets or reports.
- Users can also **clear all history** with a confirmation prompt.
- History is only available to signed-in users — guest users cannot access this section.

---

### 9. RFID Card Manager

**What it does:**
Lets users save their RFID card numbers and check their balance via SMS with one tap.

**How it works:**
- The Philippines uses two RFID systems for expressway toll payment:
  - **EasyTrip** — used on NLEX, SCTEX, TPLEX, NLEX Connector, and NLEX Harbor Link
  - **Autosweep** — used on SLEX, STAR Tollway, Skyway, CALAX, CAVITEX, MCX, and NAIAX
- Users can add their **16-digit RFID card number** with a custom nickname (e.g., "My EasyTrip Card").
- Cards are stored securely in the `rfid_cards` table in **Supabase** under the user's account.
- To check balance, the user taps **"Check Balance via SMS"** — the app opens the phone's SMS app pre-filled with the correct number and message format:
  - EasyTrip: SMS `BAL <card_number>` to **2929**
  - Autosweep: SMS `BAL <card_number>` to **29290**
- Users can also **copy** their card number to clipboard or **delete** saved cards.
- Each RFID system section shows the expressways it covers, the hotline number, and a link to the official website.

---

### 10. TollBot (AI Chatbot)

**What it does:**
An AI-powered chatbot that answers questions about Philippine expressways in a friendly, conversational way (Taglish — mix of Tagalog and English).

**How it works:**
- TollBot is powered by **Google Gemini 2.5 Flash**, a large language model (LLM) by Google.
- The app sends a system prompt to Gemini that includes all expressway data (names, regions, plaza lists, speed limits, RFID systems, operators, hotlines) so the AI has accurate context.
- Users can ask questions like:
  - *"Anong RFID ang kailangan sa NLEX?"* (What RFID is needed on NLEX?)
  - *"Ilang plazas ang SLEX?"* (How many plazas does SLEX have?)
  - *"Ano ang speed limit sa Skyway?"* (What is the speed limit on Skyway?)
- TollBot is instructed **not to guess toll amounts** — it always directs users to use the calculator for exact fees.
- The chat supports **multi-turn conversation** (it remembers previous messages in the session).
- **Suggested questions** are shown at the start to help users get started.
- The Gemini API key is stored securely in environment variables and never hardcoded in source code.

---

### 11. User Authentication & Guest Mode

**What it does:**
Allows users to create an account and log in to access personalized features, while also supporting a seamless guest experience.

**How it works:**
- Authentication is handled by **Supabase Auth**.
- Users can:
  - **Sign up** with email and password
  - **Confirm their email** via a verification link
  - **Log in** with their credentials
  - **Reset their password** via email (link sent to inbox)
- **Guest/anonymous mode is the default** — when the app is opened for the first time (after onboarding), the user is automatically signed in as a guest and taken directly to the Home screen. No login is required to use the calculator.
- Guest users can freely use: toll calculator, route map, trip stats, TollBot, and Explore.
- Features that require an account: history, saved routes, saved vehicles, RFID cards — these show a sign-in prompt when accessed by a guest.
- The Profile tab shows a dedicated guest screen with **Sign In** and **Sign Up** buttons.

---

### 12. Onboarding

**What it does:**
A 4-slide introduction shown the first time the app is opened, explaining the app's key features before the user starts.

**How it works:**
- Shown only once — after completion, `onboarding_done` is saved to AsyncStorage so it never shows again.
- 4 animated slides with parallax fade and translateY transitions:
  1. **Welcome** — shows the MagkanoToll logo
  2. **Route Planner** — explains the toll calculator
  3. **RFID & Cost** — explains cost splitting and RFID wallets
  4. **History** — explains saved routes and history
- Uses only the app's primary (`#171717`) and accent (`#ffc400`) colors with white text.
- HugeIcons used for slides 2–4; the app logo is shown on slide 1.
- Animated dots at the bottom indicate the current slide.
- Users can tap **"Next"** to advance or **"Skip for now"** to jump to the end.
- After tapping **"Get Started"** or **"Skip"**, the user is automatically signed in as a guest and taken to the Home screen.

---

### 13. Expressway Information (Explore Tab)

**What it does:**
Provides reference information about each expressway covered by the app, including toll rate ranges and traffic update links.

**Three sections:**

**Info** — expandable cards for each expressway showing:

| Field | Description |
|---|---|
| Full Name | Official name of the expressway |
| Region | Geographic region it serves |
| Total Plazas | Number of toll plazas |
| Length (km) | Total length of the expressway |
| Speed Limit | Minimum and maximum speed in kph |
| Operator | Company that manages the expressway |
| Hotline | Tappable customer service number |
| RFID System | EasyTrip or Autosweep |
| Social Media | Tappable Facebook and Twitter/X links |
| Plaza List | All toll plazas listed |

**Rates** — approximate toll rate ranges per vehicle class (Class 1 / 2 / 3) for all 13 expressways, with a note that exact amounts require the calculator.

**Traffic** — links to official expressway and government social media accounts (MMDA, NLEX, SLEX/Skyway, DPWH, LTO) for real-time traffic updates.

**Expressways covered:**

| Code | Full Name | RFID System |
|---|---|---|
| NLEX | North Luzon Expressway | EasyTrip |
| SCTEX | Subic-Clark-Tarlac Expressway | EasyTrip |
| TPLEX | Tarlac-Pangasinan-La Union Expressway | EasyTrip |
| NLEX Connector | NLEX Connector Road | EasyTrip |
| Harbor Link | NLEX Harbor Link | EasyTrip |
| SLEX | South Luzon Expressway | Autosweep |
| Skyway | Metro Manila Skyway | Autosweep |
| Skyway Stage 3 | Metro Manila Skyway Stage 3 | Autosweep |
| CALAX | Cavite-Laguna Expressway | Autosweep |
| CAVITEX | Manila-Cavite Expressway | Autosweep |
| MCX | Muntinlupa-Cavite Expressway | Autosweep |
| STAR Tollway | Southern Tagalog Arterial Road | Autosweep |
| NAIAX | Ninoy Aquino International Airport Expressway | Autosweep |

---

### 14. Settings

**What it does:**
Allows signed-in users to manage their account and app preferences.

**How it works:**
- Accessible via the settings icon (⚙) on the Profile tab header.
- **Account section:**
  - **Change Password** — set a new password (minimum 6 characters, confirmation required)
  - **Two-Factor Authentication** — placeholder for a future 2FA feature
- **Notifications section:**
  - Toggle for **Push Notifications**
  - Toggle for **Email Notifications**
- **About section:**
  - Displays the current **App Version** (1.0.0)
- **Danger Zone:**
  - **Delete Account** — permanently deletes the user's account and all associated data (history, saved routes, vehicles, RFID cards). Requires confirmation. Cannot be undone.

---

### 15. Profile Page

**What it does:**
A unified page that consolidates the user's account info, history, saved routes, and vehicles in one place.

**How it works:**
- Accessible via the **Profile tab** in the bottom navigation bar.
- **Avatar** — tap to change profile photo (uploaded to Supabase Storage). Shows initials if no photo is set.
- **Name** — tap the pencil icon to edit display name.
- **Info card** — shows full name and email.
- **Three inner section tabs:**
  - **History** — monthly spending bar chart (last 6 months) + full calculation list with Export CSV and Clear All
  - **Saved** — all saved routes with edit label and delete
  - **Vehicles** — saved vehicle cards with edit and delete
- **Logout** button at the bottom with a confirmation modal.
- **Guest users** see a lock screen with Sign In / Sign Up buttons — no profile data is shown.

---



## Technology Stack

| Layer | Technology |
|---|---|
| Mobile Framework | React Native (Expo) |
| Language | TypeScript |
| Styling | NativeWind (Tailwind CSS for React Native) |
| Backend / Database | Supabase (PostgreSQL + Auth + Storage) |
| Toll Fee Data | expressway.ph API |
| Routing / Maps | OSRM (Open Source Routing Machine) + Leaflet (WebView) |
| AI Chatbot | Google Gemini 2.5 Flash |
| State Management | Zustand |
| Charts | react-native-gifted-charts (BarChart) |
| Fonts | Lufga (custom TTF, 9 weights) |
| Icons | HugeIcons |

---

## Supabase Tables

| Table | Purpose |
|---|---|
| `toll_history` | Stores all toll calculations per user (origin, destination, vehicle class, total toll, segments, RFID breakdown) with error handling |
| `saved_routes` | Stores bookmarked routes (label, origin, destination, vehicle class, total toll) per user |
| `saved_vehicles` | Stores vehicle details (nickname, year, make, model, engine cc, battery kWh, fuel type, vehicle class) per user with validation |
| `rfid_cards` | Stores RFID card numbers (system, card number, nickname) per user with 16-digit validation |
| `banned_users` | Tracks banned user accounts (admin feature) |
| `app_content` | Stores Terms & Conditions and Privacy Policy sections (admin editable) |

All tables use **Row Level Security (RLS)** — users can only read, insert, update, and delete their own rows. Anonymous/guest users are blocked from all tables.

**Admin RPC Functions:**
- `get_admin_users` — Returns all users with calculation counts and ban status
- `get_popular_routes` — Returns most calculated routes across all users
- `admin_delete_user` — Allows admins to delete user accounts
- `save_app_content` — Allows admins to update Terms/Privacy content
- `delete_user` — Allows users to delete their own account

---

*Magkanotoll — Know your toll before you roll.*
