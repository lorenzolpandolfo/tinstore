import { useEffect } from "react";
import SearchBar from "../src/components/search-bar/SearchBar.jsx";
import InstallModal from "./components/install-modal/InstallModal.jsx";

let installationStatus = false;

const App = () => {
  useEffect(() => {
    const handleInstallationStatusChange = (event, message) => {
      console.log("Status da instalação alterado:", message);
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
    {installationStatus && <InstallModal />}
  </>;
};

export default App;
