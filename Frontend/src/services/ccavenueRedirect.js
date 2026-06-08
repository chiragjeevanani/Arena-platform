/**
 * Submits transaction to CCAvenue / Bank Muscat payment gateway by
 * dynamically generating and submitting a POST form.
 * 
 * @param {object} params
 * @param {string} params.paymentUrl - Gateway URL (e.g. from process.env)
 * @param {string} params.encRequest - Encrypted transaction parameter string
 * @param {string} params.accessCode - CCAvenue Access Code
 */
export function redirectToCcavenue({ paymentUrl, encRequest, accessCode }) {
  if (!paymentUrl || !encRequest || !accessCode) {
    throw new Error('Payment initialization parameters are missing');
  }

  // Create form element
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = paymentUrl;

  // Add encrypted request input (supporting both snake_case and camelCase for different CCAvenue regions)
  const encInputSnake = document.createElement('input');
  encInputSnake.type = 'hidden';
  encInputSnake.name = 'enc_request';
  encInputSnake.value = encRequest;
  form.appendChild(encInputSnake);

  const encInputCamel = document.createElement('input');
  encInputCamel.type = 'hidden';
  encInputCamel.name = 'encRequest';
  encInputCamel.value = encRequest;
  form.appendChild(encInputCamel);

  // Add access code input
  const accessInput = document.createElement('input');
  accessInput.type = 'hidden';
  accessInput.name = 'access_code';
  accessInput.value = accessCode;
  form.appendChild(accessInput);

  // Add command input (required by CCAvenue transaction gateway)
  const commandInput = document.createElement('input');
  commandInput.type = 'hidden';
  commandInput.name = 'command';
  commandInput.value = 'initiateTransaction';
  form.appendChild(commandInput);

  // Append form, submit it, and clean up
  document.body.appendChild(form);
  form.submit();
  document.body.removeChild(form);
}
