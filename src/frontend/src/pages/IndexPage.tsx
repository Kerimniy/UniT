import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner"
import { REPO_BASE_URL } from "@/config"
import { useEffect, useState } from "react"
import { Link, useLocation } from "react-router-dom"

import { ChevronRight, File, Folder, Newspaper } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface Dictionary<T> {
    [key: string]: T;
}

interface TreeNode {
    name: string;
    path: string;
    children: TreeNode[];
}




type AlphabetTree = Record<string, TreeNode[]>;

function buildTree(
    files: Record<string, boolean>
): AlphabetTree {
    const roots: TreeNode[] = [];

    for (const [path, value] of Object.entries(files)) {
        const parts = path.split("/").filter(Boolean);

        if (parts.length === 0) continue;

        let currentPath = "";
        let siblings = roots;
        let current: TreeNode | undefined;

        for (let i = 0; i < parts.length; i++) {
            const name = parts[i];
            currentPath += "/" + name;

            let node = siblings.find(
                item => item.name === name
            );

            if (!node) {
                node = {
                    name,
                    path: currentPath,
                    children: [],
                };
                siblings.push(node);
            }

            current = node;
            siblings = node.children;
        }


    }

    function sortNodes(nodes: TreeNode[]): void {
        nodes.sort((a, b) =>
            a.name.localeCompare(b.name)
        );

        for (const node of nodes) {
            sortNodes(node.children);
        }
    }

    sortNodes(roots);

    const result: AlphabetTree = {};

    for (const node of roots) {
        const letter = node.name[0].toLocaleUpperCase();

        (result[letter] ??= []).push(node);
    }

    return Object.fromEntries(
        Object.entries(result).sort(([a], [b]) =>
            a.localeCompare(b)
        )
    );
}

export default function IndexPage() {
    const location = useLocation()

    const [content, setContent] = useState<AlphabetTree | null>()
    const [loading, setLoading] = useState(true)





    useEffect(() => {

        try {
            setLoading(true)
            fetch(`${REPO_BASE_URL}/index.json`).then((resp) => {
                if (resp.ok) {
                    return resp.json()
                } else if (resp.status == 404) {
                    return "No pages (404)"
                } else {
                    setLoading(false)

                }
            }).then((src) => {

                let tree = buildTree(src)
                setContent(tree)
                setLoading(false)

            })
        } catch (error) {
            setContent(null)
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
                <FileTree content={content}></FileTree>
            }

        </div>
    )

}


function TreeItem({ node }: { node: TreeNode }) {
    const [open, setOpen] = useState(false);
    const isFolder = node.children.length > 0;

    return (
        <div className="select-none">
            {isFolder ? (
                <Collapsible open={open} onOpenChange={setOpen}>
                    <CollapsibleTrigger>
                        <Button
                            variant="ghost"
                            className="h-8 w-full justify-start gap-2 px-2 font-normal"
                        >
                            <ChevronRight
                                className={`size-4 shrink-0 text-muted-foreground transition-transform ${open ? "rotate-90" : ""
                                    }`}
                            />
                            <Folder className="size-4 shrink-0 text-amber-500" />
                            <span className="truncate">{node.name}</span>
                            <span className="ml-auto text-xs text-muted-foreground">
                                {node.children.length}
                            </span>
                        </Button>
                    </CollapsibleTrigger>

                    <CollapsibleContent>
                        <div className="ml-4 border-l pl-3">
                            {node.children.map((child) => (
                                <TreeItem key={child.path} node={child} />
                            ))}
                        </div>
                    </CollapsibleContent>
                </Collapsible>
            ) : (
                <Link
                    to={node.path}
                    className="h-8 w-full flex flex-row justify-start items-center gap-2 px-2 font-normal"
                    title={node.path}
                >
                    <span className="w-4 shrink-0" />
                    <Newspaper className="size-4 shrink-0 text-muted-foreground" />
                    <span className="truncate">{node.name}</span>

                </Link>
            )}
        </div>
    );
}

export function FileTree({
    content,
}: {
    content: AlphabetTree;
}) {
    return (
        <div className="grid w-full grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-3">
            {Object.entries(content).map(([letter, nodes]) => (
                <section
                    className="min-w-0 rounded-xl border bg-card p-3"
                    key={letter}
                >
                    <div className="mb-1 flex items-center gap-2 px-2 py-1">
                        <span className="flex size-7 items-center justify-center rounded-md bg-muted text-sm font-semibold">
                            {letter}
                        </span>

                    </div>

                    <div className="space-y-0.5">
                        {nodes.map((node) => (
                            <TreeItem key={node.path} node={node} />
                        ))}
                    </div>
                </section>
            ))}
        </div>
    );
}