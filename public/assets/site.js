/* 공통: 모바일 메뉴 · 헤더 스크롤 상태 · 스크롤 리빌 */
(function () {
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

  // 스크롤 리빌 (스크롤 기반·결정적, 스태거) — 콘텐츠는 기본 노출, JS 있을 때만 애니메이션
  var targets = [].slice.call(document.querySelectorAll(
    ".card, .nav-card, .cert, .partner, .tl-item, .about-card, .perf-stat, .info-table, .org, .clients-bar, .viewer, .contact-card"
  ));
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
