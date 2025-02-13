import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { SectionContextProvider } from "./contexts/SectionContext.jsx";
import { ResultsContextProvider } from "./contexts/ResultsContext.jsx";

createRoot(document.getElementById("root")).render(
  <ResultsContextProvider>
    <SectionContextProvider>
      <App />
    </SectionContextProvider>
  </ResultsContextProvider>
);
