import React from 'react';
import { motion } from 'framer-motion';
import { Film, ArrowUpRight } from 'lucide-react';
import { FaGithub, FaYoutube, FaLinkedin } from 'react-icons/fa'; // Import from FontAwesome
import { Link } from 'react-router-dom';
const Footer = () => {
  // Animation variants for the "moving up" Weta FX effect
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 50 },
    show: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } // Smooth cinematic easing
    }
  };

  return (
    // The footer is styled with aiAccent blue
    <footer className="sticky-0 bottom-0 z-0 bg-aiAccent text-white relative overflow-hidden pt-20 pb-10 border-t border-white/20">
      
      {/* Background Glow / Noise texture (optional for cinematic feel) */}
      <div className="absolute inset-0 bg-black/10 mix-blend-overlay pointer-events-none" />

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.3 }} // Triggers when slightly in view
        className="max-w-7xl mx-auto px-6 md:px-12 relative z-10"
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8 mb-16">
          
          {/* Brand Section */}
          <motion.div variants={itemVariants} className="md:col-span-2">
            <Link to="/" className="items-center gap-2 mb-6 group inline-flex">
              <Film className="w-10 h-10 text-white group-hover:rotate-12 transition-transform duration-500" />
              <span className="text-3xl font-black tracking-[0.2em] uppercase">
                Mood<span className="text-black/50 font-normal">Stream</span>
              </span>
            </Link>
            <p className="text-white/80 text-l max-w-sm font-medium leading-relaxed">
              Moving beyond genres. AI-powered semantic search to find the exact cinematic vibe you are looking for.
            </p>
          </motion.div>

          {/* Quick Links */}
          <motion.div variants={itemVariants} className="flex flex-col gap-4">
            <h4 className="text-black/60 font-black uppercase tracking-widest text-sm mb-2">Platform</h4>
            <Link to="/" className="hover:text-black transition-colors font-semibold flex items-center gap-1 group">
              Discover <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
            <Link to="/movies" className="hover:text-black transition-colors font-semibold flex items-center gap-1 group">
              Movies <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
            <Link to="/tv-shows" className="hover:text-black transition-colors font-semibold flex items-center gap-1 group">
              TV Shows <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
            <Link to="/genres" className="hover:text-black transition-colors font-semibold flex items-center gap-1 group">
              Genres <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
            <Link to="/watchlist" className="hover:text-black transition-colors font-semibold flex items-center gap-1 group">
              Watchlist <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          </motion.div>

          {/* Connect Section (Perfect for your CV/Portfolio) */}
            <motion.div variants={itemVariants} className="flex flex-col gap-4">
              <h4 className="text-black/60 font-black uppercase tracking-widest text-sm mb-2">Connect</h4>
              <div className="flex gap-4">
                <a href="#" target="_blank" rel="noreferrer" className="bg-black/20 p-3 rounded-full hover:bg-black hover:text-white transition-all duration-300">
                  <FaGithub className="w-5 h-5" />
                </a>
                <a href="#" target="_blank" rel="noreferrer" className="bg-black/20 p-3 rounded-full hover:bg-black hover:text-white transition-all duration-300">
                  <FaYoutube className="w-5 h-5" />
                </a>
                <a href="#" target="_blank" rel="noreferrer" className="bg-black/20 p-3 rounded-full hover:bg-black hover:text-white transition-all duration-300">
                  <FaLinkedin className="w-5 h-5" />
                </a>
              </div>
              <p className="text-sm text-white/70 mt-4 font-medium">
                Designed & Developed by Nilesh Sen
              </p>
            </motion.div>

        </div>

        {/* Big Bottom Text (Weta FX Style) */}
        <motion.div variants={itemVariants} className="border-t border-white/20 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <h1 className="text-5xl md:text-[8vw] leading-none font-black tracking-tighter opacity-15 select-none">
            MOODSTREAM
          </h1>
          <p className="text-white/60 text-sm font-semibold tracking-wider uppercase">
            © 2026 All Rights Reserved
          </p>
        </motion.div>

      </motion.div>
    </footer>
  );
};

export default Footer;