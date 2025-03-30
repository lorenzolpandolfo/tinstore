import "../app-package/app-package.css";

const MESSAGE_NO_INFORMATION = "No information";
const MESSAGE_NO_PUBLISHER = "Unknown publisher";
const MESSAGE_NO_DESCRIPTION = "No description provided.";
const HINT_NO_EXTERNAL_REFERENCE = "No external reference";
const INSTALL_PREFIX = "winget install ";
const UNINSTALL_PREFIX = "winget uninstall ";

export default function AppPackage({
  packageName,
  version,
  packageId,
  publisher,
  description,
  publisherUrl,
  packageUrl,
  processing,
  installed,
}) {
  const fmt_packageName = packageName || MESSAGE_NO_INFORMATION;
  const fmt_version = version || MESSAGE_NO_INFORMATION;
  const fmt_publisher = publisher || MESSAGE_NO_PUBLISHER;
  const fmt_description = description || MESSAGE_NO_DESCRIPTION;

  const handlePackageInstall = async () => {
    alert(packageName + " will be installed.");
    window.electron.runCommand(INSTALL_PREFIX + packageId, {
      packageId,
      packageName,
    });
  };

  const handlePackageUninstall = async () => {
    alert(packageName + " will be uninstalled.");
    window.electron.runCommand(UNINSTALL_PREFIX + packageId, {
      packageId,
      packageName,
    });
  };

  const normalizeString = (str) => {
    if (!str) return "";
    return str
      .toLowerCase()
      .trim()
      .replace(/[_]/g, " ")
      .replace("-", "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  };

  const lowerPackageUrl = normalizeString(packageUrl);
  const lowerPublisherUrl = normalizeString(publisherUrl);
  const lowerPackageName = normalizeString(fmt_packageName);

  const packageNameParts = lowerPackageName.split(" ");
  const isVerified = packageNameParts.some(
    (part) =>
      (lowerPackageUrl && lowerPackageUrl.includes(part)) ||
      (lowerPublisherUrl && lowerPublisherUrl.includes(part))
  );

  return (
    <div className="app-package">
      <div className="app-package-top">
        <div className="app-package-title">
          {packageUrl ? (
            <a
              href={packageUrl}
              target="_blank"
              className="app-package-title"
              title={`Visit the ${packageName} website`}
            >
              {fmt_packageName}
            </a>
          ) : (
            <span
              title={HINT_NO_EXTERNAL_REFERENCE}
              className="app-package-title"
            >
              {fmt_packageName}
            </span>
          )}
          {isVerified && (
            <img
              title="Official source"
              className="verified-app-check"
              alt="verified app check"
              src="assets/check.svg"
            />
          )}
        </div>
        <span className="app-package-publisher"> {fmt_version}</span>
      </div>
      <div className="app-package-bottom">
        <div className="app-package-details">
          {publisherUrl ? (
            <a
              href={publisherUrl}
              target="_blank"
              className="app-package-publisher"
              title={`Visit the ${publisher} website`}
            >
              {fmt_publisher}
            </a>
          ) : (
            <span
              title={HINT_NO_EXTERNAL_REFERENCE}
              className="app-package-publisher"
            >
              {fmt_publisher}
            </span>
          )}
          <span className="app-package-content">{fmt_description}</span>
        </div>
      </div>
      <div className="app-buttons">
        {installed && !processing && (
          <span
            className="button app-package-uninstall"
            onClick={() => handlePackageUninstall()}
          >
            Uninstall
          </span>
        )}
        {installed && processing && (
          <span className="app-package-installing">Uninstalling...</span>
        )}
        {!installed && processing && (
          <span className="app-package-installing">Installing...</span>
        )}
        {!installed && !processing && (
          <span
            className="button app-package-install"
            onClick={() => handlePackageInstall()}
          >
            Install
          </span>
        )}
      </div>
    </div>
  );
}
