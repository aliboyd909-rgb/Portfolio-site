// Portfolio — single-page app with animated transitions. No build step needed.
// Content comes from content/site.json and content/manifest.json.

const app = document.getElementById("app");
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;
const wait = (ms) => new Promise((r) => setTimeout(r, reduceMotion ? 0 : ms));

let site = {};
let projects = [];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const esc = (s = "") =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

// Wrap each word so it can slide up from a mask. *word* renders in italic accent.
function split(text, delay = 0) {
  let i = 0;
  const words = esc(text).split(/\s+/).filter(Boolean).map((w) => {
    const html = w.replace(/\*(.+?)\*/g, "<em>$1</em>");
    return `<span class="w"><span style="--i:${i++}">${html}</span></span>`;
  });
  return `<span class="split" style="--d:${delay}ms">${words.join(" ")}</span>`;
}

function media(m, { alt = "", eager = false } = {}) {
  if (!m) return "";
  if (m.type === "video") return `<video src="${m.src}" muted loop playsinline autoplay preload="metadata"></video>`;
  return `<img src="${m.src}" alt="${esc(alt)}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async" />`;
}

const footer = () => `
  <footer class="footer">
    <span>© ${new Date().getFullYear()} ${esc(site.name)}</span>
    <span>${(site.socials || []).map((s) => `<a href="${esc(s.url)}" target="_blank" rel="noopener" data-cursor="">${esc(s.label)}</a>`).join(" &nbsp;·&nbsp; ")}</span>
  </footer>`;

