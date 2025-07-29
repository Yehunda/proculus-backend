const fs = require('fs');
const axios = require('axios');

async function checkSuccessSignals() {
  const signals = JSON.parse(fs.readFileSync('signals.json'));
  const successful = [];

  for (const signal of signals) {
    if (signal.status === 'success') {
      successful.push(signal);
      continue;
    }

    const coin = signal.pair.slice(0, 3).toLowerCase();
    const priceUrl = `https://api.coingecko.com/api/v3/simple/price?ids=${coin}&vs_currencies=usd`;

    try {
      const res = await axios.get(priceUrl);
      const price = res.data[coin]?.usd;

      const isSuccess =
        (signal.type === 'LONG' && price >= signal.target) ||
        (signal.type === 'SHORT' && price <= signal.target);

      if (isSuccess) {
        signal.status = 'success';
        successful.push(signal);
      }
    } catch (err) {
      console.error("Failed to fetch price for:", signal.pair);
    }
  }

  fs.writeFileSync('signals.json', JSON.stringify(signals, null, 2));
  fs.writeFileSync('success-signals.json', JSON.stringify(successful, null, 2));
}

checkSuccessSignals();
