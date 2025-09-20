#!/usr/bin/env node
import { promises as fs } from 'fs';
import path from 'path';

const ROOT=process.cwd();
const STORIES=path.join(ROOT,'speca-chat','stories');

// Heuristic patterns
const strongVerbs=/^(create|add|update|remove|delete|list|display|show|persist|store|return|compute|calculate|render|navigate|select|upload|download|export|import|validate|support|handle|emit|log|authenticate|authorize|process|schedule|cache|synchronize|sync|retry|warn|error|fallback|merge|stream)\b/i;
const weakStarts=/^(define criteria|define acceptance criteria|placeholder|tbd|todo)$/i;

async function* taskFiles(){
  const stories=await fs.readdir(STORIES,{withFileTypes:true});
  for (const s of stories){
    if(!s.isDirectory()||!/^story-/.test(s.name)) continue;
    const tasksDir=path.join(STORIES,s.name,'tasks');
    let files=[]; try { files=await fs.readdir(tasksDir); } catch { continue; }
    for (const f of files){ if(f.endsWith('.task.yml')) yield path.join(tasksDir,f); }
  }
}

function extractAcceptance(raw){
  const lines=raw.split(/\r?\n/);
  const acc=[]; let inAcc=false; let indent=null;
  for (const line of lines){
    if(!inAcc){
      if(/^acceptance:\s*$/.test(line)){ inAcc=true; continue; }
    } else {
      if(/^\S/.test(line)) break; // outdent
      const m=line.match(/^(\s*)-\s+(.*)$/); if(!m) continue;
      if(indent===null) indent=m[1];
      if(m[1]!==indent) { /* nested skip */ }
      acc.push(m[2].trim());
    }
  }
  return acc;
}

function classify(item){
  const issues=[];
  if(item.length<6) issues.push('too-short');
  if(weakStarts.test(item)) issues.push('placeholder');
  if(!strongVerbs.test(item)) issues.push('missing-strong-verb');
  if(/\.$/.test(item)) issues.push('trailing-period');
  return issues;
}

async function main(){
  const report=[];
  for await (const file of taskFiles()){
    const raw=await fs.readFile(file,'utf8');
    const acc=extractAcceptance(raw);
    acc.forEach((item,i)=>{
      const issues=classify(item);
      if(issues.length){
        report.push({file,index:i+1,item,issues});
      }
    });
  }
  const out={ generated:new Date().toISOString(), totalFindings:report.length, findings:report };
  await fs.mkdir(path.join(ROOT,'artifacts'),{recursive:true});
  const target=path.join(ROOT,'artifacts','acceptance-lint-report.json');
  await fs.writeFile(target,JSON.stringify(out,null,2),'utf8');
  console.log(`Acceptance lint findings: ${report.length}. Report: artifacts/acceptance-lint-report.json`);
  // Simple suggestion summary
  const buckets={placeholder:0,'missing-strong-verb':0,'too-short':0,'trailing-period':0};
  for (const r of report){ for (const i of r.issues){ buckets[i]=(buckets[i]||0)+1; } }
  console.log('Issue counts:', buckets);
}

main().catch(e=>{ console.error(e); process.exit(1); });
