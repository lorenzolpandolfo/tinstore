import "./install-modal.css";

export default function InstallModal({ packageName }) {
  return (
    <div title={`Installing ${packageName}`} className="install-modal">
      <img src="src/assets/download.svg" alt="download icon" />
    </div>
  );
}
