# 5. Contracts

Contracts are formal constraints that define correctness guarantees for the system.

## 5.1 Purpose

Contracts provide:

1. **Data Invariants** — Constraints on entity state
2. **API Compatibility** — Rules for interface evolution
3. **Temporal Constraints** — Process ordering guarantees
4. **Security Policies** — Access and authorization rules
5. **Generation Rules** — Constraints on code generation

## 5.2 Contract Structure

```yaml
contracts:
  - type: invariant | temporal | api-compatibility | policy
    invariant: "expression"      # For invariant type
    temporal: "LTL expression"   # For temporal type
    rule: "description"          # For api-compatibility/policy
    level: hard | soft           # Violation severity
```

### Contract Levels

| Level | Behavior |
|-------|----------|
| `hard` | Violation blocks generation and deployment |
| `soft` | Violation generates warning but allows continuation |

## 5.3 Data Invariants

Invariants define constraints that must always be true for entity data.

### Basic Invariants

```yaml
- kind: Entity
  id: entity.order
  spec:
    fields:
      totalCents: { type: int, required: true }
      itemCount: { type: int, required: true }
  contracts:
    - invariant: "totalCents >= 0"
      level: hard

    - invariant: "itemCount > 0"
      level: hard

    - invariant: "totalCents <= 100000000"  # Max $1M
      level: soft
```

### String Invariants

```yaml
contracts:
  - invariant: "name != ''"
    level: hard

  - invariant: "email contains '@'"
    level: hard

  - invariant: "phone matches '^\\+?[0-9]{10,15}$'"
    level: soft
```

### Relational Invariants

```yaml
contracts:
  # Reference must exist
  - invariant: "customerId references entity.customer"
    level: hard

  # Enum value must be valid
  - invariant: "status in enum.order_status.values"
    level: hard
```

### Cross-Field Invariants

```yaml
contracts:
  # If shipped, must have tracking number
  - invariant: "status == 'shipped' implies trackingNumber != null"
    level: hard

  # Dates must be ordered
  - invariant: "shippedAt == null or shippedAt >= createdAt"
    level: hard
```

## 5.4 Temporal Constraints

Temporal constraints use Linear Temporal Logic (LTL) to define ordering guarantees in processes.

### LTL Operators

| Operator | Meaning | Example |
|----------|---------|---------|
| `G(φ)` | Globally (always) | `G(paid -> shipped)` |
| `F(φ)` | Finally (eventually) | `F(completed)` |
| `X(φ)` | Next state | `X(validated)` |
| `φ U ψ` | Until | `pending U processed` |
| `->` | Implies | `shipped -> paid` |

### Process Temporal Contracts

```yaml
- kind: Process
  id: proc.order.fulfillment
  spec:
    trigger: cmd.order.submit
  children:
    - NodeRef(step.validate)
    - NodeRef(step.pay)
    - NodeRef(step.ship)
  contracts:
    # Cannot ship without payment
    - temporal: "G(step.ship -> paid)"
      level: hard

    # Cannot pay without validation
    - temporal: "G(step.pay -> validated)"
      level: hard

    # Eventually completes or cancels
    - temporal: "F(completed or cancelled)"
      level: soft

    # Once shipped, stays shipped
    - temporal: "G(shipped -> G(shipped))"
      level: hard
```

### State Machine Constraints

```yaml
contracts:
  # Valid state transitions
  - temporal: "G(status == 'draft' -> X(status in ['submitted', 'cancelled']))"
    level: hard

  - temporal: "G(status == 'submitted' -> X(status in ['paid', 'cancelled']))"
    level: hard

  - temporal: "G(status == 'shipped' -> X(status in ['delivered']))"
    level: hard
```

## 5.5 API Compatibility Contracts

Define rules for how interfaces can evolve.

### Response Field Rules

```yaml
- kind: Interface
  id: iface.http
  spec:
    style: openapi
  contracts:
    # Cannot remove response fields in minor versions
    - type: api-compatibility
      rule: "minor cannot remove response fields"
      level: hard

    # Cannot change field types
    - type: api-compatibility
      rule: "field types are immutable"
      level: hard

    # Can add optional fields
    - type: api-compatibility
      rule: "can add optional response fields"
      level: soft
```

### Request Field Rules

```yaml
contracts:
  # Cannot add required request fields in minor versions
  - type: api-compatibility
    rule: "minor cannot add required request fields"
    level: hard

  # Can add optional request fields
  - type: api-compatibility
    rule: "can add optional request fields"
    level: soft
```

### Endpoint Rules

