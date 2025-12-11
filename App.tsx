import React, { useEffect, useState } from 'react';
import * as d3 from 'd3';
import { WorldMap } from './components/WorldMap';
import { InfoPanel } from './components/InfoPanel';
import { SearchBar } from './components/SearchBar';
import { ThemeToggle } from './components/ThemeToggle';
import { GeoJsonCollection, GeoJsonFeature, SelectionSummary, Activity } from './types';

// GeoJSON Data Source
const GEOJSON_URL = "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson";

// Campaign Activities - Real Data Derived from CSV
// Coordinates are approximated based on the Area/City provided.
const CAMPAIGN_ACTIVITIES: Activity[] = [
  {
    id: 'kenya-kisii',
    title: 'Kisii County, Kenya',
    type: 'School Pledge',
    coordinates: [34.7667, -0.6817],
    description: 'School Pledge Events, Faith Leader Messages and Events, Engaging Local Officials /Decision Makers, Community Awareness',
    day: 1
  },
  {
    id: 'sierra-leone-kossoh',
    title: 'Kossoh Town, Sierra Leone',
    type: 'Community Awareness',
    coordinates: [-13.2304, 8.4840],
    description: 'Community Awareness initiatives in Kossoh town Community.',
    day: 3
  },
  {
    id: 'nigeria-bayelsa',
    title: 'Bayelsa State, Nigeria',
    type: 'School Pledge',
    coordinates: [6.0699, 4.7719],
    description: 'School Pledge Events and Community Awareness campaigns.',
    day: 5
  },
  {
    id: 'ghana-mafi',
    title: 'Mafi Traditional Area, Ghana',
    type: 'School Pledge',
    coordinates: [0.4000, 6.1333],
    description: 'School Pledge Events, Faith Leader Messages and Events, Engaging Local Officials /Decision Makers, Community Awareness, Meeting a group of people during Christmas festivities.',
    day: 2
  },
  {
    id: 'liberia-paynesville',
    title: 'Paynesville City, Liberia',
    type: 'School Pledge',
    coordinates: [-10.7070, 6.2240],
    description: 'School Pledge Events, Faith Leader Messages and Events, Community Awareness.',
    day: 7
  },
  {
    id: 'malawi-chirimba',
    title: 'Chirimba, Malawi',
    type: 'School Pledge',
    coordinates: [34.9800, -15.7600],
    description: 'School Pledge Events and Community Awareness.',
    day: 4
  },
  {
    id: 'zimbabwe-lupane',
    title: 'Lupane District, Zimbabwe',
    type: 'School Pledge',
    coordinates: [27.8070, -18.9310],
    description: 'School Pledge Events across the district.',
    day: 9
  },
  {
    id: 'malawi-chozoli',
    title: 'Chozoli, Malawi',
    type: 'School Pledge',
    coordinates: [34.3000, -13.2500],
    description: 'School Pledge Events.',
    day: 6
  },
  {
    id: 'zambia-sansamwenje',
    title: 'Sansamwenje, Zambia',
    type: 'School Pledge',
    coordinates: [31.5000, -9.5000],
    description: 'School Pledge Events, Faith Leader Messages and Events, Community Awareness.',
    day: 11
  },
  {
    id: 'uganda-wakiso',
    title: 'Wakiso District, Uganda',
    type: 'Faith Leader Action',
    coordinates: [32.4800, 0.3950],
    description: 'Faith Leader Messages and Events, Community Awareness.',
    day: 8
  },
  {
    id: 'uganda-mpigi',
    title: 'Mpigi, Budaka & Ibanda, Uganda',
    type: 'School Pledge',
    coordinates: [32.3300, 0.2300],
    description: 'School Pledge Events, Faith Leader Messages and Events, Engaging Local Officials /Decision Makers, Conferences.',
    day: 13
  },
  {
    id: 'nigeria-jos',
    title: 'Jos South, Nigeria',
    type: 'School Pledge',
    coordinates: [8.8600, 9.8000],
    description: 'School Pledge Events, Faith Leader Messages and Events, Engaging Local Officials /Decision Makers, Community Awareness.',
    day: 10
  },
  {
    id: 'malawi-sadulira',
    title: 'Sadulira Village, Malawi',
    type: 'School Pledge',
    coordinates: [33.8000, -13.5000],
    description: 'School Pledge Events and Community Awareness.',
    day: 12
  },
  {
    id: 'nigeria-farawa',
    title: 'Farawa, Nigeria',
    type: 'School Pledge',
    coordinates: [8.5300, 11.9600],
    description: 'School Pledge Events at Alkhairi Suya street.',
    day: 14
  },
  {
    id: 'uganda-kazindiro',
    title: 'Kazindiro, Uganda',
    type: 'Gov Engagement',
    coordinates: [29.9500, -0.8500],
    description: 'Engaging Local Officials /Decision Makers and Community Awareness.',
    day: 1
  },
  {
    id: 'cameroon-bertoua',
    title: 'Bertoua-Belabo, Cameroon',
    type: 'School Pledge',
    coordinates: [13.5000, 4.9300],
    description: 'School Pledge Events, Faith Leader Messages and Events, Community Awareness.',
    day: 3
  },
  {
    id: 'nigeria-nasarawa',
    title: 'Nasarawa State, Nigeria',
    type: 'School Pledge',
    coordinates: [8.1900, 8.5400],
    description: 'School Pledge Events, Faith Leader Messages and Events, Engaging Local Officials /Decision Makers, Community Awareness.',
    day: 5
  },
  {
    id: 'uganda-avonu',
    title: 'Avonu Lower Village, Uganda',
    type: 'Community Awareness',
    coordinates: [32.6000, 2.2000],
    description: 'Community Awareness campaigns.',
    day: 2
  },
  {
    id: 'tanzania-pongwe',
    title: 'Pongwe-Tanga, Tanzania',
    type: 'Faith Leader Action',
    coordinates: [39.0500, -5.1300],
    description: 'Faith Leader Messages and Events.',
    day: 7
  },
  {
    id: 'zimbabwe-binga',
    title: 'Binga District, Zimbabwe',
    type: 'Faith Leader Action',
    coordinates: [27.3400, -17.6200],
    description: 'Faith Leader Messages and Events, Engaging Local Officials /Decision Makers, Community Awareness.',
    day: 4
  },
  {
    id: 'burundi-gihosha',
    title: 'Gihosha, Burundi',
    type: 'School Pledge',
    coordinates: [29.3900, -3.3600],
    description: 'School Pledge Events, Faith Leader Messages and Events, Engaging Local Officials /Decision Makers, Community Awareness.',
    day: 9
  },
  {
    id: 'zambia-petauke',
    title: 'Petauke, Zambia',
    type: 'School Pledge',
    coordinates: [31.3200, -14.2400],
    description: 'School Pledge Events, Faith Leader Messages and Events, Community Awareness.',
    day: 6
  },
  {
    id: 'zambia-bauleni',
    title: 'Bauleni Township, Zambia',
    type: 'Faith Leader Action',
    coordinates: [28.3400, -15.4400],
    description: 'Faith Leader Messages and Events, Community Awareness.',
    day: 11
  },
  {
    id: 'kenya-bunyore',
    title: 'Bunyore Area, Kenya',
    type: 'Faith Leader Action',
    coordinates: [34.6000, 0.1000],
    description: 'Faith Leader Messages and Events.',
    day: 8
  },
  {
    id: 'togo-maritime',
    title: 'Région Maritime, Togo',
    type: 'School Pledge',
    coordinates: [1.2000, 6.3000],
    description: 'School Pledge Events, Faith Leader Messages and Events, Engaging Local Officials /Decision Makers, Community Awareness.',
    day: 13
  },
  {
    id: 'tanzania-mwembesongo',
    title: 'Mwembesongo Ward, Tanzania',
    type: 'School Pledge',
    coordinates: [32.8000, -5.0100],
    description: 'School Pledge Events, Engaging Local Officials /Decision Makers.',
    day: 10
  },
  {
    id: 'kenya-kakuma',
    title: 'Kakuma & Kalobeyei, Kenya',
    type: 'School Pledge',
    coordinates: [34.8600, 3.7100],
    description: 'School Pledge Events, Faith Leader Messages and Events, Engaging Local Officials /Decision Makers, Community Awareness.',
    day: 12
  },
  {
    id: 'uganda-kyotera',
    title: 'Kyotera, Uganda',
    type: 'School Pledge',
    coordinates: [31.5400, -0.6300],
    description: 'School Pledge Events, Engaging Local Officials /Decision Makers, Community Awareness.',
    day: 14
  },
  {
    id: 'zimbabwe-goromonzi',
    title: 'Goromonzi District, Zimbabwe',
    type: 'Community Awareness',
    coordinates: [31.3800, -17.8400],
    description: 'Community Awareness campaigns.',
    day: 2
  },
  {
    id: 'liberia-districts',
    title: 'District 7 & 8, Liberia',
    type: 'School Pledge',
    coordinates: [-10.8000, 6.3000],
    description: 'School Pledge Events, Community Awareness.',
    day: 4
  },
  {
    id: 'nigeria-plateau',
    title: 'Plateau State, Nigeria',
    type: 'School Pledge',
    coordinates: [9.5000, 9.2000],
    description: 'School Pledge Events, Engaging Local Officials /Decision Makers, Community Awareness.',
    day: 6
  },
  {
    id: 'niger-tchangarey',
    title: 'Tchangarey, Niger',
    type: 'Faith Leader Action',
    coordinates: [2.1000, 13.5100],
    description: 'Messages et événements des chefs religieux, Mobiliser les élus et décideurs locaux, Sensibilisation de la communauté.',
    day: 8
  },
  {
    id: 'drc-nord-kivu',
    title: 'Nord-Kivu, DRC',
    type: 'School Pledge',
    coordinates: [29.0000, -1.0000],
    description: 'Événements d\'engagement scolaire, Messages et événements des chefs religieux, Sensibilisation de la communauté.',
    day: 10
  },
  {
    id: 'drc-karisimbi',
    title: 'Karisimbi, DRC',
    type: 'School Pledge',
    coordinates: [29.2100, -1.6500],
    description: 'Événements d\'engagement scolaire, Sensibilisation de la communauté.',
    day: 12
  },
  {
    id: 'drc-goma',
    title: 'Goma, DRC',
    type: 'School Pledge',
    coordinates: [29.2200, -1.6700],
    description: 'Événements d\'engagement scolaire, Sensibilisation de la communauté, Sensibilisation de la jeunesse interreligieuse.',
    day: 14
  }
];

