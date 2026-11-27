"use strict";

(function () {
  const STORAGE_KEY = "optilab_equipment_library_v2";
  const baseProfiles = JSON.parse(JSON.stringify(window.OPTILAB_EQUIPMENT_PROFILES || {}));
  let overrides = {};

  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    overrides = stored && typeof stored === "object" && !Array.isArray(stored) ? stored : {};
  } catch {
    overrides = {};
  }

  const clone = (value) => JSON.parse(JSON.stringify(value));
  const validProfile = (profile) => profile
    && Array.isArray(profile.instruments)
    && Array.isArray(profile.conditions)
    && Array.isArray(profile.tips)
    && typeof profile.safety === "string";

  function persist() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides));
    window.dispatchEvent(new CustomEvent("optilab:equipment-library-changed"));
  }

  function getProfile(sim) {
    const profile = overrides[sim] || baseProfiles[sim];
    return profile ? clone(profile) : null;
  }

  function getBaseProfile(sim) {
    return baseProfiles[sim] ? clone(baseProfiles[sim]) : null;
  }

  function listProfiles() {
    return [...new Set([...Object.keys(baseProfiles), ...Object.keys(overrides)])].sort();
  }

  function setProfile(sim, profile) {
    if (!sim || !validProfile(profile)) throw new Error("参数档案格式不完整");
    overrides[sim] = clone(profile);
    persist();
  }

  function resetProfile(sim) {
    delete overrides[sim];
    persist();
  }

  function resetAll() {
    overrides = {};
    persist();
  }

  function exportLibrary() {
    return JSON.stringify({
      schema: "optilab-equipment-library/v2",
      exportedAt: new Date().toISOString(),
      profiles: Object.fromEntries(listProfiles().map((sim) => [sim, getProfile(sim)]))
    }, null, 2);
  }

  function importLibrary(payload) {
    const parsed = typeof payload === "string" ? JSON.parse(payload) : payload;
    const profiles = parsed?.profiles && typeof parsed.profiles === "object" ? parsed.profiles : parsed;
    if (!profiles || typeof profiles !== "object" || Array.isArray(profiles)) {
      throw new Error("文件中没有有效的器材参数档案");
    }
    let imported = 0;
    Object.entries(profiles).forEach(([sim, profile]) => {
      if (!validProfile(profile)) return;
      overrides[sim] = clone(profile);
      imported += 1;
    });
    if (!imported) throw new Error("没有找到符合格式的器材档案");
    persist();
    return imported;
  }

  window.OptilabEquipmentStore = {
    getProfile,
    getBaseProfile,
    listProfiles,
    setProfile,
    resetProfile,
    resetAll,
    exportLibrary,
    importLibrary,
    hasOverride: (sim) => Boolean(overrides[sim])
  };
})();
