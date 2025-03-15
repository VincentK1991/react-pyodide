import OpenAI from 'openai';
import dotenv from 'dotenv';
import { mockAiService } from './mockAiService';

// Load environment variables
dotenv.config();

// Check if OpenAI API key is provided
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const USE_MOCK = !OPENAI_API_KEY || OPENAI_API_KEY === 'your_openai_api_key_here';

// Initialize OpenAI client if API key is provided
const openai = !USE_MOCK ? new OpenAI({
  apiKey: OPENAI_API_KEY,
}) : null;

interface AIResponseOptions {
  model?: string;
  instructions?: string;
  input: string;
}

export const aiService = {
  /**
   * Generate a response using OpenAI API or mock service
   * @param options - Configuration options for the AI response
   * @returns The generated response text
   */
  async generateResponse(options: AIResponseOptions): Promise<string> {
    // Use mock service if no API key is provided
    if (USE_MOCK) {
      console.log('Using mock AI service (no API key provided)');
      return mockAiService.generateResponse(options);
    }
    
    try {
      const { model = 'gpt-4o', instructions = 'You are a helpful coding assistant', input } = options;
      
      const response = await openai!.responses.create({
        model,
        instructions,
        input,
      });
      
      return response.output_text;
    } catch (error) {
      console.error('Error generating AI response:', error);
      throw new Error('Failed to generate AI response');
    }
  }
}; 