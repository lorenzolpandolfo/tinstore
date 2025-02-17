import { dialog } from "electron";
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
    const key = await fs.promises
      .readFile(tokenPath, "utf8")
      .catch(async () => {
        await fs.promises.writeFile(tokenPath, "");

        dialog.showMessageBox({
          type: "info",
          title: "Personal Access Token not found",
          message: "You need to register your Github PAT in settings.",
        });

        return "";
      });

    if (key) {
      return key;
    }
  } catch (err) {
    console.error("[Github PAT] Error loading PAT:", err);
  }
};

export const saveKey = async (key) => {
  try {
    await fs.promises.writeFile(tokenPath, key, "utf8");
    githubToken = loadKey();
  } catch (err) {
    console.error("[Github PAT] Error saving PAT:", err);
  }
};

export let githubToken;
