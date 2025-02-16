import { createContext, useState, useContext, useEffect } from "react";

const ProcessingContext = createContext();

export const ProcessingContextProvider = ({ children }) => {
  const [processing, setProcessing] = useState([]);

  // poderia mover isso pra funcao de baixo
  const handleProcessingPackages = (event, packageName) => {
    setProcessing((old) => {
      if (!packageName) return old;

      const packageIsProcessing = old.some((pkg) => pkg === packageName);

      if (packageIsProcessing) {
        return old.filter((pkg) => pkg !== packageName);
      }

      return [...old, packageName];
    });
  };

  const handleStatusChange = (event, packageName) => {
    setProcessing((old) => {
      if (!packageName) return old;

      const packageIsProcessing = old.some((pkg) => pkg === packageName);

      if (packageIsProcessing) {
        return old.filter((pkg) => pkg !== packageName);
      }

      return [...old, packageName];
    });
  };

  useEffect(() => {
    window.electron.onProcessingStatusChange(handleStatusChange);
  }, []);

  return (
    <ProcessingContext.Provider value={{ processing, setProcessing }}>
      {children}
    </ProcessingContext.Provider>
  );
};

export const useProcessingContext = () => useContext(ProcessingContext);
