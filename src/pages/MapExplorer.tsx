import React, { useEffect, useState } from 'react';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';
import { WorldMap } from '../components/WorldMap';
import { InfoPanel } from '../components/InfoPanel';
import { SearchBar } from '../components/SearchBar';
import { ThemeToggle } from '../components/ThemeToggle';
import { Loader } from '../components/Loader';
import { TallyEmbed } from '../components/TallyEmbed';
import { GeoJsonCollection, GeoJsonFeature, SelectionSummary, Activity, CountryData } from '../types';
import { useActivities } from '../hooks/useActivities';
import { useCountries } from '../hooks/useCountries';

// Fallback static data for when Supabase is unavailable
import activitiesData from '../data/activities.json';
import countriesData from '../data/countries.json';

// TopoJSON Data Source (local, 64% smaller than GeoJSON)
const WORLD_TOPOJSON_URL = "/data/world.topojson";

// Fallback data when Supabase is unavailable
const FALLBACK_ACTIVITIES: Activity[] = activitiesData.items as Activity[];
const FALLBACK_COUNTRIES: CountryData[] = countriesData.items as CountryData[];

const MapExplorer: React.FC = () => {
  const [geoData, setGeoData] = useState<GeoJsonCollection | null>(null);
  const [selectedItem, setSelectedItem] = useState<SelectionSummary | null>(null);
  const [theme, setTheme] = useState<'dark' | 'light'>('light');
  const [showTallyModal, setShowTallyModal] = useState(false);

  // Supabase data hooks
  const { activities: supabaseActivities, loading: activitiesLoading, error: activitiesError } = useActivities();
  const { countries: supabaseCountries, loading: countriesLoading, error: countriesError } = useCountries();

  // Use Supabase data if available, otherwise fallback to static JSON
  const CAMPAIGN_ACTIVITIES = activitiesError || supabaseActivities.length === 0 ? FALLBACK_ACTIVITIES : supabaseActivities;
  const COUNTRY_DATA = countriesError || supabaseCountries.length === 0 ? FALLBACK_COUNTRIES : supabaseCountries;

  const isLoading = activitiesLoading || countriesLoading;

  useEffect(() => {
    // Load Map Data from local TopoJSON (converted to GeoJSON for D3)
    d3.json(WORLD_TOPOJSON_URL).then((topoData: any) => {
      // Convert TopoJSON to GeoJSON
      const geoJsonData = topojson.feature(topoData, topoData.objects.countries) as unknown as GeoJsonCollection;
      setGeoData(geoJsonData);
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

    // Count actual activities in this country by matching country name in title
    const activityCount = CAMPAIGN_ACTIVITIES.filter(a =>
      a.title.toLowerCase().includes(name.toLowerCase())
    ).length;

    // Look up country in our CMS data
    const cmsCountry = COUNTRY_DATA.find(c => c.id === name || c.name === name);

    let content = "";
    let stats = [];

    if (cmsCountry) {
      // Use CMS Data
      content = cmsCountry.body;
      if (cmsCountry.highlights && cmsCountry.highlights.length > 0) {
        content += `\n\n**Campaign Highlights:**\n${cmsCountry.highlights.map(h => `- ${h}`).join('\n')}`;
      }

      stats = [
        { label: 'Activities', value: activityCount.toString(), className: 'text-brandGold', icon: 'bx-layer' },
        { label: 'Total Pledges', value: cmsCountry.total_pledges.toLocaleString(), className: 'text-brandRed', icon: 'bx-heart' },
        { label: 'Status', value: cmsCountry.status, className: 'text-brandGreen', icon: 'bx-badge-check' },
        { label: 'Get Involved', value: 'Register Event', className: 'text-brandCream bg-brandRed hover:bg-brandLightRed cursor-pointer transition-colors', isAction: true, icon: 'bx-plus-circle' },
      ];
    } else {
      // Fallback for non-CMS countries
      content = `**${name}** is currently being assessed for campaign activities.\n\nJoin the movement by registering a school or community group in this region.`;

      stats = [
        { label: 'Activities', value: activityCount.toString(), className: 'text-brandGold', icon: 'bx-layer' },
        { label: 'Total Pledges', value: 'Pending', className: 'text-brandGrey', icon: 'bx-time-five' },
        { label: 'Status', value: activityCount > 0 ? 'Active' : 'Outreach', className: activityCount > 0 ? 'text-brandGreen' : 'text-brandGrey', icon: 'bx-info-circle' },
        { label: 'Get Involved', value: 'Register Event', className: 'text-brandCream bg-brandRed hover:bg-brandLightRed cursor-pointer transition-colors', isAction: true, icon: 'bx-plus-circle' },
      ];
    }

    setSelectedItem({
      type: 'country',
      name: name,
      id: isoCode,
      content: content,
      loading: false,
      stats: stats
    });
  };

  const handleActivityClick = (activity: Activity) => {
    // Use body content from CMS if available, fallback to description
    let content = activity.body || `**Activity Snapshot:**\\n> ${activity.description}`;

    // Append Participant Feedback if available
    if (activity.participant_feedback) {
      content += `\\n\\n**Voices from the Field:**\\n> "${activity.participant_feedback}"`;
    }

    // Helper function to format date or date range
    const formatEventDate = (startDate: string | undefined, endDate?: string): string => {
      if (!startDate) return 'TBD';
      try {
        const start = new Date(startDate);
        const startFormatted = start.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

        if (endDate) {
          const end = new Date(endDate);
          const endFormatted = end.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
          // Check if same month
          if (start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()) {
            return `${start.getDate()}–${end.getDate()} ${end.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}`;
          }
          return `${startFormatted} – ${endFormatted}`;
        }

        return start.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
      } catch {
        return 'TBD';
      }
    };

    const stats = [
      { label: 'Activity Type', value: activity.type.split(' ')[0], className: 'text-brandBlue', icon: 'bx-tag-alt' },
      { label: 'Impact Reach', value: 'Pending', className: 'text-brandGrey', icon: 'bx-target-lock' },
      { label: 'Event Date', value: formatEventDate(activity.event_date, activity.event_end_date), className: 'text-brandGold', icon: 'bx-calendar' },
    ];

    // Add Pledges if available
    if (activity.pledges_count && activity.pledges_count > 0) {
      stats.splice(1, 0, { label: 'Pledges Taken', value: activity.pledges_count.toString(), className: 'text-brandRed font-bold', icon: 'bx-heart' });
    }

    // Determine subtitle: show organizer if enabled, otherwise organization/type
    const subtitle = activity.show_organizer && activity.submitter_name
      ? `Organized by ${activity.submitter_name}`
      : activity.organization || activity.type;

    setSelectedItem({
      type: 'activity',
      name: activity.title,
      id: activity.id,
      subtitle: subtitle,
      content: content,
      loading: false,
      image: activity.image,
      stats: stats,
      link: activity.link_url ? { url: activity.link_url, text: activity.link_text || 'Learn More' } : undefined
    });
  };

  const handleClosePanel = () => {
    setSelectedItem(null);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-brandBlack transition-colors duration-300">

      {/* Loading Overlay */}
      {(isLoading || !geoData) && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-ocean/80 backdrop-blur-sm">
          <Loader />
        </div>
      )}

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
        <div className="flex items-end gap-3">
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
          {/* Global CTA - Tally Popup */}
          <button
            onClick={() => setShowTallyModal(true)}
            className="pointer-events-auto bg-brandRed hover:bg-brandRedHover text-white font-bold text-xs md:text-sm px-4 py-3 rounded-xl shadow-lg border border-brandDarkRed/30 transition-all hover:scale-105 active:scale-95 whitespace-nowrap animate-attention flex items-center gap-2"
          >
            <i className='bx bx-calendar-plus text-lg'></i>
            Register a Pledge Event
          </button>
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
      <InfoPanel
        data={selectedItem}
        onClose={handleClosePanel}
        onAction={() => setShowTallyModal(true)}
      />

      {/* Tally Registration Modal */}
      {showTallyModal && <TallyEmbed onClose={() => setShowTallyModal(false)} />}

    </div>
  );
};

export default MapExplorer;