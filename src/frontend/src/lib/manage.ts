import { BACKEND_BASE_URL } from "@/config";
import type { Message } from "@/pages/Page";
import { trimSlashes } from "./utils";
import { deletePageCache } from "./caching";

export async function deleteRequest(file: string): Promise<any> {


    const response = await fetch(`${BACKEND_BASE_URL}/manage/delete?file=${encodeURI(file)}`, {
        credentials: "include",
        method: "DELETE",
    });

    if (!response.ok) {
        const errorText = await response.text().catch(() => "Server error");
        throw new Error(errorText || `Request error: ${response.status}`);
    }

    deletePageCache(file)

    if (response.headers.get("content-type")?.includes("application/json")) {
        return {"content":response.json(),"ok": response.ok};
    }
    return {"content":response.text(),"ok": response.ok};
}

export async function renameRequest(file: string, newName: string): Promise<Message> {

    file= trimSlashes(file)
    newName = trimSlashes(newName)

    if (file==""){
        file="index"
    } 

    if (newName==""){
        newName="index"
    } 

    const response = await fetch(`${BACKEND_BASE_URL}/manage/rename?file=${encodeURI(file)}&name=${encodeURI(newName)}`, {
        credentials: "include",
        method: "POST",
    });

    let errorText = ""

    if (!response.ok) {
        errorText = await response.text().catch(() => "Server error");
        
    }

    deletePageCache(file)
    
    return {"isError":!response.ok,"value":errorText};
}
