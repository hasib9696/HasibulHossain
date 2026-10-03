# Hasibul Hossain — Portfolio

A fast, dependency-free personal portfolio (plain HTML, CSS and JavaScript — no build step).

## Run it

- **Simplest:** double-click `index.html`. Everything works straight from disk.
- **Publish:** upload the whole folder to any static host (GitHub Pages, Netlify, Vercel, Cloudflare Pages). No configuration needed.

## Project structure

```
index.html          Page structure (sections, navbar, footer)
css/styles.css      All styling — colours/fonts are tokens at the top
js/content.js       ★ ALL YOUR CONTENT — the only file you normally edit
js/components.js    Reusable cards (skills, projects, experience, education…)
js/main.js          Rendering, theme toggle, navigation, filters, contact form
js/hero3d.js        Lightweight 3D hero object (canvas, no libraries)
assets/             Your real images, videos, certificates and CV
favicon.svg         Site icon
```

## Updating content (all in `js/content.js`)

**Add a project** — put the file in `assets/projects/`, then add to `projects: [ ... ]`:

```js
{
  title: "Coffee shop ad concept",
  description: "AI-generated ad visual exploring warm product lighting.",
  category: "ai-ads",                 // ai-ads | ai-visuals | websites | experiments
  media: { type: "image", src: "assets/projects/coffee-ad.jpg", alt: "Coffee cup ad with warm light", aspect: "portrait" },
  tools: [],                          // only tools you actually used
  details: "",                        // optional, shown in the details pop-up
  link: { url: "", label: "" },       // optional
  featured: false
}
```

For a video: `media: { type: "video", src: "assets/projects/clip.mp4", poster: "assets/projects/clip.jpg", alt: "…", aspect: "story" }`.
As soon as one project exists, the "work in progress" placeholder disappears automatically.

**Profile photo** — `profile.photo.src = "assets/images/profile.jpg"`.

**CV** — `cv: "assets/cv/Hasibul-Hossain-CV.pdf"`. The *Download CV* button appears automatically.

**Social links** — fill in `url` for the platforms you use. Empty ones are never shown.

**Certificates / achievements** — add items to `achievements`. The section and its nav link stay hidden while the list is empty.

**Skills / services** — add items to a `skills` group; `status: "learning"` marks a developing skill.

## Contact form — what needs connecting

No email service is connected, so the form **does not send messages by itself**. Right now it
validates the input and opens the visitor's own email app with the message pre-filled
(the page says this clearly).

To send directly from the website:
1. Create a free form at <https://formspree.io> (or a similar service) using your email.
2. Copy its endpoint, e.g. `https://formspree.io/f/abcdwxyz`.
3. Paste it into `contactForm.endpoint` in `js/content.js`.

## Before going live

- Add the live URL and a 1200×630 preview image (`assets/images/og-image.jpg`) to the commented
  Open Graph tags in `index.html`.
