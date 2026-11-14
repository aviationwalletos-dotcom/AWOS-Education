// 좁은 화면의 [전체 메뉴] 창 — AWOS 대시보드의 전체 메뉴와 같은 구성(묶음 제목 + 알약).
import React, { useEffect, useRef } from 'react'
import { X } from 'lucide-react'

export function MenuSheet({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    closeRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [onClose])

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-label={title}>
      <button type="button" aria-label="닫기" tabIndex={-1} onClick={onClose} className="absolute inset-0 bg-[#0F172A]/40" />
      <div className="relative flex max-h-[86svh] w-full flex-col rounded-t-[20px] bg-white shadow-xl sm:max-w-[560px] sm:rounded-[20px]">
        <div className="flex items-center justify-between gap-2 border-b border-[#EEF2F7] px-4 py-3">
          <h2 className="text-[16px] font-extrabold tracking-tight text-[#0F172A]">{title}</h2>
          <button ref={closeRef} type="button" aria-label="닫기" onClick={onClose} className="awos-btn-line inline-flex !min-h-[36px] !px-2.5">
            <X className="h-4 w-4" aria-hidden={true} />
          </button>
        </div>
        <div className="overflow-y-auto px-4 pb-[calc(16px+env(safe-area-inset-bottom))] pt-4">{children}</div>
      </div>
    </div>
  )
}
