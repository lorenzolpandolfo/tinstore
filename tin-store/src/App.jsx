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
import { useContextSearch } from "./contexts/SearchContext.jsx";
import LoadingModal from "./components/loading-modal/LoadingModal.jsx";
import InstalledSearchBar from "./components/installed-search-bar/InstalledSearchBar.jsx";

const formatPackageIdentifier = (pkgId) => {
  return pkgId.replaceAll(".", " ");
};

const App = () => {
  const { generatingCache } = useContextCache();

  const [installedPackages, setInstalledPackages] = useState([]);

  const { contextSection } = useContextSection();
  const { finalResults } = useContextResults();
  const { processing } = useProcessingContext();
  const { loading } = useContextSearch();

  const [installedAppsFilter, setInstalledAppsFilter] = useState("");

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

  const renderInstalledPackages = () =>
    installedPackages
      .filter((p) => {
        const packageName = p.PackageIdentifier?.toLowerCase();
        return (
          !installedAppsFilter ||
          packageName.startsWith(installedAppsFilter) ||
          packageName.includes(installedAppsFilter) ||
          installedAppsFilter.includes(packageName)
        );
      })
      .sort((a, b) =>
        a.PackageIdentifier.localeCompare(b.PackageIdentifier, undefined, {
          sensitivity: "base",
        })
      )
      .map((p) => (
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

  return (
    <>
      <TopHeader />

      {contextSection === "installed" &&
        (installedPackages.length > 0 ? (
          <>
            <InstalledSearchBar
              filter={installedAppsFilter}
              setFilter={setInstalledAppsFilter}
            />
            {renderInstalledPackages()}
          </>
        ) : (
          <span>
            No packages found. Rebuild cache in configuration and try again.
          </span>
        ))}

      {contextSection === "explore" && (
        <>
          <SearchBar />
          {loading ? (
            <LoadingModal />
          ) : finalResults.length > 0 ? (
            finalResults
          ) : (
            <Homepage />
          )}
        </>
      )}

      {processing.length > 0 && <InstallModal packages={processing} />}
      {generatingCache && <CacheModal />}

      <MenuModal />
    </>
  );
};
export default App;
