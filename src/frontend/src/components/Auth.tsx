import type { ReactNode } from "react";
import { useState, createContext, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { BACKEND_BASE_URL } from "@/config";

export interface UserStruct {
    email: string;
    createdAt: string;

}

export const AuthContext = createContext<{
    user: UserStruct | null;
    setUser: React.Dispatch<React.SetStateAction<UserStruct | null>>;
    updateUser: () => Promise<void>;
} | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<UserStruct | null>(null);
    const navigate = useNavigate()
    /*useEffect(() => {
        fetch(`${BACKEND_BASE_URL}/auth/me`, {
            credentials: "include"
        })
            .then(r => {

                if (r.ok) {
                    if (r.headers.get("content-type")?.includes("application/json")) {
                        return r.json()
                    }
                    else {
                        return r.text()
                    }
                }
                else if (r.status === 401) {
                }
                return null;
            })
            .then((data) => {
                if (typeof (data) === "string" && data === "no-user") {
                    navigate("/.@/auth/sign-up")
                } else {
                    setUser(data);
                }
            });
    }, []);
*/

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
                navigate("/.@/auth/sign-up")
                setUser(null)
            }
        };

    };
    return (
        <AuthContext.Provider value={{ user, setUser, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
}


export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("No AuthProvider");
    return ctx;
}
