'use client';
import React, { createContext, useContext, useState } from 'react';

type Toast = { id: number; message: string; type?: 'success' | 'error' | 'info'; position?: 'center' | 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' };

type PushOptions = { position?: Toast['position'] };

const ToastContext = createContext<any>(null);

export const useToast = () => useContext(ToastContext);

export default function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const push = (message: string, type: Toast['type'] = 'info', options: PushOptions = {}) => {
    const t: Toast = { id: Date.now(), message, type, position: options.position || 'top-right' };
    setToasts(prev => [t, ...prev]);
    setTimeout(() => setToasts(prev => prev.filter(x => x.id !== t.id)), 4000);
  };

  // Helper to render a list of toasts into a container with given className
  const renderContainer = (position: Toast['position'], className: string) => {
    const list = toasts.filter(t => t.position === position);
    if (list.length === 0) return null;
    return (
      <div className={className}>
        {list.map(t => (
          <div
            key={t.id}
            className={`pointer-events-auto px-4 py-2 rounded shadow ${
              t.type === 'success'
                ? 'bg-green-500 text-white'
                : t.type === 'error'
                ? 'bg-red-600 text-white'
                : 'bg-gray-800 text-white'
            }`}>
            {t.message}
          </div>
        ))}
      </div>
    );
  };

  return (
    <ToastContext.Provider value={{ push }}>
      {children}

      {/* Top Right (default) */}
      {renderContainer('top-right', 'fixed top-4 right-4 flex flex-col gap-2 z-50')}

      {/* Top Left */}
      {renderContainer('top-left', 'fixed top-4 left-4 flex flex-col gap-2 z-50')}

      {/* Bottom Right */}
      {renderContainer('bottom-right', 'fixed bottom-4 right-4 flex flex-col gap-2 z-50')}

      {/* Bottom Left */}
      {renderContainer('bottom-left', 'fixed bottom-4 left-4 flex flex-col gap-2 z-50')}

      {/* Center */}
      {renderContainer('center', 'fixed inset-0 flex items-center justify-center z-50 pointer-events-none')}
    </ToastContext.Provider>
  );
}
