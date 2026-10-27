import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarInset,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar"
import { Home, List, Settings, RotateCcwClock, Plus, LogIn, LogOut, CheckCircle2, ShieldAlert } from "lucide-react"

import { useNavigate } from "react-router-dom";
import { BACKEND_BASE_URL } from "@/config";
import { ContextMenu } from "@/components/ContextMenu";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { RequireAuth, useAuth, type UserStruct } from "@/components/Auth";
import { Routes, Route } from "react-router-dom";
import Content from "./Content";
import AccountPage from "./AccountPage";
import EditorPage  from "@/pages/Editor"
import IndexPage from "./IndexPage";
import AuthPage from "./AuthPage";
import { authService } from "@/lib/user";
import { useState } from "react";
const items = [
    { title: "Home", url: "/", icon: Home },
    { title: "Index", url: "/-/index", icon: List },
    { title: "History", url: "/-/history", icon: RotateCcwClock },
    { title: "Create", url: "/-/edit", icon: Plus },
    { title: "Settings", url: "/-/settings", icon: Settings },
]



function AppSidebar() {
    return (
        <Sidebar className="top-(--header-height) h-[calc(100svh-var(--header-height))]!">
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Menu</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {items.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton render={<a href={item.url} />}>
                                        <item.icon />
                                        <span>{item.title}</span>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    )
}

function SignIn({
    status,
    user,
    navigate,
}: {
    status: boolean;
    user: UserStruct | null;
    navigate: (to: string) => void;
}) {
    if (status) {
        if (user == null) {
            return (
                <Button variant="outline" onClick={() => navigate("/-/auth/sign-in")}>
                    <LogIn />
                </Button>
            );
        } else {
            return (
                <Button variant="outline"
                    onClick={() => {
                        authService.logout(()=>{window.location.reload()})
                    }}
                >
                    <LogOut />
                </Button>
            );
        }
    }

    return null;
}

export interface Message {
    value: string
    isError: boolean
}

export function setNewStatus(msg: string, isError: boolean, setStatus: React.Dispatch<React.SetStateAction<Message>>) {

    let message: Message = { "value": msg, "isError": isError }

    setStatus(message)

    setTimeout(() => { setStatus(null) }, 10000)
}


export default function Page({ backendStatus }: { backendStatus: boolean }) {

    const navigate = useNavigate()

    const { user } = useAuth()

    const [status, setStatus] = useState<Message | null>(null)
    

    return (<div className="[--header-height:calc(--spacing(12))] w-full">
        <SidebarProvider className="flex flex-col">
            <header className="sticky top-0 z-50 flex h-(--header-height) w-full justify-between items-center gap-2 border-b bg-background px-4">
                <div className="flex flex-row gap-4 items-center">
                    <SidebarTrigger />
                    <p className="text-m font-medium">Vebvy</p>
                </div>
                <div className="flex flex-row gap-4 items-center">
                    <ThemeToggle></ThemeToggle>
                    <ContextMenu setStatus={setStatus}></ContextMenu>
                    <SignIn status={backendStatus} user={user} navigate={navigate} ></SignIn>

                </div>
            </header>
            <div className="flex flex-1 w-full">
                <AppSidebar />
                <SidebarInset className="min-w-0">
                    {status !=null && (
                        <div className={`p-3 rounded-lg text-sm flex gap-2 items-start ${status.isError == false ? "bg-emerald-500/10 text-emerald-500" : "bg-destructive/10 text-destructive"
                            }`}>
                            {status.isError == false ? <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" /> : <ShieldAlert className="w-4 h-4 mt-0.5 shrink-0" />}
                            <span>{status.value}</span>
                        </div>
                    )}

                    <main className="w-full h-full text-left">
                        <Routes>
                            <Route path="/*" element={<Content></Content>}></Route>
                            <Route path="/-/settings" element={<RequireAuth><AccountPage></AccountPage></RequireAuth>}></Route>
                            <Route path="/-/edit" element={<RequireAuth><EditorPage></EditorPage></RequireAuth>}></Route>
                            <Route path="/-/index" element={<IndexPage></IndexPage>}></Route>
                            <Route path="/-/auth/*" element={<AuthPage></AuthPage>}></Route>
                        </Routes>

                    </main>
                </SidebarInset>
            </div>
        </SidebarProvider>
    </div>)
}