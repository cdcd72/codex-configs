#!/usr/bin/env node

import { spawnSync } from 'node:child_process';

function runGit(args) {
  return spawnSync('git', args, {
    encoding: 'utf8',
  });
}

function main() {
  const result = runGit([
    'commit',
    '-m',
    'backup: before Codex edit',
    '--allow-empty',
  ]);

  if (result.error) {
    process.stderr.write(result.error.message + '\n');
    process.exit(0);
  }

  if (result.status !== 0) {
    process.stderr.write(result.stderr || 'Failed to create backup commit.\n');
  }

  process.exit(0);
}

try {
  main();
} catch (error) {
  process.stderr.write(`[auto-backup Hook Error] ${error.message}\n`);
  process.exit(0);
}
