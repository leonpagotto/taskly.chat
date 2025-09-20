#!/usr/bin/env node
import { promises as fs } from 'fs';
import path from 'path';
import { spawn } from 'child_process';

// This script runs the validator and then produces a lightweight drift report:
// - Counts by status
// - Tasks missing or empty Acceptance Criteria (should be zero if validator strict)
// - Age buckets (days since Created)
// - Potential stale in-progress tasks (>7 days)

const STORIES_ROOT = path.resolve(process.cwd(), 'stories');
const PIPELINE_ROOT = path.resolve(process.cwd(), 'tasks');

async function readAllTaskFiles() {
  const files = [];
  async function walk(dir) {
    let entries = [];
    try { entries = await fs.readdir(dir,{withFileTypes:true}); } catch { return; }
    for (const e of entries) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) await walk(full); else if (e.isFile() && e.name.endsWith('.md') && e.name !== 'story.md') files.push(full);
    }
  }
  await walk(STORIES_ROOT);
  await walk(PIPELINE_ROOT);
  return files;
}

function parseHeader(raw) {
  const lines = raw.split(/\r?\n/);
  const header = {};
  for (let i=0;i<lines.length;i++) {
    const line = lines[i];
    if (line.startsWith('## ')) break;
    const m = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (m) header[m[1]] = m[2].trim();
  }
  return header;
}

function extractAcceptanceCriteria(raw) {
  const lines = raw.split(/\r?\n/);
  const idx = lines.findIndex(l => l.trim().toLowerCase() === '## acceptance criteria');
  if (idx === -1) return null;
  const body = [];
  for (let i = idx + 1; i < lines.length; i++) {
    const line = lines[i];
    if (/^##\s+/.test(line)) break;
    body.push(line);
  }
  return body;
}

function ageInDays(created) {
  if (!created) return null;
  const d = new Date(created);
  if (isNaN(d.getTime())) return null;
  const diff = Date.now() - d.getTime();
  return Math.floor(diff / (1000*60*60*24));
}

async function runValidator() {
  return new Promise((resolve) => {
    const proc = spawn('node', ['scripts/validate-tasks.mjs']);
    let out = '';
    let err = '';
    proc.stdout.on('data', d => out += d.toString());
    proc.stderr.on('data', d => err += d.toString());
    proc.on('close', code => resolve({ code, out, err }));
  });
}

async function main() {
  const validator = await runValidator();
  const files = await readAllTaskFiles();
  const statusCounts = {};
  const missingAC = [];
  const emptyChecklist = [];
  const ages = [];
  const staleInProgress = [];

  for (const f of files) {
    const raw = await fs.readFile(f,'utf8');
    const header = parseHeader(raw);
    const st = (header.Status || '').toLowerCase();
    statusCounts[st] = (statusCounts[st]||0)+1;
    const ac = extractAcceptanceCriteria(raw);
    if (!ac) missingAC.push(f);
    else {
      const hasChecklist = ac.some(l => /^- \[( |x|X)\]/.test(l.trim()));
      if (!hasChecklist) emptyChecklist.push(f);
    }
    const age = ageInDays(header.Created);
    if (age != null) ages.push(age);
    if (st === 'in-progress' && age != null && age > 7) staleInProgress.push({ file: f, age });
  }

  const total = files.length;
  const ageAvg = ages.length ? (ages.reduce((a,b)=>a+b,0)/ages.length).toFixed(1) : 'n/a';
  const ageMax = ages.length ? Math.max(...ages) : 'n/a';
  const ageMin = ages.length ? Math.min(...ages) : 'n/a';

  const report = {
    validator: {
      passed: validator.code === 0,
      summary: validator.code === 0 ? validator.out.trim() : validator.err.trim()
    },
    totals: { tasks: total },
    statusCounts,
    acceptanceCriteria: {
      missing: missingAC.length,
      emptyChecklist: emptyChecklist.length,
    },
    ages: { avgDays: ageAvg, maxDays: ageMax, minDays: ageMin },
    staleInProgress
  };

  console.log(JSON.stringify(report, null, 2));
  if (validator.code !== 0) process.exit(validator.code);
}

main().catch(err => { console.error(err); process.exit(1); });
