// API service for communicating with the Express server

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface PythonPackage {
  name: string;
  description: string;
}

interface ExecuteCodeResponse {
  result: string;
  output: string;
  executedAt: string;
}

export const apiService = {
  // Health check
  async checkHealth(): Promise<{ status: string; message: string }> {
    const response = await fetch(`${API_URL}/health`);
    if (!response.ok) {
      throw new Error('API health check failed');
    }
    return response.json();
  },

  // Get Python packages
  async getPackages(): Promise<PythonPackage[]> {
    const response = await fetch(`${API_URL}/packages`);
    if (!response.ok) {
      throw new Error('Failed to fetch packages');
    }
    return response.json();
  },

  // Execute Python code on the server
  async executeCode(code: string): Promise<ExecuteCodeResponse> {
    const response = await fetch(`${API_URL}/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to execute code');
    }
    
    return response.json();
  }
}; 