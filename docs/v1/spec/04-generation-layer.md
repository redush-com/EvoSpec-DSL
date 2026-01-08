# 4. Generation Layer

The Generation Layer describes **how** code is generated and managed — file zones, user code hooks, and build pipelines.

## 4.1 Purpose

The Generation Layer provides:

1. **Zone Control** — Define which files can be modified and how
2. **Hook Points** — Safe places for user code that survives regeneration
3. **Monorepo Layout** — Standard project structure
4. **Pipelines** — Build, test, and deployment commands
5. **Verification** — Required checks before changes are applied

## 4.2 Generation Block

```yaml
generation:
  monorepo:                    # Project layout
    layout:
      apps:
        frontend: "apps/frontend"
        backend: "apps/backend"
      libs:
        domain: "libs/domain"

  zones:                       # File zones
    - { path: "apps/backend/generated/**", mode: overwrite }
    - { path: "apps/backend/src/**", mode: anchored }
    - { path: "apps/frontend/**", mode: preserve }

  hooks:                       # User code hooks
    - id: hook.order.pricing
      location:
        file: "apps/backend/src/domain/order/pricing.ts"
        anchorStart: "// <spec:hook id='order.pricing'>"
        anchorEnd: "// </spec:hook>"
      contract:
        signature: "(order: Order) => number"
        purity: true

  pipelines:                   # Build commands
    build: { cmd: "pnpm -r build" }
    test: { cmd: "pnpm -r test" }
    migrate: { cmd: "pnpm --filter backend migrate" }

  verification:                # Required checks
    required: [build, test, migrate]
    optional: [e2e, lint]
```

## 4.3 Monorepo Layout

Define the project structure:

```yaml
monorepo:
  layout:
    apps:                      # Application packages
      frontend: "apps/frontend"
      backend: "apps/backend"
      mobile: "apps/mobile"
    libs:                      # Library packages
      domain: "libs/domain"
      infra: "libs/infra"
      ui: "libs/ui"
```

This helps generators understand where to place generated code.

## 4.4 Zones

Zones define how different parts of the codebase are managed.

### Zone Modes

| Mode | Description | LLM Can Modify | User Code Safe |
|------|-------------|----------------|----------------|
| `overwrite` | Fully regenerated | Yes (full) | No |
| `anchored` | Has hook anchors | Yes (outside anchors) | Yes (in anchors) |
| `preserve` | Never touched | No | Yes |
| `spec-controlled` | Changes only via spec | Via spec only | N/A |

### Zone Definition

```yaml
zones:
  - path: "apps/backend/generated/**"
    mode: overwrite

  - path: "apps/backend/src/**"
    mode: anchored

  - path: "apps/frontend/**"
    mode: preserve

  - path: "libs/domain/**"
    mode: spec-controlled
```

### Zone Rules

- **MUST** cover every file in the repository
- **MUST NOT** have overlapping zones
- `preserve` zones **MUST NOT** be modified by any plan
- `overwrite` zones **MUST NOT** contain hooks

### Path Patterns

Zones use glob patterns:

```yaml
# All files in directory
path: "apps/backend/**"

# Specific file types
path: "apps/backend/**/*.ts"

# Specific directory
path: "apps/backend/generated/**"

# Single file
path: "apps/backend/src/index.ts"
```

## 4.5 Hooks

Hooks are safe places for user code within `anchored` zones.

### Hook Definition

```yaml
hooks:
  - id: hook.order.pricing           # REQUIRED - unique ID
    location:                        # REQUIRED
      file: "apps/backend/src/domain/order/pricing.ts"
      anchorStart: "// <spec:hook id='order.pricing'>"
      anchorEnd: "// </spec:hook>"
    contract:                        # optional
      signature: "(order: Order) => number"
      purity: true
```

### Hook in Code

```typescript
// apps/backend/src/domain/order/pricing.ts

export function calculateOrderTotal(order: Order): number {
  let total = 0;

  for (const item of order.items) {
    total += item.quantity * item.unitPrice;
  }

  // <spec:hook id='order.pricing'>
  // User code here - custom pricing logic
  // This section survives regeneration

  // Apply discounts
  if (order.customer.tier === 'gold') {
    total *= 0.9; // 10% discount
  }

  // </spec:hook>

  return total;
}
```

### Hook Rules

