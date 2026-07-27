/**
 * Submits transaction to Bank Muscat SmartPay via browser form POST.
 * Matches official Python kit form fields: encRequest + access_code.
 * command=initiateTransaction is included in the gateway URL (kit default).
 *
 * @param {object} params
 * @param {string} params.paymentUrl
 * @param {string} params.encRequest
 * @param {string} params.accessCode
 */
export function redirectToBankMuscat({ paymentUrl, encRequest, accessCode }) {
  if (!paymentUrl || !encRequest || !accessCode) {
    throw new Error('Payment initialization parameters are missing');
  }

  // Ensure Bank Muscat receives Origin/Referer for URL whitelist (Error 10002).
  try {
    const meta = document.createElement('meta');
    meta.name = 'referrer';
    meta.content = 'origin';
    document.head.appendChild(meta);
  } catch {
    /* ignore */
  }

  const form = document.createElement('form');
  form.method = 'POST';
  form.action = paymentUrl;
  form.name = 'redirect';
  form.id = 'nonseamless';
  form.setAttribute('referrerpolicy', 'origin');

  const encInput = document.createElement('input');
  encInput.type = 'hidden';
  encInput.id = 'encRequest';
  encInput.name = 'encRequest';
  encInput.value = encRequest;
  form.appendChild(encInput);

  const accessInput = document.createElement('input');
  accessInput.type = 'hidden';
  accessInput.id = 'access_code';
  accessInput.name = 'access_code';
  accessInput.value = accessCode;
  form.appendChild(accessInput);

  // If URL does not already include command, add it as a hidden field (compat).
  if (!/[?&]command=/.test(paymentUrl)) {
    const commandInput = document.createElement('input');
    commandInput.type = 'hidden';
    commandInput.name = 'command';
    commandInput.value = 'initiateTransaction';
    form.appendChild(commandInput);
  }

  document.body.appendChild(form);
  form.submit();
}

/** @deprecated Use redirectToBankMuscat */
export function redirectToCcavenue(opts) {
  return redirectToBankMuscat(opts);
}
