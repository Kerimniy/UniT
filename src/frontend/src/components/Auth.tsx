import type { ReactNode } from "react"
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import { Navigate } from "react-router-dom"
import { BACKEND_BASE_URL } from "@/config"
import { Spinner } from "./ui/spinner"

export interface UserStruct { email: string; createdAt: string }

type AuthState = {
  user: UserStruct | null
  adminExists: boolean   
  loading: boolean
}
type AuthContextValue = AuthState & { updateUser: () => Promise<void> }

async function fetchMe(signal?: AbortSignal): Promise<Pick<AuthState, "user" | "adminExists">> {
  const r = await fetch(`${BACKEND_BASE_URL}/auth/me`, { credentials: "include", signal })
  if (r.ok && r.headers.get("content-type")?.includes("application/json"))
    return { user: await r.json(), adminExists: true }
  if (r.ok) return { user: null, adminExists: false }   
  return { user: null, adminExists: true }              
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ user: null, adminExists: true, loading: true })

  useEffect(() => {
    const ctrl = new AbortController()
    fetchMe(ctrl.signal)
      .then(me => setState({ ...me, loading: false }))
      .catch(e => {
        if (e.name !== "AbortError") setState({ user: null, adminExists: true, loading: false })
      })
    return () => ctrl.abort()
  }, [])

  const updateUser = useCallback(async () => {
    try {
      setState({ ...(await fetchMe()), loading: false })
    } catch {
      setState(s => ({ ...s, user: null }))
    }
  }, [])

  const value = useMemo(() => ({ ...state, updateUser }), [state, updateUser])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading, adminExists } = useAuth()
  if (loading) return <Spinner />
  if (!adminExists) return <Navigate to="/-/auth/sign-up" replace />   
  if (!user) return <Navigate to="/-/auth/sign-in" replace />
  return <>{children}</>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("No AuthProvider")
  return ctx
}