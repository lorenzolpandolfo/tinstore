import { useState } from "react";
import AppPackage from "../app-package/AppPackage.jsx";
import "./search-bar.css";

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
        />
      </div>
      <button
        type="submit"
        onClick={handleSearch}
        onChange={(e) => setPackageName(e.target.value)}
      >
        Search
      </button>

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
                result.id,
                result.publisher,
                result.description,
                result.homepage
              )
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
