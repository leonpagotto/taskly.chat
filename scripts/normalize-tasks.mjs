#!/usr/bin/env node
import { promises as fs } from 'fs';
import path from 'path';

const ROOT = path.resolve(process.cwd(), 'docs/taskly-chat/stories');
const TODAY = new Date().toISOString().slice(0,10);

function isTaskFile(fullPath) {
  const norm = fullPath.replace(/\\/g,'/');
  return /(\/Backlog\/|\/InProgress\/|\/Review\/|\/Done\/)[^/]+\.md$/.test(norm) && !norm.endsWith('/story.md');
}

function parseStory(fullPath) {
  const parts = fullPath.split(path.sep);
  // locate story folder (the segment before status folder)
  const storyIdx = parts.findIndex(p => ['Backlog','InProgress','Review','Done'].includes(p)) - 1;
  const storyFolder = parts[storyIdx];
  return storyFolder; // e.g. 01-natural-language-task-creation
}

function inferStatus(fullPath) {
  const parts = fullPath.split(path.sep);
  return parts.find(p => ['Backlog','InProgress','Review','Done'].includes(p));
}

async function normalizeFile(file) {
  const raw = await fs.readFile(file,'utf8');
  if (raw.startsWith('# Task:')) return false; // already normalized
  const story = parseStory(file);
  const status = inferStatus(file);
  const filename = path.basename(file, '.md');
  const header = [
    `# Task: ${filename}`,
    `Status: ${status}`,
    `Story: ${story}`,
    `Created: ${TODAY}`,
    `Type: unknown`,
    `Related:`,
    `Owner:`,
    '',
    '## Summary',
    'Migrated legacy task. Improve this summary.',
    '',
    '## Acceptance Criteria',
    '- [ ] Define criteria',
    '',
    '## Implementation Notes',
    '- Migrated by normalize-tasks script',
    '',
    '## Progress Log',
    `- ${TODAY} Normalized legacy file`,
    ''
  ].join('\n');
  let body = raw.trim();
  let newContent = header;
  if (body) {
    newContent += '\n## Legacy Body\n\n' + body + '\n';
  }
  await fs.writeFile(file, newContent, 'utf8');
  return true;
}

async function walk(dir, acc=[]) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) await walk(full, acc);
    else if (e.isFile() && isTaskFile(full)) acc.push(full);
  }
  return acc;
}

async function main() {
  const files = await walk(ROOT);
  let changed = 0;
  for (const f of files) {
    const did = await normalizeFile(f);
    if (did) changed++;
  }
  console.log(`Normalized ${changed} of ${files.length} task files.`);
}

main().catch(err => { console.error(err); process.exit(1); });
