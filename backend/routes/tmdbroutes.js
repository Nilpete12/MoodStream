import express from 'express';
import axios from 'axios';
axios.defaults.headers.common['User-Agent'] = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
const router = express.Router();

// 1. CREATE THE CACHE (Zero dependencies required!)
const cache = new Map();
const CACHE_DURATION = 1000 * 60 * 30; // 30 minutes

// Helper to check and set cache
const getFromCache = (key) => {
  const cached = cache.get(key);
  if (cached && (Date.now() - cached.timestamp < CACHE_DURATION)) {
    return cached.data;
  }
  return null;
};

const saveToCache = (key, data) => {
  cache.set(key, { data, timestamp: Date.now() });
};

/**
 * HELPER: Enriches a list of results with runtime/episode duration
 * Uses a for...of loop to prevent TMDB Rate Limit (429) errors
 */
const enrichResults = async (results, apiKey) => {
  const enriched = [];
  for (const item of results) {
    try {
      const isTV = item.media_type === 'tv' || item.first_air_date;
      const type = isTV ? 'tv' : 'movie';
      
      const detailRes = await axios.get(
        `https://api.themoviedb.org/3/${type}/${item.id}?api_key=${apiKey}`
      );
      
      enriched.push({ 
        ...item, 
        runtime: isTV ? (detailRes.data.episode_run_time?.[0] || 0) : (detailRes.data.runtime || 0),
        media_type: type 
      });
    } catch (err) {
      enriched.push({ ...item, runtime: 0 });
    }
  }
  return enriched;
};

// 1. TRENDING
router.get('/trending', async (req, res) => {
  try {
    const apiKey = process.env.TMDB_API_KEY;
    const cacheKey = 'trending-home';
    
    const cachedData = getFromCache(cacheKey);
    if (cachedData) {
      console.log(`⚡ Serving ${cacheKey} from Memory Cache!`);
      return res.json({ results: cachedData });
    }

    const [page1, page2] = await Promise.all([
      axios.get(`https://api.themoviedb.org/3/trending/all/day?api_key=${apiKey}&page=1`),
      axios.get(`https://api.themoviedb.org/3/trending/all/day?api_key=${apiKey}&page=2`)
    ]);

    const combinedResults = [...page1.data.results, ...page2.data.results];
    const enriched = await enrichResults(combinedResults.slice(0, 30), apiKey); 
    
    saveToCache(cacheKey, enriched);
    res.json({ results: enriched });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch trending' });
  }
});

