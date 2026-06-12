// =====================================================================
// RENDER ENGINE. Generates page content from SITE (js/data.js).
// You normally never need to edit this file; add content in data.js.
// =====================================================================

(function () {
  "use strict";

  // ---------- helpers ----------------------------------------------

  function esc(s) {
    return String(s ?? "").replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    }[c]));
  }

  function html(strings, ...vals) {
    return strings.reduce((out, str, i) => out + str + (vals[i] ?? ""), "");
  }

  function mount(sel, markup) {
    const node = document.querySelector(sel);
    if (node) node.innerHTML = markup;
  }

  function param(name) {
    return new URLSearchParams(location.search).get(name);
  }

  // ---------- inline SVG marks --------------------------------------
  // Brand/instrument glyphs drawn as single-color strokes so they sit
  // in the survey palette. Add a new key here, reference it from data.js.

  const ICONS = {
    github:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 .5C5.7.5.5 5.7.5 12c0 5.1 3.3 9.4 7.9 10.9.6.1.8-.2.8-.6v-2c-3.2.7-3.9-1.4-3.9-1.4-.5-1.3-1.3-1.7-1.3-1.7-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.7 1.3 3.4 1 .1-.8.4-1.3.7-1.6-2.6-.3-5.3-1.3-5.3-5.7 0-1.3.5-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0c2.3-1.5 3.3-1.2 3.3-1.2.6 1.6.2 2.8.1 3.1.8.8 1.2 1.8 1.2 3.1 0 4.4-2.7 5.4-5.3 5.7.4.4.8 1.1.8 2.2v3.3c0 .4.2.7.8.6 4.6-1.5 7.9-5.8 7.9-10.9C23.5 5.7 18.3.5 12 .5z"/></svg>',
    linkedin:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M20.5 2h-17A1.5 1.5 0 0 0 2 3.5v17A1.5 1.5 0 0 0 3.5 22h17a1.5 1.5 0 0 0 1.5-1.5v-17A1.5 1.5 0 0 0 20.5 2zM8 19H5V8h3v11zM6.5 6.7a1.8 1.8 0 1 1 0-3.6 1.8 1.8 0 0 1 0 3.6zM19 19h-3v-5.6c0-1.3 0-3-1.9-3s-2.1 1.4-2.1 2.9V19h-3V8h2.9v1.5h.04A3.2 3.2 0 0 1 16.8 8c3 0 3.6 2 3.6 4.6V19z"/></svg>',
    orcid:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.6 0 12 0zM7.4 17.6H5.7V7.1h1.7v10.5zM6.5 5.8a1.1 1.1 0 1 1 0-2.2 1.1 1.1 0 0 1 0 2.2zM18.3 12.5c0 3-1.9 5.1-4.9 5.1H9.6V7.1h3.8c2.9 0 4.9 2 4.9 5.4zm-1.8 0c0-2.3-1.4-3.8-3.3-3.8h-1.9v7.3h1.9c1.7 0 3.3-1.1 3.3-3.5z"/></svg>',
    wos:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" d="M4 4l4 16 4-11 4 11 4-16M12 4v6"/></svg>',
  };

  // Geomatics equipment glyphs.
  //  - Optical instruments carry a `.track-yaw` group (the whole sighting
  //    head: telescope barrel, lens, mount) that pans left/right around a
  //    vertical axis at the inline transform-origin. At rest the barrel
  //    points right; negative yaw points it left.
  //  - The tape carries a `.track-extend` ribbon that stretches along X.
  //  data-pivot-x / data-pivot-y: rotation/anchor point as a fraction of
  //  the rendered box (used by the tracker to read cursor direction).
  const INSTRUMENTS = {
    totalStation: html`
      <svg class="instrument" viewBox="0 0 64 64" data-kind="yaw" data-pivot-x="0.5" data-pivot-y="0.42" aria-hidden="true">
        <g fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
          <path d="M32 42 L18 60 M32 42 L46 60 M32 44 V60"/>
          <path d="M24 42 H40"/>
          <g class="track-yaw" style="transform-origin:32px 30px">
            <path d="M26 38 V32 M38 38 V32"/>
            <rect x="22" y="22" width="20" height="10" rx="2"/>
            <rect x="42" y="24.5" width="9" height="5" rx="1.5"/>
            <circle cx="27" cy="27" r="1.6" fill="currentColor" stroke="none"/>
          </g>
        </g>
      </svg>`,
    theodolite: html`
      <svg class="instrument" viewBox="0 0 64 64" data-kind="yaw" data-pivot-x="0.5" data-pivot-y="0.42" aria-hidden="true">
        <g fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
          <path d="M32 47 L19 61 M32 47 L45 61 M32 47 V61"/>
          <ellipse cx="32" cy="44" rx="10" ry="2.6"/>
          <g class="track-yaw" style="transform-origin:32px 33px">
            <path d="M24 41 V31 M40 41 V31"/>
            <rect x="22" y="25" width="20" height="8" rx="2"/>
            <path d="M42 29 H50"/>
            <circle cx="27" cy="29" r="1.6" fill="currentColor" stroke="none"/>
          </g>
        </g>
      </svg>`,
    gnss: html`
      <svg class="instrument" viewBox="0 0 64 64" data-kind="yaw" data-pivot-x="0.5" data-pivot-y="0.3" aria-hidden="true">
        <g fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
          <path d="M32 24 V55 M32 55 L28 61 M32 55 L36 61"/>
          <rect x="40" y="36" width="9" height="13" rx="2"/>
          <path d="M40 42 H32"/>
          <g class="track-yaw" style="transform-origin:32px 20px">
            <ellipse cx="32" cy="20" rx="13" ry="4.5"/>
            <path d="M22 18 Q32 9 42 18"/>
            <path d="M32 16 V11"/>
          </g>
        </g>
      </svg>`,
    tape: html`
      <svg class="instrument" viewBox="0 0 64 64" data-kind="extend" data-pivot-x="0.36" data-pivot-y="0.5" aria-hidden="true">
        <g fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="23" cy="32" r="13"/>
          <circle cx="23" cy="32" r="4"/>
          <rect x="20" y="14" width="6" height="4" rx="1"/>
          <g class="track-extend" style="transform-origin:36px 32px">
            <path d="M36 32 H56"/>
            <path d="M56 28 V36"/>
          </g>
        </g>
      </svg>`,
    level: html`
      <svg class="instrument" viewBox="0 0 64 64" data-kind="yaw" data-pivot-x="0.5" data-pivot-y="0.46" aria-hidden="true">
        <g fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
          <path d="M32 42 L18 60 M32 42 L46 60 M32 44 V60"/>
          <path d="M25 42 H39"/>
          <g class="track-yaw" style="transform-origin:32px 32px">
            <rect x="18" y="27" width="28" height="9" rx="3"/>
            <rect x="46" y="29" width="7" height="5" rx="1.5"/>
            <path d="M22 27 V24"/>
            <circle cx="23" cy="31.5" r="1.6" fill="currentColor" stroke="none"/>
          </g>
        </g>
      </svg>`,
    prism: html`
      <svg class="instrument" viewBox="0 0 64 64" data-kind="yaw" data-pivot-x="0.5" data-pivot-y="0.32" aria-hidden="true">
        <g fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
          <path d="M32 31 V57 M32 57 L28 63 M32 57 L36 63"/>
          <g class="track-yaw" style="transform-origin:32px 20px">
            <circle cx="32" cy="20" r="9"/>
            <path d="M32 12 L40 25 H24 Z"/>
            <path d="M41 20 H47"/>
          </g>
        </g>
      </svg>`,
    drone: html`
      <svg class="instrument" viewBox="0 0 64 64" data-kind="yaw" data-pivot-x="0.5" data-pivot-y="0.68" aria-hidden="true">
        <g fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
          <path d="M10 19 H26 M38 19 H54"/>
          <path d="M18 19 V23 M46 19 V23"/>
          <path d="M18 23 L27 30 M46 23 L37 30"/>
          <rect x="25" y="28" width="14" height="10" rx="2"/>
          <g class="track-yaw" style="transform-origin:32px 38px">
            <path d="M32 38 V41"/>
            <circle cx="32" cy="45" r="4"/>
            <path d="M36 45 H40"/>
          </g>
        </g>
      </svg>`,
  };

  // Heading order on the index page; cycles if sections outnumber kinds.
  const INSTRUMENT_ORDER = ["totalStation", "theodolite", "tape", "level", "drone", "prism", "gnss"];

  // Hand-drawn underline scribble for section headings.
  function scribbleSVG() {
    return '<svg class="scribble" viewBox="0 0 200 24" preserveAspectRatio="none" aria-hidden="true">' +
      '<path d="M3 14 C40 4 70 20 100 11 C130 3 160 19 197 9" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" pathLength="1"/>' +
      '</svg>';
  }

  function statusClass(status) {
    const s = status.toLowerCase();
    if (s.startsWith("published")) return "is-published";
    if (s.startsWith("under")) return "is-review";
    if (s.startsWith("presented")) return "is-presented";
    return "is-prep";
  }

  function logoBlock(item) {
    return html`
      <div class="logo-slot" data-monogram="${esc(item.monogram)}">
        <img src="${esc(item.logo)}" alt="${esc(item.institution)} logo" loading="lazy">
      </div>`;
  }

  // Swap broken logo images for styled monograms.
  function activateLogoFallbacks(scope) {
    (scope || document).querySelectorAll(".logo-slot img").forEach((img) => {
      const fail = () => {
        const slot = img.closest(".logo-slot");
        slot.classList.add("is-monogram");
        slot.textContent = slot.dataset.monogram;
      };
      if (img.complete && img.naturalWidth === 0) fail();
      else img.addEventListener("error", fail, { once: true });
    });
  }

  // ---------- shared chrome -----------------------------------------

  function renderHeader(active) {
    const links = [
      ["about", "About"], ["education", "Education"], ["skills", "Skills"],
      ["experience", "Experience"], ["projects", "Projects"],
      ["publications", "Publications"], ["contact", "Contact"],
    ];
    const onIndex = !!document.getElementById("page-index");
    const base = onIndex ? "" : "index.html";
    mount("#site-header", html`
      <div class="header-inner">
        <a class="wordmark" href="index.html">
          <span class="compass" aria-hidden="true">
            <svg viewBox="0 0 40 40">
              <circle cx="20" cy="20" r="18" fill="none" stroke="currentColor" stroke-width="2"/>
              <g class="compass-rose">
                <path d="M20 4 L24 20 L20 36 L16 20 Z" fill="currentColor"/>
                <path d="M4 20 L20 16 L36 20 L20 24 Z" fill="none" stroke="currentColor" stroke-width="1.5"/>
              </g>
              <circle cx="20" cy="20" r="2" fill="currentColor"/>
            </svg>
          </span>
          ${esc(SITE.meta.shortName)}
        </a>
        <nav class="site-nav" aria-label="Sections">
          ${links.map(([id, label]) => html`
            <a href="${base}#${id}" data-section="${id}"
               class="${active === id ? "is-active" : ""}">${label}</a>`).join("")}
        </nav>
      </div>`);
  }

  function renderFooter() {
    mount("#site-footer", html`
      <div class="footer-inner">
        <span class="mono-label">${esc(SITE.meta.name)} · ${esc(SITE.meta.coords)}</span>
        <span class="mono-label">SHEET COMPILED ${new Date().getFullYear()}</span>
      </div>`);
  }

  // ---------- index sections ----------------------------------------

  function renderHero() {
    mount("#hero", html`
      <span class="hero-backdrop" aria-hidden="true">GEO</span>
      <p class="mono-label hero-eyebrow">${esc(SITE.about.eyebrow)} · ${esc(SITE.meta.coords)}</p>
      <h1 class="hero-name">${esc(SITE.meta.name)}${scribbleSVG()}</h1>
      <p class="hero-role">${esc(SITE.meta.role)}</p>
      <p class="hero-loc mono-label">${esc(SITE.meta.location)}</p>`);
  }

  function renderAbout() {
    mount("#about-body", html`
      <h2 class="section-heading">${esc(SITE.about.heading)}</h2>
      <div class="about-text">
        ${SITE.about.paragraphs.map((p) => html`<p>${esc(p)}</p>`).join("")}
      </div>
      <ul class="tag-row" aria-label="Research interests">
        ${SITE.about.tags.map((t) => html`<li class="tag">${esc(t)}</li>`).join("")}
      </ul>`);
  }

  function renderEducation() {
    mount("#education-body", SITE.education.map((d) => html`
      <a class="card edu-card" href="education.html?id=${esc(d.id)}">
        ${logoBlock(d)}
        <div class="edu-main">
          <h3 class="card-title">${esc(d.degree)}</h3>
          <p class="card-org">${esc(d.institution)}</p>
          <p class="card-summary">${esc(d.summary)}</p>
        </div>
        <div class="edu-side">
          <span class="mono-label">${esc(d.period)}</span>
          <span class="mono-label">${esc(d.coords)}</span>
          <span class="mono-label">GPA ${esc(d.gpa)}</span>
          <span class="card-cta mono-label">DETAILS →</span>
        </div>
      </a>`).join(""));
  }

  function renderSkills() {
    mount("#skills-body", SITE.skills.map((g) => html`
      <div class="skill-group">
        <h3 class="mono-label skill-group-name">${esc(g.group)}</h3>
        <ul class="tag-row">
          ${g.items.map((s) => html`<li class="tag">${esc(s)}</li>`).join("")}
        </ul>
      </div>`).join(""));
  }

  function renderExperience() {
    mount("#experience-body", html`
      <ol class="exp-list">
        ${SITE.experience.map((e) => html`
          <li class="exp-row">
            <span class="mono-label exp-period">${esc(e.period)}</span>
            <div class="exp-main">
              <h3 class="exp-role">${esc(e.role)}</h3>
              <p class="exp-org">${esc(e.org)}</p>
              ${e.note ? html`<p class="exp-note">${esc(e.note)}</p>` : ""}
            </div>
          </li>`).join("")}
      </ol>`);
  }

  function renderProjects() {
    mount("#projects-body", SITE.projects.map((p) => {
      const inner = html`
        <div class="proj-head">
          <h3 class="card-title">${esc(p.name)}</h3>
          <span class="mono-label proj-type">${esc(p.type)}</span>
        </div>
        <p class="card-summary">${esc(p.description)}</p>
        <ul class="tag-row tag-row-small">
          ${p.stack.map((s) => html`<li class="tag tag-small">${esc(s)}</li>`).join("")}
        </ul>
        ${p.link ? html`<span class="card-cta mono-label">VIEW →</span>` : ""}`;
      return p.link
        ? html`<a class="card proj-card" href="${esc(p.link)}" target="_blank" rel="noopener">${inner}</a>`
        : html`<div class="card proj-card">${inner}</div>`;
    }).join(""));
  }

  function renderPublications() {
    mount("#publications-body", html`
      <ol class="pub-list">
        ${SITE.publications.map((p) => html`
          <li>
            <a class="pub-row" href="publication.html?id=${esc(p.id)}">
              <span class="mono-label pub-year">${p.year === "n/a" ? "·" : esc(p.year)}</span>
              <div class="pub-main">
                <h3 class="pub-title">${esc(p.title)}</h3>
                <p class="pub-venue">${esc(p.kind)} · ${esc(p.venue)}</p>
              </div>
              <span class="status ${statusClass(p.status)}">${esc(p.status)}</span>
            </a>
          </li>`).join("")}
      </ol>`);
  }

  function renderContacts() {
    mount("#contact-body", html`
      <ul class="contact-grid">
        ${SITE.contacts.map((c, i) => html`
          <li>
            <a class="card contact-card" href="${esc(c.url)}" target="_blank" rel="noopener" aria-label="${esc(c.label)}">
              <span class="contact-mark">${ICONS[c.icon] || ""}</span>
              <span class="contact-meta">
                <span class="mono-label">${esc(c.label)}</span>
                ${c.value ? html`<span class="contact-value">${esc(c.value)}</span>` : ""}
              </span>
              <span class="contact-index mono-label">0${i + 1}</span>
            </a>
          </li>`).join("")}
      </ul>`);
  }

  // ---------- detail pages ------------------------------------------

  function renderEducationDetail() {
    const d = SITE.education.find((e) => e.id === param("id")) || SITE.education[0];
    document.title = `${d.institution} · ${SITE.meta.name}`;
    mount("#detail-body", html`
      <a class="back-link mono-label" href="index.html#education">← ALL EDUCATION</a>
      <div class="detail-head">
        ${logoBlock(d)}
        <div>
          <p class="mono-label">${esc(d.period)} · ${esc(d.place)} · ${esc(d.coords)}</p>
          <h1 class="detail-title">${esc(d.degree)}</h1>
          <p class="detail-sub">${esc(d.institution)} · GPA ${esc(d.gpa)}</p>
        </div>
      </div>
      <section class="detail-section">
        <h2 class="mono-label detail-label">FOCUS</h2>
        <p class="detail-text">${esc(d.detail.focus)}</p>
      </section>
      <section class="detail-section">
        <h2 class="mono-label detail-label">SKILLS DEVELOPED</h2>
        <ul class="rule-list">
          ${d.detail.skills.map((s) => html`<li>${esc(s)}</li>`).join("")}
        </ul>
      </section>
      <section class="detail-section">
        <h2 class="mono-label detail-label">HIGHLIGHTS</h2>
        <ul class="rule-list">
          ${d.detail.highlights.map((s) => html`<li>${esc(s)}</li>`).join("")}
        </ul>
      </section>`);
    activateLogoFallbacks();
  }

  function renderPublicationDetail() {
    const p = SITE.publications.find((x) => x.id === param("id")) || SITE.publications[0];
    document.title = `${p.title} · ${SITE.meta.name}`;
    mount("#detail-body", html`
      <a class="back-link mono-label" href="index.html#publications">← ALL PUBLICATIONS</a>
      <div class="detail-head">
        <div>
          <p class="mono-label">${esc(p.kind)}${p.year === "n/a" ? "" : " · " + esc(p.year)}</p>
          <h1 class="detail-title">${esc(p.title)}</h1>
          <p class="detail-sub">${esc(p.venue)}</p>
          <span class="status ${statusClass(p.status)}">${esc(p.status)}</span>
        </div>
      </div>
      <section class="detail-section">
        <h2 class="mono-label detail-label">ABSTRACT</h2>
        <p class="detail-text">${esc(p.abstract)}</p>
      </section>
      ${p.doi ? html`
        <section class="detail-section">
          <h2 class="mono-label detail-label">DOI</h2>
          <a class="detail-link" href="https://doi.org/${esc(p.doi)}" target="_blank" rel="noopener">${esc(p.doi)}</a>
        </section>` : ""}
      ${p.link ? html`
        <section class="detail-section">
          <h2 class="mono-label detail-label">${esc(p.linkLabel || "LINK")}</h2>
          <a class="detail-link" href="${esc(p.link)}" target="_blank" rel="noopener">${esc(p.link)}</a>
        </section>` : ""}`);
  }

  // ---------- in-page behaviour --------------------------------------

  // Add a scribble underline + tracking instrument to each section heading.
  function decorateHeadings() {
    document.querySelectorAll(".section-marker").forEach((marker, i) => {
      const h = marker.querySelector("h2");
      if (h && !h.querySelector(".scribble")) {
        h.insertAdjacentHTML("beforeend", scribbleSVG());
      }
      if (!marker.querySelector(".instrument")) {
        const kind = INSTRUMENT_ORDER[i % INSTRUMENT_ORDER.length];
        marker.insertAdjacentHTML("beforeend", INSTRUMENTS[kind]);
      }
    });
  }

  // Animate instruments toward the pointer. Two behaviours:
  //  yaw    -> the sighting head pans to face the cursor's side (left or
  //            right via horizontal mirror) with a gentle vertical tilt;
  //            no full-circle wrap, so crossing the axis never snaps.
  //  extend -> the tape ribbon stretches along X with cursor distance.
  // One rAF-throttled pointer listener drives every instance.
  function setupInstrumentTracking() {
    const instruments = Array.from(document.querySelectorAll(".instrument"));
    if (!instruments.length) return;
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let mx = window.innerWidth / 2, my = window.innerHeight / 2, queued = false;

    const TILT_MAX = 22;      // degrees of vertical lean
    const EXTEND_MIN = 0.45;  // tape ribbon scale floor
    const EXTEND_MAX = 1.35;  // tape ribbon scale ceiling

    function apply() {
      queued = false;
      instruments.forEach((svg) => {
        const r = svg.getBoundingClientRect();
        const cx = r.left + r.width * parseFloat(svg.dataset.pivotX);
        const cy = r.top + r.height * parseFloat(svg.dataset.pivotY);
        const dx = mx - cx, dy = my - cy;

        if (svg.dataset.kind === "extend") {
          const part = svg.querySelector(".track-extend");
          if (!part) return;
          // Ribbon pulls out to the right; length tracks horizontal reach.
          const reach = Math.max(0, dx) + Math.abs(dy) * 0.15;
          const norm = Math.max(0, Math.min(1, reach / (r.width * 1.6)));
          const scale = EXTEND_MIN + norm * (EXTEND_MAX - EXTEND_MIN);
          part.style.transform = `scaleX(${scale})`;
          return;
        }

        const part = svg.querySelector(".track-yaw");
        if (!part) return;
        // Face the cursor's side; tilt by vertical angle, bounded.
        const facingLeft = dx < 0;
        const tilt = Math.max(-TILT_MAX, Math.min(TILT_MAX,
          Math.atan2(dy, Math.abs(dx) + 0.001) * 180 / Math.PI * 0.6));
        const flip = facingLeft ? -1 : 1;
        // Mirror first (face left/right), then tilt around the pivot.
        part.style.transform = `scaleX(${flip}) rotate(${flip * tilt}deg)`;
      });
    }
    function queue() {
      if (!queued) { queued = true; requestAnimationFrame(apply); }
    }
    window.addEventListener("pointermove", (e) => { mx = e.clientX; my = e.clientY; queue(); }, { passive: true });
    window.addEventListener("scroll", queue, { passive: true });
    apply();
  }


  function setupScrollSpy() {
    const links = document.querySelectorAll(".site-nav a[data-section]");
    const map = {};
    links.forEach((a) => {
      const sec = document.getElementById(a.dataset.section);
      if (sec) map[a.dataset.section] = a;
    });
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const link = map[entry.target.id];
        if (link && entry.isIntersecting) {
          links.forEach((a) => a.classList.remove("is-active"));
          link.classList.add("is-active");
        }
      });
    }, { rootMargin: "-40% 0px -55% 0px" });
    Object.keys(map).forEach((id) => observer.observe(document.getElementById(id)));
  }

  function setupReveal() {
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const targets = document.querySelectorAll(".section, .card");
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-revealed");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 });
    targets.forEach((t) => {
      t.classList.add("will-reveal");
      observer.observe(t);
    });
  }

  // ---------- boot ----------------------------------------------------

  document.addEventListener("DOMContentLoaded", () => {
    renderHeader();
    renderFooter();

    if (document.getElementById("page-index")) {
      renderHero();
      renderAbout();
      renderEducation();
      renderSkills();
      renderExperience();
      renderProjects();
      renderPublications();
      renderContacts();
      activateLogoFallbacks();
      decorateHeadings();
      setupInstrumentTracking();
      setupScrollSpy();
      setupReveal();
    } else if (document.getElementById("page-education")) {
      renderEducationDetail();
    } else if (document.getElementById("page-publication")) {
      renderPublicationDetail();
    }
  });
})();
