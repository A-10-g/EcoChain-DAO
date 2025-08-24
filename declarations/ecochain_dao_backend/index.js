import { Actor, HttpAgent } from "@dfinity/agent";

// Imports and re-exports candid interface
export { idlFactory } from "./ecochain_dao_backend.did.js";
export { canisterId } from "./canister_ids.js";

// Create actor helper
export const createActor = (canisterId, options) => {
  const agent = new HttpAgent({ ...options?.agentOptions });

  if (process.env.DFX_NETWORK === "local") {
    agent.fetchRootKey().catch(err => {
      console.warn("Unable to fetch root key. Check to ensure that your local replica is running");
      console.error(err);
    });
  }

  return Actor.createActor(idlFactory, {
    agent,
    canisterId,
    ...options?.actorOptions,
  });
};

export const ecochain_dao_backend = createActor(canisterId);
