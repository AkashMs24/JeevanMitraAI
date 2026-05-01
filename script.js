// ==========================================================
// JeevanMitra AI — Upgraded from KrishiAI
// Changes: Rebranded, 20+ crops, soil type filter, irrigation
//          level, crop calendar tab, bacterial spot disease,
//          sort market table, bug fixes throughout
// ==========================================================

let currentLanguage = 'en';
let isChatVisible = true;
let marketPrices = {};

// ==========================================================
// TRANSLATIONS
// ==========================================================
const i18n = {
    en: {
        tab_crop:"Crop Recommendation",tab_yield:"Yield Prediction",tab_disease:"Disease Detection",
        tab_market:"Market Prices",tab_calendar:"Crop Calendar",
        soil_data:"Soil & Environment Data",auto_weather:"Auto-fill Weather",nitrogen:"Nitrogen (N)",
        phosphorus:"Phosphorus (P)",potassium:"Potassium (K)",temperature:"Temperature",humidity:"Humidity",
        ph:"Soil pH",rainfall:"Rainfall",soil_type:"Soil Type",
        get_recommendations:"Get Recommendations",recommendations:"Recommendations",
        enter_data_prompt:'Enter soil data and click "Get Recommendations"',
        yield_input:"Yield Prediction Input",select_crop:"Select Crop",predict_yield:"Predict Yield",
        yield_results:"Yield Prediction Results",enter_yield_prompt:'Set parameters to see yield estimate',
        upload_leaf:"Upload Leaf Image",click_upload:"Click to upload or drag & drop",detect_disease:"Detect Disease",
        quick_demo:"Quick Demo",diagnosis:"Diagnosis Results",
        upload_prompt:'Upload an image and click "Detect Disease"',
        market_prices:"Current Market Prices",last_updated:"Last updated",crop_col:"Crop",
        price_col:"Price (₹/quintal)",market_col:"Market",trend_col:"Trend",price_chart:"Price Chart",
        chat_welcome:"Hello! I'm JeevanMitra AI, your smart farming companion. Ask me anything! 🌿",
        qa_crop:"🌱 Best crop?",qa_yield:"📊 Predict yield",qa_disease:"🔍 Plant disease",qa_price:"💰 Market prices",
        voice_listening:"🎤 Listening... Speak now!",voice_not_supported:"❌ Voice not supported in this browser",
        weather_filled:"🌤️ Weather data auto-filled!",lang_changed:"Language changed to English",
        top_crops:"🏆 Top 5 Recommended Crops",expected_yield:"Expected Yield",tons_per_hectare:"tons/hectare",
        optimization_tips:"💡 Optimization Tips",prevention_tips:"🛡️ Prevention Tips",diagnosis_result:"Diagnosis",
        healthy_plant:"Healthy Plant",no_treatment:"No treatment needed. Continue regular care.",
        leaf_blight:"Leaf Blight",leaf_blight_solution:"Apply copper-based fungicide. Remove infected leaves.",
        rust_disease:"Rust Disease",rust_solution:"Apply sulfur-based fungicide. Improve air circulation.",
        powdery_mildew:"Powdery Mildew",mildew_solution:"Apply neem oil spray. Increase plant spacing.",
        bacterial_spot:"Bacterial Spot",bacterial_spot_solution:"Apply copper bactericide. Avoid overhead irrigation.",
        why_recommendation:"🧠 Why this recommendation?"
    },
    ml: {
        tab_crop:"വിള ശുപാർശ",tab_yield:"വിളവ് പ്രവചനം",tab_disease:"രോഗ നിർണയം",
        tab_market:"വിപണി വിലകൾ",tab_calendar:"കൃഷി കലണ്ടർ",
        soil_data:"മണ്ണിന്റെ വിവരങ്ങൾ",auto_weather:"കാലാവസ്ഥ സ്വയം പൂരിപ്പിക്കുക",
        nitrogen:"നൈട്രജൻ (N)",phosphorus:"ഫോസ്ഫറസ് (P)",potassium:"പൊട്ടാസ്യം (K)",temperature:"താപനില",
        humidity:"ഈർപ്പം",ph:"മണ്ണിന്റെ pH",rainfall:"മഴ",soil_type:"മണ്ണ് തരം",
        get_recommendations:"ശുപാർശകൾ നേടുക",recommendations:"ശുപാർശകൾ",
        enter_data_prompt:'മണ്ണ് ഡേറ്റ നൽകി ക്ലിക്ക് ചെയ്യുക',
        yield_input:"വിളവ് പ്രവചന ഇൻപുട്ട്",select_crop:"വിള തിരഞ്ഞെടുക്കുക",predict_yield:"വിളവ് പ്രവചിക്കുക",
        yield_results:"വിളവ് ഫലങ്ങൾ",enter_yield_prompt:'പാരാമീറ്ററുകൾ ക്രമീകരിക്കുക',
        upload_leaf:"ഇലയുടെ ചിത്രം അപ്ലോഡ് ചെയ്യുക",click_upload:"ക്ലിക്ക് ചെയ്ത് അപ്ലോഡ് ചെയ്യുക",
        detect_disease:"രോഗം കണ്ടെത്തുക",quick_demo:"ദ്രുത ഡെമോ",diagnosis:"രോഗനിർണ്ണയ ഫലങ്ങൾ",
        upload_prompt:'ചിത്രം അപ്ലോഡ് ചെയ്ത് ക്ലിക്ക് ചെയ്യുക',
        market_prices:"നിലവിലെ വിപണി വിലകൾ",last_updated:"അവസാന അപ്ഡേറ്റ്",
        crop_col:"വിള",price_col:"വില (₹/ക്വിന്റൽ)",market_col:"വിപണി",trend_col:"പ്രവണത",price_chart:"വില ചാർട്ട്",
        chat_welcome:"നമസ്കാരം! ഞാൻ ജീവൻമിത്ര AI. ചോദിക്കൂ! 🌿",
        qa_crop:"🌱 ഏറ്റവും നല്ല വിള?",qa_yield:"📊 വിളവ് പ്രവചനം",qa_disease:"🔍 ചെടിരോഗം",qa_price:"💰 വിപണി വില",
        voice_listening:"🎤 ശ്രദ്ധിക്കുന്നു...",voice_not_supported:"❌ ശബ്ദ ഇൻപുട്ട് ഇല്ല",
        weather_filled:"🌤️ കാലാവസ്ഥ പൂരിപ്പിച്ചു!",lang_changed:"ഭാഷ മലയാളം",
        top_crops:"🏆 ഏറ്റവും നല്ല 5 വിളകൾ",expected_yield:"പ്രതീക്ഷിക്കുന്ന വിളവ്",tons_per_hectare:"ടൺ/ഹെക്ടർ",
        optimization_tips:"💡 മെച്ചപ്പെടുത്തൽ",prevention_tips:"🛡️ പ്രതിരോധം",diagnosis_result:"രോഗനിർണ്ണയം",
        healthy_plant:"ആരോഗ്യമുള്ള ചെടി",no_treatment:"ചികിത്സ ആവശ്യമില്ല.",
        leaf_blight:"ഇല പുള്ളി",leaf_blight_solution:"കോപ്പർ കുമിൾനാശിനി പ്രയോഗിക്കുക.",
        rust_disease:"തുരുമ്പ് രോഗം",rust_solution:"സൾഫർ കുമിൾനാശിനി പ്രയോഗിക്കുക.",
        powdery_mildew:"പൂപ്പൽ",mildew_solution:"വേപ്പെണ്ണ തളിക്കുക.",
        bacterial_spot:"ബാക്ടീരിയ",bacterial_spot_solution:"കോപ്പർ ബാക്ടീരിസൈഡ് പ്രയോഗിക്കുക.",
        why_recommendation:"🧠 ഈ ശുപാർശ എന്തുകൊണ്ട്?"
    },
    hi: {
        tab_crop:"फसल अनुशंसा",tab_yield:"उपज पूर्वानुमान",tab_disease:"रोग पहचान",
        tab_market:"बाजार मूल्य",tab_calendar:"कृषि कैलेंडर",
        soil_data:"मिट्टी और पर्यावरण डेटा",auto_weather:"मौसम स्वतः भरें",nitrogen:"नाइट्रोजन (N)",
        phosphorus:"फॉस्फोरस (P)",potassium:"पोटेशियम (K)",temperature:"तापमान",humidity:"आर्द्रता",
        ph:"मिट्टी pH",rainfall:"वर्षा",soil_type:"मिट्टी प्रकार",
        get_recommendations:"अनुशंसाएं प्राप्त करें",recommendations:"अनुशंसाएं",
        enter_data_prompt:'मिट्टी का डेटा दर्ज करें और क्लिक करें',
        yield_input:"उपज पूर्वानुमान इनपुट",select_crop:"फसल चुनें",predict_yield:"उपज अनुमान",
        yield_results:"उपज परिणाम",enter_yield_prompt:'पैरामीटर दर्ज करें',
        upload_leaf:"पत्ते की छवि अपलोड करें",click_upload:"अपलोड के लिए क्लिक करें",
        detect_disease:"रोग पहचानें",quick_demo:"त्वरित डेमो",diagnosis:"निदान परिणाम",
        upload_prompt:'छवि अपलोड करें',market_prices:"वर्तमान बाजार मूल्य",last_updated:"अंतिम अपडेट",
        crop_col:"फसल",price_col:"मूल्य (₹/क्विंटल)",market_col:"बाजार",trend_col:"रुझान",price_chart:"मूल्य चार्ट",
        chat_welcome:"नमस्ते! मैं जीवनमित्र AI हूं। पूछिए! 🌿",
        qa_crop:"🌱 सबसे अच्छी फसल?",qa_yield:"📊 उपज अनुमान",qa_disease:"🔍 पौधे की बीमारी",qa_price:"💰 बाजार मूल्य",
        voice_listening:"🎤 सुन रहा हूं...",voice_not_supported:"❌ वॉइस उपलब्ध नहीं",
        weather_filled:"🌤️ मौसम डेटा भरा!",lang_changed:"भाषा हिंदी",
        top_crops:"🏆 शीर्ष 5 अनुशंसित फसलें",expected_yield:"अपेक्षित उपज",tons_per_hectare:"टन/हेक्टेयर",
        optimization_tips:"💡 सुधार सुझाव",prevention_tips:"🛡️ रोकथाम",diagnosis_result:"निदान",
        healthy_plant:"स्वस्थ पौधा",no_treatment:"कोई उपचार आवश्यक नहीं।",
        leaf_blight:"पत्ती झुलसा",leaf_blight_solution:"कॉपर कवकनाशी लगाएं।",
        rust_disease:"रतुआ",rust_solution:"सल्फर कवकनाशी लगाएं।",
        powdery_mildew:"भभूतिया",mildew_solution:"नीम तेल लगाएं।",
        bacterial_spot:"जीवाणु धब्बा",bacterial_spot_solution:"कॉपर बैक्टीरिसाइड लगाएं।",
        why_recommendation:"🧠 यह अनुशंसा क्यों?"
    },
    kn: {
        tab_crop:"ಬೆಳೆ ಶಿಫಾರಸು",tab_yield:"ಇಳುವರಿ ಭವಿಷ್ಯ",tab_disease:"ರೋಗ ಪತ್ತೆ",
        tab_market:"ಮಾರುಕಟ್ಟೆ ಬೆಲೆ",tab_calendar:"ಕೃಷಿ ಕ್ಯಾಲೆಂಡರ್",
        soil_data:"ಮಣ್ಣು ಮತ್ತು ಪರಿಸರ ಡೇಟಾ",auto_weather:"ಹವಾಮಾನ ಭರ್ತಿ",nitrogen:"ನೈಟ್ರೋಜನ್ (N)",
        phosphorus:"ಫಾಸ್ಫರಸ್ (P)",potassium:"ಪೊಟ್ಯಾಸಿಯಮ್ (K)",temperature:"ತಾಪಮಾನ",humidity:"ಆರ್ದ್ರತೆ",
        ph:"ಮಣ್ಣಿನ pH",rainfall:"ಮಳೆ",soil_type:"ಮಣ್ಣಿನ ಪ್ರಕಾರ",
        get_recommendations:"ಶಿಫಾರಸುಗಳನ್ನು ಪಡೆಯಿರಿ",recommendations:"ಶಿಫಾರಸುಗಳು",
        enter_data_prompt:'ಮಣ್ಣಿನ ಡೇಟಾ ನಮೂದಿಸಿ ಕ್ಲಿಕ್ ಮಾಡಿ',
        yield_input:"ಇಳುವರಿ ಇನ್‌ಪುಟ್",select_crop:"ಬೆಳೆ ಆಯ್ಕೆ",predict_yield:"ಇಳುವರಿ ಊಹಿಸಿ",
        yield_results:"ಇಳುವರಿ ಫಲಿತಾಂಶ",enter_yield_prompt:'ಪ್ಯಾರಾಮೀಟರ್ ನಮೂದಿಸಿ',
        upload_leaf:"ಎಲೆ ಚಿತ್ರ ಅಪ್‌ಲೋಡ್",click_upload:"ಕ್ಲಿಕ್ ಮಾಡಿ ಅಪ್‌ಲೋಡ್",
        detect_disease:"ರೋಗ ಪತ್ತೆ",quick_demo:"ಡೆಮೊ",diagnosis:"ರೋಗನಿರ್ಣಯ",
        upload_prompt:'ಚಿತ್ರ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ',market_prices:"ಮಾರುಕಟ್ಟೆ ಬೆಲೆಗಳು",last_updated:"ನವೀಕರಿಸಲಾಗಿದೆ",
        crop_col:"ಬೆಳೆ",price_col:"ಬೆಲೆ (₹/ಕ್ವಿಂಟಾಲ್)",market_col:"ಮಾರುಕಟ್ಟೆ",trend_col:"ಪ್ರವೃತ್ತಿ",price_chart:"ಬೆಲೆ ಚಾರ್ಟ್",
        chat_welcome:"ನಮಸ್ಕಾರ! ನಾನು ಜೀವನಮಿತ್ರ AI. 🌿",
        qa_crop:"🌱 ಅತ್ಯುತ್ತಮ ಬೆಳೆ?",qa_yield:"📊 ಇಳುವರಿ",qa_disease:"🔍 ರೋಗ",qa_price:"💰 ಬೆಲೆ",
        voice_listening:"🎤 ಆಲಿಸುತ್ತಿದೆ...",voice_not_supported:"❌ ಧ್ವನಿ ಇಲ್ಲ",
        weather_filled:"🌤️ ಹವಾಮಾನ ಭರ್ತಿ!",lang_changed:"ಭಾಷೆ ಕನ್ನಡ",
        top_crops:"🏆 ಟಾಪ್ 5 ಬೆಳೆಗಳು",expected_yield:"ನಿರೀಕ್ಷಿತ ಇಳುವರಿ",tons_per_hectare:"ಟನ್/ಹೆಕ್ಟೇರ್",
        optimization_tips:"💡 ಸುಧಾರಣೆ",prevention_tips:"🛡️ ತಡೆಗಟ್ಟುವಿಕೆ",diagnosis_result:"ರೋಗನಿರ್ಣಯ",
        healthy_plant:"ಆರೋಗ್ಯಕರ",no_treatment:"ಚಿಕಿತ್ಸೆ ಬೇಡ.",
        leaf_blight:"ಎಲೆ ಮಚ್ಚೆ",leaf_blight_solution:"ತಾಮ್ರ ಶಿಲೀಂಧ್ರನಾಶಕ.",
        rust_disease:"ತುಕ್ಕು",rust_solution:"ಸಲ್ಫರ್ ಶಿಲೀಂಧ್ರನಾಶಕ.",
        powdery_mildew:"ಬೂಷ್ಟು",mildew_solution:"ಬೇವಿನ ಎಣ್ಣೆ.",
        bacterial_spot:"ಬ್ಯಾಕ್ಟೀರಿಯಾ ಮಚ್ಚೆ",bacterial_spot_solution:"ತಾಮ್ರ ಬ್ಯಾಕ್ಟೀರಿಸೈಡ್.",
        why_recommendation:"🧠 ಈ ಶಿಫಾರಸು ಏಕೆ?"
    },
    ta: {
        tab_crop:"பயிர் பரிந்துரை",tab_yield:"விளைச்சல் கணிப்பு",tab_disease:"நோய் கண்டறிதல்",
        tab_market:"சந்தை விலைகள்",tab_calendar:"பயிர் காலண்டர்",
        soil_data:"மண் மற்றும் சுற்றுச்சூழல்",auto_weather:"வானிலை நிரப்பு",nitrogen:"நைட்ரஜன் (N)",
        phosphorus:"பாஸ்பரஸ் (P)",potassium:"பொட்டாசியம் (K)",temperature:"வெப்பநிலை",humidity:"ஈரப்பதம்",
        ph:"மண் pH",rainfall:"மழை",soil_type:"மண் வகை",
        get_recommendations:"பரிந்துரை பெறு",recommendations:"பரிந்துரைகள்",
        enter_data_prompt:'மண் தரவை உள்ளிட்டு கிளிக் செய்க',
        yield_input:"விளைச்சல் உள்ளீடு",select_crop:"பயிர் தேர்ந்தெடு",predict_yield:"விளைச்சல் கணி",
        yield_results:"விளைச்சல் முடிவுகள்",enter_yield_prompt:'அளவுருக்களை அமைக்கவும்',
        upload_leaf:"இலை படம் பதிவேற்று",click_upload:"பதிவேற்ற கிளிக்",
        detect_disease:"நோயை கண்டறி",quick_demo:"விரைவு டெமோ",diagnosis:"நோயறிதல்",
        upload_prompt:'படம் பதிவேற்றி கிளிக் செய்க',
        market_prices:"சந்தை விலைகள்",last_updated:"புதுப்பிக்கப்பட்டது",
        crop_col:"பயிர்",price_col:"விலை (₹/குவிண்டால்)",market_col:"சந்தை",trend_col:"போக்கு",price_chart:"விலை விளக்கம்",
        chat_welcome:"வணக்கம்! நான் ஜீவன்மித்ரா AI. 🌿",
        qa_crop:"🌱 சிறந்த பயிர்?",qa_yield:"📊 விளைச்சல்",qa_disease:"🔍 நோய்",qa_price:"💰 விலை",
        voice_listening:"🎤 கேட்கிறேன்...",voice_not_supported:"❌ குரல் இல்லை",
        weather_filled:"🌤️ வானிலை நிரப்பப்பட்டது!",lang_changed:"மொழி தமிழ்",
        top_crops:"🏆 முதல் 5 பயிர்கள்",expected_yield:"விளைச்சல்",tons_per_hectare:"டன்/ஹெக்.",
        optimization_tips:"💡 மேம்படுத்தல்",prevention_tips:"🛡️ தடுப்பு",diagnosis_result:"நோயறிதல்",
        healthy_plant:"ஆரோக்கியம்",no_treatment:"சிகிச்சை தேவையில்லை.",
        leaf_blight:"இலை கருகல்",leaf_blight_solution:"தாமிர பூஞ்சைக்கொல்லி.",
        rust_disease:"துரு நோய்",rust_solution:"கந்தகம் பூஞ்சைக்கொல்லி.",
        powdery_mildew:"வெண்பூஞ்சை",mildew_solution:"வேப்ப எண்ணெய்.",
        bacterial_spot:"பாக்டீரியா",bacterial_spot_solution:"தாமிர பாக்டீரிசைடு.",
        why_recommendation:"🧠 ஏன் இந்த பரிந்துரை?"
    },
    te: {
        tab_crop:"పంట సిఫార్సు",tab_yield:"దిగుబడి అంచనా",tab_disease:"వ్యాధి గుర్తింపు",
        tab_market:"మార్కెట్ ధరలు",tab_calendar:"పంట క్యాలెండర్",
        soil_data:"నేల & పర్యావరణ డేటా",auto_weather:"వాతావరణం నింపు",nitrogen:"నత్రజని (N)",
        phosphorus:"భాస్వరం (P)",potassium:"పొటాషియం (K)",temperature:"ఉష్ణోగ్రత",humidity:"తేమ",
        ph:"నేల pH",rainfall:"వర్షపాతం",soil_type:"నేల రకం",
        get_recommendations:"సిఫార్సులు పొందండి",recommendations:"సిఫార్సులు",
        enter_data_prompt:'నేల డేటా నమోదు చేసి క్లిక్ చేయండి',
        yield_input:"దిగుబడి ఇన్‌పుట్",select_crop:"పంట ఎంచుకోండి",predict_yield:"దిగుబడి అంచనా",
        yield_results:"దిగుబడి ఫలితాలు",enter_yield_prompt:'పారామీటర్లు నమోదు చేయండి',
        upload_leaf:"ఆకు చిత్రం అప్‌లోడ్",click_upload:"అప్‌లోడ్ చేయడానికి క్లిక్",
        detect_disease:"వ్యాధి గుర్తించండి",quick_demo:"డెమో",diagnosis:"రోగనిర్ణయం",
        upload_prompt:'చిత్రం అప్‌లోడ్ చేయండి',
        market_prices:"మార్కెట్ ధరలు",last_updated:"నవీకరించబడింది",
        crop_col:"పంట",price_col:"ధర (₹/క్వింటాల్)",market_col:"మార్కెట్",trend_col:"ట్రెండ్",price_chart:"ధర చార్ట్",
        chat_welcome:"నమస్కారం! నేను జీవన్‌మిత్ర AI. 🌿",
        qa_crop:"🌱 ఉత్తమ పంట?",qa_yield:"📊 దిగుబడి",qa_disease:"🔍 వ్యాధి",qa_price:"💰 ధరలు",
        voice_listening:"🎤 వింటున్నాను...",voice_not_supported:"❌ వాయిస్ లేదు",
        weather_filled:"🌤️ వాతావరణ డేటా!",lang_changed:"భాష తెలుగు",
        top_crops:"🏆 అగ్ర 5 పంటలు",expected_yield:"అంచనా దిగుబడి",tons_per_hectare:"టన్/హెక్.",
        optimization_tips:"💡 మెరుగుదల",prevention_tips:"🛡️ నివారణ",diagnosis_result:"రోగనిర్ణయం",
        healthy_plant:"ఆరోగ్యకరమైన",no_treatment:"చికిత్స అవసరం లేదు.",
        leaf_blight:"ఆకు తెగులు",leaf_blight_solution:"రాగి-ఆధారిత శిలీంధ్రనాశకం.",
        rust_disease:"తుప్పు",rust_solution:"సల్ఫర్ శిలీంధ్రనాశకం.",
        powdery_mildew:"పొడి బూజు",mildew_solution:"వేప నూనె.",
        bacterial_spot:"బాక్టీరియా మచ్చ",bacterial_spot_solution:"రాగి బాక్టీరిసైడ్.",
        why_recommendation:"🧠 ఈ సిఫార్సు ఎందుకు?"
    }
};

