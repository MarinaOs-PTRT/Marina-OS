import React from 'react'
import { useToast, Toast, ToastType } from '../context/ToastContext'
import './ToastContainer.css'

// Icone per tipo di toast (testo, niente dipendenze esterne)
const TOAST_ICONS: Record<ToastType, string> = {
  success: '✓',
  error:   '✕',
  warning: '⚠',
  info:    'i',
}

function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  return (
    <div
      className={`toast toast--${toast.type} ${toast.removing ? 'toast--removing' : ''}`}
      role="status"
      aria-live="polite"
    >
      <span className="toast-icon">{TOAST_ICONS[toast.type]}</span>
      <span className="toast-message">{toast.message}</span>
      <button
        className="toast-close"
        onClick={onClose}
        aria-label="Chiudi notifica"
      >
        ×
      </button>
    </div>
  )
}

/**
 * ToastContainer — renderizza lo stack di notifiche in basso a destra.
 *
 * Va montato UNA SOLA VOLTA, dentro AppLayout (fuori dal main content,
 * così è sempre visibile anche durante navigazione). Usa position:fixed
 * e z-index 2000 per stare sopra drawer e modali.
 */
export function ToastContainer() {
  const { toasts, removeToast } = useToast()

  if (toasts.length === 0) return null

  return (
    <div className="toast-container" aria-label="Notifiche">
      {toasts.map(toast => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  )
}
