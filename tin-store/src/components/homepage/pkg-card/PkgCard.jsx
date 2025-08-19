import { useContextSearch } from "../../../contexts/SearchContext";
import "./pkg-card.css";

export default function PkgCard({
  alias,
  packageName,
  packageDescription,
  packageUrl,
}) {
  const { handleSearch } = useContextSearch();

  const handleSearchIn = () => {
    handleSearch(packageName);
  };

  return (
    <div
      onClick={() => handleSearchIn()}
      className="pkg-card button"
      title={packageDescription}
    >
      <img
        className="pkg-card-icon"
        src={`https://www.google.com/s2/favicons?sz=64&domain=${packageUrl}`}
      />
      <span className="pkg-title">{alias || packageName}</span>
    </div>
  );
}
