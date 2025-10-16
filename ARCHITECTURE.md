# LoopFi Architecture Diagram

This document contains the visual architecture diagram for LoopFi - AI-Powered DeFi Savings Platform on Bitcoin.

## System Architecture Overview

```mermaid
graph TB
    subgraph "Frontend Layer"
        A[React + Vite App] --> B[Stacks.js Wallet]
        A --> C[Tailwind UI]
        A --> D[Framer Motion]
        A --> E[Zustand State]
    end
    
    subgraph "Backend Layer"
        F[Node.js + Express] --> G[MongoDB]
        F --> H[Hiro API]
        F --> I[Socket.io]
        F --> J[Swagger Docs]
    end
    
    subgraph "AI Layer"
        K[Hugging Face AI] --> L[Financial Advisor]
        K --> M[Behavioral Analyzer]
        K --> N[Savings Predictor]
    end
    
    subgraph "Blockchain Layer"
        O[Stacks Network] --> P[SavingsVault.clar]
        O --> Q[GroupVault.clar]
        O --> R[StakingVault.clar]
        O --> S[AdvisorNFT.clar]
    end
    
    subgraph "Bitcoin Security"
        T[Bitcoin Network] --> O
    end
    
    subgraph "External Services"
        U[Hiro Wallet] --> B
        V[Leather Wallet] --> B
        W[Stacks Explorer] --> O
    end
    
    A --> F
    F --> K
    F --> O
    O --> T
    
    style A fill:#61dafb
    style F fill:#68d391
    style K fill:#9f7aea
    style O fill:#f6ad55
    style T fill:#f56565
```

## Smart Contract Architecture

```mermaid
graph LR
    subgraph "Smart Contracts on Stacks"
        A[SavingsVault] --> B[Individual Goals]
        C[GroupVault] --> D[Collaborative Savings]
        E[StakingVault] --> F[Yield Generation]
        G[AdvisorNFT] --> H[Achievement System]
    end
    
    subgraph "Contract Functions"
        B --> I[deposit]
        B --> J[withdraw]
        B --> K[getBalance]
        D --> L[joinPool]
        D --> M[contribute]
        D --> N[distributeRewards]
        F --> O[stake]
        F --> P[unstake]
        F --> Q[claimRewards]
        H --> R[mintNFT]
        H --> S[transferNFT]
    end
    
    style A fill:#4ade80
    style C fill:#60a5fa
    style E fill:#a78bfa
    style G fill:#fbbf24
```

## Data Flow Architecture

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant B as Backend
    participant AI as AI Service
    participant SC as Smart Contract
    participant BC as Bitcoin Network
    
    U->>F: Connect Wallet
    F->>B: Authenticate User
    B->>F: User Profile
    
    U->>F: Create Savings Goal
    F->>SC: Deploy SavingsVault
    SC->>BC: Store on Blockchain
    BC->>SC: Confirmation
    SC->>F: Contract Address
    
    U->>F: Make Contribution
    F->>SC: deposit(amount)
    SC->>BC: Transaction
    BC->>SC: Confirmation
    SC->>F: Updated Balance
    
    F->>B: Request AI Advice
    B->>AI: Analyze User Data
    AI->>B: Recommendations
    B->>F: AI Insights
    
    U->>F: Join Group Pool
    F->>SC: joinPool(poolId)
    SC->>BC: Transaction
    BC->>SC: Confirmation
    SC->>F: Pool Membership
```

## Component Architecture

```mermaid
graph TD
    subgraph "Frontend Components"
        A[App.jsx] --> B[AppLayout]
        B --> C[Sidebar]
        B --> D[Header]
        B --> E[Main Content]
        
        E --> F[DashboardPage]
        E --> G[GoalsPage]
        E --> H[EarnPage]
        E --> I[AIAdvisorPage]
        E --> J[NFTPage]
        E --> K[LeaderboardPage]
        E --> L[SettingsPage]
    end
    
    subgraph "Shared Components"
        M[UI Components] --> N[Button]
        M --> O[Modal]
        M --> P[Card]
        M --> Q[Progress]
        
        R[Web3 Components] --> S[WalletConnect]
        R --> T[TransactionModal]
        R --> U[ContractInteraction]
    end
    
    subgraph "Services"
        V[walletService] --> W[Stacks Integration]
        X[contractService] --> Y[Smart Contract Calls]
        Z[apiService] --> AA[Backend Communication]
    end
    
    F --> V
    G --> X
    H --> X
    I --> Z
    J --> Z
    K --> Z
    
    style A fill:#61dafb
    style M fill:#68d391
    style R fill:#9f7aea
    style V fill:#f6ad55
