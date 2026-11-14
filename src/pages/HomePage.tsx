import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'

import { MENU, MODULE_DESC } from '../menu'
import { MODULE } from '../module'
import { SCREENS } from '../screens'
import { PanelHeader } from '../shell/PanelHeader'

export default function HomePage() {
  return (
    <>
      <PanelHeader title={MODULE.title} desc={MODULE_DESC} />
      <div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
        {MENU.map((g) => {
          const Icon = g.icon
          return (
            <section key={g.id} className="awos-card p-4">
              <Link to={`/${g.id}`} className="flex items-center gap-2 rounded hover:opacity-80">
                <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-[#EFF6FF] text-[#2563EB]">
                  <Icon className="h-4 w-4" aria-hidden={true} />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-[15px] font-extrabold tracking-tight text-[#0F172A]">{g.label}</span>
                  <span className="block truncate text-[12.5px] text-[#64748B]">{g.desc}</span>
                </span>
              </Link>
              <ul className="mt-3 border-t border-[#EEF2F7]">
                {g.items.map((it) => (
                  <li key={it.id} className="border-b border-[#EEF2F7] last:border-b-0">
                    <Link to={`/${g.id}/${it.id}`} className="flex min-h-[40px] items-center justify-between gap-2 rounded px-1 text-[14px] font-medium text-[#334155] hover:bg-[#F8FAFC]">
                      <span className="truncate">{it.label}</span>
                      <span className="flex shrink-0 items-center gap-1.5">
                        {!SCREENS[`${g.id}/${it.id}`] && <span className="text-[12px] font-semibold text-[#94A3B8]">준비 중</span>}
                        <ChevronRight className="h-4 w-4 text-[#94A3B8]" aria-hidden={true} />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )
        })}
      </div>
    </>
  )
}
