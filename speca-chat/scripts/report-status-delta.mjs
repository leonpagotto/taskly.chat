#!/usr/bin/env node
import { promises as fs } from 'fs';
import path from 'path';

const ROOT=process.cwd();
const ARCHIVE=path.join(ROOT,'archive');
const STORIES=path.join(ROOT,'speca-chat','stories');

function parseHeaders(raw){
  const h={};
  for (const line of raw.split(/\r?\n/).slice(0,25)){
    const m=line.match(/^(Status|Type|Owner):\s*(.*)$/i); if(m) h[m[1].toLowerCase()]=m[2].trim();
  }
  return h;
}

async function latestArchive(){
  let entries=await fs.readdir(ARCHIVE,{withFileTypes:true});
  entries=entries.filter(e=>e.isDirectory()).map(e=>e.name).sort();
  return entries.pop();
}

async function indexLegacy(){
  const latest=await latestArchive(); if(!latest) return {};
  const base=path.join(ARCHIVE,latest,'legacy-tasks');
  let statusDirs=[];
  try {
    statusDirs=(await fs.readdir(base,{withFileTypes:true}))
      .filter(e=>e.isDirectory())
      .map(e=>e.name);
  } catch {}
  const map={};
  for (const folder of statusDirs){
    let files=[]; try { files=await fs.readdir(path.join(base,folder)); } catch { continue; }
    for (const f of files){
      if(!f.endsWith('.md')) continue;
      const idCore=f.replace(/\.md$/,'').split('-').slice(0,2).join('-');
      const raw=await fs.readFile(path.join(base,folder,f),'utf8');
      const h=parseHeaders(raw);
      h.status=h.status||folder;
      // Only set if not already captured (prefer first seen to avoid overwriting possibly more canonical earlier folder)
      if(!map[idCore]) map[idCore]=h;
    }
  }
  return map;
}

async function collectCurrent(){
  const out={};
  const storyDirs=await fs.readdir(STORIES,{withFileTypes:true});
  for (const s of storyDirs){
    if(!s.isDirectory()||!/^story-/.test(s.name)) continue;
    const tasksDir=path.join(STORIES,s.name,'tasks'); let files=[]; try { files=await fs.readdir(tasksDir); } catch {}
    for (const f of files){ if(f.endsWith('.task.yml')){ const raw=await fs.readFile(path.join(tasksDir,f),'utf8');
      const id=raw.match(/id:\s*(\S+)/)?.[1];
      const status=raw.match(/status:\s*(\S+)/)?.[1];
      const type=raw.match(/type:\s*(\S+)/)?.[1];
      out[id]={status,type};
    }}
  }
  return out;
}

function table(rows){
  const widths=[ 'ID','LegacyStatus','CurrentStatus','LegacyType','CurrentType','Changed' ].map(h=>h.length);
  for (const r of rows){
    widths[0]=Math.max(widths[0],r.id.length);
    widths[1]=Math.max(widths[1],r.lStatus.length);
    widths[2]=Math.max(widths[2],r.cStatus.length);
    widths[3]=Math.max(widths[3],r.lType.length);
    widths[4]=Math.max(widths[4],r.cType.length);
    widths[5]=Math.max(widths[5],String(r.changed).length);
  }
  const pad=(s,w)=>s+ ' '.repeat(w-s.length);
  const header=['ID','LegacyStatus','CurrentStatus','LegacyType','CurrentType','Changed'];
  const lines=[header.map((h,i)=>pad(h,widths[i])).join('  ')];
  lines.push(widths.map(w=>'-'.repeat(w)).join('  '));
  for (const r of rows){ lines.push([r.id,r.lStatus,r.cStatus,r.lType,r.cType,String(r.changed)].map((s,i)=>pad(s,widths[i])).join('  ')); }
  return lines.join('\n');
}

function parseArgs(){
  const args=process.argv.slice(2);
  const opts={ format:'json', out:null };
  for (let i=0;i<args.length;i++){
    const a=args[i];
    if(a==='--out'){ opts.out=args[++i]; }
    else if(a==='--format'){ opts.format=args[++i]; }
    else if(a==='--help'||a==='-h'){
      console.log(`Usage: report-status-delta [--out <file>] [--format json|csv]\n`+
        `Outputs legacy/current status+type drift plus optional export file.`);
      process.exit(0);
    }
  }
  return opts;
}

function toCSV(obj){
  // obj: { matched:[], changed:[], legacyOnly:[], currentOnly:[] }
  const lines=[];
  lines.push('section,id,legacy_status,current_status,legacy_type,current_type');
  for (const r of obj.matched){
    lines.push(['matched',r.id,r.legacy.status,r.current.status,r.legacy.type,r.current.type].join(','));
  }
  for (const r of obj.changed){
    lines.push(['changed',r.id,r.legacy.status,r.current.status,r.legacy.type,r.current.type].join(','));
  }
  for (const id of obj.legacyOnly){
    lines.push(['legacyOnly',id,'','','',''].join(','));
  }
  for (const id of obj.currentOnly){
    lines.push(['currentOnly',id,'','','',''].join(','));
  }
  return lines.join('\n');
}

async function main(){
  const opts=parseArgs();
  const legacy=await indexLegacy();
  const current=await collectCurrent();
  const rows=[]; const changedJSON=[]; const matchedJSON=[];
  const legacyOnly=new Set(Object.keys(legacy));
  const currentOnly=new Set(Object.keys(current));
  for (const [id,h] of Object.entries(legacy)){
    const cur=current[id]; if(!cur) continue;
    legacyOnly.delete(id);
    currentOnly.delete(id);
    const lStatus=(h.status||'').toLowerCase();
    const cStatus=(cur.status||'').toLowerCase();
    const lType=(h.type||'').toLowerCase();
    const cType=(cur.type||'').toLowerCase();
    const changed = lStatus!==cStatus || (lType && lType!==cType);
    rows.push({id,lStatus,cStatus,lType,cType,changed});
    const record={id,legacy:{status:lStatus,type:lType}, current:{status:cStatus,type:cType}};
    matchedJSON.push(record);
    if(changed) changedJSON.push(record);
  }
  console.log(table(rows));
  console.log('\nChanged Entries JSON:\n'+JSON.stringify(changedJSON,null,2));
  console.log(`\nTotals: ${rows.length} matched, ${changedJSON.length} with differences.`);
  console.log(`Legacy-only (not in current): ${legacyOnly.size}`);
  console.log(`Current-only (no legacy record): ${currentOnly.size}`);

  if(opts.out){
    const exportObj={
      matched: matchedJSON,
      changed: changedJSON,
      legacyOnly: Array.from(legacyOnly),
      currentOnly: Array.from(currentOnly)
    };
    const dir=path.dirname(opts.out);
    await fs.mkdir(dir,{recursive:true});
    if(opts.format==='csv'){
      await fs.writeFile(opts.out,toCSV(exportObj),'utf8');
    } else {
      await fs.writeFile(opts.out,JSON.stringify(exportObj,null,2),'utf8');
    }
    console.log(`\nExport written: ${opts.out} (${opts.format})`);
  }
}

main().catch(e=>{ console.error(e); process.exit(1); });
