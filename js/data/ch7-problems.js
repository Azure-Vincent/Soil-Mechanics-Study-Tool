/* Chapter 7 — Permeability: original problem templates, plus combined Ch3 + Ch7 problems.
 * Laboratory tests use cm, cm², cm³ and s (k in cm/s) in both unit systems, as is conventional;
 * answers may be entered in any equivalent velocity unit. */
(function (root) {
  'use strict';
  var SM = root.SM, U = SM.units, P = SM.perm;
  var rs = U.roundSig;
  function L_(sys) { return sys === 'SI' ? { L: 'm', A: 'm²', q: 'm³/s', k: 'm/s', p: 'kPa', uw: 'kN/m³', gw: 9.81 } : { L: 'ft', A: 'ft²', q: 'ft³/min', k: 'ft/min', p: 'lb/ft²', uw: 'lb/ft³', gw: 62.4 }; }
  function GW(sys) { var u = L_(sys); return [{ sym: 'gw', value: u.gw, unit: u.uw, label: 'unit weight of water' }]; }

  var MS = {
    pressureHead: 'You used the difference in PRESSURE heads. Flow is driven by the difference in TOTAL head h = Z + u/γw (elevation + pressure head).',
    qVsVolume: 'That is the collected VOLUME. Discharge rate q is volume per unit time: q = Q/t.',
    volumeVsQ: 'That is the discharge RATE (volume per time). The collected volume over time t is Q = q·t.',
    aSwap: 'You swapped the standpipe area a and the specimen area A. In k = (aL/At)·ln(h₁/h₂), the small standpipe area a is in the numerator.',
    vsAsV: 'That is the discharge (superficial) velocity v = ki. Water actually moves through the voids only, so seepage velocity vs = v/n is larger.',
    vsWithE: 'Divide by the porosity n, not the void ratio e: vs = v/n.',
    kHkV: 'You used the wrong equivalent-conductivity relationship. Flow PARALLEL to layers: k_H(eq) = Σ(kᵢHᵢ)/H (weighted average). Flow PERPENDICULAR: k_V(eq) = H/Σ(Hᵢ/kᵢ) (controlled by the least permeable layer).',
    tempInv: 'The correction went the wrong way. k20 = kT·(ηT/η20): warmer water is less viscous and flows more easily, so k measured above 20 °C must be REDUCED.'
  };

  var T = [];

  /* 1. Bernoulli heads */
  T.push({ id: 'c7-heads', chapter: 7, topic: 'heads', difficulty: 1, method: 'h = Z + u/γw; Δh = hA − hB',
    title: 'Elevation, pressure and total head',
    generate: function (r, sys) {
      var u = L_(sys), si = sys === 'SI';
      var zA = si ? r.range(3, 8, 1) : r.range(10, 25, 0), zB = si ? r.range(0, 2.5, 1) : r.range(0, 8, 0);
      var hpA = si ? r.range(1.5, 4, 2) : r.range(5, 12, 1), hpB = si ? r.range(3, 7, 2) : r.range(10, 22, 1);
      if (zA + hpA <= zB + hpB) hpA = U.roundTo(zB + hpB - zA + (si ? r.range(0.5, 1.5, 2) : r.range(1.5, 4, 1)), 2);
      var uA = U.roundTo(hpA * u.gw, 1), uB = U.roundTo(hpB * u.gw, 1);
      return {
        text: 'Two piezometers are installed in a saturated soil. Point A is at elevation ' + zA + ' ' + u.L + ' with pore water pressure ' + uA + ' ' + u.p + '; point B is at elevation ' + zB + ' ' + u.L + ' with pore water pressure ' + uB + ' ' + u.p + ' (datum: elevation 0). Find the pressure and total heads at A and B, the head loss, and state the direction of flow.',
        constants: GW(sys),
        given: [{ sym: 'zA', label: 'Elevation A', value: zA, unit: u.L, sig: 3 }, { sym: 'uA', label: 'Pore pressure A', value: uA, unit: u.p, sig: 4 }, { sym: 'zB', label: 'Elevation B', value: zB, unit: u.L, sig: 3 }, { sym: 'uB', label: 'Pore pressure B', value: uB, unit: u.p, sig: 4 }],
        sketch: { type: 'heads', zA: zA, zB: zB, hpA: uA / u.gw, hpB: uB / u.gw, unit: u.L },
        assumptions: ['Velocity head v²/2g is negligible: seepage velocities are tiny (e.g. 1 cm/s gives v²/2g ≈ 0.005 cm).', 'Datum at elevation 0.'],
        parts: [
          { sym: 'hpA', label: 'Pressure head at A', expr: 'uA / gw', unit: u.L, why: 'Pressure head = u/γw.' },
          { sym: 'hA', label: 'Total head at A', expr: 'zA + hpA', unit: u.L, why: 'Bernoulli (velocity head neglected): h = Z + u/γw.' },
          { sym: 'hpB', label: 'Pressure head at B', expr: 'uB / gw', unit: u.L, why: 'Pressure head = u/γw.' },
          { sym: 'hB', label: 'Total head at B', expr: 'zB + hpB', unit: u.L, why: 'h = Z + u/γw.' },
          { sym: 'Dh', label: 'Head loss from A to B', expr: 'hA - hB', unit: u.L, why: 'Water flows from higher to lower TOTAL head; the difference is the head loss.', mistakes: [{ expr: 'hpB - hpA', msg: MS.pressureHead, tag: 'pressure-vs-total-head' }, { expr: 'hpA - hpB', msg: MS.pressureHead, tag: 'pressure-vs-total-head' }] }
        ],
        check: ['Δh > 0, so flow is from A to B even though the pressure at B is higher ✓'],
        interpret: 'Higher pressure does not mean flow direction: the TOTAL head decides. Here water flows from A to B.'
      };
    } });

  /* 2. Gradient and Darcy discharge */
  T.push({ id: 'c7-darcy-q', chapter: 7, topic: 'darcy', difficulty: 1, method: 'i = Δh/L; q = kiA; Q = qt',
    title: 'Darcy discharge and collected volume',
    generate: function (r) {
      var k = rs(r.range(0.002, 0.08), 2), Dh = r.range(20, 80, 0), L = r.range(15, 60, 0), A = r.pick([20, 30, 45, 60, 80]), t = r.pick([60, 120, 300, 600]);
      return {
        text: 'Water flows through a sand specimen (k = ' + U.fmt(k, 2) + ' cm/s, length ' + L + ' cm, cross-sectional area ' + A + ' cm²) under a head loss of ' + Dh + ' cm. Find the hydraulic gradient, the discharge rate, and the volume of water passing in ' + t + ' s.',
        given: [{ sym: 'k', label: 'Hydraulic conductivity', value: k, unit: 'cm/s', sig: 2 }, { sym: 'Dh', label: 'Head loss', value: Dh, unit: 'cm', sig: 3 }, { sym: 'L', label: 'Length', value: L, unit: 'cm', sig: 3 }, { sym: 'A', label: 'Area', value: A, unit: 'cm²', sig: 3 }, { sym: 't', label: 'Time', value: t, unit: 's', sig: 3 }],
        sketch: { type: 'darcy', L: L, Dh: Dh },
        assumptions: ['Laminar, steady flow through saturated soil (Darcy’s law valid).'],
        parts: [
          { sym: 'i', label: 'Hydraulic gradient', expr: 'Dh / L', unit: '', why: 'i = head loss per unit length of flow path (dimensionless).', mistakes: [{ expr: 'L / Dh', msg: 'You inverted the gradient. i = Δh/L: head loss divided by flow length, not L/Δh.', tag: 'gradient' }] },
          { sym: 'q', label: 'Discharge rate', expr: 'k * i * A', unit: 'cm³/s', why: 'Darcy: v = ki, and q = vA.', mistakes: [{ expr: 'k * i * A * t', msg: MS.volumeVsQ, tag: 'q-vs-volume' }] },
          { sym: 'Q', label: 'Volume in time t', expr: 'q * t', unit: 'cm³', why: 'Volume = rate × time.', mistakes: [{ expr: 'q', msg: MS.qVsVolume, tag: 'q-vs-volume' }] }
        ],
        check: ['Units: (cm/s)(–)(cm²) = cm³/s ✓'], interpret: 'Doubling the head loss doubles the flow (linear Darcy relationship).'
      };
    } });

  /* 3. Discharge vs seepage velocity */
  T.push({ id: 'c7-seepage-velocity', chapter: 7, topic: 'velocity', difficulty: 1, method: 'v = ki; n = e/(1+e); vs = v/n',
    title: 'Discharge velocity and seepage velocity',
    generate: function (r) {
      var k = rs(r.range(0.001, 0.05), 2), i = r.range(0.2, 1.2, 2), e = r.range(0.45, 0.9, 2);
      return {
        text: 'A sand with k = ' + U.fmt(k, 2) + ' cm/s and void ratio ' + e.toFixed(2) + ' carries flow under a hydraulic gradient of ' + i.toFixed(2) + '. Find the discharge velocity, the porosity, and the seepage velocity.',
        given: [{ sym: 'k', label: 'k', value: k, unit: 'cm/s', sig: 2 }, { sym: 'i', label: 'i', value: i, unit: '', sig: 3 }, { sym: 'e', label: 'e', value: e, unit: '', sig: 3 }],
        sketch: { type: 'seepage' },
        assumptions: ['Saturated soil; all voids are interconnected and conduct flow.'],
        parts: [
          { sym: 'v', label: 'Discharge velocity', expr: 'k * i', unit: 'cm/s', why: 'Darcy: v = ki (flow rate per TOTAL cross-sectional area).' },
          { sym: 'n', label: 'Porosity', expr: 'e / (1 + e)', unit: '%', why: 'n = e/(1 + e).', mistakes: [{ expr: 'e', msg: 'That is the void ratio; porosity n = e/(1 + e).', tag: 'e-vs-n' }] },
          { sym: 'vs', label: 'Seepage velocity', expr: 'v / n', unit: 'cm/s', why: 'Water passes only through the void area Av = nA (on average), so vs = v/n.', mistakes: [{ expr: 'v / e', msg: MS.vsWithE, tag: 'e-vs-n' }, { expr: 'v * n', msg: 'Seepage velocity is FASTER than v: divide by n.', tag: 'seepage-velocity' }, { expr: 'v', msg: MS.vsAsV, tag: 'seepage-velocity' }] }
        ],
        check: ['vs > v because n < 1 ✓'], interpret: 'Seepage velocity governs travel time of water or dissolved contaminants; discharge velocity governs flow quantity.'
      };
    } });

  /* 4. Constant-head test → k */
  T.push({ id: 'c7-const-head-k', chapter: 7, topic: 'constant-head', difficulty: 2, method: 'k = QL/(Aht)',
    title: 'Constant-head test: find k',
    generate: function (r) {
      var D = r.pick([5, 6, 7.5, 10]), L = r.pick([15, 20, 25, 30]), h = r.range(40, 90, 0), t = r.pick([60, 120, 180, 300]);
      var k = r.range(0.005, 0.08), A = Math.PI * D * D / 4, Q = rs(k * h / L * A * t, 3);
      return {
        text: 'In a constant-head test, a sand specimen ' + D + ' cm in diameter and ' + L + ' cm long is tested under a constant head difference of ' + h + ' cm. ' + Q + ' cm³ of water is collected in ' + t + ' s. Find the specimen area, discharge rate and hydraulic conductivity.',
        given: [{ sym: 'dia', label: 'Specimen diameter', value: D, unit: 'cm', sig: 3 }, { sym: 'L', label: 'Specimen length', value: L, unit: 'cm', sig: 3 }, { sym: 'h', label: 'Head difference', value: h, unit: 'cm', sig: 3 }, { sym: 'Q', label: 'Collected volume', value: Q, unit: 'cm³', sig: 3 }, { sym: 't', label: 'Time', value: t, unit: 's', sig: 3 }],
        sketch: { type: 'constantHead', L: L, D: D, h: h, Q: Q, t: t },
        assumptions: ['Steady flow; specimen fully saturated; head difference h is the TOTAL head loss across the specimen.'],
        parts: [
          { sym: 'A', label: 'Specimen area', expr: 'pi * dia ^ 2 / 4', unit: 'cm²', why: 'A = πD²/4.', mistakes: [{ expr: 'pi * dia ^ 2', msg: 'πD² is four times the area. Use πD²/4 (or πr²).', tag: 'area' }] },
          { sym: 'q', label: 'Discharge rate', expr: 'Q / t', unit: 'cm³/s', why: 'q = Q/t.', mistakes: [{ expr: 'Q', msg: MS.qVsVolume, tag: 'q-vs-volume' }] },
          { sym: 'k', label: 'Hydraulic conductivity', expr: 'Q * L / (A * h * t)', unit: 'cm/s', why: 'Q = qt = k(h/L)At → k = QL/(Aht).', mistakes: [{ expr: 'Q * L / (A * h)', msg: 'You forgot to divide by time: Q is a volume; k needs q = Q/t.', tag: 'q-vs-volume' }, { expr: 'Q * h / (A * L * t)', msg: 'i = h/L, so L goes in the numerator of k: k = QL/(Aht).', tag: 'gradient' }] }
        ],
        check: ['k in the 10⁻³–1 cm/s range is typical of sands ✓'], interpret: 'The constant-head test suits relatively permeable (granular) soils that produce measurable flow quickly.'
      };
    } });

  /* 5. Constant-head prediction of volume */
  T.push({ id: 'c7-const-head-Q', chapter: 7, topic: 'constant-head', difficulty: 1, method: 'Q = k(h/L)At',
    title: 'Constant-head test: predict the collected volume',
    generate: function (r) {
      var k = rs(r.range(0.003, 0.05), 2), L = r.pick([20, 25, 30, 35]), A = r.pick([40, 50, 78.5, 100]), h = r.range(30, 75, 0), t = r.pick([60, 90, 180, 240]);
      return {
        text: 'A constant-head test is planned on a sand with k ≈ ' + U.fmt(k, 2) + ' cm/s. Specimen: L = ' + L + ' cm, A = ' + A + ' cm²; head difference ' + h + ' cm. How much water should be collected in ' + t + ' s?',
        given: [{ sym: 'k', label: 'k', value: k, unit: 'cm/s', sig: 2 }, { sym: 'L', label: 'L', value: L, unit: 'cm', sig: 3 }, { sym: 'A', label: 'A', value: A, unit: 'cm²', sig: 3 }, { sym: 'h', label: 'h', value: h, unit: 'cm', sig: 3 }, { sym: 't', label: 't', value: t, unit: 's', sig: 3 }],
        sketch: { type: 'constantHead', L: L, D: Math.sqrt(4 * A / Math.PI), h: h, t: t },
        assumptions: ['Steady laminar flow.'],
        parts: [
          { sym: 'i', label: 'Gradient', expr: 'h / L', unit: '', why: 'i = h/L.' },
          { sym: 'Q', label: 'Collected volume', expr: 'k * i * A * t', unit: 'cm³', why: 'Q = qt = kiAt.', mistakes: [{ expr: 'k * i * A', msg: MS.volumeVsQ, tag: 'q-vs-volume' }] }
        ],
        check: ['Volume grows linearly with time and head ✓'], interpret: 'Predicting the volume beforehand lets you choose a sensible collection time and container.'
      };
    } });

  /* 6. Falling-head test → k */
  T.push({ id: 'c7-falling-head-k', chapter: 7, topic: 'falling-head', difficulty: 2, method: 'k = 2.303(aL/At)log₁₀(h₁/h₂)',
    title: 'Falling-head test: find k',
    generate: function (r) {
      var d = r.pick([0.5, 0.6, 0.8, 1.0, 1.2]), D = r.pick([6, 7.5, 10]), L = r.pick([8, 10, 12, 15]), h1 = r.pick([90, 100, 120, 150]);
      var k = Math.pow(10, r.range(-5.5, -3.5)), a = Math.PI * d * d / 4, A = Math.PI * D * D / 4;
      var t = rs(P.fallingHeadT(a, L, A, k, h1, h1 * r.range(0.45, 0.75)), 3); var h2 = U.roundTo(P.fallingHeadH2(a, L, A, k, h1, t), 1);
      return {
        text: 'A falling-head test is run on a silty soil specimen ' + D + ' cm in diameter and ' + L + ' cm long. The standpipe has an inside diameter of ' + d + ' cm. The head drops from ' + h1 + ' cm to ' + h2 + ' cm in ' + t + ' s. Find the standpipe area a, the specimen area A and the hydraulic conductivity.',
        given: [{ sym: 'd', label: 'Standpipe diameter', value: d, unit: 'cm', sig: 2 }, { sym: 'dia', label: 'Specimen diameter', value: D, unit: 'cm', sig: 3 }, { sym: 'L', label: 'Length', value: L, unit: 'cm', sig: 3 },
                { sym: 'h1', label: 'Initial head', value: h1, unit: 'cm', sig: 3 }, { sym: 'h2', label: 'Final head', value: h2, unit: 'cm', sig: 4 }, { sym: 't', label: 'Elapsed time', value: t, unit: 's', sig: 3 }],
        sketch: { type: 'fallingHead', d: d, D: D, L: L, h1: h1, h2: h2, t: t },
        assumptions: ['Saturated specimen; heads measured as total head above the outlet level.', 'Flow into the specimen equals the drop in standpipe storage: −a dh/dt = k(h/L)A.'],
        parts: [
          { sym: 'a', label: 'Standpipe area', expr: 'pi * d ^ 2 / 4', unit: 'cm²', why: 'a = πd²/4 (standpipe).' },
          { sym: 'A', label: 'Specimen area', expr: 'pi * dia ^ 2 / 4', unit: 'cm²', why: 'A = πD²/4 (specimen).' },
          { sym: 'k', label: 'Hydraulic conductivity', expr: '2.303 * a * L / (A * t) * log10(h1 / h2)', unit: 'cm/s', why: 'Integrating −a dh/dt = k(h/L)A from h₁ to h₂: k = (aL/At)ln(h₁/h₂) = 2.303(aL/At)log₁₀(h₁/h₂).',
            alts: ['A * L / (a * t) * ln(h1 / h2)', 'a * L / (A * t) * log10(h1 / h2)', 'a * L / (A * t) * (h1 - h2)'],
            mistakes: [{ expr: '2.303 * A * L / (a * t) * log10(h1 / h2)', msg: MS.aSwap, tag: 'area-swap' }, { expr: 'a * L / (A * t) * log10(h1 / h2)', msg: 'You used log₁₀ without the factor 2.303. Either use ln(h₁/h₂), or 2.303·log₁₀(h₁/h₂).', tag: 'log' }, { expr: '2.303 * a * L / (A * t) * ln(h1 / h2)', msg: 'You used 2.303 together with ln. The 2.303 factor belongs only with log₁₀.', tag: 'log' }] }
        ],
        check: ['k between 10⁻⁶ and 10⁻³ cm/s fits silts and clayey soils ✓', 'h₂ < h₁ so log₁₀(h₁/h₂) > 0 ✓'],
        interpret: 'The falling-head test is used for less permeable soils where a constant-head test would collect too little water.'
      };
    } });

  /* 7. Falling-head time */
  T.push({ id: 'c7-falling-head-t', chapter: 7, topic: 'falling-head', difficulty: 2, method: 't = (aL/Ak)ln(h₁/h₂)',
    title: 'Falling-head test: time for a head drop',
    generate: function (r) {
      var a = r.pick([0.2, 0.3, 0.5, 0.8]), A = r.pick([30, 45, 60, 80]), L = r.pick([10, 12, 15]), k = rs(Math.pow(10, r.range(-5, -3.7)), 2), h1 = r.pick([100, 120, 150]), h2 = r.pick([40, 50, 60, 75]);
      return {
        text: 'A clayey sand with k = ' + U.fmt(k, 2) + ' cm/s is tested in a falling-head permeameter: a = ' + a + ' cm², A = ' + A + ' cm², L = ' + L + ' cm. How long will it take the head to fall from ' + h1 + ' cm to ' + h2 + ' cm?',
        given: [{ sym: 'a', label: 'Standpipe area', value: a, unit: 'cm²', sig: 2 }, { sym: 'A', label: 'Specimen area', value: A, unit: 'cm²', sig: 2 }, { sym: 'L', label: 'Length', value: L, unit: 'cm', sig: 2 }, { sym: 'k', label: 'k', value: k, unit: 'cm/s', sig: 2 }, { sym: 'h1', label: 'h₁', value: h1, unit: 'cm', sig: 3 }, { sym: 'h2', label: 'h₂', value: h2, unit: 'cm', sig: 2 }],
        sketch: { type: 'fallingHead', d: Math.sqrt(4 * a / Math.PI), D: Math.sqrt(4 * A / Math.PI), L: L, h1: h1, h2: h2 },
        assumptions: ['Same assumptions as the falling-head equation.'],
        parts: [
          { sym: 't', label: 'Time', expr: 'a * L / (A * k) * ln(h1 / h2)', unit: 's', why: 'Rearrange k = (aL/At)ln(h₁/h₂) for t.', mistakes: [{ expr: 'A * L / (a * k) * ln(h1 / h2)', msg: MS.aSwap, tag: 'area-swap' }, { expr: 'a * L / (A * k) * log10(h1 / h2)', msg: 'log₁₀ without 2.303: use ln(h₁/h₂) = 2.303 log₁₀(h₁/h₂).', tag: 'log' }] }
        ],
        check: ['Larger standpipe area a → longer time (more water to drain) ✓'], interpret: 'Choosing a smaller standpipe speeds up tests on low-permeability soils.'
      };
    } });

  /* 8. Falling-head: head after time t */
  T.push({ id: 'c7-falling-head-h2', chapter: 7, topic: 'falling-head', difficulty: 3, method: 'h₂ = h₁·exp(−kAt/(aL))',
    title: 'Falling-head test: head after a given time',
    generate: function (r) {
      var a = r.pick([0.4, 0.5, 0.7]), A = r.pick([40, 50, 70]), L = r.pick([10, 15]), k = rs(Math.pow(10, r.range(-4.8, -4)), 2), h1 = r.pick([100, 120]), t = r.pick([300, 600, 900, 1200]);
      return {
        text: 'Falling-head test: a = ' + a + ' cm², A = ' + A + ' cm², L = ' + L + ' cm, k = ' + U.fmt(k, 2) + ' cm/s. The initial head is ' + h1 + ' cm. What is the head after ' + t + ' s?',
        given: [{ sym: 'a', label: 'a', value: a, unit: 'cm²', sig: 2 }, { sym: 'A', label: 'A', value: A, unit: 'cm²', sig: 2 }, { sym: 'L', label: 'L', value: L, unit: 'cm', sig: 2 }, { sym: 'k', label: 'k', value: k, unit: 'cm/s', sig: 2 }, { sym: 'h1', label: 'h₁', value: h1, unit: 'cm', sig: 3 }, { sym: 't', label: 't', value: t, unit: 's', sig: 3 }],
        sketch: { type: 'fallingHead', d: Math.sqrt(4 * a / Math.PI), D: Math.sqrt(4 * A / Math.PI), L: L, h1: h1 },
        assumptions: ['Falling-head equation applies.'],
        parts: [
          { sym: 'x', label: 'Exponent kAt/(aL)', expr: 'k * A * t / (a * L)', unit: '', why: 'From ln(h₁/h₂) = kAt/(aL).' },
          { sym: 'h2', label: 'Head after time t', expr: 'h1 * exp(-x)', unit: 'cm', why: 'h₂ = h₁e^(−kAt/aL) (take the antilog of both sides).', mistakes: [{ expr: 'h1 * 10 ^ (-x)', msg: 'The exponent came from a NATURAL log, so use e^(−x), not 10^(−x).', tag: 'log' }] }
        ],
        check: ['0 < h₂ < h₁ ✓'], interpret: 'The head decays exponentially: equal time intervals give equal RATIOS h₁/h₂.'
      };
    } });

  /* 9. Temperature correction */
  T.push({ id: 'c7-temperature', chapter: 7, topic: 'temperature', difficulty: 1, method: 'k20 = kT(ηT/η20)',
    title: 'Correcting k to 20 °C',
    generate: function (r) {
      var T_ = r.pick([15, 16, 17, 18, 22, 23, 24, 25, 26, 27, 28, 30]), kT = rs(Math.pow(10, r.range(-4, -1.5)), 3), ratio = P.etaRatio(T_);
      return {
        text: 'A permeability test performed at ' + T_ + ' °C gives k = ' + U.fmt(kT, 3) + ' cm/s. For water, ηT/η20 = ' + ratio.toFixed(3) + ' at this temperature. Report k at the standard 20 °C.',
        constants: [{ sym: 'etaRatio', value: ratio, unit: '', label: 'viscosity ratio at ' + T_ + ' °C' }],
        given: [{ sym: 'kT', label: 'k at test temperature', value: kT, unit: 'cm/s', sig: 3 }],
        assumptions: ['Only the water viscosity changes with temperature (unit weight change neglected).'],
        parts: [
          { sym: 'k20', label: 'k at 20 °C', expr: 'kT * etaRatio', unit: 'cm/s', why: 'k ∝ γw/η. Hence k20/kT = ηT/η20.', mistakes: [{ expr: 'kT / etaRatio', msg: MS.tempInv, tag: 'temperature' }] }
        ],
        check: [T_ > 20 ? 'Test above 20 °C → k20 < kT ✓' : 'Test below 20 °C → k20 > kT ✓'],
        interpret: 'Standardising to 20 °C allows tests run on different days and in different labs to be compared.'
      };
    } });

  /* 10. Intrinsic permeability */
  T.push({ id: 'c7-intrinsic', chapter: 7, topic: 'intrinsic', difficulty: 2, method: 'K = kη/γw',
    title: 'Intrinsic (absolute) permeability',
    generate: function (r) {
      var k = rs(Math.pow(10, r.range(-4, -1)), 2);
      return {
        text: 'A sand has k = ' + U.fmt(k, 2) + ' cm/s for water at 20 °C (η = 1.002 × 10⁻³ Pa·s, γw = 9.79 kN/m³ at 20 °C). Find the intrinsic permeability K in m² and cm².',
        constants: [{ sym: 'eta', value: 1.002e-3, unit: 'Pa·s', label: 'water viscosity, 20 °C' }, { sym: 'gwN', value: 9789, unit: 'N/m³', label: 'unit weight of water, 20 °C' }],
        given: [{ sym: 'k', label: 'k', value: k, unit: 'cm/s', sig: 2 }],
        assumptions: ['Darcy flow of water at 20 °C.'],
        parts: [
          { sym: 'km', label: 'k in m/s', expr: 'k / 100', unit: 'm/s', why: 'Convert to SI base units first: 1 cm/s = 0.01 m/s.' },
          { sym: 'Kp', label: 'Intrinsic permeability (m²)', expr: 'km * eta / gwN', unit: 'm²', dim: 'permeability', why: 'k = Kγw/η → K = kη/γw. Units: (m/s)(N·s/m²)/(N/m³) = m².', mistakes: [{ expr: 'k * eta / gwN', msg: 'Convert k to m/s before substituting SI values of η and γw.', tag: 'units' }] },
          { sym: 'Kcm', label: 'Intrinsic permeability (cm²)', expr: 'Kp * 10000', unit: 'cm²', dim: 'permeability', why: '1 m² = 10⁴ cm².' }
        ],
        check: ['K has units of AREA (it depends only on the pore geometry) ✓'],
        interpret: 'K describes the soil alone; k depends on the soil AND the fluid (through γw/η). Oil or hot water would give a different k for the same K.'
      };
    } });

  /* 11. Hazen */
  T.push({ id: 'c7-hazen', chapter: 7, topic: 'empirical-granular', difficulty: 1, method: 'k(cm/s) = cD₁₀² (D₁₀ in mm)',
    title: 'Hazen’s estimate for a clean sand',
    generate: function (r) {
      var D10 = r.pick([0.1, 0.12, 0.15, 0.18, 0.2, 0.25, 0.3, 0.4]), c = 1.0;
      return {
        text: 'A clean, uniform sand has an effective size D₁₀ = ' + D10 + ' mm. Estimate k with Hazen’s formula using c = 1.0. Express the answer in cm/s.',
        constants: [{ sym: 'c', value: c, unit: '', label: 'Hazen constant (assumed; reported values vary)' }],
        given: [{ sym: 'D10', label: 'Effective size D₁₀', value: D10, unit: 'mm', sig: 2 }],
        assumptions: ['Hazen’s formula applies to clean, fairly uniform sands; D₁₀ must be in mm to give k in cm/s.', 'c is an empirical constant; ±factor-of-several uncertainty is normal.'],
        parts: [
          { sym: 'k', label: 'Estimated k', expr: 'c * D10 ^ 2', unit: 'cm/s', why: 'Hazen: k = cD₁₀² with D₁₀ in mm gives cm/s.', mistakes: [{ expr: 'c * (D10 / 10) ^ 2', msg: 'Keep D₁₀ in millimetres; the constant c was calibrated for D₁₀ in mm and k in cm/s.', tag: 'units' }, { expr: 'c * D10', msg: 'Square D₁₀: k = cD₁₀².', tag: 'formula' }] }
        ],
        check: ['Result lies in the fine-to-medium sand range (≈10⁻³ to 10⁻¹ cm/s) ✓'], interpret: 'Empirical estimates are for screening; laboratory or field tests are needed for design.'
      };
    } });

  /* 12. Chapuis */
  T.push({ id: 'c7-chapuis', chapter: 7, topic: 'empirical-granular', difficulty: 2, method: 'Chapuis (2004): k = 2.4622[D₁₀²e³/(1+e)]^0.7825',
    title: 'Chapuis (2004) estimate for sand and gravel',
    generate: function (r) {
      var D10 = r.pick([0.08, 0.1, 0.15, 0.2, 0.3, 0.5]), e = r.range(0.4, 0.9, 2);
      return {
        text: 'Estimate k for a natural sand with D₁₀ = ' + D10 + ' mm and e = ' + e.toFixed(2) + ' using Chapuis (2004).',
        given: [{ sym: 'D10', label: 'D₁₀', value: D10, unit: 'mm', sig: 2 }, { sym: 'e', label: 'Void ratio', value: e, unit: '', sig: 3 }],
        assumptions: ['Natural sands and gravels with roughly 0.3 < e < 1; D₁₀ in mm, k in cm/s.'],
        parts: [
          { sym: 'x', label: 'Group D₁₀²e³/(1+e)', expr: 'D10 ^ 2 * e ^ 3 / (1 + e)', unit: '', why: 'Evaluate the grouped term first.' },
          { sym: 'k', label: 'Estimated k', expr: '2.4622 * x ^ 0.7825', unit: 'cm/s', why: 'Chapuis (2004): k = 2.4622·x^0.7825.' }
        ],
        check: ['Typical sand range ✓'], interpret: 'This correlation accounts for both grain size and packing (through e).'
      };
    } });

  /* 13. Kozeny–Carman ratio */
  T.push({ id: 'c7-kozeny', chapter: 7, topic: 'empirical-granular', difficulty: 2, method: 'k₂/k₁ = [e₂³/(1+e₂)]/[e₁³/(1+e₁)]',
    title: 'Effect of void ratio on k of a sand',
    generate: function (r) {
      var k1 = rs(Math.pow(10, r.range(-3, -1.5)), 2), e1 = r.range(0.55, 0.8, 2), e2 = U.roundTo(e1 - r.range(0.08, 0.2), 2);
      return {
        text: 'A sand has k = ' + U.fmt(k1, 2) + ' cm/s at e = ' + e1.toFixed(2) + '. Using the Kozeny–Carman form k ∝ e³/(1 + e), estimate k after densification to e = ' + e2.toFixed(2) + '.',
        given: [{ sym: 'k1', label: 'k at e₁', value: k1, unit: 'cm/s', sig: 2 }, { sym: 'e1', label: 'e₁', value: e1, unit: '', sig: 3 }, { sym: 'e2', label: 'e₂', value: e2, unit: '', sig: 3 }],
        assumptions: ['Same sand (grain size, shape and fabric unchanged); only e changes.'],
        parts: [
          { sym: 'k2', label: 'k at e₂', expr: 'k1 * (e2 ^ 3 / (1 + e2)) / (e1 ^ 3 / (1 + e1))', unit: 'cm/s', why: 'Write k = C·e³/(1+e) for both states and divide; C cancels.', mistakes: [{ expr: 'k1 * (e1 ^ 3 / (1 + e1)) / (e2 ^ 3 / (1 + e2))', msg: 'The ratio is inverted: a denser sand (smaller e) must have a SMALLER k.', tag: 'empirical' }, { expr: 'k1 * e2 / e1', msg: 'k is not proportional to e; it varies with e³/(1 + e).', tag: 'empirical' }] }
        ],
        check: ['k₂ < k₁ for e₂ < e₁ ✓'], interpret: 'A modest decrease in void ratio causes a much larger relative decrease in k.'
      };
    } });

  /* 14. Casagrande */
  T.push({ id: 'c7-casagrande', chapter: 7, topic: 'empirical-granular', difficulty: 1, method: 'k = 1.4e²k₀.₈₅',
    title: 'Casagrande relation for fine-to-medium clean sand',
    generate: function (r) {
      var k085 = rs(Math.pow(10, r.range(-3, -1.8)), 2), e = r.range(0.45, 0.8, 2);
      return {
        text: 'For a fine-to-medium clean sand, k at e = 0.85 is ' + U.fmt(k085, 2) + ' cm/s. Estimate k at e = ' + e.toFixed(2) + ' with Casagrande’s relation.',
        given: [{ sym: 'k085', label: 'k at e = 0.85', value: k085, unit: 'cm/s', sig: 2 }, { sym: 'e', label: 'e', value: e, unit: '', sig: 3 }],
        assumptions: ['Fine-to-medium clean sand.'],
        parts: [{ sym: 'k', label: 'k at e', expr: '1.4 * e ^ 2 * k085', unit: 'cm/s', why: 'Casagrande: k = 1.4e²k₀.₈₅.', mistakes: [{ expr: '1.4 * e * k085', msg: 'Square the void ratio: k = 1.4e²k₀.₈₅.', tag: 'empirical' }] }],
        check: ['At e = 0.85 the formula returns ≈ k₀.₈₅ (1.4 × 0.85² ≈ 1.01) ✓'], interpret: 'Like Kozeny–Carman, this shows k decreasing strongly with e.'
      };
    } });

  /* 15. Taylor for clay */
  T.push({ id: 'c7-taylor-clay', chapter: 7, topic: 'empirical-cohesive', difficulty: 3, method: 'log k = log k₀ − (e₀ − e)/Ck, Ck ≈ 0.5e₀',
    title: 'Hydraulic conductivity of a clay after compression',
    generate: function (r) {
      var e0 = r.range(1.0, 2.2, 2), k0 = rs(Math.pow(10, r.range(-8, -6.5)), 2), e = U.roundTo(e0 - r.range(0.15, 0.45), 2);
      return {
        text: 'A soft clay has k₀ = ' + U.fmt(k0, 2) + ' cm/s at its in-situ void ratio e₀ = ' + e0.toFixed(2) + '. After consolidation, e = ' + e.toFixed(2) + '. Using Taylor’s relation with Ck = 0.5e₀ (Tavenas et al. 1983, for e₀ below about 2.5), estimate the new k.',
        given: [{ sym: 'k0', label: 'k₀', value: k0, unit: 'cm/s', sig: 2 }, { sym: 'e0', label: 'e₀', value: e0, unit: '', sig: 3 }, { sym: 'e', label: 'e', value: e, unit: '', sig: 3 }],
        assumptions: ['Natural (structured) clay; Ck ≈ 0.5e₀ is an approximation.'],
        parts: [
          { sym: 'Ck', label: 'Ck', expr: '0.5 * e0', unit: '', why: 'Ck ≈ 0.5e₀.' },
          { sym: 'k', label: 'New k', expr: 'k0 * 10 ^ (-(e0 - e) / Ck)', unit: 'cm/s', why: 'log k = log k₀ − (e₀ − e)/Ck → k = k₀·10^[−(e₀ − e)/Ck].', mistakes: [{ expr: 'k0 * exp(-(e0 - e) / Ck)', msg: 'Taylor’s relation uses base-10 logs: k = k₀·10^(…), not e^(…).', tag: 'log' }] }
        ],
        check: ['k decreases as the clay compresses ✓'], interpret: 'Consolidation slows further drainage because the clay becomes less permeable.'
      };
    } });

  /* 16. Samarasinghe et al. (1982) */
  T.push({ id: 'c7-samarasinghe', chapter: 7, topic: 'empirical-cohesive', difficulty: 3, method: 'k = C₃eⁿ/(1+e): find n from two tests',
    title: 'Normally consolidated clay: k = C₃eⁿ/(1 + e)',
    generate: function (r) {
      var nexp = r.range(3, 6), C3 = Math.pow(10, r.range(-7, -6)), e1 = r.range(1.0, 1.4, 2), e2 = U.roundTo(e1 - r.range(0.2, 0.35), 2), e3 = U.roundTo(e2 - r.range(0.1, 0.2), 2);
      var f = function (e) { return rs(C3 * Math.pow(e, nexp) / (1 + e), 3); };
      return {
        text: 'For a normally consolidated clay, k = ' + U.fmt(f(e1), 3) + ' cm/s at e = ' + e1.toFixed(2) + ' and k = ' + U.fmt(f(e2), 3) + ' cm/s at e = ' + e2.toFixed(2) + '. Using k = C₃eⁿ/(1 + e) (Samarasinghe et al. 1982), find n and estimate k at e = ' + e3.toFixed(2) + '.',
        given: [{ sym: 'k1', label: 'k₁', value: f(e1), unit: 'cm/s', sig: 3 }, { sym: 'e1', label: 'e₁', value: e1, unit: '', sig: 3 }, { sym: 'k2', label: 'k₂', value: f(e2), unit: 'cm/s', sig: 3 }, { sym: 'e2', label: 'e₂', value: e2, unit: '', sig: 3 }, { sym: 'e3', label: 'e₃', value: e3, unit: '', sig: 3 }],
        assumptions: ['Normally consolidated clay; C₃ and n are constants for this soil.'],
        parts: [
          { sym: 'nexp', label: 'Exponent n', expr: 'log10(k1 * (1 + e1) / (k2 * (1 + e2))) / log10(e1 / e2)', unit: '', why: 'Divide the two equations: k₁/k₂ = (e₁/e₂)ⁿ·(1 + e₂)/(1 + e₁); take logs and solve for n.' },
          { sym: 'k3', label: 'k at e₃', expr: 'k2 * (e3 / e2) ^ nexp * (1 + e2) / (1 + e3)', unit: 'cm/s', why: 'Ratio with test 2: k₃/k₂ = (e₃/e₂)ⁿ(1 + e₂)/(1 + e₃).' }
        ],
        check: ['k₃ < k₂ for e₃ < e₂ ✓'], interpret: 'Two tests calibrate the relation; it is then used to estimate k at other void ratios during consolidation.'
      };
    } });

  /* 17. Parallel layers */
  function layers(r, sys) {
    var n = r.pick([2, 3, 3]), out = [];
    for (var j = 0; j < n; j++) out.push({ H: sys === 'SI' ? r.pick([0.5, 1, 1.5, 2, 3]) : r.pick([2, 3, 5, 6, 8]), k: rs(Math.pow(10, r.range(-6, -2)), 2) });
    return out;
  }
  function layerGiven(Ls, Lu) {
    var g = [];
    Ls.forEach(function (l, j) { g.push({ sym: 'H' + (j + 1), label: 'Thickness of layer ' + (j + 1), value: l.H, unit: Lu, sig: 2 }); g.push({ sym: 'k' + (j + 1), label: 'k of layer ' + (j + 1), value: l.k, unit: 'cm/s', sig: 2 }); });
    return g;
  }
  function sumExpr(Ls, f) { return Ls.map(function (l, j) { return f(j + 1); }).join(' + '); }

  T.push({ id: 'c7-layers-parallel', chapter: 7, topic: 'layered', difficulty: 2, method: 'k_H(eq) = Σ(kᵢHᵢ)/H',
    title: 'Equivalent k for flow parallel to layers',
    generate: function (r, sys) {
      var Lu = sys === 'SI' ? 'm' : 'ft', Ls = layers(r, sys);
      return {
        text: 'A stratified deposit consists of ' + Ls.length + ' horizontal layers (top to bottom): ' + Ls.map(function (l, j) { return 'layer ' + (j + 1) + ': H = ' + l.H + ' ' + Lu + ', k = ' + U.fmt(l.k, 2) + ' cm/s'; }).join('; ') + '. Each layer is isotropic. Find the total thickness and the equivalent hydraulic conductivity for HORIZONTAL flow (parallel to the layers).',
        given: layerGiven(Ls, Lu),
        sketch: { type: 'layers', layers: Ls, dir: 'H', unit: Lu },
        assumptions: ['Flow parallel to bedding: every layer has the SAME hydraulic gradient; the flows add.'],
        parts: [
          { sym: 'Ht', label: 'Total thickness', expr: sumExpr(Ls, function (j) { return 'H' + j; }), unit: Lu, why: 'Add layer thicknesses.' },
          { sym: 'kHeq', label: 'k_H(eq)', expr: '(' + sumExpr(Ls, function (j) { return 'k' + j + ' * H' + j; }) + ') / Ht', unit: 'cm/s', why: 'Same i in every layer: q = Σkᵢ i Hᵢ = k_H(eq)·i·H, so k_H(eq) = Σ(kᵢHᵢ)/H — a thickness-weighted average dominated by the MOST permeable layer.',
            mistakes: [{ expr: 'Ht / (' + sumExpr(Ls, function (j) { return 'H' + j + ' / k' + j; }) + ')', msg: MS.kHkV, tag: 'layered' }] }
        ],
        check: ['k_H(eq) lies between the smallest and largest kᵢ and is close to the largest ✓'], interpret: 'Horizontal flow is carried mainly by the most permeable layer.'
      };
    } });

  /* 18. Perpendicular layers */
  T.push({ id: 'c7-layers-perp', chapter: 7, topic: 'layered', difficulty: 2, method: 'k_V(eq) = H/Σ(Hᵢ/kᵢ)',
    title: 'Equivalent k for flow perpendicular to layers',
    generate: function (r, sys) {
      var Lu = sys === 'SI' ? 'm' : 'ft', Ls = layers(r, sys);
      var kh = '(' + sumExpr(Ls, function (j) { return 'k' + j + ' * H' + j; }) + ') / Ht';
      return {
        text: 'For the layered deposit — ' + Ls.map(function (l, j) { return 'layer ' + (j + 1) + ': H = ' + l.H + ' ' + Lu + ', k = ' + U.fmt(l.k, 2) + ' cm/s'; }).join('; ') + ' — find the equivalent hydraulic conductivity for VERTICAL flow (perpendicular to the layers), and the ratio k_H(eq)/k_V(eq).',
        given: layerGiven(Ls, Lu),
        sketch: { type: 'layers', layers: Ls, dir: 'V', unit: Lu },
        assumptions: ['Flow perpendicular to bedding: the SAME discharge velocity passes through every layer; the head losses add.'],
        parts: [
          { sym: 'Ht', label: 'Total thickness', expr: sumExpr(Ls, function (j) { return 'H' + j; }), unit: Lu, why: 'Add layer thicknesses.' },
          { sym: 'kVeq', label: 'k_V(eq)', expr: 'Ht / (' + sumExpr(Ls, function (j) { return 'H' + j + ' / k' + j; }) + ')', unit: 'cm/s', why: 'Same v in each layer: Δhᵢ = vHᵢ/kᵢ; Σ Δhᵢ = vH/k_V(eq) → k_V(eq) = H/Σ(Hᵢ/kᵢ). Controlled by the LEAST permeable layer.',
            mistakes: [{ expr: kh, msg: MS.kHkV, tag: 'layered' }] },
          { sym: 'ratio', label: 'k_H(eq)/k_V(eq)', expr: '(' + kh + ') / kVeq', unit: '', why: 'Compute k_H(eq) = Σ(kᵢHᵢ)/H and divide.' }
        ],
        check: ['k_H(eq) ≥ k_V(eq) always (ratio ≥ 1) ✓'], interpret: 'Layered soils are strongly anisotropic: vertical drainage is throttled by the tightest layer.'
      };
    } });

  /* 19. Head loss distribution in perpendicular flow */
  T.push({ id: 'c7-layers-headloss', chapter: 7, topic: 'layered', difficulty: 3, method: 'v = k_V(eq)Δh/H; Δhᵢ = vHᵢ/kᵢ',
    title: 'Head loss in each layer (vertical flow)',
    generate: function (r) {
      var H1 = r.pick([0.3, 0.5, 0.6]), H2 = r.pick([0.2, 0.3, 0.4]), k1 = rs(Math.pow(10, r.range(-3, -2)), 2), k2 = rs(Math.pow(10, r.range(-5, -4)), 2), Dh = r.pick([0.5, 0.8, 1.0, 1.2]);
      return {
        text: 'Water flows vertically downward through two layers: sand (H₁ = ' + H1 + ' m, k₁ = ' + U.fmt(k1, 2) + ' cm/s) over silt (H₂ = ' + H2 + ' m, k₂ = ' + U.fmt(k2, 2) + ' cm/s). The total head loss across both layers is ' + Dh + ' m. Find k_V(eq), the discharge velocity, and the head loss in each layer.',
        given: [{ sym: 'H1', label: 'H₁', value: H1, unit: 'm', sig: 2 }, { sym: 'k1', label: 'k₁', value: k1, unit: 'cm/s', sig: 2 }, { sym: 'H2', label: 'H₂', value: H2, unit: 'm', sig: 2 }, { sym: 'k2', label: 'k₂', value: k2, unit: 'cm/s', sig: 2 }, { sym: 'Dh', label: 'Total head loss', value: Dh, unit: 'm', sig: 2 }],
        sketch: { type: 'layers', layers: [{ H: H1, k: k1 }, { H: H2, k: k2 }], dir: 'V', unit: 'm' },
        assumptions: ['Steady one-dimensional vertical flow; layers saturated.'],
        parts: [
          { sym: 'kVeq', label: 'k_V(eq)', expr: '(H1 + H2) / (H1 / k1 + H2 / k2)', unit: 'cm/s', why: 'k_V(eq) = H/Σ(Hᵢ/kᵢ).', mistakes: [{ expr: '(k1 * H1 + k2 * H2) / (H1 + H2)', msg: MS.kHkV, tag: 'layered' }] },
          { sym: 'v', label: 'Discharge velocity', expr: 'kVeq * Dh / (H1 + H2)', unit: 'cm/s', why: 'v = k_V(eq)·i with i = Δh/H. (i is dimensionless, so k’s velocity unit carries through.)' },
          { sym: 'Dh1', label: 'Head loss in sand', expr: 'Dh * (H1 / k1) / (H1 / k1 + H2 / k2)', unit: 'm', why: 'Δhᵢ = vHᵢ/kᵢ; equivalently Δh·(Hᵢ/kᵢ)/Σ(Hⱼ/kⱼ), which avoids unit conversion.' },
          { sym: 'Dh2', label: 'Head loss in silt', expr: 'Dh - Dh1', unit: 'm', why: 'Head losses add up to the total.' }
        ],
        check: ['Most of the head is lost in the low-k layer ✓', 'Δh₁ + Δh₂ = Δh ✓'], interpret: 'The silt controls the flow; its large gradient matters for stability (piping, uplift).'
      };
    } });

  /* 20. Pumping test — unconfined */
  T.push({ id: 'c7-pump-unconfined', chapter: 7, topic: 'field', difficulty: 2, method: 'k = 2.303q log₁₀(r₁/r₂)/[π(h₁² − h₂²)]',
    title: 'Pumping test in an unconfined aquifer',
    generate: function (r, sys) {
      var u = L_(sys), si = sys === 'SI';
      var r1 = si ? r.pick([40, 50, 60, 80]) : r.pick([150, 200, 250]), r2 = si ? r.pick([10, 15, 20]) : r.pick([40, 50, 60]);
      var h2 = si ? r.range(4, 7, 2) : r.range(14, 22, 1), h1 = U.roundTo(h2 + (si ? r.range(0.3, 1.2) : r.range(1, 4)), 2);
      var q = si ? rs(r.range(0.005, 0.03), 2) : rs(r.range(5, 25), 2);
      return {
        text: 'A well fully penetrating an unconfined permeable layer is pumped at a steady rate of ' + q + ' ' + u.q + '. In observation wells at radial distances ' + r1 + ' ' + u.L + ' and ' + r2 + ' ' + u.L + ', the water levels above the impermeable base are ' + h1 + ' ' + u.L + ' and ' + h2 + ' ' + u.L + '. Find k.',
        given: [{ sym: 'q', label: 'Pumping rate', value: q, unit: u.q, sig: 2 }, { sym: 'r1', label: 'r₁', value: r1, unit: u.L, sig: 3 }, { sym: 'r2', label: 'r₂', value: r2, unit: u.L, sig: 3 }, { sym: 'h1', label: 'h₁ (at r₁)', value: h1, unit: u.L, sig: 3 }, { sym: 'h2', label: 'h₂ (at r₂)', value: h2, unit: u.L, sig: 3 }],
        sketch: { type: 'well', confined: false },
        assumptions: ['Steady state reached; well fully penetrates the aquifer; flow is horizontal with gradient dh/dr (Dupuit assumption); homogeneous isotropic layer.'],
        parts: [
          { sym: 'k', label: 'Hydraulic conductivity', expr: '2.303 * q * log10(r1 / r2) / (pi * (h1 ^ 2 - h2 ^ 2))', unit: u.k, why: 'q = k(dh/dr)(2πrh); separating variables and integrating between the two wells gives this result.',
            mistakes: [{ expr: 'q * log10(r1 / r2) / (pi * (h1 ^ 2 - h2 ^ 2))', msg: 'Missing the 2.303 factor that converts log₁₀ to ln.', tag: 'log' }, { expr: '2.303 * q * log10(r1 / r2) / (pi * (h1 - h2) ^ 2)', msg: 'The denominator is π(h₁² − h₂²), not π(h₁ − h₂)².', tag: 'formula' }] }
        ],
        check: ['h₁ > h₂ because the farther well is less drawn down ✓', 'Units: ' + u.q + ' ÷ ' + u.L + '² = ' + u.k + ' ✓'],
        interpret: 'A field pumping test samples a large soil volume and captures layering and fissures that a small lab specimen misses.'
      };
    } });

  /* 21. Pumping test — confined */
  T.push({ id: 'c7-pump-confined', chapter: 7, topic: 'field', difficulty: 2, method: 'k = q log₁₀(r₁/r₂)/[2.727H(h₁ − h₂)]',
    title: 'Pumping test in a confined aquifer',
    generate: function (r, sys) {
      var u = L_(sys), si = sys === 'SI';
      var r1 = si ? r.pick([40, 60, 75]) : r.pick([150, 200]), r2 = si ? r.pick([12, 15, 20]) : r.pick([40, 60]);
      var H = si ? r.pick([3, 4, 5, 6]) : r.pick([10, 15, 20]), h2 = si ? r.range(8, 12, 2) : r.range(25, 35, 1), h1 = U.roundTo(h2 + (si ? r.range(0.3, 1) : r.range(1, 3)), 2);
      var q = si ? rs(r.range(0.003, 0.02), 2) : rs(r.range(3, 15), 2);
      return {
        text: 'A well penetrates the full thickness H = ' + H + ' ' + u.L + ' of a confined aquifer and is pumped at ' + q + ' ' + u.q + '. Piezometric levels (above the aquifer base) are ' + h1 + ' ' + u.L + ' at r₁ = ' + r1 + ' ' + u.L + ' and ' + h2 + ' ' + u.L + ' at r₂ = ' + r2 + ' ' + u.L + '. Find k.',
        given: [{ sym: 'q', label: 'q', value: q, unit: u.q, sig: 2 }, { sym: 'H', label: 'Aquifer thickness', value: H, unit: u.L, sig: 2 }, { sym: 'r1', label: 'r₁', value: r1, unit: u.L, sig: 3 }, { sym: 'r2', label: 'r₂', value: r2, unit: u.L, sig: 3 }, { sym: 'h1', label: 'h₁', value: h1, unit: u.L, sig: 3 }, { sym: 'h2', label: 'h₂', value: h2, unit: u.L, sig: 3 }],
        sketch: { type: 'well', confined: true },
        assumptions: ['Steady state; the piezometric surface stays above the top of the aquifer (it remains confined); horizontal flow through thickness H.'],
        parts: [
          { sym: 'k', label: 'Hydraulic conductivity', expr: 'q * log10(r1 / r2) / (2.727 * H * (h1 - h2))', unit: u.k, why: 'q = k(dh/dr)(2πrH) → k = q ln(r₁/r₂)/[2πH(h₁ − h₂)]; 2π/2.303 = 2.727.',
            mistakes: [{ expr: '2.303 * q * log10(r1 / r2) / (pi * (h1 ^ 2 - h2 ^ 2))', msg: 'That is the UNCONFINED-aquifer equation. In a confined aquifer the flow thickness is the constant H.', tag: 'formula' }] }
        ],
        check: ['k positive and in a sensible range for an aquifer (sand/gravel) ✓'], interpret: 'The flow area 2πrH is constant with depth of drawdown in a confined aquifer, giving a simpler equation.'
      };
    } });

  /* 22. Travel time */
  T.push({ id: 'c7-travel-time', chapter: 7, topic: 'velocity', difficulty: 2, method: 'vs = ki/n; t = L/vs',
    title: 'Travel time of seepage through a layer',
    generate: function (r) {
      var k = rs(Math.pow(10, r.range(-4, -2)), 2), Dh = r.range(1, 4, 1), Lm = r.pick([20, 30, 50, 80]), n = r.range(0.3, 0.45, 2);
      return {
        text: 'A sand layer (k = ' + U.fmt(k, 2) + ' cm/s, n = ' + Math.round(n * 100) + ' %) connects a pond to a river ' + Lm + ' m away along the flow path. The difference in water level (total head) is ' + Dh + ' m. Estimate the time for water to travel from the pond to the river, in days.',
        given: [{ sym: 'k', label: 'k', value: k, unit: 'cm/s', sig: 2 }, { sym: 'n', label: 'Porosity', value: n, unit: '%', sig: 2 }, { sym: 'Lm', label: 'Flow path length', value: Lm, unit: 'm', sig: 2 }, { sym: 'Dh', label: 'Head difference', value: Dh, unit: 'm', sig: 2 }],
        assumptions: ['Uniform, saturated, one-dimensional flow; travel at the average seepage velocity (no dispersion).'],
        parts: [
          { sym: 'i', label: 'Gradient', expr: 'Dh / Lm', unit: '', why: 'i = Δh/L.' },
          { sym: 'vs', label: 'Seepage velocity', expr: 'k * i / n', unit: 'cm/s', why: 'vs = v/n = ki/n.', mistakes: [{ expr: 'k * i', msg: MS.vsAsV, tag: 'seepage-velocity' }] },
          { sym: 'tday', label: 'Travel time', expr: 'Lm * 100 / vs / 86400', unit: 'day', why: 't = L/vs; convert L to cm (×100) to match vs in cm/s, then s → days (÷86 400).', mistakes: [{ expr: 'Lm * 100 / (k * i) / 86400', msg: 'Use the seepage velocity (ki/n), not the discharge velocity — water moves only through the voids.', tag: 'seepage-velocity' }] }
        ],
        check: ['Travel time is long for small gradients — realistic for groundwater ✓'], interpret: 'Contaminant arrival estimates use seepage velocity, not discharge velocity.'
      };
    } });

  /* 23. Compacted clay liner check */
  T.push({ id: 'c7-liner-check', chapter: 7, topic: 'compacted-clay', difficulty: 2, method: 'Falling-head k vs 1 × 10⁻⁷ cm/s liner criterion',
    title: 'Does the compacted clay meet the liner criterion?',
    generate: function (r) {
      var a = r.pick([0.3, 0.5]), A = r.pick([30, 40]), L = r.pick([5, 7, 10]), h1 = 120;
      var k = Math.pow(10, r.range(-8, -6.3)), t = rs(r.pick([86400, 172800, 259200]), 3), h2 = U.roundTo(P.fallingHeadH2(a, L, A, k, h1, t), 1);
      return {
        text: 'A compacted clay specimen (L = ' + L + ' cm, A = ' + A + ' cm²) is tested in a falling-head permeameter with a = ' + a + ' cm². The head falls from ' + h1 + ' cm to ' + h2 + ' cm in ' + t + ' s. Find k and compare with the common liner requirement k ≤ 1 × 10⁻⁷ cm/s (enter the ratio k/10⁻⁷).',
        constants: [{ sym: 'kreq', value: 1e-7, unit: 'cm/s', label: 'required maximum' }],
        given: [{ sym: 'a', label: 'a', value: a, unit: 'cm²', sig: 2 }, { sym: 'A', label: 'A', value: A, unit: 'cm²', sig: 2 }, { sym: 'L', label: 'L', value: L, unit: 'cm', sig: 2 }, { sym: 'h1', label: 'h₁', value: h1, unit: 'cm', sig: 3 }, { sym: 'h2', label: 'h₂', value: h2, unit: 'cm', sig: 4 }, { sym: 't', label: 't', value: t, unit: 's', sig: 3 }],
        sketch: { type: 'fallingHead', d: Math.sqrt(4 * a / Math.PI), D: Math.sqrt(4 * A / Math.PI), L: L, h1: h1, h2: h2, t: t },
        assumptions: ['Specimen saturated; laboratory k represents the compacted fill at this water content and unit weight.'],
        parts: [
          { sym: 'k', label: 'Hydraulic conductivity', expr: 'a * L / (A * t) * ln(h1 / h2)', unit: 'cm/s', why: 'Falling-head equation.', mistakes: [{ expr: 'A * L / (a * t) * ln(h1 / h2)', msg: MS.aSwap, tag: 'area-swap' }] },
          { sym: 'ratio', label: 'k / (1 × 10⁻⁷ cm/s)', expr: 'k / kreq', unit: '', why: 'A ratio ≤ 1 meets the criterion.' }
        ],
        check: ['Ratio ≤ 1 → acceptable on hydraulic conductivity; > 1 → not acceptable.'],
        interpret: 'For a liner, the acceptable zone on the w–γd plot is the set of compaction conditions that give k ≤ 1 × 10⁻⁷ cm/s (plus adequate strength and limited shrinkage). Clays compacted wet of optimum generally give the lowest k.'
      };
    } });

  /* 24. Flow through an inclined permeable layer (per unit width) */
  T.push({ id: 'c7-inclined-layer', chapter: 7, topic: 'darcy', difficulty: 3, method: 'i = h cos α / L; q = kiA per unit width',
    title: 'Seepage through an inclined permeable layer',
    generate: function (r) {
      var H = r.pick([2, 3, 4]), alpha = r.pick([5, 8, 10, 12, 15]), L = r.pick([40, 50, 60]), h = r.range(2, 5, 1), k = rs(Math.pow(10, r.range(-3, -2)), 2);
      return {
        text: 'A permeable sand layer of thickness H = ' + H + ' m (measured vertically) dips at α = ' + alpha + '° beneath an impervious layer. Two piezometers placed L = ' + L + ' m apart HORIZONTALLY show a difference in water level of h = ' + h + ' m. k = ' + U.fmt(k, 2) + ' cm/s. Find the flow rate per metre width in m³/h.',
        constants: [{ sym: 'deg', value: Math.PI / 180, unit: '', label: 'radians per degree' }],
        given: [{ sym: 'H', label: 'H', value: H, unit: 'm', sig: 2 }, { sym: 'alpha', label: 'α (degrees)', value: alpha, unit: '', sig: 2 }, { sym: 'L', label: 'L', value: L, unit: 'm', sig: 2 }, { sym: 'h', label: 'h', value: h, unit: 'm', sig: 2 }, { sym: 'k', label: 'k', value: k, unit: 'cm/s', sig: 2 }],
        assumptions: ['Flow is parallel to the layer; the flow length between piezometers is L/cos α; the flow area per unit width is H cos α (thickness normal to the layer).'],
        parts: [
          { sym: 'i', label: 'Hydraulic gradient', expr: 'h / (L / cos(alpha * deg))', unit: '', why: 'i = head loss / length along the flow path; the path along the layer is L/cos α.', mistakes: [{ expr: 'h / L', msg: 'The flow path is along the inclined layer, so its length is L/cos α, not L.', tag: 'gradient' }] },
          { sym: 'Aw', label: 'Flow area per m width', expr: 'H * cos(alpha * deg) * 1', unit: 'm²', why: 'Area normal to flow = H cos α × 1 m.' },
          { sym: 'q', label: 'Flow rate per m width', expr: 'k / 100 * i * Aw * 3600', unit: 'm³/h', why: 'q = kiA with k converted to m/s (÷100) and s → h (×3600).' }
        ],
        check: ['Small α gives values close to the horizontal-layer case ✓'], interpret: 'Geometry matters: both the gradient and the flow area depend on the dip angle.'
      };
    } });

  /* ---------- combined Chapter 3 + 7 problems ---------- */
  T.push({ id: 'cx-porosity-seepage', chapter: 'X', topic: 'combined', difficulty: 3, method: 'Phase relations → n; Darcy → v; vs = v/n',
    title: 'From sample measurements to seepage velocity',
    generate: function (r) {
      var Gs = r.pick([2.65, 2.66, 2.68]), e = r.range(0.5, 0.8), V = r.pick([500, 750, 1000]), Ms = U.roundTo(Gs * V / (1 + e), 1);
      var k = rs(Math.pow(10, r.range(-3, -1.7)), 2), i = r.range(0.3, 0.9, 2);
      return {
        text: 'An oven-dried sand sample compacted into a ' + V + ' cm³ mould has a dry mass of ' + Ms + ' g; Gs = ' + Gs + '. Under field conditions the same sand is fully saturated, has the same void ratio, k = ' + U.fmt(k, 2) + ' cm/s, and carries flow under i = ' + i.toFixed(2) + '. Find e, n, the discharge velocity and the seepage velocity.',
        given: [{ sym: 'V', label: 'Mould volume', value: V, unit: 'cm³', sig: 3 }, { sym: 'Ms', label: 'Dry mass', value: Ms, unit: 'g', sig: 4 }, { sym: 'Gs', label: 'Gs', value: Gs, unit: '', sig: 3 }, { sym: 'k', label: 'k', value: k, unit: 'cm/s', sig: 2 }, { sym: 'i', label: 'i', value: i, unit: '', sig: 3 }],
        assumptions: ['ρw = 1 g/cm³, so Vs (cm³) = Ms/Gs.', 'Explicitly stated: field soil is saturated with the same e as the sample, so all voids conduct flow.'],
        parts: [
          { sym: 'Vs', label: 'Volume of solids', expr: 'Ms / Gs', unit: 'cm³', why: 'Ms = GsρwVs with ρw = 1 g/cm³.' },
          { sym: 'e', label: 'Void ratio', expr: '(V - Vs) / Vs', unit: '', why: 'e = Vv/Vs.', mistakes: [{ expr: '(V - Vs) / V', msg: 'That is the porosity. e = Vv/Vs.', tag: 'e-vs-n' }] },
          { sym: 'n', label: 'Porosity', expr: 'e / (1 + e)', unit: '%', why: 'n = e/(1 + e).' },
          { sym: 'v', label: 'Discharge velocity', expr: 'k * i', unit: 'cm/s', why: 'Darcy v = ki.' },
          { sym: 'vs', label: 'Seepage velocity', expr: 'v / n', unit: 'cm/s', why: 'vs = v/n.', mistakes: [{ expr: 'v / e', msg: MS.vsWithE, tag: 'e-vs-n' }, { expr: 'v', msg: MS.vsAsV, tag: 'seepage-velocity' }] }
        ],
        check: ['vs > v ✓'], interpret: 'Phase relationships provide n, which converts Darcy’s superficial velocity into the true average velocity in the pores.'
      };
    } });

  T.push({ id: 'cx-densify-k', chapter: 'X', topic: 'combined', difficulty: 3, method: 'Dr → e; Kozeny–Carman ratio → k',
    title: 'Densification and its effect on k',
    generate: function (r) {
      var emin = r.range(0.42, 0.52, 2), emax = U.roundTo(emin + r.range(0.3, 0.38), 2), D1 = r.pick([0.25, 0.3, 0.35]), D2 = r.pick([0.75, 0.8, 0.85]), k1 = rs(Math.pow(10, r.range(-2.5, -1.5)), 2);
      return {
        text: 'A clean sand (emax = ' + emax.toFixed(2) + ', emin = ' + emin.toFixed(2) + ') has k = ' + U.fmt(k1, 2) + ' cm/s at Dr = ' + Math.round(D1 * 100) + ' %. Estimate k after vibro-compaction to Dr = ' + Math.round(D2 * 100) + ' %, using k ∝ e³/(1 + e).',
        given: [{ sym: 'emax', label: 'emax', value: emax, unit: '', sig: 3 }, { sym: 'emin', label: 'emin', value: emin, unit: '', sig: 3 }, { sym: 'k1', label: 'k₁', value: k1, unit: 'cm/s', sig: 2 }, { sym: 'D1', label: 'Dr₁', value: D1, unit: '%', sig: 2 }, { sym: 'D2', label: 'Dr₂', value: D2, unit: '%', sig: 2 }],
        assumptions: ['Grain size and shape unchanged; Kozeny–Carman proportionality applies.'],
        parts: [
          { sym: 'e1', label: 'e at Dr₁', expr: 'emax - D1 * (emax - emin)', unit: '', why: 'From Dr = (emax − e)/(emax − emin).' },
          { sym: 'e2', label: 'e at Dr₂', expr: 'emax - D2 * (emax - emin)', unit: '', why: 'Same relation.' },
          { sym: 'k2', label: 'k after densification', expr: 'k1 * (e2 ^ 3 / (1 + e2)) / (e1 ^ 3 / (1 + e1))', unit: 'cm/s', why: 'k₂/k₁ = [e₂³/(1 + e₂)]/[e₁³/(1 + e₁)].' }
        ],
        check: ['k₂ < k₁ ✓'], interpret: 'Ground improvement that densifies sand also reduces its permeability.'
      };
    } });

  T.push({ id: 'cx-falling-head-specimen', chapter: 'X', topic: 'combined', difficulty: 3, method: 'Specimen phase data + falling-head k → vs',
    title: 'Falling-head specimen: k and seepage velocity',
    generate: function (r) {
      var D = 7.5, L = 10, Gs = r.pick([2.68, 2.7, 2.72]), e = r.range(0.6, 0.9), A = Math.PI * D * D / 4, V = A * L, Ms = U.roundTo(Gs * V / (1 + e), 1);
      var a = 0.5, h1 = 100, k = Math.pow(10, r.range(-4.5, -3.5)), t = r.pick([300, 600, 900]), h2 = U.roundTo(P.fallingHeadH2(a, L, A, k, h1, t), 1);
      return {
        text: 'A saturated silty sand specimen (D = ' + D + ' cm, L = ' + L + ' cm) has an oven-dry mass of ' + Ms + ' g; Gs = ' + Gs + '. In a falling-head test (standpipe a = ' + a + ' cm²) the head falls from ' + h1 + ' cm to ' + h2 + ' cm in ' + t + ' s. Find n, k, and the seepage velocity at the START of the test (when i = h₁/L).',
        given: [{ sym: 'dia', label: 'D', value: D, unit: 'cm', sig: 2 }, { sym: 'L', label: 'L', value: L, unit: 'cm', sig: 2 }, { sym: 'Ms', label: 'Dry mass', value: Ms, unit: 'g', sig: 4 }, { sym: 'Gs', label: 'Gs', value: Gs, unit: '', sig: 3 },
                { sym: 'a', label: 'a', value: a, unit: 'cm²', sig: 1 }, { sym: 'h1', label: 'h₁', value: h1, unit: 'cm', sig: 3 }, { sym: 'h2', label: 'h₂', value: h2, unit: 'cm', sig: 4 }, { sym: 't', label: 't', value: t, unit: 's', sig: 3 }],
        sketch: { type: 'fallingHead', d: Math.sqrt(4 * a / Math.PI), D: D, L: L, h1: h1, h2: h2, t: t },
        assumptions: ['Specimen saturated (stated); ρw = 1 g/cm³.'],
        parts: [
          { sym: 'A', label: 'Specimen area', expr: 'pi * dia ^ 2 / 4', unit: 'cm²', why: 'A = πD²/4.' },
          { sym: 'n', label: 'Porosity', expr: '1 - Ms / (Gs * A * L)', unit: '%', why: 'Vs = Ms/Gs; n = 1 − Vs/V.' },
          { sym: 'k', label: 'k', expr: 'a * L / (A * t) * ln(h1 / h2)', unit: 'cm/s', why: 'Falling-head equation.', mistakes: [{ expr: 'A * L / (a * t) * ln(h1 / h2)', msg: MS.aSwap, tag: 'area-swap' }] },
          { sym: 'vs', label: 'Initial seepage velocity', expr: 'k * h1 / L / n', unit: 'cm/s', why: 'vs = ki/n with i = h₁/L.' }
        ],
        check: ['vs > v ✓'], interpret: 'One specimen supplies both the phase data and the hydraulic data needed to describe flow through the pores.'
      };
    } });

  SM.registerTemplates(T);
})(typeof window !== 'undefined' ? window : globalThis);
