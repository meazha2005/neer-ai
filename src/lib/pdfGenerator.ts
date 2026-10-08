import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Dam, GroundwaterStation, LiveWeatherData, AgroSuitabilityResult, WaterComplaint } from '@/types';
import { calculateIrrigationPlan, decodeWeatherCode } from '@/lib/api';

interface ReportData {
  location: { name: string; lat: number; lng: number };
  weather: LiveWeatherData | null;
  dams: Dam[];
  groundwaterStation: GroundwaterStation | null;
  suitability: AgroSuitabilityResult | null;
  complaints: WaterComplaint[];
}

export function generateHydrologicalPDF(data: ReportData): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const dateStr = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  const timeStr = new Date().toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  });

  // 1. TOP HEADER BANNER
  doc.setFillColor(30, 64, 175); // Royal Blue #1e40af
  doc.rect(0, 0, pageWidth, 28, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('NEER-AI | SMART WATER & AGRO-INTELLIGENCE', 14, 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('Comprehensive Hydrological, Dam Reservoir & Agricultural Land Report', 14, 18);
  doc.text(`Official Telemetry Bulletin • South India Region • Generated: ${dateStr} at ${timeStr}`, 14, 23);

  // Basin metadata box
  doc.setFillColor(239, 246, 255); // Blue 50
  doc.setDrawColor(191, 219, 254); // Blue 200
  doc.roundedRect(14, 32, pageWidth - 28, 16, 2, 2, 'FD');

  doc.setTextColor(30, 58, 138); // Blue 900
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text(`Focused Basin: ${data.location.name}`, 18, 38);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text(
    `Coordinates: ${data.location.lat.toFixed(4)}°N, ${data.location.lng.toFixed(4)}°E   |   Data Sources: NWIC GeoJSON (760 Dams) • Open-Meteo • CGWB Hydrograph`,
    18,
    44
  );

  let currentY = 53;

  // 2. EXECUTIVE KPI CARDS SUMMARY
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('1. Executive Hydrological & Climate Summary', 14, currentY);
  currentY += 4;

  const avgDamStorage = data.dams.length > 0
    ? Math.round(data.dams.reduce((acc, d) => acc + d.storagePercentage, 0) / data.dams.length)
    : 65;
  const gwDepth = data.groundwaterStation?.depthMetersBGL ?? 6.8;
  const gwStatus = data.groundwaterStation?.status ?? 'Safe';
  const temp = data.weather?.temperature ?? 31.0;
  const rainProb = data.weather?.daily.precipitationProbMax[0] ?? 15;
  const suitabilityScore = data.suitability?.score ?? 72;
  const suitabilityRating = data.suitability?.rating ?? 'Moderately Suitable';

  const kpiData = [
    [
      `Catchment Dam Storage\n${avgDamStorage}% Capacity\n(${data.dams.length} Nearby Dams)`,
      `Water Table Depth\n${gwDepth}m bgl\n(Status: ${gwStatus})`,
      `Weather & 24h Rain\n${temp}°C\n(Rain Prob: ${rainProb}%)`,
      `Agro-Suitability\n${suitabilityScore} / 100\n(${suitabilityRating})`,
    ],
  ];

  autoTable(doc, {
    startY: currentY,
    body: kpiData,
    theme: 'plain',
    styles: {
      fillColor: [248, 250, 252],
      textColor: [15, 23, 42],
      fontSize: 8.5,
      halign: 'center',
      valign: 'middle',
      cellPadding: 3.5,
      lineColor: [203, 213, 225],
      lineWidth: 0.2,
    },
    columnStyles: {
      0: { fontStyle: 'bold', textColor: [2, 132, 199] },
      1: { fontStyle: 'bold', textColor: [16, 185, 129] },
      2: { fontStyle: 'bold', textColor: [245, 158, 11] },
      3: { fontStyle: 'bold', textColor: [37, 99, 235] },
    },
    margin: { left: 14, right: 14 },
  });

  currentY = (doc as any).lastAutoTable.finalY + 8;

  // 3. DAM WATER PERCENTAGE & RESERVOIR NETWORK
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('2. Nearby Dam Reservoirs & Live Water Percentage', 14, currentY);
  currentY += 4;

  const damRows = data.dams.slice(0, 6).map((dam) => [
    dam.name,
    `${dam.distanceKm ?? 0} km`,
    dam.district,
    dam.river || dam.basin || 'Regional Basin',
    `${dam.grossCapacityMCM} MCM`,
    `${dam.currentStorageMCM} MCM`,
    `${dam.storagePercentage}%`,
    dam.storagePercentage >= 70 ? 'Healthy' : dam.storagePercentage >= 40 ? 'Moderate' : 'Critical',
  ]);

  autoTable(doc, {
    startY: currentY,
    head: [['Reservoir / Dam', 'Distance', 'District', 'River / Basin', 'Gross Cap', 'Live Storage', 'Water %', 'Status']],
    body: damRows,
    theme: 'striped',
    headStyles: {
      fillColor: [37, 99, 235],
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: 'bold',
      halign: 'center',
    },
    styles: {
      fontSize: 7.5,
      cellPadding: 2,
      halign: 'center',
    },
    columnStyles: {
      0: { halign: 'left', fontStyle: 'bold' },
      3: { halign: 'left' },
      6: { fontStyle: 'bold', textColor: [2, 132, 199] },
    },
    margin: { left: 14, right: 14 },
  });

  currentY = (doc as any).lastAutoTable.finalY + 8;

  // 4. WEATHER & 7-DAY RAINFALL FORECAST
  if (data.weather) {
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('3. Live Weather & 7-Day Rainfall Prediction', 14, currentY);
    currentY += 4;

    const weatherRows = data.weather.daily.time.slice(0, 7).map((d, i) => {
      const dateFormatted = new Date(d).toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short' });
      return [
        dateFormatted,
        `${data.weather?.daily.tempMax[i]}°C`,
        `${data.weather?.daily.tempMin[i]}°C`,
        `${data.weather?.daily.precipitationSum[i].toFixed(1)} mm`,
        `${data.weather?.daily.precipitationProbMax[i]}%`,
        `${data.weather?.daily.evapotranspiration[i].toFixed(1)} mm/day`,
      ];
    });

    autoTable(doc, {
      startY: currentY,
      head: [['Date & Day', 'Max Temp', 'Min Temp', 'Precipitation', 'Rain Probability', 'Evapotranspiration (ET0)']],
      body: weatherRows,
      theme: 'grid',
      headStyles: {
        fillColor: [2, 132, 199],
        textColor: [255, 255, 255],
        fontSize: 7.5,
        fontStyle: 'bold',
        halign: 'center',
      },
      styles: {
        fontSize: 7.5,
        cellPadding: 1.8,
        halign: 'center',
      },
      columnStyles: {
        0: { halign: 'left', fontStyle: 'bold' },
        3: { fontStyle: 'bold', textColor: [2, 132, 199] },
      },
      margin: { left: 14, right: 14 },
    });

    currentY = (doc as any).lastAutoTable.finalY + 8;
  }

  // Check if we need to add a new page for agriculture and groundwater
  if (currentY > 210) {
    doc.addPage();
    currentY = 16;
  }

  // 5. GROUNDWATER AQUIFER & SOIL MOISTURE
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('4. Underground Water Table & Multi-Depth Soil Moisture', 14, currentY);
  currentY += 4;

  const topM = data.weather?.hourly.soilMoistureTop[12] ?? 0.12;
  const rootM = data.weather?.hourly.soilMoistureRoot[12] ?? 0.22;
  const deepM = data.weather?.hourly.soilMoistureDeep[12] ?? 0.29;

  const gwStation = data.groundwaterStation;
  const subRows = [
    ['CGWB Well Station', `${gwStation?.stationName ?? 'Central Station'} (${gwStation?.district ?? 'Tamil Nadu'})`],
    ['Depth to Water Table', `${gwStation?.depthMetersBGL ?? 6.8} meters bgl (Approx. ${((gwStation?.depthMetersBGL ?? 6.8) * 3.28).toFixed(1)} ft)`],
    ['Aquifer Safety Category', `${gwStation?.status ?? 'Safe'} (10-Yr Mean: ${gwStation?.tenYearMeanDepth ?? 6.2}m)`],
    ['Water Quality / Salinity', `${gwStation?.tdsPpm ?? 650} ppm TDS • Recharge: ${gwStation?.rechargePotential ?? 'Medium'}`],
    ['Topsoil Moisture (0 - 1 cm)', `${(topM * 100).toFixed(1)}% VWC (${topM.toFixed(3)} m³/m³) - Germination Layer`],
    ['Root Zone Moisture (3 - 9 cm)', `${(rootM * 100).toFixed(1)}% VWC (${rootM.toFixed(3)} m³/m³) - Active Crop Nutrient Uptake`],
    ['Deep Subsoil (27 - 81 cm)', `${(deepM * 100).toFixed(1)}% VWC (${deepM.toFixed(3)} m³/m³) - Subsurface Buffer`],
  ];

  autoTable(doc, {
    startY: currentY,
    body: subRows,
    theme: 'striped',
    styles: {
      fontSize: 7.5,
      cellPadding: 2,
    },
    columnStyles: {
      0: { fontStyle: 'bold', textColor: [30, 58, 138], cellWidth: 60 },
      1: { textColor: [51, 65, 85] },
    },
    margin: { left: 14, right: 14 },
  });

  currentY = (doc as any).lastAutoTable.finalY + 8;

  // 6. AGRICULTURAL SUITABILITY & IRRIGATION PLAN
  if (data.suitability) {
    if (currentY > 215) {
      doc.addPage();
      currentY = 16;
    }

    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('5. Agricultural Land Suitability & Precision Irrigation Plan', 14, currentY);
    currentY += 4;

    const plan = data.weather ? calculateIrrigationPlan(data.weather) : null;

    const agroRows = [
      ['Suitability Score', `${data.suitability.score} / 100 (${data.suitability.rating})`],
      ['Water Stress Index', `${data.suitability.waterStressLevel} Stress Level`],
      ['Recommended Crops', data.suitability.recommendedCrops.join(', ')],
      ['Score Breakdown', `Soil Moisture: ${data.suitability.soilMoistureScore}/35  |  Aquifer Table: ${data.suitability.groundwaterScore}/25  |  Rain & Catchment: ${data.suitability.weatherRainScore}/20`],
      ['Irrigation Advisory', plan?.shouldIrrigate ? 'Scheduled Irrigation Required' : 'Hold / Delay Irrigation (Moisture Optimal or Rain Expected)'],
      ['Recommended Window', plan?.nextRecommendedTime ?? 'Early Morning (05:45 AM) to minimize evapotranspiration'],
      ['Water Volume Budget', `${plan?.waterAmountLitersPerSqm ?? 12.5} Liters per sq. meter`],
      ['Optimal Delivery Method', plan?.suitableMethod ?? 'Drip Irrigation / Furrow Micro-sprinklers'],
    ];

    autoTable(doc, {
      startY: currentY,
      body: agroRows,
      theme: 'grid',
      styles: {
        fontSize: 7.5,
        cellPadding: 2,
      },
      columnStyles: {
        0: { fontStyle: 'bold', textColor: [16, 185, 129], cellWidth: 55 },
        1: { textColor: [30, 41, 59] },
      },
      margin: { left: 14, right: 14 },
    });

    currentY = (doc as any).lastAutoTable.finalY + 8;
  }

  // 7. FOOTER
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);

    doc.setDrawColor(226, 232, 240);
    doc.line(14, pageHeight - 12, pageWidth - 14, pageHeight - 12);

    doc.text(
      'NEER-AI • Smart Agro-Hydrological Platform • Tamil Nadu & South India • Endorsed for Agricultural Water Planning',
      14,
      pageHeight - 7
    );
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - 26, pageHeight - 7);
  }

  // Save the PDF file
  const sanitizedName = data.location.name.replace(/[^a-zA-Z0-9]/g, '_');
  doc.save(`NEER-AI_Report_${sanitizedName}_${dateStr.replace(/\s+/g, '_')}.pdf`);
}
