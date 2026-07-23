/* 정적 페이지 빌드 — admin/content.json + admin/render.mjs → public/*.html
   사용: node build.mjs */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { renderAll } from "./admin/render.mjs";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const content = JSON.parse(fs.readFileSync(path.join(ROOT, "admin/content.json"), "utf8"));
const pages = renderAll(content);
for (const [file, html] of Object.entries(pages)) {
  fs.writeFileSync(path.join(ROOT, "public", file), html);
  console.log("wrote", file, (html.length / 1024).toFixed(1) + "KB");
}
console.log("done");
