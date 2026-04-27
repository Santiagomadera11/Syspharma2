import React, { useState, useEffect } from "react";
import { ShoppingBag, DollarSign, Search, ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { ordersService } from "../sales/orders/services/ordersService";

export const ClientMisPedidos = () => {
  const [orders, setOrders] = useState([]); 
  const [filteredOrders, setFilteredOrders] = useState([]); 
  const [filterStatus, setFilterStatus] = useState("Todos");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 2;

  // 1. CARGAR DATOS (Sincronizado exactamente como el Dashboard)
  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        // LEER EL USUARIO EXACTAMENTE COMO LO HACE EL DASHBOARD
        const currentUser = JSON.parse(sessionStorage.getItem("syspharma_user") || "{}");
        console.log("USUARIO IDENTIFICADO EN LISTA:", currentUser);

        const response = await ordersService.getAll();
        const data = Array.isArray(response) ? response : (response.data || []);
        
        console.log("PEDIDOS TOTALES RECIBIDOS:", data);

        // FILTRO ROBUSTO (ID, EMAIL O NOMBRE)
        const myOrders = data.filter(o => {
          const matchId = o.usuarioId && Number(o.usuarioId) === Number(currentUser.id);
          const matchEmail = o.clienteEmail && o.clienteEmail.toLowerCase() === currentUser.email?.toLowerCase();
          const matchNombre = o.clienteNombre && o.clienteNombre.toLowerCase().includes(currentUser.nombre?.toLowerCase().split(' ')[0]);
          
          return matchId || matchEmail || matchNombre;
        }).sort((a, b) => new Date(b.fechaCreacion) - new Date(a.fechaCreacion));

        console.log("PEDIDOS QUE PASARON EL FILTRO:", myOrders);

        setOrders(myOrders);
        setFilteredOrders(myOrders); 
      } catch (err) {
        console.error("Error cargando pedidos:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  // 2. FILTRADO POR ESTADO Y BUSCADOR
  useEffect(() => {
    let result = [...orders];

    if (filterStatus === "En Proceso") {
      result = result.filter(o => (o.estadoNombre || "").toLowerCase().includes("pendiente"));
    } else if (filterStatus === "Entregados") {
      result = result.filter(o => (o.estadoNombre || "").toLowerCase().includes("entregado") || (o.estadoNombre || "").toLowerCase().includes("completado"));
    }

    if (searchTerm) {
      result = result.filter(o => (o.numeroPedido || "").toLowerCase().includes(searchTerm.toLowerCase()));
    }

    setFilteredOrders(result);
    setCurrentPage(1); 
  }, [filterStatus, searchTerm, orders]);

  // Paginación
  const indexOfLast = currentPage * recordsPerPage;
  const indexOfFirst = indexOfLast - recordsPerPage;
  const currentRecords = filteredOrders.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredOrders.length / recordsPerPage);

  if (loading) return <div className="p-20 text-center font-bold text-emerald-600">Cargando tu historial...</div>;

  return (
    <div className="h-full flex flex-col gap-4 font-sans p-6 bg-white">
      <h1 className="text-3xl font-black text-gray-900">Mis Pedidos</h1>

      {/* RESUMEN */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm flex items-center gap-4">
          <div className="bg-blue-50 p-3 rounded-xl text-blue-600"><ShoppingBag size={24} /></div>
          <div><p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">Total Pedidos</p><p className="text-2xl font-black text-gray-900">{orders.length}</p></div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm flex items-center gap-4">
          <div className="bg-emerald-50 p-3 rounded-xl text-emerald-600"><DollarSign size={24} /></div>
          <div><p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">Inversión Total</p><p className="text-2xl font-black text-emerald-600">${orders.reduce((s,o)=>s+(o.total||0),0).toLocaleString()}</p></div>
        </div>
      </div>

      {/* BUSCADOR */}
      <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 flex flex-col gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          <input 
            type="text" className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none" 
            placeholder="Buscar por número de pedido..." value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} 
          />
        </div>
        <div className="flex gap-2">
          {["Todos", "En Proceso", "Entregados"].map(s => (
            <button key={s} onClick={()=>setFilterStatus(s)} className={`px-5 py-1.5 rounded-full text-xs font-bold transition-all ${filterStatus===s ? 'bg-emerald-600 text-white shadow-md':'bg-white text-gray-600 border border-gray-200'}`}>{s}</button>
          ))}
        </div>
      </div>

      {/* LISTA */}
      <div className="flex-1 flex flex-col gap-3">
        {currentRecords.length === 0 ? (
          <div className="p-10 text-center text-gray-400 border-2 border-dashed rounded-2xl">
             No hay pedidos para mostrar con el filtro <b>{filterStatus}</b>.
          </div>
        ) : (
          currentRecords.map(o => (
            <div key={o.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex justify-between items-center hover:border-emerald-200 transition-all">
              <div className="flex flex-col gap-1">
                <p className="font-black text-gray-900 tracking-tight">{o.numeroPedido}</p>
                <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase">
                  <Clock size={12} /> {new Date(o.fechaCreacion).toLocaleDateString()}
                </div>
              </div>
              <div className="text-right flex flex-col items-end gap-2">
                <span className={`px-3 py-0.5 rounded-lg text-[10px] font-black uppercase border ${
                  (o.estadoNombre || "").toLowerCase().includes("entregado") ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-blue-50 text-blue-700 border-blue-100'
                }`}>{o.estadoNombre}</span>
                <p className="text-xl font-black text-gray-900 tracking-tighter">${(o.total||0).toLocaleString()}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* PAGINACIÓN */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center pt-4 border-t">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Página {currentPage} de {totalPages}</span>
          <div className="flex gap-2">
            <button disabled={currentPage===1} onClick={()=>setCurrentPage(p=>p-1)} className="p-2 border rounded-xl hover:bg-gray-50 disabled:opacity-20"><ChevronLeft size={18}/></button>
            <button disabled={currentPage===totalPages} onClick={()=>setCurrentPage(p=>p+1)} className="p-2 border rounded-xl hover:bg-gray-50 disabled:opacity-20"><ChevronRight size={18}/></button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientMisPedidos;