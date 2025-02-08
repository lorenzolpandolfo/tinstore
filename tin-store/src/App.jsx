import { useEffect, useState } from "react";
import SearchBar from "../src/components/search-bar/SearchBar.jsx";
import InstallModal from "./components/install-modal/InstallModal.jsx";

const App = () => {
  const [status, setStatus] = useState(false)

  useEffect(() => {
    const handleInstallationStatusChange = (event, message) => {
      console.log("Status da instalação alterado:", message);
      setStatus(message);
    };

    window.electron.onInstallationStatusChange(handleInstallationStatusChange);

    return () => {
      window.electron.removeInstallationListener(
        handleInstallationStatusChange
      );
    };
  }, []);

  return <>
    <SearchBar />
    {status && <InstallModal />}
  </>;
};

export default App;
