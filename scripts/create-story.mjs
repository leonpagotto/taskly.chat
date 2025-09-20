#!/usr/bin/env node
import { promises as fs } from 'fs';
import path from 'path';

/*
Create a new story folder with canonical story.md using template if present.
Usage:
  node scripts/create-story.mjs "Human Title" <slug> [--area domain] [--status active]
*/

const ROOT = process.cwd();
const STORIES_ROOT = path.join(ROOT,'stories');

function today() { return new Date().toISOString().slice(0,10); }

async function main() {
  const args = process.argv.slice(2);
  if (args.length < 2) {
    console.error('Usage: node scripts/create-story.mjs "Human Title" <slug> [--area domain] [--status active]');
    process.exit(1);
  }
  const title = args[0];
  const slug = args[1];
  const areaIdx = args.indexOf('--area');
  const statusIdx = args.indexOf('--status');
  const area = areaIdx !== -1 ? args[areaIdx+1] : '';
  const status = statusIdx !== -1 ? args[statusIdx+1] : 'active';
  const dir = path.join(STORIES_ROOT, slug);
  await fs.mkdir(path.join(dir,'Backlog'), { recursive: true });
  const templatePath = path.join(ROOT,'templates','story.template.md');
  let content;
  try {
    let tpl = await fs.readFile(templatePath,'utf8');
    tpl = tpl.replace('<Human Readable Title>', title)
             .replace('<story-slug>', slug)
             .replace('active', status)
             .replace('<YYYY-MM-DD>', today())
             .replace('<domain>', area || '')
             .replace('<Concise narrative of the problem/goal and user value.>', 'TODO')
             .replace('<Outcome 1>', 'Outcome 1')
             .replace('<Outcome 2>', 'Outcome 2');
    content = tpl;
  } catch {
    content = `# Story: ${title}\nSlug: ${slug}\nStatus: ${status}\nCreated: ${today()}\nOwner: \nArea: ${area}\n\n## Summary\nTODO\n\n## Progress Log\n- ${today()} Story created\n`;
  }
  const filePath = path.join(dir,'story.md');
  await fs.writeFile(filePath, content, 'utf8');
  console.log('Created story', path.relative(ROOT,filePath));
}

main().catch(err => { console.error(err); process.exit(1); });
