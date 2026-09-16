import { useCallback, useEffect, useRef } from 'react';

/**
 * Keeps one of the OTP boxes focused for as long as the OTP step is on screen.
 *
 * On iOS standalone (PWA) the software keyboard shrinks the visual viewport
 * without resizing the layout viewport. Two things used to disturb that while a
 * code was being typed:
 *
 *  - every `.focus()` on the next box let iOS scroll the card back into view,
 *    so the screen visibly dropped on each digit; `preventScroll` stops that.
 *  - nothing caught a blur that landed on nothing, and the moment focus falls
 *    off the page the keyboard closes and the viewport snaps back to full
 *    height — the same drop, but permanent.
 *
 * `handleBlur` therefore takes focus straight back, in the same task as the
 * blur, but only when focus was heading nowhere. Tapping Verify, Resend, Back
 * or another box moves focus to that element instead and is left alone.
 *
 * @param {string} idPrefix  id prefix shared by the boxes, e.g. 'login-otp'
 *                           for inputs with ids `login-otp-0` … `login-otp-5`
 * @param {number} length    how many boxes there are
 * @param {boolean} active   whether the OTP step is currently shown
 */
export function useOtpFocus(idPrefix, length, active = true) {
  // Read by the blur handler, which must see the current value without being
  // rebuilt (and re-bound) on every render.
  const activeRef = useRef(active);
  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  const getBox = useCallback(
    (index) => document.getElementById(`${idPrefix}-${index}`),
    [idPrefix]
  );

  // Where focus belongs when we have to put it back: the box still waiting for
  // a digit, or the last one once the code is complete.
  const boxToRecover = useCallback(() => {
    for (let i = 0; i < length; i += 1) {
      const box = getBox(i);
      if (box && !box.value) return box;
    }
    return getBox(length - 1);
  }, [getBox, length]);

  const focusBox = useCallback(
    (index) => {
      const box = getBox(Math.max(0, Math.min(length - 1, index)));
      if (box) box.focus({ preventScroll: true });
    },
    [getBox, length]
  );

  // Focus the first box as soon as the step appears, so the keyboard is already
  // up and the viewport already settled before the first digit is typed.
  useEffect(() => {
    if (!active) return undefined;
    const frame = requestAnimationFrame(() => {
      const box = boxToRecover();
      if (box) box.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(frame);
  }, [active, boxToRecover]);

  const handleBlur = useCallback(
    (e) => {
      if (!activeRef.current) return;
      // A real relatedTarget means the user is moving to a control they meant
      // to press. Null means focus is leaving the page entirely.
      if (e.relatedTarget) return;
      const box = boxToRecover() || e.target;
      if (box) box.focus({ preventScroll: true });
    },
    [boxToRecover]
  );

  return { focusBox, handleBlur };
}
