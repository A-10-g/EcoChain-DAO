use candid::{CandidType, Deserialize, Principal};
use ic_cdk::api::{caller, time};
use ic_cdk::{query, update};
use ic_stable_structures::{
    memory_manager::{MemoryId, MemoryManager, VirtualMemory},
    DefaultMemoryImpl, StableBTreeMap, StableCell,
    storable::Bound, Storable,
};
use std::cell::RefCell;
use std::collections::HashMap;
use std::borrow::Cow;

// Memory management
type Memory = VirtualMemory<DefaultMemoryImpl>;
type IdCell = StableCell<u64, Memory>;
type Storage<K, V> = StableBTreeMap<K, V, Memory>;

// Data structures
#[derive(Clone, Debug, CandidType, Deserialize)]
pub struct User {
    pub principal: Principal,
    pub balance: u64,
    pub registered_at: u64,
}

#[derive(Clone, Debug, CandidType, Deserialize)]
pub struct Proposal {
    pub id: u64,
    pub creator: Principal,
    pub description: String,
    pub yes_votes: u64,
    pub no_votes: u64,
    pub is_active: bool,
    pub created_at: u64,
    pub voters: Vec<Principal>, // Track who voted to prevent double voting
}

#[derive(Clone, Debug, CandidType, Deserialize)]
pub struct DataSubmission {
    pub id: u64,
    pub submitter: Principal,
    pub data: String,
    pub validated: bool,
    pub validator: Option<Principal>,
    pub submitted_at: u64,
}

#[derive(Clone, Debug, CandidType, Deserialize)]
pub enum VoteChoice {
    Yes,
    No,
}

#[derive(Clone, Debug, CandidType, Deserialize)]
pub enum ActionType {
    Registration,
    DataSubmission,
    Validation,
    Governance,
}

// Error types
#[derive(Clone, Debug, CandidType, Deserialize)]
pub enum EcoError {
    UserNotFound,
    InsufficientBalance,
    ProposalNotFound,
    ProposalNotActive,
    AlreadyVoted,
    Unauthorized,
    DataNotFound,
    AlreadyValidated,
}

// Storable implementations
impl Storable for User {
    fn to_bytes(&self) -> Cow<'_, [u8]> {
        Cow::Owned(candid::encode_one(self).unwrap())
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        candid::decode_one(&bytes).unwrap()
    }

    const BOUND: Bound = Bound::Bounded {
        max_size: 1000,
        is_fixed_size: false,
    };
}

impl Storable for Proposal {
    fn to_bytes(&self) -> Cow<'_, [u8]> {
        Cow::Owned(candid::encode_one(self).unwrap())
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        candid::decode_one(&bytes).unwrap()
    }

    const BOUND: Bound = Bound::Bounded {
        max_size: 2000,
        is_fixed_size: false,
    };
}

impl Storable for DataSubmission {
    fn to_bytes(&self) -> Cow<'_, [u8]> {
        Cow::Owned(candid::encode_one(self).unwrap())
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        candid::decode_one(&bytes).unwrap()
    }

    const BOUND: Bound = Bound::Bounded {
        max_size: 1500,
        is_fixed_size: false,
    };
}

// Constants
const TOTAL_SUPPLY: u64 = 100_000_000;
const REGISTRATION_REWARD: u64 = 1_000;
const DATA_SUBMISSION_REWARD: u64 = 50;
const VALIDATION_REWARD: u64 = 25;
const GOVERNANCE_REWARD: u64 = 10;
const MIN_PROPOSAL_BALANCE: u64 = 1_000;

// Memory management setup
thread_local! {
    static MEMORY_MANAGER: RefCell<MemoryManager<DefaultMemoryImpl>> = RefCell::new(
        MemoryManager::init(DefaultMemoryImpl::default())
    );

    static USER_ID_COUNTER: RefCell<IdCell> = RefCell::new(
        IdCell::init(MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(0))), 0)
            .expect("Cannot create user ID counter")
    );

    static PROPOSAL_ID_COUNTER: RefCell<IdCell> = RefCell::new(
        IdCell::init(MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(1))), 0)
            .expect("Cannot create proposal ID counter")
    );

    static DATA_ID_COUNTER: RefCell<IdCell> = RefCell::new(
        IdCell::init(MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(2))), 0)
            .expect("Cannot create data ID counter")
    );

    static USERS: RefCell<Storage<Principal, User>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(3)))
        )
    );

    static PROPOSALS: RefCell<Storage<u64, Proposal>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(4)))
        )
    );

    static DATA_SUBMISSIONS: RefCell<Storage<u64, DataSubmission>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(5)))
        )
    );
}

// User registration and balance management
#[update]
pub fn register_user() -> Result<User, EcoError> {
    let caller_principal = caller();
    
    // Check if user already exists
    USERS.with(|users| {
        if users.borrow().contains_key(&caller_principal) {
            return Err(EcoError::Unauthorized);
        }
        
        // Create new user with registration reward
        let user = User {
            principal: caller_principal,
            balance: REGISTRATION_REWARD,
            registered_at: time(),
        };
        
        users.borrow_mut().insert(caller_principal, user.clone());
        Ok(user)
    })
}

