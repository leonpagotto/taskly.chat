#!/usr/bin/env node
import { promises as fs } from 'fs';
import path from 'path';

const ROOT = path.resolve(process.cwd(),'stories');

function isTaskFile(p){return /(\/Backlog\/|\/InProgress\/|\/Review\/|\/Done\/)[^/]+\.md$/.test(p.replace(/\\/g,'/'));}

async function walk(dir, acc=[]) {
  const entries = await fs.readdir(dir,{withFileTypes:true});
  for (const e of entries){
    const full = path.join(dir,e.name);
    if (e.isDirectory()) await walk(full, acc); else if (e.isFile() && isTaskFile(full)) acc.push(full);
  }
  return acc;
}

async function migrate(file){
  let raw = await fs.readFile(file,'utf8');
  if (!/Type:\s*unknown/i.test(raw)) return false;
  raw = raw.replace(/Type:\s*unknown/i,'Type: chore');
  await fs.writeFile(file,raw,'utf8');
  return true;
}

async function main(){
  const files = await walk(ROOT);
  let changed=0; for (const f of files){ if (await migrate(f)) changed++; }
  console.log(`Migrated ${changed} task types to chore.`);
}

main().catch(e=>{console.error(e);process.exit(1);});
