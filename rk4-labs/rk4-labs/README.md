# Interstellar RK4 — N-Body Integrator Lab

A solar-system simulator that runs **four numerical integrators side by side** from identical starting conditions and plots how
their errors grow. Open it in a browser, watch Euler spiral outward while RK4 and Verlet hold their orbits, and read the
energy-error graph live. Live demo: https://rk4-labs.vercel.app

![convergence](docs/figures/convergence.png)

## What's inside
| Feature | Details |
|---|---|
| Integrators | Explicit Euler, Velocity Verlet, classic RK4, adaptive Dormand-Prince RK45 |
| Real data | JPL approximate Keplerian elements (J2000): true eccentricities, tilts, start positions; barycentre at rest |
| Real units | AU, years, solar masses, G = 4π² (no arbitrary constants) |
| Fixed time step | Physics step is independent of frame rate; "Time Warp" changes steps per frame |
| Live diagnostics | Energy-error graph (log scale), angular-momentum error, speed in km/s |
| Extras | 4,000-particle asteroid belt, comet launcher (absorbed by the Sun on impact), visual moons, Saturn's rings, true-scale mode |
| Quality | 8 unit tests, in-page self-tests, benchmark script, CI on every push |

## Results (reproducible: `npm run bench`)
| Method | Energy error after 100 yr (dt = 1.83 d) | Notes |
|---|---|---|
| Euler | 18% | orbits spiral outward |
| Velocity Verlet | ~3e-7 | bounded error, conserves angular momentum to machine precision |
| RK4 | 1.7e-5 | most accurate fixed-step per step, but not symplectic, so error drifts slowly |
| RK45 (adaptive) | 7e-12 | step size adapts, best accuracy |

RK4's error falls ~16× when the step is halved (measured ratio ≈ 18); see `results/convergence.csv` and `docs/METHODS.md`.

## Run it
```bash
git clone <your repo> && cd rk4-labs
npx serve .          # any static server; no build step (three.js loads from a CDN)
npm test             # 8 unit tests, Node >= 18, zero dependencies
npm run bench        # regenerates results/*.csv
npm run plots        # regenerates docs/figures/*.png (needs python3 + matplotlib)
```

## Project layout
```
index.html            UI markup           src/bodies.js        constants + planet data
css/style.css         styles              src/gravity.js       N-body acceleration
src/main.js           rendering + UI      src/kepler.js        orbital elements -> state
src/integrators.js    Euler/Verlet/RK4/RK45   src/testparticles.js  belt + comets (leapfrog)
tests/                unit tests          scripts/             benchmark + plots
docs/METHODS.md       equations           results/             CSV data for the paper
```

## Limitations (honest list)
- Orbital elements are JPL's *approximate* mean elements, not full Horizons state vectors; no moons or asteroids in the N-body physics.
- Moons are visual only; the asteroid belt and comets feel only the Sun, Jupiter and Saturn.
- Distances are compressed on screen unless "True linear scale" is chosen; planet sizes are not to scale.
- No relativistic effects (Mercury's perihelion precession is not modelled).

## Team
Wabi Tafese (lead dev), Rakeb Tewodros, Henok Yared, Rediet Mebt, Aklesiya Negalign, Hemen Tadese, Arsema Laikemariam.

## License / citation
MIT (see `LICENSE`). Cite via `CITATION.cff`.
