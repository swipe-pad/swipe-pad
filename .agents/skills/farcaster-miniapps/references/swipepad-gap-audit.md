# SwipePad Gap Audit

## Existing state

- There was a static `public/farcaster.json` with placeholder account association data.
- The static manifest referenced `/api/webhooks/farcaster`, but that route does not exist.
- Farcaster detection in app code relied on `window.ethereum.isFarcaster`.
- Wallet connect used `wagmi` injected fallback or `thirdweb`, but not the official Farcaster connector.
- Share flow supported browser share, clipboard, Twitter, and Telegram, but not Farcaster cast composition.
- Shared project pages had OG metadata but no explicit Farcaster embed metadata.

## Required touchpoints

- `src/lib/farcaster/*`
- `src/lib/minipay-utils.ts`
- `src/lib/wagmi-config.ts`
- `src/hooks/use-app-bootstrap.ts`
- `src/components/providers.tsx`
- `src/components/wallet-connect.tsx`
- `src/components/share-modal.tsx`
- `src/components/project-card.tsx`
- `src/components/home-screen.tsx`
- `src/app/layout.tsx`
- `src/app/(app)/p/[slug]/page.tsx`
- `src/app/.well-known/farcaster.json/route.ts`
- `src/app/farcaster.json/route.ts`
- tests under `src/lib`, `src/app/api`, and `tests/playwright`

## Guardrails

- The manifest must be dynamic and env-driven.
- The root app still needs to work outside Farcaster.
- Farcaster host support must not break MiniPay detection.
- Playwright should not depend on a real Farcaster client.
