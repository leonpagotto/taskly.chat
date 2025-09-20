#!/usr/bin/env node
import { promises as fs } from 'fs';
import path from 'path';

// Maintain 'updated:' field for task YAMLs.
// Modes: add-missing | touch-changed | set-all
// Dry-run by default; pass --write to apply.

const ROOT=process.cwd();
const STORIES=path.join(ROOT,'speca-chat','stories');

function parseArgs(){
  const opts={ mode:'add-missing', write:false, since:null };
  const args=process.argv.slice(2);
  for (let i=0;i<args.length;i++){
    const a=args[i];
    if(a==='--mode') opts.mode=args[++i];
    else if(a==='--write') opts.write=true;
    else if(a==='--since') opts.since=args[++i];
    else if(a==='--help'||a==='-h'){
      console.log(`Usage: update-task-timestamps --mode <add-missing|touch-changed|set-all> [--write] [--since YYYY-MM-DD]\n`+
        `Default is dry-run; show planned modifications.`);
      process.exit(0);
    }
  }
  return opts;
}

function isoDate(d=new Date()){
  return d.toISOString().split('T')[0];
}

function extractField(raw,name){
  const m=raw.match(new RegExp(`^\\s*${name}:\\s*(.+)$`,'mi'));
  return m?m[1].trim():null;
}

function setOrReplaceField(raw,name,value){
  if(new RegExp(`^${name}:`,'m').test(raw)){
    return raw.replace(new RegExp(`^(${name}:).*$`,'m'),`$1 ${value}`);
  } else {
    // Insert after 'created:' if present else after 'status:' else at top
    if(/^created:/mi.test(raw)){
      return raw.replace(/^(created:.*)$/mi,`$1\nupdated: ${value}`);
    }
    if(/^status:/mi.test(raw)){
      return raw.replace(/^(status:.*)$/mi,`$1\nupdated: ${value}`);
    }
    return `updated: ${value}\n`+raw;
  }
}

async function* taskFiles(){
  const stories=await fs.readdir(STORIES,{withFileTypes:true});
  for (const s of stories){
    if(!s.isDirectory()||!/^story-/.test(s.name)) continue;
    const tasksDir=path.join(STORIES,s.name,'tasks');
    let files=[]; try { files=await fs.readdir(tasksDir); } catch { continue; }
    for (const f of files){ if(f.endsWith('.task.yml')) yield path.join(tasksDir,f); }
  }
}

async function main(){
  const opts=parseArgs();
  const today=isoDate();
  const changes=[];
  for await (const file of taskFiles()){
    const stat=await fs.stat(file);
    if(opts.since){ if(stat.mtime < new Date(opts.since)) continue; }
    const raw=await fs.readFile(file,'utf8');
    const created=extractField(raw,'created');
    const updated=extractField(raw,'updated');
    const mtimeDate=isoDate(stat.mtime);

    let action=null; let newValue=null;
    if(opts.mode==='add-missing'){
      if(!updated){ newValue=created||mtimeDate; action='add'; }
    } else if(opts.mode==='touch-changed'){
      if(!updated){ newValue=mtimeDate; action='add'; }
      else if(updated!==mtimeDate && stat.mtime > new Date(updated+'T00:00:00Z')){ newValue=mtimeDate; action='touch'; }
    } else if(opts.mode==='set-all'){
      if(updated!==today){ newValue=today; action=updated? 'replace':'add'; }
    } else {
      console.error(`Unknown mode: ${opts.mode}`); process.exit(1);
    }

    if(action){
      changes.push({file, action, from: updated, to: newValue});
      if(opts.write){
        const next=setOrReplaceField(raw,'updated',newValue);
        await fs.writeFile(file,next,'utf8');
      }
    }
  }
  if(!changes.length){
    console.log('No timestamp changes needed.');
  } else {
    console.log(`${opts.write? 'Applied':'Planned'} ${changes.length} changes:`);
    for (const c of changes.slice(0,50)){
      console.log(`${c.action.padEnd(7)} ${c.file}  ${c.from||'-'} -> ${c.to}`);
    }
    if(changes.length>50) console.log(`... (${changes.length-50} more)`);
  }
  if(!opts.write){
    console.log('\nDry-run only. Re-run with --write to apply.');
  }
}

main().catch(e=>{ console.error(e); process.exit(1); });
