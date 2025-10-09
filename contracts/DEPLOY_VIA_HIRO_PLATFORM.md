# 🚀 Deploy Contracts via Hiro Platform (Web Interface)

## ✅ Easy Deployment - No Command Line Needed!

---

## 📋 **Step 1: Go to Hiro Platform**

👉 **https://platform.hiro.so/**

1. Click **"Sign In"** or **"Get Started"**
2. Connect your Stacks wallet (the one with 400 STX)
3. Make sure you're on **Testnet** (check top-right corner)

---

## 📋 **Step 2: Create a New Project**

1. Click **"New Project"** or **"Create Project"**
2. Name it: `LoopFiX` or `loopfix-contracts`
3. Select **"Testnet"** as the network

---

## 📋 **Step 3: Upload Contract Files**

You need to upload these 3 files from your `contracts` folder:

### **File 1: SavingsVault.clar**
- Click **"Add Contract"** or **"Upload Contract"**
- Name: `savingsvault` (no dashes!)
- Upload: `C:\Users\HP\Desktop\LoopFi\contracts\SavingsVault.clar`

### **File 2: GroupVault.clar**
- Click **"Add Contract"** again
- Name: `groupvault`
- Upload: `C:\Users\HP\Desktop\LoopFi\contracts\GroupVault.clar`

### **File 3: AdvisorNFT.clar**
- Click **"Add Contract"** again
- Name: `advisornft`
- Upload: `C:\Users\HP\Desktop\LoopFi\contracts\AdvisorNFT.clar`

---

## 📋 **Step 4: Deploy Each Contract**

For each contract:

1. Click on the contract name
2. Review the code (should look correct)
3. Click **"Deploy Contract"** button
4. **Wallet popup will appear** - Approve the transaction
5. Wait for confirmation (2-3 minutes)
6. **SAVE THE CONTRACT ADDRESS!** (looks like `ST3B7P4...XYZ.savingsvault`)

**Important:** Deploy them one at a time:
1. Deploy `savingsvault` first → wait for confirmation
2. Then deploy `groupvault` → wait for confirmation
3. Finally deploy `advisornft` → wait for confirmation

---

## 📋 **Step 5: Save Contract Addresses**

After each deployment, you'll see the contract address. **Write them down!**

Example:
```
ST3B7P4ARCWT0RTNF369N3BA1NTKPZVDSF9763K3Q.savingsvault
ST3B7P4ARCWT0RTNF369N3BA1NTKPZVDSF9763K3Q.groupvault
ST3B7P4ARCWT0RTNF369N3BA1NTKPZVDSF9763K3Q.advisornft
```

---

## 📋 **Step 6: Update Your Environment Files**

### **Backend `.env`** (`backend/.env`)

Add these lines:
```env
# Smart Contract Addresses (replace with YOUR addresses)
SAVINGS_VAULT_CONTRACT=ST3B7P4ARCWT0RTNF369N3BA1NTKPZVDSF9763K3Q.savingsvault
GROUP_VAULT_CONTRACT=ST3B7P4ARCWT0RTNF369N3BA1NTKPZVDSF9763K3Q.groupvault
ADVISOR_NFT_CONTRACT=ST3B7P4ARCWT0RTNF369N3BA1NTKPZVDSF9763K3Q.advisornft

# Stacks Network
STACKS_NETWORK=testnet
STACKS_API_URL=https://api.testnet.hiro.so
```

### **Frontend `.env.local`** (`frontend/.env.local`)

Create this file with:
```env
# API
VITE_API_URL=http://localhost:4000

# Stacks Network
VITE_STACKS_NETWORK=testnet
VITE_STACKS_API_URL=https://api.testnet.hiro.so

# Smart Contract Addresses (replace with YOUR addresses)
VITE_SAVINGS_VAULT_CONTRACT=ST3B7P4ARCWT0RTNF369N3BA1NTKPZVDSF9763K3Q.savingsvault
VITE_GROUP_VAULT_CONTRACT=ST3B7P4ARCWT0RTNF369N3BA1NTKPZVDSF9763K3Q.groupvault
VITE_ADVISOR_NFT_CONTRACT=ST3B7P4ARCWT0RTNF369N3BA1NTKPZVDSF9763K3Q.advisornft

# App
VITE_APP_NAME=LoopFiX
VITE_APP_URL=http://localhost:5173
```

---

## 📋 **Step 7: Restart Your Servers**

### Terminal 1 - Backend:
```powershell
cd C:\Users\HP\Desktop\LoopFi\backend
npm run dev
```

### Terminal 2 - Frontend:
```powershell
cd C:\Users\HP\Desktop\LoopFi\frontend
npm run dev
```

---

## 📋 **Step 8: Test the Integration**

1. Open: http://localhost:5173
2. Connect your wallet
3. Go to Dashboard
4. Try creating a vault
5. Wallet popup should appear for contract interaction
6. Approve and check transaction on Stacks Explorer

---

## 🔗 **Verify on Stacks Explorer**

After each deployment, verify on Explorer:

```
https://explorer.hiro.so/txid/[TRANSACTION_ID]?chain=testnet
```

Or check your contract:
```
https://explorer.hiro.so/address/ST3B7P4ARCWT0RTNF369N3BA1NTKPZVDSF9763K3Q?chain=testnet
```

---

## 💡 **Troubleshooting**

### **"Contract name already exists"**
- Change the contract name slightly (e.g., `savingsvault2`)
- Or use a different wallet address

### **"Insufficient funds"**
- You have 400 STX, which is plenty
- Make sure you're on testnet
- Try refreshing the page

### **"Transaction failed"**
- Wait a few minutes and try again
- Check Stacks Explorer for error details
- Contract might have a syntax issue (unlikely)

---

## 🎉 **You're Done!**

Once all 3 contracts are deployed and your `.env` files are updated:
- Your app will use real smart contracts
- All data will be on-chain
- Users can create vaults, deposit, withdraw, earn yield
- NFT badges will be minted for milestones

---

**Good luck! 🚀**

If you run into issues, share the transaction ID and I can help debug!

