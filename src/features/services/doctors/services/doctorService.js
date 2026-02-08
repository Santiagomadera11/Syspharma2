const DB_KEY = "syspharma_doctors";

// Datos iniciales: Médicos
const initialDoctors = [
  {
    id: 1,
    nombre: "Dr. Andrés López",
    especialidad: "Medicina General",
    diasLaborales: [1, 2, 3, 4, 5],
    horaInicio: "08:00",
    horaFin: "17:00",
    intervalo: 30,
    email: "andres.lopez@syspharma.com",
    telefono: "3001234567",
    estado: true,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=doctor1",
  },
  {
    id: 2,
    nombre: "Enf. María Ruiz",
    especialidad: "Inyectología",
    diasLaborales: [1, 2, 3, 4, 5, 6],
    horaInicio: "07:00",
    horaFin: "19:00",
    intervalo: 15,
    email: "maria.ruiz@syspharma.com",
    telefono: "3019876543",
    estado: true,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=doctor2",
  },
];

export const doctorService = {
  // --- OBTENER TODOS LOS MÉDICOS ---
  getAll: () => {
    const data = localStorage.getItem(DB_KEY);
    if (!data) {
      localStorage.setItem(DB_KEY, JSON.stringify(initialDoctors));
      return initialDoctors;
    }
    try {
      return JSON.parse(data);
    } catch {
      localStorage.setItem(DB_KEY, JSON.stringify(initialDoctors));
      return initialDoctors;
    }
  },

  // --- CREAR NUEVO MÉDICO ---
  create: (doctorData) => {
    const doctors = doctorService.getAll();
    const id = Math.max(...doctors.map((d) => d.id || 0), 0) + 1;
    const newDoctor = {
      id,
      nombre: doctorData.nombre,
      especialidad: doctorData.especialidad,
      email: doctorData.email || "",
      telefono: doctorData.telefono || "",
      diasLaborales: doctorData.diasLaborales || [1, 2, 3, 4, 5],
      horaInicio: doctorData.horaInicio || "08:00",
      horaFin: doctorData.horaFin || "17:00",
      intervalo: doctorData.intervalo || 30,
      estado: typeof doctorData.estado === "boolean" ? doctorData.estado : true,
      avatar:
        doctorData.avatar ||
        `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
          doctorData.nombre || id
        )}`,
    };
    const next = [newDoctor, ...doctors];
    localStorage.setItem(DB_KEY, JSON.stringify(next));
    return next;
  },

  // --- ACTUALIZAR MÉDICO ---
  update: (doctorData) => {
    const doctors = doctorService.getAll();
    const updated = doctors.map((d) =>
      d.id === doctorData.id ? { ...d, ...doctorData } : d
    );
    localStorage.setItem(DB_KEY, JSON.stringify(updated));
    return updated;
  },

  // --- OBTENER UN MÉDICO POR ID ---
  getById: (id) => {
    const doctors = doctorService.getAll();
    return doctors.find((d) => d.id === id);
  },

  // --- ELIMINAR MÉDICO ---
  delete: (id) => {
    const doctors = doctorService.getAll();
    const filtered = doctors.filter((d) => d.id !== id);
    localStorage.setItem(DB_KEY, JSON.stringify(filtered));
    return filtered;
  },

  // --- CAMBIAR ESTADO (Activo/Inactivo) ---
  toggleStatus: (id) => {
    const doctors = doctorService.getAll();
    const updated = doctors.map((d) =>
      d.id === id ? { ...d, estado: !d.estado } : d
    );
    localStorage.setItem(DB_KEY, JSON.stringify(updated));
    return updated;
  },

  // --- GUARDAR TODOS (para bulk updates) ---
  saveAll: (list) => {
    const arr = Array.isArray(list) ? list : [];
    localStorage.setItem(DB_KEY, JSON.stringify(arr));
    return arr;
  },

  // --- OBTENER MÉDICOS ACTIVOS ---
  getActive: () => {
    return doctorService.getAll().filter((d) => d.estado);
  },

  // --- OBTENER MÉDICOS POR ESPECIALIDAD ---
  getBySpecialty: (specialty) => {
    return doctorService
      .getAll()
      .filter((d) => d.especialidad.toLowerCase() === specialty.toLowerCase());
  },
};
