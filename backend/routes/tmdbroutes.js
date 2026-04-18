import express from 'express';
import axios from 'axios';

const router = express.Router();

// GET /api/movies/trending
// Fetches the top trending movies from TMDB
router.get('/trending', async (req, res) => {
  try {
    const apiKey = process.env.VITE_TMDB_API_KEY;

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


// GET /api/movies/top-movies
router.get('/top-movies', async (req, res) => {
  try {
    const apiKey = process.env.VITE_TMDB_API_KEY;
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
    const apiKey = process.env.VITE_TMDB_API_KEY;
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