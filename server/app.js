import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import routes from './routes/index.js';
import errorHandler from './middleware/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '.env') });

const app = express();

// Middleware for request parsing, logging, and cross-origin access.
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API routes are mounted from a central entry point.
app.use('/api', routes);

// Simple root endpoint for quick verification.
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'WolloShare API is running',
  });
});

// Handle unknown routes with a consistent error response.
app.use((req, res, next) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
});

app.use(errorHandler);

export default app;
