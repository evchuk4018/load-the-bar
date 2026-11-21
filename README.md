# Load the Bar

Simple barbell plate loading calculator, written in TypeScript.

- KG and LB modes
- Live picture of the loaded bar in competition plate colours
- Uses the fewest plates possible
- Shows the closest load when the target can't be hit exactly
- 20 kg bar in kg, 45 lb bar in lb
- Calculator tab: estimated 1RM (Epley), bodyweight multiple, DOTS and IPF GL points (GLP, classic; total and bench only)

## Use

```
npm install
npm run build
```

Then open `index.html` in a browser. To host it (e.g. GitHub Pages), publish `index.html`, `styles.css` and `dist/app.js`.

Source lives in `src/`: `units` (conversions), `plates` (plate and bar data), `solve` (plate picker), `draw` (bar picture), `state` (saved settings), `strength` (1RM, DOTS, GLP formulas), `calc` (calculator page), `main` (page wiring).
