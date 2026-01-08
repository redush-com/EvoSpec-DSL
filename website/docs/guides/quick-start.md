---
sidebar_position: 1
title: Quick Start
---

# Quick Start Guide

Get started with EvoSpec DSL in 5 minutes.

## Installation

```bash
npm install -g @evospec/cli
```

## Your First Spec

Create `myapp.evospec.yaml`:

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
    - kind: System
      id: system.root
      meta:
        title: "My Application"
      spec:
        goals:
          - "Manage users"
      children:
        - NodeRef(entity.user)

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
      contracts:
        - invariant: "email != ''"
          level: hard

history:
  - version: "1.0.0"
    basedOn: null
    changes: []
    migrations: []
```

## Validate

```bash
evospec validate myapp.evospec.yaml
```

## Next Steps

1. Read the [Specification](../spec/introduction)
2. Explore [Examples](https://github.com/evospec/evospec-dsl/tree/main/llm/v1/examples)
3. Set up code generation