// 2. ONLY MOVIES (The Big Grid)
router.get('/only-movies', async (req, res) => {
  try {
    const apiKey = process.env.TMDB_API_KEY;
    const uiPage = parseInt(req.query.page) || 1;
    const provider = req.query.provider || 'all';

    const cacheKey = `only-movies-page${uiPage}-prov${provider}`;
    const cachedData = getFromCache(cacheKey);
    
    if (cachedData) {
      console.log(`⚡ Serving ${cacheKey} from Memory Cache!`);
      return res.json({ results: cachedData });
    }

    const tmdbPage1 = (uiPage * 2) - 1;
    const tmdbPage2 = uiPage * 2;

    let providerQuery = '';
    if (provider !== 'all') {
      const providers = { 'netflix': 8, 'prime': 119, 'disney': 337, 'max': 1899, 'apple': 350, 'crunchyroll': 283 };
      providerQuery = `&with_watch_providers=${providers[provider]}&watch_region=US&with_watch_monetization_types=flatrate`;
    }

    const baseUrl = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&sort_by=popularity.desc${providerQuery}`;

    const [p1, p2] = await Promise.all([
      axios.get(`${baseUrl}&page=${tmdbPage1}`),
      axios.get(`${baseUrl}&page=${tmdbPage2}`)
    ]);

    const combined = [...p1.data.results, ...p2.data.results];
    const enriched = await enrichResults(combined.slice(0, 30), apiKey);

    saveToCache(cacheKey, enriched);
    res.json({ results: enriched });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch movies' });
  }
});

// 3. ONLY TV (The Big Grid)
router.get('/only-tv', async (req, res) => {
  try {
    const apiKey = process.env.TMDB_API_KEY;
    const uiPage = parseInt(req.query.page) || 1;
    const provider = req.query.provider || 'all';

    const cacheKey = `only-tv-page${uiPage}-prov${provider}`;
    const cachedData = getFromCache(cacheKey);
    
    if (cachedData) {
      console.log(`⚡ Serving ${cacheKey} from Memory Cache!`);
      return res.json({ results: cachedData });
    }

    const tmdbPage1 = (uiPage * 2) - 1;
    const tmdbPage2 = uiPage * 2;

    let providerQuery = '';
    if (provider !== 'all') {
      const providers = { 
        'netflix': 8, 'prime': 119, 'disney': 337, 
        'max': 1899, 'apple': 350, 'crunchyroll': 283 
      };
      providerQuery = `&with_watch_providers=${providers[provider]}&watch_region=US&with_watch_monetization_types=flatrate`;
    }

    const baseUrl = `https://api.themoviedb.org/3/discover/tv?api_key=${apiKey}&sort_by=popularity.desc${providerQuery}`;

    const [p1, p2] = await Promise.all([
      axios.get(`${baseUrl}&page=${tmdbPage1}`),
      axios.get(`${baseUrl}&page=${tmdbPage2}`)
    ]);

    const combined = [...p1.data.results, ...p2.data.results];
    const enriched = await enrichResults(combined.slice(0, 30), apiKey);

    saveToCache(cacheKey, enriched);
    res.json({ results: enriched });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch TV shows' });
  }
});

// 4. TOP MOVIES
router.get('/top-movies', async (req, res) => {
  try {
    const apiKey = process.env.TMDB_API_KEY;
    const cacheKey = 'top-movies';
    
    const cachedData = getFromCache(cacheKey);
    if (cachedData) {
      console.log(`⚡ Serving ${cacheKey} from Memory Cache!`);
      return res.json({ results: cachedData });
    }

    const response = await axios.get(`https://api.themoviedb.org/3/movie/top_rated?api_key=${apiKey}&page=1`);
    const enriched = await enrichResults(response.data.results.slice(0, 15), apiKey);
    
    // FIXED: Was missing saveToCache!
    saveToCache(cacheKey, enriched);
    res.json({ results: enriched });
  } catch (error) {
    res.status(500).json({ error: 'Failed' });
  }
});

// 5. TOP TV
router.get('/top-tv', async (req, res) => {
  try {
    const apiKey = process.env.TMDB_API_KEY;
    const cacheKey = 'top-tv';
    
    const cachedData = getFromCache(cacheKey);
    if (cachedData) {
      console.log(`⚡ Serving ${cacheKey} from Memory Cache!`);
      return res.json({ results: cachedData });
    }

    const response = await axios.get(`https://api.themoviedb.org/3/tv/top_rated?api_key=${apiKey}&page=1`);
    const enriched = await enrichResults(response.data.results.slice(0, 15), apiKey);
    
    // FIXED: Was missing saveToCache!
    saveToCache(cacheKey, enriched);
    res.json({ results: enriched });
  } catch (error) {
    res.status(500).json({ error: 'Failed' });
  }
});

