import { useState } from "react";
import CodeEditor, { CodeExample } from "./components/CodeEditor";
import { usePyodide } from "./components/PyodideProvider";
import { apiService } from "./services/api";
import ChatBox from "./components/ChatBox";
import FunctionExamples from "./components/FunctionExamples";

// Example definitions
const statisticalExamples: CodeExample[] = [
  {
    name: "Simple Correlation & Regression",
    file: "simple_correlation_regression.py",
    description:
      "Basic correlation analysis and simple linear regression using NumPy and statsmodels",
  },
  {
    name: "Scatter Plot with Regression",
    file: "scatter_plot_regression.py",
    description:
      "Visualize data with a scatter plot and regression line using matplotlib",
  },
  {
    name: "Multiple Regression Analysis",
    file: "multiple_regression.py",
    description:
      "Analyze relationships between multiple predictors and a dependent variable",
  },
  {
    name: "Time Series Analysis",
    file: "time_series_analysis.py",
    description: "Decompose and forecast time series data using ARIMA models",
  },
];

type TabType = "codeEditor" | "functionExamples";

function App() {
  const { loading } = usePyodide();
  const [serverStatus, setServerStatus] = useState<
    "unknown" | "online" | "offline"
  >("unknown");
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [showAIChat, setShowAIChat] = useState<boolean>(false);
  const [selectedExample, setSelectedExample] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("codeEditor");

  const checkServerHealth = async () => {
    setIsChecking(true);
    try {
      const response = await apiService.checkHealth();
      setServerStatus("online");
      setStatusMessage(response.message);
    } catch (error) {
      setServerStatus("offline");
      setStatusMessage("Server is not responding");
      console.error("Server health check failed:", error);
    } finally {
      setIsChecking(false);
    }
  };

  const loadExample = async (example: CodeExample) => {
    try {
      // Try to fetch from the examples directory first
      let response = await fetch(`/src/examples/${example.file}`);

      // If that fails, try the direct path
      if (!response.ok) {
        response = await fetch(`/examples/${example.file}`);
      }

      if (!response.ok) {
        throw new Error(`Failed to load example: ${response.statusText}`);
      }

      const code = await response.text();
      setSelectedExample(code);
      return code;
    } catch (error) {
      console.error("Error loading example:", error);
      return null;
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-8 text-center">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-bold text-gray-800">
          Python/JavaScript Code Editor
        </h1>
        <div className="flex items-center space-x-2">
          <button
            onClick={checkServerHealth}
            disabled={isChecking}
            className={`px-4 py-2 rounded-md text-white font-medium transition-colors ${
              isChecking
                ? "bg-gray-400 cursor-not-allowed"
                : serverStatus === "online"
                ? "bg-green-500 hover:bg-green-600"
                : serverStatus === "offline"
                ? "bg-red-500 hover:bg-red-600"
                : "bg-blue-500 hover:bg-blue-600"
            }`}
          >
            {isChecking
              ? "Checking..."
              : serverStatus === "unknown"
              ? "Check Server"
              : serverStatus === "online"
              ? "Server Online"
              : "Server Offline"}
          </button>
          {statusMessage && (
            <span
              className={`text-sm ${
                serverStatus === "online" ? "text-green-600" : "text-red-600"
              }`}
            >
              {statusMessage}
            </span>
          )}
        </div>
      </div>

      <p className="mb-6">
        {loading
          ? "Loading Pyodide... Please wait."
          : "Select a language, write your code, and click 'Run' to execute it. Use the examples dropdown to load statistical analysis examples."}
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          {/* Tab Navigation */}
          <div className="flex border-b border-gray-300 mb-4">
            <button
              className={`py-2 px-4 font-medium text-sm ${
                activeTab === "codeEditor"
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("codeEditor")}
            >
              Code Editor
            </button>
            <button
              className={`py-2 px-4 font-medium text-sm ${
                activeTab === "functionExamples"
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("functionExamples")}
            >
              Function Examples
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === "codeEditor" ? (
            <>
              <CodeEditor
                defaultLanguage="python"
                height="500px"
                initialCode={selectedExample || undefined}
                examples={statisticalExamples}
                onExampleSelect={loadExample}
              />

              <div className="mt-4 text-left bg-gray-50 p-4 rounded-md border border-gray-200">
                <h3 className="text-lg font-medium text-gray-800 mb-2">
                  About Statistical Examples
                </h3>
                <p className="text-sm text-gray-600 mb-2">
                  The examples dropdown includes statistical analysis examples
                  using NumPy, pandas, and statsmodels. Select an example, click
                  "Run" to execute it, and see the results in the output panel.
                </p>
                <p className="text-sm text-gray-600">
                  For examples with matplotlib visualizations, the plots will be
                  displayed directly in the browser. View the source code in the{" "}
                  <a
                    href="https://github.com/yourusername/pyodide-react-app/tree/main/src/examples"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    examples directory
                  </a>
                  .
                </p>
              </div>
            </>
          ) : (
            <FunctionExamples />
          )}
        </div>

        <div className="flex flex-col">
          <div className="mb-4 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-800">
              AI Chat Assistant
            </h2>
            <button
              onClick={() => setShowAIChat(!showAIChat)}
              className="px-3 py-1 rounded text-white text-sm font-medium bg-purple-600 hover:bg-purple-700"
            >
              {showAIChat ? "Hide Chat" : "Show Chat"}
            </button>
          </div>

          {showAIChat && serverStatus === "online" && (
            <ChatBox defaultInstructions="You are a coding assistant that helps with Python and JavaScript. Provide concise and helpful answers." />
          )}

          {showAIChat && serverStatus !== "online" && (
            <div className="p-4 bg-yellow-100 text-yellow-800 rounded-md">
              Please check if the server is online before using the AI chat.
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 text-center text-sm text-gray-500">
        <p>
          Powered by{" "}
          <a
            href="https://pyodide.org"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
          >
            Pyodide
          </a>{" "}
          - Python running in your browser via WebAssembly
        </p>
      </div>
    </div>
  );
}

export default App;
