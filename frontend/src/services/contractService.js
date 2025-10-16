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
import { STACKS_TESTNET, STACKS_MAINNET } from '@stacks/network';

class ContractService {
  constructor() {
    // Use testnet for now - mainnet support can be added later
    this.network = STACKS_TESTNET;
    
    // Debug environment variables
    console.log('🔍 Environment Variables Debug:', {
      VITE_STACKS_CONTRACT_ADDRESS_SAVINGS_VAULT: import.meta.env.VITE_STACKS_CONTRACT_ADDRESS_SAVINGS_VAULT,
      VITE_STACKS_CONTRACT_ADDRESS_GROUP_VAULT: import.meta.env.VITE_STACKS_CONTRACT_ADDRESS_GROUP_VAULT,
      VITE_STACKS_CONTRACT_ADDRESS_ADVISOR_NFT: import.meta.env.VITE_STACKS_CONTRACT_ADDRESS_ADVISOR_NFT
    });
    
    // Contract addresses from environment - contracts are now deployed!
    this.contracts = {
      savingsVault: import.meta.env.VITE_STACKS_CONTRACT_ADDRESS_SAVINGS_VAULT || 'ST781EDA6M5Z97NN7RF5Y1NMWTKD5SWWSB6EZ1KW.SavingsVault',
      groupVault: import.meta.env.VITE_STACKS_CONTRACT_ADDRESS_GROUP_VAULT || 'ST781EDA6M5Z97NN7RF5Y1NMWTKD5SWWSB6EZ1KW.GroupVault',
      advisorNFT: import.meta.env.VITE_STACKS_CONTRACT_ADDRESS_ADVISOR_NFT || 'ST781EDA6M5Z97NN7RF5Y1NMWTKD5SWWSB6EZ1KW.AdvisorNFT',
      stakingVault: import.meta.env.VITE_STACKS_CONTRACT_ADDRESS_STAKING_VAULT || 'ST781EDA6M5Z97NN7RF5Y1NMWTKD5SWWSB6EZ1KW.Staking-Vault'
    };

    console.log('🔗 Contract Service initialized');
    console.log('   Network:', this.network);
    console.log('   Savings Vault:', this.contracts.savingsVault || 'Not deployed');
    console.log('   Group Vault:', this.contracts.groupVault || 'Not deployed');
    console.log('   Advisor NFT:', this.contracts.advisorNFT || 'Not deployed');
    console.log('   Staking Vault:', this.contracts.stakingVault || 'Not deployed');
  }

  // ==================== SavingsVault Contract ====================

