# 🚀 LoopFiX Smart Contracts Deployment Guide

## ✅ What We've Built

### **3 Production-Ready Clarity Smart Contracts:**

1. **SavingsVault.clar** - Individual savings vaults with yield farming
2. **GroupVault.clar** - Collaborative group savings pools
3. **AdvisorNFT.clar** - NFT milestone achievement badges

### **Complete Deployment Infrastructure:**

- ✅ Deployment script (`contracts/deploy.js`)
- ✅ Configuration template (`contracts/env.example`)
- ✅ Package management (`contracts/package.json`)
- ✅ Clarinet configuration (`contracts/Clarinet.toml`)
- ✅ Comprehensive README (`contracts/README.md`)

---

## 🎯 What You Need to Deploy

### 1. **Stacks Testnet Account**

Get a wallet and private key from any of these:
- **Hiro Wallet**: https://wallet.hiro.so/
- **Xverse**: https://www.xverse.app/
- **Leather**: https://leather.io/

### 2. **Testnet STX** (for gas fees)

Get free testnet STX from the faucet:
👉 **https://explorer.hiro.so/sandbox/faucet?chain=testnet**

You'll need approximately **0.5-1 STX** for deploying all 3 contracts.

### 3. **Node.js Dependencies**

```bash
cd contracts
npm install
```

This installs:
- `@stacks/transactions` - For contract deployment
- `@stacks/network` - For network connectivity
- `dotenv` - For environment variable management

---

## 📝 Step-by-Step Deployment

### **Step 1: Install Dependencies**

```bash
cd C:\Users\HP\Desktop\LoopFi\contracts
npm install
```

### **Step 2: Create `.env` File**

Copy the example and add your real private key:

```bash
copy env.example .env
```

Then edit `.env` and replace with your actual private key:

```env
STACKS_PRIVATE_KEY=your_actual_64_character_hex_private_key_here
NETWORK=testnet
```

⚠️ **IMPORTANT**: Your private key is a 64-character hexadecimal string. Keep it secret!

### **Step 3: Get Testnet STX**

1. Go to: https://explorer.hiro.so/sandbox/faucet?chain=testnet
2. Connect your wallet
3. Click "Request STX"
4. Wait for confirmation (~10 minutes)

### **Step 4: Deploy Contracts**

**Windows PowerShell:**
```powershell
cd C:\Users\HP\Desktop\LoopFi\contracts
$env:STACKS_PRIVATE_KEY = "paste_your_private_key_here"
node deploy.js testnet
```

**Alternatively (using .env file):**
```powershell
cd C:\Users\HP\Desktop\LoopFi\contracts
npm run deploy:testnet
```

### **Step 5: Save Deployment Info**

The script will create a file like: `deployment-testnet-1728395840000.json`

**This file contains:**
- Transaction IDs for all contracts
- Deployment timestamps
- Contract addresses
- Explorer links

**SAVE THIS FILE!** You'll need it for backend integration.

---

## 📊 Expected Output

```
🚀 Deploying to testnet...
📡 Network: https://stacks-node-api.testnet.stacks.co

╔════════════════════════════════════════════════╗
║   LoopFiX Contract Deployment                  ║
╚════════════════════════════════════════════════╝

📄 Deploying Individual Savings Vault (savings-vault)...
✅ Individual Savings Vault deployed!
   Transaction ID: 0xabcd1234...
   Explorer: https://explorer.hiro.so/txid/0xabcd1234...?chain=testnet

⏳ Waiting 30 seconds before next deployment...

📄 Deploying Group Savings Vault (group-vault)...
✅ Group Savings Vault deployed!
   Transaction ID: 0xefgh5678...
   Explorer: https://explorer.hiro.so/txid/0xefgh5678...?chain=testnet

⏳ Waiting 30 seconds before next deployment...

📄 Deploying Milestone Achievement NFT (advisor-nft)...
✅ Milestone Achievement NFT deployed!
   Transaction ID: 0xijkl9012...
   Explorer: https://explorer.hiro.so/txid/0xijkl9012...?chain=testnet

╔════════════════════════════════════════════════╗
║   Deployment Summary                           ║
╚════════════════════════════════════════════════╝

✅ Successfully deployed: 3/3
❌ Failed: 0/3

✅ Successful deployments:
   - savings-vault: 0xabcd1234...
   - group-vault: 0xefgh5678...
   - advisor-nft: 0xijkl9012...

📝 Deployment info saved to: deployment-testnet-1728395840000.json

🎉 Deployment process complete!
```

---

