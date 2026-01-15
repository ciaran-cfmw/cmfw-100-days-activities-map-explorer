# Child Marriage Free World - 100 Days of Action 🌍

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-19.0-blue)
![Vite](https://img.shields.io/badge/Vite-6.0-purple)
![Supabase](https://img.shields.io/badge/Supabase-Database-green)

An interactive, data-driven 3D map visualizing the global impact of the **100 Days of Action** campaign. This application empowers users to explore grassroots activities, school pledges, and community events dedicated to ending child marriage worldwide.

![App Preview](https://placehold.co/1200x600/1a1a1a/ffffff?text=Interactive+Map+Preview)

## ✨ Features

- **3D Globe & Flat Map Projection:** Seamless transition between interactive globe and detailed flat map views (built with D3.js).
- **Live Activity Tracking:** Real-time impact metrics for school pledges, community awareness, and faith leader actions.
- **Country Deep Dives:** Detailed statistics, campaign highlights, and stories from specific regions.
- **Admin Portal:** Secure dashboard for campaign managers to approve/reject user-submitted activities.
- **Performance Optimized:** Lazy-loaded modules, TopoJSON compression (64% smaller maps), and gzipped assets for fast global access.
- **Dynamic Theming:** "Brand Red" and "Ocean Blue" modes supporting the campaign's visual identity.

## 🛠️ Tech Stack

- **Frontend:** React 19, TypeScript, Tailwind CSS
- **Visualization:** D3.js (v7), TopoJSON
- **Build Tool:** Vite
- **Backend / Database:** Supabase (PostgreSQL + Auth)
- **Forms:** Tally Integration

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- Docker (for local Supabase)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/100-days-activities-explorer.git
   cd 100-days-activities-explorer
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start local Supabase**
   ```bash
   supabase start
   ```

4. **Run development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   Visit `http://localhost:3000`

## 🤝 Contributing

We welcome contributions from developers, designers, and data activists!
1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

**Together, we end child marriage.**
[Visit the Campaign Website](https://childmarriagefreeworld.org)
