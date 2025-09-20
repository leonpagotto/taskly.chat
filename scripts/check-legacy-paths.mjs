#!/usr/bin/env node
import { execSync } from 'child_process';

/*
Fail build/validation if any legacy path references remain in tracked files.
Legacy pattern: 'docs/taskly-chat/stories'
Usage:
  node scripts/check-legacy-paths.mjs
Add to CI or pre-commit to ensure no regressions after path refactor.
*/

const PATTERNS = [
  'docs/taskly-chat/stories',
  'docs/taskly-chat/SPEC-INDEX.md',
  'docs/specs/SPEC-INDEX.md'
];

function main() {
  try {
    let any = false;
    let report = '';
    for (const p of PATTERNS) {
      const out = execSync(`git --no-pager grep -n '${p}' || true`, { encoding: 'utf8' });
      if (out.trim()) {
        any = true;
        report += `\nPattern: ${p}\n${out}`;
      }
    }
    if (!any) {
      console.log('Legacy path check passed (no occurrences).');
      return;
    }
    console.error('Legacy path references found:' + report);
    process.exit(1);
  } catch (err) {
    console.error('Error running legacy path check:', err.message);
    process.exit(2);
  }
}

main();
