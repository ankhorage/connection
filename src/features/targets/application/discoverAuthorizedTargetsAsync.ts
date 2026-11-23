import type {
  AuthorizedTargetRef,
  ConnectionTargetDiscoveryPort,
  TargetDiscoveryRequirement,
  TargetEligibilityDecision,
} from '../../../types/target.js';
import { evaluateTargetEligibility } from '../domain/evaluateTargetEligibility.js';

/*** Discover provider targets and return one fail-closed eligibility decision for each host result. */
export const discoverAuthorizedTargetsAsync = async (
  port: ConnectionTargetDiscoveryPort,
  requirement: TargetDiscoveryRequirement,
): Promise<readonly TargetEligibilityDecision[]> =>
  (await port.discoverAuthorizedTargetsAsync(requirement.connection)).map((target) =>
    evaluateTargetEligibility(target, {
      target: toAuthorizedTargetRef(requirement, target.targetId),
      operation: requirement.operation,
      roles: requirement.roles,
      scopes: requirement.scopes,
    }),
  );

/*** Bind each discovered identifier back to the exact connection scope requested by the caller. */
const toAuthorizedTargetRef = (
  requirement: TargetDiscoveryRequirement,
  targetId: string,
): AuthorizedTargetRef => ({ ...requirement.connection, targetId });
