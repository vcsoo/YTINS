/* YTINS 사이트 렌더러 — content.json → 정적 HTML 5페이지
   브라우저(어드민)와 Node(빌드 스크립트) 양쪽에서 동일하게 동작하는 순수 모듈.
   renderAll(content) → { "index.html": html, ... } */

const ICONS = {
  layers: '<path d="M12 3 3 7.5 12 12l9-4.5L12 3Z"/><path d="M3 12l9 4.5 9-4.5"/><path d="M3 16.5 12 21l9-4.5"/>',
  shieldcheck: '<path d="M12 3 5 6v5c0 4.3 3 7.4 7 9 4-1.6 7-4.7 7-9V6l-7-3Z"/><path d="M9.2 12.2 11 14l3.9-3.9"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M12 2.6v2.6M12 18.8v2.6M21.4 12h-2.6M5.2 12H2.6M18.6 5.4l-1.8 1.8M7.2 16.8l-1.8 1.8M18.6 18.6l-1.8-1.8M7.2 7.2 5.4 5.4"/>',
  target: '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.4"/><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none"/>',
  grid: '<rect x="3.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.5"/>',
  link: '<path d="M9.5 13.6a3.6 3.6 0 0 0 5.1 0l3-3a3.6 3.6 0 0 0-5.1-5.1l-1.2 1.2"/><path d="M14.5 10.4a3.6 3.6 0 0 0-5.1 0l-3 3a3.6 3.6 0 0 0 5.1 5.1l1.2-1.2"/>',
  coin: '<ellipse cx="12" cy="6.5" rx="6.5" ry="3"/><path d="M5.5 6.5v11c0 1.7 2.9 3 6.5 3s6.5-1.3 6.5-3v-11"/><path d="M5.5 12c0 1.7 2.9 3 6.5 3s6.5-1.3 6.5-3"/>',
  wrench: '<path d="M15 7a3.6 3.6 0 0 0 4.5 4.5l-8.8 8.8a2 2 0 0 1-2.8-2.8l8.8-8.8A3.6 3.6 0 0 1 15 7Z"/>',
  clipboard: '<rect x="5.5" y="4.5" width="13" height="16" rx="2"/><rect x="9" y="3" width="6" height="3.2" rx="1"/><path d="M9 11h6M9 14.5h4.5"/>',
  stack: '<path d="M4 8.5 12 4l8 4.5-8 4.5-8-4.5Z"/><path d="M4 12.5 12 17l8-4.5M4 16 12 20.5 20 16"/>',
  monitor: '<rect x="3.5" y="4.5" width="17" height="11" rx="2"/><path d="M9 19.5h6M12 15.5v4"/>',
  shield: '<path d="M12 3 5 6v5c0 4.3 3 7.4 7 9 4-1.6 7-4.7 7-9V6l-7-3Z"/>',
  code: '<path d="M9 8l-4 4 4 4M15 8l4 4-4 4"/>',
  building: '<rect x="5.5" y="3" width="13" height="18" rx="1.5"/><path d="M9.2 7.5h.01M14.6 7.5h.01M9.2 11.5h.01M14.6 11.5h.01"/><path d="M10 21v-3.5h4V21"/>',
  gauge: '<path d="M4.5 15.5a7.5 7.5 0 0 1 15 0"/><path d="M12 15.5l3.6-3.6"/><circle cx="12" cy="15.5" r="1" fill="currentColor" stroke="none"/>',
  repeat: '<path d="m17 2.5 3.5 3.5L17 9.5"/><path d="M3.5 11.5V10a4 4 0 0 1 4-4h13"/><path d="m7 21.5-3.5-3.5L7 14.5"/><path d="M20.5 12.5V14a4 4 0 0 1-4 4h-13"/>',
  download: '<path d="M12 4v10M8 10.5l4 4 4-4"/><path d="M5 18.5h14"/>',
  chart: '<path d="M5 20v-6M10 20V8M15 20v-9M20 20V5"/><path d="M3.5 20h17"/>',
  database: '<ellipse cx="12" cy="6" rx="6.5" ry="2.8"/><path d="M5.5 6v12c0 1.5 2.9 2.8 6.5 2.8s6.5-1.3 6.5-2.8V6"/><path d="M5.5 12c0 1.5 2.9 2.8 6.5 2.8s6.5-1.3 6.5-2.8"/>',
  video: '<rect x="3" y="6" width="12" height="12" rx="2"/><path d="M15 10l6-3v10l-6-3"/>',
  users: '<circle cx="9" cy="8" r="3"/><path d="M3.5 19a5.5 5.5 0 0 1 11 0"/><path d="M16 6.3a3 3 0 0 1 0 5.4M20.5 19a5 5 0 0 0-4-4.9"/>',
  cloud: '<path d="M7 18h10a3.6 3.6 0 0 0 .4-7.2 5 5 0 0 0-9.7-1.3A3.9 3.9 0 0 0 7 18Z"/>',
  mail: '<rect x="3.5" y="5.5" width="17" height="13" rx="2"/><path d="m5 8 7 5.4L19 8"/>',
  phone: '<path d="M8.2 3.8 9.7 7l-1.9 1.7a13.5 13.5 0 0 0 5.5 5.5L15 12.3l3.2 1.5v3.2a1.9 1.9 0 0 1-2.1 1.9A16.4 16.4 0 0 1 3.1 5.9 1.9 1.9 0 0 1 5 3.8h3.2Z"/>',
  alert: '<path d="M12 4.5 20.5 19h-17L12 4.5Z"/><path d="M12 10.5v3.6M12 16.8h.01"/>',
};
export const ICON_NAMES = Object.keys(ICONS);
/* 편집 모드: 빌더 캔버스용 — 요소에 편집 경로 주석을 달고 사이트 JS를 뺀다 */
let EDIT = false;
const ea = (key) => (EDIT ? ` data-edit="${key}"` : "");
const et = (path) => (EDIT ? ` data-t="${path}"` : ""); // 더블클릭 인라인 편집 대상
const ew = (txt, path) => (EDIT ? `<span data-t="${path}">${txt}</span>` : txt); // 맨몸 텍스트 노드 래핑
function ic(name) { return `<svg class="ico-svg" viewBox="0 0 24 24" aria-hidden="true">${ICONS[name] || ""}</svg>`; }

