/**
 * Agronomic Recommendation Engine for KRISHI VAANI
 * Computes dynamic, verified crop suitability scores based on real weather telemetry,
 * active season, location / agro-climatic zone, and soil characteristics.
 */

const AGRONOMIC_CROP_DATABASE = [
    // --- CEREALS ---
    {
        id: 'paddy',
        slug: 'paddy',
        category: 'cereals',
        names: {
            en: 'Paddy (Rice)',
            te: 'వరి (Paddy)',
            kn: 'ಭತ್ತ (Paddy)',
            hi: 'धान (Paddy)',
            ta: 'நெல் (Paddy)',
            ml: 'നെല്ല് (Paddy)'
        },
        catLabels: {
            en: 'Cereal Crop',
            te: 'ధాన్యపు పంట',
            kn: 'ಧಾನ್ಯದ ಬೆಳೆ',
            hi: 'अनाज फसल',
            ta: 'தானியப் பயிர்',
            ml: 'ധാന്യ വിള'
        },
        seasons: ['kharif', 'summer'],
        tempMin: 18,
        tempMax: 38,
        tempIdealMin: 22,
        tempIdealMax: 32,
        humidityIdealMin: 60,
        humidityIdealMax: 90,
        waterNeed: 'High (1100–1250 mm)',
        waterNeedKey: 'high',
        preferredSoils: ['clayey loam', 'alluvial', 'loamy', 'black cotton', 'clay'],
        duration: {
            en: '110 – 130 days',
            te: '110 – 130 రోజులు',
            kn: '110 – 130 ದಿನಗಳು',
            hi: '110 – 130 दिन',
            ta: '110 – 130 நாட்கள்',
            ml: '110 – 130 ദിവസങ്ങൾ'
        },
        sowing: {
            en: 'June – July (Kharif) / Nov – Dec (Rabi/Summer)',
            te: 'జూన్ – జూలై (ఖరీఫ్) / నవంబరు – డిసెంబరు',
            kn: 'ಜೂನ್ – ಜುಲೈ (ಖಾರೀಫ್) / ನವೆಂಬರ್ – ಡಿಸೆಂಬರ್',
            hi: 'जून – जुलाई (खरीफ) / नवंबर – दिसंबर',
            ta: 'ஜூன் – ஜூலை / நவம்பர் – டிசம்பர்',
            ml: 'ജൂൺ – ജൂലൈ / നവംബർ – ഡിസംബർ'
        },
        soil: {
            en: 'Clayey loam, Deep alluvial soils with good moisture retention',
            te: 'బంకమట్టి లేదా సారవంతమైన రేగడి నేలలు',
            kn: 'ಜೇಡಿ ಗೋಡು ಮಣ್ಣು ಹಾಗೂ ಫಲವತ್ತಾದ ಮಣ್ಣು',
            hi: 'चिकनी दोमट एवं गहरी जलोढ़ मिट्टी',
            ta: 'களிமண் நிலம் மற்றும் வண்டல் மண்',
            ml: 'കളിമണ്ണ്, പശിമരാശി മണ്ണ്'
        },
        spacing: '20 cm x 15 cm',
        varieties: ['Jyothi', 'Jaya', 'IR 64', 'Swarna (MTU-7029)', 'BPT-5204 (Samba Mahsuri)', 'MTU-1010'],
        primaryStates: ['Karnataka', 'Andhra Pradesh', 'Telangana', 'Tamil Nadu', 'Kerala', 'West Bengal', 'Punjab', 'Uttar Pradesh', 'Bihar', 'Odisha'],
        aiTip: {
            en: 'Maintain 2–3 cm shallow standing water during early tillering. Incorporate balanced NPK (100:50:50 kg/ha).',
            te: 'పిలకలు తొడిగే దశలో 2–3 సెం.మీ నీటి మట్టం ఉంచండి. సమతుల్య ఎరువులను వాడండి.',
            kn: 'ತೆನೆ ಒಡೆಯುವ ಹಂತದಲ್ಲಿ ೨-೩ ಸೆಂ.ಮೀ ನೀರನ್ನು ನಿಲ್ಲಿಸಿ. ಸಮತೋಲಿತ ರಸಗೊಬ್ಬರ ಬಳಸಿ.',
            hi: 'कल्ले फूटते समय खेत में 2-3 सेमी पानी बनाए रखें और संतुलित एनपीके का प्रयोग करें।',
            ta: 'தூர்கட்டும் பருவத்தில் 2-3 செ.மீ தண்ணீர் இருக்குமாறு பார்த்துக்கொள்ளவும்.',
            ml: 'ചിനപ്പ് പൊട്ടുന്ന ഘട്ടത്തിൽ 2-3 സെ.മീ വെള്ളം നിലനിർത്തുക.'
        }
    },
    {
        id: 'ragi',
        slug: 'ragi',
        category: 'cereals',
        names: {
            en: 'Ragi (Finger Millet)',
            te: 'రాగులు (Finger Millet)',
            kn: 'ರಾಗಿ (Finger Millet)',
            hi: 'रागी (Finger Millet)',
            ta: 'கேழ்வரகு (Ragi)',
            ml: 'റാഗി (Finger Millet)'
        },
        catLabels: {
            en: 'Cereal / Millet',
            te: 'చిరుధాన్యపు పంట',
            kn: 'ಸಿರಿಧಾನ್ಯದ ಬೆಳೆ',
            hi: 'मोटा अनाज फसल',
            ta: 'சிறு தானியம்',
            ml: 'സിരിധാന്യം'
        },
        seasons: ['kharif', 'summer'],
        tempMin: 15,
        tempMax: 38,
        tempIdealMin: 22,
        tempIdealMax: 32,
        humidityIdealMin: 45,
        humidityIdealMax: 80,
        waterNeed: 'Low to Medium (350–500 mm)',
        waterNeedKey: 'medium',
        preferredSoils: ['red sandy loam', 'red loamy', 'gravelly', 'light black'],
        duration: {
            en: '105 – 120 days',
            te: '105 – 120 రోజులు',
            kn: '105 – 120 ದಿನಗಳು',
            hi: '105 – 120 दिन',
            ta: '105 – 120 நாட்கள்',
            ml: '105 – 120 ദിവസങ്ങൾ'
        },
        sowing: {
            en: 'June – August (Kharif)',
            te: 'జూన్ – ఆగస్టు (ఖరీఫ్)',
            kn: 'ಜೂನ್ – ಆಗಸ್ಟ್ (ಖಾರೀಫ್)',
            hi: 'जून – अगस्त (खरीफ)',
            ta: 'ஜூன் – ஆகஸ்ட்',
            ml: 'ജൂൺ – ആഗസ്റ്റ്'
        },
        soil: {
            en: 'Red sandy loam, porous and well-drained soil',
            te: 'ఎర్ర ఇసుక లేదా గరప నేలలు',
            kn: 'ಕೆಂಪು ಮರಳು ಗೋಡು ಮಣ್ಣು',
            hi: 'लाल बलुई दोमट मिट्टी',
            ta: 'செம்மண் நிலம்',
            ml: 'ചുവന്ന മണ്ണ്'
        },
        spacing: '22 cm x 10 cm',
        varieties: ['GPU-28', 'ML-365', 'MR-1', 'KMR-301', 'GPU-48', 'Indaf-9'],
        primaryStates: ['Karnataka', 'Tamil Nadu', 'Andhra Pradesh', 'Odisha', 'Maharashtra', 'Uttarakhand'],
        aiTip: {
            en: 'Highly drought tolerant. Intercropping with Tur Dal (4:2 or 8:2) enhances nitrogen fixation and total farm income.',
            te: 'కరువును తట్టుకుంటుంది. కందితో 4:2 లేదా 8:2 నిష్పత్తిలో అంతరపంటగా వేస్తే లాభదాయకం.',
            kn: 'ಬರ ನಿರೋಧಕ ಬೆಳೆ. ತೊಗರಿ ಜತೆ ೪:೨ ಅಥವಾ ೮:೨ ಪ್ರಮಾಣದಲ್ಲಿ ಮಿಶ್ರ ಬೆಳೆ ಮಾಡಿ.',
            hi: 'सूखा प्रतिरोधी फसल। अरहर के साथ 4:2 अनुपात में अंतःफसल लेने से लाभ बढ़ता है।',
            ta: 'வறட்சியைத் தாங்கும். துவரையுடன் ஊடுபயிராகப் பயிரிடலாம்.',
            ml: 'വരൾച്ചയെ പ്രതിരോധിക്കുന്ന വിള. തുവരപ്പയറുമായി ഇടവിളയാക്കുക.'
        }
    },
    {
        id: 'maize',
        slug: 'maize',
        category: 'cereals',
        names: {
            en: 'Maize (Corn)',
            te: 'మొక్కజొన్న (Maize)',
            kn: 'ಮೆಕ್ಕೆಜೋಳ (Maize)',
            hi: 'मक्का (Maize)',
            ta: 'மக்காச்சோளம் (Maize)',
            ml: 'ചോളം (Maize)'
        },
        catLabels: {
            en: 'Cereal Crop',
            te: 'ధాన్యపు పంట',
            kn: 'ಧಾನ್ಯದ ಬೆಳೆ',
            hi: 'अनाज फसल',
            ta: 'தானியப் பயிர்',
            ml: 'ധാന്യ വിള'
        },
        seasons: ['kharif', 'rabi'],
        tempMin: 16,
        tempMax: 38,
        tempIdealMin: 21,
        tempIdealMax: 30,
        humidityIdealMin: 45,
        humidityIdealMax: 75,
        waterNeed: 'Medium (500–600 mm)',
        waterNeedKey: 'medium',
        preferredSoils: ['deep fertile loam', 'red sandy loam', 'alluvial'],
        duration: {
            en: '95 – 110 days',
            te: '95 – 110 రోజులు',
            kn: '95 – 110 ದಿನಗಳು',
            hi: '95 – 110 दिन',
            ta: '95 – 110 நாட்கள்',
            ml: '95 – 110 ദിവസങ്ങൾ'
        },
        sowing: {
            en: 'June – July (Kharif) / Oct – Nov (Rabi)',
            te: 'జూన్ – జూలై / అక్టోబరు – నవంబరు',
            kn: 'ಜೂನ್ – ಜುಲೈ / ಅಕ್ಟೋಬರ್ – ನವೆಂಬರ್',
            hi: 'जून – जुलाई / अक्टूबर – नवंबर',
            ta: 'ஜூன் – ஜூலை / அக்டோபர் – நவம்பர்',
            ml: 'ജൂൺ – ജൂലൈ / ഒക്ടോബർ – നവംബർ'
        },
        soil: {
            en: 'Deep fertile loam with good drainage and organic matter',
            te: 'లోతైన సారవంతమైన గరప నేలలు',
            kn: 'ಆಳವಾದ ಫಲವತ್ತಾದ ಗೋಡು ಮಣ್ಣು',
            hi: 'गहरी उपजाऊ दोमट मिट्टी',
            ta: 'வளமான வண்டல் நிலம்',
            ml: 'ഫലഭൂയിഷ്ഠമായ പശിമരാശി മണ്ണ്'
        },
        spacing: '60 cm x 20 cm',
        varieties: ['Deccan-103', 'Ganga-11', 'HQPM-1', 'Bio-9681', 'NK-6240', 'CP-818'],
        primaryStates: ['Karnataka', 'Telangana', 'Andhra Pradesh', 'Bihar', 'Madhya Pradesh', 'Maharashtra', 'Rajasthan'],
        aiTip: {
            en: 'Install pheromone traps (4/acre) at 15 days after emergence to monitor Fall Armyworm (FAW).',
            te: 'కత్తెర పురుగు నివారణకు మొలక వచ్చిన 15 రోజులకే ఎకరాకు 4 లింగాకర్షక బుట్టలు పెట్టండి.',
            kn: 'ಲದ್ದಿ ಹುಳು ತಡೆಗಟ್ಟಲು ಬಿತ್ತಿದ ೧೫ ದಿನಗಳಲ್ಲಿ ಎಕರೆಗೆ ೪ ಮೋಹಕ ಬಲೆ ಅಳವಡಿಸಿ.',
            hi: 'फॉल आर्मीवर्म की निगरानी के लिए अंकुरण के 15 दिन बाद 4 फेरोमोन ट्रैप/एकड़ लगाएं।',
            ta: 'படைப்புழுவைக் கண்காணிக்க ஏக்கருக்கு 4 இனக்கவர்ச்சி பொறிகள் வைக்கவும்.',
            ml: 'കീട നിരീക്ഷണത്തിനായി ഏക്കറിന് 4 ഫിറമോൺ കെണികൾ സ്ഥാപിക്കുക.'
        }
    },
    {
        id: 'jowar',
        slug: 'jowar',
        category: 'cereals',
        names: {
            en: 'Jowar (Sorghum)',
            te: 'జొన్నలు (Jowar)',
            kn: 'ಜೋಳ (Sorghum)',
            hi: 'ज्वार (Sorghum)',
            ta: 'சோளம் (Sorghum)',
            ml: 'ചോളം (Jowar)'
        },
        catLabels: {
            en: 'Cereal / Millet',
            te: 'చిరుధాన్యపు పంట',
            kn: 'ಸಿರಿಧಾನ್ಯದ ಬೆಳೆ',
            hi: 'मोटा अनाज फसल',
            ta: 'சிறு தானியம்',
            ml: 'സിരിധാന്യം'
        },
        seasons: ['kharif', 'rabi'],
        tempMin: 18,
        tempMax: 40,
        tempIdealMin: 25,
        tempIdealMax: 34,
        humidityIdealMin: 35,
        humidityIdealMax: 70,
        waterNeed: 'Low (350–450 mm)',
        waterNeedKey: 'low',
        preferredSoils: ['deep black cotton', 'medium black', 'clayey loam'],
        duration: {
            en: '100 – 115 days',
            te: '100 – 115 రోజులు',
            kn: '100 – 115 ದಿನಗಳು',
            hi: '100 – 115 दिन',
            ta: '100 – 115 நாட்கள்',
            ml: '100 – 115 ദിവസങ്ങൾ'
        },
        sowing: {
            en: 'June – July (Kharif) / Sept – Oct (Rabi)',
            te: 'జూన్ – జూలై / సెప్టెంబరు – అక్టోబరు',
            kn: 'ಜೂನ್ – ಜುಲೈ / ಸೆಪ್ಟೆಂಬರ್ – ಅಕ್ಟೋಬರ್',
            hi: 'जून – जुलाई / सितंबर – अक्टूबर',
            ta: 'ஜூன் – ஜூலை / செப்டம்பர் – அக்டோபர்',
            ml: 'ജൂൺ – ജൂലൈ / സെപ്റ്റംബർ – ഒക്ടോബർ'
        },
        soil: {
            en: 'Deep black cotton soils with high moisture retention',
            te: 'తేమను నిలుపుకునే నల్లరేగడి నేలలు',
            kn: 'ತೇವಾಂಶ ಉಳಿಸಿಕೊಳ್ಳುವ ಕಪ್ಪು ಮಣ್ಣು',
            hi: 'गहरी काली कपास मिट्टी',
            ta: 'கரிசல் மண்',
            ml: 'കറുത്ത മണ്ണ്'
        },
        spacing: '45 cm x 15 cm',
        varieties: ['Maldandi (M-35-1)', 'CSH-14', 'CSH-16', 'DSV-4', 'CSV-216R'],
        primaryStates: ['Maharashtra', 'Karnataka', 'Rajasthan', 'Tamil Nadu', 'Andhra Pradesh', 'Madhya Pradesh'],
        aiTip: {
            en: 'Requires minimum irrigation. Excellent drought resistance with high fodder value.',
            te: 'తక్కువ నీటితో పండుతుంది, పశుగ్రాసానికి కూడా ఎంతో అనుకూలం.',
            kn: 'ಕಡಿಮೆ ನೀರಾವರಿ ಸಾಕು, ಮೇವಿನ ಗುಣಮಟ್ಟವೂ ಅತ್ಯುತ್ತಮ.',
            hi: 'कम सिंचाई में अच्छी पैदावार व उत्तम पशु चारा प्रदान करती है।',
            ta: 'குறைந்த நீர் போதுமானது, தீவனத்திற்கும் சிறந்தது.',
            ml: 'കുറഞ്ഞ വെള്ളം മതി, നല്ല തീറ്റപ്പുല്ലും ലഭിക്കും.'
        }
    },

    // --- PULSES ---
    {
        id: 'tur-dal',
        slug: 'tur-dal',
        category: 'pulses',
        names: {
            en: 'Tur Dal (Pigeon Pea)',
            te: 'కంది (Tur Dal)',
            kn: 'ತೊಗರಿ (Pigeon Pea)',
            hi: 'अरहर / तुअर (Pigeon Pea)',
            ta: 'துவரம் பருப்பு (Tur Dal)',
            ml: 'തുവരപ്പയർ (Pigeon Pea)'
        },
        catLabels: {
            en: 'Pulse Crop',
            te: 'పప్పుధాన్యపు పంట',
            kn: 'ದ್ವಿದಳ ಧಾನ್ಯದ ಬೆಳೆ',
            hi: 'दलहन फसल',
            ta: 'பருப்புப் பயிர்',
            ml: 'പയർ വിള'
        },
        seasons: ['kharif'],
        tempMin: 18,
        tempMax: 38,
        tempIdealMin: 22,
        tempIdealMax: 32,
        humidityIdealMin: 45,
        humidityIdealMax: 75,
        waterNeed: 'Medium (400–550 mm)',
        waterNeedKey: 'medium',
        preferredSoils: ['deep loamy', 'well-drained red loam', 'black soil'],
        duration: {
            en: '150 – 180 days',
            te: '150 – 180 రోజులు',
            kn: '150 – 180 ದಿನಗಳು',
            hi: '150 – 180 दिन',
            ta: '150 – 180 நாட்கள்',
            ml: '150 – 180 ദിവസങ്ങൾ'
        },
        sowing: {
            en: 'June – July (Kharif)',
            te: 'జూన్ – జూలై (ఖరీఫ్)',
            kn: 'ಜೂನ್ – ಜುಲೈ (ಖಾರೀಫ್)',
            hi: 'जून – जुलाई (खरीफ)',
            ta: 'ஜூன் – ஜூலை',
            ml: 'జൂൺ – ജൂലൈ'
        },
        soil: {
            en: 'Deep well-drained loamy soil, avoids waterlogging',
            te: 'నీరు నిల్వ ఉండని లోతైన గరప నేలలు',
            kn: 'ನೀರು ಬಸಿದುಹೋಗುವ ಆಳವಾದ ಗೋಡು ಮಣ್ಣು',
            hi: 'गहरी, जल निकासी वाली दोमट मिट्टी',
            ta: 'வண்டல் மண் நிலம்',
            ml: 'നീർവാർച്ചയുള്ള പശിമരാശി മണ്ണ്'
        },
        spacing: '90 cm x 20 cm',
        varieties: ['ICPL-87119 (Asha)', 'TS-3R', 'BRG-2', 'BSMR-736', 'Maruti (ICP-8863)', 'LRG-41'],
        primaryStates: ['Karnataka', 'Maharashtra', 'Madhya Pradesh', 'Telangana', 'Andhra Pradesh', 'Gujarat'],
        aiTip: {
            en: 'Treat seed with Rhizobium and PSB (10g/kg) to maximize atmospheric nitrogen fixation.',
            te: 'రైజోబియం మరియు పీఎస్‌బీతో విత్తన శుద్ధి చేసి నత్రజని స్థిరీకరణను పెంచండి.',
            kn: 'ರೈಜೋಬಿಯಂ ಮತ್ತು ಪಿಎಸ್‌ಬಿ ಜೈವಿಕ ಗೊಬ್ಬರದಿಂದ ಬೀಜೋಪಚಾರ ಮಾಡಿ.',
            hi: 'राइजोबियम और पीएसबी से बीजोपचार कर नाइट्रोजन स्थिरीकरण बढ़ाएं।',
            ta: 'ரைசோபியம் கொண்டு விதை நேர்த்தி செய்யவும்.',
            ml: 'റൈസോബിയം ഉപയോഗിച്ച് വിത്ത് സംസ്കരണം നടത്തുക.'
        }
    },
    {
        id: 'green-gram',
        slug: 'green-gram',
        category: 'pulses',
        names: {
            en: 'Green Gram (Moong)',
            te: 'పెసలు (Moong)',
            kn: 'ಹೆಸರು ಕಾಳು (Moong)',
            hi: 'मूंग (Moong)',
            ta: 'பாசிப்பயறு (Moong)',
            ml: 'ചെറുപയർ (Moong)'
        },
        catLabels: {
            en: 'Pulse / Legume',
            te: 'పప్పుధాన్యపు పంట',
            kn: 'ದ್ವಿದಳ ಧಾನ್ಯ',
            hi: 'दलहन फसल',
            ta: 'பருப்புப் பயிர்',
            ml: 'പയർ വിള'
        },
        seasons: ['kharif', 'summer'],
        tempMin: 20,
        tempMax: 40,
        tempIdealMin: 25,
        tempIdealMax: 35,
        humidityIdealMin: 40,
        humidityIdealMax: 70,
        waterNeed: 'Low (250–350 mm)',
        waterNeedKey: 'low',
        preferredSoils: ['fertile loam', 'red sandy loam', 'alluvial'],
        duration: {
            en: '65 – 75 days',
            te: '65 – 75 రోజులు',
            kn: '65 – 75 ದಿನಗಳು',
            hi: '65 – 75 दिन',
            ta: '65 – 75 நாட்கள்',
            ml: '65 – 75 ദിവസങ്ങൾ'
        },
        sowing: {
            en: 'June – July / March – April (Summer)',
            te: 'జూన్ – జూలై / మార్చి – ఏప్రిల్',
            kn: 'ಜೂನ್ – ಜುಲೈ / ಮಾರ್ಚ್ – ಏಪ್ರಿಲ್',
            hi: 'जून – जुलाई / मार्च – अप्रैल',
            ta: 'ஜூன் – ஜூலை / மார்ச் – ஏப்ரல்',
            ml: 'ജൂൺ – ജൂലൈ / മാർച്ച് – ഏപ്രിൽ'
        },
        soil: {
            en: 'Well-drained fertile loam to sandy loam',
            te: 'సారవంతమైన గరప నేలలు',
            kn: 'ಫಲವತ್ತಾದ ಗೋಡು ಮಣ್ಣು',
            hi: 'उपजाऊ दोमट मिट्टी',
            ta: 'வளமான வண்டல் மண்',
            ml: 'ഫലഭൂയിഷ്ഠമായ മണ്ണ്'
        },
        spacing: '30 cm x 10 cm',
        varieties: ['IPM 02-03', 'Pusa Vishal', 'Samrat', 'K-851', 'Shikha', 'DGGV-2'],
        primaryStates: ['Rajasthan', 'Maharashtra', 'Karnataka', 'Andhra Pradesh', 'Madhya Pradesh', 'Bihar'],
        aiTip: {
            en: 'Short-duration catch crop. Excellent for soil rejuvenation and crop rotation after cereals.',
            te: 'స్వల్పకాలిక పంట. ధాన్యాల తర్వాత పంట మార్పిడికి అత్యంత శ్రేష్టం.',
            kn: 'ಅಲ್ಪಾವಧಿಯ ಬೆಳೆ. ಮಣ್ಣಿನ ಫಲವತ್ತತೆ ಹೆಚ್ಚಿಸಲು ಬೆಳೆ ಪರಿವರ್ತನೆಗೆ ಸೂಕ್ತ.',
            hi: 'कम अवधि वाली फसल। अनाज के बाद फसल चक्र के लिए सर्वोत्तम।',
            ta: 'குறுகிய காலப் பயிர். பயிர் சுழற்சிக்கு சிறந்தது.',
            ml: 'വിളപരിവർത്തനത്തിന് ഏറ്റവും അനുയോജ്യമായ ഹ്രസ്വകാല വിള.'
        }
    },
    {
        id: 'bengal-gram',
        slug: 'bengal-gram',
        category: 'pulses',
        names: {
            en: 'Bengal Gram (Chickpea)',
            te: 'శనగలు (Chickpea)',
            kn: 'ಕಡಲೆ (Chickpea)',
            hi: 'चना (Chickpea)',
            ta: 'கொண்டைக்கடலை (Chickpea)',
            ml: 'കടല (Chickpea)'
        },
        catLabels: {
            en: 'Pulse Crop',
            te: 'పప్పుధాన్యపు పంట',
            kn: 'ದ್ವಿದಳ ಧಾನ್ಯ',
            hi: 'दलहन फसल',
            ta: 'பருப்புப் பயிர்',
            ml: 'പയർ വിള'
        },
        seasons: ['rabi'],
        tempMin: 12,
        tempMax: 30,
        tempIdealMin: 18,
        tempIdealMax: 26,
        humidityIdealMin: 30,
        humidityIdealMax: 60,
        waterNeed: 'Low (250–350 mm)',
        waterNeedKey: 'low',
        preferredSoils: ['deep black cotton', 'clay loam', 'medium black'],
        duration: {
            en: '90 – 105 days',
            te: '90 – 105 రోజులు',
            kn: '90 – 105 ದಿನಗಳು',
            hi: '90 – 105 दिन',
            ta: '90 – 105 நாட்கள்',
            ml: '90 – 105 ദിവസങ്ങൾ'
        },
        sowing: {
            en: 'October – November (Rabi)',
            te: 'అక్టోబరు – నవంబరు (రబీ)',
            kn: 'ಅಕ್ಟೋಬರ್ – ನವೆಂಬರ್ (ಹಿಂಗಾರು)',
            hi: 'अक्टूबर – नवंबर (रबी)',
            ta: 'அக்டோபர் – நவம்பர்',
            ml: 'ഒക്ടോബർ – നവംബർ'
        },
        soil: {
            en: 'Moisture retentive black soil with neutral pH',
            te: 'తేమను పట్టి ఉంచే నల్లరేగడి నేలలు',
            kn: 'ತೇವಾಂಶ ಉಳಿಸಿಕೊಳ್ಳುವ ಕಪ್ಪು ಮಣ್ಣು',
            hi: 'नमी युक्त काली दोमट मिट्टी',
            ta: 'கரிசல் நிலம்',
            ml: 'കറുത്ത മണ്ണ്'
        },
        spacing: '30 cm x 10 cm',
        varieties: ['JG-11', 'JAKI-9218', 'Annigeri-1', 'BGD-103', 'Pusa-372'],
        primaryStates: ['Madhya Pradesh', 'Maharashtra', 'Karnataka', 'Rajasthan', 'Andhra Pradesh', 'Uttar Pradesh'],
        aiTip: {
            en: 'Sow on residual moisture. Nipping at 30-35 DAS increases branching and pod load.',
            te: '30-35 రోజులప్పుడు చిగుళ్ళు తుంచడం (నిప్పింగ్) వల్ల కొమ్మలు, కాయలు పెరుగుతాయి.',
            kn: '೩೦-೩೫ ದಿನಗಳಲ್ಲಿ ತುದಿಯನ್ನು ಚಿವುಟುವುದರಿಂದ ಹೆಚ್ಚಿನ ಕೊಂಬೆಗಳು ಮತ್ತು ಇಳುವರಿ ಬರುತ್ತದೆ.',
            hi: '30-35 दिन बाद शीर्ष खोटाई (निपिंग) करने से शाखाएं और फलियां बढ़ती हैं।',
            ta: '30-35 நாட்களில் நுனியை கிள்ளிவிட்டால் கிளைகள் அதிகம் பிடிக்கும்.',
            ml: '30-35 ദിവസത്തിൽ അഗ്രം നുള്ളുന്നത് ശാഖകൾ കൂടാൻ സഹായിക്കും.'
        }
    },

    // --- VEGETABLES ---
    {
        id: 'okra',
        slug: 'bhindi',
        category: 'vegetables',
        names: {
            en: 'Okra (Bhindi / Ladyfinger)',
            te: 'బెండ (Okra)',
            kn: 'ಬೆಂಡೆಕಾಯಿ (Okra)',
            hi: 'भिंडी (Okra)',
            ta: 'வெண்டைக்காய் (Okra)',
            ml: 'വെണ്ടയ്ക്ക (Okra)'
        },
        catLabels: {
            en: 'Vegetable Crop',
            te: 'కూరగాయల పంట',
            kn: 'ತರಕಾರಿ ಬೆಳೆ',
            hi: 'सब्जी फसल',
            ta: 'காய்கறிப் பயிர்',
            ml: 'പച്ചക്കറി വിള'
        },
        seasons: ['kharif', 'summer'],
        tempMin: 18,
        tempMax: 38,
        tempIdealMin: 24,
        tempIdealMax: 32,
        humidityIdealMin: 55,
        humidityIdealMax: 85,
        waterNeed: 'Medium (400–500 mm)',
        waterNeedKey: 'medium',
        preferredSoils: ['rich sandy loam', 'clay loam', 'alluvial'],
        duration: {
            en: '90 – 100 days',
            te: '90 – 100 రోజులు',
            kn: '90 – 100 ದಿನಗಳು',
            hi: '90 – 100 दिन',
            ta: '90 – 100 நாட்கள்',
            ml: '90 – 100 ദിവസങ്ങൾ'
        },
        sowing: {
            en: 'June – July (Kharif) / Feb – March (Summer)',
            te: 'జూన్ – జూలై / ఫిబ్రవరి – మార్చి',
            kn: 'ಜೂನ್ – ಜುಲೈ / ಫೆಬ್ರವರಿ – ಮಾರ್ಚ್',
            hi: 'जून – जुलाई / फरवरी – मार्च',
            ta: 'ஜூன் – ஜூலை / பிப்ரவரி – மார்ச்',
            ml: 'ജൂൺ – ജൂലൈ / ഫെബ്രുവരി – മാർച്ച്'
        },
        soil: {
            en: 'Fertile sandy loam to clay loam rich in organic matter',
            te: 'సేంద్రియ కర్బనం గల ఇసుక గరప నేలలు',
            kn: 'ಸಾವಯವ ಸಮೃದ್ಧ ಗೋಡು ಮಣ್ಣು',
            hi: 'जीवांश युक्त उपजाऊ बलुई दोमट मिट्टी',
            ta: 'வளமான மணல் வண்டல் மண்',
            ml: 'സമ്പുഷ്ടമായ പശിമരാശി മണ്ണ്'
        },
        spacing: '45 cm x 30 cm',
        varieties: ['Arka Anamika', 'Pusa Sawani', 'Kashi Kranti', 'Syngenta 102', 'Mahyco 10'],
        primaryStates: ['Karnataka', 'Andhra Pradesh', 'Maharashtra', 'Gujarat', 'West Bengal', 'Bihar', 'Tamil Nadu'],
        aiTip: {
            en: 'Spray neem oil (3 ml/L) early morning to deter whiteflies and Yellow Vein Mosaic Virus (YVMV).',
            te: 'తెల్లదోమ మరియు పల్లాకు తెగులు రాకుండా వేపనూనె (3 మి.లీ/లీ) పిచికారీ చేయండి.',
            kn: 'ಹಳದಿ ನಂಜು ರೋಗ ತಡೆಗಟ್ಟಲು ಬೇವಿನ ಎಣ್ಣೆ (೩ ಮಿ.ಲೀ/ಲೀ) ಸಿಂಪಡಿಸಿ.',
            hi: 'पीत शिरा मोज़ेक से बचाव के लिए नीम तेल (3 मिली/लीटर) का छिड़काव करें।',
            ta: 'மஞ்சள் நரம்பு தேமல் நோயைத் தடுக்க வேப்ப எண்ணெய் தெளிக்கவும்.',
            ml: 'മഞ്ഞളിപ്പ് രോഗം തടയാൻ വേപ്പെണ്ണ സ്പ്രേ ചെയ്യുക.'
        }
    },
    {
        id: 'tomato',
        slug: 'tomato',
        category: 'vegetables',
        names: {
            en: 'Tomato',
            te: 'టమాట (Tomato)',
            kn: 'ಟೊಮೇಟೊ (Tomato)',
            hi: 'टमाटर (Tomato)',
            ta: 'தக்காளி (Tomato)',
            ml: 'തക്കാളി (Tomato)'
        },
        catLabels: {
            en: 'Vegetable Crop',
            te: 'కూరగాయల పంట',
            kn: 'ತರಕಾರಿ ಬೆಳೆ',
            hi: 'सब्जी फसल',
            ta: 'காய்கறிப் பயிர்',
            ml: 'പച്ചക്കറി വിള'
        },
        seasons: ['kharif', 'rabi'],
        tempMin: 15,
        tempMax: 35,
        tempIdealMin: 20,
        tempIdealMax: 28,
        humidityIdealMin: 50,
        humidityIdealMax: 75,
        waterNeed: 'Medium (500–600 mm)',
        waterNeedKey: 'medium',
        preferredSoils: ['well-drained sandy loam', 'red loam', 'alluvial'],
        duration: {
            en: '110 – 130 days',
            te: '110 – 130 రోజులు',
            kn: '110 – 130 ದಿನಗಳು',
            hi: '110 – 130 दिन',
            ta: '110 – 130 நாட்கள்',
            ml: '110 – 130 ദിവസങ്ങൾ'
        },
        sowing: {
            en: 'June – July / Oct – Nov',
            te: 'జూన్ – జూలై / అక్టోబరు – నవంబరు',
            kn: 'ಜೂನ್ – ಜುಲೈ / ಅಕ್ಟೋಬರ್ – ನವೆಂಬರ್',
            hi: 'जून – जुलाई / अक्टूबर – नवंबर',
            ta: 'ஜூன் – ஜூலை / அக்டோபர் – நவம்பர்',
            ml: 'ജൂൺ – ജൂലൈ / ഒക്ടോബർ – നവംബർ'
        },
        soil: {
            en: 'Deep well-drained sandy loam with pH 6.0–7.0',
            te: 'నీరు నిలవని లోతైన ఎర్ర గరప నేలలు',
            kn: 'ಉತ್ತಮ ನೀರು ಬಸಿಯುವ ಗೋಡು ಮಣ್ಣು',
            hi: 'उत्तम जल निकास वाली बलुई दोमट मिट्टी',
            ta: 'வடிகால் வசதியுள்ள மணல் வண்டல் மண்',
            ml: 'നീർവാർച്ചയുള്ള പശിമരാശി മണ്ണ്'
        },
        spacing: '60 cm x 45 cm',
        varieties: ['Arka Rakshak', 'Arka Samrat', 'Pusa Ruby', 'Abhinav', 'US-440'],
        primaryStates: ['Karnataka', 'Andhra Pradesh', 'Maharashtra', 'Madhya Pradesh', 'Odisha', 'Gujarat'],
        aiTip: {
            en: 'Provide staking with bamboo poles at 30 days to avoid fruit rotting from soil contact.',
            te: 'కాయలు కుళ్ళిపోకుండా ఉండటానికి 30 రోజులప్పుడు వెదురు కర్రలతో స్టేకింగ్ చేయండి.',
            kn: 'ಕಾಯಿಗಳು ಕೊಳೆಯದಂತೆ ತಡೆಯಲು ೩೦ ದಿನಗಳಲ್ಲಿ ಆಸರೆ ಕಡ್ಡಿ (ಸ್ಟೇಕಿಂಗ್) ಕಟ್ಟಿ.',
            hi: 'फलों को सड़ने से बचाने के लिए 30 दिन बाद बांस से सहारा (स्टेकिंग) दें।',
            ta: 'காய்கள் தரையில் படாமல் இருக்க குச்சி நட்டு முட்டுக் கொடுக்கவும்.',
            ml: 'കായ്കൾ ചീഞ്ഞുപോകാതിരിക്കാൻ താങ്ങ് കൊടുക്കുക.'
        }
    },
    {
        id: 'onion',
        slug: 'onion',
        category: 'vegetables',
        names: {
            en: 'Onion',
            te: 'ఉల్లిపాయ (Onion)',
            kn: 'ಈರುಳ್ಳಿ (Onion)',
            hi: 'प्याज (Onion)',
            ta: 'வெங்காயம் (Onion)',
            ml: 'സവാള (Onion)'
        },
        catLabels: {
            en: 'Vegetable / Bulb',
            te: 'కూరగాయల పంట',
            kn: 'ತರಕಾರಿ ಬೆಳೆ',
            hi: 'सब्जी फसल',
            ta: 'காய்கறிப் பயிர்',
            ml: 'പച്ചക്കറി വിള'
        },
        seasons: ['kharif', 'rabi'],
        tempMin: 13,
        tempMax: 35,
        tempIdealMin: 18,
        tempIdealMax: 28,
        humidityIdealMin: 45,
        humidityIdealMax: 70,
        waterNeed: 'Medium (400–500 mm)',
        waterNeedKey: 'medium',
        preferredSoils: ['friable sandy loam', 'alluvial', 'red loam'],
        duration: {
            en: '120 – 140 days',
            te: '120 – 140 రోజులు',
            kn: '120 – 140 ದಿನಗಳು',
            hi: '120 – 140 दिन',
            ta: '120 – 140 நாட்கள்',
            ml: '120 – 140 ദിവസങ്ങൾ'
        },
        sowing: {
            en: 'June – July (Kharif) / Oct – Nov (Rabi)',
            te: 'జూన్ – జూలై / అక్టోబరు – నవంబరు',
            kn: 'ಜೂನ್ – ಜುಲೈ / ಅಕ್ಟೋಬರ್ – ನವೆಂಬರ್',
            hi: 'जून – जुलाई / अक्टूबर – नवंबर',
            ta: 'ஜூன் – ஜூலை / அக்டோபர் – நவம்பர்',
            ml: 'ജൂൺ – ജൂലൈ / ഒക്ടോബർ – നവംബർ'
        },
        soil: {
            en: 'Friable sandy loam soil with good drainage and no heavy compaction',
            te: 'వదులుగా ఉండే ఇసుక గరప నేలలు',
            kn: 'ಉದುರಾದ ಮರಳು ಗೋಡು ಮಣ್ಣು',
            hi: 'भुरभुरी बलुई दोमट मिट्टी',
            ta: 'காற்றோட்டமுள்ள மணல் வண்டல் மண்',
            ml: 'പശിമരാശി മണ്ണ്'
        },
        spacing: '15 cm x 10 cm',
        varieties: ['Bhima Super', 'Bhima Red', 'Arka Kalyan', 'Agrifound Dark Red', 'Nashik Red'],
        primaryStates: ['Maharashtra', 'Karnataka', 'Madhya Pradesh', 'Gujarat', 'Rajasthan', 'Andhra Pradesh'],
        aiTip: {
            en: 'Stop irrigation 10-12 days before harvesting to prevent neck rot and extend storage life.',
            te: 'నిల్వ సామర్థ్యం పెరగడానికి పంట కోతకు 10-12 రోజుల ముందే నీటిని ఆపండి.',
            kn: 'ಉತ್ತಮ ಸಂಗ್ರಹಣಾ ಸಾಮರ್ಥ್ಯಕ್ಕೆ ಕೊಯ್ಲಿಗೆ ೧೦-೧೨ ದಿನ ಮುಂಚಿತವಾಗಿ ನೀರು ನಿಲ್ಲಿಸಿ.',
            hi: 'भंडारण क्षमता बढ़ाने के लिए खुदाई से 10-12 दिन पहले सिंचाई बंद कर दें।',
            ta: 'அறுவடைக்கு 10-12 நாட்களுக்கு முன்பே நீர் பாய்ச்சுவதை நிறுத்தவும்.',
            ml: 'വിളവെടുപ്പിന് 10-12 ദിവസം മുൻപ് നനയ്ക്കുന്നത് നിർത്തുക.'
        }
    },

    // --- FRUITS ---
    {
        id: 'banana',
        slug: 'banana',
        category: 'fruits',
        names: {
            en: 'Banana',
            te: 'అరటి (Banana)',
            kn: 'ಬಾಳೆ (Banana)',
            hi: 'केला (Banana)',
            ta: 'வாழை (Banana)',
            ml: 'വാഴ (Banana)'
        },
        catLabels: {
            en: 'Fruit Crop',
            te: 'పండ్ల తోట',
            kn: 'ಹಣ್ಣಿನ ಬೆಳೆ',
            hi: 'फल फसल',
            ta: 'பழப் பயிர்',
            ml: 'ഫല വിള'
        },
        seasons: ['kharif', 'rabi', 'summer'],
        tempMin: 15,
        tempMax: 38,
        tempIdealMin: 22,
        tempIdealMax: 32,
        humidityIdealMin: 60,
        humidityIdealMax: 90,
        waterNeed: 'High (1800–2200 mm)',
        waterNeedKey: 'high',
        preferredSoils: ['deep alluvial', 'clayey loam', 'fertile coastal red'],
        duration: {
            en: '11 – 12 months',
            te: '11 – 12 నెలలు',
            kn: '11 – 12 ತಿಂಗಳುಗಳು',
            hi: '11 – 12 महीने',
            ta: '11 – 12 மாதங்கள்',
            ml: '11 – 12 മാസങ്ങൾ'
        },
        sowing: {
            en: 'July – September / Feb – March',
            te: 'జూలై – సెప్టెంబరు / ఫిబ్రవరి – మార్చి',
            kn: 'ಜುಲೈ – ಸೆಪ್ಟೆಂಬರ್ / ಫೆಬ್ರವರಿ – ಮಾರ್ಚ್',
            hi: 'जुलाई – सितंबर / फरवरी – मार्च',
            ta: 'ஜூலை – செப்டம்பர் / பிப்ரவரி – மார்ச்',
            ml: 'ജൂലൈ – സെപ്റ്റംബർ / ഫെബ്രുവരി – മാർച്ച്'
        },
        soil: {
            en: 'Deep rich alluvial or volcanic loam, moisture-retentive with good drainage',
            te: 'సారవంతమైన లోతైన నేలలు',
            kn: 'ಫಲವತ್ತಾದ ಆಳವಾದ ಗೋಡು ಮಣ್ಣು',
            hi: 'गहरी जीवांश युक्त जलोढ़ मिट्टी',
            ta: 'வளமான வண்டல் நிலம்',
            ml: 'ഫലഭൂയിഷ്ഠമായ മണ്ണ്'
        },
        spacing: '1.8 m x 1.8 m',
        varieties: ['Grand Naine (G9)', 'Robusta', 'Nendran', 'Yelakki (Ney Poovan)', 'Rasthali'],
        primaryStates: ['Karnataka', 'Tamil Nadu', 'Kerala', 'Andhra Pradesh', 'Maharashtra', 'Gujarat'],
        aiTip: {
            en: 'Provide propping support with bamboo at bunch emergence to avoid stem breakage.',
            te: 'గెలలు వేసినప్పుడు చెట్లు విరిగిపోకుండా కర్రల ఆసరా ఇవ్వండి.',
            kn: 'ಗೊನೆ ಬಿಡುವ ಹಂತದಲ್ಲಿ ಗಾಳಿಗೆ ಮರ ಮುರಿಯದಂತೆ ಆಸರೆ ಕಡ್ಡಿ ನೀಡಿ.',
            hi: 'घार निकलते समय पौधों को गिरने से बचाने के लिए सहारा दें।',
            ta: 'குலை தள்ளும் பருவத்தில் மரத்திற்கு முட்டுக் கொடுக்கவும்.',
            ml: 'കുലകൾ വരുമ്പോൾ കാറ്റിൽ വീഴാതിരിക്കാൻ താങ്ങ് കൊടുക്കുക.'
        }
    },
    {
        id: 'watermelon',
        slug: 'watermelon',
        category: 'fruits',
        names: {
            en: 'Watermelon',
            te: 'పుచ్చకాయ (Watermelon)',
            kn: 'ಕಲ್ಲಂಗಡಿ (Watermelon)',
            hi: 'तरबूज (Watermelon)',
            ta: 'தர்பூசணி (Watermelon)',
            ml: 'തണ്ണീർമത്തൻ (Watermelon)'
        },
        catLabels: {
            en: 'Fruit / Cucurbit',
            te: 'పండ్ల తోట',
            kn: 'ಹಣ್ಣಿನ ಬೆಳೆ',
            hi: 'फल फसल',
            ta: 'பழப் பயிர்',
            ml: 'ഫല വിള'
        },
        seasons: ['summer'],
        tempMin: 22,
        tempMax: 42,
        tempIdealMin: 28,
        tempIdealMax: 36,
        humidityIdealMin: 35,
        humidityIdealMax: 65,
        waterNeed: 'Medium (400–500 mm with drip)',
        waterNeedKey: 'medium',
        preferredSoils: ['sandy loam', 'riverbed alluvial', 'well-drained sandy'],
        duration: {
            en: '75 – 85 days',
            te: '75 – 85 రోజులు',
            kn: '75 – 85 ದಿನಗಳು',
            hi: '75 – 85 दिन',
            ta: '75 – 85 நாட்கள்',
            ml: '75 – 85 ദിവസങ്ങൾ'
        },
        sowing: {
            en: 'January – March (Summer / Zaid)',
            te: 'జనవరి – మార్చి (వేసవి)',
            kn: 'ಜನವರಿ – ಮಾರ್ಚ್ (ಬೇಸಿಗೆ)',
            hi: 'जनवरी – मार्च (जायद)',
            ta: 'ஜனவரி – மார்ச்',
            ml: 'ജനുവരി – മാർച്ച്'
        },
        soil: {
            en: 'Sandy loam riverbed soil with good aeration and warm soil temperature',
            te: 'వెచ్చని ఇసుక గరప నేలలు',
            kn: 'ಮರಳು ಮಿಶ್ರಿತ ಗೋಡು ಮಣ್ಣು',
            hi: 'बलुई दोमट मिट्टी',
            ta: 'மணல் கலந்த வண்டல் மண்',
            ml: 'മണൽ പശിമരാശി മണ്ണ്'
        },
        spacing: '2.0 m x 0.5 m',
        varieties: ['Sugar Baby', 'Kiran', 'Max', 'Black Magic', 'Arka Manik'],
        primaryStates: ['Karnataka', 'Andhra Pradesh', 'Tamil Nadu', 'Maharashtra', 'Uttar Pradesh', 'Rajasthan'],
        aiTip: {
            en: 'Adopt silver-black plastic mulch and fertigation for 30% higher sweetness (Brix) and earlier harvest.',
            te: 'మల్చింగ్ మరియు డ్రిప్ ఫెర్టిగేషన్ వల్ల తీపి శాతం మరియు దిగుబడి పెరుగుతాయి.',
            kn: 'ಪ್ಲಾಸ್ಟಿಕ್ ಹೊದಿಕೆ ಮತ್ತು ಹನಿ ನೀರಾವರಿ ಬಳಸುವುದರಿಂದ ಹಣ್ಣಿನ ಸವಿ ಮತ್ತು ಇಳುವರಿ ಹೆಚ್ಚುತ್ತದೆ.',
            hi: 'मल्चिंग व ड्रिप फर्टिगेशन से मिठास और पैदावार में भारी वृद्धि होती है।',
            ta: 'மல்ச்சிங் மற்றும் சொட்டுநீர் பாசனம் நல்ல இனிப்பையும் விளைச்சலையும் தரும்.',
            ml: 'മൾച്ചിംഗും ഡ്രിപ്പ് ഇറിഗേഷനും മികച്ച മധുരവും വിളവും നൽകും.'
        }
    },

    // --- OILSEEDS ---
    {
        id: 'groundnut',
        slug: 'groundnut',
        category: 'oilseeds',
        names: {
            en: 'Groundnut (Peanut)',
            te: 'వేరుశనగ (Groundnut)',
            kn: 'ಕಡಲೆಕಾಯಿ (Groundnut)',
            hi: 'मूंगफली (Groundnut)',
            ta: 'நிலக்கடலை (Groundnut)',
            ml: 'നിലക്കടല (Groundnut)'
        },
        catLabels: {
            en: 'Oilseed Crop',
            te: 'నూనెగింజల పంట',
            kn: 'ಎಣ್ಣೆಕಾಳು ಬೆಳೆ',
            hi: 'तिलहन फसल',
            ta: 'எண்ணெய் வித்துப் பயிர்',
            ml: 'എണ്ണക്കുരു വിള'
        },
        seasons: ['kharif', 'summer'],
        tempMin: 20,
        tempMax: 38,
        tempIdealMin: 25,
        tempIdealMax: 32,
        humidityIdealMin: 45,
        humidityIdealMax: 75,
        waterNeed: 'Medium (450–550 mm)',
        waterNeedKey: 'medium',
        preferredSoils: ['well-aerated sandy loam', 'red sandy loam', 'light loam'],
        duration: {
            en: '100 – 115 days',
            te: '100 – 115 రోజులు',
            kn: '100 – 115 ದಿನಗಳು',
            hi: '100 – 115 दिन',
            ta: '100 – 115 நாட்கள்',
            ml: '100 – 115 ദിവസങ്ങൾ'
        },
        sowing: {
            en: 'June – July (Kharif) / Jan – Feb (Summer)',
            te: 'జూన్ – జూలై / జనవరి – ఫిబ్రవరి',
            kn: 'ಜೂನ್ – ಜುಲೈ / ಜನವರಿ – ಫೆಬ್ರವರಿ',
            hi: 'जून – जुलाई / जनवरी – फरवरी',
            ta: 'ஜூன் – ஜூலை / ஜனவரி – பிப்ரவரி',
            ml: 'ജൂൺ – ജൂലൈ / ജനുവരി – ഫെബ്രുവരി'
        },
        soil: {
            en: 'Loose friable sandy loam allowing easy peg penetration and pod growth',
            te: 'ఊడలు సులభంగా దిగేందుకు అనువైన వదులైన ఇసుక గరప నేలలు',
            kn: 'ಉದುರಾದ ಮರಳು ಗೋಡು ಮಣ್ಣು',
            hi: 'भुरभुरी बलुई दोमट मिट्टी जिसमें सुइयां आसानी से धंस सकें',
            ta: 'விழுது இறங்க ஏதுவான மென்மையான மணல் நிலம்',
            ml: 'മണൽ പശിമരാശി മണ്ണ്'
        },
        spacing: '30 cm x 10 cm',
        varieties: ['TMV-2', 'JL-24', 'Kadiri-6', 'GPBD-4', 'TAG-24', 'KCG-2'],
        primaryStates: ['Gujarat', 'Rajasthan', 'Andhra Pradesh', 'Karnataka', 'Tamil Nadu', 'Maharashtra'],
        aiTip: {
            en: 'Apply Gypsum (200 kg/acre) at pegging stage (40-45 DAS) for superior pod filling and oil percentage.',
            te: 'ఊడలు దిగే దశలో (40-45 రోజులు) ఎకరాకు 200 కిలోల జిప్సం వేస్తే కాయలు బాగా ఊరుతాయి.',
            kn: 'ಕಾಯಿ ಕಟ್ಟುವ ಹಂತದಲ್ಲಿ (೪೦-೪೫ ದಿನ) ಎಕರೆಗೆ ೨೦೦ ಕೆಜಿ ಜಿಪ್ಸಮ್ ಹಾಕುವುದರಿಂದ ಉತ್ತಮ ಕಾಳು ತುಂಬುತ್ತದೆ.',
            hi: 'सुइयां बनते समय (40-45 दिन) जिप्सम (200 किग्रा/एकड़) डालें ताकि दानों का भराव अच्छा हो।',
            ta: 'விழுது இறங்கும் பருவத்தில் ஏக்கருக்கு 200 கிலோ ஜிப்சம் இடவும்.',
            ml: 'കായ്കൾ ഉണ്ടാകുന്ന ഘട്ടത്തിൽ ജിപ്സം ഇട്ടുകൊടുക്കുക.'
        }
    },
    {
        id: 'mustard',
        slug: 'mustard',
        category: 'oilseeds',
        names: {
            en: 'Mustard (Rape Seed)',
            te: 'ఆవాలు (Mustard)',
            kn: 'ಸಾಸಿವೆ (Mustard)',
            hi: 'सरसों (Mustard)',
            ta: 'கடுகு (Mustard)',
            ml: 'കടുക് (Mustard)'
        },
        catLabels: {
            en: 'Oilseed Crop',
            te: 'నూనెగింజల పంట',
            kn: 'ಎಣ್ಣೆಕಾಳು ಬೆಳೆ',
            hi: 'तिलहन फसल',
            ta: 'எண்ணெய் வித்துப் பயிர்',
            ml: 'എണ്ണക്കുരു വിള'
        },
        seasons: ['rabi'],
        tempMin: 10,
        tempMax: 28,
        tempIdealMin: 15,
        tempIdealMax: 24,
        humidityIdealMin: 35,
        humidityIdealMax: 65,
        waterNeed: 'Low to Medium (250–350 mm)',
        waterNeedKey: 'low',
        preferredSoils: ['alluvial loam', 'sandy loam', 'clay loam'],
        duration: {
            en: '105 – 125 days',
            te: '105 – 125 రోజులు',
            kn: '105 – 125 ದಿನಗಳು',
            hi: '105 – 125 दिन',
            ta: '105 – 125 நாட்கள்',
            ml: '105 – 125 ദിവസങ്ങൾ'
        },
        sowing: {
            en: 'October – November (Rabi)',
            te: 'అక్టోబరు – నవంబరు (రబీ)',
            kn: 'ಅಕ್ಟೋಬರ್ – ನವೆಂಬರ್ (ಹಿಂಗಾರು)',
            hi: 'अक्टूबर – नवंबर (रबी)',
            ta: 'அக்டோபர் – நவம்பர்',
            ml: 'ഒക്ടോബർ – നവംബർ'
        },
        soil: {
            en: 'Light to heavy loamy soil with good moisture capacity',
            te: 'సారవంతమైన గరప నేలలు',
            kn: 'ಗೋಡು ಮಣ್ಣು',
            hi: 'दोमट एवं बलुई दोमट मिट्टी',
            ta: 'வண்டல் மண்',
            ml: 'പശിമരാശി മണ്ണ്'
        },
        spacing: '30 cm x 10 cm',
        varieties: ['Pusa Jai Kisan', 'RH-30', 'Varuna (T-59)', 'Kranti', 'DRMRIJ-31 (Giriraj)'],
        primaryStates: ['Rajasthan', 'Haryana', 'Madhya Pradesh', 'Uttar Pradesh', 'West Bengal', 'Punjab'],
        aiTip: {
            en: 'Apply single super phosphate (SSP) for critical sulphur nutrition that increases seed oil content.',
            te: 'నూనె శాతం పెరగడానికి ఎస్.ఎస్.పి రూపంలో గంధకం (సల్ఫర్) అందించండి.',
            kn: 'ಎಣ್ಣೆ ಅಂಶ ಹೆಚ್ಚಿಸಲು ಸಿಂಗಲ್ ಸೂಪರ್ ಫಾಸ್ಫೇಟ್ (ಎಸ್.ಎಸ್.ಪಿ) ಬಳಸಿ.',
            hi: 'तेल की मात्रा बढ़ाने के लिए सल्फर युक्त एसएसपी (SSP) उर्वरक का प्रयोग करें।',
            ta: 'எண்ணெய் சத்தை அதிகரிக்க கந்தக உரங்களை இடவும்.',
            ml: 'എണ്ണയുടെ അളവ് കൂട്ടാൻ സിംഗിൾ സൂപ്പർ ഫോസ്ഫേറ്റ് ഉപയോഗിക്കുക.'
        }
    },
    {
        id: 'soybean',
        slug: 'soybean',
        category: 'oilseeds',
        names: {
            en: 'Soybean',
            te: 'సోయాబీన్ (Soybean)',
            kn: 'ಸೋಯಾಬೀನ್ (Soybean)',
            hi: 'सोयाबीन (Soybean)',
            ta: 'சோயாபீன் (Soybean)',
            ml: 'സോയാബീൻ (Soybean)'
        },
        catLabels: {
            en: 'Oilseed / Legume',
            te: 'నూనెగింజల పంట',
            kn: 'ಎಣ್ಣೆಕಾಳು ಬೆಳೆ',
            hi: 'तिलहन फसल',
            ta: 'எண்ணெய் வித்துப் பயிர்',
            ml: 'എണ്ണക്കുരു വിള'
        },
        seasons: ['kharif'],
        tempMin: 18,
        tempMax: 36,
        tempIdealMin: 24,
        tempIdealMax: 30,
        humidityIdealMin: 55,
        humidityIdealMax: 80,
        waterNeed: 'Medium (450–600 mm)',
        waterNeedKey: 'medium',
        preferredSoils: ['well-drained black clay', 'loamy black', 'deep loam'],
        duration: {
            en: '90 – 105 days',
            te: '90 – 105 రోజులు',
            kn: '90 – 105 ದಿನಗಳು',
            hi: '90 – 105 दिन',
            ta: '90 – 105 நாட்கள்',
            ml: '90 – 105 ദിവസങ്ങൾ'
        },
        sowing: {
            en: 'June – July (Kharif)',
            te: 'జూన్ – జూలై (ఖరీఫ్)',
            kn: 'ಜೂನ್ – ಜುಲೈ (ಖಾರೀಫ್)',
            hi: 'जून – जुलाई (खरीफ)',
            ta: 'ஜூன் – ஜூலை',
            ml: 'ജൂൺ – ജൂലൈ'
        },
        soil: {
            en: 'Deep fertile black soil with good drainage to prevent water stagnation',
            te: 'నీరు నిలువని లోతైన నల్లరేగడి నేలలు',
            kn: 'ಫಲವತ್ತಾದ ಕಪ್ಪು ಮಣ್ಣು',
            hi: 'जल निकास वाली उपजाऊ मध्यम से गहरी काली मिट्टी',
            ta: 'கரிசல் நிலம்',
            ml: 'കറുത്ത മണ്ണ്'
        },
        spacing: '45 cm x 5 cm',
        varieties: ['JS-335', 'JS-9305', 'JS-9560', 'MACS-1407', 'NRC-37'],
        primaryStates: ['Madhya Pradesh', 'Maharashtra', 'Rajasthan', 'Karnataka', 'Telangana'],
        aiTip: {
            en: 'Ensure broad bed furrow (BBF) planting to withstand both drought spells and excess monsoon rains.',
            te: 'అధిక వర్షాలు మరియు బెట్టను తట్టుకోవడానికి వెడల్పు పాదుల (BBF) పద్ధతిలో విత్తండి.',
            kn: 'ಅಧಿಕ ಮಳೆ ಮತ್ತು ಬರ ಎರಡನ್ನೂ ನಿರ್ವಹಿಸಲು ಬಿಬಿಎಫ್ (BBF) ಪದ್ಧತಿಯಲ್ಲಿ ಬಿತ್ತನೆ ಮಾಡಿ.',
            hi: 'जलभराव व सूखे से बचाव हेतु ब्रॉड बेड फरो (BBF) विधि से बुवाई करें।',
            ta: 'அதிக மழையைத் தாங்க அகலப்பாத்தி சால் முறையில் விதைக்கவும்.',
            ml: 'അമിത മഴയെ പ്രതിരോധിക്കാൻ ബി.ബി.എഫ് രീതിയിൽ നടുക.'
        }
    },

    // --- FODDER CROPS ---
    {
        id: 'napier-grass',
        slug: 'baby-corn', // high-res green biomass placeholder from existing assets
        category: 'fodder',
        names: {
            en: 'Hybrid Napier Grass (CO-4 / Super Napier)',
            te: 'హైబ్రిడ్ నేపియర్ గడ్డి (Super Napier)',
            kn: 'ಹೈಬ್ರಿಡ್ ನೇಪಿಯರ್ ಮೇವು (Super Napier)',
            hi: 'हाइब्रिड नेपियर घास (Super Napier)',
            ta: 'ஹைப்ரிட் நேப்பியர் புல் (Super Napier)',
            ml: 'ഹൈബ്രിഡ് നേപ്പിയർ പുല്ല് (Super Napier)'
        },
        catLabels: {
            en: 'Perennial Fodder Crop',
            te: 'పశుగ్రాస పంట',
            kn: 'ಮೇವು ಬೆಳೆ',
            hi: 'चारा फसल',
            ta: 'தீவனப் பயிர்',
            ml: 'തീറ്റപ്പുല്ല്'
        },
        seasons: ['kharif', 'rabi', 'summer'],
        tempMin: 15,
        tempMax: 40,
        tempIdealMin: 24,
        tempIdealMax: 34,
        humidityIdealMin: 40,
        humidityIdealMax: 85,
        waterNeed: 'Medium to High (800–1000 mm)',
        waterNeedKey: 'high',
        preferredSoils: ['fertile loam', 'alluvial', 'red loam'],
        duration: {
            en: 'Perennial (First cut in 55-60 days, then every 35-40 days)',
            te: 'బహువార్షిక (మొదటి కోత 55-60 రోజులకు, తర్వాత ప్రతి 35 రోజులకు)',
            kn: 'ಬಹುವಾರ್ಷಿಕ (ಮೊದಲ ಕಟಾವು ೫೫-೬೦ ದಿನ, ನಂತರ ಪ್ರತಿ ೩೫ ದಿನಕ್ಕೆ)',
            hi: 'बहुवर्षीय (पहली कटाई 55-60 दिन, फिर हर 35-40 दिन पर)',
            ta: 'பல்லாண்டுப் பயிர் (முதல் அறுவடை 55-60 நாட்கள், பின் 35 நாட்களுக்கு ஒருமுறை)',
            ml: 'ബഹുവർഷ വിള (ആദ്യ വിളവെടുപ്പ് 55-60 ദിവസത്തിൽ, പിന്നീട് 35 ദിവസം കൂടുമ്പോൾ)'
        },
        sowing: {
            en: 'June – August / Feb – March',
            te: 'జూన్ – ఆగస్టు / ఫిబ్రవరి – మార్చి',
            kn: 'ಜೂನ್ – ಆಗಸ್ಟ್ / ಫೆಬ್ರವರಿ – ಮಾರ್ಚ್',
            hi: 'जून – अगस्त / फरवरी – मार्च',
            ta: 'ஜூன் – ஆகஸ்ட் / பிப்ரவரி – மார்ச்',
            ml: 'ജൂൺ – ആഗസ്റ്റ് / ഫെബ്രുവരി – മാർച്ച്'
        },
        soil: {
            en: 'Fertile well-drained loam soil with high organic matter',
            te: 'సారవంతమైన గరప నేలలు',
            kn: 'ಸಾವಯವ ಸಮೃದ್ಧ ಗೋಡು ಮಣ್ಣು',
            hi: 'उपजाऊ दोमट मिट्टी',
            ta: 'வளமான வண்டல் மண்',
            ml: 'പശിമരാശി മണ്ണ്'
        },
        spacing: '60 cm x 50 cm root slips',
        varieties: ['CO-4', 'CO-5', 'Super Napier', 'DHN-6', 'Sampoorna'],
        primaryStates: ['Karnataka', 'Tamil Nadu', 'Kerala', 'Andhra Pradesh', 'Maharashtra', 'Punjab'],
        aiTip: {
            en: 'Harvest at 1–1.2 m height when crude protein content is highest (10–12%) for dairy cattle.',
            te: 'పాడి పశువులకు అధిక మాంసకృత్తులు అందడానికి 1–1.2 మీటర్ల ఎత్తు ఉన్నప్పుడే కోత కోయండి.',
            kn: 'ಹೆಚ್ಚಿನ ಪ್ರೋಟೀನ್ ಅಂಶಕ್ಕಾಗಿ ೧-೧.೨ ಮೀಟರ್ ಎತ್ತರವಿರುವಾಗಲೇ ಕಟಾವು ಮಾಡಿ.',
            hi: 'अधिक प्रोटीन हेतु जब घास 1-1.2 मीटर ऊंची हो तभी कटाई करें।',
            ta: 'அதிக புரதச்சத்து கிடைக்க 1-1.2 மீட்டர் உயரத்தில் அறுவடை செய்யவும்.',
            ml: 'കൂടിയ പ്രോട്ടീൻ ലഭിക്കാൻ 1-1.2 മീറ്റർ ഉയരത്തിൽ വിളവെടുക്കുക.'
        }
    },
    {
        id: 'sorghum-fodder',
        slug: 'jowar',
        category: 'fodder',
        names: {
            en: 'Fodder Sorghum (Chari / SSG)',
            te: 'పచ్చిగడ్డి జొన్న (Fodder Sorghum)',
            kn: 'ಮೇವು ಜೋಳ (Fodder Sorghum)',
            hi: 'चारा ज्वार / चरी (Fodder Sorghum)',
            ta: 'தீவனச் சோளம் (Fodder Sorghum)',
            ml: 'തീറ്റച്ചോളം (Fodder Sorghum)'
        },
        catLabels: {
            en: 'Fodder Crop',
            te: 'పశుగ్రాస పంట',
            kn: 'ಮೇವು ಬೆಳೆ',
            hi: 'चारा फसल',
            ta: 'தீவனப் பயிர்',
            ml: 'തീറ്റപ്പുല്ല്'
        },
        seasons: ['kharif', 'summer'],
        tempMin: 18,
        tempMax: 40,
        tempIdealMin: 25,
        tempIdealMax: 35,
        humidityIdealMin: 35,
        humidityIdealMax: 75,
        waterNeed: 'Low to Medium (350–450 mm)',
        waterNeedKey: 'medium',
        preferredSoils: ['medium black', 'sandy loam', 'alluvial'],
        duration: {
            en: '60 – 75 days',
            te: '60 – 75 రోజులు',
            kn: '60 – 75 ದಿನಗಳು',
            hi: '60 – 75 दिन',
            ta: '60 – 75 நாட்கள்',
            ml: '60 – 75 ദിവസങ്ങൾ'
        },
        sowing: {
            en: 'June – July / March – April',
            te: 'జూన్ – జూలై / మార్చి – ఏప్రిల్',
            kn: 'ಜೂನ್ – ಜುಲೈ / ಮಾರ್ಚ್ – ಏಪ್ರಿಲ್',
            hi: 'जून – जुलाई / मार्च – अप्रैल',
            ta: 'ஜூன் – ஜூலை / மார்ச் – ஏப்ரல்',
            ml: 'ജൂൺ – ജൂലൈ / മാർച്ച് – ഏപ്രിൽ'
        },
        soil: {
            en: 'All agricultural soils with moderate drainage',
            te: 'మధ్యస్థ తేమ గల అన్ని నేలలు',
            kn: 'ಎಲ್ಲಾ ರೀತಿಯ ಗೋಡು ಮತ್ತು ಕಪ್ಪು ಮಣ್ಣು',
            hi: 'मध्यम काली व दोमट मिट्टी',
            ta: 'வண்டல் மற்றும் கரிசல் மண்',
            ml: 'എല്ലാത്തരം മണ്ണും'
        },
        spacing: '30 cm broadcast / line sowing',
        varieties: ['SSG-59-3 (Meethi Chari)', 'MP Chari', 'CSH-24MF', 'CO-FS-29', 'Hara Sona'],
        primaryStates: ['Karnataka', 'Maharashtra', 'Haryana', 'Rajasthan', 'Gujarat', 'Punjab', 'Uttar Pradesh'],
        aiTip: {
            en: 'Do not harvest before 50% flowering to avoid hydrocyanic acid (HCN / Prussic acid) toxicity in young shoots.',
            te: 'లేత మొలకల్లో విష పదార్థాలు (HCN) ఉండకుండా ఉండటానికి 50% పూత దశ తర్వాతే కోయండి.',
            kn: 'ಎಳೆಯ ಚಿಗುರಿನಲ್ಲಿ ಎಚ್‌ಸಿಎನ್ ವಿಷತ್ವ ತಪ್ಪಿಸಲು ೫೦% ಹೂ ಬಿಟ್ಟ ನಂತರವೇ ಕಟಾವು ಮಾಡಿ.',
            hi: 'एचसीएन (प्रूसिक एसिड) के विषैलेपन से बचाव हेतु 50% फूल आने के बाद ही कटाई करें।',
            ta: 'நச்சுத்தன்மையை தவிர்க்க 50% பூக்கும் தருணத்திற்கு பின் அறுவடை செய்யவும்.',
            ml: 'വിഷാംശം ഒഴിവാക്കാൻ 50% പൂവിട്ട ശേഷം മാത്രം വിളവെടുക്കുക.'
        }
    }
];

