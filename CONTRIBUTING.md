# Contributing to @particle-academy/fancy-3d

Notes for anyone, human or agent, working ON this package's code. How to USE the
package is in [AGENTS.md](./AGENTS.md); what it is, is in [README.md](./README.md).
`CLAUDE.md` is a symlink to this file, so Claude Code reads these notes when it
works in this repo.

## Build and test

```bash
npm run build   # tsup
npm run dev     # tsup --watch
npm run lint    # tsc --noEmit && eslint .
npm test        # vitest run
```

Sources are in `src/` (`index.ts`, `scene.ts`, `dom.tsx`, `canvas/`, `hooks/`,
`utils/`); tests are in `tests/`. Reference docs shipped in the package are in
`docs/`.

## Keep the core engine-free

The core has no WebGL-engine dependency: `@babylonjs/core` and `three` are peers
of the adapter packages (`fancy-3d-babylon`, `fancy-3d-three`), never of this
one. WebGL engines plug in through the `CanvasEngine` interface.

## Changelog

Update `CHANGELOG.md` (Keep a Changelog, `[Unreleased]` at the top) in the same
commit as the change.
