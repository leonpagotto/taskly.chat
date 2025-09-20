#!/usr/bin/env node
// Refines placeholder acceptance criteria by extracting bullet points from the Legacy Body section.
// Idempotent: skips files whose Acceptance Criteria section no longer contains the placeholder line.
// Usage: node scripts/refine-acceptance-criteria.mjs [--dry]

import { promises as fs } from 'fs';
import path from 'path';

const ROOT = process.cwd();
const STORIES_DIR = path.join(ROOT, 'stories');
const PLACEHOLDER_LINE = '- [ ] (Legacy acceptance criteria embedded in legacy body or to be refined)';

async function* walk(dir) {
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      yield* walk(full);
    } else if (entry.isFile()) {
      yield full;
    }
  }
}

function splitSections(content) {
  const lines = content.split(/\r?\n/);
  const sections = [];
  let current = { heading: 'TOP', lines: [] };
  for (const line of lines) {
    if (line.startsWith('## ')) {
      sections.push(current);
      current = { heading: line.substring(3).trim(), lines: [] };
    } else {
      current.lines.push(line);
    }
  }
  sections.push(current);
  return sections; // heading 'TOP' contains the header metadata lines
}

function joinSections(sections) {
  const out = [];
  for (const sec of sections) {
    if (sec.heading === 'TOP') {
      out.push(...sec.lines);
    } else {
      out.push(`## ${sec.heading}`);
      out.push(...sec.lines);
    }
  }
  return out.join('\n');
}

function extractLegacyBody(sections) {
  const legacy = sections.find(s => s.heading.toLowerCase() === 'legacy body');
  if (!legacy) return '';
  let body = legacy.lines.join('\n').trim();
  // Remove leading YAML-ish meta fenced block if present
  if (body.startsWith('---')) {
    const end = body.indexOf('\n---', 3);
    if (end !== -1) body = body.slice(end + 4).trim();
  }
  return body;
}

function deriveAcceptanceCriteria(body) {
  if (!body) return [];
  const lines = body.split(/\r?\n/);
  const bullets = [];
  let collecting = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/^\s*[-*]\s+/.test(line)) {
      if (!collecting) collecting = true;
      const cleaned = line.replace(/^\s*[-*]\s+/, '').trim();
      if (cleaned.length > 1) bullets.push(cleaned.replace(/\.$/, ''));
      continue;
    }
    // End collection when we leave a contiguous bullet block
    if (collecting) {
      if (line.trim() === '') break; // stop at blank line after first bullet group
      if (!/^\s{2,}/.test(line)) break; // non-indented continuation -> stop (avoid later unrelated bullet groups)
    }
  }
  return bullets;
}

function hasPlaceholderAC(section) {
  if (!section) return false;
  return section.lines.some(l => l.trim() === PLACEHOLDER_LINE);
}

function refineFileContent(content, todayISO) {
  const sections = splitSections(content);
  const acSection = sections.find(s => s.heading.toLowerCase() === 'acceptance criteria');
  if (!hasPlaceholderAC(acSection)) return { changed: false, content };
  const legacyBody = extractLegacyBody(sections);
  const bullets = deriveAcceptanceCriteria(legacyBody);
  if (!bullets.length) return { changed: false, content }; // nothing to refine
  acSection.lines = ['', ...bullets.map(b => `- [ ] ${b}`), ''];
  // Progress Log
  let progress = sections.find(s => s.heading.toLowerCase() === 'progress log');
  if (!progress) {
    progress = { heading: 'Progress Log', lines: [] };
    sections.push(progress);
  }
  const newEntry = `- ${todayISO} Refined acceptance criteria (auto)`;
  if (!progress.lines.some(l => l.includes('Refined acceptance criteria'))) {
    // Insert at top (after any existing blank/heading lines)
    const existing = progress.lines.filter(Boolean);
    progress.lines = [newEntry, ...(existing.length ? ['', ...existing] : [])];
  }
  // Implementation Notes append
  let impl = sections.find(s => s.heading.toLowerCase() === 'implementation notes');
  if (!impl) {
    impl = { heading: 'Implementation Notes', lines: [] };
    sections.splice(sections.findIndex(s => s.heading.toLowerCase() === 'progress log'), 0, impl);
  }
  if (!impl.lines.some(l => l.includes('Acceptance criteria refined'))) {
    if (impl.lines.length) impl.lines.push('');
    impl.lines.push('Acceptance criteria refined automatically from legacy bullet list.');
  }
  return { changed: true, content: joinSections(sections) };
}

async function main() {
  const args = process.argv.slice(2);
  const dry = args.includes('--dry');
  const today = new Date().toISOString().slice(0,10);
  const targets = [];
  for await (const file of walk(STORIES_DIR)) {
    if (!file.endsWith('.md')) continue;
    const raw = await fs.readFile(file, 'utf8');
    if (!raw.includes(PLACEHOLDER_LINE)) continue;
    targets.push({ file, raw });
  }
  if (!targets.length) {
    console.log('No files with placeholder acceptance criteria found.');
    return;
  }
  let refined = 0;
  for (const t of targets) {
    const { changed, content } = refineFileContent(t.raw, today);
    if (changed) {
      refined++;
      if (dry) {
        console.log('Would refine:', t.file);
      } else {
        await fs.writeFile(t.file, content, 'utf8');
      }
    }
  }
  if (dry) console.log(`Dry run complete. ${refined} files would be refined.`);
  else console.log(`Refined ${refined} files.`);
}

main().catch(err => { console.error(err); process.exit(1); });
