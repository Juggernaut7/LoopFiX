// Real DeFi Controller - Production-ready DeFi operations
// Handles actual blockchain interactions, AI recommendations, and yield farming

const stacksService = require('../services/stacks.service');
const defiAIService = require('../services/defi-ai.service');
const huggingFaceAI = require('../services/huggingface-ai.service');

class DeFiRealController {
  constructor() {
    console.log('✅ Real DeFi Controller initialized - Production ready');
  }

  // Get comprehensive DeFi advice with real AI analysis
  async getDeFiAdvice(req, res, next) {
    try {
      const { query, userProfile } = req.body;
      const { walletAddress } = req.params;

      console.log('🤖 Real DeFi AI Advice Request:', { query, walletAddress });

      // Get real portfolio data from blockchain
      const portfolio = await stacksService.getUserPortfolio(walletAddress);
      const marketData = await stacksService.getMarketData();
      const yieldRates = await stacksService.getYieldRates();

      // Use Hugging Face AI for advanced analysis
      const aiAnalysis = await huggingFaceAI.getDeFiRecommendations(
        userProfile,
        portfolio.portfolio,
        marketData.marketData
      );

      // Get risk analysis
      const riskAnalysis = await huggingFaceAI.analyzeRiskProfile(
        userProfile,
        marketData.marketData
      );

      // Get yield predictions
      const yieldPredictions = await huggingFaceAI.predictYield(
        portfolio.portfolio,
        marketData.marketData,
        '12' // 12 months
      );

      // Generate comprehensive advice
      const advice = {
        query: query,
        walletAddress: walletAddress,
        aiRecommendations: aiAnalysis.recommendations || [],
        riskProfile: {
          score: riskAnalysis.riskScore,
          level: riskAnalysis.riskLevel,
          recommendations: riskAnalysis.recommendations
        },
        yieldPredictions: yieldPredictions.predictions,
        portfolio: portfolio.portfolio,
        marketConditions: marketData.marketData,
        yieldRates: yieldRates.yieldRates,
        confidence: aiAnalysis.confidence,
        timestamp: new Date().toISOString()
      };

      console.log('✅ Real DeFi AI Response generated:', advice.aiRecommendations.length, 'recommendations');

      res.json({
        success: true,
        data: advice,
        type: 'real_defi_advice'
      });
    } catch (error) {
      console.error('❌ Real DeFi Controller Error:', error);
      next(error);
    }
  }

  // Get real portfolio with blockchain data
  async getPortfolio(req, res, next) {
    try {
      const { walletAddress } = req.params;

      console.log('📊 Real Portfolio Request:', { walletAddress });

      // Get comprehensive portfolio data
      const [portfolio, marketData, yieldRates] = await Promise.all([
        stacksService.getUserPortfolio(walletAddress),
        stacksService.getMarketData(),
        stacksService.getYieldRates()
      ]);

      // Calculate portfolio metrics
      const portfolioMetrics = this.calculatePortfolioMetrics(
        portfolio.portfolio,
        marketData.marketData,
        yieldRates.yieldRates
      );

      const result = {
        success: true,
        portfolio: {
          ...portfolio.portfolio,
          metrics: portfolioMetrics,
          marketData: marketData.marketData,
          yieldRates: yieldRates.yieldRates
        }
      };

      res.json(result);
    } catch (error) {
      console.error('❌ Portfolio Error:', error);
      next(error);
    }
  }

  // Get real yield predictions with AI
  async getYieldPredictions(req, res, next) {
    try {
      const { userProfile } = req.body;
      const { walletAddress } = req.params;

      console.log('📈 Real Yield Predictions Request:', { walletAddress });

      // Get portfolio and market data
      const portfolio = await stacksService.getUserPortfolio(walletAddress);
      const marketData = await stacksService.getMarketData();

      // Use AI for yield predictions
      const predictions = await huggingFaceAI.predictYield(
        portfolio.portfolio,
        marketData.marketData,
        '12' // 12 months
      );

      // Get market analysis
      const marketAnalysis = await huggingFaceAI.getMarketAnalysis();

      const result = {
        success: true,
        predictions: predictions.predictions,
        marketAnalysis: marketAnalysis,
        confidence: predictions.confidence,
        factors: predictions.factors
      };

      res.json(result);
    } catch (error) {
      console.error('❌ Yield Predictions Error:', error);
      next(error);
    }
  }

  // Get real market analysis
  async getMarketAnalysis(req, res, next) {
    try {
      console.log('📊 Real Market Analysis Request');

      // Get AI-powered market analysis
      const marketAnalysis = await huggingFaceAI.getMarketAnalysis();
      const marketData = await stacksService.getMarketData();
      const yieldRates = await stacksService.getYieldRates();

      const result = {
        success: true,
        analysis: {
          sentiment: marketAnalysis.sentiment,
          trends: marketAnalysis.marketTrends,
          opportunities: marketAnalysis.opportunities,
          marketData: marketData.marketData,
          yieldRates: yieldRates.yieldRates
        }
      };

      res.json(result);
    } catch (error) {
      console.error('❌ Market Analysis Error:', error);
      next(error);
    }
  }

  // Get optimal DeFi strategy
  async getOptimalStrategy(req, res, next) {
    try {
      const { userProfile } = req.body;
      const { walletAddress } = req.params;

      console.log('🎯 Optimal Strategy Request:', { walletAddress });

      // Get user portfolio
      const portfolio = await stacksService.getUserPortfolio(walletAddress);
      
      // Calculate optimal strategy
      const strategy = await stacksService.calculateOptimalStrategy(
        userProfile,
        userProfile.riskTolerance || 'moderate'
      );

      // Get AI recommendations
      const aiRecommendations = await huggingFaceAI.getDeFiRecommendations(
        userProfile,
        portfolio.portfolio,
        {}
      );

      const result = {
        success: true,
        strategy: {
          ...strategy,
          aiRecommendations: aiRecommendations.recommendations,
          confidence: aiRecommendations.confidence
        }
      };

      res.json(result);
    } catch (error) {
      console.error('❌ Optimal Strategy Error:', error);
      next(error);
    }
  }

