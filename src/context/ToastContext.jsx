import { createContext, useCallback, useContext, useState } from "react";
import Icon from "../components/Icon";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, icon = "check_circle") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, icon }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2800);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 items-center pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="bg-primary text-on-primary px-4 py-2.5 rounded-full shadow-lg font-label-sm text-label-sm flex items-center gap-2 animate-in fade-in"
          >
            <Icon name={t.icon} size={18} />
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
