// 정석비행장(RKPD) 배치와 표지 설명.
//
// 좌표: 활주로 01 시단 중심을 원점으로 한 미터 단위(e = 동쪽, n = 북쪽, 진북 기준).
// 근거: AIP RKPD AD 2.12(시단 좌표) · AD 2.13(교차점 이륙 거리) · AD CHART 2-1(20 AUG 2026) · 계류장 INS 좌표.
// 활주로 · 시단 · 주기 위치는 AIP 좌표에서 계산했고, 유도로 · 표지 위치는 차트와 위성사진을 보고 맞춘 근삿값이다.

/** 위도 · 경도 → 원점 기준 미터 (원점: RWY 01 THR 33°22'58.36"N 126°42'41.71"E) */
export function toLocal(latSec: number, lonSec: number): { e: number; n: number } {
  const LAT0 = 33 * 3600 + 22 * 60 + 58.36
  const LON0 = 126 * 3600 + 42 * 60 + 41.71
  const mPerSecLat = 30.83
  const mPerSecLon = 30.87 * Math.cos((33.39 * Math.PI) / 180)
  return { e: (lonSec - LON0) * mPerSecLon, n: (latSec - LAT0) * mPerSecLat }
}

const dms = (d: number, m: number, s: number) => d * 3600 + m * 60 + s

export const RWY_01_19 = { width: 45, length: 2300, e: 0 }

// RWY 15/33 — AD 2.12 시단 좌표에서
const THR33 = toLocal(dms(33, 23, 42.69), dms(126, 42, 55.55))
const THR15 = toLocal(dms(33, 24, 5.79), dms(126, 42, 34.24))
export const RWY_15_33 = { width: 25, thr33: THR33, thr15: THR15, swy: 300 }

/** 유도로 P 중심선 동쪽 거리(m) — 위성사진 실측(활주로 폭 45 m 를 자로) */
export const P_E = 190
/** 활주로 01/19 중심선에서 정지 위치 표지까지(m) — 위성사진 기준 근삿값 */
export const HOLD_E = 97

/** 연결 유도로 — n 은 활주로와 만나는 곳. AD 2.13 교차점 이륙 거리로 계산(B: 2300-2010, C: 850, D: 1350, E: 435) */
export const CONNECTORS: { id: string; n: number; width: number }[] = [
  { id: 'A', n: 2285, width: 30 },
  { id: 'B', n: 2005, width: 30 },
  { id: 'C', n: 1450, width: 23 },
  { id: 'D', n: 950, width: 23 },
  { id: 'E', n: 435, width: 30 },
]

export const APRON = { e0: 255, e1: 530, n0: 1925, n1: 2300 }

/** 주기 위치 — AD CHART 2-1 INS 좌표 */
export const STANDS: { id: string; e: number; n: number }[] = (
  [
    ['1', 5.89, 0.43],
    ['G1', 5.02, 0.62],
    ['G2', 5.02, 59.77],
    ['G3', 5.01, 58.92],
    ['G4', 5.01, 58.06],
    ['G5', 6.81, 0.61],
    ['G6', 6.8, 59.76],
    ['G7', 6.8, 58.91],
    ['G8', 8.3, 0.6],
    ['G9', 8.29, 59.75],
    ['G10', 5.01, 57.21],
  ] as const
).map(([id, latS, lonS]) => {
  const lonMin = lonS > 30 ? 42 : 43
  return { id, ...toLocal(dms(33, 24, latS), dms(126, lonMin, lonS)) }
})

// ── 교육 내용 ─────────────────────────────────────────────────────────────

export type MarkGroup = 'runway' | 'taxiway' | 'area' | 'facility'

/** aip = AIP · 차트에 있음 / observed = 위성사진에서만 보임 / check = 의미 확인 필요 */
export type MarkStatus = 'aip' | 'observed' | 'check'

