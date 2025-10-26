import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

const ToastContext = createContext(null);

export function useToast() {
  return useContext(ToastContext);
}

let idCounter = 1;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const add = useCallback((message, opts = {}) => {
    const id = String(idCounter++);
    const toast = { id, message, ttl: opts.ttl || 4000, type: opts.type || 'info' };
    setToasts(t => [toast, ...t]);
    return id;
  }, []);

  const remove = useCallback((id) => {
    setToasts(t => t.filter(x => x.id !== id));
  }, []);

  useEffect(() => {
    const timers = toasts.map(t => {
      if (!t.ttl) return null;
      return setTimeout(() => remove(t.id), t.ttl);
    }).filter(Boolean);
    return () => timers.forEach(clearTimeout);
  }, [toasts, remove]);

  return (
    <ToastContext.Provider value={{ add, remove }}>
      {children}
      <div aria-live="polite" className="fixed right-4 top-4 z-50 flex flex-col gap-2">
        {toasts.map(t => (
          <div key={t.id} className={`max-w-sm rounded-lg px-4 py-2 text-sm shadow ${t.type === 'error' ? 'bg-rose-600 text-white' : 'bg-slate-800 text-white'}`}>
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export default ToastProvider;
