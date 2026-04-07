import React, { useEffect, useState, useRef } from 'react';
import { Bell, Menu, Stethoscope, Eye } from 'lucide-react';
import { appointmentService } from '../../features/services/appointments/services/appointmentService';
import { useNavigate } from 'react-router-dom';

// Recibimos la función onMenuClick
export const Header = ({ onMenuClick }) => {
  const [user, setUser] = useState({ nombre: 'Usuario', rol: 'Invitado' });
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const mounted = useRef(false);

  const getAppointmentsRoute = (role) => {
    if (!role) return '/citas';
    const r = role.toLowerCase();
    if (r.includes('administrador')) return '/admin/citas';
    if (r.includes('emple')) return '/employee/citas';
    if (r.includes('cliente')) return '/client/mis-citas';
    return '/citas';
  };

  useEffect(() => {
    const storedUser = sessionStorage.getItem('syspharma_user');
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  // Load notifications: appointments created after `lastSeenAppointmentsAt`
  useEffect(() => {
    const loadNotifications = async () => {
      const lastSeen = localStorage.getItem('lastSeenAppointmentsAt');
      const all = await appointmentService.getAppointments();
      const newOnes = all.filter((a) => {
        if (!a.fechaCreacion) return false; // ignore old seed data
        if (!lastSeen) return true;
        try {
          return new Date(a.fechaCreacion) > new Date(lastSeen);
        } catch (e) {
          return true;
        }
      });
      setNotifications(newOnes.sort((a,b)=> new Date(b.fechaCreacion) - new Date(a.fechaCreacion)));
    };

    // initial load
    loadNotifications();

    const onChange = () => loadNotifications();
    window.addEventListener('appointments:changed', onChange);
    return () => window.removeEventListener('appointments:changed', onChange);
  }, []);

  return (
    <header className="h-14 bg-primary-600 border-b border-primary-700 flex items-center justify-between px-3 sm:px-5 shadow-md z-20 text-white flex-shrink-0">
      
      {/* IZQUIERDA: Botón Menú y Logo */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        
        {/* BOTÓN MENÚ: Solo visible en móvil (lg:hidden) */}
        <button 
          onClick={onMenuClick} 
          className="lg:hidden text-white/80 hover:text-white p-1 rounded-md hover:bg-white/10 transition flex-shrink-0"
          aria-label="Toggle menu"
        >
          <Menu size={24} />
        </button>
        
        {/* LOGO SYSPHARMA */}
        <div className="flex items-center gap-2 min-w-0">
          <div className="bg-white/20 p-1 sm:p-1.5 rounded-lg backdrop-blur-sm flex-shrink-0">
            <Stethoscope size={18} className="text-white" />
          </div>
          <div className="hidden xs:block min-w-0">
            <h1 className="text-base sm:text-lg font-bold tracking-wide leading-none truncate">SysPharma</h1>
            <p className="text-[8px] sm:text-[9px] text-primary-100 uppercase tracking-wider font-medium opacity-80">
              Panel
            </p>
          </div>
        </div>
      </div>

      {/* DERECHA */}
      <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
        <div className="relative">
          <button
            onClick={() => {
              const opening = !open;
              // If opening the dropdown, show native notifications now
              if (opening && notifications.length > 0 && "Notification" in window) {
                Notification.requestPermission().then((perm) => {
                  if (perm === 'granted') {
                    notifications.forEach((n) => {
                      const title = `Nueva cita: ${n.paciente}`;
                      const body = `${n.servicio} - ${n.fecha} ${n.hora || ''}`;
                      try { new Notification(title, { body }); } catch (e) {}
                    });
                  }
                });
              }
              // toggle dropdown
              setOpen((v) => !v);
            }}
            className="relative text-primary-100 hover:text-white transition-colors p-1 rounded-md hover:bg-white/10"
            aria-label="Notificaciones"
          >
            <Bell size={20} />
            {notifications.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-4 px-1 rounded-full bg-red-500 text-white text-[11px] font-bold flex items-center justify-center border border-primary-600">{notifications.length}</span>
            )}
          </button>

          {/* Dropdown */}
          {open && (
            <div className="absolute right-0 mt-2 w-80 bg-white text-gray-800 rounded-lg shadow-lg border border-gray-100 z-50">
              <div className="p-2 border-b flex items-center justify-between">
                <strong className="text-sm">Notificaciones</strong>
                <button
                  onClick={() => { setOpen(false); }}
                  className="text-xs text-gray-500 hover:text-gray-700 px-2"
                >Cerrar</button>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-3 text-sm text-gray-500">No hay notificaciones</div>
                ) : (
                  notifications.map((n) => (
                    <div key={n.id} className="p-3 hover:bg-gray-50 border-b last:border-b-0 flex items-start gap-2">
                      <div className="flex-1">
                        <div className="text-sm font-bold text-gray-800 truncate">{n.paciente}</div>
                        <div className="text-xs text-gray-500">{n.servicio} • {n.fecha} {n.hora}</div>
                        <div className="text-[11px] text-gray-400 mt-1">Estado: {n.estado}</div>
                      </div>
                      <div className="flex flex-col items-center gap-1">
                        <button onClick={() => { setOpen(false); navigate(getAppointmentsRoute(user.rol)); }} className="p-1 text-blue-600 hover:bg-blue-50 rounded" title="Ver"> <Eye size={14} /> </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
        
        <div className="h-6 w-[1px] bg-primary-500 hidden sm:block"></div>

        <div className="flex items-center gap-2 sm:gap-3 cursor-pointer group">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-white leading-none group-hover:opacity-90 truncate">{user.nombre}</p>
            <p className="text-[10px] text-primary-100 font-medium uppercase mt-0.5">{user.rol}</p>
          </div>
          <div className="w-7 h-7 sm:w-8 sm:h-8 bg-white text-primary-600 rounded-full flex items-center justify-center font-bold border-2 border-primary-200 shadow-sm text-xs flex-shrink-0">
            {user.nombre.charAt(0)}
          </div>
        </div>
      </div>
    </header>
  );
};