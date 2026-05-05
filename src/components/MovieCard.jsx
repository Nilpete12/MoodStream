import React from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { Link } from 'react-router-dom';

const MovieCard = ({ item, index = 0 }) => {
  if (!item) return null;

  // Determine if it's a TV show based on properties
  const isTV = item.media_type === 'tv' || item.first_air_date;
  const type = isTV ? 'tv' : 'movie';
  const title = item.title || item.name;
  const releaseDate = item.release_date || item.first_air_date;

  return (
    <Link to={`/details/${type}/${item.id}`}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.5, delay: (index % 5) * 0.1 }}
        className="relative group rounded-sm overflow-hidden bg-vfxCharcoal cursor-pointer shadow-2xl border border-white/5 aspect-2/3  "
      >
        {item.poster_path ? (
          <img
            src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-[2s] ease-out group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-900 text-gray-500 text-xs">
            No Image
          </div>
        )}

        {/* Dynamic Badge (Only shows if media_type is explicitly passed, useful for mixed Country/Genre grids) */}
        {item.media_type && (
          <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider text-white border border-white/10 z-10 shadow-lg">
            {isTV ? 'Series' : 'Movie'}
          </div>
        )}

        {/* Info Gradient Overlay */}
        <div className="absolute inset-0 bg-linear-to-t from-black/95 via-black/40 to-transparent opacity-100 flex flex-col justify-end p-4 transition-opacity duration-300">
          <h3 className="text-white text-sm md:text-base uppercase mb-1 font-semibold">
            {title}
          </h3>
          
          <div className="flex items-center gap-1 text-gray-400 font-light text-xs mb-1">
            <Star className="w-3.5 h-3.5 fill-current text-aiAccent" />
            <span>{item.vote_average?.toFixed(1)}</span>
            
            {item.runtime > 0 && (
              <span className="ml-1 text-gray-400 font-medium">
                • {Math.floor(item.runtime / 60)}h {item.runtime % 60}m
              </span>
            )}
            
            <div className="ml-auto font-light flex items-center gap-2">
              <span className='text-gray-400'>
                {releaseDate?.split('-')[0]}
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
};

export default MovieCard;