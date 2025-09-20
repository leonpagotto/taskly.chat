#!/usr/bin/env node
import { promises as fs } from 'fs';
import path from 'path';

const ROOT = path.resolve(process.cwd(), 'speca-chat');
const STORIES = path.join(ROOT, 'stories');
const PLACEHOLDER_PATTERNS = [
  /Define acceptance criteria/i,
  /Define criteria/i,
  /TBD\b/i,
  /TODO:/i
];

function isPlaceholder(line){
  return PLACEHOLDER_PATTERNS.some(r=>r.test(line));
}

async function scan(){
  const problems=[];
  const stories = await fs.readdir(STORIES, { withFileTypes: true });
  for (const s of stories){
    if(!s.isDirectory() || !/^story-/.test(s.name)) continue;
    const tasksDir = path.join(STORIES, s.name, 'tasks');
    let taskFiles=[]; try { taskFiles = await fs.readdir(tasksDir, { withFileTypes: true }); } catch { continue; }
    for (const tf of taskFiles){
      if(!tf.isFile() || !tf.name.endsWith('.task.yml')) continue;
      const full = path.join(tasksDir, tf.name);
      const raw = await fs.readFile(full, 'utf8');
      const lines = raw.split(/\r?\n/);
      let inAcceptance=false;
      for (let i=0;i<lines.length;i++){
        const line=lines[i];
        if(/^acceptance:\s*$/.test(line)){ inAcceptance=true; continue; }
        if(inAcceptance){
          if(/^\s*-\s+/.test(line)){
            if(isPlaceholder(line)) problems.push({ file: full, line: i+1, text: line.trim() });
          } else if(line.trim()===''){ continue; } else { inAcceptance=false; }
        }
      }
    }
  }
  if(problems.length){
    console.error(`Placeholder acceptance issues (${problems.length})`);
    for (const p of problems) console.error(`${p.file}:${p.line}: ${p.text}`);
    process.exit(2);
  } else {
    console.log('No placeholder acceptance criteria found.');
  }
}

scan().catch(e=>{ console.error(e); process.exit(1); });
