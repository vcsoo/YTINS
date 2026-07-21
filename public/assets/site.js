/* 공통: 모바일 메뉴 토글 */
(function () {
  var burger = document.getElementById("burger");
  var gnb = document.getElementById("gnb");
  if (!burger || !gnb) return;
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
})();
