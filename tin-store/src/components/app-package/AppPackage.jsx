import "../app-package/app-package.css";

const MESSAGE_NO_INFORMATION = "No information";
const MESSAGE_NO_PUBLISHER = "Unknown publisher";
const MESSAGE_NO_DESCRIPTION = "No description provided.";

const HINT_NO_EXTERNAL_REFERENCE = "No external reference";

export default function AppPackage(
  packageName,
  version,
  id,
  publisher,
  description,
  publisherUrl,
  packageUrl
) {
  const fmt_packageName = packageName || MESSAGE_NO_INFORMATION;
  const fmt_version = version || MESSAGE_NO_INFORMATION;
  const fmt_publisher = publisher || MESSAGE_NO_PUBLISHER;
  const fmt_description = description || MESSAGE_NO_DESCRIPTION;

  const handlePackageInstall = async () => {
    alert(packageName + " will be installed.");
    window.electron.runCommand("winget install " + id);
    console.warn;
  };

  return (
    <div className="app-package">
      <div className="app-package-top">
        {packageUrl ? (
          <a href={packageUrl} target="_blank" className="app-package-title">
            {fmt_packageName}
          </a>
        ) : (
          <span title={HINT_NO_EXTERNAL_REFERENCE} className="app-package-title">{fmt_packageName}</span>
        )}
        <span className="app-package-publisher"> {fmt_version}</span>
      </div>
      <div className="app-package-bottom">
        <div className="app-package-details">
          {publisherUrl ? (
            <a href={publisherUrl} target="_blank" className="app-package-publisher">
              {fmt_publisher}
            </a>
          ) : (
            <span title={HINT_NO_EXTERNAL_REFERENCE} className="app-package-publisher">{fmt_publisher}</span>
          )}
          <span className="app-package-content">{fmt_description}</span>
        </div>
      </div>
      <div className="app-buttons">
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
