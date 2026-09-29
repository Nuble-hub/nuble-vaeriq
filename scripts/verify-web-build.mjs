import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const dist = join(process.cwd(), "dist-web");
const requiredFiles = ["index.html", "feedback.html"];

for (const file of requiredFiles) {
  const path = join(dist, file);
  if (!existsSync(path)) {
    throw new Error(`WEB_BUILD_MISSING:${file}`);
  }

  const html = readFileSync(path, "utf8");
  if (!html.includes("<html") || !html.includes("</html>")) {
    throw new Error(`WEB_BUILD_INVALID_HTML:${file}`);
  }

  if (html.includes('src="/src/')) {
    throw new Error(`WEB_BUILD_UNREBUNDED_SOURCE_PATH:${file}`);
  }
}

const indexHtml = readFileSync(join(dist, "index.html"), "utf8");
if (!indexHtml.includes("window.__VAERIQ_BOOT_READY__")) {
  throw new Error("WEB_BUILD_BOOT_GUARD_MISSING:index.html");
}

console.log("Public web build verification: PASS", {
  output: dist,
  files: requiredFiles
});
