import "./menu-window.css";

export default function MenuWindow() {
  return (
    <div className="menu-container">
      <div className="menu-window">
        <div className="top">
          <span className="title">Settings</span>
        </div>
        <div className="content">
          <div className="auth section">
            <span className="subtitle">Authentication</span>
            <div className="label">
              <input type="text" name="api-key" id="api-key" />
              <button className="button">Confirm</button>
            </div>
            <span className="description">
              The GitHub Personal Access Token is required to access the Winget
              repository and retrieve package data. The key is used locally
              only.
            </span>
            <span className="description">
              Don't have one yet?{" "}
              <a
                href="https://docs.github.com/en/enterprise-cloud@latest/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens"
                target="_blank"
              >
                Create your GitHub Personal Access Token.
              </a>
            </span>
          </div>
          <div className="cache section">
            <span className="subtitle">Cache</span>
            <div className="label">
              <span className="description">
                Manually recreate the cache to ensure the latest package data is
                available.
              </span>
              <button className="button">Rebuild</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
