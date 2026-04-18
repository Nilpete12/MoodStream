import React from 'react';
import Hero from '../components/Hero';
import MediaSlider from '../components/MediaSlider';
import ExploreMore from '../components/ExploreMore';
import ShareBanner from '../components/ShareBanner';


const Home = () => {
  return (
    <div className="bg-vfxBlack min-h-screen">
      <Hero />

      <MediaSlider 
        title="Trending" 
        subtitle="Now" 
        apiEndpoint="/api/movies/trending" 
        desc="ddwd"
      />

      <MediaSlider
      title ="Top Rated"
      subtitle="Movies"
      apiEndpoint="/api/movies/top-movies"
       />

       <MediaSlider
      title ="Top Rated"
      subtitle="Series"
      apiEndpoint="/api/movies/top-tv"
       />

       <ExploreMore />
       <ShareBanner />
    </div>
  );
};

export default Home;