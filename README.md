# 🌤️ Atmosphere - Premium Weather Dashboard

Atmosphere is a high-precision, hyper-local weather dashboard designed with a premium dark-mode aesthetic. Powered by **Tomorrow.io**, it provides minute-by-minute forecasting with real-time atmospheric animations that react to current weather conditions.

![License](https://img.shields.io/github/license/saarthvadalia26/Weather)
![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)
![Tailwind](https://img.shields.io/badge/Tailwind-v4-blue?logo=tailwindcss)
![Supabase](https://img.shields.io/badge/Supabase-Database-emerald?logo=supabase)

---

## ✨ Key Features

- **🚀 Hyper-Local Precision**: Powered by Tomorrow.io v4 API for 1km resolution weather data.
- **✨ Live Atmosphere Animations**: 
  - **Rainy?** Subtle raindrops fall behind your weather cards.
  - **Sunny?** A soft, glowing sun-orb pulses in the background.
  - **Cloudy?** Slow-moving mist particles drift across the screen.
- **📅 7-Day Extended Forecast**: Detailed daily highs, lows, and conditions.
- **🌡️ "Feels Like" Accuracy**: Advanced metrics including Apparent Temperature, UV Index, and Pressure.
- **🔐 User Personalization**: 
  - **Google Auth**: Securely sign in via Supabase.
  - **Saved Locations**: One-tap access to your favorite cities.
- **📱 Responsive Glassmorphism**: Stunning UI designed for both desktop and mobile devices.

---

## 🛠️ Technology Stack

- **Framework**: [Next.js 15 (App Router)](https://nextjs.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Database & Auth**: [Supabase](https://supabase.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Weather Provider**: [Tomorrow.io](https://www.tomorrow.io/weather-api/)

---

## ⚙️ Environment Variables

To run this project locally, you will need to add the following variables to your `.env.local` file:

```env
# Tomorrow.io API
TOMORROW_API_KEY=your_api_key_here

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

---

## 🚀 Getting Started

1. **Clone the repository**:
   ```bash
   git clone https://github.com/saarthvadalia26/Weather.git
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Run the development server**:
   ```bash
   npm run dev
   ```

4. **Build for production**:
   ```bash
   npm run build
   ```

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.

---

## 🙌 Acknowledgements

- Weather icons provided by OpenWeatherMap.
- Animations inspired by Apple Weather.
- Built with ❤️ by [Saarth Vadalia](https://github.com/saarthvadalia26)
