/* ============================================================
   East Coast AC & Heating — SEO silo page generator
   Generates:
     - /services.html (services hub)
     - /services/<slug>.html (service silo pages)
     - /service-areas.html (locations hub)
     - /locations/hvac-<slug>.html (city pages)
     - /public/sitemap.xml (all pages)
   Run:  node scripts/generate-seo-pages.cjs
   ============================================================ */

const fs = require("fs");
const path = require("path");
const { SITE, SERVICES, LOCATIONS, COMBO_SERVICE_SLUGS, NEIGHBOURHOODS, BLOG, EXISTING_BLOG } = require("./seo-data.cjs");

const ROOT = path.resolve(__dirname, "..");
const img = (file) => "/images/" + encodeURIComponent(file).replace(/%2F/g, "/");
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const jsonLd = (obj) =>
  `<script type="application/ld+json">\n${JSON.stringify(obj, null, 2)}\n</script>`;

const svcUrl = (s) => `/services/${s}.html`;
const locUrl = (s) => `/locations/hvac-${s}.html`;
const comboUrl = (svcSlug, citySlug) => `/local/${svcSlug}-${citySlug}.html`;
const svcBy = (slug) => SERVICES.find((s) => s.slug === slug);
const locBy = (slug) => LOCATIONS.find((l) => l.slug === slug);
const hasCombo = (svcSlug) => COMBO_SERVICE_SLUGS.includes(svcSlug);
const comboServices = SERVICES.filter((s) => hasCombo(s.slug));
const neighboursOf = (citySlug) => NEIGHBOURHOODS.filter((n) => n.parent === citySlug);

const residential = SERVICES.filter((s) => s.category === "residential");
const commercial = SERVICES.filter((s) => s.category === "commercial");

/* ---------- shared chrome ---------- */

const phoneSvg = `<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>`;

function nav() {
  const svcCol = (list) =>
    list.map((s) => `<a href="${svcUrl(s.slug)}" class="block px-3 py-2 rounded-lg hover:bg-slate-50 text-[var(--px-text)]">${esc(s.nav)}</a>`).join("\n");
  const areaLinks = LOCATIONS.slice(0, 12)
    .map((l) => `<a href="${locUrl(l.slug)}" class="block px-3 py-2 rounded-lg hover:bg-slate-50 text-[var(--px-text)]">${esc(l.city)}</a>`)
    .join("\n");
  return `
  <nav class="fixed top-0 left-0 right-0 z-50 bg-white border-b border-[var(--px-border)] shadow-sm">
    <div class="max-w-7xl mx-auto px-4 sm:px-6">
      <div class="flex items-center justify-between h-16 md:h-20">
        <a href="/index.html" class="flex items-center gap-2 group">
          <img src="/images/eastcoast-logo.svg" alt="East Coast AC & Heating Ltd" class="h-[54px] md:h-[66px] w-auto object-contain" />
        </a>

        <div class="hidden lg:flex items-center gap-7 text-sm font-medium text-[var(--px-text)]">
          <a href="/index.html" class="hover:text-[var(--px-blue)] transition">Home</a>
          <a href="/about.html" class="hover:text-[var(--px-blue)] transition">About</a>

          <div class="relative group">
            <a href="/services.html" class="flex items-center gap-1 hover:text-[var(--px-blue)] transition py-6">Services
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/></svg>
            </a>
            <div class="absolute left-1/2 -translate-x-1/2 top-full hidden group-hover:grid grid-cols-2 gap-1 w-[34rem] bg-white rounded-2xl shadow-xl ring-1 ring-slate-200 p-3">
              <div>
                <div class="px-3 pt-2 pb-1 text-[11px] font-semibold tracking-wider text-[var(--px-text-muted)]">RESIDENTIAL</div>
                ${svcCol(residential)}
              </div>
              <div>
                <div class="px-3 pt-2 pb-1 text-[11px] font-semibold tracking-wider text-[var(--px-text-muted)]">COMMERCIAL</div>
                ${svcCol(commercial)}
                <a href="/services.html" class="block px-3 py-2 mt-1 rounded-lg text-[var(--px-blue)] font-semibold hover:bg-slate-50">All services →</a>
              </div>
            </div>
          </div>

          <div class="relative group">
            <a href="/service-areas.html" class="flex items-center gap-1 hover:text-[var(--px-blue)] transition py-6">Areas
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/></svg>
            </a>
            <div class="absolute left-1/2 -translate-x-1/2 top-full hidden group-hover:grid grid-cols-2 gap-1 w-[26rem] bg-white rounded-2xl shadow-xl ring-1 ring-slate-200 p-3">
              ${areaLinks}
              <a href="/service-areas.html" class="block px-3 py-2 col-span-2 rounded-lg text-[var(--px-blue)] font-semibold hover:bg-slate-50">All service areas →</a>
            </div>
          </div>

          <a href="/projects.html" class="hover:text-[var(--px-blue)] transition">Projects</a>
          <a href="/pricing.html" class="hover:text-[var(--px-blue)] transition">Pricing</a>
          <a href="/blog.html" class="hover:text-[var(--px-blue)] transition">Blog</a>
          <a href="/contact.html" class="hover:text-[var(--px-blue)] transition">Contact</a>
        </div>

        <div class="hidden lg:flex items-center gap-3">
          <a href="${SITE.ctaHref || '/contact.html'}" class="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[var(--px-emergency)] hover:bg-red-700 text-white text-sm font-semibold transition active:scale-[0.985]">
            ${SITE.ctaLabel || 'Request a Quote'}
          </a>
          <a href="/contact.html" class="px-5 py-2.5 rounded-2xl bg-[var(--px-navy)] text-white text-sm font-semibold hover:bg-[var(--px-blue)] transition active:scale-[0.985]">Get Free Quote</a>
        </div>

        <button id="mobile-menu-btn" class="lg:hidden p-2 rounded-xl hover:bg-slate-100 transition text-[var(--px-navy)]" aria-label="Toggle menu" aria-expanded="false">
          <svg id="menu-icon" xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
        </button>
      </div>
    </div>

    <div id="mobile-menu" class="lg:hidden bg-white border-t border-[var(--px-border)] max-h-[80vh] overflow-y-auto">
      <div class="px-4 py-5 flex flex-col gap-1 text-base font-medium text-[var(--px-text)]">
        <a href="/index.html" class="mobile-link py-3 px-3 rounded-xl hover:bg-slate-50">Home</a>
        <a href="/about.html" class="mobile-link py-3 px-3 rounded-xl hover:bg-slate-50">About</a>
        <a href="/services.html" class="py-3 px-3 rounded-xl hover:bg-slate-50 font-semibold">All Services →</a>
        <a href="/service-areas.html" class="py-3 px-3 rounded-xl hover:bg-slate-50 font-semibold">All Service Areas →</a>
        <a href="/projects.html" class="mobile-link py-3 px-3 rounded-xl hover:bg-slate-50">Projects</a>
        <a href="/pricing.html" class="mobile-link py-3 px-3 rounded-xl hover:bg-slate-50">Pricing</a>
        <a href="/blog.html" class="mobile-link py-3 px-3 rounded-xl hover:bg-slate-50">Blog</a>
        <a href="/contact.html" class="mobile-link py-3 px-3 rounded-xl hover:bg-slate-50">Contact</a>
        <div class="pt-4 mt-3 border-t border-[var(--px-border)] flex flex-col gap-3">
          <a href="${SITE.ctaHref || '/contact.html'}" class="flex justify-center items-center gap-2 py-3.5 rounded-2xl bg-[var(--px-emergency)] text-white font-semibold text-base">${phoneSvg} ${SITE.ctaLabel || 'Request a Quote'}</a>
          <a href="/contact.html" class="flex justify-center items-center py-3.5 rounded-2xl bg-[var(--px-navy)] text-white font-semibold text-base">Request Free Quote</a>
        </div>
      </div>
    </div>
  </nav>
  <div class="h-16 md:h-20"></div>`;
}

