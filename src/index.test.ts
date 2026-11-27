import { describe, expect, it } from 'bun:test';

import {
  type ConnectionDescriptor,
  type ConnectionRepositoryPort,
  evaluateConnectionAccess,
  resolveConnectionAccessAsync,
} from './index.js';

const connected: ConnectionDescriptor = {
  id: 'connection-1',
  provider: 'linkedin',
  accountId: 'account-1',
  status: 'connected',
  scopes: ['post:write', 'comment:write'],
  authorizationRef: 'vault:connection-1',
};

describe('connection access eligibility', () => {
  it('grants matching active connections and required scopes', () => {
    expect(
      evaluateConnectionAccess(connected, { provider: 'linkedin', scopes: ['post:write'] }),
    ).toEqual({
      granted: true,
      connection: connected,
    });
  });
});

describe('connection access denials', () => {
  it('fails closed when the connection is absent', () => {
    expect(evaluateConnectionAccess(null, { provider: 'linkedin', scopes: [] })).toEqual({
      granted: false,
      reason: 'not-found',
    });
  });

  it('rejects a connection belonging to another provider', () => {
    expect(evaluateConnectionAccess(connected, { provider: 'instagram', scopes: [] })).toEqual({
      granted: false,
      reason: 'provider-mismatch',
    });
  });

  it.each(['disconnected', 'expired', 'revoked'] as const)('rejects %s connections', (status) => {
    expect(
      evaluateConnectionAccess({ ...connected, status }, { provider: 'linkedin', scopes: [] }),
    ).toEqual({
      granted: false,
      reason: 'inactive',
    });
  });

  it('rejects missing authorization references', () => {
    expect(
      evaluateConnectionAccess(
        { ...connected, authorizationRef: '  ' },
        { provider: 'linkedin', scopes: [] },
      ),
    ).toEqual({ granted: false, reason: 'authorization-unavailable' });
  });

  it('reports all missing scopes', () => {
    expect(
      evaluateConnectionAccess(connected, {
        provider: 'linkedin',
        scopes: ['post:write', 'message:write', 'profile:read'],
      }),
    ).toEqual({
      granted: false,
      reason: 'scope-missing',
      missingScopes: ['message:write', 'profile:read'],
    });
  });
});

describe('connection access resolution', () => {
  it('resolves through the supplied repository rather than global state', async () => {
    const repository: ConnectionRepositoryPort = {
      loadAsync: (id) => Promise.resolve(id === connected.id ? connected : null),
    };
    expect(
      await resolveConnectionAccessAsync(repository, connected.id, {
        provider: 'linkedin',
        scopes: [],
      }),
    ).toEqual({ granted: true, connection: connected });
    expect(
      await resolveConnectionAccessAsync(repository, 'unknown', {
        provider: 'linkedin',
        scopes: [],
      }),
    ).toEqual({ granted: false, reason: 'not-found' });
  });
});
