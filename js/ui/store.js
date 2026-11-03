/* Local progress store (browser localStorage, wrapped in try/catch so the app works
 * without storage — e.g. private windows). Nothing is sent anywhere. */
(function (root) {
  'use strict';
  var SM = root.SM;
  var KEY = 'soilmech-ceg3011c-v1';
  function blank() {
    return { version: 1, settings: { sys: 'SI' }, attempts: {}, concepts: {}, lessons: {}, mistakes: [], drafts: {}, current: {}, exams: [] };
  }
  var state = blank(), storageOK = true;
  try {
    var raw = root.localStorage && root.localStorage.getItem(KEY);
    if (raw) { var parsed = JSON.parse(raw); if (parsed && parsed.version === 1) state = Object.assign(blank(), parsed); }
  } catch (e) { storageOK = false; }

  var timer = null;
  function flush() {
    if (timer) { clearTimeout(timer); timer = null; }
    try { root.localStorage.setItem(KEY, JSON.stringify(state)); storageOK = true; } catch (e) { storageOK = false; }
  }
  function save() {
    if (timer) clearTimeout(timer);
    timer = setTimeout(flush, 150);
  }
  if (root.addEventListener) { root.addEventListener('pagehide', flush); root.addEventListener('beforeunload', flush); }

  var TAGS = {
    'percent': 'Percent vs decimal', 'e-vs-n': 'Void ratio vs porosity', 'w-vs-S': 'Water content vs degree of saturation',
    'mass-weight': 'Mass vs weight / density vs unit weight', 'unit-weight-choice': 'Selecting the right unit weight',
    'pressure-vs-total-head': 'Pressure head vs total head', 'q-vs-volume': 'Discharge rate vs collected volume',
    'area-swap': 'Specimen area vs standpipe area', 'log': 'Natural log vs base-10 log', 'layered': 'Equivalent-conductivity relationship',
    'units': 'Unit conversion', 'area': 'Area of a circle', 'w-definition': 'Definition of water content', 'phase-derivation': 'Phase-diagram relationships',
    'relative-density': 'Relative density / compaction', 'seepage-velocity': 'Discharge vs seepage velocity', 'gradient': 'Hydraulic gradient',
    'temperature': 'Temperature correction', 'empirical': 'Empirical k relationships', 'formula': 'Equation selection', 'rounding': 'Rounding',
    'sign': 'Sign / flow direction', 'factor2': 'Factor-of-2 error', 'practical': 'Practical phase calculations', 'rearrange': 'Rearranging equations', 'concept': 'Concept'
  };

  var S = {
    get: function () { return state; },
    sys: function () { return state.settings.sys || 'SI'; },
    setSys: function (s) { state.settings.sys = s; save(); },
    storageOK: function () { return storageOK; },
    recordAttempt: function (templateId, credit, chapter, topic) {
      var a = state.attempts[templateId] || (state.attempts[templateId] = { n: 0, credit: 0, best: 0, chapter: chapter, topic: topic });
      a.n++; a.credit += credit; a.best = Math.max(a.best, credit); a.last = Date.now(); save();
    },
    recordConcept: function (qid, correct, chapter, topic) {
      var a = state.concepts[qid] || (state.concepts[qid] = { n: 0, correct: 0, chapter: chapter, topic: topic });
      a.n++; if (correct) a.correct++; save();
    },
    recordMistake: function (m) {
      m.time = Date.now();
      state.mistakes.unshift(m);
      if (state.mistakes.length > 300) state.mistakes.length = 300;
      save();
    },
    resolveMistakes: function (tag) { state.mistakes.forEach(function (m) { if (m.tag === tag) m.resolved = true; }); save(); },
    clearMistakes: function () { state.mistakes = []; save(); },
    lesson: function (id, field) { var l = state.lessons[id] || (state.lessons[id] = {}); l[field] = Date.now(); save(); },
    draft: function (pid, partIdx, val, unit) {
      var d = state.drafts[pid] || (state.drafts[pid] = {});
      d[partIdx] = { v: val, u: unit }; save();
    },
    getDraft: function (pid) { return state.drafts[pid] || {}; },
    setCurrent: function (slot, val) { state.current[slot] = val; save(); },
    getCurrent: function (slot) { return state.current[slot]; },
    recordExam: function (r) { state.exams.unshift(r); if (state.exams.length > 30) state.exams.length = 30; save(); },
    exportJSON: function () { return JSON.stringify(state, null, 2); },
    importJSON: function (txt) {
      var p = JSON.parse(txt);
      if (!p || p.version !== 1) throw new Error('Not a progress file from this tool (missing version 1).');
      state = Object.assign(blank(), p); save();
    },
    reset: function () { state = blank(); try { root.localStorage.removeItem(KEY); } catch (e) {} save(); },
    TAGS: TAGS
  };
  // prune drafts so storage doesn't grow forever
  var dk = Object.keys(state.drafts); if (dk.length > 200) dk.slice(0, dk.length - 200).forEach(function (k) { delete state.drafts[k]; });
  SM.store = S;
})(typeof window !== 'undefined' ? window : globalThis);
