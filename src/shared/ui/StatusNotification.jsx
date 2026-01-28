import React, { useEffect } from "react";
import { CheckCircle, XCircle, AlertCircle } from "lucide-react";

export const StatusNotification = ({
  message,
  onClose,
  type = "success",
  duration = 3000,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const getStyles = () => {
    switch (type) {
      case "success":
        return {
          bg: "bg-emerald-500",
          icon: <CheckCircle size={20} className="text-white" />,
          title: "¡Éxito!",
        };
      case "error":
        return {
          bg: "bg-red-500",
          icon: <XCircle size={20} className="text-white" />,
          title: "Error",
        };
      case "warning":
        return {
          bg: "bg-amber-500",
          icon: <AlertCircle size={20} className="text-white" />,
          title: "Advertencia",
        };
      default:
        return {
          bg: "bg-blue-500",
          icon: <AlertCircle size={20} className="text-white" />,
          title: "Información",
        };
    }
  };

  const { bg, icon, title } = getStyles();

  return (
    <div className="fixed bottom-6 left-6 animate-in slide-in-from-left duration-300 z-50">
      <div
        className={`${bg} text-white px-5 py-3.5 rounded-lg shadow-2xl flex items-center gap-3 min-w-[280px] max-w-sm border-l-4 border-white/40`}
      >
        <div className="bg-white/20 p-1.5 rounded-full flex items-center justify-center flex-shrink-0">
          {icon}
        </div>
        <div className="flex-1">
          <p className="font-semibold text-sm">{title}</p>
          <p className="text-[12px] opacity-95">{message}</p>
        </div>
      </div>
    </div>
  );
};

export default StatusNotification;
