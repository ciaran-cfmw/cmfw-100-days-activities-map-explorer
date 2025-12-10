import React, { useState, useEffect, useRef } from 'react';
import { GeoJsonFeature } from '../types';

interface SearchBarProps {
  features: GeoJsonFeature[];
  onSelect: (feature: GeoJsonFeature) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ features, onSelect }) => {
  const [query, setQuery] = useState('');
  const [matches, setMatches] = useState<GeoJsonFeature[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.length < 2) {
      setMatches([]);
      setIsOpen(false);
      return;
    }

    const lowerQuery = query.toLowerCase();
    const filtered = features.filter((f) => 
      f.properties.name.toLowerCase().includes(lowerQuery)
    ).sort((a, b) => a.properties.name.localeCompare(b.properties.name)); // Alphabetical sort

    setMatches(filtered.slice(0, 10)); // Limit to 10 results
    setIsOpen(true);
  }, [query, features]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (feature: GeoJsonFeature) => {
    setQuery(''); 
    setIsOpen(false);
    onSelect(feature);
  };

  return (
    <div ref={containerRef} className="relative w-64 md:w-80 z-30 font-sans">
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <svg className="w-4 h-4 text-brandCream/60 group-focus-within:text-brandRed transition-colors" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
          </svg>
        </div>
        <input 
          type="text" 
          className="block w-full p-3 pl-10 text-sm text-brandCream bg-brandWhite/10 border border-brandWhite/20 rounded-full focus:ring-2 focus:ring-brandRed focus:border-transparent placeholder-brandCream/50 backdrop-blur-xl shadow-2xl transition-all outline-none" 
          placeholder="Search country..." 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length >= 2 && setIsOpen(true)}
        />
      </div>

      {isOpen && matches.length > 0 && (
        <ul className="absolute z-40 w-full mt-2 bg-brandDeep/90 border border-brandWhite/20 rounded-xl shadow-2xl max-h-60 overflow-y-auto no-scrollbar backdrop-blur-xl">
          {matches.map((feature) => (
            <li 
              key={feature.id || feature.properties.name}
              className="px-4 py-3 text-sm text-brandCream hover:bg-brandRed hover:text-brandBlack cursor-pointer border-b border-brandWhite/10 last:border-0 transition-colors flex justify-between items-center group"
              onClick={() => handleSelect(feature)}
            >
              <span>{feature.properties.name}</span>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 opacity-0 group-hover:opacity-100 text-brandBlack transition-opacity">
                <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.5a.75.75 0 010 1.06l-5.5 5.5a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
              </svg>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};