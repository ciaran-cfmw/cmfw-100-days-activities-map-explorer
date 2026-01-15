/**
 * Merge India Boundaries Script - Version 4
 * 
 * Creates a hybrid India boundary:
 * - Uses FULL official India boundary for the Kashmir/Gilgit-Baltistan region (northwest)
 * - Uses Natural Earth boundary for Nepal, Bangladesh, etc. (seamless fit)
 */

const fs = require('fs');

// Read both geometries
const neIndia = JSON.parse(fs.readFileSync('/tmp/india-ne.geojson', 'utf8'));
const officialIndia = JSON.parse(fs.readFileSync('/tmp/india-official-full.geojson', 'utf8'));

// Get coordinates
const neCoords = neIndia.features[0].geometry.coordinates[0]; // 136 points
const offCoords = officialIndia.features[0].geometry.coordinates;

// Find official mainland (largest polygon)
let maxIdx = 0, maxLen = 0;
offCoords.forEach((p, i) => { if (p[0].length > maxLen) { maxLen = p[0].length; maxIdx = i; } });
const officialMainland = offCoords[maxIdx][0]; // 2770 points

console.log('NE points:', neCoords.length);
console.log('Official mainland points:', officialMainland.length);

// From NE data analysis:
// - Index 0-7: Kashmir region (what we want to replace with FULL official)
// - Index 8-134: Rest of India (Nepal, Bangladesh, etc - keep these for seamless borders)
// - Index 135: Same as 0 (polygon closure)

// The NE seam points are:
// - Western seam: Index 8 [74.40, 31.70] - south of Kashmir, on Pakistan border
// - Eastern seam: Index 134 [78.90, 34.32] - near China/Nepal border

// From official data:
// - The full Kashmir section (including Gilgit-Baltistan towards Afghanistan) runs from 
//   approximately index 0 to ~232 (western seam) and wraps from ~2604 to 2769 (eastern seam)
// - We need to find where official data connects to our NE seam points

const WESTERN_SEAM = neCoords[8];  // [74.40, 31.70]
const EASTERN_SEAM = neCoords[134]; // [78.90, 34.32]

console.log('\nSeam points:');
console.log('Western:', WESTERN_SEAM);
console.log('Eastern:', EASTERN_SEAM);

// Find closest points in official data to our seam points
function distance(p1, p2) {
    return Math.sqrt(Math.pow(p1[0] - p2[0], 2) + Math.pow(p1[1] - p2[1], 2));
}

let closestToWestern = { idx: -1, dist: Infinity };
let closestToEastern = { idx: -1, dist: Infinity };

for (let i = 0; i < officialMainland.length; i++) {
    const d1 = distance(officialMainland[i], WESTERN_SEAM);
    const d2 = distance(officialMainland[i], EASTERN_SEAM);
    if (d1 < closestToWestern.dist) {
        closestToWestern = { idx: i, dist: d1, point: officialMainland[i] };
    }
    if (d2 < closestToEastern.dist) {
        closestToEastern = { idx: i, dist: d2, point: officialMainland[i] };
    }
}

console.log('\nClosest official to western seam:', closestToWestern);
console.log('Closest official to eastern seam:', closestToEastern);

// Build hybrid:
// 1. NE points 8-134 (non-Kashmir)
// 2. Official points from eastern seam through northern Kashmir to western seam
//    This goes: 2604 -> 2769 -> 0 -> 232 (wrapping around)

const hybrid = [];

// Part 1: NE non-Kashmir section (indices 8-134)
for (let i = 8; i <= 134; i++) {
    hybrid.push(neCoords[i]);
}
console.log('\nAdded', 134 - 8 + 1, 'NE points (non-Kashmir)');

// Part 2: Official Kashmir section - from eastern seam wrapping through north to western seam
// Eastern index: 2604, Western index: 232
// Path: 2604 -> 2605 -> ... -> 2769 -> 0 -> 1 -> ... -> 232

const eastIdx = closestToEastern.idx;  // 2604
const westIdx = closestToWestern.idx;  // 232

console.log('Official Kashmir: from', eastIdx, 'wrapping through', officialMainland.length - 1, '& 0 to', westIdx);

// From eastern seam to end of array
for (let i = eastIdx; i < officialMainland.length; i++) {
    hybrid.push(officialMainland[i]);
}

// From start of array to western seam
for (let i = 0; i <= westIdx; i++) {
    hybrid.push(officialMainland[i]);
}

const officialPointsAdded = (officialMainland.length - eastIdx) + (westIdx + 1);
console.log('Added', officialPointsAdded, 'official Kashmir points');

// Close the polygon
hybrid.push([...hybrid[0]]);

console.log('\nTotal hybrid points:', hybrid.length);

// Create hybrid GeoJSON
const hybridGeoJSON = {
    type: 'FeatureCollection',
    features: [{
        type: 'Feature',
        properties: {
            name: 'India',
            FID: 'IND'
        },
        geometry: {
            type: 'Polygon',
            coordinates: [hybrid]
        }
    }]
};

fs.writeFileSync('/tmp/india-hybrid.geojson', JSON.stringify(hybridGeoJSON));
console.log('Wrote /tmp/india-hybrid.geojson');

// Verify bounds
const bounds = {
    minLon: Math.min(...hybrid.map(p => p[0])),
    maxLon: Math.max(...hybrid.map(p => p[0])),
    minLat: Math.min(...hybrid.map(p => p[1])),
    maxLat: Math.max(...hybrid.map(p => p[1]))
};
console.log('\nBounds:', bounds);
console.log('Expected: maxLat ~37.09 (Afghanistan border), minLon ~68.17 (Gujarat)');
