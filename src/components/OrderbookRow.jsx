import React from "react";

const OrderbookRow = ({ price = 0, size = 0, total = 0, type = "bid" }) => {
  const depth = Math.min((Number(total) / 10) * 100, 100);
  const isAsk = type === "ask";

  const formatPrice = (value) => {
    const num = Number(value);
    if (!Number.isFinite(num)) return "--";

    return num.toLocaleString("en-US", {
      minimumFractionDigits: num < 1 ? 4 : 2,
      maximumFractionDigits: num < 1 ? 6 : 2,
    });
  };

  return (
    <div className="relative grid grid-cols-3 items-center px-3 py-[3px] text-[11px] sm:text-xs font-mono hover:bg-white/[0.04] overflow-hidden">
      <div
        className={`absolute inset-y-0 right-0 ${
          isAsk ? "bg-[#F6465D]/18" : "bg-[#0ECB81]/18"
        }`}
        style={{ width: `${depth}%` }}
      />

      <span
        className={`relative z-10 font-bold truncate ${
          isAsk ? "text-[#F6465D]" : "text-[#0ECB81]"
        }`}
      >
        {formatPrice(price)}
      </span>

      <span className="relative z-10 text-right text-white truncate">
        {Number(size).toFixed(4)}
      </span>

      <span className="relative z-10 text-right text-slate-500 truncate">
        {Number(total).toFixed(2)}
      </span>
    </div>
  );
};

export default OrderbookRow;