import React from 'react';
import { motion } from 'framer-motion';

const platforms = [
  { id: 'all', name: 'All', bg: '#0A84FF', text: 'text-white' },
  { id: 'netflix', name: 'Netflix', bg: '#E50914', text: 'text-white' },
  { id: 'prime', name: 'Prime Video', bg: '#00A8E1', text: 'text-white' },
  { id: 'disney', name: 'Disney+', bg: '#0063e5', text: 'text-white' },
  { id: 'max', name: 'HBO Max', bg: '#991EEB', text: 'text-white' },
  { id: 'apple', name: 'Apple TV+', bg: '#FFFFFF', text: 'text-black' } // Apple uses white pill, black text
];

const PlatformFilter = ({ activePlatform, setActivePlatform }) => {
  return (
    <div className="sticky top-20 z-40 w-fit mx-auto bg-vfxBlack/70 backdrop-blur-lg border border-white/5 rounded-full px-4 py-2 items-center justify-center">
      <div className="max-w-350 mx-auto flex gap-2 overflow-x-auto no-scrollbar">
        {platforms.map((platform) => {
          const isActive = activePlatform === platform.id;
          
          return (
            <button
              key={platform.id}
              onClick={() => setActivePlatform(platform.id)}
              className="relative px-6 py-2.5 rounded-full text-sm font-bold tracking-wider uppercase whitespace-nowrap transition-colors"
            >
              {isActive && (
                <motion.div
                  layoutId="activePlatform"
                  className="absolute inset-0 rounded-full shadow-lg"
                  style={{ backgroundColor: platform.bg }}
                  initial={false}
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              
              <span className={`relative z-10 ${isActive ? platform.text : 'text-gray-400 hover:text-white'}`}>
                {platform.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default PlatformFilter;