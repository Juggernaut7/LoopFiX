import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Zap, 
  Shield, 
  Brain, 
  DollarSign,
  Clock,
  Star,
  ArrowUpRight,
  Plus,
  Target,
  Wallet
} from 'lucide-react';
import LoopFundCard from '../components/ui/LoopFundCard';
import LoopFundButton from '../components/ui/LoopFundButton';
import { useToast } from '../context/ToastContext';
import stacksService from '../services/stacksService';

const EarnPage = () => {
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [selectedPool, setSelectedPool] = useState(null);
  const [showStakingModal, setShowStakingModal] = useState(false);
  const { toast } = useToast();

  // Check wallet connection
  useEffect(() => {
    const checkConnection = () => {
      const connectionStatus = stacksService.getConnectionStatus();
      setIsWalletConnected(connectionStatus.isConnected);
    };

    checkConnection();
    const interval = setInterval(checkConnection, 1000);
    return () => clearInterval(interval);
  }, []);

  // Mock AI recommendation
  const aiRecommendation = {
    pool: "STX Staking Pool",
    apy: 8.5,
    risk: "Low",
    reason: "Based on your profile, you could increase yield by 2.3% by joining this pool"
  };

  // Mock available pools
  const availablePools = [
    {
      id: 1,
      name: "STX Staking Pool",
      apy: 8.5,
      duration: "30 days",
      risk: "Low",
      minStake: 10,
      description: "Stake STX tokens for guaranteed yield",
      icon: TrendingUp,
      color: "emerald"
    },
    {
      id: 2,
      name: "Bitcoin Yield Pool",
      apy: 12.3,
      duration: "60 days",
      risk: "Medium",
      minStake: 0.1,
      description: "Earn yield on Bitcoin-backed assets",
      icon: Zap,
      color: "coral"
    },
    {
      id: 3,
      name: "DeFi Aggregator",
      apy: 15.7,
      duration: "90 days",
      risk: "High",
      minStake: 50,
      description: "Advanced DeFi strategies for maximum yield",
      icon: Brain,
      color: "gold"
    }
  ];

  // Mock portfolio summary
  const portfolioSummary = {
    totalStaked: 125.5,
    averageAPY: 11.2,
    estimatedMonthlyReturn: 1.17
  };

  const handleJoinPool = (pool) => {
    if (!isWalletConnected) {
      toast.error('Please connect your wallet first');
      return;
    }
    setSelectedPool(pool);
    setShowStakingModal(true);
  };

  const handleStake = (amount) => {
    // Mock staking transaction
    toast.success(`Successfully staked ${amount} STX in ${selectedPool.name}`);
    setShowStakingModal(false);
    setSelectedPool(null);
  };

  if (!isWalletConnected) {
    return (
      <div className="text-center py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md mx-auto"
        >
          <Wallet className="w-16 h-16 text-loopfund-neutral-400 mx-auto mb-6" />
          <h2 className="font-display text-h2 text-loopfund-neutral-900 dark:text-loopfund-dark-text mb-4">
            Connect Your Wallet
          </h2>
          <p className="text-loopfund-neutral-600 dark:text-loopfund-neutral-400 mb-6">
            Connect your Stacks wallet to start earning yield on your savings
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="font-display text-h1 text-loopfund-neutral-900 dark:text-loopfund-dark-text mb-2">
          Earn Yield with Bitcoin-backed Assets
        </h1>
        <p className="text-loopfund-neutral-600 dark:text-loopfund-neutral-400 text-lg">
          Access DeFi yield opportunities powered by AI recommendations
        </p>
      </motion.div>

      {/* AI Recommendation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <LoopFundCard className="p-6 bg-gradient-to-r from-loopfund-electric-50 to-loopfund-lavender-50 dark:from-loopfund-electric-900/20 dark:to-loopfund-lavender-900/20 border border-loopfund-electric-200 dark:border-loopfund-electric-800">
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-loopfund-electric-100 dark:bg-loopfund-electric-900/40 rounded-xl">
              <Brain className="w-6 h-6 text-loopfund-electric-600 dark:text-loopfund-electric-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-display text-h4 text-loopfund-neutral-900 dark:text-loopfund-dark-text mb-2">
                AI Recommendation
              </h3>
              <p className="text-loopfund-neutral-600 dark:text-loopfund-neutral-400 mb-3">
                {aiRecommendation.reason}
              </p>
              <div className="flex items-center space-x-4">
                <span className="font-semibold text-loopfund-electric-600 dark:text-loopfund-electric-400">
                  {aiRecommendation.pool}
                </span>
                <span className="px-3 py-1 bg-loopfund-emerald-100 dark:bg-loopfund-emerald-900/30 text-loopfund-emerald-700 dark:text-loopfund-emerald-300 rounded-full text-sm font-medium">
                  {aiRecommendation.apy}% APY
                </span>
                <span className="px-3 py-1 bg-loopfund-gold-100 dark:bg-loopfund-gold-900/30 text-loopfund-gold-700 dark:text-loopfund-gold-300 rounded-full text-sm font-medium">
                  {aiRecommendation.risk} Risk
                </span>
              </div>
            </div>
          </div>
        </LoopFundCard>
      </motion.div>

      {/* Available Pools */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <h2 className="font-display text-h3 text-loopfund-neutral-900 dark:text-loopfund-dark-text mb-6">
          Available Pools
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {availablePools.map((pool, index) => (
            <motion.div
              key={pool.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
            >
              <LoopFundCard className="p-6 h-full flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-loopfund-${pool.color}-100 dark:bg-loopfund-${pool.color}-900/30`}>
                    <pool.icon className={`w-6 h-6 text-loopfund-${pool.color}-600 dark:text-loopfund-${pool.color}-400`} />
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium bg-loopfund-${pool.color}-100 dark:bg-loopfund-${pool.color}-900/30 text-loopfund-${pool.color}-700 dark:text-loopfund-${pool.color}-300`}>
                    {pool.risk} Risk
                  </span>
                </div>
                
                <h3 className="font-display text-h4 text-loopfund-neutral-900 dark:text-loopfund-dark-text mb-2">
                  {pool.name}
                </h3>
                <p className="text-loopfund-neutral-600 dark:text-loopfund-neutral-400 mb-4 flex-1">
                  {pool.description}
                </p>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-loopfund-neutral-500 dark:text-loopfund-neutral-400">APY</span>
                    <span className="font-semibold text-loopfund-neutral-900 dark:text-loopfund-dark-text">
                      {pool.apy}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-loopfund-neutral-500 dark:text-loopfund-neutral-400">Duration</span>
                    <span className="font-semibold text-loopfund-neutral-900 dark:text-loopfund-dark-text">
                      {pool.duration}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-loopfund-neutral-500 dark:text-loopfund-neutral-400">Min Stake</span>
                    <span className="font-semibold text-loopfund-neutral-900 dark:text-loopfund-dark-text">
                      {pool.minStake} STX
                    </span>
                  </div>
                </div>
                
                <LoopFundButton
                  variant="primary"
                  size="md"
                  onClick={() => handleJoinPool(pool)}
                  className="w-full"
                >
                  Join Pool
                  <ArrowUpRight className="w-4 h-4 ml-2" />
                </LoopFundButton>
              </LoopFundCard>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Portfolio Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <LoopFundCard className="p-6">
          <h2 className="font-display text-h3 text-loopfund-neutral-900 dark:text-loopfund-dark-text mb-6">
            Portfolio Summary
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="p-4 bg-loopfund-emerald-100 dark:bg-loopfund-emerald-900/30 rounded-xl w-16 h-16 flex items-center justify-center mx-auto mb-3">
                <DollarSign className="w-8 h-8 text-loopfund-emerald-600 dark:text-loopfund-emerald-400" />
              </div>
              <h3 className="font-display text-h4 text-loopfund-neutral-900 dark:text-loopfund-dark-text mb-1">
                {portfolioSummary.totalStaked} STX
              </h3>
              <p className="text-loopfund-neutral-600 dark:text-loopfund-neutral-400">Total Staked</p>
            </div>
            
            <div className="text-center">
              <div className="p-4 bg-loopfund-coral-100 dark:bg-loopfund-coral-900/30 rounded-xl w-16 h-16 flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="w-8 h-8 text-loopfund-coral-600 dark:text-loopfund-coral-400" />
              </div>
              <h3 className="font-display text-h4 text-loopfund-neutral-900 dark:text-loopfund-dark-text mb-1">
                {portfolioSummary.averageAPY}%
              </h3>
              <p className="text-loopfund-neutral-600 dark:text-loopfund-neutral-400">Average APY</p>
            </div>
            
            <div className="text-center">
              <div className="p-4 bg-loopfund-gold-100 dark:bg-loopfund-gold-900/30 rounded-xl w-16 h-16 flex items-center justify-center mx-auto mb-3">
                <Star className="w-8 h-8 text-loopfund-gold-600 dark:text-loopfund-gold-400" />
              </div>
              <h3 className="font-display text-h4 text-loopfund-neutral-900 dark:text-loopfund-dark-text mb-1">
                {portfolioSummary.estimatedMonthlyReturn} STX
              </h3>
              <p className="text-loopfund-neutral-600 dark:text-loopfund-neutral-400">Est. Monthly Return</p>
            </div>
          </div>
        </LoopFundCard>
      </motion.div>

      {/* Staking Modal */}
      {showStakingModal && selectedPool && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-loopfund-dark-surface rounded-2xl p-8 max-w-md w-full shadow-loopfund-xl border border-loopfund-neutral-200 dark:border-loopfund-neutral-700"
          >
            <h3 className="font-display text-h3 text-loopfund-neutral-900 dark:text-loopfund-dark-text mb-4">
              Stake in {selectedPool.name}
            </h3>
            <p className="text-loopfund-neutral-600 dark:text-loopfund-neutral-400 mb-6">
              Enter the amount you want to stake. Minimum: {selectedPool.minStake} STX
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-loopfund-neutral-700 dark:text-loopfund-neutral-300 mb-2">
                  Amount to Stake (STX)
                </label>
                <input
                  type="number"
                  min={selectedPool.minStake}
                  step="0.1"
                  className="w-full px-4 py-3 border border-loopfund-neutral-300 dark:border-loopfund-neutral-600 rounded-xl focus:ring-2 focus:ring-loopfund-emerald-500 focus:border-transparent"
                  placeholder={`Minimum ${selectedPool.minStake} STX`}
                />
              </div>
              
              <div className="flex space-x-3">
                <LoopFundButton
                  variant="secondary"
                  size="md"
                  onClick={() => setShowStakingModal(false)}
                  className="flex-1"
                >
                  Cancel
                </LoopFundButton>
                <LoopFundButton
                  variant="primary"
                  size="md"
                  onClick={() => handleStake(10)}
                  className="flex-1"
                >
                  Stake Now
                </LoopFundButton>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default EarnPage;
