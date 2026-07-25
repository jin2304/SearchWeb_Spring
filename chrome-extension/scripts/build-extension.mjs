import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const target = process.argv[2] ?? "chrome";
const env = process.argv[3] ?? "dev";

const supportedTargets = new Set(["chrome", "edge"]);
if (!supportedTargets.has(target)) {
  throw new Error(`Unsupported target "${target}". Use chrome or edge.`);
}

const supportedEnvs = new Set(["dev", "prod"]);
if (!supportedEnvs.has(env)) {
  throw new Error(`Unsupported env "${env}". Use dev or prod.`);
}

// 환경별 API URL 결정 (기본값: dev -> localhost, prod -> https://relink.ai.kr)
const apiUrl = env === "prod" 
  ? (process.env.PROD_API_URL ?? "https://relink.ai.kr") 
  : "http://localhost:8080";

const readJson = async (relativePath) => JSON.parse(await readFile(path.join(root, relativePath), "utf8"));
const merge = (base, override) => {
  const output = { ...base };
  for (const [key, value] of Object.entries(override)) {
    if (value && typeof value === "object" && !Array.isArray(value) && typeof output[key] === "object" && !Array.isArray(output[key])) {
      output[key] = merge(output[key], value);
    } else {
      output[key] = value;
    }
  }
  return output;
};

const baseManifest = await readJson("manifests/manifest.base.json");

// 환경에 따른 host_permissions 동적 주입
const hostPermissionPattern = `${apiUrl.replace(/\/+$/, "")}/*`;
baseManifest.host_permissions = [hostPermissionPattern];

const targetManifest = await readJson(`manifests/manifest.${target}.json`);
const outDir = path.join(root, "dist", target);

await rm(outDir, { recursive: true, force: true });
await mkdir(outDir, { recursive: true });
await cp(path.join(root, "src"), path.join(outDir, "src"), { recursive: true });
await cp(path.join(root, "icons"), path.join(outDir, "icons"), { recursive: true });

// 1. manifest.json 병합 및 쓰기
await writeFile(path.join(outDir, "manifest.json"), `${JSON.stringify(merge(baseManifest, targetManifest), null, 2)}\n`, "utf8");

// 2. config.js 내 API URL 및 환경변수 치환
const configPath = path.join(outDir, "src", "shared", "config.js");
const configContent = await readFile(configPath, "utf8");
const updatedConfigContent = configContent
  .replace("__API_URL__", apiUrl)
  .replace("__ENV__", env);
await writeFile(configPath, updatedConfigContent, "utf8");

console.log(`Built ${target} extension (${env} mode, API: ${apiUrl}) at ${path.relative(process.cwd(), outDir)}`);