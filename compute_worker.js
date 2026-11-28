"use strict";

importScripts("optilab_physics.js", "simulation_engine.js");

let nextId = 0;
const pending = new Map();

function parseDelimited(text, delimiter = ",") {
  const rows = [];
  let row = [];
  let value = "";
  let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    if (character === '"') {
      if (quoted && text[index + 1] === '"') {
        value += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (character === delimiter && !quoted) {
      row.push(value.trim());
      value = "";
    } else if ((character === "\n" || character === "\r") && !quoted) {
      if (character === "\r" && text[index + 1] === "\n") index += 1;
      row.push(value.trim());
      if (row.some((cell) => cell !== "")) rows.push(row);
      row = [];
      value = "";
    } else {
      value += character;
    }
  }
  row.push(value.trim());
  if (row.some((cell) => cell !== "")) rows.push(row);
  return rows;
}

function parseTable(text) {
  const clean = String(text || "").replace(/^\uFEFF/, "").trim();
  if (!clean) throw new Error("数据内容为空");
  const sample = clean.split(/\r?\n/).slice(0, 10).join("\n");
  const delimiter = [",", ";", "\t"].sort((left, right) =>
    sample.split(right).length - sample.split(left).length
  )[0];
  const rows = parseDelimited(clean, delimiter);
  const headers = rows[0] || [];
  const body = rows.slice(1);
  const numericColumns = [];
  const count = Math.min(...body.map((row) => row.length));
  for (let column = 0; column < count; column += 1) {
    const valid = body.filter((row) => row[column] !== "" && Number.isFinite(Number(row[column]))).length;
    if (valid >= Math.max(2, body.length * 0.6)) numericColumns.push(column);
  }
  return { headers, body, numericColumns, rowCount: body.length };
}

async function parseSpreadsheet(buffer, fileName = "") {
  if (!self.XLSX) importScripts("vendor/xlsx.full.min.js");
  const workbook = self.XLSX.read(buffer, { type: "array", cellDates: true });
  const sheetName = workbook.SheetNames.includes("Data") ? "Data" : workbook.SheetNames[0];
  const matrix = self.XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {
    header: 1,
    raw: true,
    defval: ""
  });
  return {
    text: self.XLSX.utils.sheet_to_csv(self.XLSX.utils.aoa_to_sheet(matrix), { blankrows: false }),
    sheetName,
    fileName,
    rows: Math.max(0, matrix.length - 1)
  };
}

async function zipTextFiles(files, fileName = "optilab.zip") {
  if (!self.JSZip) importScripts("vendor/jszip.min.js");
  const zip = new self.JSZip();
  Object.entries(files || {}).forEach(([name, value]) => zip.file(name, value));
  return {
    fileName,
    buffer: await zip.generateAsync({ type: "arraybuffer", compression: "DEFLATE" })
  };
}

self.onmessage = async (event) => {
  const { id, type, payload = {} } = event.data || {};
  try {
    let result;
    if (type === "uncertainty") {
      result = OptilabSimulation.propagateUncertainty(payload.experiment || {}, payload.primary, payload.secondary, payload.options || {});
    } else if (type === "parseTable") {
      result = parseTable(payload.text);
    } else if (type === "parseSpreadsheet") {
      result = await parseSpreadsheet(payload.buffer, payload.fileName);
    } else if (type === "statistics") {
      const values = (payload.values || []).map(Number).filter(Number.isFinite);
      const mean = values.reduce((total, value) => total + value, 0) / Math.max(1, values.length);
      const variance = values.reduce((total, value) => total + (value - mean) ** 2, 0) / Math.max(1, values.length - 1);
      result = { count: values.length, mean, standardDeviation: Math.sqrt(variance) };
    } else if (type === "zip") {
      result = await zipTextFiles(payload.files, payload.fileName);
    } else {
      throw new Error(`未知后台任务：${type}`);
    }
    const transfer = result?.buffer ? [result.buffer] : [];
    self.postMessage({ id, result }, transfer);
  } catch (error) {
    self.postMessage({ id, error: error.message || String(error) });
  }
};
