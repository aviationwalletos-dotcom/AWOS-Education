// 이 모듈이 무엇이고 어디에 붙는지. 값은 저장소 맨 위 module.config.json 에서 고친다.
import config from '../module.config.json'

export const MODULE = {
  id: config.id as string,
  /** 머리의 알약에 나오는 짧은 이름 */
  name: config.name as string,
  /** 홈 제목 · 탭 제목 */
  title: config.title as string,
}

/** 라우터가 쓰는 붙는 주소. 빌드 때 정해진다(vite.config.ts). 끝의 / 는 뗀다 */
export const BASENAME = import.meta.env.BASE_URL.replace(/\/+$/, '') || '/'

/** AWOS 앱 주소 — 같은 도메인 아래에 붙어 있으면 그 도메인, 아니면 환경변수 · 기본값 */
export const AWOS_ORIGIN = ((import.meta.env.VITE_AWOS_ORIGIN as string | undefined) || 'https://aviationwallet.com').replace(/\/+$/, '')
