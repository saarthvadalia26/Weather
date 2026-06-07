"use client";

import { motion } from "framer-motion";
import { Sun, Calendar } from "lucide-react";
import { format } from "date-fns";
import Image from "next/image";

import { WeatherTimelineValue } from "@/lib/weather-utils";

interface ForecastProps {
  hourly?: WeatherTimelineValue[];
  daily?: WeatherTimelineValue[];
  getWeatherInfo: (code: number) => { main: string; description: string; icon: string };
}

export function HourlyForecast({ hourly, getWeatherInfo }: { hourly: WeatherTimelineValue[], getWeatherInfo: ForecastProps["getWeatherInfo"] }) {
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
        {hourlyData.map((item: WeatherTimelineValue, idx: number) => {
          const info = getWeatherInfo(item.values.weatherCode);
          return (
            <div key={idx} className="flex flex-col items-center min-w-[60px] gap-2">
              <span className="text-[10px] font-bold text-white/80">
                {format(new Date(item.time), 'HH:mm')}
              </span>
              <Image 
                src={`https://openweathermap.org/img/wn/${info.icon}.png`} 
                alt={info.main}
                width={40}
                height={40}
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

export function DailyForecast({ daily, getWeatherInfo }: { daily: WeatherTimelineValue[], getWeatherInfo: ForecastProps["getWeatherInfo"] }) {
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
        {dailyData.map((item: WeatherTimelineValue, idx: number) => {
          const info = getWeatherInfo(item.values.weatherCodeMax || item.values.weatherCode);
          const isToday = idx === 0;
          return (
            <div key={idx} className="flex items-center justify-between">
              <span className="text-sm font-bold text-white w-20">
                {isToday ? "Today" : format(new Date(item.time), 'EEE')}
              </span>
              <div className="flex items-center gap-3 flex-1 px-4">
                <Image 
                  src={`https://openweathermap.org/img/wn/${info.icon}.png`} 
                  alt={info.main}
                  width={32}
                  height={32}
                  className="w-8 h-8 filter drop-shadow-md"
                />
                <span className="text-xs font-bold text-white/60 truncate">{info.description}</span>
              </div>
              <div className="flex items-center gap-3 w-24 justify-end">
                <span className="text-sm font-black text-white">{Math.round(item.values.temperatureMax ?? item.values.temperature)}°</span>
                <span className="text-sm font-bold text-white/40">{Math.round(item.values.temperatureMin ?? item.values.temperature)}°</span>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
