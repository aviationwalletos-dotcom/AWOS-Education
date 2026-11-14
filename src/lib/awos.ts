// AWOS(Supabase) 연결. 환경변수가 비어 있으면 연결하지 않는다(화면만 뜬다).
// AWOS 와 같은 도메인 아래에 붙어 있고 같은 프로젝트 값을 쓰면, 브라우저에 저장된 AWOS 로그인 상태를 그대로 읽는다.
import type { SupabaseClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export const AWOS_LINKED = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY)

let pending: Promise<SupabaseClient> | null = null

/** 연결돼 있으면 클라이언트, 아니면 null. 라이브러리는 처음 부를 때 받는다(첫 화면을 가볍게) */
export function getAwosClient(): Promise<SupabaseClient | null> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return Promise.resolve(null)
  pending ??= import('@supabase/supabase-js').then(({ createClient }) =>
    createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { persistSession: true, autoRefreshToken: true } }),
  )
  return pending
}
