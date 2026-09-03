
// Base API URL
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
    ? 'http://localhost:4000/api' 
    : '/api';
window.API_BASE_URL = API_BASE_URL;

const SUPPORTED_LANGUAGES = ['en', 'kn', 'ta', 'te', 'ml', 'hi'];

const I18N_DICT = {
    en: {
        // Nav & Common
        nav_dashboard: "Dashboard",
        nav_marketplace: "Marketplace",
        nav_crop_alerts: "Crop Alerts",
        nav_alert_guard: "AlertGuard",
        nav_agri_news: "Agri-News",
        mkt_reported_daily: "Daily mandi prices from across India",
        mkt_highlight_1_title: "High Tomato & Onion Arrivals",
        mkt_highlight_1_desc: "Active trading in southern and western mandis.",
        mkt_highlight_2_title: "Daily Price Updates",
        mkt_highlight_2_desc: "Updated daily from Agmarknet & Data.gov.in.",
        mkt_highlight_3_title: "Direct Farmer Listings",
        mkt_highlight_3_desc: "Connect directly with verified local farmers & FPOs.",
        nav_menu: "Menu",
        nav_profile: "Profile",
        nav_appearance: "Appearance",
        nav_notifications: "Notifications",
        nav_settings: "Settings",
        nav_logout: "Logout",
        nav_light: "Light",
        nav_dark: "Dark",
        nav_system: "System",

        // Dashboard
        dash_welcome: "Welcome back",
        dash_loading_loc: "Loading location...",
        dash_gps_verified: "GPS Verified",
        dash_manual_loc: "Manual Location",
        dash_accuracy: "Accuracy",
        dash_refresh_loc: "Refresh Location",
        dash_select_manually: "Select Manually",
        dash_loading_weather: "Loading weather...",
        dash_humidity: "Humidity",
        dash_wind: "Wind",
        dash_pressure: "Pressure",
        dash_visibility: "Visibility",
        dash_feels_like: "Feels Like",
        dash_forecast_24h: "24-Hour Forecast",
        dash_loading_forecast: "Loading forecast...",
        dash_map_search: "Search village, city, or district...",
        dash_seasonal_title: "Seasonal Crops",
        dash_auto: "AUTO",
        dash_fetching_seasonal: "Fetching seasonal recommendations...",
        dash_advisor_title: "AI Crop Advisor",
        dash_advisor_desc: "Enter any crop name for weather-based advice.",
        dash_crop_placeholder: "e.g., Ragi, Tomato, Paddy, Cotton...",
        dash_get_advice: "Get Advice",
        dash_analyzing_crop: "Analyzing crop for current local climate...",
        dash_advisor_empty: "Type a crop name above to get agronomic & weather-tailored guidance.",
        dash_chat_header: "Krishi AI",
        dash_chat_greeting: "Hello! I am your Krishi AI Advisor. How can I help you?",
        dash_chat_placeholder: "Ask about crops, weather...",
        dash_loc_detected: "Location Detected",
        dash_loc_accuracy_approx: "Location accuracy: approximately",
        dash_loc_use_info: "This location will be used to provide precise OpenWeather telemetry, automated crop alerts, and nearby market intelligence.",
        dash_try_again: "Try Again",
        dash_use_this_loc: "Use This Location",
        dash_sel_loc_manually: "Select Location Manually",
        dash_state_ut: "State / Union Territory *",
        dash_sel_state: "-- Select State --",
        dash_district: "District *",
        dash_city_town: "City / Town / Village",
        dash_cancel: "Cancel",
        dash_set_loc: "Set Location",
        dash_farmer_profile: "Farmer Profile",
        dash_phone: "Phone",
        dash_location: "Location",
        dash_coords: "GPS Coordinates",
        dash_app_settings: "Farmer Settings",
        dash_language: "Preferred Language",
        dash_close: "Close",
        dash_agri_status_title: "Today's Agricultural Status",
        dash_crop_alerts: "Crop Alerts",
        dash_weather_risk: "Rain & Weather Risk",
        dash_rec_action: "Recommended Action",
        dash_mandi_title: "Nearby Markets / Mandi Prices",
        dash_view_marketplace: "View Marketplace",
        dash_news_title: "Latest Agricultural News",
        dash_read_all_news: "Read All News",
        dash_live_modal_price: "Live Modal Price",
        dash_stable_demand: "Stable Demand",
        dash_msp_active: "Government MSP Active",
        dash_high_arrivals: "High Daily Arrivals",
        dash_strong_procurement: "Strong Procurement",
        dash_per_qtl: "/ Qtl",
        dash_loading_mandi: "Loading live mandi prices...",
        dash_no_mandi: "No mandi prices available for this location.",
        dash_failed_mandi: "Failed to load market prices.",
        dash_loading_news: "Loading verified agricultural news...",
        dash_no_news: "No agricultural news available at this time.",
        dash_failed_news: "Could not load news preview.",
        dash_today: "Today",
        dash_image_unavailable: "Image unavailable",
        dash_agri_news_source: "Agri News",

        // Marketplace
        mkt_title_prefix: "Indian",
        mkt_title_accent: "Agricultural Market",
        mkt_subtitle: "Explore daily mandi prices, nearby markets and agricultural listings across India.",
        mkt_your_location: "Your Location",
        mkt_last_updated: "Last Updated",
        mkt_active_mandis: "Active Mandis",
        mkt_states_covered: "States Covered",
        mkt_commodities: "Commodities",
        mkt_latest_price_date: "Latest Price Date",
        mkt_filter_type: "Type",
        mkt_filter_state: "State",
        mkt_filter_district: "District",
        mkt_filter_commodity: "Commodity",
        mkt_filter_search_ph: "Search Mandi / Commodity...",
        mkt_filter_apply: "Apply",
        mkt_all_types: "All Types",
        mkt_all_states: "All States",
        mkt_all_districts: "All Districts",
        mkt_all_commodities: "All Commodities",
        mkt_type_mandi: "Mandi Prices",
        mkt_type_seller: "Seller Listings",
        mkt_type_buyer: "Buyer Requirements",
        mkt_loading_prices: "Loading live market prices...",
        mkt_no_data: "No market data found for this selection.",
        mkt_failed_load: "Failed to load market prices. Please try again.",
        mkt_modal_price: "Modal Price",
        mkt_min_price: "Min Price",
        mkt_max_price: "Max Price",
        mkt_arrival_date: "Arrival Date",
        mkt_market_mandi: "Market / Mandi",
        mkt_state_district: "State & District",
        mkt_trend: "Trend",
        mkt_actions: "Actions",
        mkt_compare_prices: "Compare Prices",
        mkt_view_details: "View Details",
        mkt_nearby_markets: "Nearby Markets (GPS Calculated)",
        mkt_km_away: "km away",
        mkt_call_seller: "Call Seller",
        mkt_compare_title: "Price Comparison",
        mkt_compare_desc: "Compare modal prices for this commodity across regional mandis.",

        // Crop Alerts
        ca_title: "Smart Crop Alert Engine",
        ca_subtitle: "Select your crop to get weather-based alerts with priority levels & trigger actions",
        ca_weather_summary: "Current Weather Summary",
        ca_loading_weather: "Loading weather...",
        ca_alerts_title: "Crop Alerts",
        ca_analyzing: "Analyzing crop conditions...",
        ca_forecast_title: "Weather Forecast Visualization",
        ca_forecast_subtitle: "5-day weather trends for your location",
        ca_temp: "Temperature (°C)",
        ca_humidity: "Humidity (%)",
        ca_wind: "Wind Speed (m/s)",
        ca_pressure: "Pressure (hPa)",

        // AlertGuard
        ag_title: "AlertGuard Settings",
        ag_subtitle: "Type your crop name → thresholds auto-adjust to that crop's sensitivity. Save to activate SMS & Voice alerts.",
        ag_crop_placeholder: "Type crop name (e.g., Tomato, Rice, Ragi, Cotton...)",
        ag_temp_help: "Alert if temp exceeds this",
        ag_humidity_help: "Alert if humidity exceeds this",
        ag_wind_help: "Alert if wind exceeds this",
        ag_rain_label: "Rain Alert",
        ag_heavy_rain: "Heavy Rain Alerts",
        ag_rain_help: "Notified on heavy rain",
        ag_save_btn: "Save & Check Current Weather",

        // Agri-News
        news_title: "Farmer News & Updates",
        news_subtitle: "Stay informed with the latest agricultural news, government schemes, weather alerts & farming technology",
        news_cat_all: "All News",
        news_cat_crops: "Crops & Market",
        news_cat_weather: "Weather",
        news_cat_schemes: "Govt Schemes",
        news_cat_tech: "Agri-Tech",
        news_loading: "Loading farmer news...",
        news_read_more: "Read Full Article",
        news_no_news: "No farmer news found for this category.",
        news_failed: "Failed to load news. Please try again later.",

        // Common
        common_loading: "Loading...",
        common_error: "Error",
        common_success: "Success",
        common_save: "Save",
        common_cancel: "Cancel",
        common_close: "Close",
        profile_title: "Farmer Profile",
        profile_verified: "Verified Krishi Vaani Account",
        profile_personal_info: "Personal Information",
        profile_full_name: "Full Name",
        profile_mobile_number: "Mobile Number",
        profile_pref_language: "Preferred Language",
        profile_account_status: "Account Status",
        profile_status_active: "Active & Protected",
        profile_farm_location: "Farm Location",
        profile_location: "Location",
        profile_gps_coords: "GPS Coordinates",
        profile_account_security: "Account & Security",
        profile_password: "Password",
        profile_security_tier: "Security Tier",
        profile_sec_verified: "OTP / PIN Verified",
        profile_change_password: "Change Password",
        profile_change_photo: "Change Photo",
        profile_close: "Close",
        profile_my_profile: "My Profile",
        profile_appearance: "Appearance",
        profile_notifications: "Notifications",
        profile_settings: "Settings",
        profile_logout: "Logout",
        cp_title: "Change Password",
        cp_subtitle: "Update your account password securely",
        cp_current_pw: "Current Password",
        cp_current_ph: "Enter your current password",
        cp_new_pw: "New Password",
        cp_new_ph: "Enter new password (min. 6 characters)",
        cp_confirm_pw: "Confirm New Password",
        cp_confirm_ph: "Re-enter new password",
        cp_btn_cancel: "Cancel",
        cp_btn_update: "Update Password",
        cp_err_empty_current: "Please enter your current password.",
        cp_err_empty_new: "Please enter a new password.",
        cp_err_length: "New password must be at least 6 characters long.",
        cp_err_mismatch: "New password and confirmation password do not match.",
        cp_err_same: "New password cannot be identical to your current password.",
        cp_success: "Password updated successfully.",
    },
    kn: {        profile_title: "ರೈತರ ಪ್ರೊಫೈಲ್",
        profile_verified: "ಪರಿಶೀಲಿಸಿದ ಕೃಷಿ ವಾಣಿ ಖಾತೆ",
        profile_personal_info: "ವೈಯಕ್ತಿಕ ಮಾಹಿತಿ",
        profile_full_name: "ಪೂರ್ಣ ಹೆಸರು",
        profile_mobile_number: "ಮೊಬೈಲ್ ಸಂಖ್ಯೆ",
        profile_pref_language: "ಆದ್ಯತೆಯ ಭಾಷೆ",
        profile_account_status: "ಖಾತೆ ಸ್ಥಿತಿ",
        profile_status_active: "ಸಕ್ರಿಯ ಮತ್ತು ಸುರಕ್ಷಿತ",
        profile_farm_location: "ಕೃಷಿ ಭೂಮಿ ಸ್ಥಳ",
        profile_location: "ಸ್ಥಳ",
        profile_gps_coords: "GPS ನಿರ್ದೇಶಾಂಕಗಳು",
        profile_account_security: "ಖಾತೆ ಮತ್ತು ಭದ್ರತೆ",
        profile_password: "ಪಾಸ್‌ವರ್ಡ್",
        profile_security_tier: "ಭದ್ರತಾ ಶ್ರೇಣಿ",
        profile_sec_verified: "OTP / PIN ಪರಿಶೀಲಿಸಲಾಗಿದೆ",
        profile_change_password: "ಪಾಸ್‌ವರ್ಡ್ ಬದಲಾಯಿಸಿ",
        profile_change_photo: "ಫೋಟೋ ಬದಲಾಯಿಸಿ",
        profile_close: "ಮುಚ್ಚಿ",
        profile_my_profile: "ನನ್ನ ಪ್ರೊಫೈಲ್",
        profile_appearance: "ಗೋಚರತೆ",
        profile_notifications: "ಅಧಿಸೂಚನೆಗಳು",
        profile_settings: "ಸೆಟ್ಟಿಂಗ್‌ಗಳು",
        profile_logout: "ಲಾಗ್‌ಔಟ್",
        cp_title: "ಪಾಸ್‌ವರ್ಡ್ ಬದಲಾಯಿಸಿ",
        cp_subtitle: "ನಿಮ್ಮ ಖಾತೆಯ ಪಾಸ್‌ವರ್ಡ್ ಅನ್ನು ಸುರಕ್ಷಿತವಾಗಿ ನವೀಕರಿಸಿ",
        cp_current_pw: "ಪ್ರಸ್ತುತ ಪಾಸ್‌ವರ್ಡ್",
        cp_current_ph: "ನಿಮ್ಮ ಪ್ರಸ್ತುತ ಪಾಸ್‌ವರ್ಡ್ ನಮೂದಿಸಿ",
        cp_new_pw: "ಹೊಸ ಪಾಸ್‌ವರ್ಡ್",
        cp_new_ph: "ಹೊಸ ಪಾಸ್‌ವರ್ಡ್ ನಮೂದಿಸಿ (ಕನಿಷ್ಠ 6 ಅಕ್ಷರಗಳು)",
        cp_confirm_pw: "ಹೊಸ ಪಾಸ್‌ವರ್ಡ್ ದೃಢೀಕರಿಸಿ",
        cp_confirm_ph: "ಹೊಸ ಪಾಸ್‌ವರ್ಡ್ ಅನ್ನು ಮರುನಮೂದಿಸಿ",
        cp_btn_cancel: "ರದ್ದುಮಾಡಿ",
        cp_btn_update: "ಪಾಸ್‌ವರ್ಡ್ ನವೀಕರಿಸಿ",
        cp_err_empty_current: "ದಯವಿಟ್ಟು ನಿಮ್ಮ ಪ್ರಸ್ತುತ ಪಾಸ್‌ವರ್ಡ್ ನಮೂದಿಸಿ.",
        cp_err_empty_new: "ದಯವಿಟ್ಟು ಹೊಸ ಪಾಸ್‌ವರ್ಡ್ ನಮೂದಿಸಿ.",
        cp_err_length: "ಹೊಸ ಪಾಸ್‌ವರ್ಡ್ ಕನಿಷ್ಠ 6 ಅಕ್ಷರಗಳನ್ನು ಹೊಂದಿರಬೇಕು.",
        cp_err_mismatch: "ಹೊಸ ಪಾಸ್‌ವರ್ಡ್ ಮತ್ತು ದೃಢೀಕರಣ ಪಾಸ್‌ವರ್ಡ್ ಹೊಂದಿಕೆಯಾಗುತ್ತಿಲ್ಲ.",
        cp_err_same: "ಹೊಸ ಪಾಸ್‌ವರ್ಡ್ ಪ್ರಸ್ತುತ ಪಾಸ್‌ವರ್ಡ್‌ನಂತೆಯೇ ಇರಬಾರದು.",
        cp_success: "ಪಾಸ್‌ವರ್ಡ್ ಯಶಸ್ವಿಯಾಗಿ ನವೀಕರಿಸಲಾಗಿದೆ.",

        // Nav & Common
        nav_dashboard: "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್",
        nav_marketplace: "ಮಾರುಕಟ್ಟೆ",
        nav_crop_alerts: "ಬೆಳೆ ಎಚ್ಚರಿಕೆಗಳು",
        nav_alert_guard: "ಅಲರ್ಟ್‌ಗಾರ್ಡ್",
        nav_agri_news: "ಕೃಷಿ ಸುದ್ದಿ",
        mkt_reported_daily: "ಭಾರತದಾದ್ಯಂತ ದೈನಂದಿನ ಮಾರುಕಟ್ಟೆ ಬೆಲೆಗಳು",
        mkt_highlight_1_title: "ಟೊಮೇಟೊ ಮತ್ತು ಈರುಳ್ಳಿ ಹೆಚ್ಚಿನ ಆಗಮನ",
        mkt_highlight_1_desc: "ದಕ್ಷಿಣ ಮತ್ತು ಪಶ್ಚಿಮ ಮಂಡಿಗಳಲ್ಲಿ ಸಕ್ರಿಯ ವ್ಯಾಪಾರ.",
        mkt_highlight_2_title: "ದೈನಂದಿನ ಬೆಲೆ ನವೀಕರಣಗಳು",
        mkt_highlight_2_desc: "Agmarknet ಮತ್ತು Data.gov.in ನಿಂದ ಪ್ರತಿದಿನ ನವೀಕರಿಸಲಾಗುತ್ತದೆ.",
        mkt_highlight_3_title: "ನೇರ ರೈತರ ಪಟ್ಟಿಗಳು",
        mkt_highlight_3_desc: "ಪರಿಶೀಲಿಸಿದ ಸ್ಥಳೀಯ ರೈತರು ಮತ್ತು FPOಗಳೊಂದಿಗೆ ನೇರವಾಗಿ ಸಂಪರ್ಕ ಸಾಧಿಸಿ.",
        nav_menu: "ಮೆನು",
        nav_profile: "ಪ್ರೊಫೈಲ್",
        nav_appearance: "ವಿನ್ಯಾಸ",
        nav_notifications: "ಸೂಚನೆಗಳು",
        nav_settings: "ಸೆಟ್ಟಿಂಗ್ಸ್",
        nav_logout: "ಲಾಗ್ ಔಟ್",
        nav_light: "ಬೆಳಕು",
        nav_dark: "ಕತ್ತಲೆ",
        nav_system: "ಸಿಸ್ಟಮ್",

        // Dashboard
        dash_welcome: "ಮರಳಿ ಸ್ವಾಗತ",
        dash_loading_loc: "ಸ್ಥಳವನ್ನು ಲೋಡ್ ಮಾಡಲಾಗುತ್ತಿದೆ...",
        dash_gps_verified: "GPS ಪರಿಶೀಲಿಸಲಾಗಿದೆ",
        dash_manual_loc: "ಹಸ್ತಚಾಲಿತ ಸ್ಥಳ",
        dash_accuracy: "ನಿಖರತೆ",
        dash_refresh_loc: "ಸ್ಥಳವನ್ನು ರಿಫ್ರೆಶ್ ಮಾಡಿ",
        dash_select_manually: "ಸ್ವತಃ ಆಯ್ಕೆಮಾಡಿ",
        dash_loading_weather: "ಹವಾಮಾನ ಲೋಡ್ ಮಾಡಲಾಗುತ್ತಿದೆ...",
        dash_humidity: "ತೇವಾಂಶ",
        dash_wind: "ಗಾಳಿ",
        dash_pressure: "ಒತ್ತಡ",
        dash_visibility: "ಗೋಚರತೆ",
        dash_feels_like: "ಅನುಭವವಾಗುವ ತಾಪ",
        dash_forecast_24h: "24-ಗಂಟೆಗಳ ಮುನ್ಸೂಚನೆ",
        dash_loading_forecast: "ಮುನ್ಸೂಚನೆ ಲೋಡ್ ಮಾಡಲಾಗುತ್ತಿದೆ...",
        dash_map_search: "ಗ್ರಾಮ, ನಗರ ಅಥವಾ ಜಿಲ್ಲೆಯನ್ನು ಹುಡುಕಿ...",
        dash_seasonal_title: "ಋತುಮಾನದ ಬೆಳೆಗಳು",
        dash_auto: "ಸ್ವಯಂಚಾಲಿತ",
        dash_fetching_seasonal: "ಋತುಮಾನದ ಶಿಫಾರಸುಗಳನ್ನು ಪಡೆಯಲಾಗುತ್ತಿದೆ...",
        dash_advisor_title: "AI ಬೆಳೆ ಸಲಹೆಗಾರ",
        dash_advisor_desc: "ಹವಾಮಾನ ಆಧಾರಿತ ಸಲಹೆಗಾಗಿ ಬೆಳೆ ಹೆಸರನ್ನು ನಮೂದಿಸಿ.",
        dash_crop_placeholder: "ಉದಾ: ರಾಗಿ, ಟೊಮೆಟೊ, ಭತ್ತ, ಹತ್ತಿ...",
        dash_get_advice: "ಸಲಹೆ ಪಡೆಯಿರಿ",
        dash_analyzing_crop: "ಸ್ಥಳೀಯ ಹವಾಮಾನಕ್ಕೆ ತಕ್ಕಂತೆ ಬೆಳೆ ವಿಶ್ಲೇಷಿಸಲಾಗುತ್ತಿದೆ...",
        dash_advisor_empty: "ಹವಾಮಾನ ಆಧಾರಿತ ಮಾರ್ಗದರ್ಶನ ಪಡೆಯಲು ಬೆಳೆ ಹೆಸರನ್ನು ನಮೂದಿಸಿ.",
        dash_chat_header: "ಕೃಷಿ AI",
        dash_chat_greeting: "ನಮಸ್ಕಾರ! ನಾನು ನಿಮ್ಮ ಕೃಷಿ AI ಸಲಹೆಗಾರ. ನಾನು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಬಹುದು?",
        dash_chat_placeholder: "ಬೆಳೆಗಳು, ಹವಾಮಾನದ ಬಗ್ಗೆ ಕೇಳಿ...",
        dash_loc_detected: "ಸ್ಥಳ ಪತ್ತೆಯಾಗಿದೆ",
        dash_loc_accuracy_approx: "ಸ್ಥಳದ ನಿಖರತೆ: ಸರಿಸುಮಾರು",
        dash_loc_use_info: "ಈ ಸ್ಥಳವನ್ನು ನಿಖರವಾದ ಹವಾಮಾನ ಮಾಹಿತಿ, ಬೆಳೆ ಎಚ್ಚರಿಕೆಗಳು ಮತ್ತು ಮಾರುಕಟ್ಟೆ ಮಾಹಿತಿಗಾಗಿ ಬಳಸಲಾಗುತ್ತದೆ.",
        dash_try_again: "ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ",
        dash_use_this_loc: "ಈ ಸ್ಥಳ ಬಳಸಿ",
        dash_sel_loc_manually: "ಸ್ಥಳವನ್ನು ಹಸ್ತಚಾಲಿತವಾಗಿ ಆಯ್ಕೆಮಾಡಿ",
        dash_state_ut: "ರಾಜ್ಯ / ಕೇಂದ್ರಾಡಳಿತ ಪ್ರದೇಶ *",
        dash_sel_state: "-- ರಾಜ್ಯವನ್ನು ಆಯ್ಕೆಮಾಡಿ --",
        dash_district: "ಜಿಲ್ಲೆ *",
        dash_city_town: "ನಗರ / ಪಟ್ಟಣ / ಗ್ರಾಮ",
        dash_cancel: "ರದ್ದುಮಾಡಿ",
        dash_set_loc: "ಸ್ಥಳವನ್ನು ಹೊಂದಿಸಿ",
        dash_farmer_profile: "ರೈತರ ಪ್ರೊಫೈಲ್",
        dash_phone: "ದೂರವಾಣಿ",
        dash_location: "ಸ್ಥಳ",
        dash_coords: "GPS ನಿರ್ದೇಶಾಂಕಗಳು",
        dash_app_settings: "ರೈತರ ಸೆಟ್ಟಿಂಗ್ಸ್",
        dash_language: "ಆದ್ಯತೆಯ ಭಾಷೆ",
        dash_close: "ಮುಚ್ಚಿ",
        dash_agri_status_title: "ಇಂದಿನ ಕೃಷಿ ಸ್ಥಿತಿ",
        dash_crop_alerts: "ಬೆಳೆ ಎಚ್ಚರಿಕೆಗಳು",
        dash_weather_risk: "ಮಳೆ ಮತ್ತು ಹವಾಮಾನ ಅಪಾಯ",
        dash_rec_action: "ಶಿಫಾರಸು ಮಾಡಿದ ಕ್ರಮ",
        dash_mandi_title: "ಹತ್ತಿರದ ಮಾರುಕಟ್ಟೆಗಳು / ಮಂಡಿ ದರಗಳು",
        dash_view_marketplace: "ಮಾರುಕಟ್ಟೆ ವೀಕ್ಷಿಸಿ",
        dash_news_title: "ಇತ್ತೀಚಿನ ಕೃಷಿ ಸುದ್ದಿ",
        dash_read_all_news: "ಎಲ್ಲಾ ಸುದ್ದಿಗಳನ್ನು ಓದಿ",
        dash_live_modal_price: "ನೇರ ಮಾದರಿ ಬೆಲೆ",
        dash_stable_demand: "ಸ್ಥಿರ ಬೇಡಿಕೆ",
        dash_msp_active: "ಸರ್ಕಾರಿ ಕನಿಷ್ಠ ಬೆಂಬಲ ಬೆಲೆ (MSP) ಸಕ್ರಿಯ",
        dash_high_arrivals: "ಹೆಚ್ಚಿನ ದೈನಂದಿನ ಆವಕ",
        dash_strong_procurement: "ಉತ್ತಮ ಖರೀದಿ ಪ್ರಕ್ರಿಯೆ",
        dash_per_qtl: "/ ಕ್ವಿಂಟಾಲ್",
        dash_loading_mandi: "ಮಂಡಿ ದರಗಳನ್ನು ಲೋಡ್ ಮಾಡಲಾಗುತ್ತಿದೆ...",
        dash_no_mandi: "ಈ ಸ್ಥಳಕ್ಕೆ ಯಾವುದೇ ಮಂಡಿ ದರಗಳು ಲಭ್ಯವಿಲ್ಲ.",
        dash_failed_mandi: "ಮಾರುಕಟ್ಟೆ ದರ ಲೋಡ್ ಮಾಡಲು ವಿಫಲವಾಗಿದೆ.",
        dash_loading_news: "ಕೃಷಿ ಸುದ್ದಿಗಳನ್ನು ಲೋಡ್ ಮಾಡಲಾಗುತ್ತಿದೆ...",
        dash_no_news: "ಈ ಸಮಯದಲ್ಲಿ ಯಾವುದೇ ಕೃಷಿ ಸುದ್ದಿ ಲಭ್ಯವಿಲ್ಲ.",
        dash_failed_news: "ಸುದ್ದಿ ಮುನ್ನೋಟವನ್ನು ಲೋಡ್ ಮಾಡಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ.",
        dash_today: "ಇಂದು",
        dash_image_unavailable: "ಚಿತ್ರ ಲಭ್ಯವಿಲ್ಲ",
        dash_agri_news_source: "ಕೃಷಿ ವಾರ್ತೆ",

        // Marketplace
        mkt_title_prefix: "ಭಾರತೀಯ",
        mkt_title_accent: "ಕೃಷಿ ಮಾರುಕಟ್ಟೆ",
        mkt_subtitle: "ಭಾರತದಾದ್ಯಂತ ದೈನಂದಿನ ಮಂಡಿ ದರಗಳು, ಹತ್ತಿರದ ಮಾರುಕಟ್ಟೆಗಳು ಮತ್ತು ಕೃಷಿ ಪಟ್ಟಿಗಳನ್ನು ಅನ್ವೇಷಿಸಿ.",
        mkt_your_location: "ನಿಮ್ಮ ಸ್ಥಳ",
        mkt_last_updated: "ಕೊನೆಯ ನವೀಕರಣ",
        mkt_active_mandis: "ಸಕ್ರಿಯ ಮಂಡಿಗಳು",
        mkt_states_covered: "ಒಳಗೊಂಡ ರಾಜ್ಯಗಳು",
        mkt_commodities: "ಕೃಷಿ ಉತ್ಪನ್ನಗಳು",
        mkt_latest_price_date: "ಇತ್ತೀಚಿನ ಬೆಲೆ ದಿನಾಂಕ",
        mkt_filter_type: "ವಿಧ",
        mkt_filter_state: "ರಾಜ್ಯ",
        mkt_filter_district: "ಜಿಲ್ಲೆ",
        mkt_filter_commodity: "ಉತ್ಪನ್ನ",
        mkt_filter_search_ph: "ಮಂಡಿ / ಉತ್ಪನ್ನ ಹುಡುಕಿ...",
        mkt_filter_apply: "ಅನ್ವಯಿಸು",
        mkt_all_types: "ಎಲ್ಲಾ ವಿಧಗಳು",
        mkt_all_states: "ಎಲ್ಲಾ ರಾಜ್ಯಗಳು",
        mkt_all_districts: "ಎಲ್ಲಾ ಜಿಲ್ಲೆಗಳು",
        mkt_all_commodities: "ಎಲ್ಲಾ ಉತ್ಪನ್ನಗಳು",
        mkt_type_mandi: "ಮಂಡಿ ದರಗಳು",
        mkt_type_seller: "ಮಾರಾಟಗಾರರ ಪಟ್ಟಿ",
        mkt_type_buyer: "ಖರೀದಿದಾರರ ಬೇಡಿಕೆಗಳು",
        mkt_loading_prices: "ಮಾರುಕಟ್ಟೆ ದರಗಳನ್ನು ಲೋಡ್ ಮಾಡಲಾಗುತ್ತಿದೆ...",
        mkt_no_data: "ಯಾವುದೇ ಮಾರುಕಟ್ಟೆ ಮಾಹಿತಿ ಲಭ್ಯವಿಲ್ಲ.",
        mkt_failed_load: "ಮಾರುಕಟ್ಟೆ ದರ ಲೋಡ್ ಮಾಡಲು ವಿಫಲವಾಗಿದೆ.",
        mkt_modal_price: "ಮಾದರಿ ಬೆಲೆ",
        mkt_min_price: "ಕನಿಷ್ಠ ಬೆಲೆ",
        mkt_max_price: "ಗರಿಷ್ಠ ಬೆಲೆ",
        mkt_arrival_date: "ಆಗಮನ ದಿನಾಂಕ",
        mkt_market_mandi: "ಮಾರುಕಟ್ಟೆ / ಮಂಡಿ",
        mkt_state_district: "ರಾಜ್ಯ ಮತ್ತು ಜಿಲ್ಲೆ",
        mkt_trend: "ಪ್ರವೃತ್ತಿ",
        mkt_actions: "ಕ್ರಿಯೆಗಳು",
        mkt_compare_prices: "ಬೆಲೆಗಳನ್ನು ಹೋಲಿಸಿ",
        mkt_view_details: "ವಿವರ ನೋಡಿ",
        mkt_nearby_markets: "ಹತ್ತಿರದ ಮಾರುಕಟ್ಟೆಗಳು (GPS ಲೆಕ್ಕಾಚಾರ)",
        mkt_km_away: "ಕಿ.ಮೀ ದೂರ",
        mkt_call_seller: "ಮಾರಾಟಗಾರರಿಗೆ ಕರೆ ಮಾಡಿ",
        mkt_compare_title: "ಬೆಲೆ ಹೋಲಿಕೆ",
        mkt_compare_desc: "ಪ್ರಾದೇಶಿಕ ಮಂಡಿಗಳಲ್ಲಿ ಈ ಉತ್ಪನ್ನದ ದರಗಳನ್ನು ಹೋಲಿಸಿ.",

        // Crop Alerts
        ca_title: "ಸ್ಮಾರ್ಟ್ ಬೆಳೆ ಎಚ್ಚರಿಕೆ ಇಂಜಿನ್",
        ca_subtitle: "ಹವಾಮಾನ ಆಧಾರಿತ ಎಚ್ಚರಿಕೆಗಳು ಮತ್ತು ಸಲಹೆಗಳನ್ನು ಪಡೆಯಲು ನಿಮ್ಮ ಬೆಳೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ",
        ca_weather_summary: "ಪ್ರಸ್ತುತ ಹವಾಮಾನ ಸಾರಾಂಶ",
        ca_loading_weather: "ಹವಾಮಾನ ಲೋಡ್ ಮಾಡಲಾಗುತ್ತಿದೆ...",
        ca_alerts_title: "ಬೆಳೆ ಎಚ್ಚರಿಕೆಗಳು",
        ca_analyzing: "ಬೆಳೆ ಪರಿಸ್ಥಿತಿಗಳನ್ನು ವಿಶ್ಲೇಷಿಸಲಾಗುತ್ತಿದೆ...",
        ca_forecast_title: "ಹವಾಮಾನ ಮುನ್ಸೂಚನೆ ದೃಶ್ಯೀಕರಣ",
        ca_forecast_subtitle: "ನಿಮ್ಮ ಸ್ಥಳಕ್ಕಾಗಿ 5 ದಿನಗಳ ಹವಾಮಾನ ಪ್ರವೃತ್ತಿ",
        ca_temp: "ತಾಪಮಾನ (°C)",
        ca_humidity: "ತೇವಾಂಶ (%)",
        ca_wind: "ಗಾಳಿಯ ವೇಗ (m/s)",
        ca_pressure: "ಒತ್ತಡ (hPa)",

        // AlertGuard
        ag_title: "ಅಲರ್ಟ್‌ಗಾರ್ಡ್ ಸೆಟ್ಟಿಂಗ್ಸ್",
        ag_subtitle: "ಬೆಳೆ ಹೆಸರನ್ನು ಟೈಪ್ ಮಾಡಿ → ಮಿತಿಗಳು ಸ್ವಯಂಚಾಲಿತವಾಗಿ ಸರಿಹೊಂದುತ್ತವೆ. SMS ಮತ್ತು ಧ್ವನಿ ಎಚ್ಚರಿಕೆಗಳನ್ನು ಸಕ್ರಿಯಗೊಳಿಸಲು ಉಳಿಸಿ.",
        ag_crop_placeholder: "ಬೆಳೆ ಹೆಸರನ್ನು ಟೈಪ್ ಮಾಡಿ (ಉದಾ: ಟೊಮೆಟೊ, ಭತ್ತ, ರಾಗಿ, ಹತ್ತಿ...)",
        ag_temp_help: "ತಾಪಮಾನ ಮೀರಿದರೆ ಎಚ್ಚರಿಸಿ",
        ag_humidity_help: "ತೇವಾಂಶ ಮೀರಿದರೆ ಎಚ್ಚರಿಸಿ",
        ag_wind_help: "ಗಾಳಿ ಮೀರಿದರೆ ಎಚ್ಚರಿಸಿ",
        ag_rain_label: "ಮಳೆ ಎಚ್ಚರಿಕೆ",
        ag_heavy_rain: "ಭಾರೀ ಮಳೆ ಎಚ್ಚರಿಕೆಗಳು",
        ag_rain_help: "ಭಾರೀ ಮಳೆಯಾದಾಗ ಸೂಚನೆ ನೀಡಿ",
        ag_save_btn: "ಉಳಿಸಿ ಮತ್ತು ಹವಾಮಾನ ಪರಿಶೀಲಿಸಿ",

        // Agri-News
        news_title: "ರೈತರ ಸುದ್ದಿ ಮತ್ತು ಅಪ್ಡೇಟ್‌ಗಳು",
        news_subtitle: "ಇತ್ತೀಚಿನ ಕೃಷಿ ಸುದ್ದಿ, ಸರ್ಕಾರಿ ಯೋಜನೆಗಳು ಮತ್ತು ತಂತ್ರಜ್ಞಾನದ ಬಗ್ಗೆ ಮಾಹಿತಿ ಪಡೆಯಿರಿ",
        news_cat_all: "ಎಲ್ಲಾ ಸುದ್ದಿಗಳು",
        news_cat_crops: "ಬೆಳೆಗಳು ಮತ್ತು ಮಾರುಕಟ್ಟೆ",
        news_cat_weather: "ಹವಾಮಾನ",
        news_cat_schemes: "ಸರ್ಕಾರಿ ಯೋಜನೆಗಳು",
        news_cat_tech: "ಕೃಷಿ ತಂತ್ರಜ್ಞಾನ",
        news_loading: "ಕೃಷಿ ಸುದ್ದಿ ಲೋಡ್ ಮಾಡಲಾಗುತ್ತಿದೆ...",
        news_read_more: "ಸಂಪೂರ್ಣ ಲೇಖನ ಓದಿ",
        news_no_news: "ಈ ವಿಭಾಗದಲ್ಲಿ ಯಾವುದೇ ಸುದ್ದಿ ಲಭ್ಯವಿಲ್ಲ.",
        news_failed: "ಸುದ್ದಿ ಲೋಡ್ ಮಾಡಲು ವಿಫಲವಾಗಿದೆ.",

        // Common
        common_loading: "ಲೋಡ್ ಮಾಡಲಾಗುತ್ತಿದೆ...",
        common_error: "ದೋಷ",
        common_success: "ಯಶಸ್ವಿ",
        common_save: "ಉಳಿಸಿ",
        common_cancel: "ರದ್ದುಮಾಡಿ",
        common_close: "ಮುಚ್ಚಿ"
    },
    ta: {
        mkt_highlight_3_desc: "சரிபார்க்கப்பட்ட உள்ளூர் விவசாயிகள் மற்றும் FPOக்களுடன் நேரடி தொடர்பு.",
        mkt_highlight_3_title: "நேரடி விவசாயி பட்டியல்கள்",
        mkt_highlight_2_desc: "Agmarknet மற்றும் Data.gov.in இலிருந்து தினசரி புதுப்பிக்கப்படுகிறது.",
        mkt_highlight_2_title: "தினசரி விலை புதுப்பிப்பு",
        mkt_highlight_1_desc: "தென் மற்றும் மேற்கு மண்டிகளில் தீவிர வர்த்தகம்.",
        mkt_highlight_1_title: "தக்காளி & வெங்காய வரத்து அதிகம்",
        mkt_highlights: "சந்தை சிறப்பம்சங்கள்",
        mkt_view_all: "அனைத்தையும் காண்க",
        mkt_nearby_markets_short: "அருகிலுள்ள சந்தைகள்",
        mkt_sort_latest: "வரிசைப்படுத்து: சமீபத்திய தேதி",
        mkt_reported_daily: "இந்தியா முழுவதிலும் இருந்து தினசரி மண்டி விலைகள்",
        mkt_todays_mandi_prices: "இன்றைய மண்டி விலைகள்",        profile_title: "விவசாயி சுயவிவரம்",
        profile_verified: "சரிபார்க்கப்பட்ட கிருஷி வாணி கணக்கு",
        profile_personal_info: "தனிப்பட்ட தகவல்",
        profile_full_name: "முழு பெயர்",
        profile_mobile_number: "கைபேசி எண்",
        profile_pref_language: "விருப்பமான மொழி",
        profile_account_status: "கணக்கு நிலை",
        profile_status_active: "செயலில் & பாதுகாப்பானது",
        profile_farm_location: "பண்ணை அமைவிடம்",
        profile_location: "அமைவிடம்",
        profile_gps_coords: "GPS ஆயத்தொலைவுகள்",
        profile_account_security: "கணக்கு & பாதுகாப்பு",
        profile_password: "கடவுச்சொல்",
        profile_security_tier: "பாதுகாப்பு அடுக்கு",
        profile_sec_verified: "OTP / PIN சரிபார்க்கப்பட்டது",
        profile_change_password: "கடவுச்சொல்லை மாற்றவும்",
        profile_change_photo: "புகைப்படத்தை மாற்றவும்",
        profile_close: "மூடுக",
        profile_my_profile: "என் சுயவிவரம்",
        profile_appearance: "தோற்றம்",
        profile_notifications: "அறிவிப்புகள்",
        profile_settings: "அமைப்புகள்",
        profile_logout: "வெளியேறு",
        cp_title: "கடவுச்சொல்லை மாற்றவும்",
        cp_subtitle: "உங்கள் கணக்கு கடவுச்சொல்லை பாதுகாப்பாக புதுப்பிக்கவும்",
        cp_current_pw: "தற்போதைய கடவுச்சொல்",
        cp_current_ph: "உங்கள் தற்போதைய கடவுச்சொல்லை உள்ளிடவும்",
        cp_new_pw: "புதிய கடவுச்சொல்",
        cp_new_ph: "புதிய கடவுச்சொல்லை உள்ளிடவும் (குறைந்தது 6 எழுத்துக்கள்)",
        cp_confirm_pw: "புதிய கடவுச்சொல்லை உறுதிப்படுத்தவும்",
        cp_confirm_ph: "புதிய கடவுச்சொல்லை மீண்டும் உள்ளிடவும்",
        cp_btn_cancel: "ரத்து செய்",
        cp_btn_update: "கடவுச்சொல்லைப் புதுப்பிக்கவும்",
        cp_err_empty_current: "தயவுசெய்து உங்கள் தற்போதைய கடவுச்சொல்லை உள்ளிடவும்.",
        cp_err_empty_new: "தயவுசெய்து புதிய கடவுச்சொல்லை உள்ளிடவும்.",
        cp_err_length: "புதிய கடவுச்சொல் குறைந்தது 6 எழுத்துக்களாக இருக்க வேண்டும்.",
        cp_err_mismatch: "புதிய கடவுச்சொல் மற்றும் உறுதிப்படுத்தல் கடவுச்சொல் பொருந்தவில்லை.",
        cp_err_same: "புதிய கடவுச்சொல் உங்கள் தற்போதைய கடவுச்சொல்லாக இருக்கக்கூடாது.",
        cp_success: "கடவுச்சொல் வெற்றிகரமாக புதுப்பிக்கப்பட்டது.",

        // Nav & Common
        nav_dashboard: "டாஷ்போர்டு",
        nav_marketplace: "சந்தை",
        nav_crop_alerts: "பயிர் எச்சரிக்கைகள்",
        nav_alert_guard: "அலர்ட்கார்ட்",
        nav_agri_news: "வேளாண் செய்திகள்",
        nav_menu: "மெனு",
        nav_profile: "சுயவிவரம்",
        nav_appearance: "தோற்றம்",
        nav_notifications: "அறிவிப்புகள்",
        nav_settings: "அமைப்புகள்",
        nav_logout: "வெளியேறு",
        nav_light: "வெளிச்சம்",
        nav_dark: "இருள்",
        nav_system: "கணினி",

        // Dashboard
        dash_welcome: "மீண்டும் வரவேற்கிறோம்",
        dash_loading_loc: "இருப்பிடத்தை ஏற்றுகிறது...",
        dash_gps_verified: "GPS சரிபார்க்கப்பட்டது",
        dash_manual_loc: "கைமுறை இருப்பிடம்",
        dash_accuracy: "துல்லியம்",
        dash_refresh_loc: "இருப்பிடத்தை புதுப்பிக்கவும்",
        dash_select_manually: "கைமுறையாக தேர்ந்தெடுக்கவும்",
        dash_loading_weather: "வானிலை ஏற்றுகிறது...",
        dash_humidity: "ஈரப்பதம்",
        dash_wind: "காற்று",
        dash_pressure: "அழுத்தம்",
        dash_visibility: "பார்வைத்திறன்",
        dash_feels_like: "உணரப்படும் வெப்பநிலை",
        dash_forecast_24h: "24 மணிநேர முன்னறிவிப்பு",
        dash_loading_forecast: "முன்னறிவிப்பை ஏற்றுகிறது...",
        dash_map_search: "கிராமம், நகரம் அல்லது மாவட்டத்தை தேடவும்...",
        dash_seasonal_title: "பருவகால பயிர்கள்",
        dash_auto: "தானியங்கி",
        dash_fetching_seasonal: "பருவகால பரிந்துரைகளைப் பெறுகிறது...",
        dash_advisor_title: "AI பயிர் ஆலோசகர்",
        dash_advisor_desc: "வானிலை அடிப்படையில் ஆலோசனைக்கு பயிர் பெயரை உள்ளிடவும்.",
        dash_crop_placeholder: "எ.கா. ராகி, தக்காளி, நெல், பருத்தி...",
        dash_get_advice: "ஆலோசனை பெறுக",
        dash_analyzing_crop: "உள்ளூர் வானிலைக்கு ஏற்ப பயிரை பகுப்பாய்வு செய்கிறது...",
        dash_advisor_empty: "வானிலை அடிப்படையிலான வழிகாட்டுதலுக்கு பயிர் பெயரை உள்ளிடவும்.",
        dash_chat_header: "கிருஷி AI",
        dash_chat_greeting: "வணக்கம்! நான் உங்கள் கிருஷி AI ஆலோசகர். நான் உங்களுக்கு எப்படி உதவ முடியும்?",
        dash_chat_placeholder: "பயிர்கள், வானிலை பற்றி கேளுங்கள்...",
        dash_loc_detected: "இருப்பிடம் கண்டறியப்பட்டது",
        dash_loc_accuracy_approx: "இருப்பிட துல்லியம்: தோராயமாக",
        dash_loc_use_info: "துல்லியமான வானிலை, பயிர் எச்சரிக்கைகள் மற்றும் சந்தை தகவல்களுக்கு இந்த இருப்பிடம் பயன்படுத்தப்படும்.",
        dash_try_again: "மீண்டும் முயற்சிக்கவும்",
        dash_use_this_loc: "இந்த இருப்பிடத்தைப் பயன்படுத்து",
        dash_sel_loc_manually: "கைமுறையாக இருப்பிடத்தை தேர்ந்தெடுக்கவும்",
        dash_state_ut: "மாநிலம் / யூனியன் பிரதேசம் *",
        dash_sel_state: "-- மாநிலத்தை தேர்ந்தெடுக்கவும் --",
        dash_district: "மாவட்டம் *",
        dash_city_town: "நகரம் / கிராமம்",
        dash_cancel: "ரத்து செய்",
        dash_set_loc: "இருப்பிடத்தை அமைக்கவும்",
        dash_farmer_profile: "விவசாயி சுயவிவரம்",
        dash_phone: "தொலைபேசி",
        dash_location: "இருப்பிடம்",
        dash_coords: "GPS ஆயத்தொலைவுகள்",
        dash_app_settings: "விவசாயி அமைப்புகள்",
        dash_language: "விருப்பமான மொழி",
        dash_close: "மூடு",
        dash_agri_status_title: "இன்றைய விவசாய நிலை",
        dash_crop_alerts: "பயிர் எச்சரிக்கைகள்",
        dash_weather_risk: "மழை மற்றும் வானிலை ஆபத்து",
        dash_rec_action: "பரிந்துரைக்கப்பட்ட நடவடிக்கை",
        dash_mandi_title: "அருகிலுள்ள சந்தைகள் / மண்டி விலைகள்",
        dash_view_marketplace: "சந்தையைப் பார்க்கவும்",
        dash_news_title: "சமீபத்திய வேளாண் செய்திகள்",
        dash_read_all_news: "அனைத்து செய்திகளையும் படிக்கவும்",
        dash_live_modal_price: "நேரடி மாதிரி விலை",
        dash_stable_demand: "நிலையான தேவை",
        dash_msp_active: "அரசு குறைந்தபட்ச ஆதரவு விலை (MSP) நடைமுறையில் உள்ளது",
        dash_high_arrivals: "அதிக தினசரி வரத்து",
        dash_strong_procurement: "தீவிர கொள்முதல்",
        dash_per_qtl: "/ குவிண்டால்",
        dash_loading_mandi: "மண்டி விலைகள் ஏற்றப்படுகின்றன...",
        dash_no_mandi: "இந்த இடத்திற்கு மண்டி விலைகள் கிடைக்கவில்லை.",
        dash_failed_mandi: "சந்தை விலைகளை ஏற்றுவதில் தோல்வி.",
        dash_loading_news: "வேளாண் செய்திகள் ஏற்றப்படுகின்றன...",
        dash_no_news: "தற்போது வேளாண் செய்திகள் எதுவும் கிடைக்கவில்லை.",
        dash_failed_news: "செய்தி முன்னோட்டத்தை ஏற்ற முடியவில்லை.",
        dash_today: "இன்று",
        dash_image_unavailable: "படம் கிடைக்கவில்லை",
        dash_agri_news_source: "வேளாண் செய்தி",

        // Marketplace
        mkt_title_prefix: "இந்திய",
        mkt_title_accent: "வேளாண் சந்தை",
        mkt_subtitle: "இந்தியா முழுவதிலும் தினசரி மண்டி விலைகள், அருகிலுள்ள சந்தைகள் மற்றும் வேளாண் பட்டியல்களை ஆராயுங்கள்.",
        mkt_your_location: "உங்கள் இருப்பிடம்",
        mkt_last_updated: "கடைசி புதுப்பிப்பு",
        mkt_active_mandis: "செயலில் உள்ள மண்டிகள்",
        mkt_states_covered: "உள்ளடக்கிய மாநிலங்கள்",
        mkt_commodities: "வேளாண் பொருட்கள்",
        mkt_latest_price_date: "சமீபத்திய விலை தேதி",
        mkt_filter_type: "வகை",
        mkt_filter_state: "மாநிலம்",
        mkt_filter_district: "மாவட்டம்",
        mkt_filter_commodity: "பயிர்/பொருள்",
        mkt_filter_search_ph: "மண்டி / பொருளைத் தேடுங்கள்...",
        mkt_filter_apply: "பயன்படுத்து",
        mkt_all_types: "அனைத்து வகைகள்",
        mkt_all_states: "அனைத்து மாநிலங்கள்",
        mkt_all_districts: "அனைத்து மாவட்டங்கள்",
        mkt_all_commodities: "அனைத்து பொருட்கள்",
        mkt_type_mandi: "மண்டி விலைகள்",
        mkt_type_seller: "விற்பனையாளர் பட்டியல்",
        mkt_type_buyer: "வாங்குபவர் தேவைகள்",
        mkt_loading_prices: "சந்தை விலைகள் ஏற்றப்படுகின்றன...",
        mkt_no_data: "சந்தை தகவல்கள் எதுவும் கிடைக்கவில்லை.",
        mkt_failed_load: "சந்தை விலைகளை ஏற்றுவதில் தோல்வி.",
        mkt_modal_price: "மாதிரி விலை",
        mkt_min_price: "குறைந்தபட்ச விலை",
        mkt_max_price: "அதிகபட்ச விலை",
        mkt_arrival_date: "வந்த தேதி",
        mkt_market_mandi: "சந்தை / மண்டி",
        mkt_state_district: "மாநிலம் & மாவட்டம்",
        mkt_trend: "போக்கு",
        mkt_actions: "செயல்கள்",
        mkt_compare_prices: "விலைகளை ஒப்பிடவும்",
        mkt_view_details: "விவரங்களை பார்க்கவும்",
        mkt_nearby_markets: "அருகிலுள்ள சந்தைகள் (GPS கணக்கீடு)",
        mkt_km_away: "கி.மீ தொலைவில்",
        mkt_call_seller: "விற்பனையாளரை அழைக்கவும்",
        mkt_compare_title: "விலை ஒப்பீடு",
        mkt_compare_desc: "மண்டிகளில் இந்த பொருளின் விலைகளை ஒப்பிட்டுப் பார்க்கவும்.",

        // Crop Alerts
        ca_title: "ஸ்மார்ட் பயிர் எச்சரிக்கை இயந்திரம்",
        ca_subtitle: "வானிலை சார்ந்த எச்சரிக்கைகள் மற்றும் ஆலோசனைகளைப் பெற பயிரைத் தேர்ந்தெடுக்கவும்",
        ca_weather_summary: "தற்போதைய வானிலை சுருக்கம்",
        ca_loading_weather: "வானிலை ஏற்றுகிறது...",
        ca_alerts_title: "பயிர் எச்சரிக்கைகள்",
        ca_analyzing: "பயிர் நிலைகளை பகுப்பாய்வு செய்கிறது...",
        ca_forecast_title: "வானிலை முன்னறிவிப்பு காட்சி",
        ca_forecast_subtitle: "உங்கள் இருப்பிடத்திற்கான 5 நாள் வானிலை போக்குகள்",
        ca_temp: "வெப்பநிலை (°C)",
        ca_humidity: "ஈரப்பதம் (%)",
        ca_wind: "காற்றின் வேகம் (m/s)",
        ca_pressure: "அழுத்தம் (hPa)",

        // AlertGuard
        ag_title: "அலர்ட்கார்ட் அமைப்புகள்",
        ag_subtitle: "பயிர் பெயரை உள்ளிடவும் → வரம்புகள் தானாகவே மாறும். SMS மற்றும் குரல் எச்சரிக்கைகளை செயல்படுத்த சேமிக்கவும்.",
        ag_crop_placeholder: "பயிர் பெயரை உள்ளிடவும் (எ.கா. தக்காளி, நெல், ராகி, பருத்தி...)",
        ag_temp_help: "வெப்பநிலை இதைத் தாண்டினால் எச்சரிக்கவும்",
        ag_humidity_help: "ஈரப்பதம் இதைத் தாண்டினால் எச்சரிக்கவும்",
        ag_wind_help: "காற்று இதைத் தாண்டினால் எச்சரிக்கவும்",
        ag_rain_label: "மழை எச்சரிக்கை",
        ag_heavy_rain: "கனமழை எச்சரிக்கைகள்",
        ag_rain_help: "கனமழை பெய்யும்போது அறிவிக்கப்படும்",
        ag_save_btn: "சேமித்து வானிலையை சரிபார்க்கவும்",

        // Agri-News
        news_title: "விவசாயி செய்திகள் & தகவல்கள்",
        news_subtitle: "சமீபத்திய விவசாய செய்திகள், அரசு திட்டங்கள் மற்றும் தொழில்நுட்ப தகவல்களைப் பெறுங்கள்",
        news_cat_all: "அனைத்து செய்திகள்",
        news_cat_crops: "பயிர்கள் & சந்தை",
        news_cat_weather: "வானிலை",
        news_cat_schemes: "அரசு திட்டங்கள்",
        news_cat_tech: "வேளாண் தொழில்நுட்பம்",
        news_loading: "செய்திகளை ஏற்றுகிறது...",
        news_read_more: "முழு செய்தியையும் படிக்கவும்",
        news_no_news: "இந்த பிரிவில் செய்திகள் எதுவும் இல்லை.",
        news_failed: "செய்திகளை ஏற்றுவதில் தோல்வி.",

        // Common
        common_loading: "ஏற்றுகிறது...",
        common_error: "பிழை",
        common_success: "வெற்றி",
        common_save: "சேமிக்கவும்",
        common_cancel: "ரத்து செய்",
        common_close: "மூடு"
    },
    te: {        profile_title: "రైతు ప్రొఫైల్",
        profile_verified: "ధృవీకరించబడిన కృషి వాణి ఖాతా",
        profile_personal_info: "వ్యక్తిగత సమాచారం",
        profile_full_name: "పూర్తి పేరు",
        profile_mobile_number: "మొబైల్ సంఖ్య",
        profile_pref_language: "ప్రాధాన్యత భాష",
        profile_account_status: "ఖాతా స్థితి",
        profile_status_active: "క్రియాశీల & రక్షితం",
        profile_farm_location: "వ్యవసాయ క్షేత్రం స్థానం",
        profile_location: "ప్రాంతం",
        profile_gps_coords: "GPS కోఆర్డినేట్స్",
        profile_account_security: "ఖాతా & భద్రత",
        profile_password: "పాస్‌వర్డ్",
        profile_security_tier: "భద్రతా శ్రేణి",
        profile_sec_verified: "OTP / PIN ధృవీకరించబడింది",
        profile_change_password: "పాస్‌వర్డ్ మార్చండి",
        profile_change_photo: "ఫోటో మార్చండి",
        profile_close: "మూసివేయి",
        profile_my_profile: "నా ప్రొఫైల్",
        profile_appearance: "రూపురేఖలు",
        profile_notifications: "నోటిఫికేషన్లు",
        profile_settings: "సెట్టింగ్స్",
        profile_logout: "లాగౌట్",
        cp_title: "పాస్‌వర్డ్ మార్చండి",
        cp_subtitle: "మీ ఖాతా పాస్‌వర్డ్‌ను సురక్షితంగా నవీకరించండి",
        cp_current_pw: "ప్రస్తుత పాస్‌వర్డ్",
        cp_current_ph: "మీ ప్రస్తుత పాస్‌వర్డ్‌ను నమోదు చేయండి",
        cp_new_pw: "కొత్త పాస్‌వర్డ్",
        cp_new_ph: "కొత్త పాస్‌వర్డ్‌ను నమోదు చేయండి (కనీసం 6 అక్షరాలు)",
        cp_confirm_pw: "కొత్త పాస్‌వర్డ్‌ను నిర్ధారించండి",
        cp_confirm_ph: "కొత్త పాస్‌వర్డ్‌ను మళ్లీ నమోదు చేయండి",
        cp_btn_cancel: "రద్దు చేయండి",
        cp_btn_update: "పాస్‌వర్డ్‌ను అప్‌డేట్ చేయండి",
        cp_err_empty_current: "దయచేసి మీ ప్రస్తుత పాస్‌వర్డ్‌ను నమోదు చేయండి.",
        cp_err_empty_new: "దయచేసి కొత్త పాస్‌వర్డ్‌ను నమోదు చేయండి.",
        cp_err_length: "కొత్త పాస్‌వర్డ్ కనీసం 6 అక్షరాలు ఉండాలి.",
        cp_err_mismatch: "కొత్త పాస్‌వర్డ్ మరియు నిర్ధారణ పాస్‌వర్డ్ సరిపోలడం లేదు.",
        cp_err_same: "కొత్త పాస్‌వర్డ్ మీ ప్రస్తుత పాస్‌వర్డ్ వలె ఉండకూడదు.",
        cp_success: "పాస్‌వర్డ్ విజయవంతంగా నవీకరించబడింది.",

        // Nav & Common
        nav_dashboard: "డ్యాష్‌బోర్డ్",
        nav_marketplace: "మార్కెట్",
        nav_crop_alerts: "పంట హెచ్చరికలు",
        nav_alert_guard: "అలర్ట్‌గార్డ్",
        nav_agri_news: "వ్యవసాయ వార్తలు",
        mkt_reported_daily: "భారతదేశం నలుమూలల నుండి రోజువారీ మార్కెట్ ధరలు",
        mkt_highlight_1_title: "టమోటా & ఉల్లిపాయల అధిక రాక",
        mkt_highlight_1_desc: "దక్షిణ మరియు పశ్చిమ మార్కెట్లలో చురుకైన వ్యాపారం.",
        mkt_highlight_2_title: "రోజువారీ ధరల నవీకరణలు",
        mkt_highlight_2_desc: "Agmarknet మరియు Data.gov.in నుండి రోజూ నవీకరించబడుతుంది.",
        mkt_highlight_3_title: "రైతుల ప్రత్యక్ష జాబితాలు",
        mkt_highlight_3_desc: "ధృవీకరించబడిన స్థానిక రైతులు మరియు FPOలతో నేరుగా కనెక్ట్ అవ్వండి.",
        nav_menu: "మెనూ",
        nav_profile: "ప్రొఫైల్",
        nav_appearance: "రూపురేఖలు",
        nav_notifications: "నోటిఫికేషన్లు",
        nav_settings: "సెట్టింగ్‌లు",
        nav_logout: "లాగ్ అవుట్",
        nav_light: "లైట్",
        nav_dark: "డార్క్",
        nav_system: "సిస్టమ్",

        // Dashboard
        dash_welcome: "తిరిగి స్వాగతం",
        dash_loading_loc: "లొకేషన్ లోడ్ అవుతోంది...",
        dash_gps_verified: "GPS ధృవీకరించబడింది",
        dash_manual_loc: "మాన్యువల్ లొకేషన్",
        dash_accuracy: "ఖచ్చితత్వం",
        dash_refresh_loc: "లొకేషన్ రిఫ్రెష్ చేయండి",
        dash_select_manually: "మాన్యువల్‌గా ఎంచుకోండి",
        dash_loading_weather: "వాతావరణం లోడ్ అవుతోంది...",
        dash_humidity: "తేమ",
        dash_wind: "గాలి వేగం",
        dash_pressure: "పీడనం",
        dash_visibility: "దృశ్యమానత",
        dash_feels_like: "అనిపించే ఉష్ణోగ్రత",
        dash_forecast_24h: "24-గంటల సూచన",
        dash_loading_forecast: "సూచన లోడ్ అవుతోంది...",
        dash_map_search: "గ్రామం, నగరం లేదా జిల్లాను శోధించండి...",
        dash_seasonal_title: "సీజనల్ పంటలు",
        dash_auto: "ఆటో",
        dash_fetching_seasonal: "సీజనల్ సిఫార్సులను పొందుతోంది...",
        dash_advisor_title: "AI పంట సలహాదారు",
        dash_advisor_desc: "వాతావరణ ఆధారిత సలహా కోసం పంట పేరు నమోదు చేయండి.",
        dash_crop_placeholder: "ఉదా: రాగి, టమాటా, వరి, పత్తి...",
        dash_get_advice: "సలహా పొందండి",
        dash_analyzing_crop: "స్థానిక వాతావరణానికి అనుగుణంగా పంటను విశ్లేషిస్తోంది...",
        dash_advisor_empty: "వాతావరణ ఆధారిత మార్గదర్శకత్వం కోసం పైన పంట పేరును నమోదు చేయండి.",
        dash_chat_header: "కృషి AI",
        dash_chat_greeting: "నమస్కారం! నేను మీ కృషి AI సలహాదారుని. నేను మీకు ఎలా సహాయం చేయగలను?",
        dash_chat_placeholder: "పంటలు, వాతావరణం గురించి అడగండి...",
        dash_loc_detected: "లొకేషన్ కనుగొనబడింది",
        dash_loc_accuracy_approx: "లొకేషన్ ఖచ్చితత్వం: సుమారుగా",
        dash_loc_use_info: "ఖచ్చితమైన వాతావరణం, పంట హెచ్చరికలు మరియు మార్కెట్ సమాచారం కోసం ఈ లొకేషన్ ఉపయోగించబడుతుంది.",
        dash_try_again: "మళ్లీ ప్రయత్నించండి",
        dash_use_this_loc: "ఈ లొకేషన్‌ను ఉపయోగించండి",
        dash_sel_loc_manually: "లొకేషన్‌ను మాన్యువల్‌గా ఎంచుకోండి",
        dash_state_ut: "రాష్ట్రం / కేంద్రపాలిత ప్రాంతం *",
        dash_sel_state: "-- రాష్ట్రాన్ని ఎంచుకోండి --",
        dash_district: "జిల్లా *",
        dash_city_town: "నగరం / పట్టణం / గ్రామం",
        dash_cancel: "రద్దు చేయండి",
        dash_set_loc: "లొకేషన్‌ను సెట్ చేయండి",
        dash_farmer_profile: "రైతు ప్రొఫైల్",
        dash_phone: "ఫోన్",
        dash_location: "లొకేషన్",
        dash_coords: "GPS కోఆర్డినేట్స్",
        dash_app_settings: "రైతు సెట్టింగ్‌లు",
        dash_language: "భాష",
        dash_close: "మూసివేయి",
        dash_agri_status_title: "నేటి వ్యవసాయ స్థితి",
        dash_crop_alerts: "పంట హెచ్చరికలు",
        dash_weather_risk: "వర్షం మరియు వాతావరణ రిస్క్",
        dash_rec_action: "సిఫార్సు చేసిన చర్య",
        dash_mandi_title: "సమీప మార్కెట్లు / మండి ధరలు",
        dash_view_marketplace: "మార్కెట్‌ప్లేస్ చూడండి",
        dash_news_title: "తాజా వ్యవసాయ వార్తలు",
        dash_read_all_news: "అన్ని వార్తలు చదవండి",
        dash_live_modal_price: "ప్రత్యక్ష మోడల్ ధర",
        dash_stable_demand: "స్థిరమైన డిమాండ్",
        dash_msp_active: "ప్రభుత్వ మద్దతు ధర (MSP) అందుబాటులో ఉంది",
        dash_high_arrivals: "అధిక రోజువారీ రాకపోకలు",
        dash_strong_procurement: "చురుకైన సేకరణ",
        dash_per_qtl: "/ క్వింటాల్",
        dash_loading_mandi: "మండి ధరలను లోడ్ చేస్తోంది...",
        dash_no_mandi: "ఈ ప్రాంతానికి మండి ధరలు అందుబాటులో లేవు.",
        dash_failed_mandi: "మార్కెట్ ధరల లోడింగ్ విఫలమైంది.",
        dash_loading_news: "వ్యవసాయ వార్తలను లోడ్ చేస్తోంది...",
        dash_no_news: "ప్రస్తుతం వ్యవసాయ వార్తలు ఏవీ అందుబాటులో లేవు.",
        dash_failed_news: "వార్తల ప్రివ్యూను లోడ్ చేయడం సాధ్యం కాలేదు.",
        dash_today: "ఈ రోజు",
        dash_image_unavailable: "చిత్రం అందుబాటులో లేదు",
        dash_agri_news_source: "వ్యవసాయ వార్తలు",

        // Marketplace
        mkt_title_prefix: "భారతీయ",
        mkt_title_accent: "వ్యవసాయ మార్కెట్",
        mkt_subtitle: "భారతదేశం అంతటా రోజువారీ మండి ధరలు, సమీప మార్కెట్లు మరియు వ్యవసాయ జాబితాలను అన్వేషించండి.",
        mkt_your_location: "మీ లొకేషన్",
        mkt_last_updated: "చివరి అప్‌డేట్",
        mkt_active_mandis: "యాక్టివ్ మండీలు",
        mkt_states_covered: "కవర్ చేయబడిన రాష్ట్రాలు",
        mkt_commodities: "పంట ఉత్పత్తులు",
        mkt_latest_price_date: "తాజా ధర తేదీ",
        mkt_filter_type: "రకం",
        mkt_filter_state: "రాష్ట్రం",
        mkt_filter_district: "జిల్లా",
        mkt_filter_commodity: "పంట/ఉత్పత్తి",
        mkt_filter_search_ph: "మండి / పంటను శోధించండి...",
        mkt_filter_apply: "వర్తించు",
        mkt_all_types: "అన్ని రకాలు",
        mkt_all_states: "అన్ని రాష్ట్రాలు",
        mkt_all_districts: "అన్ని జిల్లాలు",
        mkt_all_commodities: "అన్ని ఉత్పత్తులు",
        mkt_type_mandi: "మండి ధరలు",
        mkt_type_seller: "విక్రేత జాబితాలు",
        mkt_type_buyer: "కొనుగోలుదారుల అవసరాలు",
        mkt_loading_prices: "లైవ్ మార్కెట్ ధరలు లోడ్ అవుతున్నాయి...",
        mkt_no_data: "మార్కెట్ సమాచారం ఏదీ కనుగొనబడలేదు.",
        mkt_failed_load: "మార్కెట్ ధరలను లోడ్ చేయడంలో విఫలమైంది.",
        mkt_modal_price: "మోడల్ ధర",
        mkt_min_price: "కనిష్ట ధర",
        mkt_max_price: "గరిష్ట ధర",
        mkt_arrival_date: "రాక తేదీ",
        mkt_market_mandi: "మార్కెట్ / మండి",
        mkt_state_district: "రాష్ట్రం & జిల్లా",
        mkt_trend: "ధోరణి",
        mkt_actions: "చర్యలు",
        mkt_compare_prices: "ధరలను పోల్చండి",
        mkt_view_details: "వివరాలు చూడండి",
        mkt_nearby_markets: "సమీప మార్కెట్లు (GPS లెక్కించబడింది)",
        mkt_km_away: "కి.మీ దూరం",
        mkt_call_seller: "విక్రేతకు కాల్ చేయండి",
        mkt_compare_title: "ధర పోలిక",
        mkt_compare_desc: "ప్రాంతీయ మండీలలో ఈ పంట ధరలను పోల్చండి.",

        // Crop Alerts
        ca_title: "స్మార్ట్ పంట హెచ్చరిక ఇంజిన్",
        ca_subtitle: "వాతావరణ ఆధారిత హెచ్చరికలు మరియు సూచనలను పొందడానికి మీ పంటను ఎంచుకోండి",
        ca_weather_summary: "ప్రస్తుత వాతావరణ సారాంశం",
        ca_loading_weather: "వాతావరణం లోడ్ అవుతోంది...",
        ca_alerts_title: "పంట హెచ్చరికలు",
        ca_analyzing: "పంట పరిస్థితులను విశ్లేషిస్తోంది...",
        ca_forecast_title: "వాతావరణ సూచన విజువలైజేషన్",
        ca_forecast_subtitle: "మీ లొకేషన్ కోసం 5-రోజుల వాతావరణ ట్రెండ్‌లు",
        ca_temp: "ఉష్ణోగ్రత (°C)",
        ca_humidity: "తేమ (%)",
        ca_wind: "గాలి వేగం (m/s)",
        ca_pressure: "పీడనం (hPa)",

        // AlertGuard
        ag_title: "అలర్ట్‌గార్డ్ సెట్టింగ్‌లు",
        ag_subtitle: "పంట పేరును టైప్ చేయండి → పరిమితులు ఆటోమేటిక్‌గా సర్దుబాటు అవుతాయి. SMS మరియు వాయిస్ హెచ్చరికల కోసం సేవ్ చేయండి.",
        ag_crop_placeholder: "పంట పేరు టైప్ చేయండి (ఉదా: టమాటా, వరి, రాగి, పత్తి...)",
        ag_temp_help: "ఉష్ణోగ్రత దాటితే హెచ్చరించండి",
        ag_humidity_help: "తేమ దాటితే హెచ్చరించండి",
        ag_wind_help: "గాలి దాటితే హెచ్చరించండి",
        ag_rain_label: "వర్ష హెచ్చరిక",
        ag_heavy_rain: "భారీ వర్ష హెచ్చరికలు",
        ag_rain_help: "భారీ వర్షం పడినప్పుడు తెలియజేయబడుతుంది",
        ag_save_btn: "సేవ్ చేయండి & వాతావరణాన్ని తనిఖీ చేయండి",

        // Agri-News
        news_title: "రైతు వార్తలు & సమాచారం",
        news_subtitle: "తాజా వ్యవసాయ వార్తలు, ప్రభుత్వ పథకాలు, వాతావరణ హెచ్చరికలు & సాంకేతికత గురించి తెలుసుకోండి",
        news_cat_all: "అన్ని వార్తలు",
        news_cat_crops: "పంటలు & మార్కెట్",
        news_cat_weather: "వాతావరణం",
        news_cat_schemes: "ప్రభుత్వ పథకాలు",
        news_cat_tech: "వ్యవసాయ సాంకేతికత",
        news_loading: "రైతు వార్తలను లోడ్ చేస్తోంది...",
        news_read_more: "పూర్తి కథనాన్ని చదవండి",
        news_no_news: "ఈ విభాగంలో వార్తలు ఏవీ లేవు.",
        news_failed: "వార్తలను లోడ్ చేయడంలో విఫలమైంది.",

        // Common
        common_loading: "లోడ్ అవుతోంది...",
        common_error: "లోపం",
        common_success: "విజయం",
        common_save: "సేవ్ చేయండి",
        common_cancel: "రద్దు చేయండి",
        common_close: "మూసివేయి"
    },
    ml: {
        mkt_todays_mandi_prices: "ഇന്നത്തെ വിപണി വിലകൾ",
        mkt_reported_daily: "ഇന്ത്യയിലുടനീളമുള്ള പ്രതിദിന വിപണി വിലകൾ",
        mkt_sort_latest: "തരംതിരിക്കുക: ഏറ്റവും പുതിയ തീയതി",
        mkt_nearby_markets_short: "അടുത്തുള്ള വിപണികൾ",
        mkt_view_all: "എല്ലാം കാണുക",
        mkt_highlights: "വിപണി ഹൈലൈറ്റുകൾ",
        mkt_highlight_1_title: "തക്കാളി, ഉള്ളി വരവ് വർദ്ധിച്ചു",
        mkt_highlight_1_desc: "ദക്ഷിണ, പടിഞ്ഞാറൻ വിപണികളിൽ സജീവ വ്യാപാരം.",
        mkt_highlight_2_title: "പ്രതിദിന വില പുതുക്കൽ",
        mkt_highlight_2_desc: "Agmarknet, Data.gov.in എന്നിവയിൽ നിന്ന് ദിവസവും പുതുക്കുന്നു.",
        mkt_highlight_3_title: "നേരിട്ടുള്ള കർഷക ലിസ്റ്റിംഗുകൾ",
        mkt_highlight_3_desc: "കർഷകരുമായും FPO-കളുമായും നേരിട്ട് ബന്ധപ്പെടുക.",        profile_title: "കർഷക പ്രൊഫൈൽ",
        profile_verified: "പരിശോധിച്ചുറപ്പിച്ച കൃഷി വാണി അക്കൗണ്ട്",
        profile_personal_info: "വ്യക്തിഗത വിവരങ്ങൾ",
        profile_full_name: "പൂർണ്ണമായ പേര്",
        profile_mobile_number: "മൊബൈൽ നമ്പർ",
        profile_pref_language: "തിരഞ്ഞെടുത്ത ഭാഷ",
        profile_account_status: "അക്കൗണ്ട് നില",
        profile_status_active: "സജീവം & സുരക്ഷിതം",
        profile_farm_location: "കൃഷിയിട സ്ഥലം",
        profile_location: "സ്ഥലം",
        profile_gps_coords: "GPS കോർഡിനേറ്റുകൾ",
        profile_account_security: "അക്കൗണ്ടും സുരക്ഷയും",
        profile_password: "പാസ്‌വേഡ്",
        profile_security_tier: "സുരക്ഷാ തലം",
        profile_sec_verified: "OTP / PIN പരിശോധിച്ചു",
        profile_change_password: "പാസ്‌വേഡ് മാറ്റുക",
        profile_change_photo: "ഫോട്ടോ മാറ്റുക",
        profile_close: "അടയ്ക്കുക",
        profile_my_profile: "എന്റെ പ്രൊഫൈൽ",
        profile_appearance: "കാഴ്ച",
        profile_notifications: "അറിയിപ്പുകൾ",
        profile_settings: "ക്രമീകരണങ്ങൾ",
        profile_logout: "ലോഗ്ഔട്ട്",
        cp_title: "പാസ്‌വേഡ് മാറ്റുക",
        cp_subtitle: "നിങ്ങളുടെ അക്കൗണ്ട് പാസ്‌വേഡ് സുരക്ഷിതമായി അപ്‌ഡേറ്റ് ചെയ്യുക",
        cp_current_pw: "നിലവിലെ പാസ്‌വേഡ്",
        cp_current_ph: "നിങ്ങളുടെ നിലവിലെ പാസ്‌വേഡ് നൽകുക",
        cp_new_pw: "പുതിയ പാസ്‌വേഡ്",
        cp_new_ph: "പുതിയ പാസ്‌വേഡ് നൽകുക (കുറഞ്ഞത് 6 അക്ഷരങ്ങൾ)",
        cp_confirm_pw: "പുതിയ പാസ്‌വേഡ് സ്ഥിരീകരിക്കുക",
        cp_confirm_ph: "പുതിയ പാസ്‌വേഡ് വീണ്ടും നൽകുക",
        cp_btn_cancel: "റദ്ദാക്കുക",
        cp_btn_update: "പാസ്‌വേഡ് അപ്ഡേറ്റ് ചെയ്യുക",
        cp_err_empty_current: "ദയവായി നിങ്ങളുടെ നിലവിലെ പാസ്‌വേഡ് നൽകുക.",
        cp_err_empty_new: "ദയവായി ഒരു പുതിയ പാസ്‌വേഡ് നൽകുക.",
        cp_err_length: "പുതിയ പാസ്‌വേഡിൽ കുറഞ്ഞത് 6 അക്ഷരങ്ങൾ ഉണ്ടായിരിക്കണം.",
        cp_err_mismatch: "പുതിയ പാസ്‌വേഡും സ്ഥിരീകരണ പാസ്‌വേഡും പൊരുത്തപ്പെടുന്നില്ല.",
        cp_err_same: "പുതിയ പാസ്‌വേഡ് നിങ്ങളുടെ നിലവിലെ പാസ്‌വേഡിന് തുല്യമാകാൻ കഴിയില്ല.",
        cp_success: "പാസ്‌വേഡ് വിജയകരമായി അപ്‌ഡേറ്റുചെയ്‌തു.",

        // Nav & Common
        nav_dashboard: "ഡാഷ്‌ബോർഡ്",
        nav_marketplace: "വിപണി",
        nav_crop_alerts: "വിള മുന്നറിയിപ്പുകൾ",
        nav_alert_guard: "അലർട്ട്ഗാർഡ്",
        nav_agri_news: "കാർഷിക വാർത്തകൾ",
        nav_menu: "മെനു",
        nav_profile: "പ്രൊഫൈൽ",
        nav_appearance: "രൂപഭാവം",
        nav_notifications: "അറിയിപ്പുകൾ",
        nav_settings: "ക്രമീകരണങ്ങൾ",
        nav_logout: "പുറത്തുകടക്കുക",
        nav_light: "ലൈറ്റ്",
        nav_dark: "ഡാർക്ക്",
        nav_system: "സിസ്റ്റം",

        // Dashboard
        dash_welcome: "തിരികെ സ്വാഗതം",
        dash_loading_loc: "ലൊക്കേഷൻ ലഭ്യമാക്കുന്നു...",
        dash_gps_verified: "GPS സ്ഥിരീകരിച്ചു",
        dash_manual_loc: "മാനുവൽ ലൊക്കേഷൻ",
        dash_accuracy: "കൃത്യത",
        dash_refresh_loc: "ലൊക്കേഷൻ പുതുക്കുക",
        dash_select_manually: "സ്വമേധയാ തിരഞ്ഞെടുക്കുക",
        dash_loading_weather: "കാലാവസ്ഥ ലഭ്യമാക്കുന്നു...",
        dash_humidity: "ഈർപ്പം",
        dash_wind: "കാറ്റ്",
        dash_pressure: "മർദ്ദം",
        dash_visibility: "കാഴ്ചപരിധി",
        dash_feels_like: "അനുഭവപ്പെടുന്ന ചൂട്",
        dash_forecast_24h: "24 മണിക്കൂർ പ്രവചനം",
        dash_loading_forecast: "പ്രവചനം ലഭ്യമാക്കുന്നു...",
        dash_map_search: "ഗ്രാമം, നഗരം അല്ലെങ്കിൽ ജില്ല തിരയുക...",
        dash_seasonal_title: "സീസണൽ വിളകൾ",
        dash_auto: "ഓട്ടോ",
        dash_fetching_seasonal: "സീസണൽ ശുപാർശകൾ ലഭ്യമാക്കുന്നു...",
        dash_advisor_title: "AI വിള ഉപദേഷ്ടാവ്",
        dash_advisor_desc: "കാലാവസ്ഥാ അടിസ്ഥാന ഉപദേശത്തിന് വിള പേര് നൽകുക.",
        dash_crop_placeholder: "ഉദാ: റാഗി, തക്കാളി, നെല്ല്, പരുത്തി...",
        dash_get_advice: "ഉപദേശം നേടുക",
        dash_analyzing_crop: "പ്രാദേശിക കാലാവസ്ഥയ്ക്ക് അനുയോജ്യമായി വിശകലനം ചെയ്യുന്നു...",
        dash_advisor_empty: "കാലാവസ്ഥാ അടിസ്ഥാന മാർഗ്ഗനിർദ്ദേശത്തിന് മുകളിൽ വിള പേര് നൽകുക.",
        dash_chat_header: "കൃഷി AI",
        dash_chat_greeting: "നമസ്കാരം! ഞാൻ നിങ്ങളുടെ കൃഷി AI ഉപദേഷ്ടാവാണ്. ഞാൻ നിങ്ങളെ എങ്ങനെ സഹായിക്കാം?",
        dash_chat_placeholder: "വിളകൾ, കാലാവസ്ഥ എന്നിവയെക്കുറിച്ച് ചോദിക്കുക...",
        dash_loc_detected: "ലൊക്കേഷൻ കണ്ടെത്തി",
        dash_loc_accuracy_approx: "ലൊക്കേഷൻ കൃത്യത: ഏകദേശം",
        dash_loc_use_info: "കൃത്യമായ കാലാവസ്ഥ, വിള മുന്നറിയിപ്പുകൾ, വിപണി വിവരങ്ങൾ എന്നിവയ്ക്കായി ഈ ലൊക്കേഷൻ ഉപയോഗിക്കും.",
        dash_try_again: "വീണ്ടും ശ്രമിക്കുക",
        dash_use_this_loc: "ഈ ലൊക്കേഷൻ ഉപയോഗിക്കുക",
        dash_sel_loc_manually: "ലൊക്കേഷൻ സ്വമേധയാ തിരഞ്ഞെടുക്കുക",
        dash_state_ut: "സംസ്ഥാനം / കേന്ദ്രഭരണ പ്രദേശം *",
        dash_sel_state: "-- സംസ്ഥാനം തിരഞ്ഞെടുക്കുക --",
        dash_district: "ജില്ല *",
        dash_city_town: "നഗരം / ഗ്രാമം",
        dash_cancel: "റദ്ദാക്കുക",
        dash_set_loc: "ലൊക്കേഷൻ സെറ്റ് ചെയ്യുക",
        dash_farmer_profile: "കർഷക പ്രൊഫൈൽ",
        dash_phone: "ഫോൺ",
        dash_location: "ലൊക്കേഷൻ",
        dash_coords: "GPS കോർഡിനേറ്റുകൾ",
        dash_app_settings: "കർഷക ക്രമീകരണങ്ങൾ",
        dash_language: "തിരഞ്ഞെടുത്ത ഭാഷ",
        dash_close: "അടയ്ക്കുക",
        dash_agri_status_title: "ഇന്നത്തെ കാർഷിക സ്ഥിതി",
        dash_crop_alerts: "വിള മുന്നറിയിപ്പുകൾ",
        dash_weather_risk: "മഴയും കാലാവസ്ഥാ സാധ്യതയും",
        dash_rec_action: "ശുപാർശ ചെയ്ത നടപടി",
        dash_mandi_title: "സമീപത്തെ മാർക്കറ്റുകൾ / മണ്ടി വിലകൾ",
        dash_view_marketplace: "മാർക്കറ്റ്പ്ലേസ് കാണുക",
        dash_news_title: "ഏറ്റവും പുതിയ കാർഷിക വാർത്തകൾ",
        dash_read_all_news: "എല്ലാ വാർത്തകളും വായിക്കുക",
        dash_live_modal_price: "തത്സമയ മോഡൽ വില",
        dash_stable_demand: "സ്ഥിരമായ ഡിമാൻഡ്",
        dash_msp_active: "സർക്കാർ താങ്ങുവില (MSP) നിലവിലുണ്ട്",
        dash_high_arrivals: "കൂടുതൽ വരവ്",
        dash_strong_procurement: "ശക്തമായ സംഭരണം",
        dash_per_qtl: "/ ക്വിന്റൽ",
        dash_loading_mandi: "മണ്ടി വിലകൾ ലോഡ് ചെയ്യുന്നു...",
        dash_no_mandi: "ഈ പ്രദേശത്ത് മണ്ടി വിലകൾ ലഭ്യമല്ല.",
        dash_failed_mandi: "മാർക്കറ്റ് വിലകൾ ലോഡ് ചെയ്യാൻ കഴിഞ്ഞില്ല.",
        dash_loading_news: "കാർഷിക വാർത്തകൾ ലോഡ് ചെയ്യുന്നു...",
        dash_no_news: "നിലവിൽ കാർഷിക വാർത്തകൾ ലഭ്യമല്ല.",
        dash_failed_news: "വാർത്ത പ്രിവ്യൂ ലോഡ് ചെയ്യാനായില്ല.",
        dash_today: "ഇന്ന്",
        dash_image_unavailable: "ചിത്രം ലഭ്യമല്ല",
        dash_agri_news_source: "കാർഷിക വാർത്ത",

        // Marketplace
        mkt_title_prefix: "ഇന്ത്യൻ",
        mkt_title_accent: "കാർഷിക വിപണി",
        mkt_subtitle: "ഇന്ത്യയിലുടനീളമുള്ള പ്രതിദിന വിപണി വിലകളും അടുത്തുള്ള വിപണികളും കണ്ടെത്തുക.",
        mkt_your_location: "നിങ്ങളുടെ ലൊക്കേഷൻ",
        mkt_last_updated: "അവസാനം പുതുക്കിയത്",
        mkt_active_mandis: "സജീവ വിപണികൾ",
        mkt_states_covered: "ഉൾപ്പെടുത്തിയ സംസ്ഥാനങ്ങൾ",
        mkt_commodities: "ഉൽപ്പന്നങ്ങൾ",
        mkt_latest_price_date: "ഏറ്റവും പുതിയ വില തീയതി",
        mkt_filter_type: "തരം",
        mkt_filter_state: "സംസ്ഥാനം",
        mkt_filter_district: "ജില്ല",
        mkt_filter_commodity: "ഉൽപ്പന്നം",
        mkt_filter_search_ph: "വിപണി / ഉൽപ്പന്നം തിരയുക...",
        mkt_filter_apply: "പ്രയോഗിക്കുക",
        mkt_all_types: "എല്ലാ തരങ്ങളും",
        mkt_all_states: "എല്ലാ സംസ്ഥാനങ്ങളും",
        mkt_all_districts: "എല്ലാ ജില്ലകളും",
        mkt_all_commodities: "എല്ലാ ഉൽപ്പന്നങ്ങളും",
        mkt_type_mandi: "വിപണി വിലകൾ",
        mkt_type_seller: "വിൽപനക്കാരുടെ ലിസ്റ്റ്",
        mkt_type_buyer: "വാങ്ങുന്നവരുടെ ആവശ്യങ്ങൾ",
        mkt_loading_prices: "വിപണി വിലകൾ ലഭ്യമാക്കുന്നു...",
        mkt_no_data: "വിപണി വിവരങ്ങൾ ലഭ്യമല്ല.",
        mkt_failed_load: "വിപണി വിലകൾ ലഭ്യമാക്കാൻ കഴിഞ്ഞില്ല.",
        mkt_modal_price: "ശരാശരി വില",
        mkt_min_price: "കുറഞ്ഞ വില",
        mkt_max_price: "കൂടിയ വില",
        mkt_arrival_date: "വരവ് തീയതി",
        mkt_market_mandi: "വിപണി / മണ്ടി",
        mkt_state_district: "സംസ്ഥാനവും ജില്ലയും",
        mkt_trend: "പ്രവണത",
        mkt_actions: "പ്രവർത്തനങ്ങൾ",
        mkt_compare_prices: "വിലകൾ താരതമ്യം ചെയ്യുക",
        mkt_view_details: "വിവരങ്ങൾ കാണുക",
        mkt_nearby_markets: "അടുത്തുള്ള വിപണികൾ (GPS വഴി)",
        mkt_km_away: "കി.മീ അകലെ",
        mkt_call_seller: "വിൽപനക്കാരനെ വിളിക്കുക",
        mkt_compare_title: "വില താരതമ്യം",
        mkt_compare_desc: "വിവിധ വിപണികളിലെ ഈ ഉൽപ്പന്നത്തിന്റെ വില താരതമ്യം ചെയ്യുക.",

        // Crop Alerts
        ca_title: "സ്മാർട്ട് വിള മുന്നറിയിപ്പ് സംവിധാനം",
        ca_subtitle: "കാലാവസ്ഥ അടിസ്ഥാനമാക്കിയുള്ള മുന്നറിയിപ്പുകൾ ലഭിക്കാൻ വിള തിരഞ്ഞെടുക്കുക",
        ca_weather_summary: "നിലവിലെ കാലാവസ്ഥാ സംഗ്രഹം",
        ca_loading_weather: "കാലാവസ്ഥ ലഭ്യമാക്കുന്നു...",
        ca_alerts_title: "വിള മുന്നറിയിപ്പുകൾ",
        ca_analyzing: "വിള അവസ്ഥ വിശകലനം ചെയ്യുന്നു...",
        ca_forecast_title: "കാലാവസ്ഥാ പ്രവചന ദൃശ്യവൽക്കരണം",
        ca_forecast_subtitle: "നിങ്ങളുടെ ലൊക്കേഷനിലെ 5 ദിവസത്തെ കാലാവസ്ഥ",
        ca_temp: "താപനില (°C)",
        ca_humidity: "ഈർപ്പം (%)",
        ca_wind: "കാറ്റിന്റെ വേഗത (m/s)",
        ca_pressure: "മർദ്ദം (hPa)",

        // AlertGuard
        ag_title: "അലർട്ട്ഗാർഡ് ക്രമീകരണങ്ങൾ",
        ag_subtitle: "വിളയുടെ പേര് നൽകുക → പരിധികൾ സ്വയമേവ ക്രമീകരിക്കപ്പെടും. SMS, വോയ്‌സ് മുന്നറിയിപ്പുകൾക്കായി സംരക്ഷിക്കുക.",
        ag_crop_placeholder: "വിളയുടെ പേര് നൽകുക (ഉദാ: തക്കാളി, നെല്ല്, റാഗി, പരുത്തി...)",
        ag_temp_help: "താപനില കൂടിയാൽ മുന്നറിയിപ്പ് നൽകുക",
        ag_humidity_help: "ഈർപ്പം കൂടിയാൽ മുന്നറിയിപ്പ് നൽകുക",
        ag_wind_help: "കാറ്റ് കൂടിയാൽ മുന്നറിയിപ്പ് നൽകുക",
        ag_rain_label: "മഴ മുന്നറിയിപ്പ്",
        ag_heavy_rain: "കനത്ത മഴ മുന്നറിയിപ്പുകൾ",
        ag_rain_help: "കനത്ത മഴയുള്ളപ്പോൾ അറിയിപ്പ് ലഭിക്കും",
        ag_save_btn: "സംരക്ഷിച്ച് കാലാവസ്ഥ പരിശോധിക്കുക",

        // Agri-News
        news_title: "കർഷക വാർത്തകൾ & അപ്‌ഡേറ്റുകൾ",
        news_subtitle: "ഏറ്റവും പുതിയ കാർഷിക വാർത്തകൾ, സർക്കാർ പദ്ധതികൾ എന്നിവ അറിയുക",
        news_cat_all: "എല്ലാ വാർത്തകളും",
        news_cat_crops: "വിളകളും വിപണിയും",
        news_cat_weather: "കാലാവസ്ഥ",
        news_cat_schemes: "സർക്കാർ പദ്ധതികൾ",
        news_cat_tech: "കാർഷിക സാങ്കേതികവിദ്യ",
        news_loading: "വാർത്തകൾ ലഭ്യമാക്കുന്നു...",
        news_read_more: "പൂർണ്ണ വിവരങ്ങൾ വായിക്കുക",
        news_no_news: "ഈ വിഭാഗത്തിൽ വാർത്തകളൊന്നും ലഭ്യമല്ല.",
        news_failed: "വാർത്തകൾ ലഭ്യമാക്കാൻ കഴിഞ്ഞില്ല.",

        // Common
        common_loading: "ലഭ്യമാക്കുന്നു...",
        common_error: "പിശക്",
        common_success: "വിജയം",
        common_save: "സംരക്ഷിക്കുക",
        common_cancel: "റദ്ദാക്കുക",
        common_close: "അടയ്ക്കുക"
    },
    hi: {        profile_title: "किसान प्रोफ़ाइल",
        profile_verified: "सत्यापित कृषि वाणी खाता",
        profile_personal_info: "व्यक्तिगत जानकारी",
        profile_full_name: "पूरा नाम",
        profile_mobile_number: "मोबाइल नंबर",
        profile_pref_language: "पसंदीदा भाषा",
        profile_account_status: "खाता स्थिति",
        profile_status_active: "सक्रिय और सुरक्षित",
        profile_farm_location: "खेत का स्थान",
        profile_location: "स्थान",
        profile_gps_coords: "जीपीएस निर्देशांक",
        profile_account_security: "खाता और सुरक्षा",
        profile_password: "पासवर्ड",
        profile_security_tier: "सुरक्षा स्तर",
        profile_sec_verified: "OTP / PIN सत्यापित",
        profile_change_password: "पासवर्ड बदलें",
        profile_change_photo: "फ़ोटो बदलें",
        profile_close: "बंद करें",
        profile_my_profile: "मेरी प्रोफ़ाइल",
        profile_appearance: "दिखावट",
        profile_notifications: "सूचनाएं",
        profile_settings: "सेटिंग्स",
        profile_logout: "लॉगआउट",
        cp_title: "पासवर्ड बदलें",
        cp_subtitle: "अपना खाता पासवर्ड सुरक्षित रूप से अपडेट करें",
        cp_current_pw: "वर्तमान पासवर्ड",
        cp_current_ph: "अपना वर्तमान पासवर्ड दर्ज करें",
        cp_new_pw: "नया पासवर्ड",
        cp_new_ph: "नया पासवर्ड दर्ज करें (न्यूनतम 6 अक्षर)",
        cp_confirm_pw: "नए पासवर्ड की पुष्टि करें",
        cp_confirm_ph: "नया पासवर्ड दोबारा दर्ज करें",
        cp_btn_cancel: "रद्द करें",
        cp_btn_update: "पासवर्ड अपडेट करें",
        cp_err_empty_current: "कृपया अपना वर्तमान पासवर्ड दर्ज करें।",
        cp_err_empty_new: "कृपया नया पासवर्ड दर्ज करें।",
        cp_err_length: "नया पासवर्ड कम से कम 6 अक्षरों का होना चाहिए।",
        cp_err_mismatch: "नया पासवर्ड और पुष्टिकरण पासवर्ड मेल नहीं खाते।",
        cp_err_same: "नया पासवर्ड आपके वर्तमान पासवर्ड जैसा नहीं हो सकता।",
        cp_success: "पासवर्ड सफलतापूर्वक अपडेट किया गया।",

        // Nav & Common
        nav_dashboard: "डैशबोर्ड",
        nav_marketplace: "मंडी / बाज़ार",
        nav_crop_alerts: "फसल अलर्ट",
        nav_alert_guard: "अलर्टगार्ड",
        nav_agri_news: "कृषि समाचार",
        mkt_reported_daily: "पूरे भारत से दैनिक मंडी भाव",
        mkt_highlight_1_title: "टमाटर और प्याज की भारी आवक",
        mkt_highlight_1_desc: "दक्षिणी और पश्चिमी मंडियों में सक्रिय व्यापार।",
        mkt_highlight_2_title: "दैनिक मूल्य अपडेट",
        mkt_highlight_2_desc: "Agmarknet और Data.gov.in से प्रतिदिन अपडेट किया जाता है।",
        mkt_highlight_3_title: "प्रत्यक्ष किसान लिस्टिंग",
        mkt_highlight_3_desc: "सत्यापित स्थानीय किसानों और एफपीओ से सीधे जुड़ें।",
        nav_menu: "मेनू",
        nav_profile: "प्रोफाइल",
        nav_appearance: "थीम / दृश्य",
        nav_notifications: "सूचनाएं",
        nav_settings: "सेटिंग्स",
        nav_logout: "लॉग आउट",
        nav_light: "लाइट",
        nav_dark: "डार्क",
        nav_system: "सिस्टम",

        // Dashboard
        dash_welcome: "वापसी पर स्वागत",
        dash_loading_loc: "स्थान लोड हो रहा है...",
        dash_gps_verified: "GPS सत्यापित",
        dash_manual_loc: "मैनुअल स्थान",
        dash_accuracy: "सटीकता",
        dash_refresh_loc: "स्थान रीफ्रेश करें",
        dash_select_manually: "मैन्युअल रूप से चुनें",
        dash_loading_weather: "मौसम लोड हो रहा है...",
        dash_humidity: "नमी",
        dash_wind: "हवा",
        dash_pressure: "दबाव",
        dash_visibility: "दृश्यता",
        dash_feels_like: "महसूस तापमान",
        dash_forecast_24h: "24-घंटे का पूर्वानुमान",
        dash_loading_forecast: "पूर्वानुमान लोड हो रहा है...",
        dash_map_search: "गाँव, शहर या जिला खोजें...",
        dash_seasonal_title: "मौसमी फसलें",
        dash_auto: "ऑटो",
        dash_fetching_seasonal: "मौसमी सिफारिशें प्राप्त हो रही हैं...",
        dash_advisor_title: "AI फसल सलाहकार",
        dash_advisor_desc: "मौसम आधारित सलाह के लिए फसल का नाम दर्ज करें.",
        dash_crop_placeholder: "जैसे: रागी, टमाटर, धान, कपास...",
        dash_get_advice: "सलाह प्राप्त करें",
        dash_analyzing_crop: "स्थानीय मौसम के अनुसार फसल का विश्लेषण किया जा रहा है...",
        dash_advisor_empty: "मौसम आधारित कृषि मार्गदर्शन के लिए ऊपर फसल का नाम दर्ज करें.",
        dash_chat_header: "कृषि AI",
        dash_chat_greeting: "नमस्ते! मैं आपका कृषि AI सलाहकार हूँ। मैं आपकी क्या मदद कर सकता हूँ?",
        dash_chat_placeholder: "फसलों, मौसम के बारे में पूछें...",
        dash_loc_detected: "स्थान का पता चला",
        dash_loc_accuracy_approx: "स्थान सटीकता: लगभग",
        dash_loc_use_info: "सटीक मौसम पूर्वानुमान, फसल अलर्ट और नजदीकी मंडी भाव के लिए इस स्थान का उपयोग किया जाएगा।",
        dash_try_again: "पुनः प्रयास करें",
        dash_use_this_loc: "इस स्थान का उपयोग करें",
        dash_sel_loc_manually: "स्थान मैन्युअल रूप से चुनें",
        dash_state_ut: "राज्य / केंद्र शासित प्रदेश *",
        dash_sel_state: "-- राज्य चुनें --",
        dash_district: "जिला *",
        dash_city_town: "शहर / कस्बा / गाँव",
        dash_cancel: "रद्द करें",
        dash_set_loc: "स्थान सेट करें",
        dash_farmer_profile: "किसान प्रोफाइल",
        dash_phone: "फ़ोन",
        dash_location: "स्थान",
        dash_coords: "GPS निर्देशांक",
        dash_app_settings: "किसान सेटिंग्स",
        dash_language: "पसंदीदा भाषा",
        dash_close: "बंद करें",
        dash_agri_status_title: "आज की कृषि स्थिति",
        dash_crop_alerts: "फसल अलर्ट",
        dash_weather_risk: "वर्षा एवं मौसम जोखिम",
        dash_rec_action: "अनुशंसित कार्रवाई",
        dash_mandi_title: "निकटतम मंडियां / बाजार भाव",
        dash_view_marketplace: "मार्केटप्लेस देखें",
        dash_news_title: "नवीनतम कृषि समाचार",
        dash_read_all_news: "सभी समाचार पढ़ें",
        dash_live_modal_price: "लाइव मॉडल भाव",
        dash_stable_demand: "स्थिर मांग",
        dash_msp_active: "सरकारी न्यूनतम समर्थन मूल्य (MSP) सक्रिय",
        dash_high_arrivals: "दैनिक भारी आवक",
        dash_strong_procurement: "मजबूत सरकारी खरीद",
        dash_per_qtl: "/ क्विंटल",
        dash_loading_mandi: "लाइव मंडी भाव लोड हो रहे हैं...",
        dash_no_mandi: "इस स्थान के लिए कोई मंडी भाव उपलब्ध नहीं है।",
        dash_failed_mandi: "बाजार भाव लोड करने में विफल।",
        dash_loading_news: "कृषि समाचार लोड हो रहे हैं...",
        dash_no_news: "इस समय कोई कृषि समाचार उपलब्ध नहीं है।",
        dash_failed_news: "समाचार पूर्वावलोकन लोड नहीं हो सका।",
        dash_today: "आज",
        dash_image_unavailable: "छवि उपलब्ध नहीं है",
        dash_agri_news_source: "कृषि समाचार",

        // Marketplace
        mkt_title_prefix: "भारतीय",
        mkt_title_accent: "कृषि बाज़ार",
        mkt_subtitle: "पूरे भारत में दैनिक मंडी भाव, नजदीकी मंडियां और कृषि लिस्टिंग देखें।",
        mkt_your_location: "आपका स्थान",
        mkt_last_updated: "अंतिम अपडेट",
        mkt_active_mandis: "सक्रिय मंडियां",
        mkt_states_covered: "शामिल राज्य",
        mkt_commodities: "कृषि जिंस / फसलें",
        mkt_latest_price_date: "नवीनतम भाव तिथि",
        mkt_filter_type: "प्रकार",
        mkt_filter_state: "राज्य",
        mkt_filter_district: "जिला",
        mkt_filter_commodity: "फसल/जिंस",
        mkt_filter_search_ph: "मंडी / जिंस खोजें...",
        mkt_filter_apply: "लागू करें",
        mkt_all_types: "सभी प्रकार",
        mkt_all_states: "सभी राज्य",
        mkt_all_districts: "सभी जिले",
        mkt_all_commodities: "सभी फसलें",
        mkt_type_mandi: "मंडी भाव",
        mkt_type_seller: "विक्रेता लिस्टिंग",
        mkt_type_buyer: "खरीदार आवश्यकताएं",
        mkt_loading_prices: "लाइव मंडी भाव लोड हो रहे हैं...",
        mkt_no_data: "इस चयन के लिए कोई मंडी डेटा नहीं मिला।",
        mkt_failed_load: "मंडी भाव लोड करने में विफल।",
        mkt_modal_price: "मॉडल भाव",
        mkt_min_price: "न्यूनतम भाव",
        mkt_max_price: "अधिकतम भाव",
        mkt_arrival_date: "आवक तिथि",
        mkt_market_mandi: "बाज़ार / मंडी",
        mkt_state_district: "राज्य और जिला",
        mkt_trend: "रुझान",
        mkt_actions: "कार्रवाई",
        mkt_compare_prices: "भाव की तुलना करें",
        mkt_view_details: "विवरण देखें",
        mkt_nearby_markets: "नजदीकी मंडियां (GPS गणना)",
        mkt_km_away: "किमी दूर",
        mkt_call_seller: "विक्रेता को कॉल करें",
        mkt_compare_title: "भाव तुलना",
        mkt_compare_desc: "क्षेत्रीय मंडियों में इस जिंस के मॉडल भाव की तुलना करें।",

        // Crop Alerts
        ca_title: "स्मार्ट फसल अलर्ट इंजन",
        ca_subtitle: "मौसम आधारित अलर्ट और कार्रवाई योग्य सलाह प्राप्त करने के लिए अपनी फसल चुनें",
        ca_weather_summary: "वर्तमान मौसम सारांश",
        ca_loading_weather: "मौसम लोड हो रहा है...",
        ca_alerts_title: "फसल अलर्ट",
        ca_analyzing: "फसल स्थितियों का विश्लेषण हो रहा है...",
        ca_forecast_title: "मौसम पूर्वानुमान चार्ट",
        ca_forecast_subtitle: "आपके स्थान के लिए 5-दिवसीय मौसम रुझान",
        ca_temp: "तापमान (°C)",
        ca_humidity: "नमी (%)",
        ca_wind: "हवा की गति (m/s)",
        ca_pressure: "दबाव (hPa)",

        // AlertGuard
        ag_title: "अलर्टगार्ड सेटिंग्स",
        ag_subtitle: "फसल का नाम दर्ज करें → सीमाएं स्वतः समायोजित होंगी। SMS और वॉयस अलर्ट सक्रिय करने के लिए सहेजें।",
        ag_crop_placeholder: "फसल का नाम दर्ज करें (जैसे: टमाटर, धान, रागी, कपास...)",
        ag_temp_help: "तापमान इससे अधिक होने पर अलर्ट करें",
        ag_humidity_help: "नमी इससे अधिक होने पर अलर्ट करें",
        ag_wind_help: "हवा इससे अधिक होने पर अलर्ट करें",
        ag_rain_label: "बारिश अलर्ट",
        ag_heavy_rain: "भारी बारिश अलर्ट",
        ag_rain_help: "भारी बारिश होने पर सूचना दी जाएगी",
        ag_save_btn: "सहेजें और मौसम की जांच करें",

        // Agri-News
        news_title: "किसान समाचार और अपडेट",
        news_subtitle: "नवीनतम कृषि समाचार, सरकारी योजनाओं, मौसम अलर्ट और कृषि तकनीक से अवगत रहें",
        news_cat_all: "सभी समाचार",
        news_cat_crops: "फसलें और मंडी",
        news_cat_weather: "मौसम",
        news_cat_schemes: "सरकारी योजनाएं",
        news_cat_tech: "कृषि तकनीक",
        news_loading: "समाचार लोड हो रहे हैं...",
        news_read_more: "पूरा लेख पढ़ें",
        news_no_news: "इस श्रेणी के लिए कोई समाचार नहीं मिला।",
        news_failed: "समाचार लोड करने में विफल।",

        // Common
        common_loading: "लोड हो रहा है...",
        common_error: "त्रुटि",
        common_success: "सफल",
        common_save: "सहेजें",
        common_cancel: "रद्द करें",
        common_close: "बंद करें"
    }
};

