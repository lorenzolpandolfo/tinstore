import "../app-package/app-package.css";

const MESSAGE_NO_INFORMATION = "No information";
const MESSAGE_NO_PUBLISHER = "Unknown publisher";
const MESSAGE_NO_DESCRIPTION = "No description provided.";

export default function AppPackage(
  packageName,
  version,
  id,
  publisher,
  description,
  homepage
) {
  const fmt_packageName = packageName || MESSAGE_NO_INFORMATION;
  const fmt_version = version || MESSAGE_NO_INFORMATION;
  const fmt_publisher = publisher || MESSAGE_NO_PUBLISHER;
  const fmt_description = description || MESSAGE_NO_DESCRIPTION;

  const handlePackageInstall = async () => {
    console.log("instalar pacote: ", id)
  }

  return (
    <div className="app-package">
      <div className="app-package-top">
        <span className="app-package-title">{fmt_packageName}</span>
        <span className="app-package-publisher"> {fmt_version}</span>
      </div>
      <div className="app-package-bottom">
        <div className="app-package-details">
          <span className="app-package-publisher">{fmt_publisher}</span>
          <span className="app-package-content">{fmt_description}</span>
        </div>
        <span
          className="app-package-install"
          onClick={() => handlePackageInstall()}
        >
          Install
        </span>
      </div>
    </div>
  );
}
