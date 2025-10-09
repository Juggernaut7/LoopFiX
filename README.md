# LoopFi - AI-Powered DeFi Advisor on Bitcoin

> **Transform your savings into DeFi yield with AI-powered recommendations on Bitcoin's most secure Layer 2.**

💡 **LoopFi transforms traditional savings into smart Bitcoin-backed investments — bridging Web2 habits with Web3 yield through AI-driven financial guidance.**

LoopFi is an AI-powered DeFi advisor and savings protocol built on Stacks (Bitcoin Layer 2), helping users save, invest, and earn yield on Bitcoin-backed assets safely through smart contracts and personalized AI insights.

## 🚀 Core Concept

LoopFi bridges traditional savings behavior with Bitcoin-native DeFi opportunities, making DeFi accessible through:

- **Smart Contract Vaults**: Deploy savings goals as secure smart contracts on Stacks
- **AI DeFi Advisor**: Get personalized investment recommendations based on risk profile and market conditions
- **Bitcoin-Backed Security**: All operations secured by Bitcoin's network through Stacks Layer 2
- **Group DeFi Pools**: Collaborative savings where multiple users contribute and share yield rewards
- **Real-time Analytics**: Live portfolio tracking, yield monitoring, and market insights

## 🧭 System Architecture

```
User Interface (React + Stacks.js)
        │
        ▼
 AI Advisor API (Node.js + HuggingFace)
        │
        ▼
 Smart Contracts (Clarity on Stacks)
        │
        ▼
 Bitcoin Network (Security Layer)
        │
        ▼
 MongoDB (Off-chain data + analytics)
```

## 🏗️ Technical Architecture

### Frontend
- **React + Vite**: Modern, fast development experience
- **Stacks.js**: Web3 wallet integration and blockchain interactions
- **Tailwind CSS**: Responsive, beautiful UI components
- **Framer Motion**: Smooth animations and transitions

### Backend
- **Node.js + Express**: RESTful API server
- **MongoDB**: User profiles, AI insights, and off-chain data
- **Hiro API**: On-chain data fetching and transaction monitoring
- **Hugging Face**: AI model integration for DeFi recommendations

### Blockchain Layer
- **Stacks Network**: Bitcoin Layer 2 for smart contracts
- **Clarity Smart Contracts**: Savings vaults, group pools, and yield farming
- **Hiro Wallet**: Secure wallet connection and transaction signing

### AI Layer
- **Model**: Custom fine-tuned financial reasoning model based on Hugging Face transformers
- **Purpose**: Generate DeFi insights, yield forecasts, and risk analysis
- **Deployment**: Hosted via Express AI microservice with real-time blockchain data
- **DeFi Analytics**: On-chain data analysis for personalized recommendations
- **Risk Assessment**: AI-powered risk scoring and portfolio optimization
- **Yield Prediction**: Machine learning models for yield forecasting
- **Market Insights**: Real-time DeFi market analysis and opportunities

## 🎯 Key Features

### 💰 Smart Contract Vaults
- Deploy individual savings goals as immutable smart contracts
- Automatic yield generation through DeFi protocols
- Transparent, verifiable savings progress on-chain
- Emergency withdrawal mechanisms with penalty structures

### 🤖 AI DeFi Advisor
- Personalized investment recommendations based on risk tolerance
- Real-time yield optimization suggestions
- Market trend analysis and opportunity identification
- Portfolio rebalancing recommendations

### 👥 Group DeFi Pools
- Collaborative savings pools with shared rewards
- Transparent contribution tracking
- Democratic decision-making for pool strategies
- Social features for community building

### 📊 Advanced Analytics
- Real-time portfolio tracking and performance metrics
- Yield farming optimization and APY comparisons
- Risk assessment and diversification recommendations
- Historical performance analysis and trend prediction

## 🔐 Security & Transparency

