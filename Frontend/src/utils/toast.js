export const showToast = (message, type = 'success') => {
  // For now, use window alert as a bridge or console log
  // This prevents module resolution errors and provides basic feedback
  console.log(`[TOAST] ${type.toUpperCase()}: ${message}`);
  
  // Potential integration with a global listener in the future
  const event = new CustomEvent('app-toast', { detail: { message, type } });
  window.dispatchEvent(event);
};
