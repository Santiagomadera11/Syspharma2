import React, { useState, useEffect } from "react";
import {
  X,
  Save,
  Calendar,
  Clock,
  User,
  FileText,
  Phone,
  CreditCard,
  Stethoscope,
  AlertCircle,
  Loader2,
  DollarSign,
} from "lucide-react";
import { appointmentService } from "../services/appointmentService";

// Helper para obtener fecha local "YYYY-MM-DD" sin restar días por zona horaria
const getLocalToday = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const AppointmentFormModal = ({
  isOpen,
  onClose,
  onSave,
  appointment,
  doctors,
  availabilityService,
}) => {
  const initialFormState = {
    paciente: "",
    documento: "",
    telefono: "",
    doctorId: "",
    fecha: getLocalToday(), // Usamos fecha local por defecto
    hora: "",
    servicio: "",
    precio: "",
    notas: "",
  };

  const [formData, setFormData] = useState(initialFormState);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [servicesList, setServicesList] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. CARGAR DATOS
  useEffect(() => {
    if (appointment) {
      setFormData({
        paciente: appointment.paciente || "",
        documento: appointment.documento || "",
        telefono: appointment.telefono || "",
        doctorId: appointment.doctorId || "",
        fecha: appointment.fecha || getLocalToday(),
        hora: appointment.hora || "",
        servicio: appointment.servicio || "",
        precio: appointment.precio || "",
        notas: appointment.notas || "",
      });
    } else {
      const currentUser = JSON.parse(localStorage.getItem("syspharma_user") || "{}");
      // Prefill paciente, documento and telefono from current user when available
      setFormData({
        ...initialFormState,
        paciente: currentUser.nombre || initialFormState.paciente,
        documento: currentUser.documento || (currentUser.id ? String(currentUser.id) : initialFormState.documento),
        telefono: currentUser.telefono || initialFormState.telefono,
      });
    }
    setErrors({});

    // Cargar servicios
    const loadServices = () => {
      try {
        const storedServices = localStorage.getItem("sys_services_db");
        if (storedServices) {
          const parsedServices = JSON.parse(storedServices);
          const activeServices = parsedServices.filter(
            (s) => s.estado === "Activo",
          );
          setServicesList(activeServices);
        }
      } catch (error) {
        console.error("Error cargando servicios:", error);
      }
    };
    loadServices();
  }, [appointment, isOpen]);

  // Generador de horas de respaldo
  const generateTimeSlots = () => {
    const slots = [];
    for (let i = 8; i < 18; i++) {
      slots.push(`${i.toString().padStart(2, "0")}:00`);
      slots.push(`${i.toString().padStart(2, "0")}:30`);
    }
    return slots;
  };

  // 2. BUSCAR HORARIOS
  useEffect(() => {
    if (formData.doctorId && formData.fecha) {
      let slots = [];
      try {
        if (
          availabilityService &&
          typeof availabilityService.getAvailableSlotsForDate === "function"
        ) {
          slots = availabilityService.getAvailableSlotsForDate(
            parseInt(formData.doctorId),
            formData.fecha,
          );
        }
      } catch (error) {
        console.warn("Error slots servicio");
      }

      if (!slots || slots.length === 0) slots = generateTimeSlots();
      setAvailableSlots(slots);
    } else {
      setAvailableSlots([]);
    }
  }, [formData.doctorId, formData.fecha, availabilityService]);

  // --- HANDLERS ---
  const handleGenericInput = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handleDoctorChange = (e) => {
    const doctorId = e.target.value;
    setFormData((prev) => ({ ...prev, doctorId: doctorId, hora: "" }));
    if (errors.doctorId) setErrors((prev) => ({ ...prev, doctorId: null }));
  };

  const handleServiceChange = (e) => {
    const selectedServiceName = e.target.value;
    const selectedServiceData = servicesList.find(
      (s) => s.nombre === selectedServiceName,
    );
    setFormData((prev) => ({
      ...prev,
      servicio: selectedServiceName,
      precio: selectedServiceData ? selectedServiceData.precio : "",
    }));
    if (errors.servicio) setErrors((prev) => ({ ...prev, servicio: null }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.paciente.trim()) newErrors.paciente = "Nombre obligatorio";
    if (!formData.documento.trim())
      newErrors.documento = "Documento obligatorio";
    if (!formData.doctorId) newErrors.doctorId = "Seleccione médico";
    if (!formData.fecha) newErrors.fecha = "Seleccione fecha";
    if (!formData.hora) newErrors.hora = "Seleccione hora";
    if (!formData.servicio) newErrors.servicio = "Seleccione servicio";
    if (!formData.precio) newErrors.precio = "Precio requerido";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isValid = validateForm();
    if (!isValid) return;
    setIsSubmitting(true);
    try {
      const appointmentData = {
        ...formData,
        doctorId: parseInt(formData.doctorId),
      };
      // Asociar la cita al usuario logueado cuando exista
      const currentUser = JSON.parse(localStorage.getItem("syspharma_user") || "{}");
      if (currentUser && currentUser.id) appointmentData.userId = currentUser.id;
      if (appointment) {
        await appointmentService.updateAppointment(
          appointment.id,
          appointmentData,
        );
        onSave && onSave(null);
      } else {
        try {
          const created = await appointmentService.createAppointment(appointmentData);
          onSave && onSave(created);
        } catch (err) {
          console.error(err);
        }
      }
      onClose();
    } catch (error) {
      console.error(error);
      alert("Error al guardar la cita.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="bg-emerald-600 px-6 py-4 flex justify-between items-center">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Calendar size={20} />
            {appointment ? "Editar Cita Médica" : "Nueva Cita Médica"}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/20 rounded-lg transition-colors text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <form
          onSubmit={handleSubmit}
          className="p-6 overflow-y-auto max-h-[75vh]"
        >
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* COLUMNA IZQUIERDA: DATOS PACIENTE */}
            <div className="md:col-span-5 space-y-5 md:border-r md:border-gray-100 md:pr-6">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide flex items-center gap-1.5 border-b pb-2 mb-3">
                <User size={14} /> Información Paciente
              </h3>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Nombre Completo *
                </label>
                <div className="relative">
                  <User
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={16}
                  />
                  <input
                    name="paciente"
                    type="text"
                    className={`w-full pl-9 pr-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 ${errors.paciente ? "border-red-300" : "border-gray-200 focus:border-emerald-400"}`}
                    value={formData.paciente}
                    onChange={handleGenericInput}
                  />
                </div>
                {errors.paciente && (
                  <p className="text-[10px] text-red-500 mt-1">
                    {errors.paciente}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Documento ID *
                </label>
                <div className="relative">
                  <FileText
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={16}
                  />
                  <input
                    name="documento"
                    type="text"
                    className={`w-full pl-9 pr-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 ${errors.documento ? "border-red-300" : "border-gray-200 focus:border-emerald-400"}`}
                    value={formData.documento}
                    onChange={handleGenericInput}
                  />
                </div>
                {errors.documento && (
                  <p className="text-[10px] text-red-500 mt-1">
                    {errors.documento}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Teléfono
                </label>
                <div className="relative">
                  <Phone
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={16}
                  />
                  <input
                    name="telefono"
                    type="tel"
                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-emerald-400"
                    value={formData.telefono}
                    onChange={handleGenericInput}
                  />
                </div>
              </div>
            </div>

            {/* COLUMNA DERECHA: DATOS CITA */}
            <div className="md:col-span-7 space-y-5">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide flex items-center gap-1.5 border-b pb-2 mb-3">
                <Stethoscope size={14} /> Detalle Atención
              </h3>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Médico / Especialista *
                </label>
                <select
                  name="doctorId"
                  className={`w-full px-3 py-2 text-sm border rounded-lg bg-white focus:outline-none focus:ring-2 ${errors.doctorId ? "border-red-300" : "border-gray-200 focus:border-emerald-400"}`}
                  value={formData.doctorId}
                  onChange={handleDoctorChange}
                >
                  <option value="">Seleccione especialista...</option>
                  {doctors &&
                    doctors.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.nombre} — {d.especialidad}
                      </option>
                    ))}
                </select>
                {errors.doctorId && (
                  <p className="text-[10px] text-red-500 mt-1">
                    {errors.doctorId}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Fecha *
                  </label>
                  <div className="relative">
                    <Calendar
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      size={16}
                    />
                    <input
                      name="fecha"
                      type="date"
                      className={`w-full pl-9 pr-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 ${errors.fecha ? "border-red-300" : "border-gray-200 focus:border-emerald-400"}`}
                      value={formData.fecha}
                      onChange={handleGenericInput}
                      min={getLocalToday()}
                    />
                  </div>
                  {errors.fecha && (
                    <p className="text-[10px] text-red-500 mt-1">
                      {errors.fecha}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Hora *
                  </label>
                  <select
                    name="hora"
                    className={`w-full px-3 py-2 text-sm border rounded-lg bg-white focus:outline-none focus:ring-2 ${errors.hora ? "border-red-300" : "border-gray-200 focus:border-emerald-400"}`}
                    value={formData.hora}
                    onChange={handleGenericInput}
                    disabled={!formData.doctorId || !formData.fecha}
                  >
                    <option value="">
                      {availableSlots.length > 0 ? "Seleccionar hora..." : "--"}
                    </option>
                    {availableSlots.map((slot) => (
                      <option key={slot} value={slot}>
                        {slot}
                      </option>
                    ))}
                  </select>
                  {errors.hora && (
                    <p className="text-[10px] text-red-500 mt-1">
                      {errors.hora}
                    </p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Servicio *
                  </label>
                  {servicesList.length > 0 ? (
                    <select
                      name="servicio"
                      className={`w-full px-3 py-2 text-sm border rounded-lg bg-white focus:outline-none focus:ring-2 ${errors.servicio ? "border-red-300" : "border-gray-200 focus:border-emerald-400"}`}
                      value={formData.servicio}
                      onChange={handleServiceChange}
                    >
                      <option value="">Seleccione...</option>
                      {servicesList.map((srv) => (
                        <option key={srv.id} value={srv.nombre}>
                          {srv.nombre}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      name="servicio"
                      type="text"
                      placeholder="Describa el servicio..."
                      className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 ${errors.servicio ? "border-red-300" : "border-gray-200 focus:border-emerald-400"}`}
                      value={formData.servicio}
                      onChange={handleGenericInput}
                    />
                  )}
                  {errors.servicio && (
                    <p className="text-[10px] text-red-500 mt-1">
                      {errors.servicio}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Costo ($) *
                  </label>
                  <div className="relative">
                    <DollarSign
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      size={16}
                    />
                    <input
                      name="precio"
                      type="number"
                      className={`w-full pl-9 pr-3 py-2 text-sm border rounded-lg font-bold text-gray-700 focus:outline-none focus:ring-2 ${errors.precio ? "border-red-300" : "border-gray-200 focus:border-emerald-400"}`}
                      placeholder="0.00"
                      value={formData.precio}
                      onChange={handleGenericInput}
                    />
                  </div>
                  {errors.precio && (
                    <p className="text-[10px] text-red-500 mt-1">
                      {errors.precio}
                    </p>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Notas
                </label>
                <textarea
                  name="notas"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-emerald-400 resize-none h-20"
                  placeholder="Observaciones..."
                  value={formData.notas}
                  onChange={handleGenericInput}
                />
              </div>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-5 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-lg transition-colors flex items-center gap-2"
          >
            {isSubmitting ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Save size={16} />
            )}
            Guardar Cita
          </button>
        </div>
      </div>
    </div>
  );
};

export default AppointmentFormModal;
