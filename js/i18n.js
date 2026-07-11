let currentLanguage = 'en';

// BCP-47 tags used for speech recognition / speech synthesis. Filled in with
// good defaults for common languages; extended automatically at runtime for
// any language the user adds (see ensureLanguagePack below).
const langBcp47 = {
  en:'en-IN', kn:'kn-IN', hi:'hi-IN', ml:'ml-IN', ta:'ta-IN', te:'te-IN',
  bn:'bn-IN', mr:'mr-IN', gu:'gu-IN', pa:'pa-IN', or:'or-IN', as:'as-IN', ur:'ur-IN',
  es:'es-ES', fr:'fr-FR', de:'de-DE', ar:'ar-SA', zh:'zh-CN', ja:'ja-JP',
  pt:'pt-PT', ru:'ru-RU', it:'it-IT', ko:'ko-KR', nl:'nl-NL', sw:'sw-KE'
};

// Maps the full language *names* that Whisper's verbose_json returns
// (e.g. "hindi", "kannada") back to our short codes, so voice input in any
// spoken language can drive the right UI language / voice reply.
const whisperNameToCode = {
  english:'en', kannada:'kn', hindi:'hi', malayalam:'ml', tamil:'ta', telugu:'te',
  bengali:'bn', marathi:'mr', gujarati:'gu', punjabi:'pa', odia:'or', oriya:'or',
  assamese:'as', urdu:'ur', spanish:'es', french:'fr', german:'de', arabic:'ar',
  chinese:'zh', japanese:'ja', portuguese:'pt', russian:'ru', italian:'it',
  korean:'ko', dutch:'nl', swahili:'sw'
};

function bcp47For(code) { return langBcp47[code] || `${code}-IN`; }

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
    market_fetching:'📡 Fetching live mandi prices…',market_live:'🤖 AI-estimated from recent mandi trends',market_fallback:'⚠️ Reference prices — AI estimate unavailable',
    weather_tab_title:'7-Day Forecast',weather_tab_desc:'Agricultural weather outlook for your area',weather_load_btn:'📡 Load Forecast',weather_today:'Today',weather_low:'Low:',
    advisory_tab_title:'Crop Advisories',advisory_tab_desc:'Real-time farming alerts & seasonal guidance',advisory_load_btn:'📡 Load Advisories',
    chat_title:'🤖 JeevanMitra AI',chat_welcome:"Hello! I'm JeevanMitra AI — your smart farming companion. Ask about crops, diseases, yield or prices — type or speak in any language! 🌿",
    chat_placeholder:'Ask about farming…',qa_crop:'🌱 Best crop?',qa_yield:'📊 Yield',qa_disease:'🔍 Disease',qa_price:'💰 Prices',
    voice_listening:'🎤 Listening…',voice_not_supported:'❌ Voice not supported',voice_speaking:'🔊 Speaking…',voice_transcribing:'🤖 Transcribing…',
    settings_title:'⚙️ Settings',settings_location:'📍 Location',settings_refresh:'🔄 Refresh',settings_api_key:'🔑 Groq API Key',
    settings_save:'Save Key',settings_clear:'Clear Key',settings_test:'🔌 Test Key',settings_data:'💾 Data',settings_clear_cache:'Clear Cache',settings_export:'📥 Export',
    settings_api_hint:'Free key at',lang_changed:'Language changed',lang_translating:'🌐 Translating dashboard with AI…',
    lang_add_placeholder:'Type any language (e.g. Bengali, Swahili)…',lang_add_btn:'➕ Add language',
    weather_loaded:'✅ Weather data loaded!',market_loaded:'✅ Market prices loaded!',ai_analysis:'🤖 AI Analysis',voice_auto:'🔊 Auto Voice',
    soil_empty:'Enter soil data and click Get',soil_ai_title:'🤖 AI Soil Insights',
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
    disease_title:'🔬 AI രോഗ
