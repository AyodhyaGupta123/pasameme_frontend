import React, { useMemo } from "react";

const ChartHeader = ({ currentPrice, selectedCoin, ticker = {} }) => {
  const coinSymbol = selectedCoin?.symbol || "BTC";

  const price = useMemo(() => {
    const value = Number(String(currentPrice ?? "").replace(/,/g, ""));
    return Number.isFinite(value) ? value : null;
  }, [currentPrice]);

  const change24h = Number(ticker?.change24h ?? ticker?.priceChangePercent ?? 0);
  const high24h = Number(ticker?.high24h ?? ticker?.highPrice ?? 0);
  const low24h = Number(ticker?.low24h ?? ticker?.lowPrice ?? 0);
  const volume24h = Number(ticker?.volume ?? ticker?.volume24h ?? 0);

  const isPositive = change24h >= 0;

  const formatPrice = (value) => {
    if (value === null || value === undefined || !Number.isFinite(Number(value))) {
      return "--";
    }

    const num = Number(value);

    return num.toLocaleString("en-US", {
      minimumFractionDigits: num < 1 ? 6 : 2,
      maximumFractionDigits: num < 1 ? 8 : 2,
    });
  };

  const formatVolume = (value) => {
    if (!value || !Number.isFinite(value)) return "--";

    if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(2)}B`;
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M`;
    if (value >= 1_000) return `${(value / 1_000).toFixed(2)}K`;

    return value.toFixed(2);
  };

  return (
    <div className="min-h-[68px] bg-[#0B0E11] border-b border-[#262930] px-3 sm:px-4 py-2 flex flex-col xl:flex-row items-start xl:items-center justify-between gap-3 shrink-0 w-full">
      <div className="flex items-center gap-4 sm:gap-6 flex-wrap">
        <div>
          <h1 className="text-base sm:text-lg font-black flex items-center gap-2 whitespace-nowrap text-white">
            {coinSymbol}/USDT
            <span className="text-[9px] text-[#FCD535] px-1.5 py-0.5 rounded bg-[#FCD535]/10 border border-[#FCD535]/20">
              PERP
            </span>
          </h1>

          <p className="text-[10px] text-slate-500 font-mono">
            Perpetual Contract
          </p>
        </div>

        <div>
          <div
            className={`text-xl sm:text-2xl font-mono font-black ${
              isPositive ? "text-[#0ECB81]" : "text-[#F6465D]"
            }`}
          >
            {formatPrice(price)}
          </div>

          <div className="text-[10px] text-slate-500 font-mono">
            ≈ ${formatPrice(price)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-5 gap-y-2 font-mono text-[10px] sm:text-xs w-full xl:w-auto">
        <div>
          <p className="uppercase text-slate-500 text-[9px] sm:text-[10px]">
            24h Change
          </p>
          <p
            className={`font-bold ${
              isPositive ? "text-[#0ECB81]" : "text-[#F6465D]"
            }`}
          >
            {isPositive ? "+" : ""}
            {change24h.toFixed(2)}%
          </p>
        </div>

        <div>
          <p className="uppercase text-slate-500 text-[9px] sm:text-[10px]">
            24h High
          </p>
          <p className="text-white font-bold">{formatPrice(high24h)}</p>
        </div>

        <div>
          <p className="uppercase text-slate-500 text-[9px] sm:text-[10px]">
            24h Low
          </p>
          <p className="text-white font-bold">{formatPrice(low24h)}</p>
        </div>

        <div>
          <p className="uppercase text-slate-500 text-[9px] sm:text-[10px]">
            24h Volume
          </p>
          <p className="text-white font-bold">{formatVolume(volume24h)}</p>
        </div>
      </div>
    </div>
  );
};

export default ChartHeader;