#!/usr/bin/env node
import { promises as fs } from 'fs';
import path from 'path';
const ROOT=process.cwd();
const STORIES=path.join(ROOT,'speca-chat','stories');

function parse(raw){
  const lines=raw.split(/\r?\n/); const acceptance=[]; let inAcc=false;
  for (const line of lines){
    if(/^acceptance:/.test(line)){ inAcc=true; continue; }
    if(inAcc){
      if(/^\s*-\s+/.test(line)){ acceptance.push(line.replace(/^\s*-\s+/,'').trim()); continue; }
      if(!line.trim()) continue; else break;
    }
  }
  return acceptance;
}

async function gather(){
  const out=[]; const dirs=await fs.readdir(STORIES,{withFileTypes:true});
  for (const d of dirs){
    if(!d.isDirectory()||!/^story-/.test(d.name)) continue;
    const tasksDir=path.join(STORIES,d.name,'tasks'); let files=[]; try { files=await fs.readdir(tasksDir); } catch {}
    for (const f of files){ if(f.endsWith('.task.yml')) out.push(path.join(tasksDir,f)); }
  }
  return out;
}

function replaceAcceptance(raw, newItems){
  const lines=raw.split(/\r?\n/); const out=[]; let inAcc=false; let done=false;
  for (let i=0;i<lines.length;i++){
    const line=lines[i];
    if(/^acceptance:/.test(line)){ out.push('acceptance:'); inAcc=true; continue; }
    if(inAcc){
      if(/^\s*-\s+/.test(line)) { continue; }
      if(line.trim()===''){ continue; }
      // end
      if(!/^\s*-/.test(line)){ if(!done){ for (const item of newItems) out.push('  - '+item); done=true; } out.push(line); inAcc=false; continue; }
    }
    out.push(line);
  }
  if(inAcc && !done){ for (const item of newItems) out.push('  - '+item); }
  return out.join('\n');
}

async function main(){
  const dry=process.argv.includes('--dry');
  const files=await gather();
  const placeholders=[];
  for (const f of files){
    const raw=await fs.readFile(f,'utf8');
    const acc=parse(raw);
    if(acc.length===1 && /Migrated placeholder/i.test(acc[0])){
      placeholders.push(f);
      if(!dry){
        const replaced=replaceAcceptance(raw,["Define acceptance criteria"]);
        await fs.writeFile(f,replaced+'\n','utf8');
      }
    }
  }
  console.log(`${dry?'Found':'Replaced'} ${placeholders.length} placeholder acceptance blocks.`);
  if(placeholders.length) console.log(placeholders.join('\n'));
}

main().catch(e=>{ console.error(e); process.exit(1); });
