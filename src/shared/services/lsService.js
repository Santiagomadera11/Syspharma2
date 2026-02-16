// Small helper functions to manage Local Storage keys used across the app
export const LS = {
  PRODUCTS: 'syspharma_products',
  USERS: 'syspharma_users',
  USER: 'syspharma_user',
  FAVORITES: 'syspharma_favorites',
  CART: 'syspharma_cart',
  NOTIFICATIONS: 'syspharma_notifications',
  PEDIDOS: 'syspharma_pedidos'
};

export const read = (key) => {
  try {
    return JSON.parse(localStorage.getItem(key) || 'null');
  } catch (e) {
    return null;
  }
};

export const write = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    // emit an event so other components can react
    // Dispatch both a CustomEvent (with detail) and a plain Event for broader compatibility
    try {
      window.dispatchEvent(new CustomEvent(`${key}_updated`, { detail: { key } }));
    } catch (e) {
      // ignore if CustomEvent not supported
    }
    try {
      window.dispatchEvent(new Event(`${key}_updated`));
    } catch (e) {
      // ignore
    }
    try {
      // also dispatch a generic 'storage' event to notify listeners that rely on that
      window.dispatchEvent(new Event('storage'));
    } catch (e) {
      // ignore
    }
    return true;
  } catch (e) {
    return false;
  }
};

export const pushNotification = (note) => {
  const arr = read(LS.NOTIFICATIONS) || [];
  arr.unshift(note);
  // keep only latest 100 for storage
  write(LS.NOTIFICATIONS, arr.slice(0, 100));
  // emit specific event
  window.dispatchEvent(new CustomEvent('syspharma_notifications_updated', { detail: {} }));
};
