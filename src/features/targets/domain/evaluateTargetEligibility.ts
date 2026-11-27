import type {
  AuthorizedTargetDescriptor,
  AuthorizedTargetRef,
  TargetEligibilityDecision,
  TargetEligibilityRequirement,
} from '../../../types/target.js';

/*** Evaluate a discovered target against its exact tenant, actor, provider, account, and operation binding. */
export const evaluateTargetEligibility = (
  target: AuthorizedTargetDescriptor | null,
  requirement: TargetEligibilityRequirement,
): TargetEligibilityDecision => {
  if (target === null) {
    return { granted: false, reason: 'not-found' };
  }

  if (!hasCompleteTargetRef(requirement.target) || requirement.operation.trim().length === 0) {
    return { granted: false, reason: 'invalid-reference' };
  }

  const bindingFailure = getBindingFailure(target, requirement.target);

  if (bindingFailure !== null) {
    return { granted: false, reason: bindingFailure };
  }

  if (target.connectionStatus !== 'connected') {
    return { granted: false, reason: 'inactive' };
  }

  const missingRoles = requirement.roles.filter((role) => !target.roles.includes(role));

  if (missingRoles.length > 0) {
    return { granted: false, reason: 'role-missing', missingRoles };
  }

  const missingScopes = requirement.scopes.filter((scope) => !target.scopes.includes(scope));

  if (missingScopes.length > 0) {
    return { granted: false, reason: 'scope-missing', missingScopes };
  }

  if (!isOperationConfirmed(target, requirement.operation)) {
    return { granted: false, reason: 'operation-unconfirmed' };
  }

  return { granted: true, target: toAuthorizedTargetRef(target) };
};

/*** Reject blank identity segments so equal empty values can never produce a grant. */
const hasCompleteTargetRef = (target: AuthorizedTargetRef): boolean =>
  [
    target.tenantId,
    target.actorId,
    target.provider,
    target.connectionId,
    target.accountId,
    target.targetId,
  ].every((value) => value.trim().length > 0);

/*** Return the first binding dimension that differs from the caller's requested target. */
const getBindingFailure = (
  target: AuthorizedTargetDescriptor,
  required: AuthorizedTargetRef,
): Exclude<TargetEligibilityDecision, { readonly granted: true }>['reason'] | null => {
  if (target.tenantId !== required.tenantId) return 'tenant-mismatch';
  if (target.actorId !== required.actorId) return 'actor-mismatch';
  if (target.provider !== required.provider) return 'provider-mismatch';
  if (target.connectionId !== required.connectionId) return 'connection-mismatch';
  if (target.accountId !== required.accountId) return 'account-mismatch';
  if (target.targetId !== required.targetId) return 'target-mismatch';
  return null;
};

/*** Require an explicit provider confirmation for the exact requested operation. */
const isOperationConfirmed = (target: AuthorizedTargetDescriptor, operation: string): boolean =>
  target.capabilities.some(
    (capability) => capability.operation === operation && capability.status === 'confirmed',
  );

/*** Omit mutable eligibility evidence when returning a stable selected target reference. */
const toAuthorizedTargetRef = (target: AuthorizedTargetDescriptor): AuthorizedTargetRef => ({
  tenantId: target.tenantId,
  actorId: target.actorId,
  provider: target.provider,
  connectionId: target.connectionId,
  accountId: target.accountId,
  targetId: target.targetId,
});
