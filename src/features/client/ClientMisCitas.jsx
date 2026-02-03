import React, { useState } from "react";
import { 
  Plus, Calendar, Clock, MapPin, Search, Filter 
} from "lucide-react";
import { useCrud } from "../../shared/hooks/useCrud"; 
import ClientAppointmentModal from "./components/ClientAppointmentModal";
// Importamos Toast para feedback al cliente
import { ToastNotification } from "../../shared/ui/ToastNotification"; 

export default function ClientMisCitas() {
  // CONEXIÓN A LA BASE DE DATOS COMPARTIDA
 const { items: appointments, addItem } = useCrud("sys_appointments_db", []);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notification, setNotification] = useState(null);

  // Simulamos que el usuario logueado es "Cliente Demo"
  // En un sistema real, esto viene del AuthContext
  const CURRENT_USER = "Cliente Demo";

  // Filtramos solo las citas de este cliente
  const myAppointments = appointments.filter(cita => cita.paciente === CURRENT_USER);

  const handleSave = (data) => {
    // Agregamos datos automáticos
    const newAppointment = {
      ...data,
      id: `CIT-${Date.now().toString().slice(-4)}`,
      paciente: CURRENT_USER, // Asignamos al usuario actual
      estadoCita: "Pendiente", // Siempre nace pendiente
      estadoPago: "Pendiente",
      precio: 0, // El precio lo define el admin después
      metodoPago: "-",
      notas: "Cita agendada desde web"
    };

    addItem(newAppointment);
    
    // Feedback visual
    setNotification({ message: "¡Cita solicitada con éxito!", type: "success" });
    
    // TRUCO PARA NOTIFICAR AL ADMIN (Disparar evento de storage)
    // Esto hace que otras pestañas se den cuenta del cambio
    window.dispatchEvent(new Event("storage"));
  };

  const getStatusColor = (status) => {
    if(status === "Confirmada") return "bg-green-100 text-green-700 border-green-200";
    if(status === "Pendiente") return "bg-yellow-100 text-yellow-700 border-yellow-200";
    if(status === "Cancelada") return "bg-red-100 text-red-700 border-red-200";
    return "bg-gray-100 text-gray-600";
  };

  return (
    <div className="p-6 max-w-5xl mx-auto font-sans">
      {notification && (
        <ToastNotification 
          message={notification.message} 
          type={notification.type} 
          onClose={() => setNotification(null)} 
        />
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Mis Citas Médicas</h1>
          <p className="text-sm text-gray-500">Gestiona tus próximas visitas a SysPharma</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg flex items-center gap-2 transition-all hover:scale-105"
        >
          <Plus size={18} /> Agendar Cita
        </button>
      </div>

      {/* Lista de Citas (Estilo Tarjetas para Cliente) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {myAppointments.length > 0 ? (
          myAppointments.map((cita) => (
            <div key={cita.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
              {/* Barra lateral de color según estado */}
              <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${getStatusColor(cita.estadoCita).split(" ")[0].replace("bg-", "bg-opacity-100 bg-")}`}></div>
              
              <div className="flex justify-between items-start mb-3 pl-3">
                <div>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider border ${getStatusColor(cita.estadoCita)}`}>
                    {cita.estadoCita}
                  </span>
                  <h3 className="text-lg font-bold text-gray-800 mt-2">{cita.servicio}</h3>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-700">{cita.hora}</p>
                  <p className="text-xs text-gray-400">Hora</p>
                </div>
              </div>

              <div className="pl-3 space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar size={16} className="text-blue-500"/>
                  <span>{cita.fecha}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin size={16} className="text-blue-500"/>
                  <span>Sede Principal - SysPharma</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <div className="w-4 h-4 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-600">DR</div>
                  <span>{cita.profesional || "Profesional por asignar"}</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-2 py-12 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
            <Calendar size={48} className="mx-auto text-gray-300 mb-3"/>
            <h3 className="text-gray-500 font-medium">No tienes citas programadas</h3>
            <p className="text-sm text-gray-400">¡Agenda tu primera cita hoy mismo!</p>
          </div>
        )}
      </div>

      <ClientAppointmentModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleSave} 
      />
    </div>
  );
}