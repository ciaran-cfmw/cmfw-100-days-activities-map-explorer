export interface GeoJsonFeature {
  type: "Feature";
  id: string;
  properties: {
    name: string;
    id?: string;
    iso_a3?: string;
    [key: string]: any;
  };
  geometry: {
    type: "Polygon" | "MultiPolygon";
    coordinates: any[];
  };
}

export interface GeoJsonCollection {
  type: "FeatureCollection";
  features: GeoJsonFeature[];
}

export interface Activity {
  id: string;
  title: string;
  type: string;
  coordinates: [number, number]; // [lon, lat]
  description: string;
  body?: string; // Markdown content from CMS
  day: number; // Campaign day (1-100) - kept for internal tracking
  event_date?: string; // ISO date string (YYYY-MM-DD) for actual/planned event date
  event_end_date?: string; // ISO date string for multi-day events
  image?: string; // URL to image
  link_url?: string; // External link URL
  link_text?: string; // Button text for the link
  pledges_count?: number; // From Tally
  organization?: string; // Organization or community name
  participant_feedback?: string; // From Tally
  submitter_name?: string; // Organizer name
  submitter_email?: string; // Organizer email (admin only)
  country?: string; // Country name
  status?: 'pending' | 'approved' | 'rejected';
  show_organizer?: boolean; // Toggle for frontend visibility
}

export interface CountryData {
  name: string;
  id: string;
  status: string; // "Mobilizing", "Active", "Completed"
  active_schools: number;
  total_pledges: number;
  highlights: string[];
  body: string; // Markdown content
}

export interface StatItem {
  label: string;
  value: string;
  className?: string;
  isAction?: boolean;
  icon?: string; // Boxicons class name, e.g. 'bx-map'
}

export interface SelectionSummary {
  type: 'country' | 'activity';
  name: string;
  id?: string;
  subtitle?: string; // e.g. "Campaign Activity in Brazil"
  content: string;
  loading: boolean;
  stats?: StatItem[];
  image?: string;
  link?: { url: string; text: string };
}

export enum ViewState {
  GLOBE = 'GLOBE',
  FLAT = 'FLAT'
}