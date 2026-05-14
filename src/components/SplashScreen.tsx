'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function SplashScreen() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 4500); 
    return () => clearTimeout(timer);
  }, []);

  // Professional Contemporary Sofa Path
  const sofaBase = "M20 100 L180 100 L180 120 C180 125, 175 130, 170 130 L30 130 C25 130, 20 125, 20 120 Z";
  const sofaBack = "M30 100 L30 50 C30 40, 40 30, 50 30 L150 30 C160 30, 170 40, 170 50 L170 100";
  const sofaCushions = "M30 85 L170 85 M100 85 L100 130 M30 100 L170 100";
  const sofaArms = "M15 100 L15 70 C15 65, 20 60, 25 60 L45 60 L45 100 M155 100 L155 60 L175 60 C180 60, 185 65, 185 70 L185 100";

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, filter: 'blur(40px)', scale: 1.1 }}
          transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center overflow-hidden"
        >
          {/* Spatial Background - Deep Space */}
          <div className="absolute inset-0">
            {[...Array(30)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ 
                  opacity: [0, 0.4, 0],
                  scale: [0, 1.2, 0],
                }}
                transition={{ 
                  duration: 2 + Math.random() * 3, 
                  repeat: Infinity,
                  delay: Math.random() * 2
                }}
                className="absolute w-1.5 h-1.5 bg-blue-400 rounded-full blur-[2px]"
                style={{ 
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`
                }}
              />
            ))}
          </div>

          {/* Core Cinematic Glow */}
          <motion.div 
            animate={{ 
              scale: [1, 1.3, 1],
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            className="absolute w-[800px] h-[800px] bg-blue-600/10 blur-[200px] rounded-full"
          />

          <div className="relative flex flex-col items-center">
            {/* SVG Sofa Cinematic Drawing - Enhanced & Scaled for Mobile */}
            <motion.div
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 0.8, opacity: 1 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="relative w-64 h-48 mb-10 flex items-center justify-center"
            >
              <svg viewBox="0 0 200 150" className="w-full h-full drop-shadow-[0_0_40px_rgba(59,130,246,0.4)]">
                {/* Armrests */}
                <motion.path
                  d={sofaArms}
                  fill="transparent"
                  stroke="white"
                  strokeWidth="2"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 2, ease: "easeInOut", delay: 0.2 }}
                />
                {/* Backrest */}
                <motion.path
                  d={sofaBack}
                  fill="transparent"
                  stroke="white"
                  strokeWidth="2"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 2, ease: "easeInOut", delay: 0.5 }}
                />
                {/* Cushions */}
                <motion.path
                  d={sofaCushions}
                  fill="transparent"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 0.4 }}
                  transition={{ duration: 2, ease: "easeInOut", delay: 1 }}
                />
                {/* Base */}
                <motion.path
                  d={sofaBase}
                  fill="transparent"
                  stroke="white"
                  strokeWidth="2.5"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 2, ease: "easeInOut", delay: 0.8 }}
                />
              </svg>
              
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 2, duration: 2 }}
                className="absolute inset-0 bg-gradient-to-t from-blue-500/20 to-transparent blur-3xl rounded-full"
              />
            </motion.div>

            {/* Cinematic Name Reveal */}
            <div className="relative">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 2 }}
                className="absolute inset-0 bg-blue-500/5 blur-2xl"
              />
              
              <motion.h1
                initial={{ letterSpacing: '1.2em', opacity: 0, y: 30 }}
                animate={{ letterSpacing: '0.6em', opacity: 1, y: 0 }}
                transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}
                className="text-6xl md:text-8xl font-black text-white mb-6 text-center pl-[0.6em] relative z-10"
              >
                DAXO
              </motion.h1>
              
              <motion.div
                initial={{ scaleX: 0, opacity: 0 }}
                animate={{ scaleX: 1, opacity: 1 }}
                transition={{ delay: 1.5, duration: 1.5, ease: "circOut" }}
                className="h-[1px] bg-gradient-to-r from-transparent via-blue-500 to-transparent mb-8"
              />

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2.2, duration: 1.5 }}
                className="flex flex-col items-center gap-4"
              >
                <p className="text-[12px] font-black uppercase tracking-[0.8em] text-blue-400">
                  Digital Workshop
                </p>
                <div className="flex gap-1.5">
                  {[...Array(3)].map((_, i) => (
                    <motion.div
                      key={i}
                      animate={{ opacity: [0.2, 1, 0.2] }}
                      transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                      className="w-1.5 h-1.5 bg-blue-500 rounded-full"
                    />
                  ))}
                </div>
              </motion.div>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.2 }}
            transition={{ delay: 3, duration: 1.5 }}
            className="absolute bottom-20 flex flex-col items-center gap-2"
          >
            <p className="text-[9px] font-bold text-white uppercase tracking-[0.5em]">System Initializing</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
