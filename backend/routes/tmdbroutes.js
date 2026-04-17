import express from 'express';
import axios from 'axios';

const router = express.Router();

// GET /api/movies/trending
// Fetches the top trending movies from TMDB
router.get('/trending', async (req, res) => {
  try {
    const apiKey = process.env.VITE_TMDB_API_KEY;
    
    // Make the request to TMDB from the server
    const response = await axios.get(
      `https://api.themoviedb.org/3/trending/all/day?api_key=${apiKey}`
    );

    // Send the data back to our React frontend
    res.json(response.data);
    
  } catch (error) {
    console.error("Error fetching from TMDB:", error.message);
    res.status(500).json({ error: 'Failed to fetch trending movies' });
  }
});

export default router;