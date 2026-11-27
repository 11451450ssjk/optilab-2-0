"use strict";

(function () {
  const THEME_KEY = "optilab_theme_v1";
  const CHECKIN_KEY = "optilab_morning_checkins_v1";
  const AUTO_ENTRY_KEY = "optilab_checkin_auto_entry_v1";
  const PROJECT_KEY = "optilab_research_project_v1";
  const params = new URLSearchParams(location.search);
  const nextTarget = params.get("next") || "catalog-section";
  let checkins = [];
  let autoEntryTimer = null;

  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => [...document.querySelectorAll(selector)];
  const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[char]);

  function dateKey(value = new Date()) {
    const date = value instanceof Date ? value : new Date(value);
    return [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, "0"),
      String(date.getDate()).padStart(2, "0")
    ].join("-");
  }

  function addDays(date, amount) {
    const next = new Date(date);
    next.setDate(next.getDate() + amount);
    return next;
  }

  function loadCheckins() {
    try {
      const parsed = JSON.parse(localStorage.getItem(CHECKIN_KEY) || "[]");
      checkins = Array.isArray(parsed) ? parsed.filter((item) => item?.date) : [];
    } catch {
      checkins = [];
    }
  }

  function saveCheckins() {
    localStorage.setItem(CHECKIN_KEY, JSON.stringify(checkins.slice(-365)));
  }

  function todayRecord() {
    return checkins.find((item) => item.date === dateKey());
  }

  function projectData() {
    try {
      return JSON.parse(localStorage.getItem(PROJECT_KEY) || "null");
    } catch {
      return null;
    }
  }

  function topTask() {
    const project = projectData();
    const priority = { high: 0, medium: 1, low: 2 };
    return (project?.tasks || [])
      .filter((task) => task.status !== "done")
      .sort((a, b) => (priority[a.priority] ?? 9) - (priority[b.priority] ?? 9))[0] || null;
  }

  function streakCount() {
    const checked = new Set(checkins.map((item) => item.date));
    let cursor = new Date();
    if (!checked.has(dateKey(cursor))) cursor = addDays(cursor, -1);
    let streak = 0;
    while (checked.has(dateKey(cursor))) {
      streak += 1;
      cursor = addDays(cursor, -1);
    }
    return streak;
  }

  function greeting() {
    const hour = new Date().getHours();
    if (hour < 5) return "夜深了，先给明天留一个清楚的问题。";
    if (hour < 9) return "早上好，今天先推进一小步。";
    if (hour < 12) return "上午好，把最重要的一步留到现在。";
    if (hour < 14) return "中午好，先确认上午记录是否完整。";
    if (hour < 18) return "下午好，检查数据和判断是否对得上。";
    return "晚上好，把今天的发现整理成明天能接上的记录。";
  }

  function workspaceUrl() {
    return `advanced.html?entered=1&next=${encodeURIComponent(nextTarget)}`;
  }

  function autoEntryEnabled() {
    try {
      return localStorage.getItem(AUTO_ENTRY_KEY) === "1" || checkins.length > 0;
    } catch {
      return false;
    }
  }

  function prefetchWorkspace() {
    const href = workspaceUrl();
    if (document.querySelector(`link[data-workspace-prefetch="${href}"]`)) return;
    const link = document.createElement("link");
    link.rel = "prefetch";
    link.as = "document";
    link.href = href;
    link.dataset.workspacePrefetch = href;
    document.head.appendChild(link);
  }

  function showAutoEntry(title, message) {
    document.documentElement.dataset.autoEntry = "1";
    const titleElement = $("#auto-entry-title");
    const messageElement = $("#auto-entry-message");
    if (titleElement) titleElement.textContent = title;
    if (messageElement) messageElement.textContent = message;
    prefetchWorkspace();
    window.clearTimeout(autoEntryTimer);
    autoEntryTimer = window.setTimeout(() => {
      document.body.classList.add("checkin-leaving");
      window.location.replace(workspaceUrl());
    }, 1000);
  }

  function applyTheme(theme) {
    const next = theme === "day" ? "day" : "dark";
    if (next === "day") document.documentElement.dataset.theme = "day";
    else delete document.documentElement.dataset.theme;
    localStorage.setItem(THEME_KEY, next);
    $("#theme-color").setAttribute("content", next === "day" ? "#f4efe5" : "#090d10");
    $$("[data-theme-label]").forEach((label) => {
      label.textContent = next === "day" ? "夜间" : "日间";
    });
    $$("[data-theme-toggle] .theme-toggle-icon").forEach((icon) => {
      icon.textContent = next === "day" ? "☾" : "☀";
    });
  }

  function render() {
    const now = new Date();
    const current = todayRecord();
    const project = projectData();
    const tasks = project?.tasks || [];
    const openTasks = tasks.filter((task) => task.status !== "done");
    const streak = streakCount();
    $("#morning-date").textContent = now.toLocaleDateString("zh-CN", {
      year: "numeric", month: "long", day: "numeric", weekday: "long"
    });
    $("#morning-title").textContent = greeting();
    $("#morning-streak-count").textContent = String(streak);
    $("#morning-streak-ring").style.setProperty("--streak", String(Math.min(100, streak * 100 / 7)));
    if (current) {
      $("#morning-focus").value = current.focus || "";
      $("#morning-minutes").value = String(current.minutes || 60);
      $("#morning-mood").value = current.mood || "平稳";
      $("#morning-note").value = current.note || "";
      $("#morning-button-label").textContent = "更新打卡并进入工作台";
      $("#morning-saved").textContent = `今天 ${current.time || ""} 已打卡 · ${current.focus || "已记录研究重点"}`;
    } else {
      const suggestion = topTask();
      $("#morning-focus").placeholder = suggestion
        ? `建议先做：${suggestion.title}`
        : "例如：完成光的干涉与衍射第一批重复测量";
      $("#morning-button-label").textContent = "打卡并进入工作台";
      $("#morning-saved").textContent = openTasks.length
        ? `自动分工中还有 ${openTasks.length} 项未完成`
        : "今天还没有打卡";
    }
    const focus = current?.focus || $("#morning-focus").value || topTask()?.title || "还没有设定重点";
    $("#morning-today-focus").textContent = focus;
    $("#morning-today-meta").textContent = current
      ? `${current.minutes || 60} 分钟 · ${current.mood || "平稳"} · 已连接到科研项目`
      : "完成后会把记录连接到科研项目审阅。";
    const monday = addDays(now, -((now.getDay() + 6) % 7));
    const checked = new Set(checkins.map((item) => item.date));
    $("#morning-week").innerHTML = Array.from({ length: 7 }, (_, index) => {
      const day = addDays(monday, index);
      const key = dateKey(day);
      return `<div class="morning-day ${checked.has(key) ? "done" : ""} ${key === dateKey() ? "today" : ""}">
        <span>${["一", "二", "三", "四", "五", "六", "日"][index]}</span>
        <i>${checked.has(key) ? "✓" : day.getDate()}</i>
      </div>`;
    }).join("");
    $("#morning-week-note").textContent = streak
      ? `已经连续记录 ${streak} 天。稳定比一次做很多更重要。`
      : "从今天开始，留下一段连续的研究记录。";
    const recent = [...checkins].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 4);
    $("#morning-recent .morning-recent-list").innerHTML = recent.length
      ? recent.map((item) => `<div class="morning-recent-item"><span>${escapeHtml(item.focus || "研究记录")}</span><time>${item.date.slice(5)}</time></div>`).join("")
      : '<div class="morning-recent-item"><span>还没有历史记录</span><time>—</time></div>';
  }

  function saveProjectReminder(record) {
    let project = projectData();
    if (!project) {
      const now = new Date();
      project = {
        version: 1,
        id: `RP-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}-CHECKIN`,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
        title: "",
        question: "",
        hypothesis: "",
        equipment: "",
        metric: "",
        experimentId: "",
        stage: "planning",
        evidence: [],
        members: [],
        comments: []
      };
    }
    project.comments = Array.isArray(project.comments) ? project.comments : [];
    project.comments = project.comments.filter((comment) => comment.id !== `checkin-${record.date}`);
    project.comments.unshift({
      id: `checkin-${record.date}`,
      author: "晨光打卡",
      target: "今日研究重点",
      text: `${record.focus}。预计 ${record.minutes} 分钟；状态：${record.mood}。${record.note ? `提醒：${record.note}` : ""}`,
      createdAt: new Date().toISOString(),
      checkin: true
    });
    project.updatedAt = new Date().toISOString();
    localStorage.setItem(PROJECT_KEY, JSON.stringify(project));
  }

  function submitCheckin(event) {
    event.preventDefault();
    const focus = $("#morning-focus").value.trim();
    if (!focus) {
      $("#checkin-form-message").textContent = "先写下一件今天真正要推进的事。";
      $("#morning-focus").focus();
      return;
    }
    const record = {
      date: dateKey(),
      focus,
      minutes: Number($("#morning-minutes").value) || 60,
      mood: $("#morning-mood").value,
      note: $("#morning-note").value.trim(),
      time: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit", hour12: false })
    };
    const index = checkins.findIndex((item) => item.date === record.date);
    if (index >= 0) checkins[index] = record;
    else checkins.push(record);
    saveCheckins();
    saveProjectReminder(record);
    localStorage.setItem(AUTO_ENTRY_KEY, "1");
    render();
    $("#checkin-form-message").textContent = "已保存，1 秒后自动进入工作台…";
    showAutoEntry("今天的晨光记录已保存", "工作台已准备就绪，无需再次点击打卡。");
  }

  loadCheckins();
  applyTheme(document.documentElement.dataset.theme === "day" ? "day" : "dark");
  $("#skip-checkin").href = workspaceUrl();
  $("#morning-checkin-form").addEventListener("submit", submitCheckin);
  $("#morning-focus").addEventListener("input", () => {
    $("#checkin-form-message").textContent = "";
    const value = $("#morning-focus").value.trim();
    if (value) $("#morning-today-focus").textContent = value;
  });
  $$("[data-theme-toggle]").forEach((button) => {
    button.addEventListener("click", () => {
      applyTheme(document.documentElement.dataset.theme === "day" ? "dark" : "day");
    });
  });
  render();
  if (autoEntryEnabled()) {
    const current = todayRecord();
    showAutoEntry(
      current ? "今天的晨光记录已存在" : "已完成过晨光打卡",
      "正在恢复到上次的实验工作台，无需再次填写。"
    );
  }
})();
