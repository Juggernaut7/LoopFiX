import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Wallet, Loader, CheckCircle, AlertCircle } from 'lucide-react';
import LoopFundButton from '../ui/LoopFundButton';
import LoopFundCard from '../ui/LoopFundCard';
import { useToast } from '../../context/ToastContext';
import walletService from '../../services/walletService';

const WalletConnect = () => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState({ isConnected: false, address: null });
  const { toast } = useToast();

  useEffect(() => {
    // Initialize wallet service
    const initializeWallet = async () => {
      const status = await walletService.initialize();
      setConnectionStatus(status);
    };

    initializeWallet();

    // Add listener for connection changes
    const handleConnectionChange = (status) => {
      setConnectionStatus(status);
    };

    walletService.addListener(handleConnectionChange);

    return () => {
      walletService.removeListener(handleConnectionChange);
    };
  }, []);

  const handleConnect = async () => {
    try {
      setIsConnecting(true);
      const result = await walletService.connectWallet();
      
      if (result.isConnected) {
        toast.success('Wallet connected successfully!');
        setConnectionStatus(result);
      }
    } catch (error) {
      console.error('Wallet connection error:', error);
      // Only show error if it's not a cancellation
      if (error.message !== 'Wallet connection cancelled') {
        toast.error('Wallet connection failed. Please try again.');
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    walletService.disconnectWallet();
    setConnectionStatus({ isConnected: false, address: null });
    toast.info('Wallet disconnected');
  };

  if (connectionStatus.isConnected) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <LoopFundCard className="p-6 bg-gradient-to-r from-loopfund-emerald-50 to-loopfund-mint-50 dark:from-loopfund-emerald-900/20 dark:to-loopfund-mint-900/20 border border-loopfund-emerald-200 dark:border-loopfund-emerald-800">
          <div className="flex items-center space-x-4 mb-4">
            <div className="p-3 bg-loopfund-emerald-100 dark:bg-loopfund-emerald-900/40 rounded-xl">
              <CheckCircle className="w-6 h-6 text-loopfund-emerald-600 dark:text-loopfund-emerald-400" />
            </div>
            <div>
              <h3 className="font-display text-h4 text-loopfund-neutral-900 dark:text-loopfund-dark-text">
                Wallet Connected
              </h3>
              <p className="text-loopfund-neutral-600 dark:text-loopfund-neutral-400">
                Ready to start earning yield
              </p>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-loopfund-neutral-600 dark:text-loopfund-neutral-400">Address:</span>
              <span className="font-mono text-sm text-loopfund-neutral-900 dark:text-loopfund-dark-text">
                {connectionStatus.address ? `${connectionStatus.address.slice(0, 6)}...${connectionStatus.address.slice(-4)}` : 'Unknown'}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-loopfund-neutral-600 dark:text-loopfund-neutral-400">Network:</span>
              <span className="text-loopfund-neutral-900 dark:text-loopfund-dark-text">Stacks Testnet</span>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-loopfund-neutral-200 dark:border-loopfund-neutral-600">
            <LoopFundButton
              variant="secondary"
              size="sm"
              onClick={handleDisconnect}
              className="w-full"
            >
              Disconnect Wallet
            </LoopFundButton>
          </div>
        </LoopFundCard>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <LoopFundCard className="p-8 text-center">
        <div className="w-16 h-16 bg-loopfund-neutral-100 dark:bg-loopfund-midnight-800/50 rounded-full flex items-center justify-center mx-auto mb-6">
          <Wallet className="w-8 h-8 text-loopfund-neutral-600 dark:text-loopfund-neutral-400" />
        </div>
        
        <h3 className="font-display text-h3 text-loopfund-neutral-900 dark:text-loopfund-dark-text mb-4">
          Connect Your Stacks Wallet
        </h3>
        
        <p className="text-loopfund-neutral-600 dark:text-loopfund-neutral-400 mb-8">
          Connect your Stacks wallet to start earning yield on your Bitcoin-backed savings with AI-powered DeFi strategies.
        </p>
        
        <LoopFundButton
          variant="primary"
          size="lg"
          onClick={handleConnect}
          disabled={isConnecting}
          className="w-full"
        >
          {isConnecting ? (
            <>
              <Loader className="w-5 h-5 mr-2 animate-spin" />
              Connecting...
            </>
          ) : (
            <>
              <Wallet className="w-5 h-5 mr-2" />
              Connect Wallet
            </>
          )}
        </LoopFundButton>
        
        <div className="mt-6 text-sm text-loopfund-neutral-500 dark:text-loopfund-neutral-400">
          <p>Supported wallets: Hiro Wallet, Xverse, Leather</p>
        </div>
      </LoopFundCard>
    </motion.div>
  );
};

export default WalletConnect;