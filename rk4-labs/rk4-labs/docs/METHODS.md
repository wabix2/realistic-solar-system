# Methods

**Units.** Length AU, time year, mass M☉. Then G = 4π² AU³ M☉⁻¹ yr⁻² and a circular orbit at 1 AU has period 1 yr.

**Equations of motion.** For bodies i = 1..N:
  r̈ᵢ = G Σ_{j≠i} mⱼ (rⱼ − rᵢ) / |rⱼ − rᵢ|³   (computed once per pair, using Fᵢⱼ = −Fⱼᵢ).

**Initial conditions.** For each planet the JPL elements (a, e, I, L, ϖ, Ω) give ω = ϖ − Ω and M = L − ϖ. Kepler's equation
M = E − e sin E is solved by Newton iteration; the perifocal state is
x = a(cos E − e), y = a√(1−e²) sin E, ẋ = −√(Ga) sin E / r, ẏ = √(Ga(1−e²)) cos E / r, r = a(1 − e cos E),
then rotated by ω, I, Ω. All positions and velocities are shifted so the system barycentre is at rest at the origin.

**Integrators** (state y = (x, v), step h):
- *Explicit Euler:* x ← x + h v ; v ← v + h a(x). First order; energy grows.
- *Velocity Verlet:* x ← x + h v + ½h²a ; v ← v + ½h(a + a′). Second order, symplectic, time-reversible.
- *RK4:* k₁ = f(y), k₂ = f(y + ½h k₁), k₃ = f(y + ½h k₂), k₄ = f(y + h k₃); y ← y + h(k₁ + 2k₂ + 2k₃ + k₄)/6. Fourth order, not symplectic.
- *Dormand-Prince RK45:* 7-stage embedded pair; step accepted if the scaled error ≤ 1, then h ← h·clamp(0.9·err^(−1/5), 0.2, 5), capped at the nominal step.

**Diagnostics.** Total energy E = Σ ½mv² − Σ_{i<j} G mᵢmⱼ/rᵢⱼ and angular momentum L = |Σ m r × v|. We report |ΔE/E₀| and |ΔL/L₀|.
Position error is measured against the RK45 solution (energy error ≈ 1e-12 over 10 yr).

**Test particles.** Belt and comet particles are massless and use kick-drift-kick leapfrog in the field of the Sun, Jupiter and Saturn.

**Known caveat.** The JPL elements are mean elements used here as osculating at J2000, so orbits differ slightly from the real ephemeris.
