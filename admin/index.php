<?php require __DIR__ . '/lib.php'; ensure_data_dir(); load_auth(); ?>
<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="robots" content="noindex, nofollow">
<title>YTINS 홈페이지 관리</title>
<link rel="stylesheet" href="admin.css">
</head>
<body>

<div id="login" style="display:none">
  <form id="loginForm" class="login-box">
    <h1>YTINS 홈페이지 관리</h1>
    <p class="hint">관리자 계정으로 로그인하세요.</p>
    <label>아이디</label>
    <input id="loginUser" autocomplete="username" required>
    <label>비밀번호</label>
    <input id="loginPass" type="password" autocomplete="current-password" required>
    <button type="submit">로그인</button>
    <div id="loginErr" class="err"></div>
  </form>
</div>

<div id="app" style="display:none">
  <aside>
    <div class="brand">YTINS 관리자</div>
    <nav id="nav"></nav>
    <div class="side-foot">
      <button id="chpassBtn" class="btn-ghost">비밀번호 변경</button>
      <button id="logoutBtn" class="btn-ghost">로그아웃</button>
    </div>
  </aside>
  <section class="main">
    <div class="topbar">
      <span class="tip">수정 후 반드시 <b>저장</b>을 눌러야 실제 홈페이지에 반영됩니다.</span>
      <div class="actions">
        <button id="previewBtn" class="btn-ghost">미리보기</button>
        <button id="saveBtn" class="btn-primary">저장 (사이트 반영)</button>
      </div>
    </div>
    <div id="panel"></div>
  </section>
</div>

<div id="previewModal">
  <div class="preview-box">
    <div class="preview-bar">
      <select id="previewSel">
        <option value="index.html">홈</option>
        <option value="company.html">회사소개</option>
        <option value="business.html">사업분야</option>
        <option value="solution.html">Solution</option>
        <option value="reference.html">레퍼런스</option>
      </select>
      <span class="hint">저장 전 미리보기입니다. 실제 반영은 저장 버튼으로.</span>
      <button id="previewClose" class="btn-ghost">닫기 ✕</button>
    </div>
    <iframe id="previewFrame" title="미리보기"></iframe>
  </div>
</div>

<script type="module" src="admin.js"></script>
</body>
</html>
