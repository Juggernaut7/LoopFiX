import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Target, 
  Users, 
  Calendar, 
  DollarSign, 
  Edit, 
  Trash2, 
  ArrowUpRight,
  TrendingUp,
  Wallet,
  Clock,
  CheckCircle
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import LoopFundButton from '../components/ui/LoopFundButton';
import LoopFundCard from '../components/ui/LoopFundCard';
import { formatCurrencySimple } from '../utils/currency';
import walletService from '../services/walletService';
import contractService from '../services/contractService';
import defiService from '../services/defiService';
import api from '../services/api';

const GoalsPage = () => {
  const [activeTab, setActiveTab] = useState('my-goals');
  const [goals, setGoals] = useState([]);
  const [groupPools, setGroupPools] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState(null);
  const { toast } = useToast();

  // Check wallet connection and load real data
  useEffect(() => {
    const loadGoalsData = async () => {
      try {
        setIsLoading(true);
        
        // Check wallet connection
        const connectionStatus = await walletService.checkConnection();
        setIsWalletConnected(connectionStatus.isConnected);
        setWalletAddress(connectionStatus.address);

        if (!connectionStatus.isConnected) {
          console.log('Wallet not connected, using mock data');
          // Use mock data when wallet not connected
          const mockGoals = [
            {
              id: 1,
              name: 'Emergency Fund',
              targetAmount: 2.5,
              currentAmount: 1.2,
              category: 'Emergency',
              deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
              isGroupGoal: false,
              apy: 8.5,
              progress: 48
            }
          ];
          setGoals(mockGoals);
          setIsLoading(false);
          return;
        }

        // Load real data from backend API
        console.log('Loading real goals data for wallet:', connectionStatus.address);
        
        // Get individual savings goals from backend API
        const goalsResponse = await api.get('/goals', {
          params: { walletAddress: connectionStatus.address }
        });
        if (goalsResponse.data.success) {
          setGoals(goalsResponse.data.data || []);
        }

        // Get group pools from backend API
        const groupsResponse = await api.get('/groups', {
          params: { walletAddress: connectionStatus.address }
        });
        if (groupsResponse.data.success) {
          console.log('Groups data received:', groupsResponse.data.data);
          setGroupPools(groupsResponse.data.data || []);
        }

      } catch (error) {
        console.error('Error loading goals data:', error);
        toast.error('Failed to load goals data');
        
        // Fallback to mock data on error
        const mockGoals = [
          {
            id: 1,
            name: 'Emergency Fund',
            targetAmount: 2.5,
            currentAmount: 1.2,
            category: 'Emergency',
            deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
            isGroupGoal: false,
            apy: 8.5,
            progress: 48
          }
        ];
        setGoals(mockGoals);
      } finally {
        setIsLoading(false);
      }
    };

    loadGoalsData();
  }, [toast]);

  const handleCreateGoal = () => {
    setShowCreateModal(true);
  };

  const handleGoalClick = (goal) => {
    setSelectedGoal(goal);
    setShowGoalModal(true);
  };

  const handleCreateGroupSubmit = async (groupData) => {
    if (!isWalletConnected || !walletAddress) {
      toast.error('Please connect your wallet first');
      return;
    }

    try {
      setIsLoading(true);
      
      // Convert target amount to microSTX (1 STX = 1,000,000 microSTX)
      const targetAmountMicroSTX = Math.floor(groupData.targetAmount * 1000000);
      
      // Calculate target block height (approximate: 1 block = 10 minutes)
      const targetDate = new Date(groupData.deadline);
      const now = new Date();
      const daysUntilTarget = Math.ceil((targetDate - now) / (1000 * 60 * 60 * 24));
      const targetBlockHeight = Math.floor(daysUntilTarget * 144) + 100000;

      console.log('Creating group with:', {
        name: groupData.name,
        targetAmount: targetAmountMicroSTX,
        targetBlockHeight,
        maxMembers: groupData.maxMembers,
        walletAddress
      });

      // Calculate 2% fee (minimum 0.01 STX)
      const targetAmountSTX = groupData.targetAmount;
      const feeAmountSTX = Math.max(0.01, targetAmountSTX * 0.02);
      const feeAmountMicroSTX = Math.floor(feeAmountSTX * 1000000);

      // Create group using smart contract
      const txResult = await contractService.createGroupVault(
        groupData.name,
        targetAmountMicroSTX,
        targetBlockHeight
      );

      if (txResult.success) {
        // Save group to backend database
        const backendGroupData = {
          name: groupData.name,
          description: groupData.description || '',
          targetAmount: groupData.targetAmount, // This is already in STX (not microSTX)
          maxMembers: groupData.maxMembers,
          endDate: groupData.deadline,
          walletAddress: walletAddress,
          contractTxId: txResult.txId,
          feeAmount: feeAmountSTX
        };

        const backendResponse = await api.post('/groups', backendGroupData);
        
        if (backendResponse.data.success) {
          if (txResult.mock) {
            toast.success(`Group created successfully! (Mock transaction - wallet integration temporarily disabled)`);
          } else {
            toast.success(`Group created successfully! 2% fee (${feeAmountSTX.toFixed(2)} STX) deducted. Transaction submitted.`);
          }
          console.log('Transaction ID:', txResult.txId);
          
          // Refresh groups list
          const groupsResponse = await api.get('/groups', {
            params: { walletAddress: walletAddress }
          });
          if (groupsResponse.data.success) {
            setGroupPools(groupsResponse.data.data || []);
          }
          
          setShowCreateGroupModal(false);
        } else {
          throw new Error(backendResponse.data.error || 'Failed to save group to database');
        }
      } else {
        throw new Error(txResult.error || 'Failed to create group');
      }

    } catch (error) {
      console.error('Error creating group:', error);
      toast.error(`Failed to create group: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateGoalSubmit = async (goalData) => {
    if (!isWalletConnected || !walletAddress) {
      toast.error('Please connect your wallet first');
      return;
    }

    try {
      setIsLoading(true);
      
      // Convert target amount to microSTX (1 STX = 1,000,000 microSTX)
      const targetAmountMicroSTX = Math.floor(goalData.targetAmount * 1000000);
      
      // Calculate target block height (approximate: 1 block = 10 minutes)
      const targetDate = new Date(goalData.deadline);
      const now = new Date();
      const daysUntilTarget = Math.ceil((targetDate - now) / (1000 * 60 * 60 * 24));
      const targetBlockHeight = Math.floor(daysUntilTarget * 144) + 100000; // Approximate current block + days * blocks per day

      console.log('Creating vault with:', {
        targetAmount: targetAmountMicroSTX,
        targetBlockHeight,
        walletAddress
      });

      // Calculate 2% fee (minimum 0.01 STX) - fee is calculated on STX amount, not microSTX
      const targetAmountSTX = goalData.targetAmount;
      const feeAmountSTX = Math.max(0.01, targetAmountSTX * 0.02);
      const feeAmountMicroSTX = Math.floor(feeAmountSTX * 1000000);

      console.log('Creating vault with fee:', {
        targetAmount: targetAmountMicroSTX,
        feeAmount: feeAmountSTX,
        feeAmountMicroSTX: feeAmountMicroSTX
      });

      // Create vault using smart contract with fee
      const txResult = await contractService.createSavingsVault(
        targetAmountMicroSTX,
        targetBlockHeight,
        feeAmountMicroSTX // Fee in microSTX
      );

      if (txResult.success) {
        // Save goal to backend database
        const backendGoalData = {
          name: goalData.name,
          description: goalData.description || '',
          targetAmount: goalData.targetAmount, // goalData.targetAmount is already in STX
          endDate: goalData.deadline, // Backend expects endDate, not deadline
          frequency: 'monthly', // Required field - default to monthly
          amount: goalData.targetAmount / 12, // Required field - monthly contribution amount
          walletAddress: walletAddress // Required for backend to identify user
        };

        const backendResponse = await api.post('/goals', backendGoalData);
        
        if (backendResponse.data.success) {
          if (txResult.mock) {
            toast.success(`Goal created successfully! (Mock transaction - wallet integration temporarily disabled)`);
          } else {
            toast.success(`Goal created successfully! 2% fee (${feeAmountSTX.toFixed(2)} STX) deducted. Transaction submitted.`);
          }
          console.log('Transaction ID:', txResult.txId);
          
          // Refresh goals list
          const goalsResponse = await api.get('/goals', {
            params: { walletAddress: walletAddress }
          });
          if (goalsResponse.data.success) {
            setGoals(goalsResponse.data.data || []);
          }
          
          setShowCreateModal(false);
        } else {
          throw new Error(backendResponse.data.error || 'Failed to save goal to database');
        }
      } else {
        throw new Error(txResult.error || 'Failed to create goal');
      }

    } catch (error) {
      console.error('Error creating goal:', error);
      toast.error(`Failed to create goal: ${error.message}`);
      
      // If it's a validation error, show more specific message
      if (error.message.includes('too large') || error.message.includes('too far')) {
        toast.error('Please check your goal amount and deadline. Values may be too large.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeposit = async (amount) => {
    if (!selectedGoal || !isWalletConnected || !walletAddress) {
      toast.error('Please connect your wallet first');
      return;
    }

    try {
      setIsLoading(true);
      
      // Determine if this is a goal or group
      const isGroup = selectedGoal.members && Array.isArray(selectedGoal.members);
      
      // Convert amount to microSTX
      const amountMicroSTX = Math.floor(amount * 1000000);
      
      console.log('Depositing to vault:', {
        vaultId: selectedGoal._id || selectedGoal.id,
        amount: amountMicroSTX,
        walletAddress,
        isGroup
      });

      // Check wallet balance before deposit
      const walletBalance = await walletService.getBalance();
      if (walletBalance < amount) {
        toast.error(`Insufficient balance. You have ${walletBalance.toFixed(2)} STX but need ${amount} STX`);
        return;
      }

      // Deposit to vault using smart contract (real wallet deduction)
      let txResult;
      if (isGroup) {
        // Use group contribute method
        txResult = await contractService.contributeToGroupVault(selectedGoal._id || selectedGoal.id, amount);
      } else {
        // Use individual savings vault deposit method
        txResult = await contractService.depositToSavingsVault(
          selectedGoal._id || selectedGoal.id,
          amountMicroSTX
        );
      }

      if (txResult.success) {
        // Update goal in backend database
        const updateData = {
          currentAmount: Number(selectedGoal.currentAmount || 0) + Number(amount),
          lastDepositAmount: Number(amount),
          lastDepositTxId: String(txResult.txId),
          walletAddress: String(walletAddress)
        };

        // Determine API endpoint based on whether this is a goal or group
        const apiEndpoint = isGroup ? `/groups/${selectedGoal._id}` : `/goals/${selectedGoal._id || selectedGoal.id}`;
        
        const backendResponse = await api.put(apiEndpoint, updateData);
        
        if (backendResponse.data.success) {
          toast.success(`Successfully deposited ${amount} STX! Transaction submitted.`);
          console.log('Transaction ID:', txResult.txId);
          
          // Refresh both goals and groups lists
          const goalsResponse = await api.get('/goals', {
            params: { walletAddress: walletAddress }
          });
          if (goalsResponse.data.success) {
            setGoals(goalsResponse.data.data || []);
          }
          
          const groupsResponse = await api.get('/groups', {
            params: { walletAddress: walletAddress }
          });
          if (groupsResponse.data.success) {
            setGroupPools(groupsResponse.data.data || []);
          }
          
          setShowGoalModal(false);
        } else {
          throw new Error(backendResponse.data.error || 'Failed to update goal in database');
        }
      } else {
        throw new Error(txResult.error || 'Failed to deposit');
      }

    } catch (error) {
      console.error('Error depositing:', error);
      toast.error(`Failed to deposit: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const getProgressColor = (progress) => {
    if (progress >= 80) return 'bg-loopfund-emerald-500';
    if (progress >= 50) return 'bg-loopfund-gold-500';
    return 'bg-loopfund-coral-500';
  };

  const getCategoryColor = (category) => {
    switch (category.toLowerCase()) {
      case 'emergency':
        return 'bg-loopfund-coral-500';
      case 'travel':
        return 'bg-loopfund-emerald-500';
      case 'education':
        return 'bg-loopfund-electric-500';
      default:
        return 'bg-loopfund-neutral-500';
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
          <div className="w-4 h-4 text-white">🔄</div>
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
            Your Savings Goals
          </h1>
          <p className="text-loopfund-neutral-600 dark:text-loopfund-neutral-400 text-lg">
            Create and manage your savings goals with smart contracts
          </p>
        </div>
        <div className="flex space-x-3">
          <LoopFundButton
            variant="primary"
            size="lg"
            onClick={handleCreateGoal}
            className="flex-1"
          >
            <Plus className="w-5 h-5 mr-3" />
            Create Goal
          </LoopFundButton>
          <LoopFundButton
            variant="secondary"
            size="lg"
            onClick={() => setShowCreateGroupModal(true)}
            className="flex-1"
          >
            <Users className="w-5 h-5 mr-3" />
            Create Group
          </LoopFundButton>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="flex space-x-1 bg-loopfund-neutral-100 dark:bg-loopfund-midnight-800/50 p-1 rounded-xl"
      >
        <button
          onClick={() => setActiveTab('my-goals')}
          className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
            activeTab === 'my-goals'
              ? 'bg-white dark:bg-loopfund-dark-surface text-loopfund-neutral-900 dark:text-loopfund-dark-text shadow-sm'
              : 'text-loopfund-neutral-600 dark:text-loopfund-neutral-400 hover:text-loopfund-neutral-900 dark:hover:text-loopfund-dark-text'
          }`}
        >
          My Goals
        </button>
        <button
          onClick={() => setActiveTab('group-pools')}
          className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
            activeTab === 'group-pools'
              ? 'bg-white dark:bg-loopfund-dark-surface text-loopfund-neutral-900 dark:text-loopfund-dark-text shadow-sm'
              : 'text-loopfund-neutral-600 dark:text-loopfund-neutral-400 hover:text-loopfund-neutral-900 dark:hover:text-loopfund-dark-text'
          }`}
        >
          Group Pools
        </button>
      </motion.div>

      {/* Goals List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {activeTab === 'my-goals' ? (
          goals.map((goal, index) => (
            <motion.div
              key={goal.id || `goal-${index}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
            >
              <LoopFundCard 
                className="p-6 cursor-pointer hover:shadow-lg transition-all duration-300"
                onClick={() => handleGoalClick(goal)}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl ${getCategoryColor(goal.category)}`}>
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <span className="px-3 py-1 bg-loopfund-emerald-100 dark:bg-loopfund-emerald-900/30 text-loopfund-emerald-700 dark:text-loopfund-emerald-300 rounded-full text-sm font-medium">
                    {goal.apy}% APY
                  </span>
                </div>
                
                <h3 className="font-display text-h4 text-loopfund-neutral-900 dark:text-loopfund-dark-text mb-2">
                  {goal.name}
                </h3>
                <p className="text-loopfund-neutral-600 dark:text-loopfund-neutral-400 mb-4">
                  {goal.category} • {goal.deadline ? new Date(goal.deadline).toLocaleDateString() : 'No deadline set'}
                </p>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-loopfund-neutral-500 dark:text-loopfund-neutral-400">Progress</span>
                    <span className="font-semibold text-loopfund-neutral-900 dark:text-loopfund-dark-text">
                      {Math.round((goal.currentAmount / goal.targetAmount) * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-loopfund-neutral-200 dark:bg-loopfund-neutral-700 rounded-full h-2">
                    <motion.div
                      className={`h-2 rounded-full ${getProgressColor(Math.round((goal.currentAmount / goal.targetAmount) * 100))}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.round((goal.currentAmount / goal.targetAmount) * 100)}%` }}
                      transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                    />
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-loopfund-neutral-600 dark:text-loopfund-neutral-400">
                      {goal.currentAmount} STX
                    </span>
                    <span className="text-loopfund-neutral-600 dark:text-loopfund-neutral-400">
                      of {goal.targetAmount} STX
                    </span>
                  </div>
                </div>
              </LoopFundCard>
            </motion.div>
          ))
        ) : (
          groupPools.map((pool, index) => {
            // Debug: Log pool structure to identify the issue
            console.log('Rendering pool:', JSON.stringify(pool, null, 2));
            return (
            <motion.div
              key={pool._id || pool.id || `pool-${index}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
            >
              <LoopFundCard 
                className="p-6 cursor-pointer hover:shadow-lg transition-all duration-300"
                onClick={() => handleGoalClick(pool)}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-xl bg-loopfund-coral-500">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <span className="px-3 py-1 bg-loopfund-coral-100 dark:bg-loopfund-coral-900/30 text-loopfund-coral-700 dark:text-loopfund-coral-300 rounded-full text-sm font-medium">
                    {typeof pool.apy === 'number' ? pool.apy : 0}% APY
                  </span>
                </div>
                
                <h3 className="font-display text-h4 text-loopfund-neutral-900 dark:text-loopfund-dark-text mb-2">
                  {typeof pool.name === 'string' ? pool.name : 'Unnamed Group'}
                </h3>
                <p className="text-loopfund-neutral-600 dark:text-loopfund-neutral-400 mb-4">
                  {Array.isArray(pool.members) ? pool.members.length : (typeof pool.members === 'number' ? pool.members : 0)} members • {pool.endDate && typeof pool.endDate === 'string' ? new Date(pool.endDate).toLocaleDateString() : 'No deadline set'}
                  {pool.progress && typeof pool.progress === 'object' && pool.progress.daysRemaining ? ` • ${pool.progress.daysRemaining} days left` : ''}
                </p>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-loopfund-neutral-500 dark:text-loopfund-neutral-400">Progress</span>
                    <span className="font-semibold text-loopfund-neutral-900 dark:text-loopfund-dark-text">
                      {typeof pool.progress === 'number' ? pool.progress : (pool.progress && typeof pool.progress.percentage === 'number' ? pool.progress.percentage : 0)}%
                    </span>
                  </div>
                  <div className="w-full bg-loopfund-neutral-200 dark:bg-loopfund-neutral-700 rounded-full h-2">
                    <motion.div
                      className="h-2 rounded-full bg-loopfund-coral-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${typeof pool.progress === 'number' ? pool.progress : (pool.progress && typeof pool.progress.percentage === 'number' ? pool.progress.percentage : 0)}%` }}
                      transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                    />
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-loopfund-neutral-600 dark:text-loopfund-neutral-400">
                      {typeof pool.currentAmount === 'number' ? formatCurrencySimple(pool.currentAmount) : '0'} STX
                    </span>
                    <span className="text-loopfund-neutral-600 dark:text-loopfund-neutral-400">
                      of {typeof pool.targetAmount === 'number' ? formatCurrencySimple(pool.targetAmount) : '0'} STX
                    </span>
                  </div>
                </div>
              </LoopFundCard>
            </motion.div>
            );
          })
        )}
      </motion.div>

      {/* Create Goal Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white dark:bg-loopfund-dark-surface rounded-2xl p-8 max-w-md w-full shadow-loopfund-xl border border-loopfund-neutral-200 dark:border-loopfund-neutral-700"
            >
              <h3 className="font-display text-h3 text-loopfund-neutral-900 dark:text-loopfund-dark-text mb-6">
                Create New Goal
              </h3>
              
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                handleCreateGoalSubmit({
                  name: formData.get('name'),
                  targetAmount: parseFloat(formData.get('targetAmount')),
                  category: formData.get('category'),
                  deadline: formData.get('deadline'),
                  apy: 8.5
                });
              }}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-loopfund-neutral-700 dark:text-loopfund-neutral-300 mb-2">
                      Goal Name
                    </label>
                    <input
                      name="name"
                      type="text"
                      required
                      className="w-full px-4 py-3 border border-loopfund-neutral-300 dark:border-loopfund-neutral-600 rounded-xl focus:ring-2 focus:ring-loopfund-emerald-500 focus:border-transparent"
                      placeholder="e.g., Emergency Fund"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-loopfund-neutral-700 dark:text-loopfund-neutral-300 mb-2">
                      Target Amount (STX)
                    </label>
                    <input
                      name="targetAmount"
                      type="number"
                      step="0.1"
                      min="0.1"
                      required
                      className="w-full px-4 py-3 border border-loopfund-neutral-300 dark:border-loopfund-neutral-600 rounded-xl focus:ring-2 focus:ring-loopfund-emerald-500 focus:border-transparent"
                      placeholder="2.5"
                      onChange={(e) => {
                        const targetAmount = parseFloat(e.target.value) || 0;
                        const deadline = document.querySelector('input[name="deadline"]').value;
                        
                        if (targetAmount > 0 && deadline) {
                          const deadlineDate = new Date(deadline);
                          const now = new Date();
                          const daysUntilTarget = Math.ceil((deadlineDate - now) / (1000 * 60 * 60 * 24));
                          
                          if (daysUntilTarget > 0) {
                            const dailyContribution = targetAmount / daysUntilTarget;
                            const weeklyContribution = dailyContribution * 7;
                            const monthlyContribution = dailyContribution * 30;
                            
                            // Update contribution display
                            const contributionDiv = document.getElementById('contribution-calculation');
                            if (contributionDiv) {
                              contributionDiv.innerHTML = `
                                <div class="bg-loopfund-emerald-50 dark:bg-loopfund-emerald-900/20 border border-loopfund-emerald-200 dark:border-loopfund-emerald-800 rounded-xl p-4 mt-3">
                                  <h4 class="font-semibold text-loopfund-emerald-700 dark:text-loopfund-emerald-300 mb-2">Contribution Schedule</h4>
                                  <div class="grid grid-cols-3 gap-2 text-sm">
                                    <div class="text-center">
                                      <div class="font-semibold text-loopfund-neutral-900 dark:text-loopfund-dark-text">${dailyContribution.toFixed(2)} STX</div>
                                      <div class="text-loopfund-neutral-600 dark:text-loopfund-neutral-400">Daily</div>
                                    </div>
                                    <div class="text-center">
                                      <div class="font-semibold text-loopfund-neutral-900 dark:text-loopfund-dark-text">${weeklyContribution.toFixed(2)} STX</div>
                                      <div class="text-loopfund-neutral-600 dark:text-loopfund-neutral-400">Weekly</div>
                                    </div>
                                    <div class="text-center">
                                      <div class="font-semibold text-loopfund-neutral-900 dark:text-loopfund-dark-text">${monthlyContribution.toFixed(2)} STX</div>
                                      <div class="text-loopfund-neutral-600 dark:text-loopfund-neutral-400">Monthly</div>
                                    </div>
                                  </div>
                                  <p class="text-xs text-loopfund-neutral-500 dark:text-loopfund-neutral-400 mt-2">
                                    Based on ${daysUntilTarget} days remaining
                                  </p>
                                </div>
                              `;
                            }
                          }
                        }
                      }}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-loopfund-neutral-700 dark:text-loopfund-neutral-300 mb-2">
                      Category
                    </label>
                    <select
                      name="category"
                      required
                      className="w-full px-4 py-3 border border-loopfund-neutral-300 dark:border-loopfund-neutral-600 rounded-xl focus:ring-2 focus:ring-loopfund-emerald-500 focus:border-transparent"
                    >
                      <option value="Emergency">Emergency</option>
                      <option value="Travel">Travel</option>
                      <option value="Education">Education</option>
                      <option value="Investment">Investment</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-loopfund-neutral-700 dark:text-loopfund-neutral-300 mb-2">
                      Deadline
                    </label>
                    <input
                      name="deadline"
                      type="date"
                      required
                      className="w-full px-4 py-3 border border-loopfund-neutral-300 dark:border-loopfund-neutral-600 rounded-xl focus:ring-2 focus:ring-loopfund-emerald-500 focus:border-transparent"
                      onChange={(e) => {
                        const targetAmount = parseFloat(document.querySelector('input[name="targetAmount"]').value) || 0;
                        const deadline = new Date(e.target.value);
                        const now = new Date();
                        const daysUntilTarget = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));
                        
                        if (targetAmount > 0 && daysUntilTarget > 0) {
                          const dailyContribution = targetAmount / daysUntilTarget;
                          const weeklyContribution = dailyContribution * 7;
                          const monthlyContribution = dailyContribution * 30;
                          
                          // Update contribution display
                          const contributionDiv = document.getElementById('contribution-calculation');
                          if (contributionDiv) {
                            contributionDiv.innerHTML = `
                              <div class="bg-loopfund-emerald-50 dark:bg-loopfund-emerald-900/20 border border-loopfund-emerald-200 dark:border-loopfund-emerald-800 rounded-xl p-4 mt-3">
                                <h4 class="font-semibold text-loopfund-emerald-700 dark:text-loopfund-emerald-300 mb-2">Contribution Schedule</h4>
                                <div class="grid grid-cols-3 gap-2 text-sm">
                                  <div class="text-center">
                                    <div class="font-semibold text-loopfund-neutral-900 dark:text-loopfund-dark-text">${dailyContribution.toFixed(2)} STX</div>
                                    <div class="text-loopfund-neutral-600 dark:text-loopfund-neutral-400">Daily</div>
                                  </div>
                                  <div class="text-center">
                                    <div class="font-semibold text-loopfund-neutral-900 dark:text-loopfund-dark-text">${weeklyContribution.toFixed(2)} STX</div>
                                    <div class="text-loopfund-neutral-600 dark:text-loopfund-neutral-400">Weekly</div>
                                  </div>
                                  <div class="text-center">
                                    <div class="font-semibold text-loopfund-neutral-900 dark:text-loopfund-dark-text">${monthlyContribution.toFixed(2)} STX</div>
                                    <div class="text-loopfund-neutral-600 dark:text-loopfund-neutral-400">Monthly</div>
                                  </div>
                                </div>
                                <p class="text-xs text-loopfund-neutral-500 dark:text-loopfund-neutral-400 mt-2">
                                  Based on ${daysUntilTarget} days remaining
                                </p>
                              </div>
                            `;
                          }
                        }
                      }}
                    />
                    <div id="contribution-calculation"></div>
                  </div>
                </div>
                
                <div className="flex space-x-3 mt-6">
                  <LoopFundButton
                    variant="secondary"
                    size="lg"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 py-4 text-lg font-semibold rounded-xl"
                  >
                    Cancel
                  </LoopFundButton>
                  <LoopFundButton
                    variant="primary"
                    size="lg"
                    type="submit"
                    className="flex-1 py-4 text-lg font-semibold rounded-xl"
                  >
                    Create Goal
                  </LoopFundButton>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Create Group Modal */}
      <AnimatePresence>
        {showCreateGroupModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white dark:bg-loopfund-dark-surface rounded-2xl p-8 max-w-md w-full shadow-loopfund-xl border border-loopfund-neutral-200 dark:border-loopfund-neutral-700"
            >
              <h3 className="font-display text-h3 text-loopfund-neutral-900 dark:text-loopfund-dark-text mb-6">
                Create New Group
              </h3>
              
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                handleCreateGroupSubmit({
                  name: formData.get('name'),
                  description: formData.get('description'),
                  targetAmount: parseFloat(formData.get('targetAmount')),
                  maxMembers: parseInt(formData.get('maxMembers')),
                  deadline: formData.get('deadline')
                });
              }}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-loopfund-neutral-700 dark:text-loopfund-neutral-300 mb-2">
                      Group Name
                    </label>
                    <input
                      name="name"
                      type="text"
                      required
                      className="w-full px-4 py-3 border border-loopfund-neutral-300 dark:border-loopfund-neutral-600 rounded-xl focus:ring-2 focus:ring-loopfund-emerald-500 focus:border-transparent"
                      placeholder="e.g., Family Vacation Fund"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-loopfund-neutral-700 dark:text-loopfund-neutral-300 mb-2">
                      Description
                    </label>
                    <textarea
                      name="description"
                      rows="3"
                      className="w-full px-4 py-3 border border-loopfund-neutral-300 dark:border-loopfund-neutral-600 rounded-xl focus:ring-2 focus:ring-loopfund-emerald-500 focus:border-transparent"
                      placeholder="Describe your group savings goal..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-loopfund-neutral-700 dark:text-loopfund-neutral-300 mb-2">
                      Target Amount (STX)
                    </label>
                    <input
                      name="targetAmount"
                      type="number"
                      step="0.1"
                      min="0.1"
                      required
                      className="w-full px-4 py-3 border border-loopfund-neutral-300 dark:border-loopfund-neutral-600 rounded-xl focus:ring-2 focus:ring-loopfund-emerald-500 focus:border-transparent"
                      placeholder="10.0"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-loopfund-neutral-700 dark:text-loopfund-neutral-300 mb-2">
                      Max Members
                    </label>
                    <input
                      name="maxMembers"
                      type="number"
                      min="2"
                      max="20"
                      required
                      className="w-full px-4 py-3 border border-loopfund-neutral-300 dark:border-loopfund-neutral-600 rounded-xl focus:ring-2 focus:ring-loopfund-emerald-500 focus:border-transparent"
                      placeholder="5"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-loopfund-neutral-700 dark:text-loopfund-neutral-300 mb-2">
                      Deadline
                    </label>
                    <input
                      name="deadline"
                      type="date"
                      required
                      className="w-full px-4 py-3 border border-loopfund-neutral-300 dark:border-loopfund-neutral-600 rounded-xl focus:ring-2 focus:ring-loopfund-emerald-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div className="flex space-x-3 mt-6">
                  <LoopFundButton
                    variant="secondary"
                    size="lg"
                    onClick={() => setShowCreateGroupModal(false)}
                    className="flex-1 py-4 text-lg font-semibold rounded-xl"
                  >
                    Cancel
                  </LoopFundButton>
                  <LoopFundButton
                    variant="primary"
                    size="lg"
                    type="submit"
                    className="flex-1 py-4 text-lg font-semibold rounded-xl"
                  >
                    Create Group
                  </LoopFundButton>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Goal Details Modal */}
      <AnimatePresence>
        {showGoalModal && selectedGoal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white dark:bg-loopfund-dark-surface rounded-2xl p-8 max-w-md w-full shadow-loopfund-xl border border-loopfund-neutral-200 dark:border-loopfund-neutral-700"
            >
              <h3 className="font-display text-h3 text-loopfund-neutral-900 dark:text-loopfund-dark-text mb-6">
                {selectedGoal.name}
              </h3>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-loopfund-neutral-600 dark:text-loopfund-neutral-400">Progress</span>
                  <span className="font-semibold">{Math.round((selectedGoal.currentAmount / selectedGoal.targetAmount) * 100)}%</span>
                </div>
                <div className="w-full bg-loopfund-neutral-200 dark:bg-loopfund-neutral-700 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full ${getProgressColor(Math.round((selectedGoal.currentAmount / selectedGoal.targetAmount) * 100))}`}
                    style={{ width: `${Math.round((selectedGoal.currentAmount / selectedGoal.targetAmount) * 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-sm">
                  <span>{typeof selectedGoal.currentAmount === 'number' ? selectedGoal.currentAmount : 0} STX</span>
                  <span>of {typeof selectedGoal.targetAmount === 'number' ? selectedGoal.targetAmount : 0} STX</span>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="bg-loopfund-emerald-50 dark:bg-loopfund-emerald-900/20 p-4 rounded-xl border border-loopfund-emerald-200 dark:border-loopfund-emerald-800">
                  <div className="flex items-center mb-2">
                    <DollarSign className="w-5 h-5 text-loopfund-emerald-600 dark:text-loopfund-emerald-400 mr-2" />
                    <span className="text-sm font-medium text-loopfund-emerald-800 dark:text-loopfund-emerald-200">
                      💰 Real Wallet Deduction
                    </span>
                  </div>
                  <p className="text-sm text-loopfund-emerald-700 dark:text-loopfund-emerald-300">
                    This will deduct STX from your connected wallet and deposit it into your goal vault on-chain.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-loopfund-neutral-700 dark:text-loopfund-neutral-300 mb-2">
                    Deposit Amount (STX)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    placeholder="Enter amount to deposit"
                    className="w-full px-4 py-3 border border-loopfund-neutral-300 dark:border-loopfund-neutral-600 rounded-xl focus:ring-2 focus:ring-loopfund-emerald-500 focus:border-transparent"
                    id="depositAmount"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <LoopFundButton
                    variant="primary"
                    size="lg"
                    onClick={() => {
                      const input = document.getElementById('depositAmount');
                      input.value = '0.1';
                      handleDeposit(0.1);
                    }}
                    className="w-full"
                  >
                    <DollarSign className="w-5 h-5 mr-2" />
                    0.1 STX
                  </LoopFundButton>
                  <LoopFundButton
                    variant="primary"
                    size="lg"
                    onClick={() => {
                      const input = document.getElementById('depositAmount');
                      input.value = '0.5';
                      handleDeposit(0.5);
                    }}
                    className="w-full"
                  >
                    <DollarSign className="w-5 h-5 mr-2" />
                    0.5 STX
                  </LoopFundButton>
                </div>

                <LoopFundButton
                  variant="primary"
                  size="lg"
                  onClick={() => {
                    const input = document.getElementById('depositAmount');
                    const amount = parseFloat(input.value);
                    if (amount && amount > 0) {
                      handleDeposit(amount);
                    } else {
                      toast.error('Please enter a valid amount');
                    }
                  }}
                  className="w-full"
                >
                  <DollarSign className="w-5 h-5 mr-2" />
                  Deposit Custom Amount
                </LoopFundButton>
                
                <LoopFundButton
                  variant="secondary"
                  size="lg"
                  onClick={() => setShowGoalModal(false)}
                  className="w-full"
                >
                  Close
                </LoopFundButton>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GoalsPage;