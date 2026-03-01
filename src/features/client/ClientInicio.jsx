import React, { useEffect, useState } from "react";
import { ShoppingBag, Calendar, Heart, Clock, MapPin } from "lucide-react";
import { LS, read } from "../../shared/services/lsService";
import { ordersService } from "../sales/orders/services/ordersService";
import { appointmentService } from "../services/appointments/services/appointmentService";
import ProductCardGrid from "./components/ProductCard";

const ClientInicio = () => {
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [orders, setOrders] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    const currentUser = JSON.parse(
      localStorage.getItem("syspharma_user") || "{}",
    );
    setUser(currentUser);

    const prods = JSON.parse(
      localStorage.getItem("syspharma_products") || "[]",
    );
    setProducts(Array.isArray(prods) ? prods : []);

    const fav = read(LS.FAVORITES) || [];
    setFavorites(Array.isArray(fav) ? fav : []);

    if (currentUser?.email) {
      const allOrders = ordersService.getAll() || [];
      setOrders(
        allOrders
          .filter(
            (o) =>
              o.correo === currentUser.email || o.email === currentUser.email,
          )
          .sort((a, b) => new Date(b.fecha) - new Date(a.fecha)),
      );

      const allAppts = appointmentService.getAppointments() || [];
      setAppointments(
        allAppts
          .filter(
            (a) => a.userId === currentUser.id || a.email === currentUser.email,
          )
          .sort((a, b) => new Date(a.fecha) - new Date(b.fecha)),
      );
      setDoctors(appointmentService.getDoctors() || []);
    }
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    return hour < 12
      ? "¡Buenos días"
      : hour < 18
        ? "¡Buenas tardes"
        : "¡Buenas noches";
  };

  const activeOrders = orders.filter(
    (o) => !["entregado", "pagado"].includes(o.estado?.toLowerCase()),
  ).length;
  const upcomingAppts = appointments.filter(
    (a) => new Date(a.fecha) >= new Date(),
  ).length;
  const nextAppt = appointments.find((a) => new Date(a.fecha) >= new Date());
  const nextDoctor = nextAppt
    ? doctors.find((d) => d.id === nextAppt.doctorId)
    : null;
  const lastOrder = orders[0];
  const favoriteProducts = products
    .filter((p) => favorites.includes(p.id))
    .slice(0, 4);

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Hero */}
      <div className="bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 pt-12 pb-8 px-8 text-white">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold">
            {getGreeting()}, {user?.nombre}!
          </h1>
          <p className="text-emerald-100 mt-2">
            Aquí está tu resumen de actividad
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-8 space-y-8 mt-8">
        {/* Métricas */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 text-center">
            <ShoppingBag size={20} className="mx-auto text-emerald-600 mb-2" />
            <div className="text-2xl font-bold">{activeOrders}</div>
            <div className="text-xs text-gray-600">Pedidos activos</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 text-center">
            <Calendar size={20} className="mx-auto text-emerald-600 mb-2" />
            <div className="text-2xl font-bold">{upcomingAppts}</div>
            <div className="text-xs text-gray-600">Citas próximas</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 text-center">
            <Heart size={20} className="mx-auto text-emerald-600 mb-2" />
            <div className="text-2xl font-bold">{favorites.length}</div>
            <div className="text-xs text-gray-600">Favoritos</div>
          </div>
        </div>

        {/* Próxima Cita */}
        {nextAppt && (
          <div className="bg-gradient-to-r from-emerald-100 to-teal-100 border-2 border-emerald-200 rounded-lg p-6">
            <p className="text-sm font-semibold text-emerald-700 mb-2">
              PRÓXIMA CITA
            </p>
            <h3 className="text-xl font-bold text-gray-900">
              {nextDoctor?.nombre || "Profesional"}
            </h3>
            <div className="mt-4 space-y-2 text-gray-700">
              <div className="flex items-center gap-2">
                <Calendar size={18} className="text-emerald-600" />
                <span>{nextAppt.fecha}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={18} className="text-emerald-600" />
                <span>{nextAppt.hora}</span>
              </div>
            </div>
          </div>
        )}

        {/* Último Pedido */}
        {lastOrder && (
          <div className="bg-white border border-gray-100 rounded-lg p-6 shadow-sm">
            <p className="text-xs text-gray-500 font-semibold mb-3">
              ÚLTIMO PEDIDO
            </p>
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-bold text-gray-900">
                  Pedido #{lastOrder.id}
                </h4>
                <p className="text-sm text-gray-600 mt-1">{lastOrder.fecha}</p>
              </div>
              <span
                className={`text-xs font-semibold px-3 py-1 rounded-full ${
                  ["entregado", "pagado"].includes(
                    lastOrder.estado?.toLowerCase(),
                  )
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-amber-100 text-amber-700"
                }`}
              >
                {lastOrder.estado}
              </span>
            </div>
            <p className="text-lg font-bold text-emerald-600 mt-4">
              ${lastOrder.total?.toLocaleString() || 0}
            </p>
          </div>
        )}

        {/* Favoritos */}
        {favoriteProducts.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold mb-4 text-gray-900">
              Tus Favoritos
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {favoriteProducts.map((p) => (
                <div
                  key={p.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="h-40 bg-gray-200 flex items-center justify-center">
                    <img
                      src={p.imagen || "/src/assets/farmacia.avif"}
                      alt={p.nombre}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="p-3">
                    <h4 className="font-semibold text-sm text-gray-900 line-clamp-2">
                      {p.nombre}
                    </h4>
                    <p className="text-xs text-gray-600 mt-1">
                      {p.laboratorio}
                    </p>
                    <p className="text-lg font-bold text-emerald-600 mt-2">
                      ${p.precio?.toLocaleString() || 0}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default ClientInicio;
