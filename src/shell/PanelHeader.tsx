// AWOS 앱의 PanelHeader 와 같은 모양 — 제목 · 한 줄 설명 · 오른쪽 버튼.
import React from 'react'

export function PanelHeader({ title, desc, actions }: { title: string; desc?: React.ReactNode; actions?: React.ReactNode }) {
  return (
    <div className="mb-3 flex flex-wrap items-end justify-between gap-2 border-b border-[#EEF2F7] pb-3">
      <div className="min-w-0">
        <h2 className="text-[18px] font-extrabold tracking-tight text-[#0F172A]">{title}</h2>
        {desc && <p className="mt-0.5 text-[12.5px] text-[#64748B]">{desc}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  )
}
