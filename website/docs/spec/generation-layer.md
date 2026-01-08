---
sidebar_position: 4
title: Generation Layer
---

# 4. Generation Layer

The Generation Layer describes **how** code is generated and managed — file zones, user code hooks, and build pipelines.

## 4.1 Zones

Zones define how different parts of the codebase are managed.

| Mode | Description | LLM Can Modify | User Code Safe |
|------|-------------|----------------|----------------|
| `overwrite` | Fully regenerated | Yes (full) | No |
| `anchored` | Has hook anchors | Yes (outside anchors) | Yes (in anchors) |
| `preserve` | Never touched | No | Yes |
| `spec-controlled` | Changes only via spec | Via spec only | N/A |

```yaml
generation:
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

## 4.2 Hooks

Hooks are safe places for user code within `anchored` zones:

```yaml
hooks:
  - id: hook.order.pricing
    location:
      file: "apps/backend/src/domain/order/pricing.ts"
      anchorStart: "// <spec:hook id='order.pricing'>"
      anchorEnd: "// </spec:hook>"
    contract:
      signature: "(order: Order) => number"
      purity: true
```

In code:

```typescript
export function calculateOrderTotal(order: Order): number {
  let total = 0;
  for (const item of order.items) {
    total += item.quantity * item.unitPrice;
  }

  // <spec:hook id='order.pricing'>
  // User code here - survives regeneration
  if (order.customer.tier === 'gold') {
    total *= 0.9; // 10% discount
  }
  // </spec:hook>

  return total;
}
```

## 4.3 Pipelines

```yaml
pipelines:
  build: { cmd: "pnpm -r build" }
  test: { cmd: "pnpm -r test" }
  migrate: { cmd: "pnpm --filter backend migrate" }

verification:
  required: [build, test, migrate]
  optional: [e2e, lint]
```

For complete details, see the [full specification](/docs/v1/spec/04-generation-layer.md).
