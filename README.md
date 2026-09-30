# 🌤️ Atmosphere — Dynamic Hyper-Local Weather Dashboard

Atmosphere is a world-class, responsive weather dashboard built with Next.js (App Router), Tailwind CSS v4, and Framer Motion. Powered by the **Tomorrow.io** forecast API, it combines atmospheric animations, dynamic day/night awareness, adaptive Dark & Light themes, and deep meteorological metrics.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![Tailwind](https://img.shields.io/badge/Tailwind-v4-blue?logo=tailwindcss)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)

---

## ✨ Key Features

- **🌓 Dynamic Dark & Light Themes**: 1-tap animated toggle with persistent theme preference, system mode detection, and contrast-safe glassmorphism.
- **🚀 Hardened Server API Route**: Built-in sliding-window rate limiting, strict coordinate bounds checking, and input sanitization to protect API quotas.
- **📱 Fully Responsive Multi-Column Dashboard**:
  - **Desktop (1080p, 1440p, 4K)**: 2-column layout (Hero card on the left; Grid metrics, 24-hour horizontal forecast, and 7-day extended forecast on the right).
  - **Mobile (< 640px)**: Ergonomic touch-optimized single-column layout with responsive typography.
- **🕒 Solar Timezone Awareness**: Automatically calculates local day/night status based on target city coordinates rather than visitor device clock.
- **📍 1-Tap Geolocation**: Automatically fetch local weather using browser GPS coordinates with full error handling.
- **✨ Atmospheric Background Particles**:
  - **Rain & Drizzle**: Animated falling raindrops with viewport-aware particle density.
  - **Snow & Ice**: Soft floating snowflakes with high-contrast background gradients.
  - **Clear Skies**: Rotating glowing sun orb.
  - **Clouds & Mist**: Drifting atmospheric fog patches.
  - **Reduced Motion Support**: Automatically respects `prefers-reduced-motion` to conserve battery and avoid motion sensitivity.
- **📊 Extended Meteorological Metrics**:
  - UV Index with risk classifications.
  - EPA Air Quality Index (AQI).
  - Surface Atmospheric Pressure (hPa).
  - Wind Speed & Humidity.
  - Visibility (km) with clear line-of-sight status.
  - Interactive temperature range bars for the 7-day forecast.

---

## 🛠️ Technology Stack

- **Framework**: [Next.js (App Router)](https://nextjs.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Motion**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Weather API**: [Tomorrow.io v4 Forecast API](https://www.tomorrow.io/weather-api/)

---

## ⚙️ Environment Variables

Create a `.env.local` file in the root directory:

```env
# Tomorrow.io API Key (Required)
TOMORROW_API_KEY=your_api_key_here
```

---

## 🚀 Getting Started

1. **Clone the repository**:
   ```bash
   git clone https://github.com/saarthvadalia26/Weather.git
   cd Weather
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Run development server**:
   ```bash
   npm run dev
   ```

4. **Build for production**:
   ```bash
   npm run build
   ```

---

## 🙌 Acknowledgements

- Weather icons provided by OpenWeatherMap.
- Meteorological data provided by Tomorrow.io.
- Built with ❤️ by [Saarth Vadalia](https://github.com/saarthvadalia26)
