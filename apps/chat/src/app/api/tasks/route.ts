import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { parseHeaders } from '@taskly/integration';

const ROOT = process.cwd();

async function* walk(dir: string): AsyncGenerator<string> {
  for (const entry of await fs.readdir(dir,{withFileTypes:true})) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else if (entry.isFile() && full.endsWith('.md')) yield full;
  }
}

export async function GET() {
  const tasksRoot = path.join(ROOT,'tasks');
  const items: any[] = [];
  for await (const file of walk(tasksRoot)) {
    try {
      const raw = await fs.readFile(file,'utf8');
      const parsed = parseHeaders(raw);
      if (parsed && parsed.kind === 'task') {
        items.push({ id: parsed.id, status: parsed.status, story: parsed.story, file: file.replace(ROOT+'/','') });
      }
    } catch {}
  }
  return NextResponse.json({ tasks: items });
}
