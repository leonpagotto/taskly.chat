#!/usr/bin/env node
import { promises as fs } from 'fs';
import path from 'path';

/*
Parses task provenance lines to compute time spent in each status.
Expected provenance line formats (will standardize later):
  - 2025-09-19T20:15:02Z promoted backlog→todo
  - 2025-09-19T21:01:11Z status→in-progress
  - 2025-09-19T22:45:00Z status→review
  - 2025-09-19T23:10:30Z status→done

For each task, we derive intervals between successive status change timestamps.
Output: metrics/tasks-metrics.json
*/

const ROOT = process.cwd();
const STORIES_ROOT = path.join(ROOT,'docs/taskly-chat/stories');
const PIPELINE_ROOT = path.join(ROOT,'tasks');
const OUTPUT_DIR = path.join(ROOT,'metrics');
const OUTPUT_FILE = path.join(OUTPUT_DIR,'tasks-metrics.json');

async function readFileSafe(p) { try { return await fs.readFile(p,'utf8'); } catch { return null; } }

async function listFiles() {
  const files = [];
  // backlog
  const storyDirs = await fs.readdir(STORIES_ROOT,{withFileTypes:true}).catch(()=>[]);
  for (const d of storyDirs) {
    if (!d.isDirectory() || !/^\d+-.+/.test(d.name)) continue;
    const backlogDir = path.join(STORIES_ROOT, d.name,'Backlog');
    try {
      const entries = await fs.readdir(backlogDir,{withFileTypes:true});
      for (const e of entries) if (e.isFile() && e.name.endsWith('.md')) files.push(path.join(backlogDir,e.name));
    } catch {}
  }
  // pipeline
  for (const st of ['todo','in-progress','review','done']) {
    const dir = path.join(PIPELINE_ROOT, st);
    try {
      const entries = await fs.readdir(dir,{withFileTypes:true});
      for (const e of entries) if (e.isFile() && e.name.endsWith('.md')) files.push(path.join(dir,e.name));
    } catch {}
  }
  return files;
}

function parseStatusEvents(raw) {
  const events = [];
  const lines = raw.split(/\r?\n/);
  // Support legacy formats and new standardized EVENT:status-change lines
  const regexes = [
    /(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z) promoted backlog→(todo)/,
    /(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z) status→(todo|in-progress|review|done)/,
    /(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z)\s+EVENT:status-change\s+from=\w+\s+to=(todo|in-progress|review|done)/
  ];
  for (const line of lines) {
    for (const r of regexes) {
      const m = line.match(r);
      if (m) {
        events.push({ ts: m[1], to: m[2] });
        break;
      }
    }
  }
  events.sort((a,b)=>a.ts.localeCompare(b.ts));
  return events;
}

function extractCreatedIso(raw) {
  // Created: YYYY-MM-DD (no time) -> assume midnight UTC
  const m = raw.match(/^Created:\s*(\d{4}-\d{2}-\d{2})/m);
  if (!m) return null;
  return m[1] + 'T00:00:00Z';
}

function computeDurations(events, nowIso, createdIso) {
  const nowMs = new Date(nowIso).getTime();
  const result = { backlog:0, todo:0, 'in-progress':0, review:0, done:0 };
  // Baseline start (created date if available else first event)
  const baselineIso = createdIso || (events[0] && events[0].ts) || nowIso;
  if (events.length === 0) {
    const openIntervalSeconds = Math.max(0, (nowMs - new Date(baselineIso).getTime())/1000);
    result.backlog = openIntervalSeconds; // Entire life in backlog so far
    return { durations: result, openIntervalSeconds, currentStatus: 'backlog' };
  }
  let prevTs = baselineIso;
  let prevStatus = 'backlog';
  for (const ev of events) {
    const curTs = ev.ts;
    const delta = (new Date(curTs).getTime() - new Date(prevTs).getTime())/1000;
    if (delta > 0 && result[prevStatus] !== undefined) result[prevStatus] += delta;
    prevTs = curTs;
    prevStatus = ev.to;
  }
  let openIntervalSeconds = 0;
  if (prevStatus !== 'done') {
    const delta = (nowMs - new Date(prevTs).getTime())/1000;
    if (delta > 0) openIntervalSeconds = delta;
  } else {
    // Closed tasks: add the final interval time to the last status (done) implicitly via zero open interval
  }
  return { durations: result, openIntervalSeconds, currentStatus: prevStatus };
}

async function main() {
  const files = await listFiles();
  const metrics = [];
  const nowIso = new Date().toISOString();
  for (const file of files) {
    const raw = await readFileSafe(file);
    if (!raw) continue;
    const events = parseStatusEvents(raw);
    const createdIso = extractCreatedIso(raw);
    const { durations, openIntervalSeconds, currentStatus } = computeDurations(events, nowIso, createdIso);
    const id = path.basename(file).replace(/\.md$/,'');
    metrics.push({ id, file: path.relative(ROOT,file), durations, openIntervalSeconds, currentStatusDurationSeconds: openIntervalSeconds, currentStatus });
  }
  await fs.mkdir(OUTPUT_DIR,{recursive:true});
  await fs.writeFile(OUTPUT_FILE, JSON.stringify({ generated: new Date().toISOString(), metrics }, null, 2)+'\n','utf8');
  console.log('Wrote metrics to', OUTPUT_FILE, `(tasks with events: ${metrics.length})`);
}

main().catch(err => { console.error(err); process.exit(1); });
