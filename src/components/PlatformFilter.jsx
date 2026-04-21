import React from 'react';
import { motion } from 'framer-motion';

const platforms = [
  { id: 'all', name: 'All', bg: '#0A84FF', text: 'text-white' },
  { id: 'netflix', name: 'Netflix', bg: '#E50914', text: 'text-white' },
  { id: 'disney', name: 'Disney+', bg: '#0063e5', text: 'text-white' },
  { id: 'max', name: 'Max', bg: '#0047FF', text: 'text-white' }, // Updated name to Max
  { id: 'apple', name: 'Apple TV+', bg: '#FFFFFF', text: 'text-black' },
  { id: 'crunchyroll', name: 'Crunchyroll', bg: '#F47521', text: 'text-white' } // Added Crunchyroll
];

const PlatformFilter = ({ activePlatform, setActivePlatform }) => {
  return (
    <div className="sticky top-20 z-40 w-fit mx-auto bg-vfxBlack/50 backdrop-blur-lg border rounded-xl border-white/5 px-4 py-2 items-center justify-center" style={{ transform: 'skewX(-20deg)' }}>
      <div className="max-w-350 mx-auto flex gap-2 overflow-x-auto no-scrollbar" style={{ transform: 'skewX(-1deg)' }}>
        {platforms.map((platform) => {
          const isActive = activePlatform === platform.id;
          
          return (
            <button
              key={platform.id}
              onClick={() => setActivePlatform(platform.id)}
              className="relative px-6 py-2.5 rounded-lg text-sm font-bold tracking-wider uppercase whitespace-nowrap transition-colors"
            >
              {isActive && (
                <motion.div
                  layoutId="activePlatform"
                  className="absolute inset-0 rounded-lg shadow-lg"
                  style={{ backgroundColor: platform.bg }}
                  initial={false}
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              
              <span 
                className={`relative z-10 inline-block ${isActive ? platform.text : 'text-gray-400 hover:text-white'}`}
                style={{ transform: 'skewX(20deg)' }} 
              > {platform.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default PlatformFilter;