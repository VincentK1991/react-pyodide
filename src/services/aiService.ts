// AI service for interacting with the OpenAI API through our server

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface AIRequestOptions {
  input: string;
  model?: string;
  instructions?: string;
}

interface AIResponse {
  response: string;
  generatedAt: string;
}

export const aiService = {
  /**
   * Generate an AI response using the server endpoint
   * @param options - Configuration options for the AI response
   * @returns The generated response data
   */
  async generateResponse(options: AIRequestOptions): Promise<AIResponse> {
    const { input, model, instructions } = options;
    
    const response = await fetch(`${API_URL}/ai/response`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input,
        model,
        instructions
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to generate AI response');
    }
    
    return response.json();
  }
}; 