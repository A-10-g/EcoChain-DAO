export const idlFactory = ({ IDL }) => {
  const Proposal = IDL.Record({
    'id' : IDL.Nat64,
    'creator' : IDL.Principal,
    'yes_votes' : IDL.Nat64,
    'description' : IDL.Text,
    'voters' : IDL.Vec(IDL.Principal),
    'created_at' : IDL.Nat64,
    'is_active' : IDL.Bool,
    'no_votes' : IDL.Nat64,
  });
  const EcoError = IDL.Variant({
    'AlreadyVoted' : IDL.Null,
    'ProposalNotFound' : IDL.Null,
    'ProposalNotActive' : IDL.Null,
    'InsufficientBalance' : IDL.Null,
    'Unauthorized' : IDL.Null,
    'AlreadyValidated' : IDL.Null,
    'DataNotFound' : IDL.Null,
    'UserNotFound' : IDL.Null,
  });
  const Result_3 = IDL.Variant({ 'Ok' : Proposal, 'Err' : EcoError });
  const DataSubmission = IDL.Record({
    'id' : IDL.Nat64,
    'submitter' : IDL.Principal,
    'data' : IDL.Text,
    'validated' : IDL.Bool,
    'validator' : IDL.Opt(IDL.Principal),
    'submitted_at' : IDL.Nat64,
  });
  const Result_1 = IDL.Variant({ 'Ok' : IDL.Nat64, 'Err' : EcoError });
  const User = IDL.Record({
    'balance' : IDL.Nat64,
    'registered_at' : IDL.Nat64,
  });
  const Result = IDL.Variant({ 'Ok' : User, 'Err' : EcoError });
  const Result_2 = IDL.Variant({ 'Ok' : DataSubmission, 'Err' : EcoError });
  const VoteChoice = IDL.Variant({ 'No' : IDL.Null, 'Yes' : IDL.Null });
  return IDL.Service({
    'create_proposal' : IDL.Func([IDL.Text], [Result_3], []),
    'get_active_proposals' : IDL.Func([], [IDL.Vec(Proposal)], ['query']),
    'get_all_proposals' : IDL.Func([], [IDL.Vec(Proposal)], ['query']),
    'get_proposal' : IDL.Func([IDL.Nat64], [Result_3], ['query']),
    'get_system_stats' : IDL.Func(
        [],
        [IDL.Vec(IDL.Tuple(IDL.Text, IDL.Nat64))],
        ['query'],
      ),
    'get_total_supply' : IDL.Func([], [IDL.Nat64], ['query']),
    'get_unvalidated_data' : IDL.Func([], [IDL.Vec(DataSubmission)], ['query']),
    'get_user_balance' : IDL.Func([], [Result_1], ['query']),
    'get_user_info' : IDL.Func([], [Result], ['query']),
    'register_user' : IDL.Func([], [Result], []),
    'submit_data' : IDL.Func([IDL.Text], [Result_2], []),
    'validate_data' : IDL.Func([IDL.Nat64], [Result_2], []),
    'vote_on_proposal' : IDL.Func([IDL.Nat64, VoteChoice], [Result_3], []),
  });
};
export const init = ({ IDL }) => { return []; };
