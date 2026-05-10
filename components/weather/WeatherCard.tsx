"use client";

import { motion } from "framer-motion";
import { MapPin, Heart } from "lucide-react";
import { format } from "date-fns";
import Image from "next/image";

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

interface WeatherCardProps {
  data: WeatherData;
  onSave?: () => void;
  isSaved?: boolean;
  getWeatherInfo: (code: number) => { main: string; description: string; icon: string };
  generateVibeSummary: (temp: number, condition: string) => string;
}

export function WeatherCard({ data, onSave, isSaved, getWeatherInfo, generateVibeSummary }: WeatherCardProps) {
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
        <Image 
          src={`https://openweathermap.org/img/wn/${info.icon}@4x.png`} 
          alt={info.main}
          width={160}
          height={160}
          priority
          className="w-40 h-40 drop-shadow-2xl relative z-10"
        />
      </motion.div>

      <h1 className="text-8xl font-black tracking-tighter mb-2 drop-shadow-lg text-white">
        {temp}°
      </h1>
      <p className="text-lg font-bold text-white/60 mb-4 uppercase tracking-widest">
        Feels like {Math.round(current.values.temperatureApparent)}°
      </p>
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
