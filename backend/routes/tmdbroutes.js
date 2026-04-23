import express from 'express';
import axios from 'axios';

const router = express.Router();

/**
 * HELPER: Enriches a list of results with runtime/episode duration
 * Added a small delay to prevent TMDB 429 Rate Limit errors
 */
const enrichResults = async (results, apiKey) => {
  const enriched = [];
  
  // We process in small chunks of 5 to keep the server stable and fast
  for (let i = 0; i < results.length; i++) {
    const item = results[i];
    try {
      const isTV = item.media_type === 'tv' || item.first_air_date;
      const type = isTV ? 'tv' : 'movie';

      const detailRes = await axios.get(
        `https://api.themoviedb.org/3/${type}/${item.id}?api_key=${apiKey}`
      );

      const runtime = isTV 
        ? (detailRes.data.episode_run_time?.[0] || 0) 
        : (detailRes.data.runtime || 0);

      enriched.push({ 
        ...item, 
        runtime, 
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
    const [page1, page2] = await Promise.all([
      axios.get(`https://api.themoviedb.org/3/trending/all/day?api_key=${apiKey}&page=1`),
      axios.get(`https://api.themoviedb.org/3/trending/all/day?api_key=${apiKey}&page=2`)
    ]);

    const combinedResults = [...page1.data.results, ...page2.data.results];
    const enriched = await enrichResults(combinedResults.slice(0, 30), apiKey); // Limit to 20 for slider performance

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

    const tmdbPage1 = (uiPage * 2) - 1;
    const tmdbPage2 = uiPage * 2;

    let providerQuery = '';
    if (provider !== 'all') {
      const providers = { 
        'netflix': 8, 
        'prime': 119, 
        'disney': 337, 
        'max': 1899, // Updated Max ID
        'apple': 350, 
        'crunchyroll': 283 
      };
      // Added flatrate to ensure subscription results only
      providerQuery = `&with_watch_providers=${providers[provider]}&watch_region=US&with_watch_monetization_types=flatrate`;
    }

    const baseUrl = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&sort_by=popularity.desc${providerQuery}`;

    const [p1, p2] = await Promise.all([
      axios.get(`${baseUrl}&page=${tmdbPage1}`),
      axios.get(`${baseUrl}&page=${tmdbPage2}`)
    ]);

    const combined = [...p1.data.results, ...p2.data.results];
    const enriched = await enrichResults(combined.slice(0, 30), apiKey);

    res.json({ results: enriched });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch movies' });
  }
});

// GET /api/movies/only-tv
router.get('/only-tv', async (req, res) => {
  try {
    const apiKey = process.env.TMDB_API_KEY;
    const uiPage = parseInt(req.query.page) || 1;
    const provider = req.query.provider || 'all';

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

    // Use /discover/tv instead of /discover/movie
    const baseUrl = `https://api.themoviedb.org/3/discover/tv?api_key=${apiKey}&sort_by=popularity.desc${providerQuery}`;

    const [p1, p2] = await Promise.all([
      axios.get(`${baseUrl}&page=${tmdbPage1}`),
      axios.get(`${baseUrl}&page=${tmdbPage2}`)
    ]);

    const combined = [...p1.data.results, ...p2.data.results];
    // Use the same enrichment helper we built earlier
    const enriched = await enrichResults(combined.slice(0, 30), apiKey);

    res.json({ results: enriched });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch TV shows' });
  }
});

// 3. TOP MOVIES
router.get('/top-movies', async (req, res) => {
  try {
    const apiKey = process.env.TMDB_API_KEY;
    const response = await axios.get(`https://api.themoviedb.org/3/movie/top_rated?api_key=${apiKey}&page=1`);
    const enriched = await enrichResults(response.data.results.slice(0, 15), apiKey);
    res.json({ results: enriched });
  } catch (error) {
    res.status(500).json({ error: 'Failed' });
  }
});

// 4. TOP TV
router.get('/top-tv', async (req, res) => {
  try {
    const apiKey = process.env.TMDB_API_KEY;
    const response = await axios.get(`https://api.themoviedb.org/3/tv/top_rated?api_key=${apiKey}&page=1`);
    const enriched = await enrichResults(response.data.results.slice(0, 15), apiKey);
    res.json({ results: enriched });
  } catch (error) {
    res.status(500).json({ error: 'Failed' });
  }
});

export default router;