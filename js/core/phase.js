/* Phase-relationship solver (Chapter 3).
 * Works in one consistent unit set (the active system: kN, m³, kN/m³ or lb, ft³, lb/ft³).
 * Ratios (w, n, S) are decimals.  Solves by constraint propagation over the definitions
 * and derived relations; records every step using the shared expression engine. */
(function (root) {
  'use strict';
  var SM = root.SM = root.SM || {};

  var VARS = {
    V:   { label: 'Total volume', kind: 'volume' },
    Vs:  { label: 'Volume of solids', kind: 'volume' },
    Vv:  { label: 'Volume of voids', kind: 'volume' },
    Vw:  { label: 'Volume of water', kind: 'volume' },
    Va:  { label: 'Volume of air', kind: 'volume' },
    W:   { label: 'Total weight', kind: 'force' },
    Ws:  { label: 'Weight of solids', kind: 'force' },
    Ww:  { label: 'Weight of water', kind: 'force' },
    w:   { label: 'Water (moisture) content', kind: 'ratio' },
    e:   { label: 'Void ratio', kind: 'none' },
    n:   { label: 'Porosity', kind: 'ratio' },
    S:   { label: 'Degree of saturation', kind: 'ratio' },
    Gs:  { label: 'Specific gravity of solids', kind: 'none' },
    g:   { label: 'Moist (bulk) unit weight', kind: 'unitWeight' },
    gd:  { label: 'Dry unit weight', kind: 'unitWeight' },
    gsat:{ label: 'Saturated unit weight', kind: 'unitWeight' },
    gsub:{ label: 'Submerged (effective) unit weight', kind: 'unitWeight' }
  };

  // Each relation: name + forms {target: expression}. gw is always known.
  var RELATIONS = [
    { id: 'Vsum',  name: 'Volumes add: V = Vs + Vv', forms: { V: 'Vs + Vv', Vs: 'V - Vv', Vv: 'V - Vs' } },
    { id: 'Vvsum', name: 'Voids hold water and air: Vv = Vw + Va', forms: { Vv: 'Vw + Va', Vw: 'Vv - Va', Va: 'Vv - Vw' } },
    { id: 'Wsum',  name: 'Weights add (air weight ≈ 0): W = Ws + Ww', forms: { W: 'Ws + Ww', Ws: 'W - Ww', Ww: 'W - Ws' } },
    { id: 'wdef',  name: 'Definition of water content', forms: { w: 'Ww / Ws', Ww: 'w * Ws', Ws: 'Ww / w' } },
    { id: 'edef',  name: 'Definition of void ratio', forms: { e: 'Vv / Vs', Vv: 'e * Vs', Vs: 'Vv / e' } },
    { id: 'ndef',  name: 'Definition of porosity', forms: { n: 'Vv / V', Vv: 'n * V', V: 'Vv / n' } },
    { id: 'Sdef',  name: 'Definition of degree of saturation', forms: { S: 'Vw / Vv', Vw: 'S * Vv', Vv: 'Vw / S' } },
    { id: 'Gsdef', name: 'Definition of specific gravity of solids', forms: { Ws: 'Gs * Vs * gw', Vs: 'Ws / (Gs * gw)', Gs: 'Ws / (Vs * gw)' } },
    { id: 'Wwdef', name: 'Weight of water = γw × volume of water', forms: { Ww: 'Vw * gw', Vw: 'Ww / gw' } },
    { id: 'gdef',  name: 'Definition of moist unit weight', forms: { g: 'W / V', W: 'g * V', V: 'W / g' } },
    { id: 'gddef', name: 'Definition of dry unit weight', forms: { gd: 'Ws / V', Ws: 'gd * V', V: 'Ws / gd' } },
    { id: 'ne',    name: 'Porosity–void ratio relation', forms: { n: 'e / (1 + e)', e: 'n / (1 - n)' } },
    { id: 'Se',    name: 'Se = wGs', forms: { S: 'w * Gs / e', e: 'w * Gs / S', w: 'S * e / Gs', Gs: 'S * e / w' } },
    { id: 'gdGe',  name: 'Dry unit weight from Gs and e', forms: { gd: 'Gs * gw / (1 + e)', e: 'Gs * gw / gd - 1', Gs: 'gd * (1 + e) / gw' } },
    { id: 'ggdw',  name: 'Moist and dry unit weight: γ = γd(1 + w)', forms: { g: 'gd * (1 + w)', gd: 'g / (1 + w)', w: 'g / gd - 1' } },
    { id: 'gsatd', name: 'Saturated unit weight from Gs and e', forms: { gsat: '(Gs + e) * gw / (1 + e)', e: '(Gs * gw - gsat) / (gsat - gw)', Gs: '(gsat * (1 + e) - e * gw) / gw' } },
    { id: 'gsubd', name: 'Submerged unit weight: γ′ = γsat − γw', forms: { gsub: 'gsat - gw', gsat: 'gsub + gw' } },
    { id: 'gGSe',  name: 'Moist unit weight from Gs, S and e', forms: { g: '(Gs + S * e) * gw / (1 + e)', e: '(Gs * gw - g) / (g - S * gw)', S: '(g * (1 + e) - Gs * gw) / (e * gw)', Gs: '(g * (1 + e) - S * e * gw) / gw' } },
    { id: 'gdwS',  name: 'Dry unit weight from w and S (eliminating Gs)', forms: { e: 'w * gd / (S * gw - w * gd)' } },
    { id: 'gwGsS', name: 'Moist unit weight from w, Gs and S (eliminating e)', forms: { Gs: 'g / ((1 + w) * gw - g * w / S)' } }
  ];

  var ORDER = ['V', 'Vs', 'Vv', 'Vw', 'Va', 'W', 'Ws', 'Ww', 'w', 'e', 'n', 'S', 'Gs', 'g', 'gd', 'gsat', 'gsub'];

  function finite(x) { return typeof x === 'number' && isFinite(x); }

  /** Domain validation of a single quantity.  Returns error string or null. */
  function domainError(name, x) {
    if (!finite(x)) return VARS[name].label + ' must be a number.';
    var k = VARS[name].kind;
    if (name === 'V' || name === 'Vs') { if (x <= 0) return VARS[name].label + ' must be greater than zero.'; return null; }
    if (name === 'Ws') { if (x <= 0) return 'Weight of solids must be greater than zero.'; return null; }
    if (name === 'W') { if (x <= 0) return 'Total weight must be greater than zero.'; return null; }
    if (k === 'volume' || k === 'force') { if (x < 0) return VARS[name].label + ' cannot be negative.'; return null; }
    if (name === 'S') { if (x < 0) return 'Degree of saturation cannot be negative.'; if (x > 1) return 'Degree of saturation cannot exceed 100 %.'; return null; }
    if (name === 'n') { if (x < 0) return 'Porosity cannot be negative.'; if (x >= 1) return 'Porosity must be less than 100 % (solids must occupy some volume).'; return null; }
    if (name === 'e' || name === 'w') { if (x < 0) return VARS[name].label + ' cannot be negative.'; return null; } // >1 allowed
    if (name === 'Gs') { if (x <= 1) return 'Gs must be greater than 1 for mineral solids (typical 2.6–2.9).'; return null; }
    if (k === 'unitWeight') { if (x <= 0) return VARS[name].label + ' must be positive.'; return null; }
    return null;
  }
  function domainWarning(name, x, gw) {
    if (name === 'Gs' && (x < 2.0 || x > 3.2)) return 'Gs = ' + SM.units.fmt(x) + ' is outside the usual 2.0–3.2 range for soils — check the value.';
    if (name === 'e' && x > 5) return 'A void ratio above 5 is unusual (very soft clay or peat) — check the input.';
    if (name === 'w' && x > 3) return 'Water content above 300 % occurs only in very soft organic soils/peat — check the input.';
    if ((name === 'g' || name === 'gd' || name === 'gsat') && gw && (x < 0.6 * gw || x > 2.6 * gw)) return VARS[name].label + ' looks unusual (typical soils are about ' + SM.units.fmt(1.3 * gw, 3) + '–' + SM.units.fmt(2.4 * gw, 3) + ').';
    return null;
  }

  /**
   * Solve the phase relationships.
   * @param {Object} known  {name: value}  (consistent units, ratios as decimals)
   * @param {number} gw     unit weight of water in the same unit set
   * @returns {{status:'ok'|'insufficient'|'invalid', values, steps, errors, warnings, unknown}}
   */
  function solve(known, gw) {
    var vals = {}, steps = [], errors = [], warnings = [], given = {};
    Object.keys(known).forEach(function (k) {
      if (known[k] === null || known[k] === undefined || known[k] === '') return;
      if (!(k in VARS)) return;
      var err = domainError(k, known[k]);
      if (err) errors.push(err);
      else { vals[k] = known[k]; given[k] = true; var wn = domainWarning(k, known[k], gw); if (wn) warnings.push(wn); }
    });
    if (errors.length) return { status: 'invalid', values: vals, steps: [], errors: errors, warnings: warnings, unknown: [] };
    if (!Object.keys(vals).length) return { status: 'insufficient', values: vals, steps: [], errors: [], warnings: [], unknown: ORDER.slice(), message: 'Enter at least the known quantities.' };

    var scope = function () { var s = { gw: gw }; for (var k in vals) s[k] = vals[k]; return s; };
    var progress = true, guard = 0;
    while (progress && guard++ < 60) {
      progress = false;
      for (var r = 0; r < RELATIONS.length; r++) {
        var rel = RELATIONS[r];
        var targets = Object.keys(rel.forms);
        for (var t = 0; t < targets.length; t++) {
          var tgt = targets[t];
          if (tgt in vals) continue;
          var src = rel.forms[tgt];
          var deps = SM.expr.varsOf(src).filter(function (d) { return d !== 'gw'; });
          if (!deps.every(function (d) { return d in vals; })) continue;
          var x;
          try { x = SM.expr.evaluate(src, scope()); } catch (err) { continue; }
          if (!finite(x)) continue;                       // e.g. division by zero (S = 0) — not determinable here
          if (Math.abs(x) < 1e-12) x = 0;
          // tolerate tiny negative round-off for volumes like Va
          if (x < 0 && x > -1e-9 * (Math.abs(vals.V || 1) + 1)) x = 0;
          var err2 = domainError(tgt, x);
          if (err2) {
            errors.push('The inputs are physically impossible: using “' + rel.name + '” gives ' + VARS[tgt].label.toLowerCase() + ' = ' + SM.units.fmt(x) + '. ' + err2);
            return { status: 'invalid', values: vals, steps: steps, errors: errors, warnings: warnings, unknown: [] };
          }
          vals[tgt] = x;
          var sub = {};
          deps.forEach(function (d) { sub[d] = '<span class="sv">' + SM.units.fmt(vals[d], 4) + '</span>'; });
          sub.gw = '<span class="sv">' + SM.units.fmt(gw, 4) + '</span>';
          steps.push({ target: tgt, relation: rel.id, relationName: rel.name, expr: src, deps: deps, value: x,
                       symbolic: SM.expr.eqHTML(tgt, src), substituted: SM.expr.eqHTML(tgt, src, sub) });
          progress = true;
        }
      }
    }

    // consistency check of every fully-known relation (catches over-specified, contradictory inputs)
    var sc = scope();
    RELATIONS.forEach(function (rel) {
      var tg = Object.keys(rel.forms)[0];
      var src = rel.forms[tg];
      var all = SM.expr.varsOf(src).concat([tg]).filter(function (d) { return d !== 'gw'; });
      if (!all.every(function (d) { return d in vals; })) return;
      var x; try { x = SM.expr.evaluate(src, sc); } catch (e) { return; }
      if (!finite(x)) return;
      var ref = Math.max(Math.abs(vals[tg]), Math.abs(x), 1e-12);
      var scale = (VARS[tg].kind === 'ratio' || VARS[tg].kind === 'none') ? Math.max(ref, 0.05) : ref;
      var rel_ = Math.abs(x - vals[tg]) / scale;
      if (rel_ > 0.01) errors.push('Contradictory inputs: “' + rel.name + '” requires ' + VARS[tg].label.toLowerCase() + ' = ' + SM.units.fmt(x) + ', but the other values give ' + SM.units.fmt(vals[tg]) + '. Remove or correct one of the entered values.');
      else if (rel_ > 0.002) warnings.push('Small inconsistency in “' + rel.name + '” (' + (rel_ * 100).toFixed(1) + ' %) — probably rounding in the given data.');
    });
    // physical consistency of the assembled state
    if ('Vw' in vals && 'Vv' in vals && vals.Vw > vals.Vv * (1 + 1e-6) + 1e-12) errors.push('Water volume exceeds void volume (degree of saturation above 100 %).');
    if ('Vs' in vals && 'V' in vals && vals.Vs > vals.V * (1 + 1e-6)) errors.push('Volume of solids exceeds total volume.');
    if ('Ws' in vals && 'W' in vals && vals.Ws > vals.W * (1 + 1e-6)) errors.push('Dry (solids) weight exceeds total weight — the sample cannot gain weight by drying.');
    if (errors.length) return { status: 'invalid', values: vals, steps: steps, errors: errors, warnings: warnings, unknown: [] };

    var unknown = ORDER.filter(function (k) { return !(k in vals); });
    var status = unknown.length ? 'insufficient' : 'ok';
    var message = '';
    if (status === 'insufficient') {
      var intensiveOnly = ['w', 'e', 'n', 'S', 'Gs', 'g', 'gd', 'gsat', 'gsub'].every(function (k) { return k in vals; });
      if (intensiveOnly) message = 'All ratios and unit weights are known, but the sample size is not. Volumes and weights need one extensive quantity (for example V, Vs or Ws). Many problems avoid this by assuming Vs = 1 or V = 1.';
      else message = 'Not enough independent information to find: ' + unknown.map(function (k) { return VARS[k].label.toLowerCase(); }).join(', ') + '. No values are assumed — add another known quantity.';
    }
    return { status: status, values: vals, given: given, steps: steps, errors: [], warnings: warnings, unknown: unknown, message: message };
  }

  /** Complete state from (Gs, e, S, Vs) — used by the exploration mode and generators. */
  function stateFrom(Gs, e, S, Vs, gw) {
    var Vv = e * Vs, V = Vs + Vv, Vw = S * Vv, Va = Vv - Vw, Ws = Gs * gw * Vs, Ww = Vw * gw, W = Ws + Ww;
    return { V: V, Vs: Vs, Vv: Vv, Vw: Vw, Va: Va, W: W, Ws: Ws, Ww: Ww, w: Ww / Ws, e: e, n: e / (1 + e), S: S, Gs: Gs,
             g: W / V, gd: Ws / V, gsat: (Gs + e) * gw / (1 + e), gsub: (Gs + e) * gw / (1 + e) - gw };
  }

  /* Relative density helpers */
  function Dr(emax, emin, e) { return (emax - e) / (emax - emin); }
  function eFromDr(emax, emin, D) { return emax - D * (emax - emin); }
  function DrFromGd(gdmin, gdmax, gd) { return ((gd - gdmin) / (gdmax - gdmin)) * (gdmax / gd); }

  SM.phase = { VARS: VARS, RELATIONS: RELATIONS, ORDER: ORDER, solve: solve, stateFrom: stateFrom,
               Dr: Dr, eFromDr: eFromDr, DrFromGd: DrFromGd, domainError: domainError };
})(typeof window !== 'undefined' ? window : globalThis);
