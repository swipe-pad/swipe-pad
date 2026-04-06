#!/usr/bin/env bash
set -euo pipefail

if [[ -z "${PRIVATE_KEY:-}" ]]; then
  echo "PRIVATE_KEY is not set" >&2
  exit 1
fi

if [[ -z "${THIRDWEB_SERVER_WALLET_ADDRESS:-}" ]]; then
  echo "THIRDWEB_SERVER_WALLET_ADDRESS is not set" >&2
  exit 1
fi

derived="$(cast wallet address --private-key "$PRIVATE_KEY" | tr '[:upper:]' '[:lower:]')"
declared="$(printf '%s' "$THIRDWEB_SERVER_WALLET_ADDRESS" | tr '[:upper:]' '[:lower:]')"

echo "derived executor:  $derived"
echo "declared executor: $declared"

if [[ "$derived" != "$declared" ]]; then
  echo "mismatch: PRIVATE_KEY does not match THIRDWEB_SERVER_WALLET_ADDRESS" >&2
  exit 1
fi

echo "promo executor configuration is consistent"
