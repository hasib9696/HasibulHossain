/* =====================================================================
   HERO 3D — a tiny, dependency-free canvas renderer.
   A glassy inner icosahedron inside a wireframe geodesic shell,
   with one orbiting node. ~3KB, pauses when off-screen or hidden,
   and renders a single still frame for reduced-motion users.
   ===================================================================== */

(function () {
  "use strict";

  var canvas = document.querySelector("[data-hero-canvas]");
  if (!canvas || !canvas.getContext) return;
  var ctx = canvas.getContext("2d");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Geometry ---------- */
  var t = (1 + Math.sqrt(5)) / 2;
  var baseVerts = [
    [-1, t, 0], [1, t, 0], [-1, -t, 0], [1, -t, 0],
    [0, -1, t], [0, 1, t], [0, -1, -t], [0, 1, -t],
    [t, 0, -1], [t, 0, 1], [-t, 0, -1], [-t, 0, 1]
  ].map(normalize);
  var baseFaces = [
    [0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11],
    [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8],
    [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9],
    [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1]
  ];

  function normalize(v) {
    var l = Math.hypot(v[0], v[1], v[2]);
    return [v[0] / l, v[1] / l, v[2] / l];
  }

  // Subdivide once -> geodesic shell (42 vertices)
  var shell = (function () {
    var verts = baseVerts.slice();
    var cache = {};
    function mid(a, b) {
      var key = a < b ? a + "_" + b : b + "_" + a;
      if (cache[key] != null) return cache[key];
      var va = verts[a], vb = verts[b];
      verts.push(normalize([(va[0] + vb[0]) / 2, (va[1] + vb[1]) / 2, (va[2] + vb[2]) / 2]));
      return (cache[key] = verts.length - 1);
    }
    var faces = [];
    baseFaces.forEach(function (f) {
      var a = mid(f[0], f[1]), b = mid(f[1], f[2]), c = mid(f[2], f[0]);
      faces.push([f[0], a, c], [f[1], b, a], [f[2], c, b], [a, b, c]);
    });
    var edges = {};
    faces.forEach(function (f) {
      for (var i = 0; i < 3; i++) {
        var p = f[i], q = f[(i + 1) % 3];
        edges[p < q ? p + "_" + q : q + "_" + p] = [p, q];
      }
    });
    return { verts: verts, edges: Object.keys(edges).map(function (k) { return edges[k]; }) };
  })();

  /* ---------- Colors from CSS tokens ---------- */
  var colors = {};
  function readColors() {
    var s = getComputedStyle(document.documentElement);
    colors.line = s.getPropertyValue("--hero-line").trim() || "rgba(17,18,15,0.35)";
    colors.accent = s.getPropertyValue("--accent").trim() || "#A9E5BB";
    colors.face = s.getPropertyValue("--hero-face").trim() || "255,255,255";
    colors.edge = s.getPropertyValue("--hero-edge").trim() || "17,18,15";
    colors.dark = document.documentElement.getAttribute("data-theme") === "dark";
  }

  /* ---------- Sizing ---------- */
  var W = 0, H = 0, R = 0, dpr = 1;
  function resize() {
    var rect = canvas.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = rect.width; H = rect.height;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    R = Math.min(W, H) * 0.36;
  }

  /* ---------- Math ---------- */
  function rotate(v, ax, ay) {
    var cy = Math.cos(ay), sy = Math.sin(ay), cx = Math.cos(ax), sx = Math.sin(ax);
    var x = v[0] * cy + v[2] * sy;
    var z = -v[0] * sy + v[2] * cy;
    var y = v[1] * cx - z * sx;
    z = v[1] * sx + z * cx;
    return [x, y, z];
  }
  function project(v, scale) {
    var persp = 3.2 / (3.2 - v[2]);
    return [W / 2 + v[0] * scale * persp, H / 2 + v[1] * scale * persp, v[2]];
  }

  /* ---------- State ---------- */
  var rotX = -0.35, rotY = 0.6;
  var tiltX = 0, tiltY = 0, targetX = 0, targetY = 0;
  var time = 0, last = 0, running = false, visible = true, raf = 0;

  function draw() {
    ctx.clearRect(0, 0, W, H);
    var ax = rotX + tiltX, ay = rotY + tiltY;

    // Inner glass icosahedron — faces sorted back-to-front
    var inner = baseVerts.map(function (v) { return project(rotate(v, ax * 0.7 + 0.4, -ay * 0.8), R * 0.58); });
    var innerRaw = baseVerts.map(function (v) { return rotate(v, ax * 0.7 + 0.4, -ay * 0.8); });
    var faces = baseFaces.map(function (f) {
      var z = (inner[f[0]][2] + inner[f[1]][2] + inner[f[2]][2]) / 3;
      // simple light from top-left
      var a = innerRaw[f[0]], b = innerRaw[f[1]], c = innerRaw[f[2]];
      var nx = (a[0] + b[0] + c[0]) / 3, ny = (a[1] + b[1] + c[1]) / 3, nz = (a[2] + b[2] + c[2]) / 3;
      var light = Math.max(0, -nx * 0.45 - ny * 0.6 + nz * 0.65);
      return { f: f, z: z, light: light };
    }).sort(function (p, q) { return p.z - q.z; });

    faces.forEach(function (o) {
      var p0 = inner[o.f[0]], p1 = inner[o.f[1]], p2 = inner[o.f[2]];
      ctx.beginPath();
      ctx.moveTo(p0[0], p0[1]); ctx.lineTo(p1[0], p1[1]); ctx.lineTo(p2[0], p2[1]); ctx.closePath();
      var front = o.z > 0;
      var alpha = (front ? 0.10 : 0.04) + o.light * (colors.dark ? 0.16 : 0.32);
      ctx.fillStyle = "rgba(" + colors.face + "," + alpha.toFixed(3) + ")";
      ctx.fill();
      ctx.strokeStyle = "rgba(" + colors.edge + "," + (front ? 0.28 : 0.08) + ")";
      ctx.lineWidth = 1;
      ctx.stroke();
    });

    // Outer geodesic wireframe, depth-faded
    var pts = shell.verts.map(function (v) { return project(rotate(v, ax, ay), R); });
    ctx.lineWidth = 0.9;
    shell.edges.forEach(function (e) {
      var a = pts[e[0]], b = pts[e[1]];
      var depth = (a[2] + b[2]) / 2; // -1 (back) .. 1 (front)
      ctx.strokeStyle = colors.line.replace(/[\d.]+\)$/, (0.06 + (depth + 1) * 0.16).toFixed(3) + ")");
      ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
    });

    // Vertex nodes: a few highlighted in the accent color
    pts.forEach(function (p, i) {
      if (p[2] < -0.15) return;
      var accent = i % 7 === 0;
      ctx.beginPath();
      ctx.arc(p[0], p[1], accent ? 2.6 : 1.4, 0, Math.PI * 2);
      ctx.fillStyle = accent ? colors.accent : colors.line;
      ctx.fill();
    });

    // Orbit ring + travelling node
    var tiltRing = 0.32;
    ctx.save();
    ctx.translate(W / 2, H / 2);
    ctx.rotate(-0.42);
    ctx.beginPath();
    ctx.ellipse(0, 0, R * 1.32, R * 1.32 * tiltRing, 0, 0, Math.PI * 2);
    ctx.strokeStyle = colors.line.replace(/[\d.]+\)$/, "0.16)");
    ctx.setLineDash([2, 6]);
    ctx.stroke();
    ctx.setLineDash([]);
    var ang = time * 0.45;
    var ox = Math.cos(ang) * R * 1.32, oy = Math.sin(ang) * R * 1.32 * tiltRing;
    ctx.beginPath();
    ctx.arc(ox, oy, Math.sin(ang) > 0 ? 5 : 3.5, 0, Math.PI * 2);
    ctx.fillStyle = colors.accent;
    ctx.shadowColor = colors.accent;
    ctx.shadowBlur = 14;
    ctx.fill();
    ctx.restore();
  }

  function frame(now) {
    if (!running) return;
    var dt = Math.min((now - (last || now)) / 1000, 0.05);
    last = now;
    time += dt;
    rotY += dt * 0.16;
    rotX = -0.35 + Math.sin(time * 0.3) * 0.08;
    tiltX += (targetX - tiltX) * 0.06;
    tiltY += (targetY - tiltY) * 0.06;
    draw();
    raf = requestAnimationFrame(frame);
  }

  function start() {
    if (running || reduce || !visible || document.hidden) return;
    running = true; last = 0;
    raf = requestAnimationFrame(frame);
  }
  function stop() { running = false; cancelAnimationFrame(raf); }

  /* ---------- Events ---------- */
  readColors();
  resize();
  draw();

  var ro = window.ResizeObserver ? new ResizeObserver(function () { resize(); draw(); }) : null;
  if (ro) ro.observe(canvas); else window.addEventListener("resize", function () { resize(); draw(); });

  window.addEventListener("themechange", function () { readColors(); draw(); });

  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) {
      visible = entries[0].isIntersecting;
      if (visible) start(); else stop();
    }).observe(canvas);
  }
  document.addEventListener("visibilitychange", function () { if (document.hidden) stop(); else start(); });

  if (!reduce && window.matchMedia("(pointer: fine)").matches) {
    var hero = document.querySelector(".hero") || document;
    hero.addEventListener("pointermove", function (e) {
      targetY = (e.clientX / window.innerWidth - 0.5) * 0.6;
      targetX = (e.clientY / window.innerHeight - 0.5) * -0.4;
    }, { passive: true });
    hero.addEventListener("pointerleave", function () { targetX = 0; targetY = 0; });
  }

  start();
})();