// ==========================================================
// CROP DATABASE — 20 crops with [idealMin, idealMax, absMin, absMax]
// N, P, K in kg/ha; temp °C; hum %; ph; rain mm
// Added: soilTypes (preferred), seasons
// ==========================================================
const CROP_DB = {
    rice:       { N:[60,120,20,140], P:[30,60,10,80],  K:[30,60,10,80],  temp:[20,30,18,36], hum:[70,100,60,100], ph:[5.5,7.0,5.0,7.5], rain:[150,300,100,350],  emoji:'🌾', market:2200, marketLoc:'Kochi',      trend:'up',    soilTypes:['alluvial','black'],   seasons:['Kharif'] },
    wheat:      { N:[60,120,20,140], P:[30,60,10,80],  K:[30,60,10,80],  temp:[10,22,5,26],  hum:[30,60,25,70],  ph:[6.0,7.5,5.5,8.0], rain:[50,120,30,150],   emoji:'🌿', market:2150, marketLoc:'Delhi',       trend:'stable',soilTypes:['alluvial','sandy'],   seasons:['Rabi'] },
    maize:      { N:[80,120,40,140], P:[40,70,20,90],  K:[40,70,20,90],  temp:[18,27,15,35], hum:[50,70,40,80],  ph:[5.8,7.0,5.5,7.5], rain:[80,120,60,150],   emoji:'🌽', market:1900, marketLoc:'Mumbai',      trend:'up',    soilTypes:['alluvial','red'],     seasons:['Kharif','Rabi'] },
    cotton:     { N:[60,100,30,130], P:[30,60,15,80],  K:[40,80,20,100], temp:[25,35,20,40], hum:[40,60,30,70],  ph:[6.0,8.0,5.5,8.5], rain:[60,100,40,120],   emoji:'🪴', market:6500, marketLoc:'Ahmedabad',   trend:'up',    soilTypes:['black'],             seasons:['Kharif'] },
    sugarcane:  { N:[80,130,50,140], P:[40,70,20,90],  K:[80,140,50,160],temp:[20,30,18,38], hum:[50,80,40,90],  ph:[5.5,7.5,5.0,8.0], rain:[100,200,80,250],  emoji:'🌱', market:350,  marketLoc:'Pune',        trend:'stable',soilTypes:['alluvial','black'],   seasons:['Year-round'] },
    millet:     { N:[20,60,5,90],    P:[20,50,10,70],  K:[20,50,10,70],  temp:[27,35,22,42], hum:[30,55,20,65],  ph:[6.0,7.5,5.5,8.0], rain:[30,80,20,100],    emoji:'🌾', market:2800, marketLoc:'Bangalore',   trend:'up',    soilTypes:['sandy','red'],       seasons:['Kharif'] },
    banana:     { N:[80,130,50,140], P:[30,60,15,80],  K:[80,140,50,160],temp:[22,30,18,38], hum:[70,90,60,100], ph:[5.5,7.0,5.0,7.5], rain:[120,200,80,250],  emoji:'🍌', market:2500, marketLoc:'Trivandrum',  trend:'up',    soilTypes:['alluvial','hilly'],  seasons:['Year-round'] },
    potato:     { N:[60,120,30,140], P:[50,90,30,110], K:[60,100,40,120],temp:[15,22,10,28], hum:[50,80,40,90],  ph:[4.5,6.5,4.0,7.0], rain:[60,120,40,150],   emoji:'🥔', market:1800, marketLoc:'Kolkata',     trend:'stable',soilTypes:['alluvial','sandy'],   seasons:['Rabi'] },
    groundnut:  { N:[10,40,5,60],    P:[40,80,20,100], K:[30,60,15,80],  temp:[25,35,20,40], hum:[40,60,30,75],  ph:[5.5,7.0,5.0,7.5], rain:[50,100,30,120],   emoji:'🥜', market:5500, marketLoc:'Chennai',     trend:'up',    soilTypes:['red','sandy'],       seasons:['Kharif','Rabi'] },
    tomato:     { N:[70,120,40,140], P:[50,90,30,110], K:[60,100,40,120],temp:[18,27,15,32], hum:[50,75,40,85],  ph:[5.5,7.0,5.0,7.5], rain:[60,150,40,200],   emoji:'🍅', market:1500, marketLoc:'Nasik',       trend:'up',    soilTypes:['alluvial','red'],     seasons:['Rabi','Summer'] },
    onion:      { N:[50,100,20,120], P:[40,80,20,100], K:[50,100,30,120],temp:[13,24,10,30], hum:[40,70,30,80],  ph:[5.8,7.0,5.5,7.5], rain:[50,120,30,150],   emoji:'🧅', market:2000, marketLoc:'Lasalgaon',   trend:'stable',soilTypes:['alluvial','sandy'],   seasons:['Rabi','Kharif'] },
    soybean:    { N:[10,30,5,50],    P:[40,80,20,100], K:[30,60,15,80],  temp:[20,30,15,35], hum:[50,75,40,85],  ph:[6.0,7.0,5.5,7.5], rain:[60,150,40,200],   emoji:'🫘', market:4200, marketLoc:'Indore',      trend:'up',    soilTypes:['alluvial','black'],   seasons:['Kharif'] },
    chickpea:   { N:[10,40,5,60],    P:[40,80,20,100], K:[20,50,10,70],  temp:[20,30,15,35], hum:[30,60,20,70],  ph:[5.5,7.5,5.0,8.0], rain:[40,100,25,130],   emoji:'🫛', market:5000, marketLoc:'Jaipur',      trend:'stable',soilTypes:['black','sandy'],      seasons:['Rabi'] },
    jowar:      { N:[30,80,10,100],  P:[20,50,10,70],  K:[20,50,10,70],  temp:[25,35,20,42], hum:[25,55,15,65],  ph:[6.0,7.5,5.5,8.0], rain:[30,100,20,130],   emoji:'🌾', market:2600, marketLoc:'Solapur',     trend:'stable',soilTypes:['black','red'],        seasons:['Kharif','Rabi'] },
    mustard:    { N:[40,80,20,100],  P:[30,60,15,80],  K:[20,50,10,70],  temp:[10,20,5,25],  hum:[30,60,20,70],  ph:[6.0,7.5,5.5,8.0], rain:[30,80,20,100],    emoji:'🌻', market:5200, marketLoc:'Jaipur',      trend:'up',    soilTypes:['alluvial','sandy'],   seasons:['Rabi'] },
    turmeric:   { N:[60,120,30,140], P:[40,70,20,90],  K:[60,120,30,140],temp:[20,30,18,35], hum:[60,90,50,100], ph:[4.5,7.0,4.0,7.5], rain:[120,250,80,300],  emoji:'🟡', market:8000, marketLoc:'Erode',       trend:'up',    soilTypes:['red','hilly'],        seasons:['Kharif'] },
    ginger:     { N:[50,100,20,120], P:[40,80,20,100], K:[80,140,50,160],temp:[20,30,18,35], hum:[60,90,50,100], ph:[5.5,7.0,5.0,7.5], rain:[120,250,80,300],  emoji:'🫚', market:10000,marketLoc:'Cochin',      trend:'up',    soilTypes:['red','hilly'],        seasons:['Kharif'] },
    coconut:    { N:[40,80,20,100],  P:[30,60,15,80],  K:[80,160,50,200],temp:[27,35,22,40], hum:[70,95,60,100], ph:[5.5,7.5,5.0,8.0], rain:[150,300,100,350], emoji:'🥥', market:2000, marketLoc:'Trivandrum',  trend:'stable',soilTypes:['sandy','hilly'],      seasons:['Year-round'] },
    mango:      { N:[40,80,20,100],  P:[30,60,15,80],  K:[40,80,20,100], temp:[24,30,20,40], hum:[40,70,30,80],  ph:[5.5,7.5,5.0,8.0], rain:[80,200,50,250],   emoji:'🥭', market:3500, marketLoc:'Ratnagiri',   trend:'up',    soilTypes:['alluvial','red'],     seasons:['Summer'] },
    papaya:     { N:[60,120,30,140], P:[40,80,20,100], K:[50,100,30,120],temp:[22,32,18,38], hum:[60,80,50,90],  ph:[5.5,7.0,5.0,7.5], rain:[100,200,70,250],  emoji:'🍈', market:1200, marketLoc:'Pune',        trend:'stable',soilTypes:['alluvial','sandy'],   seasons:['Year-round'] }
};

