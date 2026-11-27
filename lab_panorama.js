"use strict";

(function () {
  const DEFAULT_DEVICES = [
    { id: "laser", label: "可调激光器", type: "laser", x: 0.07, y: 0.25 },
    { id: "mirror-a", label: "反射镜 A", type: "mirror", x: 0.20, y: 0.14 },
    { id: "splitter", label: "分束镜", type: "splitter", x: 0.34, y: 0.25 },
    { id: "mirror-b", label: "反射镜 B", type: "mirror", x: 0.48, y: 0.13 },
    { id: "lens", label: "聚焦透镜", type: "lens", x: 0.61, y: 0.23 },
    { id: "sample", label: "待测样品", type: "sample", x: 0.74, y: 0.20 },
    { id: "screen", label: "观察屏", type: "screen", x: 0.90, y: 0.19 },
    { id: "detector", label: "光电探测器", type: "detector", x: 0.90, y: 0.38 },
    { id: "power", label: "直流电源", type: "power", x: 0.08, y: 0.69 },
    { id: "signal", label: "信号发生器", type: "signal", x: 0.25, y: 0.73 },
    { id: "board", label: "被测电路板", type: "board", x: 0.43, y: 0.72 },
    { id: "probe", label: "差分探头", type: "probe", x: 0.56, y: 0.67 },
    { id: "scope", label: "数字示波器", type: "scope", x: 0.71, y: 0.70 },
    { id: "computer", label: "采集与分析电脑", type: "computer", x: 0.89, y: 0.70 }
  ];

  const state = {
    canvas: null,
    context: null,
    active: false,
    dragging: null,
    selected: "laser",
    devices: [],
    width: 0,
    height: 0,
    lastHudUpdate: 0,
    showCables: true,
    metrics: {
      alignment: 0,
      power: 0,
      frequency: 0,
      snr: 0,
      connectivity: 0
    }
  };

  const $ = (selector) => document.querySelector(selector);
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const roundRect = (context, x, y, width, height, radius) => {
    const r = Math.min(radius, width / 2, height / 2);
    context.beginPath();
    context.moveTo(x + r, y);
    context.arcTo(x + width, y, x + width, y + height, r);
    context.arcTo(x + width, y + height, x, y + height, r);
    context.arcTo(x, y + height, x, y, r);
    context.arcTo(x, y, x + width, y, r);
    context.closePath();
  };

  function resetPositions() {
    state.devices = DEFAULT_DEVICES.map((device) => ({ ...device }));
    state.selected = "laser";
    updateSelectionHud();
  }

  function deviceById(id) {
    return state.devices.find((device) => device.id === id);
  }

  function sizeFor(device) {
    const compact = state.width < 620;
    const baseWidth = compact ? clamp(state.width * 0.12, 36, 54) : clamp(state.width * 0.085, 58, 86);
    const scale = compact ? 0.86 : 1;
    if (device.type === "screen") return { width: baseWidth * 0.88 * scale, height: baseWidth * 1.22 * scale };
    if (device.type === "scope") return { width: baseWidth * 1.2 * scale, height: baseWidth * 0.82 * scale };
    if (device.type === "computer") return { width: baseWidth * 1.18 * scale, height: baseWidth * 0.9 * scale };
    if (device.type === "board") return { width: baseWidth * 1.25 * scale, height: baseWidth * 0.72 * scale };
    if (device.type === "power") return { width: baseWidth * 1.05 * scale, height: baseWidth * 0.62 * scale };
    if (device.type === "signal") return { width: baseWidth * 1.03 * scale, height: baseWidth * 0.6 * scale };
    if (device.type === "probe") return { width: baseWidth * 0.45 * scale, height: baseWidth * 0.9 * scale };
    return { width: baseWidth * scale, height: baseWidth * 0.66 * scale };
  }

  function bounds(device) {
    const size = sizeFor(device);
    const x = device.x * state.width;
    const y = device.y * state.height;
    return {
      x: x - size.width / 2,
      y: y - size.height / 2,
      width: size.width,
      height: size.height,
      cx: x,
      cy: y
    };
  }

  function point(device, anchor = "center") {
    const box = bounds(device);
    if (anchor === "left") return { x: box.x, y: box.cy };
    if (anchor === "right") return { x: box.x + box.width, y: box.cy };
    if (anchor === "top") return { x: box.cx, y: box.y };
    if (anchor === "bottom") return { x: box.cx, y: box.y + box.height };
    return { x: box.cx, y: box.cy };
  }

  function distanceToSegment(px, py, x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const lengthSquared = dx * dx + dy * dy || 1;
    const t = clamp(((px - x1) * dx + (py - y1) * dy) / lengthSquared, 0, 1);
    return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
  }

  function calculateMetrics(config = {}) {
    const laser = point(deviceById("laser"), "right");
    const splitter = point(deviceById("splitter"));
    const mirrorA = point(deviceById("mirror-a"));
    const mirrorB = point(deviceById("mirror-b"));
    const lens = point(deviceById("lens"));
    const sample = point(deviceById("sample"));
    const screen = point(deviceById("screen"), "left");
    const detector = point(deviceById("detector"));
    const probe = point(deviceById("probe"), "bottom");
    const board = point(deviceById("board"), "right");
    const scope = point(deviceById("scope"), "left");
    const signal = point(deviceById("signal"), "right");
    const power = point(deviceById("power"), "right");
    const computer = point(deviceById("computer"), "left");

    const scale = Math.max(1, Math.min(state.width, state.height));
    const lensMiss = distanceToSegment(lens.x, lens.y, splitter.x, splitter.y, sample.x, sample.y);
    const detectorMiss = Math.abs(detector.x - screen.x) + Math.abs(detector.y - screen.y) * 0.18;
    const electronicsGaps = [
      Math.hypot(probe.x - board.x, probe.y - board.y),
      Math.hypot(scope.x - signal.x, scope.y - signal.y),
      Math.hypot(computer.x - scope.x, computer.y - scope.y)
    ];
    const alignment = clamp(0.98 - (lensMiss + detectorMiss) / scale * 1.8, 0.18, 0.99);
    const connectivity = clamp(1.05 - Math.max(...electronicsGaps) / scale * 0.48, 0.24, 0.98);
    const sourceDrive = clamp(Math.abs(Number(config.primary) || 1) / 20, 0.18, 1);
    const opticalPower = clamp((0.8 + sourceDrive * 3.6) * alignment, 0.08, 9.9);
    const baseFrequency = /Hz|hz/.test(String(config.secondaryUnit || ""))
      ? Math.abs(Number(config.secondary) || 1000)
      : 1000 + Math.abs(Number(config.secondary) || 1) * 47;
    const frequency = clamp(baseFrequency, 10, 250000);
    const snr = clamp(8 + alignment * 31 + connectivity * 8 - (1 - alignment) * 18, 3, 58);
    return {
      alignment,
      connectivity,
      power: opticalPower,
      frequency,
      snr,
      lensMiss,
      detectorMiss
    };
  }

  function compact(value, digits = 2) {
    if (!Number.isFinite(value)) return "—";
    if (Math.abs(value) >= 1000) return `${(value / 1000).toFixed(digits)}k`;
    return Number(value).toFixed(digits).replace(/\.?0+$/, "");
  }

  function updateSelectionHud() {
    const selected = deviceById(state.selected);
    const label = $("#panorama-selected");
    if (label && selected) label.textContent = `正在观察：${selected.label}`;
    document.querySelectorAll("[data-panorama-device]").forEach((button) => {
      button.classList.toggle("active", button.dataset.panoramaDevice === state.selected);
    });
  }

  function updateHud(config, time) {
    if (time - state.lastHudUpdate < 100) return;
    state.lastHudUpdate = time;
    const metrics = state.metrics;
    $("#panorama-alignment") && ($("#panorama-alignment").textContent = `${Math.round(metrics.alignment * 100)}%`);
    $("#panorama-power") && ($("#panorama-power").textContent = `${compact(metrics.power, 2)} mW`);
    $("#panorama-frequency") && ($("#panorama-frequency").textContent = `${compact(metrics.frequency, 1)} Hz`);
    $("#panorama-snr") && ($("#panorama-snr").textContent = `${compact(metrics.snr, 1)} dB`);
    $("#panorama-status") && ($("#panorama-status").textContent =
      metrics.alignment > 0.72 && metrics.connectivity > 0.7
        ? "光路对准 · 电路连通 · 采集在线"
        : metrics.alignment > 0.45
          ? "光路可用，建议继续微调器件位置"
          : "光路偏离，拖动透镜或反射镜重新对准"
    );
    const stateClass = metrics.alignment > 0.7 ? "good" : metrics.alignment > 0.4 ? "warn" : "bad";
    const scene = $("#panorama-status");
    if (scene) scene.dataset.state = stateClass;
    updateSelectionHud();
  }

  function drawBackground(context, time) {
    const gradient = context.createLinearGradient(0, 0, state.width, state.height);
    gradient.addColorStop(0, "#07100f");
    gradient.addColorStop(0.52, "#0d1716");
    gradient.addColorStop(1, "#101817");
    context.fillStyle = gradient;
    context.fillRect(0, 0, state.width, state.height);

    const wallGlow = context.createRadialGradient(
      state.width * 0.48, state.height * 0.08, 0,
      state.width * 0.48, state.height * 0.08, state.width * 0.48
    );
    wallGlow.addColorStop(0, "rgba(111, 160, 133, 0.12)");
    wallGlow.addColorStop(1, "rgba(0,0,0,0)");
    context.fillStyle = wallGlow;
    context.fillRect(0, 0, state.width, state.height);

    context.save();
    context.strokeStyle = "rgba(173, 201, 185, 0.045)";
    context.lineWidth = 1;
    for (let x = 20; x < state.width; x += 32) {
      context.beginPath();
      context.moveTo(x, 0);
      context.lineTo(x, state.height);
      context.stroke();
    }
    for (let y = 20; y < state.height; y += 32) {
      context.beginPath();
      context.moveTo(0, y);
      context.lineTo(state.width, y);
      context.stroke();
    }
    context.restore();

    const tableTop = state.height * 0.54;
    context.save();
    const mat = context.createLinearGradient(0, tableTop, 0, state.height);
    mat.addColorStop(0, "rgba(37, 50, 44, 0.9)");
    mat.addColorStop(1, "rgba(13, 20, 18, 0.96)");
    context.fillStyle = mat;
    roundRect(context, state.width * 0.018, tableTop, state.width * 0.964, state.height * 0.43, 14);
    context.fill();
    context.strokeStyle = "rgba(148, 176, 158, 0.12)";
    context.stroke();
    context.strokeStyle = "rgba(185, 153, 97, 0.11)";
    context.setLineDash([5, 12]);
    context.beginPath();
    context.moveTo(state.width * 0.04, tableTop + 32);
    context.lineTo(state.width * 0.96, tableTop + 32);
    context.stroke();
    context.restore();

    // Overhead lamp reflection and optical-table rail.
    context.save();
    context.fillStyle = "rgba(235, 204, 149, 0.035)";
    context.beginPath();
    context.moveTo(state.width * 0.28, 0);
    context.lineTo(state.width * 0.43, 0);
    context.lineTo(state.width * 0.62, tableTop);
    context.lineTo(state.width * 0.19, tableTop);
    context.closePath();
    context.fill();
    context.strokeStyle = "rgba(185, 168, 137, 0.18)";
    context.lineWidth = 3;
    context.beginPath();
    context.moveTo(state.width * 0.04, tableTop + 11);
    context.lineTo(state.width * 0.96, tableTop + 11);
    context.stroke();
    context.strokeStyle = "rgba(245, 220, 174, 0.08)";
    context.lineWidth = 1;
    for (let x = state.width * 0.06; x < state.width * 0.95; x += 38) {
      context.beginPath();
      context.moveTo(x, tableTop + 7);
      context.lineTo(x, tableTop + 15);
      context.stroke();
    }
    context.restore();
  }

  function drawCable(context, from, to, color, time, phase = 0) {
    const midX = (from.x + to.x) / 2;
    const midY = Math.max(from.y, to.y) + Math.min(55, Math.abs(from.x - to.x) * 0.14);
    context.save();
    context.strokeStyle = color;
    context.lineWidth = 2.2;
    context.globalAlpha = 0.6;
    context.beginPath();
    context.moveTo(from.x, from.y);
    context.quadraticCurveTo(midX, midY, to.x, to.y);
    context.stroke();
    const t = (time * 0.0003 + phase) % 1;
    const x = (1 - t) ** 2 * from.x + 2 * (1 - t) * t * midX + t * t * to.x;
    const y = (1 - t) ** 2 * from.y + 2 * (1 - t) * t * midY + t * t * to.y;
    const glow = context.createRadialGradient(x, y, 0, x, y, 8);
    glow.addColorStop(0, "rgba(255, 228, 176, 0.9)");
    glow.addColorStop(1, color);
    context.fillStyle = glow;
    context.globalAlpha = 0.9;
    context.beginPath();
    context.arc(x, y, 3, 0, Math.PI * 2);
    context.fill();
    context.restore();
  }

  function electronicAnchors() {
    return {
      power: point(deviceById("power"), "right"),
      signal: point(deviceById("signal"), "right"),
      board: point(deviceById("board"), "left"),
      boardRight: point(deviceById("board"), "right"),
      probe: point(deviceById("probe"), "bottom"),
      scope: point(deviceById("scope"), "left"),
      detector: point(deviceById("detector"), "bottom"),
      computer: point(deviceById("computer"), "left")
    };
  }

  function drawCables(context, time) {
    if (!state.showCables) return;
    const anchors = electronicAnchors();
    drawCable(context, anchors.power, anchors.board, "#e7b76f", time, 0.05);
    drawCable(context, anchors.signal, anchors.scope, "#5fbfaa", time, 0.32);
    drawCable(context, anchors.boardRight, anchors.probe, "#d6d1ba", time, 0.55);
    drawCable(context, anchors.detector, anchors.scope, "#7fa9d8", time, 0.76);
    drawCable(context, anchors.scope, anchors.computer, "#d6a962", time, 0.91);
    drawCable(context, anchors.board, anchors.power, "rgba(122, 144, 135, 0.72)", time, 0.16);
  }

  function drawBeam(context, from, to, time, color, strength = 1, phase = 0) {
    context.save();
    context.lineCap = "round";
    context.strokeStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${0.1 + strength * 0.18})`;
    context.lineWidth = 7;
    context.beginPath();
    context.moveTo(from.x, from.y);
    context.lineTo(to.x, to.y);
    context.stroke();
    context.strokeStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${0.5 + strength * 0.4})`;
    context.lineWidth = 1.7;
    context.setLineDash([8, 8]);
    context.lineDashOffset = -time * 0.045;
    context.beginPath();
    context.moveTo(from.x, from.y);
    context.lineTo(to.x, to.y);
    context.stroke();
    context.setLineDash([]);
    const progress = (time * 0.00018 + phase) % 1;
    const x = from.x + (to.x - from.x) * progress;
    const y = from.y + (to.y - from.y) * progress;
    context.fillStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, 0.95)`;
    context.beginPath();
    context.arc(x, y, 2.8, 0, Math.PI * 2);
    context.fill();
    context.restore();
  }

  function drawOpticalPath(context, time, config) {
    const metrics = state.metrics;
    const color = config.beamColor || [216, 172, 95];
    const laser = point(deviceById("laser"), "right");
    const splitter = point(deviceById("splitter"));
    const mirrorA = point(deviceById("mirror-a"));
    const mirrorB = point(deviceById("mirror-b"));
    const lens = point(deviceById("lens"));
    const sample = point(deviceById("sample"));
    const screen = point(deviceById("screen"), "left");
    const detector = point(deviceById("detector"));
    drawBeam(context, laser, splitter, time, color, metrics.alignment, 0.02);
    drawBeam(context, splitter, mirrorA, time, color, metrics.alignment * 0.85, 0.22);
    drawBeam(context, mirrorA, splitter, time, color, metrics.alignment * 0.8, 0.37);
    drawBeam(context, splitter, lens, time, color, metrics.alignment, 0.48);
    drawBeam(context, lens, sample, time, color, metrics.alignment, 0.61);
    drawBeam(context, sample, screen, time, color, metrics.alignment * 0.95, 0.72);
    drawBeam(context, splitter, mirrorB, time, color, metrics.alignment * 0.82, 0.83);
    drawBeam(context, mirrorB, splitter, time, color, metrics.alignment * 0.74, 0.89);
    drawBeam(context, sample, detector, time, color, metrics.alignment * 0.68, 0.94);
  }

  function bodyGradient(context, box) {
    const gradient = context.createLinearGradient(box.x, box.y, box.x, box.y + box.height);
    gradient.addColorStop(0, "#475652");
    gradient.addColorStop(0.45, "#26322f");
    gradient.addColorStop(1, "#131c1a");
    return gradient;
  }

  function drawKnob(context, x, y, radius = 5) {
    context.fillStyle = "rgba(11, 15, 14, 0.9)";
    context.beginPath();
    context.arc(x, y, radius, 0, Math.PI * 2);
    context.fill();
    context.strokeStyle = "rgba(217, 185, 131, 0.48)";
    context.lineWidth = 1;
    context.stroke();
    context.beginPath();
    context.moveTo(x, y);
    context.lineTo(x + radius * 0.65, y - radius * 0.55);
    context.stroke();
  }

  function drawLaser(context, box, time) {
    context.fillStyle = bodyGradient(context, box);
    roundRect(context, box.x, box.y, box.width, box.height, 7);
    context.fill();
    context.strokeStyle = "rgba(212, 179, 118, 0.32)";
    context.stroke();
    context.fillStyle = "#0c1211";
    roundRect(context, box.x + 5, box.y + 6, box.width * 0.56, box.height - 12, 5);
    context.fill();
    context.fillStyle = "rgba(219, 179, 103, 0.78)";
    context.font = '7px "Cascadia Mono", monospace';
    context.fillText("LASER", box.x + 9, box.y + box.height * 0.45);
    context.fillStyle = "#222b28";
    context.beginPath();
    context.arc(box.x + box.width - 12, box.y + box.height * 0.34, 5, 0, Math.PI * 2);
    context.fill();
    drawKnob(context, box.x + box.width - 12, box.y + box.height * 0.72, 4);
    const pulse = 0.75 + Math.sin(time * 0.005) * 0.2;
    context.fillStyle = `rgba(255, 220, 144, ${pulse})`;
    context.shadowColor = "#f0be70";
    context.shadowBlur = 12;
    context.beginPath();
    context.arc(box.x + box.width - 2, box.y + box.height * 0.5, 2.5, 0, Math.PI * 2);
    context.fill();
    context.shadowBlur = 0;
  }

  function drawMirror(context, box) {
    context.fillStyle = "rgba(35, 43, 40, 0.9)";
    roundRect(context, box.x + box.width * 0.34, box.y + box.height * 0.52, box.width * 0.32, box.height * 0.4, 2);
    context.fill();
    context.save();
    context.translate(box.x + box.width / 2, box.y + box.height * 0.43);
    context.rotate(-0.52);
    const grad = context.createLinearGradient(-5, 0, 5, 0);
    grad.addColorStop(0, "#c5d0c9");
    grad.addColorStop(0.45, "#f2efe4");
    grad.addColorStop(0.55, "#69756f");
    grad.addColorStop(1, "#d8d7cf");
    context.fillStyle = grad;
    roundRect(context, -5, -box.height * 0.34, 10, box.height * 0.68, 2);
    context.fill();
    context.restore();
    context.strokeStyle = "rgba(197, 221, 207, 0.2)";
    context.beginPath();
    context.arc(box.x + box.width / 2, box.y + box.height * 0.6, 10, 0, Math.PI * 2);
    context.stroke();
  }

  function drawSplitter(context, box) {
    context.fillStyle = "rgba(37, 44, 42, 0.8)";
    roundRect(context, box.x + box.width * 0.37, box.y + box.height * 0.55, box.width * 0.26, box.height * 0.38, 2);
    context.fill();
    context.save();
    context.translate(box.x + box.width / 2, box.y + box.height * 0.45);
    context.rotate(0.78);
    const grad = context.createLinearGradient(-6, 0, 6, 0);
    grad.addColorStop(0, "rgba(75, 126, 120, 0.72)");
    grad.addColorStop(0.4, "rgba(203, 225, 207, 0.88)");
    grad.addColorStop(0.58, "rgba(84, 137, 128, 0.68)");
    grad.addColorStop(1, "rgba(28, 51, 48, 0.8)");
    context.fillStyle = grad;
    roundRect(context, -6, -box.height * 0.28, 12, box.height * 0.56, 3);
    context.fill();
    context.restore();
  }

  function drawLens(context, box) {
    context.fillStyle = "rgba(37, 45, 42, 0.8)";
    roundRect(context, box.x + box.width * 0.42, box.y + box.height * 0.55, box.width * 0.16, box.height * 0.36, 2);
    context.fill();
    context.fillStyle = "rgba(128, 187, 177, 0.18)";
    context.strokeStyle = "rgba(187, 218, 202, 0.55)";
    context.lineWidth = 1.4;
    context.beginPath();
    context.ellipse(box.x + box.width / 2, box.y + box.height * 0.45, box.width * 0.18, box.height * 0.32, 0, 0, Math.PI * 2);
    context.fill();
    context.stroke();
    context.strokeStyle = "rgba(221, 235, 220, 0.24)";
    context.beginPath();
    context.ellipse(box.x + box.width / 2 - 2, box.y + box.height * 0.43, box.width * 0.06, box.height * 0.2, 0, 0, Math.PI * 2);
    context.stroke();
  }

  function drawSample(context, box, time) {
    context.fillStyle = "rgba(31, 43, 39, 0.92)";
    roundRect(context, box.x, box.y + box.height * 0.42, box.width, box.height * 0.48, 4);
    context.fill();
    const grad = context.createLinearGradient(box.x, box.y, box.x + box.width, box.y);
    grad.addColorStop(0, "rgba(92, 150, 137, 0.42)");
    grad.addColorStop(0.5, "rgba(216, 198, 150, 0.34)");
    grad.addColorStop(1, "rgba(201, 128, 83, 0.38)");
    context.fillStyle = grad;
    roundRect(context, box.x + box.width * 0.18, box.y + box.height * 0.12, box.width * 0.64, box.height * 0.68, 4);
    context.fill();
    context.strokeStyle = "rgba(235, 222, 184, 0.4)";
    context.stroke();
    context.fillStyle = `rgba(246, 220, 163, ${0.4 + Math.sin(time * 0.003) * 0.1})`;
    context.beginPath();
    context.arc(box.x + box.width * 0.5, box.y + box.height * 0.42, 2.5, 0, Math.PI * 2);
    context.fill();
  }

  function drawScreen(context, box, time, config) {
    context.fillStyle = "#0b1210";
    roundRect(context, box.x, box.y, box.width, box.height, 5);
    context.fill();
    context.strokeStyle = "rgba(187, 205, 190, 0.36)";
    context.lineWidth = 2;
    context.stroke();
    context.save();
    roundRect(context, box.x + 5, box.y + 6, box.width - 10, box.height - 12, 3);
    context.clip();
    context.fillStyle = "#08100d";
    context.fillRect(box.x, box.y, box.width, box.height);
    const phase = Math.abs(Number(config.secondary) || 0) * 2.2;
    for (let index = 0; index < 7; index += 1) {
      const y = box.y + 10 + index * ((box.height - 20) / 6);
      context.strokeStyle = `rgba(238, 196, 119, ${0.35 + state.metrics.alignment * 0.45})`;
      context.lineWidth = 2;
      context.beginPath();
      for (let px = box.x + 8; px < box.x + box.width - 8; px += 2) {
        const local = (px - box.x) / box.width;
        const intensity = 0.5 + 0.5 * Math.cos(local * Math.PI * 10 + phase + index * 0.12);
        const py = y + Math.sin(local * Math.PI * 2 + time * 0.001) * (1.2 + state.metrics.alignment * 2) * intensity;
        if (px === box.x + 8) context.moveTo(px, py);
        else context.lineTo(px, py);
      }
      context.stroke();
    }
    context.restore();
  }

  function drawDetector(context, box, time) {
    context.fillStyle = bodyGradient(context, box);
    roundRect(context, box.x, box.y, box.width, box.height, 6);
    context.fill();
    context.strokeStyle = "rgba(130, 171, 158, 0.32)";
    context.stroke();
    context.fillStyle = "#07100e";
    context.beginPath();
    context.arc(box.x + box.width * 0.28, box.y + box.height * 0.48, Math.min(box.width, box.height) * 0.2, 0, Math.PI * 2);
    context.fill();
    context.strokeStyle = "#7eaea0";
    context.stroke();
    context.fillStyle = `rgba(91, 218, 164, ${0.55 + Math.sin(time * 0.006) * 0.25})`;
    context.beginPath();
    context.arc(box.x + box.width * 0.78, box.y + box.height * 0.45, 3.5, 0, Math.PI * 2);
    context.fill();
  }

  function drawPower(context, box) {
    context.fillStyle = bodyGradient(context, box);
    roundRect(context, box.x, box.y, box.width, box.height, 6);
    context.fill();
    context.fillStyle = "#081310";
    roundRect(context, box.x + 7, box.y + 7, box.width * 0.42, box.height * 0.38, 3);
    context.fill();
    context.fillStyle = "#e0b76f";
    context.font = '8px "Cascadia Mono", monospace';
    context.fillText("12.00", box.x + 10, box.y + box.height * 0.3);
    context.fillText("V", box.x + box.width * 0.32, box.y + box.height * 0.3);
    drawKnob(context, box.x + box.width * 0.65, box.y + box.height * 0.55, 5);
    drawKnob(context, box.x + box.width * 0.82, box.y + box.height * 0.55, 4);
    context.fillStyle = "#9a483d";
    context.beginPath();
    context.arc(box.x + box.width * 0.82, box.y + box.height * 0.23, 3, 0, Math.PI * 2);
    context.fill();
  }

  function drawSignal(context, box, time) {
    context.fillStyle = bodyGradient(context, box);
    roundRect(context, box.x, box.y, box.width, box.height, 6);
    context.fill();
    context.fillStyle = "#07110f";
    roundRect(context, box.x + 7, box.y + 7, box.width * 0.55, box.height * 0.4, 3);
    context.fill();
    context.strokeStyle = "#70c3aa";
    context.lineWidth = 1;
    context.beginPath();
    for (let x = box.x + 10; x < box.x + box.width * 0.56; x += 2) {
      const y = box.y + box.height * 0.27 + Math.sin((x - box.x) * 0.16 + time * 0.005) * 5;
      if (x === box.x + 10) context.moveTo(x, y);
      else context.lineTo(x, y);
    }
    context.stroke();
    drawKnob(context, box.x + box.width * 0.72, box.y + box.height * 0.35, 5);
    drawKnob(context, box.x + box.width * 0.86, box.y + box.height * 0.35, 4);
    drawKnob(context, box.x + box.width * 0.72, box.y + box.height * 0.72, 4);
    drawKnob(context, box.x + box.width * 0.86, box.y + box.height * 0.72, 4);
  }

  function drawBoard(context, box) {
    context.fillStyle = "#16372d";
    roundRect(context, box.x, box.y, box.width, box.height, 5);
    context.fill();
    context.strokeStyle = "rgba(188, 166, 105, 0.4)";
    context.lineWidth = 1;
    context.stroke();
    context.strokeStyle = "rgba(203, 160, 70, 0.52)";
    context.beginPath();
    for (let index = 0; index < 6; index += 1) {
      const y = box.y + 10 + index * (box.height - 20) / 5;
      context.moveTo(box.x + 8, y);
      context.lineTo(box.x + box.width * 0.45, y);
      context.lineTo(box.x + box.width * 0.55, y + 9);
      context.lineTo(box.x + box.width - 8, y + 9);
    }
    context.stroke();
    context.fillStyle = "#0d1714";
    roundRect(context, box.x + box.width * 0.38, box.y + box.height * 0.25, box.width * 0.22, box.height * 0.45, 2);
    context.fill();
    for (let index = 0; index < 8; index += 1) {
      context.fillStyle = index % 3 === 0 ? "#c79551" : "#73887c";
      context.fillRect(box.x + 7 + index * (box.width - 15) / 7, box.y + box.height - 8, 4, 3);
    }
  }

  function drawProbe(context, box) {
    context.fillStyle = "rgba(33, 42, 39, 0.9)";
    roundRect(context, box.x - 5, box.y + box.height * 0.68, box.width + 10, box.height * 0.22, 3);
    context.fill();
    context.strokeStyle = "#c8cac1";
    context.lineWidth = 2;
    context.beginPath();
    context.moveTo(box.x + box.width * 0.5, box.y + 4);
    context.lineTo(box.x + box.width * 0.35, box.y + box.height * 0.72);
    context.stroke();
    context.strokeStyle = "#deba74";
    context.beginPath();
    context.moveTo(box.x + box.width * 0.35, box.y + box.height * 0.72);
    context.lineTo(box.x + box.width * 0.27, box.y + box.height * 0.9);
    context.stroke();
  }

  function drawScope(context, box, time, frequency) {
    context.fillStyle = bodyGradient(context, box);
    roundRect(context, box.x, box.y, box.width, box.height, 7);
    context.fill();
    context.strokeStyle = "rgba(139, 158, 150, 0.32)";
    context.stroke();
    const screen = {
      x: box.x + 8,
      y: box.y + 8,
      width: box.width * 0.61,
      height: box.height * 0.55
    };
    context.fillStyle = "#06100d";
    roundRect(context, screen.x, screen.y, screen.width, screen.height, 3);
    context.fill();
    context.save();
    roundRect(context, screen.x, screen.y, screen.width, screen.height, 3);
    context.clip();
    context.strokeStyle = "rgba(116, 219, 178, 0.17)";
    for (let index = 0; index < 5; index += 1) {
      context.beginPath();
      context.moveTo(screen.x, screen.y + index * screen.height / 4);
      context.lineTo(screen.x + screen.width, screen.y + index * screen.height / 4);
      context.stroke();
      context.beginPath();
      context.moveTo(screen.x + index * screen.width / 4, screen.y);
      context.lineTo(screen.x + index * screen.width / 4, screen.y + screen.height);
      context.stroke();
    }
    context.strokeStyle = "#67e39e";
    context.lineWidth = 1.4;
    context.beginPath();
    const cycles = clamp(frequency / 300, 1, 6);
    for (let x = screen.x; x < screen.x + screen.width; x += 1.5) {
      const phase = (x - screen.x) / screen.width * Math.PI * 2 * cycles;
      const y = screen.y + screen.height / 2 + Math.sin(phase + time * 0.002) * screen.height * 0.22 * state.metrics.connectivity;
      if (x === screen.x) context.moveTo(x, y);
      else context.lineTo(x, y);
    }
    context.stroke();
    context.restore();
    drawKnob(context, box.x + box.width * 0.78, box.y + box.height * 0.25, 5);
    drawKnob(context, box.x + box.width * 0.91, box.y + box.height * 0.25, 4);
    drawKnob(context, box.x + box.width * 0.78, box.y + box.height * 0.65, 4);
  }

  function drawComputer(context, box, time) {
    context.fillStyle = "#17201e";
    roundRect(context, box.x + box.width * 0.12, box.y + box.height * 0.58, box.width * 0.76, box.height * 0.18, 3);
    context.fill();
    context.fillStyle = "#0a1210";
    roundRect(context, box.x, box.y, box.width, box.height * 0.64, 5);
    context.fill();
    context.strokeStyle = "rgba(154, 181, 163, 0.28)";
    context.stroke();
    context.fillStyle = "#07120e";
    roundRect(context, box.x + 6, box.y + 6, box.width - 12, box.height * 0.52, 3);
    context.fill();
    context.strokeStyle = "#6eaaa0";
    context.lineWidth = 1;
    context.beginPath();
    context.moveTo(box.x + 10, box.y + box.height * 0.3);
    for (let x = box.x + 10; x < box.x + box.width - 10; x += 2) {
      const y = box.y + box.height * 0.3 + Math.sin((x - box.x) * 0.15 + time * 0.003) * 5;
      context.lineTo(x, y);
    }
    context.stroke();
    context.fillStyle = "rgba(203, 166, 95, 0.55)";
    context.fillRect(box.x + 11, box.y + 11, box.width * 0.24, 2);
    context.fillStyle = "rgba(94, 145, 132, 0.45)";
    context.fillRect(box.x + 11, box.y + 17, box.width * 0.38, 2);
  }

  function drawDevice(context, device, time, config) {
    const box = bounds(device);
    context.save();
    context.shadowColor = "rgba(0,0,0,0.35)";
    context.shadowBlur = 12;
    context.shadowOffsetY = 5;
    switch (device.type) {
      case "laser": drawLaser(context, box, time); break;
      case "mirror": drawMirror(context, box); break;
      case "splitter": drawSplitter(context, box); break;
      case "lens": drawLens(context, box); break;
      case "sample": drawSample(context, box, time); break;
      case "screen": drawScreen(context, box, time, config); break;
      case "detector": drawDetector(context, box, time); break;
      case "power": drawPower(context, box); break;
      case "signal": drawSignal(context, box, time); break;
      case "board": drawBoard(context, box); break;
      case "probe": drawProbe(context, box); break;
      case "scope": drawScope(context, box, time, state.metrics.frequency); break;
      case "computer": drawComputer(context, box, time); break;
      default: break;
    }
    context.restore();
    if (device.id === state.selected) {
      context.save();
      context.strokeStyle = "rgba(237, 199, 132, 0.9)";
      context.lineWidth = 1.4;
      context.setLineDash([3, 4]);
      roundRect(context, box.x - 5, box.y - 5, box.width + 10, box.height + 10, 8);
      context.stroke();
      context.restore();
    }
    if (config.annotations) {
      context.save();
      context.fillStyle = "rgba(224, 232, 225, 0.72)";
      context.font = `${state.width < 620 ? 7 : 8.5}px "Microsoft YaHei UI", sans-serif`;
      context.textAlign = "center";
      context.fillText(device.label, box.cx, box.y + box.height + 15);
      context.restore();
    }
  }

  function drawScene(config, time) {
    state.metrics = calculateMetrics(config);
    const context = state.context;
    drawBackground(context, time);
    drawCables(context, time);
    drawOpticalPath(context, time, config);
    state.devices.forEach((device) => drawDevice(context, device, time, config));

    context.save();
    context.fillStyle = "rgba(6, 11, 10, 0.76)";
    roundRect(context, 14, 13, 176, 27, 7);
    context.fill();
    context.strokeStyle = "rgba(193, 221, 202, 0.12)";
    context.stroke();
    context.fillStyle = "#c9a66d";
    context.font = '8px "Cascadia Mono", monospace';
    context.fillText("PANORAMA LAB  ·  14 DEVICES", 24, 30);

    const statusWidth = Math.min(235, state.width * 0.36);
    context.fillStyle = "rgba(6, 11, 10, 0.72)";
    roundRect(context, state.width - statusWidth - 14, 13, statusWidth, 27, 7);
    context.fill();
    context.fillStyle = state.metrics.alignment > 0.7 ? "#8bc7a0" : state.metrics.alignment > 0.4 ? "#d6b06e" : "#d88b74";
    context.textAlign = "right";
    context.fillText(
      `ALIGN ${Math.round(state.metrics.alignment * 100)}%  ·  SNR ${compact(state.metrics.snr, 1)} dB`,
      state.width - 25,
      30
    );
    context.restore();
    updateHud(config, time);
  }

  function deviceAt(clientX, clientY) {
    const rect = state.canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    return [...state.devices].reverse().find((device) => {
      const box = bounds(device);
      return x >= box.x - 7 && x <= box.x + box.width + 7 &&
        y >= box.y - 7 && y <= box.y + box.height + 7;
    });
  }

  function pointerDown(event) {
    if (!state.active) return;
    const device = deviceAt(event.clientX, event.clientY);
    if (!device) return;
    event.preventDefault();
    state.selected = device.id;
    state.dragging = {
      device,
      pointerId: event.pointerId,
      offsetX: device.x * state.width - (event.clientX - state.canvas.getBoundingClientRect().left),
      offsetY: device.y * state.height - (event.clientY - state.canvas.getBoundingClientRect().top)
    };
    state.canvas.setPointerCapture(event.pointerId);
    state.canvas.style.cursor = "grabbing";
    updateSelectionHud();
  }

  function pointerMove(event) {
    if (!state.active) return;
    if (!state.dragging) {
      state.canvas.style.cursor = deviceAt(event.clientX, event.clientY) ? "grab" : "default";
      return;
    }
    event.preventDefault();
    const rect = state.canvas.getBoundingClientRect();
    const device = state.dragging.device;
    const x = event.clientX - rect.left + state.dragging.offsetX;
    const y = event.clientY - rect.top + state.dragging.offsetY;
    const halfWidth = sizeFor(device).width / 2;
    const halfHeight = sizeFor(device).height / 2;
    device.x = clamp(x / state.width, (halfWidth + 14) / state.width, 1 - (halfWidth + 14) / state.width);
    device.y = clamp(y / state.height, (halfHeight + 10) / state.height, 1 - (halfHeight + 18) / state.height);
  }

  function pointerUp(event) {
    if (!state.dragging) return;
    state.canvas.releasePointerCapture?.(state.dragging.pointerId);
    state.dragging = null;
    state.canvas.style.cursor = "default";
  }

  function renderDeviceDock() {
    const dock = $("#panorama-device-list");
    if (!dock) return;
    dock.innerHTML = state.devices.map((device) =>
      `<button type="button" data-panorama-device="${device.id}">${device.label}</button>`
    ).join("");
    dock.querySelectorAll("[data-panorama-device]").forEach((button) => {
      button.addEventListener("click", () => {
        state.selected = button.dataset.panoramaDevice;
        updateSelectionHud();
      });
    });
    updateSelectionHud();
  }

  function resetLayout() {
    resetPositions();
    renderDeviceDock();
  }

  function init(canvas) {
    if (!canvas || state.canvas) return;
    state.canvas = canvas;
    state.context = canvas.getContext("2d");
    resetPositions();
    renderDeviceDock();
    canvas.addEventListener("pointerdown", pointerDown);
    canvas.addEventListener("pointermove", pointerMove);
    canvas.addEventListener("pointerup", pointerUp);
    canvas.addEventListener("pointercancel", pointerUp);
    $("#panorama-reset-layout")?.addEventListener("click", resetLayout);
    $("#panorama-toggle-cables")?.addEventListener("click", (event) => {
      state.showCables = !state.showCables;
      event.currentTarget.classList.toggle("active", state.showCables);
      event.currentTarget.textContent = state.showCables ? "电气连线：开" : "电气连线：关";
    });
  }

  function setActive(value) {
    state.active = Boolean(value);
    if (state.canvas) {
      state.canvas.style.touchAction = state.active ? "none" : "auto";
      state.canvas.style.cursor = state.active ? "default" : "";
    }
  }

  window.OptilabPanorama = {
    init,
    setActive,
    resetLayout,
    draw(context, width, height, time, config = {}) {
      state.context = context;
      state.width = width;
      state.height = height;
      state.active = true;
      drawScene(config, time);
    },
    getMetrics: () => ({ ...state.metrics }),
    getLayout: () => state.devices.map((device) => ({ ...device })),
    getSelected: () => state.selected
  };
})();
