// Real DeFi Routes - Production-ready DeFi operations
// Handles actual blockchain interactions and AI recommendations

const express = require('express');
const router = express.Router();
const defiRealController = require('../controllers/defi-real.controller');

// Real DeFi AI Advice with Hugging Face integration
router.post('/advice/:walletAddress', defiRealController.getDeFiAdvice);

// Real Portfolio Management with blockchain data
router.get('/portfolio/:walletAddress', defiRealController.getPortfolio);
router.get('/wallet/:walletAddress/balance', defiRealController.getWalletBalance);
router.get('/wallet/:walletAddress/transactions', defiRealController.getTransactionHistory);

// Real Yield and Market Analysis with AI
router.post('/yield-predictions/:walletAddress', defiRealController.getYieldPredictions);
router.get('/market-analysis', defiRealController.getMarketAnalysis);
router.post('/optimal-strategy/:walletAddress', defiRealController.getOptimalStrategy);
router.get('/yield-rates', defiRealController.getYieldRates);
router.get('/market-data', defiRealController.getMarketData);

// Real Vault Operations with smart contracts
router.get('/vault/:vaultId', defiRealController.getVaultInfo);
router.get('/vault/:vaultId/progress', defiRealController.getVaultProgress);

// Real Group Operations with smart contracts
router.get('/group/:groupId', defiRealController.getGroupInfo);
router.get('/group/:groupId/progress', defiRealController.getGroupProgress);

// Real Statistics from blockchain
router.get('/stats', defiRealController.getTotalStats);

module.exports = router;
