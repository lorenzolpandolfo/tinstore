import { useEffect } from "react";
import "./menu-modal.css";

import MenuWindow from "./menu-window/MenuWindow";
import { useMenu } from "../../contexts/MenuContext";

export default function MenuModal() {
  const { windowVisible, toggleMenu, closeMenu } = useMenu();

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        closeMenu();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [closeMenu]);

  return (
    <>
      <div onClick={toggleMenu} className="menu-modal button">
        <img src="assets/menu.svg" alt="menu" />
      </div>

      {windowVisible && <MenuWindow />}
    </>
  );
}
