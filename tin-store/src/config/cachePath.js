import path from "path";
import { dirname } from "path";

export const CACHE_DIR = path.join(dirname(process.cwd()), "tin-store", "cache");
export const CACHE_FILE_PATH = path.join(CACHE_DIR, "/installed-packages.json");
