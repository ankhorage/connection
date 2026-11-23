import { describe, expect, it } from 'bun:test';

import {
  type AuthorizedTargetDescriptor,
  type ConnectionTargetDiscoveryPort,
  discoverAuthorizedTargetsAsync,
  evaluateTargetEligibility,
  resolveAuthorizedTargetAsync,
} from '../../index.js';

const target: AuthorizedTargetDescriptor = {
  tenantId: 'tenant-1',
  actorId: 'actor-1',
  provider: 'facebook',
  connectionId: 'connection-1',
  accountId: 'meta-account-1',
  targetId: 'page-1',
  connectionStatus: 'connected',
  roles: ['publisher'],
  scopes: ['pages_manage_posts'],
  capabilities: [{ operation: 'publish', status: 'confirmed' }],
};

const requirement = {
  target: {
    tenantId: target.tenantId,
    actorId: target.actorId,
    provider: target.provider,
    connectionId: target.connectionId,
    accountId: target.accountId,
    targetId: target.targetId,
  },
  operation: 'publish',
  roles: ['publisher'],
  scopes: ['pages_manage_posts'],
} as const;

it('grants the exact active, provider-confirmed target binding', () => {
  expect(evaluateTargetEligibility(target, requirement)).toEqual({
    granted: true,
    target: requirement.target,
  });
});

it.each([
  ['tenantId', 'tenant-2', 'tenant-mismatch'],
  ['actorId', 'actor-2', 'actor-mismatch'],
  ['provider', 'linkedin', 'provider-mismatch'],
  ['connectionId', 'connection-2', 'connection-mismatch'],
  ['accountId', 'meta-account-2', 'account-mismatch'],
  ['targetId', 'page-2', 'target-mismatch'],
] as const)('fails closed for a foreign %s', (field, value, reason) => {
  expect(evaluateTargetEligibility({ ...target, [field]: value }, requirement)).toEqual({
    granted: false,
    reason,
  });
});

it('rejects stale connections and changed roles or scopes', () => {
  expect(
    evaluateTargetEligibility({ ...target, connectionStatus: 'revoked' }, requirement),
  ).toEqual({
    granted: false,
    reason: 'inactive',
  });
  expect(evaluateTargetEligibility({ ...target, roles: [] }, requirement)).toEqual({
    granted: false,
    reason: 'role-missing',
    missingRoles: ['publisher'],
  });
  expect(evaluateTargetEligibility({ ...target, scopes: [] }, requirement)).toEqual({
    granted: false,
    reason: 'scope-missing',
    missingScopes: ['pages_manage_posts'],
  });
});

it('does not claim an operation is available before the provider confirms it', () => {
  expect(
    evaluateTargetEligibility(
      { ...target, capabilities: [{ operation: 'publish', status: 'unverified' }] },
      requirement,
    ),
  ).toEqual({ granted: false, reason: 'operation-unconfirmed' });
});

it('rejects incomplete selected references', () => {
  expect(
    evaluateTargetEligibility(target, {
      ...requirement,
      target: { ...requirement.target, targetId: '' },
    }),
  ).toEqual({ granted: false, reason: 'invalid-reference' });
});

describe('target discovery', () => {
  it('keeps two provider targets under one account separately selectable', async () => {
    const port: ConnectionTargetDiscoveryPort = {
      discoverAuthorizedTargetsAsync: () =>
        Promise.resolve([target, { ...target, targetId: 'page-2' }]),
      resolveAuthorizedTargetAsync: () => Promise.resolve(target),
    };

    expect(
      await discoverAuthorizedTargetsAsync(port, {
        connection: {
          tenantId: target.tenantId,
          actorId: target.actorId,
          provider: target.provider,
          connectionId: target.connectionId,
          accountId: target.accountId,
        },
        operation: 'publish',
        roles: ['publisher'],
        scopes: ['pages_manage_posts'],
      }),
    ).toEqual([
      { granted: true, target: requirement.target },
      { granted: true, target: { ...requirement.target, targetId: 'page-2' } },
    ]);
  });

  it('refuses an inconsistent provider result during discovery', async () => {
    const port: ConnectionTargetDiscoveryPort = {
      discoverAuthorizedTargetsAsync: () => Promise.resolve([{ ...target, provider: 'instagram' }]),
      resolveAuthorizedTargetAsync: () => Promise.resolve(target),
    };

    expect(
      await discoverAuthorizedTargetsAsync(port, {
        connection: {
          tenantId: target.tenantId,
          actorId: target.actorId,
          provider: target.provider,
          connectionId: target.connectionId,
          accountId: target.accountId,
        },
        operation: 'publish',
        roles: ['publisher'],
        scopes: ['pages_manage_posts'],
      }),
    ).toEqual([{ granted: false, reason: 'provider-mismatch' }]);
  });
});

describe('target resolution', () => {
  it('rechecks the host result immediately before an external operation', async () => {
    const port: ConnectionTargetDiscoveryPort = {
      discoverAuthorizedTargetsAsync: () => Promise.resolve([]),
      resolveAuthorizedTargetAsync: () =>
        Promise.resolve({ ...target, connectionStatus: 'revoked' }),
    };

    expect(await resolveAuthorizedTargetAsync(port, requirement)).toEqual({
      granted: false,
      reason: 'inactive',
    });
  });
});
