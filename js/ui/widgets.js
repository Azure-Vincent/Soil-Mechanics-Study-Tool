/* Reusable UI widgets: problem player (guided / independent / Socratic / exam / example),
 * 10-step worked solutions, multiple-choice questions, and small DOM helpers. */
(function (root) {
  'use strict';
  var SM = root.SM, U = SM.units, X = SM.expr, PB = SM.problem;

  function el(html) { var t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstElementChild; }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function chLabel(c) { return c === 'X' ? 'Ch. 3 + 7' : 'Ch. ' + c; }
  function stars(d) { return '<span class="diff" title="Difficulty ' + d + ' of 3">' + '●'.repeat(d) + '○'.repeat(3 - d) + '</span>'; }

  function unitSelect(part, sys, cls) {
    var ch = U.choices(part.dim, sys);
    if (part.dim === 'none' || !ch.length || (ch.length === 1 && ch[0] === '')) return '<span class="unit-none">' + (part.unit || '(no units)') + '</span>';
    if (ch.indexOf(part.unit) < 0) ch.unshift(part.unit);
    return '<select class="' + (cls || 'unit') + '" aria-label="unit">' + ch.map(function (u) { return '<option' + (u === part.unit ? ' selected' : '') + '>' + esc(u) + '</option>'; }).join('') + '</select>';
  }

  /* ---------- typical-value plausibility for the Check step ---------- */
  function plausibility(p, sys) {
    var v = p.value, s = p.sym, out = [];
    if (/^(g|gd|gsat|gd1|gd2|gdmax|gdmin)$/.test(s) && (p.unit === 'kN/m³' || p.unit === 'lb/ft³')) {
      var lo = p.unit === 'kN/m³' ? 12 : 75, hi = p.unit === 'kN/m³' ? 24 : 155;
      out.push(X.symHTML(s) + ' = ' + PB.showVal(v, p.unit) + (v >= lo && v <= hi ? ' lies in the typical soil range (' + lo + '–' + hi + ' ' + p.unit + ') ✓' : ' is outside the usual ' + lo + '–' + hi + ' ' + p.unit + ' — re-check if this is unexpected.'));
    }
    if (s === 'gsub') out.push(SM.mt.html('$gsub$ is positive and about half of $gsat$ ✓'));
    if (s === 'S') out.push(SM.mt.html('$S$ = ' + PB.showVal(v, '%') + (v <= 1.0000001 ? ' ≤ 100 % ✓' : ' > 100 % ✗ impossible')));
    if (s === 'n') out.push(SM.mt.html('0 < $n$ < 1 ✓'));
    if (s === 'e' && v > 0) out.push(SM.mt.html('$e$ > 0 ✓' + (v > 1 ? ' ($e$ > 1 is valid: the voids exceed the solids)' : '')));
    if (s === 'Dr') out.push(SM.mt.html('0 ≤ $Dr$ ≤ 100 % ' + (v >= -1e-9 && v <= 1 + 1e-9 ? '✓' : '✗')));
    if ((s === 'k' || s === 'k2' || s === 'k20' || s === 'kHeq' || s === 'kVeq' || s === 'k3') && p.unit === 'cm/s') out.push(X.symHTML(s) + ' = ' + U.fmt(v, 3) + ' cm/s is typical of: ' + SM.perm.classify(v));
    if (s === 'vs') out.push('Seepage velocity exceeds discharge velocity ✓');
    return out;
  }

  /* ---------- 10-step worked solution ---------- */
  function solutionHTML(P, opts) {
    opts = opts || {};
    var h = '<div class="solution">';
    h += '<div class="step"><span class="sn">1</span><div><b>Given</b><div class="chips">' + P.given.map(function (g) { return '<span class="chip">' + g.html + '</span>'; }).join('') +
         P.constants.map(function (c) { return '<span class="chip const">' + c.html + '</span>'; }).join('') + '</div></div></div>';
    h += '<div class="step"><span class="sn">2</span><div><b>Find</b><div>' + P.parts.map(function (p) { return p.label + ' (' + X.symHTML(p.sym) + ')'; }).join('; ') + '</div></div></div>';
    h += '<div class="step"><span class="sn">3</span><div><b>Sketch</b><div class="muted">' + (P.sketch ? (opts.inlineSketch ? SM.diagrams.render(P.sketch) : 'See the diagram beside the problem; mark each given value on it.') : 'A sketch is optional here: list the quantities and the relationships between them.') + '</div></div></div>';
    h += '<div class="step"><span class="sn">4</span><div><b>Assumptions</b><ul>' + (P.assumptions.length ? P.assumptions.map(function (a) { return '<li>' + a + '</li>'; }).join('') : '<li>None beyond the given data.</li>') + '</ul></div></div>';
    P.parts.forEach(function (p, i) {
      h += '<div class="step part"><span class="sn pt" title="Part ' + 'abcdefghij'[i] + '">' + 'abcdefghij'[i] + '</span><div><b>' + p.label + '</b>' +
        '<div class="ss"><span class="sl">5 Choose</span> ' + (p.why || 'Definition.') + '</div>' +
        '<div class="ss"><span class="sl">6 Rearrange</span> ' + p.symbolic + '</div>' +
        '<div class="ss"><span class="sl">7 Substitute</span> ' + p.substituted + '</div>' +
        '<div class="ss"><span class="sl">8 Calculate</span> <span class="res">' + p.result + '</span>' + (p.dim === 'ratio' ? ' <span class="muted">(= ' + U.fmt(p.value, 4) + ' as a decimal)</span>' : '') + '</div></div></div>';
    });
    var checks = [];
    P.parts.forEach(function (p) { checks = checks.concat(plausibility(p, P.sys)); });
    checks = checks.concat(P.check);
    h += '<div class="step"><span class="sn">9</span><div><b>Check</b><ul>' + checks.map(function (c) { return '<li>' + c + '</li>'; }).join('') + '<li>Units: every substitution above carries its unit; the result unit follows from the equation.</li></ul></div></div>';
    h += '<div class="step"><span class="sn">10</span><div><b>Interpret</b><div>' + (P.interpret || '') + '</div></div></div>';
    return h + '</div>';
  }

  /* ---------- problem player ---------- */
  function ProblemPlayer(P, opts) {
    opts = opts || {};
    var mode = opts.mode || 'guided';
    var store = SM.store;
    var node = el('<div class="pp" data-mode="' + mode + '"></div>');
    var partState = P.parts.map(function () { return { tries: 0, first: null, done: false, hint: 0, revealed: false, credit: 0 }; });
    var draft = store.getDraft(P.id);
    var finished = false;

    var head = '';
    if (!opts.hideHeader) {
      head = '<div class="pp-head"><div><span class="badge">' + chLabel(P.chapter) + '</span> ' + stars(P.difficulty) +
        ' <span class="badge sys" title="Unit system used by this problem">Units: ' + P.sys + '</span></div>' +
        (opts.hideTitle ? '' : '<h3>' + esc(P.title) + '</h3>') + '</div>';
    }
    var sketch = P.sketch ? SM.diagrams.render(P.sketch) : '';
    var main = '<div class="pp-main">' + head + '<p class="pp-text">' + P.text + '</p>' +
      '<details class="pp-given" open><summary>Given data</summary><div class="chips">' + P.given.map(function (g) { return '<span class="chip">' + g.html + '</span>'; }).join('') +
      P.constants.map(function (c) { return '<span class="chip const">' + c.html + '</span>'; }).join('') + '</div></details>';
    if (mode !== 'exam' && mode !== 'example') {
      main += '<div class="pp-tools">' + (mode !== 'socratic' ? '<button class="btn hint-btn" type="button">💡 How do I start?</button>' : '') +
        (opts.allowSocratic !== false && mode !== 'socratic' ? '<button class="btn ghost socratic-btn" type="button">Socratic mode</button>' : '') +
        (mode === 'socratic' ? '<button class="btn ghost normal-btn" type="button">Back to step-by-step</button>' : '') +
        '<button class="btn ghost reveal-btn" type="button">Show full solution</button>' +
        (opts.onNew ? '<button class="btn ghost new-btn" type="button">↻ New numbers</button>' : '') + '</div>';
    }
    if (mode === 'socratic') main += '<div class="socratic" aria-live="polite"></div>';
    else if (mode === 'example') main += '';
    else {
      main += '<ol class="pp-parts">' + P.parts.map(function (p, i) {
        var d = draft[i] || {};
        return '<li class="part" data-i="' + i + '"><div class="pl"><span class="plabel">' + p.label + '</span> <span class="psym">' + X.symHTML(p.sym) + ' =</span></div>' +
          '<div class="pin"><input type="text" inputmode="decimal" autocomplete="off" spellcheck="false" aria-label="' + esc(p.labelText) + '" value="' + esc(d.v || '') + '">' + unitSelect(p, P.sys) +
          (mode === 'guided' ? '<button class="btn small check-btn" type="button">Check</button>' : '') + '<span class="mark" aria-hidden="true"></span></div>' +
          '<div class="phint"></div><div class="fb" aria-live="polite"></div></li>';
      }).join('') + '</ol>';
      if (mode === 'independent') main += '<div class="pp-submit"><button class="btn primary submit-btn" type="button">Submit answers</button></div>';
    }
    main += '<div class="pp-score" aria-live="polite"></div><div class="pp-sol"' + (mode === 'example' ? '' : ' hidden') + '>' + (mode === 'example' ? solutionHTML(P) : '') + '</div></div>';
    node.innerHTML = main + (sketch ? '<aside class="pp-side"><div class="sticky">' + sketch + '</div></aside>' : '');
    if (!sketch) node.classList.add('noside');

    // restore draft units
    if (mode !== 'socratic' && mode !== 'example') {
      node.querySelectorAll('li.part').forEach(function (li) {
        var i = +li.dataset.i, d = draft[i]; var sel = li.querySelector('select');
        if (d && d.u !== undefined && sel) sel.value = d.u;
        li.querySelector('input').addEventListener('input', function (ev) { store.draft(P.id, i, ev.target.value, sel ? sel.value : P.parts[i].unit); });
        if (sel) sel.addEventListener('change', function () { store.draft(P.id, i, li.querySelector('input').value, sel.value); });
        li.querySelector('input').addEventListener('keydown', function (ev) { if (ev.key === 'Enter') { ev.preventDefault(); if (mode === 'guided') checkPart(i); } });
      });
    }

    function partLi(i) { return node.querySelector('li.part[data-i="' + i + '"]'); }
    function readPart(i) { var li = partLi(i); var sel = li.querySelector('select'); return { v: li.querySelector('input').value, u: sel ? sel.value : P.parts[i].unit }; }
    function setFb(i, res) {
      var li = partLi(i), fb = li.querySelector('.fb'), mk = li.querySelector('.mark');
      fb.className = 'fb ' + res.status; fb.innerHTML = res.msg;
      mk.textContent = res.status === 'correct' ? '✓' : res.status === 'close' ? '≈' : res.status === 'invalid' ? '' : '✗';
      li.classList.toggle('ok', res.status === 'correct');
    }
    function logMistake(i, res) {
      if (res.status === 'correct' || res.status === 'invalid') return;
      store.recordMistake({ templateId: P.templateId, chapter: P.chapter, part: P.parts[i].label, tag: res.tag || P.parts[i].tag || 'concept', msg: res.msg, mode: mode });
    }
    function checkPart(i) {
      var r = readPart(i), p = P.parts[i], st = partState[i];
      var res = PB.check(p, r.v, r.u, P.sys);
      if (res.status === 'invalid') { setFb(i, res); return res; }
      st.tries++;
      if (st.first === null) st.first = res.credit;
      setFb(i, res);
      logMistake(i, res);
      if (res.status === 'correct') { st.done = true; st.credit = Math.max(st.credit, st.first); }
      else if (st.tries >= 2 && mode === 'guided' && !partLi(i).querySelector('.showstep')) {
        partLi(i).querySelector('.fb').insertAdjacentHTML('beforeend', '<div class="retry">Try once more, or <button class="link showstep" type="button">show this step</button>.</div>');
      }
      maybeFinish();
      return res;
    }
    function showStep(i) {
      var p = P.parts[i], li = partLi(i);
      partState[i].revealed = true; partState[i].done = true; if (partState[i].first === null) partState[i].first = 0;
      li.querySelector('.phint').innerHTML = '<div class="stepbox">' + p.symbolic + '<br>' + p.substituted + '<br><b>' + p.result + '</b></div>';
      maybeFinish();
    }
    function nextHint() {
      var i = partState.findIndex(function (s) { return !s.done; });
      if (i < 0) i = P.parts.length - 1;
      var hs = PB.hints(P, i), st = partState[i];
      var box = partLi(i).querySelector('.phint');
      if (st.hint >= hs.length) { box.insertAdjacentHTML('beforeend', '<div class="hint muted">No more hints for this step — enter your value and check it, or use “show this step”.</div>'); return; }
      box.insertAdjacentHTML('beforeend', '<div class="hint">' + hs[st.hint] + '</div>');
      st.hint++;
      var inp = partLi(i).querySelector('input'); if (inp) inp.focus({ preventScroll: true });
    }
    function score() {
      var c = P.parts.reduce(function (s, st, i) { return s + (partState[i].first === null ? 0 : partState[i].first); }, 0);
      return c / P.parts.length;
    }
    function maybeFinish() {
      if (finished || mode !== 'guided') return;
      if (partState.every(function (s) { return s.done; })) {
        finished = true;
        var sc = score();
        store.recordAttempt(P.templateId, sc, P.chapter, P.topic);
        node.querySelector('.pp-score').innerHTML = '<div class="scorebox">Problem complete. First-try score with partial credit: <b>' + Math.round(sc * 100) + ' %</b>. ' +
          (sc < 1 ? 'Review the flagged steps, then try new numbers.' : 'Excellent — try a new set of numbers or a harder problem.') + '</div>';
        if (opts.onScore) opts.onScore(sc);
      }
    }
    function submitAll() {
      var total = 0;
      P.parts.forEach(function (p, i) {
        var r = readPart(i), res = PB.check(p, r.v, r.u, P.sys);
        if (res.status === 'invalid') res = { status: 'incorrect', credit: 0, msg: r.v.trim() ? res.msg : 'No answer entered.' };
        setFb(i, res); logMistake(i, res); total += res.credit; partState[i].first = res.credit; partState[i].done = true;
        partLi(i).querySelector('input').readOnly = true;
      });
      var sc = total / P.parts.length;
      finished = true;
      store.recordAttempt(P.templateId, sc, P.chapter, P.topic);
      node.querySelector('.pp-score').innerHTML = '<div class="scorebox">Score with partial credit: <b>' + Math.round(sc * 100) + ' %</b> (' + P.parts.filter(function (p, i) { return partState[i].first === 1; }).length + ' of ' + P.parts.length + ' steps fully correct). The worked solution is shown below.</div>';
      revealSolution();
      var b = node.querySelector('.submit-btn'); if (b) b.disabled = true;
      if (opts.onScore) opts.onScore(sc);
    }
    function revealSolution() {
      var s = node.querySelector('.pp-sol'); if (!s.innerHTML) s.innerHTML = '<h4>Worked solution</h4>' + solutionHTML(P);
      s.hidden = false;
    }

    /* ---------- Socratic mode ---------- */
    function socratic() {
      var box = node.querySelector('.socratic'), pi = 0;
      function say(html, who) { box.insertAdjacentHTML('beforeend', '<div class="msg ' + (who || 'tutor') + '">' + html + '</div>'); }
      function askEquation() {
        var p = P.parts[pi];
        say('<b>Step ' + (pi + 1) + ' of ' + P.parts.length + '.</b> We need <b>' + p.label + '</b> (' + X.symHTML(p.sym) + '). Which relationship should we use?');
        var q = el('<div class="msg opts"></div>');
        p.options.forEach(function (o, k) { q.insertAdjacentHTML('beforeend', '<button type="button" class="opt" data-k="' + k + '">' + o.html + '</button>'); });
        box.appendChild(q);
        q.addEventListener('click', function (ev) {
          var b = ev.target.closest('.opt'); if (!b || q.dataset.done) return;
          var o = p.options[+b.dataset.k];
          b.classList.add(o.correct ? 'right' : 'wrong');
          if (o.correct) { q.dataset.done = 1; say('Yes. ' + (p.why || '')); askValue(0); }
          else { say('Not quite — that form does not follow from the definitions here. Think about it this way: ' + (p.hint || p.why || 'what links this quantity to the known ones?') + ' Try another option.'); }
        });
      }
      function askValue(tries) {
        var p = P.parts[pi];
        say(tries === 0 ? 'Now substitute the values (with units). What do you get for ' + X.symHTML(p.sym) + '?' : 'Try again:');
        var q = el('<div class="msg ans pin"><input type="text" inputmode="decimal" aria-label="answer">' + unitSelect(p, P.sys) + '<button class="btn small" type="button">Answer</button></div>');
        box.appendChild(q);
        var inp = q.querySelector('input'); inp.focus({ preventScroll: true });
        function go() {
          if (q.dataset.done) return;
          var sel = q.querySelector('select'), res = PB.check(p, inp.value, sel ? sel.value : p.unit, P.sys);
          if (res.status === 'invalid') { say(res.msg); return; }
          q.dataset.done = 1; inp.readOnly = true;
          if (partState[pi].first === null) partState[pi].first = res.credit;
          if (res.status === 'correct') { say('✓ ' + res.msg); next(); }
          else {
            logMistake(pi, res); say(res.msg);
            if (tries === 0) { say('Hint — substituted equation: ' + p.substituted); askValue(1); }
            else if (tries === 1) askValue(2);
            else { say('Here is the result: <b>' + p.result + '</b>. Make sure you can reproduce it before moving on.'); next(); }
          }
        }
        q.querySelector('button').addEventListener('click', go);
        inp.addEventListener('keydown', function (ev) { if (ev.key === 'Enter') { ev.preventDefault(); go(); } });
      }
      function next() {
        pi++;
        if (pi < P.parts.length) askEquation();
        else {
          var sc = score(); finished = true; store.recordAttempt(P.templateId, sc, P.chapter, P.topic);
          say('<b>Check:</b> ' + P.check.join(' ') + '<br><b>Interpret:</b> ' + P.interpret);
          node.querySelector('.pp-score').innerHTML = '<div class="scorebox">Done. First-try score: <b>' + Math.round(sc * 100) + ' %</b>.</div>';
        }
      }
      say('Let’s solve this one question at a time. I will wait for each answer before continuing.');
      askEquation();
    }

    node.addEventListener('click', function (ev) {
      var t = ev.target;
      if (t.closest('.check-btn')) checkPart(+t.closest('li.part').dataset.i);
      else if (t.closest('.showstep')) showStep(+t.closest('li.part').dataset.i);
      else if (t.closest('.hint-btn')) nextHint();
      else if (t.closest('.submit-btn')) submitAll();
      else if (t.closest('.reveal-btn')) { revealSolution(); P.parts.forEach(function (p, i) { if (!partState[i].done) { partState[i].revealed = true; if (partState[i].first === null) partState[i].first = 0; } }); }
      else if (t.closest('.new-btn')) opts.onNew && opts.onNew();
      else if (t.closest('.socratic-btn')) opts.onMode && opts.onMode('socratic');
      else if (t.closest('.normal-btn')) opts.onMode && opts.onMode('guided');
    });
    if (mode === 'socratic') socratic();

    // exam API
    node.grade = function () {
      var details = P.parts.map(function (p, i) {
        var r = readPart(i), res = PB.check(p, r.v, r.u, P.sys);
        if (res.status === 'invalid') res = { status: 'incorrect', credit: 0, msg: r.v.trim() ? res.msg : 'No answer entered.' };
        setFb(i, res); logMistake(i, res); partLi(i).querySelector('input').readOnly = true;
        return res;
      });
      var sc = details.reduce(function (s, d) { return s + d.credit; }, 0) / P.parts.length;
      store.recordAttempt(P.templateId, sc, P.chapter, P.topic);
      revealSolution();
      return sc;
    };
    node.problem = P;
    return node;
  }

  /* ---------- multiple-choice / concept question ---------- */
  function MCQ(q, opts) {
    opts = opts || {};
    var R = { prompt: SM.mt.html(q.prompt), explain: SM.mt.html(q.explain), options: q.options.map(function (o) { return { t: SM.mt.html(o.t), f: SM.mt.html(o.f) }; }) };
    var typeName = { mcq: 'Concept check', eqselect: 'Equation selection', mistake: 'Find the mistake', predict: 'Predict the change' }[q.type] || 'Question';
    var node = el('<div class="mcq"><div class="pp-head"><span class="badge">' + chLabel(q.chapter) + '</span> <span class="badge alt">' + typeName + '</span></div>' +
      '<p class="mq-prompt">' + R.prompt + '</p><div class="mq-opts" role="group">' +
      R.options.map(function (o, k) { return '<button type="button" class="opt" data-k="' + k + '"><span class="ol">' + 'ABCDE'[k] + '</span> ' + o.t + '</button>'; }).join('') +
      '</div><div class="fb" aria-live="polite"></div></div>');
    var answered = false, chosen = null;
    node.addEventListener('click', function (ev) {
      var b = ev.target.closest('.opt'); if (!b) return;
      var k = +b.dataset.k;
      if (opts.exam) { node.querySelectorAll('.opt').forEach(function (x) { x.classList.remove('sel'); }); b.classList.add('sel'); chosen = k; return; }
      if (answered && opts.once) return;
      var ok = k === q.answer;
      b.classList.add(ok ? 'right' : 'wrong');
      var fb = node.querySelector('.fb');
      if (ok) { fb.className = 'fb correct'; fb.innerHTML = '✓ Correct. ' + R.explain; }
      else {
        fb.className = 'fb incorrect';
        fb.innerHTML = '✗ ' + (R.options[k].f ? R.options[k].f + ' ' : 'Not this one. ') + (answered ? '' : 'Try again — or read the explanation after another attempt.');
        if (answered) fb.innerHTML += '<div class="muted">Explanation: ' + R.explain + '</div>';
      }
      if (!answered) {
        SM.store.recordConcept(q.id, ok, q.chapter, q.topic);
        if (!ok) SM.store.recordMistake({ conceptId: q.id, chapter: q.chapter, part: typeName, tag: q.topic, msg: '' });
        if (opts.onAnswer) opts.onAnswer(ok);
      }
      answered = true;
    });
    node.grade = function () {
      var ok = chosen === q.answer;
      node.querySelectorAll('.opt').forEach(function (x, k) { if (k === q.answer) x.classList.add('right'); else if (k === chosen) x.classList.add('wrong'); x.disabled = true; });
      var fb = node.querySelector('.fb'); fb.className = 'fb ' + (ok ? 'correct' : 'incorrect');
      fb.innerHTML = (ok ? '✓ ' : '✗ ' + (chosen === null ? 'Not answered. ' : (R.options[chosen].f || '') + ' ')) + R.explain;
      SM.store.recordConcept(q.id, ok, q.chapter, q.topic);
      if (!ok) SM.store.recordMistake({ conceptId: q.id, chapter: q.chapter, part: typeName, tag: q.topic, msg: '' });
      return ok ? 1 : 0;
    };
    return node;
  }

  function mathHelpHTML(keys) {
    return (keys || []).map(function (k) { var m = SM.mathHelp[k]; return m ? '<details class="mathhelp"><summary>Math help: ' + SM.mt.html(m.title) + '</summary>' + SM.mt.html(m.html) + '</details>' : ''; }).join('');
  }

  SM.ui = { el: el, esc: esc, ProblemPlayer: ProblemPlayer, MCQ: MCQ, solutionHTML: solutionHTML, unitSelect: unitSelect, mathHelpHTML: mathHelpHTML, chLabel: chLabel, stars: stars };
})(typeof window !== 'undefined' ? window : globalThis);
