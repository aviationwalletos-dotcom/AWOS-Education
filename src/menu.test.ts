import { describe, expect, it } from 'vitest'

import { MENU } from './menu'
import { SCREENS } from './screens'

const ID = /^[a-z0-9]+(-[a-z0-9]+)*$/

describe('메뉴 트리', () => {
  it('묶음 id 가 주소에 쓸 수 있는 모양이고 겹치지 않는다', () => {
    const ids = MENU.map((g) => g.id)
    ids.forEach((id) => expect(id).toMatch(ID))
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('묶음마다 화면이 있고, 화면 id 가 묶음 안에서 겹치지 않는다', () => {
    for (const g of MENU) {
      expect(g.items.length).toBeGreaterThan(0)
      const ids = g.items.map((it) => it.id)
      ids.forEach((id) => expect(id).toMatch(ID))
      expect(new Set(ids).size).toBe(ids.length)
      g.items.forEach((it) => expect(it.plan.length).toBeGreaterThan(0))
    }
  })

  it('screens.ts 에 올린 화면은 모두 메뉴에 있다', () => {
    const keys = new Set(MENU.flatMap((g) => g.items.map((it) => `${g.id}/${it.id}`)))
    Object.keys(SCREENS).forEach((key) => expect(keys.has(key)).toBe(true))
  })
})
