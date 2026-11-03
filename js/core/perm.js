/* Permeability (Chapter 7) calculations. All functions are unit-agnostic unless noted:
 * use one consistent unit set (e.g. cm, cm², cm³, s → k in cm/s). */
(function (root) {
  'use strict';
  var SM = root.SM = root.SM || {};

  // Dynamic viscosity of water (mPa·s) — standard reference values (IAPWS / CRC Handbook).
  var ETA = { 4: 1.5674, 5: 1.5182, 10: 1.3059, 15: 1.1375, 16: 1.1081, 17: 1.0798, 18: 1.0526, 19: 1.0266, 20: 1.0016,
              21: 0.9775, 22: 0.9544, 23: 0.9321, 24: 0.9107, 25: 0.8900, 26: 0.8701, 27: 0.8509, 28: 0.8324,
              29: 0.8145, 30: 0.7972, 35: 0.7191, 40: 0.6527 };
  function etaWater(T) {
    var keys = Object.keys(ETA).map(Number).sort(function (a, b) { return a - b; });
    if (T <= keys[0]) return ETA[keys[0]];
    if (T >= keys[keys.length - 1]) return ETA[keys[keys.length - 1]];
    for (var i = 0; i < keys.length - 1; i++) {
      var a = keys[i], b = keys[i + 1];
      if (T >= a && T <= b) return ETA[a] + (ETA[b] - ETA[a]) * (T - a) / (b - a);
    }
  }
  /** ηT/η20 (dimensionless) — rounded to 3 decimals as in printed tables */
  function etaRatio(T) { return Math.round(etaWater(T) / ETA[20] * 1000) / 1000; }

  var P = {
    totalHead: function (Z, u, gw) { return Z + u / gw; },
    gradient: function (dh, L) { return dh / L; },
    darcyQ: function (k, i, A) { return k * i * A; },
    seepageVelocity: function (v, n) { return v / n; },
    constantHeadK: function (Q, L, A, h, t) { return Q * L / (A * h * t); },
    fallingHeadK: function (a, L, A, t, h1, h2) { return 2.303 * a * L / (A * t) * Math.log10(h1 / h2); },
    fallingHeadKexact: function (a, L, A, t, h1, h2) { return a * L / (A * t) * Math.log(h1 / h2); },
    fallingHeadT: function (a, L, A, k, h1, h2) { return a * L / (A * k) * Math.log(h1 / h2); },
    fallingHeadH2: function (a, L, A, k, h1, t) { return h1 * Math.exp(-k * A * t / (a * L)); },
    k20: function (kT, T) { return kT * etaRatio(T); },
    hazen: function (c, D10mm) { return c * D10mm * D10mm; },                 // cm/s, D10 in mm
    chapuis: function (D10mm, e) { return 2.4622 * Math.pow(D10mm * D10mm * e * e * e / (1 + e), 0.7825); }, // cm/s
    casagrande: function (e, k085) { return 1.4 * e * e * k085; },
    kozenyRatio: function (e1, e2) { return (e2 * e2 * e2 / (1 + e2)) / (e1 * e1 * e1 / (1 + e1)); },
    samarasingheRatio: function (e1, e2, n) { return (Math.pow(e2, n) / (1 + e2)) / (Math.pow(e1, n) / (1 + e1)); },
    taylor: function (k0, e0, e, Ck) { return k0 * Math.pow(10, -(e0 - e) / Ck); },
    kHeq: function (layers) { var H = 0, s = 0; layers.forEach(function (l) { H += l.H; s += l.kH * l.H; }); return s / H; },
    kVeq: function (layers) { var H = 0, s = 0; layers.forEach(function (l) { H += l.H; s += l.H / l.kV; }); return H / s; },
    pumpUnconfined: function (q, r1, r2, h1, h2) { return 2.303 * q * Math.log10(r1 / r2) / (Math.PI * (h1 * h1 - h2 * h2)); },
    pumpConfined: function (q, r1, r2, h1, h2, H) { return q * Math.log10(r1 / r2) / (2.727 * H * (h1 - h2)); },
    intrinsic: function (k, eta, gw) { return k * eta / gw; },
    etaWater: etaWater, etaRatio: etaRatio, ETA: ETA,
    /** Reynolds number Re = v D ρ / η (SI: m/s, m, kg/m³, Pa·s) */
    reynolds: function (v, D, rho, eta) { return v * D * rho / eta; }
  };

  // Broad order-of-magnitude ranges (cm/s) used for plausibility checks and lessons.
  P.TYPICAL = [
    { soil: 'Clean gravel', lo: 1, hi: 100 },
    { soil: 'Coarse sand', lo: 0.01, hi: 1 },
    { soil: 'Fine sand', lo: 0.001, hi: 0.01 },
    { soil: 'Silty clay / silt', lo: 1e-5, hi: 1e-3 },
    { soil: 'Clay', lo: 1e-9, hi: 1e-6 }
  ];
  P.classify = function (kcm) {
    for (var i = 0; i < P.TYPICAL.length; i++) if (kcm >= P.TYPICAL[i].lo * 0.999) return P.TYPICAL[i].soil;
    return 'Clay (very low)';
  };

  SM.perm = P;
})(typeof window !== 'undefined' ? window : globalThis);
