import React, { useState, useEffect } from 'react';
import { Calendar as CalIcon, Clock, User, Plus, Settings, ChevronLeft, ChevronRight, CheckCircle, XCircle } from 'lucide-react';
import { appointmentService } from './services/appointmentService';
import { DoctorScheduleModal } from './components/DoctorScheduleModal';
import { ToastNotification } from '../../../shared/ui/ToastNotification';

export const AppointmentsPage = () => {
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState(1);
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  // Modales y Notificaciones
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    setDoctors(appointmentService.getDoctors());
    setAppointments(appointmentService.getAppointments());
  }, []);

  const selectedDoctor = doctors.find(d => d.id === selectedDoctorId);

  // --- LÓGICA DE CALENDARIO ---
  const generateTimeSlots = () => {
    if (!selectedDoctor) return [];
    
    // Verificar si el doctor trabaja este día de la semana
    const dayOfWeek = selectedDate.getDay(); // 0-6
    if (!selectedDoctor.diasLaborales.includes(dayOfWeek)) return []; // No trabaja

    const slots = [];
    let currentTime = new Date(`2000-01-01T${selectedDoctor.horaInicio}`);
    const endTime = new Date(`2000-01-01T${selectedDoctor.horaFin}`);

    while (currentTime < endTime) {
      const timeString = currentTime.toTimeString().substring(0, 5);
      
      // Verificar si ya está ocupado
      const isTaken = appointments.some(a => 
        a.doctorId === selectedDoctorId && 
        a.fecha === selectedDate.toISOString().split('T')[0] && 
        a.hora === timeString &&
        a.estado !== 'Cancelada'
      );

      slots.push({ time: timeString, taken: isTaken });
      currentTime.setMinutes(currentTime.getMinutes() + selectedDoctor.intervalo);
    }
    return slots;
  };

  const handleBook = (time) => {
    const patientName = prompt("Nombre del paciente:"); // Por ahora simple
    if (!patientName) return;

    const newAppt = {
      doctorId: selectedDoctorId,
      paciente: patientName,
      fecha: selectedDate.toISOString().split('T')[0],
      hora: time,
      servicio: selectedDoctor.especialidad
    };

    const updatedList = appointmentService.createAppointment(newAppt);
    setAppointments(updatedList);
    setNotification("Cita agendada exitosamente");
  };

  const handleUpdateSchedule = (updatedDoctor) => {
    const list = appointmentService.updateDoctorSchedule(updatedDoctor);
    setDoctors(list);
    setNotification("Horario actualizado");
  };

  // Filtrar citas del día para el historial derecho
  const todayAppointments = appointments.filter(a => 
    a.fecha === selectedDate.toISOString().split('T')[0] && 
    a.doctorId === selectedDoctorId
  );

  return (
    <div className="h-full flex flex-col gap-3 font-sans relative">
      {notification && <ToastNotification message={notification} onClose={() => setNotification(null)} />}

      {/* Header */}
      <div className="flex justify-between items-center flex-shrink-0">
        <div>
          <h1 className="text-lg font-bold text-gray-800">Citas Médicas</h1>
          <p className="text-gray-500 text-xs">Gestión de agenda y disponibilidad</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setIsScheduleOpen(true)} className="bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all">
            <Settings size={14} /> Configurar Horario
          </button>
        </div>
      </div>

      {/* Contenedor Principal (Split View) */}
      <div className="flex-1 flex gap-4 overflow-hidden">
        
        {/* PANEL IZQUIERDO: Calendario y Disponibilidad (60%) */}
        <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
          
          {/* Selector de Médico y Fecha */}
          <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
            <div className="flex items-center gap-3">
              <select 
                className="bg-white border border-gray-200 text-gray-700 text-sm rounded-lg p-2 focus:ring-2 focus:ring-primary-300 outline-none font-bold"
                value={selectedDoctorId}
                onChange={(e) => setSelectedDoctorId(Number(e.target.value))}
              >
                {doctors.map(d => <option key={d.id} value={d.id}>{d.nombre} - {d.especialidad}</option>)}
              </select>
            </div>
            
            <div className="flex items-center gap-2 bg-white rounded-lg border border-gray-200 p-1">
              <button onClick={() => setSelectedDate(new Date(selectedDate.setDate(selectedDate.getDate() - 1)))} className="p-1 hover:bg-gray-100 rounded"><ChevronLeft size={16}/></button>
              <span className="text-xs font-bold w-24 text-center">
                {selectedDate.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })}
              </span>
              <button onClick={() => setSelectedDate(new Date(selectedDate.setDate(selectedDate.getDate() + 1)))} className="p-1 hover:bg-gray-100 rounded"><ChevronRight size={16}/></button>
            </div>
          </div>

          {/* Grilla de Horarios (Slots) */}
          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            <h3 className="text-xs font-bold text-gray-500 uppercase mb-3">Disponibilidad</h3>
            
            {generateTimeSlots().length > 0 ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {generateTimeSlots().map((slot, index) => (
                  <button
                    key={index}
                    disabled={slot.taken}
                    onClick={() => !slot.taken && handleBook(slot.time)}
                    className={`
                      py-3 rounded-xl border flex flex-col items-center justify-center transition-all
                      ${slot.taken 
                        ? 'bg-gray-100 border-gray-200 opacity-50 cursor-not-allowed' 
                        : 'bg-white border-primary-100 hover:border-primary-400 hover:shadow-md cursor-pointer text-primary-600'
                      }
                    `}
                  >
                    <Clock size={16} className="mb-1" />
                    <span className="text-sm font-bold">{slot.time}</span>
                    <span className="text-[10px] uppercase font-bold mt-1">
                      {slot.taken ? 'Ocupado' : 'Disponible'}
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-400">
                <XCircle size={40} className="mb-2 opacity-20" />
                <p className="text-sm font-bold">No disponible</p>
                <p className="text-xs">El médico no trabaja este día.</p>
              </div>
            )}
          </div>
        </div>

        {/* PANEL DERECHO: Agenda del Día (40%) */}
        <div className="w-80 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col overflow-hidden hidden md:flex">
          <div className="p-4 border-b border-gray-100 bg-gray-50">
            <h3 className="font-bold text-gray-700 text-sm">Agenda del Día</h3>
            <p className="text-[10px] text-gray-500">Pacientes programados</p>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-3">
            {todayAppointments.length === 0 ? (
              <p className="text-center text-xs text-gray-400 mt-10">No hay citas para hoy</p>
            ) : (
              todayAppointments.map(appt => (
                <div key={appt.id} className="p-3 border border-gray-100 rounded-xl shadow-sm bg-white hover:border-primary-200 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div className="bg-primary-50 text-primary-700 font-bold px-2 py-0.5 rounded text-[10px]">
                      {appt.hora}
                    </div>
                    <span className={`text-[10px] font-bold px-1.5 rounded ${appt.estado === 'Cancelada' ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-500'}`}>
                      {appt.estado}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    <User size={14} className="text-gray-400" />
                    <span className="text-xs font-bold text-gray-700">{appt.paciente}</span>
                  </div>
                  <p className="text-[10px] text-gray-500 ml-6">{appt.servicio}</p>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      <DoctorScheduleModal 
        isOpen={isScheduleOpen} 
        onClose={() => setIsScheduleOpen(false)} 
        doctor={selectedDoctor}
        onSave={handleUpdateSchedule}
      />
    </div>
  );
};