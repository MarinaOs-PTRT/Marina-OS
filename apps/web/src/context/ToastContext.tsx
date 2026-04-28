import React, { createContext, useContext, useState, useCallback } from 'react'

// ═══════════════════════════════════════════════════════════════
// ToastContext — sistema di notifiche a comparsa (bottom-right)
//
// Uso:
//   const { addToast } = useToast()
//   addToast('Entrata registrata — Luna Rossa · Posto D 32', 'success')
//
// Tipi disponibili:
//   'success'  → verde  (azione completata con successo)
//   'error'    → rosso  (operazione fallita)
//   'warning'  → ambra  (completato ma con avviso, es. pendente)
//   'info'     → blu    (informazione neutrale)
// ═══════════════════════════════════════════════════════════════

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface Toast {
  id: number
  message: string
  type: ToastType
  duration: number   // ms prima della rimozione automatica
  removing: boolean  // true durante l'animazione di uscita
}

interface ToastContextType {
  toasts: Toast[]
  addToast: (message: string, type?: ToastType, duration?: number) => void
  removeToast: (id: number) => void
}

const ToastContext = createContext<ToastContextType | null>(null)

const DEFAULT_DURATION = 3800  // ms

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const removeToast = useCallback((id: number) => {
    // Prima segna "removing" per avviare l'animazione di uscita,
    // poi rimuove davvero dopo 300ms (durata della transizione CSS).
    setToasts(prev =>
      prev.map(t => t.id === id ? { ...t, removing: true } : t)
    )
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 320)
  }, [])

  const addToast = useCallback((
    message: string,
    type: ToastType = 'success',
    duration: number = DEFAULT_DURATION
  ) => {
    const id = Date.now() + Math.random()  // evita collisioni in rapida successione

    setToasts(prev => [
      ...prev,
      { id, message, type, duration, removing: false }
    ])

    // Auto-dismiss
    setTimeout(() => removeToast(id), duration)
  }, [removeToast])

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
    </ToastContext.Provider>
  )
}

export function useToast(): ToastContextType {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast deve essere usato dentro <ToastProvider>')
  return ctx
}
