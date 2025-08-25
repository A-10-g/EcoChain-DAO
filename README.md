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

