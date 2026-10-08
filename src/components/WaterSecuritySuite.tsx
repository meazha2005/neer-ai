'use client';

import React, { useState } from 'react';
import {
  Dam,
  GroundwaterStation,
  LiveWeatherData,
} from '@/types';
import {
  calculateEnsoImpact,
  calculateSupplyDemand,
  calculate90DaySecurity,
  generateExplainableDecision,
  calculateEcosystemEarlyWarning,
  calculateImpactComparison,
} from '@/lib/waterSecurityEngine';
import { REGIONS } from '@/components/Navbar';
import {
  CloudSun,
  Droplets,
  Layers,
  Sprout,
  ShieldAlert,
  Sparkles,
  TrendingUp,
  FileDown,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  Maximize2,
  Users,
  Building2,
  Trees,
  Compass,
  Zap,
  Info,
  Calendar,
  Activity,
  Waves,
} from 'lucide-react';

interface WaterSecuritySuiteProps {
  selectedLocation: { name: string; lat: number; lng: number };
  weather: LiveWeatherData | null;
  nearestDams: Dam[];
  nearestStation: GroundwaterStation | null;
  onSelectLocation: (lat: number, lng: number, name?: string) => void;
  onDownloadPDF: () => void;
  isDownloadingPDF: boolean;
  onNavigateToMap: () => void;
}

