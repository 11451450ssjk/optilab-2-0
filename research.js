"use strict";

(function () {
  const bridge = window.OptilabBridge;
  const CITATION_STORAGE_KEY = "optilab_citation_library_v1";
  const JOURNALS = {
    nature: {
      label: "Nature",
      issns: ["0028-0836", "1476-4687"],
      names: ["nature"]
    },
    "nature-photonics": {
      label: "Nature Photonics",
      issns: ["1749-4885", "1749-4893"],
      names: ["nature photonics"]
    },
    science: {
      label: "Science",
      issns: ["0036-8075", "1095-9203"],
      names: ["science"]
    },
    prl: {
      label: "Physical Review Letters",
      issns: ["0031-9007", "1079-7114"],
      names: ["physical review letters"]
    },
    "optics-express": {
      label: "Optics Express",
      issns: ["1094-4087"],
      names: ["optics express"]
    },
    "science-advances": {
      label: "Science Advances",
      issns: ["2375-2548"],
      names: ["science advances"]
    }
  };

  const state = {
    results: [],
    citations: [],
    searching: false,
    lastPaper: "",
    lastPaperTitle: ""
  };

  function loadCitations() {
    try {
      const stored = JSON.parse(localStorage.getItem(CITATION_STORAGE_KEY) || "[]");
      state.citations = Array.isArray(stored) ? stored.filter((item) => item && item.title) : [];
    } catch {
      state.citations = [];
    }
  }

  function saveCitations() {
    try {
      localStorage.setItem(CITATION_STORAGE_KEY, JSON.stringify(state.citations));
    } catch {
      bridge.showToast("浏览器无法保存引用库");
    }
  }

  function escapeHtml(value) {
    return bridge.escapeHtml(String(value || ""));
  }

  function normalizeDoi(value) {
    return String(value || "")
      .replace(/^https?:\/\/doi\.org\//i, "")
      .trim();
  }

  function toDoiUrl(doi) {
    const normalized = normalizeDoi(doi);
    return normalized ? `https://doi.org/${normalized.split("/").map(encodeURIComponent).join("/")}` : "";
  }

  function decodeOpenAlexAbstract(index) {
    if (!index || typeof index !== "object") return "";
    const words = [];
    Object.entries(index).forEach(([word, positions]) => {
      positions.forEach((position) => {
        words[position] = word;
      });
    });
    return words.filter(Boolean).join(" ");
  }

  function stripMarkup(value) {
    return String(value || "")
      .replace(/<[^>]*>/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/\s+/g, " ")
      .trim();
  }

  function normalizeOpenAlex(item) {
    const doi = normalizeDoi(item.doi);
    return {
      id: doi ? `doi:${doi.toLowerCase()}` : `openalex:${item.id || item.title}`,
      source: "OpenAlex",
      title: item.title || item.display_name || "无题名",
      authors: (item.authorships || []).slice(0, 8).map((authorship) => authorship.author?.display_name).filter(Boolean),
      journal: item.primary_location?.source?.display_name || "未标注期刊",
      year: item.publication_year || "",
      date: item.publication_date || "",
      doi,
      citations: item.cited_by_count || 0,
      abstract: decodeOpenAlexAbstract(item.abstract_inverted_index),
      type: item.type || "article",
      openAccess: Boolean(item.open_access?.is_oa),
      openAccessUrl: item.open_access?.oa_url || "",
      url: item.primary_location?.landing_page_url || (doi ? toDoiUrl(doi) : "")
    };
  }

  function normalizeCrossref(item) {
    const doi = normalizeDoi(item.DOI);
    const authors = (item.author || []).slice(0, 8).map((author) => {
      if (author.family && author.given) return `${author.given} ${author.family}`;
      return author.name || author.family || author.given || "";
    }).filter(Boolean);
    const year = item.issued?.["date-parts"]?.[0]?.[0] || "";
    return {
      id: doi ? `doi:${doi.toLowerCase()}` : `crossref:${item.URL || item.title?.[0]}`,
      source: "Crossref",
      title: item.title?.[0] || "无题名",
      authors,
      journal: item["container-title"]?.[0] || item.publisher || "未标注期刊",
      year,
      date: item.issued?.["date-parts"]?.[0]?.join("-") || "",
      doi,
      citations: item["is-referenced-by-count"] || 0,
      abstract: stripMarkup(item.abstract),
      type: item.type || "journal-article",
      openAccess: false,
      openAccessUrl: "",
      url: item.URL || (doi ? toDoiUrl(doi) : "")
    };
  }

  function journalMatches(item, journalKey) {
    if (!journalKey) return true;
    const journal = JOURNALS[journalKey];
    if (!journal) return true;
    const venue = String(item.journal || "").toLowerCase();
    return journal.names.some((name) => venue === name || venue.includes(name));
  }

  function dedupeResults(items) {
    const seen = new Set();
    return items.filter((item) => {
      const key = item.doi ? `doi:${item.doi.toLowerCase()}` : `${item.title.toLowerCase()}|${item.year}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  function buildOpenAlexUrl(query, journalKey, fromYear, sort) {
    const params = new URLSearchParams();
    params.set("search", query);
    params.set("per-page", "25");
    const filters = [];
    if (fromYear) filters.push(`from_publication_date:${fromYear}-01-01`);
    if (journalKey && JOURNALS[journalKey]?.issns?.length) {
      filters.push(`primary_location.source.issn:${JOURNALS[journalKey].issns[0]}`);
    }
    if (filters.length) params.set("filter", filters.join(","));
    const sortMap = {
      relevance: "relevance_score:desc",
      citations: "cited_by_count:desc",
      newest: "publication_date:desc"
    };
    params.set("sort", sortMap[sort] || sortMap.relevance);
    return `https://api.openalex.org/works?${params.toString()}`;
  }

  function buildCrossrefUrl(query, journalKey, fromYear, sort) {
    const params = new URLSearchParams();
    params.set("query", query);
    if (journalKey && JOURNALS[journalKey]) {
      params.set("query.container-title", JOURNALS[journalKey].label);
    }
    params.set("rows", "35");
    params.set("select", "DOI,title,author,container-title,issued,is-referenced-by-count,abstract,URL,type,publisher");
    if (fromYear) params.set("filter", `from-pub-date:${fromYear}-01-01`);
    const sortMap = {
      relevance: "relevance",
      citations: "is-referenced-by-count",
      newest: "published"
    };
    params.set("sort", sortMap[sort] || sortMap.relevance);
    params.set("order", "desc");
    return `https://api.crossref.org/works?${params.toString()}`;
  }

  async function fetchJson(url) {
    const response = await fetch(url, {
      headers: { Accept: "application/json" },
      mode: "cors",
      cache: "no-store"
    });
    if (!response.ok) throw new Error(`文献服务返回 ${response.status}`);
    return response.json();
  }

  async function searchOpenAlex(query, journalKey, fromYear, sort) {
    const data = await fetchJson(buildOpenAlexUrl(query, journalKey, fromYear, sort));
    return (data.results || []).map(normalizeOpenAlex).filter((item) => journalMatches(item, journalKey));
  }

  async function searchCrossref(query, journalKey, fromYear, sort) {
    const data = await fetchJson(buildCrossrefUrl(query, journalKey, fromYear, sort));
    return (data.message?.items || [])
      .map(normalizeCrossref)
      .filter((item) => journalMatches(item, journalKey));
  }

  function setApiStatus(mode, text) {
    const element = document.getElementById("literature-api-status");
    element.className = `api-status ${mode || ""}`.trim();
    element.innerHTML = `<i></i> ${escapeHtml(text)}`;
  }

  function setSearching(value) {
    state.searching = value;
    const form = document.getElementById("literature-form");
    const button = form.querySelector('button[type="submit"]');
    button.disabled = value;
    button.textContent = value ? "检索中…" : "检索";
    document.getElementById("literature-result-count").textContent = value ? "正在查询公开文献…" : document.getElementById("literature-result-count").textContent;
  }

  async function performLiteratureSearch() {
    if (state.searching) return;
    const query = document.getElementById("literature-query").value.trim();
    const source = document.getElementById("literature-source").value;
    const journalKey = document.getElementById("literature-journal").value;
    const fromYear = Number(document.getElementById("literature-from-year").value) || 1900;
    const sort = document.getElementById("literature-sort").value;
    if (!query) {
      bridge.showToast("请输入研究主题或关键词");
      return;
    }
    setSearching(true);
    setApiStatus("loading", "正在检索");
    const resultsElement = document.getElementById("literature-results");
    resultsElement.innerHTML = `<div class="search-loading"><strong>正在连接学术数据库</strong><span>从 OpenAlex 与 Crossref 获取公开元数据…</span></div>`;
    const requests = [];
    const errors = [];
    if (source === "all" || source === "openalex") {
      requests.push(searchOpenAlex(query, journalKey, fromYear, sort).catch((error) => {
        errors.push(`OpenAlex：${error.message}`);
        return [];
      }));
    }
    if (source === "all" || source === "crossref") {
      requests.push(searchCrossref(query, journalKey, fromYear, sort).catch((error) => {
        errors.push(`Crossref：${error.message}`);
        return [];
      }));
    }
    try {
      const datasets = await Promise.all(requests);
      let collected = datasets.flat();
      if (!collected.length && source === "crossref") {
        try {
          collected = await searchOpenAlex(query, journalKey, fromYear, sort);
          if (collected.length) setApiStatus("", "已切换到 OpenAlex");
        } catch (fallbackError) {
          errors.push(`OpenAlex 备用源：${fallbackError.message}`);
        }
      } else if (!collected.length && source === "openalex") {
        try {
          collected = await searchCrossref(query, journalKey, fromYear, sort);
          if (collected.length) setApiStatus("", "已切换到 Crossref");
        } catch (fallbackError) {
          errors.push(`Crossref 备用源：${fallbackError.message}`);
        }
      }
      state.results = dedupeResults(collected).sort((a, b) => {
        if (sort === "citations") return b.citations - a.citations;
        if (sort === "newest") return Number(b.year || 0) - Number(a.year || 0);
        return 0;
      });
      renderResults();
      document.getElementById("literature-result-count").textContent = `${state.results.length} 条结果`;
      if (state.results.length) {
        setApiStatus("", "检索完成");
      } else {
        setApiStatus("error", "未找到结果");
        resultsElement.innerHTML = `<div class="search-empty"><strong>没有找到匹配文献</strong><span>可以缩短关键词、取消期刊限制或降低起始年份。</span></div>`;
      }
      if (errors.length) {
        bridge.showToast(errors.join("；"));
      }
    } catch (error) {
      setApiStatus("error", "检索失败");
      resultsElement.innerHTML = `<div class="search-error"><strong>文献服务暂时不可用</strong><span>${escapeHtml(error.message)}。可稍后重试或切换数据源。</span></div>`;
    } finally {
      setSearching(false);
    }
  }

  function authorText(item, max = 3) {
    const authors = Array.isArray(item.authors) ? item.authors.filter(Boolean) : [];
    if (!authors.length) return "作者信息未提供";
    if (authors.length <= max) return authors.join(", ");
    return `${authors.slice(0, max).join(", ")} 等`;
  }

  function isInLibrary(item) {
    return state.citations.some((citation) =>
      citation.id === item.id || (item.doi && citation.doi && citation.doi.toLowerCase() === item.doi.toLowerCase())
    );
  }

  function renderResults() {
    const container = document.getElementById("literature-results");
    if (!state.results.length) return;
    container.innerHTML = state.results.map((item, index) => {
      const added = isInLibrary(item);
      const doiUrl = item.doi ? toDoiUrl(item.doi) : "";
      const abstract = item.abstract
        ? escapeHtml(item.abstract.slice(0, 420))
        : "公开元数据未提供摘要。请通过 DOI 进入出版页核对全文与结论。";
      return `<article class="literature-result-card ${added ? "added" : ""}" style="--result-index:${Math.min(index, 12)}">
        <div class="result-source-row">
          <span class="result-source">${escapeHtml(item.source)}</span>
          <span class="result-cites">被引 ${Number(item.citations || 0).toLocaleString("zh-CN")} 次</span>
        </div>
        <h4>${escapeHtml(item.title)}</h4>
        <div class="result-meta">${escapeHtml(authorText(item))}<br><b>${escapeHtml(item.journal)}</b>${item.year ? ` · ${escapeHtml(item.year)}` : ""}${doiUrl ? ` · DOI ${escapeHtml(item.doi)}` : ""}</div>
        <p class="result-abstract">${abstract}</p>
        <div class="result-actions">
          <button class="${added ? "" : "primary-cite"}" data-cite-index="${index}" ${added ? "disabled" : ""}>${added ? "已在引用库" : "加入引用"}</button>
          ${item.openAccessUrl ? `<a href="${escapeHtml(item.openAccessUrl)}" target="_blank" rel="noopener noreferrer">开放全文</a>` : ""}
          ${doiUrl ? `<a class="doi-link" href="${escapeHtml(doiUrl)}" target="_blank" rel="noopener noreferrer">查看 DOI ↗</a>` : ""}
        </div>
      </article>`;
    }).join("");
    container.querySelectorAll("[data-cite-index]").forEach((button) => {
      button.addEventListener("click", () => addCitation(state.results[Number(button.dataset.citeIndex)]));
    });
  }

  function addCitation(item) {
    if (!item || isInLibrary(item)) return;
    state.citations.unshift({
      ...item,
      addedAt: new Date().toISOString()
    });
    saveCitations();
    renderLibrary();
    renderResults();
    updatePaperCounts();
    bridge.showToast("文献已加入引用库");
  }

  function removeCitation(id) {
    state.citations = state.citations.filter((item) => item.id !== id);
    saveCitations();
    renderLibrary();
    renderResults();
    updatePaperCounts();
    bridge.showToast("已从引用库移除");
  }

  function renderLibrary() {
    const container = document.getElementById("citation-library");
    document.getElementById("citation-count").textContent = String(state.citations.length);
    if (!state.citations.length) {
      container.innerHTML = `<div class="library-empty"><strong>尚未添加文献</strong><span>从右侧搜索结果中加入引用</span></div>`;
      return;
    }
    container.innerHTML = state.citations.map((item) => `
      <div class="citation-item">
        <div class="citation-item-top">
          <strong>${escapeHtml(item.title)}</strong>
          <button data-remove-citation="${escapeHtml(item.id)}" title="移除文献">×</button>
        </div>
        <p>${escapeHtml(authorText(item, 2))} · ${escapeHtml(item.journal)} · ${escapeHtml(item.year || "年份未知")}</p>
      </div>
    `).join("");
    container.querySelectorAll("[data-remove-citation]").forEach((button) => {
      button.addEventListener("click", () => removeCitation(button.dataset.removeCitation));
    });
  }

  function citationKey(item, index) {
    if (item.doi) return `doi_${item.doi.replace(/[^a-zA-Z0-9]/g, "_")}`;
    const firstAuthor = (item.authors?.[0] || "ref").split(/\s+/).at(-1) || "ref";
    return `${firstAuthor.replace(/[^a-zA-Z0-9]/g, "") || "ref"}_${item.year || "n"}_${index + 1}`;
  }

  function toBibTeX() {
    return state.citations.map((item, index) => {
      const key = citationKey(item, index);
      const authors = (item.authors || []).join(" and ");
      return `@article{${key},
  title = {${item.title}},
  author = {${authors}},
  journal = {${item.journal || ""}},
  year = {${item.year || ""}},
  doi = {${item.doi || ""}},
  url = {${item.doi ? toDoiUrl(item.doi) : item.url || ""}}
}`;
    }).join("\n\n");
  }

  async function copyText(text, successMessage) {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      textarea.remove();
    }
    bridge.showToast(successMessage);
  }

  function downloadText(filename, text, type = "text/plain;charset=utf-8") {
    const blob = new Blob([text], { type });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  }

  function downloadBibTeX() {
    if (!state.citations.length) {
      bridge.showToast("引用库为空");
      return;
    }
    downloadText("optilab-references.bib", toBibTeX(), "application/x-bibtex;charset=utf-8");
    bridge.showToast("BibTeX 已下载");
  }

  function reportOptions() {
    return bridge.getReports();
  }

  function updatePaperReports() {
    const reports = reportOptions();
    const select = document.getElementById("paper-report-select");
    const currentValue = select.value;
    if (!reports.length) {
      select.innerHTML = '<option value="">等待生成实验报告</option>';
    } else {
      select.innerHTML = reports.map((report) =>
        `<option value="${escapeHtml(report.id)}">${escapeHtml(report.experimentName)} · ${escapeHtml(report.batchName)} · ${new Date(report.createdAt).toLocaleDateString("zh-CN")}</option>`
      ).join("");
      const active = bridge.getActiveReport();
      const preferred = reports.find((report) => report.id === active?.id)?.id || currentValue || reports[0].id;
      select.value = preferred;
    }
    updatePaperCounts();
    updateSuggestedTitle();
  }

  function updatePaperCounts() {
    const reportCount = reportOptions().length;
    document.getElementById("paper-report-count").textContent = String(reportCount);
    document.getElementById("paper-citation-count").textContent = String(state.citations.length);
  }

  function selectedReport() {
    const id = document.getElementById("paper-report-select").value;
    return reportOptions().find((report) => report.id === id) || null;
  }

  function updateSuggestedTitle() {
    const input = document.getElementById("paper-title");
    if (input.value.trim()) return;
    const report = selectedReport();
    if (report) {
      input.placeholder = `${report.experimentName}实验数据分析与论文初稿`;
    }
  }

  function shortAuthor(authors) {
    if (!authors?.length) return "佚名";
    const first = authors[0];
    const last = first.split(/\s+/).at(-1);
    return authors.length > 1 ? `${last}等` : last;
  }

  function formatReference(item, index, style) {
    const authors = (item.authors || []).join(", ") || "作者信息未提供";
    const doiText = item.doi ? `https://doi.org/${item.doi}` : item.url || "";
    if (style === "gbt") {
      return `[${index + 1}] ${authors}. ${item.title}[J]. ${item.journal || "未标注期刊"}, ${item.year || "年份未知"}.${doiText ? ` DOI/URL: ${doiText}.` : ""}`;
    }
    if (style === "apa") {
      return `${authors} (${item.year || "n.d."}). ${item.title}. ${item.journal || "Unpublished"}.${doiText ? ` ${doiText}` : ""}`;
    }
    return `[${index + 1}] ${authors}. ${item.title}. ${item.journal || "Unpublished"}, ${item.year || "n.d."}.${doiText ? ` ${doiText}` : ""}`;
  }

  function inlineCitation(item, index, style) {
    if (style === "apa") return `(${shortAuthor(item.authors)}, ${item.year || "n.d."})`;
    return `[${index + 1}]`;
  }

  function generatePaper() {
    const report = selectedReport();
    if (!report) {
      bridge.showToast("请先导入数据并生成实验报告");
      return;
    }
    if (!state.citations.length) {
      bridge.showToast("请先在引用库中加入至少一篇文献");
      return;
    }
    const experiment = window.LAB_EXPERIMENTS.find((item) => item.id === report.experimentId);
    const principle = window.LAB_PRINCIPLES[report.experimentId];
    if (!experiment || !principle) {
      bridge.showToast("找不到该实验的理论资料");
      return;
    }
    const analysis = report.analysis;
    const style = document.getElementById("paper-citation-style").value;
    const depth = document.getElementById("paper-depth").value;
    const type = document.getElementById("paper-type").value;
    const customTitle = document.getElementById("paper-title").value.trim();
    const title = customTitle || `${experiment.name}实验数据分析与论文初稿`;
    const information = window.OptilabBridge.simInfo(experiment);
    const citations = state.citations.map((item, index) => ({
      item,
      index,
      inline: inlineCitation(item, index, style),
      reference: formatReference(item, index, style)
    }));
    let knowledgeEvidence = [];
    try {
      const storedProject = JSON.parse(localStorage.getItem("optilab_research_project_v1") || "null");
      knowledgeEvidence = Array.isArray(storedProject?.evidence) ? storedProject.evidence.slice(0, 12) : [];
    } catch {
      knowledgeEvidence = [];
    }
    const knowledgeBlock = knowledgeEvidence.length
      ? knowledgeEvidence.map((item, index) =>
        `[K${index + 1}] ${item.documentTitle || "本地文献"}${item.location ? `，${item.location}` : ""}：${item.claim || "待补充主张"}。摘录：${item.finding || "待补充原文依据"}`
      ).join("\n")
      : "当前项目还没有手工整理的文献证据卡片。";
    const citationOverview = citations.map((citation) =>
      `${citation.inline} ${citation.item.title}（${citation.item.journal || "未标注期刊"}, ${citation.item.year || "n.d."}）`
    ).join("\n");
    const literatureTopics = citations
      .map((citation) => `“${citation.item.title}”`)
      .slice(0, 6)
      .join("；");
    const periodic = analysis.peaks.length >= 2;
    const resultStatement = periodic
      ? `数据中识别到 ${analysis.peaks.length} 个局部峰值，平均峰间距为 ${bridge.compactNumber(analysis.meanPeakSpacing)}。`
      : `线性拟合决定系数 R² 为 ${bridge.formatNumber(analysis.r2, 4)}，斜率估计为 ${bridge.compactNumber(analysis.slope)}。`;
    const trendStatement = periodic
      ? `观测结果呈现周期性或多峰响应。需要结合 ${experiment.formula} 与仪器采样间隔解释峰间距，不能仅根据线性模型评价该数据。`
      : analysis.r2 >= 0.8
        ? `观测结果在当前数据范围内呈较强线性关系，拟合斜率为 ${bridge.compactNumber(analysis.slope)} ± ${bridge.compactNumber(analysis.slopeStandardError)}。`
        : `当前数据未呈现稳定的单一线性关系，可能存在非线性区段、周期波动或测量噪声。`;
    const procedure = principle.steps.map((step, index) => `${index + 1}. ${step}`).join("\n");
    const physicsTrace = report.physicsSnapshot
      ? `计算引擎：${report.physicsSnapshot.engineVersion}
模型路径：${report.physicsSnapshot.sim}
基础关系：${report.physicsSnapshot.formula}
参数推演：${report.physicsSnapshot.derived?.value || "不适用"}
模型假设：${(report.physicsSnapshot.derived?.assumptions || []).join("；") || "以课程指导书为准"}
输入哈希：${report.physicsSnapshot.inputHash}`
      : "该报告未保存统一计算快照；本文只使用报告中的统计量，不补充不存在的模型结果。";
    const extendedSections = depth === "extended" ? `
## 6. 扩展讨论与局限

### 6.1 与公开文献的关系
本次检索得到的文献主题包括：${literatureTopics}。这些题名和出版信息用于帮助定位研究背景，但软件没有阅读全文，因此不声称这些研究必然支持本文结论。正式投稿前，应逐篇阅读摘要、方法、结果和讨论，并按引用位置重写相关表述。

### 6.2 系统误差与适用边界
${information.errors}

### 6.3 可重复性与数据治理
报告保存了数据批次、报告编号、坐标轴、参数和计算统计量。当前数据存储于浏览器本地，若需要多人协作，应建立带权限控制的后端数据库，并记录数据版本、操作者和审核状态。

### 6.4 后续工作
- 扩大样本量并执行至少三次独立重复；
- 增加仪器校准和 B 类不确定度信息；
- 将模型仿真与真实测量结果对照；
- 对引用文献进行全文核验，建立证据与论点的对应表。
` : "";
    const paper = `# ${title}

> 论文类型：${type === "review" ? "文献综述型初稿" : type === "course" ? "课程论文 / 实验论文" : "实验研究论文"}
> 基于报告：${report.id}
> 实验批次：${report.batchName}
> 引用格式：${style === "gbt" ? "GB/T 7714" : style === "apa" ? "APA 7" : "数字编号（Nature 风格）"}

## 摘要
本文围绕“${experiment.name}”实验开展数据分析与论文初稿撰写。研究依据报告 ${report.id} 中的 ${analysis.n} 个有效数据点，对“${report.xHeader}”与“${report.yHeader}”之间的关系进行统计分析。${resultStatement} 数据质量评分为 ${analysis.qualityScore}/100，均值的标准误差为 ${bridge.compactNumber(analysis.standardError)}。结合 ${citations.length} 篇已选择文献的公开元数据，本文整理了研究背景、实验方法、结果讨论和局限。本文生成的结论受当前数据范围与仪器条件约束，需在补充重复实验、校准资料和全文文献核验后进一步确认。

**关键词：** ${experiment.name}；${information.domain}；数据分析；不确定度；${citations.slice(0, 3).map((citation) => citation.item.journal || "光电实验").join("；")}

## 1. 引言

${principle.intro}

${experiment.name}涉及 ${information.domain} 中的基础测量与系统分析问题。本研究的核心理论关系为：

\`${experiment.formula}\`

为了建立研究背景，本次工作检索了以下公开文献：

${citationOverview}

这些文献覆盖了与本研究相关的主题，包括 ${literatureTopics}。当前版本仅使用公开题名、作者、期刊、年份与 DOI 等元数据，未自动获取全文。因此，文献部分用于定位研究方向和构建引用框架，具体研究结论、方法和局限必须在阅读原文后补充。

本文的研究目标包括：依据原始数据评价测量响应与数据质量；结合实验原理解释主要趋势、异常点和不确定度；形成可用于后续修改的实验研究论文结构。

## 2. 理论基础

### 2.1 实验原理

${principle.theory}

### 2.2 核心公式与变量

核心关系为：

\`${experiment.formula}\`

${principle.variables}

### 2.3 观察与判读

${principle.observations}

## 3. 实验材料与方法

### 3.1 仪器与器材

${principle.apparatus}

### 3.2 软件参数与数据来源

本论文依据报告 \`${report.id}\`，数据文件为 \`${report.sourceName}\`。横轴为 \`${report.xHeader}\`，纵轴为 \`${report.yHeader}\`。仿真或记录参数为：

${report.parameters ? `- ${report.parameters.primaryLabel}：${report.parameters.primaryValue} ${report.parameters.primaryUnit}
- ${report.parameters.secondaryLabel}：${report.parameters.secondaryValue} ${report.parameters.secondaryUnit}` : "- 未保存模型参数。"}

统一计算链记录：

${physicsTrace}

### 3.3 实验步骤

${procedure}

### 3.4 数据处理方法

系统计算了有效数据点数、平均值、标准差、标准误差、95% 均值区间、线性斜率、截距、决定系数、残差 RMSE、局部峰值和异常点。异常点采用偏离均值超过 2.5 倍标准差的经验阈值标记，仍应结合原始记录判断。

## 4. 结果

### 4.1 数据质量

本次共整理 ${analysis.n} 个有效数据点，数据质量评分为 ${analysis.qualityScore}/100（${analysis.qualityLabel}）。均值为 ${bridge.compactNumber(analysis.mean)} ± ${bridge.compactNumber(analysis.standardError)}，95% 均值区间半宽为 ${bridge.compactNumber(analysis.confidence95)}。数据范围为 ${bridge.compactNumber(analysis.min)} 至 ${bridge.compactNumber(analysis.max)}。

### 4.2 主要趋势

${trendStatement}

${resultStatement}

${analysis.outliers.length ? `检测到 ${analysis.outliers.length} 个高偏差点，需要在原始数据中逐点复核。` : "在当前经验阈值下未检测到显著高偏差点。"}

### 4.3 拟合与不确定度

线性回归方程为：

\`y = ${bridge.compactNumber(analysis.slope)}x + ${bridge.compactNumber(analysis.intercept)}\`

决定系数 R² = ${bridge.formatNumber(analysis.r2, 5)}，残差 RMSE = ${bridge.compactNumber(analysis.residualRmse)}，斜率标准不确定度估计为 ${bridge.compactNumber(analysis.slopeStandardError)}。上述参数仅代表当前数据范围内的统计描述，不能直接替代完整的测量不确定度评定。

## 5. 讨论

${information.errors}

从文献背景看，${citations.slice(0, 4).map((citation) => `${citation.inline} ${citation.item.title}`).join("；")} 提供了与本研究相关的检索入口。由于未阅读全文，本文不对这些文献的具体结论作扩展推断。正式写作时，应在每个论点后补充准确引用，并明确本实验与既有研究在对象、尺度、方法和精度上的差异。

### 5.1 文献知识库证据

${knowledgeBlock}

以上内容来自作者上传或粘贴到本机知识库后整理的证据卡片，系统没有自动判断这些结论是否适用于当前实验。正式写作时仍需核对原文、页码和适用边界。

当前结果的主要限制包括：数据点数量有限；仪器校准和环境信息未完整纳入报告；部分文献只有公开元数据；结构化生成文本仍需人工完成学术表达、因果解释和图表编号。

${extendedSections}

## ${depth === "extended" ? "7" : "6"}. 结论

本文基于 ${analysis.n} 个有效实验数据点完成了“${experiment.name}”的统计分析与论文初稿。结果表明：${trendStatement} 数据质量评分为 ${analysis.qualityScore}/100。结合 ${citations.length} 篇文献的公开元数据，本文建立了理论背景、方法、结果、讨论和参考文献的结构框架。

本稿是研究写作的起点，不是可直接提交的最终论文。下一步应补充原始仪器信息、全文文献证据、正式图表、重复实验和不确定度评定，并由作者逐段核验与改写。

## 数据与代码可用性声明

实验数据来源：\`${report.sourceName}\`；报告编号：\`${report.id}\`。当前版本的数据和引用库仅保存在用户浏览器中。需要共享或复现实验时，应导出原始数据与报告，并明确隐私、权限和版本管理方式。

## 参考文献

${citations.map((citation) => citation.reference).join("\n\n")}

## 本地知识库资料

${knowledgeEvidence.length
  ? knowledgeEvidence.map((item, index) => `[K${index + 1}] ${item.documentTitle || "本地文献"}${item.location ? `，${item.location}` : ""}.`).join("\n\n")
  : "本次写作未引用本地知识库证据卡片。"}

## 作者审核清单

- [ ] 已阅读所引文献全文或可靠摘要。
- [ ] 已核对每处引用是否真正支持对应论点。
- [ ] 已补充真实仪器型号、量程、校准时间与环境条件。
- [ ] 已重新绘制并编号论文图表。
- [ ] 已重写摘要和结论，避免模板化表达。
- [ ] 已补充作者、单位、基金和利益冲突声明。
- [ ] 已完成查重、引用格式检查和导师审核。

> OptiLab 学术写作辅助仅生成结构化初稿。实验事实、数据处理、文献结论和最终文字由作者负责。`;
    state.lastPaper = paper;
    state.lastPaperTitle = title;
    const preview = document.getElementById("paper-preview");
    preview.textContent = paper;
    preview.classList.remove("paper-generated");
    void preview.offsetWidth;
    preview.classList.add("paper-generated");
    document.getElementById("paper-word-count").textContent = `${paper.replace(/\s/g, "").length} 字`;
    const generateButton = document.getElementById("generate-paper");
    generateButton.classList.add("button-confirmed");
    window.setTimeout(() => generateButton.classList.remove("button-confirmed"), 700);
    bridge.showToast("论文初稿已生成");
  }

  async function copyPaper() {
    if (!state.lastPaper) {
      bridge.showToast("请先生成论文初稿");
      return;
    }
    await copyText(state.lastPaper, "论文初稿已复制");
  }

  function downloadPaper() {
    if (!state.lastPaper) {
      bridge.showToast("请先生成论文初稿");
      return;
    }
    const safeTitle = state.lastPaperTitle.replace(/[\\/:*?"<>|]/g, "_");
    downloadText(`${safeTitle || "论文初稿"}.md`, state.lastPaper, "text/markdown;charset=utf-8");
    bridge.showToast("论文初稿已下载");
  }

  function setupEvents() {
    document.getElementById("literature-form").addEventListener("submit", (event) => {
      event.preventDefault();
      performLiteratureSearch();
    });
    document.querySelectorAll("[data-literature-topic]").forEach((button) => {
      button.addEventListener("click", () => {
        document.getElementById("literature-query").value = button.dataset.literatureTopic;
        document.getElementById("literature-query").focus();
      });
    });
    document.getElementById("copy-bibtex").addEventListener("click", () => {
      if (!state.citations.length) {
        bridge.showToast("引用库为空");
        return;
      }
      copyText(toBibTeX(), "BibTeX 已复制");
    });
    document.getElementById("download-bibtex").addEventListener("click", downloadBibTeX);
    document.getElementById("paper-report-select").addEventListener("change", updateSuggestedTitle);
    document.getElementById("generate-paper").addEventListener("click", generatePaper);
    document.getElementById("copy-paper").addEventListener("click", copyPaper);
    document.getElementById("download-paper").addEventListener("click", downloadPaper);
    window.addEventListener("optilab:reports-changed", updatePaperReports);
  }

  function initialize() {
    loadCitations();
    renderLibrary();
    renderResults();
    setupEvents();
    updatePaperReports();
    updatePaperCounts();
    const experiment = bridge.currentExperiment();
    const queryMap = {
      michelson: "Michelson interferometry precision measurement",
      "double-slit": "double slit interference coherence optics",
      photoelectric: "photoelectric effect work function measurement",
      "laser-beam": "Gaussian laser beam characterization",
      "fiber-sensor": "optical fiber sensing strain temperature",
      "machine-vision": "machine vision optical metrology defect detection"
    };
    document.getElementById("literature-query").value = queryMap[experiment.id] || `${experiment.name} optics experiment`;
  }

  window.ResearchStudio = {
    search: performLiteratureSearch,
    generatePaper,
    reloadCitations: () => {
      loadCitations();
      renderLibrary();
      updatePaperCounts();
    },
    getState: () => ({
      results: state.results,
      citations: state.citations,
      lastPaper: state.lastPaper
    }),
    setExternalPaper: (paper, title = "", isAi = false) => {
      state.lastPaper = paper;
      state.lastPaperTitle = title;
      const preview = document.getElementById("paper-preview");
      preview.textContent = paper;
      preview.classList.remove("paper-generated");
      preview.classList.toggle("paper-ai-generated", Boolean(isAi));
      void preview.offsetWidth;
      preview.classList.add("paper-generated");
      document.getElementById("paper-word-count").textContent = `${paper.replace(/\s/g, "").length} 字`;
      const badge = document.getElementById("paper-ai-badge");
      if (badge) {
        badge.hidden = !isAi;
        badge.textContent = isAi ? "AI 辅助草稿 · 待审核" : "本地结构化草稿";
      }
    }
  };

  initialize();
})();
