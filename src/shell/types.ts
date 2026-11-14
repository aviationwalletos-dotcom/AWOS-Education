import type React from 'react'

/** 메뉴 맨 아래 한 칸 = 화면 하나 */
export interface MenuItem {
  /** 주소에 들어가는 이름(영문 소문자 · 숫자 · -) */
  id: string
  label: string
  /** 화면 제목 아래 한 줄 */
  desc: string
  /** 이 화면에 들어갈 기능(만들기 전까지 자리 화면에 보인다) */
  plan: string[]
  /** AWOS 에서 받아 올 것 · 넘겨 줄 것 */
  awos?: string[]
}

/** 메뉴 묶음 */
export interface MenuGroup {
  id: string
  label: string
  desc: string
  icon: React.ComponentType<{ className?: string; 'aria-hidden'?: boolean }>
  items: MenuItem[]
}

export function findGroup(menu: MenuGroup[], groupId: string | undefined): MenuGroup | undefined {
  return menu.find((g) => g.id === groupId)
}

export function findItem(menu: MenuGroup[], groupId: string | undefined, itemId: string | undefined): { group: MenuGroup; item: MenuItem } | undefined {
  const group = findGroup(menu, groupId)
  const item = group?.items.find((it) => it.id === itemId)
  return group && item ? { group, item } : undefined
}
