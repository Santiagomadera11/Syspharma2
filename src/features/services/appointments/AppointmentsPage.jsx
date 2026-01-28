import React, { useState } from "react";
import { 
  Plus, Search, Eye, Edit, Trash2, 
  ChevronLeft, ChevronRight, Filter, Calendar, User, 
  DollarSign, TrendingUp, TrendingDown, Wallet
} from "lucide-react";

import AppointmentFormModal from "./components/AppointmentFormModal";
import ExpenseFormModal from "./components/ExpenseFormModal"; 
import { useCrud } from "../../../shared/hooks/useCrud"; 

// --- UTILIDAD PARA OBTENER FECHA DE HOY (LOCAL) ---
// Esto asegura que "hoy" sea hoy en tu país, no en UTC
const getToday = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const HOY = getToday();

// --- DATOS INICIALES (Con fecha dinámica de HOY para que veas el cálculo) ---
const INITIAL_APPOINTMENTS = [
  { id: "CIT-001", paciente: "Cliente Demo 1", servicio: "Consulta General", profesional: "Dr. Juan", fecha: HOY, hora: "09:00", estadoCita: "Confirmada", precio: 25000, estadoPago: "Pagado" },
  { id: "CIT-002", paciente: "Cliente Demo 2", servicio: "Inyectable", profesional: "Enf. María", fecha: HOY, hora: "10:30", estadoCita: "Atendida", precio: 2500, estadoPago: "Pendiente" }, // Este NO se suma (Pendiente)
  { id: "CIT-003", paciente: "Cliente Demo 3", servicio: "Curación", profesional: "Enf. María", fecha: HOY, hora: "11:00", estadoCita: "Atendida", precio: 8000, estadoPago: "Pagado" }, // Este SÍ se suma
];

const INITIAL_EXPENSES = [
  { id: "GAS-001", concepto: "Taxi envío muestras", categoria: "Transporte", fecha: HOY, monto: 3500, metodoPago: "Efectivo" }
];

