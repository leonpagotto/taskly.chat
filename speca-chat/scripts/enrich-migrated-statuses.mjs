#!/usr/bin/env node
import { promises as fs } from 'fs';
import path from 'path';

const ROOT=process.cwd();
const SPEC=path.join(ROOT,'speca-chat');
const STORIES=path.join(SPEC,'stories');
const ARCHIVE=path.join(ROOT,'archive');

async function latestArchive(){
  let entries=await fs.readdir(ARCHIVE,{withFileTypes:true});
  entries=entries.filter(e=>e.isDirectory()).map(e=>e.name).sort();
  return entries.pop();
}

function parseHeaders(raw){
  const out={};
  for (const line of raw.split(/\r?\n/).slice(0,20)){
    const m=line.match(/^(Status|Type|Owner|Related):\s*(.*)$/i); if(!m) continue;
    const key=m[1].toLowerCase(); const val=m[2].trim();
    out[key]=val;
  }
  return out;
}

async function collectTasks(){
  const stories=await fs.readdir(STORIES,{withFileTypes:true});
  const tasks=[];
  for (const s of stories){
    if(!s.isDirectory()||!/^story-/.test(s.name)) continue;
    const dir=path.join(STORIES,s.name,'tasks');
    let files=[]; try { files=await fs.readdir(dir); } catch {}
    for (const f of files){
      if(f.endsWith('.task.yml')) tasks.push(path.join(dir,f));
    }
  }
  return tasks;
}

function loadYamlObj(raw){
  const obj={}; let current=null; let inAcceptance=false; obj.acceptance=[];
  for (const line of raw.split(/\r?\n/)){
    if(/^acceptance:/.test(line)){ inAcceptance=true; continue; }
    if(inAcceptance){ if(/^\s*-\s+/.test(line)){ obj.acceptance.push(line.replace(/^\s*-\s+/,'').trim()); continue; } else if(line.trim()===''){ continue; } else { inAcceptance=false; } }
    const m=line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/); if(m){ obj[m[1]]=m[2]; }
  }
  return obj;
}

function serializeYaml(obj){
  const keys=['id','story','title','status','created','updated','type','owner','related'];
  const lines=[]; for (const k of keys){ if(obj[k]) lines.push(`${k}: ${obj[k]}`); }
  lines.push('acceptance:'); for (const a of obj.acceptance||[]) lines.push(`  - ${a}`);
  return lines.join('\n')+'\n';
}

async function main(){
  const latest=await latestArchive(); if(!latest){ console.error('No archive'); return; }
  const legacyTasksDir=path.join(ARCHIVE,latest,'legacy-tasks');
  // Index legacy by core id (first two segments of filename)
  const legacyIndex=new Map();
  async function indexDir(sub){
    let files=[]; try { files=await fs.readdir(path.join(legacyTasksDir,sub)); } catch { return; }
    for (const f of files){
      if(!f.endsWith('.md')) continue;
      const idCore=f.replace(/\.md$/,'').split('-').slice(0,2).join('-');
      const raw=await fs.readFile(path.join(legacyTasksDir,sub,f),'utf8');
      const headers=parseHeaders(raw);
      legacyIndex.set(idCore,{ headers, source: path.join(legacyTasksDir,sub,f) });
    }
  }
  for (const folder of ['backlog','todo','in-progress','review','done']) await indexDir(folder);

  const taskFiles=await collectTasks();
  let updated=0; const changes=[];
  for (const file of taskFiles){
    const raw=await fs.readFile(file,'utf8');
    const obj=loadYamlObj(raw);
    const legacy=legacyIndex.get(obj.id);
    if(!legacy) continue;
    const legacyStatus=(legacy.headers.status||'').toLowerCase();
    const legacyType=(legacy.headers.type||'').toLowerCase();
    const legacyOwner=legacy.headers.owner||'';
    const legacyRelated=legacy.headers.related||'';
    let changed=false;
    if(legacyStatus && legacyStatus!==obj.status){ obj.status=legacyStatus; changed=true; }
    if(legacyType && legacyType!==obj.type){ obj.type=legacyType; changed=true; }
    if(legacyOwner && legacyOwner!==obj.owner){ obj.owner=legacyOwner; changed=true; }
    if(legacyRelated && !obj.related){ obj.related=legacyRelated; changed=true; }
    if(changed){
      updated++;
      changes.push({id:obj.id, status:obj.status, type:obj.type});
      await fs.writeFile(file, serializeYaml(obj),'utf8');
    }
  }
  console.log(`Enriched ${updated} tasks.`);
  if(changes.length) console.log(JSON.stringify(changes,null,2));
}

main().catch(e=>{ console.error(e); process.exit(1); });
