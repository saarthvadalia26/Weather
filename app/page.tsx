"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Inter } from "next/font/google";
import { motion, AnimatePresence } from "framer-motion";
import { Search, MapPin, Loader2 } from "lucide-react";
import Auth from "@/components/Auth";
import { supabase } from "@/lib/supabase";
import { 
  getWeatherInfo, 
  getBackgroundGradient, 
  generateVibeSummary 
} from "@/lib/weather-utils";

// Optimized Components
import { BackgroundParticles } from "@/components/weather/BackgroundParticles";
import { WeatherCard } from "@/components/weather/WeatherCard";
import { GridDetails } from "@/components/weather/GridDetails";
import { HourlyForecast, DailyForecast } from "@/components/weather/Forecast";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

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

function SearchBar({ onSearch }: { onSearch: (city: string) => void }) {
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) onSearch(query);
  };

  return (
    <div className="relative w-full max-w-md mx-auto mb-8 z-10">
      <form onSubmit={handleSubmit} className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search city..."
          className="w-full glass rounded-full py-4 pl-12 pr-6 text-white placeholder-white/70 outline-none focus:ring-2 focus:ring-white/50 transition-all shadow-lg"
        />
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70" size={20} />
      </form>
    </div>
  );
}

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

  const fetchSavedLocations = useCallback(async () => {
    const { data, error } = await supabase
      .from('saved_locations')
      .select('*');
    if (error) console.error("Error fetching locations:", error);
    setSavedLocations(data || []);
  }, []);

  useEffect(() => {
    if (user) {
      fetchSavedLocations();
    } else {
      setSavedLocations([]);
    }
  }, [user, fetchSavedLocations]);

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

  const fetchWeather = useCallback(async (params: { lat?: number; lon?: number; city?: string }) => {
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
  }, []);

  useEffect(() => {
    fetchWeather({ city: "London" });
  }, [fetchWeather]);

  const weatherMain = useMemo(() => {
    return weatherData ? getWeatherInfo(weatherData.timelines.hourly[0].values.weatherCode).main : "Clear";
  }, [weatherData]);

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
    <main className={`${inter.variable} font-sans min-h-screen bg-gradient-to-br ${bgClass} transition-colors duration-1000 px-4 py-8 sm:p-8 flex flex-col items-center relative overflow-x-hidden`}>
      <BackgroundParticles weatherMain={weatherMain} />
      
      <div className="w-full max-w-md flex flex-col gap-4 mb-8 z-40">
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
            className="flex-1 w-full flex flex-col z-0 pb-20"
          >
            <WeatherCard 
              data={weatherData} 
              onSave={user ? handleSaveLocation : undefined}
              isSaved={savedLocations.some(l => l.city_name === weatherData.location.name)}
              getWeatherInfo={getWeatherInfo}
              generateVibeSummary={generateVibeSummary}
            />
            <GridDetails current={weatherData.timelines.hourly[0]} />
            <HourlyForecast hourly={weatherData.timelines.hourly} getWeatherInfo={getWeatherInfo} />
            <DailyForecast daily={weatherData.timelines.daily} getWeatherInfo={getWeatherInfo} />

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
