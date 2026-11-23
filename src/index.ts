/*** Provider-independent access evaluation for linked accounts; no OAuth or token storage. */
export { resolveConnectionAccessAsync } from './features/access/application/resolveConnectionAccessAsync.js';
export { evaluateConnectionAccess } from './features/access/domain/evaluateConnectionAccess.js';
export type {
  ConnectionAccessDecision,
  ConnectionDescriptor,
  ConnectionRepositoryPort,
  ConnectionRequirement,
} from './types/connection.js';
