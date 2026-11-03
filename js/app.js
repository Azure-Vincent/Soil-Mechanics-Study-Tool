/* Router, header, unit-system switch and formula drawer. */
(function (root) {
  'use strict';
  var SM = root.SM, V = SM.views;
  var ROUTES = ['home', 'learn', 'phase', 'perm', 'practice', 'review', 'exam', 'mistakes', 'formulas', 'glossary', 'progress'];
  var ALWAYS_RERENDER = { mistakes: 1, progress: 1 };

  function section(name) { return document.getElementById('view-' + name); }
  function show(name, arg) {
    if (ROUTES.indexOf(name) < 0) name = 'home';
    ROUTES.forEach(function (r) { var s = section(r); if (s) s.hidden = r !== name; });
    var sec = section(name);
    if (!sec._rendered || ALWAYS_RERENDER[name]) { V[name](sec); sec._rendered = true; sec._sys = SM.store.sys(); }
    else if (name === 'phase' && sec._sys !== SM.store.sys()) { V.phase(sec); sec._sys = SM.store.sys(); }
    if (name === 'learn') V.learnShow(sec, arg || (SM.store.getCurrent('lesson') || 'c3-phases'));
    if (name === 'learn' && arg) SM.store.setCurrent('lesson', arg);
    document.querySelectorAll('.mainnav a').forEach(function (a) { var on = a.dataset.r === name; a.classList.toggle('active', on); if (on) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
    document.getElementById('main').focus({ preventScroll: true });
  }
  function route() {
    var h = (location.hash || '#/home').replace(/^#\/?/, '').split('/');
    show(h[0] || 'home', h[1]);
    window.scrollTo(0, 0);
  }

  function setSysLabel() {
    var s = SM.store.sys(), d = SM.units.SYSTEMS[s];
    document.querySelectorAll('.sysbtn').forEach(function (b) { b.classList.toggle('on', b.dataset.s === s); b.setAttribute('aria-pressed', b.dataset.s === s); });
    document.getElementById('sysinfo').textContent = s === 'SI' ? 'kN · m³ · kN/m³ · γw = 9.81 kN/m³' : 'lb · ft³ · lb/ft³ · γw = 62.4 lb/ft³';
    document.body.dataset.sys = s;
  }

  function openFormulaDrawer(chs) {
    var d = document.getElementById('fdrawer');
    var list = SM.formulas.filter(function (f) { return !chs || chs.indexOf(f.chapter) >= 0 || (chs.indexOf('X') >= 0); });
    d.querySelector('.fd-body').innerHTML = list.map(V.formulaCard).join('');
    d.hidden = false; d.querySelector('.fd-close').focus();
  }

  function init() {
    document.querySelectorAll('.sysbtn').forEach(function (b) {
      b.addEventListener('click', function () {
        SM.store.setSys(b.dataset.s); setSysLabel();
        var cur = location.hash.replace(/^#\/?/, '').split('/')[0] || 'home';
        if (cur === 'phase') show('phase'); else if (cur === 'learn') route();
        var note = document.getElementById('sysnote'); note.textContent = 'Unit system set to ' + (b.dataset.s === 'SI' ? 'SI' : 'US customary') + '. New problems, lessons and the Phase Lab use it; problems already on screen keep their own units (shown on each problem).';
        note.hidden = false; clearTimeout(note._t); note._t = setTimeout(function () { note.hidden = true; }, 6000);
      });
    });
    document.getElementById('fdrawer').addEventListener('click', function (ev) { if (ev.target.closest('.fd-close') || ev.target.id === 'fdrawer') document.getElementById('fdrawer').hidden = true; });
    document.addEventListener('keydown', function (ev) { if (ev.key === 'Escape') document.getElementById('fdrawer').hidden = true; });
    document.getElementById('fbtn').addEventListener('click', function () { openFormulaDrawer(null); });
    setSysLabel();
    window.addEventListener('hashchange', route);
    route();
  }
  SM.app = { openFormulaDrawer: openFormulaDrawer };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})(window);
