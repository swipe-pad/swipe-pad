/**
 * Fired once a checkout has been acknowledged (on-chain receipt or ledger
 * write) and the settled items left the cart. Listeners that hold undo
 * history for those items (the swipe deck) must drop it: the donations are
 * final, so there is nothing an undo could give back.
 */
export const CHECKOUT_SETTLED_EVENT = "swipepad:checkout-settled"

export function dispatchCheckoutSettled() {
  if (typeof window === "undefined") return
  window.dispatchEvent(new Event(CHECKOUT_SETTLED_EVENT))
}

export function subscribeCheckoutSettled(listener: () => void): () => void {
  if (typeof window === "undefined") return () => {}
  window.addEventListener(CHECKOUT_SETTLED_EVENT, listener)
  return () => window.removeEventListener(CHECKOUT_SETTLED_EVENT, listener)
}
