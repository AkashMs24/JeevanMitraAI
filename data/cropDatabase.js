const CROP_DB = {
    wheat:     { emoji:'🌾', seasons:['Rabi'],          market:2100, N:[40,80],   P:[20,60],  K:[40,100], ph:[6.0,8.0] },
    rice:      { emoji:'🌾', seasons:['Kharif'],        market:2900, N:[60,120],  P:[30,80],  K:[40,100], ph:[6.0,7.5] },
    corn:      { emoji:'🌽', seasons:['Kharif','Summer'],market:1800, N:[50,100], P:[25,70],  K:[40,100], ph:[6.0,8.0] },
    cotton:    { emoji:'☁️', seasons:['Kharif'],        market:5500, N:[40,80],   P:[20,60],  K:[60,140], ph:[6.0,8.0] },
    sugarcane: { emoji:'🎋', seasons:['Year-round'],    market:280,  N:[100,150], P:[40,100], K:[80,150], ph:[6.0,8.5] },
    soybean:   { emoji:'🫘', seasons:['Kharif'],        market:3200, N:[20,40],   P:[30,60],  K:[40,80],  ph:[6.0,7.5] },
    groundnut: { emoji:'🥜', seasons:['Kharif','Rabi'], market:4500, N:[20,40],   P:[30,60],  K:[50,90],  ph:[6.0,7.5] }
};

const yProf = {
    wheat:     { base:25, peak:55, nS:1.2, pS:1.0, kS:0.8, unit:'q/ha' },
    rice:      { base:30, peak:65, nS:1.3, pS:1.0, kS:0.9, unit:'q/ha' },
    corn:      { base:35, peak:75, nS:1.2, pS:1.0, kS:0.8, unit:'q/ha' },
    cotton:    { base:10, peak:22, nS:1.0, pS:0.9, kS:1.1, unit:'q/ha' },
    sugarcane: { base:55, peak:90, nS:1.1, pS:1.0, kS:1.0, unit:'q/ha' },
    soybean:   { base:12, peak:26, nS:1.0, pS:1.1, kS:0.9, unit:'q/ha' },
    groundnut: { base:10, peak:24, nS:0.9, pS:1.1, kS:1.0, unit:'q/ha' }
};

const CROP_NAMES = {
    en:{wheat:'Wheat',rice:'Rice',corn:'Corn',cotton:'Cotton',sugarcane:'Sugarcane',soybean:'Soybean',groundnut:'Groundnut'},
    kn:{wheat:'ಗೋಧಿ',rice:'ಅಕ್ಕಿ',corn:'ಜೋಳ',cotton:'ಹತ್ತಿ',sugarcane:'ಕಬ್ಬು',soybean:'ಸೋಯಾಬೀನ್',groundnut:'ಶೇಂಗಾ'},
    hi:{wheat:'गेहूं',rice:'चावल',corn:'मक्का',cotton:'कपास',sugarcane:'गन्ना',soybean:'सोयाबीन',groundnut:'मूंगफली'},
    ml:{wheat:'ഗോതമ്പ്',rice:'അരി',corn:'ചോളം',cotton:'പരുത്തി',sugarcane:'കരിമ്പ്',soybean:'സോയാബീൻ',groundnut:'നിലക്കടല'},
    ta:{wheat:'கோதுமை',rice:'அரிசி',corn:'சோளம்',cotton:'பருத்தி',sugarcane:'கரும்பு',soybean:'சோயா',groundnut:'நிலக்கடலை'},
    te:{wheat:'గోధుమ',rice:'బియ్యం',corn:'మొక్కజొన్న',cotton:'పత్తి',sugarcane:'చెరకు',soybean:'సోయాబీన్',groundnut:'వేరుశనగ'}
};

function lcn(cropKey) {
    return (CROP_NAMES[currentLanguage] && CROP_NAMES[currentLanguage][cropKey]) || CROP_NAMES.en[cropKey] || cropKey;
}

function rangeScore(val, [min, max]) {
    if (val >= min && val <= max) return 100;
    const span = (max - min) || 1;
    const dist = val < min ? (min - val) : (val - max);
    return Math.max(0, 100 - (dist / span) * 100);
}

function getAllRanked(soilData) {
    const { n, p, k, ph } = soilData;
    return Object.entries(CROP_DB).map(([key, crop]) => {
        const score = rangeScore(n, crop.N) * 0.30 + rangeScore(p, crop.P) * 0.25 +
                      rangeScore(k, crop.K) * 0.25 + rangeScore(ph, crop.ph) * 0.20;
        return { k: key, crop, score: Math.min(100, score) };
    }).sort((a, b) => b.score - a.score);
}
