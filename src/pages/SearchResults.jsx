import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, Loader2 } from 'lucide-react';
import MovieCard from '../components/MovieCard';

const SearchResults = () => {
  const { query } = useParams();
  const [results, setResults] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchSearchData = async () => {
      page === 1 ? setLoading(true) : setLoadingMore(true);
      try {
        const res = await fetch(`http://localhost:5000/api/movies/search?q=${query}&page=${page}`);
        const data = await res.json();
        
        // Exclude actors from the main grid to keep it media-focused, or keep them if you want!
        const mediaResults = data.results.filter(m => m.media_type !== 'person');

        if (page === 1) {
          setResults(mediaResults);
          setTotalPages(data.total_pages);
        } else {
          setResults(prev => [...prev, ...mediaResults]);
        }
      } catch (error) {
        console.error("Search fetch error:", error);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    };
    fetchSearchData();
  }, [query, page]);

  if (loading && page === 1) {
    return (
      <div className="h-screen bg-vfxBlack flex items-center justify-center text-aiAccent font-cinematic uppercase tracking-widest animate-pulse">
        Scanning Database for "{query}"...
      </div>
    );
  }

  return (
    <div className="bg-vfxBlack min-h-screen flex flex-col font-cinematic text-white py-16">
      
      <header className="h-24 md:h-32 border-b border-white/10 flex items-center justify-between px-6 md:px-12 bg-vfxBlack sticky top-0 z-50">
        <Link to="/" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors uppercase tracking-widest text-sm font-bold">
          <ChevronLeft className="w-5 h-5" /> Home
        </Link>
        <div className="text-right">
          <h1 className="text-xl md:text-3xl font-black uppercase tracking-widest text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
            Results for: <span className="text-aiAccent">"{query}"</span>
          </h1>
          <p className="text-gray-500 text-xs tracking-widest uppercase mt-1">
            {results.length} Titles Found
          </p>
        </div>
      </header>

      <div className="max-w-400 w-full mx-auto px-6 md:px-12 pt-12">
        {results.length === 0 ? (
          <div className="text-center py-24 text-gray-500 uppercase tracking-widest">
            No cinematic matches found for your query.
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-5 auto-rows-[minmax(250px,auto)]">
            {results.map((item, idx) => (
              <MovieCard key={`${item.id}-${idx}`} item={item} index={idx} />
            ))}
          </div>
        )}

        {page < totalPages && (
          <div className="mt-16 flex justify-center">
            <button 
              onClick={() => setPage(p => p + 1)} 
              disabled={loadingMore}
              className="px-8 py-4 border border-white/20 rounded-full text-sm font-bold tracking-widest uppercase hover:bg-white hover:text-black transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {loadingMore ? <><Loader2 className="w-5 h-5 animate-spin"/> Processing...</> : 'Load More Matches'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResults;