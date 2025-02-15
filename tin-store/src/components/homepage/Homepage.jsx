import { packages } from "./packages";
import PkgCard from "./pkg-card/PkgCard";

export default function Homepage() {
  return (
    <div className="homepage">
      <section className="categories top-section">
        <span className="title">Categories</span>

        <div className="packages-list">
          <button className="category-button button">Development</button>
          <button className="category-button button">Internet</button>
          <button className="category-button button">Work</button>
          <button className="category-button button">Utils</button>
          <button className="category-button button">Games</button>
          <button className="category-button button">Music and Video</button>
        </div>
      </section>

      <section>
        <span className="title">Development</span>
        <div className="packages-list">
          {packages &&
            packages
              .filter((p) => p.category === "development")
              .map((p) => (
                <PkgCard
                  packageName={p.packageName}
                  packageDescription={p.packageDescription}
                />
              ))}
        </div>
      </section>


      <section>
        <span className="title">Internet</span>
        <div className="packages-list">
          {packages &&
            packages
              .filter((p) => p.category === "internet")
              .map((p) => (
                <PkgCard
                  packageName={p.packageName}
                  packageDescription={p.packageDescription}
                />
              ))}
        </div>
      </section>


      <section>
        <span className="title">Work</span>
        <div className="packages-list">
          {packages &&
            packages
              .filter((p) => p.category === "work")
              .map((p) => (
                <PkgCard
                  packageName={p.packageName}
                  packageDescription={p.packageDescription}
                />
              ))}
        </div>
      </section>

      <section>
        <span className="title">Utils</span>
        <div className="packages-list">
          {packages &&
            packages
              .filter((p) => p.category === "utils")
              .map((p) => (
                <PkgCard
                  packageName={p.packageName}
                  packageDescription={p.packageDescription}
                />
              ))}
        </div>
      </section>

      <section>
        <span className="title">Games</span>
        <div className="packages-list">
          {packages &&
            packages
              .filter((p) => p.category === "games")
              .map((p) => (
                <PkgCard
                  packageName={p.packageName}
                  packageDescription={p.packageDescription}
                />
              ))}
        </div>
      </section>

      <section>
        <span className="title">Music and Video</span>
        <div className="packages-list">
          {packages &&
            packages
              .filter((p) => p.category === "music and video")
              .map((p) => (
                <PkgCard
                  packageName={p.packageName}
                  packageDescription={p.packageDescription}
                />
              ))}
        </div>
      </section>
    </div>
  );
}
