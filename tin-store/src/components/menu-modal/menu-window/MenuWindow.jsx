import { useEffect, useState } from "react";
import "./menu-window.css";
import { useMenu } from "../../../contexts/MenuContext";

export default function MenuWindow() {
  const [token, setToken] = useState("");
  const { closeMenu } = useMenu();

  const handleChangeToken = async () => {
    window.electron.changeToken(token);
    closeMenu();
  };

  const handleRebuildCache = async () => {
    window.electron.regenerateCache();
    closeMenu();
  };

  useEffect(() => {
    const fetchCurrentToken = async () => {
      const currentToken = await window.electron.getToken();
      setToken(currentToken);
    };
    fetchCurrentToken();
  }, []);

  return (
    <>
      <div className="menu-container">
        <div onClick={closeMenu} className="background-fade"></div>
        <div className="menu-window">
          <div className="top">
            <span className="title">Settings</span>
          </div>
          <div className="content">
            <div className="auth section">
              <span className="subtitle">Authentication</span>
              <div className="label">
                <input
                  type="text"
                  name="api-key"
                  id="api-key"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  spellCheck={false}
                />
                <button className="button" onClick={handleChangeToken}>
                  Confirm
                </button>
              </div>
              <span className="description">
                The GitHub Personal Access Token is required to access the
                Winget repository and retrieve package data. The key is used
                locally only.
              </span>
              <span className="description">
                Don't have one yet?{" "}
                <a
                  href="./index.css"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Create your personal access token
                </a>
                .
              </span>
            </div>
            <div className="cache section">
              <span className="subtitle">Cache</span>
              <div className="label">
                <span className="description">
                  Manually recreate the cache to ensure the latest package data
                  is available.
                </span>
                <button className="button" onClick={handleRebuildCache}>
                  Rebuild
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
