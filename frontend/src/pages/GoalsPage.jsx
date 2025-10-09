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
import stacksService from '../services/stacksService';

const GoalsPage = () => {
  const [activeTab, setActiveTab] = useState('my-goals');
  const [goals, setGoals] = useState([]);
  const [groupPools, setGroupPools] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Mock data for goals
  useEffect(() => {
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
      },
      {
        id: 2,
        name: 'Vacation Fund',
        targetAmount: 1.5,
        currentAmount: 0.8,
        category: 'Travel',
        deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        isGroupGoal: true,
        apy: 12.3,
        progress: 53
      },
      {
        id: 3,
        name: 'Education Fund',
        targetAmount: 3.0,
        currentAmount: 1.0,
        category: 'Education',
        deadline: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000),
        isGroupGoal: false,
        apy: 10.2,
        progress: 33
      }
    ];

    const mockGroupPools = [
      {
        id: 1,
        name: 'Family Vacation Pool',
        targetAmount: 5.0,
        currentAmount: 2.1,
        members: 4,
        deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
        apy: 15.7,
        progress: 42
      },
      {
        id: 2,
        name: 'Wedding Fund Pool',
        targetAmount: 8.0,
        currentAmount: 3.2,
        members: 6,
        deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        apy: 12.5,
        progress: 40
      }
    ];

    setGoals(mockGoals);
    setGroupPools(mockGroupPools);
    setIsLoading(false);
  }, []);

  const handleCreateGoal = () => {
    setShowCreateModal(true);
  };

  const handleGoalClick = (goal) => {
    setSelectedGoal(goal);
    setShowGoalModal(true);
  };

  const handleCreateGoalSubmit = (goalData) => {
    // Mock goal creation
    const newGoal = {
      id: Date.now(),
      ...goalData,
      currentAmount: 0,
      progress: 0,
      deadline: new Date(goalData.deadline)
    };
    setGoals([...goals, newGoal]);
    setShowCreateModal(false);
    toast.success('Goal created successfully!');
  };

  const handleDeposit = (amount) => {
    if (!selectedGoal) return;
    
    // Mock deposit
    const updatedGoals = goals.map(goal => 
      goal.id === selectedGoal.id 
        ? { 
            ...goal, 
            currentAmount: goal.currentAmount + amount,
            progress: Math.min(100, ((goal.currentAmount + amount) / goal.targetAmount) * 100)
          }
        : goal
    );
    setGoals(updatedGoals);
    setShowGoalModal(false);
    toast.success(`Successfully deposited ${amount} STX!`);
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
        <LoopFundButton
          variant="primary"
          size="md"
          onClick={handleCreateGoal}
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Goal
        </LoopFundButton>
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
              key={goal.id}
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
                  {goal.category} • {goal.deadline.toLocaleDateString()}
                </p>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-loopfund-neutral-500 dark:text-loopfund-neutral-400">Progress</span>
                    <span className="font-semibold text-loopfund-neutral-900 dark:text-loopfund-dark-text">
                      {goal.progress}%
                    </span>
                  </div>
                  <div className="w-full bg-loopfund-neutral-200 dark:bg-loopfund-neutral-700 rounded-full h-2">
                    <motion.div
                      className={`h-2 rounded-full ${getProgressColor(goal.progress)}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${goal.progress}%` }}
                      transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                    />
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-loopfund-neutral-600 dark:text-loopfund-neutral-400">
                      {formatCurrencySimple(goal.currentAmount)} STX
                    </span>
                    <span className="text-loopfund-neutral-600 dark:text-loopfund-neutral-400">
                      of {formatCurrencySimple(goal.targetAmount)} STX
                    </span>
                  </div>
                </div>
              </LoopFundCard>
            </motion.div>
          ))
        ) : (
          groupPools.map((pool, index) => (
            <motion.div
              key={pool.id}
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
                    {pool.apy}% APY
                  </span>
                </div>
                
                <h3 className="font-display text-h4 text-loopfund-neutral-900 dark:text-loopfund-dark-text mb-2">
                  {pool.name}
                </h3>
                <p className="text-loopfund-neutral-600 dark:text-loopfund-neutral-400 mb-4">
                  {pool.members} members • {pool.deadline.toLocaleDateString()}
                </p>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-loopfund-neutral-500 dark:text-loopfund-neutral-400">Progress</span>
                    <span className="font-semibold text-loopfund-neutral-900 dark:text-loopfund-dark-text">
                      {pool.progress}%
                    </span>
                  </div>
                  <div className="w-full bg-loopfund-neutral-200 dark:bg-loopfund-neutral-700 rounded-full h-2">
                    <motion.div
                      className="h-2 rounded-full bg-loopfund-coral-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${pool.progress}%` }}
                      transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                    />
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-loopfund-neutral-600 dark:text-loopfund-neutral-400">
                      {formatCurrencySimple(pool.currentAmount)} STX
                    </span>
                    <span className="text-loopfund-neutral-600 dark:text-loopfund-neutral-400">
                      of {formatCurrencySimple(pool.targetAmount)} STX
                    </span>
                  </div>
                </div>
              </LoopFundCard>
            </motion.div>
          ))
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
                    />
                  </div>
                </div>
                
                <div className="flex space-x-3 mt-6">
                  <LoopFundButton
                    variant="secondary"
                    size="md"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1"
                  >
                    Cancel
                  </LoopFundButton>
                  <LoopFundButton
                    variant="primary"
                    size="md"
                    type="submit"
                    className="flex-1"
                  >
                    Create Goal
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
                  <span className="font-semibold">{selectedGoal.progress}%</span>
                </div>
                <div className="w-full bg-loopfund-neutral-200 dark:bg-loopfund-neutral-700 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full ${getProgressColor(selectedGoal.progress)}`}
                    style={{ width: `${selectedGoal.progress}%` }}
                  />
                </div>
                <div className="flex justify-between text-sm">
                  <span>{formatCurrencySimple(selectedGoal.currentAmount)} STX</span>
                  <span>of {formatCurrencySimple(selectedGoal.targetAmount)} STX</span>
                </div>
              </div>
              
              <div className="space-y-3">
                <LoopFundButton
                  variant="primary"
                  size="md"
                  onClick={() => handleDeposit(0.1)}
                  className="w-full"
                >
                  <DollarSign className="w-4 h-4 mr-2" />
                  Deposit 0.1 STX
                </LoopFundButton>
                <LoopFundButton
                  variant="secondary"
                  size="md"
                  onClick={() => handleDeposit(0.5)}
                  className="w-full"
                >
                  <DollarSign className="w-4 h-4 mr-2" />
                  Deposit 0.5 STX
                </LoopFundButton>
                <LoopFundButton
                  variant="secondary"
                  size="md"
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