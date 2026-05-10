import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Lock, Bookmark, Film, Plus } from 'lucide-react';
import MovieCard from '../components/MovieCard';
import { useUser, SignInButton } from "@clerk/clerk-react";
import { supabase } from '../supabaseClient';

const Watchlist = () => {
  const { isSignedIn, user, isLoaded } = useUser();
  const [watchlist, setWatchlist] = useState([]);
  const [isFetchingData, setIsFetchingData] = useState(true);

  useEffect(() => {
    const fetchWatchlistData = async () => {
      // 1. If clerk is still loading, or user isn't logged in, stop here.
      if (!isLoaded) return;
      if (!isSignedIn || !user) {
        setIsFetchingData(false);
        return;
      }

      try {
        // 2. Fetch the saved IDs from Supabase (ordered by newest first)
        const { data: supabaseData, error } = await supabase
          .from('watchlists')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        // If their list is empty, stop here
        if (!supabaseData || supabaseData.length === 0) {
          setWatchlist([]);
          setIsFetchingData(false);
          return;
        }

        // 3. Hydrate the IDs with real TMDB data using your Node backend
        // We use Promise.all to fetch them all simultaneously instead of one by one
        const hydratedData = await Promise.all(
          supabaseData.map(async (item) => {
            const res = await fetch(`http://localhost:5000/api/movies/details/${item.media_type}/${item.movie_id}`);
            const tmdbData = await res.json();
            
            // Return the TMDB data, but manually inject the media_type from Supabase
            // so your MovieCard knows if it's a 'movie' or 'tv' for routing!
            return {
              ...tmdbData,
              media_type: item.media_type 
            };
          })
        );

        // Filter out any potential nulls/errors from the API
        const validData = hydratedData.filter(movie => movie && !movie.error);
        setWatchlist(validData);

      } catch (err) {
        console.error("Error fetching watchlist:", err);
      } finally {
        setIsFetchingData(false);
      }
    };

    fetchWatchlistData();
  }, [isSignedIn, user, isLoaded]);

  // Loading UI while Clerk authenticates OR while we fetch from TMDB
  if (!isLoaded || isFetchingData) {
    return (
      <div className="h-screen bg-vfxBlack flex items-center justify-center text-aiAccent font-cinematic uppercase tracking-widest animate-pulse">
        Accessing Secure Vault...
      </div>
    );
  }

  return (
    <div className="bg-vfxBlack min-h-screen flex flex-col font-cinematic text-white py-16 relative">
      
      {/* Header */}
      <header className="h-20 md:h-20 border-b border-white/10 flex items-center justify-between px-6 md:px-8 bg-vfxBlack sticky top-0 z-50">
        <h1 className="text-2xl md:text-2xl font-black uppercase tracking-widest text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.2)] flex items-center gap-4">
          <Bookmark className="w-6 h-6 md:w-8 md:h-8 text-aiAccent" />
          My Watchlist
        </h1>
        {isSignedIn && (
          <p className="text-gray-500 text-xs tracking-widest uppercase mt-1">
            {watchlist.length} {watchlist.length === 1 ? 'Title' : 'Titles'} Saved
          </p>
        )}
      </header>

      <div className="max-w-400 w-full mx-auto px-6 md:px-12 my-8 flex-1 flex flex-col">
        
        {/* SCENARIO 1: Not Logged In */}
        {!isSignedIn && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1 flex flex-col items-center justify-center text-center py-20"
          >
            <div className="w-24 h-24 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-8 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
              <Lock className="w-10 h-10 text-gray-400" />
            </div>
            <h2 className="text-3xl md:text-4xl font-black uppercase tracking-widest mb-4">Authentication Required</h2>
            <p className="text-gray-400 font-light max-w-md mx-auto mb-10 text-lg">
              Log in to MoodStream to save movies and series to your personal cinematic vault.
            </p>
            <SignInButton mode="modal">
              <button className="bg-white text-black px-10 py-4 rounded font-bold tracking-widest uppercase hover:bg-gray-300 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                Sign In / Sign Up
              </button>
            </SignInButton>
          </motion.div>
        )}

        {/* SCENARIO 2: Logged In, Empty List */}
        {isSignedIn && watchlist.length === 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1 flex flex-col items-center justify-center text-center py-20"
          >
            <div className="w-24 h-24 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-8 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
              <Film className="w-10 h-10 text-aiAccent/50" />
            </div>
            <h2 className="text-3xl md:text-4xl font-black uppercase tracking-widest mb-4">Your Vault is Empty</h2>
            <p className="text-gray-400 font-light max-w-md mx-auto mb-10 text-lg">
              You haven't saved any titles yet. Explore our database and hit the <Plus className="inline w-4 h-4 mx-1"/> icon to build your collection.
            </p>
            <Link 
              to="/"
              className="bg-transparent border border-white/20 text-white px-10 py-4 rounded font-bold tracking-widest uppercase hover:bg-white/10 transition-colors"
            >
              Explore Media
            </Link>
          </motion.div>
        )}

        {/* SCENARIO 3: Logged In, Populated List */}
        {isSignedIn && watchlist.length > 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-5 auto-rows-[minmax(250px,auto)] pb-24"
          >
            {watchlist.map((item, idx) => (
              <MovieCard key={`${item.id}-${idx}`} item={item} index={idx} />
            ))}
          </motion.div>
        )}

      </div>
    </div>
  );
};

export default Watchlist;