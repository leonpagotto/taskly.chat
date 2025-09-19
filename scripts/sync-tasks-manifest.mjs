#!/usr/bin/env node
import { promises as fs } from 'fs';
import path from 'path';

const STORIES_ROOT = path.resolve(process.cwd(), 'docs/taskly-chat/stories');
const PIPELINE_ROOT = path.resolve(process.cwd(), 'tasks');
const OUTPUT_YAML = path.resolve(process.cwd(), 'tasks.yaml');
const OUTPUT_JSON = path.resolve(process.cwd(), 'tasks.json');

const STATUS_ORDER = ['backlog','todo','in-progress','review','done'];

async function readFileSafe(p) { try { return await fs.readFile(p,'utf8'); } catch { return null; } }

function extractFrontmatter(raw) {
  // Supports either YAML frontmatter between --- delimiters or simple key: value header lines.
  if (raw.startsWith('---')) {
    const end = raw.indexOf('\n---', 3);
    if (end !== -1) {
      const fm = raw.slice(3, end).trim();
      return parseKeyValues(fm.split(/\r?\n/));
    }
  }
  const lines = raw.split(/\r?\n/).slice(0, 30);
  const kv = [];
  for (const l of lines) {
    if (/^\s*$/.test(l)) break;
    if (/^#/.test(l)) continue; // skip markdown titles
    if (/^[A-Za-z0-9_-]+:\s+/.test(l)) kv.push(l);
    if (l.startsWith('## ')) break;
  }
  return parseKeyValues(kv);
}

function parseKeyValues(lines) {
  const map = {};
  for (const line of lines) {
    const m = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (m) map[m[1].toLowerCase()] = m[2].trim();
  }
  return map;
}

async function collectBacklogTasks() {
  const tasks = [];
  const dirs = await fs.readdir(STORIES_ROOT,{withFileTypes:true});
  for (const d of dirs) {
    if (!d.isDirectory()) continue;
    if (!/^\d+-.+/.test(d.name)) continue;
    const storyDir = path.join(STORIES_ROOT, d.name);
    const backlogDir = path.join(storyDir, 'Backlog');
    let entries = [];
    try { entries = await fs.readdir(backlogDir,{withFileTypes:true}); } catch {}
    for (const e of entries) {
      if (!e.isFile() || !e.name.endsWith('.md')) continue;
      const file = path.join(backlogDir, e.name);
      const raw = await readFileSafe(file) || '';
      const meta = extractFrontmatter(raw);
      const id = meta.id || e.name.replace(/\.md$/,'');
      tasks.push({
        id,
        title: meta.title || inferTitle(raw) || id,
        status: 'backlog',
        story: meta.story || d.name,
        file: path.relative(process.cwd(), file),
        assignee: meta.assignee || null,
        priority: meta.priority || undefined
      });
    }
  }
  return tasks;
}

async function collectPipelineTasks() {
  const statuses = ['todo','in-progress','review','done'];
  const tasks = [];
  for (const st of statuses) {
    const dir = path.join(PIPELINE_ROOT, st);
    let entries = [];
    try { entries = await fs.readdir(dir,{withFileTypes:true}); } catch {}
    for (const e of entries) {
      if (!e.isFile() || !e.name.endsWith('.md')) continue;
      const file = path.join(dir, e.name);
      const raw = await readFileSafe(file) || '';
      const meta = extractFrontmatter(raw);
      // Status normalization preference to folder truth
      const id = meta.id || e.name.replace(/\.md$/,'');
      tasks.push({
        id,
        title: meta.title || inferTitle(raw) || id,
        status: st,
        story: meta.story || inferStoryFromContent(meta, raw) || 'unknown',
        file: path.relative(process.cwd(), file),
        assignee: meta.assignee || null,
        priority: meta.priority || undefined
      });
    }
  }
  return tasks;
}

function inferTitle(raw) {
  const line = raw.split(/\r?\n/).find(l => l.startsWith('# Task:'));
  return line ? line.replace('# Task:','').trim() : null;
}

function inferStoryFromContent(meta, raw) {
  if (meta.story) return meta.story;
  const m = raw.match(/Story:\s*([A-Za-z0-9_-]+)/);
  return m ? m[1] : null;
}

function sortTasks(tasks) {
  return tasks.sort((a,b)=>{
    const so = STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status);
    if (so !== 0) return so;
    return a.id.localeCompare(b.id, undefined, { numeric: true, sensitivity: 'base' });
  });
}

