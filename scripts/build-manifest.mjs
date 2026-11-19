#!/usr/bin/env node
// Scans content/projects/* and writes content/manifest.json.
// Each sub-folder is one project. Drop images/videos in; optionally add info.json.
// Run: node scripts/build-manifest.mjs   (the GitHub Action runs this for you)
import { readdir, readFile, writeFile, stat } from "node:fs/promises";
import { join, extname, basename } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;
const PROJECTS_DIR = join(ROOT, "content", "projects");
const IMAGE = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif", ".gif", ".svg"]);
const VIDEO = new Set([".mp4", ".webm", ".mov"]);
const natural = (a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" });

const titleFromSlug = (slug) =>
  slug.replace(/^\d+[-_ ]*/, "").replace(/[-_]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

async function readJSON(path) {
  try { return JSON.parse(await readFile(path, "utf8")); }
  catch (e) {
    if (e.code !== "ENOENT") console.warn(`⚠  Could not parse ${path}: ${e.message}`);
    return {};
  }
}

const folders = (await readdir(PROJECTS_DIR, { withFileTypes: true }))
  .filter((d) => d.isDirectory() && !d.name.startsWith("."))
  .map((d) => d.name)
  .sort(natural);

const projects = [];
for (const folder of folders) {
  const dir = join(PROJECTS_DIR, folder);
  const info = await readJSON(join(dir, "info.json"));
  if (info.hidden) continue;

  const files = (await readdir(dir)).filter((f) => !f.startsWith(".")).sort(natural);
  const media = files
    .filter((f) => IMAGE.has(extname(f).toLowerCase()) || VIDEO.has(extname(f).toLowerCase()))
    .map((f) => ({
      src: `content/projects/${encodeURIComponent(folder)}/${encodeURIComponent(f)}`,
      type: VIDEO.has(extname(f).toLowerCase()) ? "video" : "image",
      name: f,
    }));
  if (!media.length) { console.warn(`⚠  Skipping "${folder}" (no images or videos)`); continue; }

  // Cover: info.json "cover" > file named cover.* > first image > first item
  const coverItem =
    media.find((m) => m.name === info.cover) ||
    media.find((m) => basename(m.name, extname(m.name)).toLowerCase() === "cover") ||
    media.find((m) => m.type === "image") ||
    media[0];

  const { mtime } = await stat(dir);
  projects.push({
    slug: folder.replace(/^\d+[-_ ]*/, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || folder,
    title: info.title || titleFromSlug(folder),
    category: info.category || "Photography",
    year: info.year ?? mtime.getFullYear(),
    client: info.client || "",
    role: info.role || "",
    description: info.description || "",
    featured: info.featured !== false,
    cover: coverItem,
    // The cover is still shown in the gallery unless "hideCoverInGallery" is set
    media: info.hideCoverInGallery ? media.filter((m) => m !== coverItem) : media,
  });
}

await writeFile(
  join(ROOT, "content", "manifest.json"),
  JSON.stringify({ generated: new Date().toISOString(), projects }, null, 2) + "\n"
);
console.log(`✓ manifest.json written: ${projects.length} project(s), ${projects.reduce((n, p) => n + p.media.length, 0)} media file(s)`);
