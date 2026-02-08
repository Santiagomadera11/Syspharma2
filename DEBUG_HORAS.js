// 🔧 DEBUGGING PARA LAS HORAS
// Abre la consola del navegador (F12) y pega este código

// 1. VERIFICAR DISPONIBILIDAD DEL MÉDICO
console.log("=== DEBUGGING HORAS ===");

// Obtener disponibilidad
const availability = JSON.parse(localStorage.getItem("syspharma_availability") || "[]");
console.log("📅 Disponibilidad de médicos:", availability);

// 2. VERIFICAR HORARIOS DEL DR. ANDRÉS LÓPEZ (ID 1)
const drAndres = availability.find(a => a.doctorId === 1);
console.log("👨‍⚕️ Dr. Andrés López:", drAndres);

if (drAndres) {
  console.log("Horarios de Dr. Andrés:");
  console.log("- Lunes:", drAndres.schedule.monday);
  console.log("- Martes:", drAndres.schedule.tuesday);
  console.log("- Miércoles:", drAndres.schedule.wednesday);
  console.log("- Jueves:", drAndres.schedule.thursday);
  console.log("- Viernes:", drAndres.schedule.friday);
  console.log("- Sábado:", drAndres.schedule.saturday);
  console.log("- Domingo:", drAndres.schedule.sunday);
}

// 3. VERIFICAR CITAS EXISTENTES
const appointments = JSON.parse(localStorage.getItem("sys_appointments_db") || "[]");
console.log("📋 Citas existentes:", appointments);

// 4. PRUEBA: GENERAR SLOTS MANUALMENTE PARA UNA FECHA
// Cambia estos valores según lo que seleccionaste:
const testDoctorId = 1; // Dr. Andrés López
const testDate = "2026-02-09"; // Cambia a la fecha que seleccionaste (formato YYYY-MM-DD)

// Función para generar slots (copia del availabilityService)
function testGenerateSlots(doctorId, date) {
  const availability = JSON.parse(localStorage.getItem("syspharma_availability") || "[]");
  const doctorAvail = availability.find(a => a.doctorId === doctorId);
  
  if (!doctorAvail) {
    console.warn(`❌ No hay disponibilidad para doctor ${doctorId}`);
    return [];
  }
  
  // Parsear fecha
  const [year, month, day] = date.split("-").map(Number);
  const dateObj = new Date(year, month - 1, day);
  const dayNum = dateObj.getDay();
  
  const dayNames = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  const dayOfWeek = dayNames[dayNum];
  
  console.log(`📆 Fecha: ${date}, Día: ${dayOfWeek}, Número: ${dayNum}`);
  
  const daySchedule = doctorAvail.schedule[dayOfWeek];
  if (!daySchedule) {
    console.warn(`❌ No hay horario para ${dayOfWeek}`);
    return [];
  }
  
  const slots = [];
  
  // Generar slots
  function generateSlots(start, end, interval = 30) {
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
  }
  
  // Mañana
  if (daySchedule.morning) {
    console.log(`🌅 Mañana: ${daySchedule.morning.start} - ${daySchedule.morning.end}`);
    slots.push(...generateSlots(daySchedule.morning.start, daySchedule.morning.end));
  }
  
  // Tarde
  if (daySchedule.afternoon) {
    console.log(`🌅 Tarde: ${daySchedule.afternoon.start} - ${daySchedule.afternoon.end}`);
    slots.push(...generateSlots(daySchedule.afternoon.start, daySchedule.afternoon.end));
  }
  
  return slots;
}

// Ejecutar prueba
console.log("\n=== PRUEBA DE SLOTS ===");
const testSlots = testGenerateSlots(testDoctorId, testDate);
console.log(`✅ Slots generados (${testSlots.length}):`, testSlots);

// 5. VERIFICAR CITAS OCUPADAS PARA ESA FECHA
console.log("\n=== CITAS OCUPADAS ===");
const bookedSlots = appointments
  .filter(a => a.doctorId === testDoctorId && a.fecha === testDate && a.estado !== "Cancelada")
  .map(a => ({ hora: a.hora, paciente: a.paciente }));
console.log("Slots ocupados:", bookedSlots);

// 6. SLOTS DISPONIBLES (FINAL)
const availableSlots = testSlots.filter(slot => !bookedSlots.some(b => b.hora === slot));
console.log(`✅ Slots disponibles: ${availableSlots.length}`, availableSlots);

console.log("\n=== FIN DEBUGGING ===");
