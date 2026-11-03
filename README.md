# Soil Mechanics Study Tool — CEG 3011C (Chapters 3 & 7)

An interactive, offline study tool for Florida Atlantic University's **CEG 3011C Soil Mechanics**, covering:

- **Chapter 3: Weight–Volume Relationships**
- **Chapter 7: Permeability**

from Das & Sobhan, *Principles of Geotechnical Engineering*, 9th ed. (ISBN 9781305970939).
All explanations and problems are original. No textbook problems, problem numbers or page references are reproduced.

## Starting the tool

No installation, build step, account or AI service is needed.

1. Download or clone this repository.
2. Open **`index.html`** in a modern browser (Chrome, Edge, Firefox or Safari on Windows, macOS or Linux). Double-clicking the file is enough.

If your browser restricts local files, you can serve the folder instead:

```bash
python3 -m http.server 8000
```

Then open <http://localhost:8000>.

Progress is saved in the browser's local storage. Use **Progress → Export** to move it to another browser or computer, and **Reset** to clear it.

## What's inside

| Area | What it does |
|---|---|
| **Learn** | 30 lessons: 13 for Ch. 3, 16 for Ch. 7 and 1 linking the chapters. Each one goes concept → labelled diagram → variables and units → relationship and assumptions → worked example with no skipped algebra → your attempt → common mistakes and another try. Expandable math help covers rearranging, scientific notation, logarithms, percentages and unit conversions. |
| **Phase Lab** | A phase diagram with separate volume and weight columns. You enter the knowns, ask which unknowns can be found, then reveal each calculation one at a time. Invalid inputs (S > 100 %, Vw > Vv, Ws > W, contradictions) are kept separate from insufficient information, and missing properties are never assumed. **Explore** mode varies S, w or e and states what is held fixed; slider limits prevent contradictory states. |
| **Permeability Lab** | Constant-head and falling-head diagrams that update live with every labelled quantity (L, A, a, h, h₁, h₂, t, Q), plus a layered-soil lab that contrasts parallel and perpendicular flow. Each has *predict-before-you-calculate* questions. |
| **Practice** | 53 original problem templates (25 Ch. 3, 25 Ch. 7, 3 combined), each generating unlimited physically consistent variants in SI or US units. **Guided** mode has progressive “How do I start?” hints and per-step checks. **Independent** mode hides the solution until you submit. **Socratic** mode asks one question at a time and waits for each answer. |
| **Mixed review** | Concept questions and numerical problems in which you must pick the method first. |
| **Mock exam** | Choose chapters, difficulty, number of questions, timer and whether the formula sheet is allowed. Graded with partial credit. |
| **Mistake review** | Missed concepts grouped by error type (percent vs decimal, e vs n, ln vs log₁₀, specimen vs standpipe area, and so on), with targeted follow-up problems. |
| **Formulas / Glossary** | 59 searchable formula cards (including the textbook-style table of γ, γ<sub>d</sub> and γ<sub>sat</sub> forms), each with variables, units, assumptions, applicability and a computed example, plus a 64-term glossary. |

Every worked solution follows the same ten steps: **Given → Find → Sketch → Assumptions → Choose → Rearrange → Substitute → Calculate → Check → Interpret**.

### Answer checking

- Answers can be entered in any equivalent unit (for example k in cm/s, m/s, ft/min or m/day), as % or decimal, or in scientific notation such as `3.2e-4` or `3.2×10^-4`.
- Rounding within 1.5 % is accepted. Within 5 % earns partial credit, with a note about intermediate rounding.
- A wrong answer gets a diagnosis rather than just “incorrect”. The checker recognises percent/decimal slips, e vs n, w vs S, mass vs weight (factor g), the wrong unit weight, pressure-head vs total-head difference, q vs collected volume, swapped areas a and A, ln vs log₁₀ (factor 2.303), the wrong equivalent-k formula, unit-prefix errors (powers of 10) and diameter/radius errors.
- Partial credit is given for correct intermediate steps.

## Notation and alignment with the textbook

- **Notation follows Das & Sobhan.** The symbols are moisture content *w*, *e*, *n*, *S*, *G*<sub>s</sub>, γ, γ<sub>d</sub>, γ<sub>sat</sub>, γ′, total head *h* = *u*/γ<sub>w</sub> + *Z*, *v* = *ki*, *v*<sub>s</sub>, absolute permeability *K̄*, *k*<sub>H(eq)</sub> and *k*<sub>V(eq)</sub>.
- **Proper symbols everywhere.** Every formula or symbol in prose (problem statements, hints, feedback, lessons, formula cards, glossary, concept questions and diagram labels) is written in `$…$` markup. It renders with italics, subscripts, superscripts and Greek letters from the same symbol table as the displayed equations. See [`docs/NOTATION.md`](docs/NOTATION.md).
- **Phase diagrams follow the textbook figures.** Weights are on the left and volumes on the right. Dimension arrows for *W*<sub>w</sub>, *W*<sub>s</sub>, *V*<sub>a</sub>, *V*<sub>w</sub> and *V*<sub>s</sub> sit beside the block, with totals (*W*, *V*<sub>v</sub>, *V*) further out. Phase boundaries are dashed, water is hatched, solids are dotted, and there is an Air / Water / Solid legend. The *V*<sub>s</sub> = 1 and *V* = 1 labels use the textbook forms.
- **Problem set-ups follow the forms of the textbook's worked examples, with original numbers.** Examples:
  - a moist soil with given volume, moist weight and oven-dry weight (N, m³), then *w*, γ, γ<sub>d</sub>, *e*, *n*, *S*;
  - a field sample's masses with *G*<sub>s</sub> and *e*, then ρ, ρ<sub>d</sub> and the water to add per m³ to saturate;
  - constant-head data with *L* and *h* in mm and *t* in minutes;
  - falling-head data with areas in mm²;
  - soils in series in a tube, giving the flow rate in cm³/h;
  - flow through an inclined permeable layer;
  - normally consolidated clay with *k* = *C*₃*e*ⁿ/(1 + *e*) calibrated from two tests.

