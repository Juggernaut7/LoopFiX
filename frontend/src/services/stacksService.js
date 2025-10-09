// Stacks Web3 Integration Service
// Handles wallet connection and blockchain interactions

import { STACKS_TESTNET, STACKS_MAINNET } from '@stacks/network';
import { 
  showConnect,
  openContractCall,
  openContractDeploy,
  openSTXTransfer,
  UserSession
} from '@stacks/connect';
import { 
  makeContractCall,
  broadcastTransaction,
  uintCV,
  stringUtf8CV,
  standardPrincipalCV
} from '@stacks/transactions';

class StacksService {
  constructor() {
    this.network = import.meta.env.PROD 
      ? STACKS_MAINNET 
      : STACKS_TESTNET;
    
    this.contractAddress = import.meta.env.VITE_STACKS_CONTRACT_ADDRESS;
    this.contractName = import.meta.env.VITE_STACKS_CONTRACT_NAME || 'loopfi-vault';
    this.groupContractName = import.meta.env.VITE_STACKS_GROUP_CONTRACT_NAME || 'loopfi-group';
    
    this.isConnected = false;
    this.userAddress = null;
    this.userPublicKey = null;
    
    console.log('✅ Stacks Service initialized for', this.network);
  }

  // Connect wallet
  async connectWallet() {
    try {
      const userData = await showConnect({
        appDetails: {
          name: 'LoopFi',
          icon: window.location.origin + '/logo.jpg'
        },
        redirectTo: '/',
        onFinish: (payload) => {
          console.log('✅ Wallet connected:', payload);
          this.isConnected = true;
          this.userAddress = payload.userSession.loadUserData().profile.stxAddress.testnet;
          this.userPublicKey = payload.userSession.loadUserData().profile.publicKey;
          
          // Save connection to localStorage
          const connectionData = {
            isConnected: true,
            address: this.userAddress,
            publicKey: this.userPublicKey,
            timestamp: Date.now()
          };
          localStorage.setItem('stacks-wallet-connection', JSON.stringify(connectionData));
          console.log('✅ Connection status updated:', this.getConnectionStatus());
          return payload;
        },
        onCancel: () => {
          console.log('❌ Wallet connection cancelled');
          return false;
        }
      });
      
      return {
        success: true,
        userData,
        address: this.userAddress,
        publicKey: this.userPublicKey
      };
    } catch (error) {
      console.error('❌ Wallet connection error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Disconnect wallet
  async disconnectWallet() {
    try {
      this.isConnected = false;
      this.userAddress = null;
      this.userPublicKey = null;
      
      // Clear localStorage
      localStorage.removeItem('stacks-wallet-connection');
      
      return {
        success: true,
        message: 'Wallet disconnected'
      };
    } catch (error) {
      console.error('❌ Wallet disconnection error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get wallet balance
  async getWalletBalance() {
    try {
      if (!this.isConnected) {
        throw new Error('Wallet not connected');
      }

      const response = await fetch(`https://api.testnet.hiro.so/extended/v1/address/${this.userAddress}/stx`);
      const data = await response.json();
      
      return {
        success: true,
        balance: data.balance,
        totalSent: data.total_sent,
        totalReceived: data.total_received
      };
    } catch (error) {
      console.error('❌ Error fetching wallet balance:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get transaction history
  async getTransactionHistory(limit = 50) {
    try {
      if (!this.isConnected) {
        throw new Error('Wallet not connected');
      }

      const response = await fetch(`https://api.testnet.hiro.so/extended/v1/address/${this.userAddress}/transactions?limit=${limit}`);
      const data = await response.json();
      
      return {
        success: true,
        transactions: data.results
      };
    } catch (error) {
      console.error('❌ Error fetching transaction history:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Create a new savings vault
  async createVault(targetAmount, targetDate) {
    try {
      if (!this.isConnected) {
        throw new Error('Wallet not connected');
      }

      const functionArgs = [
        uintCV(targetAmount),
        uintCV(targetDate)
      ];

      const options = {
        contractAddress: this.contractAddress,
        contractName: this.contractName,
        functionName: 'create-vault',
        functionArgs,
        network: this.network,
        appDetails: {
          name: 'LoopFi',
          icon: window.location.origin + '/logo.jpg'
        },
        onFinish: (payload) => {
          console.log('✅ Vault created:', payload);
          return payload;
        },
        onCancel: () => {
          console.log('❌ Vault creation cancelled');
          return false;
        }
      };

      await openContractCall(options);
      
      return {
        success: true,
        message: 'Vault creation initiated'
      };
    } catch (error) {
      console.error('❌ Error creating vault:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Deposit into vault
  async depositToVault(vaultId, amount) {
    try {
      if (!this.isConnected) {
        throw new Error('Wallet not connected');
      }

      const functionArgs = [
        uintCV(vaultId),
        uintCV(amount)
      ];

      const options = {
        contractAddress: this.contractAddress,
        contractName: this.contractName,
        functionName: 'deposit',
        functionArgs,
        network: this.network,
        appDetails: {
          name: 'LoopFi',
          icon: window.location.origin + '/logo.jpg'
        },
        onFinish: (payload) => {
          console.log('✅ Deposit successful:', payload);
          return payload;
        },
        onCancel: () => {
          console.log('❌ Deposit cancelled');
          return false;
        }
      };

      await openContractCall(options);
      
      return {
        success: true,
        message: 'Deposit initiated'
      };
    } catch (error) {
      console.error('❌ Error depositing to vault:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Create a group vault
  async createGroup(groupName, targetAmount, targetDate) {
    try {
      if (!this.isConnected) {
        throw new Error('Wallet not connected');
      }

      const functionArgs = [
        stringUtf8CV(groupName),
        uintCV(targetAmount),
        uintCV(targetDate)
      ];

      const options = {
        contractAddress: this.contractAddress,
        contractName: this.groupContractName,
        functionName: 'create-group',
        functionArgs,
        network: this.network,
        appDetails: {
          name: 'LoopFi',
          icon: window.location.origin + '/logo.jpg'
        },
        onFinish: (payload) => {
          console.log('✅ Group created:', payload);
          return payload;
        },
        onCancel: () => {
          console.log('❌ Group creation cancelled');
          return false;
        }
      };

      await openContractCall(options);
      
      return {
        success: true,
        message: 'Group creation initiated'
      };
    } catch (error) {
      console.error('❌ Error creating group:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Contribute to group
  async contributeToGroup(groupId, amount) {
    try {
      if (!this.isConnected) {
        throw new Error('Wallet not connected');
      }

      const functionArgs = [
        uintCV(groupId),
        uintCV(amount)
      ];

      const options = {
        contractAddress: this.contractAddress,
        contractName: this.groupContractName,
        functionName: 'contribute',
        functionArgs,
        network: this.network,
        appDetails: {
          name: 'LoopFi',
          icon: window.location.origin + '/logo.jpg'
        },
        onFinish: (payload) => {
          console.log('✅ Contribution successful:', payload);
          return payload;
        },
        onCancel: () => {
          console.log('❌ Contribution cancelled');
          return false;
        }
      };

      await openContractCall(options);
      
      return {
        success: true,
        message: 'Contribution initiated'
      };
    } catch (error) {
      console.error('❌ Error contributing to group:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get vault information
  async getVaultInfo(vaultId) {
    try {
      // For hackathon demo, return mock data
      // In production, this would call the smart contract
      const mockVault = {
        id: vaultId,
        owner: this.userAddress,
        targetAmount: 1000000, // 1 STX in microSTX
        currentAmount: 250000,  // 0.25 STX
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        isActive: true,
        progress: 25 // 25% complete
      };

      return {
        success: true,
        vault: mockVault
      };
    } catch (error) {
      console.error('❌ Error fetching vault info:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get group information
  async getGroupInfo(groupId) {
    try {
      // For hackathon demo, return mock data
      const mockGroup = {
        id: groupId,
        name: "Family Vacation Fund",
        owner: this.userAddress,
        targetAmount: 5000000, // 5 STX in microSTX
        currentAmount: 1500000, // 1.5 STX
        memberCount: 4,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 days from now
        isActive: true,
        progress: 30 // 30% complete
      };

      return {
        success: true,
        group: mockGroup
      };
    } catch (error) {
      console.error('❌ Error fetching group info:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get vault progress
  async getVaultProgress(vaultId) {
    try {
      // For hackathon demo, return mock progress data
      const mockProgress = {
        vaultId: vaultId,
        currentAmount: 250000, // 0.25 STX
        targetAmount: 1000000, // 1 STX
        progressPercentage: 25,
        daysRemaining: 25,
        estimatedCompletion: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString()
      };

      return {
        success: true,
        progress: mockProgress
      };
    } catch (error) {
      console.error('❌ Error fetching vault progress:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get group progress
  async getGroupProgress(groupId) {
    try {
      // For hackathon demo, return mock progress data
      const mockProgress = {
        groupId: groupId,
        currentAmount: 1500000, // 1.5 STX
        targetAmount: 5000000, // 5 STX
        progressPercentage: 30,
        memberCount: 4,
        daysRemaining: 45,
        estimatedCompletion: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString()
      };

      return {
        success: true,
        progress: mockProgress
      };
    } catch (error) {
      console.error('❌ Error fetching group progress:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get DeFi yield rates (mock data for hackathon)
  async getYieldRates() {
    try {
      // Mock yield rates for hackathon demo
      const mockYieldRates = {
        success: true,
        yieldRates: {
          stx_staking: { apy: 8.5, description: 'Earn yield by stacking STX' },
          btc_yield: { apy: 12.3, description: 'Yield on sBTC through various protocols' },
          defi_pools: { apy: 15.7, description: 'High-yield DeFi liquidity pools' }
        }
      };
      
      return mockYieldRates;
    } catch (error) {
      console.error('❌ Error fetching yield rates:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get market data (mock data for hackathon)
  async getMarketData() {
    try {
      // Mock market data for hackathon demo
      const mockMarketData = {
        success: true,
        data: {
          stxPrice: 2.45,
          btcPrice: 45000,
          marketCap: 3500000000,
          volume24h: 125000000
        }
      };
      
      return mockMarketData;
    } catch (error) {
      console.error('❌ Error fetching market data:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get DeFi advice (mock data for hackathon)
  async getDeFiAdvice(query, userProfile) {
    try {
      const connectionStatus = this.getConnectionStatus();
      if (!connectionStatus.isConnected) {
        return {
          success: false,
          error: 'Wallet not connected'
        };
      }

      // Use real DeFi API for production
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/defi-real/advice/${connectionStatus.address}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: query,
          userProfile: userProfile
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('❌ Error fetching real DeFi advice:', error);
      
      // Fallback to mock data
      const mockAdvice = {
        success: true,
        data: {
          advice: `Based on your wallet balance and risk profile, I recommend starting with STX staking for stable returns, then gradually diversifying into higher-yield DeFi pools.`,
          recommendations: [
            'Start with STX staking (8.5% APY)',
            'Consider sBTC yield farming (12.3% APY)',
            'Explore DeFi pools for higher returns (15.7% APY)'
          ]
        }
      };
      
      return mockAdvice;
    }
  }

  // Get user portfolio (real blockchain data)
  async getPortfolio() {
    try {
      const connectionStatus = this.getConnectionStatus();
      if (!connectionStatus.isConnected) {
        return {
          success: false,
          error: 'Wallet not connected'
        };
      }

      // Use real DeFi API for production
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/defi-real/portfolio/${connectionStatus.address}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('❌ Error fetching real portfolio:', error);
      
      // Fallback to mock data
      const mockPortfolio = {
        success: true,
        portfolio: {
          totalValueLocked: 2.5,
          assets: [
            { name: 'STX', amount: 2.5, value: 6.125, yield: 8.5 },
            { name: 'sBTC', amount: 0, value: 0, yield: 12.3 }
          ],
          activeVaults: 3,
          totalYieldEarned: 0.15
        }
      };
      
      return mockPortfolio;
    }
  }

  // Get connection status
  getConnectionStatus() {
    // Check localStorage for persisted connection
    const storedConnection = localStorage.getItem('stacks-wallet-connection');
    if (storedConnection) {
      try {
        const connectionData = JSON.parse(storedConnection);
        this.isConnected = connectionData.isConnected;
        this.userAddress = connectionData.address;
        this.userPublicKey = connectionData.publicKey;
      } catch (error) {
        console.error('Error parsing stored connection:', error);
        localStorage.removeItem('stacks-wallet-connection');
        this.isConnected = false;
        this.userAddress = null;
        this.userPublicKey = null;
      }
    }

    return {
      isConnected: this.isConnected,
      address: this.userAddress,
      stxAddress: this.userAddress, // Alias for compatibility
      publicKey: this.userPublicKey,
      network: this.network
    };
  }
}

export default new StacksService();
