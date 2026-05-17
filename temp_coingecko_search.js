const https = require('https');
const terms = ['BRETT','POPCAT','MOG','BOME','BABYDOGE','SAFEMOON','WOJAK','BONE','PEPE2'];
const search = (t) => new Promise((res, rej) => {
  https.get('https://api.coingecko.com/api/v3/search?query=' + encodeURIComponent(t), (r) => {
    let d = '';
    r.on('data', (c) => d += c);
    r.on('end', () => {
      try { res(JSON.parse(d)); } catch (e) { rej(e); }
    });
  }).on('error', rej);
});
(async () => {
  for (const t of terms) {
    const data = await search(t);
    console.log('TERM', t, 'coins:', data.coins.slice(0,6).map(c => ({id: c.id, symbol: c.symbol, name: c.name})));
  }
})();
