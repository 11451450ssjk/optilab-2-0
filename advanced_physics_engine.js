"use strict";

(function () {
  const simulation = window.OptilabSimulation;
  const physics = window.OptilabPhysics;
  if (!simulation || !physics) return;

  const VERSION = "2026.11-pro-7";
  const STORAGE_KEY = "optilab_instrument_calibrations_v1";
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const hashSeed = (value) => {
    let hash = 2166136261;
    for (const character of String(value || "")) {
      hash ^= character.charCodeAt(0);
      hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
  };
  const randomGenerator = (seed) => {
    let value = hashSeed(seed);
    return () => {
      value += 0x6D2B79F5;
      let result = value;
      result = Math.imul(result ^ (result >>> 15), result | 1);
      result ^= result + Math.imul(result ^ (result >>> 7), result | 61);
      return ((result ^ (result >>> 14)) >>> 0) / 4294967296;
    };
  };

  const DEFAULT_CALIBRATIONS = {
    laser: {
      model: "He-Ne / 半导体教学激光器",
      serial: "LASER-DEMO",
      calibratedAt: "2026-01-01",
      maxPowerMw: 10,
      wavelengthNm: 632.8,
      linewidthNm: 0.5,
      stabilityPercent: 0.5,
      beamDiameterMm: 1.2,
      divergenceMrad: 1.3
    },
    lens: {
      model: "Ø25.4 mm 双凸透镜",
      serial: "LENS-DEMO",
      calibratedAt: "2026-01-01",
      focalMm: 100,
      apertureMm: 25.4,
      refractiveIndex: 1.5168,
      surfaceErrorNm: 12,
      transmissionPercent: 96
    },
    mirror: {
      model: "高反射介质膜镜",
      serial: "MIRROR-DEMO",
      calibratedAt: "2026-01-01",
      reflectivityPercent: 99.2,
      apertureMm: 25.4,
      surfaceErrorNm: 10,
      tiltResolutionUrad: 20
    },
    iris: {
      model: "可变光阑",
      serial: "IRIS-DEMO",
      calibratedAt: "2026-01-01",
      minApertureMm: 2,
      maxApertureMm: 25,
      currentApertureMm: 12,
      edgeReflectivityPercent: 0.8
    },
    "nd-filter": {
      model: "中性密度滤光片",
      serial: "ND-DEMO",
      calibratedAt: "2026-01-01",
      opticalDensity: 1,
      wavelengthMinNm: 400,
      wavelengthMaxNm: 1100,
      uniformityPercent: 1.5
    },
    detector: {
      model: "硅光电探测器",
      serial: "DET-DEMO",
      calibratedAt: "2026-01-01",
      responsivityAw: 0.48,
      activeAreaMm2: 13,
      saturationCurrentUa: 1000,
      readNoisePa: 2000,
      bandwidthHz: 1000000,
      darkCurrentNa: 2
    },
    camera: {
      model: "科学 CMOS 相机",
      serial: "CAM-DEMO",
      calibratedAt: "2026-01-01",
      fullWellElectrons: 12000,
      readNoiseElectrons: 3,
      pixelSizeUm: 5.86,
      quantumEfficiencyPercent: 72,
      maxGain: 16
    },
    scope: {
      model: "数字示波器",
      serial: "SCOPE-DEMO",
      calibratedAt: "2026-01-01",
      bandwidthHz: 100000000,
      adcBits: 12,
      verticalRangeV: 5,
      inputImpedanceOhm: 1000000,
      probeAttenuation: 10
    },
    "power-supply": {
      model: "可编程直流电源",
      serial: "PSU-DEMO",
      calibratedAt: "2026-01-01",
      maxVoltageV: 30,
      maxCurrentA: 5,
      voltageResolutionMv: 10,
      currentResolutionMa: 1,
      rippleMv: 1
    },
    "fiber-spool": {
      model: "单模光纤盘",
      serial: "FIBER-DEMO",
      calibratedAt: "2026-01-01",
      attenuationDbPerKm: 0.2,
      lengthM: 1000,
      minBendRadiusMm: 30,
      wavelengthNm: 1550
    },
    default: {
      model: "教学实验仪器",
      serial: "GENERAL-DEMO",
      calibratedAt: "2026-01-01",
      powerMaxMw: 10,
      voltageMaxV: 30,
      currentMaxA: 5
    }
  };

  function readCalibrations() {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      return { ...DEFAULT_CALIBRATIONS, ...(stored && typeof stored === "object" ? stored : {}) };
    } catch {
      return { ...DEFAULT_CALIBRATIONS };
    }
  }

  function saveCalibrations(calibrations) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(calibrations));
    window.dispatchEvent(new CustomEvent("optilab:calibration-changed", { detail: calibrations }));
  }

  const Calibration = {
    defaults: DEFAULT_CALIBRATIONS,
    all: readCalibrations,
    get(kind) {
      const calibrations = readCalibrations();
      return { ...(calibrations.default || {}), ...(calibrations[kind] || {}) };
    },
    set(kind, values) {
      const calibrations = readCalibrations();
      calibrations[kind] = { ...(calibrations[kind] || {}), ...values };
      saveCalibrations(calibrations);
      return calibrations[kind];
    },
    reset(kind = "") {
      const calibrations = readCalibrations();
      if (kind) calibrations[kind] = { ...(DEFAULT_CALIBRATIONS[kind] || {}) };
      else Object.keys(DEFAULT_CALIBRATIONS).forEach((key) => {
        calibrations[key] = { ...DEFAULT_CALIBRATIONS[key] };
      });
      saveCalibrations(calibrations);
      return calibrations;
    }
  };

  let computeWorker = null;
  let computeRequestId = 0;
  const workerRequests = new Map();
  function getComputeWorker() {
    if (!computeWorker && typeof Worker !== "undefined") {
      computeWorker = new Worker(new URL("./compute_worker.js", document.baseURI));
      computeWorker.addEventListener("message", (event) => {
        const pending = workerRequests.get(event.data?.id);
        if (!pending) return;
        workerRequests.delete(event.data.id);
        if (event.data.error) pending.reject(new Error(event.data.error));
        else pending.resolve(event.data.result);
      });
      computeWorker.addEventListener("error", (event) => {
        workerRequests.forEach((pending) => pending.reject(new Error(event.message || "后台计算失败")));
        workerRequests.clear();
        computeWorker = null;
      });
    }
    return computeWorker;
  }

  function runWorker(type, payload = {}, transfer = []) {
    const worker = getComputeWorker();
    if (!worker) return Promise.reject(new Error("当前浏览器不支持后台计算"));
    const id = `${Date.now()}-${computeRequestId++}`;
    return new Promise((resolve, reject) => {
      workerRequests.set(id, { resolve, reject });
      worker.postMessage({ id, type, payload }, transfer);
    });
  }

  function fft1d(real, imaginary, inverse = false) {
    const size = real.length;
    for (let index = 1, reverse = 0; index < size; index += 1) {
      let bit = size >> 1;
      for (; reverse & bit; bit >>= 1) reverse ^= bit;
      reverse ^= bit;
      if (index < reverse) {
        [real[index], real[reverse]] = [real[reverse], real[index]];
        [imaginary[index], imaginary[reverse]] = [imaginary[reverse], imaginary[index]];
      }
    }
    for (let length = 2; length <= size; length <<= 1) {
      const angle = (inverse ? 2 : -2) * Math.PI / length;
      const wReal = Math.cos(angle);
      const wImaginary = Math.sin(angle);
      for (let start = 0; start < size; start += length) {
        let currentReal = 1;
        let currentImaginary = 0;
        for (let index = 0; index < length / 2; index += 1) {
          const even = start + index;
          const odd = even + length / 2;
          const oddReal = real[odd] * currentReal - imaginary[odd] * currentImaginary;
          const oddImaginary = real[odd] * currentImaginary + imaginary[odd] * currentReal;
          real[odd] = real[even] - oddReal;
          imaginary[odd] = imaginary[even] - oddImaginary;
          real[even] += oddReal;
          imaginary[even] += oddImaginary;
          const nextReal = currentReal * wReal - currentImaginary * wImaginary;
          currentImaginary = currentReal * wImaginary + currentImaginary * wReal;
          currentReal = nextReal;
        }
      }
    }
    if (inverse) {
      for (let index = 0; index < size; index += 1) {
        real[index] /= size;
        imaginary[index] /= size;
      }
    }
  }

  function fft2d(real, imaginary, size, inverse = false) {
    const rowReal = new Float64Array(size);
    const rowImaginary = new Float64Array(size);
    for (let row = 0; row < size; row += 1) {
      for (let column = 0; column < size; column += 1) {
        rowReal[column] = real[row * size + column];
        rowImaginary[column] = imaginary[row * size + column];
      }
      fft1d(rowReal, rowImaginary, inverse);
      for (let column = 0; column < size; column += 1) {
        real[row * size + column] = rowReal[column];
        imaginary[row * size + column] = rowImaginary[column];
      }
    }
    const columnReal = new Float64Array(size);
    const columnImaginary = new Float64Array(size);
    for (let column = 0; column < size; column += 1) {
      for (let row = 0; row < size; row += 1) {
        columnReal[row] = real[row * size + column];
        columnImaginary[row] = imaginary[row * size + column];
      }
      fft1d(columnReal, columnImaginary, inverse);
      for (let row = 0; row < size; row += 1) {
        real[row * size + column] = columnReal[row];
        imaginary[row * size + column] = columnImaginary[row];
      }
    }
  }

  function angularSpectrum(experiment, primary, secondary, options = {}) {
    const size = clamp(Math.round(options.size || 64), 32, 128);
    const sim = experiment?.sim || "diffraction";
    const wavelengthNm = clamp(Number(options.wavelengthNm) || Number(primary) || 632, 250, 1800);
    const wavelengthMm = wavelengthNm * 1e-6;
    const distanceMm = clamp(Number(options.distanceMm) || Number(secondary) * 20 || 120, 1, 1000);
    const real = new Float64Array(size * size);
    const imaginary = new Float64Array(size * size);
    for (let row = 0; row < size; row += 1) {
      for (let column = 0; column < size; column += 1) {
        const x = (column / (size - 1) - 0.5) * 8;
        const y = (row / (size - 1) - 0.5) * 8;
        let aperture = 1;
        if (sim === "double-slit") aperture = (Math.abs(x - 0.45) < 0.06 || Math.abs(x + 0.45) < 0.06) && Math.abs(y) < 1.5 ? 1 : 0;
        else if (sim === "diffraction") aperture = Math.abs(x) < Math.max(0.15, Number(secondary) / 100) && Math.abs(y) < 1.5 ? 1 : 0;
        else if (sim === "grating") aperture = Math.abs(Math.sin(x * 4.2)) < 0.22 && Math.abs(y) < 1.5 ? 1 : 0;
        else aperture = x * x + y * y < 2.8 ? 1 : 0;
        real[row * size + column] = aperture;
      }
    }
    fft2d(real, imaginary, size, false);
    const cutoff = 1 / wavelengthMm;
    for (let row = 0; row < size; row += 1) {
      const fy = (row < size / 2 ? row : row - size) / size;
      for (let column = 0; column < size; column += 1) {
        const fx = (column < size / 2 ? column : column - size) / size;
        const frequencySquared = fx * fx + fy * fy;
        const zComponent = frequencySquared < cutoff * cutoff
          ? Math.sqrt(cutoff * cutoff - frequencySquared)
          : 0;
        const phase = 2 * Math.PI * distanceMm * zComponent;
        const transferReal = Math.cos(phase);
        const transferImaginary = Math.sin(phase);
        const index = row * size + column;
        const oldReal = real[index];
        const oldImaginary = imaginary[index];
        real[index] = oldReal * transferReal - oldImaginary * transferImaginary;
        imaginary[index] = oldReal * transferImaginary + oldImaginary * transferReal;
      }
    }
    fft2d(real, imaginary, size, true);
    const intensity = new Float32Array(size * size);
    let maximum = 0;
    for (let index = 0; index < intensity.length; index += 1) {
      intensity[index] = real[index] ** 2 + imaginary[index] ** 2;
      maximum = Math.max(maximum, intensity[index]);
    }
    for (let index = 0; index < intensity.length; index += 1) {
      intensity[index] /= Math.max(maximum, 1e-15);
    }
    return {
      engineVersion: VERSION,
      method: "2D angular spectrum / FFT propagation",
      size,
      wavelengthNm,
      distanceMm,
      intensity,
      peak: maximum
    };
  }

  function wavelengthRgb(wavelengthNm) {
    const wavelength = clamp(Number(wavelengthNm) || 550, 380, 780);
    let red = 0;
    let green = 0;
    let blue = 0;
    if (wavelength < 440) {
      red = -(wavelength - 440) / 60;
      blue = 1;
    } else if (wavelength < 490) {
      green = (wavelength - 440) / 50;
      blue = 1;
    } else if (wavelength < 510) {
      green = 1;
      blue = -(wavelength - 510) / 20;
    } else if (wavelength < 580) {
      red = (wavelength - 510) / 70;
      green = 1;
    } else if (wavelength < 645) {
      red = 1;
      green = -(wavelength - 645) / 65;
    } else {
      red = 1;
    }
    const factor = wavelength > 700 ? 0.3 + 0.7 * (780 - wavelength) / 80 :
      wavelength < 420 ? 0.3 + 0.7 * (wavelength - 380) / 40 : 1;
    return [255 * clamp(red * factor, 0, 1), 255 * clamp(green * factor, 0, 1), 255 * clamp(blue * factor, 0, 1)];
  }

  function simulateSpectrum(experiment, primary, secondary, options = {}) {
    const calibration = Calibration.get("laser");
    const center = clamp(Number(primary) || calibration.wavelengthNm || 550, 380, 780);
    const width = clamp(Number(options.bandwidthNm) || calibration.linewidthNm || 12, 0.1, 100);
    const samples = clamp(Math.round(options.samples || 9), 3, 31);
    const size = clamp(Math.round(options.size || 48), 24, 96);
    const image = new Float32Array(size * size * 3);
    const spectral = [];
    for (let index = 0; index < samples; index += 1) {
      const fraction = samples === 1 ? 0.5 : index / (samples - 1);
      const wavelength = center + (fraction - 0.5) * width;
      const wave = angularSpectrum(experiment, wavelength, secondary, {
        size,
        wavelengthNm: wavelength,
        distanceMm: options.distanceMm
      });
      const weight = Math.exp(-((wavelength - center) ** 2) / Math.max(1e-9, 2 * (width / 4) ** 2));
      const color = wavelengthRgb(wavelength);
      spectral.push({ wavelengthNm: wavelength, weight });
      for (let pixel = 0; pixel < size * size; pixel += 1) {
        const intensity = wave.intensity[pixel] * weight;
        image[pixel * 3] += intensity * color[0] / 255;
        image[pixel * 3 + 1] += intensity * color[1] / 255;
        image[pixel * 3 + 2] += intensity * color[2] / 255;
      }
    }
    let maximum = 0;
    for (let index = 0; index < image.length; index += 1) maximum = Math.max(maximum, image[index]);
    if (maximum > 0) {
      for (let index = 0; index < image.length; index += 1) image[index] /= maximum;
    }
    return {
      engineVersion: VERSION,
      method: "angular spectrum + spectral weighted RGB",
      centerWavelengthNm: center,
      bandwidthNm: width,
      samples,
      size,
      rgb: image,
      spectral
    };
  }

  function solveComplex(matrix, vector) {
    const size = vector.length;
    const augmented = matrix.map((row, index) => row.map((value) => ({ ...value })).concat([{ ...vector[index] }]));
    for (let column = 0; column < size; column += 1) {
      let pivot = column;
      for (let row = column + 1; row < size; row += 1) {
        const current = Math.hypot(augmented[row][column].re, augmented[row][column].im);
        const best = Math.hypot(augmented[pivot][column].re, augmented[pivot][column].im);
        if (current > best) pivot = row;
      }
      [augmented[column], augmented[pivot]] = [augmented[pivot], augmented[column]];
      const divisor = augmented[column][column];
      const magnitude = divisor.re ** 2 + divisor.im ** 2 || 1e-30;
      for (let index = column; index <= size; index += 1) {
        const value = augmented[column][index];
        augmented[column][index] = {
          re: (value.re * divisor.re + value.im * divisor.im) / magnitude,
          im: (value.im * divisor.re - value.re * divisor.im) / magnitude
        };
      }
      for (let row = 0; row < size; row += 1) {
        if (row === column) continue;
        const factor = augmented[row][column];
        for (let index = column; index <= size; index += 1) {
          const value = augmented[column][index];
          augmented[row][index].re -= factor.re * value.re - factor.im * value.im;
          augmented[row][index].im -= factor.re * value.im + factor.im * value.re;
        }
      }
    }
    return augmented.map((row) => row[size]);
  }

  function solveReal(matrix, vector) {
    const size = vector.length;
    const augmented = matrix.map((row, index) => [...row, vector[index]]);
    for (let column = 0; column < size; column += 1) {
      let pivot = column;
      for (let row = column + 1; row < size; row += 1) {
        if (Math.abs(augmented[row][column]) > Math.abs(augmented[pivot][column])) pivot = row;
      }
      [augmented[column], augmented[pivot]] = [augmented[pivot], augmented[column]];
      const divisor = augmented[column][column];
      if (Math.abs(divisor) < 1e-15) continue;
      for (let index = column; index <= size; index += 1) augmented[column][index] /= divisor;
      for (let row = 0; row < size; row += 1) {
        if (row === column) continue;
        const factor = augmented[row][column];
        for (let index = column; index <= size; index += 1) {
          augmented[row][index] -= factor * augmented[column][index];
        }
      }
    }
    return augmented.map((row) => ({ re: row[size], im: 0 }));
  }

  function solveSpiceNetlist(netlist, options = {}) {
    const frequency = Math.max(0, Number(options.frequencyHz) || 0);
    const lines = String(netlist || "")
      .split(/\r?\n/)
      .map((line) => line.replace(/[#*].*$/, "").trim())
      .filter(Boolean);
    const nodeNames = new Set();
    const elements = lines.map((line) => {
      const [name, first, second, valueText] = line.split(/\s+/);
      if (!name || !first || !second || valueText == null) return null;
      if (first !== "0") nodeNames.add(first);
      if (second !== "0") nodeNames.add(second);
      return { name, first, second, value: Number(valueText) || 0, type: name[0].toUpperCase() };
    }).filter(Boolean);
    const nodes = [...nodeNames];
    const nodeIndex = new Map(nodes.map((name, index) => [name, index]));
    const voltageSources = elements.filter((element) => element.type === "V");
    const size = nodes.length + voltageSources.length;
    const matrix = Array.from({ length: size }, () => Array.from({ length: size }, () => ({ re: 0, im: 0 })));
    const vector = Array.from({ length: size }, () => ({ re: 0, im: 0 }));
    const node = (name) => name === "0" ? -1 : nodeIndex.get(name);
    const add = (row, column, value) => {
      if (row < 0 || column < 0) return;
      matrix[row][column].re += value.re || 0;
      matrix[row][column].im += value.im || 0;
    };
    elements.forEach((element) => {
      if (!["R", "C", "L"].includes(element.type)) return;
      const a = node(element.first);
      const b = node(element.second);
      let admittance;
      if (element.type === "R") admittance = { re: 1 / Math.max(1e-12, element.value), im: 0 };
      if (element.type === "C") admittance = { re: 0, im: 2 * Math.PI * frequency * element.value };
      if (element.type === "L") admittance = { re: 0, im: -1 / Math.max(1e-12, 2 * Math.PI * frequency * element.value) };
      add(a, a, admittance);
      add(b, b, admittance);
      add(a, b, { re: -admittance.re, im: -admittance.im });
      add(b, a, { re: -admittance.re, im: -admittance.im });
    });
    voltageSources.forEach((source, sourceIndex) => {
      const a = node(source.first);
      const b = node(source.second);
      const branch = nodes.length + sourceIndex;
      add(a, branch, { re: 1, im: 0 });
      add(b, branch, { re: -1, im: 0 });
      add(branch, a, { re: 1, im: 0 });
      add(branch, b, { re: -1, im: 0 });
      vector[branch].re = source.value;
    });
    const solution = frequency === 0
      ? solveReal(matrix.map((row) => row.map((value) => value.re)), vector.map((value) => value.re))
      : solveComplex(matrix, vector);
    const nodeVoltages = Object.fromEntries(nodes.map((name, index) => [name, solution[index]]));
    const sourceCurrents = Object.fromEntries(voltageSources.map((source, index) => [source.name, solution[nodes.length + index]]));
    const residuals = matrix.map((row, rowIndex) =>
      row.reduce((sum, value, columnIndex) => sum + value.re * solution[columnIndex].re - value.im * solution[columnIndex].im, 0) - vector[rowIndex].re
    );
    return {
      engineVersion: VERSION,
      solver: "Modified Nodal Analysis SPICE",
      frequencyHz: frequency,
      nodes: nodeVoltages,
      sourceCurrents,
      maximumResidual: Math.max(...residuals.map(Math.abs), 0),
      elements: elements.length
    };
  }

  function assessDeviceHealth(device, context = {}) {
    const kind = context.kind || "";
    const calibration = Calibration.get(kind);
    const alerts = [];
    let state = "ok";
    const add = (level, message, recommendation = "") => {
      alerts.push({ level, message, recommendation });
      if (level === "danger") state = "danger";
      else if (level === "warning" && state !== "danger") state = "warning";
    };
    const power = Number(context.powerMw) || 0;
    const wavelength = Number(context.wavelengthNm) || 0;
    const currentUa = Number(context.currentUa) || 0;
    if (kind === "laser" && power > Number(calibration.maxPowerMw) * 1.05) {
      add("danger", `输出功率 ${power.toFixed(2)} mW 超过校准上限 ${calibration.maxPowerMw} mW`, "降低驱动电流并检查功率计量程");
    }
    if (kind === "detector" && currentUa > Number(calibration.saturationCurrentUa)) {
      add("danger", `探测器电流 ${currentUa.toFixed(2)} μA 已超过饱和上限`, "加入衰减片并检查探测器是否过热");
    }
    if (kind === "nd-filter" && wavelength &&
      (wavelength < calibration.wavelengthMinNm || wavelength > calibration.wavelengthMaxNm)) {
      add("warning", "当前波长超出衰减片标定波段", "更换适配波段的衰减片");
    }
    if (kind === "fiber-spool" && Number(context.bendRadiusMm) < calibration.minBendRadiusMm) {
      add("danger", "光纤弯曲半径低于最小安全值", "立即放松光纤，避免断裂和附加损耗");
    }
    if (kind === "scope" && Number(context.voltageV) > calibration.verticalRangeV) {
      add("danger", "输入电压超出示波器当前垂直范围", "使用 10× 探头或更高量程");
    }
    if (kind === "power-supply" && Number(context.currentA) > calibration.maxCurrentA) {
      add("danger", "负载电流超过电源额定输出", "启用限流并检查短路");
    }
    return {
      state,
      alerts,
      calibration: { ...calibration },
      checkedAt: new Date().toISOString()
    };
  }

  const originalCalculate = physics.calculate;
  const originalSnapshot = physics.snapshot;
  const enhancedCalculate = function (experiment, primary, secondary) {
    const result = originalCalculate(experiment, primary, secondary);
    const deviceKind = experiment?.sim === "laser" ? "laser" :
      experiment?.sim === "photoelectric" ? "detector" :
        experiment?.sim === "circuit" ? "power-supply" : "";
    const health = deviceKind
      ? assessDeviceHealth({}, {
        kind: deviceKind,
        powerMw: Number(primary) / 100,
        wavelengthNm: /nm/i.test(experiment?.primaryUnit || "") ? primary : 0,
        currentUa: result?.diagnostics?.detector?.photocurrentUa,
        voltageV: /v/i.test(experiment?.primaryUnit || "") ? primary : 0
      })
      : { state: "ok", alerts: [] };
    let spice = null;
    if (["circuit", "oscilloscope", "rc", "frequency", "amplifier"].includes(experiment?.sim)) {
      const voltage = Math.max(0.1, Number(primary) || 5);
      const resistance = Math.max(1, Number(secondary) || 1000);
      const netlist = [
        `V1 in 0 ${voltage}`,
        `R1 in n2 ${resistance}`,
        `R2 n2 0 ${resistance * 1.5}`,
        `R3 n2 n3 ${resistance * 0.68}`,
        `R4 n3 0 ${resistance * 2.2}`
      ].join("\n");
      spice = solveSpiceNetlist(netlist, { frequencyHz: 0 });
    }
    return {
      ...result,
      engineVersion: VERSION,
      diagnostics: { ...(result.diagnostics || {}), health, spice },
      note: [
        result.note,
        health.alerts.map((alert) => alert.message).join("；"),
        spice ? `SPICE 节点 ${Object.keys(spice.nodes).join("/")}，最大残差 ${spice.maximumResidual.toExponential(2)}` : ""
      ].filter(Boolean).join("；")
    };
  };

  physics.calculate = enhancedCalculate;
  physics.snapshot = function (experiment, primary, secondary, context = {}) {
    const snapshot = originalSnapshot(experiment, primary, secondary, context);
    const enhanced = enhancedCalculate(experiment, primary, secondary);
    return {
      ...snapshot,
      engineVersion: VERSION,
      derived: enhanced,
      diagnostics: enhanced.diagnostics,
      health: enhanced.diagnostics.health,
      professional: {
        calibration: context.calibration || {},
        angularSpectrum: true,
        multispectral: true,
        spice: true
      }
    };
  };
  physics.version = VERSION;

  Object.assign(simulation, {
    version: VERSION,
    Calibration,
    angularSpectrum,
    simulateSpectrum,
    solveSpiceNetlist,
    assessDeviceHealth,
    wavelengthRgb
  });
  window.OptilabCalibration = Calibration;
  window.OptilabProfessionalPhysics = {
    version: VERSION,
    angularSpectrum,
    simulateSpectrum,
    solveSpiceNetlist,
    assessDeviceHealth,
    wavelengthRgb
  };
  window.OptilabComputeWorker = {
    uncertainty: (experiment, primary, secondary, options = {}) =>
      runWorker("uncertainty", { experiment, primary, secondary, options }),
    parseTable: (text) => runWorker("parseTable", { text }),
    parseSpreadsheet: (buffer, fileName = "") =>
      runWorker("parseSpreadsheet", { buffer, fileName }),
    zip: (files, fileName = "optilab.zip") => runWorker("zip", { files, fileName }),
    statistics: (values) => runWorker("statistics", { values })
  };
})();
