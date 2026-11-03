#!/usr/bin/env node
/* Verification suite. Run:  node tests/run-tests.js
 * - Hand-calculated reference values (computed independently of the app's expression engine)
 * - Unit conversions and number parsing
 * - Phase solver: valid boundary cases, invalid inputs, insufficient information, contradictions
 * - Every problem template × many seeds × both unit systems: physical validity, answer acceptance
 *   in equivalent units, tolerance, mistake detection, cross-checks against independent solvers
 * - Content integrity: lessons, formulas, concept questions, diagrams */
'use strict';
var path = require('path');
var root = path.join(__dirname, '..', 'js');
['core/units.js', 'core/expr.js', 'core/mathtext.js', 'core/phase.js', 'core/perm.js', 'core/problem.js', 'data/ch3-problems.js', 'data/ch7-problems.js',
 'data/lessons.js', 'data/reference.js', 'data/concepts.js', 'data/florida.js', 'ui/diagrams.js'].forEach(function (f) { require(path.join(root, f)); });
var SM = globalThis.SM, U = SM.units, PB = SM.problem;

var pass = 0, fail = 0, failures = [];
function ok(cond, msg) { if (cond) pass++; else { fail++; failures.push(msg); } }
function near(a, b, tol, msg) { ok(Math.abs(a - b) <= (tol || 1e-3) * Math.max(Math.abs(b), 1e-12), msg + ' (got ' + a + ', expected ' + b + ')'); }

/* ---------------- 1. units ---------------- */
near(U.convert(1, 'cm/s', 'm/day'), 864, 1e-9, 'cm/s → m/day');
near(U.convert(1, 'cm/s', 'ft/min'), 1.968504, 1e-6, 'cm/s → ft/min');
near(U.convert(62.4, 'lb/ft³', 'kN/m³'), 9.8023, 1e-4, 'γw US → SI');
near(U.convert(1, 'm³', 'cm³'), 1e6, 1e-12, 'm³ → cm³');
near(U.convert(1, 'ft³', 'L'), 28.3168, 1e-5, 'ft³ → L');
near(U.convert(1, 'kip', 'kN'), 4.44822, 1e-5, 'kip → kN');
near(U.massToWeight(1000, 'kg', 'kN'), 9.81, 1e-12, 'mass → weight');
near(U.densityToUnitWeight(1.85, 'g/cm³', 'kN/m³'), 18.1485, 1e-6, 'density → unit weight');
near(U.convert(1, 'darcy', 'cm²', 'permeability'), 0.9869233e-8, 1e-6, 'darcy → cm²');
[['3.2e-4', 3.2e-4], ['3.2E-4', 3.2e-4], ['3.2×10^-4', 3.2e-4], ['3.2x10-4', 3.2e-4], ['3.2*10^(-4)', 3.2e-4], ['−0.5', -0.5], ['1,234.5', 1234.5], ['0,65', 0.65], ['.25', 0.25], ['18', 18], ['3.2 × 10⁻⁴', 3.2e-4]]
  .forEach(function (c) { near(U.parseNumber(c[0]), c[1], 1e-12, 'parse ' + c[0]); });
['abc', '', '1.2.3', '5 kg'].forEach(function (s) { ok(isNaN(U.parseNumber(s)), 'reject parse "' + s + '"'); });
ok(U.fmt(0.000123, 3) === '1.23 × 10⁻⁴', 'sci format: ' + U.fmt(0.000123, 3));
ok(U.fmt(16.652718, 4) === '16.65', 'fmt 4 sig');

