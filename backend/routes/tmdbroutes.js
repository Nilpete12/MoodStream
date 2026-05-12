import express from 'express';
import axios from 'axios';
axios.defaults.headers.common['User-Agent'] = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
const router = express.Router();
import { GoogleGenerativeAI } from '@google/generative-ai';

// POST /api/movies/ai-search
router.post('/ai-search', async (req, res) => {
  try {
    const { prompt } = req.body;
    console.log("1. Prompt received:", prompt); // <--- CHECKPOINT 1
    const tmdbApiKey = process.env.TMDB_API_KEY;
    const geminiApiKey = process.env.GEMINI_API_KEY;
    console.log("My Gemini Key is:", geminiApiKey ? "Found!" : "MISSING!");
    if (!geminiApiKey) {
      return res.status(500).json({ error: "GEMINI_API_KEY is missing from environment variables." });
    }
    // 1. The AI Prompt Engineering
    const genAI = new GoogleGenerativeAI(geminiApiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const systemPrompt = `
      You are an elite cinematic curator. The user will give you a mood, vibe, or aesthetic. 
      Recommend exactly 6 movies or TV shows that perfectly match this vibe.
      You MUST return ONLY a valid JSON array of strings containing the exact titles. 
      Do not include markdown, backticks, or any other text.
      Example output: ["Blade Runner 2049", "Dune", "Arrival", "Annihilation", "Ex Machina", "Interstellar"]
      
      User Mood: "${prompt}"
    `;
    console.log("2. Asking Gemini..."); // <--- CHECKPOINT 2
    // 2. Ask Gemini for the titles
    const aiResult = await model.generateContent(systemPrompt);
    const responseText = aiResult.response.text().trim();

    console.log("3. Gemini Responded:", responseText); // <--- CHECKPOINT 3
    
    // Safely parse the JSON array from Gemini
    let titles = [];
    try {
      titles = JSON.parse(responseText.replace(/```json/g, '').replace(/```/g, ''));
    } catch (e) {
      console.error("Failed to parse AI response:", responseText);
      return res.status(500).json({ error: "AI failed to format the response properly." });
    }

    // 3. Hydrate the titles with real TMDB Data
    // We search TMDB for each title Gemini gave us and grab the top result
    const hydratedResults = await Promise.all(
      titles.map(async (title) => {
        try {
          const tmdbRes = await axios.get(`https://api.themoviedb.org/3/search/multi?api_key=${tmdbApiKey}&query=${encodeURIComponent(title)}&page=1`);
          // Return the first valid movie/tv result that has a poster
          return tmdbRes.data.results.find(item => item.poster_path && (item.media_type === 'movie' || item.media_type === 'tv'));
        } catch (err) {
          return null;
        }
      })
    );

    // Filter out any nulls in case TMDB couldn't find a match
    const validResults = hydratedResults.filter(item => item !== null);

    res.json({ results: validResults });

  } catch (error) {
    console.error("AI Search Route Error:", error);
    res.status(500).json({ error: "Failed to process AI search." });
  }
});

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

// GET /api/movies/details/:type/:id
// Handles both 'movie' and 'tv' details + cast + trailers
router.get('/details/:type/:id', async (req, res) => {
  try {
    const { type, id } = req.params;
    const apiKey = process.env.TMDB_API_KEY;

    // Security check to ensure type is valid
    if (type !== 'movie' && type !== 'tv') {
      return res.status(400).json({ error: 'Invalid media type' });
    }

    const cacheKey = `details-${type}-${id}`;
    if (getFromCache(cacheKey)) {
      console.log(`⚡ Serving ${cacheKey} from Memory Cache!`);
      return res.json(getFromCache(cacheKey));
    }

    // append_to_response fetches the main data, PLUS the cast (credits), PLUS the trailers (videos)
    const url = `https://api.themoviedb.org/3/${type}/${id}?api_key=${apiKey}&append_to_response=credits,videos,watch/providers,similar`;    
    
    const response = await axios.get(url);
    const data = response.data;

    // Optional: Clean up the data before sending to frontend to save bandwidth
    const cleanedData = {
      ...data,
      // Just grab the top 10 actors
      credits: { cast: data.credits.cast.slice(0, 10) }, 
      // Just grab YouTube trailers
      videos: { 
        results: data.videos.results.filter(v => v.site === 'YouTube' && v.type === 'Trailer') 
      }
    };

    saveToCache(cacheKey, cleanedData);
    res.json(cleanedData);

  } catch (error) {
    console.error("Details fetch error:", error.message);
    res.status(500).json({ error: 'Failed to fetch media details' });
  }
});

// GET /api/movies/person/:id
router.get('/person/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const apiKey = process.env.TMDB_API_KEY;

    const cacheKey = `person-${id}`;
    if (getFromCache(cacheKey)) {
      console.log(`⚡ Serving ${cacheKey} from Memory Cache!`);
      return res.json(getFromCache(cacheKey));
    }

    // Fetch person details AND their combined movie/tv credits
    const url = `https://api.themoviedb.org/3/person/${id}?api_key=${apiKey}&append_to_response=combined_credits`;
    
    const response = await axios.get(url);
    const data = response.data;

    // Clean up the data: Filter out roles without posters and sort by popularity
    if (data.combined_credits && data.combined_credits.cast) {
      data.combined_credits.cast = data.combined_credits.cast
        .filter(item => item.poster_path) // Must have an image
        .sort((a, b) => b.popularity - a.popularity) // Show biggest hits first
        .slice(0, 30); // Top 30 titles is plenty for a grid
    }

    saveToCache(cacheKey, data);
    res.json(data);

  } catch (error) {
    console.error("Person fetch error:", error.message);
    res.status(500).json({ error: 'Failed to fetch person details' });
  }
});

// GET /api/movies/search?q=query&page=1
router.get('/search', async (req, res) => {
  try {
    const { q, page = 1 } = req.query;
    if (!q) return res.json({ results: [] });

    const apiKey = process.env.TMDB_API_KEY;
    const cacheKey = `search-${q}-page${page}`;

    if (getFromCache(cacheKey)) {
      return res.json(getFromCache(cacheKey));
    }

    const url = `https://api.themoviedb.org/3/search/multi?api_key=${apiKey}&query=${encodeURIComponent(q)}&page=${page}&include_adult=false`;
    
    const response = await axios.get(url);
    
    // Clean data: Only keep results that have an image (poster or profile)
    const cleanedResults = response.data.results.filter(
      item => item.poster_path || item.profile_path
    );

    const finalData = {
      ...response.data,
      results: cleanedResults
    };

    saveToCache(cacheKey, finalData);
    res.json(finalData);

  } catch (error) {
    console.error("Search fetch error:", error.message);
    res.status(500).json({ error: 'Failed to search' });
  }
});

export default router;