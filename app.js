"use strict";

const EXPERIMENTS = {
  michelson: {
    name: "迈克尔逊干涉",
    badge: "等倾干涉",
    parameterLabel: "镜面位移",
    parameterUnit: "μm",
    parameterMin: 0,
    parameterMax: 4,
    parameterStep: 0.01,
    parameterValue: 1.6,
    formula: "Δd = Nλ / 2",
    purpose: "观察迈克尔逊干涉现象，理解等效空气薄膜厚度变化与条纹移动之间的关系。",
    principle: "激光经分束镜后形成两束相干光，分别由两面反射镜返回并在观察屏上叠加。改变其中一面反射镜的位置会改变两束光的光程差，从而引起干涉条纹移动。",
    analysisLead: "随着镜面位移变化，干涉光强呈周期性起伏，这反映了光程差随位移线性变化。可通过统计条纹周期估算波长或检查装置的位移精度。",
    error: "主要误差来源包括镜面调节不够垂直、平台移动存在回程差、环境振动以及条纹中心计数偏差。",
    improvement: "建议沿同一方向逐次移动平台，增加条纹移动次数后取平均，并缩短曝光时间以降低振动影响。",
    question: "等倾干涉条纹为什么会随镜面位移发生移动？",
    answer: "镜面移动会改变两束光的光程差。光程差每变化一个波长，观察屏上的同一位置就会经历一次完整的明暗变化，因此条纹表现为移动或吞吐。"
  },
  "double-slit": {
    name: "杨氏双缝干涉",
    badge: "双缝干涉",
    parameterLabel: "缝间距",
    parameterUnit: "mm",
    parameterMin: 0.10,
    parameterMax: 0.60,
    parameterStep: 0.01,
    parameterValue: 0.25,
    formula: "Δx = λL / d",
    purpose: "观察双缝干涉条纹，验证光的波动性，并研究波长、缝间距和条纹间距之间的关系。",
    principle: "单色光通过两个相干狭缝后形成两列相干波，在观察屏上叠加。满足光程差为波长整数倍的位置形成明条纹，半波长奇数倍的位置形成暗条纹。",
    analysisLead: "干涉条纹具有近似等间距特征。光强曲线中的相邻峰值间隔可用于估算条纹间距，并结合公式分析波长与缝间距对结果的影响。",
    error: "主要误差来源包括缝面与观察屏不完全平行、环境杂散光、缝间距标称值偏差以及条纹中心定位误差。",
    improvement: "建议增加暗室遮光，采用多次测量相邻条纹间距取平均，并校准缝间距与屏距。",
    question: "双缝干涉条纹间距受哪些因素影响？",
    answer: "条纹间距与波长和缝到屏的距离成正比，与双缝间距成反比。当前模型满足 Δx = λL / d，可拖动参数观察条纹疏密变化。"
  },
  photoelectric: {
    name: "光电效应",
    badge: "量子光电效应",
    parameterLabel: "光源强度",
    parameterUnit: "%",
    parameterMin: 10,
    parameterMax: 100,
    parameterStep: 1,
    parameterValue: 60,
    formula: "Ek = hν - W",
    purpose: "观察入射光波长对光电子发射的影响，理解光电流与入射光强度之间的关系。",
    principle: "当入射光频率高于金属逸出功对应的截止频率时，光子可把能量传递给电子并使其逸出。提高光强会增加单位时间入射光子数，但不改变单个光电子的最大初动能。",
    analysisLead: "在当前波长下，模型展示光子入射、电子发射与光电流形成过程。波长越短，单个光子能量越高；光强越高，单位时间发射电子数越多。",
    error: "主要误差来源包括暗电流、接触电位差、光源波长漂移以及阴极表面污染。",
    improvement: "建议先测量暗电流并扣除背景，稳定光源预热时间，保持阴极表面清洁，并对比多组波长数据。",
    question: "增加光强为什么不改变光电子最大初动能？",
    answer: "光强增加意味着单位时间到达金属表面的光子数增加，因此更多电子可能被激发，光电流增大；但单个光子的能量由频率决定，所以最大初动能不会随光强增大。"
  }
};

const SAMPLE_CSV = `位移_um,光强_lux
0.00,302
0.10,318
0.20,347
0.30,382
0.40,419
0.50,455
0.60,487
0.70,509
0.80,520
0.90,515
1.00,494
1.10,463
1.20,427
1.30,390
1.40,354
1.50,326
1.60,307
1.70,301
1.80,311
1.90,336
2.00,371
2.10,409
2.20,447
2.30,479
2.40,502
2.50,517
2.60,520
2.70,509
2.80,482
2.90,447
3.00,408
3.10,371
3.20,338
3.30,315
3.40,304
3.50,307
3.60,325
3.70,354
3.80,391
3.90,430
4.00,466`;

const state = {
  experiment: "michelson",
  wavelength: 632,
  parameter: 1.6,
  data: null,
  reportMode: "report",
  paused: false,
  phase: 0,
  lastFrame: 0
};

