export const toast = {
  success: (message, title) => {
    try {
      window.dispatchEvent(new CustomEvent('app:toast', { detail: { message, type: 'success', title } }));
    } catch (e) {
      console.log('toast success:', message);
    }
  },
  error: (message, title) => {
    try {
      window.dispatchEvent(new CustomEvent('app:toast', { detail: { message, type: 'error', title } }));
    } catch (e) {
      console.error('toast error:', message);
    }
  },
  info: (message, title) => {
    try {
      window.dispatchEvent(new CustomEvent('app:toast', { detail: { message, type: 'info', title } }));
    } catch (e) {
      console.log('toast info:', message);
    }
  },
  // allow simple call like toast('msg')
  __call: (message) => {
    try { window.dispatchEvent(new CustomEvent('app:toast', { detail: { message, type: 'success' } })); } catch (e) {}
  }
};

// support default export for convenience
export default toast;
