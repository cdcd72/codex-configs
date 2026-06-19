#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

async function readStdinJson() {
  const chunks = [];

  for await (const chunk of process.stdin) {
    chunks.push(chunk);
  }

  const raw = Buffer.concat(chunks).toString().trim();

  if (!raw) {
    return {};
  }

  return JSON.parse(raw);
}

function extractPatchedFiles(patchText) {
  const files = new Set();
  const lines = patchText.split(/\r?\n/);

  for (const line of lines) {
    const match = line.match(/^\*\*\* (?:Update|Add) File: (.+)$/);

    if (!match) {
      continue;
    }

    const target = match[1].split(' -> ')[0].trim();
    if (target) {
      files.add(target);
    }
  }

  return [...files];
}

function resolveFilePath(projectRoot, candidate) {
  return path.isAbsolute(candidate)
    ? candidate
    : path.resolve(projectRoot, candidate);
}

function resolvePackageManagerCommand() {
  const commonOptions = {
    stdio: 'ignore',
    shell: process.platform === 'win32',
  };

  if (spawnSync('pnpm', ['--version'], commonOptions).status === 0) {
    return ['pnpm'];
  }

  if (
    spawnSync('corepack', ['pnpm', '--version'], commonOptions).status === 0
  ) {
    return ['corepack', 'pnpm'];
  }

  return null;
}

function runPackageManager(command, args, stdio = 'inherit') {
  const commonOptions = {
    stdio,
    shell: process.platform === 'win32',
  };

  return spawnSync(command[0], [...command.slice(1), ...args], commonOptions);
}

async function main() {
  const input = await readStdinJson();
  const patchText =
    input.tool_input?.command ??
    input.tool_input?.patch ??
    input.tool_input?.diff ??
    '';
  const directFileCandidates = [
    input.tool_input?.file_path,
    input.tool_input?.path,
    ...(Array.isArray(input.tool_input?.paths) ? input.tool_input.paths : []),
  ].filter((value) => typeof value === 'string' && value.trim().length > 0);

  if (!patchText && directFileCandidates.length === 0) {
    process.exit(0);
  }

  const projectRoot = process.cwd();
  const hasPackageJson = fs.existsSync(path.join(projectRoot, 'package.json'));
  const packageManagerCommand = resolvePackageManagerCommand();

  if (!hasPackageJson || !packageManagerCommand) {
    process.exit(0);
  }

  const files = [
    ...new Set([...extractPatchedFiles(patchText), ...directFileCandidates]),
  ]
    .map((file) => resolveFilePath(projectRoot, file))
    .filter((file) => fs.existsSync(file));

  for (const filePath of files) {
    const isFormatTarget =
      /\.(js|jsx|ts|tsx|mjs|cjs|json|css|scss|html|md|mdx|yaml|yml|svelte)$/i.test(
        filePath,
      );
    const isLintTarget = /\.(js|jsx|ts|tsx|svelte)$/i.test(filePath);

    if (isFormatTarget) {
      runPackageManager(packageManagerCommand, [
        'prettier',
        '--write',
        filePath,
      ]);
    }

    if (isLintTarget) {
      runPackageManager(packageManagerCommand, ['eslint', '--fix', filePath]);
    }
  }

  process.exit(0);
}

main().catch((error) => {
  console.error(`[format-lint Hook Error] ${error.message}`);
  process.exit(0);
});