const canvas = document.getElementById("experiment-canvas");
const context = canvas.getContext("2d");
const chartCanvas = document.getElementById("data-chart");
const chartContext = chartCanvas.getContext("2d");
const wavelengthControl = document.getElementById("wavelength-control");
const parameterControl = document.getElementById("parameter-control");
const reportPreview = document.getElementById("report-preview");
const toast = document.getElementById("toast");

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function formatNumber(value, digits = 2) {
  if (!Number.isFinite(value)) return "—";
  return new Intl.NumberFormat("zh-CN", {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits
  }).format(value);
}

function escapeHtml(text) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove("show"), 2200);
}

function setCanvasResolution(canvasElement) {
  const rect = canvasElement.getBoundingClientRect();
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  const width = Math.max(1, Math.round(rect.width * ratio));
  const height = Math.max(1, Math.round(rect.height * ratio));
  if (canvasElement.width !== width || canvasElement.height !== height) {
    canvasElement.width = width;
    canvasElement.height = height;
  }
  const ctx = canvasElement.getContext("2d");
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  return { width: rect.width, height: rect.height, ratio };
}

function wavelengthToRgb(wavelength) {
  let r = 0;
  let g = 0;
  let b = 0;
  if (wavelength >= 380 && wavelength < 440) {
    r = -(wavelength - 440) / 60;
    b = 1;
  } else if (wavelength < 490) {
    g = (wavelength - 440) / 50;
    b = 1;
  } else if (wavelength < 510) {
    g = 1;
    b = -(wavelength - 510) / 20;
  } else if (wavelength < 580) {
    r = (wavelength - 510) / 70;
    g = 1;
  } else if (wavelength < 645) {
    r = 1;
    g = -(wavelength - 645) / 65;
  } else if (wavelength <= 780) {
    r = 1;
  }
  const factor = wavelength > 700 ? 0.3 + 0.7 * (780 - wavelength) / 80 : 1;
  return [
    Math.round(255 * clamp(r * factor, 0, 1)),
    Math.round(255 * clamp(g * factor, 0, 1)),
    Math.round(255 * clamp(b * factor, 0, 1))
  ];
}

function drawCanvasFrame(time) {
  const { width, height } = setCanvasResolution(canvas);
  context.clearRect(0, 0, width, height);
  const bg = context.createLinearGradient(0, 0, width, height);
  bg.addColorStop(0, "#11251c");
  bg.addColorStop(1, "#0e1d17");
  context.fillStyle = bg;
  context.fillRect(0, 0, width, height);
  drawGrid(width, height);

  if (state.experiment === "photoelectric") {
    drawPhotoelectric(width, height, time);
  } else if (state.experiment === "double-slit") {
    drawDoubleSlit(width, height, time);
  } else {
    drawMichelson(width, height, time);
  }
}

function drawGrid(width, height) {
  context.save();
  context.strokeStyle = "rgba(209, 248, 217, 0.045)";
  context.lineWidth = 1;
  for (let x = 20; x < width; x += 28) {
    context.beginPath();
    context.moveTo(x, 0);
    context.lineTo(x, height);
    context.stroke();
  }
  for (let y = 20; y < height; y += 28) {
    context.beginPath();
    context.moveTo(0, y);
    context.lineTo(width, y);
    context.stroke();
  }
  context.restore();
}

function drawBeamline(x1, y1, x2, y2, color, dashOffset = 0, alpha = 1) {
  context.save();
  context.strokeStyle = color;
  context.globalAlpha = alpha;
  context.lineWidth = 2;
  context.setLineDash([8, 7]);
  context.lineDashOffset = dashOffset;
  context.beginPath();
  context.moveTo(x1, y1);
  context.lineTo(x2, y2);
  context.stroke();
  context.restore();
}

