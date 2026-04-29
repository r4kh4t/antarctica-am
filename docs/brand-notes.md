# Brand Notes

## Typography

Antarctica Asset Management's public site appears to use Gotham. Gotham is a commercial typeface, so this repository does not bundle the font file. The app uses a Gotham-first CSS stack:

```css
"Gotham", "Gotham SSm", "Montserrat", "Avenir Next", "Helvetica Neue", Arial, sans-serif
```

If Gotham is installed or provided through a licensed webfont, the app will use it. Otherwise it falls back to visually similar geometric sans-serif fonts.

## Palette

The palette is derived from the Antarctica logo and public site styling:

- Ink: `#050505`
- Charcoal: `#1F2528`
- Ice blue: `#B7D5EB`
- Muted ice: `#D8EAF6`
- Ice light: `#EEF7FC`
- Stone: `#F5F3EF`
- Line: `#D8D8D2`

The UI uses black and stone as the primary surface system, with ice blue as the main brand accent.

## Favicon

`public/favicon.svg` is a simplified SVG mark based on the layered Antarctica mountain motif in the provided logo asset.
