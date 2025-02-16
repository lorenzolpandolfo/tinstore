import { useState } from "react";
import "./menu-modal.css";
import MenuWindow from "./menu-window/menu-window";

export default function MenuModal() {
  const handleOpenMenu = () => {
    windowVisible ? setWindowVisible(false) : setWindowVisible(true);
  };

  const [windowVisible, setWindowVisible] = useState();

  return (
    <>
      <div onClick={() => handleOpenMenu()} className="menu-modal button">
        <img src="/src/assets/menu.svg" alt="menu" />
      </div>

      {windowVisible && <MenuWindow />}
    </>
  );
}
