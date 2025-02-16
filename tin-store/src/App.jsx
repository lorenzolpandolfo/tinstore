import { useEffect, useState } from "react";
import SearchBar from "../src/components/search-bar/SearchBar.jsx";
import InstallModal from "./components/install-modal/InstallModal.jsx";
import CacheModal from "./components/cache-modal/CacheModal.jsx";
import TopHeader from "./components/top-header/TopHeader.jsx";
import { useContextSection } from "./contexts/SectionContext.jsx";
import { useContextResults } from "./contexts/ResultsContext.jsx";
import AppPackage from "./components/app-package/AppPackage.jsx";
import Homepage from "./components/homepage/Homepage.jsx";
import { useProcessingContext } from "./contexts/ProcessingContext.jsx";

const formatPackageIdentifier = (pkgId) => {
  return pkgId.replaceAll(".", " ");
};

const App = () => {
  const [creatingCache, setCreatingCache] = useState(false);

  const [installedPackages, setInstalledPackages] = useState([]);

  const { contextSection } = useContextSection();
  const { finalResults } = useContextResults();
  const { processing } = useProcessingContext();

  const handleCache = (event, status) => {
    setCreatingCache(status);
  };

  useEffect(() => {
    window.electron.generateCacheClientListenerAndProcess(handleCache, true);
  }, []);

  useEffect(() => {
    const fetchPackages = async () => {
      if (contextSection === "installed") {
        const cacheData = (await window.electron.getPackagesInCache()) || [];
        const pkgs = cacheData.Sources[0].Packages;
        setInstalledPackages(pkgs);
      }
    };

    fetchPackages();
  }, [contextSection]);

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
          <SearchBar />
          {finalResults.length > 0 ? finalResults : <Homepage />}
        </>
      )}

      {processing.length > 0 && <InstallModal packages={processing} />}
      {creatingCache && <CacheModal />}
    </>
  );
};
export default App;
