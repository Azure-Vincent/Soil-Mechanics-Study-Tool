# Notation and math markup

All prose in the app (problem statements, hints, feedback, lessons, glossary, formula notes,
concept questions, diagram labels) writes symbols and formulas in **`$…$` math markup**.
`js/core/mathtext.js` renders it with italics, subscripts, superscripts and Greek letters,
using the same symbol table (`SM.expr.SYM` in `js/core/expr.js`) as the displayed equations,
so notation is identical everywhere. **Never write a symbol or formula as plain text.**

`node tests/lint-math.js --list` reports plain-text formulas and unknown symbols.

## Markup rules (inside `$…$`)

| Write | Renders | Notes |
|---|---|---|
| `$e = Vv / Vs$` | *e* = *V*ᵥ/*V*ₛ | identifiers come from the symbol table |
| `$S e = w Gs$` | *Se* = *wG*ₛ | a **space** between operands = juxtaposition (no ·) |
| `$q = k i A$` | *q* = *kiA* | write `k i A`, **not** `kiA` (that is an unknown identifier) |
| `$Ws = Gs gw Vs$` | *W*ₛ = *G*ₛ*γ*w*V*ₛ | |
| `$2.303 * a$` | 2.303·*a* | `*` renders as a centred dot |
| `$A = pi D^2 / 4$` | *A* = π*D*²/4 | `^x`, `^{…}`, `^(…)` superscript (parentheses dropped) |
| `$10^{-7}$ cm/s` | 10⁻⁷ cm/s | keep units **outside** the `$…$` |
| `$k_i$`, `$H_i$`, `$k_{H(eq)}$` | *k*ᵢ, *H*ᵢ | `_x` or `_{…}` subscript |
| `$Sum (k_i H_i)$` | Σ(*k*ᵢ*H*ᵢ) | `Sum` → Σ |
| `$log10(h1 / h2)$`, `$ln(h1/h2)$` | log₁₀(*h*₁/*h*₂) | functions: `ln log log10 exp sqrt sin cos tan` |
| `$<=$ $>=$ $~$ $!=$ $->$` | ≤ ≥ ≈ ≠ → | |
| `$d h / d t$` | *dh*/*dt* | separate letters |
| `$gsub = gsat - gw$` | *γ*′ = *γ*ₛₐₜ − *γ*w | |

Single letters (`e n w S k i q v h L A a t Q H V W Z u z r`) are italic variables. A single
letter followed by digits gets a subscript (`h1`, `D10`, `k20`, `r2`, `H3`, `e0`), and so does
`kH1`/`kV2` (*k*<sub>H1</sub>). A multi-letter identifier must be in the symbol table below. Otherwise it
renders upright and the linter flags it.

Numbers given with a symbol: `$Gs$ = 2.70`, `$e$ = 0.65`, `$w$ = 18 %` (value and unit outside the markup).

## Symbol table (Das & Sobhan notation)

| Id | Symbol | Meaning |
|---|---|---|
| `V Vs Vv Vw Va` | V, Vₛ, Vᵥ, V_w, Vₐ | total, solids, voids, water, air volumes |
| `W Ws Ww Wa` | W, Wₛ, W_w, Wₐ | total, solids, water, air weights |
| `M Ms Mw Md` | M, Mₛ, M_w, M_d | masses (moist, solids, water, oven-dry) |
| `w e n S Gs` | w, e, n, S, Gₛ | moisture content, void ratio, porosity, degree of saturation, specific gravity of solids |
| `g gd gsat gsub gw gs` | γ, γ_d, γ_sat, γ′, γ_w, γₛ | moist, dry, saturated, submerged unit weights; water; solids |
| `rho rhod rhosat rhow` | ρ, ρ_d, ρ_sat, ρ_w | densities |
| `grav` | g | gravitational acceleration (because `g` is γ!) |
| `emax emin Dr Rc` | e_max, e_min, D_r, R | relative density / relative compaction |
| `gdmax gdmin gdfield gdlab` | γ_d(max), γ_d(min), γ_d(field), γ_d(max-lab) | |
| `Cu D10 D50 D60` | C_u, D₁₀ … | gradation |
| `h Z u hA hB zA zB uA uB hp` | h, Z, u, … | total, elevation (Z), pore pressure; points A/B; `hp` = h_p pressure head |
| `Dh DH Dh1` | Δh, ΔH, Δh₁ | head loss, thickness change |
| `i k v vs q Q A a L t` | | gradient, hydraulic conductivity, discharge velocity, seepage velocity, flow rate, collected volume, specimen area, standpipe area, length, time |
| `kT k20 eta etaT eta20` | k_T, k₂₀, η, η_T, η_20°C | temperature correction |
| `Kbar` | K̄ | absolute (intrinsic) permeability (Das notation) |
| `kH kV kHeq kVeq kH1 kV1` | k_H, k_V, k_H(eq), k_V(eq), k_H1 | directional / equivalent conductivity |
| `k085 k0 e0 Ck C1 C3` | k₀.₈₅, k₀, e₀, C_k, C₁, C₃ | empirical relations |
| `r1 r2 h1 h2 H` | | pumping test radii, water levels, aquifer thickness |
| `Re` | Re | Reynolds number |

To add a symbol, add it to `SYM` in `js/core/expr.js`.
