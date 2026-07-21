# FAINa

**Fermentation Assessment Intelligence Napkin**  
Rapid commercial fermentation assessment.

FAINa is a lightweight, transparent screening tool for VC investors and founders. It estimates minimum break-even production scale, reactor count, and directional CAPEX from incomplete fermentation data.

> No hidden assumptions. Every estimate is inspectable.

## Run locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm test
```

## Deploy to GitHub Pages

1. Create a repository named `faina`.
2. Push this project to `main`.
3. In **Settings → Pages**, select **GitHub Actions** as the source.
4. The included workflow deploys the production build.

## Model scope

FAINa is a first-pass screen, not a substitute for process simulation, vendor quotations, detailed engineering, or investment diligence. It uses:

- deterministic mass and throughput calculations;
- capital scaling with an explicit exponent;
- capital-recovery-factor annualization;
- editable benchmark and heuristic ranges in `src/data/benchmarks.json`;
- visibly tagged user, derived, and benchmark values.

The model searches integer reactor counts and returns the first facility whose estimated annual revenue covers variable costs, fixed OPEX, maintenance, and annualized capital.

## Public methodological references

- NREL and DOE techno-economic analyses use process mass/energy balances, equipment scaling, installed costs, operating expenses, and discounted-cash-flow methods to derive minimum selling prices.
- Humbird et al., *Aeration Costs in Stirred-Tank and Bubble Column Bioreactors* (2017), provides public discussion of scale-dependent oxygen-delivery economics.
- U.S. EPA engineering cost documentation describes capacity-factor scaling and capital recovery factors.

The numerical benchmark file intentionally distinguishes public-methodology support from engineering heuristics. Replace heuristics with product-specific evidence before relying on an assessment.

## Roadmap

- Scenario comparison ✓
- Benchmark explorer — v0.2
- Sensitivity analysis — v0.2

## License

MIT
