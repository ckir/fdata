# fdata

A small command-line consumer of [`@ckirg/corelib-markets`](https://github.com/ckir/corelib): fetch market data
from Nasdaq without writing any HTTP code.

```bash
pnpm install
pnpm dev quote AAPL MSFT          # run from source (tsx)
pnpm build && pnpm start quote AAPL   # compiled
```

`fdata quote <SYMBOL[,SYMBOL...]>...` prints one JSON array, one entry per symbol (in the order given,
duplicates removed): `{ "symbol", "ok", "data" }`. `data` is the provider payload on success, the failure
message otherwise. The exit code is `0` when every symbol resolved, `1` when any failed, `2` on bad usage.

## Layout

| Path | What |
|---|---|
| `src/quotes.ts` | Pure logic: `parseSymbols`, `fetchQuotes(client, symbols)`, behind a small `QuoteClient` interface |
| `src/cli.ts` | Argument handling and output (the only file that touches `process`) |
| `tests/` | Vitest unit tests that use a fake `QuoteClient`, so no network |

## Dev tools

| Tool | Use |
|---|---|
| Node 24 (`.nvmrc`), pnpm 11 (`packageManager`) | runtime and package manager |
| TypeScript (strict, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`) | `pnpm typecheck`, `pnpm build` |
| Biome | `pnpm lint` (fixes), `pnpm lint:ci` (checks only) |
| Vitest | `pnpm test` (watch), `pnpm test:run` |
| tsx | `pnpm dev` |
| Lefthook | pre-commit runs `lint:ci`; pre-push runs `pnpm verify` |

`pnpm verify` is the full gate: lint, typecheck, tests and build. CI runs the same on Linux, macOS and Windows.

## Notes

- `.npmrc` sets `@jsr:registry=https://npm.jsr.io`: `@ckirg/corelib-markets` depends on `@gadicc/yahoo-finance2`,
  which is published on JSR.
- `pnpm-workspace.yaml` allows `@ckirg/corelib`'s postinstall (pnpm 11 blocks dependency scripts by default). It
  downloads the prebuilt native module from the matching GitHub Release; without it the Rust features are off.
- corelib logs through its own logger; set `LOG_LEVEL=error` to quiet it. The first quote also starts a symbol
  directory refresh, and corelib may log a warning if that download is blocked (quotes still resolve).

## License

MIT