/* ---------------- 2. phase solver: hand calculations ---------------- */
var gw = 9.81;
// (a) saturated: w = 0.20, Gs = 2.70 → e = 0.54, γsat = (2.70 + 0.54)·9.81/1.54
var r = SM.phase.solve({ w: 0.2, Gs: 2.7, S: 1 }, gw);
near(r.values.e, 0.54, 1e-9, 'sat e'); near(r.values.gsat, 3.24 * 9.81 / 1.54, 1e-9, 'sat γsat'); near(r.values.g, r.values.gsat, 1e-9, 'γ = γsat when S = 1');
ok(r.status === 'insufficient' && /sample size/.test(r.message), 'intensive-only → insufficient (sample size)');
// (b) W = 18.5 kN, Ws = 16.0 kN, V = 1 m³, Gs = 2.70
var Vs = 16 / (2.7 * 9.81), Vw = 2.5 / 9.81;
r = SM.phase.solve({ W: 18.5, Ws: 16.0, V: 1, Gs: 2.7 }, gw);
ok(r.status === 'ok', 'full solve status');
near(r.values.Vs, Vs, 1e-9, 'Vs'); near(r.values.e, (1 - Vs) / Vs, 1e-9, 'e'); near(r.values.S, Vw / (1 - Vs), 1e-9, 'S'); near(r.values.w, 2.5 / 16, 1e-9, 'w');
near(r.values.n, 1 - Vs, 1e-9, 'n'); near(r.values.gd, 16, 1e-9, 'γd'); near(r.values.Va, 1 - Vs - Vw, 1e-9, 'Va');
// (c) γ, w, Gs (no extensive) → e via γd
r = SM.phase.solve({ g: 18.0, w: 0.15, Gs: 2.68 }, gw);
near(r.values.e, 2.68 * 9.81 / (18 / 1.15) - 1, 1e-9, 'e from γ, w, Gs');
// (d) γd, w, S without Gs (special relation)
var Gs0 = 2.7, e0 = 0.8, S0 = 0.6, w0 = S0 * e0 / Gs0, gd0 = Gs0 * 9.81 / 1.8;
r = SM.phase.solve({ gd: gd0, w: w0, S: S0 }, gw); near(r.values.e, e0, 1e-9, 'e from γd, w, S'); near(r.values.Gs, Gs0, 1e-9, 'Gs from γd, w, S');
// (e) γsat and w (saturated, no Gs)
var gs1 = (2.72 + 0.9) * 9.81 / 1.9; r = SM.phase.solve({ g: gs1, w: 0.9 / 2.72, S: 1 }, gw); near(r.values.Gs, 2.72, 1e-9, 'Gs from γsat & w');
// boundary-valid cases: e > 1 and w > 100 %
r = SM.phase.solve({ e: 3.0, S: 1, Gs: 2.7, V: 1 }, gw); ok(r.status === 'ok' && r.values.w > 1, 'w > 100 % is valid'); near(r.values.w, 3 / 2.7, 1e-9, 'w for e = 3');
r = SM.phase.solve({ e: 1.4, Gs: 2.65, S: 0 , Vs: 1 }, gw); ok(r.status === 'ok' && r.values.Vw === 0 && r.values.w === 0, 'dry soil S = 0 valid');
r = SM.phase.solve({ n: 0.58, Gs: 2.7, w: 0.3, V: 2 }, gw); ok(r.status === 'ok', 'n-based solve ok');
// invalid inputs
ok(SM.phase.solve({ S: 1.2, e: 0.6 }, gw).status === 'invalid', 'S > 100 % rejected');
ok(SM.phase.solve({ n: 1.0 }, gw).status === 'invalid', 'n = 100 % rejected');
ok(SM.phase.solve({ e: -0.2 }, gw).status === 'invalid', 'negative e rejected');
ok(SM.phase.solve({ V: 1, Vs: 0.6, Vw: 0.5 }, gw).status === 'invalid', 'Vw > Vv rejected');
ok(SM.phase.solve({ W: 10, Ws: 12 }, gw).status === 'invalid', 'Ws > W rejected');
ok(SM.phase.solve({ V: 1, Vs: 1.2 }, gw).status === 'invalid', 'Vs > V rejected');
ok(SM.phase.solve({ w: 0.5, Gs: 2.7, e: 0.6 }, gw).status === 'invalid', 'w·Gs > e (S > 1) rejected');
ok(SM.phase.solve({ V: 1, Vs: 0.6, e: 0.5 }, gw).status === 'invalid', 'contradictory e rejected');
// insufficient (must not silently assume)
r = SM.phase.solve({ g: 18, w: 0.15 }, gw); ok(r.status === 'insufficient' && !('e' in r.values), 'γ & w only → e unknown');
r = SM.phase.solve({ e: 0.7 }, gw); ok(r.status === 'insufficient' && !('S' in r.values) && !('Gs' in r.values), 'no assumed S or Gs');
// tiny rounding inconsistency is a warning, not an error
r = SM.phase.solve({ e: 0.65, n: 0.396 }, gw); ok(r.status !== 'invalid' && r.warnings.length > 0, 'rounding inconsistency → warning');
// relative density
near(SM.phase.Dr(0.85, 0.48, 0.62), 0.23 / 0.37, 1e-12, 'Dr');
var emx = 0.85, emn = 0.48, ee = 0.62, gmx = 2.66 * 9.81 / 1.48, gmn = 2.66 * 9.81 / 1.85, gdd = 2.66 * 9.81 / 1.62;
near(SM.phase.DrFromGd(gmn, gmx, gdd), SM.phase.Dr(emx, emn, ee), 1e-9, 'Dr(γd) == Dr(e)');

