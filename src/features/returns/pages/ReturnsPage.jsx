import React from "react";
import { useNavigate } from "react-router-dom";
import { RotateCcw, ArrowLeft } from "lucide-react";
import { useReturns } from "../hooks/useReturns";
import { ReturnList } from "../components/ReturnList";

export const ReturnsPage = () => {
  const navigate = useNavigate();
  const { devoluciones, loading, fetchAll } = useReturns();

  const user = JSON.parse(sessionStorage.getItem("syspharma_user") || "{}");
  const userRole = (user.rol || "").toLowerCase().trim();
  const ventasPath = userRole === "administrador" ? "/admin/ventas" : "/employee/ventas";

  return (
    <div className="p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
              <RotateCcw size={22} className="text-emerald-600" />
            </div>
            Devoluciones
          </h1>
          <p className="text-sm text-gray-500 mt-1">Gestiona las devoluciones de ventas</p>
        </div>
        <button
          onClick={() => navigate(ventasPath)}
          className={`flex items-center gap-2 px-4 py-2 text-white rounded-lg transition-colors font-medium text-sm ${
            userRole === "administrador"
              ? "bg-emerald-600 hover:bg-emerald-700"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          <ArrowLeft size={18} /> Volver a Ventas
        </button>
      </div>

      {/* Contenido */}
      <ReturnList devoluciones={devoluciones} loading={loading} onRefresh={fetchAll} />
    </div>
  );
};