export const AppointmentsPage = () => {
  // 1. CARGAMOS DATOS
  const { items: appointments, addItem: addAppt, updateItem: updateAppt, deleteItem: deleteAppt } = useCrud("sys_appointments_v3", INITIAL_APPOINTMENTS);
  const { items: expenses, addItem: addExp, updateItem: updateExp, deleteItem: deleteExp } = useCrud("sys_expenses_v3", INITIAL_EXPENSES);

  const [activeTab, setActiveTab] = useState("citas"); 
  const [searchTerm, setSearchTerm] = useState("");
  
  // Estados Modales
  const [isApptModalOpen, setIsApptModalOpen] = useState(false);
  const [isExpModalOpen, setIsExpModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isViewMode, setIsViewMode] = useState(false);
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; 

  // ==========================================
  // 💰 LÓGICA DE SUMA (AQUÍ ESTÁ LA MAGIA)
  // ==========================================
  
  // 1. INGRESOS DEL DÍA
  // Filtramos: Que la fecha sea HOY Y que esté PAGADO Y que no esté Cancelada
  const ingresosHoy = appointments
    .filter(a => a.fecha === HOY && a.estadoPago === "Pagado" && a.estadoCita !== "Cancelada")
    .reduce((sum, a) => sum + (Number(a.precio) || 0), 0);

  // 2. GASTOS DEL DÍA
  const gastosHoy = expenses
    .filter(g => g.fecha === HOY)
    .reduce((sum, g) => sum + (Number(g.monto) || 0), 0);

  // 3. BALANCE
  const balanceNeto = ingresosHoy - gastosHoy;

  // ==========================================

  const openCreate = () => {
    setEditingItem(null);
    setIsViewMode(false);
    activeTab === "citas" ? setIsApptModalOpen(true) : setIsExpModalOpen(true);
  };

  const openEdit = (item) => {
    setEditingItem(item);
    setIsViewMode(false);
    activeTab === "citas" ? setIsApptModalOpen(true) : setIsExpModalOpen(true);
  };

  const handleDelete = (id) => {
    activeTab === "citas" ? deleteAppt(id) : deleteExp(id);
  };

  const currentDataList = activeTab === "citas" ? appointments : expenses;
  
  const filteredItems = currentDataList.filter((item) => {
    const texto = searchTerm.toLowerCase();
    if (activeTab === "citas") {
      return item.paciente?.toLowerCase().includes(texto) || item.servicio?.toLowerCase().includes(texto);
    } else {
      return item.concepto?.toLowerCase().includes(texto) || item.categoria?.toLowerCase().includes(texto);
    }
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

  const getBadge = (status) => {
    const styles = {
      "Confirmada": "bg-blue-50 text-blue-700 border-blue-200",
      "Pagado": "bg-green-50 text-green-700 border-green-200",
      "Pendiente": "bg-yellow-50 text-yellow-700 border-yellow-200",
      "Cancelada": "bg-red-50 text-red-700 border-red-200"
    };
    return <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${styles[status] || 'bg-gray-100 text-gray-700'}`}>{status}</span>;
  };

  return (
    <div className="h-full flex flex-col p-6 font-sans text-gray-800 bg-white md:bg-transparent relative">
      
      {/* TARJETAS DE RESUMEN */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {/* INGRESOS */}
        <div className="bg-white p-3 rounded-lg border border-emerald-100 shadow-sm flex items-center justify-between">
            <div>
                <p className="text-[10px] text-gray-500 uppercase font-bold">Ingresos (Hoy)</p>
                <h3 className="text-xl font-bold text-emerald-600 flex items-center gap-1">
                  <TrendingUp size={16}/> $ {ingresosHoy.toLocaleString()}
                </h3>
            </div>
            <div className="p-2 bg-emerald-50 rounded-full text-emerald-600"><DollarSign size={18}/></div>
        </div>

        {/* GASTOS */}
        <div className="bg-white p-3 rounded-lg border border-red-100 shadow-sm flex items-center justify-between">
            <div>
                <p className="text-[10px] text-gray-500 uppercase font-bold">Gastos (Hoy)</p>
                <h3 className="text-xl font-bold text-red-600 flex items-center gap-1">
                  <TrendingDown size={16}/> $ {gastosHoy.toLocaleString()}
                </h3>
            </div>
            <div className="p-2 bg-red-50 rounded-full text-red-600"><Wallet size={18}/></div>
        </div>

        {/* BALANCE */}
        <div className={`p-3 rounded-lg border shadow-sm flex items-center justify-between ${balanceNeto >= 0 ? 'bg-blue-50 border-blue-200' : 'bg-orange-50 border-orange-200'}`}>
            <div>
                <p className="text-[10px] text-gray-500 uppercase font-bold">Caja Neta</p>
                <h3 className={`text-xl font-bold ${balanceNeto >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>
                   $ {balanceNeto.toLocaleString()}
                </h3>
            </div>
            <div className="p-2 bg-white/50 rounded-full text-gray-600"><DollarSign size={18}/></div>
        </div>
      </div>

      {/* HEADER Y TABS */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div className="flex bg-gray-100 p-1 rounded-lg">
          <button 
            onClick={() => { setActiveTab("citas"); setCurrentPage(1); }}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${activeTab === "citas" ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Agenda de Citas
          </button>
          <button 
            onClick={() => { setActiveTab("gastos"); setCurrentPage(1); }}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${activeTab === "gastos" ? 'bg-white text-red-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Gastos del Día
          </button>
        </div>

        <button onClick={openCreate} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium shadow-sm transition-colors text-white ${activeTab === "citas" ? 'bg-[#34D399] hover:bg-emerald-500' : 'bg-red-500 hover:bg-red-600'}`}>
          <Plus size={16} /> {activeTab === "citas" ? "Nueva Cita" : "Registrar Gasto"}
        </button>
      </div>

      {/* FILTROS */}
      <div className="flex gap-3 mb-3 flex-shrink-0">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input type="text" placeholder={activeTab === "citas" ? "Buscar paciente..." : "Buscar gasto..."} className="w-full pl-9 pr-3 py-1.5 rounded-md border border-gray-300 text-sm focus:outline-none focus:border-blue-500" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
      </div>

      {/* TABLA */}
      <div className="flex-1 bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left border-collapse">
            <thead className={activeTab === "citas" ? "bg-[#5F9EA0] text-white" : "bg-red-500 text-white"}> 
              <tr>
                {activeTab === "citas" ? (
                  <>
                    <th className="py-2 px-3 text-[10px] uppercase">Hora</th>
                    <th className="py-2 px-3 text-[10px] uppercase">Paciente</th>
                    <th className="py-2 px-3 text-[10px] uppercase">Servicio</th>
                    <th className="py-2 px-3 text-[10px] uppercase text-right">Precio</th>
                    <th className="py-2 px-3 text-[10px] uppercase text-center">Estado</th>
                    <th className="py-2 px-3 text-[10px] uppercase text-center">Pago</th>
                  </>
                ) : (
                  <>
                    <th className="py-2 px-3 text-[10px] uppercase">Fecha</th>
                    <th className="py-2 px-3 text-[10px] uppercase">Concepto</th>
                    <th className="py-2 px-3 text-[10px] uppercase">Categoría</th>
                    <th className="py-2 px-3 text-[10px] uppercase text-right">Monto</th>
                    <th className="py-2 px-3 text-[10px] uppercase text-center">Método</th>
                  </>
                )}
                <th className="py-2 px-3 text-[10px] uppercase text-center">Acciones</th>
              </tr>
            </thead>
            
            <tbody className="divide-y divide-gray-100">
              {currentItems.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  {activeTab === "citas" ? (
                    <>
                      <td className="py-1.5 px-3 text-xs text-gray-600 font-medium">
                        {item.fecha === HOY ? <span className="text-emerald-600 font-bold">Hoy</span> : item.fecha} <br/> {item.hora}
                      </td>
                      <td className="py-1.5 px-3 text-xs font-bold text-gray-700">{item.paciente}</td>
                      <td className="py-1.5 px-3 text-xs text-gray-600">{item.servicio}</td>
                      <td className="py-1.5 px-3 text-xs font-bold text-gray-800 text-right">$ {Number(item.precio).toLocaleString()}</td>
                      <td className="py-1.5 px-3 text-center">{getBadge(item.estadoCita)}</td>
                      <td className="py-1.5 px-3 text-center">{getBadge(item.estadoPago)}</td>
                    </>
                  ) : (
                    <>
                      <td className="py-1.5 px-3 text-xs text-gray-600">{item.fecha === HOY ? "Hoy" : item.fecha}</td>
                      <td className="py-1.5 px-3 text-xs font-bold text-gray-700">{item.concepto}</td>
                      <td className="py-1.5 px-3 text-xs text-gray-500">{item.categoria}</td>
                      <td className="py-1.5 px-3 text-xs font-bold text-red-600 text-right">$ {Number(item.monto).toLocaleString()}</td>
                      <td className="py-1.5 px-3 text-center text-xs text-gray-500">{item.metodoPago}</td>
                    </>
                  )}

                  <td className="py-1.5 px-3">
                    <div className="flex items-center justify-center gap-1">
                      <button onClick={() => openEdit(item)} className="p-1 rounded border border-green-200 text-green-600 hover:bg-green-50"><Edit size={14} /></button>
                      <button onClick={() => handleDelete(item.id)} className="p-1 rounded border border-red-200 text-red-600 hover:bg-red-50"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* PAGINACIÓN */}
        <div className="bg-gray-50 px-3 py-1.5 border-t border-gray-200 flex items-center justify-between flex-shrink-0">
            <span className="text-[10px] text-gray-500">Pág {currentPage} de {totalPages || 1}</span>
            <div className="flex gap-1">
                <button onClick={() => setCurrentPage(c => Math.max(1, c-1))} disabled={currentPage === 1} className="p-1 rounded border border-gray-300 bg-white disabled:opacity-50"><ChevronLeft size={14}/></button>
                <button onClick={() => setCurrentPage(c => Math.min(totalPages, c+1))} disabled={currentPage === totalPages || totalPages === 0} className="p-1 rounded border border-gray-300 bg-white disabled:opacity-50"><ChevronRight size={14}/></button>
            </div>
        </div>
      </div>

      {/* MODALES CONECTADOS */}
      <AppointmentFormModal 
        isOpen={isApptModalOpen} 
        onClose={() => setIsApptModalOpen(false)} 
        onSave={(data) => {
            if (editingItem) updateAppt(editingItem.id, data);
            else addAppt({ ...data, id: `CIT-${Date.now()}` });
        }}
        initialData={editingItem}
        isViewMode={isViewMode} 
      />

      <ExpenseFormModal 
        isOpen={isExpModalOpen} 
        onClose={() => setIsExpModalOpen(false)} 
        onSave={(data) => {
            if (editingItem) updateExp(editingItem.id, data);
            else addExp({ ...data, id: `GAS-${Date.now()}` });
        }}
        initialData={editingItem}
        isViewMode={isViewMode} 
      />
    </div>
  );
};

export default AppointmentsPage;