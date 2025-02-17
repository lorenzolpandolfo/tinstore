import fs from "fs";

import path from "path";
import { dirname } from "path";

export const tokenPath = path.join(
  dirname(process.cwd()),
  "tin-store",
  "token.txt"
);

export const loadKey = async () => {
  try {
    const key = await fs.promises.readFile(tokenPath, "utf8");
    console.log("chave carregada: ", key);
    return key;
  } catch (err) {
    console.error("[Github PAT] Error loading PAT:", err);
  }
};

export const saveKey = async (key) => {
  try {
    await fs.promises.writeFile(tokenPath, key, "utf8");
    console.log("Chave alterada: ", key);
    githubToken = loadKey();
  } catch (err) {
    console.error("[Github PAT] Error saving PAT:", err);
  }
};

export let githubToken = loadKey();
