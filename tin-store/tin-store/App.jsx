import React, { useState } from 'react';
const { ipcRenderer } = window.require('electron');

const App = () => {
  const [packageName, setPackageName] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    if (!packageName) {
      alert('Please enter a package name.');
      return;
    }

    setLoading(true);
    setError('');
    setResults([]);

    try {
      const packageData = await ipcRenderer.invoke('search-package', packageName);
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
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Package Search</h1>
      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          value={packageName}
          onChange={(e) => setPackageName(e.target.value)}
          placeholder="Enter package name"
          style={{
            width: '300px',
            padding: '10px',
            marginRight: '10px',
            border: '1px solid #ccc',
            borderRadius: '4px',
          }}
        />
        <button
          onClick={handleSearch}
          style={{
            padding: '10px 15px',
            backgroundColor: '#007BFF',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Search
        </button>
      </div>

      {loading && <p>Searching...</p>}

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div>
        {results.map((result, index) => (
          <div
            key={index}
            style={{
              marginTop: '20px',
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              background: '#f9f9f9',
            }}
          >
            {result.message ? (
              <p>{result.message}</p>
            ) : (
              <>
                <h3>
                  {result.packageName} ({result.version})
                </h3>
                <p>
                  <strong>Package ID:</strong> {result.packageId}
                </p>
                <p>
                  <strong>Publisher:</strong> {result.publisher}
                </p>
                <p>
                  <strong>Description:</strong> {result.description}
                </p>
                <p>
                  <strong>Homepage:</strong>{' '}
                  <a href={result.homepage} target="_blank" rel="noopener noreferrer">
                    {result.homepage}
                  </a>
                </p>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;

