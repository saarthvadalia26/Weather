"use client";

import { motion } from "framer-motion";
import { Wind, Droplets, Sun, Navigation, ShieldAlert, Eye } from "lucide-react";
import { WeatherTimelineValue, getAQIInfo } from "@/lib/weather-utils";

export function GridDetails({ current }: { current: WeatherTimelineValue }) {
  const uvValue = current.values.uvIndex ?? 0;
  const uvStatus = uvValue >= 8 ? "Very High" : uvValue >= 6 ? "High" : uvValue >= 3 ? "Moderate" : "Low";
  
  const aqiInfo = getAQIInfo(current.values.epaIndex);
  const visibilityKm = current.values.visibility !== undefined ? `${Math.round(current.values.visibility)} km` : "10 km";

  const details = [
    {
      icon: <Wind size={20} className="text-sky-400" />,
      label: "Wind Speed",
      value: `${current.values.windSpeed} m/s`,
      sub: current.values.windSpeed > 10 ? "Breezy" : "Gentle",
    },
    {
      icon: <Droplets size={20} className="text-blue-400" />,
      label: "Humidity",
      value: `${current.values.humidity}%`,
      sub: current.values.humidity > 70 ? "Humid" : current.values.humidity < 35 ? "Dry" : "Comfortable",
    },
    {
      icon: <Sun size={20} className="text-amber-400" />,
      label: "UV Index",
      value: `${uvValue}`,
      sub: uvStatus,
    },
    {
      icon: <Navigation size={20} className="text-indigo-400" />,
      label: "Pressure",
      value: `${Math.round(current.values.pressureSurfaceLevel)} hPa`,
      sub: "Surface",
    },
    {
      icon: <ShieldAlert size={20} className="text-emerald-400" />,
      label: "Air Quality",
      value: aqiInfo.label,
      sub: `EPA Index ${current.values.epaIndex ?? 1}`,
    },
    {
      icon: <Eye size={20} className="text-teal-400" />,
      label: "Visibility",
      value: visibilityKm,
      sub: "Clear line of sight",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.5 }}
      className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 w-full"
    >
      {details.map((detail, idx) => (
        <div
          key={idx}
          className="glass-card rounded-2xl p-4 flex flex-col items-center justify-center text-center gap-1 transition-all duration-300 hover:scale-[1.02]"
        >
          <div className="mb-0.5">{detail.icon}</div>
          <span className="text-[10px] sm:text-[11px] font-bold text-[var(--theme-text-muted)] uppercase tracking-wider">
            {detail.label}
          </span>
          <span className="text-base sm:text-lg font-black text-[var(--theme-text-primary)]">
            {detail.value}
          </span>
          {detail.sub && (
            <span className="text-[10px] font-medium text-[var(--theme-text-dim)] truncate max-w-full">
              {detail.sub}
            </span>
          )}
        </div>
      ))}
    </motion.div>
  );
}
