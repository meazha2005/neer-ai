'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { Dam, GroundwaterStation } from '@/types';
import { Loader2 } from 'lucide-react';

const LeafletMap = dynamic(() => import('./LeafletMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[520px] rounded-2xl bg-blue-50/50 flex flex-col items-center justify-center text-slate-700 border border-blue-200">
      <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-3" />
      <p className="text-sm font-bold text-blue-950">Loading NEER-AI Hydrological Map...</p>
      <span className="text-xs text-slate-500 mt-1">Rendering 760 NWIC reservoirs & aquifer observation wells</span>
    </div>
  ),
});

interface MapWrapperProps {
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

export default function MapWrapper(props: MapWrapperProps) {
  return <LeafletMap {...props} />;
}
