#!/usr/bin/env node
/**
 * Migration script: converts existing legacy pipeline tasks in /tasks/* into speca-chat structure.
 * - Reads tasks/{todo,in-progress,review,done}/*.md
 * - Parses header fields (ID from '# Task:' and Status/Story/Created/Type/Related)
 * - Extracts Acceptance Criteria checklist items
 * - Groups by original Story (string) -> assigns sequential story-NNN folder if not already mapped
 * - Writes story folder with story.md + story.yml if new
 * - Writes task YAML (ID preserved) + copies original markdown narrative to <id>.task.md (pruned header duplication)
 * - Regenerates board via generate-board.mjs
 */
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const CWD = process.cwd();
const LEGACY_ROOT = path.join(CWD, 'tasks');
const SPECA_ROOT = path.join(CWD, 'speca-chat');
const STORIES_ROOT = path.join(SPECA_ROOT, 'stories');
const BOARD_SCRIPT = path.join(SPECA_ROOT, 'scripts', 'generate-board.mjs');

const PIPELINE_STATUSES = ['backlog','todo','in-progress','review','done'];
// Some legacy tasks may still say 'in-progress' etc.

function safeKebab(str){
  return (str||'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'')||'story';
}

async function readIfExists(p){ try { return await fs.readFile(p,'utf8'); } catch { return null; } }

function parseTask(raw){
  const lines = raw.split(/\r?\n/);
  const first = lines[0]||'';
  let id=null; const m = first.match(/^# Task:\s*([A-Za-z0-9_-]+)/); if(m) id=m[1];
  const header = {};
  for (let i=1;i<Math.min(lines.length,40);i++){
    const l=lines[i];
    if(/^##\s/.test(l)) break;
    const hm=l.match(/^([A-Za-z0-9_-]+):\s*(.*)$/); if(hm) header[hm[1]] = hm[2].trim();
  }
  // Acceptance Criteria extraction
  const acIndex = lines.findIndex(l=>l.trim().toLowerCase()==='## acceptance criteria');
  const acceptance=[];
  if(acIndex!==-1){
    for(let i=acIndex+1;i<lines.length;i++){
      const l=lines[i];
      if(/^##\s+/.test(l)) break;
      const cm = l.match(/^- \[(?: |x|X)\]\s*(.*)$/); if(cm) acceptance.push(cm[1].trim());
    }
  }
  return { id, header, acceptance, raw, lines };
}

async function ensureDir(p){ await fs.mkdir(p,{recursive:true}); }

async function nextStoryId(existing){
  let n=1; while(existing.has(`story-${String(n).padStart(3,'0')}`)) n++;
  return `story-${String(n).padStart(3,'0')}`;
}

async function loadStoryIndex(){
  const idxPath = path.join(STORIES_ROOT,'index.yml');
  const raw = await readIfExists(idxPath);
  const map = new Map();
  const list=[];
  if(raw){
    for (const line of raw.split(/\r?\n/)){
      const m=line.match(/^- id:\s*(story-[0-9]+)/); if(m) list.push({ id:m[1] });
      const t=line.match(/title:\s*(.+)$/); if(t && list.length) list[list.length-1].title=t[1];
      const p=line.match(/path:\s*(.+)$/); if(p && list.length) list[list.length-1].path=p[1];
    }
    for (const s of list) map.set(s.id,s);
  }
  return { idxPath, list, map };
}

async function writeStoryIndex(stories){
  const lines=['stories:'];
  for (const s of stories){
    lines.push(`  - id: ${s.id}`);
    lines.push(`    title: ${s.title}`);
    lines.push(`    status: ${s.status||'active'}`);
    lines.push(`    path: stories/${s.id}/story.yml`);
  }
  await fs.writeFile(path.join(STORIES_ROOT,'index.yml'), lines.join('\n')+'\n','utf8');
}

async function main(){
  // Map original story string -> storyId
  const storyMapping = new Map();
  const existingStoryIds = new Set();
  await ensureDir(STORIES_ROOT);
  const { list: existingStories } = await loadStoryIndex();
  for (const s of existingStories) existingStoryIds.add(s.id);

  const createdStories=[]; // for index rewrite
  for (const status of PIPELINE_STATUSES){
    const dir = path.join(LEGACY_ROOT, status);
    let entries=[]; try { entries = await fs.readdir(dir,{withFileTypes:true}); } catch { continue; }
    for (const e of entries){
      if(!e.isFile() || !e.name.endsWith('.md')) continue;
      const file = path.join(dir,e.name);
      const raw = await fs.readFile(file,'utf8');
      const parsed = parseTask(raw);
      if(!parsed.id) { console.warn('Skipping (no id):', file); continue; }
      const originalStory = parsed.header.Story || 'unassigned';
      if(!storyMapping.has(originalStory)){
        // Find existing with similar title first
        let newId = await nextStoryId(existingStoryIds);
        existingStoryIds.add(newId);
        storyMapping.set(originalStory,newId);
        // Create story folder
        const storyDir = path.join(STORIES_ROOT,newId);
        await ensureDir(path.join(storyDir,'tasks'));
        // story.md
        const narrative = `# Story: ${originalStory}\n\nMigrated automatically from legacy pipeline.\n`;
        await fs.writeFile(path.join(storyDir,'story.md'), narrative,'utf8');
        const storyMeta = `id: ${newId}\ntitle: ${originalStory}\nstatus: active\ncreated: ${parsed.header.Created||'2025-09-20'}\n`;
        await fs.writeFile(path.join(storyDir,'story.yml'), storyMeta,'utf8');
        createdStories.push({ id:newId, title: originalStory, status:'active' });
      }
      const storyId = storyMapping.get(originalStory);
      const storyDir = path.join(STORIES_ROOT,storyId);
      const tasksDir = path.join(storyDir,'tasks');
      await ensureDir(tasksDir);
      const baseId = parsed.id; // Keep original (IMP-###)
      const taskYamlPath = path.join(tasksDir, `${baseId}.task.yml`);
      if(await readIfExists(taskYamlPath)) { continue; } // already migrated
      const yamlLines = [];
      yamlLines.push(`id: ${baseId}`);
      yamlLines.push(`story: ${storyId}`);
      yamlLines.push(`title: ${parsed.header.Title || baseId}`);
      yamlLines.push(`status: ${(parsed.header.Status||status).toLowerCase()}`);
      if(parsed.header.Created) yamlLines.push(`created: ${parsed.header.Created}`);
      const updated = parsed.header.Updated || parsed.header.Created;
      if(updated) yamlLines.push(`updated: ${updated}`);
      if(parsed.header.Type) yamlLines.push(`type: ${parsed.header.Type.toLowerCase()}`);
      if(parsed.header.Owner) yamlLines.push(`owner: ${parsed.header.Owner}`);
      if(parsed.header.Related) {
        const rel = parsed.header.Related.split(/[\s,]+/).filter(Boolean);
        if(rel.length) yamlLines.push(`related: [${rel.join(', ')}]`);
      }
      if(parsed.acceptance.length){
        yamlLines.push('acceptance:');
        for (const a of parsed.acceptance) yamlLines.push(`  - ${a}`);
      }
      await fs.writeFile(taskYamlPath, yamlLines.join('\n')+'\n','utf8');
      // Write markdown narrative stripped of duplicate header lines (keep summary sections)
      await fs.writeFile(path.join(tasksDir, `${baseId}.task.md`), raw,'utf8');
    }
  }

  // Merge existing + newly created stories for index
  const indexStories = [...existingStories.map(s=>({id:s.id,title:s.title,status:'active'})), ...createdStories]
    .sort((a,b)=>a.id.localeCompare(b.id));
  await writeStoryIndex(indexStories);

  // Generate board
  try {
    await import(BOARD_SCRIPT + '?cacheBust='+Date.now());
  } catch (e) {
    console.warn('Board generation failed (run manually):', e.message);
  }

  console.log(`Migration complete. Stories created: ${createdStories.length}`);
}

main().catch(e=>{ console.error(e); process.exit(2); });
