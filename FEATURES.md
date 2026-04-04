# Magkanotoll: A Mobile-Based Toll Fee Estimation Application

---

## Overview

**Magkanotoll** (from the Filipino word *"Magkano"* meaning *"How much?"* + *"Toll"*) is a mobile application built with React Native (Expo) that helps Filipino motorists estimate toll fees across major Philippine expressways. It provides trip planning tools, vehicle-based fuel estimation, RFID card management, saved routes, calculation history, and an AI-powered chatbot for expressway-related queries.

---

## Features

---

### 1. Toll Fee Calculator

**What it does:**
The core feature of the app. Users select an entry (origin) toll plaza and an exit (destination) toll plaza, choose their vehicle class, and the app returns the estimated toll fee for that trip.

**How it works:**
- The user picks an origin and destination plaza from a list organized by expressway (e.g., NLEX, SLEX, TPLEX, etc.).
- The user selects their **vehicle class**:
  - **Class 1** — Cars, SUVs, vans, motorcycles
  - **Class 2** — Buses, jeepneys, light trucks
  - **Class 3** — Heavy trucks, trailers
- The app sends a request to the **expressway.ph Toll Calculator API** (`https://www.expressway.ph/api/toll-calculator`) with the origin plaza, destination plaza, and vehicle class.
- The API returns the total toll fee, a breakdown per expressway segment, and the RFID system required (EasyTrip or Autosweep).
- If the trip passes through multiple expressways (e.g., NLEX → Skyway Stage 3), the result shows each segment separately with its corresponding toll.
- Results appear in a **bottom sheet modal** that slides up from the bottom of the screen, keeping the calculator form visible behind it.

**Where the toll data comes from:**
Toll fees are sourced from the official **expressway.ph** API, which reflects the rates set by the Toll Regulatory Board (TRB) of the Philippines. The app does not hardcode toll amounts — it fetches them live from the API to ensure accuracy.

---

### 2. Alternative Routes

**What it does:**
After calculating a toll, the app also shows **alternative routes** (if available) so users can compare different paths and choose the most cost-effective one.

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
- The app renders this as an animated polyline on a dark-themed map using **Leaflet** (rendered inside a WebView), showing the exact path the motorist would take.
- Plaza markers are shown at entry and exit points with color-coded dots (green = start, red = end, yellow = intermediate).
- Users can pan and pinch-to-zoom the map, and tap "Open in Google Maps" to get turn-by-turn navigation.

---

### 4. Trip Statistics (Distance, ETA, Fuel Estimate)

**What it does:**
After calculating a toll, the app estimates the **total distance**, **estimated travel time (ETA)**, and **fuel consumption** for the trip — personalized to the user's saved vehicle if available.

**How it works:**
- The app calls the OSRM API for each segment of the trip to get the driving distance (in km) and duration (in minutes).
- These are summed across all segments to get the total trip distance and ETA.
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
- **Electric vehicles** return 0 liters — no fuel cost is calculated.
- A **speed efficiency multiplier** is applied based on average route speed:
  - Below 40 kph → 75% (heavy traffic)
  - 40–60 kph → 90%
  - 60–80 kph → 100% (optimal highway speed)
  - 80–100 kph → 95%
  - Above 100 kph → 88% (higher burn at high speed)
- Formula: `Gas (L) = Distance (km) ÷ (Engine km/L × Speed Multiplier)`
- If the user has no saved vehicle, the app falls back to class-based defaults (Class 1 = 15 km/L, Class 2 = 8 km/L, Class 3 = 6 km/L).

---

### 5. Trip Cost Sharing

**What it does:**
Helps users split the total trip cost (toll + fuel) among multiple passengers.

**How it works:**
- After a toll is calculated, the Trip Cost Sharing panel appears inside the result sheet.
- The user inputs the **current fuel price per liter** and the **number of passengers** (1–20).
- Default fuel price is automatically set based on the saved vehicle's fuel type:
  - Gasoline → ₱65/L default
  - Diesel → ₱60/L default
  - Electric → fuel section is hidden entirely
- The app computes:
  - **Fuel cost** = Fuel liters × Fuel price per liter
  - **Total trip cost** = Toll fee + Fuel cost
  - **Cost per person** = Total trip cost ÷ Number of passengers
- A vehicle badge shows which saved vehicle's specs are being used for the estimate, including the effective km/L rate.

---

### 6. Saved Vehicles

**What it does:**
Allows signed-in users to save their vehicle details so the app can calculate more accurate fuel estimates.

**How it works:**
- Users manually enter their vehicle details:
  - **Nickname** (e.g., "My Innova", "Work Truck")
  - **Year**, **Make**, **Model**
  - **Engine Displacement** in cc (for ICE/Hybrid vehicles)
  - **Battery Capacity** in kWh (for Electric vehicles)
  - **Fuel Type** — Gasoline, Diesel, LPG, Electric, or Hybrid
  - **Toll Vehicle Class** (Class 1 / 2 / 3)
- Vehicle data is stored in **Supabase** under the user's account.
- The first saved vehicle is automatically used for fuel calculations in the toll result.
- Users can edit or delete saved vehicles from the Vehicles tab in the Profile page.
- Electric vehicles automatically disable all fuel-related calculations and display "Electric — no fuel cost" throughout the app.

---

### 7. Saved Routes

**What it does:**
Allows signed-in users to bookmark frequently used routes for quick access.

**How it works:**
- After calculating a toll, users can save the route with a custom label (e.g., "Daily Commute", "Weekend Trip to Batangas") directly from the result sheet — no modal required.
- Saved routes are stored in **Supabase** linked to the user's account.
- On the home screen, up to 5 saved routes appear as quick-access cards — tapping one auto-fills the calculator with that route's origin, destination, and vehicle class.
- Users can edit the label or delete saved routes from the Saved tab in the Profile page.

