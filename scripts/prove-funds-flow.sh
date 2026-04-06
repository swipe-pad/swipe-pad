#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
RPC_URL="${ANVIL_RPC:-http://127.0.0.1:8545}"

DEFAULT_USER_PK="0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
DEFAULT_SPONSOR_PK="0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d"

export PRIVATE_KEY="${PRIVATE_KEY:-$DEFAULT_USER_PK}"
export SPONSOR_PRIVATE_KEY="${SPONSOR_PRIVATE_KEY:-$DEFAULT_SPONSOR_PK}"

ANVIL_SESSION=""

cleanup() {
  if [[ -n "$ANVIL_SESSION" ]]; then
    kill "$ANVIL_SESSION" >/dev/null 2>&1 || true
  fi
}
trap cleanup EXIT

if ! cast block-number --rpc-url "$RPC_URL" >/dev/null 2>&1; then
  anvil --host 127.0.0.1 --port 8545 >/tmp/swipepad-anvil.log 2>&1 &
  ANVIL_SESSION="$!"
  sleep 2
fi

cd "$ROOT_DIR/contracts"
forge script script/LocalFundsProof.s.sol --rpc-url "$RPC_URL" --broadcast -vvv