function footer() {
  const col = (list, fn) =>
    list.map((x) => `<a href="${fn(x)}" class="block hover:text-white text-[var(--px-blue)]">${esc(x.label)}</a>`).join("\n");
  const svcLinks = SERVICES.map((s) => ({ label: s.nav, href: svcUrl(s.slug) }));
  const half = Math.ceil(svcLinks.length / 2);
  const areaLinks = LOCATIONS.map((l) => ({ label: l.city, href: locUrl(l.slug) }));
  const ahalf = Math.ceil(areaLinks.length / 2);
  const link = (a) => `<a href="${a.href}" class="block hover:text-white text-[var(--px-blue)]">${esc(a.label)}</a>`;
  return `
  <footer class="bg-[var(--px-navy-dark)] text-[var(--px-blue)] text-sm">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-16">
      <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-x-8 gap-y-10">
        <div class="col-span-2">
          <a href="/index.html" class="inline-flex bg-white rounded-xl p-2.5 mb-3 w-max"><img src="/images/eastcoast-logo.svg" alt="East Coast AC & Heating Ltd" class="h-9 w-auto" /></a>
          <p class="text-xs max-w-[240px] mb-4">Licensed HVAC service across Surrey &amp; the Lower Mainland — heating, cooling, and 24/7 emergency no-heat / no-cool calls.</p>
          <a href="${SITE.ctaHref || '/contact.html'}" class="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[var(--px-emergency)] hover:bg-red-700 text-white text-sm font-semibold transition">${SITE.ctaLabel || 'Request a Quote'}</a>
        </div>

        <div>
          <div class="font-semibold text-white mb-3 tracking-wider text-xs">SERVICES</div>
          <div class="space-y-[9px]">${svcLinks.slice(0, half).map(link).join("\n")}</div>
        </div>
        <div>
          <div class="font-semibold text-white mb-3 tracking-wider text-xs">&nbsp;</div>
          <div class="space-y-[9px]">${svcLinks.slice(half).map(link).join("\n")}
            <a href="/services.html" class="block font-semibold hover:text-white text-[var(--px-blue-light)]">All services →</a>
          </div>
        </div>
        <div>
          <div class="font-semibold text-white mb-3 tracking-wider text-xs">SERVICE AREAS</div>
          <div class="space-y-[9px]">${areaLinks.slice(0, ahalf).map(link).join("\n")}</div>
        </div>
        <div>
          <div class="font-semibold text-white mb-3 tracking-wider text-xs">&nbsp;</div>
          <div class="space-y-[9px]">${areaLinks.slice(ahalf).map(link).join("\n")}
            <a href="/service-areas.html" class="block font-semibold hover:text-white text-[var(--px-blue-light)]">All areas →</a>
          </div>
        </div>
      </div>

      <div class="mt-12 pt-8 border-t border-white/10 text-xs flex flex-col md:flex-row gap-y-2 md:items-center justify-between">
        <div>© 2026 ${esc(SITE.name)}. All rights reserved. Licensed HVAC / plumbing-heating contractor in British Columbia.</div>
        <div>${esc(SITE.address.street)}, ${esc(SITE.address.city)}, ${esc(SITE.address.region)}${SITE.address.postal ? ' ' + esc(SITE.address.postal) : ''}</div>
      </div>
    </div>
  </footer>`;
}

function floatingButtons() {
  return `
  <a href="${SITE.ctaHref || '/contact.html'}" class="fixed bottom-5 right-5 z-[70] inline-flex px-4 py-2 rounded-full bg-[var(--px-emergency)] text-white shadow-xl hover:bg-red-700 transition-all active:scale-[0.985] text-sm font-semibold">Request a quote — 778-344-4938</a>`;
}

const mobileScript = `
  <script>
    const menuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const menuIcon = document.getElementById('menu-icon');
    if (menuBtn && mobileMenu) {
      menuBtn.addEventListener('click', () => {
        const isOpen = mobileMenu.classList.toggle('open');
        menuBtn.setAttribute('aria-expanded', isOpen);
        menuIcon.innerHTML = isOpen
          ? '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />'
          : '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />';
      });
      document.querySelectorAll('.mobile-link').forEach(link => {
        link.addEventListener('click', () => { mobileMenu.classList.remove('open'); });
      });
    }
  </script>`;

/* ---------- schema builders ---------- */

function localBusinessSchema(extra = {}) {
  const addr = {
    "@type": "PostalAddress",
    streetAddress: SITE.address.street,
    addressLocality: SITE.address.city,
    addressRegion: SITE.address.region,
    addressCountry: SITE.address.country,
  };
  if (SITE.address.postal) addr.postalCode = SITE.address.postal;
  const base = {
    "@context": "https://schema.org",
    "@type": ["HVACBusiness", "LocalBusiness", "Organization"],
    name: SITE.name,
    legalName: SITE.legalName || SITE.name,
    image: SITE.domain + (SITE.logo || "/images/eastcoast-logo.svg"),
    logo: SITE.domain + (SITE.logo || "/images/eastcoast-logo.svg"),
    url: SITE.domain,
    address: addr,
    areaServed: LOCATIONS.map((l) => ({ "@type": "City", name: l.city + ", BC" })),
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      opens: "00:00",
      closes: "23:59",
    },
  };
  if (SITE.phoneIntl) base.telephone = SITE.phoneIntl;
  if (SITE.email) base.email = SITE.email;
  if (SITE.geo && SITE.geo.lat) base.geo = { "@type": "GeoCoordinates", latitude: SITE.geo.lat, longitude: SITE.geo.lng };
  if (SITE.sameAs && SITE.sameAs.length) base.sameAs = SITE.sameAs;
  if (SITE.rating && SITE.reviewCount) {
    base.aggregateRating = { "@type": "AggregateRating", ratingValue: SITE.rating, reviewCount: SITE.reviewCount };
  }
  return Object.assign(base, extra);
}

function faqSchema(faqs) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map(([q, a]) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: { "@type": "Answer", text: a },
    })),
  };
}

function breadcrumbSchema(items) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: SITE.domain + it.url,
    })),
  };
}

/* ---------- reusable HTML blocks ---------- */

function head(title, desc, canonical, schemas, ogImage) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(desc)}" />
  <meta name="theme-color" content="#0F172A" />
  <link rel="canonical" href="${SITE.domain}${canonical}" />
  <meta property="og:title" content="${esc(title)}" />
  <meta property="og:description" content="${esc(desc)}" />
  <meta property="og:image" content="${ogImage || "/images/IMG_3843.JPG"}" />
  <meta property="og:url" content="${SITE.domain}${canonical}" />
  <meta property="og:type" content="website" />
  <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
  <link rel="stylesheet" href="/src/style.css" />
${schemas.map(jsonLd).join("\n")}
</head>
<body class="bg-[var(--px-light)] text-[var(--px-slate)] font-sans antialiased">`;
}

function breadcrumbBar(items) {
  return `
  <div class="bg-[var(--px-offwhite)] border-b border-[var(--px-border)]">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 py-3 text-xs text-[var(--px-text-muted)] flex flex-wrap gap-1.5 items-center">
      ${items
        .map((it, i) =>
          i === items.length - 1
            ? `<span class="text-[var(--px-text)] font-medium">${esc(it.name)}</span>`
            : `<a href="${it.url}" class="hover:text-[var(--px-blue)]">${esc(it.name)}</a><span class="opacity-50">/</span>`
        )
        .join("\n      ")}
    </div>
  </div>`;
}

function ctaBand() {
  return `
  <section class="bg-[var(--px-navy)] text-white">
    <div class="max-w-5xl mx-auto px-4 sm:px-6 py-14 text-center">
      <h2 class="text-3xl md:text-4xl font-bold tracking-[-1.5px] mb-3">No heat, no cooling, or a furnace emergency?</h2>
      <p class="text-white/70 text-lg mb-7 max-w-xl mx-auto">Call 778-344-4938 for 24/7 emergency HVAC. Upfront quotes — no invented website prices.</p>
      <div class="flex flex-col sm:flex-row gap-4 justify-center">
        <a href="${SITE.ctaHref || '/contact.html'}" class="inline-flex items-center justify-center gap-3 px-7 py-4 rounded-2xl bg-[var(--px-emergency)] hover:bg-red-700 text-white text-base font-semibold shadow-md transition active:scale-[0.985]">${phoneSvg} ${SITE.ctaLabel || 'Request a Quote'}</a>
        <a href="/contact.html" class="inline-flex items-center justify-center px-7 py-4 rounded-2xl text-base font-semibold border-2 border-white/80 text-white hover:bg-white hover:text-[var(--px-navy)] transition active:scale-[0.985]">Request a Free Quote</a>
      </div>
    </div>
  </section>`;
}

function checkList(title, items) {
  return `
      <div>
        <h2 class="text-2xl md:text-3xl font-bold tracking-[-1px] text-[var(--px-navy)] mb-6">${esc(title)}</h2>
        <ul class="grid sm:grid-cols-2 gap-x-6 gap-y-3">
          ${items
            .map(
              (i) =>
                `<li class="flex gap-3 text-[var(--px-text-light)]"><span class="text-[var(--px-success)] mt-0.5 font-bold">✓</span><span>${esc(i)}</span></li>`
            )
            .join("\n          ")}
        </ul>
      </div>`;
}

function stepsBlock(title, steps) {
  return `
      <div>
        <h2 class="text-2xl md:text-3xl font-bold tracking-[-1px] text-[var(--px-navy)] mb-6">${esc(title)}</h2>
        <div class="grid sm:grid-cols-2 gap-5">
          ${steps
            .map(
              ([t, d], i) => `<div class="card p-6">
            <div class="font-mono text-xs text-[var(--px-blue)] mb-2">0${i + 1}</div>
            <h3 class="font-semibold text-lg mb-1.5 text-[var(--px-navy)]">${esc(t)}</h3>
            <p class="text-sm text-[var(--px-gray)]">${esc(d)}</p>
          </div>`
            )
            .join("\n          ")}
        </div>
      </div>`;
}

function faqBlock(faqs) {
  return `
  <section class="section max-w-3xl mx-auto px-4 sm:px-6">
    <div class="text-center mb-8">
      <h2 class="text-3xl md:text-4xl font-bold tracking-[-1px] text-[var(--px-navy)]">Frequently Asked Questions</h2>
    </div>
    <div class="space-y-2 text-[15px]">
      ${faqs
        .map(
          ([q, a]) => `<details class="card px-6 group">
        <summary class="font-semibold">${esc(q)}</summary>
        <div class="pb-5 text-[var(--px-gray)]">${esc(a)}</div>
      </details>`
        )
        .join("\n      ")}
    </div>
  </section>`;
}

/* ---------- SERVICE PAGE ---------- */

function servicePage(s) {
  const canonical = svcUrl(s.slug);
  const crumbs = [
    { name: "Home", url: "/index.html" },
    { name: "Services", url: "/services.html" },
    { name: s.nav, url: canonical },
  ];
  const schemas = [
    localBusinessSchema(),
    {
      "@context": "https://schema.org",
      "@type": "Service",
      serviceType: s.nav,
      name: s.h1,
      description: s.metaDesc,
      provider: { "@type": "HVACBusiness", name: SITE.name, telephone: SITE.phoneIntl },
      areaServed: LOCATIONS.map((l) => l.city + ", BC"),
      url: SITE.domain + canonical,
    },
    faqSchema(s.faqs),
    breadcrumbSchema(crumbs),
  ];
  const related = (s.related || [])
    .map(svcBy)
    .filter(Boolean)
    .map(
      (r) => `<a href="${svcUrl(r.slug)}" class="card p-5 group">
        <h3 class="font-semibold text-[var(--px-navy)] group-hover:text-[var(--px-blue)] transition">${esc(r.nav)} →</h3>
      </a>`
    )
    .join("\n        ");

  const citiesBlock = hasCombo(s.slug)
    ? `
  <section class="section max-w-5xl mx-auto px-4 sm:px-6">
    <h2 class="text-2xl md:text-3xl font-bold tracking-[-1px] text-[var(--px-navy)] mb-2 text-center">${esc(s.nav)} Across the Lower Mainland</h2>
    <p class="text-center text-[var(--px-gray)] mb-6 max-w-2xl mx-auto">We provide ${esc(s.nav.toLowerCase())} in every community we serve. Find your city:</p>
    <div class="flex flex-wrap justify-center gap-2">
      ${LOCATIONS.map((l) => `<a href="${comboUrl(s.slug, l.slug)}" class="inline-block px-4 py-2 rounded-full bg-[var(--px-light-gray)] text-sm font-medium text-[var(--px-text)] hover:bg-[var(--px-navy)] hover:text-white transition">${esc(s.nav)} in ${esc(l.city)}</a>`).join("\n      ")}
    </div>
  </section>`
    : "";

  return `${head(s.metaTitle, s.metaDesc, canonical, schemas, img(s.image))}