// ---------------------------------------------------------------------------
// Views
// ---------------------------------------------------------------------------
const views = {
  home() {
    const featured = projects.filter((p) => p.featured).slice(0, 6);
    const services = site.services?.length ? site.services : ["Photography", "Production"];
    const marquee = [...services, ...services, ...services, ...services].map((s) => `<span>${esc(s)}</span>`).join("");
    return {
      label: "Home",
      html: `
      <section class="hero">
        ${projects[0] ? `<div class="hero__bg" data-parallax="0.3">${media(projects[0].cover, { eager: true })}</div>` : ""}
        <p class="eyebrow" data-reveal>${esc(site.tagline)}</p>
        <h1 class="display hero__title">${split(site.name, 200)}</h1>
        <div class="hero__row">
          <p class="hero__intro" data-reveal style="--d:500ms">${esc(site.intro)}</p>
          <span class="hero__scroll eyebrow" data-reveal style="--d:700ms">Scroll</span>
        </div>
      </section>
      <div class="marquee" aria-hidden="true"><div class="marquee__track">${marquee}</div></div>
      <section class="section">
        <div class="section__head">
          <h2 class="display section__title">${split("Selected *work*")}</h2>
          <a class="btn-link" href="#work" data-cursor="">All projects</a>
        </div>
        <div class="featured">
          ${featured.map((p, i) => `
            <a class="feature" href="#project-${p.slug}" data-cursor="View">
              <div class="feature__media img-wipe">${media(p.cover, { alt: p.title })}</div>
              <div class="feature__info" data-reveal style="--d:200ms">
                <span class="feature__num">${String(i + 1).padStart(2, "0")}</span>
                <h3 class="display feature__title">${esc(p.title)}</h3>
                <p class="eyebrow">${esc(p.category)} — ${esc(p.year)}</p>
              </div>
            </a>`).join("")}
        </div>
      </section>
      ${footer()}`,
    };
  },

  work(params) {
    const cats = ["All", ...new Set(projects.map((p) => p.category))];
    const active = "All";
    return {
      label: "Work",
      html: `
      <section class="page-head">
        <p class="eyebrow" data-reveal>${projects.length} projects</p>
        <h1 class="display page-head__title">${split("*Work*")}</h1>
        <div class="filters" data-reveal style="--d:300ms">
          ${cats.map((c) => `<button data-filter="${esc(c)}" class="${c === active ? "is-active" : ""}" data-cursor="">${esc(c)}<sup>${c === "All" ? projects.length : projects.filter((p) => p.category === c).length}</sup></button>`).join("")}
        </div>
      </section>
      <section class="grid">
        ${projects.map((p, i) => `
          <a class="card ${active !== "All" && p.category !== active ? "is-filtered" : ""}" href="#project-${p.slug}" data-category="${esc(p.category)}" data-cursor="View" data-reveal style="--d:${(i % 3) * 120}ms">
            <div class="card__media">${media(p.cover, { alt: p.title })}</div>
            <div class="card__meta"><span class="card__title">${esc(p.title)}</span><span class="eyebrow">${esc(p.year)}</span></div>
            <span class="eyebrow">${esc(p.category)}</span>
          </a>`).join("")}
      </section>
      ${footer()}`,
      mount() {
        const buttons = app.querySelectorAll("[data-filter]");
        const cards = [...app.querySelectorAll(".card")];
        buttons.forEach((btn) => btn.addEventListener("click", () => {
          buttons.forEach((b) => b.classList.toggle("is-active", b === btn));
          filterCards(cards, btn.dataset.filter);
        }));
      },
    };
  },

  project(params, slug) {
    const idx = projects.findIndex((p) => p.slug === slug);
    if (idx < 0) return views.notFound();
    const p = projects[idx];
    const next = projects[(idx + 1) % projects.length];
    const meta = [["Client", p.client], ["Role", p.role], ["Category", p.category], ["Year", p.year]].filter(([, v]) => v);
    return {
      label: p.title,
      html: `
      <section class="project-hero">
        <div class="project-hero__media" data-parallax="0.4">${media(p.cover, { alt: p.title, eager: true })}</div>
        <h1 class="display project-hero__title">${split(p.title, 300)}</h1>
      </section>
      <section class="project-info">
        <div class="project-info__meta">
          ${meta.map(([k, v], i) => `<div data-reveal style="--d:${i * 100}ms"><span class="eyebrow">${k}</span><br />${esc(v)}</div>`).join("")}
        </div>
        ${p.description ? `<p class="project-info__desc" data-reveal>${esc(p.description)}</p>` : ""}
      </section>
      <section class="gallery">
        ${p.media.map((m, i) => `
          <button class="gallery__item img-wipe" data-index="${i}" data-cursor="${m.type === "video" ? "Play" : "Expand"}" aria-label="Open image ${i + 1}">
            ${media(m, { alt: `${p.title} — ${i + 1}` })}
          </button>`).join("")}
      </section>
      ${next && next !== p ? `
      <a class="next-project" href="#project-${next.slug}" data-cursor="Next">
        <div class="next-project__img">${media(next.cover)}</div>
        <span class="eyebrow">Next project</span>
        <h2 class="display next-project__title">${esc(next.title)}</h2>
      </a>` : ""}
      ${footer()}`,
      mount() {
        app.querySelectorAll(".gallery__item").forEach((el) =>
          el.addEventListener("click", () => lightbox.open(p.media, +el.dataset.index, el)));
      },
    };
  },

  about() {
    return {
      label: "About",
      html: `
      <section class="page-head">
        <p class="eyebrow" data-reveal>${esc(site.location)}</p>
        <h1 class="display page-head__title">${split("*About*")}</h1>
      </section>
      <section class="about">
        <div class="about__portrait img-wipe">${site.portrait ? `<img src="${esc(site.portrait)}" alt="${esc(site.name)}" />` : media(projects[0]?.cover)}</div>
        <div class="about__body">
          ${(site.about || []).map((t, i) => `<p data-reveal style="--d:${i * 120}ms">${esc(t)}</p>`).join("")}
          <div class="about__lists" data-reveal>
            ${site.services?.length ? `<div><span class="eyebrow">Services</span><ul>${site.services.map((s) => `<li>${esc(s)}</li>`).join("")}</ul></div>` : ""}
            ${site.clients?.length ? `<div><span class="eyebrow">Selected clients</span><ul>${site.clients.map((s) => `<li>${esc(s)}</li>`).join("")}</ul></div>` : ""}
          </div>
          <p style="margin-top:3rem" data-reveal><a class="btn-link" href="#contact" data-cursor="">Get in touch</a></p>
        </div>
      </section>
      ${footer()}`,
    };
  },

  contact() {
    return {
      label: "Say hello",
      html: `
      <section class="contact">
        <p class="eyebrow" data-reveal>Have a project in mind?</p>
        <h1 class="display page-head__title">${split("Let's *talk*")}</h1>
        <div data-reveal style="--d:300ms"><a class="contact__email" href="mailto:${esc(site.email)}" data-cursor="Email">${esc(site.email)}</a></div>
        <div class="socials" data-reveal style="--d:450ms">
          ${(site.socials || []).map((s) => `<a class="btn-link" href="${esc(s.url)}" target="_blank" rel="noopener" data-cursor="">${esc(s.label)}</a>`).join("")}
        </div>
      </section>
      ${footer()}`,
    };
  },

  notFound() {
    return { label: "Lost", html: `<section class="contact"><h1 class="display page-head__title">${split("Page not *found*")}</h1><p data-reveal><a class="btn-link" href="#" data-cursor="">Back home</a></p></section>` };
  },
};

