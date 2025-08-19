import axios from "axios";
import {
  getCachedPackage,
  setCachedPackage,
} from "../utils/memoryCacheUtils.js";
import { fetchYamlData } from "../utils/yamlParser.js";

const _countPackageData = (pkg) => {
  if (!pkg) return 0;
  return [
    pkg.publisher,
    pkg.description,
    pkg.publisherUrl,
    pkg.packageUrl,
  ].filter(Boolean).length;
};

export const searchPackage = async (packageName, GITHUB_TOKEN) => {
  try {
    const cachedPackage = getCachedPackage(packageName.toLowerCase());
    if (cachedPackage) return cachedPackage;

    const url = `https://api.github.com/search/code?q=${packageName}+in:file,path+extension:yaml+repo:microsoft/winget-pkgs&per_page=7`;
    const headers = { Authorization: `token ${GITHUB_TOKEN}` };
    const response = await axios.get(url, { headers });

    if (response.status === 200) {
      const results = response.data.items;
      if (!results.length) return { message: "No packages found." };

      const packageDataPromises = results.map((item) => {
        console.log(
          "[Request] sending request to get data for package: ",
          packageName
        );
        return fetchYamlData(item, headers);
      });

      const packageData = (await Promise.all(packageDataPromises)).filter(
        Boolean
      );

      const finalPackages = deduplicatePackages(packageData);

      setCachedPackage(packageName.toLowerCase(), finalPackages);

      return finalPackages;
    }
  } catch (error) {
    console.error("Failed to search for package:", error);
    return { error: `Failed to search package: ${error.message}` };
  }
};

function deduplicatePackages(packageData) {
  const seenPackages = new Map();

  packageData.forEach((pkg) => {
    const existingPackage = seenPackages.get(pkg.packageId);
    const dataCount = _countPackageData(pkg);
    const existingDataCount = _countPackageData(existingPackage);

    if (!existingPackage || dataCount > existingDataCount) {
      seenPackages.set(pkg.packageId, pkg);
    }
  });

  return [...seenPackages.values()];
}

export const handlePackageSearch = async (packageName) => {
  if (!packageName) return [];

  try {
    const packageData = await window.electron.searchPackage(packageName);

    if (packageData?.cached) return packageData.cached;
    if (packageData.error || packageData.message) return [];

    return packageData;
  } catch (err) {
    console.error("Error searching packages:", err);
    return [];
  }
};
