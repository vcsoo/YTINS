<%@ Language="JScript" CodePage="65001" %>
<%
/* YTINS 어드민 API — Classic ASP(JScript) 버전 (카페24 윈도우 호스팅용)
   프런트(admin.js)는 PHP 버전과 동일. 저장/업로드는 조각 전송 프로토콜:
   a=state|login|logout|chpass|save-content|save-page&f=..|upload-begin|upload-chunk|upload-end */
Response.Charset = "utf-8";
Response.CodePage = 65001;
Response.Buffer = true;

var FSO = Server.CreateObject("Scripting.FileSystemObject");
var DATA = Server.MapPath("data");
var SITEROOT = Server.MapPath("..");
var PAGES = { "index.html":1, "company.html":1, "business.html":1, "solution.html":1, "reference.html":1 };
var UPDIRS = { "clients":"\\assets\\clients", "partners":"\\assets\\partners", "certs":"\\assets\\certs", "assets":"\\assets", "docs":"\\assets\\docs" };

function ensureData() { if (!FSO.FolderExists(DATA)) FSO.CreateFolder(DATA); }
function jesc(s) {
  s = String(s == null ? "" : s);
  return s.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\r/g, "\\r").replace(/\n/g, "\\n").replace(/\t/g, "\\t");
}
function out(json, status) {
  if (status) Response.Status = status;
  Response.ContentType = "application/json";
  Response.Write(json);
  Response.End();
}
function ok() { out('{"ok":true}'); }
function err(msg, status) { out('{"ok":false,"error":"' + jesc(msg) + '"}', status || "400 Bad Request"); }

/* ---------- 파일 IO (UTF-8, BOM 없이) ---------- */
function readText(path) {
  if (!FSO.FileExists(path)) return null;
  var st = Server.CreateObject("ADODB.Stream");
  st.Type = 2; st.Charset = "utf-8"; st.Open(); st.LoadFromFile(path);
  var t = st.ReadText(-1); st.Close();
  return t;
}
function writeText(path, text) {
  var st = Server.CreateObject("ADODB.Stream");
  st.Type = 2; st.Charset = "utf-8"; st.Open(); st.WriteText(text);
  st.Position = 0; st.Type = 1; st.Position = 3; /* BOM 제거 */
  var bin = Server.CreateObject("ADODB.Stream");
  bin.Type = 1; bin.Open();
  st.CopyTo(bin);
  st.Close();
  bin.SaveToFile(path, 2 /* overwrite */);
  bin.Close();
}
function readBody() { /* 요청 본문을 UTF-8 텍스트로 */
  var n = Request.TotalBytes;
  if (!n) return "";
  var b = Request.BinaryRead(n);
  var st = Server.CreateObject("ADODB.Stream");
  st.Type = 1; st.Open(); st.Write(b);
  st.Position = 0; st.Type = 2; st.Charset = "utf-8";
  var t = st.ReadText(-1); st.Close();
  return t;
}
function b64ToFile(b64, path) {
  var d = Server.CreateObject("MSXML2.DOMDocument.6.0");
  var el = d.createElement("b");
  el.dataType = "bin.base64";
  el.text = b64;
  var st = Server.CreateObject("ADODB.Stream");
  st.Type = 1; st.Open(); st.Write(el.nodeTypedValue);
  st.SaveToFile(path, 2); st.Close();
}

/* ---------- SHA-256 (.NET COM · aspx 지원 서버에는 항상 존재) ---------- */
function sha256hex(s) {
  var enc = Server.CreateObject("System.Text.UTF8Encoding");
  var sha = Server.CreateObject("System.Security.Cryptography.SHA256Managed");
  var bytes = enc.GetBytes_4(s);
  var hash = new VBArray(sha.ComputeHash_2(bytes)).toArray();
  var hex = "";
  for (var i = 0; i < hash.length; i++) {
    var v = hash[i] < 0 ? hash[i] + 256 : hash[i];
    hex += (v < 16 ? "0" : "") + v.toString(16);
  }
  return hex;
}
function randToken() { return sha256hex(Math.random() + "|" + new Date().getTime() + "|" + Math.random()); }

