# Quick Start Guide

Get started with EvoSpec DSL in 5 minutes.

## Prerequisites

- Node.js 18+
- npm, pnpm, or yarn

## Installation

```bash
# Install the CLI globally
npm install -g @evospec/cli

# Or use npx
npx @evospec/cli validate myspec.yaml
```

## Your First Spec

Create a file `myapp.evospec.yaml`:

```yaml
spec: evospec/v1

project:
  id: myapp
  name: "My Application"
  versioning:
    strategy: semver
    current: "1.0.0"

structure:
  root: NodeRef(system.root)

domain:
  nodes:
    # Root system
    - kind: System
      id: system.root
      meta:
        title: "My Application"
      spec:
        goals:
          - "Manage users"
          - "Track tasks"
      children:
        - NodeRef(mod.users)

    # Users module
    - kind: Module
      id: mod.users
      meta:
        title: "Users"
      spec: {}
      children:
        - NodeRef(entity.user)
        - NodeRef(cmd.user.create)
        - NodeRef(evt.user.created)

    # User entity
    - kind: Entity
      id: entity.user
      meta:
        title: "User"
      spec:
        fields:
          id:
            type: uuid
            required: true
          email:
            type: string
            required: true
          name:
            type: string
            required: true
          createdAt:
            type: datetime
            required: true
      contracts:
        - invariant: "email != ''"
          level: hard

    # Create user command
    - kind: Command
      id: cmd.user.create
      meta:
        title: "Create User"
      spec:
        input:
          email: string
          name: string
        effects:
          emits:
            - evt.user.created

    # User created event
    - kind: Event
      id: evt.user.created
      spec:
        payload:
          userId: uuid
          email: string
          occurredAt: datetime

history:
  - version: "1.0.0"
    basedOn: null
    changes: []
    migrations: []
    notes: "Initial version"
```

## Validate Your Spec

```bash
evospec validate myapp.evospec.yaml
```

Expected output:

```
✓ Phase 1: Structural validation passed
✓ Phase 2: Referential validation passed
✓ Phase 3: Semantic validation passed
✓ Phase 4: Evolution validation passed
✓ Phase 5: Generation validation passed
✓ Phase 6: Verifiability validation passed

Validation successful!
```

## Add a Test Scenario

Add this to your `domain.nodes`:

```yaml
    # Test scenario
    - kind: Scenario
      id: sc.user.create_happy_path
      meta:
        title: "Create User - Happy Path"
      spec:
        given: []
        when:
          - command:
              id: cmd.user.create
              input:
                email: "john@example.com"
                name: "John Doe"
        then:
          - expectEvent:
              id: evt.user.created
              match:
                email: "john@example.com"
```

And register it:

```yaml
tests:
  scenarios:
    - NodeRef(sc.user.create_happy_path)
```

## Add Generation Config

```yaml
generation:
  zones:
    - path: "src/generated/**"
      mode: overwrite
    - path: "src/**"
      mode: anchored
    - path: "tests/**"
      mode: preserve

  pipelines:
    build:
      cmd: "npm run build"
    test:
      cmd: "npm test"
    migrate:
      cmd: "npm run migrate"
```

## Evolve Your Spec

When you need to add a field:

```yaml
# Update entity.user
- kind: Entity
  id: entity.user
  spec:
    fields:
      # ... existing fields ...
      phone:                    # NEW FIELD
        type: string
        required: false

# Add to history
history:
  - version: "1.0.0"
    basedOn: null
    changes: []
    migrations: []

  - version: "1.1.0"           # NEW VERSION
    basedOn: "1.0.0"
    changes:
      - op: add-field
        target: entity.user
        field: phone
        type: string
        required: false
    migrations: []
    notes: "Add optional phone field"

# Update current version
project:
  versioning:
    current: "1.1.0"           # UPDATE
```

## Common Patterns

### Entity with Relations

```yaml
- kind: Entity
  id: entity.order
  spec:
    fields:
      id: { type: uuid, required: true }
      customerId: { type: ref(entity.customer), required: true }
      status: { type: enum(OrderStatus), required: true }
    relations:
      customer:
        to: entity.customer
        type: many-to-one
```

### Process with Steps

```yaml
- kind: Process
  id: proc.order.fulfillment
  spec:
    trigger: cmd.order.submit
    state:
      vars:
        orderId: uuid
        paid: bool
  children:
    - NodeRef(step.validate)
    - NodeRef(step.pay)
    - NodeRef(step.ship)
  contracts:
    - temporal: "G(step.ship -> paid)"
      level: hard
```

### API Interface

```yaml
- kind: Interface
  id: iface.http
  spec:
    style: openapi
    exposes:
      commands:
        - cmd.user.create
        - cmd.order.submit
      queries:
        - qry.user.get
```

## Next Steps

1. Read the [full specification](../spec/01-introduction.md)
2. Explore [example files](../../../llm/v1/examples/)
3. Set up [code generation](./code-generation.md)
4. Configure [CI/CD integration](./ci-cd.md)

## Getting Help

- [GitHub Issues](https://github.com/evospec/evospec-dsl/issues)
- [Documentation](https://evospec.dev/docs)
- [Examples](https://github.com/evospec/evospec-dsl/tree/main/llm/v1/examples)
