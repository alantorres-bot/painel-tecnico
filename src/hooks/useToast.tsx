import { createContext, useContext, useState, useCallback, ReactNode } from 'react'

interface ToastCtx {
  toast: (msg: string) => void
}

const Ctx = createContext<ToastCtx>({ toast: () => {} })

export function ToastProvider({ children }: { children: ReactNode }) {
  const [msg, setMsg] = useState('')
  const [visible, setVisible] = useState(false)

  const toast = useCallback((m: string) => {
    setMsg(m)
    setVisible(true)
    setTimeout(() => setVisible(false), 2800)
  }, [])

  return (
    <Ctx.Provider value={{ toast }}>
      {children}
      {visible && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-ink text-white px-4 py-3 rounded-xl shadow-2xl text-sm font-medium border-l-4 border-accent-md toast-enter" style={{ maxWidth: 360 }}>
          {msg}
        </div>
      )}
    </Ctx.Provider>
  )
}

export const useToast = () => useContext(Ctx)
