import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export type ActionType = { 'Registration' : null } |
  { 'DataSubmission' : null } |
  { 'Governance' : null } |
  { 'Validation' : null };
export interface DataSubmission {
  'id' : bigint,
  'submitter' : Principal,
  'data' : string,
  'validated' : boolean,
  'validator' : [] | [Principal],
  'submitted_at' : bigint,
}
export type EcoError = { 'AlreadyVoted' : null } |
  { 'ProposalNotFound' : null } |
  { 'ProposalNotActive' : null } |
  { 'InsufficientBalance' : null } |
  { 'Unauthorized' : null } |
  { 'AlreadyValidated' : null } |
  { 'DataNotFound' : null } |
  { 'UserNotFound' : null };
export interface Proposal {
  'id' : bigint,
  'creator' : Principal,
  'yes_votes' : bigint,
  'description' : string,
  'voters' : Array<Principal>,
  'created_at' : bigint,
  'is_active' : boolean,
  'no_votes' : bigint,
}
export type Result = { 'Ok' : User } |
  { 'Err' : EcoError };
export type Result_1 = { 'Ok' : bigint } |
  { 'Err' : EcoError };
export type Result_2 = { 'Ok' : DataSubmission } |
  { 'Err' : EcoError };
export type Result_3 = { 'Ok' : Proposal } |
  { 'Err' : EcoError };
export interface User { 'balance' : bigint, 'registered_at' : bigint }
export type VoteChoice = { 'No' : null } |
  { 'Yes' : null };
export interface _SERVICE {
  'create_proposal' : ActorMethod<[string], Result_3>,
  'get_active_proposals' : ActorMethod<[], Array<Proposal>>,
  'get_all_proposals' : ActorMethod<[], Array<Proposal>>,
  'get_proposal' : ActorMethod<[bigint], Result_3>,
  'get_system_stats' : ActorMethod<[], Array<[string, bigint]>>,
  'get_total_supply' : ActorMethod<[], bigint>,
  'get_unvalidated_data' : ActorMethod<[], Array<DataSubmission>>,
  'get_user_balance' : ActorMethod<[], Result_1>,
  'get_user_info' : ActorMethod<[], Result>,
  'register_user' : ActorMethod<[], Result>,
  'submit_data' : ActorMethod<[string], Result_2>,
  'validate_data' : ActorMethod<[bigint], Result_2>,
  'vote_on_proposal' : ActorMethod<[bigint, VoteChoice], Result_3>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
