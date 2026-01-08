# EvoSpec DSL v1 — Compact Guide

## Format
- YAML with `spec: evospec/v1`
- IDs: `^[a-z][a-z0-9_.-]*$`

## Structure
```yaml
spec: evospec/v1
project: { id: my.app, versioning: { strategy: semver, current: "1.0.0" } }
structure: { root: NodeRef(system.root) }
domain: { nodes: [...] }
```

## Node
```yaml
- kind: System|Module|Entity|Enum|Command|Event|Process|Step|Scenario
  id: stable.id
  spec: { ... }  # kind-specific, REQUIRED
  children: [NodeRef(...)]  # optional
```

## Kind → spec

| Kind | spec |
|------|------|
| System | `goals: [str]` |
| Entity | `fields: { name: { type, required? } }` |
| Enum | `values: [str]` |
| Command | `input: { field: type }`, `effects?: { emits: [id] }` |
| Event | `payload: { field: type }` |
| Process | `trigger: id`, `state?: { vars: {...} }` |
| Step | `action: str` |
| Scenario | `given: [], when: [], then: []` |

## Types
`uuid`, `string`, `int`, `bool`, `datetime`, `ref(entity.x)`, `enum(Name)`

## Example
```yaml
spec: evospec/v1
project:
  id: demo
  versioning: { strategy: semver, current: "1.0.0" }
structure:
  root: NodeRef(system.root)
domain:
  nodes:
    - kind: System
      id: system.root
      spec: { goals: ["Demo"] }
    - kind: Entity
      id: entity.user
      spec:
        fields:
          id: { type: uuid, required: true }
          name: { type: string, required: true }
```

## Rules
- All IDs unique
- All NodeRef must resolve
- Entity needs `fields`, Command needs `input`, Event needs `payload`
