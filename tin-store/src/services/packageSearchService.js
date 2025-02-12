import axios from "axios";
import { getCachedPackage, setCachedPackage } from "../utils/memoryCacheUtils.js";
import { fetchYamlData } from "../utils/yamlParser.js";

export const searchPackage = async (packageName, GITHUB_TOKEN) => {
  try {
    const cachedPackage = getCachedPackage(packageName);
    if (cachedPackage) return cachedPackage;

    const url = `https://api.github.com/search/code?q=${packageName}+extension:yaml+repo:microsoft/winget-pkgs&per_page=7`;
    const headers = { Authorization: `token ${GITHUB_TOKEN}` };
    const response = await axios.get(url, { headers });

    if (response.status === 200) {
      const results = response.data.items;

      if (!results.length) return { message: "No packages found." };

      const packageDataPromises = results.map((item) =>
        {
          console.log("[Request] sending request to get data for package: ", packageName)
          return fetchYamlData(item, headers)}
      );
      const packageData = (await Promise.all(packageDataPromises)).filter(
        Boolean
      );

      const uniquePackages = deduplicatePackages(packageData);

      setCachedPackage(packageName, uniquePackages || packageData);
      return uniquePackages || packageData;
    }
  } catch (error) {
    return { error: `Failed to search package: ${error.message}` };
  }
};

function deduplicatePackages(packageData) {
  const seenPackages = new Map();

  packageData.forEach((pkg) => {
    const existingPackage = seenPackages.get(pkg.packageName);
    if (!existingPackage || compareVersions(pkg.version, existingPackage.version) > 0) {
      seenPackages.set(pkg.packageName, pkg);
    }
  });

  return Array.from(seenPackages.values());
}

const compareVersions = (version1, version2) => {
  const v1 = version1.split(".").map(Number);
  const v2 = version2.split(".").map(Number);

  for (let i = 0; i < Math.max(v1.length, v2.length); i++) {
    const num1 = v1[i] || 0;
    const num2 = v2[i] || 0;
    if (num1 > num2) return 1;
    if (num1 < num2) return -1;
  }
  return 0;
};
