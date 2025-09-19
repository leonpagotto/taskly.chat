#!/usr/bin/env node
import { promises as fs } from 'fs';
import path from 'path';

const ROOT = path.resolve(process.cwd(), 'docs/taskly-chat/stories');
const REQUIRED = ['Status','Story','Created','Type'];
const STATUS_VALUES = new Set(['Backlog','InProgress','Review','Done']);

function parseHeader(lines) {
  const map = {};
  for (const line of lines) {
    const m = line.match(/^(\w+):\s*(.*)$/);
    if (m) map[m[1]] = m[2].trim();
    if (line.trim() === '' || line.startsWith('##')) break; // stop early once body begins
  }
  return map;
}

async function validateTask(file) {
  const raw = await fs.readFile(file,'utf8');
  const lines = raw.split(/\r?\n/);
  const titleOk = lines[0].startsWith('# Task:');
  const header = parseHeader(lines.slice(1,15));
  const errors = [];
  if (!titleOk) errors.push('Missing or malformed title line (# Task: ...)');
  for (const f of REQUIRED) if (!header[f]) errors.push(`Missing field: ${f}`);
  if (header.Status && !STATUS_VALUES.has(header.Status)) errors.push(`Invalid Status: ${header.Status}`);
  return { file, errors };
}

async function walk(dir, acc=[]) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) await walk(full, acc);
  else if (e.isFile() && e.name.endsWith('.md') && /(\/Backlog\/|\/InProgress\/|\/Review\/|\/Done\/)/.test(full.replace(/\\/g,'/'))) {
      // only validate task files, skip story.md
      if (e.name === 'story.md') continue;
      acc.push(full);
    }
  }
  return acc;
}

async function main() {
  const files = await walk(ROOT);
  let invalid = 0;
  for (const f of files) {
    const { errors } = await validateTask(f);
    if (errors.length) {
      invalid++;
      console.error(`\n✗ ${f}`);
      for (const er of errors) console.error('  -', er);
    }
  }
  const summary = `${files.length - invalid}/${files.length} valid tasks`;
  if (invalid) {
    console.error(`\nValidation failed: ${summary}`);
    process.exit(2);
  } else {
    console.log(`Validation passed: ${summary}`);
  }
}

main().catch(err => { console.error(err); process.exit(1); });