  /**
   * Create a new savings vault
   * @param {number} targetAmount - Target amount in microSTX
   * @returns {Promise<string>} Transaction ID
   */
  async createVault(targetAmount) {
    if (!this.contracts.savingsVault) {
      throw new Error('Savings vault contract not deployed yet');
    }

    // Validate contract address format
    if (!this.contracts.savingsVault.includes('.')) {
      throw new Error('Invalid contract address format');
    }

    const [contractAddress, contractName] = this.contracts.savingsVault.split('.');
    
    // Validate arguments
    if (!targetAmount || targetAmount <= 0) {
      throw new Error('Invalid target amount');
    }
    
    // Ensure values are within reasonable bounds to prevent wallet crashes
    if (targetAmount > 1000000000000) { // 1M STX max
      throw new Error('Target amount too large');
    }
    
    // Create properly typed arguments using Stacks.js CV functions
    // Contract expects: (define-public (create-vault (target-amount uint)))
    const functionArgs = [
      uintCV(Math.floor(targetAmount)) // targetAmount is already in microSTX
    ];

    // Debug logging with proper serialization
    console.log('🔍 Contract Call Debug:', {
      contractAddress,
      contractName,
      functionName: 'create-vault',
      functionArgs: functionArgs.map(arg => ({
        type: arg.type,
        value: arg.value.toString()
      })),
      network: this.network
    });

    // Use a Promise to capture the result from onFinish
    return new Promise((resolve, reject) => {
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
          // Resolve with the transaction data
          resolve(data);
        },
        onCancel: () => {
          console.log('❌ Vault creation cancelled');
          reject(new Error('Transaction cancelled'));
        }
      };

      console.log('🚀 Calling openContractCall with options:', options);
      openContractCall(options).catch(reject);
    });
  }

  /**
   * Deposit to a vault
   * @param {number} vaultId - Vault ID
   * @param {number} amount - Amount in microSTX
   * @returns {Promise<string>} Transaction ID
   */
  async deposit(vaultId, amount) {
    if (!this.contracts.savingsVault) {
      throw new Error('Savings vault contract not deployed yet');
    }

    const [contractAddress, contractName] = this.contracts.savingsVault.split('.');
    
    const functionArgs = [
      uintCV(parseInt(vaultId)), // Ensure vaultId is a number
      uintCV(parseInt(amount)) // Ensure amount is a number
    ];

    // Use a Promise to capture the result from onFinish
    return new Promise((resolve, reject) => {
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
          // Resolve with the transaction data
          resolve(data);
        },
        onCancel: () => {
          console.log('❌ Deposit cancelled');
          reject(new Error('Transaction cancelled'));
        }
      };

      openContractCall(options).catch(reject);
    });
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
   * @param {number} targetAmount - Target amount in microSTX
   * @returns {Promise<string>} Transaction ID
   */
  async createGroup(groupName, targetAmount) {
    if (!this.contracts.groupVault) {
      throw new Error('Group vault contract not deployed yet');
    }

    const [contractAddress, contractName] = this.contracts.groupVault.split('.');
    
    // Contract expects: (define-public (create-group (group-name (string-ascii 50)) (target-amount uint)))
    const functionArgs = [
      stringAsciiCV(groupName.substring(0, 50)), // Max 50 chars
      uintCV(Math.floor(targetAmount)) // targetAmount is already in microSTX
    ];

    // Use a Promise to capture the result from onFinish
    return new Promise((resolve, reject) => {
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
          // Resolve with the transaction data
          resolve(data);
        },
        onCancel: () => {
          console.log('❌ Group creation cancelled');
          reject(new Error('Transaction cancelled'));
        }
      };

      openContractCall(options).catch(reject);
    });
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
    
    // Convert MongoDB ObjectId to numeric group ID for contract
    let numericGroupId;
    if (typeof groupId === 'string' && groupId.length === 24) {
      // This is a MongoDB ObjectId, convert to numeric
      numericGroupId = parseInt(groupId.substring(0, 8), 16);
    } else {
      // Assume it's already numeric
      numericGroupId = parseInt(groupId);
    }
    
    const functionArgs = [uintCV(numericGroupId)];

    // Use a Promise to capture the result from onFinish
    return new Promise((resolve, reject) => {
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
          // Resolve with the transaction data
          resolve(data);
        },
        onCancel: () => {
          console.log('❌ Join group cancelled');
          reject(new Error('Transaction cancelled'));
        }
      };

      openContractCall(options).catch(reject);
    });
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
    
    // Convert MongoDB ObjectId to numeric group ID for contract
    // Use a simple hash of the ObjectId string to create a numeric ID
    let numericGroupId;
    if (typeof groupId === 'string' && groupId.length === 24) {
      // This is a MongoDB ObjectId, convert to numeric
      numericGroupId = parseInt(groupId.substring(0, 8), 16);
    } else {
      // Assume it's already numeric
      numericGroupId = parseInt(groupId);
    }
    
    const functionArgs = [
      uintCV(numericGroupId),
      uintCV(Math.floor(amount * 1000000))
    ];

    // Use a Promise to capture the result from onFinish
    return new Promise((resolve, reject) => {
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
          // Resolve with the transaction data
          resolve(data);
        },
        onCancel: () => {
          console.log('❌ Contribution cancelled');
          reject(new Error('Transaction cancelled'));
        }
      };

      openContractCall(options).catch(reject);
    });
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

  // ==================== Wrapper Methods for Goals Page ====================

  /**
   * Create a savings vault (wrapper for createVault)
   */
  async createSavingsVault(targetAmount, targetBlockHeight, feeAmount) {
    try {
      // Check if contracts are deployed
      if (!this.contracts.savingsVault) {
        console.warn('⚠️ Contract not deployed yet, using mock transaction');
        return { 
          success: true, 
          txId: 'mock-tx-' + Date.now(),
          mock: true 
        };
      }
      
      // Now try real contract call with corrected signature
      console.log('🚀 Attempting real contract call with corrected signature');
      const txResult = await this.createVault(targetAmount);
      console.log('📋 Transaction result:', txResult);
      
      // Guard check to ensure we have a valid result
      if (!txResult) {
        throw new Error('Vault creation failed: No result returned from contract call');
      }
      
      if (!txResult.txId) {
        console.warn('⚠️ Transaction result missing txId:', txResult);
        throw new Error('Vault creation failed: txId not found in result');
      }
      
      console.log('✅ Vault created successfully with txId:', txResult.txId);
      return { success: true, txId: txResult.txId };
    } catch (error) {
      console.error('Error creating savings vault:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Deposit to savings vault (wrapper for deposit)
   */
  async depositToSavingsVault(vaultId, amount) {
    try {
      const txId = await this.deposit(vaultId, amount);
      return { success: true, txId };
    } catch (error) {
      console.error('Error depositing to savings vault:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Join a group vault (wrapper for joinGroup)
   */
  async joinGroupVault(groupId) {
    try {
      const txId = await this.joinGroup(groupId);
      return { success: true, txId };
    } catch (error) {
      console.error('Error joining group vault:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Contribute to a group vault (wrapper for contribute)
   */
  async contributeToGroupVault(groupId, amount) {
    try {
      const txResult = await this.contribute(groupId, amount);
      return { success: true, txId: txResult.txId || txResult };
    } catch (error) {
      console.error('Error contributing to group vault:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Create a group vault (wrapper for createGroup)
   */
  async createGroupVault(groupName, targetAmount, targetBlockHeight) {
    try {
      // Check if contracts are deployed
      if (!this.contracts.groupVault) {
        console.warn('⚠️ Group contract not deployed yet, using mock transaction');
        return { 
          success: true, 
          txId: 'mock-group-tx-' + Date.now(),
          mock: true 
        };
      }
      
      // Now try real contract call with corrected signature
      console.log('🚀 Attempting real group contract call with corrected signature');
      const txResult = await this.createGroup(groupName, targetAmount);
      console.log('📋 Group transaction result:', txResult);
      
      // Guard check to ensure we have a valid result
      if (!txResult) {
        throw new Error('Group creation failed: No result returned from contract call');
      }
      
      if (!txResult.txId) {
        console.warn('⚠️ Group transaction result missing txId:', txResult);
        throw new Error('Group creation failed: txId not found in result');
      }
      
      console.log('✅ Group created successfully with txId:', txResult.txId);
      return { success: true, txId: txResult.txId };
    } catch (error) {
      console.error('Error creating group vault:', error);
      return { success: false, error: error.message };
    }
  }

  // ==================== Staking Contract ====================

  /**
   * Create a new staking pool
   * @param {string} poolName - Pool name
   * @param {number} apy - APY percentage (e.g., 150 for 1.5%)
   * @param {number} minStake - Minimum stake in microSTX
   * @param {number} maxStake - Maximum stake in microSTX
   * @returns {Promise<string>} Transaction ID
   */
  async createPool(poolName, apy, minStake, maxStake) {
    if (!this.contracts.stakingVault) {
      throw new Error('Staking contract not deployed yet');
    }

    const [contractAddress, contractName] = this.contracts.stakingVault.split('.');
    
    const functionArgs = [
      stringAsciiCV(poolName),
      uintCV(parseInt(apy)),
      uintCV(parseInt(minStake)),
      uintCV(parseInt(maxStake))
    ];

    return new Promise((resolve, reject) => {
      const options = {
        network: this.network,
        contractAddress,
        contractName,
        functionName: 'create-pool',
        functionArgs,
        appDetails: {
          name: 'LoopFiX',
          icon: window.location.origin + '/logo.png'
        },
        onFinish: (data) => {
          console.log('✅ Pool created:', data);
          resolve(data);
        },
        onCancel: () => {
          console.log('❌ Pool creation cancelled');
          reject(new Error('Transaction cancelled'));
        }
      };
      console.log('🚀 Creating pool with options:', options);
      openContractCall(options).catch(reject);
    });
  }

  /**
   * Stake STX tokens in a staking pool
   * @param {number} poolId - Pool ID
   * @param {number} amount - Amount to stake in microSTX
   * @param {number} lockPeriod - Lock period in blocks
   * @returns {Promise<string>} Transaction ID
   */
  async stakeSTX(poolId, amount, lockPeriod) {
    if (!this.contracts.stakingVault) {
      throw new Error('Staking contract not deployed yet');
    }

    const [contractAddress, contractName] = this.contracts.stakingVault.split('.');
    
    const functionArgs = [
      uintCV(parseInt(poolId)),
      uintCV(parseInt(amount))
    ];

    // Use a Promise to capture the result from onFinish
    return new Promise((resolve, reject) => {
      const options = {
        network: this.network,
        contractAddress,
        contractName,
        functionName: 'stake-stx',
        functionArgs,
        appDetails: {
          name: 'LoopFiX',
          icon: window.location.origin + '/logo.png'
        },
        onFinish: (data) => {
          console.log('✅ STX staked:', data);
          resolve(data);
        },
        onCancel: () => {
          console.log('❌ STX staking cancelled');
          reject(new Error('Transaction cancelled'));
        }
      };
      console.log('🚀 Calling openContractCall with options:', options);
      openContractCall(options).catch(reject);
    });
  }

  /**
   * Unstake STX tokens from a staking pool
   * @param {number} stakeId - Stake ID
   * @returns {Promise<string>} Transaction ID
   */
  async unstakeSTX(stakeId) {
    if (!this.contracts.stakingVault) {
      throw new Error('Staking contract not deployed yet');
    }

    const [contractAddress, contractName] = this.contracts.stakingVault.split('.');
    
    const functionArgs = [uintCV(parseInt(stakeId))];

    // Use a Promise to capture the result from onFinish
    return new Promise((resolve, reject) => {
      const options = {
        network: this.network,
        contractAddress,
        contractName,
        functionName: 'unstake-stx',
        functionArgs,
        appDetails: {
          name: 'LoopFiX',
          icon: window.location.origin + '/logo.png'
        },
        onFinish: (data) => {
          console.log('✅ STX unstaked:', data);
          resolve(data);
        },
        onCancel: () => {
          console.log('❌ STX unstaking cancelled');
          reject(new Error('Transaction cancelled'));
        }
      };
      console.log('🚀 Calling openContractCall with options:', options);
      openContractCall(options).catch(reject);
    });
  }

  /**
   * Claim staking rewards
   * @param {number} stakeId - Stake ID
   * @returns {Promise<string>} Transaction ID
   */
  async claimRewards(stakeId) {
    if (!this.contracts.stakingVault) {
      throw new Error('Staking contract not deployed yet');
    }

    const [contractAddress, contractName] = this.contracts.stakingVault.split('.');
    
    const functionArgs = [uintCV(parseInt(stakeId))];

    // Use a Promise to capture the result from onFinish
    return new Promise((resolve, reject) => {
      const options = {
        network: this.network,
        contractAddress,
        contractName,
        functionName: 'claim-rewards',
        functionArgs,
        appDetails: {
          name: 'LoopFiX',
          icon: window.location.origin + '/logo.png'
        },
        onFinish: (data) => {
          console.log('✅ Rewards claimed:', data);
          resolve(data);
        },
        onCancel: () => {
          console.log('❌ Reward claiming cancelled');
          reject(new Error('Transaction cancelled'));
        }
      };
      console.log('🚀 Calling openContractCall with options:', options);
      openContractCall(options).catch(reject);
    });
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

