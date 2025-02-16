import { packages } from "./packages";
import PkgCard from "./pkg-card/PkgCard";

const categories = [
  { id: "development", label: "Development", gradient: "gradient-a" },
  { id: "internet", label: "Internet", gradient: "gradient-b" },
  { id: "work", label: "Work", gradient: "gradient-c" },
  { id: "utils", label: "Utils", gradient: "gradient-d" },
  { id: "games", label: "Games", gradient: "gradient-e" },
  { id: "music-and-video", label: "Music and Video", gradient: "gradient-f" },
];

export default function Homepage() {
  const scrollToCategory = (id) => {
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="homepage">
      <section className="categories top-section">
        <span className="title">Categories</span>
        <div className="packages-list">
          {categories.map(({ id, label, gradient }) => (
            <button
              key={id}
              className={`category-button button gradient ${gradient}`}
              onClick={() => scrollToCategory(id)}
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      {categories.map(({ id, label }) => (
        <section key={id} id={id}>
          <span className="title">{label}</span>
          <div className="packages-list">
            {packages &&
              packages
                .filter(
                  (p) => p.category.replace(/\s+/g, "-").toLowerCase() === id
                )
                .map((p) => (
                  <PkgCard
                    key={p.packageName}
                    packageName={p.packageName}
                    packageDescription={p.packageDescription}
                  />
                ))}
          </div>
        </section>
      ))}
    </div>
  );
}
