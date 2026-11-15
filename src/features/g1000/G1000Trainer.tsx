// G1000 Trainer — 단독으로 도는 트레이너(public/trainer/g1000/index.html)를 띄운다.
// 트레이너는 가로 폭에 맞춰 줄어들고 아래에 과제 · 바람 · LESSON 패널이 있다. 같은 출처라 내용 높이를 재서 iframe 높이를 맞춘다(안쪽 스크롤 없이).
import { useEffect, useRef, useState } from 'react'

export default function G1000Trainer() {
  const ref = useRef<HTMLIFrameElement>(null)
  const [h, setH] = useState(720)
  const src = `${import.meta.env.BASE_URL}trainer/g1000/index.html`

  useEffect(() => {
    const frame = ref.current
    if (!frame) return
    let ro: ResizeObserver | null = null
    const hook = () => {
      const doc = frame.contentDocument
      if (!doc?.body) return
      const measure = () => setH(Math.ceil(doc.documentElement.scrollHeight))
      ro?.disconnect()
      ro = new ResizeObserver(measure)
      ro.observe(doc.body)
      measure()
    }
    frame.addEventListener('load', hook)
    hook()
    return () => {
      frame.removeEventListener('load', hook)
      ro?.disconnect()
    }
  }, [])

  return (
    <div className="overflow-hidden rounded-[16px] border border-[#E6EBF2] bg-[#14161A]">
      <iframe ref={ref} title="G1000 Trainer" src={src} style={{ height: h }} className="block w-full border-0" scrolling="no" allow="fullscreen" />
    </div>
  )
}
