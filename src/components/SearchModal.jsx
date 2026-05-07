import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Loader2 } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

const SearchModal = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
    } else {
      document.body.style.overflow = 'auto';
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  // Debounced Search Logic
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`http://localhost:5000/api/movies/search?q=${query}`);
        const data = await res.json();
        setResults(data.results.slice(0, 5)); // Show top 5 instant results
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setIsSearching(false);
      }
    }, 500); // Waits 500ms after the last keystroke before fetching

    return () => clearTimeout(timer);
  }, [query]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onClose();
      navigate(`/search/${encodeURIComponent(query)}`);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-100 bg-black/85 backdrop-blur-xl flex flex-col items-center pt-24 md:pt-20 px-6"
      >
        <button onClick={onClose} className="absolute top-8 right-8 text-white hover:text-aiAccent transition-colors">
          <X className="w-8 h-8" />
        </button>

        <div className="w-full max-w-4xl">
          <form onSubmit={handleSubmit} className="relative">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-500" />
            <input 
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Movies, Series, Actors..."
              className="w-full bg-white/5 border border-white/10 rounded-full py-3 pl-20 pr-8 text-2xl md:text-2xl font-light text-white focus:outline-none focus:border-aiAccent/50 transition-colors placeholder:text-gray-600"
            />
            {isSearching && (
              <Loader2 className="absolute right-6 top-1/2 -translate-y-1/2 w-6 h-6 text-aiAccent animate-spin" />
            )}
          </form>

          {/* Live Instant Results */}
          {results.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 flex flex-col gap-2"
            >
              <h3 className="text-gray-500 uppercase tracking-widest text-xs font-bold mb-4 ml-4">Instant Matches</h3>
              {results.map((item) => {
                const isPerson = item.media_type === 'person';
                const linkUrl = isPerson ? `/person/${item.id}` : `/details/${item.media_type}/${item.id}`;
                
                return (
                  <Link 
                    key={item.id} 
                    to={linkUrl}
                    onClick={onClose}
                    className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/10 transition-colors group cursor-pointer"
                  >
                    <img 
                      src={`https://image.tmdb.org/t/p/w92${item.poster_path || item.profile_path}`}
                      alt={item.title || item.name}
                      className="w-12 h-16 object-cover rounded shadow-md group-hover:scale-105 transition-transform"
                    />
                    <div>
                      <h4 className="text-white text-lg font-bold uppercase tracking-wider group-hover:text-aiAccent transition-colors">
                        {item.title || item.name}
                      </h4>
                      <p className="text-gray-400 text-xs uppercase tracking-widest">
                        {isPerson ? 'Personnel' : (item.media_type === 'tv' ? 'Series' : 'Movie')}
                        {!isPerson && ` • ${(item.release_date || item.first_air_date)?.split('-')[0] || 'TBA'}`}
                      </p>
                    </div>
                  </Link>
                );
              })}
              
              <button 
                onClick={handleSubmit}
                className="mt-4 text-aiAccent text-sm uppercase tracking-widest font-bold hover:text-white transition-colors text-center w-full py-4 bg-white/5 rounded-xl border border-white/5"
              >
                View All Results for "{query}"
              </button>
            </motion.div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SearchModal;