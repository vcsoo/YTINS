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
    { id: "business.dxax", title: "DX & AX", spec: {
      title: "text: 섹션 제목", desc: "area: 섹션 설명",
      flow: { _label: "단계 다이어그램", _item: { t: "text: 단계명", s: "text: 부연" } },
      panels: { _label: "DX/AX 패널 (2개)", _item: { kicker: "text: 상단 라벨", title: "text: 패널 제목", items: { _label: "항목", _item: { b: "text: 제목", s: "text: 설명" } } } },
      bar: { t: "text: 하단 바 라벨", list: "area: 하단 바 내용" }
    } },
    { id: "business.si", title: "SI", spec: {
      title: "text: 섹션 제목", desc: "area: 섹션 설명",
      numbered: { _label: "01~04 카드", _item: { title: "text: 제목", desc: "area: 설명" } },
      egov: { title: "text: 소제목", desc: "area: 설명", feats: { _label: "특징 카드", _item: { icon: "icon: 아이콘", b: "text: 제목", s: "text: 설명" } } },
      method: { title: "text: 소제목", desc: "area: 설명", phases: { _label: "방법론 단계", _item: { ph: "text: 단계명", items: { _label: "세부 항목", _of: "text: 항목" } } } },
      bar: { t: "text: 하단 바 라벨", list: "area: 하단 바 내용" }
    } },
    { id: "business.ito", title: "ITO", spec: {
      title: "text: 섹션 제목", desc: "area: 섹션 설명",
      p4: { _label: "상단 4요소", _item: { icon: "icon: 아이콘", b: "text: 제목", s: "text: 설명" } },
      base: { bt: "text: 기반 문구", cols: { _label: "기반 구성", _item: { b: "text: 제목", s: "text: 설명" } } },
      bar: { t: "text: 하단 바 라벨", list: "area: 하단 바 내용" }
    } },
    { id: "business.bigdata", title: "BigData·AI", spec: {
      title: "text: 섹션 제목", desc: "area: 섹션 설명",
      flow: { _label: "단계 다이어그램", _item: { t: "text: 단계명", s: "text: 부연" } },
      numbered: { _label: "01~04 카드", _item: { title: "text: 제목", desc: "area: 설명" } },
      tagsTitle: "text: 역량 소제목", tagsDesc: "area: 역량 설명",
      tags: { _label: "역량 태그", _of: "text: 태그" },
      featsTitle: "text: 가치 소제목",
      feats: { _label: "가치 카드", _item: { icon: "icon: 아이콘", b: "text: 제목", s: "text: 설명" } }
    } },
    { id: "business.cloud", title: "클라우드", spec: {
      title: "text: 섹션 제목", desc: "area: 섹션 설명",
      lineupTitle: "text: 라인업 소제목", lineupDesc: "area: 라인업 설명",
      numbered: { _label: "01~04 카드", _item: { title: "text: 제목", badge: "text: 파란 배지", desc: "area: 설명" } },
      checksTitle: "text: 역량 소제목", checksDesc: "area: 역량 설명",
      checks: { _label: "체크 리스트", _item: { b: "text: 제목", s: "text: 설명" } },
      flow: { _label: "단계 다이어그램", _item: { t: "text: 단계명", s: "text: 부연" } },
      cp: { kicker: "text: 파트너십 라벨", head: "text: 파트너십 제목", sub: "area: 파트너십 설명", logo1: "img.partners: 로고 1", logo2: "img.partners: 로고 2" },
      bar: { t: "text: 하단 바 라벨", list: "area: 하단 바 내용" }
    } }
  ] },
  { page: "Solution", items: [
    { id: "solution.meta", title: "검색·브라우저 정보", spec: { title: "text: 브라우저 탭 제목", desc: "area: 검색엔진 설명문" } },
    { id: "solution.hero", title: "페이지 상단", spec: { eyebrow: "text: 소제목", title: "text: 제목", desc: "area: 설명" } },
    { id: "solution.hadoop", title: "빅데이터 플랫폼 (Hadoop)SW", spec: {
      title: "text: 섹션 제목", desc: "area: 섹션 설명",
      before: { kicker: "text: 좌측 패널 라벨", title: "text: 좌측 패널 제목", items: { _label: "한계 항목", _of: "text: 항목" } },
      after: { kicker: "text: 우측 패널 라벨", title: "text: 우측 패널 제목", spec: { _label: "기술 스택 표", _item: { th: "text: 구분", td: "text: 기술" } } },
      flow1: { _label: "전환 단계", _item: { t: "text: 단계명", s: "text: 부연(비워도 됨)" } },
      aiTitle: "text: AI 분석 소제목", aiDesc: "area: AI 분석 설명",
      flow2: { _label: "AI 분석 단계", _item: { t: "text: 단계명", s: "text: 부연" } },
      monTitle: "text: 통합관리 소제목", monDesc: "area: 통합관리 설명",
      monFeats: { _label: "통합관리 카드", _item: { icon: "icon: 아이콘", b: "text: 제목", s: "text: 설명" } },
      bar: { t: "text: 하단 바 라벨", list: "area: 하단 바 내용" }
    } },
    { id: "solution.dataai", title: "Data & AI Solution", spec: {
      title: "text: 섹션 제목", desc: "area: 섹션 설명",
      flow: { _label: "단계 다이어그램", _item: { t: "text: 단계명", s: "text: 부연" } },
      layers: { _label: "레이어 (상위/기반)", _item: { icon: "icon: 아이콘", sub: "text: 레이어 라벨", title: "text: 레이어 제목", items: { _label: "설명 항목", _of: "text: 항목" } } },
      featsTitle: "text: 차별화 소제목",
      feats: { _label: "차별화 카드", _item: { icon: "icon: 아이콘", b: "text: 제목", s: "text: 설명" } },
      bar: { t: "text: 하단 바 라벨", list: "area: 하단 바 내용" }
    } },
    { id: "solution.smart", title: "스마트심사 Solution", spec: {
      title: "text: 섹션 제목", desc: "area: 섹션 설명",
      ssdTitle: "text: 구성도 소제목", ssdDesc: "area: 구성도 설명 (<b>강조</b> 가능)",
      ssd: {
        sysLabel: "text: 상단 시스템 라벨",
        eng1: { tag: "text: 좌측 태그", nm: "text: 좌측 영문명", ko: "text: 좌측 한글명", items: { _label: "기능 (첫 항목이 REST 연동 강조)", _of: "text: 기능" } },
        bridge: "text: 연동 배지 문구",
        eng2: { tag: "text: 우측 태그", nm: "text: 우측 영문명", ko: "text: 우측 한글명", items: { _label: "기능 (첫 항목이 REST 연동 강조)", _of: "text: 기능" } },
        db: { b: "text: DB 이름", em: "text: DB 설명" },
        sys2Label: "text: 하단 시스템 라벨",
        comps: { _label: "하단 구성요소", _item: { icon: "icon: 아이콘", b: "text: 이름" } }
      },
      lh: {
        title: "text: 레퍼런스 소제목", cardTitle: "text: 카드 제목", cardDesc: "area: 카드 설명",
        points: { _label: "주요 내용", _of: "text: 항목" },
        years: { _label: "연도별 이력", _item: { num: "text: 연도", label: "area: 내용" } }
      }
    } }
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