// Soil type bonus modifier (0-1 multiplier bonus)
const SOIL_BONUS = {
    rice:      { alluvial:0.1, black:0.05 },
    wheat:     { alluvial:0.1, sandy:0.05 },
    maize:     { alluvial:0.08, red:0.05 },
    cotton:    { black:0.15 },
    sugarcane: { alluvial:0.1, black:0.08 },
    millet:    { sandy:0.12, red:0.08 },
    banana:    { alluvial:0.1, hilly:0.05 },
    potato:    { alluvial:0.1, sandy:0.08 },
    groundnut: { red:0.1, sandy:0.1 },
    tomato:    { alluvial:0.08, red:0.05 },
    onion:     { alluvial:0.08, sandy:0.05 },
    soybean:   { alluvial:0.08, black:0.08 },
    chickpea:  { black:0.1, sandy:0.05 },
    jowar:     { black:0.1, red:0.08 },
    mustard:   { alluvial:0.1, sandy:0.08 },
    turmeric:  { red:0.1, hilly:0.08 },
    ginger:    { red:0.1, hilly:0.12 },
    coconut:   { sandy:0.1, hilly:0.05 },
    mango:     { alluvial:0.08, red:0.1 },
    papaya:    { alluvial:0.1, sandy:0.05 }
};

// ==========================================================
// SCORING ENGINE — Weighted multi-parameter Gaussian scoring
// ==========================================================
function scoreCropForInput(cropKey, inputs) {
    const db = CROP_DB[cropKey];
    // [paramName, inputVal, rangeArray, weight]
    const params = [
        ['N',    inputs.n,    db.N,    1.4],
        ['P',    inputs.p,    db.P,    0.9],
        ['K',    inputs.k,    db.K,    0.9],
        ['temp', inputs.temp, db.temp, 2.0],
        ['hum',  inputs.hum,  db.hum,  1.5],
        ['ph',   inputs.ph,   db.ph,   1.8],
        ['rain', inputs.rain, db.rain, 2.0]
    ];

    let totalWeight = 0, weightedScore = 0;
    const matchedFactors = [], missedFactors = [];

    params.forEach(([name, val, range, w]) => {
        const [iMin, iMax, aMin, aMax] = range;
        totalWeight += w;
        let score;
        if (val >= iMin && val <= iMax) {
            score = 100;
            matchedFactors.push(name);
        } else if (val < aMin || val > aMax) {
            score = 0;
            missedFactors.push(name);
        } else if (val < iMin) {
            score = ((val - aMin) / (iMin - aMin)) * 70;
        } else {
            score = 100 - ((val - iMax) / (aMax - iMax)) * 70;
        }
        weightedScore += score * w;
    });

    let finalScore = weightedScore / totalWeight;

    // Soil type bonus
    const soilType = document.getElementById('soil-type')?.value || 'any';
    if (soilType !== 'any' && SOIL_BONUS[cropKey]?.[soilType]) {
        finalScore = Math.min(100, finalScore + SOIL_BONUS[cropKey][soilType] * finalScore);
    }

    return { score: finalScore, matchedFactors, missedFactors };
}

function rankAllCrops(inputs) {
    return Object.keys(CROP_DB).map(key => {
        const result = scoreCropForInput(key, inputs);
        return { key, name: getCropName(key), ...result };
    }).sort((a,b) => b.score - a.score);
}

// ==========================================================
// CROP NAMES (multilingual)
// ==========================================================
const cropNames = {
    en: { rice:'Rice', wheat:'Wheat', maize:'Maize', cotton:'Cotton', sugarcane:'Sugarcane', millet:'Millet', banana:'Banana', potato:'Potato', groundnut:'Groundnut', tomato:'Tomato', onion:'Onion', soybean:'Soybean', chickpea:'Chickpea', jowar:'Jowar', mustard:'Mustard', turmeric:'Turmeric', ginger:'Ginger', coconut:'Coconut', mango:'Mango', papaya:'Papaya' },
    ml: { rice:'നെല്ല്', wheat:'ഗോതമ്പ്', maize:'ചോളം', cotton:'പരുത്തി', sugarcane:'കരിമ്പ്', millet:'തിന', banana:'വാഴ', potato:'ഉരുളക്കിഴങ്ങ്', groundnut:'നിലക്കടല', tomato:'തക്കാളി', onion:'ഉള്ളി', soybean:'സോയ', chickpea:'കടല', jowar:'ജോലാ', mustard:'കടുക്', turmeric:'മഞ്ഞൾ', ginger:'ഇഞ്ചി', coconut:'തേങ്ങ', mango:'മാങ്ങ', papaya:'പപ്പായ' },
    hi: { rice:'चावल', wheat:'गेहूं', maize:'मक्का', cotton:'कपास', sugarcane:'गन्ना', millet:'बाजरा', banana:'केला', potato:'आलू', groundnut:'मूंगफली', tomato:'टमाटर', onion:'प्याज', soybean:'सोयाबीन', chickpea:'चना', jowar:'ज्वार', mustard:'सरसों', turmeric:'हल्दी', ginger:'अदरक', coconut:'नारियल', mango:'आम', papaya:'पपीता' },
    kn: { rice:'ಭತ್ತ', wheat:'ಗೋಧಿ', maize:'ಮೆಕ್ಕೆಜೋಳ', cotton:'ಹತ್ತಿ', sugarcane:'ಕಬ್ಬು', millet:'ಸಜ್ಜೆ', banana:'ಬಾಳೆ', potato:'ಆಲೂಗಡ್ಡೆ', groundnut:'ನೆಲಗಡಲೆ', tomato:'ಟೊಮೆಟೊ', onion:'ಈರುಳ್ಳಿ', soybean:'ಸೋಯಾ', chickpea:'ಕಡಲೆ', jowar:'ಜೋಳ', mustard:'ಸಾಸಿವೆ', turmeric:'ಅರಿಷಿಣ', ginger:'ಶುಂಠಿ', coconut:'ತೆಂಗಿನ', mango:'ಮಾವು', papaya:'ಪಪಾಯ' },
    ta: { rice:'நெல்', wheat:'கோதுமை', maize:'மக்காச்சோளம்', cotton:'பருத்தி', sugarcane:'கரும்பு', millet:'கம்பு', banana:'வாழை', potato:'உருளை', groundnut:'நிலக்கடலை', tomato:'தக்காளி', onion:'வெங்காயம்', soybean:'சோயா', chickpea:'கொண்டைக்கடலை', jowar:'சோளம்', mustard:'கடுகு', turmeric:'மஞ்சள்', ginger:'இஞ்சி', coconut:'தேங்காய்', mango:'மாம்பழம்', papaya:'பப்பாளி' },
    te: { rice:'వరి', wheat:'గోధుమ', maize:'మొక్కజొన్న', cotton:'పత్తి', sugarcane:'చెరకు', millet:'జొన్న', banana:'అరటి', potato:'బంగాళాదుంప', groundnut:'వేరుశెనగ', tomato:'టొమాటో', onion:'ఉల్లిపాయ', soybean:'సోయాబీన్', chickpea:'శనగలు', jowar:'జొన్న', mustard:'ఆవాలు', turmeric:'పసుపు', ginger:'అల్లం', coconut:'కొబ్బరి', mango:'మామిడి', papaya:'బొప్పాయి' }
};

