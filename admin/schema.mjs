/* 어드민 편집 폼 스키마 — content.json 구조에 라벨·입력형식을 부여
   spec 표기:
   - "text: 라벨"        한 줄 입력
   - "area: 라벨"        여러 줄 입력 (HTML 태그 <br>, <b> 등 사용 가능)
   - "icon: 라벨"        아이콘 선택
   - "img.<위치>: 라벨"  이미지 파일명 + 업로드 (위치: clients|partners|certs|assets|docs)
   - { _label, _item }   객체 배열 (항목 추가/삭제/순서변경)
   - { _label, _of }     문자열 배열
   - { _label, _cols }   표(문자열 배열의 배열)
   - 일반 객체           하위 필드 그룹 */

export const SECTIONS = [
  { page: "홈", items: [
    { id: "home.meta", title: "검색·브라우저 정보", spec: { title: "text: 브라우저 탭 제목", desc: "area: 검색엔진 설명문" } },
    { id: "home.hero", title: "메인 상단(히어로)", spec: {
      eyebrow: "text: 상단 소제목(영문)",
      line1Before: "text: 제목 1행 (회전단어 앞)",
      rotWords: { _label: "회전 키워드 (3초마다 교체)", _of: "text: 키워드" },
      line1After: "text: 제목 1행 (회전단어 뒤)",
      line2: "text: 제목 2행",
      line3: "text: 제목 3행 (파란 강조)",
      lead: "area: 소개 문단",
      stats: { _label: "핵심 지표", _item: { num: "text: 숫자", unit: "text: 단위(명/억/+)", label: "text: 라벨" } }
    } },
    { id: "home.explore", title: "YTINS 살펴보기", spec: {
      title: "text: 섹션 제목", desc: "area: 섹션 설명",
      cards: { _label: "바로가기 카드", _item: { href: "text: 링크", icon: "icon: 아이콘", no: "text: 번호 라벨", title: "text: 제목", desc: "area: 설명" } }
    } }
  ] },
  { page: "회사소개", items: [
    { id: "company.meta", title: "검색·브라우저 정보", spec: { title: "text: 브라우저 탭 제목", desc: "area: 검색엔진 설명문" } },
    { id: "company.hero", title: "페이지 상단", spec: { eyebrow: "text: 소제목", title: "text: 제목", desc: "area: 설명" } },
    { id: "company.about", title: "회사개요", spec: {
      title: "text: 섹션 제목", desc: "area: 섹션 설명",
      rows: { _label: "회사 정보 표", _item: { th: "text: 항목명", td: "area: 내용 (<br>로 줄바꿈)" } },
      cards: { _label: "지표 카드", _item: { icon: "icon: 아이콘", num: "text: 숫자", unit: "text: 단위", label: "text: 라벨" } }
    } },
    { id: "company.ceo", title: "대표인사말", spec: {
      title: "text: 섹션 제목", lead: "area: 강조 문구 (<br>로 줄바꿈)",
      paras: { _label: "본문 문단", _of: "area: 문단" },
      name: "text: 대표자 이름", role: "text: 직함"
    } },
    { id: "company.history", title: "연혁", spec: {
      title: "text: 섹션 제목", desc: "area: 섹션 설명",
      items: { _label: "연도별 연혁", _item: { year: "text: 연도", rows: { _label: "내용", _of: "text: 항목" } } }
    } },
    { id: "company.org", title: "조직도", spec: {
      title: "text: 섹션 제목", desc: "area: 섹션 설명", top: "text: 최상위 (대표이사)",
      staff: { _label: "직속 조직", _of: "text: 조직명" },
      divs: { _label: "사업본부", _item: { head: "text: 본부명", team: "text: 담당 업무" } },
      statLabel: "text: 하단 지표 라벨", statNum: "text: 숫자", statUnit: "text: 단위"
    } },
    { id: "company.certs", title: "인증현황", spec: {
      title: "text: 섹션 제목", desc: "area: 섹션 설명",
      items: { _label: "인증서", _item: { img: "img.certs: 인증서 이미지", alt: "text: 이미지 설명(스크린리더용)", name: "text: 인증서명", meta: "text: 부가 설명" } }
    } },
    { id: "company.location", title: "오시는길", spec: {
      title: "text: 섹션 제목", desc: "area: 섹션 설명", mapSrc: "area: 구글지도 embed 주소",
      rows: { _label: "연락처 표", _item: { th: "text: 항목명", td: "area: 내용" } },
      naverUrl: "text: 네이버지도 링크", naverLabel: "text: 버튼 문구"
    } },
    { id: "company.brochure", title: "회사소개서", spec: { title: "text: 섹션 제목", desc: "area: 섹션 설명", file: "img.docs: PDF 파일", btnLabel: "text: 버튼 문구" } }
  ] },
  { page: "사업분야", items: [
    { id: "business.meta", title: "검색·브라우저 정보", spec: { title: "text: 브라우저 탭 제목", desc: "area: 검색엔진 설명문" } },
    { id: "business.hero", title: "페이지 상단", spec: { eyebrow: "text: 소제목", title: "text: 제목", desc: "area: 설명" } },
    { id: "business.sections", title: "페이지 구성 (블록 편집)", sectionsEditor: true }
  ] },
    { page: "Solution", items: [
    { id: "solution.meta", title: "검색·브라우저 정보", spec: { title: "text: 브라우저 탭 제목", desc: "area: 검색엔진 설명문" } },
    { id: "solution.hero", title: "페이지 상단", spec: { eyebrow: "text: 소제목", title: "text: 제목", desc: "area: 설명" } },
    { id: "solution.sections", title: "페이지 구성 (블록 편집)", sectionsEditor: true }
  ] },
    { page: "레퍼런스", items: [
    { id: "reference.meta", title: "검색·브라우저 정보", spec: { title: "text: 브라우저 탭 제목", desc: "area: 검색엔진 설명문" } },
    { id: "reference.hero", title: "페이지 상단", spec: { eyebrow: "text: 소제목", title: "text: 제목", desc: "area: 설명" } },
    { id: "reference.clients", title: "고객사 로고", spec: {
      title: "text: 섹션 제목", desc: "area: 섹션 설명",
      logos: { _label: "고객사 로고", _item: { img: "img.clients: 로고 이미지", name: "text: 기관명" } }
    } },
    { id: "reference.partners", title: "파트너사", spec: {
      title: "text: 섹션 제목", desc: "area: 섹션 설명",
      groups: { _label: "파트너 그룹", _item: { title: "text: 그룹명", sub: "text: 그룹 설명", logos: { _label: "로고", _item: { img: "img.partners: 로고 이미지", name: "text: 회사명", fallback: "text: 로고 없을 때 표시할 텍스트(비워도 됨)" } } } }
    } },
    { id: "reference.performance", title: "주요 실적", spec: {
      title: "text: 섹션 제목", desc: "area: 섹션 설명",
      years: { _label: "연도별 실적", _item: { year: "text: 연도", rows: { _label: "실적", _cols: ["사업명", "발주처", "사업기간"] } } },
      bigdata: { title: "text: 표 제목", desc: "area: 표 설명", rows: { _label: "실적", _cols: ["발주처", "사업명", "사업기간", "구분"] } },
      cloud: { title: "text: 표 제목", desc: "area: 표 설명", rows: { _label: "실적", _cols: ["발주처", "사업명", "사업기간", "산업"] } },
      note: "text: 하단 주석"
    } }
  ] },
  { page: "공통", items: [
    { id: "nav", title: "상단 메뉴", spec: {
      brand: "text: 로고 옆 회사명",
      groups: { _label: "메뉴 그룹", _item: { key: "text: 구분키(수정 비권장)", label: "text: 메뉴명", href: "text: 링크", subs: { _label: "하위 메뉴", _item: { href: "text: 링크", label: "text: 메뉴명" } } } }
    } },
    { id: "footer", title: "푸터(하단 정보)", spec: {
      slogan: "text: 슬로건", company: "text: 회사명", ceo: "text: 대표자",
      address: "text: 주소", tel: "text: 전화", fax: "text: 팩스", email: "text: 이메일",
      url: "text: 홈페이지 주소(링크)", urlLabel: "text: 홈페이지 표시 텍스트", copyright: "text: 저작권 문구"
    } },
    { id: "contact", title: "우측 하단 연락처 버튼", spec: { email: "text: 이메일", tel: "text: 전화(표시용)", telLink: "text: 전화(숫자만, 링크용)" } }
  ] }
];

