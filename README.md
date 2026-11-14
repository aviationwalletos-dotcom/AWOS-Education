# AWOS 교육 (awos-edu)

비행교육원 교관과 학생이 함께 쓰는 종합 교보재 솔루션입니다. G1000 Trainer · Maneuver · Pre-flight · Local Procedure · Navaids 를 담습니다.

AWOS 앱과 같은 기술(React · TypeScript · Vite · Tailwind)과 같은 화면 틀(흰 머리 · 왼쪽 메뉴 레일 · 카드)을 쓰는 **독립 프로젝트**입니다.
따로 키우다가 언제든 AWOS 도메인의 `/edu/` 아래에 붙일 수 있게 만들었습니다.

지금은 **뼈대와 메뉴 트리만** 있습니다. 메뉴를 누르면 "준비 중" 자리 화면에 들어갈 기능 목록이 보입니다.

## 메뉴 트리

- **G1000 Trainer** `/g1000` — C172S NAV III 기준 G1000 조작 연습
  - PFD 기본 조작 `/g1000/pfd` — 노브와 소프트키로 PFD 를 다룬다
  - Fix-to-Fix `/g1000/fix-to-fix` — 지금 위치에서 다른 Fix 로 바로 가는 연습
  - Holding Entry `/g1000/holding-entry` — 체공 진입 방식 고르기와 진입 비행
  - 통합 과제 `/g1000/task` — Fix-to-Fix 와 Holding 을 이어서 하는 평가
  - 연습 기록 `/g1000/history` — 내가 한 연습과 평가 결과
- **Maneuver** `/maneuver` — 과정별 기동 절차와 수행 기준
  - 기동 목록 `/maneuver/list` — 과정 · 기종별 기동
  - 절차 · 수행 기준 `/maneuver/procedure` — 기동 하나의 순서와 기준
  - 자주 나오는 오류 `/maneuver/errors` — 기동별 흔한 실수와 교정
  - 평가표 `/maneuver/grade` — 교관이 기동별로 매기는 평가
- **Pre-flight** `/preflight` — 비행 전 확인
  - 서류 · 탑재물 `/preflight/documents` — 비행 전에 확인할 서류와 탑재물
  - 외부점검 `/preflight/walkaround` — 기종별 외부점검 순서
  - 중량 · 균형, 성능 `/preflight/weight-balance` — 중량 · 균형과 성능 계산 연습
  - 체크리스트 `/preflight/checklist` — 단계별 체크리스트 익히기
- **Local Procedure** `/local` — 교육원 · 비행장별 절차
  - 비행장 · 장주 `/local/airport` — 비행장 배치와 장주
  - 훈련 공역 `/local/area` — 공역 경계와 고도
  - 출항 · 입항 절차 `/local/departure-arrival` — 공역까지 가고 돌아오는 길
  - 교신 `/local/radio` — 구간별 표준 교신
- **Navaids** `/navaids` — 항행안전시설 이해와 계기 읽기
  - VOR `/navaids/vor` — 방위 읽기와 Radial 따라가기
  - DME `/navaids/dme` — 거리 읽기와 DME Arc
  - ILS `/navaids/ils` — Localizer 와 Glide Slope
  - GPS · RNAV `/navaids/gnss` — GPS 항법과 RNAV 절차
- **관리** `/manage` — 교재 등록과 배포
  - 교재 관리 `/manage/materials` — 교재 올리기 · 고치기
  - 배포 대상 `/manage/assign` — 차수 · 과정별로 교재 열어 주기
  - 학습 현황 `/manage/progress` — 누가 어디까지 봤는지

## 돌려 보기

```bash
npm install --no-audit --no-fund --legacy-peer-deps
npm run dev        # http://localhost:5173/edu/
```

올리기 전 확인(한 번에): `npm run validate` — 타입 검사 · 린트 · 테스트 · 빌드.
Tailwind 클래스 오타는 검사에 안 걸리니 화면을 직접 봅니다(데스크톱 · 폰).

## 고치는 곳

| 하고 싶은 일 | 고칠 파일 |
| --- | --- |
| 메뉴 추가 · 이름 바꾸기 · 순서 | `src/menu.ts` (레일 · 홈 · 주소가 함께 바뀜) |
| 화면 만들기 | `src/features/<묶음>/<화면>.tsx` 를 만들고 `src/screens.ts` 에 한 줄 올림 |
| 모듈 이름 · 붙는 주소 | `module.config.json` |
| 화면 틀(머리 · 레일) | `src/shell/` |
| 색 · 글꼴 · 카드 모양 | `tailwind.config.js`, `src/index.css` — AWOS 앱 값을 옮긴 것이라 앱과 같이 맞춤 |


화면을 만들 때는 AWOS 와 같은 클래스(`awos-card`, `awos-card-title`, `awos-inset`, `awos-btn-line`, `awos-seg`, `awos-num`)와
`PanelHeader` 를 쓰면 앱 화면과 같은 모양이 됩니다.

## GitHub 저장소 만들기