const App: React.FC = () => {
  const [geoData, setGeoData] = useState<GeoJsonCollection | null>(null);
  const [selectedItem, setSelectedItem] = useState<SelectionSummary | null>(null);
  const [theme, setTheme] = useState<'dark' | 'light'>('light');

  useEffect(() => {
    // Load Map Data
    d3.json(GEOJSON_URL).then((data: any) => {
      setGeoData(data);
    }).catch(err => console.error("Failed to load map data", err));
  }, []);

  // Theme Side Effect
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const handleCountryClick = (feature: GeoJsonFeature) => {
    const name = feature.properties.name;
    const isoCode = feature.properties.iso_a3 || feature.id || 'Unknown';

    // Generate pseudo-random stats based on name length/chars to keep it consistent-ish without a DB
    const nameHash = name.length * name.charCodeAt(0);
    const activeSchools = Math.floor((nameHash % 100) * 1.5) + 12;
    const pledges = activeSchools * (Math.floor(Math.random() * 50) + 100);

    // Placeholder content - to be replaced by CMS
    const placeholderContent = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.

**Campaign Highlights:**
- Community engagement initiatives
- Educational outreach programs
- Partnership with local organizations

*This content will be managed through the CMS.*`;

    setSelectedItem({
      type: 'country',
      name: name,
      id: isoCode,
      content: placeholderContent,
      loading: false,
      stats: [
        { label: 'Active Schools', value: activeSchools.toString(), className: 'text-brandGold' },
        { label: 'Total Pledges', value: pledges.toLocaleString(), className: 'text-brandRed' },
        { label: 'Status', value: 'Mobilizing', className: 'text-brandGreen' },
        { label: 'Region', value: 'Global South', className: 'text-brandCream' }, // Placeholder
      ]
    });
  };

  const handleActivityClick = (activity: Activity) => {
    const mockReach = Math.floor(Math.random() * 500) + 50;

    // Placeholder content - to be replaced by CMS
    const placeholderContent = `**Activity Snapshot:**
> ${activity.description}

---

**Campaign Update**

Lorem ipsum dolor sit amet, consectetur adipiscing elit. This activity represents a significant milestone in our ongoing efforts to create lasting change in the community.

Through collaborative partnerships and dedicated advocacy, we are working to ensure every child has access to education and protection from harmful practices.

**Impact & Reach:**
Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

**Call to Action:**
Join us in making a difference. Together, we can build a world where every child is free to learn, grow, and thrive.

*This content will be managed through the CMS.*`;

    setSelectedItem({
      type: 'activity',
      name: activity.title,
      id: activity.id,
      subtitle: `${activity.type}`,
      content: placeholderContent,
      loading: false,
      stats: [
        { label: 'Activity Type', value: activity.type.split(' ')[0], className: 'text-brandBlue' }, // First word of type
        { label: 'Impact Reach', value: `~${mockReach} people`, className: 'text-brandRed' },
        { label: 'Date', value: 'Oct 2025', className: 'text-brandCream' },
        { label: 'Day', value: `Day ${activity.day}`, className: 'text-brandGold' },
      ]
    });
  };

  const handleClosePanel = () => {
    setSelectedItem(null);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-brandBlack transition-colors duration-300">

      {/* Top Left Search - Moved down on mobile to avoid overlap with center toggle */}
      <div className="absolute top-20 md:top-4 left-4 z-30">
        {geoData && (
          <SearchBar
            features={geoData.features}
            onSelect={handleCountryClick}
          />
        )}
      </div>

      {/* Top Right Theme Toggle */}
      <div className="absolute top-4 right-4 z-30">
        <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
      </div>

      {/* Header / Nav - Moved to bottom left, raised on mobile to clear rotation controls */}
      <header className="absolute bottom-20 md:bottom-0 left-0 p-6 pointer-events-none z-20">
        <div className="bg-white/20 backdrop-blur-xl px-6 py-4 rounded-2xl border border-white/20 shadow-2xl pointer-events-auto transform transition-transform hover:scale-105 group hover:bg-white/25">
          <img
            src="https://static.wixstatic.com/media/4b4c63_54d21e482fea49acaba50908b008a873~mv2.png/v1/fill/w_562,h_170,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/cmfw-logo-two-color_edited.png"
            alt="Child Marriage Free World"
            className="h-10 md:h-14 w-auto mb-2 object-contain drop-shadow-lg"
          />
          <p className="text-[10px] md:text-xs text-brandWhite/90 mt-1 tracking-wider uppercase font-bold pl-1 drop-shadow-md">
            100 Days of Action
          </p>
        </div>
      </header>

      {/* Main Map Area */}
      <main className="w-full h-full relative z-0">
        <WorldMap
          data={geoData}
          activities={CAMPAIGN_ACTIVITIES}
          onCountryClick={handleCountryClick}
          onActivityClick={handleActivityClick}
          selectedId={selectedItem?.type === 'country' ? selectedItem.name : selectedItem?.id || null}
        />
      </main>

      {/* Info Panel Overlay */}
      <InfoPanel data={selectedItem} onClose={handleClosePanel} />

    </div>
  );
};

export default App;