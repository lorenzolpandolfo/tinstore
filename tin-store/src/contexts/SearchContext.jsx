import { createContext, useState, useContext, useMemo } from "react";
import { useContextResults } from "./ResultsContext";
import AppPackage from "../components/app-package/AppPackage";
import { useProcessingContext } from "./ProcessingContext";

const SearchContext = createContext();

export const SearchContextProvider = ({ children }) => {
  const [search, setSearch] = useState("");
  const { setFinalResults } = useContextResults();
  const { processing } = useProcessingContext();

  const handleSearch = async (packageName) => {
    setSearch(packageName);

    const searchResults = await handleSearchIn(packageName);

    if (!searchResults || searchResults.length === 0) {
      console.log("no results");
      setFinalResults([]);
    }

    const sortedPkgs = sortResults(searchResults, packageName);

    const finalPkgs = await createPackageComponents(sortedPkgs);

    setFinalResults(finalPkgs);
  };

  const handleSearchIn = async (packageName) => {
    if (!packageName) return [];

    try {
      const packageData = await window.electron.searchPackage(packageName);
      if (packageData?.cached) return packageData.cached;

      return packageData.error
        ? false
        : packageData.message
        ? false
        : packageData;
    } catch (err) {
      console.log(err);
      return [];
    }
  };

  const sortResults = (results, packageName) => {
    console.log("Reordenando lista de pacotes. Busca:", packageName);
    const lowerCasePackageName = packageName.toLowerCase();

    return [...results].sort((a, b) => {
      const aPackageName = a.packageName?.toLowerCase() || "";
      const bPackageName = b.packageName?.toLowerCase() || "";

      const aMatches = aPackageName.includes(lowerCasePackageName);
      const bMatches = bPackageName.includes(lowerCasePackageName);

      const aHasAllFields = a.description && a.publisher;
      const bHasAllFields = b.description && b.publisher;

      if (
        aPackageName === lowerCasePackageName &&
        bPackageName !== lowerCasePackageName
      )
        return -1;
      if (
        bPackageName === lowerCasePackageName &&
        aPackageName !== lowerCasePackageName
      )
        return 1;
      if (aMatches !== bMatches) return aMatches ? -1 : 1;
      if (aHasAllFields !== bHasAllFields) return aHasAllFields ? -1 : 1;
      return 0;
    });
  };

  const createPackageComponents = async (sortedResults) => {
    try {
      const resultsInCache = await window.electron.checkPackagesInCache(
        sortedResults
      );
      const packagesToRender =
        resultsInCache?.length > 0 ? resultsInCache : sortedResults;

      return packagesToRender.map((result, index) => (
        <div key={index} className="app-container">
          {result.message ? (
            <p>{result.message}</p>
          ) : (
            <AppPackage
              packageName={result.packageName}
              version={result.version}
              packageId={result.packageId}
              publisher={result.publisher}
              description={result.description}
              publisherUrl={result.publisherUrl}
              packageUrl={result.packageUrl}
              processing={processing.some(
                (pkg) => pkg.packageName === p.packageName
              )}
              installed={result.installed}
            />
          )}
        </div>
      ));
    } catch (error) {
      console.error("Erro ao verificar pacotes:", error);
      return [];
    }
  };

  return (
    <SearchContext.Provider value={{ search, setSearch, handleSearch }}>
      {children}
    </SearchContext.Provider>
  );
};

export const useContextSearch = () => useContext(SearchContext);
