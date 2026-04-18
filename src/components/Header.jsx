import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Film, Search, User, Menu, X } from 'lucide-react';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Detect scroll to increase the glass blur effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Discover', path: '/' },
    { name: 'Movies', path: '/movies' },
    { name: 'TV Shows', path: '/tv-shows' },
    { name: 'Genres', path: '/genres' },
    { name: 'Country', path: '/country'},
    { name: 'Watchlist', path: '/watchlist' },
  ];

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className={`fixed top-0 w-full z-50 transition-all duration-500 ${
        isScrolled 
          ? 'bg-vfxBlack/70 backdrop-blur-lg py-4' 
          : 'bg-transparent py-6'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-4 flex items-center justify-between">
        
        {/* LOGO */}
        <Link to="/" className="flex items-center gap-2 group">
          <Film className="w-8 h-8 text-aiAccent group-hover:scale-110 transition-transform duration-300" />
          <span className="text-xl font-black tracking-[0.2em] uppercase text-white">
            Mood<span className="text-gray-500 font-normal">Stream</span>
          </span>
        </Link>

        {/* DESKTOP NAVIGATION */}
        <nav className="hidden md:flex ml-65 gap-7 ">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link 
                key={link.name} 
                to={link.path}
                className="relative group py-2 text-sm uppercase tracking-wider font-cinematic text-gray-300 hover:text-white transition-colors"
              >
                {link.name}
                {/* Subtle Cinematic Underline Animation */}
                <span className={`absolute bottom-0 left-0 h-px bg-white transition-all duration-300 ease-out ${
                  isActive ? 'w-full' : 'w-0 group-hover:w-full'
                }`} />
              </Link>
            );
          })}
        </nav>

        {/* PROFILE / SEARCH ICONS */}
        <div className="hidden md:flex items-center gap-6">
          <button className="text-gray-400 hover:text-white transition-colors">
            <Search className="w-5 h-5" />
          </button>
          <div className="w-px h-5 bg-white/20"></div>
          <button className="text-gray-400 hover:text-white transition-colors flex items-center gap-2">
            <User className="w-5 h-5" />
          </button>
        </div>

        {/* MOBILE MENU BUTTON */}
        <button 
          className="md:hidden text-white"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
        </button>
      </div>

      {/* MOBILE MENU (Drop-down) */}
      {mobileMenuOpen && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="md:hidden bg-vfxCharcoal border-t border-white/10 px-6 py-4 flex flex-col gap-4"
        >
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className="text-lg tracking-wider text-gray-300 hover:text-white py-2"
            >
              {link.name}
            </Link>
          ))}
        </motion.div>
      )}
    </motion.header>
  );
};

export default Header;