<?php
/* YTINS 어드민 공통 — 설정 · 세션 · 인증 · CSRF */

const ADMIN_DIR = __DIR__;
define('DATA_DIR', ADMIN_DIR . '/data');

/* 사이트 루트(정적 HTML이 놓이는 곳).
   기본: admin/ 의 상위 폴더 (카페24: www/admin → www).
   로컬 개발 등 다른 경로는 data/config.json 의 site_root 로 재정의. */
function site_root() {
    $cfg = DATA_DIR . '/config.json';
    if (is_file($cfg)) {
        $j = json_decode((string)file_get_contents($cfg), true);
        if (!empty($j['site_root']) && is_dir($j['site_root'])) return rtrim($j['site_root'], '/');
    }
    return dirname(ADMIN_DIR);
}

function ensure_data_dir() {
    if (!is_dir(DATA_DIR)) mkdir(DATA_DIR, 0755, true);
    $ht = DATA_DIR . '/.htaccess';
    if (!is_file($ht)) file_put_contents($ht, "<IfModule mod_authz_core.c>\nRequire all denied\n</IfModule>\n<IfModule !mod_authz_core.c>\nOrder allow,deny\nDeny from all\n</IfModule>\n");
    /* 윈도우(IIS) 호스팅용 접근 차단 */
    $wc = DATA_DIR . '/web.config';
    if (!is_file($wc)) file_put_contents($wc, "<?xml version=\"1.0\"?>\n<configuration>\n  <system.webServer>\n    <security>\n      <authorization>\n        <remove users=\"*\" roles=\"\" verbs=\"\" />\n        <add accessType=\"Deny\" users=\"*\" />\n      </authorization>\n    </security>\n  </system.webServer>\n</configuration>\n");
}

/* 계정 파일: data/auth.json — 없으면 기본 계정 생성(admin / ytins2026!) */
function load_auth() {
    ensure_data_dir();
    $f = DATA_DIR . '/auth.json';
    if (!is_file($f)) {
        $auth = ['user' => 'admin', 'hash' => password_hash('ytins2026!', PASSWORD_DEFAULT), 'default_pw' => true];
        file_put_contents($f, json_encode($auth, JSON_UNESCAPED_UNICODE));
        return $auth;
    }
    return json_decode((string)file_get_contents($f), true) ?: [];
}
function save_auth(array $auth) {
    ensure_data_dir();
    file_put_contents(DATA_DIR . '/auth.json', json_encode($auth, JSON_UNESCAPED_UNICODE));
}

function start_session() {
    if (session_status() === PHP_SESSION_ACTIVE) return;
    session_name('YTINSADMIN');
    if (PHP_VERSION_ID >= 70300) {
        session_set_cookie_params(['httponly' => true, 'samesite' => 'Lax', 'path' => '/']);
    } else {
        session_set_cookie_params(0, '/', '', false, true);
    }
    session_start();
}
function is_authed() {
    start_session();
    return !empty($_SESSION['authed']);
}
function csrf_token() {
    start_session();
    if (empty($_SESSION['csrf'])) $_SESSION['csrf'] = bin2hex(random_bytes(24));
    return $_SESSION['csrf'];
}
function check_csrf() {
    start_session();
    $t = $_SERVER['HTTP_X_CSRF'] ?? '';
    return $t !== '' && hash_equals($_SESSION['csrf'] ?? '', $t);
}

/* 로그인 시도 제한: 5회 실패 시 10분 잠금 (data/lock.json) */
function login_locked() {
    $f = DATA_DIR . '/lock.json';
    if (!is_file($f)) return false;
    $j = json_decode((string)file_get_contents($f), true) ?: [];
    if (($j['fails'] ?? 0) >= 5 && time() - ($j['last'] ?? 0) < 600) return true;
    return false;
}
function login_fail() {
    ensure_data_dir();
    $f = DATA_DIR . '/lock.json';
    $j = is_file($f) ? (json_decode((string)file_get_contents($f), true) ?: []) : [];
    if (time() - ($j['last'] ?? 0) > 600) $j = [];
    $j['fails'] = ($j['fails'] ?? 0) + 1;
    $j['last'] = time();
    file_put_contents($f, json_encode($j));
}
function login_ok() {
    @unlink(DATA_DIR . '/lock.json');
}

function json_out($data, $code = 200) {
    http_response_code($code);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}
