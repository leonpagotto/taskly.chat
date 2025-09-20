import { describe, it, expect } from 'vitest';
import { parseHeaders, scanRepository } from './parser';

const storySample = `# Story: Example Title\nSlug: 99-example-title\nStatus: active\nCreated: 2025-09-20\nOwner: test\nArea: example\n\n## Summary\nStuff`;
const taskSample = `# Task: IMP-999\nStatus: todo\nStory: 99-example-title\nCreated: 2025-09-20\nType: feature\nRelated: story:99-example-title task:IMP-100\nOwner: test\n\n## Summary\nDo it`;

describe('parseHeaders', () => {
  it('parses story header', () => {
    const parsed = parseHeaders(storySample)!;
    expect(parsed.kind).toBe('story');
    if (parsed.kind === 'story') {
      expect(parsed.slug).toBe('99-example-title');
      expect(parsed.status).toBe('active');
    }
  });
  it('parses task header', () => {
    const parsed = parseHeaders(taskSample)!;
    expect(parsed.kind).toBe('task');
    if (parsed.kind === 'task') {
      expect(parsed.id).toBe('IMP-999');
      expect(parsed.related).toEqual(['story:99-example-title','task:IMP-100']);
    }
  });
  it('returns null for non-header content', () => {
    expect(parseHeaders('just text')).toBeNull();
  });
});

describe('scanRepository', () => {
  it('scans mixed files', () => {
    const res = scanRepository([
      { path: 'stories/99-example/story.md', content: storySample },
      { path: 'tasks/todo/IMP-999-example.md', content: taskSample },
      { path: 'README.md', content: 'noop' }
    ]);
    expect(res.stories.length).toBe(1);
    expect(res.tasks.length).toBe(1);
    expect(res.errors.length).toBe(0);
  });
});
