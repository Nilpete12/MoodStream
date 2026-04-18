import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

const Hero = () => {
  const [query, setQuery] = useState('');
  const [movies, setMovies] = useState([]);

  // 1. Fetch Movies
  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/movies/trending');
        const data = await response.json();
        // Grab 24 movies to fill our 4 columns perfectly
        setMovies(data.results.filter(m => m.poster_path).slice(0, 30));
      } catch (error) {
        console.error("Failed to fetch from backend:", error);
      }
    };
    fetchMovies();
  }, []);

  // 2. Split movies into 5 columns
  const col1 = movies.slice(0, 6);
  const col2 = movies.slice(6, 12);
  const col3 = movies.slice(12, 18);
  const col4 = movies.slice(18, 24);
  const col5 = movies.slice(24, 30);

  // 3. Reusable Scrolling Column Component
  const ScrollingColumn = ({ items, reverse = false, speed = 40 }) => {
    // Duplicate the array so it loops seamlessly
    const duplicatedItems = [...items, ...items];

    return (
      <div className="flex flex-col gap-4 w-[140px] sm:w-[200px] md:w-[240px] overflow-hidden">
        <motion.div
          animate={{
            // If reverse is true, scroll down. Otherwise, scroll up.
            y: reverse ? ["-50%", "0%"] : ["0%", "-50%"]
          }}
          transition={{
            repeat: Infinity,
            duration: speed,
            ease: "linear",
          }}
          className="flex flex-col gap-4"
        >
          {duplicatedItems.map((movie, idx) => (
            <div key={`${movie.id}-${idx}`} className="relative rounded-xl overflow-hidden aspect-[2/3] bg-vfxCharcoal border border-white/5">
              <img
                src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                alt={movie.title || movie.name}
                className="w-full h-full object-cover loading-lazy"
              />
              {/* Title overlay (appears on hover) */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex items-end p-4 opacity-0 hover:opacity-100 transition-opacity duration-300">
                <span className="text-white text-sm font-bold leading-tight font-cinematic shadow-black drop-shadow-md">
                  {movie.title || movie.name}
                </span>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    );
  };

  return (
    <div className="relative h-screen w-full bg-vfxBlack overflow-hidden flex items-center justify-center">
      
      {/* 4. The Scrolling Background Grids */}
      <div className="absolute inset-0 z-0 flex gap-4 md:gap-8 opacity-100 justify-center items-center rotate-[-4deg] scale-110">
        {movies.length > 0 && (
          <>
            {/* the less the faster */}
            <ScrollingColumn items={col1} speed={40} />
            <ScrollingColumn items={col2} reverse={true} speed={30} />
            <ScrollingColumn items={col3} speed={30} />
            <ScrollingColumn items={col4} reverse={true} speed={35} />
            <ScrollingColumn items={col5} speed={45} />
          </>
        )}
      </div>
      
      {/* 5. Heavy Gradient Overlay (Crucial so the text remains readable) */}
      <div className="absolute inset-0 z-10 bg-gradient-to-b from-vfxBlack/60 via-vfxBlack/80 to-vfxBlack" />
      
      {/* Vignette effect for the edges */}
      <div className="absolute inset-0 z-10 shadow-[inset_0_0_150px_rgba(5,5,5,1)] pointer-events-none" />

      {/* Main Content (The Search Bar) */}
      <div className="relative z-20 w-full max-w-4xl px-6 text-center mt-12">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-5xl md:text-7xl font-bold text-white font-cinematic tracking-tighter mb-6 drop-shadow-2xl"
        >
          Find your <span className="text-transparent bg-clip-text bg-gradient-to-r from-aiAccent to-purple-400">next feeling.</span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="text-gray-300 text-lg md:text-xl mb-12 drop-shadow-lg font-medium"
        >
          Stop searching by genre. Tell our AI the exact vibe you want to experience.
        </motion.p>

        {/* The Search Input */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="relative group mx-auto max-w-3xl"
        >
          <div className="absolute -inset-1 bg-gradient-to-r from-aiAccent/50 to-purple-500/50 rounded-full blur-md opacity-30 group-hover:opacity-70 transition duration-1000 group-hover:duration-200" />
          <div className="relative flex items-center bg-black/70 backdrop-blur-xl border border-white/20 rounded-full p-2 shadow-2xl">
            <Sparkles className="text-aiAccent ml-4 w-6 h-6 flex-shrink-0" />
            <input 
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g., A rainy night in Tokyo with a melancholic jazz soundtrack..."
              className="w-full bg-transparent text-white placeholder-gray-400 px-4 py-4 outline-none font-cinematic text-sm md:text-lg"
            />
            <button className="bg-white text-black px-8 py-3 rounded-full font-bold hover:bg-gray-200 transition-colors flex-shrink-0">
              Discover
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Hero;