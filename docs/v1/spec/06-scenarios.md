# 6. Scenarios

Scenarios are executable test specifications that serve as both documentation and verification.

## 6.1 Purpose

Scenarios provide:

1. **Executable Tests** — Generate test code from specifications
2. **Living Documentation** — Examples that stay in sync with code
3. **Contract Verification** — Prove temporal constraints hold
4. **Behavior Specification** — Define expected system behavior

## 6.2 Scenario Structure

```yaml
- kind: Scenario
  id: sc.order.happy_path
  meta:
    title: "Order Happy Path"
    description: "Complete order flow from creation to completion"
    tags: ["order", "happy-path"]
  spec:
    given:                     # Preconditions
      - seed: { ... }
    when:                      # Actions
      - command: { ... }
    then:                      # Expected outcomes
      - expectEvent: { ... }
      - expectEntity: { ... }
```

## 6.3 Given: Preconditions

The `given` section sets up initial state.

### Seed Data

```yaml
given:
  # Create a customer
  - seed:
      entity: entity.customer
      data:
        name: "John Doe"
        email: "john@example.com"

  # Create an order referencing the customer
  - seed:
      entity: entity.order
      data:
        customerId: "$ref(customer).id"
        status: "draft"
        totalCents: 5000
```

### Reference Syntax

Use `$ref(alias)` to reference previously seeded entities:

```yaml
given:
  # First seed gets implicit alias from entity name
  - seed:
      entity: entity.customer    # alias: "customer"
      data: { name: "Buyer" }

  # Reference it in subsequent seeds
  - seed:
      entity: entity.order
      data:
        customerId: "$ref(customer).id"  # References customer.id
```

### Explicit Aliases

```yaml
given:
  - seed:
      entity: entity.customer
      alias: "buyer"             # Explicit alias
      data: { name: "Buyer" }

  - seed:
      entity: entity.customer
      alias: "seller"            # Different alias
      data: { name: "Seller" }

  - seed:
      entity: entity.order
      data:
        buyerId: "$ref(buyer).id"
        sellerId: "$ref(seller).id"
```

### State Setup

```yaml
given:
  # Set system state
  - state:
      process: proc.order.fulfillment
      vars:
        orderId: "$ref(order).id"
        validated: true
        paid: false
```

## 6.4 When: Actions

The `when` section defines actions to execute.

### Execute Command

```yaml
when:
  - command:
      id: cmd.order.submit
      input:
        orderId: "$ref(order).id"
```

### Execute Multiple Commands

```yaml
when:
  - command:
      id: cmd.order.create
      input:
        customerId: "$ref(customer).id"

  - command:
      id: cmd.order.add_item
      input:
        orderId: "$ref(order).id"
        productId: "prod-123"
        quantity: 2

  - command:
      id: cmd.order.submit
      input:
        orderId: "$ref(order).id"
```

### Trigger Event

```yaml
when:
  - event:
      id: evt.payment.received
      payload:
        orderId: "$ref(order).id"
        amount: 5000
```

### Wait for Condition

```yaml
when:
  - command: { id: cmd.order.submit, input: { orderId: "$ref(order).id" } }

  - wait:
      condition: "order.status == 'paid'"
      timeout: 5000  # ms
```

## 6.5 Then: Expectations

The `then` section defines expected outcomes.

### Expect Event

```yaml
then:
  - expectEvent:
      id: evt.order.submitted
      match:
        orderId: "$ref(order).id"
        totalCents: 5000
```

### Expect Entity State

```yaml
then:
  - expectEntity:
      id: entity.order
      where:
        id: "$ref(order).id"
      match:
        status: "submitted"
        totalCents: 5000
```

### Expect Multiple Events

```yaml
then:
  - expectEvent:
      id: evt.order.submitted
      match: { orderId: "$ref(order).id" }

  - expectEvent:
      id: evt.notification.sent
      match: { type: "order_confirmation" }
```

### Expect No Event

```yaml
then:
  - expectNoEvent:
      id: evt.order.shipped
      within: 1000  # ms
```

### Expect Error

```yaml
then:
  - expectError:
      code: "VALIDATION_ERROR"
      message: "Order total cannot be negative"
```

### Expect Contract Violation

```yaml
then:
  - expectError:
      code: "CONTRACT_VIOLATION"
      contract: "totalCents >= 0"
```

## 6.6 Scenario Types

### Happy Path

```yaml
- kind: Scenario
  id: sc.order.happy_path
  meta:
    title: "Order Happy Path"
    tags: ["happy-path"]
  spec:
    given:
      - seed: { entity: entity.customer, data: { name: "Buyer" } }
      - seed: { entity: entity.order, data: { customerId: "$ref(customer).id", totalCents: 5000 } }
    when:
      - command: { id: cmd.order.submit, input: { orderId: "$ref(order).id" } }
    then:
      - expectEvent: { id: evt.order.submitted }
      - expectEntity: { id: entity.order, where: { id: "$ref(order).id" }, match: { status: "submitted" } }
```

### Error Case

