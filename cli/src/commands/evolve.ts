/**
 * Evolve Command
 * Evolve an existing specification based on change request
 */

import { Command } from 'commander';
import { writeFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import chalk from 'chalk';
import ora from 'ora';
import { loadConfig, findSpecFile } from '../config/loader.js';
import { ensureApiKey } from '../config/setup.js';
import { evolveSpec } from '../generation/engine.js';
import { createGit, isGitAvailable } from '../versioning/git.js';
import type { LLMProviderName } from '../config/schema.js';

export function createEvolveCommand(): Command {
  const cmd = new Command('evolve')
    .description('Evolve an existing specification based on change request')
    .argument('[spec-file]', 'Path to existing EvoSpec file')
    .requiredOption('-c, --change <desc>', 'Change description')
    .option('-o, --output <file>', 'Output file (default: overwrite input)')
    .option('--bump <type>', 'Version bump: major|minor|patch', 'minor')
    .option('--no-bump', "Don't bump version")
    .option('-p, --provider <provider>', 'LLM provider')
    .option('-m, --model <model>', 'Model identifier')
    .option('--max-retries <n>', 'Max validation retry attempts', '3')
    .option('--dry-run', 'Show changes without writing')
    .option('-v, --verbose', 'Show generation progress')
    .action(async (specFileArg: string | undefined, options: {
      change: string;
      output?: string;
      bump: string | boolean;
      provider?: string;
      model?: string;
      maxRetries: string;
      dryRun?: boolean;
      verbose?: boolean;
    }) => {
      const spinner = ora();
      
      try {
        // Find spec file
        let specFile = specFileArg ? resolve(specFileArg) : findSpecFile();
        
        if (!specFile) {
          console.error(chalk.red('Error: No spec file specified and none found in current directory'));
          console.error(chalk.gray('Run from a project directory or specify the spec file path'));
          process.exit(1);
        }
        
        if (!existsSync(specFile)) {
          console.error(chalk.red(`Error: Spec file not found: ${specFile}`));
          process.exit(1);
        }
        
        let config = loadConfig();
        const provider = options.provider as LLMProviderName | undefined ?? config.llm.provider;
        
        // Ensure API key is configured
        const setupResult = await ensureApiKey(config, provider);
        config = setupResult.config;
        
        if (setupResult.cancelled) {
          console.log(chalk.red('API key required for evolution.'));
          process.exit(1);
        }
        
        if (options.verbose) {
          spinner.start('Evolving specification...');
        }
        
        const bumpType = options.bump === false
          ? undefined
          : (options.bump as 'major' | 'minor' | 'patch');
        
        const result = await evolveSpec(config, {
          specFile,
          change: options.change,
          bump: bumpType,
          provider: options.provider as LLMProviderName | undefined,
          model: options.model,
          maxRetries: parseInt(options.maxRetries, 10),
          onAttempt: (attempt, total) => {
            if (options.verbose) {
              spinner.text = `Evolving specification... (attempt ${attempt}/${total})`;
            }
          },
          onValidationError: (attempt, errors) => {
            if (options.verbose) {
              spinner.text = `Validation failed, retrying... (attempt ${attempt + 1})`;
            }
          },
        });
        
        if (options.verbose) {
          spinner.stop();
        }
        
        if (result.success && result.yaml) {
          if (options.dryRun) {
            console.log(chalk.yellow('Dry run - changes not saved'));
            console.log();
            console.log(chalk.gray(`Version: ${result.previousVersion} → ${result.newVersion}`));
            console.log();
            console.log(result.yaml);
          } else {
            const outputFile = options.output || specFile;
            writeFileSync(outputFile, result.yaml, 'utf-8');
            
            console.log(chalk.green(`✓ Specification evolved successfully`));
            console.log(chalk.gray(`  Version: ${result.previousVersion} → ${result.newVersion}`));
            console.log(chalk.gray(`  Attempts: ${result.attempts}`));
            console.log(chalk.gray(`  Output: ${outputFile}`));
            
            // Git operations
            const gitAvailable = await isGitAvailable();
            if (gitAvailable) {
              const git = createGit(process.cwd());
              const isRepo = await git.isGitRepo();
              
              if (isRepo && config.versioning.autoCommit) {
                try {
                  await git.add(outputFile);
                  const commitHash = await git.commit(`Evolve spec: ${options.change}`);
                  console.log(chalk.gray(`  Commit: ${commitHash.substring(0, 7)}`));
                  
                  if (config.versioning.autoTag && result.newVersion) {
                    const tagName = `${config.versioning.tagPrefix}${result.newVersion}`;
                    await git.tag(tagName, options.change);
                    console.log(chalk.gray(`  Tag: ${tagName}`));
                  }
                } catch (gitError) {
                  console.log(chalk.yellow(`  Git: ${gitError instanceof Error ? gitError.message : 'Failed'}`));
                }
              }
            }
          }
        } else {
          console.error(chalk.red('Evolution failed after maximum retries'));
          if (result.errors) {
            console.error(chalk.red('\nValidation errors:'));
            for (const error of result.errors) {
              console.error(chalk.red(`  • [${error.code}] ${error.message}`));
              if (error.location) {
                console.error(chalk.gray(`    at: ${error.location}`));
              }
            }
          }
          process.exit(1);
        }
      } catch (error) {
        spinner.fail();
        console.error(chalk.red(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`));
        process.exit(1);
      }
    });
  
  return cmd;
}
