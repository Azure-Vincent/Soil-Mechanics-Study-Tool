/* SVG diagram renderers. Every diagram returns an SVG string; colours come from CSS classes
 * so they follow the light/dark theme.  Labels use the same symbols as the equations. */
(function (root) {
  'use strict';
  var SM = root.SM, U = SM.units;
  var f = function (x, s) { return U.fmt(x, s || 3); };
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;'); }
  function svg(w, h, body, title) {
    return '<svg class="dg" viewBox="0 0 ' + w + ' ' + h + '" role="img" aria-label="' + esc(title || 'diagram') + '" xmlns="http://www.w3.org/2000/svg"><title>' + esc(title || '') + '</title>' + body + '</svg>';
  }
  function T(x, y, s, cls, anchor) { return '<text x="' + x + '" y="' + y + '" class="' + (cls || 'dt') + '" text-anchor="' + (anchor || 'middle') + '">' + s + '</text>'; }
  function R(x, y, w, h, cls) { return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" class="' + cls + '"/>'; }
  function Ln(x1, y1, x2, y2, cls) { return '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" class="' + (cls || 'dl') + '"/>'; }
  function arrow(x1, y1, x2, y2, cls) { return '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" class="' + (cls || 'da') + '" marker-end="url(#ah)"/>'; }
  var DEFS = '<defs><marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerUnits="userSpaceOnUse" markerWidth="8" markerHeight="8" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" class="dah"/></marker>' +
    '<pattern id="soilpat" width="10" height="10" patternUnits="userSpaceOnUse"><circle cx="3" cy="3" r="2" class="dsp"/><circle cx="8" cy="8" r="1.5" class="dsp"/></pattern></defs>';
  function dim(x1, y1, x2, y2, label, side) { // dimension line with label
    var mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
    var off = side === 'l' ? -6 : 6;
    return arrow(mx, my, x1, y1, 'dd') + arrow(mx, my, x2, y2, 'dd') + T(mx + (x1 === x2 ? off : 0), my + (y1 === y2 ? -5 : 4), label, 'dt sm', x1 === x2 ? (side === 'l' ? 'end' : 'start') : 'middle');
  }

  /* ---------- phase diagram (numeric) ----------
     o = {vals:{V,Vs,Vw,Va,W,Ws,Ww}, units:{V,F}, known:[...], mass, labels:{sym: text}, reveal:true, highlight:sym} */
  function phase(o) {
    var v = o.vals || {}, u = o.units || { V: '', F: '' }, known = o.known || [], lab = o.labels || {};
    var W = 420, H = 260, x0 = 150, bw = 120, top = 20, tot = 200;
    var Vs = v.Vs, Vw = v.Vw, Va = v.Va;
    var hA, hW, hS;
    if (isFinite(Vs) && isFinite(Vw) && isFinite(Va) && (Vs + Vw + Va) > 0) {
      var s = Vs + Vw + Va, mn = 22;
      hA = Va > 0 ? Math.max(mn, tot * Va / s) : 0; hW = Vw > 0 ? Math.max(mn, tot * Vw / s) : 0; hS = Math.max(mn, tot * Vs / s);
      var k = tot / (hA + hW + hS); hA *= k; hW *= k; hS *= k;
    } else { hA = 55; hW = 60; hS = 85; }
    var yA = top, yW = top + hA, yS = yW + hW, yB = yS + hS;
    var mU = o.mass ? 'M' : 'W';
    function lbl(sym) {
      if (lab[sym]) return lab[sym];
      var show = o.reveal || known.indexOf(sym) >= 0;
      var nm = sym === 'W' || sym === 'Ws' || sym === 'Ww' ? (o.mass ? sym.replace('W', 'M') : sym) : sym;
      var head = nm.length > 1 ? nm[0] + '<tspan dy="3" class="sub">' + nm.slice(1) + '</tspan>' : nm;
      var close = nm.length > 1 ? '<tspan dy="-3">' : '<tspan>';
      if (!show || v[sym] === undefined || !isFinite(v[sym])) return head + close + ' = ?</tspan>';
      var unit = (sym[0] === 'V') ? u.V : u.F;
      return head + close + ' = ' + f(v[sym], 4) + ' ' + unit + '</tspan>';
    }
    var b = DEFS;
    if (hA > 0.5) b += R(x0, yA, bw, hA, 'dair' + (o.highlight === 'Va' ? ' hl' : '')) + T(x0 + bw / 2, yA + hA / 2 + 4, 'Air', 'dt in');
    if (hW > 0.5) b += R(x0, yW, bw, hW, 'dwater' + (o.highlight === 'Vw' ? ' hl' : '')) + T(x0 + bw / 2, yW + hW / 2 + 4, 'Water', 'dt in');
    b += R(x0, yS, bw, hS, 'dsolid' + (o.highlight === 'Vs' ? ' hl' : '')) + T(x0 + bw / 2, yS + hS / 2 + 4, 'Solids', 'dt in');
    // volume labels (left)
    if (hA > 0.5) b += T(x0 - 8, yA + hA / 2 + 4, lbl('Va'), 'dt sm', 'end');
    if (hW > 0.5) b += T(x0 - 8, yW + hW / 2 + 4, lbl('Vw'), 'dt sm', 'end');
    b += T(x0 - 8, yS + hS / 2 + 4, lbl('Vs'), 'dt sm', 'end');
    // brackets Vv and V
    b += Ln(x0 - 4, yA, x0 - 4, yS, 'dbr');
    b += T(16, (yA + yS) / 2 + 4, lbl('Vv'), 'dt sm', 'start');
    b += T(16, yB + 22, lbl('V'), 'dt sm b', 'start');
    // weight labels (right)
    var xr = x0 + bw + 8;
    if (hA > 0.5) b += T(xr, yA + hA / 2 + 4, (o.mass ? 'Ma' : 'Wa') + ' ≈ 0', 'dt sm muted', 'start');
    if (hW > 0.5) b += T(xr, yW + hW / 2 + 4, lbl('Ww'), 'dt sm', 'start');
    b += T(xr, yS + hS / 2 + 4, lbl('Ws'), 'dt sm', 'start');
    b += T(xr, yB + 22, lbl('W'), 'dt sm b', 'start');
    b += T(x0 - 60, 12, 'Volume', 'dt sm b') + T(x0 + bw + 60, 12, o.mass ? 'Mass' : 'Weight', 'dt sm b');
    return svg(W, H + 10, b, 'Phase diagram: volumes on the left, ' + (o.mass ? 'masses' : 'weights') + ' on the right');
  }

  /* ---------- normalised phase diagram with symbolic labels ---------- */
  function phaseNorm(o) {
    var e = o.e || 0.7, S = o.S === undefined ? 0.5 : o.S, basis = o.basis || 'Vs';
    var vals = { Vs: 1, Vw: S * e, Va: (1 - S) * e };
    var labels = basis === 'V' ? { Vs: 'Vs = 1 − n', Vv: 'Vv = n', V: 'V = 1', Vw: 'Vw = Sn', Va: 'Va', Ws: 'Ws = Gsγw(1 − n)', Ww: 'Ww = Snγw', W: 'W = Ws + Ww' }
                               : { Vs: 'Vs = 1', Vv: 'Vv = e', V: 'V = 1 + e', Vw: 'Vw = Se', Va: 'Va = (1 − S)e', Ws: 'Ws = Gsγw', Ww: 'Ww = wGsγw = Seγw', W: 'W = (1 + w)Gsγw' };
    var s = phase({ vals: vals, units: {}, labels: labels });
    var cap = '<div class="dcap">' + (basis === 'V' ? 'Sample chosen with V = 1' : 'Sample chosen with Vs = 1') + (o.e ? ' · e = ' + f(e) : '') + (o.S !== undefined ? ' · S = ' + f(S * 100) + ' %' : '') + (o.Gs ? ' · Gs = ' + o.Gs : '') + '</div>';
    return s + cap;
  }
  function phaseLabels() {
    return phase({ vals: { Vs: 1, Vw: 0.45, Va: 0.3 }, labels: { Vs: 'Vs', Vv: 'Vv', V: 'V', Vw: 'Vw', Va: 'Va', Ws: 'Ws', Ww: 'Ww', W: 'W' } });
  }

  /* ---------- relative density scale ---------- */
  function drScale(o) {
    var W = 440, H = 120, x1 = 40, x2 = 400;
    var X = function (e) { return x1 + (o.emax - e) / (o.emax - o.emin) * (x2 - x1); };
    var b = DEFS + Ln(x1, 60, x2, 60, 'dl thick');
    b += Ln(x1, 52, x1, 68) + Ln(x2, 52, x2, 68);
    b += T(x1, 45, 'emax = ' + f(o.emax), 'dt sm') + T(x1, 85, 'Dr = 0 % (loosest)', 'dt sm');
    b += T(x2, 45, 'emin = ' + f(o.emin), 'dt sm') + T(x2, 85, 'Dr = 100 % (densest)', 'dt sm');
    var bands = [[0, 0.15, 'very loose'], [0.15, 0.5, 'loose'], [0.5, 0.7, 'medium'], [0.7, 0.85, 'dense'], [0.85, 1, 'v. dense']];
    bands.forEach(function (bd, i) { var a = x1 + bd[0] * (x2 - x1), c = x1 + bd[1] * (x2 - x1); b += R(a, 96, c - a - 1, 10, 'dband b' + i) + T((a + c) / 2, 117, bd[2], 'dt xs'); });
    if (isFinite(o.e)) { var xe = X(o.e); b += '<circle cx="' + xe + '" cy="60" r="6" class="dpt"/>' + T(xe, 30, 'e = ' + f(o.e), 'dt sm b'); }
    if (isFinite(o.e2)) { var xe2 = X(o.e2); b += '<circle cx="' + xe2 + '" cy="60" r="6" class="dpt2"/>' + T(xe2, 30, 'e₂ = ' + f(o.e2), 'dt sm b'); if (isFinite(o.e)) b += arrow(X(o.e) + 8, 60, xe2 - 8, 60); }
    return svg(W, H + 5, b, 'Relative density scale from emax to emin');
  }

  /* ---------- heads at two points ---------- */
  function heads(o) {
    var W = 440, H = 280, base = 250, sc = 200 / Math.max(o.zA + o.hpA, o.zB + o.hpB, 1) ;
    var Y = function (z) { return base - z * sc; };
    var b = DEFS + R(20, Y(Math.max(o.zA, o.zB)) - 15, 400, base - Y(Math.max(o.zA, o.zB)) + 15, 'dsoil');
    b += Ln(10, base, 430, base, 'dl dash') + T(425, base - 5, 'Datum (Z = 0)', 'dt xs', 'end');
    [['A', 120, o.zA, o.hpA], ['B', 300, o.zB, o.hpB]].forEach(function (p) {
      var x = p[1], yz = Y(p[2]), yh = Y(p[2] + p[3]);
      b += R(x - 4, yh - 10, 8, yz - yh + 10, 'dpipe') + R(x - 3, yh, 6, yz - yh, 'dwater');
      b += '<circle cx="' + x + '" cy="' + yz + '" r="5" class="dpt"/>' + T(x - 12, yz + 4, p[0], 'dt b', 'end');
      b += dim(x + 22, base, x + 22, yz, 'Z' + p[0].toLowerCase() + ' = ' + f(p[2]) + ' ' + o.unit, 'r');
      b += dim(x + 22, yz, x + 22, yh, 'u/γw = ' + f(p[3]) + ' ' + o.unit, 'r');
      b += Ln(x - 30, yh, x + 10, yh, 'dl dash') + T(x - 32, yh + 4, 'h' + p[0] + ' = ' + f(p[2] + p[3]), 'dt sm b', 'end');
    });
    return svg(W, H, b, 'Elevation, pressure and total heads at points A and B');
  }

  /* ---------- Darcy tube ---------- */
  function darcy(o) {
    var W = 440, H = 220;
    var b = DEFS + R(110, 120, 220, 50, 'dsoil') + R(110, 120, 220, 50, 'dsoilpat');
    b += R(60, 128, 50, 34, 'dwater') + R(330, 128, 60, 34, 'dwater');
    b += R(80, 40, 10, 90, 'dpipe') + R(81, 50, 8, 80, 'dwater') + R(350, 40, 10, 90, 'dpipe') + R(351, 95, 8, 35, 'dwater');
    b += Ln(60, 50, 120, 50, 'dl dash') + Ln(330, 95, 380, 95, 'dl dash');
    b += dim(395, 50, 395, 95, 'Δh (head loss)', 'r') + Ln(360, 50, 400, 50, 'dl dash');
    b += dim(110, 190, 330, 190, 'L (flow length)');
    b += arrow(20, 145, 58, 145) + arrow(392, 145, 430, 145) + T(220, 112, 'soil specimen, area A', 'dt sm');
    b += T(220, 215, 'i = Δh / L,  v = k·i,  q = k·i·A', 'dt sm b');
    return svg(W, H + 5, b, 'Flow through a soil specimen with head loss Δh over length L');
  }

  /* ---------- constant head ---------- */
  function constantHead(o) {
    o = o || {}; var W = 440, H = 335;
    var b = DEFS;
    b += R(30, 30, 110, 60, 'dpipe') + R(32, 42, 106, 46, 'dwater') + T(85, 25, 'constant-level supply', 'dt xs');
    b += Ln(32, 42, 138, 42, 'dl dash') + arrow(140, 42, 165, 42) + T(170, 45, 'overflow', 'dt xs', 'start');
    b += Ln(85, 90, 85, 120, 'dpipe2') + Ln(85, 120, 200, 120, 'dpipe2');
    b += R(200, 110, 70, 140, 'dpipe') + R(205, 140, 60, 90, 'dsoil') + R(205, 140, 60, 90, 'dsoilpat') + R(205, 112, 60, 28, 'dwater') + R(205, 230, 60, 18, 'dwater');
    b += T(235, 190, 'soil', 'dt in sm');
    b += dim(285, 140, 285, 230, 'L' + (o.L ? ' = ' + o.L + ' cm' : ''), 'r');
    b += dim(205, 100, 265, 100, 'D' + (o.D ? ' = ' + f(o.D) + ' cm' : '') + ' → area A');
    b += Ln(235, 250, 235, 285, 'dpipe2') + Ln(235, 285, 340, 285, 'dpipe2');
    b += R(340, 230, 50, 80, 'dpipe') + R(342, 270, 46, 38, 'dwater') + T(365, 225, 'Q in time t', 'dt xs');
    b += Ln(20, 42, 140, 42, 'dl dash') + Ln(20, 285, 345, 285, 'dl dash');
    b += dim(22, 42, 22, 285, 'h' + (o.h ? ' = ' + o.h + ' cm' : ''), 'r');
    if (o.Q) b += T(365, 330, 'Q = ' + o.Q + ' cm³' + (o.t ? ', t = ' + o.t + ' s' : ''), 'dt xs');
    return svg(W, H + 5, b, 'Constant-head permeability test');
  }

  /* ---------- falling head ---------- */
  function fallingHead(o) {
    o = o || {}; var W = 440, H = 355, frac = o.frac;
    var y1 = 40, y2 = 120, yS = 200, yE = 290;
    var yNow = isFinite(frac) ? y1 + (y2 - y1) * frac : null;
    var b = DEFS;
    b += R(200, 20, 18, 165, 'dpipe') + R(202, yNow !== null ? yNow : y1, 14, 183 - (yNow !== null ? yNow : y1), 'dwater');
    b += T(222, 30, 'standpipe, area a' + (o.d ? ' (d = ' + f(o.d) + ' cm)' : ''), 'dt xs', 'start');
    b += R(170, 185, 78, 125, 'dpipe') + R(175, yS, 68, yE - yS, 'dsoil') + R(175, yS, 68, yE - yS, 'dsoilpat') + R(175, 187, 68, 13, 'dwater');
    b += T(209, 250, 'soil', 'dt in sm');
    b += dim(260, yS, 260, yE, 'L' + (o.L ? ' = ' + o.L + ' cm' : ''), 'r');
    b += dim(175, 340, 243, 340, 'specimen area A' + (o.D ? ' (D = ' + f(o.D) + ' cm)' : ''));
    b += Ln(209, 310, 209, 318, 'dpipe2') + Ln(60, 318, 330, 318, 'dl dash') + T(335, 321, 'outlet level', 'dt xs', 'start');
    b += Ln(130, y1, 220, y1, 'dl dash') + Ln(80, y2, 220, y2, 'dl dash');
    b += arrow(130, 180, 130, y1 + 1, 'dd') + arrow(130, 180, 130, 317, 'dd') + T(126, y1 + 14, 'h₁' + (o.h1 ? ' = ' + o.h1 + ' cm' : ''), 'dt xs', 'end') + T(126, y1 + 27, 'at t = 0', 'dt xs', 'end');
    b += arrow(85, 220, 85, y2 + 1, 'dd') + arrow(85, 220, 85, 317, 'dd') + T(81, y2 + 14, 'h₂' + (o.h2 ? ' = ' + o.h2 + ' cm' : ''), 'dt xs', 'end') + T(81, y2 + 27, 'at t' + (o.t ? ' = ' + o.t + ' s' : ''), 'dt xs', 'end');
    if (yNow !== null) b += arrow(230, yNow - 10, 230, yNow + 8) ;
    return svg(W, H, b, 'Falling-head permeability test');
  }

  /* ---------- layers ---------- */
  function layers(o) {
    var Ls = o.layers || [], W = 440, H = 260, x0 = 60, w = 260, top = 25, tot = 200;
    var Ht = Ls.reduce(function (s, l) { return s + l.H; }, 0) || 1;
    var b = DEFS, y = top;
    var kmax = Math.max.apply(null, Ls.map(function (l) { return l.k; })), kmin = Math.min.apply(null, Ls.map(function (l) { return l.k; }));
    Ls.forEach(function (l, i) {
      var h = tot * l.H / Ht;
      var shade = kmax === kmin ? 0.5 : (Math.log10(l.k) - Math.log10(kmin)) / (Math.log10(kmax) - Math.log10(kmin));
      b += R(x0, y, w, h, 'dlayer L' + Math.round(shade * 3));
      b += T(x0 + w / 2, y + h / 2 + 4, 'Layer ' + (i + 1) + ': k = ' + f(l.k, 2) + ' cm/s', 'dt sm in');
      b += T(x0 - 6, y + h / 2 + 4, 'H' + (i + 1) + ' = ' + l.H + (o.unit ? ' ' + o.unit : ''), 'dt xs', 'end');
      if (o.dir === 'H' || o.dir === 'both') b += arrow(x0 + w + 6, y + h / 2, x0 + w + 40, y + h / 2, 'da h');
      y += h;
    });
    if (o.dir === 'V' || o.dir === 'both') { b += arrow(x0 + w + 70, top, x0 + w + 70, top + tot, 'da v'); b += T(x0 + w + 78, top + tot / 2, 'flow ⟂', 'dt xs v', 'start'); }
    if (o.dir === 'H' || o.dir === 'both') b += T(x0 + w + 23, top - 8, 'flow ∥', 'dt xs h');
    b += T(220, top + tot + 25, o.dir === 'H' ? 'Parallel: same i in every layer, flows add' : o.dir === 'V' ? 'Perpendicular: same q through every layer, head losses add' : 'Parallel (→) vs perpendicular (↓) flow', 'dt sm b');
    return svg(W, H + 15, b, 'Layered soil with flow direction');
  }

  /* ---------- pumping well ---------- */
  function well(o) {
    var W = 440, H = 260, b = DEFS, base = 230, conf = o.confined;
    b += R(10, base, 420, 12, 'dimp') + T(220, base + 24, 'impermeable layer', 'dt xs');
    if (conf) { b += R(10, 120, 420, 30, 'dimp') + R(10, 150, 420, base - 150, 'dsoil') + T(400, 140, 'confining layer', 'dt xs', 'end'); }
    else b += R(10, 60, 420, base - 60, 'dsoil');
    var ytop = conf ? 70 : 80;
    var path = 'M 30 ' + ytop;
    for (var x = 30; x <= 410; x += 10) { var r = Math.abs(x - 220) + 8; var y = ytop + 70 * Math.exp(-r / 70); path += ' L ' + x + ' ' + y; }
    b += '<path d="' + path + '" class="dws"/>' + T(30, ytop - 6, conf ? 'piezometric surface' : 'water table (drawdown)', 'dt xs', 'start');
    b += R(214, 30, 12, base - 30, 'dpipe') + arrow(220, 60, 220, 20) + T(232, 18, 'q', 'dt b', 'start');
    [[330, 'r₂', 'h₂'], [395, 'r₁', 'h₁']].forEach(function (p) {
      var r = Math.abs(p[0] - 220) + 8, y = ytop + 70 * Math.exp(-r / 70);
      b += R(p[0] - 3, y - 10, 6, base - y + 10, 'dpipe');
      b += dim(p[0] + 12, base, p[0] + 12, y, p[2], 'r');
      b += dim(220, 200 - (p[0] - 330) / 3, p[0], 200 - (p[0] - 330) / 3, p[1]);
    });
    if (conf) b += dim(30, 150, 30, base, 'H', 'r');
    return svg(W, H + 20, b, (conf ? 'Confined' : 'Unconfined') + ' aquifer pumping test');
  }

  function auger() {
    var W = 440, H = 240, b = DEFS + R(10, 40, 420, 190, 'dsoil');
    b += Ln(10, 80, 430, 80, 'dws') + T(420, 74, 'water table', 'dt xs', 'end');
    b += R(190, 40, 50, 160, 'dhole') + R(190, 150, 50, 50, 'dwater') + arrow(215, 148, 215, 120);
    b += dim(255, 80, 255, 200, 'depth below WT', 'r') + dim(190, 214, 240, 214, '2r');
    b += T(120, 160, 'water seeps in', 'dt xs') + arrow(150, 170, 186, 170);
    b += T(215, 30, 'record rise of water level with time (dh/dt)', 'dt xs');
    return svg(W, H, b, 'Auger-hole test');
  }

  function seepage() {
    var W = 440, H = 170, b = DEFS + R(100, 30, 240, 100, 'dsoil');
    for (var i = 0; i < 9; i++) for (var j = 0; j < 4; j++) b += '<circle cx="' + (115 + i * 27 + (j % 2) * 12) + '" cy="' + (45 + j * 25) + '" r="11" class="dgrain"/>';
    b += arrow(20, 80, 95, 80) + T(55, 70, 'v = q/A', 'dt sm b');
    b += arrow(345, 80, 425, 80, 'da v') + T(385, 70, 'vs = v/n', 'dt sm b');
    b += T(220, 155, 'Flow area actually open to water ≈ nA → water speeds up between grains', 'dt xs');
    return svg(W, H, b, 'Discharge velocity versus seepage velocity');
  }

  function particles() {
    var W = 440, H = 170, b = DEFS, r = 14;
    for (var i = 0; i < 5; i++) for (var j = 0; j < 4; j++) b += '<circle cx="' + (30 + i * 2 * r) + '" cy="' + (30 + j * 2 * r) + '" r="' + r + '" class="dgrain"/>';
    for (i = 0; i < 6; i++) for (j = 0; j < 5; j++) b += '<circle cx="' + (250 + i * 2 * r + (j % 2) * r) + '" cy="' + (30 + j * r * 1.732) + '" r="' + r + '" class="dgrain"/>';
    b += T(90, 158, 'Loose (cubic): e ≈ 0.91', 'dt sm') + T(330, 158, 'Dense (pyramidal): e ≈ 0.35', 'dt sm');
    return svg(W, H, b, 'Loose versus dense packing of equal spheres');
  }

  function liner() {
    var W = 440, H = 270, b = DEFS, x0 = 50, y0 = 230, xw = 360, yh = 200;
    b += Ln(x0, y0, x0 + xw, y0, 'dl') + Ln(x0, y0, x0, y0 - yh, 'dl');
    b += T(x0 + xw / 2, y0 + 30, 'Moulding water content, w', 'dt sm') + '<text x="16" y="' + (y0 - yh / 2) + '" class="dt sm" transform="rotate(-90 16 ' + (y0 - yh / 2) + ')" text-anchor="middle">Dry unit weight, γd</text>';
    var curve = function (pk, wo, A, Wd) { var p = ''; for (var w = wo - Wd; w <= wo + Wd; w += 4) { var y = pk + A * Math.pow((w - wo) / Wd, 2); p += (p ? ' L ' : 'M ') + (x0 + w) + ' ' + (y0 - yh + y); } return p; };
    b += '<path d="M 150 70 L 200 52 L 330 52 L 330 150 L 260 150 Z" class="dzone"/>';
    b += '<path d="' + curve(40, 170, 80, 110) + '" class="dcurve"/>' + '<path d="' + curve(75, 210, 70, 115) + '" class="dcurve"/>' + '<path d="' + curve(105, 250, 60, 115) + '" class="dcurve"/>';
    b += '<path d="M 230 30 L 270 65 L 310 95 L 345 125" class="dl dash"/>' + T(352, 135, 'line of optimums', 'dt xs', 'start');
    b += '<path d="M 200 22 Q 300 60 410 150" class="dzav"/>' + T(410, 165, 'zero-air-voids', 'dt xs', 'end');
    b += T(260, 108, 'acceptable zone', 'dt sm b') + T(260, 122, '(k ≤ 1×10⁻⁷ cm/s, etc.)', 'dt xs');
    return svg(W, H, b, 'Schematic acceptable zone on a compaction plot');
  }

  function kScale() {
    var W = 440, H = 150, b = DEFS, x0 = 30, x1 = 410, lo = -9, hi = 2;
    var X = function (lg) { return x0 + (lg - lo) / (hi - lo) * (x1 - x0); };
    b += Ln(x0, 90, x1, 90, 'dl thick');
    for (var p = lo; p <= hi; p++) b += Ln(X(p), 85, X(p), 95) + T(X(p), 110, '10' + U.sup(p), 'dt xs');
    SM.perm.TYPICAL.forEach(function (t, i) { var a = X(Math.log10(t.lo)), c = X(Math.log10(t.hi)); b += R(a, 30 + (i % 2) * 24, c - a, 18, 'dband b' + i) + T((a + c) / 2, 43 + (i % 2) * 24, t.soil, 'dt xs'); });
    b += T(220, 135, 'Approximate hydraulic conductivity, k (cm/s) — boundaries vary between references', 'dt xs');
    return svg(W, H, b, 'Typical ranges of hydraulic conductivity');
  }

  function viscosity() {
    var W = 440, H = 200, b = DEFS, x0 = 50, y0 = 160;
    var X = function (T_) { return x0 + (T_ - 10) / 25 * 340; }, Y = function (r) { return y0 - (r - 0.7) / 0.6 * 140; };
    b += Ln(x0, y0, 400, y0) + Ln(x0, y0, x0, 15);
    var p = ''; for (var t = 10; t <= 35; t++) p += (p ? ' L ' : 'M ') + X(t) + ' ' + Y(SM.perm.etaWater(t) / SM.perm.ETA[20]);
    b += '<path d="' + p + '" class="dcurve"/>';
    [10, 15, 20, 25, 30, 35].forEach(function (t) { b += T(X(t), y0 + 15, t + '°C', 'dt xs'); });
    [0.8, 1.0, 1.2].forEach(function (r) { b += T(x0 - 6, Y(r) + 4, r.toFixed(1), 'dt xs', 'end') + Ln(x0 - 3, Y(r), x0, Y(r)); });
    b += '<circle cx="' + X(20) + '" cy="' + Y(1) + '" r="4" class="dpt"/>' + T(X(20) + 8, Y(1) - 6, 'ηT/η20 = 1 at 20 °C', 'dt xs', 'start');
    b += T(225, 195, 'Viscosity ratio ηT/η20 of water vs temperature', 'dt sm');
    return svg(W, H + 5, b, 'Viscosity ratio of water versus temperature');
  }

  function cylinder(o) {
    var W = 300, H = 220, b = DEFS + '<ellipse cx="150" cy="40" rx="60" ry="14" class="dsolid"/>' + R(90, 40, 120, 140, 'dsolid') + '<ellipse cx="150" cy="180" rx="60" ry="14" class="dsolid"/>' + '<ellipse cx="150" cy="40" rx="60" ry="14" class="dsolidtop"/>';
    b += dim(225, 40, 225, 180, 'H = ' + f(o.H) + ' ' + o.unit, 'r') + dim(90, 208, 210, 208, 'D = ' + f(o.D) + ' ' + o.unit);
    return svg(W, H + 5, b, 'Cylindrical specimen');
  }
  function ovenDry() {
    var W = 440, H = 150, b = DEFS + R(30, 40, 120, 70, 'dsoil') + R(30, 40, 120, 70, 'dsoilpat') + T(90, 130, 'moist sample: M = Ms + Mw', 'dt xs');
    b += arrow(160, 75, 270, 75) + T(215, 65, 'oven 105–110 °C', 'dt xs') + T(215, 92, 'water (Mw) driven off', 'dt xs');
    b += R(285, 50, 120, 60, 'dsolid') + T(345, 130, 'oven-dry: Ms', 'dt xs');
    return svg(W, H, b, 'Oven-drying separates water from solids');
  }
  function massWeight() {
    var W = 440, H = 130, b = DEFS + R(40, 40, 80, 50, 'dsolid') + T(80, 30, 'mass m (kg)', 'dt sm') + arrow(80, 92, 80, 125) + T(90, 118, 'W = m·g (N)', 'dt sm', 'start');
    b += T(310, 50, 'ρ = M/V (kg/m³, Mg/m³)', 'dt sm') + T(310, 75, 'γ = W/V = ρ·g (kN/m³)', 'dt sm') + T(310, 100, '1 Mg/m³ × 9.81 = 9.81 kN/m³', 'dt xs');
    return svg(W, H, b, 'Mass versus weight');
  }
  function unitWeights() {
    var W = 440, H = 190, b = DEFS, cols = [['γd', 0], ['γ', 0.5], ['γsat', 1], ['γ′', 1]];
    cols.forEach(function (c, i) {
      var x = 30 + i * 105;
      b += R(x, 60, 70, 30, 'dsolid') ;
      b += R(x, 20, 70, 40, 'dair') + (c[1] > 0 ? R(x, 20 + 40 * (1 - c[1]), 70, 40 * c[1], 'dwater') : '');
      if (i === 3) b += R(x - 5, 10, 80, 95, 'dsubmerge');
      b += T(x + 35, 120, c[0], 'dt b');
      b += T(x + 35, 138, ['S = 0', '0 < S < 1', 'S = 1', 'S = 1, under water'][i], 'dt xs');
    });
    b += T(220, 170, 'Same solids & voids; different contents and buoyancy', 'dt sm');
    return svg(W, H, b, 'Dry, moist, saturated and submerged conditions');
  }

  function render(sk) {
    if (!sk || !sk.type || sk.type === 'none') return '';
    var map = { phase: phase, phaseNorm: phaseNorm, phaseLabels: phaseLabels, drScale: drScale, heads: heads, darcy: darcy, constantHead: constantHead,
                fallingHead: fallingHead, layers: layers, well: well, auger: auger, seepage: seepage, particles: particles, liner: liner, kScale: kScale,
                viscosity: viscosity, cylinder: cylinder, ovenDry: ovenDry, massWeight: massWeight, unitWeights: unitWeights };
    return map[sk.type] ? map[sk.type](sk) : '';
  }

  SM.diagrams = { render: render, phase: phase, constantHead: constantHead, fallingHead: fallingHead, layers: layers, svg: svg };
})(typeof window !== 'undefined' ? window : globalThis);