---

### 8. Calculation History

**What it does:**
Keeps a log of all toll calculations the user has made, with monthly spending analytics.

**How it works:**
- Every time a toll is calculated, the result is automatically saved to the user's history in **Supabase**.
- The History section (inside the Profile tab) shows:
  - A **bar chart** of total toll spending for the last 6 months (grouped by month).
  - A list of all past calculations showing origin, destination, vehicle class, toll amount, and date/time.
- Users can **export their history as a CSV file** for use in spreadsheets or reports.
- Users can also **clear all history** with a confirmation prompt.
- History is only available to signed-in users.

---

### 9. RFID Card Manager

**What it does:**
Lets users save their RFID card numbers and check their balance via SMS with one tap.

**How it works:**
- The Philippines uses two RFID systems for expressway toll payment:
  - **EasyTrip** — used on NLEX, SCTEX, TPLEX, NLEX Connector, and NLEX Harbor Link
  - **Autosweep** — used on SLEX, STAR Tollway, Skyway, CALAX, CAVITEX, MCX, and NAIAX
- Users can add their 16-digit RFID card number with a custom nickname (e.g., "My EasyTrip Card").
- Cards are stored securely in **Supabase** under the user's account.
- To check balance, the user taps **"Check Balance via SMS"** — the app opens the phone's SMS app pre-filled with the correct number and message format:
  - EasyTrip: SMS `BAL <card_number>` to **2929**
  - Autosweep: SMS `BAL <card_number>` to **29290**
- Users can copy their card number to clipboard or delete saved cards.

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
- The chat supports multi-turn conversation (it remembers previous messages in the session).
- Suggested questions are shown at the start to help users get started.

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
  - **Reset their password** via email
- **Guest/anonymous mode** is the default — when the app is opened for the first time (after onboarding), the user is automatically signed in as a guest and taken directly to the Home screen. No login required to use the calculator.
- Guest users can use the toll calculator, view the map, and use TollBot freely.
- Features that require an account (history, saved routes, saved vehicles, RFID cards) show a sign-in prompt when accessed by a guest.
- The Profile tab shows a guest screen with Sign In / Sign Up buttons when the user is not authenticated.

---

### 12. Onboarding

**What it does:**
A 4-slide introduction shown the first time the app is opened, explaining the app's key features.

**How it works:**
- Shown only once — after completion, `onboarding_done` is saved to AsyncStorage so it never shows again.
- 4 animated slides with parallax fade and slide transitions:
  1. **Welcome** — shows the MagkanoToll logo
  2. **Route Planner** — explains the toll calculator
  3. **RFID & Cost** — explains cost splitting and RFID wallets
  4. **History** — explains saved routes and history
- After tapping "Get Started" or "Skip", the user is automatically signed in as a guest and taken to the Home screen.

---

### 13. Expressway Information

**What it does:**
Provides reference information about each expressway covered by the app, including toll rate ranges and traffic update links.

**Data available per expressway:**

| Field | Description |
|---|---|
| Full Name | Official name of the expressway |
| Region | Geographic region it serves |
| Total Plazas | Number of toll plazas |
| Length (km) | Total length of the expressway |
| Speed Limit | Minimum and maximum speed in kph |
| Operator | Company that manages the expressway |
| Hotline | Customer service contact number |
| RFID System | EasyTrip or Autosweep |
| Social Media | Official Facebook and Twitter links |
| Plaza List | All toll plazas with GPS coordinates |

**Three sections in the Explore tab:**
- **Info** — full expressway details with expandable cards
- **Rates** — approximate toll rate ranges per vehicle class (Class 1 / 2 / 3)
- **Traffic** — links to official expressway and government social media accounts for real-time traffic updates

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

### 14. Profile Page

**What it does:**
A unified profile page that consolidates the user's account info, history, saved routes, and vehicles in one place.

**How it works:**
- Accessible via the Profile tab in the bottom navigation bar.
- Contains three inner section tabs:
  - **History** — monthly spending bar chart + full calculation list with export/clear
  - **Saved** — all saved routes with edit label and delete
  - **Vehicles** — saved vehicle cards with edit and delete
- Users can tap their avatar to change their profile photo (uploaded to Supabase Storage).
- Users can tap the pencil icon next to their name to edit their display name.
- Settings button in the top right navigates to the Settings page.
- Logout button at the bottom with a confirmation modal.
- Guest users see a lock screen with Sign In / Sign Up buttons instead of the full profile.

---

## UI/UX Details

- **Skeleton loading screens** — all loading states use animated shimmer skeletons instead of spinners, including the toll result stat tiles (ETA, Distance, Gas), history list, saved routes list, and vehicle list.
- **Bottom sheet modal** — toll results slide up from the bottom as a full-height modal sheet; tapping the backdrop or "Start a new calculation" closes it with a smooth animation.
- **AppModal** — all confirmation dialogs, error messages, and warnings use a consistent custom modal component instead of native `Alert`.
- **Fonts** — Lufga font family (Thin through Black weights) used throughout.
- **Colors** — primary `#171717` (dark), accent `#ffc400` (yellow), white, and neutral grays.

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
| Charts | react-native-gifted-charts |
| Fonts | Lufga (custom TTF) |

---

## Supabase Tables

| Table | Purpose |
|---|---|
| `toll_history` | Stores all toll calculations per user |
| `saved_routes` | Stores bookmarked routes per user |
| `saved_vehicles` | Stores vehicle details per user |
| `rfid_cards` | Stores RFID card numbers per user |

All tables use **Row Level Security (RLS)** — users can only read, insert, update, and delete their own rows.

---

*Magkanotoll — Know your toll before you roll.*
