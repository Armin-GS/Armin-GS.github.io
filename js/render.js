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

  // Geomatics instrument glyphs, two-axis model.
  //
  // Real survey instruments move on two axes:
  //   pan  (azimuth)   - the alidade rotates about a VERTICAL axis. In a 2D
  //                      side view this reads as a horizontal mirror.
  //   tilt (elevation) - the telescope rotates about the horizontal trunnion
  //                      axis. Only the barrel moves; the standards do not.
  //
  // So each optical instrument nests:
  //   <g class="track-pan">            alidade: standards + telescope
  //     <g class="track-tilt"> ... </g>  telescope barrel only, pivot = trunnion
  //   </g>
  // Everything outside .track-pan (tripod, tribrach, pole) is fixed.
  //
  // data-kind    optical | extend
  // data-pivot-x/y   trunnion position as a fraction of the box, used to
  //                  measure the cursor vector. Keep x near 0.5 so mirroring
  //                  does not shift the pivot.
  // data-tilt-max    elevation limit in degrees.
  const INSTRUMENTS = {

    // Total station: chunky alidade, objective hood, tripod.
    totalStation: html`
      <svg class="instrument" viewBox="0 0 64 64" data-kind="optical" data-pivot-x="0.5" data-pivot-y="0.42" data-tilt-max="26" aria-hidden="true">
        <g fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
          <path d="M32 44 L19 60 M32 44 L45 60 M32 46 V60"/>
          <path d="M24 44 H40"/>
          <g class="track-pan" style="transform-origin:32px 32px">
            <path d="M26 43 V32 M38 43 V32"/>
            <g class="track-tilt" style="transform-origin:32px 27px">
              <rect x="21" y="22" width="22" height="10" rx="2"/>
              <rect x="43" y="24.5" width="7" height="5" rx="1.5"/>
              <circle cx="26" cy="27" r="1.7" fill="currentColor" stroke="none"/>
            </g>
          </g>
        </g>
      </svg>`,

    // Theodolite: slim standards, circular base plate.
    theodolite: html`
      <svg class="instrument" viewBox="0 0 64 64" data-kind="optical" data-pivot-x="0.5" data-pivot-y="0.44" data-tilt-max="28" aria-hidden="true">
        <g fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
          <path d="M32 48 L20 61 M32 48 L44 61 M32 48 V61"/>
          <ellipse cx="32" cy="45" rx="10" ry="2.6"/>
          <g class="track-pan" style="transform-origin:32px 32px">
            <path d="M25 43 V33 M39 43 V33"/>
            <g class="track-tilt" style="transform-origin:32px 28px">
              <rect x="22" y="24" width="20" height="8" rx="2"/>
              <path d="M42 28 H49"/>
              <circle cx="26.5" cy="28" r="1.6" fill="currentColor" stroke="none"/>
            </g>
          </g>
        </g>
      </svg>`,

    // Automatic level: long barrel, low mount, small elevation range.
    level: html`
      <svg class="instrument" viewBox="0 0 64 64" data-kind="optical" data-pivot-x="0.5" data-pivot-y="0.48" data-tilt-max="5" aria-hidden="true">
        <g fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
          <path d="M32 44 L19 60 M32 44 L45 60 M32 46 V60"/>
          <path d="M25 44 H39"/>
          <g class="track-pan" style="transform-origin:32px 32px">
            <path d="M32 43 V36"/>
            <g class="track-tilt" style="transform-origin:32px 31px">
              <rect x="18" y="27" width="27" height="9" rx="3"/>
              <rect x="45" y="29" width="6" height="5" rx="1.5"/>
              <path d="M23 27 V24"/>
            </g>
          </g>
        </g>
      </svg>`,

    // Prism pole: prism head swivels to face the instrument; pole fixed.
    prism: html`
      <svg class="instrument" viewBox="0 0 64 64" data-kind="optical" data-pivot-x="0.5" data-pivot-y="0.33" data-tilt-max="26" aria-hidden="true">
        <g fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
          <path d="M32 30 V57 M32 57 L28 63 M32 57 L36 63"/>
          <g class="track-pan" style="transform-origin:32px 21px">
            <g class="track-tilt" style="transform-origin:32px 21px">
              <circle cx="32" cy="21" r="9"/>
              <path d="M32 14 L39 25 H25 Z"/>
              <path d="M41 21 H50"/>
            </g>
          </g>
        </g>
      </svg>`,

    // GNSS rover: antenna stays level (it must), the controller swivels.
    gnss: html`
      <svg class="instrument" viewBox="0 0 64 64" data-kind="optical" data-pivot-x="0.5" data-pivot-y="0.62" data-tilt-max="8" aria-hidden="true">
        <g fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
          <path d="M32 24 V56 M32 56 L28 62 M32 56 L36 62"/>
          <ellipse cx="32" cy="20" rx="13" ry="4.5"/>
          <path d="M22 18 Q32 9 42 18"/>
          <g class="track-pan" style="transform-origin:32px 40px">
            <g class="track-tilt" style="transform-origin:32px 40px">
              <path d="M32 40 H38"/>
              <rect x="38" y="33" width="10" height="14" rx="2"/>
            </g>
          </g>
        </g>
      </svg>`,

    // Survey drone: gimbal camera under the airframe, full pan and tilt.
    drone: html`
      <svg class="instrument" viewBox="0 0 64 64" data-kind="optical" data-pivot-x="0.5" data-pivot-y="0.66" data-tilt-max="55" aria-hidden="true">
        <g fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
          <path d="M10 19 H26 M38 19 H54"/>
          <path d="M18 19 V23 M46 19 V23"/>
          <path d="M18 23 L27 30 M46 23 L37 30"/>
          <rect x="25" y="28" width="14" height="10" rx="2"/>
          <g class="track-pan" style="transform-origin:32px 42px">
            <path d="M32 38 V40"/>
            <g class="track-tilt" style="transform-origin:32px 42px">
              <circle cx="32" cy="42" r="5"/>
              <path d="M37 42 H42.5"/>
            </g>
          </g>
        </g>
      </svg>`,

    // Measuring tape: ribbon pulls out horizontally, reel fixed.
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
  };

  // Heading order on the index page; cycles if sections outnumber kinds.
  const INSTRUMENT_ORDER = ["totalStation", "theodolite", "tape", "level", "drone", "prism", "gnss"];

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
        <span class="mono-label">Updated ${new Date().getFullYear()}</span>
      </div>`);
  }

  // ---------- index sections ----------------------------------------

  function renderHero() {
    mount("#hero", html`
      <p class="mono-label hero-eyebrow">${esc(SITE.about.eyebrow)}</p>
      <p class="mono-label hero-coords">${esc(SITE.meta.coords)}</p>
      <h1 class="hero-name">${esc(SITE.meta.name)}</h1>
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
              <span class="mono-label pub-year">${p.year === "n/a" ? "" : esc(p.year)}</span>
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

  // Place a tracking instrument at the right of each section heading.
  function decorateHeadings() {
    document.querySelectorAll(".section-marker").forEach((marker, i) => {
      if (!marker.querySelector(".instrument")) {
        const kind = INSTRUMENT_ORDER[i % INSTRUMENT_ORDER.length];
        marker.insertAdjacentHTML("beforeend", INSTRUMENTS[kind]);
      }
    });
  }

  // Animate instruments toward the pointer, on two axes (see above).
  // One rAF-throttled pointer listener drives every instance.
  function setupInstrumentTracking() {
    const instruments = Array.from(document.querySelectorAll(".instrument"));
    if (!instruments.length) return;
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let mx = window.innerWidth / 2, my = window.innerHeight / 2, queued = false;

    function apply() {
      queued = false;
      instruments.forEach((svg) => {
        const r = svg.getBoundingClientRect();
        const cx = r.left + r.width * parseFloat(svg.dataset.pivotX);
        const cy = r.top + r.height * parseFloat(svg.dataset.pivotY);
        const dx = mx - cx, dy = my - cy;

        if (svg.dataset.kind === "extend") {
          const ribbon = svg.querySelector(".track-extend");
          if (!ribbon) return;
          const reach = Math.max(0, dx) + Math.abs(dy) * 0.15;
          const norm = Math.max(0, Math.min(1, reach / (r.width * 1.6)));
          ribbon.style.transform = `scaleX(${(0.45 + norm * 0.9).toFixed(3)})`;
          return;
        }

        const pan = svg.querySelector(".track-pan");
        const tilt = svg.querySelector(".track-tilt");
        if (!pan || !tilt) return;

        // Azimuth is degenerate when the cursor sits on the instrument's
        // vertical axis, so hold the current side until the cursor clears a
        // dead band. Without this the alidade flickers on tiny movements.
        const DEAD = r.width * 0.12;
        let facingLeft = svg.dataset.facingLeft === "1";
        if (dx < -DEAD) facingLeft = true;
        else if (dx > DEAD) facingLeft = false;
        svg.dataset.facingLeft = facingLeft ? "1" : "0";

        const limit = parseFloat(svg.dataset.tiltMax || "30");
        const elev = Math.atan2(dy, Math.abs(dx)) * 180 / Math.PI;
        const clamped = Math.max(-limit, Math.min(limit, elev));

        // rotateY is a real rotation about the vertical axis, so swinging
        // from one side to the other foreshortens the way an alidade does,
        // instead of collapsing through zero width like a scaleX mirror.
        pan.style.transform = `rotateY(${facingLeft ? 180 : 0}deg)`;
        tilt.style.transform = `rotate(${clamped.toFixed(2)}deg)`;
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
