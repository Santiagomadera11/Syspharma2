import React, { useState, useMemo } from "react";
import {
  Calendar,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  Eye,
  Download,
  ArrowUp,
  ArrowDown,
  Lock,
  Award,
  Stethoscope,
  AlertCircle,
} from "lucide-react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { turnService } from "../../sales/services/turnService";
import { CloseShiftModal } from "../../sales/components/CloseShiftModal";

const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444"];

export const SalesPerformanceReportsPage = () => {
  const [activeTab, setActiveTab] = useState("empleados");
  const [selectedShift, setSelectedShift] = useState(null);
  const [forceCloseShift, setForceCloseShift] = useState(null);

  const currentUser = JSON.parse(
    localStorage.getItem("syspharma_user") || '{"rol": ""}',
  );
  const isAdmin = currentUser?.rol === "Administrador";

  // ============ DATOS DE EMPLEADOS ============
  const employeesSummary = useMemo(() => {
    return turnService.getEmployeesSummary();
  }, []);

  // KPI: Empleado Estrella (más ventas)
  const topSeller = useMemo(() => {
    if (employeesSummary.length === 0) return null;
    return employeesSummary.reduce((prev, current) =>
      current.totalVentas > prev.totalVentas ? current : prev,
    );
  }, [employeesSummary]);

  // KPI: Rey del Servicio (más servicios)
  const topServiceProvider = useMemo(() => {
    if (employeesSummary.length === 0) return null;
    return employeesSummary.reduce((prev, current) =>
      current.totalServicios > prev.totalServicios ? current : prev,
    );
  }, [employeesSummary]);

  // KPI: Meta Grupal (suponer 5M de meta)
  const META_VENTAS = 5000000;
  const totalVentasGrupo = useMemo(() => {
    return employeesSummary.reduce((sum, emp) => sum + emp.totalVentas, 0);
  }, [employeesSummary]);
  const metaGroupal = (totalVentasGrupo / META_VENTAS) * 100;

  // Datos para gráfico de barras
  const chartData = useMemo(() => {
    return employeesSummary.map((emp) => ({
      nombre: emp.userName,
      ventas: emp.totalVentas,
      servicios: emp.totalServicios * 10000,
      userId: emp.userId,
    }));
  }, [employeesSummary]);

  // ============ DATOS DE MÉDICOS ============
  const medicosSummary = useMemo(() => {
    return turnService.getMedicosSummary();
  }, []);

  // Datos para gráfica de torta (médicos)
  const medicosPieData = useMemo(() => {
    return medicosSummary.map((medico) => ({
      name: medico.nombreMedico,
      value: medico.totalServicios,
      ingresos: medico.totalIngresos,
    }));
  }, [medicosSummary]);

  // Formatear moneda
  const formatCurrency = (val) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0,
    }).format(val || 0);

  // Determinar medalla según posición
  const getMedal = (index, total) => {
    if (total < 3) return null;
    if (index === 0) return { tipo: "oro", label: "🥇" };
    if (index === 1) return { tipo: "plata", label: "🥈" };
    if (index === 2) return { tipo: "bronce", label: "🥉" };
    return null;
  };

  return (
    <div className="h-full flex flex-col gap-4 font-sans text-gray-800 p-4">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Dashboard de Rendimiento
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Análisis de desempeño de empleados y médicos
          </p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold">
          <Download size={16} />
          Descargar Excel
        </button>
      </div>

      {/* TABS */}
      <div className="flex gap-2 bg-white p-2 rounded-lg shadow-sm border border-gray-200">
        <button
          onClick={() => setActiveTab("empleados")}
          className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
            activeTab === "empleados"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Desempeño de Empleados
        </button>
        <button
          onClick={() => setActiveTab("medicos")}
          className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
            activeTab === "medicos"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          <Stethoscope size={16} className="inline mr-2" />
          Productividad Médica
        </button>
      </div>

      {/* ============ TAB: EMPLEADOS ============ */}
      {activeTab === "empleados" && (
        <>
          {/* KPI CARDS */}
          <div className="grid grid-cols-3 gap-4">
            {/* Empleado Estrella */}
            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-lg shadow-sm border border-yellow-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-yellow-700 font-semibold mb-1">
                    ⭐ Empleado Estrella
                  </p>
                  <p className="text-lg font-bold text-yellow-900">
                    {topSeller?.userName || "—"}
                  </p>
                  <p className="text-sm text-yellow-700 font-semibold mt-2">
                    {formatCurrency(topSeller?.totalVentas || 0)}
                  </p>
                  <p className="text-xs text-yellow-600">en ventas</p>
                </div>
                <Award className="text-yellow-600" size={40} />
              </div>
            </div>

            {/* Rey del Servicio */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg shadow-sm border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-blue-700 font-semibold mb-1">
                    👑 Rey del Servicio
                  </p>
                  <p className="text-lg font-bold text-blue-900">
                    {topServiceProvider?.userName || "—"}
                  </p>
                  <p className="text-sm text-blue-700 font-semibold mt-2">
                    {topServiceProvider?.totalServicios || 0}
                  </p>
                  <p className="text-xs text-blue-600">servicios</p>
                </div>
                <Stethoscope className="text-blue-600" size={40} />
              </div>
            </div>

            {/* Meta Grupal */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg shadow-sm border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-green-700 font-semibold mb-1">
                    📊 Meta Grupal
                  </p>
                  <p className="text-lg font-bold text-green-900">
                    {metaGroupal.toFixed(1)}%
                  </p>
                  <p className="text-xs text-green-600 mt-2">
                    {formatCurrency(totalVentasGrupo)} /{" "}
                    {formatCurrency(META_VENTAS)}
                  </p>
                </div>
                <TrendingUp className="text-green-600" size={40} />
              </div>
            </div>
          </div>

          {/* GRÁFICO DE DESEMPEÑO */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              Ventas vs Servicios por Empleado
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="nombre" />
                <YAxis />
                <Tooltip
                  formatter={(value) => formatCurrency(value)}
                  contentStyle={{
                    backgroundColor: "#f9fafb",
                    border: "1px solid #e5e7eb",
                  }}
                />
                <Legend />
                <Bar dataKey="ventas" fill="#10b981" name="Ventas (COP)" />
                <Bar
                  dataKey="servicios"
                  fill="#3b82f6"
                  name="Servicios (escalado)"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* TABLA DE EMPLEADOS CON PRODUCTIVIDAD */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr className="border-b border-gray-200">
                    <th className="py-3 px-4 text-xs font-bold text-gray-700 uppercase">
                      Productividad
                    </th>
                    <th className="py-3 px-4 text-xs font-bold text-gray-700 uppercase">
                      Empleado
                    </th>
                    <th className="py-3 px-4 text-xs font-bold text-gray-700 uppercase">
                      Turnos Cerrados
                    </th>
                    <th className="py-3 px-4 text-xs font-bold text-gray-700 uppercase">
                      Total Ventas
                    </th>
                    <th className="py-3 px-4 text-xs font-bold text-gray-700 uppercase">
                      Servicios
                    </th>
                    <th className="py-3 px-4 text-xs font-bold text-gray-700 uppercase">
                      Promedio Venta
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {employeesSummary.length > 0 ? (
                    employeesSummary
                      .sort((a, b) => b.totalVentas - a.totalVentas)
                      .map((emp, index) => {
                        const medal = getMedal(index, employeesSummary.length);
                        const promedio =
                          emp.totalTurnos > 0
                            ? emp.totalVentas / emp.totalTurnos
                            : 0;

                        return (
                          <tr
                            key={emp.userId}
                            className="border-b border-gray-200 hover:bg-gray-50"
                          >
                            <td className="py-3 px-4 text-center">
                              {medal && (
                                <span className="text-2xl" title={medal.tipo}>
                                  {medal.label}
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-sm font-semibold text-gray-700">
                              {emp.userName}
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-600">
                              {emp.totalTurnos}
                            </td>
                            <td className="py-3 px-4 text-sm font-bold text-green-600">
                              {formatCurrency(emp.totalVentas)}
                            </td>
                            <td className="py-3 px-4 text-sm font-semibold text-blue-600">
                              {emp.totalServicios}
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-600">
                              {formatCurrency(promedio)}
                            </td>
                          </tr>
                        );
                      })
                  ) : (
                    <tr>
                      <td
                        colSpan="6"
                        className="py-6 text-center text-gray-500 text-sm"
                      >
                        No hay datos de empleados
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ============ TAB: MÉDICOS ============ */}
      {activeTab === "medicos" && (
        <>
          {/* GRÁFICA DE TORTA */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                📊 Distribución de Servicios por Médico
              </h3>
              {medicosPieData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={medicosPieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.name}: ${entry.value}`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {medicosPieData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-64 flex items-center justify-center text-gray-500">
                  Sin datos de médicos
                </div>
              )}
            </div>

            {/* TARJETA RESUMEN MÉDICOS */}
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-gray-800">
                📋 Ranking de Médicos
              </h3>
              {medicosSummary.length > 0 ? (
                medicosSummary.map((medico, index) => (
                  <div
                    key={medico.medicoId}
                    className="bg-white p-4 rounded-lg shadow-sm border border-gray-200"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-bold text-gray-800">
                          {index + 1}. {medico.nombreMedico}
                        </p>
                        <p className="text-xs text-gray-500">
                          {medico.totalServicios} servicios
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-green-600">
                          {formatCurrency(medico.totalIngresos)}
                        </p>
                        <p className="text-xs text-gray-500">ingresos</p>
                      </div>
                    </div>
                    {/* Barra de progreso */}
                    <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 transition-all"
                        style={{
                          width: `${
                            (medico.totalServicios /
                              (medicosSummary[0]?.totalServicios || 1)) *
                            100
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-gray-500 text-sm">
                  <AlertCircle size={16} className="inline mr-2" />
                  Sin datos de médicos registrados
                </div>
              )}
            </div>
          </div>

          {/* TABLA DETALLADA DE MÉDICOS */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr className="border-b border-gray-200">
                    <th className="py-3 px-4 text-xs font-bold text-gray-700 uppercase">
                      Posición
                    </th>
                    <th className="py-3 px-4 text-xs font-bold text-gray-700 uppercase">
                      Médico
                    </th>
                    <th className="py-3 px-4 text-xs font-bold text-gray-700 uppercase">
                      Citas Realizadas
                    </th>
                    <th className="py-3 px-4 text-xs font-bold text-gray-700 uppercase">
                      Ingresos Generados
                    </th>
                    <th className="py-3 px-4 text-xs font-bold text-gray-700 uppercase">
                      Ingreso Promedio
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {medicosSummary.length > 0 ? (
                    medicosSummary.map((medico, index) => (
                      <tr
                        key={medico.medicoId}
                        className="border-b border-gray-200 hover:bg-gray-50"
                      >
                        <td className="py-3 px-4 text-center font-bold text-gray-700">
                          {index + 1}
                        </td>
                        <td className="py-3 px-4 text-sm font-semibold text-gray-700">
                          {medico.nombreMedico}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {medico.totalServicios}
                        </td>
                        <td className="py-3 px-4 text-sm font-bold text-green-600">
                          {formatCurrency(medico.totalIngresos)}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {formatCurrency(
                            medico.totalIngresos / medico.totalServicios,
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="5"
                        className="py-6 text-center text-gray-500 text-sm"
                      >
                        No hay datos de médicos
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SalesPerformanceReportsPage;
