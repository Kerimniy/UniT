import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Button } from "./ui/button";
import { Copy, Trash, Edit, EllipsisVertical, Paperclip, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";



export function ContextMenu() {
    let navigate = useNavigate()

    const items = [
        { title: "Copy Link", icon: Copy, action: () => { navigator.clipboard.writeText(window.location.href) } },
        { title: "Create", icon: Plus, action: () => navigate("/-/create") },
        { title: "Rename", icon: Edit, action: () => ({}) },
        { title: "Delete", icon: Trash, action: () => ({}) },
        { title: "Add attachment", icon: Paperclip, action: () => (navigate("/-/upload")) },

    ]

    return (
        <Popover>
            <PopoverTrigger>
                <Button variant="outline"><EllipsisVertical></EllipsisVertical></Button>
            </PopoverTrigger>
            <PopoverContent className="w-fit">
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