// GET /api/movies/by-genre/:genreId
router.get('/by-genre/:genreId', async (req, res) => {
  try {
    const { genreId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const apiKey = process.env.TMDB_API_KEY;

    // THE FIX: Map Movie Genre IDs to their closest TV Genre ID counterparts
    const tvGenreMap = {
      '28': '10759',  // Action -> Action & Adventure
      '878': '10765', // Sci-Fi -> Sci-Fi & Fantasy
      '27': '9648',   // Horror -> Mystery (Closest TV equivalent)
      '10749': '18',  // Romance -> Drama (Closest TV equivalent)
      '53': '9648',   // Thriller -> Mystery
      '16': '16',     // Animation
      '35': '35',     // Comedy
      '99': '99',     // Documentary
      '18': '18',     // Drama
      '10751': '10751', // Family
      '14': '10765'   // Fantasy -> Sci-Fi & Fantasy
    };
    
    // Fallback to the original ID if there's no special mapping
    const tvGenreId = tvGenreMap[genreId] || genreId;

    const cacheKey = `genre-${genreId}-page${page}`;
    if (getFromCache(cacheKey)) {
      console.log(`⚡ Serving ${cacheKey} from Memory Cache!`);
      return res.json(getFromCache(cacheKey));
    }

    const tmdbPage1 = (page * 2) - 1;
    const tmdbPage2 = page * 2;

    const [movieP1, movieP2, tvP1, tvP2] = await Promise.all([
      axios.get(`https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&with_genres=${genreId}&sort_by=popularity.desc&page=${tmdbPage1}`),
      axios.get(`https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&with_genres=${genreId}&sort_by=popularity.desc&page=${tmdbPage2}`),
      // Use the corrected TV ID here:
      axios.get(`https://api.themoviedb.org/3/discover/tv?api_key=${apiKey}&with_genres=${tvGenreId}&sort_by=popularity.desc&page=${tmdbPage1}`),
      axios.get(`https://api.themoviedb.org/3/discover/tv?api_key=${apiKey}&with_genres=${tvGenreId}&sort_by=popularity.desc&page=${tmdbPage2}`)
    ]);

    const combinedMovies = [...movieP1.data.results, ...movieP2.data.results];
    const combinedTV = [...tvP1.data.results, ...tvP2.data.results];

    const enrichedMovies = await enrichResults(combinedMovies.slice(0, 30), apiKey);
    const enrichedTV = await enrichResults(combinedTV.slice(0, 30), apiKey);

    const finalData = { movies: enrichedMovies, tv: enrichedTV };
    
    saveToCache(cacheKey, finalData);
    res.json(finalData);

  } catch (error) {
    console.error("Genre fetch error:", error.message);
    res.status(500).json({ error: 'Failed to fetch genre results' });
  }
});

// GET /api/movies/by-country/:isoCode
router.get('/by-country/:isoCode', async (req, res) => {
  try {
    const { isoCode } = req.params;
    const page = parseInt(req.query.page) || 1;
    const apiKey = process.env.TMDB_API_KEY;

    const cacheKey = `country-${isoCode}-page${page}`;
    if (getFromCache(cacheKey)) {
      console.log(`⚡ Serving ${cacheKey} from Memory Cache!`);
      return res.json(getFromCache(cacheKey));
    }

    // Fetch BOTH movies and TV shows for this specific country
    const [movieRes, tvRes] = await Promise.all([
      axios.get(`https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&with_origin_country=${isoCode}&sort_by=popularity.desc&page=${page}`),
      axios.get(`https://api.themoviedb.org/3/discover/tv?api_key=${apiKey}&with_origin_country=${isoCode}&sort_by=popularity.desc&page=${page}`)
    ]);

    // Take top 15 of each to make a 30-item grid
    const topMovies = movieRes.data.results.slice(0, 15);
    const topTV = tvRes.data.results.slice(0, 16);

    // Combine them into a single array (interleaving them makes for a cool mixed grid)
    const combined = [];
    for (let i = 0; i < 15; i++) {
      if (topMovies[i]) combined.push(topMovies[i]);
      if (topTV[i]) combined.push(topTV[i]);
    }

    // Enrich the combined list
    const enriched = await enrichResults(combined, apiKey);

    saveToCache(cacheKey, enriched);
    res.json({ results: enriched });

  } catch (error) {
    console.error("Country fetch error:", error.message);
    res.status(500).json({ error: 'Failed to fetch country results' });
  }
});

export default router;