'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
import SearchBar from '@/components/SearchBar';
import AreaPredictionsPage from '@/components/AreaPredictionsPage';
import { generateHydrologicalPDF } from '@/lib/pdfGenerator';

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
  Navigation,
  FileDown,
  Loader2,
  Sparkles,
} from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState<NavTabType>('dashboard');
  const [isComplaintModalOpen, setIsComplaintModalOpen] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [gpsNotification, setGpsNotification] = useState<string | null>(null);
  const [isDownloadingPDF, setIsDownloadingPDF] = useState(false);

  // Selected Location (Default: Chennai / Tamil Nadu or GPS)
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

  // 1. AUTO-DETECT USER REAL-TIME LOCATION AT FIRST LOADING
  const detectUserLocation = useCallback(() => {
    if (typeof window === 'undefined' || !('geolocation' in navigator)) {
      return;
    }
    setIsLocating(true);
    setGpsNotification('Detecting your GPS location...');

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = Number(pos.coords.latitude.toFixed(4));
        const lng = Number(pos.coords.longitude.toFixed(4));
        setIsLocating(false);

        // Reverse geocode with OpenStreetMap Nominatim
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
            { headers: { 'Accept-Language': 'en' } }
          );
          if (res.ok) {
            const data = await res.json();
            const place =
              data.address?.city ||
              data.address?.town ||
              data.address?.village ||
              data.address?.suburb ||
              data.address?.county ||
              data.display_name?.split(',')[0] ||
              'My Location';
            setSelectedLocation({ lat, lng, name: `📍 ${place} (Current GPS)` });
            setGpsNotification(`Located at ${place}! Telemetry updated.`);
            setTimeout(() => setGpsNotification(null), 4000);
            return;
          }
        } catch {
          // Fallback
        }

        setSelectedLocation({ lat, lng, name: `📍 My GPS Location (${lat}, ${lng})` });
        setGpsNotification(`GPS Lock acquired (${lat}, ${lng}).`);
        setTimeout(() => setGpsNotification(null), 4000);
      },
      (err) => {
        setIsLocating(false);
        setGpsNotification(null);
        console.info('GPS permission prompt dismissed or unavailable:', err.message);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }, []);

  // Trigger on initial mount
  useEffect(() => {
    detectUserLocation();
  }, [detectUserLocation]);

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

  // PDF DOWNLOAD HANDLER
  const handleDownloadPDF = () => {
    try {
      setIsDownloadingPDF(true);
      generateHydrologicalPDF({
        location: selectedLocation,
        weather,
        dams: nearestDams,
        groundwaterStation: nearestStation,
        suitability,
        complaints,
      });
    } catch (err) {
      console.error('Error generating PDF:', err);
      alert('Could not generate PDF. Please try again.');
    } finally {
      setIsDownloadingPDF(false);
    }
  };

  const avgDamStorage = nearestDams.length > 0
    ? Math.round(nearestDams.reduce((acc, d) => acc + d.storagePercentage, 0) / nearestDams.length)
    : 65;

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Top Navbar with Download PDF and Mobile Menu */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenComplaintModal={() => setIsComplaintModalOpen(true)}
        onSelectPredefinedLocation={(loc) => setSelectedLocation(loc)}
        selectedLocationName={selectedLocation.name}
        onDownloadPDF={handleDownloadPDF}
        isDownloadingPDF={isDownloadingPDF}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-5 lg:p-8 pb-24 sm:pb-20 lg:pb-8 space-y-4 sm:space-y-6">
        {/* GPS Notification Toast if Active */}
        {gpsNotification && (
          <div className="bg-blue-600 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between shadow-md shadow-blue-500/20 animate-in fade-in slide-in-from-top-2 duration-200">
            <span className="flex items-center gap-2">
              <Navigation className="w-4 h-4 text-sky-200 animate-pulse" />
              {gpsNotification}
            </span>
            <button
              onClick={() => setGpsNotification(null)}
              className="text-white/80 hover:text-white font-normal text-xs"
            >
              ✕
            </button>
          </div>
        )}

        {/* Global Universal Search Bar Header with PDF Download & Layer Toggles */}
        <section className="bg-white border border-blue-100 rounded-2xl p-3.5 sm:p-5 shadow-xs space-y-3.5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] sm:text-xs uppercase font-black tracking-wider text-blue-700">
                  Target Basin &amp; Location
                </span>
                <span className="text-[10px] sm:text-[11px] font-mono text-blue-900 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md font-bold">
                  {selectedLocation.lat.toFixed(4)}°N, {selectedLocation.lng.toFixed(4)}°E
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 mt-0.5 tracking-tight flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
                <span className="truncate max-w-[280px] sm:max-w-none">{selectedLocation.name}</span>
              </h2>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Dedicated Area Predictions & Recommendations Shortcut */}
              <button
                onClick={() => setActiveTab('predictions')}
                title="View in-depth AI predictions, inflow models & recommendations for this area"
                className={`px-3 py-1.5 rounded-lg text-xs font-black flex items-center gap-1.5 transition cursor-pointer shadow-xs ${
                  activeTab === 'predictions'
                    ? 'bg-blue-600 text-white shadow-blue-500/20'
                    : 'bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span className="hidden sm:inline">Area Predictions &amp; Advisory</span>
                <span className="sm:hidden">AI Advisory</span>
              </button>

              {/* Export PDF Button inside header */}
              <button
                onClick={handleDownloadPDF}
                disabled={isDownloadingPDF}
                title="Download Comprehensive Basin Assessment as PDF"
                className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
              >
                {isDownloadingPDF ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                ) : (
                  <FileDown className="w-3.5 h-3.5 text-emerald-600" />
                )}
                <span>Download Report (PDF)</span>
              </button>

              {/* Interactive Layer Checkboxes */}
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap text-xs">
                <label className="flex items-center gap-1.5 bg-blue-50/80 hover:bg-blue-100/70 px-2.5 py-1.5 rounded-lg border border-blue-200 cursor-pointer select-none transition text-[11px] sm:text-xs font-bold text-blue-900">
                  <input
                    type="checkbox"
                    checked={visibleLayers.dams}
                    onChange={(e) => setVisibleLayers((prev) => ({ ...prev, dams: e.target.checked }))}
                    className="rounded accent-blue-600 cursor-pointer"
                  />
                  <span>💧 Dams ({damsData.length})</span>
                </label>

                <label className="flex items-center gap-1.5 bg-emerald-50/80 hover:bg-emerald-100/70 px-2.5 py-1.5 rounded-lg border border-emerald-200 cursor-pointer select-none transition text-[11px] sm:text-xs font-bold text-emerald-900">
                  <input
                    type="checkbox"
                    checked={visibleLayers.groundwater}
                    onChange={(e) =>
                      setVisibleLayers((prev) => ({ ...prev, groundwater: e.target.checked }))
                    }
                    className="rounded accent-emerald-600 cursor-pointer"
                  />
                  <span>📍 Wells ({groundwaterData.length})</span>
                </label>

                <label className="flex items-center gap-1.5 bg-rose-50/80 hover:bg-rose-100/70 px-2.5 py-1.5 rounded-lg border border-rose-200 cursor-pointer select-none transition text-[11px] sm:text-xs font-bold text-rose-900">
                  <input
                    type="checkbox"
                    checked={visibleLayers.droughtZones}
                    onChange={(e) =>
                      setVisibleLayers((prev) => ({ ...prev, droughtZones: e.target.checked }))
                    }
                    className="rounded accent-rose-600 cursor-pointer"
                  />
                  <span>⚠️ Drought</span>
                </label>
              </div>
            </div>
          </div>

          {/* Universal Search Bar with Live Autosuggest & GPS Detector */}
          <SearchBar
            onSelectResult={handleSelectLocation}
            onDetectLocation={detectUserLocation}
            isLocating={isLocating}
            placeholder="Search any dam (Mettur, Vaigai...), district (Salem, Erode...), or area to focus..."
          />
        </section>

        {/* ======================================================== */}
        {/* PAGE 1: EXECUTIVE DASHBOARD OVERVIEW                     */}
        {/* ======================================================== */}
        {activeTab === 'dashboard' && (
          <div className="space-y-4 sm:space-y-6">
            {/* Direct Gateway to Dedicated Area Predictions & Recommendations Page */}
            <div
              onClick={() => setActiveTab('predictions')}
              className="bg-gradient-to-r from-blue-700 via-blue-600 to-sky-600 rounded-2xl p-4 sm:p-5 text-white shadow-md shadow-blue-600/15 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 cursor-pointer group hover:opacity-95 transition"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 text-white mt-0.5">
                  <Sparkles className="w-5 h-5 text-amber-300" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full border border-white/20">
                      Dedicated Area Intelligence
                    </span>
                    <span className="text-xs text-sky-100 font-bold">📍 {selectedLocation.name}</span>
                  </div>
                  <h3 className="text-sm sm:text-base font-black tracking-tight mt-1 text-white">
                    Area Predictions, Inflow Models &amp; Precision Recommendations
                  </h3>
                  <p className="text-xs text-sky-100 mt-0.5 max-w-xl">
                    Access scientific 7-day rainfall projections, 3-depth soil moisture trajectories, reservoir runoff models, and customized crop &amp; irrigation schedules for this area.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 bg-white text-blue-900 font-black text-xs px-3.5 py-2 rounded-xl shrink-0 group-hover:scale-105 transition shadow-xs self-start sm:self-auto">
                <span>Open Area Advisory</span>
                <ArrowRight className="w-3.5 h-3.5 text-blue-700" />
              </div>
            </div>

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
                  <span>View Aquifers</span> <ArrowRight className="w-3.5 h-3.5" />
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
                  <span>Rain Forecast</span> <ArrowRight className="w-3.5 h-3.5" />
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
                  <span>Irrigation Plan</span> <ArrowRight className="w-3.5 h-3.5" />
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

              {/* Dashboard Side Highlights with built-in search */}
              <div className="lg:col-span-4 flex flex-col justify-between space-y-4">
                <DamLevelWidget
                  nearestDams={nearestDams.slice(0, 5)}
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
                  <h4 className="font-bold text-sm text-slate-900">Agro-Suitability &amp; Irrigation</h4>
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
        {/* DEDICATED PAGE: PREDICTIONS & RECOMMENDATIONS FOR AREA   */}
        {/* ======================================================== */}
        {activeTab === 'predictions' && (
          <AreaPredictionsPage
            selectedLocation={selectedLocation}
            weather={weather}
            nearestDams={nearestDams}
            nearestStation={nearestStation}
            suitability={suitability}
            onSelectLocation={handleSelectLocation}
            onDownloadPDF={handleDownloadPDF}
            isDownloadingPDF={isDownloadingPDF}
            onNavigateToMap={() => setActiveTab('map')}
          />
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

            {/* Dedicated Dam Calculator List with Search & Capacity Filters */}
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
            <div className="max-w-4xl mx-auto space-y-4">
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
              onSelectStation={(st) => handleSelectLocation(st.lat, st.lng, st.stationName)}
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
                onSelectStation={(st) => handleSelectLocation(st.lat, st.lng, st.stationName)}
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
            <span>Smart Water &amp; Agro-Intelligence Platform</span>
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
