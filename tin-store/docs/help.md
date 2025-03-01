# Tinstore Help

## How to create a GitHub Personal Access Token

### Steps:

1. Open [GitHub's "New Token" page (classic)](https://github.com/settings/tokens/new)  

2. In the **Note** field, enter a name like **"Tinstore Access Token"** to identify its purpose.

3. Set an **expiration date** according to your security preference (e.g., 30 or 90 days).

4. Under **Select scopes**, enable the following permission:
   - **`read:packages`** – Required to access winget public repositories and package registries.

5. In **Tinstore**, go to **Settings → Authentication** and paste the copied token in the input field.

6. Click **Confirm** to complete the authentication process.

---

Once completed, you should be able to search for packages.
