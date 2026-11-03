/* Florida context: lessons, problem templates, concept questions, glossary terms and formulas
 * set in Florida soils and groundwater conditions.
 *
 * Fact policy (see README "Florida context"): statements of fact about Florida use only items
 * confirmed in two or more sources, or are attributed to their single source. Values that could
 * not be verified (e.g. Gs of a particular peat, k of a particular hardpan) appear only as data
 * "measured for this sample" inside individual problems, never as general Florida values. */
(function (root) {
  'use strict';
  var SM = root.SM, U = SM.units, P = SM.perm;
  var rs = U.roundSig;
  function pct(x, s) { return U.fmt(x * 100, s || 3) + ' %'; }
  function GW(S) { return [{ sym: 'gw', value: S.gw, unit: S.gwUnit, label: 'unit weight of water' }]; }
  function UU(sys) { return sys === 'SI' ? { V: 'm³', F: 'kN', uw: 'kN/m³', L: 'm' } : { V: 'ft³', F: 'lb', uw: 'lb/ft³', L: 'ft' }; }

  /* ======================================================================= TEMPLATES */
  var T = [];

  /* FL-1 Myakka fine sand: field unit weight and FDOT compaction check */
  T.push({ id: 'fl-myakka-compaction', chapter: 3, florida: true, topic: 'unit-weights', difficulty: 2,
    method: '$gd = g / (1 + w)$; $Rc = gd / gdT99$ compared with 100 %; $e$ from $gd$',
    title: 'Florida: compacted fine-sand embankment check',
    generate: function (r, sys, S) {
      var u = UU(sys), si = sys === 'SI', Gs = 2.65;
      var gdmax = si ? r.range(16.4, 17.6, 2) : r.range(104, 112, 1), Rt = r.range(0.94, 1.03), w = r.range(0.07, 0.14, 3);
      var g = rs(gdmax * Rt * (1 + w), 4);
      return {
        text: 'A roadway embankment in central Florida is built from fine sand (AASHTO A-3) borrowed from a pine-flatwoods site underlain by Myakka fine sand. A field density test on a compacted lift gives a moist unit weight $g$ = ' + U.fmt(g, 4) + ' ' + u.uw + ' at a moisture content $w$ = ' + pct(w) + '. The laboratory maximum dry unit weight of the fill (AASHTO T 99) is $gdT99$ = ' + gdmax + ' ' + u.uw + ', and $Gs$ = 2.65 for this quartz sand. FDOT embankment specifications call for 100 % of the T 99 maximum dry density. Find the field dry unit weight, the relative compaction, and the void ratio of the lift.',
        constants: GW(S),
        given: [{ sym: 'g', label: 'Field moist unit weight', value: g, unit: u.uw, sig: 4 }, { sym: 'w', label: 'Field moisture content', value: w, unit: '%', sig: 3 },
                { sym: 'gdT99', label: 'Maximum dry unit weight (AASHTO T 99)', value: gdmax, unit: u.uw, sig: 4 }, { sym: 'Gs', label: 'Specific gravity of soil solids', value: Gs, unit: '', sig: 3 }],
        assumptions: ['The field test measures the average unit weight of the tested lift.', '$Gs$ = 2.65 (quartz sand, as given for this fill).'],
        parts: [
          { sym: 'gd', label: 'Field dry unit weight', expr: 'g / (1 + w)', unit: u.uw, why: '$gd = g / (1 + w)$: compaction is judged on the dry unit weight.', mistakes: [{ expr: 'g * (1 + w)', msg: 'Drying removes water, so $gd = g / (1 + w)$ is SMALLER than $g$.', tag: 'unit-weight-choice' }] },
          { sym: 'Rc', label: 'Relative compaction', expr: 'gd / gdT99', unit: '%', why: 'Relative compaction $Rc = gdfield / gdlab$; the specification asks for $Rc$ ≥ 100 % of the T 99 maximum.', mistakes: [{ expr: 'g / gdT99', msg: 'Use the DRY unit weight in the field ($gd$), not the moist $g$: the T 99 maximum is a dry unit weight.', tag: 'unit-weight-choice' }] },
          { sym: 'e', label: 'Void ratio of the lift', expr: 'Gs * gw / gd - 1', unit: '', why: 'From $gd = Gs gw / (1 + e)$.' }
        ],
        check: ['$Rc$ ≥ 100 % → the lift meets the density requirement; otherwise it must be reworked ✓', '$gd < g$ ✓'],
        interpret: 'Fine Florida sands are compacted to a specified percentage of a laboratory maximum (relative compaction), not to a relative density. A lift below 100 % of T 99 would be re-compacted, usually after adjusting its moisture content.'
      };
    } });

  /* FL-2 Organic soil (muck) */
  T.push({ id: 'fl-muck', chapter: 3, florida: true, topic: 'unit-weights', difficulty: 2,
    method: 'Saturated organic soil: $e = w Gs$, $gsat$, $gsub$ with a low measured $Gs$',
    title: 'Florida: saturated organic soil (muck)',
    generate: function (r, sys, S) {
      var u = UU(sys), w = r.range(2.0, 4.5, 2), Gs = r.pick([1.55, 1.6, 1.7, 1.8, 1.9, 2.0]);
      return {
        text: 'A soil boring for a road widening in Florida encounters a layer of black organic soil (muck) below the water table. Laboratory tests on a sample give a moisture content $w$ = ' + Math.round(w * 100) + ' % and, for this sample, $Gs$ = ' + Gs.toFixed(2) + ' (organic solids are much lighter than quartz). Assuming the muck is saturated, find its void ratio, porosity, saturated unit weight and submerged unit weight.',
        constants: GW(S),
        given: [{ sym: 'w', label: 'Moisture content', value: w, unit: '%', sig: 3 }, { sym: 'Gs', label: 'Specific gravity of solids (measured for this sample)', value: Gs, unit: '', sig: 3 }],
        sketch: { type: 'phaseNorm', e: w * Gs, Gs: Gs, S: 1 },
        assumptions: ['Saturated: $S$ = 100 % (below the water table).', 'The measured $Gs$ applies to this sample only; organic soils vary widely, so $Gs$ must be measured rather than assumed to be 2.65.'],
        parts: [
          { sym: 'e', label: 'Void ratio', expr: 'w * Gs', unit: '', why: '$S e = w Gs$ with $S$ = 1.', mistakes: [{ expr: 'w * 2.65', msg: 'Use the measured $Gs$ of this organic soil, not the quartz value 2.65.', tag: 'phase-derivation' }, { expr: 'w * Gs * 100', msg: 'Use $w$ as a decimal (e.g. 300 % → 3.00).', tag: 'percent' }] },
          { sym: 'n', label: 'Porosity', expr: 'e / (1 + e)', unit: '%', why: '$n = e / (1 + e)$.' },
          { sym: 'gsat', label: 'Saturated unit weight', expr: '(Gs + e) * gw / (1 + e)', unit: u.uw, why: '$gsat = (Gs + e) gw / (1 + e)$.', mistakes: [{ expr: 'Gs * gw / (1 + e)', msg: 'That is the dry unit weight; the muck is saturated: $gsat = (Gs + e) gw / (1 + e)$.', tag: 'unit-weight-choice' }] },
          { sym: 'gsub', label: 'Submerged unit weight', expr: 'gsat - gw', unit: u.uw, why: '$gsub = gsat - gw$.' }
        ],
        check: ['$w$ above 100 % and $e$ above 3 are physically valid for organic soils ✓', '$gsat$ is only slightly above $gw$, so $gsub$ is very small ✓'],
        interpret: 'Muck holds several times its own dry weight of water and has a very small effective (submerged) unit weight. It is weak and highly compressible, which is why FDOT removes organic material from beneath roadways (subsoil excavation) and replaces it with suitable fill.'
      };
    } });

  /* FL-3 Subsoil excavation (demucking) and replacement with A-3 fill */
  T.push({ id: 'fl-demuck-fill', chapter: 3, florida: true, topic: 'practical', difficulty: 3,
    method: 'Replacement fill: $Ws = gd V$; $W = Ws (1 + w)$; borrow volume from $e$',
    title: 'Florida: replacing excavated muck with sand fill',
    generate: function (r, sys, S) {
      var u = UU(sys), si = sys === 'SI', Gs = 2.65;
      var V = si ? r.pick([600, 900, 1500, 2400, 3200]) : r.pick([20000, 35000, 50000, 80000]);
      var gdmax = si ? r.range(16.4, 17.6, 2) : r.range(104, 112, 1), wB = r.range(0.04, 0.12, 3), eB = r.range(0.62, 0.85, 2);
      return {
        text: 'Under a planned Florida roadway, ' + V + ' ' + u.V + ' of organic soil (muck) is removed by subsoil excavation. The hole is backfilled with A-3 fine sand compacted to 100 % of its AASHTO T 99 maximum dry unit weight, $gdT99$ = ' + gdmax + ' ' + u.uw + '. In the borrow pit the sand has $e$ = ' + eB.toFixed(2) + ', $w$ = ' + pct(wB) + ' and $Gs$ = 2.65. Find the dry weight of sand required, the moist weight to haul, and the volume of borrow-pit excavation.',
        constants: GW(S),
        given: [{ sym: 'V', label: 'Volume to backfill', value: V, unit: u.V, sig: 4 }, { sym: 'gdT99', label: 'Required dry unit weight (100 % of T 99)', value: gdmax, unit: u.uw, sig: 4 },
                { sym: 'eB', label: 'Borrow void ratio', value: eB, unit: '', sig: 3 }, { sym: 'wB', label: 'Borrow moisture content', value: wB, unit: '%', sig: 3 }, { sym: 'Gs', label: 'Specific gravity of soil solids', value: Gs, unit: '', sig: 3 }],
        assumptions: ['The weight of solids is conserved between the borrow pit and the compacted backfill.', 'The backfill is compacted to exactly 100 % of the T 99 maximum.'],
        parts: [
          { sym: 'Ws', label: 'Dry weight of sand required', expr: 'gdT99 * V', unit: u.F, why: '$gd = Ws / V$ in the compacted backfill.' },
          { sym: 'W', label: 'Moist weight to haul', expr: 'Ws * (1 + wB)', unit: u.F, why: '$W = Ws (1 + w)$ at the borrow moisture content.', mistakes: [{ expr: 'Ws', msg: 'The haul trucks carry MOIST sand: $W = Ws (1 + w)$.', tag: 'w-definition' }] },
          { sym: 'VB', label: 'Borrow volume', expr: 'Ws * (1 + eB) / (Gs * gw)', unit: u.V, why: 'In the pit $gd = Gs gw / (1 + eB)$, so the excavated volume is $Ws / gd = Ws (1 + eB) / (Gs gw)$.', mistakes: [{ expr: 'V', msg: 'The pit sand is looser than the compacted backfill, so more volume must be excavated than is filled.', tag: 'practical' }] }
        ],
        check: ['Borrow volume > backfill volume ✓'], interpret: 'Earthwork for muck replacement is computed on the weight of solids, which is conserved; volumes change with void ratio between the pit and the compacted fill.'
      };
    } });

  /* FL-4 Phosphatic clay in a settling area */
  T.push({ id: 'fl-phosphatic-clay', chapter: 3, florida: true, topic: 'water-content', difficulty: 2,
    method: 'Solids content $s$ → $w = (1 - s) / s$; saturated: $e = w Gs$, $gsat$',
    title: 'Florida: phosphatic clay in a settling area',
    generate: function (r, sys, S) {
      var u = UU(sys), s = r.pick([0.12, 0.15, 0.18, 0.2, 0.22, 0.25]), Gs = r.pick([2.6, 2.65, 2.7, 2.75]);
      return {
        text: 'Phosphatic clays from central Florida phosphate mining are pumped to clay settling areas as a slurry with only about 3–5 % solids and slowly consolidate over the years. A sample from an older settling area has a solids content $s$ = ' + Math.round(s * 100) + ' % (mass of solids ÷ total mass). For this sample, $Gs$ = ' + Gs.toFixed(2) + '. Assuming it is saturated, find the moisture content, void ratio and saturated unit weight.',
        constants: GW(S),
        given: [{ sym: 'ssol', label: 'Solids content (by mass)', value: s, unit: '%', sig: 2 }, { sym: 'Gs', label: 'Specific gravity of solids (measured for this sample)', value: Gs, unit: '', sig: 3 }],
        assumptions: ['Saturated ($S$ = 100 %).', 'Solids content $s = Ms / M$; moisture content $w = Mw / Ms$.'],
        parts: [
          { sym: 'w', label: 'Moisture content', expr: '(1 - ssol) / ssol', unit: '%', why: 'Per unit total mass, $Ms = s$ and $Mw = 1 - s$, so $w = Mw / Ms = (1 - s) / s$.', mistakes: [{ expr: '1 - ssol', msg: 'That is the WATER content as a fraction of the TOTAL mass. Moisture content is referenced to the solids: $w = (1 - s) / s$.', tag: 'w-definition' }] },
          { sym: 'e', label: 'Void ratio', expr: 'w * Gs', unit: '', why: '$S e = w Gs$ with $S$ = 1.' },
          { sym: 'gsat', label: 'Saturated unit weight', expr: '(Gs + e) * gw / (1 + e)', unit: u.uw, why: '$gsat = (Gs + e) gw / (1 + e)$.' }
        ],
        check: ['$w$ of several hundred percent is valid: it is referenced to the small mass of solids ✓', 'When deposited (3–5 % solids) $w = (1 - s) / s$ would be about 1900–3200 % ✓'],
        interpret: 'Solids content and moisture content describe the same state from different references. Phosphatic clays stay at very high moisture contents for years because their very low permeability makes consolidation slow.'
      };
    } });

  /* FL-5 Biscayne aquifer pumping test (unconfined) */
  T.push({ id: 'fl-biscayne-pump', chapter: 7, florida: true, topic: 'field', difficulty: 2,
    method: 'Unconfined well: $k = 2.303 q log10(r1 / r2) / [pi (h1^2 - h2^2)]$',
    title: 'Florida: pumping test in the Biscayne aquifer',
    generate: function (r, sys) {
      var si = sys === 'SI';
      var kday = r.range(3000, 15000) * (si ? 0.3048 : 1); // ft/day or m/day
      var r1 = si ? r.pick([45, 60, 75]) : r.pick([150, 200, 250]), r2 = si ? r.pick([9, 12, 15]) : r.pick([30, 40, 50]);
      var h2 = si ? r.range(18, 27, 2) : r.range(60, 90, 1);
      var q = si ? rs(r.range(15, 40), 2) : rs(r.range(500, 1400), 2); // m³/min or ft³/min
      var kmin = kday / 1440;
      var h1 = U.roundTo(Math.sqrt(h2 * h2 + 2.303 * q * Math.log10(r1 / r2) / (Math.PI * kmin)), 2);
      var Lu = si ? 'm' : 'ft', qu = si ? 'm³/min' : 'ft³/min', ku = si ? 'm/min' : 'ft/min', kdu = si ? 'm/day' : 'ft/day';
      return {
        text: 'A municipal well in Miami-Dade County fully penetrates the Biscayne aquifer, a highly permeable limestone and sand aquifer that is the sole source of drinking water for much of southeast Florida. With steady pumping of $q$ = ' + q + ' ' + qu + ', the water levels above the base of the aquifer are $h1$ = ' + h1 + ' ' + Lu + ' at $r1$ = ' + r1 + ' ' + Lu + ' and $h2$ = ' + h2 + ' ' + Lu + ' at $r2$ = ' + r2 + ' ' + Lu + '. Treating the aquifer as unconfined, find $k$ in ' + ku + ' and ' + kdu + '.',
        given: [{ sym: 'q', label: 'Pumping rate', value: q, unit: qu, sig: 2 }, { sym: 'r1', label: 'Radius to far observation well', value: r1, unit: Lu, sig: 3 }, { sym: 'r2', label: 'Radius to near observation well', value: r2, unit: Lu, sig: 3 },
                { sym: 'h1', label: 'Water level at $r1$', value: h1, unit: Lu, sig: 4 }, { sym: 'h2', label: 'Water level at $r2$', value: h2, unit: Lu, sig: 4 }],
        sketch: { type: 'well', confined: false },
        assumptions: ['Steady state; fully penetrating well; horizontal radial flow (Dupuit assumptions); homogeneous aquifer between the observation wells.', 'Heads are measured from the base of the aquifer.'],
        parts: [
          { sym: 'kmin', label: 'Hydraulic conductivity per minute', expr: '2.303 * q * log10(r1 / r2) / (pi * (h1 ^ 2 - h2 ^ 2))', unit: ku, why: 'Unconfined pumping-well equation; with $q$ per minute, $k$ comes out per minute.', mistakes: [{ expr: 'q * log10(r1 / r2) / (pi * (h1 ^ 2 - h2 ^ 2))', msg: 'The factor 2.303 that converts $log10$ to $ln$ is missing.', tag: 'log' }] },
          { sym: 'kday', label: 'Hydraulic conductivity per day', expr: 'kmin * 1440', unit: kdu, why: '1 day = 1440 min.' }
        ],
        check: ['A result in the thousands of ft/day (about 1–5 cm/s) is consistent with USGS reports that parts of the Biscayne aquifer exceed 10,000 ft/day: clean-gravel range ✓', 'The drawdown difference $h1 - h2$ is small even at a high pumping rate, as expected for such a permeable aquifer ✓'],
        interpret: 'The Biscayne aquifer transmits water so readily that large municipal withdrawals produce only small drawdowns. The same property lets contaminants and salt water move quickly, which is why it is protected as a sole-source aquifer.'
      };
    } });

  /* FL-6 Upper Floridan aquifer pumping test (confined) and transmissivity */
  T.push({ id: 'fl-floridan-pump', chapter: 7, florida: true, topic: 'field', difficulty: 3,
    method: 'Confined well: $k = q log10(r1 / r2) / [2.727 H (h1 - h2)]$; $Tr = k H$',
    title: 'Florida: confined Upper Floridan aquifer and transmissivity',
    generate: function (r, sys) {
      var si = sys === 'SI';
      var Tday = r.range(10000, 100000) * (si ? 0.09290304 : 1); // ft²/day or m²/day
      var H = si ? r.pick([60, 75, 90, 120]) : r.pick([200, 250, 300, 400]);
      var r1 = si ? r.pick([90, 120, 150]) : r.pick([300, 400, 500]), r2 = si ? r.pick([15, 25, 30]) : r.pick([50, 75, 100]);
      var q = si ? rs(r.range(10, 40), 2) : rs(r.range(400, 1400), 2);
      var kmin = Tday / H / 1440, dh = q * Math.log10(r1 / r2) / (2.727 * H * kmin);
      var h2 = si ? r.range(100, 150, 2) : r.range(330, 480, 1), h1 = U.roundTo(h2 + dh, 2);
      var Lu = si ? 'm' : 'ft', qu = si ? 'm³/min' : 'ft³/min', ku = si ? 'm/min' : 'ft/min', kdu = si ? 'm/day' : 'ft/day', tu = si ? 'm²/day' : 'ft²/day';
      return {
        text: 'In west-central Florida a production well fully penetrates $H$ = ' + H + ' ' + Lu + ' of the Upper Floridan aquifer, a limestone aquifer confined above by clay-rich sediments of the Hawthorn Group. The well is pumped at $q$ = ' + q + ' ' + qu + '. Piezometric levels measured above the base of the aquifer are $h1$ = ' + h1 + ' ' + Lu + ' at $r1$ = ' + r1 + ' ' + Lu + ' and $h2$ = ' + h2 + ' ' + Lu + ' at $r2$ = ' + r2 + ' ' + Lu + '. Find $k$ and the transmissivity $Tr = k H$.',
        given: [{ sym: 'q', label: 'Pumping rate', value: q, unit: qu, sig: 2 }, { sym: 'H', label: 'Aquifer thickness', value: H, unit: Lu, sig: 3 }, { sym: 'r1', label: 'Radius to far observation well', value: r1, unit: Lu, sig: 3 }, { sym: 'r2', label: 'Radius to near observation well', value: r2, unit: Lu, sig: 3 },
                { sym: 'h1', label: 'Piezometric level at $r1$', value: h1, unit: Lu, sig: 5 }, { sym: 'h2', label: 'Piezometric level at $r2$', value: h2, unit: Lu, sig: 5 }],
        sketch: { type: 'well', confined: true },
        assumptions: ['Steady state; the aquifer stays confined (piezometric surface above the top of the aquifer); horizontal flow through the full thickness $H$.', 'The limestone behaves as an equivalent porous medium at the scale of the test (no dominant conduits between the wells).'],
        parts: [
          { sym: 'kmin', label: 'Hydraulic conductivity per minute', expr: 'q * log10(r1 / r2) / (2.727 * H * (h1 - h2))', unit: ku, why: 'Confined pumping-well equation: the flow area $2 pi r H$ does not change with drawdown.', mistakes: [{ expr: '2.303 * q * log10(r1 / r2) / (pi * (h1 ^ 2 - h2 ^ 2))', msg: 'That is the UNCONFINED equation. The Upper Floridan here is confined by the Hawthorn Group, so use $k = q log10(r1 / r2) / [2.727 H (h1 - h2)]$.', tag: 'formula' }] },
          { sym: 'kday', label: 'Hydraulic conductivity per day', expr: 'kmin * 1440', unit: kdu, why: '1 day = 1440 min.' },
          { sym: 'Tr', label: 'Transmissivity', expr: 'kday * H', unit: tu, dim: 'transmissivity', why: 'Transmissivity is the flow capacity of the full aquifer thickness: $Tr = k H$.', mistakes: [{ expr: 'kmin * H', msg: 'Use $k$ per DAY so that $Tr$ comes out in ' + tu + '.', tag: 'units' }] }
        ],
        check: ['USGS reports most Upper Floridan transmissivities between about 10,000 and 100,000 ft²/day; the result falls in that range ✓'],
        interpret: 'Transmissivity, rather than $k$ alone, controls how much water a confined aquifer delivers. The equivalent-porous-medium assumption can fail where flow concentrates in karst conduits.'
      };
    } });

  /* FL-7 Retention pond over sand and spodic hardpan: layered vertical flow */
  T.push({ id: 'fl-pond-hardpan', chapter: 7, florida: true, topic: 'layered', difficulty: 3,
    method: 'Vertical flow: $Dh = hw + H1 + H2$; $kVeq = H / Sum (H_i / k_i)$; $v = kVeq i$',
    title: 'Florida: retention pond over a spodic hardpan',
    generate: function (r) {
      var hw = r.pick([0.3, 0.45, 0.6, 0.9]), H1 = r.pick([0.4, 0.5, 0.6, 0.75]), H2 = r.pick([0.2, 0.25, 0.3, 0.4]);
      var k1 = rs(Math.pow(10, r.range(-2.8, -2.2)), 2), k2 = rs(Math.pow(10, r.range(-4.6, -3.6)), 2), Apond = r.pick([1500, 2500, 4000, 6000]);
      return {
        text: 'A dry-retention stormwater pond in Florida flatwoods is excavated in fine sand underlain by a spodic horizon (organic "hardpan") that is less permeable than the sand. Below the pond bottom: fine sand $H1$ = ' + H1 + ' m with $k1$ = ' + U.fmt(k1, 2) + ' cm/s, then hardpan $H2$ = ' + H2 + ' m with $k2$ = ' + U.fmt(k2, 2) + ' cm/s (values measured on samples from this site). The water table is at the base of the hardpan. With $hw$ = ' + hw + ' m of water ponded over the $Apond$ = ' + Apond + ' m² pond bottom, estimate the steady downward infiltration.',
        given: [{ sym: 'hw', label: 'Ponded water depth', value: hw, unit: 'm', sig: 2 }, { sym: 'H1', label: 'Thickness of fine sand', value: H1, unit: 'm', sig: 2 }, { sym: 'k1', label: 'Hydraulic conductivity of the sand', value: k1, unit: 'cm/s', sig: 2 },
                { sym: 'H2', label: 'Thickness of hardpan', value: H2, unit: 'm', sig: 2 }, { sym: 'k2', label: 'Hydraulic conductivity of the hardpan', value: k2, unit: 'cm/s', sig: 2 }, { sym: 'Apond', label: 'Pond bottom area', value: Apond, unit: 'm²', sig: 4 }],
        sketch: { type: 'layers', layers: [{ H: H1, k: k1 }, { H: H2, k: k2 }], dir: 'V', unit: 'm' },
        assumptions: ['Steady, saturated, one-dimensional vertical flow (the soil between the pond and the water table stays saturated).', 'Datum at the water table (base of the hardpan), where the pressure head is zero; at the pond bottom the pressure head is $hw$.'],
        parts: [
          { sym: 'Dh', label: 'Total head loss', expr: 'hw + H1 + H2', unit: 'm', why: 'Total head at the pond bottom: $h = u / gw + Z = hw + (H1 + H2)$; at the water table $h$ = 0. So $Dh = hw + H1 + H2$.', mistakes: [{ expr: 'hw', msg: 'That is only the pressure head at the pond bottom. The TOTAL head also includes the elevation head $H1 + H2$ above the datum at the water table.', tag: 'pressure-vs-total-head' }] },
          { sym: 'kVeq', label: 'Equivalent vertical conductivity', expr: '(H1 + H2) / (H1 / k1 + H2 / k2)', unit: 'cm/s', why: 'Layers in series for vertical flow: $kVeq = H / Sum (H_i / k_i)$.', mistakes: [{ expr: '(k1 * H1 + k2 * H2) / (H1 + H2)', msg: 'That is the PARALLEL (horizontal-flow) average. Vertical flow crosses the layers in series: $kVeq = H / Sum (H_i / k_i)$.', tag: 'layered' }] },
          { sym: 'v', label: 'Infiltration (discharge) velocity', expr: 'kVeq * Dh / (H1 + H2)', unit: 'cm/s', why: '$v = kVeq i$ with $i = Dh / (H1 + H2)$.' },
          { sym: 'Qday', label: 'Infiltration volume per day', expr: 'v / 100 * Apond * 86400', unit: 'm³', why: '$Q = v A t$ with $v$ in m/s (÷100) and $t$ = 86 400 s.', mistakes: [{ expr: 'v * Apond * 86400', msg: 'Convert $v$ from cm/s to m/s (÷100) before multiplying by an area in m².', tag: 'units' }] }
        ],
        check: ['$kVeq$ is much closer to the hardpan $k2$ than to the sand $k1$: the hardpan controls ✓'],
        interpret: 'A thin, less permeable spodic horizon can control how fast a Florida pond drains, which is why designers measure the conductivity of each layer and the seasonal high water table rather than relying on the sand alone. A shallow water table also reduces the available head.'
      };
    } });

  /* FL-8 Temperature correction with Florida groundwater */
  T.push({ id: 'fl-temperature', chapter: 7, florida: true, topic: 'temperature', difficulty: 1,
    method: '$k20 = (etaT / eta20) kT$ at Florida groundwater temperature',
    title: 'Florida: correcting hydraulic conductivity measured with warm groundwater',
    generate: function (r) {
      var T_ = r.pick([22, 23, 24, 25]), kT = rs(Math.pow(10, r.range(-3.5, -1.8)), 3), ratio = P.etaRatio(T_);
      return {
        text: 'A constant-head test on a Florida sand is run with groundwater from the Upper Floridan aquifer at its natural temperature of ' + T_ + ' °C (Upper Floridan water is roughly 19–25 °C, warmer toward the south). The test gives $kT$ = ' + U.fmt(kT, 3) + ' cm/s. With $etaT / eta20$ = ' + ratio.toFixed(3) + ' at ' + T_ + ' °C, report $k$ at the standard 20 °C.',
        constants: [{ sym: 'etaRatio', value: ratio, unit: '', label: 'viscosity ratio at ' + T_ + ' °C' }],
        given: [{ sym: 'kT', label: 'Hydraulic conductivity at the test temperature', value: kT, unit: 'cm/s', sig: 3 }],
        assumptions: ['Only the viscosity of water changes appreciably with temperature.'],
        parts: [{ sym: 'k20', label: 'Hydraulic conductivity at 20 °C', expr: 'kT * etaRatio', unit: 'cm/s', why: '$k20 = (etaT / eta20) kT$; warm water is less viscous, so $k20 < kT$.', mistakes: [{ expr: 'kT / etaRatio', msg: 'The correction went the wrong way: warmer water flows more easily, so $k20$ must be SMALLER than $kT$.', tag: 'temperature' }] }],
        check: ['$k20 < kT$ for a test above 20 °C ✓'],
        interpret: 'Florida groundwater is warmer than the 20 °C reference, so uncorrected tests overstate $k$ by roughly 5–11 %.'
      };
    } });

  /* FL-9 Karst conduit vs sand: Reynolds number and the validity of Darcy's law */
  T.push({ id: 'fl-karst-reynolds', chapter: 7, florida: true, topic: 'darcy', difficulty: 2,
    method: '$Re = v D rho / eta$: laminar (Darcy) in sand, turbulent in karst conduits',
    title: 'Florida: Darcy’s law in sand versus karst conduits',
    generate: function (r) {
      var Dc = r.pick([0.5, 1, 1.5, 2, 3]), vc = r.pick([0.05, 0.1, 0.2, 0.3, 0.5]), vsand = rs(Math.pow(10, r.range(-5.5, -4.5)), 2), D10m = r.pick([0.1, 0.15, 0.2]) / 1000;
      return {
        text: 'Spring-fed karst systems in Florida carry groundwater through dissolved limestone conduits. In one conduit of diameter $Dc$ = ' + Dc + ' m the mean velocity is ' + vc + ' m/s. In a nearby fine sand, the seepage velocity is $vsand$ = ' + U.fmt(vsand, 2) + ' m/s and the grain size is $D10m$ = ' + (D10m * 1000) + ' mm. Using water at 22 °C ($rho$ = 998 kg/m³, $eta$ = 0.954 × $10^{-3}$ Pa·s), compute the Reynolds number in each and decide where Darcy’s law ($Re$ below about 1) applies.',
        constants: [{ sym: 'rho', value: 998, unit: 'kg/m³', label: 'density of water' }, { sym: 'eta', value: 0.954e-3, unit: 'Pa·s', label: 'viscosity of water at 22 °C' }],
        given: [{ sym: 'Dc', label: 'Conduit diameter', value: Dc, unit: 'm', sig: 2 }, { sym: 'vc', label: 'Mean velocity in the conduit', value: vc, unit: 'm/s', sig: 2 }, { sym: 'vsand', label: 'Seepage velocity in the sand', value: vsand, unit: 'm/s', sig: 2 }, { sym: 'D10m', label: 'Effective grain size of the sand', value: D10m, unit: 'm', sig: 2 }],
        assumptions: ['Reynolds number $Re = v D rho / eta$ with a characteristic length $D$ (conduit diameter, or grain size for a sand).'],
        parts: [
          { sym: 'Rec', label: 'Reynolds number in the conduit', expr: 'vc * Dc * rho / eta', unit: '', why: '$Re = v D rho / eta$ with the conduit diameter.' },
          { sym: 'Res', label: 'Reynolds number in the sand', expr: 'vsand * D10m * rho / eta', unit: '', why: 'Same definition with the grain size as the characteristic length.', mistakes: [{ expr: 'vsand * D10m * 1000 * rho / eta', msg: 'Convert the grain size to metres (mm ÷ 1000) before substituting SI values.', tag: 'units' }] }
        ],
        check: ['$Re$ in the conduit is in the hundreds of thousands: turbulent, so Darcy’s law does not apply there ✓', '$Re$ in the sand is far below 1: laminar, so Darcy’s law applies ✓'],
        interpret: 'Darcy’s law describes flow through the porous limestone matrix and Florida sands, but not turbulent conduit flow in karst. Groundwater models for Florida springs therefore treat conduits separately, with pipe-flow equations.'
      };
    } });

  SM.registerTemplates(T);

  /* ======================================================================= LESSONS */
  var SRC3 = '<p class="small muted"><b>Sources for the Florida facts in this lesson:</b> USDA-NRCS official series description and Florida state-soil booklet (Myakka fine sand); county and expressway geotechnical reports citing the soil survey (classification, seasonal high water table); UF/IFAS EDIS SS741 (organic content of Florida Histosols); FDOT Standard Plans Index 120-002 and FDOT Design Manual Ch. 216 (subsoil excavation); FDOT embankment specification (100 % of AASHTO T 99, check the current Section 120); Florida Industrial and Phosphate Research Institute (phosphatic clay solids contents).</p>';
  var SRC7 = '<p class="small muted"><b>Sources for the Florida facts in this lesson:</b> U.S. EPA sole-source aquifer list (Biscayne, 1979); USGS reports on Biscayne aquifer hydraulic conductivity (e.g. WRI 90-4108; SIR 2014-5138); USGS reports on the Floridan aquifer system and Upper Floridan transmissivity (e.g. SIR 2012-5249; Ground Water Atlas HA-730-G); Hill et al. (2010), Groundwater 48(4), on turbulent conduit flow and MODFLOW-CFP; USGS temperature data for the Upper Floridan; USDA-NRCS series descriptions (relative permeability of spodic horizons).</p>';

  SM.lessons.push({ id: 'fl-soils', chapter: 3, florida: true, title: 'Florida soils through the phase diagram',
    concept: '<p>Florida offers unusually clear examples of the Chapter 3 ideas:</p><ul>' +
      '<li><b>Myakka fine sand</b>, Florida’s state soil (designated in 1989), forms in sandy marine deposits of the pine flatwoods. It is poorly drained, with a seasonal high water table only about 0.5–1.5 ft below the surface, and has a dark <b>spodic horizon</b> (an organic “hardpan”) roughly 20–36 in down. Soil surveys classify it as SP, SP-SM or SM (AASHTO A-3 or A-2-4). Its solids are mostly quartz, so $Gs$ ≈ 2.65 is a reasonable assumption unless a test says otherwise.</li>' +
      '<li><b>Organic soils (muck and peat)</b> are common in low areas and the Everglades. Florida Histosols contain roughly 35–86 % organic matter (UF/IFAS), and moisture contents far above 100 % are normal: one Lake County boring measured $w$ ≈ 232–250 %. Organic solids are much lighter than quartz, so $Gs$ is well below 2.65 and must be measured. These soils are weak and compressible; FDOT treats soil with more than 5 % organic content as organic material and removes it from beneath roadways by <b>subsoil excavation</b>, replacing it with suitable fill.</li>' +
      '<li><b>Phosphatic clays</b> from central Florida phosphate mining are pumped to settling areas at only about 3–5 % solids and reach roughly 20–25 % solids only after many years. Converting solids content $s$ to moisture content, $w = (1 - s) / s$, gives values of several hundred to a few thousand percent.</li>' +
      '<li><b>Compacted sand fill:</b> FDOT embankments are compacted to 100 % of the AASHTO T 99 maximum dry density, a relative-compaction requirement $Rc = gdfield / gdlab$.</li></ul>' +
      '<p>None of these need new equations: the same phase relationships apply. What changes is the data: low $Gs$, very high $w$ and $e$, and a water table close to the surface, so the saturated and submerged unit weights matter in most designs.</p>' + SRC3,
    diagram: { type: 'phaseNorm', e: 3 * 1.7, Gs: 1.7, S: 1 },
    variables: [['w', 'Moisture content (can be several hundred % in muck and phosphatic clay)', '% or decimal'], ['Gs', 'Specific gravity of solids: about 2.65 for quartz sand, much lower for organic solids', '–'], ['ssol', 'Solids content, mass of solids ÷ total mass', '% or decimal'], ['Rc', 'Relative compaction (FDOT: 100 % of AASHTO T 99)', '%']],
    relations: [{ lhs: 'w', expr: '(1 - ssol) / ssol' }, { lhs: 'e', expr: 'w * Gs' }, { lhs: 'Rc', expr: 'gd / gdT99' }],
    assumptions: ['Saturated conditions ($S$ = 100 %) below Florida’s shallow water table.', 'Use measured $Gs$ for organic soils; 2.65 applies to quartz sands only.'],
    example: { template: 'fl-muck', seed: 4 }, practice: 'fl-myakka-compaction', concepts: 'florida-3',
    mistakes: ['Assuming $Gs$ = 2.65 for muck or peat.', 'Treating $w$ > 100 % as an error: it is normal for organic soils and phosphatic clays.', 'Judging compaction with the moist unit weight instead of the dry unit weight.'],
    mathHelp: ['percent'] });

  SM.lessons.push({ id: 'fl-groundwater', chapter: 7, florida: true, title: 'Florida groundwater and permeability',
    concept: '<p>Florida’s aquifers span the whole range of Chapter 7:</p><ul>' +
      '<li><b>Biscayne aquifer</b> (southeast Florida): a highly permeable limestone and sand aquifer, designated a sole-source aquifer by the U.S. EPA in 1979. USGS reports hydraulic conductivities that commonly exceed 10,000 ft/day in its most permeable zones (10,000 ft/day ≈ 3.5 cm/s, the clean-gravel range). Pumping tests use the unconfined well equation.</li>' +
      '<li><b>Floridan aquifer system</b>: limestone and dolostone (for example the Ocala Limestone) that is confined in much of the state by clay-rich sediments of the <b>Hawthorn Group</b>. Where confined, pumping tests use the confined equation and report <b>transmissivity</b> $Tr = k H$; USGS gives most Upper Floridan values between about 10,000 and 100,000 ft²/day.</li>' +
      '<li><b>Karst:</b> dissolution of the limestone creates conduits, springs and sinkholes. Measured conduit flows have Reynolds numbers of about $10^5$–$10^6$, which is turbulent, so <b>Darcy’s law does not apply in the conduits</b>, although it still describes flow through the porous rock and sand.</li>' +
      '<li><b>Shallow water table and hardpans:</b> in the flatwoods the seasonal high water table is often within about 0–1.5 ft of the surface, and spodic horizons are less permeable than the sands above them. For stormwater ponds this means layered (series) vertical flow and a small available head.</li>' +
      '<li><b>Warm groundwater:</b> Upper Floridan water is roughly 19–25 °C, above the 20 °C reference, so laboratory $k$ values measured with it should be corrected with $k20 = (etaT / eta20) kT$.</li></ul>' +
      '<p>Field practice in South Florida also uses constant-head “open-hole” tests to size exfiltration trenches, and double-ring infiltrometers (ASTM D3385) measure an infiltration rate rather than $k$ directly.</p>' + SRC7,
    diagram: { type: 'well', confined: true },
    variables: [['Tr', 'Transmissivity of an aquifer, $Tr = k H$', 'ft²/day · m²/day'], ['Re', 'Reynolds number, $Re = v D rho / eta$', '–'], ['kVeq', 'Equivalent vertical conductivity of sand over hardpan', 'cm/s']],
    relations: [{ lhs: 'Tr', expr: 'k * H' }, { lhs: 'Re', expr: 'v * D * rho / eta' }, { lhs: 'kVeq', expr: '(H1 + H2) / (H1 / k1 + H2 / k2)' }],
    assumptions: ['Pumping-well equations assume steady radial flow in an equivalent porous medium; they are not valid where flow is dominated by karst conduits.'],
    example: { template: 'fl-pond-hardpan', seed: 3 }, practice: 'fl-biscayne-pump', concepts: 'florida-7',
    mistakes: ['Using the unconfined well equation for the confined Floridan aquifer.', 'Applying Darcy’s law to turbulent conduit flow.', 'Ignoring the hardpan when estimating pond infiltration.', 'Forgetting the temperature correction for warm groundwater.'],
    mathHelp: ['logs', 'units'] });

  /* ======================================================================= CONCEPT QUESTIONS */
  function Q(id, ch, topic, type, prompt, options, answer, explain) {
    return { id: id, chapter: ch, topic: topic, type: type, florida: true, prompt: prompt,
             options: options.map(function (o) { return typeof o === 'string' ? { t: o, f: '' } : { t: o[0], f: o[1] }; }), answer: answer, explain: explain };
  }
  [
    Q('fl3-1', 3, 'florida-3', 'mcq', 'A Florida muck sample has $w$ = 300 %. What does this tell you?',
      [['The test is wrong: $w$ cannot exceed 100 %.', '$w$ is referenced to the mass of solids, which is small in organic soils; values above 100 % are normal.'], 'The water weighs three times as much as the solids.', ['The soil is 300 % saturated.', '$S$ can never exceed 100 %; $w$ and $S$ are different quantities.'], 'The soil must be dry.'], 1,
      '$w = Ww / Ws$ = 3.00: the water weighs three times the solids. Organic soils commonly have $w$ well above 100 %.'),
    Q('fl3-2', 3, 'florida-3', 'mcq', 'Why should $Gs$ = 2.65 NOT be assumed for a Florida peat?',
      ['Peat has no solids.', 'Organic solids are much lighter than quartz, so $Gs$ is well below 2.65 and must be measured.', 'Peat is always dry.', '$Gs$ depends on the water content.'], 1,
      '2.65 is typical of quartz. Organic matter has a much lower specific gravity, and using 2.65 would give wrong void ratios and unit weights.'),
    Q('fl3-3', 3, 'florida-3', 'mcq', 'A phosphatic clay has a solids content $s$ = 20 % (mass of solids ÷ total mass). Its moisture content is…',
      [['20 %', 'That is the solids content, not $w$.'], ['80 %', 'That is water ÷ TOTAL mass. $w$ is water ÷ SOLIDS.'], '400 %', ['25 %', 'That would be $s / (1 - s)$, the inverse ratio.']], 2,
      '$w = (1 - s) / s$ = 0.80/0.20 = 4.00 = 400 %.'),
    Q('fl3-4', 3, 'florida-3', 'mcq', 'An FDOT embankment lift must reach 100 % of the AASHTO T 99 maximum dry density. Which field quantity is compared with that maximum?',
      ['Moist unit weight $g$', 'Dry unit weight $gd = g / (1 + w)$', 'Saturated unit weight $gsat$', 'Relative density $Dr$'], 1,
      'Relative compaction $Rc = gdfield / gdlab$ uses the field DRY unit weight.'),
    Q('fl3-5', 3, 'florida-3', 'mcq', 'Why does FDOT remove organic soil (muck) from beneath roadway embankments?',
      ['It is too permeable.', 'It is weak and highly compressible, with very high $w$ and $e$ and a low effective unit weight.', 'It has too high a specific gravity.', 'It cannot be saturated.'], 1,
      'Organic soils settle a lot and have little strength; subsoil excavation replaces them with suitable compacted fill.'),
    Q('fl7-1', 7, 'florida-7', 'mcq', 'Parts of the Biscayne aquifer have $k$ above 10,000 ft/day (about 3.5 cm/s). In the typical ranges of hydraulic conductivity, this is comparable to…',
      ['Clay', 'Silty clay', 'Fine sand', 'Clean gravel'], 3,
      '3.5 cm/s lies in the clean-gravel range (roughly 1–100 cm/s).'),
    Q('fl7-2', 7, 'florida-7', 'eqselect', 'A well fully penetrates the Upper Floridan aquifer where it is confined by Hawthorn Group clays. Which equation gives $k$?',
      ['$k = 2.303 q log10(r1 / r2) / [pi (h1^2 - h2^2)]$', '$k = q log10(r1 / r2) / [2.727 H (h1 - h2)]$', '$k = Q L / (A h t)$', '$k = c D10^2$'], 1,
      'Confined aquifer: the flow thickness is the constant $H$, giving the 2.727 equation.'),
    Q('fl7-3', 7, 'florida-7', 'mcq', 'Flow in a Florida karst conduit has $Re$ ≈ $10^5$. What follows?',
      ['Darcy’s law applies exactly.', 'The flow is turbulent, so Darcy’s law ($Re$ below about 1) does not apply in the conduit.', 'The limestone has zero permeability.', 'The water is not saturated.'], 1,
      'Darcy’s law requires laminar flow. Conduit flow is turbulent and is modelled with pipe-flow equations.'),
    Q('fl7-4', 7, 'florida-7', 'predict', 'A retention pond sits on 0.6 m of fine sand over a thin, much less permeable spodic hardpan. Compared with sand alone, the pond’s infiltration rate will be…',
      ['About the same, because the hardpan is thin', 'Much lower: in vertical (series) flow the least permeable layer controls $kVeq$', 'Higher, because layers add', 'Zero'], 1,
      '$kVeq = H / Sum (H_i / k_i)$ is dominated by the layer with the largest $H_i / k_i$, the hardpan.'),
    Q('fl7-5', 7, 'florida-7', 'mcq', 'A lab test is run with 25 °C groundwater. The value of $k$ reported at 20 °C should be…',
      ['Larger than the measured value', 'Smaller than the measured value', 'The same', 'Impossible to determine'], 1,
      '$k20 = (etaT / eta20) kT$ with $etaT / eta20$ = 0.889 at 25 °C, so $k20 < kT$.'),
    Q('fl7-6', 7, 'florida-7', 'mcq', 'A double-ring infiltrometer test (ASTM D3385) on a pond site gives…',
      ['The hydraulic conductivity $k$ directly', 'An infiltration rate at the surface, which is not the same as $k$', 'The transmissivity of the aquifer', 'The void ratio'], 1,
      'The infiltrometer measures an infiltration rate under its own boundary conditions; converting it to $k$ needs the gradient and assumptions about the flow.')
  ].forEach(function (q) { SM.concepts.push(q); });

  /* ======================================================================= GLOSSARY & FORMULAS */
  [
    ['Myakka fine sand', 'Florida’s state soil (1989): a poorly drained sandy soil of the pine flatwoods with a spodic horizon and a shallow seasonal high water table.'],
    ['Spodic horizon (hardpan)', 'A subsurface horizon where organic matter and aluminium (often with iron) accumulate; in Florida flatwoods soils it is less permeable than the sand above it.'],
    ['Flatwoods', 'Low, flat Florida landscapes of sandy soils with pine forest and a shallow seasonal high water table.'],
    ['Muck', 'Highly decomposed organic soil; in Florida often found in low areas and the Everglades, with very high moisture content and low $Gs$.'],
    ['Subsoil excavation', 'FDOT term for removing organic or otherwise unsuitable soil (for example, more than 5 % organic content) from beneath a roadway and replacing it with suitable fill.'],
    ['A-3 soil', 'AASHTO class for fine, non-plastic sand with little fines; widely used as embankment and select fill in Florida.'],
    ['Phosphatic clay', 'Fine waste clay from phosphate mining in central Florida, deposited in settling areas at very low solids content.'],
    ['Solids content, $ssol$', 'Mass of solids divided by total mass; related to moisture content by $w = (1 - s) / s$.'],
    ['Biscayne aquifer', 'Highly permeable limestone and sand aquifer of southeast Florida; a federally designated sole-source aquifer.'],
    ['Floridan aquifer system', 'Thick carbonate aquifer system underlying Florida, confined in many areas by Hawthorn Group clays.'],
    ['Hawthorn Group', 'Clay-rich sediments that form the confining unit above the Floridan aquifer in much of Florida.'],
    ['Karst', 'Landscape formed by dissolution of limestone, with conduits, springs and sinkholes; conduit flow can be turbulent.'],
    ['Transmissivity, $Tr$', 'Rate of flow through a unit width of the full aquifer thickness under a unit gradient: $Tr = k H$.'],
    ['Sole-source aquifer', 'U.S. EPA designation for an aquifer supplying at least half the drinking water of an area with no reasonable alternative source.']
  ].forEach(function (g) { SM.glossary.push({ term: g[0], def: g[1] }); });

  function F(id, ch, name, lhs, expr, vars, assumptions, applic, ex, unit, tags) {
    return { id: id, chapter: ch, name: name, lhs: lhs, expr: expr, vars: vars, assumptions: assumptions, applicability: applic, example: ex, unit: unit || '', tags: (tags || '') + ' florida' };
  }
  SM.formulas.push(
    F('f-fl-solids', 3, 'Moisture content from solids content', 'w', '(1 - ssol) / ssol', [['ssol', 'solids content, mass of solids ÷ total mass (decimal)', '–']], 'Definitions of $w$ and $s$.', 'Slurries and very soft soils, e.g. phosphatic clays.', { ssol: 0.2 }, '%', 'phosphatic slurry'),
    F('f-fl-T', 7, 'Transmissivity', 'Tr', 'k * H', [['k', 'hydraulic conductivity', 'ft/day'], ['H', 'saturated (aquifer) thickness', 'ft']], 'Uniform $k$ over the thickness.', 'Aquifers (e.g. the Floridan); reported in ft²/day or m²/day.', { k: 150, H: 300 }, 'ft²/day', 'aquifer floridan'),
    F('f-fl-Re', 7, 'Reynolds number', 'Re', 'v * D * rho / eta', [['v', 'velocity', 'm/s'], ['D', 'characteristic length (grain size or conduit diameter)', 'm'], ['rho', 'density of water', 'kg/m³'], ['eta', 'dynamic viscosity', 'Pa·s']], 'Darcy’s law requires laminar flow, roughly $Re$ below 1 for soils.', 'Checking Darcy validity, e.g. karst conduits.', { v: 0.1, D: 1, rho: 998, eta: 0.000954 }, '', 'karst darcy turbulent')
  );
})(typeof window !== 'undefined' ? window : globalThis);
