/* Chapter 7 — Permeability: original problem templates, plus combined Ch. 3 + Ch. 7 problems.
 * Set-ups follow the forms of the textbook's worked examples (Das & Sobhan, 9th ed., Ch. 7):
 * Bernoulli h = u/γw + Z; Darcy v = ki, q = kiA; constant head k = QL/(Aht);
 * falling head k = 2.303(aL/At)log10(h1/h2); k20 = (ηT/η20)kT; k = (γw/η)K̄;
 * kH(eq) = (1/H)Σ kHi Hi; kV(eq) = H/Σ(Hi/kVi); pumping-well equations.
 * Laboratory tests use cm, mm and s (k in cm/s) in both unit systems, as is conventional;
 * answers may be entered in any equivalent velocity unit.  All prose uses $…$ markup. */
(function (root) {
  'use strict';
  var SM = root.SM, U = SM.units, P = SM.perm;
  var rs = U.roundSig;
  function L_(sys) { return sys === 'SI' ? { L: 'm', A: 'm²', q: 'm³/s', k: 'm/s', p: 'kPa', uw: 'kN/m³', gw: 9.81 } : { L: 'ft', A: 'ft²', q: 'ft³/min', k: 'ft/min', p: 'lb/ft²', uw: 'lb/ft³', gw: 62.4 }; }
  function GW(sys) { var u = L_(sys); return [{ sym: 'gw', value: u.gw, unit: u.uw, label: 'unit weight of water' }]; }
  function kf(k, s) { return U.fmt(k, s || 2) + ' cm/s'; }

  var MS = {
    pressureHead: 'You used the difference in PRESSURE heads. Flow is driven by the difference in TOTAL head, $h = u / gw + Z$ (pressure head + elevation head).',
    qVsVolume: 'That is the collected VOLUME. The flow rate is volume per unit time: $q = Q / t$.',
    volumeVsQ: 'That is the flow RATE (volume per time). The volume collected in time $t$ is $Q = q t$.',
    aSwap: 'You swapped the standpipe area $a$ and the specimen area $A$. In $k = 2.303 (a L / A t) log10(h1 / h2)$ the small standpipe area $a$ is in the numerator.',
    vsAsV: 'That is the discharge velocity $v = k i$. Water actually moves only through the voids, so the seepage velocity $vs = v / n$ is larger.',
    vsWithE: 'Divide by the porosity $n$, not the void ratio $e$: $vs = v / n = v (1 + e) / e$.',
    kHkV: 'You used the wrong equivalent-conductivity relationship. Flow PARALLEL to the layers: $kHeq = (1 / H) Sum (kH_i H_i)$ (thickness-weighted average). Flow PERPENDICULAR to the layers: $kVeq = H / Sum (H_i / kV_i)$ (controlled by the least permeable layer).',
    tempInv: 'The correction went the wrong way. $k20 = (etaT / eta20) kT$: warmer water is less viscous and flows more easily, so a $k$ measured above 20 °C must be REDUCED.',
    ln: 'You used $log10$ without the factor 2.303. Use either $ln(h1 / h2)$ or $2.303 log10(h1 / h2)$.',
    lnTwice: 'You used 2.303 together with $ln$. The factor 2.303 belongs only with $log10$.'
  };

  var T = [];

  /* 1. Bernoulli heads */
  T.push({ id: 'c7-heads', chapter: 7, topic: 'heads', difficulty: 1, method: '$h = u / gw + Z$; $Dh = hA - hB$',
    title: 'Pressure, elevation and total head',
    generate: function (r, sys) {
      var u = L_(sys), si = sys === 'SI';
      var zA = si ? r.range(3, 8, 1) : r.range(10, 25, 0), zB = si ? r.range(0, 2.5, 1) : r.range(0, 8, 0);
      var hpA = si ? r.range(1.5, 4, 2) : r.range(5, 12, 1), hpB = si ? r.range(3, 7, 2) : r.range(10, 22, 1);
      if (zA + hpA <= zB + hpB) hpA = U.roundTo(zB + hpB - zA + (si ? r.range(0.5, 1.5, 2) : r.range(1.5, 4, 1)), 2);
      var uA = U.roundTo(hpA * u.gw, 1), uB = U.roundTo(hpB * u.gw, 1);
      return {
        text: 'Piezometers are installed at two points in a saturated soil. Point A is at elevation $zA$ = ' + zA + ' ' + u.L + ' with pore water pressure $uA$ = ' + uA + ' ' + u.p + '; point B is at elevation $zB$ = ' + zB + ' ' + u.L + ' with $uB$ = ' + uB + ' ' + u.p + ' (datum at elevation 0). Find the pressure head and total head at A and B, the head loss, and the direction of flow.',
        constants: GW(sys),
        given: [{ sym: 'zA', label: 'Elevation head at A', value: zA, unit: u.L, sig: 3 }, { sym: 'uA', label: 'Pore water pressure at A', value: uA, unit: u.p, sig: 4 }, { sym: 'zB', label: 'Elevation head at B', value: zB, unit: u.L, sig: 3 }, { sym: 'uB', label: 'Pore water pressure at B', value: uB, unit: u.p, sig: 4 }],
        sketch: { type: 'heads', zA: zA, zB: zB, hpA: uA / u.gw, hpB: uB / u.gw, unit: u.L },
        assumptions: ['The velocity head $v^2 / (2 grav)$ is negligible: seepage velocities are tiny (1 cm/s gives about 0.0005 cm).', 'One datum (elevation 0) is used for both points.'],
        parts: [
          { sym: 'hpA', label: 'Pressure head at A', expr: 'uA / gw', unit: u.L, why: 'Pressure head $= u / gw$.' },
          { sym: 'hA', label: 'Total head at A', expr: 'hpA + zA', unit: u.L, why: 'Bernoulli with the velocity head neglected: $h = u / gw + Z$.' },
          { sym: 'hpB', label: 'Pressure head at B', expr: 'uB / gw', unit: u.L, why: 'Pressure head $= u / gw$.' },
          { sym: 'hB', label: 'Total head at B', expr: 'hpB + zB', unit: u.L, why: '$h = u / gw + Z$.' },
          { sym: 'Dh', label: 'Head loss from A to B', expr: 'hA - hB', unit: u.L, why: 'Water flows from higher to lower TOTAL head; $Dh = hA - hB$.', mistakes: [{ expr: 'hpB - hpA', msg: MS.pressureHead, tag: 'pressure-vs-total-head' }, { expr: 'hpA - hpB', msg: MS.pressureHead, tag: 'pressure-vs-total-head' }] }
        ],
        check: ['$Dh$ > 0, so flow is from A to B, even though the pressure at B is higher ✓'],
        interpret: 'A higher pressure does not decide the flow direction: the TOTAL head does. Here water flows from A to B.'
      };
    } });

  /* 2. Gradient and Darcy discharge */
  T.push({ id: 'c7-darcy-q', chapter: 7, topic: 'darcy', difficulty: 1, method: '$i = Dh / L$; $q = k i A$; $Q = q t$',
    title: 'Darcy flow rate and collected volume',
    generate: function (r) {
      var k = rs(r.range(0.002, 0.08), 2), Dh = r.range(20, 80, 0), L = r.range(15, 60, 0), A = r.pick([20, 30, 45, 60, 80]), t = r.pick([60, 120, 300, 600]);
      return {
        text: 'Water flows through a sand specimen with $k$ = ' + kf(k) + ', length $L$ = ' + L + ' cm and cross-sectional area $A$ = ' + A + ' cm² under a head loss $Dh$ = ' + Dh + ' cm. Find the hydraulic gradient, the flow rate, and the volume of water that passes in ' + t + ' s.',
        given: [{ sym: 'k', label: 'Hydraulic conductivity', value: k, unit: 'cm/s', sig: 2 }, { sym: 'Dh', label: 'Head loss', value: Dh, unit: 'cm', sig: 3 }, { sym: 'L', label: 'Length of flow path', value: L, unit: 'cm', sig: 3 }, { sym: 'A', label: 'Cross-sectional area', value: A, unit: 'cm²', sig: 3 }, { sym: 't', label: 'Time', value: t, unit: 's', sig: 3 }],
        sketch: { type: 'darcy', L: L, Dh: Dh },
        assumptions: ['Laminar, steady flow through saturated soil (Darcy’s law valid).'],
        parts: [
          { sym: 'i', label: 'Hydraulic gradient', expr: 'Dh / L', unit: '', why: '$i = Dh / L$: head loss per unit length of flow path (dimensionless).', mistakes: [{ expr: 'L / Dh', msg: 'You inverted the gradient. $i = Dh / L$: head loss divided by flow length.', tag: 'gradient' }] },
          { sym: 'q', label: 'Flow rate', expr: 'k * i * A', unit: 'cm³/s', why: 'Darcy: $v = k i$ and $q = v A = k i A$.', mistakes: [{ expr: 'k * i * A * t', msg: MS.volumeVsQ, tag: 'q-vs-volume' }] },
          { sym: 'Q', label: 'Volume in time $t$', expr: 'q * t', unit: 'cm³', why: '$Q = q t$.', mistakes: [{ expr: 'q', msg: MS.qVsVolume, tag: 'q-vs-volume' }] }
        ],
        check: ['Units: (cm/s)(–)(cm²) = cm³/s ✓'], interpret: 'Doubling the head loss doubles the flow (Darcy’s law is linear).'
      };
    } });

  /* 3. Discharge vs seepage velocity */
  T.push({ id: 'c7-seepage-velocity', chapter: 7, topic: 'velocity', difficulty: 1, method: '$v = k i$; $vs = v (1 + e) / e = v / n$',
    title: 'Discharge velocity and seepage velocity',
    generate: function (r) {
      var k = rs(r.range(0.001, 0.05), 2), i = r.range(0.2, 1.2, 2), e = r.range(0.45, 0.9, 2);
      return {
        text: 'A sand with $k$ = ' + kf(k) + ' and void ratio $e$ = ' + e.toFixed(2) + ' carries flow under a hydraulic gradient $i$ = ' + i.toFixed(2) + '. Find the discharge velocity, the porosity, and the seepage velocity.',
        given: [{ sym: 'k', label: 'Hydraulic conductivity', value: k, unit: 'cm/s', sig: 2 }, { sym: 'i', label: 'Hydraulic gradient', value: i, unit: '', sig: 3 }, { sym: 'e', label: 'Void ratio', value: e, unit: '', sig: 3 }],
        sketch: { type: 'seepage' },
        assumptions: ['Saturated soil; all voids are interconnected and conduct flow.'],
        parts: [
          { sym: 'v', label: 'Discharge velocity', expr: 'k * i', unit: 'cm/s', why: 'Darcy: $v = k i$ (flow per unit TOTAL cross-sectional area).' },
          { sym: 'n', label: 'Porosity', expr: 'e / (1 + e)', unit: '%', why: '$n = e / (1 + e)$.', mistakes: [{ expr: 'e', msg: 'That is the void ratio; porosity $n = e / (1 + e)$.', tag: 'e-vs-n' }] },
          { sym: 'vs', label: 'Seepage velocity', expr: 'v / n', unit: 'cm/s', why: 'Water passes only through the void area $Av$; continuity gives $vs = v (Vs + Vv) / Vv = v (1 + e) / e = v / n$.', mistakes: [{ expr: 'v / e', msg: MS.vsWithE, tag: 'e-vs-n' }, { expr: 'v * n', msg: 'The seepage velocity is FASTER than $v$: divide by $n$.', tag: 'seepage-velocity' }, { expr: 'v', msg: MS.vsAsV, tag: 'seepage-velocity' }] }
        ],
        check: ['$vs > v$ because $n < 1$ ✓'], interpret: 'The seepage velocity governs travel time of water or dissolved contaminants; the discharge velocity governs the quantity of flow.'
      };
    } });

  /* 4. Constant-head test → k (two data styles, as in the textbook's examples) */
  T.push({ id: 'c7-const-head-k', chapter: 7, topic: 'constant-head', difficulty: 2, method: '$k = Q L / (A h t)$',
    title: 'Constant-head test: find the hydraulic conductivity',
    generate: function (r) {
      var k = r.range(0.005, 0.08);
      if (r.next() < 0.5) {
        // dimensions in mm, area in cm², time in minutes
        var Lmm = r.pick([150, 200, 250, 300, 350]), A = r.pick([25, 32, 40, 45, 50]), hmm = r.pick([300, 400, 450, 500, 600]), tmin = r.pick([2, 3, 4, 5]);
        var Q = rs(k * (hmm / Lmm) * A * tmin * 60, 3);
        return {
          text: 'For a constant-head laboratory permeability test on a fine sand: length of specimen $L$ = ' + Lmm + ' mm; area of specimen $A$ = ' + A + ' cm²; constant head difference $h$ = ' + hmm + ' mm; water collected in ' + tmin + ' min $Q$ = ' + Q + ' cm³. Determine the hydraulic conductivity in cm/s.',
          given: [{ sym: 'Lmm', label: 'Specimen length', value: Lmm, unit: 'mm', sig: 3 }, { sym: 'A', label: 'Specimen area', value: A, unit: 'cm²', sig: 3 }, { sym: 'hmm', label: 'Constant head difference', value: hmm, unit: 'mm', sig: 3 }, { sym: 'tmin', label: 'Collection time', value: tmin, unit: 'min', sig: 2 }, { sym: 'Q', label: 'Volume collected', value: Q, unit: 'cm³', sig: 3 }],
          sketch: { type: 'constantHead', L: Lmm / 10, D: Math.sqrt(4 * A / Math.PI), h: hmm / 10, Q: Q, t: tmin * 60 },
          assumptions: ['Steady flow; the specimen is saturated; $h$ is the TOTAL head loss across the specimen.', 'Convert to cm and s before substituting, so that $k$ comes out in cm/s.'],
          parts: [
            { sym: 'L', label: 'Specimen length in cm', expr: 'Lmm / 10', unit: 'cm', why: '1 cm = 10 mm.' },
            { sym: 'h', label: 'Head difference in cm', expr: 'hmm / 10', unit: 'cm', why: '1 cm = 10 mm.' },
            { sym: 't', label: 'Time in seconds', expr: 'tmin * 60', unit: 's', why: '1 min = 60 s.' },
            { sym: 'k', label: 'Hydraulic conductivity', expr: 'Q * L / (A * h * t)', unit: 'cm/s', why: '$Q = A v t = A (k i) t$ with $i = h / L$, so $k = Q L / (A h t)$.', mistakes: [{ expr: 'Q * L / (A * h)', msg: 'You did not divide by time: $Q$ is a volume, so $k = Q L / (A h t)$.', tag: 'q-vs-volume' }, { expr: 'Q * h / (A * L * t)', msg: '$i = h / L$, so $L$ goes in the numerator of $k = Q L / (A h t)$.', tag: 'gradient' }, { expr: 'Q * L / (A * h * tmin)', msg: 'Time must be in seconds (×60) to give $k$ in cm/s.', tag: 'units' }] }
          ],
          check: ['$k$ in the $10^{-3}$–1 cm/s range is typical of sands ✓', 'Units: (cm³)(cm)/[(cm²)(cm)(s)] = cm/s ✓'], interpret: 'The constant-head test suits relatively permeable (granular) soils that pass a measurable volume of water quickly.'
        };
      }
      var D = r.pick([5, 6, 7.5, 10]), L2 = r.pick([15, 20, 25, 30]), h2 = r.range(40, 90, 0), t2 = r.pick([60, 120, 180, 300]);
      var A2 = Math.PI * D * D / 4, Q2 = rs(k * h2 / L2 * A2 * t2, 3);
      return {
        text: 'In a constant-head test, a sand specimen of diameter $D$ = ' + D + ' cm and length $L$ = ' + L2 + ' cm is tested under a constant head difference $h$ = ' + h2 + ' cm. A volume $Q$ = ' + Q2 + ' cm³ of water is collected in $t$ = ' + t2 + ' s. Find the specimen area, the flow rate, and the hydraulic conductivity.',
        given: [{ sym: 'dia', label: 'Specimen diameter', value: D, unit: 'cm', sig: 3 }, { sym: 'L', label: 'Specimen length', value: L2, unit: 'cm', sig: 3 }, { sym: 'h', label: 'Head difference', value: h2, unit: 'cm', sig: 3 }, { sym: 'Q', label: 'Collected volume', value: Q2, unit: 'cm³', sig: 3 }, { sym: 't', label: 'Time', value: t2, unit: 's', sig: 3 }],
        sketch: { type: 'constantHead', L: L2, D: D, h: h2, Q: Q2, t: t2 },
        assumptions: ['Steady flow; the specimen is saturated; $h$ is the TOTAL head loss across the specimen.'],
        parts: [
          { sym: 'A', label: 'Specimen area', expr: 'pi * dia ^ 2 / 4', unit: 'cm²', why: '$A = pi D^2 / 4$.', mistakes: [{ expr: 'pi * dia ^ 2', msg: '$pi D^2$ is four times the area. Use $pi D^2 / 4$ (or $pi r^2$).', tag: 'area' }] },
          { sym: 'q', label: 'Flow rate', expr: 'Q / t', unit: 'cm³/s', why: '$q = Q / t$.', mistakes: [{ expr: 'Q', msg: MS.qVsVolume, tag: 'q-vs-volume' }] },
          { sym: 'k', label: 'Hydraulic conductivity', expr: 'Q * L / (A * h * t)', unit: 'cm/s', why: '$Q = A (k i) t$ with $i = h / L$, so $k = Q L / (A h t)$.', mistakes: [{ expr: 'Q * L / (A * h)', msg: 'You did not divide by time: $Q$ is a volume; $k$ needs $q = Q / t$.', tag: 'q-vs-volume' }, { expr: 'Q * h / (A * L * t)', msg: '$i = h / L$, so $L$ goes in the numerator: $k = Q L / (A h t)$.', tag: 'gradient' }] }
        ],
        check: ['$k$ in the $10^{-3}$–1 cm/s range is typical of sands ✓'], interpret: 'The constant-head test suits relatively permeable (granular) soils that pass a measurable volume of water quickly.'
      };
    } });

  /* 5. Constant-head prediction of volume */
  T.push({ id: 'c7-const-head-Q', chapter: 7, topic: 'constant-head', difficulty: 1, method: '$Q = k (h / L) A t$',
    title: 'Constant-head test: predict the collected volume',
    generate: function (r) {
      var k = rs(r.range(0.003, 0.05), 2), L = r.pick([20, 25, 30, 35]), A = r.pick([40, 50, 78.5, 100]), h = r.range(30, 75, 0), t = r.pick([60, 90, 180, 240]);
      return {
        text: 'A constant-head test is planned on a sand with $k$ ≈ ' + kf(k) + '. Specimen: $L$ = ' + L + ' cm, $A$ = ' + A + ' cm²; head difference $h$ = ' + h + ' cm. How much water should be collected in $t$ = ' + t + ' s?',
        given: [{ sym: 'k', label: 'Hydraulic conductivity', value: k, unit: 'cm/s', sig: 2 }, { sym: 'L', label: 'Specimen length', value: L, unit: 'cm', sig: 3 }, { sym: 'A', label: 'Specimen area', value: A, unit: 'cm²', sig: 3 }, { sym: 'h', label: 'Head difference', value: h, unit: 'cm', sig: 3 }, { sym: 't', label: 'Time', value: t, unit: 's', sig: 3 }],
        sketch: { type: 'constantHead', L: L, D: Math.sqrt(4 * A / Math.PI), h: h, t: t },
        assumptions: ['Steady laminar flow.'],
        parts: [
          { sym: 'i', label: 'Hydraulic gradient', expr: 'h / L', unit: '', why: '$i = h / L$.' },
          { sym: 'Q', label: 'Collected volume', expr: 'k * i * A * t', unit: 'cm³', why: '$Q = q t = k i A t$.', mistakes: [{ expr: 'k * i * A', msg: MS.volumeVsQ, tag: 'q-vs-volume' }] }
        ],
        check: ['The volume grows linearly with time and head ✓'], interpret: 'Predicting the volume beforehand lets you choose a sensible collection time and container.'
      };
    } });

  /* 6. Falling-head test → k (diameters in cm, or areas in mm² as in the textbook's examples) */
  T.push({ id: 'c7-falling-head-k', chapter: 7, topic: 'falling-head', difficulty: 2, method: '$k = 2.303 (a L / A t) log10(h1 / h2)$',
    title: 'Falling-head test: find the hydraulic conductivity',
    generate: function (r) {
      var k = Math.pow(10, r.range(-5.5, -3.5));
      var kMis = [{ expr: '2.303 * A * L / (a * t) * log10(h1 / h2)', msg: MS.aSwap, tag: 'area-swap' }, { expr: 'a * L / (A * t) * log10(h1 / h2)', msg: MS.ln, tag: 'log' }, { expr: '2.303 * a * L / (A * t) * ln(h1 / h2)', msg: MS.lnTwice, tag: 'log' }];
      var kAlts = ['A * L / (a * t) * ln(h1 / h2)', 'a * L / (A * t) * log10(h1 / h2)', 'a * L / (A * t) * (h1 - h2)'];
      if (r.next() < 0.5) {
        var Lmm = r.pick([100, 150, 200, 250]), Amm = r.pick([1000, 1500, 2000, 3000]), amm = r.pick([20, 30, 40, 50, 60]), h1mm = r.pick([400, 500, 600]);
        var tt = rs(P.fallingHeadT(amm, Lmm, Amm, k * 10, h1mm, h1mm * r.range(0.45, 0.75)), 3), h2mm = U.roundTo(P.fallingHeadH2(amm, Lmm, Amm, k * 10, h1mm, tt), 0);
        return {
          text: 'For a falling-head permeability test: length of specimen $L$ = ' + Lmm + ' mm; area of specimen $A$ = ' + Amm + ' mm²; area of standpipe $a$ = ' + amm + ' mm²; head $h1$ = ' + h1mm + ' mm at time $t$ = 0 and head $h2$ = ' + h2mm + ' mm at $t$ = ' + tt + ' s. Determine the hydraulic conductivity of the soil in cm/s.',
          given: [{ sym: 'L', label: 'Specimen length', value: Lmm, unit: 'mm', sig: 3 }, { sym: 'A', label: 'Specimen area', value: Amm, unit: 'mm²', sig: 4 }, { sym: 'a', label: 'Standpipe area', value: amm, unit: 'mm²', sig: 2 },
                  { sym: 'h1', label: 'Head at $t$ = 0', value: h1mm, unit: 'mm', sig: 3 }, { sym: 'h2', label: 'Head at time $t$', value: h2mm, unit: 'mm', sig: 3 }, { sym: 't', label: 'Elapsed time', value: tt, unit: 's', sig: 3 }],
          sketch: { type: 'fallingHead', d: Math.sqrt(4 * amm / Math.PI) / 10, D: Math.sqrt(4 * Amm / Math.PI) / 10, L: Lmm / 10, h1: h1mm / 10, h2: h2mm / 10, t: tt },
          assumptions: ['Saturated specimen; heads measured as total head above the outlet level.', 'Continuity: flow into the specimen equals the drop in standpipe storage, $q = k (h / L) A = -a (d h / d t)$.', 'With all lengths and areas in mm, $k$ comes out in mm/s; divide by 10 for cm/s.'],
          parts: [
            { sym: 'kmm', label: 'Hydraulic conductivity in mm/s', expr: '2.303 * a * L / (A * t) * log10(h1 / h2)', unit: 'mm/s', why: 'Integrating $-a (d h / d t) = k (h / L) A$ from $h1$ to $h2$ gives $k = 2.303 (a L / A t) log10(h1 / h2)$.', alts: kAlts, mistakes: kMis },
            { sym: 'k', label: 'Hydraulic conductivity in cm/s', expr: 'kmm / 10', unit: 'cm/s', why: '1 cm = 10 mm.', mistakes: [{ expr: 'kmm', msg: 'That value is in mm/s. Divide by 10 for cm/s.', tag: 'units' }] }
          ],
          check: ['$k$ between $10^{-6}$ and $10^{-3}$ cm/s fits silts and clayey soils ✓', '$h2 < h1$, so $log10(h1 / h2)$ > 0 ✓'],
          interpret: 'The falling-head test is used for less permeable soils, where a constant-head test would collect too little water.'
        };
      }
      var d = r.pick([0.5, 0.6, 0.8, 1.0, 1.2]), D = r.pick([6, 7.5, 10]), L = r.pick([8, 10, 12, 15]), h1 = r.pick([90, 100, 120, 150]);
      var a = Math.PI * d * d / 4, A = Math.PI * D * D / 4;
      var t = rs(P.fallingHeadT(a, L, A, k, h1, h1 * r.range(0.45, 0.75)), 3); var h2 = U.roundTo(P.fallingHeadH2(a, L, A, k, h1, t), 1);
      return {
        text: 'A falling-head test is run on a silty soil specimen of diameter $D$ = ' + D + ' cm and length $L$ = ' + L + ' cm. The standpipe has an inside diameter $d$ = ' + d + ' cm. The head drops from $h1$ = ' + h1 + ' cm to $h2$ = ' + h2 + ' cm in $t$ = ' + t + ' s. Find the standpipe area $a$, the specimen area $A$ and the hydraulic conductivity.',
        given: [{ sym: 'd', label: 'Standpipe diameter', value: d, unit: 'cm', sig: 2 }, { sym: 'dia', label: 'Specimen diameter', value: D, unit: 'cm', sig: 3 }, { sym: 'L', label: 'Specimen length', value: L, unit: 'cm', sig: 3 },
                { sym: 'h1', label: 'Head at $t$ = 0', value: h1, unit: 'cm', sig: 3 }, { sym: 'h2', label: 'Head at time $t$', value: h2, unit: 'cm', sig: 4 }, { sym: 't', label: 'Elapsed time', value: t, unit: 's', sig: 3 }],
        sketch: { type: 'fallingHead', d: d, D: D, L: L, h1: h1, h2: h2, t: t },
        assumptions: ['Saturated specimen; heads measured as total head above the outlet level.', 'Continuity: $q = k (h / L) A = -a (d h / d t)$.'],
        parts: [
          { sym: 'a', label: 'Standpipe area', expr: 'pi * d ^ 2 / 4', unit: 'cm²', why: '$a = pi d^2 / 4$ (standpipe).' },
          { sym: 'A', label: 'Specimen area', expr: 'pi * dia ^ 2 / 4', unit: 'cm²', why: '$A = pi D^2 / 4$ (specimen).' },
          { sym: 'k', label: 'Hydraulic conductivity', expr: '2.303 * a * L / (A * t) * log10(h1 / h2)', unit: 'cm/s', why: 'Integrating $-a (d h / d t) = k (h / L) A$ from $h1$ to $h2$ gives $k = 2.303 (a L / A t) log10(h1 / h2)$, which equals $(a L / A t) ln(h1 / h2)$.', alts: kAlts, mistakes: kMis }
        ],
        check: ['$k$ between $10^{-6}$ and $10^{-3}$ cm/s fits silts and clayey soils ✓', '$h2 < h1$, so $log10(h1 / h2)$ > 0 ✓'],
        interpret: 'The falling-head test is used for less permeable soils, where a constant-head test would collect too little water.'
      };
    } });

  /* 7. Falling-head time */
  T.push({ id: 'c7-falling-head-t', chapter: 7, topic: 'falling-head', difficulty: 2, method: '$t = 2.303 (a L / A k) log10(h1 / h2)$',
    title: 'Falling-head test: time for a head drop',
    generate: function (r) {
      var a = r.pick([0.2, 0.3, 0.5, 0.8]), A = r.pick([30, 45, 60, 80]), L = r.pick([10, 12, 15]), k = rs(Math.pow(10, r.range(-5, -3.7)), 2), h1 = r.pick([100, 120, 150]), h2 = r.pick([40, 50, 60, 75]);
      return {
        text: 'A clayey sand with $k$ = ' + kf(k) + ' is tested in a falling-head permeameter with $a$ = ' + a + ' cm², $A$ = ' + A + ' cm² and $L$ = ' + L + ' cm. How long will it take the head to fall from $h1$ = ' + h1 + ' cm to $h2$ = ' + h2 + ' cm?',
        given: [{ sym: 'a', label: 'Standpipe area', value: a, unit: 'cm²', sig: 2 }, { sym: 'A', label: 'Specimen area', value: A, unit: 'cm²', sig: 2 }, { sym: 'L', label: 'Specimen length', value: L, unit: 'cm', sig: 2 }, { sym: 'k', label: 'Hydraulic conductivity', value: k, unit: 'cm/s', sig: 2 }, { sym: 'h1', label: 'Initial head', value: h1, unit: 'cm', sig: 3 }, { sym: 'h2', label: 'Final head', value: h2, unit: 'cm', sig: 2 }],
        sketch: { type: 'fallingHead', d: Math.sqrt(4 * a / Math.PI), D: Math.sqrt(4 * A / Math.PI), L: L, h1: h1, h2: h2 },
        assumptions: ['The falling-head equation applies.'],
        parts: [
          { sym: 't', label: 'Time', expr: '2.303 * a * L / (A * k) * log10(h1 / h2)', unit: 's', why: 'Rearrange $k = 2.303 (a L / A t) log10(h1 / h2)$ for $t$.', mistakes: [{ expr: '2.303 * A * L / (a * k) * log10(h1 / h2)', msg: MS.aSwap, tag: 'area-swap' }, { expr: 'a * L / (A * k) * log10(h1 / h2)', msg: MS.ln, tag: 'log' }] }
        ],
        check: ['A larger standpipe area $a$ gives a longer time (more water to drain) ✓'], interpret: 'Choosing a smaller standpipe speeds up tests on low-permeability soils.'
      };
    } });

  /* 8. Falling-head: head after time t */
  T.push({ id: 'c7-falling-head-h2', chapter: 7, topic: 'falling-head', difficulty: 3, method: '$h2 = h1 exp(-k A t / (a L))$',
    title: 'Falling-head test: head after a given time',
    generate: function (r) {
      var a = r.pick([0.4, 0.5, 0.7]), A = r.pick([40, 50, 70]), L = r.pick([10, 15]), k = rs(Math.pow(10, r.range(-4.8, -4)), 2), h1 = r.pick([100, 120]), t = r.pick([300, 600, 900, 1200]);
      return {
        text: 'Falling-head test: $a$ = ' + a + ' cm², $A$ = ' + A + ' cm², $L$ = ' + L + ' cm, $k$ = ' + kf(k) + '. The head at $t$ = 0 is $h1$ = ' + h1 + ' cm. What is the head after ' + t + ' s?',
        given: [{ sym: 'a', label: 'Standpipe area', value: a, unit: 'cm²', sig: 2 }, { sym: 'A', label: 'Specimen area', value: A, unit: 'cm²', sig: 2 }, { sym: 'L', label: 'Specimen length', value: L, unit: 'cm', sig: 2 }, { sym: 'k', label: 'Hydraulic conductivity', value: k, unit: 'cm/s', sig: 2 }, { sym: 'h1', label: 'Initial head', value: h1, unit: 'cm', sig: 3 }, { sym: 't', label: 'Elapsed time', value: t, unit: 's', sig: 3 }],
        sketch: { type: 'fallingHead', d: Math.sqrt(4 * a / Math.PI), D: Math.sqrt(4 * A / Math.PI), L: L, h1: h1 },
        assumptions: ['The falling-head equation applies.'],
        parts: [
          { sym: 'x', label: 'Exponent', expr: 'k * A * t / (a * L)', unit: '', why: 'From $ln(h1 / h2) = k A t / (a L)$, the exponent is $x = k A t / (a L)$.' },
          { sym: 'h2', label: 'Head after time $t$', expr: 'h1 * exp(-x)', unit: 'cm', why: 'Take the antilog of both sides: $h2 = h1 exp(-x)$.', mistakes: [{ expr: 'h1 * 10 ^ (-x)', msg: 'The exponent came from a NATURAL log, so use $exp(-x)$, not $10^{-x}$.', tag: 'log' }] }
        ],
        check: ['0 < $h2 < h1$ ✓'], interpret: 'The head decays exponentially: equal time intervals give equal RATIOS $h1 / h2$.'
      };
    } });

  /* 9. Temperature correction */
  T.push({ id: 'c7-temperature', chapter: 7, topic: 'temperature', difficulty: 1, method: '$k20 = (etaT / eta20) kT$',
    title: 'Correcting the hydraulic conductivity to 20 °C',
    generate: function (r) {
      var T_ = r.pick([15, 16, 17, 18, 22, 23, 24, 25, 26, 27, 28, 30]), kT = rs(Math.pow(10, r.range(-4, -1.5)), 3), ratio = P.etaRatio(T_);
      return {
        text: 'A permeability test performed at ' + T_ + ' °C gives $kT$ = ' + kf(kT, 3) + '. For water at this temperature, $etaT / eta20$ = ' + ratio.toFixed(3) + '. Report the hydraulic conductivity at the standard temperature of 20 °C.',
        constants: [{ sym: 'etaRatio', value: ratio, unit: '', label: 'viscosity ratio at ' + T_ + ' °C' }],
        given: [{ sym: 'kT', label: 'Hydraulic conductivity at the test temperature', value: kT, unit: 'cm/s', sig: 3 }],
        assumptions: ['Only the viscosity of water changes appreciably with temperature (the change in $gw$ is neglected).'],
        parts: [
          { sym: 'k20', label: 'Hydraulic conductivity at 20 °C', expr: 'kT * etaRatio', unit: 'cm/s', why: '$k = (gw / eta) Kbar$, so $k$ is inversely proportional to $eta$; hence $k20 = (etaT / eta20) kT$.', mistakes: [{ expr: 'kT / etaRatio', msg: MS.tempInv, tag: 'temperature' }] }
        ],
        check: [T_ > 20 ? 'Test above 20 °C → $k20 < kT$ ✓' : 'Test below 20 °C → $k20 > kT$ ✓'],
        interpret: 'Standardising to 20 °C allows tests run on different days and in different laboratories to be compared.'
      };
    } });

  /* 10. Absolute (intrinsic) permeability */
  T.push({ id: 'c7-intrinsic', chapter: 7, topic: 'intrinsic', difficulty: 2, method: '$Kbar = k eta / gw$',
    title: 'Absolute (intrinsic) permeability',
    generate: function (r) {
      var k = rs(Math.pow(10, r.range(-4, -1)), 2);
      return {
        text: 'A sand has $k$ = ' + kf(k) + ' for water at 20 °C ($eta$ = 1.002 × $10^{-3}$ Pa·s, $gw$ = 9.79 kN/m³ at 20 °C). Find the absolute permeability $Kbar$ in m² and in cm².',
        constants: [{ sym: 'eta', value: 1.002e-3, unit: 'Pa·s', label: 'viscosity of water at 20 °C' }, { sym: 'gwN', value: 9789, unit: 'N/m³', label: 'unit weight of water at 20 °C' }],
        given: [{ sym: 'k', label: 'Hydraulic conductivity', value: k, unit: 'cm/s', sig: 2 }],
        assumptions: ['Darcy flow of water at 20 °C.'],
        parts: [
          { sym: 'km', label: 'Hydraulic conductivity in m/s', expr: 'k / 100', unit: 'm/s', why: 'Work in SI base units: 1 cm/s = 0.01 m/s.' },
          { sym: 'Kp', label: 'Absolute permeability (m²)', expr: 'km * eta / gwN', unit: 'm²', dim: 'permeability', why: '$k = (gw / eta) Kbar$ → $Kbar = k eta / gw$. Units: (m/s)(N·s/m²)/(N/m³) = m².', mistakes: [{ expr: 'k * eta / gwN', msg: 'Convert $k$ to m/s before substituting SI values of $eta$ and $gw$.', tag: 'units' }] },
          { sym: 'Kcm', label: 'Absolute permeability (cm²)', expr: 'Kp * 10000', unit: 'cm²', dim: 'permeability', why: '1 m² = $10^4$ cm².' }
        ],
        check: ['$Kbar$ has units of AREA: it depends only on the pore geometry ✓'],
        interpret: '$Kbar$ describes the soil alone, whereas $k$ depends on the soil AND the fluid (through $gw / eta$). Oil or hot water would give a different $k$ for the same $Kbar$.'
      };
    } });

  /* 11. Hazen */
  T.push({ id: 'c7-hazen', chapter: 7, topic: 'empirical-granular', difficulty: 1, method: '$k = c D10^2$ ($k$ in cm/s, $D10$ in mm)',
    title: 'Hazen’s estimate for a clean sand',
    generate: function (r) {
      var D10 = r.pick([0.1, 0.12, 0.15, 0.18, 0.2, 0.25, 0.3, 0.4]), c = r.pick([1.0, 1.2, 1.5]);
      return {
        text: 'A clean, fairly uniform sand has an effective size $D10$ = ' + D10 + ' mm. Estimate its hydraulic conductivity with Hazen’s formula using $c$ = ' + c.toFixed(1) + '. Express the answer in cm/s.',
        constants: [{ sym: 'c', value: c, unit: '', label: 'Hazen constant (as stated; reported values vary)' }],
        given: [{ sym: 'D10', label: 'Effective size', value: D10, unit: 'mm', sig: 2 }],
        assumptions: ['Hazen’s formula is for clean, fairly uniform sands; $D10$ must be in mm to give $k$ in cm/s.', '$c$ is an empirical constant, so the result is an order-of-magnitude estimate.'],
        parts: [
          { sym: 'k', label: 'Estimated hydraulic conductivity', expr: 'c * D10 ^ 2', unit: 'cm/s', why: 'Hazen: $k = c D10^2$, with $D10$ in mm giving $k$ in cm/s.', mistakes: [{ expr: 'c * (D10 / 10) ^ 2', msg: 'Keep $D10$ in millimetres: $c$ was calibrated for $D10$ in mm and $k$ in cm/s.', tag: 'units' }, { expr: 'c * D10', msg: 'Square the effective size: $k = c D10^2$.', tag: 'formula' }] }
        ],
        check: ['The result lies in the fine-to-medium sand range (about $10^{-3}$ to $10^{-1}$ cm/s) ✓'], interpret: 'Empirical estimates are for screening; laboratory or field tests are needed for design.'
      };
    } });

  /* 12. Chapuis */
  T.push({ id: 'c7-chapuis', chapter: 7, topic: 'empirical-granular', difficulty: 2, method: '$k = 2.4622 [D10^2 e^3 / (1 + e)]^{0.7825}$',
    title: 'Chapuis (2004) estimate for sand and gravel',
    generate: function (r) {
      var D10 = r.pick([0.08, 0.1, 0.15, 0.2, 0.3, 0.5]), e = r.range(0.4, 0.9, 2);
      return {
        text: 'Estimate the hydraulic conductivity of a natural sand with $D10$ = ' + D10 + ' mm and $e$ = ' + e.toFixed(2) + ' using the Chapuis (2004) relationship.',
        given: [{ sym: 'D10', label: 'Effective size', value: D10, unit: 'mm', sig: 2 }, { sym: 'e', label: 'Void ratio', value: e, unit: '', sig: 3 }],
        assumptions: ['Natural sands and gravels with roughly 0.3 < $e$ < 1; $D10$ in mm, $k$ in cm/s.'],
        parts: [
          { sym: 'x', label: 'Grouped term', expr: 'D10 ^ 2 * e ^ 3 / (1 + e)', unit: '', why: 'Evaluate the grouped term $x = D10^2 e^3 / (1 + e)$ first.' },
          { sym: 'k', label: 'Estimated hydraulic conductivity', expr: '2.4622 * x ^ 0.7825', unit: 'cm/s', why: 'Chapuis (2004): $k = 2.4622 x^{0.7825}$.' }
        ],
        check: ['The result is in the typical sand range ✓'], interpret: 'This correlation accounts for both grain size and packing (through $e$).'
      };
    } });

  /* 13. Kozeny–Carman ratio */
  T.push({ id: 'c7-kozeny', chapter: 7, topic: 'empirical-granular', difficulty: 2, method: '$k1 / k2 = [e1^3 / (1 + e1)] / [e2^3 / (1 + e2)]$',
    title: 'Effect of void ratio on the hydraulic conductivity of a sand',
    generate: function (r) {
      var k1 = rs(Math.pow(10, r.range(-3, -1.5)), 2), e1 = r.range(0.55, 0.8, 2), e2 = U.roundTo(e1 - r.range(0.08, 0.2), 2);
      return {
        text: 'The hydraulic conductivity of a sand at a void ratio $e1$ = ' + e1.toFixed(2) + ' is $k1$ = ' + kf(k1) + '. Estimate its hydraulic conductivity at $e2$ = ' + e2.toFixed(2) + ', using $k = C1 e^3 / (1 + e)$.',
        given: [{ sym: 'k1', label: 'Hydraulic conductivity at $e1$', value: k1, unit: 'cm/s', sig: 2 }, { sym: 'e1', label: 'Void ratio 1', value: e1, unit: '', sig: 3 }, { sym: 'e2', label: 'Void ratio 2', value: e2, unit: '', sig: 3 }],
        assumptions: ['The same sand (grain size, shape and fabric unchanged); only $e$ changes, so $C1$ cancels.'],
        parts: [
          { sym: 'k2', label: 'Hydraulic conductivity at $e2$', expr: 'k1 * (e2 ^ 3 / (1 + e2)) / (e1 ^ 3 / (1 + e1))', unit: 'cm/s', why: 'Write $k = C1 e^3 / (1 + e)$ for both states and divide: $k1 / k2 = [e1^3 / (1 + e1)] / [e2^3 / (1 + e2)]$.', mistakes: [{ expr: 'k1 * (e1 ^ 3 / (1 + e1)) / (e2 ^ 3 / (1 + e2))', msg: 'The ratio is inverted: a denser sand (smaller $e$) must have a SMALLER $k$.', tag: 'empirical' }, { expr: 'k1 * e2 / e1', msg: '$k$ is not proportional to $e$; it varies with $e^3 / (1 + e)$.', tag: 'empirical' }] }
        ],
        check: ['$k2 < k1$ for $e2 < e1$ ✓'], interpret: 'A modest decrease in void ratio causes a much larger relative decrease in $k$.'
      };
    } });

  /* 14. Casagrande */
  T.push({ id: 'c7-casagrande', chapter: 7, topic: 'empirical-granular', difficulty: 1, method: '$k = 1.4 e^2 k085$',
    title: 'Casagrande relation for fine-to-medium clean sand',
    generate: function (r) {
      var k085 = rs(Math.pow(10, r.range(-3, -1.8)), 2), e = r.range(0.45, 0.8, 2);
      return {
        text: 'For a fine-to-medium clean sand, the hydraulic conductivity at $e$ = 0.85 is $k085$ = ' + kf(k085) + '. Estimate $k$ at $e$ = ' + e.toFixed(2) + ' with Casagrande’s relationship.',
        given: [{ sym: 'k085', label: 'Hydraulic conductivity at $e$ = 0.85', value: k085, unit: 'cm/s', sig: 2 }, { sym: 'e', label: 'Void ratio', value: e, unit: '', sig: 3 }],
        assumptions: ['Fine-to-medium clean sand.'],
        parts: [{ sym: 'k', label: 'Hydraulic conductivity at the given $e$', expr: '1.4 * e ^ 2 * k085', unit: 'cm/s', why: 'Casagrande: $k = 1.4 e^2 k085$.', mistakes: [{ expr: '1.4 * e * k085', msg: 'Square the void ratio: $k = 1.4 e^2 k085$.', tag: 'empirical' }] }],
        check: ['For $e$ = 0.85 the formula returns about $k085$, since 1.4 × $0.85^2$ ≈ 1.01 ✓'], interpret: 'Like the Kozeny–Carman form, this shows $k$ decreasing strongly as $e$ decreases.'
      };
    } });

  /* 15. Taylor for clay */
  T.push({ id: 'c7-taylor-clay', chapter: 7, topic: 'empirical-cohesive', difficulty: 3, method: '$log k = log k0 - (e0 - e) / Ck$ with $Ck$ ≈ $0.5 e0$',
    title: 'Hydraulic conductivity of a clay after compression',
    generate: function (r) {
      var e0 = r.range(1.0, 2.2, 2), k0 = rs(Math.pow(10, r.range(-8, -6.5)), 2), e = U.roundTo(e0 - r.range(0.15, 0.45), 2);
      return {
        text: 'A soft clay has $k0$ = ' + kf(k0) + ' at its in-situ void ratio $e0$ = ' + e0.toFixed(2) + '. After consolidation, $e$ = ' + e.toFixed(2) + '. Using Taylor’s relationship with $Ck$ = $0.5 e0$ (Tavenas et al. 1983, for $e0$ below about 2.5), estimate the new $k$.',
        given: [{ sym: 'k0', label: 'In-situ hydraulic conductivity', value: k0, unit: 'cm/s', sig: 2 }, { sym: 'e0', label: 'In-situ void ratio', value: e0, unit: '', sig: 3 }, { sym: 'e', label: 'Void ratio after consolidation', value: e, unit: '', sig: 3 }],
        assumptions: ['Natural (structured) clay; $Ck$ ≈ $0.5 e0$ is an approximation.'],
        parts: [
          { sym: 'Ck', label: 'Permeability change index', expr: '0.5 * e0', unit: '', why: '$Ck$ ≈ $0.5 e0$.' },
          { sym: 'k', label: 'New hydraulic conductivity', expr: 'k0 * 10 ^ (-(e0 - e) / Ck)', unit: 'cm/s', why: '$log k = log k0 - (e0 - e) / Ck$ → $k = k0 10^{-(e0 - e) / Ck}$.', mistakes: [{ expr: 'k0 * exp(-(e0 - e) / Ck)', msg: 'Taylor’s relationship uses base-10 logarithms: $k = k0 10^{-(e0 - e) / Ck}$, not $exp$.', tag: 'log' }] }
        ],
        check: ['$k$ decreases as the clay compresses ✓'], interpret: 'Consolidation slows further drainage because the clay becomes less permeable.'
      };
    } });

  /* 16. Samarasinghe et al. (1982) */
  T.push({ id: 'c7-samarasinghe', chapter: 7, topic: 'empirical-cohesive', difficulty: 3, method: '$k = C3 e^n / (1 + e)$: find $n$ from two tests',
    title: 'Normally consolidated clay: hydraulic conductivity from two tests',
    generate: function (r) {
      var nexp = r.range(3, 6), C3 = Math.pow(10, r.range(-7, -6)), e1 = r.range(1.0, 1.4, 2), e2 = U.roundTo(e1 - r.range(0.2, 0.35), 2), e3 = U.roundTo(e2 - r.range(0.1, 0.2), 2);
      var f = function (e) { return rs(C3 * Math.pow(e, nexp) / (1 + e), 3); };
      return {
        text: 'For a normally consolidated clay, $k1$ = ' + kf(f(e1), 3) + ' at $e1$ = ' + e1.toFixed(2) + ' and $k2$ = ' + kf(f(e2), 3) + ' at $e2$ = ' + e2.toFixed(2) + '. Using $k = C3 e^n / (1 + e)$ (Samarasinghe et al. 1982), find $n$ and estimate $k$ at $e3$ = ' + e3.toFixed(2) + '.',
        given: [{ sym: 'k1', label: 'Hydraulic conductivity at $e1$', value: f(e1), unit: 'cm/s', sig: 3 }, { sym: 'e1', label: 'Void ratio 1', value: e1, unit: '', sig: 3 }, { sym: 'k2', label: 'Hydraulic conductivity at $e2$', value: f(e2), unit: 'cm/s', sig: 3 }, { sym: 'e2', label: 'Void ratio 2', value: e2, unit: '', sig: 3 }, { sym: 'e3', label: 'Void ratio 3', value: e3, unit: '', sig: 3 }],
        assumptions: ['Normally consolidated clay; $C3$ and $n$ are constants for this soil.'],
        parts: [
          { sym: 'nexp', label: 'Exponent $n$', expr: 'log10(k1 * (1 + e1) / (k2 * (1 + e2))) / log10(e1 / e2)', unit: '', why: 'Divide the two equations: $k1 / k2 = (e1 / e2)^n (1 + e2) / (1 + e1)$; take logarithms and solve for $n$.' },
          { sym: 'k3', label: 'Hydraulic conductivity at $e3$', expr: 'k2 * (e3 / e2) ^ nexp * (1 + e2) / (1 + e3)', unit: 'cm/s', why: 'Ratio with test 2: $k3 / k2 = (e3 / e2)^n (1 + e2) / (1 + e3)$.' }
        ],
        check: ['$k3 < k2$ for $e3 < e2$ ✓'], interpret: 'Two tests calibrate the relationship, which can then estimate $k$ at other void ratios during consolidation.'
      };
    } });

  /* 17–19. Layered soils (textbook notation kH(eq), kV(eq)) */
  function layers(r, sys) {
    var n = r.pick([2, 3, 3]), out = [];
    for (var j = 0; j < n; j++) out.push({ H: sys === 'SI' ? r.pick([0.5, 1, 1.5, 2, 3]) : r.pick([2, 3, 5, 6, 8]), k: rs(Math.pow(10, r.range(-6, -2)), 2) });
    return out;
  }
  function layerGiven(Ls, Lu) {
    var g = [];
    Ls.forEach(function (l, j) { g.push({ sym: 'H' + (j + 1), label: 'Thickness of layer ' + (j + 1), value: l.H, unit: Lu, sig: 2 }); g.push({ sym: 'k' + (j + 1), label: 'Hydraulic conductivity of layer ' + (j + 1), value: l.k, unit: 'cm/s', sig: 2 }); });
    return g;
  }
  function sumExpr(Ls, f) { return Ls.map(function (l, j) { return f(j + 1); }).join(' + '); }
  function layerText(Ls, Lu) { return Ls.map(function (l, j) { return 'layer ' + (j + 1) + ': $H' + (j + 1) + '$ = ' + l.H + ' ' + Lu + ', $k' + (j + 1) + '$ = ' + kf(l.k); }).join('; '); }

  T.push({ id: 'c7-layers-parallel', chapter: 7, topic: 'layered', difficulty: 2, method: '$kHeq = (1 / H) Sum (kH_i H_i)$',
    title: 'Equivalent hydraulic conductivity, flow parallel to the layers',
    generate: function (r, sys) {
      var Lu = sys === 'SI' ? 'm' : 'ft', Ls = layers(r, sys);
      return {
        text: 'A stratified deposit consists of ' + Ls.length + ' horizontal layers (top to bottom): ' + layerText(Ls, Lu) + '. Each layer is isotropic ($kH$ = $kV$ in each layer). Find the total thickness and the equivalent hydraulic conductivity for flow in the HORIZONTAL direction (parallel to the layers).',
        given: layerGiven(Ls, Lu),
        sketch: { type: 'layers', layers: Ls, dir: 'H', unit: Lu },
        assumptions: ['Flow parallel to the bedding: every layer has the SAME hydraulic gradient, and the flows add.'],
        parts: [
          { sym: 'Ht', label: 'Total thickness', expr: sumExpr(Ls, function (j) { return 'H' + j; }), unit: Lu, why: '$H = Sum H_i$.' },
          { sym: 'kHeq', label: 'Equivalent horizontal conductivity', expr: '(' + sumExpr(Ls, function (j) { return 'k' + j + ' * H' + j; }) + ') / Ht', unit: 'cm/s', why: 'With the same $i$ in every layer, $q = Sum (kH_i i H_i) = kHeq i H$, so $kHeq = (1 / H)(kH1 H1 + kH2 H2 + ...)$: a thickness-weighted average dominated by the MOST permeable layer.',
            mistakes: [{ expr: 'Ht / (' + sumExpr(Ls, function (j) { return 'H' + j + ' / k' + j; }) + ')', msg: MS.kHkV, tag: 'layered' }] }
        ],
        check: ['$kHeq$ lies between the smallest and largest layer $k$, close to the largest ✓'], interpret: 'Horizontal flow is carried mainly by the most permeable layer.'
      };
    } });

  T.push({ id: 'c7-layers-perp', chapter: 7, topic: 'layered', difficulty: 2, method: '$kVeq = H / Sum (H_i / kV_i)$',
    title: 'Equivalent hydraulic conductivity, flow perpendicular to the layers',
    generate: function (r, sys) {
      var Lu = sys === 'SI' ? 'm' : 'ft', Ls = layers(r, sys);
      var kh = '(' + sumExpr(Ls, function (j) { return 'k' + j + ' * H' + j; }) + ') / Ht';
      return {
        text: 'For the layered deposit (' + layerText(Ls, Lu) + '; each layer isotropic), find the equivalent hydraulic conductivity for VERTICAL flow (perpendicular to the layers) and the ratio $kHeq / kVeq$.',
        given: layerGiven(Ls, Lu),
        sketch: { type: 'layers', layers: Ls, dir: 'V', unit: Lu },
        assumptions: ['Flow perpendicular to the bedding: the SAME discharge velocity passes through every layer, and the head losses add.'],
        parts: [
          { sym: 'Ht', label: 'Total thickness', expr: sumExpr(Ls, function (j) { return 'H' + j; }), unit: Lu, why: '$H = Sum H_i$.' },
          { sym: 'kVeq', label: 'Equivalent vertical conductivity', expr: 'Ht / (' + sumExpr(Ls, function (j) { return 'H' + j + ' / k' + j; }) + ')', unit: 'cm/s', why: 'Same $v$ in each layer: $Dh_i = v H_i / kV_i$ and $Sum Dh_i = v H / kVeq$, so $kVeq = H / (H1 / kV1 + H2 / kV2 + ...)$, controlled by the LEAST permeable layer.',
            mistakes: [{ expr: kh, msg: MS.kHkV, tag: 'layered' }] },
          { sym: 'ratio', label: 'Anisotropy ratio $kHeq / kVeq$', expr: '(' + kh + ') / kVeq', unit: '', why: 'Compute $kHeq = (1 / H) Sum (kH_i H_i)$ and divide by $kVeq$.' }
        ],
        check: ['$kHeq >= kVeq$ always (ratio ≥ 1) ✓'], interpret: 'Layered soils are strongly anisotropic: vertical drainage is throttled by the tightest layer.'
      };
    } });

  T.push({ id: 'c7-layers-headloss', chapter: 7, topic: 'layered', difficulty: 3, method: '$v = kVeq Dh / H$; $Dh_i = v H_i / k_i$',
    title: 'Head loss in each layer (vertical flow)',
    generate: function (r) {
      var H1 = r.pick([0.3, 0.5, 0.6]), H2 = r.pick([0.2, 0.3, 0.4]), k1 = rs(Math.pow(10, r.range(-3, -2)), 2), k2 = rs(Math.pow(10, r.range(-5, -4)), 2), Dh = r.pick([0.5, 0.8, 1.0, 1.2]);
      return {
        text: 'Water flows vertically downward through two layers: sand ($H1$ = ' + H1 + ' m, $k1$ = ' + kf(k1) + ') over silt ($H2$ = ' + H2 + ' m, $k2$ = ' + kf(k2) + '). The total head loss across both layers is $Dh$ = ' + Dh + ' m. Find $kVeq$, the discharge velocity, and the head loss in each layer.',
        given: [{ sym: 'H1', label: 'Thickness of sand', value: H1, unit: 'm', sig: 2 }, { sym: 'k1', label: 'Hydraulic conductivity of the sand', value: k1, unit: 'cm/s', sig: 2 }, { sym: 'H2', label: 'Thickness of silt', value: H2, unit: 'm', sig: 2 }, { sym: 'k2', label: 'Hydraulic conductivity of the silt', value: k2, unit: 'cm/s', sig: 2 }, { sym: 'Dh', label: 'Total head loss', value: Dh, unit: 'm', sig: 2 }],
        sketch: { type: 'layers', layers: [{ H: H1, k: k1 }, { H: H2, k: k2 }], dir: 'V', unit: 'm' },
        assumptions: ['Steady one-dimensional vertical flow; layers saturated.'],
        parts: [
          { sym: 'kVeq', label: 'Equivalent vertical conductivity', expr: '(H1 + H2) / (H1 / k1 + H2 / k2)', unit: 'cm/s', why: '$kVeq = H / Sum (H_i / k_i)$.', mistakes: [{ expr: '(k1 * H1 + k2 * H2) / (H1 + H2)', msg: MS.kHkV, tag: 'layered' }] },
          { sym: 'v', label: 'Discharge velocity', expr: 'kVeq * Dh / (H1 + H2)', unit: 'cm/s', why: '$v = kVeq i$ with $i = Dh / H$ (dimensionless, so the velocity unit of $k$ carries through).' },
          { sym: 'Dh1', label: 'Head loss in the sand', expr: 'Dh * (H1 / k1) / (H1 / k1 + H2 / k2)', unit: 'm', why: '$Dh_i = v H_i / k_i$; equivalently $Dh (H_i / k_i) / Sum (H_j / k_j)$, which avoids unit conversion.' },
          { sym: 'Dh2', label: 'Head loss in the silt', expr: 'Dh - Dh1', unit: 'm', why: 'The layer head losses add up to the total.' }
        ],
        check: ['Most of the head is lost in the low-$k$ layer ✓', '$Dh1 + Dh2 = Dh$ ✓'], interpret: 'The silt controls the flow; its large gradient matters for stability (piping, uplift).'
      };
    } });

  /* 20. Layers in series in a tube (textbook example form) */
  T.push({ id: 'c7-layers-tube', chapter: 7, topic: 'layered', difficulty: 2, method: '$kVeq = L / Sum (L_i / k_i)$; $q = kVeq (h / L) A$',
    title: 'Soil layers in series in a tube',
    generate: function (r) {
      var side = r.pick([100, 150]), LA = r.pick([100, 150, 200]), LB = r.pick([100, 150]), LC = r.pick([100, 150, 200]);
      var kA = rs(Math.pow(10, r.range(-2.5, -1.8)), 2), kB = rs(Math.pow(10, r.range(-3.3, -2.6)), 2), kC = rs(Math.pow(10, r.range(-4.2, -3.4)), 2), hmm = r.pick([200, 250, 300, 400]);
      return {
        text: 'Three soils A, B and C are placed one after another along the flow direction in a tube of square cross-section with side $b$ = ' + side + ' mm. Lengths along the flow: $LA$ = ' + LA + ' mm, $LB$ = ' + LB + ' mm, $LC$ = ' + LC + ' mm; hydraulic conductivities $kA$ = ' + kf(kA) + ', $kB$ = ' + kf(kB) + ', $kC$ = ' + kf(kC) + '. Water is supplied to maintain a constant head difference $h$ = ' + hmm + ' mm across the three soils. Find the rate of water supply in cm³/h.',
        given: [{ sym: 'b', label: 'Side of the square tube', value: side / 10, unit: 'cm', sig: 3 }, { sym: 'LA', label: 'Length of soil A', value: LA / 10, unit: 'cm', sig: 3 }, { sym: 'LB', label: 'Length of soil B', value: LB / 10, unit: 'cm', sig: 3 }, { sym: 'LC', label: 'Length of soil C', value: LC / 10, unit: 'cm', sig: 3 },
                { sym: 'kA', label: 'Hydraulic conductivity of soil A', value: kA, unit: 'cm/s', sig: 2 }, { sym: 'kB', label: 'Hydraulic conductivity of soil B', value: kB, unit: 'cm/s', sig: 2 }, { sym: 'kC', label: 'Hydraulic conductivity of soil C', value: kC, unit: 'cm/s', sig: 2 }, { sym: 'h', label: 'Constant head difference', value: hmm / 10, unit: 'cm', sig: 3 }],
        sketch: { type: 'layers', layers: [{ H: LA / 1000, k: kA }, { H: LB / 1000, k: kB }, { H: LC / 1000, k: kC }], dir: 'V', unit: 'm' },
        assumptions: ['The soils are in series: the same flow passes through each, so the equivalent conductivity is the "perpendicular" (series) form.', 'All lengths converted to cm, so $k$ in cm/s gives $q$ in cm³/s.'],
        parts: [
          { sym: 'L', label: 'Total length of flow', expr: 'LA + LB + LC', unit: 'cm', why: '$L = Sum L_i$.' },
          { sym: 'kVeq', label: 'Equivalent conductivity in the flow direction', expr: 'L / (LA / kA + LB / kB + LC / kC)', unit: 'cm/s', why: 'Same flow through each soil, head losses add: $kVeq = L / Sum (L_i / k_i)$.', mistakes: [{ expr: '(kA * LA + kB * LB + kC * LC) / L', msg: MS.kHkV, tag: 'layered' }] },
          { sym: 'A', label: 'Tube cross-sectional area', expr: 'b ^ 2', unit: 'cm²', why: 'Square section of side $b$: $A = b^2$.' },
          { sym: 'q', label: 'Rate of supply', expr: 'kVeq * (h / L) * A', unit: 'cm³/s', why: 'Darcy: $q = kVeq i A$ with $i = h / L$.' },
          { sym: 'qh', label: 'Rate of supply per hour', expr: 'q * 3600', unit: 'cm³', why: 'Multiply by 3600 s/h; the answer is the volume supplied in one hour (cm³/h).', mistakes: [{ expr: 'q', msg: 'That is per second. Multiply by 3600 for cm³ per hour.', tag: 'units' }] }
        ],
        check: ['$kVeq$ is closest to the smallest $k$ (soil C controls) ✓'], interpret: 'In a series arrangement the least permeable soil throttles the flow, just as for vertical flow through horizontal layers.'
      };
    } });

  /* 21. Pumping test — unconfined */
  T.push({ id: 'c7-pump-unconfined', chapter: 7, topic: 'field', difficulty: 2, method: '$k = 2.303 q log10(r1 / r2) / [pi (h1^2 - h2^2)]$',
    title: 'Pumping test in an unconfined aquifer',
    generate: function (r, sys) {
      var u = L_(sys), si = sys === 'SI';
      var r1 = si ? r.pick([40, 50, 60, 80]) : r.pick([150, 200, 250]), r2 = si ? r.pick([10, 15, 20]) : r.pick([40, 50, 60]);
      var h2 = si ? r.range(4, 7, 2) : r.range(14, 22, 1), h1 = U.roundTo(h2 + (si ? r.range(0.3, 1.2) : r.range(1, 4)), 2);
      var q = si ? rs(r.range(0.005, 0.03), 2) : rs(r.range(5, 25), 2);
      return {
        text: 'A well fully penetrating an unconfined permeable layer underlain by an impermeable stratum is pumped at a steady rate $q$ = ' + q + ' ' + u.q + '. In observation wells at radial distances $r1$ = ' + r1 + ' ' + u.L + ' and $r2$ = ' + r2 + ' ' + u.L + ', the water levels above the impermeable layer are $h1$ = ' + h1 + ' ' + u.L + ' and $h2$ = ' + h2 + ' ' + u.L + '. Find $k$.',
        given: [{ sym: 'q', label: 'Pumping rate', value: q, unit: u.q, sig: 2 }, { sym: 'r1', label: 'Radius to far observation well', value: r1, unit: u.L, sig: 3 }, { sym: 'r2', label: 'Radius to near observation well', value: r2, unit: u.L, sig: 3 }, { sym: 'h1', label: 'Water level at $r1$', value: h1, unit: u.L, sig: 3 }, { sym: 'h2', label: 'Water level at $r2$', value: h2, unit: u.L, sig: 3 }],
        sketch: { type: 'well', confined: false },
        assumptions: ['Steady state; the well fully penetrates the layer; flow is horizontal with gradient $i = d h / d r$; homogeneous isotropic layer.'],
        parts: [
          { sym: 'k', label: 'Hydraulic conductivity', expr: '2.303 * q * log10(r1 / r2) / (pi * (h1 ^ 2 - h2 ^ 2))', unit: u.k, why: '$q = k (d h / d r) 2 pi r h$; separating variables and integrating between the observation wells gives $k = 2.303 q log10(r1 / r2) / [pi (h1^2 - h2^2)]$.',
            mistakes: [{ expr: 'q * log10(r1 / r2) / (pi * (h1 ^ 2 - h2 ^ 2))', msg: 'The factor 2.303 that converts $log10$ to $ln$ is missing.', tag: 'log' }, { expr: '2.303 * q * log10(r1 / r2) / (pi * (h1 - h2) ^ 2)', msg: 'The denominator is $pi (h1^2 - h2^2)$, not $pi (h1 - h2)^2$.', tag: 'formula' }] }
        ],
        check: ['$h1 > h2$ because the farther well is drawn down less ✓', 'Units: ' + u.q + ' ÷ ' + u.L + '² = ' + u.k + ' ✓'],
        interpret: 'A field pumping test samples a large volume of soil and captures layering and fissures that a small laboratory specimen misses.'
      };
    } });

  /* 22. Pumping test — confined */
  T.push({ id: 'c7-pump-confined', chapter: 7, topic: 'field', difficulty: 2, method: '$k = q log10(r1 / r2) / [2.727 H (h1 - h2)]$',
    title: 'Pumping test in a confined aquifer',
    generate: function (r, sys) {
      var u = L_(sys), si = sys === 'SI';
      var r1 = si ? r.pick([40, 60, 75]) : r.pick([150, 200]), r2 = si ? r.pick([12, 15, 20]) : r.pick([40, 60]);
      var H = si ? r.pick([3, 4, 5, 6]) : r.pick([10, 15, 20]), h2 = si ? r.range(8, 12, 2) : r.range(25, 35, 1), h1 = U.roundTo(h2 + (si ? r.range(0.3, 1) : r.range(1, 3)), 2);
      var q = si ? rs(r.range(0.003, 0.02), 2) : rs(r.range(3, 15), 2);
      return {
        text: 'A well penetrates the full thickness $H$ = ' + H + ' ' + u.L + ' of a confined aquifer and is pumped at $q$ = ' + q + ' ' + u.q + '. The piezometric levels above the bottom of the aquifer are $h1$ = ' + h1 + ' ' + u.L + ' at $r1$ = ' + r1 + ' ' + u.L + ' and $h2$ = ' + h2 + ' ' + u.L + ' at $r2$ = ' + r2 + ' ' + u.L + '. Find $k$.',
        given: [{ sym: 'q', label: 'Pumping rate', value: q, unit: u.q, sig: 2 }, { sym: 'H', label: 'Aquifer thickness', value: H, unit: u.L, sig: 2 }, { sym: 'r1', label: 'Radius to far observation well', value: r1, unit: u.L, sig: 3 }, { sym: 'r2', label: 'Radius to near observation well', value: r2, unit: u.L, sig: 3 }, { sym: 'h1', label: 'Piezometric level at $r1$', value: h1, unit: u.L, sig: 3 }, { sym: 'h2', label: 'Piezometric level at $r2$', value: h2, unit: u.L, sig: 3 }],
        sketch: { type: 'well', confined: true },
        assumptions: ['Steady state; the piezometric surface stays above the top of the aquifer (it remains confined); horizontal flow through the thickness $H$.'],
        parts: [
          { sym: 'k', label: 'Hydraulic conductivity', expr: 'q * log10(r1 / r2) / (2.727 * H * (h1 - h2))', unit: u.k, why: '$q = k (d h / d r) 2 pi r H$ → $k = q ln(r1 / r2) / [2 pi H (h1 - h2)]$; and $2 pi / 2.303 = 2.727$.',
            mistakes: [{ expr: '2.303 * q * log10(r1 / r2) / (pi * (h1 ^ 2 - h2 ^ 2))', msg: 'That is the UNCONFINED-aquifer equation. In a confined aquifer the flow thickness is the constant $H$.', tag: 'formula' }] }
        ],
        check: ['$k$ is positive and in a sensible range for an aquifer (sand or gravel) ✓'], interpret: 'In a confined aquifer the flow area $2 pi r H$ does not shrink with drawdown, giving a simpler equation.'
      };
    } });

  /* 23. Travel time */
  T.push({ id: 'c7-travel-time', chapter: 7, topic: 'velocity', difficulty: 2, method: '$vs = k i / n$; $t = L / vs$',
    title: 'Travel time of seepage through a layer',
    generate: function (r) {
      var k = rs(Math.pow(10, r.range(-4, -2)), 2), Dh = r.range(1, 4, 1), Lm = r.pick([20, 30, 50, 80]), n = r.range(0.3, 0.45, 2);
      return {
        text: 'A sand layer ($k$ = ' + kf(k) + ', $n$ = ' + Math.round(n * 100) + ' %) connects a pond to a river ' + Lm + ' m away along the flow path. The difference in water level (total head) is $Dh$ = ' + Dh + ' m. Estimate the time for water to travel from the pond to the river, in days.',
        given: [{ sym: 'k', label: 'Hydraulic conductivity', value: k, unit: 'cm/s', sig: 2 }, { sym: 'n', label: 'Porosity', value: n, unit: '%', sig: 2 }, { sym: 'Lm', label: 'Flow path length', value: Lm, unit: 'm', sig: 2 }, { sym: 'Dh', label: 'Head difference', value: Dh, unit: 'm', sig: 2 }],
        assumptions: ['Uniform, saturated, one-dimensional flow; travel at the average seepage velocity (no dispersion).'],
        parts: [
          { sym: 'i', label: 'Hydraulic gradient', expr: 'Dh / Lm', unit: '', why: '$i = Dh / L$.' },
          { sym: 'vs', label: 'Seepage velocity', expr: 'k * i / n', unit: 'cm/s', why: '$vs = v / n = k i / n$.', mistakes: [{ expr: 'k * i', msg: MS.vsAsV, tag: 'seepage-velocity' }] },
          { sym: 'tday', label: 'Travel time', expr: 'Lm * 100 / vs / 86400', unit: 'day', why: '$t = L / vs$: convert $L$ to cm (×100) to match $vs$ in cm/s, then s → days (÷86 400).', mistakes: [{ expr: 'Lm * 100 / (k * i) / 86400', msg: 'Use the seepage velocity $k i / n$, not the discharge velocity: water moves only through the voids.', tag: 'seepage-velocity' }] }
        ],
        check: ['The travel time is long for small gradients, which is realistic for groundwater ✓'], interpret: 'Contaminant arrival estimates use the seepage velocity, not the discharge velocity.'
      };
    } });

  /* 24. Compacted clay liner check */
  T.push({ id: 'c7-liner-check', chapter: 7, topic: 'compacted-clay', difficulty: 2, method: 'Falling-head $k$ compared with $10^{-7}$ cm/s',
    title: 'Does the compacted clay meet the liner criterion?',
    generate: function (r) {
      var a = r.pick([0.3, 0.5]), A = r.pick([30, 40]), L = r.pick([5, 7, 10]), h1 = 120;
      var k = Math.pow(10, r.range(-8, -6.3)), t = rs(r.pick([86400, 172800, 259200]), 3), h2 = U.roundTo(P.fallingHeadH2(a, L, A, k, h1, t), 1);
      return {
        text: 'A compacted clay specimen ($L$ = ' + L + ' cm, $A$ = ' + A + ' cm²) is tested in a falling-head permeameter with $a$ = ' + a + ' cm². The head falls from $h1$ = ' + h1 + ' cm to $h2$ = ' + h2 + ' cm in $t$ = ' + t + ' s. Find $k$ and compare it with the common liner requirement $k$ ≤ 1 × $10^{-7}$ cm/s (enter the ratio $k / 10^{-7}$).',
        constants: [{ sym: 'kreq', value: 1e-7, unit: 'cm/s', label: 'required maximum' }],
        given: [{ sym: 'a', label: 'Standpipe area', value: a, unit: 'cm²', sig: 2 }, { sym: 'A', label: 'Specimen area', value: A, unit: 'cm²', sig: 2 }, { sym: 'L', label: 'Specimen length', value: L, unit: 'cm', sig: 2 }, { sym: 'h1', label: 'Initial head', value: h1, unit: 'cm', sig: 3 }, { sym: 'h2', label: 'Final head', value: h2, unit: 'cm', sig: 4 }, { sym: 't', label: 'Elapsed time', value: t, unit: 's', sig: 3 }],
        sketch: { type: 'fallingHead', d: Math.sqrt(4 * a / Math.PI), D: Math.sqrt(4 * A / Math.PI), L: L, h1: h1, h2: h2, t: t },
        assumptions: ['The specimen is saturated; the laboratory $k$ represents the compacted fill at this moisture content and unit weight.'],
        parts: [
          { sym: 'k', label: 'Hydraulic conductivity', expr: '2.303 * a * L / (A * t) * log10(h1 / h2)', unit: 'cm/s', why: 'Falling-head equation $k = 2.303 (a L / A t) log10(h1 / h2)$.', mistakes: [{ expr: '2.303 * A * L / (a * t) * log10(h1 / h2)', msg: MS.aSwap, tag: 'area-swap' }] },
          { sym: 'ratio', label: 'Ratio to the required maximum', expr: 'k / kreq', unit: '', why: 'A ratio ≤ 1 meets the criterion.' }
        ],
        check: ['Ratio ≤ 1 → acceptable on hydraulic conductivity; > 1 → not acceptable.'],
        interpret: 'For a liner, the acceptable zone on the moisture content–dry unit weight plot is the set of compaction conditions that give $k$ ≤ 1 × $10^{-7}$ cm/s (plus adequate strength and limited shrinkage). Clays compacted wet of optimum generally give the lowest $k$.'
      };
    } });

  /* 25. Flow through an inclined permeable layer (textbook example form) */
  T.push({ id: 'c7-inclined-layer', chapter: 7, topic: 'darcy', difficulty: 3, method: '$i = Dh / (L / cos alpha)$; $q = k i A$ per unit width',
    title: 'Seepage through an inclined permeable layer',
    generate: function (r) {
      var H = r.pick([2, 3, 4]), alpha = r.pick([5, 8, 10, 12, 15]), L = r.pick([40, 50, 60]), h = r.range(2, 5, 1), k = rs(Math.pow(10, r.range(-3, -2)), 2);
      return {
        text: 'A permeable soil layer is underlain by an impervious layer and dips at $alpha$ = ' + alpha + '° to the horizontal. Its thickness measured vertically is $H$ = ' + H + ' m, and $k$ = ' + kf(k) + '. Two piezometers placed $L$ = ' + L + ' m apart HORIZONTALLY show a difference in water level $h$ = ' + h + ' m. Calculate the rate of seepage per metre width of the layer, in m³/h.',
        constants: [{ sym: 'deg', value: Math.PI / 180, unit: '', label: 'radians per degree', hidden: true }],
        given: [{ sym: 'H', label: 'Layer thickness (vertical)', value: H, unit: 'm', sig: 2 }, { sym: 'alpha', label: 'Dip angle in degrees', value: alpha, unit: '', sig: 2 }, { sym: 'L', label: 'Horizontal distance between piezometers', value: L, unit: 'm', sig: 2 }, { sym: 'h', label: 'Head loss', value: h, unit: 'm', sig: 2 }, { sym: 'k', label: 'Hydraulic conductivity', value: k, unit: 'cm/s', sig: 2 }],
        assumptions: ['Flow is parallel to the layer; the flow length between the piezometers is $L / cos alpha$; the flow area per unit width is $(H cos alpha)(1)$.'],
        parts: [
          { sym: 'i', label: 'Hydraulic gradient', expr: 'h * cos(alpha * deg) / L', unit: '', why: '$i$ = head loss ÷ length along the flow path. The path along the layer is $L / cos alpha$, so $i = h / (L / cos alpha) = h cos alpha / L$.', mistakes: [{ expr: 'h / L', msg: 'The flow path follows the inclined layer, so its length is $L / cos alpha$, not $L$.', tag: 'gradient' }] },
          { sym: 'Aw', label: 'Flow area per metre width', expr: 'H * cos(alpha * deg) * 1', unit: 'm²', why: 'Area normal to the flow: $A = (H cos alpha)(1)$.' },
          { sym: 'q', label: 'Rate of seepage per metre width', expr: 'k / 100 * i * Aw * 3600', unit: 'm³/h', why: '$q = k i A$, with $k$ converted from cm/s to m/s (÷100) and seconds to hours (×3600).' }
        ],
        check: ['A small $alpha$ gives values close to the horizontal-layer case ✓'], interpret: 'Geometry matters: both the gradient and the flow area depend on the dip angle.'
      };
    } });

  /* ---------- combined Chapter 3 + 7 problems ---------- */
  T.push({ id: 'cx-porosity-seepage', chapter: 'X', topic: 'combined', difficulty: 3, method: 'Phase relations → $n$; Darcy → $v$; $vs = v / n$',
    title: 'From sample measurements to seepage velocity',
    generate: function (r) {
      var Gs = r.pick([2.65, 2.66, 2.68]), e = r.range(0.5, 0.8), V = r.pick([500, 750, 1000]), Ms = U.roundTo(Gs * V / (1 + e), 1);
      var k = rs(Math.pow(10, r.range(-3, -1.7)), 2), i = r.range(0.3, 0.9, 2);
      return {
        text: 'An oven-dried sand compacted into a ' + V + ' cm³ mould has a dry mass of ' + Ms + ' g; $Gs$ = ' + Gs + '. In the field the same sand is fully saturated, has the same void ratio and $k$ = ' + kf(k) + ', and carries flow under $i$ = ' + i.toFixed(2) + '. Find $e$, $n$, the discharge velocity and the seepage velocity.',
        given: [{ sym: 'V', label: 'Mould volume', value: V, unit: 'cm³', sig: 3 }, { sym: 'Ms', label: 'Dry mass', value: Ms, unit: 'g', sig: 4 }, { sym: 'Gs', label: 'Specific gravity of soil solids', value: Gs, unit: '', sig: 3 }, { sym: 'k', label: 'Hydraulic conductivity', value: k, unit: 'cm/s', sig: 2 }, { sym: 'i', label: 'Hydraulic gradient', value: i, unit: '', sig: 3 }],
        assumptions: ['$rhow$ = 1 g/cm³, so $Vs$ (cm³) = $Ms / Gs$.', 'Stated explicitly: the field soil is saturated with the same $e$ as the sample, so all voids conduct flow.'],
        parts: [
          { sym: 'Vs', label: 'Volume of solids', expr: 'Ms / Gs', unit: 'cm³', why: '$Ms = Gs rhow Vs$ with $rhow$ = 1 g/cm³.' },
          { sym: 'e', label: 'Void ratio', expr: '(V - Vs) / Vs', unit: '', why: '$e = Vv / Vs$.', mistakes: [{ expr: '(V - Vs) / V', msg: 'That is the porosity. $e = Vv / Vs$.', tag: 'e-vs-n' }] },
          { sym: 'n', label: 'Porosity', expr: 'e / (1 + e)', unit: '%', why: '$n = e / (1 + e)$.' },
          { sym: 'v', label: 'Discharge velocity', expr: 'k * i', unit: 'cm/s', why: 'Darcy: $v = k i$.' },
          { sym: 'vs', label: 'Seepage velocity', expr: 'v / n', unit: 'cm/s', why: '$vs = v / n = v (1 + e) / e$.', mistakes: [{ expr: 'v / e', msg: MS.vsWithE, tag: 'e-vs-n' }, { expr: 'v', msg: MS.vsAsV, tag: 'seepage-velocity' }] }
        ],
        check: ['$vs > v$ ✓'], interpret: 'Phase relationships provide $n$, which converts Darcy’s superficial velocity into the true average velocity in the pores.'
      };
    } });

  T.push({ id: 'cx-densify-k', chapter: 'X', topic: 'combined', difficulty: 3, method: '$Dr$ → $e$; Kozeny–Carman ratio → $k$',
    title: 'Densification and its effect on hydraulic conductivity',
    generate: function (r) {
      var emin = r.range(0.42, 0.52, 2), emax = U.roundTo(emin + r.range(0.3, 0.38), 2), D1 = r.pick([0.25, 0.3, 0.35]), D2 = r.pick([0.75, 0.8, 0.85]), k1 = rs(Math.pow(10, r.range(-2.5, -1.5)), 2);
      return {
        text: 'A clean sand ($emax$ = ' + emax.toFixed(2) + ', $emin$ = ' + emin.toFixed(2) + ') has $k1$ = ' + kf(k1) + ' at $Dr$ = ' + Math.round(D1 * 100) + ' %. Estimate $k$ after vibro-compaction to $Dr$ = ' + Math.round(D2 * 100) + ' %, using $k = C1 e^3 / (1 + e)$.',
        given: [{ sym: 'emax', label: 'Maximum void ratio', value: emax, unit: '', sig: 3 }, { sym: 'emin', label: 'Minimum void ratio', value: emin, unit: '', sig: 3 }, { sym: 'k1', label: 'Initial hydraulic conductivity', value: k1, unit: 'cm/s', sig: 2 }, { sym: 'D1', label: 'Initial relative density', value: D1, unit: '%', sig: 2 }, { sym: 'D2', label: 'Final relative density', value: D2, unit: '%', sig: 2 }],
        assumptions: ['Grain size and shape unchanged; the Kozeny–Carman proportionality applies.'],
        parts: [
          { sym: 'e1', label: 'Void ratio at the initial $Dr$', expr: 'emax - D1 * (emax - emin)', unit: '', why: 'From $Dr = (emax - e) / (emax - emin)$.' },
          { sym: 'e2', label: 'Void ratio at the final $Dr$', expr: 'emax - D2 * (emax - emin)', unit: '', why: 'Same relation.' },
          { sym: 'k2', label: 'Hydraulic conductivity after densification', expr: 'k1 * (e2 ^ 3 / (1 + e2)) / (e1 ^ 3 / (1 + e1))', unit: 'cm/s', why: '$k2 / k1 = [e2^3 / (1 + e2)] / [e1^3 / (1 + e1)]$.' }
        ],
        check: ['$k2 < k1$ ✓'], interpret: 'Ground improvement that densifies a sand also reduces its permeability.'
      };
    } });

  T.push({ id: 'cx-falling-head-specimen', chapter: 'X', topic: 'combined', difficulty: 3, method: 'Specimen phase data + falling-head $k$ → $vs$',
    title: 'Falling-head specimen: hydraulic conductivity and seepage velocity',
    generate: function (r) {
      var D = 7.5, L = 10, Gs = r.pick([2.68, 2.7, 2.72]), e = r.range(0.6, 0.9), A = Math.PI * D * D / 4, V = A * L, Ms = U.roundTo(Gs * V / (1 + e), 1);
      var a = 0.5, h1 = 100, k = Math.pow(10, r.range(-4.5, -3.5)), t = r.pick([300, 600, 900]), h2 = U.roundTo(P.fallingHeadH2(a, L, A, k, h1, t), 1);
      return {
        text: 'A saturated silty sand specimen ($D$ = ' + D + ' cm, $L$ = ' + L + ' cm) has an oven-dry mass of ' + Ms + ' g; $Gs$ = ' + Gs + '. In a falling-head test (standpipe area $a$ = ' + a + ' cm²) the head falls from $h1$ = ' + h1 + ' cm to $h2$ = ' + h2 + ' cm in $t$ = ' + t + ' s. Find $n$, $k$, and the seepage velocity at the START of the test (when $i = h1 / L$).',
        given: [{ sym: 'dia', label: 'Specimen diameter', value: D, unit: 'cm', sig: 2 }, { sym: 'L', label: 'Specimen length', value: L, unit: 'cm', sig: 2 }, { sym: 'Ms', label: 'Oven-dry mass', value: Ms, unit: 'g', sig: 4 }, { sym: 'Gs', label: 'Specific gravity of soil solids', value: Gs, unit: '', sig: 3 },
                { sym: 'a', label: 'Standpipe area', value: a, unit: 'cm²', sig: 1 }, { sym: 'h1', label: 'Initial head', value: h1, unit: 'cm', sig: 3 }, { sym: 'h2', label: 'Final head', value: h2, unit: 'cm', sig: 4 }, { sym: 't', label: 'Elapsed time', value: t, unit: 's', sig: 3 }],
        sketch: { type: 'fallingHead', d: Math.sqrt(4 * a / Math.PI), D: D, L: L, h1: h1, h2: h2, t: t },
        assumptions: ['The specimen is saturated (stated); $rhow$ = 1 g/cm³.'],
        parts: [
          { sym: 'A', label: 'Specimen area', expr: 'pi * dia ^ 2 / 4', unit: 'cm²', why: '$A = pi D^2 / 4$.' },
          { sym: 'n', label: 'Porosity', expr: '1 - Ms / (Gs * A * L)', unit: '%', why: '$Vs = Ms / Gs$ (cm³) and $n = 1 - Vs / V$ with $V = A L$.' },
          { sym: 'k', label: 'Hydraulic conductivity', expr: '2.303 * a * L / (A * t) * log10(h1 / h2)', unit: 'cm/s', why: 'Falling-head equation.', mistakes: [{ expr: '2.303 * A * L / (a * t) * log10(h1 / h2)', msg: MS.aSwap, tag: 'area-swap' }] },
          { sym: 'vs', label: 'Initial seepage velocity', expr: 'k * h1 / L / n', unit: 'cm/s', why: '$vs = k i / n$ with $i = h1 / L$.' }
        ],
        check: ['$vs > v$ ✓'], interpret: 'One specimen supplies both the phase data and the hydraulic data needed to describe flow through the pores.'
      };
    } });

  SM.registerTemplates(T);
})(typeof window !== 'undefined' ? window : globalThis);
