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
}

export interface StatItem {
  label: string;
  value: string;
  className?: string;
}

export interface SelectionSummary {
  type: 'country' | 'activity';
  name: string;
  id?: string;
  subtitle?: string; // e.g. "Campaign Activity in Brazil"
  content: string;
  loading: boolean;
  stats?: StatItem[];
}

export enum ViewState {
  GLOBE = 'GLOBE',
  FLAT = 'FLAT'
}