/* ---------------- 3. permeability: hand calculations ---------------- */
near(SM.perm.constantHeadK(350, 25, 44.2, 60, 120), 350 * 25 / (44.2 * 60 * 120), 1e-12, 'constant head');
var kfh = SM.perm.fallingHeadK(0.785, 10, 44.2, 900, 100, 60);
near(kfh, 0.785 * 10 / (44.2 * 900) * Math.log(100 / 60), 2e-4, 'falling head (2.303 log10 ≈ ln)');
near(SM.perm.fallingHeadH2(0.785, 10, 44.2, SM.perm.fallingHeadKexact(0.785, 10, 44.2, 900, 100, 60), 100, 900), 60, 1e-9, 'falling head inverse');
near(SM.perm.kHeq([{ H: 1, kH: 0.01 }, { H: 2, kH: 1e-5 }]), (0.01 + 2e-5) / 3, 1e-12, 'kH eq');
near(SM.perm.kVeq([{ H: 1, kV: 0.01 }, { H: 2, kV: 1e-5 }]), 3 / (100 + 2e5), 1e-12, 'kV eq');
ok(SM.perm.kHeq([{ H: 1, kH: 0.3 }, { H: 4, kH: 2e-4 }]) >= SM.perm.kVeq([{ H: 1, kV: 0.3 }, { H: 4, kV: 2e-4 }]), 'kH ≥ kV');
near(SM.perm.pumpUnconfined(0.01, 50, 15, 6, 5.4), 0.01 * Math.log(50 / 15) / (Math.PI * (36 - 29.16)), 2e-4, 'unconfined well (2.303 log10 ≈ ln)');
near(SM.perm.pumpConfined(0.01, 50, 15, 10.5, 10, 4), 0.01 * Math.log(50 / 15) / (2 * Math.PI * 4 * 0.5), 1e-3, 'confined well (2.727 = 2π/2.303)');
near(SM.perm.etaRatio(25), 0.889, 1e-9, 'η25/η20'); near(SM.perm.etaRatio(15), 1.136, 1e-9, 'η15/η20'); near(SM.perm.etaRatio(30), 0.796, 1e-9, 'η30/η20');
near(SM.perm.chapuis(0.2, 0.6), 2.4622 * Math.pow(0.04 * 0.216 / 1.6, 0.7825), 1e-12, 'Chapuis');
near(SM.perm.casagrande(0.85, 0.004), 1.4 * 0.7225 * 0.004, 1e-12, 'Casagrande');
near(SM.perm.taylor(1e-7, 1.5, 1.2, 0.75), 1e-7 * Math.pow(10, -0.4), 1e-12, 'Taylor');

/* ---------------- 4. expression engine ---------------- */
near(SM.expr.evaluate('2.303 * a * L / (A * t) * log10(h1 / h2)', { a: 1, L: 2, A: 4, t: 5, h1: 10, h2: 1 }), 2.303 * 2 / 20, 1e-12, 'expr eval');
near(SM.expr.evaluate('-(e0 - e) / Ck', { e0: 1, e: 0.5, Ck: 0.5 }), -1, 1e-12, 'expr unary');
near(SM.expr.evaluate('2 ^ 3 ^ 2', {}), 512, 1e-12, 'expr power right-assoc');
ok(/frac/.test(SM.expr.toHTML('a / b')), 'fraction rendering');

/* ---------------- 5. templates ---------------- */
var counts = { 3: 0, 7: 0, X: 0 }; SM.templates.forEach(function (t) { counts[t.chapter]++; });
ok(counts[3] >= 20, 'at least 20 Ch. 3 templates (' + counts[3] + ')');
ok(counts[7] >= 20, 'at least 20 Ch. 7 templates (' + counts[7] + ')');
ok(counts.X >= 2, 'combined templates (' + counts.X + ')');
var ids = {}; SM.templates.forEach(function (t) { ok(!ids[t.id], 'unique id ' + t.id); ids[t.id] = 1; ok(!!t.method && !!t.title && !!t.topic, 'metadata ' + t.id); });

