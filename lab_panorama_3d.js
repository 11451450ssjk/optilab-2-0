"use strict";

(function () {
  const $ = (selector) => document.querySelector(selector);
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const state = {
    canvas: null,
    active: false,
    loading: false,
    ready: false,
    three: null,
    renderer: null,
    scene: null,
    camera: null,
    raycaster: null,
    pointer: null,
    dragPlane: null,
    dragGroup: null,
    orbit: null,
    deviceGroups: new Map(),
    proceduralGroups: new Map(),
    initialPositions: new Map(),
    dynamicTextures: [],
    selectionHelper: null,
    cableGroup: null,
    beamGroup: null,
    config: null,
    presetInfo: null,
    experimentId: "",
    selectedId: "",
    hoveredId: "",
    inspectorId: "",
    dragStart: null,
    dragMoved: false,
    showCables: true,
    metrics: { alignment: 0, connectivity: 0, power: 0, snr: 0, frequency: 0 },
    lastTextureUpdate: 0,
    animatedObjects: [],
    stepMarker: null,
    processSteps: [],
    processStep: 0,
    processCollapsed: false,
    autoTour: false,
    autoTourAt: 0,
    gltfLoader: null,
    gltfExporter: null,
    modelAssetStatus: "正在检查模型资产",
    cameraState: {
      radius: 8.35,
      theta: Math.PI * 0.38,
      phi: Math.PI * 0.365,
      viewMode: "overview",
      target: { x: 0, y: 0.42, z: 0 }
    }
  };

  function formatNumber(value, digits = 2) {
    if (!Number.isFinite(value)) return "—";
    if (Math.abs(value) >= 1000) return `${(value / 1000).toFixed(digits)}k`;
    return Number(value).toFixed(digits).replace(/\.?0+$/, "");
  }

  function colorArrayToHex(color = [216, 172, 95]) {
    return `#${color.map((value) => clamp(Math.round(value), 0, 255).toString(16).padStart(2, "0")).join("")}`;
  }

  function indexColor(color, lightness = 0, saturation = 0) {
    return new state.three.Color(color).offsetHSL(0, saturation, lightness);
  }

  async function loadThree() {
    if (state.ready) return;
    state.loading = true;
    const loading = $("#lab-3d-loading");
    if (loading) loading.hidden = false;
    const THREE = await import(new URL("./vendor/three/three.module.min.js", document.baseURI).href);
    state.three = THREE;
    const renderer = new THREE.WebGLRenderer({
      canvas: state.canvas,
      antialias: true,
      alpha: false,
      powerPreference: "high-performance"
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x07100f, 1);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    state.renderer = renderer;
    state.scene = new THREE.Scene();
    state.scene.background = new THREE.Color(0x07100f);
    state.scene.fog = new THREE.Fog(0x07100f, 9, 22);
    state.camera = new THREE.PerspectiveCamera(38, 1, 0.1, 80);
    state.raycaster = new THREE.Raycaster();
    state.pointer = new THREE.Vector2();
    state.dragPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -0.32);
    buildEnvironment();
    state.stepMarker = makeStepMarker();
    state.scene.add(state.stepMarker);
    state.ready = true;
    state.loading = false;
    if (loading) loading.hidden = true;
  }

  function makeTableTexture() {
    const THREE = state.three;
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 320;
    const context = canvas.getContext("2d");
    context.fillStyle = "#253a32";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.strokeStyle = "rgba(153, 170, 158, 0.14)";
    context.lineWidth = 1;
    for (let x = 0; x <= canvas.width; x += 32) {
      context.beginPath();
      context.moveTo(x, 0);
      context.lineTo(x, canvas.height);
      context.stroke();
    }
    for (let y = 0; y <= canvas.height; y += 32) {
      context.beginPath();
      context.moveTo(0, y);
      context.lineTo(canvas.width, y);
      context.stroke();
    }
    for (let index = 0; index < 180; index += 1) {
      const alpha = 0.025 + (index % 7) * 0.008;
      context.fillStyle = `rgba(215, 228, 218, ${alpha})`;
      context.fillRect((index * 83) % 512, (index * 47) % 320, 1.2, 1.2);
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(2.2, 1.4);
    texture.anisotropy = Math.min(8, state.renderer.capabilities.getMaxAnisotropy());
    return texture;
  }

  function buildEnvironment() {
    const THREE = state.three;
    const scene = state.scene;
    const ambient = new THREE.HemisphereLight(0xbad9ca, 0x101815, 1.55);
    scene.add(ambient);
    const key = new THREE.DirectionalLight(0xffe1a8, 3.4);
    key.position.set(-4, 8, 6);
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    key.shadow.camera.left = -7;
    key.shadow.camera.right = 7;
    key.shadow.camera.top = 6;
    key.shadow.camera.bottom = -6;
    scene.add(key);
    const fill = new THREE.PointLight(0x77c3ac, 18, 14, 1.7);
    fill.position.set(5, 4, 2);
    scene.add(fill);
    const rim = new THREE.SpotLight(0x86a8ff, 28, 22, Math.PI * 0.22, 0.72, 1.4);
    rim.position.set(6, 7, -7);
    rim.target.position.set(0, 0, 0);
    scene.add(rim, rim.target);

    const roomFloor = new THREE.Mesh(
      new THREE.PlaneGeometry(30, 24),
      new THREE.MeshStandardMaterial({ color: 0x080f0e, roughness: 0.95 })
    );
    roomFloor.rotation.x = -Math.PI / 2;
    roomFloor.position.y = -0.45;
    roomFloor.receiveShadow = true;
    scene.add(roomFloor);

    const table = new THREE.Mesh(
      new THREE.BoxGeometry(10.4, 0.3, 6.2),
      new THREE.MeshStandardMaterial({
        color: 0x14201e,
        roughness: 0.68,
        metalness: 0.18
      })
    );
    table.position.y = -0.17;
    table.receiveShadow = true;
    scene.add(table);

    const surfaceTexture = makeTableTexture();
    const tableTop = new THREE.Mesh(
      new THREE.BoxGeometry(10, 0.045, 5.8),
      new THREE.MeshStandardMaterial({
        color: 0xffffff,
        map: surfaceTexture,
        roughness: 0.76,
        metalness: 0.08
      })
    );
    tableTop.position.y = 0.0;
    tableTop.receiveShadow = true;
    scene.add(tableTop);

    const grid = new THREE.GridHelper(10, 24, 0x52645d, 0x24302c);
    grid.position.y = 0.026;
    grid.material.opacity = 0.28;
    grid.material.transparent = true;
    scene.add(grid);

    const edgeMaterial = new THREE.MeshStandardMaterial({
      color: 0x8b8069,
      metalness: 0.55,
      roughness: 0.36
    });
    const edgeGeometry = new THREE.BoxGeometry(10.5, 0.055, 0.055);
    [-2.95, 2.95].forEach((z) => {
      const edge = new THREE.Mesh(edgeGeometry, edgeMaterial);
      edge.position.set(0, 0.055, z);
      edge.castShadow = true;
      scene.add(edge);
    });

    for (let x = -4.8; x <= 4.8; x += 1.2) {
      const rail = new THREE.Mesh(
        new THREE.BoxGeometry(0.04, 0.045, 5.4),
        new THREE.MeshStandardMaterial({ color: 0x45534f, metalness: 0.6, roughness: 0.42 })
      );
      rail.position.set(x, 0.045, 0);
      scene.add(rail);
    }

    const backWall = new THREE.Mesh(
      new THREE.PlaneGeometry(18, 8),
      new THREE.MeshStandardMaterial({ color: 0x111c19, roughness: 1 })
    );
    backWall.position.set(0, 3.2, -6.2);
    backWall.receiveShadow = true;
    scene.add(backWall);
    for (let index = -4; index <= 4; index += 1) {
      const seam = new THREE.Mesh(
        new THREE.BoxGeometry(0.018, 6.8, 0.02),
        new THREE.MeshBasicMaterial({ color: 0x1f2b27, transparent: true, opacity: 0.65 })
      );
      seam.position.set(index * 2, 3.1, -6.15);
      scene.add(seam);
    }
    const wallStripe = new THREE.Mesh(
      new THREE.BoxGeometry(18, 0.035, 0.03),
      new THREE.MeshBasicMaterial({ color: 0x835f31, transparent: true, opacity: 0.34 })
    );
    wallStripe.position.set(0, 2.2, -6.12);
    scene.add(wallStripe);
    const sign = new THREE.Mesh(
      new THREE.PlaneGeometry(2.6, 0.88),
      new THREE.MeshStandardMaterial({
        color: 0x17241f,
        emissive: 0x24382f,
        emissiveIntensity: 0.24,
        roughness: 0.74
      })
    );
    sign.position.set(-4.7, 2.62, -6.08);
    scene.add(sign);
  }

  function makeStepMarker() {
    const THREE = state.three;
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 128;
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    const material = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      depthTest: false,
      depthWrite: false
    });
    const sprite = new THREE.Sprite(material);
    sprite.scale.set(0.9, 0.45, 1);
    sprite.visible = false;
    sprite.userData.canvas = canvas;
    sprite.userData.context = canvas.getContext("2d");
    sprite.userData.texture = texture;
    return sprite;
  }

  function drawStepMarker(text = "01") {
    const marker = state.stepMarker;
    if (!marker) return;
    const { canvas, context, texture } = marker.userData;
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "rgba(8, 15, 13, 0.9)";
    context.beginPath();
    context.roundRect(18, 12, 220, 104, 26);
    context.fill();
    context.strokeStyle = "#e2bd78";
    context.lineWidth = 3;
    context.stroke();
    context.fillStyle = "#f2cf8a";
    context.font = '700 46px "Cascadia Mono", monospace';
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(String(text).padStart(2, "0"), 128, 56);
    context.fillStyle = "#96a79d";
    context.font = '18px "Microsoft YaHei UI", sans-serif';
    context.fillText("当前步骤", 128, 91);
    texture.needsUpdate = true;
  }

  function makeLabelSprite(text, accent = "#d9b474") {
    const THREE = state.three;
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 96;
    const context = canvas.getContext("2d");
    context.fillStyle = "rgba(6, 12, 11, 0.82)";
    context.beginPath();
    context.roundRect(2, 2, 508, 92, 20);
    context.fill();
    context.strokeStyle = accent;
    context.lineWidth = 2;
    context.stroke();
    context.fillStyle = "#e3ded2";
    context.font = '30px "Microsoft YaHei UI", sans-serif';
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(String(text || "").slice(0, 22), 256, 48);
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    const material = new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false });
    const sprite = new THREE.Sprite(material);
    sprite.scale.set(1.65, 0.31, 1);
    return sprite;
  }

  function makePanelTexture(device, config) {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 256;
    const context = canvas.getContext("2d");
    const texture = new state.three.CanvasTexture(canvas);
    texture.colorSpace = state.three.SRGBColorSpace;
    state.dynamicTextures.push({ canvas, context, texture, device, type: device.type });
    return texture;
  }

  function liveDisplayData(device, config = {}) {
    const primary = Number(config.primary);
    const secondary = Number(config.secondary);
    const primaryUnit = config.primaryUnit || "";
    const secondaryUnit = config.secondaryUnit || "";
    const safePrimary = Number.isFinite(primary) ? primary : 0;
    const safeSecondary = Number.isFinite(secondary) ? secondary : 0;
    const experimentName = String(config.experiment?.name || state.presetInfo?.name || "实验");
    const unified = window.OptilabPhysics?.calculate(
      config.experiment || { sim: "measurement" },
      safePrimary,
      safeSecondary
    );
    const unitText = (value, unit, digits = 2) => `${formatNumber(value, digits)}${unit ? ` ${unit}` : ""}`;
    const primaryIsVoltage = /v(olt)?|伏/i.test(`${config.primaryLabel || ""} ${primaryUnit}`);
    const secondaryIsVoltage = /v(olt)?|伏/i.test(`${config.secondaryLabel || ""} ${secondaryUnit}`);
    const primaryIsCurrent = /a(mp|mpere)?|安/i.test(`${config.primaryLabel || ""} ${primaryUnit}`);
    const secondaryIsCurrent = /a(mp|mpere)?|安/i.test(`${config.secondaryLabel || ""} ${secondaryUnit}`);
    const frequencyFromConfig = /hz/i.test(primaryUnit) ? safePrimary :
      /hz/i.test(secondaryUnit) ? safeSecondary :
        /(^|\s)(ms|s)(\s|$)/i.test(primaryUnit) && safePrimary > 0 ? 1000 / Math.abs(safePrimary) :
          state.metrics.frequency;
    const frequency = clamp(Math.abs(frequencyFromConfig) || 1000, 0.01, 250000);
    const wavelength = /nm/i.test(primaryUnit) ? Math.abs(safePrimary) :
      device.variant === "hene" ? 632.8 :
        clamp(430 + Math.abs(safePrimary % 360), 405, 780);
    const supplyVoltage = primaryIsVoltage ? Math.abs(safePrimary) :
      secondaryIsVoltage ? Math.abs(safeSecondary) :
        clamp(5 + Math.abs(safePrimary % 24), 0, 30);
    const supplyCurrent = primaryIsCurrent ? Math.abs(safePrimary) :
      secondaryIsCurrent ? Math.abs(safeSecondary) :
        clamp(state.metrics.power / Math.max(supplyVoltage, 1), 0.01, 5);
    const scopeFrequency = clamp(frequency, 10, 200000);
    const scopeTimebase = scopeFrequency >= 1e6 ? "100 ns/div" :
      scopeFrequency >= 1e3 ? "100 µs/div" : "10 ms/div";
    const scopeAmplitude = /v/i.test(primaryUnit) ? Math.abs(safePrimary) :
      /v/i.test(secondaryUnit) ? Math.abs(safeSecondary) :
        clamp(0.2 + Math.abs(safeSecondary % 4) * 0.45, 0.1, 10);
    const distanceValue = /cm/i.test(primaryUnit) ? Math.abs(safePrimary) / 100 :
      /cm/i.test(secondaryUnit) ? Math.abs(safeSecondary) / 100 :
        /(^|\s)m(\s|$)/i.test(primaryUnit) ? Math.abs(safePrimary) :
          /(^|\s)m(\s|$)/i.test(secondaryUnit) ? Math.abs(safeSecondary) : 0.428;
    const distance = clamp(distanceValue, 0.02, 5);
    const temperatureValue = /°c|℃/i.test(primaryUnit) ? safePrimary :
      /°c|℃/i.test(secondaryUnit) ? safeSecondary : 25.0;
    const temperature = clamp(temperatureValue, -20, 150);
    const peakWavelength = /nm/i.test(primaryUnit) ? clamp(Math.abs(safePrimary), 200, 1100) : 546.1;
    const exposureMs = /(曝光|积分)/.test(config.primaryLabel || "") ? Math.abs(safePrimary) :
      clamp(10, 0.1, 100);
    const gain = /(增益)/.test(config.primaryLabel || "") ? Math.abs(safePrimary) : 1;
    return {
      experimentName,
      primary: safePrimary,
      secondary: safeSecondary,
      primaryLabel: config.primaryLabel || "主参数",
      secondaryLabel: config.secondaryLabel || "响应量",
      primaryText: unitText(safePrimary, primaryUnit),
      secondaryText: unitText(safeSecondary, secondaryUnit),
      frequencyText: unitText(frequency, "Hz", frequency >= 1000 ? 1 : 2),
      wavelengthText: unitText(wavelength, "nm", 1),
      powerText: `${formatNumber(state.metrics.power, state.metrics.power < 1 ? 3 : 2)} ${state.metrics.powerUnit || "mW"}`,
      voltageText: unitText(supplyVoltage, "V", 2),
      currentText: unitText(supplyCurrent, "A", supplyCurrent < 1 ? 3 : 2),
      supplyVoltage,
      supplyCurrent,
      scopeFrequencyText: unitText(scopeFrequency, "Hz", 1),
      scopeTimebase,
      scopeAmplitudeText: unitText(scopeAmplitude, "Vpp", 2),
      distanceText: unitText(distance, "m", 3),
      temperatureText: unitText(temperature, "°C", 1),
      peakWavelengthText: unitText(peakWavelength, "nm", 1),
      exposureText: unitText(exposureMs, "ms", exposureMs < 1 ? 2 : 1),
      gainText: `${formatNumber(gain, 1)}×`,
      snrText: unitText(state.metrics.snr, "dB", 1),
      unified,
      unifiedValue: unified?.value || "按实验关系计算",
      engineVersion: unified?.engineVersion || "local"
    };
  }

  function drawPanelTexture(entry, time, config) {
    const { canvas, context, device } = entry;
    const kind = deviceKind(device);
    const display = liveDisplayData(device, config);
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "#07110e";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.strokeStyle = "rgba(105, 189, 154, 0.18)";
    context.lineWidth = 1;
    for (let index = 1; index < 5; index += 1) {
      context.beginPath();
      context.moveTo(0, index * 48);
      context.lineTo(canvas.width, index * 48);
      context.stroke();
    }
    if (kind === "scope" || kind === "logic-analyzer") {
      context.strokeStyle = "#6de2a0";
      context.lineWidth = 3;
      context.beginPath();
      const cycles = clamp(display.scopeFrequency / 300, 1, 7);
      for (let x = 12; x < canvas.width - 12; x += 2) {
        const phase = ((x - 12) / (canvas.width - 24)) * Math.PI * 2 * cycles;
        const y = 128 + Math.sin(phase + time * 0.002) * 60 * state.metrics.connectivity;
        if (x === 12) context.moveTo(x, y);
        else context.lineTo(x, y);
      }
      context.stroke();
      if (kind === "logic-analyzer") {
        const traces = ["#79aef2", "#e4be76", "#de8b83", "#99d7a4"];
        traces.forEach((color, channel) => {
          context.strokeStyle = color;
          context.lineWidth = 2;
          context.beginPath();
          for (let step = 0; step < 15; step += 1) {
            const x = 18 + step * 33;
            const high = ((step + channel * 3 + Math.floor(time / 520)) % 4) > 1;
            const y = 48 + channel * 46 + (high ? 0 : 24);
            if (step === 0) context.moveTo(x, y);
            else context.lineTo(x, y);
          }
          context.stroke();
        });
        context.fillStyle = "#8fc8af";
        context.font = '18px "Cascadia Mono", monospace';
        context.fillText("16 CH  100 MSa/s", 18, 24);
        context.fillText("TH 1.65 V   AUTO", 338, 24);
      } else {
        context.fillStyle = "#8fc8af";
        context.font = '18px "Cascadia Mono", monospace';
        context.fillText("CH1  1.00 V/div", 14, 24);
        context.fillText("TRIG'D  AUTO", 356, 24);
        context.fillText(display.scopeFrequencyText, 14, 244);
        context.fillText(display.scopeTimebase, 370, 244);
      }
    } else if (kind === "screen") {
      const phase = Math.abs(Number(config.secondary) || 0) * 2.4;
      for (let row = 0; row < 6; row += 1) {
        context.strokeStyle = `rgba(238, 196, 119, ${0.35 + state.metrics.alignment * 0.5})`;
        context.lineWidth = 4;
        context.beginPath();
        const y0 = 30 + row * 38;
        for (let x = 8; x < canvas.width - 8; x += 3) {
          const local = (x - 8) / (canvas.width - 16);
          const intensity = 0.5 + 0.5 * Math.cos(local * Math.PI * 10 + phase);
          const y = y0 + Math.sin(local * Math.PI * 2 + time * 0.001) * intensity * 4;
          if (x === 8) context.moveTo(x, y);
          else context.lineTo(x, y);
        }
        context.stroke();
      }
    } else if (kind === "laser") {
      context.fillStyle = colorArrayToHex(config.beamColor);
      context.font = 'bold 48px "Cascadia Mono", monospace';
      context.textAlign = "center";
      context.fillText(device.variant === "hene" ? "He-Ne" : device.symbol || "LASER", 256, 112);
      context.font = '24px "Cascadia Mono", monospace';
      context.fillText(`${display.wavelengthText}  ·  ${display.powerText}`, 256, 166);
    } else if (kind === "multimeter") {
      context.fillStyle = "#a6e5c0";
      context.font = 'bold 78px "Cascadia Mono", monospace';
      context.textAlign = "right";
      context.fillText(formatNumber(display.primary, Math.abs(display.primary) < 10 ? 3 : 2), 462, 120);
      context.font = 'bold 28px "Cascadia Mono", monospace';
      context.textAlign = "left";
      context.fillText(`${display.primaryLabel}  ${config.primaryUnit || ""}`, 24, 62);
      context.fillStyle = "#7f9e90";
      context.font = '22px "Cascadia Mono", monospace';
      context.fillText("AUTO  DC  TRUE RMS", 24, 206);
      context.fillText(display.secondaryText, 24, 236);
    } else if (kind === "power-supply") {
      context.fillStyle = "#8be4b3";
      context.font = 'bold 66px "Cascadia Mono", monospace';
      context.textAlign = "left";
      context.fillText(formatNumber(display.supplyVoltage, 2), 22, 100);
      context.fillText(formatNumber(display.supplyCurrent, 2), 274, 100);
      context.fillStyle = "#c8d6cf";
      context.font = '21px "Cascadia Mono", monospace';
      context.fillText("VOLTAGE  V", 24, 132);
      context.fillText("CURRENT  A", 276, 132);
      context.fillStyle = "#e2bc75";
      context.fillText("CV", 380, 222);
      context.fillStyle = "#71d39d";
      context.fillText("OUTPUT ON", 24, 222);
    } else if (kind === "generator") {
      context.strokeStyle = "#78cbe0";
      context.lineWidth = 4;
      context.beginPath();
      for (let x = 18; x < 494; x += 2) {
        const y = 105 + Math.sin(x * 0.065 + time * 0.003) * 48;
        if (x === 18) context.moveTo(x, y);
        else context.lineTo(x, y);
      }
      context.stroke();
      context.fillStyle = "#d9c593";
      context.font = 'bold 26px "Cascadia Mono", monospace';
      context.fillText(display.frequencyText, 24, 206);
      context.fillText(`SINE  ${display.scopeAmplitudeText}`, 272, 206);
    } else if (kind === "lcd-module") {
      context.fillStyle = "#9ad77f";
      context.fillRect(18, 55, 476, 145);
      context.fillStyle = "#17321f";
      context.font = 'bold 38px "Cascadia Mono", monospace';
      context.fillText(`DIST  ${display.distanceText}`, 40, 112);
      context.fillText("STATE READY", 40, 166);
    } else if (kind === "spectrometer") {
      const gradient = context.createLinearGradient(20, 0, 492, 0);
      gradient.addColorStop(0, "#5d6ed8");
      gradient.addColorStop(0.28, "#61c1d0");
      gradient.addColorStop(0.5, "#7eda8a");
      gradient.addColorStop(0.7, "#e2cf67");
      gradient.addColorStop(1, "#d8675e");
      for (let index = 0; index < 42; index += 1) {
        const height = 35 + Math.abs(Math.sin(index * 0.67 + time * 0.0004)) * 92;
        context.globalAlpha = 0.45 + (index % 5) * 0.1;
        context.fillStyle = gradient;
        context.fillRect(22 + index * 11, 220 - height, 6, height);
      }
      context.globalAlpha = 1;
      context.fillStyle = "#c8d5cd";
      context.font = '20px "Cascadia Mono", monospace';
      context.fillText(`${display.peakWavelengthText}  ·  RES 0.2 nm`, 18, 24);
      context.fillText("400                          WAVELENGTH / nm                         1000", 18, 244);
    } else if (kind === "computer") {
      context.strokeStyle = "#70d3a0";
      context.lineWidth = 3;
      context.beginPath();
      for (let x = 25; x < 490; x += 4) {
        const y = 184 - Math.max(0, Math.sin((x - 25) * 0.018)) * 104 - (x - 25) * 0.06;
        if (x === 25) context.moveTo(x, y);
        else context.lineTo(x, y);
      }
      context.stroke();
      context.fillStyle = "#b7cac0";
      context.font = '22px "Cascadia Mono", monospace';
      context.fillText(`${display.experimentName.slice(0, 24)} · LIVE`, 22, 32);
      context.font = '18px "Cascadia Mono", monospace';
      context.fillText(`${display.primaryLabel}: ${display.primaryText}`, 22, 220);
      context.fillText(`${display.secondaryLabel}: ${display.secondaryText}`, 22, 244);
    } else if (kind === "camera" || kind === "thermal-camera") {
      for (let row = 0; row < 5; row += 1) {
        for (let column = 0; column < 8; column += 1) {
          const level = kind === "thermal-camera"
            ? 90 + ((row * 37 + column * 23) % 130)
            : 130 + ((row + column) % 2) * 70;
          context.fillStyle = kind === "thermal-camera"
            ? `rgb(${level + 80},${Math.max(25, level - 60)},40)`
            : `rgb(${level},${level},${level})`;
          context.fillRect(38 + column * 55, 38 + row * 40, 52, 37);
        }
      }
      context.fillStyle = "#e5d2a6";
      context.font = '20px "Cascadia Mono", monospace';
      context.fillText(kind === "thermal-camera"
        ? `${display.temperatureText}  ·  ε 0.95`
        : `${display.exposureText}  ·  GAIN ${display.gainText}`, 20, 238);
    } else if (kind === "bioamp") {
      context.strokeStyle = "#7ce0a2";
      context.lineWidth = 3;
      context.beginPath();
      for (let x = 12; x < 500; x += 2) {
        const beat = Math.exp(-Math.pow(((x % 125) - 34) / 13, 2));
        const y = 138 - beat * 82 + Math.sin(x * 0.07) * 3;
        if (x === 12) context.moveTo(x, y);
        else context.lineTo(x, y);
      }
      context.stroke();
      context.fillStyle = "#d8c693";
      context.font = '24px "Cascadia Mono", monospace';
      context.fillText(`ECG  ·  GAIN 1000  ·  CMRR 110 dB`, 20, 32);
      context.font = '18px "Cascadia Mono", monospace';
      context.fillText(`${display.primaryLabel}: ${display.primaryText}`, 20, 238);
    } else if (kind === "power-meter") {
      context.fillStyle = "#94e7b8";
      context.textAlign = "right";
      context.font = 'bold 72px "Cascadia Mono", monospace';
      context.fillText(formatNumber(state.metrics.power, state.metrics.power < 1 ? 3 : 2), 470, 128);
      context.font = '26px "Cascadia Mono", monospace';
      context.textAlign = "left";
      context.fillText(state.metrics.powerUnit || "mW", 24, 82);
      context.fillText(display.wavelengthText, 24, 218);
      context.fillStyle = "#7f9e90";
      context.font = '19px "Cascadia Mono", monospace';
      context.fillText("RANGE 10 mW  ·  HOLD OFF", 160, 218);
    } else {
      context.strokeStyle = device.accent || "#9cc6b2";
      context.lineWidth = 4;
      context.beginPath();
      for (let x = 18; x < canvas.width - 18; x += 5) {
        const y = 128 + Math.sin(x * 0.04 + time * 0.002) * 26;
        if (x === 18) context.moveTo(x, y);
        else context.lineTo(x, y);
      }
      context.stroke();
      context.fillStyle = device.accent || "#d9b474";
      context.font = 'bold 52px "Cascadia Mono", monospace';
      context.textAlign = "center";
      context.fillText(device.symbol || "LAB", 256, 220);
    }
    entry.texture.needsUpdate = true;
  }

  function addDeviceMesh(group, mesh, device) {
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);
    mesh.userData.deviceId = device.id;
    return mesh;
  }

  function addPart(group, device, geometry, material, position = [0, 0, 0], rotation = [0, 0, 0]) {
    const mesh = addDeviceMesh(group, new state.three.Mesh(geometry, material), device);
    mesh.position.set(...position);
    mesh.rotation.set(...rotation);
    return mesh;
  }

  function beveledBoxGeometry(width, height, depth, radius = 0.035) {
    const THREE = state.three;
    const x = -width / 2;
    const y = -height / 2;
    const shape = new THREE.Shape();
    shape.moveTo(x + radius, y);
    shape.lineTo(x + width - radius, y);
    shape.quadraticCurveTo(x + width, y, x + width, y + radius);
    shape.lineTo(x + width, y + height - radius);
    shape.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    shape.lineTo(x + radius, y + height);
    shape.quadraticCurveTo(x, y + height, x, y + height - radius);
    shape.lineTo(x, y + radius);
    shape.quadraticCurveTo(x, y, x + radius, y);
    const geometry = new THREE.ExtrudeGeometry(shape, {
      depth,
      steps: 1,
      bevelEnabled: true,
      bevelSegments: 2,
      bevelSize: Math.min(radius * 0.35, 0.018),
      bevelThickness: Math.min(radius * 0.35, 0.018),
      curveSegments: 5
    });
    geometry.center();
    return geometry;
  }

  const DEVICE_KIND_LABELS = {
    laser: "激光器",
    mirror: "精密镜架",
    splitter: "分束器",
    lens: "光学透镜",
    screen: "观察屏",
    scope: "数字示波器",
    computer: "分析工作站",
    "power-meter": "台式光功率计",
    multimeter: "手持数字万用表",
    "power-supply": "直流稳压电源",
    generator: "信号发生器",
    "logic-analyzer": "逻辑分析仪",
    breadboard: "实验面包板",
    "mcu-board": "嵌入式开发板",
    "sensor-module": "传感器模块",
    "lcd-module": "字符显示模块",
    "acoustic-transducer": "声光换能器",
    alarm: "声光报警器",
    keypad: "矩阵键盘",
    daq: "数据采集卡",
    load: "可调电子负载",
    robot: "移动机器人平台",
    actuator: "执行器",
    "led-strip": "LED 灯带",
    "optical-source": "宽带光源",
    spectrometer: "光谱仪",
    prism: "色散棱镜",
    grating: "光栅",
    slit: "狭缝组件",
    polarizer: "偏振器",
    camera: "科学相机",
    "thermal-camera": "红外热像仪",
    "beam-profiler": "光束轮廓仪",
    detector: "光电探测器",
    "fiber-spool": "光纤盘",
    "fiber-coupler": "光纤耦合器",
    "optical-transceiver": "光收发模块",
    "diode-fixture": "二极管测试夹具",
    "millikan-chamber": "密立根油滴室",
    microscope: "读数显微镜",
    pendulum: "单摆装置",
    vibrator: "机械振动台",
    photogate: "光电门",
    heater: "加热温控装置",
    calorimeter: "量热装置",
    electrode: "生物电电极",
    bioamp: "生物电放大器",
    printer: "数字制造设备",
    caliper: "精密量具",
    magnet: "电磁铁装置",
    sample: "实验样品",
    generic: "实验仪器"
  };

  function deviceKind(device) {
    const token = `${device.id || ""} ${device.label || ""} ${device.variant || ""}`.toLowerCase();
    if (device.type === "laser" || /激光器|激光源/.test(token)) return "laser";
    if (device.type === "mirror" || /反射镜/.test(token)) return "mirror";
    if (device.type === "splitter" || /分束/.test(token)) return "splitter";
    if (device.type === "lens" || /透镜/.test(token)) return "lens";
    if (device.type === "screen" || /观察屏/.test(token)) return "screen";
    if (device.type === "scope" || /示波器/.test(token)) return "scope";
    if (device.type === "board" && /面包板/.test(token)) return "breadboard";
    if (/逻辑分析/.test(token) || /logic-analyzer/.test(token)) return "logic-analyzer";
    if (/万用表/.test(token) || /multimeter/.test(token)) return "multimeter";
    if (/光功率计/.test(token) || /power-meter/.test(token)) return "power-meter";
    if (device.type === "power" || /电源/.test(token) || /hv-supply/.test(token)) return "power-supply";
    if (device.type === "signal" || /信号发生器/.test(token)) return "generator";
    if (device.type === "computer") return "computer";
    if (device.type === "probe") return "probe";
    if (device.type === "detector") return "detector";
    if (/beam-profiler|光束轮廓/.test(token)) return "beam-profiler";
    if (/ir-camera|红外热像/.test(token)) return "thermal-camera";
    if (/camera|cam|相机|热像仪/.test(token)) return "camera";
    if (/fiber-spool|光纤盘/.test(token)) return "fiber-spool";
    if (/fiber-coupler|光纤耦合/.test(token)) return "fiber-coupler";
    if (/optical-tx|optical-rx|光发射|光接收/.test(token)) return "optical-transceiver";
    if (/spectrometer|分光计|光谱仪/.test(token)) return "spectrometer";
    if (/prism|棱镜/.test(token)) return "prism";
    if (/grating|光栅/.test(token)) return "grating";
    if (/slit|单缝|双缝/.test(token)) return "slit";
    if (/analyzer|检偏器/.test(token)) return "polarizer";
    if (/polarizer|起偏器/.test(token)) return "polarizer";
    if (/mcu|arduino|fpga|开发板|嵌入式/.test(token)) return "mcu-board";
    if (/breadboard|面包板/.test(token)) return "breadboard";
    if (/ultrasonic|sensor|传感器|thermometer|温度传感/.test(token)) return "sensor-module";
    if (/lcd|显示模块/.test(token)) return "lcd-module";
    if (/alarm|蜂鸣器/.test(token)) return "alarm";
    if (/keypad|门禁输入/.test(token)) return "keypad";
    if (/daq|采集卡/.test(token)) return "daq";
    if (/load|电子负载/.test(token)) return "load";
    if (/robot|机器人|小车/.test(token)) return "robot";
    if (/actuator|执行器/.test(token)) return "actuator";
    if (/led-strip|灯带/.test(token)) return "led-strip";
    if (/transducer|换能器/.test(token)) return "acoustic-transducer";
    if (/white-source|光源/.test(token)) return "optical-source";
    if (/chamber|油滴室/.test(token)) return "millikan-chamber";
    if (/microscope|显微镜/.test(token)) return "microscope";
    if (/diode|二极管/.test(token)) return "diode-fixture";
    if (/pendulum|单摆|三线摆/.test(token)) return "pendulum";
    if (/vibrator|振动/.test(token)) return "vibrator";
    if (/photogate|光电门/.test(token)) return "photogate";
    if (/heater|加热/.test(token)) return "heater";
    if (/calorimeter|量热/.test(token)) return "calorimeter";
    if (/electrode/.test(token)) return "electrode";
    if (/bioamp|生物放大器/.test(token)) return "bioamp";
    if (/printer|制造设备/.test(token)) return "printer";
    if (/caliper|测量工具|卡尺/.test(token)) return "caliper";
    if (device.type === "sample") return "sample";
    if (device.type === "magnet") return "magnet";
    return "generic";
  }

  function createDeviceGroup(device) {
    const THREE = state.three;
    const group = new THREE.Group();
    group.userData.deviceId = device.id;
    const kind = deviceKind(device);
    group.userData.kind = kind;
    const accent = new THREE.Color(device.accent || "#d9b474");
    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: 0x35433f,
      metalness: 0.55,
      roughness: 0.38
    });
    const darkMaterial = new THREE.MeshStandardMaterial({ color: 0x080f0e, roughness: 0.72 });
    const blackMetal = new THREE.MeshStandardMaterial({ color: 0x101715, metalness: 0.72, roughness: 0.3 });
    const steelMaterial = new THREE.MeshStandardMaterial({ color: 0xb9c0b9, metalness: 0.92, roughness: 0.14 });
    const brassMaterial = new THREE.MeshStandardMaterial({ color: 0xc29b57, metalness: 0.82, roughness: 0.22 });
    const accentMaterial = new THREE.MeshStandardMaterial({
      color: accent,
      emissive: accent,
      emissiveIntensity: 0.34,
      metalness: 0.4,
      roughness: 0.28
    });
    const glassMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xb8ded5,
      transparent: true,
      opacity: 0.34,
      transmission: 0.52,
      roughness: 0.05,
      metalness: 0,
      depthWrite: false
    });
    const opticalTypes = new Set([
      "laser", "mirror", "splitter", "lens", "sample", "screen", "detector", "probe",
      "fiber-spool", "fiber-coupler", "prism", "camera", "target"
    ]);
    const optical = opticalTypes.has(device.type) || device.zone === "optical";

    if (device.type === "board") {
      [[-0.38, -0.23], [-0.38, 0.23], [0.38, -0.23], [0.38, 0.23]].forEach(([x, z]) => {
        addPart(group, device, new THREE.CylinderGeometry(0.035, 0.045, 0.12, 12), brassMaterial, [x, 0.06, z]);
      });
    } else if (optical) {
      const foot = addPart(group, device, new THREE.CylinderGeometry(0.22, 0.28, 0.075, 28), darkMaterial, [0, 0.06, 0]);
      const footRing = addPart(group, device, new THREE.TorusGeometry(0.23, 0.014, 8, 28), steelMaterial, [0, 0.1, 0], [Math.PI / 2, 0, 0]);
      foot.receiveShadow = footRing.receiveShadow = true;
      for (let index = 0; index < 3; index += 1) {
        const angle = index * Math.PI * 2 / 3 + 0.35;
        addPart(
          group,
          device,
          new THREE.CylinderGeometry(0.022, 0.022, 0.035, 10),
          brassMaterial,
          [Math.cos(angle) * 0.19, 0.1, Math.sin(angle) * 0.19]
        );
      }
    } else {
      [[-0.42, -0.22], [-0.42, 0.22], [0.42, -0.22], [0.42, 0.22]].forEach(([x, z]) => {
        addPart(group, device, new THREE.CylinderGeometry(0.04, 0.045, 0.055, 12), darkMaterial, [x, 0.035, z]);
      });
    }

    if (kind === "laser") {
      const casingColor = device.variant === "hene" ? 0x8b3f38 :
        device.variant === "solid" ? 0x334c57 : device.variant === "fiber" ? 0x355a4e : 0x303d3b;
      const casing = new THREE.MeshStandardMaterial({ color: casingColor, metalness: 0.64, roughness: 0.3 });
      addPart(group, device, beveledBoxGeometry(0.86, 0.3, 0.44, 0.045), casing, [0, 0.31, 0]);
      for (let index = 0; index < 5; index += 1) {
        addPart(group, device, new THREE.BoxGeometry(0.055, 0.34, 0.47), brassMaterial, [-0.23 + index * 0.115, 0.32, 0]);
      }
      addPart(group, device, new THREE.CylinderGeometry(0.085, 0.085, 0.72, 24), blackMetal, [0, 0.38, 0], [0, 0, Math.PI / 2]);
      addPart(group, device, new THREE.CylinderGeometry(0.1, 0.1, 0.045, 24), brassMaterial, [0.38, 0.38, 0], [0, 0, Math.PI / 2]);
      addPart(group, device, new THREE.CircleGeometry(0.047, 24), accentMaterial, [0.405, 0.38, 0], [0, Math.PI / 2, 0]);
      const panelTexture = makePanelTexture(device, state.config || {});
      addPart(group, device, new THREE.PlaneGeometry(0.3, 0.14), new THREE.MeshBasicMaterial({ map: panelTexture }), [0, 0.3, 0.225]);
      addPart(group, device, new THREE.SphereGeometry(0.025, 12, 12), new THREE.MeshBasicMaterial({ color: 0x6ee3a2 }), [0.29, 0.42, 0.23]);
      addPart(group, device, new THREE.CylinderGeometry(0.09, 0.09, 0.018, 24), darkMaterial, [-0.42, 0.32, 0], [0, 0, Math.PI / 2]);
      for (let index = 0; index < 4; index += 1) {
        addPart(group, device, new THREE.BoxGeometry(0.22, 0.012, 0.012), darkMaterial, [-0.18, 0.475, -0.18 + index * 0.12]);
      }
    } else if (kind === "mirror") {
      addPart(group, device, new THREE.CylinderGeometry(0.035, 0.035, 0.45, 16), blackMetal, [0, 0.29, 0]);
      addPart(group, device, new THREE.BoxGeometry(0.075, 0.44, 0.34), blackMetal, [0, 0.55, 0], [0, 0, -0.14]);
      addPart(group, device, new THREE.TorusGeometry(0.245, 0.026, 12, 32), blackMetal, [-0.046, 0.57, 0], [0, Math.PI / 2, 0]);
      addPart(group, device, new THREE.CircleGeometry(0.235, 32), steelMaterial, [-0.052, 0.57, 0], [0, Math.PI / 2, 0]);
      for (let index = 0; index < 3; index += 1) {
        const angle = -0.9 + index * 1.05;
        addPart(
          group,
          device,
          new THREE.CylinderGeometry(0.018, 0.018, 0.055, 10),
          brassMaterial,
          [0.055, 0.57 + Math.sin(angle) * 0.16, Math.cos(angle) * 0.16],
          [0, 0, Math.PI / 2]
        );
      }
    } else if (kind === "splitter") {
      addPart(group, device, new THREE.CylinderGeometry(0.035, 0.035, 0.28, 16), blackMetal, [0, 0.2, 0]);
      addPart(group, device, new THREE.BoxGeometry(0.38, 0.38, 0.38), glassMaterial, [0, 0.46, 0], [0, Math.PI / 4, 0]);
      addPart(group, device, new THREE.BoxGeometry(0.39, 0.02, 0.39), accentMaterial, [0, 0.46, 0], [0, Math.PI / 4, 0]);
      [[-0.2, 0], [0.2, 0]].forEach(([x]) => {
        addPart(group, device, new THREE.CylinderGeometry(0.095, 0.105, 0.1, 20), blackMetal, [x, 0.46, 0], [0, 0, Math.PI / 2]);
      });
    } else if (kind === "lens") {
      addPart(group, device, new THREE.CylinderGeometry(0.035, 0.035, 0.46, 16), blackMetal, [0, 0.29, 0]);
      addPart(group, device, new THREE.TorusGeometry(0.22, 0.035, 12, 32), blackMetal, [0, 0.53, 0], [0, Math.PI / 2, 0]);
      addPart(group, device, new THREE.CircleGeometry(0.195, 32), glassMaterial, [-0.008, 0.53, 0], [0, Math.PI / 2, 0]);
      addPart(group, device, new THREE.TorusGeometry(0.16, 0.006, 6, 32), accentMaterial, [-0.018, 0.53, 0], [0, Math.PI / 2, 0]);
      addPart(group, device, new THREE.BoxGeometry(0.08, 0.2, 0.06), blackMetal, [0.02, 0.35, 0.17]);
    } else if (kind === "sample") {
      if (device.variant === "solar" || /光伏|太阳能/.test(device.label)) {
        addPart(group, device, new THREE.BoxGeometry(0.7, 0.055, 0.54), blackMetal, [0, 0.18, 0], [-0.3, 0, 0]);
        addPart(group, device, new THREE.BoxGeometry(0.62, 0.025, 0.46), new THREE.MeshStandardMaterial({
          color: 0x153d70,
          metalness: 0.5,
          roughness: 0.25
        }), [0, 0.22, -0.015], [-0.3, 0, 0]);
        for (let index = 1; index < 4; index += 1) {
          addPart(group, device, new THREE.BoxGeometry(0.62, 0.008, 0.008), steelMaterial, [0, 0.235, -0.015 - 0.23 + index * 0.115], [-0.3, 0, 0]);
        }
        for (let index = 1; index < 5; index += 1) {
          addPart(group, device, new THREE.BoxGeometry(0.008, 0.008, 0.46), steelMaterial, [-0.31 + index * 0.124, 0.236, -0.015], [-0.3, 0, 0]);
        }
        [-0.16, 0.16].forEach((x) => {
          addPart(group, device, new THREE.BoxGeometry(0.035, 0.5, 0.035), steelMaterial, [x, 0.26, 0.25], [0.38, 0, 0]);
        });
      } else if (/LED|发光/.test(device.label)) {
        addPart(group, device, new THREE.BoxGeometry(0.42, 0.04, 0.32), new THREE.MeshStandardMaterial({ color: 0x174a3b, roughness: 0.6 }), [0, 0.15, 0]);
        addPart(group, device, new THREE.SphereGeometry(0.115, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshPhysicalMaterial({
          color: accent,
          emissive: accent,
          emissiveIntensity: 0.8,
          transparent: true,
          opacity: 0.78,
          roughness: 0.12
        }), [0, 0.2, 0]);
        [-0.08, 0.08].forEach((x) => {
          addPart(group, device, new THREE.CylinderGeometry(0.008, 0.008, 0.16, 8), steelMaterial, [x, 0.1, 0]);
        });
      } else if (/靶|target|标定/.test(`${device.label} ${device.id}`)) {
        addPart(group, device, new THREE.BoxGeometry(0.52, 0.56, 0.035), blackMetal, [0, 0.5, 0]);
        for (let row = 0; row < 4; row += 1) {
          for (let column = 0; column < 4; column += 1) {
            addPart(
              group,
              device,
              new THREE.PlaneGeometry(0.1, 0.1),
              new THREE.MeshBasicMaterial({ color: (row + column) % 2 ? 0xe7e0ce : 0x121817 }),
              [-0.15 + column * 0.1, 0.32 + (3 - row) * 0.1, 0.025]
            );
          }
        }
      } else {
        addPart(group, device, new THREE.BoxGeometry(0.42, 0.035, 0.36), blackMetal, [0, 0.14, 0]);
        addPart(group, device, new THREE.BoxGeometry(0.34, 0.29, 0.29), glassMaterial, [0, 0.3, 0]);
        addPart(group, device, new THREE.BoxGeometry(0.24, 0.17, 0.2), new THREE.MeshStandardMaterial({
          color: 0x70a287,
          emissive: 0x70a287,
          emissiveIntensity: 0.08,
          transparent: true,
          opacity: 0.82,
          roughness: 0.28
        }), [0, 0.3, 0]);
        [-0.11, 0, 0.11].forEach((x) => {
          addPart(group, device, new THREE.BoxGeometry(0.018, 0.18, 0.21), steelMaterial, [x, 0.3, 0]);
        });
      }
    } else if (kind === "screen") {
      addPart(group, device, new THREE.CylinderGeometry(0.03, 0.03, 0.62, 14), blackMetal, [0, 0.33, 0]);
      addPart(group, device, new THREE.BoxGeometry(0.74, 0.052, 0.18), blackMetal, [0, 0.08, 0]);
      addPart(group, device, new THREE.BoxGeometry(0.72, 0.96, 0.04), blackMetal, [0, 0.66, 0]);
      const panelTexture = makePanelTexture(device, state.config || {});
      addPart(group, device, new THREE.PlaneGeometry(0.64, 0.86), new THREE.MeshBasicMaterial({
        map: panelTexture,
        side: THREE.DoubleSide
      }), [0, 0.66, 0.024]);
      addPart(group, device, new THREE.BoxGeometry(0.76, 0.025, 0.055), accentMaterial, [0, 1.15, 0]);
    } else if (kind === "scope") {
      addPart(group, device, beveledBoxGeometry(1.12, 0.58, 0.54, 0.06), bodyMaterial, [0, 0.34, 0]);
      addPart(group, device, beveledBoxGeometry(1.16, 0.045, 0.58, 0.025), blackMetal, [0, 0.61, 0]);
      addPart(group, device, beveledBoxGeometry(0.98, 0.53, 0.035, 0.025), blackMetal, [0, 0.36, 0.282]);
      const panelTexture = makePanelTexture(device, state.config || {});
      addPart(group, device, new THREE.PlaneGeometry(0.64, 0.39), new THREE.MeshBasicMaterial({ map: panelTexture }), [-0.14, 0.4, 0.3]);
      for (let index = 0; index < 4; index += 1) {
        addPart(
          group,
          device,
          new THREE.CylinderGeometry(0.052, 0.052, 0.04, 18),
          index === 0 ? accentMaterial : blackMetal,
          [0.36 + (index % 2) * 0.12, 0.48 - Math.floor(index / 2) * 0.18, 0.31],
          [Math.PI / 2, 0, 0]
        );
        addPart(
          group,
          device,
          new THREE.BoxGeometry(0.012, 0.018, 0.01),
          accentMaterial,
          [0.36 + (index % 2) * 0.12, 0.51 - Math.floor(index / 2) * 0.18, 0.337]
        );
      }
      [-0.3, 0, 0.3].forEach((x) => {
        addPart(group, device, new THREE.CylinderGeometry(0.035, 0.035, 0.055, 14), brassMaterial, [x, 0.21, 0.31], [Math.PI / 2, 0, 0]);
        addPart(group, device, new THREE.TorusGeometry(0.041, 0.008, 8, 16), steelMaterial, [x, 0.21, 0.342], [0, 0, 0]);
      });
      addPart(group, device, new THREE.TorusGeometry(0.28, 0.025, 8, 24, Math.PI), blackMetal, [0, 0.66, 0], [0, 0, Math.PI]);
      for (let index = 0; index < 8; index += 1) {
        addPart(group, device, new THREE.BoxGeometry(0.045, 0.008, 0.018), darkMaterial, [-0.28 + index * 0.08, 0.638, -0.12]);
      }
      [-0.59, 0.59].forEach((x) => {
        addPart(group, device, new THREE.TorusGeometry(0.11, 0.018, 8, 20, Math.PI), blackMetal, [x, 0.32, 0], [0, Math.PI / 2, Math.PI / 2]);
      });
    } else if (kind === "computer") {
      addPart(group, device, beveledBoxGeometry(0.25, 0.08, 0.2, 0.025), blackMetal, [0, 0.16, 0]);
      addPart(group, device, new THREE.CylinderGeometry(0.035, 0.045, 0.25, 16), steelMaterial, [0, 0.28, 0]);
      addPart(group, device, beveledBoxGeometry(0.86, 0.57, 0.08, 0.035), bodyMaterial, [0, 0.53, 0], [-0.08, 0, 0]);
      const screenTexture = makePanelTexture(device, state.config || {});
      addPart(group, device, new THREE.PlaneGeometry(0.78, 0.47), new THREE.MeshBasicMaterial({ map: screenTexture }), [0, 0.54, 0.042], [-0.08, 0, 0]);
      addPart(group, device, beveledBoxGeometry(0.72, 0.045, 0.28, 0.02), blackMetal, [0, 0.1, 0.25], [0.08, 0, 0]);
      for (let row = 0; row < 3; row += 1) {
        for (let column = 0; column < 10; column += 1) {
          addPart(group, device, new THREE.BoxGeometry(0.045, 0.008, 0.035), steelMaterial, [-0.28 + column * 0.062, 0.127, 0.18 + row * 0.045], [0.08, 0, 0]);
        }
      }
    } else if (["detector", "camera", "thermal-camera", "beam-profiler"].includes(kind)) {
      addPart(group, device, new THREE.CylinderGeometry(0.19, 0.17, 0.42, 32), bodyMaterial, [0, 0.39, 0], [0, 0, Math.PI / 2]);
      addPart(group, device, new THREE.TorusGeometry(0.145, 0.025, 10, 28), brassMaterial, [-0.215, 0.39, 0], [0, Math.PI / 2, 0]);
      addPart(group, device, new THREE.CircleGeometry(0.125, 28), glassMaterial, [-0.225, 0.39, 0], [0, Math.PI / 2, 0]);
      addPart(group, device, new THREE.BoxGeometry(0.14, 0.34, 0.25), blackMetal, [0.22, 0.31, 0]);
      addPart(group, device, new THREE.SphereGeometry(0.03, 12, 12), new THREE.MeshBasicMaterial({ color: 0x6ae3a4 }), [0.24, 0.5, 0.13]);
    } else if (kind === "breadboard") {
      const boardBase = new THREE.MeshStandardMaterial({ color: 0xb6aa8b, metalness: 0.03, roughness: 0.78 });
      const breadSurface = new THREE.MeshStandardMaterial({ color: 0xe4dfcf, roughness: 0.72 });
      addPart(group, device, beveledBoxGeometry(1.08, 0.08, 0.68, 0.035), boardBase, [0, 0.15, 0]);
      addPart(group, device, beveledBoxGeometry(1.0, 0.025, 0.59, 0.018), breadSurface, [0, 0.2, 0]);
      addPart(group, device, new THREE.BoxGeometry(1.01, 0.01, 0.035), darkMaterial, [0, 0.218, 0]);
      addPart(group, device, new THREE.BoxGeometry(0.98, 0.006, 0.012), new THREE.MeshBasicMaterial({ color: 0xa84d42 }), [0, 0.221, 0.245]);
      addPart(group, device, new THREE.BoxGeometry(0.98, 0.006, 0.012), new THREE.MeshBasicMaterial({ color: 0x3b6da8 }), [0, 0.221, -0.245]);
      const holeMaterial = new THREE.MeshStandardMaterial({ color: 0x3b403b, roughness: 0.72 });
      const holeGeometry = new THREE.CylinderGeometry(0.006, 0.006, 0.006, 6);
      const holes = new THREE.InstancedMesh(holeGeometry, holeMaterial, 320);
      const matrix = new THREE.Matrix4();
      let instance = 0;
      for (let bank = 0; bank < 2; bank += 1) {
        for (let row = 0; row < 10; row += 1) {
          for (let column = 0; column < 12; column += 1) {
            matrix.makeTranslation(
              -0.44 + column * 0.08,
              0.219,
              (bank ? 0.05 : -0.05) + (row - 4.5) * 0.035
            );
            holes.setMatrixAt(instance, matrix);
            instance += 1;
          }
        }
      }
      for (let bank = 0; bank < 4; bank += 1) {
        for (let column = 0; column < 20; column += 1) {
          matrix.makeTranslation(-0.45 + column * 0.047, 0.219, bank < 2 ? 0.275 - (bank % 2) * 0.035 : -0.275 + (bank % 2) * 0.035);
          holes.setMatrixAt(instance, matrix);
          instance += 1;
        }
      }
      holes.instanceMatrix.needsUpdate = true;
      holes.userData.deviceId = device.id;
      holes.castShadow = false;
      group.add(holes);
    } else if (kind === "probe") {
      addPart(group, device, new THREE.CylinderGeometry(0.055, 0.055, 0.36, 18), bodyMaterial, [0, 0.42, 0], [0, 0, -0.14]);
      addPart(group, device, new THREE.CylinderGeometry(0.012, 0.004, 0.62, 12), steelMaterial, [-0.065, 0.78, 0], [0, 0, -0.14]);
      addPart(group, device, new THREE.TorusGeometry(0.057, 0.012, 8, 18), accentMaterial, [0, 0.5, 0], [Math.PI / 2, 0, 0]);
      addPart(group, device, new THREE.CylinderGeometry(0.02, 0.02, 0.5, 10), blackMetal, [0.02, 0.28, 0], [0, 0, -0.14]);
    } else if (kind === "magnet") {
      addPart(group, device, new THREE.BoxGeometry(0.82, 0.16, 0.45), blackMetal, [0, 0.22, 0]);
      [-0.31, 0.31].forEach((x) => {
        addPart(group, device, new THREE.CylinderGeometry(0.1, 0.1, 0.5, 20), steelMaterial, [x, 0.42, 0]);
        addPart(group, device, new THREE.TorusGeometry(0.12, 0.038, 10, 24), brassMaterial, [x, 0.44, 0], [Math.PI / 2, 0, 0]);
      });
      addPart(group, device, new THREE.BoxGeometry(0.55, 0.1, 0.26), accentMaterial, [0, 0.33, 0]);
    } else if (kind === "prism") {
      addPart(group, device, new THREE.CylinderGeometry(0.32, 0.32, 0.45, 3), glassMaterial, [0, 0.37, 0], [Math.PI / 2, 0, Math.PI / 6]);
      addPart(group, device, new THREE.CylinderGeometry(0.035, 0.035, 0.31, 14), blackMetal, [0, 0.19, 0]);
    } else if (kind === "fiber-spool" || kind === "fiber-coupler") {
      addPart(group, device, new THREE.BoxGeometry(0.5, 0.08, 0.36), blackMetal, [0, 0.16, 0]);
      [-0.09, 0.09].forEach((x) => {
        addPart(group, device, new THREE.TorusGeometry(0.2, 0.038, 12, 36), new THREE.MeshStandardMaterial({
          color: device.type === "fiber-spool" ? 0xd8ad57 : 0x5c8e80,
          metalness: 0.25,
          roughness: 0.45
        }), [x, 0.25, 0], [Math.PI / 2, 0, 0]);
      });
      addPart(group, device, new THREE.CylinderGeometry(0.055, 0.055, 0.24, 16), brassMaterial, [0, 0.31, 0], [0, 0, Math.PI / 2]);
    } else if (kind === "diode-fixture") {
      addPart(group, device, new THREE.CylinderGeometry(0.11, 0.11, 0.34, 24), blackMetal, [0, 0.24, 0], [0, 0, Math.PI / 2]);
      addPart(group, device, new THREE.TorusGeometry(0.105, 0.012, 8, 24), steelMaterial, [0.18, 0.24, 0], [0, Math.PI / 2, 0]);
      [-0.08, 0.08].forEach((z) => {
        addPart(group, device, new THREE.CylinderGeometry(0.008, 0.008, 0.26, 8), steelMaterial, [-0.2, 0.16, z], [0, 0, Math.PI / 2]);
      });
    } else if (kind === "multimeter") {
      const shell = new THREE.MeshStandardMaterial({ color: 0xd8a844, metalness: 0.18, roughness: 0.58 });
      addPart(group, device, beveledBoxGeometry(0.64, 0.8, 0.25, 0.055), blackMetal, [0, 0.42, -0.006], [-0.18, 0, 0]);
      addPart(group, device, beveledBoxGeometry(0.6, 0.75, 0.245, 0.05), shell, [0, 0.42, 0.008], [-0.18, 0, 0]);
      addPart(group, device, new THREE.BoxGeometry(0.52, 0.28, 0.025), darkMaterial, [0, 0.62, 0.145], [-0.18, 0, 0]);
      addPart(group, device, new THREE.PlaneGeometry(0.46, 0.22), new THREE.MeshBasicMaterial({ map: makePanelTexture(device, state.config || {}) }), [0, 0.62, 0.16], [-0.18, 0, 0]);
      addPart(group, device, new THREE.CylinderGeometry(0.15, 0.15, 0.045, 32), blackMetal, [0, 0.31, 0.16], [Math.PI / 2, 0, 0]);
      addPart(group, device, new THREE.BoxGeometry(0.025, 0.12, 0.02), accentMaterial, [0, 0.39, 0.19], [0, 0, -0.24]);
      [-0.2, -0.07, 0.07, 0.2].forEach((x) => {
        addPart(group, device, new THREE.CylinderGeometry(0.028, 0.028, 0.08, 14), x < 0 ? blackMetal : accentMaterial, [x, 0.12, 0.15], [Math.PI / 2, 0, 0]);
      });
      addPart(group, device, new THREE.BoxGeometry(0.44, 0.035, 0.3), blackMetal, [0, 0.04, 0.18]);
      for (let index = 0; index < 5; index += 1) {
        addPart(group, device, new THREE.BoxGeometry(0.29, 0.008, 0.012), darkMaterial, [0.12, 0.45 - index * 0.035, 0.139], [-0.18, 0, 0]);
      }
    } else if (kind === "power-supply") {
      addPart(group, device, beveledBoxGeometry(1.02, 0.5, 0.54, 0.045), bodyMaterial, [0, 0.3, 0]);
      addPart(group, device, beveledBoxGeometry(1.04, 0.04, 0.58, 0.018), steelMaterial, [0, 0.57, 0]);
      const panel = new THREE.MeshStandardMaterial({ color: 0x161d1b, roughness: 0.66, metalness: 0.22 });
      addPart(group, device, beveledBoxGeometry(0.97, 0.39, 0.027, 0.018), panel, [0, 0.31, 0.282]);
      addPart(group, device, new THREE.PlaneGeometry(0.86, 0.28), new THREE.MeshBasicMaterial({ map: makePanelTexture(device, state.config || {}) }), [0, 0.34, 0.3]);
      [-0.34, -0.02].forEach((x) => {
        addPart(group, device, new THREE.CylinderGeometry(0.075, 0.075, 0.045, 22), brassMaterial, [x, 0.11, 0.31], [Math.PI / 2, 0, 0]);
      });
      [-0.2, 0.2].forEach((x) => {
        addPart(group, device, new THREE.CylinderGeometry(0.06, 0.06, 0.045, 22), blackMetal, [x, 0.11, 0.31], [Math.PI / 2, 0, 0]);
        addPart(group, device, new THREE.CylinderGeometry(0.02, 0.02, 0.04, 12), accentMaterial, [x + 0.23, 0.11, 0.31], [Math.PI / 2, 0, 0]);
      });
      for (let index = 0; index < 5; index += 1) {
        addPart(group, device, new THREE.BoxGeometry(0.42, 0.012, 0.018), darkMaterial, [0.18, 0.13 + index * 0.027, 0.298]);
      }
      addPart(group, device, new THREE.TorusGeometry(0.19, 0.018, 8, 28, Math.PI), blackMetal, [0, 0.62, 0], [0, 0, Math.PI]);
      for (let index = 0; index < 7; index += 1) {
        addPart(group, device, new THREE.BoxGeometry(0.28, 0.01, 0.012), darkMaterial, [-0.28, 0.2 + index * 0.025, -0.285]);
      }
    } else if (kind === "generator") {
      addPart(group, device, beveledBoxGeometry(0.94, 0.43, 0.5, 0.045), bodyMaterial, [0, 0.27, 0]);
      addPart(group, device, beveledBoxGeometry(0.87, 0.32, 0.027, 0.018), blackMetal, [0, 0.3, 0.263]);
      addPart(group, device, new THREE.PlaneGeometry(0.74, 0.24), new THREE.MeshBasicMaterial({ map: makePanelTexture(device, state.config || {}) }), [0, 0.32, 0.282]);
      addPart(group, device, new THREE.CylinderGeometry(0.075, 0.075, 0.04, 22), accentMaterial, [0.35, 0.18, 0.28], [Math.PI / 2, 0, 0]);
      [-0.25, 0, 0.25].forEach((x) => {
        addPart(group, device, new THREE.CylinderGeometry(0.032, 0.032, 0.055, 16), brassMaterial, [x, 0.12, 0.28], [Math.PI / 2, 0, 0]);
      });
      addPart(group, device, new THREE.BoxGeometry(0.2, 0.16, 0.04), darkMaterial, [-0.34, 0.19, 0.275]);
    } else if (kind === "logic-analyzer") {
      addPart(group, device, beveledBoxGeometry(1.1, 0.52, 0.56, 0.05), bodyMaterial, [0, 0.32, 0]);
      addPart(group, device, new THREE.PlaneGeometry(0.82, 0.36), new THREE.MeshBasicMaterial({ map: makePanelTexture(device, state.config || {}) }), [-0.08, 0.37, 0.3]);
      for (let row = 0; row < 2; row += 1) {
        for (let index = 0; index < 8; index += 1) {
          addPart(group, device, new THREE.BoxGeometry(0.035, 0.045, 0.025), index === 0 ? accentMaterial : brassMaterial, [-0.34 + index * 0.1, 0.15 + row * 0.08, 0.3]);
        }
      }
      addPart(group, device, new THREE.BoxGeometry(0.34, 0.055, 0.36), blackMetal, [0, 0.59, 0]);
    } else if (kind === "mcu-board") {
      const boardColor = device.variant === "fpga" ? 0x1a3f5c : device.variant === "arduino" ? 0x17634f : 0x184635;
      const pcb = new THREE.MeshStandardMaterial({ color: boardColor, metalness: 0.12, roughness: 0.62 });
      addPart(group, device, new THREE.BoxGeometry(1.02, 0.075, 0.64), pcb, [0, 0.16, 0]);
      addPart(group, device, new THREE.BoxGeometry(0.26, 0.1, 0.24), darkMaterial, [-0.12, 0.25, -0.03]);
      addPart(group, device, new THREE.BoxGeometry(0.14, 0.055, 0.14), accentMaterial, [0.2, 0.235, -0.1]);
      addPart(group, device, new THREE.BoxGeometry(0.2, 0.13, 0.16), steelMaterial, [0.31, 0.26, 0.18]);
      for (let index = 0; index < 16; index += 1) {
        const x = -0.46 + index * 0.061;
        addPart(group, device, new THREE.BoxGeometry(0.02, 0.035, 0.025), brassMaterial, [x, 0.225, 0.3]);
        addPart(group, device, new THREE.BoxGeometry(0.02, 0.035, 0.025), brassMaterial, [x, 0.225, -0.3]);
      }
      addPart(group, device, new THREE.CylinderGeometry(0.027, 0.027, 0.028, 16), indexColor(accent, 0.12), [-0.37, 0.235, 0.16]);
      addPart(group, device, new THREE.BoxGeometry(0.15, 0.09, 0.16), blackMetal, [-0.42, 0.23, -0.18]);
      addPart(group, device, new THREE.BoxGeometry(0.17, 0.018, 0.11), brassMaterial, [0.42, 0.225, -0.2]);
      addPart(group, device, new THREE.CylinderGeometry(0.045, 0.045, 0.025, 16), steelMaterial, [0.02, 0.23, -0.22]);
      [-0.24, -0.12, 0, 0.12].forEach((x) => {
        addPart(group, device, new THREE.CylinderGeometry(0.022, 0.022, 0.05, 12), x === 0 ? accentMaterial : brassMaterial, [x, 0.23, 0.18]);
      });
    } else if (kind === "sensor-module") {
      addPart(group, device, new THREE.BoxGeometry(0.58, 0.045, 0.38), new THREE.MeshStandardMaterial({ color: 0x1b5c4c, roughness: 0.6 }), [0, 0.16, 0]);
      if (/超声/.test(device.label)) {
        [-0.14, 0.14].forEach((x) => {
          addPart(group, device, new THREE.CylinderGeometry(0.105, 0.105, 0.09, 28), steelMaterial, [x, 0.24, 0], [Math.PI / 2, 0, 0]);
          addPart(group, device, new THREE.TorusGeometry(0.075, 0.009, 8, 24), darkMaterial, [x, 0.24, 0.05]);
        });
      } else if (/温度/.test(device.label)) {
        addPart(group, device, new THREE.CylinderGeometry(0.025, 0.012, 0.56, 12), steelMaterial, [0.12, 0.42, 0], [0, 0, -0.95]);
        addPart(group, device, new THREE.CylinderGeometry(0.035, 0.035, 0.18, 16), blackMetal, [-0.18, 0.25, 0], [Math.PI / 2, 0, 0]);
      } else {
        addPart(group, device, new THREE.SphereGeometry(0.105, 20, 14), glassMaterial, [0, 0.25, 0]);
        addPart(group, device, new THREE.SphereGeometry(0.045, 16, 12), accentMaterial, [0, 0.25, 0]);
      }
      for (let index = 0; index < 6; index += 1) {
        addPart(group, device, new THREE.BoxGeometry(0.018, 0.04, 0.018), brassMaterial, [-0.2 + index * 0.08, 0.21, 0.22]);
      }
    } else if (kind === "lcd-module") {
      addPart(group, device, new THREE.BoxGeometry(0.72, 0.045, 0.44), new THREE.MeshStandardMaterial({ color: 0x18583f, roughness: 0.58 }), [0, 0.16, 0]);
      addPart(group, device, new THREE.BoxGeometry(0.54, 0.08, 0.31), darkMaterial, [0, 0.22, 0.02]);
      addPart(group, device, new THREE.PlaneGeometry(0.46, 0.23), new THREE.MeshBasicMaterial({ map: makePanelTexture(device, state.config || {}) }), [0, 0.27, 0.195], [-0.18, 0, 0]);
      [-0.27, -0.13, 0.13, 0.27].forEach((x) => {
        addPart(group, device, new THREE.BoxGeometry(0.04, 0.025, 0.035), brassMaterial, [x, 0.2, -0.24]);
      });
    } else if (kind === "alarm") {
      addPart(group, device, new THREE.BoxGeometry(0.52, 0.04, 0.34), new THREE.MeshStandardMaterial({ color: 0x1b4e40, roughness: 0.58 }), [0, 0.15, 0]);
      addPart(group, device, new THREE.CylinderGeometry(0.1, 0.1, 0.13, 28), blackMetal, [-0.12, 0.25, 0]);
      addPart(group, device, new THREE.TorusGeometry(0.105, 0.012, 8, 28), steelMaterial, [-0.12, 0.31, 0], [Math.PI / 2, 0, 0]);
      addPart(group, device, new THREE.SphereGeometry(0.055, 18, 12), new THREE.MeshBasicMaterial({ color: 0xe55e4f }), [0.16, 0.24, 0]);
      addPart(group, device, new THREE.CylinderGeometry(0.035, 0.035, 0.06, 16), accentMaterial, [0.16, 0.18, 0]);
    } else if (kind === "keypad") {
      addPart(group, device, new THREE.BoxGeometry(0.58, 0.065, 0.62), blackMetal, [0, 0.18, 0]);
      for (let row = 0; row < 4; row += 1) {
        for (let column = 0; column < 3; column += 1) {
          addPart(group, device, new THREE.BoxGeometry(0.12, 0.04, 0.1), bodyMaterial, [-0.16 + column * 0.16, 0.23, -0.19 + row * 0.125]);
        }
      }
    } else if (kind === "daq") {
      addPart(group, device, beveledBoxGeometry(0.94, 0.34, 0.5, 0.04), bodyMaterial, [0, 0.24, 0]);
      addPart(group, device, new THREE.BoxGeometry(0.88, 0.24, 0.025), blackMetal, [0, 0.25, 0.262]);
      for (let index = 0; index < 8; index += 1) {
        addPart(group, device, new THREE.BoxGeometry(0.06, 0.1, 0.055), index % 3 ? accentMaterial : brassMaterial, [-0.34 + index * 0.1, 0.25, 0.295]);
      }
      addPart(group, device, new THREE.BoxGeometry(0.2, 0.11, 0.16), steelMaterial, [0.33, 0.28, 0.27]);
      addPart(group, device, new THREE.BoxGeometry(0.62, 0.025, 0.04), darkMaterial, [-0.08, 0.42, 0]);
    } else if (kind === "load") {
      addPart(group, device, beveledBoxGeometry(1.0, 0.45, 0.54, 0.045), bodyMaterial, [0, 0.29, 0]);
      addPart(group, device, new THREE.PlaneGeometry(0.62, 0.25), new THREE.MeshBasicMaterial({ map: makePanelTexture(device, state.config || {}) }), [-0.12, 0.35, 0.295]);
      for (let index = 0; index < 4; index += 1) {
        addPart(group, device, new THREE.CylinderGeometry(0.034, 0.034, 0.06, 16), index < 2 ? brassMaterial : blackMetal, [0.24 + (index % 2) * 0.16, 0.3 - Math.floor(index / 2) * 0.14, 0.29], [Math.PI / 2, 0, 0]);
      }
      addPart(group, device, new THREE.CylinderGeometry(0.08, 0.08, 0.04, 22), accentMaterial, [0.3, 0.14, 0.29], [Math.PI / 2, 0, 0]);
    } else if (kind === "robot") {
      addPart(group, device, new THREE.BoxGeometry(0.94, 0.14, 0.66), new THREE.MeshStandardMaterial({ color: 0x5f6f6a, metalness: 0.42, roughness: 0.4 }), [0, 0.2, 0]);
      [-0.3, 0.3].forEach((x) => {
        [-0.36, 0.36].forEach((z) => {
          addPart(group, device, new THREE.CylinderGeometry(0.13, 0.13, 0.08, 24), darkMaterial, [x, 0.13, z], [0, 0, Math.PI / 2]);
          addPart(group, device, new THREE.CylinderGeometry(0.035, 0.035, 0.09, 14), steelMaterial, [x, 0.13, z], [0, 0, Math.PI / 2]);
        });
      });
      addPart(group, device, new THREE.BoxGeometry(0.35, 0.14, 0.4), new THREE.MeshStandardMaterial({ color: 0x183f3b, roughness: 0.55 }), [0, 0.31, 0]);
      addPart(group, device, new THREE.SphereGeometry(0.075, 18, 12), new THREE.MeshBasicMaterial({ color: 0x76d6d2 }), [0, 0.26, 0.34]);
    } else if (kind === "actuator") {
      addPart(group, device, new THREE.CylinderGeometry(0.15, 0.15, 0.42, 24), bodyMaterial, [0, 0.29, 0], [0, 0, Math.PI / 2]);
      addPart(group, device, new THREE.CylinderGeometry(0.025, 0.025, 0.35, 12), steelMaterial, [0.38, 0.29, 0], [0, 0, Math.PI / 2]);
      addPart(group, device, new THREE.BoxGeometry(0.27, 0.22, 0.28), blackMetal, [0, 0.2, 0]);
      addPart(group, device, new THREE.TorusGeometry(0.12, 0.02, 8, 24), accentMaterial, [-0.18, 0.29, 0], [0, Math.PI / 2, 0]);
    } else if (kind === "led-strip") {
      addPart(group, device, new THREE.BoxGeometry(1.18, 0.035, 0.12), blackMetal, [0, 0.13, 0]);
      for (let index = 0; index < 12; index += 1) {
        addPart(group, device, new THREE.SphereGeometry(0.035, 12, 10), indexColor(accent, (index % 4) * 0.08), [-0.5 + index * 0.091, 0.17, 0]);
      }
      addPart(group, device, new THREE.BoxGeometry(0.12, 0.04, 0.12), darkMaterial, [-0.64, 0.14, 0]);
    } else if (kind === "optical-source") {
      addPart(group, device, new THREE.BoxGeometry(0.56, 0.34, 0.42), bodyMaterial, [0, 0.28, 0]);
      addPart(group, device, new THREE.CylinderGeometry(0.16, 0.18, 0.37, 28), blackMetal, [0, 0.47, 0]);
      addPart(group, device, new THREE.CylinderGeometry(0.115, 0.115, 0.39, 24), new THREE.MeshBasicMaterial({ color: 0xf2e8c5 }), [0, 0.47, 0]);
      for (let index = 0; index < 6; index += 1) {
        addPart(group, device, new THREE.BoxGeometry(0.6, 0.018, 0.44), brassMaterial, [0, 0.23 + index * 0.035, 0]);
      }
      addPart(group, device, new THREE.PlaneGeometry(0.28, 0.11), new THREE.MeshBasicMaterial({ map: makePanelTexture(device, state.config || {}) }), [0, 0.31, 0.216]);
    } else if (kind === "spectrometer") {
      addPart(group, device, beveledBoxGeometry(1.02, 0.4, 0.62, 0.05), bodyMaterial, [0, 0.28, 0]);
      addPart(group, device, new THREE.CylinderGeometry(0.25, 0.25, 0.09, 36), blackMetal, [0, 0.53, 0]);
      addPart(group, device, new THREE.TorusGeometry(0.255, 0.018, 8, 40), steelMaterial, [0, 0.58, 0], [Math.PI / 2, 0, 0]);
      addPart(group, device, new THREE.CylinderGeometry(0.13, 0.13, 0.52, 28), bodyMaterial, [-0.43, 0.55, 0], [0, 0, Math.PI / 2]);
      addPart(group, device, new THREE.CylinderGeometry(0.11, 0.13, 0.44, 28), bodyMaterial, [0.42, 0.55, 0], [0, 0, Math.PI / 2]);
      addPart(group, device, new THREE.TorusGeometry(0.11, 0.018, 8, 26), accentMaterial, [-0.7, 0.55, 0], [0, Math.PI / 2, 0]);
      addPart(group, device, new THREE.TorusGeometry(0.09, 0.018, 8, 26), accentMaterial, [0.65, 0.55, 0], [0, Math.PI / 2, 0]);
      addPart(group, device, new THREE.PlaneGeometry(0.48, 0.2), new THREE.MeshBasicMaterial({ map: makePanelTexture(device, state.config || {}) }), [0, 0.32, 0.315]);
      addPart(group, device, new THREE.CylinderGeometry(0.055, 0.055, 0.035, 20), accentMaterial, [0.38, 0.13, 0.315], [Math.PI / 2, 0, 0]);
      for (let index = 0; index < 16; index += 1) {
        const angle = index * Math.PI * 2 / 16;
        addPart(
          group,
          device,
          new THREE.BoxGeometry(index % 4 === 0 ? 0.035 : 0.018, 0.006, 0.012),
          index % 4 === 0 ? brassMaterial : steelMaterial,
          [Math.cos(angle) * 0.22, 0.585, Math.sin(angle) * 0.22],
          [0, -angle, 0]
        );
      }
    } else if (["grating", "slit", "polarizer"].includes(kind)) {
      addPart(group, device, new THREE.CylinderGeometry(0.035, 0.035, 0.4, 16), blackMetal, [0, 0.26, 0]);
      addPart(group, device, new THREE.TorusGeometry(0.24, 0.03, 12, 36), blackMetal, [0, 0.54, 0], [0, Math.PI / 2, 0]);
      if (kind === "polarizer") {
        addPart(group, device, new THREE.CircleGeometry(0.21, 36), new THREE.MeshPhysicalMaterial({
          color: device.accent || "#8b866a",
          transparent: true,
          opacity: 0.48,
          roughness: 0.08,
          transmission: 0.25
        }), [-0.008, 0.54, 0], [0, Math.PI / 2, 0]);
        for (let index = 0; index < 8; index += 1) {
          addPart(group, device, new THREE.BoxGeometry(0.012, 0.012, 0.03), steelMaterial, [0.035, 0.54 + Math.cos(index * Math.PI / 4) * 0.19, Math.sin(index * Math.PI / 4) * 0.19]);
        }
      } else {
        addPart(group, device, new THREE.BoxGeometry(0.025, 0.36, 0.36), new THREE.MeshPhysicalMaterial({
          color: 0xa8c6bf,
          metalness: 0.6,
          roughness: 0.22,
          transparent: true,
          opacity: 0.78
        }), [0, 0.54, 0]);
        const lineCount = kind === "grating" ? 12 : 2;
        for (let index = 0; index < lineCount; index += 1) {
          const z = kind === "grating" ? -0.15 + index * 0.027 : -0.018 + index * 0.036;
          addPart(group, device, new THREE.BoxGeometry(0.008, 0.31, 0.006), darkMaterial, [-0.016, 0.54, z]);
        }
      }
      addPart(group, device, new THREE.CylinderGeometry(0.055, 0.055, 0.035, 20), accentMaterial, [0.12, 0.32, 0.16], [Math.PI / 2, 0, 0]);
    } else if (kind === "optical-transceiver") {
      addPart(group, device, new THREE.BoxGeometry(0.66, 0.28, 0.46), new THREE.MeshStandardMaterial({
        color: 0x788580,
        metalness: 0.76,
        roughness: 0.24
      }), [0, 0.27, 0]);
      [-0.18, 0.18].forEach((z) => {
        addPart(group, device, new THREE.CylinderGeometry(0.07, 0.07, 0.15, 24), brassMaterial, [0.38, 0.27, z], [0, 0, Math.PI / 2]);
        addPart(group, device, new THREE.TorusGeometry(0.055, 0.012, 8, 20), darkMaterial, [0.46, 0.27, z], [0, Math.PI / 2, 0]);
      });
      addPart(group, device, new THREE.SphereGeometry(0.025, 12, 10), new THREE.MeshBasicMaterial({ color: 0x69e0a0 }), [-0.28, 0.39, 0.24]);
      addPart(group, device, new THREE.BoxGeometry(0.5, 0.025, 0.04), accentMaterial, [0, 0.43, 0]);
    } else if (kind === "microscope") {
      addPart(group, device, new THREE.BoxGeometry(0.62, 0.08, 0.46), blackMetal, [0, 0.13, 0]);
      addPart(group, device, new THREE.BoxGeometry(0.1, 0.78, 0.12), bodyMaterial, [-0.18, 0.52, 0]);
      addPart(group, device, new THREE.BoxGeometry(0.5, 0.06, 0.36), steelMaterial, [0.08, 0.38, 0]);
      addPart(group, device, new THREE.CylinderGeometry(0.095, 0.13, 0.46, 24), bodyMaterial, [0.12, 0.68, 0], [0, 0, -0.24]);
      addPart(group, device, new THREE.CylinderGeometry(0.07, 0.07, 0.16, 22), blackMetal, [0.28, 0.9, 0], [0, 0, -0.24]);
      addPart(group, device, new THREE.CylinderGeometry(0.025, 0.012, 0.18, 14), steelMaterial, [-0.05, 0.5, 0]);
      addPart(group, device, new THREE.CylinderGeometry(0.075, 0.075, 0.035, 22), accentMaterial, [0.28, 0.42, 0], [Math.PI / 2, 0, 0]);
    } else if (kind === "millikan-chamber") {
      addPart(group, device, new THREE.BoxGeometry(0.62, 0.42, 0.56), glassMaterial, [0, 0.34, 0]);
      addPart(group, device, new THREE.BoxGeometry(0.68, 0.045, 0.62), blackMetal, [0, 0.15, 0]);
      addPart(group, device, new THREE.BoxGeometry(0.68, 0.045, 0.62), blackMetal, [0, 0.56, 0]);
      addPart(group, device, new THREE.CylinderGeometry(0.12, 0.16, 0.38, 24), bodyMaterial, [-0.38, 0.48, 0], [0, 0, Math.PI / 2]);
      addPart(group, device, new THREE.CylinderGeometry(0.03, 0.03, 0.3, 14), brassMaterial, [0, 0.74, 0]);
      addPart(group, device, new THREE.SphereGeometry(0.018, 10, 8), accentMaterial, [0, 0.54, 0.2]);
    } else if (kind === "pendulum") {
      addPart(group, device, new THREE.BoxGeometry(0.76, 0.08, 0.54), blackMetal, [0, 0.14, 0]);
      addPart(group, device, new THREE.BoxGeometry(0.07, 1.0, 0.08), bodyMaterial, [-0.28, 0.63, 0]);
      addPart(group, device, new THREE.BoxGeometry(0.55, 0.055, 0.065), steelMaterial, [0.0, 1.1, 0]);
      addPart(group, device, new THREE.CylinderGeometry(0.006, 0.006, 0.62, 8), steelMaterial, [0.25, 0.8, 0], [0, 0, -0.18]);
      addPart(group, device, new THREE.SphereGeometry(0.14, 24, 18), brassMaterial, [0.31, 0.49, 0]);
      addPart(group, device, new THREE.CylinderGeometry(0.035, 0.035, 0.035, 16), accentMaterial, [-0.28, 1.15, 0], [Math.PI / 2, 0, 0]);
    } else if (kind === "vibrator") {
      addPart(group, device, new THREE.BoxGeometry(0.7, 0.24, 0.46), bodyMaterial, [0, 0.23, 0]);
      addPart(group, device, new THREE.CylinderGeometry(0.1, 0.1, 0.38, 22), blackMetal, [0, 0.43, 0], [0, 0, Math.PI / 2]);
      addPart(group, device, new THREE.CylinderGeometry(0.022, 0.022, 0.45, 12), steelMaterial, [0.4, 0.43, 0], [0, 0, Math.PI / 2]);
      for (let index = 0; index < 5; index += 1) {
        addPart(group, device, new THREE.TorusGeometry(0.105, 0.012, 8, 22), brassMaterial, [-0.12 + index * 0.06, 0.43, 0], [0, 0, Math.PI / 2]);
      }
      addPart(group, device, new THREE.BoxGeometry(0.22, 0.04, 0.28), blackMetal, [-0.25, 0.14, 0]);
    } else if (kind === "photogate") {
      addPart(group, device, new THREE.BoxGeometry(0.5, 0.07, 0.3), blackMetal, [0, 0.13, 0]);
      addPart(group, device, new THREE.BoxGeometry(0.08, 0.52, 0.1), bodyMaterial, [-0.18, 0.4, 0]);
      addPart(group, device, new THREE.BoxGeometry(0.28, 0.09, 0.12), bodyMaterial, [0.02, 0.65, 0]);
      addPart(group, device, new THREE.BoxGeometry(0.08, 0.24, 0.1), bodyMaterial, [0.18, 0.54, 0]);
      addPart(group, device, new THREE.SphereGeometry(0.022, 10, 8), new THREE.MeshBasicMaterial({ color: 0xe75c57 }), [0.18, 0.46, 0.055]);
      addPart(group, device, new THREE.BoxGeometry(0.2, 0.07, 0.18), darkMaterial, [-0.18, 0.68, 0]);
    } else if (kind === "acoustic-transducer") {
      addPart(group, device, new THREE.CylinderGeometry(0.2, 0.24, 0.22, 32), bodyMaterial, [0, 0.27, 0], [Math.PI / 2, 0, 0]);
      addPart(group, device, new THREE.CylinderGeometry(0.17, 0.17, 0.025, 32), blackMetal, [0, 0.27, 0.125], [Math.PI / 2, 0, 0]);
      addPart(group, device, new THREE.CircleGeometry(0.15, 32), new THREE.MeshPhysicalMaterial({
        color: 0x7d9d94,
        metalness: 0.35,
        roughness: 0.28
      }), [0, 0.27, 0.14]);
      addPart(group, device, new THREE.CylinderGeometry(0.035, 0.035, 0.18, 16), brassMaterial, [0, 0.18, 0], [0, 0, Math.PI / 2]);
      addPart(group, device, new THREE.BoxGeometry(0.35, 0.08, 0.28), darkMaterial, [0, 0.12, 0]);
      addPart(group, device, new THREE.CylinderGeometry(0.026, 0.026, 0.08, 14), accentMaterial, [0.27, 0.2, 0.12], [Math.PI / 2, 0, 0]);
    } else if (kind === "heater" || kind === "calorimeter") {
      addPart(group, device, new THREE.CylinderGeometry(0.27, 0.3, 0.42, 32), glassMaterial, [0, 0.35, 0]);
      addPart(group, device, new THREE.CylinderGeometry(0.28, 0.28, 0.035, 32), blackMetal, [0, 0.14, 0]);
      addPart(group, device, new THREE.CylinderGeometry(0.045, 0.045, 0.5, 14), brassMaterial, [0.2, 0.52, 0], [0, 0, -0.18]);
      addPart(group, device, new THREE.TorusGeometry(0.16, 0.022, 10, 30), new THREE.MeshBasicMaterial({ color: 0xda7b55 }), [0, 0.38, 0], [Math.PI / 2, 0, 0]);
      addPart(group, device, new THREE.BoxGeometry(0.46, 0.12, 0.4), bodyMaterial, [0, 0.18, 0]);
      addPart(group, device, new THREE.CylinderGeometry(0.055, 0.055, 0.035, 18), accentMaterial, [0.32, 0.18, 0.1], [Math.PI / 2, 0, 0]);
    } else if (kind === "electrode") {
      addPart(group, device, new THREE.CylinderGeometry(0.2, 0.2, 0.025, 32), new THREE.MeshStandardMaterial({
        color: 0xd7d7ca,
        roughness: 0.7
      }), [0, 0.12, 0]);
      addPart(group, device, new THREE.CylinderGeometry(0.065, 0.065, 0.08, 24), steelMaterial, [0, 0.16, 0]);
      addPart(group, device, new THREE.BoxGeometry(0.32, 0.3, 0.025), new THREE.MeshStandardMaterial({ color: 0xb89a72, roughness: 0.86 }), [0.28, 0.15, 0], [0, 0, -0.12]);
      addPart(group, device, new THREE.TorusGeometry(0.065, 0.01, 8, 24), accentMaterial, [0, 0.21, 0], [Math.PI / 2, 0, 0]);
    } else if (kind === "bioamp") {
      addPart(group, device, beveledBoxGeometry(0.85, 0.42, 0.5, 0.045), bodyMaterial, [0, 0.28, 0]);
      addPart(group, device, new THREE.PlaneGeometry(0.65, 0.27), new THREE.MeshBasicMaterial({ map: makePanelTexture(device, state.config || {}) }), [-0.05, 0.33, 0.27]);
      [-0.28, 0, 0.28].forEach((x) => {
        addPart(group, device, new THREE.CylinderGeometry(0.035, 0.035, 0.05, 16), x === 0 ? brassMaterial : steelMaterial, [x, 0.12, 0.28], [Math.PI / 2, 0, 0]);
      });
      addPart(group, device, new THREE.CylinderGeometry(0.07, 0.07, 0.04, 20), accentMaterial, [0.3, 0.12, 0.28], [Math.PI / 2, 0, 0]);
    } else if (kind === "printer") {
      addPart(group, device, new THREE.BoxGeometry(0.95, 0.08, 0.72), blackMetal, [0, 0.12, 0]);
      [-0.42, 0.42].forEach((x) => {
        addPart(group, device, new THREE.BoxGeometry(0.06, 0.9, 0.06), steelMaterial, [x, 0.58, -0.31]);
        addPart(group, device, new THREE.BoxGeometry(0.06, 0.9, 0.06), steelMaterial, [x, 0.58, 0.31]);
      });
      addPart(group, device, new THREE.BoxGeometry(0.94, 0.06, 0.06), steelMaterial, [0, 0.98, 0]);
      addPart(group, device, new THREE.BoxGeometry(0.34, 0.12, 0.3), bodyMaterial, [0, 0.82, 0]);
      addPart(group, device, new THREE.CylinderGeometry(0.02, 0.006, 0.25, 12), brassMaterial, [0, 0.66, 0]);
      addPart(group, device, new THREE.CylinderGeometry(0.18, 0.18, 0.07, 28), darkMaterial, [0, 0.98, -0.32], [Math.PI / 2, 0, 0]);
    } else if (kind === "caliper") {
      addPart(group, device, new THREE.BoxGeometry(1.1, 0.06, 0.13), steelMaterial, [0, 0.16, 0]);
      [-0.25, 0.3].forEach((x) => {
        addPart(group, device, new THREE.BoxGeometry(0.08, 0.32, 0.08), steelMaterial, [x, 0.29, 0.12]);
        addPart(group, device, new THREE.BoxGeometry(0.08, 0.16, 0.04), steelMaterial, [x, 0.23, -0.11]);
      });
      for (let index = 0; index < 10; index += 1) {
        addPart(group, device, new THREE.BoxGeometry(0.008, 0.045, 0.012), darkMaterial, [-0.5 + index * 0.1, 0.205, 0.06]);
      }
      addPart(group, device, new THREE.BoxGeometry(0.18, 0.08, 0.16), bodyMaterial, [-0.28, 0.2, 0]);
    } else if (kind === "power-meter") {
      addPart(group, device, new THREE.BoxGeometry(0.78, 0.4, 0.5), bodyMaterial, [0, 0.27, 0]);
      addPart(group, device, new THREE.PlaneGeometry(0.52, 0.24), new THREE.MeshBasicMaterial({ map: makePanelTexture(device, state.config || {}) }), [-0.04, 0.33, 0.27]);
      addPart(group, device, new THREE.CylinderGeometry(0.09, 0.09, 0.035, 24), accentMaterial, [0.28, 0.31, 0.28], [Math.PI / 2, 0, 0]);
      addPart(group, device, new THREE.CylinderGeometry(0.11, 0.11, 0.16, 24), blackMetal, [0, 0.45, 0], [Math.PI / 2, 0, 0]);
      addPart(group, device, new THREE.CircleGeometry(0.082, 24), glassMaterial, [0, 0.45, 0.085]);
    } else if (kind === "spectrometer" && device.variant === "ftir") {
      addPart(group, device, new THREE.BoxGeometry(1.1, 0.52, 0.7), bodyMaterial, [0, 0.34, 0]);
    } else {
      const wide = ["spectrometer", "instrument", "load", "logic-analyzer", "signal", "power"].includes(device.type);
      const width = wide ? 0.92 : 0.7;
      addPart(group, device, beveledBoxGeometry(width, 0.46, 0.48, 0.045), bodyMaterial, [0, 0.28, 0]);
      addPart(group, device, new THREE.BoxGeometry(width - 0.06, 0.36, 0.025), blackMetal, [0, 0.3, 0.252]);
      const panelTexture = makePanelTexture(device, state.config || {});
      addPart(group, device, new THREE.PlaneGeometry(width * 0.54, 0.22), new THREE.MeshBasicMaterial({ map: panelTexture }), [-width * 0.12, 0.32, 0.268]);
      for (let index = 0; index < 2; index += 1) {
        addPart(
          group,
          device,
          new THREE.CylinderGeometry(0.047, 0.047, 0.036, 18),
          index ? accentMaterial : brassMaterial,
          [width * 0.31, 0.38 - index * 0.16, 0.276],
          [Math.PI / 2, 0, 0]
        );
      }
    }

    const ports = window.OptilabPanorama?.getPorts(device.id) || ["MEASURE", "GND"];
    ports.slice(0, 3).forEach((port, index) => {
      addPart(
        group,
        device,
        new THREE.CylinderGeometry(0.032, 0.032, 0.045, 14),
        index === 0 ? brassMaterial : steelMaterial,
        [-0.22 + index * 0.22, 0.15, 0.31],
        [Math.PI / 2, 0, 0]
      );
    });

    const selectionRing = addPart(
      group,
      device,
      new THREE.RingGeometry(0.31, 0.35, 40),
      new THREE.MeshBasicMaterial({
        color: accent,
        transparent: true,
        opacity: 0.12,
        side: THREE.DoubleSide,
        depthWrite: false
      }),
      [0, 0.014, 0],
      [-Math.PI / 2, 0, 0]
    );
    selectionRing.userData.selectionRing = true;

    const label = makeLabelSprite(device.label, device.accent || "#d9b474");
    label.scale.set(1.32, 0.248, 1);
    label.position.set(0, 0.02, 0.62);
    label.userData.deviceId = device.id;
    group.add(label);
    group.scale.setScalar(1.12);
    group.position.set((device.x - 0.5) * 9.2, 0.03, (device.y - 0.5) * 5.2);
    state.initialPositions.set(device.id, group.position.clone());
    return group;
  }

  function clearObject(group) {
    if (!group) return;
    while (group.children.length) {
      const child = group.children.pop();
      child.traverse?.((node) => {
        node.geometry?.dispose?.();
        if (Array.isArray(node.material)) node.material.forEach((material) => {
          material.map?.dispose?.();
          material.dispose?.();
        });
        else {
          node.material?.map?.dispose?.();
          node.material?.dispose?.();
        }
      });
    }
  }

  function disposeObject(root) {
    if (!root) return;
    root.traverse?.((node) => {
      node.geometry?.dispose?.();
      if (Array.isArray(node.material)) {
        node.material.forEach((material) => {
          material.map?.dispose?.();
          material.alphaMap?.dispose?.();
          material.dispose?.();
        });
      } else {
        node.material?.map?.dispose?.();
        node.material?.alphaMap?.dispose?.();
        node.material?.dispose?.();
      }
    });
  }

  function createLowDetailProxy(device) {
    const THREE = state.three;
    const proxy = new THREE.Group();
    const accent = new THREE.Color(device.accent || "#d9b474");
    const body = addDeviceMesh(proxy, new THREE.Mesh(
      beveledBoxGeometry(0.78, 0.42, 0.48, 0.04),
      new THREE.MeshStandardMaterial({
        color: 0x26332f,
        metalness: 0.35,
        roughness: 0.62
      })
    ), device);
    body.position.y = 0.27;
    const marker = addDeviceMesh(proxy, new THREE.Mesh(
      new THREE.BoxGeometry(0.32, 0.1, 0.02),
      new THREE.MeshBasicMaterial({ color: accent })
    ), device);
    marker.position.set(0, 0.29, 0.251);
    const label = makeLabelSprite(device.label, device.accent || "#d9b474");
    label.scale.set(1.3, 0.245, 1);
    label.position.set(0, 0.02, 0.58);
    label.userData.deviceId = device.id;
    proxy.add(label);
    return proxy;
  }

  function createDeviceLOD(device, detail) {
    const THREE = state.three;
    const lod = new THREE.LOD();
    const position = detail.position.clone();
    detail.position.set(0, 0, 0);
    lod.position.copy(position);
    lod.userData.deviceId = device.id;
    lod.userData.kind = deviceKind(device);
    lod.addLevel(detail, 0);
    lod.addLevel(createLowDetailProxy(device), 12);
    state.proceduralGroups.set(device.id, detail);
    return lod;
  }

  function openModelAssetDb() {
    return new Promise((resolve, reject) => {
      if (!window.indexedDB) {
        reject(new Error("当前浏览器不支持本地模型资产存储"));
        return;
      }
      const request = indexedDB.open("optilab_model_assets_v1", 1);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains("models")) {
          db.createObjectStore("models", { keyPath: "kind" });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || new Error("无法打开模型资产库"));
    });
  }

  async function readStoredModel(kind) {
    try {
      const db = await openModelAssetDb();
      return await new Promise((resolve, reject) => {
        const transaction = db.transaction("models", "readonly");
        const request = transaction.objectStore("models").get(kind);
        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => reject(request.error);
      });
    } catch {
      return null;
    }
  }

  async function saveStoredModel(asset) {
    const db = await openModelAssetDb();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction("models", "readwrite");
      transaction.objectStore("models").put(asset);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error || new Error("模型保存失败"));
    });
  }

  async function deleteStoredModel(kind) {
    const db = await openModelAssetDb();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction("models", "readwrite");
      transaction.objectStore("models").delete(kind);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error || new Error("模型删除失败"));
    });
  }

  async function loadGltfLoader() {
    if (!state.gltfLoader) {
      const module = await import(new URL("./vendor/three/addons/loaders/GLTFLoader.js", document.baseURI).href);
      state.gltfLoader = new module.GLTFLoader();
    }
    return state.gltfLoader;
  }

  function normalizeImportedModel(model, device) {
    const THREE = state.three;
    model.updateMatrixWorld(true);
    const bounds = new THREE.Box3().setFromObject(model);
    const size = bounds.getSize(new THREE.Vector3());
    const center = bounds.getCenter(new THREE.Vector3());
    const largest = Math.max(size.x, size.y, size.z, 0.001);
    const scale = 1.3 / largest;
    model.scale.multiplyScalar(scale);
    model.updateMatrixWorld(true);
    const scaledBounds = new THREE.Box3().setFromObject(model);
    const scaledCenter = scaledBounds.getCenter(new THREE.Vector3());
    model.position.x -= scaledCenter.x;
    model.position.z -= scaledCenter.z;
    model.position.y -= scaledBounds.min.y;
    model.traverse((node) => {
      if (node.isMesh) {
        node.castShadow = true;
        node.receiveShadow = true;
        node.userData.deviceId = device.id;
      }
    });
    return model;
  }

  async function hydrateImportedModel(device, lod) {
    const asset = await readStoredModel(deviceKind(device));
    if (!asset || !state.deviceGroups.has(device.id) || state.deviceGroups.get(device.id) !== lod) return false;
    try {
      const loader = await loadGltfLoader();
      const source = asset.type?.includes("json") && typeof asset.data === "string"
        ? asset.data
        : asset.data;
      const gltf = await loader.parseAsync(source, "");
      const wrapper = new state.three.Group();
      const model = normalizeImportedModel(gltf.scene, device);
      wrapper.add(model);
      const label = makeLabelSprite(device.label, device.accent || "#d9b474");
      label.scale.set(1.3, 0.245, 1);
      label.position.set(0, 0.02, 0.58);
      label.userData.deviceId = device.id;
      wrapper.add(label);
      const detail = state.proceduralGroups.get(device.id);
      const detailLevel = lod.levels.find((entry) => entry.object === detail);
      if (detailLevel) detailLevel.distance = 4.5;
      if (lod.userData.importedModel) {
        lod.removeLevel?.(lod.userData.importedModel);
        lod.remove(lod.userData.importedModel);
        disposeObject(lod.userData.importedModel);
      }
      lod.addLevel(wrapper, 0);
      lod.userData.importedModel = wrapper;
      lod.userData.modelSource = `GLB · ${asset.name}`;
      lod.userData.modelStatus = "已加载高精度模型";
      state.modelAssetStatus = lod.userData.modelStatus;
      updateModelAssetStatus();
      return true;
    } catch (error) {
      lod.userData.modelStatus = `模型读取失败：${error.message}`;
      state.modelAssetStatus = lod.userData.modelStatus;
      updateModelAssetStatus();
      return false;
    }
  }

  async function importModelFile(file) {
    const id = state.inspectorId;
    const device = state.presetInfo?.devices.find((item) => item.id === id);
    const lod = state.deviceGroups.get(id);
    if (!device || !lod || !file) return;
    const extension = file.name.split(".").pop()?.toLowerCase();
    if (!["glb", "gltf"].includes(extension)) {
      state.modelAssetStatus = "请选择 .glb 或 .gltf 模型";
      updateModelAssetStatus();
      return;
    }
    state.modelAssetStatus = "正在读取模型…";
    updateModelAssetStatus();
    const data = extension === "gltf" ? await file.text() : await file.arrayBuffer();
    await saveStoredModel({
      kind: deviceKind(device),
      data,
      name: file.name,
      type: file.type,
      updatedAt: new Date().toISOString()
    });
    const loaded = await hydrateImportedModel(device, lod);
    state.modelAssetStatus = loaded ? `已导入 ${file.name}` : state.modelAssetStatus;
    updateModelAssetStatus();
    updateSelectionHelper();
  }

  async function resetImportedModel() {
    const id = state.inspectorId;
    const device = state.presetInfo?.devices.find((item) => item.id === id);
    const lod = state.deviceGroups.get(id);
    if (!device || !lod) return;
    await deleteStoredModel(deviceKind(device));
    if (lod.userData.importedModel) {
      lod.removeLevel?.(lod.userData.importedModel);
      lod.remove(lod.userData.importedModel);
      disposeObject(lod.userData.importedModel);
      delete lod.userData.importedModel;
    }
    const detail = state.proceduralGroups.get(device.id);
    const detailLevel = lod.levels.find((entry) => entry.object === detail);
    if (detailLevel) detailLevel.distance = 0;
    lod.userData.modelSource = "OptiLab 程序化高精度模型";
    lod.userData.modelStatus = "已恢复内置模型";
    state.modelAssetStatus = lod.userData.modelStatus;
    updateModelAssetStatus();
    updateSelectionHelper();
  }

  async function exportCurrentModel() {
    const id = state.inspectorId;
    const detail = state.proceduralGroups.get(id);
    if (!detail) return;
    const module = await import(new URL("./vendor/three/addons/exporters/GLTFExporter.js", document.baseURI).href);
    const exporter = state.gltfExporter || new module.GLTFExporter();
    state.gltfExporter = exporter;
    state.modelAssetStatus = "正在导出 GLB…";
    updateModelAssetStatus();
    const result = await new Promise((resolve, reject) => {
      exporter.parse(detail, resolve, reject, { binary: true, onlyVisible: true });
    });
    const blob = new Blob([result], { type: "model/gltf-binary" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    const device = state.presetInfo?.devices.find((item) => item.id === id);
    anchor.href = url;
    anchor.download = `${deviceKind(device || {})}-${device?.id || "model"}.glb`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1200);
    state.modelAssetStatus = "当前模型已导出为 GLB";
    updateModelAssetStatus();
  }

  function updateModelAssetStatus() {
    const status = $("#lab-3d-model-status");
    if (status) status.textContent = state.modelAssetStatus;
  }

  function buildScene() {
    if (!state.ready || !state.presetInfo) return;
    const THREE = state.three;
    state.deviceGroups.forEach((group) => {
      state.scene.remove(group);
      disposeObject(group);
    });
    state.deviceGroups.clear();
    state.proceduralGroups.clear();
    state.initialPositions.clear();
    state.dynamicTextures = [];
    state.animatedObjects = [];
    state.presetInfo.devices.forEach((device) => {
      const detail = createDeviceGroup(device);
      const group = createDeviceLOD(device, detail);
      state.deviceGroups.set(device.id, group);
      state.scene.add(group);
      hydrateImportedModel(device, group);
    });
    if (!state.beamGroup) {
      state.beamGroup = new THREE.Group();
      state.scene.add(state.beamGroup);
    }
    if (!state.cableGroup) {
      state.cableGroup = new THREE.Group();
      state.scene.add(state.cableGroup);
    }
    state.selectedId = state.presetInfo.devices[0]?.id || "";
    state.hoveredId = "";
    state.processStep = 0;
    state.autoTour = false;
    state.processSteps = buildProcessSteps();
    closeInspector();
    state.cameraState.viewMode = "overview";
    document.querySelectorAll("[data-3d-view]").forEach((button) => {
      button.classList.toggle("active", button.dataset["3dView"] === "overview");
    });
    render3DDeviceDock();
    frameScene();
    updateSelectionHelper();
    rebuildConnections();
    updateProcessUI();
    updateHud();
  }

  function render3DDeviceDock() {
    const dock = $("#panorama-device-list");
    if (!dock || !state.presetInfo) return;
    dock.replaceChildren(...state.presetInfo.devices.map((device) => {
      const button = document.createElement("button");
      button.type = "button";
      button.dataset.panoramaDevice = device.id;
      button.textContent = device.label;
      button.title = `${DEVICE_KIND_LABELS[deviceKind(device)] || "实验仪器"} · 点击观察`;
      button.classList.toggle("active", device.id === state.selectedId);
      return button;
    }));
  }

  function buildProcessSteps() {
    const info = state.presetInfo;
    const devices = info?.devices || [];
    const experiment = state.config?.experiment || {};
    const name = String(experiment.name || state.presetInfo?.name || "");
    const presetId = info?.id || "";
    const findDevice = (...ids) => devices.find((device) => ids.includes(device.id));
    const findKind = (...kinds) => devices.find((device) => kinds.includes(deviceKind(device)));
    const source = findKind("laser", "optical-source") || devices[0];
    const detector = findKind("detector", "camera", "thermal-camera", "beam-profiler", "screen", "scope") || devices.at(-1);
    const scope = findKind("scope") || detector;
    const power = findKind("power-supply") || devices[0];
    const meter = findKind("multimeter", "power-meter", "daq", "logic-analyzer") || detector;
    const sample = findKind("sample") || devices[1];
    const analyzer = findKind("logic-analyzer", "computer") || devices.at(-1);
    const fiber = findKind("fiber-spool", "fiber-coupler", "optical-transceiver") || devices[1];
    const primaryLabel = state.config?.primaryLabel || experiment.primaryLabel || "主参数";
    const secondaryLabel = state.config?.secondaryLabel || experiment.secondaryLabel || "响应量";
    const makeStep = (stage, title, detail, observe, device, options = {}) => ({
      stage,
      title,
      detail,
      observe,
      deviceId: device?.id || devices[0]?.id,
      guard: options.guard || "移动器材前先确认光源关闭或电源断开，所有读数保留单位。",
      duration: options.duration || "约 3–5 分钟",
      mode: options.mode || "operate"
    });

    const presetProfiles = {
      semiconductor: "semiconductor",
      mechanics: "mechanics",
      circuit: "circuit",
      thermal: "thermal",
      biomedical: "biomedical",
      spectrometer: "spectroscopy",
      millikan: "millikan",
      diffraction: "diffraction",
      "wave-speed": "wave-speed",
      photoelectric: "photoelectric",
      "laser-lab": "laser",
      "optical-interference": "interference",
      "optics-general": "imaging",
      imaging: "imaging",
      polarization: "polarization",
      digital: "digital",
      solar: "solar",
      "fiber-lab": "fiber",
      embedded: "embedded",
      communication: "communication",
      fpga: "digital",
      integrated: "integrated"
    };
    let profile = "general";
    if (presetId.startsWith("professional-")) profile = presetId;
    else if (presetProfiles[presetId]) profile = presetProfiles[presetId];
    else if (/干涉/.test(name)) profile = "interference";
    else if (/衍射|光栅|莫尔条纹|涡旋光束/.test(name)) profile = "diffraction";
    else if (/偏振|马吕斯/.test(name)) profile = "polarization";
    else if (/分光计|光谱|傅里叶变换|线宽|波长/.test(name)) profile = "spectroscopy";
    else if (/激光|调Q|谐振腔/.test(name)) profile = "laser";
    else if (/成像|CCD|CMOS|全息|机器视觉|图像处理/.test(name)) profile = "imaging";
    else if (/光纤|FBG|EDFA|EDFL|OTDR|光通信|光放大器/.test(name)) profile = "fiber";
    else if (/光电效应|弗兰克|响应度|暗电流|光子|荧光/.test(name)) profile = "photoelectric";
    else if (/光伏|太阳能|光电池/.test(name)) profile = "solar";
    else if (/摆|振动|转动惯量|杨氏模量|共振/.test(name)) profile = "mechanics";
    else if (/比热|热导|温度|热透镜/.test(name)) profile = "thermal";
    else if (/生物信号|心电|肌电/.test(name)) profile = "biomedical";
    else if (/逻辑|触发|计数|FPGA|数字系统/.test(name)) profile = "digital";
    else if (/单片机|GPIO|ADC|DAC|UART|I2C|SPI|PWM|Arduino/.test(name)) profile = "embedded";
    else if (/示波器|电桥|基尔霍夫|戴维南|诺顿|万用表|伏安|电路|谐振/.test(name)) profile = "circuit";

    const first = makeStep(
      "准备",
      /professional/.test(profile) ? "核对器材清单与实验条件" : "完成安全检查和器材初检",
      `检查${source?.label || "主设备"}、${sample?.label || "样品/负载"}和${detector?.label || "测量端"}的外观、量程与连接端口；按实验指导书确认${primaryLabel}的初始范围。`,
      "电源状态、器材铭牌、插头绝缘和平台水平",
      source,
      {
        guard: /光电|干涉|衍射|偏振|激光|spectroscopy|fiber/.test(profile)
          ? "确认激光等级和遮光条件，严禁直视光束或裸光纤端面；高反光器件须先固定。"
          : "先断电再接线，检查极性与共地；不要超出仪器额定电压和电流。",
        mode: "prepare"
      }
    );

    const core = {
      interference: [
        ["安装", "建立分束干涉光路", `将${source?.label || "光源"}、分束镜和两路反射镜按导轨依次固定，先让各器件光心近似同高。`, "光斑是否从每个镜片中心通过", findDevice("splitter", "mirror-a") || sample],
        ["校准", "完成等光程与共轴调节", "先取下观察屏，用白纸追踪两路回光；微调镜架使两束光在远端重合，再减小光程差。", "两路光斑重合程度和条纹可见度", findDevice("mirror-a", "mirror-b") || source],
        ["调焦", "安装透镜并捕获干涉条纹", `放入${findDevice("lens")?.label || "聚焦透镜"}和观察屏，前后移动屏幕，找到条纹最清晰且不饱和的位置。`, "条纹间距、中心位置和明暗对比", findDevice("screen") || detector],
        ["扫描", "进行相位或位移扫描", `以${secondaryLabel}为步进量，从零附近开始做单向或往返扫描；每步等待读数稳定后再记录。`, "条纹吞吐方向、计数起点和回程差异", detector, { mode: "scan", duration: "约 6–10 分钟" }],
        ["复核", "检查干涉数据并重复测量", "由条纹数计算光程差或面型，检查首尾方向误差；保持环境不变重复三次，记录温度与振动干扰。", "拟合残差、条纹计数误差和重复性", analyzer, { mode: "verify" }]
      ],
      diffraction: [
        ["安装", "固定光源、狭缝和光栅", `保持${source?.label || "光源"}与平台导轨平行，将狭缝或光栅垂直光轴安装，避免刀口损伤。`, "零级光斑是否居中、光斑是否被截断", findDevice("slit", "grating") || sample],
        ["校准", "调节准直与观察距离", `放入${findDevice("lens")?.label || "准直/聚焦透镜"}，让光束平行或聚焦；量取光屏到衍射元件的有效距离。`, "零级与高级次的对称性和清晰度", findDevice("lens") || detector],
        ["测量", "采集衍射级次与条纹位置", "从中心向两侧测量暗纹、明纹或光谱级次的位置，左右各读取一次以抵消零点偏差。", "级次顺序、左右对称和背景光", findDevice("screen") || detector],
        ["变量", "改变缝宽、周期或光源波长", `以${primaryLabel}为变量逐点更换参数，每次更换后重新检查光轴并记录新的图样。`, "条纹间距随参数的变化方向", source, { mode: "scan", duration: "约 6–8 分钟" }],
        ["复核", "计算参数并检验误差", "由条纹间距拟合缝宽、光栅常数或波长，检查角度近似与屏距测量误差，并重复代表性测点。", "拟合斜率、衍射角不确定度和异常级次", analyzer, { mode: "verify" }]
      ],
      polarization: [
        ["安装", "安装起偏器与检偏器", `先固定${source?.label || "光源"}，将起偏器置于探测器前，再把检偏器装入带角度刻度的旋转镜架。`, "起偏器刻度和检偏器转轴是否同轴", findDevice("polarizer") || sample],
        ["校准", "寻找正交消光位置", "转动检偏器找到最小透射光强，将该方向记为 90° 或零参考点，并记录暗电流。", "最小光强、刻度回差和杂散光", findDevice("analyzer", "polarizer") || detector],
        ["样品", "放入待测样品或波片", `在起偏器与检偏器之间放入${sample?.label || "样品"}，检查反射或吸收是否使光斑偏移。`, "样品位置、表面法线和透射光斑", sample],
        ["扫描", "按角度逐点测量透射强度", `检偏器每隔固定角度旋转一次，以${secondaryLabel}作为响应量，记录角度与光强并保持光源稳定。`, "光强是否服从预期角度关系", detector, { mode: "scan", duration: "约 6–10 分钟" }],
        ["复核", "拟合偏振模型并重复测量", "用余弦平方或偏振传递模型拟合数据，检查 90° 周期与消光比；回到零位重复一轮。", "拟合 R²、消光比和角度零点", analyzer, { mode: "verify" }]
      ],
      spectroscopy: [
        ["安装", "预热光源并调整入射光路", `开启${source?.label || "光源"}预热，调节准直管使入射光成为平行光，并让狭缝像落在望远镜视场中心。`, "谱线亮度、狭缝宽度和光源稳定时间", source, { duration: "约 8–15 分钟" }],
        ["校准", "建立角度零点与仪器基准", "先用零级光或已知谱线校准分光计/光谱仪角度，记录游标零点、暗电流和波长偏移。", "零级位置、左右游标差和基线漂移", findDevice("spectrometer") || analyzer],
        ["分光", "调节棱镜最小偏向或光栅衍射", `旋转载物台或光栅座，找到谱线最窄的位置；比较${sample?.label || "待测样品"}前后的光谱变化。`, "谱线锐度、色散方向和背景谱", findDevice("prism", "grating") || sample],
        ["采集", "逐条测量光谱峰与谱线位置", `围绕${primaryLabel}逐点采集光谱，记录峰位、峰高与半高宽，并避免探测器饱和。`, "峰值波长、信噪比和峰形对称性", analyzer, { mode: "scan", duration: "约 8–12 分钟" }],
        ["复核", "完成波长标定与重复测量", "用标准灯或已知谱线建立标定曲线，检查峰位残差；重复空白和样品测量，比较基线漂移。", "标定斜率、峰位误差和样品重复性", analyzer, { mode: "verify" }]
      ],
      laser: [
        ["预热", "检查激光安全并预热系统", `确认${source?.label || "激光器"}的冷却、驱动极性和急停状态，按说明书预热到输出稳定。`, "输出功率漂移、温度与冷却状态", source, { duration: "约 10–20 分钟" }],
        ["安装", "安装腔镜和泵浦光路", "先放入后腔镜、增益介质和前腔镜，用低功率辅助光检查光轴，禁止在开光时调整镜片正面。", "回光是否重合并落在腔镜中心", findDevice("mirror-a", "mirror-b") || source],
        ["阈值", "寻找阈值并建立稳定工作点", `从低泵浦电流开始，缓慢增加并记录${primaryLabel}；找到起振阈值后回退到安全工作区。`, "阈值拐点、输出跳变和模式稳定性", detector, { mode: "scan" }],
        ["调谐", "测量功率、模式和光束参数", "沿光轴测量功率、光束直径和模式图样；检查束腰位置和光斑是否椭圆，避免功率计过载。", "光斑模式、功率斜率和光束质量", findDevice("beam-profiler", "power-meter") || detector],
        ["复核", "检查热稳定与重复性", "待温度稳定后重复功率测量，记录开关光前后的基线漂移；关机前先降低泵浦或调 Q 驱动。", "功率漂移、温度漂移和重复测量偏差", analyzer, { mode: "verify" }]
      ],
      imaging: [
        ["安装", "布置照明、标定靶与相机", `固定${source?.label || "光源"}和${sample?.label || "标定靶"}，将${findKind("camera")?.label || "相机"}光轴垂直靶面并锁紧支架。`, "靶面照度均匀性、相机光轴和遮挡", findKind("camera") || detector],
        ["调焦", "调焦并设置工作距离", `放入${findDevice("lens")?.label || "成像透镜"}，移动相机或靶面直到边缘与中心同时清晰，记录物距和像距。`, "边缘 MTF、对焦峰和视场范围", findDevice("lens") || detector],
        ["曝光", "调整光圈、曝光和增益", "先降低增益，以曝光时间匹配最亮区域；检查直方图不削顶、不压黑，再保存暗场和平场参考。", "直方图、饱和像素和暗噪声", findKind("camera") || analyzer],
        ["采集", "采集图像并执行标定", "拍摄标定靶、空白和待测样品，保持相机位置不变；按像素尺寸、畸变和亮度建立标定。", "重复定位、图像漂移和标定残差", analyzer, { mode: "scan", duration: "约 6–10 分钟" }],
        ["复核", "比较处理结果与重复图像", "用同一参数处理三次采集，比较中心位置、边缘清晰度和测量值；检查图像压缩或自动增益造成的变化。", "重复性、畸变和算法边界误差", analyzer, { mode: "verify" }]
      ],
      fiber: [
        ["安装", "检查光纤端面并建立链路", `关闭${source?.label || "光源"}后检查 FC/APC 端面，使用无水乙醇和擦纤纸清洁，再按缺口方向插入耦合器或光纤盘。`, "端面洁净度、连接卡扣和弯曲半径", fiber],
        ["校准", "测量入纤功率与零基线", `开启低功率光源，记录${source?.label || "光源"}输出、入纤功率和光功率计零点；避免裸纤端面直视。`, "插损、回波和功率计响应", findDevice("power-meter") || detector],
        ["参考", "建立直通链路参考值", "用短跳线建立基准链路，记录各波长下的参考功率；再换入待测光纤或器件，保持接头清洁和位置一致。", "参考功率、连接重复性和波长漂移", fiber],
        ["扫描", "测量损耗、应变或通信响应", `围绕${primaryLabel}扫描，记录${secondaryLabel}及眼图/误码率；每个测点等待功率稳定后再读数。`, "眼图张开度、损耗斜率和噪声", detector, { mode: "scan", duration: "约 8–12 分钟" }],
        ["复核", "重复连接并核算不确定度", "断开并重新连接一次，比较插损重复性；检查光纤弯曲、接头污染和环境温度对结果的影响。", "重连偏差、链路损耗和误码率", analyzer, { mode: "verify" }]
      ],
      photoelectric: [
        ["安装", "布置光源、样品与探测器", `固定${source?.label || "光源"}和${sample?.label || "样品"}，让光斑完全落入${detector?.label || "探测器"}有效面，遮去环境光。`, "暗场漏光、光斑覆盖和探测器温度", detector],
        ["校准", "测量暗电流与零点", "断开光源或关闭快门，等待探测器稳定后记录暗电流；检查偏置电压和前置放大器量程。", "暗电流漂移、零点偏置和噪声底", findKind("power-meter", "multimeter", "scope") || detector],
        ["偏置", "设置安全工作偏置", `从低偏置开始逐级增加，观察${secondaryLabel}是否随${primaryLabel}单调变化；发现击穿或饱和立即回退。`, "I–V 曲线拐点、饱和区和温升", detector, { mode: "scan" }],
        ["扫描", "改变波长、光强或频率并采集", "按固定步长改变光强、波长或调制频率，记录光电流、响应时间与背景噪声，标记饱和点。", "响应度、截止频率和信噪比", findKind("scope", "multimeter") || detector, { mode: "scan", duration: "约 8–12 分钟" }],
        ["复核", "计算响应度并重复低光强测量", "扣除暗电流后计算响应度与量子效率，检查线性范围；重复最弱信号点以确认噪声和漂移。", "线性拟合、响应度误差和重复性", analyzer, { mode: "verify" }]
      ],
      solar: [
        ["安装", "固定光源、太阳电池与负载", `将${source?.label || "光源"}、${sample?.label || "光伏样品"}和${findKind("load")?.label || "电子负载"}放在同一光轴，记录光源距离和角度。`, "光斑覆盖、电池温度与接线极性", sample],
        ["校准", "测量开路电压和短路电流", "关闭负载后测开路电压，再以低阻表测短路电流；确认万用表量程和测试时间，避免样品发热。", "Voc、Isc 和光源稳定时间", findKind("multimeter", "power-meter") || detector],
        ["扫描", "执行 I–V 曲线扫描", `逐步改变电子负载，记录${primaryLabel}与${secondaryLabel}，从短路端扫描到开路端。`, "曲线膝点、填充因子和串联电阻", findKind("load", "daq") || analyzer, { mode: "scan", duration: "约 8–12 分钟" }],
        ["变量", "比较光强、角度或温度影响", "在代表性负载下改变光照强度、入射角或样品温度，每个条件稳定后再采集完整曲线。", "短路电流、开路电压和温度系数", source],
        ["复核", "计算效率并检查重复性", "由最大功率点计算填充因子和转换效率，重复标准光照条件；检查接触电阻和热漂移。", "Pmax、FF、效率及重复测量偏差", analyzer, { mode: "verify" }]
      ],
      mechanics: [
        ["安装", "调平支架并安装摆动装置", `固定${findKind("pendulum")?.label || "摆动装置"}，调整底座水平，确认悬点、摆杆和光电门均在安全高度。`, "支架垂直度、摆杆自由度和地面振动", findKind("pendulum") || sample],
        ["校准", "对准光电门并清零计时器", `将${findKind("photogate")?.label || "光电门"}放在摆锤最低点，检查遮光触发和计时分辨率。`, "触发次数、遮光宽度和计时零点", findKind("photogate") || scope],
        ["预摆", "检查小角度自由振动", "以较小初始角度释放摆锤，不施加侧向力；预记录三个周期，确认摆动平面稳定。", "摆动平面、周期漂移和幅度衰减", findKind("pendulum") || detector],
        ["测量", "改变长度、质量或驱动力", `围绕${primaryLabel}设置一系列条件，每个条件测量多个周期，使用光电门或示波器记录时间。`, "周期重复性、共振峰和相位差", scope, { mode: "scan", duration: "约 8–15 分钟" }],
        ["复核", "拟合理论模型并重复测量", "用周期、幅值或频率关系拟合模型，检查系统误差；重复最短与最长周期条件确认量程。", "拟合斜率、阻尼和重复测量误差", analyzer, { mode: "verify" }]
      ],
      thermal: [
        ["安装", "准备样品与温度接触", `将${sample?.label || "待测样品"}安装在${findKind("heater", "calorimeter")?.label || "加热/量热装置"}中，确保温度探头充分接触并绝缘。`, "样品位置、探头贴合和冷却水状态", findKind("heater", "calorimeter") || sample],
        ["平衡", "记录初始温度并等待平衡", "在无加热条件下等待温度漂移小于设定阈值，记录室温、初始温度和采样间隔。", "基线漂移、环境温度和探头一致性", findKind("sensor-module") || detector],
        ["加热", "建立稳定加热或热流条件", `从低功率开始施加${primaryLabel}，观察${secondaryLabel}随时间的变化，避免超温和局部汽化。`, "升温曲线、热流稳定时间和接触热阻", findKind("heater") || sample],
        ["采集", "记录完整升降温曲线", "以固定采样间隔连续记录温度和功率，直到达到稳态或预设终点；保存原始时间序列。", "线性区、稳态平台和散热拐点", findKind("daq", "thermometer") || analyzer, { mode: "scan", duration: "约 10–20 分钟" }],
        ["复核", "计算热学参数并重复实验", "用稳态或瞬态模型计算热导率/比热容，检查初始线性段；重复一次升降温确认滞后。", "拟合误差、热损失和重复性", analyzer, { mode: "verify" }]
      ],
      biomedical: [
        ["安装", "准备电极与安全连接", `检查${source?.label || "受试者连接"}与${findKind("electrode")?.label || "生物电电极"}的绝缘，清洁皮肤后按标准位置贴附电极，先接参考地。`, "电极接触阻抗、皮肤状态和受试者舒适度", findKind("electrode") || sample],
        ["校准", "设置增益、带宽与共模抑制", `开启${findKind("bioamp")?.label || "生物电放大器"}，使用内部校准信号检查增益、滤波和基线，确认不进入饱和。`, "基线漂移、50 Hz 干扰和削顶", findKind("bioamp") || detector],
        ["静息", "采集静息基线信号", "受试者保持静止，先记录至少一分钟基线；观察肌电干扰、呼吸伪迹和电极松动。", "心率、基线稳定性和伪迹", findKind("daq", "scope") || detector],
        ["刺激", "记录生理过程或动作响应", `按实验要求施加${primaryLabel}，同步记录${secondaryLabel}，标记事件时刻并保持环境安静。`, "波形重复性、延迟和幅度变化", analyzer, { mode: "scan", duration: "约 5–10 分钟" }],
        ["复核", "清理电极并重复测量", "停止采集后先断开信号再移除电极，清洁接触部位；比较三次记录的基线、峰值和伪迹。", "重复性、噪声底与受试者安全", analyzer, { mode: "verify" }]
      ],
      digital: [
        ["安装", "核对芯片方向与电源引脚", `断电检查${devices[0]?.label || "数字电路板"}的 VCC/GND、芯片缺口和排针方向，防止反接。`, "电源极性、芯片缺口和短路", power],
        ["接线", "连接逻辑输入、输出和地线", "使用标准杜邦线连接电源、时钟、输入开关和输出指示；高速信号尽量缩短回路。", "接线表、共地和高频串扰", findKind("breadboard", "mcu-board") || power],
        ["校准", "设置逻辑分析仪采样率与门限", `连接${findKind("logic-analyzer")?.label || "逻辑分析仪"}，设置与 3.3 V/5 V 逻辑一致的阈值和足够高的采样率。`, "通道顺序、触发边沿和地线噪声", findKind("logic-analyzer") || analyzer],
        ["激励", "输入真值表或时钟序列", `按${primaryLabel}逐项改变输入状态，检查输出指示和逻辑波形；每个状态保持到采样完成。`, "状态切换、竞争冒险和毛刺", findKind("signal") || source],
        ["采集", "保存总线波形和时序结果", "触发稳定边沿后采集完整序列，记录建立时间、保持时间和时钟相位；与真值表或状态图逐项对照。", "时序余量、异常脉冲和延迟", analyzer, { mode: "scan" }],
        ["复核", "复位系统并重复关键状态", "保存波形后执行系统复位，重复边界输入状态；检查首次状态、复位值和掉电恢复。", "复位值、重复时序和电源跌落", analyzer, { mode: "verify" }]
      ],
      embedded: [
        ["安装", "核对开发板与外设引脚", `断电检查${findKind("mcu-board")?.label || "开发板"}的供电跳线、IO 电平和${sample?.label || "外设"}接口，避免 5 V 信号直连 3.3 V 引脚。`, "板卡版本、跳线位置和共地", findKind("mcu-board") || power],
        ["接线", "连接传感器、执行器和调试口", `按${info?.standards || "接口表"}接入传感器、显示器和调试器，先接参考地，再连接信号与电源。`, "接口方向、上位机识别和短路", findKind("sensor-module", "actuator") || power],
        ["下载", "编译、下载并确认启动日志", "编译程序并下载到板卡，通过串口确认复位、时钟和固件版本；先运行最小闪灯或通信测试。", "启动日志、串口波特率和复位原因", findKind("computer") || analyzer],
        ["功能", "逐项验证 IO、定时器和通信", `改变${primaryLabel}产生输入事件，观察${secondaryLabel}和接口波形；分别测试正常、边界和断线状态。`, "采样值、时序、丢包和异常码", findKind("logic-analyzer", "scope") || detector, { mode: "scan", duration: "约 6–12 分钟" }],
        ["复核", "保存日志并执行冷启动测试", "保存串口记录和关键波形，断电重启后再验证初始状态；检查看门狗、超时和通信恢复。", "掉电恢复、重复启动和数据一致性", analyzer, { mode: "verify" }]
      ],
      circuit: [
        ["安装", "断电识别元件与仪表量程", `检查${findKind("breadboard")?.label || "电路板"}、${sample?.label || "被测元件"}和${meter?.label || "测量仪表"}，按色环/铭牌记录标称值。`, "元件参数、仪表量程和测试线完整性", power],
        ["接线", "按电路图连接电源、信号与参考地", `使用${info?.standards || "标准测试线"}完成接线，输入端先短接或置零，保留可快速断电的开关。`, "节点对应、极性和接触电阻", findKind("breadboard", "probe") || power],
        ["校准", "清零仪表并设置保护", `将${meter?.label || "测量仪表"}置零，设置电压/电流限制和示波器探头衰减；确认信号源输出关闭。`, "零点、探头倍率、限流和触发", meter],
        ["测量", "限流上电并建立工作点", "从低电压开始，缓慢增加输出；先测静态工作点，再打开信号源，观察是否出现异常发热或削顶。", "静态电压、电流和波形畸变", scope],
        ["扫描", "改变参数并记录双向响应", `围绕${primaryLabel}从低到高、再从高到低测量${secondaryLabel}，每点等待稳定后记录，检查回差与非线性。`, "线性区、拐点、回差和噪声", findKind("scope", "multimeter") || detector, { mode: "scan", duration: "约 6–12 分钟" }],
        ["复核", "降低输出、断电并重复关键点", "先降电源、再关信号、后拆线；回到两三个关键点复测，比较理论计算和测量偏差。", "重复性、功耗和连接接触误差", analyzer, { mode: "verify" }]
      ],
      semiconductor: [
        ["安装", "安装器件并识别测试夹具", `断电后检查${findDevice("diode")?.label || "半导体测试夹具"}的引脚方向、限流电阻和${findKind("multimeter", "scope")?.label || "测量仪表"}量程。`, "器件极性、夹具接触和仪表量程", findDevice("diode") || sample],
        ["校准", "测量零偏与暗态基线", `在${primaryLabel}为零时记录漏电流或暗态输出，检查探头共地、屏蔽和温漂；必要时执行仪表调零。`, "零偏电流、噪声底和温漂", meter],
        ["偏置", "从小电压开始扫描工作区", "从零偏开始逐级增加偏置，记录正向、反向和拐点区域；达到限流或热漂移时立即回退。", "导通拐点、击穿风险和功率耗散", power, { mode: "scan" }],
        ["变量", "测量温度或光照对特性的影响", `在代表性偏置下改变${secondaryLabel}，记录温度、光强或频率响应；每个条件等待热平衡和电学稳定。`, "曲线平移、响应度和迟滞", detector, { mode: "scan", duration: "约 8–12 分钟" }],
        ["复核", "拟合器件参数并重复低偏置点", "由曲线提取阈值、斜率电阻或响应度，检查低偏置与高偏置区段误差；重复一个易漂移点确认可复现性。", "拟合参数、功耗和重复测量误差", analyzer, { mode: "verify" }]
      ],
      millikan: [
        ["安装", "调平油滴室与读数显微镜", `将${findKind("millikan-chamber")?.label || "油滴室"}放在水平基座上，调节${findKind("microscope")?.label || "读数显微镜"}焦距，使上下极板刻线清晰。`, "极板水平、刻度清晰和视场照明", findKind("millikan-chamber") || sample],
        ["校准", "检查高压电源与计时零点", `从零电压开始检查${findKind("power-supply")?.label || "高压电源"}的输出和极性，记录极板间距、黏度与环境温度。`, "电压零点、极板间距和温度", findKind("power-supply") || power],
        ["喷雾", "喷入油滴并锁定单一粒子", "短促喷雾后关闭油雾入口，选择电量适中、运动平稳的单颗油滴，避免相邻油滴干扰。", "油滴清晰度、漂移和电荷稳定性", findKind("millikan-chamber") || detector],
        ["平衡", "调节电压使油滴悬停", "缓慢增加极板电压，使油滴在视场中心附近悬停；记录平衡电压并检查是否反复上下漂移。", "悬停位置、电压细调和热对流", findKind("power-supply") || power, { mode: "scan" }],
        ["测量", "测量匀速下落时间并重复", "撤去电场后记录油滴通过两段刻线的时间，重复同一油滴多次，再更换至少五颗油滴。", "下落时间、速度和电荷量子化", findKind("daq", "computer") || analyzer, { mode: "scan", duration: "约 10–20 分钟" }],
        ["复核", "计算基本电荷并检查误差", "由平衡电压、下落速度和油滴半径计算电荷，按公约数分析基本电荷；检查半径和黏度修正。", "电荷分组、相对误差和异常油滴", analyzer, { mode: "verify" }]
      ],
      "wave-speed": [
        ["安装", "布置声/光传播路径", `固定${findKind("acoustic-transducer")?.label || "换能器"}、${sample?.label || "传播介质"}和${findKind("detector", "probe")?.label || "接收端"}，测量有效传播距离。`, "传播距离、轴线对准和环境反射", findKind("acoustic-transducer") || source],
        ["校准", "同步信号源与示波器触发", `将${findKind("generator")?.label || "信号源"}接入发射端和示波器触发端，检查通道延迟、探头倍率与触发稳定度。`, "参考相位、触发抖动和探头延迟", findKind("generator") || scope],
        ["传播", "观察发射与接收波形", "用双通道示波器同时观察发射和接收信号，移动接收端改变传播距离，记录相位差或到达时间。", "波形相关、相位差和噪声", findKind("scope") || detector],
        ["测量", "改变距离并作线性拟合", `围绕${primaryLabel}设置多个传播距离，记录${secondaryLabel}；每个点重复读数并保持介质温度稳定。`, "斜率、截距和传播延迟", analyzer, { mode: "scan", duration: "约 6–12 分钟" }],
        ["复核", "由拟合斜率计算波速并重复", "用距离—时间/相位关系拟合传播速度，检查换能器延迟和环境温度修正；复测最短和最远距离。", "拟合 R²、波速误差和反射干扰", analyzer, { mode: "verify" }]
      ],
      communication: [
        ["安装", "检查光收发模块和光纤链路", `关闭光源后清洁 FC 接口，将${findKind("optical-transceiver")?.label || "光收发模块"}与${fiber?.label || "光纤盘"}按方向连接，检查供电和地线。`, "接口洁净度、连接方向和供电", findKind("optical-transceiver") || fiber],
        ["校准", "建立接收端零基线与参考电平", `开启低功率发射，调整${findKind("scope")?.label || "示波器"}垂直档位和触发，记录无调制时的接收噪声和偏置。`, "眼图基线、噪声和接收幅度", scope],
        ["调制", "输入数字码流或模拟信号", `由${findKind("generator")?.label || "信号源"}输入设定码率与幅度，检查调制深度、波形上升沿和削顶。`, "码率、调制深度和失真", findKind("generator") || source],
        ["测试", "测量眼图、误码率与衰减", `逐级增加衰减或光纤长度，记录${primaryLabel}与${secondaryLabel}；保持采样相位不变比较眼图张开度。`, "眼图张开、抖动、误码和链路余量", analyzer, { mode: "scan", duration: "约 8–15 分钟" }],
        ["复核", "重新连接并验证通信恢复", "断开再连接光纤，比较插损与误码率；保存原始码流、眼图截图和测试衰减值。", "重连损耗、通信恢复和重复性", analyzer, { mode: "verify" }]
      ],
      integrated: [
        ["安装", "定义综合测量链与数据接口", `梳理${source?.label || "激励端"}、${sample?.label || "被测对象"}、${detector?.label || "检测端"}和${findKind("computer")?.label || "分析端"}之间的信号流与数据接口。`, "模块边界、供电和同步信号", findKind("computer") || detector],
        ["接线", "连接仪器与自动采集链路", `按${info?.standards || "接口表"}连接触发、测量和通信线，检查共地、隔离与数据采集通道。`, "触发同步、接口方向和丢包", findKind("daq") || analyzer],
        ["校准", "建立参考状态与自动测试脚本", "先手工完成基准测量，再用同一量程设置自动扫描；确认软件显示值与仪器读数一致。", "脚本参数、参考值和采样间隔", analyzer],
        ["联调", "逐模块运行并联调闭环", `依次验证${primaryLabel}、数据采集、处理和显示；发现问题时回到单一模块逐步排除。`, "闭环响应、延迟和异常日志", detector, { mode: "scan" }],
        ["验收", "完成重复测量与数据一致性检查", "自动重复至少三轮，比较均值、离散度和异常点；检查断电重启后的参数与版本。", "三轮一致性、版本记录和异常点", analyzer, { mode: "verify" }]
      ],
      general: [
        ["安装", "按实验步骤安装样品与测量端", `固定${sample?.label || "待测样品"}、${meter?.label || "测量端"}和连接线，确保基准面一致并记录初始参数。`, "样品位置、连接状态和初始读数", sample],
        ["校准", "完成零点、量程或参考测量", `对${meter?.label || "测量仪表"}做零点/量程检查，记录空白或标准件结果，确认偏差在允许范围。`, "零线、标准值和背景噪声", meter],
        ["测量", "设置主参数并观察响应", `从安全起点逐步改变${primaryLabel}，观察${secondaryLabel}是否按预期变化；异常时立即回到初始状态。`, "响应方向、稳定时间和异常点", detector, { mode: "scan" }],
        ["采集", "按计划完成多点或重复测量", "在覆盖工作范围的位置采集数据，每个测点保留两次读数；标出饱和、跳变和接触不良位置。", "数据范围、重复读数和异常点", analyzer, { mode: "scan", duration: "约 6–10 分钟" }],
        ["复核", "计算不确定度并重复基准点", "完成初步计算后回到首尾基准点复测，比较漂移和环境变化；保存原始数据、单位和实验条件。", "拟合残差、漂移和重复性", analyzer, { mode: "verify" }]
      ]
    };

    let middle = core[profile] || core.general;
    if (profile === "professional-arduino") {
      middle = [
        ["接线", "完成 Arduino 超声测距接线", `断电后将 SR04 的 VCC/GND、Trig/Echo，LCD1602 的 I²C 引脚和蜂鸣器/LED 接入${findKind("mcu-board")?.label || "控制板"}。`, "引脚编号、5 V 供电和共地", findKind("mcu-board") || power],
        ["下载", "下载测距与显示程序", "先运行最小串口测试，再烧录测距、显示和报警逻辑；确认串口输出的距离单位与刷新率。", "程序版本、串口数据和复位", findKind("computer") || analyzer],
        ["校准", "用标尺标定超声波读数", "在不同距离放置平面挡板，记录标尺距离和串口读数；修正安装偏角与环境温度造成的小偏差。", "重复读数、回波丢失和量程上限", findKind("sensor-module") || sample],
        ["报警", "验证显示与声光报警阈值", "改变挡板距离触发阈值，检查 LCD、蜂鸣器和 LED 是否同时动作；记录滞后距离。", "动作阈值、延迟和误触发", findKind("alarm", "lcd-module") || detector]
      ];
    } else if (profile === "professional-robotics" || profile === "professional-robot") {
      middle = [
        ["接线", "连接传感器、执行器和主控", `按接线图连接${findKind("sensor-module")?.label || "传感器"}、执行器和${findKind("mcu-board")?.label || "主控板"}，检查轮组和电源极性。`, "接口对应、电机转向和轮距", findKind("mcu-board") || power],
        ["下载", "下载运动与避障程序", "先完成单轮和单传感器测试，再运行完整避障状态机；确认急停逻辑和通信超时。", "程序状态、串口日志和急停", findKind("computer") || analyzer],
        ["标定", "标定传感器与运动参数", "在低速度下记录传感器读数、行驶距离和转向角度，调整速度环和转向零点。", "直线偏差、转向半径和测距误差", findKind("sensor-module") || detector],
        ["测试", "执行直线、转向与避障测试", "在安全边界内逐项测试，记录每次触发、避障和停车动作；禁止无人看管运行。", "重复路径、碰撞边界和电池电压", findKind("robot") || analyzer, { mode: "scan" }]
      ];
    } else if (profile === "professional-modeling") {
      middle = [
        ["建模", "完成三维建模与切片", `在${findKind("computer")?.label || "工作站"}中建立模型，检查壁厚、装配间隙和坐标原点，再设置打印/加工参数。`, "模型尺寸、壁厚和支撑位置", findKind("computer") || analyzer],
        ["准备", "校正设备并安装材料", `检查${findKind("printer")?.label || "数字制造设备"}的平台水平、喷头或刀具高度和安全罩，装载符合材料参数。`, "调平间隙、材料规格和急停", findKind("printer") || sample],
        ["加工", "启动试切或首层打印", "先运行空走或首层测试，确认路径、附着和冷却正常后再开始完整加工。", "首层附着、运动干涉和异响", findKind("printer") || source, { mode: "scan" }],
        ["检测", "测量成品关键尺寸", `使用${findKind("caliper")?.label || "精密量具"}测量孔径、壁厚和外形，记录与设计模型的偏差。`, "关键尺寸、翘曲和装配配合", findKind("caliper") || analyzer]
      ];
    } else if (profile === "professional-instruments") {
      middle = [
        ["安装", "识别光学仪器与光轴", `检查${findKind("optical-source")?.label || "光源"}、棱镜和光谱仪，按说明书确认望远镜、平行光管和载物台位置。`, "目镜视场、狭缝和光轴高度", findKind("spectrometer") || source],
        ["校准", "完成自准直和零点校准", "用自准直法调平载物台，记录游标零点；检查狭缝宽度与谱线清晰度的关系。", "自准直像、左右游标差和零点", findKind("spectrometer") || analyzer],
        ["观察", "观察色散与仪器读数", "放入棱镜或光栅，逐项观察零级、色散方向和游标读数，比较不同光源的谱线。", "谱线颜色、角度和视差", findKind("prism", "grating") || sample],
        ["复核", "重复角度测量并记录", "交换左右游标读取同一谱线，重复三次；检查读数回差和最小偏向角条件。", "角度重复性、游标视差和仪器误差", analyzer, { mode: "verify" }]
      ];
    } else if (profile === "professional-light-path") {
      middle = [
        ["安装", "安装激光、反射镜与透镜", `将${source?.label || "光源"}、${findDevice("mirror-a")?.label || "反射镜"}、${findDevice("lens")?.label || "透镜"}和观察屏按导轨高度固定。`, "所有镜架中心高度和光斑位置", findDevice("mirror-a") || source],
        ["校准", "逐面调节使光斑居中", "按“光源—第一镜—第二镜—屏”的顺序逐面微调，每次只改变一个自由度，观察光斑移动方向。", "光斑中心、回光和调节方向", findDevice("mirror-a") || detector],
        ["聚焦", "移动透镜观察成像变化", `改变${secondaryLabel}，记录光斑最小位置和观察屏上的像；判断物距、像距与焦距的关系。`, "光斑尺寸、清晰度和像的位置", findDevice("lens") || detector],
        ["复核", "锁紧镜架并重复测量", "锁紧锁紧螺钉后重新读取光斑和焦距，检查锁紧是否引入偏移；保留调整前后数据。", "锁紧漂移、重复性和功率变化", analyzer, { mode: "verify" }]
      ];
    } else if (profile === "professional-stereo") {
      middle = [
        ["安装", "固定双目相机与标定靶", "将立体相机固定在刚性支架上，调好基线、俯仰和左右曝光；标定靶保持平整且充满视场。", "左右图像同步、基线和镜头畸变", findKind("camera") || sample],
        ["标定", "采集多姿态标定图像", "从不同角度和距离拍摄棋盘格/靶面，保证角点完整且分布均匀，再计算内外参。", "重投影误差、角点覆盖率和同步误差", findKind("camera") || analyzer],
        ["拍摄", "采集立体视频与目标视差", "保持相机稳定拍摄目标运动，记录基线、帧率和同步信号；避免反光和滚动快门。", "视差连续性、遮挡和曝光一致", findKind("camera") || detector],
        ["复核", "计算深度并检查显示延迟", "用标定参数重构目标深度，比较左右图像和显示延迟；重复静止靶验证测量重复性。", "深度误差、同步延迟和重复性", analyzer, { mode: "verify" }]
      ];
    } else if (profile === "professional-voice") {
      middle = [
        ["安装", "连接音频源、光发射与接收模块", `依次连接${findKind("optical-transceiver")?.label || "光收发模块"}、${fiber?.label || "光纤盘"}和音频源，检查电源与接地。`, "音频输入电平、光纤连接和电源噪声", findKind("optical-transceiver") || fiber],
        ["校准", "调整偏置和接收增益", "先输入低幅正弦音，调整发射偏置与接收增益，使示波器波形不削顶且背景噪声较低。", "波形失真、基线噪声和接收幅度", findKind("scope") || detector],
        ["测试", "传输单音、语音与静音", "逐项输入单音、语音和静音，记录输出波形与失真；检查光纤弯曲和接头松动的影响。", "信噪比、失真和串扰", findKind("scope") || analyzer],
        ["复核", "重复链路测试并记录误码", "重新连接光纤后比较输出，记录链路损耗、延迟和异常片段；保存原始音频与波形。", "链路重复性、延迟和信号完整性", analyzer, { mode: "verify" }]
      ];
    }

    if (middle.length < 5) {
      middle.push([
        "复核",
        "重复关键条件并核对原始记录",
        `回到代表性测点复测${primaryLabel}与${secondaryLabel}，检查连接、复位和环境变化造成的偏差；保留原始数据与截图。`,
        "重复读数、保存版本和异常波动",
        analyzer,
        { mode: "verify" }
      ]);
    }

    const finish = makeStep(
      "复位",
      "完成数据复核、关机和实验台复位",
      `先关闭${source?.label || "主设备"}输出或降低驱动，再关闭${detector?.label || "测量端"}与电源；保留 ${state.config?.experiment?.name || info?.name || "本次实验"} 的原始数据、量程和截图，拆线后归位器材。`,
      "关机顺序、数据版本、器材完整性和现场清洁",
      analyzer,
      {
        guard: /激光|光电|干涉|衍射|偏振|激光/.test(profile)
          ? "关闭光源后再拆除光学件；激光器需要按说明书冷却，禁止直接切断冷却系统。"
          : "先降输出、后断电、再拆线；电容或高压端应放电后再接触。",
        duration: "约 2–4 分钟",
        mode: "reset"
      }
    );

    return [first, ...middle.map((item) => makeStep(...item)), finish];
  }

  function updateProcessUI() {
    const steps = state.processSteps;
    const step = steps[state.processStep];
    if (!step) return;
    const total = steps.length;
    const count = $("#lab-3d-step-count");
    const stage = $("#lab-3d-step-stage");
    const duration = $("#lab-3d-step-duration");
    const status = $("#lab-3d-step-status");
    const track = $("#lab-3d-step-track");
    const title = $("#lab-3d-step-title");
    const detail = $("#lab-3d-step-detail");
    const observe = $("#lab-3d-step-observe");
    const guard = $("#lab-3d-step-guard");
    const bar = $(".lab-3d-progress i");
    const autoButton = $("#lab-3d-auto-step");
    if (count) count.textContent = `实验过程 ${String(state.processStep + 1).padStart(2, "0")} / ${String(total).padStart(2, "0")}`;
    if (stage) stage.textContent = step.stage || "操作";
    if (duration) duration.textContent = step.duration || "约 3–5 分钟";
    if (status) status.textContent = state.processStep === total - 1 ? "最后一步" : `第 ${state.processStep + 1} 阶段`;
    if (title) title.textContent = step.title;
    if (detail) detail.textContent = step.detail;
    if (observe) observe.textContent = step.observe || "读数、波形和连接状态";
    if (guard) guard.textContent = step.guard || "按仪器铭牌和指导书执行，异常时立即停止。";
    if (track) {
      track.replaceChildren(...steps.map((item, index) => {
        const button = document.createElement("button");
        button.type = "button";
        button.title = `${String(index + 1).padStart(2, "0")} ${item.title}`;
        button.classList.toggle("active", index === state.processStep);
        button.classList.toggle("done", index < state.processStep);
        button.dataset.processStep = String(index);
        const fill = document.createElement("i");
        const label = document.createElement("span");
        label.textContent = item.stage || String(index + 1).padStart(2, "0");
        button.append(fill, label);
        button.addEventListener("click", () => {
          state.autoTour = false;
          setProcessStep(index);
        });
        return button;
      }));
    }
    if (bar) bar.style.width = `${((state.processStep + 1) / total) * 100}%`;
    if (autoButton) {
      autoButton.classList.toggle("active", state.autoTour);
      autoButton.textContent = state.autoTour ? "暂停演示" : "自动演示";
      autoButton.setAttribute("aria-pressed", String(state.autoTour));
    }
    if (state.stepMarker) {
      state.stepMarker.visible = state.active;
      drawStepMarker(String(state.processStep + 1));
    }
    const sceneNote = $("#lab-3d-scene-note");
    if (sceneNote) sceneNote.textContent = step.title;
    syncProcessCollapse();
    state.autoTourAt = performance.now() + 4200;
  }

  function syncProcessCollapse() {
    const panel = $("#lab-3d-process");
    const reopen = $("#lab-3d-process-reopen");
    const reopenCount = $("#lab-3d-process-reopen-count");
    if (panel) panel.hidden = state.processCollapsed;
    if (reopen) reopen.hidden = !state.processCollapsed || !state.active;
    if (reopenCount) {
      reopenCount.textContent =
        `${String(state.processStep + 1).padStart(2, "0")} / ${String(state.processSteps.length || 0).padStart(2, "0")}`;
    }
  }

  function setProcessStep(index, selectDevice = true) {
    const total = state.processSteps.length;
    if (!total) return;
    state.processStep = (index + total) % total;
    const targetId = state.processSteps[state.processStep]?.deviceId;
    if (selectDevice && targetId && state.deviceGroups.has(targetId)) {
      state.selectedId = targetId;
      updateSelectionHelper();
      updateHud();
      if (state.cameraState.viewMode === "focus") setViewPreset("focus");
      if (state.inspectorId) populateInspector(targetId);
    }
    updateProcessUI();
  }

  function deviceWorldPoint(id, y = 0.48) {
    const group = state.deviceGroups.get(id);
    if (!group) return null;
    return new state.three.Vector3(group.position.x, y, group.position.z);
  }

  function makeTube(points, radius, color, opacity = 0.85) {
    const THREE = state.three;
    const curve = new THREE.CatmullRomCurve3(points);
    const geometry = new THREE.TubeGeometry(curve, Math.max(16, points.length * 8), radius, 8, false);
    const material = new THREE.MeshStandardMaterial({
      color,
      emissive: color,
      emissiveIntensity: 0.42,
      transparent: true,
      opacity,
      roughness: 0.28,
      metalness: 0.08
    });
    return new THREE.Mesh(geometry, material);
  }

  function makeBeam(points, color, index) {
    const THREE = state.three;
    const curve = new THREE.CatmullRomCurve3(points);
    const core = new THREE.Mesh(
      new THREE.TubeGeometry(curve, Math.max(24, points.length * 12), 0.009, 8, false),
      new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.96,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      })
    );
    const halo = new THREE.Mesh(
      new THREE.TubeGeometry(curve, Math.max(24, points.length * 12), 0.036, 8, false),
      new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.09,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      })
    );
    core.userData.connectionType = halo.userData.connectionType = "optical";
    core.userData.baseOpacity = 0.96;
    halo.userData.baseOpacity = 0.09;
    state.beamGroup.add(core, halo);
    for (let pulseIndex = 0; pulseIndex < 3; pulseIndex += 1) {
      const pulse = new THREE.Mesh(
        new THREE.SphereGeometry(0.026, 10, 10),
        new THREE.MeshBasicMaterial({
          color,
          transparent: true,
          opacity: 0.68,
          blending: THREE.AdditiveBlending,
          depthWrite: false
        })
      );
      pulse.userData.connectionType = "optical";
      pulse.userData.baseOpacity = 0.68;
      state.beamGroup.add(pulse);
      state.animatedObjects.push({
        type: "beamPulse",
        curve,
        object: pulse,
        offset: (index * 0.19 + pulseIndex / 3) % 1,
        speed: 0.075 + index * 0.004,
        baseSpeed: 0.075 + index * 0.004
      });
    }
  }

  function rebuildConnections() {
    if (!state.ready || !state.presetInfo) return;
    clearObject(state.beamGroup);
    clearObject(state.cableGroup);
    state.animatedObjects = [];
    state.beamGroup.visible = true;
    state.cableGroup.visible = state.showCables;
    const beamColor = new state.three.Color(colorArrayToHex(state.config?.beamColor));
    state.presetInfo.optics.forEach((path, pathIndex) => {
      const ids = path.filter((id) => state.deviceGroups.has(id));
      for (let index = 0; index < ids.length - 1; index += 1) {
        const from = deviceWorldPoint(ids[index], 0.55);
        const to = deviceWorldPoint(ids[index + 1], 0.55);
        if (!from || !to) continue;
        const mid = from.clone().lerp(to, 0.5);
        mid.y += 0.045;
        makeBeam([from, mid, to], beamColor, pathIndex + index);
      }
    });
    const cableColors = {
      "BNC 50Ω 同轴": 0xd9b473,
      "4 mm 香蕉插头 / DC 5.5 mm": 0xe1a663,
      "2.54 mm 杜邦线": 0x68b992,
      "USB 2.0 / 3.0": 0x799ed1,
      "FC/APC 单模光纤": 0xe8ba5e,
      "4 mm 表笔 / 测试引线": 0xb79170
    };
    state.presetInfo.connections.forEach((connection) => {
      const from = deviceWorldPoint(connection.fromId, 0.23);
      const to = deviceWorldPoint(connection.toId, 0.23);
      if (!from || !to) return;
      const middle = from.clone().lerp(to, 0.5);
      middle.y -= 0.12;
      const color = cableColors[connection.standard] || 0xb0b6ac;
      const tube = makeTube([from, middle, to], 0.018, new state.three.Color(color), 0.86);
      tube.userData.connectionType = "cable";
      tube.userData.standard = connection.standard;
      tube.userData.baseOpacity = 0.86;
      state.cableGroup.add(tube);
      const stripe = makeTube([from, middle, to], 0.006, new state.three.Color(color).offsetHSL(0, -0.16, 0.2), 0.72);
      stripe.position.y = 0.012;
      stripe.userData.connectionType = "cable";
      stripe.userData.baseOpacity = 0.72;
      state.cableGroup.add(stripe);
      [from, to].forEach((point) => {
        const connector = new state.three.Mesh(
          new state.three.CylinderGeometry(0.035, 0.035, 0.055, 18),
          new state.three.MeshStandardMaterial({ color, metalness: 0.5, roughness: 0.25 })
        );
        connector.position.copy(point);
        connector.rotation.x = Math.PI / 2;
        connector.userData.connectionType = "cable";
        connector.userData.baseOpacity = 1;
        state.cableGroup.add(connector);
      });
    });
  }

  function updateSceneAnimations(time) {
    const currentStep = state.processSteps[state.processStep] || {};
    const mode = currentStep.mode || "operate";
    const speedFactor = mode === "scan" ? 1.9 : mode === "verify" ? 1.25 : mode === "prepare" ? 0.45 : mode === "reset" ? 0.2 : 1;
    const beamFactor = mode === "prepare" ? 0.18 : mode === "install" ? 0.48 : mode === "align" ? 0.78 : mode === "reset" ? 0.1 : 1;
    const cableFactor = mode === "prepare" ? 0.3 : mode === "install" ? 0.8 : mode === "reset" ? 0.12 : 0.92;
    state.animatedObjects.forEach((entry) => {
      if (entry.type !== "beamPulse") return;
      const progress = (time * 0.001 * entry.baseSpeed * speedFactor + entry.offset) % 1;
      entry.object.position.copy(entry.curve.getPointAt(progress));
      const pulseScale = 0.72 + Math.sin(time * 0.006 + entry.offset * 8) * 0.22;
      entry.object.scale.setScalar(pulseScale);
      entry.object.material.opacity = entry.object.userData.baseOpacity * beamFactor;
    });
    [state.beamGroup, state.cableGroup].forEach((group, index) => {
      if (!group) return;
      const factor = index === 0 ? beamFactor : cableFactor;
      group.children.forEach((node) => {
        if (node.material && node.userData.baseOpacity != null) {
          node.material.opacity = node.userData.baseOpacity * factor;
        }
      });
    });
    state.deviceGroups.forEach((group, id) => {
      group.traverse((node) => {
        if (!node.userData?.selectionRing) return;
        node.material.opacity = id === state.selectedId ? 0.46 + Math.sin(time * 0.004) * 0.15 : 0.08;
      });
    });
    if (state.stepMarker) {
      const selected = state.deviceGroups.get(state.selectedId);
      state.stepMarker.visible = Boolean(state.active && selected);
      if (selected) {
        state.stepMarker.position.set(
          selected.position.x,
          selected.position.y + 1.34,
          selected.position.z
        );
      }
    }
  }

  function updateSelectionHelper() {
    const THREE = state.three;
    const group = state.deviceGroups.get(state.selectedId);
    if (state.selectionHelper) {
      state.scene.remove(state.selectionHelper);
      state.selectionHelper.geometry?.dispose?.();
      state.selectionHelper.material?.dispose?.();
    }
    state.selectionHelper = group ? new THREE.BoxHelper(group, new THREE.Color(0xf1c879)) : null;
    if (state.selectionHelper) {
      state.selectionHelper.material.depthTest = false;
      state.selectionHelper.material.transparent = true;
      state.selectionHelper.material.opacity = 0.85;
      state.scene.add(state.selectionHelper);
    }
  }

  function deviceIdFromObject(object) {
    let current = object;
    while (current) {
      if (current.userData?.deviceId) return current.userData.deviceId;
      current = current.parent;
    }
    return "";
  }

  function updateRayPointer(event) {
    const rect = state.canvas.getBoundingClientRect();
    state.pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    state.pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    state.raycaster.setFromCamera(state.pointer, state.camera);
  }

  function hideTooltip() {
    state.hoveredId = "";
    const tooltip = $("#lab-3d-tooltip");
    if (tooltip) tooltip.hidden = true;
    if (state.canvas) state.canvas.style.cursor = state.dragGroup ? "grabbing" : "grab";
  }

  function showTooltip(event, id) {
    const tooltip = $("#lab-3d-tooltip");
    const device = state.presetInfo?.devices.find((item) => item.id === id);
    if (!tooltip || !device) return;
    state.hoveredId = id;
    const title = document.createElement("strong");
    title.textContent = device.label;
    const ports = window.OptilabPanorama?.getPorts(id) || ["MEASURE", "GND"];
    const detail = document.createElement("small");
    const modelLabel = DEVICE_KIND_LABELS[deviceKind(device)] || "实验仪器";
    detail.textContent = `${modelLabel} · ${device.variant ? `型号特征 ${device.variant}` : "标准实验室配置"} · 端口 ${ports.join(" / ")} · 单击查看参数`;
    tooltip.replaceChildren(title, detail);
    const rect = state.canvas.getBoundingClientRect();
    const x = clamp(event.clientX - rect.left, 8, Math.max(8, rect.width - 210));
    const y = clamp(event.clientY - rect.top, 8, Math.max(8, rect.height - 78));
    tooltip.style.left = `${x}px`;
    tooltip.style.top = `${y}px`;
    tooltip.hidden = false;
    state.canvas.style.cursor = state.dragGroup ? "grabbing" : "grab";
  }

  function pointerDown(event) {
    if (!state.active || !state.ready) return;
    event.preventDefault();
    hideTooltip();
    state.dragStart = { x: event.clientX, y: event.clientY };
    state.dragMoved = false;
    updateRayPointer(event);
    const intersections = state.raycaster.intersectObjects([...state.deviceGroups.values()], true);
    const id = deviceIdFromObject(intersections[0]?.object);
    if (id) {
      state.selectedId = id;
      state.dragGroup = state.deviceGroups.get(id);
      state.canvas.setPointerCapture?.(event.pointerId);
      state.canvas.style.cursor = "grabbing";
      updateSelectionHelper();
      updateHud();
    } else {
      state.orbit = { x: event.clientX, y: event.clientY, theta: state.cameraState.theta, phi: state.cameraState.phi };
    }
  }

  function pointerMove(event) {
    if (!state.active || !state.ready) return;
    if (state.dragGroup) {
      event.preventDefault();
      const movement = Math.hypot(
        event.clientX - (state.dragStart?.x ?? event.clientX),
        event.clientY - (state.dragStart?.y ?? event.clientY)
      );
      if (!state.dragMoved && movement < 4) return;
      state.dragMoved = true;
      updateRayPointer(event);
      const hit = new state.three.Vector3();
      if (state.raycaster.ray.intersectPlane(state.dragPlane, hit)) {
        state.dragGroup.position.x = clamp(hit.x, -4.65, 4.65);
        state.dragGroup.position.z = clamp(hit.z, -2.6, 2.6);
        state.selectionHelper?.update();
        rebuildConnections();
        updateHud();
      }
    } else if (state.orbit) {
      const dx = event.clientX - state.orbit.x;
      const dy = event.clientY - state.orbit.y;
      state.cameraState.theta = state.orbit.theta - dx * 0.006;
      state.cameraState.phi = clamp(state.orbit.phi - dy * 0.004, 0.28, 1.12);
    } else {
      updateRayPointer(event);
      const hits = state.raycaster.intersectObjects([...state.deviceGroups.values()], true);
      const id = deviceIdFromObject(hits[0]?.object);
      if (id) showTooltip(event, id);
      else {
        hideTooltip();
        state.canvas.style.cursor = "move";
      }
    }
  }

  function pointerUp(event) {
    const openId = event?.type !== "pointercancel" && state.dragGroup && !state.dragMoved
      ? state.selectedId
      : "";
    state.dragGroup = null;
    state.orbit = null;
    state.dragStart = null;
    if (state.canvas) state.canvas.style.cursor = "move";
    if (openId) openInspector(openId);
  }

  function wheel(event) {
    if (!state.active) return;
    event.preventDefault();
    state.cameraState.radius = clamp(state.cameraState.radius + event.deltaY * 0.006, 6.5, 17);
  }

  function configure(payload) {
    if (!payload?.experiment || !window.OptilabPanorama) return;
    const experimentId = payload.experiment.id || payload.experiment.name;
    const previousConfig = state.config;
    state.config = { ...payload };
    if (experimentId !== state.experimentId) {
      state.experimentId = experimentId;
      state.presetInfo = window.OptilabPanorama.resolvePreset(payload.experiment);
      state.cameraState.theta = Math.PI * (0.36 + ((experimentId.length * 17) % 16) / 100);
      state.cameraState.phi = Math.PI * (0.30 + ((experimentId.length * 11) % 10) / 100);
      if (state.ready) buildScene();
    } else if (state.ready && (
      previousConfig?.primary !== state.config.primary ||
      previousConfig?.secondary !== state.config.secondary
    )) {
      state.dynamicTextures.forEach((entry) => {
        drawPanelTexture(entry, performance.now(), state.config);
      });
    }
  }

  function metricsFromLayout() {
    const info = state.presetInfo;
    if (!info) return state.metrics;
    const optical = info.devices.filter((device) => device.zone === "optical" || device.zone === "mixed");
    const electronic = info.devices.filter((device) => device.zone === "electronic");
    const deviation = (devices) => {
      if (!devices.length) return 0;
      return devices.reduce((total, device) => {
        const group = state.deviceGroups.get(device.id);
        const origin = state.initialPositions.get(device.id);
        return total + (group && origin ? Math.hypot(group.position.x - origin.x, group.position.z - origin.z) / 5.2 : 0);
      }, 0) / devices.length;
    };
    const alignment = optical.length ? clamp(0.91 - deviation(optical) * 0.8, 0.18, 0.98) : 0.84;
    const connectivity = electronic.length ? clamp(0.92 - deviation(electronic) * 0.95, 0.2, 0.98) : 0.74;
    const hasOptics = optical.length >= 2;
    const hasElectronics = electronic.length >= 2;
    const unified = window.OptilabPhysics?.computeScene(state.config?.experiment || {}, {
      primary: state.config?.primary,
      secondary: state.config?.secondary,
      primaryUnit: state.config?.primaryUnit,
      secondaryUnit: state.config?.secondaryUnit,
      alignment,
      connectivity,
      hasOptics,
      hasElectronics
    });
    if (unified?.metrics) return unified.metrics;
    const sourceDrive = clamp(Math.abs(Number(state.config?.primary) || 1) / 20, 0.18, 1);
    const power = hasOptics
      ? clamp((0.8 + sourceDrive * 3.8) * alignment, 0.08, 12)
      : clamp((0.2 + sourceDrive * 5.2) * connectivity, 0.03, 26);
    const frequency = /Hz|hz/.test(String(state.config?.secondaryUnit || ""))
      ? clamp(Math.abs(Number(state.config?.secondary) || 1000), 10, 250000)
      : 1000 + Math.abs(Number(state.config?.secondary) || 1) * 47;
    const score = hasOptics && electronic.length ? Math.min(alignment, connectivity) : hasOptics ? alignment : connectivity;
    return {
      alignment,
      connectivity,
      power,
      powerUnit: hasOptics ? "mW" : "W",
      frequency,
      snr: clamp(8 + score * 38 - (1 - alignment) * 12, 3, 58),
      hasOptics,
      hasElectronics
    };
  }

  function updateHud() {
    if (!state.presetInfo) return;
    state.metrics = metricsFromLayout();
    const metrics = state.metrics;
    $("#panorama-alignment-label") && ($("#panorama-alignment-label").textContent = metrics.hasOptics ? "光路对准" : "装置对齐");
    $("#panorama-power-label") && ($("#panorama-power-label").textContent = metrics.hasOptics ? "探测器功率" : "电路输出功率");
    $("#panorama-alignment") && ($("#panorama-alignment").textContent = `${Math.round(metrics.alignment * 100)}%`);
    $("#panorama-power") && ($("#panorama-power").textContent = `${formatNumber(metrics.power)} ${metrics.powerUnit}`);
    $("#panorama-frequency") && ($("#panorama-frequency").textContent = `${formatNumber(metrics.frequency, 1)} Hz`);
    $("#panorama-snr") && ($("#panorama-snr").textContent = `${formatNumber(metrics.snr, 1)} dB`);
    $("#panorama-standard") && ($("#panorama-standard").textContent = `接线标准：${state.presetInfo.standards}`);
    $("#panorama-equipment-traits") && ($("#panorama-equipment-traits").textContent =
      `器材特征：${state.presetInfo.equipmentTraits.join(" · ") || state.presetInfo.name}`
    );
    const selected = state.presetInfo.devices.find((device) => device.id === state.selectedId);
    document.querySelectorAll("[data-panorama-device]").forEach((button) => {
      button.classList.toggle("active", button.dataset.panoramaDevice === state.selectedId);
    });
    $("#panorama-selected") && ($("#panorama-selected").textContent = `正在观察：${selected?.label || "实验器件"}`);
    $("#panorama-port-map") && ($("#panorama-port-map").textContent =
      `端口：${selected ? window.OptilabPanorama.getPorts(selected.id).join(" · ") : "—"}`
    );
    const scene = $("#panorama-status");
    if (scene) {
      const score = metrics.hasOptics && metrics.hasElectronics
        ? Math.min(metrics.alignment, metrics.connectivity)
        : metrics.hasOptics ? metrics.alignment : metrics.connectivity;
      scene.textContent = score > 0.72
        ? `${state.presetInfo.name} · 三维器件关系稳定 · 采集在线`
        : score > 0.45
          ? `${state.presetInfo.name} · 装置可用，可继续调整位置`
          : `${state.presetInfo.name} · 器件偏离，拖动重新对准`;
      scene.dataset.state = score > 0.7 ? "good" : score > 0.4 ? "warn" : "bad";
    }
    refreshInspector();
  }

  function inspectorReadout(kind, display) {
    const readouts = {
      laser: `${display.wavelengthText} · ${display.powerText}`,
      mirror: `λ/10 反射面 · 对准 ${Math.round(state.metrics.alignment * 100)}%`,
      splitter: `分束比 50:50 · 对准 ${Math.round(state.metrics.alignment * 100)}%`,
      lens: `Φ 25.4 mm · 对准 ${Math.round(state.metrics.alignment * 100)}%`,
      screen: `条纹可见度 ${Math.round(state.metrics.alignment * 100)}%`,
      scope: `${display.scopeFrequencyText} · ${display.scopeTimebase}`,
      "power-meter": `${display.powerText} @ ${display.wavelengthText}`,
      multimeter: `${display.primaryText} · ${display.secondaryText}`,
      "power-supply": `${display.voltageText} · ${display.currentText}`,
      generator: `${display.frequencyText} · ${display.scopeAmplitudeText}`,
      "logic-analyzer": `16 CH · 100 MSa/s · ${Math.round(state.metrics.connectivity * 100)}%`,
      breadboard: `830 孔 · 接触状态 ${Math.round(state.metrics.connectivity * 100)}%`,
      "mcu-board": `3.3 V / 5 V IO · USB ONLINE`,
      "sensor-module": `采样 ${display.scopeFrequencyText} · ${Math.round(state.metrics.snr)} dB`,
      "lcd-module": `${display.distanceText} · READY`,
      alarm: `阈值 0.50 m · ${Math.round(state.metrics.connectivity * 100)}%`,
      daq: `16 bit · ${display.scopeFrequencyText}`,
      load: `${display.currentText} · CC MODE`,
      spectrometer: `峰值 ${display.peakWavelengthText} · RES 0.2 nm`,
      "thermal-camera": `${display.temperatureText} · ε 0.95`,
      camera: `${display.exposureText} · GAIN ${display.gainText}`,
      "power-supply": `${display.voltageText} · ${display.currentText}`,
      "optical-source": `${display.wavelengthText} · 稳定输出`,
      "fiber-spool": `1310 / 1550 nm · ${display.powerText}`,
      "fiber-coupler": `50:50 · 插损 3.6 dB`,
      "optical-transceiver": `RX ${display.powerText} · LINK OK`,
      photogate: `计时分辨率 0.1 ms`,
      "bioamp": `GAIN 1000 · CMRR 110 dB`,
      pendulum: `周期 ${display.secondaryText}`,
      heater: `${display.temperatureText} · PID READY`,
      calorimeter: `${display.temperatureText} · ΔT 测量中`
    };
    return readouts[kind] || `${display.primaryLabel}: ${display.primaryText} · ${display.secondaryLabel}: ${display.secondaryText}`;
  }

  function deviceInspectorData(device) {
    const kind = deviceKind(device);
    const display = liveDisplayData(device, state.config || {});
    const specs = [];
    const add = (label, value) => specs.push([label, String(value)]);
    add("结构类型", DEVICE_KIND_LABELS[kind] || "实验仪器");
    add("实验场景", display.experimentName);
    add("统一计算引擎", display.engineVersion);
    switch (kind) {
      case "laser":
        add("工作波长", display.wavelengthText);
        add("输出功率", display.powerText);
        add("输出模式", "CW / TEM₀₀");
        add("预热时间", "15–30 min");
        add("光束直径", "1.2 mm");
        add("接口", "DB9 · INTERLOCK");
        break;
      case "mirror":
      case "splitter":
        add("通光口径", "25.4 mm");
        add("表面面型", "λ/10 @ 633 nm");
        add("反射率", "R > 99%");
        add("调节轴", "θx / θy 二维微调");
        add("镜架", "M4 锁定 · 三螺钉");
        add("安装高度", "中心 50 mm");
        break;
      case "lens":
        add("通光口径", "25.4 mm");
        add("焦距", String(state.config?.secondaryLabel || "").includes("焦距") ? display.secondaryText : "100 mm");
        add("镀膜", "400–700 nm 增透");
        add("表面质量", "40–20 scratch-dig");
        add("安装", "SM1 透镜架");
        break;
      case "scope":
        add("带宽", "100 MHz");
        add("采样率", "1 GSa/s");
        add("通道", "CH1 / CH2 · EXT TRIG");
        add("垂直档位", "1 mV/div – 10 V/div");
        add("时基", "1 ns/div – 50 s/div");
        add("输入阻抗", "1 MΩ ∥ 15 pF");
        add("显示", display.scopeFrequencyText);
        break;
      case "multimeter":
        add("显示位数", "6000 counts");
        add("直流电压", "0.1 mV – 1000 V");
        add("交流电压", "1 mV – 750 V");
        add("电阻", "0.1 Ω – 60 MΩ");
        add("输入阻抗", "10 MΩ");
        add("安全等级", "CAT II 600 V");
        add("当前量程", display.primaryText);
        break;
      case "power-supply":
        add("输出电压", "0–30 V");
        add("输出电流", "0–5 A");
        add("电压分辨率", "10 mV");
        add("电流分辨率", "1 mA");
        add("纹波", "< 1 mVrms");
        add("保护", "OVP / OCP / OTP");
        add("当前输出", `${display.voltageText} · ${display.currentText}`);
        break;
      case "generator":
        add("频率范围", "1 µHz – 20 MHz");
        add("输出幅度", "1 mVpp – 10 Vpp");
        add("输出阻抗", "50 Ω");
        add("波形", "正弦 / 方波 / 三角");
        add("调制", "AM / FM / Sweep");
        add("当前频率", display.frequencyText);
        break;
      case "power-meter":
        add("波长范围", "400–1100 nm");
        add("功率范围", "1 nW – 10 mW");
        add("显示分辨率", "0.1% FS");
        add("探头接口", "DB15 / FC");
        add("校准波长", display.wavelengthText);
        add("当前读数", display.powerText);
        break;
      case "logic-analyzer":
        add("通道数", "16");
        add("最大采样率", "100 MSa/s");
        add("逻辑门限", "1.65 V");
        add("存储深度", "16 Mpts/ch");
        add("协议分析", "UART / I²C / SPI");
        add("触发", "边沿 / 码型");
        break;
      case "breadboard":
        add("孔位", "830 tie-points");
        add("电源轨", "2 组");
        add("最大电压", "36 V");
        add("单孔电流", "< 1 A");
        add("节距", "2.54 mm");
        add("当前连接", `${state.metrics.connectivity > 0.7 ? "接触良好" : "需检查"}`);
        break;
      case "mcu-board":
        add("逻辑电平", "3.3 V / 5 V");
        add("主频", device.variant === "fpga" ? "100 MHz" : "16 MHz");
        add("ADC", "10 bit / 12 bit");
        add("接口", "GPIO / UART / I²C / SPI");
        add("下载口", "USB / SWD / JTAG");
        add("供电", "5 V DC");
        break;
      case "sensor-module":
        add("工作电压", "3.3–5 V");
        add("接口", "模拟 / I²C / 数字");
        add("量程", /超声/.test(device.label) ? "2 cm – 400 cm" : "按模块铭牌");
        add("分辨率", /超声/.test(device.label) ? "3 mm" : "12 bit");
        add("采样间隔", display.scopeFrequencyText);
        break;
      case "lcd-module":
        add("显示格式", "16 × 2 字符");
        add("接口", "I²C / 4-bit 并口");
        add("供电", "5 V");
        add("对比度", "电位器可调");
        add("当前显示", display.distanceText);
        break;
      case "spectrometer":
        add("波长范围", "200–1100 nm");
        add("光学分辨率", "0.2 nm");
        add("探测器", "CCD 线阵");
        add("接口", "USB 2.0");
        add("入口", "SMA / 自由空间");
        add("当前峰值", display.peakWavelengthText);
        break;
      case "grating":
      case "slit":
        add("通光尺寸", kind === "grating" ? "25 × 25 mm" : "狭缝可调");
        add("参数", kind === "grating" ? "300 lines/mm" : "0.02–2 mm");
        add("调节", "旋转 + 横向位移");
        add("安装", "精密光学调整架");
        add("当前对准", `${Math.round(state.metrics.alignment * 100)}%`);
        break;
      case "polarizer":
        add("通光口径", "25.4 mm");
        add("消光比", "> 1000:1");
        add("波段", "400–700 nm");
        add("旋转刻度", "1°");
        add("当前角度", display.primaryText);
        break;
      case "camera":
      case "thermal-camera":
        add("传感器", kind === "thermal-camera" ? "长波红外阵列" : "CMOS");
        add("分辨率", kind === "thermal-camera" ? "256 × 192" : "1920 × 1080");
        add("像元", kind === "thermal-camera" ? "12 µm" : "5.86 µm");
        add("帧率", kind === "thermal-camera" ? "25 fps" : "60 fps");
        add("当前曝光", display.exposureText);
        add("当前增益", display.gainText);
        add("接口", "USB 3.0");
        if (kind === "thermal-camera") {
          add("温度范围", "-20–150°C");
          add("热灵敏度", "< 50 mK");
        }
        break;
      case "detector":
      case "beam-profiler":
        add("有效面积", kind === "beam-profiler" ? "11 × 11 mm" : "3.6 × 3.6 mm");
        add("响应波段", "320–1100 nm");
        add("响应度", "0.45 A/W @ 633 nm");
        add("暗电流", "< 2 nA");
        add("接口", "BNC 50 Ω");
        add("当前功率", display.powerText);
        break;
      case "fiber-spool":
        add("光纤类型", "SMF-28 单模");
        add("纤芯 / 包层", "9 / 125 µm");
        add("连接头", "FC/APC");
        add("工作波长", "1310 / 1550 nm");
        add("长度", "2.0 km");
        add("最小弯曲半径", "30 mm");
        break;
      case "fiber-coupler":
        add("分光比", "50:50");
        add("附加损耗", "0.15 dB");
        add("插损", "3.6 dB");
        add("方向性", "> 50 dB");
        add("接口", "FC/APC");
        break;
      case "optical-transceiver":
        add("工作波长", "1310 / 1550 nm");
        add("速率", "1.25 Gbit/s");
        add("输出功率", "-3–0 dBm");
        add("接收灵敏度", "-24 dBm");
        add("接口", "FC/APC · USB");
        add("链路状态", "LINK OK");
        break;
      case "daq":
        add("模拟输入", "16 通道");
        add("ADC 分辨率", "16 bit");
        add("采样率", "1 MSa/s");
        add("输入范围", "±10 V");
        add("接口", "USB 2.0 / 接线端子");
        add("当前采样", display.scopeFrequencyText);
        break;
      case "microscope":
        add("放大倍率", "20× / 40×");
        add("测量精度", "0.01 mm");
        add("目镜", "10×");
        add("照明", "LED 可调");
        add("载物台", "二维微调");
        break;
      case "millikan-chamber":
        add("极板间距", "5.0 mm");
        add("最高电压", "500 V");
        add("照明", "LED 侧照");
        add("观察", "读数显微镜");
        add("油滴介质", "低挥发性雾化油");
        break;
      case "pendulum":
        add("摆长", "0.50–1.20 m");
        add("测角范围", "±15°");
        add("计时分辨率", "0.1 ms");
        add("摆球质量", "25–100 g");
        add("当前周期", display.secondaryText);
        break;
      case "vibrator":
        add("驱动频率", "0.1–20 Hz");
        add("幅值", "0–20 mm");
        add("驱动方式", "电磁线圈");
        add("控制接口", "BNC");
        break;
      case "photogate":
        add("计时分辨率", "0.1 ms");
        add("遮光宽度", "5 mm");
        add("输出", "TTL 脉冲");
        add("接口", "BNC");
        break;
      case "heater":
      case "calorimeter":
        add("温控范围", "室温–120°C");
        add("控温精度", "±0.1°C");
        add("温度采样", "1 s⁻¹");
        add("传感器", "Pt100");
        add("当前温度", display.temperatureText);
        break;
      case "bioamp":
        add("增益", "100 / 1000");
        add("带宽", "0.1–100 Hz");
        add("共模抑制", "110 dB");
        add("输入噪声", "< 1 µVrms");
        add("接口", "3 × 电极 · BNC");
        break;
      case "printer":
        add("成型尺寸", "220 × 220 × 250 mm");
        add("层高", "0.1–0.3 mm");
        add("喷头温度", "最高 260°C");
        add("定位精度", "0.1 mm");
        add("材料", "PLA / PETG");
        break;
      case "caliper":
        add("量程", "0–150 mm");
        add("分辨率", "0.01 mm");
        add("允许误差", "±0.02 mm");
        add("测量功能", "外径 / 内径 / 深度");
        break;
      default:
        add("供电", "按设备铭牌");
        add("通信接口", "USB / BNC / 接线端");
        add("工作环境", "15–30°C · < 80% RH");
        add("校准周期", "12 个月");
        add("当前读数", `${display.primaryText} · ${display.secondaryText}`);
    }
    const ports = window.OptilabPanorama?.getPorts(device.id) || ["MEASURE", "GND"];
    const linked = (state.presetInfo?.connections || []).filter((connection) =>
      connection.fromId === device.id || connection.toId === device.id
    );
    const connectionLines = linked.map((connection) => {
      const from = state.presetInfo.devices.find((item) => item.id === connection.fromId)?.label || connection.fromId;
      const to = state.presetInfo.devices.find((item) => item.id === connection.toId)?.label || connection.toId;
      return `${from} → ${to} · ${connection.standard}`;
    });
    const opticalPaths = (state.presetInfo?.optics || []).filter((path) => path.includes(device.id));
    const connectionText = connectionLines.length
      ? connectionLines.join("；")
      : opticalPaths.length
        ? `空间光路：${opticalPaths[0].map((id) =>
          state.presetInfo.devices.find((item) => item.id === id)?.label || id).join(" → ")}`
        : "当前无外部线缆；作为独立器件使用";
    const warningMap = {
      laser: "禁止直视出光口或镜面反射光；调整光路前必须关闭快门并确认激光等级。",
      "power-supply": "不得超出额定电压和电流；接线、改线和拆线前先关闭输出。",
      scope: "输入电压不得超过探头和通道额定值；测量市电必须使用隔离差分探头。",
      multimeter: "测量前确认档位、插孔和量程；禁止用电流档直接并联电源。",
      spectrometer: "避免强光使探测器饱和；更换入口或光纤前关闭光源。",
      "fiber-coupler": "禁止直视裸光纤端面；连接前清洁 FC/APC 端面。",
      "fiber-spool": "保持光纤弯曲半径大于 30 mm，避免折断或产生额外损耗。",
      "bioamp": "受试者连接需遵守实验室伦理与电气隔离要求，不得自行进行医疗诊断。",
      printer: "运行中禁止打开安全罩或接触高温喷头、运动部件。",
      heater: "高温表面和样品可能造成烫伤，断电后仍需等待冷却。",
      calorimeter: "高温表面和样品可能造成烫伤，断电后仍需等待冷却。"
    };
    return {
      kind,
      display,
      specs,
      ports,
      connectionText,
      warning: warningMap[kind] || "以设备铭牌、校准证书和指导教师要求为准；异常发热、异味或读数跳变时立即停止。",
      reading: inspectorReadout(kind, display),
      note: `${display.primaryLabel}: ${display.primaryText} · ${display.secondaryLabel}: ${display.secondaryText} · ${display.unifiedValue}`,
      state: /scope|analyzer|computer|daq|sensor/.test(kind) ? "SIGNAL LOCKED" :
        /power|laser|generator/.test(kind) ? "OUTPUT ON" :
          /camera|spectrometer/.test(kind) ? "ACQUIRING" : "READY"
    };
  }

  function populateInspector(id) {
    const device = state.presetInfo?.devices.find((item) => item.id === id);
    const panel = $("#lab-3d-inspector");
    if (!device || !panel) return;
    const data = deviceInspectorData(device);
    $("#lab-3d-inspector-title") && ($("#lab-3d-inspector-title").textContent = device.label);
    const variantLabel = device.variant && device.variant !== "generic" ? device.variant : "标准型";
    $("#lab-3d-inspector-kind") && ($("#lab-3d-inspector-kind").textContent = `${DEVICE_KIND_LABELS[data.kind] || "实验仪器"} · ${variantLabel}`);
    $("#lab-3d-inspector-state") && ($("#lab-3d-inspector-state").textContent = data.state);
    $("#lab-3d-inspector-value") && ($("#lab-3d-inspector-value").textContent = data.reading);
    $("#lab-3d-inspector-reading-note") && ($("#lab-3d-inspector-reading-note").textContent = data.note);
    $("#lab-3d-inspector-connections") && ($("#lab-3d-inspector-connections").textContent =
      `${data.connectionText}；端口：${data.ports.join(" / ")}`
    );
    $("#lab-3d-inspector-warning") && ($("#lab-3d-inspector-warning").textContent = data.warning);
    const specs = $("#lab-3d-inspector-specs");
    if (specs) {
      specs.replaceChildren(...data.specs.map(([label, value]) => {
        const cell = document.createElement("div");
        const key = document.createElement("span");
        const content = document.createElement("strong");
        key.textContent = label;
        content.textContent = value;
        cell.append(key, content);
        return cell;
      }));
    }
    panel.hidden = false;
    state.inspectorId = id;
    const lod = state.deviceGroups.get(id);
    state.modelAssetStatus = lod?.userData.modelStatus
      || (lod?.userData.modelSource ? `${lod.userData.modelSource} · 自动 LOD` : "自动 LOD · 程序化模型");
    updateModelAssetStatus();
  }

  function openInspector(id) {
    if (!state.deviceGroups.has(id)) return;
    state.selectedId = id;
    updateSelectionHelper();
    updateHud();
    populateInspector(id);
  }

  function closeInspector() {
    state.inspectorId = "";
    const panel = $("#lab-3d-inspector");
    if (panel) panel.hidden = true;
  }

  function refreshInspector() {
    if (!state.inspectorId) return;
    const device = state.presetInfo?.devices.find((item) => item.id === state.inspectorId);
    if (!device) {
      closeInspector();
      return;
    }
    const display = liveDisplayData(device, state.config || {});
    $("#lab-3d-inspector-value") && ($("#lab-3d-inspector-value").textContent = inspectorReadout(deviceKind(device), display));
    $("#lab-3d-inspector-reading-note") && ($("#lab-3d-inspector-reading-note").textContent =
      `${display.primaryLabel}: ${display.primaryText} · ${display.secondaryLabel}: ${display.secondaryText} · ${display.unifiedValue}`
    );
  }

  function resize() {
    if (!state.renderer || !state.canvas) return;
    const width = state.canvas.clientWidth;
    const height = state.canvas.clientHeight;
    if (!width || !height) return;
    const current = state.renderer.getSize(new state.three.Vector2());
    if (current.x !== width || current.y !== height) {
      state.renderer.setSize(width, height, false);
      state.camera.aspect = width / height;
      state.camera.fov = state.camera.aspect < 0.8 ? 46 : 39;
      state.camera.updateProjectionMatrix();
    }
  }

  function frameScene() {
    if (!state.deviceGroups.size) return;
    const positions = [...state.deviceGroups.values()].map((group) => group.position);
    const center = positions.reduce((result, position) => ({
      x: result.x + position.x / positions.length,
      z: result.z + position.z / positions.length
    }), { x: 0, z: 0 });
    state.cameraState.target = { x: center.x * 0.72, y: 0.42, z: center.z * 0.64 };
  }

  function setViewPreset(name) {
    const presets = {
      overview: { theta: Math.PI * 0.37, phi: Math.PI * 0.365, radius: 8.35 },
      optical: { theta: Math.PI * 0.42, phi: Math.PI * 0.39, radius: 7.7 },
      top: { theta: Math.PI * 0.5, phi: 0.22, radius: 8.6 }
    };
    state.cameraState.viewMode = name;
    if (name === "focus") {
      const selected = state.deviceGroups.get(state.selectedId);
      if (selected) {
        state.cameraState.target = {
          x: selected.position.x,
          y: selected.position.y + 0.42,
          z: selected.position.z
        };
        state.cameraState.theta = Math.PI * 0.42;
        state.cameraState.phi = Math.PI * 0.39;
        state.cameraState.radius = 3.8;
      }
    } else {
      frameScene();
      const view = presets[name] || presets.overview;
      state.cameraState.theta = view.theta;
      state.cameraState.phi = view.phi;
      state.cameraState.radius = view.radius;
    }
    document.querySelectorAll("[data-3d-view]").forEach((button) => {
      button.classList.toggle("active", button.dataset["3dView"] === name);
    });
  }

  function handleDoubleClick(event) {
    updateRayPointer(event);
    const hits = state.raycaster.intersectObjects([...state.deviceGroups.values()], true);
    const id = deviceIdFromObject(hits[0]?.object);
    if (id) {
      state.selectedId = id;
      updateSelectionHelper();
      updateHud();
      setViewPreset("focus");
    } else {
      setViewPreset("overview");
    }
  }

  function updateCamera() {
    const { radius, theta, phi, target } = state.cameraState;
    const aspect = state.camera.aspect || 1;
    const portraitBoost = aspect < 1 ? 1 + (1 - aspect) * 1.12 : 1;
    const effectiveRadius = radius * portraitBoost;
    state.camera.position.set(
      target.x + effectiveRadius * Math.sin(phi) * Math.cos(theta),
      target.y + effectiveRadius * Math.cos(phi),
      target.z + effectiveRadius * Math.sin(phi) * Math.sin(theta)
    );
    state.camera.lookAt(target.x, target.y, target.z);
  }

  function render(time, payload) {
    if (!state.active) return;
    configure(payload);
    if (!state.ready) {
      if (!state.loading) loadThree().then(() => {
        if (state.presetInfo) buildScene();
      }).catch((error) => {
        state.loading = false;
        const loading = $("#lab-3d-loading");
        if (loading) {
          loading.hidden = false;
          loading.textContent = `三维场景加载失败：${error.message}`;
        }
      });
      return;
    }
    resize();
    updateCamera();
    if (state.autoTour && time >= state.autoTourAt) {
      setProcessStep(state.processStep + 1);
    }
    if (time - state.lastTextureUpdate > 120) {
      state.lastTextureUpdate = time;
      state.dynamicTextures.forEach((entry) => {
        drawPanelTexture(entry, time, state.config || {});
      });
      updateHud();
    }
    updateSceneAnimations(time);
    state.renderer.render(state.scene, state.camera);
  }

  function setActive(value) {
    state.active = Boolean(value);
    if (state.canvas) {
      state.canvas.style.pointerEvents = state.active ? "auto" : "none";
    }
    if (state.active && !state.ready && !state.loading) {
      loadThree().then(() => {
        if (state.presetInfo) buildScene();
      }).catch((error) => {
        state.loading = false;
        const loading = $("#lab-3d-loading");
        if (loading) {
          loading.hidden = false;
          loading.textContent = `三维场景加载失败：${error.message}`;
        }
      });
    }
    if (state.stepMarker) state.stepMarker.visible = state.active && state.ready;
    syncProcessCollapse();
    if (!state.active) {
      hideTooltip();
      closeInspector();
    }
  }

  function resetLayout() {
    state.deviceGroups.forEach((group, id) => {
      const origin = state.initialPositions.get(id);
      if (origin) {
        group.position.copy(origin);
        state.selectionHelper?.update();
      }
    });
    rebuildConnections();
    updateHud();
    frameScene();
    updateProcessUI();
  }

  function init(canvas) {
    if (!canvas || state.canvas) return;
    state.canvas = canvas;
    canvas.addEventListener("pointerdown", pointerDown);
    canvas.addEventListener("pointermove", pointerMove);
    canvas.addEventListener("pointerup", pointerUp);
    canvas.addEventListener("pointercancel", pointerUp);
    canvas.addEventListener("pointerleave", hideTooltip);
    canvas.addEventListener("wheel", wheel, { passive: false });
    canvas.addEventListener("dblclick", handleDoubleClick);
    $("#panorama-device-list")?.addEventListener("click", (event) => {
      const button = event.target.closest?.("[data-panorama-device]");
      if (!button || !state.deviceGroups.has(button.dataset.panoramaDevice)) return;
      openInspector(button.dataset.panoramaDevice);
      if (state.cameraState.viewMode === "focus") setViewPreset("focus");
    });
    $("#panorama-reset-layout")?.addEventListener("click", resetLayout);
    $("#panorama-toggle-cables")?.addEventListener("click", () => {
      state.showCables = !state.showCables;
      if (state.cableGroup) state.cableGroup.visible = state.showCables;
    });
    document.querySelectorAll("[data-3d-view]").forEach((button) => {
      button.addEventListener("click", () => setViewPreset(button.dataset["3dView"]));
    });
    $("#lab-3d-step-prev")?.addEventListener("click", () => {
      state.autoTour = false;
      setProcessStep(state.processStep - 1);
    });
    $("#lab-3d-step-next")?.addEventListener("click", () => {
      state.autoTour = false;
      setProcessStep(state.processStep + 1);
    });
    $("#lab-3d-auto-step")?.addEventListener("click", () => {
      state.autoTour = !state.autoTour;
      updateProcessUI();
    });
    try {
      state.processCollapsed = localStorage.getItem("optilab-process-collapsed") === "1";
    } catch {
      state.processCollapsed = false;
    }
    $("#lab-3d-process-collapse")?.addEventListener("click", () => {
      state.processCollapsed = true;
      try {
        localStorage.setItem("optilab-process-collapsed", "1");
      } catch {
        // Ignore storage restrictions in private or embedded browsing contexts.
      }
      syncProcessCollapse();
    });
    $("#lab-3d-process-reopen")?.addEventListener("click", () => {
      state.processCollapsed = false;
      try {
        localStorage.setItem("optilab-process-collapsed", "0");
      } catch {
        // Ignore storage restrictions in private or embedded browsing contexts.
      }
      syncProcessCollapse();
    });
    $("#lab-3d-inspector-close")?.addEventListener("click", closeInspector);
    $("#lab-3d-inspector-focus")?.addEventListener("click", () => {
      if (state.inspectorId) setViewPreset("focus");
    });
    $("#lab-3d-model-import")?.addEventListener("click", () => {
      $("#lab-3d-model-file")?.click();
    });
    $("#lab-3d-model-file")?.addEventListener("change", async (event) => {
      const input = event.currentTarget;
      const file = input.files?.[0];
      if (!file) return;
      try {
        await importModelFile(file);
      } catch (error) {
        state.modelAssetStatus = `模型导入失败：${error.message}`;
        updateModelAssetStatus();
      } finally {
        input.value = "";
      }
    });
    $("#lab-3d-model-export")?.addEventListener("click", async () => {
      try {
        await exportCurrentModel();
      } catch (error) {
        state.modelAssetStatus = `模型导出失败：${error.message}`;
        updateModelAssetStatus();
      }
    });
    $("#lab-3d-model-reset")?.addEventListener("click", async () => {
      try {
        await resetImportedModel();
      } catch (error) {
        state.modelAssetStatus = `模型恢复失败：${error.message}`;
        updateModelAssetStatus();
      }
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && state.inspectorId) closeInspector();
    });
  }

  window.OptilabPanorama3D = {
    init,
    setActive,
    render,
    resetLayout,
    getMetrics: () => ({ ...state.metrics }),
    getPreset: () => state.presetInfo,
    getSelected: () => state.selectedId,
    getDeviceCount: () => state.deviceGroups.size,
    getProcess: () => ({
      index: state.processStep,
      total: state.processSteps.length,
      steps: state.processSteps.map((step) => ({ ...step }))
    }),
    getDeviceKinds: () => Object.fromEntries(
      [...state.deviceGroups.entries()].map(([id, group]) => [id, group.userData.kind || "generic"])
    ),
    getModelState: () => Object.fromEntries(
      [...state.deviceGroups.entries()].map(([id, lod]) => [
        id,
        {
          source: lod.userData.modelSource || "程序化模型",
          status: lod.userData.modelStatus || "自动 LOD",
          levels: lod.levels?.map((entry) => ({ distance: entry.distance })) || []
        }
      ])
    ),
    getDeviceParameters(id) {
      const device = state.presetInfo?.devices.find((item) => item.id === id);
      if (!device) return null;
      const data = deviceInspectorData(device);
      return {
        id,
        label: device.label,
        kind: data.kind,
        reading: data.reading,
        note: data.note,
        state: data.state,
        specs: data.specs.map(([label, value]) => ({ label, value })),
        ports: [...data.ports],
        connections: data.connectionText,
        warning: data.warning
      };
    },
    getPositions: () => Object.fromEntries(
      [...state.deviceGroups.entries()].map(([id, group]) => [
        id,
        { x: group.position.x, y: group.position.y, z: group.position.z }
      ])
    ),
    getDeviceScreenPosition(id) {
      const group = state.deviceGroups.get(id);
      if (!group || !state.camera || !state.canvas) return null;
      const vector = group.position.clone();
      vector.y += 0.42;
      vector.project(state.camera);
      const rect = state.canvas.getBoundingClientRect();
      return {
        x: rect.left + (vector.x * 0.5 + 0.5) * rect.width,
        y: rect.top + (-vector.y * 0.5 + 0.5) * rect.height
      };
    },
    isReady: () => state.ready
  };
})();
