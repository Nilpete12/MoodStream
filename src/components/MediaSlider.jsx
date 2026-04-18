import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import MovieCard from './MovieCard';

const MediaSlider = ({ title, subtitle, apiEndpoint}) => {
  const [movies, setMovies] = useState([]);
  const scrollContainerRef = useRef(null);

  // Fetch movies dynamically based on the prop passed from Home.jsx
  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const res = await fetch(`http://localhost:5000${apiEndpoint}`);
        const data = await res.json();
        setMovies(data.results.slice(0, 15)); 
      } catch (error) {
        console.error(`Error fetching ${title}:`, error);
      }
    };
    fetchMovies();
  }, [apiEndpoint, title]);

  // Force scroll to left on load
  useEffect(() => {
    if (movies.length > 0 && scrollContainerRef.current) {
      setTimeout(() => {
        scrollContainerRef.current.scrollLeft = 0;
      }, 50); 
    }
  }, [movies]);

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -400 : 400;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    // Reduced vertical padding (py-12 instead of py-24) so multiple sliders stack nicely
    <section className="max-w-[1400px] mx-auto relative z-20 overflow-hidden py-4 px-4">
      
      <div className="flex justify-between items-end mb-8 md:mb-8 px-1 md:px-1">
        <div>
          <h2 className="text-2xl md:text-2xl font-black uppercase tracking-widest text-white mb-2">
            {title} <span className="text-gray-600">{subtitle}</span>
          </h2>
          <div className="h-1 w-24 bg-aiAccent rounded-full"></div>
        </div>
        
        <div className="hidden md:flex gap-3">
          <button 
            onClick={() => scroll('left')}
            className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white hover:text-black transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button 
            onClick={() => scroll('right')}
            className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white hover:text-black transition-colors"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </div>

      <div 
        ref={scrollContainerRef}
        className="flex gap-6 overflow-x-auto pb-10 snap-x snap-mandatory no-scrollbar "
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

        <motion.div 
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="min-w-59 md:min-w-59 snap-start flex items-center justify-center pr-6 md:pr-12"
        >
          <button className="group w-full h-77 md:h-69 rounded-xl border border-white/10 bg-vfxCharcoal/50 hover:bg-white/5 flex flex-col items-center justify-center gap-4 transition-all duration-300 shadow-2xl">
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

export default MediaSlider;