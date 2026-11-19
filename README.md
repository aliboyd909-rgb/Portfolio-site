# Portfolio site

A fast, animated portfolio for photography, production and creative work. It's plain HTML, CSS and JavaScript, so there's nothing to install and no build tools to learn. It hosts for free on GitHub Pages.

**Animations included:** intro loader with counter · curtain-wipe page transitions · word-by-word headline reveals · image wipe-in on scroll · parallax heroes · custom cursor with "View / Expand" labels · animated category filters · lightbox that zooms out of the thumbnail (arrow keys and swipe work) · scrolling services marquee · circular mobile-menu reveal. All motion is toned down automatically for visitors who have "reduce motion" turned on.

---

## Adding your work (no coding needed)

Each **folder** inside `content/projects/` is one project. To add a project:

1. On GitHub, open `content/projects/`, click **Add file → Upload files**.
2. Drag in your images. To put them in a new folder, type the folder name in the path box first (e.g. `05-wedding-series/`). You can also drag a whole folder from your computer.
3. Click **Commit changes**. In about a minute the site updates itself.

That's it. The site works out the rest:

| Want to… | Do this |
|---|---|
| Set the project order | Prefix folder names with numbers: `01-…`, `02-…` |
| Set image order within a project | Name files `01.jpg`, `02.jpg`, … (they sort naturally) |
| Choose the cover image | Name one file `cover.jpg` (otherwise the first image is used) |
| Add video | Drop in `.mp4` or `.webm` files; they autoplay muted and loop |
| Add a title, description, client, etc. | Add an `info.json` file (see below) |

Supported files: `jpg`, `png`, `webp`, `avif`, `gif`, `svg`, `mp4`, `webm`, `mov`.

### Optional `info.json` for a project

```json
{
  "title": "Coastline Campaign",
  "category": "Production",
  "year": 2025,
  "client": "Brand Name",
  "role": "Director & DP",
  "description": "A short paragraph about the project.",
  "cover": "hero-shot.jpg",
  "featured": true,
  "hidden": false
}
```

Every field is optional. `category` drives the filter buttons on the Work page. `featured: false` keeps a project off the home page. `hidden: true` takes it off the site without deleting it.

### Your name, bio and contact details

Edit `content/site.json` (on GitHub, open the file and click the pencil icon). For an about-page portrait, upload an image to `content/` and set `"portrait": "content/your-photo.jpg"`.

### Image tips

- Export at about **2400px on the long edge**, JPEG quality 75–85 (or WebP). Big camera files slow the site down a lot.
- Keep videos short and compressed (under ~15 MB). For long films, link to Vimeo or YouTube in the description instead.
- Delete the four sample projects in `content/projects/` once you've added your own.

---

## Putting it online (one-time setup)

1. Merge this into your `main` branch.
2. In the repo go to **Settings → Pages**, and under *Build and deployment → Source* choose **GitHub Actions**.
3. Push or upload anything (or run the workflow from the **Actions** tab). Your site will be live at `https://<your-username>.github.io/<repo-name>/`.

Custom domain: add it in **Settings → Pages → Custom domain**.

## Previewing on your computer

```bash
node scripts/build-manifest.mjs   # re-scan content/projects after adding files
python3 -m http.server 8000       # then open http://localhost:8000
```

(Opening `index.html` by double-clicking won't work, because browsers block it from loading the content files.)

## Changing the look

Colours and fonts are set at the top of `css/style.css` (`--bg`, `--fg`, `--accent`, `--font-display`, …). For a light theme, try `--bg: #f3f1ec; --fg: #151513;`.

## Files

```
index.html                  page shell
css/style.css               all styles and animations
js/app.js                   pages, transitions, cursor, lightbox
content/site.json           your name, bio, contact, socials
content/projects/*/         one folder per project (images + optional info.json)
content/manifest.json       generated automatically; don't edit by hand
scripts/build-manifest.mjs  makes manifest.json from the folders
.github/workflows/deploy.yml  rebuilds and publishes on every push to main
```
