
export function setPageCache(path: string, content: string) {
    localStorage.setItem(path, JSON.stringify({ "content": content, "exp": performance.now() + 172800000 }))
}

export function getPageCache(path: string){ 
    return localStorage.getItem(path)
}

export function deletePageCache(path: string){
    localStorage.removeItem(path)
}

export function cleanExpiredCache() {
    
    let keys = Object.keys(localStorage)

    for (let key of keys){
        
        let item = JSON.parse(localStorage.getItem(key))

        if (item.exp<performance.now()){
            localStorage.removeItem(key)
        }
    }
}