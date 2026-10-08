'use client';

import React from 'react';
import { LiveWeatherData } from '@/types';
import { decodeWeatherCode } from '@/lib/api';
import {
  CloudSun,
  Droplets,
  Wind,
  Calendar,
  Clock,
  SunMedium,
  Umbrella,
} from 'lucide-react';

interface WeatherWidgetProps {
  weather: LiveWeatherData | null;
  locationName: string;
  loading: boolean;
}

export default function WeatherWidget({ weather, locationName, loading }: WeatherWidgetProps) {
  if (loading || !weather) {
    return (
      <div className="bg-white border border-blue-100 rounded-2xl p-4 sm:p-5 shadow-sm animate-pulse min-h-[300px] flex flex-col justify-between">
        <div className="h-6 bg-slate-100 rounded w-1/2 mb-4"></div>
        <div className="h-20 bg-blue-50/60 rounded-xl mb-4"></div>
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          <div className="h-16 bg-slate-100 rounded-lg"></div>
          <div className="h-16 bg-slate-100 rounded-lg"></div>
          <div className="h-16 bg-slate-100 rounded-lg"></div>
        </div>
      </div>
    );
  }

  const weatherInfo = decodeWeatherCode(weather.weatherCode);

  const next12Hours = weather.hourly.time.slice(0, 12).map((t, idx) => {
    const d = new Date(t);
    const hourStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return {
      hour: hourStr,
      prob: weather.hourly.precipitationProbability[idx] ?? 0,
      precip: weather.hourly.precipitation[idx] ?? 0,
    };
  });

  return (
    <div className="bg-white border border-blue-100 rounded-2xl p-4 sm:p-5 shadow-sm text-slate-800 flex flex-col justify-between transition hover:shadow-md">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0">
              <CloudSun className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-xs sm:text-sm tracking-wide uppercase text-blue-950 truncate">
              Live Weather & Rain Prediction
            </h3>
          </div>
          <span className="text-[10px] sm:text-[11px] bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full font-bold shrink-0">
            Open-Meteo
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-1.5 font-medium truncate">{locationName}</p>

        {/* Current Temp and Metrics */}
        <div className="mt-3.5 sm:mt-4 flex items-center justify-between bg-gradient-to-r from-blue-50/80 to-sky-50/60 p-3 sm:p-4 rounded-xl border border-blue-200/60">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-500 shadow-2xs shrink-0">
              <SunMedium className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-blue-950 tracking-tight">
                {weather.temperature}°C
              </div>
              <div className="text-xs text-blue-800 font-bold">{weatherInfo.label}</div>
            </div>
          </div>
          <div className="text-right text-xs space-y-0.5 sm:space-y-1">
            <div className="text-slate-600">
              Feels <span className="text-slate-900 font-bold">{weather.apparentTemp ?? weather.temperature}°C</span>
            </div>
            <div className="text-slate-600">
              Precip: <span className="text-blue-700 font-bold">{weather.precipitation} mm</span>
            </div>
          </div>
        </div>

        {/* 3 Metric Cards */}
        <div className="grid grid-cols-3 gap-1.5 sm:gap-2 mt-3">
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-2 sm:p-2.5 text-center">
            <div className="flex items-center justify-center gap-1 text-[10px] sm:text-[11px] text-slate-500 font-medium">
              <Droplets className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-blue-600" />
              <span>Humidity</span>
            </div>
            <div className="text-xs sm:text-sm font-black text-slate-900 mt-0.5 sm:mt-1">{weather.humidity}%</div>
          </div>

          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-2 sm:p-2.5 text-center">
            <div className="flex items-center justify-center gap-1 text-[10px] sm:text-[11px] text-slate-500 font-medium">
              <Wind className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-sky-600" />
              <span>Wind</span>
            </div>
            <div className="text-xs sm:text-sm font-black text-slate-900 mt-0.5 sm:mt-1">{weather.windSpeed} km/h</div>
          </div>

          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-2 sm:p-2.5 text-center">
            <div className="flex items-center justify-center gap-1 text-[10px] sm:text-[11px] text-slate-500 font-medium">
              <Umbrella className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-indigo-600" />
              <span>Rain Prob</span>
            </div>
            <div className="text-xs sm:text-sm font-black text-blue-600 mt-0.5 sm:mt-1">
              {weather.daily.precipitationProbMax[0] ?? 10}%
            </div>
          </div>
        </div>

        {/* Hourly Rain Probability Prediction with Mobile Horizontal Scroll */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-slate-600 mb-2">
            <span className="flex items-center gap-1 font-bold text-slate-800 text-[11px] sm:text-xs">
              <Clock className="w-3.5 h-3.5 text-blue-600" /> Hourly Rain Probability (%)
            </span>
            <span className="text-[10px] sm:text-[11px] text-blue-600 font-mono font-bold">12h Forecast</span>
          </div>
          
          <div className="bg-blue-50/50 p-2 sm:p-2.5 rounded-xl border border-blue-100 overflow-x-auto scrollbar-none">
            <div className="grid grid-cols-6 gap-2 min-w-[340px]">
              {next12Hours.slice(0, 6).map((item, idx) => (
                <div key={idx} className="flex flex-col items-center py-1">
                  <span className="text-[10px] text-slate-500 font-medium">{item.hour}</span>
                  <div className="w-full h-11 sm:h-12 bg-white rounded-md my-1 relative overflow-hidden flex items-end border border-slate-200">
                    <div
                      className={`w-full rounded-b-md transition-all ${
                        item.prob >= 50 ? 'bg-blue-600' : item.prob >= 25 ? 'bg-sky-500' : 'bg-slate-300'
                      }`}
                      style={{ height: `${Math.max(12, item.prob)}%` }}
                    ></div>
                  </div>
                  <span className="text-[10px] font-bold text-slate-800">{item.prob}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 7-Day Rainfall Outlook with Mobile Horizontal Scroll */}
      <div className="mt-4 pt-3 border-t border-slate-100">
        <div className="flex items-center gap-1 text-xs font-bold text-slate-800 mb-2">
          <Calendar className="w-3.5 h-3.5 text-blue-600" />
          <span>7-Day Rainfall Forecast (mm)</span>
        </div>
        <div className="overflow-x-auto scrollbar-none pb-1">
          <div className="grid grid-cols-7 gap-1 text-center min-w-[320px]">
            {weather.daily.time.slice(0, 7).map((d, i) => {
              const dayName = new Date(d).toLocaleDateString([], { weekday: 'narrow' });
              const rainMm = weather.daily.precipitationSum[i] ?? 0;
              return (
                <div key={i} className="bg-slate-50 rounded-lg p-1.5 border border-slate-200/70 text-[10px]">
                  <div className="text-slate-500 font-semibold">{dayName}</div>
                  <div className={`font-black mt-0.5 ${rainMm > 2 ? 'text-blue-700' : 'text-slate-800'}`}>
                    {rainMm.toFixed(1)}
                  </div>
                  <div className="text-[9px] text-slate-400">mm</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