/* ---------- 계정 (data/auth.config: user|salt|hash|default유무) ---------- */
function loadAuth() {
  ensureData();
  var p = DATA + "\\auth.config";
  var t = readText(p);
  if (t == null) {
    var salt = randToken().substring(0, 16);
    var a = { user: "admin", salt: salt, hash: sha256hex(salt + ":" + "ytins2026!"), def: "1" };
    writeText(p, a.user + "|" + a.salt + "|" + a.hash + "|" + a.def);
    return a;
  }
  var parts = t.replace(/^\s+|\s+$/g, "").split("|");
  return { user: parts[0], salt: parts[1], hash: parts[2], def: parts[3] || "" };
}
function saveAuth(a) {
  ensureData();
  writeText(DATA + "\\auth.config", a.user + "|" + a.salt + "|" + a.hash + "|" + (a.def || ""));
}

/* ---------- 로그인 잠금 (5회 실패 → 10분) ---------- */
function lockInfo() {
  var t = readText(DATA + "\\lock.config");
  if (t == null) return { fails: 0, last: 0 };
  var p = t.split("|");
  return { fails: parseInt(p[0], 10) || 0, last: parseFloat(p[1]) || 0 };
}
function isLocked() {
  var l = lockInfo();
  return l.fails >= 5 && (new Date().getTime() - l.last) < 600000;
}
function loginFail() {
  ensureData();
  var l = lockInfo();
  if (new Date().getTime() - l.last > 600000) l = { fails: 0, last: 0 };
  writeText(DATA + "\\lock.config", (l.fails + 1) + "|" + new Date().getTime());
}
function loginOk() { var p = DATA + "\\lock.config"; if (FSO.FileExists(p)) FSO.DeleteFile(p); }

function authed() { return Session("authed") == "1"; }
function csrf() {
  if (!Session("csrf")) Session("csrf") = randToken();
  return Session("csrf");
}
function checkCsrf() {
  var t = Request.ServerVariables("HTTP_X_CSRF") + "";
  return t !== "" && Session("csrf") && t == Session("csrf");
}

/* ---------- 라우팅 ---------- */
var a = Request.QueryString("a") + "";
var method = Request.ServerVariables("REQUEST_METHOD") + "";

if (a == "state") {
  var au = loadAuth();
  if (authed()) out('{"authed":true,"user":"' + jesc(au.user) + '","csrf":"' + csrf() + '","defaultPw":' + (au.def == "1" ? "true" : "false") + "}");
  out('{"authed":false,"user":null,"csrf":null,"defaultPw":null}');
}

if (a == "login" && method == "POST") {
  if (isLocked()) err("로그인 시도가 너무 많습니다. 10분 후 다시 시도해 주세요.", "429 Too Many");
  var au = loadAuth();
  var u = Request.Form("user") + "", pw = Request.Form("pass") + "";
  if (u == au.user && sha256hex(au.salt + ":" + pw) == au.hash) {
    Session("authed") = "1";
    Session("csrf") = randToken();
    loginOk();
    out('{"ok":true,"csrf":"' + Session("csrf") + '","defaultPw":' + (au.def == "1" ? "true" : "false") + "}");
  }
  loginFail();
  err("아이디 또는 비밀번호가 올바르지 않습니다.", "401 Unauthorized");
}

if (!authed()) err("로그인이 필요합니다.", "401 Unauthorized");

if (a == "logout" && method == "POST") { Session.Contents.RemoveAll(); ok(); }

if (method == "POST" && !checkCsrf()) err("보안 토큰이 유효하지 않습니다. 새로고침 후 다시 시도해 주세요.", "403 Forbidden");

