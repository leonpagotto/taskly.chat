#!/usr/bin/env node
import { promises as fs } from 'fs';
import path from 'path';

const STORIES = path.resolve(process.cwd(), 'stories');
let changed = 0;

async function walk(dir) {
  const entries = await fs.readdir(dir,{withFileTypes:true});
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) await walk(full); else if (e.isFile() && full.includes('/Backlog/') && full.endsWith('.md')) {
      let raw = await fs.readFile(full,'utf8');
      // Only adjust top header segment (before first blank line or '## ')
      const parts = raw.split(/\n\n/);
      const headerBlock = parts[0].split(/\n/);
      let modified = false;
      for (let i=0;i<headerBlock.length;i++) {
        if (/^Status: Backlog\s*$/.test(headerBlock[i])) { headerBlock[i] = 'Status: backlog'; modified = true; }
      }
      if (modified) {
        parts[0] = headerBlock.join('\n');
        await fs.writeFile(full, parts.join('\n\n'));
        changed++;
        console.log('Normalized', full);
      }
    }
  }
}

walk(STORIES).then(()=>{
  console.log(`Done. Files changed: ${changed}`);
}).catch(err=>{ console.error(err); process.exit(1); });
