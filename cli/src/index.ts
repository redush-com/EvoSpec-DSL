#!/usr/bin/env node

/**
 * EvoSpec CLI
 * Command-line interface for EvoSpec DSL validation and tooling
 */

import { Command } from 'commander';
import { readFileSync, existsSync, writeFileSync } from 'fs';
import { resolve, basename } from 'path';
import chalk from 'chalk';
import { validate, validateYaml, ValidationResult, ValidationError, ValidationPhase } from '@evospec/validator';

const program = new Command();

program
  .name('evospec')
  .description('CLI for EvoSpec DSL validation and tooling')
  .version('1.0.0');

// ============================================
// Validate Command
// ============================================

program
  .command('validate <file>')
  .description('Validate an EvoSpec specification file')
  .option('-p, --phase <phases>', 'Validate specific phases (e.g., 1-3 or 1,2,3)', '1-6')
  .option('-s, --strict', 'Treat soft errors as hard errors', false)
  .option('-f, --format <format>', 'Output format: text, json', 'text')
  .option('-q, --quiet', 'Only output errors', false)
  .action((file: string, options: { phase: string; strict: boolean; format: string; quiet: boolean }) => {
    const filePath = resolve(file);
    
    if (!existsSync(filePath)) {
      console.error(chalk.red(`Error: File not found: ${filePath}`));
      process.exit(1);
    }

    const content = readFileSync(filePath, 'utf-8');
    const phases = parsePhases(options.phase);

    const result = validateYaml(content, {
      phases,
      strict: options.strict,
    });

    if (options.format === 'json') {
      console.log(JSON.stringify(result, null, 2));
    } else {
      printValidationResult(result, options.quiet);
    }

    process.exit(result.ok ? 0 : 1);
  });

// ============================================
// Init Command
// ============================================

program
  .command('init [name]')
  .description('Create a new EvoSpec specification file')
  .option('-o, --output <file>', 'Output file path')
  .action((name: string = 'myapp', options: { output?: string }) => {
    const fileName = options.output || `${name}.evospec.yaml`;
    const filePath = resolve(fileName);

    if (existsSync(filePath)) {
      console.error(chalk.red(`Error: File already exists: ${filePath}`));
      process.exit(1);
    }

    const template = generateTemplate(name);
    writeFileSync(filePath, template, 'utf-8');
    
    console.log(chalk.green(`✓ Created ${fileName}`));
    console.log();
    console.log('Next steps:');
    console.log(`  1. Edit ${fileName} to define your system`);
    console.log(`  2. Run ${chalk.cyan(`evospec validate ${fileName}`)} to validate`);
  });

// ============================================
// Check Command (alias for validate with phases)
// ============================================

program
  .command('check <file>')
  .description('Quick validation (phases 1-3 only)')
  .option('-f, --format <format>', 'Output format: text, json', 'text')
  .action((file: string, options: { format: string }) => {
    const filePath = resolve(file);
    
    if (!existsSync(filePath)) {
      console.error(chalk.red(`Error: File not found: ${filePath}`));
      process.exit(1);
    }

    const content = readFileSync(filePath, 'utf-8');
    const result = validateYaml(content, { phases: [1, 2, 3] });

    if (options.format === 'json') {
      console.log(JSON.stringify(result, null, 2));
    } else {
      printValidationResult(result, false);
    }

    process.exit(result.ok ? 0 : 1);
  });

// ============================================
// Helper Functions
// ============================================

function parsePhases(phaseStr: string): ValidationPhase[] {
  if (phaseStr.includes('-')) {
    const [start, end] = phaseStr.split('-').map(Number);
    const phases: ValidationPhase[] = [];
    for (let i = start; i <= end; i++) {
      if (i >= 1 && i <= 6) {
        phases.push(i as ValidationPhase);
      }
    }
    return phases;
  }
  
  return phaseStr.split(',').map(Number).filter(n => n >= 1 && n <= 6) as ValidationPhase[];
}

function printValidationResult(result: ValidationResult, quiet: boolean): void {
  const phaseNames = [
    '',
    'Structural',
    'Referential',
    'Semantic',
    'Evolution',
    'Generation',
    'Verifiability',
  ];

  if (!quiet) {
    console.log();
    for (let phase = 1; phase <= result.phase; phase++) {
      const phaseErrors = result.errors.filter(e => e.phase === phase);
      const phaseWarnings = result.warnings.filter(e => e.phase === phase);
      
      if (phaseErrors.length === 0 && phaseWarnings.length === 0) {
        console.log(chalk.green(`✓ Phase ${phase}: ${phaseNames[phase]} validation passed`));
      } else if (phaseErrors.length > 0) {
        console.log(chalk.red(`✗ Phase ${phase}: ${phaseNames[phase]} validation failed`));
      } else {
        console.log(chalk.yellow(`⚠ Phase ${phase}: ${phaseNames[phase]} validation passed with warnings`));
      }
    }
    console.log();
  }

  // Print errors
  if (result.errors.length > 0) {
    console.log(chalk.red.bold('Errors:'));
    for (const error of result.errors) {
      printError(error);
    }
    console.log();
  }

  // Print warnings
  if (result.warnings.length > 0) {
    console.log(chalk.yellow.bold('Warnings:'));
    for (const warning of result.warnings) {
      printError(warning);
    }
    console.log();
  }

  // Summary
  if (result.ok) {
    if (result.warnings.length > 0) {
      console.log(chalk.green(`Validation passed with ${result.warnings.length} warning(s)`));
    } else {
      console.log(chalk.green('Validation successful!'));
    }
  } else {
    console.log(chalk.red(`Validation failed with ${result.errors.length} error(s)`));
  }
}

function printError(error: ValidationError): void {
  const levelColor = error.level === 'hard' ? chalk.red : chalk.yellow;
  const levelIcon = error.level === 'hard' ? '✗' : '⚠';
  
  console.log(`  ${levelColor(levelIcon)} [${error.code}] ${error.message}`);
  if (error.location) {
    console.log(chalk.gray(`    at: ${error.location}`));
  }
  if (error.suggestion) {
    console.log(chalk.cyan(`    fix: ${error.suggestion}`));
  }
}

function generateTemplate(name: string): string {
  return `# EvoSpec DSL v1 Specification
# Generated by: evospec init ${name}

spec: evospec/v1

project:
  id: ${name.toLowerCase().replace(/[^a-z0-9]/g, '.')}
  name: "${name}"
  versioning:
    strategy: semver
    current: "1.0.0"

structure:
  root: NodeRef(system.root)

domain:
  nodes:
    # Root System
    - kind: System
      id: system.root
      meta:
        title: "${name}"
        description: "Main system"
      spec:
        goals:
          - "Define your system goals here"
      children:
        - NodeRef(mod.core)

    # Core Module
    - kind: Module
      id: mod.core
      meta:
        title: "Core"
      spec: {}
      children:
        - NodeRef(entity.example)

    # Example Entity
    - kind: Entity
      id: entity.example
      meta:
        title: "Example Entity"
      spec:
        fields:
          id:
            type: uuid
            required: true
          name:
            type: string
            required: true
          createdAt:
            type: datetime
            required: true
      contracts:
        - invariant: "name != ''"
          level: hard

history:
  - version: "1.0.0"
    basedOn: null
    changes: []
    migrations: []
    notes: "Initial version"
`;
}

// Run CLI
program.parse();