## 🔧 After Deployment: Backend Integration

### **Step 1: Get Contract Addresses**

After deployment, your contracts will have addresses like:
```
ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.savings-vault
ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.group-vault
ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.advisor-nft
```

### **Step 2: Update Backend `.env`**

Add these to `backend/.env`:

```env
# Smart Contract Addresses (Testnet)
SAVINGS_VAULT_CONTRACT=ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.savings-vault
GROUP_VAULT_CONTRACT=ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.group-vault
ADVISOR_NFT_CONTRACT=ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.advisor-nft

# Stacks Network
STACKS_NETWORK=testnet
STACKS_API_URL=https://stacks-node-api.testnet.stacks.co
```

### **Step 3: Create Stacks Service**

We'll create `backend/src/services/stacks.service.js` to interact with deployed contracts.

---

## 🎨 Contract Features

### **SavingsVault.clar**

**Functions:**
- `create-vault` - Create a new savings goal
- `deposit` - Add funds to vault
- `withdraw` - Withdraw funds
- `distribute-yield` - Calculate and add yield
- `stake-for-yield` - Stake for higher APY
- `close-vault` - Close and deactivate vault

**Yield Strategies:**
- Base: 5% APY
- Staking: 8.5% APY
- DeFi: 15.7% APY
- BTC Yield: 12.3% APY

### **GroupVault.clar**

**Functions:**
- `create-group` - Create group savings pool
- `join-group` - Join existing group
- `contribute` - Add funds to group pool
- `withdraw-share` - Withdraw proportional share
- `distribute-yield` - Distribute yield to members
- `close-group` - Close group (creator only)

**Features:**
- Up to 50 members per group
- Proportional yield distribution
- Goal-based withdrawals

### **AdvisorNFT.clar**

**Functions:**
- `mint-milestone-badge` - Mint achievement NFT
- `transfer` - Transfer NFT to another user
- `burn` - Burn (destroy) NFT

**Milestone Tiers:**
- 🥉 Beginner: 1 STX saved
- 🥈 Intermediate: 10 STX saved
- 🥇 Advanced: 50 STX saved
- 💎 Expert: 100 STX saved
- 👑 Legend: 500 STX saved

---

## 🐛 Troubleshooting

### **Error: "Private key is required"**

**Solution:**
```powershell
$env:STACKS_PRIVATE_KEY = "your_64_char_hex_key_here"
```

### **Error: "Insufficient balance"**

**Solution:**
- Get testnet STX from faucet: https://explorer.hiro.so/sandbox/faucet?chain=testnet
- Wait for faucet transaction to confirm (~10 minutes)
- Check balance in your wallet

### **Error: "Contract name already exists"**

**Solution:**
- This means you already deployed a contract with this name
- Either use the existing deployment
- Or change contract name in `deploy.js`

### **Error: "Bad nonce"**

**Solution:**
- Wait 30 seconds and try again
- Previous transaction might still be pending

---

## 📚 Verification

### **Verify on Stacks Explorer:**

1. Copy transaction ID from deployment output
2. Go to: https://explorer.hiro.so/txid/YOUR_TX_ID?chain=testnet
3. Check transaction status:
   - ✅ **Success** = Contract deployed
   - ⏳ **Pending** = Wait a few minutes
   - ❌ **Failed** = Check error message

### **Query Contract:**

Use Hiro API to verify contract exists:

```bash
curl https://stacks-node-api.testnet.stacks.co/v2/contracts/interface/ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM/savings-vault
```

---

## 🎯 Next Steps

After successful deployment:

1. ✅ **Update backend** with contract addresses
2. ✅ **Create Stacks service** for contract interactions
3. ✅ **Test vault creation** from frontend
4. ✅ **Integrate AI advisor** with on-chain data
5. ✅ **Deploy to mainnet** (when ready)

---

## 🔐 Security Reminders

- ⚠️ **NEVER** commit `.env` file or private keys to git
- ⚠️ **NEVER** share your private key
- ✅ **ALWAYS** test on testnet first
- ✅ **ALWAYS** verify transactions on explorer
- ✅ Keep backup of deployment JSON files

---

## 📞 Support Resources

- **Stacks Discord**: https://discord.gg/stacks
- **Hiro Documentation**: https://docs.hiro.so/
- **Clarity Reference**: https://docs.stacks.co/clarity/
- **Stacks Forum**: https://forum.stacks.org/

---

**🎉 Ready to deploy! Follow the steps above and you'll have your contracts live on Stacks testnet in ~10 minutes.**

Good luck, Kabir! 🚀

