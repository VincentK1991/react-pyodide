import { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
import { usePyodide } from "./PyodideProvider";

interface FunctionBoxProps {
  title: string;
  explanation: string;
  defaultCode: string;
  parameterNames: string[];
  parameterTypes: ("number" | "string" | "boolean")[];
  parameterDefaults: (string | number | boolean)[];
}

const FunctionBox: React.FC<FunctionBoxProps> = ({
  title,
  explanation,
  defaultCode,
  parameterNames,
  parameterTypes,
  parameterDefaults,
}) => {
  const { loading, runPython } = usePyodide();
  const [view, setView] = useState<"explanation" | "code">("explanation");
  const [code, setCode] = useState<string>(defaultCode);
  const [output, setOutput] = useState<string>("");
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [parameters, setParameters] =
    useState<(string | number | boolean)[]>(parameterDefaults);

  // Reset parameters when defaults change
  useEffect(() => {
    setParameters(parameterDefaults);
  }, [parameterDefaults]);

  const handleParameterChange = (
    index: number,
    value: string,
    type: "number" | "string" | "boolean"
  ) => {
    const newParameters = [...parameters];

    if (type === "number") {
      newParameters[index] = value === "" ? "" : Number(value);
    } else if (type === "boolean") {
      newParameters[index] = value === "true";
    } else {
      newParameters[index] = value;
    }

    setParameters(newParameters);
  };

  const executeFunction = async () => {
    if (loading || isExecuting) return;

    setIsExecuting(true);
    setOutput("Executing...");

    try {
      // Extract the function name from the code
      const functionNameMatch = code.match(/def\s+([a-zA-Z0-9_]+)\s*\(/);
      const functionName = functionNameMatch ? functionNameMatch[1] : null;

      if (!functionName) {
        throw new Error("Could not determine function name from code");
      }

      // Validate parameters
      const validParameters = parameters.every((param, index) => {
        if (parameterTypes[index] === "number" && param === "") {
          throw new Error(
            `Parameter '${parameterNames[index]}' must be a number`
          );
        }
        return true;
      });

      if (!validParameters) return;

      // Format parameters for Python execution
      const formattedParams = parameters.map((param, index) => {
        if (parameterTypes[index] === "string") {
          // Escape quotes in strings
          const escapedParam = String(param).replace(/"/g, '\\"');
          return `"${escapedParam}"`;
        } else if (parameterTypes[index] === "boolean") {
          // Convert JavaScript boolean to Python boolean (True/False)
          return param === true ? "True" : "False";
        }
        return param;
      });

      // Create execution code that includes the function definition and a call to it
      // Properly indent the function code inside the try block
      const indentedCode = code
        .split("\n")
        .map((line) => `    ${line}`)
        .join("\n");

      const executionCode = `
try:
${indentedCode}

    # Call the function with the provided parameters
    result = ${functionName}(${formattedParams.join(", ")})
    print(f"Result: {result}")
    result
except Exception as e:
    print(f"Error: {str(e)}")
    None
      `;

      const result = await runPython(executionCode);

      // Format the output
      let finalOutput = "";

      if (result.stdout && result.stdout.trim()) {
        // Check if the output contains an error message
        if (result.stdout.trim().startsWith("Error:")) {
          setOutput(result.stdout.trim());
          return;
        }
        finalOutput += result.stdout;
      }

      // We're already printing the result in the Python code, so we don't need to append it again
      // unless there's a result value that wasn't captured by the print statement
      if (
        result.result !== undefined &&
        result.result !== null &&
        String(result.result) !== "undefined" &&
        String(result.result) !== "None" &&
        !finalOutput.includes(`Result: ${String(result.result)}`)
      ) {
        if (finalOutput && !finalOutput.endsWith("\n")) {
          finalOutput += "\n";
        }
        finalOutput += `Result: ${String(result.result)}`;
      }

      setOutput(finalOutput || "Function executed successfully (no output).");
    } catch (error) {
      setOutput(
        `Error: ${error instanceof Error ? error.message : String(error)}`
      );
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden shadow-md mb-6">
      {/* Header */}
      <div className="bg-gray-800 text-white p-3 flex justify-between items-center">
        <h3 className="text-lg font-medium">{title}</h3>
        <div className="flex space-x-2">
          <button
            onClick={() => setView("explanation")}
            className={`px-3 py-1 text-sm rounded ${
              view === "explanation"
                ? "bg-blue-600"
                : "bg-gray-700 hover:bg-gray-600"
            }`}
          >
            Explanation
          </button>
          <button
            onClick={() => setView("code")}
            className={`px-3 py-1 text-sm rounded ${
              view === "code" ? "bg-blue-600" : "bg-gray-700 hover:bg-gray-600"
            }`}
          >
            Code
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {view === "explanation" ? (
          <div className="prose max-w-none">
            <p className="text-gray-700">{explanation}</p>
          </div>
        ) : (
          <div className="border border-gray-300 rounded overflow-hidden">
            <Editor
              height="200px"
              language="python"
              value={code}
              onChange={(value) => setCode(value || "")}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                fontSize: 14,
                automaticLayout: true,
              }}
            />
          </div>
        )}
      </div>

      {/* Parameters */}
      <div className="bg-gray-100 p-4 border-t border-gray-300">
        <h4 className="text-sm font-semibold mb-3 text-gray-700">
          Parameters:
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {parameterNames.map((name, index) => (
            <div key={name} className="flex items-center">
              <label className="w-24 text-sm font-medium text-gray-700">
                {name}:
              </label>
              {parameterTypes[index] === "boolean" ? (
                <select
                  value={String(parameters[index])}
                  onChange={(e) =>
                    handleParameterChange(
                      index,
                      e.target.value,
                      parameterTypes[index]
                    )
                  }
                  className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="true">True</option>
                  <option value="false">False</option>
                </select>
              ) : (
                <input
                  type={parameterTypes[index] === "number" ? "number" : "text"}
                  value={String(parameters[index])}
                  onChange={(e) =>
                    handleParameterChange(
                      index,
                      e.target.value,
                      parameterTypes[index]
                    )
                  }
                  className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={`Enter ${name}`}
                />
              )}
            </div>
          ))}
        </div>

        <div className="mt-4 flex justify-end">
          <button
            onClick={executeFunction}
            disabled={loading || isExecuting}
            className={`px-4 py-2 rounded text-white font-medium ${
              loading || isExecuting
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {loading
              ? "Loading Pyodide..."
              : isExecuting
              ? "Executing..."
              : "Run Function"}
          </button>
        </div>
      </div>

      {/* Output */}
      {output && (
        <div className="p-4 bg-gray-50 border-t border-gray-300">
          <h4 className="text-sm font-semibold mb-2 text-gray-700">Output:</h4>
          <pre className="bg-white p-3 rounded border border-gray-200 text-sm font-mono whitespace-pre-wrap overflow-auto max-h-40">
            {output}
          </pre>
        </div>
      )}
    </div>
  );
};

export default FunctionBox;
