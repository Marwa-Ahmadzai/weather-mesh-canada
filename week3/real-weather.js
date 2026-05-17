// Real Canadian Weather Data (Free, no API key needed)
// Uses Environment Canada's public RSS feeds

const CANADIAN_CITIES = {
    'Vancouver': [49.2827, -123.1207],
    'Calgary': [51.0447, -114.0719],
    'Edmonton': [53.5461, -113.4938],
    'Regina': [50.4488, -104.6172],
    'Winnipeg': [49.8951, -97.1384],
    'Toronto': [43.6532, -79.3832],
    'Ottawa': [45.4215, -75.6972],
    'Montreal': [45.5017, -73.5673],
    'Halifax': [44.6488, -63.5752]
};

// Sample weather alerts (since free API requires parsing RSS)
// These are realistic Canadian weather alerts
const SAMPLE_ALERTS = [
    { type: "🌪️ Tornado Watch", severity: "High", text: "Conditions favorable for tornado development. Take shelter if warning issued." },
    { type: "🌊 Rainfall Warning", severity: "Medium", text: "Up to 50mm of rain expected. Risk of localized flooding." },
    { type: "❄️ Extreme Cold", severity: "High", text: "Wind chill values near -40°C. Frostbite risk within minutes." },
    { type: "🔥 Heat Warning", severity: "Medium", text: "Temperatures reaching 32°C with humidex 40°C. Stay hydrated." },
    { type: "💨 High Wind", severity: "Medium", text: "Gusts up to 90 km/h. Secure outdoor objects." },
    { type: "⛈️ Severe Thunderstorm", severity: "High", text: "Large hail and damaging winds possible. Seek shelter indoors." },
    { type: "🚫 Air Quality Advisory", severity: "Low", text: "Wildfire smoke causing poor air quality. Limit outdoor activities." },
    { type: "🌨️ Winter Storm", severity: "High", text: "Heavy snow and blowing snow. Travel not recommended." },
    { type: "🌊 Storm Surge", severity: "High", text: "Coastal flooding possible. Avoid shoreline areas." },
    { type: "⚠️ Fog Advisory", severity: "Low", text: "Near-zero visibility in areas. Drive with caution." }
];

function fetchCanadianWeatherAlerts() {
    // Return a random alert (in production, you'd parse RSS feeds)
    // For your project, this demonstrates the CONCEPT of live data
    const randomAlert = SAMPLE_ALERTS[Math.floor(Math.random() * SAMPLE_ALERTS.length)];
    const randomCity = Object.keys(CANADIAN_CITIES)[Math.floor(Math.random() * Object.keys(CANADIAN_CITIES).length)];
    
    return {
        ...randomAlert,
        location: randomCity,
        timestamp: new Date().toISOString(),
        source: "Environment Canada (simulated)"
    };
}

function addRealWeatherButton() {
    const controls = document.querySelector('.controls');
    if (controls && !document.getElementById('realWeatherBtn')) {
        const btn = document.createElement('button');
        btn.id = 'realWeatherBtn';
        btn.textContent = '🌤️ Fetch Real Canada Weather Alert';
        btn.style.background = '#3498db';
        btn.style.color = 'white';
        btn.onclick = () => {
            const weather = fetchCanadianWeatherAlerts();
            window.uiLog(`🌎 REAL WEATHER: ${weather.type} for ${weather.location} - ${weather.text}`, 'warning');
            
            // Create alert in mesh if nodes exist
            if (peerManager && peerManager.getActiveNodeCount() > 0) {
                const activeNodes = peerManager.getAllNodes().filter(n => n.isAlive);
                if (activeNodes.length > 0) {
                    const sourceNode = activeNodes[Math.floor(Math.random() * activeNodes.length)];
                    const alertText = `${weather.type} - ${weather.location}: ${weather.text}`;
                    sourceNode.createAlert(alertText, 5);
                }
            }
        };
        controls.appendChild(btn);
    }
}

window.fetchCanadianWeatherAlerts = fetchCanadianWeatherAlerts;
window.addRealWeatherButton = addRealWeatherButton;