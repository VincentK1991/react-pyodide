import { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
import { usePyodide } from "./PyodideProvider";

interface CodeEditorProps {
  defaultLanguage?: "python" | "javascript";
  defaultValue?: string;
  height?: string;
  onChange?: (value: string | undefined) => void;
}

const CodeEditor: React.FC<CodeEditorProps> = ({
  defaultLanguage = "python",
  defaultValue = '# Write your Python code here\n\nprint("Hello, World!")',
  height = "400px",
  onChange,
}) => {
  const { loading, runPython, runJavaScript } = usePyodide();
  const [language, setLanguage] = useState<"python" | "javascript">(
    defaultLanguage
  );
  const [code, setCode] = useState<string>(
    defaultLanguage === "python"
      ? '# Write your Python code here\n\nprint("Hello, World!")'
      : '// Write your JavaScript code here\n\nconsole.log("Hello, World!");'
  );
  const [output, setOutput] = useState<string>("");
  const [isExecuting, setIsExecuting] = useState<boolean>(false);

  useEffect(() => {
    // Set initial code based on the language
    if (defaultValue) {
      setCode(defaultValue);
    } else {
      setCode(
        language === "python"
          ? '# Write your Python code here\n\nprint("Hello, World!")'
          : '// Write your JavaScript code here\n\nconsole.log("Hello, World!");'
      );
    }
  }, [language, defaultValue]);

  const handleEditorChange = (value: string | undefined) => {
    setCode(value || "");
    if (onChange) {
      onChange(value);
    }
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value as "python" | "javascript");
  };

  const executeCode = async () => {
    if (loading || !code.trim()) return;

    setIsExecuting(true);
    setOutput("Executing...");

    try {
      if (language === "python") {
        const result = await runPython(code);
        // Format the output properly
        let finalOutput = "";

        if (result.stdout && result.stdout.trim()) {
          finalOutput += result.stdout;
        }

        // If there's a result value and it's not undefined or null, add it to the output
        if (
          result.result !== undefined &&
          result.result !== null &&
          String(result.result) !== "undefined" &&
          String(result.result) !== "None"
        ) {
          if (finalOutput && !finalOutput.endsWith("\n")) {
            finalOutput += "\n";
          }
          finalOutput += String(result.result);
        }

        setOutput(finalOutput || "Code executed successfully (no output).");
      } else {
        const result = runJavaScript(code);
        if (result.error) {
          setOutput(`Error: ${result.error}`);
        } else {
          // Format JavaScript output
          let finalOutput = "";

          if (result.stdout && result.stdout.trim()) {
            finalOutput += result.stdout;
          }

          if (
            result.result !== undefined &&
            result.result !== null &&
            String(result.result) !== "undefined"
          ) {
            if (finalOutput && !finalOutput.endsWith("\n")) {
              finalOutput += "\n";
            }
            finalOutput += String(result.result);
          }

          setOutput(finalOutput || "Code executed successfully (no output).");
        }
      }
    } catch (error) {
      setOutput(
        `Error: ${error instanceof Error ? error.message : String(error)}`
      );
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="flex flex-col border border-gray-300 rounded-md overflow-hidden my-5 shadow-md">
      <div className="flex justify-between p-2 bg-gray-800 border-b border-gray-700">
        <select
          value={language}
          onChange={handleLanguageChange}
          className="bg-gray-700 text-white border border-gray-600 rounded px-2 py-1 text-sm cursor-pointer outline-none hover:bg-gray-600"
        >
          <option value="python">Python</option>
          <option value="javascript">JavaScript</option>
        </select>
        <button
          onClick={executeCode}
          disabled={loading || isExecuting}
          className={`px-3 py-1 rounded text-white text-sm font-medium ${
            loading || isExecuting
              ? "bg-gray-500 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-700"
          }`}
        >
          {loading
            ? "Loading Pyodide..."
            : isExecuting
            ? "Executing..."
            : "Run"}
        </button>
      </div>
      <Editor
        height={height}
        language={language}
        value={code}
        onChange={handleEditorChange}
        theme="vs-dark"
        options={{
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          fontSize: 14,
          automaticLayout: true,
        }}
      />
      {output && (
        <div className="p-4 bg-gray-100 border-t border-gray-300 max-h-48 overflow-auto">
          <h3 className="text-sm font-semibold mb-2 text-gray-700">Output:</h3>
          <pre className="text-sm whitespace-pre-wrap font-mono bg-white p-2 rounded border border-gray-200">
            {output}
          </pre>
        </div>
      )}
    </div>
  );
};

export default CodeEditor;
