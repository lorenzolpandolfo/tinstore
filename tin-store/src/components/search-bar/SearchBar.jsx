import { useEffect, useState } from "react";
import "../search-bar/search-bar.css";
import { useContextSearch } from "../../contexts/SearchContext.jsx";

export default function SearchBar() {
  const [packageName, setPackageName] = useState("");
  const { handleSearch } = useContextSearch();
  const { search } = useContextSearch();

  const handleTyping = async (event) => {
    if (event.key === "Enter") {
      handleSearch(packageName);
    }
  };

  useEffect(() => setPackageName(search), [search]);

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
    </div>
  );
}