function marquee(inner, gridCls) {
  return `<div class="marquee" data-marquee>
        <div class="marquee-track ${gridCls}">${inner}</div>
        ${EDIT ? "" : `<div class="marquee-track ${gridCls}" aria-hidden="true">${inner}</div>`}
      </div>`;
}
function lg(src, alt, fallback) {
  return fallback
    ? `<div class="lg"><img src="assets/partners/${src}" alt="${alt}" onerror="this.style.display='none';this.nextElementSibling.style.display='inline'"><span class="lg-text" style="display:none">${fallback}</span></div>`
    : `<div class="lg"><img src="assets/partners/${src}" alt="${alt}"></div>`;
}

function header(active, nav) {
  const cls = (k) => (k === active ? " active" : "");
  const grp = (g) => `<div class="has-sub grp-${g.key}">
        <a href="${g.href}" class="sub-toggle${cls(g.key)}">${g.label} <span class="caret">▾</span></a>
        <div class="sub">
          ${g.subs.map((s) => `<a href="${s.href}">${s.label}</a>`).join("\n          ")}
        </div>
      </div>`;
  return `<header class="site-header"${ea("nav")}>
  <div class="container">
    <a class="logo" href="index.html" aria-label="YTINS 홈">
      <img class="logo-img" src="assets/ytins-logo.png" alt="YTINS"><span class="kr">${nav.brand}</span>
    </a>
    <nav class="gnb" id="gnb">
      ${nav.groups.map(grp).join("\n      ")}
    </nav>
    <button class="burger" id="burger" aria-label="메뉴 열기" aria-expanded="false"><span></span><span></span><span></span></button>
  </div>
</header>`;
}

function footerHtml(f) {
  return `<footer class="site-footer"${ea("footer")}>
  <div class="container">
    <div class="footer-top">
      <div class="footer-brand">
        <span class="logo"><img class="logo-img footer-logo" src="assets/ytins-logo.png" alt="YTINS"></span>
        <div class="slogan">${f.slogan}</div>
      </div>
      <div class="footer-info">
        ${f.company}<span class="sep">|</span>대표자 : ${f.ceo}<br>
        ${f.address}<br>
        <span class="fi">Tel : ${f.tel}</span><span class="sep">|</span><span class="fi">Fax : ${f.fax}</span><span class="sep">|</span><span class="fi">E-Mail : ${f.email}</span><span class="sep">|</span><a class="fi" href="${f.url}" target="_blank" rel="noopener">${f.urlLabel}</a>
      </div>
    </div>
    <div class="footer-bottom">
      <span>${f.copyright}</span>
      <nav class="fnav">
        <a href="company.html">Company</a><a href="business.html">Business</a><a href="solution.html">Solution</a><a href="reference.html">Reference</a>
      </nav>
    </div>
  </div>
</footer>`;
}

