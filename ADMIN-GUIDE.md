# YTINS 홈페이지 관리자(어드민) 안내

개발 지식 없이 브라우저에서 홈페이지 내용을 수정·추가할 수 있는 관리 도구입니다.
PHP가 실행되는 호스팅이면 동작합니다 (리눅스 Apache / 윈도우 IIS 모두 지원 — PHP 7.1 이상).

> **카페24 윈도우 광호스팅 사용 시**: 호스팅 관리에서 **PHP 사용 가능 여부·버전**을 먼저
> 확인하세요. IIS 환경에서는 `admin/data/` 보호가 `.htaccess` 대신 자동 생성되는
> `web.config`로 적용됩니다. MS-SQL DB는 사용하지 않으므로 설정할 것이 없습니다.

## 구성

```
저장소
├── public/          ← 실제 홈페이지 (정적 HTML + assets)
├── admin/           ← 관리자 도구 (PHP + JS)
│   ├── index.php    ← 관리자 화면 (/admin 접속)
│   ├── api.php      ← 저장·업로드 API
│   ├── content.json ← 홈페이지 전체 콘텐츠 데이터
│   ├── render.mjs   ← 콘텐츠 → HTML 생성기 (단일 소스)
│   └── data/        ← 계정·백업 (자동 생성, 웹 접근 차단)
└── build.mjs        ← 개발용 빌드 스크립트 (node build.mjs)
```

동작 원리: 관리자 화면에서 내용을 수정하고 **저장**을 누르면, 브라우저가 `render.mjs`로
5개 HTML 페이지를 새로 생성하고 서버(PHP)가 이를 사이트에 반영합니다.
사이트 자체는 계속 정적 HTML이라 빠르고, 어드민에 문제가 생겨도 사이트는 영향받지 않습니다.

## 카페24 배포 방법

1. FTP 접속 후 웹 루트(`www/`)에 업로드:
   - `public/` **안의 내용물 전체** → `www/` 바로 아래 (index.html, assets/ 등)
   - `admin/` 폴더 → `www/admin/`
2. 브라우저에서 `https://도메인/admin/` 접속
3. 초기 계정 **admin / ytins2026!** 으로 로그인
4. 로그인 직후 **[비밀번호 변경]** 으로 반드시 비밀번호 변경

이후에는 FTP 없이 `/admin`에서 모든 내용을 관리합니다.
(파일 권한 오류가 나면 `www/`와 하위 폴더에 쓰기 권한(705/707)을 확인하세요.)

## 관리자 화면에서 할 수 있는 것

- 모든 페이지의 문구·제목·설명 수정
- 연혁·실적표·고객사/파트너 로고 **추가·삭제·순서 변경**
- 로고·인증서 이미지, 회사소개서 PDF **업로드**
- 저장 전 **미리보기**
- 저장 시 자동 백업 (`admin/data/backup-*.json`, 최근 30개 보관 — 잘못 저장했을 때 복원용)
- 비밀번호 변경 (5회 실패 시 10분 잠금)

## 개발자 참고

- 콘텐츠 구조를 바꾸려면 `admin/render.mjs`(마크업) + `admin/schema.mjs`(편집 폼 라벨) +
  `admin/content.json`(데이터)을 함께 수정
- 로컬 빌드: `node build.mjs` → `public/*.html` 재생성
- 로컬 어드민 테스트: `admin/data/config.json`에 `{"site_root": "<public 절대경로>"}` 지정 후
  `ln -s ../admin public/admin && php -S 127.0.0.1:8123 -t public` (symlink는 커밋 금지)
- 비밀번호 초기화: `admin/data/auth.json` 삭제 → 다음 접속 시 초기 계정으로 재생성
