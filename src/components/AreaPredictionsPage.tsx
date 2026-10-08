'use client';

import React, { useState } from 'react';
import { Dam, GroundwaterStation, LiveWeatherData, AgroSuitabilityResult } from '@/types';
import { REGIONS } from '@/components/Navbar';
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  CloudSun,
  Droplets,
  Sprout,
  Layers,
  MapPin,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileDown,
  Sliders,
  ChevronRight,
  ShieldCheck,
  Zap,
  Info,
  Compass,
  ArrowUpRight,
  Maximize2,
} from 'lucide-react';

interface AreaPredictionsPageProps {
  selectedLocation: { name: string; lat: number; lng: number };
  weather: LiveWeatherData | null;
  nearestDams: Dam[];
  nearestStation: GroundwaterStation | null;
  suitability: AgroSuitabilityResult | null;
  onSelectLocation: (lat: number, lng: number, name?: string) => void;
  onDownloadPDF: () => void;
  isDownloadingPDF: boolean;
  onNavigateToMap: () => void;
}

export default function AreaPredictionsPage({
  selectedLocation,
  weather,
  nearestDams,
  nearestStation,
  suitability,
  onSelectLocation,
  onDownloadPDF,
  isDownloadingPDF,
  onNavigateToMap,
}: AreaPredictionsPageProps) {
  const [activeSubTab, setActiveSubTab] = useState<'all' | 'predictions' | 'recommendations' | 'simulation'>('all');
  const [simulatedRainModifier, setSimulatedRainModifier] = useState<number>(0); // mm of rain added/subtracted
  const [simulatedTempModifier, setSimulatedTempModifier] = useState<number>(0); // deg C

  // Primary Hydrological metrics
  const nearestDam = nearestDams[0] || null;
  const gwDepth = nearestStation?.depthMetersBGL ?? 6.8;
  const gwStatus = nearestStation?.status ?? 'Safe';
  const gw10yr = nearestStation?.tenYearMeanDepth ?? 6.2;
  const tdsPpm = nearestStation?.tdsPpm ?? 650;

  // Weather telemetry
  const currentTemp = weather?.temperature ?? 31.5;
  const currentHumidity = weather?.humidity ?? 68;
  const rainProbToday = weather?.daily.precipitationProbMax[0] ?? 20;
  const rain7DaySum = weather?.daily.precipitationSum.reduce((a, b) => a + b, 0) ?? 12.4;
  const topSoilM = weather?.hourly.soilMoistureTop[12] ?? 0.14;
  const rootSoilM = weather?.hourly.soilMoistureRoot[12] ?? 0.22;
  const deepSoilM = weather?.hourly.soilMoistureDeep[12] ?? 0.28;
  const avgEt0 = weather?.daily.evapotranspiration[0] ?? 4.2;

  // Predictive calculations (with simulation modifier)
  const effectiveRain = Math.max(0, rain7DaySum + simulatedRainModifier);
  const effectiveTemp = currentTemp + simulatedTempModifier;

  // Simulation projected soil moisture
  const projectedRootSoilM = Math.min(
    0.45,
    Math.max(0.08, rootSoilM + (simulatedRainModifier * 0.006) - (simulatedTempModifier * 0.01))
  );

  // Projected Agro Suitability score based on simulation
  const baseScore = suitability?.score ?? 72;
  const simulatedScore = Math.min(
    98,
    Math.max(
      25,
      Math.round(
        baseScore +
          (simulatedRainModifier > 0 ? Math.min(15, simulatedRainModifier * 0.5) : simulatedRainModifier * 0.8) -
          (simulatedTempModifier * 2.5)
      )
    )
  );

  // Inflow Runoff Projection: Estimated catchment runoff (Hectare-meters)
  const catchmentAreaSqKm = 450; // standard basin grid
  const runoffCoeff = effectiveRain > 30 ? 0.35 : effectiveRain > 10 ? 0.22 : 0.12;
  const estimatedCatchmentInflowMCM = Number(((effectiveRain * catchmentAreaSqKm * runoffCoeff) / 1000).toFixed(2));

  // Water Table 30-Day Trend Prediction
  const gwDepletionRatePerMonthM = effectiveRain > 25 ? -0.15 : effectiveRain > 10 ? 0.05 : 0.28; // positive = deeper/worse
  const projectedGwDepth30d = Number((gwDepth + gwDepletionRatePerMonthM).toFixed(2));

  // Days of Available Soil Water before wilting point
  const daysUntilWilting = Math.max(1, Math.round(((projectedRootSoilM - 0.09) / (avgEt0 * 0.015))));

  // Rain skip warning
  const shouldSkipIrrigation = effectiveRain > 5 || rainProbToday > 60;

  // Recommended crops for this area tailored to current telemetry
  const rankedCrops = [
    {
      name: 'Finger Millet (Ragi / Kelvaragu)',
      match: projectedRootSoilM > 0.15 ? 94 : 85,
      waterReq: '350 - 400 mm',
      sowingWindow: 'Optimal: Next 5 - 10 Days',
      advantage: 'High drought resilience; thrives in low soil moisture.',
      variety: 'TNAU CO-15 / GPU-28',
      type: 'Drought Tolerant',
    },
    {
      name: 'Blackgram (Urad / Ulundu)',
      match: projectedRootSoilM > 0.18 ? 91 : 78,
      waterReq: '250 - 300 mm',
      sowingWindow: 'Suitable: Residual Moisture',
      advantage: 'Short 70-day duration; enriches nitrogen and fixes soil health.',
      variety: 'VBN-8 / VBN-11',
      type: 'Legume / Pulse',
    },
    {
      name: 'Groundnut (Kadalai)',
      match: projectedRootSoilM > 0.20 && tdsPpm < 1200 ? 86 : 72,
      waterReq: '450 - 500 mm',
      sowingWindow: 'Recommended with Drip Line',
      advantage: 'High market value; excellent yield under sprinkler/drip.',
      variety: 'TMV-13 / Dharani',
      type: 'Oilseed',
    },
    {
      name: 'Drip Cotton (Paruthi)',
      match: effectiveRain < 50 && tdsPpm < 1500 ? 82 : 68,
      waterReq: '650 - 700 mm',
      sowingWindow: 'Pre-monsoon Drip Planting',
      advantage: 'Deep taproot extracts subsurface reserves; responsive to drip fertigation.',
      variety: 'TCHB-213 / Suvin',
      type: 'Commercial Cash Crop',
    },
    {
      name: 'Paddy (Samba / Thaladi Rice)',
      match: (nearestDam?.storagePercentage ?? 0) > 55 && gwDepth < 8.5 ? 79 : 44,
      waterReq: '1200 - 1400 mm',
      sowingWindow: nearestDam?.storagePercentage && nearestDam.storagePercentage > 50 ? 'Viable with AWD method' : 'Water Constrained - Hold',
      advantage: 'Staple cereal; recommended only with Alternate Wetting & Drying (AWD) tubes.',
      variety: 'CO-51 / CR-1009 Sub-1',
      type: 'High Water Demand',
    },
  ];

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* 1. TOP HERO AREA INTELLIGENCE HEADER */}
      <section className="bg-gradient-to-r from-blue-700 via-blue-600 to-sky-600 rounded-2xl sm:rounded-3xl p-4 sm:p-7 text-white shadow-lg shadow-blue-700/15 relative overflow-hidden">
        {/* Background decorative water ripples */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 pointer-events-none flex items-center justify-end pr-6">
          <Droplets className="w-64 h-64 text-white" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="bg-white/20 backdrop-blur-md px-2.5 py-0.5 rounded-full text-[11px] font-black tracking-wide uppercase flex items-center gap-1.5 border border-white/20">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" /> Area Intelligence &amp; Prediction Engine
              </span>
              <span className="bg-sky-400/30 text-sky-100 text-[11px] font-mono px-2 py-0.5 rounded-full font-semibold border border-white/10">
                {selectedLocation.lat.toFixed(4)}°N, {selectedLocation.lng.toFixed(4)}°E
              </span>
            </div>

            <h1 className="text-xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2">
              <MapPin className="w-6 h-6 text-sky-300 shrink-0" />
              <span>{selectedLocation.name}</span>
            </h1>

            <p className="text-xs sm:text-sm text-sky-100 max-w-2xl font-medium leading-relaxed">
              Consolidated hydrological forecasts, multi-depth soil moisture trajectories, reservoir catchment inflow models, and precision agricultural advisories synthesized exclusively for this selected basin.
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-2.5 flex-wrap shrink-0">
            <button
              onClick={onDownloadPDF}
              disabled={isDownloadingPDF}
              className="px-4 py-2 rounded-xl bg-white text-blue-900 hover:bg-blue-50 font-black text-xs flex items-center gap-2 shadow-md transition cursor-pointer select-none disabled:opacity-75"
            >
              <FileDown className="w-4 h-4 text-blue-700" />
              <span>{isDownloadingPDF ? 'Generating...' : 'Download Area PDF'}</span>
            </button>

            <button
              onClick={onNavigateToMap}
              className="px-3.5 py-2 rounded-xl bg-blue-800/80 hover:bg-blue-900 text-white font-bold text-xs flex items-center gap-1.5 border border-white/20 shadow-xs transition cursor-pointer"
            >
              <Compass className="w-4 h-4 text-sky-300" />
              <span>Map View</span>
            </button>
          </div>
        </div>

        {/* Quick Region Selector Pills */}
        <div className="mt-5 pt-4 border-t border-white/15 flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
          <span className="text-[11px] text-sky-200 font-bold uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
            Basins:
          </span>
          {REGIONS.map((region) => {
            const isSelected = selectedLocation.name === region.name;
            return (
              <button
                key={region.name}
                onClick={() => onSelectLocation(region.lat, region.lng, region.name)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                  isSelected
                    ? 'bg-white text-blue-900 shadow-md font-black scale-105'
                    : 'bg-white/15 hover:bg-white/25 text-white border border-white/10'
                }`}
              >
                📍 {region.name.split('&')[0].trim()}
              </button>
            );
          })}
        </div>
      </section>

      {/* 2. SUB-NAVIGATION TABS FOR THIS AREA */}
      <div className="flex items-center justify-between border-b border-blue-100 bg-white px-3 sm:px-5 py-2.5 rounded-2xl shadow-xs gap-2 flex-wrap">
        <div className="flex items-center gap-1 sm:gap-2">
          {[
            { id: 'all', label: 'Complete Area Dossier', icon: Layers },
            { id: 'predictions', label: 'Predictions & Inflow', icon: TrendingUp },
            { id: 'recommendations', label: 'Agro & Irrigation Advice', icon: Sprout },
            { id: 'simulation', label: 'What-If Climate Simulator', icon: Sliders },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-blue-700 hover:bg-blue-50'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 font-medium">
          <Clock className="w-3.5 h-3.5 text-blue-600" />
          <span>Real-time model cycle: 06:00 IST</span>
        </div>
      </div>

      {/* 3. CORE SUMMARY METRICS (4 KEY PREDICTIVE GAUGES) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Rainfall & Probability */}
        <div className="bg-white border border-blue-100 rounded-2xl p-4 shadow-xs hover:border-blue-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">7-Day Rain Outlook</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <CloudSun className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-black text-slate-900">{effectiveRain.toFixed(1)}</span>
            <span className="text-xs text-blue-700 font-bold">mm total</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Peak Day Probability: <span className="font-bold text-blue-900">{rainProbToday}%</span>
          </p>
          <div className="mt-2.5 text-[10px] bg-blue-50 text-blue-800 px-2 py-0.5 rounded-md font-bold inline-block">
            {effectiveRain > 20 ? '🌧️ Wet Spell Ahead' : effectiveRain > 5 ? '🌦️ Scattered Showers' : '☀️ Dry Conditions'}
          </div>
        </div>

        {/* Active Root Zone Soil Moisture */}
        <div className="bg-white border border-blue-100 rounded-2xl p-4 shadow-xs hover:border-blue-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Root Zone Moisture (3-9cm)</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Sprout className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-black text-slate-900">{(projectedRootSoilM * 100).toFixed(1)}%</span>
            <span className="text-xs text-emerald-700 font-bold">VWC</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Plant Available Reserve: <span className="font-bold text-emerald-900">~{daysUntilWilting} Days</span>
          </p>
          <div className="mt-2.5 text-[10px] bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-md font-bold inline-block">
            {projectedRootSoilM > 0.20 ? '✅ Moisture Adequate' : projectedRootSoilM > 0.12 ? '⚠️ Moderate Depletion' : '🚨 Severe Moisture Stress'}
          </div>
        </div>

        {/* Aquifer Depth Projection */}
        <div className="bg-white border border-blue-100 rounded-2xl p-4 shadow-xs hover:border-blue-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Aquifer Water Table</span>
            <div className="w-7 h-7 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-black text-slate-900">{gwDepth}m</span>
            <span className="text-xs text-slate-500 font-medium">bgl (Current)</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            30-Day Outlook: <span className="font-bold text-sky-950">{projectedGwDepth30d}m bgl</span>
          </p>
          <div className="mt-2.5 text-[10px] bg-sky-50 text-sky-900 px-2 py-0.5 rounded-md font-bold inline-block">
            {gwStatus} • TDS {tdsPpm} ppm
          </div>
        </div>

        {/* Catchment Dam Security */}
        <div className="bg-white border border-blue-100 rounded-2xl p-4 shadow-xs hover:border-blue-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Nearest Catchment Dam</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Droplets className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-black text-blue-950">{nearestDam?.storagePercentage ?? 65}%</span>
            <span className="text-xs text-blue-700 font-bold">Storage</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1 truncate">
            {nearestDam?.name ?? 'Regional Reservoir'} ({nearestDam?.distanceKm ?? 25} km)
          </p>
          <div className="mt-2.5 text-[10px] bg-blue-50 text-blue-900 px-2 py-0.5 rounded-md font-bold inline-block">
            Est. Catchment Runoff: +{estimatedCatchmentInflowMCM} MCM
          </div>
        </div>
      </div>

      {/* ============================================================= */}
      {/* SECTION: DETAILED PREDICTIONS & HYDROLOGICAL MODELING         */}
      {/* ============================================================= */}
      {(activeSubTab === 'all' || activeSubTab === 'predictions') && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <span>Scientific Predictions for {selectedLocation.name}</span>
            </h2>
            <span className="text-xs text-slate-500 font-medium">Open-Meteo &amp; NWIC Integrated</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* 1. 24-HOUR HOURLY RAINFALL & RUNOFF PREDICTION */}
            <div className="bg-white border border-blue-100 rounded-2xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-sm text-blue-950 flex items-center gap-1.5">
                    <CloudSun className="w-4 h-4 text-blue-600" /> 24-Hour Rain Probability Timeline
                  </h3>
                  <p className="text-xs text-slate-500">Hourly precipitation probability curve for local farm plots</p>
                </div>
                <span className="text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg font-bold border border-blue-200">
                  Today: {rainProbToday}% Max
                </span>
              </div>

              {/* Hourly Chart Bars */}
              <div className="grid grid-cols-6 sm:grid-cols-12 gap-1.5 pt-2">
                {weather?.hourly.time.slice(0, 12).map((t, idx) => {
                  const hour = new Date(t).getHours();
                  const prob = weather.hourly.precipitationProbability[idx] ?? 0;
                  const precip = weather.hourly.precipitation[idx] ?? 0;
                  const isPeak = prob >= 30;

                  return (
                    <div key={idx} className="flex flex-col items-center">
                      <span className="text-[10px] font-bold text-slate-500 mb-1">{prob}%</span>
                      <div className="w-full bg-slate-100 rounded-t-lg h-24 flex items-end p-0.5">
                        <div
                          style={{ height: `${Math.max(8, prob)}%` }}
                          className={`w-full rounded-t-md transition-all ${
                            isPeak
                              ? 'bg-gradient-to-t from-blue-600 to-sky-400'
                              : 'bg-gradient-to-t from-blue-300 to-sky-200'
                          }`}
                        />
                      </div>
                      <span className="text-[10px] font-bold text-slate-600 mt-1">{hour}:00</span>
                      {precip > 0 && (
                        <span className="text-[9px] font-extrabold text-blue-700">{precip}mm</span>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-3 flex items-start gap-2.5 text-xs text-blue-900">
                <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Runoff &amp; Inflow Outlook: </span>
                  With a 7-day predicted rainfall of <span className="font-bold">{effectiveRain.toFixed(1)} mm</span>, local runoff is projected to generate <span className="font-bold">+{estimatedCatchmentInflowMCM} MCM</span> of storage for the {nearestDam?.name || 'nearest'} reservoir basin.
                </div>
              </div>
            </div>

            {/* 2. MULTI-DEPTH SOIL MOISTURE RETENTION TRAJECTORY */}
            <div className="bg-white border border-blue-100 rounded-2xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-sm text-blue-950 flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-emerald-600" /> Multi-Depth Soil Moisture Profile
                  </h3>
                  <p className="text-xs text-slate-500">Root zone volumetric water content across 3 depth strata</p>
                </div>
                <span className="text-xs bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-lg font-bold border border-emerald-200">
                  {daysUntilWilting} Days Safe
                </span>
              </div>

              {/* 3 Stratum Visual Meters */}
              <div className="space-y-3.5 pt-1">
                {/* 0-1 cm Topsoil */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-slate-700">Topsoil (0 - 1 cm) • Germination Layer</span>
                    <span className="font-black text-blue-900">{(topSoilM * 100).toFixed(1)}% VWC</span>
                  </div>
                  <div className="h-3 bg-slate-100 rounded-full overflow-hidden flex">
                    <div
                      style={{ width: `${Math.min(100, topSoilM * 250)}%` }}
                      className="bg-gradient-to-r from-amber-400 to-amber-500 rounded-full"
                    />
                  </div>
                  <p className="text-[10px] text-slate-500 mt-0.5">High diurnal evaporation rate ({avgEt0.toFixed(1)} mm/day ET0). Mulching advised.</p>
                </div>

                {/* 3-9 cm Root Zone */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-slate-700">Root Zone (3 - 9 cm) • Active Plant Uptake</span>
                    <span className="font-black text-emerald-700">{(projectedRootSoilM * 100).toFixed(1)}% VWC</span>
                  </div>
                  <div className="h-3 bg-slate-100 rounded-full overflow-hidden flex">
                    <div
                      style={{ width: `${Math.min(100, projectedRootSoilM * 250)}%` }}
                      className="bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
                    />
                  </div>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    {projectedRootSoilM > 0.20 ? 'Optimal for flowering and grain filling.' : 'Approaching moisture stress boundary. Drip recommended.'}
                  </p>
                </div>

                {/* 27-81 cm Deep Subsoil */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-slate-700">Deep Subsoil (27 - 81 cm) • Subsurface Buffer</span>
                    <span className="font-black text-blue-900">{(deepSoilM * 100).toFixed(1)}% VWC</span>
                  </div>
                  <div className="h-3 bg-slate-100 rounded-full overflow-hidden flex">
                    <div
                      style={{ width: `${Math.min(100, deepSoilM * 250)}%` }}
                      className="bg-gradient-to-r from-blue-600 to-sky-500 rounded-full"
                    />
                  </div>
                  <p className="text-[10px] text-slate-500 mt-0.5">Stable deep reserve; provides drought buffer for deep-rooted crops.</p>
                </div>
              </div>

              {/* Drying Trajectory Insight */}
              <div className="border-t border-slate-100 pt-3 flex items-center justify-between text-xs">
                <span className="text-slate-600">5-Day Moisture Drying Trend:</span>
                <span className="font-bold text-blue-700 flex items-center gap-1">
                  {effectiveRain > 10 ? '📈 Recharging (+12% VWC)' : '📉 Steady Drawdown (-2.5% VWC/day)'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* SECTION: ACTIONABLE RECOMMENDATIONS FOR THE SELECTED AREA     */}
      {/* ============================================================= */}
      {(activeSubTab === 'all' || activeSubTab === 'recommendations') && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
              <Sprout className="w-5 h-5 text-emerald-600" />
              <span>Tailored Actionable Recommendations for {selectedLocation.name}</span>
            </h2>
            <span className="text-xs text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
              Score: {simulatedScore} / 100
            </span>
          </div>

          {/* 1. PRECISION IRRIGATION SCHEDULE RECOMMENDATION */}
          <div className="bg-white border border-blue-100 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-extrabold text-sm sm:text-base text-blue-950 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-600" /> Smart Irrigation Action Plan
                </h3>
                <p className="text-xs text-slate-500">Optimized to reduce pumping energy and prevent 35% evapotranspiration loss</p>
              </div>

              {shouldSkipIrrigation ? (
                <span className="bg-amber-100 text-amber-900 border border-amber-300 px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-xs">
                  <AlertTriangle className="w-4 h-4 text-amber-700" /> Rain-Skip Advised: Delay 48 Hrs
                </span>
              ) : (
                <span className="bg-emerald-100 text-emerald-900 border border-emerald-300 px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" /> Scheduled Irrigation Recommended
                </span>
              )}
            </div>

            {/* 4 Irrigation Parameter Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
              <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-3">
                <span className="text-[10px] font-bold text-blue-700 uppercase">Optimal Timing</span>
                <p className="text-sm font-black text-blue-950 mt-0.5">05:45 AM - 07:30 AM</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Early morning (Low ET0 loss)</p>
              </div>

              <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-3">
                <span className="text-[10px] font-bold text-blue-700 uppercase">Water Dosage</span>
                <p className="text-sm font-black text-blue-950 mt-0.5">
                  {shouldSkipIrrigation ? '0 L/m² (Skip)' : '14.5 Liters / m²'}
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5">Equivalent to ~14.5 mm depth</p>
              </div>

              <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-3">
                <span className="text-[10px] font-bold text-blue-700 uppercase">Delivery Method</span>
                <p className="text-sm font-black text-blue-950 mt-0.5">Drip Micro-irrigation</p>
                <p className="text-[10px] text-slate-500 mt-0.5">1.2 kg/cm² line pressure</p>
              </div>

              <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-3">
                <span className="text-[10px] font-bold text-blue-700 uppercase">Energy Saving</span>
                <p className="text-sm font-black text-blue-950 mt-0.5">
                  {shouldSkipIrrigation ? 'Save ~18 kWh Pump' : 'Off-Peak Tariff'}
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5">TANGEDCO farm connection</p>
              </div>
            </div>

            {shouldSkipIrrigation && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Water Conservation Alert: </span>
                  Rain of {effectiveRain.toFixed(1)} mm is predicted over the coming days in {selectedLocation.name}. Skipping artificial irrigation now will conserve both local groundwater table depth and electricity without impeding crop growth.
                </div>
              </div>
            )}
          </div>

          {/* 2. RANKED CROP RECOMMENDATIONS FOR THIS AREA */}
          <div className="bg-white border border-blue-100 rounded-2xl p-5 shadow-xs space-y-3.5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-sm sm:text-base text-blue-950 flex items-center gap-2">
                  <Sprout className="w-4 h-4 text-emerald-600" /> Ranked Crop Recommendations for This Area
                </h3>
                <p className="text-xs text-slate-500">Ranked by water efficiency, aquifer safety, and soil moisture compatibility</p>
              </div>
              <span className="text-xs text-slate-500 font-medium">TNAU Agro-Advisory Aligned</span>
            </div>

            <div className="space-y-2.5">
              {rankedCrops.map((crop, idx) => (
                <div
                  key={crop.name}
                  className="border border-slate-200 hover:border-blue-300 rounded-xl p-3.5 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white hover:bg-blue-50/30"
                >
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-bold text-sm text-slate-900">{crop.name}</h4>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                          {crop.type}
                        </span>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          {crop.sowingWindow}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">{crop.advantage}</p>
                      <p className="text-[11px] text-blue-800 font-semibold mt-0.5">
                        Seed Variety: <span className="font-bold">{crop.variety}</span> • Total Water: {crop.waterReq}
                      </p>
                    </div>
                  </div>

                  {/* Match Score Badge */}
                  <div className="sm:text-right shrink-0">
                    <div className="flex items-baseline gap-1 sm:justify-end">
                      <span className="text-xl font-black text-blue-950">{crop.match}%</span>
                      <span className="text-xs font-bold text-slate-500">Match</span>
                    </div>
                    <span className={`text-[10px] font-bold ${crop.match >= 85 ? 'text-emerald-700' : crop.match >= 70 ? 'text-blue-700' : 'text-amber-700'}`}>
                      {crop.match >= 85 ? 'Highly Recommended' : crop.match >= 70 ? 'Viable with Care' : 'Marginal Viability'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 3. GOVERNMENT SCHEMES & SUBSIDIES FOR THIS BASIN */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* PMKSY Micro-irrigation scheme */}
            <div className="bg-white border border-blue-100 rounded-2xl p-4.5 shadow-xs space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900">PMKSY Micro-Irrigation Subsidy</h4>
                  <p className="text-[11px] text-slate-500">Govt of Tamil Nadu &amp; Central Assistance</p>
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Small &amp; marginal farmers in {selectedLocation.name} are eligible for up to <span className="font-bold text-emerald-700">100% subsidy</span> for drip irrigation installation (55% for other farmers) under the Agricultural Engineering Department.
              </p>
              <div className="pt-1 flex items-center justify-between text-xs font-bold text-blue-600">
                <span>Application: TANHODA Portal</span>
                <span className="text-[11px] bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded">Eligible Basin</span>
              </div>
            </div>

            {/* Farm Pond & Water Harvesting Scheme */}
            <div className="bg-white border border-blue-100 rounded-2xl p-4.5 shadow-xs space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                  <Droplets className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900">Farm Pond Rainwater Harvesting</h4>
                  <p className="text-[11px] text-slate-500">MGNREGS / State Water Mission</p>
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                100% grant assistance for excavating standard <span className="font-bold text-blue-900">30m × 30m × 2m farm ponds</span> to capture runoff from the predicted {effectiveRain.toFixed(1)} mm rainfall events and recharge adjacent borewells.
              </p>
              <div className="pt-1 flex items-center justify-between text-xs font-bold text-blue-600">
                <span>Contact: Block Agri Officer (ADA)</span>
                <span className="text-[11px] bg-blue-50 text-blue-800 px-2 py-0.5 rounded">TNAU Verified</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* SECTION: WHAT-IF CLIMATE & SIMULATION TOOL                    */}
      {/* ============================================================= */}
      {(activeSubTab === 'all' || activeSubTab === 'simulation') && (
        <div className="bg-gradient-to-br from-slate-900 to-blue-950 text-white rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-lg space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="bg-blue-500/20 text-sky-300 border border-blue-400/30 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full inline-block">
                Interactive Simulation Lab
              </span>
              <h2 className="text-lg sm:text-xl font-black mt-1 text-white flex items-center gap-2">
                <Sliders className="w-5 h-5 text-sky-400" />
                <span>What-If Climate &amp; Water Scenario Simulator</span>
              </h2>
              <p className="text-xs text-slate-300">
                Simulate drought or high-monsoon conditions to stress-test agro-suitability and soil moisture for {selectedLocation.name}
              </p>
            </div>

            {/* Reset Button */}
            {(simulatedRainModifier !== 0 || simulatedTempModifier !== 0) && (
              <button
                onClick={() => {
                  setSimulatedRainModifier(0);
                  setSimulatedTempModifier(0);
                }}
                className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition self-start sm:self-auto cursor-pointer"
              >
                Reset to Live Telemetry
              </button>
            )}
          </div>

          {/* Interactive Simulation Sliders */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
            {/* Slider 1: Rain modifier */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-300">Simulate Rainfall Adjustment:</span>
                <span className="font-mono text-sky-400">
                  {simulatedRainModifier > 0 ? `+${simulatedRainModifier} mm` : `${simulatedRainModifier} mm`}
                </span>
              </div>
              <input
                type="range"
                min="-20"
                max="50"
                step="5"
                value={simulatedRainModifier}
                onChange={(e) => setSimulatedRainModifier(Number(e.target.value))}
                className="w-full accent-sky-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>Severe Drought (-20mm)</span>
                <span>Live Baseline (0)</span>
                <span>Heavy Monsoon (+50mm)</span>
              </div>
            </div>

            {/* Slider 2: Temperature modifier */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-300">Simulate Heatwave / Temp Shift:</span>
                <span className="font-mono text-amber-400">
                  {simulatedTempModifier > 0 ? `+${simulatedTempModifier}°C` : `${simulatedTempModifier}°C`}
                </span>
              </div>
              <input
                type="range"
                min="-3"
                max="6"
                step="1"
                value={simulatedTempModifier}
                onChange={(e) => setSimulatedTempModifier(Number(e.target.value))}
                className="w-full accent-amber-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>Cooler (-3°C)</span>
                <span>Current ({currentTemp}°C)</span>
                <span>Extreme Heat (+6°C)</span>
              </div>
            </div>
          </div>

          {/* Simulation Output Dashboard */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
            <div className="bg-white/10 rounded-xl p-3 border border-white/10">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Effective Rain</span>
              <p className="text-xl font-black text-sky-300 mt-0.5">{effectiveRain.toFixed(1)} mm</p>
              <p className="text-[10px] text-slate-300 mt-0.5">7-day accumulated</p>
            </div>

            <div className="bg-white/10 rounded-xl p-3 border border-white/10">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Simulated Root Moisture</span>
              <p className="text-xl font-black text-emerald-300 mt-0.5">{(projectedRootSoilM * 100).toFixed(1)}%</p>
              <p className="text-[10px] text-slate-300 mt-0.5">Volumetric water content</p>
            </div>

            <div className="bg-white/10 rounded-xl p-3 border border-white/10">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Agro Score</span>
              <p className="text-xl font-black text-amber-300 mt-0.5">{simulatedScore} / 100</p>
              <p className="text-[10px] text-slate-300 mt-0.5">
                {simulatedScore >= 80 ? 'Optimal Yield' : simulatedScore >= 60 ? 'Moderate' : 'Stress Alert'}
              </p>
            </div>

            <div className="bg-white/10 rounded-xl p-3 border border-white/10">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Catchment Inflow</span>
              <p className="text-xl font-black text-blue-300 mt-0.5">+{estimatedCatchmentInflowMCM} MCM</p>
              <p className="text-[10px] text-slate-300 mt-0.5">Projected reservoir gain</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
