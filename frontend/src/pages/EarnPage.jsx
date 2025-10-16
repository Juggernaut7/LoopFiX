import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, 
  Target, 
  Users, 
  Wallet, 
  ArrowUpRight, 
  ArrowDownRight,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  DollarSign,
  Banknote,
  Percent,
  Trophy,
  Zap,
  Star,
  User,
  Award,
  Loader,
  Bell,
  Brain, 
  MessageCircle, 
  Lightbulb, 
  Sparkles,
  Heart,
  Gamepad2,
  PiggyBank,
  Building2,
  CreditCard,
  PieChart,
  TrendingDown,
  UserPlus,
  Share2,
  Gift,
  BookOpen,
  Shield,
  Lock,
  Unlock,
  Activity,
  BarChart3,
  LineChart,
  Coins,
  ArrowRight,
  Info,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import StatsCard from '../components/ui/StatsCard';
import ProgressRing from '../components/ui/ProgressRing';
import LoopFundCard from '../components/ui/LoopFundCard';
import LoopFundButton from '../components/ui/LoopFundButton';
import { useToast } from '../context/ToastContext';
import { formatCurrencySimple } from '../utils/currency';
import walletService from '../services/walletService';
import defiService from '../services/defiService';
import stakingService from '../services/stakingService';

const EarnPage = () => {
  const [activeTab, setActiveTab] = useState('strategies');
  const [strategies, setStrategies] = useState([]);
  const [pools, setPools] = useState([]);
  const [myStakes, setMyStakes] = useState([]);
  const [analytics, setAnalytics] = useState({
    totalStaked: 0,
    totalEarned: 0,
    averageAPY: 0,
    activeStakes: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [showStakeModal, setShowStakeModal] = useState(false);
  const [selectedPool, setSelectedPool] = useState(null);
  const [stakeAmount, setStakeAmount] = useState('');
  const { toast } = useToast();
  const navigate = useNavigate();

  // Check wallet connection status
  useEffect(() => {
    const checkWalletConnection = async () => {
      const connectionStatus = await walletService.checkConnection();
      setIsWalletConnected(connectionStatus.isConnected);
    };

    checkWalletConnection();
    
    // Add listener for connection changes
    const handleConnectionChange = (status) => {
      setIsWalletConnected(status.isConnected);
    };

    walletService.addListener(handleConnectionChange);
    
    return () => {
      walletService.removeListener(handleConnectionChange);
    };
  }, []);

  // Load earning strategies and pools
  useEffect(() => {
    const loadEarnData = async () => {
      try {
        setIsLoading(true);
        
        // Load real data from staking service
        const [poolsData, stakesData, analyticsData] = await Promise.all([
          stakingService.getStakingPools(),
          stakingService.getUserStakes(),
          stakingService.getStakingAnalytics()
        ]);

        // Convert pools to strategies format for compatibility
        const strategiesData = poolsData.map(pool => ({
          id: pool.id || pool.poolId,
          name: pool.name,
          description: pool.description,
          apy: pool.apy / 100, // Convert from basis points to percentage
          risk: pool.risk,
          minAmount: pool.minStake / 1000000, // Convert from microSTX to STX
          maxAmount: pool.maxStake / 1000000, // Convert from microSTX to STX
          tvl: pool.tvl || (pool.totalStaked / 1000000), // Convert from microSTX to STX
          icon: getIconComponent(pool.icon),
          color: pool.color,
          gradient: getGradientClass(pool.color),
          features: getPoolFeatures(pool),
          status: pool.status || (pool.isActive ? 'active' : 'inactive')
        }));

        setStrategies(strategiesData);
        setPools(poolsData);
        setMyStakes(stakesData);
        setAnalytics(analyticsData);
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading earn data:', error);
        toast.error('Failed to load earning data');
        setIsLoading(false);
      }
    };

    if (isWalletConnected) {
      loadEarnData();
    } else {
      setIsLoading(false);
    }
  }, [isWalletConnected, toast]);

  // Helper function to get icon component
  const getIconComponent = (iconName) => {
    const iconMap = {
      'Shield': Shield,
      'Coins': Coins,
      'TrendingUp': TrendingUp,
      'Brain': Brain
    };
    return iconMap[iconName] || Shield;
  };

  // Helper function to get gradient class
  const getGradientClass = (color) => {
    const gradientMap = {
      'loopfund-emerald': 'from-loopfund-emerald-500 to-loopfund-mint-500',
      'loopfund-coral': 'from-loopfund-coral-500 to-loopfund-orange-500',
      'loopfund-gold': 'from-loopfund-gold-500 to-loopfund-electric-500',
      'loopfund-electric': 'from-loopfund-electric-500 to-loopfund-lavender-500'
    };
    return gradientMap[color] || 'from-loopfund-emerald-500 to-loopfund-mint-500';
  };

  // Helper function to get pool features
  const getPoolFeatures = (pool) => {
    const features = [];
    if (pool.risk === 'Low') features.push('Low risk', 'Stable returns');
    if (pool.risk === 'Medium') features.push('Medium risk', 'Higher yield');
    if (pool.risk === 'High') features.push('High risk', 'Maximum rewards');
    features.push('Smart contracts', 'Auto-compound');
    return features;
  };

  const handleStake = (pool) => {
    if (!isWalletConnected) {
      toast.error('Please connect your wallet first');
      return;
    }
    setSelectedPool(pool);
    setShowStakeModal(true);
  };

  const handleStakeSubmit = async () => {
    if (!selectedPool || !stakeAmount) {
      toast.error('Please enter a valid amount');
      return;
    }

    try {
      const amount = parseFloat(stakeAmount);
      if (amount < selectedPool.minStake) {
        toast.error(`Minimum stake is ${selectedPool.minStake} STX`);
        return;
      }

      if (amount > selectedPool.maxStake) {
        toast.error(`Maximum stake is ${selectedPool.maxStake} STX`);
        return;
      }

      // Extract lock period from pool (convert days to number)
      const lockPeriodDays = parseInt(selectedPool.lockPeriod.split(' ')[0]);

      // Call staking service
      const result = await stakingService.stakeSTX(
        selectedPool.poolId || selectedPool.id,
        amount * 1000000, // Convert STX to microSTX
        lockPeriodDays
      );

      if (result.success) {
        toast.success(`Successfully staked ${amount} STX in ${selectedPool.name}! Transaction: ${result.txId}`);
        setShowStakeModal(false);
        setStakeAmount('');
        setSelectedPool(null);
        
        // Refresh data
        const [poolsData, stakesData] = await Promise.all([
          stakingService.getStakingPools(),
          stakingService.getUserStakes()
        ]);
        setPools(poolsData);
        setMyStakes(stakesData);
      } else {
        toast.error(`Failed to stake: ${result.error}`);
      }
    } catch (error) {
      console.error('Error staking:', error);
      toast.error('Failed to stake. Please try again.');
    }
  };

  const handleUnstake = async (stake) => {
    try {
      const result = await stakingService.unstakeSTX(stake.id);
      
      if (result.success) {
        toast.success(`Successfully initiated unstaking of ${stake.amount} STX from ${stake.poolName}! Transaction: ${result.txId}`);
        
        // Refresh data
        const stakesData = await stakingService.getUserStakes();
        setMyStakes(stakesData);
      } else {
        toast.error(`Failed to unstake: ${result.error}`);
      }
    } catch (error) {
      console.error('Error unstaking:', error);
      toast.error('Failed to unstake. Please try again.');
    }
  };

  const getRiskColor = (risk) => {
    switch (risk.toLowerCase()) {
      case 'low':
        return 'text-loopfund-emerald-600 bg-loopfund-emerald-100 dark:bg-loopfund-emerald-900/30 dark:text-loopfund-emerald-300';
      case 'medium':
        return 'text-loopfund-gold-600 bg-loopfund-gold-100 dark:bg-loopfund-gold-900/30 dark:text-loopfund-gold-300';
      case 'high':
        return 'text-loopfund-coral-600 bg-loopfund-coral-100 dark:bg-loopfund-coral-900/30 dark:text-loopfund-coral-300';
      default:
        return 'text-loopfund-neutral-600 bg-loopfund-neutral-100 dark:bg-loopfund-neutral-900/30 dark:text-loopfund-neutral-300';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'text-loopfund-emerald-600 bg-loopfund-emerald-100 dark:bg-loopfund-emerald-900/30 dark:text-loopfund-emerald-300';
      case 'pending':
        return 'text-loopfund-gold-600 bg-loopfund-gold-100 dark:bg-loopfund-gold-900/30 dark:text-loopfund-gold-300';
      case 'completed':
        return 'text-loopfund-neutral-600 bg-loopfund-neutral-100 dark:bg-loopfund-neutral-900/30 dark:text-loopfund-neutral-300';
      default:
        return 'text-loopfund-neutral-600 bg-loopfund-neutral-100 dark:bg-loopfund-neutral-900/30 dark:text-loopfund-neutral-300';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 bg-gradient-to-br from-loopfund-emerald-500 to-loopfund-mint-500 rounded-full flex items-center justify-center"
        >
          <Sparkles className="w-4 h-4 text-white" />
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
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="font-display text-h1 text-loopfund-neutral-900 dark:text-loopfund-dark-text mb-2">
            Earn Yield 💰
          </h1>
          <p className="text-loopfund-neutral-600 dark:text-loopfund-neutral-400 text-lg">
            Grow your savings with smart DeFi strategies
          </p>
        </div>
        {!isWalletConnected && (
          <LoopFundButton
            variant="primary"
            size="md"
            onClick={async () => {
              try {
                await walletService.connectWallet();
                setIsWalletConnected(true);
                toast.success('Wallet connected successfully!');
              } catch (error) {
                console.error('Error connecting wallet:', error);
                toast.error('Failed to connect wallet');
              }
            }}
          >
            <Wallet className="w-4 h-4 mr-2" />
            Connect Wallet
          </LoopFundButton>
        )}
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Total Staked"
          value={`${analytics.totalStaked} STX`}
          change="+0.2 STX this month"
          changeType="positive"
          icon={Coins}
          color="loopfund-emerald"
          gradient="from-loopfund-emerald-500 to-loopfund-mint-500"
        />
        <StatsCard
          title="Total Earned"
          value={`${analytics.totalEarned} STX`}
          change="+0.05 STX this week"
          changeType="positive"
          icon={TrendingUp}
          color="loopfund-coral"
          gradient="from-loopfund-coral-500 to-loopfund-orange-500"
        />
        <StatsCard
          title="Average APY"
          value={`${analytics.averageAPY}%`}
          change="+2.1% vs last month"
          changeType="positive"
          icon={Percent}
          color="loopfund-gold"
          gradient="from-loopfund-gold-500 to-loopfund-electric-500"
        />
        <StatsCard
          title="Active Stakes"
          value={`${analytics.activeStakes}`}
          change="1 new this week"
          changeType="positive"
          icon={Target}
          color="loopfund-electric"
          gradient="from-loopfund-electric-500 to-loopfund-lavender-500"
        />
      </div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="flex space-x-1 bg-loopfund-neutral-100 dark:bg-loopfund-midnight-800/50 p-1 rounded-xl"
      >
        <button
          onClick={() => setActiveTab('strategies')}
          className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
            activeTab === 'strategies'
              ? 'bg-white dark:bg-loopfund-dark-surface text-loopfund-neutral-900 dark:text-loopfund-dark-text shadow-sm'
              : 'text-loopfund-neutral-600 dark:text-loopfund-neutral-400 hover:text-loopfund-neutral-900 dark:hover:text-loopfund-dark-text'
          }`}
        >
          Earning Strategies
        </button>
        <button
          onClick={() => setActiveTab('pools')}
          className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
            activeTab === 'pools'
              ? 'bg-white dark:bg-loopfund-dark-surface text-loopfund-neutral-900 dark:text-loopfund-dark-text shadow-sm'
              : 'text-loopfund-neutral-600 dark:text-loopfund-neutral-400 hover:text-loopfund-neutral-900 dark:hover:text-loopfund-dark-text'
          }`}
        >
          Staking Pools
        </button>
        <button
          onClick={() => setActiveTab('my-stakes')}
          className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
            activeTab === 'my-stakes'
              ? 'bg-white dark:bg-loopfund-dark-surface text-loopfund-neutral-900 dark:text-loopfund-dark-text shadow-sm'
              : 'text-loopfund-neutral-600 dark:text-loopfund-neutral-400 hover:text-loopfund-neutral-900 dark:hover:text-loopfund-dark-text'
          }`}
        >
          My Stakes
        </button>
      </motion.div>

      {/* Content based on active tab */}
      {activeTab === 'strategies' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {strategies.map((strategy, index) => (
            <motion.div
              key={strategy.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
            >
              <LoopFundCard className="p-6 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${strategy.gradient}`}>
                    <strategy.icon className="w-6 h-6 text-white" />
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRiskColor(strategy.risk)}`}>
                    {strategy.risk} Risk
                  </span>
                </div>
                
                <h3 className="font-display text-h4 text-loopfund-neutral-900 dark:text-loopfund-dark-text mb-2">
                  {strategy.name}
                </h3>
                <p className="text-loopfund-neutral-600 dark:text-loopfund-neutral-400 mb-4">
                  {strategy.description}
                </p>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-loopfund-neutral-500 dark:text-loopfund-neutral-400">APY</span>
                    <span className="font-semibold text-loopfund-neutral-900 dark:text-loopfund-dark-text">
                      {strategy.apy}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-loopfund-neutral-500 dark:text-loopfund-neutral-400">Min Amount</span>
                    <span className="font-semibold text-loopfund-neutral-900 dark:text-loopfund-dark-text">
                      {strategy.minAmount} STX
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-loopfund-neutral-500 dark:text-loopfund-neutral-400">TVL</span>
                    <span className="font-semibold text-loopfund-neutral-900 dark:text-loopfund-dark-text">
                      ${(strategy.tvl / 1000000).toFixed(1)}M
                    </span>
                  </div>
                </div>

                <div className="space-y-2 mb-6">
                  <h4 className="font-medium text-loopfund-neutral-900 dark:text-loopfund-dark-text">Features:</h4>
                  {strategy.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-loopfund-emerald-500" />
                      <span className="text-sm text-loopfund-neutral-600 dark:text-loopfund-neutral-400">{feature}</span>
                    </div>
                  ))}
                </div>

                <LoopFundButton
                  variant="primary"
                  size="lg"
                  onClick={() => navigate('/app/goals')}
                  className="w-full py-4 text-lg font-semibold rounded-xl"
                >
                  <Target className="w-5 h-5 mr-2" />
                  Create Goal
                </LoopFundButton>
              </LoopFundCard>
            </motion.div>
          ))}
        </motion.div>
      )}

      {activeTab === 'pools' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {pools.map((pool, index) => (
            <motion.div
              key={pool.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
            >
              <LoopFundCard className="p-6 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-${pool.color}-500`}>
                    <pool.icon className="w-6 h-6 text-white" />
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRiskColor(pool.risk)}`}>
                    {pool.risk} Risk
                  </span>
                </div>
                
                <h3 className="font-display text-h4 text-loopfund-neutral-900 dark:text-loopfund-dark-text mb-2">
                  {pool.name}
                </h3>
                <p className="text-loopfund-neutral-600 dark:text-loopfund-neutral-400 mb-4">
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
                    <span className="text-loopfund-neutral-500 dark:text-loopfund-neutral-400">TVL</span>
                    <span className="font-semibold text-loopfund-neutral-900 dark:text-loopfund-dark-text">
                      ${(pool.tvl / 1000000).toFixed(1)}M
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-loopfund-neutral-500 dark:text-loopfund-neutral-400">Participants</span>
                    <span className="font-semibold text-loopfund-neutral-900 dark:text-loopfund-dark-text">
                      {pool.participants.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-loopfund-neutral-500 dark:text-loopfund-neutral-400">Lock Period</span>
                    <span className="font-semibold text-loopfund-neutral-900 dark:text-loopfund-dark-text">
                      {pool.lockPeriod}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-loopfund-neutral-500 dark:text-loopfund-neutral-400">Rewards</span>
                    <span className="font-semibold text-loopfund-neutral-900 dark:text-loopfund-dark-text">
                      {pool.rewards}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-loopfund-neutral-500 dark:text-loopfund-neutral-400">Min Stake</span>
                    <span className="text-loopfund-neutral-900 dark:text-loopfund-dark-text">{pool.minStake} STX</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-loopfund-neutral-500 dark:text-loopfund-neutral-400">Max Stake</span>
                    <span className="text-loopfund-neutral-900 dark:text-loopfund-dark-text">{pool.maxStake} STX</span>
                  </div>
                </div>

                <LoopFundButton
                  variant="primary"
                  size="lg"
                  onClick={() => handleStake(pool)}
                  className="w-full py-4 text-lg font-semibold rounded-xl"
                  disabled={!isWalletConnected}
                >
                  <Coins className="w-5 h-5 mr-2" />
                  Stake Now
                </LoopFundButton>
              </LoopFundCard>
            </motion.div>
          ))}
        </motion.div>
      )}

      {activeTab === 'my-stakes' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-6"
        >
          {myStakes.length > 0 ? (
            myStakes.map((stake, index) => (
              <motion.div
                key={stake.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
              >
                <LoopFundCard className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-loopfund-emerald-500 rounded-xl">
                        <Coins className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-display text-h4 text-loopfund-neutral-900 dark:text-loopfund-dark-text">
                          {stake.poolName}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(stake.status)}`}>
                          {stake.status}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-display text-h4 text-loopfund-neutral-900 dark:text-loopfund-dark-text">
                        {formatCurrencySimple(stake.amount)} STX
                      </div>
                      <div className="text-sm text-loopfund-neutral-500 dark:text-loopfund-neutral-400">
                        Staked Amount
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div>
                      <div className="text-sm text-loopfund-neutral-500 dark:text-loopfund-neutral-400">APY</div>
                      <div className="font-semibold text-loopfund-neutral-900 dark:text-loopfund-dark-text">
                        {stake.apy}%
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-loopfund-neutral-500 dark:text-loopfund-neutral-400">Earned</div>
                      <div className="font-semibold text-loopfund-neutral-900 dark:text-loopfund-dark-text">
                        {formatCurrencySimple(stake.earned)} STX
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-loopfund-neutral-500 dark:text-loopfund-neutral-400">Start Date</div>
                      <div className="font-semibold text-loopfund-neutral-900 dark:text-loopfund-dark-text">
                        {stake.startDate.toLocaleDateString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-loopfund-neutral-500 dark:text-loopfund-neutral-400">End Date</div>
                      <div className="font-semibold text-loopfund-neutral-900 dark:text-loopfund-dark-text">
                        {stake.endDate.toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <LoopFundButton
                      variant="secondary"
                      size="md"
                      onClick={() => handleUnstake(stake)}
                      className="flex-1"
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Unstake
                    </LoopFundButton>
                    <LoopFundButton
                      variant="primary"
                      size="md"
                      onClick={() => {
                        // Show stake details modal or expand view
                        console.log('Viewing stake details:', stake);
                        // For now, just show an alert with details
                        alert(`Stake Details:\nPool: ${stake.poolName}\nAmount: ${stake.amount} STX\nAPY: ${stake.apy}%\nEarned: ${stake.earned} STX\nStatus: ${stake.status}`);
                      }}
                      className="flex-1"
                    >
                      <Target className="w-4 h-4 mr-2" />
                      View Details
                    </LoopFundButton>
                  </div>
                </LoopFundCard>
              </motion.div>
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-center py-12"
            >
              <div className="p-6 bg-loopfund-neutral-100 dark:bg-loopfund-midnight-800/50 rounded-2xl inline-block">
                <Coins className="w-16 h-16 text-loopfund-neutral-400 mx-auto mb-4" />
                <h3 className="font-display text-h4 text-loopfund-neutral-900 dark:text-loopfund-dark-text mb-2">
                  No Active Stakes
                </h3>
                <p className="text-loopfund-neutral-600 dark:text-loopfund-neutral-400 mb-6">
                  Start earning yield by staking in one of our pools
                </p>
                <LoopFundButton
                  variant="primary"
                  size="lg"
                  onClick={() => setActiveTab('pools')}
                  className="py-4 text-lg font-semibold rounded-xl"
                >
                  <Coins className="w-5 h-5 mr-2" />
                  Browse Pools
                </LoopFundButton>
              </div>
            </motion.div>
          )}
        </motion.div>
      )}

      {/* Stake Modal */}
      <AnimatePresence>
        {showStakeModal && selectedPool && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white dark:bg-loopfund-dark-surface rounded-2xl p-8 max-w-md w-full shadow-loopfund-xl border border-loopfund-neutral-200 dark:border-loopfund-neutral-700"
            >
              <h3 className="font-display text-h3 text-loopfund-neutral-900 dark:text-loopfund-dark-text mb-6">
                Stake in {selectedPool.name}
              </h3>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-loopfund-neutral-600 dark:text-loopfund-neutral-400">APY</span>
                  <span className="font-semibold text-loopfund-neutral-900 dark:text-loopfund-dark-text">
                    {selectedPool.apy}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-loopfund-neutral-600 dark:text-loopfund-neutral-400">Lock Period</span>
                  <span className="font-semibold text-loopfund-neutral-900 dark:text-loopfund-dark-text">
                    {selectedPool.lockPeriod}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-loopfund-neutral-600 dark:text-loopfund-neutral-400">Rewards</span>
                  <span className="font-semibold text-loopfund-neutral-900 dark:text-loopfund-dark-text">
                    {selectedPool.rewards}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-loopfund-neutral-700 dark:text-loopfund-neutral-300 mb-2">
                    Amount to Stake (STX)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min={selectedPool.minStake}
                    max={selectedPool.maxStake}
                    value={stakeAmount}
                    onChange={(e) => setStakeAmount(e.target.value)}
                    className="w-full px-4 py-3 border border-loopfund-neutral-300 dark:border-loopfund-neutral-600 rounded-xl focus:ring-2 focus:ring-loopfund-emerald-500 focus:border-transparent"
                    placeholder={`Min: ${selectedPool.minStake} STX`}
                  />
                </div>
              </div>
              
              <div className="flex space-x-3 mt-6">
                <LoopFundButton
                  variant="secondary"
                  size="lg"
                  onClick={() => {
                    setShowStakeModal(false);
                    setStakeAmount('');
                    setSelectedPool(null);
                  }}
                  className="flex-1 py-4 text-lg font-semibold rounded-xl"
                >
                  Cancel
                </LoopFundButton>
                <LoopFundButton
                  variant="primary"
                  size="lg"
                  onClick={handleStakeSubmit}
                  className="flex-1 py-4 text-lg font-semibold rounded-xl"
                >
                  <Coins className="w-5 h-5 mr-2" />
                  Stake Now
                </LoopFundButton>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EarnPage;