import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Info, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import MovieCard from './MovieCard';

// 1. Accept the activePlatform prop
const MovieGrid = ({ activePlatform, type = "only-movies" }) => {
  const [movies, setMovies] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false); 
  const totalPages = 20; 

  // 2. Reset to page 1 whenever the filter changes!
  useEffect(() => {
    setCurrentPage(1);
  }, [activePlatform]);

  useEffect(() => {
    const fetchMovies = async () => {
      setLoading(true); 
      try {
        // 3. Send both the page AND the provider to the backend
        const res = await fetch(`http://localhost:5000/api/movies/${type}?page=${currentPage}&provider=${activePlatform}`); // Cache buster
        const data = await res.json();
        
        const validMovies = data.results.filter(m => m.poster_path && m.backdrop_path);
        setMovies(validMovies.slice(0, 24)); 
      } catch (error) {
        console.error("Failed to fetch movies:", error);
      } finally {
        setLoading(false); 
      }
    };
    
    fetchMovies();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
  // 4. Add activePlatform to the dependency array
  }, [currentPage, activePlatform, type]); 

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(prev => prev - 1);
  };

  return (
    <section className="relative z-10 w-full pb-24 pt-12">
      <h1 className="text-xl font-semibold text-white uppercase tracking-widest font-cinematic flex col-span-full mb-8">
        {activePlatform === 'all' ? (type === 'only-tv' ? 'Popular TV Shows' : 'Popular Movies') : `${activePlatform} ${type === 'only-tv' ? 'TV Shows' : 'Movies'}`}
      </h1>
        
      {loading ?  (
        <div className="h-[60vh] flex items-center justify-center text-aiAccent font-cinematic uppercase tracking-widest animate-pulse">
          Loading...
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-5 auto-rows-[minmax(250px,auto)]">
          {movies.map((movie, index) => {
            return (
              <MovieCard 
                key={`${movie.id}-${currentPage}-${activePlatform}`} 
                item={movie} 
                index={index}
              />
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      <div className="flex items-center justify-center gap-6 mt-16">
        <button 
          onClick={handlePrevPage}
          disabled={currentPage === 1 || loading}
          className="flex items-center gap-2 px-6 py-3 rounded-full border border-white/20 bg-vfxCharcoal text-white font-bold uppercase tracking-widest text-sm hover:bg-white hover:text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-5 h-5" /> Prev
        </button>
        
        <span className="text-gray-400 font-bold tracking-widest text-sm uppercase">
          Page <span className="text-white">{currentPage}</span> of {totalPages}
        </span>
        
        <button 
          onClick={handleNextPage}
          disabled={currentPage === totalPages || loading}
          className="flex items-center gap-2 px-6 py-3 rounded-full border border-white/20 bg-vfxCharcoal text-white font-bold uppercase tracking-widest text-sm hover:bg-white hover:text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </section>
  );
};

export default MovieGrid;