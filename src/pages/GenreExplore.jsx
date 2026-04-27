import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

// We map the official TMDB Genre IDs to iconic background images
const genres = [
  { id: 28, name: 'Action', bg: 'https://image.tmdb.org/t/p/original/7WsyChQLEftFiDOVTGkv3hFpyyt.jpg' }, // Avengers Infinity War
  { id: 878, name: 'Sci-Fi', bg: 'https://image.tmdb.org/t/p/original/8sNiAPPYU14PUepFNeSNGUTiHW.jpg' }, // Interstellar
  { id: 27, name: 'Horror', bg: 'https://image.tmdb.org/t/p/original/5ik4ATKmNtmJU6AYD0bLm56BCVM.jpg' }, // Evil Dead Rise
  { id: 16, name: 'Animation', bg: 'https://image.tmdb.org/t/p/original/w2nFc2Rsm93PDkvjY4LTn17ePO0.jpg' }, // Mutant tutles
  { id: 10749, name: 'Romance', bg: 'https://image.tmdb.org/t/p/original/ik2D3KqxFD0O0Bc3Wv1CZm8sOg8.jpg' }, // La La Land
  { id: 53, name: 'Thriller', bg: 'https://image.tmdb.org/t/p/original/bpp58yHuQmpt6xwggI63mVRw7po.jpg' }, // Send Help
  { id: 35, name: 'Comedy', bg: 'https://image.tmdb.org/t/p/original/e6ZyJ1BOk38frPkzICskIsYaztg.jpg' }, // The Hangover
  { id: 99, name: 'Documentary', bg: 'https://image.tmdb.org/t/p/original/4U9G4YwTlIEbHkO8qJqTjJYpXH.jpg' }, // Free Solo
  { id: 18, name: 'Drama', bg: 'https://image.tmdb.org/t/p/original/8j58iEBw9pOXFD2K1mmF1YjH3I.jpg' }, // The Godfather
  { id: 10751, name: 'Family', bg: 'https://image.tmdb.org/t/p/original/6tfTqjhbfdl2sYyJgZpGZqLQSR.jpg' }, // Paddington 2
  { id: 14, name: 'Fantasy', bg: 'https://image.tmdb.org/t/p/original/6aUWe0GSl69wMTSWWexS2C1D3.jpg' }, // Harry Potter
  
];

const GenreExplore = () => {
  const [hoveredIndex, setHoveredIndex] = useState(0); // Default to the first one

  return (
    <div className="relative min-h-screen bg-vfxBlack overflow-hidden flex items-center py-20">
      
      {/* 1. The Dynamic Background Crossfade */}
      <AnimatePresence mode="wait">
        <motion.div
          key={hoveredIndex}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 0.4, scale: 1 }} // Keeps it dark and moody
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="absolute inset-0 z-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${genres[hoveredIndex].bg})` }}
        />
      </AnimatePresence>

      {/* Gradient Vignette so the edges fade to black seamlessly */}
      <div className="absolute inset-0 z-0 bg-linear-to-r from-vfxBlack via-transparent to-vfxBlack opacity-90" />
      <div className="absolute inset-0 z-0 bg-linear-to-t from-vfxBlack via-transparent to-vfxBlack opacity-90" />

      {/* 2. The Massive Typography List */}
      <div className="relative z-10 w-full max-w-350 mx-auto px-6 md:px-12 flex flex-col items-center justify-center py-24 h-screen overflow-y-auto no-scrollbar">
        <div className="flex flex-col items-center gap-2 md:gap-4 w-full">
          {genres.map((genre, index) => {
            const isHovered = hoveredIndex === index;
            
            return (
              <Link 
                key={genre.id}
                to={`/genre/${genre.id}/${genre.name.toLowerCase()}`}
                onMouseEnter={() => setHoveredIndex(index)}
                className="relative group block w-full text-center"
              >
                {/* The Text */}
                <h1 
                  className={`text-[12vw] md:text-[5vw] font-black uppercase leading-none font-cinematic transition-all duration-500 ${
                    isHovered 
                      ? 'text-white scale-110 drop-shadow-[0_0_30px_rgba(255,255,255,0.3)]' 
                      : 'text-white/20 scale-100 hover:text-white/40'
                  }`}
                >
                  {genre.name}
                </h1>
                
                {/* Subtle underline indicator on hover */}
                <motion.div 
                  className="absolute left-1/2 bottom-0 h-1 bg-aiAccent -translate-x-1/2"
                  initial={{ width: 0 }}
                  animate={{ width: isHovered ? '20%' : 0 }}
                  transition={{ duration: 0.4 }}
                />
              </Link>
            );
          })}
        </div>
      </div>

    </div>
  );
};

export default GenreExplore;