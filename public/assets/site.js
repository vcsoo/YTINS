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
    });
    gnb.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        gnb.classList.remove("open");
        burger.setAttribute("aria-expanded", "false");
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

  // 스크롤 시 현재 섹션명을 헤더 아래 고정 표시
  var secbar = document.getElementById("secbar");
  if (secbar) {
    var secOut = secbar.querySelector("b");
    var headerH = header ? header.offsetHeight : 64;
    var secList = [].slice.call(document.querySelectorAll("main section[id]")).map(function (s) {
      var chip = s.querySelector(".sec-chip");
      var hh = s.querySelector("h2, h1");
      return { el: s, label: (chip ? chip.textContent : (hh ? hh.textContent : "")).trim() };
    }).filter(function (x) { return x.label; });
    var lastLabel = "";
    var secScroll = function () {
      if (!secList.length) return;
      var y = window.scrollY + headerH + 8;
      var cur = null;
      for (var i = 0; i < secList.length; i++) { if (secList[i].el.offsetTop <= y) cur = secList[i]; }
      if (cur && y >= secList[0].el.offsetTop) {
        secbar.classList.add("show");
        if (cur.label !== lastLabel) {
          lastLabel = cur.label;
          secOut.textContent = "";
          var sp = document.createElement("span");
          sp.className = "swap"; sp.textContent = cur.label;
          secOut.appendChild(sp);
        }
      } else {
        secbar.classList.remove("show");
      }
    };
    secScroll();
    window.addEventListener("scroll", secScroll, { passive: true });
    window.addEventListener("resize", function () { headerH = header ? header.offsetHeight : 64; secScroll(); }, { passive: true });
  }

  // 스크롤 리빌 (스크롤 기반·결정적, 스태거) — 콘텐츠는 기본 노출, JS 있을 때만 애니메이션
  var targets = [].slice.call(document.querySelectorAll(
    ".card, .nav-card, .cert, .partner, .tl-item, .about-card, .perf-stat, .info-table, .org, .clients-bar, .viewer, .contact-card"
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
        el.style.transitionDelay = Math.min(sibs.indexOf(el), 6) * 70 + "ms";
        el.classList.add("in");
      }
    });
  }
  reveal();
  window.addEventListener("scroll", reveal, { passive: true });
  window.addEventListener("resize", reveal, { passive: true });
  window.addEventListener("load", reveal);
})();
