# Magkanotoll: A Mobile-Based Toll Fee Estimation Application

---

## Overview

**Magkanotoll** (from the Filipino word *"Magkano"* meaning *"How much?"* + *"Toll"*) is a mobile application built with React Native (Expo) that helps Filipino motorists estimate toll fees across major Philippine expressways. It also provides trip planning tools, RFID card management, and an AI-powered chatbot for expressway-related queries.

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
Displays a visual map of the route between the selected origin and destination toll plazas.

**How it works:**
- Each toll plaza in the app has stored GPS coordinates (latitude and longitude).
- When a route is calculated, the app calls the **OSRM (Open Source Routing Machine)** API (`https://router.project-osrm.org`) using the coordinates of the entry and exit plazas.
- OSRM returns the actual road geometry (a series of GPS points) of the driving route.
- The app renders this as a polyline on an interactive map using **React Native Maps / Leaflet**, showing the exact path the motorist would take on the expressway.

---

### 4. Trip Statistics (Distance, ETA, Gas Estimate)

**What it does:**
After calculating a toll, the app also estimates the **total distance**, **estimated travel time (ETA)**, and **fuel consumption** for the trip.

**How it works:**
- The app calls the OSRM API for each segment of the trip to get the driving distance (in km) and duration (in minutes).
- These are summed across all segments to get the total trip distance and ETA.
- **Gas consumption** is estimated using a baseline fuel efficiency per vehicle class:
  - Class 1 (sedan/SUV): **15 km/L**
  - Class 2 (bus/jeep): **8 km/L**
  - Class 3 (heavy truck): **6 km/L**
- A **speed efficiency multiplier** is applied based on the average speed of the route:
  - Below 40 kph → 75% efficiency (heavy traffic)
  - 40–60 kph → 90% efficiency
  - 60–80 kph → 100% efficiency (optimal highway speed)
  - 80–100 kph → 95% efficiency
  - Above 100 kph → 88% efficiency (higher fuel burn at high speed)
- The formula used is: `Gas (L) = Distance (km) ÷ (Base km/L × Speed Multiplier)`

---

### 5. Trip Cost Sharing

**What it does:**
Helps users split the total trip cost (toll + gas) among multiple passengers.

**How it works:**
- After a toll is calculated, the user can open the **Trip Cost Sharing** panel.
- The user inputs the **current gas price per liter** (default: ₱65/L) and the **number of passengers** (1–20).
- The app computes:
  - **Gas cost** = Gas liters (from trip stats) × Gas price per liter
  - **Total trip cost** = Toll fee + Gas cost
  - **Cost per person** = Total trip cost ÷ Number of passengers
- This helps carpoolers and group travelers fairly divide expenses.

---

### 6. Saved Routes

**What it does:**
Allows signed-in users to bookmark frequently used routes for quick access.

**How it works:**
- After calculating a toll, users can save the route with a custom label (e.g., "Daily Commute", "Weekend Trip to Batangas").
- Saved routes are stored in **Supabase** (a cloud database) linked to the user's account.
- On the home screen, up to 5 saved routes appear as quick-access cards — tapping one auto-fills the calculator with that route's origin, destination, and vehicle class.
- Users can edit the label or delete saved routes from the Saved Routes tab.

---

### 7. Calculation History

**What it does:**
Keeps a log of all toll calculations the user has made, with spending analytics.

**How it works:**
- Every time a toll is calculated, the result is automatically saved to the user's history in **Supabase**.
- The History tab shows:
  - A **bar chart** of total toll spending for the last 6 months (grouped by month).
  - A list of all past calculations showing origin, destination, vehicle class, toll amount, and date/time.
- Users can **export their history as a CSV file** (comma-separated values) for use in spreadsheets or reports.
- Users can also **clear all history** with a confirmation prompt.
- History is only available to signed-in users (not available in guest/anonymous mode).

---

### 8. RFID Card Manager

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
- Users can also copy their card number to clipboard or delete saved cards.

---

### 9. TollBot (AI Chatbot)

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

### 10. User Authentication

**What it does:**
Allows users to create an account, log in, and access personalized features (history, saved routes, RFID cards).

**How it works:**
- Authentication is handled by **Supabase Auth**.
- Users can:
  - **Sign up** with email and password
  - **Confirm their email** via a verification link
  - **Log in** with their credentials
  - **Reset their password** via email
- The app also supports **guest/anonymous mode** — users can use the toll calculator without signing in, but history, saved routes, and RFID management require an account.

---

### 11. Expressway Information

**What it does:**
Provides reference information about each expressway covered by the app.

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

## Technology Stack

| Layer | Technology |
|---|---|
| Mobile Framework | React Native (Expo) |
| Language | TypeScript |
| Styling | NativeWind (Tailwind CSS for React Native) |
| Backend / Database | Supabase (PostgreSQL + Auth) |
| Toll Fee Data | expressway.ph API |
| Routing / Maps | OSRM (Open Source Routing Machine) |
| AI Chatbot | Google Gemini 2.5 Flash |
| State Management | Zustand |

---

*Magkanotoll — Know your toll before you roll.*
