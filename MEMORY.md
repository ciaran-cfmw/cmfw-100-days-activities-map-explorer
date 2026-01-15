# 🧠 Project Memory & Architectural Decision Records (ADR)

This file serves as the **institutional memory** for the "Child Marriage Free World" project.
**Agent Instruction:** Read this file before proposing architectural changes or writing complex D3 logic.

---

### 001. Core Tech Stack (Date: 2026-01-12)
* **Decision:** React 19, Vite, TypeScript, D3.js (v7).
* **Why:** High-performance rendering required for interactive map; React 19 for modern concurrency; Vite for speed.
* **Rule:** Do not introduce heavy UI libraries (like MUI) unless necessary. Stick to Headless UI + Tailwind.

### 002. The "Black Box" D3 Pattern (Date: 2026-01-12)
* **Decision:** Use the `useRef` + `useEffect` pattern for D3. React handles the container DOM element; D3 handles all internal DOM manipulation.
* **Why:** Prevents React's Virtual DOM from fighting with D3's direct DOM manipulation, ensuring performance and preventing rendering bugs.
* **Rule:** **Never** render SVG map paths using React JSX loops (e.g., `data.map(d => <path />)`). Always use `d3.select().data().join()`.

### 003. Inline Tailwind Configuration (Date: 2026-01-12)
* **Decision:** Tailwind CSS is configured via the CDN script tag in `index.html`, not a build-time `tailwind.config.js`.
* **Why:** Allows for runtime theming adjustments and simplifies the build pipeline for this specific architecture.
* **Rule:** **DO NOT** look for or edit `tailwind.config.js`. Apply theme updates (colors, fonts) directly to the `<script>` tag in `index.html`.

### 004. GeoJSON Coordinate Order (Date: 2026-01-12)
* **Decision:** All map data must adhere to the `[Longitude, Latitude]` format.
* **Why:** D3.js and most standard GIS tools expect `[x, y]`. Many datasets provide `[Lat, Lon]`, causing the map to render sideways or mirrored.
* **Rule:** Verify coordinate order before importing new data. `[34, -0.6]` is Kenya. `[-0.6, 34]` is the ocean.

### 005. Data Source & Fallbacks (Date: 2026-01-13)
* **Decision:** Primary data source is **Supabase**. Secondary fallback is static JSON (`src/data/`).
* **Why:** Ensures the app remains functional even if the backend is unreachable or during local development without a DB connection.
* **Rule:** Always implement checking for `error` or `!data` from Supabase hooks and revert to `FALLBACK_ACTIVITIES` or `FALLBACK_COUNTRIES`.

### 006. Tally Integration for Forms (Date: 2026-01-14)
* **Decision:** Use Tally.so for "Register a Pledge" and data intake forms.
* **Why:** Reduces development overhead for complex forms; Tally provides a polished UI and easy embedding.
* **Rule:** Use the Global CTA button to trigger the Tally popup. Ensure the `window.Tally` object is properly typed or ignored in TS.

### 007. Documentation Privacy (Date: 2026-01-14)
* **Decision:** Exclude internal documentation (`TASKS.md`, `MEMORY.md`, `AGENTS.md`) from public access.
* **Why:** These files contain project logic and agent instructions not meant for end-users.
* **Rule:** Ensure build scripts or `.gitignore` (if applicable for deployment) prevent these modification files from being served.

### 008. Recurring Bug: India Boundary (Date: 2026-01-13)
* **Issue:** Rendering incorrect or politically sensitive boundaries for India.
* **Resolution:** Must use a specific, officially compliant GeoJSON that includes Jammu & Kashmir and Ladakh.
* **Rule:** When updating map data/TopoJSON, manually verify the India feature geometry.

### 009. Hook-Based Map Geometry (Date: 2026-01-14)
* **Decision:** Extracted rotation and interaction logic from `WorldMap.tsx` into specialized hooks (`useAutoRotation.ts`, `useMapInteraction.ts`).
* **Why:** The `WorldMap.tsx` file was exceeding 1,000 lines, making it difficult to maintain. Decoupling the "Math" (rotation/zoom logic) from the "Renderer" (D3 selection logic) improves testability and readability.
* **Rule:** New map-wide interactions (e.g., custom pan limits) should be added to `useMapInteraction`, not directly to the `WorldMap` component.

