import { evaluateConnectionAccess } from '../domain/evaluateConnectionAccess.js';
import type {
  ConnectionAccessDecision,
  ConnectionRepositoryPort,
  ConnectionRequirement,
} from '../../../types/connection.js';

/*** Resolve connection metadata through a host port and evaluate requested access. */
export const resolveConnectionAccessAsync = async (
  repository: ConnectionRepositoryPort,
  connectionId: string,
  requirement: ConnectionRequirement,
): Promise<ConnectionAccessDecision> =>
  evaluateConnectionAccess(await repository.loadAsync(connectionId), requirement);
