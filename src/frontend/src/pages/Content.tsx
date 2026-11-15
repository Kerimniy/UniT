import { MarkdownRenderer } from "@/components/MarkdownRenderer"
import { Spinner } from "@/components/ui/spinner"
import { REPO_BASE_URL } from "@/config"
import { useEffect, useRef, useState } from "react"
import { useLocation } from "react-router-dom"
import { OpenImage } from "@/components/Image"
import { tocStore, type IndexElement } from "@/lib/toc-store"
import { getPageCache, setPageCache } from "@/lib/caching"


const scrollToHeader = (id: string) => {
    document.getElementById(id)?.scrollIntoView({
        behavior: "smooth",
        block: "center"
    })
}


export default function Content() {
    const location = useLocation()

    const pageCache = getPageCache(location.pathname)

    const [content, setContent] = useState(pageCache)
    const [loading, setLoading] = useState(pageCache !== "" ? false : true)

    const [isOpenImage, setIsOpenImage] = useState(false)
    const [imageSrc, setImageSrc] = useState("")

    const rendererRef = useRef<HTMLDivElement | null>(null)


    useEffect(() => {

        const ctrl = new AbortController()

        let path = location.pathname
        if (path.replace(/\/$/, "") == "") {
            path = "index"
        }

        setLoading(pageCache !== "" ? false : true)

        let fetchPath = `${REPO_BASE_URL}/${path}`

        if (path.startsWith("/-/docs/")) {
            fetchPath = `/public/pages/${path.substring(8, path.length)}.md`
        }
        ; (async () => {
            try {
                const resp = await fetch(fetchPath, { signal: ctrl.signal })
                if (resp.ok) {
                    const page = await resp.text()
                    setContent(page)
                    setPageCache(location.pathname, page)

                }
                else if (resp.status === 404) setContent(`
                    # 404 Page not fouund 
                    ## Return to [Main page](/)
                `)
                else setContent(`Error ${resp.status}`)
            } catch (e) {
                if (e instanceof DOMException && e.name === "AbortError") return
                setContent("Unexpected error!")
            } finally {
                if (!ctrl.signal.aborted) setLoading(false)
            }
        })()

        return () => ctrl.abort()
    }, [location.pathname])

    useEffect(() => {
        let contentDOM = rendererRef.current
        if (contentDOM == undefined) {
            return
        }
        let headers = Array.from(contentDOM?.querySelectorAll("h1, h2, h3, h4, h5, h6") ?? [])
        let index: IndexElement[] = []
        let c = 0

        let container = rendererRef.current!

        for (let el of headers) {
            el.id = `${el.textContent}-${(c).toString(36)}`
            index.push(
                {
                    "title": el.textContent,
                    "type": el.tagName.toLowerCase(),
                    "id": el.id,
                    "y": el.getBoundingClientRect().top
                        - container?.getBoundingClientRect().top
                        + container?.scrollTop
                }
            )
            c++
        }
        tocStore.set({ items: index })
        const onScroll = () => {


            const y = container?.scrollTop + 30

            let left = 0
            let right = index.length - 1
            let result = 0

            while (left <= right) {
                const mid = Math.floor((left + right) / 2)

                if (index[mid].y <= y) {
                    result = mid
                    left = mid + 1
                } else {
                    right = mid - 1
                }
            }

            if (index.length > 0) {
                tocStore.set({ activeId: index[result].id })
            }

        }


        container?.addEventListener("scroll", onScroll, { passive: true })
        onScroll()



        let images = Array.from(contentDOM?.querySelectorAll("img") ?? [])

        for (let image of images) {
            image.addEventListener('click', function () {
                setIsOpenImage(true)
                setImageSrc(image.src)
            });
        }

        return () => {
            container?.removeEventListener("scroll", onScroll)
        }

    }, [content]);

    useEffect(() => {
        let hash = window.location.hash;
        hash = hash.substring(1, hash.length)

        scrollToHeader(decodeURI(hash))
    }, [content, window.location.hash])

    return (
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
            <OpenImage src={imageSrc} setIsOpen={setIsOpenImage} isOpen={isOpenImage}></OpenImage>
            {loading ?
                <div className="flex flex-col items-center justify-center w-full h-full p-4">
                    <div className="max-w-[4rem] w-full aspect-square">
                        <Spinner className="w-full h-full"></Spinner>
                    </div>
                    <div className="text-xl p-4">Loading...</div>
                </div> :
                <MarkdownRenderer ref={rendererRef} content={content||""} />
            }
        </div>
    )

}