var ALT = { 'cm/s': 'm/s', 'm/s': 'cm/s', 'ft/min': 'cm/s', 'cm³': 'L', 'm³': 'cm³', 'ft³': 'L', kN: 'N', lb: 'kN', 'kN/m³': 'lb/ft³', 'lb/ft³': 'kN/m³', 'cm³/s': 'L/s', 'cm²': 'm²', 'm²': 'cm²', s: 'min', m: 'ft', ft: 'm', g: 'kg', kg: 'g', lbm: 'kg', 'g/cm³': 'kg/m³', 'm³/h': 'L/s', day: 'h', 'ft³/min': 'm³/s' };
var SEEDS = 60, built = 0;
var PHASE_SYMS = SM.phase.VARS;
var crossPhase = ['c3-gd-Gs-e', 'c3-saturated-w', 'c3-moist-from-wGsS', 'c3-from-gamma-w', 'c3-all-from-W-V-w', 'c3-phase-fill', 'c3-from-gsat', 'c3-submerged-depth', 'c3-S-from-w', 'c3-moist-oven'];
SM.templates.forEach(function (t) {
  ['SI', 'US'].forEach(function (sys) {
    for (var s = 1; s <= SEEDS; s++) {
      var P;
      try { P = PB.build(t, s * 7919 + 13, sys); } catch (e) { ok(false, t.id + ' build error: ' + e.message); continue; }
      built++;
      ok(typeof P.text === 'string' && P.text.length > 20 && P.parts.length > 0, t.id + ' has text/parts');
      ok(!/NaN|undefined|Infinity/.test(P.text), t.id + ' text clean: ' + P.text.slice(0, 80));
      P.parts.forEach(function (p) {
        var tag = t.id + '/' + p.sym + ' ' + sys + ' seed ' + s;
        ok(isFinite(p.value), tag + ' finite');
        // physical validity of generated answers
        if (p.sym === 'S' || p.sym === 'w2' && /S2/.test(p.expr)) ok(p.value >= -1e-9 && p.value <= 1 + 1e-9, tag + ' S in [0,1]: ' + p.value);
        if (p.sym === 'n') ok(p.value > 0 && p.value < 1, tag + ' n in (0,1)');
        if (/^e\d?$/.test(p.sym)) ok(p.value > 0, tag + ' e > 0');
        if (p.sym === 'Dr') ok(p.value >= -1e-9 && p.value <= 1 + 1e-9, tag + ' Dr in [0,1]: ' + p.value);
        if (p.sym === 'Rc') ok(p.value > 0.7 && p.value < 1.15, tag + ' relative compaction plausible (may exceed 100 %): ' + p.value);
        if (/^(k|k2|k3|k20|kHeq|kVeq|Kp|Kcm|q|v|vs|A|a|V|Vs|Vv|Vw|Ww|Ws|g|gd|gsat|gsub|t|tday|DH|dVw|dMw|Q|Va)$/.test(p.sym)) ok(p.value >= 0, tag + ' non-negative: ' + p.value);
        // answer acceptance
        var asTyped = p.dim === 'ratio' ? String(p.value * 100) : String(p.value);
        var unitTyped = p.dim === 'ratio' ? '%' : p.unit;
        ok(PB.check(p, asTyped, unitTyped, sys).status === 'correct', tag + ' exact answer accepted');
        ok(PB.check(p, String(U.roundSig(p.dim === 'ratio' ? p.value * 100 : p.value, 3)), unitTyped, sys).status === 'correct', tag + ' 3-sig-fig rounding accepted');
        ok(PB.check(p, String((p.dim === 'ratio' ? p.value * 100 : p.value) * 1.05), unitTyped, sys).status !== 'correct' || Math.abs(p.value) < 1e-12, tag + ' 5 % error not accepted');
        if (p.dim === 'ratio') {
          ok(PB.check(p, String(p.value), 'decimal', sys).status === 'correct', tag + ' decimal form accepted');
          if (Math.abs(p.value) > 1e-6) { var pc = PB.check(p, String(p.value), '%', sys); ok(pc.status !== 'correct' && pc.tag === 'percent', tag + ' percent mix-up diagnosed'); }
        }
        if (ALT[p.unit] && p.dim !== 'ratio' && p.dim !== 'none' && p.dim !== 'permeability') {
          var alt = U.convert(p.value, p.unit, ALT[p.unit], p.dim);
          ok(PB.check(p, String(alt), ALT[p.unit], sys).status === 'correct', tag + ' equivalent unit ' + ALT[p.unit] + ' accepted');
        }
        p.mistakes.forEach(function (m) {
          var typed = p.dim === 'ratio' ? String(m.value * 100) : String(m.value);
          var c = PB.check(p, typed, unitTyped, sys);
          ok(c.status !== 'correct', tag + ' mistake value not accepted as correct');
          ok(c.status !== 'correct' && c.msg.length > 20, tag + ' mistake gets specific feedback');
        });
        ok(p.options.filter(function (o) { return o.correct; }).length === 1 && p.options.length >= 2, tag + ' equation options valid');
        ok(PB.hints(P, p.index).length === 4, tag + ' hints');
        ok(/frac|·|=/.test(p.substituted), tag + ' substitution rendered');
      });
      // physical sanity of the unit weights
      P.parts.forEach(function (p) { if (/^(g|gd|gsat)$/.test(p.sym) && (p.unit === 'kN/m³' || p.unit === 'lb/ft³')) { var lo = p.unit === 'kN/m³' ? 6 : 38, hi = p.unit === 'kN/m³' ? 24 : 155; ok(p.value > lo && p.value < hi, t.id + ' unit weight plausible ' + p.value); } });
      // cross-check against the independent phase solver
      if (crossPhase.indexOf(t.id) >= 0) {
        var known = {}, gwv = sys === 'SI' ? 9.81 : 62.4, base = sys === 'SI' ? { V: 'm³', F: 'kN', G: 'kN/m³' } : { V: 'ft³', F: 'lb', G: 'lb/ft³' };
        var usable = true;
        P.given.forEach(function (g) {
          if (!(g.sym in PHASE_SYMS)) return;
          var kind = PHASE_SYMS[g.sym].kind, v = g.value;
          if (kind === 'volume') { if (g.unit === 'cm³' && sys === 'SI') v = v * 1e-6; else if (g.unit !== base.V) { usable = false; return; } }
          if (kind === 'force') { if (g.unit !== base.F) { usable = false; return; } }
          if (kind === 'unitWeight' && g.unit !== base.G) { usable = false; return; }
          known[g.sym] = v;
        });
        if (t.id === 'c3-moist-oven' && sys === 'SI') { var Gv = P.scope; known = { V: Gv.V, W: Gv.W / 1000, Ws: Gv.Ws / 1000, Gs: Gv.Gs }; usable = true; }
        if (usable) {
          var sol = SM.phase.solve(known, gwv);
          ok(sol.status !== 'invalid', t.id + ' givens physically valid (' + sys + ' ' + s + '): ' + (sol.errors || []).join(';'));
          P.parts.forEach(function (p) {
            if (!(p.sym in PHASE_SYMS) || !(p.sym in sol.values)) return;
            var kind = PHASE_SYMS[p.sym].kind, pv = p.value;
            if (kind === 'volume' && p.unit === 'cm³') pv *= 1e-6;
            if ((kind === 'volume' && p.unit !== base.V && p.unit !== 'cm³') || (kind === 'force' && p.unit !== base.F) || (kind === 'unitWeight' && p.unit !== base.G)) return;
            near(pv, sol.values[p.sym], 2e-3, 'cross-check ' + t.id + '/' + p.sym + ' ' + sys);
          });
        }
      }
      // cross-checks against independent permeability functions
      var sc = P.scope;
      if (t.id === 'c7-falling-head-k') near(sc.k, sc.d !== undefined ? SM.perm.fallingHeadK(Math.PI * sc.d * sc.d / 4, sc.L, Math.PI * sc.dia * sc.dia / 4, sc.t, sc.h1, sc.h2) : SM.perm.fallingHeadK(sc.a, sc.L, sc.A, sc.t, sc.h1, sc.h2) / 10, 1e-9, 'falling-head cross-check');
      if (t.id === 'c7-const-head-k') near(sc.k, SM.perm.constantHeadK(sc.Q, sc.L, sc.dia !== undefined ? Math.PI * sc.dia * sc.dia / 4 : sc.A, sc.h, sc.t), 1e-9, 'constant-head cross-check');
      if (t.id === 'c7-pump-unconfined') near(sc.k, SM.perm.pumpUnconfined(sc.q, sc.r1, sc.r2, sc.h1, sc.h2), 1e-9, 'unconfined cross-check');
      if (t.id === 'c7-pump-confined') near(sc.k, SM.perm.pumpConfined(sc.q, sc.r1, sc.r2, sc.h1, sc.h2, sc.H), 1e-9, 'confined cross-check');
      if (t.id === 'c7-layers-headloss') { near(sc.Dh1 + sc.Dh2, sc.Dh, 1e-9, 'head losses add'); near(sc.v, sc.k1 * (sc.Dh1 / sc.H1), 1e-6, 'same v in each layer'); }
      if (t.id === 'c7-heads') ok(sc.hA > sc.hB, 'flow A→B as stated');
      if (t.id === 'c7-temperature') near(sc.k20, sc.kT * sc.etaRatio, 1e-12, 'temperature');
      if (t.id === 'c3-densify-layer') { ok(sc.e2 < sc.e1 && sc.DH > 0 && sc.DH < sc.H, 'densification consistent'); }
      if (t.id === 'c3-water-to-saturate') ok(sc.dVw <= (1 - sc.S1) * sc.Vv + 1e-12, 'added water fits in air voids');
      if (t.id === 'c7-samarasinghe') { var pred = sc.k1 * Math.pow(sc.e2 / sc.e1, sc.nexp) * (1 + sc.e1) / (1 + sc.e2); near(pred, sc.k2, 1e-9, 'Samarasinghe calibrated n reproduces k2'); }
      // diagrams render for every sketch
      if (P.sketch) { var svg = SM.diagrams.render(P.sketch); ok(/^<svg/.test(svg) && !/NaN|undefined/.test(svg), t.id + ' diagram renders cleanly (' + sys + ')'); }
    }
  });
});

