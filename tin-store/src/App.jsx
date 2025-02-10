import { useEffect, useState } from "react";
import SearchBar from "../src/components/search-bar/SearchBar.jsx";
import InstallModal from "./components/install-modal/InstallModal.jsx";
import CacheModal from "./components/cache-modal/CacheModal.jsx";

const App = () => {
  const [packages, setPackages] = useState([]);
  const [creatingCache, setCreatingCache] = useState(false);

  const handlePackageInstallStatus = (event, installing, packageName) => {
    setPackages((old) => {
      if (installing && old.some((pkg) => pkg === packageName)) {
        // caso em que o usuario manda fazer a instalacao do mesmo pacote 2 ou + vezes
        // pode lancar um sinal pra cancelar essa instalacao.. porem como cancelar o child process?
        // tambem, falharia com um erro a instalação
        return old;
      }

      if (installing) {
        return [...old, packageName];
      }
      return old.filter((pkg) => pkg !== packageName);
    });
  };

  const handleInstallationStatusChange = (event, installing, packageName) => {
    handlePackageInstallStatus(event, installing, packageName);
  };

  const handleCache = (event, status) => {
    setCreatingCache(status);
  }

  useEffect(() => {
    window.electron.onInstallationStatusChange(handleInstallationStatusChange);
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
