'use client';

import React from 'react';
import { AgroSuitabilityResult } from '@/types';
import { Sprout, CheckCircle2, AlertOctagon, Info, Sparkles, TrendingUp } from 'lucide-react';

interface AgroSuitabilityWidgetProps {
  suitability: AgroSuitabilityResult | null;
  locationName: string;
}

export default function AgroSuitabilityWidget({ suitability, locationName }: AgroSuitabilityWidgetProps) {
  if (!suitability) {
    return (
      <div className="bg-white border border-blue-100 rounded-2xl p-5 text-slate-600 shadow-sm">
        <p>Calculating agricultural suitability algorithm...</p>
      </div>
    );
  }

  const getRatingStyle = (rating: AgroSuitabilityResult['rating']) => {
    switch (rating) {
      case 'Highly Suitable':
        return {
          textColor: 'text-blue-700',
          bgColor: 'bg-blue-50 border-blue-200',
          badge: 'bg-blue-600 text-white font-black',
          progressColor: 'from-blue-600 to-sky-400',
        };
      case 'Moderately Suitable':
        return {
          textColor: 'text-sky-700',
          bgColor: 'bg-sky-50 border-sky-200',
          badge: 'bg-sky-600 text-white font-black',
          progressColor: 'from-sky-600 to-cyan-400',
        };
      case 'Marginal':
        return {
          textColor: 'text-amber-700',
          bgColor: 'bg-amber-50 border-amber-200',
          badge: 'bg-amber-600 text-white font-black',
          progressColor: 'from-amber-500 to-yellow-400',
        };
      case 'Drought Risk':
        return {
          textColor: 'text-rose-700',
          bgColor: 'bg-rose-50 border-rose-200',
          badge: 'bg-rose-600 text-white font-black',
          progressColor: 'from-rose-500 to-red-400',
        };
    }
  };

  const style = getRatingStyle(suitability.rating);

  return (
    <div className="bg-white border border-blue-100 rounded-2xl p-5 shadow-sm text-slate-800 flex flex-col justify-between transition hover:shadow-md">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
              <Sprout className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-sm tracking-wide uppercase text-blue-950">
              Agricultural Land Suitability
            </h3>
          </div>
          <span className="text-[11px] bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full font-bold">
            NEER-AI Engine
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-1.5 font-medium">
          Crop viability analysis for <span className="text-blue-950 font-bold">{locationName}</span>
        </p>

        {/* Big Score Card */}
        <div className={`mt-4 border rounded-xl p-4 ${style.bgColor} flex items-center justify-between`}>
          <div>
            <div className="text-xs font-bold text-slate-600">Agro-Suitability Score</div>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-4xl font-black text-blue-950">{suitability.score}</span>
              <span className="text-sm font-bold text-slate-500">/ 100</span>
            </div>
            <div className="text-xs text-slate-700 font-semibold mt-1 flex items-center gap-1.5">
              <span className={`inline-block w-2 h-2 rounded-full ${style.textColor} bg-current`}></span>
              <span>Water Stress: <strong className="text-slate-900">{suitability.waterStressLevel}</strong></span>
            </div>
          </div>

          <div className="text-right">
            <span className={`px-3 py-1 text-xs rounded-full uppercase tracking-wider ${style.badge} shadow-xs`}>
              {suitability.rating}
            </span>
            <div className="mt-2 text-[11px] text-slate-500 font-medium">
              Calculated from soil, rain & aquifer
            </div>
          </div>
        </div>

        {/* Progress Bar of Composite Score */}
        <div className="mt-3">
          <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden border border-slate-200">
            <div
              className={`h-full rounded-full bg-gradient-to-r ${style.progressColor} transition-all duration-700`}
              style={{ width: `${suitability.score}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-medium">
            <span>Drought Risk (0)</span>
            <span>Marginal (35)</span>
            <span>Moderate (55)</span>
            <span>Highly Suitable (75-100)</span>
          </div>
        </div>

        {/* 3 Component Sub-scores */}
        <div className="grid grid-cols-3 gap-2 mt-4">
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-2.5 text-center">
            <div className="text-[10px] text-slate-500 font-medium">Soil Moisture</div>
            <div className="text-sm font-black text-blue-700 mt-0.5">{suitability.soilMoistureScore}/35</div>
            <div className="text-[10px] text-slate-400">Root zone</div>
          </div>
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-2.5 text-center">
            <div className="text-[10px] text-slate-500 font-medium">Aquifer Depth</div>
            <div className="text-sm font-black text-emerald-700 mt-0.5">{suitability.groundwaterScore}/25</div>
            <div className="text-[10px] text-slate-400">Borewell access</div>
          </div>
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-2.5 text-center">
            <div className="text-[10px] text-slate-500 font-medium">Rain & Reservoir</div>
            <div className="text-sm font-black text-indigo-700 mt-0.5">{suitability.weatherRainScore}/20</div>
            <div className="text-[10px] text-slate-400">Precipitation</div>
          </div>
        </div>

        {/* Recommended Crops */}
        <div className="mt-4">
          <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Optimal Recommended Crops for this Zone</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {suitability.recommendedCrops.map((crop, i) => (
              <span
                key={i}
                className="text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200 px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-2xs"
              >
                <CheckCircle2 className="w-3 h-3 text-blue-600" />
                {crop}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Advisory Note */}
      <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-600 space-y-1 font-medium">
        {suitability.reasons.map((r, i) => (
          <div key={i} className="flex items-start gap-1.5">
            <span className="text-blue-600 mt-0.5 font-bold">•</span>
            <span>{r}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
