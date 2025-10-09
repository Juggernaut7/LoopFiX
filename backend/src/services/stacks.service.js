// Stacks Blockchain Service - Interact with deployed smart contracts
// Handles on-chain data fetching and contract calls

const axios = require('axios');

class StacksService {
  constructor() {
    this.network = process.env.STACKS_NETWORK || 'testnet';
    this.apiUrl = process.env.STACKS_API_URL || 'https://stacks-node-api.testnet.stacks.co';
    
    // Contract addresses (set after deployment)
    this.contracts = {
      savingsVault: process.env.SAVINGS_VAULT_CONTRACT || null,
      groupVault: process.env.GROUP_VAULT_CONTRACT || null,
      advisorNFT: process.env.ADVISOR_NFT_CONTRACT || null
    };
    
    console.log('✅ Stacks Service initialized');
    console.log(`   Network: ${this.network}`);
    console.log(`   API URL: ${this.apiUrl}`);
    console.log(`   Savings Vault: ${this.contracts.savingsVault || 'Not deployed yet'}`);
    console.log(`   Group Vault: ${this.contracts.groupVault || 'Not deployed yet'}`);
    console.log(`   Advisor NFT: ${this.contracts.advisorNFT || 'Not deployed yet'}`);
  }

  // ==================== Wallet Operations ====================

  /**
   * Get STX balance for a wallet address
   */
  async getWalletBalance(address) {
    try {
      const response = await axios.get(
        `${this.apiUrl}/extended/v1/address/${address}/balances`
      );
      
      const stxBalance = response.data.stx.balance;
      const stxLocked = response.data.stx.locked;
      
      return {
        balance: parseInt(stxBalance) / 1000000, // Convert microSTX to STX
        locked: parseInt(stxLocked) / 1000000,
        available: (parseInt(stxBalance) - parseInt(stxLocked)) / 1000000
      };
    } catch (error) {
      console.error('❌ Error fetching wallet balance:', error.message);
      throw error;
    }
  }

  /**
   * Get wallet transaction history
   */
  async getWalletTransactions(address, limit = 50) {
    try {
      const response = await axios.get(
        `${this.apiUrl}/extended/v1/address/${address}/transactions`,
        { params: { limit } }
      );
      
      return response.data.results.map(tx => ({
        txId: tx.tx_id,
        type: tx.tx_type,
        status: tx.tx_status,
        amount: tx.stx_sent ? parseInt(tx.stx_sent) / 1000000 : 0,
        fee: parseInt(tx.fee_rate) / 1000000,
        blockHeight: tx.block_height,
        timestamp: tx.burn_block_time,
        sender: tx.sender_address,
        recipient: tx.tx_result?.repr
      }));
    } catch (error) {
      console.error('❌ Error fetching transactions:', error.message);
      throw error;
    }
  }

  // ==================== SavingsVault Operations ====================

  /**
   * Get vault information from contract
   */
  async getVaultInfo(vaultId) {
    try {
      if (!this.contracts.savingsVault) {
        throw new Error('Savings vault contract not deployed yet');
      }

      const [contractAddress, contractName] = this.contracts.savingsVault.split('.');
      
      const response = await axios.post(
        `${this.apiUrl}/v2/contracts/call-read/${contractAddress}/${contractName}/get-vault-info`,
        {
          sender: contractAddress,
          arguments: [`0x${this.numberToHex(vaultId)}`]
        }
      );
      
      return this.parseVaultData(response.data.result);
    } catch (error) {
      console.error('❌ Error fetching vault info:', error.message);
      throw error;
    }
  }

