import { createContext, useState, useContext } from "react";

const ResultsContext = createContext();

export const ResultsContextProvider = ({ children }) => {
  const [showResults, setShowResults] = useState(false);
  const [finalResults, setFinalResults] = useState([]);

  return (
    <ResultsContext.Provider value={{ showResults, setShowResults, finalResults, setFinalResults }}>
      {children}
    </ResultsContext.Provider>
  );
};

export const useContextResults = () => useContext(ResultsContext);
