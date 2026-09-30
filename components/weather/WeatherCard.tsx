"use client";

import { motion } from "framer-motion";
import { MapPin } from "lucide-react";
import { format } from "date-fns";
import Image from "next/image";
import { WeatherData } from "@/lib/weather-utils";

interface WeatherCardProps {
  data: WeatherData;
  isDay?: boolean;
  getWeatherInfo: (code: number, isDay?: boolean) => { main: string; description: string; icon: string };
  generateVibeSummary: (temp: number, condition: string) => string;
}

export function WeatherCard({ data, isDay = true, getWeatherInfo, generateVibeSummary }: WeatherCardProps) {
  const current = data.timelines.hourly[0];
  const info = getWeatherInfo(current.values.weatherCode, isDay);
  const temp = Math.round(current.values.temperature);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="glass-card rounded-3xl p-6 sm:p-8 flex flex-col items-center justify-center text-center w-full relative overflow-hidden shadow-2xl transition-all duration-300"
    >
      <div className="w-full flex flex-col items-center gap-1 z-10 mb-2">
        <div className="flex items-center justify-center gap-1.5 w-full max-w-full px-2">
          <MapPin size={16} className="text-[var(--theme-text-muted)] shrink-0" />
          <h2 className="text-base sm:text-lg font-bold tracking-wide text-center text-[var(--theme-text-primary)] truncate max-w-[90%]">
            {data.location.name}
          </h2>
        </div>
        <span className="text-[11px] font-semibold text-[var(--theme-text-dim)] uppercase tracking-wider">
          Observed: {format(new Date(current.time), "HH:mm")}
        </span>
      </div>

      <motion.div
        initial={{ scale: 0.85 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 120, damping: 15 }}
        className="my-2 relative flex items-center justify-center"
      >
        <div className="absolute inset-0 bg-sky-400/20 blur-[50px] rounded-full scale-125 opacity-40 pointer-events-none" />
        <Image
          src={`https://openweathermap.org/img/wn/${info.icon}@4x.png`}
          alt={info.main}
          width={150}
          height={150}
          priority
          className="w-32 h-32 sm:w-36 sm:h-36 drop-shadow-xl relative z-10 select-none object-contain"
        />
      </motion.div>

      <h1 className="text-6xl sm:text-7xl md:text-8xl font-black tracking-tighter mb-1 drop-shadow-sm text-[var(--theme-text-primary)]">
        {temp}°
      </h1>
      
      <p className="text-xs sm:text-sm font-bold text-[var(--theme-text-muted)] mb-2 uppercase tracking-widest">
        Feels like {Math.round(current.values.temperatureApparent)}°
      </p>
      
      <p className="text-xl sm:text-2xl font-semibold tracking-wide text-[var(--theme-text-primary)] capitalize mb-5">
        {info.description}
      </p>

      <div className="glass-subtle rounded-2xl p-4 w-full text-left">
        <p className="text-xs sm:text-sm text-[var(--theme-text-secondary)] italic font-medium leading-relaxed">
          {generateVibeSummary(temp, info.description)}
        </p>
      </div>
    </motion.div>
  );
}
