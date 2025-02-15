import { useContextResults } from "../../contexts/ResultsContext";
import { useContextSection } from "../../contexts/SectionContext";
import "./top-header.css";

export default function TopHeader() {
  const { setContextSection } = useContextSection();
  const { setFinalResults } = useContextResults();

  const handleSectionChange = (section) => {
    setFinalResults([]);
    setContextSection(section);
  };

  return (
    <div className="top-header">
      <button
        onClick={() => handleSectionChange("explore")}
        className="top-header-button button"
      >
        <span>Explore</span>
      </button>
      <button
        onClick={() => handleSectionChange("installed")}
        className="top-header-button button"
      >
        <span>Installed</span>
      </button>
    </div>
  );
}
