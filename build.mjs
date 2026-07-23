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

/* pages.dev 테스트용 어드민(데모 모드): 정적 파일만 public/admin/ 으로 복사 */
const demoDir = path.join(ROOT, "public/admin");
if (!fs.existsSync(demoDir)) fs.mkdirSync(demoDir, { recursive: true });
fs.copyFileSync(path.join(ROOT, "admin/demo-index.html"), path.join(demoDir, "index.html"));
for (const f of ["admin.css", "admin.js", "schema.mjs", "render.mjs", "content.json"]) {
  fs.copyFileSync(path.join(ROOT, "admin", f), path.join(demoDir, f));
}
console.log("wrote admin demo → public/admin/");
console.log("done");
