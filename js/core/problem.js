/* Problem builder, seeded random numbers, and answer checking with specific feedback.
 * A template's generate() returns a spec; build() evaluates every part with the shared
 * expression engine so the worked solution, hints, Socratic questions and the answer
 * checker all use identical values. */
(function (root) {
  'use strict';
  var SM = root.SM = root.SM || {};
  var U = SM.units, X = SM.expr;

  /* ---------------- seeded RNG ---------------- */
  function rng(seed) {
    var s = (seed >>> 0) || 1;
    function next() { s += 0x6D2B79F5; var t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }
    return {
      next: next,
      int: function (a, b) { return a + Math.floor(next() * (b - a + 1)); },
      range: function (a, b, dp) { var x = a + next() * (b - a); return dp === undefined ? x : U.roundTo(x, dp); },
      sig: function (a, b, n) { return U.roundSig(a + next() * (b - a), n || 3); },
      pick: function (arr) { return arr[Math.floor(next() * arr.length)]; },
      shuffle: function (arr) { var a = arr.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(next() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
    };
  }
  function newSeed() { return Math.floor(Math.random() * 2147483646) + 1; }

  /* ---------------- quantity display ---------------- */
  function dimFor(unit, dimHint) {
    if (dimHint) return dimHint;
    if (unit === '%' || unit === 'decimal') return 'ratio';
    var d = U.dimOf(unit);
    return d || 'none';
  }
  // stored value -> display string.  Ratio quantities are stored as decimals.
  function showVal(v, unit, sig, fixed) {
    if (unit === '%') return (fixed ? U.fmtFixedSig(v * 100, sig || 3) : U.fmt(v * 100, sig || 4)) + ' %';
    if (!unit || unit === 'decimal') return fixed ? U.fmtFixedSig(v, sig || 3) : U.fmt(v, sig || 4);
    return (fixed ? U.fmtFixedSig(v, sig || 3) : U.fmt(v, sig || 4)) + ' ' + unit;
  }
  function subVal(v, unit, sig) { // value as substituted into an equation (ratios as decimals)
    var s = U.fmt(v, sig || 4);
    if (!unit || unit === '%' || unit === 'decimal') return '<span class="sv">' + (v < 0 ? '(' + s + ')' : s) + '</span>';
    return '<span class="sv">(' + s + ' ' + unit + ')</span>';
  }

  /* ---------------- builder ---------------- */
  function build(tpl, seed, sys) {
    sys = sys || 'SI';
    var r = rng(seed);
    var spec = tpl.generate(r, sys, SM.units.SYSTEMS[sys]);
    var scope = {}, units = {}, labels = {}, isGiven = {};
    (spec.constants || []).concat(spec.given || []).forEach(function (g) { scope[g.sym] = g.value; units[g.sym] = g.unit || ''; labels[g.sym] = g.label; isGiven[g.sym] = true; });
    var parts = (spec.parts || []).map(function (p, idx) {
      var deps = X.varsOf(p.expr);
      deps.forEach(function (d) { if (!(d in scope)) throw new Error(tpl.id + ': part ' + p.sym + ' needs ' + d); });
      var value = X.evaluate(p.expr, scope);
      if (!isFinite(value)) throw new Error(tpl.id + ': non-finite answer for ' + p.sym);
      var sub = {}; deps.forEach(function (d) { sub[d] = subVal(scope[d], units[d], isGiven[d] ? 6 : 4); });
      var mistakes = (p.mistakes || []).map(function (m) {
        var mv = m.value !== undefined ? m.value : X.evaluate(m.expr, scope);
        return { value: mv, msg: SM.mt.html(m.msg), tag: m.tag || 'concept' };
      }).filter(function (m) { return isFinite(m.value) && Math.abs(m.value - value) > 0.03 * Math.abs(value); });
      var part = {
        index: idx, sym: p.sym, label: SM.mt.html(p.label), labelText: SM.mt.plain(p.label), expr: p.expr, unit: p.unit || '', dim: dimFor(p.unit, p.dim),
        value: value, tol: p.tol || 0.015, why: SM.mt.html(p.why || ''), hint: SM.mt.html(p.hint || ''), deps: deps, tag: p.tag || tpl.topic,
        symbolic: X.eqHTML(p.sym, p.expr), substituted: X.eqHTML(p.sym, p.expr, sub),
        result: X.symHTML(p.sym) + ' = ' + showVal(value, p.unit, p.sig || 4),
        mistakes: mistakes, alts: p.alts || null, note: p.note || '', sig: p.sig || 4, check: p.check || ''
      };
      part.depText = deps.filter(function (d) { return d !== 'gw' || true; }).map(function (d) {
        return X.symHTML(d) + ' = ' + showVal(scope[d], units[d], isGiven[d] ? 6 : 4);
      });
      part.options = equationOptions(part, r);
      scope[p.sym] = value; units[p.sym] = p.unit || ''; labels[p.sym] = p.label;
      return part;
    });
    return {
      id: tpl.id + ':' + seed + ':' + sys, templateId: tpl.id, seed: seed, sys: sys, chapter: tpl.chapter, topic: tpl.topic,
      florida: !!tpl.florida, title: tpl.title, method: SM.mt.html(tpl.method || ''), difficulty: tpl.difficulty || 1,
      text: SM.mt.html(spec.text), given: (spec.given || []).filter(function (g) { return !g.hidden; }).map(function (g) {
        return { sym: g.sym, label: SM.mt.html(g.label), value: g.value, unit: g.unit || '', html: X.symHTML(g.sym) + ' = ' + showVal(g.value, g.unit, g.sig || 3, g.sig !== undefined) };
      }),
      constants: (spec.constants || []).filter(function (c) { return !c.hidden; }).map(function (c) { return { html: X.symHTML(c.sym) + ' = ' + showVal(c.value, c.unit, 4) + (c.label ? ' (' + SM.mt.html(c.label) + ')' : '') }; }),
      find: spec.find || parts.map(function (p) { return p.label + ' (' + X.symText(p.sym) + ')'; }),
      sketch: spec.sketch || null, assumptions: (spec.assumptions || []).map(SM.mt.html), choose: SM.mt.html(spec.choose || ''),
      parts: parts, check: (spec.check || []).map(SM.mt.html), interpret: SM.mt.html(spec.interpret || ''), scope: scope, units: units
    };
  }

  /* Equation options for Socratic mode / equation selection: correct form + mutated wrong forms. */
  function mutations(src) {
    var out = [];
    var ast = X.parse(src);
    function strip(n) { while (n.t === 'paren') n = n.a; return n; }
    var top = strip(ast);
    if (top.t === 'bin' && top.op === '/') out.push('(' + srcOf(top.b) + ') / (' + srcOf(top.a) + ')');
    if (top.t === 'bin' && top.op === '/') out.push('(' + srcOf(top.a) + ') * (' + srcOf(top.b) + ')');
    if (src.indexOf(' + ') >= 0) out.push(src.replace(' + ', ' - '));
    if (src.indexOf(' - ') >= 0) out.push(src.replace(' - ', ' + '));
    if (src.indexOf('log10') >= 0) out.push(src.replace('log10', 'ln'));
    if (src.indexOf('2.303') >= 0) out.push(src.replace('2.303 * ', ''));
    if (top.t === 'bin' && top.op === '*') out.push('(' + srcOf(top.a) + ') / (' + srcOf(top.b) + ')');
    if (top.t === 'bin' && top.op === '*') out.push('(' + srcOf(top.b) + ') / (' + srcOf(top.a) + ')');
    out.push('1 / (' + src + ')');
    return out;
  }
  function srcOf(n) {
    switch (n.t) {
      case 'num': return n.raw; case 'var': return n.n; case 'paren': return '(' + srcOf(n.a) + ')';
      case 'neg': return '-(' + srcOf(n.a) + ')';
      case 'call': return n.f + '(' + n.args.map(srcOf).join(', ') + ')';
      case 'bin': return '(' + srcOf(n.a) + ') ' + n.op + ' (' + srcOf(n.b) + ')';
    }
  }
  function equationOptions(part, r) {
    var opts = [{ expr: part.expr, html: X.eqHTML(part.sym, part.expr), correct: true }];
    var cands = (part.alts || []).concat(mutations(part.expr));
    var seen = {}; seen[part.expr] = 1;
    cands.forEach(function (c) {
      if (opts.length >= 4 || seen[c]) return; seen[c] = 1;
      try { X.parse(c); } catch (e) { return; }
      opts.push({ expr: c, html: X.eqHTML(part.sym, c), correct: false });
    });
    return r.shuffle(opts);
  }

  /* ---------------- answer checking ---------------- */
  var near = function (a, b, tol) { return Math.abs(a - b) <= tol * Math.max(Math.abs(b), 1e-300); };

  function unitSlipName(k) {
    var m = { 2: 'cm ↔ m, or a percent written as a decimal', 3: 'g ↔ kg, N ↔ kN, L ↔ m³, or mm ↔ m', 4: 'cm² ↔ m²', 6: 'cm³ ↔ m³ or mm² ↔ m²', 1: 'a misplaced decimal point', 5: 'a unit prefix', 9: 'mm³ ↔ m³' };
    return m[Math.abs(k)] || 'a unit prefix';
  }

  /**
   * Check a student's answer for one part.
   * @returns {status:'correct'|'close'|'incorrect'|'invalid', credit, msg, tag}
   */
  function check(part, input, unit, sys) {
    var res = checkRaw(part, input, unit, sys);
    res.msg = SM.mt.html(res.msg);
    return res;
  }
  function checkRaw(part, input, unit, sys) {
    var x = U.parseNumber(input);
    if (input === undefined || String(input).trim() === '') return { status: 'invalid', credit: 0, msg: 'Enter a number first.' };
    if (isNaN(x)) return { status: 'invalid', credit: 0, msg: 'I could not read “' + String(input).replace(/[&<>$]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '$': '&#36;' }[c]; }) + '” as a number. Examples that work: 0.65, 18.5, 3.2e-4, 3.2×10^-4.' };
    var target = part.value;
    var u = unit === undefined ? part.unit : unit;
    var val;
    try { val = convertToPart(x, u, part); } catch (e) { return { status: 'invalid', credit: 0, msg: 'That unit does not match the quantity (expected ' + (part.unit || 'a dimensionless number') + ').' }; }
    var tol = part.tol;
    if (near(val, target, tol)) {
      var msg = 'Correct: ' + part.result + '.';
      if (u !== part.unit && part.dim !== 'ratio') msg += ' (Your units, ' + (u || 'none') + ', are equivalent.)';
      return { status: 'correct', credit: 1, msg: msg };
    }
    // template-specific mistakes
    for (var i = 0; i < part.mistakes.length; i++) {
      if (near(val, part.mistakes[i].value, Math.max(tol, 0.01))) return { status: 'incorrect', credit: 0, msg: part.mistakes[i].msg, tag: part.mistakes[i].tag };
    }
    // percent handling
    if (part.dim === 'ratio') {
      if (u === '%' && near(x, target, tol)) return { status: 'incorrect', credit: 0.5, tag: 'percent', msg: 'Percent/decimal mix-up: you typed ' + x + ' with “%” selected, which means ' + U.fmt(x / 100) + ' as a decimal. Either type ' + U.fmt(target * 100) + ' with “%”, or switch the unit to “decimal”.' };
      if (u === 'decimal' && near(x, target * 100, tol)) return { status: 'incorrect', credit: 0.5, tag: 'percent', msg: 'Percent/decimal mix-up: ' + x + ' looks like a percentage, but the unit box says “decimal”. Select “%” or enter ' + U.fmt(target) + '.' };
    }
    var ratio = val / target;
    if (target !== 0 && isFinite(ratio)) {
      if (near(ratio, -1, 0.02)) return { status: 'incorrect', credit: 0.25, tag: 'sign', msg: 'The magnitude is right but the sign is wrong. Check which point has the higher total head $h$ (flow goes from higher to lower total head) or the order of subtraction.' };
      if (near(ratio, 2.303, 0.02) || near(ratio, 1 / 2.303, 0.02)) return { status: 'incorrect', credit: 0.25, tag: 'log', msg: 'Your answer is off by a factor of 2.303: natural and base-10 logarithms were mixed. Use $ln(h1 / h2)$ without the 2.303, OR $2.303 log10(h1 / h2)$, since $ln x = 2.303 log10 x$.' };
      var gfac = sys === 'US' ? 32.174 : 9.81;
      if (near(ratio, gfac, 0.02) || near(ratio, 1 / gfac, 0.02) || near(ratio, 9.81, 0.02) || near(ratio, 1 / 9.81, 0.02)) return { status: 'incorrect', credit: 0.25, tag: 'mass-weight', msg: 'Off by a factor of $grav$ (9.81 m/s²): mass and weight (or density and unit weight) were mixed. Weight $W = M grav$; unit weight $g = rho grav$. For example, 1 Mg/m³ × 9.81 m/s² = 9.81 kN/m³.' };
      var lg = Math.log10(Math.abs(ratio)), k = Math.round(lg);
      if (k !== 0 && Math.abs(lg - k) < 0.01) return { status: 'incorrect', credit: 0.25, tag: 'units', msg: 'Your answer is off by exactly a factor of $10^{' + k + '}$: a unit-conversion slip (' + unitSlipName(k) + '). Re-check the units of every value you substituted; they must be consistent (e.g. all cm and s for $k$ in cm/s).' };
      if (near(ratio, 4, 0.02) || near(ratio, 0.25, 0.02)) return { status: 'incorrect', credit: 0.25, tag: 'area', msg: 'Off by a factor of 4: check the area. $A = pi D^2 / 4$ uses the diameter $D$; $pi r^2$ uses the radius $r$. Putting $D$ into $pi r^2$ gives 4 times the area.' };
      if (near(ratio, 2, 0.02) || near(ratio, 0.5, 0.02)) return { status: 'incorrect', credit: 0.25, tag: 'factor2', msg: 'Off by a factor of 2. Check whether you used a diameter where a radius was needed (or vice versa), or used only part of a head difference/thickness.' };
    }
    if (near(val, target, 0.05)) return { status: 'close', credit: 0.5, tag: 'rounding', msg: 'Close (within 5 %) but outside the rounding tolerance. Keep at least 3–4 significant figures in intermediate results and don’t round γw or Gs early.' };
    var dir = val > target ? 'too large' : 'too small';
    return { status: 'incorrect', credit: 0, tag: part.tag, msg: 'Not correct — your value is ' + dir + '. Check this step: ' + (part.why ? part.why + ' ' : '') + 'Use “How do I start?” for the relationship, then compare your substitution term by term.' };
  }
  function convertToPart(x, u, part) {
    if (part.dim === 'ratio') return x * U.factor(u || 'decimal', 'ratio');
    if (part.dim === 'none' || !part.unit) return x;
    return U.convert(x, u, part.unit, part.dim);
  }

  /** Hints for "How do I start?" — returns the hint for level (0-based) of a given part. */
  function hints(problem, partIdx) {
    var p = problem.parts[partIdx];
    var list = [];
    if (partIdx === 0) list.push('<b>Given/Find.</b> Write down every given value with its unit. You are finding <b>' + p.label + '</b> (' + X.symHTML(p.sym) + '). ' + (problem.sketch ? 'Mark the knowns on the diagram first.' : ''));
    else list.push('<b>Next target:</b> ' + p.label + ' (' + X.symHTML(p.sym) + '). You can now use your earlier results.');
    list.push('<b>Which relationship?</b> ' + (p.hint || p.why || ('Find an equation that links ' + X.symHTML(p.sym) + ' to quantities you know.')));
    list.push('<b>Rearranged equation:</b> ' + p.symbolic + '<br><span class="muted">Values available: ' + p.depText.join(', ') + '</span>');
    list.push('<b>Substitute:</b> ' + p.substituted);
    return list;
  }

  SM.problem = { rng: rng, newSeed: newSeed, build: build, check: check, hints: hints, showVal: showVal, subVal: subVal, convertToPart: convertToPart };
  SM.templates = SM.templates || [];
  SM.registerTemplates = function (arr) { arr.forEach(function (t) { SM.templates.push(t); }); };
  SM.templateById = function (id) { for (var i = 0; i < SM.templates.length; i++) if (SM.templates[i].id === id) return SM.templates[i]; return null; };
})(typeof window !== 'undefined' ? window : globalThis);