function pageShell({ active, title, desc, main }, C) {
  return `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title}</title>
<meta name="description" content="${desc}">
<link rel="icon" type="image/png" href="assets/favicon.png">
<link rel="apple-touch-icon" href="assets/favicon.png">
<link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/[email protected]/dist/web/variable/pretendardvariable.min.css">
<link rel="stylesheet" href="assets/style.css">
</head>
<body>
${header(active, C.nav)}
<main>
${main}
</main>
${footerHtml(C.footer)}
<div class="fab" id="fab"${ea("contact")}>
  <div class="fab-unit" id="contactUnit">
    <div class="contact-pop" id="contactPop" role="dialog" aria-label="연락처">
      <div class="cp-title">문의 · 연락처</div>
      <a class="cp-row" href="mailto:${C.contact.email}"><span class="cp-ic">${ic('mail')}</span><span class="cp-txt"><b>이메일</b><em>${C.contact.email}</em></span></a>
      <a class="cp-row" href="tel:${C.contact.telLink}"><span class="cp-ic">${ic('phone')}</span><span class="cp-txt"><b>전화</b><em>${C.contact.tel}</em></span></a>
    </div>
    <button class="fab-btn contact-btn" id="contactBtn" aria-label="연락처 보기" aria-expanded="false">${ic('mail')}</button>
  </div>
  <button class="fab-btn totop-btn" id="toTop" aria-label="맨 위로">
    <svg class="ring" viewBox="0 0 48 48" aria-hidden="true"><circle class="ring-bg" cx="24" cy="24" r="21"/><circle class="ring-fg" cx="24" cy="24" r="21"/></svg>
    <span class="totop-pct" id="toTopPct">0%</span>
  </button>
</div>
${EDIT ? "" : '<script src="assets/site.js"><\/script>' }
</body>
</html>`;
}

/* 공용 partial */
const pageHero = (h, key) => `  <section class="page-hero"${ea(key)}>
    <div class="ph-bg" aria-hidden="true"><canvas class="pageNet"></canvas></div>
    <div class="container"><span class="eyebrow"${et(key + ".eyebrow")}>${h.eyebrow}</span><h1${et(key + ".title")}>${h.title}</h1>
      <p${et(key + ".desc")}>${h.desc}</p></div>
  </section>`;
const clientsBar = (b, P) => `<div class="clients-bar"><span class="t"${P ? et(P + ".t") : ""}>${b.t}</span><span class="list"${P ? et(P + ".list") : ""}>${b.list}</span></div>`;
const flowSteps = (steps, P) => steps.map((s, i) => `<div class="fstep">${P ? ew(s.t, `${P}.steps.${i}.t`) : s.t}${s.s ? `<small${P ? et(`${P}.steps.${i}.s`) : ""}>${s.s}</small>` : ""}</div>`).join("\n        ");
const numbered = (items, P) => items.map((n, i) => `<div class="num-item">${n.icon ? `<span class="ni">${ic(n.icon)}</span>` : ""}<div class="gh">0${i + 1}</div><h4>${P ? ew(n.title, `${P}.items.${i}.title`) : n.title}${n.badge ? `<span class="nbadge"${P ? et(`${P}.items.${i}.badge`) : ""}>${n.badge}</span>` : ""}</h4><p${P ? et(`${P}.items.${i}.desc`) : ""}>${n.desc}</p></div>`).join("\n        ");
const featgrid = (feats, sep = "\n        ", P) => feats.map((f, i) => `<div class="feat"><span class="fic">${ic(f.icon)}</span><div class="ftx"><b${P ? et(`${P}.feats.${i}.b`) : ""}>${f.b}</b><span${P ? et(`${P}.feats.${i}.s`) : ""}>${f.s}</span></div></div>`).join(sep);