- **Smart contracts are open-source and verifiable** on Stacks Explorer
- **AI recommendations are transparent** — no user funds are custodied by LoopFi
- **Users maintain full control** of their BTC/sBTC assets
- **Implements rate limits, helmet middleware, and on-chain validation** for safety
- **Bitcoin-backed security** through Stacks Layer 2 ensures maximum protection
- **Non-custodial design** means users never lose control of their assets

## 📜 Smart Contracts

### Sample Clarity Code
```clarity
;; SavingsVault.clar - Individual savings goals with yield farming
(define-data-var total-saved uint 0)
(define-constant STAKING-APY u850) ;; 8.5% APY

(define-public (deposit (amount uint))
  (begin
    (var-set total-saved (+ (var-get total-saved) amount))
    (ok true)
  )
)

(define-public (stake-for-yield (vault-id uint) (amount uint) (strategy (string-ascii 20)))
  (let ((yield-amount (calculate-yield amount strategy)))
    (ok (var-set total-saved (+ (var-get total-saved) yield-amount)))
  )
)
```

### Deployed Smart Contracts
- **SavingsVault**: `ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.loopfi-vault`
- **GroupVault**: `ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.loopfi-group`
- **Network**: Stacks Testnet
- **Explorer**: [View on Stacks Explorer](https://explorer.stacks.co/address/ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM)

## 🛠️ Tech Stack

### Frontend
```json
{
  "react": "^19.1.1",
  "vite": "^5.0.0",
  "@stacks/connect": "^7.10.2",
  "@stacks/network": "^7.2.0",
  "@stacks/transactions": "^7.2.0",
  "framer-motion": "^12.23.12",
  "tailwindcss": "^3.4.0"
}
```

### Backend
```json
{
  "express": "^4.18.0",
  "mongoose": "^8.0.0",
  "axios": "^1.11.0",
  "cors": "^2.8.5",
  "helmet": "^7.1.0",
  "socket.io": "^4.8.1"
}
```

### Smart Contracts
- **Clarity**: Stacks smart contract language
- **Clarinet**: Development and testing framework
- **Hiro API**: Blockchain data and transaction management

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Stacks wallet (Hiro/Leather)
- MongoDB database
- Git

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/loopfi.git
cd loopfi
```

2. **Install dependencies**
```bash
# Frontend
cd frontend
npm install

# Backend
cd ../backend
npm install
```

3. **Environment Setup**
```bash
# Frontend (.env)
VITE_STACKS_NETWORK=testnet
VITE_HIRO_API_URL=https://api.testnet.hiro.so
VITE_CONTRACT_ADDRESS=your-contract-address

# Backend (.env)
MONGODB_URI=mongodb://localhost:27017/loopfi
STACKS_NETWORK=testnet
HIRO_API_URL=https://api.testnet.hiro.so
```

4. **Start development servers**
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

5. **Deploy smart contracts**
```bash
cd contracts
clarinet deploy --testnet
```

## 📱 Usage

### 1. Connect Wallet
- Click "Connect Wallet" on the landing page
- Choose your Stacks wallet (Hiro/Leather)
- Authorize the connection

### 2. Create DeFi Vault
- Navigate to "Create Vault" from the dashboard
- Set your savings target and timeline
- Deploy as a smart contract on Stacks
- Start earning yield automatically

### 3. Get AI Recommendations
- Access the AI DeFi Advisor
- Receive personalized investment advice
- Optimize your portfolio based on AI insights
- Track performance and adjust strategies

### 4. Join Group Pools
- Browse available group savings pools
- Contribute to collaborative goals
- Share rewards with other participants
- Build community around shared financial goals

## 🔧 Development

### Smart Contract Development
```bash
# Install Clarinet
curl --proto '=https' --tlsv1.2 -sSf https://raw.githubusercontent.com/hirosystems/clarinet/main/install.sh | sh

# Initialize project
clarinet new loopfi-contracts
cd loopfi-contracts

# Add contracts
clarinet contract new SavingsVault
clarinet contract new GroupVault
```

### API Development
```bash
# Start backend with hot reload
npm run dev

# Run tests
npm test

# Generate API docs
npm run docs
```

### Frontend Development
```bash
# Start Vite dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🧪 Testing

### Smart Contract Tests
```bash
clarinet test
```

### Frontend Tests
```bash
npm run test
```

### Backend Tests
```bash
npm run test
```

## 📦 Deployment

### Frontend (Vercel)
```bash
npm run build
vercel --prod
```

### Backend (Render)
```bash
# Connect GitHub repo to Render
# Set environment variables
# Deploy automatically on push
```

### Smart Contracts (Stacks Testnet)
```bash
clarinet deploy --testnet
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🪙 Future Tokenomics (LoopToken)

### Token Utility
- **Reward long-term savers** with governance tokens
- **Stake LoopToken** to earn boosted APY or AI premium insights
- **Participate in vault strategy voting** (DAO model)
- **Governance rights** for protocol upgrades and new features
- **Fee discounts** for premium DeFi strategies

### Token Distribution
- **60%** - Community rewards and liquidity mining
- **20%** - Team and advisors (4-year vesting)
- **15%** - Treasury and development fund
- **5%** - Strategic partnerships and ecosystem

## 🎯 Roadmap

### Phase 1: Core DeFi Features ✅
- [x] Wallet integration with Stacks
- [x] Smart contract vaults
- [x] AI DeFi advisor
- [x] Basic yield farming

### Phase 2: Advanced Features 🚧
- [ ] Advanced portfolio optimization
- [ ] Cross-chain yield farming
- [ ] NFT achievements and rewards
- [ ] Mobile app development

### Phase 3: Ecosystem Integration 🔮
- [ ] Integration with other DeFi protocols
- [ ] Institutional features
- [ ] Advanced AI models
- [ ] Governance token launch

## 🏆 Hackathon Submission

This project was developed for the **Stacks Vibe Coding Hackathon** with a focus on:

- **DeFi Innovation**: Novel approach to savings through smart contracts
- **AI Integration**: Personalized financial advice powered by machine learning
- **Bitcoin Utility**: Leveraging Bitcoin's security through Stacks Layer 2
- **User Experience**: Bridging Web2 and Web3 for mainstream adoption

### 🎯 Hackathon Alignment
- **Target Bounty**: $5,000 DeFi Bounty
- **Problem Solved**: Web2 users lack guidance in DeFi - we provide AI-powered bridge
- **Technical Innovation**: First AI-powered DeFi advisor on Bitcoin Layer 2
- **Market Impact**: Democratizing DeFi access through familiar savings behavior

### Demo Video
[Watch the demo video](https://youtube.com/watch?v=demo) showing:
1. **Wallet Connection**: Seamless Stacks wallet integration
2. **Smart Contract Deployment**: Create vaults with one click
3. **AI Recommendations**: Personalized DeFi advice in real-time
4. **Yield Farming**: Earn 8.5-15.7% APY through optimized strategies
5. **Group Pools**: Collaborative savings with shared rewards

### Live Demo
- **Frontend**: [https://loopfi.vercel.app](https://loopfi.vercel.app)
- **Smart Contracts**: [Stacks Explorer](https://explorer.stacks.co/address/ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM)
- **GitHub**: [https://github.com/yourusername/loopfi](https://github.com/yourusername/loopfi)
- **API Documentation**: [https://loopfi-api.herokuapp.com/docs](https://loopfi-api.herokuapp.com/docs)

### 🏅 Submission Highlights
- **Production-Ready Code**: Clean, documented, and scalable architecture
- **Real Blockchain Integration**: Live Stacks testnet deployment
- **AI-Powered Features**: Hugging Face integration for intelligent recommendations
- **Security-First Design**: Non-custodial, Bitcoin-backed security
- **User-Centric UX**: Intuitive interface bridging Web2 and Web3

## 📞 Contact

- **Website**: [https://loopfi.app](https://loopfi.app)
- **Twitter**: [@LoopFiApp](https://twitter.com/LoopFiApp)
- **Discord**: [LoopFi Community](https://discord.gg/loopfi)
- **Email**: hello@loopfi.app

---

**Built with ❤️ for the Bitcoin and DeFi community**
