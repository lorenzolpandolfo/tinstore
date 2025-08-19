
<p align="center">
    <a href="https://github.com/lorenzolpandolfo/tinstore/releases">
      <img src="./tin-store/public/assets/logo.svg" alt="" width="250"/>
    </a>
</p>
<p align="center">
    <a href="https://github.com/lorenzolpandolfo/tinstore/releases">
      <img src="./tin-store/public/assets/downloadBtn.svg" alt="Download" width="150"/>
    </a>
</p>

# Tin Store  
### The smarter way to install and manage apps on Windows  

**Tin Store** is an intuitive and easy-to-use app store for **Windows**, allowing you to discover, install, and manage applications effortlessly. Powered by **Winget**, Tin Store simplifies app installations and updates, making it your one-stop solution for Windows software management.


## How it works?

Tin Store works by integrating with **Winget**, the Windows package manager, to allow you to search, install, and update apps directly from the app. It simplifies the process of installing software on Windows, giving users an easy-to-navigate interface for managing their apps without needing to worry about different installers or versions.

Key features:
- Browse and discover applications available on Winget
- Install apps with just a few clicks
- Simple, clean, and modern interface

## Building from source
The process below is only necessary if you're a developer and would like to build it from source. Otherwise, just download it from the releases page.
   ```bash
   git clone https://github.com/lorenzolpandolfo/tinstore.git
   cd tinstore/tin-store
   npm install
   npm run build
   ```

## Disclaimer
**Tin Store** is not affiliated, partnered, or associated with any brand or developer of the applications displayed or managed within the project. The project only displays public data from packages available on **Winget** (Windows package manager), sourced from the official Winget package repository: [Winget-Pkgs](https://github.com/microsoft/winget-pkgs), which is licensed under the [MIT License](https://opensource.org/licenses/MIT).

All data used by **Tin Store** is public and directly extracted from this repository. **The developers of the applications displayed on Tin Store retain ownership of their respective applications and logos**. We are not impersonating them nor suggesting any type of partnership.

The use of these applications is subject to the respective licenses of each application. For more information on the usage of these packages, please refer to the individual licenses of each application.

If your app is listed on the homepage and you disagree with this, please open an issue so it can be removed.
