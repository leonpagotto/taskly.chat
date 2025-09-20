#!/usr/bin/env node
import { promises as fs } from 'fs';
import path from 'path';

const ROOT = path.resolve(process.cwd(), 'speca-chat');
const STORIES = path.join(ROOT, 'stories');
const BOARD = path.join(ROOT, 'board');
const STATUSES = ['backlog','in-progress','review','done'];

async function collectTasks() {
  const stories = await fs.readdir(STORIES, { withFileTypes: true });
  const tasks = [];
  for (const s of stories) {
    if (!s.isDirectory() || !/^story-/.test(s.name)) continue;
    const tasksDir = path.join(STORIES, s.name, 'tasks');
    try {
      const taskFiles = await fs.readdir(tasksDir, { withFileTypes: true });
      for (const tf of taskFiles) {
        if (tf.isFile() && tf.name.endsWith('.task.yml')) {
          const full = path.join(tasksDir, tf.name);
          const raw = await fs.readFile(full, 'utf8');
          const meta = parseYaml(raw);
          tasks.push({ ...meta, story: s.name, taskPath: full });
        }
      }
    } catch {}
  }
  return tasks;
}

function parseYaml(raw) {
  const obj = {};
  for (const line of raw.split(/\r?\n/)) {
    const m = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (m) obj[m[1]] = m[2];
  }
  return obj;
}

async function rimrafDir(dir) {
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const e of entries) if (e.isFile()) await fs.unlink(path.join(dir, e.name));
  } catch {}
}

async function ensureDirs() {
  for (const st of STATUSES) {
    await fs.mkdir(path.join(BOARD, st), { recursive: true });
    await rimrafDir(path.join(BOARD, st));
  }
}

function boardRefYaml(t) {
  return `id: ${t.id}\nstory: ${t.story}\nstatus: ${t.status}\npath: ${path.relative(path.join(BOARD, t.status), t.taskPath)}\n`;
}

async function writeBoard(tasks) {
  for (const t of tasks) {
    const out = path.join(BOARD, t.status, `${t.id}.yml`);
    await fs.writeFile(out, boardRefYaml(t), 'utf8');
  }
}

async function main() {
  const tasks = await collectTasks();
  await ensureDirs();
  await writeBoard(tasks);
  console.log(`Generated board refs for ${tasks.length} tasks.`);
}

main().catch(e => { console.error(e); process.exit(1); });
