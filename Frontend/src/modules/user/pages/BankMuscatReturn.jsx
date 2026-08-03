import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle2, XCircle, Clock3, Loader2, ArrowLeft } from 'lucide-react';
import { getAuthToken } from '../../../services/apiClient';
import { getBankMuscatPaymentStatus } from '../../../services/bankMuscatApi';
import { registerForEvent } from '../../../services/eventsApi';
import { useTheme } from '../context/ThemeContext';

/**
 * Bank Muscat return page.
 * Never trusts query-string success alone — always re-fetches backend-verified status.
 */
const BankMuscatReturn = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const paymentId = params.get('paymentId');
  const hintStatus = params.get('status');

  const [uiState, setUiState] = useState('VERIFYING');
  const [payment, setPayment] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    let attempts = 0;

    async function verify() {
      if (!getAuthToken()) {
        navigate('/login', {
          replace: true,
          state: { from: `/payment/bank-muscat/return?${params.toString()}` },
        });
        return;
      }

      if (!paymentId) {
        setUiState(hintStatus === 'pending' ? 'PENDING' : 'FAILED');
        setError(params.get('reason') || 'Missing payment reference');
        return;
      }

      setUiState('VERIFYING');
      try {
        const res = await getBankMuscatPaymentStatus(paymentId);
        if (cancelled) return;
        const p = res.payment;
        setPayment(p);

        if (p.status === 'succeeded') {
          setUiState('SUCCESS');

          const type =
            p.purpose === 'top_up'
              ? 'wallet_top_up'
              : p.purpose === 'enrollment'
                ? 'coaching'
                : p.meta?.eventId
                  ? 'event'
                  : p.purpose === 'booking'
                    ? 'booking'
                    : p.purpose;

          const { consumeBankMuscatCheckoutContext } = await import('../../../services/bankMuscatCheckoutContext');
          const saved = consumeBankMuscatCheckoutContext() || {};

          setTimeout(() => {
            navigate('/booking-success', {
              replace: true,
              state: {
                ...saved,
                type: saved.type || type,
                amount: p.amount ?? saved.amount,
                payment: p,
                fromBankMuscat: true,
                // Ensure wallet top-up always has a displayable stamp
                transactionAt: p.completedAt || p.verifiedAt || p.updatedAt || new Date().toISOString(),
              },
            });
          }, 900);
          return;
        }

        if (p.status === 'pending' || p.status === 'initiated' || p.status === 'created') {
          setUiState('PENDING');
          // Second-leg: ask SmartPay Status API once after a couple of local polls
          if (attempts === 2) {
            try {
              const { inquireBankMuscatPayment } = await import('../../../services/bankMuscatApi');
              const inquired = await inquireBankMuscatPayment(paymentId);
              if (cancelled) return;
              if (inquired?.payment?.status === 'succeeded') {
                setPayment(inquired.payment);
                setUiState('SUCCESS');
                // fall through by reusing success path via reload of status
                attempts = 99;
                const type =
                  inquired.payment.purpose === 'top_up'
                    ? 'wallet_top_up'
                    : inquired.payment.purpose === 'enrollment'
                      ? 'coaching'
                      : inquired.payment.purpose;
                const { consumeBankMuscatCheckoutContext } = await import('../../../services/bankMuscatCheckoutContext');
                const saved = consumeBankMuscatCheckoutContext() || {};
                setTimeout(() => {
                  navigate('/booking-success', {
                    replace: true,
                    state: {
                      ...saved,
                      type: saved.type || type,
                      amount: inquired.payment.amount ?? saved.amount,
                      payment: inquired.payment,
                      fromBankMuscat: true,
                      transactionAt:
                        inquired.payment.completedAt ||
                        inquired.payment.verifiedAt ||
                        new Date().toISOString(),
                    },
                  });
                }, 600);
                return;
              }
            } catch (inqErr) {
              // eslint-disable-next-line no-console
              console.warn('Status inquiry failed:', inqErr.message);
            }
          }
          if (attempts < 5) {
            attempts += 1;
            setTimeout(verify, 2000);
          }
          return;
        }

        if (p.status === 'cancelled') {
          setUiState('CANCELLED');
          return;
        }

        setUiState('FAILED');
        setError(p.failureReason || p.providerResponseMessage || 'Payment failed');
      } catch (e) {
        if (cancelled) return;
        setUiState('FAILED');
        setError(e.message || 'Could not verify payment status');
      }
    }

    verify();
    return () => {
      cancelled = true;
    };
  }, [paymentId, navigate, params, hintStatus]);

  const card = `${isDark ? 'bg-[#1a1d24] border-white/10 text-white' : 'bg-white border-slate-100 text-slate-900'} border rounded-3xl p-8 shadow-sm max-w-md w-full text-center`;

  return (
    <div className={`min-h-screen flex items-center justify-center px-6 ${isDark ? 'bg-[#0f1115]' : 'bg-slate-50'}`}>
      <div className={card}>
        {uiState === 'VERIFYING' && (
          <>
            <Loader2 className="mx-auto mb-4 animate-spin text-[#CE2029]" size={36} />
            <h1 className="text-lg font-black uppercase tracking-widest mb-2">Verifying payment</h1>
            <p className="text-sm opacity-60">Confirming status with Arena servers…</p>
          </>
        )}

        {uiState === 'SUCCESS' && (
          <>
            <CheckCircle2 className="mx-auto mb-4 text-emerald-500" size={40} />
            <h1 className="text-lg font-black uppercase tracking-widest mb-2">Payment successful</h1>
            <p className="text-sm opacity-60">Redirecting…</p>
          </>
        )}

        {uiState === 'PENDING' && (
          <>
            <Clock3 className="mx-auto mb-4 text-amber-500" size={40} />
            <h1 className="text-lg font-black uppercase tracking-widest mb-2">Payment pending</h1>
            <p className="text-sm opacity-60 mb-6">
              Bank confirmation is still processing. You can leave this page; we will update once verified.
            </p>
            <button
              type="button"
              onClick={() => navigate('/profile/wallet')}
              className="px-5 py-3 rounded-xl bg-[#CE2029] text-white text-xs font-black uppercase tracking-widest"
            >
              Go to wallet
            </button>
          </>
        )}

        {(uiState === 'FAILED' || uiState === 'CANCELLED') && (
          <>
            <XCircle className="mx-auto mb-4 text-[#CE2029]" size={40} />
            <h1 className="text-lg font-black uppercase tracking-widest mb-2">
              {uiState === 'CANCELLED' ? 'Payment cancelled' : 'Payment failed'}
            </h1>
            <p className="text-sm opacity-60 mb-6">{error || 'Please try again.'}</p>
            {payment?.amount != null && (
              <p className="text-xs font-bold opacity-40 mb-6">Amount: OMR {Number(payment.amount).toFixed(3)}</p>
            )}
            <button
              type="button"
              onClick={() => navigate(-1)}
              className={`inline-flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-black uppercase tracking-widest ${isDark ? 'bg-white/10' : 'bg-slate-900 text-white'}`}
            >
              <ArrowLeft size={14} /> Back
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default BankMuscatReturn;
