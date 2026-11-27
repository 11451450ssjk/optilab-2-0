"use strict";

(function () {
  const ENGINE_VERSION = "2026.11-unified-1";
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  function formatNumber(value, digits = 3) {
    if (!Number.isFinite(value)) return "—";
    if (value === 0) return "0";
    const absolute = Math.abs(value);
    if (absolute >= 10000 || absolute < 0.001) return Number(value).toExponential(3);
    return Number(value).toFixed(digits).replace(/0+$/, "").replace(/\.$/, "");
  }

  function hashString(value) {
    let hash = 2166136261;
    const text = String(value);
    for (let index = 0; index < text.length; index += 1) {
      hash ^= text.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    return (hash >>> 0).toString(16).padStart(8, "0");
  }

  function result(quantity, rawValue, unit, note, assumptions = []) {
    return {
      engineVersion: ENGINE_VERSION,
      quantity,
      rawValue,
      unit,
      value: `${quantity} ≈ ${formatNumber(rawValue)}${unit ? ` ${unit}` : ""}`,
      note,
      assumptions
    };
  }

  function calculate(experiment = {}, primaryValue, secondaryValue) {
    const primary = Number.isFinite(Number(primaryValue)) ? Number(primaryValue) : 0;
    const secondary = Number.isFinite(Number(secondaryValue)) ? Number(secondaryValue) : 0;
    const sim = experiment.sim || "measurement";
    switch (sim) {
      case "double-slit": {
        const spacing = (primary * 1e-3) / Math.max(0.001, secondary);
        return result("相邻明纹间距 Δx", spacing, "mm",
          "按缝到屏距离 L = 1 m 估算，满足小角度近轴条件。",
          ["垂直入射", "L = 1 m", "相邻暗纹间距近似等于明纹间距"]);
      }
      case "diffraction": {
        const angle = Math.asin(clamp((primary / 1000) / secondary, -1, 1)) * 180 / Math.PI;
        return result("一级暗纹角 θ", angle, "°",
          "假设垂直入射并使用 a·sinθ = λ。",
          ["一级极小", "垂直入射", "缝宽由 secondary 提供"]);
      }
      case "grating": {
        const angle = Math.asin(clamp((primary / 1000) / secondary, -1, 1)) * 180 / Math.PI;
        return result("一级衍射角", angle, "°",
          "按 d·sinθ = kλ 计算，当前取一级衍射 k = 1。",
          ["一级衍射", "垂直入射", "光栅常数为 secondary"]);
      }
      case "michelson": {
        const wavelengthUm = primary / 1000;
        const fringes = (2 * secondary) / Math.max(1e-12, wavelengthUm);
        return result("理论条纹数 N", fringes, "",
          "镜面位移改变往返光程，N = 2Δd/λ。",
          ["单色光", "镜面垂直光轴", "空气折射率取 1"]);
      }
      case "polarization": {
        const intensity = Math.cos(secondary * Math.PI / 180) ** 2;
        return result("相对透射强度 I/I₀", intensity, "",
          "按马吕斯定律 I = I₀cos²θ 计算。",
          ["理想线偏振片", "无吸收和多次反射", "两偏振片零位已校准"]);
      }
      case "optics": {
        const imageDistance = (primary * secondary) / Math.max(0.01, primary - secondary);
        return result("像距 v", imageDistance, "cm",
          "由薄透镜关系 1/f = 1/u + 1/v 计算。",
          ["近轴薄透镜", "物距大于焦距", "空气中成像"]);
      }
      case "rc": {
        const tau = primary * secondary / 1000;
        return result("时间常数 τ", tau, "ms",
          "R 以 kΩ、C 以 μF 输入时，RC 数值对应 ms。",
          ["理想电阻和电容", "忽略源内阻与负载", "单时间常数系统"]);
      }
      case "photoelectric": {
        const photonEnergy = 1240 / Math.max(1, primary);
        return result("单光子能量", photonEnergy, "eV",
          "使用 E(eV) ≈ 1240/λ(nm)，用于与材料逸出功比较。",
          ["真空或空气波长近似", "光子模型", "未计入接触电位差"]);
      }
      case "laser": {
        const wavelengthUm = primary / 1000;
        const divergence = (wavelengthUm / (Math.PI * Math.max(0.001, secondary))) * 180 / Math.PI;
        return result("近似发散半角", divergence, "°",
          "按 θ ≈ λ/(πw₀) 估算，实际应由束宽拟合得到。",
          ["基模近似", "远场", "束腰直径为 secondary"]);
      }
      case "fiber": {
        const output = Math.exp(-secondary / 35) * 100;
        return result("相对输出功率", output, "%",
          "使用等效指数衰减模型描述当前损耗趋势。",
          ["忽略连接器模式噪声", "长度以等效衰减长度归一", "单波长近似"]);
      }
      case "solar": {
        const fillFactor = 0.62 + (secondary - 25) * 0.002;
        return result("示范填充因子 FF", fillFactor, "",
          "温度升高通常使开路电压和填充因子下降。",
          ["教学近似模型", "光照均匀", "忽略串联和并联电阻变化"]);
      }
      case "amplifier": {
        const closedLoopGain = 28 / (1 + 28 * secondary);
        return result("闭环增益", closedLoopGain, "",
          "负反馈降低增益并提高稳定性，实际值由开环增益和反馈网络决定。",
          ["线性工作区", "深度负反馈近似", "输出未削顶"]);
      }
      case "frequency": {
        return result("-3 dB 截止频率", primary, "kHz",
          `当前选择 ${Math.round(secondary)} 阶响应，阶数越高带外衰减越快。`,
          ["输入幅值恒定", "负载与测量条件不变", "未计入探头电容"]);
      }
      case "photodiode": {
        const responsivity = 0.45 + secondary / 900;
        return result("响应度", responsivity, "A/W",
          "偏压与波长共同影响真实响应度，当前值用于趋势观察。",
          ["线性探测区", "光斑覆盖有效面", "暗电流已扣除"]);
      }
      case "measurement": {
        const standardError = secondary / Math.sqrt(Math.max(1, primary));
        return result("标准误差", standardError, "",
          "增加重复测量次数可降低随机误差的统计分量。",
          ["样本相互独立", "随机误差占主导", "系统误差未计入"]);
      }
      case "circuit": {
        const current = primary / Math.max(1e-9, secondary) * 1000;
        return result("支路电流 I", current, "mA",
          "按欧姆定律 I = U/R 计算。",
          ["忽略电源内阻", "忽略仪表负载", "电阻处于线性工作区"]);
      }
      case "newton": {
        const radius = (secondary * secondary) / Math.max(1e-9, 4 * Math.max(1, primary) * primary * 1e-6);
        return result("透镜曲率半径 R", radius / 1000, "m",
          "按牛顿环暗环直径关系估算，需使用对应环级次。",
          ["中心接触理想", "单色光", "空气膜折射率取 1"]);
      }
      default:
        return {
          engineVersion: ENGINE_VERSION,
          quantity: experiment.formula || "理论关系",
          rawValue: null,
          unit: "",
          value: experiment.formula || "根据当前参数计算",
          note: "该方向使用实验记录、曲线或图像验证理论关系；统一引擎保留输入、公式和数据来源。",
          assumptions: ["教学演示模型", "以原始记录和仪器条件为准"]
        };
    }
  }

  function computeScene(experiment, options = {}) {
    const primary = Number(options.primary) || 0;
    const secondary = Number(options.secondary) || 0;
    const alignment = clamp(Number(options.alignment) || 0, 0, 1);
    const connectivity = clamp(Number(options.connectivity) || 0, 0, 1);
    const hasOptics = Boolean(options.hasOptics);
    const hasElectronics = Boolean(options.hasElectronics);
    const sourceDrive = clamp(Math.abs(primary) / 20, 0.18, 1);
    const power = hasOptics
      ? clamp((0.8 + sourceDrive * 3.8) * alignment, 0.08, 12)
      : clamp((0.2 + sourceDrive * 5.2) * connectivity, 0.03, 26);
    const frequency = /Hz/i.test(`${experiment.secondaryUnit || ""} ${options.secondaryUnit || ""}`)
      ? clamp(Math.abs(secondary || 1000), 10, 250000)
      : /ms|µs|us|ns/i.test(`${experiment.primaryUnit || ""} ${options.primaryUnit || ""}`) && primary > 0
        ? clamp(1000 / primary, 0.01, 250000)
        : 1000 + Math.abs(secondary || 1) * 47;
    const score = hasOptics && hasElectronics ? Math.min(alignment, connectivity)
      : hasOptics ? alignment : connectivity;
    return {
      engineVersion: ENGINE_VERSION,
      metrics: {
        alignment,
        connectivity,
        power,
        powerUnit: hasOptics ? "mW" : "W",
        frequency,
        snr: clamp(8 + score * 38 - (1 - alignment) * 12, 3, 58),
        hasOptics,
        hasElectronics
      },
      derived: calculate(experiment, primary, secondary)
    };
  }

  function snapshot(experiment, primary, secondary, context = {}) {
    const derived = calculate(experiment, primary, secondary);
    const payload = {
      engineVersion: ENGINE_VERSION,
      experimentId: experiment.id || "",
      experimentName: experiment.name || "",
      sim: experiment.sim || "",
      formula: experiment.formula || "",
      inputs: {
        primary: Number(primary),
        primaryLabel: context.primaryLabel || experiment.primaryLabel || "",
        primaryUnit: context.primaryUnit || experiment.primaryUnit || "",
        secondary: Number(secondary),
        secondaryLabel: context.secondaryLabel || experiment.secondaryLabel || "",
        secondaryUnit: context.secondaryUnit || experiment.secondaryUnit || ""
      },
      derived,
      context: {
        dataSource: context.sourceName || "interactive-model",
        alignment: context.alignment ?? null,
        connectivity: context.connectivity ?? null
      }
    };
    payload.inputHash = hashString(JSON.stringify(payload.inputs));
    payload.generatedAt = new Date().toISOString();
    return payload;
  }

  function getUnitGroup(unit) {
    const normalized = String(unit || "").trim();
    if (["m", "cm", "mm", "μm", "um", "nm"].includes(normalized)) return "length";
    if (["V", "mV", "μV", "uV", "kV"].includes(normalized)) return "voltage";
    if (["A", "mA", "μA", "uA", "nA"].includes(normalized)) return "current";
    if (["Hz", "kHz", "MHz", "GHz"].includes(normalized)) return "frequency";
    if (["W", "mW", "μW", "uW", "nW"].includes(normalized)) return "power";
    if (["s", "ms", "μs", "us", "ns"].includes(normalized)) return "time";
    return "unknown";
  }

  window.OptilabPhysics = {
    version: ENGINE_VERSION,
    calculate,
    computeScene,
    snapshot,
    formatNumber,
    getUnitGroup,
    hashString
  };
})();
