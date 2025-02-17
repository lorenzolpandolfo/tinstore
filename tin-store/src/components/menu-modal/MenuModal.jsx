import { useEffect, useState } from "react";
import "./menu-modal.css";
import MenuWindow from "./menu-window/MenuWindow";

export default function MenuModal() {
  const handleOpenMenu = () => {
    windowVisible ? setWindowVisible(false) : setWindowVisible(true);
  };

  const [windowVisible, setWindowVisible] = useState();

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setWindowVisible(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <>
      <div onClick={handleOpenMenu} className="menu-modal button">
        <img src="/src/assets/menu.svg" alt="menu" />
      </div>

      {windowVisible && <MenuWindow />}
    </>
  );
}
