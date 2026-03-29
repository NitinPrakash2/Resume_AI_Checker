import { useEffect } from 'react'
import { createPortal } from 'react-dom'

export default function ConfirmDialog({ open, title, message, confirmLabel = 'Delete', onConfirm, onCancel, danger = true }) {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 flex items-center justify-center" style={{ zIndex: 99999 }}>
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Card */}
      <div className="relative w-[90%] max-w-sm bg-white dark:bg-[#0d1526] border border-gray-200 dark:border-white/[0.08] rounded-2xl shadow-2xl overflow-hidden"
        style={{ zIndex: 100000 }}
      >
        {/* Top accent */}
        <div className={`h-1 w-full ${danger ? 'bg-gradient-to-r from-red-500 to-rose-400' : 'bg-gradient-to-r from-primary to-primary-container'}`} />

        <div className="p-6">
          {/* Icon */}
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 ${danger ? 'bg-red-50 dark:bg-red-500/10' : 'bg-blue-50 dark:bg-blue-500/10'}`}>
            <span
              className={`material-symbols-outlined text-[32px] ${danger ? 'text-red-500 dark:text-red-400' : 'text-blue-600 dark:text-blue-400'}`}
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              {danger ? 'delete_forever' : 'info'}
            </span>
          </div>

          {/* Title */}
          <h3 className="text-base font-bold text-gray-900 dark:text-white text-center mb-2">
            {title}
          </h3>

          {/* Message */}
          <p className="text-sm text-gray-500 dark:text-[#8892a4] text-center leading-relaxed mb-6">
            {message}
          </p>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 py-2.5 rounded-xl bg-gray-100 dark:bg-white/[0.05] border border-gray-200 dark:border-white/[0.08] text-gray-700 dark:text-[#8892a4] text-sm font-semibold hover:bg-gray-200 dark:hover:bg-white/[0.10] transition-all"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${
                danger
                  ? 'bg-red-500 hover:bg-red-600 active:scale-95 text-white shadow-lg shadow-red-500/25'
                  : 'bg-gradient-to-r from-primary to-primary-container text-[#0b1120] hover:opacity-90'
              }`}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}
