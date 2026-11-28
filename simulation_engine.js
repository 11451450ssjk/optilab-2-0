"use strict";

(function () {
  const base = window.OptilabPhysics;
  if (!base) return;

  const ENGINE_VERSION = "2026.11-sim-4";
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const opticalSims = new Set([
    "double-slit", "diffraction", "grating", "optics", "polarization", "michelson",
    "newton", "photoelectric", "laser", "fiber", "imaging", "holography", "integrated", "spectrometer"
  ]);
  const electricalSims = new Set([
    "circuit", "oscilloscope", "rc", "frequency", "oscillator", "amplifier",
    "semiconductor", "measurement", "digital", "fpga", "embedded", "communication"
  ]);
  const calculationCache = new Map();

  function hashSeed(seed) {
    const text = String(seed || "optilab");
    let hash = 2166136261;
    for (let index = 0; index < text.length; index += 1) {
      hash ^= text.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
  }

  function randomGenerator(seed) {
    let value = hashSeed(seed);
    return () => {
      value += 0x6D2B79F5;
      let result = value;
      result = Math.imul(result ^ (result >>> 15), result | 1);
      result ^= result + Math.imul(result ^ (result >>> 7), result | 61);
      return ((result ^ (result >>> 14)) >>> 0) / 4294967296;
    };
  }

  function gaussian(random) {
    const first = Math.max(1e-12, random());
    const second = Math.max(1e-12, random());
    return Math.sqrt(-2 * Math.log(first)) * Math.cos(2 * Math.PI * second);
  }

  function isElectricalExperiment(experiment) {
    const text = `${experiment?.id || ""} ${experiment?.name || ""}`;
    return electricalSims.has(experiment?.sim) || /电桥|基尔霍夫|示波|RC|运放|滤波|谐振|节点|网孔/i.test(text);
  }

  function isOpticalExperiment(experiment) {
    const text = `${experiment?.id || ""} ${experiment?.name || ""}`;
    return opticalSims.has(experiment?.sim) || /干涉|衍射|偏振|光路|透镜|激光|光纤|光谱|成像|全息/i.test(text);
  }

  function solveLinear(matrix, vector) {
    const size = vector.length;
    const augmented = matrix.map((row, index) => [...row, vector[index]]);
    for (let column = 0; column < size; column += 1) {
      let pivot = column;
      for (let row = column + 1; row < size; row += 1) {
        if (Math.abs(augmented[row][column]) > Math.abs(augmented[pivot][column])) pivot = row;
      }
      if (Math.abs(augmented[pivot][column]) < 1e-14) return Array(size).fill(0);
      [augmented[column], augmented[pivot]] = [augmented[pivot], augmented[column]];
      const divisor = augmented[column][column];
      for (let index = column; index <= size; index += 1) augmented[column][index] /= divisor;
      for (let row = 0; row < size; row += 1) {
        if (row === column) continue;
        const factor = augmented[row][column];
        for (let index = column; index <= size; index += 1) {
          augmented[row][index] -= factor * augmented[column][index];
        }
      }
    }
    return augmented.map((row) => row[size]);
  }

  function circuitDiagnostics(experiment, primaryValue, secondaryValue) {
    const primary = Number(primaryValue) || 0;
    const secondary = Math.max(1e-6, Number(secondaryValue) || 1);
    const text = `${experiment?.id || ""} ${experiment?.name || ""}`;
    const readings = {};
    const warnings = [];
    let model = "通用电学求解";
    if (/电桥|bridge/i.test(text)) {
      model = "惠斯通电桥";
      const supply = clamp(primary || 5, 0.1, 30);
      const resistance = secondary;
      const change = resistance * 0.002;
      const output = supply * change / (4 * resistance + 2 * change);
      const sensitivity = supply / (4 * resistance);
      readings.bridgeVoltageMv = output * 1000;
      readings.bridgeSensitivityMvPerOhm = sensitivity * 1000;
      readings.relativeResistanceChange = change / resistance;
      if (Math.abs(output) < 1e-5) warnings.push("桥路接近完全平衡，微小电压差可能落入万用表分辨率和漂移范围。");
    } else if (/示波|oscilloscope/i.test(text) || experiment?.sim === "oscilloscope") {
      model = "示波器周期信号";
      const frequency = Math.max(0.001, primary) * 1000;
      const amplitude = Math.max(0.001, secondary);
      readings.frequencyHz = frequency;
      readings.periodMs = 1000 / frequency;
      readings.amplitudeVpp = amplitude * 2;
      readings.rmsV = amplitude / Math.sqrt(2);
      readings.timebaseUsPerDivision = 1000 / frequency / 4;
      readings.verticalNoiseMv = 0.08 + amplitude * 1.5;
      if (frequency * 5 > 100e6) warnings.push("信号主要谐波可能超过 100 MHz 示波器带宽，读数会因带宽限制而衰减。");
    } else if (experiment?.sim === "rc") {
      model = "一阶 RC 网络";
      const resistanceK = Math.max(0.001, primary);
      const capacitanceUf = Math.max(0.001, secondary);
      const tauMs = resistanceK * capacitanceUf;
      readings.tauMs = tauMs;
      readings.riseTo63Ms = tauMs;
      readings.settled99Ms = tauMs * 4.605;
      readings.cutoffHz = 1000 / (2 * Math.PI * tauMs);
    } else if (experiment?.sim === "frequency" || /滤波|frequency|谐振/i.test(text)) {
      model = "线性网络频率响应";
      const cutoffKhz = Math.max(0.001, primary);
      const order = clamp(Math.round(secondary) || 1, 1, 8);
      readings.cutoffHz = cutoffKhz * 1000;
      readings.gainAtCutoff = Math.SQRT1_2 ** order;
      readings.gainAtCutoffDb = 20 * Math.log10(readings.gainAtCutoff);
      readings.phaseAtCutoffDeg = -45 * order;
      readings.rolloffDbPerOctave = -6.0206 * order;
      readings.outputNoiseUv = 45 + cutoffKhz * 1.8;
    } else if (experiment?.sim === "amplifier" || /运放|放大/i.test(text)) {
      model = "负反馈放大器";
      const inputMv = Math.max(0.001, primary);
      const beta = clamp(secondary, 0.001, 1);
      const closedLoopGain = 1 / beta;
      readings.closedLoopGain = closedLoopGain;
      readings.outputMv = inputMv * closedLoopGain;
      readings.feedbackFactor = beta;
      if (readings.outputMv > 10000) warnings.push("按当前参数估算输出已接近常见运放电源轨，线性小信号假设可能失效。");
    } else if (experiment?.sim === "oscillator") {
      model = "RC 振荡器";
      const resistanceK = Math.max(0.001, primary);
      const capacitanceNf = Math.max(0.001, secondary);
      const frequency = 1 / (2 * Math.PI * resistanceK * 1000 * capacitanceNf * 1e-9);
      readings.oscillationFrequencyHz = frequency;
      readings.periodMs = 1000 / frequency;
      readings.loopGainThreshold = 1;
    } else if (experiment?.sim === "semiconductor") {
      model = "PN 结小信号模型";
      const voltage = clamp(primary, 0, 1.2);
      const temperature = clamp(secondary, 250, 400);
      const thermalVoltage = 8.617333e-5 * temperature;
      const saturation = 1e-12;
      const current = saturation * (Math.exp(voltage / thermalVoltage) - 1);
      readings.junctionCurrentMa = current * 1000;
      readings.thermalVoltageMv = thermalVoltage * 1000;
      readings.dynamicResistanceOhm = voltage > 0.05 ? thermalVoltage / Math.max(current, 1e-15) : Infinity;
    } else {
      model = "三节点电阻网络";
      const sourceVoltage = clamp(primary || 5, 0.1, 30);
      const r1 = secondary;
      const r2 = secondary * 1.5;
      const r3 = secondary * 0.68;
      const r4 = secondary * 2.2;
      const g1 = 1 / r1;
      const g2 = 1 / r2;
      const g3 = 1 / r3;
      const g4 = 1 / r4;
      const [v2, v3] = solveLinear([
        [g1 + g2 + g3, -g3],
        [-g3, g3 + g4]
      ], [g1 * sourceVoltage, 0]);
      const i1 = (sourceVoltage - v2) / r1;
      const i2 = v2 / r2;
      const i3 = (v2 - v3) / r3;
      const kclResidual = i1 - i2 - i3;
      readings.sourceVoltage = sourceVoltage;
      readings.node2Voltage = v2;
      readings.node3Voltage = v3;
      readings.branchCurrent1Ma = i1 * 1000;
      readings.branchCurrent2Ma = i2 * 1000;
      readings.branchCurrent3Ma = i3 * 1000;
      readings.kclResidualUa = kclResidual * 1e6;
      if (Math.abs(kclResidual * 1e6) > 0.01) warnings.push("节点求解残差偏大，请检查矩阵和参考节点。");
    }
    return {
      active: true,
      engineVersion: ENGINE_VERSION,
      model,
      nodeCount: model.includes("三节点") ? 3 : null,
      readings,
      warnings
    };
  }

  function rayTrace(experiment, primaryValue, secondaryValue, options = {}) {
    if (!isOpticalExperiment(experiment)) {
      return { active: false, reason: "当前实验没有可用的自由空间光线模型。" };
    }
    const random = randomGenerator(options.seed || `${experiment.id || experiment.name}-ray`);
    const wavelengthNm = clamp(Number(primaryValue) || 632, 250, 2000);
    const wavelengthMm = wavelengthNm * 1e-6;
    const secondary = Math.max(0.0001, Number(secondaryValue) || 1);
    const sim = experiment?.sim || "";
    const rayCount = clamp(Math.round(options.rayCount || 128), 32, 512);
    const initialRadiusMm = clamp(
      /mm/i.test(experiment?.secondaryUnit || "") ? secondary * 0.5 : 0.65,
      0.05,
      12
    );
    const focalMm = /cm/i.test(experiment?.secondaryUnit || "") ? secondary * 10 : 100;
    const divergenceRad = /laser/i.test(sim)
      ? wavelengthMm / (Math.PI * Math.max(0.001, initialRadiusMm))
      : 0.00035;
    const decenteringMm = Math.max(0, Number(options.decenteringMm) || 0.025);
    const tiltRad = Math.max(0, Number(options.tiltRad) || 0.00035);
    const mirrorErrorNm = Math.max(0, Number(options.mirrorErrorNm) || 18);
    const outputHeights = [];
    const path = [];
    const propagate = (ray, distance) => ({
      y: ray.y + distance * ray.theta,
      theta: ray.theta
    });
    const lens = (ray, focal) => ({
      y: ray.y,
      theta: ray.theta - ray.y / focal
    });
    const elementError = (ray) => ({
      y: ray.y + gaussian(random) * decenteringMm,
      theta: ray.theta + gaussian(random) * tiltRad
    });
    if (sim === "double-slit") {
      path.push("点光源", "双缝", "屏幕");
      for (let index = 0; index < rayCount; index += 1) {
        let ray = { y: gaussian(random) * initialRadiusMm * 0.3, theta: gaussian(random) * divergenceRad };
        ray = elementError(propagate(ray, 120));
        ray = propagate(ray, 1000);
        outputHeights.push(ray.y);
      }
    } else if (sim === "michelson") {
      path.push("激光器", "扩束镜", "光阑", "分束镜", "参考臂", "测量臂", "补偿板", "合束", "透镜", "屏幕");
      for (let index = 0; index < rayCount; index += 1) {
        let ray = { y: gaussian(random) * initialRadiusMm * 0.25, theta: gaussian(random) * divergenceRad };
        ray = elementError(lens(propagate(ray, 180), 150));
        ray = elementError(propagate(ray, 80));
        ray = elementError(propagate(ray, 120));
        ray.theta += 2 * (gaussian(random) * tiltRad + mirrorErrorNm * 1e-9);
        ray = propagate(ray, 520);
        ray.theta += 2 * (gaussian(random) * tiltRad + mirrorErrorNm * 1e-9);
        ray = propagate(ray, 520);
        ray = elementError(lens(propagate(ray, 270), focalMm));
        ray = propagate(ray, focalMm);
        outputHeights.push(ray.y);
      }
    } else {
      path.push("光源", "光学元件", /imaging|laser|fiber/i.test(sim) ? "探测面" : "透镜", "观察面");
      for (let index = 0; index < rayCount; index += 1) {
        let ray = { y: gaussian(random) * initialRadiusMm * 0.38, theta: gaussian(random) * divergenceRad };
        ray = elementError(propagate(ray, 220));
        ray = elementError(lens(ray, focalMm));
        ray = propagate(ray, focalMm * 0.82);
        outputHeights.push(ray.y);
      }
    }
    const rms = Math.sqrt(outputHeights.reduce((total, value) => total + value ** 2, 0) / outputHeights.length);
    const maximum = Math.max(...outputHeights.map(Math.abs));
    const apertureMm = 25.4;
    const airyRadiusMm = 1.22 * wavelengthMm * focalMm / apertureMm;
    const divergenceDeg = Math.atan2(maximum, focalMm) * 180 / Math.PI;
    const incidenceDeg = 45;
    const refractiveIndex = 1.5168 + 3250 / (wavelengthNm * wavelengthNm);
    const refractedAngleDeg = Math.asin(
      clamp(Math.sin(incidenceDeg * Math.PI / 180) / refractiveIndex, -1, 1)
    ) * 180 / Math.PI;
    const prismDeviationDeg = Math.abs(incidenceDeg + refractedAngleDeg - 60);
    const diffractionAngleDeg = ["double-slit", "grating"].includes(sim)
      ? Math.asin(clamp(wavelengthMm / Math.max(0.0001, secondary * (/grating/i.test(sim) ? 0.001 : 1)), -1, 1)) * 180 / Math.PI
      : null;
    const opdUm = sim === "michelson" ? Math.abs(2 * secondary) : null;
    const coherenceLengthUm = wavelengthNm ** 2 / (Math.max(0.001, Number(options.bandwidthNm) || 0.5) * 1000);
    const fringeVisibility = opdUm != null
      ? clamp(Math.exp(-opdUm / Math.max(1e-9, coherenceLengthUm)) * (1 - clamp(maximum / apertureMm, 0, 0.8)), 0, 1)
      : null;
    const warnings = [];
    if (maximum > apertureMm * 0.9) warnings.push("仿真光斑接近或超过 25.4 mm 通光孔径，实际实验会出现明显截光。");
    if (fringeVisibility != null && fringeVisibility < 0.25) warnings.push("当前条纹可见度较低，应检查光程匹配、准直和振动。");
    return {
      active: true,
      engineVersion: ENGINE_VERSION,
      model: sim === "michelson" ? "近轴矩阵 + 蒙特卡洛 Michelson 光线追迹" : "近轴矩阵 + 蒙特卡洛光线追迹",
      rayCount,
      path,
      wavelengthNm,
      spotRmsUm: rms * 1000,
      spotRadiusUm: maximum * 1000,
      divergenceDeg,
      incidenceAngleDeg: /spectrometer|分光计|棱镜/i.test(`${sim} ${experiment?.name || ""}`) ? incidenceDeg : null,
      refractiveIndex: /spectrometer|分光计|棱镜/i.test(`${sim} ${experiment?.name || ""}`) ? refractiveIndex : null,
      refractedAngleDeg: /spectrometer|分光计|棱镜/i.test(`${sim} ${experiment?.name || ""}`) ? refractedAngleDeg : null,
      prismDeviationDeg: /spectrometer|分光计|棱镜/i.test(`${sim} ${experiment?.name || ""}`) ? prismDeviationDeg : null,
      diffractionAngleDeg,
      diffractionLimitUm: airyRadiusMm * 1000,
      decenteringUm: decenteringMm * 1000,
      tiltUrad: tiltRad * 1e6,
      mirrorErrorNm,
      opdUm,
      fringeVisibility,
      coherenceLengthUm,
      warnings
    };
  }

  function percentile(sorted, fraction) {
    if (!sorted.length) return null;
    const index = clamp((sorted.length - 1) * fraction, 0, sorted.length - 1);
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    return sorted[lower] + (sorted[upper] - sorted[lower]) * (index - lower);
  }

  function propagateUncertainty(experiment, primaryValue, secondaryValue, options = {}) {
    const primary = Number(primaryValue) || 0;
    const secondary = Number(secondaryValue) || 0;
    const trials = clamp(Math.round(options.trials || 320), 64, 1600);
    const primaryResolution = Math.max(
      Math.abs(Number(experiment?.primaryStep) || 0) / Math.sqrt(12),
      Math.abs(primary) * 0.0025
    );
    const secondaryResolution = Math.max(
      Math.abs(Number(experiment?.secondaryStep) || 0) / Math.sqrt(12),
      Math.abs(secondary) * 0.0025
    );
    const calibrationPrimary = Math.abs(primary) * 0.0015;
    const calibrationSecondary = Math.abs(secondary) * 0.0015;
    const environmentPrimary = Math.abs(primary) * 0.0008;
    const environmentSecondary = Math.abs(secondary) * 0.001;
    const primaryStd = Math.sqrt(primaryResolution ** 2 + calibrationPrimary ** 2 + environmentPrimary ** 2);
    const secondaryStd = Math.sqrt(secondaryResolution ** 2 + calibrationSecondary ** 2 + environmentSecondary ** 2);
    const random = randomGenerator(options.seed || `${experiment?.id || "experiment"}-uncertainty`);
    const values = [];
    for (let index = 0; index < trials; index += 1) {
      const sampledPrimary = primary + gaussian(random) * primaryStd;
      const sampledSecondary = secondary + gaussian(random) * secondaryStd;
      const result = base.calculate(experiment, sampledPrimary, sampledSecondary);
      if (Number.isFinite(result?.rawValue)) values.push(result.rawValue);
    }
    if (!values.length) {
      return {
        available: false,
        engineVersion: ENGINE_VERSION,
        reason: "当前实验的理论关系没有可连续传播的数值输出。"
      };
    }
    values.sort((a, b) => a - b);
    const mean = values.reduce((total, value) => total + value, 0) / values.length;
    const standard = Math.sqrt(values.reduce((total, value) => total + (value - mean) ** 2, 0) / Math.max(1, values.length - 1));
    const expanded = 1.96 * standard;
    const nominal = base.calculate(experiment, primary, secondary);
    const distributionStep = Math.max(1, Math.ceil(values.length / 64));
    return {
      available: true,
      engineVersion: ENGINE_VERSION,
      method: "蒙特卡洛输入分布传播 + GUM 合成分量",
      trials,
      coverage: 0.95,
      coverageFactor: 1.96,
      nominalValue: nominal?.rawValue ?? null,
      unit: nominal?.unit || "",
      mean,
      standard,
      expanded,
      relativePercent: Math.abs(mean) > 1e-15 ? standard / Math.abs(mean) * 100 : null,
      interval95: [percentile(values, 0.025), percentile(values, 0.975)],
      distribution: values.filter((value, index) => index % distributionStep === 0),
      components: [
        { name: "主参数分辨率", type: "B", value: primaryResolution },
        { name: "主参数校准", type: "B", value: calibrationPrimary },
        { name: "次参数分辨率", type: "B", value: secondaryResolution },
        { name: "次参数校准", type: "B", value: calibrationSecondary },
        { name: "环境漂移", type: "B", value: Math.hypot(environmentPrimary, environmentSecondary) }
      ]
    };
  }

  function diagnosticSummary(diagnostics) {
    if (diagnostics.rayTrace?.active) {
      const ray = diagnostics.rayTrace;
      return `${ray.model}；${ray.rayCount} 条光线；RMS 光斑 ${base.formatNumber(ray.spotRmsUm, 3)} μm；发散角 ${base.formatNumber(ray.divergenceDeg, 4)}°${ray.opdUm != null ? `；光程差 ${base.formatNumber(ray.opdUm, 3)} μm；条纹可见度 ${base.formatNumber(ray.fringeVisibility * 100, 1)}%` : ""}`;
    }
    if (diagnostics.circuit?.active) {
      const circuit = diagnostics.circuit;
      return `${circuit.model}；${Object.entries(circuit.readings).slice(0, 4).map(([key, value]) => `${key}=${base.formatNumber(value, 4)}`).join("；")}`;
    }
    return "当前实验使用统计记录模型，没有启用光路或电路求解器。";
  }

  function compactUncertainty(uncertainty) {
    if (!uncertainty) return uncertainty;
    const compact = { ...uncertainty };
    delete compact.distribution;
    return compact;
  }

  function calculate(experiment, primaryValue, secondaryValue) {
    const cacheKey = `${experiment?.id || experiment?.name || "experiment"}|${Number(primaryValue)}|${Number(secondaryValue)}`;
    if (calculationCache.has(cacheKey)) return calculationCache.get(cacheKey);
    const nominal = base.calculate(experiment, primaryValue, secondaryValue);
    const uncertainty = propagateUncertainty(experiment, primaryValue, secondaryValue);
    const diagnostics = {
      rayTrace: rayTrace(experiment, primaryValue, secondaryValue),
      circuit: isElectricalExperiment(experiment)
        ? circuitDiagnostics(experiment, primaryValue, secondaryValue)
        : { active: false, reason: "当前实验没有启用电路求解器。" }
    };
    const uncertaintyText = uncertainty.available
      ? `蒙特卡洛标准不确定度 ${base.formatNumber(uncertainty.standard, 4)} ${uncertainty.unit}，U95 ${base.formatNumber(uncertainty.expanded, 4)} ${uncertainty.unit}`
      : "";
    const enhanced = {
      ...nominal,
      engineVersion: ENGINE_VERSION,
      baseEngineVersion: nominal.engineVersion,
      uncertainty,
      diagnostics,
      diagnosticSummary: diagnosticSummary(diagnostics),
      note: [nominal.note, uncertaintyText, diagnosticSummary(diagnostics)].filter(Boolean).join("；")
    };
    if (calculationCache.size >= 96) calculationCache.delete(calculationCache.keys().next().value);
    calculationCache.set(cacheKey, enhanced);
    return enhanced;
  }

  function snapshot(experiment, primary, secondary, context = {}) {
    const nominal = base.snapshot(experiment, primary, secondary, context);
    const derived = calculate(experiment, primary, secondary);
    const compactDerived = {
      ...derived,
      uncertainty: compactUncertainty(derived.uncertainty)
    };
    return {
      ...nominal,
      engineVersion: ENGINE_VERSION,
      baseEngineVersion: nominal.engineVersion,
      derived: compactDerived,
      uncertainty: compactUncertainty(derived.uncertainty),
      diagnostics: derived.diagnostics,
      provenance: {
        opticalModel: derived.diagnostics.rayTrace?.model || null,
        electricalModel: derived.diagnostics.circuit?.model || null,
        uncertaintyMethod: derived.uncertainty?.method || null,
        inputHash: nominal.inputHash,
        generatedAt: nominal.generatedAt
      }
    };
  }

  function computeScene(experiment, options = {}) {
    const scene = base.computeScene(experiment, options);
    return {
      ...scene,
      engineVersion: ENGINE_VERSION,
      derived: calculate(experiment, options.primary, options.secondary),
      uncertainty: propagateUncertainty(experiment, options.primary, options.secondary)
    };
  }

  function nominalResponse(sim, progress, primary, secondary) {
    if (["measurement", "circuit"].includes(sim)) return 2.5 + progress * 7.2;
    if (sim === "rc") return 5 * (1 - Math.exp(-(progress * 8) / 2.2));
    if (sim === "semiconductor") return Math.max(0, Math.exp((progress * 1.2 - 0.62) * 18) - 0.0001);
    if (["double-slit", "michelson", "newton", "holography"].includes(sim)) {
      return 0.5 + 0.45 * Math.cos(progress * Math.PI * 7 + 0.3) ** 2;
    }
    if (sim === "diffraction") {
      const x = progress * 12 - 6;
      const value = x === 0 ? 1 : Math.sin(x * 1.4) / (x * 1.4);
      return value ** 2 * 1.2;
    }
    if (sim === "grating") {
      return Math.exp(-((progress - 0.5) ** 2) / 0.012) +
        0.35 * Math.exp(-((progress - 0.22) ** 2) / 0.002) +
        0.3 * Math.exp(-((progress - 0.78) ** 2) / 0.002);
    }
    if (sim === "optics") {
      const x = 6 + progress * 34;
      return (x * 10) / Math.max(0.1, x - 10);
    }
    if (sim === "polarization") return Math.cos(progress * Math.PI) ** 2;
    if (["amplifier", "frequency", "oscillator"].includes(sim)) {
      const x = 10 * Math.pow(1000, progress);
      return 20 * Math.exp(-(Math.log10(Math.max(1, x / 100)) ** 2)) + 0.5;
    }
    if (["digital", "fpga", "embedded"].includes(sim)) return (Math.floor(progress * 12) % 2) * 3.3;
    if (["sampling", "fourier", "dsp"].includes(sim)) return Math.abs(Math.sin(progress * 18)) * 4;
    if (sim === "photoelectric") {
      const x = 380 + progress * 320;
      return Math.max(0, (x - 430) * 0.04);
    }
    if (sim === "photodiode") return 2 + progress * 16;
    if (sim === "solar") return Math.max(0, 85 * (1 - Math.exp(-(0.7 - progress * 0.7) * 10)));
    if (sim === "laser") return 18 * Math.sqrt(1 + (progress * 100 / 45) ** 2);
    if (sim === "imaging") return 40 + 100 / (1 + Math.exp(-(progress * 42 - 21) * 0.7));
    if (sim === "fiber") return Math.exp(-(progress * 80) / 28);
    if (sim === "communication") return Math.max(0.00001, 0.5 * Math.exp(-(progress * 30) / 4));
    if (sim === "integrated") return 1.5 + progress * 3 + Math.sin(progress * Math.PI * 4) * 0.4;
    return Math.sin(progress * Math.PI * 5);
  }

  function generateDataset(experiment, options = {}) {
    const sim = experiment?.sim || "measurement";
    const primary = Number(options.primary ?? experiment?.primaryValue) || 632;
    const secondary = Number(options.secondary ?? experiment?.secondaryValue) || 1;
    const count = clamp(Math.round(options.count || 42), 12, 300);
    const noisePercent = clamp(Number(options.noisePercent ?? 1.1), 0, 20);
    const driftPercent = clamp(Number(options.driftPercent ?? 0.35), 0, 20);
    const outlierRate = clamp(Number(options.outlierRate ?? 0.025), 0, 0.2);
    const seed = options.seed || `${experiment?.id || "experiment"}-${Date.now()}`;
    const random = randomGenerator(seed);
    const xHeader = options.xHeader || experiment?.primaryLabel || "横轴";
    const yHeader = options.yHeader || experiment?.secondaryLabel || "纵轴";
    const samples = [];
    const baseValues = [];
    for (let index = 0; index < count; index += 1) {
      const progress = count > 1 ? index / (count - 1) : 0;
      let x;
      if (["measurement", "circuit"].includes(sim)) x = progress * 10;
      else if (sim === "rc") x = progress * 8;
      else if (sim === "semiconductor") x = progress * 1.2;
      else if (["double-slit", "michelson", "newton", "holography"].includes(sim)) x = progress * 4;
      else if (sim === "diffraction") x = progress * 12 - 6;
      else if (sim === "grating") x = progress * 40;
      else if (sim === "optics") x = 6 + progress * 34;
      else if (sim === "polarization") x = progress * 360;
      else if (["amplifier", "frequency", "oscillator"].includes(sim)) x = 10 * Math.pow(1000, progress);
      else if (["digital", "fpga", "embedded"].includes(sim)) x = index;
      else if (["sampling", "fourier", "dsp"].includes(sim)) x = 20 + index * 12;
      else if (sim === "photoelectric") x = 380 + progress * 320;
      else if (sim === "photodiode") x = progress * 12;
      else if (sim === "solar") x = progress * 0.7;
      else if (sim === "laser") x = progress * 100;
      else if (sim === "imaging") x = index;
      else if (sim === "fiber") x = progress * 80;
      else if (sim === "communication") x = progress * 30;
      else if (sim === "integrated") x = progress * 20;
      else x = progress * 20;
      const baseValue = nominalResponse(sim, progress, primary, secondary);
      baseValues.push(baseValue);
      samples.push({ x, baseValue, progress, index });
    }
    const span = Math.max(1e-9, Math.max(...baseValues) - Math.min(...baseValues));
    const quantization = Math.max(1e-12, Number(options.quantization) || span / 1800);
    const rows = [[xHeader, yHeader]];
    let injectedOutliers = 0;
    samples.forEach((sample) => {
      const noise = gaussian(random) * span * noisePercent / 100;
      const drift = (sample.progress - 0.5) * span * driftPercent / 100;
      let value = sample.baseValue + noise + drift;
      if (random() < outlierRate) {
        value += (random() < 0.5 ? -1 : 1) * span * (0.025 + random() * 0.08);
        injectedOutliers += 1;
      }
      value = Math.round(value / quantization) * quantization;
      const xJitter = sample.index === 0 || sample.index === count - 1
        ? 0
        : (random() - 0.5) * Math.abs(samples[Math.min(count - 1, sample.index + 1)].x - sample.x) * 0.035;
      rows.push([(sample.x + xJitter).toFixed(5), value.toFixed(6)]);
    });
    const uncertainty = propagateUncertainty(experiment, primary, secondary, { seed });
    return {
      csv: rows.map((row) => row.join(",")).join("\n"),
      xHeader,
      yHeader,
      units: `真实感仿真；噪声 ${noisePercent}%、漂移 ${driftPercent}%、离群点 ${(outlierRate * 100).toFixed(1)}%；随机种子 ${seed}`,
      metadata: {
        engineVersion: ENGINE_VERSION,
        model: sim,
        count,
        noisePercent,
        driftPercent,
        outlierRate,
        quantization,
        seed,
        injectedOutliers,
        uncertainty: compactUncertainty(uncertainty)
      }
    };
  }

  window.OptilabPhysics = {
    ...base,
    version: ENGINE_VERSION,
    baseVersion: base.version,
    calculate,
    computeScene,
    snapshot,
    rayTrace,
    circuitDiagnostics,
    propagateUncertainty,
    generateDataset
  };
  window.OptilabSimulation = {
    version: ENGINE_VERSION,
    rayTrace,
    circuitDiagnostics,
    propagateUncertainty,
    generateDataset,
    isElectricalExperiment,
    isOpticalExperiment
  };
})();
