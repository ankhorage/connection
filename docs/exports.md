# Public API

## ConnectionAccessDecision

Kind: `unknown`
Module: `src/types/connection.ts`
Source: `src/types/connection.ts:19:1`

A fail-closed eligibility result; it does not itself authorize a provider API call.

## ConnectionDescriptor

Kind: `type`
Module: `src/types/connection.ts`
Source: `src/types/connection.ts:2:1`

A credential-free view of an account linked through an external authorization owner.

### Members

| Name             | Kind     | Type                                                      | Required | Description |
| ---------------- | -------- | --------------------------------------------------------- | -------- | ----------- |
| accountId        | property | `string`                                                  | yes      |             |
| authorizationRef | property | `string`                                                  | yes      |             |
| id               | property | `string`                                                  | yes      |             |
| provider         | property | `string`                                                  | yes      |             |
| scopes           | property | `readonly string[]`                                       | yes      |             |
| status           | property | `"connected" \| "disconnected" \| "expired" \| "revoked"` | yes      |             |

## ConnectionRepositoryPort

Kind: `type`
Module: `src/types/connection.ts`
Source: `src/types/connection.ts:33:1`

Host-owned, read-only persistence boundary; credentials stay outside this package.

### Members

| Name      | Kind     | Type                                                              | Required | Description |
| --------- | -------- | ----------------------------------------------------------------- | -------- | ----------- |
| loadAsync | property | `(connectionId: string) => Promise<ConnectionDescriptor \| null>` | yes      |             |

## ConnectionRequirement

Kind: `type`
Module: `src/types/connection.ts`
Source: `src/types/connection.ts:13:1`

Requirements for using an existing external connection.

### Members

| Name     | Kind     | Type                | Required | Description |
| -------- | -------- | ------------------- | -------- | ----------- |
| provider | property | `string`            | yes      |             |
| scopes   | property | `readonly string[]` | yes      |             |

## evaluateConnectionAccess

Kind: `value`
Module: `src/features/access/domain/evaluateConnectionAccess.ts`
Source: `src/features/access/domain/evaluateConnectionAccess.ts:8:14`

Evaluate an existing connection without fetching or exposing credentials.

### Signatures

- `(connection: ConnectionDescriptor | null, requirement: ConnectionRequirement) => ConnectionAccessDecision`
  - connection: `ConnectionDescriptor | null`
  - requirement: `ConnectionRequirement`
  - returns: `ConnectionAccessDecision`

## resolveConnectionAccessAsync

Kind: `value`
Module: `src/features/access/application/resolveConnectionAccessAsync.ts`
Source: `src/features/access/application/resolveConnectionAccessAsync.ts:9:14`

Resolve connection metadata through a host port and evaluate requested access.

### Signatures

- `(repository: ConnectionRepositoryPort, connectionId: string, requirement: ConnectionRequirement) => Promise<ConnectionAccessDecision>`
  - connectionId: `string`
  - repository: `ConnectionRepositoryPort`
  - requirement: `ConnectionRequirement`
  - returns: `Promise<ConnectionAccessDecision>`
