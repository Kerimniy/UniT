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
import { Home, List, Settings, RotateCcwClock, Plus, LogIn, LogOut, CheckCircle2, ShieldAlert, Info, type LucideIcon, BookText, BookA } from "lucide-react"

import { Link, useLocation, useNavigate } from "react-router-dom";
import { BACKEND_BASE_URL, HEADER_ICON_PATH, PAGE_TITLE, SIDEBAR_ICON_PATH } from "@/config";
import { ContextMenu } from "@/components/ContextMenu";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { RequireAuth, useAuth, type UserStruct } from "@/components/Auth";
import { Routes, Route } from "react-router-dom";
import Content from "./Content";
import AccountPage from "./AccountPage";
import EditorPage from "@/pages/Editor"
import IndexPage from "./IndexPage";
import AuthPage from "./AuthPage";
import { authService } from "@/lib/user";
import { useEffect, useState } from "react";


export interface IndexElement {
    title: string
    id: string
    type: string
    y: Number
}

export interface Message {
    value: string
    isError: boolean
}

const docsPages: { name: string, location: string, icon: LucideIcon }[] = [
    { name: "About", location: "/-/docs/about", icon: Info },
    { name: "MD Syntax", location: "/-/docs/md-syntax", icon: BookText },
    { name: "Guide", location: "/-/docs/guide", icon: BookA },
]


function AppSidebar({ pageIndex, user, backendStatus, activeId }: { pageIndex: IndexElement[], user: UserStruct, backendStatus: boolean, activeId: string }) {
    const location = useLocation()
    return (
        <Sidebar className="top-(--header-height) h-[calc(100svh-var(--header-height))]!">
            <SidebarContent>

                <SidebarGroup>
                    <SidebarGroupLabel>Menu</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton render={<Link to={"/"} />}>
                                    <Home />
                                    <span>Home</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>

                            <SidebarMenuItem>
                                <SidebarMenuButton render={<Link to={"/-/index"} />}>
                                    <List />
                                    <span>Index</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>

                            {(user != null && backendStatus) &&
                                <SidebarMenuItem>
                                    <SidebarMenuButton render={<Link to={"/-/edit"} />}>
                                        <Plus />
                                        <span>Create</span>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            }

                            {(user != null && backendStatus) &&
                                <SidebarMenuItem>
                                    <SidebarMenuButton render={<Link to={"/-/settings"} />}>
                                        <Plus />
                                        <span>Settings</span>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            }

                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                {
                    location.pathname.startsWith("/-/docs/") &&
                    <SidebarGroup>
                        <SidebarGroupLabel>Documentation</SidebarGroupLabel>
                        <SidebarGroupContent className="ml-3">
                            {
                                docsPages.map(el => {
                                    return <SidebarMenuButton key={el.location} render={<Link to={el.location} />}>
                                        <el.icon />
                                        <span>{el.name}</span>
                                    </SidebarMenuButton>
                                })
                            }
                        </SidebarGroupContent>
                    </SidebarGroup>
                }

                {pageIndex !== undefined && pageIndex.length > 0 &&
                    <SidebarGroup className="flex-start text-left">
                        <SidebarGroupLabel>Navigation</SidebarGroupLabel>
                        <SidebarGroupContent className="ml-3">
                            {
                                pageIndex.map(el => {
                                    return <div key={el.id}>
                                        <Link className={`index-el index-${el.type} ${activeId === el.id ? "text-primary font-bold" : ""}`} to={`#${el.id}`}>{el.title}</Link>
                                    </div>
                                })
                            }
                        </SidebarGroupContent>
                    </SidebarGroup>
                }

                <SidebarGroup className="h-full flex justify-end">
                    <Link to="/-/docs/about" className="flex flex-col w-full justify-center items-center">
                        <img className="w-[150px]" src={SIDEBAR_ICON_PATH}></img>
                        <p style={{ "color": "var(--muted-foreground)" }}>About Vebvy</p>
                    </Link>
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
                        authService.logout(() => { window.location.reload() })
                    }}
                >
                    <LogOut />
                </Button>
            );
        }
    }

    return null;
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
    const [pageIndex, setPageIndex] = useState<IndexElement[]>([])


    const [activeId, setActiveId] = useState("")


    return (<div className="[--header-height:calc(--spacing(12))] w-full">
        <SidebarProvider className="flex h-svh min-h-0 flex-col overflow-hidden">
            <header className="sticky top-0 z-50 flex h-(--header-height) w-full justify-between items-center gap-2 border-b bg-background px-4">
                <div className="flex flex-row gap-4 items-center h-full">
                    <SidebarTrigger />
                    <div className="h-full flex flex-row items-center gap-2">
                        <img src={HEADER_ICON_PATH} className="p-[0.6rem] h-full "></img>
                        <Link to="/">{PAGE_TITLE}</Link>
                    </div>
                </div>
                <div className="flex flex-row gap-4 items-center">
                    <ThemeToggle></ThemeToggle>
                    <ContextMenu setStatus={setStatus} backendStatus={backendStatus}></ContextMenu>
                    <SignIn status={backendStatus} user={user} navigate={navigate} ></SignIn>

                </div>
            </header>
            <div className="flex min-h-0 w-full flex-1 overflow-hidden">
                <AppSidebar activeId={activeId} user={user} backendStatus={backendStatus} pageIndex={pageIndex} />
                <SidebarInset className="min-h-0 min-w-0 overflow-hidden">
                    {status != null && (
                        <div className={`p-3 rounded-lg text-sm flex gap-2 items-start ${status.isError == false ? "bg-emerald-500/10 text-emerald-500" : "bg-destructive/10 text-destructive"
                            }`}>
                            {status.isError == false ? <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" /> : <ShieldAlert className="w-4 h-4 mt-0.5 shrink-0" />}
                            <span>{status.value}</span>
                        </div>
                    )}

                    <main className="flex min-h-0 min-w-0 flex-1 flex-col">
                        <Routes>
                            <Route path="/*" element={<Content setPageIndex={setPageIndex} setActiveId={setActiveId}></Content>}></Route>
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