function getCropName(key) { return cropNames.en[key] || key; }
function getLocalCropName(key) { return cropNames[currentLanguage]?.[key] || cropNames.en[key] || key; }

function getInputs() {
    return {
        n:    parseFloat(document.getElementById('n').value),
        p:    parseFloat(document.getElementById('p').value),
        k:    parseFloat(document.getElementById('k').value),
        temp: parseFloat(document.getElementById('temp').value),
        hum:  parseFloat(document.getElementById('hum').value),
        ph:   parseFloat(document.getElementById('ph').value),
        rain: parseFloat(document.getElementById('rain').value)
    };
}

// ==========================================================
// LIVE PREVIEW
// ==========================================================
let livePreviewTimeout;
function livePreviewCrop() {
    clearTimeout(livePreviewTimeout);
    livePreviewTimeout = setTimeout(() => {
        const inputs = getInputs();
        const ranked = rankAllCrops(inputs);
        const top = ranked[0];
        const cls = top.score > 70 ? 'success' : top.score > 45 ? 'warning' : 'danger';
        document.getElementById('live-preview').innerHTML = `
            <div class="result-card ${cls}" style="padding:0.7rem;display:flex;justify-content:space-between;align-items:center;">
                <span style="font-size:0.88rem;font-weight:600;">${CROP_DB[top.key].emoji} Top match: <strong>${getLocalCropName(top.key)}</strong></span>
                <span style="font-weight:700;font-size:0.97rem;">${top.score.toFixed(0)}%</span>
            </div>`;
    }, 90);
}

// ==========================================================
// MAIN RECOMMENDATION (shows top 5)
// ==========================================================
function recommendCropWithFeedback() {
    const btn = document.getElementById('recommendBtn');
    const orig = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '⏳ Analyzing...';
    setTimeout(() => {
        btn.disabled = false;
        btn.innerHTML = orig;
    }, 600);

    const inputs = getInputs();
    const ranked = rankAllCrops(inputs);
    const top5 = ranked.slice(0, 5);
    const medals = ['🥇','🥈','🥉','4️⃣','5️⃣'];

    let html = `<p style="font-size:0.82rem;color:var(--text-light);margin-bottom:0.5rem;">${t('top_crops')}</p>`;

    // Soil meters
    html += `<div class="soil-meters">
        ${soilMeter('N',    inputs.n,    0,   140)}
        ${soilMeter('P',    inputs.p,    5,   145)}
        ${soilMeter('K',    inputs.k,    5,   205)}
        ${soilMeter('Temp', inputs.temp, 8,   45, '°C')}
        ${soilMeter('Hum',  inputs.hum,  14,  100,'%')}
        ${soilMeter('pH',   inputs.ph,   3.5, 9.5)}
    </div>`;

    top5.forEach((crop, i) => {
        const db = CROP_DB[crop.key];
        const factors = crop.matchedFactors.slice(0,3).join(', ');
        const missed = crop.missedFactors.length > 0
            ? `<p style="font-size:0.76rem;margin-top:0.35rem;opacity:0.82;">⚠️ Sub-optimal: ${crop.missedFactors.join(', ')}</p>` : '';
        const seasons = db.seasons.map(s => `<span class="s-tag">${s}</span>`).join('');

        html += `
        <div class="crop-card">
            <span class="score-badge">${crop.score.toFixed(0)}% match</span>
            <h3><span>${medals[i]}</span> ${getLocalCropName(crop.key)} ${db.emoji}</h3>
            <div class="confidence-bar">
                <div class="confidence-track"><div class="confidence-fill" style="width:${crop.score}%"></div></div>
            </div>
            <div class="match-factors">
                ${factors ? `<span class="match-tag">✓ ${factors}</span>` : ''}
                <span class="match-tag">₹${db.market}/qtl</span>
                <span class="match-tag">${db.marketLoc}</span>
            </div>
            <div class="season-badge">${seasons}</div>
            ${missed}
        </div>`;
    });

    // Why card
    const top = top5[0];
    const db = CROP_DB[top.key];
    html += `
    <div class="result-card info" style="margin-top:0.9rem;">
        <h4>${t('why_recommendation')}</h4>
        <p>• Temperature ${inputs.temp}°C → ideal ${db.temp[0]}–${db.temp[1]}°C</p>
        <p>• Rainfall ${inputs.rain}mm → ideal ${db.rain[0]}–${db.rain[1]}mm</p>
        <p>• Soil pH ${inputs.ph} → ideal ${db.ph[0]}–${db.ph[1]}</p>
        <p>• Nitrogen ${inputs.n} kg/ha → ideal ${db.N[0]}–${db.N[1]}</p>
    </div>
    <div class="result-card warning" style="margin-top:0.45rem;">
        <h4>📋 All 20 crops ranked</h4>
        <div style="font-size:0.8rem;display:grid;grid-template-columns:1fr 1fr;gap:0.25rem;margin-top:0.35rem;">
            ${ranked.slice(0,12).map(c => `<span>${CROP_DB[c.key].emoji} ${getLocalCropName(c.key)}: <b>${c.score.toFixed(0)}%</b></span>`).join('')}
        </div>
    </div>`;

    document.getElementById('crop-result-area').innerHTML = html;
    const p = document.querySelector('#crop-results-card > p[data-i18n]');
    if (p) p.style.display = 'none';
    document.getElementById('crop-results-card').scrollIntoView({ behavior:'smooth', block:'nearest' });
    speakText(`I recommend ${getLocalCropName(top.key)} with ${top.score.toFixed(0)} percent confidence.`);
}

function soilMeter(label, val, min, max, unit='') {
    const pct = ((val - min) / (max - min)) * 100;
    const mid = (max - min) * 0.5 + min;
    const cls = val < mid * 0.5 ? 'status-low' : val > mid * 1.5 ? 'status-high' : 'status-ok';
    const txt = val < mid * 0.5 ? 'Low' : val > mid * 1.5 ? 'High' : 'OK';
    return `<div class="soil-meter">
        <div class="label">${label}</div>
        <div class="value">${typeof val === 'number' ? (Number.isInteger(val) ? val : val.toFixed(1)) : val}${unit}</div>
        <div class="status ${cls}">${txt}</div>
    </div>`;
}

// ==========================================================
// YIELD PREDICTION — 20 crops
// ==========================================================
const yieldProfiles = {
    rice:      { base:4.2,  nSens:0.8, pSens:0.5, kSens:0.6, unit:'tons/ha', peak:6.5 },
    wheat:     { base:3.5,  nSens:0.9, pSens:0.6, kSens:0.5, unit:'tons/ha', peak:5.5 },
    maize:     { base:4.8,  nSens:1.0, pSens:0.7, kSens:0.7, unit:'tons/ha', peak:8.0 },
    cotton:    { base:1.8,  nSens:0.6, pSens:0.8, kSens:0.9, unit:'tons/ha', peak:3.5 },
    sugarcane: { base:65,   nSens:0.7, pSens:0.5, kSens:0.9, unit:'tons/ha', peak:110 },
    millet:    { base:2.0,  nSens:0.5, pSens:0.5, kSens:0.4, unit:'tons/ha', peak:3.5 },
    banana:    { base:28,   nSens:0.8, pSens:0.6, kSens:1.0, unit:'tons/ha', peak:50 },
    potato:    { base:20,   nSens:0.7, pSens:0.9, kSens:0.8, unit:'tons/ha', peak:40 },
    groundnut: { base:2.2,  nSens:0.3, pSens:0.7, kSens:0.5, unit:'tons/ha', peak:3.8 },
    tomato:    { base:25,   nSens:0.8, pSens:0.8, kSens:0.9, unit:'tons/ha', peak:60 },
    onion:     { base:18,   nSens:0.7, pSens:0.7, kSens:0.8, unit:'tons/ha', peak:35 },
    soybean:   { base:1.8,  nSens:0.3, pSens:0.7, kSens:0.5, unit:'tons/ha', peak:3.2 },
    chickpea:  { base:1.2,  nSens:0.3, pSens:0.7, kSens:0.4, unit:'tons/ha', peak:2.2 },
    jowar:     { base:2.0,  nSens:0.6, pSens:0.5, kSens:0.5, unit:'tons/ha', peak:3.5 },
    mustard:   { base:1.5,  nSens:0.8, pSens:0.6, kSens:0.4, unit:'tons/ha', peak:2.5 },
    turmeric:  { base:15,   nSens:0.6, pSens:0.7, kSens:0.9, unit:'tons/ha', peak:30 },
    ginger:    { base:12,   nSens:0.6, pSens:0.6, kSens:0.9, unit:'tons/ha', peak:25 },
    coconut:   { base:8000, nSens:0.5, pSens:0.5, kSens:0.9, unit:'nuts/ha',  peak:15000 },
    mango:     { base:8,    nSens:0.5, pSens:0.5, kSens:0.6, unit:'tons/ha', peak:20 },
    papaya:    { base:30,   nSens:0.7, pSens:0.6, kSens:0.8, unit:'tons/ha', peak:75 }
};

function predictYield() {
    const crop = document.getElementById('yield-crop').value;
    const n  = parseFloat(document.getElementById('yn').value);
    const p  = parseFloat(document.getElementById('yp').value);
    const k  = parseFloat(document.getElementById('yk').value);
    const area = parseFloat(document.getElementById('ya').value) || 1;
    const irrigFactor = parseFloat(document.getElementById('irrigation').value) || 1.15;
    const prof = yieldProfiles[crop];
    if (!prof) return;

    const nIdx = Math.min(1, 0.4 + (n/140)*0.7) * prof.nSens;
    const pIdx = Math.min(1, 0.4 + (p/145)*0.7) * prof.pSens;
    const kIdx = Math.min(1, 0.4 + (k/205)*0.7) * prof.kSens;
    const totalSens = prof.nSens + prof.pSens + prof.kSens;
    const nutrientFactor = (nIdx + pIdx + kIdx) / totalSens;

    // BUGFIX: Apply irrigation factor properly (capped at peak)
    const predicted = Math.min(prof.peak, prof.base * (0.6 + nutrientFactor * 0.8) * irrigFactor);
    const totalYield = predicted * area;
    const pct = ((predicted / prof.peak) * 100).toFixed(0);

    const db = CROP_DB[crop];
    const localCrop = getLocalCropName(crop);

    let tips = [];
    if (n < 60) tips.push('⚠️ Increase nitrogen (e.g. Urea 45%)');
    if (p < 40) tips.push('⚠️ Add phosphatic fertilizer (e.g. DAP)');
    if (k < 40) tips.push('⚠️ Apply potash fertilizer (e.g. MOP)');
    if (irrigFactor < 1.15) tips.push('💧 Consider drip/sprinkler irrigation for better yield');
    if (tips.length === 0) tips.push('✅ Nutrient levels are well balanced!');

    // Revenue estimate (use quintal conversion: 1 ton = 10 quintals)
    const isNuts = prof.unit === 'nuts/ha';
    const revenue = isNuts
        ? (totalYield * (db.market / 100)).toLocaleString('en-IN')
        : (totalYield * 10 * db.market).toLocaleString('en-IN');

    document.getElementById('yield-result-area').innerHTML = `
        <div class="result-card success">
            <h2>🌱 ${localCrop} ${CROP_DB[crop].emoji} Yield Estimate</h2>
            <div style="font-size:2.1rem;font-weight:800;color:var(--primary-dark);margin:0.45rem 0;">${isNuts ? Math.round(totalYield).toLocaleString() : predicted.toFixed(2)} <span style="font-size:0.95rem;">${prof.unit}</span></div>
            ${!isNuts ? `<div style="font-size:0.88rem;color:#555;">Total for ${area} ha: <strong>${totalYield.toFixed(2)} tons</strong></div>` : ''}
            <div style="margin-top:0.75rem;">
                <div style="font-size:0.78rem;color:#666;margin-bottom:0.25rem;">Yield efficiency: ${pct}% of peak potential</div>
                <div class="progress-bar" style="background:#ddd;"><div class="progress-fill" style="background:var(--primary);width:${pct}%"></div></div>
            </div>
        </div>
        <div class="result-card info">
            <h3>💰 Revenue Estimate</h3>
            <p>Market price: <strong>₹${db.market}${isNuts ? '/100 nuts' : '/quintal'}</strong> (${db.marketLoc})</p>
            <p>Estimated revenue: <strong>₹${revenue}</strong></p>
            <p style="font-size:0.8rem;color:#888;margin-top:0.3rem;">Preferred seasons: ${db.seasons.join(', ')}</p>
        </div>
        <div class="result-card ${tips[0].includes('⚠️') || tips[0].includes('💧') ? 'warning' : 'success'}">
            <h3>${t('optimization_tips')}</h3>
            ${tips.map(tip => `<p>${tip}</p>`).join('')}
        </div>`;

    const p2 = document.querySelector('#yield-results-card > p[data-i18n]');
    if (p2) p2.style.display = 'none';
}

