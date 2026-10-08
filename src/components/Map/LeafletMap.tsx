'use client';

import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Dam, GroundwaterStation } from '@/types';
import { Droplet, Compass, AlertTriangle, Layers, MapPin } from 'lucide-react';

interface LeafletMapProps {
  selectedLocation: { lat: number; lng: number; name?: string };
  onSelectLocation: (lat: number, lng: number, name?: string) => void;
  dams: Dam[];
  groundwaterStations: GroundwaterStation[];
  visibleLayers: {
    dams: boolean;
    groundwater: boolean;
    droughtZones: boolean;
  };
  onSelectDam?: (dam: Dam) => void;
  onSelectStation?: (station: GroundwaterStation) => void;
  heightClass?: string;
}

// Custom DivIcons without any transform overwriting
function createDamIcon(storagePercentage: number) {
  const color = storagePercentage >= 75 ? '#0284c7' : storagePercentage >= 40 ? '#0ea5e9' : '#d97706';
  return L.divIcon({
    className: 'custom-dam-marker-wrapper',
    html: `
      <div class="dam-marker-inner" style="
        background: ${color};
        color: white;
        border-radius: 9999px;
        padding: 3px 7px;
        font-size: 10px;
        font-weight: 800;
        box-shadow: 0 4px 8px rgba(2, 132, 199, 0.35);
        border: 2px solid #ffffff;
        display: flex;
        align-items: center;
        gap: 3px;
        white-space: nowrap;
        cursor: pointer;
      ">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="2">
          <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path>
        </svg>
        <span>${storagePercentage}%</span>
      </div>
    `,
    iconSize: [44, 22],
    iconAnchor: [22, 11],
  });
}

