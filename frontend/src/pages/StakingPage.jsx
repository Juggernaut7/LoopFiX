import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Zap, 
  Award, 
  Shield, 
  Coins,
  ArrowUpRight,
  Clock,
  Target,
  Users,
  BarChart3
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import LoopFundCard from '../components/ui/LoopFundCard';
import LoopFundButton from '../components/ui/LoopFundButton';
import stacksService from '../services/stacksService';

const StakingPage = () => {
  const navigate = useNavigate();
  const [isConnected, setIsConnected] = useState(false);
  const [stakeData, setStakeData] = useState(null);
  const [yieldPools, setYieldPools] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkConnection();
    fetchStakingData();
  }, []);

  const checkConnection = () => {
    const status = stacksService.getConnectionStatus();
    setIsConnected(status.isConnected);
  };

  const fetchStakingData = async () => {
    setLoading(true);
    try {
      // Mock data for hackathon - replace with actual API calls
      const mockStakeData = {
        totalStaked: 2500,
        totalRewards: 125,
        currentAPY: 8.5,
        nextReward: '2024-02-15'
      };

      const mockYieldPools = [
        {
          id: 1,
          name: 'STX Staking Pool',
          apy: 8.5,
          risk: 'Low',
          minStake: 100,
          totalStaked: 1500000,
          description: 'Earn rewards by staking STX tokens',
          color: 'emerald'
        },
        {
          id: 2,
          name: 'Bitcoin Yield Pool',
          apy: 12.3,
          risk: 'Medium',
          minStake: 50,
          totalStaked: 850000,
          description: 'Yield farming with Bitcoin-backed assets',
          color: 'coral'
        },
        {
          id: 3,
          name: 'DeFi Liquidity Pool',
          apy: 15.7,
          risk: 'High',
          minStake: 25,
          totalStaked: 450000,
          description: 'High-yield liquidity provision',
          color: 'gold'
        }
      ];

      setStakeData(mockStakeData);
      setYieldPools(mockYieldPools);
    } catch (error) {
      console.error('Error fetching staking data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatSTX = (amount) => {
    return (amount / 1000000).toFixed(2);
  };

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'Low': return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30';
      case 'Medium': return 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30';
      case 'High': return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30';
      default: return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-900/30';
    }
  };

  const getPoolColor = (color) => {
    const colors = {
      emerald: 'text-loopfund-emerald-600 dark:text-loopfund-emerald-400',
      coral: 'text-loopfund-coral-600 dark:text-loopfund-coral-400',
      gold: 'text-loopfund-gold-600 dark:text-loopfund-gold-400'
    };
    return colors[color] || 'text-gray-600 dark:text-gray-400';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto px-4 py-8 pt-24"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-h2 text-loopfund-neutral-900 dark:text-loopfund-dark-text mb-2">
            Staking & Yield Farming
          </h1>
          <p className="text-loopfund-neutral-600 dark:text-loopfund-neutral-400">
            Earn yield on your STX and Bitcoin assets through secure staking pools
          </p>
        </div>
        <LoopFundButton
          variant="primary"
          size="lg"
          onClick={() => navigate('/staking/stx')}
          className="group"
        >
          <TrendingUp className="w-5 h-5 mr-2" />
          Stake STX
          <ArrowUpRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
        </LoopFundButton>
      </div>

      {/* Connection Status */}
      {!isConnected && (
        <LoopFundCard className="p-6 mb-8 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700">
          <div className="flex items-center space-x-3">
            <Shield className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            <div>
              <h3 className="font-semibold text-yellow-800 dark:text-yellow-200">
                Connect Your Wallet
              </h3>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                Connect your Stacks wallet to start staking and earning yield.
              </p>
            </div>
            <LoopFundButton
              variant="secondary"
              size="sm"
              onClick={() => navigate('/defi')}
            >
              Connect Wallet
            </LoopFundButton>
          </div>
        </LoopFundCard>
      )}

      {/* Stats Cards */}
      {stakeData && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <LoopFundCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-loopfund-neutral-600 dark:text-loopfund-neutral-400">Total Staked</p>
                <p className="text-2xl font-bold text-loopfund-neutral-900 dark:text-loopfund-dark-text">
                  {formatSTX(stakeData.totalStaked)} STX
                </p>
              </div>
              <Coins className="w-8 h-8 text-loopfund-emerald-600 dark:text-loopfund-emerald-400" />
            </div>
          </LoopFundCard>

          <LoopFundCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-loopfund-neutral-600 dark:text-loopfund-neutral-400">Total Rewards</p>
                <p className="text-2xl font-bold text-loopfund-neutral-900 dark:text-loopfund-dark-text">
                  {formatSTX(stakeData.totalRewards)} STX
                </p>
              </div>
              <Award className="w-8 h-8 text-loopfund-coral-600 dark:text-loopfund-coral-400" />
            </div>
          </LoopFundCard>

          <LoopFundCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-loopfund-neutral-600 dark:text-loopfund-neutral-400">Current APY</p>
                <p className="text-2xl font-bold text-loopfund-neutral-900 dark:text-loopfund-dark-text">
                  {stakeData.currentAPY}%
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-loopfund-gold-600 dark:text-loopfund-gold-400" />
            </div>
          </LoopFundCard>

          <LoopFundCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-loopfund-neutral-600 dark:text-loopfund-neutral-400">Next Reward</p>
                <p className="text-2xl font-bold text-loopfund-neutral-900 dark:text-loopfund-dark-text">
                  {new Date(stakeData.nextReward).toLocaleDateString()}
                </p>
              </div>
              <Clock className="w-8 h-8 text-loopfund-electric-600 dark:text-loopfund-electric-400" />
            </div>
          </LoopFundCard>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <LoopFundCard 
          className="p-6 cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => navigate('/staking/stx')}
        >
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-loopfund-emerald-100 dark:bg-loopfund-emerald-900/30 rounded-lg">
              <TrendingUp className="w-6 h-6 text-loopfund-emerald-600 dark:text-loopfund-emerald-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-loopfund-neutral-900 dark:text-loopfund-dark-text">
                Stake STX
              </h3>
              <p className="text-sm text-loopfund-neutral-600 dark:text-loopfund-neutral-400">
                Earn 8.5% APY by staking STX tokens
              </p>
            </div>
          </div>
        </LoopFundCard>

        <LoopFundCard 
          className="p-6 cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => navigate('/staking/pools')}
        >
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-loopfund-coral-100 dark:bg-loopfund-coral-900/30 rounded-lg">
              <Zap className="w-6 h-6 text-loopfund-coral-600 dark:text-loopfund-coral-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-loopfund-neutral-900 dark:text-loopfund-dark-text">
                Yield Pools
              </h3>
              <p className="text-sm text-loopfund-neutral-600 dark:text-loopfund-neutral-400">
                Explore high-yield farming opportunities
              </p>
            </div>
          </div>
        </LoopFundCard>

        <LoopFundCard 
          className="p-6 cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => navigate('/staking/rewards')}
        >
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-loopfund-gold-100 dark:bg-loopfund-gold-900/30 rounded-lg">
              <Award className="w-6 h-6 text-loopfund-gold-600 dark:text-loopfund-gold-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-loopfund-neutral-900 dark:text-loopfund-dark-text">
                Claim Rewards
              </h3>
              <p className="text-sm text-loopfund-neutral-600 dark:text-loopfund-neutral-400">
                Claim your staking rewards
              </p>
            </div>
          </div>
        </LoopFundCard>
      </div>

      {/* Yield Pools */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-loopfund-neutral-900 dark:text-loopfund-dark-text">
            Available Yield Pools
          </h2>
          <LoopFundButton
            variant="secondary"
            size="sm"
            onClick={() => navigate('/staking/pools')}
          >
            View All
          </LoopFundButton>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <LoopFundCard key={i} className="p-6 animate-pulse">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
              </LoopFundCard>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {yieldPools.map((pool) => (
              <LoopFundCard key={pool.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-loopfund-neutral-900 dark:text-loopfund-dark-text mb-1">
                      {pool.name}
                    </h3>
                    <p className="text-sm text-loopfund-neutral-600 dark:text-loopfund-neutral-400 mb-2">
                      {pool.description}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(pool.risk)}`}>
                    {pool.risk} Risk
                  </span>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-loopfund-neutral-600 dark:text-loopfund-neutral-400">APY</span>
                    <span className={`text-lg font-bold ${getPoolColor(pool.color)}`}>
                      {pool.apy}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-loopfund-neutral-600 dark:text-loopfund-neutral-400">Min Stake</span>
                    <span className="text-sm font-semibold text-loopfund-neutral-900 dark:text-loopfund-dark-text">
                      {formatSTX(pool.minStake)} STX
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-loopfund-neutral-600 dark:text-loopfund-neutral-400">Total Staked</span>
                    <span className="text-sm font-semibold text-loopfund-neutral-900 dark:text-loopfund-dark-text">
                      {formatSTX(pool.totalStaked)} STX
                    </span>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <LoopFundButton
                    variant="secondary"
                    size="sm"
                    className="flex-1"
                    onClick={() => navigate(`/staking/pools/${pool.id}`)}
                  >
                    View Details
                  </LoopFundButton>
                  <LoopFundButton
                    variant="primary"
                    size="sm"
                    className="flex-1"
                    onClick={() => navigate(`/staking/stake/${pool.id}`)}
                  >
                    Stake Now
                  </LoopFundButton>
                </div>
              </LoopFundCard>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default StakingPage;
