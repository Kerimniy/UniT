import { REPO_BASE_URL } from "@/config"
import { useEffect, useState } from "react"
import Markdown from "react-markdown"
import { useLocation } from "react-router-dom"
import rehypeRaw from "rehype-raw"


export default function Content() {
    const location = useLocation()

    const [content, setContent] = useState("")

    useEffect(() => {

        let path = location.pathname
        if (path.replace(/\/$/, "") == "") {
            path = "index"
        }

        fetch(`${REPO_BASE_URL}/${path}`).then((resp) => {
            if (resp.ok) {
                return resp.text()
            }
        }).then((src) => {
            setContent(src)
        })

    }, [location.pathname])


    return (<Markdown rehypePlugins={[rehypeRaw]}>
        {content}
    </Markdown>)

}