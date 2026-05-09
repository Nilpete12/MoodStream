import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Film, Search, User, Menu, X } from 'lucide-react';
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/clerk-react";
import SearchModal from './SearchModal';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu or search when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
    setIsSearchOpen(false);
  }, [location]);

  const navLinks = [
    { name: 'Discover', path: '/' },
    { name: 'Movies', path: '/movies' },
    { name: 'TV Shows', path: '/tv-shows' },
    { name: 'Genres', path: '/genres' },
    { name: 'Country', path: '/country'},
    { name: 'Watchlist', path: '/watchlist' },
  ];

  return (
    <>
      <motion.header
      initial={{ y: -100 }}
      animate={{ y: isScrolled ? -100 : 0 }}
      transition={{ duration: 0.1, ease: "linear" }}
      className={`fixed top-0 w-full z-50 transition-all py-4 bg-vfxBlack/30 backdrop-blur-lg border-b border-white/10 `}
    >
        <div className="max-w-7xl mx-auto flex justify-between">
          
          {/* LOGO */}
          <Link to="/" className="flex items-center gap-2 group">
            <Film className="w-8 h-8 text-aiAccent group-hover:scale-110 transition-transform duration-300" />
            <span className="text-xl font-black tracking-[0.2em] uppercase text-white">
              Mood<span className="text-gray-500 font-normal">Stream</span>
            </span>
          </Link>

          {/* DESKTOP NAVIGATION */}
          <nav className="hidden md:flex ml-60 gap-7">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link 
                  key={link.name} 
                  to={link.path}
                  className="relative group py-2 text-sm uppercase tracking-wider font-cinematic text-gray-300 hover:text-white transition-colors"
                >
                  {link.name}
                  <span className={`absolute bottom-0 left-0 h-px bg-white transition-all duration-300 ease-out ${
                    isActive ? 'w-full' : 'w-0 group-hover:w-full'
                  }`} />
                </Link>
              );
            })}
          </nav>

          {/* ACTIONS */}
          <div className="flex items-center gap-3">
            <button 
              className="p-2 text-gray-400 hover:text-white transition-colors"
              onClick={() => setIsSearchOpen(true)}
              aria-label="Open Search"
            >
              <Search className="w-5 h-5" />
            </button>
            
            <div className="hidden md:block w-px h-5 bg-white/20"></div>
            
            <SignedOut>
              <SignInButton mode="modal">
              <button className="text-xs md:text-xs font-bold uppercase tracking-widest px-4 py-2 bg-white text-black rounded hover:bg-gray-300 transition-colors shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                Sign In
              </button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <div className="flex items-center gap-4">
              <Link to="/watchlist" className="hidden md:block text-xs uppercase tracking-widest font-bold text-gray-300 hover:text-white transition">
                Watchlist
              </Link>
              <UserButton afterSignOutUrl="/" /> 
              </div>
            </SignedIn>

            {/* MOBILE MENU BUTTON */}
            <button 
              className="md:hidden text-white p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
            </button>
          </div>
        </div>

        {/* MOBILE MENU */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-vfxBlack/95 backdrop-blur-xl border-t border-white/10 px-6 py-4 flex flex-col gap-4"
            >
              {navLinks.map((link) => (
                <Link 
                  key={link.name} 
                  to={link.path}
                  className="text-lg tracking-wider text-gray-300 hover:text-white py-2"
                >
                  {link.name}
                </Link>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* SEARCH MODAL INTEGRATION */}
      <SearchModal 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)} 
      />
    </>
  );
};

export default Header;