${nav()}
${breadcrumbBar(crumbs)}

  <header class="relative bg-white border-b border-[var(--px-border)]">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-16 grid lg:grid-cols-2 gap-10 items-center">
      <div>
        <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--px-light-gray)] text-sm mb-5 text-[var(--px-text-muted)]">
          <div class="w-2 h-2 bg-[var(--px-success)] rounded-full animate-pulse"></div>
          <span class="font-medium tracking-wide">${s.category === "commercial" ? "Commercial &amp; Industrial" : "Residential Service"} • Licensed &amp; Insured in BC</span>
        </div>
        <h1 class="text-4xl md:text-5xl font-bold tracking-[-2px] leading-[1.02] mb-5 text-[var(--px-navy)]">${esc(s.h1)}</h1>
        <p class="text-lg md:text-xl text-[var(--px-text-light)] mb-8">${esc(s.heroSub)}</p>
        <div class="flex flex-col sm:flex-row gap-4">
          <a href="${SITE.ctaHref || '/contact.html'}" class="emergency-cta inline-flex items-center justify-center gap-3 px-6 py-3 rounded-2xl text-base font-semibold shadow-md active:scale-[0.985] transition">${phoneSvg} ${SITE.ctaLabel || 'Request a Quote'}</a>
          <a href="/contact.html" class="inline-flex items-center justify-center px-8 py-4 rounded-2xl text-base font-semibold border-2 border-[var(--px-navy)] text-[var(--px-navy)] hover:bg-[var(--px-navy)] hover:text-white transition active:scale-[0.985]">Request Free Quote</a>
        </div>
      </div>
      <div class="rounded-3xl overflow-hidden shadow-lg ring-1 ring-slate-200">
        <img src="${img(s.image)}" alt="${esc(s.h1)} — East Coast AC & Heating" class="w-full h-72 lg:h-96 object-cover" />
      </div>
    </div>
  </header>

  <section class="section max-w-3xl mx-auto px-4 sm:px-6">
    <div class="prose prose-slate max-w-none text-[var(--px-text-light)] text-lg leading-relaxed space-y-5">
      ${s.intro.map((p) => `<p>${esc(p)}</p>`).join("\n      ")}
    </div>
  </section>

  <section class="bg-white border-y border-slate-100">
    <div class="max-w-5xl mx-auto px-4 sm:px-6 py-14 space-y-14">
      ${checkList(s.bulletsTitle, s.bullets)}
      ${stepsBlock(s.stepsTitle, s.steps)}
    </div>
  </section>

  ${faqBlock(s.faqs)}
${citiesBlock}

  <section class="section bg-[var(--px-offwhite)] border-y border-slate-100">
    <div class="max-w-5xl mx-auto px-4 sm:px-6">
      <h2 class="text-2xl md:text-3xl font-bold tracking-[-1px] text-[var(--px-navy)] mb-6 text-center">Related Services</h2>
      <div class="grid sm:grid-cols-3 gap-5">
        ${related}
      </div>
    </div>
  </section>

${ctaBand()}
${footer()}
${floatingButtons()}
${mobileScript}
</body>
</html>`;
}

/* ---------- LOCATION PAGE ---------- */

function locationPage(l) {
  const canonical = locUrl(l.slug);
  const crumbs = [
    { name: "Home", url: "/index.html" },
    { name: "Service Areas", url: "/service-areas.html" },
    { name: l.city, url: canonical },
  ];
  const schemas = [
    localBusinessSchema({ areaServed: { "@type": "City", name: l.city + ", BC" } }),
    faqSchema(l.faqs.concat([
      ["What heating and cooling services do you offer in " + l.city + "?", "We provide 24/7 emergency heating and cooling, furnace and AC repair, heat pump installation, boilers, ductless mini-splits and full commercial HVAC work throughout " + l.city + "."],
    ])),
    breadcrumbSchema(crumbs),
  ];
  const nearby = (l.nearby || [])
    .map(locBy)
    .filter(Boolean)
    .map(
      (n) => `<a href="${locUrl(n.slug)}" class="card p-5 group">
        <h3 class="font-semibold text-[var(--px-navy)] group-hover:text-[var(--px-blue)] transition">HVAC in ${esc(n.city)} →</h3>
      </a>`
    )
    .join("\n        ");

  const topServices = [
    "emergency-hvac",
    "furnace-repair",
    "heat-pumps",
    "boilers",
    "ductless-mini-split",
    "commercial-hvac",
  ]
    .map(svcBy)
    .filter(Boolean)
    .map(
      (s) => `<a href="${hasCombo(s.slug) ? comboUrl(s.slug, l.slug) : svcUrl(s.slug)}" class="card p-6 group">
          <h3 class="font-semibold text-lg mb-1.5 text-[var(--px-navy)] group-hover:text-[var(--px-blue)] transition">${esc(s.nav)} in ${esc(l.city)}</h3>
          <p class="text-sm text-[var(--px-gray)]">${esc(s.heroSub.split(".")[0])}.</p>
        </a>`
    )
    .join("\n        ");

  const hoods = neighboursOf(l.slug);
  const hoodsBlock = hoods.length
    ? `
  <section class="section max-w-5xl mx-auto px-4 sm:px-6">
    <h2 class="text-2xl md:text-3xl font-bold tracking-[-1px] text-[var(--px-navy)] mb-6">${esc(l.city)} Neighbourhoods We Serve</h2>
    <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      ${hoods.map((n) => `<a href="${locUrl(n.slug)}" class="card p-5 group">
        <h3 class="font-semibold text-[var(--px-navy)] group-hover:text-[var(--px-blue)] transition">HVAC in ${esc(n.name)} →</h3>
      </a>`).join("\n      ")}
    </div>
  </section>`
    : "";

  return `${head(l.metaTitle, l.metaDesc, canonical, schemas, "/images/van.jpg")}
