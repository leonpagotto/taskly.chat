#!/usr/bin/env node
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(process.cwd());
const SPEC_ROOT = path.join(ROOT,'speca-chat');
const STORIES_ROOT = path.join(SPEC_ROOT,'stories');

async function loadStoryIndex(){
  const idxFile=path.join(STORIES_ROOT,'index.yml');
  const raw=await fs.readFile(idxFile,'utf8');
  const titles=[]; for (const line of raw.split(/\r?\n/)){ const m=line.match(/title:\s*(.+)$/); if(m) titles.push(m[1].trim()); }
  return {file:idxFile, titles, raw};
}

async function main(){
  const archiveDir=path.join(ROOT,'archive');
  const stamps=await fs.readdir(archiveDir,{withFileTypes:true});
  if(!stamps.length) { console.log('No archive found'); return; }
  // Pick latest timestamp
  const latest=stamps.filter(d=>d.isDirectory()).map(d=>d.name).sort().pop();
  const legacyStories=path.join(archiveDir, latest,'legacy-stories');
  const entries=await fs.readdir(legacyStories,{withFileTypes:true});
  const indexRaw=await fs.readFile(path.join(STORIES_ROOT,'index.yml'),'utf8');
  const existingTitles=new Set();
  for (const line of indexRaw.split(/\r?\n/)){ const m=line.match(/title:\s*(.+)$/); if(m) existingTitles.add(m[1].trim()); }
  // Determine next story id number
  const existingIds=[...indexRaw.matchAll(/id:\s*story-(\d+)/g)].map(m=>parseInt(m[1],10));
  let nextNum=Math.max(0,...existingIds)+1;
  const additions=[];
  for (const e of entries){
    if(!e.isDirectory()) continue;
    const title=e.name; if(existingTitles.has(title)) continue; // skip existing
    const storyId=`story-${String(nextNum).padStart(3,'0')}`;
    nextNum++;
    const newDir=path.join(STORIES_ROOT, storyId);
    await fs.mkdir(newDir,{recursive:true});
    // Create story.yml (minimal)
    const storyYml=`id: ${storyId}\ntitle: ${title}\nstatus: active\ncreated: ${new Date().toISOString().slice(0,10)}\n`; 
    await fs.writeFile(path.join(newDir,'story.yml'), storyYml,'utf8');
    // Copy story.md if exists
    const legacyStoryMd=path.join(legacyStories,title,'story.md');
    let storyMd='# '+title+'\n\nMigrated from archive.'; 
    try { storyMd=await fs.readFile(legacyStoryMd,'utf8'); } catch {}
    await fs.writeFile(path.join(newDir,'story.md'), storyMd,'utf8');
    // Tasks
    const tasksDir=path.join(newDir,'tasks'); await fs.mkdir(tasksDir,{recursive:true});
    const legacyBacklog=path.join(legacyStories,title,'Backlog');
    let legacyTaskFiles=[]; try { legacyTaskFiles=await fs.readdir(legacyBacklog); } catch {}
    for (const f of legacyTaskFiles){
      if(!f.endsWith('.md')) continue;
      const legacyPath=path.join(legacyBacklog,f);
      const raw=await fs.readFile(legacyPath,'utf8');
  const id=f.replace(/\.md$/,'');
  const parts=id.split('-');
  const taskId = parts.length>=2 ? parts[0]+'-'+parts[1] : id;
      const today=new Date().toISOString().slice(0,10);
      // Extract header lines
      let status='backlog', type='chore', owner='', related=[];
      for (const line of raw.split(/\r?\n/).slice(0,15)){
        const m=line.match(/^(Status|Type|Owner|Related):\s*(.*)$/i); if(!m) continue;
        const key=m[1].toLowerCase(); const val=m[2].trim();
        if(key==='status' && val) status=val.toLowerCase();
        else if(key==='type' && val) type=val.toLowerCase();
        else if(key==='owner') owner=val;
        else if(key==='related' && val) related=val.split(/[,\s]+/).filter(Boolean);
      }
      if(!['backlog','in-progress','review','done'].includes(status)) status='backlog';
      const relatedLine = related.length ? `related: [${related.join(', ')}]\n` : '';
      const ownerLine = owner ? `owner: ${owner}\n` : '';
      const meta=`id: ${taskId}\nstory: ${storyId}\ntitle: ${taskId}\nstatus: ${status}\ncreated: ${today}\ntype: ${type}\n${ownerLine}${relatedLine}acceptance:\n  - Migrated placeholder\n`;
      await fs.writeFile(path.join(tasksDir, `${taskId}.task.yml`), meta,'utf8');
      await fs.writeFile(path.join(tasksDir, `${taskId}.task.md`), `# ${taskId}\n\nMigrated legacy task from ${f}.\n`, 'utf8');
    }
    additions.push({storyId,title});
  }
  // Append new entries to story index
  if(additions.length){
    const lines=indexRaw.trimEnd().split(/\r?\n/);
    for (const a of additions){
      lines.push(`  - id: ${a.storyId}`);
      lines.push(`    title: ${a.title}`);
      lines.push(`    status: active`);
      lines.push(`    path: stories/${a.storyId}/story.yml`);
    }
    await fs.writeFile(path.join(STORIES_ROOT,'index.yml'), lines.join('\n')+'\n','utf8');
  }
  console.log(`Migrated ${additions.length} stories.`);
  // Regenerate board after import
  try { await import('./generate-board.mjs'); } catch {}
}

main().catch(e=>{ console.error(e); process.exit(1); });
