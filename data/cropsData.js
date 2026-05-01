/**
 * cropsData.js — JeevanMitra AI
 * Central crop database: parameters, market info, seasons, emoji
 * 20 crops with NPK, climate, soil requirements
 */

'use strict';

/* ── CROP DATABASE ── */
const CROP_DB = {
  rice:      {N:[60,120,20,140],P:[30,60,10,80], K:[30,60,10,80], temp:[20,30,18,36],hum:[70,100,60,100],ph:[5.5,7.0,5.0,7.5],rain:[150,300,100,350],emoji:'🌾',market:2200,marketLoc:'Kochi',    trend:'up',   soilTypes:['alluvial','black'],  seasons:['Kharif']},
  wheat:     {N:[60,120,20,140],P:[30,60,10,80], K:[30,60,10,80], temp:[10,22,5,26], hum:[30,60,25,70], ph:[6.0,7.5,5.5,8.0],rain:[50,120,30,150],  emoji:'🌿',market:2150,marketLoc:'Delhi',    trend:'stable',soilTypes:['alluvial','sandy'], seasons:['Rabi']},
  maize:     {N:[80,120,40,140],P:[40,70,20,90], K:[40,70,20,90], temp:[18,27,15,35],hum:[50,70,40,80], ph:[5.8,7.0,5.5,7.5],rain:[80,120,60,150],  emoji:'🌽',market:1900,marketLoc:'Mumbai',   trend:'up',   soilTypes:['alluvial','red'],    seasons:['Kharif','Rabi']},
  cotton:    {N:[60,100,30,130],P:[30,60,15,80], K:[40,80,20,100],temp:[25,35,20,40],hum:[40,60,30,70], ph:[6.0,8.0,5.5,8.5],rain:[60,100,40,120],  emoji:'🪴',market:6500,marketLoc:'Ahmedabad',trend:'up',   soilTypes:['black'],            seasons:['Kharif']},
  sugarcane: {N:[80,130,50,140],P:[40,70,20,90], K:[80,140,50,160],temp:[20,30,18,38],hum:[50,80,40,90], ph:[5.5,7.5,5.0,8.0],rain:[100,200,80,250], emoji:'🌱',market:350, marketLoc:'Pune',     trend:'stable',soilTypes:['alluvial','black'], seasons:['Year-round']},
  millet:    {N:[20,60,5,90],  P:[20,50,10,70], K:[20,50,10,70], temp:[27,35,22,42],hum:[30,55,20,65], ph:[6.0,7.5,5.5,8.0],rain:[30,80,20,100],   emoji:'🌾',market:2800,marketLoc:'Bangalore',trend:'up',   soilTypes:['sandy','red'],      seasons:['Kharif']},
  banana:    {N:[80,130,50,140],P:[30,60,15,80], K:[80,140,50,160],temp:[22,30,18,38],hum:[70,90,60,100],ph:[5.5,7.0,5.0,7.5],rain:[120,200,80,250], emoji:'🍌',market:2500,marketLoc:'Trivandrum',trend:'up',soilTypes:['alluvial','hilly'], seasons:['Year-round']},
  potato:    {N:[60,120,30,140],P:[50,90,30,110],K:[60,100,40,120],temp:[15,22,10,28],hum:[50,80,40,90], ph:[4.5,6.5,4.0,7.0],rain:[60,120,40,150],  emoji:'🥔',market:1800,marketLoc:'Kolkata',   trend:'stable',soilTypes:['alluvial','sandy'], seasons:['Rabi']},
  groundnut: {N:[10,40,5,60],  P:[40,80,20,100],K:[30,60,15,80], temp:[25,35,20,40],hum:[40,60,30,75], ph:[5.5,7.0,5.0,7.5],rain:[50,100,30,120],  emoji:'🥜',market:5500,marketLoc:'Chennai',   trend:'up',   soilTypes:['red','sandy'],      seasons:['Kharif','Rabi']},
  tomato:    {N:[70,120,40,140],P:[50,90,30,110],K:[60,100,40,120],temp:[18,27,15,32],hum:[50,75,40,85], ph:[5.5,7.0,5.0,7.5],rain:[60,150,40,200],  emoji:'🍅',market:1500,marketLoc:'Nasik',     trend:'up',   soilTypes:['alluvial','red'],    seasons:['Rabi','Summer']},
  onion:     {N:[50,100,20,120],P:[40,80,20,100],K:[50,100,30,120],temp:[13,24,10,30],hum:[40,70,30,80], ph:[5.8,7.0,5.5,7.5],rain:[50,120,30,150],  emoji:'🧅',market:2000,marketLoc:'Lasalgaon',trend:'stable',soilTypes:['alluvial','sandy'], seasons:['Rabi','Kharif']},
  soybean:   {N:[10,30,5,50],  P:[40,80,20,100],K:[30,60,15,80], temp:[20,30,15,35],hum:[50,75,40,85], ph:[6.0,7.0,5.5,7.5],rain:[60,150,40,200],  emoji:'🫘',market:4200,marketLoc:'Indore',    trend:'up',   soilTypes:['alluvial','black'], seasons:['Kharif']},
  chickpea:  {N:[10,40,5,60],  P:[40,80,20,100],K:[20,50,10,70], temp:[20,30,15,35],hum:[30,60,20,70], ph:[5.5,7.5,5.0,8.0],rain:[40,100,25,130],  emoji:'🫛',market:5000,marketLoc:'Jaipur',    trend:'stable',soilTypes:['black','sandy'],   seasons:['Rabi']},
  jowar:     {N:[30,80,10,100],P:[20,50,10,70], K:[20,50,10,70], temp:[25,35,20,42],hum:[25,55,15,65], ph:[6.0,7.5,5.5,8.0],rain:[30,100,20,130],  emoji:'🌾',market:2600,marketLoc:'Solapur',   trend:'stable',soilTypes:['black','red'],     seasons:['Kharif','Rabi']},
  mustard:   {N:[40,80,20,100],P:[30,60,15,80], K:[20,50,10,70], temp:[10,20,5,25], hum:[30,60,20,70], ph:[6.0,7.5,5.5,8.0],rain:[30,80,20,100],   emoji:'🌻',market:5200,marketLoc:'Jaipur',    trend:'up',   soilTypes:['alluvial','sandy'], seasons:['Rabi']},
  turmeric:  {N:[60,120,30,140],P:[40,70,20,90],K:[60,120,30,140],temp:[20,30,18,35],hum:[60,90,50,100],ph:[4.5,7.0,4.0,7.5],rain:[120,250,80,300], emoji:'🟡',market:8000,marketLoc:'Erode',     trend:'up',   soilTypes:['red','hilly'],      seasons:['Kharif']},
  ginger:    {N:[50,100,20,120],P:[40,80,20,100],K:[80,140,50,160],temp:[20,30,18,35],hum:[60,90,50,100],ph:[5.5,7.0,5.0,7.5],rain:[120,250,80,300], emoji:'🫚',market:10000,marketLoc:'Cochin',  trend:'up',   soilTypes:['red','hilly'],      seasons:['Kharif']},
  coconut:   {N:[40,80,20,100],P:[30,60,15,80], K:[80,160,50,200],temp:[27,35,22,40],hum:[70,95,60,100],ph:[5.5,7.5,5.0,8.0],rain:[150,300,100,350],emoji:'🥥',market:2000,marketLoc:'Trivandrum',trend:'stable',soilTypes:['sandy','hilly'],  seasons:['Year-round']},
  mango:     {N:[40,80,20,100],P:[30,60,15,80], K:[40,80,20,100], temp:[24,30,20,40],hum:[40,70,30,80], ph:[5.5,7.5,5.0,8.0],rain:[80,200,50,250],  emoji:'🥭',market:3500,marketLoc:'Ratnagiri', trend:'up',   soilTypes:['alluvial','red'],    seasons:['Summer']},
  papaya:    {N:[60,120,30,140],P:[40,80,20,100],K:[50,100,30,120],temp:[22,32,18,38],hum:[60,80,50,90], ph:[5.5,7.0,5.0,7.5],rain:[100,200,70,250], emoji:'🍈',market:1200,marketLoc:'Pune',     trend:'stable',soilTypes:['alluvial','sandy'], seasons:['Year-round']}
};

