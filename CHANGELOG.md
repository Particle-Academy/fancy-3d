# Changelog

Notable changes to `@particle-academy/fancy-3d`.

**BREAKING** marks anything that can stop working on upgrade. This package is
pre-1.0, so breaking changes land in MINOR releases — read those entries before
upgrading.

> Entries below **1.0** were reconstructed from git history when this file was
> introduced, so they summarise commit subjects rather than consumer impact.
> Everything from the next release onward is written by hand, in the same commit
> as the change.

---

## [Unreleased]

### Fixed

- **`CHANGELOG.md` is now in the published tarball.** `files` did not whitelist it, so npm never shipped it — and this package puts breaking changes in MINOR releases and tells you in the README to read the entry before taking one. The instruction existed for the author, who has the file, and not for the consumer, who is the only one being instructed. Nothing for you to do; the file simply arrives from this release on.

## 0.5.0 — 2026-08-07

### Changed

- **BREAKING — Node 22 is no longer supported.** `engines.node` moves from `>=22` to `>=22`.

  **What you must do:** on Node 22 or newer, nothing. Note npm only *warns* on an `engines` mismatch while **pnpm fails the install**, so this surfaces differently depending on your package manager. Node 18 is end-of-life and 20 is maintenance-only.

- **BREAKING — React 18 is no longer supported.** `peerDependencies.react` / `react-dom` are now `^19.0.0`.

  **What you must do:** on React 19, nothing. On React 18, stay on the previous release, or upgrade your app to 19 first.

  React 18 support was a claim nothing tested — every build and test in this package ran against 19, so the 18 half of the old range was never executed. An untested compatibility claim is worse than an absent one, because it reads as support.

### Why

These are the kit 0.5 platform floors, applied across every package at once so a consumer never has to resolve a mix. **No API changed, nothing was removed, nothing was renamed** — only what the package requires.


## 0.4.2 — 2026-06-03

- Maintenance only (1 internal commit).

## 0.4.1 — 2026-06-02

- Maintenance only (1 internal commit).

## 0.4.0 — 2026-05-27

### Changed

- **BREAKING** — split Babylon adapter out into @particle-academy/fancy-3d-babylon

## 0.3.3 — 2026-05-26

### Added

- **babylon:** re-export layouts (placeOnArc/Grid/Path/Sphere/Wall)

## 0.3.2 — 2026-05-26

### Fixed

- declare ambient `require` in canvas/engines/babylon

## 0.3.1 — 2026-05-04

- Maintenance only (1 internal commit).

## 0.3.0 — 2026-05-02

### Changed

- **BREAKING** — rename <Screen> to <Monitor> (frees the name for fancy-screens)

## 0.2.0 — 2026-05-02

### Added

- Canvas moved from react-fancy; engine-pluggable for Mixed Reality UX

## 0.1.6 — 2026-04-30

### Fixed

- **monitor:** switch screen face to thin createCard3D for correct UV

## 0.1.5 — 2026-04-30

### Fixed

- **monitor,screen:** mount surface on +Z (front) face, DOUBLESIDE plane

## 0.1.4 — 2026-04-30

### Fixed

- **react:** Screen overlays z-sort by 3D depth

## 0.1.3 — 2026-04-30

### Fixed

- **react:** Screen visibility — switch facing cull to abs(dot)

## 0.1.2 — 2026-04-30

- Maintenance only (1 internal commit).

## 0.1.1 — 2026-04-30

- Maintenance only (3 internal commits).

## 0.1.0 — 2026-04-30

### Changed

- initial commit — @particle-academy/fancy-3d v0.1.0