function drawMichelson(width, height, time) {
  const color = wavelengthToRgb(state.wavelength);
  const colorCss = `rgb(${color.join(",")})`;
  const leftWidth = Math.min(width * 0.43, 270);
  const cy = height * 0.52;
  const sourceX = Math.max(30, leftWidth * 0.12);
  const splitterX = leftWidth * 0.62;
  const mirrorTopY = cy - height * 0.33;
  const mirrorBottomY = cy + height * 0.31;

  drawBeamline(sourceX, cy, splitterX, cy, colorCss, -time * 0.04);
  drawBeamline(splitterX, cy, splitterX, mirrorTopY, colorCss, -time * 0.04);
  drawBeamline(splitterX, mirrorTopY, splitterX - 18, mirrorTopY, colorCss, 0, 0.55);
  drawBeamline(splitterX, cy, splitterX, mirrorBottomY, colorCss, -time * 0.04);
  drawBeamline(splitterX, mirrorBottomY, splitterX + 20, mirrorBottomY, colorCss, 0, 0.55);
  drawBeamline(splitterX, cy, width - 28, cy, colorCss, -time * 0.04, 0.7);

  context.save();
  context.fillStyle = colorCss;
  context.shadowColor = colorCss;
  context.shadowBlur = 18;
  context.beginPath();
  context.arc(sourceX, cy, 6, 0, Math.PI * 2);
  context.fill();
  context.restore();

  context.save();
  context.translate(splitterX, cy);
  context.rotate(Math.PI / 4);
  context.strokeStyle = "#d7f0de";
  context.globalAlpha = 0.62;
  context.strokeRect(-6, -27, 12, 54);
  context.restore();

  drawMirror(splitterX - 5, mirrorTopY, 42);
  drawMirror(splitterX - 5, mirrorBottomY, 42);

  context.fillStyle = "rgba(221, 248, 229, 0.56)";
  context.font = '9px "Microsoft YaHei UI", sans-serif';
  context.fillText("激光源", sourceX - 14, cy + 25);
  context.fillText("分束镜", splitterX - 17, cy + 49);
  context.fillText("M1", splitterX + 24, mirrorTopY + 3);
  context.fillText("M2", splitterX + 25, mirrorBottomY + 3);

  const screenX = width * 0.77;
  const screenWidth = width * 0.2;
  const centerY = height * 0.52;

  context.save();
  context.fillStyle = "rgba(4, 15, 9, 0.55)";
  context.fillRect(screenX, height * 0.13, screenWidth, height * 0.74);
  context.strokeStyle = "rgba(210, 242, 218, 0.16)";
  context.strokeRect(screenX, height * 0.13, screenWidth, height * 0.74);
  context.clip();
  const scale = Math.min(0.75, 0.34 + state.parameter * 0.085);
  for (let y = height * 0.13; y < height * 0.87; y += 1.5) {
    for (let x = screenX; x < screenX + screenWidth; x += 1.5) {
      const nx = (x - (screenX + screenWidth / 2)) / scale;
      const ny = (y - centerY) / scale;
      const radius = Math.sqrt(nx * nx + ny * ny);
      const value = 0.5 + 0.5 * Math.cos(radius * 0.43 + state.phase);
      const alpha = Math.pow(value, 9);
      if (alpha > 0.012) {
        context.fillStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${alpha})`;
        context.fillRect(x, y, 1.8, 1.8);
      }
    }
  }
  context.restore();

  context.fillStyle = "rgba(221, 248, 229, 0.56)";
  context.font = '9px "Microsoft YaHei UI", sans-serif';
  context.fillText("观察屏", screenX + screenWidth / 2 - 14, height * 0.1);
}

function drawMirror(x, y, width) {
  context.save();
  context.strokeStyle = "#b8d7c1";
  context.lineWidth = 4;
  context.beginPath();
  context.moveTo(x - width / 2, y);
  context.lineTo(x + width / 2, y);
  context.stroke();
  context.strokeStyle = "rgba(184, 215, 193, 0.24)";
  context.lineWidth = 1;
  for (let offset = -3; offset <= 3; offset += 3) {
    context.beginPath();
    context.moveTo(x - width / 2, y + offset);
    context.lineTo(x + width / 2, y + offset);
    context.stroke();
  }
  context.restore();
}

function drawDoubleSlit(width, height, time) {
  const color = wavelengthToRgb(state.wavelength);
  const colorCss = `rgb(${color.join(",")})`;
  const cy = height * 0.52;
  const sourceX = Math.max(34, width * 0.12);
  const slitX = width * 0.43;
  const screenX = width * 0.72;
  const screenWidth = width * 0.2;
  const slitGap = 10 + (state.parameter - 0.1) * 20;

  drawBeamline(sourceX, cy, slitX, cy, colorCss, -time * 0.05, 0.9);
  drawBeamline(slitX, cy - slitGap / 2, screenX, height * 0.18, colorCss, -time * 0.04, 0.45);
  drawBeamline(slitX, cy - slitGap / 2, screenX, height * 0.82, colorCss, -time * 0.04, 0.45);
  drawBeamline(slitX, cy + slitGap / 2, screenX, height * 0.18, colorCss, -time * 0.04, 0.45);
  drawBeamline(slitX, cy + slitGap / 2, screenX, height * 0.82, colorCss, -time * 0.04, 0.45);

  context.save();
  context.strokeStyle = "#d5eadb";
  context.lineWidth = 5;
  context.beginPath();
  context.moveTo(slitX, height * 0.13);
  context.lineTo(slitX, cy - slitGap / 2 - 4);
  context.moveTo(slitX, cy - slitGap / 2 + 4);
  context.lineTo(slitX, cy + slitGap / 2 - 4);
  context.moveTo(slitX, cy + slitGap / 2 + 4);
  context.lineTo(slitX, height * 0.87);
  context.stroke();
  context.restore();

  context.save();
  context.fillStyle = colorCss;
  context.shadowColor = colorCss;
  context.shadowBlur = 18;
  context.beginPath();
  context.arc(sourceX, cy, 6, 0, Math.PI * 2);
  context.fill();
  context.restore();

  const fringePeriod = 26 - state.parameter * 23;
  context.save();
  context.fillStyle = "rgba(5, 14, 9, 0.62)";
  context.fillRect(screenX, height * 0.1, screenWidth, height * 0.8);
  context.beginPath();
  context.rect(screenX, height * 0.1, screenWidth, height * 0.8);
  context.clip();
  for (let y = height * 0.1; y < height * 0.9; y += 1.4) {
    const intensity = Math.pow(0.5 + 0.5 * Math.cos(((y - cy) / fringePeriod) * Math.PI * 2 + state.phase), 2);
    const alpha = intensity * 0.92;
    const gradient = context.createLinearGradient(screenX, 0, screenX + screenWidth, 0);
    gradient.addColorStop(0, `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${alpha * 0.45})`);
    gradient.addColorStop(0.5, `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${alpha})`);
    gradient.addColorStop(1, `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${alpha * 0.45})`);
    context.fillStyle = gradient;
    context.fillRect(screenX, y, screenWidth, 1.6);
  }
  context.restore();

  context.fillStyle = "rgba(221, 248, 229, 0.56)";
  context.font = '9px "Microsoft YaHei UI", sans-serif';
  context.fillText("单色光源", sourceX - 20, cy + 24);
  context.fillText("双缝", slitX - 10, height * 0.92);
  context.fillText("干涉条纹", screenX + screenWidth / 2 - 20, height * 0.07);
}

function drawPhotoelectric(width, height, time) {
  const color = wavelengthToRgb(state.wavelength);
  const colorCss = `rgb(${color.join(",")})`;
  const cy = height * 0.52;
  const sourceX = Math.max(35, width * 0.12);
  const cathodeX = width * 0.6;
  const anodeX = width * 0.83;
  const thresholdWavelength = 560;
  const emits = state.wavelength < thresholdWavelength;
  const photonCount = Math.round(6 + state.parameter / 12);

  context.save();
  context.fillStyle = "#d4e2d8";
  context.globalAlpha = 0.72;
  context.fillRect(cathodeX, height * 0.21, 8, height * 0.58);
  context.fillRect(anodeX, height * 0.28, 8, height * 0.44);
  context.restore();

  context.fillStyle = "rgba(221, 248, 229, 0.56)";
  context.font = '9px "Microsoft YaHei UI", sans-serif';
  context.fillText("阴极 K", cathodeX - 11, height * 0.88);
  context.fillText("阳极 A", anodeX - 12, height * 0.88);
  context.fillText(emits ? "可发生光电效应" : "低于截止频率", sourceX - 16, height * 0.12);

  context.save();
  context.fillStyle = colorCss;
  context.shadowColor = colorCss;
  context.shadowBlur = 20;
  context.beginPath();
  context.arc(sourceX, cy, 8, 0, Math.PI * 2);
  context.fill();
  context.restore();

  const travel = (time * 0.08) % Math.max(1, cathodeX - sourceX);
  for (let index = 0; index < photonCount; index += 1) {
    const offset = (travel + index * (cathodeX - sourceX) / photonCount) % (cathodeX - sourceX);
    const px = sourceX + offset;
    const py = cy + Math.sin(index * 2.13 + time * 0.001) * height * 0.22;
    context.save();
    context.fillStyle = colorCss;
    context.shadowColor = colorCss;
    context.shadowBlur = 7;
    context.beginPath();
    context.arc(px, py, 2.2, 0, Math.PI * 2);
    context.fill();
    context.restore();
  }

  if (emits) {
    const electronCount = Math.round(3 + state.parameter / 10);
    for (let index = 0; index < electronCount; index += 1) {
      const progress = (time * 0.00009 + index / electronCount) % 1;
      const px = cathodeX + (anodeX - cathodeX) * progress;
      const baseY = cy + (index - electronCount / 2) * 13;
      const py = baseY + Math.sin(progress * Math.PI) * (index % 2 ? 19 : -19);
      context.save();
      context.strokeStyle = `rgba(186, 236, 255, ${0.8 - progress * 0.45})`;
      context.lineWidth = 1.4;
      context.beginPath();
      context.arc(px, py, 2.3, 0, Math.PI * 2);
      context.stroke();
      context.restore();
    }
  } else {
    context.fillStyle = "rgba(237, 180, 111, 0.82)";
    context.font = '10px "Microsoft YaHei UI", sans-serif';
    context.fillText("光子能量不足", cathodeX + 24, cy - 32);
  }

  context.save();
  context.strokeStyle = "rgba(222, 250, 230, 0.22)";
  context.setLineDash([5, 6]);
  context.beginPath();
  context.moveTo(cathodeX + 10, cy + 75);
  context.lineTo(anodeX - 10, cy + 75);
  context.stroke();
  context.restore();
  context.fillStyle = "rgba(221, 248, 229, 0.48)";
  context.fillText("光电流", (cathodeX + anodeX) / 2 - 13, cy + 91);
}

function animationLoop(time) {
  if (!state.paused) {
    if (!state.lastFrame) state.lastFrame = time;
    const delta = Math.min(50, time - state.lastFrame);
    state.lastFrame = time;
    state.phase += delta * 0.0016;
    drawCanvasFrame(time);
  } else {
    state.lastFrame = time;
  }
  requestAnimationFrame(animationLoop);
}

function switchExperiment(key) {
  const experiment = EXPERIMENTS[key];
  state.experiment = key;
  state.parameter = experiment.parameterValue;
  document.querySelectorAll(".experiment-option").forEach((button) => {
    const isActive = button.dataset.experiment === key;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-selected", String(isActive));
  });
  document.getElementById("visualizer-title").textContent = `${experiment.name}模型`;
  document.getElementById("canvas-badge").textContent = experiment.badge;
  document.getElementById("parameter-label").textContent = experiment.parameterLabel;
  document.getElementById("formula").textContent = experiment.formula;
  parameterControl.min = experiment.parameterMin;
  parameterControl.max = experiment.parameterMax;
  parameterControl.step = experiment.parameterStep;
  parameterControl.value = experiment.parameterValue;
  updateParameterLabel();
  buildReport();
  drawCanvasFrame(performance.now());
  showToast(`已切换到${experiment.name}`);
}

function updateParameterLabel() {
  const experiment = EXPERIMENTS[state.experiment];
  document.getElementById("parameter-value").textContent =
    `${formatNumber(state.parameter, experiment.parameterStep < 0.1 ? 2 : 0)} ${experiment.parameterUnit}`;
}

function parseDelimitedLine(line, delimiter) {
  const values = [];
  let current = "";
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if (char === '"') {
      if (quoted && line[index + 1] === '"') {
        current += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (char === delimiter && !quoted) {
      values.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  values.push(current.trim());
  return values;
}

function parseCsv(text) {
  const clean = text.replace(/^\uFEFF/, "").trim();
  if (!clean) throw new Error("文件内容为空");
  const lines = clean.split(/\r?\n/).filter((line) => line.trim());
  if (lines.length < 2) throw new Error("至少需要表头和一行数据");
  const delimiter = [
    [",", lines[0].split(",").length - 1],
    [";", lines[0].split(";").length - 1],
    ["\t", lines[0].split("\t").length - 1]
  ].sort((a, b) => b[1] - a[1])[0][0];
  const rows = lines.map((line) => parseDelimitedLine(line, delimiter));
  const header = rows[0];
  const body = rows.slice(1);
  const columnCount = Math.min(...body.map((row) => row.length));
  let xIndex = -1;
  let yIndex = -1;
  for (let column = 0; column < columnCount; column += 1) {
    const numericCount = body.filter((row) => Number.isFinite(Number(row[column]))).length;
    if (numericCount >= Math.max(2, body.length * 0.6)) {
      if (xIndex === -1) xIndex = column;
      else if (yIndex === -1) {
        yIndex = column;
        break;
      }
    }
  }
  if (xIndex === -1 || yIndex === -1) throw new Error("未找到两列有效数值");
  const points = body
    .map((row) => ({ x: Number(row[xIndex]), y: Number(row[yIndex]), rawX: row[xIndex], rawY: row[yIndex] }))
    .filter((point) => Number.isFinite(point.x) && Number.isFinite(point.y))
    .sort((a, b) => a.x - b.x);
  if (points.length < 2) throw new Error("有效数据不足两行");
  return {
    headers: [header[xIndex] || "横轴", header[yIndex] || "纵轴"],
    points
  };
}

function calculateStats(values) {
  const n = values.length;
  const sum = values.reduce((total, value) => total + value, 0);
  const mean = sum / n;
  const variance = values.reduce((total, value) => total + (value - mean) ** 2, 0) / n;
  return {
    n,
    mean,
    min: Math.min(...values),
    max: Math.max(...values),
    std: Math.sqrt(variance)
  };
}

function applyData(parsed, sourceName) {
  const yValues = parsed.points.map((point) => point.y);
  const stats = calculateStats(yValues);
  state.data = {
    ...parsed,
    stats,
    sourceName
  };
  document.getElementById("row-count").textContent = `${stats.n} 条记录`;
  document.getElementById("metric-mean").textContent = formatNumber(stats.mean, 2);
  document.getElementById("metric-max").textContent = formatNumber(stats.max, 2);
  document.getElementById("metric-min").textContent = formatNumber(stats.min, 2);
  document.getElementById("metric-std").textContent = formatNumber(stats.std, 2);
  document.getElementById("x-axis-label").textContent = parsed.headers[0];
  document.getElementById("y-axis-label").textContent = parsed.headers[1];
  document.getElementById("csv-status").textContent = `${sourceName} · ${stats.n} 条记录`;
  document.getElementById("chart-empty").classList.add("hidden");
  drawDataChart();
  buildReport();
}

function drawDataChart() {
  const { width, height } = setCanvasResolution(chartCanvas);
  chartContext.clearRect(0, 0, width, height);
  if (!state.data) return;
  const points = state.data.points;
  const padding = { top: 22, right: 18, bottom: 27, left: 43 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  const xMin = Math.min(...points.map((point) => point.x));
  const xMax = Math.max(...points.map((point) => point.x));
  const yMinRaw = Math.min(...points.map((point) => point.y));
  const yMaxRaw = Math.max(...points.map((point) => point.y));
  const yRangeRaw = yMaxRaw - yMinRaw || 1;
  const yMin = yMinRaw - yRangeRaw * 0.1;
  const yMax = yMaxRaw + yRangeRaw * 0.1;
  const xRange = xMax - xMin || 1;
  const yRange = yMax - yMin || 1;
  const mapX = (x) => padding.left + ((x - xMin) / xRange) * chartWidth;
  const mapY = (y) => padding.top + (1 - (y - yMin) / yRange) * chartHeight;

  chartContext.save();
  chartContext.strokeStyle = "rgba(29, 48, 37, 0.14)";
  chartContext.lineWidth = 1;
  chartContext.fillStyle = "#879087";
  chartContext.font = '9px Consolas, monospace';
  chartContext.textAlign = "right";
  chartContext.textBaseline = "middle";
  for (let index = 0; index <= 4; index += 1) {
    const value = yMin + (yRange * index) / 4;
    const y = mapY(value);
    chartContext.beginPath();
    chartContext.moveTo(padding.left, y);
    chartContext.lineTo(width - padding.right, y);
    chartContext.stroke();
    chartContext.fillText(formatNumber(value, 0), padding.left - 8, y);
  }

  chartContext.textAlign = "center";
  chartContext.textBaseline = "top";
  for (let index = 0; index <= 4; index += 1) {
    const value = xMin + (xRange * index) / 4;
    const x = mapX(value);
    chartContext.fillText(formatNumber(value, xRange < 10 ? 2 : 1), x, height - padding.bottom + 9);
  }
  chartContext.restore();

  const areaGradient = chartContext.createLinearGradient(0, padding.top, 0, height - padding.bottom);
  areaGradient.addColorStop(0, "rgba(23, 109, 75, 0.18)");
  areaGradient.addColorStop(1, "rgba(23, 109, 75, 0.01)");
  chartContext.beginPath();
  points.forEach((point, index) => {
    const x = mapX(point.x);
    const y = mapY(point.y);
    if (index === 0) chartContext.moveTo(x, y);
    else chartContext.lineTo(x, y);
  });
  chartContext.lineTo(mapX(points.at(-1).x), height - padding.bottom);
  chartContext.lineTo(mapX(points[0].x), height - padding.bottom);
  chartContext.closePath();
  chartContext.fillStyle = areaGradient;
  chartContext.fill();

  chartContext.beginPath();
  points.forEach((point, index) => {
    const x = mapX(point.x);
    const y = mapY(point.y);
    if (index === 0) chartContext.moveTo(x, y);
    else chartContext.lineTo(x, y);
  });
  chartContext.strokeStyle = "#176d4b";
  chartContext.lineWidth = 2.2;
  chartContext.lineJoin = "round";
  chartContext.stroke();

  points.forEach((point) => {
    chartContext.beginPath();
    chartContext.fillStyle = "#f8f8f3";
    chartContext.strokeStyle = "#176d4b";
    chartContext.lineWidth = 1.5;
    chartContext.arc(mapX(point.x), mapY(point.y), 2.6, 0, Math.PI * 2);
    chartContext.fill();
    chartContext.stroke();
  });
}

function statsText() {
  if (!state.data) {
    return "当前尚未导入实验数据。建议导入至少包含横轴、纵轴两列数值的 CSV，再结合统计结果撰写分析。";
  }
  const { stats, headers, sourceName } = state.data;
  return `数据文件为 ${sourceName}，共整理 ${stats.n} 条有效记录。${headers[1]}的平均值为 ${formatNumber(stats.mean, 2)}，最大值为 ${formatNumber(stats.max, 2)}，最小值为 ${formatNumber(stats.min, 2)}，标准差为 ${formatNumber(stats.std, 2)}。`;
}

function buildReport() {
  const experiment = EXPERIMENTS[state.experiment];
  const date = new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric"
  }).format(new Date());
  let text;
  if (state.reportMode === "paper") {
    text = `# ${experiment.name}实验数据分析与研究报告提纲

