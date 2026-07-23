/* YTINS 어드민 UI — 스키마 기반 폼 + 미리보기 + 저장(사이트 반영) */
import { SECTIONS } from "./schema.mjs";
import { renderAll, ICON_NAMES } from "./render.mjs";

let CONTENT = null;
let CSRF = null;
let DIRTY = false;

const $ = (s, el) => (el || document).querySelector(s);
const el = (tag, cls, text) => {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text != null) e.textContent = text;
  return e;
};

/* 테스트(데모) 모드: PHP 백엔드 없이 브라우저에서만 동작 — pages.dev 미리보기용.
   저장은 localStorage에 보존되어 편집 UX를 그대로 검증할 수 있음. */
const DEMO = !!window.YTINS_DEMO;
async function demoApi(action, opts = {}) {
  const LS = "ytins-admin-demo";
  if (action === "state") {
    return { authed: sessionStorage.getItem(LS + "-authed") === "1", user: "admin", csrf: "demo", defaultPw: false };
  }
  if (action === "login") {
    const b = opts.body || {};
    if (b.user === "admin" && b.pass === "ytins2026!") { sessionStorage.setItem(LS + "-authed", "1"); return { ok: true, csrf: "demo", defaultPw: false }; }
    return { ok: false, error: "아이디 또는 비밀번호가 올바르지 않습니다. (테스트 계정: admin / ytins2026!)" };
  }
  if (action === "logout") { sessionStorage.removeItem(LS + "-authed"); return { ok: true }; }
  if (action === "content") {
    const saved = localStorage.getItem(LS + "-content");
    if (saved) { try { return JSON.parse(saved); } catch (e) {} }
    return (await fetch("content.json")).json();
  }
  if (action === "save") {
    localStorage.setItem(LS + "-content", JSON.stringify(opts.body.content));
    setTimeout(() => alert("테스트 모드: 이 브라우저에만 저장되었습니다.\n실서버(카페24) /admin 에서는 같은 저장 버튼이 실제 홈페이지에 반영됩니다."), 100);
    return { ok: true, written: Object.keys(opts.body.pages || {}) };
  }
  if (action === "upload") return { ok: false, error: "테스트 모드에서는 파일 업로드가 동작하지 않습니다.\n(카페24 배포 후 실제 어드민에서 사용 가능합니다)" };
  if (action === "chpass") return { ok: false, error: "테스트 모드에서는 비밀번호 변경이 동작하지 않습니다." };
  return { ok: false, error: "지원하지 않는 요청" };
}

async function api(action, opts = {}) {
  if (DEMO) return demoApi(action, opts);
  const res = await fetch("api.php?a=" + action, {
    method: opts.method || "GET",
    headers: Object.assign(
      opts.form ? {} : { "Content-Type": "application/json" },
      CSRF ? { "X-CSRF": CSRF } : {}
    ),
    body: opts.form ? opts.form : opts.body ? JSON.stringify(opts.body) : undefined,
  });
  return res.json();
}

/* ---------- 경로 유틸 ---------- */
const getPath = (obj, path) => path.split(".").reduce((o, k) => (o ? o[k] : undefined), obj);

/* ---------- 폼 빌더 ---------- */
function labelOf(spec) { return spec.split(":").slice(1).join(":").trim(); }
function typeOf(spec) { return spec.split(":")[0].trim(); }

function buildField(container, spec, value, setter) {
  const type = typeOf(spec);
  const wrap = el("div", "fld");
  wrap.appendChild(el("label", null, labelOf(spec)));
  if (type === "area" || (typeof value === "string" && value.length > 70)) {
    const ta = el("textarea");
    ta.value = value ?? "";
    ta.rows = Math.min(6, Math.max(2, Math.ceil((value || "").length / 60)));
    ta.addEventListener("input", () => { setter(ta.value); markDirty(); });
    wrap.appendChild(ta);
  } else if (type === "icon") {
    const sel = el("select");
    ICON_NAMES.forEach((n) => {
      const o = el("option", null, n);
      o.value = n;
      if (n === value) o.selected = true;
      sel.appendChild(o);
    });
    sel.addEventListener("change", () => { setter(sel.value); markDirty(); });
    wrap.appendChild(sel);
  } else if (type.startsWith("img")) {
    const dir = type.split(".")[1] || "assets";
    const row = el("div", "imgrow");
    const inp = el("input");
    inp.value = value ?? "";
    inp.addEventListener("input", () => { setter(inp.value); markDirty(); });
    const btn = el("button", "btn-sm", "업로드");
    btn.type = "button";
    const file = el("input");
    file.type = "file";
    file.style.display = "none";
    btn.addEventListener("click", () => file.click());
    file.addEventListener("change", async () => {
      if (!file.files[0]) return;
      const fd = new FormData();
      fd.append("file", file.files[0]);
      fd.append("dir", dir);
      fd.append("name", file.files[0].name.replace(/[^A-Za-z0-9._-]/g, "-"));
      btn.textContent = "업로드 중…";
      const r = await api("upload", { method: "POST", form: fd });
      btn.textContent = "업로드";
      if (!r.ok) return alert(r.error || "업로드 실패");
      /* 경로 형식은 기존 값 형식을 따름: 파일명만 쓰는 필드는 파일명만 */
      const isBare = !(value || "").includes("/");
      inp.value = isBare ? r.name : r.path;
      setter(inp.value);
      markDirty();
      alert("업로드 완료: " + r.name + "\n저장 버튼을 눌러야 사이트에 반영됩니다.");
    });
    row.appendChild(inp);
    row.appendChild(btn);
    row.appendChild(file);
    wrap.appendChild(row);
  } else {
    const inp = el("input");
    inp.value = value ?? "";
    inp.addEventListener("input", () => { setter(inp.value); markDirty(); });
    wrap.appendChild(inp);
  }
  container.appendChild(wrap);
}

