const fs = require('fs');
const path = require('path');

const tnDistricts = [
  { name: 'Chennai', lat: 13.0827, lng: 80.2707, depth: 6.8, status: 'Semi-Critical', tds: 850, recharge: 'Medium' },
  { name: 'Coimbatore', lat: 11.0168, lng: 76.9558, depth: 14.2, status: 'Critical', tds: 620, recharge: 'Low' },
  { name: 'Madurai', lat: 9.9252, lng: 78.1198, depth: 9.5, status: 'Semi-Critical', tds: 740, recharge: 'Medium' },
  { name: 'Tiruchirappalli', lat: 10.7905, lng: 78.7047, depth: 4.8, status: 'Safe', tds: 510, recharge: 'High' },
  { name: 'Salem', lat: 11.6643, lng: 78.1460, depth: 16.8, status: 'Critical', tds: 920, recharge: 'Low' },
  { name: 'Thanjavur', lat: 10.7870, lng: 79.1378, depth: 3.2, status: 'Safe', tds: 420, recharge: 'High' },
  { name: 'Tirunelveli', lat: 8.7139, lng: 77.7567, depth: 7.1, status: 'Semi-Critical', tds: 580, recharge: 'Medium' },
  { name: 'Erode', lat: 11.3410, lng: 77.7172, depth: 12.4, status: 'Critical', tds: 880, recharge: 'Medium' },
  { name: 'Vellore', lat: 12.9165, lng: 79.1325, depth: 21.5, status: 'Over-Exploited', tds: 1120, recharge: 'Low' },
  { name: 'Dharmapuri', lat: 12.1211, lng: 78.1582, depth: 23.1, status: 'Over-Exploited', tds: 1250, recharge: 'Low' },
  { name: 'Dindigul', lat: 10.3673, lng: 77.9803, depth: 11.3, status: 'Critical', tds: 790, recharge: 'Medium' },
  { name: 'Cuddalore', lat: 11.7480, lng: 79.7714, depth: 4.1, status: 'Safe', tds: 610, recharge: 'High' },
  { name: 'Kanchipuram', lat: 12.8342, lng: 79.7036, depth: 5.6, status: 'Semi-Critical', tds: 690, recharge: 'Medium' },
  { name: 'Tiruvannamalai', lat: 12.2253, lng: 79.0747, depth: 13.9, status: 'Critical', tds: 830, recharge: 'Low' },
  { name: 'Nagapattinam', lat: 10.7672, lng: 79.8449, depth: 2.8, status: 'Safe', tds: 980, recharge: 'High' },
  { name: 'Tiruvarur', lat: 10.7725, lng: 79.6365, depth: 3.5, status: 'Safe', tds: 540, recharge: 'High' },
  { name: 'Namakkal', lat: 11.2189, lng: 78.1674, depth: 18.2, status: 'Critical', tds: 960, recharge: 'Low' },
  { name: 'The Nilgiris', lat: 11.4102, lng: 76.6950, depth: 3.9, status: 'Safe', tds: 180, recharge: 'High' },
  { name: 'Kanyakumari', lat: 8.0883, lng: 77.5385, depth: 4.2, status: 'Safe', tds: 350, recharge: 'High' },
  { name: 'Theni', lat: 10.0104, lng: 77.4768, depth: 8.4, status: 'Semi-Critical', tds: 490, recharge: 'Medium' },
  { name: 'Ramanathapuram', lat: 9.3639, lng: 78.8395, depth: 15.6, status: 'Critical', tds: 1450, recharge: 'Low' },
  { name: 'Sivaganga', lat: 9.8433, lng: 78.4809, depth: 10.2, status: 'Critical', tds: 710, recharge: 'Medium' },
  { name: 'Virudhunagar', lat: 9.5680, lng: 77.9624, depth: 12.8, status: 'Critical', tds: 890, recharge: 'Low' },
  { name: 'Thoothukudi', lat: 8.7642, lng: 78.1348, depth: 9.1, status: 'Semi-Critical', tds: 1150, recharge: 'Medium' },
  { name: 'Pudukkottai', lat: 10.3797, lng: 78.8208, depth: 7.9, status: 'Semi-Critical', tds: 640, recharge: 'Medium' },
  { name: 'Karur', lat: 10.9601, lng: 78.0766, depth: 14.5, status: 'Critical', tds: 830, recharge: 'Medium' },
  { name: 'Perambalur', lat: 11.2342, lng: 78.8820, depth: 17.3, status: 'Critical', tds: 910, recharge: 'Low' },
  { name: 'Ariyalur', lat: 11.1401, lng: 79.0786, depth: 8.2, status: 'Semi-Critical', tds: 730, recharge: 'Medium' },
  { name: 'Kallakurichi', lat: 11.7383, lng: 78.9639, depth: 11.6, status: 'Critical', tds: 820, recharge: 'Medium' },
  { name: 'Ranipet', lat: 12.9274, lng: 79.3330, depth: 15.8, status: 'Critical', tds: 1040, recharge: 'Low' },
  { name: 'Tirupattur', lat: 12.4965, lng: 78.5714, depth: 19.4, status: 'Over-Exploited', tds: 1180, recharge: 'Low' },
  { name: 'Chengalpattu', lat: 12.6841, lng: 79.9836, depth: 5.9, status: 'Semi-Critical', tds: 720, recharge: 'Medium' },
  { name: 'Tenkasi', lat: 8.9594, lng: 77.3150, depth: 6.3, status: 'Safe', tds: 410, recharge: 'High' },
  { name: 'Tiruppur', lat: 11.1085, lng: 77.3411, depth: 16.2, status: 'Critical', tds: 870, recharge: 'Low' },
  { name: 'Bengaluru South (KA)', lat: 12.9716, lng: 77.5946, depth: 28.5, status: 'Over-Exploited', tds: 940, recharge: 'Low' },
  { name: 'Mysuru (KA)', lat: 12.2958, lng: 76.6394, depth: 7.8, status: 'Semi-Critical', tds: 480, recharge: 'Medium' },
  { name: 'Palakkad (KL)', lat: 10.7867, lng: 76.6548, depth: 4.5, status: 'Safe', tds: 310, recharge: 'High' },
  { name: 'Chittoor (AP)', lat: 13.2172, lng: 79.1003, depth: 21.0, status: 'Over-Exploited', tds: 1190, recharge: 'Low' }
];

const stations = tnDistricts.map((d, index) => {
  return {
    id: `GW-TN-${(index + 1).toString().padStart(3, '0')}`,
    stationName: `${d.name} Central Observation Well`,
    district: d.name.split(' (')[0],
    state: d.name.includes('(KA)') ? 'Karnataka' : d.name.includes('(KL)') ? 'Kerala' : d.name.includes('(AP)') ? 'Andhra Pradesh' : 'Tamil Nadu',
    lat: d.lat,
    lng: d.lng,
    depthMetersBGL: d.depth,
    tenYearMeanDepth: Number((d.depth * 0.92).toFixed(1)),
    fluctuationMeters: Number((Math.sin(index) * 1.8).toFixed(2)),
    status: d.status,
    tdsPpm: d.tds,
    rechargePotential: d.recharge,
    lastMeasured: '2026-09-28'
  };
});

const outPath = path.join(__dirname, '../src/data/groundwater.json');
fs.writeFileSync(outPath, JSON.stringify(stations, null, 2), 'utf8');
console.log('Saved groundwater stations:', stations.length);