/**
 * Get current application language (Single Source of Truth)
 */
function getAppLanguage() {
    const saved = localStorage.getItem('krishiLang');
    if (saved && SUPPORTED_LANGUAGES.includes(saved)) {
        return saved;
    }
    return 'en';
}

/**
 * Commodity name translation dictionary for Indian agricultural produce
 */
const COMMODITY_TRANSLATIONS = {
    'paddy': {
        en: 'Paddy (Rice)',
        kn: 'ಭತ್ತ (Paddy)',
        te: 'వరి / ధాన్యం (Paddy)',
        ta: 'நெல் (Paddy)',
        ml: 'നെല്ല് (Paddy)',
        hi: 'धान / चावल (Paddy)'
    },
    'rice': {
        en: 'Rice',
        kn: 'ಅಕ್ಕಿ',
        te: 'బియ్యం',
        ta: 'அரிசி',
        ml: 'അരി',
        hi: 'चावल'
    },
    'ragi': {
        en: 'Ragi (Finger Millet)',
        kn: 'ರಾಗಿ (Ragi)',
        te: 'రాగులు (Ragi)',
        ta: 'கேழ்வரகு / ராகி (Ragi)',
        ml: 'റാഗി (Ragi)',
        hi: 'रागी / मडुआ (Ragi)'
    },
    'tomato': {
        en: 'Tomato',
        kn: 'ಟೊಮೆಟೊ',
        te: 'టమోటా',
        ta: 'தக்காளி',
        ml: 'തക്കാളി',
        hi: 'टमाटर'
    },
    'wheat': {
        en: 'Wheat',
        kn: 'ಗೋಧಿ',
        te: 'గోధుమలు',
        ta: 'கோதுமை',
        ml: 'ഗോതമ്പ്',
        hi: 'गेहूं'
    },
    'onion': {
        en: 'Onion',
        kn: 'ಈರುಳ್ಳಿ',
        te: 'ఉల్లిపాయ',
        ta: 'வெங்காயம்',
        ml: 'സവാള / ഉള്ളി',
        hi: 'प्याज'
    },
    'potato': {
        en: 'Potato',
        kn: 'ಆಲೂಗಡ್ಡೆ',
        te: 'బంగాళాదుంప',
        ta: 'உருளைக்கிழங்கு',
        ml: 'ഉരുളക്കിഴങ്ങ്',
        hi: 'आलू'
    },
    'soybean': {
        en: 'Soybean',
        kn: 'ಸೋಯಾಬೀನ್',
        te: 'సోయాబీన్',
        ta: 'சோயாபீன்',
        ml: 'സോയാബീൻ',
        hi: 'सोयाबीन'
    },
    'cotton': {
        en: 'Cotton',
        kn: 'ಹತ್ತಿ',
        te: 'పత్తి',
        ta: 'பருத்தி',
        ml: 'പരുത്തി',
        hi: 'कपास'
    },
    'sugarcane': {
        en: 'Sugarcane',
        kn: 'ಕಬ್ಬು',
        te: 'చెరకు',
        ta: 'கரும்பு',
        ml: 'കരിമ്പ്',
        hi: 'गन्ना'
    },
    'maize': {
        en: 'Maize (Corn)',
        kn: 'ಮೆಕ್ಕೆಜೋಳ',
        te: 'మొక్కజొన్న',
        ta: 'மக்காச்சோளம்',
        ml: 'മക്കച്ചോളം',
        hi: 'मक्का'
    },
    'groundnut': {
        en: 'Groundnut (Peanut)',
        kn: 'ಕಡಲೆಕಾಯಿ',
        te: 'వేరుశనగ',
        ta: 'நிலக்கடலை',
        ml: 'നിലക്കടല',
        hi: 'मूंगफली'
    },
    'chilli': {
        en: 'Chilli',
        kn: 'ಮೆಣಸಿನಕಾಯಿ',
        te: 'మిరపకాయ',
        ta: 'மிளகாய்',
        ml: 'പച്ചമുളക്',
        hi: 'मिर्च'
    },
    'garlic': {
        en: 'Garlic',
        kn: 'ಬೆಳ್ಳುಳ್ಳಿ',
        te: 'వెల్లుల్లి',
        ta: 'பூண்டு',
        ml: 'വെളുത്തുള്ളി',
        hi: 'लहसुन'
    },
    'ginger': {
        en: 'Ginger',
        kn: 'ಶುಂಠಿ',
        te: 'అల్లం',
        ta: 'இஞ்சி',
        ml: 'ഇഞ്ചി',
        hi: 'अदरक'
    },
    'turmeric': {
        en: 'Turmeric',
        kn: 'ಅರಿಶಿನ',
        te: 'పసుపు',
        ta: 'மஞ்சள்',
        ml: 'മഞ്ഞൾ',
        hi: 'हल्दी'
    },
    'coconut': {
        en: 'Coconut',
        kn: 'ತೆಂಗಿನಕಾಯಿ',
        te: 'కొబ్బరికాయ',
        ta: 'தேங்காய்',
        ml: 'തേങ്ങ',
        hi: 'नारियल'
    },
    'jowar': {
        en: 'Jowar (Sorghum)',
        kn: 'ಜೋಳ',
        te: 'జొన్నలు',
        ta: 'சோளம்',
        ml: 'ചോളം',
        hi: 'ज्वार'
    },
    'bajra': {
        en: 'Bajra (Pearl Millet)',
        kn: 'ಸಜ್ಜೆ',
        te: 'ಸజ్జలు',
        ta: 'கம்பு',
        ml: 'കമ്പ്',
        hi: 'बाजरा'
    },
    'gram': {
        en: 'Bengal Gram (Chana)',
        kn: 'ಕಡಲೆ',
        te: 'శనగలు',
        ta: 'கொண்டைக்கடலை',
        ml: 'കടല',
        hi: 'चना'
    },
    'mustard': {
        en: 'Mustard',
        kn: 'ಸಾಸಿವೆ',
        te: 'ఆవాలు',
        ta: 'கடுகு',
        ml: 'കടുക്',
        hi: 'सरसों'
    },
    'arecanut': {
        en: 'Arecanut (Supari)',
        kn: 'ಅಡಿಕೆ',
        te: 'పోకచెక్క / పోకవక్కలు',
        ta: 'பாக்கு',
        ml: 'അടയ്ക്ക',
        hi: 'सुपारी'
    },
    'betelnut': {
        en: 'Arecanut (Supari)',
        kn: 'ಅಡಿಕೆ',
        te: 'పోకచెక్క / పోకవక్కలు',
        ta: 'பாக்கு',
        ml: 'അടയ്ക്ക',
        hi: 'सुपारी'
    },
    'supari': {
        en: 'Arecanut (Supari)',
        kn: 'ಅಡಿಕೆ',
        te: 'పోకచెక్క / పోకవక్కలు',
        ta: 'பாக்கு',
        ml: 'അടയ്ക്ക',
        hi: 'सुपारी'
    }
};

