'use client';

import React from 'react';
import { Dam } from '@/types';
import { Waves, MapPin, Gauge, ExternalLink, ShieldCheck, AlertCircle } from 'lucide-react';

interface DamLevelWidgetProps {
  nearestDams: Dam[];
  onSelectDam: (dam: Dam) => void;
  locationName: string;
}

export default function DamLevelWidget({ nearestDams, onSelectDam, locationName }: DamLevelWidgetProps) {
  if (!nearestDams || nearestDams.length === 0) {
    return (
      <div className="bg-white border border-blue-100 rounded-2xl p-5 text-slate-600 shadow-sm">
        <p>No nearby dams located within standard basin radius.</p>
      </div>
    );
  }

  const avgStoragePct = Math.round(
    nearestDams.reduce((acc, dam) => acc + dam.storagePercentage, 0) / nearestDams.length
  );

  return (
    <div className="bg-white border border-blue-100 rounded-2xl p-5 shadow-sm text-slate-800 flex flex-col justify-between transition hover:shadow-md h-full">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
              <Waves className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-sm tracking-wide uppercase text-blue-950">
              Nearby Dam Storage & Capacity
            </h3>
          </div>
          <span className="text-[11px] bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full font-bold">
            NWIC Official
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-1.5">
          Nearest reservoir network for <span className="text-blue-950 font-bold">{locationName}</span>
        </p>

        {/* Catchment Basin Average Card */}
        <div className="mt-4 bg-gradient-to-r from-blue-50 to-sky-50 border border-blue-200/80 rounded-xl p-3.5 flex items-center justify-between">
          <div>
            <div className="text-xs text-blue-800 font-semibold">Catchment Average Storage</div>
            <div className="text-2xl font-black text-blue-950 mt-0.5">{avgStoragePct}% Capacity</div>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-lg bg-white border border-blue-200 shadow-xs">
            {avgStoragePct >= 65 ? (
              <>
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span className="text-emerald-700">Healthy Reserves</span>
              </>
            ) : avgStoragePct >= 40 ? (
              <>
                <Gauge className="w-4 h-4 text-amber-600" />
                <span className="text-amber-700">Moderate Reserve</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-4 h-4 text-rose-600" />
                <span className="text-rose-700">Low Catchment</span>
              </>
            )}
          </div>
        </div>

        {/* List of nearest dams */}
        <div className="mt-4 space-y-3 max-h-[340px] overflow-y-auto pr-1">
          {nearestDams.map((dam) => {
            const isHealthy = dam.storagePercentage >= 70;
            const isMedium = dam.storagePercentage >= 40 && dam.storagePercentage < 70;

            return (
              <div
                key={dam.id}
                onClick={() => onSelectDam(dam)}
                className="group cursor-pointer bg-slate-50/70 hover:bg-blue-50/60 border border-slate-200/80 hover:border-blue-300 rounded-xl p-3 transition"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-bold text-sm text-slate-900 group-hover:text-blue-700 transition flex items-center gap-1.5">
                      <span>{dam.name}</span>
                      <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-blue-600 transition" />
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                      <span className="flex items-center gap-0.5 font-medium">
                        <MapPin className="w-3 h-3 text-blue-600" />
                        {dam.distanceKm} km away
                      </span>
                      <span>•</span>
                      <span>{dam.district}, {dam.state}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`text-xs font-black px-2.5 py-0.5 rounded-full border ${
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
                <div className="mt-2.5">
                  <div className="w-full h-2.5 bg-slate-200/80 rounded-full overflow-hidden border border-slate-200">
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

                  <div className="flex items-center justify-between text-[11px] text-slate-600 mt-1 font-mono font-medium">
                    <span>
                      Storage: <strong className="text-blue-900 font-bold">{dam.currentStorageMCM} MCM</strong>
                    </span>
                    <span>
                      Gross: <strong className="text-slate-800">{dam.grossCapacityMCM} MCM</strong>
                    </span>
                  </div>
                </div>

                <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500 border-t border-slate-200/60 pt-1.5">
                  <span>River: {dam.river || 'Regional Basin'}</span>
                  <span>Purpose: {dam.purpose?.split('/')[0] || 'Irrigation'}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
