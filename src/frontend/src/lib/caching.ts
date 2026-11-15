
export function setPageCache(path: string, content: string) {
    let key = `__cache__${path}`
    localStorage.setItem(key, JSON.stringify({ "content": content, "exp": performance.now() + 172800000 }))
}

export function getPageCache(path: string){ 
        let key = `__cache__${path}`

    return localStorage.getItem(key)
}

export function deletePageCache(path: string){
        let key = `__cache__${path}`

    localStorage.removeItem(key)
}

export function cleanExpiredCache() {
    
    let keys = Object.keys(localStorage)

    for (let key of keys){
        if (!key.startsWith("__cache__")){
            continue
        }
        let item = JSON.parse(localStorage.getItem(key))

        if (item.exp<performance.now()){
            localStorage.removeItem(key)
        }
    }
}