if (a == "save-content" && method == "POST") {
  var body = readBody();
  if (body.length < 100) err("콘텐츠가 비정상입니다.");
  ensureData();
  /* 백업 (최근 30개 유지) */
  var cur = Server.MapPath("content.json");
  if (FSO.FileExists(cur)) {
    var now = new Date();
    function p2(n) { return (n < 10 ? "0" : "") + n; }
    var stamp = now.getFullYear() + p2(now.getMonth() + 1) + p2(now.getDate()) + "-" + p2(now.getHours()) + p2(now.getMinutes()) + p2(now.getSeconds());
    FSO.CopyFile(cur, DATA + "\\backup-" + stamp + ".json", true);
    var names = [], e = new Enumerator(FSO.GetFolder(DATA).Files);
    for (; !e.atEnd(); e.moveNext()) { var nm = e.item().Name; if (nm.indexOf("backup-") == 0) names.push(nm); }
    names.sort();
    while (names.length > 30) { FSO.DeleteFile(DATA + "\\" + names[0]); names.shift(); }
  }
  writeText(cur, body);
  ok();
}

if (a == "save-page" && method == "POST") {
  var f = Request.QueryString("f") + "";
  if (!PAGES[f]) err("허용되지 않은 파일: " + f);
  var html = readBody();
  if (html.length < 1000) err("생성된 페이지가 비정상입니다: " + f);
  writeText(SITEROOT + "\\" + f, html);
  ok();
}

if (a == "upload-begin" && method == "POST") {
  var dir = Request.QueryString("dir") + "", name = Request.QueryString("name") + "";
  if (!UPDIRS[dir]) err("허용되지 않은 업로드 위치입니다.");
  if (!/^[A-Za-z0-9._-]+$/.test(name)) err("파일명은 영문·숫자·하이픈만 사용할 수 있습니다. 예: new-client.png");
  var ext = name.substring(name.lastIndexOf(".") + 1).toLowerCase();
  var okExt = dir == "docs" ? { pdf: 1 } : { png: 1, jpg: 1, jpeg: 1, webp: 1, svg: 1, gif: 1 };
  if (!okExt[ext]) err("허용되지 않은 파일 형식입니다.");
  ensureData();
  Session("up_dir") = dir;
  Session("up_name") = name;
  var tmp = DATA + "\\upload.tmp";
  if (FSO.FileExists(tmp)) FSO.DeleteFile(tmp);
  FSO.CreateTextFile(tmp, true).Close();
  ok();
}

if (a == "upload-chunk" && method == "POST") {
  if (!Session("up_name")) err("업로드 세션이 없습니다.");
  var chunk = readBody().replace(/[^A-Za-z0-9+\/=]/g, "");
  var ts = FSO.OpenTextFile(DATA + "\\upload.tmp", 8 /* append */, false);
  ts.Write(chunk);
  ts.Close();
  ok();
}

if (a == "upload-end" && method == "POST") {
  var dir = Session("up_dir") + "", name = Session("up_name") + "";
  if (!name || !UPDIRS[dir]) err("업로드 세션이 없습니다.");
  var b64 = readText(DATA + "\\upload.tmp");
  if (!b64 || b64.length < 8) err("업로드 데이터가 없습니다.");
  var destDir = SITEROOT + UPDIRS[dir];
  if (!FSO.FolderExists(destDir)) FSO.CreateFolder(destDir);
  b64ToFile(b64, destDir + "\\" + name);
  FSO.DeleteFile(DATA + "\\upload.tmp");
  Session("up_dir") = ""; Session("up_name") = "";
  var rel = UPDIRS[dir].replace(/\\/g, "/").substring(1) + "/" + name;
  out('{"ok":true,"path":"' + jesc(rel) + '","name":"' + jesc(name) + '"}');
}

if (a == "chpass" && method == "POST") {
  var au = loadAuth();
  var oldPw = Request.Form("old") + "", newPw = Request.Form("new") + "";
  if (sha256hex(au.salt + ":" + oldPw) != au.hash) err("현재 비밀번호가 올바르지 않습니다.");
  if (newPw.length < 8) err("새 비밀번호는 8자 이상이어야 합니다.");
  au.salt = randToken().substring(0, 16);
  au.hash = sha256hex(au.salt + ":" + newPw);
  au.def = "";
  saveAuth(au);
  ok();
}

err("알 수 없는 요청입니다.", "404 Not Found");
%>
