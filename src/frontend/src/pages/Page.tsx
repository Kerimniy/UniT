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
import { Home, List, Settings, RotateCcwClock, Plus, LogIn, LogOut } from "lucide-react"

import { useNavigate } from "react-router-dom";
import { BACKEND_BASE_URL } from "@/config";
import { ContextMenu } from "@/components/ContextMenu";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { useAuth, type UserStruct } from "@/components/Auth";
import { Routes, Route } from "react-router-dom";
import Content from "./Content";
import AccountPage from "./AccountPage";
import EditorPage  from "@/pages/Editor"
import IndexPage from "./IndexPage";
import AuthPage from "./AuthPage";
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
                <Button onClick={() => navigate("/-/sign-in")}>
                    <LogIn />
                </Button>
            );
        } else {
            return (
                <Button
                    onClick={() => {
                        fetch(`${BACKEND_BASE_URL}/api/log-out`)
                            .then((res) => {
                                if (res.ok) {
                                    window.location.reload();
                                }
                            });
                    }}
                >
                    <LogOut />
                </Button>
            );
        }
    }

    return null;
}

export default function Page({ backendStatus }: { backendStatus: boolean }) {

    const navigate = useNavigate()

    const { user } = useAuth()


    return (<div className="[--header-height:calc(--spacing(12))] w-full">
        <SidebarProvider className="flex flex-col">
            <header className="sticky top-0 z-50 flex h-(--header-height) w-full justify-between items-center gap-2 border-b bg-background px-4">
                <div className="flex flex-row gap-4 items-center">
                    <SidebarTrigger />
                    <p className="text-m font-medium">Vebvy</p>
                </div>
                <div className="flex flex-row gap-4 items-center">
                    <ThemeToggle></ThemeToggle>
                    <ContextMenu></ContextMenu>
                    <SignIn status={backendStatus} user={user} navigate={navigate} ></SignIn>

                </div>
            </header>
            <div className="flex flex-1 w-full">
                <AppSidebar />
                <SidebarInset className="min-w-0">
                    <main className="p-4 w-full text-left">
                        <Routes>
                            <Route path="/*" element={<Content></Content>}></Route>
                            <Route path="/-/settings" element={<AccountPage></AccountPage>}></Route>
                            <Route path="/-/edit" element={<EditorPage></EditorPage>}></Route>
                            <Route path="/-/index" element={<IndexPage></IndexPage>}></Route>
                            <Route path="/-/auth/*" element={<AuthPage></AuthPage>}></Route>
                        </Routes>

                    </main>
                </SidebarInset>
            </div>
        </SidebarProvider>
    </div>)
}