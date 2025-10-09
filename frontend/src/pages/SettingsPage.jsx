import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Wallet, 
  Settings, 
  Bell, 
  Moon, 
  Sun, 
  HelpCircle, 
  ExternalLink,
  Copy,
  LogOut,
  Shield,
  Globe,
  Mail
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuthWithToast } from '../hooks/useAuthWithToast';
import { useNavigate } from 'react-router-dom';
import LoopFundCard from '../components/ui/LoopFundCard';
import LoopFundButton from '../components/ui/LoopFundButton';
import stacksService from '../services/stacksService';

const SettingsPage = () => {
  const [walletAddress, setWalletAddress] = useState('');
  const [network, setNetwork] = useState('Testnet');
  const [notifications, setNotifications] = useState(true);
  const { theme, toggleTheme, isDark } = useTheme();
  const { logout } = useAuthWithToast();
  const navigate = useNavigate();

  useEffect(() => {
    const connectionStatus = stacksService.getConnectionStatus();
    if (connectionStatus.isConnected) {
      setWalletAddress(connectionStatus.address);
    }
  }, []);

  const handleDisconnect = () => {
    logout();
    navigate('/');
  };

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(walletAddress);
    // You could add a toast notification here
  };

  const handleViewExplorer = () => {
    window.open(`https://explorer.stacks.co/address/${walletAddress}`, '_blank');
  };

  const handleContactSupport = () => {
    window.open('mailto:support@loopfi.com', '_blank');
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="font-display text-h1 text-loopfund-neutral-900 dark:text-loopfund-dark-text mb-2">
          Settings
        </h1>
        <p className="text-loopfund-neutral-600 dark:text-loopfund-neutral-400 text-lg">
          Manage your account, preferences, and wallet
        </p>
      </motion.div>

      {/* Profile Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <LoopFundCard className="p-6">
          <div className="flex items-center space-x-4 mb-6">
            <div className="p-3 bg-loopfund-emerald-100 dark:bg-loopfund-emerald-900/30 rounded-xl">
              <Wallet className="w-6 h-6 text-loopfund-emerald-600 dark:text-loopfund-emerald-400" />
            </div>
            <div>
              <h2 className="font-display text-h3 text-loopfund-neutral-900 dark:text-loopfund-dark-text">
                Wallet Profile
              </h2>
              <p className="text-loopfund-neutral-600 dark:text-loopfund-neutral-400">
                Manage your connected wallet
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-loopfund-neutral-700 dark:text-loopfund-neutral-300 mb-2">
                Wallet Address
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={walletAddress ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : 'Not connected'}
                  readOnly
                  className="flex-1 px-4 py-3 border border-loopfund-neutral-300 dark:border-loopfund-neutral-600 rounded-xl bg-loopfund-neutral-50 dark:bg-loopfund-midnight-800/50"
                />
                <LoopFundButton
                  variant="secondary"
                  size="sm"
                  onClick={handleCopyAddress}
                >
                  <Copy className="w-4 h-4" />
                </LoopFundButton>
                <LoopFundButton
                  variant="secondary"
                  size="sm"
                  onClick={handleViewExplorer}
                >
                  <ExternalLink className="w-4 h-4" />
                </LoopFundButton>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-loopfund-neutral-700 dark:text-loopfund-neutral-300 mb-2">
                Network
              </label>
              <div className="flex items-center space-x-2">
                <Globe className="w-4 h-4 text-loopfund-neutral-500" />
                <span className="text-loopfund-neutral-900 dark:text-loopfund-dark-text">
                  {network}
                </span>
              </div>
            </div>
          </div>
        </LoopFundCard>
      </motion.div>

      {/* Preferences */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <LoopFundCard className="p-6">
          <div className="flex items-center space-x-4 mb-6">
            <div className="p-3 bg-loopfund-coral-100 dark:bg-loopfund-coral-900/30 rounded-xl">
              <Settings className="w-6 h-6 text-loopfund-coral-600 dark:text-loopfund-coral-400" />
            </div>
            <div>
              <h2 className="font-display text-h3 text-loopfund-neutral-900 dark:text-loopfund-dark-text">
                Preferences
              </h2>
              <p className="text-loopfund-neutral-600 dark:text-loopfund-neutral-400">
                Customize your experience
              </p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Theme Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {isDark ? (
                  <Moon className="w-5 h-5 text-loopfund-neutral-600 dark:text-loopfund-neutral-400" />
                ) : (
                  <Sun className="w-5 h-5 text-loopfund-neutral-600 dark:text-loopfund-neutral-400" />
                )}
                <div>
                  <h3 className="font-medium text-loopfund-neutral-900 dark:text-loopfund-dark-text">
                    Theme
                  </h3>
                  <p className="text-sm text-loopfund-neutral-600 dark:text-loopfund-neutral-400">
                    {isDark ? 'Dark mode' : 'Light mode'}
                  </p>
                </div>
              </div>
              <LoopFundButton
                variant="secondary"
                size="sm"
                onClick={toggleTheme}
              >
                {isDark ? 'Light' : 'Dark'}
              </LoopFundButton>
            </div>

            {/* Notifications Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Bell className="w-5 h-5 text-loopfund-neutral-600 dark:text-loopfund-neutral-400" />
                <div>
                  <h3 className="font-medium text-loopfund-neutral-900 dark:text-loopfund-dark-text">
                    Notifications
                  </h3>
                  <p className="text-sm text-loopfund-neutral-600 dark:text-loopfund-neutral-400">
                    Goal reminders and updates
                  </p>
                </div>
              </div>
              <button
                onClick={() => setNotifications(!notifications)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  notifications ? 'bg-loopfund-emerald-500' : 'bg-loopfund-neutral-300 dark:bg-loopfund-neutral-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    notifications ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </LoopFundCard>
      </motion.div>

      {/* Support */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <LoopFundCard className="p-6">
          <div className="flex items-center space-x-4 mb-6">
            <div className="p-3 bg-loopfund-gold-100 dark:bg-loopfund-gold-900/30 rounded-xl">
              <HelpCircle className="w-6 h-6 text-loopfund-gold-600 dark:text-loopfund-gold-400" />
            </div>
            <div>
              <h2 className="font-display text-h3 text-loopfund-neutral-900 dark:text-loopfund-dark-text">
                Support
              </h2>
              <p className="text-loopfund-neutral-600 dark:text-loopfund-neutral-400">
                Get help and support
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <LoopFundButton
              variant="secondary"
              size="md"
              onClick={() => window.open('https://docs.loopfi.com', '_blank')}
              className="w-full justify-start"
            >
              <ExternalLink className="w-4 h-4 mr-3" />
              Documentation
            </LoopFundButton>
            
            <LoopFundButton
              variant="secondary"
              size="md"
              onClick={() => window.open('https://discord.gg/loopfi', '_blank')}
              className="w-full justify-start"
            >
              <ExternalLink className="w-4 h-4 mr-3" />
              Discord Community
            </LoopFundButton>
            
            <LoopFundButton
              variant="secondary"
              size="md"
              onClick={() => window.open('https://twitter.com/loopfi', '_blank')}
              className="w-full justify-start"
            >
              <ExternalLink className="w-4 h-4 mr-3" />
              Twitter
            </LoopFundButton>
            
            <LoopFundButton
              variant="secondary"
              size="md"
              onClick={handleContactSupport}
              className="w-full justify-start"
            >
              <Mail className="w-4 h-4 mr-3" />
              Contact Support
            </LoopFundButton>
          </div>
        </LoopFundCard>
      </motion.div>

      {/* Disconnect Wallet */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <LoopFundCard className="p-6 border border-loopfund-coral-200 dark:border-loopfund-coral-800">
          <div className="flex items-center space-x-4 mb-6">
            <div className="p-3 bg-loopfund-coral-100 dark:bg-loopfund-coral-900/30 rounded-xl">
              <LogOut className="w-6 h-6 text-loopfund-coral-600 dark:text-loopfund-coral-400" />
            </div>
            <div>
              <h2 className="font-display text-h3 text-loopfund-neutral-900 dark:text-loopfund-dark-text">
                Disconnect Wallet
              </h2>
              <p className="text-loopfund-neutral-600 dark:text-loopfund-neutral-400">
                Disconnect your wallet and return to landing page
              </p>
            </div>
          </div>

          <LoopFundButton
            variant="secondary"
            size="md"
            onClick={handleDisconnect}
            className="w-full bg-loopfund-coral-50 dark:bg-loopfund-coral-900/20 text-loopfund-coral-700 dark:text-loopfund-coral-300 hover:bg-loopfund-coral-100 dark:hover:bg-loopfund-coral-900/30"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Disconnect Wallet
          </LoopFundButton>
        </LoopFundCard>
      </motion.div>
    </div>
  );
};

export default SettingsPage;