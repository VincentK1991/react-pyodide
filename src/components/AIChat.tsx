import { useState } from "react";
import { aiService } from "../services/aiService";

interface AIChatProps {
  defaultInstructions?: string;
}

const AIChat: React.FC<AIChatProps> = ({
  defaultInstructions = "You are a helpful coding assistant that specializes in Python and JavaScript.",
}) => {
  const [input, setInput] = useState<string>("");
  const [response, setResponse] = useState<string>("");
  const [instructions, setInstructions] = useState<string>(defaultInstructions);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await aiService.generateResponse({
        input,
        instructions,
      });

      setResponse(result.response);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("Error generating AI response:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="border border-gray-300 rounded-md overflow-hidden shadow-md bg-white">
      <div className="bg-gray-800 text-white p-3 font-medium">AI Assistant</div>

      <div className="p-4">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Assistant Instructions
          </label>
          <textarea
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md text-sm"
            rows={2}
            placeholder="Instructions for the AI assistant..."
          />
        </div>

        <form onSubmit={handleSubmit} className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Your Question
          </label>
          <div className="flex">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 p-2 border border-gray-300 rounded-l-md"
              placeholder="Ask something about coding..."
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className={`px-4 py-2 rounded-r-md text-white font-medium ${
                isLoading || !input.trim()
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-500 hover:bg-blue-600"
              }`}
            >
              {isLoading ? "Thinking..." : "Ask"}
            </button>
          </div>
        </form>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
            {error}
          </div>
        )}

        {response && (
          <div className="mb-4">
            <h3 className="text-sm font-semibold mb-2 text-gray-700">
              Response:
            </h3>
            <div className="bg-gray-100 p-3 rounded-md whitespace-pre-wrap text-sm">
              {response}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIChat;
