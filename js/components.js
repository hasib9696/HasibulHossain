/* =====================================================================
   COMPONENTS
   Small, reusable render functions that turn content.js data into HTML.
   Every piece of text is escaped before it reaches the page.
   ===================================================================== */

(function () {
  "use strict";

  function esc(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  // Only allow http(s), mailto, tel and relative paths in links/media.
  function safeUrl(url) {
    var u = String(url || "").trim();
    if (!u) return "";
    if (/^(https?:|mailto:|tel:)/i.test(u)) return u;
    if (/^[a-z][a-z0-9+.-]*:/i.test(u)) return ""; // block javascript:, data:, etc.
    return u;
  }

  /* ---------- Icons (stroke-based, inherit currentColor) ---------- */
  var ICON_PATHS = {
    image: '<rect x="3.5" y="4.5" width="17" height="15" rx="3"/><circle cx="9" cy="10" r="1.8"/><path d="m20.5 16-4.8-4.8L7 19.5"/>',
    megaphone: '<path d="M4 10v4a1 1 0 0 0 1 1h2l5 4V5L7 9H5a1 1 0 0 0-1 1Z"/><path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a7.5 7.5 0 0 1 0 11"/>',
    video: '<rect x="3.5" y="6" width="12" height="12" rx="2.5"/><path d="m15.5 10.5 5-3v9l-5-3"/>',
    browser: '<rect x="3" y="4.5" width="18" height="15" rx="3"/><path d="M3 9h18M6.5 6.8h.01M9 6.8h.01"/><path d="m10 13-2 2 2 2M14 13l2 2-2 2"/>',
    prompt: '<rect x="3" y="4.5" width="18" height="15" rx="3"/><path d="m7.5 10 3 2.5-3 2.5M12.5 15h4"/>',
    flow: '<circle cx="6" cy="6" r="2.5"/><circle cx="18" cy="12" r="2.5"/><circle cx="6" cy="18" r="2.5"/><path d="M8.5 6H12a3 3 0 0 1 3 3v.5M8.5 18H12a3 3 0 0 0 3-3v-.5"/>',
    agent: '<rect x="5" y="8" width="14" height="11" rx="3.5"/><path d="M12 8V5M12 4.5h.01"/><circle cx="9.5" cy="13.3" r="1"/><circle cx="14.5" cy="13.3" r="1"/><path d="M2.5 12.5v2M21.5 12.5v2"/>',
    spark: '<path d="M12 3.5 13.8 9a2 2 0 0 0 1.2 1.2l5.5 1.8-5.5 1.8a2 2 0 0 0-1.2 1.2L12 20.5 10.2 15A2 2 0 0 0 9 13.8L3.5 12 9 10.2A2 2 0 0 0 10.2 9Z"/>',
    school: '<path d="m2.5 9 9.5-4.5L21.5 9 12 13.5Z"/><path d="M6.5 11v4.5c0 1.5 2.5 3 5.5 3s5.5-1.5 5.5-3V11M21.5 9v5"/>',
    pin: '<path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11Z"/><circle cx="12" cy="10" r="2.3"/>',
    calendar: '<rect x="3.5" y="5" width="17" height="15" rx="3"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
    arrowUpRight: '<path d="M7 17 17 7M8 7h9v9"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    play: '<path d="M8 5.5v13l10.5-6.5Z"/>',
    // Social marks (simplified outlines)
    github: '<path d="M9 19c-4.3 1.4-4.3-2.5-6-3m12 5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12.3 12.3 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21"/>',
    linkedin: '<rect x="3" y="3" width="18" height="18" rx="3"/><path d="M8 10.5V16M8 7.8h.01M12 16v-3.2a2.3 2.3 0 0 1 4.6 0V16M12 10.5V16"/>',
    facebook: '<path d="M14.5 21v-7.5h2.5l.5-3h-3V8.7c0-.9.4-1.7 1.8-1.7h1.4V4.3a17 17 0 0 0-2.4-.2c-2.5 0-4 1.5-4 4.2v2.2H8.5v3h2.8V21"/>',
    instagram: '<rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="3.8"/><path d="M17 7h.01"/>',
    youtube: '<rect x="2.5" y="5.5" width="19" height="13" rx="4"/><path d="m10.3 9.3 4.7 2.7-4.7 2.7Z"/>',
    tiktok: '<path d="M14 3.5v11.3a3.7 3.7 0 1 1-3.7-3.7M14 3.5c.4 2.6 2.2 4.4 5 4.7"/>',
    x: '<path d="M4 4l16 16M20 4 4 20"/>',
    behance: '<path d="M3 7h5a2.5 2.5 0 0 1 0 5H3Zm0 5h5.5a2.8 2.8 0 0 1 0 5.5H3ZM14.5 14.5h6.5a3.3 3.3 0 1 0-1 2.5M15 7.5h4.5"/>',
    dribbble: '<circle cx="12" cy="12" r="9"/><path d="M7 4.5c4 4.6 6.6 10.4 7.6 16M3.2 10.5c5.6.3 11-1 14.7-4.3M5.5 18.5c3-4 8.2-5.8 15.3-4.2"/>',
    link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>'
  };

  function icon(name, cls) {
    var paths = ICON_PATHS[name] || ICON_PATHS.link;
    return '<svg class="icon ' + (cls || "") + '" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' + paths + "</svg>";
  }

  function statusBadge(status) {
    var learning = status === "learning";
    return '<span class="status ' + (learning ? "status--learning" : "") + '">' +
      '<i class="status-dot ' + (learning ? "status-dot--learning" : "") + '"></i>' +
      (learning ? "Learning" : "Working with") + "</span>";
  }

  /* ---------- Skill card ---------- */
  function skillCard(item) {
    return (
      '<li class="skill-card glass tilt" data-tilt>' +
        '<div class="skill-card__top">' +
          '<span class="skill-card__icon">' + icon(item.icon) + "</span>" +
          statusBadge(item.status) +
        "</div>" +
        '<h4 class="skill-card__name">' + esc(item.name) + "</h4>" +
        (item.note ? '<p class="skill-card__note">' + esc(item.note) + "</p>" : "") +
      "</li>"
    );
  }

  function skillGroup(group, index) {
    return (
      '<div class="skill-group reveal" style="--d:' + index * 80 + 'ms">' +
        '<h3 class="skill-group__title">' + esc(group.category) + "</h3>" +
        '<ul class="skill-group__list">' + group.items.map(skillCard).join("") + "</ul>" +
      "</div>"
    );
  }

  /* ---------- Experience ---------- */
  function experienceTrack(track, index) {
    return (
      '<li class="track reveal" style="--d:' + index * 70 + 'ms">' +
        '<span class="track__node" aria-hidden="true">' + icon(track.icon) + "</span>" +
        '<div class="track__card glass">' +
          '<div class="track__head">' +
            '<h4 class="track__title">' + esc(track.title) + "</h4>" +
            statusBadge(track.status) +
          "</div>" +
          '<p class="track__text">' + esc(track.text) + "</p>" +
        "</div>" +
      "</li>"
    );
  }

  function experienceBlock(exp) {
    return (
      '<article class="exp">' +
        '<div class="exp__intro glass reveal">' +
          '<p class="exp__type">' + esc(exp.type) + "</p>" +
          '<h3 class="exp__role">' + esc(exp.heading || exp.role) + "</h3>" +
          (exp.period ? '<p class="exp__period"><span class="pulse" aria-hidden="true"></span>' + esc(exp.period) + "</p>" : "") +
          '<p class="exp__summary">' + esc(exp.summary) + "</p>" +
        "</div>" +
        '<ol class="exp__tracks" aria-label="Areas of independent work">' + exp.tracks.map(experienceTrack).join("") + "</ol>" +
      "</article>"
    );
  }

  /* ---------- Education card ---------- */
  function educationCard(ed, index) {
    var meta = [];
    if (ed.period) meta.push('<span>' + icon("calendar") + esc(ed.period) + "</span>");
    if (ed.location) meta.push('<span>' + icon("pin") + esc(ed.location) + "</span>");
    return (
      '<article class="edu-card glass reveal ' + (ed.current ? "edu-card--current" : "") + '" style="--d:' + index * 90 + 'ms">' +
        '<span class="edu-card__icon">' + icon("school") + "</span>" +
        '<div class="edu-card__body">' +
          (ed.current ? '<p class="edu-card__tag">Current</p>' : '<p class="edu-card__tag edu-card__tag--muted">Previous</p>') +
          '<h3 class="edu-card__school">' + esc(ed.institution) + "</h3>" +
          '<p class="edu-card__qual">' + esc(ed.qualification) + "</p>" +
          (meta.length ? '<p class="edu-card__meta">' + meta.join("") + "</p>" : "") +
        "</div>" +
      "</article>"
    );
  }

  /* ---------- Project card ---------- */
  function categoryLabel(id, categories) {
    for (var i = 0; i < categories.length; i++) if (categories[i].id === id) return categories[i].label;
    return id;
  }

  function projectMedia(media, eager) {
    if (!media || !safeUrl(media.src)) {
      return '<div class="project-card__media project-card__media--empty">' + icon("image") + "</div>";
    }
    var src = esc(safeUrl(media.src));
    var alt = esc(media.alt || "");
    if (media.type === "video") {
      var poster = safeUrl(media.poster) ? ' poster="' + esc(safeUrl(media.poster)) + '"' : "";
      return (
        '<div class="project-card__media">' +
          '<video data-lazy-video data-src="' + src + '"' + poster + ' muted loop playsinline preload="none" aria-label="' + alt + '"></video>' +
          '<span class="project-card__play" aria-hidden="true">' + icon("play") + "</span>" +
        "</div>"
      );
    }
    return (
      '<div class="project-card__media">' +
        '<img src="' + src + '" alt="' + alt + '" loading="' + (eager ? "eager" : "lazy") + '" decoding="async" />' +
      "</div>"
    );
  }

  function projectCard(p, index, categories) {
    var aspect = (p.media && p.media.aspect) || "square";
    var tools = (p.tools || []).filter(Boolean);
    return (
      '<article class="project-card glass aspect-' + esc(aspect) + (p.featured ? " is-featured" : "") + '" data-category="' + esc(p.category) + '" data-index="' + index + '">' +
        projectMedia(p.media, index < 2) +
        '<div class="project-card__body">' +
          '<p class="project-card__cat">' + esc(categoryLabel(p.category, categories)) + "</p>" +
          '<h3 class="project-card__title">' +
            '<button type="button" class="project-card__open" data-open-project="' + index + '">' + esc(p.title) + "</button>" +
          "</h3>" +
          (p.description ? '<p class="project-card__desc">' + esc(p.description) + "</p>" : "") +
          (tools.length ? '<ul class="tags" aria-label="Tools used">' + tools.map(function (t) { return "<li>" + esc(t) + "</li>"; }).join("") + "</ul>" : "") +
        "</div>" +
        '<span class="project-card__arrow" aria-hidden="true">' + icon("arrowUpRight") + "</span>" +
      "</article>"
    );
  }

  function projectDetails(p, categories) {
    var tools = (p.tools || []).filter(Boolean);
    var link = p.link && safeUrl(p.link.url);
    var mediaHtml = "";
    if (p.media && safeUrl(p.media.src)) {
      var src = esc(safeUrl(p.media.src));
      mediaHtml = p.media.type === "video"
        ? '<video src="' + src + '" controls playsinline' + (safeUrl(p.media.poster) ? ' poster="' + esc(safeUrl(p.media.poster)) + '"' : "") + ' aria-label="' + esc(p.media.alt || "") + '"></video>'
        : '<img src="' + src + '" alt="' + esc(p.media.alt || "") + '" />';
    }
    return (
      (mediaHtml ? '<div class="dialog-media">' + mediaHtml + "</div>" : "") +
      '<div class="dialog-text">' +
        '<p class="project-card__cat">' + esc(categoryLabel(p.category, categories)) + "</p>" +
        '<h2 id="project-dialog-title" class="dialog-title">' + esc(p.title) + "</h2>" +
        (p.description ? "<p>" + esc(p.description) + "</p>" : "") +
        (p.details ? '<p class="dialog-details">' + esc(p.details) + "</p>" : "") +
        (tools.length ? '<p class="dialog-label">Tools used</p><ul class="tags">' + tools.map(function (t) { return "<li>" + esc(t) + "</li>"; }).join("") + "</ul>" : "") +
        (link ? '<a class="btn btn--primary" href="' + esc(link) + '" target="_blank" rel="noopener noreferrer">' + esc(p.link.label || "View project") + icon("arrowUpRight") + "</a>" : "") +
      "</div>"
    );
  }

  // Clearly-marked placeholder shown while no projects exist.
  function projectsEmptyState() {
    var slots = ["AI Ads", "AI Visuals", "Websites"];
    return (
      '<div class="projects-empty reveal">' +
        '<div class="projects-empty__slots" aria-hidden="true">' +
          slots.map(function (s, i) {
            return '<div class="slot slot--' + i + '"><span class="slot__plus">' + icon("plus") + '</span><span class="slot__label">' + s + "</span></div>";
          }).join("") +
        "</div>" +
        '<div class="projects-empty__text">' +
          '<p class="projects-empty__badge">Work in progress</p>' +
          '<h3>Real projects are on their way.</h3>' +
          "<p>I’m currently preparing my AI ads, visuals and website work to share here. Check back soon — or reach out if you’d like to see something now.</p>" +
          '<a class="btn btn--ghost" href="#contact">Ask about my work</a>' +
        "</div>" +
      "</div>"
    );
  }

  /* ---------- Achievements ---------- */
  function achievementCard(a, index) {
    var img = safeUrl(a.image);
    var link = safeUrl(a.link);
    var meta = [a.issuer, a.date].filter(Boolean).map(esc).join(" · ");
    var inner =
      (img ? '<img src="' + esc(img) + '" alt="' + esc(a.title) + ' certificate" loading="lazy" decoding="async" />' : "") +
      '<div class="ach-card__body"><h3>' + esc(a.title) + "</h3>" + (meta ? "<p>" + meta + "</p>" : "") + "</div>";
    return link
      ? '<a class="ach-card glass reveal" style="--d:' + index * 70 + 'ms" href="' + esc(link) + '" target="_blank" rel="noopener noreferrer">' + inner + "</a>"
      : '<div class="ach-card glass reveal" style="--d:' + index * 70 + 'ms">' + inner + "</div>";
  }

  /* ---------- Social links ---------- */
  function socialLink(s) {
    var url = safeUrl(s.url);
    if (!url) return "";
    return (
      '<li><a class="social" href="' + esc(url) + '" target="_blank" rel="noopener noreferrer" aria-label="' + esc(s.platform) + ' (opens in a new tab)">' +
        icon(s.icon || "link") + '<span class="social__label">' + esc(s.platform) + "</span>" +
      "</a></li>"
    );
  }

  window.Components = {
    esc: esc,
    safeUrl: safeUrl,
    icon: icon,
    skillGroup: skillGroup,
    experienceBlock: experienceBlock,
    educationCard: educationCard,
    projectCard: projectCard,
    projectDetails: projectDetails,
    projectsEmptyState: projectsEmptyState,
    achievementCard: achievementCard,
    socialLink: socialLink
  };
})();