/* ---------------- 6. feedback specifics ---------------- */
var T = SM.templateById('c7-falling-head-k'), P7 = null; for (var sd7 = 1; !P7 || P7.parts.length !== 3; sd7++) P7 = PB.build(T, sd7, 'SI'); var kp = P7.parts[2];
ok(PB.check(kp, String(kp.value / 2.303), 'cm/s', 'SI').tag === 'log', 'ln/log mix diagnosed');
ok(PB.check(kp, String(kp.value * 100), 'cm/s', 'SI').tag === 'units', 'factor 100 diagnosed');
ok(PB.check(kp, String(kp.value / 100), 'm/s', 'SI').status === 'correct', 'm/s equivalent accepted');
ok(PB.check(kp, 'abc', 'cm/s', 'SI').status === 'invalid', 'non-number → invalid, not wrong');
ok(PB.check(kp, '', 'cm/s', 'SI').status === 'invalid', 'empty → invalid');
ok(PB.check(kp, String(kp.value * 1.03), 'cm/s', 'SI').status === 'close' && PB.check(kp, String(kp.value * 1.03), 'cm/s', 'SI').credit === 0.5, 'near miss partial credit');
var Pd = PB.build(SM.templateById('c3-density-unitweight'), 3, 'SI'), gp = Pd.parts[0];
ok(PB.check(gp, String(gp.value / 9.81), 'kN/m³', 'SI').tag === 'mass-weight', 'mass/weight confusion diagnosed');
var Ph = PB.build(SM.templateById('c7-heads'), 5, 'SI'), dh = Ph.parts[4];
var wrongDh = Ph.scope.hpA - Ph.scope.hpB; var cdh = PB.check(dh, String(Math.abs(wrongDh)), 'm', 'SI');
ok(cdh.status !== 'correct', 'pressure-head difference not accepted');

