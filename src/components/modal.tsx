"use-client"
import React, { useEffect } from "react"

type ModalProps = {
    open: boolean
    title?: string
    children: React.ReactNode
    onClose: () => void
    footer?: React.ReactNode
    widthClassName?: string
}

export default function Modal({
    open,
    title,
    children,
    onClose,
    footer,
    widthClassName = "max-w-2xl",
}: ModalProps) {
    useEffect(() => {
        if (!open) return

        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose()
        }
        window.addEventListener("keydown", onKeyDown)
        return () => window.removeEventListener("keydown", onKeyDown)
    }, [open, onClose])

    if (!open) return null

    return(
        <div className="fixed inset-0 z-50">
            <div
                className="absolute inset-0 bg-black/40"
                onClick={onClose}
                aria-hidden="true"
            />
            <div className="absolute inset-0 flex items-center justify-center p-4">
                <div className={`w-full ${widthClassName} rounded-xl bg-white shadow-xl`}>
                    {/* header */}
                    <div className="flex items-center justify-between border-b px-5 py-4">
                        <div className="text-base font-semibold text-gray-900">
                            {title}
                        </div>
                        <button
                            onClick={onClose}
                            className="rounded-lg px-2 py-1 text-sm text-red-600 font-bold hover:bg-red-600 hover:text-white cursor-pointer"
                        >
                            X
                        </button>
                    </div>
                    {/* body */}
                    <div className="px-5 py-4">{children}</div>

                    {/* footer */}
                    {footer ? <div className="border-t px-5 py-4">{footer}</div> : null}
                </div>
            </div>
        </div>
    )
}