import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Button } from "./ui/button";
import { Copy, Trash, Edit, EllipsisVertical, Paperclip, Plus, Pencil, Loader2, FilePen } from "lucide-react";
import { useNavigate } from "react-router-dom";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { deleteRequest, renameRequest } from "@/lib/manage";
import { Input } from "./ui/input";
import { useState } from "react";
import { setNewStatus, type Message } from "@/pages/Page";




export function ContextMenu({ setStatus }: { setStatus: React.Dispatch<React.SetStateAction<Message>> }) {
    let navigate = useNavigate()

    let [newName, setNewName] = useState("")

    const [isRenaming, setIsRenaming] = useState(false)
    const [openRename, setOpenRename] = useState(false)


    const items = [
        { title: "Copy Link", icon: Copy, action: () => { navigator.clipboard.writeText(window.location.href) } },
        { title: "Create", icon: Plus, action: () => navigate(`/-/edit`) },
        { title: "Edit", icon: FilePen, action: () => navigate(`/-/edit?page=${location.pathname}`) },

    ]

    return (
        <Popover>
            <PopoverTrigger>
                <Button variant="outline"><EllipsisVertical></EllipsisVertical></Button>
            </PopoverTrigger>
            <PopoverContent className="w-fit">

                <AlertDialog>
                    <AlertDialogTrigger render={
                        <Button variant="ghost" className={"flex flex-row gap-3 justify-start"}>
                            <Trash />
                            <span>Delete</span>
                        </Button>
                    }>
                        Show Dialog
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action cannot be undone.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => { deleteRequest(location.pathname).then(res => { if (res.ok) { window.location.href = "/" } }) }}>Continue</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>


                <AlertDialog open={openRename}>

                    <AlertDialogTrigger onClick={() => { setOpenRename(!openRename); setNewName(location.pathname) }} render={
                        <Button variant="ghost" className={"flex flex-row gap-3 justify-start"}>
                            <Pencil />
                            <span>Rename</span>
                        </Button>
                    }>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Rename</AlertDialogTitle>
                            <AlertDialogDescription className="w-full">
                                <div className="flex flex-col gap-4 w-full">

                                    <p className="text-center w-full">This action cannot be undone.</p>

                                    <Input value={newName} onInput={(e) => { setNewName(e.currentTarget.value) }} className="w-full" placeholder="New filename" />

                                </div>
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel disabled={isRenaming}>Cancel</AlertDialogCancel>
                            <Button variant="default" onClick={async () => {
                                setIsRenaming(true)
                                let res = await renameRequest(location.pathname, newName) 
                                if (!res.isError) {
                                    navigate(newName)
                                }
                                else {
                                    setNewStatus(res.value, true, setStatus)
                                }
                                setIsRenaming(false)
                                setOpenRename(false)
                            }
                            }>{isRenaming ? (
                                <>
                                    <Loader2 className="animate-spin" />
                                    Renaming...
                                </>
                            ) : (
                                "Continue"
                            )}</Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                <div className="flex flex-col gap-1">
                    {items.map((item) => (
                        <Button variant="ghost" className={"flex flex-row gap-3 justify-start"} key={item.title} onClick={item.action}>
                            <item.icon />
                            <span>{item.title}</span>
                        </Button>
                    ))}
                </div>
            </PopoverContent>
        </Popover>
    )
}