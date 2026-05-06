import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, MapPin, Calendar, Activity } from 'lucide-react';
import MovieCard from '../components/MovieCard';

const PersonDetails = () => {
  const { id } = useParams();
  const [person, setPerson] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPerson = async () => {
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:5000/api/movies/person/${id}`);
        const data = await res.json();
        setPerson(data);
      } catch (error) {
        console.error("Failed to fetch person:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPerson();
    window.scrollTo(0, 0);
  }, [id]);

  if (loading || !person) {
    return (
      <div className="h-screen bg-vfxBlack flex items-center justify-center text-aiAccent font-cinematic uppercase tracking-widest animate-pulse">
        Accessing Personnel Files...
      </div>
    );
  }

  // Calculate Age if birthday exists and they are still alive
  const calculateAge = (birthday) => {
    if (!birthday) return null;
    const ageDifMs = Date.now() - new Date(birthday).getTime();
    const ageDate = new Date(ageDifMs);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  };

  return (
    <div className="bg-vfxBlack min-h-screen text-white font-cinematic relative overflow-hidden pb-24">
      
      {/* Background ambient glow based on standard app accent */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1000px] h-[500px] bg-aiAccent/5 blur-[150px] rounded-full pointer-events-none z-0" />

      <div className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-12 pt-8 md:pt-24">
        
        {/* Back Button */}
        <Link to={-1} className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors uppercase tracking-widest text-xs font-bold mb-8 md:mb-12">
          <ChevronLeft className="w-4 h-4" /> Go Back
        </Link>

        {/* --- TOP SECTION: PROFILE & BIO --- */}
        <div className="flex flex-col md:flex-row gap-8 md:gap-16 items-start mb-20">
          
          {/* Left: Headshot */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full md:w-1/4 max-w-[350px] shrink-0"
          >
            {person.profile_path ? (
              <img
                src={`https://image.tmdb.org/t/p/h632${person.profile_path}`}
                alt={person.name}
                className="w-full rounded-lg shadow-[0_0_40px_rgba(0,0,0,0.5)] border border-white/10"
              />
            ) : (
              <div className="w-full aspect-[2/3] bg-white/5 rounded-lg border border-white/10 flex items-center justify-center text-gray-500">
                No Image Available
              </div>
            )}
          </motion.div>

          {/* Right: Info */}
          <div className="w-full md:w-3/4 pt-2">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-5xl lg:text-6xl font-black uppercase leading-none mb-6 drop-shadow-2xl"
            >
              {person.name}
            </motion.h1>

            {/* Quick Stats Grid */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="flex flex-wrap gap-6 mb-8 border-y border-white/10 py-6"
            >
              {person.known_for_department && (
                <div>
                  <p className="text-gray-500 text-[10px] uppercase tracking-widest mb-1 flex items-center gap-1"><Activity className="w-3 h-3"/> Department</p>
                  <p className="text-white text-sm tracking-wider uppercase font-bold">{person.known_for_department}</p>
                </div>
              )}
              {person.birthday && (
                <div>
                  <p className="text-gray-500 text-[10px] uppercase tracking-widest mb-1 flex items-center gap-1"><Calendar className="w-3 h-3"/> Born</p>
                  <p className="text-white text-sm tracking-wider uppercase font-bold">
                    {person.birthday} {!person.deathday && `(Age ${calculateAge(person.birthday)})`}
                  </p>
                </div>
              )}
              {person.place_of_birth && (
                <div>
                  <p className="text-gray-500 text-[10px] uppercase tracking-widest mb-1 flex items-center gap-1"><MapPin className="w-3 h-3"/> Location</p>
                  <p className="text-white text-sm tracking-wider uppercase font-bold">{person.place_of_birth}</p>
                </div>
              )}
            </motion.div>

            {/* Biography */}
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              transition={{ delay: 0.2 }}
            >
              <h3 className="text-sm tracking-widest uppercase text-gray-500 mb-3 border-b border-white/10 pb-2">Biography</h3>
              {person.biography ? (
                <p className="text-gray-300 font-light leading-relaxed text-base md:text-l max-w-4xl whitespace-pre-line">
                  {/* TMDB bios can be long, so we display it cleanly. You could add a "Read More" clamp here later if desired. */}
                  {person.biography}
                </p>
              ) : (
                <p className="text-gray-600 font-light italic">No biography available on record.</p>
              )}
            </motion.div>
          </div>
        </div>

        {/* --- BOTTOM SECTION: FILMOGRAPHY GRID --- */}
        {person.combined_credits?.cast?.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="border-t border-white/10 pt-12"
          >
            <h3 className="text-2xl md:text-3xl font-black tracking-widest uppercase text-white mb-8">
              Known For
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-5 auto-rows-[minmax(250px,auto)]">
              {person.combined_credits.cast.map((item, idx) => (
                <MovieCard key={`${item.id}-${idx}`} item={item} index={idx} />
              ))}
            </div>
          </motion.div>
        )}

      </div>
    </div>
  );
};

export default PersonDetails;