  // Get real yield rates from blockchain
  async getYieldRates(req, res, next) {
    try {
      console.log('💰 Real Yield Rates Request');

      const yieldRates = await stacksService.getYieldRates();
      const marketData = await stacksService.getMarketData();

      const result = {
        success: true,
        yieldRates: yieldRates.yieldRates,
        marketData: marketData.marketData,
        timestamp: new Date().toISOString()
      };

      res.json(result);
    } catch (error) {
      console.error('❌ Yield Rates Error:', error);
      next(error);
    }
  }

  // Get wallet balance
  async getWalletBalance(req, res, next) {
    try {
      const { walletAddress } = req.params;

      console.log('💰 Wallet Balance Request:', { walletAddress });

      const balance = await stacksService.getWalletBalance(walletAddress);

      res.json(balance);
    } catch (error) {
      console.error('❌ Wallet Balance Error:', error);
      next(error);
    }
  }

  // Get transaction history
  async getTransactionHistory(req, res, next) {
    try {
      const { walletAddress } = req.params;

      console.log('📜 Transaction History Request:', { walletAddress });

      const history = await stacksService.getTransactionHistory(walletAddress);

      res.json(history);
    } catch (error) {
      console.error('❌ Transaction History Error:', error);
      next(error);
    }
  }

  // Get real market data
  async getMarketData(req, res, next) {
    try {
      console.log('📈 Real Market Data Request');

      const marketData = await stacksService.getMarketData();
      const yieldRates = await stacksService.getYieldRates();

      const result = {
        success: true,
        marketData: {
          ...marketData.marketData,
          yieldRates: yieldRates.yieldRates,
          timestamp: new Date().toISOString()
        }
      };

      res.json(result);
    } catch (error) {
      console.error('❌ Market Data Error:', error);
      next(error);
    }
  }

  // Get vault information from smart contract
  async getVaultInfo(req, res, next) {
    try {
      const { vaultId } = req.params;

      console.log('🏦 Vault Info Request:', { vaultId });

      const vaultInfo = await stacksService.getVaultInfo(vaultId);

      res.json(vaultInfo);
    } catch (error) {
      console.error('❌ Vault Info Error:', error);
      next(error);
    }
  }

  // Get vault progress
  async getVaultProgress(req, res, next) {
    try {
      const { vaultId } = req.params;

      console.log('📊 Vault Progress Request:', { vaultId });

      const progress = await stacksService.getVaultProgress(vaultId);

      res.json(progress);
    } catch (error) {
      console.error('❌ Vault Progress Error:', error);
      next(error);
    }
  }

  // Get group information
  async getGroupInfo(req, res, next) {
    try {
      const { groupId } = req.params;

      console.log('👥 Group Info Request:', { groupId });

      const groupInfo = await stacksService.getGroupInfo(groupId);

      res.json(groupInfo);
    } catch (error) {
      console.error('❌ Group Info Error:', error);
      next(error);
    }
  }

  // Get group progress
  async getGroupProgress(req, res, next) {
    try {
      const { groupId } = req.params;

      console.log('📈 Group Progress Request:', { groupId });

      const progress = await stacksService.getGroupProgress(groupId);

      res.json(progress);
    } catch (error) {
      console.error('❌ Group Progress Error:', error);
      next(error);
    }
  }

  // Get total statistics
  async getTotalStats(req, res, next) {
    try {
      console.log('📊 Total Stats Request');

      const stats = await stacksService.getTotalStats();

      res.json(stats);
    } catch (error) {
      console.error('❌ Total Stats Error:', error);
      next(error);
    }
  }

  // Calculate portfolio metrics
  calculatePortfolioMetrics(portfolio, marketData, yieldRates) {
    const totalValue = portfolio.balance || 0;
    const stxPrice = marketData.stx_price || 2.45;
    const usdValue = (totalValue / 1000000) * stxPrice;

    // Calculate potential yield
    const avgYield = (yieldRates.stx_staking.apy + yieldRates.btc_yield.apy + yieldRates.defi_pools.apy) / 3;
    const potentialAnnualYield = (totalValue * avgYield / 100) / 1000000;

    return {
      totalValueSTX: totalValue,
      totalValueUSD: usdValue,
      potentialAnnualYield: potentialAnnualYield,
      averageAPY: avgYield,
      riskScore: this.calculateRiskScore(portfolio),
      diversification: this.calculateDiversification(portfolio)
    };
  }

  // Calculate risk score
  calculateRiskScore(portfolio) {
    let riskScore = 0.5; // Base risk score

    // Adjust based on portfolio composition
    if (portfolio.vaults && portfolio.vaults.length > 0) {
      riskScore += 0.1; // Vaults add some risk
    }

    if (portfolio.groups && portfolio.groups.length > 0) {
      riskScore += 0.2; // Groups add more risk
    }

    return Math.min(riskScore, 1.0);
  }

  // Calculate diversification
  calculateDiversification(portfolio) {
    const totalAssets = (portfolio.vaults?.length || 0) + (portfolio.groups?.length || 0);
    
    if (totalAssets === 0) return 0;
    if (totalAssets === 1) return 0.3;
    if (totalAssets <= 3) return 0.6;
    return 0.9;
  }
}

module.exports = new DeFiRealController();
