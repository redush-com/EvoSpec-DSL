/**
 * Init Command
 * Create a new EvoSpec project
 */

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import inquirer from 'inquirer';
import { initProject, type InitOptions } from '../project/init.js';
import type { LLMProviderName } from '../config/schema.js';
import { loadConfig } from '../config/loader.js';
import { ensureApiKey } from '../config/setup.js';

export function createInitCommand(): Command {
  const cmd = new Command('init')
    .description('Create a new EvoSpec project')
    .argument('[project-name]', 'Project name (default: current directory name)')
    .option('-d, --description <desc>', 'System description for LLM generation')
    .option('-p, --provider <provider>', 'LLM provider: openrouter|openai|anthropic|ollama')
    .option('-m, --model <model>', 'Model identifier')
    .option('--no-generate', 'Skip LLM generation, create minimal template')
    .option('--no-readme', "Don't create README.md")
    .option('-y, --yes', 'Skip confirmation prompts')
    .action(async (projectName: string | undefined, options: {
      description?: string;
      provider?: string;
      model?: string;
      generate: boolean;
      readme: boolean;
      yes: boolean;
    }) => {
      const spinner = ora();
      
      try {
        // Interactive confirmation
        if (!options.yes) {
          console.log();
          console.log(chalk.bold('EvoSpec Project Initialization'));
          console.log(chalk.gray('=============================='));
          console.log();
          console.log(`Project name:     ${chalk.cyan(projectName || '(current directory)')}`);
          console.log(`Directory:        ${chalk.cyan(projectName ? `./${projectName}/` : './')}`);
          if (options.description) {
            console.log(`Description:      ${chalk.cyan(options.description)}`);
          }
          console.log();
          console.log('This will:');
          console.log(`  ${chalk.green('•')} Create project directory and structure`);
          console.log(`  ${chalk.green('•')} Initialize Git repository`);
          if (options.description && options.generate) {
            console.log(`  ${chalk.green('•')} Generate specification using LLM`);
          } else {
            console.log(`  ${chalk.green('•')} Create minimal specification template`);
          }
          console.log(`  ${chalk.green('•')} Create initial commit and tag v1.0.0`);
          console.log();
          
          const { proceed } = await inquirer.prompt([{
            type: 'confirm',
            name: 'proceed',
            message: 'Proceed?',
            default: true,
          }]);
          
          if (!proceed) {
            console.log(chalk.yellow('Cancelled.'));
            process.exit(0);
          }
          
          console.log();
        }
        
        // Check API key if LLM generation is requested
        let config = loadConfig();
        const provider = options.provider as LLMProviderName | undefined ?? config.llm.provider;
        
        if (options.description && options.generate) {
          const result = await ensureApiKey(config, provider);
          config = result.config;
          
          if (result.cancelled) {
            console.log(chalk.yellow('Continuing without LLM generation...'));
            options.generate = false;
          }
        }
        
        console.log(chalk.bold('Creating project...'));
        
        const initOptions: InitOptions = {
          projectName,
          description: options.description,
          provider: options.provider as LLMProviderName | undefined,
          model: options.model,
          noGenerate: !options.generate,
          noReadme: !options.readme,
          skipConfirmation: options.yes,
          onStep: (step, status, message) => {
            const stepNames: Record<string, string> = {
              directory: 'Created directory',
              git: 'Initialized Git repository',
              config: 'Created .evospec/config.yaml',
              gitignore: 'Created .gitignore',
              generate: 'Generating specification',
              spec: 'Created spec file',
              readme: 'Created README.md',
              commit: 'Created initial commit',
              tag: 'Created tag v1.0.0',
            };
            
            const stepName = stepNames[step] || step;
            
            if (status === 'start') {
              if (step === 'generate') {
                spinner.start(stepName);
              }
            } else if (status === 'done') {
              if (step === 'generate') {
                spinner.succeed(chalk.green('Generated valid specification'));
              } else {
                console.log(`  ${chalk.green('✓')} ${stepName}`);
              }
            } else if (status === 'skip') {
              console.log(`  ${chalk.yellow('○')} ${stepName} ${message ? chalk.gray(`(${message})`) : ''}`);
            } else if (status === 'error') {
              if (step === 'generate') {
                spinner.fail(chalk.yellow(message || 'Generation failed'));
              } else {
                console.log(`  ${chalk.red('✗')} ${stepName} ${message ? chalk.gray(`(${message})`) : ''}`);
              }
            }
          },
          onGenerationAttempt: (attempt, total) => {
            spinner.text = `Generating specification... (attempt ${attempt}/${total})`;
          },
          onGenerationError: (attempt, errors) => {
            spinner.text = `Retrying generation... (attempt ${attempt + 1})`;
          },
        };
        
        const result = await initProject(initOptions);
        
        console.log();
        
        if (result.warnings.length > 0) {
          for (const warning of result.warnings) {
            console.log(chalk.yellow(`⚠ ${warning}`));
          }
          console.log();
        }
        
        if (result.success) {
          console.log(chalk.green.bold(`Done! Project created at ${result.projectDir}`));
          console.log();
          console.log('Next steps:');
          if (projectName) {
            console.log(`  ${chalk.cyan(`cd ${projectName}`)}`);
          }
          console.log(`  ${chalk.cyan(`evospec validate ${result.specFile.split('/').pop()}`)}`);
          console.log(`  ${chalk.cyan(`evospec evolve ${result.specFile.split('/').pop()} -c "Add feature"`)}`);
        } else {
          console.log(chalk.red.bold('Project initialization failed:'));
          for (const error of result.errors) {
            console.log(chalk.red(`  • ${error}`));
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
