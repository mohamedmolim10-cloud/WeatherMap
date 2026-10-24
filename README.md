# WeatherMap SPA - Single Page Application

A modern, responsive Single Page Application (SPA) built using **Pure Vanilla JavaScript (ES6+)**, Leaflet.js, OpenStreetMap, and OpenWeatherMap REST API[span_1](start_span)[span_1](end_span).

---

##  Live Demo & Deployment
- **Live Application URL:** [https://mohamedmolim10-cloud.github.io/WeatherMap/](https://mohamedmolim10-cloud.github.io/WeatherMap/)
- **Repository Source Code:** [https://github.com/mohamedmolim10-cloud/WeatherMap](https://github.com/mohamedmolim10-cloud/WeatherMap)

---

##  Architectural Highlights & Features
- **Strict Separation of Concerns:** Clean architecture separating structure (`index.html`), presentation (`style.css`), and logic (`main.js`) with zero inline CSS styles or inline HTML event handlers[span_2](start_span)[span_2](end_span).
- **No Full-Page Redraws:** Seamless user experience leveraging asynchronous execution (`async/await`) and Fetch API without page reload upon searches
- **Geographic Focus (Sudan Only):** Strict bounding box and max-bounds viscosity confining map exploration exclusively to Sudanese territories
- **Geocoding Integration:** Converts user search queries into geographic coordinates via OpenStreetMap Nominatim API constrained by `countrycodes=sd`
- **Meteorological Data:** Live weather fetching (temperature, conditions, humidity, and wind speed) via OpenWeatherMap API

- **Interactive InfoWindow:** Dynamic custom Leaflet popup card displaying city name, weather icons, meteorological metrics, and action buttons
- **Share Weather Feature:** Native Web Share API integration with automatic fallback to clipboard copy
- **Robust UI Feedback:** Custom loading spinner animation and contextual error alert cards for graceful failure handling

---

##  Technology Stack
- **HTML5:** Semantic markup structure
- **CSS3:** Responsive layout, Google Fonts (Roboto), custom form elements, and 70vh viewport map container
- JavaScript: ES6+ Vanilla JS, DOM manipulation, asynchronous programming (`fetch` / `async-await`)
- APIs & Libraries:
  - [Leaflet.js v1.9.4](https://leafletjs.com/) (Interactive Map Rendering)
  - [OpenStreetMap Tile Servers](https://www.openstreetmap.org/) (Map Tiles via OSM France)
  - [OpenStreetMap Nominatim](https://nominatim.openstreetmap.org/) (Asynchronous Geocoding Service)
  - [OpenWeatherMap API](https://openweathermap.org/) (Current Weather REST API)

---

##  Project Structure

WeatherMap/
├── index.html       # Application markup and semantic layout
├── style.css        # Responsive styling and 70vh map rules
├── main.js          # Core controller, Leaflet logic, and API calls(end_span)
└── README.md        # Documentation and architectural overview