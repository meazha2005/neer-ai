export interface Dam {
  id: string;
  name: string;
  state: string;
  district: string;
  river: string;
  basin: string;
  purpose: string;
  lat: number;
  lng: number;
  grossCapacityMCM: number;
  currentStorageMCM: number;
  storagePercentage: number;
  maxWaterLevelM: number | null;
  fullReservoirLevelM: number | null;
  damType: string;
  completedYear: number | null;
  incharge: string;
  distanceKm?: number;
}

export interface GroundwaterStation {
  id: string;
  stationName: string;
  district: string;
  state: string;
  lat: number;
  lng: number;
  depthMetersBGL: number; // meters below ground level
  tenYearMeanDepth: number;
  fluctuationMeters: number;
  status: 'Safe' | 'Semi-Critical' | 'Critical' | 'Over-Exploited';
  tdsPpm: number;
  rechargePotential: 'High' | 'Medium' | 'Low';
  lastMeasured: string;
  distanceKm?: number;
}

export interface LiveWeatherData {
  temperature: number;
  humidity: number;
  precipitation: number;
  weatherCode: number;
  windSpeed: number;
  apparentTemp?: number;
  hourly: {
    time: string[];
    precipitationProbability: number[];
    precipitation: number[];
    soilMoistureTop: number[];
    soilMoistureRoot: number[];
    soilMoistureDeep: number[];
  };
  daily: {
    time: string[];
    tempMax: number[];
    tempMin: number[];
    precipitationSum: number[];
    precipitationProbMax: number[];
    evapotranspiration: number[];
  };
}

export interface AgroSuitabilityResult {
  score: number; // 0 - 100
  rating: 'Highly Suitable' | 'Moderately Suitable' | 'Marginal' | 'Drought Risk';
  recommendedCrops: string[];
  waterStressLevel: 'Low' | 'Moderate' | 'High' | 'Severe';
  reasons: string[];
  soilMoistureScore: number;
  groundwaterScore: number;
  weatherRainScore: number;
}

export interface IrrigationPlan {
  shouldIrrigate: boolean;
  reason: string;
  nextRecommendedTime: string;
  waterAmountLitersPerSqm: number;
  suitableMethod: 'Drip Irrigation' | 'Sprinkler' | 'Sub-surface' | 'Furrow';
  daysUntilNextIrrigation: number;
  rainSkipWarning: string | null;
}

export interface DroughtAlert {
  district: string;
  severity: 'Normal' | 'Advisory' | 'Moderate Drought' | 'Severe Drought';
  description: string;
  rainfallDeficitPercentage: number;
  recommendedAction: string;
  updatedDate: string;
}

export interface WaterComplaint {
  id: string;
  title: string;
  category: 'Canal Leakage' | 'Dry Borewell' | 'Contaminated Supply' | 'Dam Sluice Malfunction' | 'Illegal Extraction' | 'Pipeline Burst';
  district: string;
  locationName: string;
  lat: number;
  lng: number;
  complainantName: string;
  phone: string;
  urgency: 'Low' | 'Medium' | 'High' | 'Emergency';
  status: 'Pending' | 'Investigating' | 'In Progress' | 'Resolved';
  description: string;
  createdAt: string;
  updatedAt: string;
  assignedOfficer?: string;
  resolutionNotes?: string;
}
