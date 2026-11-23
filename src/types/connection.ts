/*** A credential-free view of an account linked through an external authorization owner. */
export interface ConnectionDescriptor {
  readonly id: string;
  readonly provider: string;
  readonly accountId: string;
  readonly status: 'connected' | 'disconnected' | 'expired' | 'revoked';
  readonly scopes: readonly string[];
  /** An opaque lookup reference, never an access or refresh token. */
  readonly authorizationRef: string;
}

/*** Requirements for using an existing external connection. */
export interface ConnectionRequirement {
  readonly provider: string;
  readonly scopes: readonly string[];
}

/*** A fail-closed eligibility result; it does not itself authorize a provider API call. */
export type ConnectionAccessDecision =
  | { readonly granted: true; readonly connection: ConnectionDescriptor }
  | {
      readonly granted: false;
      readonly reason:
        | 'not-found'
        | 'provider-mismatch'
        | 'inactive'
        | 'authorization-unavailable'
        | 'scope-missing';
      readonly missingScopes?: readonly string[];
    };

/*** Host-owned, read-only persistence boundary; credentials stay outside this package. */
export interface ConnectionRepositoryPort {
  readonly loadAsync: (connectionId: string) => Promise<ConnectionDescriptor | null>;
}