// ==========================================================
// DISEASE DETECTION
// ==========================================================
const diseaseDB = {
    healthy:        { nameKey:'healthy_plant',     solutionKey:'no_treatment',              icon:'✅', symptoms:'No visible symptoms. Plant looks healthy and vigorous.', severity:'None',     confidence:94 },
    leaf_blight:    { nameKey:'leaf_blight',       solutionKey:'leaf_blight_solution',      icon:'⚠️', symptoms:'Brown irregular spots on leaves, yellowing margins, wilting tips.', severity:'Moderate', confidence:87 },
    rust:           { nameKey:'rust_disease',      solutionKey:'rust_solution',             icon:'🔴', symptoms:'Orange-brown rust-colored pustules on leaf undersides, defoliation.', severity:'Moderate', confidence:82 },
    powdery_mildew: { nameKey:'powdery_mildew',    solutionKey:'mildew_solution',           icon:'🌫️', symptoms:'White powdery coating on upper leaf surface, stunted growth.', severity:'Mild',     confidence:89 },
    bacterial_spot: { nameKey:'bacterial_spot',    solutionKey:'bacterial_spot_solution',   icon:'🦠', symptoms:'Water-soaked spots turning brown/black, leaf curling, oozing.', severity:'Severe',   confidence:85 }
};

function previewImage(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = e => {
            document.getElementById('image-preview').innerHTML = `<img src="${e.target.result}" style="max-width:100%;max-height:230px;border-radius:12px;margin-top:0.8rem;">`;
        };
        reader.readAsDataURL(file);
    }
}

function detectDisease() {
    const fileInput = document.getElementById('leaf-image');
    if (!fileInput.files[0]) { showToast('❌ Please upload a leaf image first'); return; }
    const file = fileInput.files[0];
    const reader = new FileReader();
    reader.onload = async (e) => {
        const base64Data = e.target.result.split(',')[1];
        const resultArea = document.getElementById('disease-result-area');
        const p = document.querySelector('#disease-results-card > p[data-i18n]');
        if (p) p.style.display = 'none';

        resultArea.innerHTML = `<div class="result-card info" style="text-align:center;">
            <div style="font-size:2rem;margin-bottom:0.5rem;">🧠</div>
            <p style="font-weight:600;">⚡ Groq AI Analyzing Image...</p>
            <div style="margin-top:0.7rem;"><div class="progress-bar" style="background:#cce0ff;">
                <div class="progress-fill" id="cnn-progress" style="background:var(--info);width:0%;transition:width 2s ease;"></div>
            </div></div>
            <p style="font-size:0.78rem;color:#555;margin-top:0.45rem;">Extracting features · Classifying · Generating report</p>
        </div>`;
        setTimeout(() => { const pr = document.getElementById('cnn-progress'); if(pr) pr.style.width='85%'; }, 100);

        const prompt = `You are an expert plant disease detection AI. Analyze this plant/leaf image and respond ONLY with a raw JSON object (no markdown, no backticks):
{"disease":"healthy|leaf_blight|rust|powdery_mildew|bacterial_spot|downy_mildew|other","displayName":"Human readable name","confidence":85,"severity":"None|Mild|Moderate|Severe","symptoms":"1-2 sentences about visible symptoms","cnnFeatures":["feature1","feature2","feature3"],"treatment":["step1","step2","step3","step4"],"isHealthy":false,"icon":"emoji"}`;

        try {
            const resp = await fetch('/groq', {
                method:'POST',
                headers:{'Content-Type':'application/json'},
                body:JSON.stringify({ prompt, image:base64Data, vision:true })
            });
            const data = await resp.json();
            if (data.error) throw new Error(data.error);
            const rawText = data.text || '';
            let result;
            try { result = JSON.parse(rawText.replace(/```json|```/g,'').trim()); }
            catch { result = { disease:'unknown', displayName:'Analysis Incomplete', confidence:60, severity:'Unknown', symptoms:'Could not parse result. Try a clearer leaf photo.', cnnFeatures:['Image received','Pattern extracted','Result uncertain'], treatment:['Use a clearer photo','Ensure good lighting','Leaf should fill frame'], isHealthy:false, icon:'⚠️' }; }

            renderDiseaseResult(result, resultArea, data._model_used || 'groq');
        } catch (err) {
            const isConn = err.message.includes('fetch') || err.message.includes('Failed');
            resultArea.innerHTML = `<div class="result-card ${isConn ? 'warning' : 'danger'}">
                <h3>${isConn ? '⚠️ Server Not Running' : '❌ Analysis Failed'}</h3>
                <p>${isConn ? 'Run <b>start_jeevmitra.py</b> first to start the local server.' : err.message}</p>
            </div>`;
        }
    };
    reader.readAsDataURL(file);
}

function renderDiseaseResult(result, resultArea, model) {
    const healthy = result.isHealthy || result.disease === 'healthy';
    const cls = healthy ? 'success' : result.severity === 'Severe' ? 'danger' : 'warning';
    resultArea.innerHTML = `
        <div class="result-card ${cls}">
            <div style="display:flex;justify-content:space-between;align-items:start;flex-wrap:wrap;gap:0.5rem;">
                <div>
                    <h2 style="font-size:1.15rem;">${result.icon||'🔬'} ${result.displayName}</h2>
                    <p style="font-size:0.8rem;margin-top:0.18rem;opacity:0.8;">⚡ ${model} · Confidence: <strong>${result.confidence}%</strong></p>
                </div>
                <span style="background:${healthy?'#219653':result.severity==='Severe'?'#c0392b':'#e67e22'};color:white;padding:0.28rem 0.75rem;border-radius:14px;font-size:0.76rem;font-weight:700;">
                    ${result.severity} Severity
                </span>
            </div>
            <div class="confidence-bar" style="margin-top:0.75rem;">
                <span class="confidence-label">Match</span>
                <div class="confidence-track" style="background:rgba(0,0,0,0.1);"><div class="confidence-fill" style="width:${result.confidence}%"></div></div>
                <span class="confidence-pct">${result.confidence}%</span>
            </div>
            <p style="margin-top:0.75rem;font-size:0.86rem;"><strong>Symptoms:</strong> ${result.symptoms}</p>
            ${result.cnnFeatures?.length ? `<div style="margin-top:0.75rem;"><p style="font-size:0.76rem;font-weight:600;margin-bottom:0.35rem;">🔍 Features Detected:</p>
            <div class="match-factors" style="color:inherit;">${result.cnnFeatures.map(f=>`<span class="match-tag" style="background:rgba(0,0,0,0.09);color:inherit;">${f}</span>`).join('')}</div></div>` : ''}
        </div>
        <div class="result-card ${healthy?'success':'info'}" style="margin-top:0.45rem;">
            <h3>🛡️ Treatment & Prevention</h3>
            ${(result.treatment||[]).map((s,i)=>`<p style="margin:0.28rem 0;">${i+1}. ${s}</p>`).join('')}
        </div>`;
    speakText(`${result.displayName} detected with ${result.confidence} percent confidence. Severity: ${result.severity}.`);
}

function demoDisease(type) {
    const res = diseaseDB[type];
    const isHealthy = type === 'healthy';
    const resultArea = document.getElementById('disease-result-area');
    const p = document.querySelector('#disease-results-card > p[data-i18n]');
    if (p) p.style.display = 'none';

    const treatments = {
        healthy:        ['Continue regular watering', 'Monitor for early signs', 'Maintain soil nutrition', 'Practice crop rotation'],
        leaf_blight:    ['Remove and destroy infected leaves', 'Apply copper oxychloride (3g/L)', 'Ensure adequate plant spacing', 'Avoid overhead irrigation'],
        rust:           ['Apply Mancozeb 75WP (2.5g/L)', 'Remove infected plant parts', 'Improve field drainage', 'Rotate crops next season'],
        powdery_mildew: ['Spray neem oil (5ml/L)', 'Apply sulfur dust in morning', 'Improve air circulation', 'Avoid excess nitrogen'],
        bacterial_spot: ['Apply copper-based bactericide', 'Remove severely infected leaves', 'Avoid working in wet conditions', 'Use disease-free seeds next season']
    };

    renderDiseaseResult({
        displayName: t(res.nameKey),
        icon: res.icon,
        confidence: res.confidence,
        severity: res.severity,
        symptoms: res.symptoms,
        cnnFeatures: ['Demo mode', 'Pattern simulation', 'Local classifier'],
        treatment: treatments[type] || treatments.healthy,
        isHealthy: isHealthy
    }, resultArea, 'Demo');
}

// ==========================================================
// MARKET PRICES — 20 crops with realistic simulation
// ==========================================================
let marketData = [];
function loadMarketPrices() {
    const prices = {
        rice:      { base:2200, market:'Kochi',      trend:'up',    loc:'Kerala' },
        wheat:     { base:2150, market:'Delhi',       trend:'stable',loc:'NCR' },
        maize:     { base:1900, market:'Mumbai',      trend:'up',    loc:'Maharashtra' },
        cotton:    { base:6500, market:'Ahmedabad',   trend:'up',    loc:'Gujarat' },
        sugarcane: { base:350,  market:'Pune',        trend:'stable',loc:'Maharashtra' },
        millet:    { base:2800, market:'Bangalore',   trend:'up',    loc:'Karnataka' },
        banana:    { base:2500, market:'Trivandrum',  trend:'up',    loc:'Kerala' },
        potato:    { base:1800, market:'Kolkata',     trend:'stable',loc:'WB' },
        groundnut: { base:5500, market:'Chennai',     trend:'up',    loc:'Tamil Nadu' },
        tomato:    { base:1500, market:'Nasik',       trend:'down',  loc:'Maharashtra' },
        onion:     { base:2000, market:'Lasalgaon',   trend:'stable',loc:'Maharashtra' },
        soybean:   { base:4200, market:'Indore',      trend:'up',    loc:'MP' },
        chickpea:  { base:5000, market:'Jaipur',      trend:'stable',loc:'Rajasthan' },
        jowar:     { base:2600, market:'Solapur',     trend:'stable',loc:'Maharashtra' },
        mustard:   { base:5200, market:'Jaipur',      trend:'up',    loc:'Rajasthan' },
        turmeric:  { base:8000, market:'Erode',       trend:'up',    loc:'Tamil Nadu' },
        ginger:    { base:10000,market:'Cochin',      trend:'up',    loc:'Kerala' },
        coconut:   { base:2000, market:'Trivandrum',  trend:'stable',loc:'Kerala' },
        mango:     { base:3500, market:'Ratnagiri',   trend:'up',    loc:'Maharashtra' },
        papaya:    { base:1200, market:'Pune',        trend:'stable',loc:'Maharashtra' }
    };

    const tbody = document.getElementById('price-table-body');
    if (!tbody) return;

    marketPrices = {};
    marketData = [];
    tbody.innerHTML = '';

    Object.entries(prices).forEach(([crop, info]) => {
        const fluctuation = (Math.random() * 0.14 - 0.06);
        const price = Math.round(info.base * (1 + fluctuation));
        const change = (fluctuation * 100).toFixed(1);
        const trendMap = { up:{ cls:'trend-up', icon:'📈' }, down:{ cls:'trend-down', icon:'📉' }, stable:{ cls:'trend-stable', icon:'➡️' }};
        const t = trendMap[info.trend] || trendMap.stable;

        marketPrices[crop] = { price, market:info.market, trend:info.trend, trendClass:t.cls, trendIcon:t.icon, change7d:(change > 0 ? '+':'')+change+'%' };
        marketData.push({ crop, price, trend:info.trend, market:info.market, trendClass:t.cls, trendIcon:t.icon, change7d:(change>0?'+':'')+change+'%', season:CROP_DB[crop]?.seasons.join('/') || '-' });
    });

    renderMarketTable(marketData);
    document.getElementById('market-date').textContent = new Date().toLocaleString();
    setTimeout(drawPriceChart, 200);
}

