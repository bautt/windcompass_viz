#!/usr/bin/env node
import { readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import chalk from 'chalk';

const __dirname = dirname(fileURLToPath(import.meta.url));

function findTestFiles(dir) {
    const results = [];
    for (const entry of readdirSync(dir)) {
        if (entry === 'node_modules' || entry === 'dist' || entry === 'stage') continue;
        const full = join(dir, entry);
        if (statSync(full).isDirectory()) {
            results.push(...findTestFiles(full));
        } else if (entry.endsWith('.test.mjs')) {
            results.push(full);
        }
    }
    return results;
}

const testFiles = findTestFiles(join(__dirname, 'visualizations'));

if (testFiles.length === 0) {
    console.log(chalk.yellow('No *.test.mjs files found under visualizations/'));
    process.exit(0);
}

let failed = false;
for (const file of testFiles) {
    const label = file.replace(`${__dirname}/`, '');
    try {
        await import(pathToFileURL(file).href);
        console.log(chalk.green(`✓ ${label}`));
    } catch (err) {
        failed = true;
        console.error(chalk.red(`✗ ${label}`));
        console.error(err);
    }
}

if (failed) {
    console.error(chalk.red('\nTests failed.'));
    process.exit(1);
}

console.log(chalk.green(`\nAll tests passed (${testFiles.length} file(s)).`));
