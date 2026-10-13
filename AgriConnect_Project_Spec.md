# AgriConnect: Project Spec for Prototype Build

> Paste this file into Antigravity as the project brief. Build the **MVP prototype** described below. Do not add features outside the "MVP Scope" section.

## 1. Project Summary

**Name:** AgriConnect
**Tagline:** Farmer-to-Market Direct Marketplace
**Challenge:** Seva First Innovation Challenge 2026 (Maharashtra zone), Smart Agriculture & Rural Innovation
**Team ID:** SEVA24E4 | **Team Lead:** Anushka Harish Jadhav | **Team size:** 4
**Pilot area:** Nashik district, Maharashtra
**Current stage:** Idea with UI mockups. No working prototype yet. This build is the first one.

**One line:** A lightweight, mobile-first web platform where farmers list produce and price, nearby buyers connect with them directly, and a live government mandi reference price on every listing builds trust on both sides.

**Core idea:** *"Farmers list what they have and at what price. Buyers nearby see it and connect directly. No middleman markup."*

## 2. Problem

Small and marginal farmers in Maharashtra lose an estimated 30-50% of potential income to middlemen (arhtiyas / commission agents) in the traditional mandi system. (Team estimate. Validate with APMC data and a farmer survey before claiming it publicly.)

- **No price transparency:** farmers don't know the fair rate before selling.
- **Forced distress selling:** perishables must be sold immediately at whatever price is offered.
- **No direct buyer access:** retailers, hotels, hostels and bulk buyers can't easily source from nearby farms.
- **Payment delays and disputes:** cash-based, undocumented transactions.

AgriConnect does **not** replace mandis. It gives farmers a credible, low-friction alternative that recovers margin lost to middlemen.

## 3. Users

| User | Who | Needs |
|---|---|---|
| **Farmer** (primary) | Small/marginal farmers, women farmers, self-help groups. Low literacy, low connectivity, mostly on Android phones. | List produce fast, see fair price, get buyer enquiries |
| **Buyer** | Local retailers, hotels, hostels, mess/canteens, bulk purchasers, households | Find nearby fresh produce at fair prices, contact farmers directly |
| **Admin** (minimal) | Team / pilot coordinator | Verify users, remove bad listings |

## 4. MVP Scope (build only this)

### Farmer features
1. Sign up / log in with mobile number + OTP (mock OTP `123456` in prototype).
2. Create a listing: crop, quantity (kg/quintal), asking price per kg/quintal, village/taluka, available-until date, optional photo.
3. See the **mandi reference price** for that crop next to the asking price, with a clear indicator: *Below / Near / Above mandi price*.
4. View and manage own listings (edit, mark sold, delete).
5. See buyer enquiries on each listing and tap to call / WhatsApp the buyer.

### Buyer features
1. Sign up / log in (same OTP flow), choose buyer type (retailer, hotel, hostel, bulk, household).
2. Browse listings by crop, distance/taluka, price, freshness.
3. Each listing card shows farmer asking price **vs** mandi reference price and the saving or premium.
4. Send an enquiry ("I want X kg") and call / WhatsApp the farmer.

### Shared
- **Mandi price panel:** crop-wise reference prices (min / modal / max) for Nashik-region markets.
- **Languages:** English, Marathi, Hindi (simple toggle). UI strings in a single i18n file.
- **Mobile-first, low-data:** works on slow connections; small bundle, no heavy images.

### Admin (optional, if time allows)
- Simple list of users and listings with a remove button.

## 5. Non-Goals (do NOT build in the prototype)

- Online payment gateway, escrow, or UPI integration (roadmap)
- Logistics / delivery booking, cold-chain, inventory automation (roadmap)
- AI/ML recommendations, IoT, drones
- Real SMS OTP provider (use a mock)
- Native Android/iOS app (use a responsive PWA-style web app)

## 6. Key Differentiator

**Live government mandi reference price built into every direct listing**, so trust comes from the core mechanic rather than being promised afterward. Keep this visible on every listing card and on the create-listing form.

## 7. Suggested Tech Stack (change if Antigravity suggests better)

- **Frontend:** React + Vite + Tailwind CSS, responsive and mobile-first, PWA-ready
- **Backend:** Node.js + Express (or FastAPI)
- **Database:** SQLite for prototype (PostgreSQL later); Prisma or SQLAlchemy
- **Auth:** Mobile number + mock OTP, JWT session
- **i18n:** `react-i18next` with `en.json`, `mr.json`, `hi.json`
- **Mandi price data:** build behind an adapter (see section 9)

## 8. Data Model

```text
User
  id, name, mobile (unique), role [farmer|buyer|admin], buyer_type?,
  language [en|mr|hi], village?, taluka?, district, created_at

Crop (reference table)
  id, name_en, name_mr, name_hi, unit_default [kg|quintal], category

Listing
  id, farmer_id -> User, crop_id -> Crop,
  quantity, unit, asking_price, price_unit,
  village, taluka, district, available_until,
  photo_url?, status [active|sold|expired], created_at

Enquiry
  id, listing_id -> Listing, buyer_id -> User,
  quantity_wanted, message?, status [new|contacted|closed], created_at

MandiPrice
  id, crop_id -> Crop, market_name, district,
  min_price, modal_price, max_price, unit, price_date, source
```

## 9. Mandi Price Integration

