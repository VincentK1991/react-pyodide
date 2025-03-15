import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { loadPyodide } from "pyodide";
import type { PyodideInterface } from "pyodide";

// Move constants to a separate file
// List of common packages to preload
const COMMON_PACKAGES = ["numpy", "pandas"];

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
  installPackage: (packageName: string) => Promise<void>;
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
  const [loadedPackages, setLoadedPackages] = useState<Set<string>>(new Set());

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

        // Initialize micropip
        await pyodideInstance.loadPackagesFromImports(`
          import micropip
        `);

        console.log("Pyodide loaded successfully!");
        setPyodide(pyodideInstance);

        // Preload common packages
        try {
          console.log("Preloading common packages...");
          await pyodideInstance.loadPackagesFromImports(`
            import numpy
            import pandas
          `);
          // Use functional update to avoid dependency on loadedPackages
          setLoadedPackages(
            (prevPackages) => new Set([...prevPackages, ...COMMON_PACKAGES])
          );
          console.log("Common packages loaded successfully!");
        } catch (packageErr) {
          console.warn("Some packages failed to preload:", packageErr);
          // Continue even if package loading fails
        }

        setLoading(false);
      } catch (err) {
        console.error("Error loading Pyodide:", err);
        setError(err instanceof Error ? err : new Error(String(err)));
        setLoading(false);
      }
    }

    initPyodide();
  }, []); // No dependencies needed with functional updates

  const installPackage = async (packageName: string) => {
    if (!pyodide) {
      throw new Error("Pyodide is not initialized");
    }

    if (loadedPackages.has(packageName)) {
      console.log(`Package ${packageName} is already loaded`);
      return;
    }

    try {
      console.log(`Installing package: ${packageName}`);
      await pyodide.runPythonAsync(`
        import micropip
        await micropip.install("${packageName}")
      `);
      // Use functional update to avoid dependency issues
      setLoadedPackages(
        (prevPackages) => new Set([...prevPackages, packageName])
      );
      console.log(`Package ${packageName} installed successfully`);
    } catch (err) {
      console.error(`Error installing package ${packageName}:`, err);
      throw err;
    }
  };

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
            if key not in ['sys', 'js', '__name__', '__doc__', 'io', 'StdoutCatcher', 'micropip']:
                del globals()[key]
      `);

      // Try to run the code, and handle missing package errors
      try {
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
        // Check if the error is about a missing module
        const errorStr = String(err);
        if (errorStr.includes("ModuleNotFoundError: No module named")) {
          // Extract the module name from the error message
          const moduleMatch = errorStr.match(/No module named '([^']+)'/);
          if (moduleMatch && moduleMatch[1]) {
            const moduleName = moduleMatch[1];

            // Try to install the missing package
            try {
              stdoutContent += `\nAttempting to install missing package: ${moduleName}...\n`;
              await installPackage(moduleName);
              stdoutContent += `Package ${moduleName} installed successfully. Rerunning your code...\n`;

              // Try running the code again after installing the package
              const result = await pyodide.runPythonAsync(code);

              // Get the updated stdout content
              const newStdout = await pyodide.runPythonAsync(`
                output = sys.stdout.getvalue()
                sys.stdout = sys.__stdout__  # Reset stdout to default
                output
              `);

              return {
                result,
                stdout: stdoutContent + newStdout,
              };
            } catch (installErr) {
              throw new Error(
                `Failed to install package ${moduleName}: ${installErr}`
              );
            }
          }
        }

        // If it's not a missing module error or we couldn't handle it, rethrow
        throw err;
      }
    } catch (err) {
      console.error("Error running Python code:", err);
      throw err;
    }
  };

  const runJavaScript = (code: string) => {
    try {
      // Create a function from the code string and execute it
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
    installPackage,
  };

  return (
    <PyodideContext.Provider value={value}>{children}</PyodideContext.Provider>
  );
};
