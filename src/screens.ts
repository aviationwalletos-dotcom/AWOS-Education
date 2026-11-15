// 만든 화면을 여기에 올린다. 올리지 않은 메뉴는 자리 화면("준비 중")이 뜬다.
// 열쇠는 "묶음 id/화면 id" — menu.ts 에 적힌 이름 그대로.
import { lazy } from 'react'
import type React from 'react'

const g1000 = lazy(() => import('./features/g1000/G1000Trainer'))

export const SCREENS: Record<string, React.LazyExoticComponent<React.ComponentType>> = {
  // G1000 과제(Fix-to-Fix · Holding Entry · 래디얼 인터셉트 · DME Arc · 통합 과제)는 트레이너 안에서 고른다
  'g1000/pfd': g1000,
  'g1000/fix-to-fix': g1000,
  'g1000/holding-entry': g1000,
  'g1000/radial': g1000,
  'g1000/dme-arc': g1000,
  'g1000/task': g1000,
  'local/airport': lazy(() => import('./features/local/rkpd/AirportTrainer')),
}
