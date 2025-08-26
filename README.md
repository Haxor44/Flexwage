# FlexWage - Decentralized Gig Economy Platform on ICP

FlexWage is a revolutionary decentralized platform built on the Internet Computer Protocol (ICP) that connects businesses with last-minute staffing needs to workers seeking flexible opportunities. The platform features **Decentralized Identity (DID)** for workers, allowing them to own and port their work history and ratings across platforms.

## 🚀 Key Features

### Core Platform Features
- **Real-time Shift Matching**: Businesses post urgent shifts, workers claim them instantly
- **Smart Filtering**: Location-based and skill-based shift recommendations
- **Comprehensive Profiles**: Detailed onboarding for both businesses and workers
- **Notification System**: Real-time updates on shift status changes
- **Rating & Review System**: Mutual feedback between businesses and workers

### 🔐 ICP Integration Features

#### **Internet Identity Authentication**
- Passwordless, biometric authentication
- Complete privacy protection
- No user data stored by the platform
- Seamless Web3 experience

#### **Decentralized Identity (DID) for Workers**
- **Portable Work History**: Complete record of all shifts worked
- **Verifiable Ratings**: Cryptographically signed business reviews
- **Skills Certification**: Skills verified through completed work
- **Cross-Platform Portability**: Export DID to use on other platforms
- **Tamper-Proof Records**: Blockchain-verified work history
- **Ownership**: Workers own their identity and data

## 🏗️ Architecture

### Backend (Rust Canister)
```
src/flexwage_backend/
├── src/
│   └── lib.rs              # Main canister logic
├── Cargo.toml              # Rust dependencies
└── flexwage_backend.did    # Candid interface
```

### Frontend (Next.js)
```
├── app/
│   ├── page.tsx            # Main application with II integration
│   └── layout.tsx          # App layout
├── components/
│   ├── did-profile.tsx     # DID profile viewer
│   ├── onboarding-flow.tsx # User onboarding
│   └── shift-management.tsx # Shift CRUD operations
├── lib/
│   └── icp.ts              # ICP service integration
└── dfx.json                # DFX configuration
```

## 🛠️ Tech Stack

### Blockchain & Backend
- **Internet Computer Protocol (ICP)** - Blockchain platform
- **Rust** - Canister backend language (chosen for performance and type safety)
- **Candid** - Interface definition language
- **Internet Identity** - Decentralized authentication
- **IC Stable Structures** - Data persistence

### Frontend
- **Next.js 15** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Radix UI** - Component library
- **@dfinity/agent** - ICP integration
- **@dfinity/auth-client** - Internet Identity client

## 📊 Data Models

### User Profile
```rust
struct UserProfile {
    id: UserId,
    principal: Principal,
    user_type: UserType,
    name: String,
    email: String,
    phone: Option<String>,
    location: String,
    created_at: i64,
    updated_at: i64,
    did_document: Option<String>,
}
```

### DID Document
```rust
struct DIDDocument {
    worker_id: UserId,
    work_history: Vec<WorkHistoryId>,
    ratings: Vec<RatingId>,
    total_shifts: u64,
    average_rating: Option<f32>,
    skills_verified: Vec<String>,
    created_at: i64,
    updated_at: i64,
    signature: String, // Cryptographic signature
}
```

### Work History Entry
```rust
struct WorkHistory {
    id: WorkHistoryId,
    worker_id: UserId,
    business_id: UserId,
    shift_id: ShiftId,
    role: String,
    date_worked: String,
    hours_worked: f32,
    pay_earned: f32,
    business_name: String,
    location: String,
    completed_at: i64,
    verification_hash: String, // Integrity verification
}
```

## 🔧 Setup & Development

