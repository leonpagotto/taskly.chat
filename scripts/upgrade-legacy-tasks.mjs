#!/usr/bin/env node
import { promises as fs } from 'fs';
import path from 'path';

const ROOT = process.cwd();
const PLACEHOLDER = 'Migrated legacy task. Improve this summary.';
const GLOB_HINT = path.join('stories');

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

function parseSections(content) {
  const lines = content.split(/\r?\n/);
  const headerEndIdx = lines.findIndex(l => l.startsWith('## '));
  const headerLines = headerEndIdx === -1 ? lines : lines.slice(0, headerEndIdx);
  const rest = headerEndIdx === -1 ? [] : lines.slice(headerEndIdx);
  // Simple section split
  const sections = {};
  let current = null; let buf = [];
  for (const line of rest) {
    if (line.startsWith('## ')) {
      if (current) sections[current] = buf.join('\n').trim();
      current = line.replace(/^##\s+/, '').trim();
      buf = [];
    } else {
      buf.push(line);
    }
  }
  if (current) sections[current] = buf.join('\n').trim();
  return { header: headerLines.join('\n').trim(), sections };
}

function extractLegacy(sections) {
  const legacyRaw = sections['Legacy Body'] || '';
  // Try to pull title & description inside the legacy fenced block if exists
  const metaMatch = legacyRaw.match(/---([\s\S]*?)---/);
  let meta = {}; let body = legacyRaw;
  if (metaMatch) {
    const metaBlock = metaMatch[1];
    body = legacyRaw.slice(metaMatch.index + metaMatch[0].length).trim();
    metaBlock.split(/\r?\n/).forEach(line => {
      const m = line.match(/^([a-zA-Z0-9_]+):\s*(.+)$/);
      if (m) meta[m[1].trim()] = m[2].trim();
    });
  }
  return { meta, body };
}

function deriveSummary(meta, body) {
  if (meta.title) return meta.title.trim();
  const firstLine = body.split(/\n+/).find(l => l.trim());
  return firstLine ? firstLine.replace(/^#+\s*/, '').slice(0, 240).trim() : 'Legacy task summary unavailable';
}

function extractAcceptance(body) {
  // Look for **Acceptance Criteria:** section style or bullet list markers
  const acIdx = body.toLowerCase().indexOf('acceptance criteria');
  if (acIdx === -1) return [];
  const tail = body.slice(acIdx).split(/\n/).slice(1); // lines after the header phrase
  const bullets = [];
  for (const line of tail) {
    if (/^\s*[-*]\s+/.test(line)) bullets.push(line.replace(/^\s*[-*]\s+/, '').trim());
    else if (line.trim() === '' && bullets.length) break; // stop at first blank after bullets
    else if (bullets.length && !/^\s{2,}/.test(line)) break;
  }
  return bullets;
}

function buildProgress(existing) {
  return existing || '- ' + new Date().toISOString().slice(0,10) + ' Upgraded legacy placeholder';
}

function reconstruct(header, originalSections, { meta, body }) {
  const summary = deriveSummary(meta, body);
  const acBullets = extractAcceptance(body);
  const progress = originalSections['Progress Log'] || buildProgress();
  const implNotesParts = [];
  if (originalSections['Implementation Notes']) implNotesParts.push(originalSections['Implementation Notes']);
  // Add note about auto-upgrade
  implNotesParts.push('Auto-upgraded from legacy placeholder via upgrade-legacy-tasks script.');
  const implNotes = implNotesParts.join('\n\n').trim();
  const migrationNote = 'Upgraded in-place; original legacy body retained below.';
  const acRendered = acBullets.length ? acBullets.map(b => `- [ ] ${b}`).join('\n') : '- [ ] (Legacy acceptance criteria embedded in legacy body or to be refined)';
  return [
    header,
    '',
    '## Summary',
    summary,
    '',
    '## Acceptance Criteria',
    acRendered,
    '',
    '## Implementation Notes',
    implNotes,
    '',
    '## Progress Log',
    progress.trim(),
    '',
    '## Migration Note',
    migrationNote,
    '',
    '## Legacy Body',
    originalSections['Legacy Body'] || body
  ].join('\n');
}

async function main() {
  const args = process.argv.slice(2);
  const dry = args.includes('--dry');
  const targets = [];
  for await (const file of walk(path.join(ROOT, GLOB_HINT))) {
    if (!file.endsWith('-migrated-legacy-task-improve-this-summary.md')) continue;
    const content = await fs.readFile(file, 'utf8');
    if (!content.includes(PLACEHOLDER)) continue; // already upgraded
    targets.push(file);
  }
  if (!targets.length) {
    console.log('No legacy placeholders found.');
    return;
  }
  console.log(`Found ${targets.length} legacy placeholder tasks.`);
  let changed = 0;
  for (const file of targets) {
    const original = await fs.readFile(file, 'utf8');
    const { header, sections } = parseSections(original);
    const legacy = extractLegacy(sections);
    const upgraded = reconstruct(header, sections, legacy);
    if (dry) {
      console.log('Would upgrade:', file);
    } else {
      await fs.writeFile(file, upgraded, 'utf8');
      changed++;
    }
  }
  console.log(dry ? 'Dry run complete.' : `Upgraded ${changed} files.`);
}

main().catch(err => { console.error(err); process.exit(1); });
