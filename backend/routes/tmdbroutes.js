import express from 'express';
import axios from 'axios';

const router = express.Router();

/**
 * HELPER: Enriches a list of results with runtime/episode duration
 * Works for both Movies and TV Shows
 */
const enrichResults = async (results, apiKey) => {
  return await Promise.all(
    results.map(async (item) => {
      try {
        // Determine if it's a movie or TV show
        // Trending All returns 'media_type', others might not (we fallback based on properties)
        const isTV = item.media_type === 'tv' || item.first_air_date;
        const type = isTV ? 'tv' : 'movie';

        const detailRes = await axios.get(
          `https://api.themoviedb.org/3/${type}/${item.id}?api_key=${apiKey}`
        );

        // Movies have 'runtime', TV shows have 'episode_run_time' (array)
        const runtime = isTV 
          ? (detailRes.data.episode_run_time?.[0] || 0) 
          : (detailRes.data.runtime || 0);

        return { 
          ...item, 
          runtime, 
          media_type: type // Ensure media_type is always present for the frontend
        };
      } catch (err) {
        return { ...item, runtime: 0 };
      }
    })
  );
};

// 1. TRENDING (Home Sliders)
router.get('/trending', async (req, res) => {
  try {
    const apiKey = process.env.TMDB_API_KEY;
    const [page1, page2] = await Promise.all([
      axios.get(`https://api.themoviedb.org/3/trending/all/day?api_key=${apiKey}&page=1`),
      axios.get(`https://api.themoviedb.org/3/trending/all/day?api_key=${apiKey}&page=2`)
    ]);

    const combinedResults = [...page1.data.results, ...page2.data.results];
    const enriched = await enrichResults(combinedResults, apiKey);

    res.json({ results: enriched });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch trending' });
  }
});

// 2. ONLY MOVIES (Movie Page Grid)
router.get('/only-movies', async (req, res) => {
  try {
    const apiKey = process.env.TMDB_API_KEY;
    const uiPage = parseInt(req.query.page) || 1;
    const provider = req.query.provider || 'all';

    const tmdbPage1 = (uiPage * 2) - 1;
    const tmdbPage2 = uiPage * 2;

    // inside GET /api/movies/only-movies
    let providerQuery = '';
    if (provider !== 'all') {
      const providers = { 
        'netflix': 8, 
        'prime': 119,   // Amazon Prime Video
        'disney': 337,  // Disney+
        'max': 1899,    // The new "Max" ID (formerly HBO Max)
        'apple': 350,   // Apple TV+
        'crunchyroll': 283 // Crunchyroll
      };
  
  // watch_region=US is the most reliable for these global platforms
  providerQuery = `&with_watch_providers=${providers[provider]}&watch_region=US`;
}

    const baseUrl = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&sort_by=popularity.desc${providerQuery}`;

    const [p1, p2] = await Promise.all([
      axios.get(`${baseUrl}&page=${tmdbPage1}`),
      axios.get(`${baseUrl}&page=${tmdbPage2}`)
    ]);

    const combined = [...p1.data.results, ...p2.data.results].slice(0, 30);
    const enriched = await enrichResults(combined, apiKey);

    res.json({ results: enriched });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch movies' });
  }
});

// 3. TOP MOVIES (Home Sliders)
router.get('/top-movies', async (req, res) => {
  try {
    const apiKey = process.env.TMDB_API_KEY;
    const response = await axios.get(
      `https://api.themoviedb.org/3/movie/top_rated?api_key=${apiKey}&language=en-US&page=1`
    );
    
    const enriched = await enrichResults(response.data.results, apiKey);
    res.json({ results: enriched });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch top movies' });
  }
});

// 4. TOP TV (Home Sliders)
router.get('/top-tv', async (req, res) => {
  try {
    const apiKey = process.env.TMDB_API_KEY;
    const response = await axios.get(
      `https://api.themoviedb.org/3/tv/top_rated?api_key=${apiKey}&language=en-US&page=1`
    );
    
    const enriched = await enrichResults(response.data.results, apiKey);
    res.json({ results: enriched });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch top TV' });
  }
});

export default router;