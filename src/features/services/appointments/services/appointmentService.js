const DB_DOCTORS = 'syspharma_doctors';
const DB_APPOINTMENTS = 'syspharma_appointments';

// Datos iniciales: Médicos y sus horarios
const initialDoctors = [
  { 
    id: 1, 
    nombre: "Dr. Andrés López", 
    especialidad: "Medicina General", 
    diasLaborales: [1, 2, 3, 4, 5], // Lun a Vie (0=Dom, 6=Sab)
    horaInicio: "08:00", 
    horaFin: "17:00",
    intervalo: 30 // minutos por cita
  },
  { 
    id: 2, 
    nombre: "Enf. María Ruiz", 
    especialidad: "Inyectología", 
    diasLaborales: [1, 2, 3, 4, 5, 6], // Lun a Sab
    horaInicio: "07:00", 
    horaFin: "19:00",
    intervalo: 15 
  }
];

const initialAppointments = [
  { id: 1, doctorId: 1, paciente: "Juan Pérez", fecha: "2025-10-25", hora: "09:00", estado: "Confirmada", servicio: "Consulta General" },
  { id: 2, doctorId: 2, paciente: "Ana Díaz", fecha: "2025-10-25", hora: "10:15", estado: "Completada", servicio: "Inyección" },
];

export const appointmentService = {
  // --- MÉDICOS ---
  getDoctors: () => {
    const data = localStorage.getItem(DB_DOCTORS);
    if (!data) {
      localStorage.setItem(DB_DOCTORS, JSON.stringify(initialDoctors));
      return initialDoctors;
    }
    return JSON.parse(data);
  },
  
  updateDoctorSchedule: (doctor) => {
    const list = appointmentService.getDoctors().map(d => d.id === doctor.id ? doctor : d);
    localStorage.setItem(DB_DOCTORS, JSON.stringify(list));
    return list;
  },

  // --- CITAS ---
  getAppointments: () => {
    const data = localStorage.getItem(DB_APPOINTMENTS);
    if (!data) {
      localStorage.setItem(DB_APPOINTMENTS, JSON.stringify(initialAppointments));
      return initialAppointments;
    }
    return JSON.parse(data);
  },

  createAppointment: (appt) => {
    const list = appointmentService.getAppointments();
    const newAppt = { ...appt, id: Date.now(), estado: 'Confirmada' };
    localStorage.setItem(DB_APPOINTMENTS, JSON.stringify([...list, newAppt]));
    return [...list, newAppt];
  },

  cancelAppointment: (id) => {
    const list = appointmentService.getAppointments().map(a => a.id === id ? { ...a, estado: 'Cancelada' } : a);
    localStorage.setItem(DB_APPOINTMENTS, JSON.stringify(list));
    return list;
  }
};