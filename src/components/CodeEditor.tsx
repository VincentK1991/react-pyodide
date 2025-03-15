import { useState, useEffect } from "react";
import Editor, { DiffEditor } from "@monaco-editor/react";
import { usePyodide } from "./PyodideProvider";
//import type { editor } from "monaco-editor";

// Example definitions
export interface CodeExample {
  name: string;
  file: string;
  description: string;
}

interface CodeEditorProps {
  defaultLanguage?: "python" | "javascript";
  defaultValue?: string;
  initialCode?: string;
  height?: string;
  onChange?: (value: string | undefined) => void;
  examples?: CodeExample[];
  onExampleSelect?: (example: CodeExample) => void;
}

const CodeEditor: React.FC<CodeEditorProps> = ({
  defaultLanguage = "python",
  defaultValue = '# Write your Python code here\n\nprint("Hello, World!")',
  initialCode,
  height = "400px",
  onChange,
  examples = [],
  onExampleSelect,
}) => {
  const { loading, runPython, runJavaScript, installPackage } = usePyodide();
  const [language, setLanguage] = useState<"python" | "javascript">(
    defaultLanguage
  );
  const [code, setCode] = useState<string>(
    initialCode ||
      defaultValue ||
      (defaultLanguage === "python"
        ? '# Write your Python code here\n\nprint("Hello, World!")'
        : '// Write your JavaScript code here\n\nconsole.log("Hello, World!");')
  );
  const [output, setOutput] = useState<string>("");
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [packageName, setPackageName] = useState<string>("");
  const [isInstallingPackage, setIsInstallingPackage] =
    useState<boolean>(false);
  const [isDiffMode, setIsDiffMode] = useState<boolean>(false);
  const [originalCode, setOriginalCode] = useState<string>("");
  const [modifiedCode, setModifiedCode] = useState<string>("");
  const [isLoadingExample, setIsLoadingExample] = useState<boolean>(false);

  useEffect(() => {
    // Update code when initialCode changes
    if (initialCode) {
      setCode(initialCode);
    }
  }, [initialCode]);

  useEffect(() => {
    // Set initial code based on the language if no initialCode is provided
    if (!initialCode) {
      if (defaultValue) {
        setCode(defaultValue);
      } else {
        setCode(
          language === "python"
            ? '# Write your Python code here\n\nprint("Hello, World!")'
            : '// Write your JavaScript code here\n\nconsole.log("Hello, World!");'
        );
      }
    }
  }, [language, defaultValue, initialCode]);

  const handleEditorChange = (value: string | undefined) => {
    setCode(value || "");
    if (onChange) {
      onChange(value);
    }
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value as "python" | "javascript");
  };

  const handleExampleChange = async (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const selectedValue = e.target.value;

    if (!selectedValue) return;

    const selectedExample = examples.find((ex) => ex.file === selectedValue);
    if (!selectedExample) return;

    setIsLoadingExample(true);

    try {
      if (onExampleSelect) {
        onExampleSelect(selectedExample);
      } else {
        // If no external handler is provided, load the example directly
        const response = await fetch(`/src/examples/${selectedExample.file}`);
        if (!response.ok) {
          throw new Error(`Failed to load example: ${response.statusText}`);
        }
        const exampleCode = await response.text();
        setCode(exampleCode);
        setOutput(`Loaded example: ${selectedExample.name}`);
      }
    } catch (error) {
      setOutput(
        `Error loading example: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    } finally {
      setIsLoadingExample(false);
      // Reset the select to the default option after loading
      e.target.value = "";
    }
  };

  const handlePackageNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPackageName(e.target.value);
  };

  const handleInstallPackage = async () => {
    if (!packageName.trim() || loading || isInstallingPackage) return;

    setIsInstallingPackage(true);
    setOutput(`Installing package: ${packageName}...`);

    try {
      await installPackage(packageName);
      setOutput(`Package ${packageName} installed successfully!`);
      setPackageName("");
    } catch (error) {
      setOutput(
        `Error installing package: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    } finally {
      setIsInstallingPackage(false);
    }
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

  const toggleDiffMode = () => {
    if (!isDiffMode) {
      // When enabling diff mode, set the current code as the modified version
      setOriginalCode(
        language === "python"
          ? '# Original code\n\nprint("Hello, Original World!")'
          : '// Original code\n\nconsole.log("Hello, Original World!");'
      );
      setModifiedCode(code);
    }
    setIsDiffMode(!isDiffMode);
  };

  return (
    <div className="flex flex-col border border-gray-300 rounded-md overflow-hidden my-5 shadow-md">
      <div className="flex justify-between p-2 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center space-x-2">
          <select
            value={language}
            onChange={handleLanguageChange}
            className="bg-gray-700 text-white border border-gray-600 rounded px-2 py-1 text-sm cursor-pointer outline-none hover:bg-gray-600"
            disabled={isDiffMode}
          >
            <option value="python">Python</option>
            <option value="javascript">JavaScript</option>
          </select>

          {/* Examples dropdown */}
          {examples.length > 0 && language === "python" && (
            <select
              onChange={handleExampleChange}
              className="bg-gray-700 text-white border border-gray-600 rounded px-2 py-1 text-sm cursor-pointer outline-none hover:bg-gray-600"
              disabled={isDiffMode || isLoadingExample}
              defaultValue=""
            >
              <option value="" disabled>
                {isLoadingExample ? "Loading..." : "Select an example"}
              </option>
              {examples.map((example) => (
                <option key={example.file} value={example.file}>
                  {example.name}
                </option>
              ))}
            </select>
          )}

          <button
            onClick={toggleDiffMode}
            className="px-3 py-1 rounded text-white text-sm font-medium bg-purple-600 hover:bg-purple-700"
          >
            {isDiffMode ? "Exit Diff Mode" : "Diff Mode"}
          </button>
        </div>
        <button
          onClick={executeCode}
          disabled={loading || isExecuting || isDiffMode}
          className={`px-3 py-1 rounded text-white text-sm font-medium ${
            loading || isExecuting || isDiffMode
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

      {isDiffMode ? (
        <div className="flex flex-col">
          <div className="p-2 bg-gray-700 text-white text-sm">
            <span>Diff View (Original vs Modified)</span>
          </div>
          <DiffEditor
            height={height}
            language={language}
            original={originalCode}
            modified={modifiedCode}
            onMount={(editor) => {
              // Configure the diff editor on mount
              editor.updateOptions({
                renderSideBySide: true,
                readOnly: false,
              });

              // Set up a listener for model content changes
              const modifiedEditor = editor.getModifiedEditor();
              modifiedEditor.onDidChangeModelContent(() => {
                setModifiedCode(modifiedEditor.getValue());
              });

              const originalEditor = editor.getOriginalEditor();
              originalEditor.onDidChangeModelContent(() => {
                setOriginalCode(originalEditor.getValue());
              });
            }}
            theme="vs-dark"
            options={{
              originalEditable: true, // Allow editing the original code
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              fontSize: 14,
              automaticLayout: true,
              renderSideBySide: true, // Show side-by-side diff
            }}
          />
        </div>
      ) : (
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
      )}

      {language === "python" && !isDiffMode && (
        <div className="flex items-center p-2 bg-gray-700 border-t border-gray-600">
          <input
            type="text"
            value={packageName}
            onChange={handlePackageNameChange}
            placeholder="Enter package name to install"
            className="flex-1 px-3 py-1 text-sm bg-gray-800 text-white border border-gray-600 rounded-l outline-none"
            disabled={loading || isInstallingPackage}
          />
          <button
            onClick={handleInstallPackage}
            disabled={loading || isInstallingPackage || !packageName.trim()}
            className={`px-3 py-1 rounded-r text-white text-sm font-medium ${
              loading || isInstallingPackage || !packageName.trim()
                ? "bg-gray-500 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {isInstallingPackage ? "Installing..." : "Install Package"}
          </button>
        </div>
      )}

      {output && !isDiffMode && (
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
