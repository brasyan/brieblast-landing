import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import NavBar from "@/components/NavBar";
import FooterSection from "@/components/FooterSection";
import { BriehostApiError, getPaymentIntent, type PaymentIntent } from "@/lib/briehostApi";
import { PLANS, type CustomerPlanId } from "@/lib/plans";

/**
 * Landing pad after a hosted-checkout redirect (Stripe today; PayPal /
 * CoinGate later use the same return URL pattern).
 *
 * Stripe redirects here with `?status=success` or `?status=cancel`, but
 * those are advisory — the actual source of truth is the webhook, which
 * may not have landed yet by the time the user is bounced back. So we
 * poll `getPaymentIntent` for up to ~30s waiting for status to leave
 * 'pending'. If the user came back with status=cancel and the row is
 * still pending after a short poll, we show "cancelled" without making
 * them wait the full 30s.
 */
const POLL_INTERVAL_MS = 1500;
const MAX_POLL_DURATION_MS = 30_000;
const CANCEL_FAST_PATH_MS = 3_000; // shorter wait if Stripe told us they cancelled

const PaymentReturnPage = () => {
  const { intentId = "" } = useParams<{ intentId: string }>();
  const [searchParams] = useSearchParams();
  const advisoryStatus = searchParams.get("status"); // 'success' | 'cancel' | null

  const [intent, setIntent] = useState<PaymentIntent | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [timedOut, setTimedOut] = useState(false);
  const [needsAuth, setNeedsAuth] = useState(false);

  // Refs so the poll loop's setTimeout chain can read the latest values
  // without re-creating the loop on every state change.
  const stopRef = useRef(false);
  const startedAtRef = useRef<number>(Date.now());

  const tick = useCallback(async () => {
    if (stopRef.current) return;
    try {
      const result = await getPaymentIntent(intentId);
      setIntent(result);
      if (result.status !== "pending") {
        stopRef.current = true;
        return;
      }
    } catch (err) {
      const msg = err instanceof BriehostApiError ? err.message : String(err);
      setError(msg);

      // 401: session dropped during the Stripe round-trip (rare browser
      // quirk). Show a friendly sign-in prompt rather than spinning forever
      // — the webhook has already flipped the plan independently.
      if (err instanceof BriehostApiError && err.status === 401) {
        setNeedsAuth(true);
        stopRef.current = true;
        return;
      }

      // 404: stale intent id or row deleted. Hard-stop — no point waiting
      // for a row that doesn't exist.
      if (err instanceof BriehostApiError && err.status === 404) {
        stopRef.current = true;
        return;
      }
    }

    const elapsed = Date.now() - startedAtRef.current;
    const limit =
      advisoryStatus === "cancel" ? CANCEL_FAST_PATH_MS : MAX_POLL_DURATION_MS;

    if (elapsed >= limit) {
      stopRef.current = true;
      setTimedOut(true);
      return;
    }
    window.setTimeout(tick, POLL_INTERVAL_MS);
  }, [intentId, advisoryStatus]);

  useEffect(() => {
    if (!intentId) return;
    stopRef.current = false;
    startedAtRef.current = Date.now();
    setTimedOut(false);
    setError(null);
    void tick();
    return () => {
      stopRef.current = true;
    };
  }, [intentId, tick]);

  // Derived view-state. The advisoryStatus from Stripe is only used to pick
  // a friendlier "we're checking..." vs "we're confirming..." copy — never
  // as the final answer, since only the webhook is authoritative.
  const status = intent?.status ?? "pending";
  const isSuccess = status === "succeeded";
  const isFailureOrCancel = status === "failed" || status === "cancelled";
  const stillPolling = status === "pending" && !timedOut && !error;
  const planName =
    intent && intent.plan_id in PLANS
      ? PLANS[intent.plan_id as CustomerPlanId].name
      : intent?.plan_id ?? "your plan";

  return (
    <div className="min-h-screen bg-background">
      <NavBar />

      <main className="pt-28 pb-16 px-4">
        <section className="max-w-2xl mx-auto rounded-2xl border border-border bg-card/50 p-8 md:p-12 text-center">
          {needsAuth && (
            <>
              <div className="text-6xl mb-4">🔐</div>
              <h1 className="text-3xl md:text-4xl font-bold mb-3">
                Sign in to confirm
              </h1>
              <p className="text-muted-foreground mb-2">
                Your payment likely went through — Stripe just told us so.
                We need you signed in to show the final status and your new plan.
              </p>
              <p className="text-xs text-muted-foreground mb-6">
                (Your plan flips automatically when Stripe's webhook lands,
                whether you stay on this page or not.)
              </p>
              <Link
                to="/login"
                className="inline-block px-6 py-3 rounded-lg bg-primary text-primary-foreground font-bold hover:scale-105 transition-transform"
              >
                Sign in
              </Link>
            </>
          )}

          {!needsAuth && stillPolling && (
            <>
              <div className="inline-block animate-spin text-5xl mb-4">🧀</div>
              <h1 className="text-3xl md:text-4xl font-bold mb-3">
                Confirming your payment…
              </h1>
              <p className="text-muted-foreground">
                Stripe is letting us know it went through. This usually takes a
                few seconds.
              </p>
              {advisoryStatus === "cancel" && (
                <p className="mt-4 text-sm text-muted-foreground">
                  Stripe told us you cancelled, but we'll double-check with
                  their webhook before showing you the final status.
                </p>
              )}
            </>
          )}

          {isSuccess && (
            <>
              <div className="text-6xl mb-4">🎉</div>
              <h1 className="text-3xl md:text-4xl font-bold mb-3">
                You're on <span className="text-gradient-cheese">{planName}</span>!
              </h1>
              <p className="text-muted-foreground mb-6">
                Payment confirmed. Your plan is active right now.
              </p>
              <Link
                to="/dashboard"
                className="inline-block px-6 py-3 rounded-lg bg-primary text-primary-foreground font-bold hover:scale-105 transition-transform"
              >
                Back to Dashboard
              </Link>
            </>
          )}

          {isFailureOrCancel && (
            <>
              <div className="text-6xl mb-4">{status === "cancelled" ? "🥲" : "💔"}</div>
              <h1 className="text-3xl md:text-4xl font-bold mb-3">
                {status === "cancelled" ? "Payment cancelled" : "Payment failed"}
              </h1>
              <p className="text-muted-foreground mb-6">
                {status === "cancelled"
                  ? "No worries — nothing was charged. You can try again any time."
                  : "Stripe couldn't complete the payment. Nothing was charged. Try a different card or method."}
              </p>
              <Link
                to="/dashboard"
                className="inline-block px-6 py-3 rounded-lg bg-primary text-primary-foreground font-bold hover:scale-105 transition-transform"
              >
                Back to Dashboard
              </Link>
            </>
          )}

          {timedOut && status === "pending" && (
            <>
              <div className="text-6xl mb-4">⏳</div>
              <h1 className="text-3xl md:text-4xl font-bold mb-3">
                Still waiting on Stripe…
              </h1>
              <p className="text-muted-foreground mb-6">
                Your payment is taking longer than usual to confirm. Check the
                dashboard in a minute — if it's still not active, contact support.
              </p>
              <Link
                to="/dashboard"
                className="inline-block px-6 py-3 rounded-lg bg-primary text-primary-foreground font-bold hover:scale-105 transition-transform"
              >
                Back to Dashboard
              </Link>
            </>
          )}

          {error && !stillPolling && !isSuccess && !isFailureOrCancel && (
            <>
              <div className="text-6xl mb-4">⚠️</div>
              <h1 className="text-3xl md:text-4xl font-bold mb-3">
                Something went wrong
              </h1>
              <p className="text-muted-foreground mb-2 font-mono text-sm break-all">
                {error}
              </p>
              <p className="text-muted-foreground mb-6">
                If you actually paid, the plan should still flip when Stripe's
                webhook lands. Refresh in a minute.
              </p>
              <Link
                to="/dashboard"
                className="inline-block px-6 py-3 rounded-lg bg-primary text-primary-foreground font-bold hover:scale-105 transition-transform"
              >
                Back to Dashboard
              </Link>
            </>
          )}
        </section>
      </main>

      <FooterSection />
    </div>
  );
};

export default PaymentReturnPage;