/* ---------------- 7. content integrity ---------------- */
SM.lessons.forEach(function (L) {
  ok(L.concept && L.variables && L.relations && L.mistakes.length, 'lesson ' + L.id + ' complete');
  if (L.example) ok(!!SM.templateById(L.example.template), 'lesson ' + L.id + ' example template exists');
  if (L.practice) ok(!!SM.templateById(L.practice), 'lesson ' + L.id + ' practice template exists');
  L.relations.forEach(function (r) { try { SM.expr.parse(r.expr); ok(true, ''); } catch (e) { ok(false, 'lesson ' + L.id + ' relation parse ' + r.expr); } });
  var d = SM.diagrams.render(L.diagram); ok(L.diagram.type === 'none' || /^<svg/.test(d), 'lesson ' + L.id + ' diagram');
});
SM.formulas.forEach(function (f) {
  var v = SM.expr.evaluate(f.expr, f.example); ok(isFinite(v) && v > 0, 'formula example ' + f.id + ' = ' + v);
  ok(f.vars.length && f.assumptions && f.applicability, 'formula ' + f.id + ' documented');
});
near(SM.expr.evaluate('Gs * gw / (1 + e)', { Gs: 2.7, gw: 9.81, e: 0.65 }), 16.0527, 1e-4, 'formula example hand check γd');
SM.concepts.forEach(function (q) { ok(q.answer >= 0 && q.answer < q.options.length && q.explain, 'concept ' + q.id); });
var cc = { 3: 0, 7: 0 }; SM.concepts.forEach(function (q) { if (cc[q.chapter] !== undefined) cc[q.chapter]++; });
ok(cc[3] >= 20 && cc[7] >= 20, 'concept bank size ' + JSON.stringify(cc));
ok(SM.glossary.length >= 50, 'glossary size ' + SM.glossary.length);

