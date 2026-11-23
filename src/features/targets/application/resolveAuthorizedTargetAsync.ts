import type {
  ConnectionTargetDiscoveryPort,
  TargetEligibilityDecision,
  TargetEligibilityRequirement,
} from '../../../types/target.js';
import { evaluateTargetEligibility } from '../domain/evaluateTargetEligibility.js';

/*** Re-resolve a selected target through the trusted host before an external effect is attempted. */
export const resolveAuthorizedTargetAsync = async (
  port: ConnectionTargetDiscoveryPort,
  requirement: TargetEligibilityRequirement,
): Promise<TargetEligibilityDecision> =>
  evaluateTargetEligibility(
    await port.resolveAuthorizedTargetAsync(requirement.target),
    requirement,
  );
