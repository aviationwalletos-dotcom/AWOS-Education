import { Link, useParams } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'

import { MENU } from '../menu'
import { SCREENS } from '../screens'
import { PanelHeader } from '../shell/PanelHeader'
import { findGroup } from '../shell/types'
import NotFoundPage from './NotFoundPage'

export default function GroupPage() {
  const { groupId } = useParams()
  const group = findGroup(MENU, groupId)
  if (!group) return <NotFoundPage />
  return (
    <>
      <PanelHeader title={group.label} desc={group.desc} />
      <div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
        {group.items.map((it) => (
          <Link key={it.id} to={`/${group.id}/${it.id}`} className="awos-card flex items-center justify-between gap-3 p-4 hover:border-[#BFD4F7]">
            <span className="min-w-0">
              <span className="block truncate text-[15px] font-extrabold tracking-tight text-[#0F172A]">{it.label}</span>
              <span className="mt-0.5 block text-[12.5px] text-[#64748B]">{it.desc}</span>
            </span>
            <span className="flex shrink-0 items-center gap-1.5">
              {!SCREENS[`${group.id}/${it.id}`] && <span className="text-[12px] font-semibold text-[#94A3B8]">준비 중</span>}
              <ChevronRight className="h-4 w-4 text-[#94A3B8]" aria-hidden={true} />
            </span>
          </Link>
        ))}
      </div>
    </>
  )
}
