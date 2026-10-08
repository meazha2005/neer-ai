'use client';

import React from 'react';
import { LiveWeatherData } from '@/types';
import { Layers, Droplets, CheckCircle2 } from 'lucide-react';

interface SoilMoistureWidgetProps {
  weather: LiveWeatherData | null;
  locationName: string;
}

export default function SoilMoistureWidget({ weather, locationName }: SoilMoistureWidgetProps) {
  if (!weather) {
    return (
      <div className="bg-white border border-blue-100 rounded-2xl p-5 text-slate-600 shadow-sm">
        <p>Loading soil moisture sensors...</p>
      </div>
    );
  }

  const topMoisture = weather.hourly.soilMoistureTop[12] ?? 0.12;
  const rootMoisture = weather.hourly.soilMoistureRoot[12] ?? 0.22;
  const deepMoisture = weather.hourly.soilMoistureDeep[12] ?? 0.29;

  const evaluateMoisture = (val: number) => {
    const pct = Number((val * 100).toFixed(1));
    if (pct >= 32) return { status: 'Saturated / Wet', color: 'text-blue-700', bar: 'bg-blue-600' };
    if (pct >= 20) return { status: 'Optimal Field Capacity', color: 'text-emerald-700', bar: 'bg-emerald-600' };
    if (pct >= 14) return { status: 'Moderate Moisture', color: 'text-amber-700', bar: 'bg-amber-500' };
    return { status: 'Dry / Wilting Point', color: 'text-rose-700', bar: 'bg-rose-600' };
  };

  const topEval = evaluateMoisture(topMoisture);
  const rootEval = evaluateMoisture(rootMoisture);
  const deepEval = evaluateMoisture(deepMoisture);

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
              Soil Moisture Prediction (Multi-Depth)
            </h3>
          </div>
          <span className="text-[11px] bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full font-bold">
            VWC Profile
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-1.5 font-medium">
          Root zone & sub-layer profiling for <span className="text-blue-950 font-bold">{locationName}</span>
        </p>

        {/* 3 Depth Layers Visualization */}
        <div className="mt-4 space-y-3">
          {/* Topsoil (0 - 1 cm) */}
          <div className="bg-slate-50/80 border border-slate-200/80 rounded-xl p-3">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <div>
                <span className="font-bold text-slate-900">Topsoil Layer (0 - 1 cm)</span>
                <span className="text-slate-500 text-[11px] block">Germination & Seedling Bed</span>
              </div>
              <div className="text-right">
                <span className="font-black text-slate-950 text-sm">{(topMoisture * 100).toFixed(1)}%</span>
                <span className={`text-[10px] block font-bold ${topEval.color}`}>{topEval.status}</span>
              </div>
            </div>
            <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden border border-slate-300">
              <div
                className={`h-full rounded-full ${topEval.bar} transition-all duration-500`}
                style={{ width: `${Math.min(100, Math.max(5, (topMoisture / 0.45) * 100))}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-medium">
              <span>Volumetric: {topMoisture.toFixed(3)} m³/m³</span>
              <span>Fast Evaporation Zone</span>
            </div>
          </div>

          {/* Root Zone (3 - 9 cm) - MOST CRITICAL */}
          <div className="bg-gradient-to-r from-blue-50 to-sky-50 border border-blue-200 rounded-xl p-3 relative overflow-hidden">
            <div className="absolute top-2 right-2">
              <span className="bg-blue-600 text-white text-[9px] font-black px-2 py-0.5 rounded uppercase shadow-xs">
                Active Crop Zone
              </span>
            </div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <div>
                <span className="font-bold text-blue-950">Active Root Zone (3 - 9 cm)</span>
                <span className="text-blue-700 text-[11px] block font-medium">Main Nutrient & Water Uptake</span>
              </div>
              <div className="text-right mr-20">
                <span className="font-black text-blue-950 text-base">{(rootMoisture * 100).toFixed(1)}%</span>
                <span className={`text-[10px] block font-bold ${rootEval.color}`}>{rootEval.status}</span>
              </div>
            </div>
            <div className="w-full h-3 bg-blue-200/80 rounded-full overflow-hidden border border-blue-300">
              <div
                className={`h-full rounded-full ${rootEval.bar} transition-all duration-500`}
                style={{ width: `${Math.min(100, Math.max(5, (rootMoisture / 0.45) * 100))}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-[10px] text-blue-900 mt-1 font-semibold">
              <span>Volumetric: {rootMoisture.toFixed(3)} m³/m³</span>
              <span>Optimal for Transpiration</span>
            </div>
          </div>

          {/* Deep Subsoil (27 - 81 cm) */}
          <div className="bg-slate-50/80 border border-slate-200/80 rounded-xl p-3">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <div>
                <span className="font-bold text-slate-900">Deep Subsoil (27 - 81 cm)</span>
                <span className="text-slate-500 text-[11px] block">Deep Taproot Reserve</span>
              </div>
              <div className="text-right">
                <span className="font-black text-slate-950 text-sm">{(deepMoisture * 100).toFixed(1)}%</span>
                <span className={`text-[10px] block font-bold ${deepEval.color}`}>{deepEval.status}</span>
              </div>
            </div>
            <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden border border-slate-300">
              <div
                className={`h-full rounded-full ${deepEval.bar} transition-all duration-500`}
                style={{ width: `${Math.min(100, Math.max(5, (deepMoisture / 0.45) * 100))}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-medium">
              <span>Volumetric: {deepMoisture.toFixed(3)} m³/m³</span>
              <span>Subsurface Capillary Buffer</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600 font-medium">
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
          <span>Mulching recommended if Topsoil drops below 12% to preserve root moisture.</span>
        </div>
      </div>
    </div>
  );
}
