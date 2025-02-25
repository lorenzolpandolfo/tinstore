import { createContext, useContext, useState } from "react";

const MenuContext = createContext();

export function MenuContextProvider({ children }) {
  const [windowVisible, setWindowVisible] = useState(false);

  const toggleMenu = () => setWindowVisible((prev) => !prev);
  const closeMenu = () => setWindowVisible(false);

  return (
    <MenuContext.Provider value={{ windowVisible, toggleMenu, closeMenu }}>
      {children}
    </MenuContext.Provider>
  );
}

export const useMenu = () => useContext(MenuContext);