function translateCommodityName(commodity, lang) {
    if (!commodity || typeof commodity !== 'string') return '';
    const activeLang = lang || (typeof getAppLanguage === 'function' ? getAppLanguage() : 'en');
    if (activeLang === 'en') return commodity;

    const lower = commodity.toLowerCase().trim();
    for (const key of Object.keys(COMMODITY_TRANSLATIONS)) {
        if (lower.includes(key)) {
            const entry = COMMODITY_TRANSLATIONS[key];
            if (entry && entry[activeLang]) {
                return entry[activeLang];
            }
        }
    }
    return commodity;
}

/**
 * Translation helper for JS strings
 */
function t(key, fallback = '') {
    const lang = getAppLanguage();
    const dict = I18N_DICT[lang] || I18N_DICT['en'];
    if (dict && dict[key] !== undefined) {
        return dict[key];
    }
    const enDict = I18N_DICT['en'];
    if (enDict && enDict[key] !== undefined) {
        return enDict[key];
    }
    return fallback || key;
}

/**
 * Set application language globally, update state, and refresh all UI elements
 */
window.t = t;
window.I18N_DICT = I18N_DICT;
window.getAppLanguage = getAppLanguage;
window.setAppLanguage = setAppLanguage;

function setAppLanguage(lang) {
    if (!SUPPORTED_LANGUAGES.includes(lang)) lang = 'en';
    localStorage.setItem('krishiLang', lang);
    document.documentElement.setAttribute('lang', lang);

    // Sync all language dropdowns on page
    document.querySelectorAll('.nav-lang-select, #langSelect, #settingsLangSelect').forEach(el => {
        if (el.value !== lang) el.value = lang;
    });

    // Apply translations across DOM
    applyAllTranslations(lang);

    // Notify any page-specific listeners
    window.dispatchEvent(new CustomEvent('krishi:languageChanged', { detail: { language: lang } }));

    // Non-blocking background sync to PostgreSQL if farmer is authenticated
    const authToken = localStorage.getItem('token');
    if (authToken) {
        fetch('/api/notifications/language', {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ language: lang })
        }).catch(() => {});
    }
}