## 摘要
本文基于${experiment.name}实验，围绕${experiment.purpose.replace("。", "")}展开分析，并利用光电实验小助手完成数据整理、图表生成与初步结果归纳。

## 关键词
${experiment.name}；实验数据分析；光强；误差分析；实验教学

## 1 引言
说明实验背景、实验目标及当前教学中复杂原理理解困难、数据整理重复度高的问题。

## 2 实验原理
${experiment.principle}

关键关系：${experiment.formula}

## 3 实验方法与数据处理
介绍实验装置、测量参数、数据采集流程与异常值处理原则。${statsText()}

## 4 结果与讨论
${experiment.analysisLead}

可结合自动生成的折线图描述峰值、谷值、周期或单调变化，并与理论关系进行对照。

## 5 误差分析
${experiment.error}

## 6 改进建议
${experiment.improvement}

## 7 结论
总结实验现象与理论模型的一致性，说明提高测量精度和重复实验次数对结果可靠性的作用。

## 参考文献
[1] 待补充实验指导书。
[2] 待补充大学物理实验教材。
[3] 待补充相关光学或光电效应文献。

> 论文提纲由 OptiLab 基础版生成，提交前需核对实验事实、数据与参考文献。`;
  } else {
    text = `# ${experiment.name}实验报告

