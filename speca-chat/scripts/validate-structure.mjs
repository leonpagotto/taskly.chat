#!/usr/bin/env node
import { promises as fs } from 'fs';
import path from 'path';

const ROOT = path.resolve(process.cwd(), 'speca-chat');
const STORIES = path.join(ROOT, 'stories');
const BOARD = path.join(ROOT, 'board');
const STATUSES = new Set(['backlog','in-progress','review','done']);

function parseYaml(raw){
  const obj={};
  for (const line of raw.split(/\r?\n/)) {
    const m=line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/); if(m) obj[m[1]]=m[2];
  }
  return obj;
}

async function gatherStoryTasks(){
  const stories = await fs.readdir(STORIES,{withFileTypes:true});
  const tasks=[]; const ids=new Set();
  for (const s of stories){
    if(!s.isDirectory()||!/^story-/.test(s.name)) continue;
    const tasksDir=path.join(STORIES,s.name,'tasks');
    let taskEntries=[]; try { taskEntries=await fs.readdir(tasksDir,{withFileTypes:true}); } catch {}
    for (const te of taskEntries){
      if(te.isFile() && te.name.endsWith('.task.yml')){
        const full=path.join(tasksDir,te.name);
        const meta=parseYaml(await fs.readFile(full,'utf8'));
        if(!meta.id) throw new Error(`Missing id in ${full}`);
        if(ids.has(meta.id)) throw new Error(`Duplicate task id ${meta.id}`);
        ids.add(meta.id);
        if(!STATUSES.has(meta.status)) throw new Error(`Invalid status ${meta.status} in ${full}`);
        tasks.push({ ...meta, file: full });
      }
    }
  }
  return tasks;
}

async function validateBoard(tasks){
  const byStatus = new Map();
  for (const t of tasks){
    if(!byStatus.has(t.status)) byStatus.set(t.status,new Set());
    byStatus.get(t.status).add(t.id);
  }
  const missing=[]; const stale=[];
  for (const st of STATUSES){
    const dir=path.join(BOARD,st);
    let entries=[]; try { entries=await fs.readdir(dir,{withFileTypes:true}); } catch {}
    const present=new Set();
    for (const e of entries){
      if(!e.isFile()||!e.name.endsWith('.yml')) continue;
      const raw=await fs.readFile(path.join(dir,e.name),'utf8');
      const meta=parseYaml(raw);
      if(!meta.id) throw new Error(`Board ref missing id: ${dir}/${e.name}`);
      if(meta.status!==st) throw new Error(`Board ref status mismatch ${meta.id} expected folder ${st}`);
      present.add(meta.id);
      if(!byStatus.get(st)?.has(meta.id)) stale.push(meta.id);
    }
    // Find tasks with this status missing from board
    for (const id of byStatus.get(st)||[]) if(!present.has(id)) missing.push(id);
  }
  if (missing.length || stale.length) {
    const lines=[];
    if (missing.length) lines.push(`Missing board refs: ${missing.join(', ')}`);
    if (stale.length) lines.push(`Stale board refs (no matching task): ${stale.join(', ')}`);
    throw new Error(lines.join('\n'));
  }
}

// Simple schema loader + validator (light-weight, not full JSON Schema implementation)
async function loadSchema(name){
  const file=path.join(ROOT, name);
  const raw=await fs.readFile(file,'utf8');
  const schema={};
  for (const line of raw.split(/\r?\n/)) {
    // extremely naive parse for 'required:' & 'pattern:' usage minimal
    if (line.startsWith('required:')) {
      const arr=line.match(/\[(.*)\]/);
      if(arr) schema.required=arr[1].split(',').map(s=>s.trim()).filter(Boolean);
    }
  }
  return schema;
}

function applySchema(meta, schema, file){
  if(schema.required){
    for (const r of schema.required){
      if(!(r in meta)) throw new Error(`Missing required field '${r}' in ${file}`);
    }
  }
}

async function validateSchemas(tasks){
  const taskSchema=await loadSchema('task.schema.yml');
  for (const t of tasks) applySchema(t, taskSchema, t.file);
}

async function main(){
  const tasks = await gatherStoryTasks();
  await validateSchemas(tasks);
  await validateBoard(tasks);
  console.log(`Structure valid: ${tasks.length} tasks (board consistent).`);
}

main().catch(e=>{ console.error(e.message||e); process.exit(2); });
