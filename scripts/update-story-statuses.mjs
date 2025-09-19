#!/usr/bin/env node
import { promises as fs } from 'fs';
import path from 'path';

const ROOT = path.resolve(process.cwd(), 'docs/taskly-chat/stories');

async function processStory(storyDir) {
  const storyPath = path.join(storyDir,'story.md');
  try { await fs.access(storyPath); } catch { return false; }
  let raw = await fs.readFile(storyPath,'utf8');
  if (/^Status:/m.test(raw)) return false; // already has status
  const lines = raw.split(/\r?\n/);
  const titleIdx = lines.findIndex(l => /^#\s+/.test(l));
  const insertAt = titleIdx >=0 ? titleIdx+1 : 0;
  lines.splice(insertAt,0,'Status: Draft');
  raw = lines.join('\n');
  await fs.writeFile(storyPath, raw, 'utf8');
  return true;
}

async function main() {
  const dirs = await fs.readdir(ROOT, { withFileTypes: true });
  let changed=0, total=0;
  for (const d of dirs) {
    if (!d.isDirectory()) continue;
    const storyDir = path.join(ROOT, d.name);
    const did = await processStory(storyDir);
    if (did) changed++;
    total++;
  }
  console.log(`Added Status line to ${changed} of ${total} stories.`);
}

main().catch(e=>{console.error(e);process.exit(1);});
