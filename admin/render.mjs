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
function ic(name) { return `<svg class="ico-svg" viewBox="0 0 24 24" aria-hidden="true">${ICONS[name] || ""}</svg>`; }

function marquee(inner, gridCls) {
  return `<div class="marquee" data-marquee>
        <div class="marquee-track ${gridCls}">${inner}</div>
        <div class="marquee-track ${gridCls}" aria-hidden="true">${inner}</div>
      </div>`;
}
function lg(src, alt, fallback) {
  return fallback
    ? `<div class="lg"><img src="assets/partners/${src}" alt="${alt}" onerror="this.style.display='none';this.nextElementSibling.style.display='inline'"><span class="lg-text" style="display:none">${fallback}</span></div>`
    : `<div class="lg"><img src="assets/partners/${src}" alt="${alt}"></div>`;
}

function header(active, nav) {
  const cls = (k) => (k === active ? " active" : "");
  const grp = (g) => `<div class="has-sub">
        <a href="${g.href}" class="sub-toggle${cls(g.key)}">${g.label} <span class="caret">▾</span></a>
        <div class="sub">
          ${g.subs.map((s) => `<a href="${s.href}">${s.label}</a>`).join("\n          ")}
        </div>
      </div>`;
  return `<header class="site-header">
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
  return `<footer class="site-footer">
  <div class="container">
    <div class="footer-top">
      <div class="footer-brand">
        <span class="logo"><img class="logo-img footer-logo" src="assets/ytins-logo.png" alt="YTINS"></span>
        <div class="slogan">${f.slogan}</div>
      </div>
      <div class="footer-info">
        ${f.company}<span class="sep">|</span>대표자 : ${f.ceo}<br>
        ${f.address}<br>
        Tel : ${f.tel}<span class="sep">|</span>Fax : ${f.fax}<span class="sep">|</span>E-Mail : ${f.email}<span class="sep">|</span><a href="${f.url}" target="_blank" rel="noopener">${f.urlLabel}</a>
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
<div class="fab" id="fab">
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
<script src="assets/site.js"></script>
</body>
</html>`;
}

/* 공용 partial */
const pageHero = (h) => `  <section class="page-hero">
    <div class="ph-bg" aria-hidden="true"><canvas class="pageNet"></canvas></div>
    <div class="container"><span class="eyebrow">${h.eyebrow}</span><h1>${h.title}</h1>
      <p>${h.desc}</p></div>
  </section>`;
const clientsBar = (b) => `<div class="clients-bar"><span class="t">${b.t}</span><span class="list">${b.list}</span></div>`;
const flowSteps = (steps) => steps.map((s) => `<div class="fstep">${s.t}${s.s ? `<small>${s.s}</small>` : ""}</div>`).join("\n        ");
const numbered = (items) => items.map((n, i) => `<div class="num-item"><div class="gh">0${i + 1}</div><h4>${n.title}${n.badge ? ` <span style="color:var(--accent);font-size:12px;font-weight:700">${n.badge}</span>` : ""}</h4><p>${n.desc}</p></div>`).join("\n        ");
const featgrid = (feats, sep = "\n        ") => feats.map((f) => `<div class="feat"><span class="fic">${ic(f.icon)}</span><div class="ftx"><b>${f.b}</b><span>${f.s}</span></div></div>`).join(sep);

/* ============================================================ HOME */
function renderHome(C) {
  const H = C.home;
  const main = `  <section class="hero">
    <div class="hero-bg" aria-hidden="true"><canvas id="heroNet"></canvas></div>
    <div class="container">
      <span class="eyebrow">${H.hero.eyebrow}</span>
      <h1>${H.hero.line1Before}<span class="rot-wrap"><span class="rot"><span class="rot-word" id="rotWord">${H.hero.rotWords[0]}</span></span>${H.hero.line1After}</span><br>${H.hero.line2}<br><span class="en">${H.hero.line3}</span></h1>
      <p class="lead">${H.hero.lead}</p>
      <div class="stats">
        ${H.hero.stats.map((s) => `<div class="stat"><div class="num">${s.num}${s.unit ? `<small>${s.unit}</small>` : ""}</div><div class="label">${s.label}</div></div>`).join("\n        ")}
      </div>
    </div>
    <a class="scroll-cue" href="#explore" aria-label="아래로 스크롤"><span>Scroll</span><svg class="ico-svg" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9.5l6 6 6-6"/></svg></a>
  </section>
  <section class="section" id="explore">
    <div class="container">
      
      <h2>${H.explore.title}</h2>
      <p class="sec-desc">${H.explore.desc}</p>
      <div class="nav-cards">
        ${H.explore.cards.map((c) => `<a class="nav-card" href="${c.href}"><span class="nc-ic">${ic(c.icon)}</span><div class="no">${c.no}</div><h3>${c.title}</h3><p>${c.desc}</p><span class="go">자세히 보기 →</span></a>`).join("\n        ")}
      </div>
    </div>
  </section>`;
  return pageShell({ active: "", title: H.meta.title, desc: H.meta.desc, main }, C);
}

/* ============================================================ COMPANY */
function renderCompany(C) {
  const P = C.company;
  const main = `${pageHero(P.hero)}

  <section class="section" id="about">
    <div class="container">
      <h2>${P.about.title}</h2>
      <p class="sec-desc">${P.about.desc}</p>
      <div class="about-grid">
        <table class="info-table">
          ${P.about.rows.map((r) => `<tr><th>${r.th}</th><td>${r.td}</td></tr>`).join("\n          ")}
        </table>
        <div class="about-side">
          ${P.about.cards.map((c) => `<div class="about-card"><span class="ac-ic">${ic(c.icon)}</span><div class="num">${c.num}${c.unit ? `<small>${c.unit}</small>` : ""}</div><div class="label">${c.label}</div></div>`).join("\n          ")}
        </div>
      </div>
    </div>
  </section>

  <section class="section alt" id="ceo">
    <div class="container">
      <h2>${P.ceo.title}</h2>
      <div class="ceo">
        <p class="ceo-lead">${P.ceo.lead}</p>
        ${P.ceo.paras.map((p) => `<p>${p}</p>`).join("\n        ")}
        <div class="ceo-sign">
          <img class="ceo-signimg" src="assets/ceo-signature.png" alt="${P.ceo.name} 대표이사 서명" onerror="this.style.display='none'">
          <div class="ceo-name"><b>${P.ceo.name}</b><span>${P.ceo.role}</span></div>
        </div>
      </div>
    </div>
  </section>

  <section class="section" id="history">
    <div class="container">
      <h2>${P.history.title}</h2>
      <p class="sec-desc">${P.history.desc}</p>
      <div class="timeline">
        ${P.history.items.map((t) => `<div class="tl-item"><div class="year">${t.year}</div><ul>
          ${t.rows.map((li) => `<li>${li}</li>`).join("\n          ")}</ul></div>`).join("\n        ")}
      </div>
    </div>
  </section>

  <section class="section alt" id="organization">
    <div class="container">
      <h2>${P.org.title}</h2>
      <p class="sec-desc">${P.org.desc}</p>
      <div class="org">
        <div class="org-top">${P.org.top}</div>
        <div class="org-line"></div>
        <div class="org-staff">${P.org.staff.map((s) => `<span>${s}</span>`).join("")}</div>
        <div class="org-line"></div>
        <div class="org-divs">
          ${P.org.divs.map((d) => `<div class="org-div"><div class="head">${d.head}</div><div class="team">${d.team}</div></div>`).join("\n          ")}
        </div>
        <div class="org-stat">
          <div class="t">${P.org.statLabel}</div>
          <div class="nums"><div class="n"><b class="hi">${P.org.statNum}</b><span>${P.org.statUnit}</span></div></div>
        </div>
      </div>
    </div>
  </section>

  <section class="section" id="certifications">
    <div class="container">
      <h2>${P.certs.title}</h2>
      <p class="sec-desc">${P.certs.desc}</p>
      <div class="cert-docs">
        ${P.certs.items.map((c) => `<div class="cert-doc"><div class="thumb"><img src="${c.img}" alt="${c.alt}"></div><div class="cap"><div class="name">${c.name}</div><div class="meta">${c.meta}</div></div></div>`).join("\n        ")}
      </div>
    </div>
  </section>

  <section class="section alt" id="location">
    <div class="container">
      <h2>${P.location.title}</h2>
      <p class="sec-desc">${P.location.desc}</p>
      <div class="map-grid">
        <div class="map-wrap">
          <iframe title="YTINS 본사 위치 지도" src="${P.location.mapSrc}" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe>
        </div>
        <div class="map-info">
          <table class="info-table">
            ${P.location.rows.map((r) => `<tr><th>${r.th}</th><td>${r.td}</td></tr>`).join("\n            ")}
          </table>
          <a class="btn" href="${P.location.naverUrl}" target="_blank" rel="noopener"><span class="ico">📍</span> ${P.location.naverLabel}</a>
        </div>
      </div>
    </div>
  </section>

  <section class="section" id="brochure">
    <div class="container">
      <h2>${P.brochure.title}</h2>
      <p class="sec-desc">${P.brochure.desc}</p>
      <div class="btn-row">
        <a class="btn" href="${P.brochure.file}" download><span class="ico">⬇</span> ${P.brochure.btnLabel}</a>
      </div>
    </div>
  </section>`;
  return pageShell({ active: "company", title: P.meta.title, desc: P.meta.desc, main }, C);
}

/* ============================================================ BUSINESS */
function renderBusiness(C) {
  const P = C.business;
  const duoPanel = (p, i) => `<div class="duo-panel ${i === 0 ? "ink" : "blue"}">
          <div class="dhead"><div class="kicker">${p.kicker}</div><h3>${p.title}</h3></div>
          <div class="dbody">
            ${p.items.map((s) => `<div class="srv"><b>${s.b}</b><span>${s.s}</span></div>`).join("\n            ")}
          </div>
        </div>`;
  const main = `${pageHero(P.hero)}

  <section class="section" id="dxax">
    <div class="container">
      <h2>${P.dxax.title}</h2>
      <p class="sec-desc">${P.dxax.desc}</p>
      <div class="flow grad" style="margin-top:6px;margin-bottom:44px">
        ${flowSteps(P.dxax.flow)}
      </div>
      <div class="duo">
        ${P.dxax.panels.map(duoPanel).join("\n        ")}
      </div>
      ${clientsBar(P.dxax.bar)}
    </div>
  </section>

  <section class="section alt" id="si">
    <div class="container">
      <h2>${P.si.title}</h2>
      <p class="sec-desc">${P.si.desc}</p>
      <div class="numbered">
        ${numbered(P.si.numbered)}
      </div>
      <h3 class="sub-h">${P.si.egov.title}</h3>
      <p class="block-desc">${P.si.egov.desc}</p>
      <div class="featgrid">
        ${featgrid(P.si.egov.feats)}
      </div>

      <h3 class="sub-h">${P.si.method.title}</h3>
      <p class="block-desc">${P.si.method.desc}</p>
      <div class="phases">
        ${P.si.method.phases.map((p) => `<div class="phase"><div class="ph">${p.ph}</div><ul>${p.items.map((li) => `<li>${li}</li>`).join("")}</ul></div>`).join("\n        ")}
      </div>

      ${clientsBar(P.si.bar)}
    </div>
  </section>

  <section class="section" id="ito">
    <div class="container">
      <h2>${P.ito.title}</h2>
      <p class="sec-desc">${P.ito.desc}</p>
      <div class="found">
        <div class="top4">
          ${P.ito.p4.map((p) => `<div class="p4"><div class="ic">${ic(p.icon)}</div><b>${p.b}</b><span>${p.s}</span></div>`).join("\n          ")}
        </div>
        <div class="base">
          <div class="bt">${P.ito.base.bt}</div>
          <div class="cols">${P.ito.base.cols.map((c) => `<span><b>${c.b}</b>${c.s}</span>`).join("")}</div>
        </div>
      </div>
      ${clientsBar(P.ito.bar)}
    </div>
  </section>

  <section class="section alt" id="bigdata-ai">
    <div class="container">
      <h2>${P.bigdata.title}</h2>
      <p class="sec-desc">${P.bigdata.desc}</p>
      <div class="flow grad" style="margin-bottom:40px">
        ${flowSteps(P.bigdata.flow)}
      </div>
      <div class="numbered">
        ${numbered(P.bigdata.numbered)}
      </div>

      <h3 class="sub-h">${P.bigdata.tagsTitle}</h3>
      <p class="block-desc">${P.bigdata.tagsDesc}</p>
      ${marquee(P.bigdata.tags.map((t) => `<span class="tag">${t}</span>`).join(""), "taglist")}

      <h3 class="sub-h">${P.bigdata.featsTitle}</h3>
      <div class="featgrid">
        ${featgrid(P.bigdata.feats)}
      </div>
    </div>
  </section>

  <section class="section" id="cloud">
    <div class="container">
      <h2>${P.cloud.title}</h2>
      <p class="sec-desc">${P.cloud.desc}</p>

      <h3 class="sub-h tight">${P.cloud.lineupTitle}</h3>
      <p class="block-desc">${P.cloud.lineupDesc}</p>
      <div class="numbered">
        ${numbered(P.cloud.numbered)}
      </div>

      <h3 class="sub-h">${P.cloud.checksTitle}</h3>
      <p class="block-desc">${P.cloud.checksDesc}</p>
      <ul class="checks">
        ${P.cloud.checks.map((c) => `<li><b>${c.b}</b> — ${c.s}</li>`).join("\n        ")}
      </ul>

      <div class="flow grad" style="margin-top:56px">
        ${flowSteps(P.cloud.flow)}
      </div>

      <div class="cloud-partners">
        <div class="cp-head"><span class="cp-kicker">${P.cloud.cp.kicker}</span><b>${P.cloud.cp.head}</b><span class="cp-sub">${P.cloud.cp.sub}</span></div>
        <div class="cp-logos">
          <div class="cp-logo"><img src="${P.cloud.cp.logo1}" alt="NAVER Cloud Platform"></div>
          <div class="cp-plus">+</div>
          <div class="cp-logo"><img src="${P.cloud.cp.logo2}" alt="Amazon Web Services"></div>
          <div class="cp-with">with <img class="cp-with-logo" src="assets/ytins-logo.png" alt="YTINS"></div>
        </div>
      </div>

      ${clientsBar(P.cloud.bar)}
    </div>
  </section>`;
  return pageShell({ active: "business", title: P.meta.title, desc: P.meta.desc, main }, C);
}

/* ============================================================ SOLUTION */
function renderSolution(C) {
  const P = C.solution;
  const main = `${pageHero(P.hero)}

  <section class="section" id="hadoop">
    <div class="container">
      <h2>${P.hadoop.title}</h2>
      <p class="sec-desc">${P.hadoop.desc}</p>
      <div class="duo">
        <div class="duo-panel ink">
          <div class="dhead"><div class="kicker">${P.hadoop.before.kicker}</div><h3>${P.hadoop.before.title}</h3></div>
          <div class="dbody">
            ${P.hadoop.before.items.map((s) => `<div class="srv iconed"><i class="s-ic">${ic('alert')}</i><span>${s}</span></div>`).join("\n            ")}
          </div>
        </div>
        <div class="duo-panel blue">
          <div class="dhead"><div class="kicker">${P.hadoop.after.kicker}</div><h3>${P.hadoop.after.title}</h3></div>
          <div class="dbody">
            <table class="spec" style="margin:6px 0">
              ${P.hadoop.after.spec.map((r) => `<tr><th>${r.th}</th><td>${r.td}</td></tr>`).join("\n              ")}
            </table>
          </div>
        </div>
      </div>
      <div class="flow grad" style="margin-top:26px">
        ${flowSteps(P.hadoop.flow1)}
      </div>
      <h3 class="sub-h">${P.hadoop.aiTitle}</h3>
      <p class="block-desc">${P.hadoop.aiDesc}</p>
      <div class="flow grad">
        ${flowSteps(P.hadoop.flow2)}
      </div>

      <h3 class="sub-h">${P.hadoop.monTitle}</h3>
      <p class="block-desc">${P.hadoop.monDesc}</p>
      <div class="featgrid">
        ${featgrid(P.hadoop.monFeats)}
      </div>

      ${clientsBar(P.hadoop.bar)}
    </div>
  </section>

  <section class="section alt" id="data-ai">
    <div class="container">
      <h2>${P.dataai.title}</h2>
      <p class="sec-desc">${P.dataai.desc}</p>
      <div class="flow grad" style="margin-top:6px;margin-bottom:34px">
        ${flowSteps(P.dataai.flow)}
      </div>
      <div class="stack">
        ${P.dataai.layers.map((l, i) => `<div class="layer${i === 0 ? " top" : ""}">
          <div class="lhead"><span class="licon">${ic(l.icon)}</span><div><div class="lsub">${l.sub}</div><div class="ltitle">${l.title}</div></div></div>
          <ul>${l.items.map((li, j) => `<li>${li}</li>`).join("\n            ")}</ul>
        </div>`).join(`
        <div class="stack-arrow">▲</div>
        `)}
      </div>
      <div class="block" style="margin-top:40px">
        <h3>${P.dataai.featsTitle}</h3>
        <div class="featgrid">
          ${featgrid(P.dataai.feats, "\n          ")}
        </div>
        ${clientsBar(P.dataai.bar)}
      </div>
    </div>
  </section>

  <section class="section" id="smart">
    <div class="container">
      <h2>${P.smart.title}</h2>
      <p class="sec-desc">${P.smart.desc}</p>

      <h3 class="sub-h">${P.smart.ssdTitle}</h3>
      <p class="block-desc">${P.smart.ssdDesc}</p>
      <div class="ssd">
        <div class="ssd-sys">
          <div class="ssd-sys-label">${P.smart.ssd.sysLabel}</div>
          <div class="ssd-engines">
            <div class="ssd-eng">
              <div class="ssd-eng-head"><span class="tag">${P.smart.ssd.eng1.tag}</span><span class="nm">${P.smart.ssd.eng1.nm}</span><span class="ko">${P.smart.ssd.eng1.ko}</span></div>
              <ul class="ssd-list">
                ${P.smart.ssd.eng1.items.map((li, j) => `<li${j === 0 ? ' class="link"' : ""}>${li}</li>`).join("\n                ")}
              </ul>
            </div>
            <div class="ssd-bridge"><span class="rest"><i>⇄</i>${P.smart.ssd.bridge}</span></div>
            <div class="ssd-eng">
              <div class="ssd-eng-head"><span class="tag alt">${P.smart.ssd.eng2.tag}</span><span class="nm">${P.smart.ssd.eng2.nm}</span><span class="ko">${P.smart.ssd.eng2.ko}</span></div>
              <ul class="ssd-list">
                ${P.smart.ssd.eng2.items.map((li, j) => `<li${j === 0 ? ' class="link"' : ""}>${li}</li>`).join("\n                ")}
              </ul>
            </div>
          </div>
        </div>
        <div class="ssd-link"></div>
        <div class="ssd-db"><span class="ssd-db-ic">${ic('database')}</span><div class="ssd-db-tx"><b>${P.smart.ssd.db.b}</b><em>${P.smart.ssd.db.em}</em></div></div>
        <div class="ssd-link"></div>
        <div class="ssd-sys">
          <div class="ssd-sys-label">${P.smart.ssd.sys2Label}</div>
          <div class="ssd-comps">
            ${P.smart.ssd.comps.map((c) => `<div class="ssd-comp"><div class="ic">${ic(c.icon)}</div><b>${c.b}</b></div>`).join("\n            ")}
          </div>
        </div>
      </div>

      <div class="block" style="margin-top:56px">
        <h3>${P.smart.lh.title}</h3>
        <div class="about-grid" style="margin-top:20px">
          <div class="card" style="align-self:stretch"><h4>${P.smart.lh.cardTitle}</h4>
            <p>${P.smart.lh.cardDesc}</p>
            <ul class="card-points">
              ${P.smart.lh.points.map((li) => `<li>${li}</li>`).join("\n              ")}
            </ul></div>
          <div class="about-side col">
            ${P.smart.lh.years.map((y) => `<div class="about-card"><div class="num">${y.num}</div><div class="label">${y.label}</div></div>`).join("\n            ")}
          </div>
        </div>
      </div>
    </div>
  </section>`;
  return pageShell({ active: "solution", title: P.meta.title, desc: P.meta.desc, main }, C);
}

/* ============================================================ REFERENCE */
function renderReference(C) {
  const P = C.reference;
  const main = `${pageHero(P.hero)}

  <section class="section" id="clients">
    <div class="container">
      <h2>${P.clients.title}</h2>
      <p class="sec-desc">${P.clients.desc}</p>
      ${marquee(P.clients.logos.map((l) => `<div class="partner"><img src="assets/clients/${l.img}" alt="${l.name}" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"><span class="p-text" style="display:none">${l.name}</span></div>`).join("\n          "), "partner-grid")}
    </div>
  </section>

  <section class="section alt" id="partners">
    <div class="container">
      <h2>${P.partners.title}</h2>
      <p class="sec-desc">${P.partners.desc}</p>
      ${P.partners.groups.map((g) => `<div class="pcat-group">
        <div class="pcat-head"><h4>${g.title}</h4><span>${g.sub}</span></div>
        ${marquee(g.logos.map((l) => lg(l.img, l.name, l.fallback || undefined)).join("\n          "), "logo-grid")}
      </div>`).join("\n      ")}
    </div>
  </section>

  <section class="section" id="performance">
    <div class="container">
      <h2>${P.performance.title}</h2>
      <p class="sec-desc">${P.performance.desc}</p>
      ${P.performance.years.map((y) => `<div class="block">
        <h3>${y.year}</h3>
        <div class="table-wrap"><table class="perf-table">
          <thead><tr><th>사업명</th><th style="width:190px">발주처</th><th style="width:160px">사업기간</th></tr></thead>
          <tbody>
            ${y.rows.map((r) => `<tr><td>${r[0]}</td><td>${r[1]}</td><td class="when">${r[2]}</td></tr>`).join("\n            ")}
          </tbody>
        </table></div>
      </div>`).join("\n      ")}
      <div class="block">
        <h3>${P.performance.bigdata.title}</h3>
        <p class="block-desc">${P.performance.bigdata.desc}</p>
        <div class="table-wrap"><table class="perf-table">
          <thead><tr><th style="width:170px">발주처</th><th>사업명</th><th style="width:150px">사업기간</th><th style="width:150px">구분</th></tr></thead>
          <tbody>
            ${P.performance.bigdata.rows.map((r) => `<tr><td>${r[0]}</td><td>${r[1]}</td><td class="when">${r[2]}</td><td>${r[3]}</td></tr>`).join("\n            ")}
          </tbody>
        </table></div>
      </div>

      <div class="block">
        <h3>${P.performance.cloud.title}</h3>
        <p class="block-desc">${P.performance.cloud.desc}</p>
        <div class="table-wrap"><table class="perf-table">
          <thead><tr><th style="width:150px">발주처</th><th>사업명</th><th style="width:150px">사업기간</th><th style="width:130px">산업</th></tr></thead>
          <tbody>
            ${P.performance.cloud.rows.map((r) => `<tr><td>${r[0]}</td><td>${r[1]}</td><td class="when">${r[2]}</td><td>${r[3]}</td></tr>`).join("\n            ")}
          </tbody>
        </table></div>
      </div>
      <p class="note">${P.performance.note}</p>
    </div>
  </section>`;
  return pageShell({ active: "reference", title: P.meta.title, desc: P.meta.desc, main }, C);
}

export function renderAll(content) {
  return {
    "index.html": renderHome(content),
    "company.html": renderCompany(content),
    "business.html": renderBusiness(content),
    "solution.html": renderSolution(content),
    "reference.html": renderReference(content),
  };
}
