const CROPS_DATA = {
    wheat: {
        name: 'Wheat',
        yield: 45,
        price: 2100,
        season: 'Winter',
        nMin: 40, nMax: 80,
        pMin: 20, pMax: 60,
        kMin: 40, kMax: 100,
        phMin: 6.0, phMax: 8.0
    },
    rice: {
        name: 'Rice',
        yield: 52,
        price: 2900,
        season: 'Monsoon',
        nMin: 60, nMax: 120,
        pMin: 30, pMax: 80,
        kMin: 40, kMax: 100,
        phMin: 6.0, phMax: 7.5
    },
    corn: {
        name: 'Corn',
        yield: 60,
        price: 1800,
        season: 'Summer',
        nMin: 50, nMax: 100,
        pMin: 25, pMax: 70,
        kMin: 40, kMax: 100,
        phMin: 6.0, phMax: 8.0
    },
    cotton: {
        name: 'Cotton',
        yield: 18,
        price: 5500,
        season: 'Summer',
        nMin: 40, nMax: 80,
        pMin: 20, pMax: 60,
        kMin: 60, kMax: 140,
        phMin: 6.0, phMax: 8.0
    },
    sugarcane: {
        name: 'Sugarcane',
        yield: 70,
        price: 280,
        season: 'Year-round',
        nMin: 100, nMax: 150,
        pMin: 40, pMax: 100,
        kMin: 80, kMax: 150,
        phMin: 6.0, phMax: 8.5
    }
};

function getCropScore(cropKey, n, p, k, ph) {
    const crop = CROPS_DATA[cropKey];
    if (!crop) return 0;
    
    let score = 50;
    
    // Nitrogen score
    if (n >= crop.nMin && n <= crop.nMax) score += 15;
    else if (n >= crop.nMin - 10 && n <= crop.nMax + 10) score += 10;
    
    // Phosphorus score
    if (p >= crop.pMin && p <= crop.pMax) score += 15;
    else if (p >= crop.pMin - 5 && p <= crop.pMax + 5) score += 10;
    
    // Potassium score
    if (k >= crop.kMin && k <= crop.kMax) score += 15;
    else if (k >= crop.kMin - 10 && k <= crop.kMax + 10) score += 10;
    
    // pH score
    if (ph >= crop.phMin && ph <= crop.phMax) score += 20;
    else if (ph >= crop.phMin - 0.5 && ph <= crop.phMax + 0.5) score += 10;
    
    return Math.min(100, score);
}
