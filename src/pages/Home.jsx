import React from 'react';
import Hero from '../components/Hero';
import TrendingGrid from '../components/TrendingGrid';

const Home = () => {
  return (
    <div className="bg-vfxBlack min-h-screen">
      <Hero />
      <TrendingGrid />
    </div>
  );
};

export default Home;