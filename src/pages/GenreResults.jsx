import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, Star, Loader2 } from 'lucide-react';

const GenreResults = () => {
  const { genreId, genreName } = useParams();
  const [data, setData] = useState({ movies: [], tv: [] });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    const fetchGenreData = async () => {
      page === 1 ? setLoading(true) : setLoadingMore(true);
      try {
        const res = await fetch(`http://localhost:5000/api/movies/by-genre/${genreId}?page=${page}`);
        const result = await res.json();
        
        if (page === 1) {
          setData(result);
        } else {
          // Append new data to the arrays for a seamless scrolling experience
          setData(prev => ({
            movies: [...prev.movies, ...result.movies],
            tv: [...prev.tv, ...result.tv]
          }));
        }
      } catch (error) {
        console.error("Failed to fetch genre:", error);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    };
    fetchGenreData();
  }, [genreId, page]);

  const MediaCard = ({ item }) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      className="relative group rounded-sm overflow-hidden bg-vfxCharcoal cursor-pointer shadow-2xl border border-white/5 aspect-2/3"
    >
      <img
        src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
        alt={item.title || item.name}
        className="w-full h-full object-cover transition-transform duration-[2s] ease-out group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-linear-to-t from-black/95 via-black/40 to-transparent opacity-100 flex flex-col justify-end p-4">
        <h3 className="text-white text-sm uppercase mb-1 font-semibold">
          {item.title || item.name}
        </h3>
        <div className="flex items-center gap-1 text-gray-400 font-light text-xs mb-1">
          <Star className="w-3.5 h-3.5 fill-current text-aiAccent" />
          <span>{item.vote_average?.toFixed(1)}</span>
          {item.runtime > 0 && (
            <span className="ml-1 text-gray-500 font-medium">
              • {Math.floor(item.runtime / 60)}h {item.runtime % 60}m
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );

  if (loading) {
    return (
      <div className="h-screen bg-vfxBlack flex items-center justify-center text-aiAccent font-cinematic uppercase tracking-widest animate-pulse">
        Loading {genreName}
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
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {data.movies.map((movie, idx) => (
                // Use a combination of id and index to ensure unique keys when appending
                <MediaCard key={`movie-${movie.id}-${idx}`} item={movie} />
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
          </div>
        </div>

        {/* RIGHT PANEL: TV SHOWS */}
        <div className="w-full md:w-1/2 h-full flex flex-col bg-black/20">
          <div className="py-4 bg-vfxBlack/90 backdrop-blur-sm z-10 text-center border-b border-white/5">
            <h2 className="text-aiAccent tracking-widest uppercase font-medium text-sm">Series</h2>
          </div>
          <div className="flex-1 overflow-y-auto no-scrollbar p-6 pb-24">
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {data.tv.map((show, idx) => (
                <MediaCard key={`tv-${show.id}-${idx}`} item={show} />
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
          </div>
        </div>

      </div>
    </div>
  );
};

export default GenreResults;