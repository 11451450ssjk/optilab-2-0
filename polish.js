"use strict";

(function () {
  const body = document.body;
  const isMorningPage = body.classList.contains("morning-page-body");
  const sections = [
    ["overview", "专业概览", "实验目录、本科与研究生培养路线"],
    ["research-workspace", "科研项目", "问题、文献、统计、分工和审阅"],
    ["catalog-section", "找实验", "按课程、年级和关键词筛选实验"],
    ["lab-section", "实验演示", "2D/3D 光路、器材和实时参数"],
    ["data-section", "导入数据", "Excel、CSV、质量检查和报告"],
    ["literature-section", "文献引用", "检索论文并保存引用"],
    ["report-section", "我的报告", "查看、下载和清理报告版本"],
    ["paper-section", "论文草稿", "让报告与文献生成论文初稿"],
    ["contact-section", "问题与补充", "提交实验补充与使用反馈"]
  ];
  const sectionMap = new Map(sections.map(([id, label, description], index) => [
    id,
    { id, label, description, shortcut: index + 1 }
  ]));
  let activeDialog = null;
  let previousFocus = null;
  let commandIndex = 0;
  let commandItems = [];

  const create = (tag, className = "", html = "") => {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (html) element.innerHTML = html;
    return element;
  };

  function installSkipLink() {
    const main = document.querySelector("main");
    if (!main) return;
    if (!main.id) main.id = "main-content";
    const link = create("a", "polish-skip-link", "跳到主要内容");
    link.href = `#${main.id}`;
    link.addEventListener("click", () => {
      main.setAttribute("tabindex", "-1");
      window.setTimeout(() => main.focus({ preventScroll: true }), 0);
    });
    body.prepend(link);
  }

  function installProgressAndBacktop() {
    const progress = create("div", "polish-scroll-progress", "<i></i>");
    progress.setAttribute("aria-hidden", "true");
    body.prepend(progress);
    const backtop = create("button", "polish-backtop", `
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 19V5M6 11l6-6 6 6"></path></svg>
    `);
    backtop.type = "button";
    backtop.title = "返回页面顶部";
    backtop.setAttribute("aria-label", "返回页面顶部");
    backtop.addEventListener("click", () => {
      const target = document.getElementById("top") || document.querySelector("main");
      target?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    body.append(backtop);

    let scheduled = false;
    const update = () => {
      scheduled = false;
      const maximum = Math.max(1, document.documentElement.scrollHeight - innerHeight);
      const percent = Math.min(100, Math.max(0, scrollY / maximum * 100));
      progress.style.setProperty("--polish-progress", `${percent}%`);
      backtop.classList.toggle("is-visible", scrollY > 620);
    };
    addEventListener("scroll", () => {
      if (scheduled) return;
      scheduled = true;
      requestAnimationFrame(update);
    }, { passive: true });
    update();
  }

  function sectionFromScroll() {
    const marker = scrollY + innerHeight * 0.3;
    let current = null;
    sections.forEach(([id]) => {
      const element = document.getElementById(id);
      if (element && element.offsetTop <= marker) current = id;
    });
    return current;
  }

  function syncNavigation() {
    const current = sectionFromScroll();
    if (!current) return;
    document.querySelectorAll(".nav-item[data-target]").forEach((button) => {
      const active = button.dataset.target === current;
      button.classList.toggle("active", active);
      if (active) button.setAttribute("aria-current", "page");
      else button.removeAttribute("aria-current");
    });
  }

  function installNavigationState() {
    let scheduled = false;
    addEventListener("scroll", () => {
      if (scheduled) return;
      scheduled = true;
      requestAnimationFrame(() => {
        scheduled = false;
        syncNavigation();
      });
    }, { passive: true });
    sections.forEach(([id]) => {
      const element = document.getElementById(id);
      if (element) element.dataset.polishTarget = "true";
    });
    syncNavigation();
  }

  function scrollToSection(id) {
    const target = document.getElementById(id);
    if (!target) return;
    target.scrollIntoView({ behavior: "smooth", block: "start" });
    document.querySelectorAll(".nav-item[data-target]").forEach((button) => {
      const active = button.dataset.target === id;
      button.classList.toggle("active", active);
      if (active) button.setAttribute("aria-current", "page");
      else button.removeAttribute("aria-current");
    });
  }

  function setupResearchTabs() {
    const tablist = document.querySelector(".research-tabbar[role='tablist']");
    if (!tablist) return;
    const tabs = [...tablist.querySelectorAll("[role='tab']")];
    const sync = () => {
      tabs.forEach((tab) => {
        const selected = tab.classList.contains("active");
        tab.setAttribute("aria-selected", String(selected));
        tab.tabIndex = selected ? 0 : -1;
      });
    };
    tabs.forEach((tab, index) => {
      tab.addEventListener("keydown", (event) => {
        let next = -1;
        if (event.key === "ArrowRight" || event.key === "ArrowDown") next = (index + 1) % tabs.length;
        if (event.key === "ArrowLeft" || event.key === "ArrowUp") next = (index - 1 + tabs.length) % tabs.length;
        if (event.key === "Home") next = 0;
        if (event.key === "End") next = tabs.length - 1;
        if (next < 0) return;
        event.preventDefault();
        tabs[next].focus();
        tabs[next].click();
      });
    });
    new MutationObserver(sync).observe(tablist, { subtree: true, attributes: true, attributeFilter: ["class"] });
    sync();
  }

  function createCommandPalette() {
    if (isMorningPage) return;
    const topStatus = document.querySelector(".top-status");
    if (!topStatus) return;
    const isMac = /Mac|iPhone|iPad/.test(navigator.platform);
    const trigger = create("button", "polish-command-trigger", `
      <span>快速跳转</span><kbd>${isMac ? "⌘" : "Ctrl"} K</kbd>
    `);
    trigger.type = "button";
    trigger.setAttribute("aria-haspopup", "dialog");
    trigger.setAttribute("aria-controls", "polish-command");
    topStatus.prepend(trigger);

    const root = create("div", "polish-command");
    root.id = "polish-command";
    root.hidden = true;
    root.innerHTML = `
      <button class="polish-command-backdrop" type="button" aria-label="关闭快速跳转"></button>
      <div class="polish-command-dialog" role="dialog" aria-modal="true" aria-labelledby="polish-command-title">
        <div class="polish-command-head">
          <span id="polish-command-title">OPTILAB · QUICK NAV</span>
          <kbd>Esc 关闭</kbd>
        </div>
        <label class="polish-command-search">
          <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"></circle><path d="m16 16 5 5"></path></svg>
          <input type="search" autocomplete="off" spellcheck="false" aria-label="搜索页面区域或实验">
        </label>
        <div class="polish-command-results" role="listbox" aria-label="可跳转内容"></div>
      </div>`;
    body.append(root);

    const input = root.querySelector("input");
    const results = root.querySelector(".polish-command-results");
    const buttonsByItem = () => [...results.querySelectorAll("button[data-command-index]")];
    const experiments = () => (window.LAB_EXPERIMENTS || []).slice(0, 215);

    const buildItems = (query = "") => {
      const normalized = query.trim().toLowerCase();
      const sectionItems = sections
        .map(([id]) => sectionMap.get(id))
        .filter((item) => !normalized || `${item.label} ${item.description}`.toLowerCase().includes(normalized))
        .map((item) => ({ type: "section", item }));
      const experimentItems = normalized
        ? experiments()
          .filter((experiment) => `${experiment.name} ${experiment.description || ""} ${experiment.semesterTitle || ""}`.toLowerCase().includes(normalized))
          .slice(0, 12)
          .map((experiment) => ({ type: "experiment", item: experiment }))
        : [];
      return [...sectionItems, ...experimentItems];
    };

    const renderItems = () => {
      commandItems = buildItems(input.value);
      commandIndex = Math.min(commandIndex, Math.max(0, commandItems.length - 1));
      if (!commandItems.length) {
        results.innerHTML = '<div class="polish-command-empty">没有找到匹配区域或实验，试试更短的关键词。</div>';
        return;
      }
      let lastType = "";
      results.innerHTML = commandItems.map((entry, index) => {
        const group = entry.type === "section"
          ? (lastType === "section" ? "" : '<div class="polish-command-group">页面区域</div>')
          : (lastType === "experiment" ? "" : '<div class="polish-command-group">实验</div>');
        lastType = entry.type;
        if (entry.type === "section") {
          return `${group}<button type="button" role="option" data-command-index="${index}" class="${index === commandIndex ? "is-selected" : ""}">
            <i>${String(entry.item.shortcut).padStart(2, "0")}</i>
            <strong>${entry.item.label}</strong>
            <small>${entry.item.description}</small>
          </button>`;
        }
        return `${group}<button type="button" role="option" data-command-index="${index}" class="${index === commandIndex ? "is-selected" : ""}">
          <i>EXP</i>
          <strong>${window.OptilabBridge?.escapeHtml?.(entry.item.name) || entry.item.name}</strong>
          <small>${window.OptilabBridge?.escapeHtml?.(entry.item.semesterTitle || "实验课程") || entry.item.semesterTitle || "实验课程"}</small>
        </button>`;
      }).join("");
      buttonsByItem().forEach((button) => {
        button.addEventListener("mouseenter", () => {
          commandIndex = Number(button.dataset.commandIndex);
          updateSelection();
        });
        button.addEventListener("click", () => activateCommand(commandIndex));
      });
    };

    const updateSelection = () => {
      buttonsByItem().forEach((button, index) => {
        const selected = index === commandIndex;
        button.classList.toggle("is-selected", selected);
        button.setAttribute("aria-selected", String(selected));
        if (selected) button.scrollIntoView({ block: "nearest" });
      });
    };

    const activateCommand = (index) => {
      const entry = commandItems[index];
      if (!entry) return;
      closeCommand();
      if (entry.type === "section") {
        scrollToSection(entry.item.id);
        return;
      }
      const id = entry.item.id;
      const card = [...document.querySelectorAll("[data-experiment-id]")].find((element) => element.dataset.experimentId === id);
      if (card) {
        card.click();
        window.setTimeout(() => scrollToSection("lab-section"), 60);
      }
    };

    const openCommand = () => {
      if (!root.hidden) return;
      previousFocus = document.activeElement;
      root.hidden = false;
      input.value = "";
      commandIndex = 0;
      renderItems();
      window.setTimeout(() => input.focus(), 0);
    };

    const closeCommand = () => {
      if (root.hidden) return;
      root.hidden = true;
      previousFocus?.focus?.({ preventScroll: true });
    };
    root._open = openCommand;
    root._close = closeCommand;

    trigger.addEventListener("click", openCommand);
    root.querySelector(".polish-command-backdrop").addEventListener("click", closeCommand);
    input.addEventListener("input", () => {
      commandIndex = 0;
      renderItems();
    });
    input.addEventListener("keydown", (event) => {
      if (event.key === "ArrowDown") {
        event.preventDefault();
        commandIndex = Math.min(commandItems.length - 1, commandIndex + 1);
        updateSelection();
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        commandIndex = Math.max(0, commandIndex - 1);
        updateSelection();
      } else if (event.key === "Enter") {
        event.preventDefault();
        activateCommand(commandIndex);
      }
    });
    document.addEventListener("keydown", (event) => {
      const shortcut = (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k";
      const slash = event.key === "/" && !/input|textarea|select/i.test(document.activeElement?.tagName || "");
      if (shortcut || slash) {
        event.preventDefault();
        openCommand();
      } else if (event.key === "Escape" && !root.hidden) {
        event.preventDefault();
        closeCommand();
      } else if (event.altKey && /^[1-9]$/.test(event.key)) {
        const item = sectionMap.get(sections[Number(event.key) - 1]?.[0]);
        if (item) {
          event.preventDefault();
          scrollToSection(item.id);
        }
      }
    });
  }

  function setupDialogFocus() {
    const dialogs = [...document.querySelectorAll("[role='dialog'][aria-modal='true']")];
    const focusable = (dialog) => [...dialog.querySelectorAll(
      "button:not([disabled]), a[href], input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex='-1'])"
    )].filter((element) => element.offsetParent !== null);
    const closeDialog = (dialog) => {
      if (activeDialog !== dialog) return;
      activeDialog = null;
      previousFocus?.focus?.({ preventScroll: true });
    };
    const openDialog = (dialog) => {
      if (activeDialog === dialog) return;
      activeDialog = dialog;
      previousFocus = document.activeElement;
      window.setTimeout(() => focusable(dialog)[0]?.focus(), 0);
    };
    dialogs.forEach((dialog) => {
      const host = dialog.closest("section[hidden], section[id]") || dialog;
      new MutationObserver(() => {
        if (host.hidden || dialog.hidden) closeDialog(dialog);
        else openDialog(dialog);
      }).observe(host, { attributes: true, attributeFilter: ["hidden"] });
      if (!host.hidden && !dialog.hidden) openDialog(dialog);
    });
    document.addEventListener("keydown", (event) => {
      if (!activeDialog || event.key !== "Tab") return;
      const items = focusable(activeDialog);
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });
  }

  function enhanceDataImport() {
    const drop = document.getElementById("data-drop");
    if (!drop) return;
    const setBusy = (busy) => {
      drop.classList.toggle("is-loading", busy);
      drop.setAttribute("aria-busy", String(busy));
    };
    const settle = () => window.setTimeout(() => setBusy(false), 450);
    drop.addEventListener("change", () => {
      setBusy(true);
      window.addEventListener("optilab:reports-changed", settle, { once: true });
      window.setTimeout(() => setBusy(false), 3500);
    }, true);
    drop.addEventListener("drop", () => {
      setBusy(true);
      window.addEventListener("optilab:reports-changed", settle, { once: true });
      window.setTimeout(() => setBusy(false), 3500);
    }, true);
  }

  function installLiveAnnouncer() {
    const live = create("div", "polish-live", "");
    live.id = "polish-live";
    live.setAttribute("role", "status");
    live.setAttribute("aria-live", "polite");
    live.setAttribute("aria-atomic", "true");
    live.style.cssText = "position:fixed;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap";
    body.append(live);
    document.querySelectorAll(".nav-item[data-target]").forEach((button) => {
      button.addEventListener("click", () => {
        live.textContent = `已跳转到${button.textContent.replace(/^\d+/, "").trim()}`;
      });
    });
  }

  installSkipLink();
  installProgressAndBacktop();
  if (!isMorningPage) {
    installNavigationState();
    createCommandPalette();
    setupResearchTabs();
    setupDialogFocus();
    enhanceDataImport();
  }
  installLiveAnnouncer();
})();
