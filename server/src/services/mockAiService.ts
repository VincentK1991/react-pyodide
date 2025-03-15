/**
 * Mock AI service for development and testing
 * Used when no OpenAI API key is provided
 */

interface AIResponseOptions {
  model?: string;
  instructions?: string;
  input: string;
}

export const mockAiService = {
  /**
   * Generate a mock response
   * @param options - Configuration options for the AI response
   * @returns The generated mock response text
   */
  async generateResponse(options: AIResponseOptions): Promise<string> {
    const { input, instructions } = options;
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Generate a mock response based on the input
    if (input.toLowerCase().includes('python')) {
      return `Here's a Python example that might help:

\`\`\`python
def hello_world():
    print("Hello, World!")
    
hello_world()
\`\`\`

This is a simple function that prints "Hello, World!" when called. You can modify it to suit your needs.`;
    }
    
    if (input.toLowerCase().includes('javascript')) {
      return `Here's a JavaScript example:

\`\`\`javascript
function helloWorld() {
  console.log("Hello, World!");
}

helloWorld();
\`\`\`

This function will log "Hello, World!" to the console when executed.`;
    }
    
    if (input.toLowerCase().includes('help')) {
      return `I'm a mock AI assistant for development purposes. I can provide simple responses about Python and JavaScript. 

Try asking about:
- Python examples
- JavaScript syntax
- Basic coding concepts

Note: This is a mock service since no OpenAI API key was provided. For full functionality, please add your API key to the .env file.`;
    }
    
    // Default response
    return `I'm a mock AI assistant for development purposes. Your input was: "${input}".

The instructions provided were: "${instructions || 'No instructions provided'}".

For full AI functionality, please add your OpenAI API key to the .env file.`;
  }
}; 