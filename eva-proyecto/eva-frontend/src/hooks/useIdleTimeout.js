import { useState, useEffect, useCallback, useRef } from "react";

/**
 * Hook that tracks user inactivity and fires callbacks for warning and logout.
 *
 * @param {object} options
 * @param {number} options.idleMinutes    - Minutes of inactivity before auto-logout (default 30)
 * @param {number} options.warningMinutes - Minutes before logout to show warning (default 2)
 * @param {function} options.onIdle       - Called when idle time is reached (logout)
 * @param {boolean} options.enabled       - Whether the hook is active
 */
export function useIdleTimeout({
  idleMinutes = 30,
  warningMinutes = 2,
  onIdle,
  enabled = true,
} = {}) {
  const idleMs = idleMinutes * 60 * 1000;
  const warningMs = warningMinutes * 60 * 1000;

  const [showWarning, setShowWarning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(warningMinutes * 60);

  const logoutTimer = useRef(null);
  const warningTimer = useRef(null);
  const countdownInterval = useRef(null);

  const clearTimers = useCallback(() => {
    clearTimeout(logoutTimer.current);
    clearTimeout(warningTimer.current);
    clearInterval(countdownInterval.current);
  }, []);

  const startTimers = useCallback(() => {
    clearTimers();

    // Show warning before logout
    warningTimer.current = setTimeout(() => {
      setShowWarning(true);
      setSecondsLeft(warningMinutes * 60);

      countdownInterval.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            clearInterval(countdownInterval.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }, idleMs - warningMs);

    // Auto logout
    logoutTimer.current = setTimeout(() => {
      clearTimers();
      setShowWarning(false);
      onIdle?.();
    }, idleMs);
  }, [idleMs, warningMs, warningMinutes, onIdle, clearTimers]);

  // Reset timers on any user activity
  const resetTimers = useCallback(() => {
    if (!enabled) return;
    setShowWarning(false);
    clearInterval(countdownInterval.current);
    startTimers();
  }, [enabled, startTimers]);

  // Extend session (user clicked "Stay logged in")
  const stayLoggedIn = useCallback(() => {
    resetTimers();
  }, [resetTimers]);

  useEffect(() => {
    if (!enabled) return;

    const events = [
      "mousemove",
      "mousedown",
      "keydown",
      "touchstart",
      "scroll",
      "click",
    ];

    events.forEach((e) => window.addEventListener(e, resetTimers, { passive: true }));
    startTimers();

    return () => {
      events.forEach((e) => window.removeEventListener(e, resetTimers));
      clearTimers();
    };
  }, [enabled, startTimers, resetTimers, clearTimers]);

  return { showWarning, secondsLeft, stayLoggedIn };
}
