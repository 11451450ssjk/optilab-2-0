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
    showCables: true,
    metrics: { alignment: 0, connectivity: 0, power: 0, snr: 0, frequency: 0 },
    lastTextureUpdate: 0,
    animatedObjects: [],
    stepMarker: null,
    processSteps: [],
    processStep: 0,
    autoTour: false,
    autoTourAt: 0,
    cameraState: {
      radius: 8.35,
      theta: Math.PI * 0.38,
      phi: Math.PI * 0.365,
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

  function drawPanelTexture(entry, time, config) {
    const { canvas, context, device } = entry;
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
    if (device.type === "scope") {
      context.strokeStyle = "#6de2a0";
      context.lineWidth = 3;
      context.beginPath();
      const cycles = clamp((state.metrics.frequency || 500) / 300, 1, 7);
      for (let x = 12; x < canvas.width - 12; x += 2) {
        const phase = ((x - 12) / (canvas.width - 24)) * Math.PI * 2 * cycles;
        const y = 128 + Math.sin(phase + time * 0.002) * 60 * state.metrics.connectivity;
        if (x === 12) context.moveTo(x, y);
        else context.lineTo(x, y);
      }
      context.stroke();
    } else if (device.type === "screen") {
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
    } else if (device.type === "laser") {
      context.fillStyle = colorArrayToHex(config.beamColor);
      context.font = 'bold 58px "Cascadia Mono", monospace';
      context.textAlign = "center";
      context.fillText(device.variant === "hene" ? "He-Ne" : device.symbol || "LASER", 256, 135);
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

  function createDeviceGroup(device) {
    const THREE = state.three;
    const group = new THREE.Group();
    group.userData.deviceId = device.id;
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

    if (device.type === "laser") {
      const casingColor = device.variant === "hene" ? 0x8b3f38 :
        device.variant === "solid" ? 0x334c57 : device.variant === "fiber" ? 0x355a4e : 0x303d3b;
      const casing = new THREE.MeshStandardMaterial({ color: casingColor, metalness: 0.64, roughness: 0.3 });
      addPart(group, device, new THREE.BoxGeometry(0.86, 0.3, 0.44), casing, [0, 0.31, 0]);
      for (let index = 0; index < 5; index += 1) {
        addPart(group, device, new THREE.BoxGeometry(0.055, 0.34, 0.47), brassMaterial, [-0.23 + index * 0.115, 0.32, 0]);
      }
      addPart(group, device, new THREE.CylinderGeometry(0.085, 0.085, 0.72, 24), blackMetal, [0, 0.38, 0], [0, 0, Math.PI / 2]);
      addPart(group, device, new THREE.CylinderGeometry(0.1, 0.1, 0.045, 24), brassMaterial, [0.38, 0.38, 0], [0, 0, Math.PI / 2]);
      addPart(group, device, new THREE.CircleGeometry(0.047, 24), accentMaterial, [0.405, 0.38, 0], [0, Math.PI / 2, 0]);
      const panelTexture = makePanelTexture(device, state.config || {});
      addPart(group, device, new THREE.PlaneGeometry(0.3, 0.14), new THREE.MeshBasicMaterial({ map: panelTexture }), [0, 0.3, 0.225]);
      addPart(group, device, new THREE.SphereGeometry(0.025, 12, 12), new THREE.MeshBasicMaterial({ color: 0x6ee3a2 }), [0.29, 0.42, 0.23]);
    } else if (device.type === "mirror") {
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
    } else if (device.type === "splitter") {
      addPart(group, device, new THREE.CylinderGeometry(0.035, 0.035, 0.28, 16), blackMetal, [0, 0.2, 0]);
      addPart(group, device, new THREE.BoxGeometry(0.38, 0.38, 0.38), glassMaterial, [0, 0.46, 0], [0, Math.PI / 4, 0]);
      addPart(group, device, new THREE.BoxGeometry(0.39, 0.02, 0.39), accentMaterial, [0, 0.46, 0], [0, Math.PI / 4, 0]);
      [[-0.2, 0], [0.2, 0]].forEach(([x]) => {
        addPart(group, device, new THREE.CylinderGeometry(0.095, 0.105, 0.1, 20), blackMetal, [x, 0.46, 0], [0, 0, Math.PI / 2]);
      });
    } else if (device.type === "lens") {
      addPart(group, device, new THREE.CylinderGeometry(0.035, 0.035, 0.46, 16), blackMetal, [0, 0.29, 0]);
      addPart(group, device, new THREE.TorusGeometry(0.22, 0.035, 12, 32), blackMetal, [0, 0.53, 0], [0, Math.PI / 2, 0]);
      addPart(group, device, new THREE.CircleGeometry(0.195, 32), glassMaterial, [-0.008, 0.53, 0], [0, Math.PI / 2, 0]);
      addPart(group, device, new THREE.TorusGeometry(0.16, 0.006, 6, 32), accentMaterial, [-0.018, 0.53, 0], [0, Math.PI / 2, 0]);
      addPart(group, device, new THREE.BoxGeometry(0.08, 0.2, 0.06), blackMetal, [0.02, 0.35, 0.17]);
    } else if (device.type === "sample") {
      const sampleColor = device.variant === "solar" ? 0x245a8b : 0x70a287;
      addPart(group, device, new THREE.BoxGeometry(0.42, 0.035, 0.36), blackMetal, [0, 0.14, 0]);
      addPart(group, device, new THREE.BoxGeometry(0.34, 0.29, 0.29), glassMaterial, [0, 0.3, 0]);
      addPart(group, device, new THREE.BoxGeometry(0.24, 0.17, 0.2), new THREE.MeshStandardMaterial({
        color: sampleColor,
        emissive: sampleColor,
        emissiveIntensity: 0.08,
        transparent: true,
        opacity: 0.82,
        roughness: 0.28
      }), [0, 0.3, 0]);
      [-0.11, 0, 0.11].forEach((x) => {
        addPart(group, device, new THREE.BoxGeometry(0.018, 0.18, 0.21), steelMaterial, [x, 0.3, 0]);
      });
    } else if (device.type === "screen") {
      addPart(group, device, new THREE.CylinderGeometry(0.03, 0.03, 0.62, 14), blackMetal, [0, 0.33, 0]);
      addPart(group, device, new THREE.BoxGeometry(0.74, 0.052, 0.18), blackMetal, [0, 0.08, 0]);
      addPart(group, device, new THREE.BoxGeometry(0.72, 0.96, 0.04), blackMetal, [0, 0.66, 0]);
      const panelTexture = makePanelTexture(device, state.config || {});
      addPart(group, device, new THREE.PlaneGeometry(0.64, 0.86), new THREE.MeshBasicMaterial({
        map: panelTexture,
        side: THREE.DoubleSide
      }), [0, 0.66, 0.024]);
      addPart(group, device, new THREE.BoxGeometry(0.76, 0.025, 0.055), accentMaterial, [0, 1.15, 0]);
    } else if (device.type === "scope") {
      addPart(group, device, new THREE.BoxGeometry(1.12, 0.58, 0.54), bodyMaterial, [0, 0.34, 0]);
      addPart(group, device, new THREE.BoxGeometry(1.16, 0.045, 0.58), blackMetal, [0, 0.61, 0]);
      addPart(group, device, new THREE.BoxGeometry(0.96, 0.51, 0.026), blackMetal, [0, 0.36, 0.282]);
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
      }
      [-0.3, 0, 0.3].forEach((x) => {
        addPart(group, device, new THREE.CylinderGeometry(0.035, 0.035, 0.055, 14), brassMaterial, [x, 0.21, 0.31], [Math.PI / 2, 0, 0]);
      });
      addPart(group, device, new THREE.TorusGeometry(0.28, 0.025, 8, 24, Math.PI), blackMetal, [0, 0.66, 0], [0, 0, Math.PI]);
    } else if (device.type === "computer") {
      addPart(group, device, new THREE.BoxGeometry(0.22, 0.25, 0.18), blackMetal, [0, 0.19, 0]);
      addPart(group, device, new THREE.BoxGeometry(0.86, 0.57, 0.07), bodyMaterial, [0, 0.53, 0], [-0.08, 0, 0]);
      const screenTexture = makePanelTexture(device, state.config || {});
      addPart(group, device, new THREE.PlaneGeometry(0.78, 0.47), new THREE.MeshBasicMaterial({ map: screenTexture }), [0, 0.54, 0.042], [-0.08, 0, 0]);
      addPart(group, device, new THREE.BoxGeometry(0.72, 0.045, 0.28), blackMetal, [0, 0.1, 0.25], [0.08, 0, 0]);
    } else if (device.type === "detector" || device.type === "camera") {
      addPart(group, device, new THREE.CylinderGeometry(0.19, 0.17, 0.42, 32), bodyMaterial, [0, 0.39, 0], [0, 0, Math.PI / 2]);
      addPart(group, device, new THREE.TorusGeometry(0.145, 0.025, 10, 28), brassMaterial, [-0.215, 0.39, 0], [0, Math.PI / 2, 0]);
      addPart(group, device, new THREE.CircleGeometry(0.125, 28), glassMaterial, [-0.225, 0.39, 0], [0, Math.PI / 2, 0]);
      addPart(group, device, new THREE.BoxGeometry(0.14, 0.34, 0.25), blackMetal, [0.22, 0.31, 0]);
      addPart(group, device, new THREE.SphereGeometry(0.03, 12, 12), new THREE.MeshBasicMaterial({ color: 0x6ae3a4 }), [0.24, 0.5, 0.13]);
    } else if (device.type === "board") {
      const boardColor = device.variant === "digital" ? 0x17425c : device.variant === "arduino" ? 0x1d6c59 : 0x174b3a;
      addPart(group, device, new THREE.BoxGeometry(1.02, 0.08, 0.66), new THREE.MeshStandardMaterial({
        color: boardColor,
        metalness: 0.15,
        roughness: 0.64
      }), [0, 0.16, 0]);
      addPart(group, device, new THREE.BoxGeometry(0.25, 0.09, 0.22), darkMaterial, [-0.16, 0.245, -0.02]);
      addPart(group, device, new THREE.BoxGeometry(0.11, 0.035, 0.11), accentMaterial, [0.2, 0.23, -0.1]);
      for (let index = 0; index < 12; index += 1) {
        addPart(group, device, new THREE.BoxGeometry(0.025, 0.045, 0.025), brassMaterial, [-0.43 + index * 0.078, 0.225, 0.28]);
      }
      addPart(group, device, new THREE.BoxGeometry(0.2, 0.12, 0.14), steelMaterial, [0.36, 0.26, 0.19]);
      addPart(group, device, new THREE.BoxGeometry(0.18, 0.1, 0.15), darkMaterial, [-0.42, 0.25, 0.15]);
    } else if (device.type === "probe") {
      addPart(group, device, new THREE.CylinderGeometry(0.055, 0.055, 0.36, 18), bodyMaterial, [0, 0.42, 0], [0, 0, -0.14]);
      addPart(group, device, new THREE.CylinderGeometry(0.012, 0.004, 0.62, 12), steelMaterial, [-0.065, 0.78, 0], [0, 0, -0.14]);
      addPart(group, device, new THREE.TorusGeometry(0.057, 0.012, 8, 18), accentMaterial, [0, 0.5, 0], [Math.PI / 2, 0, 0]);
      addPart(group, device, new THREE.CylinderGeometry(0.02, 0.02, 0.5, 10), blackMetal, [0.02, 0.28, 0], [0, 0, -0.14]);
    } else if (device.type === "magnet") {
      addPart(group, device, new THREE.BoxGeometry(0.82, 0.16, 0.45), blackMetal, [0, 0.22, 0]);
      [-0.31, 0.31].forEach((x) => {
        addPart(group, device, new THREE.CylinderGeometry(0.1, 0.1, 0.5, 20), steelMaterial, [x, 0.42, 0]);
        addPart(group, device, new THREE.TorusGeometry(0.12, 0.038, 10, 24), brassMaterial, [x, 0.44, 0], [Math.PI / 2, 0, 0]);
      });
      addPart(group, device, new THREE.BoxGeometry(0.55, 0.1, 0.26), accentMaterial, [0, 0.33, 0]);
    } else if (device.type === "prism") {
      addPart(group, device, new THREE.CylinderGeometry(0.32, 0.32, 0.45, 3), glassMaterial, [0, 0.37, 0], [Math.PI / 2, 0, Math.PI / 6]);
      addPart(group, device, new THREE.CylinderGeometry(0.035, 0.035, 0.31, 14), blackMetal, [0, 0.19, 0]);
    } else if (device.type === "fiber-spool" || device.type === "fiber-coupler") {
      addPart(group, device, new THREE.BoxGeometry(0.5, 0.08, 0.36), blackMetal, [0, 0.16, 0]);
      [-0.09, 0.09].forEach((x) => {
        addPart(group, device, new THREE.TorusGeometry(0.2, 0.038, 12, 36), new THREE.MeshStandardMaterial({
          color: device.type === "fiber-spool" ? 0xd8ad57 : 0x5c8e80,
          metalness: 0.25,
          roughness: 0.45
        }), [x, 0.25, 0], [Math.PI / 2, 0, 0]);
      });
      addPart(group, device, new THREE.CylinderGeometry(0.055, 0.055, 0.24, 16), brassMaterial, [0, 0.31, 0], [0, 0, Math.PI / 2]);
    } else if (device.type === "diode") {
      addPart(group, device, new THREE.CylinderGeometry(0.11, 0.11, 0.34, 24), blackMetal, [0, 0.24, 0], [0, 0, Math.PI / 2]);
      addPart(group, device, new THREE.TorusGeometry(0.105, 0.012, 8, 24), steelMaterial, [0.18, 0.24, 0], [0, Math.PI / 2, 0]);
      [-0.08, 0.08].forEach((z) => {
        addPart(group, device, new THREE.CylinderGeometry(0.008, 0.008, 0.26, 8), steelMaterial, [-0.2, 0.16, z], [0, 0, Math.PI / 2]);
      });
    } else {
      const wide = ["spectrometer", "instrument", "load", "logic-analyzer", "signal", "power"].includes(device.type);
      const width = wide ? 0.92 : 0.7;
      addPart(group, device, new THREE.BoxGeometry(width, 0.46, 0.48), bodyMaterial, [0, 0.28, 0]);
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

  function buildScene() {
    if (!state.ready || !state.presetInfo) return;
    const THREE = state.three;
    state.deviceGroups.forEach((group) => {
      state.scene.remove(group);
      disposeObject(group);
    });
    state.deviceGroups.clear();
    state.initialPositions.clear();
    state.dynamicTextures = [];
    state.animatedObjects = [];
    state.presetInfo.devices.forEach((device) => {
      const group = createDeviceGroup(device);
      state.deviceGroups.set(device.id, group);
      state.scene.add(group);
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
    frameScene();
    updateSelectionHelper();
    rebuildConnections();
    updateProcessUI();
    updateHud();
  }

  function buildProcessSteps() {
    const info = state.presetInfo;
    const devices = info?.devices || [];
    const optics = info?.optics?.flat?.() || [];
    const hasOptics = optics.length >= 2 || devices.some((device) => device.zone === "optical");
    const electronicDevices = devices.filter((device) => device.zone === "electronic");
    const hasElectronics = electronicDevices.length >= 2 || (info?.connections?.length || 0) > 0;
    const source = devices.find((device) => device.type === "laser") || devices[0];
    const firstOptic = devices.find((device) => ["mirror", "lens", "splitter", "sample"].includes(device.type)) || devices[1];
    const detector = devices.find((device) => ["detector", "camera", "screen", "scope"].includes(device.type)) || devices.at(-1);

    if (hasOptics && hasElectronics) {
      return [
        {
          title: "先断电检查光学与电子条件",
          detail: `确认${source?.label || "光源"}的等级与遮光条件，核对${electronicDevices[0]?.label || "仪器"}量程、极性和共地。`,
          deviceId: source?.id
        },
        {
          title: "固定光源并建立主光轴",
          detail: `锁定${source?.label || "光源"}，让出光口与平台导轨平行，先保证高度一致。`,
          deviceId: source?.id
        },
        {
          title: "依序安装光学与电子器件",
          detail: `先放${firstOptic?.label || "第一片光学元件"}，再接好${electronicDevices[0]?.label || "测量仪器"}的标准测试线，悬空电缆留出余量。`,
          deviceId: firstOptic?.id
        },
        {
          title: "小步调节并观察实时反馈",
          detail: "拖动镜架或样品时只做微调，关注对准率、功率和波形同时变化，避免一次移动过大。",
          deviceId: detector?.id
        },
        {
          title: "读数稳定后采集与复位",
          detail: "保持环境不变重复测量 3 次，记录异常与环境条件；实验结束后先关光或断电，再拆除连线。",
          deviceId: detector?.id
        }
      ];
    }
    if (hasElectronics && !hasOptics) {
      return [
        {
          title: "断电核对器材与量程",
          detail: `先检查${devices[0]?.label || "被测电路"}、夹具和测试线，确认仪表量程及共地方式。`,
          deviceId: devices[0]?.id
        },
        {
          title: "按接口标准完成接线",
          detail: `按 ${info.standards || "实验指导书"} 接线，先接参考地，再接通信号与电源端。`,
          deviceId: electronicDevices[0]?.id
        },
        {
          title: "限流上电并建立稳定工作点",
          detail: "从低电压、低电流开始，确认无异常发热后逐步增加，示波器先完成自动触发与零点校准。",
          deviceId: devices[1]?.id || devices[0]?.id
        },
        {
          title: "调节参数并记录响应",
          detail: `围绕${state.config?.primaryLabel || "横轴变量"}做双向扫描，每个测点稳定后再记录，避免读数漂移。`,
          deviceId: detector?.id
        },
        {
          title: "断开负载并整理实验台",
          detail: "先降输出、再断电、后拆线；保留原始数据与量程截图，检查异常点后重新测量。",
          deviceId: devices.at(-1)?.id
        }
      ];
    }
    return [
      {
        title: "确认光源安全与实验条件",
        detail: "检查光源等级、护目镜和急停位置，固定电源与光学平台，清理主光轴上的遮挡物。",
        deviceId: source?.id
      },
      {
        title: "固定光源并完成粗对准",
        detail: `锁定${source?.label || "光源"}，出光口朝向主光轴，先让所有镜架中心高度一致。`,
        deviceId: source?.id
      },
      {
        title: "沿光路安装功能器件",
        detail: `依序放入反射镜、分束器或${firstOptic?.label || "透镜"}，观察光斑是否落在下一器件中心。`,
        deviceId: firstOptic?.id
      },
      {
        title: "精细调节并读取稳定信号",
        detail: "拖动镜架进行小角度微调，直到条纹清晰、对准率提高且探测器功率进入合理区间。",
        deviceId: detector?.id
      },
      {
        title: "重复采集并记录实验数据",
        detail: "稳定 30 秒后读取测量值，重复 3 次并记录环境条件；原始数据应包含单位与实验编号。",
        deviceId: detector?.id
      }
    ];
  }

  function updateProcessUI() {
    const steps = state.processSteps;
    const step = steps[state.processStep];
    if (!step) return;
    const total = steps.length;
    const count = $("#lab-3d-step-count");
    const title = $("#lab-3d-step-title");
    const detail = $("#lab-3d-step-detail");
    const bar = $(".lab-3d-progress i");
    const autoButton = $("#lab-3d-auto-step");
    if (count) count.textContent = `实验过程 ${String(state.processStep + 1).padStart(2, "0")} / ${String(total).padStart(2, "0")}`;
    if (title) title.textContent = step.title;
    if (detail) detail.textContent = step.detail;
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
    state.autoTourAt = performance.now() + 4200;
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
      state.beamGroup.add(pulse);
      state.animatedObjects.push({
        type: "beamPulse",
        curve,
        object: pulse,
        offset: (index * 0.19 + pulseIndex / 3) % 1,
        speed: 0.075 + index * 0.004
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
      state.cableGroup.add(tube);
      const stripe = makeTube([from, middle, to], 0.006, new state.three.Color(color).offsetHSL(0, -0.16, 0.2), 0.72);
      stripe.position.y = 0.012;
      stripe.userData.connectionType = "cable";
      state.cableGroup.add(stripe);
      [from, to].forEach((point) => {
        const connector = new state.three.Mesh(
          new state.three.CylinderGeometry(0.035, 0.035, 0.055, 18),
          new state.three.MeshStandardMaterial({ color, metalness: 0.5, roughness: 0.25 })
        );
        connector.position.copy(point);
        connector.rotation.x = Math.PI / 2;
        state.cableGroup.add(connector);
      });
    });
  }

  function updateSceneAnimations(time) {
    state.animatedObjects.forEach((entry) => {
      if (entry.type !== "beamPulse") return;
      const progress = (time * 0.001 * entry.speed + entry.offset) % 1;
      entry.object.position.copy(entry.curve.getPointAt(progress));
      const pulseScale = 0.72 + Math.sin(time * 0.006 + entry.offset * 8) * 0.22;
      entry.object.scale.setScalar(pulseScale);
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
    detail.textContent = `${device.variant ? `型号特征 ${device.variant}` : "标准器材"} · 端口 ${ports.join(" / ")}`;
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

  function pointerUp() {
    state.dragGroup = null;
    state.orbit = null;
    if (state.canvas) state.canvas.style.cursor = "move";
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
        if (entry.type === "screen" || entry.type === "scope") {
          drawPanelTexture(entry, performance.now(), state.config);
        }
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
    const sourceDrive = clamp(Math.abs(Number(state.config?.primary) || 1) / 20, 0.18, 1);
    const hasOptics = optical.length >= 2;
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
      hasElectronics: electronic.length >= 2
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
    const view = presets[name] || presets.overview;
    state.cameraState.theta = view.theta;
    state.cameraState.phi = view.phi;
    state.cameraState.radius = view.radius;
    document.querySelectorAll("[data-3d-view]").forEach((button) => {
      button.classList.toggle("active", button.dataset["3dView"] === name);
    });
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
        if (entry.type === "screen" || entry.type === "scope" || entry.type === "computer") {
          drawPanelTexture(entry, time, state.config || {});
        }
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
    if (!state.active) hideTooltip();
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
    canvas.addEventListener("dblclick", () => setViewPreset("overview"));
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
