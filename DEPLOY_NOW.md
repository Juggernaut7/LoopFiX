# 🚀 DEPLOY NOW - Copy & Paste Commands

## ⚡ Everything is ready! Just run these commands:

---

## 📋 STEP 1: Get Testnet STX

**Go to:** https://explorer.hiro.so/sandbox/faucet?chain=testnet

1. Connect your wallet
2. Click "Request STX"
3. Wait 10 minutes for confirmation

---

## 📋 STEP 2: Get Your Private Key

**From your wallet:**
- Hiro: Settings → View Secret Key
- Xverse: Settings → Show Secret Key
- Leather: Settings → View Secret Key

Copy the 64-character hex string.

---

## 🚀 STEP 3: Deploy Contracts

### **Open PowerShell and run:**

```powershell
# Navigate to contracts folder
cd C:\Users\HP\Desktop\LoopFi\contracts

# Install dependencies (first time only)
npm install

# Set your private key (replace with YOUR actual key)
$env:STACKS_PRIVATE_KEY = "paste_your_64_character_hex_key_here"

# Deploy!
node deploy.js testnet
```

---

## ⏱️ Wait ~2 minutes

The script will:
1. Deploy savings-vault contract (30 seconds)
2. Wait 30 seconds
3. Deploy group-vault contract (30 seconds)
4. Wait 30 seconds
5. Deploy advisor-nft contract (30 seconds)
6. Save deployment info to JSON file

---

## 📝 STEP 4: Save Contract Addresses

After deployment, you'll see output like:

```
✅ Successfully deployed: 3/3

Successful deployments:
   - savings-vault: 0xabcd1234...
   - group-vault: 0xefgh5678...
   - advisor-nft: 0xijkl9012...

📝 Deployment info saved to: deployment-testnet-1728395840000.json
```

**Open that JSON file** and find your contract addresses. They look like:
```
ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.savings-vault
```

---

## 🔧 STEP 5: Update Backend Config

**Open:** `backend/.env`

**Add these lines** (replace with YOUR contract addresses):

```env
# Smart Contract Addresses (from deployment)
SAVINGS_VAULT_CONTRACT=ST1ABC...XYZ.savings-vault
GROUP_VAULT_CONTRACT=ST1ABC...XYZ.group-vault
ADVISOR_NFT_CONTRACT=ST1ABC...XYZ.advisor-nft

# Stacks Network
STACKS_NETWORK=testnet
STACKS_API_URL=https://stacks-node-api.testnet.stacks.co
```

---

## 🔧 STEP 6: Create Frontend Config

**Create file:** `frontend/.env.local`

**Add these lines** (replace with YOUR contract addresses):

```env
# API
VITE_API_URL=http://localhost:4000

# Stacks Network
VITE_STACKS_NETWORK=testnet
VITE_STACKS_API_URL=https://stacks-node-api.testnet.stacks.co

# Smart Contract Addresses (from deployment)
VITE_SAVINGS_VAULT_CONTRACT=ST1ABC...XYZ.savings-vault
VITE_GROUP_VAULT_CONTRACT=ST1ABC...XYZ.group-vault
VITE_ADVISOR_NFT_CONTRACT=ST1ABC...XYZ.advisor-nft

# App
VITE_APP_NAME=LoopFiX
VITE_APP_URL=http://localhost:5173
```

---

## 🔄 STEP 7: Restart Servers

### **Terminal 1 - Backend:**
```powershell
cd C:\Users\HP\Desktop\LoopFi\backend
npm run dev
```

### **Terminal 2 - Frontend:**
```powershell
cd C:\Users\HP\Desktop\LoopFi\frontend
npm run dev
```

---

## ✅ STEP 8: Test It!

1. **Open browser:** http://localhost:5173
2. **Click "Connect Wallet"**
3. **Approve connection**
4. **Go to Dashboard**
5. **Should see:**
   - ✅ Your real STX balance
   - ✅ Transaction history
   - ✅ Working buttons

---

## 🎉 YOU'RE DONE!

Your app is now:
- ✅ Connected to Stacks blockchain
- ✅ Using real smart contracts
- ✅ Showing real on-chain data
- ✅ Ready for users!

---

## 📊 What You Can Do Now:

1. **Create a vault** - Test vault creation
2. **Deposit STX** - Try depositing to vault
3. **Check transactions** - View on Stacks Explorer
4. **Join a group** - Test group functionality
5. **Earn badges** - Mint milestone NFTs

---

## 🐛 If Something Goes Wrong:

### **Deployment Failed?**
```powershell
# Check you have testnet STX
# Verify private key is correct
# Wait 30 seconds and try again
```

### **Backend Won't Start?**
```powershell
# Check MongoDB is running
# Verify .env file exists
# Check port 4000 is free
```

### **Frontend Won't Connect?**
```powershell
# Check .env.local exists
# Verify contract addresses are correct
# Clear browser cache
# Restart frontend server
```

### **Wallet Won't Connect?**
```
1. Check wallet extension is installed
2. Make sure you're on testnet
3. Refresh the page
4. Try a different browser
```

---

## 📞 Helpful Links:

- **Testnet Faucet:** https://explorer.hiro.so/sandbox/faucet?chain=testnet
- **Testnet Explorer:** https://explorer.hiro.so/?chain=testnet
- **Check Transaction:** https://explorer.hiro.so/txid/[YOUR_TX_ID]?chain=testnet
- **Stacks Docs:** https://docs.stacks.co/
- **Hiro Docs:** https://docs.hiro.so/

---

## ⏱️ Total Time: ~15 minutes

- 10 minutes: Wait for faucet
- 2 minutes: Deploy contracts
- 3 minutes: Update config & restart

---

## 🎯 Quick Checklist:

- [ ] Got testnet STX
- [ ] Got private key
- [ ] Ran deployment script
- [ ] Saved deployment JSON
- [ ] Updated backend/.env
- [ ] Created frontend/.env.local
- [ ] Restarted both servers
- [ ] Tested wallet connection
- [ ] Created a test vault

---

**🚀 LET'S DEPLOY! 🚀**

Copy the commands above and paste into PowerShell. That's it!

---

*Need help? Check the detailed guides:*
- *QUICK_START_DEPLOYMENT.md*
- *CONTRACTS_DEPLOYMENT_GUIDE.md*
- *DEPLOYMENT_READY_SUMMARY.md*

