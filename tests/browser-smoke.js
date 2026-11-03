#!/usr/bin/env node
/* Optional browser end-to-end check (needs Playwright + Chromium):  node tests/browser-smoke.js
 * Opens index.html from disk and exercises every view. */
'use strict';
var path = require('path');
var chromium;
try { chromium = require('playwright').chromium; } catch (e) { console.log('Playwright not installed — skipping browser smoke test.'); process.exit(0); }
var url = 'file://' + path.join(__dirname, '..', 'index.html');
var fails = [];
function ok(c, m) { if (!c) fails.push(m); }

(async function () {
  var b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1280, height: 900 } });
  var errs = []; p.on('pageerror', function (e) { errs.push(e.message); });
  await p.goto(url + '#/home');
  for (const r of ['learn/c3-phases', 'phase', 'perm', 'practice', 'review', 'exam', 'mistakes', 'formulas', 'glossary', 'progress']) { await p.goto(url + '#/' + r); await p.waitForTimeout(120); }
  for (const id of await p.evaluate(function () { return SM.lessons.map(function (l) { return l.id; }); })) { await p.goto(url + '#/learn/' + id); await p.waitForTimeout(40); }

  // Practice: hint keeps page stationary; drafts persist across navigation and reload
  await p.goto(url + '#/practice'); await p.selectOption('#view-practice .tp', 'c3-moist-oven'); await p.click('#view-practice .go');
  await p.evaluate(function () { window.scrollTo(0, 300); });
  var y0 = await p.evaluate(function () { return window.scrollY; });
  await p.click('#view-practice .hint-btn'); await p.waitForTimeout(100);
  ok(Math.abs((await p.evaluate(function () { return window.scrollY; })) - y0) < 2, 'page moved when revealing a hint');
  await p.fill('#view-practice li.part[data-i="0"] input', '12.3');
  await p.goto(url + '#/formulas'); await p.goto(url + '#/practice');
  ok((await p.inputValue('#view-practice li.part[data-i="0"] input')) === '12.3', 'entry lost on navigation');
  await p.reload(); await p.waitForTimeout(200);
  ok((await p.inputValue('#view-practice li.part[data-i="0"] input')) === '12.3', 'entry lost on reload');
  await p.click('#view-practice li.part[data-i="0"] .check-btn');
  ok(/incorrect|close/.test(await p.getAttribute('#view-practice li.part[data-i="0"] .fb', 'class')), 'wrong answer not flagged');

  // Phase lab: invalid vs insufficient
  await p.goto(url + '#/phase');
  await p.fill('#view-phase input[data-k="S"]', '120'); await p.click('#view-phase .which');
  ok(/invalid/.test(await p.getAttribute('#view-phase .pstatus', 'class')), 'S = 120 % not rejected');
  await p.click('#view-phase .clr'); await p.fill('#view-phase input[data-k="e"]', '1.4'); await p.fill('#view-phase input[data-k="w"]', '150'); await p.fill('#view-phase input[data-k="Gs"]', '2.7');
  await p.click('#view-phase .which');
  ok(/invalid/.test(await p.getAttribute('#view-phase .pstatus', 'class')), 'w·Gs > e (S > 100 %) not rejected');
  await p.click('#view-phase .clr'); await p.fill('#view-phase input[data-k="e"]', '2.2'); await p.fill('#view-phase input[data-k="S"]', '100'); await p.fill('#view-phase input[data-k="Gs"]', '2.7');
  await p.click('#view-phase .which');
  ok(/insufficient/.test(await p.getAttribute('#view-phase .pstatus', 'class')), 'e > 1 case should be valid but insufficient (no sample size)');
  await p.click('#view-phase .allsteps');
  ok((await p.$$('#view-phase .psteps li')).length >= 5, 'steps not revealed');

  // Unit toggle
  await p.click('.sysbtn[data-s="US"]'); await p.goto(url + '#/phase');
  ok(/lb\/ft³/.test(await p.textContent('#view-phase .lab-intro')), 'US units not applied in Phase Lab');
  await p.click('.sysbtn[data-s="SI"]');

  // Mock exam end-to-end
  await p.goto(url + '#/exam'); await p.fill('#view-exam .nn', '2'); await p.fill('#view-exam .nc', '2'); await p.fill('#view-exam .tm', '0');
  await p.click('#view-exam .start'); p.once('dialog', function (d) { d.accept(); });
  await p.click('#view-exam .sub'); await p.waitForTimeout(200);
  ok(/Exam score/.test(await p.textContent('#view-exam .exam-res')), 'exam not graded');
  await p.goto(url + '#/mistakes');
  ok((await p.$$('#view-mistakes .mtag')).length > 0, 'mistakes not recorded');
  await p.click('#view-mistakes .mtag .tp'); await p.waitForTimeout(100);
  ok((await p.$$('#view-mistakes .mt-host .pp, #view-mistakes .mt-host .mcq')).length > 0, 'no targeted practice');

  // Phone width: no horizontal page scroll
  await p.setViewportSize({ width: 375, height: 800 });
  for (const r of ['home', 'learn/c7-layers', 'phase', 'perm', 'practice', 'formulas']) {
    await p.goto(url + '#/' + r); await p.waitForTimeout(120);
    var over = await p.evaluate(function () { return document.documentElement.scrollWidth - window.innerWidth; });
    ok(over <= 1, 'horizontal scroll at 375px on ' + r + ' (' + over + 'px)');
  }
  ok(!errs.length, 'page errors: ' + errs.join(' | '));
  await b.close();
  if (fails.length) { console.log('Browser smoke FAILED:\n' + fails.join('\n')); process.exit(1); }
  console.log('Browser smoke test passed.');
})();
