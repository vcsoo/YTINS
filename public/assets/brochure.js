/* YTINS 회사소개서 슬라이드 뷰어 */
(function () {
  var TOTAL = 27;
  var titles = ["표지","목차","01 회사소개","회사개요","비전","연혁","조직도","인증현황",
    "02 Business","DX & AX","SI","클라우드","BigData·AI","IT아웃소싱",
    "03 솔루션","빅데이터 플랫폼(Hadoop)","Data & AI","Data & AI 차별화","스마트심사",
    "04 Reference","파트너사","주요실적","BigData·AI 주요실적","클라우드 주요실적","클라우드 주요실적","재무 & 신용등급","Contact"];
  var frame = document.getElementById("frame");
  var thumbsEl = document.getElementById("thumbs");
  var curEl = document.getElementById("cur");
  var totalEl = document.getElementById("total");
  var prevBtn = document.getElementById("prevBtn");
  var nextBtn = document.getElementById("nextBtn");
  if (!frame) return;

  var idx = 0;
  totalEl.textContent = TOTAL;

  function src(i) { return "assets/brochure/slide" + String(i + 1).padStart(2, "0") + ".jpg"; }

  for (var i = 0; i < TOTAL; i++) {
    var img = document.createElement("img");
    img.src = src(i);
    img.alt = titles[i];
    img.loading = i === 0 ? "eager" : "lazy";
    if (i === 0) img.classList.add("show");
    frame.appendChild(img);

    var t = document.createElement("div");
    t.className = "thumb" + (i === 0 ? " active" : "");
    t.innerHTML = '<img src="' + src(i) + '" alt="' + titles[i] + '" loading="lazy"><span class="num">' + (i + 1) + '</span>';
    (function (n) { t.addEventListener("click", function () { goTo(n); }); })(i);
    thumbsEl.appendChild(t);
  }

  function render() {
    var frames = frame.children, thumbs = thumbsEl.children;
    for (var j = 0; j < TOTAL; j++) {
      frames[j].classList.toggle("show", j === idx);
      thumbs[j].classList.toggle("active", j === idx);
    }
    curEl.textContent = idx + 1;
    prevBtn.disabled = idx === 0;
    nextBtn.disabled = idx === TOTAL - 1;
    var at = thumbs[idx];
    if (at) at.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }
  function goTo(i) { idx = Math.max(0, Math.min(TOTAL - 1, i)); render(); }

  prevBtn.addEventListener("click", function () { goTo(idx - 1); });
  nextBtn.addEventListener("click", function () { goTo(idx + 1); });

  var sx = null;
  frame.addEventListener("touchstart", function (e) { sx = e.touches[0].clientX; }, { passive: true });
  frame.addEventListener("touchend", function (e) {
    if (sx === null) return;
    var dx = e.changedTouches[0].clientX - sx;
    if (Math.abs(dx) > 40) goTo(idx + (dx < 0 ? 1 : -1));
    sx = null;
  });
  render();
})();
