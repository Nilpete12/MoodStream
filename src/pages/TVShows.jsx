import React, { useState } from 'react';
import MovieCurtain from '../components/MovieCurtain';
import PlatformFilter from '../components/PlatformFilter';
import MovieGrid from '../components/MovieGrid';

const TVShows = () => {
  const [activePlatform, setActivePlatform] = useState('all');

  return (
    <div className="bg-vfxBlack min-h-screen text-white font-cinematic relative">
      
      {/* 1. Reuse the Curtain but pass a custom Title */}
      <MovieCurtain title="TV Shows" />

      <PlatformFilter 
        activePlatform={activePlatform} 
        setActivePlatform={setActivePlatform} 
      />

      <div className="max-w-[1400px] mx-auto px-6 md:px-12 pt-12">
        {/* 2. Tell the grid to fetch 'only-tv' */}
        <MovieGrid activePlatform={activePlatform} type="only-tv" />
      </div>
      
    </div>
  );
};

export default TVShows;