function createGroundwaterIcon(status: string, depth: number) {
  const color =
    status === 'Safe' ? '#10b981' :
    status === 'Semi-Critical' ? '#f59e0b' :
    status === 'Critical' ? '#f97316' : '#ef4444';
  
  return L.divIcon({
    className: 'custom-gw-marker-wrapper',
    html: `
      <div class="gw-marker-inner" style="
        background: ${color};
        color: white;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 11px;
        font-weight: 800;
        border: 2px solid #ffffff;
        box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        cursor: pointer;
      " title="${status}: ${depth}m bgl">
        W
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
}

function createSelectedIcon() {
  return L.divIcon({
    className: 'custom-selected-marker-wrapper',
    html: `
      <div style="position: relative; width: 22px; height: 22px;">
        <div style="
          position: absolute;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: rgba(37, 99, 235, 0.25);
          animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
          top: -7px;
          left: -7px;
          pointer-events: none;
        "></div>
        <div style="
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: #2563eb;
          border: 3px solid #ffffff;
          box-shadow: 0 0 14px rgba(37, 99, 235, 0.7);
        "></div>
      </div>
    `,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  });
}

function MapRecenter({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  const prevRef = useRef({ lat, lng });

  useEffect(() => {
    if (prevRef.current.lat !== lat || prevRef.current.lng !== lng) {
      prevRef.current = { lat, lng };
      map.panTo([lat, lng], { animate: true, duration: 0.8 });
    }
  }, [lat, lng, map]);

  return null;
}

function MapClickEvents({ onSelectLocation }: { onSelectLocation: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onSelectLocation(Number(e.latlng.lat.toFixed(4)), Number(e.latlng.lng.toFixed(4)));
    },
  });
  return null;
}

export default function LeafletMap({
  selectedLocation,
  onSelectLocation,
  dams,
  groundwaterStations,
  visibleLayers,
  onSelectDam,
  onSelectStation,
  heightClass = 'min-h-[520px]',
}: LeafletMapProps) {
  const droughtZones = [
    { name: 'Dharmapuri & Krishnagiri Rainshadow Zone', lat: 12.1211, lng: 78.1582, radius: 45000, color: '#ef4444', level: 'Severe Drought' },
    { name: 'Vellore & Ranipet Sub-basin Stress', lat: 12.9165, lng: 79.1325, radius: 40000, color: '#f97316', level: 'Moderate Drought' },
    { name: 'Ramanathapuram Coastal Saline Stress', lat: 9.3639, lng: 78.8395, radius: 38000, color: '#f59e0b', level: 'Moderate Drought' },
  ];

  return (
    <div className={`relative w-full h-full ${heightClass} rounded-2xl overflow-hidden shadow-sm border border-blue-100 bg-white`}>
      <MapContainer
        center={[selectedLocation.lat, selectedLocation.lng]}
        zoom={8}
        scrollWheelZoom={true}
        className="w-full h-full z-0"
        style={{ height: '100%', minHeight: '520px', background: '#e0f2fe' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={18}
        />

        <MapRecenter lat={selectedLocation.lat} lng={selectedLocation.lng} />
        <MapClickEvents onSelectLocation={onSelectLocation} />

        {/* Selected target pin */}
        <Marker position={[selectedLocation.lat, selectedLocation.lng]} icon={createSelectedIcon()}>
          <Popup className="agro-popup">
            <div className="p-2 text-slate-800">
              <div className="font-bold text-sm text-blue-700 flex items-center gap-1">
                <Compass className="w-4 h-4" /> Focused Coordinates
              </div>
              <p className="text-xs text-slate-600 mt-1">
                {selectedLocation.name || 'User Selected Location'}
              </p>
              <div className="mt-1 font-mono text-[11px] bg-blue-50 border border-blue-200 p-1 rounded text-blue-900 font-bold">
                Lat: {selectedLocation.lat.toFixed(4)}, Lng: {selectedLocation.lng.toFixed(4)}
              </div>
              <div className="mt-2 text-[11px] text-emerald-700 font-bold">
                ✓ NEER-AI Telemetry Active
              </div>
            </div>
          </Popup>
        </Marker>

        {/* Drought Alert Zones */}
        {visibleLayers.droughtZones &&
          droughtZones.map((zone, idx) => (
            <Circle
              key={`zone-${idx}`}
              center={[zone.lat, zone.lng]}
              radius={zone.radius}
              pathOptions={{
                color: zone.color,
                fillColor: zone.color,
                fillOpacity: 0.16,
                weight: 1.5,
                dashArray: '5, 5',
              }}
            >
              <Popup>
                <div className="p-2 text-slate-800">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-rose-600">
                    <AlertTriangle className="w-4 h-4" /> {zone.level}
                  </div>
                  <div className="text-xs font-bold text-slate-900 mt-1">{zone.name}</div>
                  <p className="text-[11px] text-slate-600 mt-1">
                    Aquifer depletion alert. Drip subsidies and tanker deployment priority active.
                  </p>
                </div>
              </Popup>
            </Circle>
          ))}

        {/* Dams Layer */}
        {visibleLayers.dams &&
          dams.map((dam) => (
            <Marker
              key={dam.id}
              position={[dam.lat, dam.lng]}
              icon={createDamIcon(dam.storagePercentage)}
            >
              <Popup>
                <div className="p-2 text-slate-900 min-w-[220px]">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-1">
                    <span className="font-bold text-xs text-blue-800">{dam.name}</span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded text-white ${
                        dam.storagePercentage >= 75
                          ? 'bg-blue-600'
                          : dam.storagePercentage >= 40
                          ? 'bg-sky-500'
                          : 'bg-amber-500'
                      }`}
                    >
                      {dam.storagePercentage}% Full
                    </span>
                  </div>
                  <div className="mt-2 space-y-1 text-[11px] text-slate-600">
                    <div>
                      <span className="font-semibold text-slate-500">River/Basin:</span> {dam.river || dam.basin}
                    </div>
                    <div>
                      <span className="font-semibold text-slate-500">District:</span> {dam.district}, {dam.state}
                    </div>
                    <div>
                      <span className="font-semibold text-slate-500">Current Storage:</span>{' '}
                      <strong className="text-blue-900 font-bold">{dam.currentStorageMCM} MCM</strong> / {dam.grossCapacityMCM} MCM
                    </div>
                    <div>
                      <span className="font-semibold text-slate-500">Purpose:</span> {dam.purpose}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      onSelectLocation(dam.lat, dam.lng, dam.name);
                      if (onSelectDam) onSelectDam(dam);
                    }}
                    className="mt-3 w-full text-center text-[11px] font-bold bg-blue-50 hover:bg-blue-100 text-blue-700 py-1.5 rounded-lg border border-blue-200 transition"
                  >
                    Set as Focused Basin in NEER-AI
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}

        {/* Groundwater Monitoring Stations */}
        {visibleLayers.groundwater &&
          groundwaterStations.map((station) => (
            <Marker
              key={station.id}
              position={[station.lat, station.lng]}
              icon={createGroundwaterIcon(station.status, station.depthMetersBGL)}
            >
              <Popup>
                <div className="p-2 text-slate-900 min-w-[210px]">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-1">
                    <span className="font-bold text-xs text-slate-900">{station.stationName}</span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded text-white ${
                        station.status === 'Safe'
                          ? 'bg-emerald-600'
                          : station.status === 'Semi-Critical'
                          ? 'bg-amber-500'
                          : station.status === 'Critical'
                          ? 'bg-orange-500'
                          : 'bg-rose-600'
                      }`}
                    >
                      {station.status}
                    </span>
                  </div>
                  <div className="mt-2 space-y-1 text-[11px] text-slate-600">
                    <div>
                      <span className="font-semibold text-slate-500">Depth to Water:</span>{' '}
                      <strong className="text-slate-900 font-bold">{station.depthMetersBGL} m bgl</strong>
                    </div>
                    <div>
                      <span className="font-semibold text-slate-500">Salinity (TDS):</span> {station.tdsPpm} ppm
                    </div>
                    <div>
                      <span className="font-semibold text-slate-500">Recharge:</span> {station.rechargePotential}
                    </div>
                    <div>
                      <span className="font-semibold text-slate-500">10-Yr Decadal Mean:</span> {station.tenYearMeanDepth} m bgl
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      onSelectLocation(station.lat, station.lng, station.stationName);
                      if (onSelectStation) onSelectStation(station);
                    }}
                    className="mt-3 w-full text-center text-[11px] font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 py-1.5 rounded-lg border border-emerald-200 transition"
                  >
                    Set as Focused Basin
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}
      </MapContainer>

      {/* Floating Instructions Pill */}
      <div className="absolute bottom-4 left-4 z-[1000] bg-white/95 backdrop-blur-md text-slate-800 px-3.5 py-2 rounded-xl shadow-md border border-blue-200 text-xs flex items-center gap-2 pointer-events-none">
        <Droplet className="w-4 h-4 text-blue-600 animate-bounce" />
        <span className="font-medium text-slate-700">Click any marker or map point to inspect live telemetry</span>
      </div>
    </div>
  );
}
