"use client";

import { useState, useEffect, useMemo } from "react";
import { Inter } from "next/font/google";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MapPin, Search, Wind, Droplets, Sun, Navigation, 
  Loader2, Heart, Calendar, CloudRain, ShieldCheck, Activity
} from "lucide-react";
import { format } from "date-fns";
import Auth from "@/components/Auth";
import { supabase } from "@/lib/supabase";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

// --- Type Definitions ---
interface WeatherData {
  timelines: {
    hourly: any[];
    daily: any[];
  };
  location: {
    name: string;
    lat: number;
    lon: number;
  };
}

// --- Utility Functions ---
const getWeatherInfo = (code: number) => {
  const mapping: Record<number, { main: string; description: string; icon: string }> = {
    0: { main: "Unknown", description: "Unknown", icon: "01d" },
    1000: { main: "Clear", description: "Clear, sunny", icon: "01d" },
    1100: { main: "Clear", description: "Mostly clear", icon: "01d" },
    1101: { main: "Clouds", description: "Partly cloudy", icon: "02d" },
    1102: { main: "Clouds", description: "Mostly cloudy", icon: "03d" },
    1001: { main: "Clouds", description: "Cloudy", icon: "04d" },
    2000: { main: "Fog", description: "Fog", icon: "50d" },
    2100: { main: "Fog", description: "Light fog", icon: "50d" },
    4000: { main: "Drizzle", description: "Drizzle", icon: "09d" },
    4001: { main: "Rain", description: "Rain", icon: "10d" },
    4200: { main: "Rain", description: "Light rain", icon: "09d" },
    4201: { main: "Rain", description: "Heavy rain", icon: "10d" },
    5000: { main: "Snow", description: "Snow", icon: "13d" },
    5001: { main: "Snow", description: "Flurries", icon: "13d" },
    5100: { main: "Snow", description: "Light snow", icon: "13d" },
    5101: { main: "Snow", description: "Heavy snow", icon: "13d" },
    8000: { main: "Thunderstorm", description: "Thunderstorm", icon: "11d" },
  };
  return mapping[code] || mapping[0];
};

const getBackgroundGradient = (weatherMain: string, isDay: boolean) => {
  if (!isDay) return "from-slate-950 via-blue-950 to-black";
  switch (weatherMain.toLowerCase()) {
    case "clear": return "from-blue-600 via-blue-500 to-indigo-400";
    case "clouds": return "from-slate-600 via-gray-700 to-slate-800";
    case "rain": case "drizzle": return "from-slate-800 via-blue-950 to-black";
    case "thunderstorm": return "from-purple-950 via-slate-950 to-black";
    case "snow": return "from-blue-200 via-slate-100 to-blue-50";
    default: return "from-blue-600 via-blue-500 to-indigo-400";
  }
};

const generateVibeSummary = (temp: number, condition: string) => {
  if (temp > 30) return `It's sweltering and ${condition}. Stay hydrated!`;
  if (temp > 22) return `Perfect weather. Warm and ${condition}. Enjoy the day!`;
  if (temp > 15) return `Mild and ${condition}. A light jacket might be nice.`;
  if (temp > 5) return `Chilly and ${condition}. Definitely grab a coat.`;
  return `Freezing and ${condition}. Bundle up!`;
};

const getAQIDescription = (index: number) => {
  if (index <= 50) return "Good";
  if (index <= 100) return "Moderate";
  if (index <= 150) return "Unhealthy for Sensitive Groups";
  return "Unhealthy";
};

// --- Animations ---
const BackgroundParticles = ({ weatherMain }: { weatherMain: string }) => {
  const particles = useMemo(() => Array.from({ length: 20 }), []);
  
  if (weatherMain.toLowerCase() === "rain" || weatherMain.toLowerCase() === "drizzle") {
    return (
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {particles.map((_, i) => (
          <motion.div
            key={i}
            initial={{ y: -100, x: Math.random() * 100 + "vw", opacity: 0 }}
            animate={{ 
              y: "110vh", 
              opacity: [0, 0.4, 0] 
            }}
            transition={{ 
              duration: Math.random() * 1 + 0.5, 
              repeat: Infinity, 
              delay: Math.random() * 2,
              ease: "linear"
            }}
            className="absolute w-[1px] h-10 bg-white/30"
          />
        ))}
      </div>
    );
  }

  if (weatherMain.toLowerCase() === "clear") {
    return (
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-yellow-400/20 blur-[120px] rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {particles.map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: Math.random() * 0.5 + 0.5 }}
          animate={{ 
            x: [Math.random() * 100 + "vw", (Math.random() * 100 - 20) + "vw"],
            y: [Math.random() * 100 + "vh", (Math.random() * 100 - 20) + "vh"],
            opacity: [0, 0.1, 0]
          }}
          transition={{ 
            duration: Math.random() * 20 + 10, 
            repeat: Infinity, 
            ease: "linear" 
          }}
          className="absolute w-32 h-32 bg-white/10 blur-[40px] rounded-full"
        />
      ))}
    </div>
  );
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
        className="w-full glass rounded-full py-4 pl-12 pr-6 text-white placeholder-white/70 outline-none focus:ring-2 focus:ring-white/50 transition-all shadow-lg"
      />
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70" size={20} />
    </form>
  );
}

