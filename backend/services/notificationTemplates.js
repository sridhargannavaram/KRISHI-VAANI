// =============================================================
// KRISHI VAANI — Multi-Language Notification Templates (6 Languages)
// Supported: English (en), Telugu (te), Kannada (kn), Hindi (hi), Tamil (ta), Malayalam (ml)
// =============================================================

const NOTIFICATION_TEMPLATES = {
    // ---------------------------------------------------------
    // 1. Weather Alerts
    // ---------------------------------------------------------
    WEATHER_RAIN: {
        en: {
            title: '🌧️ Heavy Rain Warning — Krishi Vaani',
            body: 'Heavy rainfall expected in {district} in next {hours} hours. Postpone pesticide spraying.'
        },
        te: {
            title: '🌧️ భారీ వర్ష హెచ్చరిక — కృషి వాణి',
            body: '{district} లో రాబోయే {hours} గంటల్లో భారీ వర్షం కురిసే అవకాశం. పిచికారీ ఆపండి.'
        },
        kn: {
            title: '🌧️ ಭಾರಿ ಮಳೆಯ ಎಚ್ಚರಿಕೆ — ಕೃಷಿ ವಾಣಿ',
            body: '{district} ನಲ್ಲಿ ಮುಂದಿನ {hours} ಗಂಟೆಗಳಲ್ಲಿ ಭಾರಿ ಮಳೆ ನಿರೀಕ್ಷೆ. ಔಷಧ ಸಿಂಪಡಣೆ ಮುಂದೂಡಿ.'
        },
        hi: {
            title: '🌧️ भारी बारिश की चेतावनी — कृषि वाणी',
            body: '{district} में अगले {hours} घंटों में भारी बारिश की संभावना। कीटनाशक छिड़काव रोकें।'
        },
        ta: {
            title: '🌧️ கனமழை எச்சரிக்கை — கிருஷி வாணி',
            body: '{district} இல் அடுத்த {hours} மணி நேரத்தில் கனமழை வாய்ப்பு. பூச்சிக்கொல்லி தெளிப்பதை தள்ளிப்போடுங்கள்.'
        },
        ml: {
            title: '🌧️ കനത്ത മഴ മുന്നറിയിപ്പ് — കൃഷി വാണി',
            body: '{district} ൽ അടുത്ത {hours} മണിക്കൂറിനുള്ളിൽ കനത്ത മഴ സാധ്യത. മരുന്ന് തളിക്കുന്നത് മാറ്റിവെക്കുക.'
        }
    },

    WEATHER_HEAT: {
        en: {
            title: '🌡️ High Temperature Alert — Krishi Vaani',
            body: 'Extreme heat of {temp}°C expected today. Apply light irrigation early morning.'
        },
        te: {
            title: '🌡️ తీవ్ర ఉష్ణోగ్రత హెచ్చరిక — కృషి వాణి',
            body: 'ఈరోజు {temp}°C అధిక ఉష్ణోగ్రత ఉండే అవకాశం. ఉదయమే తేలికపాటి నీటితడులు ఇవ్వండి.'
        },
        kn: {
            title: '🌡️ ತೀವ್ರ ಶಾಖದ ಎಚ್ಚರಿಕೆ — ಕೃಷಿ ವಾಣಿ',
            body: 'ಇಂದು {temp}°C ಗರಿಷ್ಠ ತಾಪಮಾನ ನಿರೀಕ್ಷೆ. ಮುಂಜಾನೆಯೇ ಬೆಳೆಗೆ ಲಘು ನೀರಾವರಿ ಒದಗಿಸಿ.'
        },
        hi: {
            title: '🌡️ अत्यधिक गर्मी की चेतावनी — कृषि वाणी',
            body: 'आज {temp}°C तक तापमान संभव। सुबह के समय हल्की सिंचाई करें।'
        },
        ta: {
            title: '🌡️ தீவிர வெப்ப எச்சரிக்கை — கிருஷி வாணி',
            body: 'இன்று {temp}°C வரை வெப்பம் அதிகரிக்கும். காலையில் லேசான நீர்ப்பாசனம் செய்யுங்கள்.'
        },
        ml: {
            title: '🌡️ കഠിനമായ ചൂട് മുന്നറിയിപ്പ് — കൃഷി വാണി',
            body: 'ഇന്ന് {temp}°C വരെ താപനില ഉയരാൻ സാധ്യത. അതിരാവിലെ നനയ്ക്കുക.'
        }
    },

    WEATHER_WIND: {
        en: {
            title: '💨 Strong Wind Alert — Krishi Vaani',
            body: 'Gusty winds of {wind} km/h forecasted. Provide staking support for tall crops.'
        },
        te: {
            title: '💨 ఈదురు గాలుల హెచ్చరిక — కృషి వాణి',
            body: '{wind} కి.మీ/గం వేగంతో ఈదురు గాలులు వీచే అవకాశం. అరటి, చెరకు పైర్లకు ఆధారాలు ఇవ్వండి.'
        },
        kn: {
            title: '💨 ಬಲವಾದ ಗಾಳಿಯ ಎಚ್ಚರಿಕೆ — ಕೃಷಿ ವಾಣಿ',
            body: '{wind} ಕಿ.ಮೀ/ಗಂ ವೇಗದಲ್ಲಿ ಬಲವಾದ ಗಾಳಿ ಬೀಸುವ ಸಾಧ್ಯತೆ. ಬಾಳೆ ಮತ್ತು ಎತ್ತರದ ಬೆಳೆಗಳಿಗೆ ಆಸರೆ ನೀಡಿ.'
        },
        hi: {
            title: '💨 तेज हवा की चेतावनी — कृषि वाणी',
            body: '{wind} किमी/घंटा की रफ्तार से तेज हवाएं चलने की संभावना। लंबी फसलों को सहारा दें।'
        },
        ta: {
            title: '💨 பலத்த காற்று எச்சரிக்கை — கிருஷி வாணி',
            body: '{wind} கி.மீ/மணி வேகத்தில் பலத்த காற்று வீசக்கூடும். வாழை போன்ற பயிர்களுக்கு முட்டு கொடுக்கவும்.'
        },
        ml: {
            title: '💨 ശക്തമായ കാറ്റ് മുന്നറിയിപ്പ് — കൃഷി വാണി',
            body: '{wind} കി.മീ/മണിക്കൂർ വേഗതയിൽ കാറ്റടിക്കാൻ സാധ്യത. വാഴ മുതലായ വിളകൾക്ക് താങ്ങ് നൽകുക.'
        }
    },

    WEATHER_CYCLONE: {
        en: {
            title: '🚨 Extreme Weather Emergency — Krishi Vaani',
            body: 'Severe storm alert in your area. Secure harvest produce and avoid venturing into open fields.'
        },
        te: {
            title: '🚨 అత్యవసర వాతావరణ హెచ్చరిక — కృషి వాణి',
            body: 'తీవ్ర తుఫాను హెచ్చరిక. కోసిన పంటను సురక్షిత ప్రాంతాలకు చేర్చండి.'
        },
        kn: {
            title: '🚨 ತುರ್ತು ಹವಾಮಾನ ಎಚ್ಚರಿಕೆ — ಕೃಷಿ ವಾಣಿ',
            body: 'ತೀವ್ರ ಚಂಡಮಾರುತದ ಮುನ್ಸೂಚನೆ. ಕಟಾವು ಮಾಡಿದ ಫಸಲನ್ನು ಸುರಕ್ಷಿತ ಸ್ಥಳಕ್ಕೆ ಸ್ಥಳಾಂತರಿಸಿ.'
        },
        hi: {
            title: '🚨 गंभीर मौसम आपातकालीन चेतावनी — कृषि वाणी',
            body: 'भीषण तूफान की चेतावनी। कटी हुई फसल को सुरक्षित स्थान पर रखें और खेतों में न जाएं।'
        },
        ta: {
            title: '🚨 தீவிர வானிலை அவசர எச்சரிக்கை — கிருஷி வாணி',
            body: 'கடுமையான புயல் எச்சரிக்கை. அறுவடை செய்த விளைபொருட்களை பாதுகாப்பான இடத்திற்கு மாற்றவும்.'
        },
        ml: {
            title: '🚨 അടിയന്തര കാലാവസ്ഥ മുന്നറിയിപ്പ് — കൃഷി വാണി',
            body: 'തീവ്ര കൊടുങ്കാറ്റ് മുന്നറിയിപ്പ്. വിളവെടുത്ത ഉൽപ്പന്നങ്ങൾ സുരക്ഷിതമായി സൂക്ഷിക്കുക.'
        }
    },

    // ---------------------------------------------------------
    // 2. Crop & Pest Alerts
    // ---------------------------------------------------------
    CROP_DISEASE_RISK: {
        en: {
            title: '🔬 Crop Disease Risk: {crop} — Krishi Vaani',
            body: 'High risk of {risk} in your area due to high humidity. Tap to view recommended protection.'
        },
        te: {
            title: '🔬 పంట తెగులు హెచ్చరిక: {crop} — కృషి వాణి',
            body: 'అధిక తేమ వల్ల {risk} వ్యాపించే ప్రమాదం ఉంది. నివారణ చర్యల కోసం నొక్కండి.'
        },
        kn: {
            title: '🔬 ಬೆಳೆ ರೋಗದ ಎಚ್ಚರಿಕೆ: {crop} — ಕೃಷಿ ವಾಣಿ',
            body: 'ಹೆಚ್ಚಿನ ತೇವಾಂಶದಿಂದಾಗಿ {risk} ರೋಗದ ಭೀತಿ ಇದೆ. ತಕ್ಷಣ ಸೂಕ್ತ ಕ್ರಮಗಳನ್ನು ವೀಕ್ಷಿಸಿ.'
        },
        hi: {
            title: '🔬 फसल रोग चेतावनी: {crop} — कृषि वाणी',
            body: 'उच्च आर्द्रता के कारण {risk} का खतरा। अनुशंसित रोकथाम देखने के लिए टैप करें।'
        },
        ta: {
            title: '🔬 பயிர் நோய் எச்சரிக்கை: {crop} — கிருஷி வாணி',
            body: 'அதிக ஈரப்பதம் காரணமாக {risk} பரவும் அபாயம் உள்ளது. பாதுகாப்பு முறைகளை பார்க்க தட்டவும்.'
        },
        ml: {
            title: '🔬 വിള രോഗ മുന്നറിയിപ്പ്: {crop} — കൃഷി വാണി',
            body: 'കൂടിയ ഈർപ്പം കാരണം {risk} സാധ്യത. പ്രതിരോധ മാർഗ്ഗങ്ങൾ കാണാൻ ടാപ്പ് ചെയ്യുക.'
        }
    },

    IRRIGATION_ADVICE: {
        en: {
            title: '💧 Smart Irrigation Reminder — Krishi Vaani',
            body: 'Soil moisture is low for {crop}. Apply scheduled irrigation today to prevent stress.'
        },
        te: {
            title: '💧 నీటిపారుదల సలహా — కృషి వాణి',
            body: '{crop} పంటకు నేల తేమ తగ్గింది. ఈరోజే తేలికపాటి తడి అందించండి.'
        },
        kn: {
            title: '💧 ನೀರಾವರಿ ಸಲಹೆ — ಕೃಷಿ ವಾಣಿ',
            body: '{crop} ಬೆಳೆಗೆ ಮಣ್ಣಿನ ತೇವಾಂಶ ಕಡಿಮೆಯಾಗಿದೆ. ಇಂದೇ ನೀರಾವರಿ ಒದಗಿಸಿ.'
        },
        hi: {
            title: '💧 सिंचाई सलाह — कृषि वाणी',
            body: '{crop} के लिए मिट्टी की नमी कम है। आज निर्धारित सिंचाई करें।'
        },
        ta: {
            title: '💧 பாசன ஆலோசனை — கிருஷி வாணி',
            body: '{crop} பயிருக்கு மண் ஈரப்பதம் குறைந்துள்ளது. இன்றே பாசனம் செய்யவும்.'
        },
        ml: {
            title: '💧 ജലസേചന ഉപദേശം — കൃഷി വാണി',
            body: '{crop} വിളയ്ക്ക് മണ്ണിലെ ഈർപ്പം കുറവാണ്. ഇന്ന് നനയ്ക്കുക.'
        }
    },

    // ---------------------------------------------------------
    // 3. Mandi & Market Alerts
    // ---------------------------------------------------------
    MANDI_PRICE_SPIKE: {
        en: {
            title: '📈 Mandi Price Alert: {crop} — Krishi Vaani',
            body: '{crop} modal price reached ₹{price}/Qtl at {mandi} ({change}% change).'
        },
        te: {
            title: '📈 మండి ధర అప్‌డేట్: {crop} — కృషి వాణి',
            body: '{mandi} మార్కెట్‌లో {crop} ధర క్వింటాలుకు ₹{price} చేరింది ({change}% మార్పు).'
        },
        kn: {
            title: '📈 ಮಾರುಕಟ್ಟೆ ದರ ಅಪ್‌ಡೇಟ್: {crop} — ಕೃಷಿ ವಾಣಿ',
            body: '{mandi} ಮಾರುಕಟ್ಟೆಯಲ್ಲಿ {crop} ದರ ಕ್ವಿಂಟಾಲ್‌ಗೆ ₹{price} ಕ್ಕೆ ತಲುಪಿದೆ ({change}% ಬದಲಾವಣೆ).'
        },
        hi: {
            title: '📈 मंडी भाव अपडेट: {crop} — कृषि वाणी',
            body: '{mandi} में {crop} का भाव ₹{price}/क्विंटल पहुंचा ({change}% बदलाव)।'
        },
        ta: {
            title: '📈 சந்தை விலை நிலவரம்: {crop} — கிருஷி வாணி',
            body: '{mandi} சந்தையில் {crop} விலை குவிண்டாலுக்கு ₹{price} ஆனது ({change}% மாற்றம்).'
        },
        ml: {
            title: '📈 മാർക്കറ്റ് വില വിവരങ്ങൾ: {crop} — കൃഷി വാണി',
            body: '{mandi} മാർക്കറ്റിൽ {crop} വില ക്വിന്റലിന് ₹{price} ആയി ({change}% മാറ്റം).'
        }
    },

    // ---------------------------------------------------------
    // 4. Government Schemes & News
    // ---------------------------------------------------------
    GOVT_SCHEME: {
        en: {
            title: '🏛️ New Agriculture Scheme — Krishi Vaani',
            body: '{schemeName}: Applications open. Tap to check your eligibility & benefits.'
        },
        te: {
            title: '🏛️ నూతన వ్యవసాయ పథకం — కృషి వాణి',
            body: '{schemeName}: దరఖాస్తులు ప్రారంభమయ్యాయి. అర్హతలు చూడటానికి నొక్కండి.'
        },
        kn: {
            title: '🏛️ ಹೊಸ ಕೃಷಿ ಯೋಜನೆ — ಕೃಷಿ ವಾಣಿ',
            body: '{schemeName}: ಅರ್ಜಿ ಸಲ್ಲಿಕೆ ಆರಂಭವಾಗಿದೆ. ಅರ್ಹತೆ ಮತ್ತು ಸೌಲಭ್ಯಗಳನ್ನು ವೀಕ್ಷಿಸಿ.'
        },
        hi: {
            title: '🏛️ नई कृषि योजना — कृषि वाणी',
            body: '{schemeName}: आवेदन शुरू। अपनी पात्रता और लाभ जानने के लिए टैप करें।'
        },
        ta: {
            title: '🏛️ புதிய அரசு திட்டம் — கிருஷி வாணி',
            body: '{schemeName}: விண்ணப்பங்கள் தொடங்கப்பட்டுள்ளன. தகுதி விவரங்களை அறிய தட்டவும்.'
        },
        ml: {
            title: '🏛️ പുതിയ കാർഷിക പദ്ധതി — കൃഷി വാണി',
            body: '{schemeName}: അപേക്ഷകൾ ആരംഭിച്ചു. കൂടുതൽ വിവരങ്ങൾക്ക് ടാപ്പ് ചെയ്യുക.'
        }
    }
};

/**
 * Helper to interpolate template variables (e.g. {district}, {temp})
 */
function formatTemplate(templateKey, lang = 'en', variables = {}) {
    const validLang = ['en', 'te', 'kn', 'hi', 'ta', 'ml'].includes(lang) ? lang : 'en';
    const templateGroup = NOTIFICATION_TEMPLATES[templateKey] || NOTIFICATION_TEMPLATES.WEATHER_RAIN;
    const template = templateGroup[validLang] || templateGroup.en;

    let title = template.title;
    let body = template.body;

    for (const [key, val] of Object.entries(variables)) {
        const regex = new RegExp(`\\{${key}\\}`, 'g');
        title = title.replace(regex, val || '');
        body = body.replace(regex, val || '');
    }

    return { title, body };
}

module.exports = {
    NOTIFICATION_TEMPLATES,
    formatTemplate
};
