'use client';

import React from 'react';
import { GroundwaterStation } from '@/types';
import { Layers, Activity, AlertTriangle, ShieldCheck, Droplet } from 'lucide-react';

interface GroundwaterWidgetProps {
  station: GroundwaterStation | null;
  locationName: string;
}

export default function GroundwaterWidget({ station, locationName }: GroundwaterWidgetProps) {
  if (!station) {
    return (
      <div className="bg-white border border-blue-100 rounded-2xl p-5 text-slate-600 shadow-sm">
        <p>No groundwater observation telemetry station detected nearby.</p>
      </div>
    );
  }

  const getStatusBadge = (status: GroundwaterStation['status']) => {
    switch (status) {
      case 'Safe':
        return {
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          desc: 'Water table is readily accessible and sustainable for agricultural tube-wells.',
          icon: ShieldCheck,
        };
      case 'Semi-Critical':
        return {
          bg: 'bg-amber-50 text-amber-700 border-amber-200',
          desc: 'Moderate groundwater stress. Regulated extraction and micro-irrigation advised.',
          icon: Activity,
        };
      case 'Critical':
        return {
          bg: 'bg-orange-50 text-orange-700 border-orange-200',
          desc: 'Significant depletion. Groundwater draft exceeds replenishment; avoid heavy pumping.',
          icon: AlertTriangle,
        };
      case 'Over-Exploited':
        return {
          bg: 'bg-rose-50 text-rose-700 border-rose-200',
          desc: 'Severe aquifer crisis. Water table below 20m bgl. Strict extraction ban & recharge required.',
          icon: AlertTriangle,
        };
    }
  };

  const badge = getStatusBadge(station.status);
  const StatusIcon = badge.icon;
  const depthPct = Math.min(100, Math.max(5, (station.depthMetersBGL / 30) * 100));

  return (
    <div className="bg-white border border-blue-100 rounded-2xl p-5 shadow-sm text-slate-800 flex flex-col justify-between transition hover:shadow-md">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-sm tracking-wide uppercase text-blue-950">
              Underground Water Level Report
            </h3>
          </div>
          <span className="text-[11px] bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full font-bold">
            CGWB Hydrograph
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-1.5 font-medium">
          Observation Station: <span className="text-blue-950 font-bold">{station.stationName}</span> ({station.district}, {station.state})
        </p>

        {/* Main Depth Indicator Card */}
        <div className="mt-4 bg-gradient-to-r from-blue-50/70 to-sky-50/50 border border-blue-200/80 rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-blue-800 font-semibold">Depth to Water Table (m bgl)</div>
            <div className="text-3xl font-black text-blue-950 mt-1 tracking-tight flex items-baseline gap-2">
              <span>{station.depthMetersBGL}</span>
              <span className="text-sm font-bold text-slate-500">meters</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Approx. {(station.depthMetersBGL * 3.28084).toFixed(1)} feet below ground
            </div>
          </div>

          <div className="flex flex-col items-end">
            <span className={`inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full border ${badge.bg}`}>
              <StatusIcon className="w-3.5 h-3.5" />
              {station.status}
            </span>
            <span className="text-[11px] text-slate-500 mt-1.5 font-medium">
              Fluctuation: <strong className={station.fluctuationMeters >= 0 ? 'text-emerald-700 font-bold' : 'text-rose-600 font-bold'}>
                {station.fluctuationMeters > 0 ? `+${station.fluctuationMeters}` : station.fluctuationMeters} m
              </strong>
            </span>
          </div>
        </div>

        {/* Aquifer Depth Gauge Visual */}
        <div className="mt-4">
          <div className="flex justify-between text-[11px] text-slate-500 mb-1 font-medium">
            <span>Surface (0m)</span>
            <span className="font-bold text-blue-900">Aquifer Level: {station.depthMetersBGL}m</span>
            <span>Deep Bedrock (30m+)</span>
          </div>
          <div className="w-full h-3.5 bg-slate-200 rounded-full overflow-hidden border border-slate-300 relative">
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
        <div className="grid grid-cols-3 gap-2 mt-4">
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-2.5 text-center">
            <div className="text-[10px] text-slate-500 font-medium">Total Dissolved Solids</div>
            <div className="text-sm font-black text-slate-900 mt-0.5">{station.tdsPpm} ppm</div>
            <div className="text-[10px] text-slate-400">
              {station.tdsPpm < 600 ? 'Good Potability' : station.tdsPpm < 1000 ? 'Moderate' : 'High Saline'}
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-2.5 text-center">
            <div className="text-[10px] text-slate-500 font-medium">Recharge Potential</div>
            <div className={`text-sm font-black mt-0.5 ${
              station.rechargePotential === 'High' ? 'text-emerald-700' :
              station.rechargePotential === 'Medium' ? 'text-blue-700' : 'text-amber-700'
            }`}>
              {station.rechargePotential}
            </div>
            <div className="text-[10px] text-slate-400">Percolation</div>
          </div>

          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-2.5 text-center">
            <div className="text-[10px] text-slate-500 font-medium">10-Year Decadal Mean</div>
            <div className="text-sm font-black text-slate-900 mt-0.5">{station.tenYearMeanDepth} m</div>
            <div className="text-[10px] text-slate-400">Historical norm</div>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-start gap-2">
        <Droplet className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
        <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
          {badge.desc}
        </p>
      </div>
    </div>
  );
}
