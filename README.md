# EcoChain DAO

A decentralized autonomous organization (DAO) built on the Internet Computer for environmental data collection and governance.

## 🌱 Overview

EcoChain DAO is a minimal but complete DAO implementation that demonstrates:
- User registration with ECO token rewards
- Environmental data submission and validation
- Decentralized governance through proposals and voting
- Token-based incentive system

## 🚀 Features

### Backend (Rust Canister)
- **User Management**: Registration system with 1,000 ECO token allocation
- **Token Economics**: 
  - Registration: 1,000 ECO
  - Data Submission: 50 ECO
  - Data Validation: 25 ECO
  - Governance Voting: 10 ECO
- **Data System**: Submit and validate environmental data
- **Governance**: Create proposals (requires ≥1,000 ECO) and vote
- **Persistent Storage**: Uses stable memory for canister upgrades

### Frontend (HTML/CSS/JS)
- Clean, responsive web interface
- Real-time token balance tracking
- Interactive proposal creation and voting
- Data submission and validation workflows

## 📦 Quick Start

### Prerequisites
- Node.js 18+
- Rust (latest stable)
- dfx (IC SDK)

### Installation
```bash
# Install IC SDK
sh -ci "$(curl -fsSL https://internetcomputer.org/install.sh)"

# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source ~/.cargo/env

# Install dependencies
npm install
```

### Development
```bash
# Start local IC replica
dfx start --clean --background

# Deploy canisters
dfx deploy

# Access the frontend
# URL will be displayed after deployment
```

### Testing
1. Register a user to get 1,000 ECO tokens
2. Submit environmental data to earn 50 ECO
3. Validate others' data to earn 25 ECO
4. Create proposals (requires 1,000+ ECO)
5. Vote on proposals to earn 10 ECO per vote

## 🏗 Project Structure

```
ecochain_dao/
├── dfx.json                          # dfx configuration
├── Cargo.toml                        # Rust workspace
├── package.json                      # Node.js dependencies
├── webpack.config.js                 # Frontend build config
├── src/
│   ├── ecochain_dao_backend/        # Rust canister
│   │   ├── Cargo.toml
│   │   ├── src/
│   │   │   ├── lib.rs              # Main canister logic
│   │   │   └── main.rs             # Binary entry point
│   │   └── ecochain_dao_backend.did # Candid interface
│   └── ecochain_dao_frontend/       # Frontend assets
│       └── src/
│           ├── index.html          # Main HTML file
│           ├── index.css           # Styles
│           └── index.js            # JavaScript logic
├── declarations/                     # Generated interfaces
│   └── ecochain_dao_backend/
└── README.md                        # This file
```

## 🔧 Available Commands

```bash
# Development
dfx start --background              # Start local IC replica
dfx deploy                          # Deploy all canisters
dfx stop                           # Stop local replica

# Build
dfx build                          # Build all canisters
dfx build ecochain_dao_backend     # Build backend only

# Generate
dfx generate                       # Generate declarations

# Canister Management
dfx canister status --all          # Check canister status
dfx canister logs ecochain_dao_backend  # View logs
```

## 📋 API Reference

### Backend Canister Methods

#### User Management
- `register_user()` → `Result<User, EcoError>`
- `get_user_balance()` → `Result<u64, EcoError>`
- `get_user_info()` → `Result<User, EcoError>`

#### Data Operations
- `submit_data(data: String)` → `Result<DataSubmission, EcoError>`
- `validate_data(submission_id: u64)` → `Result<DataSubmission, EcoError>`
- `get_unvalidated_data()` → `Vec<DataSubmission>`

#### Governance
- `create_proposal(description: String)` → `Result<Proposal, EcoError>`
- `vote_on_proposal(proposal_id: u64, vote: VoteChoice)` → `Result<Proposal, EcoError>`
- `get_active_proposals()` → `Vec<Proposal>`
- `get_all_proposals()` → `Vec<Proposal>`

#### System Info
- `get_total_supply()` → `u64`
- `get_system_stats()` → `HashMap<String, u64>`

## 🔄 Token Economics

| Action | Reward | Requirements |
|--------|---------|-------------|
| Registration | 1,000 ECO | First time only |
| Data Submission | 50 ECO | Registered user |
| Data Validation | 25 ECO | Can't validate own data |
| Voting | 10 ECO | One vote per proposal |
| Proposal Creation | 0 ECO | Requires ≥1,000 ECO balance |

**Total Supply**: 100,000,000 ECO tokens

## 🛡 Security Features

- **Access Control**: Principal-based user identification
- **Double-Vote Prevention**: Users can only vote once per proposal
- **Self-Validation Protection**: Users cannot validate their own data
- **Balance Requirements**: Minimum ECO balance for proposal creation
- **Stable Memory**: Data persists across canister upgrades

## 🧪 Development Notes

### Adding New Features
1. Update the Rust backend in `src/ecochain_dao_backend/src/lib.rs`
2. Regenerate Candid interface: `dfx build ecochain_dao_backend`
3. Update frontend JavaScript in `src/ecochain_dao_frontend/src/index.js`
4. Test locally with `dfx deploy`

### Canister Upgrades
The canister uses `ic-stable-structures` for persistent storage, meaning:
- User data survives upgrades
- Proposals and votes are preserved
- Token balances remain intact

## 🌍 Deployment

### Local Deployment
```bash
dfx start --clean --background
dfx deploy
```

### Mainnet Deployment
```bash
dfx deploy --network ic
```

## 📝 License

This project is open source and available under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For questions or issues:
- Check the Internet Computer documentation
- Review the dfx commands reference
- Join the DFINITY developer forum

---

Built with ❤️ for a sustainable future 🌍
