import axios from "axios";
import {
  getCachedPackage,
  setCachedPackage,
} from "../utils/memoryCacheUtils.js";
import { fetchYamlData } from "../utils/yamlParser.js";

export const searchPackage = async (packageName, GITHUB_TOKEN) => {
  try {
    const cachedPackage = getCachedPackage(packageName.toLowerCase());
    if (cachedPackage) return cachedPackage;

    const url = `https://api.github.com/search/code?q=${packageName}+extension:yaml+repo:microsoft/winget-pkgs&per_page=7`;
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

      const uniquePackages = deduplicatePackages(packageData);

      setCachedPackage(
        packageName.toLowerCase(),
        uniquePackages || packageData
      );
      return uniquePackages || packageData;
    }
  } catch (error) {
    return { error: `Failed to search package: ${error.message}` };
  }
};

function deduplicatePackages(packageData) {
  const seenPackages = new Map();

  packageData.forEach((pkg) => {
    const existingPackage = seenPackages.get(pkg.packageId);

    const dataCount = [
      pkg.publisher,
      pkg.description,
      pkg.publisherUrl,
      pkg.packageUrl,
    ].filter(Boolean).length;
    const existingDataCount = existingPackage
      ? [
          existingPackage.publisher,
          existingPackage.description,
          existingPackage.publisherUrl,
          existingPackage.packageUrl,
        ].filter(Boolean).length
      : 0;

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

    return packageData.error || packageData.message ? [] : packageData;
  } catch (err) {
    console.error("Error searching packages:", err);
    return [];
  }
};