export interface MarkInfo {
  id: string
  group: MarkGroup
  name: string
  en: string
  color: '흰색' | '노란색' | '-'
  status: MarkStatus
  /** 무엇을 뜻하나 */
  meaning: string
  /** 조종사가 할 일 */
  pilot: string
  /** 정석비행장에서는 */
  local?: string
  /** 근거 */
  refs: string[]
  /** 카메라가 갈 곳 (e, n) */
  focus: [number, number]
}

export const GROUP_LABEL: Record<MarkGroup, string> = {
  runway: '활주로 표지',
  taxiway: '유도로 표지',
  area: '구역 표지',
  facility: '시설',
}

export const STATUS_LABEL: Record<MarkStatus, string> = {
  aip: 'AIP 기재',
  observed: '사진에서 확인',
  check: '의미 확인 필요',
}

const A14 = 'ICAO Annex 14 Vol I, 5장 표지(Markings)'
const KR = '국토교통부 고시 「비행장시설 설치기준」 (조항 대조 필요)'

export const MARKS: MarkInfo[] = [
  {
    id: 'rwy-designation',
    group: 'runway',
    name: '활주로 지시 표지',
    en: 'Runway designation marking',
    color: '흰색',
    status: 'aip',
    meaning: '활주로 방향을 자북 기준 방위의 앞 두 자리로 나타낸다. 01은 자방위 약 007°, 19는 187°.',
    pilot: '이륙 · 착륙 전에 배정받은 활주로와 숫자가 맞는지 눈으로 확인한다. 잘못된 활주로 진입을 막는 마지막 확인이다.',
    local: '진방위는 01이 359.73°지만 자편차가 7°W라 자방위는 007°다. 그래서 숫자가 36이 아니라 01이다. 15/33도 같은 방식(자방위 149° · 329°).',
    refs: [A14 + ' — 활주로 지시 표지', 'AIP RKPD AD 2.9 · AD 2.12', KR],
    focus: [0, 50],
  },
  {
    id: 'rwy-threshold',
    group: 'runway',
    name: '활주로 시단 표지',
    en: 'Threshold marking',
    color: '흰색',
    status: 'aip',
    meaning: '착륙에 쓸 수 있는 활주로가 시작되는 곳. 세로 줄무늬 수는 활주로 폭에 따라 정해진다(폭 45 m → 12개).',
    pilot: '착륙 시 시단을 넘어 접지한다. 시단 앞에 갈매기표지 구역이 있으면 그 위로는 착륙하지 않는다.',
    local: 'RWY 01/19는 양쪽 6개씩 12개. RWY 15/33은 폭 25 m인데 사진상 한쪽 4개씩 8개로 보인다.',
    refs: [A14 + ' — 시단 표지', 'AIP RKPD AD 2.9'],
    focus: [0, 20],
  },
  {
    id: 'rwy-centerline',
    group: 'runway',
    name: '활주로 중심선 표지',
    en: 'Runway centre line marking',
    color: '흰색',
    status: 'aip',
    meaning: '활주로 가운데를 잇는 흰 점선. 이착륙 방향 유지의 기준이다.',
    pilot: '이륙 활주와 착륙 후 감속 중에 중심선을 따라 방향을 유지한다.',
    refs: [A14 + ' — 활주로 중심선 표지', 'AIP RKPD AD 2.9'],
    focus: [0, 1150],
  },
  {
    id: 'rwy-edge',
    group: 'runway',
    name: '활주로 측선 표지',
    en: 'Runway side stripe marking',
    color: '흰색',
    status: 'aip',
    meaning: '활주로 양쪽 가장자리를 표시하는 흰 실선. 포장 면과 활주로 경계를 구분한다.',
    pilot: '측선 바깥은 활주로가 아니다. 접지 · 활주 중 측선을 넘지 않는다.',
    refs: [A14 + ' — 활주로 측선 표지', 'AIP RKPD AD 2.9 (Edge)'],
    focus: [-22, 1150],
  },
  {
    id: 'rwy-aiming',
    group: 'runway',
    name: '조준점 표지',
    en: 'Aiming point marking',
    color: '흰색',
    status: 'aip',
    meaning: '착륙 접근 시 조종사가 겨누는 지점. 굵고 긴 흰 직사각형 한 쌍. 착륙 가용거리(LDA) 1 200–2 400 m 미만이면 시단에서 300 m에 둔다.',
    pilot: '접근 중 조준점을 겨누고 강하각을 유지한다. PAPI가 있으면 PAPI 강하각과 같이 본다.',
    local: 'RWY 01/19 LDA 2 300 m → 시단에서 약 300 m. RWY 19는 TWY B(시단에서 약 290 m) 바로 옆이다.',
    refs: [A14 + ' — 조준점 표지', 'AIP RKPD AD 2.9 · AD 2.13'],
    focus: [0, 300],
  },
  {
    id: 'rwy-tdz',
    group: 'runway',
    name: '접지구역 표지',
    en: 'Touchdown zone marking',
    color: '흰색',
    status: 'aip',
    meaning: '접지구역을 150 m 간격의 막대 쌍으로 나타낸다. 시단에서 멀어질수록 막대 수가 3 → 2 → 1로 줄어 남은 거리를 짐작하게 한다.',
    pilot: '접지구역 안에서 접지한다. 접지구역을 지나도 접지하지 못하면 복행을 생각한다.',
    local: '정밀계기 활주로인 01/19에 있다. 모델의 막대 수 · 위치는 표준 배치를 사진에 맞춘 근삿값이라 실제 개수 확인이 필요하다. 사진에는 옛 표지를 지운 회색 흔적도 보인다.',
    refs: [A14 + ' — 접지구역 표지', 'AIP RKPD AD 2.9 (TDZ)'],
    focus: [0, 520],
  },
  {
    id: 'pre-threshold',
    group: 'area',
    name: '시단 앞 갈매기표지',
    en: 'Pre-threshold area marking (chevrons)',
    color: '노란색',
    status: 'aip',
    meaning: '시단 앞 포장 구역이 정상적인 이착륙 · 지상 이동에 쓰이지 않는 곳임을 노란 V자로 표시한다. V자 끝은 시단 쪽을 향한다.',
    pilot: '이 구역 위로 착륙하거나 이륙 활주를 시작하지 않는다. 지상 이동도 하지 않는다.',
    local: 'RWY 19 시단 북쪽 약 200 m. AIRAC AIP AMDT 9/26(2026. 9. 30. 발효)으로 RWY 01의 정지로(SWY)가 폐지됐다고 차트에 적혀 있다.',
    refs: ['ICAO Annex 14 Vol I, 7장 사용 제한 구역 표시', 'RKPD AD CHART 2-1 (변경 사항 주기)'],
    focus: [0, 2400],
  },
  {
    id: 'turn-pad',
    group: 'area',
    name: '활주로 선회 패드 · 선회 유도선',
    en: 'Runway turn pad marking',
    color: '노란색',
    status: 'observed',
    meaning: '활주로 끝에서 항공기가 돌아 나갈 수 있게 넓힌 포장 구역과, 그 위를 따라 도는 노란 유도선.',
    pilot: '활주로 끝에서 되돌아 나갈 때 유도선을 따라 돈다. 선회 반경과 날개 끝 간격을 지킨다.',
    local: 'RWY 01 시단 동쪽. 차트에는 포장 돌출부만 있고 유도선은 사진에서 확인했다.',
    refs: [A14 + ' — 활주로 선회 패드 표지'],
    focus: [30, 40],
  },
  {
    id: 'twy-centerline',
    group: 'taxiway',
    name: '유도로 중심선 표지',
    en: 'Taxiway centre line marking',
    color: '노란색',
    status: 'aip',
    meaning: '지상 이동 경로를 나타내는 노란 실선. 활주로에서 나가거나 들어올 때는 곡선으로 이어진다.',
    pilot: '앞바퀴(노즈 기어)가 중심선 위에 있도록 유도한다.',
    local: '표준 지상 이동 경로(AD 2.20): RWY 01 사용 시 출발 Apron → B → P → RWY 15/33 → D 또는 E. 활주로 15/33을 유도로처럼 지나간다.',
    refs: [A14 + ' — 유도로 중심선 표지', 'AIP RKPD AD 2.9 · AD 2.20'],
    focus: [P_E, 1200],
  },
  {
    id: 'twy-edge',
    group: 'taxiway',
    name: '유도로 측선 표지',
    en: 'Taxiway edge marking',
    color: '노란색',
    status: 'aip',
    meaning: '유도로 포장 가장자리를 나타내는 노란 선. 바깥은 항공기 하중을 받도록 만든 면이 아닐 수 있다.',
    pilot: '측선 바깥으로 바퀴가 나가지 않게 한다.',
    refs: [A14 + ' — 유도로 측선 표지', 'AIP RKPD AD 2.9 (Edge)'],
    focus: [P_E + 11, 1200],
  },
  {
    id: 'hold-rwy',
    group: 'taxiway',
    name: '활주로 정지 위치 표지 (Pattern A)',
    en: 'Runway-holding position marking',
    color: '노란색',
    status: 'aip',
    meaning: '활주로에 들어가기 전 멈추는 곳. 노란 실선 두 줄 + 점선 두 줄. 실선 쪽에서 오면 멈추고, 점선 쪽(활주로 쪽)에서 오면 그냥 지나간다.',
    pilot: '관제 허가 없이 실선을 넘지 않는다. 착륙 후 활주로를 벗어날 때는 표지 전체를 지나야 활주로를 벗어난 것이다. 이때 지상관제(121.95)로 바꾼다.',
    local: 'TWY A–E와 P 위 RWY 15/33 양쪽에 있다. AD 2.20: 착륙 항공기는 활주로를 벗어나면 JEONGSEOK GND 121.95로 교신한다.',
    refs: [A14 + ' — 활주로 정지 위치 표지', 'AIP RKPD AD 2.9 (Holding Position) · AD 2.20', KR],
    focus: [HOLD_E, 1450],
  },
  {
    id: 'enhanced-cl',
    group: 'taxiway',
    name: '강화 유도로 중심선',
    en: 'Enhanced taxiway centre line',
    color: '노란색',
    status: 'observed',
    meaning: '정지 위치 표지 앞(활주로에서 먼 쪽) 중심선 양옆의 노란 점선. 곧 활주로 정지 위치가 나온다는 예고다.',
    pilot: '점선이 보이면 정지 위치에 다가가고 있음을 알고 속도를 줄인다.',
    local: '사진에서 TWY B–E 정지 위치 표지 동쪽에 보인다. AIP 표지 목록에는 따로 적혀 있지 않다.',
    refs: ['FAA AC 150/5340-1 (Enhanced taxiway centerline)', '국내 적용 여부 확인 필요'],
    focus: [HOLD_E + 25, 950],
  },
  {
    id: 'hold-intermediate',
    group: 'taxiway',
    name: '중간 대기 위치 표지',
    en: 'Intermediate holding position marking',
    color: '노란색',
    status: 'check',
    meaning: '유도로끼리 만나는 곳 앞에서 멈출 수 있는 위치를 노란 점선 한 줄로 표시한다.',
    pilot: '관제가 이 위치 앞에서 대기하라고 하면 점선 앞에서 멈춘다.',
    local: '사진상 P 북쪽, B와 만나는 곳 근처에 가로 점선이 보인다. 위치 · 의미는 훈련원 확인이 필요하다.',
    refs: [A14 + ' — 중간 대기 위치 표지'],
    focus: [P_E, 2050],
  },
  {
    id: 'hotspot',
    group: 'area',
    name: '핫스폿 (HS)',
    en: 'Hot spot',
    color: '-',
    status: 'aip',
    meaning: '충돌이나 활주로 침범 위험이 있어 특히 주의해야 하는 곳. 바닥에 칠한 표지가 아니라 차트에 표시한다.',
    pilot: '지나기 전에 허가받은 경로를 다시 확인하고, 다른 항공기 · 차량을 살핀다.',
    local: 'TWY B · P · 계류장이 만나는 곳. 출발 표준 경로(Apron → B → P)와 도착 경로가 모두 지난다.',
    refs: ['RKPD AD CHART 2-1 (HS)', 'ICAO Doc 4444 · Annex 4 (핫스폿 표시)'],
    focus: [P_E, 2005],
  },
  {
    id: 'stand',
    group: 'taxiway',
    name: '주기 위치 · 유도선',
    en: 'Aircraft stand marking',
    color: '노란색',
    status: 'aip',
    meaning: '계류장에서 항공기를 세우는 자리와 그곳까지 가는 노란 유도선.',
    pilot: '유도선을 따라 들어가고, 마샬러(지상 유도원) 신호에 따라 멈춘다.',
    local: 'G1–G10, 1번. AD 2.9: 앞바퀴 유도선이 있고 주기는 마샬러 유도에 따른다. 엔진 시동은 GND 121.95에 요청한다(AD 2.20).',
    refs: ['AIP RKPD AD 2.9 · AD 2.20', 'RKPD AD CHART 2-1 (INS 좌표)'],
    focus: [460, 2100],
  },
  {
    id: 'rwy1533-extra',
    group: 'runway',
    name: 'RWY 15/33 막대 · ㄷ자 표지',
    en: 'Unlisted markings on RWY 15/33',
    color: '흰색',
    status: 'check',
    meaning: 'RWY 15/33에 직사각 막대 한 쌍과 ㄷ자 모양 흰 표지가 보인다.',
    pilot: '-',
    local: 'AIP AD 2.9에 RWY 15/33 표지는 지시 · 측선 · 시단 · 중심선 · 종단만 적혀 있다. 이 표지들은 목록에 없어 훈련원에 의미를 확인해야 한다. 위치도 사진 기준 근삿값이다.',
    refs: ['AIP RKPD AD 2.9'],
    focus: [200, 1630],
  },
  {
    id: 'swy',
    group: 'area',
    name: '정지로 (SWY)',
    en: 'Stopway',
    color: '-',
    status: 'aip',
    meaning: '이륙을 포기했을 때 멈출 수 있도록 활주로 끝에 이어 둔 구역. 가속정지 가용거리(ASDA)에 들어간다.',
    pilot: '정상 이륙 · 착륙에는 쓰지 않는다. 이륙 성능 계산 시 ASDA에 포함된다.',
    local: 'RWY 15 · 33 양 끝 300 × 25 m → ASDA 1 200 m(TORA 900 m). 사진상 RWY 33 끝 너머에 희미한 X자가 보여 확인이 필요하다.',
    refs: ['AIP RKPD AD 2.12 · AD 2.13'],
    focus: [THR33.e + 120, THR33.n - 150],
  },
  {
    id: 'papi',
    group: 'facility',
    name: 'PAPI',
    en: 'Precision approach path indicator',
    color: '-',
    status: 'aip',
    meaning: '등 4개의 흰색 · 빨간색 조합으로 접근 강하각을 알려 준다. 흰 2 · 빨강 2면 정상 강하각.',
    pilot: '흰색이 많으면 높고, 빨간색이 많으면 낮다. 착륙 전까지 흰 2 · 빨강 2를 유지한다.',
    local: 'RWY 01: 양쪽, 3°, MEHT 23.3 m. RWY 19: 왼쪽(동쪽), 3°, MEHT 17.6 m (AD 2.14).',
    refs: ['AIP RKPD AD 2.14', 'ICAO Annex 14 Vol I, 5.3 등화'],
    focus: [40, 2000],
  },
  {
    id: 'windsock',
    group: 'facility',
    name: '풍향지시기',
    en: 'Wind direction indicator',
    color: '-',
    status: 'observed',
    meaning: '바람 방향과 대략의 세기를 보여 주는 풍향 자루. 흰 원 안에 세운다.',
    pilot: '접근 · 이륙 전에 바람 방향을 눈으로 확인하고 관제 바람 정보와 비교한다.',
    local: '사진에서 활주로 01/19 서쪽 두 곳에 보인다. 차트에는 표시가 없다. AD 2.15의 LDI(착륙방향지시기) NIL과는 다른 시설이다.',
    refs: ['ICAO Annex 14 Vol I, 5.1 지시기'],
    focus: [-110, 1850],
  },
  {
    id: 'navaids',
    group: 'facility',
    name: 'ILS · VOR/DME',
    en: 'ILS LOC / GP / DME, VOR/DME',
    color: '-',
    status: 'aip',
    meaning: 'ILS 01(IJDG 108.3): 로컬라이저는 RWY 19 끝 너머, 글라이드패스와 DME는 01 시단 동쪽. VOR/DME JDG 117.9는 비행장 안.',
    pilot: '지상 이동 · 대기 중 ILS 임계구역을 침범하지 않도록 관제 지시에 따른다.',
    local: 'GP 334.1 / DME 981 MHz(CH 20X). JDG VOR은 몇몇 방사선 · 거리에서 사용 불가 구간이 있다(AD 2.19).',
    refs: ['AIP RKPD AD 2.19'],
    focus: [130, 260],
  },
]

