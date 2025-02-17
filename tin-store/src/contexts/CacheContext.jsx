import { createContext, useState, useContext, useEffect } from "react";

const CacheContext = createContext();

export const CacheContextProvider = ({ children }) => {
  const [generatingCache, setGeneratingCache] = useState(false);

  const handleCache = (event, status) => {
    setGeneratingCache(status);
  };

  useEffect(() => {
    window.electron.generateCacheClientListenerAndProcess(handleCache, true);
  }, []);

  return (
    <CacheContext.Provider value={{ generatingCache, setGeneratingCache }}>
      {children}
    </CacheContext.Provider>
  );
};

export const useContextCache = () => useContext(CacheContext);
