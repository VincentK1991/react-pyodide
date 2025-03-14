import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { PyodideProvider } from "./components/PyodideProvider";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <PyodideProvider>
      <App />
    </PyodideProvider>
  </StrictMode>
);
