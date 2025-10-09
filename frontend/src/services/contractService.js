// Frontend service for smart contract interactions
// Handles contract calls for vault creation, deposits, withdrawals, etc.

import {
  makeContractCall,
  makeContractDeploy,
  broadcastTransaction,
  AnchorMode,
  PostConditionMode,
  uintCV,
  stringAsciiCV,
  principalCV,
  standardPrincipalCV
} from '@stacks/transactions';
import { openContractCall } from '@stacks/connect';
import { StacksTestnet, StacksMainnet } from '@stacks/network';

class ContractService {
  constructor() {
    this.network = import.meta.env.VITE_STACKS_NETWORK === 'mainnet' 
      ? new StacksMainnet()
      : new StacksTestnet();
    
    // Contract addresses (will be set after deployment)
    this.contracts = {
      savingsVault: import.meta.env.VITE_SAVINGS_VAULT_CONTRACT || null,
      groupVault: import.meta.env.VITE_GROUP_VAULT_CONTRACT || null,
      advisorNFT: import.meta.env.VITE_ADVISOR_NFT_CONTRACT || null
    };

    console.log('🔗 Contract Service initialized');
    console.log('   Network:', this.network);
    console.log('   Savings Vault:', this.contracts.savingsVault || 'Not deployed');
    console.log('   Group Vault:', this.contracts.groupVault || 'Not deployed');
    console.log('   Advisor NFT:', this.contracts.advisorNFT || 'Not deployed');
  }

  // ==================== SavingsVault Contract ====================

  /**
   * Create a new savings vault
   * @param {number} targetAmount - Target amount in STX
   * @param {number} targetDate - Target date (block height)
   * @returns {Promise<string>} Transaction ID
   */
  async createVault(targetAmount, targetDate) {
    if (!this.contracts.savingsVault) {
      throw new Error('Savings vault contract not deployed yet');
    }

    const [contractAddress, contractName] = this.contracts.savingsVault.split('.');
    
    const functionArgs = [
      uintCV(Math.floor(targetAmount * 1000000)), // Convert STX to microSTX
      uintCV(targetDate)
    ];

    const options = {
      network: this.network,
      contractAddress,
      contractName,
      functionName: 'create-vault',
      functionArgs,
      appDetails: {
        name: 'LoopFiX',
        icon: window.location.origin + '/logo.png'
      },
      onFinish: (data) => {
        console.log('✅ Vault created:', data);
        return data.txId;
      },
      onCancel: () => {
        console.log('❌ Vault creation cancelled');
        throw new Error('Transaction cancelled');
      }
    };

    return await openContractCall(options);
  }

  /**
   * Deposit to a vault
   * @param {number} vaultId - Vault ID
   * @param {number} amount - Amount in STX
   * @returns {Promise<string>} Transaction ID
   */
  async deposit(vaultId, amount) {
    if (!this.contracts.savingsVault) {
      throw new Error('Savings vault contract not deployed yet');
    }

    const [contractAddress, contractName] = this.contracts.savingsVault.split('.');
    
    const functionArgs = [
      uintCV(vaultId),
      uintCV(Math.floor(amount * 1000000)) // Convert STX to microSTX
    ];

    const options = {
      network: this.network,
      contractAddress,
      contractName,
      functionName: 'deposit',
      functionArgs,
      appDetails: {
        name: 'LoopFiX',
        icon: window.location.origin + '/logo.png'
      },
      onFinish: (data) => {
        console.log('✅ Deposit successful:', data);
        return data.txId;
      },
      onCancel: () => {
        console.log('❌ Deposit cancelled');
        throw new Error('Transaction cancelled');
      }
    };

    return await openContractCall(options);
  }

