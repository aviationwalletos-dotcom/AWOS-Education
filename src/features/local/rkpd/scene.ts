// 정석비행장 3D 장면(three.js). 화면(React)과 떼어 둔다 — 화면은 select · view 만 부른다.
// 좌표: x = 동쪽(e), z = -북쪽(n), y = 위.
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

import { APRON, CONNECTORS, HOLD_E, P_E, RWY_01_19, RWY_15_33, STANDS } from './data'

const C = {
  grass: 0x9aa86a,
  asphalt: 0x3f4448,
  apron: 0x50565b,
  white: 0xf4f4f0,
  yellow: 0xf2c12e,
  hi: 0xff2d6f,
}

const Y = { pave: 0.05, mark: 0.12, top: 0.16 }

export type ViewName = 'overview' | 'app01' | 'app19' | 'top' | 'apron'

export interface AirportScene {
  select(id: string | null): void
  view(name: ViewName): void
  focus(e: number, n: number): void
  setLabels(on: boolean): void
  /** 위에서 내려다본 그림(차트 비교용) */
  snapshotTop(): void
  dispose(): void
}

type V2 = [number, number] // [e, n]

export function createAirportScene(host: HTMLElement, onPick: (id: string | null, x: number, y: number) => void): AirportScene {
  const renderer = new THREE.WebGLRenderer({ antialias: true, logarithmicDepthBuffer: true, preserveDrawingBuffer: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setClearColor(0xdbe7f3)
  host.appendChild(renderer.domElement)
  renderer.domElement.style.display = 'block'
  renderer.domElement.style.touchAction = 'none'

  const scene = new THREE.Scene()
  scene.fog = new THREE.Fog(0xdbe7f3, 2500, 6000)
  const camera = new THREE.PerspectiveCamera(45, 1, 1, 12000)
  const controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.maxPolarAngle = Math.PI / 2 - 0.05
  controls.minDistance = 30
  controls.maxDistance = 5000

  scene.add(new THREE.HemisphereLight(0xffffff, 0x667744, 1.6))
  const sun = new THREE.DirectionalLight(0xffffff, 1.4)
  sun.position.set(-800, 1500, 600)
  scene.add(sun)

  const pickables: THREE.Mesh[] = []
  const labels: THREE.Sprite[] = []
  const baseColor = new Map<THREE.Mesh, number>()

  // ── 그리기 도구 ────────────────────────────────────────────────────────────
  function mat(color: number) {
    return new THREE.MeshBasicMaterial({ color })
  }
  /** 바닥에 놓인 직사각형. heading = 길이 방향(진북 기준 시계 방향, 도) */
  function rect(e: number, n: number, w: number, l: number, heading: number, color: number, y: number, id?: string) {
    const g = new THREE.PlaneGeometry(w, l)
    g.rotateX(-Math.PI / 2)
    const m = new THREE.Mesh(g, mat(color))
    m.position.set(e, y, -n)
    m.rotation.y = (-heading * Math.PI) / 180
    if (id) register(m, id, color)
    scene.add(m)
    return m
  }
  /** 오목 필렛: 모서리(e, n)에서 se · sn 방향 사분면을 r 만큼 채우고 원호로 깎는다 */
  function fillet(e: number, n: number, se: 1 | -1, sn: 1 | -1, r: number) {
    const pts: THREE.Vector2[] = [new THREE.Vector2(e, n), new THREE.Vector2(e + se * r, n)]
    for (let i = 0; i <= 12; i++) {
      const t = (i / 12) * (Math.PI / 2)
      // 원 중심 (e + se r, n + sn r) — 모서리 쪽으로 오목
      pts.push(new THREE.Vector2(e + se * r - se * r * Math.sin(t), n + sn * r - sn * r * Math.cos(t)))
    }
    pts.push(new THREE.Vector2(e, n + sn * r))
    const g = new THREE.ShapeGeometry(new THREE.Shape(pts))
    g.rotateX(-Math.PI / 2)
    const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color: C.asphalt, side: THREE.DoubleSide }))
    m.position.y = Y.pave - 0.005
    scene.add(m)
  }
  function register(m: THREE.Mesh, id: string, color: number) {
    m.userData.mid = id
    pickables.push(m)
    baseColor.set(m, color)
  }
  /** 두 점을 잇는 선 */
  function seg(a: V2, b: V2, w: number, color: number, y: number, id?: string) {
    const de = b[0] - a[0]
    const dn = b[1] - a[1]
    const len = Math.hypot(de, dn)
    if (len < 0.01) return
    const hdg = (Math.atan2(de, dn) * 180) / Math.PI
    rect((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, w, len, hdg, color, y, id)
  }
  function polyline(pts: V2[], w: number, color: number, y: number, id?: string) {
    for (let i = 0; i < pts.length - 1; i++) seg(pts[i], pts[i + 1], w, color, y, id)
  }
  /** 점선 */
  function dashed(a: V2, b: V2, w: number, dash: number, gap: number, color: number, y: number, id?: string) {
    const len = Math.hypot(b[0] - a[0], b[1] - a[1])
    for (let s = 0; s < len; s += dash + gap) {
      const t0 = s / len
      const t1 = Math.min(s + dash, len) / len
      seg([a[0] + (b[0] - a[0]) * t0, a[1] + (b[1] - a[1]) * t0], [a[0] + (b[0] - a[0]) * t1, a[1] + (b[1] - a[1]) * t1], w, color, y, id)
    }
  }
  /** 2차 베지어 곡선 */
  function curve(a: V2, ctrl: V2, b: V2, w: number, color: number, y: number, id?: string) {
    const pts: V2[] = []
    for (let i = 0; i <= 16; i++) {
      const t = i / 16
      const u = 1 - t
      pts.push([u * u * a[0] + 2 * u * t * ctrl[0] + t * t * b[0], u * u * a[1] + 2 * u * t * ctrl[1] + t * t * b[1]])
    }
    polyline(pts, w, color, y, id)
  }
  /** 바닥에 칠한 글자(활주로 번호). 실제처럼 활주로 방향으로 길쭉하게. heading = 글자 위쪽이 향하는 방향 */
  function paintText(text: string, e: number, n: number, size: number, heading: number, id: string) {
    const cv = document.createElement('canvas')
    cv.width = 320
    cv.height = 480
    const ctx = cv.getContext('2d')!
    ctx.fillStyle = '#f4f4f0'
    ctx.font = 'bold 190px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.translate(160, 240)
    ctx.scale(0.8, 2.3)
    ctx.fillText(text, 0, 6)
    const tex = new THREE.CanvasTexture(cv)
    tex.anisotropy = 4
    const g = new THREE.PlaneGeometry(size, size * 1.5)
    g.rotateX(-Math.PI / 2)
    const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ map: tex, transparent: true }))
    m.position.set(e, Y.mark, -n)
    m.rotation.y = (-heading * Math.PI) / 180
    m.userData.mid = id
    m.userData.textMat = true
    pickables.push(m)
    scene.add(m)
  }
  function label(text: string, e: number, n: number, h = 30, scale = 60) {
    const cv = document.createElement('canvas')
    cv.width = 256
    cv.height = 96
    const ctx = cv.getContext('2d')!
    ctx.fillStyle = 'rgba(15,23,42,0.82)'
    ctx.beginPath()
    ctx.roundRect(8, 16, 240, 64, 14)
    ctx.fill()
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 40px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(text, 128, 49)
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(cv), depthTest: false }))
    sp.position.set(e, h, -n)
    sp.scale.set(scale, scale * 0.375, 1)
    sp.renderOrder = 10
    labels.push(sp)
    scene.add(sp)
  }
  function box(e: number, n: number, w: number, d: number, h: number, color: number, id?: string) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), new THREE.MeshLambertMaterial({ color }))
    m.position.set(e, h / 2, -n)
    if (id) {
      m.userData.mid = id
      pickables.push(m)
    }
    scene.add(m)
    return m
  }

  // ── 지면 ────────────────────────────────────────────────────────────────
  rect(150, 1250, 6000, 7000, 0, C.grass, 0)

  // ── RWY 01/19 ───────────────────────────────────────────────────────────
  const R = RWY_01_19
  rect(0, R.length / 2, R.width, R.length, 0, C.asphalt, Y.pave)
  // 시단 앞 구역(RWY 19 북쪽 약 200 m)
  rect(0, R.length + 100, R.width, 200, 0, C.asphalt, Y.pave)
  for (let i = 0; i < 10; i++) {
    const n = R.length + 12 + i * 19
    seg([0, n], [-15, n + 15], 1.6, C.yellow, Y.mark, 'pre-threshold')
    seg([0, n], [15, n + 15], 1.6, C.yellow, Y.mark, 'pre-threshold')
  }
  // RWY 01 선회 패드(동쪽)
  const pad: V2[] = [
    [22.5, 0],
    [58, 0],
    [58, 73],
    [22.5, 122],
  ]
  {
    const shape = new THREE.Shape(pad.map(([e, n]) => new THREE.Vector2(e, n)))
    const g = new THREE.ShapeGeometry(shape)
    g.rotateX(-Math.PI / 2)
    const m = new THREE.Mesh(g, mat(C.asphalt))
    m.position.y = Y.pave
    scene.add(m)
    curve([2, 160], [50, 100], [48, 25], 0.5, C.yellow, Y.mark, 'turn-pad')
    curve([48, 25], [40, 2], [8, 10], 0.5, C.yellow, Y.mark, 'turn-pad')
  }
  // 측선
  for (const e of [-21.6, 21.6]) seg([e, 0], [e, R.length], 0.9, C.white, Y.mark, 'rwy-edge')
  // 시단 · 지시 · 중심선 · 조준점 · 접지구역 — 양 끝 대칭으로
  const ends: { thr: number; dir: 1 | -1; num: string }[] = [
    { thr: 0, dir: 1, num: '01' },
    { thr: R.length, dir: -1, num: '19' },
  ]
  for (const { thr, dir, num } of ends) {
    for (let i = 0; i < 6; i++) {
      for (const side of [-1, 1]) rect(side * (3.9 + i * 3.2), thr + dir * 21, 1.8, 30, 0, C.white, Y.mark, 'rwy-threshold')
    }
    paintText(num, 0, thr + dir * 56, 18, dir === 1 ? 0 : 180, 'rwy-designation')
    // 조준점 300 m
    for (const side of [-1, 1]) rect(side * 13, thr + dir * (300 + 22.5), 8, 45, 0, C.white, Y.mark, 'rwy-aiming')
    // 접지구역: 150(3) · 450(2) · 600(2) · 750(1)
    for (const [d, count] of [
      [150, 3],
      [450, 2],
      [600, 2],
      [750, 1],
    ] as const) {
      for (let k = 0; k < count; k++) {
        for (const side of [-1, 1]) rect(side * (9.9 + k * 3.3), thr + dir * (d + 11.25), 1.8, 22.5, 0, C.white, Y.mark, 'rwy-tdz')
      }
    }
  }
  for (let n = 80; n < R.length - 80; n += 50) rect(0, n + 15, 0.9, 30, 0, C.white, Y.mark, 'rwy-centerline')

  // ── RWY 15/33 ───────────────────────────────────────────────────────────
  const { thr33, thr15 } = RWY_15_33
  const ue = (thr15.e - thr33.e) / Math.hypot(thr15.e - thr33.e, thr15.n - thr33.n) // 33 → 15 단위 벡터
  const un = (thr15.n - thr33.n) / Math.hypot(thr15.e - thr33.e, thr15.n - thr33.n)
  const len1533 = Math.hypot(thr15.e - thr33.e, thr15.n - thr33.n)
  const hdg33 = (Math.atan2(ue, un) * 180) / Math.PI // 33 으로 내릴 때 진행 방향(≈322°)
  const at = (d: number, off = 0): V2 => [thr33.e + ue * d + un * off, thr33.n + un * d - ue * off]
  {
    const mid = at(len1533 / 2)
    rect(mid[0], mid[1], RWY_15_33.width, len1533, hdg33, C.asphalt, Y.pave + 0.01)
    const s33 = at(-RWY_15_33.swy / 2)
    const s15 = at(len1533 + RWY_15_33.swy / 2)
    rect(s33[0], s33[1], RWY_15_33.width, RWY_15_33.swy, hdg33, 0x4a4f53, Y.pave, 'swy')
    rect(s15[0], s15[1], RWY_15_33.width, RWY_15_33.swy, hdg33, 0x4a4f53, Y.pave, 'swy')
    // 측선
    for (const off of [-11.8, 11.8]) seg(at(0, off), at(len1533, off), 0.6, C.white, Y.mark + 0.01, 'rwy-edge')
    // 시단 4줄씩 · 지시 · 중심선
    for (const [base, dir, num, rot] of [
      [0, 1, '33', hdg33],
      [len1533, -1, '15', hdg33 + 180],
    ] as const) {
      for (let i = 0; i < 4; i++) {
        for (const side of [-1, 1]) {
          const p = at(base + dir * 18, side * (3 + i * 2.4))
          rect(p[0], p[1], 1.5, 30, hdg33, C.white, Y.mark + 0.01, 'rwy-threshold')
        }
      }
      const pn = at(base + dir * 48)
      paintText(num, pn[0], pn[1], 11, rot, 'rwy-designation')
      // 사진에서 본 막대 한 쌍(AIP 미기재)
      for (const side of [-1, 1]) {
        const p = at(base + dir * 170, side * 6)
        rect(p[0], p[1], 3, 25, hdg33, C.white, Y.mark + 0.01, 'rwy1533-extra')
      }
    }
    for (let d = 75; d < len1533 - 75; d += 50) {
      const p = at(d + 15)
      rect(p[0], p[1], 0.6, 30, hdg33, C.white, Y.mark + 0.01, 'rwy-centerline')
    }
    // ㄷ자 표지(사진 기준 근삿값)
    const b0 = at(330, -7)
    const b1 = at(330, 7)
    seg(b0, b1, 2, C.white, Y.mark + 0.01, 'rwy1533-extra')
    seg(b0, at(300, -7), 2, C.white, Y.mark + 0.01, 'rwy1533-extra')
    seg(b1, at(300, 7), 2, C.white, Y.mark + 0.01, 'rwy1533-extra')
  }

  // ── 유도로 ──────────────────────────────────────────────────────────────
  const nA = CONNECTORS[0].n
  const nE = CONNECTORS[CONNECTORS.length - 1].n
  // P
  rect(P_E, (nA + 15 + nE - 15) / 2, 23, nA - nE + 30, 0, C.asphalt, Y.pave)
  seg([P_E, nE], [P_E, nA], 0.5, C.yellow, Y.mark, 'twy-centerline')
  for (const s of [-1, 1]) seg([P_E + s * 11.2, nE], [P_E + s * 11.2, nA], 0.3, C.yellow, Y.mark, 'twy-edge')
  for (const c of CONNECTORS) {
    const end = c.id === 'B' ? APRON.e0 + 5 : P_E
    rect(end / 2, c.n, c.width, end, 90, C.asphalt, Y.pave)
    // 모서리 필렛
    // 모서리 필렛(오목한 둥근 모서리) — 활주로 동쪽 가장자리, P 서쪽 가장자리, B 는 P 동쪽까지
    const h = c.width / 2
    const sides = c.id === 'A' ? [-1] : c.id === 'E' ? [1] : [-1, 1]
    for (const sn of [-1, 1]) fillet(22.5, c.n + sn * h, 1, sn as 1 | -1, 20)
    for (const sn of sides) fillet(P_E - 11.5, c.n + sn * h, -1, sn as 1 | -1, 27)
    if (c.id === 'B') for (const sn of [-1, 1]) fillet(P_E + 11.5, c.n + sn * h, 1, sn as 1 | -1, 27)
    // 중심선과 활주로 쪽 곡선
    seg([40, c.n], [end, c.n], 0.5, C.yellow, Y.mark, 'twy-centerline')
    if (c.id !== 'A') curve([0, c.n + 70], [0, c.n], [40, c.n], 0.5, C.yellow, Y.mark, 'twy-centerline')
    if (c.id !== 'E') curve([0, c.n - 70], [0, c.n], [40, c.n], 0.5, C.yellow, Y.mark, 'twy-centerline')
    if (c.id !== 'A') curve([P_E - 40, c.n], [P_E, c.n], [P_E, c.n + 40], 0.5, C.yellow, Y.mark, 'twy-centerline')
    if (c.id !== 'E') curve([P_E - 40, c.n], [P_E, c.n], [P_E, c.n - 40], 0.5, C.yellow, Y.mark, 'twy-centerline')
    // 측선
    for (const s of [-1, 1]) seg([36, c.n + s * (c.width / 2 - 0.4)], [P_E - 26, c.n + s * (c.width / 2 - 0.4)], 0.3, C.yellow, Y.mark, 'twy-edge')
    // 정지 위치 표지(Pattern A) — 활주로 쪽이 점선
    const half = c.width / 2 - 0.5
    for (const off of [0.6, 1.6]) seg([HOLD_E + off, c.n - half], [HOLD_E + off, c.n + half], 0.45, C.yellow, Y.top, 'hold-rwy')
    for (const off of [-0.6, -1.6]) dashed([HOLD_E + off, c.n - half], [HOLD_E + off, c.n + half], 0.45, 1, 1, C.yellow, Y.top, 'hold-rwy')
    // 강화 중심선(사진: A 제외)
    if (c.id !== 'A') for (const s of [-1, 1]) dashed([HOLD_E + 4, c.n + s * 1], [HOLD_E + 48, c.n + s * 1], 0.4, 3, 1.5, C.yellow, Y.top, 'enhanced-cl')
    label(c.id, (HOLD_E + P_E) / 2 + 20, c.n, 28, 40)
  }
  label('P', P_E, 1200, 28, 40)
  // P 위 RWY 15/33 교차 앞뒤 정지 위치
  {
    const t = (P_E - thr33.e) / ue
    const nCross = thr33.n + un * t
    for (const [nHold, dir] of [
      [nCross + 75, 1],
      [nCross - 75, -1],
    ] as const) {
      for (const off of [0.6, 1.6]) seg([P_E - 11, nHold + dir * off], [P_E + 11, nHold + dir * off], 0.45, C.yellow, Y.top, 'hold-rwy')
      for (const off of [-0.6, -1.6]) dashed([P_E - 11, nHold + dir * off], [P_E + 11, nHold + dir * off], 0.45, 1, 1, C.yellow, Y.top, 'hold-rwy')
    }
  }
  // P 북쪽 중간 대기 위치(관찰)
  dashed([P_E - 11, 2048], [P_E + 11, 2048], 0.5, 1, 1, C.yellow, Y.top, 'hold-intermediate')

  // ── 계류장 ──────────────────────────────────────────────────────────────
  rect((APRON.e0 + APRON.e1) / 2, (APRON.n0 + APRON.n1) / 2, APRON.e1 - APRON.e0, APRON.n1 - APRON.n0, 0, C.apron, Y.pave)
  for (const s of STANDS) {
    seg([s.e, s.n - 30], [s.e, s.n + 8], 0.4, C.yellow, Y.mark, 'stand')
    seg([s.e - 4, s.n + 8], [s.e + 4, s.n + 8], 0.5, C.yellow, Y.mark, 'stand')
    label(s.id, s.e, s.n, 14, 22)
  }
  seg([APRON.e0 + 5, 2005], [STANDS[0].e + 10, 2005], 0.4, C.yellow, Y.mark, 'stand')

  // 핫스폿 링
  {
    const g = new THREE.RingGeometry(36, 40, 48)
    g.rotateX(-Math.PI / 2)
    const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color: 0xe11d48, transparent: true, opacity: 0.85 }))
    m.position.set(P_E, Y.top + 0.05, -2005)
    register(m, 'hotspot', 0xe11d48)
    scene.add(m)
    label('HS', P_E + 48, 2030, 22, 34)
  }

  // ── 시설(크기 · 위치는 차트 기준 근삿값) ───────────────────────────────────
  const papi = (e: number, n: number) => {
    for (let i = 0; i < 4; i++) box(e + i * 9, n, 2, 1.2, 1.2, 0xf8fafc, 'papi')
  }
  papi(-60, 330)
  papi(32, 330)
  papi(32, R.length - 300)
  for (const n of [480, 1850]) {
    const ring = new THREE.RingGeometry(9, 10.5, 40)
    ring.rotateX(-Math.PI / 2)
    const m = new THREE.Mesh(ring, mat(C.white))
    m.position.set(-110, Y.mark, -n)
    register(m, 'windsock', C.white)
    scene.add(m)
    const pole = box(-110, n, 0.4, 0.4, 7, 0x94a3b8, 'windsock')
    pole.position.y = 3.5
    const sock = new THREE.Mesh(new THREE.ConeGeometry(0.9, 5, 12, 1, true), new THREE.MeshLambertMaterial({ color: 0xf97316, side: THREE.DoubleSide }))
    sock.rotation.z = Math.PI / 2
    sock.position.set(-107.5, 6.8, -n)
    sock.userData.mid = 'windsock'
    pickables.push(sock)
    scene.add(sock)
  }
  box(0, R.length + 300, 30, 3, 3, 0xcbd5e1, 'navaids') // LOC
  box(121, 263, 2, 2, 12, 0xcbd5e1, 'navaids') // GP · DME
  {
    const vor = new THREE.Mesh(new THREE.CylinderGeometry(9, 9, 4, 24), new THREE.MeshLambertMaterial({ color: 0xe2e8f0 }))
    vor.position.set(275, 2, -1023)
    vor.userData.mid = 'navaids'
    pickables.push(vor)
    scene.add(vor)
    label('JDG VOR/DME', 275, 1023, 26, 70)
  }
  box(560, 2150, 14, 14, 28, 0xe2e8f0) // 관제탑
  label('TWR', 560, 2150, 40, 40)
  for (let i = 0; i < 3; i++) box(570, 1960 + i * 42, 46, 40, 16, 0x38bdf8) // 격납고

  label('RWY 01', 0, -40, 20, 60)
  label('RWY 19', 0, R.length + 240, 20, 60)
  {
    const p33 = at(-40)
    const p15 = at(len1533 + 40)
    label('RWY 33', p33[0], p33[1], 20, 60)
    label('RWY 15', p15[0], p15[1], 20, 60)
  }

  // ── 카메라 ──────────────────────────────────────────────────────────────
  const VIEWS: Record<ViewName, { pos: [number, number, number]; target: [number, number] }> = {
    overview: { pos: [950, 700, 700], target: [110, 1350] },
    app01: { pos: [0, 55, -420], target: [0, 450] },
    app19: { pos: [0, 55, 2720], target: [0, 1850] },
    top: { pos: [140, 2900, 1240], target: [140, 1250] },
    apron: { pos: [520, 320, 1750], target: [360, 2080] },
  }
  let anim: { from: THREE.Vector3; to: THREE.Vector3; tFrom: THREE.Vector3; tTo: THREE.Vector3; t0: number } | null = null
  function flyTo(pos: THREE.Vector3, target: THREE.Vector3, instant = false) {
    if (instant) {
      camera.position.copy(pos)
      controls.target.copy(target)
      controls.update()
      return
    }
    anim = { from: camera.position.clone(), to: pos, tFrom: controls.target.clone(), tTo: target, t0: performance.now() }
  }
  function applyView(name: ViewName, instant = false) {
    const v = VIEWS[name]
    // VIEWS 의 pos 는 [e, 높이, n]
    flyTo(new THREE.Vector3(v.pos[0], v.pos[1], -v.pos[2]), new THREE.Vector3(v.target[0], 0, -v.target[1]), instant)
  }
  applyView('overview', true)

  // ── 고르기 ──────────────────────────────────────────────────────────────
  let selected: string | null = null
  function paint() {
    for (const m of pickables) {
      const on = selected !== null && m.userData.mid === selected
      const material = m.material as THREE.MeshBasicMaterial
      if (m.userData.textMat) {
        material.color.set(on ? C.hi : 0xffffff)
      } else if (baseColor.has(m)) {
        material.color.set(on ? C.hi : baseColor.get(m)!)
      } else if ('emissive' in material) {
        ;(material as unknown as THREE.MeshLambertMaterial).emissive.set(on ? 0xaa0033 : 0x000000)
      }
    }
  }
  const ray = new THREE.Raycaster()
  const ptr = new THREE.Vector2()
  let down: [number, number] | null = null
  const onDown = (e: PointerEvent) => {
    down = [e.clientX, e.clientY]
  }
  const onUp = (e: PointerEvent) => {
    if (!down || Math.hypot(e.clientX - down[0], e.clientY - down[1]) > 6) return
    const r = renderer.domElement.getBoundingClientRect()
    ptr.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1)
    ray.setFromCamera(ptr, camera)
    const hit = ray.intersectObjects(pickables, false)[0]
    let id = hit ? (hit.object.userData.mid as string) : null
    if (!id) {
      // 표지는 가늘어 맞히기 어렵다 — 누른 지면 지점 가까이의 표지를 고른다(화면에서 약 2% 거리 안)
      const ground = new THREE.Vector3()
      if (ray.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), ground)) {
        const tol = camera.position.distanceTo(ground) * 0.025
        let best = tol
        const q = new THREE.Vector3()
        for (const m of pickables) {
          // 도형 자기 좌표에서 가장 가까운 점(기울어진 표지도 정확히)
          if (!m.geometry.boundingBox) m.geometry.computeBoundingBox()
          m.worldToLocal(q.copy(ground))
          m.geometry.boundingBox!.clampPoint(q, q)
          m.localToWorld(q)
          const d = Math.hypot(q.x - ground.x, q.z - ground.z)
          if (d < best) {
            best = d
            id = m.userData.mid as string
          }
        }
      }
    }
    onPick(id, e.clientX - r.left, e.clientY - r.top)
  }
  renderer.domElement.addEventListener('pointerdown', onDown)
  renderer.domElement.addEventListener('pointerup', onUp)

  // ── 크기 · 그리기 ─────────────────────────────────────────────────────────
  const resize = () => {
    const w = host.clientWidth
    const h = host.clientHeight
    renderer.setSize(w, h, false)
    renderer.domElement.style.width = `${w}px`
    renderer.domElement.style.height = `${h}px`
    camera.aspect = w / Math.max(h, 1)
    camera.updateProjectionMatrix()
  }
  const ro = new ResizeObserver(resize)
  ro.observe(host)
  resize()

  let raf = 0
  const loop = () => {
    raf = requestAnimationFrame(loop)
    if (anim) {
      const k = Math.min((performance.now() - anim.t0) / 700, 1)
      const s = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2
      camera.position.lerpVectors(anim.from, anim.to, s)
      controls.target.lerpVectors(anim.tFrom, anim.tTo, s)
      if (k >= 1) anim = null
    }
    controls.update()
    renderer.render(scene, camera)
  }
  loop()

  return {
    select(id) {
      selected = id
      paint()
    },
    view(name) {
      applyView(name)
    },
    focus(e, n) {
      const dir = camera.position.clone().sub(controls.target).normalize()
      const target = new THREE.Vector3(e, 0, -n)
      flyTo(target.clone().add(dir.multiplyScalar(260)), target)
    },
    setLabels(on) {
      for (const s of labels) s.visible = on
    },
    snapshotTop() {
      applyView('top', true)
    },
    dispose() {
      cancelAnimationFrame(raf)
      ro.disconnect()
      renderer.domElement.removeEventListener('pointerdown', onDown)
      renderer.domElement.removeEventListener('pointerup', onUp)
      controls.dispose()
      scene.traverse((o) => {
        const m = o as THREE.Mesh
        m.geometry?.dispose()
        const material = m.material as THREE.Material | THREE.Material[] | undefined
        if (Array.isArray(material)) material.forEach((x) => x.dispose())
        else material?.dispose()
      })
      renderer.dispose()
      renderer.domElement.remove()
    },
  }
}
