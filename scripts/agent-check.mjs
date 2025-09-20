#!/usr/bin/env node
import { readdirSync, readFileSync, statSync } from 'fs';
import { join, basename } from 'path';

const COPILOT_PATH = '.github/instructions/COPILOT.instructions.md';
let exitCode = 0;

function walk(dir, acc=[]) {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    const s = statSync(p);
    if (s.isDirectory()) walk(p, acc); else if (p.endsWith('.md')) acc.push(p);
  }
  return acc;
}

const taskRoots = ['tasks/todo','tasks/in-progress','tasks/review','tasks/done'];
const taskFiles = taskRoots.flatMap(r => {
  try { return walk(r, []); } catch { return []; }
});

const STATUS_BY_FOLDER = {
  'todo': 'todo', 'in-progress':'in-progress', 'review':'review', 'done':'done'
};

const issues = [];
for (const file of taskFiles) {
  const content = readFileSync(file,'utf8');
  const m = content.match(/Status:\s*([^\n]+)/i);
  if (!m) { issues.push(`${file}: Missing Status header`); continue; }
  const declared = m[1].trim().toLowerCase();
  const folder = basename(join(file, '..'));
  const expected = STATUS_BY_FOLDER[folder];
  if (expected && declared !== expected) {
    issues.push(`${file}: Status '${declared}' does not match folder '${folder}'`);
  }
  // Acceptance Criteria presence
  if (!/## Acceptance Criteria/i.test(content)) {
    issues.push(`${file}: Missing '## Acceptance Criteria' section`);
  }
}

if (issues.length) {
  console.error('\nTask Governance Issues:');
  for (const i of issues) console.error(' -', i);
  console.error(`\nRefer to ${COPILOT_PATH} before committing.`);
  exitCode = 1;
} else {
  console.log('✅ Task governance checks passed. (Remember: review COPILOT instructions if changing process)');
}

process.exit(exitCode);
