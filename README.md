# AI Business Employee v0.3

## What was built

A generic, configuration-driven AI business employee foundation for four real businesses:

1. MMVK Chaat & Fast Food
2. MMVK Homestay
3. Murugesan & Co Auditing
4. Ertiga self-drive / Zoomcar Host

## Actual systems mapped

### MMVK Food
- Loyverse POS — offline orders/sales
- Swiggy — online orders/sales
- Zomato — online orders/sales
- Google Sheets — daily expenses
- Instagram — `mmvkfoodspollachi`
- Google Business Profile

Daily expense categories currently captured:
- Chicken
- Vegetables
- Groceries
- Parcel covers
- Gas cylinder
- Helper salary
- Chef salary
- Vessel washer salary

### MMVK Homestay
- Airbnb
- Booking.com
- Agoda
- MakeMyTrip
- Google Business Profile
- OTA expansion is intentionally treated as a channel evaluation problem, not blindly adding channels.

### Murugesan & Co
- Asana
- Workflow: Todo → In Progress → Fees Pending → Fees Paid → Done
- Client updates
- Fee paid amount / balance

### Ertiga
- Zoomcar Host
- Vehicle: TN41AY7489
- Current host rating captured from supplied screenshot: 4.97
- August 2026 incentive displayed as At Risk
- Professional Host evaluation shown as 1 Sep 2026

## Architecture

External systems are isolated behind adapters.

```text
External Platform
      ↓
   Adapter
      ↓
Canonical Entity
      ↓
Workflow Engine
      ↓
Rule Engine
      ↓
AI Agent
      ↓
Allowed Action
      ↓
Approval (if sensitive)
      ↓
Adapter write
      ↓
Audit Log
```

The UI does not know how Asana, Zoomcar, Loyverse, an OTA or Google Sheets works.

### Canonical entities

Customer
Sale
Expense
Reservation
WorkItem
VehicleTrip
Review
Payment
Message

### Module configuration

Each business owns:
- fields
- workflow stages
- rules
- metrics
- integrations

Shared code owns:
- data contracts
- workflow renderer
- task model
- action types
- AI orchestration
- approval model
- adapter registry
- audit log

## Maintainability rule

If a shared capability changes, change it once in `src/core`.

If one business changes, change only that module.

If a new business is added:
1. Create a module definition.
2. Add adapters for its external systems.
3. Reuse the existing engine/UI.

Do not copy an existing business implementation.

## Important current status

This is a real architecture/prototype, not a live-connected production system.

All external integrations are marked `planned` because credentials, account permissions, official APIs/partner access and platform-specific capabilities must be verified before live writes.

The next production step is to implement the database + authentication + adapter interfaces + event queue, then connect one read-only integration at a time.

Do not scrape or automate platform UIs in a way that violates their terms. For Zoomcar and OTAs especially, use supported/authorized access mechanisms.