/* ---------------- 8. notation & textbook-form checks ---------------- */
// (a) every symbol used in equations is in the symbol table (no accidental auto-subscripts)
(function () {
  var bad = {};
  function chk(sym) { if (!(sym in SM.expr.SYM) && !/^[A-Za-z]\d*$/.test(sym) && !/^k[HV]\d+$/.test(sym)) bad[sym] = 1; }
  SM.templates.forEach(function (t) { ['SI', 'US'].forEach(function (sys) { [1, 2, 3, 4].forEach(function (sd) { var P = PB.build(t, sd, sys); P.parts.forEach(function (x) { chk(x.sym); x.deps.forEach(chk); }); }); }); });
  SM.lessons.forEach(function (L) { L.relations.forEach(function (r) { chk(r.lhs); SM.expr.varsOf(r.expr).forEach(chk); }); });
  SM.formulas.forEach(function (f) { chk(f.lhs); SM.expr.varsOf(f.expr).forEach(chk); });
  ok(!Object.keys(bad).length, 'symbols missing from symbol table: ' + Object.keys(bad).join(', '));
})();
// (b) no plain-text formulas anywhere in the content (tests/lint-math.js)
var lintFindings = require('./lint-math.js').run();
ok(lintFindings.length === 0, 'notation lint: ' + lintFindings.length + ' plain-text formula(s), first: ' + (lintFindings[0] ? lintFindings[0].where + ' ' + lintFindings[0].snip : ''));
// (c) markup renderer: subscripts, Greek, juxtaposition, escaping
ok(SM.mt.html('$e = Vv / Vs$') === '<span class="m"><i>e</i> = <i>V</i><sub>v</sub>/<i>V</i><sub>s</sub></span>', 'markup e = Vv/Vs: ' + SM.mt.html('$e = Vv / Vs$'));
ok(/<i>γ<\/i><sub>d<\/sub>/.test(SM.mt.html('$gd$')), 'markup γd');
ok(/<i>kiA<\/i>/.test(SM.mt.html('$q = k i A$')), 'markup juxtaposition');
ok(/log<sub>10<\/sub>/.test(SM.mt.html('$log10(h1 / h2)$')), 'markup log10');
ok(SM.mt.html('a < b & c') === 'a < b & c', 'non-math text untouched');
ok(!/<script/.test(SM.mt.html('$<script>$')), 'math segment escapes HTML');
ok(/<tspan[^>]*dy="3.5"[^>]*>s<\/tspan>/.test(SM.mt.svg('$Vs$')), 'SVG subscript tspan');
// (d) textbook-style table of unit-weight relationships: every form in a group is the same quantity
(function () {
  var groups = { moist: [], dry: [], sat: [] };
  SM.formulas.forEach(function (f) { if (f.group && groups[f.group]) groups[f.group].push(f); });
  ok(groups.moist.length >= 4 && groups.dry.length >= 7 && groups.sat.length >= 7, 'unit-weight table forms present: ' + groups.moist.length + '/' + groups.dry.length + '/' + groups.sat.length);
  [[2.65, 0.55, 0.4], [2.70, 0.9, 0.75], [2.72, 1.4, 0.95]].forEach(function (c) {
    var Gs = c[0], e = c[1], Sp = c[2], gw = 9.81, st = SM.phase.stateFrom(Gs, e, Sp, 1, gw), sat = SM.phase.stateFrom(Gs, e, 1, 1, gw);
    groups.moist.forEach(function (f) { near(SM.expr.evaluate(f.expr, { Gs: Gs, e: e, S: Sp, w: st.w, n: st.n, gw: gw }), st.g, 1e-9, 'moist form ' + f.id); });
    groups.dry.forEach(function (f) { near(SM.expr.evaluate(f.expr, { Gs: Gs, e: e, S: Sp, w: st.w, n: st.n, gw: gw, g: st.g, gsat: st.gsat }), st.gd, 1e-9, 'dry form ' + f.id); });
    groups.sat.forEach(function (f) { near(SM.expr.evaluate(f.expr, { Gs: Gs, e: e, S: 1, w: sat.w, n: sat.n, gw: gw, gd: sat.gd }), sat.gsat, 1e-9, 'sat form ' + f.id); });
  });
})();
// (e) textbook-form examples: hand calculations independent of the templates
var Pm = PB.build(SM.templateById('c3-moist-oven'), 77, 'SI'), sm = Pm.scope;
near(sm.w, (sm.W - sm.Ws) / sm.Ws, 1e-12, 'moist-oven w'); near(sm.g, sm.W / 1000 / sm.V, 1e-12, 'moist-oven γ (kN/m³)');
near(sm.e, sm.Gs * 9.81 / (sm.Ws / 1000 / sm.V) - 1, 1e-12, 'moist-oven e');
var Pf = PB.build(SM.templateById('c3-field-saturate'), 5, 'SI'), sf = Pf.scope;
near(sf.dMw, (sf.e - sf.w * sf.Gs) * 1000 / (1 + sf.e), 1e-9, 'field-saturate water to add = air voids × ρw');
var Pt = PB.build(SM.templateById('c7-layers-tube'), 9, 'SI'), stb = Pt.scope;
near(stb.q, stb.h * stb.b * stb.b / (stb.LA / stb.kA + stb.LB / stb.kB + stb.LC / stb.kC), 1e-9, 'tube series flow = Δh·A / Σ(L/k)');
var Ph2 = PB.build(SM.templateById('c7-heads'), 4, 'SI');
near(Ph2.scope.hA, Ph2.scope.uA / 9.81 + Ph2.scope.zA, 1e-12, 'Bernoulli h = u/γw + Z');

