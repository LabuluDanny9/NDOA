"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react"
import { CheckCircle2, CircleAlert, Info, X } from "lucide-react"

type ToastVariant = "success" | "error" | "info"

interface ToastInput {
  title: string
  description?: string
  variant?: ToastVariant
}

interface ToastMessage extends ToastInput {
  id: number
  variant: ToastVariant
}

interface ToastContextValue {
  toast: (input: ToastInput) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<ToastMessage[]>([])
  const nextId = useRef(0)
  const timers = useRef(new Map<number, ReturnType<typeof setTimeout>>())

  const dismiss = useCallback((id: number) => {
    const timer = timers.current.get(id)
    if (timer) clearTimeout(timer)
    timers.current.delete(id)
    setMessages((current) => current.filter((message) => message.id !== id))
  }, [])

  const toast = useCallback(
    ({ title, description, variant = "info" }: ToastInput) => {
      const id = nextId.current
      nextId.current += 1
      setMessages((current) => [
        ...current,
        { id, title, description, variant },
      ])
      timers.current.set(id, setTimeout(() => dismiss(id), 4500))
    },
    [dismiss]
  )

  useEffect(() => {
    const activeTimers = timers.current
    return () => {
      activeTimers.forEach((timer) => clearTimeout(timer))
      activeTimers.clear()
    }
  }, [])

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div
        className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-3"
        aria-label="Notifications"
      >
        {messages.map((message) => (
          <ToastItem
            key={message.id}
            message={message}
            onDismiss={() => dismiss(message.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error("useToast doit être utilisé dans ToastProvider")
  }
  return context
}

function ToastItem({
  message,
  onDismiss,
}: {
  message: ToastMessage
  onDismiss: () => void
}) {
  const Icon =
    message.variant === "success"
      ? CheckCircle2
      : message.variant === "error"
        ? CircleAlert
        : Info

  return (
    <div
      role={message.variant === "error" ? "alert" : "status"}
      className="pointer-events-auto flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-slate-950 shadow-xl"
    >
      <Icon
        className={
          message.variant === "success"
            ? "mt-0.5 h-5 w-5 text-emerald-600"
            : message.variant === "error"
              ? "mt-0.5 h-5 w-5 text-rose-600"
              : "mt-0.5 h-5 w-5 text-sky-600"
        }
        aria-hidden="true"
      />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">{message.title}</p>
        {message.description ? (
          <p className="mt-1 text-sm text-slate-600">{message.description}</p>
        ) : null}
      </div>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Fermer la notification"
        className="rounded-lg p-1 text-slate-500 transition hover:bg-slate-100 hover:text-slate-950"
      >
        <X className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  )
}
