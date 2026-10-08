'use client';

import React, { useState, useEffect } from 'react';
import {
  Droplets,
  Map,
  Clock,
  ShieldAlert,
  PlusCircle,
  MapPin,
  Layers,
  Sprout,
  BarChart3,
  CloudSun,
  Waves,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react';

export type NavTabType =
  | 'dashboard'
  | 'map'
  | 'weather'
  | 'groundwater'
  | 'agriculture'
  | 'drought'
  | 'admin';

interface NavbarProps {
  activeTab: NavTabType;
  setActiveTab: (tab: NavTabType) => void;
  onOpenComplaintModal: () => void;
  onSelectPredefinedLocation: (loc: { name: string; lat: number; lng: number }) => void;
  selectedLocationName: string;
}

export const REGIONS = [
  { name: 'Chennai & Red Hills Basin', lat: 13.0827, lng: 80.2707 },
  { name: 'Thanjavur & Cauvery Delta', lat: 10.7870, lng: 79.1378 },
  { name: 'Coimbatore & Bhavani Basin', lat: 11.0168, lng: 76.9558 },
  { name: 'Salem & Mettur Stanley Dam', lat: 11.6643, lng: 78.1460 },
  { name: 'Madurai & Vaigai Catchment', lat: 9.9252, lng: 78.1198 },
  { name: 'Tirunelveli & Manimuthar', lat: 8.7139, lng: 77.7567 },
  { name: 'Dharmapuri Rainshadow', lat: 12.1211, lng: 78.1582 },
  { name: 'Palakkad Gap (KL/TN)', lat: 10.7867, lng: 76.6548 },
];

export default function Navbar({
  activeTab,
  setActiveTab,
  onOpenComplaintModal,
  onSelectPredefinedLocation,
  selectedLocationName,
}: NavbarProps) {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  const navItems: { id: NavTabType; label: string; icon: React.ElementType; badge?: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'map', label: 'Live Map & Dams', icon: Map, badge: '760 Dams' },
    { id: 'weather', label: 'Weather & Rain', icon: CloudSun, badge: '24h Rain' },
    { id: 'groundwater', label: 'Groundwater & Soil', icon: Layers },
    { id: 'agriculture', label: 'Agro & Irrigation', icon: Sprout },
    { id: 'drought', label: 'Drought Alerts', icon: ShieldAlert },
    { id: 'admin', label: 'Grievance Portal', icon: Waves },
  ];

  const handleSelectTab = (tab: NavTabType) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-blue-100 shadow-xs text-slate-800 transition">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-2 sm:gap-4">
          {/* Brand & Mobile Hamburger */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Hamburger Button for Mobile */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-blue-700 hover:bg-blue-50 border border-slate-200 transition focus:outline-none"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-blue-700" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Logo */}
            <div
              onClick={() => handleSelectTab('dashboard')}
              className="flex items-center gap-2.5 cursor-pointer select-none"
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-sky-500 to-cyan-400 flex items-center justify-center shadow-md shadow-blue-500/20 text-white shrink-0">
                <Droplets className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-base sm:text-lg font-black tracking-tight text-blue-950">
                    NEER<span className="text-blue-600">-AI</span>
                  </span>
                  <span className="hidden sm:inline-flex text-[10px] bg-blue-50 text-blue-700 border border-blue-200 px-1.5 py-0.5 rounded-full font-bold items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></span>
                    LIVE
                  </span>
                </div>
                <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium hidden xs:block truncate max-w-[170px] sm:max-w-none">
                  Smart Water & Agro-Intelligence
                </p>
              </div>
            </div>

            {/* Desktop Region Switcher Dropdown */}
            <div className="hidden xl:flex items-center ml-2 pl-3 border-l border-slate-200">
              <MapPin className="w-3.5 h-3.5 text-blue-600 mr-1.5 shrink-0" />
              <select
                value={selectedLocationName}
                onChange={(e) => {
                  const found = REGIONS.find((r) => r.name === e.target.value);
                  if (found) onSelectPredefinedLocation(found);
                }}
                className="bg-blue-50/70 border border-blue-200 hover:border-blue-300 rounded-lg px-2.5 py-1 text-xs text-blue-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 transition cursor-pointer"
              >
                {REGIONS.map((r) => (
                  <option key={r.name} value={r.name}>
                    📍 {r.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden lg:flex items-center gap-1 overflow-x-auto scrollbar-none">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectTab(item.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                      : 'text-slate-600 hover:text-blue-700 hover:bg-blue-50'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Action Buttons on Right */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Live Clock on desktop / tablet */}
            {currentTime && (
              <div className="hidden md:flex items-center gap-1.5 font-mono text-xs text-blue-900 bg-blue-50/80 px-2.5 py-1 rounded-lg border border-blue-200 font-semibold">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                <span>{currentTime}</span>
              </div>
            )}

            {/* Raise Grievance Button */}
            <button
              onClick={onOpenComplaintModal}
              className="px-3 sm:px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-md shadow-blue-600/25 transition whitespace-nowrap cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Raise Grievance</span>
              <span className="xs:hidden">Report</span>
            </button>
          </div>
        </div>

        {/* Mobile Slide-down Navigation Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-blue-100 bg-white/98 px-4 py-4 space-y-3 shadow-lg animate-in slide-in-from-top-3 duration-200">
            {/* Mobile Region Switcher */}
            <div className="bg-blue-50/80 p-3 rounded-xl border border-blue-200">
              <label className="text-[11px] font-bold text-blue-900 block mb-1.5 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-blue-600" /> Target Hydrological Basin:
              </label>
              <select
                value={selectedLocationName}
                onChange={(e) => {
                  const found = REGIONS.find((r) => r.name === e.target.value);
                  if (found) {
                    onSelectPredefinedLocation(found);
                    setMobileMenuOpen(false);
                  }
                }}
                className="w-full bg-white border border-blue-300 rounded-lg px-3 py-2 text-xs text-blue-950 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {REGIONS.map((r) => (
                  <option key={r.name} value={r.name}>
                    📍 {r.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Mobile Navigation Links */}
            <div className="grid grid-cols-1 gap-1.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectTab(item.id)}
                    className={`w-full p-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition cursor-pointer ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-700 hover:bg-blue-50 hover:text-blue-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Mobile Footer Meta */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                {currentTime || 'IST'}
              </span>
              <span className="font-semibold text-blue-700">South India Hydrology</span>
            </div>
          </div>
        )}
      </header>

      {/* Mobile Sticky Quick Navigation Bar at Bottom for Thumb Reach */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-blue-100 py-1.5 px-3 flex items-center justify-around shadow-lg">
        <button
          onClick={() => handleSelectTab('dashboard')}
          className={`flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-bold transition ${
            activeTab === 'dashboard' ? 'text-blue-600' : 'text-slate-500'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Home</span>
        </button>

        <button
          onClick={() => handleSelectTab('map')}
          className={`flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-bold transition ${
            activeTab === 'map' ? 'text-blue-600' : 'text-slate-500'
          }`}
        >
          <Map className="w-4 h-4" />
          <span>Map</span>
        </button>

        <button
          onClick={() => handleSelectTab('weather')}
          className={`flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-bold transition ${
            activeTab === 'weather' ? 'text-blue-600' : 'text-slate-500'
          }`}
        >
          <CloudSun className="w-4 h-4" />
          <span>Rain</span>
        </button>

        <button
          onClick={() => handleSelectTab('agriculture')}
          className={`flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-bold transition ${
            activeTab === 'agriculture' ? 'text-blue-600' : 'text-slate-500'
          }`}
        >
          <Sprout className="w-4 h-4" />
          <span>Agro</span>
        </button>

        <button
          onClick={() => handleSelectTab('admin')}
          className={`flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-bold transition ${
            activeTab === 'admin' ? 'text-blue-600' : 'text-slate-500'
          }`}
        >
          <Waves className="w-4 h-4" />
          <span>Grievance</span>
        </button>
      </div>
    </>
  );
}
