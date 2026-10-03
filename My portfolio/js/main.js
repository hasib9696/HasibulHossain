/* =====================================================================
   MAIN — renders content and wires up interactions.
   ===================================================================== */

(function () {
  "use strict";

  var data = window.PORTFOLIO || {};
  var C = window.Components;
  var root = document.documentElement;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }

  /* ---------------- Profile fields ---------------- */
  function renderProfile() {
    var p = data.profile || {};
    $$('[data-field="email"]').forEach(function (el) {
      if (!p.email) return;
      el.textContent = p.email;
      // Let the big contact email wrap cleanly after the @ instead of mid-word
      if (el.classList.contains("contact__email")) el.innerHTML = C.esc(p.email).replace("@", "@<wbr>");
      if (el.tagName === "A") el.href = "mailto:" + p.email;
    });
    $$('[data-field="phone"]').forEach(function (el) {
      if (!p.phone) { el.closest("div").hidden = true; return; }
      el.textContent = p.phone;
      el.href = "tel:" + (p.phoneIntl || p.phone).replace(/[^\d+]/g, "");
    });
    $$('[data-field="location"]').forEach(function (el) { if (p.location) el.textContent = p.location; });
    $$('[data-field="headline"]').forEach(function (el) { if (p.headline) el.textContent = p.headline; });

    // Profile photo (falls back to monogram)
    var portrait = $("[data-portrait]");
    if (portrait && p.photo && C.safeUrl(p.photo.src)) {
      portrait.innerHTML =
        '<figure class="portrait glass">' +
          '<img src="' + C.esc(C.safeUrl(p.photo.src)) + '" alt="' + C.esc(p.photo.alt || p.name) + '" width="820" height="1025" loading="lazy" decoding="async" />' +
          '<figcaption class="portrait__tag glass"><span class="dot" aria-hidden="true"></span>Student · AI Creator</figcaption>' +
        "</figure>";
    }

    // CV button
    var cv = C.safeUrl(data.cv);
    var cvLink = $("[data-cv-link]");
    if (cvLink && cv) { cvLink.href = cv; cvLink.hidden = false; }

    var year = $("[data-year]");
    if (year) year.textContent = new Date().getFullYear();
  }

  /* ---------------- Sections from data ---------------- */
  function renderSkills() {
    var el = $("[data-skills]");
    if (el && data.skills) el.innerHTML = data.skills.map(C.skillGroup).join("");
  }

  function renderExperience() {
    var el = $("[data-experience]");
    if (el && data.experience) el.innerHTML = C.experienceBlock(data.experience);
  }

  function renderEducation() {
    var el = $("[data-education]");
    if (el && data.education) el.innerHTML = data.education.map(C.educationCard).join("");
  }

  function renderAchievements() {
    var items = (data.achievements || []).filter(function (a) { return a && a.title; });
    var has = items.length > 0;
    $$('[data-requires="achievements"]').forEach(function (el) { el.hidden = !has; });
    var idx = $("[data-contact-index]");
    if (idx) idx.textContent = has ? "07" : "06";
    if (has) $("[data-achievements]").innerHTML = items.map(C.achievementCard).join("");
  }

  function renderSocials() {
    var html = (data.socials || []).map(C.socialLink).join("");
    var block = $("[data-socials-block]");
    var list = $("[data-socials]");
    var footer = $("[data-socials-footer]");
    if (list) list.innerHTML = html;
    if (footer) { footer.innerHTML = html; footer.hidden = !html; }
    if (block) block.hidden = !html;
  }

  /* ---------------- Projects + filtering ---------------- */
  var projects = (data.projects || []).filter(function (p) { return p && p.title; });
  var categories = data.projectCategories || [{ id: "all", label: "All" }];

  function renderProjects() {
    var grid = $("[data-projects]");
    var filters = $("[data-filters]");
    if (!grid || !filters) return;

    filters.innerHTML = categories.map(function (c, i) {
      var count = c.id === "all" ? projects.length : projects.filter(function (p) { return p.category === c.id; }).length;
      return '<button type="button" class="filter' + (i === 0 ? " is-active" : "") + '" data-filter="' + C.esc(c.id) + '" aria-pressed="' + (i === 0) + '">' +
        C.esc(c.label) + '<span class="filter__count">' + count + "</span></button>";
    }).join("");

    // Wire the tabs before the empty-state exit so they always respond
    filters.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-filter]");
      if (!btn) return;
      applyFilter(btn.getAttribute("data-filter"));
    });

    if (!projects.length) {
      grid.classList.add("is-empty");
      grid.innerHTML = C.projectsEmptyState();
      return;
    }

    grid.innerHTML = projects.map(function (p, i) { return C.projectCard(p, i, categories); }).join("") +
      '<p class="projects-none" hidden data-projects-none>No projects in this category yet.</p>';

    grid.addEventListener("click", function (e) {
      if (e.target.closest("a")) return;
      var card = e.target.closest(".project-card");
      if (card) openProject(+card.getAttribute("data-index"));
    });

    setupLazyVideos(grid);
  }

  function applyFilter(id) {
    $$("[data-filter]").forEach(function (b) {
      var on = b.getAttribute("data-filter") === id;
      b.classList.toggle("is-active", on);
      b.setAttribute("aria-pressed", on);
    });
    var shown = 0;
    $$(".project-card").forEach(function (card) {
      var match = id === "all" || card.getAttribute("data-category") === id;
      card.hidden = !match;
      if (match) {
        shown++;
        if (!reduceMotion.matches) {
          card.classList.remove("is-entering");
          void card.offsetWidth; // restart animation
          card.classList.add("is-entering");
        }
      }
    });
    var none = $("[data-projects-none]");
    if (none) none.hidden = shown > 0;
    var status = $("[data-filter-status]");
    if (status) status.textContent = shown + (shown === 1 ? " project" : " projects") + " shown";
  }

  function setupLazyVideos(ctx) {
    var videos = $$("[data-lazy-video]", ctx);
    if (!videos.length) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var v = entry.target;
        if (entry.isIntersecting) {
          if (!v.src) v.src = v.getAttribute("data-src");
          if (!reduceMotion.matches) v.play().catch(function () {});
        } else if (v.src) {
          v.pause();
        }
      });
    }, { rootMargin: "200px 0px" });
    videos.forEach(function (v) { io.observe(v); });
  }

  /* ---------------- Project dialog ---------------- */
  var dialog = $("[data-project-dialog]");
  var lastFocus = null;

  function openProject(i) {
    var p = projects[i];
    if (!p || !dialog) return;
    lastFocus = document.activeElement;
    $("[data-dialog-body]", dialog).innerHTML = C.projectDetails(p, categories);
    if (typeof dialog.showModal === "function") dialog.showModal();
    else dialog.setAttribute("open", "");
    root.classList.add("no-scroll");
  }

  function closeDialog() {
    if (!dialog) return;
    var v = $("video", dialog);
    if (v) v.pause();
    if (dialog.open && typeof dialog.close === "function") dialog.close();
    else dialog.removeAttribute("open");
  }

  if (dialog) {
    $("[data-dialog-close]", dialog).addEventListener("click", closeDialog);
    dialog.addEventListener("click", function (e) { if (e.target === dialog) closeDialog(); });
    dialog.addEventListener("close", function () {
      root.classList.remove("no-scroll");
      $("[data-dialog-body]", dialog).innerHTML = "";
      if (lastFocus) lastFocus.focus();
    });
  }

  /* ---------------- Theme toggle ---------------- */
  function setupTheme() {
    var btn = $("[data-theme-toggle]");
    function label() {
      var dark = root.getAttribute("data-theme") === "dark";
      btn.setAttribute("aria-label", dark ? "Switch to light mode" : "Switch to dark mode");
    }
    label();
    btn.addEventListener("click", function () {
      var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      root.classList.add("theme-transition");
      root.setAttribute("data-theme", next);
      try { localStorage.setItem("theme", next); } catch (e) {}
      label();
      window.dispatchEvent(new CustomEvent("themechange"));
      setTimeout(function () { root.classList.remove("theme-transition"); }, 400);
    });
    // Follow the system if the visitor hasn't chosen manually
    var mq = window.matchMedia("(prefers-color-scheme: dark)");
    var onSys = function (e) {
      var saved = null;
      try { saved = localStorage.getItem("theme"); } catch (err) {}
      if (saved) return;
      root.setAttribute("data-theme", e.matches ? "dark" : "light");
      label();
      window.dispatchEvent(new CustomEvent("themechange"));
    };
    if (mq.addEventListener) mq.addEventListener("change", onSys);
  }

  /* ---------------- Navigation ---------------- */
  function setupNav() {
    var header = $(".site-header");
    var toggle = $("[data-menu-toggle]");
    var menu = $("[data-mobile-menu]");

    function setMenu(open) {
      toggle.setAttribute("aria-expanded", open);
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      root.classList.toggle("menu-open", open);
      if (open) {
        menu.hidden = false;
        requestAnimationFrame(function () { menu.classList.add("is-open"); });
        var first = $("a", menu);
        if (first) first.focus();
      } else {
        menu.classList.remove("is-open");
        setTimeout(function () { if (!menu.classList.contains("is-open")) menu.hidden = true; }, 260);
      }
    }

    toggle.addEventListener("click", function () {
      setMenu(toggle.getAttribute("aria-expanded") !== "true");
    });
    menu.addEventListener("click", function (e) {
      if (e.target.closest("a") || e.target === menu) setMenu(false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
        setMenu(false);
        toggle.focus();
      }
      // Keep focus inside the open mobile menu
      if (e.key === "Tab" && root.classList.contains("menu-open")) {
        var focusables = $$("a, button", menu).concat([toggle]).filter(function (el) { return el.offsetParent !== null; });
        var first = focusables[0], last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
    window.matchMedia("(min-width: 1080px)").addEventListener("change", function (e) {
      if (e.matches) setMenu(false);
    });

    // Header style once scrolled
    var onScroll = function () { header.classList.toggle("is-scrolled", window.scrollY > 12); };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    // Active link
    var links = $$("[data-nav]");
    var sections = links.map(function (a) { return document.getElementById(a.getAttribute("data-nav")); }).filter(Boolean);
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var id = entry.target.id;
        links.forEach(function (a) {
          var on = a.getAttribute("data-nav") === id;
          a.classList.toggle("is-active", on);
          if (on) a.setAttribute("aria-current", "true"); else a.removeAttribute("aria-current");
        });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    sections.forEach(function (s) { io.observe(s); });
  }

  /* ---------------- Reveal on scroll ---------------- */
  function setupReveal() {
    var items = $$(".reveal");
    if (reduceMotion.matches || !("IntersectionObserver" in window)) {
      items.forEach(function (el) { el.classList.add("is-visible"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    items.forEach(function (el) { io.observe(el); });
  }

  /* ---------------- Subtle 3D tilt on cards (pointer devices only) ---------------- */
  function setupTilt() {
    if (reduceMotion.matches || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    document.addEventListener("pointermove", function (e) {
      var card = e.target.closest && e.target.closest("[data-tilt]");
      if (!card) return;
      var r = card.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width - 0.5;
      var y = (e.clientY - r.top) / r.height - 0.5;
      card.style.setProperty("--rx", (-y * 6).toFixed(2) + "deg");
      card.style.setProperty("--ry", (x * 8).toFixed(2) + "deg");
      card.style.setProperty("--mx", ((x + 0.5) * 100).toFixed(1) + "%");
      card.style.setProperty("--my", ((y + 0.5) * 100).toFixed(1) + "%");
    }, { passive: true });
    document.addEventListener("pointerout", function (e) {
      var card = e.target.closest && e.target.closest("[data-tilt]");
      if (card && !card.contains(e.relatedTarget)) {
        card.style.setProperty("--rx", "0deg");
        card.style.setProperty("--ry", "0deg");
      }
    });
  }

  /* ---------------- Copy email ---------------- */
  function setupCopy() {
    var btn = $("[data-copy-email]");
    if (!btn) return;
    var label = $("[data-copy-label]", btn);
    btn.addEventListener("click", function () {
      var email = (data.profile && data.profile.email) || "";
      var done = function (ok) {
        label.textContent = ok ? "Copied!" : "Couldn’t copy";
        btn.classList.toggle("is-done", ok);
        setTimeout(function () { label.textContent = "Copy email"; btn.classList.remove("is-done"); }, 1800);
      };
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(email).then(function () { done(true); }, function () { done(fallbackCopy(email)); });
      } else {
        done(fallbackCopy(email));
      }
    });
  }

  function fallbackCopy(text) {
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    var ok = false;
    try { ok = document.execCommand("copy"); } catch (e) {}
    document.body.removeChild(ta);
    return ok;
  }

  /* ---------------- Contact form (honest behaviour) ---------------- */
  function setupForm() {
    var form = $("[data-contact-form]");
    if (!form) return;
    var endpoint = C.safeUrl(data.contactForm && data.contactForm.endpoint);
    var email = (data.profile && data.profile.email) || "";
    var note = $("[data-form-note]", form);
    var status = $("[data-form-status]", form);
    var submit = $("[data-submit]", form);

    note.textContent = endpoint
      ? "Your message is sent securely through a form service."
      : "Direct sending isn’t connected yet — this opens your email app with your message ready to send.";

    var rules = {
      name: function (v) { return v.trim().length >= 2 || "Please enter your name."; },
      email: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) || "Please enter a valid email address."; },
      message: function (v) { return v.trim().length >= 10 || "Please write a message (at least 10 characters)."; }
    };

    function validateField(input) {
      var rule = rules[input.name];
      if (!rule) return true;
      var res = rule(input.value);
      var err = $("#" + input.id + "-error");
      if (res === true) {
        input.removeAttribute("aria-invalid");
        input.removeAttribute("aria-describedby");
        if (err) err.textContent = "";
        return true;
      }
      input.setAttribute("aria-invalid", "true");
      input.setAttribute("aria-describedby", input.id + "-error");
      if (err) err.textContent = res;
      return false;
    }

    $$("input, textarea", form).forEach(function (input) {
      input.addEventListener("blur", function () { if (input.value) validateField(input); });
      input.addEventListener("input", function () { if (input.getAttribute("aria-invalid")) validateField(input); });
    });

    function setStatus(msg, type) {
      status.textContent = msg;
      status.className = "form-status" + (type ? " form-status--" + type : "");
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var inputs = $$("input, textarea", form);
      var firstInvalid = null;
      inputs.forEach(function (i) { if (!validateField(i) && !firstInvalid) firstInvalid = i; });
      if (firstInvalid) { firstInvalid.focus(); setStatus("", ""); return; }

      // form.elements avoids clashing with the form's own .name property
      var name = form.elements.name.value.trim();
      var from = form.elements.email.value.trim();
      var msg = form.elements.message.value.trim();

      if (!endpoint) {
        var subject = "Portfolio enquiry from " + name;
        var body = msg + "\n\n— " + name + " (" + from + ")";
        window.location.href = "mailto:" + email + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
        setStatus("Your email app should now open with the message ready. Nothing has been sent yet — press send there. If nothing opened, email me directly at " + email + ".", "info");
        return;
      }

      submit.disabled = true;
      submit.classList.add("is-loading");
      setStatus("Sending…", "");
      fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ name: name, email: from, message: msg })
      }).then(function (res) {
        if (!res.ok) throw new Error("Request failed");
        form.reset();
        setStatus("Thanks — your message was sent. I’ll reply as soon as I can.", "success");
      }).catch(function () {
        setStatus("Sorry, the message couldn’t be sent. Please email me directly at " + email + ".", "error");
      }).then(function () {
        submit.disabled = false;
        submit.classList.remove("is-loading");
      });
    });
  }

  /* ---------------- Init ---------------- */
  renderProfile();
  renderSkills();
  renderExperience();
  renderProjects();
  renderEducation();
  renderAchievements();
  renderSocials();
  setupTheme();
  setupNav();
  setupReveal();
  setupTilt();
  setupCopy();
  setupForm();
})();
