# YTINS 홈페이지 관리자(어드민) 안내

개발 지식 없이 브라우저에서 홈페이지 내용을 수정·추가할 수 있는 관리 도구입니다.

서버 백엔드는 두 벌이 들어 있고, 호스팅에 맞는 쪽이 자동으로 쓰입니다.

| 호스팅 환경 | 접속 파일 | API |
|---|---|---|
| **카페24 윈도우 호스팅 (현재 사용)** — html/asp/aspx만 지원 | `admin/index.asp` | `admin/api.asp` (Classic ASP) |
| 리눅스/PHP 호스팅 (예비) | `admin/index.php` | `admin/api.php` (PHP 7.1+) |

## 구성

```
저장소
├── public/          ← 실제 홈페이지 (정적 HTML + assets)
├── admin/           ← 관리자 도구
│   ├── index.asp    ← 관리자 화면 (카페24: /admin/ 접속)
│   ├── api.asp      ← 저장·업로드 API (Classic ASP)
│   ├── web.config   ← IIS 설정 (.mjs MIME 등록 + data/ 접근 차단)
│   ├── index.php / api.php / lib.php ← PHP 호스팅용 예비
│   ├── content.json ← 홈페이지 전체 콘텐츠 데이터
│   ├── render.mjs   ← 콘텐츠 → HTML 생성기 (단일 소스)
│   ├── schema.mjs   ← 편집 폼 정의
│   └── data/        ← 계정·백업 (자동 생성, 웹 접근 차단)
└── build.mjs        ← 개발용 빌드 스크립트 (node build.mjs)
```

동작 원리: 관리자 화면에서 내용을 수정하고 **저장**을 누르면, 브라우저가 `render.mjs`로
5개 HTML 페이지를 새로 생성하고 서버(ASP)가 이를 사이트에 반영합니다.
사이트 자체는 계속 정적 HTML이라 빠르고, 어드민에 문제가 생겨도 사이트는 영향받지 않습니다.
(ASP는 요청 크기 제한이 있어 저장은 페이지별로, 이미지 업로드는 조각으로 나눠 전송합니다 —
모두 자동이며 사용자가 신경 쓸 것은 없습니다.)

## 카페24 배포 방법

1. FTP 접속(ytins.co.kr, 포트 5633) 후 웹 루트(`www/`)에 업로드:
   - `public/` **안의 내용물 전체** → `www/` 바로 아래 (index.html, assets/ 등)
     - 단, `public/admin/`(pages.dev 테스트용 데모)은 올리지 않습니다
   - 저장소의 `admin/` 폴더 → `www/admin/` (api.asp, index.asp, web.config, admin.css,
     admin.js, content.json, render.mjs, schema.mjs — *.php는 안 올려도 됩니다)
2. 스모크 테스트: 브라우저에서 `http://도메인/admin/api.asp?a=state` 접속
   → `{"authed":false,...}` 같은 JSON이 보이면 정상
3. `http://도메인/admin/` (안 열리면 `/admin/index.asp`) 접속
4. 초기 계정 **admin / ytins2026!** 으로 로그인
5. 로그인 직후 **[비밀번호]** 버튼으로 반드시 비밀번호 변경
6. 보안 확인: `http://도메인/admin/data/auth.config` 접속 시 오류(403/404)가 나와야 정상

이후에는 FTP 없이 `/admin`에서 모든 내용을 관리합니다.
(저장/업로드에서 권한 오류가 나면 카페24 파일관리자에서 `www/`와 하위 폴더의
쓰기 권한을 확인하세요.)

## 관리자 화면에서 할 수 있는 것

- 실제 페이지를 보면서 클릭 선택 · 더블클릭 글자 수정 · 드래그로 블록 이동
- 모든 페이지의 문구·제목·설명 수정, 블록/섹션 추가·삭제·순서 변경
- 연혁·실적표·고객사/파트너 로고 추가·삭제·순서 변경
- 로고·인증서 이미지, 회사소개서 PDF **업로드**
- PC/태블릿/모바일 화면 확인, 실행취소(Ctrl+Z)/다시실행
- 저장 전 **미리보기**
- 저장 시 자동 백업 (`admin/data/backup-*.json`, 최근 30개 보관 — 잘못 저장했을 때 복원용)
- 비밀번호 변경 (5회 실패 시 10분 잠금)

## 개발자 참고

- 콘텐츠 구조를 바꾸려면 `admin/render.mjs`(마크업) + `admin/schema.mjs`(편집 폼 라벨) +
  `admin/content.json`(데이터)을 함께 수정
- 로컬 빌드: `node build.mjs` → `public/*.html` 재생성 + pages.dev용 데모 어드민 복사
- ytins.pages.dev/admin 은 **데모 모드**(브라우저에만 저장)이고, 카페24 `/admin`은 실제 반영
- Classic ASP 백엔드는 로컬 테스트가 어려우므로(IIS 필요) 수정 시 서버에 올려 확인
- 비밀번호 초기화: FTP로 `admin/data/auth.config` 삭제 → 다음 접속 시 초기 계정으로 재생성
- PHP 호스팅으로 이전할 경우: `index.php`가 진입점이며 동작은 동일 (`admin/data/`는
  `.htaccess`/`web.config` 자동 생성으로 보호)
