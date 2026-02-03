const DB_AVAILABILITY = "syspharma_availability";
const DB_UNAVAILABLE_DAYS = "syspharma_unavailable_days";

// Datos iniciales de disponibilidad por médico
const initialAvailability = [
  {
    doctorId: 1,
    doctorName: "Dr. Andrés López",
    schedule: {
      monday: {
        morning: { start: "08:00", end: "12:00" },
        afternoon: { start: "14:00", end: "18:00" },
      },
      tuesday: {
        morning: { start: "08:00", end: "12:00" },
        afternoon: { start: "14:00", end: "18:00" },
      },
      wednesday: {
        morning: { start: "08:00", end: "12:00" },
        afternoon: { start: "14:00", end: "18:00" },
      },
      thursday: {
        morning: { start: "08:00", end: "12:00" },
        afternoon: { start: "14:00", end: "18:00" },
      },
      friday: {
        morning: { start: "08:00", end: "12:00" },
        afternoon: { start: "14:00", end: "18:00" },
      },
      saturday: null,
      sunday: null,
    },
  },
  {
    doctorId: 2,
    doctorName: "Enf. María Ruiz",
    schedule: {
      monday: {
        morning: { start: "07:00", end: "13:00" },
        afternoon: { start: "15:00", end: "19:00" },
      },
      tuesday: {
        morning: { start: "07:00", end: "13:00" },
        afternoon: { start: "15:00", end: "19:00" },
      },
      wednesday: {
        morning: { start: "07:00", end: "13:00" },
        afternoon: { start: "15:00", end: "19:00" },
      },
      thursday: {
        morning: { start: "07:00", end: "13:00" },
        afternoon: { start: "15:00", end: "19:00" },
      },
      friday: {
        morning: { start: "07:00", end: "13:00" },
        afternoon: { start: "15:00", end: "19:00" },
      },
      saturday: { morning: { start: "08:00", end: "12:00" }, afternoon: null },
      sunday: null,
    },
  },
];

const initialUnavailableDays = [
  // Ejemplo: { date: "2025-12-25", reason: "Navidad" }
];

export const availabilityService = {
  // --- DISPONIBILIDAD POR MÉDICO ---
  getAvailability: () => {
    const data = localStorage.getItem(DB_AVAILABILITY);
    if (!data) {
      localStorage.setItem(
        DB_AVAILABILITY,
        JSON.stringify(initialAvailability),
      );
      return initialAvailability;
    }
    return JSON.parse(data);
  },

  getAvailabilityByDoctor: (doctorId) => {
    const all = availabilityService.getAvailability();
    return all.find((a) => a.doctorId === doctorId) || null;
  },

  updateAvailability: (doctorId, newSchedule) => {
    const all = availabilityService.getAvailability();
    const updated = all.map((a) =>
      a.doctorId === doctorId ? { ...a, schedule: newSchedule } : a,
    );
    localStorage.setItem(DB_AVAILABILITY, JSON.stringify(updated));
    return updated;
  },

  // --- DÍAS NO DISPONIBLES ---
  getUnavailableDays: () => {
    const data = localStorage.getItem(DB_UNAVAILABLE_DAYS);
    if (!data) {
      localStorage.setItem(
        DB_UNAVAILABLE_DAYS,
        JSON.stringify(initialUnavailableDays),
      );
      return initialUnavailableDays;
    }
    return JSON.parse(data);
  },

  addUnavailableDay: (date, reason) => {
    const list = availabilityService.getUnavailableDays();
    const newDay = { date, reason, id: Date.now() };
    const updated = [...list, newDay];
    localStorage.setItem(DB_UNAVAILABLE_DAYS, JSON.stringify(updated));
    return updated;
  },

  removeUnavailableDay: (id) => {
    const list = availabilityService.getUnavailableDays();
    const updated = list.filter((d) => d.id !== id);
    localStorage.setItem(DB_UNAVAILABLE_DAYS, JSON.stringify(updated));
    return updated;
  },

  isDayUnavailable: (date) => {
    const unavailable = availabilityService.getUnavailableDays();
    return unavailable.some((d) => d.date === date);
  },

  // --- SLOTS DISPONIBLES ---
  getAvailableSlots: (doctorId, date) => {
    const availability = availabilityService.getAvailabilityByDoctor(doctorId);
    if (!availability) return [];

    // Verificar si el día está bloqueado
    if (availabilityService.isDayUnavailable(date)) return [];

    const dateObj = new Date(date);
    const dayOfWeek = dateObj
      .toLocaleDateString("en", { weekday: "long" })
      .toLowerCase();

    const daySchedule = availability.schedule[dayOfWeek];
    if (!daySchedule) return [];

    const slots = [];

    // Función auxiliar para generar slots
    const generateSlots = (start, end, interval = 30) => {
      const startTime = new Date(`${date}T${start}`);
      const endTime = new Date(`${date}T${end}`);
      const result = [];

      while (startTime < endTime) {
        result.push(startTime.toTimeString().slice(0, 5));
        startTime.setMinutes(startTime.getMinutes() + interval);
      }

      return result;
    };

    // Slots de mañana
    if (daySchedule.morning) {
      slots.push(
        ...generateSlots(daySchedule.morning.start, daySchedule.morning.end),
      );
    }

    // Slots de tarde
    if (daySchedule.afternoon) {
      slots.push(
        ...generateSlots(
          daySchedule.afternoon.start,
          daySchedule.afternoon.end,
        ),
      );
    }

    return slots;
  },

  getAvailableSlotsForDate: (doctorId, date) => {
    const allSlots = availabilityService.getAvailableSlots(doctorId, date);
    const appointments = JSON.parse(
      localStorage.getItem("syspharma_appointments") || "[]",
    );
    const takenSlots = appointments
      .filter(
        (a) =>
          a.doctorId === doctorId &&
          a.fecha === date &&
          a.estado !== "Cancelada",
      )
      .map((a) => a.hora);

    return allSlots.filter((slot) => !takenSlots.includes(slot));
  },
};