  /**
   * Get vault progress (percentage, yield, etc.)
   */
  async getVaultProgress(vaultId) {
    try {
      if (!this.contracts.savingsVault) {
        throw new Error('Savings vault contract not deployed yet');
      }

      const [contractAddress, contractName] = this.contracts.savingsVault.split('.');
      
      const response = await axios.post(
        `${this.apiUrl}/v2/contracts/call-read/${contractAddress}/${contractName}/get-vault-progress`,
        {
          sender: contractAddress,
          arguments: [`0x${this.numberToHex(vaultId)}`]
        }
      );
      
      return this.parseVaultProgress(response.data.result);
    } catch (error) {
      console.error('❌ Error fetching vault progress:', error.message);
      throw error;
    }
  }

  /**
   * Get total vault statistics
   */
  async getVaultStats() {
    try {
      if (!this.contracts.savingsVault) {
        return {
          totalVaults: 0,
          totalDeposits: 0,
          totalYield: 0
        };
      }

      const [contractAddress, contractName] = this.contracts.savingsVault.split('.');
      
      const response = await axios.post(
        `${this.apiUrl}/v2/contracts/call-read/${contractAddress}/${contractName}/get-total-stats`,
        {
          sender: contractAddress,
          arguments: []
        }
      );
      
      return this.parseVaultStats(response.data.result);
    } catch (error) {
      console.error('❌ Error fetching vault stats:', error.message);
      return {
        totalVaults: 0,
        totalDeposits: 0,
        totalYield: 0
      };
    }
  }

  /**
   * Get yield rates for different strategies
   */
  async getYieldRates() {
    try {
      if (!this.contracts.savingsVault) {
        return {
          stakingApy: 8.5,
          defiApy: 15.7,
          btcYieldApy: 12.3,
          baseYieldRate: 5.0
        };
      }

      const [contractAddress, contractName] = this.contracts.savingsVault.split('.');
      
      const response = await axios.post(
        `${this.apiUrl}/v2/contracts/call-read/${contractAddress}/${contractName}/get-yield-rates`,
        {
          sender: contractAddress,
          arguments: []
        }
      );
      
      return this.parseYieldRates(response.data.result);
    } catch (error) {
      console.error('❌ Error fetching yield rates:', error.message);
      return {
        stakingApy: 8.5,
        defiApy: 15.7,
        btcYieldApy: 12.3,
        baseYieldRate: 5.0
      };
    }
  }

  // ==================== GroupVault Operations ====================

  /**
   * Get group information from contract
   */
  async getGroupInfo(groupId) {
    try {
      if (!this.contracts.groupVault) {
        throw new Error('Group vault contract not deployed yet');
      }

      const [contractAddress, contractName] = this.contracts.groupVault.split('.');
      
      const response = await axios.post(
        `${this.apiUrl}/v2/contracts/call-read/${contractAddress}/${contractName}/get-group-info`,
        {
          sender: contractAddress,
          arguments: [`0x${this.numberToHex(groupId)}`]
        }
      );
      
      return this.parseGroupData(response.data.result);
    } catch (error) {
      console.error('❌ Error fetching group info:', error.message);
      throw error;
    }
  }

  /**
   * Get member information in a group
   */
  async getMemberInfo(groupId, memberAddress) {
    try {
      if (!this.contracts.groupVault) {
        throw new Error('Group vault contract not deployed yet');
      }

      const [contractAddress, contractName] = this.contracts.groupVault.split('.');
      
      const response = await axios.post(
        `${this.apiUrl}/v2/contracts/call-read/${contractAddress}/${contractName}/get-member-info`,
        {
          sender: contractAddress,
          arguments: [
            `0x${this.numberToHex(groupId)}`,
            `0x${this.addressToHex(memberAddress)}`
          ]
        }
      );
      
      return this.parseMemberData(response.data.result);
    } catch (error) {
      console.error('❌ Error fetching member info:', error.message);
      throw error;
    }
  }

  // ==================== NFT Operations ====================