### 010. Dual-Mode Tally Registration (Date: 2026-01-14)
* **Decision:** Implemented a `TallyEmbed` component with an `autoDetectLocation` toggle. 
* **Why:** Admins frequently register events from a different location than where they occurred. Public users should have their location detected for the "Pin Drop" feature (approved hotspots), whereas Admins should use manual geocoding to avoid incorrect markers.
* **Rule:** Always set `autoDetectLocation={false}` when opening the registration form from the Admin Dashboard.

### 011. Relative Campaign Timing (Date: 2026-01-14)
* **Decision:** Replaced the "Day X" counter with an explicit `event_date` (DATE) field in the database and UI.
* **Why:** The client expressed concern that displaying "Day 80" for an event registered late in the 100-day cycle might create a negative impression of "late entry." Actual calendar dates (e.g., "15 Oct 2025") provide better context without the psychological pressure of a counter.
* **Rule:** Use the `formatEventDate` helper in `MapExplorer.tsx` to ensure consistent date formatting across the UI.

### 012. Iconography Migration (Date: 2026-01-14)
* **Decision:** Migrated from standard emojis to the **Boxicons** icon set (v2.1.4).
* **Why:** Emojis are OS-dependent and often look inconsistent or unprofessional in a premium map application. Boxicons provide a unified, sharp aesthetic and better alignment with the brand's typography.
* **Rule:** Load Boxicons via the CDN link in `index.html`. For new icons, use the `bx bx-{icon-name}` class pattern within `<i>` tags or as font icons.

### 013. Flexible Event Type Mapping (Date: 2026-01-14)
* **Decision:** Implemented a "Pass-through" mapping strategy for Tally event types.
* **Why:** The Tally form allows for an "Other" category and frequent label changes. By mapping known categories to our internal standard types (e.g., "Faith-based" -> "Faith Leader Action") but allowing unknown values to pass through to the database, we ensure no data is lost and the system remains resilient to form updates.
* **Rule:** The webhook should prioritize the mapping table but always default to the raw input value if no match is found, ensuring "Other" submissions are accurately captured.

### 014. Tally ↔ CMS Field Alignment (Date: 2026-01-14)
* **Decision:** Aligned all Tally form fields with the CMS schema and Edit Activity modal.
* **Fields Mapping:**
  | Tally Field | DB Column | Notes |
  |-------------|-----------|-------|
  | Full name | `submitter_name` | Hidden by default |
  | Type of event | `type` | Mapped via `mapEventType()` |
  | Organisation/Community | `organization` | Optional |
  | Town/District | `title` | Combined with country |
  | Country | `country` | |
  | Event start date | `event_date` | |
  | Event end date (new) | `event_end_date` | Multi-day support |
  | Email | `submitter_email` | Admin only |
* **Rule:** When adding new Tally fields, ensure they are captured in the webhook, added to `types.ts`, and editable in `EditActivityModal.tsx`.

### 015. Date Range Display (Date: 2026-01-14)
* **Decision:** Display multi-day events in compact format: "15–18 Oct 2025" when same month, "15 Oct – 2 Nov 2025" when different months.
* **Why:** Provides clear, scannable date information without overwhelming the UI with repetitive data.
* **Rule:** Use the `formatEventDate(start, end?)` helper in `MapExplorer.tsx` for all date displays.

### 016. High-Contrast Light Mode UI (Date: 2026-01-14)
* **Decision:** Enhanced form field contrast and container definition for Light Mode.
* **Why:** In light mode, the primary background is a very light pink. Semi-transparent white borders and backgrounds were nearly invisible.
* **Rule:** Use `bg-white/40` for inputs in light mode (vs `bg-white/5` in dark mode). Use brand-red tinted borders (`border-brandRed/20`) for interactive elements to ensure clear boundaries.

