import { useEffect, useState } from "react";
import SearchBar from "../src/components/search-bar/SearchBar.jsx";
import InstallModal from "./components/install-modal/InstallModal.jsx";
import CacheModal from "./components/cache-modal/CacheModal.jsx";
import TopHeader from "./components/top-header/TopHeader.jsx";
import { useContextSection } from "./contexts/SectionContext.jsx";
import { useContextResults } from "./contexts/ResultsContext.jsx";
import { useContextCache } from "./contexts/CacheContext.jsx";
import AppPackage from "./components/app-package/AppPackage.jsx";
import Homepage from "./components/homepage/Homepage.jsx";
import { useProcessingContext } from "./contexts/ProcessingContext.jsx";
import MenuModal from "./components/menu-modal/MenuModal.jsx";

const formatPackageIdentifier = (pkgId) => {
  return pkgId.replaceAll(".", " ");
};

const App = () => {
  const { generatingCache } = useContextCache();

  const [installedPackages, setInstalledPackages] = useState([]);

  const { contextSection } = useContextSection();
  const { finalResults } = useContextResults();
  const { processing } = useProcessingContext();

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
      {generatingCache && <CacheModal />}

      <MenuModal />
    </>
  );
};
export default App;