```

## API Architecture

```mermaid
graph LR
    subgraph "Backend API"
        A[Express Server] --> B[Auth Routes]
        A --> C[Goals Routes]
        A --> D[Groups Routes]
        A --> E[AI Routes]
        A --> F[Staking Routes]
        A --> G[Health Routes]
    end
    
    subgraph "Controllers"
        B --> H[authController]
        C --> I[goalsController]
        D --> J[groupsController]
        E --> K[aiController]
        F --> L[stakingController]
        G --> M[healthController]
    end
    
    subgraph "Services"
        H --> N[walletService]
        I --> O[goalService]
        J --> P[groupService]
        K --> Q[aiService]
        L --> R[stakingService]
        M --> S[healthService]
    end
    
    subgraph "Models"
        O --> T[Goal Model]
        P --> U[Group Model]
        Q --> V[AI Model]
        R --> W[Stake Model]
    end
    
    style A fill:#4ade80
    style H fill:#60a5fa
    style N fill:#a78bfa
    style T fill:#fbbf24
```

## Security Architecture

```mermaid
graph TB
    subgraph "Security Layers"
        A[Frontend Security] --> B[Input Validation]
        A --> C[XSS Protection]
        A --> D[CSRF Protection]
        
        E[Backend Security] --> F[Rate Limiting]
        E --> G[Helmet Middleware]
        E --> H[JWT Authentication]
        E --> I[Input Sanitization]
        
        J[Blockchain Security] --> K[Smart Contract Audits]
        J --> L[Bitcoin Network Security]
        J --> M[Non-custodial Design]
        
        N[AI Security] --> O[Data Privacy]
        N --> P[Model Validation]
        N --> Q[Transparent Recommendations]
    end
    
    subgraph "Security Features"
        R[Wallet Integration] --> S[User Control]
        T[Smart Contracts] --> U[Open Source]
        V[AI Recommendations] --> W[No Fund Custody]
    end
    
    style A fill:#ef4444
    style E fill:#f97316
    style J fill:#eab308
    style N fill:#22c55e
```

## Deployment Architecture

```mermaid
graph TB
    subgraph "Production Environment"
        A[Frontend] --> B[Vercel]
        C[Backend] --> D[Render/Heroku]
        E[Database] --> F[MongoDB Atlas]
        G[Smart Contracts] --> H[Stacks Testnet]
    end
    
    subgraph "Development Environment"
        I[Local Frontend] --> J[Vite Dev Server]
        K[Local Backend] --> L[Node.js Dev Server]
        M[Local Database] --> N[MongoDB Local]
        O[Local Contracts] --> P[Clarinet Console]
    end
    
    subgraph "CI/CD Pipeline"
        Q[GitHub] --> R[GitHub Actions]
        R --> S[Build & Test]
        S --> T[Deploy Frontend]
        S --> U[Deploy Backend]
        S --> V[Deploy Contracts]
    end
    
    style A fill:#61dafb
    style C fill:#68d391
    style E fill:#9f7aea
    style G fill:#f6ad55
```

## Technology Stack Summary

```mermaid
graph LR
    subgraph "Frontend Stack"
        A[React 19] --> B[Vite]
        C[Tailwind CSS] --> D[Framer Motion]
        E[Stacks.js] --> F[Zustand]
    end
    
    subgraph "Backend Stack"
        G[Node.js] --> H[Express]
        I[MongoDB] --> J[Mongoose]
        K[Socket.io] --> L[Swagger]
    end
    
    subgraph "Blockchain Stack"
        M[Stacks] --> N[Clarity]
        O[Hiro API] --> P[Clarinet]
    end
    
    subgraph "AI Stack"
        Q[Hugging Face] --> R[Custom Models]
        S[Python] --> T[Financial Analysis]
    end
    
    style A fill:#61dafb
    style G fill:#68d391
    style M fill:#f6ad55
    style Q fill:#9f7aea
```

This architecture diagram shows the complete system design of LoopFi, demonstrating how all components work together to create a secure, scalable, and user-friendly DeFi savings platform on Bitcoin's Layer 2.