/* ============================================================ HOME */
function renderHome(C) {
  const H = C.home;
  const main = `  <section class="hero"${ea("home.hero")}>
    <div class="hero-bg" aria-hidden="true"><canvas id="heroNet"></canvas></div>
    <div class="container">
      <span class="eyebrow"${et("home.hero.eyebrow")}>${H.hero.eyebrow}</span>
      <h1>${H.hero.line1Before}<span class="rot-wrap"><span class="rot"><span class="rot-word" id="rotWord">${H.hero.rotWords[0]}</span><span class="rot-sfx">${H.hero.line1After}</span></span></span><br>${H.hero.line2}<br><span class="en">${H.hero.line3}</span></h1>
      <p class="lead"${et("home.hero.lead")}>${H.hero.lead}</p>
      <div class="stats">
        ${H.hero.stats.map((s, i) => `<div class="stat"><div class="num">${ew(s.num, `home.hero.stats.${i}.num`)}${s.unit ? `<small${et(`home.hero.stats.${i}.unit`)}>${s.unit}</small>` : ""}</div><div class="label"${et(`home.hero.stats.${i}.label`)}>${s.label}</div></div>`).join("\n        ")}
      </div>
    </div>
    <a class="scroll-cue" href="#explore" aria-label="아래로 스크롤"><span>Scroll</span><svg class="ico-svg" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9.5l6 6 6-6"/></svg></a>
  </section>
  <section class="section" id="explore"${ea("home.explore")}>
    <div class="container">
      
      <h2${et("home.explore.title")}>${H.explore.title}</h2>
      <p class="sec-desc"${et("home.explore.desc")}>${H.explore.desc}</p>
      <div class="nav-cards">
        ${H.explore.cards.map((c, i) => `<a class="nav-card" href="${c.href}"><span class="nc-ic">${ic(c.icon)}</span><div class="no"${et(`home.explore.cards.${i}.no`)}>${c.no}</div><h3${et(`home.explore.cards.${i}.title`)}>${c.title}</h3><p${et(`home.explore.cards.${i}.desc`)}>${c.desc}</p><span class="go">자세히 보기 →</span></a>`).join("\n        ")}
      </div>
    </div>
  </section>`;
  return pageShell({ active: "", title: H.meta.title, desc: H.meta.desc, main }, C);
}

