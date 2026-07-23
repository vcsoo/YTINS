/* 공통: 모바일 메뉴 · 헤더 스크롤 상태 · 스크롤 리빌 · 문의 위젯 */
(function () {
  // 플로팅: 맨 위로(스크롤 진행률 링) + 연락처 팝오버
  var fab = document.getElementById("fab");
  if (fab) {
    var toTop = document.getElementById("toTop");
    var toTopPct = document.getElementById("toTopPct");
    var ring = fab.querySelector(".ring-fg");
    var CIRC = 2 * Math.PI * 21;
    if (ring) ring.style.strokeDasharray = CIRC;
    var updateProgress = function () {
      var h = document.documentElement;
      var max = h.scrollHeight - h.clientHeight;
      var pct = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      if (ring) ring.style.strokeDashoffset = CIRC * (1 - pct);
      if (toTopPct) toTopPct.textContent = Math.round(pct * 100) + "%";
    };
    updateProgress();
    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress, { passive: true });
    if (toTop) toTop.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: "smooth" }); });

    var contactUnit = document.getElementById("contactUnit");
    var contactBtn = document.getElementById("contactBtn");
    if (contactUnit && contactBtn) {
      contactBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        var open = contactUnit.classList.toggle("open");
        contactBtn.setAttribute("aria-expanded", open ? "true" : "false");
      });
      var closeContact = function () { contactUnit.classList.remove("open"); contactBtn.setAttribute("aria-expanded", "false"); };
      document.addEventListener("click", function (e) { if (contactUnit.classList.contains("open") && !contactUnit.contains(e.target)) closeContact(); });
      document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeContact(); });
    }
  }

  // 모바일 메뉴
  var burger = document.getElementById("burger");
  var gnb = document.getElementById("gnb");
  if (burger && gnb) {
    burger.addEventListener("click", function () {
      var open = gnb.classList.toggle("open");
      burger.setAttribute("aria-expanded", open);
      document.documentElement.classList.toggle("menu-open", open); // 배경 스크롤 잠금
    });
    gnb.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        gnb.classList.remove("open");
        burger.setAttribute("aria-expanded", "false");
        document.documentElement.classList.remove("menu-open");
      });
    });
  }

  // 대분류 메뉴: 현재 페이지와 같으면 최상단으로 스크롤
  function baseName(p) { p = (p || "").split("#")[0].split("?")[0].split("/").pop() || "index.html"; return p.replace(/\.html$/, "") || "index"; }
  var here = baseName(location.pathname);
  document.querySelectorAll(".gnb .sub-toggle, .gnb > a").forEach(function (a) {
    var href = a.getAttribute("href") || "";
    if (href.indexOf("#") === -1 && baseName(href) === here) {
      a.addEventListener("click", function (e) {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: "smooth" });
        if (gnb) gnb.classList.remove("open");
        if (burger) burger.setAttribute("aria-expanded", "false");
        document.documentElement.classList.remove("menu-open");
      });
    }
  });

  // 헤더 스크롤 시 하단 보더
  var header = document.querySelector(".site-header");
  if (header) {
    var onScroll = function () { header.classList.toggle("scrolled", window.scrollY > 8); };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // 마퀴: 내용이 컨테이너를 넘지 않으면 흐름 정지·복제 숨김
  var marquees = [].slice.call(document.querySelectorAll(".marquee"));
  if (marquees.length) {
    var mqCheck = function () {
      marquees.forEach(function (m) {
        var t = m.querySelector(".marquee-track");
        if (!t) return;
        m.classList.remove("static");
        var fits = t.scrollWidth <= m.clientWidth + 4;
        if (fits) m.classList.add("static");
      });
    };
    mqCheck();
    window.addEventListener("load", mqCheck);
    window.addEventListener("resize", mqCheck, { passive: true });
  }

  // 히어로 네트워크(노드 연결) 배경 — 모노크롬 슬레이트 톤
  var netCv = document.getElementById("heroNet");
  if (netCv) {
    var nctx = netCv.getContext("2d");
    var heroEl = netCv.closest(".hero");
    var W = 0, H = 0, DPR = Math.min(window.devicePixelRatio || 1, 2);
    var nodes = [], LINK = 135, mouse = { x: -9999, y: -9999 };
    var sizeNet = function () {
      var r = heroEl.getBoundingClientRect();
      W = r.width; H = r.height;
      netCv.width = W * DPR; netCv.height = H * DPR;
      netCv.style.width = W + "px"; netCv.style.height = H + "px";
      nctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      var target = W < 720 ? 34 : 84;
      while (nodes.length < target) nodes.push({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - 0.5) * 0.55, vy: (Math.random() - 0.5) * 0.55, r: 1.2 + Math.random() * 1.6 });
      nodes.length = target;
    };
    sizeNet();
    window.addEventListener("resize", sizeNet, { passive: true });
    heroEl.addEventListener("pointermove", function (e) { var r = netCv.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; }, { passive: true });
    heroEl.addEventListener("pointerleave", function () { mouse.x = -9999; mouse.y = -9999; });
    var drawNet = function () {
      if (window.scrollY < H + 120) { // 히어로가 보일 때만 렌더
        nctx.clearRect(0, 0, W, H);
        var i, j;
        for (i = 0; i < nodes.length; i++) {
          var p = nodes[i];
          if (!reduceMotion) {
            p.x += p.vx; p.y += p.vy;
            if (p.x < -20) p.x = W + 20; else if (p.x > W + 20) p.x = -20;
            if (p.y < -20) p.y = H + 20; else if (p.y > H + 20) p.y = -20;
          }
          nctx.beginPath(); nctx.arc(p.x, p.y, p.r, 0, 6.2832);
          nctx.fillStyle = "rgba(71,85,105,0.45)"; nctx.fill();
        }
        nctx.lineWidth = 1;
        for (i = 0; i < nodes.length; i++) {
          for (j = i + 1; j < nodes.length; j++) {
            var dx = nodes[i].x - nodes[j].x, dy = nodes[i].y - nodes[j].y, d2 = dx * dx + dy * dy;
            if (d2 < LINK * LINK) {
              nctx.strokeStyle = "rgba(100,116,139," + ((1 - Math.sqrt(d2) / LINK) * 0.17).toFixed(3) + ")";
              nctx.beginPath(); nctx.moveTo(nodes[i].x, nodes[i].y); nctx.lineTo(nodes[j].x, nodes[j].y); nctx.stroke();
            }
          }
          var mdx = nodes[i].x - mouse.x, mdy = nodes[i].y - mouse.y, md2 = mdx * mdx + mdy * mdy;
          if (md2 < 28900) { // 170px 이내 노드는 커서와 연결
            nctx.strokeStyle = "rgba(51,65,85," + ((1 - Math.sqrt(md2) / 170) * 0.3).toFixed(3) + ")";
            nctx.beginPath(); nctx.moveTo(nodes[i].x, nodes[i].y); nctx.lineTo(mouse.x, mouse.y); nctx.stroke();
          }
        }
      }
      if (!reduceMotion) requestAnimationFrame(drawNet);
    };
    drawNet(); // 모션 최소화 설정 시 정적 1프레임만
  }

  // 히어로 키워드 로테이션
  var rotWord = document.getElementById("rotWord");
  if (rotWord && !reduceMotion) {
    var rotWords = ["AI 전환", "클라우드 전환", "데이터 혁신"];
    var rotIdx = 0;
    setInterval(function () {
      rotIdx = (rotIdx + 1) % rotWords.length;
      rotWord.classList.remove("swap");
      void rotWord.offsetWidth; // 애니메이션 재시작
      rotWord.textContent = rotWords[rotIdx];
      rotWord.classList.add("swap");
    }, 3000);
  }

  // KPI 숫자 카운트업 (뷰포트 진입 시 1회)
  (function () {
    var els = [].slice.call(document.querySelectorAll(".hero .stats .num, .about-card .num, .org-stat .nums b"))
      .filter(function (el) { return !el.closest(".about-side.col"); }); // 연혁(연도) 카드는 카운트업 제외
    var items = [];
    els.forEach(function (el) {
      var t = el.firstChild;
      if (!t || t.nodeType !== 3) return;
      var m = /^(\d+(?:\.\d+)?)$/.exec(t.nodeValue.trim());
      if (!m) return; // BB+ 등 비수치 항목 제외
      items.push({ node: t, el: el, target: parseFloat(m[1]), dec: (m[1].split(".")[1] || "").length, done: false });
      if (!reduceMotion) t.nodeValue = "0";
    });
    if (!items.length || reduceMotion) return;
    function animate(it) {
      var start = null, dur = 1200;
      function step(ts) {
        if (!start) start = ts;
        var p = Math.min(1, (ts - start) / dur);
        var e = 1 - Math.pow(1 - p, 3);
        it.node.nodeValue = (it.target * e).toFixed(it.dec);
        if (p < 1) requestAnimationFrame(step);
        else it.node.nodeValue = it.target.toFixed(it.dec);
      }
      requestAnimationFrame(step);
    }
    function check() {
      var vh = window.innerHeight || document.documentElement.clientHeight;
      items.forEach(function (it) {
        if (it.done) return;
        var r = it.el.getBoundingClientRect();
        if (r.top < vh * 0.92 && r.bottom > 0) { it.done = true; animate(it); }
      });
    }
    check();
    window.addEventListener("scroll", check, { passive: true });
    window.addEventListener("load", check);
  })();

  // 스크롤 리빌 (스크롤 기반·결정적, 스태거) — 콘텐츠는 기본 노출, JS 있을 때만 애니메이션
  var targets = [].slice.call(document.querySelectorAll(
    ".card, .nav-card, .cert, .partner, .tl-item, .about-card, .perf-stat, .info-table, .org, .clients-bar, .viewer, .contact-card, " +
    ".sec-desc, .block-desc, .num-item, .feat, .duo-panel, .phase, .fstep, .layer, .stack-arrow, " +
    ".ssd-eng, .ssd-bridge, .ssd-db, .ssd-comp, .cert-doc, .pcat-head, .finchart, .hnode, .hc-inner, " +
    ".found .p4, .found .base, .cloud-partners, .map-wrap, .map-info, .btn-row, .ceo, .table-wrap"
  )).filter(function (el) { return !el.closest("[data-marquee]"); });
  if (!targets.length) return;
  document.documentElement.classList.add("js-reveal");
  targets.forEach(function (el) { el.classList.add("reveal"); });

  function reveal() {
    var vh = window.innerHeight || document.documentElement.clientHeight;
    targets.forEach(function (el) {
      if (el.classList.contains("in")) return;
      var r = el.getBoundingClientRect();
      if (r.top < vh * 0.9 && r.bottom > 0) {
        var sibs = el.parentElement ? [].slice.call(el.parentElement.children).filter(function (c) { return c.classList.contains("reveal"); }) : [el];
        el.style.transitionDelay = Math.min(sibs.indexOf(el), 6) * 50 + "ms";
        el.classList.add("in");
      }
    });
  }
  reveal();
  window.addEventListener("scroll", reveal, { passive: true });
  window.addEventListener("resize", reveal, { passive: true });
  window.addEventListener("load", reveal);
})();
