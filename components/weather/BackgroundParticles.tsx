"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface RainConfig {
  x: string;
  duration: number;
  delay: number;
}

interface CloudConfig {
  scale: number;
  x1: string;
  x2: string;
  y1: string;
  y2: string;
  duration: number;
}

export const BackgroundParticles = ({ weatherMain }: { weatherMain: string }) => {
  const [rainConfig, setRainConfig] = useState<RainConfig[]>([]);
  const [cloudConfig, setCloudConfig] = useState<CloudConfig[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setRainConfig(
      Array.from({ length: 40 }).map(() => ({
        x: Math.random() * 100 + "vw",
        duration: Math.random() * 0.8 + 0.4,
        delay: Math.random() * 2
      }))
    );

    setCloudConfig(
      Array.from({ length: 15 }).map(() => ({
        scale: Math.random() * 1 + 1,
        x1: Math.random() * 100 + "vw",
        x2: (Math.random() * 100 - 40) + "vw",
        y1: Math.random() * 100 + "vh",
        y2: (Math.random() * 100 - 40) + "vh",
        duration: Math.random() * 30 + 20
      }))
    );
    
    setMounted(true);
  }, []);
  
  if (!mounted) return null;

  const main = weatherMain.toLowerCase();

  if (main === "rain" || main === "drizzle") {
    return (
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {rainConfig.map((config, i) => (
          <motion.div
            key={i}
            initial={{ y: -100, x: config.x, opacity: 0 }}
            animate={{ 
              y: "110vh", 
              opacity: [0, 0.6, 0] 
            }}
            transition={{ 
              duration: config.duration, 
              repeat: Infinity, 
              delay: config.delay,
              ease: "linear"
            }}
            className="absolute w-[2px] h-14 bg-blue-200/40 will-change-transform"
          />
        ))}
      </div>
    );
  }

  if (main === "clear") {
    return (
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <motion.div
          animate={{ 
            scale: [1, 1.3, 1], 
            opacity: [0.2, 0.4, 0.2],
            rotate: [0, 360]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-15%] right-[-15%] w-[80vw] h-[80vw] bg-yellow-300/30 blur-[150px] rounded-full will-change-transform"
        />
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1], 
            opacity: [0.1, 0.3, 0.1],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-orange-400/20 blur-[120px] rounded-full will-change-transform"
        />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {cloudConfig.map((config, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: config.scale }}
          animate={{ 
            x: [config.x1, config.x2],
            y: [config.y1, config.y2],
            opacity: [0, 0.2, 0]
          }}
          transition={{ 
            duration: config.duration, 
            repeat: Infinity, 
            ease: "linear" 
          }}
          className="absolute w-64 h-64 bg-white/20 blur-[60px] rounded-full will-change-transform"
        />
      ))}
    </div>
  );
};
