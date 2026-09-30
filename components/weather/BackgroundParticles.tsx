"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface RainConfig {
  x: string;
  duration: number;
  delay: number;
}

interface SnowConfig {
  x: string;
  size: number;
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

export const BackgroundParticles = ({
  weatherMain,
  isLight = false,
}: {
  weatherMain: string;
  isLight?: boolean;
}) => {
  const [rainConfig, setRainConfig] = useState<RainConfig[]>([]);
  const [snowConfig, setSnowConfig] = useState<SnowConfig[]>([]);
  const [cloudConfig, setCloudConfig] = useState<CloudConfig[]>([]);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(motionQuery.matches);

    const rainCount = isMobile ? 18 : 36;
    const snowCount = isMobile ? 16 : 30;
    const cloudCount = isMobile ? 5 : 10;

    setRainConfig(
      Array.from({ length: rainCount }).map(() => ({
        x: Math.random() * 100 + "vw",
        duration: Math.random() * 0.7 + 0.5,
        delay: Math.random() * 2,
      }))
    );

    setSnowConfig(
      Array.from({ length: snowCount }).map(() => ({
        x: Math.random() * 100 + "vw",
        size: Math.random() * 4 + 3,
        duration: Math.random() * 4 + 4,
        delay: Math.random() * 3,
      }))
    );

    setCloudConfig(
      Array.from({ length: cloudCount }).map(() => ({
        scale: Math.random() * 0.8 + 1,
        x1: Math.random() * 100 + "vw",
        x2: Math.random() * 100 - 30 + "vw",
        y1: Math.random() * 100 + "vh",
        y2: Math.random() * 100 - 30 + "vh",
        duration: Math.random() * 30 + 25,
      }))
    );

    setMounted(true);
  }, []);

  if (!mounted || reducedMotion) return null;

  const main = weatherMain.toLowerCase();

  // Snow
  if (main === "snow") {
    return (
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
        {snowConfig.map((config, i) => (
          <motion.div
            key={i}
            initial={{ y: -20, x: config.x, opacity: 0 }}
            animate={{
              y: "105vh",
              x: `calc(${config.x} + ${Math.sin(i) * 30}px)`,
              opacity: [0, 0.8, 0],
            }}
            transition={{
              duration: config.duration,
              repeat: Infinity,
              delay: config.delay,
              ease: "linear",
            }}
            style={{ width: config.size, height: config.size }}
            className={`absolute rounded-full ${
              isLight ? "bg-indigo-300/60" : "bg-white/70"
            } blur-[1px] will-change-transform`}
          />
        ))}
      </div>
    );
  }

  // Rain & Drizzle
  if (main === "rain" || main === "drizzle") {
    return (
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
        {rainConfig.map((config, i) => (
          <motion.div
            key={i}
            initial={{ y: -80, x: config.x, opacity: 0 }}
            animate={{
              y: "110vh",
              opacity: [0, isLight ? 0.7 : 0.5, 0],
            }}
            transition={{
              duration: config.duration,
              repeat: Infinity,
              delay: config.delay,
              ease: "linear",
            }}
            className={`absolute w-[2px] h-12 ${
              isLight ? "bg-sky-600/50" : "bg-blue-200/40"
            } will-change-transform`}
          />
        ))}
      </div>
    );
  }

  // Clear skies
  if (main === "clear") {
    return (
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
        <motion.div
          animate={{
            scale: [1, 1.25, 1],
            opacity: isLight ? [0.2, 0.35, 0.2] : [0.15, 0.35, 0.15],
            rotate: [0, 360],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[10%] -right-[10%] w-[70vw] sm:w-[50vw] h-[70vw] sm:h-[50vw] bg-yellow-400/25 blur-[120px] rounded-full will-change-transform"
        />
        <motion.div
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.1, 0.25, 0.1],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute -bottom-[10%] -left-[10%] w-[50vw] sm:w-[40vw] h-[50vw] sm:h-[40vw] bg-amber-400/20 blur-[100px] rounded-full will-change-transform"
        />
      </div>
    );
  }

  // Thunderstorm
  if (main === "thunderstorm") {
    return (
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
        {rainConfig.slice(0, 24).map((config, i) => (
          <motion.div
            key={i}
            initial={{ y: -80, x: config.x, opacity: 0 }}
            animate={{
              y: "110vh",
              opacity: [0, 0.6, 0],
            }}
            transition={{
              duration: config.duration * 0.75,
              repeat: Infinity,
              delay: config.delay,
              ease: "linear",
            }}
            className="absolute w-[2px] h-14 bg-purple-200/50 will-change-transform"
          />
        ))}
      </div>
    );
  }

  // Clouds (default)
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
      {cloudConfig.map((config, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: config.scale }}
          animate={{
            x: [config.x1, config.x2],
            y: [config.y1, config.y2],
            opacity: isLight ? [0, 0.15, 0] : [0, 0.18, 0],
          }}
          transition={{
            duration: config.duration,
            repeat: Infinity,
            ease: "linear",
          }}
          className={`absolute w-56 sm:w-72 h-56 sm:h-72 ${
            isLight ? "bg-white/40" : "bg-white/15"
          } blur-[70px] rounded-full will-change-transform`}
        />
      ))}
    </div>
  );
};
