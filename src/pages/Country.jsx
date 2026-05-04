import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps';
import { motion } from 'framer-motion';
import ShareBanner from '../components/ShareBanner';

// 1. Import the ISO converter and its English data
import countries from "i18n-iso-countries";
import enLocale from "i18n-iso-countries/langs/en.json";

// 2. Register the locale (required for the package to know how to read names)
countries.registerLocale(enLocale);

const geoUrl = "/world-countries.json";

const Country = () => {
  const navigate = useNavigate();
  const [tooltipContent, setTooltipContent] = useState("");

  const handleCountryClick = (geo) => {
    const countryName = geo.properties.name;
    const isoCode = countries.alpha3ToAlpha2(geo.id) || countries.getAlpha2Code(countryName, 'en');    
    // Only navigate if we have a valid ISO code
    if (isoCode) {
      navigate(`/country/${isoCode}/${countryName}`);
    }
    else {
      // Just in case a user clicks Antarctica or a disputed territory without a TMDB database
      console.warn(`MoodStream couldn't find a valid 2-letter code for ${countryName}`);
    }
  };

  return (
    <div className="min-h-screen bg-vfxBlack text-white font-cinematic pt-24 pb-12 px-6 flex flex-col items-center">
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8 z-10"
      >
        <h1 className="text-3xl md:text-5xl font-normal uppercase tracking-widest text-white mt-4">
          Global Cinema
        </h1>
        <p className="text-gray-400 font-light tracking-wider text-sm">
          Select a region to explore its top movies and series.
        </p>
        
        {/* Dynamic Tooltip */}
        <div className="h-8 text-aiAccent font-bold uppercase tracking-widest text-lg">
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
                        fill: "grey", // Base dark color
                        stroke: "black",  // Subtle borders
                        strokeWidth: 0.4,
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
        </ComposableMap>
      </motion.div>
      <ShareBanner />
    </div>
  );
};

export default Country;