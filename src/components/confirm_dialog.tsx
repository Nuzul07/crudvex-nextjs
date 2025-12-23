"use client"
import React from "react"
import Modal from "./modal"

type ConfirmDialogProps = {
    open: boolean
    title?: string
    message: React.ReactNode
    confirmText?: string
    cancelText?: string
    danger?: boolean
    loading?: boolean
    onConfirm: () => void
    onCancel: () => void
}

export default function ConfirmDialog({
    open,
    title = "Konfirmasi",
    message,
    confirmText = "Ya, lanjut",
    cancelText = "Batal",
    danger = false,
    loading = false,
    onConfirm,
    onCancel,
}: ConfirmDialogProps) {
    return (
        <Modal
            open={open}
            title={title}
            onClose={loading ? () => {} : onCancel}
            widthClassName="max-w-md"
            footer={
                <div className="flex justify-end gap-2">
                    <button
                        disabled={loading}
                        onClick={onCancel}
                        className="rounded-lg border px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 cursor-pointer"
                    >
                        {cancelText}
                    </button>
                    <button
                        disabled={loading}
                        onClick={onConfirm}
                        className={`rounded-lg px-3 py-2 text-sm text-white disabled:opacity-50 cursor-pointer ${danger ? "bg-red-600 hover:bg-red-700" : "bg-black hover:bg-gray-900"}`}
                    >
                        {loading ? "Memproses..." : confirmText}
                    </button>
                </div>
            }
        >
            <div className="text-sm text-gray-700">{message}</div>
        </Modal>
    )
}