/**
 * Calculates dynamic suitability score (0 - 100) for a crop under live conditions
 */
function evaluateCropSuitability(crop, context) {
    const { temp, humidity, monthNum, state, district, farmerSoil } = context;

    // 1. Season Factor (weight 35%)
    let currentSeason = 'kharif';
    if (monthNum >= 9 || monthNum <= 1) currentSeason = 'rabi';
    else if (monthNum >= 2 && monthNum <= 4) currentSeason = 'summer';

    let seasonScore = 20;
    if (crop.seasons.includes(currentSeason)) {
        seasonScore = 100;
    } else {
        // Transition months leeway (e.g. May transitioning to Kharif, September to Rabi)
        if (monthNum === 4 || monthNum === 5 || monthNum === 8 || monthNum === 9) {
            seasonScore = 65;
        }
    }

    // 2. Temperature Factor (weight 25%)
    let tempScore = 30;
    if (temp >= crop.tempIdealMin && temp <= crop.tempIdealMax) {
        tempScore = 100;
    } else if (temp >= crop.tempMin && temp <= crop.tempMax) {
        const dist = temp < crop.tempIdealMin ? (crop.tempIdealMin - temp) : (temp - crop.tempIdealMax);
        tempScore = Math.max(50, Math.round(100 - dist * 6));
    } else {
        const dist = temp < crop.tempMin ? (crop.tempMin - temp) : (temp - crop.tempMax);
        tempScore = Math.max(15, Math.round(40 - dist * 8));
    }

    // 3. Humidity Factor (weight 15%)
    let humidityScore = 40;
    if (humidity >= crop.humidityIdealMin && humidity <= crop.humidityIdealMax) {
        humidityScore = 100;
    } else {
        const dist = humidity < crop.humidityIdealMin ? (crop.humidityIdealMin - humidity) : (humidity - crop.humidityIdealMax);
        humidityScore = Math.max(45, Math.round(95 - dist * 2));
    }

    // 4. Regional / State Fit Factor (weight 15%)
    let regionScore = 60;
    const cleanState = (state || '').toLowerCase();
    const cleanDist = (district || '').toLowerCase();
    const stateMatch = crop.primaryStates.some(st => st.toLowerCase().includes(cleanState) || cleanState.includes(st.toLowerCase()));
    if (stateMatch) {
        regionScore = 100;
    } else if (cleanState.includes('india') || !state) {
        regionScore = 80;
    }

    // 5. Soil Compatibility Factor (weight 10%)
    let soilScore = 80;
    let soilAnalyzed = false;
    if (farmerSoil && farmerSoil.trim()) {
        const cleanFarmerSoil = farmerSoil.toLowerCase().trim();
        const matchesSoil = crop.preferredSoils.some(s => s.toLowerCase().includes(cleanFarmerSoil) || cleanFarmerSoil.includes(s.toLowerCase()));
        if (matchesSoil) {
            soilScore = 100;
            soilAnalyzed = true;
        } else {
            soilScore = 60;
            soilAnalyzed = true;
        }
    }

    // Total Weighted Suitability Calculation
    const totalScore = Math.round(
        (seasonScore * 0.35) +
        (tempScore * 0.25) +
        (humidityScore * 0.15) +
        (regionScore * 0.15) +
        (soilScore * 0.10)
    );

    let suitabilityKey = 'high';
    if (totalScore >= 85) suitabilityKey = 'high';
    else if (totalScore >= 70) suitabilityKey = 'suitable';
    else suitabilityKey = 'moderate';

    return {
        score: totalScore,
        suitabilityKey,
        seasonScore,
        tempScore,
        humidityScore,
        regionScore,
        soilScore,
        soilAnalyzed,
        currentSeason
    };
}

/**
 * Returns dynamic, tailored recommendations for all categories
 */
function getAgronomicRecommendations(context) {
    const monthNum = typeof context.monthNum === 'number' ? context.monthNum : new Date().getMonth();
    const temp = context.temp || 28;
    const humidity = context.humidity || 65;
    const state = context.state || 'Karnataka';
    const district = context.district || 'Udupi';
    const lang = context.language || 'en';

    const evaluatedCrops = AGRONOMIC_CROP_DATABASE.map(crop => {
        const evaluation = evaluateCropSuitability(crop, {
            temp,
            humidity,
            monthNum,
            state,
            district,
            farmerSoil: context.farmerSoil
        });

        return {
            ...crop,
            evaluation
        };
    });

    // Sort by suitability score descending
    evaluatedCrops.sort((a, b) => b.evaluation.score - a.evaluation.score);

    return evaluatedCrops;
}

module.exports = {
    AGRONOMIC_CROP_DATABASE,
    evaluateCropSuitability,
    getAgronomicRecommendations
};
