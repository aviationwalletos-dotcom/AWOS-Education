// 메뉴 한 칸의 화면. screens.ts 에 올린 화면이 있으면 그것을, 없으면 자리 화면을 보여 준다.
import { Suspense } from 'react'
import { Link, useParams } from 'react-router-dom'

import { MENU } from '../menu'
import { SCREENS } from '../screens'
import { PanelHeader } from '../shell/PanelHeader'
import { findItem } from '../shell/types'
import NotFoundPage from './NotFoundPage'

export default function ItemPage() {
  const { groupId, itemId } = useParams()
  const found = findItem(MENU, groupId, itemId)
  if (!found) return <NotFoundPage />
  const { group, item } = found
  const Screen = SCREENS[`${group.id}/${item.id}`]

  return (
    <>
      <Link to={`/${group.id}`} className="mb-1 inline-block rounded text-[12.5px] font-bold text-[#2563EB] hover:underline">
        {group.label}
      </Link>
      <PanelHeader
        title={item.label}
        desc={item.desc}
        actions={!Screen && <span className="inline-flex items-center rounded-control border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700">준비 중</span>}
      />
      {Screen ? (
        <Suspense fallback={<p className="py-10 text-center text-[13px] text-[#64748B]">불러오는 중…</p>}>
          <Screen />
        </Suspense>
      ) : (
        <section className="awos-card p-4 sm:p-5">
          <h3 className="awos-card-title">들어갈 기능</h3>
          <ul className="mt-2.5 space-y-2">
            {item.plan.map((line) => (
              <li key={line} className="flex gap-2.5 text-[14px] leading-relaxed text-[#334155]">
                <span className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-[#2563EB]" aria-hidden="true" />
                {line}
              </li>
            ))}
          </ul>
          {item.awos && (
            <div className="awos-inset mt-4 p-3.5">
              <p className="text-[12px] font-bold text-[#64748B]">AWOS 연동</p>
              <ul className="mt-1.5 space-y-1">
                {item.awos.map((line) => (
                  <li key={line} className="text-[13.5px] leading-relaxed text-[#334155]">
                    {line}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}
    </>
  )
}
