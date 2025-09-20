#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function usage() {
  console.log('Usage: pnpm spec:scaffold:story <next-number> <slug> "Title"');
  console.log('Example: pnpm spec:scaffold:story 018 calendar-insights "Calendar Insights Overlay"');
}

const [,, numberArg, slugArg, ...titleParts] = process.argv;
if (!numberArg || !slugArg || titleParts.length === 0) {
  usage();
  process.exit(1);
}

const storyNumber = String(numberArg).padStart(3, '0');
const slug = slugArg.trim();
const titleHuman = titleParts.join(' ').trim();
const id = `story-${storyNumber}`;
const created = new Date().toISOString().slice(0,10);

const storiesRoot = path.resolve(__dirname, '..', 'stories');
const storyDir = path.join(storiesRoot, id);
if (fs.existsSync(storyDir)) {
  console.error(`Directory already exists: ${storyDir}`);
  process.exit(1);
}
fs.mkdirSync(path.join(storyDir, 'tasks'), { recursive: true });

const storyYml = `id: ${id}\nslug: ${slug}\ntitle: ${titleHuman}\nstatus: backlog\ncreated: ${created}\nsummary: TODO: Add concise summary for ${titleHuman}.\n`;
fs.writeFileSync(path.join(storyDir, 'story.yml'), storyYml, 'utf8');

// Load story template
const templatePath = path.resolve(__dirname, '..', 'templates', 'story.template.md');
let mdTemplate = fs.readFileSync(templatePath, 'utf8');
mdTemplate = mdTemplate.replace('<Human Readable Title>', titleHuman);
fs.writeFileSync(path.join(storyDir, 'story.md'), mdTemplate, 'utf8');

console.log(`Scaffolded ${id} at ${storyDir}`);
