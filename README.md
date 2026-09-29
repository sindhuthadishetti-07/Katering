# KateringKing — Website Documentation

> **Crafted for Taste. Engineered for Elegance.**  
> Official website for KateringKing.com — a luxury Hyderabadi catering brand specialising in authentic cuisine and premium event services.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [How to Open the Website](#2-how-to-open-the-website)
3. [Project Structure](#3-project-structure)
4. [Page Sections](#4-page-sections)
5. [File Descriptions](#5-file-descriptions)
   - [index.html](#indexhtml)
   - [styles.css](#stylescss)
   - [main.js](#mainjs)
   - [Images (assets/pictrues)](#images-assetspictrues)
   - [Videos (assets/video)](#videos-assetsvideo)
6. [Navigation](#6-navigation)
7. [Design System](#7-design-system)
8. [Fonts](#8-fonts)
9. [Contact & Social Links](#9-contact--social-links)
10. [How to Make Common Updates](#10-how-to-make-common-updates)

---

## 1. Project Overview

KateringKing is a **single-page website** built with plain HTML, CSS, and JavaScript — no frameworks, no build tools, no dependencies. You can open it directly in any web browser without installing anything.

The website is designed to:
- Showcase the brand's identity and culinary heritage
- Display the full catering menu with food photography and videos
- Describe the three service offerings
- Allow visitors to get in touch via phone or WhatsApp
- Work fully on desktop, tablet, and mobile

**Technology stack:**
| Layer | Technology |
|---|---|
| Structure | HTML5 |
| Styling | CSS3 (custom properties, grid, flexbox) |
| Interactivity | Vanilla JavaScript (ES6+) |
| Fonts | Google Fonts (loaded from CDN) |
| Images | Local files + Unsplash CDN |
| Videos | Local MP4 files |

---

## 2. How to Open the Website

No installation required. Simply open the file in a browser:

1. Navigate to the `Kateringking` folder on your computer
2. Double-click `index.html`
3. The website opens in your default browser

> **For the hero video to autoplay**, open the file through a local server rather than directly from the file system. You can use the **Live Server** extension in VS Code, or any simple local server tool.

---

## 3. Project Structure

```
Kateringking/
│
├── index.html                  ← The entire website (single HTML file)
├── README.md                   ← This documentation file
│
└── assets/
    ├── css/
    │   └── styles.css          ← All styling for the website
    │
    ├── js/
    │   └── main.js             ← All interactivity and animations
    │
    ├── pictrues/               ← All image files used on the website
    │   ├── Logo.jpeg
    │   ├── Kareli roast.jpg
    │   ├── Musbi.png
    │   ├── Murgh-Musallam.jpg
    │   ├── Phatar ka gosht.jpeg
    │   ├── Warqi Samosa.jpg
    │   ├── Lukmi.png
    │   ├── Sheekh kebab.jpeg
    │   ├── Cold Fish Salad.jpeg
    │   ├── haleem.jpg
    │   ├── Malai_paya.jpg
    │   ├── shorba.jpg
    │   ├── hyderabadi-shikampuri-kebabs.jpg
    │   ├── Lagani gosht.jpeg
    │   ├── dumka ghosht.jpg
    │   ├── asif jahi.webp
    │   ├── Dum ka murgh.jpeg
    │   ├── mirchi_ka_salan.avif
    │   ├── baingan.jpg
    │   ├── Biryani.jpg
    │   ├── Double-Ka-Meetha.jpg
    │   ├── qubani-ka-meetha.jpeg
    │   ├── Badam-Kheer.jpg
    │   ├── royal_cuts.jpg
    │   ├── The-Cut-Roast.jpg
    │   ├── wedding.png
    │   ├── Corporate.png
    │   ├── private dining.png
    │   ├── About.png
    │   ├── Hospitality and Service.png
    │   ├── Warqi.jpg
    │   ├── Double_ka_meetha.jpg
    │   └── Musbi.png
    │
    └── video/                  ← All video files used on the website
        ├── hero.mp4            ← Hero section background video
        ├── kareli roast.mp4
        ├── musbi.mp4
        ├── Shaami.mp4
        ├── phatar ka gosht.mp4
        ├── Talwa ghosht.mp4
        ├── dum ka gosht.mp4
        ├── Dum ka murg.mp4
        ├── laghani ghosht.mp4
        ├── Malai paya.mp4
        ├── haleem.mp4
        ├── biryani.mp4
        ├── Badam ka kheer.mp4
        ├── muthi ke kabab.mp4
        ├── client.mp4
        └── v1.mp4
```

> **Note:** The images folder is named `pictrues` (a spelling variation). Do not rename it — the website references this exact folder name throughout.

---

## 4. Page Sections

The website is one long scrollable page. Each section has an ID that the navigation links scroll to.

| # | Section Name | ID | Description |
|---|---|---|---|
| 1 | **Hero** | `#hero` | Full-screen background video with the brand name, tagline, and two call-to-action buttons |
| 2 | **About Us** | `#about-us` | Brand origin story, founder's vision, and the educated choice — three sub-blocks |
| 3 | **Hospitality** | `#about` | "Elevating the Art of Hospitality" — the service philosophy with stats |
| 4 | **Menu** | `#menu` | The full catering menu with two tabs — The Signature Reserve and The Heritage Archive |
| 5 | **Services** | `#services` | Three service cards — Weddings, Corporate Events, and Private Dining |
| 6 | **Plan Your Event** | `#contact` | Closing call-to-action section with a phone link |

### Menu Section — Tab Structure

The menu section is divided into two tabs that the visitor can switch between:

**Tab 1 — The Signature Reserve**
- Course I: The Royal Roasts & Cuts (Kareli Roast, Musbi)
- Course II: Artisanal Bites (Warqi Samosa, Lukmi)
- Course III: The Centerpieces (Murgh Mussallam, Phattar Ka Gosht, Dum Ke Chops, Cold Fish Salads)

**Tab 2 — The Heritage Archive**
- Course I: The First Course (7 starter dishes with photos)
- Course II: The Main Course (Non-Veg Curries + Vegetarian Classics)
- Course III: The Dastarkhwan — Biryani Collection (4 biryanis, with a background image)
- Course IV: The Final Act — Desserts (Double Ka Meetha, Qubani Ka Meetha, Badam Ki Kheer with photos)

---

## 5. File Descriptions

### index.html

The entire website lives in this single file. It is structured as follows:

```
<head>          — Page metadata, font imports, stylesheet link
<header>        — Fixed navigation bar (desktop + mobile hamburger)
<div>           — Mobile menu overlay (full-screen, outside header)
<main>
  <section>     — Hero
  <section>     — About Us (#about-us)
  <section>     — Hospitality (#about)
  <section>     — Menu (#menu) with tabbed content
  <section>     — Services (#services)
  <section>     — Closing CTA (#contact)
  <a>           — Floating WhatsApp button (fixed, bottom-right)
  <a>           — Floating phone button (fixed, bottom-right above WhatsApp)
<footer>        — Logo, nav links, social icons, copyright
<script>        — Links to main.js
```

**File size:** ~47 KB

---

### styles.css

Located at `assets/css/styles.css`. This file controls the entire visual appearance of the website.

It is organised into clearly labelled sections:

| Section | What it controls |
|---|---|
| Custom Properties (`:root`) | Brand colours, fonts, spacing, transitions — change these to restyle the whole site |
| Reset & Base | Browser default resets, body font, box-sizing |
| Utility | Container, section labels, titles, scroll reveal classes |
| Buttons | `.btn-primary` (gold) and `.btn-ghost` (transparent) styles |
| Navigation | Fixed top nav, scrolled state, hamburger, mobile menu overlay |
| Hero | Full-screen video section, cinematic overlay, animated text |
| About / Hospitality | Two-column editorial layout, stats row |
| About Us | Three sub-blocks: Pioneer intro, Founder's Vision, Educated Choice + pillars |
| Menu | Tabbed interface, sticky tab bar, signature dish rows, heritage courses, biryani section, dessert cards |
| Services | Three-card grid with hover effects |
| Closing CTA | Full-screen background image section |
| Footer | Brand logo, nav links, icon row |
| Floating Buttons | WhatsApp (green) and phone (gold) fixed buttons |
| Responsive | Media queries for tablet (≤1024px), mobile (≤768px), small mobile (≤480px) |

**Colour palette** (defined as CSS variables):

| Variable | Colour | Used for |
|---|---|---|
| `--navy` | `#0D1B2A` | Primary dark background |
| `--navy-mid` | `#152233` | Cards, nav scrolled state |
| `--gold` | `#C9A84C` | Borders, icons, buttons |
| `--gold-light` | `#E2C47A` | Hover states, active tab |
| `--cream` | `#F0EBE0` | Text on dark backgrounds |
| `--ivory` | `#F5F0EA` | Light section backgrounds |
| `--silver` | `#B8C0CC` | Subtle accents |

**File size:** ~53 KB

---

### main.js

Located at `assets/js/main.js`. This file handles all page interactivity. It is split into self-contained functions:

| Function | What it does |
|---|---|
| `initNav` | Makes the navigation bar transparent over the hero and switches to a dark glass background as the user scrolls |
| `initMobileMenu` | Opens and closes the full-screen mobile navigation overlay; handles close on link click, Escape key, and window resize |
| `initSmoothScroll` | Intercepts all `href="#..."` anchor clicks and scrolls smoothly to the target section, accounting for the fixed nav height |
| `initScrollReveal` | Uses `IntersectionObserver` to fade and slide in sections and cards as they enter the viewport |
| `initMenuTabs` | Switches between the two menu tabs (Signature Reserve / Heritage Archive) and handles keyboard arrow-key navigation |
| `initVideoFallback` | Handles cases where the hero video cannot autoplay (e.g. browser policy) by hiding the video element and showing the poster image |
| `setFooterYear` | Automatically sets the copyright year in the footer |
| `initActiveNavLink` | Highlights the current section's nav link as the user scrolls |

**File size:** ~12 KB

---

### Images (`assets/pictrues`)

All images used in the website are stored here. Key images and where they appear:

| File | Used in |
|---|---|
| `Logo.jpeg` | Navigation bar and footer |
| `Kareli roast.jpg` | Signature Reserve — Royal Roasts |
| `Musbi.png` | Signature Reserve — Royal Roasts |
| `Murgh-Musallam.jpg` | Signature Reserve — Centerpieces |
| `Phatar ka gosht.jpeg` | Signature Reserve — Centerpieces |
| `Warqi Samosa.jpg` | Signature Reserve — Artisanal Bites (Warqi Samosa & Lukmi cards) |
| `Sheekh kebab.jpeg` | Signature Reserve — Artisanal Bites |
| `haleem.jpg` | Heritage Archive — First Course |
| `Malai_paya.jpg` | Heritage Archive — First Course |
| `shorba.jpg` | Heritage Archive — First Course |
| `hyderabadi-shikampuri-kebabs.jpg` | Heritage Archive — First Course |
| `Lagani gosht.jpeg` | Heritage Archive — Main Course |
| `dumka ghosht.jpg` | Heritage Archive — Main Course |
| `asif jahi.webp` | Heritage Archive — Main Course |
| `Dum ka murgh.jpeg` | Heritage Archive — Main Course |
| `mirchi_ka_salan.avif` | Heritage Archive — Main Course (Veg) |
| `baingan.jpg` | Heritage Archive — Main Course (Veg) |
| `Double-Ka-Meetha.jpg` | Heritage Archive — Final Act Desserts |
| `qubani-ka-meetha.jpeg` | Heritage Archive — Final Act Desserts |
| `Badam-Kheer.jpg` | Heritage Archive — Final Act Desserts |
| `royal_cuts.jpg` | About Us — Pioneer section |
| `wedding.png` | Services — Weddings card |
| `Corporate.png` | Services — Corporate Events card |
| `private dining.png` | Services — Private Dining card |

> Some images from Unsplash are loaded directly from their CDN (no local file needed) for sections like the hero fallback, biryani background, and closing CTA.

---

### Videos (`assets/video`)

All videos are MP4 format and play inline (autoplay, muted, looped).

| File | Used in |
|---|---|
| `hero.mp4` | Hero section — full-screen background video |
| `kareli roast.mp4` | Signature Reserve — Kareli Roast dish |
| `musbi.mp4` | Signature Reserve — Musbi dish |
| `Shaami.mp4` | Signature Reserve — Artisanal Bites |
| `phatar ka gosht.mp4` | Signature Reserve — Centerpieces |
| `Talwa ghosht.mp4` | Heritage Archive — First Course |
| `dum ka gosht.mp4` | Heritage Archive — Main Course |
| `Dum ka murg.mp4` | Heritage Archive — Main Course |
| `laghani ghosht.mp4` | Heritage Archive — Main Course |
| `Malai paya.mp4` | Heritage Archive — First Course |
| `haleem.mp4` | Heritage Archive — First Course |
| `biryani.mp4` | Heritage Archive — Biryani section |
| `Badam ka kheer.mp4` | Heritage Archive — Final Act Desserts |
| `muthi ke kabab.mp4` | Not currently in use (dish was removed) |
| `client.mp4` | Not currently assigned to a section |
| `v1.mp4` | Not currently assigned to a section |

---

## 6. Navigation

The navigation bar is **fixed** — it stays at the top of the screen as the visitor scrolls.

**Desktop navigation links:**
- **About** → scrolls to `#about-us`
- **Menu** → scrolls to `#menu`
- **Services** → scrolls to `#services`
- **Plan Your Event** → scrolls to `#contact`

**Mobile navigation:**  
On screens narrower than 768px, the desktop links are hidden and replaced by a hamburger button (☰) in the top right. Tapping it opens a full-screen overlay menu with the same links.

**Sticky menu tabs:**  
Inside the Menu section, the "The Signature Reserve" and "The Heritage Archive" tab buttons stick to the top of the screen (just below the nav bar) as the visitor scrolls through the menu. They return to normal position once the visitor scrolls past the entire menu section.

---

## 7. Design System

The website uses a consistent visual language throughout:

**Backgrounds:**
- Dark sections (Hero, Menu, Footer): `--navy` (`#0D1B2A`)
- Light sections (About, Services, About Us — Educated Choice): `--ivory` / `--warm-white`
- Warm white sections (Hospitality, About Us — Pioneer): `--warm-white`

**Typography hierarchy:**
- Page/section titles: Cormorant Garamond (serif), thin weight, large size
- Body text: Inter (sans-serif), light/regular weight
- Labels and buttons: Inter, uppercase, wide letter-spacing

**Animations:**
- All sections and cards fade and slide in when scrolled into view (`reveal-up`, `reveal-left`, `reveal-right` CSS classes, triggered by `IntersectionObserver` in `main.js`)
- Hero text animates in on page load with staggered delays
- Images scale slightly on hover
- The floating WhatsApp and phone buttons pulse with a glow animation

---

## 8. Fonts

Fonts are loaded from Google Fonts. An internet connection is required for them to display. If offline, the browser will fall back to system serif/sans-serif fonts.

| Font | Style | Used for |
|---|---|---|
| Cormorant Garamond | Serif, weights 300–700 | All headings and section titles |
| Playfair Display | Serif, weights 400 & 700 | Display headings (secondary) |
| Inter | Sans-serif, weights 300–600 | Body text, labels, buttons, nav |

---

## 9. Contact & Social Links

The following real contact details are embedded in the website:

| Type | Value | Where it appears |
|---|---|---|
| Phone | `9849090123` | Floating phone button, CTA button, footer icon |
| WhatsApp | `9849090123` | Floating WhatsApp button, footer icon |
| Instagram | `@kateringkingservices` | Footer icon |

**To update the phone number**, search for `9849090123` in `index.html` and replace all occurrences.

---

## 10. How to Make Common Updates

### Change the phone number
Open `index.html`, use Find & Replace (`Ctrl+H`), search for `9849090123` and replace with the new number. There are 6 occurrences.

### Add or replace a dish image
Place the new image file in `assets/pictrues/`, then find the relevant `<img src="...">` tag in `index.html` and update the `src` attribute.

### Add or replace a dish video
Place the new `.mp4` file in `assets/video/`, then find the relevant `<source src="...">` tag in `index.html` and update the `src` attribute.

### Change a brand colour
Open `assets/css/styles.css`, scroll to the `:root { }` block at the very top, and update the relevant CSS variable (e.g. `--gold`, `--navy`). The change applies everywhere that colour is used.

### Replace the hero video
Replace the file at `assets/video/hero.mp4` with a new MP4 file using the same filename. The website will use the new video automatically.

### Update the logo
Replace `assets/pictrues/Logo.jpeg` with a new image file using the same filename.

---

*This website was built as a pure HTML/CSS/JS project — no frameworks, no build process, no package manager. Open `index.html` in a browser and it works.*
