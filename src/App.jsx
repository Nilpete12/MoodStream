import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Movies from './pages/Movie';
import TVShows from './pages/TVShows';
import GenreExplore from './pages/GenreExplore';
import GenreResults from './pages/GenreResults';
import PersonDetails from './pages/PersonDetails';
import Country from './pages/Country';
import Watchlist from './pages/Watchlist';
import SearchResults from './pages/SearchResults';
import CountryResults from './pages/CountryResults';
import MediaDetails from './pages/MediaDetails';
import Header from './components/Header';
import Footer from './components/Footer';

function App() {
  return (
    <Router>
      {/* 1. Remove flex-col from the outer div to allow layering */}
      <div className="bg-vfxBlack text-white font-cinematic">
        
        {/* 2. Main content wrapper: needs z-index and solid background */}
        <div className="relative bg-vfxBlack shadow-2xl">
          <Header />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/movies" element={<Movies />} />
              <Route path="/tv-shows" element={<TVShows />} />
              <Route path="/genres" element={<GenreExplore />} />
              <Route path="/genre/:genreId/:genreName" element={<GenreResults />} />
              <Route path="/country" element={<Country />} />
              <Route path="/country/:isoCode/:countryName" element={<CountryResults />} />
              <Route path="/details/:type/:id" element={<MediaDetails />} />
              <Route path="/person/:id" element={<PersonDetails />} />
              <Route path="/search/:query" element={<SearchResults />} />
              <Route path="/watchlist" element={<Watchlist />} />
            </Routes>
          </main>
        </div>

        {/* 3. The Footer is now outside the main div and will be "uncovered" */}
        <Footer />

      </div>
    </Router>
  );
}

export default App;
