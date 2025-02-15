import { useContextResults } from "../../contexts/ResultsContext";
import { useContextSection } from "../../contexts/SectionContext";
import "./top-header.css";

export default function TopHeader() {
  const { contextSection, setContextSection } = useContextSection();
  const { setFinalResults } = useContextResults();

  const handleSectionChange = (section) => {
    setFinalResults([]);
    setContextSection(section);
  };

  return (
    <div className="top-header">
      <button
        onClick={() => handleSectionChange("explore")}
        className={`top-header-button button ${contextSection === 'explore' && 'selected'}`}
      >
        <span>Explore</span>
      </button>
      <button
        onClick={() => handleSectionChange("installed")}
        className={`top-header-button button ${contextSection === 'installed' && 'selected'}`}
      >
        <span>Installed</span>
      </button>
    </div>
  );
}
