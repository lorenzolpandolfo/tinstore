import "./pkg-card.css";

export default function PkgCard({ packageName, packageDescription }) {
  return (
    <div className="pkg-card button">
      <span className="title">{packageName}</span>
      <span className="description">{packageDescription}</span>
    </div>
  );
}
