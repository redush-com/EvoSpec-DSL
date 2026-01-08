---
sidebar_position: 3
title: Error Codes
---

# Error Codes Reference

## Error Format

```yaml
error:
  code: <ErrorCode>
  phase: 1-6
  level: hard | soft
  message: "Human-readable description"
  location: "JSON path to error"
```

## Error Codes by Phase

### Phase 1: Structural

| Code | Description |
|------|-------------|
| `STRUCTURAL_ERROR` | Invalid spec format |
| `MISSING_SPEC_VERSION` | Missing 'spec' field |
| `INVALID_NODE_ID` | Invalid node ID format |
| `DUPLICATE_NODE_ID` | Duplicate node ID |

### Phase 2: Referential

| Code | Description |
|------|-------------|
| `REFERENCE_ERROR` | General reference issue |
| `UNRESOLVED_NODEREF` | NodeRef does not resolve |
| `CIRCULAR_CHILDREN` | Circular reference in children |

### Phase 3: Semantic

| Code | Description |
|------|-------------|
| `SEMANTIC_ERROR` | General semantic issue |
| `ENTITY_MISSING_FIELDS` | Entity missing 'fields' |
| `COMMAND_MISSING_INPUT` | Command missing 'input' |
| `EVENT_MISSING_PAYLOAD` | Event missing 'payload' |

### Phase 4: Evolution

| Code | Description |
|------|-------------|
| `EVOLUTION_ERROR` | General evolution issue |
| `BROKEN_HISTORY_CHAIN` | History chain is broken |
| `MISSING_MIGRATION` | Breaking change without migration |

### Phase 5: Generation

| Code | Description |
|------|-------------|
| `GENERATION_ERROR` | General generation issue |
| `PRESERVE_ZONE_MODIFIED` | Plan modifies preserve zone |
| `HOOK_CONTENT_MODIFIED` | Plan modifies hook content |

### Phase 6: Verification

| Code | Description |
|------|-------------|
| `VERIFICATION_ERROR` | General verification issue |
| `MISSING_BUILD_PIPELINE` | Missing 'build' pipeline |
| `MISSING_TEST_PIPELINE` | Missing 'test' pipeline |

For complete details, see the [full reference](/docs/v1/reference/error-codes.md).
