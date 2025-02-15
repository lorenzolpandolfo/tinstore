import { useEffect, useMemo, useState } from "react";
import AppPackage from "../app-package/AppPackage.jsx";
import "../search-bar/search-bar.css";
import { useContextResults } from "../../contexts/ResultsContext.jsx";
import { useContextSearch } from "../../contexts/SearchContext.jsx";

export default function SearchBar({ packagesBeingInstalled: packagesBeingProcessed }) {
  const [packageName, setPackageName] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [packagesList, setPackagesList] = useState([]);

  const { search, setSearch, handleSearch } = useContextSearch();

  const { showResults, finalResults, setFinalResults } = useContextResults();

  const handleTyping = async (event) => {
    if (event.key === "Enter") {
      const results = await handleSearch(packageName);
      setResults(results);
    }
  };

  const sortedResults = useMemo(() => {
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
  }, [search, results, packagesBeingProcessed]);

  const isProcessing = (packageName) => {
    return packagesBeingProcessed.some((pkg) => pkg === packageName);
  };

  useEffect(() => {
    const fetchPackages = async () => {
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
                processing={isProcessing(result.packageName)}
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

    fetchPackages();
  }, [sortedResults, packagesBeingProcessed]);

  useEffect(() => {
    const getResults = async () => {
      try {
        const fr = await finalResults;
        console.log("Final results: ", fr);
        setResults(fr || []);
      } catch (error) {
        console.error("Erro ao buscar resultados: ", error);
      }
    };

    getResults();
  }, [search]);
  return (
    <div className="search">
      <div className="package-search">
        <input
          spellCheck="false"
          className="package-search-input"
          type="text"
          name="package-name"
          id="package-name"
          value={packageName}
          onChange={(e) => setPackageName(e.target.value)}
          onKeyDown={handleTyping}
          placeholder="Search applications..."
        />
      </div>

      {loading && <p>Searching...</p>}

      {error && <p style={{ color: "red" }}>{error}</p>}

      <div>{packagesList}</div>
    </div>
  );
}
