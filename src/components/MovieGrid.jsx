import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Info, Star, ChevronLeft, ChevronRight } from 'lucide-react';

const MovieGrid = () => {
  const [movies, setMovies] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 20; // Hardcoded limit as requested

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        // Fetch data specifically for the current page
        const res = await fetch(`http://localhost:5000/api/movies/only-movies?page=${currentPage}`);
        const data = await res.json();
        
        // Filter for movies that have BOTH images
        const validMovies = data.results.filter(m => m.poster_path && m.backdrop_path);
        
        // Slice to exactly 24 titles
        setMovies(validMovies.slice(0, 24)); 
      } catch (error) {
        console.error("Failed to fetch movies:", error);
      }
    };
    
    fetchMovies();
    
    // Smoothly scroll back to the top of the grid when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]); // Re-run whenever currentPage changes

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(prev => prev - 1);
  };

  return (
    <section className="relative z-10 w-full pb-24 pt-10">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-4 auto-rows-[minmax(250px,auto)]">
        
        {movies.map((movie, index) => {
          const isWide = index % 5 === 0 || index === 3;

          return (
            <motion.div
              key={`${movie.id}-${currentPage}`} // Forces re-animation on page change
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: (index % 4) * 0.1, ease: "easeOut" }}
              className={`relative group rounded overflow-hidden bg-vfxCharcoal cursor-pointer shadow-2xl border border-white/5 ${
                isWide ? 'col-span- ' : 'col-span-1 aspect-2/3'
              }`}
            >
              {/* Dynamic Image Selection */}
              <img
                src={`https://image.tmdb.org/t/p/w780${isWide ? movie.backdrop_path : movie.poster_path}`}
                alt={movie.title || movie.name}
                className="w-full h-full object-cover transition-transform duration-[2s] ease-out group-hover:scale-110"
              />

              {/* Hover Overlay - Darkens and slides up text */}
              <div className="absolute inset-0 bg-linear-to-t from-black/95 via-black/20 to-transparent opacity-100 transition-all duration-500 flex flex-col justify-end p-4 md:p-6">
                
                <motion.div
                  initial={{ y: 20 }}
                  whileHover={{ y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <h3 className="text-white font-black text-lg md:text-xl uppercase tracking-widest mb-1 font-cinematic line-clamp-1">
                    {movie.title || movie.name}
                  </h3>
                  
                  {/* Rating Icon and Number */}
                  <div className="flex items-center gap-1.5 text-aiAccent font-bold text-sm mb-2">
                    <Star className="w-4 h-4 fill-current" />
                    <span>{movie.vote_average?.toFixed(1)}</span>
                  </div>
                  
                  <p className="text-gray-400 text-xs md:text-sm line-clamp-2 mb-4 font-medium">
                    {movie.overview}
                  </p>
                </motion.div>

              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-center gap-6 mt-16">
        <button 
          onClick={handlePrevPage}
          disabled={currentPage === 1}
          className="flex items-center gap-2 px-6 py-3 rounded-full border border-white/20 bg-vfxCharcoal text-white font-bold uppercase tracking-widest text-sm hover:bg-white hover:text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-5 h-5" /> Prev
        </button>
        
        <span className="text-gray-400 font-bold tracking-widest text-sm uppercase">
          Page <span className="text-white">{currentPage}</span> of {totalPages}
        </span>
        
        <button 
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
          className="flex items-center gap-2 px-6 py-3 rounded-full border border-white/20 bg-vfxCharcoal text-white font-bold uppercase tracking-widest text-sm hover:bg-white hover:text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next <ChevronRight className="w-5 h-5" />
        </button>
      </div>

    </section>
  );
};

export default MovieGrid;