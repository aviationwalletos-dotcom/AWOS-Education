// AWOS 기관 대시보드와 같은 틀 — 흰 머리 + 왼쪽 메뉴 레일(1024px 이상) + 오른쪽 본문.
// 좁은 화면은 가로 알약 한 줄(홈 · 지금 묶음 · 지금 화면) + [전체 메뉴].
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useParams } from 'react-router-dom'
import { ChevronDown, LayoutGrid, Menu } from 'lucide-react'

import { useAwosAccount } from '../lib/useAwosAccount'
import { MENU } from '../menu'
import { AWOS_ORIGIN, MODULE } from '../module'
import { MenuSheet } from './MenuSheet'
import { findGroup, findItem } from './types'

const FOCUS = 'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky'

export function AppShell() {
  const headerRef = useRef<HTMLElement>(null)
  const [headerHeight, setHeaderHeight] = useState(61)
  const { groupId, itemId } = useParams()
  const location = useLocation()
  const account = useAwosAccount()
  const [openGroup, setOpenGroup] = useState<string | null>(groupId ?? null)
  const [narrowMenu, setNarrowMenu] = useState(false)

  const currentGroup = findGroup(MENU, groupId)
  const current = findItem(MENU, groupId, itemId)

  useLayoutEffect(() => {
    const el = headerRef.current
    if (!el) return
    const measure = () => setHeaderHeight(el.getBoundingClientRect().height)
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // 주소가 바뀌면 그 화면이 든 묶음을 펼치고, 맨 위로 올린다
  useEffect(() => {
    if (groupId) setOpenGroup(groupId)
    setNarrowMenu(false)
    window.scrollTo({ top: 0 })
  }, [groupId, location.pathname])

  return (
    <div className="awos-shell awos-admin min-h-screen font-body">
      <header ref={headerRef} className="sticky top-0 z-50 border-b border-[#E6EBF2] bg-white">
        <div className="flex w-full items-center justify-between gap-2 px-4 py-2.5 sm:px-6 lg:py-3">
          <div className="flex min-w-0 items-center gap-3">
            <Link
              to="/"
              title={`${MODULE.title} 첫 화면으로`}
              className={`shrink-0 rounded font-display text-[17px] font-extrabold tracking-tight text-[#0F172A] hover:opacity-80 lg:text-[19px] ${FOCUS}`}
            >
              <span className="sm:hidden">
                AW<span className="text-[#2563EB]">OS</span>
              </span>
              <span className="hidden sm:inline">
                Aviation Wallet <span className="text-[#2563EB]">OS</span>
              </span>
            </Link>
            <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[#E2E8F0] bg-[#F8FAFC] px-2.5 py-1 text-[12px] font-bold text-[#334155]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#10B981]" aria-hidden="true" />
              {MODULE.name}
            </span>
            {account.name && (
              <p className="hidden min-w-0 truncate border-l border-[#E2E8F0] pl-3 text-[13px] text-[#475569] xl:block">
                안녕하세요, <span className="font-bold text-[#2563EB]">{account.name}</span>님
              </p>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {account.status === 'guest' && (
              <a href={`${AWOS_ORIGIN}/login`} className="awos-btn-line inline-flex items-center">
                로그인
              </a>
            )}
            <a href={`${AWOS_ORIGIN}/`} aria-label="AWOS 앱으로" className="awos-btn-line inline-flex items-center">
              <LayoutGrid className="h-4 w-4 sm:hidden" aria-hidden={true} />
              <span className="hidden sm:inline">AWOS 앱</span>
            </a>
          </div>
        </div>
      </header>

      <main>
        <div className="menu-rail-layout">
          <section
            style={{ top: headerHeight, ['--rail-min' as string]: `calc(100svh - ${headerHeight}px)` }}
            className="menu-rail sticky z-30 border-b border-[#E6EBF2] bg-white lg:border-b-0 lg:border-r"
          >
            <div className="w-full px-3">
              {/* 좁은 화면 — 홈 · 지금 묶음 · 지금 화면 + [전체 메뉴] */}
              <nav
                aria-label={`${MODULE.name} 메뉴`}
                className="-mx-3 flex gap-1.5 overflow-x-auto px-3 py-2 [scrollbar-width:none] lg:hidden [&::-webkit-scrollbar]:hidden [&>*]:shrink-0"
              >
                <NavLink to="/" end className={`awos-nav-item !w-auto whitespace-nowrap ${FOCUS}`}>
                  홈
                </NavLink>
                {currentGroup && (
                  <NavLink to={`/${currentGroup.id}`} end className={`awos-nav-item !w-auto whitespace-nowrap ${FOCUS}`}>
                    {currentGroup.label}
                  </NavLink>
                )}
                {current && (
                  <NavLink to={`/${current.group.id}/${current.item.id}`} className={`awos-nav-item !w-auto whitespace-nowrap ${FOCUS}`}>
                    {current.item.label}
                  </NavLink>
                )}
                <button
                  type="button"
                  onClick={() => setNarrowMenu(true)}
                  className={`awos-nav-item !w-auto ml-auto inline-flex items-center gap-1.5 whitespace-nowrap ${FOCUS}`}
                  aria-haspopup="dialog"
                >
                  <Menu className="h-4 w-4" aria-hidden={true} />
                  전체 메뉴
                </button>
              </nav>
              {narrowMenu && (
                <MenuSheet title="전체 메뉴" onClose={() => setNarrowMenu(false)}>
                  <div className="space-y-4">
                    <Link to="/" className={pill(location.pathname === '/')}>
                      홈
                    </Link>
                    {MENU.map((g) => (
                      <section key={g.id}>
                        <p className="mb-1.5 text-[12px] font-bold text-[#64748B]">{g.label}</p>
                        <div className="flex flex-wrap gap-1.5">
                          {g.items.map((it) => (
                            <Link key={it.id} to={`/${g.id}/${it.id}`} className={pill(current?.group.id === g.id && current.item.id === it.id)}>
                              {it.label}
                            </Link>
                          ))}
                        </div>
                      </section>
                    ))}
                  </div>
                </MenuSheet>
              )}

              {/* 넓은 화면 — 접는 묶음 */}
              <nav aria-label={`${MODULE.name} 메뉴`} className="hidden py-3 lg:block">
                <NavLink to="/" end className={`awos-nav-item mb-1 !font-bold ${FOCUS}`}>
                  <span className="truncate">홈</span>
                </NavLink>
                {MENU.map((g) => {
                  const open = openGroup === g.id
                  return (
                    <React.Fragment key={g.id}>
                      <button
                        type="button"
                        aria-expanded={open}
                        onClick={() => setOpenGroup((cur) => (cur === g.id ? null : g.id))}
                        className={`awos-nav-group mt-1 ${FOCUS}`}
                      >
                        <span className="truncate">{g.label}</span>
                        <ChevronDown className={`ml-auto h-4 w-4 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden={true} />
                      </button>
                      <div className={`menu-group ${open ? '' : 'is-collapsed'}`} inert={!open}>
                        <div className="flex flex-col gap-0.5">
                          {g.items.map((it) => (
                            <NavLink key={it.id} to={`/${g.id}/${it.id}`} className={`awos-nav-item !pl-6 ${FOCUS}`}>
                              <span className="truncate">{it.label}</span>
                            </NavLink>
                          ))}
                        </div>
                      </div>
                    </React.Fragment>
                  )
                })}
              </nav>
            </div>
          </section>

          <div className="menu-rail-body">
            <div className="mx-auto w-full max-w-[1500px] px-4 py-4 sm:px-6 lg:py-6">
              <Outlet />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

function pill(active: boolean): string {
  return `inline-flex items-center gap-1.5 rounded-[10px] border px-3 py-2 text-[14px] font-semibold ${
    active ? 'border-[#2563EB] bg-[#2563EB] text-white' : 'border-[#E2E8F0] bg-white text-[#0F172A] hover:bg-[#F1F5F9]'
  }`
}