function listControls(arr, i, rerender) {
  const c = el("div", "item-ctl");
  const mk = (t, fn, danger) => {
    const b = el("button", "btn-sm" + (danger ? " danger" : ""), t);
    b.type = "button";
    b.addEventListener("click", () => { fn(); markDirty(); rerender(); });
    c.appendChild(b);
  };
  mk("▲", () => { if (i > 0) [arr[i - 1], arr[i]] = [arr[i], arr[i - 1]]; });
  mk("▼", () => { if (i < arr.length - 1) [arr[i + 1], arr[i]] = [arr[i], arr[i + 1]]; });
  mk("삭제", () => { if (confirm("이 항목을 삭제할까요?")) arr.splice(i, 1); }, true);
  return c;
}

function emptyFromSpec(spec) {
  if (typeof spec === "string") return "";
  if (spec._of !== undefined) return [];
  if (spec._cols) return [];
  if (spec._item) return [];
  const o = {};
  for (const k of Object.keys(spec)) { if (!k.startsWith("_")) o[k] = emptyFromSpec(spec[k]); }
  return o;
}

function buildSpec(container, spec, value, rerenderParent) {
  if (typeof spec === "string") return; /* 최상위 문자열은 buildSection에서 처리 */

  if (spec._cols) { /* 표: 문자열 배열의 배열 */
    const box = el("div", "grp");
    box.appendChild(el("div", "grp-t", spec._label));
    const render = () => {
      box.querySelectorAll(".tbl, .add-row").forEach((n) => n.remove());
      const tbl = el("div", "tbl");
      value.forEach((row, i) => {
        const tr = el("div", "trow");
        spec._cols.forEach((col, j) => {
          const f = el("div", "fld");
          f.appendChild(el("label", null, col));
          const inp = el("input");
          inp.value = row[j] ?? "";
          inp.addEventListener("input", () => { row[j] = inp.value; markDirty(); });
          f.appendChild(inp);
          tr.appendChild(f);
        });
        tr.appendChild(listControls(value, i, render));
        tbl.appendChild(tr);
      });
      box.appendChild(tbl);
      const add = el("button", "btn-sm add-row", "+ 행 추가");
      add.type = "button";
      add.addEventListener("click", () => { value.push(spec._cols.map(() => "")); markDirty(); render(); });
      box.appendChild(add);
    };
    render();
    container.appendChild(box);
    return;
  }

  if (spec._of !== undefined) { /* 문자열 배열 */
    const box = el("div", "grp");
    box.appendChild(el("div", "grp-t", spec._label));
    const render = () => {
      box.querySelectorAll(".trow, .add-row").forEach((n) => n.remove());
      value.forEach((v, i) => {
        const tr = el("div", "trow");
        buildField(tr, spec._of, v, (nv) => { value[i] = nv; });
        tr.appendChild(listControls(value, i, render));
        box.appendChild(tr);
      });
      const add = el("button", "btn-sm add-row", "+ 항목 추가");
      add.type = "button";
      add.addEventListener("click", () => { value.push(""); markDirty(); render(); });
      box.appendChild(add);
    };
    render();
    container.appendChild(box);
    return;
  }

  if (spec._item) { /* 객체 배열 */
    const box = el("div", "grp");
    box.appendChild(el("div", "grp-t", spec._label));
    const render = () => {
      box.querySelectorAll(".card-item, .add-row").forEach((n) => n.remove());
      value.forEach((item, i) => {
        const card = el("div", "card-item");
        const head = el("div", "card-head");
        head.appendChild(el("b", null, "#" + (i + 1)));
        head.appendChild(listControls(value, i, render));
        card.appendChild(head);
        for (const k of Object.keys(spec._item)) {
          const sub = spec._item[k];
          if (typeof sub === "string") buildField(card, sub, item[k], (nv) => { item[k] = nv; });
          else buildSpec(card, sub, item[k] ?? (item[k] = emptyFromSpec(sub)), render);
        }
        box.appendChild(card);
      });
      const add = el("button", "btn-sm add-row", "+ 항목 추가");
      add.type = "button";
      add.addEventListener("click", () => { value.push(emptyFromSpec(spec._item)); markDirty(); render(); });
      box.appendChild(add);
    };
    render();
    container.appendChild(box);
    return;
  }

  /* 일반 객체 그룹 */
  for (const k of Object.keys(spec)) {
    if (k.startsWith("_")) continue;
    const sub = spec[k];
    if (typeof sub === "string") buildField(container, sub, value[k], (nv) => { value[k] = nv; });
    else buildSpec(container, sub, value[k] ?? (value[k] = emptyFromSpec(sub)), rerenderParent);
  }
}

