'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Droplet, Layers, Navigation, X, Loader2, Compass } from 'lucide-react';
import { searchHydrologicalEntities, SearchResult } from '@/lib/search';

interface SearchBarProps {
  onSelectResult: (lat: number, lng: number, name: string) => void;
  onDetectLocation: () => void;
  isLocating?: boolean;
  placeholder?: string;
  className?: string;
}

export default function SearchBar({
  onSelectResult,
  onDetectLocation,
  isLocating = false,
  placeholder = 'Search any dam, reservoir, district, borewell or area...',
  className = '',
}: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Debounced search
  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const timeout = setTimeout(async () => {
      try {
        const res = await searchHydrologicalEntities(query);
        setResults(res);
        setIsOpen(true);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsLoading(false);
      }
    }, 250);

    return () => clearTimeout(timeout);
  }, [query]);

  // Click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (item: SearchResult) => {
    onSelectResult(item.lat, item.lng, `${item.name} (${item.category})`);
    setQuery(item.name);
    setIsOpen(false);
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
  };

  const getCategoryIcon = (cat: SearchResult['category']) => {
    switch (cat) {
      case 'Dam':
        return <Droplet className="w-4 h-4 text-blue-600 shrink-0" />;
      case 'Groundwater Well':
        return <Layers className="w-4 h-4 text-emerald-600 shrink-0" />;
      default:
        return <MapPin className="w-4 h-4 text-sky-600 shrink-0" />;
    }
  };

  return (
    <div ref={wrapperRef} className={`relative w-full ${className}`}>
      {/* Input Group */}
      <div className="relative flex items-center bg-white border border-blue-200 hover:border-blue-400 focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-100 rounded-xl shadow-xs transition">
        <Search className="w-4 h-4 text-slate-400 ml-3.5 shrink-0" />

        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => {
            if (results.length > 0) setIsOpen(true);
          }}
          placeholder={placeholder}
          className="w-full bg-transparent px-3 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 font-medium focus:outline-none"
        />

        {/* Clear or Loading Icon */}
        {isLoading ? (
          <Loader2 className="w-4 h-4 text-blue-600 animate-spin mr-2 shrink-0" />
        ) : query ? (
          <button
            onClick={clearSearch}
            className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700 mr-1.5 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        ) : null}

        {/* Detect My Location Button */}
        <button
          type="button"
          onClick={onDetectLocation}
          disabled={isLocating}
          title="Detect My Real-Time GPS Location"
          className="mr-1.5 px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 text-xs font-bold flex items-center gap-1.5 transition shrink-0 cursor-pointer disabled:opacity-50"
        >
          {isLocating ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
              <span className="hidden sm:inline">Locating...</span>
            </>
          ) : (
            <>
              <Navigation className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden sm:inline">My Location</span>
              <span className="sm:hidden">GPS</span>
            </>
          )}
        </button>
      </div>

      {/* Autosuggest Dropdown Popover */}
      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-blue-200 rounded-xl shadow-xl z-[9999] overflow-hidden max-h-[380px] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
          <div className="p-2 bg-blue-50/70 border-b border-blue-100 flex items-center justify-between text-[11px] font-bold text-blue-900">
            <span>Hydrological Search Results ({results.length})</span>
            <span className="text-[10px] text-slate-500 font-normal">Click to pan map & focus basin</span>
          </div>

          <div className="divide-y divide-slate-100">
            {results.map((item) => (
              <div
                key={item.id}
                onClick={() => handleSelect(item)}
                className="p-3 hover:bg-blue-50/60 transition cursor-pointer flex items-start justify-between gap-3 group"
              >
                <div className="flex items-start gap-2.5">
                  <div className="mt-0.5 p-1 rounded-lg bg-slate-50 border border-slate-200 group-hover:border-blue-300 group-hover:bg-blue-100/50 transition">
                    {getCategoryIcon(item.category)}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-blue-700 transition">
                        {item.name}
                      </span>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${
                          item.category === 'Dam'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : item.category === 'Groundwater Well'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        {item.category}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                      {item.subtitle}
                    </p>
                  </div>
                </div>

                {item.extraInfo && (
                  <div className="text-right shrink-0">
                    <span className="text-[10px] font-mono font-bold text-blue-800 bg-blue-50/80 border border-blue-200 px-2 py-0.5 rounded">
                      {item.extraInfo}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Results Message */}
      {isOpen && query.length >= 2 && !isLoading && results.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-blue-200 rounded-xl shadow-xl z-[9999] p-4 text-center text-xs text-slate-500">
          No dams, aquifers, or areas found matching &quot;{query}&quot;. Try typing a district name like &quot;Salem&quot;, &quot;Erode&quot;, &quot;Mettur&quot; or &quot;Vaigai&quot;.
        </div>
      )}
    </div>
  );
}
