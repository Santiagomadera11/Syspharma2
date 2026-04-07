import axios from "axios";

const API_URL = "http://localhost:5055/api/Cita";
const DOCTORS_API = "http://localhost:5055/api/Medico";

const getAuthHeaders = () => ({
  headers: { Authorization: `Bearer ${sessionStorage.getItem("syspharma_token")}` },
});

// Mapear estructura del frontend a la API
const mapToApiFormat = (appointmentData) => ({
  medicoId: appointmentData.doctorId,
  clienteNombre: appointmentData.paciente,
  clienteDocumento: appointmentData.documento,
  clienteTelefono: appointmentData.telefono,
  clienteEmail: appointmentData.email,
  fecha: appointmentData.fecha,
  hora: appointmentData.hora,
  motivo: appointmentData.servicio || "Consulta",
  precio: appointmentData.precio || 0,
  notas: appointmentData.notas,
  estadoId: appointmentData.estadoId || 1,
});

// Mapear estructura de la API a lo que espera el frontend
const mapFromApiFormat = (apiData) => ({
  id: apiData.id,
  doctorId: apiData.medicoId,
  medicoNombre: apiData.medicoNombre || apiData.medico?.nombre,
  paciente: apiData.clienteNombre,
  pacienteNombre: apiData.clienteNombre,
  documento: apiData.clienteDocumento,
  telefono: apiData.clienteTelefono,
  email: apiData.clienteEmail,
  fecha: apiData.fecha,
  hora: apiData.hora,
  servicio: apiData.motivo,
  servicioNombre: apiData.motivo,
  precio: apiData.precio,
  notas: apiData.notas,
  estado: apiData.estadoNombre || apiData.estado,
  estadoNombre: apiData.estadoNombre || apiData.estado,
});

export const appointmentService = {
  // --- MÉDICOS ---
  getDoctors: async () => {
    try {
      const res = await axios.get(DOCTORS_API, getAuthHeaders());
      return Array.isArray(res.data) ? res.data : [];
    } catch (error) {
      console.error("Error obteniendo médicos:", error);
      return [];
    }
  },

  updateDoctorSchedule: async (doctor) => {
    try {
      const res = await axios.put(DOCTORS_API, doctor, getAuthHeaders());
      return res.data;
    } catch (error) {
      console.error("Error actualizando horario del médico:", error);
      throw error;
    }
  },

  // --- CITAS ---
  getAppointments: async () => {
    try {
      const res = await axios.get(API_URL, getAuthHeaders());
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
      const res = await axios.post(API_URL, apiPayload, getAuthHeaders());

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
      const res = await axios.put(API_URL, { id, ...apiPayload }, getAuthHeaders());

      window.dispatchEvent(new Event("appointments:changed"));
      return mapFromApiFormat(res.data);
    } catch (error) {
      console.error("Error actualizando cita:", error);
      throw error;
    }
  },

  updateAppointmentStatus: async (id, newStatus) => {
    try {
      const config = getAuthHeaders();
      config.headers["Content-Type"] = "application/json";
      const res = await axios.patch(`${API_URL}/${id}/estado`, newStatus, config);

      window.dispatchEvent(new Event("appointments:changed"));
      return mapFromApiFormat(res.data);
    } catch (error) {
      console.error("Error actualizando estado:", error);
      throw error;
    }
  },

  deleteAppointment: async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`, getAuthHeaders());

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
