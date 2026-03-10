# Official Docs

Primary sources for this skill:

- Docs root: https://miniapps.farcaster.xyz/docs/getting-started
- LLM index: https://miniapps.farcaster.xyz/llms.txt
- Manifest vs embed: https://miniapps.farcaster.xyz/docs/guides/manifest-vs-embed
- Sharing: https://miniapps.farcaster.xyz/docs/guides/sharing-your-mini-app
- Checklist: https://miniapps.farcaster.xyz/docs/guides/checklist
- SDK context: https://miniapps.farcaster.xyz/docs/sdk/context
- SDK `isInMiniApp`: https://miniapps.farcaster.xyz/docs/sdk/is-in-mini-app
- Wallet provider: https://miniapps.farcaster.xyz/docs/sdk/wallet/getEthereumProvider
- Compose cast: https://miniapps.farcaster.xyz/docs/sdk/actions/compose-cast

Current implementation notes verified from official SDK packages:

- The official client package is `@farcaster/miniapp-sdk`.
- The official wagmi connector package is `@farcaster/miniapp-wagmi-connector`.
- The manifest belongs at `/.well-known/farcaster.json`.
- Manifest config uses version `"1"`.
- Embed metadata can be emitted via `fc:miniapp` and `fc:frame`.
- The SDK exposes `sdk.isInMiniApp()`, `sdk.context`, `sdk.actions.ready()`, `sdk.actions.composeCast()`, `sdk.actions.openUrl()`, and `sdk.wallet.getEthereumProvider()`.

Implementation defaults in SwipePad:

- Keep `fc:miniapp` and `fc:frame` in sync for compatibility.
- Omit `webhookUrl` until a real webhook route exists.
- Fall back to standard browser sharing only outside Farcaster hosts.
