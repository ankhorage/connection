/*** Provider-independent access evaluation for linked accounts; no OAuth or token storage. */
export { resolveConnectionAccessAsync } from './features/access/application/resolveConnectionAccessAsync.js';
export { evaluateConnectionAccess } from './features/access/domain/evaluateConnectionAccess.js';
export { discoverAuthorizedTargetsAsync } from './features/targets/application/discoverAuthorizedTargetsAsync.js';
export { resolveAuthorizedTargetAsync } from './features/targets/application/resolveAuthorizedTargetAsync.js';
export { evaluateTargetEligibility } from './features/targets/domain/evaluateTargetEligibility.js';
export type {
  ConnectionAccessDecision,
  ConnectionDescriptor,
  ConnectionRepositoryPort,
  ConnectionRequirement,
} from './types/connection.js';
export type {
  AuthorizedConnectionRef,
  AuthorizedTargetDescriptor,
  AuthorizedTargetRef,
  ConnectionTargetDiscoveryPort,
  TargetCapabilityHint,
  TargetDiscoveryRequirement,
  TargetEligibilityDecision,
  TargetEligibilityRequirement,
} from './types/target.js';
