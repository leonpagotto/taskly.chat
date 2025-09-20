#!/usr/bin/env node
import { promises as fs } from 'fs';
import path from 'path';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { parse as parseYamlFull } from 'yaml';

const ROOT = path.resolve(process.cwd(), 'speca-chat');
const STORIES = path.join(ROOT, 'stories');
const BOARD = path.join(ROOT, 'board');
const STATUSES = new Set(['backlog','in-progress','review','done']);

const parseYaml = (raw)=>parseYamlFull(raw);

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
        let raw=await fs.readFile(full,'utf8');
        // Extract acceptance block manually
        const lines=raw.split(/\r?\n/);
        const acceptance=[]; let inAccept=false; let yamlLines=[];
        for (let i=0;i<lines.length;i++){
          const line=lines[i];
            if(/^acceptance:\s*$/.test(line)){ inAccept=true; yamlLines.push('acceptance:'); continue; }
            if(inAccept){
              if(/^\s*-\s+/.test(line)){
                acceptance.push(line.replace(/^\s*-\s+/,'').trim());
                continue;
              } else if(line.trim()===''){ continue; } else { inAccept=false; }
            }
            if(!inAccept) yamlLines.push(line);
        }
        let meta;
        try { meta=parseYaml(yamlLines.join('\n')); }
        catch(err){ throw new Error(`YAML parse error in ${full}: ${err.message}`); }
        if(acceptance.length) meta.acceptance=acceptance;
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

async function loadJsonSchemaYml(file){
  const raw=await fs.readFile(path.join(ROOT,file),'utf8');
  return parseYamlFull(raw);
}

async function buildAjv(){
  const ajv = new Ajv({allErrors:true, strict:false, schemaId:'auto'});
  // Add draft 2020-12 meta schema manually (AJV v8 includes drafts but ensure availability)
  try {
    // dynamic import of meta schema
    const meta = await import('ajv/dist/refs/json-schema-draft-2020-12.json', { assert: { type: 'json' } }).catch(()=>null);
    if(meta?.default) ajv.addMetaSchema(meta.default);
  } catch {}
  addFormats(ajv);
  // Load individual schemas (task & board ref; story optional future)
  const taskSchema = await loadJsonSchemaYml('task.schema.yml');
  let boardRefSchema=null; try { boardRefSchema = await loadJsonSchemaYml('board-ref.schema.yml'); } catch {}
  return { ajv, taskSchema, boardRefSchema };
}

async function validateSchemas(tasks){
  const { ajv, taskSchema } = await buildAjv();
  // Remove $schema to bypass external meta fetch requirement
  if(taskSchema && taskSchema.$schema) delete taskSchema.$schema;
  const validate = ajv.compile(taskSchema);
  for (const t of tasks){
    if(t.id==='DEV-001'){
      // debug
      // console.error('DEBUG DEV-001 meta', JSON.stringify(t,null,2));
    }
    const ok = validate(t);
    if(!ok){
      const msg = validate.errors.map(e=>`${e.instancePath||'(root)'} ${e.message}`).join('; ');
      throw new Error(`Schema error in ${t.file}: ${msg}`);
    }
  }
}

async function main(){
  const tasks = await gatherStoryTasks();
  await validateSchemas(tasks);
  await validateBoard(tasks);
  // Build ID set for related validation
  const idSet = new Set(tasks.map(t=>t.id));
  let warnings = 0;
  const issue = (msg)=>{ console.warn(`WARN: ${msg}`); warnings++; };

  // Acceptance lint heuristics
  const strongVerb = /^(add|allow|display|show|store|persist|return|list|create|update|delete|sync|render|log|emit|calculate|validate|send|receive|schedule|track|generate)\b/i;
  // Build map for reciprocal related checking
  const relatedMap = new Map();
  for (const t of tasks){ if(Array.isArray(t.related)) relatedMap.set(t.id, new Set(t.related)); }

  for (const t of tasks){
    // related existence & reciprocity
    if (Array.isArray(t.related)){
      for (const rid of t.related){
        if(!idSet.has(rid)) {
          issue(`${t.file} references missing related task id '${rid}'`);
        } else {
          const other = relatedMap.get(rid);
            if(!other || !other.has(t.id)){
              issue(`${t.file} related '${rid}' not reciprocated`);
            }
        }
      }
    }
    // acceptance presence & quality
    if(!Array.isArray(t.acceptance) || t.acceptance.length===0){
      issue(`${t.file} has no acceptance criteria`);
    } else {
      for (const a of t.acceptance){
        if(a.length < 8) issue(`${t.file} acceptance item too short: '${a}'`);
        if(!strongVerb.test(a)) issue(`${t.file} acceptance item may lack actionable verb: '${a}'`);
      }
    }
  }
  console.log(`Structure valid: ${tasks.length} tasks (board consistent). Warnings: ${warnings}.`);
}

main().catch(e=>{ console.error(e.message||e); process.exit(2); });
