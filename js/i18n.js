'use strict';

/* ── LANGUAGE DATA ── */
window.i18n = {
en: {
get_recommendations: "Get Recommendations",
top_crops: "Top 5 Recommended Crops",
optimization_tips: "Optimization Tips",
why_recommendation: "Why this recommendation?",
chat_welcome: "Hello! I'm JeevanMitra AI 🌿",
lang_changed: "Language changed to English"
},
hi: {
get_recommendations: "सिफारिश प्राप्त करें",
top_crops: "शीर्ष 5 फसलें",
optimization_tips: "सुधार सुझाव",
why_recommendation: "यह सिफारिश क्यों?",
chat_welcome: "नमस्ते! मैं जीवनमित्र AI हूँ 🌿",
lang_changed: "भाषा बदल दी गई है"
},
kn: {
get_recommendations: "ಶಿಫಾರಸು ಪಡೆಯಿರಿ",
top_crops: "ಟಾಪ್ 5 ಬೆಳೆಗಳು",
optimization_tips: "ಸುಧಾರಣೆ ಸಲಹೆಗಳು",
why_recommendation: "ಈ ಶಿಫಾರಸು ಯಾಕೆ?",
chat_welcome: "ನಮಸ್ಕಾರ! ನಾನು ಜೀವನಮಿತ್ರ AI 🌿",
lang_changed: "ಭಾಷೆ ಬದಲಾಯಿಸಲಾಗಿದೆ"
}
};

/* ── CROP NAMES (FOR MARKET + CROP MODULE) ── */
window.cropNames = {
en: {
rice: "Rice",
wheat: "Wheat",
maize: "Maize",
cotton: "Cotton",
sugarcane: "Sugarcane",
millet: "Millet",
banana: "Banana",
potato: "Potato",
tomato: "Tomato",
onion: "Onion"
},
hi: {
rice: "चावल",
wheat: "गेहूं",
maize: "मक्का",
cotton: "कपास"
},
kn: {
rice: "ಅಕ್ಕಿ",
wheat: "ಗೋಧಿ",
maize: "ಮೆಕ್ಕೆಜೋಳ",
cotton: "ಹತ್ತಿ"
}
};

/* ── TRANSLATION FUNCTION ── */
function t(key) {
const lang = window.currentLanguage || 'en';
return window.i18n[lang]?.[key] || window.i18n.en[key] || key;
}

/* ── APPLY TEXT TO UI ── */
function applyTranslations() {
document.querySelectorAll('[data-i18n]').forEach(el => {
const key = el.getAttribute('data-i18n');
el.textContent = t(key);
});
}

/* ── LANGUAGE SWITCH ── */
function setLanguage(lang) {
window.currentLanguage = lang;

document.querySelectorAll('.lang-btn').forEach(btn =>
btn.classList.remove('active')
);

document.querySelector(`.lang-btn[data-lang="${lang}"]`)
?.classList.add('active');

applyTranslations();

// Refresh dependent modules
if (typeof loadMarketPrices === 'function') loadMarketPrices();
if (typeof predictYield === 'function') predictYield();
if (typeof livePreviewCrop === 'function') livePreviewCrop();

if (typeof toast === 'function') {
toast(t('lang_changed'));
}
}

/* ── HELPER (FIXES OLD lcn ERROR) ── */
function lcn(key) {
const lang = window.currentLanguage || 'en';
return window.cropNames?.[lang]?.[key]
|| window.cropNames?.en?.[key]
|| key;
}

/* ── EXPOSE GLOBALS ── */
window.t = t;
window.setLanguage = setLanguage;
window.applyTranslations = applyTranslations;
window.lcn = lcn;
