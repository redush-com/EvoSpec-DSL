/**
 * Generate Command
 * Generate a new EvoSpec specification from description
 */

import { Command } from 'commander';
import { writeFileSync } from 'fs';
import chalk from 'chalk';
import ora from 'ora';
import { loadConfig } from '../config/loader.js';
import { ensureApiKey } from '../config/setup.js';
import { generateSpec } from '../generation/engine.js';
import type { LLMProviderName } from '../config/schema.js';

export function createGenerateCommand(): Command {
  const cmd = new Command('generate')
    .description('Generate a new EvoSpec specification from description')
    .argument('<description>', 'Natural language description of the system')
    .option('-o, --output <file>', 'Output file path (default: stdout)')
    .option('-p, --provider <provider>', 'LLM provider: openrouter|openai|anthropic|ollama')
    .option('-m, --model <model>', 'Model identifier')
    .option('--max-retries <n>', 'Max validation retry attempts', '3')
    .option('--temperature <t>', 'Model temperature 0-1', '0.3')
    .option('-v, --verbose', 'Show generation progress and retries')
    .action(async (description: string, options: {
      output?: string;
      provider?: string;
      model?: string;
      maxRetries: string;
      temperature: string;
      verbose?: boolean;
    }) => {
      const spinner = ora();
      
      try {
        let config = loadConfig();
        const provider = options.provider as LLMProviderName | undefined ?? config.llm.provider;
        
        // Ensure API key is configured
        const setupResult = await ensureApiKey(config, provider);
        config = setupResult.config;
        
        if (setupResult.cancelled) {
          console.log(chalk.red('API key required for generation.'));
          process.exit(1);
        }
        
        if (options.verbose) {
          spinner.start('Generating specification...');
        }
        
        const result = await generateSpec(config, {
          description,
          provider: options.provider as LLMProviderName | undefined,
          model: options.model,
          maxRetries: parseInt(options.maxRetries, 10),
          temperature: parseFloat(options.temperature),
          onAttempt: (attempt, total) => {
            if (options.verbose) {
              spinner.text = `Generating specification... (attempt ${attempt}/${total})`;
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
          if (options.output) {
            writeFileSync(options.output, result.yaml, 'utf-8');
            console.log(chalk.green(`✓ Generated specification saved to ${options.output}`));
            console.log(chalk.gray(`  Attempts: ${result.attempts}`));
          } else {
            console.log(result.yaml);
          }
        } else {
          console.error(chalk.red('Generation failed after maximum retries'));
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
