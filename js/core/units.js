/* Units, unit systems and number formatting.
 * Every unit is stored as a factor to a coherent SI base for its dimension.
 * Ratio quantities (w, n, S, Dr, R) are stored as decimals; '%' is a unit with factor 0.01. */
(function (root) {
  'use strict';
  var SM = root.SM = root.SM || {};

  var G = 9.81;               // m/s^2, used for mass -> weight in SI problems
  var G_US = 32.174;          // ft/s^2 (lbm -> lbf is 1:1 at standard gravity)

  var DIMS = {
    length:   { m: 1, cm: 0.01, mm: 0.001, km: 1000, ft: 0.3048, 'in': 0.0254 },
    area:     { 'm²': 1, 'cm²': 1e-4, 'mm²': 1e-6, 'ft²': 0.09290304, 'in²': 0.00064516 },
    volume:   { 'm³': 1, 'cm³': 1e-6, L: 1e-3, mL: 1e-6, 'ft³': 0.028316846592, 'in³': 1.6387064e-5, gal: 0.003785411784 },
    force:    { N: 1, kN: 1000, lb: 4.4482216152605, kip: 4448.2216152605 },
    mass:     { kg: 1, g: 0.001, Mg: 1000, lbm: 0.45359237 },
    unitWeight: { 'kN/m³': 1000, 'N/m³': 1, 'lb/ft³': 157.08746384, 'kip/ft³': 157087.46384 },
    density:  { 'kg/m³': 1, 'g/cm³': 1000, 'Mg/m³': 1000, 'lbm/ft³': 16.01846337 },
    velocity: { 'm/s': 1, 'cm/s': 0.01, 'mm/s': 0.001, 'm/min': 1 / 60, 'm/day': 1 / 86400, 'ft/s': 0.3048, 'ft/min': 0.3048 / 60, 'ft/day': 0.3048 / 86400 },
    flow:     { 'm³/s': 1, 'cm³/s': 1e-6, 'L/s': 1e-3, 'L/min': 1e-3 / 60, 'm³/min': 1 / 60, 'm³/h': 1 / 3600, 'm³/day': 1 / 86400,
                'ft³/s': 0.028316846592, 'ft³/min': 0.028316846592 / 60, 'ft³/day': 0.028316846592 / 86400, 'gal/min': 0.003785411784 / 60 },
    time:     { s: 1, min: 60, h: 3600, day: 86400 },
    pressure: { kPa: 1000, Pa: 1, 'kN/m²': 1000, psf: 47.880258980, psi: 6894.7572932, 'lb/ft²': 47.880258980, 'lb/in²': 6894.7572932 },
    viscosity:{ 'Pa·s': 1, 'N·s/m²': 1, 'g/(cm·s)': 0.1, poise: 0.1, cP: 0.001 },
    permeability: { 'm²': 1, 'cm²': 1e-4, darcy: 9.869233e-13 },
    transmissivity: { 'm²/s': 1, 'm²/day': 1 / 86400, 'ft²/day': 0.09290304 / 86400, 'ft²/min': 0.09290304 / 60, 'cm²/s': 1e-4 },
    temperature: { '°C': 1 },
    ratio:    { decimal: 1, '%': 0.01 },
    none:     { '': 1 }
  };

  // Unique lookup symbol -> dimension.  Area/permeability share m²/cm²: permeability is only
  // reached through an explicit dim argument.
  var UNIT_DIM = {};
  Object.keys(DIMS).forEach(function (d) {
    if (d === 'permeability' || d === 'transmissivity') return;
    Object.keys(DIMS[d]).forEach(function (u) { if (!(u in UNIT_DIM)) UNIT_DIM[u] = d; });
  });

  var SYSTEMS = {
    SI: { id: 'SI', label: 'SI', gw: 9.81, gwUnit: 'kN/m³',
          base: { length: 'm', area: 'm²', volume: 'm³', force: 'kN', unitWeight: 'kN/m³', mass: 'kg',
                  density: 'kg/m³', velocity: 'cm/s', flow: 'cm³/s', pressure: 'kPa', time: 's' } },
    US: { id: 'US', label: 'US customary', gw: 62.4, gwUnit: 'lb/ft³',
          base: { length: 'ft', area: 'ft²', volume: 'ft³', force: 'lb', unitWeight: 'lb/ft³', mass: 'lbm',
                  density: 'lbm/ft³', velocity: 'ft/min', flow: 'ft³/min', pressure: 'lb/ft²', time: 's' } }
  };

  // Units offered in answer boxes for each dimension, per system (first = preferred)
  var CHOICES = {
    SI: { length: ['m', 'cm', 'mm', 'ft', 'in'], area: ['m²', 'cm²', 'mm²', 'ft²', 'in²'], volume: ['m³', 'cm³', 'L', 'mL', 'ft³'],
          force: ['kN', 'N', 'lb'], mass: ['kg', 'g', 'Mg', 'lbm'], unitWeight: ['kN/m³', 'N/m³', 'lb/ft³'], density: ['kg/m³', 'g/cm³', 'Mg/m³'],
          velocity: ['cm/s', 'm/s', 'mm/s', 'm/day', 'ft/min', 'ft/day'], flow: ['cm³/s', 'm³/s', 'L/s', 'L/min', 'm³/h', 'm³/day', 'ft³/min'],
          time: ['s', 'min', 'h', 'day'], pressure: ['kPa', 'Pa', 'psf'], viscosity: ['Pa·s', 'g/(cm·s)', 'cP'],
          permeability: ['cm²', 'm²', 'darcy'], transmissivity: ['m²/day', 'm²/s', 'ft²/day'], ratio: ['%', 'decimal'], none: [''], temperature: ['°C'] },
    US: { length: ['ft', 'in', 'm', 'cm'], area: ['ft²', 'in²', 'm²', 'cm²'], volume: ['ft³', 'in³', 'gal', 'm³', 'cm³'],
          force: ['lb', 'kip', 'kN'], mass: ['lbm', 'kg', 'g'], unitWeight: ['lb/ft³', 'kN/m³'], density: ['lbm/ft³', 'kg/m³', 'g/cm³'],
          velocity: ['ft/min', 'ft/s', 'ft/day', 'cm/s', 'm/s'], flow: ['ft³/min', 'ft³/s', 'ft³/day', 'gal/min', 'cm³/s', 'm³/s'],
          time: ['s', 'min', 'h', 'day'], pressure: ['lb/ft²', 'psi', 'kPa'], viscosity: ['Pa·s', 'g/(cm·s)', 'cP'],
          permeability: ['cm²', 'm²', 'darcy'], transmissivity: ['ft²/day', 'ft²/min', 'm²/day'], ratio: ['%', 'decimal'], none: [''], temperature: ['°C'] }
  };

  function dimOf(unit) {
    if (unit === undefined || unit === null) return 'none';
    if (unit === '') return 'none';
    return UNIT_DIM[unit] || null;
  }

  function factor(unit, dim) {
    dim = dim || dimOf(unit);
    if (!dim || !DIMS[dim] || !(unit in DIMS[dim])) throw new Error('Unknown unit "' + unit + '" for dimension ' + dim);
    return DIMS[dim][unit];
  }

  /** Convert value from one unit to another of the same dimension. */
  function convert(value, from, to, dim) {
    if (from === to) return value;
    var d = dim || dimOf(from);
    var d2 = dim || dimOf(to);
    if (d !== d2) throw new Error('Cannot convert ' + from + ' to ' + to + ' (different dimensions)');
    return value * factor(from, d) / factor(to, d);
  }

  /** mass (any mass unit) -> weight in the given force unit, W = m g */
  function massToWeight(m, massUnit, forceUnit) {
    var kg = m * factor(massUnit, 'mass');
    var N = kg * G;
    return N / factor(forceUnit, 'force');
  }
  function densityToUnitWeight(rho, densUnit, uwUnit) {
    var kgm3 = rho * factor(densUnit, 'density');
    return kgm3 * G / factor(uwUnit, 'unitWeight');
  }

  /* ---------- number formatting ---------- */
  var SUP = { '-': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' };
  function sup(s) { return String(s).split('').map(function (c) { return SUP[c] || c; }).join(''); }

  /** Format to `sig` significant figures; scientific (×10ⁿ) for very small/large numbers. */
  function fmt(x, sig) {
    if (sig === undefined) sig = 4;
    if (x === null || x === undefined || !isFinite(x)) return '—';
    if (x === 0) return '0';
    var ax = Math.abs(x);
    if (ax < 1e-3 || ax >= 1e6) {
      var ex = Math.floor(Math.log10(ax));
      var mant = x / Math.pow(10, ex);
      var ms = Number(mant.toPrecision(sig));
      if (Math.abs(ms) >= 10) { ms = ms / 10; ex += 1; }
      return trimZeros(ms.toPrecision(sig)) + ' × 10' + sup(ex);
    }
    var s = Number(x.toPrecision(sig));
    // avoid exponent strings from toPrecision for large integers
    var digits = Math.max(0, sig - 1 - Math.floor(Math.log10(ax)));
    return trimZeros(s.toFixed(Math.min(digits, 10)));
  }
  function trimZeros(s) {
    if (s.indexOf('e') >= 0) return s;
    if (s.indexOf('.') < 0) return s;
    return s.replace(/(\.\d*?[1-9])0+$/, '$1').replace(/\.0+$/, '');
  }
  /** Keep trailing zeros (for given data, e.g. 2.70). */
  function fmtFixedSig(x, sig) {
    if (!isFinite(x)) return '—';
    if (x === 0) return '0';
    var ax = Math.abs(x);
    if (ax < 1e-3 || ax >= 1e6) return fmt(x, sig);
    var digits = Math.max(0, sig - 1 - Math.floor(Math.log10(ax)));
    return x.toFixed(Math.min(digits, 10));
  }
  /** Round a number to n significant figures (numeric). */
  function roundSig(x, n) {
    if (x === 0 || !isFinite(x)) return x;
    return Number(x.toPrecision(n));
  }
  function roundTo(x, dp) { var f = Math.pow(10, dp); return Math.round(x * f) / f; }

  /** Format a quantity in a unit; ratio units print as % or decimal. */
  function fmtQ(value, unit, sig) {
    if (unit === '%') return fmt(value * 100, sig || 4) + ' %';
    if (unit === 'decimal' || unit === '' || unit === undefined) return fmt(value, sig || 4);
    return fmt(value, sig || 4) + ' ' + unit;
  }

  /** Parse a user-typed number: accepts 1.2e-4, 1.2E-4, 1.2×10^-4, 1.2x10-4, 1.2*10^(-4), commas as thousand separators, unicode minus. */
  function parseNumber(str) {
    if (str === null || str === undefined) return NaN;
    var s = String(str).trim();
    if (!s) return NaN;
    s = s.replace(/[−–]/g, '-').replace(/\s+/g, '');
    s = s.replace(/⁻/g, '-').replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹]/g, function (c) { return '⁰¹²³⁴⁵⁶⁷⁸⁹'.indexOf(c); });
    // thousand separators like 1,234.5 (only when pattern matches)
    if (/^-?\d{1,3}(,\d{3})+(\.\d+)?$/.test(s)) s = s.replace(/,/g, '');
    else if (/^-?\d+,\d+$/.test(s)) s = s.replace(',', '.'); // decimal comma
    var m = s.match(/^([-+]?\d*\.?\d+)(?:[x×*·]10\^?\(?([-+]?\d+)\)?)$/i);
    if (m) return parseFloat(m[1]) * Math.pow(10, parseInt(m[2], 10));
    m = s.match(/^10\^?\(?([-+]?\d+)\)?$/);
    if (m && s.indexOf('^') >= 0) return Math.pow(10, parseInt(m[1], 10));
    if (/^[-+]?(\d+\.?\d*|\.\d+)(e[-+]?\d+)?$/i.test(s)) return parseFloat(s);
    return NaN;
  }

  SM.units = {
    G: G, G_US: G_US, DIMS: DIMS, SYSTEMS: SYSTEMS, CHOICES: CHOICES,
    dimOf: dimOf, factor: factor, convert: convert, massToWeight: massToWeight, densityToUnitWeight: densityToUnitWeight,
    fmt: fmt, fmtFixedSig: fmtFixedSig, fmtQ: fmtQ, roundSig: roundSig, roundTo: roundTo, parseNumber: parseNumber, sup: sup,
    choices: function (dim, sys) { return (CHOICES[sys || 'SI'][dim] || [''] ).slice(); }
  };
})(typeof window !== 'undefined' ? window : globalThis);