/**
 * Applies translations to all standard elements across any page
 */
function applyAllTranslations(lang) {
    if (!lang) lang = getAppLanguage();
    document.documentElement.setAttribute('lang', lang);
    const dict = I18N_DICT[lang] || I18N_DICT['en'];

    // 1. Synchronize all select elements
    document.querySelectorAll('.nav-lang-select, #langSelect, #settingsLangSelect').forEach(el => {
        if (el.value !== lang) el.value = lang;
    });

    // 2. Elements with data-i18n attributes
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (dict[key]) {
            el.innerText = dict[key];
        }
    });

    // 3. Elements with data-i18n-placeholder attributes
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (dict[key]) {
            el.setAttribute('placeholder', dict[key]);
        }
    });

    // 4. Elements with data-i18n-title attributes
    document.querySelectorAll('[data-i18n-title]').forEach(el => {
        const key = el.getAttribute('data-i18n-title');
        if (dict[key]) {
            el.setAttribute('title', dict[key]);
        }
    });

    // 5. Universal Navigation Tabs translation
    const navTabMap = [
        { href: 'dashboard.html', key: 'nav_dashboard' },
        { href: 'marketplace.html', key: 'nav_marketplace' },
        { href: 'crop-alerts.html', key: 'nav_crop_alerts' },
        { href: 'alert-guard.html', key: 'nav_alert_guard' },
        { href: 'news.html', key: 'nav_agri_news' }
    ];

    document.querySelectorAll('.header-nav-center .nav-tab, .mobile-nav-drawer .mobile-drawer-link').forEach(link => {
        const href = link.getAttribute('href');
        const match = navTabMap.find(item => href && href.includes(item.href));
        if (match && dict[match.key]) {
            const span = link.querySelector('span');
            if (span) span.innerText = dict[match.key];
        }
    });

    // 6. Universal Profile Dropdown Menu items
    document.querySelectorAll('.nav-profile-popover').forEach(popover => {
        const items = popover.querySelectorAll('.popover-item');
        items.forEach(item => {
            const span = item.querySelector('span');
            if (!span) return;
            const text = span.innerText.trim().toLowerCase();
            if (text === 'profile' || span.dataset.navKey === 'profile') {
                span.dataset.navKey = 'profile';
                span.innerText = dict.nav_profile;
            } else if (text === 'notifications' || span.dataset.navKey === 'notifications') {
                span.dataset.navKey = 'notifications';
                span.innerText = dict.nav_notifications;
            } else if (text === 'settings' || span.dataset.navKey === 'settings') {
                span.dataset.navKey = 'settings';
                span.innerText = dict.nav_settings;
            } else if (text === 'logout' || span.dataset.navKey === 'logout') {
                span.dataset.navKey = 'logout';
                span.innerText = dict.nav_logout;
            }
        });

        const appearanceLabel = popover.querySelector('.popover-theme-label span');
        if (appearanceLabel) appearanceLabel.innerText = dict.nav_appearance;
    });

    // 7. Profile button text in navbar
    const profileBtn = document.getElementById('profileDropdownBtn');
    if (profileBtn) {
        const span = profileBtn.querySelector('span');
        if (span) span.innerText = dict.nav_profile;
    }

    // 8. Universal Weather stats labels if present on page
    const statMap = {
        'statHumidity': 'dash_humidity',
        'statWind': 'dash_wind',
        'statPressure': 'dash_pressure',
        'statVisibility': 'dash_visibility',
        'statFeelsLike': 'dash_feels_like'
    };
    Object.keys(statMap).forEach(id => {
        const statEl = document.getElementById(id);
        if (statEl && statEl.nextElementSibling && statEl.nextElementSibling.classList.contains('stat-label')) {
            statEl.nextElementSibling.innerText = dict[statMap[id]];
        }
    });
}

