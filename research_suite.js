"use strict";

(function () {
  const bridge = window.OptilabBridge;
  const PROJECT_STORAGE_KEY = "optilab_research_project_v1";
  const CITATION_STORAGE_KEY = "optilab_citation_library_v1";
  const DB_NAME = "optilab_research_knowledge_v1";
  const DB_STORE = "documents";
  const MAX_DOCUMENT_BYTES = 30 * 1024 * 1024;
  const RESEARCH_TEMPLATES = {
    interference: {
      label: "干涉与精密测量",
      sample: "固定同一光路，至少完成 3 个独立扫描批次，每批覆盖多个完整条纹周期。",
      stats: "比较峰间距和周期稳定性，同时给出重复批次均值、相对偏差和不确定度。",
      figures: "原始条纹、峰位标注、拟合曲线、残差图和批次对比图。"
    },
    calibration: {
      label: "器件标定",
      sample: "覆盖低、中、高三个测量区间，每个标准点至少重复 3 次，并记录标准件证书信息。",
      stats: "建立校准曲线，报告斜率、截距、R²、残差、灵敏度、探测限和重复性。",
      figures: "校准曲线、误差棒、残差、重复性箱线图和不确定度贡献图。"
    },
    fiber: {
      label: "光纤与传感器",
      sample: "保持光纤固定和温度稳定，至少完成 3 次升程与回程扫描以检查迟滞。",
      stats: "比较灵敏度、线性度、迟滞、重复性和温度漂移，区分升程与回程模型。",
      figures: "响应曲线、迟滞环、重复性曲线、频谱或时域漂移图。"
    },
    detector: {
      label: "光电探测与噪声",
      sample: "在暗场、固定光功率和不同偏置条件下重复采样，每个条件至少 3 个批次。",
      stats: "报告响应度、暗电流、噪声、信噪比、线性范围和饱和区，区分随机噪声与漂移。",
      figures: "光功率响应、暗噪声、频谱、线性区和饱和区对照图。"
    },
    spectrum: {
      label: "光谱与频率响应",
      sample: "覆盖完整关注频段或光谱范围，在峰值附近增加采样密度，并重复基线测量。",
      stats: "检查峰位、峰宽、分辨率、基线漂移和谐波，比较重复扫描的峰位偏差。",
      figures: "原始频谱、基线校正、峰位标注、局部放大和重复扫描叠图。"
    },
    custom: {
      label: "自定义探索",
      sample: "先完成小样本预实验，再根据漂移和离散程度调整点数、重复次数和采样间隔。",
      stats: "先绘制原始数据，再根据数据形态选择模型；报告样本量、异常点和适用边界。",
      figures: "原始数据、分布、趋势、残差和异常点图。"
    }
  };

  const state = {
    project: null,
    documents: [],
    searchResults: [],
    analysis: null,
    activeReportId: "",
    saveTimer: null
  };

  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => [...document.querySelectorAll(selector)];
  const escapeHtml = (value) => bridge?.escapeHtml(String(value ?? "")) ?? String(value ?? "");

  function safeNumber(value, fallback = 0) {
    const number = Number(value);
    return Number.isFinite(number) ? number : fallback;
  }

  function formatNumber(value, digits = 4) {
    if (!Number.isFinite(value)) return "—";
    if (value === 0) return "0";
    const abs = Math.abs(value);
    if (abs >= 1000 || abs < 0.001) return Number(value).toExponential(3);
    return Number(value).toFixed(digits).replace(/0+$/, "").replace(/\.$/, "");
  }

  function nowIso() {
    return new Date().toISOString();
  }

  function formatTime(value) {
    if (!value) return "尚未保存";
    return new Date(value).toLocaleString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false
    });
  }

  function projectId() {
    const date = new Date();
    const stamp = [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, "0"),
      String(date.getDate()).padStart(2, "0")
    ].join("");
    return `RP-${stamp}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
  }

  function blankProject() {
    return {
      version: 1,
      id: projectId(),
      createdAt: nowIso(),
      updatedAt: nowIso(),
      title: "",
      question: "",
      hypothesis: "",
      equipment: "",
      metric: "",
      experimentId: "",
      stage: "planning",
      resolution: "",
      designTemplate: "auto",
      unitSettings: {
        xUnit: "",
        yUnit: "",
        xFactor: 1,
        yFactor: 1
      },
      design: {
        generatedAt: "",
        text: "",
        items: []
      },
      evidence: [],
      analysis: null,
      members: [],
      comments: []
    };
  }

  function normalizeProject(candidate) {
    const base = blankProject();
    if (!candidate || typeof candidate !== "object") return base;
    const merged = {
      ...base,
      ...candidate,
      design: {
        ...base.design,
        ...(candidate.design && typeof candidate.design === "object" ? candidate.design : {})
      },
      unitSettings: {
        ...base.unitSettings,
        ...(candidate.unitSettings && typeof candidate.unitSettings === "object" ? candidate.unitSettings : {})
      },
      evidence: Array.isArray(candidate.evidence) ? candidate.evidence : [],
      members: Array.isArray(candidate.members) ? candidate.members : [],
      comments: Array.isArray(candidate.comments) ? candidate.comments : []
    };
    if (!merged.id) merged.id = projectId();
    return merged;
  }

  function loadProject() {
    try {
      return normalizeProject(JSON.parse(localStorage.getItem(PROJECT_STORAGE_KEY) || "null"));
    } catch {
      return blankProject();
    }
  }

  function saveProject(options = {}) {
    state.project.updatedAt = nowIso();
    try {
      localStorage.setItem(PROJECT_STORAGE_KEY, JSON.stringify(state.project));
      const label = $("#research-save-state");
      if (label) label.textContent = `已保存 ${formatTime(state.project.updatedAt)}`;
      if (!options.silent) bridge?.showToast("科研项目已保存在本机");
      updateProjectProgress();
      updatePackageChecklist();
      return true;
    } catch {
      bridge?.showToast("浏览器无法保存项目，请先导出项目文件");
      return false;
    }
  }

  function scheduleProjectSave() {
    window.clearTimeout(state.saveTimer);
    state.saveTimer = window.setTimeout(() => {
      readProjectForm();
      saveProject({ silent: true });
    }, 320);
  }

  const projectFieldMap = {
    title: "#research-project-title",
    question: "#research-question",
    hypothesis: "#research-hypothesis",
    equipment: "#research-equipment",
    metric: "#research-metric",
    stage: "#research-project-stage",
    resolution: "#research-resolution",
    designTemplate: "#research-design-template"
  };

  function readProjectForm() {
    Object.entries(projectFieldMap).forEach(([key, selector]) => {
      const element = $(selector);
      if (element) state.project[key] = element.value;
    });
  }

  function fillProjectForm() {
    Object.entries(projectFieldMap).forEach(([key, selector]) => {
      const element = $(selector);
      if (element) element.value = state.project[key] || "";
    });
  }

  function linkedExperiment() {
    const experiments = window.LAB_EXPERIMENTS || [];
    return experiments.find((item) => item.id === state.project.experimentId) || null;
  }

  function renderProject() {
    fillProjectForm();
    $("#research-project-id").textContent = state.project.id;
    $("#research-design-time").textContent = state.project.design.generatedAt
      ? `生成于 ${formatTime(state.project.design.generatedAt)}`
      : "尚未生成";
    $("#research-design-card").classList.toggle("hidden", !state.project.design.items.length);
    renderDesign();
    renderEvidence();
    renderMembers();
    renderComments();
    updateProjectProgress();
    updatePackageChecklist();
  }

  function updateProjectProgress() {
    const reports = bridge?.getReports?.() || [];
    const experiment = linkedExperiment();
    const steps = {
      question: Boolean(state.project.title.trim() && state.project.question.trim() && state.project.hypothesis.trim()),
      design: Boolean(state.project.design.generatedAt),
      knowledge: state.project.evidence.length > 0,
      analysis: Boolean(state.project.analysis || reports.length),
      review: state.project.comments.length > 0 ||
        state.project.stage === "final" ||
        (state.project.tasks?.length > 0 && state.project.tasks.every((task) => task.status === "done"))
    };
    const completeCount = Object.values(steps).filter(Boolean).length;
    const activeKey = Object.keys(steps).find((key) => !steps[key]) || "review";
    $$("#research-pipeline [data-project-step]").forEach((element) => {
      element.classList.toggle("complete", Boolean(steps[element.dataset.projectStep]));
      element.classList.toggle("active", element.dataset.projectStep === activeKey && !steps[activeKey]);
    });
    $("#research-progress-value").textContent = `${Math.round((completeCount / 5) * 100)}%`;
    $("#research-linked-experiment").textContent = experiment ? experiment.name : "未关联";
    $("#research-kb-count").textContent = String(state.documents.length);
    $("#research-report-count").textContent = String(reports.length);
    $("#research-comment-count").textContent = String(state.project.comments.length);
    const stageLabels = {
      planning: "方案设计",
      collecting: "数据采集",
      analyzing: "数据分析",
      writing: "论文写作",
      review: "审核修改",
      final: "最终版本"
    };
    $("#review-status-tag").textContent = stageLabels[state.project.stage] || "方案设计";
    updatePackageChecklist();
  }

  function setupTabs() {
    $$("[data-research-tab]").forEach((button) => {
      button.addEventListener("click", () => {
        const tab = button.dataset.researchTab;
        $$("[data-research-tab]").forEach((item) => {
          const active = item === button;
          item.classList.toggle("active", active);
          item.setAttribute("aria-selected", String(active));
        });
        $$("[data-research-panel]").forEach((panel) => {
          panel.hidden = panel.dataset.researchPanel !== tab;
          panel.classList.toggle("active", panel.dataset.researchPanel === tab);
        });
        if (tab === "knowledge") renderKnowledge();
        if (tab === "analysis") refreshResearchAnalysis();
        if (tab === "tasks") window.OptilabExperience?.onTasksTab?.();
        if (tab === "instrument") window.OptilabAdvanced?.onInstrumentTab?.();
        if (tab === "package") updatePackageChecklist();
        if (tab === "services") window.OptilabAdvanced?.onServicesTab?.();
        if (tab === "review") {
          renderMembers();
          renderComments();
        }
      });
    });
  }

  function setupProjectActions() {
    Object.values(projectFieldMap).forEach((selector) => {
      const element = $(selector);
      if (!element) return;
      element.addEventListener("input", scheduleProjectSave);
      element.addEventListener("change", scheduleProjectSave);
    });

    $("#research-save-project").addEventListener("click", () => {
      readProjectForm();
      saveProject();
    });

    $("#research-link-experiment").addEventListener("click", () => {
      const experiment = bridge?.currentExperiment?.();
      if (!experiment) return;
      state.project.experimentId = experiment.id;
      const profile = window.OPTILAB_EQUIPMENT_PROFILES?.[experiment.sim];
      if (!state.project.title.trim()) {
        state.project.title = `${experiment.name}的实验研究`;
      }
      if (!state.project.equipment.trim() && profile) {
        state.project.equipment = [
          ...profile.instruments.map((item) => item.name),
          ...profile.conditions.map((item) => `${item.label}：${item.value}`)
        ].join("；");
      }
      if (!state.project.metric.trim()) {
        state.project.metric = `${bridge.simInfo(experiment).yLabel}、测量误差和重复性`;
      }
      saveProject();
      renderProject();
    });

    $("#research-new-project").addEventListener("click", () => {
      if (!window.confirm("新建项目会切换到空白项目。当前项目仍可从浏览器存储恢复或先导出备份，是否继续？")) return;
      state.project = blankProject();
      saveProject();
      renderProject();
      $("#research-design-card").classList.add("hidden");
    });

    $("#download-project-json").addEventListener("click", exportProjectJson);
    $("#import-project-json").addEventListener("change", importProjectJson);
    $("#generate-research-design").addEventListener("click", generateResearchDesign);
    $("#copy-research-design").addEventListener("click", copyResearchDesign);
  }

  function buildResearchDesign() {
    readProjectForm();
    const experiment = linkedExperiment() || bridge?.currentExperiment?.();
    if (!experiment) throw new Error("请先关联一个实验");
    const principle = bridge.principleInfo(experiment);
    const simulation = bridge.simInfo(experiment);
    const profile = window.OPTILAB_EQUIPMENT_PROFILES?.[experiment.sim];
    const reports = bridge.getReports?.() || [];
    const report = reports.find((item) => item.experimentId === experiment.id) || reports[0] || null;
    const analysis = report?.analysis || null;
    const variables = [
      experiment.primaryLabel || "主要输入参数",
      experiment.secondaryLabel || "辅助条件",
      experiment.yLabel || simulation.yLabel || "测量响应"
    ].filter(Boolean);
    const instruments = profile?.instruments?.map((item) => `${item.name}（${item.spec}）`) || [];
    const conditions = profile?.conditions?.map((item) => `${item.label}：${item.value}`) || [];
    const evidence = state.project.evidence.slice(0, 5);
    const documents = state.documents.slice(0, 5);
    const explicitTemplate = state.project.designTemplate;
    const inferredTemplate = /干涉|干涉|micro|位移|fringe/i.test(`${experiment.name} ${experiment.id}`)
      ? "interference"
      : /光纤|传感/.test(experiment.name)
        ? "fiber"
        : /光谱|频率|光栅/.test(experiment.name)
          ? "spectrum"
          : /探测|噪声|探测|光电效应/.test(experiment.name)
            ? "detector"
            : "custom";
    const templateKey = explicitTemplate && explicitTemplate !== "auto" ? explicitTemplate : inferredTemplate;
    const researchTemplate = RESEARCH_TEMPLATES[templateKey] || RESEARCH_TEMPLATES.custom;

    let sampling = researchTemplate.sample;
    if (analysis) {
      sampling = analysis.peaks?.length >= 2
        ? `当前数据有 ${analysis.peaks.length} 个局部峰值。建议覆盖至少 3 个完整周期，并记录峰位、峰间距和对应的扫描条件。`
        : `当前报告有 ${analysis.n} 个数据点。建议在关键区间增加重复测量，保持量程和采样间隔一致，并至少保留 3 个独立批次。`;
    }
    const statsPlan = analysis?.peaks?.length >= 2
      ? "先检查周期性，再比较峰间距和周期稳定性；同时报告异常点、重复批次差异及仪器分辨率带来的不确定度。"
      : `先比较线性、二次、对数和指数模型的 AIC/BIC，再报告 R²、残差、标准误差、合成不确定度和重复组差异。${researchTemplate.stats}`;
    const objective = state.project.question.trim()
      ? `围绕“${state.project.question.trim()}”建立可重复的实验流程，并检验假设“${state.project.hypothesis.trim() || "待补充"}”。`
      : `围绕“${experiment.name}”建立一个可以复现、可以比较批次差异的实验研究流程。`;
    const evidenceText = evidence.length
      ? evidence.map((item) => `${item.documentTitle} ${item.location || ""}：${item.claim}`).join("；")
      : documents.length
        ? `已导入 ${documents.length} 份全文资料，建议先从“${documents.map((item) => item.title).join("、")}”中提取方法和限制。`
        : "知识库中还没有全文资料。建议先补充 2 至 3 篇与实验对象、方法和指标直接相关的论文。";

    const items = [
      {
        title: "研究目标与假设",
        wide: true,
        html: `<p>${escapeHtml(objective)}</p>`
      },
      {
        title: "变量与对照",
        html: `<ul>${variables.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}<li>记录仪器编号、量程和采样间隔</li><li>保持环境条件与操作顺序一致</li></ul>`
      },
      {
        title: "器材与条件",
        html: `<ul>${(instruments.length ? instruments : ["按当前实验说明准备仪器"]).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}${conditions.slice(0, 3).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`
      },
      {
        title: "测量与重复方案",
        wide: true,
        html: `<p>${escapeHtml(sampling)}</p>`
      },
      {
        title: "实验步骤",
        html: `<ol>${principle.steps.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ol>`
      },
      {
        title: "统计与判断标准",
        html: `<p>${escapeHtml(`${researchTemplate.label}：${statsPlan}`)}</p><p>主要指标：${escapeHtml(state.project.metric || "根据数据选择误差、信噪比、灵敏度或拟合参数")}。</p>`
      },
      {
        title: "建议图表",
        html: `<p>${escapeHtml(researchTemplate.figures)}</p>`
      },
      {
        title: "风险、误差与停止条件",
        html: `<ul><li>${escapeHtml(simulation.errors)}</li><li>${escapeHtml(profile?.safety || principle.caution || "按课程安全规范操作。")}</li><li>发现异常读数、漂移或仪器报警时停止采集并记录现场条件。</li></ul>`
      },
      {
        title: "知识库线索",
        wide: true,
        html: `<p>${escapeHtml(evidenceText)}</p>`
      }
    ];
    const text = [
      `# ${state.project.title || `${experiment.name}研究设计`}`,
      "",
      "## 研究目标与假设",
      objective,
      "",
      "## 变量与对照",
      ...variables.map((item) => `- ${item}`),
      "",
      "## 器材与条件",
      ...(instruments.length ? instruments : ["按当前实验说明准备仪器"]).map((item) => `- ${item}`),
      ...conditions.map((item) => `- ${item}`),
      "",
      "## 测量与重复方案",
      sampling,
      "",
      "## 实验步骤",
      ...principle.steps.map((item, index) => `${index + 1}. ${item}`),
      "",
      "## 统计与判断标准",
      `${researchTemplate.label}：${statsPlan}`,
      "",
      "## 建议图表",
      researchTemplate.figures,
      "",
      "## 风险与误差",
      simulation.errors,
      profile?.safety || principle.caution || "按课程安全规范操作。",
      "",
      "## 知识库线索",
      evidenceText
    ].join("\n");
    return {
      generatedAt: nowIso(),
      experimentId: experiment.id,
      experimentName: experiment.name,
      reportId: report?.id || "",
      items,
      text
    };
  }

  function generateResearchDesign() {
    readProjectForm();
    if (!state.project.question.trim()) {
      bridge.showToast("先写清楚研究问题，再生成设计建议");
      $("#research-question").focus();
      return;
    }
    try {
      state.project.design = buildResearchDesign();
      if (!state.project.experimentId) state.project.experimentId = state.project.design.experimentId;
      saveProject({ silent: true });
      renderProject();
      $("#research-design-card").classList.remove("hidden");
      $("#research-design-card").scrollIntoView({ behavior: "smooth", block: "start" });
      bridge.showToast("实验设计建议已生成");
    } catch (error) {
      bridge.showToast(error.message);
    }
  }

  function renderDesign() {
    const target = $("#research-design-output");
    if (!target) return;
    target.innerHTML = state.project.design.items.map((item) => `
      <section class="research-design-block ${item.wide ? "wide" : ""}">
        <h4>${escapeHtml(item.title)}</h4>
        ${item.html}
      </section>
    `).join("");
  }

  async function copyResearchDesign() {
    const text = state.project.design.text;
    if (!text) {
      bridge.showToast("还没有可复制的实验设计");
      return;
    }
    try {
      await navigator.clipboard.writeText(text);
      bridge.showToast("实验设计已复制");
    } catch {
      copyFallback(text);
    }
  }

  function copyFallback(text) {
    const area = document.createElement("textarea");
    area.value = text;
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    document.execCommand("copy");
    area.remove();
    bridge.showToast("已复制");
  }

  function exportProjectJson() {
    readProjectForm();
    saveProject({ silent: true });
    const payload = {
      exportedAt: nowIso(),
      project: state.project,
      knowledgeMetadata: state.documents.map(({ text, sections, metadata, ...rest }) => rest)
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json;charset=utf-8" });
    downloadBlob(blob, `${safeFileName(state.project.title || "OptiLab科研项目")}.optilab.json`);
    bridge.showToast("项目文件已导出");
  }

  async function importProjectJson(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      const parsed = JSON.parse(await file.text());
      if (!parsed.project) throw new Error("文件中没有项目数据");
      state.project = normalizeProject(parsed.project);
      saveProject({ silent: true });
      renderProject();
      bridge.showToast("项目文件已导入");
    } catch (error) {
      bridge.showToast(`导入失败：${error.message}`);
    }
  }

  function requestToPromise(request) {
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  function openKnowledgeDb() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, 1);
      request.onupgradeneeded = () => {
        if (!request.result.objectStoreNames.contains(DB_STORE)) {
          request.result.createObjectStore(DB_STORE, { keyPath: "id" });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async function getAllDocuments() {
    const db = await openKnowledgeDb();
    const transaction = db.transaction(DB_STORE, "readonly");
    const result = await requestToPromise(transaction.objectStore(DB_STORE).getAll());
    db.close();
    return Array.isArray(result) ? result : [];
  }

  async function putDocument(documentRecord) {
    const db = await openKnowledgeDb();
    const transaction = db.transaction(DB_STORE, "readwrite");
    await requestToPromise(transaction.objectStore(DB_STORE).put(documentRecord));
    db.close();
  }

  async function deleteDocument(id) {
    const db = await openKnowledgeDb();
    const transaction = db.transaction(DB_STORE, "readwrite");
    await requestToPromise(transaction.objectStore(DB_STORE).delete(id));
    db.close();
  }

  function splitTextSections(text) {
    const normalized = text.replace(/\r/g, "").replace(/[ \t]+\n/g, "\n").trim();
    const paragraphs = normalized.split(/\n{2,}/).map((item) => item.trim()).filter(Boolean);
    const sections = [];
    let current = "";
    paragraphs.forEach((paragraph) => {
      if ((current + paragraph).length > 2200 && current) {
        sections.push(current.trim());
        current = "";
      }
      current += `${paragraph}\n\n`;
    });
    if (current.trim()) sections.push(current.trim());
    return sections.length ? sections : [normalized];
  }

  function extractKeywords(text, limit = 12) {
    const counts = new Map();
    const latin = String(text || "").toLowerCase().match(/[a-z][a-z0-9-]{3,}/g) || [];
    latin.forEach((word) => {
      if (["this", "that", "with", "from", "were", "have", "using", "study", "results"].includes(word)) return;
      counts.set(word, (counts.get(word) || 0) + 1);
    });
    const chinese = String(text || "").match(/[\u4e00-\u9fff]{2,}/g) || [];
    chinese.forEach((sequence) => {
      const limitLength = Math.min(sequence.length, 8);
      for (let index = 0; index <= limitLength - 2; index += 1) {
        const gram = sequence.slice(index, index + 2);
        counts.set(gram, (counts.get(gram) || 0) + 1);
      }
    });
    return [...counts.entries()]
      .filter(([, count]) => count > 1)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([word]) => word);
  }

  async function parsePdfFile(file) {
    const pdfjs = await import(new URL("./vendor/pdfjs/pdf.min.mjs", document.baseURI).href);
    pdfjs.GlobalWorkerOptions.workerSrc = new URL("./vendor/pdfjs/pdf.worker.min.mjs", document.baseURI).href;
    const pdf = await pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
    const sections = [];
    let metadata = {};
    try {
      const info = await pdf.getMetadata();
      metadata = info.info || {};
    } catch {
      metadata = {};
    }
    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
      const page = await pdf.getPage(pageNumber);
      const content = await page.getTextContent();
      const text = content.items.map((item) => item.str || "").join(" ").replace(/\s+/g, " ").trim();
      if (text) sections.push(`[第 ${pageNumber} 页]\n${text}`);
      if (pageNumber % 5 === 0) await new Promise((resolve) => setTimeout(resolve, 0));
    }
    if (!sections.length && $("#research-ocr-enabled")?.checked && window.OptilabAdvanced?.ocrPdfFile) {
      return window.OptilabAdvanced.ocrPdfFile(file);
    }
    return {
      text: sections.join("\n\n"),
      sections,
      pageCount: pdf.numPages,
      metadata
    };
  }

  async function buildKnowledgeDocument(file) {
    if (file.size > MAX_DOCUMENT_BYTES) throw new Error("文件超过 30 MB");
    let parsed;
    if (/\.pdf$/i.test(file.name) || file.type === "application/pdf") {
      parsed = await parsePdfFile(file);
      if (!parsed.text.trim()) throw new Error("PDF 没有可提取文字，可能是扫描版，请先 OCR");
    } else {
      const text = (await file.text()).trim();
      if (!text) throw new Error("文件内容为空");
      parsed = {
        text,
        sections: splitTextSections(text),
        pageCount: splitTextSections(text).length,
        metadata: {}
      };
    }
    const baseName = file.name.replace(/\.[^.]+$/, "");
    const title = parsed.metadata?.Title || baseName;
    return {
      id: crypto.randomUUID ? crypto.randomUUID() : `DOC-${Date.now()}-${Math.random()}`,
      title,
      fileName: file.name,
      type: file.type || file.name.split(".").pop(),
      size: file.size,
      addedAt: nowIso(),
      pageCount: parsed.pageCount,
      charCount: parsed.text.length,
      text: parsed.text.slice(0, 2_000_000),
      sections: parsed.sections.slice(0, 500),
      metadata: parsed.metadata || {},
      keywords: extractKeywords(`${title}\n${parsed.text.slice(0, 30000)}`),
      structure: window.OptilabAdvanced?.extractTextStructure?.(parsed.text) || []
    };
  }

  async function addKnowledgeFiles(files) {
    if (!files?.length) return;
    bridge.showToast(`正在解析 ${files.length} 份资料`);
    let added = 0;
    for (const file of files) {
      try {
        const documentRecord = await buildKnowledgeDocument(file);
        await putDocument(documentRecord);
        state.documents.push(documentRecord);
        added += 1;
      } catch (error) {
        bridge.showToast(`${file.name}：${error.message}`);
      }
    }
    state.documents.sort((a, b) => b.addedAt.localeCompare(a.addedAt));
    renderKnowledge();
    updateProjectProgress();
    if (added) bridge.showToast(`已加入 ${added} 份全文资料`);
  }

  function renderKnowledge() {
    const documents = state.documents;
    $("#kb-document-count").textContent = String(documents.length);
    $("#kb-section-count").textContent = String(documents.reduce((total, item) => total + (item.sections?.length || 0), 0));
    $("#kb-character-count").textContent = compactInteger(documents.reduce((total, item) => total + (item.charCount || 0), 0));
    const list = $("#research-document-list");
    if (!documents.length) {
      list.innerHTML = `<div class="research-empty-state"><strong>知识库还是空的</strong><span>可以上传自己下载的 PDF、TXT 或 Markdown 文件。</span></div>`;
    } else {
      const shown = documents.slice(0, 40);
      list.innerHTML = shown.map((item) => `
        <article class="research-document-item">
          <div class="research-document-top">
            <div>
              <strong>${escapeHtml(item.title)}</strong>
              <small>${escapeHtml(item.fileName)} · ${item.sections?.length || 0} 段 · ${compactInteger(item.charCount)} 字</small>
            </div>
            <button type="button" data-delete-document="${escapeHtml(item.id)}">移除</button>
          </div>
          <p>${escapeHtml((item.text || "").slice(0, 180))}${item.charCount > 180 ? "…" : ""}</p>
          ${item.structure?.length ? `<small>结构：${item.structure.map((section) => escapeHtml(section.title)).join(" · ")}</small>` : ""}
          <div class="research-document-actions">
            <button type="button" data-copy-document="${escapeHtml(item.id)}">复制引用信息</button>
            <button type="button" data-use-document="${escapeHtml(item.id)}">写入证据卡片</button>
          </div>
        </article>
      `).join("") + (documents.length > shown.length
        ? `<div class="research-empty-state"><strong>还有 ${documents.length - shown.length} 份资料</strong><span>为保持页面流畅，只显示最近 40 份；全文检索仍会覆盖全部文档。</span></div>`
        : "");
    }
    list.querySelectorAll("[data-delete-document]").forEach((button) => {
      button.addEventListener("click", async () => {
        if (!window.confirm("从本机知识库移除这份资料？")) return;
        await deleteDocument(button.dataset.deleteDocument);
        state.documents = state.documents.filter((item) => item.id !== button.dataset.deleteDocument);
        renderKnowledge();
        updateProjectProgress();
      });
    });
    list.querySelectorAll("[data-copy-document]").forEach((button) => {
      button.addEventListener("click", () => {
        const item = documents.find((doc) => doc.id === button.dataset.copyDocument);
        if (item) copyFallback(`${item.metadata?.Author || "作者信息未提供"}. ${item.title}. ${item.addedAt.slice(0, 10)}. 本地知识库：${item.fileName}`);
      });
    });
    list.querySelectorAll("[data-use-document]").forEach((button) => {
      button.addEventListener("click", () => {
        $("#evidence-document").value = button.dataset.useDocument;
        $("#evidence-location").focus();
      });
    });
    const select = $("#evidence-document");
    select.innerHTML = documents.length
      ? documents.map((item) => `<option value="${escapeHtml(item.id)}">${escapeHtml(item.title)}</option>`).join("")
      : `<option value="">请先添加全文资料</option>`;
  }

  function compactInteger(value) {
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;
    return String(Math.round(value || 0));
  }

  function searchTokens(query) {
    const tokens = new Set();
    const text = query.toLowerCase();
    (text.match(/[a-z][a-z0-9-]{2,}/g) || []).forEach((word) => tokens.add(word));
    (text.match(/[\u4e00-\u9fff]{2,}/g) || []).forEach((sequence) => {
      if (sequence.length <= 4) tokens.add(sequence);
      for (let index = 0; index < sequence.length - 1; index += 1) tokens.add(sequence.slice(index, index + 2));
    });
    if (text.trim().length >= 2) tokens.add(text.trim());
    return [...tokens].filter(Boolean);
  }

  function findExcerpt(text, tokens) {
    const source = String(text || "");
    const lower = source.toLowerCase();
    const positions = tokens.map((token) => lower.indexOf(token)).filter((index) => index >= 0);
    const center = positions.length ? Math.min(...positions) : 0;
    const start = Math.max(0, center - 120);
    const end = Math.min(source.length, center + 380);
    return `${start ? "…" : ""}${source.slice(start, end).replace(/\s+/g, " ")}${end < source.length ? "…" : ""}`;
  }

  async function performKnowledgeSearch() {
    const query = $("#knowledge-search-query").value.trim();
    if (!query) {
      bridge.showToast("请输入检索关键词");
      return;
    }
    const tokens = searchTokens(query);
    const results = [];
    let scannedSections = 0;
    for (const doc of state.documents) {
      (doc.sections || [doc.text]).forEach((section, index) => {
        const lower = String(section || "").toLowerCase();
        let score = lower.includes(query.toLowerCase()) ? 10 : 0;
        const semantic = $("#knowledge-search-mode")?.value === "hybrid"
          ? window.OptilabAdvanced?.knowledgeSimilarity?.(query, section) || 0
          : 0;
        score += semantic;
        tokens.forEach((token) => {
          const count = lower.split(token).length - 1;
          score += Math.min(5, count);
        });
        if (score > 0) {
          results.push({
            documentId: doc.id,
            documentTitle: doc.title,
            index,
            score,
            excerpt: findExcerpt(section, tokens)
          });
        }
      });
      scannedSections += doc.sections?.length || 1;
      if (scannedSections > 60 && scannedSections % 60 < (doc.sections?.length || 1)) {
        await new Promise((resolve) => setTimeout(resolve, 0));
      }
    }
    state.searchResults = results.sort((a, b) => b.score - a.score).slice(0, 12);
    renderKnowledgeSearch(query);
  }

  function renderKnowledgeSearch(query = "") {
    const target = $("#knowledge-search-results");
    if (!state.searchResults.length) {
      target.innerHTML = `<div class="research-empty-state"><strong>没有找到相关片段</strong><span>换个更短的关键词，或先补充全文资料。</span></div>`;
      return;
    }
    target.innerHTML = state.searchResults.map((item, index) => `
      <article class="knowledge-result-item">
        <div class="knowledge-result-top">
          <strong>${escapeHtml(item.documentTitle)}</strong>
          <span class="knowledge-page">匹配 ${item.score}</span>
        </div>
        <p>${escapeHtml(item.excerpt)}</p>
        <div class="research-document-actions">
          <button type="button" data-search-add="${index}">写入证据卡片</button>
        </div>
      </article>
    `).join("");
    target.querySelectorAll("[data-search-add]").forEach((button) => {
      button.addEventListener("click", () => {
        const item = state.searchResults[Number(button.dataset.searchAdd)];
        $("#evidence-document").value = item.documentId;
        $("#evidence-location").value = `片段 ${item.index + 1}`;
        $("#evidence-finding").value = item.excerpt.replace(/^…/, "").replace(/…$/, "");
        $("#evidence-claim").value = query;
        bridge.showToast("已带入证据卡片，可继续修改");
      });
    });
  }

  function setupKnowledge() {
    $("#research-knowledge-file").addEventListener("change", (event) => {
      const files = [...(event.target.files || [])];
      event.target.value = "";
      addKnowledgeFiles(files);
    });
    $("#knowledge-search-form").addEventListener("submit", (event) => {
      event.preventDefault();
      performKnowledgeSearch();
    });
    $("#evidence-form").addEventListener("submit", (event) => {
      event.preventDefault();
      const documentId = $("#evidence-document").value;
      const documentRecord = state.documents.find((item) => item.id === documentId);
      const claim = $("#evidence-claim").value.trim();
      const finding = $("#evidence-finding").value.trim();
      if (!documentRecord || !claim || !finding) {
        bridge.showToast("请选择来源并填写主张和原文依据");
        return;
      }
      state.project.evidence.unshift({
        id: crypto.randomUUID ? crypto.randomUUID() : `EV-${Date.now()}`,
        documentId,
        documentTitle: documentRecord.title,
        location: $("#evidence-location").value.trim(),
        claim,
        finding,
        relation: $("#evidence-relation").value,
        createdAt: nowIso()
      });
      $("#evidence-form").reset();
      saveProject({ silent: true });
      renderKnowledge();
      renderEvidence();
      updateProjectProgress();
      bridge.showToast("证据卡片已保存");
    });
  }

  function renderEvidence() {
    const list = $("#research-evidence-list");
    $("#evidence-count").textContent = `${state.project.evidence.length} 条`;
    if (!state.project.evidence.length) {
      list.innerHTML = `<div class="research-empty-state"><strong>还没有证据卡片</strong><span>先检索资料，再记录它支持哪一项判断。</span></div>`;
      return;
    }
    const relationLabels = {
      support: "支持",
      method: "方法参考",
      limit: "适用边界",
      contrast: "结果不同"
    };
    list.innerHTML = state.project.evidence.map((item) => `
      <article class="research-evidence-item">
        <div class="research-evidence-top">
          <div>
            <strong>${escapeHtml(item.claim)}</strong>
            <small>${escapeHtml(item.documentTitle)} ${escapeHtml(item.location || "")} · ${relationLabels[item.relation] || "文献线索"}</small>
          </div>
          <button type="button" data-delete-evidence="${escapeHtml(item.id)}">删除</button>
        </div>
        <p>${escapeHtml(item.finding)}</p>
      </article>
    `).join("");
    list.querySelectorAll("[data-delete-evidence]").forEach((button) => {
      button.addEventListener("click", () => {
        state.project.evidence = state.project.evidence.filter((item) => item.id !== button.dataset.deleteEvidence);
        saveProject({ silent: true });
        renderEvidence();
        updateProjectProgress();
      });
    });
  }

  function prepareCanvas(canvas) {
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return null;
    const ratio = Math.max(1, window.devicePixelRatio || 1);
    canvas.width = Math.round(rect.width * ratio);
    canvas.height = Math.round(rect.height * ratio);
    const context = canvas.getContext("2d");
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    context.clearRect(0, 0, rect.width, rect.height);
    return { context, width: rect.width, height: rect.height };
  }

  function solveLinearSystem(matrix, vector) {
    const size = vector.length;
    const augmented = matrix.map((row, index) => [...row, vector[index]]);
    for (let column = 0; column < size; column += 1) {
      let pivot = column;
      for (let row = column + 1; row < size; row += 1) {
        if (Math.abs(augmented[row][column]) > Math.abs(augmented[pivot][column])) pivot = row;
      }
      if (Math.abs(augmented[pivot][column]) < 1e-12) return null;
      [augmented[column], augmented[pivot]] = [augmented[pivot], augmented[column]];
      const divisor = augmented[column][column];
      for (let index = column; index <= size; index += 1) augmented[column][index] /= divisor;
      for (let row = 0; row < size; row += 1) {
        if (row === column) continue;
        const factor = augmented[row][column];
        for (let index = column; index <= size; index += 1) {
          augmented[row][index] -= factor * augmented[column][index];
        }
      }
    }
    return augmented.map((row) => row[size]);
  }

  function fitLinearizedModel(points, basis, inverse = (value) => value) {
    const rows = points.map((point) => basis(point.x));
    const k = rows[0].length;
    if (points.length <= k) return null;
    const matrix = Array.from({ length: k }, () => Array(k).fill(0));
    const vector = Array(k).fill(0);
    rows.forEach((row, index) => {
      for (let a = 0; a < k; a += 1) {
        vector[a] += row[a] * inverse(points[index].y);
        for (let b = 0; b < k; b += 1) matrix[a][b] += row[a] * row[b];
      }
    });
    const coefficients = solveLinearSystem(matrix, vector);
    if (!coefficients) return null;
    const predict = (x) => {
      const row = basis(x);
      return row.reduce((total, value, index) => total + value * coefficients[index], 0);
    };
    return { coefficients, predict };
  }

  function evaluateModel(points, model) {
    const transformed = points.map((point) => ({ ...point, y: model.transformY ? model.transformY(point.y) : point.y }));
    if (transformed.some((point) => !Number.isFinite(point.y))) return null;
    const fit = fitLinearizedModel(transformed, model.basis, (value) => value);
    if (!fit) return null;
    const predict = (x) => model.inverse ? model.inverse(fit.predict(x)) : fit.predict(x);
    const meanY = points.reduce((total, point) => total + point.y, 0) / points.length;
    let sse = 0;
    let sst = 0;
    let finite = true;
    points.forEach((point) => {
      const predicted = predict(point.x);
      if (!Number.isFinite(predicted)) finite = false;
      sse += (point.y - predicted) ** 2;
      sst += (point.y - meanY) ** 2;
    });
    if (!finite) return null;
    const n = points.length;
    const k = model.k;
    const safeSse = Math.max(sse, 1e-15);
    const r2 = sst ? 1 - sse / sst : 1;
    const rmse = Math.sqrt(sse / Math.max(1, n));
    const aic = n * Math.log(safeSse / n) + 2 * k;
    const bic = n * Math.log(safeSse / n) + k * Math.log(n);
    return {
      key: model.key,
      name: model.name,
      k,
      sse,
      r2,
      rmse,
      aic,
      bic,
      coefficients: fit.coefficients,
      predict,
      form: model.form
    };
  }

  function analyzeScientificModels(points) {
    const meanX = points.reduce((total, point) => total + point.x, 0) / points.length;
    const scaleX = Math.sqrt(points.reduce((total, point) => total + (point.x - meanX) ** 2, 0) / Math.max(1, points.length)) || 1;
    const z = (x) => (x - meanX) / scaleX;
    const models = [
      {
        key: "linear",
        name: "线性",
        k: 2,
        form: "y = a + bz",
        basis: (x) => [1, z(x)]
      },
      {
        key: "quadratic",
        name: "二次多项式",
        k: 3,
        form: "y = a + bz + cz²",
        basis: (x) => [1, z(x), z(x) ** 2]
      }
    ];
    if (points.every((point) => point.x > 0)) {
      const meanLog = points.reduce((total, point) => total + Math.log(point.x), 0) / points.length;
      const scaleLog = Math.sqrt(points.reduce((total, point) => total + (Math.log(point.x) - meanLog) ** 2, 0) / Math.max(1, points.length)) || 1;
      const zlog = (x) => (Math.log(x) - meanLog) / scaleLog;
      models.push({
        key: "logarithmic",
        name: "对数",
        k: 2,
        form: "y = a + b ln(z)",
        basis: (x) => [1, zlog(x)]
      });
    }
    if (points.every((point) => point.y > 0)) {
      models.push({
        key: "exponential",
        name: "指数",
        k: 2,
        form: "ln(y) = a + bz",
        basis: (x) => [1, z(x)],
        transformY: Math.log,
        inverse: Math.exp
      });
    }
    if (points.every((point) => point.x > 0 && point.y > 0)) {
      const meanLog = points.reduce((total, point) => total + Math.log(point.x), 0) / points.length;
      const scaleLog = Math.sqrt(points.reduce((total, point) => total + (Math.log(point.x) - meanLog) ** 2, 0) / Math.max(1, points.length)) || 1;
      models.push({
        key: "power",
        name: "幂律",
        k: 2,
        form: "ln(y) = a + b ln(z)",
        basis: (x) => [1, (Math.log(x) - meanLog) / scaleLog],
        transformY: Math.log,
        inverse: Math.exp
      });
    }
    return models
      .map((model) => evaluateModel(points, model))
      .filter(Boolean)
      .sort((a, b) => a.aic - b.aic);
  }

  function logGamma(value) {
    const coefficients = [
      676.5203681218851,
      -1259.1392167224028,
      771.3234287776531,
      -176.6150291621406,
      12.507343278686905,
      -0.13857109526572012,
      9.984369578019572e-6,
      1.5056327351493116e-7
    ];
    if (value < 0.5) return Math.log(Math.PI / Math.sin(Math.PI * value)) - logGamma(1 - value);
    let x = 0.9999999999998099;
    const z = value - 1;
    coefficients.forEach((coefficient, index) => {
      x += coefficient / (z + index + 1);
    });
    const t = z + coefficients.length - 0.5;
    return 0.5 * Math.log(2 * Math.PI) + (z + 0.5) * Math.log(t) - t + Math.log(x);
  }

  function betaContinuedFraction(a, b, x) {
    const maxIterations = 160;
    const epsilon = 3e-12;
    const tiny = 1e-30;
    let qab = a + b;
    let qap = a + 1;
    let qam = a - 1;
    let c = 1;
    let d = 1 - (qab * x) / qap;
    if (Math.abs(d) < tiny) d = tiny;
    d = 1 / d;
    let h = d;
    for (let iteration = 1; iteration <= maxIterations; iteration += 1) {
      const m2 = 2 * iteration;
      let aa = (iteration * (b - iteration) * x) / ((qam + m2) * (a + m2));
      d = 1 + aa * d;
      if (Math.abs(d) < tiny) d = tiny;
      c = 1 + aa / c;
      if (Math.abs(c) < tiny) c = tiny;
      d = 1 / d;
      h *= d * c;
      aa = -((a + iteration) * (qab + iteration) * x) / ((a + m2) * (qap + m2));
      d = 1 + aa * d;
      if (Math.abs(d) < tiny) d = tiny;
      c = 1 + aa / c;
      if (Math.abs(c) < tiny) c = tiny;
      d = 1 / d;
      const delta = d * c;
      h *= delta;
      if (Math.abs(delta - 1) < epsilon) break;
    }
    return h;
  }

  function regularizedBeta(x, a, b) {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    const factor = Math.exp(
      logGamma(a + b) - logGamma(a) - logGamma(b) +
      a * Math.log(x) + b * Math.log(1 - x)
    );
    if (x < (a + 1) / (a + b + 2)) return (factor * betaContinuedFraction(a, b, x)) / a;
    return 1 - (factor * betaContinuedFraction(b, a, 1 - x)) / b;
  }

  function fSurvival(fValue, df1, df2) {
    if (fValue === Infinity) return 0;
    if (!Number.isFinite(fValue) || fValue <= 0) return 1;
    const x = (df1 * fValue) / (df1 * fValue + df2);
    return Math.max(0, Math.min(1, 1 - regularizedBeta(x, df1 / 2, df2 / 2)));
  }

  function repeatedMeasureAnova(points) {
    const groups = [];
    const sorted = [...points].sort((a, b) => a.x - b.x);
    sorted.forEach((point) => {
      const current = groups[groups.length - 1];
      if (current && Math.abs(current.x - point.x) <= Math.max(1e-10, Math.abs(point.x) * 1e-8)) {
        current.values.push(point.y);
      } else {
        groups.push({ x: point.x, values: [point.y] });
      }
    });
    const repeated = groups.filter((group) => group.values.length >= 2);
    const n = repeated.reduce((total, group) => total + group.values.length, 0);
    const groupCount = repeated.length;
    if (groupCount < 2 || n <= groupCount) return null;
    const grandMean = repeated.reduce((total, group) => total + group.values.reduce((sum, value) => sum + value, 0), 0) / n;
    const ssBetween = repeated.reduce((total, group) => {
      const mean = group.values.reduce((sum, value) => sum + value, 0) / group.values.length;
      return total + group.values.length * (mean - grandMean) ** 2;
    }, 0);
    const ssWithin = repeated.reduce((total, group) => {
      const mean = group.values.reduce((sum, value) => sum + value, 0) / group.values.length;
      return total + group.values.reduce((sum, value) => sum + (value - mean) ** 2, 0);
    }, 0);
    const df1 = groupCount - 1;
    const df2 = n - groupCount;
    const f = ssWithin > 0 ? (ssBetween / df1) / (ssWithin / df2) : Infinity;
    return {
      groups: groupCount,
      observations: n,
      f,
      p: fSurvival(f, df1, df2),
      etaSquared: (ssBetween + ssWithin) > 0 ? ssBetween / (ssBetween + ssWithin) : 0
    };
  }

  function analyzeScientificReport(report) {
    const xFactor = safeNumber(state.project.unitSettings?.xFactor, 1) || 1;
    const yFactor = safeNumber(state.project.unitSettings?.yFactor, 1) || 1;
    const points = (report?.dataPoints || [])
      .map((point) => ({ x: Number(point.x) * xFactor, y: Number(point.y) * yFactor }))
      .filter((point) => Number.isFinite(point.x) && Number.isFinite(point.y));
    if (points.length < 3) return null;
    const models = analyzeScientificModels(points);
    if (!models.length) return null;
    const best = models[0];
    const analysis = report.analysis;
    const resolution = safeNumber($("#research-resolution").value, 0);
    const ua = safeNumber(analysis.standardError, 0);
    const ub = resolution > 0 ? resolution / Math.sqrt(12) : 0;
    const combinedU = Math.sqrt(ua ** 2 + ub ** 2);
    const expandedU = 1.96 * combinedU;
    const periodic = (analysis.peaks?.length || 0) >= 2;
    const amplitude = (analysis.max - analysis.min) / 2;
    const noise = Math.max(best.rmse, 1e-12);
    const snr = periodic
      ? 20 * Math.log10(Math.max(amplitude, 1e-12) / noise)
      : analysis.mean !== 0
        ? 20 * Math.log10(Math.abs(analysis.mean) / Math.max(analysis.std, 1e-12))
        : null;
    const linear = models.find((model) => model.key === "linear");
    const rawLinearSlope = analysis.slope;
    const lod = Math.abs(rawLinearSlope) > 1e-12 ? (3 * Math.max(linear?.rmse || 0, 1e-12)) / Math.abs(rawLinearSlope) : null;
    const anova = repeatedMeasureAnova(points);
    const recommendations = [];
    if (points.length < 10) recommendations.push("有效数据点少于 10 个，建议增加测量点，避免模型比较只受少数点影响。");
    if (analysis.outliers?.length) recommendations.push(`有 ${analysis.outliers.length} 个高偏差点，需要回到原始记录核对。`);
    if (!resolution) recommendations.push("填写仪器分辨率后，才能把 B 类不确定度加入合成不确定度。");
    if (periodic) recommendations.push("数据呈周期性。优先比较周期和峰间距，不要只看线性拟合。");
    if (!anova) recommendations.push("没有识别到同一横轴条件的重复测量。若做了重复组，请保留重复行，才能计算 ANOVA。");
    if (!state.project.evidence.length) recommendations.push("知识库中还没有证据卡片，讨论部分生成前应先补文献线索。");
    if (!recommendations.length) recommendations.push("当前统计和数据结构基本完整，下一步核对仪器编号、真实单位和重复批次说明。");
    return {
      reportId: report.id,
      experimentName: report.experimentName,
      xHeader: state.project.unitSettings?.xUnit || report.xHeader,
      yHeader: state.project.unitSettings?.yUnit || report.yHeader,
      points,
      models,
      best,
      ua,
      ub,
      combinedU,
      expandedU,
      snr,
      lod,
      anova,
      recommendations,
      generatedAt: nowIso()
    };
  }

  function refreshReportOptions() {
    const reports = bridge.getReports?.() || [];
    const select = $("#research-report-select");
    if (!select) return;
    const previous = select.value || state.activeReportId;
    select.innerHTML = reports.length
      ? reports.map((report) => `<option value="${escapeHtml(report.id)}">${escapeHtml(report.experimentName)} · ${escapeHtml(report.id)}</option>`).join("")
      : `<option value="">等待实验报告</option>`;
    if (reports.some((report) => report.id === previous)) {
      select.value = previous;
    } else if (reports.length) {
      select.value = reports[0].id;
    }
    state.activeReportId = select.value;
  }

  function refreshResearchAnalysis() {
    refreshReportOptions();
    const report = (bridge.getReports?.() || []).find((item) => item.id === $("#research-report-select").value);
    if (!report) {
      state.analysis = null;
      $("#stat-best-model").textContent = "等待数据";
      $("#stat-best-r2").textContent = "—";
      $("#stat-combined-u").textContent = "—";
      $("#stat-expanded-u").textContent = "—";
      $("#stat-snr").textContent = "—";
      $("#stat-lod").textContent = "—";
      $("#stat-anova").textContent = "—";
      $("#stat-point-count").textContent = "—";
      $("#research-model-table").innerHTML = `<tr><td colspan="5">等待实验报告</td></tr>`;
      $("#research-analysis-recommendation").innerHTML = `<p>先在上方“导入数据”区域导入实验数据，并生成一份报告。</p>`;
      drawResearchCharts();
      window.dispatchEvent(new CustomEvent("optilab:research-analysis-updated", { detail: { analysis: null } }));
      return;
    }
    state.analysis = analyzeScientificReport(report);
    if (!state.analysis) {
      bridge.showToast("当前报告的数据点不足以进行科研统计");
      return;
    }
    const analysis = state.analysis;
    const unit = analysis.yHeader ? ` ${analysis.yHeader}` : "";
    $("#stat-best-model").textContent = analysis.best.name;
    $("#stat-best-r2").textContent = formatNumber(analysis.best.r2, 5);
    $("#stat-combined-u").textContent = `${formatNumber(analysis.combinedU, 5)}${unit}`;
    $("#stat-expanded-u").textContent = `${formatNumber(analysis.expandedU, 5)}${unit}`;
    $("#stat-snr").textContent = Number.isFinite(analysis.snr) ? `${formatNumber(analysis.snr, 2)} dB` : "不适用";
    $("#stat-lod").textContent = Number.isFinite(analysis.lod) ? `${formatNumber(analysis.lod, 5)} ${analysis.xHeader}` : "不适用";
    $("#stat-anova").textContent = analysis.anova
      ? `F=${formatNumber(analysis.anova.f, 3)}, p=${formatNumber(analysis.anova.p, 4)}`
      : "无重复组";
    $("#stat-point-count").textContent = String(analysis.points.length);
    $("#research-model-table").innerHTML = analysis.models.map((model, index) => `
      <tr class="${index === 0 ? "best" : ""}">
        <td>${escapeHtml(model.name)}${index === 0 ? " · 最佳" : ""}<br><small>${escapeHtml(model.form)}</small></td>
        <td>${formatNumber(model.r2, 5)}</td>
        <td>${formatNumber(model.rmse, 5)}</td>
        <td>${formatNumber(model.aic, 3)}</td>
        <td>${formatNumber(model.bic, 3)}</td>
      </tr>
    `).join("");
    $("#research-analysis-recommendation").innerHTML = `<ul>${analysis.recommendations.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
    drawResearchCharts();
    window.dispatchEvent(new CustomEvent("optilab:research-analysis-updated", { detail: { analysis: state.analysis } }));
  }

  function drawResearchCharts() {
    const fitCanvas = $("#research-fit-chart");
    const residualCanvas = $("#research-residual-chart");
    if (fitCanvas) drawFitChart(fitCanvas);
    if (residualCanvas) drawResidualChart(residualCanvas);
  }

  function chartAxes(context, width, height, xMin, xMax, yMin, yMax) {
    const padding = { left: 48, right: 18, top: 18, bottom: 34 };
    const plotWidth = width - padding.left - padding.right;
    const plotHeight = height - padding.top - padding.bottom;
    const spanX = xMax - xMin || 1;
    const spanY = yMax - yMin || 1;
    return {
      padding,
      plotWidth,
      plotHeight,
      mapX: (x) => padding.left + ((x - xMin) / spanX) * plotWidth,
      mapY: (y) => padding.top + (1 - (y - yMin) / spanY) * plotHeight
    };
  }

  function drawGrid(context, width, height, axes, xMin, xMax, yMin, yMax) {
    context.save();
    context.strokeStyle = "rgba(207, 224, 214, 0.09)";
    context.fillStyle = "#7f8c86";
    context.font = "9px 'Microsoft YaHei UI', sans-serif";
    context.lineWidth = 1;
    for (let index = 0; index <= 4; index += 1) {
      const y = axes.padding.top + (axes.plotHeight * index) / 4;
      context.beginPath();
      context.moveTo(axes.padding.left, y);
      context.lineTo(width - axes.padding.right, y);
      context.stroke();
      const value = yMax - ((yMax - yMin) * index) / 4;
      context.fillText(formatNumber(value, 2), 4, y + 3);
    }
    for (let index = 0; index <= 4; index += 1) {
      const x = axes.padding.left + (axes.plotWidth * index) / 4;
      context.beginPath();
      context.moveTo(x, axes.padding.top);
      context.lineTo(x, height - axes.padding.bottom);
      context.stroke();
      const value = xMin + ((xMax - xMin) * index) / 4;
      context.fillText(formatNumber(value, 2), x - 12, height - 10);
    }
    context.restore();
  }

  function drawFitChart(canvas) {
    const prepared = prepareCanvas(canvas);
    if (!prepared) return;
    const { context, width, height } = prepared;
    if (!state.analysis) return;
    const points = state.analysis.points;
    const model = state.analysis.best;
    const rawX = points.map((point) => point.x);
    const rawY = points.map((point) => point.y);
    let xMin = Math.min(...rawX);
    let xMax = Math.max(...rawX);
    const xPad = (xMax - xMin || 1) * 0.06;
    xMin -= xPad;
    xMax += xPad;
    const predictions = Array.from({ length: 100 }, (_, index) => {
      const x = xMin + ((xMax - xMin) * index) / 99;
      const prediction = model.predict(x);
      return { x, prediction, lower: prediction - 1.96 * model.rmse, upper: prediction + 1.96 * model.rmse };
    }).filter((item) => Number.isFinite(item.prediction));
    let yMin = Math.min(...rawY, ...predictions.map((item) => item.lower));
    let yMax = Math.max(...rawY, ...predictions.map((item) => item.upper));
    const yPad = (yMax - yMin || 1) * 0.08;
    yMin -= yPad;
    yMax += yPad;
    const axes = chartAxes(context, width, height, xMin, xMax, yMin, yMax);
    drawGrid(context, width, height, axes, xMin, xMax, yMin, yMax);
    context.save();
    context.fillStyle = "rgba(204, 165, 97, 0.12)";
    context.beginPath();
    predictions.forEach((item, index) => {
      const x = axes.mapX(item.x);
      const y = axes.mapY(item.upper);
      if (index === 0) context.moveTo(x, y);
      else context.lineTo(x, y);
    });
    [...predictions].reverse().forEach((item) => context.lineTo(axes.mapX(item.x), axes.mapY(item.lower)));
    context.closePath();
    context.fill();
    context.strokeStyle = "#ddb779";
    context.lineWidth = 2;
    context.beginPath();
    predictions.forEach((item, index) => {
      const x = axes.mapX(item.x);
      const y = axes.mapY(item.prediction);
      if (index === 0) context.moveTo(x, y);
      else context.lineTo(x, y);
    });
    context.stroke();
    points.forEach((point) => {
      context.fillStyle = "#a6c7b1";
      context.beginPath();
      context.arc(axes.mapX(point.x), axes.mapY(point.y), 3.2, 0, Math.PI * 2);
      context.fill();
    });
    context.fillStyle = "#b8ae9e";
    context.font = "9px 'Microsoft YaHei UI', sans-serif";
    context.fillText(state.analysis.xHeader, width - 110, height - 9);
    context.fillText(state.analysis.yHeader, 6, 11);
    context.restore();
  }

  function drawResidualChart(canvas) {
    const prepared = prepareCanvas(canvas);
    if (!prepared) return;
    const { context, width, height } = prepared;
    if (!state.analysis) return;
    const points = state.analysis.points.map((point) => ({
      x: point.x,
      residual: point.y - state.analysis.best.predict(point.x)
    }));
    const xMin = Math.min(...points.map((point) => point.x));
    const xMax = Math.max(...points.map((point) => point.x));
    const span = Math.max(...points.map((point) => Math.abs(point.residual)), state.analysis.best.rmse * 2.5, 1e-12);
    const axes = chartAxes(context, width, height, xMin, xMax, -span, span);
    drawGrid(context, width, height, axes, xMin, xMax, -span, span);
    context.save();
    context.strokeStyle = "#c3ad82";
    context.lineWidth = 1;
    context.beginPath();
    context.moveTo(axes.padding.left, axes.mapY(0));
    context.lineTo(width - axes.padding.right, axes.mapY(0));
    context.stroke();
    points.forEach((point) => {
      context.fillStyle = Math.abs(point.residual) > state.analysis.best.rmse * 2 ? "#d28d78" : "#90b59a";
      context.beginPath();
      context.arc(axes.mapX(point.x), axes.mapY(point.residual), 3, 0, Math.PI * 2);
      context.fill();
    });
    context.restore();
  }

  function setupAnalysis() {
    $("#research-report-select").addEventListener("change", (event) => {
      state.activeReportId = event.target.value;
      refreshResearchAnalysis();
    });
    $("#research-resolution").addEventListener("change", refreshResearchAnalysis);
    $("#refresh-research-analysis").addEventListener("click", refreshResearchAnalysis);
    $("#save-research-analysis").addEventListener("click", () => {
      if (!state.analysis) {
        bridge.showToast("还没有可保存的分析");
        return;
      }
      state.project.analysis = {
        ...state.analysis,
        points: state.analysis.points.slice(0, 5000),
        models: state.analysis.models.map(({ predict, ...model }) => model)
      };
      state.project.resolution = $("#research-resolution").value;
      saveProject();
      updateProjectProgress();
    });
    window.addEventListener("optilab:reports-changed", () => {
      refreshReportOptions();
      if (!$("[data-research-panel='analysis']").hidden) refreshResearchAnalysis();
      updateProjectProgress();
    });
    window.addEventListener("resize", debounce(() => {
      if (!$("[data-research-panel='analysis']").hidden) drawResearchCharts();
    }, 160));
  }

  function debounce(fn, wait) {
    let timer = null;
    return (...args) => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => fn(...args), wait);
    };
  }

  function updatePackageChecklist() {
    const target = $("#research-package-checklist");
    if (!target) return;
    const reports = bridge.getReports?.() || [];
    const checks = [
      ["问题和假设", Boolean(state.project.question.trim() && state.project.hypothesis.trim())],
      ["实验设计", Boolean(state.project.design.generatedAt)],
      ["全文资料", state.documents.length > 0],
      ["文献证据", state.project.evidence.length > 0],
      ["实验报告", reports.length > 0],
      ["审阅记录", state.project.comments.length > 0]
    ];
    target.innerHTML = checks.map(([label, ready]) => `<div class="${ready ? "ready" : ""}"><i></i><span>${label}</span></div>`).join("");
  }

  function csvFromPoints(points, xHeader, yHeader) {
    const escapeCsv = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;
    return [
      `${escapeCsv(xHeader)},${escapeCsv(yHeader)}`,
      ...points.map((point) => `${escapeCsv(point.rawX ?? point.x)},${escapeCsv(point.rawY ?? point.y)}`)
    ].join("\n");
  }

  function safeFileName(value) {
    return String(value || "OptiLab研究包").replace(/[\\/:*?"<>|]/g, "_").slice(0, 90);
  }

  function downloadBlob(blob, fileName) {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = fileName;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function buildPythonScript(report, analysis) {
    const xHeader = JSON.stringify(report?.xHeader || "x");
    const yHeader = JSON.stringify(report?.yHeader || "y");
    return `from pathlib import Path
import csv
import json
import math

ROOT = Path(__file__).resolve().parents[1]
CSV_PATH = ROOT / "data" / "cleaned.csv"
X_HEADER = ${xHeader}
Y_HEADER = ${yHeader}

with CSV_PATH.open("r", encoding="utf-8-sig", newline="") as handle:
    rows = list(csv.DictReader(handle))

pairs = []
for row in rows:
    try:
        pairs.append((float(row[X_HEADER]), float(row[Y_HEADER])))
    except (KeyError, TypeError, ValueError):
        continue

if len(pairs) < 2:
    raise SystemExit("有效数据不足")

n = len(pairs)
mean_x = sum(x for x, _ in pairs) / n
mean_y = sum(y for _, y in pairs) / n
sxx = sum((x - mean_x) ** 2 for x, _ in pairs)
sxy = sum((x - mean_x) * (y - mean_y) for x, y in pairs)
slope = sxy / sxx if sxx else 0.0
intercept = mean_y - slope * mean_x
predictions = [slope * x + intercept for x, _ in pairs]
sse = sum((y - fit) ** 2 for (_, y), fit in zip(pairs, predictions))
sst = sum((y - mean_y) ** 2 for _, y in pairs)
r2 = 1 - sse / sst if sst else 1.0

result = {
    "n": n,
    "mean_x": mean_x,
    "mean_y": mean_y,
    "linear_slope": slope,
    "linear_intercept": intercept,
    "r_squared": r2,
    "best_model_in_optilab": ${JSON.stringify(analysis?.best?.name || "未保存")},
    "source_report": ${JSON.stringify(report?.id || "")}
}
(ROOT / "analysis" / "python_recalculation.json").write_text(
    json.dumps(result, ensure_ascii=False, indent=2),
    encoding="utf-8"
)
print(json.dumps(result, ensure_ascii=False, indent=2))
`;
  }

  function buildPackageReadme() {
    return `# ${state.project.title || "OptiLab 科研项目"}

本压缩包由 OptiLab 的本机科研工作台生成。

## 先看什么

1. project.json：研究问题、假设、阶段、成员和审阅状态；
2. manuscript/report.md：当前实验报告；
3. manuscript/paper.md：当前论文草稿；
4. analysis/analysis.json：模型比较和统计快照；
5. knowledge/：本机导入的全文资料；
6. review/review.json：审阅批注；
7. scripts/reproduce.py：基础线性拟合复算脚本。

## 复算

在项目根目录执行：

\`\`\`bash
python scripts/reproduce.py
\`\`\`

脚本使用 Python 标准库。结果写入 analysis/python_recalculation.json。

## 数据与版权

原始数据、仪器参数、知识库全文和审阅记录均来自本项目。分享前请检查是否包含未公开实验数据、个人信息或受版权限制的论文全文。
`;
  }

  async function downloadResearchPackage() {
    if (!window.JSZip) {
      bridge.showToast("ZIP 组件未加载，请刷新页面");
      return;
    }
    const packageButton = $("#download-research-package");
    const originalLabel = packageButton.textContent;
    packageButton.disabled = true;
    packageButton.textContent = "正在整理研究包…";
    await new Promise((resolve) => setTimeout(resolve, 0));
    try {
      readProjectForm();
      saveProject({ silent: true });
    const reports = bridge.getReports?.() || [];
    const report = reports.find((item) => item.id === $("#research-report-select").value) || reports[0] || null;
    if (!$("[data-research-panel='analysis']").hidden || !state.analysis) refreshResearchAnalysis();
    const analysis = state.analysis;
    let citations = [];
    try {
      citations = JSON.parse(localStorage.getItem(CITATION_STORAGE_KEY) || "[]");
    } catch {
      citations = [];
    }
    const paper = $("#paper-preview")?.textContent || "";
    const zip = new JSZip();
    const projectPayload = {
      ...state.project,
      knowledgeMetadata: state.documents.map(({ text, sections, metadata, ...rest }) => rest),
      packageCreatedAt: nowIso(),
      packageReportId: report?.id || ""
    };
    zip.file("project.json", JSON.stringify(projectPayload, null, 2));
    zip.file("README.md", buildPackageReadme());
    if (report) {
      zip.file("manuscript/report.md", report.report || "");
      zip.file("data/raw.csv", csvFromPoints(report.dataPoints || [], report.xHeader, report.yHeader));
      zip.file("data/cleaned.csv", csvFromPoints(report.dataPoints || [], report.xHeader, report.yHeader));
    }
    if (paper.trim() && !paper.includes("论文草稿\n\n1. 先导入实验数据")) {
      zip.file("manuscript/paper.md", paper);
    }
    if (state.project.design.text) zip.file("manuscript/design.md", state.project.design.text);
    zip.file("analysis/analysis.json", JSON.stringify({
      savedSnapshot: state.project.analysis,
      currentView: analysis ? {
        ...analysis,
        models: analysis.models.map(({ predict, ...model }) => model)
      } : null
    }, null, 2));
    zip.file("analysis/citations.json", JSON.stringify(citations, null, 2));
    if (Array.isArray(state.project.uncertaintyBudget)) {
      const budgetRows = [
        "来源,类型,标准不确定度",
        ...state.project.uncertaintyBudget.map((row) =>
          `${JSON.stringify(row.name || "")},${JSON.stringify(row.type || "")},${safeNumber(row.value, 0)}`
        )
      ];
      zip.file("analysis/uncertainty_budget.csv", budgetRows.join("\n"));
    }
    zip.file("review/review.json", JSON.stringify({
      members: state.project.members,
      comments: state.project.comments,
      tasks: state.project.tasks || [],
      stage: state.project.stage
    }, null, 2));
    state.documents.forEach((documentRecord, index) => {
      const name = `${String(index + 1).padStart(2, "0")}-${safeFileName(documentRecord.title)}.txt`;
      zip.file(`knowledge/${name}`, `${documentRecord.title}\n来源文件：${documentRecord.fileName}\n\n${documentRecord.text}`);
    });
    zip.file("scripts/reproduce.py", buildPythonScript(report, analysis));
      const blob = await zip.generateAsync({ type: "blob", compression: "DEFLATE", compressionOptions: { level: 6 } });
      downloadBlob(blob, `${safeFileName(state.project.title || "OptiLab科研项目")}-可复现研究包.zip`);
      bridge.showToast("可复现研究包已生成");
    } finally {
      packageButton.disabled = false;
      packageButton.textContent = originalLabel;
    }
  }

  function setupPackage() {
    $("#download-research-package").addEventListener("click", downloadResearchPackage);
  }

  function renderMembers() {
    const list = $("#research-member-list");
    if (!state.project.members.length) {
      list.innerHTML = `<div class="research-empty-state"><strong>还没有添加成员</strong><span>成员信息只用于本机项目记录。</span></div>`;
    } else {
      list.innerHTML = state.project.members.map((member) => `
        <div class="research-member-item">
          <div><strong>${escapeHtml(member.name)}</strong><br><small>加入于 ${formatTime(member.addedAt)}</small></div>
          <div><span class="member-role">${escapeHtml(member.role)}</span> <button type="button" data-delete-member="${escapeHtml(member.id)}">移除</button></div>
        </div>
      `).join("");
      list.querySelectorAll("[data-delete-member]").forEach((button) => {
        button.addEventListener("click", () => {
          state.project.members = state.project.members.filter((member) => member.id !== button.dataset.deleteMember);
          saveProject({ silent: true });
          renderMembers();
        });
      });
    }
    const author = $("#review-author");
    author.innerHTML = state.project.members.length
      ? state.project.members.map((member) => `<option value="${escapeHtml(member.name)}">${escapeHtml(member.name)} · ${escapeHtml(member.role)}</option>`).join("")
      : `<option value="">请先添加成员</option>`;
  }

  function renderComments() {
    const list = $("#research-review-list");
    if (!state.project.comments.length) {
      list.innerHTML = `<div class="research-empty-state"><strong>还没有审阅意见</strong><span>批注会跟随项目文件一起导出。</span></div>`;
      return;
    }
    list.innerHTML = state.project.comments.map((comment) => `
      <article class="research-review-item">
        <div class="research-review-top">
          <div><strong>${escapeHtml(comment.target)}</strong><br><small>${escapeHtml(comment.author)} · ${formatTime(comment.createdAt)}</small></div>
          <button type="button" data-delete-comment="${escapeHtml(comment.id)}">删除</button>
        </div>
        <p>${escapeHtml(comment.text)}</p>
      </article>
    `).join("");
    list.querySelectorAll("[data-delete-comment]").forEach((button) => {
      button.addEventListener("click", () => {
        state.project.comments = state.project.comments.filter((comment) => comment.id !== button.dataset.deleteComment);
        saveProject({ silent: true });
        renderComments();
        updateProjectProgress();
      });
    });
  }

  function setupReview() {
    $("#research-member-form").addEventListener("submit", (event) => {
      event.preventDefault();
      const name = $("#review-member-name").value.trim();
      if (!name) {
        bridge.showToast("请输入成员姓名或昵称");
        return;
      }
      state.project.members.push({
        id: crypto.randomUUID ? crypto.randomUUID() : `M-${Date.now()}`,
        name,
        role: $("#review-member-role").value,
        addedAt: nowIso()
      });
      $("#research-member-form").reset();
      saveProject({ silent: true });
      renderMembers();
      bridge.showToast("成员已加入项目");
    });
    $("#research-review-form").addEventListener("submit", (event) => {
      event.preventDefault();
      const author = $("#review-author").value;
      const text = $("#review-comment").value.trim();
      if (!author || !text) {
        bridge.showToast("请选择成员并填写批注");
        return;
      }
      state.project.comments.unshift({
        id: crypto.randomUUID ? crypto.randomUUID() : `C-${Date.now()}`,
        author,
        target: $("#review-target").value,
        text,
        createdAt: nowIso()
      });
      $("#review-comment").value = "";
      saveProject({ silent: true });
      renderComments();
      updateProjectProgress();
      bridge.showToast("审阅批注已保存");
    });
  }

  async function initialize() {
    if (!bridge) return;
    state.project = loadProject();
    fillProjectForm();
    setupTabs();
    setupProjectActions();
    setupKnowledge();
    setupAnalysis();
    setupPackage();
    setupReview();
    try {
      state.documents = await getAllDocuments();
      state.documents.sort((a, b) => b.addedAt.localeCompare(a.addedAt));
    } catch {
      state.documents = [];
      bridge.showToast("本机知识库暂时无法打开");
    }
    renderKnowledge();
    renderProject();
    refreshReportOptions();
    refreshResearchAnalysis();
    updatePackageChecklist();
    $("#research-save-state").textContent = `上次保存 ${formatTime(state.project.updatedAt)}`;
  }

  window.OptilabResearch = {
    getProject: () => state.project,
    getDocuments: () => state.documents,
    getAnalysis: () => state.analysis,
    generateDesign: buildResearchDesign,
    refreshAnalysis: refreshResearchAnalysis,
    readProjectForm,
    saveProject: () => {
      readProjectForm();
      return saveProject({ silent: true });
    },
    renderProject,
    renderKnowledge,
    refreshReportOptions,
    getSelectedReport: () => (bridge.getReports?.() || []).find((item) => item.id === $("#research-report-select")?.value) || null
  };

  initialize().catch((error) => {
    console.error("OptiLab research suite initialization failed", error);
    bridge?.showToast("科研项目模块初始化失败，请刷新页面");
  });
})();
