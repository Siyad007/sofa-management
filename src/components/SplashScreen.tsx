'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function SplashScreen() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // 1.5s total display time before fade-out begins
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 1500); 
    return () => clearTimeout(timer);
  }, []);

  // Clean, high-fidelity Contemporary Sofa Paths
  const sofaBase = "M20 100 L180 100 L180 120 C180 125, 175 130, 170 130 L30 130 C25 130, 20 125, 20 120 Z";
  const sofaBack = "M30 100 L30 50 C30 40, 40 30, 50 30 L150 30 C160 30, 170 40, 170 50 L170 100";
  const sofaCushions = "M30 85 L170 85 M100 85 L100 130 M30 100 L170 100";
  const sofaArms = "M15 100 L15 70 C15 65, 20 60, 25 60 L45 60 L45 100 M155 100 L155 60 L175 60 C180 60, 185 65, 185 70 L185 100";

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.5, ease: [0.25, 1, 0.5, 1] }}
          className="fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center overflow-hidden select-none"
        >
          {/* Subtle Ambient Radial Glow (Hardware Accelerated, No Blur Filter) */}
          <div className="absolute w-[500px] h-[500px] bg-blue-600/[0.04] rounded-full pointer-events-none transform-gpu" />

          <div className="relative flex flex-col items-center">
            {/* SVG Sofa Cinematic Drawing - Super Fast & Optimized */}
            <motion.div
              initial={{ scale: 0.75, opacity: 0 }}
              animate={{ scale: 0.85, opacity: 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="relative w-48 h-36 mb-6 flex items-center justify-center transform-gpu"
            >
              <svg viewBox="0 0 200 150" className="w-full h-full drop-shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                {/* Armrests */}
                <motion.path
                  d={sofaArms}
                  fill="transparent"
                  stroke="white"
                  strokeWidth="2"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}
                />
                {/* Backrest */}
                <motion.path
                  d={sofaBack}
                  fill="transparent"
                  stroke="white"
                  strokeWidth="2"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
                />
                {/* Cushions */}
                <motion.path
                  d={sofaCushions}
                  fill="transparent"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeDasharray="3 3"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 0.35 }}
                  transition={{ duration: 0.6, ease: "easeOut", delay: 0.4 }}
                />
                {/* Base */}
                <motion.path
                  d={sofaBase}
                  fill="transparent"
                  stroke="white"
                  strokeWidth="2.5"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 0.7, ease: "easeOut", delay: 0.3 }}
                />
              </svg>
            </motion.div>

            {/* Cinematic Name Reveal - Decent and Elegant */}
            <div className="relative text-center">
              <motion.h1
                initial={{ letterSpacing: '1.2em', opacity: 0, y: 15 }}
                animate={{ letterSpacing: '0.5em', opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.25, 1, 0.5, 1], delay: 0.2 }}
                className="text-5xl font-black text-white mb-4 pl-[0.5em] tracking-wider transform-gpu"
              >
                DAXO
              </motion.h1>
              
              <motion.div
                initial={{ scaleX: 0, opacity: 0 }}
                animate={{ scaleX: 1, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.6, ease: "easeOut" }}
                className="h-[1px] w-48 mx-auto bg-gradient-to-r from-transparent via-blue-500/60 to-transparent mb-5"
              />

              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 0.7, y: 0 }}
                transition={{ delay: 0.6, duration: 0.6 }}
                className="text-[10px] font-black uppercase tracking-[0.6em] text-blue-400 pl-[0.6em]"
              >
                Digital Workshop
              </motion.p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