function renderMarketTable(data) {
    const tbody = document.getElementById('price-table-body');
    if (!tbody) return;
    tbody.innerHTML = '';
    data.forEach(({ crop, price, market, trendClass, trendIcon, change7d, season }) => {
        const localName = getLocalCropName(crop);
        tbody.innerHTML += `<tr>
            <td><strong>${CROP_DB[crop].emoji} ${localName}</strong> <small style="color:#aaa;">(${cropNames.en[crop]})</small></td>
            <td>₹${price.toLocaleString()}</td>
            <td>${market}</td>
            <td class="${trendClass}">${trendIcon} ${marketPrices[crop].trend.toUpperCase()}</td>
            <td class="${trendClass}">${change7d}</td>
            <td style="font-size:0.8rem;color:#888;">${season || '-'}</td>
        </tr>`;
    });
}

function sortMarketBy(field) {
    if (!marketData.length) return;
    const sorted = [...marketData].sort((a, b) => {
        if (field === 'price') return b.price - a.price;
        if (field === 'trend') {
            const order = { up:0, stable:1, down:2 };
            return (order[a.trend]||1) - (order[b.trend]||1);
        }
        return 0;
    });
    renderMarketTable(sorted);
}

function drawPriceChart() {
    const canvas = document.getElementById('price-chart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    // Polyfill roundRect for older browsers
    if (!ctx.roundRect) {
        ctx.roundRect = function(x, y, w, h, r) {
            const rad = Array.isArray(r) ? r[0] : r;
            ctx.beginPath();
            ctx.moveTo(x + rad, y);
            ctx.lineTo(x + w - rad, y);
            ctx.quadraticCurveTo(x + w, y, x + w, y + rad);
            ctx.lineTo(x + w, y + h);
            ctx.lineTo(x, y + h);
            ctx.lineTo(x, y + rad);
            ctx.quadraticCurveTo(x, y, x + rad, y);
            ctx.closePath();
        };
    }
    const width = canvas.parentElement.clientWidth || 600;
    const height = 280;
    canvas.width = width;
    canvas.height = height;
    ctx.clearRect(0, 0, width, height);

    // Show top 12 crops by price for readability
    const crops = Object.keys(marketPrices).sort((a,b) => marketPrices[b].price - marketPrices[a].price).slice(0,12);
    const prices = crops.map(c => marketPrices[c].price);
    const maxPrice = Math.max(...prices);
    const pad = { top:30, right:20, bottom:52, left:65 };
    const cW = width - pad.left - pad.right;
    const cH = height - pad.top - pad.bottom;
    const barW = Math.min(38, cW / crops.length - 8);

    // Y gridlines
    ctx.strokeStyle = '#eee'; ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
        const y = pad.top + cH - (i / 4) * cH;
        ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(width - pad.right, y); ctx.stroke();
        ctx.fillStyle = '#999'; ctx.font = '10px sans-serif'; ctx.textAlign = 'right';
        ctx.fillText('₹' + ((maxPrice * i / 4) / 1000).toFixed(1) + 'k', pad.left - 5, y + 4);
    }

    crops.forEach((crop, i) => {
        const x = pad.left + i * (cW / crops.length) + (cW / crops.length - barW) / 2;
        const barH = (prices[i] / maxPrice) * cH;
        const y = pad.top + cH - barH;
        const trend = marketPrices[crop].trend;
        const grad = ctx.createLinearGradient(x, y, x, pad.top + cH);
        const c1 = trend === 'up' ? '#2d9e58' : trend === 'down' ? '#e74c3c' : '#e67e22';
        const c2 = trend === 'up' ? '#0d4024' : trend === 'down' ? '#922b21' : '#d35400';
        grad.addColorStop(0, c1); grad.addColorStop(1, c2);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.roundRect(x, y, barW, barH, [4,4,0,0]);
        ctx.fill();
        const lN = getLocalCropName(crop);
        ctx.fillStyle = '#444'; ctx.font = '9px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText(lN.length > 7 ? lN.slice(0,6)+'.' : lN, x + barW/2, height - pad.bottom + 14);
        ctx.fillStyle = '#555'; ctx.font = 'bold 8px sans-serif';
        ctx.fillText('₹'+(prices[i]/1000).toFixed(1)+'k', x + barW/2, y - 4);
    });
}

// ==========================================================
// CROP CALENDAR
// ==========================================================
const calendarData = {
    kn: [
        { crop:'rice',     sow:'June–July (Kharif), Nov–Dec (Rabi)', harvest:'Oct–Nov, Mar–Apr', tips:'Use flood irrigation; transplant seedlings at 3–4 leaf stage.' },
        { crop:'ragi',     sow:'June–Aug', harvest:'Oct–Nov', tips:'Ideal for dry tracts of Karnataka; drought-tolerant cereal.' },
        { crop:'maize',    sow:'Jun–Jul', harvest:'Sep–Oct', tips:'Requires well-drained soil; avoid water logging.' },
        { crop:'cotton',   sow:'May–Jun', harvest:'Oct–Jan', tips:'Black cotton soil preferred; pick bolls when fully open.' },
        { crop:'sugarcane',sow:'Jan–Mar', harvest:'Nov–Jan (18 months)', tips:'Ratoon crops recommended for Karnataka.' },
        { crop:'groundnut',sow:'Jun–Jul', harvest:'Oct–Nov', tips:'Sandy loam soil; inoculate seeds with Rhizobium.' },
        { crop:'sunflower',sow:'Oct–Nov', harvest:'Feb–Mar', tips:'Short duration crop; good for Kharif and Rabi both.' },
        { crop:'tomato',   sow:'Jun–Jul, Nov–Dec', harvest:'Sep–Oct, Feb–Mar', tips:'Stake plants; watch for TSWV virus.' }
    ],
    ap: [
        { crop:'rice',     sow:'Jun–Jul, Nov–Dec', harvest:'Oct–Nov, Mar–Apr', tips:'Telangana Sona and MTU7029 are popular varieties.' },
        { crop:'cotton',   sow:'Jun–Jul', harvest:'Oct–Jan', tips:'BT cotton widely grown; black soil preferred.' },
        { crop:'maize',    sow:'Jun–Jul', harvest:'Sep–Oct', tips:'Good for Godavari delta region.' },
        { crop:'groundnut',sow:'Jun–Jul', harvest:'Oct–Nov', tips:'Rayalaseema region speciality; export quality.' },
        { crop:'turmeric', sow:'May–Jun', harvest:'Jan–Mar', tips:'Nizamabad turmeric is GI-tagged quality.' },
        { crop:'chilli',   sow:'Jul–Aug', harvest:'Nov–Jan', tips:'Guntur chilli is world-famous.' }
    ],
    mh: [
        { crop:'sugarcane',sow:'Oct–Dec (Adsali), Jan–Mar (Pre-seasonal)', harvest:'Nov–Mar', tips:'Maharashtra is India\'s top sugarcane producer.' },
        { crop:'cotton',   sow:'Jun–Jul', harvest:'Oct–Feb', tips:'Vidarbha region excels in cotton; Bt varieties preferred.' },
        { crop:'soybean',  sow:'Jun–Jul', harvest:'Oct–Nov', tips:'Marathwada and Vidarbha are major soy belts.' },
        { crop:'onion',    sow:'Jun–Jul (Kharif), Oct–Nov (Rabi)', harvest:'Oct–Nov, Mar–Apr', tips:'Nasik is the onion capital of India.' },
        { crop:'banana',   sow:'Jun–Aug', harvest:'Year-round', tips:'Jalgaon region famous for Khandesh bananas.' },
        { crop:'grapes',   sow:'Jan–Mar (pruning)', harvest:'Jan–Mar', tips:'Nashik wine grapes and table grapes are export quality.' }
    ],
    tn: [
        { crop:'rice',     sow:'Jun–Aug (Kuruvai), Sep–Nov (Samba)', harvest:'Oct–Nov, Jan–Feb', tips:'Samba rice is traditional; Cauvery delta specialty.' },
        { crop:'sugarcane',sow:'Dec–Jan', harvest:'Dec–Mar', tips:'Erode and Tirupur belt; Co-0238 variety popular.' },
        { crop:'banana',   sow:'Jun–Aug', harvest:'Year-round', tips:'Thiruvarur and Thanjavur known for Poovan variety.' },
        { crop:'groundnut',sow:'Jun–Jul, Oct–Nov', harvest:'Sep–Oct, Jan–Feb', tips:'Vellore and Tiruvannamalai districts.' },
        { crop:'turmeric', sow:'May–Jun', harvest:'Jan–Mar', tips:'Erode leads India in turmeric production.' },
        { crop:'coconut',  sow:'Year-round (transplant)', harvest:'Year-round', tips:'Pollachi is India\'s coconut city.' }
    ],
    kl: [
        { crop:'rice',     sow:'Jun–Jul (Virippu), Oct–Nov (Mundakan)', harvest:'Sep–Nov, Jan–Feb', tips:'Palakkad district is Kerala\'s rice bowl.' },
        { crop:'coconut',  sow:'Year-round', harvest:'Year-round', tips:'Kerala leads in coconut cultivation; tender coconut popular.' },
        { crop:'banana',   sow:'Year-round', harvest:'Year-round', tips:'Nendran, Robusta, and Red banana are popular.' },
        { crop:'ginger',   sow:'May–Jun', harvest:'Nov–Dec', tips:'Wayanad and Idukki are major ginger belts.' },
        { crop:'tapioca',  sow:'Feb–May', harvest:'Aug–Dec (8–10 months)', tips:'Year-round crop; staple food crop of Kerala.' },
        { crop:'pepper',   sow:'Jun–Jul (planting)', harvest:'Nov–Jan', tips:'Kerala Pepper is GI-tagged; grow on arecanut trees.' }
    ],
    pu: [
        { crop:'wheat',    sow:'Oct–Nov', harvest:'Mar–Apr', tips:'Punjab grows the finest wheat; HD2967 is popular.' },
        { crop:'rice',     sow:'Jun–Jul', harvest:'Oct–Nov', tips:'PR-126 is popular short-duration variety.' },
        { crop:'maize',    sow:'Mar–Apr', harvest:'Jul–Aug', tips:'Spring maize suits Punjab climate well.' },
        { crop:'mustard',  sow:'Oct–Nov', harvest:'Feb–Mar', tips:'Pusa Bold variety widely cultivated.' },
        { crop:'potato',   sow:'Oct–Nov', harvest:'Feb–Mar', tips:'Jalandhar and Hoshiarpur are major producers.' },
        { crop:'sunflower',sow:'Jan–Feb', harvest:'May–Jun', tips:'Rabi season sunflower; good oil content.' }
    ],
    up: [
        { crop:'wheat',    sow:'Oct–Nov', harvest:'Mar–Apr', tips:'UP is India\'s largest wheat producer; K307 popular.' },
        { crop:'sugarcane',sow:'Feb–Mar', harvest:'Oct–Dec', tips:'Western UP is sugar bowl; ratoon crop common.' },
        { crop:'potato',   sow:'Sep–Oct', harvest:'Dec–Jan', tips:'Agra and Farrukhabad are major potato belts.' },
        { crop:'mustard',  sow:'Sep–Oct', harvest:'Feb–Mar', tips:'Bundelkhand and Allahabad belt.' },
        { crop:'rice',     sow:'Jun–Jul', harvest:'Oct–Nov', tips:'Eastern UP: Purvanchal region grows aromatic rice.' },
        { crop:'chickpea', sow:'Oct–Nov', harvest:'Feb–Mar', tips:'Bundelkhand preferred for chana.' }
    ],
    wb: [
        { crop:'rice',     sow:'Jun–Jul (Aman), Jan–Feb (Boro)', harvest:'Nov–Dec, May–Jun', tips:'WB is the largest rice producing state.' },
        { crop:'potato',   sow:'Oct–Nov', harvest:'Jan–Feb', tips:'Hooghly and Burdwan are potato hubs.' },
        { crop:'jute',     sow:'Mar–Apr', harvest:'Jul–Aug', tips:'WB produces 75% of India\'s jute.' },
        { crop:'mustard',  sow:'Oct–Nov', harvest:'Feb–Mar', tips:'After rice harvest, mustard fits perfectly.' },
        { crop:'vegetables',sow:'Year-round', harvest:'Year-round', tips:'24 Parganas supplies Kolkata markets.' },
        { crop:'mango',    sow:'Transplant Feb–Mar', harvest:'May–Jun', tips:'Malda and Murshidabad are mango belts.' }
    ]
};