## Verification

```bash
node tests/run-tests.js
```

This runs about 214,000 assertions with no dependencies:

- Hand-calculated reference values, computed independently of the app's expression engine, for phase relations, Dr, constant- and falling-head tests, layered soils, pumping wells, temperature correction and the empirical correlations.
- Unit conversions and number parsing.
- Phase-solver boundary cases. Valid cases (e > 1, w > 100 %, S = 0) are accepted. Impossible ones (S > 100 %, negative volumes, contradictory data) are rejected. Insufficient data is reported without any assumed values.
- Every template, with 60 seeds in each unit system (6,000 problem instances), checked for:
  - physical validity of every answer;
  - acceptance of the exact answer, of 3-significant-figure rounding and of an equivalent unit;
  - rejection of a 5 % error;
  - specific feedback for each coded mistake;
  - valid hints and equation options;
  - clean diagrams;
  - cross-checks of answers against the independent phase solver and permeability functions.
- Content integrity: every lesson references real templates, every formula example evaluates, and every concept answer key is valid.

Notation is checked two ways. `node tests/lint-math.js` scans all content for formulas or symbols written as plain text, or `$…$` segments using unknown symbols; it is also run inside `run-tests.js`. `node tests/browser-notation.js` (Playwright) opens every view, every lesson and every problem template in both unit systems, with hints and solutions revealed, and checks that no plain-text symbol appears in the rendered page.

The optional browser test opens the real page in Chromium (Playwright required):

```bash
node tests/browser-smoke.js
```

It visits every view and lesson and checks that the page stays still when hints are revealed. It also checks that entries survive navigation and reload, that invalid and insufficient inputs are told apart in the Phase Lab, that the unit switch, the mock exam and mistake review work end to end, and that there is no horizontal scrolling at 375 px width.

The diagrams, displayed equations, worked solutions and answer checking all come from the **same expression string**, evaluated by one engine (`js/core/expr.js`). They cannot disagree.

## Sources

- Das, B. M. & Sobhan, K. (2018). *Principles of Geotechnical Engineering*, 9th ed., Cengage. Used to set the scope of Chapters 3 and 7.
- Cubrinovski, M. & Ishihara, K. (2002). Maximum and minimum void ratio characteristics of sands. *Soils and Foundations* 42(6). Source of the clean-sand fit emax = 0.072 + 1.53 emin.
- Chapuis, R. P. (2004). *Canadian Geotechnical Journal* 41(5): k = 2.4622[D₁₀²e³/(1+e)]^0.7825.
- Hazen (1930), k = cD₁₀²; Casagrande, k = 1.4e²k₀.₈₅; and the Kozeny–Carman proportionality k ∝ e³/(1+e).
- Taylor (1948), with Ck ≈ 0.5e₀ from Tavenas et al. (1983); Samarasinghe, Huang & Drnevich (1982); Mesri & Olson (1971).
- Daniel, D. E. & Benson, C. H. (1990). *J. Geotech. Eng.* 116(12). Source of the acceptable-zone concept, with k ≤ 1 × 10⁻⁷ cm/s.
- Lee, K. L. & Singh, A. (1971). Relative compaction correlation, R ≈ 80 + 0.2Dr.
- Water viscosity: standard reference data (IAPWS / CRC Handbook).

## Known limitations

- **No lecture slides, assignments or syllabus were supplied.** The emphasis follows the textbook chapter scope, and no instructor-specific requirements are assumed. Check symbols against your course notes.
- **Online verification was limited.** The textbook itself could not be accessed online while building this tool. Correlations are used in problems only when they were confirmed in at least two independent sources. Samarasinghe et al. (1982) is the exception: it was confirmed in one source and is used only with its exponent calibrated from two given tests.
- **Auger-hole test.** Taught conceptually only (geometry, measurements, assumptions). The shape-factor equation used in the textbook could not be verified, so no numerical auger-hole problems are generated.
- **Other emax–emin correlations.** The fits for sands with fines and the emax − emin vs D₅₀ correlation are mentioned but not used in problems.
- **Typical k ranges** by soil type are approximate; references draw the boundaries differently.
- **Hazen's constant c** is stated explicitly in each problem, because reported values vary by source.
- **Chapter 8 material** (flow nets, seepage force, and so on) is deliberately excluded.
- **Lab permeability problems** use cm and s in both unit systems, as is conventional. Field problems and Chapter 3 problems switch fully between SI and US units.
- **Progress storage.** Progress lives in one browser's local storage. In a private window it is lost when the tab closes, so export it first.