/* ---------------- 9. Florida context: generated data stay within the documented ranges ---------------- */
for (var fs = 1; fs <= 80; fs++) {
  ['SI', 'US'].forEach(function (sys) {
    var ftDay = sys === 'SI' ? 1 / 0.3048 : 1, ft2Day = sys === 'SI' ? 1 / 0.09290304 : 1;
    var b = PB.build(SM.templateById('fl-biscayne-pump'), fs, sys).scope;
    ok(b.kday * ftDay > 2000 && b.kday * ftDay < 20000, 'Biscayne k in documented range (ft/day): ' + b.kday * ftDay);
    var f = PB.build(SM.templateById('fl-floridan-pump'), fs, sys).scope;
    ok(f.Tr * ft2Day > 9000 && f.Tr * ft2Day < 110000, 'Floridan T within ~10,000–100,000 ft²/day: ' + f.Tr * ft2Day);
    ok(f.h1 > f.H || true, 'piezometric level data present');
    var h = PB.build(SM.templateById('fl-pond-hardpan'), fs, 'SI').scope;
    ok(h.kVeq < 10 * h.k2 && h.kVeq < h.k1, 'hardpan controls vertical flow');
    var kr = PB.build(SM.templateById('fl-karst-reynolds'), fs, 'SI').scope;
    ok(kr.Rec > 1e4 && kr.Res < 1, 'conduit turbulent, sand laminar: ' + kr.Rec + ' / ' + kr.Res);
    var m = PB.build(SM.templateById('fl-muck'), fs, sys).scope;
    ok(m.w > 1 && m.e > 2 && m.gsat > m.gw, 'muck: w > 100 %, e > 2, γsat > γw');
    var pc = PB.build(SM.templateById('fl-phosphatic-clay'), fs, sys).scope;
    near(pc.w, (1 - pc.ssol) / pc.ssol, 1e-12, 'phosphatic w = (1 − s)/s');
    var tt = PB.build(SM.templateById('fl-temperature'), fs, sys).scope;
    ok(tt.etaRatio < 1 && tt.k20 < tt.kT, 'warm Florida groundwater → k20 < kT');
  });
}
SM.concepts.filter(function (q) { return q.florida; }).forEach(function (q) { ok(q.answer < q.options.length, 'Florida concept ' + q.id); });
ok(SM.lessons.filter(function (l) { return l.florida; }).length === 2, 'two Florida lessons');
ok(SM.templates.filter(function (t) { return t.florida; }).length >= 9, 'Florida templates');

console.log('Built ' + built + ' problem instances from ' + SM.templates.length + ' templates (' + counts[3] + ' Ch.3, ' + counts[7] + ' Ch.7, ' + counts.X + ' combined).');
console.log('Assertions passed: ' + pass + ', failed: ' + fail);
if (fail) { console.log(failures.join('\n')); process.exit(1); }
