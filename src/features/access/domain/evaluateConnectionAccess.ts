import type {
  ConnectionAccessDecision,
  ConnectionDescriptor,
  ConnectionRequirement,
} from '../../../types/connection.js';

/*** Evaluate an existing connection without fetching or exposing credentials. */
export const evaluateConnectionAccess = (
  connection: ConnectionDescriptor | null,
  requirement: ConnectionRequirement,
): ConnectionAccessDecision => {
  if (connection === null) {
    return { granted: false, reason: 'not-found' };
  }

  if (connection.provider !== requirement.provider) {
    return { granted: false, reason: 'provider-mismatch' };
  }

  if (connection.status !== 'connected') {
    return { granted: false, reason: 'inactive' };
  }

  if (connection.authorizationRef.trim().length === 0) {
    return { granted: false, reason: 'authorization-unavailable' };
  }

  const missingScopes = requirement.scopes.filter((scope) => !connection.scopes.includes(scope));

  if (missingScopes.length > 0) {
    return { granted: false, reason: 'scope-missing', missingScopes };
  }

  return { granted: true, connection };
};
