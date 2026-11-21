# Load the Bar

Simple barbell plate loading calculator, written in TypeScript.

- KG and LB modes
- Live picture of the loaded bar in competition plate colours
- Uses the fewest plates possible
- Shows the closest load when the target can't be hit exactly
- 20 kg bar in kg, 45 lb bar in lb
- Calculator tab: squat, bench and deadlift with reps (Epley 1RM) add up to a total; typing a total spreads it over the lifts within typical ratios. Shows bodyweight multiple, DOTS and IPF GL points (GLP, men's classic). Tap a field's unit to switch just that field between kg and lb
- Projection tab: log squat, bench and deadlift sets by date. Each day's best set (Epley 1RM) feeds a straight-line trend, weighted toward recent weeks, which gives your 1RM today, your monthly rate and the projected 1RM on any date you pick, drawn as a chart

## Use

```
npm install
npm run build
```

Then open `index.html` in a browser. To host it (e.g. GitHub Pages), publish `index.html`, `styles.css` and `dist/app.js`.

Source lives in `src/`: `units` (conversions), `plates` (plate and bar data), `solve` (plate picker), `draw` (bar picture), `state` (saved settings), `strength` (1RM, DOTS, GLP, total split), `calc` (calculator page), `log` (logged sets), `project` (trend fit), `projchart` (trend chart), `projpage` (projection page), `main` (page wiring).
