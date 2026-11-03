/* Inline math markup for prose.  Any text may contain $...$ segments, e.g.
 *   "Void ratio uses the solids: $e = Vv / Vs$, and $n = e / (1 + e)$."
 * Inside $...$:
 *   identifiers use the shared symbol table (Vs → Vₛ, gd → γ_d, gw → γ_w, emax → e_max,
 *   kHeq → k_H(eq), h1 → h₁, D10 → D₁₀ ...); single letters are italic variables;
 *   a space between operands means juxtaposition (k i A → kiA); * → ·; - → −;
 *   ^x or ^{...} or ^(...) → superscript; _x or _{...} → subscript;
 *   <= >= ~ != -> → ≤ ≥ ≈ ≠ →; Sum → Σ; pi → π; log10 → log₁₀; sqrt → √.
 * The same markup renders to HTML (pages) and to SVG tspans (diagram labels), so text,
 * equations and diagrams share one notation.  Unknown multi-letter identifiers are
 * recorded so the test suite can flag authoring slips. */
(function (root) {
  'use strict';
  var SM = root.SM = root.SM || {};

  var FUNCS = { ln: 'ln', log: 'log', exp: 'exp', sin: 'sin', cos: 'cos', tan: 'tan', max: 'max', min: 'min' };
  var OPS2 = { '<=': '≤', '>=': '≥', '!=': '≠', '->': '→', '=>': '⇒' };
  var SPACED = { '=': 1, '+': 1, '−': 1, '≤': 1, '≥': 1, '≈': 1, '≠': 1, '<': 1, '>': 1, '→': 1, '⇒': 1, '±': 1, '×': 1 };
  var unknown = {};

  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

  /* segment = {t: text, it: italic?, pos: 0 | -1 (sub) | 1 (sup)} */
  function symSegments(name, pos) {
    var SYM = SM.expr.SYM;
    var html = SYM[name];
    if (html === undefined) {
      var m = name.match(/^([A-Za-z])(\d+)$/);
      if (m) return [{ t: m[1], it: true, pos: pos }, { t: m[2], it: false, pos: pos - 1 }];
      m = name.match(/^k([HV])(\d+)$/);
      if (m) return [{ t: 'k', it: true, pos: pos }, { t: m[1] + m[2], it: false, pos: pos - 1 }];
      if (name.length === 1) return [{ t: name, it: /[A-Za-zα-ωΑ-Ω]/.test(name) && !/[ΣΔΠ]/.test(name), pos: pos }];
      unknown[name] = (unknown[name] || 0) + 1;
      return [{ t: name, it: false, pos: pos }];
    }
    // parse SYM html: main text with optional <sub>…</sub> parts
    var out = [], re = /<sub>(.*?)<\/sub>|([^<]+)/g, mm;
    while ((mm = re.exec(html))) {
      if (mm[1] !== undefined) out.push({ t: mm[1].replace(/<[^>]+>/g, ''), it: false, pos: pos - 1 });
      else out.push({ t: mm[2], it: /^[A-Za-zα-ωΑ-Ω]/.test(mm[2]) && !/^[ΔΣ(]/.test(mm[2]) && name !== 'Re' && name !== 'ratio' && name !== 'deg', pos: pos });
    }
    // Δ prefixed symbols: Δ upright, rest italic
    if (out.length && /^Δ./.test(out[0].t)) { var r = out.shift(); out.unshift({ t: r.t.slice(1), it: true, pos: pos }); out.unshift({ t: 'Δ', it: false, pos: pos }); }
    return out;
  }

  function tokenize(src) {
    var toks = [], i = 0, m;
    while (i < src.length) {
      var c = src[i], rest = src.slice(i);
      if (/\s/.test(c)) { toks.push({ k: 'sp' }); while (i < src.length && /\s/.test(src[i])) i++; continue; }
      if ((m = /^\d+(\.\d+)?/.exec(rest))) { toks.push({ k: 'num', v: m[0] }); i += m[0].length; continue; }
      if ((m = /^[A-Za-z][A-Za-z0-9]*/.exec(rest))) { toks.push({ k: 'id', v: m[0] }); i += m[0].length; continue; }
      if (/[α-ωΑ-Ω]/.test(c)) { toks.push({ k: 'id', v: c }); i++; continue; }
      if (OPS2[rest.slice(0, 2)]) { toks.push({ k: 'op', v: OPS2[rest.slice(0, 2)] }); i += 2; continue; }
      if (c === '{' || c === '}') { toks.push({ k: c }); i++; continue; }
      if (c === '_' || c === '^') { toks.push({ k: c }); i++; continue; }
      var map = { '*': '·', '-': '−', '~': '≈' };
      toks.push({ k: 'op', v: map[c] || c }); i++;
    }
    return toks;
  }

  // parse tokens into segments
  function segs(toks, pos, ctx) {
    var out = [], i = 0, prevOperand = false;
    function pushSp() { out.push({ t: ' ', it: false, pos: pos }); }
    function group(start, p) { // returns [segments, nextIndex] for the item after _ or ^
      var t = toks[start];
      if (!t) return [[], start];
      if (t.k === '{' || (t.k === 'op' && t.v === '(')) {
        var close = t.k === '{' ? '}' : ')', depth = 0, j = start;
        for (; j < toks.length; j++) {
          var tk = toks[j];
          if ((tk.k === '{' && close === '}') || (tk.k === 'op' && tk.v === '(' && close === ')')) depth++;
          if ((tk.k === '}' && close === '}') || (tk.k === 'op' && tk.v === ')' && close === ')')) { depth--; if (depth === 0) break; }
        }
        return [segs(toks.slice(start + 1, j), p, 'group'), j + 1];
      }
      if (t.k === 'op' && t.v === '−') { var g2 = group(start + 1, p); return [[{ t: '−', it: false, pos: p }].concat(g2[0]), g2[1]]; }
      return [segs([t], p, 'group'), start + 1];
    }
    while (i < toks.length) {
      var t = toks[i];
      if (t.k === 'sp') { i++; continue; }
      if (t.k === '_' || t.k === '^') {
        var g = group(i + 1, t.k === '_' ? pos - 1 : pos + 1);
        g[0].forEach(function (s) { if (t.k === '_' && s.it && /^[A-Za-z]+$/.test(s.t) && s.t.length > 1) s.it = false; out.push(s); });
        i = g[1]; prevOperand = true; continue;
      }
      if (t.k === '{' || t.k === '}') { i++; continue; }
      if (t.k === 'num') { if (prevOperand && out.length && /\d$/.test(out[out.length - 1].t)) out.push({ t: '·', it: false, pos: pos }); out.push({ t: t.v, it: false, pos: pos }); prevOperand = true; i++; continue; }
      if (t.k === 'id') {
        var v = t.v;
        if (v === 'Sum') { out.push({ t: 'Σ', it: false, pos: pos }); prevOperand = false; i++; continue; }
        if (v === 'pi') { out.push({ t: 'π', it: false, pos: pos }); prevOperand = true; i++; continue; }
        if (v === 'sqrt') { out.push({ t: '√', it: false, pos: pos }); prevOperand = false; i++; continue; }
        if (v === 'log10') {
          if (prevOperand) out.push({ t: ' ', it: false, pos: pos });
          out.push({ t: 'log', it: false, pos: pos }); out.push({ t: '10', it: false, pos: pos - 1 });
          var nx2 = toks[i + 1] && toks[i + 1].k === 'sp' ? toks[i + 2] : toks[i + 1];
          if (nx2 && !(nx2.k === 'op' && nx2.v === '(')) out.push({ t: '\u2009', it: false, pos: pos });
          prevOperand = false; i++; continue;
        }
        if (FUNCS[v]) {
          if (prevOperand) out.push({ t: ' ', it: false, pos: pos });
          out.push({ t: FUNCS[v], it: false, pos: pos });
          var nx = toks[i + 1] && toks[i + 1].k === 'sp' ? toks[i + 2] : toks[i + 1];
          if (nx && !(nx.k === 'op' && nx.v === '(')) out.push({ t: '\u2009', it: false, pos: pos });
          prevOperand = false; i++; continue;
        }
        symSegments(v, pos).forEach(function (s) { out.push(s); });
        prevOperand = true; i++; continue;
      }
      if (t.k === 'op') {
        var o = t.v;
        var unary = o === '−' && !prevOperand;
        if (SPACED[o] && !unary) { pushSp(); out.push({ t: o, it: false, pos: pos }); pushSp(); }
        else out.push({ t: o, it: false, pos: pos });
        prevOperand = (o === ')' || o === ']' || o === '′' || o === '%' || o === '!' || o === '°');
        i++; continue;
      }
      i++;
    }
    return out;
  }

  function segmentsOf(src) { return segs(tokenize(src), 0, 'top'); }

  function segsToHTML(list) {
    var h = '', i = 0;
    while (i < list.length) {
      var s = list[i];
      var txt = esc(s.t);
      if (s.it) txt = '<i>' + txt + '</i>';
      if (s.pos < 0) h += '<sub>' + txt + '</sub>';
      else if (s.pos > 0) h += '<sup>' + txt + '</sup>';
      else h += txt;
      i++;
    }
    return h.replace(/<\/sub><sub>/g, '').replace(/<\/sup><sup>/g, '').replace(/<\/i><i>/g, '');
  }

  function segsToSVG(list) {
    var h = '', cur = 0;
    list.forEach(function (s) {
      var target = s.pos < 0 ? 3.5 : s.pos > 0 ? -5 : 0;
      var dy = target - cur; cur = target;
      var attrs = (dy ? ' dy="' + dy + '"' : '') + (s.pos !== 0 ? ' font-size="75%"' : '') + (s.it ? ' font-style="italic"' : '');
      h += attrs ? '<tspan' + attrs + '>' + esc(s.t) + '</tspan>' : esc(s.t);
    });
    if (cur) h += '<tspan dy="' + (-cur) + '">​</tspan>';
    return h;
  }

  function split(text) { // → [{math:bool, s}]
    var parts = [], re = /\$([^$]+)\$/g, last = 0, m;
    text = String(text);
    while ((m = re.exec(text))) {
      if (m.index > last) parts.push({ math: false, s: text.slice(last, m.index) });
      parts.push({ math: true, s: m[1] });
      last = m.index + m[0].length;
    }
    if (last < text.length) parts.push({ math: false, s: text.slice(last) });
    return parts;
  }

  /** Text with $…$ → HTML. Non-math text is passed through unchanged (it may already contain HTML). */
  function html(text) {
    if (text === undefined || text === null) return '';
    if (String(text).indexOf('$') < 0) return String(text);
    return split(text).map(function (p) { return p.math ? '<span class="m">' + segsToHTML(segmentsOf(p.s)) + '</span>' : p.s; }).join('');
  }
  /** Text with $…$ → SVG text content (tspans). Non-math text is escaped. */
  function svg(text) {
    if (text === undefined || text === null) return '';
    return split(text).map(function (p) { return p.math ? segsToSVG(segmentsOf(p.s)) : esc(p.s); }).join('');
  }
  /** Plain-text approximation (for aria labels / storage). */
  function plain(text) {
    return split(text).map(function (p) { return p.math ? segmentsOf(p.s).map(function (s) { return s.t; }).join('') : p.s; }).join('');
  }

  SM.mt = { html: html, svg: svg, plain: plain, segments: segmentsOf, split: split,
            unknown: function () { return unknown; }, resetUnknown: function () { unknown = {}; } };
})(typeof window !== 'undefined' ? window : globalThis);
