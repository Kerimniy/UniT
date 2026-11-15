import {
    Dialog,
    DialogContent,
} from "@/components/ui/dialog"

export function OpenImage({
    src,
    isOpen,
    setIsOpen
}: {
    src: string
    isOpen: boolean
    setIsOpen: (open: boolean) => void
}) {
    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="max-w-xl max-h-xl h-[80vh] border-none bg-transparent p-4 shadow-none sm:max-w-3xl sm:max-h-3xl">
                <div className="relative flex h-full max-h-2xl items-center justify-center overflow-hidden rounded-lg">
                    <img
                        src={src}
                        alt="image"
                        className="max-h-[90vh] w-full w-auto max-w-full object-contain"
                    />
                </div>
            </DialogContent>
        </Dialog>
    )
}