import { useEffect, useState } from "react";
import SearchBar from "../src/components/search-bar/SearchBar.jsx";
import InstallModal from "./components/install-modal/InstallModal.jsx";

const App = () => {
  const [packages, setPackages] = useState([]);

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

  useEffect(() => {
    window.electron.onInstallationStatusChange(handleInstallationStatusChange);

    return () => {
      window.electron.removeInstallationListener(
        handleInstallationStatusChange
      );
    };
  }, []);

  return (
    <>
      <SearchBar packagesBeingInstalled={packages}  />
      {packages.length > 0 && <InstallModal packages={packages} />}
    </>
  );
};

export default App;