实验日期：${date}
报告工具：光电实验小助手基础版

## 一、实验目的
${experiment.purpose}

## 二、实验原理
${experiment.principle}

关键关系：${experiment.formula}

## 三、实验数据
${statsText()}

## 四、结果分析
${experiment.analysisLead}

${state.data ? "从自动绘制的曲线可进一步读取极值位置和周期性特征，并与上述统计量相互印证。" : "完成数据导入后，本段将自动补充统计结果，并同步更新折线图。"}

## 五、误差分析
${experiment.error}

## 六、改进建议
${experiment.improvement}

## 七、结论
本次实验围绕${experiment.name}的典型现象完成了原理展示、数据整理与结果归纳。后续可通过增加重复测量、校准关键参数和接入图像识别，进一步提高分析效率与报告质量。

> 本报告由结构化模板生成，提交前请结合原始记录核对数据与结论。`;
  }
  reportPreview.textContent = text;
  document.getElementById("report-char-count").textContent = String(text.replace(/\s/g, "").length);
}

function answerQuestion(question) {
  const experiment = EXPERIMENTS[state.experiment];
  const lower = question.toLowerCase();
  let answer;
  if (question.includes("误差") || question.includes("改进")) {
    answer = `${experiment.error} ${experiment.improvement}`;
  } else if (question.includes("数据") || question.includes("结果") || question.includes("统计")) {
    answer = state.data
      ? `${statsText()} ${experiment.analysisLead}`
      : "还没有可分析的数据。你可以在“实验数据导入”中选择 CSV，或点击“使用示例”先体验完整流程。";
  } else if (question.includes("条纹") || question.includes("公式") || question.includes("原理")) {
    answer = `${experiment.answer} 当前关键关系为 ${experiment.formula}。`;
  } else {
    answer = `当前模型是${experiment.name}。${experiment.principle} 你可以继续问我原理、条纹、误差或当前数据结果。`;
  }
  return answer;
}

function appendMessage(text, type) {
  const log = document.getElementById("chat-log");
  const message = document.createElement("div");
  message.className = `message ${type}`;
  message.innerHTML = escapeHtml(text);
  log.appendChild(message);
  log.scrollTop = log.scrollHeight;
}

function askQuestion(question) {
  if (!question.trim()) return;
  appendMessage(question, "user-message");
  window.setTimeout(() => appendMessage(answerQuestion(question), "assistant-message"), 220);
}

function analyzeImage(file) {
  if (!file.type.startsWith("image/")) {
    showToast("请选择 PNG、JPG 等图片文件");
    return;
  }
  const url = URL.createObjectURL(file);
  const image = new Image();
  image.onload = () => {
    const sampleCanvas = document.createElement("canvas");
    const sampleSize = 96;
    const ratio = image.width / image.height;
    sampleCanvas.width = ratio >= 1 ? sampleSize : Math.max(2, Math.round(sampleSize * ratio));
    sampleCanvas.height = ratio >= 1 ? Math.max(2, Math.round(sampleSize / ratio)) : sampleSize;
    const sampleContext = sampleCanvas.getContext("2d", { willReadFrequently: true });
    sampleContext.drawImage(image, 0, 0, sampleCanvas.width, sampleCanvas.height);
    const pixels = sampleContext.getImageData(0, 0, sampleCanvas.width, sampleCanvas.height).data;
    const gray = new Float32Array(sampleCanvas.width * sampleCanvas.height);
    let luminanceSum = 0;
    for (let index = 0; index < gray.length; index += 1) {
      const offset = index * 4;
      const value = pixels[offset] * 0.2126 + pixels[offset + 1] * 0.7152 + pixels[offset + 2] * 0.0722;
      gray[index] = value;
      luminanceSum += value;
    }
    const mean = luminanceSum / gray.length;
    let edgeEnergy = 0;
    let count = 0;
    for (let y = 1; y < sampleCanvas.height - 1; y += 1) {
      for (let x = 1; x < sampleCanvas.width - 1; x += 1) {
        const index = y * sampleCanvas.width + x;
        const gx = gray[index + 1] - gray[index - 1];
        const gy = gray[index + sampleCanvas.width] - gray[index - sampleCanvas.width];
        edgeEnergy += Math.sqrt(gx * gx + gy * gy);
        count += 1;
      }
    }
    const sharpness = edgeEnergy / Math.max(1, count);
    const brightnessLabel = mean < 55 ? "偏暗" : mean > 205 ? "偏亮" : "亮度适中";
    const sharpnessLabel = sharpness < 8 ? "可能模糊" : sharpness < 18 ? "清晰度一般" : "边缘清晰";
    let advice = "照片可用于实验记录。";
    if (brightnessLabel !== "亮度适中" && sharpnessLabel === "可能模糊") {
      advice = "建议补光后重新拍摄，并固定手机或相机以减少模糊。";
    } else if (brightnessLabel !== "亮度适中") {
      advice = "建议调整曝光，避免条纹或示数区域过曝、欠曝。";
    } else if (sharpnessLabel === "可能模糊") {
      advice = "建议重新对焦；若用于自动识图，清晰边缘有助于后续模型判断。";
    } else {
      advice = "图像基础质量合格；基础版暂不进行器件识别。";
    }
    document.getElementById("image-preview").src = url;
    document.getElementById("image-name").textContent = file.name;
    document.getElementById("image-size").textContent = `${image.width} × ${image.height}`;
    document.getElementById("image-brightness").textContent = brightnessLabel;
    document.getElementById("image-sharpness").textContent = sharpnessLabel;
    document.getElementById("image-advice").textContent = advice;
    document.querySelector(".drop-zone").hidden = true;
    document.getElementById("image-result").hidden = false;
    showToast("照片基础质量检查完成");
  };
  image.onerror = () => showToast("无法读取这张图片");
  image.src = url;
}

function loadSampleData() {
  applyData(parseCsv(SAMPLE_CSV), "示例数据.csv");
  document.getElementById("csv-text").value = "";
  showToast("示例数据已载入，图表与报告已更新");
}

function downloadReport() {
  const blob = new Blob([reportPreview.textContent], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  const experimentName = EXPERIMENTS[state.experiment].name;
  anchor.href = url;
  anchor.download = `${experimentName}_${state.reportMode === "paper" ? "论文提纲" : "实验报告"}.md`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
  showToast("报告已下载");
}

async function copyReport() {
  try {
    await navigator.clipboard.writeText(reportPreview.textContent);
  } catch {
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(reportPreview);
    selection.removeAllRanges();
    selection.addRange(range);
    document.execCommand("copy");
    selection.removeAllRanges();
  }
  showToast("报告内容已复制");
}

function setupEventListeners() {
  document.querySelectorAll(".experiment-option").forEach((button) => {
    button.addEventListener("click", () => switchExperiment(button.dataset.experiment));
  });

  wavelengthControl.addEventListener("input", (event) => {
    state.wavelength = Number(event.target.value);
    document.getElementById("wavelength-value").textContent = `${state.wavelength} nm`;
    drawCanvasFrame(performance.now());
  });

  parameterControl.addEventListener("input", (event) => {
    state.parameter = Number(event.target.value);
    updateParameterLabel();
    drawCanvasFrame(performance.now());
  });

  document.getElementById("pause-button").addEventListener("click", (event) => {
    state.paused = !state.paused;
    event.currentTarget.classList.toggle("paused", state.paused);
    document.getElementById("pause-label").textContent = state.paused ? "继续" : "暂停";
    event.currentTarget.setAttribute("aria-label", state.paused ? "继续动画" : "暂停动画");
  });

  document.getElementById("image-input").addEventListener("change", (event) => {
    if (event.target.files[0]) analyzeImage(event.target.files[0]);
  });

  const imageDrop = document.getElementById("image-drop");
  ["dragenter", "dragover"].forEach((type) => {
    imageDrop.addEventListener(type, (event) => {
      event.preventDefault();
      imageDrop.classList.add("drag-over");
    });
  });
  ["dragleave", "drop"].forEach((type) => {
    imageDrop.addEventListener(type, (event) => {
      event.preventDefault();
      imageDrop.classList.remove("drag-over");
    });
  });
  imageDrop.addEventListener("drop", (event) => {
    if (event.dataTransfer.files[0]) analyzeImage(event.dataTransfer.files[0]);
  });

  document.getElementById("csv-input").addEventListener("change", async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    try {
      applyData(parseCsv(await file.text()), file.name);
      showToast(`已解析 ${file.name}`);
    } catch (error) {
      showToast(error.message);
    }
  });

  document.getElementById("parse-pasted").addEventListener("click", () => {
    const text = document.getElementById("csv-text").value;
    try {
      applyData(parseCsv(text), "粘贴数据");
      showToast("粘贴数据解析完成");
    } catch (error) {
      showToast(error.message);
    }
  });

  ["load-sample", "inline-sample"].forEach((id) => {
    document.getElementById(id).addEventListener("click", loadSampleData);
  });

  document.getElementById("chat-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const input = document.getElementById("chat-input");
    askQuestion(input.value);
    input.value = "";
  });

  document.querySelectorAll(".quick-questions button").forEach((button) => {
    button.addEventListener("click", () => askQuestion(button.dataset.question));
  });

  document.querySelectorAll(".report-tab").forEach((button) => {
    button.addEventListener("click", () => {
      state.reportMode = button.dataset.reportMode;
      document.querySelectorAll(".report-tab").forEach((tab) => {
        tab.classList.toggle("active", tab === button);
      });
      buildReport();
    });
  });

  document.getElementById("copy-report").addEventListener("click", copyReport);
  document.getElementById("download-report").addEventListener("click", downloadReport);

  document.getElementById("start-demo").addEventListener("click", () => {
    document.getElementById("workspace").scrollIntoView({ behavior: "smooth", block: "start" });
  });

  document.querySelectorAll(".nav-item").forEach((button) => {
    button.addEventListener("click", () => {
      document.getElementById(button.dataset.target).scrollIntoView({ behavior: "smooth", block: "start" });
      document.querySelectorAll(".nav-item").forEach((item) => item.classList.toggle("active", item === button));
    });
  });

  window.addEventListener("resize", () => {
    drawCanvasFrame(performance.now());
    drawDataChart();
  });
}

function updateClock() {
  const now = new Date();
  document.getElementById("clock").textContent = now.toLocaleTimeString("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  });
}

function init() {
  setupEventListeners();
  updateClock();
  window.setInterval(updateClock, 15000);
  buildReport();
  drawCanvasFrame(performance.now());
  drawDataChart();
  requestAnimationFrame(animationLoop);
}

init();