function renderCalendar() {
    const region = document.getElementById('cal-region').value;
    const data = calendarData[region] || calendarData.kn;
    const area = document.getElementById('calendar-area');
    let html = `<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:1rem;margin-top:1.2rem;">`;
    data.forEach(item => {
        const emoji = CROP_DB[item.crop]?.emoji || '🌿';
        html += `<div class="crop-card" style="padding:1.1rem;">
            <h3 style="font-size:1rem;">${emoji} ${item.crop.charAt(0).toUpperCase() + item.crop.slice(1)}</h3>
            <p style="font-size:0.82rem;margin-top:0.4rem;opacity:0.9;"><strong>🌱 Sow:</strong> ${item.sow}</p>
            <p style="font-size:0.82rem;margin-top:0.25rem;opacity:0.9;"><strong>🌾 Harvest:</strong> ${item.harvest}</p>
            <p style="font-size:0.78rem;margin-top:0.4rem;opacity:0.8;background:rgba(255,255,255,0.12);padding:0.4rem 0.6rem;border-radius:8px;">💡 ${item.tips}</p>
        </div>`;
    });
    html += '</div>';
    area.innerHTML = html;
}

// ==========================================================
// CHATBOT
// ==========================================================
function handleChatEnter(e) { if (e.key === 'Enter') sendChatMessage(); }

function quickChat(type) {
    const prompts = {
        en: { crop:'Which crop should I grow based on my soil data?', yield:'Predict my yield', disease:'Check plant disease', price:'Show market prices', season:'What crops should I grow this season?' },
        ml: { crop:'ഞാൻ ഏത് വിള വളർത്തണം?', yield:'വിളവ് പ്രവചിക്കുക', disease:'ചെടിരോഗം', price:'വിപണി വിലകൾ', season:'ഈ സീസണിൽ ഏത് വിള?' },
        hi: { crop:'कौन सी फसल उगानी चाहिए?', yield:'उपज का अनुमान', disease:'पौधे की बीमारी', price:'बाजार मूल्य', season:'इस मौसम में कौन सी फसल?' },
        kn: { crop:'ಯಾವ ಬೆಳೆ ಬೆಳೆಯಬೇಕು?', yield:'ಇಳುವರಿ ಊಹಿಸಿ', disease:'ರೋಗ', price:'ಮಾರುಕಟ್ಟೆ ಬೆಲೆ', season:'ಈ ಋತುವಿನಲ್ಲಿ ಯಾವ ಬೆಳೆ?' },
        ta: { crop:'எந்த பயிர் பயிரிட வேண்டும்?', yield:'விளைச்சல்', disease:'தாவர நோய்', price:'சந்தை விலை', season:'இந்த பருவத்தில் என்ன பயிர்?' },
        te: { crop:'ఏ పంట పండించాలి?', yield:'దిగుబడి', disease:'వ్యాధి', price:'ధరలు', season:'ఈ సీజన్‌లో ఏ పంట?' }
    };
    const msg = prompts[currentLanguage]?.[type] || prompts.en[type];
    document.getElementById('chatInput').value = msg;
    sendChatMessage();
}

function sendChatMessage() {
    const input = document.getElementById('chatInput');
    const msg = input.value.trim();
    if (!msg) return;
    addChatMessage(msg, 'user');
    input.value = '';
    sendToGroqAPI(msg);
}

async function sendToGroqAPI(userMessage) {
    const typingId = showTypingIndicator();
    const inputs = getInputs();
    const ranked = rankAllCrops(inputs);
    const top3 = ranked.slice(0,3).map(c => `${getCropName(c.key)} (${c.score.toFixed(0)}%)`).join(', ');
    const langMap = { ml:'Malayalam/Kerala', hi:'Hindi/India', kn:'Kannada/Karnataka', ta:'Tamil/Tamil Nadu', te:'Telugu/Andhra Pradesh', en:'English' };
    const systemPrompt = `You are JeevanMitra AI (formerly KrishiAI), an expert Indian agricultural assistant for farmers in ${langMap[currentLanguage]||'English'}.

Current farmer's soil/climate data:
- N:${inputs.n} P:${inputs.p} K:${inputs.k} Temp:${inputs.temp}°C Hum:${inputs.hum}% pH:${inputs.ph} Rain:${inputs.rain}mm
- Top recommended crops: ${top3}

Respond in ${langMap[currentLanguage]||'English'}. Be concise (2-4 sentences), practical, and helpful. Use HTML <b> tags for key terms. Mention JeevanMitra AI not KrishiAI.`;

    try {
        const resp = await fetch('/groq', {
            method:'POST', headers:{'Content-Type':'application/json'},
            body:JSON.stringify({ prompt: systemPrompt + '\n\nFarmer: ' + userMessage })
        });
        const data = await resp.json();
        removeTypingIndicator(typingId);
        if (data.error) throw new Error(data.error);
        let text = (data.text||'').replace(/\*\*(.*?)\*\*/g,'<b>$1</b>').replace(/\*(.*?)\*/g,'$1').replace(/#{1,3} /g,'').replace(/\n/g,'<br>');
        addChatMessage(text, 'bot');
        speakText(text.replace(/<[^>]+>/g,''));
    } catch (err) {
        removeTypingIndicator(typingId);
        addChatMessage(generateLocalResponse(userMessage) + '<br><small style="opacity:0.6;">(Demo mode — Groq unavailable)</small>', 'bot');
    }
}

function generateLocalResponse(message) {
    const msg = message.toLowerCase();
    const lang = currentLanguage;
    const isCropQ   = /crop|grow|plant|recommend|फसल|ವಿಳ|ಬೆಳೆ|பயிர்|வில|పంట|wheat|rice|maize/.test(msg);
    const isYieldQ  = /yield|harvest|produc|predict|विळ|ಇಳ|விளை|దిగుబడి/.test(msg);
    const isDiseaseQ= /disease|sick|spots|ರೋಗ|रोग|நோய்|రోగ|blight|rust|mildew/.test(msg);
    const isPriceQ  = /price|market|cost|ಬೆಲೆ|मूल्य|விலை|వில|ధర/.test(msg);
    const isSeason  = /season|kharif|rabi|summer|sow|plant when|calendar/.test(msg);
    const isGreeting= /^(hi|hello|hey|namaste|నమస్|ನಮಸ್|வணக்|നമസ്)/.test(msg);

    if (isCropQ) {
        const inputs = getInputs();
        const ranked = rankAllCrops(inputs);
        const [a,b,c] = ranked;
        return {
            en:`Based on your soil (T:${inputs.temp}°C, Rain:${inputs.rain}mm, pH:${inputs.ph}):<br>🥇 <b>${getLocalCropName(a.key)}</b> — ${a.score.toFixed(0)}%<br>🥈 <b>${getLocalCropName(b.key)}</b> — ${b.score.toFixed(0)}%<br>🥉 <b>${getLocalCropName(c.key)}</b> — ${c.score.toFixed(0)}%<br><small>Go to Crop Recommendation tab for full analysis!</small>`,
            ml:`നിങ്ങളുടെ ഡേറ്റ: 🥇 <b>${getLocalCropName(a.key)}</b> (${a.score.toFixed(0)}%) 🥈 <b>${getLocalCropName(b.key)}</b> 🥉 <b>${getLocalCropName(c.key)}</b>`,
            hi:`आपके डेटा के आधार पर: 🥇 <b>${getLocalCropName(a.key)}</b> (${a.score.toFixed(0)}%) 🥈 <b>${getLocalCropName(b.key)}</b> 🥉 <b>${getLocalCropName(c.key)}</b>`,
            kn:`ನಿಮ್ಮ ಡೇಟಾ: 🥇 <b>${getLocalCropName(a.key)}</b> (${a.score.toFixed(0)}%) 🥈 <b>${getLocalCropName(b.key)}</b> 🥉 <b>${getLocalCropName(c.key)}</b>`,
            ta:`உங்கள் தரவு: 🥇 <b>${getLocalCropName(a.key)}</b> (${a.score.toFixed(0)}%) 🥈 <b>${getLocalCropName(b.key)}</b> 🥉 <b>${getLocalCropName(c.key)}</b>`,
            te:`మీ డేటా: 🥇 <b>${getLocalCropName(a.key)}</b> (${a.score.toFixed(0)}%) 🥈 <b>${getLocalCropName(b.key)}</b> 🥉 <b>${getLocalCropName(c.key)}</b>`
        }[lang] || '';
    }
    if (isYieldQ) {
        const crop = document.getElementById('yield-crop').value;
        const n = parseFloat(document.getElementById('yn').value);
        const p = parseFloat(document.getElementById('yp').value);
        const k = parseFloat(document.getElementById('yk').value);
        const prof = yieldProfiles[crop];
        const nI = Math.min(1,0.4+(n/140)*0.7)*prof.nSens;
        const pI = Math.min(1,0.4+(p/145)*0.7)*prof.pSens;
        const kI = Math.min(1,0.4+(k/205)*0.7)*prof.kSens;
        const pred = Math.min(prof.peak, prof.base*(0.6+(nI+pI+kI)/(prof.nSens+prof.pSens+prof.kSens)*0.8));
        return {
            en:`For <b>${getLocalCropName(crop)}</b>: estimated <b>${pred.toFixed(2)} ${prof.unit}</b>. Revenue: ~₹${(pred*10*CROP_DB[crop].market).toLocaleString('en-IN')}. Use Yield tab for details! 📊`,
            ml:`<b>${getLocalCropName(crop)}</b>: ${pred.toFixed(2)} ടൺ/ഹെ. വരുമാനം: ~₹${(pred*10*CROP_DB[crop].market).toLocaleString('en-IN')}`,
            hi:`<b>${getLocalCropName(crop)}</b>: ${pred.toFixed(2)} टन/हे. राजस्व: ~₹${(pred*10*CROP_DB[crop].market).toLocaleString('en-IN')}`,
            kn:`<b>${getLocalCropName(crop)}</b>: ${pred.toFixed(2)} ಟನ್/ಹೆ.`,
            ta:`<b>${getLocalCropName(crop)}</b>: ${pred.toFixed(2)} டன்/ஹெ.`,
            te:`<b>${getLocalCropName(crop)}</b>: ${pred.toFixed(2)} టన్/హె.`
        }[lang] || '';
    }
    if (isDiseaseQ) return { en:'Upload a leaf image in the Disease Detection tab. I can identify Leaf Blight, Rust, Powdery Mildew, Bacterial Spot & more! 🔍', ml:'ഇല ചിത്രം Disease Detection ടാബിൽ അപ്ലോഡ് ചെയ്യുക. 🔍', hi:'Disease Detection टैब में पत्ते की छवि अपलोड करें। 🔍', kn:'Disease Detection ಟ್ಯಾಬ್‌ನಲ್ಲಿ ಎಲೆ ಚಿತ್ರ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ. 🔍', ta:'Disease Detection tab-ல் இலை படம் பதிவேற்றவும். 🔍', te:'Disease Detection tab లో ఆకు చిత్రం అప్‌లోడ్ చేయండి. 🔍' }[lang] || '';
    if (isPriceQ) {
        const top5 = Object.entries(marketPrices).slice(0,5);
        const str = top5.map(([c,d]) => `• ${getLocalCropName(c)}: ₹${d.price} ${d.trendIcon}`).join('<br>');
        return { en:`Current market prices:<br>${str}<br>See Market tab for all 20 crops! 💰`, ml:`വിപണി: <br>${str}`, hi:`बाजार: <br>${str}`, kn:`ಬೆಲೆ: <br>${str}`, ta:`விலை: <br>${str}`, te:`ధర: <br>${str}` }[lang] || '';
    }
    if (isSeason) return { en:'Check the <b>Crop Calendar</b> tab for region-wise sowing and harvest schedules! 📅', ml:'<b>Crop Calendar</b> ടാബ് കാണുക. 📅', hi:'<b>Crop Calendar</b> टैब देखें। 📅', kn:'<b>Crop Calendar</b> ಟ್ಯಾಬ್ ನೋಡಿ. 📅', ta:'<b>Crop Calendar</b> tab பாருங்கள். 📅', te:'<b>Crop Calendar</b> tab చూడండి. 📅' }[lang] || '';
    if (isGreeting) return { en:'Hello! 🌿 I\'m <b>JeevanMitra AI</b> — your smart farming companion. I can recommend crops, predict yield, detect diseases & show market prices. What can I help you with?', ml:'നമസ്കാരം! 🌿 ഞാൻ <b>ജീവൻമിത്ര AI</b>. വിള ശുപാർശ, വിളവ് പ്രവചനം, രോഗ നിർണ്ണയം — സഹായിക്കാം!', hi:'नमस्ते! 🌿 मैं <b>जीवनमित्र AI</b> हूं। फसल, उपज, रोग और बाजार — सब में मदद करता हूं!', kn:'ನಮಸ್ಕಾರ! 🌿 ನಾನು <b>ಜೀವನಮಿತ್ರ AI</b>. ಬೆಳೆ, ಇಳುವರಿ, ರೋಗ, ಬೆಲೆ ಸಹಾಯ!', ta:'வணக்கம்! 🌿 நான் <b>ஜீவன்மித்ரா AI</b>. பயிர், விளைச்சல், நோய், விலை!', te:'నమస్కారం! 🌿 నేను <b>జీవన్‌మిత్ర AI</b>. పంట, దిగుబడి, వ్యాధి, ధర!' }[lang] || '';
    return { en:'🌿 Ask me about crops, yield, disease, or market prices. Try the Crop Calendar tab for sowing schedules!', ml:'🌿 ചോദ്യം ചോദിക്കൂ — വിള, വിളവ്, രോഗം, വിപണി.', hi:'🌿 फसल, उपज, रोग या बाजार के बारे में पूछें।', kn:'🌿 ಬೆಳೆ, ಇಳುವರಿ, ರೋಗ ಅಥವಾ ಮಾರುಕಟ್ಟೆ ಬಗ್ಗೆ ಕೇಳಿ.', ta:'🌿 பயிர், விளைச்சல், நோய் பற்றி கேளுங்கள்.', te:'🌿 పంట, దిగుబడి, వ్యాధి లేదా మార్కెట్ గురించి అడగండి.' }[lang] || '';
}

function addChatMessage(text, sender) {
    const container = document.getElementById('chatMessages');
    const div = document.createElement('div');
    div.className = `chat-message ${sender}`;
    const safe = sender === 'user' ? text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;') : text;
    div.innerHTML = `<div class="chat-avatar ${sender==='bot'?'bot':'user'}">${sender==='bot'?'🤖':'👨‍🌾'}</div><div class="chat-bubble">${safe}</div>`;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
}

function showTypingIndicator() {
    const container = document.getElementById('chatMessages');
    const id = 'typing-' + Date.now();
    const div = document.createElement('div');
    div.id = id; div.className = 'chat-message bot';
    div.innerHTML = `<div class="chat-avatar bot">🤖</div><div class="chat-bubble"><div class="typing-indicator"><div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div></div></div>`;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
    return id;
}
function removeTypingIndicator(id) { const el = document.getElementById(id); if(el) el.remove(); }

// ==========================================================
// UI HELPERS
// ==========================================================
function t(key) { return i18n[currentLanguage]?.[key] || i18n.en[key] || key; }

function applyTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        el.textContent = t(key);
    });
}