// Animate cards out/in when switching category filter
async function filterCards(cards, cat) {
  const show = (c) => cat === "All" || c.dataset.category === cat;
  const visible = cards.filter((c) => !c.classList.contains("is-filtered"));
  if (!reduceMotion) {
    await Promise.all(visible.map((c) => c.animate([{ opacity: 1, transform: "none" }, { opacity: 0, transform: "translateY(20px) scale(.98)" }], { duration: 300, easing: "ease-in", fill: "forwards" }).finished));
  }
  cards.forEach((c) => { c.getAnimations().forEach((a) => a.cancel()); c.classList.toggle("is-filtered", !show(c)); });
  if (!reduceMotion) {
    cards.filter(show).forEach((c, i) => c.animate([{ opacity: 0, transform: "translateY(30px)" }, { opacity: 1, transform: "none" }], { duration: 700, delay: i * 70, easing: "cubic-bezier(.16,1,.3,1)", fill: "backwards" }));
  }
}

// ---------------------------------------------------------------------------
// Router + page transitions
// ---------------------------------------------------------------------------
const curtain = document.querySelector(".curtain");
let currentPath = null;
let navigating = false;

function parseHash() {
  // Plain hashes: #work, #about, #contact, #project-<slug>; empty = home
  const path = decodeURIComponent(location.hash.replace(/^#\/?/, ""));
  if (path.startsWith("project-")) return { path, name: "project", arg: path.slice(8), params: new URLSearchParams() };
  return { path, name: path || "home", arg: "", params: new URLSearchParams() };
}

function resolve() {
  const { name, arg, params } = parseHash();
  return (views[name] || views.notFound)(params, arg);
}

async function navigate(first = false) {
  const { path } = parseHash();
  if (path === currentPath && !first) return; // e.g. filter query change on same page
  if (navigating) return;
  navigating = true;
  currentPath = path;
  document.body.classList.remove("menu-open");
  const view = resolve();

  if (!first && !reduceMotion) {
    curtain.querySelector(".curtain__label").textContent = view.label;
    curtain.classList.remove("is-out");
    curtain.classList.add("is-in");
    await wait(950);
  }

  render(view);
  window.scrollTo(0, 0);

  if (!first && !reduceMotion) {
    curtain.classList.add("is-out");
    curtain.classList.remove("is-in");
    await wait(150);
    observe();
    await wait(700);
    curtain.classList.remove("is-out");
  } else {
    observe();
  }
  navigating = false;
  // If the hash changed again during the transition, catch up
  if (parseHash().path !== currentPath) navigate();
}

function render(view) {
  app.innerHTML = view.html;
  document.title = view.label === "Home" ? site.name : `${view.label} — ${site.name}`;
  view.mount?.();
  document.querySelectorAll(".nav__links a").forEach((a) =>
    a.classList.toggle("is-active", location.hash === a.getAttribute("href")));
  bindCursorTargets();
  app.focus({ preventScroll: true });
}

// ---------------------------------------------------------------------------
// Scroll reveals + parallax + nav hide-on-scroll
// ---------------------------------------------------------------------------
const io = new IntersectionObserver((entries) => {
  entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in-view"); io.unobserve(e.target); } });
}, { rootMargin: "0px 0px -8% 0px", threshold: 0.05 });

function observe() {
  app.querySelectorAll("[data-reveal], .split, .img-wipe").forEach((el) => {
    // Anything already on screen animates in straight away
    if (el.getBoundingClientRect().top < innerHeight) el.classList.add("in-view");
    else io.observe(el);
  });
}

const nav = document.querySelector(".nav");
let lastY = 0;
function onScroll() {
  const y = window.scrollY;
  nav.classList.toggle("is-hidden", y > lastY && y > 200 && !document.body.classList.contains("menu-open"));
  lastY = y;
  if (reduceMotion) return;
  app.querySelectorAll("[data-parallax]").forEach((el) => {
    el.style.transform = `translate3d(0, ${y * parseFloat(el.dataset.parallax)}px, 0)`;
  });
}
let ticking = false;
addEventListener("scroll", () => {
  if (!ticking) { requestAnimationFrame(() => { onScroll(); ticking = false; }); ticking = true; }
}, { passive: true });

// ---------------------------------------------------------------------------
// Custom cursor
// ---------------------------------------------------------------------------
const cursor = document.querySelector(".cursor");
const cursorLabel = cursor.querySelector(".cursor__label");
const pos = { x: innerWidth / 2, y: innerHeight / 2 }, target = { ...pos };

if (finePointer && !reduceMotion) {
  document.body.classList.add("has-cursor");
  addEventListener("mousemove", (e) => { target.x = e.clientX; target.y = e.clientY; cursor.classList.remove("is-hidden"); });
  document.addEventListener("mouseleave", () => cursor.classList.add("is-hidden"));
  (function loop() {
    pos.x += (target.x - pos.x) * 0.2;
    pos.y += (target.y - pos.y) * 0.2;
    cursor.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`;
    requestAnimationFrame(loop);
  })();
} else {
  cursor.remove();
}

function bindCursorTargets(root = document) {
  if (!document.body.classList.contains("has-cursor")) return;
  root.querySelectorAll("[data-cursor]:not([data-cursor-bound])").forEach((el) => {
    el.dataset.cursorBound = "";
    el.addEventListener("mouseenter", () => {
      const label = el.dataset.cursor;
      cursorLabel.textContent = label;
      cursor.classList.add(label ? "has-label" : "is-hover");
    });
    el.addEventListener("mouseleave", () => cursor.classList.remove("has-label", "is-hover"));
  });
}

// ---------------------------------------------------------------------------
// Lightbox (zooms out of the clicked thumbnail)
// ---------------------------------------------------------------------------
const lightbox = (() => {
  const root = document.querySelector(".lightbox");
  const stage = root.querySelector(".lightbox__stage");
  const count = root.querySelector(".lightbox__count");
  let items = [], index = 0, origin = null, lastFocus = null;

  function show(i, dir = 0) {
    index = (i + items.length) % items.length;
    const old = stage.firstElementChild;
    stage.insertAdjacentHTML("beforeend", media(items[index], { eager: true }));
    const el = stage.lastElementChild;
    if (el.tagName === "VIDEO") el.controls = true;
    count.textContent = `${String(index + 1).padStart(2, "0")} / ${String(items.length).padStart(2, "0")}`;
    if (old) {
      if (reduceMotion) old.remove();
      else {
        old.animate([{ opacity: 1, transform: "none" }, { opacity: 0, transform: `translateX(${-dir * 60}px)` }], { duration: 400, easing: "ease-in" }).finished.then(() => old.remove());
        el.animate([{ opacity: 0, transform: `translateX(${dir * 60}px)` }, { opacity: 1, transform: "none" }], { duration: 600, easing: "cubic-bezier(.16,1,.3,1)" });
      }
    }
    return el;
  }

  // FLIP: animate from the thumbnail's rectangle to the final position
  function flip(el, fromRect, reverse = false) {
    const run = () => {
      const to = el.getBoundingClientRect();
      if (!fromRect || !to.width || reduceMotion) return Promise.resolve();
      const dx = fromRect.left + fromRect.width / 2 - (to.left + to.width / 2);
      const dy = fromRect.top + fromRect.height / 2 - (to.top + to.height / 2);
      const s = fromRect.width / to.width;
      const frames = [{ transform: `translate(${dx}px, ${dy}px) scale(${s})` }, { transform: "none" }];
      return el.animate(reverse ? frames.reverse() : frames, { duration: 700, easing: "cubic-bezier(.76,0,.24,1)", fill: "forwards" }).finished;
    };
    if (el.tagName === "IMG" && !el.complete) return new Promise((r) => { el.onload = () => run().then(r); });
    return run();
  }

  function open(list, i, fromEl) {
    items = list; origin = fromEl; lastFocus = document.activeElement;
    stage.innerHTML = "";
    root.hidden = false;
    document.body.style.overflow = "hidden";
    const el = show(i);
    requestAnimationFrame(() => root.classList.add("is-open"));
    flip(el, fromEl?.getBoundingClientRect());
    root.querySelector(".lightbox__close").focus();
    bindCursorTargets(root);
  }

  async function close() {
    root.classList.remove("is-open");
    const el = stage.lastElementChild;
    const thumb = origin?.closest(".gallery")?.querySelector(`[data-index="${index}"]`);
    if (el && thumb) await flip(el, thumb.getBoundingClientRect(), true);
    else await wait(400);
    root.hidden = true;
    stage.innerHTML = "";
    document.body.style.overflow = "";
    cursor?.classList.remove("has-label", "is-hover");
    lastFocus?.focus({ preventScroll: true });
  }

  root.querySelector(".lightbox__close").onclick = close;
  root.querySelector(".lightbox__backdrop").onclick = close;
  root.querySelector(".lightbox__prev").onclick = () => show(index - 1, -1);
  root.querySelector(".lightbox__next").onclick = () => show(index + 1, 1);
  addEventListener("keydown", (e) => {
    if (root.hidden) return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowLeft") show(index - 1, -1);
    if (e.key === "ArrowRight") show(index + 1, 1);
  });
  let touchX = null;
  stage.addEventListener("touchstart", (e) => (touchX = e.touches[0].clientX), { passive: true });
  stage.addEventListener("touchend", (e) => {
    if (touchX === null) return;
    const dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 50) show(index + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1);
    touchX = null;
  });

  return { open };
})();

// ---------------------------------------------------------------------------
// Intro loader
// ---------------------------------------------------------------------------
async function intro() {
  const loader = document.querySelector(".loader");
  loader.querySelector(".loader__name").textContent = site.name;
  let seen = false;
  try { seen = !!sessionStorage.getItem("seenIntro"); sessionStorage.setItem("seenIntro", "1"); } catch {}
  if (reduceMotion || seen) { loader.remove(); return; }
  const counter = loader.querySelector(".loader__count");
  // Preload the first few covers while counting up
  const preload = projects.slice(0, 3).filter((p) => p.cover.type === "image").map((p) =>
    new Promise((r) => { const i = new Image(); i.onload = i.onerror = r; i.src = p.cover.src; }));
  const start = performance.now();
  await new Promise((done) => {
    (function tick(now) {
      const t = Math.min((now - start) / 1600, 1);
      counter.textContent = Math.round((1 - Math.pow(1 - t, 3)) * 100);
      t < 1 ? requestAnimationFrame(tick) : done();
    })(start);
  });
  await Promise.race([Promise.all(preload), wait(1500)]);
  loader.classList.add("is-done");
  await wait(500);
  setTimeout(() => loader.remove(), 1000);
}

// ---------------------------------------------------------------------------
// Boot
// ---------------------------------------------------------------------------
document.querySelector(".nav__toggle").addEventListener("click", (e) => {
  const open = document.body.classList.toggle("menu-open");
  e.currentTarget.setAttribute("aria-expanded", open);
});

(async function boot() {
  try {
    const inline = window.__PORTFOLIO__; // set by the single-file preview build
    const [s, m] = inline ? [inline.site, inline.manifest] : await Promise.all([
      fetch("content/site.json").then((r) => r.json()),
      fetch("content/manifest.json").then((r) => r.json()),
    ]);
    site = s; projects = m.projects || [];
  } catch (err) {
    console.error(err);
    app.innerHTML = `<div class="empty"><p>Couldn't load content. If you opened <code>index.html</code> directly, run a local server instead (see README).</p></div>`;
    document.querySelector(".loader")?.remove();
    document.body.classList.remove("is-loading");
    return;
  }
  document.querySelector(".nav__logo").textContent = site.name;
  try { await intro(); }
  catch (err) { console.error(err); document.querySelector(".loader")?.remove(); }
  document.body.classList.remove("is-loading");
  addEventListener("hashchange", () => navigate());
  navigate(true);
  bindCursorTargets();
})();
