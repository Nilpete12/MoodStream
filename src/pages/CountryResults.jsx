import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, Star, Loader2 } from 'lucide-react';

const CountryResults = () => {
  // Grab the parameters passed by the Map click
  const { isoCode, countryName } = useParams();
  
  const [media, setMedia] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    const fetchCountryData = async () => {
      page === 1 ? setLoading(true) : setLoadingMore(true);
      try {
        const res = await fetch(`http://localhost:5000/api/movies/by-country/${isoCode}?page=${page}`);
        const data = await res.json();
        
        // Filter out any broken images just to keep the grid looking premium
        const validMedia = data.results.filter(m => m.poster_path);

        if (page === 1) {
          setMedia(validMedia);
        } else {
          // Append new data to the bottom for infinite-scroll feel
          setMedia(prev => [...prev, ...validMedia]);
        }
      } catch (error) {
        console.error("Failed to fetch country media:", error);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    };
    fetchCountryData();
  }, [isoCode, page]);

  // Reusable Media Card
  const MediaCard = ({ item, index }) => (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: (index % 5) * 0.1 }} // Staggered reveal
      className="relative group rounded-sm overflow-hidden bg-vfxCharcoal cursor-pointer shadow-2xl border border-white/5 aspect-2/3"
    >
      <img
        src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
        alt={item.title || item.name}
        className="w-full h-full object-cover transition-transform duration-[2s] ease-out group-hover:scale-110"
      />
      
      {/* Media Type Badge (Movie vs TV) */}
      <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider text-white border border-white/10 z-10 shadow-lg">
        {item.media_type === 'tv' ? 'Series' : 'Movie'}
      </div>

      <div className="absolute inset-0 bg-linear-to-t from-black/95 via-black/40 to-transparent opacity-100 flex flex-col justify-end p-4 transition-opacity duration-300">
        <h3 className="text-white text-sm md:text-base uppercase mb-1 font-semibold">
          {item.title || item.name}
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
              {(item.release_date || item.first_air_date)?.split('-')[0]}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );

  if (loading && page === 1) {
    return (
      <div className="h-screen bg-vfxBlack flex items-center justify-center text-aiAccent font-cinematic uppercase tracking-widest animate-pulse">
        Loading {countryName} Database...
      </div>
    );
  }

  return (
    <div className="bg-vfxBlack min-h-screen flex flex-col font-cinematic text-white py-16">
      
      {/* Header */}
      <header className="h-24 md:h-32 border-b border-white/10 flex items-center justify-between px-6 md:px-12 bg-vfxBlack sticky top-0 z-50">
        <Link to="/country" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors uppercase tracking-widest text-sm font-bold">
          <ChevronLeft className="w-5 h-5" /> Global Map
        </Link>
        <div className="text-right">
          <h1 className="text-2xl md:text-4xl font-black uppercase tracking-widest text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
            {countryName}
          </h1>
          <p className="text-gray-500 text-xs tracking-widest uppercase mt-1">
            Top Rated Media
          </p>
        </div>
      </header>

      {/* Grid */}
      <div className="max-w-400 w-full mx-auto px-6 md:px-12 pt-12">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-5 auto-rows-[minmax(250px,auto)]">
          {media.map((item, idx) => (
            // Using ID + idx to prevent React key errors if TMDB returns a duplicate on a new page
            <MediaCard key={`${item.id}-${idx}`} item={item} index={idx} />
          ))}
        </div>

        {/* Load More Button */}
        <div className="mt-16 flex justify-center">
          <button 
            onClick={() => setPage(p => p + 1)} 
            disabled={loadingMore}
            className="px-8 py-4 border border-white/20 rounded-full text-sm font-bold tracking-widest uppercase hover:bg-white hover:text-black transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {loadingMore ? <><Loader2 className="w-5 h-5 animate-spin"/> Processing...</> : 'Load More Releases'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CountryResults;