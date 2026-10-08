'use client';

import React, { useState } from 'react';
import { DroughtAlert } from '@/types';
import rawAlerts from '@/data/droughtAlerts.json';
import { AlertTriangle, ShieldAlert, CheckCircle, Info, ChevronRight } from 'lucide-react';

interface DroughtAlertsWidgetProps {
  onSelectDistrict?: (district: string) => void;
}

export default function DroughtAlertsWidget({ onSelectDistrict }: DroughtAlertsWidgetProps) {
  const [selectedSeverity, setSelectedSeverity] = useState<string>('All');
  const alerts = rawAlerts as DroughtAlert[];

  const filtered = alerts.filter((a) => {
    if (selectedSeverity === 'All') return true;
    return a.severity === selectedSeverity;
  });

  const getSeverityBadge = (severity: DroughtAlert['severity']) => {
    switch (severity) {
      case 'Severe Drought':
        return {
          badge: 'bg-rose-50 text-rose-700 border-rose-200',
          border: 'border-l-4 border-l-rose-500',
          icon: ShieldAlert,
        };
      case 'Moderate Drought':
        return {
          badge: 'bg-orange-50 text-orange-700 border-orange-200',
          border: 'border-l-4 border-l-orange-500',
          icon: AlertTriangle,
        };
      case 'Advisory':
        return {
          badge: 'bg-amber-50 text-amber-700 border-amber-200',
          border: 'border-l-4 border-l-amber-500',
          icon: Info,
        };
      case 'Normal':
        return {
          badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          border: 'border-l-4 border-l-emerald-500',
          icon: CheckCircle,
        };
    }
  };

  return (
    <div className="bg-white border border-blue-100 rounded-2xl p-5 shadow-sm text-slate-800 flex flex-col justify-between transition hover:shadow-md h-full">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-sm tracking-wide uppercase text-blue-950">
              Drought Relief Alerts & Advisories
            </h3>
          </div>
          <span className="text-[11px] bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full font-bold">
            TN Disaster Mgmt
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-1.5 font-medium">
          Official agro-drought bulletins & emergency relief schemes
        </p>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 mt-3.5 overflow-x-auto pb-1 text-xs">
          {['All', 'Severe Drought', 'Moderate Drought', 'Advisory', 'Normal'].map((sev) => (
            <button
              key={sev}
              onClick={() => setSelectedSeverity(sev)}
              className={`px-3 py-1 rounded-lg font-bold transition shrink-0 ${
                selectedSeverity === sev
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:text-blue-700 border border-slate-200'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>

        {/* Alerts List */}
        <div className="mt-3.5 space-y-2.5 max-h-[350px] overflow-y-auto pr-1">
          {filtered.map((alert, idx) => {
            const style = getSeverityBadge(alert.severity);
            const Icon = style.icon;

            return (
              <div
                key={idx}
                className={`bg-slate-50/70 hover:bg-blue-50/40 border border-slate-200/80 rounded-xl p-3.5 transition ${style.border}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">{alert.district} District</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${style.badge}`}
                    >
                      <Icon className="w-3 h-3" />
                      {alert.severity}
                    </span>
                  </div>

                  <span className="text-[11px] font-mono font-bold text-rose-700 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded">
                    {alert.rainfallDeficitPercentage > 0 ? `+${alert.rainfallDeficitPercentage}%` : `${alert.rainfallDeficitPercentage}%`} Rain
                  </span>
                </div>

                <p className="text-xs text-slate-700 mt-1.5 leading-relaxed font-medium">{alert.description}</p>

                {/* Government Relief Action */}
                <div className="mt-2.5 bg-amber-50/80 border border-amber-200 rounded-lg p-2.5 text-[11px] text-amber-950 font-medium">
                  <strong className="text-amber-800 block mb-0.5 font-bold">Relief Protocol:</strong>
                  {alert.recommendedAction}
                </div>

                <div className="mt-2.5 flex items-center justify-between text-[10px] text-slate-500 font-medium">
                  <span>Updated: {alert.updatedDate}</span>
                  {onSelectDistrict && (
                    <button
                      onClick={() => onSelectDistrict(alert.district)}
                      className="text-blue-700 hover:text-blue-900 flex items-center gap-0.5 font-bold"
                    >
                      Focus District <ChevronRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
