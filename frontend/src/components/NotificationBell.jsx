import { useEffect, useRef, useState } from 'react';
import { getNotifications, markAllNotificationsRead, markNotificationRead } from '../api/notifications';

const POLL_INTERVAL_MS = 30000;

function timeAgo(dateString) {
  const diffMs = Date.now() - new Date(dateString.replace(' ', 'T')).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return 'ahora';
  if (minutes < 60) return `hace ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `hace ${hours} h`;
  const days = Math.floor(hours / 24);
  return `hace ${days} d`;
}

function BellIcon({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  );
}

function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  async function load() {
    try {
      const { notificaciones, noLeidas } = await getNotifications();
      setNotifications(notificaciones);
      setUnreadCount(noLeidas);
    } catch {
      // silencioso: la campana no debe interrumpir el resto de la app
    }
  }

  useEffect(() => {
    load();
    const interval = setInterval(load, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  async function handleToggle() {
    const next = !open;
    setOpen(next);
    if (next && unreadCount > 0) {
      try {
        await markAllNotificationsRead();
        setUnreadCount(0);
        setNotifications((prev) => prev.map((n) => ({ ...n, leida: 1 })));
      } catch {
        // si falla, se reintenta en el próximo poll
      }
    }
  }

  async function handleItemClick(notification) {
    if (!notification.leida) {
      try {
        await markNotificationRead(notification.id);
        setNotifications((prev) =>
          prev.map((n) => (n.id === notification.id ? { ...n, leida: 1 } : n))
        );
      } catch {
        // no crítico
      }
    }
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={handleToggle}
        aria-label="Notificaciones"
        className="relative flex h-9 w-9 items-center justify-center rounded-full border border-neutral-700/50 text-neutral-400 transition hover:border-gold-600/40 hover:text-gold-400"
      >
        <BellIcon className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-80 max-w-[90vw] rounded-xl border border-neutral-800 bg-neutral-900 shadow-xl shadow-black/40">
          <div className="border-b border-neutral-800 px-4 py-3">
            <p className="text-sm font-semibold text-neutral-100">Notificaciones</p>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-neutral-500">
                No tenés notificaciones.
              </p>
            ) : (
              notifications.map((notification) => (
                <button
                  key={notification.id}
                  type="button"
                  onClick={() => handleItemClick(notification)}
                  className={`block w-full border-b border-neutral-800/60 px-4 py-3 text-left text-sm transition last:border-b-0 hover:bg-white/5 ${
                    notification.leida ? 'text-neutral-400' : 'text-neutral-100'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {!notification.leida && (
                      <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-gold-400" />
                    )}
                    <div className="min-w-0">
                      <p className="leading-snug">{notification.mensaje}</p>
                      <p className="mt-1 text-xs text-neutral-500">
                        {timeAgo(notification.created_at)}
                      </p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationBell;
