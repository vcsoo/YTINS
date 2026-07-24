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

  // 스마트심사 구성도: REST API 배지를 좌우 '연동 행' 중심에 실측 정렬 (해상도 무관)
  // transform(리빌) 영향을 받지 않도록 offsetTop을 조상 체인으로 직접 합산
  var accTop = function (el, stopAt) {
    var t = 0;
    while (el && el !== stopAt) { t += el.offsetTop; el = el.offsetParent; }
    return t;
  };
  var ssdAlign = function () {
    [].forEach.call(document.querySelectorAll(".ssd"), function (ssd) {
      var sys = ssd.querySelector(".ssd-sys");
      var bridge = ssd.querySelector(".ssd-bridge");
      var rest = bridge && bridge.querySelector(".rest");
      var link = ssd.querySelector(".ssd-list li.link");
      if (!sys || !bridge || !rest || !link) return;
      var center = accTop(link, sys) + link.offsetHeight / 2;
      var pad = center - accTop(bridge, sys) - rest.offsetHeight / 2;
      if (pad > 0) bridge.style.paddingTop = pad + "px";
    });
  };
  ssdAlign();
  window.addEventListener("load", ssdAlign);
  window.addEventListener("resize", ssdAlign, { passive: true });
  setTimeout(ssdAlign, 900); // 웹폰트 적용 후 재정렬

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

    // 모바일 마퀴: scrollLeft 기반 자동 흐름 — 터치로 직접 슬라이드 가능, 놓으면 잠시 후 재개
    var mqMobile = window.matchMedia("(max-width: 720px)");
    marquees.forEach(function (m) {
      m.classList.add("js-flow");
      var pos = 0, paused = false, resumeT = null;
      var pause = function () { paused = true; if (resumeT) clearTimeout(resumeT); };
      var resume = function () {
        if (resumeT) clearTimeout(resumeT);
        resumeT = setTimeout(function () {
          var t = m.querySelector(".marquee-track");
          var w = t ? t.offsetWidth : 0;
          pos = w > 0 ? m.scrollLeft % w : m.scrollLeft; // 사용자가 넘긴 위치에서 이어서 흐름
          paused = false;
        }, 1500);
      };
      m.addEventListener("touchstart", pause, { passive: true });
      m.addEventListener("pointerdown", pause);
      m.addEventListener("touchend", resume, { passive: true });
      m.addEventListener("pointerup", resume);
      m.addEventListener("pointercancel", resume);
      var frame = function () {
        if (mqMobile.matches && !paused && !reduceMotion && !m.classList.contains("static")) {
          var t = m.querySelector(".marquee-track");
          var w = t ? t.offsetWidth : 0;
          if (w > 0 && m.scrollWidth > m.clientWidth + 4) {
            pos += Math.max(0.4, w / 1440); // 트랙 1회전 ≈ 24초
            if (pos >= w) pos -= w;
            m.scrollLeft = pos;
          }
        }
        requestAnimationFrame(frame);
      };
      requestAnimationFrame(frame);
    });
  }

  // 네트워크(노드 연결) 배경 — 메인 히어로(#heroNet) + 서브 히어로(.pageNet) 공용
  function initNet(cv) {
    var nctx = cv.getContext("2d");
    var host = cv.closest(".hero, .page-hero");
    var isHero = host.classList.contains("hero");
    var W = 0, H = 0, DPR = Math.min(window.devicePixelRatio || 1, 2);
    var nodes = [], LINK = isHero ? 135 : 110, mouse = { x: -9999, y: -9999 };
    var sizeNet = function () {
      var r = host.getBoundingClientRect();
      W = r.width; H = r.height;
      cv.width = W * DPR; cv.height = H * DPR;
      cv.style.width = W + "px"; cv.style.height = H + "px";
      nctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      var target = isHero ? (W < 720 ? 34 : 84) : (W < 720 ? 16 : 38);
      while (nodes.length < target) nodes.push({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - 0.5) * 0.55, vy: (Math.random() - 0.5) * 0.55, r: 1.2 + Math.random() * 1.6 });
      nodes.length = target;
    };
    sizeNet();
    window.addEventListener("resize", sizeNet, { passive: true });
    if (isHero) {
      host.addEventListener("pointermove", function (e) { var r = cv.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; }, { passive: true });
      host.addEventListener("pointerleave", function () { mouse.x = -9999; mouse.y = -9999; });
    }
    var drawNet = function () {
      var hr = host.getBoundingClientRect();
      if (hr.bottom > 0 && hr.top < (window.innerHeight || 800)) { // 화면에 보일 때만 렌더
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
          nctx.fillStyle = isHero ? "rgba(71,85,105,0.45)" : "rgba(176,190,210,0.55)"; // 서브 히어로는 네이비 배경이라 밝은 노드
          nctx.fill();
        }
        nctx.lineWidth = 1;
        for (i = 0; i < nodes.length; i++) {
          for (j = i + 1; j < nodes.length; j++) {
            var dx = nodes[i].x - nodes[j].x, dy = nodes[i].y - nodes[j].y, d2 = dx * dx + dy * dy;
            if (d2 < LINK * LINK) {
              nctx.strokeStyle = (isHero ? "rgba(100,116,139," : "rgba(168,182,204,") + ((1 - Math.sqrt(d2) / LINK) * (isHero ? 0.17 : 0.22)).toFixed(3) + ")";
              nctx.beginPath(); nctx.moveTo(nodes[i].x, nodes[i].y); nctx.lineTo(nodes[j].x, nodes[j].y); nctx.stroke();
            }
          }
          var mdx = nodes[i].x - mouse.x, mdy = nodes[i].y - mouse.y, md2 = mdx * mdx + mdy * mdy;
          if (md2 < 28900) {
            nctx.strokeStyle = "rgba(51,65,85," + ((1 - Math.sqrt(md2) / 170) * 0.3).toFixed(3) + ")"; // 포인터 연결선은 메인 히어로 전용
            nctx.beginPath(); nctx.moveTo(nodes[i].x, nodes[i].y); nctx.lineTo(mouse.x, mouse.y); nctx.stroke();
          }
        }
      }
      if (!reduceMotion) requestAnimationFrame(drawNet);
    };
    drawNet(); // 모션 최소화 설정 시 정적 1프레임만
  }
  [].slice.call(document.querySelectorAll("#heroNet, canvas.pageNet")).forEach(initNet);

  // 히어로 키워드 로테이션
  var rotWord = document.getElementById("rotWord");
  if (rotWord && !reduceMotion) {
    var rotWords = ["AI 전환", "클라우드 전환", "데이터 혁신"];
    var rotIdx = 0;
    // 회전 슬롯 폭을 가장 긴 단어로 고정 → 단어가 바뀌어도 앞뒤 글자·줄바꿈이 전혀 움직이지 않음
    var rotBox = rotWord.parentElement; // .rot
    var fitRot = function () {
      var orig = rotWord.textContent, max = 0;
      rotBox.style.width = "auto";
      rotWords.forEach(function (t) { rotWord.textContent = t; max = Math.max(max, rotBox.offsetWidth); });
      rotWord.textContent = orig;
      rotBox.style.width = Math.ceil(max) + "px";
    };
    fitRot();
    window.addEventListener("load", fitRot);
    window.addEventListener("resize", fitRot, { passive: true });
    setTimeout(fitRot, 800); // 웹폰트 적용 후 재측정
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
    var els = [].slice.call(document.querySelectorAll(".hero .stats .num, .about-card .num, .org-stat .nums b, .finchart .fc-val"))
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
        else { it.node.nodeValue = it.target.toFixed(it.dec); it.el.classList.add("count-pop"); } // 완료 시 팝 강조
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
    ".found .p4, .found .base, .cloud-partners, .map-wrap, .map-info, .btn-row, .ceo, .table-wrap, .marquee"
  )).filter(function (el) { var m = el.closest("[data-marquee]"); return !m || m === el; }); // 마퀴 내부 셀은 제외, 컨테이너 자체는 허용
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
