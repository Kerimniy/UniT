import type { ReactNode } from "react";
import { useState, createContext, useContext, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { BACKEND_BASE_URL } from "@/config";
import { Spinner } from "./ui/spinner";

export interface UserStruct {
    email: string;
    createdAt: string;

}

export function RequireAuth({ children }: { children: ReactNode }) {
    const { user, loading } = useAuth();

    if (loading) return <Spinner />; 
    if (!user) return <Navigate to="/-/auth/sign-in" replace />;

    return <>{children}</>;
}

export const AuthContext = createContext<{
    user: UserStruct | null;
    setUser: React.Dispatch<React.SetStateAction<UserStruct | null>>;
    updateUser: () => Promise<void>;
    loading: boolean
} | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<UserStruct | null>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate()
    useEffect(() => {
        const controller = new AbortController();

        (async () => {
            try {
                const r = await fetch(`${BACKEND_BASE_URL}/auth/me`, {
                    credentials: "include",
                    signal: controller.signal,
                });

                if (r.ok && r.headers.get("content-type")?.includes("application/json")) {
                    setUser(await r.json());
                } else {
                    setUser(null); 
                }
            } catch (e) {
                if ((e as Error).name !== "AbortError") setUser(null);
            } finally {
                if (!controller.signal.aborted) setLoading(false);
            }
        })();

        return () => controller.abort();
    }, []);

    const updateUser = async () => {
        const r = await fetch(`${BACKEND_BASE_URL}/auth/me`, {
            credentials: "include"
        });

        if (!r.ok) {
            setUser(null);
            return;
        }
        if (r.ok) {
            if (r.headers.get("content-type")?.includes("application/json")) {
                setUser(await r.json());
            }
            else {
                navigate("/-/auth/sign-up")
                setUser(null)
            }
        };

    };
    return (
        <AuthContext.Provider value={{ user, setUser, updateUser, loading }}>
            {children}
        </AuthContext.Provider>
    );
}


export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("No AuthProvider");
    return ctx;
}
