import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, Loader2 } from 'lucide-react';
// 1. ADD THE IMPORT
import MovieCard from '../components/MovieCard';

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

  // 2. DELETED THE ENTIRE inline MediaCard component here!

  if (loading && page === 1) {
    return (
      <div className="h-screen bg-vfxBlack flex items-center justify-center text-aiAccent font-cinematic uppercase tracking-widest animate-pulse">
        Loading {countryName}...
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
            // 3. USING THE UNIVERSAL MOVIE CARD
            <MovieCard key={`${item.id}-${idx}`} item={item} index={idx} />
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