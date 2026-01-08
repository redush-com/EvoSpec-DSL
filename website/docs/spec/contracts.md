---
sidebar_position: 5
title: Contracts
---

# 5. Contracts

Contracts are formal constraints that define correctness guarantees for the system.

## 5.1 Contract Types

| Type | Purpose |
|------|---------|
| `invariant` | Data constraints that must always be true |
| `temporal` | Process ordering guarantees (LTL) |
| `api-compatibility` | Rules for interface evolution |
| `policy` | Business rules and security policies |

## 5.2 Data Invariants

```yaml
contracts:
  - invariant: "totalCents >= 0"
    level: hard

  - invariant: "email != ''"
    level: hard

  - invariant: "status == 'shipped' implies trackingNumber != null"
    level: hard
```

## 5.3 Temporal Constraints

Using Linear Temporal Logic (LTL):

| Operator | Meaning | Example |
|----------|---------|---------|
| `G(φ)` | Globally (always) | `G(paid -> shipped)` |
| `F(φ)` | Finally (eventually) | `F(completed)` |
| `->` | Implies | `shipped -> paid` |

```yaml
- kind: Process
  id: proc.order.fulfillment
  contracts:
    - temporal: "G(step.ship -> paid)"
      level: hard
    - temporal: "G(step.pay -> validated)"
      level: hard
```

## 5.4 API Compatibility

```yaml
- kind: Interface
  id: iface.http
  contracts:
    - type: api-compatibility
      rule: "minor cannot remove response fields"
      level: hard
```

## 5.5 Contract Levels

| Level | Behavior |
|-------|----------|
| `hard` | Violation blocks generation and deployment |
| `soft` | Violation generates warning but allows continuation |

For complete details, see the [full specification](/docs/v1/spec/05-contracts.md).
