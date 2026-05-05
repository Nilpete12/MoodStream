import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Star, Play, X, Clock, Calendar, Plus, Check, MonitorPlay, Film, Activity } from 'lucide-react';
import MovieCard from '../components/MovieCard'; // Reusing your universal card!
import ShareBanner from '../components/ShareBanner'; // New share banner component

const MediaDetails = () => {
  const { type, id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showTrailer, setShowTrailer] = useState(false);
  const [inWatchlist, setInWatchlist] = useState(false); // Mock watchlist state

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:5000/api/movies/details/${type}/${id}`);
        const result = await res.json();
        setData(result);
      } catch (error) {
        console.error("Failed to fetch details:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
    window.scrollTo(0, 0);
  }, [type, id]);

  if (loading || !data) {
    return (
      <div className="h-screen bg-vfxBlack flex items-center justify-center text-aiAccent font-cinematic uppercase tracking-widest animate-pulse">
        Have a little patience... Loading details!
      </div>
    );
  }

  // --- Data Parsing ---
  const title = data.title || data.name;
  const releaseDate = data.release_date || data.first_air_date;
  const runtime = type === 'movie' ? data.runtime : (data.episode_run_time?.[0] || 0);
  const trailerKey = data.videos?.results?.[0]?.key;
  
  // Streaming Providers (Defaulting to US for now)
  const usProviders = data['watch/providers']?.results?.US;
  const streamProviders = usProviders?.flatrate || [];
  
  // Production info formatters
  const formatCurrency = (amount) => amount > 0 ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount) : 'Unknown';

  return (
    <div className="bg-vfxBlack mt-16 min-h-screen text-white font-cinematic relative overflow-hidden">
      
      {/* 1. IMMERSIVE BACKDROP */}
      <div className="absolute top-0 left-0 w-full h-[70vh] md:h-[85vh] z-0">
        <img
          src={`https://image.tmdb.org/t/p/original${data.backdrop_path}`}
          alt={title}
          className="w-full h-full object-cover opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-vfxBlack via-vfxBlack/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-vfxBlack via-transparent to-transparent" />
      </div>

      {/* 2. CONTENT CONTAINER */}
      <div className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-12 pt-8 md:pt-24 pb-24">
        
        <Link to={-1} className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors uppercase tracking-widest text-xs font-bold mb-8 md:mb-16">
          <ChevronLeft className="w-4 h-4" /> Go Back
        </Link>

        <div className="flex flex-col md:flex-row gap-8 md:gap-16 items-start">
          
          {/* Left Column: Poster & Providers */}
          <div className="w-full md:w-1/5 max-w-[350px] shrink-0 flex flex-col gap-6">
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative group"
            >
              <img
                src={`https://image.tmdb.org/t/p/w780${data.poster_path}`}
                alt={title}
                className="w-full rounded-lg shadow-[0_0_40px_rgba(0,0,0,0.8)] border border-white/10"
              />
            </motion.div>

            {/* Where to Watch Section */}
            {/* Where to Watch Section */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-white/5 border border-white/10 rounded-lg p-5 backdrop-blur-md"
            >
              <h4 className="text-gray-400 uppercase tracking-widest text-[10px] font-bold mb-4 flex items-center gap-2">
                <MonitorPlay className="w-3 h-3" /> Where to Watch
              </h4>
              
              {streamProviders.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {streamProviders.map(provider => (
                    <a 
                      key={provider.provider_id}
                      href={usProviders?.link || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-2 -mx-2 rounded-md hover:bg-white/10 transition-all duration-300 group cursor-pointer"
                    >
                      <img 
                        src={`https://image.tmdb.org/t/p/w45${provider.logo_path}`}
                        alt={provider.provider_name}
                        className="w-8 h-8 rounded-md shadow-lg group-hover:scale-110 transition-transform duration-300"
                      />
                      <span className="text-sm font-semibold text-gray-300 group-hover:text-white transition-colors">
                        {provider.provider_name}
                      </span>
                    </a>
                  ))}
                </div>
              ) : data.status === 'Released' ? (
                <p className="text-xs text-gray-500 uppercase tracking-wider font-bold">Currently in Theatres / VOD</p>
              ) : (
                <p className="text-xs text-gray-500 uppercase tracking-wider font-bold">Not currently available</p>
              )}
            </motion.div>
          </div>

          {/* Right Column: Details */}
          <div className="w-full md:w-3/4 pt-4">
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-5xl lg:text-5xl font-bold uppercase tracking-tighter leading-none mb-2 drop-shadow-2xl"
            >
              {title}
            </motion.h1>

            {data.tagline && (
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="text-aiAccent text-lg md:text-xl font-light italic tracking-wider mb-6"
              >
                "{data.tagline}"
              </motion.p>
            )}

            {/* Meta Tags (Genres are now clickable Links) */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex flex-wrap items-center gap-4 text-xs tracking-widest uppercase text-gray-400 mb-8"
            >
              <div className="flex items-center gap-1 text-white border border-white/20 px-2 py-1 rounded backdrop-blur-sm bg-black/30">
                <Star className="w-3.5 h-3.5 text-aiAccent fill-current" />
                <span className="font-bold">{data.vote_average?.toFixed(1)}</span>
              </div>
              <div className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> {releaseDate?.split('-')[0]}</div>
              {runtime > 0 && <div className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {Math.floor(runtime / 60)}h {runtime % 60}m</div>}
              
              <div className="flex gap-2 ml-auto">
                {data.genres?.map(g => (
                  <Link 
                    key={g.id} 
                    to={`/genre/${g.id}/${g.name.toLowerCase()}`}
                    className="text-gray-300 border border-gray-600/50 px-2 py-1 rounded hover:bg-white/10 hover:border-white/50 transition-colors cursor-pointer"
                  >
                    {g.name}
                  </Link>
                ))}
              </div>
            </motion.div>

            {/* Action Buttons */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap gap-4 mb-12"
            >
              {trailerKey && (
                <button 
                  onClick={() => setShowTrailer(true)}
                  className="bg-white text-black px-8 py-3 rounded text-sm font-bold tracking-widest uppercase hover:bg-gray-300 transition flex items-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                >
                  <Play className="w-4 h-4 fill-current" /> Watch Trailer
                </button>
              )}
              
              {/* Add to Watchlist Button */}
              <button 
                onClick={() => setInWatchlist(!inWatchlist)}
                className={`px-8 py-3 rounded text-sm font-bold tracking-widest uppercase transition flex items-center gap-2 border ${
                  inWatchlist 
                    ? 'bg-aiAccent/20 border-aiAccent text-aiAccent' 
                    : 'bg-white/5 border-white/20 text-white hover:bg-white/10'
                }`}
              >
                {inWatchlist ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />} 
                {inWatchlist ? 'In Watchlist' : 'Add to List'}
              </button>
            </motion.div>

            {/* Synopsis */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="mb-12">
              <h3 className="text-sm tracking-widest uppercase text-gray-500 mb-3 border-b border-white/10 pb-2">Description</h3>
              <p className="text-gray-300 font-light leading-relaxed text-base md:text-lg max-w-3xl">
                {data.overview}
              </p>
            </motion.div>

            {/* Additional Details Grid (Stats) */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }} className="mb-12 grid grid-cols-2 md:grid-cols-4 gap-6 border-y border-white/10 py-6">
              <div>
                <p className="text-gray-500 text-[10px] uppercase tracking-widest mb-1 flex items-center gap-1"><Activity className="w-3 h-3"/> Status</p>
                <p className="text-white text-sm tracking-wider uppercase font-bold">{data.status}</p>
              </div>
              {type === 'movie' && (
                <>
                  <div>
                    <p className="text-gray-500 text-[10px] uppercase tracking-widest mb-1 flex items-center gap-1"><Film className="w-3 h-3"/> Budget</p>
                    <p className="text-white text-sm tracking-wider uppercase font-bold">{formatCurrency(data.budget)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-[10px] uppercase tracking-widest mb-1 flex items-center gap-1"><Star className="w-3 h-3"/> Revenue</p>
                    <p className="text-white text-sm tracking-wider uppercase font-bold">{formatCurrency(data.revenue)}</p>
                  </div>
                </>
              )}
              {type === 'tv' && (
                <>
                  <div>
                    <p className="text-gray-500 text-[10px] uppercase tracking-widest mb-1 flex items-center gap-1"><Film className="w-3 h-3"/> Seasons</p>
                    <p className="text-white text-sm tracking-wider uppercase font-bold">{data.number_of_seasons}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-[10px] uppercase tracking-widest mb-1 flex items-center gap-1"><MonitorPlay className="w-3 h-3"/> Network</p>
                    <p className="text-white text-sm tracking-wider uppercase font-bold">{data.networks?.[0]?.name || 'N/A'}</p>
                  </div>
                </>
              )}
            </motion.div>

            {/* Cast Grid (Now clickable!) */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
              <h3 className="text-sm tracking-widest uppercase text-gray-500 mb-4 border-b border-white/10 pb-2">Featured Cast</h3>
              <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-4">
                {data.credits?.cast?.slice(0, 12).map(actor => (
                  <Link to={`/person/${actor.id}`} key={actor.id} className="group cursor-pointer">
                    <div className="aspect-square rounded-full overflow-hidden mb-3 border-2 border-transparent group-hover:border-aiAccent transition-colors duration-300 shadow-xl">
                      {actor.profile_path ? (
                        <img 
                          src={`https://image.tmdb.org/t/p/w185${actor.profile_path}`} 
                          alt={actor.name} 
                          className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-white/5 flex items-center justify-center text-gray-500 text-xs text-center p-2">No Photo</div>
                      )}
                    </div>
                    <p className="text-white text-xs font-bold uppercase tracking-wider truncate text-center group-hover:text-aiAccent transition-colors">{actor.name}</p>
                    <p className="text-gray-500 text-[10px] uppercase tracking-widest truncate text-center mt-0.5">{actor.character}</p>
                  </Link>
                ))}
              </div>
            </motion.div>

          </div>
        </div>

        {/* 3. SIMILAR TITLES SECTION */}
        {data.similar?.results?.length > 0 && (
          <div className="mt-24 pt-12 border-t border-white/10">
            <h3 className="text-xl md:text-2xl tracking-widest uppercase text-white mb-8">
              Similar to {title}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-5">
              {data.similar.results.slice(0, 6).map((item, idx) => (
                <MovieCard key={`similar-${item.id}`} item={item} index={idx} />
              ))}
            </div>
          </div>
        )}

        <ShareBanner />

      </div>

      {/* FULLSCREEN TRAILER MODAL */}
      <AnimatePresence>
        {showTrailer && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 md:p-12"
          >
            <button 
              onClick={() => setShowTrailer(false)}
              className="absolute top-6 right-6 text-white hover:text-aiAccent transition flex items-center gap-2 uppercase tracking-widest text-xs font-bold"
            >
              Close <X className="w-6 h-6" />
            </button>
            <div className="w-full max-w-6xl aspect-video bg-black shadow-[0_0_50px_rgba(0,0,0,1)] border border-white/10 rounded-xl overflow-hidden">
              <iframe
                className="w-full h-full"
                src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&rel=0&modestbranding=1`}
                title="Trailer"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default MediaDetails;