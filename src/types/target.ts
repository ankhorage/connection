import type { ConnectionDescriptor } from './connection.js';

/*** An opaque, credential-free connection binding owned by one tenant and actor. */
export interface AuthorizedConnectionRef {
  readonly tenantId: string;
  readonly actorId: string;
  readonly provider: string;
  readonly connectionId: string;
  readonly accountId: string;
}

/*** A stable provider target selected beneath one authorized account connection. */
export interface AuthorizedTargetRef extends AuthorizedConnectionRef {
  readonly targetId: string;
}

/*** A provider-confirmed or unresolved capability indication for one target operation. */
export interface TargetCapabilityHint {
  readonly operation: string;
  readonly status: 'confirmed' | 'ineligible' | 'unverified';
}

/*** Credential-free target metadata returned by a trusted host after provider discovery. */
export interface AuthorizedTargetDescriptor extends AuthorizedTargetRef {
  readonly connectionStatus: ConnectionDescriptor['status'];
  readonly roles: readonly string[];
  readonly scopes: readonly string[];
  readonly capabilities: readonly TargetCapabilityHint[];
}

/*** Required connection binding, operation, roles, and scopes for target eligibility. */
export interface TargetEligibilityRequirement {
  readonly target: AuthorizedTargetRef;
  readonly operation: string;
  readonly roles: readonly string[];
  readonly scopes: readonly string[];
}

/*** Requirements used to discover target eligibility without selecting a target in advance. */
export interface TargetDiscoveryRequirement {
  readonly connection: AuthorizedConnectionRef;
  readonly operation: string;
  readonly roles: readonly string[];
  readonly scopes: readonly string[];
}

/*** A fail-closed target decision; a grant still requires host-side revalidation before effects. */
export type TargetEligibilityDecision =
  | { readonly granted: true; readonly target: AuthorizedTargetRef }
  | {
      readonly granted: false;
      readonly reason:
        | 'not-found'
        | 'invalid-reference'
        | 'tenant-mismatch'
        | 'actor-mismatch'
        | 'provider-mismatch'
        | 'connection-mismatch'
        | 'account-mismatch'
        | 'target-mismatch'
        | 'inactive'
        | 'role-missing'
        | 'scope-missing'
        | 'operation-unconfirmed';
      readonly missingRoles?: readonly string[];
      readonly missingScopes?: readonly string[];
    };

/*** Host-owned provider discovery and current-target resolution boundary; credentials stay external. */
export interface ConnectionTargetDiscoveryPort {
  readonly discoverAuthorizedTargetsAsync: (
    connection: AuthorizedConnectionRef,
  ) => Promise<readonly AuthorizedTargetDescriptor[]>;
  readonly resolveAuthorizedTargetAsync: (
    target: AuthorizedTargetRef,
  ) => Promise<AuthorizedTargetDescriptor | null>;
}
