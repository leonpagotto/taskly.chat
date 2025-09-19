#!/usr/bin/env node
import { promises as fs } from 'fs';
import path from 'path';

/*
Usage:
  node scripts/promote-task.mjs <taskFilePath> <newStatus>
Where:
  <taskFilePath> = path to backlog task under a story (e.g. docs/taskly-chat/stories/10-engineering-automation/Done/TOOL-001.md NOT VALID for backlog; backlog will be under new structure later)
  <newStatus> one of: todo | in-progress | review | done

This script:
  1. Validates source exists and has front-matter or header lines containing Status/Story.
  2. Updates Status line to newStatus (canonical casing for pipeline).
  3. Moves file into tasks/<newStatus>/ preserving original filename.
  4. Appends a provenance note if not already present.

NOTE: Backlog tasks for the new model should live in story folder: stories/<story-slug>/tasks/*.md
*/

const PIPELINE = new Set(['todo','in-progress','review','done']);
const ROOT = process.cwd();

async function run() {
  const [ , , srcArg, newStatusArg ] = process.argv;
  if (!srcArg || !newStatusArg) {
    console.error('Usage: node scripts/promote-task.mjs <taskPath> <todo|in-progress|review|done>');
    process.exit(1);
  }
  const status = newStatusArg.toLowerCase();
  if (!PIPELINE.has(status)) {
    console.error('Invalid status:', status);
    process.exit(1);
  }
  const src = path.resolve(ROOT, srcArg);
  const exists = await fs.access(src).then(()=>true).catch(()=>false);
  if (!exists) { console.error('Task file not found:', src); process.exit(1); }
  let raw = await fs.readFile(src,'utf8');
  // Update Status
  if (/^Status:/m.test(raw)) raw = raw.replace(/^Status:.*$/m, `Status: ${status}`);
  else if (!/^---\n/.test(raw)) raw = raw.replace(/^(# Task:[^\n]*\n)/, `$1Status: ${status}\n`);
  // Refresh Updated timestamp if present
  if (/^Updated:/m.test(raw)) raw = raw.replace(/^Updated:.*$/m, `Updated: ${new Date().toISOString().slice(0,10)}`);
  // Append provenance log (append new line always)
  const provLine = `- ${new Date().toISOString()} EVENT:status-change from=backlog to=${status}`;
  if (/^Provenance:/m.test(raw)) {
    // If Provenance block exists, append line after it (simple append at end for now)
    raw += `\n${provLine}`;
  } else {
    raw += `\n\nProvenance:\n${provLine}`;
  }
  await fs.writeFile(src, raw, 'utf8');
  const destDir = path.resolve(ROOT, 'tasks', status);
  await fs.mkdir(destDir,{recursive:true});
  const dest = path.join(destDir, path.basename(src));
  await fs.rename(src, dest);
  console.log('Promoted', srcArg, '->', path.relative(ROOT,dest));
}

run().catch(e=>{console.error(e);process.exit(1);});
