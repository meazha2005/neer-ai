'use client';

import React, { useState } from 'react';
import { GroundwaterStation } from '@/types';
import { Layers, Activity, AlertTriangle, ShieldCheck, Droplet, Search, MapPin } from 'lucide-react';
import groundwaterData from '@/data/groundwater.json';

interface GroundwaterWidgetProps {
  station: GroundwaterStation | null;
  locationName: string;
  onSelectStation?: (station: GroundwaterStation) => void;
}

export default function GroundwaterWidget({ station, locationName, onSelectStation }: GroundwaterWidgetProps) {
  const [searchDistrict, setSearchDistrict] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('All');

  const allStations = groundwaterData as GroundwaterStation[];

  const filteredStations = allStations.filter((s) => {
    const matchesSearch =
      s.stationName.toLowerCase().includes(searchDistrict.toLowerCase()) ||
      s.district.toLowerCase().includes(searchDistrict.toLowerCase());
    const matchesStatus = selectedStatusFilter === 'All' || s.status === selectedStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const activeStation = station || allStations[0];

  const getStatusBadge = (status: GroundwaterStation['status']) => {
    switch (status) {
      case 'Safe':
        return {
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          desc: 'Water table is readily accessible (<5m bgl) and sustainable for agricultural tube-wells.',
          icon: ShieldCheck,
        };
      case 'Semi-Critical':
        return {
          bg: 'bg-amber-50 text-amber-700 border-amber-200',
          desc: 'Moderate groundwater stress (5-10m bgl). Regulated extraction and micro-irrigation advised.',
          icon: Activity,
        };
      case 'Critical':
        return {
          bg: 'bg-orange-50 text-orange-700 border-orange-200',
          desc: 'Significant depletion (10-20m bgl). Groundwater draft exceeds replenishment; avoid heavy pumping.',
          icon: AlertTriangle,
        };
      case 'Over-Exploited':
        return {
          bg: 'bg-rose-50 text-rose-700 border-rose-200',
          desc: 'Severe aquifer crisis (>20m bgl). Strict extraction ban & recharge mandated by CGWB.',
          icon: AlertTriangle,
        };
    }
  };

  const badge = getStatusBadge(activeStation.status);
  const StatusIcon = badge.icon;
  const depthPct = Math.min(100, Math.max(5, (activeStation.depthMetersBGL / 30) * 100));

  return (
    <div className="bg-white border border-blue-100 rounded-2xl p-4 sm:p-5 shadow-sm text-slate-800 flex flex-col justify-between transition hover:shadow-md h-full">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-xs sm:text-sm tracking-wide uppercase text-blue-950 truncate">
              Underground Water Level Report
            </h3>
          </div>
          <span className="text-[10px] sm:text-[11px] bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full font-bold shrink-0">
            CGWB Hydrograph
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-1 font-medium truncate">
          Station: <span className="text-blue-950 font-bold">{activeStation.stationName}</span> ({activeStation.district})
        </p>

        {/* Main Depth Indicator Card */}
        <div className="mt-3.5 bg-gradient-to-r from-blue-50/70 to-sky-50/50 border border-blue-200/80 rounded-xl p-3.5 sm:p-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-blue-800 font-semibold">Depth to Water Table (m bgl)</div>
            <div className="text-2xl sm:text-3xl font-black text-blue-950 mt-0.5 tracking-tight flex items-baseline gap-2">
              <span>{activeStation.depthMetersBGL}</span>
              <span className="text-xs sm:text-sm font-bold text-slate-500">meters</span>
            </div>
            <div className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5">
              Approx. {(activeStation.depthMetersBGL * 3.28084).toFixed(1)} feet below ground
            </div>
          </div>

          <div className="flex flex-col items-end">
            <span className={`inline-flex items-center gap-1 text-[11px] sm:text-xs font-bold px-2.5 sm:px-3 py-1 rounded-full border ${badge.bg}`}>
              <StatusIcon className="w-3.5 h-3.5" />
              {activeStation.status}
            </span>
            <span className="text-[10px] sm:text-[11px] text-slate-500 mt-1 font-medium">
              Fluctuation: <strong className={activeStation.fluctuationMeters >= 0 ? 'text-emerald-700 font-bold' : 'text-rose-600 font-bold'}>
                {activeStation.fluctuationMeters > 0 ? `+${activeStation.fluctuationMeters}` : activeStation.fluctuationMeters} m
              </strong>
            </span>
          </div>
        </div>

        {/* Aquifer Depth Gauge Visual */}
        <div className="mt-3.5">
          <div className="flex justify-between text-[10px] sm:text-[11px] text-slate-500 mb-1 font-medium">
            <span>Surface (0m)</span>
            <span className="font-bold text-blue-900">Level: {activeStation.depthMetersBGL}m</span>
            <span>Deep Aquifer (30m+)</span>
          </div>
          <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden border border-slate-300 relative">
            <div className="absolute inset-0 flex">
              <div className="w-[16%] bg-emerald-500/30 border-r border-emerald-500/50" title="Safe (0-5m)"></div>
              <div className="w-[17%] bg-amber-500/30 border-r border-amber-500/50" title="Semi-Critical (5-10m)"></div>
              <div className="w-[33%] bg-orange-500/30 border-r border-orange-500/50" title="Critical (10-20m)"></div>
              <div className="w-[34%] bg-rose-500/30" title="Over-Exploited (>20m)"></div>
            </div>
            <div
              className="absolute top-0 bottom-0 w-2.5 bg-blue-800 rounded-full shadow-md -ml-1 transition-all duration-500 border border-white"
              style={{ left: `${depthPct}%` }}
            ></div>
          </div>
        </div>

        {/* 3 Metrics: Salinity / Recharge / 10-Yr Mean */}
        <div className="grid grid-cols-3 gap-1.5 sm:gap-2 mt-3">
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-2 sm:p-2.5 text-center">
            <div className="text-[10px] text-slate-500 font-medium">Salinity (TDS)</div>
            <div className="text-xs sm:text-sm font-black text-slate-900 mt-0.5">{activeStation.tdsPpm} ppm</div>
            <div className="text-[9px] text-slate-400">
              {activeStation.tdsPpm < 600 ? 'Good' : activeStation.tdsPpm < 1000 ? 'Moderate' : 'High'}
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-2 sm:p-2.5 text-center">
            <div className="text-[10px] text-slate-500 font-medium">Recharge</div>
            <div className={`text-xs sm:text-sm font-black mt-0.5 ${
              activeStation.rechargePotential === 'High' ? 'text-emerald-700' :
              activeStation.rechargePotential === 'Medium' ? 'text-blue-700' : 'text-amber-700'
            }`}>
              {activeStation.rechargePotential}
            </div>
            <div className="text-[9px] text-slate-400">Soil draft</div>
          </div>

          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-2 sm:p-2.5 text-center">
            <div className="text-[10px] text-slate-500 font-medium">10-Yr Decadal</div>
            <div className="text-xs sm:text-sm font-black text-slate-900 mt-0.5">{activeStation.tenYearMeanDepth} m</div>
            <div className="text-[9px] text-slate-400">Historical norm</div>
          </div>
        </div>

        {/* District Aquifer Quick Search & Switcher */}
        <div className="mt-4 pt-3 border-t border-slate-100">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
              <Search className="w-3 h-3 text-blue-600" /> Filter Aquifer Well by District:
            </span>
            <span className="text-[10px] text-slate-400">38 Stations</span>
          </div>

          <div className="flex gap-1.5 mb-2">
            <input
              type="text"
              value={searchDistrict}
              onChange={(e) => setSearchDistrict(e.target.value)}
              placeholder="e.g. Salem, Thanjavur, Dharmapuri..."
              className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
            />
            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-[11px] text-slate-800 font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Safe">Safe</option>
              <option value="Semi-Critical">Semi-Critical</option>
              <option value="Critical">Critical</option>
              <option value="Over-Exploited">Over-Exploited</option>
            </select>
          </div>

          {/* Quick chip list of matching stations */}
          <div className="max-h-24 overflow-y-auto space-y-1 pr-1">
            {filteredStations.slice(0, 5).map((s) => (
              <div
                key={s.id}
                onClick={() => onSelectStation && onSelectStation(s)}
                className={`p-1.5 rounded-lg border text-[11px] flex items-center justify-between cursor-pointer transition ${
                  activeStation.id === s.id
                    ? 'bg-blue-50 border-blue-400 font-bold text-blue-900'
                    : 'bg-slate-50/60 hover:bg-slate-100 border-slate-200 text-slate-700'
                }`}
              >
                <span className="flex items-center gap-1 truncate">
                  <MapPin className="w-3 h-3 text-blue-600 shrink-0" />
                  {s.district} ({s.depthMetersBGL}m bgl)
                </span>
                <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                  s.status === 'Safe' ? 'bg-emerald-100 text-emerald-800' :
                  s.status === 'Semi-Critical' ? 'bg-amber-100 text-amber-800' :
                  s.status === 'Critical' ? 'bg-orange-100 text-orange-800' : 'bg-rose-100 text-rose-800'
                }`}>
                  {s.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
