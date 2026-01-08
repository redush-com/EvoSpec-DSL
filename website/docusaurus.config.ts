import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'EvoSpec DSL',
  tagline: 'Specification-driven software evolution for LLM-guided development',
  favicon: 'img/favicon.ico',

  url: 'https://evospec.dev',
  baseUrl: '/',

  organizationName: 'evospec',
  projectName: 'evospec-dsl',

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          editUrl: 'https://github.com/evospec/evospec-dsl/tree/main/website/',
          lastVersion: 'current',
          versions: {
            current: {
              label: 'v1',
              path: 'v1',
            },
          },
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: 'img/evospec-social-card.png',
    navbar: {
      title: 'EvoSpec DSL',
      logo: {
        alt: 'EvoSpec Logo',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'specSidebar',
          position: 'left',
          label: 'Specification',
        },
        {
          type: 'docSidebar',
          sidebarId: 'guidesSidebar',
          position: 'left',
          label: 'Guides',
        },
        {
          type: 'docSidebar',
          sidebarId: 'referenceSidebar',
          position: 'left',
          label: 'Reference',
        },
        {
          type: 'docsVersionDropdown',
          position: 'right',
        },
        {
          href: 'https://github.com/evospec/evospec-dsl',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            {
              label: 'Specification',
              to: '/docs/v1/spec/introduction',
            },
            {
              label: 'Quick Start',
              to: '/docs/v1/guides/quick-start',
            },
            {
              label: 'Reference',
              to: '/docs/v1/reference/node-kinds',
            },
          ],
        },
        {
          title: 'Resources',
          items: [
            {
              label: 'JSON Schema',
              href: '/schema/v1/evospec.schema.json',
            },
            {
              label: 'LLM Prompts',
              href: '/llm/v1/SYSTEM_PROMPT.md',
            },
            {
              label: 'Examples',
              href: 'https://github.com/evospec/evospec-dsl/tree/main/llm/v1/examples',
            },
          ],
        },
        {
          title: 'Community',
          items: [
            {
              label: 'GitHub',
              href: 'https://github.com/evospec/evospec-dsl',
            },
            {
              label: 'Issues',
              href: 'https://github.com/evospec/evospec-dsl/issues',
            },
            {
              label: 'Discussions',
              href: 'https://github.com/evospec/evospec-dsl/discussions',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} EvoSpec. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['yaml', 'json', 'bash', 'typescript'],
    },
    colorMode: {
      defaultMode: 'light',
      disableSwitch: false,
      respectPrefersColorScheme: true,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
