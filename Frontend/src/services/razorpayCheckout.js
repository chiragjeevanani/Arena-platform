/**
 * Dynamically loads the official Razorpay Checkout script.
 * Safe to call multiple times — only injects the tag once.
 * @returns {Promise<void>}
 */
export function loadRazorpayScript() {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) {
      resolve();
      return;
    }
    const existing = document.getElementById('razorpay-checkout-js');
    if (existing) {
      existing.addEventListener('load', resolve);
      existing.addEventListener('error', () => reject(new Error('Failed to load Razorpay script')));
      return;
    }
    const script = document.createElement('script');
    script.id = 'razorpay-checkout-js';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = resolve;
    script.onerror = () => reject(new Error('Failed to load Razorpay checkout script'));
    document.head.appendChild(script);
  });
}

/**
 * Opens the Razorpay Checkout modal.
 *
 * @param {object} opts
 * @param {string} opts.keyId          - Razorpay key_id
 * @param {string} opts.orderId        - Razorpay order_id from backend
 * @param {number} opts.amount         - amount in smallest unit (paise)
 * @param {string} opts.currency       - e.g. 'INR'
 * @param {string} [opts.name]         - merchant/app name shown in modal
 * @param {string} [opts.description]  - payment description
 * @param {string} [opts.email]        - pre-fill user email
 * @param {string} [opts.phone]        - pre-fill user phone
 * @param {Function} opts.onSuccess    - called with { razorpay_payment_id, razorpay_order_id, razorpay_signature }
 * @param {Function} opts.onDismiss    - called when user closes modal without paying
 */
export function openRazorpayCheckout({ keyId, orderId, amount, currency, name, description, email, phone, onSuccess, onDismiss }) {
  if (!window.Razorpay) {
    throw new Error('Razorpay script is not loaded. Call loadRazorpayScript() first.');
  }

  const options = {
    key: keyId,
    amount,
    currency,
    name: name || 'Arena Platform',
    description: description || 'Arena Payment',
    order_id: orderId,
    prefill: {
      email: email || '',
      contact: phone || '',
    },
    theme: {
      color: '#CE2029',
    },
    modal: {
      ondismiss: () => {
        if (typeof onDismiss === 'function') onDismiss();
      },
    },
    handler: (response) => {
      if (typeof onSuccess === 'function') {
        onSuccess({
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_order_id: response.razorpay_order_id,
          razorpay_signature: response.razorpay_signature,
        });
      }
    },
  };

  const rzp = new window.Razorpay(options);
  rzp.open();
}
