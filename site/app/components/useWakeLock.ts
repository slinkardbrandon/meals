import { useEffect } from 'react'

/** Keeps the screen on while mounted. Re-requests when the tab becomes visible; no-op where unsupported. */
export const useWakeLock = () => {
  useEffect(() => {
    if (!('wakeLock' in navigator)) return
    let lock: WakeLockSentinel | undefined
    let active = true
    const request = async () => {
      if (document.visibilityState !== 'visible') return
      try {
        const next = await navigator.wakeLock.request('screen')
        if (active) lock = next
        else void next.release()
      } catch {
        // Denied (battery saver, permissions policy). Nothing to do.
      }
    }
    void request()
    document.addEventListener('visibilitychange', request)
    return () => {
      active = false
      document.removeEventListener('visibilitychange', request)
      void lock?.release()
    }
  }, [])
}
