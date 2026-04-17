import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import tmdbRoutes from './routes/tmdbroutes.js';
// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors()); // Allows your React frontend to make requests here
app.use(express.json()); // Allows us to parse JSON bodies

// Routes
app.use('/api/movies', tmdbRoutes);

// Basic health check route
app.get('/', (req, res) => {
  res.send('MoodStream API is running...');
});

// Start the server
app.listen(PORT, () => {
  console.log(`🎬 MoodStream Backend running on http://localhost:${PORT}`);
});