1. GitHub 에서 새 저장소 `awos-edu` 를 만듭니다(이름은 영문, 비공개 권장).
2. 이 폴더에서:

```bash
git init
git add .
git commit -m "awos-edu skeleton"
git branch -M main
git remote add origin https://github.com/<계정>/awos-edu.git
git push -u origin main
```

웹에서 끌어다 올릴 때는 숨김 파일(`.github`, `.gitignore`, `.env.example`)이 빠지지 않게 봅니다.
`node_modules`, `dist`, `site`, `.env.local` 은 올리지 않습니다(`.gitignore` 에 들어 있음).

## 단독으로 올리기(미리보기)

- **Netlify**: 저장소를 연결하면 `netlify.toml` 대로 빌드해 `site/` 를 올립니다. 주소는 `https://<사이트>.netlify.app/edu/`.
- **GitHub Pages**: Settings → Pages → Source 를 "GitHub Actions" 로 바꾸면 `.github/workflows/pages.yml` 이
  `https://<계정>.github.io/awos-edu/` 에 올립니다. 비공개 저장소는 요금제에 따라 Pages 를 못 쓸 수 있습니다.

## AWOS 도메인에 붙이기

붙는 주소는 `https://aviationwallet.com/edu/` 입니다. 방법은 셋이고, 아래로 갈수록 앱과 더 깊이 합쳐집니다.

### 1) 통로로 붙이기 — 저장소를 따로 둔 채로

이 저장소를 Netlify 에 올려 둔 다음, **AWOS 앱 저장소의 `netlify.toml`** 에서 맨 마지막 `/*` 규칙 **앞에** 넣습니다.

```toml
[[redirects]]
  from = "/edu/*"
  to = "https://<이 모듈의 Netlify 사이트>.netlify.app/edu/:splat"
  status = 200
  force = true
```

앱을 다시 배포하면 `aviationwallet.com/edu/` 로 이 모듈이 뜹니다. 모듈은 이 저장소에서 따로 배포하면 바로 반영됩니다.

### 2) 빌드 결과를 앱에 넣기 — 회사 소개(`/awoscompany/`)와 같은 방식

```bash
npm run build
# dist/ 안의 파일을 AWOS 앱 저장소의 public/edu/ 로 복사
```

그리고 AWOS 앱 `netlify.toml` 의 `/*` 규칙 앞에, 화면 주소로 바로 들어와도 모듈이 뜨게 한 줄을 넣습니다.

```toml
[[redirects]]
  from = "/edu/*"
  to = "/edu/index.html"
  status = 200
```

### 3) 앱 안으로 합치기 — 완전히 한 몸으로

`src/menu.ts`, `src/screens.ts`, `src/pages/`, `src/shell/`, `src/features/` 를 앱의 `src/modules/edu/` 로 옮기고,
앱 `App.tsx` 에 `/edu/*` 라우트를 lazy 로 추가합니다. `src/index.css` 는 버리고(앱에 같은 클래스가 있음),
`src/lib/awos.ts` 대신 앱의 Supabase 클라이언트를 씁니다.

### 붙였을 때 알아 둘 것

- **로그인 같이 쓰기**: `.env.example` 을 `.env.local` 로 복사해 AWOS 와 같은 `VITE_SUPABASE_URL` · `VITE_SUPABASE_ANON_KEY` 를 넣고 빌드하면,
  같은 도메인 아래에서는 AWOS 로그인 상태를 그대로 읽습니다(머리에 이름이 뜸). 값이 없으면 연동 없이 화면만 뜹니다.
  Netlify 에서는 사이트 환경변수에 넣습니다. 키는 저장소에 올리지 않습니다.
- **보안 헤더(CSP)**: 이 모듈이 부르는 바깥 주소는 Pretendard(jsdelivr) · JetBrains Mono(Google Fonts) · Supabase 뿐이고, 모두 AWOS 앱 CSP 에 이미 들어 있습니다.
  새 바깥 주소(지도 · 영상 등)를 쓰게 되면 앱 `netlify.toml` 의 CSP 에도 더해야 합니다.
- **검색 노출**: `index.html` 에 `noindex` 를 넣어 두었습니다. 공개할 때 뺍니다.

## 아직 확인하지 않은 것

- 위 1) · 2) 의 Netlify 규칙은 실제 배포로 확인하지 않았습니다. 처음 붙일 때 `/edu/` 와 화면 주소(예: `/edu/g1000/pfd`) 새로고침이 되는지 봅니다.
- AWOS 로그인 같이 쓰기는 실제 Supabase 프로젝트로 확인하지 않았습니다.
- G1000 Trainer 는 지금 AWOS 앱 연습 탭(`src/components/practice/G1000Trainer.tsx`, `public/trainer/g1000/`)에 있습니다. 이 저장소로 옮기는 일은 아직 하지 않았습니다(두 곳에 따로 두면 서로 달라지므로 옮길 때 한쪽만 남깁니다).
- `관리` 묶음은 요청에 없던 것을 제안으로 넣었습니다. 필요 없으면 `src/menu.ts` 에서 지웁니다.