```yaml
contracts:
  # Cannot remove endpoints in minor versions
  - type: api-compatibility
    rule: "minor cannot remove endpoints"
    level: hard

  # Can deprecate endpoints
  - type: api-compatibility
    rule: "can deprecate endpoints with notice"
    level: soft
```

## 5.6 Policy Contracts

Business rules and security policies.

### Business Rules

```yaml
- kind: Policy
  id: policy.order.limits
  spec:
    rules:
      - "Order total cannot exceed $10,000 without approval"
      - "Maximum 100 items per order"
  contracts:
    - type: policy
      rule: "totalCents <= 1000000 or hasApproval"
      level: hard

    - type: policy
      rule: "itemCount <= 100"
      level: hard
```

### Security Policies

```yaml
- kind: Policy
  id: policy.access.orders
  spec:
    rules:
      - "Users can only view their own orders"
      - "Admins can view all orders"
  contracts:
    - type: policy
      rule: "query.order requires (user.id == order.customerId or user.role == 'admin')"
      level: hard
```

### Rate Limiting

```yaml
- kind: Policy
  id: policy.rate.api
  contracts:
    - type: policy
      rule: "max 100 requests per minute per user"
      level: hard

    - type: policy
      rule: "max 1000 requests per minute per IP"
      level: hard
```

## 5.7 Generation Contracts

Constraints on code generation.

### Zone Contracts

```yaml
contracts:
  # Preserve zones are immutable
  - type: generation
    rule: "preserve zones cannot be modified"
    level: hard

  # Hooks must be preserved
  - type: generation
    rule: "hook content must not be modified"
    level: hard
```

### Hook Contracts

```yaml
hooks:
  - id: hook.order.pricing
    contract:
      signature: "(order: Order) => number"
      purity: true
      async: false
```

Contract properties:

| Property | Description |
|----------|-------------|
| `signature` | Expected function signature |
| `purity` | Must be pure (no side effects) |
| `async` | Async function allowed |
| `throws` | Can throw exceptions |

## 5.8 Contract Inheritance

Contracts can be inherited through the node hierarchy:

```yaml
- kind: Module
  id: mod.orders
  contracts:
    # All entities in this module must have audit fields
    - invariant: "children[kind=Entity].fields contains createdAt"
      level: hard
  children:
    - NodeRef(entity.order)      # Inherits contract
    - NodeRef(entity.order_item) # Inherits contract
```

## 5.9 Contract Validation

### Validation Phases

| Phase | Contract Types Checked |
|-------|----------------------|
| Phase 3 (Semantic) | Data invariants |
| Phase 4 (Evolution) | API compatibility |
| Phase 5 (Generation) | Generation rules, hook contracts |
| Phase 6 (Verifiability) | Temporal constraints (via scenarios) |

### Validation Errors

```yaml
error:
  code: CONTRACT_VIOLATION
  level: hard
  message: "Invariant violated: totalCents >= 0"
  location: "domain.nodes[5].contracts[0]"
  context:
    contract: "totalCents >= 0"
    actual_value: -100
```

## 5.10 Best Practices

### 1. Start with Hard Constraints

```yaml
# Essential business rules should be hard
contracts:
  - invariant: "totalCents >= 0"
    level: hard  # Money can't be negative
```

### 2. Use Soft for Warnings

```yaml
# Recommendations can be soft
contracts:
  - invariant: "description.length <= 1000"
    level: soft  # Warn if too long, but allow
```

### 3. Document Complex Contracts

```yaml
contracts:
  - temporal: "G(step.ship -> paid)"
    level: hard
    # Add comment explaining why
    # "Shipping requires payment to prevent fraud"
```

### 4. Test Contracts with Scenarios

```yaml
- kind: Scenario
  id: sc.order.negative_total
  meta:
    title: "Reject Negative Total"
  spec:
    given:
      - seed: { entity: entity.order, data: { totalCents: -100 } }
    when:
      - command: { id: cmd.order.submit, input: { orderId: "$ref(order).id" } }
    then:
      - expectError: { code: "CONTRACT_VIOLATION" }
```

### 5. Layer Contracts Appropriately

```yaml
# Entity-level: data constraints
- kind: Entity
  contracts:
    - invariant: "totalCents >= 0"

# Process-level: ordering constraints
- kind: Process
  contracts:
    - temporal: "G(ship -> paid)"

# Interface-level: API constraints
- kind: Interface
  contracts:
    - type: api-compatibility
      rule: "no breaking changes in minor"

# Module-level: cross-cutting constraints
- kind: Module
  contracts:
    - type: policy
      rule: "all entities must have audit fields"
```
