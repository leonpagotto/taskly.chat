#!/usr/bin/env node
import { promises as fs } from 'fs';
import path from 'path';
import { parseHeaders } from '../packages/integration/src/parser.js';

const ROOT = process.cwd();

async function* walk(dir) {
  for (const entry of await fs.readdir(dir,{withFileTypes:true})) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else if (entry.isFile() && entry.name.endsWith('.md')) yield full;
  }
}

async function main() {
  const targets = [];
  for await (const f of walk(ROOT)) {
    if (/\/stories\//.test(f) || /\/tasks\//.test(f)) targets.push(f);
  }
  const rows = [];
  for (const f of targets) {
    try {
      const raw = await fs.readFile(f,'utf8');
      const parsed = parseHeaders(raw);
      if (!parsed) continue;
      if (parsed.kind === 'story') {
        rows.push({ kind:'story', slug: parsed.slug, status: parsed.status, file: path.relative(ROOT,f) });
      } else {
        rows.push({ kind:'task', id: parsed.id, status: parsed.status, story: parsed.story, file: path.relative(ROOT,f) });
      }
    } catch (e) {
      rows.push({ kind:'error', file: path.relative(ROOT,f), error: e.message });
    }
  }
  console.table(rows.slice(0,50));
  console.log(`Total parsed rows: ${rows.length}`);
}

main().catch(err => { console.error(err); process.exit(1); });
