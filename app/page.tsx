"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Loader2, LocateFixed, X, CloudSun, AlertCircle } from "lucide-react";
import {
  getWeatherInfo,
  getBackgroundGradient,
  generateVibeSummary,
  calculateIsDay,
  WeatherData,
} from "@/lib/weather-utils";

import { BackgroundParticles } from "@/components/weather/BackgroundParticles";
import { WeatherCard } from "@/components/weather/WeatherCard";
import { GridDetails } from "@/components/weather/GridDetails";
import { HourlyForecast, DailyForecast } from "@/components/weather/Forecast";
import { ThemeToggle, useTheme } from "@/components/theme/ThemeToggle";

export default function Home() {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [geoLoading, setGeoLoading] = useState(false);

  const { theme } = useTheme();
  const isLight = theme === "light";

  const fetchWeather = useCallback(async (params: { lat?: number; lon?: number; city?: string }) => {
    setLoading(true);
    setError("");
    try {
      const query = new URLSearchParams(params as Record<string, string>).toString();
      const res = await fetch(`/api/weather?${query}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to load weather data");
      }
      setWeatherData(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred while retrieving weather data.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWeather({ city: "London" });
  }, [fetchWeather]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      fetchWeather({ city: searchQuery.trim() });
    }
  };

  const handleGeolocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }

    setGeoLoading(true);
    setError("");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setGeoLoading(false);
        fetchWeather({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
      },
      (err) => {
        setGeoLoading(false);
        if (err.code === 1) {
          setError("Location access was denied. Please allow location permissions or enter a city.");
        } else {
          setError("Unable to determine your current location. Please search for a city.");
        }
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const isLocationDay = useMemo(() => {
    if (!weatherData) return true;
    const current = weatherData.timelines.hourly[0];
    return calculateIsDay(current.time, weatherData.location.lon);
  }, [weatherData]);

  const weatherMain = useMemo(() => {
    if (!weatherData) return "Clear";
    const current = weatherData.timelines.hourly[0];
    return getWeatherInfo(current.values.weatherCode, isLocationDay).main;
  }, [weatherData, isLocationDay]);

  const bgClass = useMemo(() => {
    if (!weatherData) {
      return isLight ? "from-slate-100 via-sky-100 to-slate-200" : "from-slate-900 via-slate-950 to-black";
    }
    return getBackgroundGradient(weatherMain, isLocationDay, isLight);
  }, [weatherData, weatherMain, isLocationDay, isLight]);

  return (
    <main
      className={`min-h-screen bg-gradient-to-br ${bgClass} transition-colors duration-700 px-4 py-6 sm:px-6 lg:px-8 flex flex-col items-center relative overflow-x-hidden`}
    >
      <BackgroundParticles weatherMain={weatherMain} isLight={isLight} />

      {/* Top Header & Search Navigation Bar */}
      <header className="w-full max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 z-30">
        {/* Brand */}
        <div className="flex items-center gap-2 select-none self-start sm:self-auto">
          <div className="w-9 h-9 rounded-2xl glass flex items-center justify-center text-sky-400">
            <CloudSun size={20} />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight text-[var(--theme-text-primary)]">
              Atmosphere
            </h1>
            <p className="text-[10px] font-semibold text-[var(--theme-text-dim)] uppercase tracking-wider">
              Hyper-Local Forecast
            </p>
          </div>
        </div>

        {/* Search Bar & Actions */}
        <div className="w-full sm:w-auto flex-1 max-w-xl flex items-center gap-2">
          <form onSubmit={handleSearchSubmit} className="relative flex-1">
            <input
              type="search"
              enterKeyHint="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search city (e.g., Tokyo, New York)..."
              aria-label="Search city for weather forecast"
              className="w-full glass rounded-full py-3 pl-11 pr-10 text-sm font-medium text-[var(--theme-text-primary)] placeholder-[var(--input-placeholder)] outline-none focus:ring-2 focus:ring-sky-400/50 transition-all shadow-md"
            />
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--theme-text-muted)] pointer-events-none"
              size={18}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                aria-label="Clear search query"
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--theme-text-muted)] hover:text-[var(--theme-text-primary)] transition-colors p-1"
              >
                <X size={15} />
              </button>
            )}
          </form>

          {/* 1-Tap Geolocation button */}
          <button
            type="button"
            onClick={handleGeolocation}
            disabled={geoLoading}
            aria-label="Use current location"
            title="Use current GPS location"
            className="w-10 h-10 rounded-full glass flex items-center justify-center text-[var(--theme-text-secondary)] hover:text-sky-400 hover:scale-105 active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-sky-400/50 shrink-0"
          >
            {geoLoading ? (
              <Loader2 className="animate-spin text-sky-400" size={18} />
            ) : (
              <LocateFixed size={18} />
            )}
          </button>

          {/* Theme Toggle Button */}
          <ThemeToggle className="shrink-0" />
        </div>
      </header>

      {/* Main Content Area */}
      <div className="w-full max-w-6xl mx-auto flex-1 flex flex-col z-10 pb-16">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col items-center justify-center text-[var(--theme-text-primary)] py-28"
            >
              <Loader2 className="animate-spin mb-4 text-sky-400" size={44} />
              <p className="text-sm font-medium tracking-widest uppercase text-[var(--theme-text-secondary)]">
                Gathering Atmospheric Signals...
              </p>
            </motion.div>
          ) : error ? (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="glass-card rounded-3xl p-8 max-w-md mx-auto text-center mt-12 flex flex-col items-center gap-3 border border-red-500/20"
            >
              <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center text-red-400">
                <AlertCircle size={26} />
              </div>
              <h2 className="text-lg font-bold text-[var(--theme-text-primary)]">Weather Unavailable</h2>
              <p className="text-sm text-[var(--theme-text-secondary)] leading-relaxed">{error}</p>
              <button
                type="button"
                onClick={() => fetchWeather({ city: "London" })}
                className="mt-3 px-5 py-2 rounded-full glass hover:bg-white/10 text-xs font-bold uppercase tracking-wider text-[var(--theme-text-primary)] transition-all"
              >
                Reset to London
              </button>
            </motion.div>
          ) : weatherData ? (
            <motion.div
              key="content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-start"
            >
              {/* Left Column: Hero Weather Card */}
              <div className="lg:col-span-5 flex flex-col gap-6 w-full">
                <WeatherCard
                  data={weatherData}
                  isDay={isLocationDay}
                  getWeatherInfo={getWeatherInfo}
                  generateVibeSummary={generateVibeSummary}
                />
              </div>

              {/* Right Column: Detailed Metrics & Forecasts */}
              <div className="lg:col-span-7 flex flex-col gap-6 w-full">
                <GridDetails current={weatherData.timelines.hourly[0]} />
                <HourlyForecast
                  hourly={weatherData.timelines.hourly}
                  lon={weatherData.location.lon}
                  getWeatherInfo={getWeatherInfo}
                />
                <DailyForecast
                  daily={weatherData.timelines.daily}
                  getWeatherInfo={getWeatherInfo}
                />
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </main>
  );
}