  /**
   * Get user's NFT badges
   */
  async getUserBadges(userAddress) {
    try {
      if (!this.contracts.advisorNFT) {
        return [];
      }

      const [contractAddress, contractName] = this.contracts.advisorNFT.split('.');
      
      const response = await axios.post(
        `${this.apiUrl}/v2/contracts/call-read/${contractAddress}/${contractName}/get-user-badges`,
        {
          sender: contractAddress,
          arguments: [`0x${this.addressToHex(userAddress)}`]
        }
      );
      
      return this.parseBadgeList(response.data.result);
    } catch (error) {
      console.error('❌ Error fetching user badges:', error.message);
      return [];
    }
  }

  /**
   * Get badge metadata
   */
  async getBadgeMetadata(tokenId) {
    try {
      if (!this.contracts.advisorNFT) {
        return null;
      }

      const [contractAddress, contractName] = this.contracts.advisorNFT.split('.');
      
      const response = await axios.post(
        `${this.apiUrl}/v2/contracts/call-read/${contractAddress}/${contractName}/get-badge-metadata`,
        {
          sender: contractAddress,
          arguments: [`0x${this.numberToHex(tokenId)}`]
        }
      );
      
      return this.parseBadgeMetadata(response.data.result);
    } catch (error) {
      console.error('❌ Error fetching badge metadata:', error.message);
      return null;
    }
  }

  // ==================== Helper Functions ====================

  numberToHex(num) {
    return num.toString(16).padStart(32, '0');
  }

  addressToHex(address) {
    // Convert Stacks address to hex representation
    // This is a simplified version - actual implementation depends on address format
    return Buffer.from(address).toString('hex');
  }

  parseVaultData(result) {
    // Parse Clarity tuple into JavaScript object
    // Actual implementation depends on Clarity response format
    return {
      owner: result.owner,
      targetAmount: parseInt(result.target_amount) / 1000000,
      currentAmount: parseInt(result.current_amount) / 1000000,
      yieldEarned: parseInt(result.yield_earned) / 1000000,
      isActive: result.is_active
    };
  }

  parseVaultProgress(result) {
    return {
      progress: parseInt(result.progress),
      targetAmount: parseInt(result.target_amount) / 1000000,
      currentAmount: parseInt(result.current_amount) / 1000000,
      yieldEarned: parseInt(result.yield_earned) / 1000000,
      daysRemaining: parseInt(result.days_remaining)
    };
  }

  parseVaultStats(result) {
    return {
      totalVaults: parseInt(result.total_vaults),
      totalDeposits: parseInt(result.total_deposits) / 1000000,
      totalYield: parseInt(result.total_yield_distributed) / 1000000
    };
  }

  parseYieldRates(result) {
    return {
      stakingApy: parseInt(result.staking_apy) / 100,
      defiApy: parseInt(result.defi_apy) / 100,
      btcYieldApy: parseInt(result.btc_yield_apy) / 100,
      baseYieldRate: parseInt(result.base_yield_rate) / 100
    };
  }

  parseGroupData(result) {
    return {
      creator: result.creator,
      groupName: result.group_name,
      targetAmount: parseInt(result.target_amount) / 1000000,
      currentAmount: parseInt(result.current_amount) / 1000000,
      memberCount: parseInt(result.member_count),
      yieldEarned: parseInt(result.yield_earned) / 1000000,
      isActive: result.is_active
    };
  }

  parseMemberData(result) {
    return {
      contributionAmount: parseInt(result.contribution_amount) / 1000000,
      joinedAt: parseInt(result.joined_at),
      yieldShare: parseInt(result.yield_share) / 1000000,
      isActive: result.is_active
    };
  }

  parseBadgeList(result) {
    // Parse list of badge token IDs
    return result.map(id => parseInt(id));
  }

  parseBadgeMetadata(result) {
    return {
      milestoneType: result.milestone_type,
      earnedAt: parseInt(result.earned_at),
      vaultId: parseInt(result.vault_id),
      amountSaved: parseInt(result.amount_saved) / 1000000,
      badgeName: result.badge_name,
      badgeDescription: result.badge_description
    };
  }
}

module.exports = new StacksService();
