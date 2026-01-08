---
sidebar_position: 6
title: Scenarios
---

# 6. Scenarios

Scenarios are executable test specifications that serve as both documentation and verification.

## 6.1 Scenario Structure

```yaml
- kind: Scenario
  id: sc.order.happy_path
  meta:
    title: "Order Happy Path"
  spec:
    given:                     # Preconditions
      - seed: { ... }
    when:                      # Actions
      - command: { ... }
    then:                      # Expected outcomes
      - expectEvent: { ... }
      - expectEntity: { ... }
```

## 6.2 Given: Preconditions

```yaml
given:
  - seed:
      entity: entity.customer
      data:
        name: "John Doe"
        email: "john@example.com"

  - seed:
      entity: entity.order
      data:
        customerId: "$ref(customer).id"
        status: "draft"
```

## 6.3 When: Actions

```yaml
when:
  - command:
      id: cmd.order.submit
      input:
        orderId: "$ref(order).id"
```

## 6.4 Then: Expectations

```yaml
then:
  - expectEvent:
      id: evt.order.submitted
      match:
        orderId: "$ref(order).id"

  - expectEntity:
      id: entity.order
      where:
        id: "$ref(order).id"
      match:
        status: "submitted"
```

## 6.5 Complete Example

```yaml
- kind: Scenario
  id: sc.order.happy_path
  meta:
    title: "Order Happy Path"
    description: "Complete order flow"
  spec:
    given:
      - seed:
          entity: entity.customer
          data: { name: "Buyer", email: "buyer@example.com" }
      - seed:
          entity: entity.order
          data:
            customerId: "$ref(customer).id"
            status: "draft"
            totalCents: 5000
    when:
      - command:
          id: cmd.order.submit
          input: { orderId: "$ref(order).id" }
    then:
      - expectEvent:
          id: evt.order.submitted
          match: { orderId: "$ref(order).id" }
      - expectEntity:
          id: entity.order
          where: { id: "$ref(order).id" }
          match: { status: "submitted" }
```

For complete details, see the [full specification](/docs/v1/spec/06-scenarios.md).
