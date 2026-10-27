export { cn } from "cn"

export function joinPath(...parts: string[]): string {
    return parts
        .map((part) => part.replace(/^\/+|\/+$/g, ""))
        .filter(Boolean)
        .join("/");
}
export function trimSlashes(str: string): string {
    return str.replace(/^\/+|\/+$/g, '');
}