
import { useSyncExternalStore } from "react"

export interface IndexElement { title: string | null; type: string; id: string; y: number }
type Toc = { items: IndexElement[]; activeId: string }

let state: Toc = { items: [], activeId: "" }
const subs = new Set<() => void>()

export const tocStore = {
  get: () => state,
  set(p: Partial<Toc>) {
    const next = { ...state, ...p }
    if (next.items === state.items && next.activeId === state.activeId) return 
    state = next
    subs.forEach(f => f())
  },
  subscribe(f: () => void) { subs.add(f); return () => { subs.delete(f) } },
}

export const useToc = () => useSyncExternalStore(tocStore.subscribe, tocStore.get)