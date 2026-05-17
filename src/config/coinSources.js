export const MEME_COIN_DATA = [
  { symbol: "DOGE", name: "Dogecoin", exchange: "BINANCE", symbolPair: "DOGEUSDT", stream: "dogeusdt@ticker", chartSymbol: "BINANCE:DOGEUSDT" },
  { symbol: "SHIB", name: "Shiba Inu", exchange: "BINANCE", symbolPair: "SHIBUSDT", stream: "shibusdt@ticker", chartSymbol: "BINANCE:SHIBUSDT" },
  { symbol: "PEPE", name: "Pepe", exchange: "BINANCE", symbolPair: "PEPEUSDT", stream: "pepeusdt@ticker", chartSymbol: "BINANCE:PEPEUSDT" },
  { symbol: "FLOKI", name: "Floki", exchange: "BINANCE", symbolPair: "FLOKIUSDT", stream: "flokiusdt@ticker", chartSymbol: "BINANCE:FLOKIUSDT" },
  { symbol: "WIF", name: "Wif", exchange: "BINANCE", symbolPair: "WIFUSDT", stream: "wifusdt@ticker", chartSymbol: "BINANCE:WIFUSDT" },
  { symbol: "BONK", name: "Bonk", exchange: "BINANCE", symbolPair: "BONKUSDT", stream: "bonkusdt@ticker", chartSymbol: "BINANCE:BONKUSDT" },
  { symbol: "BRETT", name: "Brett", exchange: "BITGET", symbolPair: "BRETTUSDT", chartSymbol: "BITGET:BRETTUSDT", coingeckoId: "brett" },
  { symbol: "POPCAT", name: "Popcat", exchange: "UNKNOWN", symbolPair: "POPCATUSDT", coingeckoId: "popcat" },
  { symbol: "MOG", name: "Mog", exchange: "BITGET", symbolPair: "MOGUSDT", chartSymbol: "BITGET:MOGUSDT", coingeckoId: "mog-coin" },
  { symbol: "BOME", name: "Bome", exchange: "BINANCE", symbolPair: "BOMEUSDT", stream: "bomeusdt@ticker", chartSymbol: "BINANCE:BOMEUSDT", coingeckoId: "book-of-meme" },
  { symbol: "BABYDOGE", name: "Baby Doge", exchange: "UNKNOWN", symbolPair: "BABYDOGEUSDT", coingeckoId: "baby-doge-coin" },
  { symbol: "SAFEMOON", name: "SafeMoon", exchange: "UNKNOWN", symbolPair: "SAFEMOONUSDT", coingeckoId: "safemoon-4" },
  { symbol: "WOJAK", name: "Wojak", exchange: "BITGET", symbolPair: "WOJAKUSDT", chartSymbol: "BITGET:WOJAKUSDT", coingeckoId: "wojak" },
  { symbol: "BONE", name: "Bone", exchange: "UNKNOWN", symbolPair: "BONEUSDT", coingeckoId: "bone-shibaswap" },
  { symbol: "PEPE2", name: "Pepe 2", exchange: "UNKNOWN", symbolPair: "PEPE2USDT", coingeckoId: "pepe-2-0" },
];

export const COIN_SOURCE_MAP = MEME_COIN_DATA.reduce((map, entry) => {
  map[entry.symbol] = entry;
  return map;
}, {});

export const BINANCE_COIN_STREAMS = MEME_COIN_DATA.filter(
  (coin) => coin.exchange === "BINANCE"
).map((coin) => coin.stream);

export const getBinanceStreamUrl = () => {
  const streams = BINANCE_COIN_STREAMS.join("/");
  return streams ? `wss://stream.binance.com:9443/stream?streams=${streams}` : null;
};
