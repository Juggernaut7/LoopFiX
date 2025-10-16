import { showConnect } from '@stacks/connect';

class WalletService {
  constructor() {
    this.isConnected = false;
    this.address = null;
    this.network = 'testnet'; // Using testnet for development
    this.listeners = [];
  }

  // Initialize wallet connection
  async initialize() {
    try {
      console.log('🔍 Initializing wallet service...');
      
      // Check if user is already connected
      const existingConnection = localStorage.getItem('loopfi_wallet_connection');
      console.log('📦 Existing connection data:', existingConnection);
      
      if (existingConnection) {
        const connectionData = JSON.parse(existingConnection);
        console.log('📋 Parsed connection data:', connectionData);
        
        this.isConnected = connectionData.isConnected;
        this.address = connectionData.address;
        
        console.log('✅ Wallet restored from localStorage:', {
          isConnected: this.isConnected,
          address: this.address
        });
        
        this.notifyListeners();
        return { isConnected: this.isConnected, address: this.address };
      }
      
      console.log('ℹ️ No existing connection found');
      return { isConnected: false, address: null };
    } catch (error) {
      console.error('❌ Error initializing wallet:', error);
      // Clear corrupted data
      localStorage.removeItem('loopfi_wallet_connection');
      return { isConnected: false, address: null };
    }
  }

  // Connect wallet
  async connectWallet() {
    return new Promise((resolve, reject) => {
      showConnect({
        appDetails: {
          name: 'LoopFiX',
          icon: window.location.origin + '/logo.jpg',
        },
        redirectTo: '/app/dashboard',
        onFinish: (userData) => {
          console.log('Wallet connected:', userData);
          console.log('userData keys:', Object.keys(userData));
          
          // Handle different address structures
          let address = null;
          
          // Try to get address from userSession
          if (userData.userSession && userData.userSession.loadUserData) {
            try {
              const userDataFromSession = userData.userSession.loadUserData();
              console.log('User data from session:', userDataFromSession);
              if (userDataFromSession.profile && userDataFromSession.profile.stxAddress) {
                address = userDataFromSession.profile.stxAddress.testnet || userDataFromSession.profile.stxAddress.mainnet;
                console.log('Address from session:', address);
              }
            } catch (error) {
              console.log('Error loading user data from session:', error);
            }
          }
          
          // Fallback: try to get from authResponsePayload
          if (!address && userData.authResponsePayload) {
            try {
              const payload = JSON.parse(atob(userData.authResponsePayload.split('.')[1]));
              if (payload.stxAddress) {
                address = payload.stxAddress.testnet || payload.stxAddress.mainnet;
              }
            } catch (error) {
              console.log('Error parsing auth response payload:', error);
            }
          }
          
          // Fallback: try direct properties
          if (!address && userData.addresses) {
            address = userData.addresses.testnet || userData.addresses.mainnet;
          } else if (!address && userData.profile) {
            address = userData.profile.stxAddress?.testnet || userData.profile.stxAddress?.mainnet;
          }
          
          if (!address) {
            console.error('No address found in userData:', userData);
            reject(new Error('No wallet address found'));
            return;
          }
          
          this.isConnected = true;
          this.address = address;
          
          // Save connection to localStorage
          const connectionData = {
            isConnected: true,
            address: this.address,
            timestamp: Date.now()
          };
          
          console.log('💾 Saving wallet connection to localStorage:', connectionData);
          localStorage.setItem('loopfi_wallet_connection', JSON.stringify(connectionData));
          
          this.notifyListeners();
          resolve({ isConnected: true, address: this.address });
        },
        onCancel: () => {
          console.log('Wallet connection cancelled');
          this.isConnected = false;
          this.address = null;
          this.notifyListeners();
          reject(new Error('Wallet connection cancelled'));
        }
      });
    });
  }

  // Disconnect wallet
  disconnectWallet() {
    console.log('🔌 Disconnecting wallet...');
    this.isConnected = false;
    this.address = null;
    
    // Clear localStorage
    localStorage.removeItem('loopfi_wallet_connection');
    console.log('🗑️ Cleared wallet connection from localStorage');
    
    this.notifyListeners();
  }

