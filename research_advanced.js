"use strict";

(function () {
  const bridge = window.OptilabBridge;
  const research = window.OptilabResearch;
  const PROJECT_STORAGE_KEY = "optilab_research_project_v1";
  const CITATION_STORAGE_KEY = "optilab_citation_library_v1";
  const AI_CONFIG_KEY = "optilab_ai_proxy_config_v1";
  const CLOUD_CONFIG_KEY = "optilab_cloud_sync_config_v1";
  const AI_TOKEN_KEY = "optilab_ai_token";
  const CLOUD_TOKEN_KEY = "optilab_cloud_token";

  const UNIT_GROUPS = {
    length: {
      base: "m",
      units: {
        nm: 1e-9, "纳米": 1e-9, "μm": 1e-6, um: 1e-6, "微米": 1e-6,
        mm: 1e-3, "毫米": 1e-3, cm: 1e-2, "厘米": 1e-2, m: 1, "米": 1
      }
    },
    voltage: {
      base: "V",
      units: { nV: 1e-9, "μV": 1e-6, uV: 1e-6, mV: 1e-3, V: 1, kV: 1000 }
    },
    current: {
      base: "A",
      units: { nA: 1e-9, "μA": 1e-6, uA: 1e-6, mA: 1e-3, A: 1, kA: 1000 }
    },
    frequency: {
      base: "Hz",
      units: { mHz: 1e-3, Hz: 1, kHz: 1e3, MHz: 1e6, GHz: 1e9 }
    },
    angle: {
      base: "rad",
      units: { "°": Math.PI / 180, deg: Math.PI / 180, "度": Math.PI / 180, rad: 1, mrad: 1e-3 }
    },
    time: {
      base: "s",
      units: { ns: 1e-9, "μs": 1e-6, us: 1e-6, ms: 1e-3, s: 1, min: 60 }
    },
    power: {
      base: "W",
      units: { nW: 1e-9, "μW": 1e-6, uW: 1e-6, mW: 1e-3, W: 1, kW: 1e3 }
    }
  };

  const state = {
    serialPort: null,
    serialReader: null,
    serialCollecting: false,
    serialSamples: [],
    serialStart: 0,
    serialTimer: null,
    serialDemoTimer: null,
    comparisonRows: [],
    aiBusy: false,
    loadedScripts: new Map(),
    structureCache: new WeakMap()
  };

  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => [...document.querySelectorAll(selector)];
  const escapeHtml = (value) => bridge.escapeHtml(String(value ?? ""));

  function formatNumber(value, digits = 4) {
    if (!Number.isFinite(value)) return "—";
    if (value === 0) return "0";
    const abs = Math.abs(value);
    if (abs >= 10000 || abs < 0.001) return Number(value).toExponential(3);
    return Number(value).toFixed(digits).replace(/0+$/, "").replace(/\.$/, "");
  }

  function loadScript(url, globalName) {
    if (globalName && window[globalName]) return Promise.resolve(window[globalName]);
    if (state.loadedScripts.has(url)) return state.loadedScripts.get(url);
    const promise = new Promise((resolve, reject) => {
      const element = document.createElement("script");
      element.src = new URL(url, document.baseURI).href;
      element.async = true;
      element.onload = () => resolve(globalName ? window[globalName] : true);
      element.onerror = () => reject(new Error(`无法加载 ${url}`));
      document.head.appendChild(element);
    });
    state.loadedScripts.set(url, promise);
    return promise;
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

  function safeFileName(value) {
    return String(value || "OptiLab研究文件").replace(/[\\/:*?"<>|]/g, "_").slice(0, 90);
  }

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const area = document.createElement("textarea");
      area.value = text;
      area.style.position = "fixed";
      area.style.opacity = "0";
      document.body.appendChild(area);
      area.select();
      document.execCommand("copy");
      area.remove();
    }
    bridge.showToast("已复制");
  }

  function localConfig(storageKey, defaults = {}) {
    try {
      return { ...defaults, ...JSON.parse(localStorage.getItem(storageKey) || "{}") };
    } catch {
      return { ...defaults };
    }
  }

  function saveLocalConfig(storageKey, config) {
    localStorage.setItem(storageKey, JSON.stringify(config));
  }

  /* AI proxy */
  function loadAiConfig() {
    const config = localConfig(AI_CONFIG_KEY, {
      endpoint: "",
      model: "",
      temperature: 0.2,
      maxTokens: 1800,
      systemPrompt: "你是一名谨慎的光电与电子信息科研助手。只根据提供的项目、数据和文献证据给出建议，不虚构实验数据、文献结论或引用。"
    });
    $("#ai-endpoint").value = config.endpoint || "";
    $("#ai-model").value = config.model || "";
    $("#ai-temperature").value = config.temperature ?? 0.2;
    $("#ai-max-tokens").value = config.maxTokens || 1800;
    $("#ai-system-prompt").value = config.systemPrompt || $("#ai-system-prompt").value;
    $("#ai-token").value = sessionStorage.getItem(AI_TOKEN_KEY) || "";
    updateAiStatus();
  }

  function readAiConfig() {
    return {
      endpoint: $("#ai-endpoint").value.trim(),
      model: $("#ai-model").value.trim(),
      token: $("#ai-token").value.trim(),
      temperature: Number($("#ai-temperature").value) || 0,
      maxTokens: Math.max(256, Number($("#ai-max-tokens").value) || 1800),
      systemPrompt: $("#ai-system-prompt").value.trim()
    };
  }

  function saveAiConfig() {
    const config = readAiConfig();
    saveLocalConfig(AI_CONFIG_KEY, {
      endpoint: config.endpoint,
      model: config.model,
      temperature: config.temperature,
      maxTokens: config.maxTokens,
      systemPrompt: config.systemPrompt
    });
    if (config.token) sessionStorage.setItem(AI_TOKEN_KEY, config.token);
    else sessionStorage.removeItem(AI_TOKEN_KEY);
    updateAiStatus();
    bridge.showToast(config.endpoint ? "AI 代理配置已保存" : "已切换为本地模式");
  }

  function updateAiStatus() {
    const config = readAiConfig();
    const status = $("#ai-service-status");
    if (!status) return;
    status.textContent = config.endpoint ? (config.model ? `代理 · ${config.model}` : "代理已配置") : "本地模式";
    status.classList.toggle("ready", Boolean(config.endpoint));
  }

  async function callAi(messages, options = {}) {
    const config = readAiConfig();
    if (!config.endpoint) throw new Error("尚未配置 AI 代理地址");
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), 60000);
    try {
      const response = await fetch(config.endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(config.token ? { Authorization: `Bearer ${config.token}` } : {})
        },
        body: JSON.stringify({
          model: options.model || config.model,
          messages,
          temperature: options.temperature ?? config.temperature,
          max_tokens: options.maxTokens || config.maxTokens,
          stream: false
        }),
        signal: controller.signal
      });
      const text = await response.text();
      let data = {};
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        data = { response: text };
      }
      if (!response.ok) throw new Error(data.error?.message || data.message || `AI 服务返回 ${response.status}`);
      return data.choices?.[0]?.message?.content
        || data.output_text
        || data.response
        || data.answer
        || "AI 服务没有返回文字内容";
    } finally {
      window.clearTimeout(timer);
    }
  }

  function projectReviewPrompt() {
    const project = research.getProject();
    const report = research.getSelectedReport() || (bridge.getReports?.() || [])[0];
    const documents = research.getDocuments();
    const evidence = Array.isArray(project.evidence) ? project.evidence.slice(0, 8) : [];
    const analysis = research.getAnalysis();
    return `请审阅下面的科研项目，输出：
1. 研究问题是否清晰、可检验；
2. 实验设计和重复方案是否足够；
3. 统计方法与当前数据是否匹配；
4. 文献证据还缺少什么；
5. 下一步最重要的三项工作。
不要虚构数据或文献结论。

项目：${project.title || "未命名"}
研究问题：${project.question || "未填写"}
假设：${project.hypothesis || "未填写"}
器材和目标：${project.equipment || "未填写"}；${project.metric || "未填写"}
设计模板：${project.designTemplate || "auto"}
实验设计：${project.design.text || "尚未生成"}
当前报告：${report ? `${report.id}，${report.experimentName}，${report.analysis.n} 点` : "无"}
统计快照：${analysis ? JSON.stringify({
  best: analysis.best?.name,
  r2: analysis.best?.r2,
  rmse: analysis.best?.rmse,
  snr: analysis.snr,
  anova: analysis.anova,
  recommendations: analysis.recommendations
}) : "无"}
知识库全文：${documents.slice(0, 8).map((item) => item.title).join("；") || "无"}
证据卡片：${evidence.map((item) => `${item.claim}（${item.documentTitle} ${item.location || ""}）`).join("；") || "无"}`.slice(0, 24000);
  }

  async function aiReviewProject() {
    if (state.aiBusy) return;
    const config = readAiConfig();
    if (!config.endpoint) {
      renderLocalAiReview();
      return;
    }
    state.aiBusy = true;
    const output = $("#research-ai-output");
    output.innerHTML = `<div class="research-empty-state"><strong>正在使用 AI 审阅</strong><span>请求只发送项目文字和统计摘要，不直接发送 PDF 二进制文件。</span></div>`;
    try {
      const content = await callAi([
        { role: "system", content: config.systemPrompt },
        { role: "user", content: projectReviewPrompt() }
      ]);
      output.innerHTML = `<pre>${escapeHtml(content)}</pre>`;
      $("#ai-service-status").textContent = "最近调用成功";
    } catch (error) {
      output.innerHTML = `<div class="research-empty-state"><strong>AI 调用失败</strong><span>${escapeHtml(error.message)}</span></div>`;
      $("#ai-service-status").textContent = "连接失败";
    } finally {
      state.aiBusy = false;
    }
  }

  function renderLocalAiReview() {
    const project = research.getProject();
    const analysis = research.getAnalysis();
    const evidence = project.evidence || [];
    const items = [
      project.question?.trim() ? "研究问题已填写。" : "研究问题仍为空，先明确可比较的对象和判断标准。",
      project.hypothesis?.trim() ? "已有可检验假设。" : "还没有明确假设，结论容易停留在描述层面。",
      project.design.generatedAt ? "已有实验设计草稿，可以继续检查重复次数和停止条件。" : "尚未生成实验设计建议。",
      evidence.length ? `已有 ${evidence.length} 条文献证据。` : "还没有文献证据卡片。",
      analysis?.recommendations?.length ? analysis.recommendations[0] : "还没有可用的科研统计结果。"
    ];
    $("#research-ai-output").innerHTML = `<pre>本地审阅模式

${items.map((item, index) => `${index + 1}. ${item}`).join("\n")}

配置 AI 代理后，可以获得更具体的科研问题、方法和讨论建议。</pre>`;
  }

  async function testAiService() {
    const config = readAiConfig();
    if (!config.endpoint) {
      bridge.showToast("当前为本地模式；填写代理地址后可测试");
      return;
    }
    $("#ai-service-status").textContent = "正在测试";
    try {
      const answer = await callAi([
        { role: "system", content: "只回复 OK。" },
        { role: "user", content: "连接测试" }
      ], { maxTokens: 32, temperature: 0 });
      $("#ai-service-status").textContent = answer.includes("OK") ? "连接正常" : "已收到响应";
      bridge.showToast("AI 代理连接成功");
    } catch (error) {
      $("#ai-service-status").textContent = "连接失败";
      bridge.showToast(error.message);
    }
  }

  /* Cloud sync and sharing */
  function loadCloudConfig() {
    const config = localConfig(CLOUD_CONFIG_KEY, { endpoint: "", room: "" });
    $("#cloud-sync-endpoint").value = config.endpoint || "";
    $("#cloud-room-id").value = config.room || "";
    $("#cloud-token").value = sessionStorage.getItem(CLOUD_TOKEN_KEY) || "";
    updateCloudStatus();
  }

  function readCloudConfig() {
    return {
      endpoint: $("#cloud-sync-endpoint").value.trim(),
      room: $("#cloud-room-id").value.trim(),
      token: $("#cloud-token").value.trim(),
      passphrase: $("#cloud-passphrase").value
    };
  }

  function saveCloudConfig() {
    const config = readCloudConfig();
    saveLocalConfig(CLOUD_CONFIG_KEY, { endpoint: config.endpoint, room: config.room });
    if (config.token) sessionStorage.setItem(CLOUD_TOKEN_KEY, config.token);
    else sessionStorage.removeItem(CLOUD_TOKEN_KEY);
    updateCloudStatus();
    bridge.showToast("云同步配置已保存");
  }

  function updateCloudStatus(text = "") {
    const config = readCloudConfig();
    const status = $("#cloud-sync-status");
    if (!status) return;
    status.textContent = text || (config.endpoint && config.room ? "已配置" : "未配置");
    status.classList.toggle("ready", Boolean(config.endpoint && config.room));
  }

  function base64FromBytes(bytes) {
    let binary = "";
    bytes.forEach((value) => {
      binary += String.fromCharCode(value);
    });
    return btoa(binary);
  }

  function bytesFromBase64(value) {
    const binary = atob(value);
    return Uint8Array.from(binary, (char) => char.charCodeAt(0));
  }

  async function deriveCloudKey(passphrase, salt) {
    const material = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(passphrase),
      "PBKDF2",
      false,
      ["deriveKey"]
    );
    return crypto.subtle.deriveKey(
      { name: "PBKDF2", salt, iterations: 180000, hash: "SHA-256" },
      material,
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt", "decrypt"]
    );
  }

  async function encryptCloudPayload(payload, passphrase) {
    if (passphrase.length < 8) throw new Error("加密口令至少需要 8 个字符");
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const key = await deriveCloudKey(passphrase, salt);
    const plain = new TextEncoder().encode(JSON.stringify(payload));
    const ciphertext = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, plain);
    return {
      version: 1,
      algorithm: "AES-GCM",
      salt: base64FromBytes(salt),
      iv: base64FromBytes(iv),
      ciphertext: base64FromBytes(new Uint8Array(ciphertext))
    };
  }

  async function decryptCloudPayload(envelope, passphrase) {
    if (!envelope?.salt || !envelope?.iv || !envelope?.ciphertext) throw new Error("云端没有可用项目");
    const salt = bytesFromBase64(envelope.salt);
    const iv = bytesFromBase64(envelope.iv);
    const key = await deriveCloudKey(passphrase, salt);
    const plain = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      key,
      bytesFromBase64(envelope.ciphertext)
    );
    return JSON.parse(new TextDecoder().decode(plain));
  }

  function cloudProjectUrl(config) {
    return `${config.endpoint.replace(/\/+$/, "")}/${encodeURIComponent(config.room)}`;
  }

  async function pushCloudProject() {
    const config = readCloudConfig();
    if (!config.endpoint || !config.room) throw new Error("先填写云同步地址和项目空间 ID");
    research.readProjectForm();
    research.saveProject();
    const documents = research.getDocuments();
    const totalDocumentChars = documents.reduce((total, item) => total + (item.charCount || item.text?.length || 0), 0);
    const includeFullText = totalDocumentChars <= 8_000_000;
    const payload = {
      project: research.getProject(),
      knowledgeMetadata: documents.map(({ text, sections, metadata, ...rest }) => rest),
      knowledgeDocuments: includeFullText
        ? documents.map((item) => ({
            ...item,
            text: item.text,
            sections: item.sections
          }))
        : []
    };
    const envelope = await encryptCloudPayload(payload, config.passphrase);
    updateCloudStatus("正在上传");
    const response = await fetch(cloudProjectUrl(config), {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(config.token ? { Authorization: `Bearer ${config.token}` } : {})
      },
      body: JSON.stringify(envelope)
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.message || `云服务返回 ${response.status}`);
    updateCloudStatus("已上传");
    bridge.showToast(includeFullText ? "加密项目和知识库已上传" : "项目已上传；知识库超过 800 万字，仅同步元数据");
  }

  function writeKnowledgeDocuments(documents) {
    if (!Array.isArray(documents) || !documents.length) return Promise.resolve();
    return new Promise((resolve, reject) => {
      const request = indexedDB.open("optilab_research_knowledge_v1", 1);
      request.onupgradeneeded = () => {
        if (!request.result.objectStoreNames.contains("documents")) {
          request.result.createObjectStore("documents", { keyPath: "id" });
        }
      };
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction("documents", "readwrite");
        const store = transaction.objectStore("documents");
        documents.forEach((item) => {
          if (item?.id && item?.title && item?.text) store.put(item);
        });
        transaction.oncomplete = () => {
          db.close();
          resolve();
        };
        transaction.onerror = () => {
          db.close();
          reject(transaction.error);
        };
      };
    });
  }

  async function pullCloudProject() {
    const config = readCloudConfig();
    if (!config.endpoint || !config.room) throw new Error("先填写云同步地址和项目空间 ID");
    updateCloudStatus("正在拉取");
    const response = await fetch(cloudProjectUrl(config), {
      headers: {
        Accept: "application/json",
        ...(config.token ? { Authorization: `Bearer ${config.token}` } : {})
      }
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.message || `云服务返回 ${response.status}`);
    const envelope = data.payload || data;
    const payload = await decryptCloudPayload(envelope, config.passphrase);
    if (!payload.project) throw new Error("云端项目格式不正确");
    if (!window.confirm("拉取会覆盖当前浏览器中的项目，是否继续？")) return;
    localStorage.setItem(PROJECT_STORAGE_KEY, JSON.stringify(payload.project));
    await writeKnowledgeDocuments(payload.knowledgeDocuments);
    updateCloudStatus("已拉取");
    bridge.showToast("云端项目已拉取，页面将重新载入");
    window.setTimeout(() => window.location.reload(), 400);
  }

  async function compressedShareToken(value) {
    const bytes = new TextEncoder().encode(JSON.stringify(value));
    if (typeof CompressionStream !== "function") {
      return `plain.${base64FromBytes(bytes).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")}`;
    }
    const stream = new Blob([bytes]).stream().pipeThrough(new CompressionStream("gzip"));
    const compressed = new Uint8Array(await new Response(stream).arrayBuffer());
    const encoded = base64FromBytes(compressed).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    return `gz.${encoded}`;
  }

  async function makeShareLink() {
    research.readProjectForm();
    research.saveProject();
    const token = await compressedShareToken({
      exportedAt: new Date().toISOString(),
      project: research.getProject(),
      knowledgeMetadata: research.getDocuments().map(({ text, sections, metadata, ...rest }) => rest)
    });
    const url = new URL(window.location.href);
    url.hash = `share=${token}`;
    await copyText(url.href);
    bridge.showToast("分享链接已复制；完整 PDF 全文不会放入链接");
  }

  async function restoreShareLink() {
    const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const token = hash.get("share");
    if (!token) return;
    try {
      let text;
      if (token.startsWith("plain.")) {
        const decoded = token.slice(6).replace(/-/g, "+").replace(/_/g, "/");
        text = new TextDecoder().decode(bytesFromBase64(decoded));
      } else if (token.startsWith("gz.") && typeof DecompressionStream === "function") {
        const encoded = token.slice(3).replace(/-/g, "+").replace(/_/g, "/");
        const stream = new Blob([bytesFromBase64(encoded)]).stream().pipeThrough(new DecompressionStream("gzip"));
        text = await new Response(stream).text();
      }
      if (!text) return;
      const payload = JSON.parse(text);
      if (payload.project && window.confirm("检测到项目分享链接。是否导入并替换当前项目？")) {
        localStorage.setItem(PROJECT_STORAGE_KEY, JSON.stringify(payload.project));
        history.replaceState(null, "", `${location.pathname}${location.search}`);
        bridge.showToast("分享项目已导入，正在载入");
        window.setTimeout(() => location.reload(), 350);
      }
    } catch {
      bridge.showToast("分享链接无法解析或已经损坏");
    }
  }

  /* Literature import, structure and semantic search */
  function extractTextStructure(text) {
    const source = String(text || "");
    const headingPattern = /(^|\n)\s*(摘要|abstract|引言|introduction|相关工作|related work|方法|methods?|材料与方法|结果|results?|讨论|discussion|结论|conclusions?|参考文献|references)\s*[:：]?\s*(?=\n|$)/gi;
    const headings = [];
    let match;
    while ((match = headingPattern.exec(source))) {
      headings.push({
        title: match[2].trim(),
        start: match.index + match[1].length
      });
    }
    const baseSections = headings.length
      ? headings.map((heading, index) => {
      const end = Math.min(index + 1 < headings.length ? headings[index + 1].start : source.length, heading.start + 1600);
      return {
        title: heading.title,
        start: heading.start,
        end,
        excerpt: source.slice(heading.start, end).replace(/\s+/g, " ").trim()
      };
      })
      : source.length > 500
        ? [{ title: "正文", start: 0, end: Math.min(500, source.length), excerpt: source.slice(0, 500) }]
        : [];
    const lines = source.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
    const tableLines = lines.filter((line) => (line.match(/\t|\|/g) || []).length >= 2);
    const equationLines = lines.filter((line) =>
      /[=≈≤≥±√∑∫]|\b(?:R\^?2|SNR|RMSE|FWHM)\b/i.test(line) && line.length < 240
    );
    if (tableLines.length) {
      baseSections.push({
        title: `表格线索（${tableLines.length} 行）`,
        start: 0,
        end: 0,
        excerpt: tableLines.slice(0, 8).join("\n").slice(0, 900)
      });
    }
    if (equationLines.length) {
      baseSections.push({
        title: `公式线索（${equationLines.length} 行）`,
        start: 0,
        end: 0,
        excerpt: equationLines.slice(0, 12).join("\n").slice(0, 900)
      });
    }
    return baseSections;
  }

  function textFeatures(text) {
    const features = new Map();
    const source = String(text || "").toLowerCase();
    (source.match(/[a-z][a-z0-9-]{2,}/g) || []).forEach((token) => {
      features.set(token, (features.get(token) || 0) + 1);
    });
    const chinese = source.replace(/[a-z0-9\s\p{P}]/gu, "");
    for (let index = 0; index < chinese.length - 1; index += 1) {
      const gram = chinese.slice(index, index + 2);
      features.set(gram, (features.get(gram) || 0) + 1);
    }
    return features;
  }

  function knowledgeSimilarity(query, text) {
    const left = textFeatures(query);
    const right = textFeatures(text);
    if (!left.size || !right.size) return 0;
    let dot = 0;
    let leftNorm = 0;
    let rightNorm = 0;
    left.forEach((value, key) => {
      dot += value * (right.get(key) || 0);
      leftNorm += value ** 2;
    });
    right.forEach((value) => {
      rightNorm += value ** 2;
    });
    return (dot / Math.max(1e-12, Math.sqrt(leftNorm * rightNorm))) * 24;
  }

  function parseBibtex(text) {
    const records = [];
    const entries = text.match(/@\w+\s*\{[\s\S]*?\n\}/g) || [];
    entries.forEach((entry) => {
      const title = entry.match(/\btitle\s*=\s*[{"]([\s\S]*?)[}"]\s*,?/i)?.[1] || "";
      const authors = entry.match(/\bauthor\s*=\s*[{"]([\s\S]*?)[}"]\s*,?/i)?.[1] || "";
      const journal = entry.match(/\b(?:journal|booktitle)\s*=\s*[{"]([\s\S]*?)[}"]\s*,?/i)?.[1] || "";
      const year = entry.match(/\byear\s*=\s*[{"]?(\d{4})/i)?.[1] || "";
      const doi = entry.match(/\bdoi\s*=\s*[{"]([\s\S]*?)[}"]\s*,?/i)?.[1] || "";
      const abstract = entry.match(/\babstract\s*=\s*[{"]([\s\S]*?)[}"]\s*,?/i)?.[1] || "";
      if (title) {
        records.push({
          title: title.replace(/[{}]/g, "").trim(),
          authors: authors.split(/\s+and\s+/).map((item) => item.replace(/[{}]/g, "").trim()).filter(Boolean),
          journal: journal.replace(/[{}]/g, "").trim(),
          year,
          doi: doi.trim(),
          abstract: abstract.replace(/[{}]/g, "").trim()
        });
      }
    });
    return records;
  }

  function parseRis(text) {
    return text.split(/^ER\s*-\s*$/m).map((block) => {
      const fields = {};
      block.split(/\r?\n/).forEach((line) => {
        const match = line.match(/^([A-Z0-9]{2})\s*-\s*(.*)$/);
        if (!match) return;
        if (!fields[match[1]]) fields[match[1]] = [];
        fields[match[1]].push(match[2].trim());
      });
      const title = fields.TI?.[0] || fields.T1?.[0] || "";
      if (!title) return null;
      return {
        title,
        authors: [...(fields.AU || []), ...(fields.A1 || [])],
        journal: fields.T2?.[0] || fields.JO?.[0] || fields.JF?.[0] || "",
        year: (fields.PY?.[0] || fields.Y1?.[0] || "").match(/\d{4}/)?.[0] || "",
        doi: fields.DO?.[0] || "",
        abstract: fields.AB?.[0] || ""
      };
    }).filter(Boolean);
  }

  function parseCitationJson(text) {
    const parsed = JSON.parse(text);
    const values = Array.isArray(parsed) ? parsed : parsed.items || parsed.references || [parsed];
    return values.map((item) => {
      const data = item.data || item;
      const creators = data.creators || data.author || [];
      return {
        title: data.title || data.name || "",
        authors: Array.isArray(creators)
          ? creators.map((author) => author.name || [author.given, author.family].filter(Boolean).join(" ") || author.literal || "").filter(Boolean)
          : String(creators || "").split(/,| and /).map((itemValue) => itemValue.trim()).filter(Boolean),
        journal: data["publicationTitle"] || data.journal || data.containerTitle || "",
        year: String(data.date || data.year || data.issued?.["date-parts"]?.[0]?.[0] || "").match(/\d{4}/)?.[0] || "",
        doi: data.DOI || data.doi || "",
        abstract: data.abstractNote || data.abstract || ""
      };
    }).filter((item) => item.title);
  }

  function normalizeImportedCitation(item, source) {
    const doi = String(item.doi || "").replace(/^https?:\/\/doi\.org\//i, "").trim();
    return {
      id: doi ? `doi:${doi.toLowerCase()}` : `import:${item.title.toLowerCase()}|${item.year || ""}`,
      source,
      title: item.title,
      authors: Array.isArray(item.authors) ? item.authors : [],
      journal: item.journal || "未标注期刊",
      year: item.year || "",
      doi,
      citations: 0,
      abstract: item.abstract || "",
      type: "article",
      url: doi ? `https://doi.org/${doi}` : ""
    };
  }

  async function importCitationFiles(files) {
    let imported = 0;
    const incoming = [];
    for (const file of files) {
      try {
        const text = await file.text();
        let records = [];
        if (/\.bib$/i.test(file.name)) records = parseBibtex(text);
        else if (/\.ris$/i.test(file.name)) records = parseRis(text);
        else records = parseCitationJson(text);
        incoming.push(...records.map((item) => normalizeImportedCitation(item, `导入 · ${file.name}`)));
      } catch (error) {
        bridge.showToast(`${file.name}：${error.message}`);
      }
    }
    let existing = [];
    try {
      existing = JSON.parse(localStorage.getItem(CITATION_STORAGE_KEY) || "[]");
    } catch {
      existing = [];
    }
    const seen = new Set(existing.map((item) => item.doi ? `doi:${item.doi.toLowerCase()}` : item.title.toLowerCase()));
    incoming.forEach((item) => {
      const key = item.doi ? `doi:${item.doi.toLowerCase()}` : item.title.toLowerCase();
      if (seen.has(key)) return;
      seen.add(key);
      existing.push(item);
      imported += 1;
    });
    localStorage.setItem(CITATION_STORAGE_KEY, JSON.stringify(existing));
    window.ResearchStudio?.reloadCitations?.();
    bridge.showToast(`导入了 ${imported} 条题录`);
  }

  /* Units */
  function detectUnit(text) {
    const source = String(text || "");
    for (const [dimension, group] of Object.entries(UNIT_GROUPS)) {
      const aliases = Object.keys(group.units).sort((a, b) => b.length - a.length);
      for (const alias of aliases) {
        const escaped = alias.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        if (new RegExp(`(^|[^A-Za-z])${escaped}([^A-Za-z]|$)`, "i").test(source)) {
          return { dimension, unit: alias, base: group.base, factorToBase: group.units[alias] };
        }
      }
    }
    return null;
  }

  function syncUnitControls() {
    const report = research.getSelectedReport();
    if (!report) {
      $("#research-unit-diagnostic").textContent = "等待实验报告";
      return;
    }
    const settings = research.getProject().unitSettings || {};
    const experiment = window.LAB_EXPERIMENTS.find((item) => item.id === report.experimentId);
    const xDetected = detectUnit(report.xHeader);
    const yDetected = detectUnit(report.yHeader);
    const expectedX = detectUnit(experiment?.primaryUnit || experiment?.primaryLabel || "");
    const expectedY = detectUnit(experiment?.yLabel || "");
    const messages = [];
    if (xDetected && expectedX) {
      messages.push(xDetected.dimension === expectedX.dimension
        ? `横轴 ${xDetected.unit} 与实验建议量纲一致`
        : `横轴 ${xDetected.unit} 与实验建议的 ${expectedX.unit} 量纲不同`);
    }
    if (yDetected && expectedY) {
      messages.push(yDetected.dimension === expectedY.dimension
        ? `纵轴 ${yDetected.unit} 与实验响应量纲一致`
        : `纵轴 ${yDetected.unit} 与实验响应的 ${expectedY.unit} 量纲不同`);
    }
    if (!xDetected && !yDetected) messages.push("表头没有识别到常见单位，请手动填写并确认换算系数。");
    $("#research-unit-diagnostic").textContent = messages.join("；");
    if (!settings.xUnit) $("#research-x-unit").value = xDetected?.unit || "";
    else $("#research-x-unit").value = settings.xUnit;
    if (!settings.yUnit) $("#research-y-unit").value = yDetected?.unit || "";
    else $("#research-y-unit").value = settings.yUnit;
    $("#research-x-factor").value = settings.xFactor ?? 1;
    $("#research-y-factor").value = settings.yFactor ?? 1;
  }

  function applyUnitSettings() {
    const project = research.getProject();
    project.unitSettings = {
      xUnit: $("#research-x-unit").value.trim(),
      yUnit: $("#research-y-unit").value.trim(),
      xFactor: Number($("#research-x-factor").value) || 1,
      yFactor: Number($("#research-y-factor").value) || 1
    };
    research.saveProject();
    research.refreshAnalysis();
    bridge.showToast("单位和换算系数已应用");
  }

  /* Uncertainty budget */
  function newBudgetRow(name, type, value, autoKey = "") {
    return {
      id: crypto.randomUUID ? crypto.randomUUID() : `U-${Date.now()}-${Math.random()}`,
      name,
      type,
      value: Math.max(0, Number(value) || 0),
      autoKey
    };
  }

  function initializeBudget(analysis) {
    const project = research.getProject();
    if (!analysis) return;
    if (!Array.isArray(project.uncertaintyBudget) || project.uncertaintyBudgetReportId !== analysis.reportId) {
      project.uncertaintyBudgetReportId = analysis.reportId;
      project.uncertaintyBudget = [
        newBudgetRow("重复测量（A 类）", "A 类", analysis.ua, "repeat"),
        newBudgetRow("仪器分辨率（B 类）", "B 类", analysis.ub, "resolution"),
        newBudgetRow("环境漂移 / 估读", "B 类", 0, "environment")
      ];
      research.saveProject();
    } else {
      project.uncertaintyBudget.forEach((row) => {
        if (row.autoKey === "resolution" && row.value === 0 && analysis.ub > 0) row.value = analysis.ub;
      });
    }
    renderUncertaintyBudget(analysis);
  }

  function combinedBudget(rows) {
    return Math.sqrt(rows.reduce((total, row) => total + (Number(row.value) || 0) ** 2, 0));
  }

  function renderUncertaintyBudget(analysis = research.getAnalysis()) {
    const project = research.getProject();
    const rows = project.uncertaintyBudget || [];
    const body = $("#uncertainty-budget-body");
    if (!analysis || !rows.length) {
      body.innerHTML = `<tr><td colspan="5">等待实验报告</td></tr>`;
      $("#budget-combined").textContent = "—";
      $("#budget-expanded").textContent = "—";
      drawBudgetChart();
      return;
    }
    const combined = combinedBudget(rows);
    body.innerHTML = rows.map((row) => {
      const contribution = combined > 0 ? (row.value ** 2 / combined ** 2) * 100 : 0;
      return `<tr data-budget-row="${escapeHtml(row.id)}">
        <td><input data-budget-field="name" value="${escapeHtml(row.name)}"></td>
        <td><select data-budget-field="type"><option${row.type === "A 类" ? " selected" : ""}>A 类</option><option${row.type === "B 类" ? " selected" : ""}>B 类</option></select></td>
        <td><input data-budget-field="value" type="number" min="0" step="any" value="${row.value}"></td>
        <td>${formatNumber(contribution, 1)}%</td>
        <td><button type="button" data-delete-budget="${escapeHtml(row.id)}">删除</button></td>
      </tr>`;
    }).join("");
    const unit = analysis.yHeader ? ` ${analysis.yHeader}` : "";
    $("#budget-combined").textContent = `${formatNumber(combined, 5)}${unit}`;
    $("#budget-expanded").textContent = `${formatNumber(combined * 1.96, 5)}${unit}`;
    drawBudgetChart();
  }

  function drawBudgetChart() {
    const canvas = $("#uncertainty-contribution-chart");
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const ratio = Math.max(1, devicePixelRatio || 1);
    canvas.width = rect.width * ratio;
    canvas.height = rect.height * ratio;
    const context = canvas.getContext("2d");
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    context.clearRect(0, 0, rect.width, rect.height);
    const rows = research.getProject().uncertaintyBudget || [];
    if (!rows.length) return;
    const combined = combinedBudget(rows);
    const values = rows.map((row) => ({
      name: row.name,
      percent: combined > 0 ? (row.value ** 2 / combined ** 2) * 100 : 0
    })).sort((a, b) => b.percent - a.percent);
    const left = 120;
    const right = 28;
    const top = 18;
    const available = rect.width - left - right;
    context.font = "9px 'Microsoft YaHei UI', sans-serif";
    values.slice(0, 8).forEach((item, index) => {
      const y = top + index * 22;
      context.fillStyle = "#98a29c";
      context.fillText(item.name.slice(0, 16), 5, y + 11);
      context.fillStyle = "rgba(192,154,97,0.14)";
      context.fillRect(left, y, available, 14);
      context.fillStyle = index === 0 ? "#d8b476" : "#8eae99";
      context.fillRect(left, y, available * Math.min(1, item.percent / 100), 14);
      context.fillStyle = "#b9c0ba";
      context.fillText(`${formatNumber(item.percent, 1)}%`, left + available + 4, y + 11);
    });
  }

  /* Cross-experiment comparison */
  function renderComparisonPicker() {
    const reports = bridge.getReports?.() || [];
    const picker = $("#research-comparison-picker");
    if (!reports.length) {
      picker.innerHTML = `<div class="research-empty-state"><strong>还没有实验报告</strong><span>导入数据后可以比较多个实验。</span></div>`;
      return;
    }
    picker.innerHTML = reports.map((report, index) => `
      <label>
        <input type="checkbox" value="${escapeHtml(report.id)}" ${index < 5 ? "checked" : ""}>
        <span>${escapeHtml(report.experimentName)}<small>${escapeHtml(report.id)} · ${report.analysis.n} 点 · 质量 ${report.analysis.qualityScore}</small></span>
      </label>
    `).join("");
  }

  function buildComparison() {
    const selected = $$("#research-comparison-picker input:checked").map((input) => input.value);
    const reports = (bridge.getReports?.() || []).filter((report) => selected.includes(report.id));
    if (!reports.length) {
      bridge.showToast("至少选择一个实验报告");
      return;
    }
    state.comparisonRows = reports.map((report) => ({
      id: report.id,
      experiment: report.experimentName,
      points: report.analysis.n,
      mean: report.analysis.mean,
      standardDeviation: report.analysis.std,
      relativeStandardDeviation: report.analysis.relativeStdPercent,
      quality: report.analysis.qualityScore,
      r2: report.analysis.r2,
      stability: Math.max(0, 100 - Math.min(100, report.analysis.relativeStdPercent * 5)),
      fit: Math.max(0, Math.min(100, report.analysis.r2 * 100))
    }));
    drawComparisonChart();
  }

  function drawComparisonChart() {
    const canvas = $("#research-comparison-chart");
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const ratio = Math.max(1, devicePixelRatio || 1);
    canvas.width = rect.width * ratio;
    canvas.height = rect.height * ratio;
    const context = canvas.getContext("2d");
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    context.clearRect(0, 0, rect.width, rect.height);
    if (!state.comparisonRows.length) return;
    const categories = ["数据质量", "重复稳定性", "线性拟合"];
    const colors = ["#d7b171", "#83ad91", "#839cba"];
    const left = 18;
    const top = 38;
    const bottom = 52;
    const chartHeight = rect.height - top - bottom;
    context.font = "8px 'Microsoft YaHei UI', sans-serif";
    categories.forEach((label, index) => {
      context.fillStyle = colors[index];
      context.fillRect(left + index * 105, 10, 9, 9);
      context.fillStyle = "#9ca59f";
      context.fillText(label, left + index * 105 + 13, 18);
    });
    const groupWidth = (rect.width - left * 2) / state.comparisonRows.length;
    const barWidth = Math.min(18, groupWidth / 5);
    state.comparisonRows.forEach((row, rowIndex) => {
      const x = left + rowIndex * groupWidth + groupWidth / 2;
      [row.quality, row.stability, row.fit].forEach((value, metricIndex) => {
        const height = (value / 100) * chartHeight;
        context.fillStyle = colors[metricIndex];
        context.fillRect(x - barWidth * 1.6 + metricIndex * (barWidth + 2), top + chartHeight - height, barWidth, height);
      });
      context.save();
      context.fillStyle = "#828c86";
      context.translate(x, top + chartHeight + 9);
      context.rotate(-0.32);
      context.fillText(`${row.experiment} · ${row.id.slice(-4)}`, 0, 0);
      context.restore();
    });
  }

  function exportComparisonCsv() {
    if (!state.comparisonRows.length) buildComparison();
    if (!state.comparisonRows.length) return;
    const lines = [
      "报告编号,实验,数据点,均值,标准差,相对标准差%,质量分,R²",
      ...state.comparisonRows.map((row) => [
        row.id, row.experiment, row.points, row.mean, row.standardDeviation,
        row.relativeStandardDeviation, row.quality, row.r2
      ].map((value) => JSON.stringify(value)).join(","))
    ];
    downloadBlob(new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" }), "跨实验比较.csv");
  }

  /* Document, PDF, LaTeX and figure exports */
  function composeProjectMarkdown() {
    const project = research.getProject();
    const report = research.getSelectedReport() || (bridge.getReports?.() || [])[0];
    const paper = $("#paper-preview")?.textContent || "";
    const analysis = research.getAnalysis();
    const budgetRows = project.uncertaintyBudget || [];
    const evidence = (project.evidence || []).map((item, index) =>
      `[K${index + 1}] ${item.documentTitle} ${item.location || ""}：${item.claim}。${item.finding}`
    );
    return [
      `# ${project.title || "OptiLab 科研项目"}`,
      "",
      `项目编号：${project.id}`,
      `项目阶段：${project.stage}`,
      "",
      "## 研究问题",
      project.question || "未填写",
      "",
      "## 研究假设",
      project.hypothesis || "未填写",
      "",
      "## 器材与目标",
      project.equipment || "未填写",
      project.metric || "",
      "",
      "## 实验设计",
      project.design.text || "尚未生成",
      "",
      report ? report.report : "## 当前实验报告\n尚未生成。",
      "",
      paper.includes("论文草稿\n\n1. 先导入实验数据") ? "" : paper,
      "",
      "## 科研统计摘要",
      analysis ? [
        `- 最佳模型：${analysis.best.name}`,
        `- R²：${formatNumber(analysis.best.r2, 5)}`,
        `- RMSE：${formatNumber(analysis.best.rmse, 5)}`,
        `- 近似信噪比：${formatNumber(analysis.snr, 2)} dB`,
        `- 均值合成标准不确定度：${formatNumber(analysis.combinedU, 5)} ${analysis.yHeader}`,
        `- 均值扩展不确定度 U95：${formatNumber(analysis.expandedU, 5)} ${analysis.yHeader}`
      ].join("\n") : "尚未完成统计。",
      "",
      "## 不确定度预算",
      budgetRows.length
        ? budgetRows.map((row) => `- ${row.type}｜${row.name}：${formatNumber(row.value, 6)}`).join("\n")
        : "尚未建立不确定度预算。",
      "",
      "## 文献证据",
      evidence.length ? evidence.join("\n\n") : "暂无证据卡片。",
      "",
      "## 审阅批注",
      project.comments?.length ? project.comments.map((item) => `- ${item.target}｜${item.author}：${item.text}`).join("\n") : "暂无审阅批注。"
    ].join("\n");
  }

  function markdownParagraphs(markdown, docx) {
    return markdown.split(/\r?\n/).map((line) => {
      const text = line.trimEnd();
      if (!text.trim()) return new docx.Paragraph({ text: "" });
      const heading = text.match(/^(#{1,6})\s+(.+)$/);
      if (heading) {
        const level = Math.min(6, heading[1].length);
        const headingLevels = [
          docx.HeadingLevel.HEADING_1, docx.HeadingLevel.HEADING_2, docx.HeadingLevel.HEADING_3,
          docx.HeadingLevel.HEADING_4, docx.HeadingLevel.HEADING_5, docx.HeadingLevel.HEADING_6
        ];
        return new docx.Paragraph({ text: heading[2], heading: headingLevels[level - 1] });
      }
      if (/^[-*]\s+/.test(text)) {
        return new docx.Paragraph({
          text: text.replace(/^[-*]\s+/, ""),
          bullet: { level: 0 }
        });
      }
      if (/^\d+\.\s+/.test(text)) {
        return new docx.Paragraph({
          text: text.replace(/^\d+\.\s+/, ""),
          numbering: { reference: "research-numbering", level: 0 }
        });
      }
      return new docx.Paragraph({
        children: [new docx.TextRun({ text, font: "Microsoft YaHei", size: 21 })]
      });
    });
  }

  async function exportDocx() {
    const button = $("#export-research-docx");
    button.disabled = true;
    button.textContent = "正在生成…";
    try {
      const docx = await loadScript("./vendor/docx/docx.iife.js", "docx");
      const markdown = composeProjectMarkdown();
      const documentFile = new docx.Document({
        numbering: {
          config: [{ reference: "research-numbering", levels: [{ level: 0, format: "decimal", text: "%1.", alignment: "left" }] }]
        },
        sections: [{
          properties: { page: { margin: { top: 900, right: 900, bottom: 900, left: 900 } } },
          children: markdownParagraphs(markdown, docx)
        }]
      });
      downloadBlob(await docx.Packer.toBlob(documentFile), `${safeFileName(research.getProject().title || "OptiLab科研项目")}.docx`);
      bridge.showToast("Word 文档已生成");
    } catch (error) {
      bridge.showToast(`Word 导出失败：${error.message}`);
    } finally {
      button.disabled = false;
      button.textContent = "导出 Word";
    }
  }

  function exportPrintPdf() {
    const markdown = composeProjectMarkdown();
    const html = `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><title>${escapeHtml(research.getProject().title || "OptiLab科研项目")}</title>
      <style>
      @page{size:A4;margin:18mm}
      body{font-family:"Microsoft YaHei","PingFang SC",sans-serif;color:#222;line-height:1.75;font-size:11pt}
      h1{font-size:22pt;margin:0 0 18pt}h2{font-size:15pt;margin:22pt 0 8pt;border-bottom:1px solid #bbb;padding-bottom:4pt}
      h3{font-size:12pt;margin:14pt 0 6pt}p{margin:6pt 0}pre{white-space:pre-wrap;font-family:inherit}
      .print-note{font-size:9pt;color:#666;margin-bottom:16pt}
      .print-toolbar{position:sticky;top:0;padding:12px 0;background:#fff;border-bottom:1px solid #ddd}
      .print-toolbar button{padding:10px 18px;border:0;border-radius:8px;background:#1e2d2b;color:#fff;font-size:11pt;cursor:pointer}
      @media print{.print-toolbar{display:none}.print-note{display:none}}
      </style></head><body><div class="print-toolbar"><button onclick="window.print()">打印 / 另存为 PDF</button></div>
      <div class="print-note">在打印对话框中选择“另存为 PDF”。图表可在 OptiLab 统计页单独导出高清 PNG/SVG。</div>
      <pre>${escapeHtml(markdown)}</pre></body></html>`;
    const printWindow = window.open("", "_blank", "width=1000,height=900");
    if (!printWindow) {
      bridge.showToast("浏览器阻止了打印窗口，请允许弹窗");
      return;
    }
    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
  }

  function latexEscape(text) {
    return String(text || "")
      .replace(/\\/g, "\\textbackslash{}")
      .replace(/([#$%&_{}])/g, "\\$1")
      .replace(/\^/g, "\\textasciicircum{}")
      .replace(/~/g, "\\textasciitilde{}")
      .replace(/\*\*(.+?)\*\*/g, "\\textbf{$1}");
  }

  function exportLatex() {
    const markdown = composeProjectMarkdown();
    const lines = markdown.split(/\r?\n/).map((line) => {
      const heading = line.match(/^(#{1,4})\s+(.+)$/);
      if (heading) {
        const commands = ["section", "subsection", "subsubsection", "paragraph"];
        return `\\${commands[Math.min(3, heading[1].length - 1)]}{${latexEscape(heading[2])}}`;
      }
      if (/^[-*]\s+/.test(line)) return `\\item ${latexEscape(line.replace(/^[-*]\s+/, ""))}`;
      if (/^\d+\.\s+/.test(line)) return `\\item ${latexEscape(line.replace(/^\d+\.\s+/, ""))}`;
      return latexEscape(line);
    });
    const tex = `\\documentclass[UTF8,a4paper,12pt]{ctexart}
\\usepackage[margin=2.3cm]{geometry}
\\usepackage{amsmath,booktabs,graphicx,hyperref}
\\title{${latexEscape(research.getProject().title || "OptiLab科研项目")}}
\\author{OptiLab 科研项目工作台}
\\begin{document}
\\maketitle
${lines.join("\n\n")}
\\end{document}
`;
    downloadBlob(new Blob([tex], { type: "text/x-tex;charset=utf-8" }), `${safeFileName(research.getProject().title || "OptiLab科研项目")}.tex`);
    bridge.showToast("LaTeX 文件已生成");
  }

  function exportBibtex() {
    let citations = [];
    try {
      citations = JSON.parse(localStorage.getItem(CITATION_STORAGE_KEY) || "[]");
    } catch {
      citations = [];
    }
    if (!citations.length) {
      bridge.showToast("引用库为空");
      return;
    }
    const entries = citations.map((item, index) => {
      const key = `ref${index + 1}_${String(item.year || "nd")}_${String(item.authors?.[0] || "anon").split(/\s+/).pop()}`.replace(/[^A-Za-z0-9_]/g, "");
      return `@article{${key},
  title = {${item.title || ""}},
  author = {${(item.authors || []).join(" and ")}},
  journal = {${item.journal || ""}},
  year = {${item.year || ""}},
  doi = {${item.doi || ""}}
}`;
    }).join("\n\n");
    downloadBlob(new Blob([entries], { type: "application/x-bibtex;charset=utf-8" }), "references.bib");
  }

  function exportFigure(format) {
    const analysis = research.getAnalysis();
    const source = $("#research-fit-chart");
    if (!analysis || !source) {
      bridge.showToast("还没有可导出的拟合图");
      return;
    }
    if (format === "png") {
      const canvas = document.createElement("canvas");
      canvas.width = 2400;
      canvas.height = 1400;
      const context = canvas.getContext("2d");
      context.fillStyle = "#0d1214";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.imageSmoothingEnabled = true;
      context.drawImage(source, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => downloadBlob(blob, "OptiLab拟合图_2400x1400.png"), "image/png");
    } else {
      const points = analysis.points;
      const width = 1000;
      const height = 600;
      const pad = { left: 80, right: 35, top: 35, bottom: 65 };
      const xMin = Math.min(...points.map((point) => point.x));
      const xMax = Math.max(...points.map((point) => point.x));
      const predictions = points.map((point) => analysis.best.predict(point.x));
      const yMin = Math.min(...points.map((point) => point.y), ...predictions);
      const yMax = Math.max(...points.map((point) => point.y), ...predictions);
      const mapX = (x) => pad.left + ((x - xMin) / (xMax - xMin || 1)) * (width - pad.left - pad.right);
      const mapY = (y) => pad.top + (1 - (y - yMin) / (yMax - yMin || 1)) * (height - pad.top - pad.bottom);
      const polyline = points.map((point) => `${mapX(point.x).toFixed(1)},${mapY(analysis.best.predict(point.x)).toFixed(1)}`).join(" ");
      const circles = points.map((point) => `<circle cx="${mapX(point.x).toFixed(1)}" cy="${mapY(point.y).toFixed(1)}" r="4" fill="#96b9a1"/>`).join("");
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
        <rect width="100%" height="100%" fill="#0d1214"/>
        <line x1="${pad.left}" y1="${height - pad.bottom}" x2="${width - pad.right}" y2="${height - pad.bottom}" stroke="#718078"/>
        <line x1="${pad.left}" y1="${pad.top}" x2="${pad.left}" y2="${height - pad.bottom}" stroke="#718078"/>
        <polyline points="${polyline}" fill="none" stroke="#d8b476" stroke-width="3"/>
        ${circles}
        <text x="${width / 2}" y="${height - 16}" fill="#a3ada7" text-anchor="middle" font-size="16">${escapeHtml(analysis.xHeader)}</text>
        <text x="20" y="${height / 2}" fill="#a3ada7" text-anchor="middle" font-size="16" transform="rotate(-90 20 ${height / 2})">${escapeHtml(analysis.yHeader)}</text>
        <text x="${pad.left}" y="22" fill="#c5b18b" font-size="15">${escapeHtml(analysis.best.name)} · R²=${formatNumber(analysis.best.r2, 5)}</text>
      </svg>`;
      downloadBlob(new Blob([svg], { type: "image/svg+xml;charset=utf-8" }), "OptiLab拟合图.svg");
    }
  }

  /* OCR */
  async function ocrPdfFile(file) {
    bridge.showToast("正在加载 OCR 组件");
    const Tesseract = await loadScript("./vendor/tesseract/tesseract.min.js", "Tesseract");
    const pdfjs = await import(new URL("./vendor/pdfjs/pdf.min.mjs", document.baseURI).href);
    pdfjs.GlobalWorkerOptions.workerSrc = new URL("./vendor/pdfjs/pdf.worker.min.mjs", document.baseURI).href;
    const pdf = await pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
    const worker = await Tesseract.createWorker("eng+chi_sim", 1, {
      workerPath: new URL("./vendor/tesseract/worker.min.js", document.baseURI).href,
      corePath: new URL("./vendor/tesseract/core/tesseract-core-simd-lstm.wasm.js", document.baseURI).href,
      langPath: new URL("./vendor/tesseract/lang", document.baseURI).href,
      gzip: false,
      logger: (message) => {
        if (message.status === "recognizing text") {
          $("#research-save-state").textContent = `OCR ${Math.round((message.progress || 0) * 100)}%`;
        }
      }
    });
    const sections = [];
    try {
      for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
        const page = await pdf.getPage(pageNumber);
        const viewport = page.getViewport({ scale: 1.5 });
        const canvas = document.createElement("canvas");
        canvas.width = Math.ceil(viewport.width);
        canvas.height = Math.ceil(viewport.height);
        await page.render({ canvasContext: canvas.getContext("2d"), viewport }).promise;
        const result = await worker.recognize(canvas);
        const text = result.data.text.trim();
        if (text) sections.push(`[第 ${pageNumber} 页 OCR]\n${text}`);
      }
    } finally {
      await worker.terminate();
    }
    return {
      text: sections.join("\n\n"),
      sections,
      pageCount: pdf.numPages,
      metadata: { Title: file.name.replace(/\.pdf$/i, ""), OCR: true }
    };
  }

  /* Web Serial instrument acquisition */
  function serialStatus(text) {
    $("#serial-status").textContent = text;
  }

  function serialDelimiter() {
    const value = $("#serial-delimiter").value;
    return value === "\\t" ? "\t" : value;
  }

  function parseSerialLine(line) {
    const numbers = (line.match(/[-+]?(?:\d+\.?\d*|\.\d+)(?:[eE][-+]?\d+)?/g) || [])
      .map(Number)
      .filter(Number.isFinite);
    if (!numbers.length) return null;
    const x = numbers.length >= 2 ? numbers[0] : state.serialSamples.length;
    const y = numbers.length >= 2 ? numbers[1] : numbers[0];
    return { x, y, raw: line };
  }

  function appendSerialSample(sample) {
    state.serialSamples.push(sample);
    $("#serial-sample-count").textContent = String(state.serialSamples.length);
    $("#serial-runtime").textContent = `${((performance.now() - state.serialStart) / 1000).toFixed(1)} s`;
    $("#serial-latest").textContent = `${formatNumber(sample.x, 4)}, ${formatNumber(sample.y, 4)}`;
    const log = $("#research-serial-log");
    if (log.querySelector(".research-empty-state")) log.innerHTML = "";
    const row = document.createElement("div");
    row.className = "serial-log-row";
    row.innerHTML = `<time>${state.serialSamples.length}</time><span>${escapeHtml(sample.raw || `${sample.x},${sample.y}`)}</span>`;
    log.prepend(row);
    while (log.children.length > 30) log.lastElementChild.remove();
    drawSerialChart();
    $("#serial-send-analysis").disabled = state.serialSamples.length < 2;
    $("#serial-download").disabled = state.serialSamples.length < 2;
  }

  function drawSerialChart() {
    const canvas = $("#serial-live-chart");
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const ratio = Math.max(1, devicePixelRatio || 1);
    canvas.width = rect.width * ratio;
    canvas.height = rect.height * ratio;
    const context = canvas.getContext("2d");
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    context.clearRect(0, 0, rect.width, rect.height);
    context.strokeStyle = "rgba(200,220,208,0.08)";
    for (let index = 0; index < 5; index += 1) {
      const y = 24 + ((rect.height - 52) * index) / 4;
      context.beginPath();
      context.moveTo(48, y);
      context.lineTo(rect.width - 15, y);
      context.stroke();
    }
    const samples = state.serialSamples.slice(-500);
    if (samples.length < 2) return;
    const xMin = Math.min(...samples.map((item) => item.x));
    const xMax = Math.max(...samples.map((item) => item.x));
    const yMin = Math.min(...samples.map((item) => item.y));
    const yMax = Math.max(...samples.map((item) => item.y));
    const mapX = (x) => 48 + ((x - xMin) / (xMax - xMin || 1)) * (rect.width - 64);
    const mapY = (y) => 24 + (1 - (y - yMin) / (yMax - yMin || 1)) * (rect.height - 54);
    context.strokeStyle = "#d4ae70";
    context.lineWidth = 1.5;
    context.beginPath();
    samples.forEach((sample, index) => {
      const x = mapX(sample.x);
      const y = mapY(sample.y);
      if (index === 0) context.moveTo(x, y);
      else context.lineTo(x, y);
    });
    context.stroke();
    context.fillStyle = "#87948d";
    context.font = "9px 'Microsoft YaHei UI', sans-serif";
    context.fillText(`${formatNumber(yMin, 3)} — ${formatNumber(yMax, 3)}`, 5, 18);
  }

  async function connectSerial() {
    if (!("serial" in navigator)) {
      bridge.showToast("当前浏览器不支持 Web Serial，请使用 Chrome 或 Edge");
      return;
    }
    try {
      if (!state.serialPort) {
        state.serialPort = await navigator.serial.requestPort();
      }
      if (!state.serialPort.readable) {
        await state.serialPort.open({ baudRate: Number($("#serial-baud").value) });
      }
      serialStatus("已连接");
      $("#serial-start").disabled = false;
      bridge.showToast("串口已连接");
    } catch (error) {
      if (error.name !== "NotFoundError") bridge.showToast(`串口连接失败：${error.message}`);
    }
  }

  async function startSerial() {
    if (state.serialCollecting) return;
    state.serialCollecting = true;
    state.serialSamples = [];
    state.serialStart = performance.now();
    $("#serial-start").disabled = true;
    $("#serial-stop").disabled = false;
    serialStatus("采集中");
    try {
      if (state.serialPort?.writable) {
        const command = $("#serial-command").value.trim();
        if (command) {
          const writer = state.serialPort.writable.getWriter();
          await writer.write(new TextEncoder().encode(`${command}\n`));
          writer.releaseLock();
        }
        const decoder = new TextDecoder();
        let buffer = "";
        state.serialReader = state.serialPort.readable.getReader();
        const duration = Math.max(1, Number($("#serial-duration").value) || 30) * 1000;
        state.serialTimer = window.setTimeout(stopSerial, duration);
        while (state.serialCollecting) {
          const { value, done } = await state.serialReader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split(/\r?\n/);
          buffer = lines.pop() || "";
          lines.forEach((line) => {
            const sample = parseSerialLine(line);
            if (sample) appendSerialSample(sample);
          });
        }
      } else {
        startSerialDemo();
      }
    } catch (error) {
      bridge.showToast(`采集停止：${error.message}`);
      state.serialCollecting = false;
    }
  }

  function stopSerial() {
    state.serialCollecting = false;
    window.clearTimeout(state.serialTimer);
    window.clearInterval(state.serialDemoTimer);
    state.serialDemoTimer = null;
    state.serialReader?.cancel().catch(() => {});
    state.serialReader = null;
    $("#serial-start").disabled = !state.serialPort;
    $("#serial-stop").disabled = true;
    serialStatus(state.serialPort ? "已连接" : "已停止");
  }

  function startSerialDemo() {
    window.clearInterval(state.serialDemoTimer);
    state.serialStart = performance.now();
    state.serialSamples = [];
    let index = 0;
    state.serialDemoTimer = window.setInterval(() => {
      const x = index / 10;
      const y = 2.5 + Math.sin(index / 8) * 0.8 + (Math.random() - 0.5) * 0.045;
      appendSerialSample({ x, y, raw: `${x.toFixed(2)},${y.toFixed(5)}` });
      index += 1;
      if (index > 299) stopSerial();
    }, 80);
    $("#serial-start").disabled = true;
    $("#serial-stop").disabled = false;
    serialStatus("模拟采集中");
  }

  function instrumentCsv() {
    const fields = $("#serial-fields").value.split(",").map((item) => item.trim()).filter(Boolean);
    const headers = fields.length >= 2 ? fields.slice(0, 2) : ["X值", "Y均值"];
    return [
      headers.map((item) => JSON.stringify(item)).join(","),
      ...state.serialSamples.map((sample) => `${sample.x},${sample.y}`)
    ].join("\n");
  }

  function sendInstrumentData() {
    if (state.serialSamples.length < 2) return;
    bridge.loadExternalData(instrumentCsv(), `仪器直采 ${new Date().toLocaleTimeString("zh-CN")}`);
    document.getElementById("data-section").scrollIntoView({ behavior: "smooth", block: "start" });
    bridge.showToast("仪器数据已送入数据分析");
  }

  function downloadInstrumentCsv() {
    if (state.serialSamples.length < 2) return;
    downloadBlob(new Blob([instrumentCsv()], { type: "text/csv;charset=utf-8" }), "仪器直采数据.csv");
  }

  /* Event wiring */
  function setupAiEvents() {
    $("#ai-save-config").addEventListener("click", saveAiConfig);
    $("#ai-test-service").addEventListener("click", testAiService);
    $("#ai-generate-review").addEventListener("click", aiReviewProject);
    ["#ai-endpoint", "#ai-model"].forEach((selector) => $(selector).addEventListener("input", updateAiStatus));
  }

  function setupCloudEvents() {
    $("#cloud-save-config").addEventListener("click", saveCloudConfig);
    $("#cloud-push").addEventListener("click", () => pushCloudProject().catch((error) => bridge.showToast(error.message)));
    $("#cloud-pull").addEventListener("click", () => pullCloudProject().catch((error) => bridge.showToast(error.message)));
    $("#cloud-share-link").addEventListener("click", () => makeShareLink().catch((error) => bridge.showToast(error.message)));
  }

  function setupLiteratureEvents() {
    $("#research-citation-file").addEventListener("change", (event) => {
      const files = [...(event.target.files || [])];
      event.target.value = "";
      importCitationFiles(files);
    });
  }

  function setupAnalysisEvents() {
    $("#apply-research-units").addEventListener("click", applyUnitSettings);
    $$(".export-figure-button").forEach((button) => {
      button.addEventListener("click", () => exportFigure(button.dataset.figureFormat));
    });
    $("#add-uncertainty-row").addEventListener("click", () => {
      const project = research.getProject();
      project.uncertaintyBudget = project.uncertaintyBudget || [];
      project.uncertaintyBudget.push(newBudgetRow("新增误差来源", "B 类", 0));
      research.saveProject();
      renderUncertaintyBudget();
    });
    $("#uncertainty-budget-body").addEventListener("input", (event) => {
      const rowElement = event.target.closest("[data-budget-row]");
      if (!rowElement) return;
      const row = research.getProject().uncertaintyBudget?.find((item) => item.id === rowElement.dataset.budgetRow);
      if (!row) return;
      const field = event.target.dataset.budgetField;
      row[field] = field === "value" ? Math.max(0, Number(event.target.value) || 0) : event.target.value;
      research.saveProject();
      renderUncertaintyBudget();
    });
    $("#uncertainty-budget-body").addEventListener("click", (event) => {
      const id = event.target.dataset.deleteBudget;
      if (!id) return;
      const project = research.getProject();
      project.uncertaintyBudget = project.uncertaintyBudget.filter((row) => row.id !== id);
      research.saveProject();
      renderUncertaintyBudget();
    });
    $("#build-research-comparison").addEventListener("click", buildComparison);
    $("#export-comparison-csv").addEventListener("click", exportComparisonCsv);
    window.addEventListener("optilab:research-analysis-updated", (event) => {
      const analysis = event.detail?.analysis;
      syncUnitControls();
      if (analysis) {
        initializeBudget(analysis);
      } else {
        renderUncertaintyBudget(null);
      }
      renderComparisonPicker();
    });
  }

  function setupExportEvents() {
    $("#export-research-docx").addEventListener("click", exportDocx);
    $("#export-research-pdf").addEventListener("click", exportPrintPdf);
    $("#export-research-latex").addEventListener("click", exportLatex);
    $("#export-research-bibtex").addEventListener("click", exportBibtex);
  }

  function setupInstrumentEvents() {
    $("#serial-connect").addEventListener("click", connectSerial);
    $("#serial-start").addEventListener("click", startSerial);
    $("#serial-stop").addEventListener("click", stopSerial);
    $("#serial-demo").addEventListener("click", () => {
      state.serialCollecting = true;
      serialStatus("模拟采集中");
      $("#serial-start").disabled = true;
      $("#serial-stop").disabled = false;
      startSerialDemo();
    });
    $("#serial-send-analysis").addEventListener("click", sendInstrumentData);
    $("#serial-download").addEventListener("click", downloadInstrumentCsv);
  }

  function onInstrumentTab() {
    requestAnimationFrame(drawSerialChart);
  }

  function onServicesTab() {
    loadAiConfig();
    loadCloudConfig();
  }

  function initialize() {
    if (!bridge || !research) return;
    setupAiEvents();
    setupCloudEvents();
    setupLiteratureEvents();
    setupAnalysisEvents();
    setupExportEvents();
    setupInstrumentEvents();
    loadAiConfig();
    loadCloudConfig();
    renderComparisonPicker();
    renderUncertaintyBudget();
    restoreShareLink();
  }

  window.OptilabAdvanced = {
    extractTextStructure,
    knowledgeSimilarity,
    ocrPdfFile,
    onInstrumentTab,
    onServicesTab,
    exportDocx,
    exportLatex,
    getInstrumentSamples: () => state.serialSamples,
    getComparisonRows: () => state.comparisonRows
  };

  initialize();
})();