/* ---------- 블록 에디터: 사업분야·Solution 페이지 구성용 ---------- */
export const BLOCKS = {
  desc: { name: "섹션 설명문", spec: { text: "area: 내용" },
    empty: { type: "desc", text: "" } },
  subhead: { name: "소제목 + 설명", spec: { title: "text: 소제목", desc: "area: 설명 (비우면 생략)", tight: "check: 위 여백 줄이기" },
    empty: { type: "subhead", title: "소제목", desc: "", tight: false } },
  flow: { name: "단계 다이어그램 (화살표 흐름)", spec: { steps: { _label: "단계", _item: { t: "text: 단계명", s: "text: 부연 (비워도 됨)" } }, style: "text: 여백 스타일 (고급 · 비워도 됨)" },
    empty: { type: "flow", steps: [{ t: "1단계", s: "" }, { t: "2단계", s: "" }, { t: "3단계", s: "" }], style: "" } },
  numbered: { name: "번호 카드 (01~04)", spec: { items: { _label: "카드", _item: { icon: "icon: 아이콘 (선택)", title: "text: 제목", badge: "text: 파란 배지 (비워도 됨)", desc: "area: 설명" } } },
    empty: { type: "numbered", items: [{ icon: "", title: "제목", badge: "", desc: "" }] } },
  featgrid: { name: "특징 카드 (아이콘+제목+설명)", spec: { feats: { _label: "카드", _item: { icon: "icon: 아이콘", b: "text: 제목", s: "text: 설명" } } },
    empty: { type: "featgrid", feats: [{ icon: "target", b: "제목", s: "설명" }] } },
  duo: { name: "좌우 패널 (검정/파랑)", spec: { panels: { _label: "패널 (2개)", _item: { kicker: "text: 상단 라벨", title: "text: 패널 제목", items: { _label: "항목", _item: { b: "text: 제목", s: "text: 설명" } } } } },
    empty: { type: "duo", panels: [{ kicker: "LEFT", title: "왼쪽 패널", items: [{ b: "항목", s: "" }] }, { kicker: "RIGHT", title: "오른쪽 패널", items: [{ b: "항목", s: "" }] }] } },
  duospec: { name: "Before/After 패널 (경고 목록 + 기술표)", spec: {
      before: { kicker: "text: 좌측 라벨", title: "text: 좌측 제목", items: { _label: "항목", _of: "text: 항목" } },
      after: { kicker: "text: 우측 라벨", title: "text: 우측 제목", spec: { _label: "기술 표", _item: { th: "text: 구분", td: "text: 내용" } } } },
    empty: { type: "duospec", before: { kicker: "Before", title: "", items: [""] }, after: { kicker: "After", title: "", spec: [{ th: "", td: "" }] } } },
  phases: { name: "방법론 단계 (계획~운영)", spec: { items: { _label: "단계", _item: { ph: "text: 단계명", items: { _label: "세부 항목", _of: "text: 항목" } } } },
    empty: { type: "phases", items: [{ ph: "단계", items: ["항목"] }] } },
  checks: { name: "체크 리스트 (✓)", spec: { items: { _label: "항목", _item: { b: "text: 제목", s: "text: 설명" } } },
    empty: { type: "checks", items: [{ b: "제목", s: "설명" }] } },
  tags: { name: "태그 나열 (모바일 자동 흐름)", spec: { tags: { _label: "태그", _of: "text: 태그" } },
    empty: { type: "tags", tags: ["태그"] } },
  found: { name: "기반 도식 (4요소 + 기반 바)", spec: {
      p4: { _label: "상단 4요소", _item: { icon: "icon: 아이콘", b: "text: 제목", s: "text: 설명" } },
      base: { bt: "text: 기반 문구", cols: { _label: "기반 구성", _item: { icon: "icon: 아이콘 (선택)", b: "text: 제목", s: "text: 설명" } } } },
    empty: { type: "found", p4: [{ icon: "clipboard", b: "제목", s: "설명" }], base: { bt: "기반 문구", cols: [{ icon: "", b: "제목", s: "설명" }] } } },
  cp: { name: "클라우드 파트너십 (로고 배너)", spec: { kicker: "text: 상단 라벨", head: "text: 제목", sub: "area: 설명", logo1: "img.partners: 로고 1", logo2: "img.partners: 로고 2" },
    empty: { type: "cp", kicker: "Partnership", head: "제목", sub: "", logo1: "", logo2: "" } },
  bar: { name: "하단 정보 바 (주요 고객 등)", spec: { t: "text: 라벨", list: "area: 내용" },
    empty: { type: "bar", t: "라벨", list: "" } },
  stack: { name: "레이어 스택 (상위/기반)", spec: { layers: { _label: "레이어", _item: { icon: "icon: 아이콘", sub: "text: 레이어 라벨", title: "text: 레이어 제목", img: "img.assets: 우측 일러스트 (PC 전용 · 비워도 됨)", items: { _label: "설명 항목", _of: "text: 항목" } } } },
    empty: { type: "stack", layers: [{ icon: "chart", sub: "상위 레이어", title: "제목", items: ["항목"] }, { icon: "database", sub: "기반 레이어", title: "제목", items: ["항목"] }] } },
  ssd: { name: "스마트심사 구성도", spec: {
      sysLabel: "text: 상단 시스템 라벨",
      eng1: { tag: "text: 좌측 태그", nm: "text: 좌측 영문명", ko: "text: 좌측 한글명", items: { _label: "기능 (첫 항목이 연동 강조)", _of: "text: 기능" } },
      bridge: "text: 연동 배지 문구",
      eng2: { tag: "text: 우측 태그", nm: "text: 우측 영문명", ko: "text: 우측 한글명", items: { _label: "기능 (첫 항목이 연동 강조)", _of: "text: 기능" } },
      db: { b: "text: DB 이름", em: "text: DB 설명" },
      sys2Label: "text: 하단 시스템 라벨",
      comps: { _label: "하단 구성요소", _item: { icon: "icon: 아이콘", b: "text: 이름" } } },
    empty: { type: "ssd", sysLabel: "시스템", eng1: { tag: "A", nm: "", ko: "", items: [""] }, bridge: "REST API", eng2: { tag: "B", nm: "", ko: "", items: [""] }, db: { b: "통합 DB", em: "" }, sys2Label: "시스템", comps: [{ icon: "cloud", b: "구성요소" }] } },
  lhref: { name: "대표 레퍼런스 (카드 + 포인트)", spec: {
      title: "text: 소제목", logo: "img.assets: 제목 로고 (비우면 텍스트 그대로)", logoText: "text: 로고로 대체할 제목 속 문구",
      cardTitle: "text: 카드 제목", cardLogo: "img.assets: 카드 제목 로고 (비우면 텍스트)", cardDesc: "area: 카드 설명",
      points: { _label: "주요 내용 (우측 박스)", _of: "text: 항목" } },
    empty: { type: "lhref", title: "대표 레퍼런스", cardTitle: "", cardLogo: "", cardDesc: "", points: [""], logo: "", logoText: "" } },
  image: { name: "이미지 (도식·사진 업로드)", spec: { src: "img.assets: 이미지 파일", alt: "text: 이미지 설명", caption: "text: 캡션 (비워도 됨)", maxw: "text: 최대 폭 px (비우면 전체 폭)" },
    empty: { type: "image", src: "", alt: "", caption: "", maxw: "" } },
  html: { name: "자유 HTML (고급)", spec: { code: "area: HTML 코드" },
    empty: { type: "html", code: "" } },
};
