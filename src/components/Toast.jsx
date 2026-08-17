import { createContext, useCallback, useContext, useRef, useState } from "react";
import { Check, TriangleAlert, Info } from "lucide-react";

const ToastContext = createContext(null);

let toastCounter = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timersRef = useRef({});

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    clearTimeout(timersRef.current[id]);
  }, []);

  const show = useCallback(
    (message, type = "info") => {
      const id = ++toastCounter;
      setToasts((prev) => [...prev, { id, message, type }]);
      timersRef.current[id] = setTimeout(() => dismiss(id), 3500);
    },
    [dismiss]
  );

  const icons = { success: Check, error: TriangleAlert, info: Info };

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div className="toast-container">
        {toasts.map((t) => {
          const Icon = icons[t.type] ?? Info;
          return (
            <div key={t.id} className={`toast ${t.type === "success" ? "success" : ""}`}>
              <Icon />
              <span>{t.message}</span>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast debe usarse dentro de ToastProvider");
  return ctx;
}