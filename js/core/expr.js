/* Tiny expression engine: one expression string drives evaluation, symbolic display,
 * and the substituted-values display, so equations, worked solutions and answer
 * checking can never disagree with each other. */
(function (root) {
  'use strict';
  var SM = root.SM = root.SM || {};

  /* ---------------- symbols ---------------- */
  var SYM = {
    g: 'γ', gd: 'γ<sub>d</sub>', gw: 'γ<sub>w</sub>', gsat: 'γ<sub>sat</sub>', gsub: 'γ′',
    gdmax: 'γ<sub>d(max)</sub>', gdmin: 'γ<sub>d(min)</sub>', gdfield: 'γ<sub>d(field)</sub>', gdlab: 'γ<sub>d(max-lab)</sub>',
    gd1: 'γ<sub>d1</sub>', gd2: 'γ<sub>d2</sub>',
    rho: 'ρ', rhod: 'ρ<sub>d</sub>', rhow: 'ρ<sub>w</sub>', rhos: 'ρ<sub>s</sub>',
    eta: 'η', etaT: 'η<sub>T</sub>', eta20: 'η<sub>20°C</sub>', etaRatio: 'η<sub>T</sub>/η<sub>20°C</sub>',
    emax: 'e<sub>max</sub>', emin: 'e<sub>min</sub>', Dr: 'D<sub>r</sub>', Rc: 'R', Gs: 'G<sub>s</sub>',
    Dh: 'Δh', DH: 'ΔH', DV: 'ΔV', DW: 'ΔW', dMw: 'ΔM<sub>w</sub>', dVw: 'ΔV<sub>w</sub>', dWw: 'ΔW<sub>w</sub>',
    kHeq: 'k<sub>H(eq)</sub>', kVeq: 'k<sub>V(eq)</sub>', k20: 'k<sub>20</sub>', kT: 'k<sub>T</sub>',
    Kp: 'K̄', Kbar: 'K̄', vs: 'v<sub>s</sub>', pi: 'π', Mw: 'M<sub>w</sub>', Ms: 'M<sub>s</sub>', M: 'M',
    M1: 'M<sub>1</sub>', M2: 'M<sub>2</sub>', M3: 'M<sub>3</sub>', Mwet: 'M<sub>wet</sub>', Mdry: 'M<sub>dry</sub>',
    uA: 'u<sub>A</sub>', uB: 'u<sub>B</sub>', zA: 'Z<sub>A</sub>', zB: 'Z<sub>B</sub>', hA: 'h<sub>A</sub>', hB: 'h<sub>B</sub>',
    hpA: 'h<sub>p,A</sub>', hpB: 'h<sub>p,B</sub>', Vt: 'V', Qv: 'Q', Re: 'Re', C: 'C', Ck: 'C<sub>k</sub>',
    Pa: 'P<sub>a</sub>', Pw: 'P<sub>w</sub>', Rmm: 'R', Cu: 'C<sub>u</sub>', D50: 'D<sub>50</sub>', D10: 'D<sub>10</sub>',
    dia: 'D', diaS: 'd', grav: 'g', alpha: 'α', deg: '(π/180)', Dh1: 'Δh<sub>1</sub>', Dh2: 'Δh<sub>2</sub>', k085: 'k<sub>0.85</sub>',
    kreq: 'k<sub>req</sub>', tday: 't', Lm: 'L', Ht: 'H', ratio: 'ratio', gwN: 'γ<sub>w</sub>', km: 'k', Kcm: 'K̄', nexp: 'n',
    wsat: 'w<sub>sat</sub>', gdT: 'γ<sub>d,req</sub>', eB: 'e<sub>B</sub>', wB: 'w<sub>B</sub>', VB: 'V<sub>borrow</sub>', Aw: 'A', d: 'd',
    D1: 'D<sub>r1</sub>', D2: 'D<sub>r2</sub>', S1: 'S<sub>1</sub>', S2: 'S<sub>2</sub>', n2: 'n<sub>2</sub>', e2: 'e<sub>2</sub>', x: 'x',
    Vs: 'V<sub>s</sub>', Vv: 'V<sub>v</sub>', Vw: 'V<sub>w</sub>', Va: 'V<sub>a</sub>', Ws: 'W<sub>s</sub>', Ww: 'W<sub>w</sub>', Wa: 'W<sub>a</sub>',
    Md: 'M<sub>d</sub>', Ma: 'M<sub>a</sub>', gs: 'γ<sub>s</sub>', rhosat: 'ρ<sub>sat</sub>', kH: 'k<sub>H</sub>', kV: 'k<sub>V</sub>',
    hp: 'h<sub>p</sub>', hL: 'h<sub>L</sub>', Av: 'A<sub>v</sub>', Re: 'Re', hpw: 'u/γ<sub>w</sub>', Dhi: 'Δh<sub>i</sub>',
    Vborrow: 'V<sub>borrow</sub>', Vfill: 'V<sub>fill</sub>', Mmoist: 'M<sub>moist</sub>', Wd: 'W<sub>d</sub>', thalf: 't<sub>½</sub>', LA: 'L<sub>A</sub>', LB: 'L<sub>B</sub>', LC: 'L<sub>C</sub>', kA: 'k<sub>A</sub>', kB: 'k<sub>B</sub>', kC: 'k<sub>C</sub>',
    Lmm: 'L', hmm: 'h', tmin: 't', Tr: 'T', kday: 'k<sub>day</sub>', hw: 'h<sub>w</sub>', Rec: 'Re<sub>conduit</sub>', Res: 'Re<sub>sand</sub>', vsand: 'v<sub>sand</sub>', Dc: 'D', D10m: 'D<sub>10</sub>', Apond: 'A', Qday: 'Q', gdT99: 'γ<sub>d(max)</sub>', vc: 'v<sub>c</sub>', kmin: 'k<sub>min</sub>', ssol: 's', kmm: 'k', h1mm: 'h<sub>1</sub>', qh: 'q'
  };
  function defineSymbol(name, html) { SYM[name] = html; }
  function symHTML(name) {
    if (SYM[name]) return '<var>' + SYM[name] + '</var>';
    var m = name.match(/^([A-Za-z])([A-Za-z0-9]+)$/);
    if (m) return '<var>' + m[1] + '<sub>' + m[2] + '</sub></var>';
    return '<var>' + name + '</var>';
  }
  function symText(name) { return symHTML(name).replace(/<[^>]+>/g, ''); }

  /* ---------------- parser ---------------- */
  function tokenize(s) {
    var toks = [], i = 0, m;
    while (i < s.length) {
      var c = s[i];
      if (/\s/.test(c)) { i++; continue; }
      if ((m = /^(\d+\.?\d*|\.\d+)(e[-+]?\d+)?/i.exec(s.slice(i)))) { toks.push({ t: 'num', v: m[0] }); i += m[0].length; continue; }
      if ((m = /^[A-Za-z_][A-Za-z0-9_]*/.exec(s.slice(i)))) { toks.push({ t: 'id', v: m[0] }); i += m[0].length; continue; }
      if ('+-*/^(),'.indexOf(c) >= 0) { toks.push({ t: 'op', v: c }); i++; continue; }
      throw new Error('Bad character "' + c + '" in expression ' + s);
    }
    return toks;
  }
  var cache = {};
  function parse(src) {
    if (cache[src]) return cache[src];
    var toks = tokenize(src), p = 0;
    function peek() { return toks[p]; }
    function eat(v) { var t = toks[p]; if (!t || (v && t.v !== v)) throw new Error('Parse error in "' + src + '" near token ' + p); p++; return t; }
    function expr() {
      var a = term();
      while (peek() && (peek().v === '+' || peek().v === '-')) { var op = eat().v; a = { t: 'bin', op: op, a: a, b: term() }; }
      return a;
    }
    function term() {
      var a = unary();
      while (peek() && (peek().v === '*' || peek().v === '/')) { var op = eat().v; a = { t: 'bin', op: op, a: a, b: unary() }; }
      return a;
    }
    function unary() {
      if (peek() && peek().v === '-') { eat(); return { t: 'neg', a: unary() }; }
      return power();
    }
    function power() {
      var b = primary();
      if (peek() && peek().v === '^') { eat(); return { t: 'bin', op: '^', a: b, b: unary() }; }
      return b;
    }
    function primary() {
      var t = peek();
      if (!t) throw new Error('Unexpected end of "' + src + '"');
      if (t.t === 'num') { eat(); return { t: 'num', v: parseFloat(t.v), raw: t.v }; }
      if (t.t === 'id') {
        eat();
        if (peek() && peek().v === '(') {
          eat('('); var args = [expr()];
          while (peek() && peek().v === ',') { eat(','); args.push(expr()); }
          eat(')');
          return { t: 'call', f: t.v, args: args };
        }
        return { t: 'var', n: t.v };
      }
      if (t.v === '(') { eat('('); var e = expr(); eat(')'); return { t: 'paren', a: e }; }
      throw new Error('Unexpected token ' + t.v + ' in ' + src);
    }
    var ast = expr();
    if (p !== toks.length) throw new Error('Trailing tokens in ' + src);
    cache[src] = ast;
    return ast;
  }

  var FUN = {
    ln: Math.log, log10: Math.log10, sqrt: Math.sqrt, exp: Math.exp, abs: Math.abs,
    min: Math.min, max: Math.max, cos: Math.cos, sin: Math.sin, tan: Math.tan
  };
  function evalAst(n, v) {
    switch (n.t) {
      case 'num': return n.v;
      case 'paren': return evalAst(n.a, v);
      case 'neg': return -evalAst(n.a, v);
      case 'var':
        if (n.n === 'pi') return Math.PI;
        if (!(n.n in v) || v[n.n] === null || v[n.n] === undefined) throw new Error('Missing value for ' + n.n);
        return v[n.n];
      case 'call': return FUN[n.f].apply(null, n.args.map(function (a) { return evalAst(a, v); }));
      case 'bin':
        var a = evalAst(n.a, v), b = evalAst(n.b, v);
        if (n.op === '+') return a + b;
        if (n.op === '-') return a - b;
        if (n.op === '*') return a * b;
        if (n.op === '/') return a / b;
        if (n.op === '^') return Math.pow(a, b);
    }
    throw new Error('bad node');
  }
  function evaluate(src, vals) { return evalAst(parse(src), vals); }

  function varsOf(src) {
    var out = [];
    (function walk(n) {
      if (n.t === 'var' && n.n !== 'pi') { if (out.indexOf(n.n) < 0) out.push(n.n); }
      if (n.a) walk(n.a); if (n.b) walk(n.b); if (n.args) n.args.forEach(walk);
    })(parse(src));
    return out;
  }

  /* ---------------- rendering ---------------- */
  // opts.values: {name: string}  -> substitute (already formatted HTML strings)
  function render(n, opts, ctxParent) {
    opts = opts || {};
    switch (n.t) {
      case 'num': return '<span class="n">' + SM.units.fmt(n.v, 6) + '</span>';
      case 'paren':
        // parentheses are kept only where precedence requires them; fractions group visually
        if (ctxParent === 'frac' || ctxParent === 'call' || ctxParent === 'top') return render(n.a, opts, ctxParent);
        return '(' + render(n.a, opts, 'paren') + ')';
      case 'neg': return '−' + wrap(n.a, opts, 'neg');
      case 'var':
        if (opts.values && n.n in opts.values) return opts.values[n.n];
        return symHTML(n.n);
      case 'call':
        var inner = n.args.map(function (a) { return render(a, opts, 'call'); }).join(', ');
        return '<span class="fx">' + callHTML(n, inner) + '</span>';
      case 'bin':
        if (n.op === '/') return '<span class="frac"><span class="fn">' + render(n.a, opts, 'frac') + '</span><span class="fd">' + render(n.b, opts, 'frac') + '</span></span>';
        if (n.op === '^') return '<span class="fx">' + wrap(n.a, opts, 'pow') + '<sup>' + render(n.b, opts, 'frac') + '</sup></span>';
        // an angle in degrees: alpha * deg evaluates in radians but is written α (and 8° when substituted)
        if (n.op === '*' && strip(n.b).t === 'var' && strip(n.b).n === 'deg') return opts.values ? '<span class="fx">' + render(n.a, opts, ctxParent) + '°</span>' : render(n.a, opts, ctxParent);
        if (n.op === '*') return wrap(n.a, opts, '*') + ' · ' + wrap(n.b, opts, '*');
        var right = (n.op === '-' && (strip(n.b).t === 'bin') && (strip(n.b).op === '+' || strip(n.b).op === '-')) ? '(' + render(n.b, opts, 'top') + ')' : render(n.b, opts, n.op);
        return render(n.a, opts, n.op) + ' ' + (n.op === '-' ? '−' : '+') + ' ' + right;
    }
    return '?';
  }
  function callHTML(n, inner) {
    if (n.f === 'sqrt') return '√<span class="ov">(' + inner + ')</span>';
    if (n.f === 'log10') return 'log<sub>10</sub>(' + inner + ')';
    if (n.f === 'exp') return 'exp(' + inner + ')';
    if ((n.f === 'cos' || n.f === 'sin' || n.f === 'tan') && n.args.length === 1 && isAngle(n.args[0])) return n.f + ' ' + inner;
    return n.f + '(' + inner + ')';
  }
  function strip(n) { while (n.t === 'paren') n = n.a; return n; }
  // an angle written in degrees, e.g. alpha * deg (deg = π/180 converts for evaluation only)
  function isAngle(n) { n = strip(n); return n.t === 'var' || (n.t === 'bin' && n.op === '*' && strip(n.b).t === 'var' && strip(n.b).n === 'deg' && strip(n.a).t === 'var'); }
  function wrap(n, opts, ctx) {
    var s = strip(n);
    var needs = s.t === 'bin' && (s.op === '+' || s.op === '-') ;
    if (ctx === 'pow' && (s.t === 'bin' || s.t === 'neg')) needs = true;
    if (ctx === 'neg' && s.t === 'bin' && s.op !== '/' && s.op !== '^') needs = true;
    var r = render(s, opts, ctx);
    return needs ? '(' + r + ')' : r;
  }
  function toHTML(src, values) { return render(parse(src), { values: values }, 'top'); }

  /** Full equation HTML: lhs = rhs */
  function eqHTML(lhs, src, values) {
    return '<span class="eq">' + symHTML(lhs) + ' = ' + toHTML(src, values) + '</span>';
  }

  SM.expr = {
    parse: parse, evaluate: evaluate, varsOf: varsOf, toHTML: toHTML, eqHTML: eqHTML,
    symHTML: symHTML, symText: symText, defineSymbol: defineSymbol, SYM: SYM
  };
})(typeof window !== 'undefined' ? window : globalThis);
