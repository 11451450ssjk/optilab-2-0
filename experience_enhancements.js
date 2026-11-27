"use strict";

(function () {
  const bridge = window.OptilabBridge;
  const research = window.OptilabResearch;
  const THEME_KEY = "optilab_theme_v1";
  const CHECKIN_KEY = "optilab_morning_checkins_v1";

  const state = {
    checkins: []
  };

  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => [...document.querySelectorAll(selector)];
  const escapeHtml = (value) => bridge.escapeHtml(String(value ?? ""));

  function localDateKey(value = new Date()) {
    const date = value instanceof Date ? value : new Date(value);
    return [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, "0"),
      String(date.getDate()).padStart(2, "0")
    ].join("-");
  }

  function localDateFromKey(key) {
    const [year, month, day] = key.split("-").map(Number);
    return new Date(year, month - 1, day);
  }

  function addDays(date, amount) {
    const next = new Date(date);
    next.setDate(next.getDate() + amount);
    return next;
  }

  function readCheckins() {
    try {
      const stored = JSON.parse(localStorage.getItem(CHECKIN_KEY) || "[]");
      state.checkins = Array.isArray(stored) ? stored.filter((item) => item && item.date) : [];
    } catch {
      state.checkins = [];
    }
    return state.checkins;
  }

  function saveCheckins() {
    localStorage.setItem(CHECKIN_KEY, JSON.stringify(state.checkins.slice(-365)));
  }

  function todayCheckin() {
    return state.checkins.find((item) => item.date === localDateKey());
  }

  function streakCount() {
    const checked = new Set(state.checkins.map((item) => item.date));
    let cursor = new Date();
    if (!checked.has(localDateKey(cursor))) cursor = addDays(cursor, -1);
    let streak = 0;
    while (checked.has(localDateKey(cursor))) {
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

  function topOpenTask() {
    const tasks = research?.getProject?.().tasks || [];
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return tasks
      .filter((task) => task.status !== "done")
      .sort((a, b) => (priorityOrder[a.priority] ?? 9) - (priorityOrder[b.priority] ?? 9))[0] || null;
  }

  function renderCheckin() {
    const now = new Date();
    const current = todayCheckin();
    const streak = streakCount();
    const tasks = research?.getProject?.().tasks || [];
    const openTasks = tasks.filter((task) => task.status !== "done");
    $("#morning-date").textContent = now.toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "long"
    });
    $("#morning-title").textContent = greeting();
    $("#morning-streak-count").textContent = String(streak);
    $("#morning-streak-ring").style.setProperty("--streak", String(Math.min(100, streak * 100 / 7)));
    if (current) {
      $("#morning-focus").value = current.focus || "";
      $("#morning-minutes").value = String(current.minutes || 60);
      $("#morning-mood").value = current.mood || "平稳";
      $("#morning-note").value = current.note || "";
      $("#morning-button-label").textContent = "更新今日打卡";
      $("#morning-checkin-button").classList.add("checked");
      $("#morning-saved").textContent = `今天 ${current.time || ""} 已打卡 · ${current.focus || "已记录研究重点"}`;
    } else {
      const suggestedTask = topOpenTask();
      $("#morning-focus").value = "";
      $("#morning-focus").placeholder = suggestedTask
        ? `建议先做：${suggestedTask.title}`
        : "例如：完成光的干涉与衍射第一批重复测量";
      $("#morning-button-label").textContent = "完成今日打卡";
      $("#morning-checkin-button").classList.remove("checked");
      $("#morning-saved").textContent = openTasks.length
        ? `自动分工里还有 ${openTasks.length} 项未完成`
        : "今天还没有打卡";
    }
    const todayFocus = current?.focus || $("#morning-focus").value || topOpenTask()?.title || "还没有设定重点";
    $("#morning-today-focus").textContent = todayFocus;
    $("#morning-today-meta").textContent = current
      ? `${current.minutes || 60} 分钟 · ${current.mood || "平稳"} · 已连接到科研项目`
      : "完成后会把记录连接到科研项目审阅。";

    const monday = addDays(now, -((now.getDay() + 6) % 7));
    const checked = new Set(state.checkins.map((item) => item.date));
    $("#morning-week").innerHTML = Array.from({ length: 7 }, (_, index) => {
      const date = addDays(monday, index);
      const key = localDateKey(date);
      return `<div class="morning-day ${checked.has(key) ? "done" : ""} ${key === localDateKey() ? "today" : ""}">
        <span>${["一", "二", "三", "四", "五", "六", "日"][index]}</span>
        <i>${checked.has(key) ? "✓" : date.getDate()}</i>
      </div>`;
    }).join("");
    $("#morning-week-note").textContent = streak
      ? `已经连续记录 ${streak} 天。稳定比一次做很多更重要。`
      : "从今天开始，留下一段连续的研究记录。";
    const recent = [...state.checkins].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 4);
    $("#morning-recent .morning-recent-list").innerHTML = recent.length
      ? recent.map((item) => `<div class="morning-recent-item"><span>${escapeHtml(item.focus || "研究记录")}</span><time>${item.date.slice(5)}</time></div>`).join("")
      : '<div class="morning-recent-item"><span>还没有历史记录</span><time>—</time></div>';
  }

  function submitCheckin(event) {
    event.preventDefault();
    const focus = $("#morning-focus").value.trim();
    if (!focus) {
      bridge.showToast("先写下一件今天真正要推进的事");
      $("#morning-focus").focus();
      return;
    }
    const record = {
      date: localDateKey(),
      focus,
      minutes: Number($("#morning-minutes").value) || 60,
      mood: $("#morning-mood").value,
      note: $("#morning-note").value.trim(),
      time: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit", hour12: false })
    };
    const existingIndex = state.checkins.findIndex((item) => item.date === record.date);
    if (existingIndex >= 0) state.checkins[existingIndex] = record;
    else state.checkins.push(record);
    saveCheckins();
    const project = research?.getProject?.();
    if (project) {
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
      research.saveProject?.();
      research.renderProject?.();
    }
    renderCheckin();
    bridge.showToast("今日研究记录已保存");
  }

  function applyTheme(theme, persist = true) {
    const next = theme === "day" ? "day" : "dark";
    if (next === "day") document.documentElement.dataset.theme = "day";
    else delete document.documentElement.dataset.theme;
    $("#theme-color")?.setAttribute("content", next === "day" ? "#f4efe5" : "#090d10");
    if (persist) localStorage.setItem(THEME_KEY, next);
    $$("[data-theme-label]").forEach((label) => {
      label.textContent = next === "day" ? "夜间" : "日间";
    });
    $$("[data-theme-toggle] .theme-toggle-icon").forEach((icon) => {
      icon.textContent = next === "day" ? "☾" : "☀";
    });
    window.dispatchEvent(new CustomEvent("optilab:theme-changed", { detail: { theme: next } }));
  }

  function toggleTheme() {
    applyTheme(document.documentElement.dataset.theme === "day" ? "dark" : "day");
  }

  const TASK_ROLE_MATCH = {
    "负责人": ["plan", "review", "report"],
    "实验与数据": ["experiment", "data", "analysis"],
    "文献与写作": ["literature", "writing", "report"],
    "审阅教师": ["review", "report"],
    "其他": ["report", "data", "writing"]
  };

  function taskBlueprints() {
    const project = research.getProject();
    const reports = bridge.getReports?.() || [];
    const hasDesign = Boolean(project.design?.generatedAt);
    const hasEvidence = (project.evidence || []).length > 0;
    const hasAnalysis = Boolean(project.analysis) || reports.length > 0;
    const hasPaper = Boolean($("#paper-preview")?.textContent && !$("#paper-preview").textContent.includes("1. 先导入实验数据"));
    const hasReview = (project.comments || []).some((comment) => !comment.checkin);
    return [
      {
        key: "literature",
        title: "文献背景与证据卡片",
        role: "文献与写作",
        priority: hasEvidence ? "low" : "high",
        hours: 4,
        days: 2,
        description: "检索相关论文，整理方法、结果和适用边界，形成证据卡片。",
        initialDone: hasEvidence
      },
      {
        key: "design",
        title: "实验方案与预实验",
        role: "负责人",
        priority: hasDesign ? "medium" : "high",
        hours: 3,
        days: 3,
        description: "确认变量、对照、重复次数、器材条件和停止条件。",
        initialDone: hasDesign,
        dependsOn: ["literature"]
      },
      {
        key: "experiment",
        title: "仪器调试与首批数据",
        role: "实验与数据",
        priority: reports.length ? "medium" : "high",
        hours: 6,
        days: 5,
        description: "完成校准、光路或电路调试，保留原始数据和仪器设置。",
        initialDone: reports.length > 0,
        dependsOn: ["design"]
      },
      {
        key: "data",
        title: "重复测量与数据清理",
        role: "实验与数据",
        priority: reports.length > 1 ? "medium" : "high",
        hours: 5,
        days: 7,
        description: "补齐重复批次，检查单位、异常点、漂移和缺失数据。",
        initialDone: reports.length > 1,
        dependsOn: ["experiment"]
      },
      {
        key: "analysis",
        title: "统计模型与不确定度",
        role: "实验与数据",
        priority: hasAnalysis ? "medium" : "high",
        hours: 4,
        days: 8,
        description: "完成模型比较、残差诊断、不确定度预算和跨批次比较。",
        initialDone: hasAnalysis,
        dependsOn: ["data"]
      },
      {
        key: "report",
        title: "图表、报告与讨论",
        role: "文献与写作",
        priority: "medium",
        hours: 5,
        days: 10,
        description: "整理高质量图表，完成报告的结果、误差与讨论部分。",
        initialDone: false,
        dependsOn: ["analysis"]
      },
      {
        key: "writing",
        title: "论文草稿与引用核验",
        role: "文献与写作",
        priority: "medium",
        hours: 6,
        days: 12,
        description: "生成并改写论文草稿，核对引用、图表编号和适用边界。",
        initialDone: hasPaper,
        dependsOn: ["report", "literature"]
      },
      {
        key: "review",
        title: "版本审阅与研究包归档",
        role: "审阅教师",
        priority: hasReview ? "low" : "medium",
        hours: 3,
        days: 14,
        description: "检查批注、复现脚本、数据许可和最终提交版本。",
        initialDone: hasReview,
        dependsOn: ["writing", "analysis"]
      }
    ];
  }

  function buildMemberPool(project) {
    const members = Array.isArray(project.members) ? project.members : [];
    if (members.length) {
      return members.map((member) => ({
        id: member.id,
        name: member.name,
        role: member.role || "其他"
      }));
    }
    return [
      { id: "role-lead", name: "负责人角色", role: "负责人" },
      { id: "role-experiment", name: "实验与数据角色", role: "实验与数据" },
      { id: "role-writing", name: "文献与写作角色", role: "文献与写作" },
      { id: "role-review", name: "审阅角色", role: "审阅教师" }
    ];
  }

  function assignmentCost(member, task, load) {
    const preferred = TASK_ROLE_MATCH[member.role] || [];
    const rolePenalty = preferred.includes(task.key) ? 0 : member.role === "负责人" ? 1.4 : 3.2;
    return rolePenalty + load * 0.85;
  }

  function assignTasks(rebalance = false) {
    const project = research.getProject();
    const pool = buildMemberPool(project);
    const existing = new Map((project.tasks || []).map((task) => [task.key, task]));
    const loads = new Map(pool.map((member) => [member.id, 0]));
    const rotated = rebalance && pool.length > 1 ? [...pool.slice(1), pool[0]] : pool;
    const ids = {};
    const generated = taskBlueprints().map((blueprint, index) => {
      const member = rotated
        .map((candidate) => ({ candidate, cost: assignmentCost(candidate, blueprint, loads.get(candidate.id) || 0) }))
        .sort((a, b) => a.cost - b.cost)[0].candidate;
      loads.set(member.id, (loads.get(member.id) || 0) + blueprint.hours);
      const previous = existing.get(blueprint.key);
      const id = previous?.id || `task-${Date.now()}-${index}`;
      ids[blueprint.key] = id;
      return {
        id,
        key: blueprint.key,
        title: blueprint.title,
        role: blueprint.role,
        priority: blueprint.priority,
        estimatedHours: blueprint.hours,
        dueDate: localDateKey(addDays(new Date(), blueprint.days)),
        description: blueprint.description,
        assigneeId: member.id,
        assignee: member.name,
        status: previous?.status || (blueprint.initialDone ? "done" : "todo"),
        dependsOnKeys: blueprint.dependsOn || []
      };
    });
    generated.forEach((task) => {
      task.dependsOn = task.dependsOnKeys.map((key) => ids[key]).filter(Boolean);
      delete task.dependsOnKeys;
    });
    project.tasks = generated;
    research.saveProject?.();
    research.renderProject?.();
    renderTasks();
    bridge.showToast(rebalance ? "已按工作量重新平衡分工" : "自动分工已生成");
  }

  function taskBalanceScore(tasks) {
    const open = tasks.filter((task) => task.status !== "done");
    if (!open.length) return 100;
    const workload = new Map();
    open.forEach((task) => {
      workload.set(task.assignee, (workload.get(task.assignee) || 0) + (task.estimatedHours || 1));
    });
    const values = [...workload.values()];
    const max = Math.max(...values);
    const min = Math.min(...values);
    return Math.max(0, Math.round(100 - (max - min) * 8));
  }

  function taskStatusLabel(status) {
    return { todo: "待开始", in_progress: "进行中", done: "已完成" }[status] || "待开始";
  }

  function renderTaskColumn(status, tasks) {
    return `<section class="task-column">
      <div class="task-column-heading"><span>${{ todo: "待开始", in_progress: "进行中", done: "已完成" }[status]}</span><strong>${tasks.length}</strong></div>
      ${tasks.length ? tasks.map((task) => `
        <article class="task-card ${task.priority === "high" ? "high" : ""}">
          <div class="task-card-top">
            <h4>${escapeHtml(task.title)}</h4>
            <span class="task-priority">${{ high: "优先", medium: "常规", low: "收尾" }[task.priority] || "常规"}</span>
          </div>
          <p>${escapeHtml(task.description)}</p>
          <div class="task-card-meta">
            <span>${escapeHtml(task.assignee)}</span>
            <span>${task.estimatedHours || 1} 小时</span>
            <span>截止 ${escapeHtml(task.dueDate)}</span>
          </div>
          <div class="task-card-actions">
            <select data-task-assignee="${escapeHtml(task.id)}" aria-label="改派任务">
              ${buildMemberPool(research.getProject()).map((member) => `<option value="${escapeHtml(member.id)}" ${member.name === task.assignee ? "selected" : ""}>${escapeHtml(member.name)}</option>`).join("")}
            </select>
            <button type="button" data-task-advance="${escapeHtml(task.id)}">${status === "done" ? "重新打开" : "推进一步"}</button>
          </div>
        </article>
      `).join("") : '<div class="research-empty-state"><strong>这里暂时是空的</strong><span>自动分工后会出现任务。</span></div>'}
    </section>`;
  }

  function renderTasks() {
    const project = research?.getProject?.();
    if (!project) return;
    const tasks = Array.isArray(project.tasks) ? project.tasks : [];
    const open = tasks.filter((task) => task.status !== "done");
    $("#task-total-count").textContent = String(tasks.length);
    $("#task-open-count").textContent = String(open.length);
    $("#task-member-count").textContent = String(new Set(tasks.map((task) => task.assignee)).size);
    $("#task-balance-score").textContent = tasks.length ? `${taskBalanceScore(tasks)}%` : "—";
    $("#task-board").innerHTML = tasks.length
      ? ["todo", "in_progress", "done"].map((status) => renderTaskColumn(status, tasks.filter((task) => task.status === status))).join("")
      : `<div class="research-empty-state"><strong>还没有自动分工</strong><span>先在“审阅协作”里添加成员，或者直接生成一组默认角色任务。</span></div>`;
    $("#task-automation-note").textContent = (project.members || []).length
      ? `已按 ${project.members.length} 位成员的角色和工作量生成分工。`
      : "还没有添加真实成员，当前使用角色占位。到“审阅协作”添加姓名后重新生成即可。";
    const statusCounts = {
      plan: tasks.filter((task) => ["literature", "design"].includes(task.key) && task.status === "done").length,
      data: tasks.filter((task) => ["experiment", "data"].includes(task.key) && task.status === "done").length,
      analysis: tasks.filter((task) => task.key === "analysis" && task.status === "done").length,
      writing: tasks.filter((task) => ["report", "writing"].includes(task.key) && task.status === "done").length
    };
    const nodeMap = { plan: ".node-plan", data: ".node-data", analysis: ".node-analysis", writing: ".node-writing" };
    Object.entries(nodeMap).forEach(([key, selector]) => {
      const node = $(selector);
      if (!node) return;
      node.classList.toggle("complete", statusCounts[key] > 0);
      node.classList.toggle("active", statusCounts[key] === 0 && open.length > 0);
    });
    $("#task-board").querySelectorAll("[data-task-advance]").forEach((button) => {
      button.addEventListener("click", () => {
        const task = project.tasks.find((item) => item.id === button.dataset.taskAdvance);
        if (!task) return;
        task.status = task.status === "todo" ? "in_progress" : task.status === "in_progress" ? "done" : "todo";
        research.saveProject?.();
        research.renderProject?.();
        renderTasks();
      });
    });
    $("#task-board").querySelectorAll("[data-task-assignee]").forEach((select) => {
      select.addEventListener("change", () => {
        const task = project.tasks.find((item) => item.id === select.dataset.taskAssignee);
        const member = buildMemberPool(project).find((item) => item.id === select.value);
        if (!task || !member) return;
        task.assigneeId = member.id;
        task.assignee = member.name;
        research.saveProject?.();
        research.renderProject?.();
        renderTasks();
      });
    });
  }

  function exportTaskCsv() {
    const tasks = research.getProject().tasks || [];
    if (!tasks.length) {
      bridge.showToast("还没有可导出的任务");
      return;
    }
    const rows = [
      "任务,负责人,优先级,状态,工时,截止日期,依赖任务",
      ...tasks.map((task) => [
        task.title,
        task.assignee,
        task.priority,
        taskStatusLabel(task.status),
        task.estimatedHours,
        task.dueDate,
        (task.dependsOn || []).map((id) => tasks.find((item) => item.id === id)?.title || id).join("；")
      ].map((value) => JSON.stringify(value ?? "")).join(","))
    ];
    const blob = new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "OptiLab自动分工.csv";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  }

  function onTasksTab() {
    renderTasks();
  }

  function initialize() {
    readCheckins();
    applyTheme(document.documentElement.dataset.theme === "day" ? "day" : "dark", false);
    $$("[data-theme-toggle]").forEach((button) => button.addEventListener("click", toggleTheme));
    $("#morning-checkin-form").addEventListener("submit", submitCheckin);
    $("#morning-focus").addEventListener("input", () => {
      const value = $("#morning-focus").value.trim();
      if (value) $("#morning-today-focus").textContent = value;
    });
    $("#auto-assign-tasks").addEventListener("click", () => assignTasks(false));
    $("#reshuffle-task-assignments").addEventListener("click", () => {
      if (!(research.getProject().tasks || []).length) assignTasks(false);
      else assignTasks(true);
    });
    $("#export-task-csv").addEventListener("click", exportTaskCsv);
    renderCheckin();
    renderTasks();
    window.addEventListener("optilab:reports-changed", renderCheckin);
  }

  window.OptilabExperience = {
    toggleTheme,
    applyTheme,
    renderCheckin,
    renderTasks,
    onTasksTab,
    assignTasks
  };

  initialize();
})();
