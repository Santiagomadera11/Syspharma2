import React, { useState, useEffect } from "react";
import { X, Save, User, BookOpen, Mail, Phone, AlertCircle, CreditCard } from "lucide-react";

const DoctorFormModal = ({ isOpen, onClose, onSave, doctor }) => {
  const [formData, setFormData] = useState({
    nombre: "",
    especialidad: "",
    documento: "",
    email: "",
    telefono: "",
    diasLaborales: [1, 2, 3, 4, 5],
    horaInicio: "08:00",
    horaFin: "17:00",
    intervalo: 30,
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const diasDeSemana = [
    { value: 0, label: "Domingo" },
    { value: 1, label: "Lunes" },
    { value: 2, label: "Martes" },
    { value: 3, label: "Miércoles" },
    { value: 4, label: "Jueves" },
    { value: 5, label: "Viernes" },
    { value: 6, label: "Sábado" },
  ];

  useEffect(() => {
    if (doctor) {
      setFormData({
        nombre: doctor.nombre || "",
        especialidad: doctor.especialidad || "",
        documento: doctor.documento || "",
        email: doctor.email || "",
        telefono: doctor.telefono || "",
        diasLaborales: doctor.diasLaborales || [1, 2, 3, 4, 5],
        horaInicio: doctor.horaInicio || "08:00",
        horaFin: doctor.horaFin || "17:00",
        intervalo: doctor.intervalo || 30,
      });
    } else {
      setFormData({
        nombre: "", especialidad: "", documento: "", email: "", telefono: "",
        diasLaborales: [1, 2, 3, 4, 5], horaInicio: "08:00", horaFin: "17:00", intervalo: 30,
      });
    }
    setErrors({});
  }, [doctor, isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: "" });
  };

  const handleDayToggle = (day) => {
    setFormData((prev) => ({
      ...prev,
      diasLaborales: prev.diasLaborales.includes(day)
        ? prev.diasLaborales.filter((d) => d !== day)
        : [...prev.diasLaborales, day].sort(),
    }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.nombre.trim()) newErrors.nombre = "El nombre es requerido";
    if (!formData.especialidad.trim()) newErrors.especialidad = "La especialidad es requerida";
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = "Email inválido";
    if (formData.diasLaborales.length === 0) newErrors.diasLaborales = "Selecciona al menos un día laboral";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }

    setLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      setErrors({ general: error?.response?.data?.message || "Error al guardar el médico" });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800">
            {doctor ? `Editar Médico: ${doctor.nombre}` : "Nuevo Médico"}
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
            <X size={24} className="text-gray-600" />
          </button>
        </div>

        {errors.general && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
            <AlertCircle size={16} /> {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Nombre */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <User size={16} /> Nombre Completo
            </label>
            <input type="text" name="nombre" value={formData.nombre} onChange={handleInputChange}
              placeholder="Ej: Dr. Juan Pérez"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 ${errors.nombre ? "border-red-500 focus:ring-red-300" : "border-gray-200 focus:ring-blue-300"}`} />
            {errors.nombre && <div className="flex items-center gap-1 mt-1 text-red-500 text-xs"><AlertCircle size={12} />{errors.nombre}</div>}
          </div>

          {/* Especialidad */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <BookOpen size={16} /> Especialidad
            </label>
            <input type="text" name="especialidad" value={formData.especialidad} onChange={handleInputChange}
              placeholder="Ej: Medicina General, Cardiología"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 ${errors.especialidad ? "border-red-500 focus:ring-red-300" : "border-gray-200 focus:ring-blue-300"}`} />
            {errors.especialidad && <div className="flex items-center gap-1 mt-1 text-red-500 text-xs"><AlertCircle size={12} />{errors.especialidad}</div>}
          </div>

          {/* Documento */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <CreditCard size={16} /> Documento
            </label>
            <input type="text" name="documento" value={formData.documento} onChange={handleInputChange}
              placeholder="Número de documento"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-300" />
          </div>

          {/* Email */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Mail size={16} /> Email
            </label>
            <input type="email" name="email" value={formData.email} onChange={handleInputChange}
              placeholder="doctor@syspharma.com"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 ${errors.email ? "border-red-500 focus:ring-red-300" : "border-gray-200 focus:ring-blue-300"}`} />
            {errors.email && <div className="flex items-center gap-1 mt-1 text-red-500 text-xs"><AlertCircle size={12} />{errors.email}</div>}
          </div>

          {/* Teléfono */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Phone size={16} /> Teléfono
            </label>
            <input type="tel" name="telefono" value={formData.telefono} onChange={handleInputChange}
              placeholder="3001234567"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-300" />
          </div>

          {/* Días Laborales */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Días Laborales</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {diasDeSemana.map((dia) => (
                <label key={dia.value} className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={formData.diasLaborales.includes(dia.value)}
                    onChange={() => handleDayToggle(dia.value)}
                    className="w-4 h-4 rounded border-gray-300 focus:ring-blue-300" />
                  <span className="text-sm text-gray-700">{dia.label}</span>
                </label>
              ))}
            </div>
            {errors.diasLaborales && <p className="text-red-600 text-xs mt-1">{errors.diasLaborales}</p>}
          </div>

          {/* Horarios */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Hora de Inicio</label>
              <input type="time" name="horaInicio" value={formData.horaInicio} onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-300" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Hora de Fin</label>
              <input type="time" name="horaFin" value={formData.horaFin} onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-300" />
            </div>
          </div>

          {/* Intervalo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Intervalo entre Citas (minutos)</label>
            <select name="intervalo" value={formData.intervalo} onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-300">
              <option value={15}>15 minutos</option>
              <option value={30}>30 minutos</option>
              <option value={45}>45 minutos</option>
              <option value={60}>1 hora</option>
            </select>
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-4 border-t">
            <button type="button" onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
              <Save size={16} />
              {loading ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DoctorFormModal;