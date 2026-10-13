# 🌾 AgriConnect (Nashik Pilot Prototype)

> **Farmer-to-Market Direct Marketplace**  
> Seva First Innovation Challenge 2026 • Maharashtra Zone (Smart Agriculture & Rural Innovation)  
> **Team ID:** SEVA24E4 | **Team Lead:** Anushka Harish Jadhav | **Pilot Area:** Nashik District, Maharashtra

---

## 1. Overview & Core Mechanic
AgriConnect connects small and marginal farmers across Nashik district directly with local commercial buyers (hostels, hotels, mess halls, retail marts, households). 

### Core Differentiator: Mandi Reference Pricing
Every direct listing displays the farmer's asking price **side-by-side with the APMC Mandi reference price** (e.g., Lasalgaon APMC, Nashik APMC, Pimpalgaon APMC) with clear real-time comparison badges:
- 🟢 **Below Mandi Price**: Immediate savings for buyers; faster clearance for farmers.
- 🔵 **Near Mandi Price**: Within ±5% fair market benchmark.
- 🟡 **Above Mandi Price**: Premium quality or graded/organic produce.

---

## 2. Tech Stack & Architecture

- **Frontend**: React 19, Vite, Tailwind CSS (agriculture design system, 48px+ touch targets), Lucide Icons, `canvas-confetti`
- **Internationalization (i18n)**: `react-i18next` supporting **मराठी (Marathi)**, **हिंदी (Hindi)**, and **English** with instant header toggle and persistent storage
- **Backend**: Node.js, Express, SQLite (`better-sqlite3`), JWT authentication
- **Mandi Price System**: `MandiPriceProvider` interface with a `MockMandiPriceProvider` delivering realistic Nashik APMC benchmarks labeled as *"Sample data"* per spec requirements
- **Mobile-First UX**: Responsive mobile navigation with bottom bar and 1-tap "Mobile Frame Preview" toggle for live demonstration

### Directory Layout
```text
Agriconnect/
├── server/
│   ├── db/
│   │   ├── schema.sql         # SQLite schema (users, crops, listings, enquiries, mandi_prices)
│   │   ├── db.js             # SQLite connection & WAL pragma
│   │   └── seed.js           # Reset script: 10 crops, 12 listings, 7 demo accounts
│   ├── providers/
│   │   └── mandiProvider.js  # MandiPriceProvider interface & comparison logic
│   ├── routes/               # Express endpoints (auth, crops, mandi, listings, me, admin)
│   ├── middleware/auth.js    # JWT verification
│   └── server.js             # API entrypoint (Port 5001)
├── client/
│   ├── src/
│   │   ├── components/       # MandiBadge, CropIcon, ListingCard, EnquiryModal, Navbar, BottomNav
│   │   ├── pages/            # HomeFarmer, AddListing, BrowseBuyer, FarmerEnquiries, BuyerEnquiries, MandiPricesPage, Login
│   │   ├── locales/          # en.json, mr.json, hi.json
│   │   ├── context/          # AuthContext (includes quick 1-tap persona selector)
│   │   ├── api.js            # API client wrapper
│   │   └── i18n.js           # i18next configuration
│   └── vite.config.js        # Vite dev server with proxy to backend
├── .env / .env.example
├── package.json
└── README.md
```

---

## 3. Quick Start (1 Install & 1 Start Command)

### Prerequisites
- Node.js v18+ (tested on Node v25)
- npm

### Installation
Run from project root:
```bash
npm run install:all
```
*(Installs both backend and frontend dependencies)*

### Run Seed Script (Reset Database to Demo State)
```bash
npm run seed
```
*(Populates 10 crops, 10 mandi benchmarks, 3 farmers, 3 buyers, 12 listings across Nashik talukas, and 3 sample enquiries)*

### Start Development Server
```bash
npm run dev
```
- App Frontend: **http://localhost:5173**
- Backend API: **http://localhost:5001**

---

## 4. Demo Login Credentials

