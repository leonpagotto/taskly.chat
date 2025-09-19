#!/usr/bin/env node
import { promises as fs } from 'fs';
import path from 'path';

const STORIES_ROOT = path.resolve(process.cwd(), 'docs/taskly-chat/stories');
const PIPELINE_ROOT = path.resolve(process.cwd(), 'tasks');
const REQUIRED = ['Status','Story','Created','Type'];
// Canonical story (backlog) status + pipeline statuses
// Accept both canonical lowercase and legacy TitleCase 'Backlog' for story backlog tasks
const STATUS_VALUES = new Set(['backlog','Backlog','todo','in-progress','review','done']);
const TYPE_VALUES = new Set(['feature','bug','refactor','research','chore','spike','ops','doc']);

function parseHeader(lines) {
  const map = {};
  for (const line of lines) {
    const m = line.match(/^(\w+):\s*(.*)$/);
    if (m) map[m[1]] = m[2].trim();
    if (line.trim() === '' || line.startsWith('##')) break; // stop early once body begins
  }
  return map;
}

async function validateTask(file) {
  const raw = await fs.readFile(file,'utf8');
  const lines = raw.split(/\r?\n/);
  const titleOk = lines[0].startsWith('# Task:');
  const header = parseHeader(lines.slice(1,15));
  const errors = [];
  if (!titleOk) errors.push('Missing or malformed title line (# Task: ...)');
  for (const f of REQUIRED) if (!header[f]) errors.push(`Missing field: ${f}`);
  if (header.Status && !STATUS_VALUES.has(header.Status)) errors.push(`Invalid Status: ${header.Status}`);
  if (header.Type) {
    const t = header.Type.toLowerCase();
    if (t === 'unknown') {
      errors.push('Deprecated Type: unknown (use chore/doc/spike)');
    } else if (!TYPE_VALUES.has(t)) {
      errors.push(`Invalid Type: ${header.Type} (allowed: ${[...TYPE_VALUES].join(', ')})`);
    }
  }
  return { file, errors };
}

async function collectStoryBacklogTasks(root, acc=[]) {
  const entries = await fs.readdir(root,{withFileTypes:true});
  for (const e of entries) {
    const full = path.join(root, e.name);
    if (e.isDirectory()) {
      // Expect story directories like <number>-slug
      if (/^\d+-.+/.test(e.name)) {
        // look for tasks subfolder pattern old style statuses (Backlog etc.) or new future 'tasks'
        // Legacy: status folders; New: story backlog likely in a 'tasks' folder
        const legacyStatuses = ['Backlog','InProgress','Review','Done'];
        for (const ls of legacyStatuses) {
          const statusDir = path.join(full, ls);
          try {
            const items = await fs.readdir(statusDir,{withFileTypes:true});
            for (const it of items) if (it.isFile() && it.name.endsWith('.md') && it.name !== 'story.md') acc.push(path.join(statusDir,it.name));
          } catch {}
        }
        // New backlog tasks folder (optional future): stories/<story>/tasks/*.md
        const backlogDir = path.join(full,'tasks');
        try {
          const items = await fs.readdir(backlogDir,{withFileTypes:true});
          for (const it of items) if (it.isFile() && it.name.endsWith('.md')) acc.push(path.join(backlogDir,it.name));
        } catch {}
      } else {
        await collectStoryBacklogTasks(full, acc);
      }
    }
  }
  return acc;
}

async function collectPipelineTasks(root, acc=[]) {
  const statuses = ['todo','in-progress','review','done'];
  for (const st of statuses) {
    const dir = path.join(root, st);
    try {
      const entries = await fs.readdir(dir,{withFileTypes:true});
      for (const e of entries) if (e.isFile() && e.name.endsWith('.md')) acc.push(path.join(dir,e.name));
    } catch {}
  }
  return acc;
}

async function main() {
  const files = [];
  await collectStoryBacklogTasks(STORIES_ROOT, files);
  await collectPipelineTasks(PIPELINE_ROOT, files);
  let invalid = 0;
  const ids = new Map();
  for (const f of files) {
    const { errors } = await validateTask(f);
    // Extract ID from filename prefix (before first '.')
    const base = path.basename(f).replace(/\.md$/,'');
    const idMatch = base.match(/^([A-Za-z0-9_-]+)/);
    if (idMatch) {
      const id = idMatch[1];
      if (!ids.has(id)) ids.set(id, []);
      ids.get(id).push(f);
    }
    if (errors.length) {
      invalid++;
      console.error(`\n✗ ${f}`);
      for (const er of errors) console.error('  -', er);
    }
  }
  for (const [id, list] of ids.entries()) {
    if (list.length > 1) {
      invalid++;
      console.error(`\n✗ Duplicate ID: ${id}`);
      for (const l of list) console.error('  -', l);
    }
  }
  const summary = `${files.length - invalid}/${files.length} valid tasks`;
  if (invalid) {
    console.error(`\nValidation failed: ${summary}`);
    process.exit(2);
  } else {
    console.log(`Validation passed: ${summary}`);
  }
}

main().catch(err => { console.error(err); process.exit(1); });
