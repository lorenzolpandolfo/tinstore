import { useEffect, useState } from "react";
import SearchBar from "../src/components/search-bar/SearchBar.jsx";
import InstallModal from "./components/install-modal/InstallModal.jsx";
import CacheModal from "./components/cache-modal/CacheModal.jsx";
import TopHeader from "./components/top-header/TopHeader.jsx";
import { useContextSection } from "./contexts/SectionContext.jsx";
import { useContextResults } from "./contexts/ResultsContext.jsx";

const App = () => {
  const [packages, setPackages] = useState([]);
  const [creatingCache, setCreatingCache] = useState(false);

  const { contextSection } = useContextSection();
  const { showResults } = useContextResults();

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
  };

  useEffect(() => {
    window.electron.onProcessingStatusChange(handleInstallationStatusChange);
    window.electron.generateCacheClientListenerAndProcess(handleCache, true);

    return () => {
      window.electron.removeInstallationListener(
        handleInstallationStatusChange
      );
    };
  }, []);

  // o problema é que os results são mostrados dentro do search bar
  // se não tem results, nao tem search bar...

  // e se os results fossem salvos num contexto que é renderizado aqui no App?

  
  // assim daria pra exibir o input mas não os results
  
  // ao clicar no explore, definir o contexto de showPackages = false
  // assim o input aparece mas a lista não. Então, a home vai aparecer
  
  // dentro do SearchBar, ao dar Enter, ele define o showPackages = true
  // removendo a homepage e mostrando os pacotes encontrados

  // TODO:
  // Salvar results em um contexto e renderizar os AppPackage aqui no App
  // usar o contexto do showPackages para exibir a lista ao dar Enter
  // e esconder a lista ao clicar no Explore

  return (
    <>
      <TopHeader />
      {contextSection === "installed" && <p>List of Installed Packages</p>}

      {contextSection === "explore" && (
        <SearchBar packagesBeingInstalled={packages} />
      )}

      {packages.length > 0 && <InstallModal packages={packages} />}
      {creatingCache && (
        <p>
          <CacheModal />
        </p>
      )}
    </>
  );
};

export default App;
