# ⚡ Quick Start: Deploy LoopFiX Contracts

## 🎯 5-Minute Deployment Guide

### **What You Need:**
1. Stacks wallet (Hiro/Xverse/Leather)
2. Your wallet's private key
3. Testnet STX (~0.5 STX for gas)

---

## 📋 Pre-Deployment Checklist

### **Step 1: Get Testnet STX** (10 minutes)
```
1. Go to: https://explorer.hiro.so/sandbox/faucet?chain=testnet
2. Connect your wallet
3. Click "Request STX"
4. Wait for confirmation (check wallet)
```

### **Step 2: Get Your Private Key**
```
Hiro Wallet: Settings → View Secret Key
Xverse: Settings → Show Secret Key
Leather: Settings → View Secret Key
```

⚠️ **Your private key is a 64-character hexadecimal string**
Example: `a1b2c3d4e5f6...` (keep it secret!)

---

## 🚀 Deployment Commands

### **Windows PowerShell:**

```powershell
# 1. Navigate to contracts folder
cd C:\Users\HP\Desktop\LoopFi\contracts

# 2. Install dependencies (first time only)
npm install

# 3. Set your private key
$env:STACKS_PRIVATE_KEY = "paste_your_64_char_private_key_here"

# 4. Deploy to testnet
node deploy.js testnet
```

### **Mac/Linux:**

```bash
# 1. Navigate to contracts folder
cd ~/Desktop/LoopFi/contracts

# 2. Install dependencies (first time only)
npm install

# 3. Set your private key
export STACKS_PRIVATE_KEY="paste_your_64_char_private_key_here"

# 4. Deploy to testnet
node deploy.js testnet
```

---

## ✅ Expected Output

```
🚀 Deploying to testnet...
📡 Network: https://stacks-node-api.testnet.stacks.co

╔════════════════════════════════════════════════╗
║   LoopFiX Contract Deployment                  ║
╚════════════════════════════════════════════════╝

📄 Deploying Individual Savings Vault (savings-vault)...
✅ Individual Savings Vault deployed!
   Transaction ID: 0xabcd1234...
   Explorer: https://explorer.hiro.so/txid/0xabcd1234...

⏳ Waiting 30 seconds before next deployment...

📄 Deploying Group Savings Vault (group-vault)...
✅ Group Savings Vault deployed!
   Transaction ID: 0xefgh5678...

⏳ Waiting 30 seconds before next deployment...

📄 Deploying Milestone Achievement NFT (advisor-nft)...
✅ Milestone Achievement NFT deployed!
   Transaction ID: 0xijkl9012...

╔════════════════════════════════════════════════╗
║   Deployment Summary                           ║
╚════════════════════════════════════════════════╝

✅ Successfully deployed: 3/3
❌ Failed: 0/3

📝 Deployment info saved to: deployment-testnet-1728395840000.json

🎉 Deployment process complete!
```

---

## 📝 After Deployment

### **1. Save the Deployment JSON File**

Look for: `deployment-testnet-[timestamp].json`

This contains:
- Transaction IDs
- Contract addresses
- Timestamps

**DON'T LOSE THIS FILE!**

---

### **2. Update Backend `.env`**

Open `backend/.env` and add:

```env
# Replace with YOUR contract addresses from deployment JSON
SAVINGS_VAULT_CONTRACT=ST1ABC...XYZ.savings-vault
GROUP_VAULT_CONTRACT=ST1ABC...XYZ.group-vault
ADVISOR_NFT_CONTRACT=ST1ABC...XYZ.advisor-nft

STACKS_NETWORK=testnet
STACKS_API_URL=https://stacks-node-api.testnet.stacks.co
```

**How to get addresses:**
1. Open the deployment JSON file
2. Find each transaction ID
3. Go to explorer: `https://explorer.hiro.so/txid/[TX_ID]?chain=testnet`
4. Copy contract address from explorer

---

### **3. Update Frontend `.env.local`**

Create `frontend/.env.local`:

```env
VITE_API_URL=http://localhost:4000
VITE_STACKS_NETWORK=testnet
VITE_STACKS_API_URL=https://stacks-node-api.testnet.stacks.co

# Replace with YOUR contract addresses
VITE_SAVINGS_VAULT_CONTRACT=ST1ABC...XYZ.savings-vault
VITE_GROUP_VAULT_CONTRACT=ST1ABC...XYZ.group-vault
VITE_ADVISOR_NFT_CONTRACT=ST1ABC...XYZ.advisor-nft

VITE_APP_NAME=LoopFiX
VITE_APP_URL=http://localhost:5173
```

---

### **4. Restart Your Servers**

```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd frontend
npm run dev
```

---

## 🎯 Test Your Deployment

### **1. Check Contract on Explorer**

```
1. Copy any transaction ID from deployment output
2. Go to: https://explorer.hiro.so/txid/[TX_ID]?chain=testnet
3. Should see "Success" status
4. Contract address should be visible
```

### **2. Test Frontend Connection**

```
1. Go to: http://localhost:5173
2. Click "Connect Wallet"
3. Approve connection
4. Should see your wallet address
5. Dashboard should show real STX balance
```

### **3. Test Contract Interaction**

```
1. Go to Dashboard
2. Try creating a vault
3. Wallet popup should appear
4. Approve transaction
5. Check transaction on Stacks Explorer
```

---

## 🐛 Common Issues & Fixes

### **Error: "Private key is required"**
```powershell
# Make sure you set the environment variable
$env:STACKS_PRIVATE_KEY = "your_key_here"
```

### **Error: "Insufficient balance"**
```
1. Go to faucet: https://explorer.hiro.so/sandbox/faucet?chain=testnet
2. Request more STX
3. Wait 10 minutes
4. Try again
```

### **Error: "Contract name already exists"**
```
This means you already deployed!
1. Check the previous deployment JSON file
2. Use those contract addresses
3. Or change contract names in deploy.js
```

### **Backend won't start**
```bash
# Make sure MongoDB is running
# Check if port 4000 is available
# Check .env file exists with correct values
```

### **Frontend can't connect to contracts**
```
1. Check .env.local file exists
2. Verify contract addresses are correct
3. Restart frontend server
4. Clear browser cache
```

---

## 📋 Deployment Checklist

- [ ] Got testnet STX
- [ ] Got private key
- [ ] Installed npm dependencies
- [ ] Set STACKS_PRIVATE_KEY environment variable
- [ ] Ran `node deploy.js testnet`
- [ ] Saved deployment JSON file
- [ ] Updated `backend/.env`
- [ ] Created `frontend/.env.local`
- [ ] Restarted both servers
- [ ] Tested wallet connection
- [ ] Tested contract interaction

---

## 🎉 You're Done!

Once all checkboxes are ✅, you have:

- ✨ 3 smart contracts deployed on Stacks testnet
- ✨ Backend integrated with blockchain
- ✨ Frontend ready for contract interactions
- ✨ Real on-chain data flowing through your app

---

## 📞 Need Help?

**If something isn't working:**

1. Check the deployment JSON file
2. Verify contract addresses in .env files
3. Make sure servers are restarted
4. Check browser console for errors
5. Check Stacks Explorer for transaction status

**Resources:**
- Stacks Discord: https://discord.gg/stacks
- Testnet Explorer: https://explorer.hiro.so/?chain=testnet
- Hiro Docs: https://docs.hiro.so/

---

**⚡ Total Time: ~10 minutes (including faucet wait time)**

**🚀 Ready to deploy? Let's go!** 🚀

