#!/usr/bin/env node
import { promises as fs } from 'fs';
import path from 'path';
import { parseHeaders } from '../packages/integration/src/parser.js';
import { buildBoardModel, diffBoards } from '../packages/integration/src/boardModel.js';

async function* walk(dir) {
  for (const e of await fs.readdir(dir,{withFileTypes:true})) {
    const full = path.join(dir,e.name);
    if (e.isDirectory()) yield* walk(full); else if (e.isFile() && full.endsWith('.md')) yield full;
  }
}

async function collectTasks(root) {
  const tasks = [];
  for await (const f of walk(root)) {
    if (!/\/tasks\//.test(f)) continue;
    const raw = await fs.readFile(f,'utf8');
    const parsed = parseHeaders(raw);
    if (parsed && parsed.kind==='task') tasks.push(parsed);
  }
  return tasks;
}

async function main() {
  const root = process.cwd();
  const initial = await collectTasks(root);
  const base = buildBoardModel(initial);
  console.log('Snapshot captured. Modify tasks then press Enter to capture diff...');
  process.stdin.resume();
  await new Promise(r=>process.stdin.once('data', r));
  const nextTasks = await collectTasks(root);
  const next = buildBoardModel(nextTasks, base);
  const diff = diffBoards(base, next);
  console.log(JSON.stringify(diff,null,2));
  process.exit(0);
}

main().catch(err => { console.error(err); process.exit(1); });
