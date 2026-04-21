import React, { useState } from 'react';
import MovieCurtain from '../components/MovieCurtain';
import PlatformFilter from '../components/PlatformFilter';
import MovieGrid from '../components/MovieGrid';

const Movies = () => {
  const [activePlatform, setActivePlatform] = useState('all');

  return (
    <div className="bg-vfxBlack min-h-screen text-white font-semibold relative">
      
      {/* 1. The Full-Screen Scroll Reveal */}
      <MovieCurtain />

      {/* 2. The Sticky Filter Bar */}
      <PlatformFilter 
        activePlatform={activePlatform} 
        setActivePlatform={setActivePlatform}
      />

      <div className="max-w-350 mx-auto px-6 md:px-8 pt-12">
        <MovieGrid activePlatform={activePlatform} />
      </div>
      
    </div>
  );
};

export default Movies;