// Universal Appearance / Theme Management
function setAppTheme(themeVal) {
    let activeTheme = themeVal;
    if (themeVal === 'system') {
        activeTheme = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    }
    document.documentElement.setAttribute('data-theme', activeTheme);
    localStorage.setItem('theme', themeVal);
    updateThemePills(themeVal);
    updateThemeIcon(activeTheme);
}

function updateThemePills(current) {
    document.querySelectorAll('.theme-pill').forEach(pill => {
        pill.classList.toggle('active', pill.dataset.themeVal === current);
    });
}

function updateThemeIcon(theme) {
    const btn = document.getElementById('themeToggle');
    if (!btn) return;
    const icon = btn.querySelector('i');
    if (!icon) return;
    if (theme === 'light') {
        icon.className = 'fas fa-sun';
    } else {
        icon.className = 'fas fa-moon';
    }
}

// Initial Theme Setup (Default to clean white background SaaS theme)
const currentSavedTheme = localStorage.getItem('theme') || 'light';
setAppTheme(currentSavedTheme);

// DOM Initialization on Page Load
document.addEventListener('DOMContentLoaded', () => {
    // 1. Initial Language Sync & Event Listeners
    const initialLang = getAppLanguage();
    applyAllTranslations(initialLang);

    document.querySelectorAll('.nav-lang-select, #langSelect').forEach(select => {
        select.value = initialLang;
        select.addEventListener('change', (e) => {
            setAppLanguage(e.target.value);
        });
    });

    // 2. Sync Farmer Profile in Top Header on All Pages
    try {
        const storedFarmer = JSON.parse(localStorage.getItem('farmer') || '{}');
        const farmerName = storedFarmer.name || storedFarmer.fullName || 'Farmer';
        const navNameEl = document.getElementById('navProfileName');
        if (navNameEl) navNameEl.innerText = farmerName;
        const popoverNameEl = document.getElementById('popoverUserName');
        if (popoverNameEl) popoverNameEl.innerText = farmerName;
        const popoverAvatarEl = document.getElementById('popoverAvatar');
        if (popoverAvatarEl) {
            popoverAvatarEl.innerText = farmerName.trim().charAt(0).toUpperCase() || 'F';
        }
    } catch(e) {}

    // 3. Profile Dropdown & Mobile Drawer Toggle Logic
    const profileDropdownBtn = document.getElementById('profileDropdownBtn');
    const navProfileDropdown = document.getElementById('navProfileDropdown');
    const mobileNavToggle = document.getElementById('mobileNavToggle');
    const mobileNavDrawer = document.getElementById('mobileNavDrawer');

    if (profileDropdownBtn && navProfileDropdown) {
        profileDropdownBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = navProfileDropdown.classList.toggle('show');
            profileDropdownBtn.classList.toggle('active', isOpen);
            profileDropdownBtn.setAttribute('aria-expanded', isOpen);
        });

        document.addEventListener('click', (e) => {
            if (!e.target.closest('.nav-profile-container') && !e.target.closest('.profile-dropdown-container')) {
                navProfileDropdown.classList.remove('show');
                profileDropdownBtn.classList.remove('active');
                profileDropdownBtn.setAttribute('aria-expanded', 'false');
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                navProfileDropdown.classList.remove('show');
                profileDropdownBtn.classList.remove('active');
                profileDropdownBtn.setAttribute('aria-expanded', 'false');
                // Close farmer modals if they exist (dashboard page)
                if (typeof closeFarmerProfileModal === 'function') closeFarmerProfileModal();
                if (typeof closeFarmerSettingsModal === 'function') closeFarmerSettingsModal();
            }
        });
    }

    if (mobileNavToggle && mobileNavDrawer) {
        window.closeMobileDrawer = function() {
            mobileNavDrawer.classList.remove('open');
            const backdrop = document.getElementById('mobileNavBackdrop');
            if (backdrop) backdrop.classList.remove('open');
            if (mobileNavToggle) {
                mobileNavToggle.setAttribute('aria-expanded', 'false');
                const icon = mobileNavToggle.querySelector('i');
                if (icon) icon.className = 'fas fa-bars';
            }
        };

        window.openMobileDrawer = function() {
            mobileNavDrawer.classList.add('open');
            let backdrop = document.getElementById('mobileNavBackdrop');
            if (!backdrop) {
                backdrop = document.createElement('div');
                backdrop.id = 'mobileNavBackdrop';
                backdrop.className = 'mobile-nav-backdrop';
                backdrop.onclick = window.closeMobileDrawer;
                document.body.appendChild(backdrop);
            }
            backdrop.classList.add('open');
            if (mobileNavToggle) {
                mobileNavToggle.setAttribute('aria-expanded', 'true');
                const icon = mobileNavToggle.querySelector('i');
                if (icon) icon.className = 'fas fa-xmark';
            }
        };

        mobileNavToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            if (mobileNavDrawer.classList.contains('open')) {
                window.closeMobileDrawer();
            } else {
                window.openMobileDrawer();
            }
        });

        document.addEventListener('click', (e) => {
            if (!e.target.closest('.mobile-nav-drawer') && !e.target.closest('#mobileNavToggle')) {
                if (typeof window.closeMobileDrawer === 'function') {
                    window.closeMobileDrawer();
                }
            }
        });
    }

    const legacyThemeBtn = document.getElementById('themeToggle');
    if (legacyThemeBtn) {
        legacyThemeBtn.addEventListener('click', () => {
            let theme = document.documentElement.getAttribute('data-theme');
            let newTheme = theme === 'dark' ? 'light' : 'dark';
            setAppTheme(newTheme);
        });
    }
});

