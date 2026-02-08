const DB_DOCTORS = "syspharma_doctors";
const DB_APPOINTMENTS = "sys_appointments_db"; // Sincronizado con dashboard

// Datos iniciales: Médicos y sus horarios
const initialDoctors = [
  {
    id: 1,
    nombre: "Dr. Andrés López",
    especialidad: "Medicina General",
    diasLaborales: [1, 2, 3, 4, 5], // Lun a Vie (0=Dom, 6=Sab)
    horaInicio: "08:00",
    horaFin: "17:00",
    intervalo: 30, // minutos por cita
  },
  {
    id: 2,
    nombre: "Enf. María Ruiz",
    especialidad: "Inyectología",
    diasLaborales: [1, 2, 3, 4, 5, 6], // Lun a Sab
    horaInicio: "07:00",
    horaFin: "19:00",
    intervalo: 15,
  },
];

const initialAppointments = [
  {
    id: 1,
    doctorId: 1,
    paciente: "Juan Pérez",
    documento: "12345678",
    telefono: "3001234567",
    fecha: "2026-02-06",
    hora: "09:00",
    estado: "Confirmar Asistencia",
    servicio: "Consulta General",
    precio: 25000,
    notas: "",
  },
  {
    id: 2,
    doctorId: 2,
    paciente: "Ana Díaz",
    documento: "87654321",
    telefono: "3019876543",
    fecha: "2026-02-06",
    hora: "10:15",
    estado: "Completada",
    servicio: "Inyección",
    precio: 50000,
    notas: "",
  },
  {
    id: 3,
    doctorId: 1,
    paciente: "Carlos López",
    documento: "11223344",
    telefono: "3105555666",
    fecha: "2026-02-04",
    hora: "14:00",
    estado: "Completada",
    servicio: "Consulta General",
    precio: 25000,
    notas: "",
  },
  {
    id: 4,
    doctorId: 2,
    paciente: "María González",
    documento: "55667788",
    telefono: "3117778899",
    fecha: "2026-02-03",
    hora: "08:30",
    estado: "Completada",
    servicio: "Inyección",
    precio: 50000,
    notas: "",
  },
  {
    id: 5,
    doctorId: 1,
    paciente: "Pedro Martínez",
    documento: "99001122",
    telefono: "3129990011",
    fecha: "2026-02-10",
    hora: "11:00",
    estado: "Confirmar Asistencia",
    servicio: "Consulta General",
    precio: 25000,
    notas: "",
  },
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
    const list = appointmentService
      .getDoctors()
      .map((d) => (d.id === doctor.id ? doctor : d));
    localStorage.setItem(DB_DOCTORS, JSON.stringify(list));
    return list;
  },

  // --- CITAS ---
  getAppointments: () => {
    const data = localStorage.getItem(DB_APPOINTMENTS);
    if (!data) {
      localStorage.setItem(
        DB_APPOINTMENTS,
        JSON.stringify(initialAppointments),
      );
      return initialAppointments;
    }
    return JSON.parse(data);
  },

  createAppointment: (appt) => {
    const list = appointmentService.getAppointments();
    const newAppt = {
      ...appt,
      id: Date.now() + Math.random(),
      estado: "Confirmar Asistencia",
      fechaCreacion: new Date().toISOString(),
    };
    localStorage.setItem(DB_APPOINTMENTS, JSON.stringify([...list, newAppt]));
    return [...list, newAppt];
  },

  updateAppointment: (id, updates) => {
    const list = appointmentService.getAppointments();
    const updated = list.map((a) => (a.id === id ? { ...a, ...updates } : a));
    localStorage.setItem(DB_APPOINTMENTS, JSON.stringify(updated));
    return updated;
  },

  updateAppointmentStatus: (id, newStatus) => {
    return appointmentService.updateAppointment(id, { estado: newStatus });
  },

  deleteAppointment: (id) => {
    const list = appointmentService.getAppointments();
    const filtered = list.filter((a) => a.id !== id);
    localStorage.setItem(DB_APPOINTMENTS, JSON.stringify(filtered));
    return filtered;
  },

  cancelAppointment: (id) => {
    return appointmentService.updateAppointmentStatus(id, "Cancelada");
  },

  // --- UTILIDADES ---
  getAppointmentsByDate: (date) => {
    return appointmentService.getAppointments().filter((a) => a.fecha === date);
  },

  getAppointmentsByDoctor: (doctorId) => {
    return appointmentService
      .getAppointments()
      .filter((a) => a.doctorId === doctorId);
  },

  getAppointmentsByDateAndDoctor: (date, doctorId) => {
    return appointmentService
      .getAppointments()
      .filter((a) => a.fecha === date && a.doctorId === doctorId);
  },
};
