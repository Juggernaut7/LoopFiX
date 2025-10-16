// Check balances of all derived wallet addresses
const axios = require('axios');

const addresses = [
  'ST3B7P4ARCWT0RTNF369N3BA1NTKPZVDSF9763K3Q', // Derivation path 1
  'ST3VZZAX3QPWXGZXQKXY5CKVN15H35VC2R7190Q4S', // Derivation path 2
  'STYWCFR8WKS5XWWJTNW67R0KEZZH88ERM2QWW7K5'  // Derivation path 3
];

console.log('\n💰 Checking Multiple Wallet Balances...\n');

async function checkBalance(address, index) {
  try {
    const response = await axios.get(
      `https://api.testnet.hiro.so/extended/v1/address/${address}/balances`
    );
    
    const stxBalance = parseInt(response.data.stx.balance) / 1000000;
    const stxLocked = parseInt(response.data.stx.locked) / 1000000;
    const available = stxBalance - stxLocked;
    
    console.log(`Wallet ${index + 1}: ${address}`);
    console.log(`  Balance: ${stxBalance.toFixed(6)} STX`);
    console.log(`  Available: ${available.toFixed(6)} STX`);
    console.log(`  🔗 https://explorer.hiro.so/address/${address}?chain=testnet`);
    console.log('');
    
    return { address, balance: available };
  } catch (error) {
    console.log(`Wallet ${index + 1}: ${address}`);
    console.log(`  ❌ Error: ${error.message}`);
    console.log('');
    return { address, balance: 0 };
  }
}

(async () => {
  console.log('═══════════════════════════════════════════════════════════\n');
  
  const results = [];
  for (let i = 0; i < addresses.length; i++) {
    const result = await checkBalance(addresses[i], i);
    results.push(result);
  }
  
  console.log('═══════════════════════════════════════════════════════════');
  console.log('\n📊 Summary:\n');
  
  const withBalance = results.filter(r => r.balance > 0);
  if (withBalance.length > 0) {
    console.log('✅ Wallets with STX:');
    withBalance.forEach(w => {
      console.log(`   ${w.address}: ${w.balance.toFixed(6)} STX`);
    });
  } else {
    console.log('⚠️  No wallets have STX balance');
  }
  
  console.log('\n');
})();

