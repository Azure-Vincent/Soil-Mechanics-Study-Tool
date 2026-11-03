/* Formula reference and glossary. Formula examples are evaluated by the same expression
 * engine at render time, so the example numbers always match the displayed equation.
 * Prose fields (name, variable meanings, assumptions, applicability, glossary) use the
 * $…$ math markup (see docs/NOTATION.md); lhs/expr are expression-engine source. */
(function (root) {
  'use strict';
  var SM = root.SM;

  function F(id, ch, name, lhs, expr, vars, assumptions, applic, ex, unit, tags) {
    return { id: id, chapter: ch, name: name, lhs: lhs, expr: expr, vars: vars, assumptions: assumptions, applicability: applic, example: ex, unit: unit || '', tags: tags || '' };
  }
  // unit-weight relationship table (Das & Sobhan, Table 3.1): group = 'moist' | 'dry' | 'sat'
  function G(group, f) { return Object.assign(f, { group: group }); }

  // common variable rows
  var vGs = ['Gs', 'specific gravity of solids', '–'], vgw = ['gw', 'unit weight of water', 'kN/m³'],
      ve = ['e', 'void ratio', '–'], vn = ['n', 'porosity (decimal)', '–'], vw = ['w', 'water content (decimal)', '–'],
      vS = ['S', 'degree of saturation (decimal)', '–'], vgsat = ['gsat', 'saturated unit weight', 'kN/m³'],
      vgd = ['gd', 'dry unit weight', 'kN/m³'], vrhow = ['rhow', 'density of water', 'kg/m³'];
  // consistent example state: Gs = 2.70, e = 0.65, S = 0.60 → w = S e / Gs = 0.1444; saturated: w = e / Gs = 0.2407, n = e / (1 + e) = 0.3939
  var SAT = 'Saturated soil, $S$ = 100 % (so $S e = w Gs$ gives $e = w Gs$).';

  var FORMULAS = [
    F('f-V', 3, 'Total volume', 'V', 'Vs + Vv', [['Vs', 'volume of solids', 'm³'], ['Vv', 'volume of voids', 'm³']], 'Phase diagram definition.', 'All soils.', { Vs: 0.6, Vv: 0.4 }, 'm³'),
    F('f-W', 3, 'Total weight', 'W', 'Ws + Ww', [['Ws', 'weight of solids', 'kN'], ['Ww', 'weight of water', 'kN']], 'Weight of air neglected.', 'All soils.', { Ws: 15.9, Ww: 2.4 }, 'kN'),
    F('f-w', 3, 'Water content', 'w', 'Ww / Ws', [['Ww', 'weight (or mass) of water', 'kN or g'], ['Ws', 'weight (or mass) of solids', 'same unit']], 'Oven-drying removes all pore water.', 'Any soil; may exceed 100 %.', { Ww: 2.4, Ws: 15.9 }, '%', 'moisture'),
    F('f-e', 3, 'Void ratio', 'e', 'Vv / Vs', [['Vv', 'volume of voids', 'm³'], ['Vs', 'volume of solids', 'm³']], '—', 'Any soil; may exceed 1.', { Vv: 0.4, Vs: 0.6 }, ''),
    F('f-n', 3, 'Porosity', 'n', 'Vv / V', [['Vv', 'volume of voids', 'm³'], ['V', 'total volume', 'm³']], '—', '$0 <= n < 1$.', { Vv: 0.4, V: 1.0 }, '%'),
    F('f-ne', 3, 'Porosity from void ratio', 'n', 'e / (1 + e)', [ve], '$Vs$ = 1 diagram.', 'Always.', { e: 0.65 }, '%'),
    F('f-en', 3, 'Void ratio from porosity', 'e', 'n / (1 - n)', [vn], '$V$ = 1 diagram.', 'Always.', { n: 0.4 }, ''),
    F('f-S', 3, 'Degree of saturation', 'S', 'Vw / Vv', [['Vw', 'volume of water', 'm³'], ['Vv', 'volume of voids', 'm³']], '—', '0 ≤ $S$ ≤ 100 %.', { Vw: 0.25, Vv: 0.4 }, '%', 'saturation'),
    F('f-Se', 3, 'Relation $S e = w Gs$', 'S', 'w * Gs / e', [vw, vGs, ve], 'Derived from the $Vs$ = 1 diagram.', 'Always; use $S$ = 1 for saturated soil ($e = w Gs$).', { w: 0.2, Gs: 2.7, e: 0.75 }, '%'),
    F('f-Gs', 3, 'Specific gravity of solids', 'Gs', 'Ws / (Vs * gw)', [['Ws', 'weight of solids', 'kN'], ['Vs', 'volume of solids', 'm³'], vgw], '—', 'Typical 2.6–2.9 for mineral soils.', { Ws: 15.9, Vs: 0.6, gw: 9.81 }, ''),
    F('f-g', 3, 'Moist unit weight (definition)', 'g', 'W / V', [['W', 'total weight', 'kN'], ['V', 'total volume', 'm³']], '—', 'Any degree of saturation.', { W: 18.3, V: 1.0 }, 'kN/m³', 'bulk'),
    F('f-gd', 3, 'Dry unit weight (definition)', 'gd', 'Ws / V', [['Ws', 'weight of solids', 'kN'], ['V', 'total volume', 'm³']], '—', 'Used for compaction control.', { Ws: 15.9, V: 1.0 }, 'kN/m³'),

    // ----- moist unit weight, Table 3.1 -----
    G('moist', F('f-gwGs', 3, 'Moist unit weight from $w$, $Gs$ and $e$', 'g', '(1 + w) * Gs * gw / (1 + e)', [vw, vGs, ve, vgw], '$Vs$ = 1 diagram.', 'Any $S$.', { w: 0.144444, Gs: 2.7, e: 0.65, gw: 9.81 }, 'kN/m³')),
    G('moist', F('f-gGSe', 3, 'Moist unit weight from $Gs$, $S$ and $e$', 'g', '(Gs + S * e) * gw / (1 + e)', [vGs, vS, ve, vgw], '$Vs$ = 1 diagram.', 'Any $S$.', { Gs: 2.7, S: 0.6, e: 0.65, gw: 9.81 }, 'kN/m³')),
    G('moist', F('f-t31-moist-3', 3, 'Moist unit weight from $w$, $Gs$ and $S$', 'g', '(1 + w) * Gs * gw / (1 + w * Gs / S)', [vw, vGs, vS, vgw], 'Substitute $e = w Gs / S$ into $g = (1 + w) Gs gw / (1 + e)$.', 'Partially saturated soil ($S$ > 0).', { w: 0.144444, Gs: 2.7, S: 0.6, gw: 9.81 }, 'kN/m³')),
    G('moist', F('f-t31-moist-4', 3, 'Moist unit weight from $Gs$, $n$ and $w$', 'g', 'Gs * gw * (1 - n) * (1 + w)', [vGs, vn, vw, vgw], '$V$ = 1 diagram: $Vs = 1 - n$, $W = Ws (1 + w)$.', 'Any $S$.', { Gs: 2.7, n: 0.393939, w: 0.144444, gw: 9.81 }, 'kN/m³')),

    // ----- dry unit weight, Table 3.1 -----
    G('dry', F('f-ggd', 3, 'Dry unit weight from moist unit weight', 'gd', 'g / (1 + w)', [['g', 'moist unit weight', 'kN/m³'], vw], 'Same total volume.', 'Always.', { g: 18.3715, w: 0.144444 }, 'kN/m³')),
    G('dry', F('f-gdGe', 3, 'Dry unit weight from $Gs$ and $e$', 'gd', 'Gs * gw / (1 + e)', [vGs, vgw, ve], '$Vs$ = 1 diagram.', 'Always.', { Gs: 2.7, gw: 9.81, e: 0.65 }, 'kN/m³')),
    G('dry', F('f-t31-dry-3', 3, 'Dry unit weight from $Gs$ and $n$', 'gd', 'Gs * gw * (1 - n)', [vGs, vgw, vn], '$V$ = 1 diagram: $Vs = 1 - n$.', 'Always.', { Gs: 2.7, gw: 9.81, n: 0.393939 }, 'kN/m³')),
    G('dry', F('f-t31-dry-4', 3, 'Dry unit weight from $Gs$, $w$ and $S$', 'gd', 'Gs * gw / (1 + w * Gs / S)', [vGs, vgw, vw, vS], 'Substitute $e = w Gs / S$ into $gd = Gs gw / (1 + e)$.', 'Partially saturated soil ($S$ > 0).', { Gs: 2.7, gw: 9.81, w: 0.144444, S: 0.6 }, 'kN/m³')),
    G('dry', F('f-t31-dry-5', 3, 'Dry unit weight from $e$, $S$ and $w$', 'gd', 'e * S * gw / ((1 + e) * w)', [ve, vS, vw, vgw], 'Substitute $Gs = S e / w$ into $gd = Gs gw / (1 + e)$.', 'Moist soil ($w$ > 0).', { e: 0.65, S: 0.6, w: 0.144444, gw: 9.81 }, 'kN/m³')),
    G('dry', F('f-t31-dry-6', 3, 'Dry unit weight from saturated unit weight and $n$', 'gd', 'gsat - n * gw', [vgsat, vn, vgw], 'Remove the water filling the voids ($Vw = n$ for $V$ = 1).', 'Same soil skeleton; $gsat$ at $S$ = 100 %.', { gsat: 19.9173, n: 0.393939, gw: 9.81 }, 'kN/m³')),
    G('dry', F('f-t31-dry-7', 3, 'Dry unit weight from saturated unit weight and $e$', 'gd', 'gsat - e * gw / (1 + e)', [vgsat, ve, vgw], 'Remove the water filling the voids ($Vw = e$ for $Vs$ = 1).', 'Same soil skeleton; $gsat$ at $S$ = 100 %.', { gsat: 19.9173, e: 0.65, gw: 9.81 }, 'kN/m³')),

    // ----- saturated unit weight, Table 3.1 -----
    G('sat', F('f-gsat', 3, 'Saturated unit weight from $Gs$ and $e$', 'gsat', '(Gs + e) * gw / (1 + e)', [vGs, ve, vgw], '$Vs$ = 1 diagram; $S$ = 100 %.', 'Below the water table or otherwise saturated soils.', { Gs: 2.7, e: 0.65, gw: 9.81 }, 'kN/m³')),
    G('sat', F('f-gsatn', 3, 'Saturated unit weight from $Gs$ and $n$', 'gsat', '((1 - n) * Gs + n) * gw', [vn, vGs, vgw], '$V$ = 1 diagram; $S$ = 100 %.', 'Saturated soils.', { n: 0.393939, Gs: 2.7, gw: 9.81 }, 'kN/m³')),
    G('sat', F('f-t31-sat-3', 3, 'Saturated unit weight from $w$ and $Gs$', 'gsat', '(1 + w) * Gs * gw / (1 + w * Gs)', [vw, vGs, vgw], SAT, '$S$ = 100 %.', { w: 0.240741, Gs: 2.7, gw: 9.81 }, 'kN/m³')),
    G('sat', F('f-t31-sat-4', 3, 'Saturated unit weight from $e$ and $w$', 'gsat', '(e / w) * ((1 + w) / (1 + e)) * gw', [ve, vw, vgw], 'Substitute $Gs = e / w$ (saturated) into $g = (1 + w) Gs gw / (1 + e)$.', '$S$ = 100 %.', { e: 0.65, w: 0.240741, gw: 9.81 }, 'kN/m³')),
    G('sat', F('f-t31-sat-5', 3, 'Saturated unit weight from $n$ and $w$', 'gsat', 'n * ((1 + w) / w) * gw', [vn, vw, vgw], '$V$ = 1 diagram: $Ww = n gw$ and $W = Ww (1 + w) / w$.', '$S$ = 100 %.', { n: 0.393939, w: 0.240741, gw: 9.81 }, 'kN/m³')),
    G('sat', F('f-t31-sat-6', 3, 'Saturated unit weight from dry unit weight and $n$', 'gsat', 'gd + n * gw', [vgd, vn, vgw], 'Fill the voids ($Vv = n$ for $V$ = 1) with water.', '$S$ = 100 %.', { gd: 16.0527, n: 0.393939, gw: 9.81 }, 'kN/m³')),
    G('sat', F('f-t31-sat-7', 3, 'Saturated unit weight from dry unit weight and $e$', 'gsat', 'gd + (e / (1 + e)) * gw', [vgd, ve, vgw], 'Fill the voids ($Vv = e$ for $Vs$ = 1) with water.', '$S$ = 100 %.', { gd: 16.0527, e: 0.65, gw: 9.81 }, 'kN/m³')),

    // ----- densities -----
    F('f-rho', 3, 'Moist density from $w$, $Gs$ and $e$', 'rho', '(1 + w) * Gs * rhow / (1 + e)', [vw, vGs, ve, vrhow], '$Vs$ = 1 diagram; $rhow$ = 1000 kg/m³.', 'Any $S$.', { w: 0.144444, Gs: 2.7, e: 0.65, rhow: 1000 }, 'kg/m³', 'mass density'),
    F('f-rhod', 3, 'Dry density from $Gs$ and $e$', 'rhod', 'Gs * rhow / (1 + e)', [vGs, ve, vrhow], '$Vs$ = 1 diagram; $rhow$ = 1000 kg/m³.', 'Always.', { Gs: 2.7, e: 0.65, rhow: 1000 }, 'kg/m³', 'mass density'),
    F('f-rhosat', 3, 'Saturated density from $Gs$ and $e$', 'rhosat', '(Gs + e) * rhow / (1 + e)', [vGs, ve, vrhow], '$Vs$ = 1 diagram; $rhow$ = 1000 kg/m³.', '$S$ = 100 %.', { Gs: 2.7, e: 0.65, rhow: 1000 }, 'kg/m³', 'mass density'),

    F('f-gsub', 3, 'Submerged (effective) unit weight', 'gsub', 'gsat - gw', [vgsat, vgw], 'Buoyancy; hydrostatic water.', 'Effective stress below the water table.', { gsat: 20.1, gw: 9.81 }, 'kN/m³', 'buoyant effective'),
    F('f-gr', 3, 'Unit weight from density', 'g', 'rho * grav', [['rho', 'density', 'Mg/m³ (= g/cm³)'], ['grav', 'gravitational acceleration', '9.81 m/s²']], '—', 'Mg/m³ × m/s² = kN/m³.', { rho: 1.85, grav: 9.81 }, 'kN/m³', 'mass weight density'),
    F('f-Dr', 3, 'Relative density', 'Dr', '(emax - e) / (emax - emin)', [['emax', 'maximum void ratio', '–'], ['emin', 'minimum void ratio', '–'], ['e', 'in-situ void ratio', '–']], 'Standard $emax$ and $emin$ tests.', 'Granular (free-draining) soils.', { emax: 0.85, emin: 0.48, e: 0.62 }, '%'),
    F('f-Drg', 3, 'Relative density from dry unit weights', 'Dr', '(gd - gdmin) / (gdmax - gdmin) * gdmax / gd', [['gd', 'in-situ dry unit weight', 'kN/m³'], ['gdmin', 'minimum dry unit weight', 'kN/m³'], ['gdmax', 'maximum dry unit weight', 'kN/m³']], 'Same $Gs$ in all states.', 'Granular soils.', { gd: 16.4, gdmin: 14.3, gdmax: 17.6 }, '%'),
    F('f-Rc', 3, 'Relative compaction', 'Rc', 'gdfield / gdlab', [['gdfield', 'field dry unit weight', 'kN/m³'], ['gdlab', 'maximum dry unit weight from the lab compaction test', 'kN/m³']], 'Lab maximum from a standard compaction test (Ch. 6).', 'Compaction specifications.', { gdfield: 17.1, gdlab: 18.2 }, '%'),
    F('f-ci', 3, '$emax$–$emin$ correlation, clean sand (Cubrinovski & Ishihara 2002)', 'emax', '0.072 + 1.53 * emin', [['emin', 'minimum void ratio', '–']], 'Empirical; scatter about the fit.', 'Clean sands, fines content 0–5 % only.', { emin: 0.55 }, ''),
    F('f-h', 7, 'Total head (Bernoulli, soils)', 'h', 'u / gw + Z', [['u', 'pore water pressure', 'kPa'], vgw, ['Z', 'elevation head above datum', 'm']], 'Velocity head $v^2 / 2 grav$ neglected (tiny seepage velocity).', 'Seepage in soils.', { Z: 4, u: 29.4, gw: 9.81 }, 'm', 'bernoulli pressure elevation'),
    F('f-i', 7, 'Hydraulic gradient', 'i', 'Dh / L', [['Dh', 'total head loss', 'm'], ['L', 'length of flow path', 'm']], 'Uniform gradient along $L$.', 'Use total (not pressure) head.', { Dh: 0.5, L: 2 }, ''),
    F('f-darcy', 7, 'Darcy’s law', 'v', 'k * i', [['k', 'hydraulic conductivity', 'cm/s'], ['i', 'hydraulic gradient', '–']], 'Laminar, steady, saturated flow.', 'Most soils; may fail for turbulent flow in coarse gravel.', { k: 0.01, i: 0.5 }, 'cm/s'),
    F('f-q', 7, 'Discharge rate', 'q', 'k * i * A', [['k', 'hydraulic conductivity', 'cm/s'], ['i', 'hydraulic gradient', '–'], ['A', 'total cross-sectional area', 'cm²']], 'Darcy.', '—', { k: 0.01, i: 0.5, A: 50 }, 'cm³/s'),
    F('f-vs', 7, 'Seepage velocity', 'vs', 'v / n', [['v', 'discharge velocity', 'cm/s'], vn], 'Average void area is $n A$.', 'Travel-time estimates.', { v: 0.005, n: 0.4 }, 'cm/s'),
    F('f-vs2', 7, 'Seepage velocity from void ratio', 'vs', 'v * (1 + e) / e', [['v', 'discharge velocity', 'cm/s'], ve], 'Same as $vs = v / n$ with $n = e / (1 + e)$.', 'Travel-time estimates.', { v: 0.005, e: 0.65 }, 'cm/s'),
    F('f-ch', 7, 'Constant-head test', 'k', 'Q * L / (A * h * t)', [['Q', 'volume collected', 'cm³'], ['L', 'specimen length', 'cm'], ['A', 'specimen area', 'cm²'], ['h', 'constant head difference', 'cm'], ['t', 'time', 's']], 'Steady flow; saturated specimen.', 'Coarse-grained soils.', { Q: 350, L: 25, A: 44.2, h: 60, t: 120 }, 'cm/s'),
    F('f-fh', 7, 'Falling-head test', 'k', '2.303 * a * L / (A * t) * log10(h1 / h2)', [['a', 'standpipe area', 'cm²'], ['L', 'specimen length', 'cm'], ['A', 'specimen area', 'cm²'], ['t', 'elapsed time', 's'], ['h1', 'initial head', 'cm'], ['h2', 'final head', 'cm']], 'Saturated specimen; heads from the outlet level.', 'Fine-grained soils. Equivalent: $k = (a L / A t) ln(h1 / h2)$.', { a: 0.785, L: 10, A: 44.2, t: 900, h1: 100, h2: 60 }, 'cm/s'),
    F('f-T', 7, 'Temperature correction', 'k20', 'kT * etaRatio', [['kT', 'hydraulic conductivity at test temperature', 'cm/s'], ['etaRatio', '$etaT / eta20$ (from water-viscosity tables)', '–']], 'Only viscosity changes significantly.', 'Report $k$ at 20 °C.', { kT: 0.012, etaRatio: 0.889 }, 'cm/s', 'viscosity'),
    F('f-K', 7, 'Absolute (intrinsic) permeability', 'Kbar', 'k * eta / gw', [['k', 'hydraulic conductivity', 'm/s'], ['eta', 'dynamic viscosity', 'Pa·s'], ['gw', 'unit weight of water', 'N/m³']], 'Laminar Newtonian flow; $k = (gw / eta) Kbar$.', '$Kbar$ depends on the soil (pore geometry) only.', { k: 1e-4, eta: 1.002e-3, gw: 9789 }, 'm²', 'absolute intrinsic'),
    F('f-hazen', 7, 'Hazen (1930)', 'k', 'c * D10 ^ 2', [['c', 'empirical constant (about 1; varies by source)', '–'], ['D10', 'effective size', 'mm']], '$k$ in cm/s with $D10$ in mm.', 'Clean, fairly uniform sands; order-of-magnitude estimate.', { c: 1.0, D10: 0.2 }, 'cm/s', 'empirical'),
    F('f-casa', 7, 'Casagrande', 'k', '1.4 * e ^ 2 * k085', [ve, ['k085', '$k$ at $e$ = 0.85', 'cm/s']], 'Empirical.', 'Fine-to-medium clean sand.', { e: 0.6, k085: 0.004 }, 'cm/s', 'empirical'),
    F('f-chap', 7, 'Chapuis (2004)', 'k', '2.4622 * (D10 ^ 2 * e ^ 3 / (1 + e)) ^ 0.7825', [['D10', 'effective size', 'mm'], ve], '$k$ in cm/s.', 'Natural sands and gravels, about 0.3 < $e$ < 1.', { D10: 0.2, e: 0.6 }, 'cm/s', 'empirical'),
    F('f-kc', 7, 'Kozeny–Carman ratio', 'k2', 'k1 * (e2 ^ 3 / (1 + e2)) / (e1 ^ 3 / (1 + e1))', [['k1', '$k$ at $e1$', 'cm/s'], ['e1', 'void ratio 1', '–'], ['e2', 'void ratio 2', '–']], 'Same sand; $k ∝ e^3 / (1 + e)$.', 'Granular soils.', { k1: 0.01, e1: 0.7, e2: 0.55 }, 'cm/s', 'empirical'),
    F('f-tay', 7, 'Taylor (1948), clays', 'k', 'k0 * 10 ^ (-(e0 - e) / Ck)', [['k0', '$k$ at $e0$', 'cm/s'], ['e0', 'in-situ void ratio', '–'], ['e', 'void ratio', '–'], ['Ck', 'permeability change index, $Ck ~ 0.5 e0$', '–']], '$Ck ~ 0.5 e0$ (Tavenas et al. 1983).', 'Natural clays, $e0$ < about 2.5.', { k0: 1e-7, e0: 1.5, e: 1.2, Ck: 0.75 }, 'cm/s', 'empirical cohesive'),
    F('f-sam', 7, 'Samarasinghe et al. (1982), NC clays', 'k', 'C3 * e ^ nexp / (1 + e)', [['C3', 'soil constant', 'cm/s'], ['nexp', 'soil exponent $n$', '–'], ve], 'Constants from tests.', 'Normally consolidated clays.', { C3: 5e-7, nexp: 4, e: 1.1 }, 'cm/s', 'empirical cohesive'),
    F('f-kh', 7, 'Equivalent $k$, flow parallel to layers', 'kHeq', '(kH1 * H1 + kH2 * H2) / (H1 + H2)', [['$kH1$, $kH2$', 'horizontal hydraulic conductivities of the layers', 'cm/s'], ['$H1$, $H2$', 'layer thicknesses', 'm']], 'Same gradient in all layers; flows add. The sums extend to $n$ layers: $kHeq = (kH1 H1 + kH2 H2 + … + kH_n H_n) / H$.', 'Horizontal flow in horizontal strata.', { kH1: 0.01, H1: 1, kH2: 1e-5, H2: 2 }, 'cm/s', 'layered stratified anisotropy'),
    F('f-kv', 7, 'Equivalent $k$, flow perpendicular to layers', 'kVeq', '(H1 + H2) / (H1 / kV1 + H2 / kV2)', [['$kV1$, $kV2$', 'vertical hydraulic conductivities of the layers', 'cm/s'], ['$H1$, $H2$', 'layer thicknesses', 'm']], 'Same discharge velocity in all layers; head losses add. The sums extend to $n$ layers: $kVeq = H / (H1 / kV1 + H2 / kV2 + … + H_n / kV_n)$.', 'Vertical flow in horizontal strata.', { kV1: 0.01, H1: 1, kV2: 1e-5, H2: 2 }, 'cm/s', 'layered stratified anisotropy'),
    F('f-pu', 7, 'Pumping test — unconfined aquifer', 'k', '2.303 * q * log10(r1 / r2) / (pi * (h1 ^ 2 - h2 ^ 2))', [['q', 'pumping rate', 'm³/s'], ['$r1$, $r2$', 'radii of observation wells', 'm'], ['$h1$, $h2$', 'water levels above impermeable base', 'm']], 'Steady state; fully penetrating well; Dupuit assumptions.', 'Unconfined (water-table) aquifers.', { q: 0.01, r1: 50, r2: 15, h1: 6, h2: 5.4 }, 'm/s', 'field well'),
    F('f-pc', 7, 'Pumping test — confined aquifer', 'k', 'q * log10(r1 / r2) / (2.727 * H * (h1 - h2))', [['q', 'pumping rate', 'm³/s'], ['H', 'aquifer thickness', 'm'], ['$r1$, $r2$', 'radii of observation wells', 'm'], ['$h1$, $h2$', 'piezometric levels', 'm']], 'Steady state; aquifer remains confined.', 'Confined aquifers.', { q: 0.01, r1: 50, r2: 15, h1: 10.5, h2: 10, H: 4 }, 'm/s', 'field well')
  ];

  var GLOSSARY = [
    ['Phase diagram', 'An idealised sketch that separates a soil element into solids, water and air, with volumes on one side and weights on the other.'],
    ['Solids', 'The mineral (or organic) grains forming the soil skeleton.'],
    ['Voids', 'The spaces between solid grains, filled with water, air or both.'],
    ['Water content (moisture content), $w$', 'Ratio of weight of water to weight of solids, $w = Ww / Ws$. May exceed 100 %.'],
    ['Void ratio, $e$', 'Ratio of volume of voids to volume of solids, $e = Vv / Vs$. May exceed 1.'],
    ['Porosity, $n$', 'Ratio of volume of voids to total volume, $n = Vv / V$; always below 1.'],
    ['Degree of saturation, $S$', 'Ratio of volume of water to volume of voids, $S = Vw / Vv$; between 0 and 100 %.'],
    ['Specific gravity of solids, $Gs$', 'Unit weight of the solid material divided by the unit weight of water, $Gs = gs / gw$.'],
    ['Moist (bulk) unit weight, $g$', 'Total weight per total volume, $g = W / V$.'],
    ['Dry unit weight, $gd$', 'Weight of solids per total volume, $gd = Ws / V$.'],
    ['Saturated unit weight, $gsat$', 'Unit weight when all voids are filled with water.'],
    ['Submerged (effective, buoyant) unit weight, $gsub$', '$gsub = gsat - gw$; the effective unit weight of soil below the water table.'],
    ['Density, $rho$', 'Mass per unit volume (kg/m³, g/cm³); unit weight is $g = rho grav$.'],
    ['Unit weight, $g$', 'Weight per unit volume (kN/m³, lb/ft³).'],
    ['Mass', 'Quantity of matter (kg, g); measured by a balance.'],
    ['Weight', 'Gravitational force on a mass, $W = M grav$ (N, kN, lb).'],
    ['Oven-dry', 'Dried at 105–110 °C to constant mass; defines the mass of solids.'],
    ['Relative density, $Dr$', '$Dr = (emax - e) / (emax - emin)$; indicates the compactness of a granular soil relative to its loosest and densest states.'],
    ['Maximum void ratio, $emax$', 'Void ratio in the loosest state achievable by a standard procedure (e.g. loose pouring).'],
    ['Minimum void ratio, $emin$', 'Void ratio in the densest state achievable by a standard procedure (e.g. vibration).'],
    ['Relative compaction, $Rc$', 'Field dry unit weight divided by the maximum dry unit weight from a laboratory compaction test, $Rc = gdfield / gdlab$.'],
    ['Angularity', 'Sharpness of grain edges and corners; angular grains interlock and pack with larger voids than rounded grains.'],
    ['Gradation', 'Distribution of grain sizes; well-graded soils contain a wide range and pack densely.'],
    ['Uniformity coefficient, $Cu$', '$Cu = D60 / D10$; larger $Cu$ means a wider range of grain sizes.'],
    ['Effective size, $D10$', 'Grain diameter for which 10 % of the soil (by mass) is finer.'],
    ['Fines', 'Particles passing the No. 200 (0.075 mm) sieve — silt and clay.'],
    ['Permeability', 'The property of a porous material that allows fluid to flow through its interconnected voids.'],
    ['Hydraulic conductivity, $k$', 'Discharge velocity per unit hydraulic gradient for water; units of velocity. Depends on soil and fluid.'],
    ['Absolute (intrinsic) permeability, $Kbar$', 'Permeability depending only on pore geometry; units of area. $k = (gw / eta) Kbar$.'],
    ['Darcy (unit)', 'Unit of absolute permeability; 1 darcy ≈ 0.987 × $10^{-8}$ cm².'],
    ['Dynamic viscosity, $eta$', 'A fluid’s resistance to shearing flow (Pa·s). Water: about 1.0 × $10^{-3}$ Pa·s at 20 °C.'],
    ['Elevation head, $Z$', 'Height of a point above a chosen datum.'],
    ['Pressure head, $hp$', '$hp = u / gw$; height to which water rises in a piezometer above the point.'],
    ['Velocity head', '$v^2 / 2 grav$; negligible for seepage in soils.'],
    ['Total head, $h$', 'Sum of elevation, pressure (and velocity) heads, $h = u / gw + Z$ in soils; water flows from higher to lower total head.'],
    ['Piezometer', 'A tube or sensor that measures pore water pressure (pressure head) at a point.'],
    ['Datum', 'The reference elevation for elevation head; any level can be chosen if used consistently.'],
    ['Head loss, $Dh$', 'Decrease in total head between two points due to friction in the flow.'],
    ['Hydraulic gradient, $i$', 'Head loss per unit length of flow path, $i = Dh / L$ (dimensionless).'],
    ['Darcy’s law', '$v = k i$: discharge velocity is proportional to hydraulic gradient (laminar flow).'],
    ['Laminar flow', 'Smooth flow in parallel paths; required for Darcy’s law.'],
    ['Turbulent flow', 'Irregular, mixing flow at high velocity; Darcy’s law no longer applies.'],
    ['Reynolds number, $Re$', '$Re = v D rho / eta$; dimensionless indicator of laminar versus turbulent flow.'],
    ['Discharge rate, $q$', 'Volume of water flowing per unit time (cm³/s, m³/s).'],
    ['Discharge velocity, $v$', '$v = q / A$, flow per unit total cross-sectional area (superficial velocity).'],
    ['Seepage velocity, $vs$', '$vs = v / n$, average velocity of water through the voids.'],
    ['Constant-head test', 'Lab test keeping a constant head difference across a specimen and measuring flow volume; for coarse soils.'],
    ['Falling-head test', 'Lab test measuring the falling level in a standpipe; for fine-grained soils.'],
    ['Standpipe', 'Narrow tube supplying water to a falling-head specimen; area $a$.'],
    ['Stratified (layered) soil', 'Soil deposit consisting of layers with different properties.'],
    ['Anisotropy', 'Direction-dependent properties; e.g. $kH != kV$.'],
    ['Equivalent hydraulic conductivity', 'Single $k$ that gives the same flow through a layered system as the actual layers ($kHeq$ for flow along the layers, $kVeq$ for flow across them).'],
    ['Aquifer', 'A permeable layer that stores and transmits groundwater.'],
    ['Unconfined aquifer', 'An aquifer whose upper boundary is the free water table.'],
    ['Confined aquifer', 'An aquifer bounded above and below by low-permeability layers; water is under pressure.'],
    ['Observation well', 'Well used to measure water level at a known radius from a pumping well.'],
    ['Drawdown', 'Lowering of the water table or piezometric surface caused by pumping.'],
    ['Auger-hole test', 'Field test measuring the rate of water rise in a bailed auger hole below the water table to determine $k$.'],
    ['Optimum moisture content', 'Water content giving maximum dry unit weight for a given compactive effort (Chapter 6).'],
    ['Line of optimums', 'Curve joining the peaks of compaction curves for different efforts.'],
    ['Clay liner', 'Compacted clay barrier with very low $k$ (commonly ≤ 1 × $10^{-7}$ cm/s) used in landfills and ponds.'],
    ['Acceptable zone', 'Region of the $w$–$gd$ plot whose compaction conditions meet liner criteria ($k$, strength, shrinkage).'],
    ['Flocculated structure', 'Edge-to-face particle arrangement; open fabric, higher $k$ (compacted dry of optimum).'],
    ['Dispersed structure', 'Parallel particle arrangement; lower $k$ (compacted wet of optimum).']
  ];

  SM.formulas = FORMULAS;
  SM.glossary = GLOSSARY.map(function (g) { return { term: g[0], def: g[1] }; });
})(typeof window !== 'undefined' ? window : globalThis);
