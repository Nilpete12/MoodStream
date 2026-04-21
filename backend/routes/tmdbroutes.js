import express from 'express';
import axios from 'axios';

const router = express.Router();

// GET /api/movies/trending
// Fetches the top trending movies from TMDB
router.get('/trending', async (req, res) => {
  try {
    const apiKey = process.env.TMDB_API_KEY;

    // 1. Fire both requests at the same time
    const [page1, page2] = await Promise.all([
      axios.get(`https://api.themoviedb.org/3/trending/all/day?api_key=${apiKey}&page=1`),
      axios.get(`https://api.themoviedb.org/3/trending/all/day?api_key=${apiKey}&page=2`)
    ]);

    // 2. Combine the results into one array
    const combinedResults = [...page1.data.results, ...page2.data.results];

    // 3. Send back the combined data
    res.json({
      page: 1,
      results: combinedResults,
      total_results: combinedResults.length
    });
    
  } catch (error) {
    console.error("Error fetching from TMDB:", error.message);
    res.status(500).json({ error: 'Failed to fetch trending movies' });
  }
});

// GET /api/movies/only-movies
router.get('/only-movies', async (req, res) => {
  try {
    const apiKey = process.env.TMDB_API_KEY;
    const uiPage = parseInt(req.query.page) || 1;
    const provider = req.query.provider || 'all';

    const tmdbPage1 = (uiPage * 2) - 1;
    const tmdbPage2 = uiPage * 2;

    // Map your frontend strings to TMDB Provider IDs
    let providerQuery = '';
    if (provider !== 'all') {
      const providers = {
        'netflix': 8,
        'prime': 119,
        'disney': 337,
        'max': 384,
        'apple': 350
      };
      // watch_region=US is required by TMDB when filtering by provider
      providerQuery = `&with_watch_providers=${providers[provider]}&watch_region=US`;
    }

    // Use /discover instead of /trending to get deep pagination and filters
    const baseUrl = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&sort_by=popularity.desc${providerQuery}`;

    const [p1, p2] = await Promise.all([
      axios.get(`${baseUrl}&page=${tmdbPage1}`),
      axios.get(`${baseUrl}&page=${tmdbPage2}`)
    ]);

    const combinedResults = [...p1.data.results, ...p2.data.results];
    res.json({ results: combinedResults });
    
  } catch (error) {
    console.error("Error fetching movies:", error.message);
    res.status(500).json({ error: 'Failed to fetch movies' });
  }
});


// GET /api/movies/top-movies
router.get('/top-movies', async (req, res) => {
  try {
    const apiKey = process.env.TMDB_API_KEY;
    const response = await axios.get(
      `https://api.themoviedb.org/3/movie/top_rated?api_key=${apiKey}&language=en-US&page=1`
    );
    
    // TMDB's specific movie endpoint doesn't return 'media_type', so we manually add it 
    // so your React MovieCard knows to render the "MOVIE" badge.
    const results = response.data.results.map(movie => ({ ...movie, media_type: 'movie' }));
    res.json({ results });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch top movies' });
  }
});

// GET /api/movies/top-tv
router.get('/top-tv', async (req, res) => {
  try {
    const apiKey = process.env.TMDB_API_KEY;
    const response = await axios.get(
      `https://api.themoviedb.org/3/tv/top_rated?api_key=${apiKey}&language=en-US&page=1`
    );
    
    // Manually add 'tv' media_type so your React MovieCard renders the "TV SERIES" badge.
    const results = response.data.results.map(show => ({ ...show, media_type: 'tv' }));
    res.json({ results });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch top TV shows' });
  }
});

export default router;