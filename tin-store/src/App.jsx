import { useEffect, useState } from "react";
import SearchBar from "../src/components/search-bar/SearchBar.jsx";
import InstallModal from "./components/install-modal/InstallModal.jsx";
import CacheModal from "./components/cache-modal/CacheModal.jsx";
import TopHeader from "./components/top-header/TopHeader.jsx";
import { useContextSection } from "./contexts/SectionContext.jsx";
import { useContextResults } from "./contexts/ResultsContext.jsx";
import AppPackage from "./components/app-package/AppPackage.jsx";
import Homepage from "./components/homepage/Homepage.jsx";

const formatPackageIdentifier = (pkgId) => {
  return pkgId.replaceAll(".", " ");
};

const App = () => {
  const [packages, setPackages] = useState([]);
  const [creatingCache, setCreatingCache] = useState(false);

  const [installedPackages, setInstalledPackages] = useState([]);

  const { contextSection } = useContextSection();
  const { finalResults } = useContextResults();

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
  useEffect(() => {
    const fetchPackages = async () => {
      if (contextSection === "installed") {
        const cacheData = (await getInstalledPackages()) || [];
        const pkgs = cacheData.Sources[0].Packages;
        setInstalledPackages(pkgs);
      }
    };

    fetchPackages();
  }, [contextSection]);

  const getInstalledPackages = async () => {
    console.log("Getting installed packages");
    return (await window.electron.getPackagesInCache()) || null;
  };

  const renderInstalledPackages = () => {
    return installedPackages.map((p) => (
      <AppPackage
        packageName={
          p.packageName || formatPackageIdentifier(p.PackageIdentifier)
        }
        packageId={p.PackageIdentifier}
        publisher={p.publisher}
        version={p.version}
        description={p.description}
        publisherUrl={p.publisherUrl}
        packageUrl={p.packageUrl}
        processing={false}
        installed={true}
      />
    ));
  };

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

      {contextSection === "installed" &&
        (installedPackages.length > 0 ? (
          renderInstalledPackages()
        ) : (
          <span>No packages found.</span>
        ))}

      {contextSection === "explore" && (
        <>
          <SearchBar packagesBeingInstalled={packages} />
          {finalResults.length > 0 ? finalResults : <Homepage />}
        </>
      )}

      {packages.length > 0 && <InstallModal packages={packages} />}
      {creatingCache && <CacheModal />}
    </>
  );
};
export default App;
