// 정석비행장(RKPD) 3D — 큰 화면 하나. 둘러보다가 표지 · 시설을 누르면 그 자리에 설명 카드가 뜬다.
import { useEffect, useRef, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { X } from 'lucide-react'

import { MARKS, STATUS_LABEL } from './data'
import { createAirportScene } from './scene'
import type { MarkInfo, MarkStatus } from './data'
import type { AirportScene } from './scene'

const STATUS_TONE: Record<MarkStatus, string> = {
  aip: 'border-[#BFDBFE] bg-[#EFF6FF] text-[#1D4ED8]',
  observed: 'border-[#BBF7D0] bg-[#F0FDF4] text-[#15803D]',
  check: 'border-amber-200 bg-amber-50 text-amber-700',
}

const CARD_W = 360

export default function AirportTrainer() {
  const hostRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<AirportScene | null>(null)
  const [pick, setPick] = useState<{ id: string; x: number; y: number } | null>(null)
  const [size, setSize] = useState({ w: 0, h: 0 })
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    const host = hostRef.current
    if (!host) return
    const ro = new ResizeObserver(() => setSize({ w: host.clientWidth, h: host.clientHeight }))
    ro.observe(host)
    try {
      const s = createAirportScene(host, (id, x, y) => setPick(id ? { id, x, y } : null))
      sceneRef.current = s
      if (new URLSearchParams(window.location.search).get('view') === 'top') s.snapshotTop()
      return () => {
        ro.disconnect()
        s.dispose()
        sceneRef.current = null
      }
    } catch {
      setFailed(true)
      return () => ro.disconnect()
    }
  }, [])

  useEffect(() => {
    sceneRef.current?.select(pick?.id ?? null)
  }, [pick?.id])

  useEffect(() => {
    if (!pick) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setPick(null)
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [pick])

  const info = pick ? MARKS.find((m) => m.id === pick.id) ?? null : null
  const narrow = size.w < 640

  // 넓은 화면: 누른 자리 옆에 띄우고 화면 안으로 밀어 넣는다. 좁은 화면: 아래에서 올라오는 카드
  let style: CSSProperties | undefined
  if (pick && !narrow) {
    const left = pick.x + 16 + CARD_W > size.w ? pick.x - 16 - CARD_W : pick.x + 16
    style = { left: Math.max(12, left), top: Math.min(Math.max(12, pick.y - 40), Math.max(12, size.h - 440)), width: CARD_W }
  }

  return (
    <div
      ref={hostRef}
      data-testid="rkpd-3d"
      className="relative h-[calc(100svh-210px)] min-h-[420px] w-full overflow-hidden rounded-[16px] border border-[#E6EBF2] bg-[#DBE7F3]"
    >
      {failed && <p className="absolute inset-0 flex items-center justify-center p-6 text-center text-[14px] text-[#475569]">이 기기에서는 3D 화면을 열 수 없어요(WebGL).</p>}
      {info && (
        <div
          role="dialog"
          aria-label={info.name}
          style={style}
          className={`absolute z-10 max-h-[420px] overflow-y-auto rounded-[16px] border border-[#E6EBF2] bg-white/95 p-4 shadow-[0_12px_32px_rgba(15,23,42,0.18)] backdrop-blur ${
            narrow ? 'inset-x-2 bottom-2 max-h-[60%]' : ''
          }`}
        >
          <MarkCard info={info} onClose={() => setPick(null)} />
        </div>
      )}
    </div>
  )
}

function MarkCard({ info, onClose }: { info: MarkInfo; onClose: () => void }) {
  return (
    <div>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="text-[16px] font-extrabold tracking-tight text-[#0F172A]">{info.name}</h3>
          <p className="text-[12.5px] text-[#64748B]">
            {info.en}
            {info.color !== '-' && ` · ${info.color}`}
          </p>
        </div>
        <button type="button" aria-label="닫기" onClick={onClose} className="awos-btn-line inline-flex !min-h-[32px] shrink-0 !px-2">
          <X className="h-4 w-4" aria-hidden={true} />
        </button>
      </div>
      <span className={`mt-2 inline-flex rounded-control border px-2 py-0.5 text-[11.5px] font-bold ${STATUS_TONE[info.status]}`}>{STATUS_LABEL[info.status]}</span>
      <dl className="mt-2.5 space-y-2.5 text-[13.5px] leading-relaxed text-[#334155]">
        <Row term="뜻">{info.meaning}</Row>
        {info.pilot !== '-' && <Row term="조종사가 할 일">{info.pilot}</Row>}
        {info.local && <Row term="정석비행장">{info.local}</Row>}
        <Row term="근거">
          <ul className="list-disc pl-4">
            {info.refs.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </Row>
      </dl>
    </div>
  )
}

function Row({ term, children }: { term: string; children: ReactNode }) {
  return (
    <div>
      <dt className="awos-card-title">{term}</dt>
      <dd className="mt-0.5">{children}</dd>
    </div>
  )
}