function WeatherCard({ data, onSave, isSaved }: { data: WeatherData, onSave?: () => void, isSaved?: boolean }) {
  const current = data.timelines.hourly[0];
  const info = getWeatherInfo(current.values.weatherCode);
  const temp = Math.round(current.values.temperature);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="glass-dark rounded-3xl p-8 flex flex-col items-center justify-center text-center w-full max-w-md mx-auto relative overflow-hidden shadow-2xl border border-white/10"
    >
       <div className="absolute top-6 right-6 flex flex-col items-end gap-1 text-white/80">
          <div className="flex items-center gap-1">
            <MapPin size={14} className="text-white/60"/>
            <span className="text-sm font-bold tracking-wider">{data.location.name}</span>
          </div>
          <span className="text-[10px] font-bold text-white/40 uppercase tracking-tighter">
            Last updated: {format(new Date(current.time), 'HH:mm')}
          </span>
          {onSave && (
            <button onClick={onSave} className={`mt-2 transition-colors ${isSaved ? 'text-red-400' : 'text-white/40 hover:text-white'}`}>
              <Heart size={20} fill={isSaved ? "currentColor" : "none"} />
            </button>
          )}
       </div>

      <motion.div 
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 100, delay: 0.2 }}
        className="mt-8 mb-4 relative"
      >
        <div className="absolute inset-0 bg-white/20 blur-[60px] rounded-full scale-150 opacity-50" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img 
          src={`http://openweathermap.org/img/wn/${info.icon}@4x.png`} 
          alt={info.main}
          className="w-40 h-40 drop-shadow-2xl relative z-10"
        />
      </motion.div>

      <h1 className="text-8xl font-black tracking-tighter mb-2 drop-shadow-lg text-white">
        {temp}°
      </h1>
      <p className="text-2xl font-medium tracking-wide text-white capitalize mb-6">
        {info.description}
      </p>

      <div className="glass rounded-2xl p-4 w-full text-left">
        <p className="text-sm text-white italic font-medium leading-relaxed">
          {generateVibeSummary(temp, info.description)}
        </p>
      </div>
    </motion.div>
  );
}

function GridDetails({ current }: { current: any }) {
  const details = [
    { icon: <Wind size={20} />, label: "Wind", value: `${current.values.windSpeed} m/s` },
    { icon: <Droplets size={20} />, label: "Humidity", value: `${current.values.humidity}%` },
    { icon: <Sun size={20} />, label: "UV Index", value: `${current.values.uvIndex || 0}`, sub: current.values.uvIndex > 5 ? "High" : "Low" },
    { icon: <Activity size={20} />, label: "AQI", value: `${current.values.epaIndex || 0}`, sub: getAQIDescription(current.values.epaIndex) },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.4 }}
      className="grid grid-cols-2 gap-4 w-full max-w-md mx-auto mt-6"
    >
      {details.map((detail, idx) => (
        <div key={idx} className="glass-dark rounded-2xl p-4 flex flex-col items-center justify-center gap-1 border border-white/5 hover:bg-white/10 transition-colors">
          <div className="text-white mb-1">{detail.icon}</div>
          <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest">{detail.label}</span>
          <span className="text-lg font-black text-white">{detail.value}</span>
          {detail.sub && <span className="text-[10px] font-bold text-white/40">{detail.sub}</span>}
        </div>
      ))}
    </motion.div>
  );
}