/** 차트와 위성사진을 비교해 찾은 점 */
export const CHART_DIFFS: { title: string; body: string; kind: 'match' | 'diff' | 'check' }[] = [
  { kind: 'match', title: '활주로 01/19 표지', body: '시단(12줄) · 지시 · 중심선 · 조준점 · 접지구역 표지가 AIP AD 2.9 목록과 맞는다.' },
  { kind: 'match', title: 'RWY 19 시단 앞 갈매기표지', body: '차트의 빗금 구역과 사진의 노란 V자 구역이 맞는다. RWY 01 정지로 폐지(AMDT 9/26) 뒤의 상태.' },
  { kind: 'match', title: '유도로 A–E · P 배치', body: '교차점 이륙 거리(AD 2.13)로 계산한 위치와 사진이 대체로 맞는다.' },
  { kind: 'diff', title: 'RWY 01 선회 패드 유도선', body: '차트에는 포장 돌출부만 있고, 사진에는 노란 선회 유도선이 있다.' },
  { kind: 'diff', title: '정지 위치 · 강화 중심선', body: '차트에는 축척 때문에 정지 위치 표지가 없다. 사진에는 A–E, P(RWY 15/33 양쪽)에 Pattern A와 점선 중심선이 있다.' },
  { kind: 'diff', title: '풍향지시기 2곳', body: '활주로 서쪽 두 곳에 보이지만 차트에는 없다.' },
  { kind: 'check', title: 'RWY 15/33 미기재 표지', body: '막대 한 쌍과 ㄷ자 표지가 사진에 있으나 AIP 표지 목록에 없다.' },
  { kind: 'check', title: 'RWY 15/33 시단 줄 수', body: '폭 25 m인데 사진상 8줄로 보인다.' },
  { kind: 'check', title: 'RWY 33 끝 정지로의 X자', body: '희미한 X자가 보인다. 폐쇄 표지인지 옛 흔적인지 확인 필요.' },
  { kind: 'check', title: 'P 북쪽 가로 점선', body: '중간 대기 위치 표지로 보이나 확인 필요.' },
]