function setLanguage(lang) {
    currentLanguage = lang;
    document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
    const btn = document.querySelector(`.lang-btn[data-lang="${lang}"]`);
    if (btn) btn.classList.add('active');
    applyTranslations();
    loadMarketPrices();
    showToast(t('lang_changed'));
    const wEl = document.getElementById('welcome-message');
    if (wEl) wEl.textContent = t('chat_welcome');
    // Refresh yield crop select labels in user's language
    predictYield();
    livePreviewCrop();
}

function switchTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(`tab-${tabName}`)?.classList.add('active');
    document.querySelector(`.tab-btn[data-tab="${tabName}"]`)?.classList.add('active');
    if (tabName === 'market') { loadMarketPrices(); setTimeout(drawPriceChart, 300); }
    if (tabName === 'calendar') renderCalendar();
}

function updateSlider(id) {
    const el = document.getElementById(id);
    const disp = document.getElementById(id + '-value');
    if (el && disp) disp.textContent = parseFloat(el.value) % 1 !== 0 ? parseFloat(el.value).toFixed(1) : el.value;
}

function updateAllSliders() {
    ['n','p','k','temp','hum','ph','rain','yn','yp','yk','ya'].forEach(id => {
        const el = document.getElementById(id);
        if (el) updateSlider(id);
    });
}

function resetSliders() {
    const defaults = { n:50, p:50, k:50, temp:25, hum:65, ph:6.5, rain:150 };
    Object.entries(defaults).forEach(([id, val]) => {
        const el = document.getElementById(id);
        if (el) { el.value = val; updateSlider(id); }
    });
    document.getElementById('live-preview').innerHTML = '';
    document.getElementById('crop-result-area').innerHTML = '';
    livePreviewCrop();
    showToast('Sliders reset to defaults');
}

function randomFarmData() {
    // Generate realistic random farm data
    const scenarios = [
        { n:80,  p:45,  k:40,  temp:28, hum:75, ph:6.2, rain:200, msg:'Tropical rice farm' },
        { n:100, p:55,  k:50,  temp:20, hum:45, ph:7.0, rain:80,  msg:'Wheat-belt farm' },
        { n:30,  p:60,  k:50,  temp:30, hum:45, ph:6.5, rain:65,  msg:'Groundnut farm' },
        { n:70,  p:40,  k:90,  temp:25, hum:80, ph:6.0, rain:180, msg:'Sugarcane field' },
        { n:50,  p:70,  k:80,  temp:18, hum:60, ph:5.5, rain:100, msg:'Potato farm' },
        { n:20,  p:50,  k:40,  temp:33, hum:35, ph:7.0, rain:45,  msg:'Dry land farm' },
        { n:90,  p:60,  k:120, temp:26, hum:82, ph:5.8, rain:230, msg:'Coastal banana farm' }
    ];
    const s = scenarios[Math.floor(Math.random() * scenarios.length)];
    ['n','p','k','temp','hum','ph','rain'].forEach(id => {
        const el = document.getElementById(id);
        if (el) { el.value = s[id]; updateSlider(id); }
    });
    livePreviewCrop();
    showToast(`🎲 ${s.msg} data loaded!`);
}

function autoFillWeather() {
    document.getElementById('temp').value = Math.floor(Math.random() * 15 + 20);
    document.getElementById('hum').value  = Math.floor(Math.random() * 40 + 50);
    document.getElementById('rain').value = Math.floor(Math.random() * 200 + 50);
    updateAllSliders();
    livePreviewCrop();
    showToast(t('weather_filled'));
}

function showToast(msg) {
    const toast = document.getElementById('toast');
    toast.textContent = msg;
    toast.style.display = 'block';
    clearTimeout(toast._t);
    toast._t = setTimeout(() => { toast.style.display = 'none'; }, 3000);
}

function toggleChat() {
    const panel = document.getElementById('chatPanel');
    const toggle = document.getElementById('chatToggle');
    const container = document.getElementById('mainContainer');
    isChatVisible = !isChatVisible;
    panel.style.display = isChatVisible ? 'flex' : 'none';
    container.classList.toggle('chat-hidden', !isChatVisible);
    toggle.innerHTML = isChatVisible ? '✕' : '💬';
}

function speakText(text) {
    if ('speechSynthesis' in window) {
        speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(text.replace(/<[^>]+>/g,''));
        u.lang = { en:'en-US', ml:'ml-IN', hi:'hi-IN', kn:'kn-IN', ta:'ta-IN', te:'te-IN' }[currentLanguage] || 'en-US';
        u.rate = 0.85;
        speechSynthesis.speak(u);
    }
}

function startChatVoice() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { showToast(t('voice_not_supported')); return; }
    const rec = new SR();
    rec.lang = { en:'en-US', ml:'ml-IN', hi:'hi-IN', kn:'kn-IN', ta:'ta-IN', te:'te-IN' }[currentLanguage] || 'en-US';
    rec.interimResults = false;
    const btn = document.getElementById('chatVoiceBtn');
    btn.classList.add('listening');
    showToast(t('voice_listening'));
    rec.start();
    rec.onresult = e => { document.getElementById('chatInput').value = e.results[0][0].transcript; btn.classList.remove('listening'); sendChatMessage(); };
    rec.onerror = rec.onend = () => btn.classList.remove('listening');
}

// ==========================================================
// GROQ API KEY MANAGEMENT
// ==========================================================
(function() {
    const GROQ_KEY = 'jeevmitra_groq_key';

    function saveKey() {
        const key = document.getElementById('apiKeyInput').value.trim();
        if (!key.startsWith('gsk_') || key.length < 20) {
            alert('❌ Invalid key. Groq keys start with gsk_...');
            return;
        }
        localStorage.setItem(GROQ_KEY, key);
        window._groqApiKey = key;
        closeModal();
        // Send to local server if running
        fetch('/groq-setkey', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({key}) }).catch(()=>{});
        updateBar(true);
        showToast('✅ Groq key saved! AI features activated.');
    }

    function closeModal() { document.getElementById('apiModal').style.display = 'none'; }

    function updateBar(connected) {
        const bar = document.getElementById('apiKeyBar');
        const status = document.getElementById('apiKeyStatus');
        bar.style.display = 'flex';
        if (connected) {
            status.textContent = '⚡ Groq AI Connected ✓ (click to change)';
            bar.style.background = '#5c4b9e';
        } else {
            status.textContent = '🔑 Click here to enter your FREE Groq API key';
            bar.style.background = '#c77b00';
        }
    }

    function showApiModal() {
        document.getElementById('apiModal').style.display = 'flex';
        setTimeout(() => document.getElementById('apiKeyInput').focus(), 100);
    }
    window.showApiModal = showApiModal;

    document.addEventListener('DOMContentLoaded', () => {
        const saved = localStorage.getItem(GROQ_KEY);
        if (saved) {
            window._groqApiKey = saved;
            fetch('/groq-setkey', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({key:saved}) }).catch(()=>{});
            updateBar(true);
        } else {
            updateBar(false);
            setTimeout(showApiModal, 900);
        }
        document.getElementById('saveKeyBtn').addEventListener('click', saveKey);
        document.getElementById('skipKeyBtn').addEventListener('click', closeModal);
        document.getElementById('apiKeyBar').addEventListener('click', showApiModal);
        document.getElementById('apiKeyInput').addEventListener('keypress', e => { if (e.key === 'Enter') saveKey(); });
    });
})();

// ==========================================================
// INIT
// ==========================================================
document.addEventListener('DOMContentLoaded', () => {
    updateAllSliders();
    loadMarketPrices();
    applyTranslations();
    livePreviewCrop();
    predictYield();
    renderCalendar();
    const wEl = document.getElementById('welcome-message');
    if (wEl) wEl.textContent = t('chat_welcome');
    console.log('🌿 JeevanMitra AI — 20 crops, soil type filter, irrigation factor, crop calendar, bacterial spot disease, sort market, bug fixes. Upgraded from KrishiAI.');
});

window.addEventListener('resize', () => {
    if (document.getElementById('tab-market')?.classList.contains('active')) drawPriceChart();
});
