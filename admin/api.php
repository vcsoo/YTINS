<?php
/* YTINS 어드민 API — 로그인 · 콘텐츠 저장 · 사이트 반영 · 이미지 업로드 */
require __DIR__ . '/lib.php';

$a = $_GET['a'] ?? '';
$method = $_SERVER['REQUEST_METHOD'];

function body_json(): array {
    $raw = file_get_contents('php://input');
    $j = json_decode($raw, true);
    return is_array($j) ? $j : [];
}

/* ---------- 인증 불필요 ---------- */
if ($a === 'state') {
    start_session();
    $auth = load_auth();
    json_out([
        'authed' => is_authed(),
        'user' => is_authed() ? ($auth['user'] ?? 'admin') : null,
        'csrf' => is_authed() ? csrf_token() : null,
        'defaultPw' => is_authed() ? !empty($auth['default_pw']) : null,
    ]);
}

if ($a === 'login' && $method === 'POST') {
    start_session();
    if (login_locked()) json_out(['ok' => false, 'error' => '로그인 시도가 너무 많습니다. 10분 후 다시 시도해 주세요.'], 429);
    $b = body_json();
    $auth = load_auth();
    if (($b['user'] ?? '') === ($auth['user'] ?? '') && password_verify($b['pass'] ?? '', $auth['hash'] ?? '')) {
        session_regenerate_id(true);
        $_SESSION['authed'] = true;
        login_ok();
        json_out(['ok' => true, 'csrf' => csrf_token(), 'defaultPw' => !empty($auth['default_pw'])]);
    }
    login_fail();
    json_out(['ok' => false, 'error' => '아이디 또는 비밀번호가 올바르지 않습니다.'], 401);
}

/* ---------- 이하 인증 필요 ---------- */
if (!is_authed()) json_out(['ok' => false, 'error' => '로그인이 필요합니다.'], 401);

if ($a === 'logout' && $method === 'POST') {
    session_destroy();
    json_out(['ok' => true]);
}

if ($method === 'POST' && !check_csrf()) json_out(['ok' => false, 'error' => '보안 토큰이 유효하지 않습니다. 새로고침 후 다시 시도해 주세요.'], 403);

if ($a === 'content') {
    header('Content-Type: application/json; charset=utf-8');
    readfile(ADMIN_DIR . '/content.json');
    exit;
}

if ($a === 'save' && $method === 'POST') {
    $b = body_json();
    $content = $b['content'] ?? null;
    $pages = $b['pages'] ?? null;
    if (!is_array($content) || !is_array($pages)) json_out(['ok' => false, 'error' => '요청 형식이 올바르지 않습니다.'], 400);

    $allowed = ['index.html', 'company.html', 'business.html', 'solution.html', 'reference.html'];
    foreach ($pages as $file => $html) {
        if (!in_array($file, $allowed, true)) json_out(['ok' => false, 'error' => '허용되지 않은 파일: ' . $file], 400);
        if (!is_string($html) || strlen($html) < 1000) json_out(['ok' => false, 'error' => '생성된 페이지가 비정상입니다: ' . $file], 400);
    }

    /* 백업 후 저장 (최근 30개 유지) */
    ensure_data_dir();
    $cur = ADMIN_DIR . '/content.json';
    if (is_file($cur)) {
        copy($cur, DATA_DIR . '/backup-' . date('Ymd-His') . '.json');
        $baks = glob(DATA_DIR . '/backup-*.json');
        sort($baks);
        while (count($baks) > 30) @unlink(array_shift($baks));
    }
    file_put_contents($cur, json_encode($content, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT));

    $root = site_root();
    $written = [];
    foreach ($pages as $file => $html) {
        file_put_contents($root . '/' . $file, $html);
        $written[] = $file;
    }
    json_out(['ok' => true, 'written' => $written]);
}

if ($a === 'upload' && $method === 'POST') {
    $dirs = [
        'clients' => '/assets/clients',
        'partners' => '/assets/partners',
        'certs' => '/assets/certs',
        'assets' => '/assets',
        'docs' => '/assets/docs',
    ];
    $dir = $_POST['dir'] ?? '';
    if (!isset($dirs[$dir])) json_out(['ok' => false, 'error' => '허용되지 않은 업로드 위치입니다.'], 400);
    if (empty($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) json_out(['ok' => false, 'error' => '파일 업로드에 실패했습니다.'], 400);

    $name = basename($_POST['name'] ?? $_FILES['file']['name']);
    if (!preg_match('/^[A-Za-z0-9._-]+$/', $name)) json_out(['ok' => false, 'error' => '파일명은 영문·숫자·하이픈만 사용할 수 있습니다. 예: new-client.png'], 400);
    $ext = strtolower(pathinfo($name, PATHINFO_EXTENSION));
    $okExt = $dir === 'docs' ? ['pdf'] : ['png', 'jpg', 'jpeg', 'webp', 'svg', 'gif'];
    if (!in_array($ext, $okExt, true)) json_out(['ok' => false, 'error' => '허용되지 않은 파일 형식입니다. (' . implode('/', $okExt) . ')'], 400);
    if ($_FILES['file']['size'] > 10 * 1024 * 1024) json_out(['ok' => false, 'error' => '파일이 10MB를 초과합니다.'], 400);

    $destDir = site_root() . $dirs[$dir];
    if (!is_dir($destDir)) mkdir($destDir, 0755, true);
    if (!move_uploaded_file($_FILES['file']['tmp_name'], $destDir . '/' . $name)) {
        json_out(['ok' => false, 'error' => '파일 저장에 실패했습니다.'], 500);
    }
    json_out(['ok' => true, 'path' => ltrim($dirs[$dir], '/') . '/' . $name, 'name' => $name]);
}

if ($a === 'chpass' && $method === 'POST') {
    $b = body_json();
    $auth = load_auth();
    if (!password_verify($b['old'] ?? '', $auth['hash'] ?? '')) json_out(['ok' => false, 'error' => '현재 비밀번호가 올바르지 않습니다.'], 400);
    $new = $b['new'] ?? '';
    if (strlen($new) < 8) json_out(['ok' => false, 'error' => '새 비밀번호는 8자 이상이어야 합니다.'], 400);
    $auth['hash'] = password_hash($new, PASSWORD_DEFAULT);
    unset($auth['default_pw']);
    save_auth($auth);
    json_out(['ok' => true]);
}

json_out(['ok' => false, 'error' => '알 수 없는 요청입니다.'], 404);
