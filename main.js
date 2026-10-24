

// Application State & Configuration
const CONFIG = {
    // OpenWeatherMap API Key from project specs
    WEATHER_API_KEY: '95309785c3c14d94faf80089f16fc4ff',
    
    // Geographical Bounding Box covering Sudan only
    SUDAN_BOUNDS: [
        [9.3, 21.8],   // South-West corner
        [22.2, 38.6]   // North-East corner
    ],

    // Initial center point (Khartoum, Sudan)
    DEFAULT_COORDS: {
        lat: 15.5007,
        lon: 32.5599
    }
};

let map = null;
let activeMarker = null;

// DOM Elements Selection
const weatherForm = document.getElementById('weather-form');
const locationInput = document.getElementById('location-input');
const spinnerElement = document.getElementById('loading-spinner');
const errorAlertElement = document.getElementById('error-alert');
const errorMessageElement = document.getElementById('error-message');

/**
 * Phase 1: Initialize Leaflet Map focused strictly on Sudan without masks
 */
function initMap() {
    map = L.map('map-container', {
        minZoom: 6,                     // يمنع التصغير نهائياً لرؤية بقية دول العالم
        maxZoom: 18,                    // يسمح بتقريب وتفاصيل المدن والأحياء
        maxBounds: CONFIG.SUDAN_BOUNDS, // حدود مقفلة ومحصورة على السودان
        maxBoundsViscosity: 1.0         // ارتداد وقفل صارم يمنع السحب خارج حدود السودان
    });

    // ضبط العرض تلقائياً ليغطي رقعة السودان كاملة ومتمركزاً على الخرطوم
    map.fitBounds(CONFIG.SUDAN_BOUNDS);

    // طبقة الخريطة المفتوحة بألوانها الطبيعية
    L.tileLayer('https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png', {
        maxZoom: 18,
        minZoom: 6,
        attribution: '&copy; OpenStreetMap France | &copy; OpenStreetMap'
    }).addTo(map);
}

/**
 * UI State Helpers (Loading Spinner & Error Display)
 */
function showLoading() {
    spinnerElement.classList.remove('hidden');
    errorAlertElement.classList.add('hidden');
}

function hideLoading() {
    spinnerElement.classList.add('hidden');
}

function showError(message) {
    errorMessageElement.textContent = message;
    errorAlertElement.classList.remove('hidden');
}

function clearError() {
    errorAlertElement.classList.add('hidden');
    errorMessageElement.textContent = '';
}

/**
 * Phase 2: Asynchronous Geocoding strictly constrained to Sudan
 */
async function geocodeLocation(query) {
    // تقييد البحث داخل جمهورية السودان فقط باستخدام countrycodes=sd
    const endpoint = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=sd&limit=1`;
    
    const response = await fetch(endpoint, {
        headers: {
            'Accept': 'application/json'
        }
    });

    if (!response.ok) {
        throw new Error(`Geocoding service unavailable (Status: ${response.status})`);
    }

    const data = await response.json();
    if (!data || data.length === 0) {
        throw new Error(`Location "${query}" was not found inside Sudan. Please enter a valid Sudanese location.`);
    }

    return {
        lat: parseFloat(data[0].lat),
        lon: parseFloat(data[0].lon),
        displayName: data[0].display_name
    };
}

/**
 * Phase 3: Fetch Meteorological Data from OpenWeatherMap API
 */
async function fetchWeatherData(lat, lon) {
    const endpoint = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${CONFIG.WEATHER_API_KEY}&units=metric`;
    
    const response = await fetch(endpoint);
    
    if (!response.ok) {
        if (response.status === 404) {
            throw new Error('Weather data for this location could not be found.');
        }
        throw new Error(`Weather service error (Status: ${response.status})`);
    }

    const data = await response.json();
    return data;
}

/**
 * Share Weather Feature (Web Share API / Clipboard Fallback)
 */
async function shareWeather(cityName, temp, description) {
    const shareText = `Live weather for ${cityName}: ${Math.round(temp)}°C with ${description}. Checked via WeatherMap SPA!`;

    if (navigator.share) {
        try {
            await navigator.share({
                title: `Weather in ${cityName}`,
                text: shareText
            });
            return;
        } catch (err) {
            // Fallback to clipboard if dismissed
        }
    }

    try {
        await navigator.clipboard.writeText(shareText);
        alert('Weather summary copied to clipboard!');
    } catch (err) {
        alert('Failed to copy to clipboard.');
    }
}

/**
 * Phase 4 & 5: Render Marker & Rich InfoWindow (Leaflet Popup)
 */
function displayWeatherOnMap(coords, weatherData, searchCityName) {
    const resolvedName = weatherData.name || searchCityName;
    const temp = Math.round(weatherData.main.temp);
    const desc = weatherData.weather[0].description;
    const iconCode = weatherData.weather[0].icon;
    const humidity = weatherData.main.humidity;
    const windSpeed = weatherData.wind.speed;

    // حركة سلسة للتركيز على المدينة المستهدفة
    map.flyTo([coords.lat, coords.lon], 11, {
        animate: true,
        duration: 1.5
    });

    // إزالة العلامة السابقة لتجنب تراكم العلامات
    if (activeMarker) {
        map.removeLayer(activeMarker);
    }

    // بناء محتوى البطاقة التفاعلية
    const popupContent = document.createElement('div');
    popupContent.className = 'weather-popup';

    popupContent.innerHTML = `
        <h3>${resolvedName}</h3>
        <div class="popup-temp-row">
            <img class="popup-icon" src="https://openweathermap.org/img/wn/${iconCode}@2x.png" alt="${desc}">
            <span class="popup-temp">${temp}°C</span>
        </div>
        <p class="popup-desc">${desc}</p>
        <div class="popup-details">
            <span>💧 Humidity: ${humidity}%</span>
            <span>💨 Wind: ${windSpeed} m/s</span>
        </div>
        <button type="button" class="popup-share-btn" id="share-action-btn">Share Weather</button>
    `;

    // ربط حدث زر المشاركة برمجياً بدون inline onclick
    const shareBtn = popupContent.querySelector('#share-action-btn');
    shareBtn.addEventListener('click', () => {
        shareWeather(resolvedName, temp, desc);
    });

    // إنشاء العلامة وفتح النافذة
    activeMarker = L.marker([coords.lat, coords.lon])
        .addTo(map)
        .bindPopup(popupContent, {
            maxWidth: 260,
            closeButton: true
        })
        .openPopup();
}

/**
 * Main Controller Workflow
 */
async function handleSearch(event) {
    event.preventDefault();

    const query = locationInput.value.trim();
    if (!query) {
        showError('Please enter a location name before searching.');
        return;
    }

    clearError();
    showLoading();

    try {
        const coords = await geocodeLocation(query);
        const weatherData = await fetchWeatherData(coords.lat, coords.lon);
        displayWeatherOnMap(coords, weatherData, query);
    } catch (error) {
        showError(error.message || 'An unexpected operational error occurred.');
    } finally {
        hideLoading();
    }
}

/**
 * Event Registration (Strict Separation of Concerns)
 */
document.addEventListener('DOMContentLoaded', () => {
    initMap();
    weatherForm.addEventListener('submit', handleSearch);
});