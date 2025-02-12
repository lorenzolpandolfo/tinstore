import axios from "axios";
import yaml from "js-yaml";
import { getCachedPackage, setCachedPackage } from "./memoryCacheUtils.js";

export const fetchYamlData = async (item, headers) => {
  if (getCachedPackage(item.url)) {
    return getCachedPackage(item.url);
  }

  const yamlUrl = item.html_url
    .replace("github.com", "raw.githubusercontent.com")
    .replace("/blob/", "/");

  try {
    const yamlResponse = await axios.get(yamlUrl, { headers });
    const data = yaml.load(yamlResponse.data);

    const packageInfo = {
      packageId: data.PackageIdentifier,
      packageName:
        data.PackageName ||
        data.PackageIdentifier.split(".").join(" ") ||
        "N/A",
      publisher: data.Publisher,
      version: data.PackageVersion,
      description: data.ShortDescription,
      publisherUrl: data.PublisherUrl,
      packageUrl: data.PackageUrl,
    };

    setCachedPackage(item.url, packageInfo);
    return packageInfo;
  } catch (error) {
    console.error(`Error loading YAML from ${yamlUrl}: ${error.message}`);
    return null;
  }
};
