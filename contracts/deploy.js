// Deployment script for LoopFiX contracts to Stacks testnet/mainnet
// Run: node deploy.js [testnet|mainnet]

// Load environment variables from .env file
require('dotenv').config();

const { 
  makeContractDeploy,
  makeContractCall,
  broadcastTransaction,
  AnchorMode,
  PostConditionMode,
  StandardPrincipalCV,
  uintCV,
  stringAsciiCV
} = require('@stacks/transactions');
const { StacksTestnet, StacksMainnet } = require('@stacks/network');
const fs = require('fs');
const path = require('path');

// Configuration
const NETWORK_TYPE = process.argv[2] || 'testnet';
const PRIVATE_KEY = process.env.STACKS_PRIVATE_KEY || 'YOUR_PRIVATE_KEY_HERE';

// Network setup
const network = NETWORK_TYPE === 'mainnet' 
  ? new StacksMainnet() 
  : new StacksTestnet();

console.log(`🚀 Deploying to ${NETWORK_TYPE}...`);
console.log(`📡 Network: ${network.coreApiUrl}`);

// Contract files
const contracts = [
  {
    name: 'savingsvault',
    file: 'SavingsVault.clar',
    displayName: 'Individual Savings Vault'
  },
  {
    name: 'groupvault',
    file: 'GroupVault.clar',
    displayName: 'Group Savings Vault'
  },
  {
    name: 'advisornft',
    file: 'AdvisorNFT.clar',
    displayName: 'Milestone Achievement NFT'
  }
];

// Deploy a single contract
async function deployContract(contractName, contractFile, displayName) {
  try {
    console.log(`\n📄 Deploying ${displayName} (${contractName})...`);
    
    // Read contract source with explicit UTF-8 encoding
    const contractSource = fs.readFileSync(
      path.join(__dirname, contractFile),
      { encoding: 'utf8' }
    ).replace(/\r\n/g, '\n').trim(); // Normalize line endings and trim
    
    // Create deploy transaction
    const txOptions = {
      contractName: contractName,
      codeBody: contractSource,
      senderKey: PRIVATE_KEY,
      network: network,
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Allow
    };
    
    const transaction = await makeContractDeploy(txOptions);
    
    // Broadcast transaction
    const broadcastResponse = await broadcastTransaction(transaction, network);
    
    if (broadcastResponse.error) {
      console.error(`❌ Error deploying ${contractName}:`, broadcastResponse.error);
      console.error('   Reason:', broadcastResponse.reason);
      return null;
    }
    
    console.log(`✅ ${displayName} deployed!`);
    console.log(`   Transaction ID: ${broadcastResponse.txid}`);
    console.log(`   Explorer: https://explorer.hiro.so/txid/${broadcastResponse.txid}?chain=${NETWORK_TYPE}`);
    
    return {
      name: contractName,
      txid: broadcastResponse.txid,
      status: 'success'
    };
    
  } catch (error) {
    console.error(`❌ Failed to deploy ${contractName}:`, error.message);
    return {
      name: contractName,
      error: error.message,
      status: 'failed'
    };
  }
}

// Deploy all contracts
async function deployAll() {
  console.log('\n╔════════════════════════════════════════════════╗');
  console.log('║   LoopFiX Contract Deployment                  ║');
  console.log('╚════════════════════════════════════════════════╝\n');
  
  if (PRIVATE_KEY === 'YOUR_PRIVATE_KEY_HERE') {
    console.error('\n❌ ERROR: Please set your STACKS_PRIVATE_KEY environment variable!');
    console.log('\nOn Windows (PowerShell):');
    console.log('  $env:STACKS_PRIVATE_KEY = "your_private_key_here"');
    console.log('  node deploy.js testnet\n');
    console.log('On Mac/Linux:');
    console.log('  export STACKS_PRIVATE_KEY="your_private_key_here"');
    console.log('  node deploy.js testnet\n');
    process.exit(1);
  }
  
  const results = [];
  
  // Deploy contracts sequentially
  for (const contract of contracts) {
    const result = await deployContract(
      contract.name,
      contract.file,
      contract.displayName
    );
    results.push(result);
    
    // Wait 30 seconds between deployments to avoid nonce issues
    if (contracts.indexOf(contract) < contracts.length - 1) {
      console.log('\n⏳ Waiting 30 seconds before next deployment...');
      await new Promise(resolve => setTimeout(resolve, 30000));
    }
  }
  
  // Summary
  console.log('\n\n╔════════════════════════════════════════════════╗');
  console.log('║   Deployment Summary                           ║');
  console.log('╚════════════════════════════════════════════════╝\n');
  
  const successful = results.filter(r => r && r.status === 'success');
  const failed = results.filter(r => !r || r.status === 'failed');
  
  console.log(`✅ Successfully deployed: ${successful.length}/${results.length}`);
  console.log(`❌ Failed: ${failed.length}/${results.length}\n`);
  
  if (successful.length > 0) {
    console.log('✅ Successful deployments:');
    successful.forEach(r => {
      console.log(`   - ${r.name}: ${r.txid}`);
    });
  }
  
  if (failed.length > 0) {
    console.log('\n❌ Failed deployments:');
    failed.forEach(r => {
      console.log(`   - ${r.name}: ${r.error || 'Unknown error'}`);
    });
  }
  
  // Save deployment info
  const deploymentInfo = {
    network: NETWORK_TYPE,
    timestamp: new Date().toISOString(),
    results: results
  };
  
  const outputFile = `deployment-${NETWORK_TYPE}-${Date.now()}.json`;
  fs.writeFileSync(outputFile, JSON.stringify(deploymentInfo, null, 2));
  console.log(`\n📝 Deployment info saved to: ${outputFile}`);
  
  console.log('\n🎉 Deployment process complete!\n');
}

// Run deployment
deployAll().catch(error => {
  console.error('\n❌ Fatal error during deployment:', error);
  process.exit(1);
});

