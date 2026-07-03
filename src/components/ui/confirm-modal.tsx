"use client";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  isDanger?: boolean;
}

export function ConfirmModal({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = "Konfirmasi",
  cancelText = "Batal",
  isDanger = false,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 transition-opacity"
        onClick={onCancel}
      />

      {/* Modal Content */}
      <div className="relative bg-white border-2 border-border shadow-lg max-w-md w-full p-6 z-10 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-start gap-3">
          {/* Warning Icon */}
          <div
            className={`flex-shrink-0 flex items-center justify-center w-10 h-10 border ${
              isDanger
                ? "border-status-overdue bg-status-overdue/10 text-status-overdue"
                : "border-status-dueSoon bg-status-dueSoon/10 text-status-dueSoon"
            }`}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              {isDanger ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              )}
            </svg>
          </div>

          <div className="flex-1">
            <h3 className="text-sm font-bold text-ink">{title}</h3>
            <p className="text-xs text-ink-muted mt-2 leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <button
            type="button"
            onClick={onCancel}
            className="border border-border text-ink hover:bg-surface-muted px-4 py-2 text-xs font-semibold"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`text-white px-4 py-2 text-xs font-semibold ${
              isDanger ? "bg-status-overdue" : "bg-primary-dark"
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
