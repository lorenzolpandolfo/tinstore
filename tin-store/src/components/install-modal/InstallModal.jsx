import "./install-modal.css";

export default function InstallModal({ packages }) {
  const formatPackages = (packages) => {

    console.log(packages)

    console.log("Criando o icone de processing")

    if (!packages || packages.length === 0) return "";

    let stringPackages = "";

    const processingPackages = packages.filter((p) => p.processing == true)

    console.log("Processingpackages: ", processingPackages)

    processingPackages.forEach((p, index) => {
      stringPackages += ` ${p.packageName}${index < packages.length - 1 ? "," : "..."}`;
    });

    return stringPackages;
  };

  return (
    <div
      title={`Processing${formatPackages(packages)}`}
      className="install-modal"
    >
      <img src="src/assets/download.svg" alt="download icon" />
    </div>
  );
}