The prototype features a **1-Tap Demo Switcher** in the header navigation bar to swap between roles during demonstrations without manual re-typing.

Mock OTP for all logins: **`123456`**

| Role | Name | Mobile | Taluka | Persona Details |
|---|---|---|---|---|
| **Farmer** | Ramesh Patil | `9822011111` | Niphad (Kundewadi) | Onion & Tomato grower |
| **Farmer** | Sunita Shinde | `9822022222` | Sinnar (Musalgaon) | Pomegranate & Soybean farmer |
| **Farmer** | Dnyaneshwar Borde | `9822033333` | Dindori (Vani) | Potato & Cauliflower grower |
| **Buyer** | Anand Mess & Hostel | `9822044444` | Nashik (Gangapur Rd) | Hostel mess bulk purchaser |
| **Buyer** | Hotel Panchavati | `9822055555` | Nashik (Panchavati) | Commercial hotel kitchen buyer |
| **Buyer** | Kisan Fresh Mart | `9822066666` | Niphad (Pimpalgaon) | Retail produce shop owner |

---

## 5. 5-Step Demo Script (Matches Spec Section 16)

1. **Farmer Adds Listing**:
   - Log in as **Ramesh Patil** (or click Ramesh Patil under Demo User).
   - Tap **"+ Add Produce"** (or **"+ शेतमाल जोडा"**).
   - Select **Onion** (🧅), Quantity: **`500 kg`**, Price: **`₹18/kg`**, Taluka: **`Niphad`**.
   - Notice the live dynamic Mandi reference box updates in real-time to **"Near mandi price"** (Lasalgaon APMC modal rate: ₹18/kg).
   - Click **"Publish Listing"** (confetti triggers, listing is now live).

2. **Buyer Browses & Enquires**:
   - In the top bar, switch to **Anand Mess & Hostel** (Buyer).
   - Browse the marketplace, filter by **Onion** or **Niphad**.
   - Open Ramesh Patil's listing; observe the transparent Mandi comparison.
   - Tap **"Send Enquiry"**, enter **`200 kg`**, message: *"Need for Friday hostel kitchen mess pickup"*, and submit.

3. **Farmer Receives Direct Connection**:
   - Switch back to **Ramesh Patil** (Farmer).
   - Click **"Enquiries"** (or view enquiries badge on the listing card).
   - See Anand Mess's enquiry for 200 kg.
   - Tap **"Call Buyer"** (`tel:9822044444`) or **"WhatsApp"** to initiate direct communication with zero middleman markup.

4. **Multilingual & Mandi Rates Tab**:
   - Switch language in the top navbar: **मराठी (Marathi)** ➔ **हिंदी (Hindi)** ➔ **English**.
   - Navigate to the **"Mandi Rates"** tab to see APMC benchmark rates for Lasalgaon, Nashik, Pimpalgaon, Sinnar, and Dindori with the explicit *"Sample data"* notice.

5. **Pitch Impact Close**:
   - *"Small farmers retain up to 30% higher margins, local buyers save procurement costs, and live Mandi benchmark data establishes instant mutual trust."*

---

## 6. What is Mocked vs Production Requirements

| Feature | Prototype (Current MVP) | Production Transition Plan |
|---|---|---|
| **Mandi Price Feed** | `MockMandiPriceProvider` using realistic seeded benchmarks for Nashik APMCs; labeled *"Sample data"* | `GovMandiPriceProvider` connecting to Agmarknet / Maharashtra APMC open data feeds with Redis caching |
| **Authentication** | Mock OTP (`123456`) verified via Express backend | Real SMS gateway (e.g., MSG91, Twilio, or government CDAC SMS portal) |
| **Payments** | Non-goal for MVP; cash on pickup or direct farmer-buyer agreement | UPI Intent flow, escrow, or digital invoicing |
| **Logistics** | Non-goal for MVP; self-pickup or buyer-arranged transport | Local Nashik rural transport partner network (tempos / pickup trucks) |
| **Database** | SQLite with WAL mode (`agriconnect.db`) | Hosted PostgreSQL with automated backups |
