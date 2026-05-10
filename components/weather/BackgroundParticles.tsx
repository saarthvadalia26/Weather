"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";

export const BackgroundParticles = ({ weatherMain }: { weatherMain: string }) => {
  const particles = useMemo(() => Array.from({ length: 40 }), []);
  
  const main = weatherMain.toLowerCase();

  if (main === "rain" || main === "drizzle") {
    return (
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {particles.map((_, i) => (
          <motion.div
            key={i}
            initial={{ y: -100, x: Math.random() * 100 + "vw", opacity: 0 }}
            animate={{ 
              y: "110vh", 
              opacity: [0, 0.6, 0] 
            }}
            transition={{ 
              duration: Math.random() * 0.8 + 0.4, 
              repeat: Infinity, 
              delay: Math.random() * 2,
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
      {particles.slice(0, 15).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: Math.random() * 1 + 1 }}
          animate={{ 
            x: [Math.random() * 100 + "vw", (Math.random() * 100 - 40) + "vw"],
            y: [Math.random() * 100 + "vh", (Math.random() * 100 - 40) + "vh"],
            opacity: [0, 0.2, 0]
          }}
          transition={{ 
            duration: Math.random() * 30 + 20, 
            repeat: Infinity, 
            ease: "linear" 
          }}
          className="absolute w-64 h-64 bg-white/20 blur-[60px] rounded-full will-change-transform"
        />
      ))}
    </div>
  );
};
