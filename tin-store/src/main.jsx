import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { SectionContextProvider } from "./contexts/SectionContext.jsx";
import { ResultsContextProvider } from "./contexts/ResultsContext.jsx";
import { SearchContextProvider } from "./contexts/SearchContext.jsx";
import { ProcessingContextProvider } from "./contexts/ProcessingContext.jsx";

createRoot(document.getElementById("root")).render(
  <ProcessingContextProvider>
    <ResultsContextProvider>
      <SearchContextProvider>
        <SectionContextProvider>
          <App />
        </SectionContextProvider>
      </SearchContextProvider>
    </ResultsContextProvider>
  </ProcessingContextProvider>
);
