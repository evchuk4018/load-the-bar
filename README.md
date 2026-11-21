# Load the Bar

Simple barbell plate loading calculator, written in TypeScript.

- KG and LB modes
- Live picture of the loaded bar in competition plate colours
- Uses the fewest plates possible
- Shows the closest load when the target can't be hit exactly
- 20 kg bar in kg, 45 lb bar in lb
- Calculator tab: squat, bench and deadlift with reps (Epley 1RM) add up to a total; typing a total spreads it over the lifts within typical ratios. Shows bodyweight multiple, DOTS and IPF GL points (GLP, men's classic). Tap a field's unit to switch just that field between kg and lb
- History tab: a workout log. Opens on today with last week's same-day workout in grey; add exercises from a searchable library (no duplicates), sets with weight, reps and RPE, notes, and a check mark per set. Everything autosaves — to the viewer's private Claude artifact database when running as the artifact, otherwise to this browser. The X opens a month calendar of past and planned workouts

## Use

```
npm install
npm run build
```

Then open `index.html` in a browser. To host it (e.g. GitHub Pages), publish `index.html`, `styles.css` and `dist/app.js`.

Source lives in `src/`: `units` (conversions), `plates` (plate and bar data), `solve` (plate picker), `draw` (bar picture), `state` (saved settings), `strength` (1RM, DOTS, GLP, total split), `calc` (calculator page), `main` (page wiring). The workout log is in `src/workout/`: `dates`, `store` (Claude db / localStorage autosave), `ghost` (last week's values), `picker` (exercise search), `day` (day log), `calendar`, `index` (wiring).
