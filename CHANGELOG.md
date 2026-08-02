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
