let currentLanguage = 'en';

const i18n = {
  en: {
    dash_weather:'Weather',dash_location:'Location',dash_ai:'AI Status',dash_data:'Live Data',
    tab_advisor:'Crop Advisor',tab_disease:'Disease',tab_soil:'Soil',tab_yield:'Yield',tab_market:'Market',tab_weather:'Weather',tab_advisory:'Advisories',
    advisor_title:'Intelligent Crop Advisor',advisor_desc:'AI-powered crop recommendations from your real-time soil & weather data',
    live_title:'📡 Live Weather Auto-Fill',live_btn:'📡 Get Live Weather & Soil Data',live_hint:'Fetches real-time weather for your GPS location',
    live_temp:'Temperature',live_hum:'Humidity',live_rain:'Rainfall',live_loc:'Location',
    soil_title:'🧪 Soil Parameters',s_nitrogen:'Nitrogen (N) — mg/kg',s_phosphorus:'Phosphorus (P) — mg/kg',s_potassium:'Potassium (K) — mg/kg',s_ph:'Soil pH',s_type:'Soil Type',
    s_loamy:'Loamy',s_clay:'Clay',s_sandy:'Sandy',s_black:'Black',s_red:'Red',s_laterite:'Laterite',s_alluvial:'Alluvial',s_hilly:'Hilly',
    ai_rec_title:'🤖 AI-Powered Recommendations',ai_rec_btn:'🔍 Get Personalized Recommendations',
    disease_title:'AI Disease Detection',disease_desc:'Upload crop images for instant AI diagnosis',
    upload_title:'Upload Crop Leaf Image',upload_hint:'Click or drag to browse',
    disease_symptoms:'Symptoms',disease_treatment:'Treatment',disease_prevention:'Prevention',disease_upload_another:'🔄 Upload Another',
    soil_tab_title:'Soil Analysis & Health Report',soil_tab_desc:'Comprehensive soil health scoring with actionable recommendations',
    soil_nutrients:'📊 Nutrient Levels',soil_score:'🎯 Health Score',soil_analyze_btn:'🧪 Analyze Soil',soil_recs:'💡 Recommendations',
    yield_tab_title:'Yield Prediction',yield_tab_desc:'ML-based forecasting with revenue estimation',
    yield_select_crop:'🌾 Select Crop',yield_area:'🏞️ Farm Area (hectares)',yield_results:'📈 Prediction Results',yield_empty:'Select a crop above to see yield prediction',
    yield_per_ha:'Yield / Ha',yield_total:'Total',yield_price:'Market Price',yield_confidence:'AI Confidence',yield_tips:'🤖 Yield Tips',
    market_title:'Live Market Prices',market_desc:'Real-time commodity prices from Indian mandi network',market_fetch_btn:'📡 Fetch Live Prices',
    market_fetching:'📡 Fetching live mandi prices…',market_live:'📡 Live from data.gov.in mandi network',market_fallback:'⚠️ Reference prices — live API unavailable',
    weather_tab_title:'7-Day Forecast',weather_tab_desc:'Agricultural weather outlook for your area',weather_load_btn:'📡 Load Forecast',weather_today:'Today',weather_low:'Low:',
    advisory_tab_title:'Crop Advisories',advisory_tab_desc:'Real-time farming alerts & seasonal guidance',advisory_load_btn:'📡 Load Advisories',
    chat_title:'🤖 JeevanMitra AI',chat_welcome:"Hello! I'm JeevanMitra AI — your smart farming companion. Ask about crops, diseases, yield or prices! 🌿",
    chat_placeholder:'Ask about farming…',qa_crop:'🌱 Best crop?',qa_yield:'📊 Yield',qa_disease:'🔍 Disease',qa_price:'💰 Prices',
    voice_listening:'🎤 Listening…',voice_not_supported:'❌ Voice not supported',voice_speaking:'🔊 Speaking…',
    settings_title:'⚙️ Settings',settings_location:'📍 Location',settings_refresh:'🔄 Refresh',settings_api_key:'🔑 Groq API Key',
    settings_save:'Save Key',settings_clear:'Clear Key',settings_data:'💾 Data',settings_clear_cache:'Clear Cache',settings_export:'📥 Export',
    settings_api_hint:'Free key at',lang_changed:'Language changed',
    weather_loaded:'✅ Weather data loaded!',market_loaded:'✅ Market prices loaded!',ai_analysis:'🤖 AI Analysis',voice_auto:'🔊 Auto Voice',
    soil_empty:'Enter soil data and click Get',
  },
  kn: {
    dash_weather:'ಹವಾಮಾನ',dash_location:'ಸ್ಥಳ',dash_ai:'AI ಸ್ಥಿತಿ',dash_data:'ಲೈವ್ ಡೇಟಾ',
    tab_advisor:'ಬೆಳೆ ಸಲಹೆ',tab_disease:'ರೋಗ',tab_soil:'ಮಣ್ಣು',tab_yield:'ಇಳುವರಿ',tab_market:'ಬೆಲೆ',tab_weather:'ಹವಾಮಾನ',tab_advisory:'ಸಲಹೆ',
    advisor_title:'ಬುದ್ಧಿವಂತ ಬೆಳೆ ಸಲಹೆ',advisor_desc:'ನಿಮ್ಮ ಹವಾಮಾನ ಮತ್ತು ಮಣ್ಣಿನ ಡೇಟಾದ ಆಧಾರದ ಮೇಲೆ AI ಶಿಫಾರಸುಗಳು',
    live_btn:'📡 ಲೈವ್ ಹವಾಮಾನ ಪಡೆಯಿರಿ',live_hint:'ನಿಮ್ಮ GPS ಸ್ಥಳಕ್ಕೆ ಲೈವ್ ಹವಾಮಾನ',
    soil_title:'🧪 ಮಣ್ಣಿನ ಪರಾಮೀಟರ್‌ಗಳು',
    ai_rec_title:'🤖 AI ಶಿಫಾರಸುಗಳು',ai_rec_btn:'🔍 ಶಿಫಾರಸು ಪಡೆಯಿರಿ',
    disease_title:'🔬 AI ರೋಗ ಪತ್ತೆ',upload_title:'ಎಲೆ ಚಿತ್ರ ಅಪ್‌ಲೋಡ್',
    soil_tab_title:'🧪 ಮಣ್ಣು ವಿಶ್ಲೇಷಣೆ',yield_tab_title:'📊 ಇಳುವರಿ ಊಹೆ',yield_select_crop:'🌾 ಬೆಳೆ ಆಯ್ಕೆ',
    market_title:'💰 ಮಾರುಕಟ್ಟೆ ಬೆಲೆ',market_desc:'ನೈಜ ಸಮಯದ ಕಮೋಡಿಟಿ ಬೆಲೆಗಳು',market_fetch_btn:'📡 ಬೆಲೆಗಳು ಪಡೆಯಿರಿ',
    weather_tab_title:'⛅ 7-ದಿನ ಮುನ್ಸೂಚನೆ',weather_load_btn:'📡 ಮುನ್ಸೂಚನೆ',advisory_tab_title:'📢 ಬೆಳೆ ಸಲಹೆ',advisory_load_btn:'📡 ಸಲಹೆ ಲೋಡ್',
    chat_title:'🤖 ಜೀವನಮಿತ್ರ AI',chat_welcome:'ನಮಸ್ಕಾರ! ನಾನು ಜೀವನಮಿತ್ರ AI 🌿',
    qa_crop:'🌱 ಬೆಳೆ?',qa_yield:'📊 ಇಳುವರಿ',qa_disease:'🔍 ರೋಗ',qa_price:'💰 ಬೆಲೆ',
    voice_listening:'🎤 ಕೇಳುತ್ತಿದೆ…',voice_not_supported:'❌ ಧ್ವನಿ ಇಲ್ಲ',lang_changed:'ಭಾಷೆ ಬದಲಾಯಿಸಲಾಗಿದೆ',
    weather_loaded:'✅ ಹವಾಮಾನ ಲೋಡ್!',market_loaded:'✅ ಬೆಲೆ ಲೋಡ್!',soil_empty:'ಡೇಟಾ ನಮೂದಿಸಿ',live_temp:'ತಾಪಮಾನ',live_hum:'ಆರ್ದ್ರತೆ',live_rain:'ಮಳೆ',live_loc:'ಸ್ಥಳ',
    market_fetching:'📡 ಬೆಲೆಗಳು ಪಡೆಯುತ್ತಿದೆ…',weather_today:'ಇಂದು',weather_low:'ಕಡಿಮೆ:',
    yield_per_ha:'ಇಳುವರಿ/ಹೆ',yield_total:'ಒಟ್ಟು',yield_price:'ಬೆಲೆ',yield_confidence:'AI ವಿಶ್ವಾಸ',yield_empty:'ಬೆಳೆ ಆಯ್ಕೆಮಾಡಿ',
    disease_symptoms:'ಲಕ್ಷಣಗಳು',disease_treatment:'ಚಿಕಿತ್ಸೆ',disease_prevention:'ತಡೆಗಟ್ಟುವಿಕೆ',disease_upload_another:'🔄 ಮತ್ತೊಂದು',
    soil_nutrients:'📊 ಪೋಷಕಾಂಶಗಳು',soil_score:'🎯 ಆರೋಗ್ಯ ಸ್ಕೋರ್',soil_analyze_btn:'🧪 ವಿಶ್ಲೇಷಿಸಿ',soil_recs:'💡 ಶಿಫಾರಸುಗಳು',
    settings_title:'⚙️ ಸೆಟ್ಟಿಂಗ್‌ಗಳು',voice_auto:'🔊 ಆಟೋ ಧ್ವನಿ',
  },
  hi: {
    dash_weather:'मौसम',dash_location:'स्थान',dash_ai:'AI स्थिति',dash_data:'लाइव डेटा',
    tab_advisor:'फसल',tab_disease:'रोग',tab_soil:'मिट्टी',tab_yield:'उपज',tab_market:'बाजार',tab_weather:'मौसम',tab_advisory:'सलाह',
    advisor_title:'AI फसल सलाहकार',advisor_desc:'मिट्टी और मौसम डेटा से AI सिफारिशें',
    live_btn:'📡 लाइव मौसम प्राप्त करें',live_hint:'GPS स्थान से लाइव मौसम',
    soil_title:'🧪 मिट्टी पैरामीटर',ai_rec_title:'🤖 AI सिफारिशें',ai_rec_btn:'🔍 सिफारिशें पाएं',
    disease_title:'🔬 AI रोग पहचान',upload_title:'पत्ते की छवि अपलोड',
    soil_tab_title:'🧪 मिट्टी विश्लेषण',yield_tab_title:'📊 उपज अनुमान',yield_select_crop:'🌾 फसल चुनें',
    market_title:'💰 बाजार मूल्य',market_desc:'असली मंडी कीमतें',market_fetch_btn:'📡 कीमतें प्राप्त करें',
    weather_tab_title:'⛅ 7-दिन पूर्वानुमान',weather_load_btn:'📡 पूर्वानुमान',
    advisory_tab_title:'📢 फसल सलाह',advisory_load_btn:'📡 सलाह लोड',
    chat_title:'🤖 जीवनमित्र AI',chat_welcome:'नमस्ते! मैं जीवनमित्र AI 🌿',
    qa_crop:'🌱 फसल?',qa_yield:'📊 उपज',qa_disease:'🔍 रोग',qa_price:'💰 भाव',
    voice_listening:'🎤 सुन रहे…',voice_not_supported:'❌ वॉइस नहीं',lang_changed:'भाषा बदली',
    weather_loaded:'✅ मौसम लोड!',market_loaded:'✅ बाजार लोड!',soil_empty:'डेटा दर्ज करें',live_temp:'तापमान',live_hum:'आर्द्रता',live_rain:'वर्षा',live_loc:'स्थान',
    market_fetching:'📡 कीमतें मिल रही…',weather_today:'आज',weather_low:'न्यूनतम:',
    yield_per_ha:'उपज/हे',yield_total:'कुल',yield_price:'मूल्य',yield_confidence:'AI विश्वास',yield_empty:'फसल चुनें',
    disease_symptoms:'लक्षण',disease_treatment:'उपचार',disease_prevention:'रोकथाम',disease_upload_another:'🔄 दूसरा',
    soil_nutrients:'📊 पोषक',soil_score:'🎯 स्कोर',soil_analyze_btn:'🧪 विश्लेषण',soil_recs:'💡 सुझाव',
    settings_title:'⚙️ सेटिंग्स',voice_auto:'🔊 ऑटो आवाज',
  },
  ml: {
    dash_weather:'കാലാവസ്ഥ',dash_location:'സ്ഥലം',dash_ai:'AI സ്ഥിതി',dash_data:'ലൈവ് ഡാറ്റ',
    tab_advisor:'വിള',tab_disease:'രോഗം',tab_soil:'മണ്ണ്',tab_yield:'വിളവ്',tab_market:'വിപണി',tab_weather:'കാലാവസ്ഥ',tab_advisory:'ഉപദേശം',
    advisor_title:'AI വിള ഉപദേശകൻ',advisor_desc:'മണ്ണ് & കാലാവസ്ഥ ഡാറ്റയിൽ നിന്ന് AI',
    live_btn:'📡 ലൈവ് ഡാറ്റ നേടുക',soil_title:'🧪 മണ്ണ് പാരാമീറ്ററുകൾ',
    ai_rec_title:'🤖 AI ശുപാർശകൾ',ai_rec_btn:'🔍 ശുപാർശ നേടുക',
    disease_title:'🔬 AI രോഗ കണ്ടെത്തൽ',upload_title:'ഇല ചിത്രം അപ്‌ലോഡ്',
    soil_tab_title:'🧪 മണ്ണ് വിശകലനം',yield_tab_title:'📊 വിളവ് പ്രവചനം',yield_select_crop:'🌾 വിള തിരഞ്ഞെടുക്കുക',
    market_title:'💰 വിപണി വില',market_desc:'യഥാർത്ഥ മണ്ഡി വിലകൾ',market_fetch_btn:'📡 വില നേടുക',
    weather_tab_title:'⛅ 7-ദിവസ പ്രവചനം',weather_load_btn:'📡 പ്രവചനം',
    advisory_tab_title:'📢 വിള ഉപദേശം',advisory_load_btn:'📡 ഉപദേശം',
    chat_title:'🤖 ജീവൻമിത്ര AI',chat_welcome:'നമസ്കാരം! ഞാൻ ജീവൻമിത്ര AI 🌿',
    qa_crop:'🌱 വിള?',qa_yield:'📊 വിളവ്',qa_disease:'🔍 രോഗം',qa_price:'💰 വില',
    voice_listening:'🎤 കേൾക്കുന്നു…',voice_not_supported:'❌ വോയ്സ് ഇല്ല',lang_changed:'ഭാഷ മാറ്റി',
    weather_loaded:'✅ കാലാവസ്ഥ!',market_loaded:'✅ വില ലഭിച്ചു!',soil_empty:'ഡാറ്റ നൽകുക',live_temp:'താപനില',live_hum:'ആർദ്രത',live_rain:'മഴ',live_loc:'സ്ഥലം',
    market_fetching:'📡 വില നേടുന്നു…',weather_today:'ഇന്ന്',weather_low:'താഴ്ന്ന:',
    yield_per_ha:'വിളവ്/ഹെ',yield_total:'മൊത്തം',yield_price:'വില',yield_confidence:'AI വിശ്വാസം',yield_empty:'വിള തിരഞ്ഞെടുക്കുക',
    disease_symptoms:'ലക്ഷണങ്ങൾ',disease_treatment:'ചികിത്സ',disease_prevention:'തടയൽ',disease_upload_another:'🔄 മറ്റൊന്ന്',
    soil_nutrients:'📊 പോഷകങ്ങൾ',soil_score:'🎯 ആരോഗ്യം',soil_analyze_btn:'🧪 വിശകലനം',soil_recs:'💡 ശുപാർശകൾ',
    settings_title:'⚙️ സെറ്റിംഗ്സ്',voice_auto:'🔊 ഓട്ടോ',
  },
  ta: {
    dash_weather:'வானிலை',dash_location:'இடம்',dash_ai:'AI நிலை',dash_data:'நேரலை தரவு',
    tab_advisor:'பயிர்',tab_disease:'நோய்',tab_soil:'மண்',tab_yield:'விளைச்சல்',tab_market:'சந்தை',tab_weather:'வானிலை',tab_advisory:'ஆலோசனை',
    advisor_title:'AI பயிர் ஆலோசகர்',advisor_desc:'மண் & வானிலை தரவிலிருந்து AI பரிந்துரைகள்',
    live_btn:'📡 நேரலை தரவு பெறுங்கள்',soil_title:'🧪 மண் அளவுகோல்கள்',
    ai_rec_title:'🤖 AI பரிந்துரைகள்',ai_rec_btn:'🔍 பரிந்துரை பெறுங்கள்',
    disease_title:'🔬 AI நோய் கண்டறிதல்',upload_title:'இலை படம் பதிவேற்றம்',
    soil_tab_title:'🧪 மண் பகுப்பாய்வு',yield_tab_title:'📊 விளைச்சல் கணிப்பு',yield_select_crop:'🌾 பயிர் தேர்வு',
    market_title:'💰 சந்தை விலை',market_desc:'நிஜ மண்டி விலைகள்',market_fetch_btn:'📡 விலை பெறுங்கள்',
    weather_tab_title:'⛅ 7 நாள் முன்னறிவிப்பு',weather_load_btn:'📡 முன்னறிவிப்பு',
    advisory_tab_title:'📢 பயிர் ஆலோசனை',advisory_load_btn:'📡 ஆலோசனை',
    chat_title:'🤖 ஜீவன்மித்ரா AI',chat_welcome:'வணக்கம்! நான் ஜீவன்மித்ரா AI 🌿',
    qa_crop:'🌱 பயிர்?',qa_yield:'📊 விளைச்சல்',qa_disease:'🔍 நோய்',qa_price:'💰 விலை',
    voice_listening:'🎤 கேட்கிறது…',voice_not_supported:'❌ குரல் இல்லை',lang_changed:'மொழி மாற்றப்பட்டது',
    weather_loaded:'✅ வானிலை!',market_loaded:'✅ விலை!',soil_empty:'தரவு உள்ளிடவும்',live_temp:'வெப்பம்',live_hum:'ஈரம்',live_rain:'மழை',live_loc:'இடம்',
    market_fetching:'📡 விலை பெறுகிறது…',weather_today:'இன்று',weather_low:'குறைந்தபட்சம்:',
    yield_per_ha:'விளைச்சல்/ஹெ',yield_total:'மொத்தம்',yield_price:'விலை',yield_confidence:'AI நம்பிக்கை',yield_empty:'பயிர் தேர்ந்தெடுக்கவும்',
    disease_symptoms:'லக்ஷணங்கள்',disease_treatment:'சிகிச்சை',disease_prevention:'தடுப்பு',disease_upload_another:'🔄 வேறொன்று',
    soil_nutrients:'📊 போஷகங்கள்',soil_score:'🎯 ஆரோக்கியம்',soil_analyze_btn:'🧪 பகுப்பாய்வு',soil_recs:'💡 பரிந்துரைகள்',
    settings_title:'⚙️ அமைப்புகள்',voice_auto:'🔊 ஆட்டோ',
  },
  te: {
    dash_weather:'వాతావరణం',dash_location:'ప్రదేశం',dash_ai:'AI స్థితి',dash_data:'లైవ్ డేటా',
    tab_advisor:'పంట',tab_disease:'వ్యాధి',tab_soil:'నేల',tab_yield:'దిగుబడి',tab_market:'ధరలు',tab_weather:'వాతావరణం',tab_advisory:'సలహాలు',
    advisor_title:'AI పంట సలహాదారు',advisor_desc:'నేల & వాతావరణ డేటా నుండి AI సిఫార్సులు',
    live_btn:'📡 లైవ్ డేటా పొందండి',soil_title:'🧪 నేల పారామితులు',
    ai_rec_title:'🤖 AI సిఫార్సులు',ai_rec_btn:'🔍 సిఫార్సులు పొందండి',
    disease_title:'🔬 AI వ్యాధి గుర్తింపు',upload_title:'ఆకు చిత్రం అప్‌లోడ్',
    soil_tab_title:'🧪 నేల విశ్లేషణ',yield_tab_title:'📊 దిగుబడి అంచనా',yield_select_crop:'🌾 పంట ఎంపిక',
    market_title:'💰 మార్కెట్ ధరలు',market_desc:'నిజమైన మండీ ధరలు',market_fetch_btn:'📡 ధరలు పొందండి',
    weather_tab_title:'⛅ 7 రోజుల అంచనా',weather_load_btn:'📡 అంచనా',
    advisory_tab_title:'📢 పంట సలహాలు',advisory_load_btn:'📡 సలహాలు',
    chat_title:'🤖 జీవన్‌మిత్ర AI',chat_welcome:'నమస్కారం! నేను జీవన్‌మిత్ర AI 🌿',
    qa_crop:'🌱 పంట?',qa_yield:'📊 దిగుబడి',qa_disease:'🔍 వ్యాధి',qa_price:'💰 ధరలు',
    voice_listening:'🎤 వింటోంది…',voice_not_supported:'❌ వాయిస్ లేదు',lang_changed:'భాష మార్చారు',
    weather_loaded:'✅ వాతావరణం!',market_loaded:'✅ ధరలు!',soil_empty:'డేటా నమోదు చేయండి',live_temp:'ఉష్ణోగ్రత',live_hum:'తేమ',live_rain:'వర్షం',live_loc:'ప్రదేశం',
    market_fetching:'📡 ధరలు పొందుతోంది…',weather_today:'ఈ రోజు',weather_low:'తక్కువ:',
    yield_per_ha:'దిగుబడి/హె',yield_total:'మొత్తం',yield_price:'ధర',yield_confidence:'AI నమ్మకం',yield_empty:'పంట ఎంచుకోండి',
    disease_symptoms:'లక్షణాలు',disease_treatment:'చికిత్స',disease_prevention:'నివారణ',disease_upload_another:'🔄 మరొకటి',
    soil_nutrients:'📊 పోషకాలు',soil_score:'🎯 ఆరోగ్యం',soil_analyze_btn:'🧪 విశ్లేషణ',soil_recs:'💡 సిఫార్సులు',
    settings_title:'⚙️ సెట్టింగ్స్',voice_auto:'🔊 ఆటో',
  }
};

function t(k) { return i18n[currentLanguage]?.[k] || i18n.en[k] || k; }

function applyTranslations() {
  // Only update elements with data-i18n that are NOT dynamic dashboard values
  // Dynamic IDs (weatherStatus, locationStatus, aiStatus, dataStatus) are set by JS — skip them
  const skipIds = new Set(['weatherStatus','locationStatus','aiStatus','dataStatus','welcome-message']);
  document.querySelectorAll('[data-i18n]').forEach(el => {
    if (el.id && skipIds.has(el.id)) return; // Skip dynamic elements
    el.textContent = t(el.getAttribute('data-i18n'));
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    el.placeholder = t(el.getAttribute('data-i18n-placeholder'));
  });
}

function changeLanguage(lang) {
  currentLanguage = lang;
  saveLanguage(lang);
  applyTranslations();
  if (typeof loadMarketPrices === 'function') loadMarketPrices();
  if (typeof updateYieldPredictor === 'function') updateYieldPredictor();
  if (typeof analyzeSoil === 'function') analyzeSoil();
  if (typeof populateYieldCropSelect === 'function') populateYieldCropSelect();
  showToast(t('lang_changed'), 'info');
}