// Check Authentication
function isAuthenticated() {
    return !!localStorage.getItem('token');
}

function getAuthHeader() {
    return {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
    };
}

function logout(e) {
    if (e && typeof e.preventDefault === 'function') e.preventDefault();
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = 'index.html';
}

function getInitials(name) {
    if (!name) return 'F';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

// Attach logout handler if present
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        logout();
    });
}

// -------------------------------------------------------------
// Farmer Presence & Activity Heartbeat
// Automatically keeps user last_seen_at updated while active
// -------------------------------------------------------------
function sendFarmerHeartbeat() {
    const token = localStorage.getItem('token');
    if (!token || window.location.pathname.includes('admin')) return;

    fetch(`${API_BASE_URL}/auth/heartbeat`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    }).catch(() => {
        // Silently catch network errors during heartbeat
    });
}

if (isAuthenticated() && !window.location.pathname.includes('admin')) {
    // Send immediate heartbeat on load
    sendFarmerHeartbeat();
    // Send periodic heartbeat every 60 seconds
    setInterval(sendFarmerHeartbeat, 60000);
}


/* =============================================================
   GLOBAL FARMER PROFILE & SETTINGS SYSTEM (KRISHI VAANI)
============================================================= */

// Helper to get initials
function getFarmerInitials(name) {
    if (!name) return 'F';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

// Helper to get safe profile image URL
function getSafeProfileImageUrl(img) {
    if (!img || typeof img !== 'string') return null;
    const trimmed = img.trim();
    if (!trimmed || trimmed === 'null' || trimmed === 'undefined' || trimmed.includes('default-avatar')) return null;
    if (trimmed.startsWith('data:image') || trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('/') || trimmed.startsWith('assets/')) {
        return trimmed;
    }
    return '/uploads/profiles/' + trimmed;
}

// Sync user profile name, avatar, and localized UI labels
function syncUserProfileDisplay() {
    try {
        let farmer = {};
        try {
            farmer = JSON.parse(localStorage.getItem('farmer') || '{}');
        } catch(e) { farmer = {}; }

        const rawName = farmer.name || farmer.fullName || farmer.farmerName || 'Farmer';
        const fullName = rawName.trim();
        const firstName = fullName.split(' ')[0] || 'Farmer';
        const initials = getFarmerInitials(fullName);
        const profileImgUrl = getSafeProfileImageUrl(farmer.profileImage);

        const phone = farmer.phone || farmer.mobile || farmer.phoneNumber;
        const formattedPhone = phone ? (String(phone).startsWith('+91') ? String(phone) : '+91 ' + String(phone).replace(/^0+/, '')) : 'Not available';

        const lang = getAppLanguage();
        const dict = (typeof I18N_DICT !== 'undefined' && I18N_DICT[lang]) ? I18N_DICT[lang] : (typeof I18N_DICT !== 'undefined' ? I18N_DICT['en'] : {});

        // 1. Navbar Profile Name
        document.querySelectorAll('#navProfileName, .nav-profile-name').forEach(el => {
            el.innerText = firstName;
        });

        // 2. Navbar Avatar Chip
        const navAvatarChip = document.getElementById('navProfileAvatarChip');
        if (navAvatarChip) {
            navAvatarChip.innerHTML = '';
            if (profileImgUrl) {
                const img = document.createElement('img');
                img.src = profileImgUrl;
                img.alt = fullName;
                img.className = 'nav-avatar-img';
                img.style.width = '22px';
                img.style.height = '22px';
                img.style.borderRadius = '50%';
                img.style.objectFit = 'cover';
                img.onerror = function() {
                    navAvatarChip.innerHTML = '<i class="fas fa-circle-user nav-profile-icon"></i>';
                };
                navAvatarChip.appendChild(img);
            } else {
                navAvatarChip.innerHTML = '<i class="fas fa-circle-user nav-profile-icon"></i>';
            }
        }

        // 3. Popover Dropdown Header & Items
        const popoverName = document.getElementById('popoverUserName');
        if (popoverName) popoverName.innerText = fullName;

        const popoverSub = document.querySelector('.popover-user-sub span');
        if (popoverSub && dict.profile_my_profile) popoverSub.innerText = dict.profile_my_profile;

        const popoverAvatar = document.getElementById('popoverAvatar');
        
    const mDrawerName = document.getElementById('mobileDrawerUserName');
    if (mDrawerName) mDrawerName.innerText = farmer.name || 'Farmer';
    const mDrawerAvatar = document.getElementById('mobileDrawerAvatar');
    if (mDrawerAvatar) {
        if (farmer.profileImage) {
            mDrawerAvatar.innerHTML = `<img src="${farmer.profileImage}" alt="Profile" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">`;
        } else {
            mDrawerAvatar.innerText = initials;
        }
    }
    if (popoverAvatar) {
            popoverAvatar.innerHTML = '';
            if (profileImgUrl) {
                const img = document.createElement('img');
                img.src = profileImgUrl;
                img.alt = fullName;
                img.className = 'popover-avatar-img';
                img.onerror = function() {
                    popoverAvatar.innerText = initials;
                };
                popoverAvatar.appendChild(img);
            } else {
                popoverAvatar.innerText = initials;
            }
        }

        // 4. Modal Profile Elements & Translations
        const modalName = document.getElementById('modalProfileName');
        if (modalName) modalName.innerText = fullName;

        const modalFullName = document.getElementById('modalProfileFullName');
        if (modalFullName) modalFullName.innerText = fullName;

        const modalPhone = document.getElementById('modalProfilePhone');
        if (modalPhone) modalPhone.innerText = formattedPhone;

        const langNames = { en: 'English', kn: 'ಕನ್ನಡ (Kannada)', ta: 'தமிழ் (Tamil)', te: 'తెలుగు (Telugu)', ml: 'മലയാളം (Malayalam)', hi: 'हिन्दी (Hindi)' };
        const modalLang = document.getElementById('modalProfileLang');
        if (modalLang) modalLang.innerText = langNames[lang] || 'English';

        const modalAvatar = document.getElementById('modalAvatarDisplay');
        if (modalAvatar) {
            modalAvatar.innerHTML = '';
            if (profileImgUrl) {
                const img = document.createElement('img');
                img.src = profileImgUrl;
                img.alt = fullName;
                img.className = 'modal-avatar-img';
                img.onerror = function() {
                    modalAvatar.innerHTML = `${initials}<span class="profile-avatar-badge" title="Change Photo"><i class="fas fa-camera"></i></span>`;
                };
                const badge = document.createElement('span');
                badge.className = 'profile-avatar-badge';
                badge.title = 'Change Photo';
                badge.innerHTML = '<i class="fas fa-camera"></i>';
                modalAvatar.appendChild(img);
                modalAvatar.appendChild(badge);
            } else {
                modalAvatar.innerHTML = `${initials}<span class="profile-avatar-badge" title="Change Photo"><i class="fas fa-camera"></i></span>`;
            }
        }

        // Apply data-i18n inside modals & popovers
        document.querySelectorAll('#farmerProfileModal [data-i18n], #changePasswordModal [data-i18n], .nav-profile-popover [data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (dict[key]) el.innerText = dict[key];
        });

        document.querySelectorAll('#changePasswordModal [data-i18n-placeholder]').forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            if (dict[key]) el.setAttribute('placeholder', dict[key]);
        });

    } catch(err) {
        console.warn('[ProfileSync] Error syncing profile display:', err);
    }
}

