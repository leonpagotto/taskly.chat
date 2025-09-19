#!/usr/bin/env node
import { execSync } from 'child_process';

/*
Fail build/validation if any legacy path references remain in tracked files.
Legacy pattern: 'docs/taskly-chat/stories'
Usage:
  node scripts/check-legacy-paths.mjs
Add to CI or pre-commit to ensure no regressions after path refactor.
*/

const PATTERN = 'docs/taskly-chat/stories';

function main() {
  try {
    const grep = execSync(`git --no-pager grep -n '${PATTERN}' || true`, { encoding: 'utf8' });
    if (!grep.trim()) {
      console.log('Legacy path check passed (no occurrences).');
      return;
    }
    console.error('Legacy path references found:\n' + grep);
    process.exit(1);
  } catch (err) {
    console.error('Error running legacy path check:', err.message);
    process.exit(2);
  }
}

main();
