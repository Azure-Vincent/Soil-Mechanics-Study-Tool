#!/usr/bin/env node
/* Notation linter: finds formulas or symbols written as plain text instead of $…$ math markup,
 * and $…$ segments that use identifiers missing from the symbol table.
 *   node tests/lint-math.js            (exit 1 if anything is found)
 *   node tests/lint-math.js --list     (print every finding)
 * Used by run-tests.js as well. */
'use strict';
var path = require('path');
var root = path.join(__dirname, '..', 'js');
['core/units.js', 'core/expr.js', 'core/mathtext.js', 'core/phase.js', 'core/perm.js', 'core/problem.js', 'data/ch3-problems.js', 'data/ch7-problems.js',
 'data/lessons.js', 'data/reference.js', 'data/concepts.js', 'data/florida.js'].forEach(function (f) { require(path.join(root, f)); });
var SM = globalThis.SM;

// units and words that look formula-like but are fine as text
var UNIT_RE = /\b(k?N|kN|lb|lbm|kip|kg|Mg|g|m|cm|mm|ft|in|s|min|h|hr|day|L|mL|kPa|Pa|psf|psi|gal)(\/|·)\(?(m|cm|mm|ft|in|s|min|h|hr|day|cm·s|m·s)[²³]?\)?|\b(m|cm|mm|ft|in)[²³]|\bkN\b|\bkPa\b|\bMg\b|\bmL\b|\bcP\b|°C|Pa·s|N·s\/m²|\bpH\b|\bASTM\b|\bCEG\b|\bIAPWS\b|\bCRC\b|\bUSGS\b|\bSI\b|\bUS\b|\be\.g\.|\bi\.e\.|\bvs\.|\bCh\.|\bEq\./g;
var PATTERNS = [
  ['symbol-with-subscript as plain text', /\b(V[svwa]|W[swa]|Gs|M[swd]|kH|kV|D10|D50|D60|D5|emax|emin|e0|k0|h1|h2|r1|r2|kT|k20|Ck|C3|gd|gw|gsat|Dr|Cu|Hi|ki)\b/],
  ['Greek symbol with plain subscript', /[γρη][a-zA-Z0-9′]|[γρηK]\s*[=′]/],
  ['unicode subscript characters', /[₀-₉ᵢₙₜₐₑₒₓₕₖₗₘₚₛ]/],
  ['plain-text equation', /(^|[^A-Za-z⟨⟩])[A-Za-zΔ]\s*=\s*[-−\d(A-Za-z⟨]/],
  ['plain-text ratio', /(^|[^A-Za-z])[A-Za-z]\s?\/\s?[A-Za-z(]/],
  ['plain-text power', /[A-LN-Za-z)][²³]/],
  ['math operator outside markup', /Σ|√|π[A-Za-z]|\bln\s*\(|\blog\s*\(|log₁₀/],
  ['juxtaposed symbols', /\b[a-z][A-Z][a-z]?\b|\b(wGs|Se|kiA|aL|At|Aht|QL|Gsγw)\b/],
  ['bare symbol letter', /(^|[\s(,])(e|n|w|k|q|v|h|L|Q|V|W|S|i)(?=[\s),.;:]|$)/]
];
var WORD_OK = /^(I|A|a)$/;

var findings = [];
function lint(where, text) {
  if (text === undefined || text === null) return;
  text = String(text);
  // unknown identifiers inside math
  SM.mt.resetUnknown();
  SM.mt.html(text);
  Object.keys(SM.mt.unknown()).forEach(function (u) { findings.push({ where: where, kind: 'unknown symbol in $…$: ' + u, snip: text.slice(0, 120) }); });
  var t = text.replace(/\$[^$]+\$/g, '⟨m⟩').replace(/<[^>]+>/g, ' ').replace(/&[a-z]+;/g, ' ').replace(UNIT_RE, ' ');
  PATTERNS.forEach(function (p) {
    var m = t.match(p[1]);
    if (m) {
      var idx = t.indexOf(m[0]);
      findings.push({ where: where, kind: p[0], snip: '…' + t.slice(Math.max(0, idx - 30), idx + 40).replace(/\s+/g, ' ') + '…' });
    }
  });
}

function run() {
  findings = [];
  SM.templates.forEach(function (t) {
    ['SI', 'US'].forEach(function (sys) {
      [1, 2, 3].forEach(function (seed) {
        var spec = t.generate(SM.problem.rng(seed), sys, SM.units.SYSTEMS[sys]);
        var w = t.id + ' (' + sys + ')';
        lint(w + ' text', spec.text);
        (spec.assumptions || []).forEach(function (a, i) { lint(w + ' assumption ' + i, a); });
        (spec.check || []).forEach(function (a, i) { lint(w + ' check ' + i, a); });
        lint(w + ' interpret', spec.interpret);
        (spec.given || []).concat(spec.constants || []).forEach(function (g) { lint(w + ' given label ' + g.sym, g.label); });
        (spec.parts || []).forEach(function (p) {
          lint(w + ' part label ' + p.sym, p.label); lint(w + ' why ' + p.sym, p.why); lint(w + ' hint ' + p.sym, p.hint);
          (p.mistakes || []).forEach(function (m, i) { lint(w + ' mistake ' + p.sym + i, m.msg); });
        });
      });
    });
    lint(t.id + ' title', t.title); lint(t.id + ' method', t.method);
  });
  SM.lessons.forEach(function (L) {
    var LW = 'lesson ' + L.id; lint(LW + ' title', L.title); lint(LW + ' concept', L.concept);
    L.variables.forEach(function (v) { lint(LW + ' var ' + v[0], v[1]); lint(LW + ' var units ' + v[0], v[2]); if (!/^[A-Za-z][A-Za-z0-9]*$/.test(v[0])) lint(LW + ' var sym', v[0]); });
    L.assumptions.forEach(function (a, i) { lint(LW + ' assumption ' + i, a); });
    L.mistakes.forEach(function (a, i) { lint(LW + ' mistake ' + i, a); });
  });
  Object.keys(SM.mathHelp).forEach(function (k) { lint('mathhelp ' + k, SM.mathHelp[k].html); });
  SM.concepts.forEach(function (q) {
    lint(q.id + ' prompt', q.prompt); lint(q.id + ' explain', q.explain);
    q.options.forEach(function (o, i) { lint(q.id + ' option ' + i, o.t); lint(q.id + ' option fb ' + i, o.f); });
  });
  SM.formulas.forEach(function (f) {
    lint(f.id + ' name', f.name); lint(f.id + ' assumptions', f.assumptions); lint(f.id + ' applicability', f.applicability);
    f.vars.forEach(function (v) { lint(f.id + ' var ' + v[0], v[1]); if (!/^[A-Za-z][A-Za-z0-9]*$/.test(v[0])) lint(f.id + ' var sym', v[0]); });
  });
  SM.glossary.forEach(function (g) { lint('glossary ' + g.term, g.term); lint('glossary ' + g.term + ' def', g.def); });
  // dedupe by where+kind
  var seen = {}; findings = findings.filter(function (f) { var k = f.where.replace(/ \((SI|US)\)/, '') + f.kind; if (seen[k]) return false; seen[k] = 1; return true; });
  return findings;
}

module.exports = { run: run };
if (require.main === module) {
  var f = run();
  if (process.argv.indexOf('--list') >= 0 || f.length) f.forEach(function (x) { console.log('[' + x.kind + '] ' + x.where + ': ' + x.snip); });
  console.log(f.length + ' notation finding(s).');
  process.exit(f.length ? 1 : 0);
}
