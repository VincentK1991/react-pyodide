import CodeEditor from "./components/CodeEditor";
import { usePyodide } from "./components/PyodideProvider";

function App() {
  const { loading } = usePyodide();

  return (
    <div className="max-w-6xl mx-auto p-8 text-center">
      <h1 className="text-4xl font-bold mb-4 text-gray-800">
        Python/JavaScript Code Editor
      </h1>
      <p className="mb-6">
        {loading
          ? "Loading Pyodide... Please wait."
          : "Select a language, write your code, and click 'Run' to execute it."}
      </p>

      <CodeEditor defaultLanguage="python" height="500px" />

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
