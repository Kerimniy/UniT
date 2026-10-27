export async function deleteRequest(file: string): Promise<any> {


    const response = await fetch(`/manage/delete?file=${file}`, {
        credentials: "include",
        method: "GET",
    });

    if (!response.ok) {
        const errorText = await response.text().catch(() => "Server error");
        throw new Error(errorText || `Request error: ${response.status}`);
    }

    if (response.headers.get("content-type")?.includes("application/json")) {
        return response.json();
    }
    return response.text();
}

export async function renameRequest(file: string, newName: string): Promise<boolean> {


    const response = await fetch(`/manage/rename?file=${file}&name=${newName}`, {
        credentials: "include",
        method: "GET",
    });

    if (!response.ok) {
        const errorText = await response.text().catch(() => "Server error");
        throw new Error(errorText || `Request error: ${response.status}`);
    }

    
    return response.ok;
}
