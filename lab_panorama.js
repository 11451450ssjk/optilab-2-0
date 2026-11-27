"use strict";

(function () {
  const DEVICE_LIBRARY = [
    ["laser", "可调激光器", "laser", "optical"],
    ["white-source", "宽带光源", "instrument", "optical", "☼"],
    ["mirror-a", "反射镜 A", "mirror", "optical"],
    ["mirror-b", "反射镜 B", "mirror", "optical"],
    ["splitter", "分束镜", "splitter", "optical"],
    ["lens", "聚焦透镜", "lens", "optical"],
    ["sample", "待测样品", "sample", "optical"],
    ["screen", "观察屏", "screen", "optical"],
    ["detector", "光电探测器", "detector", "optical"],
    ["slit", "单缝/双缝组件", "instrument", "optical", "Ⅱ"],
    ["polarizer", "起偏器", "instrument", "optical", "⌁"],
    ["analyzer", "检偏器", "instrument", "optical", "⌁"],
    ["grating", "光栅", "instrument", "optical", "▥"],
    ["prism", "棱镜", "instrument", "optical", "△"],
    ["spectrometer", "光谱仪", "instrument", "optical", "▤"],
    ["power-meter", "光功率计", "instrument", "optical", "P"],
    ["beam-profiler", "光束轮廓仪", "instrument", "optical", "◎"],
    ["camera", "科学相机", "instrument", "optical", "◉"],
    ["ir-camera", "红外相机", "instrument", "optical", "◒"],
    ["stereo-camera", "立体相机", "instrument", "optical", "◫"],
    ["monitor", "显示与分析屏", "computer", "optical"],
    ["target", "标定靶/样品", "sample", "optical"],
    ["slm", "空间光调制器", "instrument", "optical", "▦"],
    ["fiber-spool", "光纤盘", "instrument", "optical", "◎"],
    ["fiber-coupler", "光纤耦合器", "instrument", "optical", "⋈"],
    ["optical-tx", "光发射模块", "instrument", "mixed", "TX"],
    ["optical-rx", "光接收模块", "instrument", "mixed", "RX"],
    ["power", "直流电源", "power", "electronic"],
    ["signal", "信号发生器", "signal", "electronic"],
    ["board", "被测电路板", "board", "electronic"],
    ["breadboard", "实验面包板", "board", "electronic"],
    ["probe", "差分探头", "probe", "electronic"],
    ["scope", "数字示波器", "scope", "electronic"],
    ["computer", "采集与分析电脑", "computer", "electronic"],
    ["daq", "数据采集卡", "instrument", "electronic", "DAQ"],
    ["multimeter", "数字万用表", "instrument", "electronic", "DMM"],
    ["diode", "器件测试夹具", "instrument", "electronic", "D"],
    ["led", "LED/光电器件", "sample", "electronic"],
    ["led-strip", "LED 灯带", "instrument", "electronic", "LED"],
    ["logic-analyzer", "逻辑分析仪", "instrument", "electronic", "LA"],
    ["mcu", "嵌入式开发板", "instrument", "electronic", "MCU"],
    ["sensor", "传感器模块", "instrument", "electronic", "S"],
    ["actuator", "执行器模块", "instrument", "electronic", "M"],
    ["ultrasonic", "超声测距模块", "instrument", "electronic", "US"],
    ["lcd", "LCD 显示模块", "instrument", "electronic", "LCD"],
    ["alarm", "蜂鸣器/LED 报警器", "instrument", "electronic", "!"],
    ["keypad", "门禁输入模块", "instrument", "electronic", "⌨"],
    ["robot", "机器人/小车平台", "instrument", "electronic", "R"],
    ["hv-supply", "高压电源", "power", "electronic"],
    ["heater", "加热与温控装置", "instrument", "electronic", "T"],
    ["thermometer", "温度传感器", "instrument", "electronic", "θ"],
    ["calorimeter", "量热/导热装置", "instrument", "electronic", "Q"],
    ["pendulum", "单摆/三线摆装置", "instrument", "mechanical", "T"],
    ["photogate", "光电门计时器", "instrument", "electronic", "t"],
    ["electrode-pad", "生物电传感器", "instrument", "electronic", "ECG"],
    ["bioamp", "生物信号放大器", "instrument", "electronic", "BIO"],
    ["transducer", "声/光换能器", "instrument", "electronic", "TX"],
    ["magnet", "电磁铁/磁体", "instrument", "electronic", "B"],
    ["vibrator", "受迫振动驱动源", "instrument", "mechanical", "≈"],
    ["chamber", "密立根油滴室", "instrument", "optical", "•"],
    ["microscope", "读数显微镜", "instrument", "optical", "M"],
    ["printer", "数字制造设备", "instrument", "mechanical", "3D"],
    ["caliper", "精密测量工具", "instrument", "mechanical", "↔"],
    ["load", "可调电子负载", "instrument", "electronic", "LOAD"]
  ];

  const DEVICE_MAP = Object.fromEntries(DEVICE_LIBRARY.map(([id, label, type, zone, symbol]) => [
    id,
    { id, label, type, zone, symbol: symbol || "" }
  ]));

  const PORT_PROFILES = {
    laser: ["EMIT", "CTRL/DB9"],
    scope: ["CH1/BNC50Ω", "CH2/BNC50Ω", "EXT TRIG", "USB-B"],
    signal: ["OUT/BNC50Ω", "SYNC/BNC"],
    power: ["+4mm", "−4mm", "GND"],
    probe: ["TIP", "GND", "BNC50Ω"],
    detector: ["SIG/BNC", "BIAS"],
    mcu: ["GPIO", "ADC", "UART", "5V/GND"],
    sensor: ["VCC", "GND", "SIG"],
    actuator: ["VCC", "PWM", "GND"],
    computer: ["USB 2.0", "LAN", "GPIB"],
    daq: ["AI0/BNC", "AO0/BNC", "USB-B"],
    multimeter: ["VΩ", "COM", "mA"],
    spectrometer: ["FC/APC", "USB-B"],
    "fiber-coupler": ["IN/FC", "OUT1/FC", "OUT2/FC"],
    "fiber-spool": ["FC/APC IN", "FC/APC OUT"],
    "optical-tx": ["RF/BNC", "FC/APC OUT"],
    "optical-rx": ["FC/APC IN", "RF/BNC"],
    "logic-analyzer": ["CH0–15", "TRIG", "USB-B"],
    "power-meter": ["SENSOR", "USB-B"],
    "beam-profiler": ["CCD", "USB-B"],
    camera: ["USB 3.0", "TRIG"]
  };

  const PRESETS = {
    "professional-light-path": { name: "专业认知 · 光路调试", devices: ["laser", "mirror-a", "lens", "screen", "power-meter"], optics: [["laser", "mirror-a", "lens", "screen"]], cables: [] },
    "professional-arduino": { name: "专业认知 · Arduino 测距", devices: ["mcu", "ultrasonic", "lcd", "alarm", "power", "computer"], optics: [], cables: [["power", "mcu"], ["mcu", "ultrasonic"], ["mcu", "lcd"], ["mcu", "alarm"], ["mcu", "computer"]] },
    "professional-instruments": { name: "专业认知 · 光学仪器", devices: ["white-source", "lens", "prism", "spectrometer", "power-meter"], optics: [["white-source", "lens", "prism", "spectrometer"]], cables: [["spectrometer", "power-meter"]] },
    "professional-modeling": { name: "专业认知 · 数字建模制造", devices: ["computer", "printer", "caliper"], optics: [], cables: [["computer", "printer"], ["caliper", "printer"]] },
    "professional-stereo": { name: "专业认知 · 立体视频", devices: ["stereo-camera", "target", "monitor", "computer"], optics: [["target", "stereo-camera", "monitor"]], cables: [["stereo-camera", "computer"], ["computer", "monitor"]] },
    "professional-voice": { name: "专业认知 · 语音光传输", devices: ["white-source", "optical-tx", "fiber-spool", "optical-rx", "scope", "computer"], optics: [["white-source", "optical-tx", "fiber-spool", "optical-rx"]], cables: [["optical-rx", "scope"], ["scope", "computer"]] },
    "professional-ir": { name: "专业认知 · 红外成像", devices: ["target", "ir-camera", "monitor", "computer"], optics: [["target", "ir-camera", "monitor"]], cables: [["ir-camera", "computer"], ["computer", "monitor"]] },
    "professional-led": { name: "专业认知 · 电子元器件", devices: ["power", "breadboard", "led", "multimeter"], optics: [], cables: [["power", "breadboard"], ["breadboard", "led"], ["breadboard", "multimeter"]] },
    "professional-solar": { name: "专业认知 · 太阳能与光学仪器", devices: ["white-source", "sample", "multimeter", "load", "power-meter"], optics: [["white-source", "sample", "power-meter"]], cables: [["sample", "multimeter"], ["sample", "load"]] },
    "professional-access": { name: "专业认知 · 门禁报警器", devices: ["keypad", "sensor", "mcu", "alarm", "power"], optics: [], cables: [["power", "mcu"], ["keypad", "mcu"], ["sensor", "mcu"], ["mcu", "alarm"]] },
    "professional-breathing": { name: "专业认知 · 炫彩呼吸灯", devices: ["mcu", "led-strip", "power", "scope"], optics: [], cables: [["power", "mcu"], ["mcu", "led-strip"], ["mcu", "scope"]] },
    "professional-robot": { name: "专业认知 · 机器人小车", devices: ["mcu", "sensor", "actuator", "robot", "computer"], optics: [], cables: [["mcu", "sensor"], ["mcu", "actuator"], ["actuator", "robot"], ["mcu", "computer"]] },
    "optical-interference": { name: "光学干涉", devices: ["laser", "mirror-a", "mirror-b", "splitter", "lens", "screen", "detector", "scope"], optics: [["laser", "splitter", "mirror-a", "splitter", "lens", "screen"], ["splitter", "mirror-b", "splitter", "detector"]], cables: [["detector", "scope"]] },
    "optics-general": { name: "应用光学", devices: ["white-source", "lens", "sample", "screen", "camera", "computer"], optics: [["white-source", "lens", "sample", "screen", "camera"]], cables: [["camera", "computer"]] },
    "polarization": { name: "偏振光学", devices: ["laser", "polarizer", "sample", "analyzer", "detector", "scope"], optics: [["laser", "polarizer", "sample", "analyzer", "detector"]], cables: [["detector", "scope"]] },
    "diffraction": { name: "衍射与光谱", devices: ["laser", "slit", "grating", "lens", "screen", "detector", "scope"], optics: [["laser", "slit", "grating", "lens", "screen"], ["screen", "detector"]], cables: [["detector", "scope"]] },
    "spectrometer": { name: "光谱测量", devices: ["white-source", "sample", "prism", "grating", "spectrometer", "computer"], optics: [["white-source", "sample", "prism", "grating", "spectrometer"]], cables: [["spectrometer", "computer"]] },
    "laser-lab": { name: "激光实验", devices: ["laser", "mirror-a", "mirror-b", "lens", "power-meter", "beam-profiler", "scope"], optics: [["laser", "mirror-a", "lens", "power-meter"], ["lens", "beam-profiler"]], cables: [["power-meter", "scope"]] },
    "fiber-lab": { name: "光纤实验", devices: ["laser", "fiber-coupler", "fiber-spool", "power-meter", "detector", "scope", "spectrometer"], optics: [["laser", "fiber-coupler", "fiber-spool", "detector"], ["fiber-spool", "spectrometer"]], cables: [["detector", "scope"]] },
    "photoelectric": { name: "光电探测", devices: ["white-source", "sample", "detector", "power-meter", "probe", "scope"], optics: [["white-source", "sample", "detector"]], cables: [["detector", "probe"], ["probe", "scope"], ["detector", "power-meter"]] },
    "imaging": { name: "成像与机器视觉", devices: ["white-source", "target", "lens", "camera", "monitor", "computer"], optics: [["white-source", "target", "lens", "camera"]], cables: [["camera", "computer"], ["computer", "monitor"]] },
    "circuit": { name: "电路与电子", devices: ["power", "signal", "breadboard", "probe", "scope", "multimeter"], optics: [], cables: [["power", "breadboard"], ["signal", "breadboard"], ["breadboard", "probe"], ["probe", "scope"], ["breadboard", "multimeter"]] },
    "digital": { name: "数字逻辑", devices: ["power", "signal", "breadboard", "logic-analyzer", "probe", "scope"], optics: [], cables: [["power", "breadboard"], ["signal", "breadboard"], ["breadboard", "logic-analyzer"], ["breadboard", "probe"], ["probe", "scope"]] },
    "embedded": { name: "嵌入式与接口", devices: ["power", "mcu", "sensor", "actuator", "logic-analyzer", "computer"], optics: [], cables: [["power", "mcu"], ["sensor", "mcu"], ["mcu", "actuator"], ["mcu", "logic-analyzer"], ["mcu", "computer"]] },
    "communication": { name: "光通信", devices: ["signal", "optical-tx", "fiber-spool", "optical-rx", "scope", "computer"], optics: [["optical-tx", "fiber-spool", "optical-rx"]], cables: [["signal", "optical-tx"], ["optical-rx", "scope"], ["scope", "computer"]] },
    "fpga": { name: "FPGA 与数字系统", devices: ["power", "signal", "mcu", "logic-analyzer", "scope", "computer"], optics: [], cables: [["power", "mcu"], ["signal", "mcu"], ["mcu", "logic-analyzer"], ["mcu", "scope"], ["mcu", "computer"]] },
    "measurement": { name: "基础测量", devices: ["sample", "multimeter", "photogate", "daq", "computer"], optics: [], cables: [["sample", "multimeter"], ["photogate", "daq"], ["daq", "computer"]] },
    "semiconductor": { name: "半导体器件测试", devices: ["power", "diode", "probe", "multimeter", "thermometer", "scope"], optics: [], cables: [["power", "diode"], ["diode", "probe"], ["probe", "multimeter"], ["probe", "scope"], ["thermometer", "daq"]] },
    "millikan": { name: "密立根油滴", devices: ["hv-supply", "chamber", "microscope", "daq", "computer"], optics: [["chamber", "microscope"]], cables: [["hv-supply", "chamber"], ["microscope", "computer"], ["daq", "computer"]] },
    "biomedical": { name: "生物信号测量", devices: ["electrode-pad", "bioamp", "daq", "scope", "computer"], optics: [], cables: [["electrode-pad", "bioamp"], ["bioamp", "daq"], ["bioamp", "scope"], ["daq", "computer"]] },
    "wave-speed": { name: "声速与光速", devices: ["signal", "transducer", "sample", "probe", "scope", "computer"], optics: [["transducer", "sample"]], cables: [["signal", "transducer"], ["probe", "scope"], ["scope", "computer"]] },
    "magnetic": { name: "磁学与霍尔", devices: ["power", "magnet", "sample", "probe", "multimeter", "computer"], optics: [], cables: [["power", "magnet"], ["probe", "multimeter"], ["multimeter", "computer"]] },
    "thermal": { name: "热学测量", devices: ["heater", "calorimeter", "thermometer", "daq", "computer"], optics: [], cables: [["heater", "calorimeter"], ["thermometer", "daq"], ["daq", "computer"]] },
    "mechanics": { name: "力学与振动", devices: ["pendulum", "photogate", "vibrator", "signal", "scope"], optics: [], cables: [["photogate", "scope"], ["signal", "vibrator"]] },
    "solar": { name: "光伏与光电器件", devices: ["white-source", "sample", "load", "multimeter", "daq", "computer"], optics: [["white-source", "sample"]], cables: [["sample", "load"], ["sample", "multimeter"], ["load", "daq"], ["daq", "computer"]] },
    "holography": { name: "全息与相位", devices: ["laser", "splitter", "mirror-a", "mirror-b", "sample", "camera", "computer"], optics: [["laser", "splitter", "mirror-a", "sample", "camera"], ["splitter", "mirror-b", "sample"]], cables: [["camera", "computer"]] },
    "integrated": { name: "综合光电系统", devices: ["laser", "sample", "detector", "daq", "computer", "monitor"], optics: [["laser", "sample", "detector"]], cables: [["detector", "daq"], ["daq", "computer"], ["computer", "monitor"]] }
  };

  const PALETTES = [
    { bodyTop: "#4d5a55", bodyMid: "#26322f", bodyBottom: "#131b18", accent: "#d9b474", glow: "#7ec59a" },
    { bodyTop: "#40545d", bodyMid: "#22333b", bodyBottom: "#10191d", accent: "#77b8c4", glow: "#72b6ad" },
    { bodyTop: "#584e44", bodyMid: "#352b22", bodyBottom: "#18130f", accent: "#d59b64", glow: "#d6ad72" },
    { bodyTop: "#474d59", bodyMid: "#292f3d", bodyBottom: "#121620", accent: "#9aa7d0", glow: "#8eaecb" }
  ];

  const state = {
    canvas: null,
    context: null,
    active: false,
    dragging: null,
    selected: "laser",
    devices: [],
    presetId: "",
    preset: null,
    experimentId: "",
    currentConfig: null,
    connectionSpecs: [],
    standardSummary: "",
    equipmentTraits: [],
    palette: PALETTES[0],
    defaultPositions: new Map(),
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
  const hashString = (value) => {
    let hash = 2166136261;
    for (const char of String(value || "")) {
      hash ^= char.charCodeAt(0);
      hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
  };
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

  function presetForExperiment(config = {}) {
    const name = String(config.experimentName || "");
    const sim = String(config.sim || "");
    const rules = [
      [/Arduino|超声测距/i, "professional-arduino"],
      [/光路的调试|共轴/i, "professional-light-path"],
      [/光学仪器的认知/i, "professional-instruments"],
      [/数字建模|增材/i, "professional-modeling"],
      [/立体视频/i, "professional-stereo"],
      [/语音光信号/i, "professional-voice"],
      [/红外成像/i, "professional-ir"],
      [/电子元器件.*LED|LED.*认识/i, "professional-led"],
      [/太阳能与光学仪器/i, "professional-solar"],
      [/门禁报警/i, "professional-access"],
      [/呼吸灯/i, "professional-breathing"],
      [/机器人|小车/i, "professional-robot"],
      [/密立根/i, "millikan"],
      [/人体生物信号/i, "biomedical"],
      [/声速与光速/i, "wave-speed"],
      [/伏安特性|二极管|霍尔|巨磁|核磁|磁滞|晶体管输入/i, "semiconductor"],
      [/迈克尔逊|牛顿环|相移干涉|剪切干涉/i, "optical-interference"],
      [/双缝|单缝|干涉与衍射|衍射|涡旋|莫尔|泰伯/i, "diffraction"],
      [/偏振|马吕斯/i, "polarization"],
      [/光栅|分光计|光谱|傅里叶变换光谱/i, "spectrometer"],
      [/激光|He-Ne|调 ?Q|倍频|外差|线宽|脉冲剪裁/i, "laser-lab"],
      [/光纤|EDFA|EDFL|OTDR|FBG|波分/i, "fiber-lab"],
      [/光电效应|弗兰克|光电探测|响应度|SPAD|APD|探测器/i, "photoelectric"],
      [/成像|相机|机器视觉|全息|超分辨|Hough/i, "imaging"],
      [/热导|比热|温度|量热/i, "thermal"],
      [/转动惯量|单摆|三线摆|杨氏模量|振动|共振|混沌/i, "mechanics"],
      [/光电池|太阳能电池|填充因子/i, "solar"],
      [/全息|相位恢复/i, "holography"]
    ];
    const matched = rules.find(([pattern]) => pattern.test(name));
    if (matched) return matched[1];
    const simMap = {
      circuit: "circuit",
      rc: "circuit",
      oscilloscope: "circuit",
      digital: "digital",
      fpga: "fpga",
      embedded: "embedded",
      communication: "communication",
      frequency: "circuit",
      semiconductor: "semiconductor",
      measurement: "measurement",
      photoelectric: "photoelectric",
      photodiode: "photoelectric",
      solar: "solar",
      optics: "optics-general",
      grating: "spectrometer",
      polarization: "polarization",
      michelson: "optical-interference",
      newton: "optical-interference",
      "double-slit": "diffraction",
      diffraction: "diffraction",
      holography: "holography",
      fourier: "spectrometer",
      laser: "laser-lab",
      fiber: "fiber-lab",
      imaging: "imaging",
      integrated: "integrated",
      amplifier: "circuit",
      oscillator: "circuit",
      sampling: "digital",
      dsp: "digital"
    };
    return simMap[sim] || "measurement";
  }

  function arrangeDevices(ids, seed = 0) {
    const definitions = ids.map((id) => DEVICE_MAP[id]).filter(Boolean);
    const optical = definitions.filter((item) => item.zone === "optical" || item.zone === "mixed");
    const electronic = definitions.filter((item) => item.zone === "electronic");
    const mechanical = definitions.filter((item) => item.zone === "mechanical");
    const positioned = [];
    const maxPerRow = state.width < 620 ? 4 : 5;
    const placeGroup = (items, baseY, rowGap) => {
      const rows = Math.ceil(items.length / maxPerRow);
      items.forEach((item, index) => {
        const row = Math.floor(index / maxPerRow);
        const rowItems = items.slice(row * maxPerRow, Math.min(items.length, (row + 1) * maxPerRow));
        const column = index % maxPerRow;
        const x = (column + 1) / (rowItems.length + 1);
        const y = baseY + row * rowGap;
        const jitterSeed = seed ^ hashString(`${item.id}:${index}`);
        const jitterX = ((jitterSeed % 1000) / 999 - 0.5) * 0.032;
        const jitterY = (((jitterSeed >>> 10) % 1000) / 999 - 0.5) * 0.022;
        positioned.push({
          ...item,
          x: clamp(x + jitterX, 0.08, 0.92),
          y: clamp(y + jitterY, 0.1, 0.9)
        });
      });
    };
    placeGroup(optical, 0.22, 0.15);
    if (mechanical.length) placeGroup(mechanical, 0.48, 0.12);
    if (electronic.length) {
      const base = optical.length ? (mechanical.length ? 0.70 : 0.66) : 0.30;
      placeGroup(electronic, base, 0.14);
    }
    return positioned;
  }

  function inferCableStandard(from, to, presetId) {
    const ids = `${from?.id || ""} ${to?.id || ""}`;
    if (/fiber|optical-tx|optical-rx/.test(ids) || presetId === "fiber-lab") return "FC/APC 单模光纤";
    if (/computer|daq|camera|spectrometer|logic-analyzer/.test(ids)) return "USB 2.0 / 3.0";
    if (/scope|signal|probe|detector/.test(ids)) return "BNC 50Ω 同轴";
    if (/power/.test(ids)) return "4 mm 香蕉插头 / DC 5.5 mm";
    if (/multimeter|board/.test(ids)) return "4 mm 表笔 / 测试引线";
    if (/mcu|sensor|actuator|ultrasonic|lcd|alarm|keypad/.test(ids)) return "2.54 mm 杜邦线";
    return "屏蔽信号线";
  }

  function createConnectionSpecs(preset, presetId, seed) {
    const opticalStandards = preset.optics.length
      ? [presetId === "fiber-lab" || presetId === "communication" ? "FC/APC 光纤光路" : "自由空间准直光路"]
      : [];
    const cableSpecs = preset.cables.map(([fromId, toId], index) => {
      const from = DEVICE_MAP[fromId];
      const to = DEVICE_MAP[toId];
      return {
        fromId,
        toId,
        standard: inferCableStandard(from, to, presetId),
        phase: 0.08 + index * 0.13,
        variant: (seed + index * 17) % 3
      };
    });
    return {
      opticalStandards,
      cableSpecs,
      summary: [...new Set([...opticalStandards, ...cableSpecs.map((item) => item.standard)])].join(" · ") || "无外部接线"
    };
  }

  function decorateExperimentDevices(devices, config = {}, seed = 0) {
    const name = String(config.experimentName || "");
    const traits = [];
    const decorate = (id, changes) => {
      const device = devices.find((item) => item.id === id);
      if (device) Object.assign(device, changes);
    };
    let laserVariant = "generic";
    if (/光路的调试|共轴/i.test(name)) traits.push("准直光路 · 光斑位置校准");
    if (/He-Ne/i.test(name)) {
      laserVariant = "hene";
      decorate("laser", { label: "He-Ne 激光器", variant: "hene", symbol: "He-Ne" });
      traits.push("He-Ne 红光激光管");
    } else if (/Nd:YVO4|固体激光/i.test(name)) {
      laserVariant = "solid";
      decorate("laser", { label: "Nd:YVO₄ 固体激光模块", variant: "solid", symbol: "YVO₄" });
      traits.push("固体增益介质与泵浦模块");
    } else if (/激光二极管|半导体激光|LD/i.test(name)) {
      laserVariant = "diode";
      decorate("laser", { label: "半导体激光器", variant: "diode", symbol: "LD" });
      traits.push("恒流驱动与温控封装");
    } else if (/可调谐|TDLAS/i.test(name)) {
      laserVariant = "tunable";
      decorate("laser", { label: "可调谐激光器", variant: "tunable", symbol: "TUNE" });
      traits.push("波长扫描与控制接口");
    } else if (/光纤/i.test(name)) {
      laserVariant = "fiber";
      decorate("laser", { label: "光纤耦合激光源", variant: "fiber", symbol: "FC" });
      traits.push("光纤耦合输出");
    }
    if (name.includes("红外")) {
      decorate("ir-camera", { label: "红外热像仪", symbol: "IR", variant: "thermal" });
      decorate("target", { label: "红外目标", symbol: "IR-T" });
      traits.push("长波红外探测通道");
    }
    if (/Arduino/i.test(name)) {
      decorate("mcu", { label: "Arduino 控制板", symbol: "UNO", variant: "arduino" });
      traits.push("5 V 逻辑 · 数字/模拟 IO");
    } else if (/8086|EMU8086/i.test(name)) {
      decorate("mcu", { label: "8086 微机实验箱", symbol: "8086", variant: "8086" });
      traits.push("8086 总线与并行接口");
    } else if (/单片机|GPIO|ADC|UART|I2C|SPI/i.test(name)) {
      decorate("mcu", { label: "单片机开发板", symbol: "MCU", variant: "mcu" });
      traits.push("3.3 V/5 V 数字外设接口");
    }
    if (/Verilog|FPGA/i.test(name)) {
      decorate("mcu", { label: "FPGA 开发板", symbol: "FPGA", variant: "fpga" });
      decorate("board", { label: "FPGA I/O 扩展板", variant: "digital", symbol: "IO" });
      traits.push("可编程逻辑与 I/O 时序");
    }
    if (/二极管|伏安/i.test(name)) {
      decorate("diode", { label: "二极管 I–V 测试夹具", variant: "diode", symbol: "PN" });
      traits.push("限流保护与四线/两线测量");
    }
    if (/霍尔|巨磁|磁场/i.test(name)) {
      decorate("magnet", { label: "电磁铁", symbol: "B", variant: "magnet" });
      decorate("sample", { label: "磁敏样品", symbol: "HALL" });
      traits.push("磁场扫描与霍尔电压测量");
    }
    if (/分光计/i.test(name)) {
      decorate("spectrometer", { label: "分光计", symbol: "GON", variant: "goniometer" });
      decorate("prism", { label: "色散棱镜", symbol: "△" });
      traits.push("角度读数与棱镜/光栅色散");
    } else if (/傅里叶变换光谱|FTIR/i.test(name)) {
      decorate("spectrometer", { label: "FTIR 光谱仪", symbol: "FTIR", variant: "ftir" });
      traits.push("干涉图傅里叶变换");
    } else if (/光谱/i.test(name)) {
      decorate("spectrometer", { label: "光栅光谱仪", symbol: "SPEC", variant: "grating" });
      traits.push("光栅分光与线阵探测");
    }
    if (/太阳|光电池|光伏/i.test(name)) {
      decorate("sample", { label: "光伏电池组件", symbol: "PV", variant: "solar" });
      decorate("load", { label: "可调电子负载", symbol: "I–V", variant: "load" });
      traits.push("I–V 扫描与填充因子");
    }
    if (/生物信号/i.test(name)) {
      decorate("electrode-pad", { label: "生物电电极", symbol: "ECG" });
      decorate("bioamp", { label: "低噪声生物放大器", symbol: "BIO" });
      traits.push("高共模抑制生物电前端");
    }
    if (/光纤|FBG|EDFA|EDFL|OTDR/i.test(name)) {
      decorate("fiber-spool", { label: "单模光纤盘", symbol: "FC", variant: "fiber" });
      decorate("fiber-coupler", { label: "1×2 光纤耦合器", symbol: "Y", variant: "fiber" });
      traits.push("FC/APC 光纤链路");
    }
    if (/示波器/i.test(name)) {
      decorate("scope", { label: "数字存储示波器", symbol: "DSO", variant: "dso" });
      traits.push("垂直档位与稳定触发");
    }
    if (/逻辑|计数器|触发器|组合逻辑/i.test(name)) {
      decorate("board", { label: "数字逻辑实验板", symbol: "LOGIC", variant: "digital" });
      decorate("logic-analyzer", { label: "16 通道逻辑分析仪", symbol: "LA" });
      traits.push("多位数字总线与时序分析");
    }
    if (/电桥|基尔霍夫|戴维南|谐振|三相|互感/i.test(name)) {
      decorate("board", { label: "电路测试实验板", symbol: "RLC", variant: "analog" });
      traits.push("四端测量与参考地");
    }
    if (/光电效应|弗兰克|探测器|响应度|暗电流/i.test(name)) {
      decorate("detector", { label: "光电探测头", symbol: "PD", variant: "photoelectric" });
      traits.push("偏置与微电流测量");
    }
    if (/CCD|CMOS|成像|机器视觉/i.test(name)) {
      decorate("camera", { label: "科学成像相机", symbol: "CCD", variant: "scientific" });
      traits.push("曝光、增益与像素标定");
    }
    if (/全息|相移|剪切/i.test(name)) {
      decorate("mirror-a", { label: "精密反射镜 A", symbol: "λ/10" });
      decorate("mirror-b", { label: "精密反射镜 B", symbol: "λ/10" });
      traits.push("精密位移与波前测量");
    }
    if (config.primaryLabel) traits.push(`${config.primaryLabel}：${config.primaryUnit || ""}`);
    if (config.secondaryLabel) traits.push(`${config.secondaryLabel}：${config.secondaryUnit || ""}`);
    if (!traits.length) {
      const primaryDevices = devices.slice(0, 3).map((device) => device.label).join(" + ");
      traits.push(primaryDevices ? `${primaryDevices} 组合` : "通用测量装置");
    }
    devices.forEach((device, index) => {
      const variant = (seed >>> (index % 8)) & 1;
      device.accent = PALETTES[(seed + index) % PALETTES.length].accent;
      device.visualVariant = variant;
      if (device.id === "laser" && device.variant == null) device.variant = laserVariant;
    });
    return [...new Set(traits)].slice(0, 7);
  }

  function applyPreset(presetId, config = {}) {
    const preset = PRESETS[presetId] || PRESETS.measurement;
    const seed = hashString(config.experimentId || config.experimentName || presetId);
    state.presetId = presetId;
    state.preset = preset;
    state.experimentId = config.experimentId || "";
    state.currentConfig = { ...config };
    state.devices = arrangeDevices(preset.devices, seed);
    state.palette = PALETTES[seed % PALETTES.length];
    state.equipmentTraits = decorateExperimentDevices(state.devices, config, seed);
    state.defaultPositions = new Map(state.devices.map((device) => [device.id, { x: device.x, y: device.y }]));
    const connections = createConnectionSpecs(preset, presetId, seed);
    state.connectionSpecs = connections.cableSpecs;
    state.standardSummary = connections.summary;
    state.selected = state.devices[0]?.id || "";
    renderDeviceDock();
    updateSelectionHud();
  }

  function resetPositions() {
    if (!state.preset) applyPreset("measurement", { experimentName: "基础测量", sim: "measurement" });
    else applyPreset(state.presetId, state.currentConfig || {});
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
    const opticalDevices = state.devices.filter((device) => device.zone === "optical" || device.zone === "mixed");
    const electronicDevices = state.devices.filter((device) => device.zone === "electronic");
    const mechanicalDevices = state.devices.filter((device) => device.zone === "mechanical");
    const averageDeviation = (devices) => {
      if (!devices.length) return 0;
      return devices.reduce((total, device) => {
        const origin = state.defaultPositions.get(device.id) || device;
        return total + Math.hypot(device.x - origin.x, device.y - origin.y);
      }, 0) / devices.length;
    };
    const opticalDeviation = averageDeviation(opticalDevices);
    const electronicDeviation = averageDeviation(electronicDevices);
    const mechanicalDeviation = averageDeviation(mechanicalDevices);
    const alignment = opticalDevices.length
      ? clamp(0.88 - opticalDeviation * 1.75, 0.16, 0.98)
      : clamp(0.86 - mechanicalDeviation * 1.6, 0.2, 0.97);
    const connectivity = electronicDevices.length
      ? clamp(0.89 - electronicDeviation * 1.6, 0.2, 0.98)
      : 0.72;
    const sourceDrive = clamp(Math.abs(Number(config.primary) || 1) / 20, 0.18, 1);
    const hasOptics = opticalDevices.length >= 2;
    const hasElectronics = electronicDevices.length >= 2;
    const measurementPower = hasOptics
      ? clamp((0.8 + sourceDrive * 3.6) * alignment, 0.08, 9.9)
      : clamp((0.18 + sourceDrive * 4.8) * connectivity, 0.03, 24);
    const baseFrequency = /Hz|hz/.test(String(config.secondaryUnit || ""))
      ? Math.abs(Number(config.secondary) || 1000)
      : 1000 + Math.abs(Number(config.secondary) || 1) * 47;
    const frequency = clamp(baseFrequency, 10, 250000);
    const combined = hasOptics && hasElectronics ? Math.min(alignment, connectivity) : hasOptics ? alignment : connectivity;
    const snr = clamp(7 + combined * 36 + connectivity * 6 - (1 - alignment) * 12, 3, 58);
    return {
      alignment,
      connectivity,
      power: measurementPower,
      powerUnit: hasOptics ? "mW" : "W",
      frequency,
      snr,
      hasOptics,
      hasElectronics,
      opticalDevices: opticalDevices.length,
      electronicDevices: electronicDevices.length
    };
  }

  function compact(value, digits = 2) {
    if (!Number.isFinite(value)) return "—";
    if (Math.abs(value) >= 1000) return `${(value / 1000).toFixed(digits)}k`;
    return Number(value).toFixed(digits).replace(/\.?0+$/, "");
  }

  function fitText(context, text, maxWidth) {
    if (context.measureText(text).width <= maxWidth) return text;
    let value = text;
    while (value.length > 4 && context.measureText(`${value}…`).width > maxWidth) {
      value = value.slice(0, -1);
    }
    return `${value}…`;
  }

  function updateSelectionHud() {
    const selected = deviceById(state.selected);
    const label = $("#panorama-selected");
    if (label && selected) label.textContent = `正在观察：${selected.label}`;
    const portMap = $("#panorama-port-map");
    if (portMap) {
      const ports = PORT_PROFILES[selected?.id] || PORT_PROFILES[selected?.type] || ["MEASURE", "GND"];
      portMap.textContent = selected ? `端口：${ports.join(" · ")}` : "端口：—";
    }
    document.querySelectorAll("[data-panorama-device]").forEach((button) => {
      button.classList.toggle("active", button.dataset.panoramaDevice === state.selected);
    });
  }

  function updateHud(config, time) {
    if (time - state.lastHudUpdate < 100) return;
    state.lastHudUpdate = time;
    const metrics = state.metrics;
    const standard = $("#panorama-standard");
    if (standard) standard.textContent = `接线标准：${state.standardSummary}`;
    const equipmentTraits = $("#panorama-equipment-traits");
    if (equipmentTraits) {
      equipmentTraits.textContent = `器材特征：${state.equipmentTraits.length ? state.equipmentTraits.join(" · ") : state.preset.name}`;
    }
    const alignmentLabel = $("#panorama-alignment-label");
    const powerLabel = $("#panorama-power-label");
    if (alignmentLabel) alignmentLabel.textContent = metrics.hasOptics ? "光路对准" : "装置对齐";
    if (powerLabel) powerLabel.textContent = metrics.hasOptics ? "探测器功率" : "电路输出功率";
    $("#panorama-alignment") && ($("#panorama-alignment").textContent = `${Math.round(metrics.alignment * 100)}%`);
    $("#panorama-power") && ($("#panorama-power").textContent = `${compact(metrics.power, 2)} ${metrics.powerUnit}`);
    $("#panorama-frequency") && ($("#panorama-frequency").textContent = `${compact(metrics.frequency, 1)} Hz`);
    $("#panorama-snr") && ($("#panorama-snr").textContent = `${compact(metrics.snr, 1)} dB`);
    const score = metrics.hasOptics && metrics.hasElectronics
      ? Math.min(metrics.alignment, metrics.connectivity)
      : metrics.hasOptics ? metrics.alignment : metrics.connectivity;
    $("#panorama-status") && ($("#panorama-status").textContent =
      score > 0.72
        ? `${state.preset.name} · 器件关系稳定 · 采集在线`
        : score > 0.45
          ? `${state.preset.name} · 装置可用，可继续微调器件`
          : `${state.preset.name} · 器件偏离，拖动相关装置重新对准`
    );
    const stateClass = score > 0.7 ? "good" : score > 0.4 ? "warn" : "bad";
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

    const tableTop = state.height * 0.15;
    context.save();
    const mat = context.createLinearGradient(0, tableTop, 0, state.height);
    mat.addColorStop(0, "rgba(37, 50, 44, 0.9)");
    mat.addColorStop(1, "rgba(13, 20, 18, 0.96)");
    context.fillStyle = mat;
    roundRect(context, state.width * 0.018, tableTop, state.width * 0.964, state.height * 0.82, 14);
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

  function drawConnector(context, pointValue, color, variant = 0) {
    context.save();
    context.fillStyle = "#0d1412";
    context.strokeStyle = color;
    context.lineWidth = 1.4;
    if (variant === 1) {
      roundRect(context, pointValue.x - 4, pointValue.y - 3, 8, 6, 1);
      context.fill();
      context.stroke();
      context.fillStyle = color;
      context.fillRect(pointValue.x - 2, pointValue.y - 1, 4, 2);
    } else if (variant === 2) {
      context.beginPath();
      context.arc(pointValue.x, pointValue.y, 4, 0, Math.PI * 2);
      context.fill();
      context.stroke();
      context.fillStyle = color;
      context.beginPath();
      context.arc(pointValue.x, pointValue.y, 1.6, 0, Math.PI * 2);
      context.fill();
    } else {
      context.beginPath();
      context.arc(pointValue.x, pointValue.y, 3.5, 0, Math.PI * 2);
      context.fill();
      context.stroke();
    }
    context.restore();
  }

  function drawCables(context, time) {
    if (!state.showCables) return;
    const colors = ["#e7b76f", "#5fbfaa", "#d6d1ba", "#7fa9d8", "#d6a962", "#ac8ad8"];
    state.connectionSpecs.forEach((connection, index) => {
      const fromDevice = deviceById(connection.fromId);
      const toDevice = deviceById(connection.toId);
      if (!fromDevice || !toDevice) return;
      const from = point(fromDevice, "right");
      const to = point(toDevice, "left");
      drawCable(context, from, to, colors[index % colors.length], time, connection.phase);
      drawConnector(context, from, colors[index % colors.length], connection.variant);
      drawConnector(context, to, colors[index % colors.length], connection.variant);
    });
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
    (state.preset?.optics || []).forEach((path, pathIndex) => {
      const devices = path.map(deviceById).filter(Boolean);
      for (let index = 0; index < devices.length - 1; index += 1) {
        drawBeam(
          context,
          point(devices[index], "right"),
          point(devices[index + 1], "left"),
          time,
          color,
          metrics.alignment * (0.9 - index * 0.03),
          (pathIndex * 0.21 + index * 0.13) % 1
        );
      }
    });
  }

  function bodyGradient(context, box) {
    const gradient = context.createLinearGradient(box.x, box.y, box.x, box.y + box.height);
    gradient.addColorStop(0, state.palette.bodyTop);
    gradient.addColorStop(0.45, state.palette.bodyMid);
    gradient.addColorStop(1, state.palette.bodyBottom);
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

  function drawLaser(context, box, time, device) {
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
    const variant = device?.variant || "generic";
    if (variant === "hene") {
      context.fillStyle = "rgba(207, 228, 218, 0.18)";
      roundRect(context, box.x + 10, box.y + box.height * 0.16, box.width * 0.55, box.height * 0.34, 5);
      context.fill();
      context.strokeStyle = "rgba(244, 138, 115, 0.72)";
      context.beginPath();
      context.moveTo(box.x + 13, box.y + box.height * 0.33);
      context.lineTo(box.x + box.width * 0.6, box.y + box.height * 0.33);
      context.stroke();
    } else if (variant === "solid") {
      context.fillStyle = "rgba(167, 130, 74, 0.28)";
      roundRect(context, box.x + box.width * 0.2, box.y + box.height * 0.18, box.width * 0.35, box.height * 0.32, 3);
      context.fill();
      context.fillStyle = "rgba(103, 225, 154, 0.72)";
      context.fillRect(box.x + box.width * 0.34, box.y + box.height * 0.22, 2, box.height * 0.22);
    } else if (variant === "diode") {
      context.strokeStyle = "rgba(135, 160, 170, 0.55)";
      for (let index = 0; index < 5; index += 1) {
        context.beginPath();
        context.moveTo(box.x + box.width * 0.18 + index * 5, box.y + box.height * 0.16);
        context.lineTo(box.x + box.width * 0.18 + index * 5, box.y + box.height * 0.38);
        context.stroke();
      }
    } else if (variant === "tunable") {
      context.fillStyle = "rgba(8, 17, 16, 0.8)";
      roundRect(context, box.x + box.width * 0.12, box.y + box.height * 0.15, box.width * 0.32, box.height * 0.24, 2);
      context.fill();
      context.fillStyle = device.accent || state.palette.accent;
      context.font = '6px "Cascadia Mono", monospace';
      context.fillText("λ", box.x + box.width * 0.22, box.y + box.height * 0.3);
    }
    const pulse = 0.75 + Math.sin(time * 0.005) * 0.2;
    const apertureColor = variant === "hene" ? [245, 128, 103] :
      variant === "solid" ? [113, 225, 147] :
        variant === "diode" ? [99, 168, 232] :
          variant === "fiber" ? [224, 181, 88] : [255, 220, 144];
    context.fillStyle = `rgba(${apertureColor[0]}, ${apertureColor[1]}, ${apertureColor[2]}, ${pulse})`;
    context.shadowColor = `rgb(${apertureColor.join(",")})`;
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

  function drawSample(context, box, time, device) {
    context.fillStyle = "rgba(31, 43, 39, 0.92)";
    roundRect(context, box.x, box.y + box.height * 0.42, box.width, box.height * 0.48, 4);
    context.fill();
    const grad = context.createLinearGradient(box.x, box.y, box.x + box.width, box.y);
    if (device?.variant === "solar") {
      grad.addColorStop(0, "rgba(47, 91, 142, 0.78)");
      grad.addColorStop(0.5, "rgba(68, 123, 178, 0.72)");
      grad.addColorStop(1, "rgba(28, 58, 93, 0.84)");
    } else {
      grad.addColorStop(0, "rgba(92, 150, 137, 0.42)");
      grad.addColorStop(0.5, "rgba(216, 198, 150, 0.34)");
      grad.addColorStop(1, "rgba(201, 128, 83, 0.38)");
    }
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

  function drawBoard(context, box, device) {
    const variant = device?.variant || "analog";
    context.fillStyle = variant === "digital" ? "#17324b" : variant === "fpga" ? "#202c4b" : "#16372d";
    roundRect(context, box.x, box.y, box.width, box.height, 5);
    context.fill();
    context.strokeStyle = "rgba(188, 166, 105, 0.4)";
    context.lineWidth = 1;
    context.stroke();
    context.strokeStyle = variant === "digital" ? "rgba(102, 169, 214, 0.58)" : "rgba(203, 160, 70, 0.52)";
    context.beginPath();
    for (let index = 0; index < 6; index += 1) {
      const y = box.y + 10 + index * (box.height - 20) / 5;
      context.moveTo(box.x + 8, y);
      context.lineTo(box.x + box.width * 0.45, y);
      context.lineTo(box.x + box.width * 0.55, y + 9);
      context.lineTo(box.x + box.width - 8, y + 9);
    }
    context.stroke();
    if (variant === "fpga") {
      context.fillStyle = "#0a111c";
      roundRect(context, box.x + box.width * 0.36, box.y + box.height * 0.23, box.width * 0.28, box.height * 0.48, 2);
      context.fill();
      context.strokeStyle = "rgba(176, 195, 230, 0.48)";
      context.stroke();
      for (let index = 0; index < 8; index += 1) {
        context.fillStyle = "rgba(205, 185, 119, 0.58)";
        context.fillRect(box.x + box.width * 0.72, box.y + 8 + index * (box.height - 16) / 7, 5, 3);
      }
    } else if (variant === "digital") {
      context.fillStyle = "#101b24";
      for (let row = 0; row < 3; row += 1) {
        for (let col = 0; col < 5; col += 1) {
          context.fillRect(box.x + 10 + col * 9, box.y + 10 + row * 11, 6, 5);
        }
      }
      context.fillStyle = "rgba(91, 208, 158, 0.9)";
      for (let index = 0; index < 4; index += 1) {
        context.beginPath();
        context.arc(box.x + box.width * 0.75, box.y + 12 + index * 10, 2, 0, Math.PI * 2);
        context.fill();
      }
    } else {
      context.fillStyle = "#0d1714";
      roundRect(context, box.x + box.width * 0.38, box.y + box.height * 0.25, box.width * 0.22, box.height * 0.45, 2);
      context.fill();
      context.strokeStyle = "rgba(216, 181, 104, 0.62)";
      context.beginPath();
      context.arc(box.x + box.width * 0.74, box.y + box.height * 0.35, 6, 0, Math.PI * 2);
      context.stroke();
      context.beginPath();
      context.moveTo(box.x + box.width * 0.7, box.y + box.height * 0.62);
      context.lineTo(box.x + box.width * 0.78, box.y + box.height * 0.62);
      context.moveTo(box.x + box.width * 0.74, box.y + box.height * 0.56);
      context.lineTo(box.x + box.width * 0.74, box.y + box.height * 0.68);
      context.stroke();
    }
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

  function drawGenericInstrument(context, box, device, time) {
    context.fillStyle = bodyGradient(context, box);
    roundRect(context, box.x, box.y, box.width, box.height, 6);
    context.fill();
    context.strokeStyle = "rgba(145, 171, 157, 0.32)";
    context.lineWidth = 1;
    context.stroke();
    const compact = Math.min(box.width, box.height);
    context.fillStyle = "rgba(7, 16, 14, 0.82)";
    roundRect(
      context,
      box.x + box.width * 0.14,
      box.y + box.height * 0.14,
      box.width * 0.72,
      box.height * 0.56,
      Math.min(5, compact * 0.12)
    );
    context.fill();
    context.fillStyle = device.accent || state.palette.accent;
    context.globalAlpha = 0.72 + Math.sin(time * 0.002 + box.x) * 0.08;
    context.font = `${Math.max(7, Math.min(13, compact * 0.28))}px "Cascadia Mono", monospace`;
    context.textAlign = "center";
    context.fillText(device.symbol || "•", box.x + box.width / 2, box.y + box.height * 0.53);
    context.globalAlpha = 1;
    context.strokeStyle = "rgba(101, 171, 150, 0.45)";
    context.beginPath();
    context.moveTo(box.x + box.width * 0.18, box.y + box.height * 0.72);
    context.lineTo(box.x + box.width * 0.82, box.y + box.height * 0.72);
    context.stroke();
    context.fillStyle = "rgba(117, 196, 167, 0.7)";
    context.beginPath();
    context.arc(box.x + box.width * 0.82, box.y + box.height * 0.82, Math.max(2, compact * 0.055), 0, Math.PI * 2);
    context.fill();
  }

  function drawDevice(context, device, time, config) {
    const box = bounds(device);
    context.save();
    context.shadowColor = "rgba(0,0,0,0.35)";
    context.shadowBlur = 12;
    context.shadowOffsetY = 5;
    switch (device.type) {
      case "laser": drawLaser(context, box, time, device); break;
      case "mirror": drawMirror(context, box); break;
      case "splitter": drawSplitter(context, box); break;
      case "lens": drawLens(context, box); break;
      case "sample": drawSample(context, box, time, device); break;
      case "screen": drawScreen(context, box, time, config); break;
      case "detector": drawDetector(context, box, time); break;
      case "power": drawPower(context, box); break;
      case "signal": drawSignal(context, box, time); break;
      case "board": drawBoard(context, box, device); break;
      case "probe": drawProbe(context, box); break;
      case "scope": drawScope(context, box, time, state.metrics.frequency); break;
      case "computer": drawComputer(context, box, time); break;
      default: drawGenericInstrument(context, box, device, time); break;
    }
    context.restore();
    if (device.id === state.selected) {
      context.save();
      context.strokeStyle = state.palette.accent;
      context.lineWidth = 1.4;
      context.setLineDash([3, 4]);
      roundRect(context, box.x - 5, box.y - 5, box.width + 10, box.height + 10, 8);
      context.stroke();
      const ports = PORT_PROFILES[device.id] || PORT_PROFILES[device.type] || ["MEASURE", "GND"];
      ports.slice(0, 4).forEach((port, index) => {
        const x = box.x + box.width * ((index + 1) / (Math.min(4, ports.length) + 1));
        const y = box.y + box.height + 5;
        context.fillStyle = "#0b1210";
        context.strokeStyle = state.palette.accent;
        context.lineWidth = 1;
        context.beginPath();
        context.arc(x, y, 2.8, 0, Math.PI * 2);
        context.fill();
        context.stroke();
      });
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
    const nextPresetId = presetForExperiment(config);
    if (nextPresetId !== state.presetId || config.experimentId !== state.experimentId || !state.preset) {
      applyPreset(nextPresetId, config);
    }
    state.metrics = calculateMetrics(config);
    const context = state.context;
    drawBackground(context, time);
    drawCables(context, time);
    drawOpticalPath(context, time, config);
    state.devices.forEach((device) => drawDevice(context, device, time, config));

    context.save();
    const titleWidth = Math.min(360, state.width * 0.56);
    context.fillStyle = "rgba(6, 11, 10, 0.76)";
    roundRect(context, 14, 13, titleWidth, 27, 7);
    context.fill();
    context.strokeStyle = "rgba(193, 221, 202, 0.12)";
    context.stroke();
    context.fillStyle = "#c9a66d";
    context.font = '8px "Cascadia Mono", monospace';
    const sceneTitle = `${config.experimentName || state.preset.name} · ${state.devices.length} 件设备`;
    context.fillText(fitText(context, sceneTitle, titleWidth - 20), 24, 30);

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
    getSelected: () => state.selected,
    getPorts(deviceId) {
      const device = deviceById(deviceId);
      return [...(PORT_PROFILES[device?.id] || PORT_PROFILES[device?.type] || ["MEASURE", "GND"])];
    },
    getPreset: () => state.preset ? {
      id: state.presetId,
      name: state.preset.name,
      experimentId: state.experimentId,
      devices: [...state.preset.devices],
      standards: state.standardSummary,
      equipmentTraits: [...state.equipmentTraits],
      connections: state.connectionSpecs.map((item) => ({ ...item }))
    } : null,
    resolvePreset(experiment = {}) {
      const presetId = presetForExperiment({
        experimentName: experiment.name,
        sim: experiment.sim
      });
      const preset = PRESETS[presetId] || PRESETS.measurement;
      const seed = hashString(experiment.id || experiment.name || presetId);
      const devices = arrangeDevices(preset.devices, seed);
      const connections = createConnectionSpecs(preset, presetId, seed);
      const equipmentTraits = decorateExperimentDevices(devices, {
        experimentId: experiment.id,
        experimentName: experiment.name,
        primaryLabel: experiment.primaryLabel || "",
        primaryUnit: experiment.primaryUnit || "",
        secondaryLabel: experiment.secondaryLabel || "",
        secondaryUnit: experiment.secondaryUnit || ""
      }, seed);
      return {
        id: presetId,
        name: preset.name,
        devices: devices.map((device) => ({ ...device })),
        optics: preset.optics.map((path) => [...path]),
        cables: preset.cables.map((path) => [...path]),
        standards: connections.summary,
        equipmentTraits,
        palette: PALETTES[seed % PALETTES.length],
        connections: connections.cableSpecs.map((item) => ({ ...item })),
        fingerprint: `${experiment.id}|${presetId}|${devices.map((device) =>
          `${device.id}:${device.label}:${device.variant || "default"}:${device.x.toFixed(5)}:${device.y.toFixed(5)}`
        ).join(",")}|${connections.summary}|${equipmentTraits.join(";")}`
      };
    }
  };
})();