  // Get wallet address
  getAddress() {
    return this.address;
  }

  // Get wallet balance
  async getBalance() {
    try {
      if (!this.isConnected || !this.address) {
        return 0;
      }

      // Get balance from Stacks API
      const response = await fetch(`https://stacks-node-api.testnet.stacks.co/extended/v1/address/${this.address}/stx`);
      if (response.ok) {
        const data = await response.json();
        // Convert microSTX to STX
        return (data.balance || 0) / 1000000;
      }
      
      return 0;
    } catch (error) {
      console.error('Error getting wallet balance:', error);
      return 0;
    }
  }

  // Get connection status
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      address: this.address,
      network: this.network
    };
  }

  // Add listener for connection changes
  addListener(callback) {
    this.listeners.push(callback);
  }

  // Remove listener
  removeListener(callback) {
    this.listeners = this.listeners.filter(listener => listener !== callback);
  }

  // Notify all listeners
  notifyListeners() {
    this.listeners.forEach(listener => {
      listener({
        isConnected: this.isConnected,
        address: this.address,
        network: this.network
      });
    });
  }

  // Check if wallet is connected (for AppLayout)
  async checkConnection() {
    try {
      const existingConnection = localStorage.getItem('loopfi_wallet_connection');
      if (existingConnection) {
        const connectionData = JSON.parse(existingConnection);
        // Check if connection is not too old (24 hours)
        const isRecent = Date.now() - connectionData.timestamp < 24 * 60 * 60 * 1000;
        if (isRecent) {
          this.isConnected = connectionData.isConnected;
          this.address = connectionData.address;
          return { isConnected: this.isConnected, address: this.address };
        } else {
          // Connection is too old, clear it
          this.disconnectWallet();
        }
      }
      return { isConnected: false, address: null };
    } catch (error) {
      console.error('Error checking connection:', error);
      return { isConnected: false, address: null };
    }
  }

  // Debug method to check localStorage
  debugLocalStorage() {
    console.log('🔍 localStorage Debug:');
    console.log('  Raw data:', localStorage.getItem('loopfi_wallet_connection'));
    
    try {
      const data = localStorage.getItem('loopfi_wallet_connection');
      if (data) {
        const parsed = JSON.parse(data);
        console.log('  Parsed data:', parsed);
        console.log('  Is recent?', Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000);
        console.log('  Age (hours):', (Date.now() - parsed.timestamp) / (1000 * 60 * 60));
      }
    } catch (error) {
      console.error('  Parse error:', error);
    }
  }

  // Methods expected by useWallet hook (mock implementations for now)
  async getWallet() {
    // Mock wallet data for development
    return {
      data: {
        data: {
          balance: 2.5,
          address: this.address,
          isConnected: this.isConnected
        }
      }
    };
  }

  async getTransactions(page = 1, limit = 20, type = null) {
    // Mock transaction data for development
    return {
      data: {
        transactions: [
          {
            id: 1,
            type: 'deposit',
            amount: 1.0,
            description: 'Wallet deposit',
            date: new Date().toISOString()
          }
        ]
      }
    };
  }

  async addToWallet(amount, reference, description) {
    // Mock implementation - in real app this would make API call
    return {
      data: {
        balance: 2.5 + amount,
        address: this.address
      }
    };
  }

  async contributeToGoal(goalId, amount, description) {
    // Mock implementation - in real app this would make API call
    return {
      data: {
        wallet: {
          balance: 2.5 - amount,
          address: this.address
        }
      }
    };
  }

  async contributeToGroup(groupId, amount, description) {
    // Mock implementation - in real app this would make API call
    return {
      data: {
        wallet: {
          balance: 2.5 - amount,
          address: this.address
        }
      }
    };
  }

  async releaseGoalFunds(goalId) {
    // Mock implementation - in real app this would make API call
    return {
      data: {
        wallet: {
          balance: 2.5,
          address: this.address
        }
      }
    };
  }
}

// Create singleton instance
const walletService = new WalletService();

export default walletService;