function aggregate(tasks) {
  const pipeline = { 'todo':0, 'in-progress':0, 'review':0, 'done':0 };
  const backlogCounts = {};
  for (const t of tasks) {
    if (t.status === 'backlog') {
      backlogCounts[t.story] = (backlogCounts[t.story]||0)+1;
    } else if (pipeline[t.status] !== undefined) {
      pipeline[t.status]++;
    }
  }
  return { pipeline, backlogCounts };
}

function toYAML(obj, indent=0) {
  const pad = '  '.repeat(indent);
  if (Array.isArray(obj)) {
    return obj.map(item => {
      if (item && typeof item === 'object' && !Array.isArray(item)) {
        const lines = Object.entries(item)
          .filter(([,v])=>v!==undefined && v!==null)
          .map(([k,v]) => formatYAMLValue(k,v, indent+1));
        return `${pad}-\n${lines.join('\n')}`;
      } else {
        return `${pad}- ${item}`;
      }
    }).join('\n');
  }
  if (obj && typeof obj === 'object') {
    return Object.entries(obj)
      .filter(([,v])=>v!==undefined && v!==null)
      .map(([k,v]) => {
        if (v && typeof v === 'object' && !Array.isArray(v)) {
          return `${pad}${k}:\n${toYAML(v, indent+1)}`;
        }
        if (Array.isArray(v)) {
          if (v.length === 0) return `${pad}${k}: []`;
          // If array of primitives inline, else block style
          const primitive = v.every(x => typeof x !== 'object');
            if (primitive) return `${pad}${k}: [${v.join(', ')}]`;
            return `${pad}${k}:\n${toYAML(v, indent+1)}`;
        }
        return `${pad}${k}: ${v}`;
      }).join('\n');
  }
  return String(obj);
}

function formatYAMLValue(key, value, indent) {
  const pad = '  '.repeat(indent);
  if (Array.isArray(value)) {
    if (value.length === 0) return `${pad}${key}: []`;
    const primitive = value.every(v => typeof v !== 'object');
    if (primitive) return `${pad}${key}: [${value.join(', ')}]`;
    return `${pad}${key}:\n${toYAML(value, indent+1)}`;
  }
  if (value && typeof value === 'object') {
    return `${pad}${key}:\n${toYAML(value, indent+1)}`;
  }
  return `${pad}${key}: ${value}`;
}

async function main() {
  const backlog = await collectBacklogTasks();
  const pipeline = await collectPipelineTasks();
  const all = sortTasks([...backlog, ...pipeline]);
  const { pipeline: pipeAgg, backlogCounts } = aggregate(all);
  const doc = {
    version: 1,
    generated: new Date().toISOString(),
    pipeline: pipeAgg,
    stories: { backlog: backlogCounts },
    tasks: all.map(t => ({ id: t.id, title: t.title, status: t.status, story: t.story, file: `./${t.file}`, assignee: t.assignee || undefined }))
  };
  const yaml = toYAML(doc) + '\n';
  await fs.writeFile(OUTPUT_YAML, yaml, 'utf8');
  await fs.writeFile(OUTPUT_JSON, JSON.stringify(doc, null, 2) + '\n', 'utf8');
  console.log('Wrote manifests to', OUTPUT_YAML, 'and tasks.json', `(tasks: ${all.length})`);
}

main().catch(err => { console.error(err); process.exit(1); });
