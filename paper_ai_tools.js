"use strict";

(function () {
  const bridge = window.OptilabBridge;
  const studio = window.ResearchStudio;
  const advanced = window.OptilabAdvanced;
  if (!bridge || !studio || !advanced) return;

  const button = document.getElementById("generate-ai-paper");
  const workflow = document.getElementById("paper-ai-workflow");
  const preview = document.getElementById("paper-preview");
  if (!button || !workflow || !preview) return;

  function setStage(name, stateName, detail = "") {
    workflow.querySelectorAll("[data-ai-stage]").forEach((element) => {
      if (element.dataset.aiStage === name) {
        element.dataset.state = stateName;
        element.title = detail || element.textContent;
      }
    });
  }

  function resetStages() {
    workflow.querySelectorAll("[data-ai-stage]").forEach((element) => {
      delete element.dataset.state;
      element.removeAttribute("title");
    });
  }

  function selectedReport() {
    const id = document.getElementById("paper-report-select")?.value;
    return bridge.getReports().find((report) => report.id === id) || null;
  }

  function loadCitations() {
    try {
      const citations = JSON.parse(localStorage.getItem("optilab_citation_library_v1") || "[]");
      return Array.isArray(citations) ? citations.filter((item) => item?.title) : [];
    } catch {
      return [];
    }
  }

  function loadKnowledgeEvidence() {
    try {
      const project = JSON.parse(localStorage.getItem("optilab_research_project_v1") || "null");
      return Array.isArray(project?.evidence) ? project.evidence.slice(0, 16) : [];
    } catch {
      return [];
    }
  }

  function citationLabel(item, index, style) {
    const authors = (item.authors || []).join(", ") || "作者信息未提供";
    const doi = item.doi ? `https://doi.org/${item.doi}` : item.url || "";
    if (style === "apa") return `${authors} (${item.year || "n.d."}). ${item.title}. ${item.journal || ""}. ${doi}`;
    return `[${index + 1}] ${authors}. ${item.title}. ${item.journal || "未标注期刊"}, ${item.year || "n.d."}. ${doi}`;
  }

  function buildEvidencePack() {
    const report = selectedReport();
    const citations = loadCitations();
    const evidence = loadKnowledgeEvidence();
    const experiment = report
      ? window.LAB_EXPERIMENTS.find((item) => item.id === report.experimentId)
      : bridge.currentExperiment();
    const style = document.getElementById("paper-citation-style")?.value || "numeric";
    return {
      report,
      experiment,
      citations,
      evidence,
      citationBlock: citations.map((item, index) => citationLabel(item, index, style)),
      physics: report?.physicsSnapshot || null,
      requestedTitle: document.getElementById("paper-title")?.value.trim() || "",
      paperType: document.getElementById("paper-type")?.value || "research",
      depth: document.getElementById("paper-depth")?.value || "standard"
    };
  }

  function validateGeneratedDraft(text, pack) {
    const allowed = new Set(pack.citations.map((_, index) => index + 1));
    const markers = [...text.matchAll(/\[(\d+)\]/g)].map((match) => Number(match[1]));
    const invalidMarkers = [...new Set(markers.filter((index) => !allowed.has(index)))];
    const dois = [...text.matchAll(/10\.\d{4,9}\/[-._;()/:A-Z0-9]+/gi)].map((match) => match[0]);
    const allowedDois = new Set(pack.citations.map((item) => item.doi).filter(Boolean));
    const invalidDois = [...new Set(dois.filter((doi) => !allowedDois.has(doi)))];
    const requiredHeadings = ["摘要", "引言", "方法", "结果", "讨论", "结论", "参考文献"];
    const missingHeadings = requiredHeadings.filter((heading) => !text.includes(heading));
    return {
      valid: invalidMarkers.length === 0 && invalidDois.length === 0 && missingHeadings.length === 0,
      invalidMarkers,
      invalidDois,
      missingHeadings,
      markerCount: markers.length
    };
  }

  function evidenceTraceTable(pack, validation) {
    const reportRow = pack.report
      ? `| R1 | 实验报告 | ${pack.report.id} · ${pack.report.experimentName} · ${pack.report.analysis?.n || 0} 点 |`
      : "| R1 | 实验报告 | 未选择报告 |";
    const physicsRow = pack.physics
      ? `| P1 | 统一计算 | ${pack.physics.engineVersion} · ${pack.physics.derived?.value || "无推演值"} · 输入哈希 ${pack.physics.inputHash} |`
      : "| P1 | 统一计算 | 历史报告未包含计算快照 |";
    const citationRows = pack.citations.slice(0, 20).map((item, index) =>
      `| C${index + 1} | 文献题录 | ${item.title} · ${item.journal || "未标注期刊"} · ${item.year || "n.d."}${item.doi ? ` · DOI ${item.doi}` : ""} |`
    );
    const evidenceRows = pack.evidence.slice(0, 10).map((item, index) =>
      `| E${index + 1} | 本地证据 | ${item.documentTitle || "本地文献"} · ${item.claim || "待补充主张"} |`
    );
    return [
      "| 编号 | 类型 | 可追踪内容 |",
      "| --- | --- | --- |",
      reportRow,
      physicsRow,
      ...citationRows,
      ...evidenceRows,
      "",
      `引用核验：${validation.valid ? "通过基础格式检查" : "需要人工修正"}；引用标记 ${validation.markerCount} 处；未允许编号 ${validation.invalidMarkers.join(", ") || "无"}；未允许 DOI ${validation.invalidDois.join(", ") || "无"}；缺失章节 ${validation.missingHeadings.join(", ") || "无"}。`
    ].join("\n");
  }

  async function generateAiPaper() {
    const config = advanced.getAiConfig?.();
    if (!config?.endpoint) {
      bridge.showToast("请先在“文献与 AI”页配置 AI 代理地址");
      document.getElementById("research-workspace")?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    resetStages();
    button.disabled = true;
    button.textContent = "AI 正在整理证据…";
    try {
      setStage("evidence", "active", "读取报告、文献题录、知识库证据与引用库");
      const pack = buildEvidencePack();
      if (!pack.report) throw new Error("请先选择一份实验报告");
      if (!pack.citations.length) throw new Error("请先保存至少一篇可引用文献");
      setStage("evidence", "done");
      setStage("compute", "active");
      const physicsText = pack.physics
        ? JSON.stringify(pack.physics, null, 2)
        : "该报告没有 physicsSnapshot，请不要补充不存在的计算结果。";
      setStage("compute", "done");
      setStage("draft", "active");
      const systemPrompt = `你是光电与电子信息领域的学术写作辅助工具。只能使用用户提供的实验报告、统一计算快照、文献题录和本地证据卡片。
禁止虚构数据、DOI、文献结论、仪器型号或实验结果。数字引用只能使用给定的 [1]...[N] 编号。
如果证据不足，必须写“现有证据不足”。明确区分“实验事实、统计推断、文献背景、待验证假设”。
论文必须包含：摘要、引言、方法、结果、讨论、结论、参考文献。`;
      const userPrompt = `请生成 Markdown 论文初稿。
题目：${pack.requestedTitle || `${pack.experiment.name}实验数据分析与论文初稿`}
类型：${pack.paperType}
详细程度：${pack.depth}
实验报告：
${JSON.stringify(pack.report, null, 2)}
统一计算快照：
${physicsText}
允许使用的文献题录：
${pack.citationBlock.join("\n")}
本地知识库证据：
${pack.evidence.map((item, index) => `[K${index + 1}] ${item.documentTitle || ""} ${item.location || ""} ${item.claim || ""} ${item.finding || ""}`).join("\n") || "无"}
写作要求：只引用上述文献编号；不输出参考文献之外的 DOI；结论不得超出数据和文献证据范围。`;
      const draft = await advanced.callAi([
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ], { maxTokens: 3600, temperature: 0.15 });
      setStage("draft", "done");
      setStage("verify", "active");
      const cleaned = String(draft).replace(/^```(?:markdown|md)?\s*/i, "").replace(/\s*```$/i, "").trim();
      const validation = validateGeneratedDraft(cleaned, pack);
      const title = pack.requestedTitle || `${pack.experiment.name}实验数据分析与论文初稿`;
      const finalText = `# ${title}

> **AI 辅助草稿 · 未经审核，不得直接提交**
> 数据来源：${pack.report.id} · ${pack.report.sourceName}
> 计算来源：${pack.physics?.engineVersion || "历史报告未保存统一计算快照"}
> 文献范围：${pack.citations.length} 篇已保存题录；本地证据 ${pack.evidence.length} 条
> 工作流：证据汇总 → 统一计算 → 引用约束生成 → 自动格式核验 → 人工审核

${cleaned}

## 证据追踪与自动核验

${evidenceTraceTable(pack, validation)}

## AI 输出审核要求

- [ ] 已逐项核对实验数据与统一计算快照。
- [ ] 已阅读每篇被引文献的摘要或全文，并确认其确实支持对应句子。
- [ ] 未允许的引用编号和 DOI：${validation.invalidMarkers.length || validation.invalidDois.length ? "必须修正" : "未发现"}。
- [ ] 已检查 AI 是否补充了输入材料中不存在的数据、仪器型号或研究结论。
- [ ] 已按课程、期刊或导师要求重写摘要、讨论和结论。
`;
      studio.setExternalPaper(finalText, title, true);
      setStage("verify", validation.valid ? "done" : "warn", validation.valid ? "基础格式检查通过" : "存在需要人工修正的引用或章节");
      bridge.showToast(validation.valid ? "AI 草稿已生成，基础引用检查通过" : "AI 草稿已生成，请处理核验警告");
    } catch (error) {
      workflow.querySelectorAll("[data-ai-stage][data-state='active']").forEach((element) => {
        element.dataset.state = "error";
        element.title = error.message;
      });
      bridge.showToast(`AI 写作失败：${error.message}`);
    } finally {
      button.disabled = false;
      button.textContent = "AI 增强初稿并核验引用";
    }
  }

  button.addEventListener("click", generateAiPaper);
  window.OptilabPaperTools = {
    buildEvidencePack,
    validateGeneratedDraft,
    generateAiPaper
  };
})();
