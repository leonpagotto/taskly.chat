#!/usr/bin/env node
import { promises as fs } from 'fs';
import path from 'path';

/*
Usage:
  node scripts/update-task-status.mjs <taskPath> <newStatus>

Moves an existing pipeline task to a new status folder (todo|in-progress|review|done)
Updates Status line, Updated date, and appends provenance entry.
*/

const PIPELINE = new Set(['todo','in-progress','review','done']);
const ROOT = process.cwd();

async function run() {
  const [ , , srcArg, newStatusArg ] = process.argv;
  if (!srcArg || !newStatusArg) {
    console.error('Usage: node scripts/update-task-status.mjs <taskPath> <todo|in-progress|review|done>');
    process.exit(1);
  }
  const status = newStatusArg.toLowerCase();
  if (!PIPELINE.has(status)) {
    console.error('Invalid status:', status); process.exit(1);
  }
  const src = path.resolve(ROOT, srcArg);
  const exists = await fs.access(src).then(()=>true).catch(()=>false);
  if (!exists) { console.error('Task not found:', src); process.exit(1); }
  let raw = await fs.readFile(src,'utf8');
  if (/^Status:/m.test(raw)) raw = raw.replace(/^Status:.*$/m, `Status: ${status}`);
  if (/^Updated:/m.test(raw)) raw = raw.replace(/^Updated:.*$/m, `Updated: ${new Date().toISOString().slice(0,10)}`);
  const provLine = `- ${new Date().toISOString()} status→${status}`;
  if (/^Provenance:/m.test(raw)) raw += `\n${provLine}`; else raw += `\n\nProvenance:\n${provLine}`;
  await fs.writeFile(src, raw,'utf8');
  const destDir = path.resolve(ROOT, 'tasks', status);
  await fs.mkdir(destDir,{recursive:true});
  const dest = path.join(destDir, path.basename(src));
  await fs.rename(src, dest);
  console.log('Updated status', srcArg, '->', path.relative(ROOT,dest));
}

run().catch(e=>{console.error(e);process.exit(1);});