export default function WaterSecuritySuite({
  selectedLocation,
  weather,
  nearestDams,
  nearestStation,
  onSelectLocation,
  onDownloadPDF,
  isDownloadingPDF,
  onNavigateToMap,
}: WaterSecuritySuiteProps) {
  // Navigation tabs across the 7 engines
  const [activeEngineTab, setActiveEngineTab] = useState<
    'all' | 'enso' | 'balance' | 'security90' | 'decision' | 'allocation' | 'ecosystem' | 'impact'
  >('all');

  // Interactive controls
  const [securityScenario, setSecurityScenario] = useState<'dry' | 'normal' | 'wet'>('normal');
  const [selectedPersona, setSelectedPersona] = useState<
    'Farmers' | 'Water Authorities' | 'Communities' | 'Industries' | 'Ecosystems'
  >('Farmers');

  // Compute live engine outputs
  const ensoData = calculateEnsoImpact(selectedLocation.lat, selectedLocation.lng, weather);
  const supplyDemandData = calculateSupplyDemand(nearestDams, nearestStation, weather);
  const security90Data = calculate90DaySecurity(supplyDemandData, ensoData);
  const decisionData = generateExplainableDecision(
    supplyDemandData,
    security90Data,
    nearestDams,
    nearestStation,
    weather
  );
  const ecosystemData = calculateEcosystemEarlyWarning(supplyDemandData, security90Data, nearestStation);
  const impactData = calculateImpactComparison(supplyDemandData);

  const activeScenarioData = security90Data.scenarios[securityScenario];
  const activeStakeholder =
    decisionData.stakeholders.find((s) => s.persona === selectedPersona) || decisionData.stakeholders[0];

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* 1. HERO ENGINE SUITE BANNER */}
      <section className="bg-gradient-to-r from-blue-900 via-blue-800 to-sky-700 rounded-2xl sm:rounded-3xl p-5 sm:p-7 text-white shadow-xl shadow-blue-900/15 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 pointer-events-none flex items-center justify-end pr-6">
          <Waves className="w-80 h-80 text-white" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="bg-sky-400/20 text-sky-200 border border-sky-400/30 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-amber-300" /> Advanced Hydrological Intelligence Suite
              </span>
              <span className="bg-white/10 text-white font-mono text-[11px] px-2 py-0.5 rounded-full">
                {selectedLocation.lat.toFixed(4)}°N, {selectedLocation.lng.toFixed(4)}°E
              </span>
            </div>

            <h1 className="text-xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2">
              <span>{selectedLocation.name}</span>
            </h1>

            <p className="text-xs sm:text-sm text-sky-100 max-w-2xl font-medium leading-relaxed">
              Real-time ENSO forecasting, basin supply-demand budgeting, 90-day risk progression, explainable AI decisions, priority allocation optimizer, and ecosystem early warning.
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-2.5 flex-wrap shrink-0">
            <button
              onClick={onDownloadPDF}
              disabled={isDownloadingPDF}
              className="px-4 py-2.5 rounded-xl bg-white text-blue-950 hover:bg-blue-50 font-black text-xs flex items-center gap-2 shadow-md transition cursor-pointer select-none disabled:opacity-75"
            >
              <FileDown className="w-4 h-4 text-blue-700" />
              <span>{isDownloadingPDF ? 'Compiling PDF...' : 'Download Security Report (PDF)'}</span>
            </button>

            <button
              onClick={onNavigateToMap}
              className="px-3.5 py-2.5 rounded-xl bg-blue-950/70 hover:bg-blue-950 text-white font-bold text-xs flex items-center gap-1.5 border border-white/20 transition cursor-pointer"
            >
              <Compass className="w-4 h-4 text-sky-300" />
              <span>Map View</span>
            </button>
          </div>
        </div>

        {/* Quick Region Selector Pills */}
        <div className="mt-5 pt-4 border-t border-white/15 flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
          <span className="text-[11px] text-sky-200 font-bold uppercase tracking-wider shrink-0 mr-1">
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

      {/* 2. ENGINE SELECTOR TABS (ALL 7 ENGINES) */}
      <div className="bg-white border border-blue-100 rounded-2xl p-2.5 shadow-xs overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-1.5 min-w-max">
          {[
            { id: 'all', label: 'All 7 Engines', icon: Sparkles },
            { id: 'enso', label: '🌦️ ENSO & Rainfall Engine', icon: CloudSun },
            { id: 'balance', label: '💧 Supply–Demand Balance', icon: Droplets },
            { id: 'security90', label: '📊 90-Day Security Models', icon: Activity },
            { id: 'decision', label: '🧠 Explainable Decision Engine', icon: Zap },
            { id: 'allocation', label: '💦 Allocation Optimizer', icon: Sliders },
            { id: 'ecosystem', label: '🌳 Ecosystem & Early Warning', icon: Trees },
            { id: 'impact', label: '📄 Without vs With NEER-AI', icon: TrendingUp },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeEngineTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveEngineTab(tab.id as any)}
                className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs font-extrabold'
                    : 'text-slate-600 hover:text-blue-700 hover:bg-blue-50'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ============================================================= */}
      {/* ENGINE 1: 🌦️ EL NIÑO & RAINFALL IMPACT ENGINE                 */}
      {/* ============================================================= */}
      {(activeEngineTab === 'all' || activeEngineTab === 'enso') && (
        <section className="bg-white border border-blue-100 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-blue-50 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <CloudSun className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-black text-slate-900">
                  🌦️ El Niño &amp; Rainfall Impact Engine
                </h2>
                <p className="text-xs text-slate-500">Pacific ENSO &amp; Indian Ocean Dipole Teleconnection Model</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-1 rounded-lg font-bold">
                ENSO: {ensoData.ensoPhase}
              </span>
              <span className="text-xs bg-blue-50 text-blue-800 border border-blue-200 px-2.5 py-1 rounded-lg font-bold">
                IOD: {ensoData.iodPhase} (+{ensoData.iodAnomalyDegC}°C)
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-4">
              <span className="text-[10px] font-bold text-blue-700 uppercase">SST Anomaly (Niño 3.4)</span>
              <p className="text-2xl font-black text-blue-950 mt-1">+{ensoData.sstAnomalyDegC}°C</p>
              <p className="text-[11px] text-slate-500 mt-1">Threshold: ≥+0.5°C triggers El Niño watch</p>
            </div>

            <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-4">
              <span className="text-[10px] font-bold text-blue-700 uppercase">90-Day Expected Rainfall</span>
              <p className="text-2xl font-black text-blue-950 mt-1">{ensoData.expectedRainfall90DaysMm} mm</p>
              <p className="text-[11px] text-slate-500 mt-1">Uncertainty: ±{ensoData.rainfallUncertaintyMarginMm} mm</p>
            </div>

            <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-4">
              <span className="text-[10px] font-bold text-blue-700 uppercase">Model Confidence Score</span>
              <p className="text-2xl font-black text-emerald-700 mt-1">{ensoData.confidenceScore}%</p>
              <p className="text-[11px] text-slate-500 mt-1">Based on ECMWF &amp; IMD ensemble consensus</p>
            </div>

            <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-4">
              <span className="text-[10px] font-bold text-blue-700 uppercase">Historical Analogs</span>
              <p className="text-base font-black text-blue-950 mt-1.5">{ensoData.historicalAnalogYears.join(', ')}</p>
              <p className="text-[11px] text-slate-500 mt-1">High episodic intensity storms</p>
            </div>
          </div>

          <div className="bg-sky-50/80 border border-sky-200 rounded-2xl p-3.5 flex items-start gap-2.5 text-xs text-sky-950">
            <Info className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Monsoon Dynamic Summary: </span>
              {ensoData.monsoonImpactSummary}
            </div>
          </div>
        </section>
      )}

      {/* ============================================================= */}
      {/* ENGINE 2: 💧 WATER SUPPLY–DEMAND ENGINE                       */}
      {/* ============================================================= */}
      {(activeEngineTab === 'all' || activeEngineTab === 'balance') && (
        <section className="bg-white border border-blue-100 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-blue-50 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <Droplets className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-black text-slate-900">
                  💧 Water Supply–Demand Balance Engine
                </h2>
                <p className="text-xs text-slate-500">Volumetric budget across 4 supply vectors and 4 demand sinks</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-xs px-3 py-1 rounded-lg font-black border ${
                supplyDemandData.netBalanceMCM >= 0
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-amber-50 text-amber-800 border-amber-200'
              }`}>
                Net: {supplyDemandData.netBalanceMCM > 0 ? '+' : ''}{supplyDemandData.netBalanceMCM} MCM ({supplyDemandData.stressCategory})
              </span>
            </div>
          </div>

          {/* Supply Sources vs Demand Sinks */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Supply Sources */}
            <div className="bg-blue-50/50 border border-blue-200 rounded-2xl p-4.5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-blue-900 uppercase">Available Supply Sources</span>
                <span className="text-sm font-black text-blue-950">{supplyDemandData.totalSupplyMCM} MCM Total</span>
              </div>

              <div className="space-y-2.5">
                <div className="bg-white p-3 rounded-xl border border-blue-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                    <span className="text-xs font-bold text-slate-700">Catchment Dam Reservoirs</span>
                  </div>
                  <span className="text-xs font-black text-blue-950">{supplyDemandData.surfaceStorageMCM} MCM</span>
                </div>

                <div className="bg-white p-3 rounded-xl border border-blue-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span className="text-xs font-bold text-slate-700">Dynamic Groundwater Extractable</span>
                  </div>
                  <span className="text-xs font-black text-emerald-800">{supplyDemandData.groundwaterAvailableMCM} MCM</span>
                </div>

                <div className="bg-white p-3 rounded-xl border border-blue-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-sky-400" />
                    <span className="text-xs font-bold text-slate-700">Rainfall Infiltration Potential</span>
                  </div>
                  <span className="text-xs font-black text-sky-800">{supplyDemandData.rainfallInfiltrationMCM} MCM</span>
                </div>

                <div className="bg-white p-3 rounded-xl border border-blue-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                    <span className="text-xs font-bold text-slate-700">Recycled / Tertiary Treated Water</span>
                  </div>
                  <span className="text-xs font-black text-amber-800">{supplyDemandData.recycledWaterMCM} MCM</span>
                </div>
              </div>
            </div>

            {/* Demand Breakdown */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4.5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-900 uppercase">Sectoral Demands &amp; Allocation</span>
                <span className="text-sm font-black text-slate-950">{supplyDemandData.totalDemandMCM} MCM Demand</span>
              </div>

              <div className="space-y-2.5">
                {supplyDemandData.sectors.map((s) => (
                  <div key={s.sector} className="bg-white p-3 rounded-xl border border-slate-200 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800 flex items-center gap-1.5">
                        <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded font-black">
                          P{s.priorityLevel}
                        </span>
                        {s.sector}
                      </span>
                      <span className="font-black text-slate-900">
                        {s.allocatedMCM} / {s.demandMCM} MCM ({s.fulfillmentPercent}%)
                      </span>
                    </div>

                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${s.fulfillmentPercent}%` }}
                        className={`h-full rounded-full ${
                          s.fulfillmentPercent === 100
                            ? 'bg-emerald-500'
                            : s.fulfillmentPercent >= 75
                            ? 'bg-blue-600'
                            : 'bg-amber-500'
                        }`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ============================================================= */}
      {/* ENGINE 3: 📊 90-DAY WATER SECURITY PREDICTION                 */}
      {/* ============================================================= */}
      {(activeEngineTab === 'all' || activeEngineTab === 'security90') && (
        <section className="bg-white border border-blue-100 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-blue-50 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-black text-slate-900">
                  📊 90-Day Water Security Prediction Engine
                </h2>
                <p className="text-xs text-slate-500">30, 60, and 90-day storage depletion trajectory with scenario toggles</p>
              </div>
            </div>

            {/* Scenario Toggles */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              {[
                { id: 'dry', label: '☀️ Dry (-25% Rain)' },
                { id: 'normal', label: '⚖️ Normal Monsoon' },
                { id: 'wet', label: '🌧️ Wet (+25% Rain)' },
              ].map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSecurityScenario(s.id as any)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    securityScenario === s.id
                      ? 'bg-blue-600 text-white shadow-xs font-black'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Warning Banner if Dry Day Zero is active */}
          {security90Data.criticalDayZeroWarning && (
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-3.5 flex items-start gap-2.5 text-xs text-rose-900">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Critical Day-Zero Risk Alert: </span>
                {security90Data.criticalDayZeroWarning}
              </div>
            </div>
          )}

          {/* 30 / 60 / 90 Day Milestone Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50/60 border border-blue-200 rounded-2xl p-4.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-blue-900 uppercase">Day 30 Forecast</span>
                <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full">
                  Month 1 Horizon
                </span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-black text-blue-950">{activeScenarioData.day30MCM}</span>
                <span className="text-xs font-bold text-blue-700">MCM Reserve</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Full domestic supply guaranteed. Canal sluice releases standard for agricultural sowing.
              </p>
              <div className="pt-1 text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Stage: Sustainable Buffer
              </div>
            </div>

            <div className="bg-blue-50/60 border border-blue-200 rounded-2xl p-4.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-blue-900 uppercase">Day 60 Forecast</span>
                <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full">
                  Month 2 Horizon
                </span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-black text-blue-950">{activeScenarioData.day60MCM}</span>
                <span className="text-xs font-bold text-blue-700">MCM Reserve</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Soil moisture drying trajectory requires shift to Alternate Wetting &amp; Drying (AWD).
              </p>
              <div className="pt-1 text-[11px] font-bold text-blue-700 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Stage: Watch / Controlled Canal Run
              </div>
            </div>

            <div className="bg-blue-50/60 border border-blue-200 rounded-2xl p-4.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-blue-900 uppercase">Day 90 Forecast</span>
                <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full">
                  Month 3 Horizon
                </span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-black text-blue-950">{activeScenarioData.day90MCM}</span>
                <span className="text-xs font-bold text-blue-700">MCM Reserve</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Remaining reserves dedicated to drinking and downstream ecological riverine threshold.
              </p>
              <div className="pt-1 text-[11px] font-bold text-sky-800 flex items-center gap-1">
                <Activity className="w-3.5 h-3.5" /> Risk Level: {activeScenarioData.riskLevel}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ============================================================= */}
      {/* ENGINE 4: 🧠 NEER-AI EXPLAINABLE DECISION ENGINE (XAI)        */}
      {/* ============================================================= */}
      {(activeEngineTab === 'all' || activeEngineTab === 'decision') && (
        <section className="bg-white border border-blue-100 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-blue-50 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <Zap className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-black text-slate-900">
                  🧠 NEER-AI Explainable Decision Engine (XAI)
                </h2>
                <p className="text-xs text-slate-500">Transparent rationale and targeted multi-stakeholder action directives</p>
              </div>
            </div>
            <span className="text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-lg font-bold">
              AI Confidence: {decisionData.confidencePercent}%
            </span>
          </div>

          {/* Primary Recommendation Banner */}
          <div className="bg-gradient-to-r from-blue-50 via-sky-50 to-blue-50 border border-blue-200 rounded-2xl p-4 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider bg-blue-600 text-white px-2 py-0.5 rounded">
                Executive Synthesis
              </span>
              <h3 className="font-black text-sm text-blue-950">Why NEER-AI Made This Recommendation</h3>
            </div>
            <p className="text-xs sm:text-sm text-blue-900 font-medium leading-relaxed">
              {decisionData.primaryRecommendation}
            </p>
          </div>

          {/* Rationale Factors (Measured Values vs Thresholds) */}
          <div>
            <h4 className="text-xs font-black text-slate-700 uppercase tracking-wide mb-2.5">
              Transparent Rationale Chain (Telemetry vs Policy Limits)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {decisionData.rationaleFactors.map((f) => (
                <div key={f.factor} className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-700 truncate">{f.factor}</span>
                    <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${
                      f.impact === 'High' ? 'bg-amber-100 text-amber-900' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {f.impact}
                    </span>
                  </div>
                  <p className="text-sm font-black text-slate-900">{f.measuredValue}</p>
                  <p className="text-[10px] text-slate-500">{f.threshold}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Multi-Stakeholder Action Plans */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black text-slate-700 uppercase tracking-wide">
                Stakeholder Action Directive Matrix
              </h4>
              <span className="text-[11px] text-slate-500 font-medium">Select a persona:</span>
            </div>

            {/* Persona Switcher Buttons */}
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
              {[
                { id: 'Farmers', label: '👨‍🌾 Farmers', icon: Sprout },
                { id: 'Water Authorities', label: '🏛️ Authorities (PWD)', icon: Building2 },
                { id: 'Communities', label: '🏘️ Communities', icon: Users },
                { id: 'Industries', label: '🏭 Industries', icon: Zap },
                { id: 'Ecosystems', label: '🌳 Ecosystems', icon: Trees },
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedPersona(p.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                    selectedPersona === p.id
                      ? 'bg-blue-600 text-white shadow-xs font-black'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Persona Action Box */}
            <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-5 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-blue-200/60 pb-3">
                <div>
                  <span className="text-[10px] font-black uppercase text-blue-700 tracking-wider">
                    {activeStakeholder.persona} Action Plan
                  </span>
                  <h3 className="text-sm sm:text-base font-black text-blue-950 mt-0.5">
                    {activeStakeholder.headline}
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-emerald-100 text-emerald-900 border border-emerald-300 px-2.5 py-1 rounded-lg font-black">
                    Save: +{activeStakeholder.waterSavingsPotentialMCM} MCM
                  </span>
                  <span className="text-xs bg-blue-100 text-blue-900 border border-blue-300 px-2.5 py-1 rounded-lg font-bold">
                    {activeStakeholder.urgency}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                {activeStakeholder.actions.map((act, i) => (
                  <div key={i} className="bg-white p-3 rounded-xl border border-blue-100 flex items-start gap-2 text-xs text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <span>{act}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ============================================================= */}
      {/* ENGINE 5: 💦 WATER ALLOCATION OPTIMIZER                       */}
      {/* ============================================================= */}
      {(activeEngineTab === 'all' || activeEngineTab === 'allocation') && (
        <section className="bg-white border border-blue-100 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-blue-50 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-black text-slate-900">
                  💦 Water Allocation Optimizer
                </h2>
                <p className="text-xs text-slate-500">Constrained multi-objective resource rationing with statutory priorities</p>
              </div>
            </div>
            <span className="text-xs bg-blue-50 text-blue-800 border border-blue-200 px-2.5 py-1 rounded-lg font-bold">
              Priority 1: Drinking &gt; Priority 2: E-Flow &gt; Priority 3: Agri &gt; Priority 4: Industry
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3.5">
            {supplyDemandData.sectors.map((s) => (
              <div key={s.sector} className="border border-slate-200 rounded-2xl p-4 space-y-2 bg-white hover:border-blue-300 transition">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
                    Priority {s.priorityLevel}
                  </span>
                  <span className="text-xs font-black text-slate-900">{s.fulfillmentPercent}%</span>
                </div>
                <h3 className="font-extrabold text-sm text-slate-900">{s.sector}</h3>
                <div className="text-xs text-slate-600 space-y-0.5">
                  <div className="flex justify-between">
                    <span>Allocated:</span>
                    <span className="font-bold text-blue-900">{s.allocatedMCM} MCM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Demand:</span>
                    <span>{s.demandMCM} MCM</span>
                  </div>
                  <div className="flex justify-between text-amber-700 font-bold">
                    <span>Deficit:</span>
                    <span>{s.deficitMCM} MCM</span>
                  </div>
                </div>

                <div className="h-2 bg-slate-100 rounded-full overflow-hidden mt-1">
                  <div
                    style={{ width: `${s.fulfillmentPercent}%` }}
                    className={`h-full ${
                      s.fulfillmentPercent === 100
                        ? 'bg-emerald-500'
                        : s.fulfillmentPercent >= 75
                        ? 'bg-blue-600'
                        : 'bg-amber-500'
                    }`}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-3.5 text-xs text-blue-900 flex items-start gap-2">
            <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Optimizer Protocol: </span>
              In case of seasonal dry spells, the optimizer automatically protects 100% of municipal drinking quotas and Central Water Commission mandatory riverine ecological baseflows before rationing agricultural canals or industrial withdrawals.
            </div>
          </div>
        </section>
      )}

      {/* ============================================================= */}
      {/* ENGINE 6: 🌳 ECOSYSTEM & DROUGHT EARLY WARNING                */}
      {/* ============================================================= */}
      {(activeEngineTab === 'all' || activeEngineTab === 'ecosystem') && (
        <section className="bg-white border border-blue-100 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-blue-50 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <Trees className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-black text-slate-900">
                  🌳 Ecosystem &amp; Drought Early Warning Engine
                </h2>
                <p className="text-xs text-slate-500">Ecological baseflows, wetland health indicators, and 4-tier drought progression</p>
              </div>
            </div>
            <span className="text-xs bg-amber-50 text-amber-800 border border-amber-300 px-3 py-1 rounded-lg font-black">
              {ecosystemData.droughtStage}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-4 space-y-2">
              <span className="text-[10px] font-bold text-emerald-800 uppercase">E-Flow Compliance Rate</span>
              <p className="text-3xl font-black text-emerald-950">{ecosystemData.eFlowCompliancePercent}%</p>
              <p className="text-xs text-slate-600">
                Minimum {ecosystemData.ecologicalReserveMCM} MCM baseflow sustained to preserve riverine salinity buffers.
              </p>
            </div>

            <div className="bg-blue-50/60 border border-blue-200 rounded-2xl p-4 space-y-2">
              <span className="text-[10px] font-bold text-blue-800 uppercase">Ecosystem Stress Index</span>
              <p className="text-3xl font-black text-blue-950">{ecosystemData.ecosystemStressScore} / 100</p>
              <p className="text-xs text-slate-600">
                Monitors riparian vegetation vigor, mangrove estuary salinity, and aquatic dissolved oxygen.
              </p>
            </div>

            <div className="bg-amber-50/60 border border-amber-200 rounded-2xl p-4 space-y-2">
              <span className="text-[10px] font-bold text-amber-800 uppercase">Critical Shortage Clock</span>
              <p className="text-3xl font-black text-amber-950">~{ecosystemData.criticalShortageDays} Days</p>
              <p className="text-xs text-slate-600">
                Estimated duration before reservoir drops to municipal contingency threshold without rain.
              </p>
            </div>
          </div>

          <div className="space-y-2 pt-1">
            <h4 className="text-xs font-black text-slate-700 uppercase tracking-wide">
              Active Ecological Bulletins
            </h4>
            {ecosystemData.alerts.map((alt, idx) => (
              <div key={idx} className="bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs text-slate-700 font-medium">
                {alt}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ============================================================= */}
      {/* ENGINE 7: 📄 IMPACT COMPARISON ("WITHOUT VS WITH NEER-AI")     */}
      {/* ============================================================= */}
      {(activeEngineTab === 'all' || activeEngineTab === 'impact') && (
        <section className="bg-gradient-to-br from-slate-900 to-blue-950 text-white rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-xl space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div>
              <span className="bg-sky-400/20 text-sky-300 border border-sky-400/30 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full inline-block">
                Verified Value &amp; Impact Assessment
              </span>
              <h2 className="text-lg sm:text-2xl font-black text-white mt-1">
                📄 Impact Matrix: Without NEER-AI vs. With NEER-AI
              </h2>
              <p className="text-xs text-slate-300">
                Quantified water conservation, economic savings, and drought avoidance for {selectedLocation.name}
              </p>
            </div>

            <button
              onClick={onDownloadPDF}
              disabled={isDownloadingPDF}
              className="px-4 py-2.5 rounded-xl bg-white text-blue-950 hover:bg-blue-50 font-black text-xs flex items-center gap-2 shadow-md transition cursor-pointer select-none self-start sm:self-auto disabled:opacity-75"
            >
              <FileDown className="w-4 h-4 text-blue-700" />
              <span>Export Complete PDF Dossier</span>
            </button>
          </div>

          {/* 4 Impact Summary KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-white/10 border border-white/10 rounded-2xl p-4">
              <span className="text-[10px] text-slate-300 uppercase font-bold">Total Water Saved</span>
              <p className="text-2xl sm:text-3xl font-black text-sky-300 mt-1">+{impactData.totalWaterSavedMCM} MCM</p>
              <p className="text-[11px] text-slate-400 mt-0.5">~{(impactData.totalWaterSavedMCM * 1000).toFixed(0)} Million Liters</p>
            </div>

            <div className="bg-white/10 border border-white/10 rounded-2xl p-4">
              <span className="text-[10px] text-slate-300 uppercase font-bold">Loss Reduced</span>
              <p className="text-2xl sm:text-3xl font-black text-emerald-400 mt-1">{impactData.percentLossReduced}%</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Across agricultural pumping</p>
            </div>

            <div className="bg-white/10 border border-white/10 rounded-2xl p-4">
              <span className="text-[10px] text-slate-300 uppercase font-bold">Economic Loss Avoided</span>
              <p className="text-2xl sm:text-3xl font-black text-amber-300 mt-1">₹{impactData.economicBenefitCroresINR} Cr</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Crop yields &amp; tanker expenses</p>
            </div>

            <div className="bg-white/10 border border-white/10 rounded-2xl p-4">
              <span className="text-[10px] text-slate-300 uppercase font-bold">Buffer Days Gained</span>
              <p className="text-2xl sm:text-3xl font-black text-sky-200 mt-1">+{impactData.droughtDaysAvoided} Days</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Prolonged reservoir endurance</p>
            </div>
          </div>

          {/* Detailed Side-by-Side Comparison Table */}
          <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-white/10 text-slate-300 font-bold border-b border-white/10">
                    <th className="p-3.5 sm:p-4">Hydrological Metric</th>
                    <th className="p-3.5 sm:p-4 text-rose-300">Without NEER-AI (Status Quo)</th>
                    <th className="p-3.5 sm:p-4 text-emerald-300">With NEER-AI Platform</th>
                    <th className="p-3.5 sm:p-4 text-sky-300 font-black">Net Benefit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10 text-slate-200 font-medium">
                  {impactData.metrics.map((m, idx) => (
                    <tr key={idx} className="hover:bg-white/5 transition">
                      <td className="p-3.5 sm:p-4 font-bold text-white">{m.metric}</td>
                      <td className="p-3.5 sm:p-4 text-slate-300">{m.withoutNeerAi}</td>
                      <td className="p-3.5 sm:p-4 text-emerald-200 font-semibold">{m.withNeerAi}</td>
                      <td className="p-3.5 sm:p-4 text-sky-300 font-black">{m.benefit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
