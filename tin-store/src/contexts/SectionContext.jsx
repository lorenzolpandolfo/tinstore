import { createContext, useState, useContext } from "react";

const defaultSection = "explore";

const ContextSectionContext = createContext();

export const SectionContextProvider = ({ children }) => {
  const [contextSection, setContextSection] = useState(defaultSection);

  return (
    <ContextSectionContext.Provider value={{ contextSection, setContextSection }}>
      {children}
    </ContextSectionContext.Provider>
  );
};

export const useContextSection = () => useContext(ContextSectionContext);
