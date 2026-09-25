export type IdentityBoundary = {
  authenticate: () => never;
  authorize: () => never;
};

export function createIdentityBoundary(): IdentityBoundary {
  const notImplemented = (): never => {
    throw new Error(
      "Identity and authentication are not implemented in Step 1.",
    );
  };

  return { authenticate: notImplemented, authorize: notImplemented };
}