${nav()}
${breadcrumbBar(crumbs)}

  <header class="relative bg-white border-b border-[var(--px-border)]">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-16">
      <div class="max-w-3xl">
        <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--px-light-gray)] text-sm mb-5 text-[var(--px-text-muted)]">
          <div class="w-2 h-2 bg-[var(--px-success)] rounded-full animate-pulse"></div>
          <span class="font-medium tracking-wide">Serving ${esc(l.city)} 24/7</span>
        </div>
        <h1 class="text-4xl md:text-6xl font-bold tracking-[-2.5px] leading-[0.98] mb-5 text-[var(--px-navy)]">HVAC in ${esc(l.city)}, BC</h1>
        <p class="text-lg md:text-2xl text-[var(--px-text-light)] mb-8">${esc(l.heroSub)}</p>
        <div class="flex flex-col sm:flex-row gap-4">
          <a href="${SITE.ctaHref || '/contact.html'}" class="emergency-cta inline-flex items-center justify-center gap-3 px-6 py-3 rounded-2xl text-base font-semibold shadow-md active:scale-[0.985] transition">${phoneSvg} ${SITE.ctaLabel || 'Request a Quote'}</a>
          <a href="/contact.html" class="inline-flex items-center justify-center px-8 py-4 rounded-2xl text-base font-semibold border-2 border-[var(--px-navy)] text-[var(--px-navy)] hover:bg-[var(--px-navy)] hover:text-white transition active:scale-[0.985]">Request Free Quote</a>
        </div>
        <div class="mt-9 flex flex-wrap gap-x-8 gap-y-3 text-sm text-[var(--px-text-muted)]">
          <div><span class="font-semibold text-[var(--px-navy)]">Licensed &amp; Insured</span> in BC</div>
          <div><span class="font-semibold text-[var(--px-navy)]">30–60 min</span> emergency response</div>
          <div><span class="font-semibold text-[var(--px-navy)]">${SITE.rating} ★</span> ${SITE.reviewCount}+ Google reviews</div>
        </div>
      </div>
    </div>
  </header>

  <section class="section max-w-3xl mx-auto px-4 sm:px-6">
    <div class="prose prose-slate max-w-none text-[var(--px-text-light)] text-lg leading-relaxed space-y-5">
      ${l.intro.map((p) => `<p>${esc(p)}</p>`).join("\n      ")}
    </div>
  </section>

  <section class="bg-white border-y border-slate-100">
    <div class="max-w-5xl mx-auto px-4 sm:px-6 py-14">
      <h2 class="text-2xl md:text-3xl font-bold tracking-[-1px] text-[var(--px-navy)] mb-6">HVAC Services in ${esc(l.city)}</h2>
      <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        ${topServices}
      </div>
    </div>
  </section>

  <section class="section max-w-5xl mx-auto px-4 sm:px-6">
    <div class="grid lg:grid-cols-2 gap-10 items-start">
      <div>
        <h2 class="text-2xl md:text-3xl font-bold tracking-[-1px] text-[var(--px-navy)] mb-5">Neighbourhoods We Serve in ${esc(l.city)}</h2>
        <div class="flex flex-wrap gap-2">
          ${l.neighbourhoods.map((n) => `<span class="inline-block px-3 py-1.5 rounded-full bg-[var(--px-light-gray)] text-sm text-[var(--px-text)]">${esc(n)}</span>`).join("\n          ")}
        </div>
      </div>
      <div class="card p-7 bg-[var(--px-offwhite)]">
        <h3 class="font-semibold text-lg text-[var(--px-navy)] mb-2">Local know-how</h3>
        <p class="text-[var(--px-text-light)]">${esc(l.localNote)}</p>
      </div>
    </div>
  </section>

  ${hoodsBlock}

  ${faqBlock(l.faqs)}

  <section class="section bg-[var(--px-offwhite)] border-y border-slate-100">
    <div class="max-w-5xl mx-auto px-4 sm:px-6">
      <h2 class="text-2xl md:text-3xl font-bold tracking-[-1px] text-[var(--px-navy)] mb-6 text-center">Nearby Areas We Serve</h2>
      <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        ${nearby}
      </div>
    </div>
  </section>

${ctaBand()}
${footer()}
${floatingButtons()}
${mobileScript}
</body>
</html>`;
}

/* ---------- SERVICES HUB ---------- */

function servicesHub() {
  const canonical = "/services.html";
  const crumbs = [
    { name: "Home", url: "/index.html" },
    { name: "Services", url: canonical },
  ];
  const schemas = [
    localBusinessSchema(),
    breadcrumbSchema(crumbs),
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      itemListElement: SERVICES.map((s, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: s.nav,
        url: SITE.domain + svcUrl(s.slug),
      })),
    },
  ];
  const cardOf = (s) => `<a href="${svcUrl(s.slug)}" class="card overflow-hidden group">
          <img src="${img(s.image)}" class="w-full h-40 object-cover" alt="${esc(s.nav)}">
          <div class="p-6">
            <h3 class="font-semibold text-lg mb-1.5 text-[var(--px-navy)] group-hover:text-[var(--px-blue)] transition">${esc(s.nav)}</h3>
            <p class="text-sm text-[var(--px-gray)]">${esc(s.heroSub.split(".")[0])}.</p>
            <span class="inline-block mt-3 text-sm font-medium text-[var(--px-blue)]">Learn more →</span>
          </div>
        </a>`;
  return `${head(
    "HVAC Services | Residential & Commercial | East Coast AC & Heating Surrey & Lower Mainland",
    "Full-service HVAC contractor in Surrey & the Lower Mainland: 24/7 emergencies, furnace repair, AC, heat pumps, boilers, mini-splits, commercial and strata HVAC. 778-344-4938 — request a quote.",
    canonical,
    schemas
  )}
${nav()}
${breadcrumbBar(crumbs)}

  <header class="bg-white border-b border-[var(--px-border)]">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 py-14 md:py-20 text-center">
      <div class="text-[var(--px-blue)] font-semibold tracking-[1.5px] text-sm mb-3">WHAT WE DO</div>
      <h1 class="text-4xl md:text-6xl font-bold tracking-[-2.5px] text-[var(--px-navy)] mb-5">Complete HVAC Services</h1>
      <p class="max-w-2xl mx-auto text-lg md:text-xl text-[var(--px-text-light)]">From 2am emergencies to full commercial fit-outs, East Coast AC & Heating is the one licensed contractor that handles it all across Surrey &amp; the Lower Mainland.</p>
      <div class="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
        <a href="${SITE.ctaHref || '/contact.html'}" class="emergency-cta inline-flex items-center justify-center gap-3 px-6 py-3 rounded-2xl text-base font-semibold shadow-md transition">${phoneSvg} ${SITE.ctaLabel || 'Request a Quote'}</a>
        <a href="/contact.html" class="inline-flex items-center justify-center px-8 py-4 rounded-2xl text-base font-semibold border-2 border-[var(--px-navy)] text-[var(--px-navy)] hover:bg-[var(--px-navy)] hover:text-white transition">Request Free Quote</a>
      </div>
    </div>
  </header>

  <section class="section max-w-7xl mx-auto px-4 sm:px-6">
    <h2 class="text-2xl md:text-3xl font-bold tracking-[-1px] text-[var(--px-navy)] mb-6">Residential HVAC</h2>
    <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-16">
      ${residential.map(cardOf).join("\n      ")}
    </div>
    <h2 class="text-2xl md:text-3xl font-bold tracking-[-1px] text-[var(--px-navy)] mb-6">Commercial &amp; Industrial</h2>
    <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
      ${commercial.map(cardOf).join("\n      ")}
    </div>
  </section>

${ctaBand()}
${footer()}
${floatingButtons()}
${mobileScript}
</body>
</html>`;
}

/* ---------- AREAS HUB ---------- */

function areasHub() {
  const canonical = "/service-areas.html";
  const crumbs = [
    { name: "Home", url: "/index.html" },
    { name: "Service Areas", url: canonical },
  ];
  const schemas = [
    localBusinessSchema({ areaServed: LOCATIONS.map((l) => l.city + ", BC") }),
    breadcrumbSchema(crumbs),
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      itemListElement: LOCATIONS.map((l, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: "HVAC in " + l.city,
        url: SITE.domain + locUrl(l.slug),
      })),
    },
  ];
  const cardOf = (l) => `<a href="${locUrl(l.slug)}" class="card p-6 group">
        <h3 class="font-semibold text-lg mb-1.5 text-[var(--px-navy)] group-hover:text-[var(--px-blue)] transition">${esc(l.city)}</h3>
        <p class="text-sm text-[var(--px-gray)]">${esc(l.neighbourhoods.slice(0, 4).join(" • "))}</p>
        <span class="inline-block mt-3 text-sm font-medium text-[var(--px-blue)]">HVAC in ${esc(l.city)} →</span>
      </a>`;
  return `${head(
    "Service Areas | HVAC Surrey, Vancouver, Burnaby, Langley & Lower Mainland | East Coast AC & Heating",
    "East Coast AC & Heating serves Surrey, Vancouver, Burnaby, Langley, Coquitlam, the Tri-Cities, Delta, Richmond, the North Shore & the Fraser Valley. 24/7 licensed HVAC. 778-344-4938 — request a quote.",
    canonical,
    schemas
  )}
