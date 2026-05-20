# Payment systems — frontend checklist

This is the frontend half of the payments work. The full architecture,
provider rationale, schema, and webhook design live in the API repo:

> **[briehost-api/docs/PAYMENTS.md](https://github.com/YliasR/briehost-api/blob/yr-paysystems/docs/PAYMENTS.md)** — read that first.

## What lands here

### New screens / components

- [ ] **`PaymentMethodPicker`** — radio group on the upgrade flow:
      *Card*, *Bancontact*, *PayPal*, *Crypto*. Each option carries a
      provider id (`stripe_card` | `stripe_bancontact` | `paypal` |
      `coingate`) and a short description.
- [ ] **Plan-upgrade screen rework** — wraps the existing plan cards on
      `DashboardPage` so the "Confirm switch" flow goes via the picker
      instead of directly calling `updatePlan`. Free plan stays a direct
      switch (no payment needed because it's free).
      **Important distinction:** the dark-pattern skip path is *not* a
      free-tier downgrade. The user keeps whatever plan they picked
      (even Enterprise) and just bypasses payment. See API plan doc
      for the framing — this matters for how we build the modal copy
      and what API the skip link calls.
- [ ] **`PaymentReturnPage`** route (e.g. `/payments/return/:intentId`)
      — polls `GET /api/payments/intents/{id}` for ~30s while the
      provider webhook lands, then routes back to the dashboard with a
      success toast or shows a retry/contact-support state on failure.
- [ ] **`PaymentHistorySection`** on the dashboard (Phase 6, optional) —
      lists past `payment_intents` rows, status, provider, amount.

### Provider-specific UI

- [ ] **Stripe card + Bancontact** — redirect to `checkout.stripe.com`
      URL returned by `POST /api/payments/intents`. Simplest path, no
      Stripe Elements embed for the demo.
- [ ] **PayPal** — render the smart-button SDK inline on the picker.
      Initialised with `clientId` from a new public env var
      (`VITE_PAYPAL_CLIENT_ID`). `createOrder` calls our API,
      `onApprove` redirects to the return page.
- [ ] **CoinGate** — redirect to the hosted invoice URL returned by
      the API. Same shape as Stripe redirect.

### API client additions (`src/lib/briehostApi.ts`)

```ts
type PaymentProvider = 'stripe_card' | 'stripe_bancontact' | 'paypal' | 'coingate';
type PaymentStatus = 'pending' | 'succeeded' | 'failed' | 'cancelled';

createPaymentIntent(planId: string, provider: PaymentProvider): Promise<{
  intentId: string;
  checkoutUrl?: string;        // stripe + coingate
  paypalOrderId?: string;      // paypal-only
}>

getPaymentIntent(intentId: string): Promise<{
  status: PaymentStatus;
  planId: string;
  provider: PaymentProvider;
}>

// Dark-pattern skip — activates the selected plan with NO payment, any
// tier. NOT a free-tier downgrade. Calls POST /api/payments/skip on the
// API, which writes an audit row with provider='skip' and flips
// profiles.plan. Use this from the SkipConfirmShameModal "confirm"
// button only.
skipPayment(planId: string): Promise<{ plan: string }>
```

### Env vars to wire

```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
VITE_PAYPAL_CLIENT_ID=...                # PayPal sandbox client id
# Crypto needs no client-side key — full redirect flow
```

## Dark-pattern UX — implementation notes

(Full ethical write-up and pattern names live in the API plan doc.)

**Critical:** the skip path activates *whatever plan the user picked* —
including the most expensive one — without charging anything. It is
NOT a downgrade to free. That's the whole point. Build the components
and copy around that fact.

The picker screen happens *after* the user clicks a plan card on the
dashboard. So at picker-render time we already know which paid plan
they chose; the skip link reads that selected plan and posts it to
`/api/payments/skip` if the user confirms past the shame modal.

- [ ] **Pre-select** the Stripe-card payment method when the picker
      renders.
- [ ] **Visual hierarchy**: primary yellow CTA "Continue to checkout 🧀";
      the skip is a small grey `<a>` (not a `<Button>`), muted-foreground
      colour, no icon, no underline-on-hover. Easy to miss.
- [ ] **Confirm-shame modal** on the skip path. Title: "Wait, really?".
      Copy reads as loss-aversion even though the user loses nothing
      ("Most users on the {selectedPlanName} tier prefer to keep their
      account in good standing..."). Buttons: primary "Take me back"
      vs ghost "Continue without paying anyway 🥲".
- [ ] **Friction asymmetry**: paying is one click → redirect. Skipping
      is one click → modal → confirm → API call → success toast.
- [ ] **Skip toast** on success: cheerful, generic ("Welcome to {plan}!")
      — never acknowledges the skip happened. Adds to the deception
      layer for the write-up.

Implement everything in components named after the pattern they
implement (`SkipConfirmShameModal`, `MutedSkipLink`,
`PreSelectedPaymentMethodPicker`). When the jury opens the source,
the names tell on us — that's part of the demonstration.

## Test data for the demo

- Stripe test cards: `4242 4242 4242 4242`, `4000 0027 6000 3184` (3DS).
- Bancontact test: pick Bancontact on the redirect page, click
  "Authorize Test Payment".
- PayPal sandbox: log into the buyer test account on the sandbox popup.
- CoinGate sandbox: every invoice has a "simulate payment" button — no
  testnet coin needed.

## Build order (matches API phases)

| Phase | Frontend bit |
| --- | --- |
| 0 | API helper stubs + types — no UI yet |
| 1 | Picker + Stripe card redirect + return page (minimum viable demo) |
| 2 | Add Bancontact option (same redirect, different provider id) |
| 3 | Dark-pattern stack on the upgrade screen |
| 4 | PayPal smart-button |
| 5 | CoinGate redirect |
| 6 | Payment history view |

Phases 1-3 are the minimum viable "we have payments." 4-5 are the
extra-points additions. 6 only if there's slack.
