// 만든 화면을 여기에 올린다. 올리지 않은 메뉴는 자리 화면("준비 중")이 뜬다.
//
// 예) G1000 Trainer → PFD 기본 조작 화면을 만들었다면
//   'g1000/pfd': lazy(() => import('./features/g1000/Pfd')),
// 열쇠는 "묶음 id/화면 id" — menu.ts 에 적힌 이름 그대로.
import type React from 'react'

export const SCREENS: Record<string, React.LazyExoticComponent<React.ComponentType>> = {}
