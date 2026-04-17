import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
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
