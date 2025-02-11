import { useEffect, useState } from "react";
import SearchBar from "../src/components/search-bar/SearchBar.jsx";
import InstallModal from "./components/install-modal/InstallModal.jsx";
import CacheModal from "./components/cache-modal/CacheModal.jsx";

const App = () => {
  const [packages, setPackages] = useState([]);
  const [creatingCache, setCreatingCache] = useState(false);

  const handleProcessingPackages = (event, status) => {
    console.log(status)

    setPackages((old) => {
      if (status.processing && old.some((pkg) => pkg.packageName === status.packageName)) {
        // caso em que o usuario manda fazer a instalacao do mesmo pacote 2 ou + vezes
        // pode lancar um sinal pra cancelar essa instalacao.. porem como cancelar o child process?
        // tambem, falharia com um erro a instalação
        return old;
      }

      if (status.processing) {
        return [...old, status];
      }

      // return old;
      // remove o pacote da lista de pacotes em processo
      // caso eu tenha instalado um app, ele salvou no cache, se sair da lista,
      // vai puxar o dado do cache e atualizar
      // se nao funcionar, mantem ele na lista
      return old.filter((pkg) => pkg.packageName !== status.packageName);
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
