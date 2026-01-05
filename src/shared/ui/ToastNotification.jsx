import React, { useEffect } from 'react';
import { CheckCircle, X } from 'lucide-react';

export const ToastNotification = ({ message, onClose }) => {
  
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed top-20 right-5 z-50 animate-bounce-in-right">
      <div className="bg-[#34D399] text-white px-6 py-4 rounded-xl shadow-xl flex items-center gap-3 min-w-[300px] border-l-4 border-white/30 backdrop-blur-sm">
        <div className="bg-white/20 p-1 rounded-full">
          <CheckCircle size={20} className="text-white" />
        </div>
        <div className="flex-1">
          <p className="font-bold text-sm">¡Éxito!</p>
          <p className="text-xs opacity-90">{message}</p>
        </div>
        <button onClick={onClose} className="text-white/70 hover:text-white transition-colors">
          <X size={18} />
        </button>
      </div>
    </div>
  );
};