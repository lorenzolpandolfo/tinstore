import { createContext, useState, useContext, useMemo, useEffect } from "react";
import { useContextResults } from "./ResultsContext";
import AppPackage from "../components/app-package/AppPackage";
import { useProcessingContext } from "./ProcessingContext";
import { useContextCache } from "./CacheContext";
import { handlePackageSearch } from "../services/packageSearchService";

const SearchContext = createContext();

export const SearchContextProvider = ({ children }) => {
  const [search, setSearch] = useState("");
  const [localResults, setLocalResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { setFinalResults } = useContextResults();
  const { processing } = useProcessingContext();
  const { generatingCache } = useContextCache();

  const handleSearch = async (packageName) => {
    setSearch(packageName);
    setLoading(true);
    setError("");

    try {
      const searchResults = await handlePackageSearch(packageName);

      if (!searchResults || searchResults.length === 0) {
        console.log("No results found");
        setLocalResults([]);
        setFinalResults([]);
        return;
      }

      setLocalResults(searchResults);
    } catch (err) {
      console.error("Error during search:", err);
      setError("Failed to fetch results");
    } finally {
      setLoading(false);
    }
  };

  const sortedResults = useMemo(() => {
    const lowerCasePackageName = search.toLowerCase();

    return [...localResults].sort((a, b) => {
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
  }, [localResults]);

  useEffect(() => {
    const createPackageComponents = async () => {
      try {
        const resultsAfterCacheCheck =
          await window.electron.checkPackagesInCache(sortedResults);
        const packagesToRender =
          resultsAfterCacheCheck?.length > 0
            ? resultsAfterCacheCheck
            : sortedResults;

        const list = packagesToRender.map((result, index) => (
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
                  (pkg) => pkg === result.packageName
                )}
                installed={result.installed}
              />
            )}
          </div>
        ));

        setFinalResults(list);
      } catch (error) {
        console.error("Erro ao verificar pacotes:", error);
      }
    };

    createPackageComponents();
  }, [sortedResults, processing, generatingCache]);

  return (
    <SearchContext.Provider
      value={{ search, setSearch, handleSearch, loading, error }}
    >
      {children}
    </SearchContext.Provider>
  );
};

export const useContextSearch = () => useContext(SearchContext);
