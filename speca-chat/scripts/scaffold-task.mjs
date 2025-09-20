#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function usage() {
  console.log('Usage: pnpm spec:scaffold:task <story-number> <TASK-ID> <type> "Summary"');
  console.log('Example: pnpm spec:scaffold:task 018 DEV-001 feature "Implement calendar insights API"');
}

const [,, storyNumberArg, taskIdArg, typeArg, ...summaryParts] = process.argv;
if (!storyNumberArg || !taskIdArg || !typeArg || summaryParts.length === 0) {
  usage();
  process.exit(1);
}

const storyId = `story-${String(storyNumberArg).padStart(3, '0')}`;
const storiesRoot = path.resolve(__dirname, '..', 'stories');
const storyDir = path.join(storiesRoot, storyId);
if (!fs.existsSync(storyDir)) {
  console.error(`Story directory does not exist: ${storyDir}`);
  process.exit(1);
}

const tasksDir = path.join(storyDir, 'tasks');
const taskId = taskIdArg;
const created = new Date().toISOString().slice(0,10);
const summary = summaryParts.join(' ').trim();

const yamlPath = path.join(tasksDir, `${taskId}.task.yml`);
if (fs.existsSync(yamlPath)) {
  console.error(`Task YAML already exists: ${yamlPath}`);
  process.exit(1);
}

const taskYml = `id: ${taskId}\nstory: ${storyId}\nstatus: backlog\ntype: ${typeArg}\ncreated: ${created}\nsummary: ${summary}\nacceptance:\n  - TODO: Define first acceptance criterion.\nnotes: |\n  ${created} Created task scaffold.\n`;
fs.writeFileSync(yamlPath, taskYml, 'utf8');

// Load task narrative template
const templatePath = path.resolve(__dirname, '..', 'templates', 'task.template.md');
let mdTemplate = fs.readFileSync(templatePath, 'utf8');
mdTemplate = mdTemplate.replace('<TASK-ID>', taskId);
fs.writeFileSync(path.join(tasksDir, `${taskId}.task.md`), mdTemplate, 'utf8');

console.log(`Scaffolded task ${taskId} under ${storyId}`);
