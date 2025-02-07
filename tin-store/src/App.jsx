import { useState } from "react";
import "./App.css";

import AppPackage from "../components/app-package/AppPackage.jsx";

const App = () => {
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
    <>
      <div className="package-search">
        <label htmlFor="package-name">Package name</label>
        <input
          type="text"
          name="package-name"
          id="package-name"
          value={packageName}
          onChange={(e) => setPackageName(e.target.value)}
        />
      </div>
      <button
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
    </>
  );
};

export default App;
