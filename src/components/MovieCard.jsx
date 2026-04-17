import React from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

const MovieCard = ({ movie }) => {
  const posterUrl = `https://image.tmdb.org/t/p/w500${movie.poster_path}`;
  if (!movie.poster_path) return null;

  // TMDB uses 'title' for movies and 'name' for TV shows
  const displayTitle = movie.title || movie.name;
  
  // TMDB uses 'release_date' for movies and 'first_air_date' for TV shows
  const displayDate = movie.release_date || movie.first_air_date;

  return (
    <motion.div
      whileHover={{ y: -10, scale: 1.02 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="relative group rounded-xl overflow-hidden cursor-pointer bg-vfxCharcoal border border-white/5 shadow-2xl"
    >
      <div className="aspect-2/3 w-full bg-black/50">
        <img 
          src={posterUrl} 
          alt={displayTitle} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
        />
      </div>

      <div className="absolute inset-0 bg-linear-to-t from-black via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5">
        
        {/* Dynamic Badge for TV vs Movie */}
        <span className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-xs font-bold uppercase tracking-wider text-white border border-white/10">
          {movie.media_type === 'tv' ? 'TV Series' : 'Movie'}
        </span>

        <h3 className="text-white font-bold text-lg leading-tight mb-3 font-cinematic">
          {displayTitle}
        </h3>
        
        <div className="flex items-center justify-between text-sm text-gray-300 font-semibold">
          <div className="flex items-center gap-1.5">
            <Star className="w-4 h-4 text-aiAccent fill-aiAccent" />
            <span>{movie.vote_average?.toFixed(1)}</span>
          </div>
          {/* Grab just the year from the date string */}
          <span>{displayDate?.split('-')[0]}</span>
        </div>
        
      </div>
    </motion.div>
  );
};

export default MovieCard;