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

// ==========================================
// ADVANCED HYDROLOGICAL ENGINES TYPES
// ==========================================

export interface EnsoImpactData {
  ensoPhase: 'El Niño (Warm)' | 'La Niña (Cool)' | 'ENSO-Neutral';
  sstAnomalyDegC: number;
  iodPhase: 'Positive' | 'Neutral' | 'Negative';
  iodAnomalyDegC: number;
  monsoonImpactSummary: string;
  confidenceScore: number; // 0 - 100%
  expectedRainfall90DaysMm: number;
  rainfallUncertaintyMarginMm: number; // ± mm
  historicalAnalogYears: string[];
}

export interface SupplyDemandSector {
  sector: 'Drinking & Domestic' | 'Agriculture & Irrigation' | 'Industrial & Commercial' | 'Ecological Reserve (E-Flow)';
  demandMCM: number;
  allocatedMCM: number;
  deficitMCM: number;
  fulfillmentPercent: number;
  priorityLevel: 1 | 2 | 3 | 4;
}

export interface SupplyDemandData {
  surfaceStorageMCM: number;
  groundwaterAvailableMCM: number;
  rainfallInfiltrationMCM: number;
  recycledWaterMCM: number;
  totalSupplyMCM: number;
  totalDemandMCM: number;
  netBalanceMCM: number; // positive = surplus, negative = deficit
  stressCategory: 'Surplus' | 'Sustainable' | 'Moderate Stress' | 'Severe Deficit';
  sectors: SupplyDemandSector[];
}

export interface SecurityScenarioProjection {
  day30MCM: number;
  day60MCM: number;
  day90MCM: number;
  dayZeroEstimateDays: number | null; // days until critical shortage if any
  riskLevel: 'Safe' | 'Watch' | 'Critical Stress' | 'Emergency';
}

export interface WaterSecurity90Day {
  scenarios: {
    dry: SecurityScenarioProjection;
    normal: SecurityScenarioProjection;
    wet: SecurityScenarioProjection;
  };
  activeScenario: 'dry' | 'normal' | 'wet';
  criticalDayZeroWarning: string | null;
}

export interface StakeholderAction {
  persona: 'Farmers' | 'Water Authorities' | 'Communities' | 'Industries' | 'Ecosystems';
  headline: string;
  actions: string[];
  waterSavingsPotentialMCM: number;
  urgency: 'Immediate (24h)' | 'Planned (7d)' | 'Strategic (30d)';
}

export interface ExplainableDecision {
  primaryRecommendation: string;
  confidencePercent: number;
  rationaleFactors: {
    factor: string;
    impact: 'High' | 'Medium' | 'Low';
    measuredValue: string;
    threshold: string;
  }[];
  stakeholders: StakeholderAction[];
}

export interface EcosystemWarningData {
  eFlowCompliancePercent: number;
  ecologicalReserveMCM: number;
  ecosystemStressScore: number; // 0 (healthy) - 100 (acute crisis)
  droughtStage: 'Stage 1: Basin Advisory' | 'Stage 2: Moderate Drought' | 'Stage 3: Severe Drought' | 'Stage 4: Extreme Emergency';
  criticalShortageDays: number;
  alerts: string[];
}

export interface ImpactComparisonData {
  metrics: {
    metric: string;
    withoutNeerAi: string;
    withNeerAi: string;
    benefit: string;
  }[];
  totalWaterSavedMCM: number;
  percentLossReduced: number;
  economicBenefitCroresINR: number;
  droughtDaysAvoided: number;
}
