import { useEffect, useState } from 'react'

import { AWOS_LINKED, getAwosClient } from './awos'

export interface AwosAccount {
  /** off = 연동 안 함 · loading = 확인 중 · guest = 로그인 안 됨 · user = 로그인 됨 */
  status: 'off' | 'loading' | 'guest' | 'user'
  name: string | null
}

/** AWOS 로그인 상태. 연동 값이 없으면 늘 off */
export function useAwosAccount(): AwosAccount {
  const [account, setAccount] = useState<AwosAccount>({ status: AWOS_LINKED ? 'loading' : 'off', name: null })

  useEffect(() => {
    if (!AWOS_LINKED) return
    let alive = true
    let unsubscribe: (() => void) | undefined
    void getAwosClient().then((client) => {
      if (!client || !alive) return
      const apply = (user: { email?: string; user_metadata?: Record<string, unknown> } | null | undefined) => {
        if (!alive) return
        if (!user) return setAccount({ status: 'guest', name: null })
        const metaName = typeof user.user_metadata?.name === 'string' ? user.user_metadata.name : null
        setAccount({ status: 'user', name: metaName || user.email || null })
      }
      void client.auth.getSession().then(({ data }) => apply(data.session?.user))
      const { data } = client.auth.onAuthStateChange((_event, session) => apply(session?.user))
      unsubscribe = () => data.subscription.unsubscribe()
    })
    return () => {
      alive = false
      unsubscribe?.()
    }
  }, [])

  return account
}
