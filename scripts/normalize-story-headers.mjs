#!/usr/bin/env node
import { promises as fs } from 'fs';
import path from 'path';

/*
Normalize legacy story.md headers to canonical form defined in STORY_TASK_STRUCTURE.md.
Canonical header block (top of file):
  # Story: <Title>
  Slug: <slug>
  Status: <active|paused|deprecated>
  Created: <YYYY-MM-DD>
  Owner: 
  Area: <domain>

Rules:
 - If existing file already starts with '# Story:' keep as-is (skip).
 - Derive Title from first 'title:' line in legacy meta fence or from first non-empty line after header markers.
 - Derive Slug from directory name (folder under stories/).
 - Status: if existing 'Status:' line present, reuse (normalized lowercase except initial '# Story:' line).
 - Created: reuse existing 'Created:' if present else fallback to file ctime.
 - Preserve rest of original content below the new header separated by a blank line.
 - Idempotent: running again should produce zero changes.

Usage: node scripts/normalize-story-headers.mjs [--dry]
*/

const ROOT = process.cwd();
const STORIES_DIR = path.join(ROOT,'stories');

async function* walkStories() {
  const entries = await fs.readdir(STORIES_DIR,{withFileTypes:true});
  for (const e of entries) {
    if (e.isDirectory() && /\d+-/.test(e.name)) {
      const storyFile = path.join(STORIES_DIR, e.name, 'story.md');
      const exists = await fs.access(storyFile).then(()=>true).catch(()=>false);
      if (exists) yield { slug: e.name, file: storyFile };
    }
  }
}

function parseLegacy(raw) {
  const lines = raw.split(/\r?\n/);
  if (lines[0].startsWith('# Story:')) {
    const areaLine = lines.find(l=>l.startsWith('Area:'));
    const areaEmpty = areaLine && /^Area:\s*$/.test(areaLine);
    return { alreadyCanonical: true, lines, areaEmpty };
  }
  let status = null; let created = null; let owner = '';
  for (const l of lines.slice(0,12)) {
    if (l.startsWith('Status:')) status = l.split(':').slice(1).join(':').trim();
    else if (l.startsWith('Created:')) created = l.split(':').slice(1).join(':').trim();
    else if (l.startsWith('Owner:')) owner = l.split(':').slice(1).join(':').trim();
  }
  // Try legacy YAML-ish fence lines for title
  let title = null;
  const metaStart = lines.findIndex(l=>l.trim()==='---');
  if (metaStart !== -1) {
    const metaEnd = lines.slice(metaStart+1).findIndex(l=>l.trim()==='---');
    if (metaEnd !== -1) {
      const metaLines = lines.slice(metaStart+1, metaStart+1+metaEnd);
      for (const ml of metaLines) {
        const m = ml.match(/^title:\s*(.+)$/i); if (m) { title = m[1].trim(); break; }
      }
    }
  }
  if (!title) {
    // Fallback: first non-empty, non-delimiter line after optional Status line cluster
    for (const l of lines) {
      if (!l.trim()) continue;
      if (/^Status:/i.test(l) || l.trim()==='---') continue;
      if (/^id:/i.test(l)) continue;
      title = l.replace(/^#+\s*/, '').trim();
      break;
    }
  }
  return { alreadyCanonical: false, status, created, owner, title, restLines: lines };
}

function inferArea(slug) {
  // Simple heuristic mapping; extend as needed
  if (slug.includes('automation')) return 'automation';
  if (slug.includes('import') || slug.includes('sync')) return 'tasks-board';
  if (slug.includes('task-creation')) return 'nlp-intake';
  if (slug.includes('memory')) return 'memory';
  if (slug.includes('calendar')) return 'integrations';
  if (slug.includes('collaborator') || slug.includes('collaboration')) return 'collaboration';
  return 'general';
}

async function normalize({ slug, file }, dry, today) {
  const raw = await fs.readFile(file,'utf8');
  const parsed = parseLegacy(raw);
  if (parsed.alreadyCanonical && !parsed.areaEmpty) return { changed: false };
  if (parsed.alreadyCanonical && parsed.areaEmpty) {
    // Replace just Area line
    const lines = parsed.lines.slice();
    const slug = path.basename(path.dirname(file));
    const area = inferArea(slug);
    for (let i=0;i<lines.length;i++) if (lines[i].startsWith('Area:')) lines[i] = `Area: ${area}`;
    const next = lines.join('\n');
    if (!dry) await fs.writeFile(file,next,'utf8');
    return { changed: next !== raw };
  }
  const stat = await fs.stat(file);
  const created = parsed.created || stat.birthtime.toISOString().slice(0,10) || today;
  const status = (parsed.status || 'active').toLowerCase();
  const title = parsed.title || slug.replace(/^[0-9]+-/, '').replace(/-/g,' ');
  const owner = parsed.owner || '';
  // Remove leading legacy lines up until first blank after possible meta fence
  let startIdx = 0;
  // If starts with Status or meta fence, attempt to locate first blank line after those
  for (let i=0;i<parsed.restLines.length;i++) {
    if (parsed.restLines[i].trim()==='') { startIdx = i+1; break; }
  }
  const body = parsed.restLines.slice(startIdx).join('\n').trim();
  const area = inferArea(slug);
  const header = [
    `# Story: ${title}`,
    `Slug: ${slug}`,
    `Status: ${status}`,
    `Created: ${created}`,
    `Owner: ${owner}`,
    `Area: ${area}`
  ].join('\n');
  const next = header + '\n\n' + body + '\n';
  if (next === raw) return { changed: false };
  if (!dry) await fs.writeFile(file, next, 'utf8');
  return { changed: true };
}

async function main() {
  const args = process.argv.slice(2);
  const dry = args.includes('--dry');
  const today = new Date().toISOString().slice(0,10);
  let total = 0; let changed = 0; let skipped = 0;
  for await (const s of walkStories()) {
    total++;
    const res = await normalize(s, dry, today);
    if (res.changed) {
      if (dry) console.log('Would normalize:', s.file);
      else console.log('Normalized:', s.file);
      changed++;
    } else skipped++;
  }
  console.log(dry ? `Dry run complete. ${changed}/${total} would change (${skipped} skipped).` : `Done. ${changed}/${total} changed (${skipped} skipped).`);
}

main().catch(err => { console.error(err); process.exit(1); });
