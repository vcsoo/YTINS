/* YTINS 비주얼 빌더 — 실제 페이지를 보면서 클릭·드래그로 편집 (아임웹 스타일)
   캔버스(iframe) = renderAll(edit모드) 결과. 요소 클릭 → 우측 패널 편집 → 즉시 반영. */
import { SECTIONS, BLOCKS } from "./schema.mjs";
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

/* ---------- API (실서버 PHP / 테스트 데모 겸용) ---------- */
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
    const fresh = await (await fetch("content.json")).json();
    const saved = localStorage.getItem(LS + "-content");
    if (saved) {
      try { const j = JSON.parse(saved); if (j.version === fresh.version) return j; } catch (e) {}
      localStorage.removeItem(LS + "-content"); // 구조가 바뀐 옛 편집본은 폐기
    }
    return fresh;
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

/* ---------- 유틸 ---------- */
const getPath = (obj, path) => path.split(".").reduce((o, k) => (o ? o[k] : undefined), obj);
const setPath = (obj, path, val) => {
  const parts = path.split(".");
  let o = obj;
  for (let i = 0; i < parts.length - 1; i++) o = o[parts[i]];
  o[parts[parts.length - 1]] = val;
};
const clone = (o) => JSON.parse(JSON.stringify(o));
const stripTags = (t) => String(t || "").replace(/&amp;/g, "&").replace(/<[^>]*>/g, "");

/* 스키마 평탄화: id → {title, spec} */
const SPEC_BY_ID = {};
SECTIONS.forEach((pg) => pg.items.forEach((it) => { SPEC_BY_ID[it.id] = it; }));

