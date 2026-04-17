import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import MovieCard from './MovieCard';

const TrendingGrid = () => {
  const [movies, setMovies] = useState([]);
  const scrollContainerRef = useRef(null);

  // Fetch movies from your Node.js backend
  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/movies/trending');
        const data = await res.json();
        // Fetch a bit more (12 movies) to make the scrolling satisfying
        setMovies(data.results.slice(0, 12)); 
      } catch (error) {
        console.error("Error fetching trending movies:", error);
      }
    };
    fetchMovies();
  }, []);

  // 2. THE BUG FIX: Force scroll to the extreme left when movies load
  useEffect(() => {
    if (movies.length > 0 && scrollContainerRef.current) {
      // Small timeout ensures Framer Motion has painted the initial DOM
      setTimeout(() => {
        scrollContainerRef.current.scrollLeft = 0;
      }, 50); 
    }
  }, [movies]);

  // Custom smooth scroll functions for the buttons
  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -400 : 400;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto relative z-20 overflow-hidden">
      
      {/* Section Header with Scroll Controls */}
      <div className="flex justify-between items-end mb-8 md:mb-12">
        <div>
          <h2 className="text-3xl md:text-3xl font-black uppercase tracking-widest text-white mb-4">
            Trending <span className="text-gray-600">Now</span>
          </h2>
          <div className="h-1 w-24 bg-aiAccent rounded-full"></div>
        </div>
        
        {/* Custom Navigation Arrows */}
        <div className="hidden md:flex gap-4">
          <button 
            onClick={() => scroll('left')}
            className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white hover:text-black transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button 
            onClick={() => scroll('right')}
            className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white hover:text-black transition-colors"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Horizontal Scroll Container */}
      <div 
        ref={scrollContainerRef}
        className="flex gap-6 overflow-x-auto pb-10 snap-x snap-mandatory no-scrollbar"
      >
        {movies.map((movie, index) => (
          <motion.div
            key={movie.id}
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: index * 0.05, ease: "easeOut" }}
            className="min-w-44 md:min-w-44 snap-start"
          >
            <MovieCard movie={movie} />
          </motion.div>
        ))}

        {/* The "View More" Card at the end */}
        <motion.div 
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="min-w-45 md:min-w-45 snap-start flex items-center justify-center"
        >
          <button className="group w-full h-80 md:h-65 rounded-xl border border-white/10 bg-vfxCharcoal/50 hover:bg-white/5 flex flex-col items-center justify-center gap-4 transition-all duration-300 shadow-2xl cursor-pointer">
            <div className="w-16 h-16 rounded-full bg-aiAccent/20 text-aiAccent flex items-center justify-center group-hover:scale-110 group-hover:bg-aiAccent group-hover:text-white transition-all duration-300">
              <ArrowRight className="w-8 h-8" />
            </div>
            <span className="text-white font-bold uppercase tracking-widest">Explore All</span>
          </button>
        </motion.div>

      </div>

    </section>
  );
};

export default TrendingGrid;