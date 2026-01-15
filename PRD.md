# Product Requirement Document (PRD) - 100 Days Activities Explorer

## 1. Project Overview
The **100 Days Activities Explorer** is a high-impact, interactive web application designed to visualize and manage global efforts for the "Child Marriage Free World" campaign. It provides a real-time (via CMS) map of school pledges, community events, and government engagements across the globe.

## 2. Target Audience
- **Public Users:** Donors, activists, and the general public interested in following the campaign's progress.
- **Campaign Partners:** Organizations on the ground who need to register and report their localized actions.
- **Admin Users:** Regional directors and managers who approve submissions and manage the overall campaign data.

## 3. Key Functional Requirements

### 3.1 Interactive Map Visualization
- **Dual Representation:** Capability to toggle between a 3D Globe (D3 orthographic) and a 2D Flat Map (D3 mercator).
- **Auto-Rotation:** The globe should gently rotate when idle, stopping on user interaction.
- **Country Selection:** Clicking a country displays its specific campaign status, active schools, and aggregate pledge counts.
- **Activity Hotspots:** Visual markers (circles) representing specific events. Clicking a marker reveals detailed activity info.

### 3.2 Activity Management (CMS)
- **Reporting Interface:** A Tally.so-powered form for field partners to register events.
- **Automatic Geocoding:** Integration with browser geolocation and Nominatim to convert addresses/locations into map coordinates.
- **Admin Approval Queue:** Submissions are held in a `pending` state until an admin reviews and approves them for public display.
- **Dynamic Content:** Ability for admins to add rich body text (Markdown) and images to both activities and country profiles.

### 3.3 Theming & UX
- **Brand Consistency:** Strict adherence to the "Brand Red" palette and premium aesthetics.
- **Responsive Design:** Seamless transition between desktop and mobile modes (sidebar InfoPanel becomes a bottom drawer).
- **Premium Iconography:** Use of Boxicons for consistent, professional visual cues.

## 4. Technical Constraints
- **Framework:** React 19 + Vite + TypeScript.
- **Visualization Core:** D3.js (no high-level map wrappers like Leaflet or Mapbox).
- **Backend:** Supabase (Auth, Database, Edge Functions).
- **Deployment:** Netlify for frontend, Supabase Cloud for data.
- **Performance targets:** <100ms interaction response; bundled TopoJSON <100KB.

## 5. Success Metrics
- **Data Accuracy:** 100% synchronization between ground reports and map markers.
- **User Engagement:** Active use of the "Register a Pledge" feature by global partners.
- **Performance:** Smooth 60fps rotation/zoom performance across modern devices.
