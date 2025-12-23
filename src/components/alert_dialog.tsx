"use client";
import React, { useEffect } from "react";
import Modal from "./modal";

type AlertDialogProps = {
  open: boolean;
  title?: string;
  message: React.ReactNode;
  type?: "success" | "error" | "info";
  buttonText?: string;
  autoCloseTime?: number;
  onClose: () => void;
};

export default function AlertDialog({
  open,
  title = "Informasi",
  message,
  type = "info",
  buttonText = "OK",
  autoCloseTime,
  onClose,
}: AlertDialogProps) {
  useEffect(() => {
    if (!open) return;
    if (!autoCloseTime) return;

    const t = window.setTimeout(() => onClose(), autoCloseTime);
    return () => window.clearTimeout(t);
  }, [open, autoCloseTime, onClose]);

  const badgeClass =
    type === "success"
      ? "bg-green-50 text-green-700 border-green-200"
      : type === "error"
      ? "bg-red-50 text-red-700 border-red-200"
      : "bg-sky-50 text-sky-700 border-sky-400";

  return (
    <Modal
      open={open}
      title={title}
      onClose={onClose}
      widthClassName="max-w-md"
      footer={
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-black cursor-pointer"
          >
            {buttonText}
          </button>
        </div>
      }
    >
      <div className={`rounded-lg border p-3 text-sm ${badgeClass}`}>{message}</div>
    </Modal>
  );
}