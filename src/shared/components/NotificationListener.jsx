import React, { useEffect } from "react";
import { toast } from "sonner";

export const NotificationListener = () => {
  useEffect(() => {
    const handleStorageChange = (e) => {
      // 1. Escuchar evento de almacenamiento nativo (otras pestañas)
      // 2. Escuchar evento personalizado "local-storage-update" (misma pestaña)
      
      const isAppointmentUpdate = 
        (e.key === "sys_appointments_db" && e.type === "storage") || 
        (e.type === "local-storage-update"); 
      
      // NOTA: El evento 'local-storage-update' es genérico, así que
      // en un sistema real filtraríamos más, pero para este demo funcionará.

      if (isAppointmentUpdate) {
        // Solo reproducimos sonido si es un evento de STORAGE (otra persona)
        // para no aturdirte si tú mismo creaste la cita.
        if (e.type === "storage") {
             const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3");
             audio.play().catch(() => {});
             
             toast.success("¡Actualización de Citas!", {
               description: "Se han modificado los datos de las citas.",
               duration: 4000,
             });
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    // Opcional: escuchar localmente si quieres notificaciones de tus propias acciones
    // window.addEventListener("local-storage-update", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      // window.removeEventListener("local-storage-update", handleStorageChange);
    };
  }, []);

  return null;
};