"use client";

import { useState, useEffect } from "react";
import { Inter } from "next/font/google";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Search, Wind, Droplets, Sun, Navigation, Loader2 } from "lucide-react";
import { format } from "date-fns";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

// --- Type Definitions ---
interface WeatherData {
  current: any;
  forecast: any;
}

// --- Utility Functions ---
const getBackgroundGradient = (weatherMain: string, isDay: boolean) => {
  if (!isDay) return "from-slate-900 via-blue-900 to-slate-900";
  switch (weatherMain.toLowerCase()) {
    case "clear": return "from-blue-400 via-sky-300 to-blue-200";
    case "clouds": return "from-slate-400 via-gray-300 to-slate-200";
    case "rain": case "drizzle": return "from-slate-700 via-blue-800 to-slate-900";
    case "thunderstorm": return "from-purple-900 via-slate-900 to-black";
    case "snow": return "from-blue-100 via-white to-blue-50";
    default: return "from-blue-400 via-sky-300 to-blue-200";
  }
};

const generateVibeSummary = (temp: number, condition: string) => {
  if (temp > 30) return `It's sweltering and ${condition}. Stay hydrated!`;
  if (temp > 22) return `Perfect weather. Warm and ${condition}. Enjoy the day!`;
  if (temp > 15) return `Mild and ${condition}. A light jacket might be nice.`;
  if (temp > 5) return `Chilly and ${condition}. Definitely grab a coat.`;
  return `Freezing and ${condition}. Bundle up!`;
};

// --- Components ---

function SearchBar({ onSearch }: { onSearch: (city: string) => void }) {
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) onSearch(query);
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-md mx-auto mb-8 z-10">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search city..."
        className="w-full glass rounded-full py-4 pl-12 pr-6 text-white placeholder-white/70 outline-none focus:ring-2 focus:ring-white/50 transition-all"
      />
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70" size={20} />
    </form>
  );
}

function WeatherCard({ data }: { data: WeatherData }) {
  const { current } = data;
  const temp = Math.round(current.main.temp);
  const condition = current.weather[0].main;
  const isDay = current.dt > current.sys.sunrise && current.dt < current.sys.sunset;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="glass-dark rounded-3xl p-8 flex flex-col items-center justify-center text-center w-full max-w-md mx-auto relative overflow-hidden"
    >
      <div className="absolute top-6 right-6 flex items-center gap-1 text-white/80">
         <MapPin size={16}/>
         <span className="text-sm font-medium tracking-wider">{current.name}, {current.sys.country}</span>
      </div>

      <motion.div 
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 100, delay: 0.2 }}
        className="mt-8 mb-4"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img 
          src={`http://openweathermap.org/img/wn/${current.weather[0].icon}@4x.png`} 
          alt={condition}
          className="w-40 h-40 drop-shadow-2xl"
        />
      </motion.div>

      <h1 className="text-8xl font-bold tracking-tighter mb-2 drop-shadow-lg">
        {temp}°
      </h1>
      <p className="text-2xl font-light tracking-wide text-white/90 capitalize mb-6">
        {current.weather[0].description}
      </p>

      <div className="glass rounded-2xl p-4 w-full text-left">
        <p className="text-sm text-white/90 italic font-light leading-relaxed">
          {generateVibeSummary(temp, current.weather[0].description)}
        </p>
      </div>
    </motion.div>
  );
}

function GridDetails({ current }: { current: any }) {
  const details = [
    { icon: <Wind size={24} />, label: "Wind", value: `${current.wind.speed} m/s` },
    { icon: <Droplets size={24} />, label: "Humidity", value: `${current.main.humidity}%` },
    { icon: <Sun size={24} />, label: "Pressure", value: `${current.main.pressure} hPa` },
    { icon: <Navigation size={24} />, label: "Visibility", value: `${(current.visibility / 1000).toFixed(1)} km` },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.4 }}
      className="grid grid-cols-2 gap-4 w-full max-w-md mx-auto mt-6"
    >
      {details.map((detail, idx) => (
        <div key={idx} className="glass-dark rounded-2xl p-4 flex flex-col items-center justify-center gap-2">
          <div className="text-white/70">{detail.icon}</div>
          <span className="text-xs font-medium text-white/60 uppercase tracking-wider">{detail.label}</span>
          <span className="text-lg font-semibold">{detail.value}</span>
        </div>
      ))}
    </motion.div>
  );
}

function HourlyForecast({ forecast }: { forecast: any }) {
  const hourlyData = forecast.list.slice(0, 8); // Next 24 hours (3h intervals)

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.6 }}
      className="w-full max-w-md mx-auto mt-6 glass rounded-3xl p-6"
    >
      <h3 className="text-sm font-medium text-white/80 uppercase tracking-widest mb-4 flex items-center gap-2">
        <Loader2 size={16} className="animate-spin-slow"/> 24-Hour Forecast
      </h3>
      <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
        {hourlyData.map((item: any, idx: number) => (
          <div key={idx} className="flex flex-col items-center min-w-[60px] gap-2">
            <span className="text-xs font-medium text-white/80">
              {format(new Date(item.dt * 1000), 'HH:mm')}
            </span>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={`http://openweathermap.org/img/wn/${item.weather[0].icon}.png`} 
              alt={item.weather[0].main}
              className="w-10 h-10"
            />
            <span className="text-sm font-bold">{Math.round(item.main.temp)}°</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// --- Main Page ---

export default function Home() {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchWeather = async (params: { lat?: number; lon?: number; city?: string }) => {
    setLoading(true);
    setError("");
    try {
      const query = new URLSearchParams(params as any).toString();
      const res = await fetch(`/api/weather?${query}`);
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error);
      setWeatherData(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchWeather({ lat: position.coords.latitude, lon: position.coords.longitude });
        },
        () => {
          fetchWeather({ city: "London" }); // Fallback
        }
      );
    } else {
      fetchWeather({ city: "London" });
    }
  }, []);

  const handleSearch = (city: string) => {
    fetchWeather({ city });
  };

  // Determine dynamic background
  let bgClass = "from-slate-900 to-black"; // Default loading state
  if (weatherData) {
    const isDay = weatherData.current.dt > weatherData.current.sys.sunrise && weatherData.current.dt < weatherData.current.sys.sunset;
    bgClass = getBackgroundGradient(weatherData.current.weather[0].main, isDay);
  }

  return (
    <main className={`${inter.variable} font-sans min-h-screen bg-gradient-to-br ${bgClass} transition-colors duration-1000 px-4 py-8 sm:p-8 flex flex-col`}>
      <SearchBar onSearch={handleSearch} />

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div 
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center text-white"
          >
            <Loader2 className="animate-spin mb-4" size={48} />
            <p className="text-lg font-light tracking-widest uppercase">Atmosphere</p>
          </motion.div>
        ) : error ? (
          <motion.div 
             key="error"
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             exit={{ opacity: 0 }}
             className="glass rounded-3xl p-8 max-w-md mx-auto text-center mt-20"
          >
            <p className="text-xl text-red-200">{error}</p>
          </motion.div>
        ) : weatherData ? (
          <motion.div 
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 w-full flex flex-col"
          >
            <WeatherCard data={weatherData} />
            <GridDetails current={weatherData.current} />
            <HourlyForecast forecast={weatherData.forecast} />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </main>
  );
}
