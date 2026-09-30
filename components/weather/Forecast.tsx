"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import { Clock, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import Image from "next/image";

import { WeatherTimelineValue, calculateIsDay } from "@/lib/weather-utils";

interface HourlyForecastProps {
  hourly: WeatherTimelineValue[];
  lon?: number;
  getWeatherInfo: (code: number, isDay?: boolean) => { main: string; description: string; icon: string };
}

export function HourlyForecast({ hourly, lon, getWeatherInfo }: HourlyForecastProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const hourlyData = hourly.slice(0, 24); // Show full 24-hour cycle

  const handleScroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === "left" ? -240 : 240;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.5 }}
      className="w-full glass-card rounded-3xl p-6 shadow-xl transition-all duration-300 relative group"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-black text-[var(--theme-text-secondary)] uppercase tracking-widest flex items-center gap-2">
          <Clock size={15} className="text-sky-400" /> 24-Hour Forecast
        </h3>

        {/* Scroll navigation arrows for desktop mice */}
        <div className="hidden sm:flex items-center gap-1.5 opacity-70 group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={() => handleScroll("left")}
            aria-label="Scroll left"
            className="w-7 h-7 rounded-full glass-subtle flex items-center justify-center text-[var(--theme-text-secondary)] hover:text-[var(--theme-text-primary)] hover:scale-105 active:scale-95 transition-all"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            onClick={() => handleScroll("right")}
            aria-label="Scroll right"
            className="w-7 h-7 rounded-full glass-subtle flex items-center justify-center text-[var(--theme-text-secondary)] hover:text-[var(--theme-text-primary)] hover:scale-105 active:scale-95 transition-all"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div
        ref={scrollContainerRef}
        className="flex gap-4 sm:gap-5 overflow-x-auto scrollbar-hide pb-2 pt-1 scroll-smooth"
      >
        {hourlyData.map((item: WeatherTimelineValue, idx: number) => {
          const isItemDay = calculateIsDay(item.time, lon);
          const info = getWeatherInfo(item.values.weatherCode, isItemDay);
          const isNow = idx === 0;

          return (
            <div
              key={idx}
              className={`flex flex-col items-center min-w-[62px] sm:min-w-[68px] p-2.5 rounded-2xl transition-all ${
                isNow ? "bg-sky-500/10 border border-sky-400/30" : "hover:bg-white/[0.04]"
              }`}
            >
              <span className="text-[11px] font-bold text-[var(--theme-text-muted)]">
                {isNow ? "Now" : format(new Date(item.time), "HH:mm")}
              </span>
              <Image
                src={`https://openweathermap.org/img/wn/${info.icon}.png`}
                alt={info.main}
                width={40}
                height={40}
                className="w-10 h-10 filter drop-shadow my-1 object-contain select-none"
              />
              <span className="text-sm font-black text-[var(--theme-text-primary)]">
                {Math.round(item.values.temperature)}°
              </span>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

interface DailyForecastProps {
  daily: WeatherTimelineValue[];
  getWeatherInfo: (code: number, isDay?: boolean) => { main: string; description: string; icon: string };
}

export function DailyForecast({ daily, getWeatherInfo }: DailyForecastProps) {
  const dailyData = daily.slice(0, 7);

  // Calculate overall min/max to normalize temperature range bars
  const minTempAll = Math.min(...dailyData.map((d) => d.values.temperatureMin ?? d.values.temperature));
  const maxTempAll = Math.max(...dailyData.map((d) => d.values.temperatureMax ?? d.values.temperature));
  const tempSpan = Math.max(maxTempAll - minTempAll, 1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.5 }}
      className="w-full glass-card rounded-3xl p-6 shadow-xl transition-all duration-300"
    >
      <h3 className="text-xs font-black text-[var(--theme-text-secondary)] uppercase tracking-widest mb-4 flex items-center gap-2">
        <Calendar size={15} className="text-blue-400" /> 7-Day Extended Forecast
      </h3>

      <div className="flex flex-col gap-3">
        {dailyData.map((item: WeatherTimelineValue, idx: number) => {
          const info = getWeatherInfo(item.values.weatherCodeMax || item.values.weatherCode, true);
          const isToday = idx === 0;
          const minT = Math.round(item.values.temperatureMin ?? item.values.temperature);
          const maxT = Math.round(item.values.temperatureMax ?? item.values.temperature);

          // Calculate temperature bar percentages
          const leftPercent = Math.max(0, ((minT - minTempAll) / tempSpan) * 100);
          const widthPercent = Math.max(12, (((maxT - minT) || 1) / tempSpan) * 100);

          return (
            <div
              key={idx}
              className="flex items-center justify-between py-1.5 px-2 rounded-xl hover:bg-white/[0.03] transition-colors"
            >
              {/* Day name */}
              <span className="text-xs sm:text-sm font-bold text-[var(--theme-text-primary)] w-14 sm:w-16 shrink-0">
                {isToday ? "Today" : format(new Date(item.time), "EEE")}
              </span>

              {/* Weather icon & description */}
              <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0 px-2">
                <Image
                  src={`https://openweathermap.org/img/wn/${info.icon}.png`}
                  alt={info.main}
                  width={32}
                  height={32}
                  className="w-7 h-7 sm:w-8 sm:h-8 filter drop-shadow shrink-0 object-contain select-none"
                />
                <span className="text-xs font-semibold text-[var(--theme-text-muted)] truncate hidden xs:inline sm:inline">
                  {info.description}
                </span>
              </div>

              {/* Interactive Temperature range bar */}
              <div className="flex items-center gap-2 sm:gap-3 w-36 sm:w-48 shrink-0 justify-end">
                <span className="text-xs sm:text-sm font-bold text-[var(--theme-text-muted)] w-7 text-right">
                  {minT}°
                </span>

                <div className="flex-1 h-1.5 bg-black/10 dark:bg-white/10 rounded-full relative overflow-hidden hidden sm:block">
                  <div
                    className="absolute top-0 bottom-0 rounded-full bg-gradient-to-r from-sky-400 via-amber-400 to-rose-500"
                    style={{
                      left: `${leftPercent}%`,
                      width: `${Math.min(widthPercent, 100 - leftPercent)}%`,
                    }}
                  />
                </div>

                <span className="text-xs sm:text-sm font-black text-[var(--theme-text-primary)] w-7 text-right">
                  {maxT}°
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
