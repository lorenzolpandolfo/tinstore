import { useContextSearch } from "../../../contexts/SearchContext";
import "./pkg-card.css";

const handleScrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
};

export default function PkgCard({ packageName, packageDescription }) {
  const { handleSearch } = useContextSearch();

  const handleSearchIn = () => {
    handleSearch(packageName);
  };

  return (
    <div onClick={() => handleSearchIn()} className="pkg-card button">
      <span className="title">{packageName}</span>
      <span className="description">{packageDescription}</span>
    </div>
  );
}
