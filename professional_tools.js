"use strict";

(function () {
  const calibration = window.OptilabCalibration;
  if (!calibration) return;

  const $ = (selector) => document.querySelector(selector);
  const labels = {
    model: "仪器型号",
    serial: "序列号",
    calibratedAt: "校准日期",
    maxPowerMw: "最大光功率 / mW",
    wavelengthNm: "标定波长 / nm",
    linewidthNm: "光谱线宽 / nm",
    stabilityPercent: "功率稳定度 / %",
    beamDiameterMm: "光束直径 / mm",
    divergenceMrad: "发散角 / mrad",
    focalMm: "焦距 / mm",
    apertureMm: "通光口径 / mm",
    refractiveIndex: "折射率",
    surfaceErrorNm: "面型误差 / nm",
    transmissionPercent: "透射率 / %",
    reflectivityPercent: "反射率 / %",
    tiltResolutionUrad: "角度分辨率 / μrad",
    minApertureMm: "最小开孔 / mm",
    maxApertureMm: "最大开孔 / mm",
    currentApertureMm: "当前开孔 / mm",
    edgeReflectivityPercent: "边缘反射率 / %",
    opticalDensity: "光密度 OD",
    wavelengthMinNm: "最短波长 / nm",
    wavelengthMaxNm: "最长波长 / nm",
    uniformityPercent: "均匀性误差 / %",
    responsivityAw: "响应度 / A·W⁻¹",
    activeAreaMm2: "有效面积 / mm²",
    saturationCurrentUa: "饱和电流 / μA",
    readNoisePa: "读出噪声 / pA",
    bandwidthHz: "带宽 / Hz",
    darkCurrentNa: "暗电流 / nA",
    fullWellElectrons: "满阱电子数",
    readNoiseElectrons: "读出噪声 / e⁻",
    pixelSizeUm: "像元尺寸 / μm",
    quantumEfficiencyPercent: "量子效率 / %",
    maxGain: "最大增益 / ×",
    adcBits: "ADC 位数",
    verticalRangeV: "垂直范围 / V",
    inputImpedanceOhm: "输入阻抗 / Ω",
    probeAttenuation: "探头衰减 / ×",
    maxVoltageV: "最大电压 / V",
    maxCurrentA: "最大电流 / A",
    voltageResolutionMv: "电压分辨率 / mV",
    currentResolutionMa: "电流分辨率 / mA",
    rippleMv: "纹波 / mV",
    attenuationDbPerKm: "损耗 / dB·km⁻¹",
    lengthM: "长度 / m",
    minBendRadiusMm: "最小弯曲半径 / mm",
    powerMaxMw: "最大光功率 / mW",
    voltageMaxV: "最大电压 / V",
    currentMaxA: "最大电流 / A"
  };

  function createModal() {
    const root = document.createElement("section");
    root.className = "calibration-modal";
    root.id = "calibration-modal";
    root.hidden = true;
    root.innerHTML = `
      <button class="calibration-backdrop" type="button" data-calibration-close aria-label="关闭器材校准中心"></button>
      <div class="calibration-dialog" role="dialog" aria-modal="true" aria-labelledby="calibration-title">
        <header class="calibration-head">
          <div>
            <span class="eyebrow">仪器可信度 · 本地校准</span>
            <h2 id="calibration-title">器材校准中心</h2>
            <p>保存型号、序列号和真实计量参数。校准数据只保存在当前浏览器。</p>
          </div>
          <button class="calibration-close" type="button" data-calibration-close aria-label="关闭">×</button>
        </header>
        <div class="calibration-toolbar">
          <label><span>器材类别</span><select id="calibration-kind"></select></label>
          <div class="calibration-actions">
            <button class="primary" type="button" id="calibration-save">保存并应用</button>
            <button type="button" id="calibration-export">导出 JSON</button>
            <button type="button" id="calibration-import">导入 JSON</button>
            <button type="button" id="calibration-reset">恢复当前类别</button>
            <input type="file" id="calibration-file" accept=".json,application/json" hidden>
          </div>
        </div>
        <div class="calibration-fields" id="calibration-fields"></div>
        <p class="calibration-status" id="calibration-status" role="status"></p>
      </div>`;
    document.body.append(root);
    return root;
  }

  function fieldType(key) {
    return /At$|model|serial/.test(key) ? "text" : "number";
  }

  function renderFields(kind) {
    const values = calibration.get(kind);
    const fields = $("#calibration-fields");
    fields.replaceChildren(...Object.entries(values)
      .filter(([key]) => ["model", "serial", "calibratedAt", ...Object.keys(labels)].includes(key))
      .map(([key, value]) => {
        const label = document.createElement("label");
        label.className = "calibration-field";
        const name = document.createElement("span");
        name.textContent = labels[key] || key;
        const input = document.createElement("input");
        input.type = fieldType(key);
        input.step = input.type === "number" ? "any" : "";
        input.value = String(value ?? "");
        input.dataset.calibrationKey = key;
        label.append(name, input);
        return label;
      }));
    const health = document.createElement("div");
    health.className = "calibration-health";
    health.textContent = `当前类别：${kind} · 校准日期 ${values.calibratedAt || "未填写"} · 序列号 ${values.serial || "未填写"}`;
    fields.append(health);
  }

  function openModal() {
    const modal = $("#calibration-modal");
    modal.hidden = false;
    renderFields($("#calibration-kind").value);
    window.setTimeout(() => $("#calibration-kind").focus(), 0);
  }

  function closeModal() {
    $("#calibration-modal").hidden = true;
  }

  function saveCurrent() {
    const kind = $("#calibration-kind").value;
    const values = {};
    document.querySelectorAll("[data-calibration-key]").forEach((input) => {
      values[input.dataset.calibrationKey] = input.type === "number" ? Number(input.value) : input.value;
    });
    calibration.set(kind, values);
    $("#calibration-status").textContent = `${kind} 校准参数已保存并应用`;
    renderFields(kind);
    window.dispatchEvent(new CustomEvent("optilab:calibration-changed"));
  }

  function exportCalibration() {
    const blob = new Blob([JSON.stringify(calibration.all(), null, 2)], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "OptiLab_仪器校准参数.json";
    anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function importCalibration(file) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const imported = JSON.parse(String(reader.result));
        Object.entries(imported).forEach(([kind, values]) => calibration.set(kind, values));
        renderFields($("#calibration-kind").value);
        $("#calibration-status").textContent = "校准文件已导入";
      } catch (error) {
        $("#calibration-status").textContent = `导入失败：${error.message}`;
      }
    };
    reader.readAsText(file, "utf-8");
  }

  function initialize() {
    const modal = createModal();
    const kindSelect = $("#calibration-kind");
    Object.keys(calibration.all()).filter((kind) => kind !== "default").forEach((kind) => {
      const option = document.createElement("option");
      option.value = kind;
      option.textContent = kind;
      kindSelect.append(option);
    });
    const trigger = document.createElement("button");
    trigger.type = "button";
    trigger.className = "calibration-open-button";
    trigger.textContent = "器材校准中心";
    trigger.addEventListener("click", openModal);
    const heading = $(".simulation-engine-heading");
    heading?.append(trigger);
    kindSelect.addEventListener("change", () => renderFields(kindSelect.value));
    modal.querySelectorAll("[data-calibration-close]").forEach((button) => button.addEventListener("click", closeModal));
    $("#calibration-save").addEventListener("click", saveCurrent);
    $("#calibration-export").addEventListener("click", exportCalibration);
    $("#calibration-import").addEventListener("click", () => $("#calibration-file").click());
    $("#calibration-file").addEventListener("change", (event) => {
      if (event.target.files?.[0]) importCalibration(event.target.files[0]);
      event.target.value = "";
    });
    $("#calibration-reset").addEventListener("click", () => {
      calibration.reset(kindSelect.value);
      renderFields(kindSelect.value);
      $("#calibration-status").textContent = "已恢复当前类别默认值";
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !modal.hidden) closeModal();
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initialize, { once: true });
  else initialize();
})();
