'use client';
import React, { createContext, useContext, useState } from 'react';

type Toast = { id: number; message: string; type?: 'success' | 'error' | 'info' };

const ToastContext = createContext<any>(null);

export const useToast = () => useContext(ToastContext);

export default function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const push = (message: string, type: Toast['type'] = 'info') => {
    const t = { id: Date.now(), message, type };
    setToasts(prev => [t, ...prev]);
    setTimeout(() => setToasts(prev => prev.filter(x => x.id !== t.id)), 4000);
  };

  return (
    <ToastContext.Provider value={{ push }}>
      {children}
      <div className="fixed right-4 top-4 flex flex-col gap-2 z-50">
        {toasts.map(t => (
          <div
            key={t.id}
            className={`px-4 py-2 rounded shadow ${
              t.type === 'success'
                ? 'bg-green-500 text-white'
                : t.type === 'error'
                ? 'bg-red-600 text-white'
                : 'bg-gray-800 text-white'
            }`}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