/* ── SOIL TYPE BONUSES ── */
const SOIL_BONUS = {
  rice:      {alluvial:0.10, black:0.05},
  wheat:     {alluvial:0.10, sandy:0.05},
  maize:     {alluvial:0.08, red:0.05},
  cotton:    {black:0.15},
  sugarcane: {alluvial:0.10, black:0.08},
  millet:    {sandy:0.12, red:0.08},
  banana:    {alluvial:0.10, hilly:0.05},
  potato:    {alluvial:0.10, sandy:0.08},
  groundnut: {red:0.10, sandy:0.10},
  tomato:    {alluvial:0.08, red:0.05},
  onion:     {alluvial:0.08, sandy:0.05},
  soybean:   {alluvial:0.08, black:0.08},
  chickpea:  {black:0.10, sandy:0.05},
  jowar:     {black:0.10, red:0.08},
  mustard:   {alluvial:0.10, sandy:0.08},
  turmeric:  {red:0.10, hilly:0.08},
  ginger:    {red:0.10, hilly:0.12},
  coconut:   {sandy:0.10, hilly:0.05},
  mango:     {alluvial:0.08, red:0.10},
  papaya:    {alluvial:0.10, sandy:0.05}
};

/* ── CROP NAMES (6 languages) ── */
const cropNames = {
  en: {rice:'Rice',wheat:'Wheat',maize:'Maize',cotton:'Cotton',sugarcane:'Sugarcane',millet:'Millet',banana:'Banana',potato:'Potato',groundnut:'Groundnut',tomato:'Tomato',onion:'Onion',soybean:'Soybean',chickpea:'Chickpea',jowar:'Jowar',mustard:'Mustard',turmeric:'Turmeric',ginger:'Ginger',coconut:'Coconut',mango:'Mango',papaya:'Papaya'},
  kn: {rice:'ಭತ್ತ',wheat:'ಗೋಧಿ',maize:'ಮೆಕ್ಕೆಜೋಳ',cotton:'ಹತ್ತಿ',sugarcane:'ಕಬ್ಬು',millet:'ಸಜ್ಜೆ',banana:'ಬಾಳೆ',potato:'ಆಲೂಗಡ್ಡೆ',groundnut:'ನೆಲಗಡಲೆ',tomato:'ಟೊಮೆಟೊ',onion:'ಈರುಳ್ಳಿ',soybean:'ಸೋಯಾ',chickpea:'ಕಡಲೆ',jowar:'ಜೋಳ',mustard:'ಸಾಸಿವೆ',turmeric:'ಅರಿಷಿಣ',ginger:'ಶುಂಠಿ',coconut:'ತೆಂಗಿನ',mango:'ಮಾವು',papaya:'ಪಪಾಯ'},
  hi: {rice:'चावल',wheat:'गेहूं',maize:'मक्का',cotton:'कपास',sugarcane:'गन्ना',millet:'बाजरा',banana:'केला',potato:'आलू',groundnut:'मूंगफली',tomato:'टमाटर',onion:'प्याज',soybean:'सोयाबीन',chickpea:'चना',jowar:'ज्वार',mustard:'सरसों',turmeric:'हल्दी',ginger:'अदरक',coconut:'नारियल',mango:'आम',papaya:'पपीता'},
  ml: {rice:'നെല്ല്',wheat:'ഗോതമ്പ്',maize:'ചോളം',cotton:'പരുത്തി',sugarcane:'കരിമ്പ്',millet:'തിന',banana:'വാഴ',potato:'ഉരുളക്കിഴങ്ങ്',groundnut:'നിലക്കടല',tomato:'തക്കാളി',onion:'ഉള്ളി',soybean:'സോയ',chickpea:'കടല',jowar:'ജോലാ',mustard:'കടുക്',turmeric:'മഞ്ഞൾ',ginger:'ഇഞ്ചി',coconut:'തേങ്ങ',mango:'മാങ്ങ',papaya:'പപ്പായ'},
  ta: {rice:'நெல்',wheat:'கோதுமை',maize:'மக்காச்சோளம்',cotton:'பருத்தி',sugarcane:'கரும்பு',millet:'கம்பு',banana:'வாழை',potato:'உருளை',groundnut:'நிலக்கடலை',tomato:'தக்காளி',onion:'வெங்காயம்',soybean:'சோயா',chickpea:'கொண்டைக்கடலை',jowar:'சோளம்',mustard:'கடுகு',turmeric:'மஞ்சள்',ginger:'இஞ்சி',coconut:'தேங்காய்',mango:'மாம்பழம்',papaya:'பப்பாளி'},
  te: {rice:'వరి',wheat:'గోధుమ',maize:'మొక్కజొన్న',cotton:'పత్తి',sugarcane:'చెరకు',millet:'జొన్న',banana:'అరటి',potato:'బంగాళాదుంప',groundnut:'వేరుశెనగ',tomato:'టొమాటో',onion:'ఉల్లిపాయ',soybean:'సోయాబీన్',chickpea:'శనగలు',jowar:'జొన్న',mustard:'ఆవాలు',turmeric:'పసుపు',ginger:'అల్లం',coconut:'కొబ్బరి',mango:'మామిడి',papaya:'బొప్పాయి'}
};

/* Helper: localised crop name */
function lcn(k) {
  return cropNames[window.currentLanguage]?.[k] || cropNames.en[k] || k;
}
