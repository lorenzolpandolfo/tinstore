import "./app-package.css";
import CONSTANTS from "../../utils/constants.js";

export default function AppPackage(
  packageName,
  version,
  id,
  publisher,
  description,
  homepage
) {
  const title = packageName + " " + version;

  return (
    <div className="app-package">
      <span className="app-package-title">{title}</span>
      <span className="app-package-publisher">{publisher}</span>
      <span className="app-package-content">{description}</span>
      <span className="app-package-content">{id}</span>
    </div>
  );
}
