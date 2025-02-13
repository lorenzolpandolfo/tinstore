import { useContextSection } from "../../contexts/SectionContext";
import "./top-header.css";

export default function TopHeader() {
  const { setContextSection } = useContextSection();

  return (
    <div className="top-header">
      <button
        onClick={() => setContextSection("explore")}
        className="top-header-button button"
      >
        <span>Explore</span>
      </button>
      <button
        onClick={() => setContextSection("installed")}
        className="top-header-button button"
      >
        <span>Installed</span>
      </button>
    </div>
  );
}
