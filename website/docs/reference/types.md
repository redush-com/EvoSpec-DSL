---
sidebar_position: 2
title: Types
---

# Type System Reference

## Primitive Types

| Type | Description | Example |
|------|-------------|---------|
| `uuid` | UUID v4 identifier | `"550e8400-e29b-41d4-a716-446655440000"` |
| `string` | Text | `"Hello, World"` |
| `int` | Integer number | `42` |
| `bool` | Boolean | `true` |
| `datetime` | ISO 8601 timestamp | `"2025-01-08T12:00:00Z"` |

## Reference Types

### Entity Reference

```yaml
type: ref(entity.customer)
```

### Enum Reference

```yaml
type: enum(OrderStatus)
```

## Field Definitions

```yaml
fields:
  id:
    type: uuid
    required: true
  status:
    type: enum(OrderStatus)
    required: true
    default: "draft"
  notes:
    type: string
    required: false
    description: "Optional notes"
```

For complete details, see the [full reference](/docs/v1/reference/types.md).
