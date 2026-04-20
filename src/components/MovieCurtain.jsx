import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const MovieCurtain = () => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // The curtain stays for 1.5 seconds before triggering the exit animation
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 400);

    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          initial={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 15 }} // Massively scales up as it fades out
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="fixed inset-0 z-50 bg-vfxBlack flex flex-col items-center justify-center overflow-hidden pointer-events-none"
        >
          <h1 className="text-[15vw] font-black tracking-tighter text-white font-cinematic uppercase leading-none select-none origin-center">
            Movies
          </h1>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MovieCurtain;