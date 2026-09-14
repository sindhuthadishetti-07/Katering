# KateringKing — Premium Landing Page

## Project Structure

```
Kateringking/
├── index.html
├── assets/
│   ├── css/
│   │   └── styles.css
│   ├── js/
│   │   └── main.js
│   ├── images/
│   │   ├── hero-fallback.jpg      ← Hero section fallback image
│   │   ├── about.jpg              ← About section image
│   │   ├── menu-roasts.jpg        ← Menu card: Royal Roasts
│   │   ├── menu-bites.jpg         ← Menu card: Artisanal Bites
│   │   ├── menu-centerpiece.jpg   ← Menu card: Centerpieces
│   │   ├── biryani-bg.jpg         ← Biryani section background
│   │   ├── service-wedding.jpg    ← Services: Weddings
│   │   ├── service-corporate.jpg  ← Services: Corporate
│   │   ├── service-private.jpg    ← Services: Private Dining
│   │   └── cta-bg.jpg             ← Closing CTA background
│   └── video/
│       └── hero.mp4               ← Hero background video
└── README.md
```

## Adding Images

All images fall back gracefully if missing (gradient placeholder).

**Recommended free sources:**
- [Pexels](https://www.pexels.com) — search "biryani", "Indian food", "catering"
- [Unsplash](https://unsplash.com) — search "Hyderabadi cuisine", "luxury dining"
- [Pixabay](https://pixabay.com)

**Recommended image sizes:**
| File | Recommended size |
|---|---|
| hero-fallback.jpg | 1920×1080 |
| about.jpg | 800×1000 |
| menu-roasts/bites/centerpiece.jpg | 800×600 |
| biryani-bg.jpg | 1600×900 |
| service-*.jpg | 1200×675 |
| cta-bg.jpg | 1920×1080 |

## Adding the Hero Video

Place your video at `assets/video/hero.mp4`.

**Free cinematic food video sources:**
- [Pexels Videos](https://www.pexels.com/search/videos/biryani/) — search "biryani", "Indian cooking", "kebab"
- [Pixabay Videos](https://pixabay.com/videos/)
- [Coverr](https://coverr.co)

**Video requirements:**
- Format: MP4 (H.264)
- Resolution: 1920×1080 recommended
- Duration: 15–60 seconds, loopable

## Customisation

- **Contact**: Add your real contact details in the footer and CTA section of `index.html`.
- **Colours**: Adjust `--gold`, `--cream`, `--charcoal` custom properties in `styles.css`.
- **Fonts**: Loaded from Google Fonts — swap in `index.html` `<head>` if needed.