  /**
   * Withdraw from a vault
   * @param {number} vaultId - Vault ID
   * @param {number} amount - Amount in STX
   * @returns {Promise<string>} Transaction ID
   */
  async withdraw(vaultId, amount) {
    if (!this.contracts.savingsVault) {
      throw new Error('Savings vault contract not deployed yet');
    }

    const [contractAddress, contractName] = this.contracts.savingsVault.split('.');
    
    const functionArgs = [
      uintCV(vaultId),
      uintCV(Math.floor(amount * 1000000)) // Convert STX to microSTX
    ];

    const options = {
      network: this.network,
      contractAddress,
      contractName,
      functionName: 'withdraw',
      functionArgs,
      appDetails: {
        name: 'LoopFiX',
        icon: window.location.origin + '/logo.png'
      },
      onFinish: (data) => {
        console.log('✅ Withdrawal successful:', data);
        return data.txId;
      },
      onCancel: () => {
        console.log('❌ Withdrawal cancelled');
        throw new Error('Transaction cancelled');
      }
    };

    return await openContractCall(options);
  }

  /**
   * Stake for yield
   * @param {number} vaultId - Vault ID
   * @param {number} amount - Amount to stake in STX
   * @param {string} strategy - Yield strategy (staking, defi, btc-yield)
   * @returns {Promise<string>} Transaction ID
   */
  async stakeForYield(vaultId, amount, strategy = 'staking') {
    if (!this.contracts.savingsVault) {
      throw new Error('Savings vault contract not deployed yet');
    }

    const [contractAddress, contractName] = this.contracts.savingsVault.split('.');
    
    const functionArgs = [
      uintCV(vaultId),
      uintCV(Math.floor(amount * 1000000)),
      stringAsciiCV(strategy)
    ];

    const options = {
      network: this.network,
      contractAddress,
      contractName,
      functionName: 'stake-for-yield',
      functionArgs,
      appDetails: {
        name: 'LoopFiX',
        icon: window.location.origin + '/logo.png'
      },
      onFinish: (data) => {
        console.log('✅ Staking successful:', data);
        return data.txId;
      },
      onCancel: () => {
        console.log('❌ Staking cancelled');
        throw new Error('Transaction cancelled');
      }
    };

    return await openContractCall(options);
  }

  /**
   * Close a vault
   * @param {number} vaultId - Vault ID
   * @returns {Promise<string>} Transaction ID
   */
  async closeVault(vaultId) {
    if (!this.contracts.savingsVault) {
      throw new Error('Savings vault contract not deployed yet');
    }

    const [contractAddress, contractName] = this.contracts.savingsVault.split('.');
    
    const functionArgs = [uintCV(vaultId)];

    const options = {
      network: this.network,
      contractAddress,
      contractName,
      functionName: 'close-vault',
      functionArgs,
      appDetails: {
        name: 'LoopFiX',
        icon: window.location.origin + '/logo.png'
      },
      onFinish: (data) => {
        console.log('✅ Vault closed:', data);
        return data.txId;
      },
      onCancel: () => {
        console.log('❌ Vault closure cancelled');
        throw new Error('Transaction cancelled');
      }
    };

    return await openContractCall(options);
  }

  // ==================== GroupVault Contract ====================

  /**
   * Create a group vault
   * @param {string} groupName - Name of the group
   * @param {number} targetAmount - Target amount in STX
   * @param {number} targetDate - Target date (block height)
   * @returns {Promise<string>} Transaction ID
   */
  async createGroup(groupName, targetAmount, targetDate) {
    if (!this.contracts.groupVault) {
      throw new Error('Group vault contract not deployed yet');
    }

    const [contractAddress, contractName] = this.contracts.groupVault.split('.');
    
    const functionArgs = [
      stringAsciiCV(groupName.substring(0, 50)), // Max 50 chars
      uintCV(Math.floor(targetAmount * 1000000)),
      uintCV(targetDate)
    ];

    const options = {
      network: this.network,
      contractAddress,
      contractName,
      functionName: 'create-group',
      functionArgs,
      appDetails: {
        name: 'LoopFiX',
        icon: window.location.origin + '/logo.png'
      },
      onFinish: (data) => {
        console.log('✅ Group created:', data);
        return data.txId;
      },
      onCancel: () => {
        console.log('❌ Group creation cancelled');
        throw new Error('Transaction cancelled');
      }
    };

    return await openContractCall(options);
  }

