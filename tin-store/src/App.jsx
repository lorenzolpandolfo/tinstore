import { useEffect, useState } from "react";
import SearchBar from "../src/components/search-bar/SearchBar.jsx";
import InstallModal from "./components/install-modal/InstallModal.jsx";
import CacheModal from "./components/cache-modal/CacheModal.jsx";

const App = () => {
  const [packages, setPackages] = useState([]);
  const [creatingCache, setCreatingCache] = useState(false);

  const handleProcessingPackages = (event, packageName) => {

    setPackages((old) => {
      if (!packageName) return old;
      
      const packageIsProcessing = old.some((pkg) => pkg === packageName);

      if (packageIsProcessing) {
        return old.filter((pkg) => pkg !== packageName);
      }

      return [...old, packageName];
    });
  };

  const handleInstallationStatusChange = (event, status) => {
    handleProcessingPackages(event, status);
  };

  const handleCache = (event, status) => {
    setCreatingCache(status);
  }

  useEffect(() => {
    window.electron.onProcessingStatusChange(handleInstallationStatusChange);
    window.electron.generateCacheClientListenerAndProcess(handleCache, true);

    return () => {
      window.electron.removeInstallationListener(
        handleInstallationStatusChange
      );
    };
  }, []);

  return (
    <>
      <SearchBar packagesBeingInstalled={packages} />
      {packages.length > 0 && <InstallModal packages={packages} />}
      {creatingCache && <p><CacheModal /></p>}
    </>
  );
};

export default App;
