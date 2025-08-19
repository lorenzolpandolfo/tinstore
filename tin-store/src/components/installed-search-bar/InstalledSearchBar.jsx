import "./installed-search-bar.css";

export default function InstalledSearchBar({ filter, setFilter }) {
  return (
    <div className="search">
      <div className="package-search-installed">
        <input
          spellCheck="false"
          className="package-search-input-installed"
          type="text"
          name="package-name"
          id="package-name"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Find installed applications..."
        />
      </div>
    </div>
  );
}
