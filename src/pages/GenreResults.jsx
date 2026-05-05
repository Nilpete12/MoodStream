import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, Loader2 } from 'lucide-react';
// 1. ADD THE IMPORT
import MovieCard from '../components/MovieCard';

const GenreResults = () => {
  const { genreId, genreName } = useParams();
  const [data, setData] = useState({ movies: [], tv: [] });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGenreData = async () => {
      if (page === 1) setLoading(true);
      else setLoadingMore(true);
      
      try {
        const res = await fetch(`http://localhost:5000/api/movies/by-genre/${genreId}?page=${page}`);
        if (!res.ok) throw new Error(`API error: ${res.status}`);
        
        const result = await res.json();
        console.log(`✅ Fetched genre data for ${genreId}, page ${page}:`, result);
        
        if (page === 1) {
          setData(result || { movies: [], tv: [] });
        } else {
          setData(prev => ({
            movies: [...prev.movies, ...(result.movies || [])],
            tv: [...prev.tv, ...(result.tv || [])]
          }));
        }
        setError(null);
      } catch (error) {
        console.error(`❌ Failed to fetch genre ${genreId}:`, error);
        setError(error.message);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    };
    
    if (genreId) fetchGenreData();
  }, [genreId, page]);

  if (loading) {
    return (
      <div className="h-screen bg-vfxBlack flex items-center justify-center text-aiAccent font-cinematic uppercase tracking-widest animate-pulse">
        Loading {genreName || 'genre'}...
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen bg-vfxBlack flex items-center justify-center text-red-500 font-cinematic uppercase tracking-widest text-center px-8">
        <div>
          <p className="text-xl mb-2">⚠️ Error loading {genreName}</p>
          <p className="text-sm text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-vfxBlack h-screen flex flex-col overflow-hidden text-white pt-14">
      
      <header className="h-20 shrink-0 border-b border-white/10 flex items-center px-6 md:px-12 bg-vfxBlack z-20">
        <Link to="/genres" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors uppercase tracking-widest text-sm font-medium">
          <ChevronLeft className="w-5 h-5" /> Back to Genres
        </Link>
        <h1 className="mx-auto absolute left-1/2 -translate-x-1/2 text-2xl md:text-3xl font-normal uppercase tracking-widest text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
          {genreName}
        </h1>
      </header>

      <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
        
        
        {/* LEFT PANEL: MOVIES */}
        <div className="w-full md:w-1/2 h-full flex flex-col border-r border-white/10">
          <div className="py-4 bg-vfxBlack/90 backdrop-blur-sm z-10 text-center border-b border-white/5">
            <h2 className="text-aiAccent tracking-widest uppercase font-medium text-sm">Movies</h2>
          </div>
          <div className="flex-1 overflow-y-auto no-scrollbar p-6 pb-24">
            {data.movies && data.movies.length > 0 ? (
              <>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                  {data.movies.map((movie, idx) => (
                    <MovieCard key={`movie-${movie.id}-${idx}`} item={movie} index={idx} />
                  ))}
                </div>
                {/* Load More Button */}
                <div className="mt-8 flex justify-center pb-8">
                   <button 
                     onClick={() => setPage(p => p + 1)} 
                     disabled={loadingMore}
                     className="px-6 py-3 border border-white/20 rounded-full text-xs font-bold tracking-widest uppercase hover:bg-white hover:text-black transition-colors disabled:opacity-50 flex items-center gap-2"
                   >
                     {loadingMore ? <><Loader2 className="w-4 h-4 animate-spin"/> Loading...</> : 'Load More Movies'}
                   </button>
                </div>
              </>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                No movies found in this genre
              </div>
            )}
          </div>
        </div>

        {/* RIGHT PANEL: TV SHOWS */}
        <div className="w-full md:w-1/2 h-full flex flex-col bg-black/20">
          <div className="py-4 bg-vfxBlack/90 backdrop-blur-sm z-10 text-center border-b border-white/5">
            <h2 className="text-aiAccent tracking-widest uppercase font-medium text-sm">Series</h2>
          </div>
          <div className="flex-1 overflow-y-auto no-scrollbar p-6 pb-24">
            {data.tv && data.tv.length > 0 ? (
              <>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                  {data.tv.map((show, idx) => (
                    <MovieCard key={`tv-${show.id}-${idx}`} item={show} index={idx} />
                  ))}
                </div>
                {/* Load More Button */}
                <div className="mt-8 flex justify-center pb-8">
                   <button 
                     onClick={() => setPage(p => p + 1)} 
                     disabled={loadingMore}
                     className="px-6 py-3 border border-white/20 rounded-full text-xs font-bold tracking-widest uppercase hover:bg-[#00A8E1] hover:border-[#00A8E1] transition-colors disabled:opacity-50 flex items-center gap-2"
                   >
                     {loadingMore ? <><Loader2 className="w-4 h-4 animate-spin"/> Loading...</> : 'Load More Series'}
                   </button>
                </div>
              </>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                No series found in this genre
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default GenreResults;