/* ---------- 폼 빌더 (우측 패널) ---------- */
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
  } else if (type === "check") {
    const cb = el("input");
    cb.type = "checkbox";
    cb.checked = !!value;
    cb.style.width = "auto";
    cb.addEventListener("change", () => { setter(cb.checked); markDirty(); });
    wrap.appendChild(cb);
  } else if (type === "icon") {
    const sel = el("select");
    const none = el("option", null, "(없음)");
    none.value = "";
    if (!value) none.selected = true;
    sel.appendChild(none);
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
      const isBare = !(inp.value || "").includes("/");
      inp.value = isBare && dir !== "assets" ? r.name : r.path;
      setter(inp.value);
      markDirty();
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
  if (typeof spec === "string") return;

  if (spec._cols) {
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

  if (spec._of !== undefined) {
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

  if (spec._item) {
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

  for (const k of Object.keys(spec)) {
    if (k.startsWith("_")) continue;
    const sub = spec[k];
    if (typeof sub === "string") buildField(container, sub, value[k], (nv) => { value[k] = nv; });
    else buildSpec(container, sub, value[k] ?? (value[k] = emptyFromSpec(sub)), rerenderParent);
  }
}

/* ---------- 빌더 상태 ---------- */
const PAGES = [
  ["index.html", "홈"], ["company.html", "회사소개"], ["business.html", "사업분야"],
  ["solution.html", "Solution"], ["reference.html", "레퍼런스"],
];
const META_PREFIX = { "index.html": "home", "company.html": "company", "business.html": "business", "solution.html": "solution", "reference.html": "reference" };
const BLOCKPAGE = { "business.html": "business", "solution.html": "solution" };
let PAGE = "index.html";
let SEL = null; /* {kind:"blk",si,bi} | {kind:"sec",si} | {kind:"edit",key} */
let renderT = null;

/* 실행취소/다시실행: 0.8초 이상 간격의 변경을 한 단계로 묶음 */
let UNDO = [], REDO = [], prevState = null, lastEditT = 0;
function snapshotCheck() {
  const cur = JSON.stringify(CONTENT);
  if (prevState !== null && cur !== prevState) {
    const now = Date.now();
    if (now - lastEditT > 800) { UNDO.push(prevState); if (UNDO.length > 60) UNDO.shift(); REDO = []; }
    lastEditT = now;
    prevState = cur;
    updateHistoryBtns();
  } else if (prevState === null) { prevState = cur; }
}
function updateHistoryBtns() {
  $("#undoBtn").disabled = !UNDO.length;
  $("#redoBtn").disabled = !REDO.length;
}
function doUndo() {
  if (!UNDO.length) return;
  REDO.push(JSON.stringify(CONTENT));
  CONTENT = JSON.parse(UNDO.pop());
  prevState = JSON.stringify(CONTENT);
  lastEditT = 0;
  DIRTY = true;
  $("#saveBtn").classList.add("need");
  clearSelection();
  renderCanvas(true);
  updateHistoryBtns();
}
function doRedo() {
  if (!REDO.length) return;
  UNDO.push(JSON.stringify(CONTENT));
  CONTENT = JSON.parse(REDO.pop());
  prevState = JSON.stringify(CONTENT);
  lastEditT = 0;
  DIRTY = true;
  $("#saveBtn").classList.add("need");
  clearSelection();
  renderCanvas(true);
  updateHistoryBtns();
}
function historyKeys(e, doc) {
  if (!(e.ctrlKey || e.metaKey)) return;
  const ae = (doc || document).activeElement;
  if (ae && (ae.isContentEditable || ae.tagName === "INPUT" || ae.tagName === "TEXTAREA")) return; /* 입력 중엔 브라우저 기본 동작 */
  if (e.key === "z" || e.key === "Z") { e.preventDefault(); e.shiftKey ? doRedo() : doUndo(); }
  else if (e.key === "y" || e.key === "Y") { e.preventDefault(); doRedo(); }
}
function markDirty() {
  DIRTY = true;
  $("#saveBtn").classList.add("need");
  snapshotCheck();
  scheduleRender();
}
function scheduleRender() {
  clearTimeout(renderT);
  renderT = setTimeout(() => renderCanvas(true), 300);
}

/* ---------- 캔버스 ---------- */
function canvasDoc() { return $("#canvas").contentDocument; }

function renderCanvas(keepScroll) {
  const iframe = $("#canvas");
  const prev = keepScroll && iframe.contentWindow ? iframe.contentWindow.scrollY : 0;
  const html = renderAll(CONTENT, { edit: true })[PAGE];
  const base = new URL("..", location.href).href;
  iframe.onload = () => {
    bindCanvas();
    iframe.contentWindow.scrollTo(0, prev);
    reapplySelection(false);
  };
  iframe.srcdoc = html.replace("<head>", '<head><base href="' + base + '">');
}

const CANVAS_CSS = `
  [data-edit]:hover, .eb:hover, section[data-sec]:hover { outline: 2px dashed rgba(47,111,237,.5); outline-offset: -2px; cursor: pointer !important; }
  [data-t]:hover { outline: 1px dotted rgba(232,89,12,.8); cursor: text !important; }
  [data-t][contenteditable="true"] { outline: 2px solid #e8590c !important; outline-offset: 1px; background: rgba(232,89,12,.05); cursor: text; min-width: 8px; }
  .bld-sel { outline: 3px solid #2f6fed !important; outline-offset: -3px; position: relative; }
  .eb { position: relative; }
  .eb.dropbefore { box-shadow: 0 -3px 0 0 #e8590c; }
  .eb.dropafter { box-shadow: 0 3px 0 0 #e8590c; }
  .bld-tools { position: absolute; top: 4px; right: 4px; z-index: 999; display: flex; gap: 4px; pointer-events: auto; }
  .bld-tools button { pointer-events: auto; border: 0; background: #2f6fed; color: #fff; border-radius: 6px; font-size: 12px; padding: 5px 9px; cursor: pointer; font-family: inherit; box-shadow: 0 4px 10px rgba(12,14,19,.25); }
  .bld-tools button.warn { background: #d33; }
  .bld-tools button.drag { cursor: grab; background: #101828; }
  .bld-badge { position: absolute; top: 4px; left: 4px; z-index: 999; background: rgba(16,24,40,.85); color: #fff; font-size: 11px; padding: 3px 8px; border-radius: 5px; pointer-events: none; }
`;

function bindCanvas() {
  const doc = canvasDoc();
  if (!doc) return;
  const st = doc.createElement("style");
  st.textContent = CANVAS_CSS;
  doc.head.appendChild(st);
  doc.addEventListener("click", (e) => {
    const t = e.target;
    if (t.closest(".bld-tools")) return; /* 툴바 버튼은 통과 */
    if (t.closest('[contenteditable="true"]')) return; /* 인라인 편집 중: 커서 이동 허용 */
    e.preventDefault();
    e.stopPropagation();
    const eb = t.closest(".eb");
    const sec = t.closest("section[data-sec]");
    const de = t.closest("[data-edit]");
    if (eb && sec) selectBlock(parseInt(sec.dataset.sec, 10), Array.prototype.indexOf.call(sec.querySelectorAll(".eb"), eb));
    else if (sec) selectSection(parseInt(sec.dataset.sec, 10));
    else if (de) selectEditKey(de.dataset.edit);
    else clearSelection();
  }, true);
  /* 더블클릭 → 그 자리에서 바로 타이핑 (아임웹식 인라인 편집) */
  doc.addEventListener("dblclick", (e) => {
    const t = e.target.closest("[data-t]");
    if (!t || t.isContentEditable) return;
    e.preventDefault();
    e.stopPropagation();
    startInline(t);
  }, true);
  doc.addEventListener("keydown", (e) => historyKeys(e, doc));
}

function startInline(elm) {
  const path = elm.dataset.t;
  const orig = elm.innerHTML;
  elm.setAttribute("contenteditable", "true");
  elm.focus();
  try { const sel = elm.ownerDocument.getSelection(); sel.selectAllChildren(elm); sel.collapseToEnd(); } catch (e) {}
  const finish = (commit) => {
    elm.removeAttribute("contenteditable");
    if (commit && elm.innerHTML !== orig) {
      setPath(CONTENT, path, elm.innerHTML);
      markDirty();
    } else if (!commit) { elm.innerHTML = orig; }
  };
  elm.addEventListener("blur", () => finish(true), { once: true });
  elm.addEventListener("keydown", function onKey(e) {
    e.stopPropagation(); /* 캔버스 단축키와 충돌 방지 */
    if (e.key === "Escape") { elm.removeEventListener("keydown", onKey); finish(false); elm.blur(); }
    if (e.key === "Enter" && !e.shiftKey && elm.tagName !== "P" && elm.tagName !== "TD" && elm.tagName !== "LI") { e.preventDefault(); elm.blur(); }
  });
}

function clearSelection() {
  SEL = null;
  const doc = canvasDoc();
  if (doc) {
    doc.querySelectorAll(".bld-sel").forEach((n) => n.classList.remove("bld-sel"));
    doc.querySelectorAll(".bld-tools, .bld-badge").forEach((n) => n.remove());
  }
  $("#inspector").classList.add("closed");
}

function selEl() {
  const doc = canvasDoc();
  if (!doc || !SEL) return null;
  if (SEL.kind === "blk") {
    const sec = doc.querySelector(`section[data-sec="${SEL.si}"]`);
    return sec ? sec.querySelectorAll(".eb")[SEL.bi] : null;
  }
  if (SEL.kind === "sec") return doc.querySelector(`section[data-sec="${SEL.si}"]`);
  return doc.querySelector(`[data-edit="${SEL.key}"]`);
}

function decorate(target) {
  const doc = canvasDoc();
  doc.querySelectorAll(".bld-sel").forEach((n) => n.classList.remove("bld-sel"));
  doc.querySelectorAll(".bld-tools, .bld-badge").forEach((n) => n.remove());
  if (!target) return;
  target.classList.add("bld-sel");
  const pageKey = BLOCKPAGE[PAGE];

  if (SEL.kind === "blk") {
    const secs = CONTENT[pageKey].sections;
    const blocks = secs[SEL.si].blocks;
    const b = blocks[SEL.bi];
    const badge = doc.createElement("div");
    badge.className = "bld-badge";
    badge.textContent = BLOCKS[b.type] ? BLOCKS[b.type].name : b.type;
    target.appendChild(badge);
    const bar = doc.createElement("div");
    bar.className = "bld-tools";
    const mk = (label, title, fn, cls) => {
      const btn = doc.createElement("button");
      btn.textContent = label;
      btn.title = title;
      if (cls) btn.className = cls;
      btn.addEventListener("click", (e) => { e.preventDefault(); e.stopPropagation(); fn(); });
      bar.appendChild(btn);
    };
    mk("≡", "드래그해서 위치 이동", () => {}, "drag");
    mk("▲", "위로", () => { if (SEL.bi > 0) { [blocks[SEL.bi - 1], blocks[SEL.bi]] = [blocks[SEL.bi], blocks[SEL.bi - 1]]; SEL.bi--; markDirty(); } });
    mk("▼", "아래로", () => { if (SEL.bi < blocks.length - 1) { [blocks[SEL.bi + 1], blocks[SEL.bi]] = [blocks[SEL.bi], blocks[SEL.bi + 1]]; SEL.bi++; markDirty(); } });
    mk("＋", "이 아래에 블록 추가", () => openPalette(SEL.si, SEL.bi + 1));
    mk("✕", "블록 삭제", () => {
      if (confirm("이 블록을 삭제할까요?")) { blocks.splice(SEL.bi, 1); clearSelection(); markDirty(); }
    }, "warn");
    target.appendChild(bar);
    enableDrag(target);
  }

  if (SEL.kind === "sec") {
    const secs = CONTENT[pageKey].sections;
    const bar = doc.createElement("div");
    bar.className = "bld-tools";
    const mk = (label, title, fn, cls) => {
      const btn = doc.createElement("button");
      btn.textContent = label;
      btn.title = title;
      if (cls) btn.className = cls;
      btn.addEventListener("click", (e) => { e.preventDefault(); e.stopPropagation(); fn(); });
      bar.appendChild(btn);
    };
    mk("▲", "섹션 위로", () => { if (SEL.si > 0) { [secs[SEL.si - 1], secs[SEL.si]] = [secs[SEL.si], secs[SEL.si - 1]]; SEL.si--; markDirty(); } });
    mk("▼", "섹션 아래로", () => { if (SEL.si < secs.length - 1) { [secs[SEL.si + 1], secs[SEL.si]] = [secs[SEL.si], secs[SEL.si + 1]]; SEL.si++; markDirty(); } });
    mk("＋블록", "이 섹션 끝에 블록 추가", () => openPalette(SEL.si, secs[SEL.si].blocks.length));
    mk("＋섹션", "아래에 새 섹션 추가", () => {
      secs.splice(SEL.si + 1, 0, { id: "new-section-" + Date.now() % 10000, title: "새 섹션", alt: !secs[SEL.si].alt, blocks: [clone(BLOCKS.desc.empty)] });
      markDirty();
    });
    mk("✕", "섹션 삭제", () => {
      if (confirm("섹션 전체를 삭제할까요? (안의 블록도 모두 삭제됩니다)")) { secs.splice(SEL.si, 1); clearSelection(); markDirty(); }
    }, "warn");
    target.appendChild(bar);
  }
}

/* 블록 드래그 앤 드롭 (같은 페이지 내 자유 이동) */
function enableDrag(wrapper) {
  const doc = canvasDoc();
  const handle = wrapper.querySelector(".bld-tools .drag");
  if (!handle) return;
  handle.addEventListener("mousedown", () => { wrapper.draggable = true; });
  wrapper.addEventListener("dragend", () => {
    wrapper.draggable = false;
    doc.querySelectorAll(".dropbefore, .dropafter").forEach((n) => n.classList.remove("dropbefore", "dropafter"));
  });
  wrapper.addEventListener("dragstart", (e) => {
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", SEL.si + ":" + SEL.bi);
    doc.querySelectorAll("section[data-sec] .eb").forEach((other) => {
      if (other === wrapper) return;
      other.addEventListener("dragover", dragOver);
      other.addEventListener("dragleave", dragLeave);
      other.addEventListener("drop", dragDrop);
    });
  });
  function dragOver(e) {
    e.preventDefault();
    const r = this.getBoundingClientRect();
    const before = e.clientY < r.top + r.height / 2;
    this.classList.toggle("dropbefore", before);
    this.classList.toggle("dropafter", !before);
  }
  function dragLeave() { this.classList.remove("dropbefore", "dropafter"); }
  function dragDrop(e) {
    e.preventDefault();
    const [fromSi, fromBi] = e.dataTransfer.getData("text/plain").split(":").map(Number);
    const toSec = this.closest("section[data-sec]");
    const toSi = parseInt(toSec.dataset.sec, 10);
    let toBi = Array.prototype.indexOf.call(toSec.querySelectorAll(".eb"), this);
    const before = this.classList.contains("dropbefore");
    if (!before) toBi++;
    const secs = CONTENT[BLOCKPAGE[PAGE]].sections;
    const [moved] = secs[fromSi].blocks.splice(fromBi, 1);
    if (fromSi === toSi && fromBi < toBi) toBi--;
    secs[toSi].blocks.splice(toBi, 0, moved);
    SEL = { kind: "blk", si: toSi, bi: toBi };
    markDirty();
  }
}

/* ---------- 선택 → 우측 패널 ---------- */
function openInspector(title, build) {
  const ins = $("#inspector");
  $("#insTitle").textContent = title;
  const body = $("#insBody");
  body.innerHTML = "";
  build(body);
  ins.classList.remove("closed");
}

function selectBlock(si, bi) {
  SEL = { kind: "blk", si, bi };
  const b = CONTENT[BLOCKPAGE[PAGE]].sections[si].blocks[bi];
  const def = BLOCKS[b.type];
  decorate(selEl());
  openInspector(def ? def.name : b.type, (body) => {
    if (def) buildSpec(body, def.spec, b);
    else buildField(body, "area: 데이터(JSON)", JSON.stringify(b), (v) => { try { Object.assign(b, JSON.parse(v)); } catch (e) {} });
  });
}

function selectSection(si) {
  SEL = { kind: "sec", si };
  const sec = CONTENT[BLOCKPAGE[PAGE]].sections[si];
  decorate(selEl());
  openInspector("섹션 · " + stripTags(sec.title), (body) => {
    buildField(body, "text: 섹션 제목", sec.title, (v) => { sec.title = v; });
    buildField(body, "text: 섹션 ID (메뉴 링크용 · 영문)", sec.id, (v) => { sec.id = v; });
    buildField(body, "check: 남색 배경(교차 배경)", sec.alt, (v) => { sec.alt = v; });
    const hint = el("p", "hint2", "섹션 순서 이동·삭제·블록 추가는 캔버스의 파란 버튼으로 할 수 있습니다.");
    body.appendChild(hint);
  });
}

function selectEditKey(key) {
  SEL = { kind: "edit", key };
  const def = SPEC_BY_ID[key];
  decorate(selEl());
  if (!def) return;
  openInspector(def.title, (body) => {
    const value = getPath(CONTENT, key);
    buildSpec(body, def.spec, value);
  });
}

function reapplySelection(reopenPanel) {
  if (!SEL) return;
  const t = selEl();
  if (!t) { clearSelection(); return; }
  decorate(t);
  if (reopenPanel) {
    if (SEL.kind === "blk") selectBlock(SEL.si, SEL.bi);
    else if (SEL.kind === "sec") selectSection(SEL.si);
    else selectEditKey(SEL.key);
  }
}

/* ---------- 블록 팔레트 ---------- */
function openPalette(si, insertAt) {
  const modal = $("#paletteModal");
  const list = $("#paletteList");
  list.innerHTML = "";
  Object.keys(BLOCKS).forEach((k) => {
    const item = el("button", "pal-item");
    item.type = "button";
    item.appendChild(el("b", null, BLOCKS[k].name));
    item.addEventListener("click", () => {
      CONTENT[BLOCKPAGE[PAGE]].sections[si].blocks.splice(insertAt, 0, clone(BLOCKS[k].empty));
      modal.style.display = "none";
      SEL = { kind: "blk", si, bi: insertAt };
      markDirty();
      setTimeout(() => reapplySelection(true), 400);
    });
    list.appendChild(item);
  });
  modal.style.display = "flex";
}

/* ---------- 저장 · 미리보기 ---------- */
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
  const base = new URL("..", location.href).href;
  const show = (file) => { frame.srcdoc = pages[file].replace("<head>", '<head><base href="' + base + '">'); };
  sel.value = PAGE;
  sel.onchange = () => show(sel.value);
  show(sel.value);
  modal.style.display = "flex";
}

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
  if (state.defaultPw) alert("초기 비밀번호를 사용 중입니다. 보안을 위해 [비밀번호 변경]에서 반드시 변경해 주세요.");
  CONTENT = await api("content");
  prevState = JSON.stringify(CONTENT);
  $("#login").style.display = "none";
  $("#app").style.display = "flex";

  /* 페이지 탭 */
  const tabs = $("#pageTabs");
  PAGES.forEach(([file, label]) => {
    const t = el("button", "tab", label);
    t.type = "button";
    t.dataset.file = file;
    t.addEventListener("click", () => {
      PAGE = file;
      clearSelection();
      document.querySelectorAll("#pageTabs .tab").forEach((n) => n.classList.toggle("on", n.dataset.file === PAGE));
      renderCanvas(false);
    });
    tabs.appendChild(t);
  });
  tabs.firstChild.classList.add("on");

  $("#saveBtn").addEventListener("click", doSave);
  $("#previewBtn").addEventListener("click", doPreview);
  $("#undoBtn").addEventListener("click", doUndo);
  $("#redoBtn").addEventListener("click", doRedo);
  updateHistoryBtns();
  document.addEventListener("keydown", (e) => historyKeys(e));
  const setDevice = (w, btn) => {
    const c = $("#canvas");
    if (w) { c.style.width = w + "px"; c.style.flex = "none"; }
    else { c.style.width = "100%"; c.style.flex = "1"; }
    document.querySelectorAll(".dev-btn").forEach((n) => n.classList.toggle("on", n === btn));
  };
  $("#devPc").addEventListener("click", (e) => setDevice(null, e.currentTarget));
  $("#devTab").addEventListener("click", (e) => setDevice(768, e.currentTarget));
  $("#devMo").addEventListener("click", (e) => setDevice(390, e.currentTarget));
  $("#metaBtn").addEventListener("click", () => {
    const id = META_PREFIX[PAGE] + ".meta";
    SEL = null;
    const def = SPEC_BY_ID[id];
    openInspector(def.title + " — " + PAGES.find((p) => p[0] === PAGE)[1], (body) => {
      buildSpec(body, def.spec, getPath(CONTENT, id));
    });
  });
  $("#chpassBtn").addEventListener("click", doChpass);
  $("#logoutBtn").addEventListener("click", async () => { await api("logout", { method: "POST" }); location.reload(); });
  $("#insClose").addEventListener("click", clearSelection);
  $("#previewClose").addEventListener("click", () => ($("#previewModal").style.display = "none"));
  $("#paletteClose").addEventListener("click", () => ($("#paletteModal").style.display = "none"));
  window.addEventListener("beforeunload", (e) => { if (DIRTY) { e.preventDefault(); e.returnValue = ""; } });

  renderCanvas(false);
}
boot();
