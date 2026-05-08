import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Lock, Bookmark, Film, Plus } from 'lucide-react';
import MovieCard from '../components/MovieCard';

const Watchlist = () => {
  // MOCK STATES: We will replace these with Clerk and DB hooks later
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);

  // Simulate network loading
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  // DEV TOOL: Load some fake TMDB data to see the grid working
  const loadFakeData = () => {
    setWatchlist([
      { id: 157336, title: "Interstellar", media_type: "movie", poster_path: "/gEU2QlsUUHXjNpeEYZjmaczOdfT.jpg", vote_average: 8.4, release_date: "2014-11-05" },
      { id: 1399, title: "Game of Thrones", media_type: "tv", poster_path: "/1XS1oqL89opfnbLl8WnZY1O1uJx.jpg", vote_average: 8.5, first_air_date: "2011-04-17" },
      { id: 27205, title: "Inception", media_type: "movie", poster_path: "/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg", vote_average: 8.4, release_date: "2010-07-15" }
    ]);
  };

  if (loading) {
    return (
      <div className="h-screen bg-vfxBlack flex items-center justify-center text-aiAccent font-cinematic uppercase tracking-widest animate-pulse">
        Authenticating User...
      </div>
    );
  }

  return (
    <div className="bg-vfxBlack min-h-screen flex flex-col font-cinematic text-white py-16 relative">
      
      {/* Header */}
      <header className="h-24 md:h-20 border-b border-white/10 flex items-center justify-between px-6 md:px-8 bg-vfxBlack sticky top-0 z-50">
        <h1 className="text-2xl md:text-2xl font-black uppercase tracking-widest text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.2)] flex items-center gap-4">
          <Bookmark className="w-6 h-6 md:w-8 md:h-8 text-aiAccent" />
          My Watchlist
        </h1>
        {isLoggedIn && (
          <p className="text-gray-500 text-xs tracking-widest uppercase mt-1">
            {watchlist.length} {watchlist.length === 1 ? 'Title' : 'Titles'} Saved
          </p>
        )}
      </header>

      <div className="max-w-400 w-full mx-auto px-6 md:px-12 flex-1 flex flex-col">
        
        {/* SCENARIO 1: Not Logged In */}
        {!isLoggedIn && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1 flex flex-col items-center justify-center text-center py-20"
          >
            <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-8 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
              <Lock className="w-10 h-10 text-gray-400" />
            </div>
            <h2 className="text-3xl md:text-3xl font-black uppercase tracking-widest mb-4">Authentication Required</h2>
            <p className="text-gray-400 font-light max-w-md mx-auto mb-10 text-lg">
              Log in to MoodStream to save movies and series to your personal cinematic vault.
            </p>
            <button 
              onClick={() => setIsLoggedIn(true)} // MOCK LOGIN
              className="bg-white text-black px-7 py-4 rounded-full font-bold tracking-widest uppercase hover:bg-gray-300 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.2)]"
            >
            <h1 className='text-sm px-3'>Sign In / Sign Up</h1>
            </button>
          </motion.div>
        )}

        {/* SCENARIO 2: Logged In, Empty List */}
        {isLoggedIn && watchlist.length === 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1 flex flex-col items-center justify-center text-center py-20"
          >
            <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-8 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
              <Film className="w-10 h-10 text-aiAccent/50" />
            </div>
            <h2 className="text-3xl md:text-3xl font-black uppercase tracking-widest mb-4">Your Vault is Empty</h2>
            <p className="text-gray-400 font-light max-w-md mx-auto mb-10 text-lg">
              You haven't saved any titles yet. Explore our database and hit the <Plus className="inline w-4 h-4 mx-1"/> icon to build your collection.
            </p>
            <Link 
              to="/"
              className="bg-transparent border border-white/20 text-white px-6 py-3 rounded-full font-bold tracking-widest uppercase hover:bg-white/10 transition-colors"
            >
              Explore Media
            </Link>
          </motion.div>
        )}

        {/* SCENARIO 3: Logged In, Populated List */}
        {isLoggedIn && watchlist.length > 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-5 auto-rows-[minmax(250px,auto)]"
          >
            {watchlist.map((item, idx) => (
              <MovieCard key={item.id} item={item} index={idx} />
            ))}
          </motion.div>
        )}

      </div>

      {/* --------------------------------------------------------- */}
      {/* DEV TOOLS: DELETE THIS ENTIRE BLOCK WHEN ADDING CLERK */}
      {/* --------------------------------------------------------- */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur border border-aiAccent/50 p-2 rounded-full flex gap-2 z-[100] text-[10px] uppercase font-bold tracking-widest">
        <button onClick={() => { setIsLoggedIn(false); setWatchlist([]); }} className="px-4 py-2 hover:bg-white/10 rounded-full text-red-400">Force Log Out</button>
        <button onClick={() => { setIsLoggedIn(true); setWatchlist([]); }} className="px-4 py-2 hover:bg-white/10 rounded-full text-gray-400">Empty List</button>
        <button onClick={() => { setIsLoggedIn(true); loadFakeData(); }} className="px-4 py-2 hover:bg-white/10 rounded-full text-aiAccent">Fill List</button>
      </div>
      {/* --------------------------------------------------------- */}

    </div>
  );
};

export default Watchlist;