  /**
   * Join a group vault
   * @param {number} groupId - Group ID
   * @returns {Promise<string>} Transaction ID
   */
  async joinGroup(groupId) {
    if (!this.contracts.groupVault) {
      throw new Error('Group vault contract not deployed yet');
    }

    const [contractAddress, contractName] = this.contracts.groupVault.split('.');
    
    const functionArgs = [uintCV(groupId)];

    const options = {
      network: this.network,
      contractAddress,
      contractName,
      functionName: 'join-group',
      functionArgs,
      appDetails: {
        name: 'LoopFiX',
        icon: window.location.origin + '/logo.png'
      },
      onFinish: (data) => {
        console.log('✅ Joined group:', data);
        return data.txId;
      },
      onCancel: () => {
        console.log('❌ Join group cancelled');
        throw new Error('Transaction cancelled');
      }
    };

    return await openContractCall(options);
  }

  /**
   * Contribute to a group vault
   * @param {number} groupId - Group ID
   * @param {number} amount - Amount in STX
   * @returns {Promise<string>} Transaction ID
   */
  async contribute(groupId, amount) {
    if (!this.contracts.groupVault) {
      throw new Error('Group vault contract not deployed yet');
    }

    const [contractAddress, contractName] = this.contracts.groupVault.split('.');
    
    const functionArgs = [
      uintCV(groupId),
      uintCV(Math.floor(amount * 1000000))
    ];

    const options = {
      network: this.network,
      contractAddress,
      contractName,
      functionName: 'contribute',
      functionArgs,
      appDetails: {
        name: 'LoopFiX',
        icon: window.location.origin + '/logo.png'
      },
      onFinish: (data) => {
        console.log('✅ Contribution successful:', data);
        return data.txId;
      },
      onCancel: () => {
        console.log('❌ Contribution cancelled');
        throw new Error('Transaction cancelled');
      }
    };

    return await openContractCall(options);
  }

  // ==================== NFT Contract ====================

  /**
   * Mint a milestone badge
   * @param {number} vaultId - Vault ID that achieved the milestone
   * @param {number} amountSaved - Amount saved in STX
   * @returns {Promise<string>} Transaction ID
   */
  async mintMilestoneBadge(vaultId, amountSaved) {
    if (!this.contracts.advisorNFT) {
      throw new Error('Advisor NFT contract not deployed yet');
    }

    const [contractAddress, contractName] = this.contracts.advisorNFT.split('.');
    
    const functionArgs = [
      uintCV(vaultId),
      uintCV(Math.floor(amountSaved * 1000000))
    ];

    const options = {
      network: this.network,
      contractAddress,
      contractName,
      functionName: 'mint-milestone-badge',
      functionArgs,
      appDetails: {
        name: 'LoopFiX',
        icon: window.location.origin + '/logo.png'
      },
      onFinish: (data) => {
        console.log('✅ Badge minted:', data);
        return data.txId;
      },
      onCancel: () => {
        console.log('❌ Badge minting cancelled');
        throw new Error('Transaction cancelled');
      }
    };

    return await openContractCall(options);
  }

  // ==================== Helper Methods ====================

  /**
   * Check if contracts are deployed
   */
  areContractsDeployed() {
    return {
      savingsVault: !!this.contracts.savingsVault,
      groupVault: !!this.contracts.groupVault,
      advisorNFT: !!this.contracts.advisorNFT
    };
  }

  /**
   * Get contract addresses
   */
  getContractAddresses() {
    return this.contracts;
  }

  /**
   * Update contract addresses (after deployment)
   */
  setContractAddresses(contracts) {
    this.contracts = { ...this.contracts, ...contracts };
    console.log('🔄 Contract addresses updated:', this.contracts);
  }
}

export default new ContractService();

