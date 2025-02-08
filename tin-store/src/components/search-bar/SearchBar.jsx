import { useState } from "react";
import AppPackage from "../app-package/AppPackage.jsx";
import "../search-bar/search-bar.css";

export default function SearchBar() {
  const [packageName, setPackageName] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async () => {
    if (!packageName) {
      alert("Please enter a package name");
      return;
    }

    setLoading(true);
    setError("");
    setResults([]);

    try {
      const packageData = await window.electron.invoke(packageName);
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

      <div>
        {results.map((result, index) => (
          <div key={index} className="app-container">
            {result.message ? (
              <p>{result.message}</p>
            ) : (
              AppPackage(
                result.packageName,
                result.version,
                result.packageId,
                result.publisher,
                result.description,
                result.publisherUrl,
                result.packageUrl
              )
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