${nav()}
${breadcrumbBar(crumbs)}

  <header class="bg-white border-b border-[var(--px-border)]">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 py-14 md:py-20 text-center">
      <div class="text-[var(--px-blue)] font-semibold tracking-[1.5px] text-sm mb-3">PROUDLY LOCAL</div>
      <h1 class="text-4xl md:text-6xl font-bold tracking-[-2.5px] text-[var(--px-navy)] mb-5">Areas We Serve</h1>
      <p class="max-w-2xl mx-auto text-lg md:text-xl text-[var(--px-text-light)]">Based in Surrey, East Coast AC & Heating covers the entire Lower Mainland and Fraser Valley with licensed, 24/7 HVAC service. Find your city below.</p>
    </div>
  </header>

  <section class="section max-w-7xl mx-auto px-4 sm:px-6">
    <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
      ${LOCATIONS.map(cardOf).join("\n      ")}
    </div>
  </section>

  <section class="section bg-[var(--px-offwhite)] border-y border-slate-100">
    <div class="max-w-7xl mx-auto px-4 sm:px-6">
      <h2 class="text-2xl md:text-3xl font-bold tracking-[-1px] text-[var(--px-navy)] mb-2 text-center">Neighbourhoods We Serve</h2>
      <p class="text-center text-[var(--px-gray)] mb-8">Hyper-local HVAC service across the region's busiest communities.</p>
      <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-8">
        ${LOCATIONS.filter((l) => neighboursOf(l.slug).length)
          .map(
            (l) => `<div>
          <div class="font-semibold text-[var(--px-navy)] mb-2">${esc(l.city)}</div>
          <div class="space-y-1.5 text-sm">
            ${neighboursOf(l.slug).map((n) => `<a href="${locUrl(n.slug)}" class="block text-[var(--px-text-light)] hover:text-[var(--px-blue)]">HVAC in ${esc(n.name)}</a>`).join("\n            ")}
          </div>
        </div>`
          )
          .join("\n        ")}
      </div>
    </div>
  </section>

${ctaBand()}
${footer()}
${floatingButtons()}
${mobileScript}
</body>
</html>`;
}

/* ---------- COMBO PAGE (service × city) ---------- */

function comboPage(s, l) {
  const canonical = comboUrl(s.slug, l.slug);
  const title = `${s.nav} in ${l.city}, BC | East Coast AC & Heating`;
  const metaDesc = `Looking for ${s.nav.toLowerCase()} in ${l.city}? East Coast AC & Heating is a licensed, insured HVAC contractor serving ${l.city} with upfront pricing and fast response. ${SITE.ctaLabel || 'Request a Quote'}.`;
  const crumbs = [
    { name: "Home", url: "/index.html" },
    { name: "Services", url: "/services.html" },
    { name: s.nav, url: svcUrl(s.slug) },
    { name: l.city, url: canonical },
  ];
  const comboFaqs = [
    s.faqs[0],
    l.faqs[0],
    [
      `How much does ${s.nav.toLowerCase()} cost in ${l.city}?`,
      `Pricing depends on the scope of your specific job. East Coast AC & Heating gives you a clear, upfront quote before any work begins in ${l.city} — with no hidden fees. ${SITE.ctaLabel || 'Request a Quote'} for a free estimate.`,
    ],
  ];
  const schemas = [
    localBusinessSchema({ areaServed: { "@type": "City", name: l.city + ", BC" } }),
    {
      "@context": "https://schema.org",
      "@type": "Service",
      serviceType: s.nav,
      name: `${s.nav} in ${l.city}`,
      description: metaDesc,
      provider: { "@type": "HVACBusiness", name: SITE.name, telephone: SITE.phoneIntl },
      areaServed: { "@type": "City", name: l.city + ", BC" },
      url: SITE.domain + canonical,
    },
    faqSchema(comboFaqs),
    breadcrumbSchema(crumbs),
  ];

  const siblingCities = LOCATIONS.filter((x) => x.slug !== l.slug)
    .slice(0, 6)
    .map((x) => `<a href="${comboUrl(s.slug, x.slug)}" class="inline-block px-3 py-1.5 rounded-full bg-[var(--px-light-gray)] text-sm text-[var(--px-text)] hover:bg-[var(--px-navy)] hover:text-white transition">${esc(s.nav)} in ${esc(x.city)}</a>`)
    .join("\n        ");
  const otherServices = comboServices
    .filter((x) => x.slug !== s.slug)
    .slice(0, 5)
    .map((x) => `<a href="${comboUrl(x.slug, l.slug)}" class="inline-block px-3 py-1.5 rounded-full bg-[var(--px-light-gray)] text-sm text-[var(--px-text)] hover:bg-[var(--px-navy)] hover:text-white transition">${esc(x.nav)} in ${esc(l.city)}</a>`)
    .join("\n        ");

  const intro1 = `Need ${s.nav.toLowerCase()} in ${l.city}? East Coast AC & Heating is a licensed, insured HVAC contractor serving ${l.city} and its neighbourhoods — ${l.neighbourhoods.slice(0, 4).join(", ")} and more. ${s.heroSub}`;
  const intro2 = `${l.localNote} Whether it's a quick fix or a planned project, you get upfront pricing and code-compliant work — with 24/7 emergency response available across ${l.city}.`;

  return `${head(title, metaDesc, canonical, schemas, img(s.image))}
${nav()}
${breadcrumbBar(crumbs)}

  <header class="relative bg-white border-b border-[var(--px-border)]">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-16 grid lg:grid-cols-2 gap-10 items-center">
      <div>
        <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--px-light-gray)] text-sm mb-5 text-[var(--px-text-muted)]">
          <div class="w-2 h-2 bg-[var(--px-success)] rounded-full animate-pulse"></div>
          <span class="font-medium tracking-wide">Serving ${esc(l.city)} • Licensed &amp; Insured in BC</span>
        </div>
        <h1 class="text-3xl md:text-5xl font-bold tracking-[-2px] leading-[1.04] mb-5 text-[var(--px-navy)]">${esc(s.nav)} in ${esc(l.city)}, BC</h1>
        <p class="text-lg md:text-xl text-[var(--px-text-light)] mb-8">${esc(s.heroSub)}</p>
        <div class="flex flex-col sm:flex-row gap-4">
          <a href="${SITE.ctaHref || '/contact.html'}" class="emergency-cta inline-flex items-center justify-center gap-3 px-6 py-3 rounded-2xl text-base font-semibold shadow-md active:scale-[0.985] transition">${phoneSvg} ${SITE.ctaLabel || 'Request a Quote'}</a>
          <a href="/contact.html" class="inline-flex items-center justify-center px-8 py-4 rounded-2xl text-base font-semibold border-2 border-[var(--px-navy)] text-[var(--px-navy)] hover:bg-[var(--px-navy)] hover:text-white transition active:scale-[0.985]">Free Quote in ${esc(l.city)}</a>
        </div>
      </div>
      <div class="rounded-3xl overflow-hidden shadow-lg ring-1 ring-slate-200">
        <img src="${img(s.image)}" alt="${esc(s.nav)} in ${esc(l.city)}, BC — East Coast AC & Heating" class="w-full h-72 lg:h-96 object-cover" />
      </div>
    </div>
  </header>

  <section class="section max-w-3xl mx-auto px-4 sm:px-6">
    <div class="prose prose-slate max-w-none text-[var(--px-text-light)] text-lg leading-relaxed space-y-5">
      <p>${esc(intro1)}</p>
      <p>${esc(intro2)}</p>
    </div>
  </section>

  <section class="bg-white border-y border-slate-100">
    <div class="max-w-5xl mx-auto px-4 sm:px-6 py-14 space-y-14">
      ${checkList(`${s.nav} in ${l.city} — what's included`, s.bullets)}
      ${stepsBlock(s.stepsTitle, s.steps)}
    </div>
  </section>

  <section class="section max-w-5xl mx-auto px-4 sm:px-6">
    <h2 class="text-2xl md:text-3xl font-bold tracking-[-1px] text-[var(--px-navy)] mb-5">Neighbourhoods We Serve in ${esc(l.city)}</h2>
    <div class="flex flex-wrap gap-2">
      ${l.neighbourhoods.map((n) => `<span class="inline-block px-3 py-1.5 rounded-full bg-[var(--px-light-gray)] text-sm text-[var(--px-text)]">${esc(n)}</span>`).join("\n      ")}
    </div>
  </section>

  ${faqBlock(comboFaqs)}

  <section class="section bg-[var(--px-offwhite)] border-y border-slate-100">
    <div class="max-w-5xl mx-auto px-4 sm:px-6 space-y-8">
      <div>
        <h2 class="text-xl md:text-2xl font-bold tracking-[-1px] text-[var(--px-navy)] mb-4">${esc(s.nav)} in nearby cities</h2>
        <div class="flex flex-wrap gap-2">
        ${siblingCities}
        </div>
      </div>
      <div>
        <h2 class="text-xl md:text-2xl font-bold tracking-[-1px] text-[var(--px-navy)] mb-4">Other heating and cooling services in ${esc(l.city)}</h2>
        <div class="flex flex-wrap gap-2">
        ${otherServices}
        </div>
        <div class="mt-5 flex flex-wrap gap-4 text-sm">
          <a href="${svcUrl(s.slug)}" class="text-[var(--px-blue)] font-medium hover:underline">More about ${esc(s.nav.toLowerCase())} →</a>
          <a href="${locUrl(l.slug)}" class="text-[var(--px-blue)] font-medium hover:underline">All HVAC services in ${esc(l.city)} →</a>
        </div>
      </div>
    </div>
  </section>