#[query]
pub fn get_user_balance() -> Result<u64, EcoError> {
    let caller_principal = caller();
    
    USERS.with(|users| {
        users.borrow()
            .get(&caller_principal)
            .map(|user| user.balance)
            .ok_or(EcoError::UserNotFound)
    })
}

#[query]
pub fn get_user_info() -> Result<User, EcoError> {
    let caller_principal = caller();
    
    USERS.with(|users| {
        users.borrow()
            .get(&caller_principal)
            .ok_or(EcoError::UserNotFound)
    })
}

// Data submission and validation
#[update]
pub fn submit_data(data: String) -> Result<DataSubmission, EcoError> {
    let caller_principal = caller();
    
    // Verify user exists
    USERS.with(|users| {
        if !users.borrow().contains_key(&caller_principal) {
            return Err(EcoError::UserNotFound);
        }
        Ok(())
    })?;
    
    // Create data submission
    let submission_id = DATA_ID_COUNTER.with(|counter| {
        let current_id = counter.borrow().get() + 1;
        counter.borrow_mut().set(current_id).expect("Cannot set data ID");
        current_id
    });
    
    let submission = DataSubmission {
        id: submission_id,
        submitter: caller_principal,
        data,
        validated: false,
        validator: None,
        submitted_at: time(),
    };
    
    DATA_SUBMISSIONS.with(|submissions| {
        submissions.borrow_mut().insert(submission_id, submission.clone());
    });
    
    // Reward user for data submission
    reward_user(caller_principal, DATA_SUBMISSION_REWARD, ActionType::DataSubmission)?;
    
    Ok(submission)
}

#[update]
pub fn validate_data(submission_id: u64) -> Result<DataSubmission, EcoError> {
    let caller_principal = caller();
    
    // Verify user exists
    USERS.with(|users| {
        if !users.borrow().contains_key(&caller_principal) {
            return Err(EcoError::UserNotFound);
        }
        Ok(())
    })?;
    
    DATA_SUBMISSIONS.with(|submissions| {
        let mut submissions_ref = submissions.borrow_mut();
        
        if let Some(mut submission) = submissions_ref.get(&submission_id) {
            // Check if already validated
            if submission.validated {
                return Err(EcoError::AlreadyValidated);
            }
            
            // Check if user is trying to validate their own submission
            if submission.submitter == caller_principal {
                return Err(EcoError::Unauthorized);
            }
            
            // Mark as validated
            submission.validated = true;
            submission.validator = Some(caller_principal);
            
            submissions_ref.insert(submission_id, submission.clone());
            
            // Reward validator
            reward_user(caller_principal, VALIDATION_REWARD, ActionType::Validation)?;
            
            Ok(submission)
        } else {
            Err(EcoError::DataNotFound)
        }
    })
}

#[query]
pub fn get_unvalidated_data() -> Vec<DataSubmission> {
    DATA_SUBMISSIONS.with(|submissions| {
        submissions.borrow()
            .iter()
            .filter_map(|(_, submission)| {
                if !submission.validated {
                    Some(submission)
                } else {
                    None
                }
            })
            .collect()
    })
}

// Proposal and voting system
#[update]
pub fn create_proposal(description: String) -> Result<Proposal, EcoError> {
    let caller_principal = caller();
    
    // Check if user has minimum balance for creating proposals
    USERS.with(|users| {
        if let Some(user) = users.borrow().get(&caller_principal) {
            if user.balance < MIN_PROPOSAL_BALANCE {
                return Err(EcoError::InsufficientBalance);
            }
            Ok(())
        } else {
            Err(EcoError::UserNotFound)
        }
    })?;
    
    // Create proposal
    let proposal_id = PROPOSAL_ID_COUNTER.with(|counter| {
        let current_id = counter.borrow().get() + 1;
        counter.borrow_mut().set(current_id).expect("Cannot set proposal ID");
        current_id
    });
    
    let proposal = Proposal {
        id: proposal_id,
        creator: caller_principal,
        description,
        yes_votes: 0,
        no_votes: 0,
        is_active: true,
        created_at: time(),
        voters: Vec::new(),
    };
    
    PROPOSALS.with(|proposals| {
        proposals.borrow_mut().insert(proposal_id, proposal.clone());
    });
    
    Ok(proposal)
}

