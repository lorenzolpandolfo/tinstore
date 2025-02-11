import { useEffect, useMemo, useState } from "react";
import AppPackage from "../app-package/AppPackage.jsx";
import "../search-bar/search-bar.css";

export default function SearchBar({ packagesBeingInstalled: packagesBeingProcessed }) {
  const [packageName, setPackageName] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [packagesList, setPackagesList] = useState([]);

  const handleSearch = async () => {
    if (!packageName) {
      alert("Please enter a package name");
      return;
    }

    setLoading(true);
    setError("");
    setResults([]);

    try {
      const packageData = await window.electron.searchPackage(packageName);
      setLoading(false);

      if (packageData.error) {
        setError(packageData.error);
        return;
      }

      if (packageData.message) {
        setResults([{ message: packageData.message }]);
        return;
      }

      setResults(packageData);
    } catch (err) {
      setLoading(false);
      setError(`Failed to fetch data: ${err.message}`);
    }
  };

  const handleTyping = (event) => {
    if (event.key === "Enter") {
      handleSearch();
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
  }, [results, packagesBeingProcessed]);

  const isPackageBeingProcessed = (packageName) => {
    return packagesBeingProcessed.some(pkg => pkg.packageName === packageName && pkg.processing);
  };


  const isPackageInstalled = (packageName) => {
    return packagesBeingProcessed.some(pkg => pkg.packageName === packageName && pkg.installed);
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
                installStatus={isPackageBeingProcessed(result.packageName)}
                installed={result.installed || isPackageInstalled(result.packageName)}
                //installed={isPackageInstalled(result.packageName)}
              />
            )}
          </div>
        ));

        setPackagesList(list);
      } catch (error) {
        console.error("Erro ao verificar pacotes:", error);
      }
    };

    fetchPackages();
  }, [sortedResults, packagesBeingProcessed]);

  return (
    <div className="search">
      <div className="package-search">
        <input
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