- **MUST** have unique `id` across all hooks
- **MUST** have distinguishable `anchorStart` and `anchorEnd`
- **MUST** be in `anchored` zone (not `overwrite` or `preserve`)
- Generator **MUST NOT** modify content between anchors

### Hook Contracts

Optional contracts define expectations for hook code:

```yaml
contract:
  signature: "(order: Order) => number"   # Expected function signature
  purity: true                            # Must be pure (no side effects)
  async: false                            # Sync or async
  throws: false                           # Can throw exceptions
```

## 4.6 Pipelines

Pipelines define commands for building, testing, and deploying.

### Pipeline Definition

```yaml
pipelines:
  build:
    cmd: "pnpm -r build"

  test:
    cmd: "pnpm -r test"

  e2e:
    cmd: "pnpm -r e2e"

  migrate:
    cmd: "pnpm --filter backend migrate"

  lint:
    cmd: "pnpm -r lint"

  deploy:
    cmd: "pnpm -r deploy"
```

### Required Pipelines

These pipelines **MUST** be defined:

| Pipeline | Purpose |
|----------|---------|
| `build` | Compile/build the project |
| `test` | Run unit tests |
| `migrate` | Run database migrations |

### Optional Pipelines

| Pipeline | Purpose |
|----------|---------|
| `e2e` | End-to-end tests |
| `lint` | Code linting |
| `deploy` | Deployment |

## 4.7 Verification

Define which checks must pass before changes are applied.

```yaml
verification:
  required:                    # MUST pass
    - build
    - test
    - migrate

  optional:                    # SHOULD pass (warnings only)
    - e2e
    - lint
```

### Verification Flow

1. Generate code changes
2. Run `required` pipelines
3. If any fails → **STOP**, reject changes
4. Run `optional` pipelines
5. If any fails → **WARN**, but continue
6. Apply changes

## 4.8 Generation Safety

### LLM Constraints

When LLM generates a plan, it **MUST NOT**:

1. Write to `preserve` zones
2. Modify content inside hook anchors
3. Delete hook anchors
4. Create files outside defined zones
5. Violate hook contracts

### Validation

The validator checks:

```yaml
# GENERATION_ERROR if:
- Plan writes to preserve zone
- Plan modifies hook content
- Plan deletes anchors
- Plan violates hook contract
- File not covered by any zone
```

## 4.9 Zone Examples

### Typical Backend Structure

```yaml
zones:
  # Generated code - fully managed
  - path: "apps/backend/generated/**"
    mode: overwrite

  # Source code - has hooks for customization
  - path: "apps/backend/src/**"
    mode: anchored

  # Tests - user-written
  - path: "apps/backend/tests/**"
    mode: preserve

  # Config files - user-managed
  - path: "apps/backend/*.config.*"
    mode: preserve
```

### Typical Frontend Structure

```yaml
zones:
  # Generated API client
  - path: "apps/frontend/src/api/generated/**"
    mode: overwrite

  # Components - user code
  - path: "apps/frontend/src/components/**"
    mode: preserve

  # Types from spec
  - path: "apps/frontend/src/types/**"
    mode: spec-controlled
```

### Shared Library

```yaml
zones:
  # Domain types - from spec
  - path: "libs/domain/src/**"
    mode: spec-controlled

  # Infrastructure - user code
  - path: "libs/infra/src/**"
    mode: preserve
```

## 4.10 Best Practices

### 1. Separate Generated and User Code

```
apps/backend/
├── generated/          # mode: overwrite
│   ├── types.ts
│   └── api.ts
├── src/                # mode: anchored
│   ├── domain/
│   │   └── order/
│   │       └── pricing.ts  # has hooks
│   └── index.ts
└── tests/              # mode: preserve
    └── order.test.ts
```

### 2. Use Meaningful Hook IDs

```yaml
# Good
- id: hook.order.pricing
- id: hook.order.validation
- id: hook.payment.gateway

# Bad
- id: hook1
- id: custom_code
```

### 3. Document Hook Contracts

```yaml
hooks:
  - id: hook.order.pricing
    contract:
      signature: "(order: Order) => number"
      purity: true
    # Add description in meta
    meta:
      description: |
        Custom pricing logic. Receives order with items,
        returns final price in cents. Must be pure function.
```

### 4. Keep Preserve Zones Minimal

Only preserve what truly needs user control:
- Configuration files
- Test files
- Documentation
- Scripts

Generated code should be in `overwrite` or `spec-controlled` zones.
