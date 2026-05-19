import { apiClient } from "../../../../shared/utils/apiClient";

const APPOINTMENTS_ENDPOINT = "Cita";
const DOCTORS_ENDPOINT = "Medico";

// Mapear estructura del frontend a la API
const mapToApiFormat = (appointmentData) => {
  const currentUser = JSON.parse(sessionStorage.getItem("syspharma_user") || "{}");

  return {
    medicoId: appointmentData.doctorId,
    pacienteNombre: appointmentData.paciente,
    pacienteDocumento: appointmentData.documento,
    pacienteTelefono: appointmentData.telefono,
    pacienteEmail: appointmentData.email,
    fecha: appointmentData.fecha,
    hora: appointmentData.hora,
    servicioNombre: appointmentData.servicio || "Consulta",
    precio: appointmentData.precio || 0,
    notas: appointmentData.notas,
    estadoId: appointmentData.estadoId || 1,
    usuarioId: appointmentData.userId || currentUser?.id,
  };
};

// Mapear estructura de la API a lo que espera el frontend
const mapFromApiFormat = (apiData) => ({
  id: apiData.id,
  doctorId: apiData.medicoId,
  medicoNombre: apiData.medicoNombre || apiData.medico?.nombre,
  paciente: apiData.pacienteNombre,
  pacienteNombre: apiData.pacienteNombre,
  documento: apiData.pacienteDocumento,
  telefono: apiData.pacienteTelefono,
  email: apiData.pacienteEmail,
  fecha: apiData.fecha,
  hora: apiData.hora,
  servicio: apiData.servicioNombre,
  servicioNombre: apiData.servicioNombre,
  precio: apiData.precio,
  notas: apiData.notas,
  estado: apiData.estadoNombre || apiData.estado,
  estadoNombre: apiData.estadoNombre || apiData.estado,
});

export const appointmentService = {
  // --- MÉDICOS ---
  getDoctors: async () => {
  try {
    const res = await apiClient.get(DOCTORS_ENDPOINT);
    // apiClient puede devolver res directamente o res.data
    const data = Array.isArray(res) ? res : (Array.isArray(res.data) ? res.data : []);
    return data;
  } catch (error) {
    console.error("Error obteniendo médicos:", error);
    return [];
  }
},

  updateDoctorSchedule: async (doctor) => {
    try {
      const res = await apiClient.put(DOCTORS_ENDPOINT, doctor);
      return res.data;
    } catch (error) {
      console.error("Error actualizando horario del médico:", error);
      throw error;
    }
  },

  // --- CITAS ---
  getAppointments: async () => {
    try {
      const res = await apiClient.get(APPOINTMENTS_ENDPOINT);
      const appointments = Array.isArray(res.data) ? res.data : [];
      return appointments.map(mapFromApiFormat);
    } catch (error) {
      console.error("Error obteniendo citas:", error);
      return [];
    }
  },

  createAppointment: async (appt) => {
    try {
      const currentUser = JSON.parse(sessionStorage.getItem("syspharma_user") || "{}");

      const appointmentData = {
        ...appt,
        paciente: appt.paciente || currentUser.nombre,
        documento: appt.documento || currentUser.documento,
        telefono: appt.telefono || currentUser.telefono,
        email: appt.email || currentUser.email,
      };

      const apiPayload = mapToApiFormat(appointmentData);
      const res = await apiClient.post(APPOINTMENTS_ENDPOINT, apiPayload);

      window.dispatchEvent(new Event("appointments:changed"));
      return mapFromApiFormat(res.data);
    } catch (error) {
      console.error("Error creando cita:", error);
      throw error;
    }
  },

  updateAppointment: async (id, updates) => {
    try {
      const apiPayload = mapToApiFormat(updates);
      const res = await apiClient.put(APPOINTMENTS_ENDPOINT, { id, ...apiPayload });

      window.dispatchEvent(new Event("appointments:changed"));
      return mapFromApiFormat(res.data);
    } catch (error) {
      console.error("Error actualizando cita:", error);
      throw error;
    }
  },

  updateAppointmentStatus: async (id, newStatus) => {
    try {
      const res = await apiClient.patch(`${APPOINTMENTS_ENDPOINT}/${id}/estado`, newStatus);

      window.dispatchEvent(new Event("appointments:changed"));
      return mapFromApiFormat(res.data);
    } catch (error) {
      console.error("Error actualizando estado:", error);
      throw error;
    }
  },

  deleteAppointment: async (id) => {
    try {
      await apiClient.delete(`${APPOINTMENTS_ENDPOINT}/${id}`);

      window.dispatchEvent(new Event("appointments:changed"));
      return true;
    } catch (error) {
      console.error("Error eliminando cita:", error);
      throw error;
    }
  },

  cancelAppointment: async (id) => {
    try {
      return await appointmentService.updateAppointmentStatus(id, "Cancelada");
    } catch (error) {
      console.error("Error cancelando cita:", error);
      throw error;
    }
  },

  // --- UTILIDADES ---
  getAppointmentsByDate: async (date) => {
    try {
      const appointments = await appointmentService.getAppointments();
      return appointments.filter((a) => a.fecha === date);
    } catch (error) {
      console.error("Error filtrando citas por fecha:", error);
      return [];
    }
  },

  getAppointmentsByDoctor: async (doctorId) => {
    try {
      const appointments = await appointmentService.getAppointments();
      return appointments.filter((a) => a.doctorId === doctorId);
    } catch (error) {
      console.error("Error filtrando citas por médico:", error);
      return [];
    }
  },

  getAppointmentsByDateAndDoctor: async (date, doctorId) => {
    try {
      const appointments = await appointmentService.getAppointments();
      return appointments.filter((a) => a.fecha === date && a.doctorId === doctorId);
    } catch (error) {
      console.error("Error filtrando citas:", error);
      return [];
    }
  },
};

// (no debug exposure)
