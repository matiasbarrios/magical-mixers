# Contributing

Thanks for your interest in Magical Mixers. This project is a **Node.js library** for communicating with digital mixers over OSC/UDP. It is the core layer used by [Magical Mixing Console](https://github.com/matiasbarrios/magical-mixing-console) and can be reused in other tools or custom workflows.

The software is provided **as-is**, without warranty or support. Maintainers may not respond quickly — peer help in [Discussions](https://github.com/matiasbarrios/magical-mixers/discussions) or on [Discord](https://discord.gg/Zw3b4DEqbM) is welcome.

## Where to talk

| Channel | Use for |
|---------|---------|
| [Discussions → Q&A](https://github.com/matiasbarrios/magical-mixers/discussions/categories/q-a) | Build setup, API usage, OSC/UDP, drivers |
| [Discussions → Ideas](https://github.com/matiasbarrios/magical-mixers/discussions/categories/ideas) | New mixers, drivers, features — before coding |
| [Discussions → Show and tell](https://github.com/matiasbarrios/magical-mixers/discussions/categories/show-and-tell) | Integrations, experiments, downstream apps |
| [Issues](https://github.com/matiasbarrios/magical-mixers/issues) | Confirmed bugs and scoped feature work |
| [Pull requests](https://github.com/matiasbarrios/magical-mixers/pulls) | Code changes |

**General questions do not belong in Issues** — use Q&A instead.

## Before you code

1. Read the [README](README.md) — clone, virtual device, and example scripts.
2. Skim `src/core/drivers/xair/` to see how a supported desk family is structured.
3. Try the examples under `src/examples/` against the virtual X18 (`npm run x18`).

### Layer rule of thumb

| Change | Start in |
|--------|----------|
| New OSC parameter for X Air / M Air | `src/core/drivers/xair/device/` |
| OSC transport / send queue | `src/core/controllers/udpOSC/` |
| Shared helpers (scaling, LAN, etc.) | `src/core/helpers/` |
| Device discovery / search | `src/core/drivers/xair/search.js` |
| New mixer family (large effort) | New driver tree under `src/core/drivers/` |
| Virtual device for testing | `src/virtual-device/` |

Drivers depend on controllers and helpers, not the reverse. This package has no UI dependency.

### Full application (UI, Electron, mobile)

If you need a cross-platform mixer control app, see the sibling project [magical-mixing-console](https://github.com/matiasbarrios/magical-mixing-console).

## Development setup

```bash
git clone https://github.com/matiasbarrios/magical-mixers.git
cd magical-mixers
npm install
npm run build
```

Virtual mixer (no hardware):

```bash
npm run x18
```

Run an example against it:

```bash
node src/examples/busName.js 127.0.0.1 10024
```

## Tests

Run before opening a PR when your change touches linted code:

```bash
npm run lint
npm run build
```

Exercise your change manually with the virtual device and relevant scripts in `src/examples/`.

## Pull requests

- Keep PRs focused — one concern per PR when possible.
- Describe **what** changed and **why**.
- Note how you tested (virtual X18, real desk model, npm consumer app, etc.).
- If you change OSC paths or driver behavior, mention desk/model tested.
- Breaking API changes should be called out clearly in the PR description.

## License

By contributing, you agree that your contributions will be licensed under the [Apache License 2.0](LICENSE).
