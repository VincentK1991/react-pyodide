import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import apiRoutes from './routes/api';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api', apiRoutes);

// Simple root route
app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Welcome to the Pyodide Express Server' });
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  // Serve static files from the React app
  app.use(express.static(path.join(__dirname, '../../dist')));

  // Handle any requests that don't match the ones above
  app.get('*', (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, '../../dist/index.html'));
  });
}

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
  console.log(`API available at http://localhost:${PORT}/api`);
}); 