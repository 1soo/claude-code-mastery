import * as React from "react"

const MOBILE_BREAKPOINT = 768

// matchMedia 변경 구독 (외부 스토어 구독 패턴)
function subscribe(callback: () => void) {
  const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
  mql.addEventListener("change", callback)
  return () => mql.removeEventListener("change", callback)
}

// useSyncExternalStore로 모바일 여부를 안전하게 동기화 (SSR 시 false)
export function useIsMobile() {
  return React.useSyncExternalStore(
    subscribe,
    () => window.innerWidth < MOBILE_BREAKPOINT,
    () => false,
  )
}
