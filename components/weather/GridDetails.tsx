"use client";

import { motion } from "framer-motion";
import { Wind, Droplets, Sun, Navigation } from "lucide-react";

export function GridDetails({ current }: { current: any }) {
  const details = [
    { icon: <Wind size={20} />, label: "Wind", value: `${current.values.windSpeed} m/s` },
    { icon: <Droplets size={20} />, label: "Humidity", value: `${current.values.humidity}%` },
    { icon: <Sun size={20} />, label: "UV Index", value: `${current.values.uvIndex || 0}`, sub: current.values.uvIndex > 5 ? "High" : "Low" },
    { icon: <Navigation size={20} />, label: "Pressure", value: `${Math.round(current.values.pressureSurfaceLevel)} hPa` },
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
