import damsData from '@/data/dams.json';
import groundwaterData from '@/data/groundwater.json';
import { Dam, GroundwaterStation } from '@/types';

export interface SearchResult {
  id: string;
  name: string;
  category: 'Dam' | 'Groundwater Well' | 'District' | 'Place';
  lat: number;
  lng: number;
  subtitle: string;
  extraInfo?: string;
}

const dams = damsData as Dam[];
const stations = groundwaterData as GroundwaterStation[];

// Fast client-side search across dams, groundwater stations, and pre-indexed South Indian districts
export async function searchHydrologicalEntities(query: string): Promise<SearchResult[]> {
  const q = query.trim().toLowerCase();
  if (!q || q.length < 2) return [];

  const results: SearchResult[] = [];

  // 1. Search in 760 NWIC Dams
  for (const dam of dams) {
    const matchName = dam.name.toLowerCase().includes(q);
    const matchDistrict = dam.district.toLowerCase().includes(q);
    const matchRiver = dam.river?.toLowerCase().includes(q);

    if (matchName || matchDistrict || matchRiver) {
      results.push({
        id: dam.id,
        name: dam.name,
        category: 'Dam',
        lat: dam.lat,
        lng: dam.lng,
        subtitle: `${dam.district}, ${dam.state} • River: ${dam.river || dam.basin}`,
        extraInfo: `${dam.storagePercentage}% Storage (${dam.currentStorageMCM} MCM)`,
      });
    }

    if (results.length >= 12) break;
  }

  // 2. Search in Groundwater observation stations
  for (const st of stations) {
    const matchName = st.stationName.toLowerCase().includes(q);
    const matchDistrict = st.district.toLowerCase().includes(q);

    if (matchName || matchDistrict) {
      results.push({
        id: st.id,
        name: st.stationName,
        category: 'Groundwater Well',
        lat: st.lat,
        lng: st.lng,
        subtitle: `${st.district}, ${st.state} • Aquifer Status: ${st.status}`,
        extraInfo: `Depth: ${st.depthMetersBGL}m bgl • TDS: ${st.tdsPpm} ppm`,
      });
    }

    if (results.length >= 18) break;
  }

  // 3. If few or no local results, query OpenStreetMap Nominatim for Indian towns/villages/areas
  if (results.length < 4 && q.length >= 3) {
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        q + ', South India'
      )}&limit=5&countrycodes=in`;
      const res = await fetch(url, {
        headers: { 'Accept-Language': 'en' },
      });
      if (res.ok) {
        const places = await res.json();
        for (const p of places) {
          const lat = parseFloat(p.lat);
          const lng = parseFloat(p.lon);
          if (!isNaN(lat) && !isNaN(lng)) {
            results.push({
              id: `OSM-${p.place_id}`,
              name: p.display_name.split(',')[0],
              category: 'Place',
              lat: Number(lat.toFixed(4)),
              lng: Number(lng.toFixed(4)),
              subtitle: p.display_name.split(',').slice(1, 3).join(',').trim(),
              extraInfo: 'OpenStreetMap Geolocation',
            });
          }
        }
      }
    } catch (e) {
      // Ignore network errors on Nominatim
    }
  }

  return results.slice(0, 15);
}
