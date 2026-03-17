import axios from "axios";

const API_URL = "http://localhost:5055/api/Medico";

const getAuthHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("syspharma_token")}` },
});

const parseDias = (diasStr) => {
  try { return diasStr ? JSON.parse(diasStr) : [1, 2, 3, 4, 5]; }
  catch { return [1, 2, 3, 4, 5]; }
};

const mapDoctor = (m) => ({
  ...m,
  diasLaborales: parseDias(m.diasLaborales),
  avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(m.nombre || m.id)}`,
});

export const doctorService = {
  getAll: async () => {
    const res = await axios.get(API_URL, getAuthHeaders());
    return res.data.map(mapDoctor);
  },

  getById: async (id) => {
    const res = await axios.get(`${API_URL}/${id}`, getAuthHeaders());
    return mapDoctor(res.data);
  },

  create: async (doctorData) => {
    const payload = {
      nombre: doctorData.nombre,
      especialidad: doctorData.especialidad || null,
      documento: doctorData.documento || null,
      email: doctorData.email || null,
      telefono: doctorData.telefono || null,
      diasLaborales: JSON.stringify(doctorData.diasLaborales || [1, 2, 3, 4, 5]),
      horaInicio: doctorData.horaInicio || "08:00",
      horaFin: doctorData.horaFin || "17:00",
      intervalo: doctorData.intervalo || 30,
    };
    const res = await axios.post(API_URL, payload, getAuthHeaders());
    return mapDoctor(res.data);
  },

  update: async (doctorData) => {
    const payload = {
      id: doctorData.id,
      nombre: doctorData.nombre,
      especialidad: doctorData.especialidad || null,
      documento: doctorData.documento || null,
      email: doctorData.email || null,
      telefono: doctorData.telefono || null,
      diasLaborales: JSON.stringify(doctorData.diasLaborales || [1, 2, 3, 4, 5]),
      horaInicio: doctorData.horaInicio || "08:00",
      horaFin: doctorData.horaFin || "17:00",
      intervalo: doctorData.intervalo || 30,
    };
    const res = await axios.put(API_URL, payload, getAuthHeaders());
    return mapDoctor(res.data);
  },

  delete: async (id) => {
    await axios.delete(`${API_URL}/${id}`, getAuthHeaders());
  },

  toggleStatus: async (id, estadoActual) => {
    const config = getAuthHeaders();
    config.headers["Content-Type"] = "application/json";
    await axios.patch(`${API_URL}/${id}/estado`, !estadoActual, config);
  },

  getActive: async () => {
    const all = await doctorService.getAll();
    return all.filter((d) => d.estado);
  },
};