'use client';

import React, { useState, useEffect } from 'react';
import Navbar, { NavTabType } from '@/components/Navbar';
import MapWrapper from '@/components/Map/MapWrapper';
import WeatherWidget from '@/components/WeatherWidget';
import DamLevelWidget from '@/components/DamLevelWidget';
import GroundwaterWidget from '@/components/GroundwaterWidget';
import AgroSuitabilityWidget from '@/components/AgroSuitabilityWidget';
import IrrigationScheduleWidget from '@/components/IrrigationScheduleWidget';
import SoilMoistureWidget from '@/components/SoilMoistureWidget';
import DroughtAlertsWidget from '@/components/DroughtAlertsWidget';
import ComplaintModal from '@/components/Complaints/ComplaintModal';
import AdminDashboard from '@/components/Complaints/AdminDashboard';
import ChatbotDrawer from '@/components/Chatbot/ChatbotDrawer';

import { Dam, GroundwaterStation, LiveWeatherData, AgroSuitabilityResult, WaterComplaint } from '@/types';
import damsData from '@/data/dams.json';
import groundwaterData from '@/data/groundwater.json';
import initialComplaints from '@/data/complaints.json';
import {
  getNearestDams,
  getNearestGroundwaterStation,
  fetchLiveWeatherData,
  calculateAgroSuitability,
} from '@/lib/api';