#[update]
pub fn vote_on_proposal(proposal_id: u64, vote: VoteChoice) -> Result<Proposal, EcoError> {
    let caller_principal = caller();
    
    // Verify user exists
    USERS.with(|users| {
        if !users.borrow().contains_key(&caller_principal) {
            return Err(EcoError::UserNotFound);
        }
        Ok(())
    })?;
    
    PROPOSALS.with(|proposals| {
        let mut proposals_ref = proposals.borrow_mut();
        
        if let Some(mut proposal) = proposals_ref.get(&proposal_id) {
            // Check if proposal is active
            if !proposal.is_active {
                return Err(EcoError::ProposalNotActive);
            }
            
            // Check if user already voted
            if proposal.voters.contains(&caller_principal) {
                return Err(EcoError::AlreadyVoted);
            }
            
            // Record vote
            match vote {
                VoteChoice::Yes => proposal.yes_votes += 1,
                VoteChoice::No => proposal.no_votes += 1,
            }
            
            proposal.voters.push(caller_principal);
            
            proposals_ref.insert(proposal_id, proposal.clone());
            
            // Reward user for governance participation
            reward_user(caller_principal, GOVERNANCE_REWARD, ActionType::Governance)?;
            
            Ok(proposal)
        } else {
            Err(EcoError::ProposalNotFound)
        }
    })
}

#[query]
pub fn get_all_proposals() -> Vec<Proposal> {
    PROPOSALS.with(|proposals| {
        proposals.borrow()
            .iter()
            .map(|(_, proposal)| proposal)
            .collect()
    })
}

#[query]
pub fn get_active_proposals() -> Vec<Proposal> {
    PROPOSALS.with(|proposals| {
        proposals.borrow()
            .iter()
            .filter_map(|(_, proposal)| {
                if proposal.is_active {
                    Some(proposal)
                } else {
                    None
                }
            })
            .collect()
    })
}

#[query]
pub fn get_proposal(proposal_id: u64) -> Result<Proposal, EcoError> {
    PROPOSALS.with(|proposals| {
        proposals.borrow()
            .get(&proposal_id)
            .ok_or(EcoError::ProposalNotFound)
    })
}

// Helper functions
fn reward_user(user_principal: Principal, amount: u64, _action_type: ActionType) -> Result<(), EcoError> {
    USERS.with(|users| {
        let mut users_ref = users.borrow_mut();
        
        if let Some(mut user) = users_ref.get(&user_principal) {
            user.balance += amount;
            users_ref.insert(user_principal, user);
            Ok(())
        } else {
            Err(EcoError::UserNotFound)
        }
    })
}

// System info queries
#[query]
pub fn get_total_supply() -> u64 {
    TOTAL_SUPPLY
}

#[query]
pub fn get_system_stats() -> HashMap<String, u64> {
    let mut stats = HashMap::new();
    
    // Count total users
    let user_count = USERS.with(|users| users.borrow().len() as u64);
    stats.insert("total_users".to_string(), user_count);
    
    // Count total proposals
    let proposal_count = PROPOSALS.with(|proposals| proposals.borrow().len() as u64);
    stats.insert("total_proposals".to_string(), proposal_count);
    
    // Count active proposals
    let active_proposals = PROPOSALS.with(|proposals| {
        proposals.borrow()
            .iter()
            .filter(|(_, proposal)| proposal.is_active)
            .count() as u64
    });
    stats.insert("active_proposals".to_string(), active_proposals);
    
    // Count data submissions
    let data_count = DATA_SUBMISSIONS.with(|submissions| submissions.borrow().len() as u64);
    stats.insert("total_data_submissions".to_string(), data_count);
    
    // Count validated data
    let validated_data = DATA_SUBMISSIONS.with(|submissions| {
        submissions.borrow()
            .iter()
            .filter(|(_, submission)| submission.validated)
            .count() as u64
    });
    stats.insert("validated_data".to_string(), validated_data);
    
    stats.insert("total_supply".to_string(), TOTAL_SUPPLY);
    
    stats
}

// Add this to the existing lib.rs file, after the get_system_stats function

// Token transfer functionality
#[update]
pub fn transfer_tokens(to_principal: Principal, amount: u64) -> Result<(), EcoError> {
    let caller_principal = caller();
    
    // Check if both users exist
    USERS.with(|users| {
        let mut users_ref = users.borrow_mut();
        
        // Get sender
        let mut sender = users_ref.get(&caller_principal).ok_or(EcoError::UserNotFound)?;
        
        // Check if sender has enough balance
        if sender.balance < amount {
            return Err(EcoError::InsufficientBalance);
        }
        
        // Get receiver (they must be registered)
        let mut receiver = users_ref.get(&to_principal).ok_or(EcoError::UserNotFound)?;
        
        // Perform transfer
        sender.balance -= amount;
        receiver.balance += amount;
        
        // Update both users
        users_ref.insert(caller_principal, sender);
        users_ref.insert(to_principal, receiver);
        
        Ok(())
    })
}

// Get all registered users (for transfer dropdown)
#[query]
pub fn get_all_users() -> Vec<User> {
    USERS.with(|users| {
        users.borrow()
            .iter()
            .map(|(_, user)| user)
            .collect()
    })
}

// Check if user is registered
#[query]
pub fn is_user_registered(principal: Principal) -> bool {
    USERS.with(|users| {
        users.borrow().contains_key(&principal)
    })
}


// Initialize canister (called once on deployment)
#[ic_cdk::init]
fn init() {
    // Initialize with empty state - stable structures handle persistence
}

// Export Candid interface
ic_cdk::export_candid!();
