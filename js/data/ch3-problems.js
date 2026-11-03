/* Chapter 3 — Weight–volume relationships: original problem templates.
 * generate(r, sys, S) returns a spec; inputs are rounded BEFORE answers are computed,
 * so students working from the displayed data reproduce the answers exactly. */
(function (root) {
  'use strict';
  var SM = root.SM;
  var U = SM.units;
  var GS = [2.65, 2.66, 2.67, 2.68, 2.69, 2.70, 2.71, 2.72, 2.74];

  function GW(S) { return [{ sym: 'gw', value: S.gw, unit: S.gwUnit, label: 'unit weight of water' }]; }
  function US(sys) { return sys === 'SI' ? { V: 'm³', F: 'kN', uw: 'kN/m³' } : { V: 'ft³', F: 'lb', uw: 'lb/ft³' }; }
  var rs = U.roundSig;

  var MS = {
    wTotal: 'You divided by the total (moist) weight. Water content is w = Ww/Ws — the denominator is the weight of SOLIDS (oven-dry), not the total.',
    eAsN: 'That value is the porosity n = Vv/V. Void ratio uses the volume of SOLIDS: e = Vv/Vs (and e = n/(1 − n)).',
    nAsE: 'That value is the void ratio e = Vv/Vs. Porosity divides by the TOTAL volume: n = Vv/V = e/(1 + e).',
    wAsS: 'Water content (w = Ww/Ws, by weight) and degree of saturation (S = Vw/Vv, by volume) are different quantities. Use Se = wGs to convert.',
    gdTimes: 'You multiplied by (1 + w). Drying removes water, so the dry unit weight is SMALLER: γd = γ/(1 + w).',
    gTimes: 'You divided by (1 + w). The moist unit weight includes the water, so it is LARGER: γ = γd(1 + w).',
    satForMoist: 'You used the saturated unit weight. Unless S = 100 %, the moist unit weight uses the actual S: γ = (Gs + Se)γw/(1 + e).',
    subNoGw: 'The submerged unit weight subtracts γw: γ′ = γsat − γw (buoyancy).'
  };

  function phaseSketch(st, u, known, mass) {
    return { type: 'phase', vals: st, units: u, known: known, mass: !!mass };
  }

  var T = [];

  /* 1. Moist and oven-dried sample */
  T.push({ id: 'c3-moist-oven', chapter: 3, topic: 'unit-weights', difficulty: 2, method: 'Lab masses → w, γ, γd, then e, n, S from Gs',
    title: 'Moist and oven-dried sample',
    generate: function (r, sys, S) {
      var Gs = r.pick(GS), e = r.range(0.5, 1.0, 2), Sat = r.range(0.45, 0.95, 2);
      if (sys === 'SI') {
        var V = r.int(85, 110) * 10; // cm³
        var Vs = V / (1 + e), Ms = U.roundTo(Gs * Vs, 1), Mw = Sat * e * Vs, M = U.roundTo(Ms + Mw, 1);
        return {
          text: 'A moist soil specimen with a volume of ' + V + ' cm³ has a mass of ' + M + ' g. After oven-drying at 105–110 °C its mass is ' + Ms + ' g. The specific gravity of soil solids is ' + Gs.toFixed(2) + '. Determine the water content, moist and dry unit weights, void ratio, porosity, and degree of saturation.',
          constants: GW(S).concat([{ sym: 'grav', value: 9.81, unit: 'm/s²', label: 'gravity' }]),
          given: [{ sym: 'V', label: 'Volume', value: V, unit: 'cm³', sig: 3 }, { sym: 'M', label: 'Moist mass', value: M, unit: 'g', sig: 4 },
                  { sym: 'Md', label: 'Oven-dry mass', value: Ms, unit: 'g', sig: 4 }, { sym: 'Gs', label: 'Specific gravity', value: Gs, unit: '', sig: 3 }],
          sketch: phaseSketch({ V: V, Vs: Vs, Vw: Mw, Va: e * Vs - Mw, W: M, Ws: Ms, Ww: M - Ms }, { V: 'cm³', F: 'g' }, ['V', 'W', 'Ws'], true),
          assumptions: ['Mass of air is negligible.', 'Oven-drying removes all pore water and nothing else.', 'Density of water ρw = 1 g/cm³.'],
          parts: [
            { sym: 'w', label: 'Water content', expr: '(M - Md) / Md', unit: '%', why: 'Water content is the ratio of water mass to SOLIDS mass; the mass lost in the oven is the water.', mistakes: [{ expr: '(M - Md) / M', msg: MS.wTotal, tag: 'w-definition' }] },
            { sym: 'rho', label: 'Moist density', expr: 'M / V', unit: 'g/cm³', why: 'Density = mass/volume. Note 1 g/cm³ = 1 Mg/m³.' },
            { sym: 'g', label: 'Moist unit weight', expr: 'rho * grav', unit: 'kN/m³', why: 'Unit weight = density × g. With ρ in Mg/m³ and g = 9.81 m/s², γ comes out in kN/m³.', mistakes: [{ expr: 'rho', msg: 'That is the density (a mass per volume). Unit weight is a WEIGHT per volume: multiply by g = 9.81 m/s².', tag: 'mass-weight' }] },
            { sym: 'gd', label: 'Dry unit weight', expr: 'g / (1 + w)', unit: 'kN/m³', why: 'Removing the water leaves the solids in the same total volume: γd = γ/(1 + w).', mistakes: [{ expr: 'g * (1 + w)', msg: MS.gdTimes, tag: 'unit-weight-choice' }] },
            { sym: 'e', label: 'Void ratio', expr: 'Gs * gw / gd - 1', unit: '', why: 'From γd = Gsγw/(1 + e), rearranged for e.', mistakes: [{ expr: '(Gs * gw / gd - 1) / (Gs * gw / gd)', msg: MS.eAsN, tag: 'e-vs-n' }] },
            { sym: 'n', label: 'Porosity', expr: 'e / (1 + e)', unit: '%', why: 'n = Vv/V. With Vs = 1, Vv = e and V = 1 + e.', mistakes: [{ expr: 'e', msg: MS.nAsE, tag: 'e-vs-n' }] },
            { sym: 'S', label: 'Degree of saturation', expr: 'w * Gs / e', unit: '%', why: 'Se = wGs, so S = wGs/e.', mistakes: [{ expr: 'w', msg: MS.wAsS, tag: 'w-vs-S' }] }
          ],
          check: ['0 < S ≤ 100 % ✓ (a value above 100 % would mean an error in the masses or Gs).', 'γd < γ, and both lie in the typical 13–22 kN/m³ range for soils.', 'n is between 0 and 1 and n < e, as it must be.'],
          interpret: 'The soil is partly saturated: the voids hold both water and air. The void ratio describes how loosely the solids are packed, independent of how much water is present.'
        };
      }
      var V2 = 1 / 30; var Vs2 = V2 / (1 + e); var Ws2 = U.roundTo(Gs * 62.4 * Vs2, 3); var W2 = U.roundTo(Ws2 + Sat * e * Vs2 * 62.4, 3);
      return {
        text: 'A moist soil sample fills a 1/30-ft³ mold and weighs ' + W2 + ' lb. After oven-drying, it weighs ' + Ws2 + ' lb. Gs = ' + Gs.toFixed(2) + '. Determine the water content, moist and dry unit weights, void ratio, porosity, and degree of saturation.',
        constants: GW(S),
        given: [{ sym: 'V', label: 'Volume', value: V2, unit: 'ft³', sig: 4 }, { sym: 'W', label: 'Moist weight', value: W2, unit: 'lb', sig: 4 },
                { sym: 'Ws', label: 'Oven-dry weight', value: Ws2, unit: 'lb', sig: 4 }, { sym: 'Gs', label: 'Specific gravity', value: Gs, unit: '', sig: 3 }],
        sketch: phaseSketch(SM.phase.stateFrom(Gs, e, Sat, Vs2, 62.4), { V: 'ft³', F: 'lb' }, ['V', 'W', 'Ws']),
        assumptions: ['Weight of air is negligible.', 'Oven-drying removes all pore water.'],
        parts: [
          { sym: 'w', label: 'Water content', expr: '(W - Ws) / Ws', unit: '%', why: 'w = Ww/Ws; the weight lost in the oven is the water.', mistakes: [{ expr: '(W - Ws) / W', msg: MS.wTotal, tag: 'w-definition' }] },
          { sym: 'g', label: 'Moist unit weight', expr: 'W / V', unit: 'lb/ft³', why: 'γ = W/V.' },
          { sym: 'gd', label: 'Dry unit weight', expr: 'Ws / V', unit: 'lb/ft³', why: 'γd = Ws/V (solids weight over the same total volume).', mistakes: [{ expr: 'g * (1 + w)', msg: MS.gdTimes, tag: 'unit-weight-choice' }] },
          { sym: 'e', label: 'Void ratio', expr: 'Gs * gw / gd - 1', unit: '', why: 'From γd = Gsγw/(1 + e).', mistakes: [{ expr: '1 - gd / (Gs * gw)', msg: MS.eAsN, tag: 'e-vs-n' }] },
          { sym: 'n', label: 'Porosity', expr: 'e / (1 + e)', unit: '%', why: 'n = e/(1 + e).', mistakes: [{ expr: 'e', msg: MS.nAsE, tag: 'e-vs-n' }] },
          { sym: 'S', label: 'Degree of saturation', expr: 'w * Gs / e', unit: '%', why: 'Se = wGs.', mistakes: [{ expr: 'w', msg: MS.wAsS, tag: 'w-vs-S' }] }
        ],
        check: ['S between 0 and 100 % ✓', 'γd < γ; typical soils are about 85–140 lb/ft³.'],
        interpret: 'The voids contain both water and air (partly saturated soil).'
      };
    } });

  /* 2. Cylindrical specimen dimensions */
  T.push({ id: 'c3-cylinder', chapter: 3, topic: 'unit-weights', difficulty: 2, method: 'Specimen dimensions → V; then γ, γd, e, S',
    title: 'Cylindrical specimen from a tube sample',
    generate: function (r, sys, S) {
      var Gs = r.pick(GS), e = r.range(0.55, 1.1, 2), Sat = r.range(0.6, 0.98, 2);
      var D = r.pick([38, 50, 63.5, 71, 76]), H = U.roundTo(D * r.range(1.9, 2.2), 1); // mm
      var V = Math.PI * D * D / 4 * H / 1000; // cm³
      var Vs = V / (1 + e), Ms = Gs * Vs, M = U.roundTo(Ms + Sat * e * Vs, 1), w = U.roundTo(Sat * e / Gs, 3);
      return {
        text: 'A cylindrical undisturbed specimen trimmed from a tube sample is ' + D + ' mm in diameter and ' + H + ' mm high. Its moist mass is ' + M + ' g and its water content is ' + U.fmt(w * 100, 3) + ' %. Gs = ' + Gs.toFixed(2) + '. Find the volume, moist and dry unit weights, void ratio, and degree of saturation.',
        constants: GW(S).concat([{ sym: 'grav', value: 9.81, unit: 'm/s²', label: 'gravity' }]),
        given: [{ sym: 'dia', label: 'Diameter', value: D / 10, unit: 'cm', sig: 4 }, { sym: 'H', label: 'Height', value: H / 10, unit: 'cm', sig: 4 },
                { sym: 'M', label: 'Moist mass', value: M, unit: 'g', sig: 4 }, { sym: 'w', label: 'Water content', value: w, unit: '%', sig: 3 },
                { sym: 'Gs', label: 'Specific gravity', value: Gs, unit: '', sig: 3 }],
        sketch: { type: 'cylinder', D: D / 10, H: H / 10, unit: 'cm' },
        assumptions: ['Specimen is a right circular cylinder (dimensions converted to cm so that V is in cm³).', 'ρw = 1 g/cm³; 1 g/cm³ = 1 Mg/m³.'],
        parts: [
          { sym: 'V', label: 'Volume', expr: 'pi * dia ^ 2 / 4 * H', unit: 'cm³', why: 'Volume of a cylinder = (πD²/4)·H. Convert mm to cm first (÷10).', mistakes: [{ expr: 'pi * dia ^ 2 * H', msg: 'You used πD²·H. The area of a circle is πD²/4 (or πr²).', tag: 'area' }] },
          { sym: 'rho', label: 'Moist density', expr: 'M / V', unit: 'g/cm³', why: 'ρ = M/V.' },
          { sym: 'g', label: 'Moist unit weight', expr: 'rho * grav', unit: 'kN/m³', why: 'γ = ρg; ρ in Mg/m³ (= g/cm³) times 9.81 m/s² gives kN/m³.', mistakes: [{ expr: 'rho', msg: 'That is density. Multiply by g = 9.81 m/s² to get unit weight.', tag: 'mass-weight' }] },
          { sym: 'gd', label: 'Dry unit weight', expr: 'g / (1 + w)', unit: 'kN/m³', why: 'γd = γ/(1 + w).', mistakes: [{ expr: 'g * (1 + w)', msg: MS.gdTimes, tag: 'unit-weight-choice' }, { expr: 'g / (1 + w * 100)', msg: 'You used w as a percentage number inside (1 + w). Convert to a decimal first (e.g. 18 % → 0.18).', tag: 'percent' }] },
          { sym: 'e', label: 'Void ratio', expr: 'Gs * gw / gd - 1', unit: '', why: 'Rearranged from γd = Gsγw/(1 + e).' },
          { sym: 'S', label: 'Degree of saturation', expr: 'w * Gs / e', unit: '%', why: 'Se = wGs.', mistakes: [{ expr: 'w', msg: MS.wAsS, tag: 'w-vs-S' }] }
        ],
        check: ['S ≤ 100 % ✓', 'Dimensions: (g/cm³)(m/s²) = (Mg/m³)(m/s²) = kN/m³ ✓'],
        interpret: 'A tube sample gives the in-situ state: these unit weights would be used for stress calculations in the field.'
      };
    } });

  /* 3. Lab water content from container masses */
  T.push({ id: 'c3-water-content-lab', chapter: 3, topic: 'water-content', difficulty: 1, method: 'Container masses → water content',
    title: 'Water content from container masses',
    generate: function (r, sys, S) {
      var M1 = U.roundTo(r.range(14, 42), 2), Ms = U.roundTo(r.range(40, 160), 2), w = r.range(0.08, 0.6);
      var M3 = U.roundTo(M1 + Ms, 2), M2 = U.roundTo(M3 + w * Ms, 2);
      return {
        text: 'For a water-content determination: empty container = ' + M1 + ' g; container + moist soil = ' + M2 + ' g; container + oven-dry soil = ' + M3 + ' g. Find the mass of water, mass of dry soil, and water content.',
        given: [{ sym: 'M1', label: 'Container', value: M1, unit: 'g', sig: 4 }, { sym: 'M2', label: 'Container + moist soil', value: M2, unit: 'g', sig: 5 }, { sym: 'M3', label: 'Container + dry soil', value: M3, unit: 'g', sig: 5 }],
        assumptions: ['Oven-drying removes all pore water.'],
        parts: [
          { sym: 'Mw', label: 'Mass of water', expr: 'M2 - M3', unit: 'g', why: 'Mass lost during drying = water.' },
          { sym: 'Ms', label: 'Mass of dry soil', expr: 'M3 - M1', unit: 'g', why: 'Subtract the container from the dry total.', mistakes: [{ expr: 'M2 - M1', msg: 'That is the MOIST soil mass. The solids mass comes from the oven-dry reading: M3 − M1.', tag: 'w-definition' }] },
          { sym: 'w', label: 'Water content', expr: 'Mw / Ms', unit: '%', why: 'w = Mw/Ms.', mistakes: [{ expr: 'Mw / (M2 - M1)', msg: MS.wTotal, tag: 'w-definition' }, { expr: 'Mw / (M3)', msg: 'You divided by the container + dry soil. Subtract the container mass first.', tag: 'w-definition' }] }
        ],
        check: ['Mw > 0 and Ms > 0 ✓', 'w can exceed 100 % in soft clays — that is physically valid.'],
        interpret: 'Water content is always referenced to the dry solids, which do not change mass when the soil wets or dries.'
      };
    } });

  /* 4. Void ratio <-> porosity conversion */
  T.push({ id: 'c3-e-n', chapter: 3, topic: 'void-ratio-porosity', difficulty: 1, method: 'e ↔ n conversion',
    title: 'Void ratio and porosity conversion',
    generate: function (r) {
      var e = r.range(0.35, 1.6, 2), n2 = r.range(0.28, 0.6, 2);
      return {
        text: 'A soil has a void ratio of ' + e.toFixed(2) + '. (a) Find its porosity. (b) A second soil has a porosity of ' + Math.round(n2 * 100) + ' %. Find its void ratio.',
        given: [{ sym: 'e', label: 'Void ratio of soil 1', value: e, unit: '', sig: 3 }, { sym: 'n2', label: 'Porosity of soil 2', value: n2, unit: '%', sig: 2 }],
        sketch: { type: 'phaseNorm', e: e },
        assumptions: ['Take Vs = 1 for soil 1 (then Vv = e, V = 1 + e) and V = 1 for soil 2 (then Vv = n, Vs = 1 − n).'],
        parts: [
          { sym: 'n', label: 'Porosity of soil 1', expr: 'e / (1 + e)', unit: '%', why: 'With Vs = 1: Vv = e and V = 1 + e, so n = Vv/V = e/(1 + e).', mistakes: [{ expr: 'e / (1 - e)', msg: 'n = e/(1 + e), not e/(1 − e). Draw the phase diagram with Vs = 1 to check.', tag: 'e-vs-n' }] },
          { sym: 'e2', label: 'Void ratio of soil 2', expr: 'n2 / (1 - n2)', unit: '', why: 'With V = 1: Vv = n and Vs = 1 − n, so e = n/(1 − n).', mistakes: [{ expr: 'n2 / (1 + n2)', msg: 'e = n/(1 − n). Using (1 + n) treats porosity as if it were void ratio.', tag: 'e-vs-n' }, { expr: 'n2 * 100 / (1 - n2)', msg: 'Use the porosity as a decimal (e.g. 40 % → 0.40).', tag: 'percent' }] }
        ],
        check: ['n is always less than e (for e > 0) and less than 1 ✓', 'e may exceed 1 — that is valid (voids larger than solids).'],
        interpret: 'Void ratio and porosity describe the same packing; e is preferred in calculations because Vs stays constant when the soil compresses.'
      };
    } });

  /* 5. Dry unit weight from Gs and e */
  T.push({ id: 'c3-gd-Gs-e', chapter: 3, topic: 'unit-weights', difficulty: 1, method: 'γd = Gsγw/(1+e)',
    title: 'Dry unit weight from Gs and e',
    generate: function (r, sys, S) {
      var Gs = r.pick(GS), e = r.range(0.4, 1.2, 2), u = US(sys);
      return {
        text: 'A soil has Gs = ' + Gs.toFixed(2) + ' and void ratio e = ' + e.toFixed(2) + '. Find the dry unit weight and the porosity.',
        constants: GW(S), given: [{ sym: 'Gs', label: 'Gs', value: Gs, unit: '', sig: 3 }, { sym: 'e', label: 'Void ratio', value: e, unit: '', sig: 3 }],
        sketch: { type: 'phaseNorm', e: e, Gs: Gs, S: 0 },
        assumptions: ['Take Vs = 1: then Ws = Gsγw and V = 1 + e.'],
        parts: [
          { sym: 'gd', label: 'Dry unit weight', expr: 'Gs * gw / (1 + e)', unit: u.uw, why: 'γd = Ws/V = Gsγw/(1 + e) from the Vs = 1 phase diagram.', mistakes: [{ expr: 'Gs * gw / e', msg: 'Divide by the TOTAL volume (1 + e), not by Vv = e.', tag: 'phase-derivation' }, { expr: '(Gs + e) * gw / (1 + e)', msg: 'That is the SATURATED unit weight. Dry soil has no water weight: γd = Gsγw/(1 + e).', tag: 'unit-weight-choice' }] },
          { sym: 'n', label: 'Porosity', expr: 'e / (1 + e)', unit: '%', why: 'n = e/(1 + e).', mistakes: [{ expr: 'e', msg: MS.nAsE, tag: 'e-vs-n' }] }
        ],
        check: ['γd < Gsγw (solids alone) ✓', 'Units of γd equal the units of γw ✓'],
        interpret: 'A larger void ratio means fewer solids per unit volume and a lower dry unit weight.'
      };
    } });

  /* 6. Saturated soil from w and Gs */
  T.push({ id: 'c3-saturated-w', chapter: 3, topic: 'unit-weights', difficulty: 2, method: 'S = 1: e = wGs, γsat, γ′',
    title: 'Saturated clay from water content',
    generate: function (r, sys, S) {
      var Gs = r.pick([2.68, 2.70, 2.72, 2.74, 2.75]), w = r.range(0.25, 0.9, 3), u = US(sys);
      return {
        text: 'A saturated clay below the water table has a water content of ' + U.fmt(w * 100, 3) + ' % and Gs = ' + Gs.toFixed(2) + '. Determine the void ratio, saturated unit weight and submerged (effective) unit weight.',
        constants: GW(S), given: [{ sym: 'w', label: 'Water content', value: w, unit: '%', sig: 3 }, { sym: 'Gs', label: 'Gs', value: Gs, unit: '', sig: 3 }],
        sketch: { type: 'phaseNorm', e: w * Gs, Gs: Gs, S: 1 },
        assumptions: ['Fully saturated: S = 1 (100 %).'],
        parts: [
          { sym: 'e', label: 'Void ratio', expr: 'w * Gs', unit: '', why: 'Se = wGs with S = 1 gives e = wGs.', mistakes: [{ expr: 'w * 100 * Gs', msg: 'Use w as a decimal in Se = wGs.', tag: 'percent' }, { expr: 'w / Gs', msg: 'e = wGs/S — multiply by Gs.', tag: 'phase-derivation' }] },
          { sym: 'gsat', label: 'Saturated unit weight', expr: '(Gs + e) * gw / (1 + e)', unit: u.uw, why: 'With Vs = 1: W = Gsγw + eγw and V = 1 + e.', mistakes: [{ expr: 'Gs * gw / (1 + e)', msg: 'That is the DRY unit weight. Saturated soil includes the water: (Gs + e)γw/(1 + e).', tag: 'unit-weight-choice' }] },
          { sym: 'gsub', label: 'Submerged unit weight', expr: 'gsat - gw', unit: u.uw, why: 'Buoyancy reduces the effective weight below the water table: γ′ = γsat − γw.', mistakes: [{ expr: 'gsat', msg: MS.subNoGw, tag: 'unit-weight-choice' }] }
        ],
        check: ['γ′ is roughly half of γsat for typical soils ✓', 'e > 1 is possible for soft clays with high w.'],
        interpret: 'γ′ is the unit weight used to compute effective stresses below the water table.'
      };
    } });

  /* 7. Degree of saturation from w, Gs, e */
  T.push({ id: 'c3-S-from-w', chapter: 3, topic: 'saturation', difficulty: 1, method: 'S = wGs/e',
    title: 'Degree of saturation from Se = wGs',
    generate: function (r) {
      var Gs = r.pick(GS), e = r.range(0.5, 1.1, 2), Sat = r.range(0.3, 0.95), w = U.roundTo(Sat * e / Gs, 3);
      return {
        text: 'A soil sample has void ratio ' + e.toFixed(2) + ', water content ' + U.fmt(w * 100, 3) + ' %, and Gs = ' + Gs.toFixed(2) + '. Find the degree of saturation and the water content that would make it fully saturated (same void ratio).',
        given: [{ sym: 'e', label: 'Void ratio', value: e, unit: '', sig: 3 }, { sym: 'w', label: 'Water content', value: w, unit: '%', sig: 3 }, { sym: 'Gs', label: 'Gs', value: Gs, unit: '', sig: 3 }],
        sketch: { type: 'phaseNorm', e: e, Gs: Gs, S: w * Gs / e },
        assumptions: ['Void ratio does not change (solids skeleton is unchanged).'],
        parts: [
          { sym: 'S', label: 'Degree of saturation', expr: 'w * Gs / e', unit: '%', why: 'Se = wGs → S = wGs/e.', mistakes: [{ expr: 'w', msg: MS.wAsS, tag: 'w-vs-S' }, { expr: 'w * e / Gs', msg: 'Rearrange Se = wGs carefully: S = wGs/e.', tag: 'rearrange' }] },
          { sym: 'wsat', label: 'Water content at S = 100 %', expr: 'e / Gs', unit: '%', why: 'With S = 1 and the same e: w = e/Gs.' }
        ],
        check: ['S ≤ 100 % ✓', 'wsat > w because more water fits only until the voids are full ✓'],
        interpret: 'With e fixed, water content can increase only until S = 100 %; beyond that the soil would have to swell (e increase).'
      };
    } });

  /* 8. Moist unit weight from w, Gs, S */
  T.push({ id: 'c3-moist-from-wGsS', chapter: 3, topic: 'unit-weights', difficulty: 2, method: 'e = wGs/S, then γ = (1+w)Gsγw/(1+e)',
    title: 'Moist unit weight from w, Gs and S',
    generate: function (r, sys, S) {
      var Gs = r.pick(GS), Sat = r.range(0.5, 0.95, 2), w = U.roundTo(Sat * r.range(0.5, 1.0) / Gs, 3), u = US(sys);
      return {
        text: 'For a soil with w = ' + U.fmt(w * 100, 3) + ' %, Gs = ' + Gs.toFixed(2) + ', and S = ' + Math.round(Sat * 100) + ' %, find the void ratio, moist unit weight and dry unit weight.',
        constants: GW(S), given: [{ sym: 'w', label: 'Water content', value: w, unit: '%', sig: 3 }, { sym: 'Gs', label: 'Gs', value: Gs, unit: '', sig: 3 }, { sym: 'S', label: 'Degree of saturation', value: Sat, unit: '%', sig: 2 }],
        sketch: { type: 'phaseNorm', e: w * Gs / Sat, Gs: Gs, S: Sat },
        assumptions: ['Vs = 1 (any sample size gives the same ratios and unit weights).'],
        parts: [
          { sym: 'e', label: 'Void ratio', expr: 'w * Gs / S', unit: '', why: 'Se = wGs → e = wGs/S.', mistakes: [{ expr: 'w * Gs', msg: 'e = wGs only when S = 1. Here S < 100 %, so divide by S.', tag: 'w-vs-S' }] },
          { sym: 'g', label: 'Moist unit weight', expr: '(1 + w) * Gs * gw / (1 + e)', unit: u.uw, why: 'With Vs = 1: Ws = Gsγw, Ww = wGsγw, V = 1 + e.', mistakes: [{ expr: '(Gs + e) * gw / (1 + e)', msg: MS.satForMoist, tag: 'unit-weight-choice' }] },
          { sym: 'gd', label: 'Dry unit weight', expr: 'g / (1 + w)', unit: u.uw, why: 'γd = γ/(1 + w).', mistakes: [{ expr: 'g * (1 + w)', msg: MS.gdTimes, tag: 'unit-weight-choice' }] }
        ],
        check: ['γd < γ < γsat ✓'], interpret: 'The same soil skeleton has different moist unit weights at different water contents, but the dry unit weight depends only on e and Gs.'
      };
    } });

  /* 9. From moist unit weight and w */
  T.push({ id: 'c3-from-gamma-w', chapter: 3, topic: 'unit-weights', difficulty: 2, method: 'γd = γ/(1+w); then e, n, S',
    title: 'Field unit weight and water content',
    generate: function (r, sys, S) {
      var Gs = r.pick(GS), e = r.range(0.45, 0.9), Sat = r.range(0.4, 0.9), u = US(sys);
      var w = U.roundTo(Sat * e / Gs, 3), g = rs((1 + w) * Gs * S.gw / (1 + e), 4);
      return {
        text: 'A field density test gives a moist unit weight of ' + U.fmt(g, 4) + ' ' + u.uw + ' at a water content of ' + U.fmt(w * 100, 3) + ' %. Gs = ' + Gs.toFixed(2) + '. Find γd, e, n and S.',
        constants: GW(S), given: [{ sym: 'g', label: 'Moist unit weight', value: g, unit: u.uw, sig: 4 }, { sym: 'w', label: 'Water content', value: w, unit: '%', sig: 3 }, { sym: 'Gs', label: 'Gs', value: Gs, unit: '', sig: 3 }],
        sketch: { type: 'phaseNorm', e: e, Gs: Gs, S: Sat },
        assumptions: ['The unit weights are averages over the tested volume.'],
        parts: [
          { sym: 'gd', label: 'Dry unit weight', expr: 'g / (1 + w)', unit: u.uw, why: 'γd = γ/(1 + w).', mistakes: [{ expr: 'g * (1 + w)', msg: MS.gdTimes, tag: 'unit-weight-choice' }, { expr: 'g / (1 + w * 100)', msg: 'Use w as a decimal inside (1 + w).', tag: 'percent' }] },
          { sym: 'e', label: 'Void ratio', expr: 'Gs * gw / gd - 1', unit: '', why: 'From γd = Gsγw/(1 + e).' },
          { sym: 'n', label: 'Porosity', expr: 'e / (1 + e)', unit: '%', why: 'n = e/(1 + e).', mistakes: [{ expr: 'e', msg: MS.nAsE, tag: 'e-vs-n' }] },
          { sym: 'S', label: 'Degree of saturation', expr: 'w * Gs / e', unit: '%', why: 'S = wGs/e.', mistakes: [{ expr: 'w', msg: MS.wAsS, tag: 'w-vs-S' }] }
        ],
        check: ['S ≤ 100 % ✓', 'n < 1 ✓'], interpret: 'The dry unit weight is the quantity used to judge compaction (relative compaction compares field γd with a laboratory maximum).'
      };
    } });

  /* 10. Porosity-based relationship */
  T.push({ id: 'c3-porosity-based', chapter: 3, topic: 'unit-weights', difficulty: 2, method: 'V = 1 diagram: γ = Gsγw(1 − n)(1 + w)',
    title: 'Unit weights from porosity (V = 1 approach)',
    generate: function (r, sys, S) {
      var Gs = r.pick(GS), n = r.range(0.3, 0.55, 2), w = r.range(0.05, 0.2, 3), u = US(sys);
      if (w * Gs * (1 - n) > n) w = U.roundTo(0.8 * n / (Gs * (1 - n)), 3);
      return {
        text: 'A sand has porosity n = ' + Math.round(n * 100) + ' %, Gs = ' + Gs.toFixed(2) + ' and w = ' + U.fmt(w * 100, 3) + ' %. Using a phase diagram with V = 1, find the dry unit weight, moist unit weight and degree of saturation.',
        constants: GW(S), given: [{ sym: 'n', label: 'Porosity', value: n, unit: '%', sig: 2 }, { sym: 'Gs', label: 'Gs', value: Gs, unit: '', sig: 3 }, { sym: 'w', label: 'Water content', value: w, unit: '%', sig: 3 }],
        sketch: { type: 'phaseNorm', e: n / (1 - n), Gs: Gs, S: w * Gs * (1 - n) / n, basis: 'V' },
        assumptions: ['V = 1: Vv = n and Vs = 1 − n.'],
        parts: [
          { sym: 'gd', label: 'Dry unit weight', expr: 'Gs * gw * (1 - n)', unit: u.uw, why: 'With V = 1: Ws = Gsγw(1 − n) and γd = Ws/1.', mistakes: [{ expr: 'Gs * gw * n', msg: 'The solids occupy (1 − n), not n, of the volume.', tag: 'e-vs-n' }] },
          { sym: 'g', label: 'Moist unit weight', expr: 'gd * (1 + w)', unit: u.uw, why: 'Ww = wWs, so W = Ws(1 + w).', mistakes: [{ expr: 'gd / (1 + w)', msg: MS.gTimes, tag: 'unit-weight-choice' }] },
          { sym: 'S', label: 'Degree of saturation', expr: 'w * Gs * (1 - n) / n', unit: '%', why: 'Vw = Ww/γw = wGs(1 − n); S = Vw/Vv = wGs(1 − n)/n.' }
        ],
        check: ['S ≤ 100 % ✓', 'Same answer as using e = n/(1 − n) with the Vs = 1 formulas.'],
        interpret: 'Choosing V = 1 or Vs = 1 is only a convenience: ratios and unit weights do not depend on sample size.'
      };
    } });

  /* 11. Water needed to reach a target saturation */
  T.push({ id: 'c3-water-to-saturate', chapter: 3, topic: 'practical', difficulty: 3, method: 'Constant V and e: ΔVw = (S₂ − S₁)Vv',
    title: 'Water required to reach a specified saturation',
    generate: function (r, sys, S) {
      var Gs = r.pick(GS), e = r.range(0.55, 0.95, 2), S1 = r.range(0.3, 0.6, 2), S2 = r.pick([0.8, 0.85, 0.9, 0.95, 1.0]);
      var V = sys === 'SI' ? r.pick([0.5, 1, 2, 5, 10]) : r.pick([10, 20, 50, 100]);
      var u = US(sys);
      return {
        text: 'A ' + V + ' ' + u.V + ' mass of soil has e = ' + e.toFixed(2) + ', Gs = ' + Gs.toFixed(2) + ' and S = ' + Math.round(S1 * 100) + ' %. How much water (volume and weight) must be added to raise S to ' + Math.round(S2 * 100) + ' % without any change in volume? What is the final water content?',
        constants: GW(S),
        given: [{ sym: 'V', label: 'Total volume', value: V, unit: u.V, sig: 3 }, { sym: 'e', label: 'Void ratio', value: e, unit: '', sig: 3 }, { sym: 'Gs', label: 'Gs', value: Gs, unit: '', sig: 3 },
                { sym: 'S1', label: 'Initial saturation', value: S1, unit: '%', sig: 2 }, { sym: 'S2', label: 'Target saturation', value: S2, unit: '%', sig: 2 }],
        sketch: phaseSketch(SM.phase.stateFrom(Gs, e, S1, V / (1 + e), S.gw), { V: u.V, F: u.F }, ['V']),
        assumptions: ['Total volume and void ratio stay constant (the water only replaces air).', 'Added water fills air voids; S cannot exceed 100 %.'],
        parts: [
          { sym: 'Vv', label: 'Volume of voids', expr: 'e * V / (1 + e)', unit: u.V, why: 'n = e/(1 + e) and Vv = nV.', mistakes: [{ expr: 'e * V', msg: 'e = Vv/Vs, not Vv/V. Use Vv = eV/(1 + e).', tag: 'e-vs-n' }] },
          { sym: 'dVw', label: 'Volume of water to add', expr: '(S2 - S1) * Vv', unit: u.V, why: 'Vw = SVv, so ΔVw = (S₂ − S₁)Vv with Vv unchanged.', mistakes: [{ expr: 'S2 * Vv', msg: 'That is the FINAL water volume. Subtract the water already present (S₁Vv).', tag: 'practical' }] },
          { sym: 'dWw', label: 'Weight of water to add', expr: 'dVw * gw', unit: u.F, why: 'Ww = Vwγw.' },
          { sym: 'w2', label: 'Final water content', expr: 'S2 * e / Gs', unit: '%', why: 'w = Se/Gs at the final state.' }
        ],
        check: ['ΔVw < Va initially available = (1 − S₁)Vv ✓', 'Weight units: volume × unit weight ✓'],
        interpret: 'Because e is fixed, saturation and water content rise in proportion; the soil cannot absorb more than the air-void volume without swelling.'
      };
    } });

  /* 12. Water to add to reach a target water content (mass) */
  T.push({ id: 'c3-water-to-w', chapter: 3, topic: 'practical', difficulty: 2, method: 'ΔMw = Ms(w₂ − w₁), Ms = M/(1 + w₁)',
    title: 'Water to add for a target water content',
    generate: function (r, sys) {
      var Mk = r.pick([5, 8, 10, 12, 15, 20, 25]), w1 = r.range(0.04, 0.1, 3), w2 = U.roundTo(w1 + r.range(0.03, 0.08), 3);
      var mu = sys === 'SI' ? 'kg' : 'lbm'; var M = sys === 'SI' ? Mk : Mk * 2;
      return {
        text: 'A ' + M + ' ' + mu + ' batch of moist soil at w = ' + U.fmt(w1 * 100, 3) + ' % is being prepared for a compaction test at w = ' + U.fmt(w2 * 100, 3) + ' %. How much water must be added? (Answer as mass of water.)',
        given: [{ sym: 'M', label: 'Moist mass', value: M, unit: mu, sig: 3 }, { sym: 'w1', label: 'Current w', value: w1, unit: '%', sig: 3 }, { sym: 'w2', label: 'Target w', value: w2, unit: '%', sig: 3 }],
        assumptions: ['No water evaporates while mixing.', 'Dry solids mass does not change.'],
        parts: [
          { sym: 'Ms', label: 'Dry solids mass', expr: 'M / (1 + w1)', unit: mu, why: 'M = Ms(1 + w), so Ms = M/(1 + w₁).', mistakes: [{ expr: 'M * (1 - w1)', msg: 'Ms = M/(1 + w), not M(1 − w): w is referenced to the dry mass.', tag: 'w-definition' }] },
          { sym: 'dMw', label: 'Mass of water to add', expr: 'Ms * (w2 - w1)', unit: mu, why: 'Water at each state = wMs; the difference is the water to add.', mistakes: [{ expr: 'M * (w2 - w1)', msg: 'Multiply the change in w by the DRY mass Ms, not the moist mass.', tag: 'w-definition' }] }
        ],
        check: ['ΔMw is a small fraction of M ✓'], interpret: 'Water content changes are always computed on the constant dry mass of solids.'
      };
    } });

  /* 13. Relative density from void ratios */
  T.push({ id: 'c3-Dr-e', chapter: 3, topic: 'relative-density', difficulty: 1, method: 'Dr = (emax − e)/(emax − emin)',
    title: 'Relative density from void ratios',
    generate: function (r) {
      var emin = r.range(0.4, 0.6, 2), emax = U.roundTo(emin + r.range(0.25, 0.45), 2), e = U.roundTo(emin + r.range(0.1, 0.9) * (emax - emin), 2);
      return {
        text: 'A sand deposit has emax = ' + emax.toFixed(2) + ' and emin = ' + emin.toFixed(2) + '. Its in-situ void ratio is ' + e.toFixed(2) + '. Find the relative density and describe the state of compactness.',
        given: [{ sym: 'emax', label: 'Maximum void ratio', value: emax, unit: '', sig: 3 }, { sym: 'emin', label: 'Minimum void ratio', value: emin, unit: '', sig: 3 }, { sym: 'e', label: 'In-situ void ratio', value: e, unit: '', sig: 3 }],
        sketch: { type: 'drScale', emax: emax, emin: emin, e: e },
        assumptions: ['emax and emin were determined by standard laboratory procedures on the same sand.'],
        parts: [
          { sym: 'Dr', label: 'Relative density', expr: '(emax - e) / (emax - emin)', unit: '%', why: 'Dr measures how close e is to its densest state: 0 at emax (loosest), 1 at emin (densest).', mistakes: [{ expr: '(e - emin) / (emax - emin)', msg: 'You measured from emin. Dr = (emax − e)/(emax − emin): the loosest state (emax) has Dr = 0.', tag: 'relative-density' }] }
        ],
        check: ['0 ≤ Dr ≤ 100 % because emin ≤ e ≤ emax ✓'],
        interpret: 'Descriptions commonly used (Das): 0–15 % very loose, 15–50 % loose, 50–70 % medium, 70–85 % dense, 85–100 % very dense.'
      };
    } });

  /* 14. Relative density from dry unit weights */
  T.push({ id: 'c3-Dr-gd', chapter: 3, topic: 'relative-density', difficulty: 2, method: 'Dr from γd, γd(min), γd(max)',
    title: 'Relative density from dry unit weights',
    generate: function (r, sys, S) {
      var Gs = r.pick([2.65, 2.66, 2.67]), emin = r.range(0.42, 0.55), emax = emin + r.range(0.28, 0.4), e = emin + r.range(0.2, 0.8) * (emax - emin), u = US(sys);
      var f = function (ee) { return rs(Gs * S.gw / (1 + ee), 4); };
      var gdmax = f(emin), gdmin = f(emax), gd = f(e);
      return {
        text: 'Laboratory tests on a sand give γd(max) = ' + gdmax + ' ' + u.uw + ' and γd(min) = ' + gdmin + ' ' + u.uw + '. The field dry unit weight is ' + gd + ' ' + u.uw + '. Find the relative density.',
        given: [{ sym: 'gdmax', label: 'Max dry unit weight', value: gdmax, unit: u.uw, sig: 4 }, { sym: 'gdmin', label: 'Min dry unit weight', value: gdmin, unit: u.uw, sig: 4 }, { sym: 'gd', label: 'Field dry unit weight', value: gd, unit: u.uw, sig: 4 }],
        assumptions: ['γd(min) corresponds to emax and γd(max) to emin for the same Gs.'],
        parts: [
          { sym: 'Dr', label: 'Relative density', expr: '(gd - gdmin) / (gdmax - gdmin) * gdmax / gd', unit: '%', why: 'Substituting e = Gsγw/γd − 1 into Dr = (emax − e)/(emax − emin) gives Dr = [(γd − γd(min))/(γd(max) − γd(min))]·[γd(max)/γd].', mistakes: [{ expr: '(gd - gdmin) / (gdmax - gdmin)', msg: 'Close, but the dry-unit-weight form needs the extra factor γd(max)/γd because e is inversely (not linearly) related to γd.', tag: 'relative-density' }] }
        ],
        check: ['0 ≤ Dr ≤ 100 % ✓'], interpret: 'Relative density describes compactness of a granular soil relative to its own loosest and densest states.'
      };
    } });

  /* 15. Loose vs dense: layer settlement on densification */
  T.push({ id: 'c3-densify-layer', chapter: 3, topic: 'relative-density', difficulty: 3, method: 'e from Dr; ΔH = H(e₁ − e₂)/(1 + e₁)',
    title: 'Densifying a loose sand layer',
    generate: function (r, sys, S) {
      var Gs = r.pick([2.65, 2.66, 2.67, 2.68]), emin = r.range(0.4, 0.55, 2), emax = U.roundTo(emin + r.range(0.3, 0.4), 2);
      var D1 = r.pick([0.2, 0.25, 0.3, 0.35, 0.4]), D2 = r.pick([0.7, 0.75, 0.8, 0.85]);
      var H = sys === 'SI' ? r.pick([2, 2.5, 3, 4, 5]) : r.pick([6, 8, 10, 12, 15]); var Lu = sys === 'SI' ? 'm' : 'ft'; var u = US(sys);
      return {
        text: 'A ' + H + '-' + Lu + '-thick layer of loose sand (emax = ' + emax.toFixed(2) + ', emin = ' + emin.toFixed(2) + ', Gs = ' + Gs.toFixed(2) + ') has Dr = ' + Math.round(D1 * 100) + ' %. It is densified by vibration to Dr = ' + Math.round(D2 * 100) + ' %. Find the initial and final void ratios, the dry unit weights, and the decrease in layer thickness.',
        constants: GW(S),
        given: [{ sym: 'H', label: 'Initial thickness', value: H, unit: Lu, sig: 3 }, { sym: 'emax', label: 'emax', value: emax, unit: '', sig: 3 }, { sym: 'emin', label: 'emin', value: emin, unit: '', sig: 3 },
                { sym: 'Gs', label: 'Gs', value: Gs, unit: '', sig: 3 }, { sym: 'D1', label: 'Initial Dr', value: D1, unit: '%', sig: 2 }, { sym: 'D2', label: 'Final Dr', value: D2, unit: '%', sig: 2 }],
        sketch: { type: 'drScale', emax: emax, emin: emin, e: emax - D1 * (emax - emin), e2: emax - D2 * (emax - emin) },
        assumptions: ['Lateral dimensions do not change (one-dimensional compression), so volume change = thickness change.', 'Volume of solids is constant.'],
        parts: [
          { sym: 'e1', label: 'Initial void ratio', expr: 'emax - D1 * (emax - emin)', unit: '', why: 'Rearrange Dr = (emax − e)/(emax − emin) for e.' },
          { sym: 'e2', label: 'Final void ratio', expr: 'emax - D2 * (emax - emin)', unit: '', why: 'Same relation at the final Dr.' },
          { sym: 'gd1', label: 'Initial dry unit weight', expr: 'Gs * gw / (1 + e1)', unit: u.uw, why: 'γd = Gsγw/(1 + e).' },
          { sym: 'gd2', label: 'Final dry unit weight', expr: 'Gs * gw / (1 + e2)', unit: u.uw, why: 'γd = Gsγw/(1 + e).' },
          { sym: 'DH', label: 'Decrease in thickness', expr: 'H * (e1 - e2) / (1 + e1)', unit: Lu, why: 'Vs is constant; with unit plan area, H ∝ (1 + e), so ΔH/H = (e₁ − e₂)/(1 + e₁).', mistakes: [{ expr: 'H * (e1 - e2)', msg: 'Divide by (1 + e₁): the layer thickness corresponds to 1 + e, not to 1.', tag: 'phase-derivation' }, { expr: 'H * (e1 - e2) / (1 + e2)', msg: 'Use the INITIAL (1 + e₁): H was measured in the initial state.', tag: 'phase-derivation' }] }
        ],
        check: ['e₂ < e₁ and γd2 > γd1 ✓', 'ΔH is a small fraction of H ✓'], interpret: 'Densification reduces voids, increasing unit weight, strength and stiffness and reducing liquefaction susceptibility.'
      };
    } });

  /* 16. Relative compaction vs relative density */
  T.push({ id: 'c3-Rc', chapter: 3, topic: 'relative-density', difficulty: 2, method: 'R = γd(field)/γd(max-lab); contrast with Dr',
    title: 'Relative compaction versus relative density',
    generate: function (r, sys, S) {
      var Gs = 2.66, emin = r.range(0.45, 0.55), emax = emin + r.range(0.3, 0.38), e = emin + r.range(0.2, 0.7) * (emax - emin), u = US(sys);
      var f = function (ee) { return rs(Gs * S.gw / (1 + ee), 4); };
      var gdmax = f(emin), gdmin = f(emax), gd = f(e);
      return {
        text: 'For a granular fill, γd(min) = ' + gdmin + ', γd(max) = ' + gdmax + ', and the field dry unit weight = ' + gd + ' (all ' + u.uw + '). Treat γd(max) here as the laboratory maximum used for both indices. Compute the relative compaction R and the relative density Dr, and compare them.',
        given: [{ sym: 'gdmax', label: 'γd(max)', value: gdmax, unit: u.uw, sig: 4 }, { sym: 'gdmin', label: 'γd(min)', value: gdmin, unit: u.uw, sig: 4 }, { sym: 'gd', label: 'Field γd', value: gd, unit: u.uw, sig: 4 }],
        assumptions: ['Both indices are referenced to the same maximum dry unit weight (a simplification; in practice R uses the Proctor maximum — see Chapter 6).'],
        parts: [
          { sym: 'Rc', label: 'Relative compaction', expr: 'gd / gdmax', unit: '%', why: 'Relative compaction R = γd(field)/γd(max-lab).', mistakes: [{ expr: '(gd - gdmin) / (gdmax - gdmin) * gdmax / gd', msg: 'That is the relative density. Relative compaction is the simple ratio γd/γd(max).', tag: 'relative-density' }] },
          { sym: 'Dr', label: 'Relative density', expr: '(gd - gdmin) / (gdmax - gdmin) * gdmax / gd', unit: '%', why: 'Dr compares the field state to BOTH limiting states.', mistakes: [{ expr: 'gd / gdmax', msg: 'That is relative compaction. Dr uses γd(min) as well.', tag: 'relative-density' }] }
        ],
        check: ['R is high (≈ 80–100 %) even when Dr is low: R never reaches 0 because γd(min) > 0 ✓'],
        interpret: 'R is a compaction-control ratio; Dr expresses where the soil sits between its loosest and densest states. A fill can show R ≈ 90 % while Dr is only moderate.'
      };
    } });

  /* 17. Diagram completion */
  T.push({ id: 'c3-phase-fill', chapter: 3, topic: 'phase-diagram', difficulty: 2, method: 'Complete the phase diagram from V, W, Ws, Gs',
    title: 'Complete the phase diagram',
    generate: function (r, sys, S) {
      var Gs = r.pick(GS), e = r.range(0.5, 0.9), Sat = r.range(0.4, 0.9), u = US(sys);
      var V = sys === 'SI' ? rs(r.range(0.002, 0.006), 3) : rs(r.range(0.05, 0.2), 3);
      var st = SM.phase.stateFrom(Gs, e, Sat, V / (1 + e), S.gw);
      var W = rs(st.W, 4), Ws = rs(st.Ws, 4);
      var real = SM.phase.solve({ V: V, W: W, Ws: Ws, Gs: Gs }, S.gw).values;
      return {
        text: 'A soil sample has V = ' + V + ' ' + u.V + ', W = ' + W + ' ' + u.F + ', Ws = ' + Ws + ' ' + u.F + ' and Gs = ' + Gs.toFixed(2) + '. Fill in every missing box of the phase diagram.',
        constants: GW(S),
        given: [{ sym: 'V', label: 'V', value: V, unit: u.V, sig: 3 }, { sym: 'W', label: 'W', value: W, unit: u.F, sig: 4 }, { sym: 'Ws', label: 'Ws', value: Ws, unit: u.F, sig: 4 }, { sym: 'Gs', label: 'Gs', value: Gs, unit: '', sig: 3 }],
        sketch: phaseSketch(real, { V: u.V, F: u.F }, ['V', 'W', 'Ws'], false),
        assumptions: ['Weight of air = 0.'],
        parts: [
          { sym: 'Ww', label: 'Weight of water', expr: 'W - Ws', unit: u.F, why: 'W = Ws + Ww (air weightless).' },
          { sym: 'Vs', label: 'Volume of solids', expr: 'Ws / (Gs * gw)', unit: u.V, why: 'Ws = GsγwVs.', mistakes: [{ expr: 'Ws / gw', msg: 'Include Gs: solids are Gs times heavier than water of equal volume.', tag: 'phase-derivation' }] },
          { sym: 'Vw', label: 'Volume of water', expr: 'Ww / gw', unit: u.V, why: 'Ww = γwVw.' },
          { sym: 'Vv', label: 'Volume of voids', expr: 'V - Vs', unit: u.V, why: 'V = Vs + Vv.' },
          { sym: 'Va', label: 'Volume of air', expr: 'Vv - Vw', unit: u.V, why: 'Vv = Vw + Va.' }
        ],
        check: ['Va ≥ 0 ✓ (a negative Va would mean S > 100 %: impossible)', 'Volumes add to V ✓'], interpret: 'Once the diagram is complete, every ratio (w, e, n, S) is a simple quotient of boxes.'
      };
    } });

  /* 18. Density vs unit weight */
  T.push({ id: 'c3-density-unitweight', chapter: 3, topic: 'mass-weight', difficulty: 1, method: 'γ = ρg; W = mg',
    title: 'Density, unit weight, mass and weight',
    generate: function (r) {
      var rho = r.range(1650, 2150, 0), V = r.pick([0.25, 0.5, 0.75, 1.2, 2]);
      return {
        text: 'A soil has a moist density of ' + rho + ' kg/m³. (a) What is its moist unit weight in kN/m³? (b) What are the mass and weight of ' + V + ' m³ of this soil?',
        constants: [{ sym: 'grav', value: 9.81, unit: 'm/s²', label: 'gravity' }],
        given: [{ sym: 'rho', label: 'Density', value: rho, unit: 'kg/m³', sig: 4 }, { sym: 'V', label: 'Volume', value: V, unit: 'm³', sig: 3 }],
        assumptions: ['g = 9.81 m/s².'],
        parts: [
          { sym: 'g', label: 'Unit weight', expr: 'rho * grav / 1000', unit: 'kN/m³', why: 'γ = ρg: kg/m³ × m/s² = N/m³; divide by 1000 for kN/m³.' },
          { sym: 'M', label: 'Mass', expr: 'rho * V', unit: 'kg', why: 'm = ρV.' },
          { sym: 'W', label: 'Weight', expr: 'M * grav / 1000', unit: 'kN', why: 'W = mg (in N), ÷1000 for kN.', mistakes: [{ expr: 'M', msg: 'That is the mass in kg. Weight is a force: W = mg.', tag: 'mass-weight' }] }
        ],
        check: ['1 Mg/m³ ≈ 9.81 kN/m³ — a quick check ✓'], interpret: 'Stress calculations need unit weights (forces); lab balances measure masses.'
      };
    } });

  /* 19. Saturated: from γsat and Gs */
  T.push({ id: 'c3-from-gsat', chapter: 3, topic: 'unit-weights', difficulty: 2, method: 'e = (Gsγw − γsat)/(γsat − γw); w = e/Gs',
    title: 'Void ratio from saturated unit weight',
    generate: function (r, sys, S) {
      var Gs = r.pick(GS), e = r.range(0.5, 1.3), u = US(sys); var gsat = rs((Gs + e) * S.gw / (1 + e), 4);
      return {
        text: 'A saturated soil has γsat = ' + gsat + ' ' + u.uw + ' and Gs = ' + Gs.toFixed(2) + '. Determine e, w and γd.',
        constants: GW(S), given: [{ sym: 'gsat', label: 'Saturated unit weight', value: gsat, unit: u.uw, sig: 4 }, { sym: 'Gs', label: 'Gs', value: Gs, unit: '', sig: 3 }],
        assumptions: ['S = 100 %.'],
        parts: [
          { sym: 'e', label: 'Void ratio', expr: '(Gs * gw - gsat) / (gsat - gw)', unit: '', why: 'γsat(1 + e) = (Gs + e)γw → e(γsat − γw) = Gsγw − γsat.' },
          { sym: 'w', label: 'Water content', expr: 'e / Gs', unit: '%', why: 'Se = wGs with S = 1.' },
          { sym: 'gd', label: 'Dry unit weight', expr: 'Gs * gw / (1 + e)', unit: u.uw, why: 'γd = Gsγw/(1 + e).' }
        ],
        check: ['γd < γsat ✓', 'γd(1 + w) should equal γsat ✓'], interpret: 'For saturated soils one measured unit weight plus Gs fixes the entire phase state.'
      };
    } });

  /* 20. Mass of soil to fill a mould / embankment */
  T.push({ id: 'c3-fill-mass', chapter: 3, topic: 'practical', difficulty: 2, method: 'Ws = γdV; W = Ws(1 + w)',
    title: 'Soil needed to build a fill',
    generate: function (r, sys, S) {
      var Gs = 2.68, u = US(sys);
      var V = sys === 'SI' ? r.pick([500, 800, 1200, 2000]) : r.pick([1000, 2500, 5000]);
      var gdT = sys === 'SI' ? r.range(16.5, 18.5, 1) : r.range(105, 118, 0);
      var wB = r.range(0.06, 0.14, 3), eB = r.range(0.7, 1.0, 2);
      return {
        text: 'A ' + V + '-' + u.V + ' embankment must be compacted to a dry unit weight of ' + gdT + ' ' + u.uw + '. Borrow soil has e = ' + eB.toFixed(2) + ', w = ' + U.fmt(wB * 100, 3) + ' %, Gs = ' + Gs + '. Find the dry weight of soil needed, the moist weight to excavate, and the volume of borrow pit excavation.',
        constants: GW(S),
        given: [{ sym: 'V', label: 'Embankment volume', value: V, unit: u.V, sig: 4 }, { sym: 'gdT', label: 'Required γd', value: gdT, unit: u.uw, sig: 4 },
                { sym: 'eB', label: 'Borrow void ratio', value: eB, unit: '', sig: 3 }, { sym: 'wB', label: 'Borrow water content', value: wB, unit: '%', sig: 3 }, { sym: 'Gs', label: 'Gs', value: Gs, unit: '', sig: 3 }],
        assumptions: ['The solids weight is conserved between borrow pit and embankment.'],
        parts: [
          { sym: 'Ws', label: 'Dry weight of solids required', expr: 'gdT * V', unit: u.F, why: 'γd = Ws/V.' },
          { sym: 'W', label: 'Moist weight to excavate', expr: 'Ws * (1 + wB)', unit: u.F, why: 'W = Ws(1 + w) at the borrow water content.' },
          { sym: 'VB', label: 'Borrow volume', expr: 'Ws * (1 + eB) / (Gs * gw)', unit: u.V, why: 'In the borrow pit γd = Gsγw/(1 + e_B), and V = Ws/γd.', mistakes: [{ expr: 'V', msg: 'The borrow soil is looser than the compacted fill, so a larger volume must be excavated.', tag: 'practical' }] }
        ],
        check: ['V_borrow > V_fill since borrow soil is less dense ✓'], interpret: 'Earthwork is computed on solids: weight of solids is conserved; volumes change with void ratio.'
      };
    } });

  /* 21. Limiting void ratios — clean sand correlation (Cubrinovski & Ishihara 2002) */
  T.push({ id: 'c3-emax-emin-corr', chapter: 3, topic: 'limiting-void-ratios', difficulty: 2, method: 'emax = 0.072 + 1.53emin (clean sand)',
    title: 'Estimating emax for a clean sand',
    generate: function (r) {
      var emin = r.range(0.45, 0.75, 2), emaxEst = 0.072 + 1.53 * emin, e = U.roundTo(emin + r.range(0.15, 0.85) * (emaxEst - emin), 2);
      return {
        text: 'A clean sand (fines content below 5 %) has emin = ' + emin.toFixed(2) + ' from a vibratory table test, but emax was not measured. Estimate emax with the Cubrinovski & Ishihara (2002) clean-sand correlation, then estimate the relative density of a deposit with e = ' + e.toFixed(2) + '.',
        given: [{ sym: 'emin', label: 'Minimum void ratio', value: emin, unit: '', sig: 3 }, { sym: 'e', label: 'In-situ void ratio', value: e, unit: '', sig: 3 }],
        assumptions: ['Clean sand, fines content 0–5 % (the correlation applies only in this range).', 'Correlations give estimates with scatter; measured values are preferred.'],
        parts: [
          { sym: 'emax', label: 'Estimated emax', expr: '0.072 + 1.53 * emin', unit: '', why: 'Cubrinovski & Ishihara (2002), clean sands: emax = 0.072 + 1.53 emin.' },
          { sym: 'Dr', label: 'Estimated relative density', expr: '(emax - e) / (emax - emin)', unit: '%', why: 'Dr = (emax − e)/(emax − emin).' }
        ],
        check: ['e lies between emin and the estimated emax ✓'], interpret: 'Because emax is estimated, Dr is approximate — report it as an estimate.'
      };
    } });

  /* 22. Full solution from W, V, w, Gs in US units (or SI) */
  T.push({ id: 'c3-all-from-W-V-w', chapter: 3, topic: 'phase-diagram', difficulty: 2, method: 'Phase diagram from W, V, w and Gs',
    title: 'Phase quantities from W, V and w',
    generate: function (r, sys, S) {
      var Gs = r.pick(GS), e = r.range(0.5, 0.9), Sat = r.range(0.5, 0.95), u = US(sys);
      var V = sys === 'SI' ? rs(r.range(0.01, 0.05), 3) : rs(r.range(0.3, 1.5), 3);
      var st = SM.phase.stateFrom(Gs, e, Sat, V / (1 + e), S.gw), W = rs(st.W, 4), w = U.roundTo(st.w, 3);
      return {
        text: 'A soil sample has a volume of ' + V + ' ' + u.V + ', weighs ' + W + ' ' + u.F + ', and has a water content of ' + U.fmt(w * 100, 3) + ' %. Gs = ' + Gs.toFixed(2) + '. Find Ws, Ww, Vs, Vw, e and S.',
        constants: GW(S),
        given: [{ sym: 'V', label: 'V', value: V, unit: u.V, sig: 3 }, { sym: 'W', label: 'W', value: W, unit: u.F, sig: 4 }, { sym: 'w', label: 'w', value: w, unit: '%', sig: 3 }, { sym: 'Gs', label: 'Gs', value: Gs, unit: '', sig: 3 }],
        sketch: phaseSketch(st, { V: u.V, F: u.F }, ['V', 'W']),
        assumptions: ['Weight of air = 0.'],
        parts: [
          { sym: 'Ws', label: 'Weight of solids', expr: 'W / (1 + w)', unit: u.F, why: 'W = Ws + wWs = Ws(1 + w).', mistakes: [{ expr: 'W * (1 - w)', msg: 'Ws = W/(1 + w); w is referenced to Ws, so W(1 − w) is not exact.', tag: 'w-definition' }] },
          { sym: 'Ww', label: 'Weight of water', expr: 'W - Ws', unit: u.F, why: 'W = Ws + Ww.' },
          { sym: 'Vs', label: 'Volume of solids', expr: 'Ws / (Gs * gw)', unit: u.V, why: 'Ws = GsγwVs.' },
          { sym: 'Vw', label: 'Volume of water', expr: 'Ww / gw', unit: u.V, why: 'Ww = γwVw.' },
          { sym: 'e', label: 'Void ratio', expr: '(V - Vs) / Vs', unit: '', why: 'e = Vv/Vs with Vv = V − Vs.', mistakes: [{ expr: '(V - Vs) / V', msg: MS.eAsN, tag: 'e-vs-n' }] },
          { sym: 'S', label: 'Degree of saturation', expr: 'Vw / (V - Vs)', unit: '%', why: 'S = Vw/Vv.', mistakes: [{ expr: 'w', msg: MS.wAsS, tag: 'w-vs-S' }] }
        ],
        check: ['Vw ≤ Vv ✓', 'S from volumes equals wGs/e ✓'], interpret: 'Working from boxes on the diagram avoids memorising many derived formulas.'
      };
    } });

  /* 23. Change of w during drying at constant volume vs shrinkage (find the mistake numeric) */
  T.push({ id: 'c3-submerged-depth', chapter: 3, topic: 'unit-weights', difficulty: 2, method: 'Choose γ above the water table, γsat/γ′ below',
    title: 'Selecting the right unit weight',
    generate: function (r, sys, S) {
      var Gs = r.pick(GS), e = r.range(0.55, 0.85, 2), Sat = r.range(0.5, 0.8, 2), u = US(sys);
      return {
        text: 'A sand with Gs = ' + Gs.toFixed(2) + ' and e = ' + e.toFixed(2) + ' has S = ' + Math.round(Sat * 100) + ' % above the water table and is fully saturated below it. Find the moist unit weight above the water table, the saturated unit weight below it, and the submerged unit weight.',
        constants: GW(S),
        given: [{ sym: 'Gs', label: 'Gs', value: Gs, unit: '', sig: 3 }, { sym: 'e', label: 'e', value: e, unit: '', sig: 3 }, { sym: 'S', label: 'S above water table', value: Sat, unit: '%', sig: 2 }],
        assumptions: ['The void ratio is the same above and below the water table.'],
        parts: [
          { sym: 'g', label: 'Moist unit weight (above WT)', expr: '(Gs + S * e) * gw / (1 + e)', unit: u.uw, why: 'γ = (Gs + Se)γw/(1 + e) with the actual S.', mistakes: [{ expr: '(Gs + e) * gw / (1 + e)', msg: MS.satForMoist, tag: 'unit-weight-choice' }, { expr: 'Gs * gw / (1 + e)', msg: 'That is the dry unit weight; the soil above the water table holds some water.', tag: 'unit-weight-choice' }] },
          { sym: 'gsat', label: 'Saturated unit weight (below WT)', expr: '(Gs + e) * gw / (1 + e)', unit: u.uw, why: 'S = 1 in the same formula.' },
          { sym: 'gsub', label: 'Submerged unit weight', expr: 'gsat - gw', unit: u.uw, why: 'γ′ = γsat − γw.', mistakes: [{ expr: 'g - gw', msg: 'γ′ is based on γsat, not the moist γ.', tag: 'unit-weight-choice' }] }
        ],
        check: ['γd < γ < γsat ✓'], interpret: 'Pick the unit weight that matches the soil’s actual saturation condition in each zone.'
      };
    } });

  SM.registerTemplates(T);
})(typeof window !== 'undefined' ? window : globalThis);