${ctaBand()}
${footer()}
${floatingButtons()}
${mobileScript}
</body>
</html>`;
}

/* ---------- NEIGHBOURHOOD PAGE ---------- */

function neighbourhoodPage(n) {
  const parent = locBy(n.parent);
  const canonical = locUrl(n.slug);
  const title = `HVAC in ${n.name}, ${parent.city} | East Coast AC & Heating`;
  const metaDesc = `HVAC in ${n.name}, ${parent.city}. 24/7 emergency heating and cooling, furnace, AC, heat pumps and mini-splits. ${SITE.ctaLabel || 'Request a Quote'}.`;
  const crumbs = [
    { name: "Home", url: "/index.html" },
    { name: "Service Areas", url: "/service-areas.html" },
    { name: parent.city, url: locUrl(parent.slug) },
    { name: n.name, url: canonical },
  ];
  const faqs = [
    [`Do you serve ${n.name} in ${parent.city}?`, `Yes — ${n.name} is within our ${parent.city} service area. We provide 24/7 emergency heating and cooling, furnace and AC repair, heat pumps and more throughout ${n.name}.`],
    [`How fast can you reach ${n.name}?`, `We target a prompt response across ${parent.city}, and we will always give you an honest ETA when we confirm your request. Phone 778-344-4938 — use the contact form.`],
  ];
  const schemas = [
    localBusinessSchema({ areaServed: { "@type": "City", name: parent.city + ", BC" } }),
    faqSchema(faqs),
    breadcrumbSchema(crumbs),
  ];
  const serviceCards = ["emergency-hvac", "furnace-repair", "heat-pumps", "boilers", "ductless-mini-split", "commercial-hvac"]
    .map(svcBy)
    .filter(Boolean)
    .map((s) => `<a href="${hasCombo(s.slug) ? comboUrl(s.slug, parent.slug) : svcUrl(s.slug)}" class="card p-6 group">
          <h3 class="font-semibold text-lg mb-1.5 text-[var(--px-navy)] group-hover:text-[var(--px-blue)] transition">${esc(s.nav)}</h3>
          <p class="text-sm text-[var(--px-gray)]">${esc(s.heroSub.split(".")[0])}.</p>
        </a>`)
    .join("\n        ");
  const siblings = neighboursOf(n.parent)
    .filter((x) => x.slug !== n.slug)
    .map((x) => `<a href="${locUrl(x.slug)}" class="inline-block px-3 py-1.5 rounded-full bg-[var(--px-light-gray)] text-sm text-[var(--px-text)] hover:bg-[var(--px-navy)] hover:text-white transition">${esc(x.name)}</a>`)
    .join("\n        ");

  return `${head(title, metaDesc, canonical, schemas, "/images/van.jpg")}
${nav()}
${breadcrumbBar(crumbs)}

  <header class="relative bg-white border-b border-[var(--px-border)]">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-16">
      <div class="max-w-3xl">
        <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--px-light-gray)] text-sm mb-5 text-[var(--px-text-muted)]">
          <div class="w-2 h-2 bg-[var(--px-success)] rounded-full animate-pulse"></div>
          <span class="font-medium tracking-wide">Serving ${esc(n.name)}, ${esc(parent.city)} 24/7</span>
        </div>
        <h1 class="text-4xl md:text-6xl font-bold tracking-[-2.5px] leading-[0.98] mb-5 text-[var(--px-navy)]">HVAC in ${esc(n.name)}</h1>
        <p class="text-lg md:text-2xl text-[var(--px-text-light)] mb-8">${esc(n.blurb)} East Coast AC & Heating brings licensed HVAC service to ${esc(n.name)} and all of ${esc(parent.city)}.</p>
        <div class="flex flex-col sm:flex-row gap-4">
          <a href="${SITE.ctaHref || '/contact.html'}" class="emergency-cta inline-flex items-center justify-center gap-3 px-6 py-3 rounded-2xl text-base font-semibold shadow-md active:scale-[0.985] transition">${phoneSvg} ${SITE.ctaLabel || 'Request a Quote'}</a>
          <a href="/contact.html" class="inline-flex items-center justify-center px-8 py-4 rounded-2xl text-base font-semibold border-2 border-[var(--px-navy)] text-[var(--px-navy)] hover:bg-[var(--px-navy)] hover:text-white transition active:scale-[0.985]">Request Free Quote</a>
        </div>
      </div>
    </div>
  </header>

  <section class="bg-white">
    <div class="max-w-5xl mx-auto px-4 sm:px-6 py-14">
      <h2 class="text-2xl md:text-3xl font-bold tracking-[-1px] text-[var(--px-navy)] mb-6">HVAC Services in ${esc(n.name)}</h2>
      <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        ${serviceCards}
      </div>
    </div>
  </section>

  ${faqBlock(faqs)}

  <section class="section bg-[var(--px-offwhite)] border-y border-slate-100">
    <div class="max-w-5xl mx-auto px-4 sm:px-6">
      <h2 class="text-xl md:text-2xl font-bold tracking-[-1px] text-[var(--px-navy)] mb-4">Other ${esc(parent.city)} neighbourhoods we serve</h2>
      <div class="flex flex-wrap gap-2">
        ${siblings}
      </div>
      <div class="mt-5">
        <a href="${locUrl(parent.slug)}" class="text-[var(--px-blue)] font-medium hover:underline">All HVAC services in ${esc(parent.city)} →</a>
      </div>
    </div>
  </section>

${ctaBand()}
${footer()}
${floatingButtons()}
${mobileScript}
</body>
</html>`;
}

/* ---------- BLOG POST ---------- */

function blogPostPage(post) {
  const canonical = `/blog/${post.slug}.html`;
  const crumbs = [
    { name: "Home", url: "/index.html" },
    { name: "Blog", url: "/blog.html" },
    { name: post.title, url: canonical },
  ];
  const schemas = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: post.title,
      description: post.metaDesc,
      datePublished: post.date,
      dateModified: post.date,
      author: { "@type": "Organization", name: SITE.name },
      publisher: {
        "@type": "Organization",
        name: SITE.name,
        logo: { "@type": "ImageObject", url: SITE.domain + "/images/eastcoast-logo.svg" },
      },
      mainEntityOfPage: SITE.domain + canonical,
    },
    faqSchema(post.faqs),
    breadcrumbSchema(crumbs),
  ];
  const bodyHtml = post.body
    .map((sec) => {
      const h = sec.h ? `<h2 class="text-2xl font-bold tracking-[-0.5px] text-[var(--px-navy)] mt-10 mb-3">${esc(sec.h)}</h2>` : "";
      const ps = sec.p.map((p) => `<p class="mb-4 text-[var(--px-text-light)] text-lg leading-relaxed">${esc(p)}</p>`).join("\n      ");
      return h + "\n      " + ps;
    })
    .join("\n      ");
  const related = (post.related || [])
    .map(svcBy)
    .filter(Boolean)
    .map((s) => `<a href="${svcUrl(s.slug)}" class="card p-5 group">
        <h3 class="font-semibold text-[var(--px-navy)] group-hover:text-[var(--px-blue)] transition">${esc(s.nav)} →</h3>
      </a>`)
    .join("\n        ");

  return `${head(post.metaTitle, post.metaDesc, canonical, schemas, "/images/panel-upgrade.jpg")}
${nav()}
${breadcrumbBar(crumbs)}

  <article class="max-w-3xl mx-auto px-4 sm:px-6 py-12">
    <a href="/blog.html" class="text-sm text-[var(--px-blue)] hover:underline">← Back to Blog</a>
    <h1 class="text-3xl md:text-5xl font-bold tracking-[-1.5px] text-[var(--px-navy)] mt-4 mb-3">${esc(post.title)}</h1>
    <div class="text-sm text-[var(--px-text-muted)] mb-8">East Coast AC & Heating • ${esc(post.read)}</div>
    <div>
      ${bodyHtml}
    </div>
    <div class="mt-10 p-6 rounded-2xl bg-[var(--px-navy)] text-white">
      <div class="font-semibold text-lg mb-1">Need a licensed HVAC technician in the Lower Mainland?</div>
      <p class="text-white/70 mb-4">Upfront pricing, 24/7 emergency service. Call or request a free quote.</p>
      <a href="${SITE.ctaHref || '/contact.html'}" class="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[var(--px-emergency)] hover:bg-red-700 text-white font-semibold transition">${phoneSvg} ${SITE.ctaLabel || 'Request a Quote'}</a>
    </div>
  </article>

  ${post.faqs && post.faqs.length ? faqBlock(post.faqs) : ""}

  <section class="section bg-[var(--px-offwhite)] border-y border-slate-100">
    <div class="max-w-5xl mx-auto px-4 sm:px-6">
      <h2 class="text-2xl md:text-3xl font-bold tracking-[-1px] text-[var(--px-navy)] mb-6 text-center">Related Services</h2>
      <div class="grid sm:grid-cols-2 gap-5 max-w-2xl mx-auto">
        ${related}
      </div>
    </div>
  </section>

