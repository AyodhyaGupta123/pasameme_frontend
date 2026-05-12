// src/config/config.js

const withApiBase = (url) => {
  const normalized = (url || "").replace(/\/+$/, "");

  if (!normalized) return "";

  return normalized.endsWith("/api")
    ? normalized
    : `${normalized}/api`;
};

const config = {
  API_BASE_URL: withApiBase(
    import.meta.env.VITE_API_URL ||
      "https://pasameme-backend.onrender.com"
  ),

  WS_BINANCE_URL:
    import.meta.env.VITE_WS_BINANCE_URL ||
    "wss://stream.binance.com:9443/ws/btcusdt@trade",

  ENV:
    import.meta.env.VITE_ENV || "production",
};

export default config;