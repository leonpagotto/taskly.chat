#!/usr/bin/env node
import { promises as fs } from 'fs';
import path from 'path';

/* Combines tasks.yaml + metrics/tasks-metrics.json into tasks-board.json */

const ROOT = process.cwd();
const MANIFEST_YAML = path.join(ROOT,'tasks.yaml');
const METRICS_FILE = path.join(ROOT,'metrics','tasks-metrics.json');
const OUTPUT = path.join(ROOT,'tasks-board.json');

function parseYAML(yaml) {
  const lines = yaml.split(/\r?\n/);
  const stack = [{}];
  let currentIndent = 0;
  const indentSize = 2;
  let currentArrayKey = null;
  for (let i=0;i<lines.length;i++) {
    const line = lines[i];
    if (!line.trim() || line.trim().startsWith('#')) continue;
    const indent = line.match(/^ */)[0].length;
    while (indent < currentIndent) { stack.pop(); currentIndent -= indentSize; }
    const obj = stack[stack.length-1];
    if (line.trim().startsWith('-')) {
      // array item (object or value)
      const key = currentArrayKey;
      if (!Array.isArray(obj[key])) obj[key] = [];
      const remainder = line.trim().slice(1).trim();
      if (!remainder) { // start nested object
        const newObj = {};
        obj[key].push(newObj);
        stack.push(newObj); currentIndent = indent + indentSize;
      } else {
        obj[key].push(remainder);
      }
      continue;
    }
    const kv = line.trim().match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (kv) {
      const k = kv[1];
      const v = kv[2];
      if (v === '') {
        // could be object or array start
        obj[k] = obj[k] || {};
        stack.push(obj[k]); currentIndent = indent + indentSize; currentArrayKey = null;
      } else if (v === '|' ) {
        // multiline string not needed here
      } else if (v === '[]') {
        obj[k] = [];
      } else if (v.startsWith('[')) {
        obj[k] = v.slice(1,-1).split(',').map(s=>s.trim()).filter(Boolean);
      } else {
        obj[k] = isNaN(Number(v)) ? v : Number(v);
      }
      // track possible upcoming array (if next line starts with '-')
      currentArrayKey = k;
    }
  }
  return stack[0];
}

async function main() {
  const manifestRaw = await fs.readFile(MANIFEST_YAML,'utf8');
  const manifest = parseYAML(manifestRaw);
  let metrics = { metrics: [] };
  try { metrics = JSON.parse(await fs.readFile(METRICS_FILE,'utf8')); } catch {}
  // Index metrics by id for quick merge
  const arr = Array.isArray(manifest.tasks) ? manifest.tasks : [];
  const metricsMap = new Map((metrics.metrics||[]).map(m=>[m.id,m]));
  const enrichedTasks = arr.map(t => {
    const m = metricsMap.get(t.id);
    return {
      ...t,
      durations: m?.durations || null,
      currentStatus: m?.currentStatus || t.status || null,
      currentStatusDurationSeconds: m?.currentStatusDurationSeconds || 0
    };
  });
  const board = {
    generated: new Date().toISOString(),
    pipeline: manifest.pipeline,
    backlog: manifest.stories?.backlog || {},
    tasks: enrichedTasks
  };
  await fs.writeFile(OUTPUT, JSON.stringify(board,null,2)+'\n','utf8');
  console.log('Wrote board data to', OUTPUT);
}

main().catch(err => { console.error(err); process.exit(1); });
