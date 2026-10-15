import { checkoutBookings, cancelMyBooking } from '../services/bookingsApi';
import { createPaymentIntent } from '../services/meApi';

/**
 * Court checkout shared by the single-court Review Order page and the cart.
 *
 * A "line" is one court slot:
 *   { arenaId, arenaName, courtId, courtName, date (Date#toDateString), dateYmd, timeSlot, price, pricing }
 *
 * The server books every line in one all-or-nothing call (applying the member discount and
 * an optional coupon to the whole order); then ONE payment covers all unpaid bookings.
 */

function lineLabel(line) {
  return `${line.courtName || 'Court'} · ${line.timeSlot}`;
}

/** Undo a checkout whose payment couldn't be started (cancelling refunds any wallet part). */
async function rollback(bookings) {
  await Promise.all(
    bookings
      .filter((b) => b.status === 'pending')
      .map((b) => cancelMyBooking(b.id).catch((e) => console.warn('Rollback cancel failed', b.id, e))),
  );
}

async function createGatewayPayment(bookingIds, amount) {
  const ids = bookingIds.length > 1 ? { bookingIds } : { bookingId: bookingIds[0] };
  const { createBankMuscatPayment } = await import('../services/bankMuscatApi');
  try {
    return await createBankMuscatPayment({ purpose: 'booking', ...ids });
  } catch (err) {
    // 503 → Bank Muscat not configured on this server; fall back to the legacy/mock intent.
    if (err.status !== 503) throw err;
    return createPaymentIntent({ purpose: 'booking', amount, ...ids });
  }
}

/**
 * @param {object} opts
 * @param {Array} opts.lines
 * @param {boolean} opts.useWallet
 * @param {string} [opts.couponCode]
 * @param {object} [opts.extraState] merged into the success / gateway-return state
 * @returns {Promise<{ redirected: true } | { redirected: false, successState: object }>}
 */
export async function checkoutCourtLines({ lines, useWallet, couponCode, extraState = {} }) {
  if (!lines?.length) throw new Error('No slots selected');
  for (const line of lines) {
    if (!line.arenaId || !line.courtId || !line.dateYmd || !line.timeSlot) {
      throw new Error(`Missing details for ${lineLabel(line)}`);
    }
  }

  let result;
  try {
    result = await checkoutBookings({
      lines: lines.map((l) => ({
        arenaId: String(l.arenaId),
        courtId: String(l.courtId),
        date: l.dateYmd,
        timeSlot: l.timeSlot,
      })),
      couponCode,
      useWallet,
    });
  } catch (err) {
    const idx = err.body?.lineIndex;
    const failedLine = Number.isInteger(idx) ? lines[idx] : null;
    const e = new Error(
      failedLine
        ? `${lineLabel(failedLine)} on ${failedLine.date}: ${err.message || 'could not be booked'}`
        : err.message || 'Checkout failed',
    );
    e.status = err.status;
    e.failedLine = failedLine;
    e.couponError = !failedLine && /coupon/i.test(err.message || '');
    throw e;
  }

  const created = result.bookings || [];
  const summary = result.summary || {};
  const byKey = new Map(created.map((b) => [`${b.courtId}|${b.date}|${b.timeSlot}`, b]));

  const successLines = lines.map((line) => {
    const b = byKey.get(`${String(line.courtId)}|${line.dateYmd}|${line.timeSlot}`);
    return {
      ...line,
      bookingId: b?.id,
      amount: Number(b?.amount) || 0,
      pricingType: b?.pricingType || line.pricing?.type,
    };
  });
  const first = lines[0];
  const successState = {
    ...extraState,
    type: 'booking',
    arena: extraState.arena || { id: first.arenaId, name: first.arenaName, location: first.arenaLocation, image: first.arenaImage },
    court: extraState.court || { id: first.courtId, name: first.courtName, type: first.courtType },
    date: first.date,
    slot: { time: first.timeSlot, price: first.price, pricing: first.pricing },
    slots: lines.map((l) => ({ time: l.timeSlot, price: l.price, pricing: l.pricing })),
    lines: successLines,
    amount: Number(summary.total) || 0,
    couponCode: summary.couponCode || null,
    couponDiscount: Number(summary.couponDiscount) || 0,
    booking: created[0],
    bookings: created,
  };

  const due = Number(summary.due) || 0;
  if (due > 0) {
    const pendingIds = created.filter((b) => b.paymentStatus !== 'paid').map((b) => b.id);
    let intent;
    try {
      intent = await createGatewayPayment(pendingIds, due);
    } catch (err) {
      await rollback(created);
      throw err;
    }

    const { isBankMuscatRedirectProvider } = await import('../services/bankMuscatApi');
    if (isBankMuscatRedirectProvider(intent?.provider)) {
      const { saveBankMuscatCheckoutContext } = await import('../services/bankMuscatCheckoutContext');
      const { redirectToBankMuscat } = await import('../services/ccavenueRedirect');
      saveBankMuscatCheckoutContext(successState);
      redirectToBankMuscat({
        paymentUrl: intent.paymentUrl,
        encRequest: intent.encRequest,
        accessCode: intent.accessCode,
      });
      return { redirected: true };
    }
    if (intent?.provider === 'mock') {
      const { getMockPaymentWebhookSecret } = await import('../services/config');
      const mockSecret = getMockPaymentWebhookSecret();
      if (mockSecret) {
        const { confirmMockPayment } = await import('../services/meApi');
        await confirmMockPayment(intent.payment.id, mockSecret);
      }
    }
  }

  return { redirected: false, successState };
}
