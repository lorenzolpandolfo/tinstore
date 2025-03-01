import "./install-modal.css";

export default function InstallModal({ packages }) {
  const formatPackages = (packages) => {
    if (!packages || packages.length === 0) return "";

    let stringPackages = "";

    packages.forEach((p, index) => {
      stringPackages += ` ${p}${index < packages.length - 1 ? "," : "..."}`;
    });

    return stringPackages;
  };

  return (
    <div
      title={`Processing${formatPackages(packages)}`}
      className="install-modal"
    >
      <img src="assets/download.svg" alt="download icon" />
    </div>
  );
}
