import express from 'express';
import axios from 'axios';

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

export default router;