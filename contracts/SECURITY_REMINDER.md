# 🔐 SECURITY REMINDER

## ⚠️ IMPORTANT: Protect Your Private Keys!

### Files that contain sensitive information:

1. **`.env`** - Contains your private key
   - ❌ **NEVER commit this to git**
   - ❌ **NEVER share this file**
   - ✅ Already added to `.gitignore`

### Before committing to GitHub:

```bash
# Make sure .env is not tracked
git status

# If .env appears, remove it:
git rm --cached .env
```

### To get your correct private key:

**Option 1: From Hiro Wallet:**
1. Open Hiro Wallet
2. Settings → View Secret Key
3. Look for "Private Key" (64-character hex string)

**Option 2: From Xverse:**
1. Settings → Show Secret Key
2. Export Private Key

**Option 3: Ask in Stacks Discord:**
- https://discord.gg/stacks
- Ask: "How to export private key from [your wallet name]"

### Deployment Issue:

The current deployment error is due to contract file encoding issues, NOT your private key.
The private key works fine (you have 400 STX in the wallet).

We need to fix the Clarity contract deployment method.

---

**Stay safe! 🔒**

