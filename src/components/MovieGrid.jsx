import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Info, Star, ChevronLeft, ChevronRight } from 'lucide-react';

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
              <motion.div
                key={`${movie.id}-${currentPage}-${activePlatform}`} 
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: (index % 4) * 0.1, ease: "easeOut" }}
                className="relative group rounded-sm overflow-hidden bg-vfxCharcoal cursor-pointer shadow-2xl border border-white/5 col-span-1 aspect-2/3"
              >
                <img
                  src={`https://image.tmdb.org/t/p/w780${movie.poster_path}`}
                  alt={movie.title || movie.name}
                  className="w-full h-full object-cover transition-transform duration-[2s] ease-out group-hover:scale-110"
                />

                <div className="absolute inset-0 bg-linear-to-t from-black/95 via-black/40 to-transparent opacity-100 transition-all duration-500 flex flex-col justify-end py-6 px-3">
                  <motion.div
                    initial={{ y: 20 }}
                    whileHover={{ y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h3 className="text-white text-sm md:text-sm uppercase mb-1 font-sans">
                      {movie.title || movie.name}
                    </h3>
                    
                    <div className="flex items-center gap-1 text-gray-400 font-light text-sm mb-2">
                      <Star className="w-4 h-4 fill-current text-aiAccent" />
                      <span>{movie.vote_average?.toFixed(1)}</span>
                      {movie.runtime > 0 && (
                          <span className="ml-2 text-gray-400">
                            {Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m
                          </span>
                        )}
                      
                      
                      <div className="ml-auto font-light flex items-center gap-2">                       
                        <span className='text-gray-400'>{movie.release_date ? movie.release_date.split('-')[0] : ''}</span>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
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