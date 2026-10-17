import { Spinner } from "@/components/ui/spinner"
import { REPO_BASE_URL } from "@/config"
import { useEffect, useState } from "react"
import Markdown from "react-markdown"
import { useLocation } from "react-router-dom"
import rehypeRaw from "rehype-raw"


export default function Content() {
    const location = useLocation()

    const [content, setContent] = useState("")
    const [loading, setLoading] = useState(true)

    useEffect(() => {

        let path = location.pathname
        if (path.replace(/\/$/, "") == "") {
            path = "index"
        }
        try {
            setLoading(true)
            fetch(`${REPO_BASE_URL}/${path}`).then((resp) => {
                if (resp.ok) {
                    return resp.text()
                } else if (resp.status == 404) {
                    return "404 dummy" //потом сделать норм 404
                } else {
                    setLoading(false)

                }
            }).then((src) => {
                setContent(src)
                setLoading(false)

            })
        } catch (error) {
            setContent("Unexpected error!")
        }

    }, [location.pathname])


    return (
        <div className="p-4 w-full h-full">
            {loading ?
                <div className="flex flex-col items-center justify-center w-full h-full">
                    <div className="max-w-[4rem] w-full aspect-square">
                        <Spinner className="w-full h-full"></Spinner>
                    </div>
                    <div className="text-xl p-4">Loading...</div>
                </div> :
                <Markdown rehypePlugins={[rehypeRaw]}>
                    {content}
                </Markdown>}

        </div>
    )

}