- Build a `MandiPriceProvider` interface: `getPrices(cropId, district) -> {min, modal, max, unit, date, source}`.
- **Prototype:** implement `MockMandiPriceProvider` with seeded realistic data for 10 common Nashik-area crops (onion, tomato, grapes, pomegranate, potato, cabbage, cauliflower, brinjal, soybean, wheat). Label them "Sample data" in the UI.
- **Next step:** add a `GovMandiPriceProvider` that reads from the government open data / Agmarknet source and caches daily. Verify the current API access terms and format before integrating.
- Price indicator logic: compare `asking_price` to `modal_price`.
  - Within +/-5%: **Near mandi price**
  - Below -5%: **Below mandi price** (good for buyers)
  - Above +5%: **Above mandi price**

## 10. Screens

**Farmer app**
1. Welcome / language select
2. Login (mobile + OTP)
3. Home: "My listings" + big "+ Add produce" button
4. Add listing form (crop picker with icons, quantity, price, location, date) with live mandi price hint
5. Listing detail: enquiries list with call/WhatsApp buttons
6. Mandi prices tab

**Buyer app**
1. Welcome / language select
2. Login + buyer type
3. Browse listings (filters: crop, taluka, price, newest)
4. Listing detail: price vs mandi, farmer info, "Send enquiry", call/WhatsApp
5. My enquiries
6. Mandi prices tab

## 11. UX and Design Rules

- **Low literacy first:** big buttons, crop icons/images, minimal typing, short sentences, local-language labels.
- **Low connectivity:** lightweight pages, lazy-load images, show cached last-known prices when offline.
- **Trust cues:** show mandi price, "verified mobile" badge, listing date.
- **Colour:** agriculture-themed (green primary, warm accent), high contrast, large touch targets (min 48px).
- Accessibility: readable font sizes, clear focus states, no information by colour alone.

## 12. API Sketch

```text
POST /auth/request-otp        { mobile }
POST /auth/verify-otp         { mobile, otp, role?, name? } -> { token, user }
GET  /crops
GET  /mandi-prices?crop_id&district
POST /listings                (farmer)
GET  /listings?crop_id&taluka&sort
GET  /listings/:id
PATCH /listings/:id           (owner)
DELETE /listings/:id          (owner)
POST /listings/:id/enquiries  (buyer)
GET  /me/listings             (farmer)
GET  /me/enquiries            (farmer: received, buyer: sent)
```

## 13. Seed Data

- 10 crops with English / Marathi / Hindi names
- Mandi prices for each crop (sample data, dated today)
- 3 demo farmers, 3 demo buyers (hostel, hotel, retailer)
- 12 demo listings across Nashik taluka names (e.g., Nashik, Niphad, Sinnar, Dindori, Igatpuri)

## 14. Build Order for the Agent

1. Scaffold project, Tailwind, routing, i18n with 3 languages.
2. Database schema + seed script.
3. Mock auth (OTP `123456`) + role-based routing.
4. Mandi price provider (mock) + price indicator component.
5. Farmer: add / manage listings.
6. Buyer: browse, filter, listing detail, enquiry, call/WhatsApp links.
7. Mandi prices tab.
8. Polish: responsive layout, empty states, loading states, error states.
9. README with run instructions and demo credentials.

## 15. Acceptance Criteria (demo-ready)

- A farmer can sign up, add a listing in under 60 seconds, and see the mandi price comparison.
- A buyer can find that listing, see the price vs mandi indicator, and send an enquiry.
- The farmer sees the enquiry and can tap to call or WhatsApp.
- UI switches between English, Marathi and Hindi.
- Works smoothly on a phone-sized screen.

## 16. Demo Script (for judges)

1. Open as farmer: add "Onion, 500 kg, Rs 18/kg, Niphad". The app shows the mandi reference price and "Near mandi price".
2. Switch to buyer (a hostel): browse, filter by onion, open the listing, see the saving vs mandi price, send enquiry.
3. Back to farmer: see the enquiry and tap call.
4. Show the Marathi UI toggle and the mandi prices tab.
5. Close with the impact line: more income for farmers, fairer prices for buyers, no middleman markup.

## 17. Assumptions to Validate Later

- 30-50% income loss to middlemen (needs source or survey)
- 5,000+ farmers in the pilot area (target estimate)
- 10-15% farmer income uplift (target, to validate in pilot)
- 500+ buyers onboarded (target)
- Revenue model (small buyer-side fee or premium listings, free for farmers) is a proposal, not tested

## 18. Roadmap (after prototype)

- **3 months:** working MVP with real mandi price feed
- **6 months:** field pilot in one Nashik taluka with farmers and local buyers (hostels, retailers, hotels)
- **12 months:** extend to nearby districts; explore payments and logistics
- **Partners to approach:** APMC and Agriculture Department, farmer producer organisations (FPOs), local hotels, hostels and retailers

## 19. Starter Prompt to Paste into Antigravity

> Read `AgriConnect_Project_Spec.md`. Build the MVP prototype exactly as scoped in sections 4-14. Start by proposing a short plan, then scaffold the project, seed the database, and implement farmer and buyer flows with a mock mandi price provider. Keep the UI mobile-first, simple and multilingual (English, Marathi, Hindi). Do not build anything listed under Non-Goals. When done, give me run instructions and demo credentials.
