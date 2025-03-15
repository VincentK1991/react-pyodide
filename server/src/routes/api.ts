import { Router, Request, Response } from 'express';
import { aiService } from '../services/aiService';

const router = Router();

// Health check endpoint
router.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', message: 'API is healthy' });
});

// Get Python packages
router.get('/packages', (req: Request, res: Response) => {
  const pythonPackages = [
    { name: 'numpy', description: 'Numerical computing library' },
    { name: 'pandas', description: 'Data analysis and manipulation library' },
    { name: 'matplotlib', description: 'Visualization library' },
    { name: 'scikit-learn', description: 'Machine learning library' }
  ];
  
  res.status(200).json(pythonPackages);
});

// Example endpoint to execute Python code (mock)
router.post('/execute', (req: Request, res: Response) => {
  const { code } = req.body;
  
  if (!code) {
    return res.status(400).json({ error: 'No code provided' });
  }
  
  // In a real implementation, you might use child_process to run Python
  // or integrate with a service that can execute code safely
  
  // Mock response
  res.status(200).json({
    result: 'Code execution simulated on server',
    output: `Received code: ${code.substring(0, 50)}${code.length > 50 ? '...' : ''}`,
    executedAt: new Date().toISOString()
  });
});

// AI response endpoint
router.post('/ai/response', async (req: Request, res: Response) => {
  const { input, model, instructions } = req.body;
  
  if (!input) {
    return res.status(400).json({ error: 'No input provided' });
  }
  
  try {
    const response = await aiService.generateResponse({
      input,
      model,
      instructions
    });
    
    res.status(200).json({
      response,
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in AI response endpoint:', error);
    res.status(500).json({ 
      error: 'Failed to generate AI response',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router; 