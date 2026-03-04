const DB_AVAILABILITY = "syspharma_availability";
const DB_UNAVAILABLE_DAYS = "syspharma_unavailable_days";

// Datos iniciales de disponibilidad por médico
const initialAvailability = [];

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
    if (!availability) {
      console.warn(`No availability found for doctor ${doctorId}`);
      return [];
    }

    // Verificar si el día está bloqueado
    if (availabilityService.isDayUnavailable(date)) {
      console.warn(`Date ${date} is unavailable`);
      return [];
    }

    // Crear fecha en UTC para evitar problemas de zona horaria
    const [year, month, day] = date.split("-").map(Number);
    const dateObj = new Date(year, month - 1, day);
    const dayNum = dateObj.getDay();
    
    // Mapear a nombre del día en inglés
    const dayNames = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

    const dayOfWeek = dayNames[dayNum];
    console.log(`🔍 DEBUG getAvailableSlots - Doctor: ${doctorId}, Date: ${date}, DayOfWeek: ${dayOfWeek}, DayNum: ${dayNum}`);
    const daySchedule = availability.schedule[dayOfWeek];
    if (!daySchedule) {
      console.warn(`No schedule for day: ${dayOfWeek} (date: ${date})`);
      return [];
    }

    const slots = [];

    // Función auxiliar para generar slots
    const generateSlots = (start, end, interval = 30) => {
      const [startHour, startMin] = start.split(":").map(Number);
      const [endHour, endMin] = end.split(":").map(Number);
      
      const startMinutes = startHour * 60 + startMin;
      const endMinutes = endHour * 60 + endMin;
      
      const result = [];
      for (let mins = startMinutes; mins < endMinutes; mins += interval) {
        const hours = Math.floor(mins / 60);
        const minutes = mins % 60;
        result.push(`${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`);
      }

      return result;
    };

    // Slots de mañana
    if (daySchedule.morning) {
        console.log(`🌅 Morning: ${daySchedule.morning.start} - ${daySchedule.morning.end}`);
      slots.push(
        ...generateSlots(daySchedule.morning.start, daySchedule.morning.end),
      );
    }

    // Slots de tarde
    if (daySchedule.afternoon) {
        console.log(`🌅 Afternoon: ${daySchedule.afternoon.start} - ${daySchedule.afternoon.end}`);
      slots.push(
        ...generateSlots(
          daySchedule.afternoon.start,
          daySchedule.afternoon.end,
        ),
      );
    }

    console.log(`Generated ${slots.length} slots for doctor ${doctorId} on ${date}:`, slots);
    return slots;
  },

  getAvailableSlotsForDate: (doctorId, date) => {
    console.log(`📞 getAvailableSlotsForDate called - Doctor: ${doctorId}, Date: ${date}`);
    const allSlots = availabilityService.getAvailableSlots(doctorId, date);
    console.log(`📊 All slots from getAvailableSlots:`, allSlots);
    
    const appointments = JSON.parse(
      localStorage.getItem("sys_appointments_db") || "[]"
    );
    console.log(`📋 All appointments in DB:`, appointments);
    
    const takenSlots = appointments
      .filter(
        (a) =>
          a.doctorId === doctorId &&
          a.fecha === date &&
          a.estado !== "Cancelada",
      )
      .map((a) => a.hora);
    console.log(`🚫 Taken slots:`, takenSlots);

    const available = allSlots.filter((slot) => !takenSlots.includes(slot));
    console.log(`✅ Final available slots:`, available);
    return available;
  },
};
