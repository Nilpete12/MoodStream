import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Globe, Film } from 'lucide-react';
import { Link } from 'react-router-dom';

const ExploreMore = () => {
  const exploreCards = [
    {
      id: 'genre',
      title: 'Explore Genres',
      subtitle: 'Sci-Fi, Thrillers, Romance & more',
      icon: Film,
      bgImage: 'https://thumbs.dreamstime.com/b/cinema-11018032.jpg', 
      link: '/genres'
    },
    {
      id: 'country',
      title: 'Global Cinema',
      subtitle: 'Masterpieces from around the world',
      icon: Globe,
      bgImage: 'https://images.mubicdn.net/images/film/391/cache-25588-1745490121/image-w1280.jpg?size=800x', 
      link: '/country'
    }
  ];

  return (
    // Replaced the massive edge-to-edge layout with a contained, padded section
    <section className="py-16 md:py-16 max-w-[1400px] mx-auto px-6 md:px-6 relative z-20 border-t border-white/5 mt-12">
      
      {/* Section Header (Optional, but adds nice context) */}
      

      <div className="flex flex-col md:flex-row gap-6 md:gap-8">
        {exploreCards.map((card, index) => (
          <Link 
            key={card.id} 
            to={card.link}
            // Reduced height dramatically to h-[280px] or h-[320px]
            className="relative flex-1 group h-[280px] md:h-[320px] rounded-2xl overflow-hidden border border-white/10 bg-vfxCharcoal shadow-2xl"
          >
            {/* Background Image - Starts gray, colors up on hover */}
            <motion.div 
              className="absolute inset-0 bg-cover bg-center transition-all duration-[1.5s] ease-out scale-105 group-hover:scale-100 grayscale-[60%] group-hover:grayscale-0 opacity-40 group-hover:opacity-80"
              style={{ backgroundImage: `url(${card.bgImage})` }}
            />
            
            {/* Gradient Overlay so text is always readable */}
            <div className="absolute inset-0 bg-gradient-to-t from-vfxBlack via-vfxBlack/60 to-transparent" />
            
            {/* Content Container aligned to the bottom */}
            <div className="relative h-full w-full flex flex-col justify-end p-8 z-10">
              
              <div className="flex items-end justify-between">
                <div>
                  <card.icon className="w-8 h-8 text-aiAccent mb-4 opacity-70 group-hover:opacity-100 transition-opacity duration-500" />
                  <h2 className="text-2xl md:text-3xl font-black uppercase tracking-widest text-white mb-2 group-hover:text-aiAccent transition-colors duration-300">
                    {card.title}
                  </h2>
                  <p className="text-gray-400 text-sm font-medium tracking-wide">
                    {card.subtitle}
                  </p>
                </div>

                {/* Animated Arrow Button */}
                <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center bg-black/50 backdrop-blur-md group-hover:bg-aiAccent group-hover:border-aiAccent group-hover:text-white transition-all duration-500 transform group-hover:translate-x-2">
                  <ArrowRight className="w-5 h-5 transition-transform duration-500 group-hover:-rotate-45" />
                </div>
              </div>

            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default ExploreMore;