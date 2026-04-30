import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

const genres = [
  { id: 28, name: 'Action', bg: 'https://image.tmdb.org/t/p/original/7WsyChQLEftFiDOVTGkv3hFpyyt.jpg' },
  { id: 878, name: 'Sci-Fi', bg: 'https://image.tmdb.org/t/p/original/eXdZ37PSZCL0GpllxeiI3AO6jG.jpg' },
  { id: 27, name: 'Horror', bg: 'https://image.tmdb.org/t/p/original/bCKRxNF0hIglIwp9K2O9obtF2gR.jpg' },
  { id: 16, name: 'Animation', bg: 'https://image.tmdb.org/t/p/original/Dnk4iSqqNkZBJBPeFdAegTaxD5.jpg' },
  { id: 10749, name: 'Romance', bg: 'https://image.tmdb.org/t/p/original/ik2D3KqxFD0O0Bc3Wv1CZm8sOg8.jpg' },
  { id: 53, name: 'Thriller', bg: 'https://image.tmdb.org/t/p/original/bpp58yHuQmpt6xwggI63mVRw7po.jpg' },
  { id: 35, name: 'Comedy', bg: 'https://image.tmdb.org/t/p/original/e6ZyJ1BOk38frPkzICskIsYaztg.jpg' },
  { id: 99, name: 'Documentary', bg: 'https://image.tmdb.org/t/p/original/mBB0lTVRIMhv80hqEsOKL2Tx14h.jpg' },
  { id: 18, name: 'Drama', bg: 'https://image.tmdb.org/t/p/original/hiKmpZMGZsrkA3cdce8a7Dpos1j.jpg' },
  { id: 10751, name: 'Family', bg: 'https://image.tmdb.org/t/p/original/jEZ0APg9Lg0uiJJkyPThlgyVHEh.jpg' },
  { id: 14, name: 'Fantasy', bg: 'https://image.tmdb.org/t/p/original/g9JfmHgUigdPJoGBt6rupT3WIXd.jpg' },
];

const GenreExplore = () => {
  const [hoveredIndex, setHoveredIndex] = useState(0);

  return (
    <div className="relative flex h-screen w-full bg-vfxBlack overflow-hidden">
      
      {/* LEFT SIDE: The Typography List */}
      {/* z-20 ensures the text stays above the image when they overlap */}
      <div className="w-full lg:w-full h-full overflow-y-auto no-scrollbar py-[15vh] px-8 md:px-20 z-20 pointer-events-none">
        <div className="flex flex-col gap-8 pointer-events-auto">
          {genres.map((genre, index) => {
            const isHovered = hoveredIndex === index;
            
            return (
              <Link 
                key={genre.id}
                to={`/genre/${genre.id}/${genre.name.toLowerCase()}`}
                onMouseEnter={() => setHoveredIndex(index)}
                className="group relative flex items-baseline"
              >
                <motion.h2 
                  className={`text-[12vw] lg:text-[6vw] font-black uppercase leading-[0.8] transition-all duration-500 cursor-pointer ${
                    isHovered 
                      ? 'text-white translate-x-4' 
                      : 'text-white/10 hover:text-white/30'
                  }`}
                >
                  {genre.name}
                </motion.h2>

                {isHovered && (
                  <motion.div 
                    layoutId="outline"
                    className="absolute -left-4 top-0 bottom-0 w-0.5 bg-aiAccent"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  />
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {/* RIGHT SIDE / BACKGROUND: The Image Display */}
      {/* z-10 makes this sit behind the text layer */}
      <div className="hidden lg:block absolute right-0 top-0 w-3/5 h-full z-10 pointer-events-none">
        <AnimatePresence mode="wait">
          <motion.div
            key={hoveredIndex}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0 bg-cover bg-center shadow-2xl"
            style={{ backgroundImage: `url(${genres[hoveredIndex].bg})` }}
          >
            {/* Soft gradient to blend the image into the text area */}
            <div className="absolute inset-0 bg-linear-to-r from-vfxBlack via-vfxBlack/20 to-transparent" />
            
            {/* Viewfinder Frame */}
            <div className="absolute inset-0 flex items-center justify-center p-12">
                <div className="w-full h-full border border-white/5 relative">
                    <div className="absolute -top-1 -left-1 w-4 h-4 border-t border-l border-aiAccent/50" />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b border-r border-aiAccent/50" />
                </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Dynamic Label */}
        <div className="absolute bottom-20 right-20 text-right">
           <AnimatePresence mode="wait">
             <motion.div
               key={hoveredIndex}
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -20 }}
             >
               <p className="text-white/40 font-mono text-xs uppercase tracking-[0.4em]">
                 Data Source: TMDB / {genres[hoveredIndex].name}
               </p>
             </motion.div>
           </AnimatePresence>
        </div>
      </div>

    </div>
  );
};

export default GenreExplore;
