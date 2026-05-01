import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps';
import { motion } from 'framer-motion';
import ShareBanner from '../components/ShareBanner';

// This is a lightweight TopoJSON file of the world map provided by the react-simple-maps creators
// const geoUrl = "https://raw.githubusercontent.com/deldersveld/topojson/master/world-countries.json";
const geoUrl = "/world-countries.json"; 

// We need a quick dictionary to map full country names to their TMDB 2-letter codes
const countryCodes = {
  "India": "IN", "United States": "US", "Japan": "JP", "South Korea": "KR", 
  "United Kingdom": "GB", "France": "FR", "Spain": "ES", "Italy": "IT", 
  "Germany": "DE", "Brazil": "BR", "Mexico": "MX", "Canada": "CA"
  // You can expand this list!
};

const Country = () => {
  const navigate = useNavigate();
  const [tooltipContent, setTooltipContent] = useState("");

  const handleCountryClick = (geo) => {
    const countryName = geo.properties.name;
    const isoCode = countryCodes[countryName] || geo.id; // Fallback to geo.id if not in dictionary
    
    // Only navigate if we have a valid ISO code
    if (isoCode) {
      navigate(`/country/${isoCode}/${countryName}`);
    }
  };

  return (
    <div className="min-h-screen bg-vfxBlack text-white font-cinematic pt-24 pb-12 px-6 flex flex-col items-center">
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8 z-10"
      >
        <h1 className="text-3xl md:text-5xl font-normal uppercase tracking-widest text-white mb-2">
          Global Cinema
        </h1>
        <p className="text-gray-400 font-light tracking-wider text-sm">
          Select a region to explore its top movies and series.
        </p>
        
        {/* Dynamic Tooltip */}
        <div className="h-8 mt- text-aiAccent font-bold uppercase tracking-widest text-lg">
          {tooltipContent}
        </div>
      </motion.div>

      {/* The Map Canvas */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="w-full max-w-300 aspect-video md:aspect-2/1 bg-white/5 rounded-2xl overflow-hidden border border-white/10 shadow-2xl relative"
      >
        <ComposableMap projection="geoMercator" className="w-full h-full object-cover">
          <ZoomableGroup center={[0, 20]} zoom={1} minZoom={1} maxZoom={4}>
            <Geographies geography={geoUrl}>
              {({ geographies }) =>
                geographies.map((geo) => (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    onMouseEnter={() => setTooltipContent(geo.properties.name)}
                    onMouseLeave={() => setTooltipContent("")}
                    onClick={() => handleCountryClick(geo)}
                    style={{
                      default: {
                        fill: "#1a1a1a", // Base dark color
                        stroke: "#333",  // Subtle borders
                        strokeWidth: 0.5,
                        outline: "none",
                      },
                      hover: {
                        fill: "#0A84FF", // Your aiAccent color on hover!
                        stroke: "#fff",
                        strokeWidth: 1,
                        outline: "none",
                        cursor: "pointer",
                      },
                      pressed: {
                        fill: "#fff",
                        outline: "none",
                      },
                    }}
                  />
                ))
              }
            </Geographies>
          </ZoomableGroup>
        </ComposableMap>
      </motion.div>
              < ShareBanner />
    </div>
  );
};

export default Country;