/* ============================================================ COMPANY */
function renderCompany(C) {
  const P = C.company;
  const main = `${pageHero(P.hero, "company.hero")}

  <section class="section" id="about"${ea("company.about")}>
    <div class="container">
      <h2${et("company.about.title")}>${P.about.title}</h2>
      <p class="sec-desc"${et("company.about.desc")}>${P.about.desc}</p>
      <div class="about-grid">
        <table class="info-table">
          ${P.about.rows.map((r, i) => `<tr><th${et(`company.about.rows.${i}.th`)}>${r.th}</th><td${et(`company.about.rows.${i}.td`)}>${r.td}</td></tr>`).join("\n          ")}
        </table>
        <div class="about-side">
          ${P.about.cards.map((c, i) => `<div class="about-card"><span class="ac-ic">${ic(c.icon)}</span><div class="num">${ew(c.num, `company.about.cards.${i}.num`)}${c.unit ? `<small${et(`company.about.cards.${i}.unit`)}>${c.unit}</small>` : ""}</div><div class="label"${et(`company.about.cards.${i}.label`)}>${c.label}</div></div>`).join("\n          ")}
        </div>
      </div>
    </div>
  </section>

  <section class="section alt" id="ceo"${ea("company.ceo")}>
    <div class="container">
      <h2${et("company.ceo.title")}>${P.ceo.title}</h2>
      <div class="ceo">
        <p class="ceo-lead"${et("company.ceo.lead")}>${P.ceo.lead}</p>
        ${P.ceo.paras.map((p, i) => `<p${et(`company.ceo.paras.${i}`)}>${p}</p>`).join("\n        ")}
        <div class="ceo-sign">
          <img class="ceo-signimg" src="assets/ceo-signature.png" alt="${P.ceo.name} 대표이사 서명" onerror="this.style.display='none'">
          <div class="ceo-name"><b${et("company.ceo.name")}>${P.ceo.name}</b><span${et("company.ceo.role")}>${P.ceo.role}</span></div>
        </div>
      </div>
    </div>
  </section>

  <section class="section" id="history"${ea("company.history")}>
    <div class="container">
      <h2${et("company.history.title")}>${P.history.title}</h2>
      <p class="sec-desc"${et("company.history.desc")}>${P.history.desc}</p>
      <div class="timeline">
        ${P.history.items.map((t, i) => `<div class="tl-item"><div class="year"${et(`company.history.items.${i}.year`)}>${t.year}</div><ul>
          ${t.rows.map((li, j) => `<li${et(`company.history.items.${i}.rows.${j}`)}>${li}</li>`).join("\n          ")}</ul></div>`).join("\n        ")}
      </div>
    </div>
  </section>

  <section class="section alt" id="organization"${ea("company.org")}>
    <div class="container">
      <h2${et("company.org.title")}>${P.org.title}</h2>
      <p class="sec-desc"${et("company.org.desc")}>${P.org.desc}</p>
      <div class="org">
        <div class="org-top"${et("company.org.top")}>${P.org.top}</div>
        <div class="org-line"></div>
        <div class="org-staff">${P.org.staff.map((s, i) => `<span${et(`company.org.staff.${i}`)}>${s}</span>`).join("")}</div>
        <div class="org-line"></div>
        <div class="org-divs">
          ${P.org.divs.map((d, i) => `<div class="org-div"><div class="head"${et(`company.org.divs.${i}.head`)}>${d.head}</div><div class="team"${et(`company.org.divs.${i}.team`)}>${d.team}</div></div>`).join("\n          ")}
        </div>
        <div class="org-stat">
          <div class="t"${et("company.org.statLabel")}>${P.org.statLabel}</div>
          <div class="nums"><div class="n"><b class="hi">${P.org.statNum}</b><span>${P.org.statUnit}</span></div></div>
        </div>
      </div>
    </div>
  </section>

  <section class="section" id="certifications"${ea("company.certs")}>
    <div class="container">
      <h2${et("company.certs.title")}>${P.certs.title}</h2>
      <p class="sec-desc"${et("company.certs.desc")}>${P.certs.desc}</p>
      <div class="cert-docs">
        ${P.certs.items.map((c, i) => `<div class="cert-doc"><div class="thumb"><img src="${c.img}" alt="${c.alt}"></div><div class="cap"><div class="name"${et(`company.certs.items.${i}.name`)}>${c.name}</div><div class="meta"${et(`company.certs.items.${i}.meta`)}>${c.meta}</div></div></div>`).join("\n        ")}
      </div>
    </div>
  </section>

  <section class="section alt" id="location"${ea("company.location")}>
    <div class="container">
      <h2${et("company.location.title")}>${P.location.title}</h2>
      <p class="sec-desc"${et("company.location.desc")}>${P.location.desc}</p>
      <div class="map-grid">
        <div class="map-wrap">
          <iframe title="YTINS 본사 위치 지도" src="${P.location.mapSrc}" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe>
        </div>
        <div class="map-info">
          <table class="info-table">
            ${P.location.rows.map((r, i) => `<tr><th${et(`company.location.rows.${i}.th`)}>${r.th}</th><td${et(`company.location.rows.${i}.td`)}>${r.td}</td></tr>`).join("\n            ")}
          </table>
          <a class="btn" href="${P.location.naverUrl}" target="_blank" rel="noopener"><span class="ico">📍</span> ${P.location.naverLabel}</a>
        </div>
      </div>
    </div>
  </section>

  <section class="section" id="brochure"${ea("company.brochure")}>
    <div class="container">
      <h2${et("company.brochure.title")}>${P.brochure.title}</h2>
      <p class="sec-desc"${et("company.brochure.desc")}>${P.brochure.desc}</p>
      <div class="btn-row">
        <a class="btn" href="${P.brochure.file}" download><span class="ico">⬇</span> ${P.brochure.btnLabel}</a>
      </div>
    </div>
  </section>`;
  return pageShell({ active: "company", title: P.meta.title, desc: P.meta.desc, main }, C);
}

