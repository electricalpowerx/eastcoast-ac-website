/* One-time patcher: add canonical tags + silo nav links to the
   original hand-built pages so they match the new SEO structure. */
const fs = require("fs");
const path = require("path");
const ROOT = path.resolve(__dirname, "..");
const DOMAIN = "https://eastcoastheating.ca";

const rootPages = {
  "about.html": "/about.html",
  "projects.html": "/projects.html",
  "pricing.html": "/pricing.html",
  "blog.html": "/blog.html",
  "contact.html": "/contact.html",
};
const blogPosts = {
  "blog/no-heat-furnace-wont-start.html": "/blog/no-heat-furnace-wont-start.html",
  "blog/heat-pumps-lower-mainland.html": "/blog/heat-pumps-lower-mainland.html",
  "blog/hvac-maintenance-fall-spring.html": "/blog/hvac-maintenance-fall-spring.html",
};

function patch(rel, canonical, prefix) {
  const full = path.join(ROOT, rel);
  let html = fs.readFileSync(full, "utf8");
  let changed = false;

  // 1) canonical (idempotent)
  if (!/rel="canonical"/.test(html)) {
    html = html.replace(
      /(<meta name="viewport"[^>]*>)/,
      `$1\n  <link rel="canonical" href="${DOMAIN}${canonical}" />`
    );
    changed = true;
  }

  // 2) Services nav -> services hub, and add an Areas link after it (desktop + mobile)
  const svcDesktopOld = `<a href="${prefix}index.html#services" class="hover:text-[var(--px-blue)] transition">Services</a>`;
  const svcDesktopNew = `<a href="${prefix}services.html" class="hover:text-[var(--px-blue)] transition">Services</a>\n          <a href="${prefix}service-areas.html" class="hover:text-[var(--px-blue)] transition">Areas</a>`;
  if (html.includes(svcDesktopOld)) {
    html = html.split(svcDesktopOld).join(svcDesktopNew);
    changed = true;
  }
  const svcMobileOld = `<a href="${prefix}index.html#services" class="mobile-link py-3 px-3 rounded-xl hover:bg-slate-50">Services</a>`;
  const svcMobileNew = `<a href="${prefix}services.html" class="mobile-link py-3 px-3 rounded-xl hover:bg-slate-50">Services</a>\n        <a href="${prefix}service-areas.html" class="mobile-link py-3 px-3 rounded-xl hover:bg-slate-50">Areas We Serve</a>`;
  if (html.includes(svcMobileOld)) {
    html = html.split(svcMobileOld).join(svcMobileNew);
    changed = true;
  }

  fs.writeFileSync(full, html, "utf8");
  console.log(`${changed ? "✓ patched" : "· unchanged"}  ${rel}`);
}

for (const [rel, canon] of Object.entries(rootPages)) patch(rel, canon, "");
for (const [rel, canon] of Object.entries(blogPosts)) patch(rel, canon, "../");
console.log("Done patching existing pages.");