/* ---------- 섹션 화면 ---------- */
function showSection(sec) {
  const main = $("#panel");
  main.innerHTML = "";
  main.appendChild(el("h2", null, sec.title));
  const form = el("div", "form");
  const value = getPath(CONTENT, sec.id);
  buildSpec(form, sec.spec, value, () => showSection(sec));
  /* 최상위 문자열 필드 */
  for (const k of Object.keys(sec.spec)) {
    if (typeof sec.spec[k] === "string") {
      /* 이미 buildSpec의 객체 그룹 분기에서 처리됨 */
    }
  }
  main.appendChild(form);
  document.querySelectorAll(".nav-sec").forEach((n) => n.classList.toggle("on", n.dataset.id === sec.id));
}

function buildSidebar() {
  const nav = $("#nav");
  nav.innerHTML = "";
  SECTIONS.forEach((pg) => {
    nav.appendChild(el("div", "nav-page", pg.page));
    pg.items.forEach((sec) => {
      const a = el("div", "nav-sec", sec.title);
      a.dataset.id = sec.id;
      a.addEventListener("click", () => showSection(sec));
      nav.appendChild(a);
    });
  });
}

/* ---------- 저장 · 미리보기 ---------- */
function markDirty() {
  DIRTY = true;
  $("#saveBtn").classList.add("need");
}

async function doSave() {
  const btn = $("#saveBtn");
  btn.disabled = true;
  btn.textContent = "저장 중…";
  try {
    const pages = renderAll(CONTENT);
    const r = await api("save", { method: "POST", body: { content: CONTENT, pages } });
    if (!r.ok) throw new Error(r.error || "저장 실패");
    DIRTY = false;
    btn.classList.remove("need");
    btn.textContent = "저장 완료 ✓";
    setTimeout(() => { btn.textContent = "저장 (사이트 반영)"; btn.disabled = false; }, 1500);
  } catch (e) {
    alert(e.message);
    btn.textContent = "저장 (사이트 반영)";
    btn.disabled = false;
  }
}

function doPreview() {
  const pages = renderAll(CONTENT);
  const modal = $("#previewModal");
  const sel = $("#previewSel");
  const frame = $("#previewFrame");
  const show = (file) => {
    const base = new URL(".", location.href.replace(/admin\/?[^/]*$/, "")).href;
    frame.srcdoc = pages[file].replace("<head>", '<head><base href="' + base + '">');
  };
  sel.onchange = () => show(sel.value);
  show(sel.value);
  modal.style.display = "flex";
}

/* ---------- 비밀번호 변경 ---------- */
async function doChpass() {
  const old = prompt("현재 비밀번호를 입력하세요.");
  if (old == null) return;
  const nw = prompt("새 비밀번호를 입력하세요. (8자 이상)");
  if (nw == null) return;
  const r = await api("chpass", { method: "POST", body: { old, new: nw } });
  alert(r.ok ? "비밀번호가 변경되었습니다." : r.error || "변경 실패");
}

/* ---------- 초기화 ---------- */
async function boot() {
  const state = await api("state");
  if (!state.authed) {
    $("#login").style.display = "flex";
    $("#app").style.display = "none";
    $("#loginForm").addEventListener("submit", async (e) => {
      e.preventDefault();
      const r = await api("login", { method: "POST", body: { user: $("#loginUser").value, pass: $("#loginPass").value } });
      if (!r.ok) return ($("#loginErr").textContent = r.error || "로그인 실패");
      location.reload();
    });
    return;
  }
  CSRF = state.csrf;
  if (state.defaultPw) {
    alert("초기 비밀번호를 사용 중입니다. 보안을 위해 [비밀번호 변경]에서 반드시 변경해 주세요.");
  }
  CONTENT = await api("content");
  $("#login").style.display = "none";
  $("#app").style.display = "flex";
  buildSidebar();
  showSection(SECTIONS[0].items[1] || SECTIONS[0].items[0]);

  $("#saveBtn").addEventListener("click", doSave);
  $("#previewBtn").addEventListener("click", doPreview);
  $("#chpassBtn").addEventListener("click", doChpass);
  $("#logoutBtn").addEventListener("click", async () => { await api("logout", { method: "POST" }); location.reload(); });
  $("#previewClose").addEventListener("click", () => ($("#previewModal").style.display = "none"));
  window.addEventListener("beforeunload", (e) => { if (DIRTY) { e.preventDefault(); e.returnValue = ""; } });
}
boot();
