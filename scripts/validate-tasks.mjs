#!/usr/bin/env node
import { promises as fs } from 'fs';
import path from 'path';

const STORIES_ROOT = path.resolve(process.cwd(), 'stories');
const PIPELINE_ROOT = path.resolve(process.cwd(), 'tasks');
const REQUIRED = ['Status','Story','Created','Type'];
// Canonical story (backlog) status + pipeline statuses
// Accept both canonical lowercase and legacy TitleCase 'Backlog' for story backlog tasks
// Canonical lowercase pipeline statuses
const STATUS_VALUES = new Set(['backlog','todo','in-progress','review','done']);
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
  // Acceptance Criteria section validation
  const acIndex = lines.findIndex(l => l.trim().toLowerCase() === '## acceptance criteria');
  if (acIndex === -1) {
    errors.push('Missing Acceptance Criteria section');
  } else {
    // Collect until next heading starting with ## (excluding the same line)
    let i = acIndex + 1;
    const acLines = [];
    while (i < lines.length) {
      const line = lines[i];
      if (/^##\s+/.test(line)) break;
      acLines.push(line);
      i++;
    }
    const hasChecklist = acLines.some(l => /^- \[( |x|X)\]/.test(l.trim()));
    if (!hasChecklist) errors.push('Acceptance Criteria has no checklist items');
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
  // Only active pipeline states (backlog now lives exclusively under story Backlog folders)
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
  const idToFileHeaderIdMismatch = [];
  const tasksMeta = new Map(); // id -> {file, status, story, related[], blocking[], blockedBy[]}

  // Preload optional WIP config
  const wipConfigPath = path.resolve(process.cwd(), 'tasks.config.json');
  let wipLimits = null;
  try {
    const rawCfg = await fs.readFile(wipConfigPath,'utf8');
    wipLimits = JSON.parse(rawCfg).wip || null;
  } catch {}

  for (const f of files) {
    const raw = await fs.readFile(f,'utf8');
    const headerLines = raw.split(/\r?\n/).slice(0,40);
    const header = {};
    for (const line of headerLines) {
      const m = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
      if (m) header[m[1]] = m[2].trim();
      if (line.startsWith('## ')) break;
    }
    const { errors } = await validateTask(f);
    const baseFull = path.basename(f).replace(/\.md$/,'');
    // Expect pattern: ID-SLUG where ID = PREFIX-NNN (PREFIX alnum/uppercase) and SLUG is kebab
    const fileParts = baseFull.split('-');
    let filenameId = null;
    let slug = null;
    if (fileParts.length >= 3) { // e.g. IMP-101-minimal-mount => [IMP,101,minimal,...]
      const maybeId = fileParts[0] + '-' + fileParts[1];
      if (/^[A-Z0-9]+-[0-9]{3,}$/.test(maybeId)) {
        filenameId = maybeId;
        slug = fileParts.slice(2).join('-');
      }
    } else if (/^[A-Z0-9]+-[0-9]{3,}$/.test(baseFull)) {
      // ID-only filename (will be flagged below)
      filenameId = baseFull;
      slug = '';
    } else {
      // fallback: previous loose match for legacy
      const loose = baseFull.match(/^([A-Za-z0-9_-]+)/);
      filenameId = loose ? loose[1] : null;
    }
    const titleLine = raw.split(/\r?\n/,1)[0];
    let headerId = null;
    if (titleLine.startsWith('# Task:')) {
      const m = titleLine.match(/^# Task:\s*([A-Za-z0-9_-]+)/);
      if (m) headerId = m[1];
    }
    // Prefer headerId if present; they must match; we'll report mismatch.
    let id = headerId || filenameId;
    if (id) {
      if (filenameId && headerId && filenameId !== headerId) {
        idToFileHeaderIdMismatch.push({ file: f, filenameId, headerId });
      }
      if (!ids.has(id)) ids.set(id, []);
      ids.get(id).push(f);
      tasksMeta.set(id, {
        file: f,
        status: header.Status || '',
        story: header.Story || '',
        related: parseListField(header.Related),
        blocking: parseListField(header.blocking || header.Blocking),
        blockedBy: parseListField(header['blocked-by'] || header.BlockedBy)
      });
      // Slug enforcement: if file in pipeline or backlog ensure slug exists & matches pattern
      if (slug !== null) {
        if (!slug) {
          errors.push('Missing slug in filename (expected ID-slug.md)');
        } else if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) {
          errors.push(`Non-conforming slug '${slug}' (kebab-case required)`);
        }
      }
    }
    if (errors.length) {
      invalid++;
      console.error(`\n✗ ${f}`);
      for (const er of errors) console.error('  -', er);
    }
  }

  // Report filename/header mismatches
  for (const m of idToFileHeaderIdMismatch) {
    invalid++;
    console.error(`\n✗ ID mismatch: ${m.file}`);
    console.error(`  - filename ID: ${m.filenameId}`);
    console.error(`  - header   ID: ${m.headerId}`);
  }

  // Duplicate IDs
  for (const [id, list] of ids.entries()) {
    if (list.length > 1) {
      invalid++;
      console.error(`\n✗ Duplicate ID: ${id}`);
      for (const l of list) console.error('  -', l);
    }
  }

  // Build lookup sets
  const storyDirs = new Set();
  try {
    const dirs = await fs.readdir(STORIES_ROOT,{withFileTypes:true});
    for (const d of dirs) if (d.isDirectory() && /^\d+-.+/.test(d.name)) storyDirs.add(d.name);
  } catch {}
  const taskIds = new Set(ids.keys());

  // Referential checks
  for (const [id, meta] of tasksMeta.entries()) {
    const problems = [];
    for (const ref of [...meta.related, ...meta.blocking, ...meta.blockedBy]) {
      if (ref.startsWith('story:')) {
        const s = ref.slice(6);
        if (!storyDirs.has(s)) problems.push(`Unknown story reference: ${ref}`);
      } else if (ref.startsWith('task:')) {
        const t = ref.slice(5);
        if (!taskIds.has(t)) problems.push(`Unknown task reference: ${ref}`);
      }
    }
    if (problems.length) {
      invalid++;
      console.error(`\n✗ ${meta.file}`);
      for (const p of problems) console.error('  -', p);
    }
  }

  // WIP limit enforcement
  if (wipLimits) {
    const columnCounts = {};
    for (const [, meta] of tasksMeta.entries()) {
      const st = (meta.status||'').toLowerCase();
      if (['todo','in-progress','review'].includes(st)) {
        columnCounts[st] = (columnCounts[st]||0)+1;
      }
    }
    for (const [col, limit] of Object.entries(wipLimits)) {
      if (limit != null && columnCounts[col] && columnCounts[col] > limit) {
        invalid++;
        console.error(`\n✗ WIP limit exceeded: ${col} ${columnCounts[col]}/${limit}`);
      }
    }
  }

  // Story header validation
  const storyDirsList = Array.from(storyDirs.values());
  for (const s of storyDirsList) {
    const storyFile = path.join(STORIES_ROOT, s, 'story.md');
    try {
      const raw = await fs.readFile(storyFile,'utf8');
      const lines = raw.split(/\r?\n/).slice(0,15);
      const requiredStory = ['# Story:','Slug:','Status:','Created:'];
      const orderIndices = [];
      for (const req of requiredStory) {
        const idx = lines.findIndex(l => l.startsWith(req));
        if (idx === -1) {
          invalid++;
            console.error(`\n✗ Story header missing '${req}' in ${storyFile}`);
        } else {
          orderIndices.push(idx);
        }
      }
      // Check order only if all present
      if (orderIndices.length === requiredStory.length) {
        const sorted = [...orderIndices].sort((a,b)=>a-b);
        const inOrder = orderIndices.every((v,i)=>v===sorted[i]);
        if (!inOrder) {
          invalid++;
          console.error(`\n✗ Story header fields out of order in ${storyFile}`);
        }
      }
    } catch {}
  }

  const summary = `${files.length - invalid}/${files.length} valid tasks`;
  if (invalid) {
    console.error(`\nValidation failed: ${summary}`);
    process.exit(2);
  } else {
    console.log(`Validation passed: ${summary}`);
  }
}

function parseListField(val) {
  if (!val) return [];
  // Accept formats: [a,b] or comma/space separated tokens
  if (/^\[.*\]$/.test(val)) {
    const inner = val.slice(1,-1).trim();
    if (!inner) return [];
    return inner.split(/[,\s]+/).map(s=>s.trim()).filter(Boolean);
  }
  return val.split(/[,\s]+/).map(s=>s.trim()).filter(Boolean);
}

main().catch(err => { console.error(err); process.exit(1); });