function HourlyForecast({ hourly }: { hourly: any[] }) {
  const hourlyData = hourly.slice(0, 8); 

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
      className="w-full max-w-md mx-auto mt-6 glass rounded-3xl p-6 border border-white/10 shadow-xl"
    >
      <h3 className="text-xs font-black text-white/80 uppercase tracking-widest mb-4 flex items-center gap-2">
        <Sun size={14} /> 24-Hour Forecast
      </h3>
      <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
        {hourlyData.map((item: any, idx: number) => {
          const info = getWeatherInfo(item.values.weatherCode);
          return (
            <div key={idx} className="flex flex-col items-center min-w-[60px] gap-2">
              <span className="text-[10px] font-bold text-white/80">
                {format(new Date(item.time), 'HH:mm')}
              </span>
              <img 
                src={`http://openweathermap.org/img/wn/${info.icon}.png`} 
                alt={info.main}
                className="w-10 h-10 filter drop-shadow-md"
              />
              <span className="text-sm font-black text-white">{Math.round(item.values.temperature)}°</span>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

function DailyForecast({ daily }: { daily: any[] }) {
  const dailyData = daily.slice(0, 7);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8 }}
      className="w-full max-w-md mx-auto mt-6 glass rounded-3xl p-6 border border-white/10 shadow-xl"
    >
      <h3 className="text-xs font-black text-white/80 uppercase tracking-widest mb-4 flex items-center gap-2">
        <Calendar size={14} /> 7-Day Forecast
      </h3>
      <div className="flex flex-col gap-4">
        {dailyData.map((item: any, idx: number) => {
          const info = getWeatherInfo(item.values.weatherCodeMax);
          const isToday = idx === 0;
          return (
            <div key={idx} className="flex items-center justify-between">
              <span className="text-sm font-bold text-white w-20">
                {isToday ? "Today" : format(new Date(item.time), 'EEE')}
              </span>
              <div className="flex items-center gap-3 flex-1 px-4">
                <img 
                  src={`http://openweathermap.org/img/wn/${info.icon}.png`} 
                  alt={info.main}
                  className="w-8 h-8 filter drop-shadow-md"
                />
                <span className="text-xs font-bold text-white/60 truncate">{info.description}</span>
              </div>
              <div className="flex items-center gap-3 w-24 justify-end">
                <span className="text-sm font-black text-white">{Math.round(item.values.temperatureMax)}°</span>
                <span className="text-sm font-bold text-white/40">{Math.round(item.values.temperatureMin)}°</span>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

// --- Main Page ---

export default function Home() {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [user, setUser] = useState<any>(null);
  const [savedLocations, setSavedLocations] = useState<any[]>([]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      fetchSavedLocations();
    } else {
      setSavedLocations([]);
    }
  }, [user]);

  const fetchSavedLocations = async () => {
    const { data, error } = await supabase
      .from('saved_locations')
      .select('*');
    if (error) console.error("Error fetching locations:", error);
    setSavedLocations(data || []);
  };

  const handleSaveLocation = async () => {
    if (!user || !weatherData) return;
    const isSaved = savedLocations.some(l => l.city_name === weatherData.location.name);
    if (isSaved) {
      await supabase.from('saved_locations').delete().eq('city_name', weatherData.location.name);
    } else {
      await supabase.from('saved_locations').insert({
        user_id: user.id,
        city_name: weatherData.location.name,
        country_code: "N/A",
        lat: weatherData.location.lat,
        lon: weatherData.location.lon
      });
    }
    fetchSavedLocations();
  };

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
        (position) => fetchWeather({ lat: position.coords.latitude, lon: position.coords.longitude }),
        () => fetchWeather({ city: "London" })
      );
    } else {
      fetchWeather({ city: "London" });
    }
  }, []);

  const weatherMain = weatherData ? getWeatherInfo(weatherData.timelines.hourly[0].values.weatherCode).main : "Clear";
  const bgClass = useMemo(() => {
    if (!weatherData) return "from-slate-900 to-black";
    const current = weatherData.timelines.hourly[0];
    const info = getWeatherInfo(current.values.weatherCode);
    const date = new Date(current.time);
    const hour = date.getHours();
    const isDay = hour > 6 && hour < 19;
    return getBackgroundGradient(info.main, isDay);
  }, [weatherData]);

  return (
    <main className={`${inter.variable} font-sans min-h-screen bg-gradient-to-br ${bgClass} transition-colors duration-1000 px-4 py-8 sm:p-8 flex flex-col items-center relative`}>
      <BackgroundParticles weatherMain={weatherMain} />
      
      <div className="w-full max-w-md flex flex-col gap-4 mb-8 z-10">
        <div className="flex items-center justify-between gap-4">
          <Auth />
        </div>
        <SearchBar onSearch={(city) => fetchWeather({ city })} />
      </div>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div 
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center text-white z-10"
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
             className="glass rounded-3xl p-8 max-w-md mx-auto text-center mt-20 z-10"
          >
            <p className="text-xl text-red-200">{error}</p>
          </motion.div>
        ) : weatherData ? (
          <motion.div 
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 w-full flex flex-col z-10 pb-20"
          >
            <WeatherCard 
              data={weatherData} 
              onSave={user ? handleSaveLocation : undefined}
              isSaved={savedLocations.some(l => l.city_name === weatherData.location.name)}
            />
            <GridDetails current={weatherData.timelines.hourly[0]} />
            <HourlyForecast hourly={weatherData.timelines.hourly} />
            <DailyForecast daily={weatherData.timelines.daily} />

            {user && savedLocations.length > 0 && (
              <div className="w-full max-w-md mx-auto mt-8">
                <h3 className="text-xs font-black text-white/50 uppercase tracking-widest mb-4 ml-2">Saved Locations</h3>
                <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-4">
                  {savedLocations.map((loc: any) => (
                    <button
                      key={loc.id}
                      onClick={() => fetchWeather({ lat: loc.lat, lon: loc.lon })}
                      className="glass rounded-2xl px-4 py-3 flex items-center gap-2 whitespace-nowrap hover:bg-white/20 transition-all shrink-0"
                    >
                      <MapPin size={14} className="text-white/60" />
                      <span className="text-sm font-bold">{loc.city_name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </main>
  );
}
