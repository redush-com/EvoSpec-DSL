import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  specSidebar: [
    {
      type: 'category',
      label: 'Specification',
      items: [
        'spec/introduction',
        'spec/domain-layer',
        'spec/evolution-layer',
        'spec/generation-layer',
        'spec/contracts',
        'spec/scenarios',
        'spec/validator',
      ],
    },
  ],
  guidesSidebar: [
    {
      type: 'category',
      label: 'Guides',
      items: [
        'guides/quick-start',
      ],
    },
  ],
  referenceSidebar: [
    {
      type: 'category',
      label: 'Reference',
      items: [
        'reference/node-kinds',
        'reference/types',
        'reference/error-codes',
      ],
    },
  ],
};

export default sidebars;