import {
  MapPin,
  SlidersHorizontal,
  Droplets,
  Sprout,
  ShieldAlert,
  ArrowRight,
  CloudSun,
  Layers,
} from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState<NavTabType>('dashboard');
  const [isComplaintModalOpen, setIsComplaintModalOpen] = useState(false);

  // Selected Location (Default: Chennai / Tamil Nadu)
  const [selectedLocation, setSelectedLocation] = useState({
    name: 'Chennai & Red Hills Basin',
    lat: 13.0827,
    lng: 80.2707,
  });

  // Layer Visibility
  const [visibleLayers, setVisibleLayers] = useState({
    dams: true,
    groundwater: true,
    droughtZones: true,
  });

  // Data states
  const [weather, setWeather] = useState<LiveWeatherData | null>(null);
  const [weatherLoading, setWeatherLoading] = useState<boolean>(true);
  const [nearestDams, setNearestDams] = useState<Dam[]>([]);
  const [nearestStation, setNearestStation] = useState<GroundwaterStation | null>(null);
  const [suitability, setSuitability] = useState<AgroSuitabilityResult | null>(null);
  const [complaints, setComplaints] = useState<WaterComplaint[]>([]);

  // Load complaints from LocalStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('agri_water_complaints');
      if (stored) {
        setComplaints(JSON.parse(stored));
      } else {
        setComplaints(initialComplaints as WaterComplaint[]);
      }
    } catch {
      setComplaints(initialComplaints as WaterComplaint[]);
    }
  }, []);

  const handleUpdateComplaint = (updated: WaterComplaint) => {
    const nextList = complaints.map((c) => (c.id === updated.id ? updated : c));
    setComplaints(nextList);
    try {
      localStorage.setItem('agri_water_complaints', JSON.stringify(nextList));
    } catch (e) {
      console.warn('Storage error', e);
    }
  };

  const handleAddComplaint = (newTicket: WaterComplaint) => {
    const nextList = [newTicket, ...complaints];
    setComplaints(nextList);
    try {
      localStorage.setItem('agri_water_complaints', JSON.stringify(nextList));
    } catch (e) {
      console.warn('Storage error', e);
    }
  };

  // Re-compute nearest hydrological assets & live weather
  useEffect(() => {
    let isMounted = true;
    setWeatherLoading(true);

    const dams = getNearestDams(selectedLocation.lat, selectedLocation.lng, 5);
    const station = getNearestGroundwaterStation(selectedLocation.lat, selectedLocation.lng);
    setNearestDams(dams);
    setNearestStation(station);

    fetchLiveWeatherData(selectedLocation.lat, selectedLocation.lng)
      .then((data) => {
        if (!isMounted) return;
        setWeather(data);
        setWeatherLoading(false);
        const agro = calculateAgroSuitability(data, station, dams);
        setSuitability(agro);
      })
      .catch((err) => {
        console.error('Weather load error:', err);
        if (isMounted) setWeatherLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedLocation.lat, selectedLocation.lng]);

  const handleSelectLocation = (lat: number, lng: number, name?: string) => {
    setSelectedLocation({
      lat,
      lng,
      name: name || `Coordinates (${lat.toFixed(3)}, ${lng.toFixed(3)})`,
    });
  };

  const handleLocateOnMap = (lat: number, lng: number, name: string) => {
    setSelectedLocation({ lat, lng, name });
    setActiveTab('map');
  };

  const avgDamStorage = nearestDams.length > 0
    ? Math.round(nearestDams.reduce((acc, d) => acc + d.storagePercentage, 0) / nearestDams.length)
    : 65;

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenComplaintModal={() => setIsComplaintModalOpen(true)}
        onSelectPredefinedLocation={(loc) => setSelectedLocation(loc)}
        selectedLocationName={selectedLocation.name}
      />

      {/* Main Content Area - Optimized Padding for Mobile Thumb Navigation */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-5 lg:p-8 pb-24 sm:pb-20 lg:pb-8 space-y-4 sm:space-y-6">
        {/* Basin Location Header */}
        <div className="bg-white border border-blue-100 rounded-2xl p-3.5 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-3.5 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shadow-2xs shrink-0">
              <MapPin className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] sm:text-xs uppercase font-extrabold tracking-wider text-blue-700">
                  Target Hydrological Basin
                </span>
                <span className="text-[10px] sm:text-[11px] font-mono text-blue-900 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md font-bold">
                  {selectedLocation.lat.toFixed(4)}°N, {selectedLocation.lng.toFixed(4)}°E
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 mt-0.5 tracking-tight truncate max-w-[280px] sm:max-w-none">
                {selectedLocation.name}
              </h2>
            </div>
          </div>

          {/* Interactive Layer Checkboxes */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap text-xs">
            <span className="text-slate-600 font-bold flex items-center gap-1 mr-0.5 text-[11px] sm:text-xs">
              <SlidersHorizontal className="w-3.5 h-3.5 text-blue-600" /> Layers:
            </span>

            <label className="flex items-center gap-1.5 bg-blue-50/80 hover:bg-blue-100/70 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg border border-blue-200 cursor-pointer select-none transition text-[11px] sm:text-xs">
              <input
                type="checkbox"
                checked={visibleLayers.dams}
                onChange={(e) => setVisibleLayers((prev) => ({ ...prev, dams: e.target.checked }))}
                className="rounded accent-blue-600 cursor-pointer"
              />
              <span className="text-blue-900 font-bold">💧 Dams ({damsData.length})</span>
            </label>

            <label className="flex items-center gap-1.5 bg-emerald-50/80 hover:bg-emerald-100/70 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg border border-emerald-200 cursor-pointer select-none transition text-[11px] sm:text-xs">
              <input
                type="checkbox"
                checked={visibleLayers.groundwater}
                onChange={(e) =>
                  setVisibleLayers((prev) => ({ ...prev, groundwater: e.target.checked }))
                }
                className="rounded accent-emerald-600 cursor-pointer"
              />
              <span className="text-emerald-900 font-bold">
                📍 Wells ({groundwaterData.length})
              </span>
            </label>

            <label className="flex items-center gap-1.5 bg-rose-50/80 hover:bg-rose-100/70 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg border border-rose-200 cursor-pointer select-none transition text-[11px] sm:text-xs">
              <input
                type="checkbox"
                checked={visibleLayers.droughtZones}
                onChange={(e) =>
                  setVisibleLayers((prev) => ({ ...prev, droughtZones: e.target.checked }))
                }
                className="rounded accent-rose-600 cursor-pointer"
              />
              <span className="text-rose-900 font-bold">⚠️ Drought Zones</span>
            </label>
          </div>
        </div>

        {/* ======================================================== */}
        {/* PAGE 1: EXECUTIVE DASHBOARD OVERVIEW                     */}
        {/* ======================================================== */}
        {activeTab === 'dashboard' && (
          <div className="space-y-4 sm:space-y-6">
            {/* 4 Summary KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
              {/* Catchment Dam Storage */}
              <div
                onClick={() => setActiveTab('map')}
                className="bg-white border border-blue-100 hover:border-blue-300 rounded-xl sm:rounded-2xl p-3.5 sm:p-5 shadow-xs hover:shadow-md transition cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider truncate">
                    Catchment Dams
                  </span>
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <Droplets className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </div>
                </div>
                <div className="mt-1.5 sm:mt-2 flex items-baseline gap-1.5 sm:gap-2">
                  <span className="text-2xl sm:text-3xl font-black text-blue-950">{avgDamStorage}%</span>
                  <span className="text-[10px] sm:text-xs text-blue-700 font-bold">Capacity</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1 font-medium truncate">
                  {nearestDams[0]?.name || 'Local Dam'} ({nearestDams[0]?.storagePercentage || 65}%)
                </p>
                <div className="mt-2.5 sm:mt-3 flex items-center gap-1 text-[11px] sm:text-xs text-blue-600 font-bold group-hover:translate-x-1 transition">
                  <span>Explore Dams</span> <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                </div>
              </div>

              {/* Underground Water Table */}
              <div
                onClick={() => setActiveTab('groundwater')}
                className="bg-white border border-blue-100 hover:border-blue-300 rounded-xl sm:rounded-2xl p-3.5 sm:p-5 shadow-xs hover:shadow-md transition cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider truncate">
                    Water Table
                  </span>
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <Layers className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </div>
                </div>
                <div className="mt-1.5 sm:mt-2 flex items-baseline gap-1.5 sm:gap-2">
                  <span className="text-2xl sm:text-3xl font-black text-slate-900">
                    {nearestStation?.depthMetersBGL || 6.8}m
                  </span>
                  <span className="text-[10px] sm:text-xs text-slate-500 font-medium">bgl</span>
                </div>
                <p className="text-[11px] text-emerald-700 font-bold mt-1 truncate">
                  {nearestStation?.status || 'Safe'} Aquifer
                </p>
                <div className="mt-2.5 sm:mt-3 flex items-center gap-1 text-[11px] sm:text-xs text-blue-600 font-bold group-hover:translate-x-1 transition">
                  <span>View Aquifers</span> <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                </div>
              </div>

              {/* Weather & Rain Probability */}
              <div
                onClick={() => setActiveTab('weather')}
                className="bg-white border border-blue-100 hover:border-blue-300 rounded-xl sm:rounded-2xl p-3.5 sm:p-5 shadow-xs hover:shadow-md transition cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider truncate">
                    Live Weather
                  </span>
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                    <CloudSun className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </div>
                </div>
                <div className="mt-1.5 sm:mt-2 flex items-baseline gap-1.5 sm:gap-2">
                  <span className="text-2xl sm:text-3xl font-black text-slate-900">
                    {weather?.temperature || 31}°C
                  </span>
                  <span className="text-[10px] sm:text-xs text-blue-700 font-bold">
                    {weather?.daily?.precipitationProbMax[0] || 15}% Rain
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1 font-medium truncate">
                  {weather?.humidity || 65}% Humidity
                </p>
                <div className="mt-2.5 sm:mt-3 flex items-center gap-1 text-[11px] sm:text-xs text-blue-600 font-bold group-hover:translate-x-1 transition">
                  <span>Rain Forecast</span> <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                </div>
              </div>

              {/* Agro Suitability Index */}
              <div
                onClick={() => setActiveTab('agriculture')}
                className="bg-white border border-blue-100 hover:border-blue-300 rounded-xl sm:rounded-2xl p-3.5 sm:p-5 shadow-xs hover:shadow-md transition cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider truncate">
                    Agro-Suitability
                  </span>
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <Sprout className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </div>
                </div>
                <div className="mt-1.5 sm:mt-2 flex items-baseline gap-1.5 sm:gap-2">
                  <span className="text-2xl sm:text-3xl font-black text-blue-950">
                    {suitability?.score || 72}
                  </span>
                  <span className="text-[10px] sm:text-xs text-slate-500 font-bold">/ 100</span>
                </div>
                <p className="text-[11px] text-blue-800 font-bold mt-1 truncate">
                  {suitability?.rating || 'Moderately Suitable'}
                </p>
                <div className="mt-2.5 sm:mt-3 flex items-center gap-1 text-[11px] sm:text-xs text-blue-600 font-bold group-hover:translate-x-1 transition">
                  <span>Irrigation Plan</span> <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                </div>
              </div>
            </div>

            {/* Dashboard Map Preview & Fast Highlights */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
              <div className="lg:col-span-8 h-[360px] sm:h-[480px]">
                <MapWrapper
                  selectedLocation={selectedLocation}
                  onSelectLocation={handleSelectLocation}
                  dams={damsData as Dam[]}
                  groundwaterStations={groundwaterData as GroundwaterStation[]}
                  visibleLayers={visibleLayers}
                  onSelectDam={(dam) => handleSelectLocation(dam.lat, dam.lng, dam.name)}
                  onSelectStation={(station) =>
                    handleSelectLocation(station.lat, station.lng, station.stationName)
                  }
                  heightClass="min-h-[360px] sm:min-h-[480px]"
                />
              </div>

              {/* Dashboard Side Highlights */}
              <div className="lg:col-span-4 flex flex-col justify-between space-y-4">
                <DamLevelWidget
                  nearestDams={nearestDams.slice(0, 3)}
                  onSelectDam={(dam) => handleSelectLocation(dam.lat, dam.lng, dam.name)}
                  locationName={selectedLocation.name}
                />
              </div>
            </div>

            {/* Direct Gateway Cards to Detailed Pages */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 pt-1 sm:pt-2">
              <div
                onClick={() => setActiveTab('weather')}
                className="bg-white border border-blue-100 p-4 sm:p-5 rounded-xl sm:rounded-2xl shadow-xs hover:shadow-md transition cursor-pointer flex items-start gap-3 sm:gap-3.5"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <CloudSun className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900">24-Hour Rain Forecast</h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Inspect hourly precipitation probability and 7-day extended rainfall accumulation.
                  </p>
                  <span className="text-xs font-bold text-blue-600 mt-2 inline-flex items-center gap-1">
                    Open Weather Page <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>

              <div
                onClick={() => setActiveTab('agriculture')}
                className="bg-white border border-blue-100 p-4 sm:p-5 rounded-xl sm:rounded-2xl shadow-xs hover:shadow-md transition cursor-pointer flex items-start gap-3 sm:gap-3.5"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <Sprout className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900">Agro-Suitability & Irrigation</h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Calculate crop viability, rain-skip water savings, and precision drip schedules.
                  </p>
                  <span className="text-xs font-bold text-blue-600 mt-2 inline-flex items-center gap-1">
                    Open Agro Planner <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>

              <div
                onClick={() => setActiveTab('drought')}
                className="bg-white border border-blue-100 p-4 sm:p-5 rounded-xl sm:rounded-2xl shadow-xs hover:shadow-md transition cursor-pointer flex items-start gap-3 sm:gap-3.5"
              >
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900">Drought Relief Alerts</h4>
                  <p className="text-xs text-slate-500 mt-1">
                    View active district stress warnings, rainfall deficit rates, and government schemes.
                  </p>
                  <span className="text-xs font-bold text-blue-600 mt-2 inline-flex items-center gap-1">
                    Open Drought Bulletins <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* PAGE 2: DEDICATED LIVE MAP & DAMS EXPLORER               */}
        {/* ======================================================== */}
        {activeTab === 'map' && (
          <div className="space-y-4 sm:space-y-6">
            <div className="h-[60vh] sm:h-[72vh] min-h-[380px] w-full shadow-xs rounded-2xl overflow-hidden border border-blue-100">
              <MapWrapper
                selectedLocation={selectedLocation}
                onSelectLocation={handleSelectLocation}
                dams={damsData as Dam[]}
                groundwaterStations={groundwaterData as GroundwaterStation[]}
                visibleLayers={visibleLayers}
                onSelectDam={(dam) => handleSelectLocation(dam.lat, dam.lng, dam.name)}
                onSelectStation={(station) =>
                  handleSelectLocation(station.lat, station.lng, station.stationName)
                }
                heightClass="h-full"
              />
            </div>

            {/* Dedicated Dam Calculator List */}
            <div>
              <DamLevelWidget
                nearestDams={nearestDams}
                onSelectDam={(dam) => handleSelectLocation(dam.lat, dam.lng, dam.name)}
                locationName={selectedLocation.name}
              />
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* PAGE 3: DEDICATED WEATHER & RAIN PREDICTION              */}
        {/* ======================================================== */}
        {activeTab === 'weather' && (
          <div className="space-y-6">
            <div className="max-w-4xl mx-auto">
              <WeatherWidget
                weather={weather}
                locationName={selectedLocation.name}
                loading={weatherLoading}
              />
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* PAGE 4: DEDICATED GROUNDWATER & SOIL MOISTURE            */}
        {/* ======================================================== */}
        {activeTab === 'groundwater' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <GroundwaterWidget
              station={nearestStation}
              locationName={selectedLocation.name}
            />
            <SoilMoistureWidget
              weather={weather}
              locationName={selectedLocation.name}
            />
          </div>
        )}

        {/* ======================================================== */}
        {/* PAGE 5: DEDICATED AGRO SUITABILITY & IRRIGATION PLANNER  */}
        {/* ======================================================== */}
        {activeTab === 'agriculture' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <AgroSuitabilityWidget
              suitability={suitability}
              locationName={selectedLocation.name}
            />
            <IrrigationScheduleWidget
              weather={weather}
              locationName={selectedLocation.name}
            />
          </div>
        )}

        {/* ======================================================== */}
        {/* PAGE 6: DEDICATED DROUGHT RELIEF BULLETINS               */}
        {/* ======================================================== */}
        {activeTab === 'drought' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
            <div className="lg:col-span-7">
              <DroughtAlertsWidget
                onSelectDistrict={(dist) => {
                  const match = groundwaterData.find((g) => g.district.toLowerCase() === dist.toLowerCase());
                  if (match) {
                    handleSelectLocation(match.lat, match.lng, `${dist} Drought Zone`);
                  }
                }}
              />
            </div>
            <div className="lg:col-span-5">
              <GroundwaterWidget
                station={nearestStation}
                locationName={selectedLocation.name}
              />
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* PAGE 7: DEDICATED GRIEVANCE COMMAND CENTER & ADMIN       */}
        {/* ======================================================== */}
        {activeTab === 'admin' && (
          <AdminDashboard
            complaints={complaints}
            onUpdateComplaint={handleUpdateComplaint}
            onLocateOnMap={handleLocateOnMap}
          />
        )}
      </main>

      {/* Floating Chatbot Assistant */}
      <ChatbotDrawer
        currentLocationName={selectedLocation.name}
        weather={weather}
        suitability={suitability}
        nearestDams={nearestDams}
      />

      {/* Grievance Ticket Submission Modal */}
      <ComplaintModal
        isOpen={isComplaintModalOpen}
        onClose={() => setIsComplaintModalOpen(false)}
        onSubmit={handleAddComplaint}
        currentLocation={selectedLocation}
      />

      {/* Footer */}
      <footer className="border-t border-blue-100 bg-white py-6 text-center text-xs text-slate-500 mt-8 sm:mt-12">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-blue-950">NEER-AI</span>
            <span>•</span>
            <span>Smart Water & Agro-Intelligence Platform</span>
          </div>
          <div className="flex items-center gap-3 text-slate-500 font-medium text-[11px] sm:text-xs">
            <span>760 NWIC Dam Reservoirs</span>
            <span>•</span>
            <span>Open-Meteo Free API</span>
            <span>•</span>
            <span>Leaflet + OSM</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
