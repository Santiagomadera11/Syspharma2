import React, { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
} from "lucide-react";
import { ConfirmDialog } from "../../../shared/ui/ConfirmDialog.jsx";
import { doctorService } from "./services/doctorService";
import DoctorFormModal from "./components/DoctorFormModal";
import { StatusNotification } from "/src/shared/ui/StatusNotification";

export const DoctorsPage = () => {
  const [doctors, setDoctors] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // Estados para el modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);

  // Estado para notificaciones
  const [notification, setNotification] = useState(null);

  // Paginación
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 5; // ✅ Reducido a 5 para mejor compacidad

  useEffect(() => {
    loadDoctors();
  }, []);

  const loadDoctors = () => {
    setDoctors(doctorService.getAll());
  };

  // Abrir modal para crear
  const handleOpenCreate = () => {
    setEditingDoctor(null);
    setIsModalOpen(true);
  };

  const [confirmConfig, setConfirmConfig] = useState({
    open: false,
    title: "Confirmar acción",
    message: "",
    onConfirm: null,
  });

  // Abrir modal para editar (solicita confirmación)
  const handleOpenEdit = (doctor) => {
    setConfirmConfig({
      open: true,
      title: "Confirmar edición",
      message: `¿Editar los datos de ${doctor.nombre}?`,
      confirmLabel: "Editar",
      onConfirm: () => {
        setEditingDoctor(doctor);
        setIsModalOpen(true);
      },
    });
  };

  // Guardar (crear o actualizar)
  const handleSaveDoctor = () => {
    loadDoctors();
    setNotification({
      message: editingDoctor
        ? "Médico actualizado correctamente"
        : "Médico creado correctamente",
      type: "success",
      duration: 3000,
    });
  };

  // Cambiar estado (activo/inactivo)
  const handleToggleStatus = (id) => {
    const doctor = doctors.find((d) => d.id === id);
    doctorService.toggleStatus(id);
    loadDoctors();

    const newStatus = !doctor.estado;
    setNotification({
      message: `${doctor.nombre} ahora está ${newStatus ? "Activo" : "Inactivo"}`,
      type: newStatus ? "success" : "warning",
      duration: 3000,
    });
  };

  // Eliminar doctor
  const handleDelete = (id) => {
    const doctor = doctors.find((d) => d.id === id);
    setConfirmConfig({
      open: true,
      title: "Confirmar eliminación",
      message: `¿Estás seguro de que deseas eliminar al médico ${doctor.nombre}?`,
      onConfirm: () => {
        doctorService.delete(id);
        loadDoctors();
        setNotification({
          message: `${doctor.nombre} ha sido eliminado`,
          type: "success",
          duration: 3000,
        });
      },
    });
  };

  // Filtrar doctors
  const filteredDoctors = doctors.filter((doc) => {
    const matchesSearch =
      doc.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.especialidad.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "active" && doc.estado) ||
      (filterStatus === "inactive" && !doc.estado);

    return matchesSearch && matchesStatus;
  });

  // Paginación
  const totalPages = Math.ceil(filteredDoctors.length / itemsPerPage);
  const paginatedDoctors = filteredDoctors.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  return (
    <div className="h-full flex flex-col gap-6 font-sans">
      {/* Header */}
      <div className="flex items-start justify-between flex-shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-emerald-700">Gestión de Médicos</h1>
          <p className="text-gray-500 text-xs mt-0.5">
            Administra el registro completo de profesionales médicos
          </p>
        </div>
      </div>

      {/* Búsqueda y Filtros */}
      <div className="flex gap-4 flex-shrink-0 flex-wrap">
        <div className="flex-1 min-w-[250px] relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={16}
          />
          <input
            type="text"
            placeholder="Buscar por nombre, especialidad o email..."
            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(0);
            }}
          />
        </div>

        <select
          value={filterStatus}
          onChange={(e) => {
            setFilterStatus(e.target.value);
            setCurrentPage(0);
          }}
          className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white"
        >
          <option value="all">Todos</option>
          <option value="active">Activos</option>
          <option value="inactive">Inactivos</option>
        </select>

        <button
          onClick={handleOpenCreate}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-bold shadow-sm flex items-center gap-2 flex-shrink-0"
        >
          <Plus size={16} />
          Nuevo Médico
        </button>
      </div>

      {/* Tabla de Médicos */}
      <div className="flex-1 overflow-auto bg-white rounded-xl shadow-sm border border-gray-100">
        <table className="w-full">
          <thead className="bg-emerald-600 text-white sticky top-0">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold">
                Nombre
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold">
                Especialidad
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold">
                Email
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold">
                Teléfono
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold">
                Días Laborales
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold">
                Estado
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {paginatedDoctors.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                  No se encontraron médicos
                </td>
              </tr>
            ) : (
              paginatedDoctors.map((doctor) => (
                <tr key={doctor.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={doctor.avatar}
                        alt={doctor.nombre}
                        className="w-8 h-8 rounded-full"
                      />
                      <div>
                        <div className="font-medium text-gray-900">
                          {doctor.nombre}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {doctor.especialidad}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {doctor.email}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {doctor.telefono}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex flex-wrap gap-1">
                      {doctor.diasLaborales &&
                        doctor.diasLaborales.length > 0 && (
                          <span className="inline-block bg-emerald-100 text-emerald-700 px-2 py-1 rounded text-xs">
                            {doctor.diasLaborales.length} días
                          </span>
                        )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        doctor.estado
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {doctor.estado ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleToggleStatus(doctor.id)}
                        className={`p-1 rounded transition-colors ${
                          doctor.estado
                            ? "text-green-600 hover:bg-green-50"
                            : "text-red-600 hover:bg-red-50"
                        }`}
                        title={
                          doctor.estado ? "Desactivar" : "Activar"
                        }
                      >
                        {doctor.estado ? (
                          <Eye size={16} />
                        ) : (
                          <EyeOff size={16} />
                        )}
                      </button>

                      <button
                        onClick={() => handleOpenEdit(doctor)}
                        className="p-1 text-gray-600 hover:bg-gray-50 rounded transition-colors"
                        title="Editar"
                      >
                        <Edit size={16} />
                      </button>

                      <button
                        onClick={() => handleDelete(doctor.id)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between flex-shrink-0">
          <div className="text-sm text-gray-600">
            Mostrando {paginatedDoctors.length > 0 ? currentPage * itemsPerPage + 1 : 0}-
            {Math.min((currentPage + 1) * itemsPerPage, filteredDoctors.length)} de{" "}
            {filteredDoctors.length}
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
              disabled={currentPage === 0}
              className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={20} />
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i)}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    currentPage === i
                      ? "bg-emerald-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            <button
              onClick={() =>
                setCurrentPage(Math.min(totalPages - 1, currentPage + 1))
              }
              disabled={currentPage === totalPages - 1}
              className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      )}

      {/* Modal */}
      <DoctorFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingDoctor(null);
        }}
        onSave={handleSaveDoctor}
        doctor={editingDoctor}
      />

      {/* Notificación */}
      {notification && (
        <StatusNotification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      <ConfirmDialog
        open={confirmConfig.open}
        title={confirmConfig.title}
        message={confirmConfig.message}
        confirmLabel={confirmConfig.confirmLabel}
        onCancel={() => setConfirmConfig((c) => ({ ...c, open: false }))}
        onConfirm={() => {
          confirmConfig.onConfirm && confirmConfig.onConfirm();
          setConfirmConfig((c) => ({ ...c, open: false }));
        }}
      />
    </div>
  );
};

export default DoctorsPage;
