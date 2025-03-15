import { useState, useRef, useEffect } from "react";
import { aiService } from "../services/aiService";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface ChatBoxProps {
  defaultInstructions?: string;
}

const ChatBox: React.FC<ChatBoxProps> = ({
  defaultInstructions = "You are a helpful coding assistant that specializes in Python and JavaScript.",
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>("");
  const [instructions, setInstructions] = useState<string>(defaultInstructions);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom of messages when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input field when component mounts
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim() || isLoading) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setError(null);

    try {
      // Add loading message
      const loadingId = "loading-" + Date.now().toString();
      setMessages((prev) => [
        ...prev,
        {
          id: loadingId,
          role: "assistant",
          content: "...",
          timestamp: new Date(),
        },
      ]);

      // Get AI response
      const result = await aiService.generateResponse({
        input,
        instructions,
      });

      // Replace loading message with actual response
      setMessages((prev) =>
        prev
          .filter((msg) => msg.id !== loadingId)
          .concat({
            id: Date.now().toString(),
            role: "assistant",
            content: result.response,
            timestamp: new Date(),
          })
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("Error generating AI response:", err);

      // Remove loading message if there was an error
      setMessages((prev) =>
        prev.filter((msg) => !msg.id.startsWith("loading-"))
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px] border border-gray-300 rounded-md overflow-hidden shadow-md bg-white">
      <div className="bg-gray-800 text-white p-3 font-medium flex justify-between items-center">
        <span>AI Chat Assistant</span>
        <button
          onClick={() => setMessages([])}
          className="text-xs bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded"
        >
          Clear Chat
        </button>
      </div>

      <div className="p-2 mb-2">
        <details className="text-sm">
          <summary className="cursor-pointer text-gray-700 font-medium">
            Assistant Instructions
          </summary>
          <textarea
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            className="w-full p-2 mt-2 border border-gray-300 rounded-md text-sm"
            rows={2}
            placeholder="Instructions for the AI assistant..."
          />
        </details>
      </div>

      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-10">
            <p>No messages yet. Start a conversation!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.role === "user"
                      ? "bg-blue-500 text-white"
                      : message.content === "..."
                      ? "bg-gray-200 text-gray-800 animate-pulse"
                      : "bg-gray-200 text-gray-800"
                  }`}
                >
                  <div className="whitespace-pre-wrap">{message.content}</div>
                  <div className="text-xs mt-1 opacity-70">
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {error && (
        <div className="p-2 bg-red-100 text-red-700 text-sm border-t border-red-200">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="p-2 border-t border-gray-300 bg-white"
      >
        <div className="flex">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 p-2 border border-gray-300 rounded-l-md"
            placeholder="Type your message..."
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
            {isLoading ? "Sending..." : "Send"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatBox;