${footer()}
${floatingButtons()}
${mobileScript}
</body>
</html>`;
}

/* ---------- BLOG HUB (regenerates /blog.html) ---------- */

function blogHub() {
  const canonical = "/blog.html";
  const crumbs = [
    { name: "Home", url: "/index.html" },
    { name: "Blog", url: canonical },
  ];
  const schemas = [localBusinessSchema(), breadcrumbSchema(crumbs)];
  const posts = BLOG.map((p) => ({ slug: p.slug, title: p.title, summary: p.summary, date: p.date, read: p.read }))
    .concat(EXISTING_BLOG);
  const cardOf = (p) => `<a href="/blog/${p.slug}.html" class="card p-7 group block">
        <div class="text-xs text-[var(--px-text-muted)] mb-2">${esc(p.read)}</div>
        <h2 class="font-semibold text-xl mb-2 text-[var(--px-navy)] group-hover:text-[var(--px-blue)] transition tracking-tight">${esc(p.title)}</h2>
        <p class="text-sm text-[var(--px-gray)] mb-3">${esc(p.summary)}</p>
        <span class="text-sm font-medium text-[var(--px-blue)]">Read article →</span>
      </a>`;
  return `${head(
    "HVAC Tips & Guides | East Coast AC & Heating Blog (Surrey & Lower Mainland)",
    "Cost guides, safety tips and how-tos from licensed Lower Mainland HVAC — furnace, AC, heat pumps, boilers, mini-splits and 24/7 emergencies.",
    canonical,
    schemas
  )}
${nav()}
${breadcrumbBar(crumbs)}

  <header class="bg-white border-b border-[var(--px-border)]">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 py-14 md:py-20 text-center">
      <div class="text-[var(--px-blue)] font-semibold tracking-[1.5px] text-sm mb-3">HVAC TIPS &amp; GUIDES</div>
      <h1 class="text-4xl md:text-6xl font-bold tracking-[-2.5px] text-[var(--px-navy)] mb-5">The East Coast AC & Heating Blog</h1>
      <p class="max-w-2xl mx-auto text-lg md:text-xl text-[var(--px-text-light)]">Honest cost guides, safety tips and how-tos from licensed HVAC technicians serving Surrey &amp; the Lower Mainland.</p>
    </div>
  </header>

  <section class="section max-w-5xl mx-auto px-4 sm:px-6">
    <div class="grid md:grid-cols-2 gap-6">
      ${posts.map(cardOf).join("\n      ")}
    </div>
  </section>

${ctaBand()}
${footer()}
${floatingButtons()}
${mobileScript}
</body>
</html>`;
}

/* ---------- llms.txt (AI crawler summary) ---------- */

function buildLlmsTxt() {
  const lines = [];
  lines.push(`# ${SITE.name}`);
  lines.push("");
  lines.push(`> Licensed 24/7 emergency HVAC serving Surrey and the entire Lower Mainland & Fraser Valley, British Columbia, Canada. Phone: 778-344-4938. Based at ${SITE.address.street}, ${SITE.address.city}, ${SITE.address.region}. Handle: ${SITE.handle}.`);
  lines.push("");
  lines.push("East Coast AC & Heating Ltd is a Surrey-based HVAC / plumbing-heating contractor offering 24/7 emergency heating and cooling, furnace and AC repair, heat pumps, boilers, ductless mini-splits, maintenance, thermostats, and furnace-safety inspections. Contact form only until a public number is live. No invented prices or review counts.");
  lines.push("");
  lines.push("## Services");
  SERVICES.forEach((s) => lines.push(`- [${s.nav}](${SITE.domain}${svcUrl(s.slug)}): ${s.heroSub.split(".")[0]}.`));
  lines.push("");
  lines.push("## Service Areas");
  LOCATIONS.forEach((l) => lines.push(`- [HVAC in ${l.city}](${SITE.domain}${locUrl(l.slug)})`));
  lines.push("");
  lines.push("## Guides");
  BLOG.forEach((p) => lines.push(`- [${p.title}](${SITE.domain}/blog/${p.slug}.html): ${p.summary}`));
  lines.push("");
  lines.push("## Contact");
  lines.push('- Phone: 778-344-4938 — use the contact form');
  lines.push('- Email: coming soon — call 778-344-4938');
  lines.push(`- Website: ${SITE.domain}`);
  lines.push(`- Hours: Emergency 24/7/365; regular service Mon–Fri 7:00 AM – 6:00 PM`);
  lines.push("");
  return lines.join("\n");
}

/* ---------- ABOUT PAGE (E-E-A-T) ---------- */

