/**
 * Submits transaction to Bank Muscat SmartPay via browser form POST.
 * Official kits post: encRequest + access_code to
 * .../transaction.do?command=initiateTransaction
 */
export function redirectToBankMuscat({ paymentUrl, encRequest, accessCode }) {
  if (!paymentUrl || !encRequest || !accessCode) {
    throw new Error('Payment initialization parameters are missing');
  }

  const enc = String(encRequest).trim();
  const code = String(accessCode).trim();
  if (!enc || !code) {
    throw new Error('Payment initialization parameters are empty');
  }

  // Ensure Bank Muscat receives Origin/Referer for URL whitelist.
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
  form.acceptCharset = 'UTF-8';
  form.enctype = 'application/x-www-form-urlencoded';
  form.setAttribute('referrerpolicy', 'origin');

  const encInput = document.createElement('input');
  encInput.type = 'hidden';
  encInput.id = 'encRequest';
  encInput.name = 'encRequest';
  encInput.value = enc;
  form.appendChild(encInput);

  const accessInput = document.createElement('input');
  accessInput.type = 'hidden';
  accessInput.id = 'access_code';
  accessInput.name = 'access_code';
  accessInput.value = code;
  form.appendChild(accessInput);

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
