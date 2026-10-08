'use client';

import React, { useState } from 'react';
import { IrrigationPlan, LiveWeatherData } from '@/types';
import { calculateIrrigationPlan } from '@/lib/api';
import { Clock, Droplet, CheckCircle, Sliders, Sparkles } from 'lucide-react';

interface IrrigationScheduleWidgetProps {
  weather: LiveWeatherData | null;
  locationName: string;
}

const CROP_OPTIONS = [
  { name: 'Paddy (Rice)', factor: 1.8, method: 'Alternate Wetting & Drying (AWD)' },
  { name: 'Sugarcane', factor: 1.5, method: 'Drip Irrigation / Furrow' },
  { name: 'Banana', factor: 1.4, method: 'Drip Micro-irrigation' },
  { name: 'Maize / Corn', factor: 1.0, method: 'Sprinkler / Furrow' },
  { name: 'Cotton', factor: 0.9, method: 'Drip Irrigation' },
  { name: 'Vegetables (Tomato/Chilli)', factor: 0.8, method: 'Drip Irrigation' },
  { name: 'Millets (Ragi/Bajra)', factor: 0.45, method: 'Rainfed / Protective Sprinkler' },
  { name: 'Pulses (Blackgram/Greengram)', factor: 0.5, method: 'Sprinkler' },
];

export default function IrrigationScheduleWidget({ weather, locationName }: IrrigationScheduleWidgetProps) {
  const [selectedCrop, setSelectedCrop] = useState(CROP_OPTIONS[0]);

  if (!weather) {
    return (
      <div className="bg-white border border-blue-100 rounded-2xl p-5 text-slate-600 shadow-sm">
        <p>Loading weather telemetry for irrigation scheduler...</p>
      </div>
    );
  }

  const basePlan = calculateIrrigationPlan(weather, selectedCrop.name);
  const adjustedLiters = Number((basePlan.waterAmountLitersPerSqm * selectedCrop.factor).toFixed(1));

  return (
    <div className="bg-white border border-blue-100 rounded-2xl p-5 shadow-sm text-slate-800 flex flex-col justify-between transition hover:shadow-md">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-sm tracking-wide uppercase text-blue-950">
              Smart Irrigation Schedules
            </h3>
          </div>
          <span className="text-[11px] bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full font-bold">
            Water Saver AI
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-1.5 font-medium">
          Precision irrigation guidance for <span className="text-blue-950 font-bold">{locationName}</span>
        </p>

        {/* Rain Skip Warning Banner (if rain predicted) */}
        {basePlan.rainSkipWarning && (
          <div className="mt-3 bg-blue-50 border border-blue-300 rounded-xl p-3 flex items-start gap-2.5 text-blue-900">
            <Droplet className="w-5 h-5 text-blue-600 shrink-0 mt-0.5 animate-bounce" />
            <div className="text-xs">
              <span className="font-extrabold text-blue-950 block">🌧️ Water Conservation Notice!</span>
              <p className="mt-0.5 text-blue-800 font-medium">{basePlan.rainSkipWarning}</p>
            </div>
          </div>
        )}

        {/* Main Advisory Box */}
        <div
          className={`mt-4 border rounded-xl p-4 ${
            basePlan.shouldIrrigate
              ? 'bg-blue-50/70 border-blue-200'
              : 'bg-emerald-50/70 border-emerald-200'
          }`}
        >
          <div className="flex items-start justify-between">
            <div>
              <div className="text-xs font-bold text-slate-500">Recommended Advisory</div>
              <div className="text-lg font-black text-slate-900 mt-0.5 flex items-center gap-2">
                {basePlan.shouldIrrigate ? (
                  <>
                    <CheckCircle className="w-5 h-5 text-blue-600" />
                    <span>Scheduled Irrigation Due</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                    <span>Hold Irrigation (Sufficient Moisture)</span>
                  </>
                )}
              </div>
            </div>

            <span
              className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                basePlan.shouldIrrigate
                  ? 'bg-blue-100 text-blue-800 border-blue-300'
                  : 'bg-emerald-100 text-emerald-800 border-emerald-300'
              }`}
            >
              {basePlan.shouldIrrigate ? 'Watering Required' : 'Water Saved'}
            </span>
          </div>

          <p className="text-xs text-slate-700 mt-2 leading-relaxed font-medium">{basePlan.reason}</p>

          <div className="mt-3 pt-2.5 border-t border-slate-200/80 grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-slate-500 block text-[11px] font-medium">Recommended Window</span>
              <strong className="text-blue-900 font-bold">{basePlan.nextRecommendedTime}</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px] font-medium">Best Application Method</span>
              <strong className="text-slate-900 font-bold">{selectedCrop.method}</strong>
            </div>
          </div>
        </div>

        {/* Interactive Crop Selector */}
        <div className="mt-4">
          <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5 mb-1.5">
            <Sliders className="w-3.5 h-3.5 text-blue-600" />
            <span>Select Target Crop for Calibrated Requirement</span>
          </label>
          <select
            value={selectedCrop.name}
            onChange={(e) => {
              const found = CROP_OPTIONS.find((c) => c.name === e.target.value);
              if (found) setSelectedCrop(found);
            }}
            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 transition cursor-pointer"
          >
            {CROP_OPTIONS.map((c) => (
              <option key={c.name} value={c.name}>
                {c.name} (Crop Water Factor: {c.factor}x)
              </option>
            ))}
          </select>
        </div>

        {/* Calculated Water Budget */}
        <div className="mt-3 grid grid-cols-3 gap-2">
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-2.5 text-center">
            <div className="text-[10px] text-slate-500 font-medium">Application Rate</div>
            <div className="text-sm font-black text-blue-800 mt-0.5">
              {basePlan.shouldIrrigate ? `${adjustedLiters} L/m²` : '0 L/m²'}
            </div>
            <div className="text-[10px] text-slate-400">Root zone need</div>
          </div>

          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-2.5 text-center">
            <div className="text-[10px] text-slate-500 font-medium">Next Cycle</div>
            <div className="text-sm font-black text-slate-900 mt-0.5">
              In {basePlan.daysUntilNextIrrigation} days
            </div>
            <div className="text-[10px] text-slate-400">Interval check</div>
          </div>

          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-2.5 text-center">
            <div className="text-[10px] text-slate-500 font-medium">Evapotranspiration</div>
            <div className="text-sm font-black text-amber-700 mt-0.5">
              {(weather.daily.evapotranspiration[0] ?? 4.8).toFixed(1)} mm/d
            </div>
            <div className="text-[10px] text-slate-400">FAO-56 ET0</div>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-600 flex items-center gap-1.5 font-medium">
        <Sparkles className="w-3.5 h-3.5 text-blue-600 shrink-0" />
        <span>Early morning irrigation (before 07:00 AM) saves up to 35% water loss due to daytime solar heat.</span>
      </div>
    </div>
  );
}