/* ============================================================ 블록 렌더러 (사업분야·Solution — 어드민 블록 에디터 대응) */
const BLOCK_RENDERERS = {
  desc: (b, P) => `<p class="sec-desc"${et(P + ".text")}>${b.text}</p>`,
  subhead: (b, P) => `<h3 class="sub-h${b.tight ? " tight" : ""}"${et(P + ".title")}>${b.title}</h3>${b.desc ? `\n      <p class="block-desc"${et(P + ".desc")}>${b.desc}</p>` : ""}`,
  flow: (b, P) => `<div class="flow grad"${b.style ? ` style="${b.style}"` : ""}>
        ${flowSteps(b.steps, P)}
      </div>`,
  numbered: (b, P) => `<div class="numbered">
        ${numbered(b.items, P)}
      </div>`,
  featgrid: (b, P) => `<div class="featgrid">
        ${featgrid(b.feats, "\n        ", P)}
      </div>`,
  duo: (b, P) => `<div class="duo">
        ${b.panels.map((p, i) => `<div class="duo-panel ${i === 0 ? "ink" : "blue"}">
          <div class="dhead">${p.sub ? `<div class="kick-row"><span class="step-chip"${et(`${P}.panels.${i}.kicker`)}>${p.kicker}</span><span class="kick-sub"${et(`${P}.panels.${i}.sub`)}>${p.sub}</span></div>` : `<div class="kicker"${et(`${P}.panels.${i}.kicker`)}>${p.kicker}</div>`}<h3${et(`${P}.panels.${i}.title`)}>${p.title}</h3></div>
          <div class="dbody">
            ${p.items.map((s, j) => `<div class="srv"><b${et(`${P}.panels.${i}.items.${j}.b`)}>${s.b}</b><span${et(`${P}.panels.${i}.items.${j}.s`)}>${s.s}</span></div>`).join("\n            ")}
          </div>
        </div>`).join("\n        ")}
      </div>`,
  duospec: (b, P) => `<div class="duo duospec">
        <div class="duo-panel ink">
          <div class="dhead"><div class="kicker"${et(P + ".before.kicker")}>${b.before.kicker}</div><h3${et(P + ".before.title")}>${b.before.title}</h3></div>
          <div class="dbody">
            ${b.before.items.map((s, i) => `<div class="srv iconed"><i class="s-ic">${ic('alert')}</i><span${et(`${P}.before.items.${i}`)}>${s}</span></div>`).join("\n            ")}
          </div>
        </div>
        <div class="duo-panel blue">
          <div class="dhead"><div class="kicker"${et(P + ".after.kicker")}>${b.after.kicker}</div><h3${et(P + ".after.title")}>${b.after.title}</h3></div>
          <div class="dbody">
            <table class="spec" style="margin:6px 0">
              ${b.after.spec.map((r, i) => `<tr><th${et(`${P}.after.spec.${i}.th`)}>${r.th}</th><td${et(`${P}.after.spec.${i}.td`)}>${r.td}</td></tr>`).join("\n              ")}
            </table>
          </div>
        </div>
      </div>`,
  phases: (b, P) => `<div class="phases">
        ${b.items.map((p, i) => `<div class="phase"><div class="ph"><i>0${i + 1}</i><span${et(`${P}.items.${i}.ph`)}>${p.ph}</span></div><ul>${p.items.map((li, j) => `<li${et(`${P}.items.${i}.items.${j}`)}>${li}</li>`).join("")}</ul></div>`).join("\n        ")}
      </div>`,
  checks: (b, P) => `<ul class="checks">
        ${b.items.map((c, i) => `<li><b${et(`${P}.items.${i}.b`)}>${c.b}</b> — ${ew(c.s, `${P}.items.${i}.s`)}</li>`).join("\n        ")}
      </ul>`,
  tags: (b, P) => marquee(b.tags.map((t, i) => `<span class="tag"${et(`${P}.tags.${i}`)}>${t}</span>`).join(""), "taglist"),
  found: (b, P) => `<div class="found">
        <div class="top4">
          ${b.p4.map((p, i) => `<div class="p4"><div class="ic">${ic(p.icon)}</div><b${et(`${P}.p4.${i}.b`)}>${p.b}</b><span${et(`${P}.p4.${i}.s`)}>${p.s}</span></div>`).join("\n          ")}
        </div>
        <div class="base">
          <div class="bt"${et(P + ".base.bt")}>${b.base.bt}</div>
          <div class="cols">${b.base.cols.map((c, i) => `<span>${c.icon ? `<i class="col-ic">${ic(c.icon)}</i>` : ""}<span class="col-tx"><b${et(`${P}.base.cols.${i}.b`)}>${c.b}</b>${ew(c.s, `${P}.base.cols.${i}.s`)}</span></span>`).join("")}</div>
        </div>
      </div>`,
  cp: (b, P) => `<div class="cloud-partners">
        <div class="cp-head"><span class="cp-kicker"${et(P + ".kicker")}>${b.kicker}</span><b${et(P + ".head")}>${b.head}</b><span class="cp-sub"${et(P + ".sub")}>${b.sub}</span></div>
        <div class="cp-logos">
          <div class="cp-logo"><img src="${b.logo1}" alt="NAVER Cloud Platform"></div>
          <div class="cp-plus">+</div>
          <div class="cp-logo"><img src="${b.logo2}" alt="Amazon Web Services"></div>
          <div class="cp-with">with <img class="cp-with-logo" src="assets/ytins-logo.png" alt="YTINS"></div>
        </div>
      </div>`,
  bar: (b, P) => clientsBar(b, P),
  stack: (b, P) => `<div class="stack">
        ${b.layers.map((l, i) => `<div class="layer${i === 0 ? " top" : ""}${l.img ? " has-img" : ""}">${l.img ? `<img class="layer-img" src="${l.img}" alt="">` : ""}
          <div class="lhead"><span class="licon">${ic(l.icon)}</span><div><div class="lsub"${et(`${P}.layers.${i}.sub`)}>${l.sub}</div><div class="ltitle"${et(`${P}.layers.${i}.title`)}>${l.title}</div></div></div>
          <ul>${l.items.map((li, j) => `<li${et(`${P}.layers.${i}.items.${j}`)}>${li}</li>`).join("\n            ")}</ul>
        </div>`).join(`
        <div class="stack-arrow">▲</div>
        `)}
      </div>`,
  ssd: (b, P) => `<div class="ssd">
        <div class="ssd-sys">
          <div class="ssd-sys-label"${et(P + ".sysLabel")}>${b.sysLabel}</div>
          <div class="ssd-engines">
            <div class="ssd-eng">
              <div class="ssd-eng-head"><span class="tag"${et(P + ".eng1.tag")}>${b.eng1.tag}</span><span class="nm"${et(P + ".eng1.nm")}>${b.eng1.nm}</span><span class="ko"${et(P + ".eng1.ko")}>${b.eng1.ko}</span></div>
              <ul class="ssd-list">
                ${b.eng1.items.map((li, j) => `<li${j === 0 ? ' class="link"' : ""}${et(`${P}.eng1.items.${j}`)}>${li}</li>`).join("\n                ")}
              </ul>
            </div>
            <div class="ssd-bridge"><span class="rest"><i>⇄</i>${ew(b.bridge, P + ".bridge")}</span></div>
            <div class="ssd-eng">
              <div class="ssd-eng-head"><span class="tag alt"${et(P + ".eng2.tag")}>${b.eng2.tag}</span><span class="nm"${et(P + ".eng2.nm")}>${b.eng2.nm}</span><span class="ko"${et(P + ".eng2.ko")}>${b.eng2.ko}</span></div>
              <ul class="ssd-list">
                ${b.eng2.items.map((li, j) => `<li${j === 0 ? ' class="link"' : ""}${et(`${P}.eng2.items.${j}`)}>${li}</li>`).join("\n                ")}
              </ul>
            </div>
          </div>
        </div>
        <div class="ssd-link"></div>
        <div class="ssd-db"><span class="ssd-db-ic">${ic('database')}</span><div class="ssd-db-tx"><b${et(P + ".db.b")}>${b.db.b}</b><em${et(P + ".db.em")}>${b.db.em}</em></div></div>
        <div class="ssd-link"></div>
        <div class="ssd-sys">
          <div class="ssd-sys-label"${et(P + ".sys2Label")}>${b.sys2Label}</div>
          <div class="ssd-comps">
            ${b.comps.map((c, i) => `<div class="ssd-comp"><div class="ic">${ic(c.icon)}</div><b${et(`${P}.comps.${i}.b`)}>${c.b}</b>${c.items && c.items.length ? `<ul class="ssd-sub">${c.items.map((s, j) => `<li${et(`${P}.comps.${i}.items.${j}`)}>${s}</li>`).join("")}</ul>` : ""}</div>`).join("\n            ")}
          </div>
        </div>
      </div>`,
  lhref: (b, P) => `<div class="block" style="margin-top:56px">
        <h3${b.logo ? "" : et(P + ".title")}>${b.logo ? b.title.replace(b.logoText || "LH", `<img class="lh-inline" src="${b.logo}" alt="${b.logoText || "LH"}">`) : b.title}</h3>
        <div class="about-grid lh-grid" style="margin-top:20px">
          <div class="card" style="align-self:stretch">
            <h4${b.cardLogo ? "" : et(P + ".cardTitle")}>${b.cardLogo ? `<img class="lh-card-logo" src="${b.cardLogo}" alt="${b.cardTitle}">` : b.cardTitle}</h4>
            <p${et(P + ".cardDesc")}>${b.cardDesc}</p>
          </div>
          <div class="about-side col">
            ${b.points.map((li, i) => `<div class="about-card pt-card"><span class="pt-ic">${ic("shieldcheck")}</span><div class="label"${et(`${P}.points.${i}`)}>${li}</div></div>`).join("\n            ")}
          </div>
        </div>
      </div>`,
  spacer: (b) => { const h = Math.max(4, parseInt(b.h, 10) || 40); return EDIT ? `<div class="sp-block" data-sp="${h}" style="height:${h}px"></div>` : `<div aria-hidden="true" style="height:${h}px"></div>`; },
  image: (b, P) => `<figure class="img-block"${b.maxw ? ` style="max-width:${b.maxw}px"` : ""}>
        <img src="${b.src}" alt="${b.alt || ""}">${b.caption ? `\n        <figcaption${et(P + ".caption")}>${b.caption}</figcaption>` : ""}
      </figure>`,
  html: (b) => b.code,
};
function renderBlock(b, path) {
  const fn = BLOCK_RENDERERS[b.type];
  return fn ? fn(b, path) : "";
}
function renderSectionsPage(P, active, C, pageKey) {
  const wrapB = (html, si, bi) => (EDIT ? `<div class="eb" data-blk="${si}:${bi}">${html}</div>` : html);
  const main = `${pageHero(P.hero, pageKey + ".hero")}

  ${P.sections.map((sec, si) => `<section class="section${sec.alt ? " alt" : ""}" id="${sec.id}"${EDIT ? ` data-sec="${si}"` : ""}>
    <div class="container">
      <h2${et(`${pageKey}.sections.${si}.title`)}>${sec.title}</h2>
      ${sec.blocks.map((b, bi) => wrapB(renderBlock(b, `${pageKey}.sections.${si}.blocks.${bi}`), si, bi)).join("\n\n      ")}
    </div>
  </section>`).join("\n\n")}`;
  return pageShell({ active, title: P.meta.title, desc: P.meta.desc, main }, C);
}
function renderBusiness(C) { return renderSectionsPage(C.business, "business", C, "business"); }
function renderSolution(C) { return renderSectionsPage(C.solution, "solution", C, "solution"); }

