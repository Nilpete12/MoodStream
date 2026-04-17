import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';

const Hero = () => {
  const [query, setQuery] = useState('');
  const [movies, setMovies] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // 1. Fetch Trending Movies from YOUR Node.js Backend
  useEffect(() => {
    const fetchTrendingMovies = async () => {
      try {
        // Notice: No API keys here anymore! Just asking your own server for data.
        const response = await fetch('http://localhost:5000/api/movies/trending');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Keep only the top 10 movies that actually have backdrop images
        const topMovies = data.results.filter(m => m.backdrop_path).slice(0, 10);
        setMovies(topMovies);
      } catch (error) {
        console.error("Failed to fetch from backend:", error);
      }
    };

    fetchTrendingMovies();
  }, []);

  // 2. Setup the Carousel Timer (Change image every 6 seconds)
  useEffect(() => {
    if (movies.length === 0) return;

    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === movies.length - 1 ? 0 : prevIndex + 1
      );
    }, 6000); // 6000ms = 6 seconds

    return () => clearInterval(timer);
  }, [movies]);

  return (
    <div className="relative h-screen w-full bg-vfxBlack overflow-hidden flex items-center justify-center">
      
      {/* 3. The Cinematic Cross-Fade Backgrounds */}
      <AnimatePresence mode="wait">
        {movies.length > 0 && (
          <motion.div
            // Use the actual unique movie ID so Framer Motion knows it's a completely new image
            key={movies[currentIndex]?.id} 
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 0.5, scale: 1 }} 
            exit={{ opacity: 0 }} 
            transition={{ duration: 1.2, ease: "easeInOut" }}
            className="absolute inset-0 z-0 bg-cover bg-center"
            style={{ 
              // Added optional chaining (?.) as a safety net
              backgroundImage: `url('https://image.tmdb.org/t/p/original${movies[currentIndex]?.backdrop_path}')` 
            }}
          />
        )}
      </AnimatePresence>
      
      {/* Gradient Fade to Black at the bottom so it blends into the next section */}
      <div className="absolute inset-0 z-10 bg-linear-to-b from-vfxBlack/30 via-vfxBlack/60 to-vfxBlack" />

      {/* Main Content (The Search Bar) */}
      <div className="relative z-20 w-full max-w-4xl px-6 text-center mt-20">
        
        {/* Dynamic Movie Title Overlay (Subtle VFX touch) */}
        <AnimatePresence mode="wait">
          {movies.length > 0 && (
            <motion.div
              key={`title-${currentIndex}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.8 }}
              className="absolute -top-16 left-0 right-0 text-white/40 text-sm font-bold tracking-[0.3em] uppercase"
            >
            {movies[currentIndex].title || movies[currentIndex].name}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-5xl md:text-7xl font-bold text-white font-cinematic tracking-tighter mb-6"
        >
          Find your <span className="text-transparent bg-clip-text bg-linear-to-r from-aiAccent to-purple-400">next feeling.</span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="text-gray-400 text-lg md:text-xl mb-12"
        >
          Stop searching by genre. Tell our AI the exact vibe you want to experience.
        </motion.p>

        {/* The Search Input */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="relative group"
        >
          <div className="absolute -inset-1 bg-linear-to-r from-aiAccent/50 to-purple-500/50 rounded-full blur-md opacity-25 group-hover:opacity-60 transition duration-1000 group-hover:duration-200" />
          <div className="relative flex items-center bg-black/60 backdrop-blur-md border border-white/10 rounded-full p-2">
            <Sparkles className="text-gray-400 ml-4 w-6 h-6 shrink-0" />
            <input 
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g., A rainy night in Tokyo with a melancholic jazz soundtrack..."
              className="w-full bg-transparent text-white placeholder-gray-500 px-4 py-4 outline-none font-cinematic text-sm md:text-lg"
            />
            <button className="bg-white text-black px-8 py-3 rounded-full font-bold hover:bg-gray-200 transition-colors shrink-0">
              Discover
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Hero;