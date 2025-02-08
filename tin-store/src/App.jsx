import { useEffect, useState } from "react";
import SearchBar from "../src/components/search-bar/SearchBar.jsx";
import InstallModal from "./components/install-modal/InstallModal.jsx";

const App = () => {
  const [status, setStatus] = useState(false)
  const [packageName, setPackageName] = useState("")

  useEffect(() => {
    const handleInstallationStatusChange = (event, isInstalling, packageName) => {
      setStatus(isInstalling);
      setPackageName(packageName);
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
    {status && <InstallModal packageName={packageName} />}
  </>;
};

export default App;
