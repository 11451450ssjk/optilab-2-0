"use strict";

(function () {
  const store = window.OptilabEquipmentStore;
  if (!store) return;
  const modal = document.getElementById("equipment-library-modal");
  const select = document.getElementById("equipment-library-profile");
  const editor = document.getElementById("equipment-library-editor");
  const status = document.getElementById("equipment-library-status");
  const fileInput = document.getElementById("equipment-library-file");
  if (!modal || !select || !editor) return;

  function setStatus(message, stateName = "") {
    if (!status) return;
    status.textContent = message;
    status.dataset.state = stateName;
  }

  function populateSelect(preferred = select.value) {
    const profiles = store.listProfiles();
    select.replaceChildren(...profiles.map((sim) => {
      const option = document.createElement("option");
      option.value = sim;
      option.textContent = sim;
      return option;
    }));
    select.value = profiles.includes(preferred) ? preferred : profiles[0] || "";
  }

  function loadSelectedProfile() {
    const profile = store.getProfile(select.value);
    editor.value = JSON.stringify(profile || {}, null, 2);
    setStatus(store.hasOverride(select.value) ? "当前使用自定义参数" : "当前使用内置参数", "ready");
  }

  function openLibrary() {
    populateSelect();
    loadSelectedProfile();
    modal.hidden = false;
    document.body.classList.add("equipment-library-open");
    window.setTimeout(() => editor.focus(), 80);
  }

  function closeLibrary() {
    modal.hidden = true;
    document.body.classList.remove("equipment-library-open");
  }

  function saveCurrent() {
    try {
      const profile = JSON.parse(editor.value);
      store.setProfile(select.value, profile);
      setStatus("参数已保存，并应用到当前实验。", "success");
      refreshCurrentExperiment();
    } catch (error) {
      setStatus(`保存失败：${error.message}`, "error");
    }
  }

  function downloadJson() {
    const text = store.exportLibrary();
    const blob = new Blob([text], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "optilab-equipment-library.json";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    setStatus("器材参数库已导出为 JSON。", "success");
  }

  async function importJson(file) {
    if (!file) return;
    try {
      const imported = store.importLibrary(await file.text());
      populateSelect();
      loadSelectedProfile();
      refreshCurrentExperiment();
      setStatus(`已导入 ${imported} 个器材参数档案。`, "success");
    } catch (error) {
      setStatus(`导入失败：${error.message}`, "error");
    }
  }

  function refreshCurrentExperiment() {
    window.OptilabBridge?.refreshEquipment?.();
  }

  document.getElementById("open-equipment-library")?.addEventListener("click", openLibrary);
  document.querySelectorAll("[data-equipment-library-close]").forEach((button) => {
    button.addEventListener("click", closeLibrary);
  });
  select.addEventListener("change", loadSelectedProfile);
  document.getElementById("equipment-library-save")?.addEventListener("click", saveCurrent);
  document.getElementById("equipment-library-export")?.addEventListener("click", downloadJson);
  document.getElementById("equipment-library-import")?.addEventListener("click", () => fileInput?.click());
  fileInput?.addEventListener("change", async (event) => {
    const input = event.currentTarget;
    await importJson(input.files?.[0]);
    input.value = "";
  });
  document.getElementById("equipment-library-reset-one")?.addEventListener("click", () => {
    store.resetProfile(select.value);
    loadSelectedProfile();
    refreshCurrentExperiment();
    setStatus("当前档案已恢复内置参数。", "success");
  });
  document.getElementById("equipment-library-reset-all")?.addEventListener("click", () => {
    if (!window.confirm("确定清除全部自定义器材参数吗？")) return;
    store.resetAll();
    populateSelect();
    loadSelectedProfile();
    refreshCurrentExperiment();
    setStatus("全部自定义参数已清除。", "success");
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !modal.hidden) closeLibrary();
  });
  window.addEventListener("optilab:equipment-library-changed", () => {
    if (!modal.hidden) loadSelectedProfile();
  });
})();
