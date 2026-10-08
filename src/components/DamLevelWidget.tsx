'use client';

import React, { useState } from 'react';
import { Dam } from '@/types';
import { Waves, MapPin, Gauge, ExternalLink, ShieldCheck, AlertCircle, Search, Filter } from 'lucide-react';
import damsData from '@/data/dams.json';

interface DamLevelWidgetProps {
  nearestDams: Dam[];
  onSelectDam: (dam: Dam) => void;
  locationName: string;
}

export default function DamLevelWidget({ nearestDams, onSelectDam, locationName }: DamLevelWidgetProps) {
  const [filterMode, setFilterMode] = useState<'nearest' | 'all' | 'high' | 'low'>('nearest');
  const [searchQuery, setSearchQuery] = useState('');

  const allDams = damsData as Dam[];

  // Filtered dataset
  const displayList = (() => {
    let list: Dam[] = filterMode === 'nearest' ? nearestDams : allDams;

    if (filterMode === 'high') {
      list = allDams.filter((d) => d.storagePercentage >= 70);
    } else if (filterMode === 'low') {
      list = allDams.filter((d) => d.storagePercentage < 45);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.district.toLowerCase().includes(q) ||
          d.river?.toLowerCase().includes(q)
      );
    }

    return list.slice(0, 15);
  })();

  const avgStoragePct = Math.round(
    nearestDams.reduce((acc, dam) => acc + dam.storagePercentage, 0) / (nearestDams.length || 1)
  );

  return (
    <div className="bg-white border border-blue-100 rounded-2xl p-4 sm:p-5 shadow-sm text-slate-800 flex flex-col justify-between transition hover:shadow-md h-full">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0">
              <Waves className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-xs sm:text-sm tracking-wide uppercase text-blue-950 truncate">
              Dam Storage & Water Percentage
            </h3>
          </div>
          <span className="text-[10px] sm:text-[11px] bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full font-bold shrink-0">
            {allDams.length} Dams
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-1 font-medium truncate">
          Reservoirs near <span className="text-blue-950 font-bold">{locationName}</span>
        </p>

        {/* Catchment Average Storage */}
        <div className="mt-3 bg-gradient-to-r from-blue-50 to-sky-50 border border-blue-200/80 rounded-xl p-3 flex items-center justify-between">
          <div>
            <div className="text-[11px] text-blue-800 font-bold">Catchment Average Storage</div>
            <div className="text-xl sm:text-2xl font-black text-blue-950 mt-0.5">{avgStoragePct}% Capacity</div>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-lg bg-white border border-blue-200 shadow-2xs">
            {avgStoragePct >= 65 ? (
              <>
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span className="text-emerald-700">Healthy</span>
              </>
            ) : avgStoragePct >= 40 ? (
              <>
                <Gauge className="w-4 h-4 text-amber-600" />
                <span className="text-amber-700">Moderate</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-4 h-4 text-rose-600" />
                <span className="text-rose-700">Depleted</span>
              </>
            )}
          </div>
        </div>

        {/* Search & Filter Controls */}
        <div className="mt-3 space-y-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search dam by name, river, district..."
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
            />
          </div>

          <div className="flex items-center gap-1 overflow-x-auto pb-0.5 text-[10px] scrollbar-none font-bold">
            <button
              onClick={() => setFilterMode('nearest')}
              className={`px-2.5 py-1 rounded-md transition cursor-pointer shrink-0 ${
                filterMode === 'nearest'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Nearest ({nearestDams.length})
            </button>
            <button
              onClick={() => setFilterMode('all')}
              className={`px-2.5 py-1 rounded-md transition cursor-pointer shrink-0 ${
                filterMode === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All 760 Dams
            </button>
            <button
              onClick={() => setFilterMode('high')}
              className={`px-2.5 py-1 rounded-md transition cursor-pointer shrink-0 ${
                filterMode === 'high'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              &gt;70% Full
            </button>
            <button
              onClick={() => setFilterMode('low')}
              className={`px-2.5 py-1 rounded-md transition cursor-pointer shrink-0 ${
                filterMode === 'low'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              &lt;45% Critical
            </button>
          </div>
        </div>

        {/* List of Dams */}
        <div className="mt-3 space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
          {displayList.length === 0 ? (
            <div className="text-center py-6 text-xs text-slate-400">
              No reservoirs found matching &quot;{searchQuery}&quot;.
            </div>
          ) : (
            displayList.map((dam) => {
              const isHealthy = dam.storagePercentage >= 70;
              const isMedium = dam.storagePercentage >= 40 && dam.storagePercentage < 70;

              return (
                <div
                  key={dam.id}
                  onClick={() => onSelectDam(dam)}
                  className="group cursor-pointer bg-slate-50/70 hover:bg-blue-50/60 border border-slate-200/80 hover:border-blue-300 rounded-xl p-2.5 transition"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-blue-700 transition flex items-center gap-1">
                        <span>{dam.name}</span>
                        <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-blue-600 transition" />
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mt-0.5">
                        {dam.distanceKm !== undefined && (
                          <span className="flex items-center gap-0.5 font-medium text-blue-700">
                            <MapPin className="w-3 h-3 text-blue-600" />
                            {dam.distanceKm} km
                          </span>
                        )}
                        <span>•</span>
                        <span>{dam.district}, {dam.state}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span
                        className={`text-[11px] font-black px-2 py-0.5 rounded-full border ${
                          isHealthy
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : isMedium
                            ? 'bg-sky-50 text-sky-700 border-sky-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        {dam.storagePercentage}%
                      </span>
                    </div>
                  </div>

                  {/* Storage Percentage Progress Bar */}
                  <div className="mt-2">
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden border border-slate-300">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isHealthy
                            ? 'bg-gradient-to-r from-blue-600 to-sky-400'
                            : isMedium
                            ? 'bg-gradient-to-r from-sky-500 to-cyan-400'
                            : 'bg-gradient-to-r from-amber-500 to-yellow-400'
                        }`}
                        style={{ width: `${Math.min(100, Math.max(5, dam.storagePercentage))}%` }}
                      ></div>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-600 mt-1 font-mono font-medium">
                      <span>
                        Live: <strong className="text-blue-900 font-bold">{dam.currentStorageMCM} MCM</strong>
                      </span>
                      <span>
                        Gross: <strong className="text-slate-800">{dam.grossCapacityMCM} MCM</strong>
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