```yaml
- kind: Scenario
  id: sc.order.empty_order
  meta:
    title: "Reject Empty Order"
    tags: ["error", "validation"]
  spec:
    given:
      - seed: { entity: entity.customer, data: { name: "Buyer" } }
      - seed: { entity: entity.order, data: { customerId: "$ref(customer).id", totalCents: 0 } }
    when:
      - command: { id: cmd.order.submit, input: { orderId: "$ref(order).id" } }
    then:
      - expectError: { code: "VALIDATION_ERROR" }
      - expectNoEvent: { id: evt.order.submitted }
```

### Contract Verification

```yaml
- kind: Scenario
  id: sc.order.ship_without_payment
  meta:
    title: "Cannot Ship Without Payment"
    description: "Verifies temporal contract: G(ship -> paid)"
    tags: ["contract", "temporal"]
  spec:
    given:
      - seed: { entity: entity.order, data: { status: "submitted" } }
      - state: { process: proc.order.fulfillment, vars: { paid: false } }
    when:
      - command: { id: cmd.order.ship, input: { orderId: "$ref(order).id" } }
    then:
      - expectError: { code: "CONTRACT_VIOLATION", contract: "G(ship -> paid)" }
```

### Process Flow

```yaml
- kind: Scenario
  id: sc.order.full_flow
  meta:
    title: "Complete Order Flow"
    tags: ["e2e", "process"]
  spec:
    given:
      - seed: { entity: entity.customer, data: { name: "Buyer" } }
      - seed: { entity: entity.order, data: { customerId: "$ref(customer).id", totalCents: 5000 } }
    when:
      - command: { id: cmd.order.submit, input: { orderId: "$ref(order).id" } }
      - command: { id: cmd.payment.process, input: { orderId: "$ref(order).id" } }
      - command: { id: cmd.order.ship, input: { orderId: "$ref(order).id" } }
    then:
      - expectEvent: { id: evt.order.submitted }
      - expectEvent: { id: evt.payment.processed }
      - expectEvent: { id: evt.order.shipped }
      - expectEntity: { id: entity.order, where: { id: "$ref(order).id" }, match: { status: "shipped" } }
```

## 6.7 Test Registration

Register scenarios for test generation:

```yaml
tests:
  scenarios:
    - NodeRef(sc.order.happy_path)
    - NodeRef(sc.order.empty_order)
    - NodeRef(sc.order.ship_without_payment)
    - NodeRef(sc.order.full_flow)
```

## 6.8 Generated Tests

Scenarios generate executable tests:

### TypeScript/Jest

```typescript
// Generated from sc.order.happy_path

describe('Order Happy Path', () => {
  it('should submit order successfully', async () => {
    // Given
    const customer = await seed('entity.customer', { name: 'Buyer' });
    const order = await seed('entity.order', {
      customerId: customer.id,
      totalCents: 5000,
    });

    // When
    await executeCommand('cmd.order.submit', { orderId: order.id });

    // Then
    await expectEvent('evt.order.submitted', { orderId: order.id });
    await expectEntity('entity.order', { id: order.id }, { status: 'submitted' });
  });
});
```

## 6.9 Scenario Coverage

### Coverage Requirements

```yaml
# In validation phase 6
verification:
  scenario_coverage:
    commands: 100%      # Every command has ≥1 scenario
    events: 80%         # Most events are tested
    entities: 100%      # Every entity state is tested
    contracts: 100%     # Every contract is verified
```

### Coverage Report

```
Scenario Coverage Report
========================

Commands:
  ✓ cmd.order.create    (2 scenarios)
  ✓ cmd.order.submit    (3 scenarios)
  ✗ cmd.order.cancel    (0 scenarios)  ← MISSING

Events:
  ✓ evt.order.created   (2 scenarios)
  ✓ evt.order.submitted (3 scenarios)

Contracts:
  ✓ totalCents >= 0     (1 scenario)
  ✓ G(ship -> paid)     (1 scenario)

Coverage: 87% (target: 100%)
```

## 6.10 Best Practices

### 1. One Scenario Per Behavior

```yaml
# Good - focused scenarios
- id: sc.order.submit_success
- id: sc.order.submit_empty_fails
- id: sc.order.submit_negative_fails

# Bad - too many things in one scenario
- id: sc.order.all_cases
```

### 2. Use Descriptive Names

```yaml
# Good
id: sc.order.cannot_ship_without_payment
id: sc.customer.email_required

# Bad
id: sc.test1
id: sc.order_test
```

### 3. Test Edge Cases

```yaml
scenarios:
  - id: sc.order.zero_total
  - id: sc.order.max_total
  - id: sc.order.single_item
  - id: sc.order.max_items
```

### 4. Verify All Contracts

```yaml
# For each contract, have a scenario that:
# 1. Shows the contract holds in normal case
# 2. Shows violation is caught

contracts:
  - invariant: "totalCents >= 0"

scenarios:
  - id: sc.order.positive_total_ok      # Normal case
  - id: sc.order.negative_total_fails   # Violation caught
```

### 5. Document with Tags

```yaml
- kind: Scenario
  id: sc.order.happy_path
  meta:
    tags:
      - "happy-path"
      - "smoke-test"
      - "order"
      - "p0"  # Priority
```