### Prerequisites
- [DFX SDK](https://sdk.dfinity.org/) (latest version)
- [Node.js](https://nodejs.org/) (v18+)
- [Rust](https://rustup.rs/)

### Local Development
```bash
# Clone the repository
git clone <repository-url>
cd flexwage

# Install frontend dependencies
npm install

# Start local replica
dfx start --background

# Deploy Internet Identity (for local development)
dfx deploy internet_identity

# Deploy the backend canister
dfx deploy flexwage_backend

# Start the frontend development server
npm run dev
```

### Environment Configuration
Create a `.env.local` file:
```bash
NEXT_PUBLIC_CANISTER_ID_FLEXWAGE_BACKEND=your_canister_id
NEXT_PUBLIC_DFX_NETWORK=local
```

## 🌐 Deployment

### Local Deployment
```bash
# Deploy all canisters
dfx deploy

# Get canister URLs
dfx canister call flexwage_backend health_check
```

### Mainnet Deployment
```bash
# Deploy to IC mainnet
dfx deploy --network ic

# Verify deployment
dfx canister --network ic call flexwage_backend health_check
```

## 🔐 Security Features

### Identity & Authentication
- **Internet Identity Integration**: No passwords, biometric auth
- **Principal-based Authorization**: Cryptographic identity verification
- **Session Management**: Secure session handling with II

### Data Integrity
- **Cryptographic Signatures**: All DID documents are signed
- **Verification Hashes**: Work history entries are tamper-proof
- **Blockchain Persistence**: All data stored on-chain

### Privacy Protection
- **Zero-Knowledge Authentication**: No personal data required for login
- **Data Ownership**: Workers own their complete work history
- **Selective Disclosure**: Workers control what information to share

## 📱 User Experience

### For Workers
1. **Login with Internet Identity** - Biometric authentication
2. **Complete Profile Setup** - Skills, availability, experience
3. **Browse Available Shifts** - Location and skill-based filtering
4. **Claim Shifts Instantly** - One-click application process
5. **Build Verified Work History** - Automatic DID updates
6. **Export Portable Profile** - Take your reputation anywhere

### For Businesses
1. **Secure Business Verification** - Internet Identity + business details
2. **Post Urgent Shifts** - Quick shift creation with all details
3. **Review Worker Applications** - Access to verified work history
4. **Rate & Review Workers** - Contribute to decentralized reputation
5. **Instant Notifications** - Real-time updates on applications

## 🔄 DID Portability

The DID system allows workers to:
- **Export complete work history** as JSON
- **Verify credentials independently** using cryptographic signatures
- **Import to other platforms** that support the DID standard
- **Maintain reputation** across different gig platforms
- **Prove work experience** without platform lock-in

### Export Format
```json
{
  "worker_id": "uuid-string",
  "work_history": ["history-id-1", "history-id-2"],
  "ratings": ["rating-id-1", "rating-id-2"],
  "total_shifts": 42,
  "average_rating": 4.8,
  "skills_verified": ["Server", "Bartender", "Cashier"],
  "created_at": 1640995200000,
  "updated_at": 1640995200000,
  "signature": "cryptographic-signature"
}
```

## 🧪 Testing

### Unit Tests
```bash
# Run Rust canister tests
cd src/flexwage_backend
cargo test
```

### Integration Tests
```bash
# Test canister methods
dfx canister call flexwage_backend health_check

# Test authentication
dfx canister call flexwage_backend get_caller_principal
```

### Frontend Tests
```bash
# Run frontend tests
npm test
```

## 🚧 Roadmap

### Phase 1 ✅ (Current)
- [x] Internet Identity integration
- [x] Basic shift management
- [x] Worker/Business profiles
- [x] DID document creation
- [x] Work history tracking
- [x] Rating system

### Phase 2 🔄 (In Progress)
- [ ] Advanced filtering & matching
- [ ] Mobile application
- [ ] Payment integration
- [ ] Multi-platform DID support
- [ ] Analytics dashboard

### Phase 3 🔮 (Future)
- [ ] DAO governance
- [ ] Token incentives
- [ ] Cross-chain interoperability
- [ ] AI-powered matching
- [ ] Advanced reputation algorithms

## 📞 Support

For questions, issues, or contributions:
- **GitHub Issues**: [Create an issue](https://github.com/your-repo/issues)
- **Discord**: [Join our community](https://discord.gg/your-server)
- **Documentation**: [Full API docs](https://docs.flexwage.io)

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**FlexWage** - Empowering the future of flexible work with decentralized identity and blockchain technology. 🚀

Built with ❤️ on the Internet Computer Protocol.
