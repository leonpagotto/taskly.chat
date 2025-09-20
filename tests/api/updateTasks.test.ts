import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import path from 'path';
import { promises as fs } from 'fs';
import { POST as singleUpdate } from '../../apps/chat/src/app/api/tasks/update/route';
import { POST as batchUpdate } from '../../apps/chat/src/app/api/tasks/update/batch/route';

// NOTE: These tests operate on real files. We create a temp sandbox under .tmp-tests and copy a sample task.
// Because the route code uses process.cwd(), we temporarily chdir into sandbox.

const sandboxRoot = path.resolve('.tmp-tests-update');
const tasksDir = path.join(sandboxRoot,'tasks');
const inProgressDir = path.join(tasksDir,'in-progress');
const todoDir = path.join(tasksDir,'todo');

async function writeSample(id: string, status: string) {
  const statusDir = path.join(tasksDir, status);
  await fs.mkdir(statusDir,{ recursive:true });
  const file = path.join(statusDir, `${id}-sample.md`);
  const content = `# Task: ${id}\nStatus: ${status}\nStory: 00-lobe-chat-framework-integration\nCreated: 2025-09-20\nType: chore\n\n## Acceptance Criteria\n- [ ] placeholder\n`;
  await fs.writeFile(file, content, 'utf8');
  return file;
}

describe('task update APIs', () => {
  let originalCwd: string;
  beforeAll(async ()=>{
    originalCwd = process.cwd();
    await fs.rm(sandboxRoot,{ recursive:true, force:true });
    await fs.mkdir(sandboxRoot,{ recursive:true });
    process.chdir(sandboxRoot);
    await writeSample('TST-001','in-progress');
  });
  afterAll(async ()=>{
    process.chdir(originalCwd);
    await fs.rm(sandboxRoot,{ recursive:true, force:true });
  });

  it('moves a single task to todo', async () => {
  const req = new Request('http://localhost/api/tasks/update', { method:'POST', body: JSON.stringify({ id: 'TST-001', toStatus: 'todo' }) , headers:{'Content-Type':'application/json'}});
  const res: any = await singleUpdate(req as any);
  const json = await res.json();
  expect(json).toBeDefined();
  expect(json.ok).toBe(true);
    const movedFile = path.join(todoDir, 'TST-001-sample.md');
    const exists = await fs.readFile(movedFile,'utf8');
    expect(exists).toContain('Status: todo');
  });

  it('batch moves multiple tasks', async () => {
    // create second sample
  await writeSample('TST-002','in-progress');
  const req = new Request('http://localhost/api/tasks/update/batch', { method:'POST', body: JSON.stringify({ moves: [{ id:'TST-002', toStatus:'todo' }] }), headers:{'Content-Type':'application/json'} });
  const res: any = await batchUpdate(req as any);
  const json = await res.json();
  expect(json).toBeDefined();
  expect(json.ok).toBe(true);
    const movedFile = path.join(todoDir, 'TST-002-sample.md');
    const data = await fs.readFile(movedFile,'utf8');
    expect(data).toContain('Status: todo');
  });
});
