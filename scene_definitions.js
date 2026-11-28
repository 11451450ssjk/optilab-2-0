"use strict";

(function () {
  const FAMILY_BY_PRESET = {
    "professional-light-path": "free-space-optics",
    "professional-instruments": "spectroscopy",
    "professional-arduino": "electronics",
    "professional-led": "electronics",
    "professional-solar": "optoelectronics",
    "professional-stereo": "imaging",
    "professional-voice": "fiber-optics",
    "professional-ir": "imaging",
    "professional-access": "digital",
    "professional-breathing": "digital",
    "professional-robot": "digital",
    "professional-modeling": "mechanical",
    "optical-interference": "interference",
    michelson: "interference",
    "optics-general": "free-space-optics",
    polarization: "polarization",
    diffraction: "diffraction",
    spectrometer: "spectroscopy",
    "laser-lab": "laser",
    "fiber-lab": "fiber-optics",
    photoelectric: "optoelectronics",
    imaging: "imaging",
    circuit: "electronics",
    digital: "digital",
    embedded: "digital",
    communication: "fiber-optics",
    fpga: "digital",
    measurement: "measurement",
    semiconductor: "electronics",
    millikan: "measurement",
    biomedical: "measurement",
    "wave-speed": "measurement",
    magnetic: "electronics",
    thermal: "thermal",
    mechanics: "mechanical",
    solar: "optoelectronics",
    holography: "interference",
    integrated: "optoelectronics"
  };

  const FAMILY_DEFINITIONS = {
    "free-space-optics": { environment: "optical-bench", material: "blackened-aluminum", hasOptics: true },
    interference: { environment: "vibration-isolated-bench", material: "precision-optics", hasOptics: true, requiresCoherence: true },
    diffraction: { environment: "optical-bench", material: "precision-optics", hasOptics: true },
    spectroscopy: { environment: "dark-optical-bench", material: "precision-optics", hasOptics: true },
    polarization: { environment: "optical-bench", material: "polarization-optics", hasOptics: true },
    laser: { environment: "laser-bench", material: "high-power-optics", hasOptics: true, safety: "laser" },
    "fiber-optics": { environment: "fiber-test-bench", material: "fiber-metal", hasOptics: true },
    optoelectronics: { environment: "optoelectronic-bench", material: "mixed-instrument", hasOptics: true, hasElectronics: true },
    imaging: { environment: "imaging-bench", material: "camera-metal", hasOptics: true, hasElectronics: true },
    electronics: { environment: "electronics-bench", material: "instrument-polymer", hasElectronics: true },
    digital: { environment: "digital-bench", material: "pcb-antistatic", hasElectronics: true },
    measurement: { environment: "metrology-bench", material: "instrument-metal", hasElectronics: true },
    thermal: { environment: "thermal-bench", material: "heat-resistant", hasElectronics: true, safety: "thermal" },
    mechanical: { environment: "mechanical-bench", material: "machined-metal", hasElectronics: false }
  };

  const PORTS_BY_KIND = {
    laser: ["EMIT", "INTERLOCK", "CTRL/DB9"],
    "optical-source": ["EMIT", "CTRL"],
    mirror: ["FREE-SPACE", "θx", "θy"],
    splitter: ["IN", "OUT-A", "OUT-B"],
    lens: ["FREE-SPACE", "FOCUS"],
    "beam-expander": ["IN", "OUT", "FOCUS"],
    iris: ["FREE-SPACE", "APERTURE"],
    compensator: ["FREE-SPACE", "TILT"],
    "nd-filter": ["FREE-SPACE", "OD"],
    "beam-dump": ["BEAM-STOP"],
    screen: ["OBSERVE"],
    detector: ["SIG/BNC", "BIAS"],
    scope: ["CH1/BNC50Ω", "CH2/BNC50Ω", "EXT-TRIG"],
    "power-supply": ["+4mm", "−4mm", "GND"],
    generator: ["OUT/BNC50Ω", "SYNC/BNC"],
    multimeter: ["VΩ", "COM", "mA"],
    breadboard: ["POWER-RAIL", "TIE-POINTS"],
    "mcu-board": ["GPIO", "ADC", "UART", "5V/GND"],
    "fiber-spool": ["FC/APC-IN", "FC/APC-OUT"],
    "fiber-coupler": ["IN/FC", "OUT1/FC", "OUT2/FC"],
    camera: ["USB3", "TRIG"],
    computer: ["USB", "LAN"],
    generic: ["MEASURE", "GND"]
  };

  const APERTURE_MM = {
    laser: 1.2,
    mirror: 25.4,
    splitter: 25.4,
    lens: 25.4,
    "beam-expander": 35,
    iris: 12,
    compensator: 22,
    "nd-filter": 25.4,
    "beam-dump": 25,
    screen: 120,
    detector: 3.6,
    camera: 8.5,
    "power-meter": 9.5
  };

  const PICKUP = {
    optical: { height: 0.72, rotationLockUntilPlaced: true, snapsToBreadboard: true },
    electronic: { height: 0.34, rotationLockUntilPlaced: true, snapsToBench: true },
    mechanical: { height: 0.5, rotationLockUntilPlaced: false, snapsToBench: true }
  };

  function familyForExperiment(experiment = {}, presetId = "") {
    if (FAMILY_BY_PRESET[presetId]) return FAMILY_BY_PRESET[presetId];
    const sim = experiment.sim || "";
    if (/interference|holography|michelson/.test(sim)) return "interference";
    if (/circuit|amplifier|oscilloscope|semiconductor/.test(sim)) return "electronics";
    if (/digital|fpga|embedded|sampling/.test(sim)) return "digital";
    if (/fiber|communication/.test(sim)) return "fiber-optics";
    if (/imaging/.test(sim)) return "imaging";
    if (/thermal/.test(sim)) return "thermal";
    if (/mechanics/.test(sim)) return "mechanical";
    return "free-space-optics";
  }

  function descriptorFor(experiment = {}, presetId = "") {
    const family = familyForExperiment(experiment, presetId);
    const definition = FAMILY_DEFINITIONS[family] || FAMILY_DEFINITIONS["free-space-optics"];
    return {
      id: `${presetId || experiment.id || "scene"}-${family}`,
      family,
      ...definition,
      ports: PORTS_BY_KIND,
      apertures: APERTURE_MM,
      pickup: definition.hasOptics ? PICKUP.optical : definition.hasElectronics ? PICKUP.electronic : PICKUP.mechanical,
      beamRoles: {
        source: "主光源",
        "arm-a": "参考臂",
        "arm-a-return": "参考臂返回",
        "arm-b": "测量臂",
        "arm-b-return": "测量臂返回",
        recombined: "合束光",
        observation: "观察信号",
        detector: "探测信号",
        branch: "辅助支路"
      },
      assemblyStages: [
        "安全与器材检查",
        "安装底座和支撑",
        "安装核心元件",
        "粗调轴线",
        "精调与锁定",
        "连接测量端",
        "验证与复位"
      ],
      validation: {
        requireCommonGround: definition.hasElectronics,
        requireBeamHeight: definition.hasOptics,
        requirePortMatch: true
      }
    };
  }

  function portsForKind(kind) {
    return PORTS_BY_KIND[kind] || PORTS_BY_KIND.generic;
  }

  function validateConnection(fromKind, toKind, standard = "") {
    const text = String(standard);
    if (/BNC/.test(text)) {
      const valid = /scope|detector|generator|probe|daq|computer/.test(`${fromKind} ${toKind}`);
      return { valid, expected: "BNC 50Ω", actual: text };
    }
    if (/USB/.test(text)) {
      const valid = /computer|daq|camera|spectrometer|mcu-board|logic-analyzer/.test(`${fromKind} ${toKind}`);
      return { valid, expected: "USB", actual: text };
    }
    if (/FC\/APC/.test(text)) {
      const valid = /fiber|optical-transceiver|spectrometer/.test(`${fromKind} ${toKind}`);
      return { valid, expected: "FC/APC", actual: text };
    }
    if (/4 mm|香蕉/.test(text)) {
      const valid = /power-supply|breadboard|multimeter|load|sample/.test(`${fromKind} ${toKind}`);
      return { valid, expected: "4 mm / DC", actual: text };
    }
    return { valid: true, expected: text || "通用连接", actual: text };
  }

  window.OptilabSceneCatalog = {
    descriptorFor,
    familyForExperiment,
    portsForKind,
    validateConnection,
    PORTS_BY_KIND,
    APERTURE_MM,
    PICKUP
  };
})();
