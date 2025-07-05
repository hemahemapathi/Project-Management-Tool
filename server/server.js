import connectDB from './config/db.js';
import dotenv from 'dotenv';
import app from './app.js';
import cors from 'cors';

// Load environment variables from .env file
dotenv.config();

// Connect to database
connectDB();

// CORS configuration for local development
app.use(cors({
  origin: ['https://trek-project-management-tool.netlify.app'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Port configuration and server start
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API available at: http://localhost:${PORT}/api`);
});
