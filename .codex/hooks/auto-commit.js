#!/usr/bin/env node

import { spawnSync } from 'node:child_process';

function runGit(args) {
  return spawnSync('git', args, {
    encoding: 'utf8',
  });
}

function hasPendingChanges() {
  const result = runGit(['status', '--porcelain']);
  return result.status === 0 && result.stdout.trim().length > 0;
}

function main() {
  if (!hasPendingChanges()) {
    process.exit(0);
  }

  const addResult = runGit(['add', '-A']);

  if (addResult.error) {
    process.stderr.write(addResult.error.message + '\n');
    process.exit(0);
  }

  const result = runGit(['commit', '-m', 'feat: Codex auto-commit']);

  if (result.error) {
    process.stderr.write(result.error.message + '\n');
    process.exit(0);
  }

  if (result.status !== 0) {
    process.stderr.write(result.stderr || 'Failed to create auto-commit.\n');
  }

  process.exit(0);
}

try {
  main();
} catch (error) {
  process.stderr.write(`[auto-commit Hook Error] ${error.message}\n`);
  process.exit(0);
}