function aboutPage() {
  const canonical = "/about.html";
  const crumbs = [
    { name: "Home", url: "/index.html" },
    { name: "About", url: canonical },
  ];
  const companyFaqs = [
    ["Is East Coast AC & Heating licensed?", "East Coast AC & Heating Ltd is a City of Surrey licensed HVAC / plumbing-heating contractor. We do not publish a licence number we cannot verify on this site."],
    ["How long have you been in business?", `East Coast AC & Heating Ltd is a Surrey-based HVAC / plumbing-heating contractor. We do not publish invented years-in-business or job counts on this site.`],
    ["What areas does East Coast AC & Heating serve?", "We are based in Surrey and serve the entire Lower Mainland and Fraser Valley, including Vancouver, Burnaby, Langley, Coquitlam, the Tri-Cities, New Westminster, White Rock, Delta, Richmond, the North Shore, Maple Ridge, Pitt Meadows and Abbotsford."],
    ["Do you offer 24/7 emergency HVAC?", "Yes — 24/7 emergency heating and cooling. Until our public phone number is live, request dispatch through the contact form."],
    ["Is your work done to code and inspected?", "Permitted HVAC work follows applicable BC codes and municipal requirements. We do not skip permits on work that needs them."],
  ];
  const schemas = [
    localBusinessSchema({
      
      slogan: "Professional, reliable, local heating and cooling services you can trust — 24/7.",
      knowsAbout: SERVICES.map((s) => s.nav),
      
    }),
    { "@context": "https://schema.org", "@type": "AboutPage", name: "About East Coast AC & Heating Ltd", url: SITE.domain + canonical },
    faqSchema(companyFaqs),
    breadcrumbSchema(crumbs),
  ];

  const credList = [
    "Licensed HVAC technicians",
    "City of Surrey licensed contractor",
    "Permits on work that needs them",
    "Permits and inspections as required",
    "Permitted HVAC work to applicable BC codes",
    "City of Surrey licensed HVAC / plumbing-heating contractor",
  ];
  const licenceLine = SITE.licenseNumber
    ? `<div class="font-semibold text-[var(--px-navy)]">✓ Technical Safety BC Licence&nbsp;#${esc(SITE.licenseNumber)}</div>`
    : "";

  const values = [
    ["Fully Licensed", "City of Surrey licensed HVAC / plumbing-heating contractor. Permits on work that needs them. We do not invent licence numbers or review scores."],
    ["Transparent, Upfront Pricing", "You always know what we're doing, why, and exactly what it will cost before any work begins. No surprise overtime fees, ever."],
    ["Genuine 24/7 Response", "When the furnace dies at 2 a.m. or the AC fails in a heat wave, request emergency service. We do not use another company's phone number on this site — 778-344-4938."],
    ["Work We Stand Behind", "Quality materials, code-compliant workmanship and clear follow-up. If something isn't right, we make it right."],
  ];

  const svcChips = SERVICES.map((s) => `<a href="${svcUrl(s.slug)}" class="inline-block px-3 py-1.5 rounded-full bg-[var(--px-light-gray)] text-sm text-[var(--px-text)] hover:bg-[var(--px-navy)] hover:text-white transition">${esc(s.nav)}</a>`).join("\n        ");

  return `${head(
    "About East Coast AC & Heating Ltd | Licensed HVAC Technicians in Surrey, BC",
    "Meet East Coast AC & Heating Ltd — a City of Surrey licensed HVAC / plumbing-heating contractor serving Surrey and the Lower Mainland. Request a quote — 778-344-4938.",
    canonical,
    schemas,
    "/images/team.png"
  )}
${nav()}
${breadcrumbBar(crumbs)}

  <header class="bg-white border-b border-[var(--px-border)]">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-20">
      <div class="max-w-3xl">
        <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--px-light-gray)] text-sm mb-6 text-[var(--px-text-muted)]">
          <div class="w-2 h-2 bg-[var(--px-success)] rounded-full animate-pulse"></div>
          <span class="font-medium tracking-wide">HVAC service for Surrey &amp; the Lower Mainland</span>
        </div>
        <h1 class="text-4xl md:text-6xl font-bold tracking-[-2px] text-[var(--px-navy)] mb-6">Licensed Local HVAC You Can Trust.</h1>
        <p class="text-xl text-[var(--px-text-light)]">East Coast AC & Heating Ltd was built on a simple belief: every homeowner and business deserves clear communication, fair pricing, and HVAC work that lasts.</p>
      </div>
    </div>
  </header>

  <section class="section max-w-7xl mx-auto px-4 sm:px-6">
    <div class="grid lg:grid-cols-12 gap-12 items-center">
      <div class="lg:col-span-7">
        <h2 class="text-3xl md:text-4xl font-bold tracking-[-1px] text-[var(--px-navy)] mb-6">Our Story</h2>
        <div class="space-y-4 text-[var(--px-text-light)] text-lg">
          <p>East Coast AC & Heating Ltd is based in Surrey, BC. Our 2025 licence address is 7156 144 St, Unit 18, Surrey, BC. We provide honest heating and cooling work with upfront quotes and no invented website prices.</p>
          <p>We specialize in genuine 24/7 emergency heating and cooling response while delivering furnace and AC repair, heat pumps, boilers, ductless mini-splits, maintenance, thermostats, and furnace-safety inspections. We do not invent years in business, review counts, or prices on this website.</p>
          <p>We are a local Surrey HVAC / plumbing-heating contractor. We treat every property with care and pull permits when the job requires them.</p>
        </div>
      </div>
      <div class="lg:col-span-5 bg-[var(--px-offwhite)] rounded-2xl p-8">
        <div class="grid grid-cols-2 gap-6 text-center">
          <div><div class="text-4xl font-bold text-[var(--px-navy)]">24/7</div><div class="text-sm text-[var(--px-text-muted)] mt-1">Emergency HVAC</div></div>
          <div><div class="text-4xl font-bold text-[var(--px-navy)]">Surrey</div><div class="text-sm text-[var(--px-text-muted)] mt-1">Based in BC</div></div>
          <div><div class="text-4xl font-bold text-[var(--px-navy)]">Licensed</div><div class="text-sm text-[var(--px-text-muted)] mt-1">City of Surrey HVAC</div></div>
          <div><div class="text-4xl font-bold text-[var(--px-navy)]">24/7</div><div class="text-sm text-[var(--px-text-muted)] mt-1">Emergency Response</div></div>
        </div>
      </div>
    </div>
  </section>

  <section class="section bg-[var(--px-offwhite)] border-y border-slate-100">
    <div class="max-w-7xl mx-auto px-4 sm:px-6">
      <div class="text-center mb-12">
        <div class="text-[var(--px-blue)] font-semibold tracking-[1.5px] text-sm mb-2">WHY EAST COAST</div>
        <h2 class="text-3xl md:text-4xl font-bold tracking-[-1px] text-[var(--px-navy)]">What Sets Us Apart</h2>
      </div>
      <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        ${values.map(([t, d]) => `<div class="card p-7">
          <h3 class="font-semibold text-xl mb-2 text-[var(--px-navy)]">${esc(t)}</h3>
          <p class="text-[var(--px-text-light)]">${esc(d)}</p>
        </div>`).join("\n        ")}
      </div>
    </div>
  </section>

  <section class="section max-w-7xl mx-auto px-4 sm:px-6">
    <div class="grid lg:grid-cols-2 gap-10 items-center">
      <div class="rounded-3xl overflow-hidden shadow-lg ring-1 ring-slate-200">
        <img src="/images/team.png" alt="The East Coast AC & Heating team — licensed Surrey HVAC technicians" class="w-full h-80 object-cover" />
      </div>
      <div>
        <h2 class="text-3xl md:text-4xl font-bold tracking-[-1px] text-[var(--px-navy)] mb-5">Credentials &amp; Licensing</h2>
        <p class="text-[var(--px-text-light)] text-lg mb-6">We don't just say we're qualified — we hold the certifications to prove it, and we follow the Permitted HVAC work to applicable BC codes.</p>
        <div class="grid sm:grid-cols-2 gap-x-6 gap-y-3 text-[var(--px-text-light)]">
          ${licenceLine}
          ${credList.map((c) => `<div class="flex gap-2"><span class="text-[var(--px-success)] font-bold">✓</span><span>${esc(c)}</span></div>`).join("\n          ")}
        </div>
      </div>
    </div>
  </section>

  <section class="section bg-white border-y border-slate-100">
    <div class="max-w-5xl mx-auto px-4 sm:px-6 text-center">
      <h2 class="text-2xl md:text-3xl font-bold tracking-[-1px] text-[var(--px-navy)] mb-3">Everything We Do</h2>
      <p class="text-[var(--px-gray)] mb-6 max-w-2xl mx-auto">One licensed contractor for emergencies, upgrades, EV charging, rewiring, and full commercial &amp; strata work across the Lower Mainland.</p>
      <div class="flex flex-wrap justify-center gap-2 mb-6">
        ${svcChips}
      </div>
      <div class="flex flex-col sm:flex-row gap-4 justify-center">
        <a href="/services.html" class="inline-flex items-center justify-center px-7 py-3 rounded-2xl text-base font-semibold border-2 border-[var(--px-navy)] text-[var(--px-navy)] hover:bg-[var(--px-navy)] hover:text-white transition">View all services</a>
        <a href="/service-areas.html" class="inline-flex items-center justify-center px-7 py-3 rounded-2xl text-base font-semibold border-2 border-[var(--px-navy)] text-[var(--px-navy)] hover:bg-[var(--px-navy)] hover:text-white transition">Where we work</a>
      </div>
    </div>
  </section>

  ${faqBlock(companyFaqs)}

${ctaBand()}
${footer()}
${floatingButtons()}
${mobileScript}
</body>
</html>`;
}

/* ---------- sitemap ---------- */

function buildSitemap() {
  const today = "2026-05-30";
  const urls = [];
  const add = (loc, priority, changefreq) =>
    urls.push(`  <url>\n    <loc>${SITE.domain}${loc}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`);

  add("/", "1.0", "weekly");
  add("/services.html", "0.9", "weekly");
  add("/service-areas.html", "0.9", "weekly");
  add("/about.html", "0.7", "monthly");
  add("/projects.html", "0.7", "monthly");
  add("/pricing.html", "0.8", "monthly");
  add("/blog.html", "0.7", "weekly");
  add("/contact.html", "0.8", "monthly");
  SERVICES.forEach((s) => add(svcUrl(s.slug), "0.8", "monthly"));
  LOCATIONS.forEach((l) => add(locUrl(l.slug), "0.8", "monthly"));
  NEIGHBOURHOODS.forEach((n) => add(locUrl(n.slug), "0.6", "monthly"));
  comboServices.forEach((s) => LOCATIONS.forEach((l) => add(comboUrl(s.slug, l.slug), "0.7", "monthly")));
  BLOG.forEach((p) => add(`/blog/${p.slug}.html`, "0.6", "monthly"));
  EXISTING_BLOG.forEach((p) => add(`/blog/${p.slug}.html`, "0.6", "monthly"));

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>\n`;
}

/* ---------- write everything ---------- */

function ensureDir(p) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}
function write(rel, content) {
  const full = path.join(ROOT, rel);
  ensureDir(path.dirname(full));
  fs.writeFileSync(full, content, "utf8");
  console.log("  ✓ " + rel);
}

console.log("Generating SEO silo pages…");
write("about.html", aboutPage());
write("services.html", servicesHub());
write("service-areas.html", areasHub());
SERVICES.forEach((s) => write(`services/${s.slug}.html`, servicePage(s)));
LOCATIONS.forEach((l) => write(`locations/hvac-${l.slug}.html`, locationPage(l)));

let comboCount = 0;
comboServices.forEach((s) =>
  LOCATIONS.forEach((l) => {
    write(`local/${s.slug}-${l.slug}.html`, comboPage(s, l));
    comboCount++;
  })
);

NEIGHBOURHOODS.forEach((n) => write(`locations/hvac-${n.slug}.html`, neighbourhoodPage(n)));

write("blog.html", blogHub());
BLOG.forEach((p) => write(`blog/${p.slug}.html`, blogPostPage(p)));

write("public/sitemap.xml", buildSitemap());
write("public/llms.txt", buildLlmsTxt());

console.log(
  `\nDone: ${SERVICES.length} services, ${LOCATIONS.length} cities, ${NEIGHBOURHOODS.length} neighbourhoods, ${comboCount} combo pages, ${BLOG.length} blog posts, 3 hubs, sitemap.xml, llms.txt.`
);
