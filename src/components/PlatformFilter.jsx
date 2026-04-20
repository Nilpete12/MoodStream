import React, { useState } from 'react';
import { motion } from 'framer-motion';

const platforms = [
  { id: 'all', name: 'All' },
  { id: 'netflix', name: 'Netflix' },
  { id: 'prime', name: 'Prime Video' },
  { id: 'disney', name: 'Disney+' },
  { id: 'max', name: 'HBO Max' },
  { id: 'apple', name: 'Apple TV+' },
  { id: 'chrunchy', name: 'Crunchy roll' },
];

const PlatformFilter = () => {
  const [activeId, setActiveId] = useState('all');

  return (
    <div className="sticky top-20 z-40 w-fit mx-auto bg-vfxBlack/70 backdrop-blur-lg border border-white/5 rounded-full px-4 py-2 items-center justify-center">
      {/* Note: The mt-[-50vh] pulls this bar UP so it sits right underneath 
        the MovieCurtain once the scroll animation finishes! 
      */}
      
      <div className="max-w-350 mx-auto flex overflow-x-auto no-scrollbar">
        {platforms.map((platform) => (
          <button
            key={platform.id}
            onClick={() => setActiveId(platform.id)}
            className="relative px-6 py-2.5 rounded-full text-sm font-bold tracking-wider uppercase whitespace-nowrap transition-colors"
          >
            {/* The sliding active background */}
            {activeId === platform.id && (
              <motion.div
                layoutId="activePlatform"
                className="absolute inset-0 bg-aiAccent rounded-full cursor-pointer"
                initial={false}
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            
            {/* The text */}
            <span className={`relative z-10 cursor-pointer ${activeId === platform.id ? 'text-white' : 'text-gray-400 hover:text-white'}`}>
              {platform.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default PlatformFilter;