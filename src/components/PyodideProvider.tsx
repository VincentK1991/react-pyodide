import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { loadPyodide } from "pyodide";
import type { PyodideInterface } from "pyodide";

interface PyodideContextType {
  pyodide: PyodideInterface | null;
  loading: boolean;
  error: Error | null;
  runPython: (code: string) => Promise<{ result: unknown; stdout: string }>;
  runJavaScript: (code: string) => {
    result?: unknown;
    stdout?: string;
    error?: string;
  };
}

const PyodideContext = createContext<PyodideContextType | undefined>(undefined);

export const usePyodide = () => {
  const context = useContext(PyodideContext);
  if (context === undefined) {
    throw new Error("usePyodide must be used within a PyodideProvider");
  }
  return context;
};

interface PyodideProviderProps {
  children: ReactNode;
}

export const PyodideProvider = ({ children }: PyodideProviderProps) => {
  const [pyodide, setPyodide] = useState<PyodideInterface | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function initPyodide() {
      try {
        setLoading(true);
        console.log("Loading Pyodide...");

        // Initialize Pyodide
        const pyodideInstance = await loadPyodide({
          indexURL: "https://cdn.jsdelivr.net/pyodide/v0.27.3/full/",
        });

        // Import sys module to ensure it's available
        await pyodideInstance.runPythonAsync(`
          import sys
          import js
          print("Python environment initialized")
        `);

        console.log("Pyodide loaded successfully!");
        setPyodide(pyodideInstance);
        setLoading(false);
      } catch (err) {
        console.error("Error loading Pyodide:", err);
        setError(err instanceof Error ? err : new Error(String(err)));
        setLoading(false);
      }
    }

    initPyodide();
  }, []);

  const runPython = async (code: string) => {
    if (!pyodide) {
      throw new Error("Pyodide is not initialized");
    }

    try {
      // Create a custom stdout capture mechanism
      let stdoutContent = "";

      // Setup a custom stdout capture
      await pyodide.runPythonAsync(`
        import sys
        import io
        
        class StdoutCatcher(io.StringIO):
            def write(self, text):
                super().write(text)
                return len(text)
        
        sys.stdout = StdoutCatcher()
      `);

      // Reset the Python environment to avoid state conflicts
      await pyodide.runPythonAsync(`
        # Clear globals but keep important modules
        for key in list(globals().keys()):
            if key not in ['sys', 'js', '__name__', '__doc__', 'io', 'StdoutCatcher']:
                del globals()[key]
      `);

      // Run the user's code
      const result = await pyodide.runPythonAsync(code);

      // Get the captured stdout content
      stdoutContent = await pyodide.runPythonAsync(`
        output = sys.stdout.getvalue()
        sys.stdout = sys.__stdout__  # Reset stdout to default
        output
      `);

      return {
        result,
        stdout: stdoutContent,
      };
    } catch (err) {
      console.error("Error running Python code:", err);
      throw err;
    }
  };

  const runJavaScript = (code: string) => {
    try {
      // Create a function from the code string and execute it
      // eslint-disable-next-line no-new-func
      const result = new Function(`
        try {
          // Capture console.log output
          const logs = [];
          const originalConsoleLog = console.log;
          console.log = (...args) => {
            logs.push(args.map(arg => String(arg)).join(' '));
            originalConsoleLog(...args);
          };
          
          // Execute the code
          const result = (function() { ${code} })();
          
          // Restore console.log
          console.log = originalConsoleLog;
          
          return { result, stdout: logs.join('\\n') };
        } catch (error) {
          return { error: error.toString() };
        }
      `)();

      return result;
    } catch (err) {
      console.error("Error running JavaScript code:", err);
      return { error: err instanceof Error ? err.toString() : String(err) };
    }
  };

  const value = {
    pyodide,
    loading,
    error,
    runPython,
    runJavaScript,
  };

  return (
    <PyodideContext.Provider value={value}>{children}</PyodideContext.Provider>
  );
};