// Global photo upload handler
async function handleGlobalProfilePhotoUpload(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
        alert('Image must be less than 5MB');
        return;
    }

    let farmer = {};
    try {
        farmer = JSON.parse(localStorage.getItem('farmer') || '{}');
    } catch(err) { farmer = {}; }

    // 1. Immediate local Preview via Base64 FileReader (0ms latency UI update)
    const reader = new FileReader();
    reader.onload = function(evt) {
        const base64Data = evt.target.result;
        farmer.profileImage = base64Data;
        localStorage.setItem('farmer', JSON.stringify(farmer));
        syncUserProfileDisplay();
    };
    reader.readAsDataURL(file);

    // 2. Persist to server if farmer ID is available
    const farmerId = farmer.id || farmer._id;
    if (farmerId) {
        const formData = new FormData();
        formData.append('profileImage', file);

        const endpoints = [
            `/api/profile/upload/${farmerId}`,
            `/profile/upload/${farmerId}`,
            `/api/farmer/profile/upload/${farmerId}`
        ];

        for (const ep of endpoints) {
            try {
                const res = await fetch(ep, {
                    method: 'POST',
                    body: formData
                });
                if (res.ok) {
                    const data = await res.json();
                    if (data.success && data.profileImage) {
                        farmer.profileImage = data.profileImage;
                        localStorage.setItem('farmer', JSON.stringify(farmer));
                        syncUserProfileDisplay();
                        break;
                    }
                }
            } catch(err) {}
        }
    }
}

