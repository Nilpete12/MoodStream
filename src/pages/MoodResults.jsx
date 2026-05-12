import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, Sparkles, AlertCircle, RefreshCcw } from 'lucide-react';
import MovieCard from '../components/MovieCard';

const MoodResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Extract the prompt passed from Hero.jsx
  const prompt = location.state?.prompt || "";

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // If someone manually types /mood-results in the URL without a prompt, kick them back to home
    if (!prompt) {
      navigate('/');
      return;
    }

    const fetchCuratedMood = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch('http://localhost:5000/api/movies/ai-search', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ prompt }),
        });

        if (!response.ok) {
          throw new Error('AI Curator failed to respond. The network might be congested.');
        }

        const data = await response.json();
        
        if (!data.results || data.results.length === 0) {
          throw new Error("We couldn't find exact matches for that specific feeling. Try adjusting your phrasing.");
        }

        setResults(data.results);
      } catch (err) {
        console.error("Mood Search Error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCuratedMood();
    window.scrollTo(0, 0);
  }, [prompt, navigate]);

  // --- SPECIALIZED AI LOADING SCREEN ---
  if (loading) {
    return (
      <div className="min-h-screen bg-vfxBlack flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
        {/* Animated background glow */}
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute w-96 h-96 bg-aiAccent/20 rounded-full blur-[100px]"
        />
        
        <div className="relative z-10 flex flex-col items-center">
          <Sparkles className="w-12 h-12 text-aiAccent animate-pulse mb-8" />
          <motion.h2 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl md:text-3xl font-black uppercase tracking-widest text-white mb-4 font-cinematic"
          >
            Curating your experience
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-gray-400 font-light text-lg md:text-xl italic max-w-2xl"
          >
            "{prompt}"
          </motion.p>
          
          <div className="mt-12 flex gap-2">
            <motion.div animate={{ opacity: [0.2, 1, 0.2] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0 }} className="w-2 h-2 rounded-full bg-aiAccent" />
            <motion.div animate={{ opacity: [0.2, 1, 0.2] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }} className="w-2 h-2 rounded-full bg-aiAccent" />
            <motion.div animate={{ opacity: [0.2, 1, 0.2] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }} className="w-2 h-2 rounded-full bg-aiAccent" />
          </div>
        </div>
      </div>
    );
  }

  // --- ERROR SCREEN ---
  if (error) {
    return (
      <div className="min-h-screen bg-vfxBlack flex flex-col items-center justify-center p-6 text-center font-cinematic">
        <AlertCircle className="w-16 h-16 text-red-500 mb-6" />
        <h2 className="text-2xl md:text-3xl font-black uppercase tracking-widest text-white mb-4">Signal Lost</h2>
        <p className="text-gray-400 max-w-md mb-8">{error}</p>
        <Link to="/" className="bg-white text-black px-8 py-3 rounded-full font-bold uppercase tracking-widest hover:bg-gray-200 transition-colors">
          Return to Hub
        </Link>
      </div>
    );
  }

  // --- SUCCESS SCREEN ---
  return (
    <div className="bg-vfxBlack min-h-screen flex flex-col font-cinematic text-white py-16 relative">
      
      {/* Background ambient glow based on prompt success */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-250 h-125 bg-aiAccent/5 blur-[150px] rounded-full pointer-events-none z-0" />

      {/* Header */}
      <header className="h-auto min-h-24 md:min-h-32 border-b border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between px-6 md:px-12 py-6 bg-vfxBlack/90 backdrop-blur-md sticky top-0 z-50">
        <Link to="/" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors uppercase tracking-widest text-sm font-bold mb-4 md:mb-0 shrink-0">
          <ChevronLeft className="w-5 h-5" /> Home
        </Link>
        <div className="md:text-right md:max-w-2xl">
          <p className="text-aiAccent text-[10px] md:text-xs tracking-widest uppercase mb-1 font-bold flex items-center md:justify-end gap-2">
            <Sparkles className="w-3 h-3" /> AI Curated Results
          </p>
          <h1 className="text-lg md:text-xl font-light italic text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.2)] line-clamp-2">
            "{prompt}"
          </h1>
        </div>
      </header>

      {/* Grid */}
      <div className="relative z-10 max-w-400 w-full mx-auto px-6 md:px-12 pt-12 pb-24">
        
        {/* We use a slightly different grid specifically for AI results (larger cards to emphasize curation) */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 md:gap-8"
        >
          {results.map((item, idx) => (
            <MovieCard key={`${item.id}-${idx}`} item={item} index={idx} />
          ))}
        </motion.div>

        {/* CTA to search again */}
        <div className="mt-24 pt-12 border-t border-white/10 text-center">
          <p className="text-gray-400 font-light mb-6 uppercase tracking-widest text-sm">Not quite the right vibe?</p>
          <Link 
            to="/"
            className="inline-flex items-center gap-2 border border-white/20 bg-white/5 px-8 py-4 rounded-full font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-colors"
          >
            <RefreshCcw className="w-4 h-4" /> Try another mood
          </Link>
        </div>

      </div>
    </div>
  );
};

export default MoodResults;