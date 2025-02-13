import { createContext, useState, useContext } from "react";

const ResultsContext = createContext();

export const ResultsContextProvider = ({ children }) => {
  const [showResults, setShowResults] = useState(false);

  return (
    <ResultsContext.Provider value={{ showResults, setShowResults }}>
      {children}
    </ResultsContext.Provider>
  );
};

export const useContextResults = () => useContext(ResultsContext);
