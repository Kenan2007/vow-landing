# Vow — Landing Page

Landing page for **Vow**, an AI accountability coach that holds you to your word.

## About

Vow closes the say-do gap. It remembers what you committed to, reaches out first every morning, and won't accept the excuse you were about to make.

## Structure

```
vow-landing/
├── index.html          — full landing page
├── assets/
│   └── vow-logo.png    — liquid-glass V logo
├── styles/
│   └── vow.css         — design system (tokens, glass material, layout)
└── scripts/
    └── vow.js          — scroll reveals, parallax, glass tilt, chat demo
```

## Design System

- **Palette** — cool silver/chrome/glassy-blue canvas, accountability-orange (`#FF5A1F`) as the single signal color, green only for a kept commitment
- **Type** — Outfit (display), Space Mono (labels), Caveat (signature only)
- **Glass** — `backdrop-filter: blur(26px) saturate(1.7)` with layered specular and refraction edge pseudo-elements
- **Motion** — drifting background orbs, scroll reveals, parallax drift, cursor-tracked glass tilt/refraction, animated chat demo — all gated on `prefers-reduced-motion`

## Sections

1. **Hero** — headline + live self-running morning check-in demo
2. **The say-do gap** — competitor critique (habit trackers / journaling / gentle AI) vs. Vow
3. **How it works** — Declare → Sign → Check in → Learn
4. **The confrontation** — dark section showing Vow quoting your own words back at you
5. **Signed contract** — paper-style commitment contract with Caveat signature
6. **Behavioral DNA** — animated weekday bar chart + insight cards
7. **Pricing** — Free / CHF 15 Premium / CHF 30 Intense
8. **Footer** — compliance disclaimer (not a medical/mental-health service)

## Usage

Open `index.html` directly in a browser — no build step required. For the glass effects to render correctly, serve it over HTTP rather than the `file://` protocol:

```bash
npx serve .
# or
python -m http.server
```