// Ensure Farmer Profile Modal, Change Password Modal, and Hidden Upload Input exist in DOM
function ensureFarmerModalsInDOM() {
    // 1. Farmer Profile Modal
    if (!document.getElementById('farmerProfileModal')) {
        const modalDiv = document.createElement('div');
        modalDiv.className = 'profile-modal-backdrop';
        modalDiv.id = 'farmerProfileModal';
        modalDiv.innerHTML = `
            <div class="profile-modal-card" role="dialog" aria-labelledby="modalProfileName" aria-modal="true">
                <!-- Modal Header -->
                <div class="profile-modal-header">
                    <div class="profile-header-user">
                        <div class="profile-avatar-wrap" id="modalAvatarDisplay" title="Change Profile Photo" onclick="document.getElementById('profileUploadInputGlobal')?.click()">
                            F
                            <span class="profile-avatar-badge" title="Upload Photo"><i class="fas fa-camera"></i></span>
                        </div>
                        <div class="profile-header-meta">
                            <h3 class="profile-header-name" id="modalProfileName">Farmer</h3>
                            <div class="profile-verified-badge"><i class="fas fa-circle-check"></i> <span data-i18n="profile_verified">Verified Krishi Vaani Account</span></div>
                        </div>
                    </div>
                    <button type="button" class="profile-modal-close" onclick="closeFarmerProfileModal()" aria-label="Close modal">&times;</button>
                </div>

                <!-- Modal Body -->
                <div class="profile-modal-body">
                    <!-- Section 1: Personal Information -->
                    <div class="profile-section">
                        <div class="profile-section-title">
                            <i class="fas fa-user"></i>
                            <span data-i18n="profile_personal_info">Personal Information</span>
                        </div>
                        <div class="profile-info-grid">
                            <div class="profile-info-card">
                                <div class="profile-info-icon"><i class="fas fa-id-card"></i></div>
                                <div class="profile-info-content">
                                    <span class="profile-info-label" data-i18n="profile_full_name">Full Name</span>
                                    <strong class="profile-info-val" id="modalProfileFullName">Farmer</strong>
                                </div>
                            </div>
                            <div class="profile-info-card">
                                <div class="profile-info-icon"><i class="fas fa-phone"></i></div>
                                <div class="profile-info-content">
                                    <span class="profile-info-label" data-i18n="profile_mobile_number">Mobile Number</span>
                                    <strong class="profile-info-val" id="modalProfilePhone">Not available</strong>
                                </div>
                            </div>
                            <div class="profile-info-card">
                                <div class="profile-info-icon"><i class="fas fa-language"></i></div>
                                <div class="profile-info-content">
                                    <span class="profile-info-label" data-i18n="profile_pref_language">Preferred Language</span>
                                    <strong class="profile-info-val" id="modalProfileLang">English</strong>
                                </div>
                            </div>
                            <div class="profile-info-card">
                                <div class="profile-info-icon"><i class="fas fa-shield-halved"></i></div>
                                <div class="profile-info-content">
                                    <span class="profile-info-label" data-i18n="profile_account_status">Account Status</span>
                                    <strong class="profile-info-val" style="color: #4ade80;" data-i18n="profile_status_active">Active & Protected</strong>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Section 2: Farm Location -->
                    <div class="profile-section">
                        <div class="profile-section-title">
                            <i class="fas fa-location-dot"></i>
                            <span data-i18n="profile_farm_location">Farm Location</span>
                        </div>
                        <div class="profile-info-grid">
                            <div class="profile-info-card">
                                <div class="profile-info-icon"><i class="fas fa-map-pin"></i></div>
                                <div class="profile-info-content">
                                    <span class="profile-info-label" data-i18n="profile_location">Location</span>
                                    <strong class="profile-info-val" id="modalProfileLocation">Manipal, Karnataka</strong>
                                </div>
                            </div>
                            <div class="profile-info-card">
                                <div class="profile-info-icon"><i class="fas fa-crosshairs"></i></div>
                                <div class="profile-info-content">
                                    <span class="profile-info-label" data-i18n="profile_gps_coords">GPS Coordinates</span>
                                    <strong class="profile-info-val" id="modalProfileCoords">13.3478, 74.7944</strong>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Section 3: Account & Security -->
                    <div class="profile-section">
                        <div class="profile-section-title">
                            <i class="fas fa-lock"></i>
                            <span data-i18n="profile_account_security">Account & Security</span>
                        </div>
                        <div class="profile-info-grid">
                            <div class="profile-info-card" style="justify-content: space-between;">
                                <div style="display: flex; align-items: center; gap: 0.75rem; min-width: 0;">
                                    <div class="profile-info-icon"><i class="fas fa-key"></i></div>
                                    <div class="profile-info-content">
                                        <span class="profile-info-label" data-i18n="profile_password">Password</span>
                                        <strong class="profile-info-val">••••••••</strong>
                                    </div>
                                </div>
                                <button type="button" class="btn-profile-change-pw" onclick="openChangePasswordModal()" title="Change Account Password">
                                    <i class="fas fa-pen-to-square"></i> <span data-i18n="profile_change_password">Change Password</span>
                                </button>
                            </div>
                            <div class="profile-info-card">
                                <div class="profile-info-icon"><i class="fas fa-calendar-check"></i></div>
                                <div class="profile-info-content">
                                    <span class="profile-info-label" data-i18n="profile_security_tier">Security Tier</span>
                                    <strong class="profile-info-val" data-i18n="profile_sec_verified">OTP / PIN Verified</strong>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Modal Footer -->
                <div class="profile-modal-footer">
                    <button type="button" class="btn-profile-secondary" onclick="document.getElementById('profileUploadInputGlobal')?.click()">
                        <i class="fas fa-camera"></i> <span data-i18n="profile_change_photo">Change Photo</span>
                    </button>
                    <button type="button" class="btn-profile-primary" onclick="closeFarmerProfileModal()">
                        <i class="fas fa-check"></i> <span data-i18n="profile_close">Close</span>
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modalDiv);
    }

    // 2. Change Password Modal
    if (!document.getElementById('changePasswordModal')) {
        const cpDiv = document.createElement('div');
        cpDiv.className = 'profile-modal-backdrop';
        cpDiv.id = 'changePasswordModal';
        cpDiv.innerHTML = `
            <div class="profile-modal-card cp-modal-card" role="dialog" aria-labelledby="cpModalTitle" aria-modal="true">
                <div class="profile-modal-header">
                    <div class="profile-header-user">
                        <div class="profile-info-icon" style="width: 40px; height: 40px; font-size: 1.1rem;"><i class="fas fa-key"></i></div>
                        <div>
                            <h3 class="profile-header-name" id="cpModalTitle" data-i18n="cp_title">Change Password</h3>
                            <p style="margin: 2px 0 0 0; font-size: 0.78rem; color: #94a3b8;" data-i18n="cp_subtitle">Update your account password securely</p>
                        </div>
                    </div>
                    <button type="button" class="profile-modal-close" onclick="closeChangePasswordModal()" aria-label="Close modal">&times;</button>
                </div>

                <div class="profile-modal-body">
                    <!-- Status / Feedback Message -->
                    <div id="cpStatusAlert" class="cp-alert-box" style="display: none;"></div>

                    <form id="changePasswordForm" onsubmit="submitChangePassword(event)" autocomplete="off">
                        <!-- Current Password -->
                        <div class="cp-input-group">
                            <label class="cp-label" for="cpCurrentPw" data-i18n="cp_current_pw">Current Password</label>
                            <div class="cp-password-wrap">
                                <input type="password" id="cpCurrentPw" class="cp-input" data-i18n-placeholder="cp_current_ph" placeholder="Enter your current password" required autocomplete="current-password">
                                <button type="button" class="cp-eye-btn" onclick="togglePasswordVisibility('cpCurrentPw', this)" title="Show/Hide Password" aria-label="Toggle password visibility">
                                    <i class="fas fa-eye"></i>
                                </button>
                            </div>
                        </div>

                        <!-- New Password -->
                        <div class="cp-input-group">
                            <label class="cp-label" for="cpNewPw" data-i18n="cp_new_pw">New Password</label>
                            <div class="cp-password-wrap">
                                <input type="password" id="cpNewPw" class="cp-input" data-i18n-placeholder="cp_new_ph" placeholder="Enter new password (min. 6 characters)" required minlength="6" autocomplete="new-password">
                                <button type="button" class="cp-eye-btn" onclick="togglePasswordVisibility('cpNewPw', this)" title="Show/Hide Password" aria-label="Toggle password visibility">
                                    <i class="fas fa-eye"></i>
                                </button>
                            </div>
                        </div>

                        <!-- Confirm New Password -->
                        <div class="cp-input-group">
                            <label class="cp-label" for="cpConfirmPw" data-i18n="cp_confirm_pw">Confirm New Password</label>
                            <div class="cp-password-wrap">
                                <input type="password" id="cpConfirmPw" class="cp-input" data-i18n-placeholder="cp_confirm_ph" placeholder="Re-enter new password" required minlength="6" autocomplete="new-password">
                                <button type="button" class="cp-eye-btn" onclick="togglePasswordVisibility('cpConfirmPw', this)" title="Show/Hide Password" aria-label="Toggle password visibility">
                                    <i class="fas fa-eye"></i>
                                </button>
                            </div>
                        </div>

                        <div class="profile-modal-footer" style="padding: 1rem 0 0 0; margin-top: 1rem; border-top: 1px solid #2E404B;">
                            <button type="button" class="btn-profile-secondary" onclick="closeChangePasswordModal()" data-i18n="cp_btn_cancel">Cancel</button>
                            <button type="submit" id="btnSubmitChangePw" class="btn-profile-primary">
                                <i class="fas fa-shield-halved"></i> <span data-i18n="cp_btn_update">Update Password</span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        document.body.appendChild(cpDiv);
    }

    // 3. Hidden File Upload Input
    if (!document.getElementById('profileUploadInputGlobal')) {
        const fileInp = document.createElement('input');
        fileInp.type = 'file';
        fileInp.id = 'profileUploadInputGlobal';
        fileInp.accept = 'image/*';
        fileInp.style.display = 'none';
        fileInp.addEventListener('change', handleGlobalProfilePhotoUpload);
        document.body.appendChild(fileInp);
    }
}

// Toggle password visibility helper
window.togglePasswordVisibility = function(inputId, btn) {
    const input = document.getElementById(inputId);
    if (!input) return;
    const isPassword = input.type === 'password';
    input.type = isPassword ? 'text' : 'password';
    const icon = btn.querySelector('i');
    if (icon) {
        icon.className = isPassword ? 'fas fa-eye-slash' : 'fas fa-eye';
    }
};

// Open Farmer Profile Modal
window.openFarmerProfileModal = function(e) {
    if (e && typeof e.preventDefault === 'function') e.preventDefault();
    
    // Close dropdown menu
    const dd = document.getElementById('navProfileDropdown');
    const btn = document.getElementById('profileDropdownBtn');
    if (dd) dd.classList.remove('show');
    if (btn) btn.classList.remove('active');

    ensureFarmerModalsInDOM();

    let farmer = {};
    try {
        farmer = JSON.parse(localStorage.getItem('farmer') || '{}');
    } catch(err) { farmer = {}; }

    const rawName = farmer.name || farmer.fullName || 'Farmer';
    const fullName = rawName.trim();
    const phone = farmer.phone || farmer.mobile || farmer.phoneNumber;
    const formattedPhone = phone ? (String(phone).startsWith('+91') ? String(phone) : '+91 ' + String(phone).replace(/^0+/, '')) : 'Not available';

    const city = farmer.city || window.currentCity || 'Manipal';
    const state = farmer.state || window.currentState || 'Karnataka';
    const locationStr = `${city}, ${state}`;

    const lat = window.currentLat || (farmer.location?.coordinates ? farmer.location.coordinates[1] : 13.3478);
    const lon = window.currentLon || (farmer.location?.coordinates ? farmer.location.coordinates[0] : 74.7944);
    const coordsStr = (lat && lon) ? `${Number(lat).toFixed(4)}, ${Number(lon).toFixed(4)}` : 'Not available';

    const locEl = document.getElementById('modalProfileLocation');
    if (locEl) locEl.innerText = locationStr;

    const coordsEl = document.getElementById('modalProfileCoords');
    if (coordsEl) coordsEl.innerText = coordsStr;

    syncUserProfileDisplay();

    const modal = document.getElementById('farmerProfileModal');
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
};

// Close Farmer Profile Modal
window.closeFarmerProfileModal = function() {
    const modal = document.getElementById('farmerProfileModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
};

// Open Change Password Modal
window.openChangePasswordModal = function() {
    ensureFarmerModalsInDOM();
    const alertBox = document.getElementById('cpStatusAlert');
    if (alertBox) {
        alertBox.style.display = 'none';
        alertBox.className = 'cp-alert-box';
        alertBox.innerText = '';
    }
    const form = document.getElementById('changePasswordForm');
    if (form) form.reset();

    // Reset eye icons to eye (hidden password state)
    document.querySelectorAll('.cp-eye-btn i').forEach(icon => {
        icon.className = 'fas fa-eye';
    });
    document.querySelectorAll('.cp-input').forEach(inp => {
        inp.type = 'password';
    });

    const cpModal = document.getElementById('changePasswordModal');
    if (cpModal) {
        cpModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    syncUserProfileDisplay();
};

// Close Change Password Modal
window.closeChangePasswordModal = function() {
    const cpModal = document.getElementById('changePasswordModal');
    if (cpModal) {
        cpModal.classList.remove('active');
        document.body.style.overflow = '';
    }
    const form = document.getElementById('changePasswordForm');
    if (form) form.reset();
};

// Submit Change Password Form
window.submitChangePassword = async function(e) {
    if (e && typeof e.preventDefault === 'function') e.preventDefault();

    const lang = getAppLanguage();
    const dict = (typeof I18N_DICT !== 'undefined' && I18N_DICT[lang]) ? I18N_DICT[lang] : (typeof I18N_DICT !== 'undefined' ? I18N_DICT['en'] : {});

    const currentPwEl = document.getElementById('cpCurrentPw');
    const newPwEl = document.getElementById('cpNewPw');
    const confirmPwEl = document.getElementById('cpConfirmPw');
    const alertBox = document.getElementById('cpStatusAlert');
    const submitBtn = document.getElementById('btnSubmitChangePw');

    const currentPw = currentPwEl ? currentPwEl.value : '';
    const newPw = newPwEl ? newPwEl.value : '';
    const confirmPw = confirmPwEl ? confirmPwEl.value : '';

    function showAlert(msg, isError = true) {
        if (!alertBox) return;
        alertBox.style.display = 'block';
        alertBox.className = isError ? 'cp-alert-box cp-alert-error' : 'cp-alert-box cp-alert-success';
        alertBox.innerHTML = `<i class="${isError ? 'fas fa-circle-exclamation' : 'fas fa-circle-check'}"></i> <span>${msg}</span>`;
    }

    // Client-side Validations with localized messages
    if (!currentPw) {
        showAlert(dict.cp_err_empty_current || 'Please enter your current password.', true);
        return;
    }
    if (!newPw) {
        showAlert(dict.cp_err_empty_new || 'Please enter a new password.', true);
        return;
    }
    if (newPw.length < 6) {
        showAlert(dict.cp_err_length || 'New password must be at least 6 characters long.', true);
        return;
    }
    if (newPw !== confirmPw) {
        showAlert(dict.cp_err_mismatch || 'New password and confirmation password do not match.', true);
        return;
    }
    if (newPw === currentPw) {
        showAlert(dict.cp_err_same || 'New password cannot be identical to your current password.', true);
        return;
    }

    let farmer = {};
    try {
        farmer = JSON.parse(localStorage.getItem('farmer') || '{}');
    } catch(err) { farmer = {}; }

    const farmerId = farmer.id || farmer._id;
    if (!farmerId) {
        showAlert('Please log in again to update your password.', true);
        return;
    }

    // Disable submit button during request
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> <span>${dict.common_loading || 'Updating...'}</span>`;
    }

    try {
        const res = await fetch('/api/auth/change-password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
            },
            body: JSON.stringify({
                farmerId,
                currentPassword: currentPw,
                newPassword: newPw
            })
        });

        const data = await res.json();

        if (res.ok && data.success) {
            showAlert(dict.cp_success || 'Password updated successfully.', false);
            if (currentPwEl) currentPwEl.value = '';
            if (newPwEl) newPwEl.value = '';
            if (confirmPwEl) confirmPwEl.value = '';

            setTimeout(() => {
                closeChangePasswordModal();
            }, 1200);
        } else {
            showAlert(data.error || 'Failed to update password. Please check your current password.', true);
        }
    } catch(err) {
        console.error('Password update network error:', err);
        showAlert('Network error. Please verify your connection and try again.', true);
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = `<i class="fas fa-shield-halved"></i> <span>${dict.cp_btn_update || 'Update Password'}</span>`;
        }
    }
};

// Global click outside modal listener
document.addEventListener('click', (e) => {
    const profileModal = document.getElementById('farmerProfileModal');
    if (profileModal && profileModal.classList.contains('active') && e.target === profileModal) {
        closeFarmerProfileModal();
    }
    const cpModal = document.getElementById('changePasswordModal');
    if (cpModal && cpModal.classList.contains('active') && e.target === cpModal) {
        closeChangePasswordModal();
    }
});

// Sync on DOMContentLoaded and languageChanged
document.addEventListener('DOMContentLoaded', () => {
    syncUserProfileDisplay();
    ensureFarmerModalsInDOM();
    initScrollRevealObserver();
});


// Universal Scroll Reveal & Component Visibility Initializer
function initScrollRevealObserver() {
    const selector = '.scroll-reveal, .page-header-row, .stats-strip, .filter-card, .main-layout-grid, .commodity-cards-grid, .table-view-container, .sidebar-panel, .disclaimer-card, .page-header, .charts-grid, .alerts-container, .alert-page, .threshold-grid, .news-header, .news-grid';
    
    // Immediately reveal existing elements on page load
    const elements = document.querySelectorAll(selector);
    elements.forEach(el => el.classList.add('is-revealed'));

    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-revealed');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.05, rootMargin: '0px 0px 50px 0px' });

        document.querySelectorAll(selector).forEach(el => observer.observe(el));
    }
}

window.revealNewElements = function(container) {
    if (!container) return;
    const items = container.querySelectorAll('.commodity-card, .alert-card, .news-card, .stat-item, .chart-card, .threshold-card');
    items.forEach(el => el.classList.add('is-revealed'));
    if (container.classList) container.classList.add('is-revealed');
};


window.addEventListener('krishi:languageChanged', () => {
    syncUserProfileDisplay();
});
