"use strict";

(function () {
  const $ = (selector) => document.querySelector(selector);
  const search = $("#catalog-search");
  const filters = [...document.querySelectorAll(".year-filter button")];
  const semesterList = $("#semester-list");
  if (!search || !filters.length) return;

  const clear = document.createElement("button");
  clear.type = "button";
  clear.className = "catalog-search-clear";
  clear.textContent = "×";
  clear.title = "清除搜索";
  clear.setAttribute("aria-label", "清除实验搜索");
  search.closest(".catalog-search")?.append(clear);

  const syncClear = () => clear.classList.toggle("is-visible", Boolean(search.value));
  search.addEventListener("input", syncClear);
  search.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && search.value) {
      search.value = "";
      search.dispatchEvent(new Event("input", { bubbles: true }));
      search.focus();
    }
  });
  clear.addEventListener("click", () => {
    search.value = "";
    search.dispatchEvent(new Event("input", { bubbles: true }));
    search.focus();
  });

  const syncFilters = () => filters.forEach((button) => {
    button.setAttribute("aria-pressed", String(button.classList.contains("active")));
  });
  filters.forEach((button) => button.addEventListener("click", () => window.setTimeout(syncFilters, 0)));
  new MutationObserver(syncFilters).observe($(".year-filter"), {
    subtree: true,
    attributes: true,
    attributeFilter: ["class"]
  });
  syncFilters();
  syncClear();

  semesterList?.addEventListener("click", (event) => {
    const header = event.target.closest(".semester-header");
    if (!header || event.target.closest("button")) return;
    const group = header.closest(".semester-group");
    group?.querySelector("[data-group-toggle]")?.click();
  });
  semesterList?.addEventListener("keydown", (event) => {
    const header = event.target.closest(".semester-header");
    if (!header || event.target.closest("button")) return;
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    header.click();
  });
})();
