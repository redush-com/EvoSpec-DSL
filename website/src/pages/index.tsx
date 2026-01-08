import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';

import styles from './index.module.css';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <Heading as="h1" className="hero__title">
          {siteConfig.title}
        </Heading>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <div className={styles.buttons}>
          <Link
            className="button button--secondary button--lg"
            to="/docs/v1/guides/quick-start">
            Quick Start →
          </Link>
          <Link
            className="button button--outline button--secondary button--lg"
            to="/docs/v1/spec/introduction">
            Read the Spec
          </Link>
        </div>
      </div>
    </header>
  );
}

type FeatureItem = {
  title: string;
  description: JSX.Element;
  icon: string;
};

const FeatureList: FeatureItem[] = [
  {
    title: 'Specification-Driven',
    icon: '📋',
    description: (
      <>
        Define your entire system in a single, version-controlled specification.
        Domain models, processes, contracts, and tests — all in one place.
      </>
    ),
  },
  {
    title: 'LLM-Safe Generation',
    icon: '🤖',
    description: (
      <>
        Clear boundaries for AI code generation. Zones, hooks, and contracts
        ensure LLMs can only modify what they're allowed to.
      </>
    ),
  },
  {
    title: 'Managed Evolution',
    icon: '🔄',
    description: (
      <>
        Track every change with full history. Migrations ensure safe transitions
        between versions with no data loss.
      </>
    ),
  },
  {
    title: 'Stack-Agnostic',
    icon: '🔧',
    description: (
      <>
        Works with any technology stack. Generate TypeScript, Python, Go, or any
        language from the same specification.
      </>
    ),
  },
  {
    title: 'Verifiable Contracts',
    icon: '✅',
    description: (
      <>
        Define invariants, temporal constraints, and policies. The validator
        ensures your system stays consistent.
      </>
    ),
  },
  {
    title: 'Test Generation',
    icon: '🧪',
    description: (
      <>
        Scenarios become executable tests. Document behavior and verify
        correctness from the same source.
      </>
    ),
  },
];

function Feature({title, icon, description}: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <div className={styles.featureCard}>
        <div className={styles.featureIcon}>{icon}</div>
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

function HomepageFeatures(): JSX.Element {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}

function HomepageCode(): JSX.Element {
  return (
    <section className={styles.codeSection}>
      <div className="container">
        <div className="row">
          <div className="col col--6">
            <Heading as="h2">Simple, Declarative Syntax</Heading>
            <p>
              EvoSpec uses YAML to describe your system. Define entities,
              commands, events, and processes in a human-readable format that
              LLMs can easily understand and generate.
            </p>
            <Link
              className="button button--primary button--lg"
              to="/docs/v1/spec/domain-layer">
              Learn the Syntax
            </Link>
          </div>
          <div className="col col--6">
            <pre className={styles.codeBlock}>
{`spec: evospec/v1

project:
  id: myapp
  versioning:
    strategy: semver
    current: "1.0.0"

domain:
  nodes:
    - kind: Entity
      id: entity.user
      spec:
        fields:
          id: { type: uuid, required: true }
          email: { type: string, required: true }
      contracts:
        - invariant: "email != ''"`}
            </pre>
          </div>
        </div>
      </div>
    </section>
  );
}

function HomepageCTA(): JSX.Element {
  return (
    <section className={styles.ctaSection}>
      <div className="container">
        <Heading as="h2">Ready to Get Started?</Heading>
        <p>
          Install the CLI and create your first specification in minutes.
        </p>
        <pre className={styles.installCommand}>
          npm install -g @evospec/cli
        </pre>
        <div className={styles.buttons}>
          <Link
            className="button button--primary button--lg"
            to="/docs/v1/guides/quick-start">
            Get Started
          </Link>
          <Link
            className="button button--outline button--primary button--lg"
            href="https://github.com/evospec/evospec-dsl">
            View on GitHub
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function Home(): JSX.Element {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={`${siteConfig.title} - Specification-driven software evolution`}
      description="EvoSpec DSL is a domain-specific language for managed LLM-driven software evolution. Define your system, control code generation, and evolve safely.">
      <HomepageHeader />
      <main>
        <HomepageFeatures />
        <HomepageCode />
        <HomepageCTA />
      </main>
    </Layout>
  );
}