/* ============================================================ REFERENCE */
function renderReference(C) {
  const P = C.reference;
  const main = `${pageHero(P.hero, "reference.hero")}

  <section class="section" id="clients"${ea("reference.clients")}>
    <div class="container">
      <h2${et("reference.clients.title")}>${P.clients.title}</h2>
      <p class="sec-desc"${et("reference.clients.desc")}>${P.clients.desc}</p>
      ${marquee(P.clients.logos.map((l) => `<div class="partner"><img src="assets/clients/${l.img}" alt="${l.name}" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"><span class="p-text" style="display:none">${l.name}</span></div>`).join("\n          "), "partner-grid")}
    </div>
  </section>

  <section class="section alt" id="partners"${ea("reference.partners")}>
    <div class="container">
      <h2${et("reference.partners.title")}>${P.partners.title}</h2>
      <p class="sec-desc"${et("reference.partners.desc")}>${P.partners.desc}</p>
      ${P.partners.groups.map((g, gi) => `<div class="pcat-group">
        <div class="pcat-head"><h4${et(`reference.partners.groups.${gi}.title`)}>${g.title}</h4><span${et(`reference.partners.groups.${gi}.sub`)}>${g.sub}</span></div>
        ${marquee(g.logos.map((l) => lg(l.img, l.name, l.fallback || undefined)).join("\n          "), "logo-grid")}
      </div>`).join("\n      ")}
    </div>
  </section>

  <section class="section" id="performance"${ea("reference.performance")}>
    <div class="container">
      <h2${et("reference.performance.title")}>${P.performance.title}</h2>
      <p class="sec-desc"${et("reference.performance.desc")}>${P.performance.desc}</p>
      ${P.performance.years.map((y, yi) => `<div class="block">
        <h3${et(`reference.performance.years.${yi}.year`)}>${y.year}</h3>
        <div class="table-wrap"><table class="perf-table">
          <thead><tr><th>사업명</th><th style="width:180px">발주처</th><th style="width:120px">분야</th><th style="width:160px">사업기간</th></tr></thead>
          <tbody>
            ${y.rows.map((r, ri) => `<tr><td${et(`reference.performance.years.${yi}.rows.${ri}.0`)}>${r[0]}</td><td${et(`reference.performance.years.${yi}.rows.${ri}.1`)}>${r[1]}</td><td class="cat"><span class="cat-tag"${et(`reference.performance.years.${yi}.rows.${ri}.2`)}>${r[2]}</span></td><td class="when"${et(`reference.performance.years.${yi}.rows.${ri}.3`)}>${r[3]}</td></tr>`).join("\n            ")}
          </tbody>
        </table></div>
      </div>`).join("\n      ")}
      <p class="note"${et("reference.performance.note")}>${P.performance.note}</p>
    </div>
  </section>`;
  return pageShell({ active: "reference", title: P.meta.title, desc: P.meta.desc, main }, C);
}

export function renderAll(content, opts) {
  EDIT = !!(opts && opts.edit);
  const out = {
    "index.html": renderHome(content),
    "company.html": renderCompany(content),
    "business.html": renderBusiness(content),
    "solution.html": renderSolution(content),
    "reference.html": renderReference(content),
  };
  EDIT = false;
  return out;
}
