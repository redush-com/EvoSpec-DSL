---
sidebar_position: 1
title: Introduction
---

# 1. Introduction

## 1.1 Purpose

**EvoSpec DSL** (Evolution Software Specification DSL) is a domain-specific language designed for **managed LLM-driven software evolution**. It provides a formal, machine-readable specification format that describes:

- **What** the system is (data, processes, interfaces, policies)
- **How** it is allowed to evolve (history, migrations, version constraints)
- **How** code generation is controlled (zones, anchors, pipelines)
- **How** correctness is verified (contracts, test scenarios)
- **How** it is documented (doc packs, auto-generated docs)

## 1.2 Goals

EvoSpec DSL enables:

1. **Specification-Guided Evolution** — All changes flow through the spec, ensuring consistency
2. **LLM-Safe Generation** — Clear boundaries prevent AI from making unauthorized changes
3. **Stack-Agnostic Design** — Works with any technology stack
4. **Verifiable Changes** — Every modification can be validated before application
5. **Complete Audit Trail** — Full history of changes with migration paths

## 1.3 Non-Goals

EvoSpec DSL is **NOT**:

- A programming language for implementing algorithms
- A compiler that generates code in any language
- A replacement for frameworks or libraries
- A runtime execution environment

Algorithms (CV, ML, optimization) are implemented in user code through **hooks**, but under the control of contracts defined in the spec.

## 1.4 Document Conventions

This specification uses requirement levels as defined in [RFC 2119](https://www.ietf.org/rfc/rfc2119.txt):

| Keyword | Meaning |
|---------|---------|
| **MUST** | Absolute requirement |
| **MUST NOT** | Absolute prohibition |
| **SHOULD** | Recommended but not required |
| **SHOULD NOT** | Not recommended but not prohibited |
| **MAY** | Optional |

## 1.5 Specification Version

This document describes **EvoSpec DSL v1**.

All conforming documents MUST declare:

```yaml
spec: evospec/v1
```

## 1.6 File Format

EvoSpec files:

- **MUST** be serializable to JSON
- **MAY** use YAML as a human-friendly format
- **MUST** have deterministic canonical form (sorted keys, stable ordering) for diff operations
- **SHOULD** use `.evospec.yaml` or `.evospec.json` file extension

## 1.7 Core Concepts

### Nodes

Everything in EvoSpec is a **Node**. Nodes are the universal building blocks:

```yaml
- kind: <NodeKind>      # Type of node (Entity, Command, etc.)
  id: <stable-id>       # Unique identifier
  meta:                 # Human-readable metadata
    title: "..."
    description: "..."
  spec: { ... }         # What this node IS (required)
  impl: { ... }         # How/where it's implemented (optional)
  children: [...]       # Child nodes
  contracts: [...]      # Invariants and constraints
  hooks: [...]          # User code extension points
```

### Stable IDs

Every node has a **stable ID** that:

- **MUST** match pattern `^[a-z][a-z0-9_.-]*$`
- **MUST** be unique across the entire specification
- **MUST NOT** change between versions (use rename operations instead)

Examples:
- `system.root`
- `entity.customer`
- `cmd.order.submit`
- `evt.order.submitted`

### NodeRef

References to other nodes use the `NodeRef(id)` syntax:

```yaml
children:
  - NodeRef(entity.customer)
  - NodeRef(entity.order)
```

## 1.8 Specification Structure

A complete EvoSpec document has this structure:

```yaml
spec: evospec/v1           # Version declaration (REQUIRED)

project:                   # Project metadata (REQUIRED)
  id: my.project
  versioning:
    strategy: semver
    current: "1.0.0"

structure:                 # Entry point (REQUIRED)
  root: NodeRef(system.root)

domain:                    # Domain model (REQUIRED)
  nodes: [...]

generation:                # Code generation rules (optional)
  zones: [...]
  hooks: [...]
  pipelines: {...}

history:                   # Version history (optional but recommended)
  - version: "1.0.0"
    changes: [...]
    migrations: [...]

tests:                     # Test scenarios (optional)
  scenarios: [...]

docs:                      # Documentation config (optional)
  packs: [...]
```

## 1.9 Layers

EvoSpec has three conceptual layers:

### Domain Layer
Describes **what** the system is:
- Entities, Enums, Values
- Commands, Events, Queries
- Processes, Steps
- Policies, Contracts

### Evolution Layer
Describes **how** the system changes:
- Version history
- Change operations
- Migrations
- Compatibility rules

### Generation Layer
Describes **how** code is generated:
- File zones (overwrite, anchored, preserve)
- Hook points for user code
- Build/test pipelines
- Verification requirements

## 1.10 Validation

Every EvoSpec document **MUST** pass validation before use. Validation occurs in phases:

1. **Structural** — Correct syntax and required fields
2. **Referential** — All references resolve, no illegal cycles
3. **Semantic** — Kind-specific rules are satisfied
4. **Evolution** — History chain is valid, migrations exist
5. **Generation** — Zones cover all files, hooks are valid
6. **Verifiability** — Pipelines defined, scenarios exist

See [Validator](./validator) for complete validation rules.
