# LoopFiX Smart Contracts

AI-powered DeFi savings vaults on Bitcoin (Stacks Layer 2)

## 📋 Contracts Overview

### 1. **SavingsVault.clar** - Individual Savings Vaults
- Create personal savings goals with target amounts and dates
- Automatic yield generation (5-15.7% APY)
- Multiple yield strategies: Staking, DeFi pools, BTC yield
- Track progress and earnings
- Withdraw when goals are met

### 2. **GroupVault.clar** - Collaborative Savings Pools
- Create group savings goals (up to 50 members)
- Proportional yield distribution
- Member contributions tracking
- Withdraw proportional share when goal is reached

### 3. **AdvisorNFT.clar** - Milestone Achievement Badges
- NFT badges for savings milestones
- 5 tiers: Beginner (1 STX) → Legend (500 STX)
- Transferable and burnable
- Unique achievements per user

## 🚀 Deployment Guide

### Prerequisites

1. **Install Dependencies**
   ```bash
   npm install @stacks/transactions @stacks/network
   ```

2. **Get Testnet STX** (for gas fees)
   - Visit: https://explorer.hiro.so/sandbox/faucet?chain=testnet
   - Connect your wallet and claim testnet STX

3. **Get Your Private Key**
   - **Hiro Wallet**: Settings → View Secret Key
   - **Xverse**: Settings → Show Secret Key
   - **Leather**: Settings → View Secret Key

### Deployment Steps

1. **Create `.env` file** (copy from `env.example`):
   ```bash
   cp env.example .env
   ```

2. **Add your private key to `.env`**:
   ```
   STACKS_PRIVATE_KEY=your_actual_private_key_here
   NETWORK=testnet
   ```

3. **Deploy to Testnet**:
   
   **Windows PowerShell:**
   ```powershell
   $env:STACKS_PRIVATE_KEY = "your_private_key_here"
   node deploy.js testnet
   ```
   
   **Mac/Linux:**
   ```bash
   export STACKS_PRIVATE_KEY="your_private_key_here"
   node deploy.js testnet
   ```

4. **Deploy to Mainnet** (when ready):
   ```bash
   node deploy.js mainnet
   ```

### Expected Output

```
🚀 Deploying to testnet...
📡 Network: https://stacks-node-api.testnet.stacks.co

📄 Deploying Individual Savings Vault (savings-vault)...
✅ Individual Savings Vault deployed!
   Transaction ID: 0x1234...
   Explorer: https://explorer.hiro.so/txid/0x1234...?chain=testnet

⏳ Waiting 30 seconds before next deployment...

📄 Deploying Group Savings Vault (group-vault)...
✅ Group Savings Vault deployed!
   ...
```

## 📝 Deployment Info

After deployment, a JSON file will be created with all contract addresses:

```json
{
  "network": "testnet",
  "timestamp": "2025-10-08T12:00:00.000Z",
  "results": [
    {
      "name": "savings-vault",
      "txid": "0x...",
      "status": "success"
    }
  ]
}
```

**Save this file!** You'll need the transaction IDs to:
- Update your backend configuration
- Integrate contracts with frontend
- Verify deployment on Stacks Explorer

## 🔧 Contract Addresses (After Deployment)

Once deployed, update these in your backend `.env`:

```bash
# Backend .env
SAVINGS_VAULT_CONTRACT=ST...ABC.savings-vault
GROUP_VAULT_CONTRACT=ST...ABC.group-vault
ADVISOR_NFT_CONTRACT=ST...ABC.advisor-nft
NETWORK=testnet
```

## 📖 Usage Examples

### Creating a Savings Vault

```javascript
import { makeContractCall } from '@stacks/transactions';

const txOptions = {
  contractAddress: 'ST...ABC',
  contractName: 'savings-vault',
  functionName: 'create-vault',
  functionArgs: [
    uintCV(50000000), // 50 STX target
    uintCV(blockHeight + 52560) // 1 year from now
  ],
  network: new StacksTestnet(),
  senderKey: privateKey
};

const transaction = await makeContractCall(txOptions);
```

### Depositing to Vault

```javascript
const txOptions = {
  contractAddress: 'ST...ABC',
  contractName: 'savings-vault',
  functionName: 'deposit',
  functionArgs: [
    uintCV(1), // vault-id
    uintCV(5000000) // 5 STX deposit
  ],
  network: new StacksTestnet(),
  senderKey: privateKey
};
```

## 🎯 Yield Strategies

| Strategy | APY | Description |
|----------|-----|-------------|
| Base | 5.0% | Default savings rate |
| Staking | 8.5% | STX staking rewards |
| DeFi | 15.7% | DeFi pool yields |
| BTC Yield | 12.3% | Bitcoin yield farming |

## 🛡️ Security Notes

- ⚠️ **NEVER commit your `.env` file or private keys to git**
- ✅ Test thoroughly on testnet before mainnet deployment
- ✅ All contracts have proper authorization checks
- ✅ Minimum deposits enforced (1 STX)
- ✅ Read-only functions for safe data queries

## 🐛 Troubleshooting

### Error: "Private key is required"
- Set `STACKS_PRIVATE_KEY` environment variable
- Make sure `.env` file exists with your key

### Error: "Insufficient balance"
- Get testnet STX from faucet
- Wait for previous transaction to confirm

### Error: "Contract already exists"
- Contract name already taken
- Change contract name in deployment script

## 📚 Resources

- [Stacks Documentation](https://docs.stacks.co/)
- [Clarity Language Reference](https://docs.stacks.co/clarity/)
- [Hiro Platform](https://www.hiro.so/)
- [Stacks Explorer (Testnet)](https://explorer.hiro.so/?chain=testnet)
- [Stacks Explorer (Mainnet)](https://explorer.hiro.so/?chain=mainnet)

## 🎉 Next Steps

After successful deployment:

1. ✅ Update backend with contract addresses
2. ✅ Integrate contracts with frontend services
3. ✅ Test vault creation and deposits
4. ✅ Implement AI advisor integration
5. ✅ Deploy to production (mainnet)

---

**Built with ❤️ by the LoopFi Team**