### 017. Custom Brand-Aligned Select Components (Date: 2026-01-14)
* **Decision:** Replaced native browser `<select>` elements with a custom `CustomSelect.tsx` component.
* **Why:** Native dropdowns are OS-dependent and clashed with the premium brand identity. The custom component allows for smooth animations, consistent colors (brand red highlights), and better integration with both light and dark modes.
* **Rule:** All new dropdowns in the Admin area should use `CustomSelect`. Avoid native browser selects to maintain the "high-end" feel.

### 018. Smart Fallback for Missing Data (Date: 2026-01-14)
* **Decision:** Implemented a string-parsing helper `getCountry(activity)` to extract country names from titles.
* **Why:** Legacy data often had the country name inside the title (e.g., "Kisii County, Kenya") but the `country` column was null. This parser ensures the "Country" filter remains populated even with uncleaned seed data.
* **Rule:** Use `getCountry(a)` logic for UI display and filtering until a full database cleanup script is run.

### 019. Layout: Scrolling & Accessibility (Date: 2026-01-14)
* **Decision:** Removed `overflow-hidden` constraints and rigid heights on Dashboard list containers.
* **Why:** The previous layout used fixed heights which clipped the bottom of the list and sometimes hid the last few entries entirely on smaller screens. 
* **Rule:** Prefer natural page scrolling for long lists in the Admin area. Add generous bottom padding (`pb-24`) to the main container to ensure the last rows are never stuck at the very edge of the viewport.

### 020. Onboarding Animation State (Date: 2026-01-14)
* **Decision:** The "Globe -> Flat -> Globe" intro animation runs strictly once per page mount (session-based) and uses synchronized tooltips.
* **Why:** Demonstrating the dual-view capability immediately helps users discover the "Flat Map" mode they might otherwise miss.
* **Rule:** Do NOT use `sessionStorage` or `localStorage` to persist the "has run" state permanently, as stakeholders prefer the animation to serve as a consistent "wow" moment on first load/refresh during demos.

### 021. Map Legend Overlay (Date: 2026-01-14)
* **Decision:** Implemented a glassmorphic "EVENT" legend in the top-left (below Filter) with animated pulse markers.
* **Why:** The map uses two distinct marker styles (Red/White) for temporal context (Upcoming vs Past). This needs rigorous explanation without forcing the user to click first.
* **Rule:** Legend z-index must be managed carefully (`z-20`) relative to the Filter dropdown (`z-30`) to prevent overlap issues.

### 022. Hybrid India Boundary Strategy (Date: 2026-01-15)
* **Issue:** Resolving the complex geopolitical boundary requirements for India:
  1. Must show official Survey of India boundary for Kashmir/Ladakh (extending to Afghanistan).
  2. Must maintain seamless borders with Nepal, Bangladesh, Bhutan, and Myanmar.
  3. Overlapping polygons from Pakistan (Kashmir) and China (Aksai Chin) caused render artifacts (color blending).
* **Decision:** Adopted a "Hybrid Geometry + Neighbor Clipping" approach.
  1. **Hybrid Geometry:** Merged official Survey of India coordinates for the northern Kashmir/Ladakh sector (indices 2604-2769 & 0-232) with Natural Earth coordinates for the rest of the country (indices 8-134). This ensures the north follows official claims while the east/south fits perfectly with standard world map data.
  2. **Neighbor Clipping:** Used `mapshaper` to explicitly erase the hybrid India geometry from Pakistan and China. This removes the "disputed" overlapping regions from neighboring countries entirely, preventing double-rendering and color blending issues.
* **Why:** This was the only solution that satisfied both political correctness (showing full claim) and cartographic integrity (no white gaps or z-fighting).
* **Rule:** If `world.topojson` needs rebuilding, you MUST use the `scripts/merge-india-boundaries.cjs` script first to generate the hybrid India, then use `mapshaper` to clip Pakistan and China against this hybrid before merging everything. NEVER simply replace India or use the raw Natural Earth data for this region.
