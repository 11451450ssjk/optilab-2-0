"use strict";

(function () {
  const bridge = window.OptilabBridge;
  const simulation = window.OptilabSimulation;
  if (!bridge || !simulation) return;

  const $ = (selector) => document.querySelector(selector);
  const number = (selector, fallback = 0) => {
    const value = Number($(selector)?.value);
    return Number.isFinite(value) ? value : fallback;
  };
  const format = (value, digits = 4) => window.OptilabPhysics?.formatNumber(value, digits) || "—";
  let refreshTimer = 0;
  let lastSignature = "";

  const labels = {
    sourceVoltage: "电源",
    node2Voltage: "节点 2",
    node3Voltage: "节点 3",
    branchCurrent1Ma: "支路 I₁",
    branchCurrent2Ma: "支路 I₂",
    branchCurrent3Ma: "支路 I₃",
    kclResidualUa: "KCL 残差",
    bridgeVoltageMv: "桥路输出",
    bridgeSensitivityMvPerOhm: "桥路灵敏度",
    relativeResistanceChange: "相对变化",
    frequencyHz: "频率",
    periodMs: "周期",
    amplitudeVpp: "幅值 Vpp",
    rmsV: "有效值",
    timebaseUsPerDivision: "时基",
    tauMs: "时间常数",
    riseTo63Ms: "升至 63%",
    settled99Ms: "稳定至 99%",
    cutoffHz: "截止频率",
    gainAtCutoff: "截止增益",
    gainAtCutoffDb: "截止增益 dB",
    phaseAtCutoffDeg: "相位",
    rolloffDbPerOctave: "滚降",
    outputNoiseUv: "输出噪声",
    verticalNoiseMv: "垂直噪声",
    closedLoopGain: "闭环增益",
    outputMv: "输出幅值",
    feedbackFactor: "反馈系数",
    oscillationFrequencyHz: "振荡频率",
    loopGainThreshold: "环路增益阈值",
    junctionCurrentMa: "结电流",
    thermalVoltageMv: "热电压",
    dynamicResistanceOhm: "动态电阻"
  };

  function updateControlOutputs() {
    const outputs = [
      ["#simulation-sample-count", "#simulation-sample-count-value", (value) => String(value)],
      ["#simulation-noise", "#simulation-noise-value", (value) => `${value.toFixed(1)}%`],
      ["#simulation-drift", "#simulation-drift-value", (value) => `${value.toFixed(2)}%`],
      ["#simulation-outliers", "#simulation-outliers-value", (value) => `${value.toFixed(1)}%`]
    ];
    outputs.forEach(([inputSelector, outputSelector, formatter]) => {
      const input = $(inputSelector);
      const output = $(outputSelector);
      if (input && output) output.textContent = formatter(Number(input.value) || 0);
    });
  }

  function readingUnit(key, value, circuit) {
    if (/SensitivityMvPerOhm/i.test(key)) return "mV/Ω";
    if (/Mv$/i.test(key)) return "mV";
    if (/Voltage|Vpp|rmsV/i.test(key)) return "V";
    if (/Current.*Ma|junctionCurrentMa/i.test(key)) return "mA";
    if (/FrequencyHz|cutoffHz|oscillationFrequencyHz/i.test(key)) return "Hz";
    if (/Ms$|periodMs|tauMs|riseTo63Ms|settled99Ms/i.test(key)) return "ms";
    if (/Db|rolloffDbPerOctave|gainAtCutoffDb/i.test(key)) return "dB";
    if (/Deg/i.test(key)) return "°";
    if (/Ohm/i.test(key)) return "Ω";
    if (/Ua/i.test(key)) return "μA";
    if (/UsPerDivision/i.test(key)) return "μs/div";
    return "";
  }

  function drawUncertaintyDistribution(uncertainty) {
    const canvas = $("#simulation-uncertainty-chart");
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const ratio = Math.max(1, Math.min(2, devicePixelRatio || 1));
    canvas.width = Math.round(rect.width * ratio);
    canvas.height = Math.round(rect.height * ratio);
    const context = canvas.getContext("2d");
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    context.clearRect(0, 0, rect.width, rect.height);
    const values = (uncertainty?.distribution || []).filter(Number.isFinite);
    if (values.length < 4) return;
    const minimum = Math.min(...values);
    const maximum = Math.max(...values);
    const span = maximum - minimum || 1;
    const bins = 18;
    const counts = Array(bins).fill(0);
    values.forEach((value) => {
      const index = Math.min(bins - 1, Math.floor((value - minimum) / span * bins));
      counts[index] += 1;
    });
    const maximumCount = Math.max(...counts, 1);
    const left = 9;
    const right = rect.width - 9;
    const top = 8;
    const bottom = rect.height - 13;
    const width = (right - left) / bins;
    counts.forEach((count, index) => {
      const height = (bottom - top) * count / maximumCount;
      context.fillStyle = index === counts.indexOf(maximumCount)
        ? "rgba(215, 179, 111, 0.82)"
        : "rgba(105, 174, 132, 0.55)";
      context.fillRect(left + index * width + 1, bottom - height, Math.max(1, width - 2), height);
    });
    if (uncertainty.interval95?.every(Number.isFinite)) {
      const [low, high] = uncertainty.interval95;
      context.strokeStyle = "rgba(255, 236, 195, 0.58)";
      context.lineWidth = 1;
      [low, high].forEach((value) => {
        const x = left + ((value - minimum) / span) * (right - left);
        context.beginPath();
        context.moveTo(x, top);
        context.lineTo(x, bottom);
        context.stroke();
      });
    }
    context.fillStyle = "#7f8d85";
    context.font = "8px 'Cascadia Mono', monospace";
    context.fillText(format(minimum, 4), left, rect.height - 3);
    context.textAlign = "right";
    context.fillText(format(maximum, 4), right, rect.height - 3);
    context.textAlign = "left";
  }

  function render(snapshot, calculated = null) {
    const experiment = bridge.currentExperiment();
    const derived = snapshot?.derived;
    const optical = derived?.diagnostics?.rayTrace;
    const electrical = derived?.diagnostics?.circuit;
    const uncertainty = calculated?.uncertainty || derived?.uncertainty || snapshot?.uncertainty;
    const engineVersion = snapshot?.engineVersion || simulation.version;
    $("#simulation-engine-version").textContent = engineVersion;
    $("#simulation-generator-model").textContent = experiment.sim || "实验模型";

    if (optical?.active) {
      const angleText = optical.refractedAngleDeg != null
        ? ` · Snell 折射角 ${format(optical.refractedAngleDeg, 3)}°`
        : optical.diffractionAngleDeg != null
          ? ` · 衍射角 ${format(optical.diffractionAngleDeg, 3)}°`
          : "";
      $("#simulation-optical-model").textContent = optical.model;
      $("#simulation-optical-value").textContent =
        `${optical.rayCount} 条光线 · 发散角 ${format(optical.divergenceDeg, 4)}°${angleText}`;
      $("#simulation-spot-rms").textContent = `${format(optical.spotRmsUm, 3)} μm`;
      $("#simulation-diffraction-limit").textContent = `${format(optical.diffractionLimitUm, 3)} μm`;
      $("#simulation-opd").textContent = optical.opdUm == null ? "不适用" : `${format(optical.opdUm, 4)} μm`;
      $("#simulation-visibility").textContent = optical.fringeVisibility == null
        ? "不适用"
        : `${format(optical.fringeVisibility * 100, 2)}%`;
      $("#simulation-optical-warning").textContent = optical.warnings?.join("；") || "光斑位于当前教学光路有效口径内。";
    } else {
      $("#simulation-optical-model").textContent = "未启用";
      $("#simulation-optical-value").textContent = "当前实验使用电学或统计模型";
      ["#simulation-spot-rms", "#simulation-diffraction-limit", "#simulation-opd", "#simulation-visibility"]
        .forEach((selector) => { $(selector).textContent = "—"; });
      $("#simulation-optical-warning").textContent = optical?.reason || "";
    }

    if (electrical?.active) {
      $("#simulation-electrical-model").textContent = electrical.model;
      $("#simulation-electrical-value").textContent = electrical.model;
      const readings = Object.entries(electrical.readings || {}).slice(0, 8);
      $("#simulation-electrical-readings").innerHTML = readings.map(([key, value]) => `
        <div class="simulation-reading">
          <span>${labels[key] || key}</span>
          <strong>${format(value, 5)} ${readingUnit(key, value, electrical)}</strong>
        </div>
      `).join("");
      $("#simulation-electrical-warning").textContent = electrical.warnings?.join("；") || "当前工作点位于教学线性模型有效范围内。";
    } else {
      $("#simulation-electrical-model").textContent = "未启用";
      $("#simulation-electrical-value").textContent = "当前实验使用光学或统计模型";
      $("#simulation-electrical-readings").innerHTML = "";
      $("#simulation-electrical-warning").textContent = electrical?.reason || "";
    }

    if (uncertainty?.available) {
      $("#simulation-uncertainty-method").textContent = `${uncertainty.trials} 次传播`;
      $("#simulation-uncertainty-value").textContent =
        `理论值 ${format(uncertainty.nominalValue, 5)} ± ${format(uncertainty.expanded, 5)} ${uncertainty.unit}`;
      $("#simulation-standard-u").textContent = `${format(uncertainty.standard, 5)} ${uncertainty.unit}`;
      $("#simulation-expanded-u").textContent = `${format(uncertainty.expanded, 5)} ${uncertainty.unit}`;
      $("#simulation-relative-u").textContent = uncertainty.relativePercent == null
        ? "—"
        : `${format(uncertainty.relativePercent, 3)}%`;
      $("#simulation-uncertainty-trials").textContent = String(uncertainty.trials);
      drawUncertaintyDistribution(uncertainty);
    } else {
      $("#simulation-uncertainty-method").textContent = "不可用";
      $("#simulation-uncertainty-value").textContent = uncertainty?.reason || "当前实验没有连续数值输出";
      ["#simulation-standard-u", "#simulation-expanded-u", "#simulation-relative-u", "#simulation-uncertainty-trials"]
        .forEach((selector) => { $(selector).textContent = "—"; });
      drawUncertaintyDistribution(null);
    }
  }

  function refresh(force = false) {
    const experiment = bridge.currentExperiment();
    const primary = number("#primary-control");
    const secondary = number("#secondary-control");
    const signature = `${experiment.id}|${primary}|${secondary}|${window.OptilabPhysics?.version}`;
    if (!force && signature === lastSignature) return;
    lastSignature = signature;
    window.clearTimeout(refreshTimer);
    refreshTimer = window.setTimeout(() => {
      const snapshot = window.OptilabPhysics.snapshot(experiment, primary, secondary, {
        primaryLabel: $("#primary-label")?.textContent || "",
        primaryUnit: "",
        secondaryLabel: $("#secondary-label")?.textContent || "",
        secondaryUnit: "",
        sourceName: "simulation-diagnostics"
      });
      const calculated = window.OptilabPhysics.calculate(experiment, primary, secondary);
      render(snapshot, calculated);
    }, 80);
  }

  function generateData() {
    const experiment = bridge.currentExperiment();
    const info = bridge.simInfo(experiment);
    const seed = `${experiment.id}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
    const dataset = simulation.generateDataset(experiment, {
      primary: number("#primary-control"),
      secondary: number("#secondary-control"),
      count: number("#simulation-sample-count", 42),
      noisePercent: number("#simulation-noise", 1.1),
      driftPercent: number("#simulation-drift", 0.35),
      outlierRate: number("#simulation-outliers", 0.5) / 100,
      xHeader: info.xLabel,
      yHeader: info.yLabel,
      seed
    });
    $("#simulation-status").textContent =
      `已生成 ${dataset.metadata.count} 个点，注入 ${dataset.metadata.injectedOutliers} 个离群点`;
    $("#batch-name").value = `真实感仿真 ${new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit", hour12: false })}`;
    bridge.loadExternalData(dataset.csv, `真实感仿真 · ${experiment.name}`, dataset.metadata);
    $("#new-report").click();
    bridge.showToast("真实感仿真数据已写入新报告");
  }

  function init() {
    if (!$("#simulation-engine-panel")) return;
    ["#simulation-sample-count", "#simulation-noise", "#simulation-drift", "#simulation-outliers"].forEach((selector) => {
      $(selector)?.addEventListener("input", updateControlOutputs);
    });
    $("#simulation-generate-data")?.addEventListener("click", generateData);
    $("#primary-control")?.addEventListener("input", () => refresh());
    $("#secondary-control")?.addEventListener("input", () => refresh());
    window.addEventListener("optilab:experiment-changed", () => refresh(true));
    window.addEventListener("optilab:parameters-changed", () => refresh());
    window.addEventListener("resize", () => refresh(true));
    updateControlOutputs();
    refresh(true);
    window.setInterval(() => refresh(), 1200);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }

  window.OptilabSimulationUI = { refresh, generateData };
})();
