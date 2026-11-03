#!/usr/bin/env node
/* Rendered-page notation check (needs Playwright + Chromium):  node tests/browser-notation.js
 * Opens every view, every lesson and generated problems with solutions revealed, then scans the
 * visible text that is NOT inside rendered math (.m, var, eq) for symbols written as plain text. */
'use strict';
var path = require('path');
var chromium;
try { chromium = require('playwright').chromium; } catch (e) { console.log('Playwright not installed — skipping.'); process.exit(0); }
var url = 'file://' + path.join(__dirname, '..', 'index.html');

var PATTERNS = [
  /\b(V[svwa]|W[swa]|Gs|kH|kV|D10|D50|emax|emin|e0|k0|h1|h2|r1|r2|kT|k20|Ck)\b/,
  /[γρη][a-zA-Z0-9]/,
  /[₀-₉ᵢ]/,
  /\bk_[HV]/
];

(async function () {
  var b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1280, height: 900 } });
  var findings = [];
  async function scan(where) {
    var texts = await p.evaluate(function () {
      var out = [], main = document.querySelector('main section:not([hidden])');
      var w = document.createTreeWalker(main || document.body, NodeFilter.SHOW_TEXT);
      var n;
      while ((n = w.nextNode())) {
        var el = n.parentElement;
        if (!el || el.closest('.m, var, .eq, script, style, select, option, svg title, [hidden]')) continue;
        if (el.closest('svg') && el.closest('tspan')) continue;
        var t = n.textContent.trim(); if (t) out.push(t);
      }
      return out;
    });
    texts.forEach(function (t) { PATTERNS.forEach(function (re) { var m = t.match(re); if (m) findings.push(where + ': “' + t.slice(Math.max(0, t.indexOf(m[0]) - 30), t.indexOf(m[0]) + 40) + '”'); }); });
  }
  await p.goto(url + '#/home'); await scan('home');
  for (const r of ['phase', 'perm', 'formulas', 'glossary', 'exam', 'review']) { await p.goto(url + '#/' + r); await p.waitForTimeout(150); await scan(r); }
  await p.goto(url + '#/perm'); for (const t of ['fh', 'ly']) { await p.click('#view-perm [data-t=' + t + ']'); await scan('perm-' + t); }
  await p.goto(url + '#/phase'); await p.click('#view-phase .ex'); await p.click('#view-phase .allsteps'); await scan('phase-solved');
  await p.click('#view-phase [data-t=explore]'); for (const m of ['A', 'B', 'C']) { await p.selectOption('#view-phase .mode', m); await scan('explore-' + m); }
  for (const id of await p.evaluate(function () { return SM.lessons.map(function (l) { return l.id; }); })) { await p.goto(url + '#/learn/' + id); await p.waitForTimeout(60); await scan('lesson ' + id); }
  var ids = await p.evaluate(function () { return SM.templates.map(function (t) { return t.id; }); });
  for (const id of ids) {
    for (const sys of ['SI', 'US']) {
      await p.evaluate(function (a) { SM.store.setSys(a[1]); SM.views.practiceOpen(a[0], 'guided'); }, [id, sys]);
      await p.waitForTimeout(40);
      await p.click('#view-practice .hint-btn'); await p.click('#view-practice .hint-btn'); await p.click('#view-practice .hint-btn');
      await p.click('#view-practice .reveal-btn');
      await scan('problem ' + id + ' ' + sys);
    }
  }
  await b.close();
  var uniq = findings.filter(function (f, i) { return findings.indexOf(f) === i; });
  if (uniq.length) { console.log(uniq.slice(0, 60).join('\n')); console.log(uniq.length + ' plain-text symbol(s) in rendered pages.'); process.exit(1); }
  console.log('Rendered-page notation check passed.');
})();
